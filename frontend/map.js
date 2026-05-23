/* ═══════════════════════════════════════════════════════════
   Phuket WebGIS — Map module (layers, state, interactions)
   =================================================================== */

// ─── Transparent image overlay (strips black NoData pixels) ───
const TransparentImageLayer = L.ImageOverlay.extend({
  _initImage() {
    const canvas = this._image = L.DomUtil.create('canvas',
      'leaflet-image-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide'));
    if (this.options.opacity < 1) this._updateOpacity();
    canvas.onselectstart = L.Util.falseFn;
    canvas.onmousemove = L.Util.falseFn;

    const srcImg = new Image();
    srcImg.crossOrigin = '';
    srcImg.onload = () => {
      canvas.width  = srcImg.naturalWidth;
      canvas.height = srcImg.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(srcImg, 0, 0);
      try {
        const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d  = id.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] < 10 && d[i+1] < 10 && d[i+2] < 10) d[i+3] = 0;
        }
        ctx.putImageData(id, 0, 0);
      } catch (e) { /* CORS fallback — keep image as-is */ }
      this.fire('load');
    };
    srcImg.onerror = () => this.fire('error');
    srcImg.src = this._url;
  }
});

// ─── Constants ────────────────────────────────────────────────
const IMG_BOUNDS = [[7.478686, 98.257633], [8.200237, 98.483215]];

const POI_COLORS = {
  medical:    '#e74c3c',
  recreation: '#27ae60',
  living:     '#3498db',
  transport:  '#f39c12',
  education:  '#9b59b6',
};
const POI_ICONS = {
  medical:    'bi-hospital-fill',
  recreation: 'bi-tree-fill',
  living:     'bi-shop',
  transport:  'bi-bus-front-fill',
  education:  'bi-mortarboard-fill',
};
const ROAD_COLORS = {
  primary:   '#1d4ed8',
  secondary: '#2563eb',
  tertiary:  '#60a5fa',
  trunk:     '#1e40af',
  other:     '#94a3b8',
};

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

// ─── Color scales ─────────────────────────────────────────────
function colorLivability(v) {
  if (v >= 80) return '#1a9850';
  if (v >= 70) return '#66bd63';
  if (v >= 60) return '#a6d96a';
  if (v >= 50) return '#fee08b';
  if (v >= 40) return '#fdae61';
  if (v >= 30) return '#f46d43';
  return '#d73027';
}
function colorGrowth(v) {
  if (v >  100) return '#08519c';
  if (v >   50) return '#3182bd';
  if (v >   20) return '#6baed6';
  if (v >    0) return '#bdd7e7';
  if (v >  -20) return '#fddbc7';
  if (v >  -50) return '#f4a582';
  return '#d6604d';
}
function colorPoiDensity(v) {
  if (v > 20) return '#08306b';
  if (v > 10) return '#08519c';
  if (v >  5) return '#2171b5';
  if (v >  2) return '#4292c6';
  if (v >  0) return '#9ecae1';
  return '#deebf7';
}
function colorUHI(v) {
  if (v > .35) return '#7f0000';
  if (v > .30) return '#b30000';
  if (v > .25) return '#d7301f';
  if (v > .20) return '#ef6548';
  if (v > .15) return '#fc8d59';
  if (v > .10) return '#fdbb84';
  return '#fdd49e';
}
function colorNDVI(v) {
  if (v > .70) return '#006837';
  if (v > .50) return '#1a9850';
  if (v > .30) return '#66bd63';
  if (v > .10) return '#d9ef8b';
  if (v > -.1) return '#ffffbf';
  return '#fdae61';
}
function getGridColor(p) {
  switch (App.gridColorBy) {
    case 'livability':  return colorLivability(p.livability  || 0);
    case 'growth_pct':  return colorGrowth(p.growth_pct      || 0);
    case 'poi_density': return colorPoiDensity(p.poi_density || 0);
    case 'uhi_proxy':   return colorUHI(p.uhi_proxy          || 0);
    case 'ndvi_mean':   return colorNDVI(p.ndvi_mean         || 0);
    default:            return '#94a3b8';
  }
}

const LEGEND_DEFS = {
  livability: {
    title: 'Livability Score',
    items: [['≥ 80', '#1a9850'], ['70–80', '#66bd63'], ['60–70', '#a6d96a'],
            ['50–60', '#fee08b'], ['40–50', '#fdae61'], ['30–40', '#f46d43'], ['< 30', '#d73027']],
  },
  growth_pct: {
    title: 'Built Growth (%)',
    items: [['> 100%', '#08519c'], ['50–100%', '#3182bd'], ['20–50%', '#6baed6'],
            ['0–20%', '#bdd7e7'], ['0 to -20%', '#fddbc7'], ['-20 to -50%', '#f4a582'], ['< -50%', '#d6604d']],
  },
  poi_density: {
    title: 'POI Density (/km²)',
    items: [['> 20', '#08306b'], ['10–20', '#08519c'], ['5–10', '#2171b5'],
            ['2–5', '#4292c6'], ['0–2', '#9ecae1'], ['0', '#deebf7']],
  },
  uhi_proxy: {
    title: 'UHI Proxy',
    items: [['> 0.35', '#7f0000'], ['0.30–0.35', '#b30000'], ['0.25–0.30', '#d7301f'],
            ['0.20–0.25', '#ef6548'], ['0.15–0.20', '#fc8d59'], ['0.10–0.15', '#fdbb84'], ['< 0.10', '#fdd49e']],
  },
  ndvi_mean: {
    title: 'NDVI Mean',
    items: [['> 0.70', '#006837'], ['0.50–0.70', '#1a9850'], ['0.30–0.50', '#66bd63'],
            ['0.10–0.30', '#d9ef8b'], ['-0.10–0.10', '#ffffbf'], ['< -0.10', '#fdae61']],
  },
};

