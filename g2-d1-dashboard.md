# G2-D1 · BI Dashboard — แบบ dashboard + ข้อมูลพร้อมโหลดเข้า Power BI

> ส่วนหนึ่งของโจทย์ข้อ 8 (analysis + results) และข้อ 7 (UX/UI ฝั่ง output)
> Script: [`analysis/g2d1.py`](analysis/g2d1.py) · ผลลัพธ์ดิบ: [`analysis/g2d1-output.json`](analysis/g2d1-output.json) ·
> ตาราง star schema: [`data/bi/`](data/bi/) · ภาพตัวอย่างกราฟบนสุด: [`figures/g2d1-top-chart-preview.png`](figures/g2d1-top-chart-preview.png)
> สิ่งที่อาจารย์ขอ (คาบ 8 ต.ค.): [`brief/lecturer-verbal-brief.md`](brief/lecturer-verbal-brief.md) หัวข้อ "สิ่งที่ย้ำในคาบ 8 ต.ค."
> สถานะ: ร่างแรก 2026-10-29 · เพิ่ม `fact_customer_month` 2026-10-29 (drill ตามเดือนใช้สถานะ ณ เดือนนั้นได้) · 2026-11-05 แก้ตารางให้ผูกความสัมพันธ์ใน Power BI ได้และเติมตามมติ · **ข้อมูลพร้อมแล้ว ตัว dashboard ต้องมีคนในทีมสร้างใน Power BI** (ไฟล์ .pbix ไม่ได้สร้างให้) · ยังไม่ผ่านการตรวจของทีม

---

## 1. Dashboard นี้ตอบคำถามอะไร ใครใช้

| ผู้ใช้ (จาก G2-A4) | เปิดเมื่อไร | คำถามที่ต้องตอบได้ใน 1 นาที |
|---|---|---|
| หัวหน้าฝ่ายขาย / ผู้บริหาร | รายเดือน | ลูกค้าเงียบเพิ่มขึ้นหรือลดลง? เงินที่เสี่ยงอยู่ที่กลุ่มไหน ประเทศไหน? ต้องเพิ่มคนโทรไหม? |
| พนักงานขาย | ทุกจันทร์เช้า | สัปดาห์นี้โทรหาใคร (หน้า Worklist — ออกแบบละเอียดใน [`g2-c-ux-ui.md`](g2-c-ux-ui.md)) |

## 2. กราฟบนสุด 1 ตัว (อาจารย์: "บอกว่ากราฟบนสุดคืออะไร")

**% ลูกค้าที่เงียบเกิน 180 วัน รายเดือน** = KPI เดิมของมิติ Customer ใน BSC (G1-C3, baseline 40.64%)
มติ 2026-11-05 เปลี่ยน KPI เป็น "% ของลูกค้า active ที่กลายเป็นเงียบในรอบ 180 วัน" (baseline 30.03%) กราฟเส้นนี้ยังเป็นกราฟบนสุด เพราะเรื่องที่เล่าและตัวเลข 987 ราย ยืนอยู่บนกราฟนี้ ส่วน KPI ใหม่แสดงเป็น card และกราฟเสริมจาก `kpi_active_to_silent.csv` ไม่มีเดือนหลัง มิ.ย. 2011 เพราะต้องรอดู 180 วันข้างหน้า (ทีมตรวจตอนเห็นหน้าจอจริงอีกครั้ง)
ข้อมูล: [`data/bi/customer_month_status.csv`](data/bi/customer_month_status.csv) — ทุกสิ้นเดือน นับจากลูกค้าทุกคนที่เคยซื้อมาแล้ว ณ วันนั้น

| สิ้นเดือน | ลูกค้าที่เคยซื้อ | เงียบ >180 วัน | % | ลูกค้าประจำ 6+ ครั้งที่เงียบ |
|---|---:|---:|---:|---:|
| ธ.ค. 2010 | 4,315 | 909 | 21.07% | 18 |
| มี.ค. 2011 | 4,691 | 1,392 | 29.67% | 53 |
| พ.ค. 2011 | 4,908 | 2,220 | 45.23% | 125 |
| ส.ค. 2011 | 5,224 | 2,444 | 46.78% | 201 |
| 9 ธ.ค. 2011 (วันสุดท้าย) | 5,852 | 2,378 | **40.64%** | **205** |

