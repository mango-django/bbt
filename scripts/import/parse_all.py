"""Parse all vendor price lists into uniform staging JSONL files.

Outputs (in Files/staging/):
  rak_tiles.jsonl, esl_tiles.jsonl, verona_tiles.jsonl        -> products table shape
  esl_installation.jsonl, trimline_installation.jsonl,
  verona_installation.jsonl                                    -> installation_products shape
Trimline tiles are staged separately after colourway scraping (stage_trimline_tiles.py).
"""
import re
import openpyxl
from common import (FILES, STAGING, clean_text, title_case, strip_size_tokens, parse_num,
                    r2, retail, tile_description, write_jsonl)


def sheet_rows(path, sheet, max_col=30):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb[sheet]
    out = []
    for row in ws.iter_rows(min_col=1, max_col=max_col, values_only=True):
        out.append([clean_text(c) for c in row])
    return out


def parse_size_cm(s):
    """'60x120', '60x90x2cm', '6.5 X 15' (cm) -> (w_mm, h_mm, thickness_mm|None)"""
    m = re.search(r"(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)(?:\s*[xX]\s*(\d+(?:\.\d+)?))?", s or "")
    if not m:
        return None, None, None
    w = round(float(m.group(1)) * 10)
    h = round(float(m.group(2)) * 10)
    t = round(float(m.group(3)) * 10, 1) if m.group(3) else None
    return w, h, t


FINISH_WORDS = ["Full Lappato", "Semi-Polished", "Unpolished", "Lappato", "Polished",
                "Matt", "Matte", "Gloss", "Glossy", "Satin", "Structure", "Riven",
                "Honed", "Decor", "Bumpy", "Tumbled"]
FINISH_CANON = {"Matte": "Matt", "Glossy": "Gloss"}
SUPERSEDES = {"Lappato": ["Full Lappato", "Semi-Polished"], "Polished": ["Semi-Polished"]}


def detect_finishes(text):
    found = []
    for f in FINISH_WORDS:
        if re.search(rf"\b{re.escape(f)}\b", text or "", re.I):
            canon = FINISH_CANON.get(f, f)
            if canon in found or any(s in found for s in SUPERSEDES.get(canon, [])):
                continue
            found.append(canon)
    return found


COLOR_RE = re.compile(
    r"\b((?:light|dark|mid|cool|off|deep|pale)[ -]?)?"
    r"(white|black|grey|gray|anthracite|beige|cream|ivory|brown|taupe|greige|sand|stone|"
    r"blue|navy|denim|green|sage|olive|emerald|pink|blush|red|terracotta|rust|yellow|mustard|"
    r"orange|gold|silver|copper|charcoal|graphite|pearl|bone|mink|walnut|oak|natural|multi)\b", re.I)


def extract_colors(text):
    out = []
    for m in COLOR_RE.finditer(text or ""):
        word = ((m.group(1) or "") + m.group(2)).strip().title().replace("Gray", "Grey")
        if word not in out:
            out.append(word)
    return out


