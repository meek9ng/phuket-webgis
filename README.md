# Phuket WebGIS

Interactive WebGIS for Phuket land use & livability analysis (2018–2026).

- **Live demo**: https://phuket-webgis.onrender.com
- **Source code**: https://github.com/meek9ng/phuket-webgis

## What's included

- Interactive Leaflet map with 9 years of Sentinel-2 imagery (true-color + classified)
- 250 m analysis grid served as MVT vector tiles (9,644 cells, color by livability / growth / NDVI / UHI / POI density)
- 244,016 OpenStreetMap POIs (medical, recreation, living, transport, education)
- Split-compare slider (year vs year)
- Hotspot navigator (top livability, fastest-growing, risk cells)
- TH / EN language toggle
- Editorial landing page with project overview

## Run locally

```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Open http://127.0.0.1:8000

## Project structure

```
phuket_webgis/
├─ main.py                  FastAPI backend (API endpoints + static serving)
├─ requirements.txt
├─ render.yaml              Render Blueprint deployment config
├─ frontend/
│  ├─ index.html            Landing page (editorial)
│  ├─ map.html              Interactive map page
│  ├─ map.js                Map module (layers, state, interactions)
│  ├─ charts.js             SVG chart module
│  ├─ i18n.js               TH / EN dictionary + toggle
│  ├─ style.css             Map page styles
│  └─ home.css              Landing page styles
├─ scripts/
│  ├─ build_tiles.py        Pre-generate MVT vector tiles from grid GeoJSON
│  └─ build_raster_tiles.py Pre-generate XYZ raster tiles from PNG overlays
└─ data/09_web/
   ├─ *.csv, *.json         Summary statistics
   ├─ *.geojson             Grid / POIs / roads vectors
   ├─ img/                  Source Sentinel-2 PNGs (9 years × 2 types)
   ├─ tiles/                Pre-generated MVT vector tiles
   ├─ raster_tiles/         Pre-generated XYZ raster tiles
   └─ cell_index.json       Cell centroid lookup for fly-to navigation
```

## Regenerating tiles

If you modify the source data, regenerate the tile pyramids:

```bash
python scripts/build_tiles.py         # MVT vector tiles (z=10-14)
python scripts/build_raster_tiles.py  # XYZ raster tiles (z=10-13)
```

Requires: `pip install mapbox-vector-tile mercantile shapely Pillow numpy`

## API endpoints

| Endpoint | Purpose |
|---|---|
| `/api/stats` | Summary KPIs |
| `/api/landcover-yearly` | Yearly land-cover composition |
| `/api/poi-summary` | POI counts by category |
| `/api/livability-distribution` | Livability score histogram |
| `/api/accessibility` | Accessibility deciles |
| `/api/hotspots` | Top cells by rank type |
| `/api/grid` | Full grid GeoJSON (fallback) |
| `/api/pois`, `/api/roads` | POI / roads GeoJSON |
| `/api/tiles/{z}/{x}/{y}.pbf` | MVT vector tiles for grid |
| `/api/img-tiles/{layer}/{z}/{x}/{y}.png` | Raster tiles for overlays |
| `/api/cell-index` | Cell ID → centroid lookup |

## Deployment (Render)

`render.yaml` is included. To deploy your own copy:

1. Push the repo to GitHub.
2. Go to https://dashboard.render.com → New → Blueprint.
3. Connect the GitHub repo. Render reads `render.yaml` and provisions the service.
4. URL will be `https://<service-name>.onrender.com`.

Free plan spins down after 15 min idle (first request after sleep takes ~30s to wake).

## Tech stack

- **Backend**: FastAPI · Uvicorn
- **Frontend**: Leaflet 1.9.4 · Leaflet.VectorGrid 1.3 · MarkerCluster 1.5 · Bootstrap Icons · Vanilla HTML/CSS/JS
- **Tile generation**: mapbox-vector-tile · mercantile · shapely · Pillow · numpy
- **Data sources**: Sentinel-2 (Copernicus) · OpenStreetMap (Geofabrik) · GADM / DOL Thailand
