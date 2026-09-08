# Run This Town — Pixel Art Style Guide

Governs every sprite layer generated through `tools/pixel-art/`. Locked to
match dimensions already wired into the shipped game (`src/styles.css`,
`src/components/NPCSprite.jsx`, `src/components/PlayerSprite.jsx`) — changing
these numbers requires updating that CSS too, so don't change them casually.

## Canvas / resolution

| Layer type | Native canvas | Display scale | Displayed size |
|---|---|---|---|
| NPC body / arms / face | 24 × 40 px | 5x, `image-rendering: pixelated` | 120 × 200 px |
| Player | 20 × 34 px | 5x | 100 × 170 px |
| Emote bubble | 16 × 16 px | 2x | 32 × 32 px |

All layers for one character share the same canvas size and the same
origin (top-left `0,0`), so body/arms/face PNGs composite in perfect
alignment with zero per-asset offset math.

## Perspective & proportions

- Front-facing / very slight 3/4, standing idle pose. No side-view or
  back-view for NPCs (player is back-view only, single static pose).
- Stocky, chibi-leaning proportions: head is roughly 1/4 of total body
  height (bigger than realistic human proportions) for readability at
  24px width.
- Silhouette must read at the *displayed* size (120×200 / 100×170), not
  just the native canvas — always check both.

## Outline philosophy

- No full black outline around the whole silhouette (the existing sprites
  don't have one and it reads fine at this scale — see `assets/_legacy/`).
- Selective 1px dark accents only where two same-hue shapes meet and would
  otherwise merge (e.g. vest seam, boot line, brow furrow) — the
  `deepest_shadow` palette entries, not pure black.

## Shading philosophy

- Flat-shaded blocks with **one** shadow step and **one** highlight step
  per surface, never a gradient. Light source: **upper-left**, consistent
  across every asset.
- Shadow = the surface's `base` color's palette-defined `shadow` entry.
  Don't hand-pick arbitrary darker colors — always pull from
  `pixel-style/palette.json`.

## Color / palette

- Every pixel in an approved asset must be a **palette.json** entry
  (or fully transparent). No off-palette colors, no anti-aliased edge
  pixels blending two palette colors.
- Alpha is binary: 0 or 255. No soft/semi-transparent edges — diffusion
  output and any upscaled source must be hard-thresholded before export
  (`tools/pixel-art/silhouette.py`).
- ~30–40 total colors across the whole game, reused across characters
  (see palette categories) rather than a fresh palette per asset.

## Detail level

- Faces are minimal: 2 eye pixels/blocks, 0–1 brow accents, 1 mouth
  shape. No nose, no individual eyelashes, no detailed hairlines.
- Clothing: large flat color blocks (vest, shirt, pants) with at most one
  seam/button/fold accent per garment. No fabric texture, no fine
  wrinkles.
- Anything smaller than 2×2 native px is noise, not detail — the cleanup
  pass removes it.

## Animation conventions

Body language is communicated by **swapping layers**, not by drawing new
animation frames per pose. CSS keyframes (`idle`, `bounce`, `shake`, etc.
in `src/styles.css`) handle motion on top of whichever static layer is
active. A new "pose" is a new arm or face PNG, not a new animation.

## Character/asset conventions

- One `body_*.png` per named character (torso, legs, hat/hair, boots —
  everything that doesn't change per-emote).
- Faces and arms are cropped to their functional region only (the head
  area / the arm+hand area) on the full 24×40 canvas, transparent
  elsewhere, so they composite over any compatible body.
- Bubbles are freestanding icons, no character-specific variants.

## What this pipeline does NOT need to solve

Spritesheets/atlases — not used by this codebase (individual PNGs, ES
module imports). Don't build spritesheet packing unless the game
architecture changes.
