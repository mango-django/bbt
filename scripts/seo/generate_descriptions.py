#!/usr/bin/env python3
"""Generate personalised product descriptions for tile products.

Replaces the shared generic paragraph / imported one-liners with copy built
from each product's real attributes (material, finish, colour, size,
application, rooms, brand). Output is deterministic per product id, so
re-runs are stable and no two products read identically.

Usage:
  python3 scripts/seo/generate_descriptions.py            # dry run, prints samples
  python3 scripts/seo/generate_descriptions.py --update   # backup + write to DB

Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
Backs up previous descriptions to Files/staging/description_backup_<ts>.jsonl.
"""

import argparse
import concurrent.futures
import hashlib
import json
import os
import random
import re
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ----------------------------------------------------------------------
# Env / Supabase helpers
# ----------------------------------------------------------------------

def load_env():
    path = os.path.join(ROOT, ".env.local")
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k, v.strip().strip('"'))

load_env()
SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}


def rest(path, method="GET", body=None, extra_headers=None):
    headers = dict(HEADERS)
    if extra_headers:
        headers.update(extra_headers)
    req = urllib.request.Request(
        SUPABASE_URL + path,
        method=method,
        headers=headers,
        data=json.dumps(body).encode() if body is not None else None,
    )
    with urllib.request.urlopen(req) as resp:
        raw = resp.read()
        return json.loads(raw) if raw else None


def fetch_all_products():
    rows, offset = [], 0
    cols = (
        "id,title,slug,status,description,brand,material,finish,color,"
        "application,suitable_room,indoor_outdoor,dimension_string,"
        "tile_width_mm,tile_height_mm,tile_thickness_mm,box_coverage_m2,tiles_per_box"
    )
    while True:
        batch = rest(f"/rest/v1/products?select={cols}&order=id&limit=1000&offset={offset}")
        rows += batch
        if len(batch) < 1000:
            break
        offset += 1000
    return rows


# ----------------------------------------------------------------------
# Which descriptions are replaceable boilerplate?
# ----------------------------------------------------------------------

GENERIC_START = "Porcelain is a highly desirable material"
IMPORT_ONELINER = re.compile(r"^.{0,120} is a \d+\s*x\s*\d+\s*mm .{0,80} tile (in|from) ", re.I)


def is_boilerplate(desc, dup_counts):
    if not desc or not desc.strip():
        return True
    d = desc.strip()
    if d.startswith(GENERIC_START):
        return True
    if IMPORT_ONELINER.match(d):
        return True
    # verbatim vendor blurb shared across 3+ products is duplicate content
    if dup_counts.get(d, 0) >= 3:
        return True
    return False


# ----------------------------------------------------------------------
# Copy generation
# ----------------------------------------------------------------------

COLOR_MOOD = {
    "white": "bright, airy",
    "cream": "soft, welcoming",
    "ivory": "soft, welcoming",
    "beige": "warm, natural",
    "sand": "warm, sun-washed",
    "bone": "gentle, understated",
    "grey": "cool, contemporary",
    "dark grey": "moody, architectural",
    "anthracite": "deep, dramatic",
    "black": "bold, striking",
    "brown": "earthy, grounding",
    "walnut": "rich, timeless",
    "oak": "natural, honeyed",
    "blue": "calm, coastal",
    "navy": "deep, refined",
    "green": "fresh, botanical",
    "sage": "soft, restful",
    "pink": "playful, warm",
    "terracotta": "sun-baked, rustic",
    "red": "vivid, characterful",
    "yellow": "cheerful, light-filled",
    "gold": "opulent, glamorous",
    "silver": "sleek, luminous",
    "multi": "vibrant, eclectic",
    "multicolour": "vibrant, eclectic",
}