def tile_record(vendor, brand, code, rng, title, w, h, thick, material, finish, color,
                application, suitable_room, indoor_outdoor, categories, cost_m2,
                tiles_per_box, box_cov, box_kg, boxes_pallet, extra_desc="", notes="",
                cost_per_tile=None, dim_override=None):
    if w and h and w > h:
        w, h = h, w  # site convention: smaller dimension first (e.g. 300x600)
    color = color or extract_colors(title)
    dim = dim_override or (f"{w}x{h}" if w and h else "")
    price_m2 = retail(cost_m2)
    price_box = r2(price_m2 * box_cov) if price_m2 and box_cov else None
    price_tile = r2(price_box / tiles_per_box) if price_box and tiles_per_box else None
    if cost_per_tile:  # per-piece/per-sheet priced items (mosaics, cladding)
        price_tile = retail(cost_per_tile)
        if tiles_per_box:
            price_box = r2(price_tile * tiles_per_box)
        if not price_m2 and w and h:
            price_m2 = r2(price_tile / (w * h / 1_000_000))
    return {
        "type": "tile", "vendor": vendor, "brand": brand, "supplier_code": code or None,
        "range": rng or None, "title": title, "dimension_string": dim,
        "tile_width_mm": w, "tile_height_mm": h, "tile_thickness_mm": thick,
        "material": material, "finish": finish or [], "color": color or [],
        "application": application or [], "suitable_room": suitable_room or [],
        "indoor_outdoor": indoor_outdoor, "categories": categories,
        "cost_per_m2": r2(cost_m2), "price_per_m2": price_m2,
        "price_per_box": price_box, "price_per_tile": price_tile,
        "tiles_per_box": int(tiles_per_box) if tiles_per_box else None,
        "box_coverage_m2": r2(box_cov), "box_weight_kg": r2(box_kg),
        "boxes_per_pallet": int(boxes_pallet) if boxes_pallet else None,
        "description": tile_description(title, brand, material, finish, color, w, h, application, extra_desc),
        "notes": notes,
    }


def install_record(vendor, brand, code, name, product_type, category, unit_type, unit_amount,
                   colour, cost, notes=""):
    return {
        "type": "installation", "vendor": vendor, "brand": brand, "supplier_code": code or None,
        "name": name, "product_type": product_type, "installation_category": category,
        "unit_type": unit_type, "unit_amount": unit_amount, "colour": colour or "N/A",
        "cost": r2(cost), "price": retail(cost),
        "description": f"{name}" + (f" by {brand}." if brand else "."),
        "notes": notes,
    }


# ---------------------------------------------------------------- RAK
def parse_rak():
    rows = sheet_rows(FILES / "RAK/RAK 2026 Tile General Price List May.xlsx", "Sheet1")
    hdr = rows[10]
    idx = {name: i for i, name in enumerate(hdr) if name}
    out, skipped = [], []
    for r in rows[11:]:
        if len(r) < 20 or not r[idx["Product Name"]]:
            continue
        status = r[idx["Product Status"]]
        if not ("current" in status.lower() or "new" in status.lower()):
            skipped.append((r[idx["Product Name"]], f"status={status}"))
            continue
        per_piece = r[idx["Unit of Measure"]].upper() != "SQM"
        family = r[idx["Family"]]
        name_raw = r[idx["Product Name"]]
        size_str = r[idx["Size (cm)"]]
        w, h, t_from_size = parse_size_cm(size_str)
        thick = parse_num(r[idx.get("Thickness of tile", -1)] if len(r) > idx.get("Thickness of tile", 99) else None)
        thick = thick or t_from_size
        if per_piece:
            # mosaics: strip only the sheet size, keep chip-size qualifiers (2.5cm / 3x6 / 10x10)
            name_clean = re.sub(rf"\b{re.escape(size_str)}\b", " ", name_raw, flags=re.I)
            title = title_case(re.sub(r"\s+", " ", name_clean).strip())
        else:
            title = title_case(strip_size_tokens(name_raw))
        colour = title_case(r[idx["Colour"]]) if r[idx["Colour"]] else None
        finish = detect_finishes(r[idx["Finish"]] + " " + r[idx["Special Finish"]])
        fam = family.lower()
        if fam == "countertop" and "countertop" not in title.lower():
            title += " Countertop"
        if "wall" in fam:
            cats, app, io, mat = ["Wall"], ["Wall"], "Indoor", "Ceramic"
        elif "outdoor" in fam:
            cats, app, io, mat = ["Outdoor"], ["Floor"], "Outdoor", "Porcelain"
        elif "mosaic" in fam:
            cats, app, io, mat = ["Mosaic"], ["Wall"], "Indoor", "Porcelain"
        else:
            cats, app, io, mat = ["Floor"], ["Wall", "Floor"], "Indoor", "Porcelain"
        cost = parse_num(r[idx["Room lot"]]) or parse_num(r[idx["Pallet rate"]])
        if not cost:
            skipped.append((name_raw, "no price"))
            continue
        if per_piece and "mosaic" in name_raw.lower():
            cats, app, mat = ["Mosaic"], ["Wall"], "Porcelain"
        out.append(tile_record(
            "RAK", "RAK Ceramics", r[idx["New Codes"]], r[idx["Range"]], title, w, h, thick,
            mat, finish, [colour] if colour else [],
            app, [], io, cats,
            None if per_piece else cost,
            parse_num(r[idx["Tiles Per Box"]]),
            parse_num(r[idx["TILE\xa0 COVERAGE PER BOX M2"]] if "TILE\xa0 COVERAGE PER BOX M2" in idx else r[20]),
            parse_num(r[idx["Weight/Box (Kg)"]]),
            parse_num(r[idx["Boxes Per Pallet"]]),
            notes=f"family={family}; status={status}; rrp_ex_vat={r[idx['Suggested RRP Ex VAT']]}",
            cost_per_tile=cost if per_piece else None,
        ))
    return out, skipped


