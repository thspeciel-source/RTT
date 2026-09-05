# Run This Town — Pivot Prototype

A single-screen, Pokémon-battle-style negotiation scene: the player faces off
against an LLM-driven NPC who reacts with full-body emotes, a mood-colored
background, a draining patience bar, and a trade negotiation. This is the
minimum viable slice of *Run This Town*'s core mechanic — no map, no
inventory, no quests.

## Quick start

```bash
npm install
npm run dev:all
```

This starts the Vite dev server (`http://localhost:5173`) and the Express
LLM proxy (`http://localhost:3001`) together.

- **No `ANTHROPIC_API_KEY` configured?** The app automatically falls back to
  **Demo Mode** — a hardcoded 4-turn negotiation script that exercises the
  full UI (typewriter, sprite layering, mood shifts, patience bar, both the
  "DEAL MADE" and "DEAL FAILED" end states) with zero network calls. This is
  the default in this sandbox.
- **To enable real LLM-driven negotiation:** copy `.env.example` to `.env`
  and set `ANTHROPIC_API_KEY`. Restart `npm run server` (or `dev:all`) and
  reload the page — the app detects the key via `/api/health` and switches
  to live Haiku-driven dialogue automatically.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server only |
| `npm run server` | Express LLM proxy only |
| `npm run dev:all` | Both, concurrently |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

## Architecture

- **`src/App.jsx`** — the game loop / state machine. Detects demo vs. LLM
  mode, drives the dialogue → choices → next-turn cycle, and runs the
  crash-out and win end-state sequences.
- **`src/components/`** — `BattleScene`, `StageArea`, `MoodBackground`,
  `PatienceBar`, `NPCSprite` (layered body/arms/face/bubble), `PlayerSprite`,
  `DialogueBox` (typewriter), `ChoiceGrid` (2×2 strategy buttons),
  `EndScreen`, `AmbientParticles`.
- **`src/systems/`**
  - `llm.js` — system prompt builder + `/api/llm-proxy` client.
  - `validation.js` — clamps/repairs every LLM response so malformed JSON,
    invalid emote keys, or missing fields can never crash the UI.
  - `preloader.js` — caches each turn's 4 pre-generated `pre_responses` so
    tapping an option displays instantly instead of waiting on a round-trip.
  - `mood.js` — valence/arousal → HSL background color interpolation.
  - `typewriter.js` — Pokémon-style char-by-char reveal with paging.
- **`src/data/`** — `npcs.json` (Dusty Sal, the saloon owner), `items.json`
  (trade items), `emote-map.json` (placeholder color/label per emote key —
  swap for real sprite PNGs later), `demo-script.json` (the offline demo
  negotiation).
- **`server/proxy.js`** — thin Express proxy that forwards
  `POST /api/llm-proxy` to the Anthropic Messages API using
  `claude-haiku-4-5-20251001`, keeping the API key server-side.

## Placeholder art

Per the prototype spec, the NPC and player are rendered as simple colored
rectangles (body/head/arms/face), with face/arm/bubble colors driven by
`src/data/emote-map.json`. Swap in real sprite PNGs later by replacing the
CSS classes in `NPCSprite.jsx`/`PlayerSprite.jsx` with `<img>` layers — no
game-logic changes required.

## What's not implemented

Real generated pixel art (Phase 6 of the build order) requires an external
AI image generation + pixel-art conversion pipeline and hand-authored
sprite sheets — out of scope for this prototype pass. Everything else in
the blueprint (UI, sprite layering, LLM integration, pre-loading, patience
system, crash-out/win sequences) is implemented and has been verified to
run end-to-end in a browser.