**เรื่องที่กราฟนี้เล่าได้ (แบบที่อาจารย์ยกตัวอย่าง "N เดือนแรกเป็นแบบนี้ → อัปเดตเดือนถัดไป การตัดสินใจเปลี่ยน"):**
1. **ถึง มี.ค. 2011** % เงียบไต่จาก 21% → 30% — ผู้บริหารเห็นแนวโน้มแต่ยังไม่รู้ว่าเป็นใคร
2. **อัปเดต พ.ค. 2011** กระโดดเป็น 45% ใน 2 เดือน → drill down ตามเดือนที่ซื้อครั้งสุดท้าย: ลูกค้าที่เพิ่งเงียบระหว่างสิ้น มี.ค.–สิ้น พ.ค. 2011 มี **987 ราย** ซื้อครั้งสุดท้ายเดือน **ต.ค. 2010 (396), พ.ย. 2010 (563) และ ธ.ค. 2010 (28)** = ช่วงสั่งของก่อนเทศกาล และ **440 ราย** เป็นลูกค้าใหม่ที่เพิ่งซื้อครั้งแรกช่วง ต.ค.–พ.ย. 2010 นั้นเอง → การตัดสินใจที่เสนอ (ยังไม่ได้ทดสอบ): **ตามลูกค้าที่เข้ามาช่วงก่อนเทศกาลภายใน 1–2 เดือนหลังซื้อ ไม่ใช่รอ 6 เดือน**
3. **ส.ค. → ธ.ค. 2011** % เงียบลดลงเหลือ 40.64% เพราะลูกค้าใหม่ช่วงเทศกาลรอบใหม่เข้ามา **แต่ลูกค้าประจำ 6+ ครั้งที่เงียบไม่ลดลง (201 → 205 ราย)** → % รวมดูดีขึ้น แต่จำนวนลูกค้าประจำที่เงียบไม่ลด ส่วนสัดส่วนต่อลูกค้าประจำทั้งหมดลดจาก 13.83% เป็น 11.48% เพราะลูกค้าประจำเพิ่มขึ้น (201/1,453 → 205/1,786) ตัวเลขรวมตัวเดียวจึงเล่าไม่ครบ ต้อง drill ลงไปที่กลุ่มลูกค้า

⚠️ จุดก่อน ธ.ค. 2010 มีประวัติไม่ถึง 12 เดือน (ข้อมูลเริ่ม 1 ธ.ค. 2009) % ที่ไต่ขึ้นช่วงนั้นส่วนหนึ่งเป็นเพราะข้อมูลเพิ่งเริ่ม ไม่ใช่ลูกค้าหาย — ภาพตัวอย่างแรเงาช่วงนี้ไว้

ตัวเลขในข้อ 2 คำนวณจากสคริปต์แล้ว (`jump_mar_to_may_2011` ใน [`analysis/g2d1-output.json`](analysis/g2d1-output.json)) · ใน Power BI ต้อง drill ให้ได้ตัวเลขเดียวกันก่อนพูดบนเวที

## 3. เส้นทาง drill down / slice / dice / filter

```
[กราฟบนสุด] % เงียบ >180 วัน รายเดือน (เทียบเส้น baseline 40.64%)
     │ คลิกเดือน → measure จาก fact_customer_month ใช้สถานะลูกค้า "ณ สิ้นเดือนนั้น"
     │ (ไม่ใช่สถานะ ณ 9 ธ.ค. 2011) · filter newly_silent = เฉพาะคนที่เพิ่งเงียบเดือนนั้น
     ▼
[ระดับ 2] แยกตามกลุ่มลูกค้า G2-D2 — ส่วนแบ่งลูกค้า vs ส่วนแบ่งรายได้ + มูลค่าที่เสี่ยง
     │ slice: เลือก "Slipping regulars"
     ▼
[ระดับ 3] แยกตามประเทศ (UK vs ต่างประเทศ) — dice: กลุ่ม × ประเทศ
     │ filter: risk_band = High
     ▼
[ระดับ 4] ลูกค้ารายคน — ตาราง worklist (อันดับ, P, ยอด 12 เดือน, ไม่ได้ซื้อมากี่วัน vs ปกติ)
```

