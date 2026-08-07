Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity (see the v172 entry for what just shipped, and v150–v167 for the pyramid Commons-layer workstream history)
3. `planning/IDEAS-gui-revamp.md` — **the active workstream**, read this in full before starting

**Current version: v172.** The service worker is at `operations-v172` in `sw.js`. `SKILL_LADDER_VER` is **117** (unchanged since v155). Total skills: **12524**.

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
