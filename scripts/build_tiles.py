"""Pre-generate MVT vector tiles from phuket_grid.geojson.

Outputs: data/09_web/tiles/{z}/{x}/{y}.pbf
Zoom levels: 10 - 14 (covers Phuket at all useful map scales)

Run once locally then commit the tile files. The frontend reads tiles
via /api/tiles/{z}/{x}/{y}.pbf — no server-side generation needed.
"""

from __future__ import annotations

import json
import pathlib
import sys
import time

import mapbox_vector_tile
import mercantile
from shapely.geometry import box, mapping, shape

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "09_web" / "phuket_grid.geojson"
OUT_DIR = ROOT / "data" / "09_web" / "tiles"
ZOOMS = range(10, 15)
EXTENT = 4096

# Keep only properties the frontend actually consumes (popups, styling).
# Dropped: raw counts, intermediate stats, and per-class km² values.
KEEP_PROPS = {
    "cell_id",
    "livability",
    "growth_pct",
    "poi_density",
    "uhi_proxy",
    "ndvi_mean",
    "gini_simpson",
    "poi_total",
    "poi_medical",
    "poi_recreation",
    "poi_living",
    "poi_transport",
    "poi_education",
    "dist_medical",
    "dist_education",
    "dist_living",
    "dist_main_road_m",
}
for yr in range(2018, 2027):
    for cls in ("built", "veg", "water", "bare"):
        KEEP_PROPS.add(f"{cls}_{yr}")


def prune(props: dict) -> dict:
    out = {}
    for k in KEEP_PROPS:
        if k not in props:
            continue
        v = props[k]
        if isinstance(v, float):
            v = round(v, 4)
        out[k] = v
    return out


def main() -> int:
    if not SRC.exists():
        print(f"Source not found: {SRC}", file=sys.stderr)
        return 1

    with open(SRC, encoding="utf-8") as f:
        gj = json.load(f)

    features = []
    minx = miny = float("inf")
    maxx = maxy = float("-inf")
    for ft in gj["features"]:
        geom = shape(ft["geometry"])
        features.append({"geom": geom, "props": prune(ft["properties"]), "bbox": geom.bounds})
        bx0, by0, bx1, by1 = geom.bounds
        minx = min(minx, bx0)
        miny = min(miny, by0)
        maxx = max(maxx, bx1)
        maxy = max(maxy, by1)

    print(f"Loaded {len(features)} features")
    print(f"Bounds: ({minx:.4f}, {miny:.4f}) -> ({maxx:.4f}, {maxy:.4f})")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tile_count = 0
    total_bytes = 0
    t0 = time.time()

    for z in ZOOMS:
        tiles = list(mercantile.tiles(minx, miny, maxx, maxy, z))
        z_count = 0
        z_bytes = 0
        for t in tiles:
            tb = mercantile.bounds(t)
            tile_box = box(tb.west, tb.south, tb.east, tb.north)
            tile_features = []
            for f in features:
                fbx0, fby0, fbx1, fby1 = f["bbox"]
                if fbx1 < tb.west or fbx0 > tb.east or fby1 < tb.south or fby0 > tb.north:
                    continue
                clipped = f["geom"].intersection(tile_box)
                if clipped.is_empty:
                    continue
                tile_features.append({
                    "geometry": mapping(clipped),
                    "properties": f["props"],
                })
            if not tile_features:
                continue

            pbf = mapbox_vector_tile.encode([{
                "name": "grid",
                "features": tile_features,
            }], quantize_bounds=(tb.west, tb.south, tb.east, tb.north), extents=EXTENT)

            out_path = OUT_DIR / str(z) / str(t.x) / f"{t.y}.pbf"
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(pbf)
            z_count += 1
            z_bytes += len(pbf)

        tile_count += z_count
        total_bytes += z_bytes
        print(f"  z={z}: {z_count} tiles, {z_bytes/1024:.1f} KB")

    print(f"\nDone — {tile_count} tiles, {total_bytes/1024:.1f} KB total in {time.time()-t0:.1f}s")
    print(f"Output: {OUT_DIR}")

    # Cell index: cell_id -> [lng, lat] centroid + a few key props for hotspots / fly-to.
    index_path = ROOT / "data" / "09_web" / "cell_index.json"
    index = {}
    for f in features:
        cid = f["props"]["cell_id"]
        c = f["geom"].centroid
        index[str(cid)] = [round(c.x, 6), round(c.y, 6)]
    with open(index_path, "w", encoding="utf-8") as fp:
        json.dump(index, fp, separators=(",", ":"))
    print(f"Cell index: {index_path} ({len(index)} entries, {index_path.stat().st_size/1024:.1f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