# ---------------------------------------------------------------- ESL
WOOD_RE = re.compile(r"\b(WOOD|OAK|WALNUT|ASH|PINE|MAPLE|TEAK)\b", re.I)


def parse_esl():
    path = FILES / "ESL 2026/ESL PRICE LIST JUNE 2026.xlsx"
    tiles, skipped = [], []
    rows = sheet_rows(path, "TILES ")
    for r in rows[10:]:
        if len(r) < 10 or not r[0] or not r[1]:
            continue
        desc = re.sub(r"\([^)]*\)?", "", r[1])  # drop parenthetical remarks
        desc = re.sub(r"[*`]+", " ", desc).strip()  # drop junk chars like '**** MATT ****'
        price = parse_num(r[9])
        if not price:
            skipped.append((desc, "no price"))
            continue
        w, h, _ = parse_size_cm(r[2])
        title = title_case(strip_size_tokens(desc))
        finish = detect_finishes(desc)
        # strip finish + trailing supplier refs like 'DHT19' from title
        title = re.sub(r"\b(Dht|Dh|Ref)\s?\w*\d\w*$", "", title).strip()
        colour = title_case(r[3]) if r[3] else None
        is_mosaic = "mosaic" in desc.lower()
        is_wood = bool(WOOD_RE.search(desc))
        per_box_priced = (r[7] or "").lower() == "per box"
        m2_box = parse_num(r[5])
        if is_mosaic:
            cats, app = ["Mosaic", "Wall"], ["Wall"]
        elif is_wood:
            cats, app = ["Wood", "Floor"], ["Wall", "Floor"]
        elif w and h and w <= 330 and h <= 330 and ("gloss" in desc.lower() or (w < 250 or h < 250)):
            cats, app = ["Wall"], ["Wall"]
        else:
            cats, app = ["Floor"], ["Wall", "Floor"]
        cost_m2 = (price / m2_box) if (per_box_priced and m2_box) else price
        rec = tile_record(
            "ESL", "ESL Ceramics", r[0], None, title, w, h, None,
            None, finish, [colour] if colour else [],
            app, [], "Indoor", cats, cost_m2,
            parse_num(r[4]), m2_box, None, parse_num(r[6]) if not per_box_priced else None,
            notes=("priced per box in list" if per_box_priced else ""),
        )
        tiles.append(rec)

    # non-tiles sheet -> installation products
    install = []
    BRANDS = {"INSTARMAC": "Instarmac", "TECCA": "Tecca", "PEYGRAN": "Peygran"}
    for r in sheet_rows(path, "TECCA + NON TILES")[10:]:
        if len(r) < 10 or not r[0] or not r[1]:
            continue
        desc = re.sub(r"\*.*$", "", r[1]).strip()
        price = parse_num(r[9])
        if not price:
            skipped.append((desc, "non-tile no price"))
            continue
        first = desc.split()[0].upper()
        brand = BRANDS.get(first)
        name = title_case(desc)
        low = desc.lower()
        def pt():
            for kw, t in [("grout", "grout"), ("adhesive", "adhesive"), ("grip", "adhesive"),
                          ("fix pro", "adhesive"), ("level", "leveller"), ("primer", "primer"),
                          ("prime", "primer"), ("tanking", "waterproofing"), ("decoupling", "matting"),
                          ("matting", "matting"), ("handboard", "backer-board"), ("backer", "backer-board"),
                          ("levelling system", "levelling"), ("spacer", "levelling"), ("wedge", "levelling"),
                          ("clip", "levelling"), ("cutter", "tools"), ("blade", "tools"),
                          ("drill", "tools"), ("diamond", "tools"), ("trim", "trim"),
                          ("silicone", "sealant"), ("sealant", "sealant"), ("salt", "cleaning"),
                          ("cleaner", "cleaning")]:
                if kw in low:
                    return t
            return "accessory"
        m = re.search(r"(\d+(?:\.\d+)?)\s*(kg|ltr|litre|l|ml)\b", low)
        unit_type, unit_amount = "each", "1"
        if m:
            amt, u = float(m.group(1)), m.group(2)
            if u == "ml":
                unit_type, unit_amount = "litre", str(amt / 1000)
            elif u in ("l", "ltr", "litre"):
                unit_type, unit_amount = "litre", str(amt)
            else:
                unit_type, unit_amount = "kg", str(amt)
        install.append(install_record("ESL", brand, r[0], name, pt(), "tiling",
                                      unit_type, unit_amount, None, price))
    return tiles, install, skipped


