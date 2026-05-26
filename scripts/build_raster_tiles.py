"""Slice the truecolor / classified PNG overlays into XYZ raster tiles.

For each (layer, year) in {truecolor, classified} x {2018..2026}:
1. Load the source PNG and make the background transparent (corner-pixel sample).
2. Slice into 256x256 tiles for zoom 10-13 covering Phuket bounds.
3. Write to data/09_web/raster_tiles/{layer}_{year}/{z}/{x}/{y}.png.

The frontend then uses L.tileLayer instead of L.ImageOverlay — progressive
loading, no client-side canvas processing.
"""

from __future__ import annotations

import pathlib
import sys
import time

import mercantile
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "data" / "09_web" / "img"
OUT_DIR = ROOT / "data" / "09_web" / "raster_tiles"

# Geographic extent of source PNGs (matches IMG_BOUNDS in frontend/map.js)
BBOX = (98.257633, 7.478686, 98.483215, 8.200237)  # west, south, east, north
ZOOMS = range(10, 14)  # 10..13 inclusive (source ~20m/px ≈ native z=11)
TILE_SIZE = 256
BG_TOLERANCE = 10  # per-channel match to corner-pixel bg


def make_transparent(im: Image.Image) -> Image.Image:
    """Zero alpha for pixels matching the corner-pixel colour within tolerance."""
    im = im.convert("RGBA")
    arr = np.array(im)
    bg = arr[0, 0, :3].astype(int)
    diff = np.abs(arr[..., :3].astype(int) - bg)
    mask = (diff[..., 0] < BG_TOLERANCE) & (diff[..., 1] < BG_TOLERANCE) & (diff[..., 2] < BG_TOLERANCE)
    arr[..., 3][mask] = 0
    return Image.fromarray(arr, "RGBA")


def slice_into_tiles(im: Image.Image, layer_dir: pathlib.Path) -> tuple[int, int]:
    W, H = im.size
    bw, bs, be, bn = BBOX
    tile_count = 0
    total_bytes = 0
    for z in ZOOMS:
        for t in mercantile.tiles(bw, bs, be, bn, z):
            tb = mercantile.bounds(t)
            ix_w = max(bw, tb.west)
            ix_e = min(be, tb.east)
            ix_n = min(bn, tb.north)
            ix_s = max(bs, tb.south)
            if ix_e <= ix_w or ix_n <= ix_s:
                continue
            src_w_px = (ix_w - bw) / (be - bw) * W
            src_e_px = (ix_e - bw) / (be - bw) * W
            src_n_px = (bn - ix_n) / (bn - bs) * H
            src_s_px = (bn - ix_s) / (bn - bs) * H
            crop = im.crop((int(src_w_px), int(src_n_px), int(src_e_px), int(src_s_px)))
            if crop.size[0] < 1 or crop.size[1] < 1 or not crop.getbbox():
                continue
            tx_w = (ix_w - tb.west) / (tb.east - tb.west) * TILE_SIZE
            tx_e = (ix_e - tb.west) / (tb.east - tb.west) * TILE_SIZE
            ty_n = (tb.north - ix_n) / (tb.north - tb.south) * TILE_SIZE
            ty_s = (tb.north - ix_s) / (tb.north - tb.south) * TILE_SIZE
            target_w = max(1, int(round(tx_e - tx_w)))
            target_h = max(1, int(round(ty_s - ty_n)))
            crop_resized = crop.resize((target_w, target_h), Image.LANCZOS)
            tile_img = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), (0, 0, 0, 0))
            tile_img.paste(crop_resized, (int(round(tx_w)), int(round(ty_n))))
            out_path = layer_dir / str(z) / str(t.x) / f"{t.y}.png"
            out_path.parent.mkdir(parents=True, exist_ok=True)
            tile_img.save(out_path, optimize=True)
            tile_count += 1
            total_bytes += out_path.stat().st_size
    return tile_count, total_bytes


def main() -> int:
    if not SRC_DIR.exists():
        print(f"Source dir not found: {SRC_DIR}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    grand_total_tiles = 0
    grand_total_bytes = 0
    t0 = time.time()

    for layer in ("truecolor", "classified"):
        for year in range(2018, 2027):
            src = SRC_DIR / f"{layer}_{year}.png"
            if not src.exists():
                continue
            name = f"{layer}_{year}"
            print(f"Slicing {name} ...", end=" ", flush=True)
            t_start = time.time()
            im = Image.open(src)
            im = make_transparent(im)
            tiles, total = slice_into_tiles(im, OUT_DIR / name)
            grand_total_tiles += tiles
            grand_total_bytes += total
            print(f"{tiles} tiles, {total/1024:.0f} KB ({time.time()-t_start:.1f}s)")

    print(f"\nDone — {grand_total_tiles} tiles, {grand_total_bytes/1024/1024:.1f} MB total in {time.time()-t0:.1f}s")
    print(f"Output: {OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
