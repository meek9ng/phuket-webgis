/* ═══════════════════════════════════════════════════════════
   Phuket WebGIS — Charts module
   Pure SVG visualisations driven by the CSV/JSON endpoints.
   =================================================================== */

const LC_COLORS = {
  built:      '#c0392b',
  vegetation: '#27ae60',
  water:      '#2980b9',
  bare:       '#e67e22',
};

// ─── Number formatters ────────────────────────────────────────
const fmt = {
  int: n => Number(n).toLocaleString(),
  km2: n => `${(+n).toFixed(1)} km²`,
  pct: n => `${(+n).toFixed(1)}%`,
  m:   n => `${Math.round(+n)} m`,
};

// ─── Top stat cards ───────────────────────────────────────────
function renderStatCards(s) {
  const el = document.getElementById('statsPanel');
  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <i class="bi bi-bounding-box"></i>
        <div class="stat-val">${s.total_area_km2}</div>
        <div class="stat-lbl">km² area</div>
      </div>
      <div class="stat-card">
        <i class="bi bi-grid-3x3-gap-fill"></i>
        <div class="stat-val">${fmt.int(s.total_cells)}</div>
        <div class="stat-lbl">grid cells</div>
      </div>
      <div class="stat-card">
        <i class="bi bi-heart-pulse-fill"></i>
        <div class="stat-val">${(+s.mean_livability).toFixed(1)}</div>
        <div class="stat-lbl">mean livability</div>
      </div>
      <div class="stat-card">
        <i class="bi bi-exclamation-diamond-fill"></i>
        <div class="stat-val">${fmt.int(s.risk_cells)}</div>
        <div class="stat-lbl">risk cells</div>
      </div>
      <div class="stat-card">
        <i class="bi bi-thermometer-sun"></i>
        <div class="stat-val">${fmt.int(s.uhi_hotspot_cells)}</div>
        <div class="stat-lbl">UHI hotspots</div>
      </div>
      <div class="stat-card">
        <i class="bi bi-geo-fill"></i>
        <div class="stat-val">${(s.total_pois/1000).toFixed(0)}k</div>
        <div class="stat-lbl">total POIs</div>
      </div>
      <div class="stat-card">
        <i class="bi bi-signpost-2-fill"></i>
        <div class="stat-val">${fmt.int(s.total_main_roads)}</div>
        <div class="stat-lbl">main roads</div>
      </div>
      <div class="stat-card">
        <i class="bi bi-flower1"></i>
        <div class="stat-val">${(+s.mean_gini_simpson).toFixed(2)}</div>
        <div class="stat-lbl">POI diversity</div>
      </div>
    </div>
  `;
}

// ─── Land cover stacked area chart (yearly) ───────────────────
function renderLandcoverChart(rows) {
  const W = 280, H = 130, PAD_L = 28, PAD_R = 6, PAD_T = 8, PAD_B = 22;
  const cw = W - PAD_L - PAD_R, ch = H - PAD_T - PAD_B;
  const years = rows.map(r => r.year);
  const xStep = cw / (years.length - 1);

  // Stacked normalised to 100%
  const cats = [
    ['built_km2_pct', LC_COLORS.built,      'Built'],
    ['bare_km2_pct',  LC_COLORS.bare,       'Bare'],
    ['water_km2_pct', LC_COLORS.water,      'Water'],
    ['vegetation_km2_pct', LC_COLORS.vegetation, 'Vegetation'],
  ];

  // Build cumulative top values per year
  let polys = '';
  let prevTops = years.map(() => 0);
  cats.forEach(([key, col]) => {
    const tops = rows.map((r, i) => prevTops[i] + (+r[key] || 0));
    const path = [];
    rows.forEach((r, i) => {
      const x = PAD_L + i * xStep;
      const y = PAD_T + ch * (1 - tops[i] / 100);
      path.push(`${x},${y}`);
    });
    for (let i = rows.length - 1; i >= 0; i--) {
      const x = PAD_L + i * xStep;
      const y = PAD_T + ch * (1 - prevTops[i] / 100);
      path.push(`${x},${y}`);
    }
    polys += `<polygon points="${path.join(' ')}" fill="${col}" opacity="0.85"/>`;
    prevTops = tops;
  });

  // Year axis
  let xAxis = '';
  rows.forEach((r, i) => {
    if (i % 2 === 0) {
      const x = PAD_L + i * xStep;
      xAxis += `<text class="chart-label" x="${x}" y="${H - 6}" text-anchor="middle">${r.year}</text>`;
    }
  });

  // Y axis lines (0/50/100%)
  let yLines = '';
  [0, 25, 50, 75, 100].forEach(v => {
    const y = PAD_T + ch * (1 - v / 100);
    yLines += `<line class="chart-grid" x1="${PAD_L}" x2="${W-PAD_R}" y1="${y}" y2="${y}"/>`;
    yLines += `<text class="chart-label" x="${PAD_L-4}" y="${y+3}" text-anchor="end">${v}%</text>`;
  });

  document.getElementById('chartLandcover').innerHTML = `
    <div class="chart-card">
      <div class="chart-title"><i class="bi bi-layers-half"></i> Land Cover Composition</div>
      <div class="chart-sub">Share of total area by year (2018–2026)</div>
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        ${yLines}
        ${polys}
        ${xAxis}
      </svg>
      <div class="legend-row">
        <span><span class="sw" style="background:${LC_COLORS.vegetation}"></span>Vegetation</span>
        <span><span class="sw" style="background:${LC_COLORS.built}"></span>Built</span>
        <span><span class="sw" style="background:${LC_COLORS.water}"></span>Water</span>
        <span><span class="sw" style="background:${LC_COLORS.bare}"></span>Bare</span>
      </div>
    </div>`;
}

// ─── Built-up growth bar chart ────────────────────────────────
function renderBuiltGrowthChart(rows) {
  const W = 280, H = 110, PAD_L = 28, PAD_R = 6, PAD_T = 10, PAD_B = 22;
  const cw = W - PAD_L - PAD_R, ch = H - PAD_T - PAD_B;
  const max = Math.max(...rows.map(r => +r.built_km2)) * 1.1;
  const bw = cw / rows.length * 0.7;

  let bars = '';
  let labels = '';
  rows.forEach((r, i) => {
    const v = +r.built_km2;
    const barH = ch * (v / max);
    const x = PAD_L + (cw / rows.length) * i + (cw / rows.length - bw) / 2;
    const y = PAD_T + ch - barH;
    const isLast = i === rows.length - 1;
    const col = isLast ? '#1d4ed8' : '#60a5fa';
    bars += `<rect class="chart-bar" x="${x}" y="${y}" width="${bw}" height="${barH}"
              fill="${col}" rx="2"><title>${r.year}: ${v.toFixed(2)} km²</title></rect>`;
    if (i % 2 === 0 || isLast) {
      labels += `<text class="chart-label" x="${x + bw/2}" y="${H-6}" text-anchor="middle">${r.year}</text>`;
    }
    if (isLast) {
      labels += `<text class="chart-value" x="${x + bw/2}" y="${y - 3}" text-anchor="middle">${v.toFixed(0)}</text>`;
    }
  });

  // Y reference line at zero
  const yLines = `<line class="chart-axis" x1="${PAD_L}" x2="${W-PAD_R}" y1="${PAD_T+ch}" y2="${PAD_T+ch}"/>`;

  const first = +rows[0].built_km2;
  const last = +rows[rows.length-1].built_km2;
  const pct = ((last - first) / first) * 100;

  document.getElementById('chartBuilt').innerHTML = `
    <div class="chart-card">
      <div class="chart-title"><i class="bi bi-buildings-fill"></i> Built-up Area Trend</div>
      <div class="chart-sub">${first.toFixed(1)} → ${last.toFixed(1)} km²
        · <b style="color:${pct>=0?'var(--green)':'var(--red)'}">${pct>=0?'+':''}${pct.toFixed(1)}%</b> (2018→2026)
      </div>
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        ${yLines}
        ${bars}
        ${labels}
      </svg>
    </div>`;
}

// ─── POI summary horizontal bar chart ─────────────────────────
function renderPoiChart(rows, summary) {
  const totals = {
    medical:    summary.pois_medical,
    recreation: summary.pois_recreation,
    living:     summary.pois_living,
    transport:  summary.pois_transport,
    education:  summary.pois_education,
  };
  const max = Math.max(...Object.values(totals));

  const colors = {
    medical: '#e74c3c', recreation: '#27ae60', living: '#3498db',
    transport: '#f39c12', education: '#9b59b6',
  };
  const icons = {
    medical: 'bi-hospital-fill', recreation: 'bi-tree-fill', living: 'bi-shop',
    transport: 'bi-bus-front-fill', education: 'bi-mortarboard-fill',
  };

  let html = `<div class="chart-card">
    <div class="chart-title"><i class="bi bi-geo-alt-fill"></i> Points of Interest by Category</div>
    <div class="chart-sub">${fmt.int(summary.total_pois)} total POIs · 5 service categories</div>`;

  Object.entries(totals).forEach(([cat, val]) => {
    const w = (val / max) * 100;
    const r = rows.find(x => x.category === cat) || {};
    html += `
      <div class="poi-bar-row" style="margin-bottom:8px">
        <span class="poi-bar-label" style="min-width:84px">
          <i class="bi ${icons[cat]}" style="color:${colors[cat]}"></i>${cat[0].toUpperCase()+cat.slice(1)}
        </span>
        <div class="poi-bar-track" style="height:10px">
          <div class="poi-bar-fill" style="width:${w}%;background:${colors[cat]}"></div>
        </div>
        <span class="poi-bar-val" style="min-width:44px">${fmt.int(val)}</span>
      </div>
      <div style="font-size:10px;color:var(--gray-400);margin:-4px 0 6px 92px">
        Coverage ${(+r.coverage_pct||0).toFixed(0)}% · mean ${(+r.mean_per_cell||0).toFixed(1)}/cell · avg ${Math.round(+r.mean_dist_m||0)} m
      </div>`;
  });

  html += '</div>';
  document.getElementById('chartPoi').innerHTML = html;
}

// ─── Livability deciles distribution ──────────────────────────
function renderLivabilityChart(rows) {
  const W = 280, H = 120, PAD_L = 28, PAD_R = 6, PAD_T = 10, PAD_B = 22;
  const cw = W - PAD_L - PAD_R, ch = H - PAD_T - PAD_B;
  const max = Math.max(...rows.map(r => +r.cells)) * 1.1;
  const bw = cw / rows.length * 0.78;

  let bars = '';
  rows.forEach((r, i) => {
    const v = +r.cells;
    const barH = ch * (v / max);
    const x = PAD_L + (cw / rows.length) * i + (cw / rows.length - bw) / 2;
    const y = PAD_T + ch - barH;
    // Color by livability range — gradient from red to green
    const livMid = (+r.liv_min + +r.liv_max) / 2;
    let col;
    if (livMid >= 70) col = '#1a9850';
    else if (livMid >= 60) col = '#a6d96a';
    else if (livMid >= 55) col = '#fee08b';
    else if (livMid >= 50) col = '#fdae61';
    else col = '#d73027';
    bars += `<rect class="chart-bar" x="${x}" y="${y}" width="${bw}" height="${barH}"
              fill="${col}" rx="2">
              <title>Decile ${r.decile}: ${(+r.liv_min).toFixed(1)}–${(+r.liv_max).toFixed(1)} · ${v} cells</title>
            </rect>`;
  });

  // X axis tick labels (decile)
  let xAxis = '';
  rows.forEach((r, i) => {
    const x = PAD_L + (cw / rows.length) * i + (cw / rows.length) / 2;
    xAxis += `<text class="chart-label" x="${x}" y="${H-6}" text-anchor="middle">${r.decile}</text>`;
  });
  // Y axis (count)
  let yAxis = '';
  [0, max/2, max].forEach(v => {
    const y = PAD_T + ch * (1 - v / max);
    yAxis += `<line class="chart-grid" x1="${PAD_L}" x2="${W-PAD_R}" y1="${y}" y2="${y}"/>`;
    yAxis += `<text class="chart-label" x="${PAD_L-4}" y="${y+3}" text-anchor="end">${Math.round(v)}</text>`;
  });

  document.getElementById('chartLiv').innerHTML = `
    <div class="chart-card">
      <div class="chart-title"><i class="bi bi-heart-pulse-fill"></i> Livability Distribution</div>
      <div class="chart-sub">Cells per decile · range ${(+rows[0].liv_min).toFixed(1)}–${(+rows[rows.length-1].liv_max).toFixed(1)}</div>
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        ${yAxis}${bars}${xAxis}
      </svg>
      <div style="font-size:10px;color:var(--gray-400);text-align:center;margin-top:2px">decile (1 = lowest, 10 = highest)</div>
    </div>`;
}

// ─── Accessibility: cells within X km ─────────────────────────
function renderAccessibilityChart(rows) {
  const total = 9644;
  const services = rows.filter(r => r.service !== 'main_road');
  const icons = {
    medical: 'bi-hospital', recreation: 'bi-tree', living: 'bi-shop',
    transport: 'bi-bus-front', education: 'bi-mortarboard', main_road: 'bi-sign-turn-right',
  };

  let html = `<div class="chart-card">
    <div class="chart-title"><i class="bi bi-pin-angle-fill"></i> Service Accessibility</div>
    <div class="chart-sub">% of cells within walking / driving distance</div>`;

  rows.forEach(r => {
    const within500 = (+r.cells_within_500m / total) * 100;
    const within1km = (+r.cells_within_1km / total) * 100;
    const within2km = (+r.cells_within_2km / total) * 100;
    const farPct = (+(r['cells_far_5km+'] || r.cells_far_5km || 0) / total) * 100;
    const label = r.service.replace('_', ' ');

    html += `
      <div style="margin-bottom:9px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-size:11px;color:var(--gray-700);font-weight:600;text-transform:capitalize">
            <i class="bi ${icons[r.service]}" style="color:var(--blue-500)"></i> ${label}
          </span>
          <span style="font-size:10px;color:var(--gray-400)">median ${Math.round(+r.median_dist_m)} m</span>
        </div>
        <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:var(--gray-100)">
          <div style="width:${within500}%;background:#1a9850" title="≤500 m: ${within500.toFixed(0)}%"></div>
          <div style="width:${within1km - within500}%;background:#a6d96a" title="500m–1km"></div>
          <div style="width:${within2km - within1km}%;background:#fee08b" title="1–2km"></div>
          <div style="width:${100 - within2km - farPct}%;background:#fdae61" title="2–5km"></div>
          <div style="width:${farPct}%;background:#d73027" title="≥5km: ${farPct.toFixed(0)}%"></div>
        </div>
      </div>`;
  });

  html += `
    <div class="legend-row" style="margin-top:6px">
      <span><span class="sw" style="background:#1a9850"></span>≤500m</span>
      <span><span class="sw" style="background:#a6d96a"></span>1km</span>
      <span><span class="sw" style="background:#fee08b"></span>2km</span>
      <span><span class="sw" style="background:#fdae61"></span>5km</span>
      <span><span class="sw" style="background:#d73027"></span>>5km</span>
    </div>
  </div>`;

  document.getElementById('chartAccess').innerHTML = html;
}

// ─── Hotspot list (top livability / growth / risk cells) ─────
function renderHotspots(rows) {
  // Group by rank_by
  const groups = { livability_high: [], growth_high: [], risk: [] };
  rows.forEach(r => { if (groups[r.rank_by]) groups[r.rank_by].push(r); });

  let activeGroup = 'livability_high';

  function renderList(group) {
    const list = groups[group] || [];
    const valKey = group === 'livability_high' ? 'livability'
                : group === 'growth_high' ? 'growth_pct' : 'livability';

    let html = '';
    list.slice(0, 20).forEach(r => {
      let valDisplay, valColor;
      if (group === 'livability_high') {
        valDisplay = (+r.livability).toFixed(1);
        valColor = '#1a9850';
      } else if (group === 'growth_high') {
        valDisplay = `+${(+r.growth_pct).toFixed(0)}%`;
        valColor = '#1d4ed8';
      } else {
        valDisplay = (+r.livability).toFixed(1);
        valColor = '#dc2626';
      }
      html += `
        <div class="hs-row" data-cell-id="${r.cell_id}">
          <div>
            <div class="hs-id">Cell #${r.cell_id}</div>
            <div class="hs-meta">POIs: ${r.poi_total} · Diversity: ${(+r.gini_simpson).toFixed(2)}</div>
          </div>
          <div class="hs-val" style="color:${valColor}">${valDisplay}</div>
        </div>`;
    });
    document.getElementById('hotspotList').innerHTML = html;
    // Wire click
    document.querySelectorAll('.hs-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = +row.dataset.cellId;
        flyToCell(id);
      });
    });
  }

  renderList(activeGroup);

  document.querySelectorAll('.hs-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.hs-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeGroup = tab.dataset.group;
      renderList(activeGroup);
    });
  });
}

// ─── Safe fetch — returns fallback if endpoint missing or bad ─
async function safeFetch(url, fallback) {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const data = await res.json();
    return data;
  } catch (e) {
    return fallback;
  }
}

function chartUnavailable(elId, title, icon) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `
    <div class="chart-card" style="text-align:center;color:var(--gray-400);font-size:11px;padding:14px 8px">
      <i class="bi ${icon}" style="font-size:18px;display:block;margin-bottom:4px;color:var(--blue-400)"></i>
      <b style="color:var(--gray-600)">${title}</b><br>
      Data unavailable — restart the FastAPI server to load new endpoints.
    </div>`;
}

// ─── Load all data ────────────────────────────────────────────
async function loadAllData() {
  const [s, lc, poi, liv, acc, hs] = await Promise.all([
    safeFetch('/api/stats',                   null),
    safeFetch('/api/landcover-yearly',        []),
    safeFetch('/api/poi-summary',             []),
    safeFetch('/api/livability-distribution', []),
    safeFetch('/api/accessibility',           []),
    safeFetch('/api/hotspots',                []),
  ]);
  App.data.summary = s;
  App.data.landcoverYearly = lc;
  App.data.poiSummary = poi;
  App.data.livDist = liv;
  App.data.accessibility = acc;
  App.data.hotspots = hs;

  if (s)                  renderStatCards(s);
  else document.getElementById('statsPanel').innerHTML =
    '<span style="font-size:12px;color:var(--gray-400)">Stats unavailable.</span>';

  if (Array.isArray(lc) && lc.length) {
    renderLandcoverChart(lc);
    renderBuiltGrowthChart(lc);
  } else {
    chartUnavailable('chartLandcover', 'Land Cover Composition', 'bi-layers-half');
    chartUnavailable('chartBuilt',     'Built-up Area Trend',    'bi-buildings-fill');
  }

  if (Array.isArray(poi) && poi.length && s) renderPoiChart(poi, s);
  else chartUnavailable('chartPoi', 'Points of Interest', 'bi-geo-alt-fill');

  if (Array.isArray(liv) && liv.length) renderLivabilityChart(liv);
  else chartUnavailable('chartLiv', 'Livability Distribution', 'bi-heart-pulse-fill');

  if (Array.isArray(acc) && acc.length) renderAccessibilityChart(acc);
  else chartUnavailable('chartAccess', 'Service Accessibility', 'bi-pin-angle-fill');

  if (Array.isArray(hs) && hs.length) renderHotspots(hs);
  else document.getElementById('hotspotList').innerHTML =
    '<div style="font-size:11px;color:var(--gray-400);text-align:center;padding:14px">' +
    'Hotspots endpoint unavailable — restart the FastAPI server.</div>';
}
