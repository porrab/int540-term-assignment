# G2-D1 · BI Dashboard — แบบ dashboard + ข้อมูลพร้อมโหลดเข้า Power BI

> ส่วนหนึ่งของโจทย์ข้อ 8 (analysis + results) และข้อ 7 (UX/UI ฝั่ง output)
> Script: [`analysis/g2d1.py`](analysis/g2d1.py) · ผลลัพธ์ดิบ: [`analysis/g2d1-output.json`](analysis/g2d1-output.json) ·
> ตาราง star schema: [`data/bi/`](data/bi/) · ภาพตัวอย่างกราฟบนสุด: [`figures/g2d1-top-chart-preview.png`](figures/g2d1-top-chart-preview.png)
> สิ่งที่อาจารย์ขอ (คาบ 8 ต.ค.): [`brief/lecturer-verbal-brief.md`](brief/lecturer-verbal-brief.md) หัวข้อ "สิ่งที่ย้ำในคาบ 8 ต.ค."
> สถานะ: ร่างแรก 2026-10-29 · เพิ่ม `fact_customer_month` 2026-10-29 (drill ตามเดือนใช้สถานะ ณ เดือนนั้นได้) · **ข้อมูลและแบบพร้อมแล้ว ตัว dashboard ต้องมีคนในทีมสร้างใน Power BI** (Claude สร้างไฟล์ .pbix ไม่ได้) · ยังไม่ผ่านการตรวจของทีม

---

## 1. Dashboard นี้ตอบคำถามอะไร ใครใช้

| ผู้ใช้ (จาก G2-A4) | เปิดเมื่อไร | คำถามที่ต้องตอบได้ใน 1 นาที |
|---|---|---|
| หัวหน้าฝ่ายขาย / ผู้บริหาร | รายเดือน | ลูกค้าเงียบเพิ่มขึ้นหรือลดลง? เงินที่เสี่ยงอยู่ที่กลุ่มไหน ประเทศไหน? ต้องเพิ่มคนโทรไหม? |
| พนักงานขาย | ทุกจันทร์เช้า | สัปดาห์นี้โทรหาใคร (หน้า Worklist — ออกแบบละเอียดใน [`g2-c-ux-ui.md`](g2-c-ux-ui.md)) |

## 2. กราฟบนสุด 1 ตัว (อาจารย์: "บอกว่ากราฟบนสุดคืออะไร")

**% ลูกค้าที่เงียบเกิน 180 วัน รายเดือน** = KPI มิติ Customer ใน BSC (G1-C3, baseline 40.64%)
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
2. **อัปเดต พ.ค. 2011** กระโดดเป็น 45% ใน 2 เดือน → drill down ตามเดือนที่ซื้อครั้งสุดท้าย: ลูกค้าที่เพิ่งเงียบระหว่างสิ้น มี.ค.–สิ้น พ.ค. 2011 มี **987 ราย** ซื้อครั้งสุดท้ายเดือน **ต.ค. 2010 (396) และ พ.ย. 2010 (563)** = ช่วงสั่งของก่อนเทศกาล และ **440 ราย** เป็นลูกค้าใหม่ที่เพิ่งซื้อครั้งแรกช่วง ต.ค.–พ.ย. 2010 นั้นเอง → การตัดสินใจที่เสนอ (ยังไม่ได้ทดสอบ): **ตามลูกค้าที่เข้ามาช่วงก่อนเทศกาลภายใน 1–2 เดือนหลังซื้อ ไม่ใช่รอ 6 เดือน**
3. **ส.ค. → ธ.ค. 2011** % เงียบลดลงเหลือ 40.64% เพราะลูกค้าใหม่ช่วงเทศกาลรอบใหม่เข้ามา **แต่ลูกค้าประจำ 6+ ครั้งที่เงียบไม่ลดลง (201 → 205 ราย)** → % รวมดูดีขึ้นแต่ปัญหาจริงไม่ได้ดีขึ้น นี่คือเหตุผลที่ต้อง drill ลงไปที่กลุ่มลูกค้า ไม่ดูแค่ตัวเลขรวม

⚠️ จุดก่อน ธ.ค. 2010 มีประวัติไม่ถึง 12 เดือน (ข้อมูลเริ่ม 1 ธ.ค. 2009) % ที่ไต่ขึ้นช่วงนั้นส่วนหนึ่งเป็นเพราะข้อมูลเพิ่งเริ่ม ไม่ใช่ลูกค้าหาย — ภาพตัวอย่างแรเงาช่วงนี้ไว้

