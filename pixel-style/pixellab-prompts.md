# pixellab.ai prompts — Dusty Sal

Ready-to-paste prompts, designed around two goals: **max value per
generation** (one sheet instead of one prompt per emote) and
**consistency** (a locked style block reused verbatim everywhere, plus —
where pixellab's interface offers it — generating from/against a
reference image of the approved body sprite rather than from text alone,
so every sheet stays visually anchored to the same character).

pixellab.ai has its own resolution/canvas/style-lock controls in its UI —
this doc gives you the content to put in them, not exact field names
(interfaces change; I don't have live access to confirm current field
names, so match these values to whatever the equivalent setting is
called when you're in there).

## The style-lock block (paste into every generation)

```
STYLE: Pokemon Gen 3/4 GBA battle-sprite pixel art. Chibi proportions,
head ~1/4 of body height. Flat color blocks, ONE shadow shade + ONE
highlight shade per surface, no gradients. Light from upper-left.
No full black outline around the silhouette — only selective 1px dark
seam/accent lines where two same-color shapes meet. Limited palette,
~6 shades per material. Clean bold readable silhouette at small size.
Front-facing, standing, isolated subject, plain/transparent background.
NOT photorealistic, NOT painterly, NOT anti-aliased/soft-edged.
```

## Canvas / grid setup

- Target native cell size: **24×40 px** (portrait, 3:5 ratio) for every
  Dusty Sal cell — set pixellab's output/canvas size per-cell to this
  ratio if it supports non-square canvases, otherwise generate square and
  the pipeline's `resize.py` will re-fit on import.
- If pixellab supports a **reference/base image** input: after the body
  sheet below is approved, feed the approved `body_dusty_sal` cell back in
  as the reference for every subsequent sheet (faces, arms) so they lock
  to the same proportions/palette instead of drifting.

## 1. Base body (single generation)

```
[STYLE block above]

SUBJECT: Dusty Sal, a gruff Old West saloon owner. Stocky build, dark
flat-brimmed hat, brown leather vest over tan shirt, tan trousers, dark
worn boots.

POSE: front-facing, standing idle, arms as short shoulder stubs only
(no hands/forearms — those are separate assets composited on top later).
Head is a blank skin-toned oval, NO facial features (face is a separate
asset composited on top later).

REQUIREMENTS: single character, centered, isolated on plain background,
no text, no watermark, no extra limbs, no face detail, no full arms.
```

## 2. Face-expression sheet (8 cells, one generation)

Maximizes info-per-prompt: one sheet gives 8 expressions instead of 8
separate prompts, and because they're generated together they share
proportions/lighting/palette far more reliably than 8 independent calls.

```
[STYLE block above]

SUBJECT: A 2-row x 4-column sprite sheet of Dusty Sal's HEAD ONLY (crop
tight to head/neck, no torso), same character across every cell — same
hat, same skin tone, same head shape and size in every cell.

GRID CONTENTS (left-to-right, top-to-bottom):
1. Neutral — resting face, slight squint
2. Smile — closed-mouth, relaxed eyes
3. Scowl — deep frown, furrowed brow
4. Rage — bared teeth, brows slammed together
5. Shock — wide eyes, mouth open
6. Nervous — small tight smile, sweat drop at temple
7. Smirk — one-sided smile, one raised brow
8. Suspicious — narrowed eyes, head tilted slightly

REQUIREMENTS: even grid spacing, consistent head position/size/crop in
every cell, plain background, no text/labels/watermark, no torso/arms.
```

After generating: crop and drop as `assets/_incoming/dusty_sal_faces_sheet/sheet.png`, then:

```bash
python3 tools/pixel-art/sheet_slice.py \
  --input assets/_incoming/dusty_sal_faces_sheet/sheet.png \
  --rows 2 --cols 4 \
  --asset-ids face_neutral,face_smile,face_scowl,face_rage,face_shock,face_nervous,face_smirk,face_suspicious

# then for each:
python3 tools/pixel-art/process.py \
  --input assets/_incoming/face_neutral/source.png \
  --asset-id face_neutral --width 24 --height 40 \
  --categories skin,hair,ui
```

## 3. Arm/hand-pose sheet (8 cells, one generation)

```
[STYLE block above]

SUBJECT: A 2-row x 4-column sprite sheet of a pair of ARMS AND HANDS
ONLY, matching Dusty Sal's build (brown vest sleeves, skin-tone hands),
positioned as they'd attach to a body's shoulders — same shoulder
attachment position and scale in every cell, torso/head NOT shown (only
enough shoulder stub to show attachment point).

GRID CONTENTS (left-to-right, top-to-bottom):
1. Relaxed — both arms at sides
2. Crossed arms — folded across chest
3. Hand on hip — one hand on hip, other relaxed
4. Fist slam — both fists angled down, slamming pose
5. Hands up — both hands raised above shoulder height
6. Pointing — one arm extended, index finger pointing forward
7. Palms up — both palms up, "what can I say" gesture
8. Rubbing chin — one hand on chin, thinking pose

REQUIREMENTS: consistent shoulder attachment position across all cells,
plain background, no text/labels/watermark, no head/torso/legs.
```

Same slice + process flow as the face sheet, swapping `--asset-ids` for
`arm_relaxed,arm_crossed_arms,arm_hand_on_hip,arm_fist_slam,arm_hands_up,arm_pointing,arm_palms_up,arm_rubbing_chin`
and `--categories cloth_vest,skin,ui`.

## Why sheets over singles

- **Consistency**: cells generated together share the model's internal
  "memory" of proportions/palette/lighting for that one generation —
  independent single-emote prompts drift from each other much more.
  Feeding the approved body back in as a reference image (if pixellab
  supports it) tightens this further, sheet to sheet.
- **Cost/turns**: 3 generations (body + 2 sheets of 8) covers 17
  variants, instead of 17 separate prompts.
- **Still validated the same way**: sliced cells go through the exact
  same `process.py` pipeline as a single-image generation — quantized to
  `palette.json`, alpha-binarized, validated. A sheet doesn't skip the
  quality gate, it just changes how many images arrive per pixellab call.

---

# Interface assets

The dialogue box, choice buttons, and patience bar are currently built
entirely in CSS (`src/styles.css`) — no image assets, and the drop
shadows / press animation / 3D-ish feel from the deck ("buttons like old
pacman or tetris, but with drop shadows, animated for a 3D-esque feel")
are already implemented there. These two prompts generate art to
*replace the flat CSS panel colors with real pixel-art texture*, layered
underneath the existing CSS effects — not a code change by themselves.
**Only 2 generations total**, both sheets, per the same "max value per
prompt" rule as the character assets.

## UI style-lock block (different from the character block above)

```
STYLE: Arcade cabinet pixel-art UI, in the vein of classic Pac-Man /
Tetris title-screen chrome. Chunky rectangular shapes, hard 1px pixel
border, minimal corner rounding (barely-there, not modern soft-radius).
Flat fills, ONE subtle corner bevel highlight per shape (top-left edge
lighter) — no heavy 3D render, no gradient, no glow, no drop shadow baked
into the image (shadows/motion are added separately in CSS). Warm palette:
dark brown / aged parchment off-white / gold accent. NOT painterly, NOT
photorealistic, NOT soft-edged.
```

## 4. UI chrome sheet (3 cells, one generation)

```
[UI STYLE block above]

SUBJECT: A 1-row x 3-column sheet of three separate UI panel textures,
each a flat rectangular frame/border only (transparent or plain center —
game text/content renders on top of the center later, don't put any text
or icons inside the frames).

GRID CONTENTS (left-to-right):
1. Dialogue box frame — wide rectangular panel border, double-line frame
   (thin dark inner line, thicker parchment-color outer line), corners
   barely rounded
2. Choice button frame — smaller rectangular panel border, same double-
   line style, slightly chunkier corner bevel (this is a tappable button)
3. Patience bar frame — a thin, wide horizontal capsule/rectangle
   border, meant to contain a fill bar (frame only, no fill color inside)

REQUIREMENTS: three distinct rectangles side by side, consistent border
thickness/style across all three, plain or transparent background
between/around them, no text, no icons, no watermark.
```

## 5. Strategy icon sheet (4 cells, one generation)

Replaces the current Unicode suit symbols (♠ ♦ ♣ ♥) used to mark each
dialogue strategy in `ChoiceGrid.jsx` with real pixel-art icons.

```
[UI STYLE block above]

SUBJECT: A 2-row x 2-column sheet of four small standalone icons, each
centered in its cell, same visual weight/size across all four.

GRID CONTENTS:
1. Friendly — an open hand / handshake shape
2. Shrewd — a single narrowed eye or a coin/gem shape
3. Aggressive — a clenched fist
4. Deceptive — a mask or a card with a hidden face-down back

REQUIREMENTS: consistent icon size and visual weight across all four,
plain or transparent background, no text/labels/watermark, each icon
readable as a small silhouette (this will display at ~16px).
```

## After generating

Slice with `sheet_slice.py` same as the character sheets (`--rows 1
--cols 3` / `--rows 2 --cols 2`), asset ids e.g. `ui_dialogue_frame,
ui_button_frame, ui_patience_frame` and `icon_friendly, icon_shrewd,
icon_aggressive, icon_deceptive`, categories `ui`. Hand me the results —
wiring them into `DialogueBox.jsx`/`ChoiceGrid.jsx`/`PatienceBar.jsx` as
background images (behind the existing CSS borders/shadows) is a small,
separate step once art exists to wire in.