MATERIAL_FACTS = {
    "porcelain": [
        "Fired at high temperature, porcelain is dense, hard-wearing and highly resistant to moisture, stains and scratches",
        "Porcelain's low porosity makes it exceptionally durable and easy to keep clean",
        "As a fully vitrified porcelain, it shrugs off daily wear, spills and splashes",
    ],
    "ceramic": [
        "Ceramic is light to work with, easy to cut and simple to keep clean",
        "A classic ceramic body keeps installation straightforward and maintenance minimal",
        "Ceramic offers dependable everyday performance with effortless upkeep",
    ],
    "natural stone": [
        "Being natural stone, every piece carries its own veining and tonal variation, so no two installations are ever quite the same",
        "Genuine stone brings one-of-a-kind character — each tile is subtly different from the next",
    ],
    "quartz": [
        "Quartz brings a subtle sparkle and an extremely hard, scratch-resistant surface",
        "The quartz composition delivers outstanding hardness with a discreet crystalline shimmer",
    ],
    "marble": [
        "Authentic marble veining gives every tile individual character",
        "Classic marble detailing lends a sense of quiet luxury",
    ],
}

FINISH_NOTES = {
    "matt": [
        "The matt finish diffuses light softly and offers dependable underfoot grip",
        "A velvety matt surface keeps the look understated while providing practical slip resistance",
        "Its matt surface hides water marks and fingerprints far better than a gloss",
    ],
    "gloss": [
        "The gloss finish bounces light around the room, making smaller spaces feel noticeably bigger and brighter",
        "A high-shine glazed surface reflects light beautifully and wipes clean in seconds",
    ],
    "polished": [
        "The polished surface delivers a mirror-smooth, light-reflecting sheen with a genuinely premium feel",
        "Polished to a fine lustre, it catches the light like honed stone",
    ],
    "satin": [
        "The satin finish sits between matt and gloss — a gentle sheen without glare",
        "A soft satin surface adds subtle light-play while staying easy to live with",
    ],
    "structured": [
        "The structured, textured surface adds tactile depth and extra grip — ideal where slip resistance matters",
        "A structured finish gives authentic texture underfoot and reliable traction",
    ],
    "anti-slip": [
        "The anti-slip finish is rated for wet areas and outdoor use, giving confidence underfoot in all weather",
        "Grip-rated and practical, the anti-slip surface is made for wet rooms, pool surrounds and patios",
    ],
    "lappato": [
        "The semi-polished lappato finish blends soft sheen with natural texture for a refined, contemporary look",
        "Lappato finishing gives a gently burnished surface — part gloss, part matt, entirely elegant",
    ],
}

OPENERS = [
    "{name} brings {mood} character to any scheme.",
    "Introduce {mood} style with {name}.",
    "{name} is a {mood} choice that lifts a room the moment it's laid.",
    "With its {mood} palette, {name} sets the tone effortlessly.",
    "For a look that feels {mood}, {name} is hard to beat.",
    "{name} delivers a {mood} look that works as beautifully in period homes as in new builds.",
]

SIZE_NOTES_LARGE = [
    "The generous {size}mm format means fewer grout lines and a clean, seamless expanse",
    "At {size}mm, this large-format tile creates an uninterrupted, architectural feel",
    "Its {size}mm proportions suit open-plan spaces, stretching sightlines and simplifying layouts",
]
SIZE_NOTES_SMALL = [
    "The compact {size}mm format is perfect for feature areas, splashbacks and detailed layouts",
    "At {size}mm, it lends itself to intricate patterns and characterful smaller spaces",
]
SIZE_NOTES_MID = [
    "The versatile {size}mm format suits rooms of every size and lays quickly with minimal cutting",
    "A practical {size}mm size that balances speed of installation with elegant proportions",
]
SIZE_NOTES_PLANK = [
    "The elongated {size}mm plank format lays like timber boards for a convincing wood-style floor",
    "Long {size}mm planks draw the eye down the room, adding a sense of length and flow",
]

APPLICATION_LINES = {
    ("floor", "wall"): [
        "Rated for both floors and walls, it can run continuously from surface to surface for a fully wrapped, cohesive design",
        "Approved for walls and floors alike, so you can carry one material through an entire room",
    ],
    ("floor",): [
        "Designed for floors, it stands up to busy hallways, kitchens and everything in between",
        "A dedicated floor tile built to handle daily foot traffic without losing its looks",
    ],
    ("wall",): [
        "A wall tile through and through — ideal for splashbacks, shower enclosures and feature walls",
        "Made for walls, it turns splashbacks, bathrooms and feature panels into focal points",
    ],
}

ROOM_LINE = [
    "It feels equally at home in {rooms}.",
    "Picture it in {rooms} — anywhere that deserves a considered finish.",
    "Particularly suited to {rooms}.",
]

