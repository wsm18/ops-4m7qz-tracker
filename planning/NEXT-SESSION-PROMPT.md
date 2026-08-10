Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity (see the v173 entry for what just shipped, v172 for the skills-tab GUI fixes, and v150–v167 for the pyramid Commons-layer workstream history)
3. `planning/IDEAS-gui-revamp.md` — **the active in-app workstream**, read this in full before starting GUI work

**Current version: v173.** The service worker is at `operations-v173` in `sw.js`. `SKILL_LADDER_VER` is **117** (unchanged since v155). Total skills: **12524**.

---

## The pyramid Commons-layer workstream (v150–v167) is DONE — do not restart it

All 16 of 16 Mythic trees have complete Commons layers (10,000 Commons skills), verified 5/5/5/5/5 with zero orphans. See the v167 entry in `FINISHED-FEATURES.md` if you ever need to re-derive that this is really finished.

---

## GUI revamp — skills tab (v172) is DONE, visual/nav/mobile still queued

Wyatt requested a whole-app GUI revamp mid-session during v167: visual/theme refresh, layout/navigation restructuring, mobile/responsive overhaul, and a specifically-flagged skills-tab redesign. **v172 closed out the skills-tab priority.** Full detail in the v172 entry of `FINISHED-FEATURES.md`; short version:

- **Tree view (`src/core/tree.js`) was rewritten.** It used to draw every top-level skill (up to 1500+ per Path) as an individual leaf, which is what made skills "not visible" — they overlapped into an unreadable mess. It now draws **only the 10 realm worlds**, each lit up by `catProgressFraction(cat)` (a new helper in `skills-core.js`: sum of every leaf's effective level ÷ sum of max level, 0–1). Individual skill browsing lives entirely in the List view now. Tapping a world navigates to that Path's deck in the list.
- **List view (`src/tabs/skills.js`/`skills.html`) was NOT restructured** — Wyatt explicitly said he likes the current card/deck/pyramid layout. Two things were added on top of it: a new always-visible **Focus strip** (`renderFocusStrip()` — decaying soon / behind target / ready to combine, backed by a new `skReadyToCombine()` helper) above the toolbar, and a collapsed **pyramid explainer** (`<details class="sk-pyramid-explainer">`) near the top explaining the Common→Uncommon→Rare→Legendary→Mythic mechanic.
- `scripts/regress.js --shot`'s tree-screenshot selector had a pre-existing bug (matched the sidebar's "🌳The Tree" nav button instead of the actual view toggle) — fixed to click `#skViewTree` directly. Unrelated to the tree.js rewrite; found while verifying it.

**Still queued, still NOT scoped into a build plan:** visual/theme refresh, layout/navigation restructuring, mobile/responsive overhaul (items 1–3 in `IDEAS-gui-revamp.md`). Wyatt confirmed these get their own dedicated session. When picked up, follow the same audit-first approach the skills-tab pass used (per `CLAUDE.md`'s "ask before large architectural shifts" rule and the project's standing feature-intake method):

---

## v173 — TOC data bridge (cross-project, unrelated to the GUI revamp)

Wyatt asked, in a later session, for **TOC** — a separate personal project at `C:\Users\wyatt\Files\Projects\TOC\` (an offline desktop app that runs/serves/views his other local projects) — to give Operations more durable save-data persistence than the plain web version or installed Chrome PWA, on any machine that has both TOC and this repo. Full detail in the v173 entry of `FINISHED-FEATURES.md`. Short version:

- **Root cause:** TOC serves Operations from its own loopback origin (`127.0.0.1:8081`), different from Operations' normal hosted URL's origin — `localStorage` doesn't carry over between them at all.
- **TOC's side** (that repo's own `PHASE_7_NOTES.md`/`CLAUDE.md` have the full detail — **read those, not just this summary, before touching TOC's code again**): a new opt-in `data_bridge: true` registry field; `backend/projectdata.py` reads/writes `<project path>/personal/toc-save.json` **inside the project's own folder**, never TOC's own `config/`; new CORS-scoped `GET`/`POST /api/projects/{id}/data` routes on TOC's existing FastAPI backend (no `pywebview` bridge involved — TOC's whole frontend already talks to its backend over plain `fetch()`, so Operations does too, directly, cross-origin). Operations opted in. 243 tests passing there, ruff+mypy clean.
- **Operations' side** (`src/core/app-setup.js`, new "TOC DATA BRIDGE" section beside the pre-existing cloud-file-sync): `tocInit()` best-effort-probes `http://127.0.0.1:8799/api/health`; if TOC's there, adopts its save the same way `cloudInit()` already adopts a linked cloud file, running **after** `cloudInit()` so TOC wins if both differ. `tocWriteDebounced()` hooks into `state.js`'s `save()` alongside the existing `cloudWriteDebounced()` — both fire independently on every save (Wyatt wanted redundant locations, not either/or). Footer text (`setCloudStatus()`) names every active sync target.
- **A real cross-origin CORS wrinkle was found and fixed on TOC's side** (its `/api/health` route needed a wildcard CORS header so the *probe itself* doesn't log a console error for the common case of TOC not running) — verified live against a real, already-running TOC instance on this machine (not just a mock), using a throwaway Playwright script.