ทุกระดับตอบคำถามเดียวกัน ("เงินที่เสี่ยงอยู่ตรงไหน") ไม่ใช่ "1 หน้า 6 กราฟต่างคนต่างเล่า"

⚠️ `segment`, `risk_band` และ `worklist_rank` ใน `dim_customer` เป็นค่า ณ 9 ธ.ค. 2011 ไม่ใช่ ณ เดือนที่คลิก ระดับ 4 จึงใช้ตอบได้เฉพาะจุดสุดท้าย ส่วนการคลิกเดือนในอดีตจะกรองเฉพาะ measure ที่คำนวณจาก `fact_customer_month` เท่านั้น `Revenue`, `Silent %` และตาราง Worklist จากคอลัมน์ `dim_customer` จะไม่ตาม

## 4. Data model — star schema (แปลงจาก 4 ตารางของ G1-D6)

```
                 dim_date (date_key)
                        │
dim_customer ── fact_sales ── dim_product
(customer_key)  (1 แถว = 1 รายการในใบเสร็จ)  (product_key)
        │
        └──── fact_returns (ใช้ dim เดียวกัน)
fact_customer_month (ลูกค้า × สิ้นเดือน) ── dim_customer, dim_date   (สถานะลูกค้า ณ แต่ละเดือน ใช้ drill จากกราฟบนสุด)
customer_month_status, kpi_active_to_silent  (ตารางสรุป ไม่ผูกความสัมพันธ์)
```

| ไฟล์ใน `data/bi/` | แถว | หมายเหตุ |
|---|---:|---|
| `fact_sales.csv.zip` | 1,003,343 | ยอดรวม £19,655,052.81 = ยอดขายฐานใน G2-B · 226,764 แถวไม่มี Customer ID → `customer_key = 0` ("Unknown") เพื่อให้ยอดรวมตรง · มีรายการปรับปรุงหนี้ 1 แถว (ข้อ 6) |
| `fact_returns.csv.zip` | 17,915 | มูลค่า −£716,495.53 = คืนของจริง 3.65% ใน G2-B · 87 แถว (−£1,406.13) ของลูกค้าที่ไม่มียอดขายในฐาน ถูกรวมไว้ที่ `customer_key = 0` เพื่อให้ผูกความสัมพันธ์ได้ ยอดรวมไม่เปลี่ยน |
| `dim_customer.csv` | 5,853 | 5,852 ราย + แถว Unknown · มี segment (G2-D2), RFM (G2-B2), `p_silent_180` / `risk_band` / `worklist_rank` / `worklist_top50` / `value_12m_gbp` (G2-D3), `status` |
| `dim_product.csv` | 4,741 | รหัสสินค้า → ชื่อที่ใช้บ่อยสุด · แปลงรหัสเป็นตัวพิมพ์ใหญ่และตัดช่องว่าง เพราะ Power BI ไม่แยกตัวพิมพ์ในความสัมพันธ์: StockCode เดิม 4,898 รหัส เหลือ 4,727 + สินค้าที่มีแค่รายการคืน 14 รหัส (จำนวนสินค้าใน Goal 1 ยังเป็นการนับรหัสดิบ) |
| `dim_date.csv` | 739 | วัน → สัปดาห์ → เดือน → ไตรมาส → ปี (มิติ Time ที่แผนบอกว่าต้องเพิ่ม) |
| `customer_month_status.csv` | 19 | กราฟบนสุด |
| `kpi_active_to_silent.csv` | 14 | KPI ใหม่: ลูกค้า active ณ วันตัดที่เงียบใน 180 วันถัดไป · 12 จุดต้นเดือน + วันตัด G2-D3 อีก 2 จุด สคริปต์ตรวจแล้วว่าตรง 48.12% และ 30.03% |
| `fact_customer_month.csv.zip` | 86,764 | ลูกค้า × 19 จุดเวลา: ไม่ได้ซื้อมากี่วัน, จำนวนใบถึงตอนนั้น, ยอด 12 เดือนย้อนหลัง, `status` (Active / Silent >180d), `newly_silent`, `active_2_points_ago`, `first_order_month`, `last_order_month`, `regular_6plus`, `date_key` · สคริปต์ตรวจแล้วว่ารวมกลับได้ตัวเลขเดียวกับ `customer_month_status` ทุกเดือน |

