#!/usr/bin/env python3
"""
Splits one pixellab.ai grid/sheet generation into individual per-cell
source images, dropped into assets/_incoming/<asset_id>/source.png each —
ready for process.py. This is what makes "one sheet prompt instead of N
single-emote prompts" actually pay off: without this, you'd be manually
cropping N cells out of an image editor.

Usage:
  python3 tools/pixel-art/sheet_slice.py \\
      --input assets/_incoming/dusty_sal_faces_sheet/sheet.png \\
      --rows 2 --cols 4 \\
      --asset-ids face_neutral,face_smile,face_grin,face_laugh,face_smirk,face_frown,face_scowl,face_shock

Cells are read left-to-right, top-to-bottom. Pass fewer asset-ids than
cells to only extract the first N (e.g. sheet has blank/unused trailing
cells).
"""
import argparse
import os
from PIL import Image

REPO_ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
INCOMING_DIR = os.path.join(REPO_ROOT, "assets", "_incoming")


def slice_sheet(input_path, rows, cols, asset_ids, out_dir=INCOMING_DIR, margin=0):
    sheet = Image.open(input_path).convert("RGBA")
    w, h = sheet.size
    cell_w = w // cols
    cell_h = h // rows

    written = []
    for i, asset_id in enumerate(asset_ids):
        row, col = divmod(i, cols)
        if row >= rows:
            break
        x0 = col * cell_w + margin
        y0 = row * cell_h + margin
        x1 = (col + 1) * cell_w - margin
        y1 = (row + 1) * cell_h - margin
        cell = sheet.crop((x0, y0, x1, y1))

        asset_dir = os.path.join(out_dir, asset_id)
        os.makedirs(asset_dir, exist_ok=True)
        out_path = os.path.join(asset_dir, "source.png")
        cell.save(out_path)
        written.append(out_path)
        print(f"cell ({row},{col}) -> {out_path}")

    return written


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", required=True)
    ap.add_argument("--rows", type=int, required=True)
    ap.add_argument("--cols", type=int, required=True)
    ap.add_argument("--asset-ids", required=True, help="Comma-separated, left-to-right top-to-bottom")
    ap.add_argument("--margin", type=int, default=0, help="Pixels to trim from each cell edge (if the sheet has grid lines/padding)")
    args = ap.parse_args()

    asset_ids = [a.strip() for a in args.asset_ids.split(",") if a.strip()]
    written = slice_sheet(args.input, args.rows, args.cols, asset_ids, margin=args.margin)
    print(f"\nWrote {len(written)} cell(s). Next: run process.py on each asset_id.")


if __name__ == "__main__":
    main()
