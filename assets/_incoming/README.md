# Drop zone for AI-generated concept art

This session can't reach `pixellab.ai` directly (network policy blocks it),
so the loop is:

1. **You** generate a concept image via pixellab.ai (web UI or their API,
   from your own machine), using the prompt fields from the matching spec
   in `assets/specs/**/*.json` (`generation_prompt` / `negative_prompt`) —
   adapt the field names to whatever pixellab.ai's actual form/API expects,
   this repo's format is generation-service-agnostic.
2. Save the output here as `assets/_incoming/<asset_id>/source.png` — any
   resolution, doesn't need to be pre-pixelated or background-removed,
   the pipeline handles that.
3. Commit + push (or hand me the file directly). I'll run it through
   `tools/pixel-art/process.py` using the spec's `processing_settings`,
   which:
   - isolates the subject and crops to it
   - downscales to the asset's native canvas (e.g. 24×40 for NPC layers)
   - quantizes every pixel to `pixel-style/palette.json`
   - removes anti-aliasing / color noise / stray specks
   - validates dimensions, alpha, and palette compliance
4. Output lands in `assets/generated/<asset_id>_v001.png` (auto-versioned,
   never overwrites). I'll show you the result at actual in-game size.
5. If it's good, it gets copied to `assets/approved/` and then into
   `src/assets/sprites/` or `src/assets/bubbles/` (registered in
   `src/systems/sprite-assets.js`) — that's the only step that actually
   changes what the live game renders. Nothing before that touches
   gameplay.

If a first pass doesn't read well at 24×40 / 120×200 displayed size,
that's normal — tweak the prompt (usually: simplify silhouette, remove
detail, increase contrast between garment pieces) and regenerate. See
`pixel-style/STYLE.md` for what "reads well at this size" means concretely.
