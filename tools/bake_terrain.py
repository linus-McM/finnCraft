#!/usr/bin/env python3
"""Bake a heightmap for the Itacaré area into data/terrain.bin + data/terrain.json.

Source: AWS Terrain Tiles (Mapzen "terrarium" encoding, public domain-ish
SRTM/other DEMs). Each PNG pixel encodes elevation as:
    height_m = (R * 256 + G + B / 256) - 32768

The output grid is sampled uniformly in Web Mercator space so it lines up
exactly with mercator image tiles used for the satellite texture.

Usage:  python3 tools/bake_terrain.py
Requires: Pillow, numpy
"""
import io
import json
import math
import os
import urllib.request

import numpy as np
from PIL import Image

# Bounding box: Itacaré town + beaches south to Itacarezinho.
WEST, EAST = -39.085, -38.960
SOUTH, NORTH = -14.410, -14.245
ZOOM = 13  # ~19 m / px at this latitude; close to the source SRTM resolution
GRID_W = 512  # output samples across (east-west)

URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def lon_to_mx(lon):  # mercator x in [0, 1]
    return (lon + 180.0) / 360.0


def lat_to_my(lat):  # mercator y in [0, 1], 0 = north
    s = math.sin(math.radians(lat))
    return 0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)


def fetch_tile(z, x, y):
    with urllib.request.urlopen(URL.format(z=z, x=x, y=y), timeout=30) as r:
        img = Image.open(io.BytesIO(r.read())).convert("RGB")
    a = np.asarray(img, dtype=np.float64)
    return a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768


def flatten_ocean(h, threshold=2.0):
    """Flood-fill low cells connected to the east (Atlantic) edge and set them
    to -2 m so the sea renders flat under the water plane. Low-lying land
    (the town, river flats) that isn't connected to the open sea is kept."""
    low = h < threshold
    sea = np.zeros_like(low)
    stack = [(y, h.shape[1] - 1) for y in range(h.shape[0]) if low[y, -1]]
    while stack:
        y, x = stack.pop()
        if sea[y, x] or not low[y, x]:
            continue
        sea[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h.shape[0] and 0 <= nx < h.shape[1] and not sea[ny, nx]:
                stack.append((ny, nx))
    h = h.copy()
    h[sea] = -2.0
    h[~sea] = np.maximum(h[~sea], 0.2)
    return h


def main():
    n = 2 ** ZOOM
    mx0, mx1 = lon_to_mx(WEST), lon_to_mx(EAST)
    my0, my1 = lat_to_my(NORTH), lat_to_my(SOUTH)
    tx0, tx1 = int(mx0 * n), int(mx1 * n)
    ty0, ty1 = int(my0 * n), int(my1 * n)

    # Stitch the tiles into one big array.
    rows = []
    for ty in range(ty0, ty1 + 1):
        row = []
        for tx in range(tx0, tx1 + 1):
            print(f"tile {ZOOM}/{tx}/{ty}")
            row.append(fetch_tile(ZOOM, tx, ty))
        rows.append(np.hstack(row))
    mosaic = np.vstack(rows)

    grid_h = round(GRID_W * (my1 - my0) / (mx1 - mx0))
    # Pixel coordinates (in the mosaic) of each output sample; bilinear sample.
    px = (np.linspace(mx0, mx1, GRID_W) * n - tx0) * 256
    py = (np.linspace(my0, my1, grid_h) * n - ty0) * 256
    gx, gy = np.meshgrid(px, py)
    x0 = np.clip(np.floor(gx).astype(int), 0, mosaic.shape[1] - 2)
    y0 = np.clip(np.floor(gy).astype(int), 0, mosaic.shape[0] - 2)
    fx, fy = gx - x0, gy - y0
    h = (mosaic[y0, x0] * (1 - fx) * (1 - fy) + mosaic[y0, x0 + 1] * fx * (1 - fy)
         + mosaic[y0 + 1, x0] * (1 - fx) * fy + mosaic[y0 + 1, x0 + 1] * fx * fy)
    h = flatten_ocean(h)

    # Stored as little-endian int16 decimetres, row-major, north row first.
    dm = np.round(h * 10).astype("<i2")
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    dm.tofile(os.path.join(ROOT, "data", "terrain.bin"))

    # Ground size of the area in metres (mercator scale corrected at mid-latitude).
    lat_mid = (NORTH + SOUTH) / 2
    world = 40075016.686 * math.cos(math.radians(lat_mid))
    meta = {
        "west": WEST, "east": EAST, "south": SOUTH, "north": NORTH,
        "width": GRID_W, "height": grid_h,
        "sizeX": (mx1 - mx0) * world, "sizeZ": (my1 - my0) * world,
        "minElevation": float(h.min()), "maxElevation": float(h.max()),
        "source": "AWS Terrain Tiles (terrarium), zoom %d" % ZOOM,
    }
    with open(os.path.join(ROOT, "data", "terrain.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()