// ─── App state (global namespace) ─────────────────────────────
const App = {
  map: null,
  basemaps: {},
  currentBM: 'cartoLight',
  currentYear: 2022,
  imgOpacity: 0.85,
  gridOpacity: 0.70,
  gridColorBy: 'livability',
  playTimer: null,
  selectedCellId: null,
  currentCellProps: null,
  highlightLayer: null,
  pinnedCells: [],
  splitCompare: {
    active: false,
    type: 'truecolor',
    leftYear: 2018,
    rightYear: 2026,
    position: 50,
    leftLayer: null,
    rightLayer: null,
    dragging: false,
  },
  drawMode: {
    active: false,
    points: [],
    tempPolyline: null,
    polygon: null,
    _dots: [],
  },
  layers: {
    truecolor:  { layer: null },
    classified: { layer: null },
    grid:       { layer: null, data: null, loaded: false, byId: {} },
    roads:      { layer: null, loaded: false },
    pois:       { clusters: {}, data: null, loaded: false },
  },
  poiActive: new Set(['medical', 'recreation', 'living', 'transport', 'education']),
  data: {
    summary: null,
    landcoverYearly: null,
    poiSummary: null,
    livDist: null,
    accessibility: null,
    hotspots: null,
  },
};

// ─── Loading helpers ──────────────────────────────────────────
function showLoading(msg) {
  document.getElementById('loadingText').textContent = msg;
  document.getElementById('loading').style.display = 'flex';
}
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}
function toast(msg, ms = 1800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), ms);
}

// ─── Map init ─────────────────────────────────────────────────
function initMap() {
  App.map = L.map('map', {
    center: [7.9, 98.36],
    zoom: 11,
    zoomControl: false,
    preferCanvas: false,
  });
  L.control.zoom({ position: 'bottomright' }).addTo(App.map);
  L.control.scale({ position: 'bottomright', imperial: false }).addTo(App.map);

  App.basemaps = {
    cartoLight: L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { attribution: '© OSM © CartoDB', maxZoom: 20 }),
    cartoDark: L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution: '© OSM © CartoDB', maxZoom: 20 }),
    osm: L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '© OpenStreetMap', maxZoom: 19 }),
    satellite: L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri', maxZoom: 18 }),
  };
  App.basemaps.cartoLight.addTo(App.map);
}

// ─── Livability label ─────────────────────────────────────────
function livabilityLabel(v) {
  if (v >= 80) return { th: 'น่าอยู่ที่สุด', en: 'Excellent',    color: '#1a9850' };
  if (v >= 70) return { th: 'น่าอยู่มาก',    en: 'Very Good',    color: '#66bd63' };
  if (v >= 60) return { th: 'น่าอยู่ดี',     en: 'Good',         color: '#a6d96a' };
  if (v >= 50) return { th: 'ปานกลาง',       en: 'Average',      color: '#fee08b' };
  if (v >= 40) return { th: 'ค่อนข้างต่ำ',   en: 'Below Avg',    color: '#fdae61' };
  if (v >= 30) return { th: 'ต่ำ',           en: 'Poor',         color: '#f46d43' };
  return              { th: 'ต่ำมาก',        en: 'Very Poor',    color: '#d73027' };
}

// ─── Grid layer ───────────────────────────────────────────────
function gridStyle(feature) {
  return {
    fillColor: getGridColor(feature.properties),
    fillOpacity: App.gridOpacity,
    color: 'rgba(30,64,175,0.18)',
    weight: 0.4,
  };
}

function updateCellHighlight(feature) {
  if (App.highlightLayer) { App.map.removeLayer(App.highlightLayer); App.highlightLayer = null; }
  if (!feature) return;
  App.highlightLayer = L.geoJSON(feature, {
    style: () => ({ className: 'cell-highlight-shape', weight: 0, fillOpacity: 0 }),
    interactive: false,
  }).addTo(App.map);
}

async function loadGrid() {
  if (App.layers.grid.loaded) return;
  showLoading('Loading analysis grid (~14 MB)…');
  try {
    const res = await fetch('/api/grid');
    const data = await res.json();
    App.layers.grid.data = data;
    data.features.forEach(f => { App.layers.grid.byId[f.properties.cell_id] = f; });
    App.layers.grid.loaded = true;
    buildGridLayer();
  } finally {
    hideLoading();
  }
}

function buildGridLayer() {
  if (App.layers.grid.layer) App.map.removeLayer(App.layers.grid.layer);
  App.layers.grid.layer = L.geoJSON(App.layers.grid.data, {
    style: gridStyle,
    renderer: L.canvas({ padding: 0.5 }),
    onEachFeature(feature, layer) {
      layer.on({
        click: e => {
          if (App.drawMode.active) return;
          App.selectedCellId = feature.properties.cell_id;
          refreshGridStyle();
          updateCellHighlight(feature);
          showInfoPanel(feature.properties);
        },
        mouseover: e => showHoverTip(feature.properties, e.originalEvent),
        mousemove: e => moveHoverTip(e.originalEvent),
        mouseout:  () => hideHoverTip(),
      });
    },
  });
}

function refreshGridStyle() {
  if (App.layers.grid.layer) App.layers.grid.layer.setStyle(gridStyle);
}

// ─── Roads layer ──────────────────────────────────────────────
async function loadRoads() {
  if (App.layers.roads.loaded) return;
  showLoading('Loading road network…');
  try {
    const res = await fetch('/api/roads');
    const data = await res.json();
    App.layers.roads.layer = L.geoJSON(data, {
      style(feature) {
        const h = feature.properties.highway;
        return {
          color:   ROAD_COLORS[h] || ROAD_COLORS.other,
          weight:  (h === 'primary' || h === 'trunk') ? 2.6 : 1.6,
          opacity: 0.85,
        };
      },
    });
    App.layers.roads.loaded = true;
  } finally {
    hideLoading();
  }
}

// ─── POI layer ────────────────────────────────────────────────
async function loadPois() {
  if (App.layers.pois.loaded) return;
  showLoading('Loading points of interest…');
  try {
    const res = await fetch('/api/pois');
    const data = await res.json();
    App.layers.pois.data = data;
    App.layers.pois.loaded = true;
    buildPoiClusters();
  } finally {
    hideLoading();
  }
}