# ---------------------------------------------------------------- VERONA
def verona_title(desc, finish_list):
    base = re.sub(r"\s*(Wall & Floor|Wall and Floor|Wall|Floor)\s*Tile\s*$", "", desc, flags=re.I).strip()
    fin = finish_list[0] if finish_list else None
    if fin and fin.lower() not in base.lower():
        return f"{base} {fin}"
    return base


def verona_app(desc, default):
    if re.search(r"wall\s*&\s*floor\s*tile|wall and floor tile", desc, re.I):
        return ["Wall", "Floor"]
    if re.search(r"wall\s*tile", desc, re.I):
        return ["Wall"]
    if re.search(r"floor\s*tile", desc, re.I):
        return ["Floor"]
    return default


def parse_verona():
    rows = sheet_rows(FILES / "VERONA 2026/Verona 2026 Pricelist.xlsx", "PriceList_2026")
    tiles, install, skipped = [], [], []
    section = None
    SKIP_SECTIONS = {"Flooring | ClickLux SPC", "Flooring | Accessories"}
    for r in rows:
        vals = [v for v in r if v]
        if vals and len(vals) <= 2 and not r[1]:
            section = vals[0]
            continue
        if not r or not r[0] or r[0] == "Code" or not r[1]:
            continue
        code, desc = r[0], clean_text(r[1])
        if section in SKIP_SECTIONS:
            skipped.append((desc, f"section={section}"))
            continue

        if section in ("Porcelain | Ceramic", "Outdoor | Porcelain"):
            material, finish = r[2], detect_finishes(r[3]) or ([clean_text(r[3])] if r[3] and r[3].upper() != "N/A" else [])
            L, W, thick = parse_num(r[4]), parse_num(r[5]), parse_num(r[6])
            tile_kg, box_qty = parse_num(r[7]), parse_num(r[10])
            m2_box, cost = parse_num(r[11]), parse_num(r[14])
            pallet_qty = parse_num(r[13])
            if not cost:
                skipped.append((desc, "no price")); continue
            outdoor = section == "Outdoor | Porcelain"
            app = verona_app(desc, ["Floor"] if outdoor else ["Wall", "Floor"])
            cats = ["Outdoor"] if outdoor else (["Wall"] if app == ["Wall"] else ["Floor"] + (["Wall"] if "Wall" in app else []))
            tiles.append(tile_record(
                "VERONA", "Verona", code, None, verona_title(desc, finish),
                int(W) if W else None, int(L) if L else None, thick, material, finish, [],
                app, [], "Outdoor" if outdoor else "Indoor", cats, cost,
                box_qty, m2_box, r2(tile_kg * box_qty) if tile_kg and box_qty else None,
                round(pallet_qty / box_qty) if pallet_qty and box_qty else None,
                notes=f"section={section}"))

        elif section == "Porcelain | Opus":
            material, finish = r[2], detect_finishes(r[3])
            thick, m2_box, cost = parse_num(r[4]), parse_num(r[6]), parse_num(r[9])
            if not cost:
                skipped.append((desc, "no price")); continue
            tiles.append(tile_record(
                "VERONA", "Verona", code, None, verona_title(desc, finish), None, None, thick,
                material, finish, [], ["Floor"], [], "Indoor", ["Floor"], cost,
                None, m2_box, None, None, dim_override="modular",
                notes=f"section={section}; modular opus pattern"))

        elif section in ("Natural Stone | Split Face", "Porcelain | Mosaics", "Natural Stone | Mosaics"):
            finish = detect_finishes(r[2]) or ([clean_text(r[2])] if r[2] else [])
            L, W, thick = parse_num(r[3]), parse_num(r[4]), parse_num(r[5])
            tile_kg = parse_num(r[6])
            pcs_m2, box_qty = parse_num(r[8]), parse_num(r[9])
            sheet_cost = parse_num(r[12])
            if not sheet_cost:
                skipped.append((desc, "no price")); continue
            material = "Natural Stone" if section.startswith("Natural Stone") else "Porcelain"
            mosaic = "Mosaics" in section
            cats = ["Mosaic"] if mosaic else ["Wall", "Special Finish"]
            cost_m2 = sheet_cost * pcs_m2 if pcs_m2 else None
            tiles.append(tile_record(
                "VERONA", "Verona", code, None, verona_title(desc, finish if not mosaic else []),
                int(W) if W else None, int(L) if L else None, thick, material, finish, [],
                ["Wall"], [], "Indoor", cats, cost_m2,
                box_qty, r2(box_qty / pcs_m2) if box_qty and pcs_m2 else None,
                r2(tile_kg * box_qty) if tile_kg and box_qty else None, None,
                notes=f"section={section}; priced per sheet {sheet_cost}",
                cost_per_tile=sheet_cost))

        elif section == "Glass | Mixed Mosaics":
            L, W, thick = parse_num(r[2]), parse_num(r[3]), parse_num(r[4])
            tile_kg = parse_num(r[5])
            pcs_m2, box_qty = parse_num(r[7]), parse_num(r[8])
            sheet_cost = parse_num(r[11])
            if not sheet_cost:
                skipped.append((desc, "no price")); continue
            cost_m2 = sheet_cost * pcs_m2 if pcs_m2 else None
            tiles.append(tile_record(
                "VERONA", "Verona", code, None, desc, int(W) if W else None, int(L) if L else None,
                thick, "Glass", [], [], ["Wall"], [], "Indoor", ["Mosaic"], cost_m2,
                box_qty, r2(box_qty / pcs_m2) if box_qty and pcs_m2 else None,
                r2(tile_kg * box_qty) if tile_kg and box_qty else None, None,
                notes=f"section={section}; priced per sheet {sheet_cost}",
                cost_per_tile=sheet_cost))

        elif section == "ProBacker | Tile Backer Board":
            cost = parse_num(r[3])
            if not cost:
                skipped.append((desc, "no price")); continue
            install.append(install_record("VERONA", "Verona", code, desc, "backer-board",
                                          "tiling", "each", "1", None, cost,
                                          notes="price per board"))

        elif section == "MosaicFix":
            cost = parse_num(r[2])
            if not cost:
                skipped.append((desc, "no price")); continue
            m = re.search(r"box of (\d+)", desc, re.I)
            if m:
                cost = cost * int(m.group(1))
            install.append(install_record("VERONA", "Verona", code, desc, "accessory",
                                          "tiling", "each", "1", None, cost))

        elif section == "Accessories":
            cost = parse_num(r[5])
            if not cost:
                skipped.append((desc, "no price")); continue
            size = clean_text(r[2]).lower()
            m = re.match(r"(\d+(?:\.\d+)?)\s*(kg|ltr|l)\b", size)
            unit_type, unit_amount = "each", "1"
            if m:
                unit_type = "kg" if m.group(2) == "kg" else "litre"
                unit_amount = m.group(1)
            brand = "Instarmac" if "instarmac" in desc.lower() else "Verona"
            low = desc.lower()
            ptype = ("grout" if "grout" in low else "primer" if "prime" in low
                     else "adhesive" if "fix" in low or "adhesive" in low else "accessory")
            install.append(install_record("VERONA", brand, code, desc.replace("®", ""), ptype,
                                          "tiling", unit_type, unit_amount, None, cost))
        else:
            skipped.append((desc, f"unknown section {section}"))
    return tiles, install, skipped