`risk_band` ใน dim_customer: High (P ≥ 50%) 966 ราย · Medium (30–50%) 603 · Low (< 30%) 1,905 · Already silent 2,378
(ใช้เป็นระดับ ไม่โชว์เป็นเปอร์เซ็นต์ เพราะ P สูงกว่าความจริง — ดู [`g2-d3-classification.md`](g2-d3-classification.md) ข้อ 5)

**ทำไมใช้ Power BI (มติ 2026-11-05):** ไฟล์ดิบ 1,067,371 แถวเกินขีดจำกัด Excel (1,048,576 แถวต่อชีต) ส่วน fact_sales 1,003,343 แถวยังใส่ชีตเดียวได้แต่เหลือที่ไม่มาก · Power BI โหลดหลายตารางแล้วผูกความสัมพันธ์ได้โดยไม่ต้อง merge

## 5. วิธีสร้างใน Power BI

> ตารางผ่านการตรวจด้วยสคริปต์แล้ว (key ครบทุกความสัมพันธ์, ยอดรวมตรง) แต่ **Power Query, ความสัมพันธ์ และ DAX ด้านล่างยังไม่ได้ลองรันใน Power BI จริง** คนสร้างต้องเทียบตัวเลขกับข้อ 5.5 ก่อนใช้

### 5.1 เตรียมไฟล์

ใช้ **Power BI Desktop** เพราะต้องผูกหลายตาราง · แตก zip ทั้งสามไฟล์ไว้ในโฟลเดอร์ `data/bi/` เดียวกัน (ใน repo เก็บเป็น zip)

```powershell
cd "<โฟลเดอร์ term-assignment>\data\bi"
Expand-Archive fact_sales.csv.zip . -Force
Expand-Archive fact_returns.csv.zip . -Force
Expand-Archive fact_customer_month.csv.zip . -Force
```

### 5.2 โหลดตาราง

อย่าใช้ Get data → Text/CSV แบบตรวจชนิดข้อมูลอัตโนมัติ เพราะรหัสสินค้าและวันที่อาจถูกอ่านผิด โดยเฉพาะเครื่องที่ตั้งภาษาไทย ให้ใช้ [`data/bi/powerbi-queries.pq`](data/bi/powerbi-queries.pq) ซึ่งกำหนดชนิดทุกคอลัมน์ไว้แล้ว:

