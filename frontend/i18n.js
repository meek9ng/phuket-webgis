/* ═══════════════════════════════════════════════════════
   Phuket WebGIS — i18n (TH / EN)
   =================================================================== */

const I18N_DICT = {
  en: {
    // ── Common / nav ──────────────────────────────────
    'nav.about': '01 About',
    'nav.features': '02 Features',
    'nav.materials': '03 Materials',
    'nav.workflow': '04 Workflow',
    'nav.open_map': 'Open Map',
    'nav.back_home': 'Back to home',
    'nav.toggle_theme': 'Toggle light / dark theme',
    'nav.toggle_lang': 'Switch language (TH / EN)',

    // ── Hero ──────────────────────────────────────────
    'hero.meta': 'Phuket Province — Thailand · 2018 / 2026',
    'hero.title_a': 'Phuket',
    'hero.title_b': 'WebGIS.',
    'hero.lead': 'An editorial study of land use and livability — built from nine years of Sentinel-2 imagery, 244 016 OpenStreetMap points, and a 250 m analysis grid.',
    'hero.cta_launch': 'Launch the map',
    'hero.cta_scroll': 'Scroll to read',

    // ── About ─────────────────────────────────────────
    'about.kicker': 'About',
    'about.title_a': 'An island,',
    'about.title_b': 'observed at 250 m resolution.',
    'about.lead': "A 543 km² island province on Thailand's southwest Andaman coast, made up of three districts and home to one of Southeast Asia's most active tourism economies.",
    'about.p1_html': 'Phuket sits in the Andaman Sea, connected to mainland Thailand by the Sarasin Bridge. Its three districts — <b>Mueang Phuket</b>, <b>Kathu</b>, and <b>Thalang</b> — host beaches, dense urban centres, mountainous interior forest, and rapidly expanding peri-urban zones.',
    'about.p2_html': 'Since 2010, Phuket has experienced explosive urbanization driven by tourism, second-home development, and infrastructure investment. This has transformed the land cover, increased urban-heat-island pressure, and reshaped accessibility to public services.',
    'about.p3_html': 'This WebGIS provides a transparent, data-driven view of <b>where</b> change is happening, <b>how fast</b>, and <b>how it affects livability</b> — across every 250 m × 250 m cell of the island, every year from 2018 through 2026.',
    'about.stat_area': 'km² area',
    'about.stat_pop': 'population',
    'about.stat_districts': 'districts',
    'about.stat_visitors': 'visitors / yr',
    'about.stat_cells': 'grid cells',
    'about.stat_years': 'years observed',

    'bignum1.cap_top': 'Study area',
    'bignum1.cap': 'Phuket Province · three districts · monitored continuously across nine years',

    // ── Features ──────────────────────────────────────
    'features.kicker': 'Features',
    'features.title_a': 'Six lenses on a',
    'features.title_b': 'changing island.',
    'features.lead': 'Switch basemaps, animate land-cover change year-by-year, click any grid cell to see its full profile, and discover hotspots and risk zones at a glance.',
    'features.f1_title': 'Time-lapse imagery',
    'features.f1_body': 'Sentinel-2 true-color and classified land-cover overlays for every year from 2018 to 2026, with smooth opacity blending.',
    'features.f2_title': '250 m analysis grid',
    'features.f2_body': '9 644 cells, colour-coded on demand by livability, growth, density, urban-heat-island proxy, or NDVI.',
    'features.f3_title': '244 016 POIs',
    'features.f3_body': 'Medical, recreation, living, transport, and education facilities — clustered, filterable by category, mapped to every cell.',
    'features.f4_title': 'Live statistics',
    'features.f4_body': 'Inline SVG charts for land-cover composition, built-up trend, accessibility deciles, and POI density distributions.',
    'features.f5_title': 'Hotspot navigator',
    'features.f5_body': 'Top livability cells, fastest-growing cells, and risk cells — one click flies you straight to the location.',
    'features.f6_title': 'Per-cell trends',
    'features.f6_body': 'Click any cell to see its land-cover composition evolve across all nine years as a stacked area chart.',

    'bignum2.cap_top': 'Resolution',
    'bignum2.cap': '250 m × 250 m fishnet · zonal statistics computed for every year of the study',

    // ── Materials ─────────────────────────────────────
    'materials.kicker': 'Materials',
    'materials.title_a': 'Tools & data',
    'materials.title_b': 'behind the map.',
    'materials.lead': 'Everything used to build this WebGIS — from satellite imagery acquisition to the final interactive frontend.',
    'materials.m1_sub': 'Stage 01',
    'materials.m1_title': 'Software & editors',
    'materials.m2_sub': 'Stage 02',
    'materials.m2_title': 'Python libraries',
    'materials.m3_sub': 'Stage 03',
    'materials.m3_title': 'Web frontend',
    'materials.m4_sub': 'Stage 04',
    'materials.m4_title': 'Source data',
    'materials.m5_sub': 'Stage 05',
    'materials.m5_title': 'Derived data',
    'materials.m6_sub': 'Hardware',
    'materials.m6_title': 'Compute',

    'bignum3.cap_top': 'Coverage',
    'bignum3.cap': 'Medical · Recreation · Living · Transport · Education — sourced from OpenStreetMap',

    // ── Workflow ──────────────────────────────────────
    'workflow.kicker': 'Workflow',
    'workflow.title_a': 'Nine steps,',
    'workflow.title_b': 'raw pixels',
    'workflow.title_c': 'to live map.',
    'workflow.lead': 'From raw Sentinel-2 scenes to a polished interactive WebGIS — each step feeds the next, with all intermediate outputs preserved for reproducibility.',
    'workflow.s1_title': 'Acquire raw data',
    'workflow.s1_body': 'Download Sentinel-2 L2A scenes (one cloud-free composite per year), the OpenStreetMap extract for southern Thailand, and the Phuket administrative polygon.',
    'workflow.s2_title': 'Pre-process rasters',
    'workflow.s2_body': 'Apply cloud masks, build a median composite per year, classify pixels into 4 classes (built / vegetation / water / bare) using a supervised model, then reproject to UTM Zone 47 N (EPSG:32647).',
    'workflow.s3_title': 'Build the analysis grid',
    'workflow.s3_body': 'Generate a 250 m × 250 m fishnet over the study area (9 644 cells), then run zonal statistics from each yearly raster to populate per-cell land-cover fractions plus NDVI and UHI proxy.',
    'workflow.s4_title': 'Enrich with OpenStreetMap',
    'workflow.s4_body': 'Spatial-join 244 016 OSM POIs into 5 categories per cell, compute distances to nearest medical / education / main road, derive POI density, Gini-Simpson diversity, and a composite livability score (0–100).',
    'workflow.s5_title': 'Export web-ready files',
    'workflow.s5_body': 'Re-project to WGS84, write GeoJSON for grid / POIs / roads, render PNG image overlays, and emit summary CSVs and a single JSON of headline KPIs.',
    'workflow.s6_title': 'Build the FastAPI backend',
    'workflow.s6_body_html': 'Expose <code>/api/stats</code>, <code>/api/grid</code>, <code>/api/pois</code>, <code>/api/roads</code> and 5 chart endpoints; mount <code>/data</code> for static files; serve the SPA from the root.',
    'workflow.s7_title': 'Build the frontend',
    'workflow.s7_body': 'Wire Leaflet with a transparent canvas overlay (strips background pixels), a 250 m grid choropleth, POI clusters, year animation, hover tooltip, floating side panels, and SVG charts.',
    'workflow.s8_title': 'Run & iterate locally',
    'workflow.s8_body_html': 'Serve via <code>uvicorn main:app --reload --port 8080</code>, debug with browser DevTools, profile slow endpoints, and refine UX based on usage.',
    'workflow.s9_title': 'Deploy',
    'workflow.s9_body': 'Containerise with Docker, host on Render / Fly.io / DigitalOcean, or pre-render data and host a fully static mirror on GitHub Pages + Netlify Functions.',

    // ── CTA & footer ──────────────────────────────────
    'cta.title_a': 'Ready to',
    'cta.title_b': 'explore?',
    'cta.lead': 'Open the interactive map and start clicking around — every grid cell tells a story.',
    'cta.launch': 'Launch the WebGIS',
    'footer.project': 'Project',
    'footer.data': 'Data',
    'footer.built_with': 'Built with',
    'footer.copyright': '© 2026 — Land Use & Livability Analysis',
    'footer.editorial': 'An editorial study, 2018 → 2026',

    // ── Index (map page) panel ────────────────────────
    'panel.subtitle': 'Land use & livability · 2018 / 2026',
    'tab.layers': 'Layers',
    'tab.stats': 'Stats',
    'tab.hotspots': 'Hotspots',

    'section.basemap': 'Basemap',
    'basemap.light': 'Light',
    'basemap.dark': 'Dark',
    'basemap.streets': 'Streets',
    'basemap.satellite': 'Satellite',

    'section.year': 'Year',
    'year.tooltip': 'Play animation',
    'year.sub': 'Selected year · click play to animate',

    'section.split': 'Split Compare',
    'split.toggle': 'Compare Two Years',
    'split.truecolor': 'True Color',
    'split.classified': 'Classified',
    'split.years': 'Years',
    'split.left': '◀ Left',
    'split.right': 'Right ▶',

    'section.layers': 'Map Layers',
    'layer.truecolor': 'True Color Image',
    'layer.classified': 'Land Cover Classification',
    'layer.image_opacity': 'Image opacity',
    'layer.grid': 'Analysis Grid (250 m)',
    'layer.color_by': 'Color by',
    'layer.opacity': 'Opacity',
    'layer.roads': 'Road Network',
    'layer.pois': 'Points of Interest',
    'layer.categories': 'Categories',

    'colorby.livability': 'Livability Score',
    'colorby.growth': 'Built Area Growth (%)',
    'colorby.poi_density': 'POI Density',
    'colorby.uhi': 'UHI Proxy',
    'colorby.ndvi': 'NDVI Mean',

    'cat.medical': 'Medical',
    'cat.recreation': 'Recreation',
    'cat.living': 'Living',
    'cat.transport': 'Transport',
    'cat.education': 'Education',

    'stats.study_area': 'Study Area',
    'hotspots.top_cells': 'Top Cells',
    'hotspots.hint': 'Click any cell to fly to its location and view details.',
    'hotspots.best': 'Best',
    'hotspots.growth': 'Growth',
    'hotspots.risk': 'Risk',

    'legend.title': 'Legend',
    'legend.empty': 'Enable layers to see legend.',
    'legend.road_network': 'Road Network',
    'legend.road_primary': 'Primary / Trunk',
    'legend.road_secondary': 'Secondary',
    'legend.road_other': 'Other',

    'info.cell_details': 'Cell Details',
    'info.empty_hint': 'Enable the analysis grid layer and click a cell to view detailed statistics.',
    'info.cell': 'Cell',
    'info.land_cover': 'Land Cover',
    'info.built_growth': 'Built Growth 2018→2026',
    'info.pois_total': 'Points of Interest',
    'info.density': 'Density',
    'info.proximity': 'Service Proximity',
    'info.medical': 'Medical',
    'info.education': 'Education',
    'info.living': 'Living',
    'info.main_road': 'Main Road',
    'info.env_indices': 'Environmental Indices',
    'info.ndvi': 'NDVI',
    'info.uhi': 'UHI Proxy',
    'info.poi_diversity': 'POI Diversity',
    'info.year': 'year',
    'info.pin': 'Pin',
    'info.pinned': 'Pinned',
    'info.compare': 'Compare',
    'info.compare_cells': 'Compare Cells',

    'hover.livability': 'Livability',
    'hover.growth': 'Growth',
    'hover.pois': 'POIs',

    'loading.default': 'Loading…',
    'loading.grid': 'Loading analysis grid…',
    'loading.roads': 'Loading road network…',
    'loading.pois': 'Loading points of interest…',
  },

  th: {
    // ── Common / nav ──────────────────────────────────
    'nav.about': '01 เกี่ยวกับ',
    'nav.features': '02 ฟีเจอร์',
    'nav.materials': '03 เครื่องมือ',
    'nav.workflow': '04 ขั้นตอน',
    'nav.open_map': 'เปิดแผนที่',
    'nav.back_home': 'กลับหน้าแรก',
    'nav.toggle_theme': 'สลับโหมดสว่าง / มืด',
    'nav.toggle_lang': 'สลับภาษา (TH / EN)',

    // ── Hero ──────────────────────────────────────────
    'hero.meta': 'จังหวัดภูเก็ต — ประเทศไทย · 2018 / 2026',
    'hero.title_a': 'ภูเก็ต',
    'hero.title_b': 'WebGIS.',
    'hero.lead': 'การศึกษาเชิงพื้นที่เกี่ยวกับการใช้ประโยชน์ที่ดินและคุณภาพการอยู่อาศัย — สร้างจากภาพถ่ายดาวเทียม Sentinel-2 ตลอด 9 ปี, จุดสนใจจาก OpenStreetMap จำนวน 244,016 จุด และตารางวิเคราะห์ความละเอียด 250 เมตร',
    'hero.cta_launch': 'เปิดแผนที่',
    'hero.cta_scroll': 'เลื่อนเพื่ออ่านต่อ',

    // ── About ─────────────────────────────────────────
    'about.kicker': 'เกี่ยวกับ',
    'about.title_a': 'เกาะหนึ่ง,',
    'about.title_b': 'สังเกตที่ความละเอียด 250 เมตร',
    'about.lead': 'จังหวัดเกาะขนาด 543 ตร.กม. บนชายฝั่งอันดามันตะวันตกเฉียงใต้ของไทย ประกอบด้วย 3 อำเภอ และเป็นหนึ่งในเศรษฐกิจการท่องเที่ยวที่คึกคักที่สุดของเอเชียตะวันออกเฉียงใต้',
    'about.p1_html': 'ภูเก็ตตั้งอยู่ในทะเลอันดามัน เชื่อมต่อกับแผ่นดินใหญ่ผ่านสะพานสารสิน 3 อำเภอ — <b>เมืองภูเก็ต</b>, <b>กะทู้</b>, และ <b>ถลาง</b> — รวมชายหาด ใจกลางเมืองหนาแน่น ป่าภูเขาภายใน และพื้นที่กึ่งเมืองที่ขยายตัวอย่างรวดเร็ว',
    'about.p2_html': 'ตั้งแต่ปี 2010 ภูเก็ตเผชิญการขยายตัวของเมืองอย่างก้าวกระโดด ขับเคลื่อนด้วยการท่องเที่ยว การพัฒนาบ้านพักหลังที่สอง และการลงทุนโครงสร้างพื้นฐาน ส่งผลให้สิ่งปกคลุมดินเปลี่ยนแปลง เกิดเกาะความร้อนเมือง และเปลี่ยนการเข้าถึงบริการสาธารณะ',
    'about.p3_html': 'WebGIS นี้ให้มุมมองที่โปร่งใสและขับเคลื่อนด้วยข้อมูลว่า <b>การเปลี่ยนแปลงเกิดที่ใด</b>, <b>เร็วแค่ไหน</b>, และ <b>ส่งผลต่อคุณภาพการอยู่อาศัยอย่างไร</b> — ในทุกเซลล์ 250×250 เมตรของเกาะ ทุกปีตั้งแต่ 2018 ถึง 2026',
    'about.stat_area': 'ตร.กม.',
    'about.stat_pop': 'ประชากร',
    'about.stat_districts': 'อำเภอ',
    'about.stat_visitors': 'นักท่องเที่ยว/ปี',
    'about.stat_cells': 'เซลล์ตาราง',
    'about.stat_years': 'ปีที่สังเกต',

    'bignum1.cap_top': 'พื้นที่ศึกษา',
    'bignum1.cap': 'จังหวัดภูเก็ต · 3 อำเภอ · ติดตามต่อเนื่อง 9 ปี',

    // ── Features ──────────────────────────────────────
    'features.kicker': 'ฟีเจอร์',
    'features.title_a': '6 มุมมองของ',
    'features.title_b': 'เกาะที่กำลังเปลี่ยน',
    'features.lead': 'สลับ basemap, ดูแอนิเมชันการเปลี่ยนแปลงสิ่งปกคลุมดินรายปี, คลิกเซลล์เพื่อดูข้อมูลเต็ม และค้นหาจุดสำคัญและพื้นที่เสี่ยงได้ในคลิกเดียว',
    'features.f1_title': 'ภาพย้อนเวลา',
    'features.f1_body': 'ภาพถ่าย Sentinel-2 แบบสีจริง และจำแนกสิ่งปกคลุมดิน สำหรับทุกปี 2018-2026 พร้อมการไล่ระดับความโปร่งใส',
    'features.f2_title': 'ตารางวิเคราะห์ 250 ม.',
    'features.f2_body': '9,644 เซลล์ ระบายสีตามคุณภาพการอยู่อาศัย, อัตราการเติบโต, ความหนาแน่น, เกาะความร้อนเมือง หรือ NDVI',
    'features.f3_title': '244,016 จุดสนใจ',
    'features.f3_body': 'สถานพยาบาล นันทนาการ ที่อยู่อาศัย ขนส่ง และการศึกษา — รวมกลุ่ม กรองตามหมวด และจับคู่ทุกเซลล์',
    'features.f4_title': 'สถิติสด',
    'features.f4_body': 'กราฟ SVG แสดงสัดส่วนสิ่งปกคลุมดิน แนวโน้มสิ่งปลูกสร้าง decile การเข้าถึง และความหนาแน่นของจุดสนใจ',
    'features.f5_title': 'นำทางจุดสำคัญ',
    'features.f5_body': 'เซลล์น่าอยู่ที่สุด เซลล์เติบโตเร็วที่สุด และเซลล์ความเสี่ยง — คลิกครั้งเดียวบินไปยังตำแหน่งทันที',
    'features.f6_title': 'แนวโน้มรายเซลล์',
    'features.f6_body': 'คลิกเซลล์เพื่อดูสัดส่วนสิ่งปกคลุมดินที่เปลี่ยนแปลงตลอด 9 ปี ในรูปกราฟแบบ stacked area',

    'bignum2.cap_top': 'ความละเอียด',
    'bignum2.cap': 'fishnet 250×250 ม. · คำนวณ zonal statistics สำหรับทุกปี',

    // ── Materials ─────────────────────────────────────
    'materials.kicker': 'เครื่องมือ',
    'materials.title_a': 'เครื่องมือและข้อมูล',
    'materials.title_b': 'เบื้องหลังแผนที่',
    'materials.lead': 'ทุกสิ่งที่ใช้สร้าง WebGIS นี้ — ตั้งแต่การรับภาพดาวเทียม จนถึง frontend แบบโต้ตอบ',
    'materials.m1_sub': 'ขั้นที่ 01',
    'materials.m1_title': 'ซอฟต์แวร์และเอดิเตอร์',
    'materials.m2_sub': 'ขั้นที่ 02',
    'materials.m2_title': 'ไลบรารี Python',
    'materials.m3_sub': 'ขั้นที่ 03',
    'materials.m3_title': 'Web frontend',
    'materials.m4_sub': 'ขั้นที่ 04',
    'materials.m4_title': 'ข้อมูลต้นทาง',
    'materials.m5_sub': 'ขั้นที่ 05',
    'materials.m5_title': 'ข้อมูลที่ได้',
    'materials.m6_sub': 'ฮาร์ดแวร์',
    'materials.m6_title': 'การประมวลผล',

    'bignum3.cap_top': 'ครอบคลุม',
    'bignum3.cap': 'สถานพยาบาล · นันทนาการ · ที่อยู่อาศัย · ขนส่ง · การศึกษา — จาก OpenStreetMap',

    // ── Workflow ──────────────────────────────────────
    'workflow.kicker': 'ขั้นตอน',
    'workflow.title_a': '9 ขั้นตอน,',
    'workflow.title_b': 'จากพิกเซลดิบ',
    'workflow.title_c': 'สู่แผนที่สด',
    'workflow.lead': 'จากภาพ Sentinel-2 ดิบสู่ WebGIS แบบโต้ตอบที่ขัดเงาแล้ว — แต่ละขั้นป้อนต่อไปยังขั้นถัดไป โดยเก็บผลลัพธ์กลางทุกขั้นเพื่อให้ทำซ้ำได้',
    'workflow.s1_title': 'รับข้อมูลดิบ',
    'workflow.s1_body': 'ดาวน์โหลด Sentinel-2 L2A (คอมโพสิตปลอดเมฆต่อปี), OpenStreetMap ภาคใต้ของไทย และโพลีกอนเขตการปกครองภูเก็ต',
    'workflow.s2_title': 'ประมวลผล raster ขั้นต้น',
    'workflow.s2_body': 'ใส่ cloud mask, สร้าง median composite ต่อปี, จำแนกพิกเซลเป็น 4 คลาส (สิ่งปลูกสร้าง / พืชพรรณ / น้ำ / โล่ง) ด้วย supervised model แล้ว reproject เป็น UTM Zone 47 N (EPSG:32647)',
    'workflow.s3_title': 'สร้างตารางวิเคราะห์',
    'workflow.s3_body': 'สร้าง fishnet 250×250 ม. ครอบพื้นที่ศึกษา (9,644 เซลล์) แล้วรัน zonal statistics จาก raster แต่ละปี เพื่อใส่สัดส่วนสิ่งปกคลุมดินต่อเซลล์ พร้อม NDVI และ UHI proxy',
    'workflow.s4_title': 'เสริมด้วย OpenStreetMap',
    'workflow.s4_body': 'spatial-join จุดสนใจจาก OSM 244,016 จุด ลงใน 5 หมวดต่อเซลล์ คำนวณระยะทางถึง สถานพยาบาล / การศึกษา / ถนนหลักที่ใกล้ที่สุด คำนวณความหนาแน่นจุดสนใจ Gini-Simpson diversity และคะแนนคุณภาพการอยู่อาศัยรวม (0-100)',
    'workflow.s5_title': 'ส่งออกไฟล์พร้อมใช้ทางเว็บ',
    'workflow.s5_body': 'reproject เป็น WGS84, เขียน GeoJSON สำหรับ grid / POIs / roads, render PNG image overlays, และ emit สรุป CSV กับ JSON สรุป KPI หลัก',
    'workflow.s6_title': 'สร้าง FastAPI backend',
    'workflow.s6_body_html': 'เปิด <code>/api/stats</code>, <code>/api/grid</code>, <code>/api/pois</code>, <code>/api/roads</code> และ chart endpoints 5 ตัว; mount <code>/data</code> สำหรับไฟล์ static; เสิร์ฟ SPA จาก root',
    'workflow.s7_title': 'สร้าง frontend',
    'workflow.s7_body': 'ต่อ Leaflet พร้อม canvas overlay โปร่งใส (ตัดพื้นหลังออก), grid choropleth 250 ม., POI clusters, แอนิเมชันปี, hover tooltip, side panel ลอย และกราฟ SVG',
    'workflow.s8_title': 'รันและพัฒนาในเครื่อง',
    'workflow.s8_body_html': 'เสิร์ฟผ่าน <code>uvicorn main:app --reload --port 8080</code>, debug ด้วย browser DevTools, profile endpoint ช้า และปรับ UX ตามการใช้งานจริง',
    'workflow.s9_title': 'Deploy',
    'workflow.s9_body': 'ใส่ Docker container, host บน Render / Fly.io / DigitalOcean หรือ pre-render ข้อมูลและ host แบบ static บน GitHub Pages + Netlify Functions',

    // ── CTA & footer ──────────────────────────────────
    'cta.title_a': 'พร้อมจะ',
    'cta.title_b': 'สำรวจหรือยัง?',
    'cta.lead': 'เปิดแผนที่แบบโต้ตอบและเริ่มคลิกสำรวจ — ทุกเซลล์มีเรื่องราว',
    'cta.launch': 'เปิด WebGIS',
    'footer.project': 'โปรเจค',
    'footer.data': 'ข้อมูล',
    'footer.built_with': 'สร้างด้วย',
    'footer.copyright': '© 2026 — การวิเคราะห์การใช้ที่ดินและคุณภาพการอยู่อาศัย',
    'footer.editorial': 'การศึกษาเชิงพื้นที่ 2018 → 2026',

    // ── Index (map page) panel ────────────────────────
    'panel.subtitle': 'การใช้ที่ดิน & คุณภาพการอยู่อาศัย · 2018 / 2026',
    'tab.layers': 'เลเยอร์',
    'tab.stats': 'สถิติ',
    'tab.hotspots': 'จุดสำคัญ',

    'section.basemap': 'แผนที่ฐาน',
    'basemap.light': 'สว่าง',
    'basemap.dark': 'มืด',
    'basemap.streets': 'ถนน',
    'basemap.satellite': 'ดาวเทียม',

    'section.year': 'ปี',
    'year.tooltip': 'เล่นแอนิเมชัน',
    'year.sub': 'ปีที่เลือก · กดเล่นเพื่อดูแอนิเมชัน',

    'section.split': 'เทียบแบบแยก',
    'split.toggle': 'เทียบสองปี',
    'split.truecolor': 'สีจริง',
    'split.classified': 'จำแนก',
    'split.years': 'ปี',
    'split.left': '◀ ซ้าย',
    'split.right': 'ขวา ▶',

    'section.layers': 'เลเยอร์แผนที่',
    'layer.truecolor': 'ภาพสีจริง',
    'layer.classified': 'การจำแนกสิ่งปกคลุมดิน',
    'layer.image_opacity': 'ความโปร่งใสภาพ',
    'layer.grid': 'ตารางวิเคราะห์ (250 ม.)',
    'layer.color_by': 'ระบายสีตาม',
    'layer.opacity': 'ความโปร่งใส',
    'layer.roads': 'เครือข่ายถนน',
    'layer.pois': 'จุดสนใจ',
    'layer.categories': 'หมวดหมู่',

    'colorby.livability': 'คะแนนการอยู่อาศัย',
    'colorby.growth': 'การเติบโตของสิ่งปลูกสร้าง (%)',
    'colorby.poi_density': 'ความหนาแน่นจุดสนใจ',
    'colorby.uhi': 'UHI Proxy',
    'colorby.ndvi': 'NDVI เฉลี่ย',

    'cat.medical': 'การแพทย์',
    'cat.recreation': 'นันทนาการ',
    'cat.living': 'ที่อยู่อาศัย',
    'cat.transport': 'ขนส่ง',
    'cat.education': 'การศึกษา',

    'stats.study_area': 'พื้นที่ศึกษา',
    'hotspots.top_cells': 'เซลล์ยอดนิยม',
    'hotspots.hint': 'คลิกเซลล์เพื่อบินไปยังตำแหน่งและดูรายละเอียด',
    'hotspots.best': 'ดีสุด',
    'hotspots.growth': 'เติบโต',
    'hotspots.risk': 'เสี่ยง',

    'legend.title': 'คำอธิบาย',
    'legend.empty': 'เปิดเลเยอร์เพื่อแสดงคำอธิบาย',
    'legend.road_network': 'เครือข่ายถนน',
    'legend.road_primary': 'หลัก / ทางหลวง',
    'legend.road_secondary': 'รอง',
    'legend.road_other': 'อื่นๆ',

    'info.cell_details': 'รายละเอียดเซลล์',
    'info.empty_hint': 'เปิดเลเยอร์ตารางวิเคราะห์และคลิกเซลล์เพื่อดูสถิติ',
    'info.cell': 'เซลล์',
    'info.land_cover': 'สิ่งปกคลุมดิน',
    'info.built_growth': 'การเติบโตสิ่งปลูกสร้าง 2018→2026',
    'info.pois_total': 'จุดสนใจ',
    'info.density': 'ความหนาแน่น',
    'info.proximity': 'ระยะถึงบริการ',
    'info.medical': 'การแพทย์',
    'info.education': 'การศึกษา',
    'info.living': 'ที่อยู่อาศัย',
    'info.main_road': 'ถนนหลัก',
    'info.env_indices': 'ดัชนีสิ่งแวดล้อม',
    'info.ndvi': 'NDVI',
    'info.uhi': 'UHI Proxy',
    'info.poi_diversity': 'ความหลากหลายจุดสนใจ',
    'info.year': 'ปี',
    'info.pin': 'ปัก',
    'info.pinned': 'ปักแล้ว',
    'info.compare': 'เทียบ',
    'info.compare_cells': 'เทียบเซลล์',

    'hover.livability': 'การอยู่อาศัย',
    'hover.growth': 'เติบโต',
    'hover.pois': 'จุดสนใจ',

    'loading.default': 'กำลังโหลด…',
    'loading.grid': 'กำลังโหลดตารางวิเคราะห์…',
    'loading.roads': 'กำลังโหลดเครือข่ายถนน…',
    'loading.pois': 'กำลังโหลดจุดสนใจ…',
  },
};