def parse_verona_OLD():
    rows = sheet_rows(FILES / "VERONA 2026/Verona 2026 Pricelist.xlsx", "PriceList_2026")
    tiles, install, skipped, wp_rows = [], [], [], []
    section = None
    TILE_SECTIONS = {
        "Porcelain | Ceramic": (["Floor"], None, "Indoor"),
        "Porcelain | Opus": (["Floor"], ["Floor"], "Indoor"),
        "Natural Stone | Split Face": (["Wall", "Special Finish"], ["Wall"], "Indoor"),
        "Porcelain | Mosaics": (["Mosaic"], ["Wall"], "Indoor"),
        "Natural Stone | Mosaics": (["Mosaic"], ["Wall"], "Indoor"),
        "Glass | Mixed Mosaics": (["Mosaic"], ["Wall"], "Indoor"),
        "Outdoor | Porcelain": (["Outdoor"], ["Floor"], "Outdoor"),
    }
    SKIP_SECTIONS = {"Flooring | ClickLux SPC", "Flooring | Accessories"}
    INSTALL_SECTIONS = {"ProBacker | Tile Backer Board": "backer-board",
                        "MosaicFix": "adhesive", "Accessories": "accessory"}
    for r in rows:
        vals = [v for v in r if v]
        if len(vals) <= 2 and vals and not r[1]:
            section = vals[0]
            continue
        if not r or not r[0] or r[0] == "Code":
            continue
        code, desc = r[0], r[1]
        if code.upper().startswith("WP"):
            wp_rows.append(r)
        if section in SKIP_SECTIONS:
            skipped.append((desc, f"section={section}"))
            continue
        if section in INSTALL_SECTIONS:
            price = parse_num(r[5] if len(r) > 5 else None) or parse_num(r[-1])
            if price:
                install.append(install_record("VERONA", "Verona", code, clean_text(desc),
                                              INSTALL_SECTIONS[section], "tiling", "each", "1", None, price))
            else:
                skipped.append((desc, "install no price"))
            continue
        if section not in TILE_SECTIONS:
            skipped.append((desc, f"unknown section {section}"))
            continue
        cats, app, io = TILE_SECTIONS[section]
        material, finish_txt = r[2], r[3]
        w, h = parse_num(r[5]), parse_num(r[4])  # width=col Width, length=col Length; use WxH = width x length
        thick = parse_num(r[6])
        tile_kg, box_qty = parse_num(r[7]), parse_num(r[10])
        m2_box, m2_pallet, pallet_qty = parse_num(r[11]), parse_num(r[12]), parse_num(r[13])
        cost = parse_num(r[14])
        if not cost or not desc:
            skipped.append((desc, "no price"))
            continue
        base = re.sub(r"\s*(Wall & Floor|Wall and Floor|Wall|Floor)\s*Tile\s*$", "", desc, flags=re.I).strip()
        if re.search(r"wall\s*&\s*floor\s*tile|wall and floor tile", desc, re.I):
            app_row = ["Wall", "Floor"]
        elif re.search(r"wall\s*tile", desc, re.I):
            app_row = ["Wall"]
        elif re.search(r"floor\s*tile", desc, re.I):
            app_row = ["Floor"]
        else:
            app_row = app or ["Wall", "Floor"]
        finish = detect_finishes(finish_txt) or ([clean_text(finish_txt)] if finish_txt and finish_txt.upper() != "N/A" else [])
        short_fin = finish[0] if finish else None
        title = base
        if short_fin and short_fin.lower() not in base.lower():
            title = f"{base} {short_fin}"
        cats_row = list(cats)
        if section == "Porcelain | Ceramic" and app_row == ["Wall"]:
            cats_row = ["Wall"]
        elif section == "Porcelain | Ceramic" and "Floor" in app_row:
            cats_row = ["Floor"] + (["Wall"] if "Wall" in app_row else [])
        boxes_pallet = round(pallet_qty / box_qty) if pallet_qty and box_qty else None
        box_kg = r2(tile_kg * box_qty) if tile_kg and box_qty else None
        w_i = int(w) if w else None
        h_i = int(h) if h else None
        tiles.append(tile_record(
            "VERONA", "Verona", code, None, title, w_i, h_i, thick,
            material, finish, [], app_row, [], io, cats_row, cost,
            box_qty, m2_box, box_kg, boxes_pallet,
            notes=f"section={section}",
        ))
    return tiles, install, skipped, wp_rows


