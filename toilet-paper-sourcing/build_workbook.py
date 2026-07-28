#!/usr/bin/env python3
"""Build the toilet paper sourcing + landed cost workbook."""

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.comments import Comment

# ---------------------------------------------------------------- style kit
FONT = "Arial"
BLUE = Font(name=FONT, size=10, color="0000FF")          # hardcoded input
BLACK = Font(name=FONT, size=10)                          # formula
GREEN = Font(name=FONT, size=10, color="008000")          # cross-sheet link
BOLD = Font(name=FONT, size=10, bold=True)
TITLE = Font(name=FONT, size=14, bold=True, color="1F3864")
HDR = Font(name=FONT, size=10, bold=True, color="FFFFFF")
SECTION = Font(name=FONT, size=11, bold=True, color="1F3864")
NOTE = Font(name=FONT, size=9, italic=True, color="595959")

FILL_HDR = PatternFill("solid", fgColor="1F3864")
FILL_INPUT = PatternFill("solid", fgColor="FFFF00")       # user must fill
FILL_SECTION = PatternFill("solid", fgColor="D9E2F3")
FILL_OUT = PatternFill("solid", fgColor="E2EFDA")
FILL_ALT = PatternFill("solid", fgColor="F2F2F2")

THIN = Side(style="thin", color="BFBFBF")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

CUR4 = '$#,##0.0000;($#,##0.0000);-'
CUR3 = '$#,##0.000;($#,##0.000);-'
CUR2 = '$#,##0.00;($#,##0.00);-'
CUR0 = '$#,##0;($#,##0);-'
PCT = '0.0%'
NUM2 = '#,##0.00'
NUM0 = '#,##0'

wb = Workbook()

# =========================================================== 1. README
ws = wb.active
ws.title = "README"
ws.sheet_view.showGridLines = False
ws.column_dimensions["A"].width = 3
ws.column_dimensions["B"].width = 34
ws.column_dimensions["C"].width = 78

r = 2
ws.cell(r, 2, "PRIVATE LABEL 2-PLY BATH TISSUE").font = TITLE
r += 1
ws.cell(r, 2, "Sourcing Tracker + Landed Cost Model").font = Font(name=FONT, size=11, italic=True, color="595959")
r += 2

def readme_section(title):
    global r
    c = ws.cell(r, 2, title)
    c.font = SECTION
    c.fill = FILL_SECTION
    ws.cell(r, 3).fill = FILL_SECTION
    r += 1

