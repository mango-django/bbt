"""Shared helpers for the vendor product import pipeline."""
import json
import re
import unicodedata
from pathlib import Path

FILES = Path(__file__).resolve().parents[2] / "Files"
STAGING = FILES / "staging"
STAGING.mkdir(exist_ok=True)

MARKUP = 1.4

CATEGORY_IDS = {
    "Bathroom": "f692962a-be72-403f-b6f0-d1dcebe3c56c",
    "Commercial": "ffd565e5-b9ef-45fa-b1ea-93e137470ad0",
    "Floor": "3c164f28-876d-4114-aa7a-edbd98c46d27",
    "Kitchen": "a188214b-e936-4aa5-b965-9577791ada85",
    "Lounge": "48994c47-26ca-43b3-8d77-e7086f52fc90",
    "Mosaic": "b6d58da0-a88a-46f4-8f99-34a37c8e95e5",
    "Outdoor": "024433d3-3fd4-4954-9b19-6f8fd82e22df",
    "Quartz": "2e601cf7-7f32-4a97-8f35-899d64537911",
    "Special Finish": "2a0dadf3-6eb0-41af-8194-0b3bdf4851a1",
    "Wall": "d30e9241-928b-4e7d-9581-5c3d0b2e2262",
    "Wood": "39b48748-ef78-4177-8d9b-64cb5dfb8530",
}

SIZE_TOKEN = re.compile(r"^\d+(\.\d+)?\s*[xX]\s*\d+(\.\d+)?([xX]\d+(\.\d+)?\s*(cm|mm)?)?(cm|mm)?$")

LOWER_WORDS = {"and", "of", "the"}


def clean_text(s):
    if s is None:
        return ""
    s = unicodedata.normalize("NFKC", str(s))
    return re.sub(r"\s+", " ", s).strip()


def title_case(s):
    words = []
    for w in clean_text(s).split(" "):
        lw = w.lower()
        words.append(lw if lw in LOWER_WORDS else lw[:1].upper() + lw[1:])
    return " ".join(words)


def strip_size_tokens(name):
    """Remove size tokens like 60x120, 7.5 X 15, 60x90x2cm anywhere in a name."""
    # first join separated "7.5 X 15" style triples so token match works
    name = re.sub(r"(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)(\s*[xX]\s*\d+(?:\.\d+)?)?\s*(cm|mm)?", " ", name)
    return re.sub(r"\s+", " ", name).strip(" -")


def slugify(title, dimension_string):
    s = f"{title} {dimension_string}".lower().strip()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    return re.sub(r"\s+", "-", s)


def parse_num(v):
    if v in (None, ""):
        return None
    s = clean_text(v).replace("£", "").replace(",", ".")
    s = re.sub(r"[^0-9.]", "", s)
    if not s or s == ".":
        return None
    try:
        return float(s)
    except ValueError:
        return None


def r2(v):
    return None if v is None else round(v, 2)


def retail(cost):
    """Vendor trade price -> site price (40% markup)."""
    return None if cost is None else round(cost * MARKUP, 2)


FINISH_STRIP = re.compile(r"\b(matt|matte|gloss|glossy|polished|unpolished|lappato|satin|honed|tumbled)\b")


def norm_key(title):
    """Duplicate-match key: lowercase alnum, sizes/generic words stripped. Keeps finish words."""
    t = strip_size_tokens(clean_text(title).lower())
    t = re.sub(r"[^a-z0-9 ]", " ", t)
    t = re.sub(r"\b(full|semi|tile|tiles|wall|floor)\b", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def loose_key(title):
    """norm_key with finish words also stripped — for ambiguous-variant detection."""
    return re.sub(r"\s+", " ", FINISH_STRIP.sub(" ", norm_key(title))).strip()


def has_finish_word(title):
    return bool(FINISH_STRIP.search(title.lower()))


def tile_description(title, brand, material, finish, color, w, h, application, extra=""):
    mat = (material or "porcelain").lower()
    fin = f" with a {', '.join(f.lower() for f in finish)} finish" if finish else ""
    app = " and ".join(a.lower() for a in application) if application else "wall and floor"
    size = f"{int(w)}x{int(h)}mm" if w and h else ""
    col = f" in {', '.join(color)}" if color else ""
    parts = [
        f"{title} is a {size} {mat} tile{col} from {brand}{fin}.",
        f"Suitable for {app} applications." if app else "",
        extra,
    ]
    return " ".join(p for p in parts if p).strip()


def write_jsonl(path, records):
    with open(path, "w") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"  wrote {len(records):4d} -> {path.name}")


def read_jsonl(path):
    with open(path) as f:
        return [json.loads(line) for line in f if line.strip()]