1. Transform data → Manage Parameters → สร้าง parameter ชนิด Text ชื่อ `BiFolder` ใส่ path ของ `data\bi\` โดยมี `\` ปิดท้าย
2. New Source → Blank Query → Advanced Editor วางแต่ละบล็อกจากไฟล์ แล้วตั้งชื่อ query ตามหัวบล็อก ทำครบ 8 ตาราง → Close & Apply

### 5.3 ความสัมพันธ์

เป็น many-to-one จาก fact ไป dim ทิศทางกรองทางเดียวทุกเส้น:

| จาก | ไป |
|---|---|
| `fact_sales[customer_key]`, `fact_returns[customer_key]`, `fact_customer_month[customer_key]` | `dim_customer[customer_key]` |
| `fact_sales[product_key]`, `fact_returns[product_key]` | `dim_product[product_key]` |
| `fact_sales[date_key]`, `fact_returns[date_key]`, `fact_customer_month[date_key]` | `dim_date[date_key]` |

`customer_month_status` และ `kpi_active_to_silent` ไม่ต้องผูก · ปิด Autodetect relationships หรือเข้า Model view ตรวจแล้วลบเส้นที่ระบบผูกเกินมา · ปิด Auto date/time · **Mark `dim_date` เป็น date table ด้วยคอลัมน์ `date`** ถ้าไม่ทำ `Net sales last year` จะว่าง เพราะความสัมพันธ์ผูกที่ `date_key` · ตั้ง `month_name` ให้ Sort by `month` · สร้าง hierarchy ปี → `year_quarter` → `year_month` → `date`

### 5.4 Measures (DAX)

```
Revenue = SUM(fact_sales[line_total_gbp])
Returns = SUM(fact_returns[line_total_gbp])
Net sales = [Revenue] + [Returns]
Net sales last year = CALCULATE([Net sales], SAMEPERIODLASTYEAR(dim_date[date]))
Net sales YoY % = DIVIDE([Net sales] - [Net sales last year], [Net sales last year])
Return rate % = DIVIDE(-[Returns], [Revenue])
Customers = CALCULATE(DISTINCTCOUNT(fact_sales[customer_key]), KEEPFILTERS(dim_customer[customer_key] <> 0))
Silent % = DIVIDE(CALCULATE(COUNTROWS(dim_customer), KEEPFILTERS(dim_customer[status] = "Silent >180d")),
                  CALCULATE(COUNTROWS(dim_customer), KEEPFILTERS(dim_customer[customer_key] <> 0)))
Silent % (as of month) = DIVIDE(CALCULATE(COUNTROWS(fact_customer_month), fact_customer_month[status] = "Silent >180d"),
                                COUNTROWS(fact_customer_month))
Silent since 2 points ago = CALCULATE(COUNTROWS(fact_customer_month), fact_customer_month[status] = "Silent >180d",
                                      fact_customer_month[active_2_points_ago] = TRUE())