def readme_row(k, v):
    global r
    ws.cell(r, 2, k).font = BOLD
    c = ws.cell(r, 3, v)
    c.font = Font(name=FONT, size=10)
    c.alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[r].height = 15 * max(1, (len(v) // 95) + 1)
    r += 1

readme_section("HOW TO USE THIS WORKBOOK")
readme_row("1. Assumptions", "Start here. Every yellow-filled cell is yours to edit. Everything downstream recalculates. The spec block drives roll weight and cube, which drive freight, which drives everything.")
readme_row("2. Supplier Tracker", "Your sourcing spreadsheet. Pre-loaded with 12 real converters. Fill the blue quote columns as responses come in; the weighted score ranks them automatically.")
readme_row("3. Landed Cost Model", "Full cost stack for one customer order, from parent roll to doorstep. Change pack size and zone at the top.")
readme_row("4. Scenario - Pack x Zone", "The core answer: delivered cost per 100 sheets AND gross margin, flexed by rolls per pack (rows) and parcel zone (columns).")
readme_row("5. Scenario - Volume", "Procurement view: how ex-works + inbound freight per roll moves with order size and freight mode (LTL / TL / Ocean).")
readme_row("6. Freight Rates", "Parcel rate table by billed weight and zone. THESE ARE PLANNING ESTIMATES - replace with your carrier contract before committing.")
readme_row("7. Benchmark", "Cost per 100 sheets vs Kirkland, AmazonCommercial, store brand and Charmin. Your modeled number pulls through live.")

r += 1
readme_section("COLOR KEY")
readme_row("Yellow fill + blue text", "INPUT - you edit these. Nothing else.")
readme_row("Black text", "Formula. Do not overwrite.")
readme_row("Green text", "Link pulled from another sheet.")
readme_row("Green fill", "Key output.")

r += 1
readme_section("THE ONE NUMBER THAT MATTERS")
readme_row("Cost per 100 sheets", "Roll counts and 'Mega roll' math are marketing. Cost per 100 sheets is the only honest unit of comparison, and it is what this model optimizes. Market floor is ~$0.18/100 sheets (Kirkland, AmazonCommercial). National brands sit at $0.30-$0.45.")

r += 1
readme_section("CRITICAL MODELING NOTE - DIMENSIONAL WEIGHT")
readme_row("Why compression matters", "Bath tissue is ~95% air. Carriers bill the GREATER of actual and dimensional weight, so an uncompressed 30-roll pack bills at roughly 17 lb against 7 lb of actual weight. The 'Compression saving' input on the Assumptions tab is the single highest-leverage lever in this workbook. Ask every converter about compressed/high-density winding.")

r += 1
readme_section("SOURCES FOR PRE-FILLED DEFAULTS")
readme_row("Parent roll $/ton", "Recycled/mixed $900-1,050; standard virgin $950-1,200; premium virgin $1,200-1,300+. Fastmarkets US tissue parent roll assessments and Roxipaper 2026 B2B jumbo roll price guide. Default set to $1,000.")
readme_row("Rolls per pallet", "1,920 rolls per pallet - observed pallet-lot listing (1001 Pallet Liquidation).")
readme_row("Rolls per 40ft container", "56,160 rolls. Source: Accio wholesale toilet paper roll sourcing guide.")
readme_row("MOQ range", "500 to 250,000 rolls across the market; most converters price wholesale at 10,000+ rolls. Source: Accio; Top Source Hygiene 2026 landed cost & ROI guide.")
readme_row("Benchmark retail prices", "Kirkland Signature 30x380 at $20.99 = $0.184/100 sheets; AmazonCommercial 36x286 at $18.54 S&S = ~$0.18/100 sheets. Slickdeals, Everyday Cheapskate, Who Gives A Crap cost-per-sheet analysis.")
readme_row("Parcel rates", "ESTIMATES ONLY, built to approximate published ground rates including fuel and residential surcharge. Not quoted. Replace before use.")
readme_row("DIM divisor 139", "Standard retail ground DIM divisor. Negotiated contracts commonly reach 166 - if you get 166, change the input; it is worth real money.")

r += 1
readme_section("BUILT")
readme_row("Date", "28 July 2026")
readme_row("Scope", "2-ply, 4.0in x 4.0in sheet, 300 sheets/roll value grade, US retail / DTC.")

# =========================================================== 2. ASSUMPTIONS
aw = wb.create_sheet("Assumptions")
aw.sheet_view.showGridLines = False
aw.column_dimensions["A"].width = 3
aw.column_dimensions["B"].width = 42
aw.column_dimensions["C"].width = 16
aw.column_dimensions["D"].width = 12
aw.column_dimensions["E"].width = 62

A = {}   # key -> absolute address on Assumptions
row = 2
aw.cell(row, 2, "MASTER ASSUMPTIONS").font = TITLE
row += 1
aw.cell(row, 2, "Edit yellow cells only. Everything else is formula-driven.").font = NOTE
row += 2

pending = []   # (row, col, template, key_for_style)

def sec(title):
    global row
    for col in range(2, 6):
        c = aw.cell(row, col)
        c.fill = FILL_SECTION
        if col == 2:
            c.value = title
            c.font = SECTION
    row += 1

def inp(key, label, value, fmt=None, unit="", note=""):
    """Yellow user input."""
    global row
    aw.cell(row, 2, label).font = BOLD
    c = aw.cell(row, 3, value)
    c.font = BLUE
    c.fill = FILL_INPUT
    c.border = BOX
    if fmt:
        c.number_format = fmt
    aw.cell(row, 4, unit).font = NOTE
    if note:
        n = aw.cell(row, 5, note)
        n.font = NOTE
        n.alignment = Alignment(wrap_text=True, vertical="center")
    A[key] = f"$C${row}"
    row += 1

def calc(key, label, template, fmt=None, unit="", note="", out=False):
    """Formula cell; template uses {key} placeholders."""
    global row
    aw.cell(row, 2, label).font = BOLD if out else Font(name=FONT, size=10)
    c = aw.cell(row, 3)
    c.font = BLACK
    c.border = BOX
    if fmt:
        c.number_format = fmt
    if out:
        c.fill = FILL_OUT
        c.font = Font(name=FONT, size=10, bold=True)
    aw.cell(row, 4, unit).font = NOTE
    if note:
        n = aw.cell(row, 5, note)
        n.font = NOTE
        n.alignment = Alignment(wrap_text=True, vertical="center")
    A[key] = f"$C${row}"
    pending.append((row, 3, template))
    row += 1

# --- product spec
sec("1. PRODUCT SPECIFICATION")
inp("sheet_w", "Sheet width", 4.0, NUM2, "in", "Spec a FULL 4.0in sheet. National brands have shrunk below this - it is your anti-shrinkflation claim.")
inp("sheet_l", "Sheet length", 4.0, NUM2, "in")
inp("sheets", "Sheets per roll", 300, NUM0, "sheets")
inp("plies", "Plies", 2, NUM0, "ply")
inp("gsm", "Basis weight per ply", 14.0, NUM2, "gsm", "13-15 gsm is the value-grade 2-ply band. Below 13 you lose the 'same quality as name brands' claim.")
inp("core_g", "Core weight", 5.0, NUM2, "g")
inp("roll_dia", "Roll diameter (uncompressed)", 4.5, NUM2, "in")
calc("sheet_sqin", "Sheet area", "={sheet_w}*{sheet_l}", NUM2, "sq in")
calc("sheet_m2", "Sheet area", "={sheet_sqin}*0.00064516", '0.000000', "sq m", "1 sq in = 0.00064516 sq m")
calc("gsm_tot", "Total basis weight (all plies)", "={gsm}*{plies}", NUM2, "gsm")
calc("fiber_g", "Fiber weight per roll", "={sheet_m2}*{gsm_tot}*{sheets}", NUM2, "g")
calc("roll_g", "Total roll weight (incl. core)", "={fiber_g}+{core_g}", NUM2, "g")
calc("roll_lb", "Roll weight", "={roll_g}/453.592", '0.0000', "lb", "1 lb = 453.592 g")
calc("sqft_roll", "Square feet per roll", "={sheet_sqin}*{sheets}/144", NUM2, "sq ft", "Print this on the front of the pack.")

row += 1
# --- ex works
sec("2. EX-WORKS COST BUILD-UP")
inp("ton_price", "Parent roll price", 1000, CUR0, "$/short ton", "Recycled/mixed $900-1,050. Standard virgin $950-1,200. Premium virgin $1,200-1,300+.")
inp("lb_ton", "Pounds per short ton", 2000, NUM0, "lb")
calc("fiber_cost", "Fiber cost per roll", "=({fiber_g}/453.592)*({ton_price}/{lb_ton})", CUR4, "$/roll")
inp("uplift", "Converting, labor & waste uplift", 0.60, PCT, "%", "Converting typically adds 60-100% on top of fiber. Push back on any quote implying more.")
inp("corewrap", "Core + wrap + label", 0.020, CUR3, "$/roll")
calc("exw_model", "Modeled ex-works cost", "={fiber_cost}*(1+{uplift})+{corewrap}", CUR4, "$/roll", "Target band: $0.18-$0.24/roll.")
inp("exw_quote", "ACTUAL QUOTED ex-works (0 = use model)", 0, CUR4, "$/roll", "Once a converter quotes you, enter it here and the whole model switches to the real number.")
calc("exw", "EX-WORKS COST USED", "=IF({exw_quote}>0,{exw_quote},{exw_model})", CUR4, "$/roll", out=True)

row += 1
# --- pack & cube
sec("3. PACK CONFIGURATION & CUBE")
inp("rpp", "Rolls per pack (base case)", 30, NUM0, "rolls", "Never dropship below 24. Small packs lose money on every order.")
inp("compress", "Compression saving vs uncompressed", 0.30, PCT, "%", "HIGHEST-LEVERAGE INPUT IN THE MODEL. Compressed winding cuts cube ~30% at identical sheet count.")
inp("tare", "Carton tare weight", 0.60, NUM2, "lb", "Design the retail carton AS the shipper - saves a box, void fill and a labor step.")
inp("dim_div", "DIM divisor", 139, NUM0, "", "139 = standard retail ground. Negotiate to 166 if you can; it is worth real money on this product.")
calc("cube_roll", "Bounding cube per roll", "={roll_dia}*{roll_dia}*{sheet_w}", NUM2, "cu in")
calc("pack_lb", "Pack actual weight", "={rpp}*{roll_lb}+{tare}", NUM2, "lb")
calc("pack_cube", "Pack cube (compressed)", "={rpp}*{cube_roll}*(1-{compress})", NUM0, "cu in")
calc("pack_dim", "Pack DIM weight", "={pack_cube}/{dim_div}", NUM2, "lb")
calc("pack_bill", "PACK BILLED WEIGHT", "=MAX({pack_lb},{pack_dim})", NUM2, "lb", "Carrier bills the greater of actual and DIM.", out=True)

row += 1
# --- inbound freight
sec("4. INBOUND FREIGHT (converter to your 3PL)")
inp("mode", "Freight mode", "TL", None, "", 'Enter exactly: LTL, TL or OCEAN')
inp("rolls_pallet", "Rolls per pallet", 1920, NUM0, "rolls")
inp("pallets_tl", "Pallets per 53ft trailer", 26, NUM0, "pallets")
inp("ltl_pallet", "LTL cost per pallet", 250, CUR0, "$/pallet")
inp("tl_cost", "Truckload cost", 2800, CUR0, "$/trailer")
inp("ocean_rolls", "Rolls per 40ft container", 56160, NUM0, "rolls", "Source: Accio wholesale sourcing guide.")
inp("ocean_cost", "Ocean freight per 40ft container", 4000, CUR0, "$/container", "Door-to-door estimate. Get a real quote before comparing offshore to domestic.")
inp("duty", "Duty / tariff on goods value", 0.00, PCT, "%", "Set only for OCEAN mode. Check current HTS rate before relying on this.")
calc("inb_roll", "Inbound freight per roll",
     '=IF({mode}="LTL",{ltl_pallet}/{rolls_pallet},IF({mode}="TL",{tl_cost}/({pallets_tl}*{rolls_pallet}),{ocean_cost}/{ocean_rolls}))',
     CUR4, "$/roll", out=True)
calc("duty_roll", "Duty per roll", "={exw}*{duty}", CUR4, "$/roll")
calc("landed_roll", "LANDED COST AT 3PL", "={exw}+{inb_roll}+{duty_roll}", CUR4, "$/roll", out=True)

row += 1
# --- fulfillment
sec("5. FULFILLMENT")
inp("pickpack", "Pick & pack per order", 3.25, CUR2, "$/order")
inp("pkg", "Outbound label & packaging per order", 0.35, CUR2, "$/order")
inp("storage_pallet", "3PL storage", 22.00, CUR2, "$/pallet/mo")
inp("turns", "Inventory turns per month", 1.0, NUM2, "x", "Guarded against zero in the formula below.")
calc("storage_roll", "Storage cost per roll", "=IFERROR({storage_pallet}/{rolls_pallet}/{turns},0)", CUR4, "$/roll")

row += 1
# --- commercial
sec("6. COMMERCIAL")
inp("retail_100", "Target retail price per 100 sheets", 0.320, CUR3, "$/100 sh", "Kirkland is $0.184 and AmazonCommercial ~$0.18. Nationals are $0.30-$0.45. You are selling delivered convenience plus an honesty story.")
inp("proc_pct", "Payment processing", 0.029, PCT, "%")
inp("proc_fix", "Payment processing fixed", 0.30, CUR2, "$/order")
calc("rev_pack", "Revenue per base-case pack", "={retail_100}*{rpp}*{sheets}/100", CUR2, "$/pack", out=True)

# resolve placeholders
def resolve(t):
    out = t
    for k, v in A.items():
        out = out.replace("{" + k + "}", v)
    return out

for rr, cc, tpl in pending:
    aw.cell(rr, cc).value = resolve(tpl)

def AA(key):
    """Absolute cross-sheet reference to an assumption."""
    return f"Assumptions!{A[key]}"

# =========================================================== 3. SUPPLIER TRACKER
sw = wb.create_sheet("Supplier Tracker")
sw.sheet_view.showGridLines = False

cols = [
    ("Supplier", 26), ("Tier", 7), ("Country", 9), ("Location / Plants", 26),
    ("Website", 30), ("Private Label?", 13), ("Published MOQ", 15),
    ("Quoted MOQ (rolls)", 13), ("$/roll @ 10k", 12), ("$/roll @ 50k", 12),
    ("$/roll @ 1 TL", 12), ("Setup / plate fee", 13), ("Lead time (wks)", 13),
    ("Compressed wind?", 13), ("Blind ship?", 11), ("Sample recd", 11),
    ("S1 Price", 9), ("S2 MOQ fit", 9), ("S3 Blind ship", 10),
    ("S4 Compression", 11), ("S5 Lead time", 10), ("WEIGHTED SCORE", 14),
    ("Status", 14), ("Notes", 46),
]
for i, (h, w) in enumerate(cols, start=1):
    sw.column_dimensions[get_column_letter(i)].width = w

sw.cell(1, 1, "SUPPLIER / CONVERTER TRACKER").font = TITLE
sw.cell(2, 1, "Blue columns = you fill in as quotes arrive. Score S1-S5 on a 1-5 scale (5 = best). Weighted score ranks the field.").font = NOTE

WROW = 4
for i, (h, _) in enumerate(cols, start=1):
    c = sw.cell(WROW, i, h)
    c.font = HDR
    c.fill = FILL_HDR
    c.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
    c.border = BOX
sw.row_dimensions[WROW].height = 32

suppliers = [
    ("Royal Paper", 1, "USA", "Phoenix AZ + South Carolina", "royalpaper.us/private-label/", "Yes - core business", "Request", "",
     "Largest privately-owned US private-label tissue producer. Dual-coast plants let you run East+West 3PL off ONE supplier. START HERE."),
    ("Global Tissue Group", 1, "USA", "Hauppauge NY", "globaltissuegroup.com/private-brand-solutions", "Yes - core business", "Request", "",
     "Private brand + contract manufacturing is their entire model. Explicitly positions to help brands compete with nationals. Best East Coast partner."),
    ("Domtar Tissue", 1, "USA", "Multiple US mills", "domtar.com/tissue/retail-private-label-tissue-towel/", "Yes - retail private label div.", "Request", "",
     "Markets 'name-brand equivalent' bath tissue for private brand programs - literally your brief. Integrated pulp = stable pricing."),
    ("Solaris Paper", 1, "USA", "Green Bay WI (Asia Pulp & Paper NA)", "solarispaper.com", "Yes - premium private brand", "Request", "",
     "APP-backed, deepest fiber integration in the group. Most stable pricing if pulp rises. Best for scale-up phase."),
    ("Von Drehle", 1, "USA", "Hickory NC / Cordova TN", "vondrehle.com", "Yes", "Request", "",
     "Family-owned, aggressive on value grades, strong away-from-home crossover."),
    ("First Quality Enterprises", 1, "USA", "Lock Haven PA", "firstquality.com", "Yes - flexible programs", "Request", "",
     "ISO-certified, flexible private label programs. Retail and healthcare."),
    ("Marcal", 1, "USA", "Elmwood Park NJ", "marcalpaper.com", "Yes", "Request", "",
     "100% recycled. Costs slightly more but hands you a sustainability story with a 70-year American mill pedigree behind it."),
    ("Select Products Holdings", 2, "USA", "USA", "selectproductsholdings.com", "Yes - private label only", "Request", "",
     "Full-service converter, private-label consumer tissue exclusively."),
    ("E&L Tissue Paper", 2, "USA", "Cleveland OH", "paperindex.com (profile)", "Yes", "Lower - ask", "",
     "Smaller converter, 1-ply and 2-ply bath tissue. Good candidate for a sub-10k pilot run."),
    ("Berk International", 2, "USA", "Wilmington DE", "berkwiper.com/bulk-tissue-paper/", "Yes + contract converting", "Lower - ask", "",
     "1-ply and 2-ply, made in USA, private label plus contract converting. Pilot-friendly."),
    ("NL Bamboo", 3, "China", "China", "nlbamboo.com/solutions/retail-ecommerce-tissue-supply/", "Yes - OEM/private label", "Low - from ~500", "",
     "Dedicated retail/ecommerce program: spec dev, sampling, packaging execution. BAMBOO PRICES PREMIUM - use for process support, not the budget SKU."),
    ("Doba (reference only)", 3, "USA", "Aggregator", "doba.com/dropshipping/toilet-paper.html", "NO - generic catalog", "None", "",
     "True no-MOQ dropship but generic product; you CANNOT brand it. Arbitrage, not brand-building. Listed for completeness - does not serve the brief."),
]

start = WROW + 1
for j, s in enumerate(suppliers):
    rr = start + j
    name, tier, country, loc, web, pl, moq, qmoq, notes = s
    vals = {1: name, 2: tier, 3: country, 4: loc, 5: web, 6: pl, 7: moq}
    for cidx, v in vals.items():
        c = sw.cell(rr, cidx, v)
        c.font = BLACK
        c.border = BOX
        c.alignment = Alignment(wrap_text=True, vertical="top")
    # blue input columns 8..21
    for cidx in range(8, 22):
        c = sw.cell(rr, cidx)
        c.font = BLUE
        c.fill = FILL_INPUT
        c.border = BOX
        if cidx in (9, 10, 11):
            c.number_format = CUR4
        elif cidx == 12:
            c.number_format = CUR0
        elif cidx in (8, 13):
            c.number_format = NUM0
    # weighted score col 22
    c = sw.cell(rr, 22, f"=IFERROR(SUMPRODUCT(Q{rr}:U{rr},$Q$2:$U$2),0)")
    c.font = Font(name=FONT, size=10, bold=True)
    c.number_format = NUM2
    c.fill = FILL_OUT
    c.border = BOX
    for cidx in (23, 24):
        c = sw.cell(rr, cidx, notes if cidx == 24 else "Not contacted")
        c.font = BLUE if cidx == 23 else Font(name=FONT, size=9)
        if cidx == 23:
            c.fill = FILL_INPUT
        c.border = BOX
        c.alignment = Alignment(wrap_text=True, vertical="top")
    sw.row_dimensions[rr].height = 30

# weighting row (row 2, cols Q..U)
weights = [("Q", 0.40), ("R", 0.20), ("S", 0.15), ("T", 0.15), ("U", 0.10)]
sw.cell(2, 16, "Weights >>").font = BOLD
for col, wgt in weights:
    c = sw[f"{col}2"]
    c.value = wgt
    c.font = BLUE
    c.fill = FILL_INPUT
    c.number_format = PCT
    c.border = BOX
sw["V2"] = "=SUM(Q2:U2)"
sw["V2"].font = BOLD
sw["V2"].number_format = PCT
sw["V2"].comment = Comment("Must total 100%.", "Model")

endrow = start + len(suppliers) - 1
nr = endrow + 2
sw.cell(nr, 1, "SCORING GUIDE (enter 1-5, where 5 = best):").font = BOLD
for i, t in enumerate([
    "S1 Price - 5 = at or below $0.20/roll ex-works; 1 = above $0.30",
    "S2 MOQ fit - 5 = will run under 10,000 rolls; 1 = truckload minimum only",
    "S3 Blind ship - 5 = will hold your branded stock and blind-ship to consumers; 1 = pallet-out only",
    "S4 Compression - 5 = compressed/high-density winding available; 1 = uncompressed only",
    "S5 Lead time - 5 = under 4 weeks; 1 = over 12 weeks",
]):
    sw.cell(nr + 1 + i, 1, t).font = NOTE

nr2 = nr + 7
sw.cell(nr2, 1, "SOURCES").font = BOLD
for i, t in enumerate([
    "Supplier capabilities per company websites and ThomasNet / PaperIndex listings, accessed July 2026.",
    "MOQ market range (500 - 250,000 rolls; wholesale pricing typically at 10,000+): Accio wholesale toilet paper sourcing guide; Top Source Hygiene 2026 landed cost guide.",
    "Tier 1 = domestic private-label converter, recommended for volume. Tier 2 = smaller converter, pilot-friendly. Tier 3 = offshore / aggregator.",
]):
    sw.cell(nr2 + 1 + i, 1, t).font = NOTE

sw.freeze_panes = "B5"

# =========================================================== 4. FREIGHT RATES
fw = wb.create_sheet("Freight Rates")
fw.sheet_view.showGridLines = False
fw.column_dimensions["A"].width = 20
for i in range(2, 9):
    fw.column_dimensions[get_column_letter(i)].width = 11

fw.cell(1, 1, "PARCEL GROUND RATE TABLE").font = TITLE
fw.cell(2, 1, "PLANNING ESTIMATES ONLY - replace every cell with your negotiated carrier contract before committing capital.").font = Font(name=FONT, size=9, italic=True, color="C00000")

fw.cell(4, 1, "Billed weight (lb)").font = HDR
fw.cell(4, 1).fill = FILL_HDR
fw.cell(4, 1).border = BOX
zones = [2, 3, 4, 5, 6, 7, 8]
for i, z in enumerate(zones):
    c = fw.cell(4, 2 + i, z)
    c.font = HDR
    c.fill = FILL_HDR
    c.alignment = Alignment(horizontal="center")
    c.border = BOX
    c.number_format = NUM0

rate_rows = [
    (1,  [8.20,  8.55,  9.05,  9.60, 10.20, 10.85, 11.50]),
    (3,  [8.55,  8.95,  9.50, 10.10, 10.75, 11.45, 12.20]),
    (5,  [8.90,  9.30,  9.90, 10.60, 11.30, 12.10, 12.90]),
    (10, [9.80, 10.40, 11.30, 12.30, 13.30, 14.40, 15.50]),
    (15, [10.90, 11.70, 12.90, 14.20, 15.60, 17.00, 18.50]),
    (20, [12.10, 13.10, 14.60, 16.30, 18.00, 19.80, 21.70]),
    (25, [13.40, 14.60, 16.40, 18.40, 20.50, 22.70, 24.90]),
    (30, [14.60, 16.00, 18.10, 20.40, 22.80, 25.30, 27.90]),
    (40, [17.20, 19.10, 21.80, 24.80, 27.90, 31.20, 34.60]),
]
for j, (wt, rates) in enumerate(rate_rows):
    rr = 5 + j
    c = fw.cell(rr, 1, wt)
    c.font = BOLD
    c.border = BOX
    c.number_format = NUM0
    for i, v in enumerate(rates):
        c = fw.cell(rr, 2 + i, v)
        c.font = BLUE
        c.fill = FILL_INPUT
        c.number_format = CUR2
        c.border = BOX

nfr = 5 + len(rate_rows) + 1
fw.cell(nfr, 1, "Lookup uses MATCH type 1 (nearest weight break at or below billed weight), so weight breaks must stay in ascending order.").font = NOTE
fw.cell(nfr + 1, 1, "The 1 lb break exists so small packs still price at the carrier minimum. Without it the lookup returns nothing and small packs look free - which they are not.").font = NOTE
fw.cell(nfr + 2, 1, "Rates are modeled to approximate published ground rates inclusive of fuel and residential surcharge. They are NOT quoted rates.").font = NOTE
fw.cell(nfr + 3, 1, "Bulky-item reality check: DIM charges commonly inflate cost 20-30%, and packages over 50 lb or 108in length+girth add $15-40 in surcharges.").font = NOTE
fw.cell(nfr + 4, 1, "Multi-warehouse (East + West) typically cuts postage 15-25% by shifting orders from Zone 7-8 to Zone 1-3.").font = NOTE

_last = 4 + len(rate_rows)
RATE_TBL = f"'Freight Rates'!$B$5:$H${_last}"
RATE_WTS = f"'Freight Rates'!$A$5:$A${_last}"
RATE_ZONES = "'Freight Rates'!$B$4:$H$4"

# =========================================================== 5. LANDED COST MODEL
lw = wb.create_sheet("Landed Cost Model")
lw.sheet_view.showGridLines = False
lw.column_dimensions["A"].width = 3
lw.column_dimensions["B"].width = 44
lw.column_dimensions["C"].width = 15
lw.column_dimensions["D"].width = 12
lw.column_dimensions["E"].width = 60

lr = 2
lw.cell(lr, 2, "LANDED COST MODEL - ONE CUSTOMER ORDER").font = TITLE
lr += 1
lw.cell(lr, 2, "Parent roll to doorstep. Change the two yellow cells below; everything recalculates.").font = NOTE
lr += 2

L = {}
lpend = []

def lsec(t):
    global lr
    for col in range(2, 6):
        c = lw.cell(lr, col)
        c.fill = FILL_SECTION
        if col == 2:
            c.value = t
            c.font = SECTION
    lr += 1

def linp(key, label, val, fmt=None, unit="", note=""):
    global lr
    lw.cell(lr, 2, label).font = BOLD
    c = lw.cell(lr, 3, val)
    c.font = BLUE
    c.fill = FILL_INPUT
    c.border = BOX
    if fmt:
        c.number_format = fmt
    lw.cell(lr, 4, unit).font = NOTE
    if note:
        n = lw.cell(lr, 5, note)
        n.font = NOTE
        n.alignment = Alignment(wrap_text=True, vertical="center")
    L[key] = f"$C${lr}"
    lr += 1

def lcalc(key, label, tpl, fmt=None, unit="", note="", out=False, link=False):
    global lr
    lw.cell(lr, 2, label).font = Font(name=FONT, size=10, bold=True) if out else Font(name=FONT, size=10)
    c = lw.cell(lr, 3)
    c.font = GREEN if link else BLACK
    c.border = BOX
    if fmt:
        c.number_format = fmt
    if out:
        c.fill = FILL_OUT
        c.font = Font(name=FONT, size=10, bold=True)
    lw.cell(lr, 4, unit).font = NOTE
    if note:
        n = lw.cell(lr, 5, note)
        n.font = NOTE
        n.alignment = Alignment(wrap_text=True, vertical="center")
    L[key] = f"$C${lr}"
    lpend.append((lr, 3, tpl))
    lr += 1

lsec("SCENARIO LEVERS")
linp("rpp", "Rolls per pack", 30, NUM0, "rolls", "Override the base case here without touching the Assumptions tab.")
linp("zone", "Parcel zone", 5, NUM0, "zone 2-8", "Zone 2-3 = regional. Zone 7-8 = cross-country. This is why you split inventory East and West.")

lr += 1
lsec("A. UNIT ECONOMICS - PER ROLL")
lcalc("exw", "Ex-works cost per roll", f"={AA('exw')}", CUR4, "$/roll", link=True)
lcalc("inb", "Inbound freight per roll", f"={AA('inb_roll')}", CUR4, "$/roll", link=True)
lcalc("duty", "Duty per roll", f"={AA('duty_roll')}", CUR4, "$/roll", link=True)
lcalc("stor", "Storage per roll", f"={AA('storage_roll')}", CUR4, "$/roll", link=True)
lcalc("perroll", "Total cost per roll (pre-fulfillment)", "={exw}+{inb}+{duty}+{stor}", CUR4, "$/roll", out=True)

lr += 1
lsec("B. PACK PHYSICS")
lcalc("pk_lb", "Pack actual weight", f"={{rpp}}*{AA('roll_lb')}+{AA('tare')}", NUM2, "lb")
lcalc("pk_cube", "Pack cube (compressed)", f"={{rpp}}*{AA('cube_roll')}*(1-{AA('compress')})", NUM0, "cu in")
lcalc("pk_dim", "Pack DIM weight", f"={{pk_cube}}/{AA('dim_div')}", NUM2, "lb")
lcalc("pk_bill", "BILLED WEIGHT", "=MAX({pk_lb},{pk_dim})", NUM2, "lb", "Carrier bills the greater of the two. Note how far DIM exceeds actual.", out=True)
lcalc("dim_pen", "DIM penalty (billed vs actual)", "=IFERROR({pk_bill}/{pk_lb}-1,0)", PCT, "%", "If this is large, compression is where your money is.")

lr += 1
lsec("C. COST STACK - PER ORDER")
lcalc("c_goods", "Goods (ex-works)", "={rpp}*{exw}", CUR2, "$")
lcalc("c_inb", "Inbound freight", "={rpp}*{inb}", CUR2, "$")
lcalc("c_duty", "Duty", "={rpp}*{duty}", CUR2, "$")
lcalc("c_stor", "Storage", "={rpp}*{stor}", CUR2, "$")
lcalc("c_pp", "Pick & pack", f"={AA('pickpack')}", CUR2, "$", link=True)
lcalc("c_pkg", "Label & packaging", f"={AA('pkg')}", CUR2, "$", link=True)
lcalc("c_parcel", "Outbound parcel",
      f"=IFERROR(INDEX({RATE_TBL},MATCH({{pk_bill}},{RATE_WTS},1),MATCH({{zone}},{RATE_ZONES},0)),0)",
      CUR2, "$", "Looked up from the Freight Rates tab by billed weight and zone.")
lcalc("c_total", "TOTAL DELIVERED COST", "=SUM({c_goods}:{c_parcel})", CUR2, "$", out=True)

lr += 1
lsec("D. THE HEADLINE NUMBER")
lcalc("sheets_pack", "Sheets per pack", f"={{rpp}}*{AA('sheets')}", NUM0, "sheets")
lcalc("sqft_pack", "Square feet per pack", f"={{rpp}}*{AA('sqft_roll')}", NUM2, "sq ft", "Print on the front of the pack - it is the honest unit.")
lcalc("cost_100", "DELIVERED COST PER 100 SHEETS", "=IFERROR({c_total}/({sheets_pack}/100),0)", CUR3, "$/100 sh",
      "Compare directly against the Benchmark tab. Market floor is ~$0.18.", out=True)

lr += 1
lsec("E. MARGIN")
lcalc("revenue", "Revenue per pack", f"={AA('retail_100')}*{{sheets_pack}}/100", CUR2, "$", link=True)
lcalc("proc", "Payment processing", f"={{revenue}}*{AA('proc_pct')}+{AA('proc_fix')}", CUR2, "$")
lcalc("gp", "Gross profit per pack", "={revenue}-{c_total}-{proc}", CUR2, "$", out=True)
lcalc("gm", "GROSS MARGIN", "=IFERROR({gp}/{revenue},0)", PCT, "%",
      "Below ~25% this product cannot fund customer acquisition. If you are under, the levers are: bigger pack, compression, dual-coast 3PL.", out=True)
lcalc("be_retail", "Break-even retail per 100 sheets", "=IFERROR(({c_total}+{proc})/({sheets_pack}/100),0)", CUR3, "$/100 sh", out=True)

def lresolve(t):
    out = t
    for k, v in L.items():
        out = out.replace("{" + k + "}", v)
    return out

for rr, cc, tpl in lpend:
    lw.cell(rr, cc).value = lresolve(tpl)

# =========================================================== 6. SCENARIO: PACK x ZONE
pw = wb.create_sheet("Scenario - Pack x Zone")
pw.sheet_view.showGridLines = False
pw.column_dimensions["A"].width = 13
for i in range(2, 7):
    pw.column_dimensions[get_column_letter(i)].width = 12
for i in range(7, 23):
    pw.column_dimensions[get_column_letter(i)].width = 10

pw.cell(1, 1, "SCENARIO: ROLLS PER PACK  x  PARCEL ZONE").font = TITLE
pw.cell(2, 1, "The core answer. Rows = pack size. Columns = zone. Two output blocks: delivered cost per 100 sheets, and gross margin at your target retail price.").font = NOTE

HR = 4
heads = ["Rolls/pack", "Actual lb", "Cube cu in", "DIM lb", "Billed lb", "Pre-freight $"]
for i, h in enumerate(heads, start=1):
    c = pw.cell(HR, i, h)
    c.font = HDR
    c.fill = FILL_HDR
    c.alignment = Alignment(wrap_text=True, horizontal="center", vertical="center")
    c.border = BOX

pw.cell(HR - 1, 7, "DELIVERED COST PER 100 SHEETS").font = SECTION
for i, z in enumerate(zones):
    c = pw.cell(HR, 7 + i, z)
    c.font = HDR
    c.fill = FILL_HDR
    c.alignment = Alignment(horizontal="center")
    c.border = BOX
    c.number_format = NUM0

pw.cell(HR - 1, 15, "GROSS MARGIN % AT TARGET RETAIL").font = SECTION
for i, z in enumerate(zones):
    c = pw.cell(HR, 15 + i, z)
    c.font = HDR
    c.fill = FILL_HDR
    c.alignment = Alignment(horizontal="center")
    c.border = BOX
    c.number_format = NUM0

pack_sizes = [6, 12, 18, 24, 30, 36, 48, 60]
for j, n in enumerate(pack_sizes):
    rr = HR + 1 + j
    c = pw.cell(rr, 1, n)
    c.font = BLUE
    c.fill = FILL_INPUT
    c.number_format = NUM0
    c.border = BOX
    f = {
        2: f"=$A{rr}*{AA('roll_lb')}+{AA('tare')}",
        3: f"=$A{rr}*{AA('cube_roll')}*(1-{AA('compress')})",
        4: f"=C{rr}/{AA('dim_div')}",
        5: f"=MAX(B{rr},D{rr})",
        6: f"=$A{rr}*({AA('exw')}+{AA('inb_roll')}+{AA('duty_roll')}+{AA('storage_roll')})+{AA('pickpack')}+{AA('pkg')}",
    }
    for cidx, formula in f.items():
        c = pw.cell(rr, cidx, formula)
        c.font = BLACK
        c.border = BOX
        c.number_format = NUM2 if cidx in (2, 4, 5) else (NUM0 if cidx == 3 else CUR2)
    for i, z in enumerate(zones):
        col = 7 + i
        cl = get_column_letter(col)
        parcel = f"IFERROR(INDEX({RATE_TBL},MATCH($E{rr},{RATE_WTS},1),MATCH({cl}${HR},{RATE_ZONES},0)),0)"
        sheets_pack = f"($A{rr}*{AA('sheets')})"
        c = pw.cell(rr, col, f"=IFERROR(($F{rr}+{parcel})/({sheets_pack}/100),0)")
        c.font = BLACK
        c.number_format = CUR3
        c.border = BOX
        # margin block
        col2 = 15 + i
        cl2 = get_column_letter(col2)
        parcel2 = f"IFERROR(INDEX({RATE_TBL},MATCH($E{rr},{RATE_WTS},1),MATCH({cl2}${HR},{RATE_ZONES},0)),0)"
        rev = f"({AA('retail_100')}*{sheets_pack}/100)"
        cost = f"($F{rr}+{parcel2})"
        proc = f"({rev}*{AA('proc_pct')}+{AA('proc_fix')})"
        c = pw.cell(rr, col2, f"=IFERROR(({rev}-{cost}-{proc})/{rev},0)")
        c.font = BLACK
        c.number_format = PCT
        c.border = BOX

nrow = HR + len(pack_sizes) + 2
for i, t in enumerate([
    "READING THIS GRID:",
    "  - Move DOWN a column: bigger packs spread the fixed pick/pack and parcel cost over more sheets. This is why a 4-pack cannot be dropshipped profitably.",
    "  - Move RIGHT across a row: the same pack costs materially more to deliver cross-country. Splitting inventory East + West pulls most orders back into the left-hand columns.",
    "  - Any margin cell below ~25% will not fund customer acquisition. Fix it with pack size or compression before touching price.",
    "  - Column A is editable - change the pack sizes to whatever you actually intend to sell.",
]):
    pw.cell(nrow + i, 1, t).font = BOLD if i == 0 else NOTE

pw.freeze_panes = "B5"

# =========================================================== 7. SCENARIO: VOLUME
vw = wb.create_sheet("Scenario - Volume")
vw.sheet_view.showGridLines = False
vw.column_dimensions["A"].width = 18
for i in range(2, 10):
    vw.column_dimensions[get_column_letter(i)].width = 16

vw.cell(1, 1, "SCENARIO: ORDER VOLUME  x  FREIGHT MODE").font = TITLE
vw.cell(2, 1, "Procurement view. How landed cost per roll and total capital outlay move with order size and inbound freight mode.").font = NOTE

VH = 4
vheads = ["Order size (rolls)", "Pallets", "Goods cost", "LTL $/roll", "TL $/roll", "Ocean $/roll",
          "Landed $/roll (best mode)", "Capital outlay", "Notes"]
for i, h in enumerate(vheads, start=1):
    c = vw.cell(VH, i, h)
    c.font = HDR
    c.fill = FILL_HDR
    c.alignment = Alignment(wrap_text=True, horizontal="center", vertical="center")
    c.border = BOX
vw.row_dimensions[VH].height = 30

vols = [
    (500, "Sample / pilot run. Non-wholesale pricing - expect a premium."),
    (1000, "Small pilot. Enough to test packaging and messaging."),
    (5000, "Approaching the wholesale threshold. Push for 10k pricing."),
    (10000, "WHOLESALE PRICING THRESHOLD. Most converters price real wholesale here. ~333 x 30-roll packs."),
    (20000, "Comfortable first production run with proven demand."),
    (49920, "One full 53ft truckload (26 pallets x 1,920 rolls)."),
    (56160, "One full 40ft ocean container."),
    (99840, "Two truckloads. Negotiate a annual volume agreement at this level."),
]
for j, (n, note) in enumerate(vols):
    rr = VH + 1 + j
    c = vw.cell(rr, 1, n)
    c.font = BLUE
    c.fill = FILL_INPUT
    c.number_format = NUM0
    c.border = BOX
    cells = {
        2: (f"=IFERROR($A{rr}/{AA('rolls_pallet')},0)", NUM2),
        3: (f"=$A{rr}*{AA('exw')}", CUR0),
        4: (f"=IFERROR({AA('ltl_pallet')}*MAX(1,ROUNDUP($A{rr}/{AA('rolls_pallet')},0))/$A{rr},0)", CUR4),
        5: (f"=IFERROR({AA('tl_cost')}*MAX(1,ROUNDUP($A{rr}/({AA('pallets_tl')}*{AA('rolls_pallet')}),0))/$A{rr},0)", CUR4),
        6: (f"=IFERROR({AA('ocean_cost')}*MAX(1,ROUNDUP($A{rr}/{AA('ocean_rolls')},0))/$A{rr}+{AA('exw')}*{AA('duty')},0)", CUR4),
        7: (f"={AA('exw')}+MIN(D{rr},E{rr},F{rr})", CUR4),
        8: (f"=$A{rr}*G{rr}", CUR0),
    }
    for cidx, (formula, fmt) in cells.items():
        c = vw.cell(rr, cidx, formula)
        c.font = BLACK
        c.number_format = fmt
        c.border = BOX
        if cidx in (7, 8):
            c.fill = FILL_OUT
            c.font = Font(name=FONT, size=10, bold=True)
    c = vw.cell(rr, 9, note)
    c.font = NOTE
    c.alignment = Alignment(wrap_text=True, vertical="top")
    c.border = BOX
    vw.row_dimensions[rr].height = 28

vn = VH + len(vols) + 2
for i, t in enumerate([
    "PARTIAL LOADS ROUND UP. A 500-roll order still pays for a whole pallet, so its freight per roll is punishing. This is the real reason small first runs cost more than the quoted per-roll price suggests.",
    "The Assumptions tab uses the steady-state FULL-LOAD rate. This tab shows what your FIRST order actually costs. Use this tab for the go/no-go decision on run size.",
    "",
    "IMPORTANT - 'best mode' is a pure cost comparison and ignores feasibility.",
    "  - LTL / TL only make sense for a domestic converter. OCEAN only for an offshore one, and only with duty entered on the Assumptions tab.",
    "  - Ocean looks cheap per roll at container scale, but a 40ft container is ~$11k of goods against ~$3-5k of freight - a 30-45% freight burden, plus 6-10 weeks of lead time and tied-up cash.",
    "  - Recommendation: quote both, let the landed number decide, but weight domestic heavily for a first run. Speed and low MOQ are worth more than a cent per roll while you are still testing the brand.",
    "  - MOQ market range is 500 to 250,000 rolls; most converters price wholesale at 10,000+. Your minimum viable first run is roughly $2,000-$3,000 in goods plus plate/artwork fees.",
]):
    vw.cell(vn + i, 1, t).font = BOLD if i == 0 else NOTE

# =========================================================== 8. BENCHMARK
bw = wb.create_sheet("Benchmark")
bw.sheet_view.showGridLines = False
bw.column_dimensions["A"].width = 34
for i, w in zip(range(2, 9), [14, 12, 12, 14, 16, 16, 52]):
    bw.column_dimensions[get_column_letter(i)].width = w

bw.cell(1, 1, "COMPETITIVE BENCHMARK - COST PER 100 SHEETS").font = TITLE
bw.cell(2, 1, "Roll counts and 'Mega roll' math are marketing. This is the only honest comparison.").font = NOTE

BH = 4
bheads = ["Product", "Pack price", "Rolls", "Sheets/roll", "Total sheets", "$/100 sheets", "vs our brand", "Note"]
for i, h in enumerate(bheads, start=1):
    c = bw.cell(BH, i, h)
    c.font = HDR
    c.fill = FILL_HDR
    c.alignment = Alignment(wrap_text=True, horizontal="center", vertical="center")
    c.border = BOX
bw.row_dimensions[BH].height = 28

bench = [
    ("Kirkland Signature (Costco)", 20.99, 30, 380, "Warehouse floor price. Requires membership and a car - that gap is your opening."),
    ("AmazonCommercial Ultra Strong", 18.54, 36, 286, "36-pack, Subscribe & Save price. Your closest true competitor."),
    ("Typical grocery store brand", 12.99, 12, 264, "Illustrative. Update with your own shelf checks."),
    ("Charmin / Cottonelle (national)", 24.99, 18, 244, "Illustrative national brand. Update with your own shelf checks."),
]
for j, (name, price, rolls, sh, note) in enumerate(bench):
    rr = BH + 1 + j
    bw.cell(rr, 1, name).font = BLACK
    for cidx, v, fmt in ((2, price, CUR2), (3, rolls, NUM0), (4, sh, NUM0)):
        c = bw.cell(rr, cidx, v)
        c.font = BLUE
        c.fill = FILL_INPUT
        c.number_format = fmt
        c.border = BOX
    c = bw.cell(rr, 5, f"=C{rr}*D{rr}")
    c.font = BLACK; c.number_format = NUM0; c.border = BOX
    c = bw.cell(rr, 6, f"=IFERROR(B{rr}/(E{rr}/100),0)")
    c.font = Font(name=FONT, size=10, bold=True); c.number_format = CUR3; c.border = BOX
    c = bw.cell(rr, 7, f"=IFERROR(F{rr}-$F${BH+1+len(bench)},0)")
    c.font = BLACK; c.number_format = CUR3; c.border = BOX
    c = bw.cell(rr, 8, note)
    c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = BOX
    bw.row_dimensions[rr].height = 26

orow = BH + 1 + len(bench)
bw.cell(orow, 1, "OUR BRAND (delivered, from model)").font = Font(name=FONT, size=10, bold=True)
bw.cell(orow, 1).fill = FILL_OUT
c = bw.cell(orow, 2, "='Landed Cost Model'!" + L["c_total"])
c.font = GREEN; c.number_format = CUR2; c.fill = FILL_OUT; c.border = BOX
c = bw.cell(orow, 3, "='Landed Cost Model'!" + L["rpp"])
c.font = GREEN; c.number_format = NUM0; c.fill = FILL_OUT; c.border = BOX
c = bw.cell(orow, 4, f"={AA('sheets')}")
c.font = GREEN; c.number_format = NUM0; c.fill = FILL_OUT; c.border = BOX
c = bw.cell(orow, 5, f"=C{orow}*D{orow}")
c.font = BLACK; c.number_format = NUM0; c.fill = FILL_OUT; c.border = BOX
c = bw.cell(orow, 6, f"=IFERROR(B{orow}/(E{orow}/100),0)")
c.font = Font(name=FONT, size=10, bold=True); c.number_format = CUR3; c.fill = FILL_OUT; c.border = BOX
c = bw.cell(orow, 7, 0)
c.font = BLACK; c.number_format = CUR3; c.fill = FILL_OUT; c.border = BOX
c = bw.cell(orow, 8, "This is our DELIVERED cost (incl. parcel to the customer). The competitor rows are SHELF prices with no delivery - the comparison is deliberately conservative against us.")
c.font = NOTE; c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = BOX
bw.row_dimensions[orow].height = 40

prow = orow + 1
bw.cell(prow, 1, "OUR BRAND (target retail)").font = Font(name=FONT, size=10, bold=True)
c = bw.cell(prow, 6, f"={AA('retail_100')}")
c.font = GREEN; c.number_format = CUR3; c.fill = FILL_OUT; c.border = BOX
bw.cell(prow, 8, "Target retail from Assumptions. Should land below every national brand and above the warehouse floor.").font = NOTE

srow = prow + 2
bw.cell(srow, 1, "SOURCES").font = BOLD
for i, t in enumerate([
    "Kirkland Signature: 30 rolls x 380 sheets at $20.99 warehouse = $0.184 per 100 sheets.",
    "AmazonCommercial 2-ply Ultra Strong: 36 x 286 sheets at $18.54 with Subscribe & Save = ~$0.18 per 100 sheets (Slickdeals listings, 2026).",
    "Category context: store brands commonly match premium quality at 30-50% less (Everyday Cheapskate; Who Gives A Crap cost-per-sheet analysis).",
    "Grocery store brand and national brand rows are ILLUSTRATIVE placeholders - replace with your own shelf checks before relying on them.",
]):
    bw.cell(srow + 1 + i, 1, t).font = NOTE

wb.save("/home/user/YouTube/toilet-paper-sourcing/TP_Sourcing_and_Landed_Cost_Model.xlsx")
print("saved")
