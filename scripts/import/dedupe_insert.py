"""Dedupe staged products against the live site, then insert new ones as drafts.

Usage:
  python3 dedupe_insert.py            # dry run: prints dedupe report only
  python3 dedupe_insert.py --insert   # actually insert new drafts
"""
import json
import sys
import urllib.request
from pathlib import Path
from common import (STAGING, CATEGORY_IDS, read_jsonl, slugify, norm_key, loose_key,
                    has_finish_word)

ROOT = Path(__file__).resolve().parents[2]
ENV = {}
for line in (ROOT / ".env.local").read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, _, v = line.partition("=")
        ENV[k.strip()] = v.strip()
SUPABASE_URL = ENV["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
KEY = ENV["SUPABASE_SERVICE_ROLE_KEY"]


def rest(method, path, body=None, prefer=None):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/{path}", method=method,
        data=json.dumps(body).encode() if body is not None else None)
    req.add_header("apikey", KEY)
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Content-Type", "application/json")
    if prefer:
        req.add_header("Prefer", prefer)
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
        return json.loads(data) if data else None


def fetch_all(table, select):
    out, offset = [], 0
    while True:
        page = rest("GET", f"{table}?select={select}&limit=1000&offset={offset}")
        out.extend(page)
        if len(page) < 1000:
            return out
        offset += 1000


def load_staged_tiles():
    recs = []
    for f in sorted(STAGING.glob("*_tiles.jsonl")):
        recs.extend(read_jsonl(f))
    return recs


def load_staged_install():
    recs = []
    for f in sorted(STAGING.glob("*_installation.jsonl")):
        recs.extend(read_jsonl(f))
    return recs


def tile_row(r):
    slug = slugify(r["title"], r["dimension_string"])
    return {
        "title": r["title"], "slug": slug, "description": r["description"],
        "brand": r["brand"], "supplier_id": r["supplier_code"], "status": "draft",
        "category_ids": [CATEGORY_IDS[c] for c in r["categories"] if c in CATEGORY_IDS],
        "material": r["material"], "finish": r["finish"], "color": r["color"],
        "application": r["application"], "suitable_room": r["suitable_room"],
        "indoor_outdoor": r["indoor_outdoor"], "dimension_string": r["dimension_string"],
        "tile_width_mm": r["tile_width_mm"], "tile_height_mm": r["tile_height_mm"],
        "tile_thickness_mm": r["tile_thickness_mm"],
        "price_per_m2": r["price_per_m2"], "price_per_tile": r["price_per_tile"],
        "price_per_box": r["price_per_box"], "tiles_per_box": r["tiles_per_box"],
        "box_coverage_m2": r["box_coverage_m2"], "box_weight_kg": r["box_weight_kg"],
        "boxes_per_pallet": r["boxes_per_pallet"], "boxes_in_stock": 0,
        "lead_time_days": "3-5",
        "meta_title": f"{r['title']} {r['dimension_string']} | Bellos Tiles".replace("  ", " "),
        "meta_description": (r["description"] or "")[:155],
    }


def install_row(r):
    return {
        "name": r["name"], "slug": slugify(r["name"], ""), "description": r["description"],
        "price": r["price"], "product_type": r["product_type"],
        "installation_category": r["installation_category"], "unit_type": r["unit_type"],
        "unit_amount": r["unit_amount"], "colour": r["colour"], "stock_qty": 0,
        "status": "draft", "supplier_id": r["supplier_code"],
    }


