# pixellab.ai prompts — Dusty Sal & the player

## Player character (back-facing)

New character, so it needs its own init image first — same process as
Sal, just with **Direction: Back** instead of Front (the player is never
seen from the front in this scene; you're always looking over their
shoulder at the NPC).

**Description:**
```
A traveler in a dusty Old West town, seen from behind. Simple shirt, vest, trousers, boots, wide-brimmed hat. Plain pixel art game character.
```

**Settings:** Direction: Back · View: None · Detail: Medium · Outline: Default · Size: 128×224

Same rule as Sal: one sentence, no style paragraph, generate a few and
pick the cleanest silhouette. Since it's back-facing, there's no face to
worry about — this is likely a single static sprite with no expression
variants needed, matching how it's used in-game (`PlayerSprite.jsx`
today has no pose/expression swapping).

Hand it to me the same way: drop the PNG in `assets/_incoming/player_body/source.png`
and tell me — I'll crop it to its own content bbox and swap it in for
the current placeholder in `src/assets/sprites/player_base.png`.

---

# Dusty Sal

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

**Generate the FULL character every time** — not just a head, not just
arms — even though we only end up using one region of it. Reason: our
face/arm layers have to land on the exact same pixel coordinates as the
body layer to composite correctly. If pixellab draws an isolated "head
only," nothing guarantees it's scaled/centered the same way twice. If it
draws the *full character* anchored to the same init image, the head
consistently lands in about the same spot — so I can crop a fixed pixel
box out of every result (same box every time) instead of guessing. The
cropping is a code step on my end (`--crop-box`), not something to solve
in the prompt.

Same rule: one short sentence, describing only what's different from the
init image. The init image carries the character/style/palette —
you don't need to re-describe it.

**Init Image Strength:** start around **60-70% of the slider's range**.
This controls how strongly the result resembles the init image, not how
many variants come out of one generation — there's no batch/grid mode in
this panel as far as what's been shown to me. Too high and it'll barely
change the face/pose you asked for; too low and it drifts off-model
(wrong palette, different proportions). Tune by eye per generation.

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

If a result drifts too far from the init image, lower Detail one notch
or regenerate — don't add more words to the description to try to
correct it.

> **Open question for you:** does pixellab have another tab/mode
> (rotation sheet, animation, batch) beyond this "Create image" panel
> that outputs multiple poses from one generation? The art-direction
> deck linked to a "select-interface" page implying more than one mode
> exists. I can't browse the site myself (network's blocked in this
> session) — if there's a real multi-output mode, tell me what it shows
> and I'll fold it in properly instead of guessing.

## Step 3 — hand it off

Drop each **full-character** PNG at `assets/_incoming/<name>/source.png`
(e.g. `face_angry`, `arm_crossed_arms` — name it after which region
you're after, even though the file itself is the whole character) and
tell me. I'll look at where the head/arms actually land in the first one
or two, give you back the exact `--crop-box` coordinates, and from then
on it's: crop that fixed region → resize to our 24×40 canvas → lock to
`palette.json` → validate, via `tools/pixel-art/process.py`.

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