# ---------------------------------------------------------------- TRIMLINE accessories
def parse_trimline_accessories():
    img_dir = FILES / "TRIMLINE 2026/Product Images"
    sku_to_img = {}
    for p in img_dir.iterdir():
        if p.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue
        m = re.match(r"^(\d{3,5})\b", p.name)
        if m:
            sku_to_img.setdefault(m.group(1), p)
    rows = sheet_rows(FILES / "TRIMLINE 2026/Price List Wholesale - 01 MAY 2026.xlsx", "Full Price List", max_col=8)
    PT = {
        "Adhesives, Levellers & Grout": "adhesive", "Tile Cleaners & Sealers": "cleaning",
        "Tile Trim & Profiles": "trim", "Tiling Tools": "tools",
        "Tile Cutting, Polishing & Handling": "tools", "Tile Levelling System & Spacers": "levelling",
        "Tile Backing & Underlayments": "backer-board", "Waterproofing & Wetroom Products": "waterproofing",
        "Electric Underfloor Heating": "heating", "Site Consumables": "consumables",
        "Mechanical Tile Fixing": "fixing", "Sanitryware & Bathroom Furniture": "accessory",
    }
    out = []
    for r in rows[6:]:
        if len(r) < 6 or not r[2] or not r[3]:
            continue
        sku = r[2]
        if sku not in sku_to_img:
            continue
        price = parse_num(r[5])
        if not price:
            continue
        low = r[3].lower()
        ptype = PT.get(r[1], "accessory")
        if ptype == "adhesive" and "grout" in low:
            ptype = "grout"
        if "sealer" in low or "protector" in low:
            ptype = "sealant" if ptype == "cleaning" else ptype
        rec = install_record("TRIMLINE", r[0], sku, clean_text(r[3]), ptype, "tiling",
                             "each", "1", None, price)
        rec["local_image"] = str(sku_to_img[sku])
        out.append(rec)
    return out


