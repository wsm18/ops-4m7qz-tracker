Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity (see the v150–v167 entries for the full history of the pyramid Commons-layer workstream, now complete)
3. `planning/IDEAS-gui-revamp.md` — **the active workstream**, read this in full before starting

**Current version: v167.** The service worker is at `operations-v167` in `sw.js`. `SKILL_LADDER_VER` is **117** (unchanged since v155). Total skills: **12524**.

---

## The pyramid Commons-layer workstream (v150–v167) is DONE

All **16 of 16 Mythic trees** now have complete Commons layers — 10,000 Commons skills (16 × 625) on top of the pre-existing Mythic/Legendary/Rare/Uncommon structure, verified 5/5/5/5/5 with zero orphans across the entire pyramid. This was confirmed by a full recursive whole-tree sweep at the end of v167 (walking Mythic → Legendaries → Rares → Uncommons → Commons for all 16 trees) and matches `npm run regress`'s skill audit (`total:12524`, `badCount:0`).

**Do not start another Commons-layer session.** If you're ever unsure whether this is really finished, re-derive it yourself the same way v148–v167 did — walk `SEED_SKILLS` with a Node script replicating `skRarity()`, find every Mythic, and confirm all 16 have exactly 625 Commons. See the v167 entry in `FINISHED-FEATURES.md` for the exact approach if you need it, but this should not be necessary — it's a closed, shipped, verified body of work.

**If you want the detailed lessons-learned history of that workstream** (file-corruption incidents, collision-detection discipline, concurrency limits, verification patterns) — it's preserved in the `FINISHED-FEATURES.md` entries for v144 through v167, and is genuinely useful institutional memory if a future large-scale multi-agent bulk-content workstream ever comes up again (the "Writing seeds at scale" pattern is reusable). It is NOT reproduced in this file anymore — this doc used to carry the full blow-by-blow, but that made it enormous and mostly irrelevant now that the workstream is closed. Go to `FINISHED-FEATURES.md` if you need it.

---

## What's next: the GUI revamp

Wyatt requested this mid-session during v167, via `AskUserQuestion`. Full scope is captured in **`planning/IDEAS-gui-revamp.md`** — read it before doing anything. Short version: he wants **all of**:

1. **Visual/theme refresh** — colors, typography, spacing, polish, keeping the Yggdrasil symbolism intact.
2. **Layout/navigation restructuring** — not just visual, how tabs/nav/screen layout are organized.
3. **Mobile/responsive overhaul.**
4. **Skills tab specifically** (his explicit priority, in his own words): skills are "not looking like they could," some are invisible/unreachable in the current layout, the tab gets cluttered, and neither the skill organization nor the pyramid unlock mechanic is laid out in a way that's actually useful day-to-day.

**This has NOT been scoped into a build plan yet.** Per `CLAUDE.md`'s "ask before large architectural shifts" rule, and this project's standing "Feature intake method" (verify what's built → question → design → confirm with the user → capture in a planning doc → then implement), the first session on this workstream should be an **audit and design pass**, not straight implementation:

1. Read the current skills tab implementation end to end: `src/tabs/skills.html` / `src/tabs/skills.js` (list view), `src/core/tree.js` (Yggdrasil SVG tree view), `src/core/skills-core.js` (the pyramid mechanics — `skSetMembers`, `skSetCanCombine`, `skCombineSet`, the Side Deck, Chain view). Understand what's actually built before proposing changes — the mechanics may already support what's needed and this may be a presentation problem, not a mechanics problem.
2. Audit specifically against Wyatt's 4 named pain points in `IDEAS-gui-revamp.md`: skill visibility (why can't he see some skills?), clutter (what's actually cluttering it — raw count? lack of grouping? no filtering?), organization (what scheme would be both "logical" AND "useful for what to work on next" — these are two different bars), and unlock clarity (is the Common→Uncommon→Rare→Legendary→Mythic synthesis flow explained anywhere, or does the user have to infer it?).
3. Bring back concrete findings and design options to Wyatt — likely via `AskUserQuestion` for the open design decisions (e.g. list view vs. tree view as default, how aggressive a visual restructuring he wants, whether the mobile work is a separate pass or bundled) — before writing any implementation plan or touching CSS/HTML.
4. Once scope is confirmed, this is likely a multi-phase build (visual pass, then structural/nav pass, then mobile pass, then the skills-tab-specific redesign, or some other order Wyatt prefers) — write a phased plan doc once the shape is clear, the same way `planning/IDEAS-tests-fm-workouts.md` did for the FM/test features workstream.

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
5. Bump `sw.js` cache version — only if something actually shipped.
6. Bump `SKILL_LADDER_VER` only if an existing ladder/tier/guidance changed.
7. `npm run package` → produces `dist/operations.zip`.
8. Add a `planning/FINISHED-FEATURES.md` entry — including an honest one if the session's net result was "investigated, found nothing to do."
9. Update `planning/NEXT-SESSION-PROMPT.md` (this file) with the new state.
10. Tell Wyatt to **hard-refresh / reopen the app** so the new service worker activates and any migration runs (skip if nothing shipped).
11. Run `date` again, compute elapsed time, and append a row to `planning/SESSION-TIMES.md`.
12. **Commit the session's work to git** — don't let a finished feature sit uncommitted.

### What not to do (general, still applies)
- Don't add error handling, fallbacks, or validation for scenarios that can't happen.
- Don't add comments explaining what the code does — only the why if it's non-obvious.
- Don't restructure or reformat unrelated code while making a targeted change.
- Don't over-format the app or invent scope beyond what's asked — this applies with extra force to the GUI revamp, which is exactly the kind of open-ended request that's easy to over-scope. Confirm design decisions with Wyatt before implementing them.

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
- `PATH_META` — path metadata (name, icon, color, world, lore), in `constants.js`.
- `SK_PATH_ICON` — path → emoji map, in `tree.js`.
- All CSS in `src/styles/main.css` — no per-tab CSS files.
- Regression covers 18 tabs (see `scripts/regress.js`).
- No network calls, no CDN fonts, no telemetry — ever.

**Pyramid system (for reference — the content workstream is done, but the mechanics are directly relevant to the GUI revamp's unlock-clarity pain point):**
- `skRarity(sk)` — rarity from explicit `rarity` field or ladder depth.
- `skSeedOf(name, cat)` — find a skill's seed in `SEED_SKILLS` (O(1) via memoized Map).
- `skSetMembers(setKey)` — all non-group seeds with matching setKey (rarity-agnostic — includes Jokers). This is the authoritative "how many members does this set have" definition.
- `skSetMasteredCount(setKey)` / `skSetCanCombine(setKey)` — set progress.
- `skCombineSet(setKey)` — finds the FIRST seed whose `synthesizedFrom===setKey` and unlocks it.
- `SYNERGY_PAIRS` — 15 complementary skill pairs; `skHasSynergy(sk)`.
- Side Deck (unstarted leaves): collapsible `<details class="sk-side-deck">` in `skills.js`.
- Face-down card function: `faceDownCard(sk, suit, rank, isSynthPending)` in `skills.js`.
- Combine button handler: `data-skcombine` in `events.js` delegation.
- Chain view: `renderSynthesisChain(cat)` in `skills.js`; toggle `.sc-toggle[data-sctoggle]`; output in `.sc-wrap#sc-{cat}`.

---

## Tone constraints

Wyatt values: honesty, measurability, privacy, preserved progress, Yggdrasil symbolism. Keep copy plain and honest — no hype, no fake metrics. Ask before large architectural changes. Small surgical diffs.