Silent value as of month = CALCULATE(SUM(fact_customer_month[spend_last_12m_gbp]), fact_customer_month[status] = "Silent >180d")
Flagged customers = CALCULATE(COUNTROWS(dim_customer), KEEPFILTERS(dim_customer[risk_band] = "High"))
Top 50 value 12m = CALCULATE(SUM(dim_customer[value_12m_gbp]), KEEPFILTERS(dim_customer[worklist_top50] = TRUE()))
KPI baseline % = CALCULATE(MAX(kpi_active_to_silent[pct]), kpi_active_to_silent[kind] = "G2-D3 test (baseline)")
```

`newly_silent` ยังอยู่ในตาราง แต่ห้ามรวม เม.ย. + พ.ค. เป็นตัวเลขบนเวที เพราะจะได้ 1,023 ราย ไม่ใช่ 987 ราย

`Net sales YoY %` ใช้ได้ตั้งแต่ ธ.ค. 2010 เพราะข้อมูลเริ่ม ธ.ค. 2009 แถวระดับปี 2010 จึงเทียบกับปีก่อนได้แค่เดือนเดียว · ธ.ค. 2011 เทียบวันที่ 1–9 กับช่วงเดียวกันของปีก่อน

### 5.5 ตัวเลขที่ต้องได้

ถ้าไม่ตรง แปลว่าการโหลด ความสัมพันธ์ หรือ filter ผิด (ค่าอยู่ใน `powerbi_checks` และ `jump_mar_to_may_2011` ของ [`analysis/g2d1-output.json`](analysis/g2d1-output.json))

| ตรวจ | Filter | ต้องได้ |
|---|---|---:|
| `Revenue` | ไม่มี | £19,655,052.81 |
| `Returns` | ไม่มี | −£716,495.53 |
| `Customers` | ไม่มี | 5,852 |
| `Silent %` | ไม่มี | 40.64% |
| `Flagged customers` | ไม่มี | 966 |
| `Top 50 value 12m` | ไม่มี | £116,303.26 |
| `KPI baseline %` | ไม่มี | 30.03 |
| `Silent % (as of month)` | `fact_customer_month[year_month]` = 2011-05 | 45.23% |
| `Silent since 2 points ago` | `fact_customer_month[year_month]` = 2011-05 | 987 |
| เหมือนแถวบน แยกตาม `last_order_month` | 2011-05 | 2010-10 = 396 · 2010-11 = 563 · 2010-12 = 28 |
| `Net sales` / `Net sales last year` | `dim_date[year_month]` = 2011-11 | £1,427,124.54 / £1,394,601.80 |

### 5.6 หน้าที่ต้องมี

1. **หน้า 1 Overview**
   - กราฟเส้นบนสุด: `Silent % (as of month)` ตาม `fact_customer_month[year_month]` พร้อมเส้นคงที่ 40.64%
   - card: `KPI baseline %` และกราฟเส้น `kpi_active_to_silent[pct]` เฉพาะ `kind = month_end`
   - ด้านล่าง: ส่วนแบ่งลูกค้าเทียบรายได้ตาม `segment` (ตัด `customer_key = 0` ออก) · ประเทศจาก `dim_customer[country]` · `Net sales` เทียบ `Net sales last year` รายเดือน
   - slicer: segment, risk_band, country, ปี
2. **หน้า 2 Worklist:** ตารางจาก `dim_customer` กรอง `worklist_top50 = True` เรียงตาม `worklist_rank` แสดงระดับความเสี่ยง, `value_12m_gbp`, `recency_days`, `avg_days_between_orders` · ใส่ drill-through จากหน้า 1

## 6. ข้อจำกัดที่ต้องพูดเอง

- `fact_sales` มีรายการปรับปรุงหนี้ `A563185` (รหัส `B`, "Adjust bad debt", +£11,062.06, ไม่มี Customer ID) ซึ่งไม่ใช่การขายสินค้า ยอดขายฐาน £19,655,052.81 รวมแถวนี้ ตัวเลขระดับลูกค้าไม่กระทบ
- dashboard แสดงสถานะ ณ อดีต (2009–2011) — "อัปเดตรายเดือน" ในการนำเสนอเป็นการจำลองด้วยการเลื่อนวันตัด ไม่ใช่ข้อมูลสด
- `customer_month_status` คิด % จากลูกค้าทุกคนที่เคยซื้อ ลูกค้าเก่าที่หายไปนานจึงค้างอยู่ในตัวหารตลอด — ตัวเลขนี้จึงขยับด้วยเหตุอื่นที่ไม่ใช่ผลของระบบ (ลูกค้าใหม่ ฤดูกาล) ควรดูคู่กับจำนวนลูกค้าประจำที่เงียบ (คอลัมน์ `silent_regulars_6plus`)
- ตัวเลขระดับลูกค้าครอบคลุม 86.84% ของยอดขาย (ลูกค้าที่มี ID)
- ลูกค้า 12 รายมียอดขายมากกว่า 1 ประเทศ แต่ `dim_customer[country]` เก็บได้ค่าเดียว กราฟที่แยกยอดตามประเทศจึงอาจต่างจาก `fact_sales[country]` เล็กน้อย

## ยังไม่ได้ทำ

- [ ] สร้าง dashboard จริงใน Power BI ตามข้อ 5 (ต้องเป็นคนในทีม) เทียบตัวเลขข้อ 5.5 แล้วเก็บภาพหน้าจอไว้ใน `figures/`
- [ ] drill ใน Power BI ให้ได้ตัวเลขข้อ 2.2 ตรงกับสคริปต์ — ระวังนิยาม: "เงียบ ณ สิ้น พ.ค. แต่ยัง active ณ สิ้น มี.ค." = **987** ราย ส่วนผลรวม `newly_silent` ของ เม.ย. + พ.ค. = 432 + 591 = **1,023** ราย (มากกว่าเพราะนับคนที่เพิ่งเงียบเดือน เม.ย. แล้วกลับมาซื้อก่อนสิ้น พ.ค. ด้วย) · มติ 2026-11-05: ใช้ 987 ราย
- [x] เครื่องมือ: Power BI (มติ 2026-11-05) · ยังไม่ได้เลือกคนสร้าง