function buildPoiClusters() {
  Object.values(App.layers.pois.clusters).forEach(c => {
    if (App.map.hasLayer(c)) App.map.removeLayer(c);
  });
  App.layers.pois.clusters = {};

  const byCategory = {};
  App.layers.pois.data.features.forEach(f => {
    const cat = f.properties.category;
    (byCategory[cat] = byCategory[cat] || []).push(f);
  });

  Object.entries(byCategory).forEach(([cat, features]) => {
    const col = POI_COLORS[cat] || '#aaa';
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 45,
      iconCreateFunction(c) {
        const n = c.getChildCount();
        return L.divIcon({
          html: `<div style="background:${col};color:#fff;border-radius:50%;width:30px;height:30px;
                 display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;
                 border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25)">${n}</div>`,
          iconSize: [30, 30],
          className: '',
        });
      },
    });

    features.forEach(f => {
      const [lng, lat] = f.geometry.coordinates;
      const marker = L.circleMarker([lat, lng], {
        radius: 5,
        fillColor: col,
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.9,
      });
      const name = f.properties.name || cat.charAt(0).toUpperCase() + cat.slice(1);
      marker.bindPopup(
        `<b style="color:${col}"><i class="bi ${POI_ICONS[cat]}"></i> ${name}</b>` +
        `<br><span style="font-size:11px;color:#64748b">${cat}</span>`
      );
      cluster.addLayer(marker);
    });
    App.layers.pois.clusters[cat] = cluster;

    if (document.getElementById('layerPois').checked && App.poiActive.has(cat)) {
      cluster.addTo(App.map);
    }
  });
}

// ─── Image overlays ───────────────────────────────────────────
function refreshImageOverlays() {
  ['truecolor', 'classified'].forEach(type => {
    if (App.layers[type].layer) {
      App.map.removeLayer(App.layers[type].layer);
      App.layers[type].layer = null;
    }
  });

  const tcOn = document.getElementById('layerTruecolor').checked;
  const clOn = document.getElementById('layerClassified').checked;

  if (tcOn) {
    App.layers.truecolor.layer = new TransparentImageLayer(
      `/data/09_web/img/truecolor_${App.currentYear}.png`,
      IMG_BOUNDS,
      { opacity: App.imgOpacity, interactive: false }
    ).addTo(App.map);
  }
  if (clOn) {
    App.layers.classified.layer = new TransparentImageLayer(
      `/data/09_web/img/classified_${App.currentYear}.png`,
      IMG_BOUNDS,
      { opacity: App.imgOpacity, interactive: false }
    ).addTo(App.map);
  }
}

// ─── Hover tooltip ────────────────────────────────────────────
function showHoverTip(p, ev) {
  const tip = document.getElementById('hoverTip');
  const lbl = livabilityLabel(p.livability || 0);
  document.getElementById('htCellId').textContent = `#${p.cell_id}`;
  document.getElementById('htLiv').innerHTML =
    `<b style="color:${lbl.color}">${(p.livability || 0).toFixed(1)}</b>`;
  document.getElementById('htLivLabel').innerHTML =
    `<b style="color:${lbl.color}">${lbl.th}</b>`;
  document.getElementById('htGrowth').innerHTML =
    `<b style="color:${(p.growth_pct||0)>=0?'var(--green)':'var(--red)'}">${(p.growth_pct || 0).toFixed(1)}%</b>`;
  document.getElementById('htPoi').innerHTML = `<b>${p.poi_total || 0}</b>`;
  tip.style.display = 'block';
  moveHoverTip(ev);
}
function moveHoverTip(ev) {
  const tip = document.getElementById('hoverTip');
  const w = tip.offsetWidth;
  const x = ev.clientX + 14 + w > window.innerWidth ? ev.clientX - w - 14 : ev.clientX + 14;
  tip.style.left = x + 'px';
  tip.style.top = (ev.clientY - 10) + 'px';
}
function hideHoverTip() {
  document.getElementById('hoverTip').style.display = 'none';
}