ตัวเลขในข้อ 2 คำนวณจากสคริปต์แล้ว (`jump_mar_to_may_2011` ใน [`analysis/g2d1-output.json`](analysis/g2d1-output.json)) · ใน Power BI ต้อง drill ให้ได้ตัวเลขเดียวกันก่อนพูดบนเวที

## 3. เส้นทาง drill down / slice / dice / filter

```
[กราฟบนสุด] % เงียบ >180 วัน รายเดือน (เทียบเส้น baseline 40.64%)
     │ คลิกเดือน → ทุกระดับข้างล่างใช้สถานะลูกค้า "ณ สิ้นเดือนนั้น" จาก fact_customer_month
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

## 4. Data model — star schema (แปลงจาก 4 ตารางของ G1-D6)

```
                 dim_date (date_key)
                        │
dim_customer ── fact_sales ── dim_product
(customer_key)  (1 แถว = 1 รายการในใบเสร็จ)  (product_key)
        │
        └──── fact_returns (ใช้ dim เดียวกัน)
fact_customer_month (ลูกค้า × สิ้นเดือน) ── dim_customer   (สถานะลูกค้า ณ แต่ละเดือน ใช้ drill จากกราฟบนสุด)
customer_month_status  (ตารางสรุปรายเดือน ไม่ผูกความสัมพันธ์ ใช้วาดกราฟบนสุด)
```

| ไฟล์ใน `data/bi/` | แถว | หมายเหตุ |
|---|---:|---|
| `fact_sales.csv.zip` | 1,003,343 | ยอดรวม £19,655,052.81 = ยอดขายฐานใน G2-B · 226,764 แถวไม่มี Customer ID → `customer_key = 0` ("Unknown") เพื่อให้ยอดรวมตรง |
| `fact_returns.csv.zip` | 17,915 | มูลค่า −£716,495.53 = คืนของจริง 3.65% ใน G2-B |
| `dim_customer.csv` | 5,853 | 5,852 ราย + แถว Unknown · มี segment (G2-D2), RFM (G2-B2), `p_silent_180` / `risk_band` / `worklist_rank` (G2-D3), `status` |
| `dim_product.csv` | 4,898 | StockCode → ชื่อสินค้าที่ใช้บ่อยสุด |
| `dim_date.csv` | 739 | วัน → สัปดาห์ → เดือน → ไตรมาส → ปี (มิติ Time ที่แผนบอกว่าต้องเพิ่ม) |
| `customer_month_status.csv` | 19 | กราฟบนสุด |
| `fact_customer_month.csv.zip` | 86,764 | ลูกค้า × 19 จุดเวลา: ไม่ได้ซื้อมากี่วัน, จำนวนใบถึงตอนนั้น, ยอด 12 เดือนย้อนหลัง, `status` (Active / Silent >180d), `newly_silent`, `regular_6plus` · สคริปต์ตรวจแล้วว่ารวมกลับได้ตัวเลขเดียวกับ `customer_month_status` ทุกเดือน |

`risk_band` ใน dim_customer: High (P ≥ 50%) 966 ราย · Medium (30–50%) 603 · Low (< 30%) 1,905 · Already silent 2,378
(ใช้เป็นระดับ ไม่โชว์เป็นเปอร์เซ็นต์ เพราะ P สูงกว่าความจริง — ดู [`g2-d3-classification.md`](g2-d3-classification.md) ข้อ 5)

**ทำไมเอียงไปทาง Power BI:** ไฟล์ดิบ 1,067,371 แถวเกินขีดจำกัด Excel (1,048,576 แถวต่อชีต) ส่วน fact_sales 1,003,343 แถวยังใส่ชีตเดียวได้แต่เหลือที่ไม่มาก · Power BI ผูกหลายตารางให้เองโดยไม่ต้อง merge
(อาจารย์บอกว่า Excel กับ Power BI "แทบไม่ต่างกัน" ไม่บังคับ — ถ้าทีมเลือก Excel ใช้ Power Pivot data model ได้)

## 5. วิธีสร้างใน Power BI (ทำตามได้ ไม่ต้องเขียนโค้ด)

1. แตก zip ทั้งสามไฟล์ใน `data/bi/` → Power BI Desktop หรือ Power BI ออนไลน์ใน M365 ของมหาวิทยาลัย → **Get data → Text/CSV** โหลดทั้ง 7 ไฟล์
2. **Model view** ลากความสัมพันธ์ (ทุกเส้นเป็น many-to-one จาก fact ไป dim):
   `fact_sales[customer_key] → dim_customer[customer_key]` · `fact_sales[product_key] → dim_product[product_key]` · `fact_sales[date_key] → dim_date[date_key]` · ทำแบบเดียวกันกับ `fact_returns` · `fact_customer_month[customer_key] → dim_customer[customer_key]`
3. **สร้าง hierarchy** ใน dim_date: year → year_quarter → year_month → date
4. **Measures (DAX)** ที่ต้องมี:
   ```
   Revenue = SUM(fact_sales[line_total_gbp])
   Customers = DISTINCTCOUNT(fact_sales[customer_key])
   Silent % = DIVIDE(COUNTROWS(FILTER(dim_customer, dim_customer[status] = "Silent >180d")),
                     COUNTROWS(FILTER(dim_customer, dim_customer[customer_key] <> 0)))
   Flagged customers = CALCULATE(COUNTROWS(dim_customer), dim_customer[risk_band] = "High")
   Return rate % = DIVIDE(-SUM(fact_returns[line_total_gbp]), [Revenue])
   Silent % (as of month) = DIVIDE(CALCULATE(COUNTROWS(fact_customer_month), fact_customer_month[status] = "Silent >180d"),
                                   COUNTROWS(fact_customer_month))
   Newly silent = CALCULATE(COUNTROWS(fact_customer_month), fact_customer_month[newly_silent] = TRUE())
   ```
5. **หน้า 1 — Overview:** กราฟเส้นบนสุด = measure `Silent % (as of month)` ตาม `fact_customer_month[year_month]` (ตัวเลขเท่ากับ `customer_month_status.silent_180_pct`) — ใช้ตารางนี้แทน เพื่อให้คลิกเดือนแล้วกราฟอื่นกรองตาม + เส้นคงที่ 40.64% · ด้านล่าง: กราฟแท่งส่วนแบ่งลูกค้า vs รายได้ตาม `segment` · แผนที่หรือแท่งตาม `country` · slicer: segment, risk_band, country, ปี
6. **หน้า 2 — Worklist:** ตารางจาก dim_customer กรอง `risk_band = High` เรียงตาม `worklist_rank` · ใส่ drill-through จากหน้า 1 (คลิกขวาที่กลุ่ม/ประเทศ → ไปหน้ารายชื่อ)
7. ตรวจว่า Revenue รวม = £19,655,052.81 และ Silent % = 40.64% ถ้าไม่ตรง แปลว่าความสัมพันธ์หรือ filter ผิด

## 6. ข้อจำกัดที่ต้องพูดเอง

- dashboard แสดงสถานะ ณ อดีต (2009–2011) — "อัปเดตรายเดือน" ในการนำเสนอเป็นการจำลองด้วยการเลื่อนวันตัด ไม่ใช่ข้อมูลสด
- `customer_month_status` คิด % จากลูกค้าทุกคนที่เคยซื้อ ลูกค้าเก่าที่หายไปนานจึงค้างอยู่ในตัวหารตลอด — ตัวเลขนี้จึงขยับด้วยเหตุอื่นที่ไม่ใช่ผลของระบบ (ลูกค้าใหม่ ฤดูกาล) ควรดูคู่กับจำนวนลูกค้าประจำที่เงียบ (คอลัมน์ `silent_regulars_6plus`)
- ตัวเลขระดับลูกค้าครอบคลุม 86.84% ของยอดขาย (ลูกค้าที่มี ID)

## ยังไม่ได้ทำ

- [ ] สร้าง dashboard จริงใน Power BI ตามข้อ 5 (ต้องเป็นคนในทีม) แล้วเก็บภาพหน้าจอไว้ใน `figures/`
- [ ] drill ใน Power BI ให้ได้ตัวเลขข้อ 2.2 ตรงกับสคริปต์ — ระวังนิยาม: "เงียบ ณ สิ้น พ.ค. แต่ยัง active ณ สิ้น มี.ค." = **987** ราย ส่วนผลรวม `newly_silent` ของ เม.ย. + พ.ค. = 432 + 591 = **1,023** ราย (มากกว่าเพราะนับคนที่เพิ่งเงียบเดือน เม.ย. แล้วกลับมาซื้อก่อนสิ้น พ.ค. ด้วย) · มติ 2026-11-05: ใช้ 987 ราย
- [x] เครื่องมือ: Power BI (มติ 2026-11-05) · ยังไม่ได้เลือกคนสร้าง
