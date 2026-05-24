import csv
import json
import os

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Phuket WebGIS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=512)

DATA_WEB = "data/09_web"


def _read_csv(path: str):
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = []
        for r in reader:
            for k, v in r.items():
                if v == "":
                    r[k] = None
                    continue
                try:
                    r[k] = float(v) if "." in v or "e" in v.lower() else int(v)
                except (TypeError, ValueError):
                    pass
            rows.append(r)
        return rows


@app.get("/api/stats")
async def get_stats():
    with open(f"{DATA_WEB}/phuket_summary.json") as f:
        return json.load(f)


@app.get("/api/landcover-yearly")
async def get_landcover_yearly():
    return _read_csv(f"{DATA_WEB}/01_yearly_landcover.csv")


@app.get("/api/poi-summary")
async def get_poi_summary():
    return _read_csv(f"{DATA_WEB}/02_poi_summary.csv")


@app.get("/api/livability-distribution")
async def get_livability_distribution():
    return _read_csv(f"{DATA_WEB}/03_livability_distribution.csv")


@app.get("/api/accessibility")
async def get_accessibility():
    return _read_csv(f"{DATA_WEB}/05_accessibility.csv")


@app.get("/api/hotspots")
async def get_hotspots():
    return _read_csv(f"{DATA_WEB}/04_hotspot_cells.csv")


@app.get("/api/grid")
async def get_grid():
    return FileResponse(
        f"{DATA_WEB}/phuket_grid.geojson",
        media_type="application/geo+json",
    )


@app.get("/api/tiles/{z}/{x}/{y}.pbf")
async def get_tile(z: int, x: int, y: int):
    path = f"{DATA_WEB}/tiles/{z}/{x}/{y}.pbf"
    if not os.path.exists(path):
        # Empty 204 — VectorGrid handles missing tiles gracefully
        return Response(status_code=204)
    with open(path, "rb") as f:
        data = f.read()
    return Response(
        content=data,
        media_type="application/x-protobuf",
        headers={"Cache-Control": "public, max-age=86400"},
    )


@app.get("/api/cell-index")
async def get_cell_index():
    return FileResponse(
        f"{DATA_WEB}/cell_index.json",
        media_type="application/json",
        headers={"Cache-Control": "public, max-age=86400"},
    )


@app.get("/api/pois")
async def get_pois():
    return FileResponse(
        f"{DATA_WEB}/phuket_pois.geojson",
        media_type="application/geo+json",
    )


@app.get("/api/roads")
async def get_roads():
    return FileResponse(
        f"{DATA_WEB}/phuket_roads_main.geojson",
        media_type="application/geo+json",
    )


# Serve raster images and CSV/JSON data files
app.mount("/data", StaticFiles(directory="data"), name="data")

# Serve frontend SPA — must be mounted last
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