def disambiguate(recs, esl_codes=False):
    """Resolve same-slug collisions within a vendor list. Returns (kept, dropped)."""
    from collections import defaultdict
    from common import slugify
    groups = defaultdict(list)
    for r in recs:
        groups[slugify(r["title"], r["dimension_string"])].append(r)
    dropped = []
    for slug, grp in groups.items():
        if len(grp) < 2:
            continue
        if esl_codes:
            for r in grp:
                code = (r["supplier_code"] or "").upper()
                if code.endswith("20"):
                    r["tile_thickness_mm"] = 20
                    r["title"] += " 20mm"
                    r["indoor_outdoor"] = "Outdoor"
                    r["categories"] = ["Outdoor"]
                elif code.endswith("7.2MM"):
                    r["tile_thickness_mm"] = 7.2
                    r["title"] += " 7.2mm"
                elif code.endswith("P") and not any(f in r["finish"] for f in ("Polished",)):
                    r["finish"] = ["Polished"]
                    if "polished" not in r["title"].lower():
                        r["title"] += " Polished"
                elif code.endswith("M") and not r["finish"]:
                    r["finish"] = ["Matt"]
                    if "matt" not in r["title"].lower():
                        r["title"] += " Matt"
        # thickness-based qualifier (e.g. indoor 9mm vs outdoor 20mm versions)
        thicks = {r["tile_thickness_mm"] for r in grp}
        if len(thicks) > 1 and None not in thicks:
            tmin = min(thicks)
            for r in grp:
                t = r["tile_thickness_mm"]
                if t != tmin and f"{t}mm" not in r["title"].lower().replace(" ", ""):
                    r["title"] += f" {t:g}mm"
                    if t >= 18:
                        r["indoor_outdoor"] = "Outdoor"
                        r["categories"] = ["Outdoor"]
    # final pass: anything still colliding -> keep first, drop rest
    seen = {}
    kept = []
    for r in recs:
        s = slugify(r["title"], r["dimension_string"])
        if s in seen:
            dropped.append(r)
        else:
            seen[s] = True
            kept.append(r)
    return kept, dropped


