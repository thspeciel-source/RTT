# Approved assets

Only assets a human has looked at (at actual in-game display size, per
STYLE.md's Phase 12 review checklist) and explicitly approved land here.
Nothing here is used by the game directly — this is a staging area between
`assets/generated/` and the real game paths (`src/assets/sprites/`,
`src/assets/bubbles/`). Promoting an asset means copying it into the
`src/assets/` path the running app actually imports (see
`src/systems/sprite-assets.js`) and, for a new asset_id, adding one import
+ map entry there.