// ─── Right info panel ─────────────────────────────────────────
function showInfoPanel(p) {
  App.currentCellProps = p;
  const yr = App.currentYear;
  const built = (p[`built_${yr}`] || 0) * 100;
  const veg   = (p[`veg_${yr}`]   || 0) * 100;
  const water = (p[`water_${yr}`] || 0) * 100;
  const bare  = (p[`bare_${yr}`]  || 0) * 100;

  const liv = p.livability || 0;
  const livColor = colorLivability(liv);
  const lbl = livabilityLabel(liv);
  const growth = p.growth_pct || 0;
  const growthClass = growth > 5 ? 'growth-pos' : growth < -5 ? 'growth-neg' : 'growth-neu';
  const growthIcon = growth > 5 ? 'bi-arrow-up-right'
                   : growth < -5 ? 'bi-arrow-down-right'
                   : 'bi-dash-lg';

  const maxPoi = Math.max(p.poi_medical||0, p.poi_recreation||0, p.poi_living||0,
                          p.poi_transport||0, p.poi_education||0, 1);

  const poiBar = (cat, label, val, color, icon) => `
    <div class="poi-bar-row">
      <span class="poi-bar-label"><i class="bi ${icon}" style="color:${color}"></i>${label}</span>
      <div class="poi-bar-track"><div class="poi-bar-fill" style="width:${(val/maxPoi*100)}%;background:${color}"></div></div>
      <span class="poi-bar-val">${val||0}</span>
    </div>`;

  const ndviColor = colorNDVI(p.ndvi_mean || 0);
  const uhiColor = colorUHI(p.uhi_proxy || 0);

  const isPinned = App.pinnedCells.some(c => c.cell_id === p.cell_id);

  document.getElementById('infoPanelContent').innerHTML = `
    <div class="info-section">
      <div class="info-cell-header">
        <div class="info-section-title" style="margin-bottom:0"><i class="bi bi-pin-map-fill"></i> Cell #${p.cell_id}</div>
        <button class="pin-cell-btn ${isPinned ? 'pinned' : ''}" onclick="pinCell(App.currentCellProps)">
          <i class="bi bi-pin-angle${isPinned ? '-fill' : ''}"></i>
          ${isPinned ? 'Pinned' : 'Pin'}
        </button>
      </div>
      <div class="gauge-wrap" style="margin-top:12px">
        <div class="gauge-track"><div class="gauge-fill" style="width:${liv}%;background:${livColor}"></div></div>
        <div class="gauge-val" style="color:${livColor}">${liv.toFixed(1)}</div>
      </div>
      <div class="gauge-cap">
        <span class="liv-band-pill" style="background:${lbl.color}22;color:${lbl.color};border-color:${lbl.color}55">${lbl.th}</span>
        <span class="gauge-cap-label">year ${yr}</span>
      </div>
    </div>

    <div class="info-section">
      <div class="info-section-title"><i class="bi bi-pie-chart-fill"></i> Land Cover ${yr}</div>
      <div class="lc-bar-stack">
        <div class="lc-seg" style="width:${built}%;background:#c0392b" title="Built ${built.toFixed(1)}%"></div>
        <div class="lc-seg" style="width:${veg}%;background:#27ae60" title="Veg ${veg.toFixed(1)}%"></div>
        <div class="lc-seg" style="width:${water}%;background:#2980b9" title="Water ${water.toFixed(1)}%"></div>
        <div class="lc-seg" style="width:${bare}%;background:#e67e22" title="Bare ${bare.toFixed(1)}%"></div>
      </div>
      <div class="lc-legend">
        <div class="lc-item"><div class="lc-dot2" style="background:#c0392b"></div>Built ${built.toFixed(1)}%</div>
        <div class="lc-item"><div class="lc-dot2" style="background:#27ae60"></div>Veg ${veg.toFixed(1)}%</div>
        <div class="lc-item"><div class="lc-dot2" style="background:#2980b9"></div>Water ${water.toFixed(1)}%</div>
        <div class="lc-item"><div class="lc-dot2" style="background:#e67e22"></div>Bare ${bare.toFixed(1)}%</div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-section-title"><i class="bi bi-graph-up-arrow"></i> Built Growth 2018→2026</div>
      <span class="growth-badge ${growthClass}">
        <i class="bi ${growthIcon}"></i>${growth.toFixed(1)}%
      </span>
    </div>

    <div class="info-section">
      <div class="info-section-title"><i class="bi bi-geo-alt-fill"></i> Points of Interest (${p.poi_total || 0} total)</div>
      ${poiBar('medical',    'Medical',    p.poi_medical || 0,    '#e74c3c', 'bi-hospital-fill')}
      ${poiBar('recreation', 'Recreation', p.poi_recreation || 0, '#27ae60', 'bi-tree-fill')}
      ${poiBar('living',     'Living',     p.poi_living || 0,     '#3498db', 'bi-shop')}
      ${poiBar('transport',  'Transport',  p.poi_transport || 0,  '#f39c12', 'bi-bus-front-fill')}
      ${poiBar('education',  'Education',  p.poi_education || 0,  '#9b59b6', 'bi-mortarboard-fill')}
      <div style="font-size:11px;color:var(--gray-400);margin-top:6px">
        Density: <b style="color:var(--gray-700)">${(p.poi_density||0).toFixed(2)}/km²</b>
      </div>
    </div>

    <div class="info-section">
      <div class="info-section-title"><i class="bi bi-pin-angle-fill"></i> Service Proximity</div>
      <div class="dist-grid">
        <div class="dist-card">
          <div class="dist-icon"><i class="bi bi-hospital"></i></div>
          <div class="dist-val">${Math.round(p.dist_medical||0)} m</div>
          <div class="dist-lbl">Medical</div>
        </div>
        <div class="dist-card">
          <div class="dist-icon"><i class="bi bi-mortarboard"></i></div>
          <div class="dist-val">${Math.round(p.dist_education||0)} m</div>
          <div class="dist-lbl">Education</div>
        </div>
        <div class="dist-card">
          <div class="dist-icon"><i class="bi bi-shop"></i></div>
          <div class="dist-val">${Math.round(p.dist_living||0)} m</div>
          <div class="dist-lbl">Living</div>
        </div>
        <div class="dist-card">
          <div class="dist-icon"><i class="bi bi-sign-turn-right"></i></div>
          <div class="dist-val">${Math.round(p.dist_main_road_m||0)} m</div>
          <div class="dist-lbl">Main Road</div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-section-title"><i class="bi bi-thermometer-half"></i> Environmental Indices</div>
      <div class="env-grid">
        <div class="env-card">
          <div class="env-val" style="color:${ndviColor}">${(p.ndvi_mean||0).toFixed(3)}</div>
          <div class="env-lbl">NDVI</div>
        </div>
        <div class="env-card">
          <div class="env-val" style="color:${uhiColor}">${(p.uhi_proxy||0).toFixed(3)}</div>
          <div class="env-lbl">UHI Proxy</div>
        </div>
        <div class="env-card">
          <div class="env-val" style="color:var(--blue-700)">${(p.gini_simpson||0).toFixed(3)}</div>
          <div class="env-lbl">POI Diversity</div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('infoPanel').classList.add('open');
}

// ─── Legend ───────────────────────────────────────────────────
function buildLegend() {
  const el = document.getElementById('legend');
  const gridOn  = document.getElementById('layerGrid').checked;
  const roadsOn = document.getElementById('layerRoads').checked;
  const poisOn  = document.getElementById('layerPois').checked;
  const tcOn    = document.getElementById('layerTruecolor').checked;
  const clOn    = document.getElementById('layerClassified').checked;

  let html = '';

  if (gridOn) {
    const def = LEGEND_DEFS[App.gridColorBy];
    html += `<div class="legend-group-title">${def.title}</div>`;
    def.items.forEach(([label, color]) => {
      html += `<div class="legend-item"><span class="leg-swatch" style="background:${color}"></span>${label}</div>`;
    });
  }
  if (roadsOn) {
    if (html) html += '<div style="height:6px"></div>';
    html += '<div class="legend-group-title">Road Network</div>';
    [['Primary / Trunk', ROAD_COLORS.primary], ['Secondary', ROAD_COLORS.secondary], ['Other', ROAD_COLORS.other]]
      .forEach(([l, c]) => {
        html += `<div class="legend-item"><span class="leg-line" style="background:${c}"></span>${l}</div>`;
      });
  }
  if (poisOn) {
    if (html) html += '<div style="height:6px"></div>';
    html += '<div class="legend-group-title">Points of Interest</div>';
    Object.entries(POI_COLORS).forEach(([cat, col]) => {
      if (App.poiActive.has(cat)) {
        html += `<div class="legend-item"><span class="leg-dot" style="background:${col}"></span>${cat[0].toUpperCase()+cat.slice(1)}</div>`;
      }
    });
  }
  if (clOn) {
    if (html) html += '<div style="height:6px"></div>';
    html += '<div class="legend-group-title">Land Cover</div>';
    [['Built-up', '#c0392b'], ['Vegetation', '#27ae60'], ['Water', '#2980b9'], ['Bare Land', '#e67e22']]
      .forEach(([l, c]) => {
        html += `<div class="legend-item"><span class="leg-swatch" style="background:${c}"></span>${l}</div>`;
      });
  }
  if (tcOn && !clOn) {
    if (html) html += '<div style="height:6px"></div>';
    html += '<div class="legend-group-title">True Color</div>';
    html += '<div class="legend-item" style="color:var(--gray-400);font-size:11px">Sentinel-2 RGB composite</div>';
  }

  el.innerHTML = html || '<span class="legend-empty">Enable layers to see legend.</span>';
}

// ─── Year selection ───────────────────────────────────────────
function setYear(y) {
  App.currentYear = y;
  document.getElementById('yearLabel').textContent = y;
  document.querySelectorAll('.year-chip').forEach(c => {
    c.classList.toggle('active', +c.dataset.y === y);
  });
  refreshImageOverlays();
}

// ─── Hex utility ──────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

// ─── Bind UI ──────────────────────────────────────────────────
function bindUI() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // Basemap
  document.querySelectorAll('.bm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const bm = btn.dataset.bm;
      if (bm === App.currentBM) return;
      App.map.removeLayer(App.basemaps[App.currentBM]);
      App.basemaps[bm].addTo(App.map);
      App.currentBM = bm;
      document.querySelectorAll('.bm-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Year chips
  document.querySelectorAll('.year-chip').forEach(chip => {
    chip.addEventListener('click', () => setYear(+chip.dataset.y));
  });

  // Play / pause animation
  document.getElementById('playBtn').addEventListener('click', () => {
    const btn = document.getElementById('playBtn');
    if (App.playTimer) {
      clearInterval(App.playTimer);
      App.playTimer = null;
      btn.innerHTML = '<i class="bi bi-play-fill"></i>';
    } else {
      btn.innerHTML = '<i class="bi bi-pause-fill"></i>';
      let idx = YEARS.indexOf(App.currentYear);
      App.playTimer = setInterval(() => {
        idx = (idx + 1) % YEARS.length;
        setYear(YEARS[idx]);
        if (idx === YEARS.length - 1) {
          clearInterval(App.playTimer);
          App.playTimer = null;
          btn.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
      }, 1100);
    }
  });

  // Image opacity
  document.getElementById('imgOpacity').addEventListener('input', e => {
    App.imgOpacity = +e.target.value / 100;
    document.getElementById('imgOpacityVal').textContent = `${e.target.value}%`;
    ['truecolor', 'classified'].forEach(t => {
      if (App.layers[t].layer) App.layers[t].layer.setOpacity(App.imgOpacity);
    });
  });

  // Image toggles
  ['layerTruecolor', 'layerClassified'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      const either = document.getElementById('layerTruecolor').checked ||
                     document.getElementById('layerClassified').checked;
      document.getElementById('imgOpts').style.display = either ? 'block' : 'none';
      refreshImageOverlays();
      buildLegend();
    });
  });

  // Grid
  document.getElementById('layerGrid').addEventListener('change', async e => {
    if (e.target.checked) {
      await loadGrid();
      document.getElementById('gridOpts').style.display = 'block';
      if (App.layers.grid.layer) App.layers.grid.layer.addTo(App.map);
    } else {
      document.getElementById('gridOpts').style.display = 'none';
      if (App.layers.grid.layer) App.map.removeLayer(App.layers.grid.layer);
    }
    buildLegend();
  });
  document.getElementById('gridColorBy').addEventListener('change', e => {
    App.gridColorBy = e.target.value;
    refreshGridStyle();
    buildLegend();
  });
  document.getElementById('gridOpacity').addEventListener('input', e => {
    App.gridOpacity = +e.target.value / 100;
    document.getElementById('gridOpacityVal').textContent = `${e.target.value}%`;
    if (App.layers.grid.layer) App.layers.grid.layer.setStyle({ fillOpacity: App.gridOpacity });
  });

  // Roads
  document.getElementById('layerRoads').addEventListener('change', async e => {
    if (e.target.checked) {
      await loadRoads();
      if (App.layers.roads.layer) App.layers.roads.layer.addTo(App.map);
    } else {
      if (App.layers.roads.layer) App.map.removeLayer(App.layers.roads.layer);
    }
    buildLegend();
  });

  // POIs
  document.getElementById('layerPois').addEventListener('change', async e => {
    if (e.target.checked) {
      await loadPois();
      document.getElementById('poisOpts').style.display = 'block';
      Object.entries(App.layers.pois.clusters).forEach(([cat, cluster]) => {
        if (App.poiActive.has(cat)) cluster.addTo(App.map);
      });
    } else {
      document.getElementById('poisOpts').style.display = 'none';
      Object.values(App.layers.pois.clusters).forEach(c => {
        if (App.map.hasLayer(c)) App.map.removeLayer(c);
      });
    }
    buildLegend();
  });

  // POI category chips — initialize active styles
  document.querySelectorAll('.cat-chip').forEach(chip => {
    const col = POI_COLORS[chip.dataset.cat];
    chip.style.background = `rgba(${hexToRgb(col)}, .14)`;
    chip.style.borderColor = `rgba(${hexToRgb(col)}, .4)`;
    chip.style.color = col;
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat;
      if (App.poiActive.has(cat)) {
        App.poiActive.delete(cat);
        chip.classList.remove('active');
        chip.style.background = 'var(--white)';
        chip.style.borderColor = 'var(--gray-200)';
        chip.style.color = 'var(--gray-500)';
        if (App.layers.pois.clusters[cat]) App.map.removeLayer(App.layers.pois.clusters[cat]);
      } else {
        App.poiActive.add(cat);
        chip.classList.add('active');
        chip.style.background = `rgba(${hexToRgb(col)}, .14)`;
        chip.style.borderColor = `rgba(${hexToRgb(col)}, .4)`;
        chip.style.color = col;
        if (App.layers.pois.clusters[cat] && document.getElementById('layerPois').checked) {
          App.layers.pois.clusters[cat].addTo(App.map);
        }
      }
      buildLegend();
    });
  });

  // Panel toggle
  document.getElementById('togglePanel').addEventListener('click', () => {
    document.getElementById('panel').classList.toggle('collapsed');
    setTimeout(() => App.map.invalidateSize(), 360);
  });

  // ── Split compare ────────────────────────────────────
  const YEARS_LIST = [2018,2019,2020,2021,2022,2023,2024,2025,2026];
  ['splitLeftYear','splitRightYear'].forEach((id, idx) => {
    const sel = document.getElementById(id);
    YEARS_LIST.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      if ((idx === 0 && y === 2018) || (idx === 1 && y === 2026)) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      if (idx === 0) App.splitCompare.leftYear  = +sel.value;
      else           App.splitCompare.rightYear = +sel.value;
      if (App.splitCompare.active) buildSplitLayers();
    });
  });

  document.getElementById('splitCompareToggle').addEventListener('click', () => {
    App.splitCompare.active ? deactivateSplitCompare() : activateSplitCompare();
  });

  document.querySelectorAll('.split-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.split-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      App.splitCompare.type = btn.dataset.type;
      if (App.splitCompare.active) buildSplitLayers();
    });
  });

  bindSplitSlider();

  // ── Pin & compare ────────────────────────────────────
  document.getElementById('pinCompareBtn').addEventListener('click', showCompareModal);
  document.getElementById('pinClearBtn').addEventListener('click', () => {
    App.pinnedCells = [];
    updatePinUI();
    if (App.currentCellProps) showInfoPanel(App.currentCellProps);
  });
  document.getElementById('compareModalClose').addEventListener('click', () => {
    document.getElementById('compareModal').classList.remove('open');
  });
  document.getElementById('compareModal').addEventListener('click', e => {
    if (e.target === document.getElementById('compareModal'))
      document.getElementById('compareModal').classList.remove('open');
  });

  // Right info panel close
  document.getElementById('infoPanelClose').addEventListener('click', () => {
    document.getElementById('infoPanel').classList.remove('open');
    App.selectedCellId = null;
    App.currentCellProps = null;
    refreshGridStyle();
    updateCellHighlight(null);
  });

  // Floating legend collapse
  const legendFloatToggle = document.getElementById('legendFloatToggle');
  if (legendFloatToggle) {
    legendFloatToggle.addEventListener('click', () => {
      document.getElementById('legendFloat').classList.toggle('collapsed');
    });
  }
}

// ═══════════════════════════════════════════════════════════
// SPLIT COMPARE
// ═══════════════════════════════════════════════════════════
function initSplitPanes() {
  if (!App.map.getPane('splitLeft')) {
    App.map.createPane('splitLeft');
    App.map.createPane('splitRight');
    App.map.getPane('splitLeft').style.zIndex  = 300;
    App.map.getPane('splitRight').style.zIndex = 300;
  }
}

// Recalculate clip in layer-point space so it follows map pan/zoom correctly
function _splitClip() {
  if (!App.splitCompare.active) return;
  const map = App.map;
  const pct = App.splitCompare.position / 100;
  const size = map.getSize();
  const nw = map.containerPointToLayerPoint(L.point(0, 0));
  const se = map.containerPointToLayerPoint(L.point(size.x, size.y));
  const cx = nw.x + (se.x - nw.x) * pct;

  const lp = map.getPane('splitLeft');
  const rp = map.getPane('splitRight');
  if (lp) lp.style.clip = `rect(${nw.y}px, ${cx}px, ${se.y}px, ${nw.x}px)`;
  if (rp) rp.style.clip = `rect(${nw.y}px, ${se.x}px, ${se.y}px, ${cx}px)`;
}

function buildSplitLayers() {
  if (App.splitCompare.leftLayer)  { App.map.removeLayer(App.splitCompare.leftLayer);  App.splitCompare.leftLayer  = null; }
  if (App.splitCompare.rightLayer) { App.map.removeLayer(App.splitCompare.rightLayer); App.splitCompare.rightLayer = null; }

  const pfx = App.splitCompare.type === 'classified' ? 'classified' : 'truecolor';

  App.splitCompare.leftLayer = new TransparentImageLayer(
    `/data/09_web/img/${pfx}_${App.splitCompare.leftYear}.png`,
    IMG_BOUNDS, { opacity: App.imgOpacity, interactive: false, pane: 'splitLeft' }
  ).addTo(App.map);

  App.splitCompare.rightLayer = new TransparentImageLayer(
    `/data/09_web/img/${pfx}_${App.splitCompare.rightYear}.png`,
    IMG_BOUNDS, { opacity: App.imgOpacity, interactive: false, pane: 'splitRight' }
  ).addTo(App.map);

  document.getElementById('splitBadgeLeft').textContent  = App.splitCompare.leftYear;
  document.getElementById('splitBadgeRight').textContent = App.splitCompare.rightYear;
}

function updateSplitPosition(pct) {
  pct = Math.max(5, Math.min(95, pct));
  App.splitCompare.position = pct;
  document.getElementById('splitSlider').style.left = pct + '%';
  _splitClip();
}

function activateSplitCompare() {
  initSplitPanes();
  App.splitCompare.active = true;
  ['truecolor', 'classified'].forEach(t => {
    if (App.layers[t].layer) { App.map.removeLayer(App.layers[t].layer); App.layers[t].layer = null; }
  });
  buildSplitLayers();
  App.map.on('move zoom', _splitClip);
  document.getElementById('splitSlider').style.display = 'block';
  updateSplitPosition(App.splitCompare.position);
  document.getElementById('splitCompareToggle').classList.add('active');
  document.getElementById('splitCompareOpts').style.display = 'block';
}

function deactivateSplitCompare() {
  App.map.off('move zoom', _splitClip);
  App.splitCompare.active = false;
  if (App.splitCompare.leftLayer)  { App.map.removeLayer(App.splitCompare.leftLayer);  App.splitCompare.leftLayer  = null; }
  if (App.splitCompare.rightLayer) { App.map.removeLayer(App.splitCompare.rightLayer); App.splitCompare.rightLayer = null; }
  const lp = App.map.getPane('splitLeft');
  const rp = App.map.getPane('splitRight');
  if (lp) lp.style.clip = '';
  if (rp) rp.style.clip = '';
  refreshImageOverlays();
  document.getElementById('splitSlider').style.display = 'none';
  document.getElementById('splitCompareToggle').classList.remove('active');
  document.getElementById('splitCompareOpts').style.display = 'none';
}

function bindSplitSlider() {
  const handle = document.getElementById('splitHandle');
  const getMapPct = clientX => {
    const r = App.map.getContainer().getBoundingClientRect();
    return ((clientX - r.left) / r.width) * 100;
  };
  handle.addEventListener('mousedown', e => { App.splitCompare.dragging = true; e.preventDefault(); });
  document.addEventListener('mousemove', e => {
    if (!App.splitCompare.dragging) return;
    updateSplitPosition(getMapPct(e.clientX));
  });
  document.addEventListener('mouseup', () => { App.splitCompare.dragging = false; });
  handle.addEventListener('touchstart', e => { App.splitCompare.dragging = true; e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', e => {
    if (!App.splitCompare.dragging) return;
    updateSplitPosition(getMapPct(e.touches[0].clientX));
  }, { passive: true });
  document.addEventListener('touchend', () => { App.splitCompare.dragging = false; });
}

// ═══════════════════════════════════════════════════════════
// PIN & COMPARE
// ═══════════════════════════════════════════════════════════
function pinCell(p) {
  if (!p) return;
  if (App.pinnedCells.some(c => c.cell_id === p.cell_id)) {
    unpinCell(p.cell_id); return;
  }
  if (App.pinnedCells.length >= 3) { toast('สูงสุด 3 เซลล์ที่ pin ได้'); return; }
  App.pinnedCells.push(p);
  updatePinUI();
  toast(`Cell #${p.cell_id} pinned`);
  if (App.currentCellProps && App.currentCellProps.cell_id === p.cell_id) showInfoPanel(p);
}