OUTDOOR_LINES = [
    "Being frost-resistant and suitable for outdoor use, it also extends seamlessly onto patios and terraces for true inside-outside living.",
    "It's rated for exterior use too, so gardens, paths and terraces can share the same finish as the rooms they adjoin.",
]

THICK_LINES = [
    "At a substantial {t}mm thick, it's engineered for pedestal, gravel or direct-to-ground installation outdoors.",
    "The {t}mm thickness makes it a proper outdoor porcelain paver — stable, load-bearing and frost-proof.",
]

CLOSERS = [
    "Order online from Bellos Bespoke Tiles for delivery across the UK{brand_note}.",
    "Available now from Bellos Bespoke Tiles with UK-wide delivery{brand_note}.",
    "Delivered across the UK by Bellos Bespoke Tiles{brand_note} — try it in our 3D room visualiser before you buy.",
    "Bellos Bespoke Tiles delivers throughout the UK{brand_note}, and our team is on hand if you'd like help planning quantities.",
]


def pick(rng, options):
    return rng.choice(options)


def as_str(value):
    """Some columns hold either a string or a list of strings."""
    if isinstance(value, list):
        value = value[0] if value else ""
    return str(value or "").strip()


def clean_name(title, dimension):
    name = title.strip()
    # strip a trailing dimension echo like "... 600x600"
    name = re.sub(r"\s*\d+\s*[x×]\s*\d+\s*$", "", name).strip()
    return name or title.strip()


def mood_for(colors, rng):
    for c in colors:
        m = COLOR_MOOD.get(str(c).strip().lower())
        if m:
            return m
    return pick(rng, ["timeless, versatile", "refined, contemporary", "quietly confident"])


def generate(product):
    rng = random.Random(int(hashlib.md5(product["id"].encode()).hexdigest(), 16))

    title = as_str(product.get("title"))
    dimension = as_str(product.get("dimension_string"))
    name = clean_name(title, dimension)
    material = as_str(product.get("material"))
    finish = as_str(product.get("finish"))
    brand = as_str(product.get("brand"))
    colors = product.get("color") or []
    if isinstance(colors, str):
        colors = [colors]
    apps_raw = product.get("application") or []
    if isinstance(apps_raw, str):
        apps_raw = [apps_raw]
    apps = [str(a).strip().lower() for a in apps_raw]
    rooms_raw = product.get("suitable_room") or []
    if isinstance(rooms_raw, str):
        rooms_raw = [rooms_raw]
    rooms = [str(r).strip() for r in rooms_raw]
    indoor_outdoor = as_str(product.get("indoor_outdoor")).lower()
    w = product.get("tile_width_mm") or 0
    h = product.get("tile_height_mm") or 0
    thickness = product.get("tile_thickness_mm") or 0

    # ---------- paragraph 1: character ----------
    mood = mood_for(colors, rng)
    p1 = [pick(rng, OPENERS).format(name=name, mood=mood)]
    colour_str = " and ".join(str(c).lower() for c in colors[:2]) if colors else ""
    bits = []
    if colour_str:
        bits.append(f"its {colour_str} tones")
    if finish:
        bits.append(f"a {finish.lower()} finish")
    if material:
        bits.append(f"a quality {material.lower()} body")
    if len(bits) >= 2:
        joined = ", ".join(bits[:-1]) + " and " + bits[-1]
        p1.append(
            pick(rng, [
                f"Combining {joined}, it balances everyday practicality with genuine design presence.",
                f"With {joined}, it's as practical as it is handsome.",
                f"It pairs {joined} for a surface that looks considered from every angle.",
            ])
        )
    elif len(bits) == 1:
        p1.append(
            pick(rng, [
                f"With {bits[0]}, it balances everyday practicality with genuine design presence.",
                f"Thanks to {bits[0]}, it's as practical as it is handsome.",
            ])
        )

    # ---------- paragraph 2: practical ----------
    p2 = []
    mat_key = material.lower()
    for key, facts in MATERIAL_FACTS.items():
        if key in mat_key:
            p2.append(pick(rng, facts) + ".")
            break
    fin_key = finish.lower()
    for key, notes in FINISH_NOTES.items():
        if key in fin_key:
            p2.append(pick(rng, notes) + ".")
            break
    size_str = dimension if dimension else (f"{w}x{h}" if w and h else "")
    if w and h:
        long_side, short_side = max(w, h), min(w, h)
        if long_side >= 900 and long_side / max(short_side, 1) >= 3:
            p2.append(pick(rng, SIZE_NOTES_PLANK).format(size=size_str) + ".")
        elif long_side >= 800 or (w >= 600 and h >= 600):
            p2.append(pick(rng, SIZE_NOTES_LARGE).format(size=size_str) + ".")
        elif long_side <= 300:
            p2.append(pick(rng, SIZE_NOTES_SMALL).format(size=size_str) + ".")
        else:
            p2.append(pick(rng, SIZE_NOTES_MID).format(size=size_str) + ".")

    # ---------- paragraph 3: where to use it ----------
    p3 = []
    app_key = tuple(sorted({a for a in apps if a in ("floor", "wall")}))
    if app_key in APPLICATION_LINES:
        p3.append(pick(rng, APPLICATION_LINES[app_key]) + ".")
    if rooms:
        rl = [r.lower() for r in rooms[:3]]
        rooms_str = ", ".join(rl[:-1]) + (" and " + rl[-1] if len(rl) > 1 else rl[0])
        rooms_str = rooms_str.replace("lounge", "living rooms").replace("bathroom", "bathrooms").replace("kitchen", "kitchens").replace("hallway", "hallways")
        p3.append(pick(rng, ROOM_LINE).format(rooms=rooms_str))
    if thickness and float(thickness) >= 18:
        p3.append(pick(rng, THICK_LINES).format(t=int(float(thickness))))
    elif "outdoor" in indoor_outdoor or "both" in indoor_outdoor:
        p3.append(pick(rng, OUTDOOR_LINES))

    brand_note = f", straight from the {brand} range" if brand else ""
    p3.append(pick(rng, CLOSERS).format(brand_note=brand_note))

    paragraphs = [" ".join(p1), " ".join(p2), " ".join(p3)]
    return "\n\n".join(p for p in paragraphs if p.strip())


# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--update", action="store_true", help="write changes to Supabase (default: dry run)")
    ap.add_argument("--samples", type=int, default=5)
    args = ap.parse_args()

    products = fetch_all_products()
    dup_counts = {}
    for p in products:
        d = (p.get("description") or "").strip()
        if d:
            dup_counts[d] = dup_counts.get(d, 0) + 1

    targets = [p for p in products if is_boilerplate(p.get("description"), dup_counts)]
    kept = len(products) - len(targets)
    print(f"products: {len(products)} | to update: {len(targets)} | custom copy preserved: {kept}")

    updates = [(p, generate(p)) for p in targets]

    # sanity: ensure output variety
    uniq = len({d for _, d in updates})
    print(f"unique generated descriptions: {uniq}/{len(updates)}")

    print("\n---------- samples ----------")
    rng = random.Random(42)
    for p, desc in rng.sample(updates, min(args.samples, len(updates))):
        print(f"\n### [{p['status']}] {p['title']} ({p.get('dimension_string')}, {p.get('material')}, {p.get('finish')}, {p.get('color')})")
        print(desc)

    if not args.update:
        print("\nDry run — re-run with --update to write.")
        return

    # backup
    ts = time.strftime("%Y%m%d-%H%M%S")
    backup_dir = os.path.join(ROOT, "Files", "staging")
    os.makedirs(backup_dir, exist_ok=True)
    backup_path = os.path.join(backup_dir, f"description_backup_{ts}.jsonl")
    with open(backup_path, "w") as f:
        for p, _ in updates:
            f.write(json.dumps({"id": p["id"], "title": p["title"], "description": p.get("description")}) + "\n")
    print(f"\nbacked up {len(updates)} old descriptions -> {backup_path}")

    def patch(item):
        p, desc = item
        rest(
            f"/rest/v1/products?id=eq.{p['id']}",
            method="PATCH",
            body={"description": desc},
            extra_headers={"Prefer": "return=minimal"},
        )
        return p["id"]

    done = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        for _ in ex.map(patch, updates):
            done += 1
            if done % 200 == 0:
                print(f"  updated {done}/{len(updates)}")
    print(f"updated {done} products.")


if __name__ == "__main__":
    main()
