"""Stage Trimline (Pyro + Echo) tiles: price-list sizes x scraped colourways.

Needs: scratchpad/pyro_colourways.json produced by the scraping agent:
  [{"range","collection","colour","finish","image_url","product_url","notes"}, ...]
Writes: Files/staging/trimline_tiles.jsonl (picked up by dedupe_insert.py)
        Files/staging/trimline_image_hints.json  (slug -> image_url for the upload phase)
"""
import json
import re
import sys
from common import FILES, STAGING, clean_text, parse_num, slugify, write_jsonl
from parse_all import sheet_rows, tile_record

SP = "/private/tmp/claude-501/-Users-gjhome-Developer-bellos/1fd7d52c-08b5-49e5-ac47-2183c81fb064/scratchpad"

SOFT_COLOURS = {"white", "cream", "ivory", "bone", "chalk", "pearl", "blush", "sky",
                "mint", "sage", "stone", "sand", "beige"}

# collections that are part of the site-facing product name (matches existing live naming,
# e.g. "Barton Bay Stone Grey", "River City Cement Light Grey Matt")
NAME_COLLECTIONS = {"Stone", "Cement", "Concrete", "Terrazzo", "Marble", "Travertine"}


def build():
    cw = json.load(open(f"{SP}/pyro_colourways.json"))
    by_range = {}
    for c in cw:
        key = c["range"].lower().replace("  ", " ").strip()
        blob = (c.get("variant_slug", "") + " " + c.get("notes", "")).lower()
        if "2cm" in blob and "2cm" not in key:
            key += " 2cm"
        by_range.setdefault(key, []).append(c)

    rows = sheet_rows(FILES / "TRIMLINE 2026/Wholesale Price list May 26 rev 1 .xlsx", "Sheet1")
    out, hints, missing = [], {}, []
    for r in rows[3:]:
        if len(r) < 6 or not r[0] or not parse_num(r[2]):
            continue  # header/blank rows carry the web link, no size
        rng = clean_text(r[0]).replace("  ", " ")
        collection = clean_text(r[1])
        L, W = parse_num(r[2]), parse_num(r[3])
        cost = parse_num(r[4])
        material = r[5] or "Porcelain"
        info, app_col = r[6], clean_text(r[7])
        pieces = parse_num(r[8])
        tiles_m2 = parse_num(r[9])
        if not cost:
            continue
        # application / slip rating live mixed in one column
        slip = None
        if re.match(r"(PTV|R\d)", app_col):
            slip, app = app_col, ["Wall", "Floor"]
        elif "wall and floor" in app_col.lower():
            app = ["Wall", "Floor"]
        elif "wall" in app_col.lower():
            app = ["Wall"]
        else:
            app = ["Wall", "Floor"]
        is_2cm = "2cm" in rng.lower()
        base_range = re.sub(r"\s*2cm$", "", rng, flags=re.I)
        key = rng.lower() if is_2cm else base_range.lower()
        colours = by_range.get(key) or by_range.get((base_range + " " + collection).lower())
        if not colours:
            missing.append((rng, collection))
            continue
        thick = 20 if is_2cm else None
        for c in colours:
            colour_raw = clean_text(c.get("colour") or "")
            colours_list = [x.strip() for x in colour_raw.split("/") if x.strip()]
            finish_raw = clean_text(c.get("finish") or "") or ("Matt" if material.lower() == "porcelain" else "")
            finishes = []
            for x in finish_raw.split("/"):
                x = x.strip()
                if x and x not in finishes:
                    finishes.append(x)
            # finish-variant rows in the price list (e.g. Project White Gloss/Bumpy/Matt,
            # Carnival soft/strong) — match the sheet row's info text against the colourway finish
            if rng.startswith("Project") and finishes and info:
                if finishes[0].lower() not in info.lower():
                    continue
            if rng == "Carnival" and info:
                soft = (colours_list and colours_list[0].split()[0].lower() in SOFT_COLOURS)
                if soft != ("soft" in info.lower()):
                    continue
            # colour sometimes arrives with the finish baked in ("White Gloss") — strip it
            if colours_list:
                cleaned = re.sub(r"\b(matt|gloss|bumpy|polished|bevel)\b", "", colours_list[0], flags=re.I).strip()
                colours_list[0] = cleaned or colours_list[0]
            name_bits = [base_range]
            # live site naming includes the collection word ("Barton Bay Stone Grey",
            # "River City Cement White Matt") except when the range name already carries a
            # material word or the live convention omits it (Qubus Park)
            if (collection in NAME_COLLECTIONS
                    and base_range != "Qubus Park"
                    and not any(w.lower() in base_range.lower() for w in NAME_COLLECTIONS)
                    and collection.lower() not in base_range.lower()):
                name_bits.append(collection)
            # single-colour designs get the colour in the name; multi-colour designs
            # (e.g. Calacatta "White / Grey") are the design itself, so skip it
            if len(colours_list) == 1 and colours_list[0].lower() not in " ".join(name_bits).lower():
                name_bits.append(colours_list[0])
            # name the primary finish (matches existing site naming); Carnival's 6-finish
            # list stays out of the name
            if finishes and len(finishes) <= 3 and finishes[0].lower() not in " ".join(name_bits).lower():
                name_bits.append(finishes[0])
            if is_2cm:
                name_bits.append("20mm")
            title = " ".join(name_bits)
            colour, finish = (colours_list[0] if colours_list else ""), (finishes[0] if finishes else "")
            cats = (["Outdoor"] if is_2cm
                    else ["Wall"] if app == ["Wall"]
                    else ["Floor"])
            box_cov = round(pieces / tiles_m2, 3) if pieces and tiles_m2 else None
            rec = tile_record(
                "TRIMLINE", "Pyro + Echo", None, base_range, title,
                int(W) if W else None, int(L) if L else None, thick,
                material, finishes, colours_list,
                app, [], "Outdoor" if is_2cm else "Indoor", cats, cost,
                pieces, box_cov, None, None,
                notes=f"collection={collection}; info={info}; slip={slip or ''}; {c.get('notes','')}",
            )
            if slip:
                rec["slip_rating"] = slip
            out.append(rec)
            if c.get("image_url"):
                hints[slugify(title, rec["dimension_string"])] = c["image_url"]

    # de-dup identical title+dim (e.g. same colourway listed twice)
    seen, unique = set(), []
    for rec in out:
        k = slugify(rec["title"], rec["dimension_string"])
        if k in seen:
            continue
        seen.add(k)
        unique.append(rec)

    write_jsonl(STAGING / "trimline_tiles.jsonl", unique)
    json.dump(hints, open(STAGING / "trimline_image_hints.json", "w"), indent=1)
    print(f"image hints: {len(hints)} | price-list ranges with no colourway data: {missing}")


if __name__ == "__main__":
    build()