function unpinCell(cellId) {
  App.pinnedCells = App.pinnedCells.filter(c => c.cell_id !== cellId);
  updatePinUI();
  if (App.currentCellProps && App.currentCellProps.cell_id === cellId) showInfoPanel(App.currentCellProps);
}

function updatePinUI() {
  const n = App.pinnedCells.length;
  const bar  = document.getElementById('pinBar');

  // Pin bar (floating bottom)
  if (n === 0) {
    bar.classList.remove('visible');
  } else {
    bar.classList.add('visible');
    document.getElementById('pinBarCells').innerHTML = App.pinnedCells.map(p => {
      const lbl = livabilityLabel(p.livability || 0);
      return `<div class="pinbar-chip">
        <span class="pinbar-id">#${p.cell_id}</span>
        <span class="pinbar-score" style="color:${lbl.color}">${(p.livability||0).toFixed(0)}</span>
        <button class="pinbar-rm" onclick="unpinCell(${p.cell_id})"><i class="bi bi-x"></i></button>
      </div>`;
    }).join('');
    document.getElementById('pinCompareBtn').style.display = n >= 2 ? 'inline-flex' : 'none';
  }
}

function showCompareModal() {
  const cells = App.pinnedCells;
  if (cells.length < 2) return;
  const yr = App.currentYear;
  const metrics = [
    { key: 'Livability',        fn: p => (p.livability||0).toFixed(1),              color: p => colorLivability(p.livability||0) },
    { key: 'Rating',            fn: p => livabilityLabel(p.livability||0).th,        color: p => livabilityLabel(p.livability||0).color },
    { key: `Built ${yr}`,       fn: p => ((p[`built_${yr}`]||0)*100).toFixed(1)+'%' },
    { key: `Veg ${yr}`,         fn: p => ((p[`veg_${yr}`]||0)*100).toFixed(1)+'%' },
    { key: 'Growth 18→26',      fn: p => ((p.growth_pct||0)>0?'+':'')+((p.growth_pct||0).toFixed(1))+'%', color: p => (p.growth_pct||0)>=0?'var(--green)':'var(--red)' },
    { key: 'Total POIs',        fn: p => (p.poi_total||0).toLocaleString() },
    { key: 'POI Density',       fn: p => (p.poi_density||0).toFixed(2)+'/km²' },
    { key: 'NDVI',              fn: p => (p.ndvi_mean||0).toFixed(3),               color: p => colorNDVI(p.ndvi_mean||0) },
    { key: 'UHI Proxy',         fn: p => (p.uhi_proxy||0).toFixed(3),               color: p => colorUHI(p.uhi_proxy||0) },
    { key: 'Dist Medical',      fn: p => Math.round(p.dist_medical||0)+' m' },
    { key: 'Dist Education',    fn: p => Math.round(p.dist_education||0)+' m' },
    { key: 'Dist Main Road',    fn: p => Math.round(p.dist_main_road_m||0)+' m' },
  ];

  const colHdr = cells.map(p => `<div class="cmp-cell-col" style="font-weight:700">Cell #${p.cell_id}</div>`).join('');
  let html = `<div class="cmp-header-row"><div class="cmp-metric-col">Metric</div>${colHdr}</div>`;
  metrics.forEach(m => {
    const cols = cells.map(p => {
      const val = m.fn(p);
      const col = m.color ? m.color(p) : 'var(--ink)';
      return `<div class="cmp-cell-col" style="color:${col}">${val}</div>`;
    }).join('');
    html += `<div class="cmp-row"><div class="cmp-metric-col">${m.key}</div>${cols}</div>`;
  });

  document.getElementById('compareModalContent').innerHTML = html;
  document.getElementById('compareModal').classList.add('open');
}