if __name__ == "__main__":
    print("== RAK ==")
    rak, rak_skip = parse_rak()
    rak, rak_drop = disambiguate(rak)
    write_jsonl(STAGING / "rak_tiles.jsonl", rak)
    print(f"  skipped {len(rak_skip)}: {rak_skip[:8]}")
    print(f"  dropped collisions: {[(d['supplier_code'], d['title']) for d in rak_drop]}")

    print("== ESL ==")
    esl_tiles, esl_install, esl_skip = parse_esl()
    esl_tiles, esl_drop = disambiguate(esl_tiles, esl_codes=True)
    print(f"  dropped collisions: {[(d['supplier_code'], d['title']) for d in esl_drop]}")
    write_jsonl(STAGING / "esl_tiles.jsonl", esl_tiles)
    write_jsonl(STAGING / "esl_installation.jsonl", esl_install)
    print(f"  skipped {len(esl_skip)}: {esl_skip[:8]}")

    print("== VERONA ==")
    v_tiles, v_install, v_skip = parse_verona()
    v_tiles, v_drop = disambiguate(v_tiles)
    print(f"  dropped collisions: {[(d['supplier_code'], d['title']) for d in v_drop]}")
    write_jsonl(STAGING / "verona_tiles.jsonl", v_tiles)
    write_jsonl(STAGING / "verona_installation.jsonl", v_install)
    from collections import Counter
    print("  skipped by reason:", Counter(reason for _, reason in v_skip))

    print("== TRIMLINE accessories ==")
    tr = parse_trimline_accessories()
    write_jsonl(STAGING / "trimline_installation.jsonl", tr)
