# pixellab.ai prompts — Dusty Sal

Simplified after the first pass over-detailed the description field and
confused the model. Rule now: **description = one short plain sentence**.
Everything else (facing, detail, outline) goes in pixellab's own
dedicated controls, not crammed into text. Consistency comes from
**reusing an approved Init Image**, not from repeating a style paragraph
every time.

## Settings to use for every character generation

- **Direction:** Front
- **View:** None
- **Detail:** try Medium first — Highly Detailed tends to add texture a
  tiny sprite can't hold (fine wrinkles, fabric grain); if Medium looks
  too plain, step up
- **Outline:** Default
- **Size:** taller than wide (character) — try **128 × 224**
- **Model:** Pro for anything you might approve as final; Pixen for
  quick iteration while you're still dialing in the description

## Step 1 — Init image (generate this first, nothing else)

**Description:**
```
Dusty Sal, a gruff Old West saloon owner. Stocky build, dark hat, brown vest, tan shirt and pants, boots. Simple pixel art game character.
```

That's it — one sentence. No style manifesto, no "REQUIREMENTS:" block.
Generate a few, pick the one with the cleanest silhouette and most
game-like (not painterly) look. That becomes your **Init Image** for
every generation below — upload it in the Init Image field each time.

## Step 2 — Variants (with Step 1's image as Init Image)

Same rule: one short sentence, describing only what's different from the
init image. The init image carries the character/style/palette —
you don't need to re-describe it.

**Faces** (generate one at a time, same init image each time):
```
same character, angry face
same character, smiling face
same character, scowling face
same character, shocked face
same character, nervous face
```

**Arms/poses:**
```
same character, arms crossed
same character, fist slamming down
same character, hands raised up
same character, pointing forward
same character, hand on hip
```

If a result drifts too far from the init image (wrong palette, different
proportions), lower Detail one notch or regenerate — don't add more
words to the description to try to correct it.

## Step 3 — hand it off

Drop each approved PNG at `assets/_incoming/<name>/source.png` (e.g.
`face_scowl`, `arm_crossed_arms`) and tell me — I run it through
`tools/pixel-art/process.py`, which crops, resizes to our exact 24×40
canvas, locks it to `palette.json`, and validates it before anything
ships. That part is unaffected by any of the above.

---

# Interface assets

Same simplification. One short sentence each, Direction: None, View:
None (these aren't characters).

```
pixel art rectangular UI panel border, dark brown and gold, game dialogue box frame
```
```
pixel art rectangular button border, dark brown and gold, small tappable game button
```
```
pixel art icon, open hand, small game UI icon
pixel art icon, clenched fist, small game UI icon
pixel art icon, single eye, small game UI icon
pixel art icon, mask, small game UI icon
```

Same handoff as above — drop in `assets/_incoming/`, tell me, I run the
pipeline. Wiring approved art into `DialogueBox.jsx`/`ChoiceGrid.jsx`/
`PatienceBar.jsx` is a separate small step once something's approved.