def main():
    do_insert = "--insert" in sys.argv

    existing = fetch_all("products", "id,title,slug,dimension_string,supplier_id,status")
    existing_inst = fetch_all("installation_products", "id,name,supplier_id")
    print(f"live: {len(existing)} products, {len(existing_inst)} installation products")

    by_supplier = {p["supplier_id"]: p for p in existing if p.get("supplier_id")}
    by_slug = {p["slug"]: p for p in existing if p.get("slug")}
    by_normdim, by_loosedim, by_norm = {}, {}, {}
    for p in existing:
        nk, lk = norm_key(p["title"] or ""), loose_key(p["title"] or "")
        dimk = p.get("dimension_string") or ""
        by_norm.setdefault(nk, []).append(p)
        by_normdim[(nk, dimk)] = p
        by_loosedim.setdefault((lk, dimk), []).append(p)

    tiles = load_staged_tiles()
    new, dup, fuzzy, ambiguous = [], [], [], []
    for r in tiles:
        slug = slugify(r["title"], r["dimension_string"])
        nk, lk = norm_key(r["title"]), loose_key(r["title"])
        dimk = r["dimension_string"]
        hit = (by_supplier.get(r["supplier_code"]) or by_slug.get(slug)
               or by_normdim.get((nk, dimk)))
        if hit:
            dup.append((r, hit))
            continue
        loose_hits = by_loosedim.get((lk, dimk), [])
        # same base name + size exists live, but finish is unclear on one side ->
        # can't tell if it's the same product; skip and flag for manual review
        if loose_hits and (not has_finish_word(r["title"])
                           or any(not has_finish_word(p["title"] or "") for p in loose_hits)):
            ambiguous.append((r, loose_hits[0]))
            continue
        if nk in by_norm:  # same name family exists at another size -> import but note
            fuzzy.append((r, by_norm[nk][0]))
        new.append(r)

    # cross-vendor dedupe within the staged set (e.g. RAK + ESL both list Baltico):
    # keep the cheapest source for identical title+size
    best = {}
    for r in new:
        k = slugify(r["title"], r["dimension_string"])
        cur = best.get(k)
        if cur is None or (r.get("cost_per_m2") or 9e9) < (cur.get("cost_per_m2") or 9e9):
            best[k] = r
    cross_dropped = [r for r in new if best[slugify(r["title"], r["dimension_string"])] is not r]
    new = list(best.values())

    inst = load_staged_install()
    inst_by_norm = {norm_key(p["name"]): p for p in existing_inst}
    inst_new, inst_dup = [], []
    for r in inst:
        if norm_key(r["name"]) in inst_by_norm:
            inst_dup.append(r)
        else:
            inst_new.append(r)

    print(f"\nTILES: staged {len(tiles)} -> new {len(new)}, duplicates {len(dup)}, "
          f"ambiguous-finish {len(ambiguous)}, cross-vendor dropped {len(cross_dropped)}, "
          f"name-matches-other-size {len(fuzzy)}")
    for r, hit in dup[:15]:
        print(f"  DUP {r['vendor']:7s} {r['title']} [{r['dimension_string']}] ~ live '{hit['title']}' [{hit.get('dimension_string')}] ({hit['status']})")
    if len(dup) > 15:
        print(f"  ... and {len(dup) - 15} more")
    for r, hit in ambiguous[:15]:
        print(f"  AMBIG {r['vendor']:7s} {r['title']} [{r['dimension_string']}] ~ live '{hit['title']}'")
    for r in cross_dropped[:15]:
        print(f"  XVEND dropped {r['vendor']:7s} {r['title']} [{r['dimension_string']}] (kept cheaper vendor)")
    print(f"\nINSTALLATION: staged {len(inst)} -> new {len(inst_new)}, duplicates {len(inst_dup)}")
    for r in inst_dup[:10]:
        print(f"  DUP {r['name']}")

    report = {
        "duplicates": [{"vendor": r["vendor"], "title": r["title"], "dim": r["dimension_string"],
                        "matched_live": hit["title"], "live_id": hit["id"]} for r, hit in dup],
        "fuzzy_same_name_other_size": [{"vendor": r["vendor"], "title": r["title"],
                                        "dim": r["dimension_string"], "live": hit["title"]}
                                       for r, hit in fuzzy],
        "ambiguous_finish_skipped": [{"vendor": r["vendor"], "title": r["title"],
                                      "dim": r["dimension_string"], "live": hit["title"],
                                      "live_id": hit["id"]} for r, hit in ambiguous],
        "cross_vendor_dropped": [{"vendor": r["vendor"], "title": r["title"],
                                  "dim": r["dimension_string"], "cost": r.get("cost_per_m2")}
                                 for r in cross_dropped],
        "installation_duplicates": [r["name"] for r in inst_dup],
    }
    (STAGING / "dedupe_report.json").write_text(json.dumps(report, indent=2))
    print(f"\nreport -> staging/dedupe_report.json")

    if not do_insert:
        print("\nDRY RUN — rerun with --insert to write drafts")
        return

    id_map = {}
    BATCH = 100
    for i in range(0, len(new), BATCH):
        batch = [tile_row(r) for r in new[i:i + BATCH]]
        res = rest("POST", "products?select=id,slug,supplier_id", batch,
                   prefer="return=representation")
        for row in res:
            id_map[row["supplier_id"] or row["slug"]] = row["id"]
        print(f"  inserted tiles {i + len(batch)}/{len(new)}")
    for i in range(0, len(inst_new), BATCH):
        batch = [install_row(r) for r in inst_new[i:i + BATCH]]
        res = rest("POST", "installation_products?select=id,slug,supplier_id", batch,
                   prefer="return=representation")
        for row in res:
            id_map["inst:" + (row["supplier_id"] or row["slug"])] = row["id"]
        print(f"  inserted installation {i + len(batch)}/{len(inst_new)}")
    (STAGING / "inserted_ids.json").write_text(json.dumps(id_map, indent=2))
    print(f"\ninserted {len(id_map)} rows as drafts; id map -> staging/inserted_ids.json")


if __name__ == "__main__":
    main()