const I18N = {
  current: 'en',

  t(key) {
    const dict = I18N_DICT[I18N.current] || I18N_DICT.en;
    return (key in dict) ? dict[key] : (I18N_DICT.en[key] || key);
  },

  apply(lang) {
    if (!I18N_DICT[lang]) lang = 'en';
    I18N.current = lang;
    document.documentElement.lang = (lang === 'th') ? 'th' : 'en';
    localStorage.setItem('phuket-lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = I18N.t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = I18N.t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = I18N.t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = I18N.t(el.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('.lang-toggle-btn').forEach(b => {
      if (b.querySelector('.lang-opt')) {
        // Segmented control: highlight the active language via [data-lang].
        b.dataset.lang = lang;
      } else {
        // Plain text fallback (older markup): show the opposite language as the click target.
        b.textContent = (lang === 'th') ? 'EN' : 'TH';
      }
    });

    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  },

  init() {
    let lang = localStorage.getItem('phuket-lang');
    if (!lang) lang = (navigator.language || '').toLowerCase().startsWith('th') ? 'th' : 'en';
    I18N.apply(lang);
  },

  toggle() {
    I18N.apply(I18N.current === 'th' ? 'en' : 'th');
  },
};

window.I18N = I18N;
window.t = I18N.t.bind(I18N);