**Known follow-up, not yet done:** there's a TOC instance that was already running on this machine before this session started (unrelated `pythonw.exe`, started that morning) — it's still serving pre-fix code (Python doesn't hot-reload). It was deliberately left running rather than force-restarted (it's Wyatt's own active window). **Restart TOC once, then do a real end-to-end check**: open Operations through TOC, make a change, confirm `personal/toc-save.json` appears in this repo, and confirm it syncs via OneDrive to another machine that has both TOC and this repo. That live confirmation has not happened yet — everything so far is verified by test suite + a `file://`-context Playwright probe, not a real TOC-hosted Operations tab.

---

1. Read what's actually built and how responsive/themed it already is (`src/styles/main.css` has ~12 `@media` queries as of v172 — check current count, it may have grown) before assuming what needs to change.
2. Identify concrete pain points, not just "make it nicer" — ask Wyatt what specifically bothers him about the current visuals/nav/mobile experience if it's not already clear.
3. Bring design options back via `AskUserQuestion` before touching CSS/HTML at scale.
4. Write a phased plan doc once the shape is clear (the way `planning/IDEAS-tests-fm-workouts.md` did), then implement.

**After the GUI revamp** (or if Wyatt wants to defer it), the previously-queued workstream is still valid and waiting: `planning/IDEAS-tests-fm-workouts.md` — a fully-designed, Wyatt-confirmed set of FM/test features (gym-schedule-aware training planning, equipment-aware exercise selection, stealth-assessment cognitive/quiz games, card-game workouts) plus four additional green-lit ideas (cross-tab deadline timeline, AAR-style reflection journal, cross-domain data-insight engine, whole-tree "smart focus" recommender), with a recommended 8-phase build order at the bottom of that doc.

---

## Required workflow summary (unchanged — still applies to any change)

```bash
# After every feature or batch of changes:
python scripts/build.py       # must say OK
npm run check                 # must say SYNTAX OK
npm run regress                # must say PAGEERRORS 0

# After all features, before reporting done:
# bump sw.js: operations-vNN -> operations-vNN+1 (only if something shipped)
# bump SKILL_LADDER_VER in src/core/migration.js only if an EXISTING ladder/tier/guidance text changed
npm run package               # produces dist/operations.zip
```

### Ship checklist (same every session)
0. At the very start of the session, run `date "+%Y-%m-%d %H:%M %Z"` and note the timestamp (needed for the session-time log at the end — see `CLAUDE.md`'s "Session time logging").
1. `python scripts/build.py` → `OK index.html`
2. `npm run check` → `SYNTAX OK`
3. `npm run regress` → `PAGEERRORS 0`
4. If you touched `SEED_SKILLS`, run a duplicate `name`+`cat` sweep and a member-count sweep (regress won't catch either) — see `FINISHED-FEATURES.md`'s pyramid-era entries for the exact script approach if you ever need it again.
5. If you touched `src/core/tree.js`, run `npm run regress -- --shot` and look at `dist/tree.png` to confirm it renders as expected.
6. Bump `sw.js` cache version — only if something actually shipped.
7. Bump `SKILL_LADDER_VER` only if an existing ladder/tier/guidance changed.
8. `npm run package` → produces `dist/operations.zip`.
9. Add a `planning/FINISHED-FEATURES.md` entry — including an honest one if the session's net result was "investigated, found nothing to do."
10. Update `planning/NEXT-SESSION-PROMPT.md` (this file) with the new state.
11. Tell Wyatt to **hard-refresh / reopen the app** so the new service worker activates and any migration runs (skip if nothing shipped).
12. Run `date` again, compute elapsed time, and append a row to `planning/SESSION-TIMES.md`.
13. **Commit the session's work to git** — don't let a finished feature sit uncommitted.

### What not to do (general, still applies)
- Don't add error handling, fallbacks, or validation for scenarios that can't happen.
- Don't add comments explaining what the code does — only the why if it's non-obvious.
- Don't restructure or reformat unrelated code while making a targeted change.
- Don't over-format the app or invent scope beyond what's asked — this applies with extra force to the remaining GUI-revamp work, which is exactly the kind of open-ended request that's easy to over-scope. Confirm design decisions with Wyatt before implementing them.

---

## Key architecture reminders

- `index.html` is **assembled output** — edit `src/`, then build.
- All data in `localStorage["operations_v2"]` via `S = load()`; `DEFAULT` is in `src/core/constants.js`.
- `skLeafColor(eff, max, sk?)` → `rgb(r,g,b)` string; optional `sk` returns amber if at-risk.
- `skEffectiveLevel(sk)` → working level accounting for decay + 20% grace, floors at 1 if started.
- `skFadeState(sk)` → `"current" | "at-risk" | "decayed"`.
- `skDaysLeft(sk)` → days until actual decay (after grace); null if not started.
- `skPractice(skId)` → resets fade timer without level change (non-auto, started skills only).
- `skReachLevel(skId, targetLevel, note?)` → levels up to targetLevel, stores optional note in history.
- `skEmblemSvg(sk, eff, max)` — sigil generator in `skills.js`, also used in `trophies.js`.
- `catRolledLevel(cat)` → average rolled level across a Path's top-level skills (level-space, not 0-1).
- `catProgressFraction(cat)` → **new in v172** — 0-1 fraction of overall progress across every leaf in a Path (sum eff / sum max); drives the Tree view's world-lighting.
- `catPyramidCompletion(cat)` → 0-1 fraction of pyramid-tagged skills *fully mastered* (stricter than the above); drives the Tree view's rim-stud ring.
- `skReadyToCombine()` → **new in v172**, in `skills-core.js` — every synthesis-target seed whose set is fully mastered but not yet combined; backs the Focus strip's "Ready to combine" column.
- `PATH_META` — path metadata (name, icon, color, world, lore), in `constants.js`.
- `SK_PATH_ICON` — path → emoji map, in `tree.js`.
- All CSS in `src/styles/main.css` — no per-tab CSS files.
- Regression covers 18 tabs (see `scripts/regress.js`).
- No network calls, no CDN fonts, no telemetry — ever.

**Pyramid system:**
- `skRarity(sk)` — rarity from explicit `rarity` field or ladder depth.
- `skSeedOf(name, cat)` — find a skill's seed in `SEED_SKILLS` (O(1) via memoized Map).
- `skSetMembers(setKey)` — all non-group seeds with matching setKey (rarity-agnostic — includes Jokers). This is the authoritative "how many members does this set have" definition.
- `skSetMasteredCount(setKey)` / `skSetCanCombine(setKey)` — set progress.
- `skCombineSet(setKey)` — finds the FIRST seed whose `synthesizedFrom===setKey` and unlocks it.
- `SYNERGY_PAIRS` — 15 complementary skill pairs; `skHasSynergy(sk)`.
- Side Deck (unstarted leaves): collapsible `<details class="sk-side-deck">` in `skills.js`.
- Face-down card function: `faceDownCard(sk, suit, rank, isSynthPending)` in `skills.js`.
- Combine button handler: `data-skcombine` in `events.js` delegation (works anywhere in the document, not just `#skList` — the Focus strip's Combine buttons reuse it).
- Chain view: `renderSynthesisChain(cat)` in `skills.js`; toggle `.sc-toggle[data-sctoggle]`; output in `.sc-wrap#sc-{cat}`.

---

## Tone constraints

Wyatt values: honesty, measurability, privacy, preserved progress, Yggdrasil symbolism. Keep copy plain and honest — no hype, no fake metrics. Ask before large architectural changes. Small surgical diffs.