// ═══════════════════════════════════════════════════════════
// DRAW CUSTOM AREA
// ═══════════════════════════════════════════════════════════
function _raycast([px, py], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi))
      inside = !inside;
  }
  return inside;
}

function _cellCentroid(f) {
  const c = f.geometry.coordinates[0];
  const n = c.length - 1;
  let x = 0, y = 0;
  for (let i = 0; i < n; i++) { x += c[i][0]; y += c[i][1]; }
  return [x / n, y / n];
}

function startDraw() {
  if (!App.layers.grid.loaded) { toast('Load the Analysis Grid layer first.'); return; }
  clearDraw(true);
  App.drawMode.active = true;
  document.body.classList.add('draw-active');
  App.map.doubleClickZoom.disable();

  App.map._onDrawClick = e => {
    if (!App.drawMode.active) return;
    App.drawMode.points.push(e.latlng);
    _updateTempDraw();
  };
  App.map._onDrawDbl = e => {
    L.DomEvent.stop(e);
    if (App.drawMode.points.length >= 3) finishDraw();
    else toast('Need at least 3 points.');
  };
  App.map.on('click', App.map._onDrawClick);
  App.map.on('dblclick', App.map._onDrawDbl);

  const btn = document.getElementById('drawToggleBtn');
  btn.classList.add('active');
  btn.innerHTML = '<i class="bi bi-stop-circle"></i> Stop Drawing';
  btn.onclick = finishDraw;
  toast('Click to add vertices · Double-click to finish', 3000);
}

