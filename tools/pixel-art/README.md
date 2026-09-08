# Pixel-art processing pipeline

Deterministic image-processing engine that turns an AI-generated concept
image (any resolution, soft edges, off-palette colors — typical diffusion
output) into a validated, palette-locked pixel-art sprite matching this
game's shipped art (`pixel-style/STYLE.md`, `pixel-style/palette.json`).

This tool does **not** generate images itself. Image generation
(pixellab.ai currently) happens outside this session — see
`assets/_incoming/README.md` for that handoff. This is only the
"controlled conversion" half of the pipeline:

```
AI concept (any res, soft edges, arbitrary colors)
  -> isolate subject (largest connected opaque region) + crop
  -> downscale to the target native canvas (24x40 / 20x34 / 16x16)
  -> quantize every pixel to pixel-style/palette.json
  -> despeckle color noise (majority-neighbor filter)
  -> binarize alpha (hard 0/255, no anti-aliasing)
  -> remove tiny stray opaque specks
  -> [optional] directional shading pass
  -> [optional] silhouette-edge outline
  -> assets/generated/<asset_id>_v###.png
  -> validate (dimensions, alpha, palette compliance, naming)
```

## Requirements

```bash
pip install pillow
```

## Usage

```bash
python3 tools/pixel-art/process.py \
  --input assets/_incoming/<asset_id>/source.png \
  --asset-id <asset_id> \
  --width 24 --height 40 \
  --categories skin,hair,cloth_vest,cloth_shirt,cloth_pants,leather \
  --shading off \
  --outline off
```

- `--categories` restricts quantization to specific `pixel-style/palette.json`
  categories (see the matching spec in `assets/specs/**/*.json` for which
  ones an asset should use) — omit to allow the whole palette.
- `--width`/`--height` must match the target layer's native canvas
  (NPC body/arms/face: 24×40. Player: 20×34. Bubble: 16×16. See STYLE.md.)
- Every run auto-versions (`<asset_id>_v001.png`, `_v002.png`, ...) —
  nothing gets overwritten, so a bad generation never destroys a good one.
- Exits non-zero if validation fails; the printed report says exactly
  what's wrong (wrong dimensions, off-palette colors, soft alpha edges).

## After a passing run

1. **Look at it at actual game size** — not the 640px preview. A sprite
   that reads fine zoomed in can turn to mud at 120×200 displayed. Use
   `resize.upscale_pixelated()` at the real display scale (5x for
   NPC/player, 2x for bubbles) to check honestly.
2. If it's good: copy from `assets/generated/` to `assets/approved/`.
3. To actually ship it: copy into `src/assets/sprites/` (or `bubbles/`)
   and register it in `src/systems/sprite-assets.js` — one import line +
   one map entry. That file is the only place the running game reads
   sprite paths from.
4. If it's not good: don't fix the PNG by hand — go back to the concept
   generation step with a tweaked prompt (see the asset's spec file for
   what to adjust) and re-run. Keeping the fix at the concept stage is
   what keeps this pipeline reusable instead of turning into one-off
   manual touch-ups.

## Self-test (no real concept image needed)

`assets/_selftest/` contains a synthetic worst-case input — one of the
existing shipped sprites, blown up to 640×960 with bicubic smoothing
(soft anti-aliased edges, off-palette blended colors, arbitrary canvas
size/position) — used to prove the pipeline actually reconstructs a
clean sprite rather than just passing through already-clean input.
Regenerate it any time to sanity-check a pipeline change:

```bash
python3 tools/pixel-art/process.py \
  --input assets/_selftest/concept/source.png \
  --asset-id selftest \
  --width 24 --height 40 \
  --categories skin,hair,cloth_vest,cloth_shirt,cloth_pants,leather,ui
```

## Module map

| File | Responsibility |
|---|---|
| `palette.py` | Loads `pixel-style/palette.json`; nearest-color quantization |
| `resize.py` | Subject crop + box-filtered downscale to target canvas |
| `silhouette.py` | Alpha binarization, largest-component isolation, speckle removal |
| `cleanup.py` | Majority-neighbor despeckle for quantization noise |
| `shading.py` | Optional heuristic upper-left-light directional shading |
| `outlines.py` | Optional full silhouette-edge outline (icons/bubbles, not characters) |
| `validation.py` | Dimension/alpha/palette/naming gate — nothing ships without passing |
| `process.py` | CLI orchestrator tying the above together |

No spritesheet/atlas packer — this game reads individual PNGs via ES
module imports, not a spritesheet, so one wasn't built. If that changes,
add `spritesheet.py` then.
