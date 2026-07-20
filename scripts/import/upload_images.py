"""Upload product images to Supabase storage and link them in the DB.

Modes:
  python3 upload_images.py --local      # match local vendor image folders to products
  python3 upload_images.py --manifest F # upload from a manifest JSONL:
                                        #   {"product_id","kind":"tile|install","source":path-or-URL,"sort_order":0}
"""
import json
import mimetypes
import re
import sys
import time
import urllib.request
from pathlib import Path
from common import FILES, STAGING, read_jsonl, loose_key
from dedupe_insert import SUPABASE_URL, KEY, rest, fetch_all

BUCKETS = {"tile": "product-images", "install": "installation-products"}


def storage_upload(bucket, path, data, content_type):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}", method="POST", data=data)
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Content-Type", content_type)
    req.add_header("x-upsert", "true")
    with urllib.request.urlopen(req) as resp:
        resp.read()
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}"


def fetch_bytes(source):
    if re.match(r"^https?://", str(source)):
        req = urllib.request.Request(source, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
            ct = resp.headers.get("Content-Type", "").split(";")[0]
        name = source.split("/")[-1].split("?")[0] or "image.jpg"
        return data, (ct or mimetypes.guess_type(name)[0] or "image/jpeg"), name
    p = Path(source)
    return p.read_bytes(), (mimetypes.guess_type(p.name)[0] or "image/jpeg"), p.name


def attach(product_id, kind, source, sort_order=0):
    data, ctype, name = fetch_bytes(source)
    safe = re.sub(r"[^a-zA-Z0-9._-]", "-", name)
    path = f"{product_id}/{int(time.time() * 1000)}-{safe}"
    url = storage_upload(BUCKETS[kind], path, data, ctype)
    if kind == "tile":
        rest("POST", "product_images", {"product_id": product_id, "image_url": url,
                                        "sort_order": sort_order})
    else:
        rest("POST", "installation_product_images",
             {"product_id": product_id, "url": url, "file_path": path})
    return url


def products_without_images():
    prods = fetch_all("products", "id,title,slug,supplier_id,product_images(id)")
    return {p["id"]: p for p in prods if not p["product_images"]}


def install_without_images():
    prods = fetch_all("installation_products", "id,name,slug,supplier_id,installation_product_images(id),images")
    return {p["id"]: p for p in prods
            if not p["installation_product_images"] and not (p.get("images") or [])}


def norm_filename(name):
    s = Path(name).stem
    s = re.sub(r"\(\d+\)$", "", s.strip())
    s = re.sub(r"\b[Tt][Ss]?\d{3,5}\b", " ", s)          # T2411 / TS4191 product codes
    s = re.sub(r"\bPyro[- ]?Echo\b", " ", s, flags=re.I)
    s = s.replace("-", " ").replace("_", " ")
    return loose_key(s)


def run_local():
    done, log = 0, []

    # 1. Trimline accessories: SKU-matched local images recorded at parse time
    inst_map = json.loads((STAGING / "inserted_ids.json").read_text())
    needs_inst = install_without_images()
    for r in read_jsonl(STAGING / "trimline_installation.jsonl"):
        pid = inst_map.get("inst:" + str(r["supplier_code"]))
        if not pid or pid not in needs_inst or not r.get("local_image"):
            continue
        url = attach(pid, "install", r["local_image"])
        log.append(("install", r["name"], Path(r["local_image"]).name))
        done += 1

    # 2. Trimline tile photos (name-based) -> any live product without an image
    needs = products_without_images()
    by_loose = {}
    for pid, p in needs.items():
        by_loose.setdefault(loose_key(p["title"]), []).append(pid)
    img_dir = FILES / "TRIMLINE 2026/Product Images"
    unmatched = []
    for f in sorted(img_dir.iterdir()):
        if f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        key = norm_filename(f.name)
        pids = by_loose.get(key, [])
        if not pids:
            unmatched.append(f.name)
            continue
        for pid in pids:
            if pid in needs:
                attach(pid, "tile", f)
                log.append(("tile", needs[pid]["title"], f.name))
                del needs[pid]
                done += 1

    print(f"attached {done} images")
    for kind, title, fname in log:
        print(f"  {kind:7s} {title}  <-  {fname}")
    print(f"\nunmatched tile-image files ({len(unmatched)}):")
    for n in unmatched:
        print("   ", n)


def run_manifest(path):
    ok, fail = 0, []
    for m in read_jsonl(Path(path)):
        try:
            attach(m["product_id"], m.get("kind", "tile"), m["source"], m.get("sort_order", 0))
            ok += 1
        except Exception as e:
            fail.append((m.get("product_id"), m["source"], str(e)[:120]))
    print(f"manifest: {ok} attached, {len(fail)} failed")
    for f in fail[:20]:
        print("  FAIL", f)


if __name__ == "__main__":
    if "--local" in sys.argv:
        run_local()
    elif "--manifest" in sys.argv:
        run_manifest(sys.argv[sys.argv.index("--manifest") + 1])
    else:
        print(__doc__)