function _updateTempDraw() {
  if (App.drawMode.tempPolyline) {
    App.drawMode.tempPolyline.setLatLngs(App.drawMode.points);
  } else {
    App.drawMode.tempPolyline = L.polyline(App.drawMode.points,
      { color: '#0f2557', weight: 2, dashArray: '6,4' }).addTo(App.map);
  }
  App.drawMode.points.forEach((ll, i) => {
    if (!App.drawMode._dots[i]) {
      App.drawMode._dots[i] = L.circleMarker(ll,
        { radius: 5, fillColor: '#0f2557', color: '#fff', weight: 2, fillOpacity: 1 }
      ).addTo(App.map);
    }
  });
}

function finishDraw() {
  if (App.drawMode.points.length < 3) { toast('Need at least 3 points.'); return; }
  App.drawMode.active = false;
  document.body.classList.remove('draw-active');
  App.map.off('click', App.map._onDrawClick);
  App.map.off('dblclick', App.map._onDrawDbl);
  App.map.doubleClickZoom.enable();

  if (App.drawMode.tempPolyline) { App.map.removeLayer(App.drawMode.tempPolyline); App.drawMode.tempPolyline = null; }
  App.drawMode._dots.forEach(d => App.map.removeLayer(d));
  App.drawMode._dots = [];

  App.drawMode.polygon = L.polygon(App.drawMode.points,
    { color: '#0f2557', weight: 2, fillColor: '#0f2557', fillOpacity: 0.08 }
  ).addTo(App.map);

  const ring = [...App.drawMode.points.map(ll => [ll.lng, ll.lat])];
  ring.push(ring[0]);
  const sel = (App.layers.grid.data?.features || []).filter(f => _raycast(_cellCentroid(f), ring));

  _showDrawStats(sel);

  const btn = document.getElementById('drawToggleBtn');
  btn.classList.remove('active');
  btn.innerHTML = '<i class="bi bi-pencil"></i> Draw New Area';
  btn.onclick = startDraw;
  document.getElementById('drawClearBtn').style.display = 'flex';
}

function clearDraw(silent) {
  App.drawMode.active = false;
  App.drawMode.points = [];
  document.body.classList.remove('draw-active');
  if (App.map._onDrawClick) { App.map.off('click', App.map._onDrawClick); App.map.off('dblclick', App.map._onDrawDbl); }
  App.map.doubleClickZoom.enable();
  if (App.drawMode.tempPolyline) { App.map.removeLayer(App.drawMode.tempPolyline); App.drawMode.tempPolyline = null; }
  if (App.drawMode.polygon) { App.map.removeLayer(App.drawMode.polygon); App.drawMode.polygon = null; }
  App.drawMode._dots.forEach(d => App.map.removeLayer(d)); App.drawMode._dots = [];
  document.getElementById('drawStats').style.display = 'none';
  document.getElementById('drawClearBtn').style.display = 'none';
  const btn = document.getElementById('drawToggleBtn');
  if (btn) { btn.classList.remove('active'); btn.innerHTML = '<i class="bi bi-pencil"></i> Start Drawing'; btn.onclick = startDraw; }
}

function _showDrawStats(features) {
  const el = document.getElementById('drawStats');
  const n = features.length;
  if (!n) { el.innerHTML = '<div class="draw-empty">ไม่พบ grid cell ในพื้นที่ที่วาด</div>'; el.style.display = 'block'; return; }

  const props = features.map(f => f.properties);
  const avg   = key => props.reduce((s, p) => s + (p[key]||0), 0) / n;
  const yr    = App.currentYear;
  const avgLiv = avg('livability');
  const lbl    = livabilityLabel(avgLiv);
  const avgGrw = avg('growth_pct');

  el.innerHTML = `
    <div class="draw-result-card">
      <div class="draw-result-title"><i class="bi bi-hexagon-fill"></i> Area Statistics</div>
      <div class="draw-result-kpi-grid">
        <div class="draw-kpi"><div class="draw-kpi-val">${n}</div><div class="draw-kpi-lbl">cells</div></div>
        <div class="draw-kpi"><div class="draw-kpi-val">${(n*0.0625).toFixed(2)}</div><div class="draw-kpi-lbl">km²</div></div>
      </div>
      <div class="draw-stat-row"><span class="draw-stat-key">Avg Livability</span>
        <span class="draw-stat-val" style="color:${lbl.color}">${avgLiv.toFixed(1)} · ${lbl.th}</span></div>
      <div class="draw-stat-row"><span class="draw-stat-key">Avg Growth</span>
        <span class="draw-stat-val" style="color:${avgGrw>=0?'var(--green)':'var(--red)'}">${avgGrw>=0?'+':''}${avgGrw.toFixed(1)}%</span></div>
      <div class="draw-stat-row"><span class="draw-stat-key">Total POIs</span>
        <span class="draw-stat-val">${props.reduce((s,p)=>s+(p.poi_total||0),0).toLocaleString()}</span></div>
      <div class="draw-stat-row"><span class="draw-stat-key">Avg POI Density</span>
        <span class="draw-stat-val">${avg('poi_density').toFixed(2)}/km²</span></div>
      <div class="draw-stat-row"><span class="draw-stat-key">Avg NDVI</span>
        <span class="draw-stat-val" style="color:${colorNDVI(avg('ndvi_mean'))}">${avg('ndvi_mean').toFixed(3)}</span></div>
      <div class="draw-stat-row"><span class="draw-stat-key">Built ${yr}</span>
        <span class="draw-stat-val">${(avg(`built_${yr}`)*100).toFixed(1)}%</span></div>
      <div class="draw-stat-row"><span class="draw-stat-key">Vegetation ${yr}</span>
        <span class="draw-stat-val">${(avg(`veg_${yr}`)*100).toFixed(1)}%</span></div>
    </div>`;
  el.style.display = 'block';
}

// ─── Hotspot navigation (called from charts.js) ───────────────
function flyToCell(cellId) {
  const f = App.layers.grid.byId[cellId];
  if (!f) {
    toast('Enable the analysis grid first to navigate to cells.');
    return;
  }
  const layer = L.geoJSON(f);
  const c = layer.getBounds().getCenter();
  App.map.flyTo(c, 14, { duration: 0.8 });
  showInfoPanel(f.properties);
}
