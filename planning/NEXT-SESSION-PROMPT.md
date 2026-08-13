Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity. **Read v168–v174 in full before touching the GUI revamp again** — that whole span is one continuous, easy-to-lose-track-of workstream (see "GUI revamp" section below for why this note exists).
3. `planning/IDEAS-tests-fm-workouts.md` — **the active workstream as of v185**, confirmed build order at the bottom. Read the "Decisions needed"/"Recommended build order" sections before picking the next phase.
4. `planning/IDEAS-gui-revamp.md` — the GUI revamp is not the active workstream right now (see below) but isn't fully closed out either.

**Current version: v185.** The service worker is at `operations-v185` in `sw.js`. `SKILL_LADDER_VER` is **117** (unchanged since v155). Total skills: **12524**. (v182-v184 were quick interrupts, not FM-doc phases — every subjective self-rating input in the app (effort, readiness, PT intensity, session RPE) now uses a 1-10 scale; this is now a **standing convention in `CLAUDE.md`** for any future rating input. See the v182/v183/v184 entries in `FINISHED-FEATURES.md`.)

**v180 was an unplanned, mid-workstream correctness fix** (real dynamic warm-up / static cool-down stretches, muscle-matched per session, sourced from a new `STRETCH_LIBRARY` — see its `FINISHED-FEATURES.md` entry) — not part of the FM-doc build order.

---

## The pyramid Commons-layer workstream (v150–v167) is DONE — do not restart it

All 16 of 16 Mythic trees have complete Commons layers (10,000 Commons skills), verified 5/5/5/5/5 with zero orphans. See the v167 entry in `FINISHED-FEATURES.md` if you ever need to re-derive that this is really finished.

---

## GUI revamp — the real history (read this before doing anything else GUI-related)

Wyatt requested a whole-app GUI revamp mid-session during v167: visual/theme refresh, layout/navigation restructuring, mobile/responsive overhaul, and a specifically-flagged skills-tab redesign. **This spanned FIVE sessions (v168, v170, v171, v172, v174) that were not tracked as one continuous workstream at the time** — `FINISHED-FEATURES.md`/`SESSION-TIMES.md` went stale between v167 and v172 (four shipped versions never logged), which caused the v172 session to partly re-audit territory v168/v170/v171 had already covered. Backfilled into `FINISHED-FEATURES.md` during the v173 session specifically so this doesn't happen a third time — **if you're about to "audit the skills tab" or "audit the nav/visual/mobile state" again, stop and read v168 through v174 first.** The actual state, accurately, as of v174:

- **Item 4, the skills tab (visibility/clutter/organization/unlock-clarity): DONE.** v168 fixed Chain view + Side Deck scale + added tree mastery-insignia studs; v170 rebuilt the List view around the pyramid structure (Mythic→Legendary→Rare→Uncommon→Common, "the core piece of the GUI revamp" per that commit's own words); v171 removed a duplicate section v170 left behind; v172 fixed the Tree view's actual leaf-crowding bug (still present after v168's insignia-only fix) and added a Focus strip + pyramid explainer. Nothing else is needed here unless Wyatt raises a new, specific complaint.
- **Item 2 (nav restructuring) + item 3 (mobile): DONE for the concrete pain point found — v174.** Mobile (≤560px) used to be an unpaginated horizontal-scroll strip of all 18 tabs; now it's a 4-tab bottom bar (Dawn/Tasks/Oaths/Tree) + a slide-up drawer for the other 14, both reusing the same `data-tab` buttons as the desktop sidebar via `class="tabs"` so they share the existing click-delegation. Desktop sidebar itself is **unchanged**.
- **Item 1 (visual/theme refresh): PARTIALLY done.** Wyatt explicitly asked for "light polish only, don't redesign" (v174) — one concrete fix shipped (`nav.tabs button` had zero hover state, now has a subtle one). The existing dark Yggdrasil theme (wood-grain background, OD-green/tan/ember/blood/violet palette, condensed military font stack) was confirmed already coherent and was deliberately left alone otherwise.

**Still open:**
1. **Flagged, not fixed:** `_shell.html` links Google Fonts (`fonts.googleapis.com`) for Oswald/Roboto Condensed — a real, pre-existing violation of `CLAUDE.md`'s own "no external fonts/CDNs" hard rule. Degrades gracefully (falls back to system fonts if offline) but still fires an external request every load. The correct fix is self-hosting the same two OFL-licensed font files (not dropping them — that would be a visible identity change, out of "light polish" scope). Ask Wyatt if/when to do this vendoring pass.
2. Beyond that one hover fix, no further visual/theme work has been done or scoped — if Wyatt wants more than "light polish" at some point, that needs its own confirm-before-implementing pass (per `CLAUDE.md`'s "ask before large architectural/design shifts" and the standing feature-intake method), same as every other GUI decision in this workstream.
3. If Wyatt raises the desktop-nav layout as its own concern (not just mobile) — the current 7-primary + 11-behind-"More" split was left untouched this whole workstream; nobody has actually asked for it to change.

---

## v173 — TOC data bridge (cross-project, unrelated to the GUI revamp)

Wyatt asked, in a later session, for **TOC** — a separate personal project at `C:\Users\wyatt\Files\Projects\TOC\` (an offline desktop app that runs/serves/views his other local projects) — to give Operations more durable save-data persistence than the plain web version or installed Chrome PWA, on any machine that has both TOC and this repo. Full detail in the v173 entry of `FINISHED-FEATURES.md`. Short version:

- **Root cause:** TOC serves Operations from its own loopback origin (`127.0.0.1:8081`), different from Operations' normal hosted URL's origin — `localStorage` doesn't carry over between them at all.
- **TOC's side** (that repo's own `PHASE_7_NOTES.md`/`CLAUDE.md` have the full detail — **read those, not just this summary, before touching TOC's code again**): a new opt-in `data_bridge: true` registry field; `backend/projectdata.py` reads/writes `<project path>/personal/toc-save.json` **inside the project's own folder**, never TOC's own `config/`; new CORS-scoped `GET`/`POST /api/projects/{id}/data` routes on TOC's existing FastAPI backend (no `pywebview` bridge involved — TOC's whole frontend already talks to its backend over plain `fetch()`, so Operations does too, directly, cross-origin). Operations opted in. 243 tests passing there, ruff+mypy clean.
- **Operations' side** (`src/core/app-setup.js`, new "TOC DATA BRIDGE" section beside the pre-existing cloud-file-sync): `tocInit()` best-effort-probes `http://127.0.0.1:8799/api/health`; if TOC's there, adopts its save the same way `cloudInit()` already adopts a linked cloud file, running **after** `cloudInit()` so TOC wins if both differ. `tocWriteDebounced()` hooks into `state.js`'s `save()` alongside the existing `cloudWriteDebounced()` — both fire independently on every save (Wyatt wanted redundant locations, not either/or). Footer text (`setCloudStatus()`) names every active sync target.
- **A real cross-origin CORS wrinkle was found and fixed on TOC's side** (its `/api/health` route needed a wildcard CORS header so the *probe itself* doesn't log a console error for the common case of TOC not running) — verified live against a real, already-running TOC instance on this machine (not just a mock), using a throwaway Playwright script.

**Live end-to-end verification: DONE**, in a follow-up pass the same day. Started a real TOC instance, opened Operations through its actual static host (not a `file://` mock), made a change, confirmed it saved through the bridge, and — after a full page reload — confirmed the value correctly re-adopted from `personal/toc-save.json`. Zero console/page errors. Test artifacts (the fake save data, the TOC instance started for the test) were cleaned up afterward — `personal/toc-save.json` does not currently exist; it'll regenerate the first time Wyatt actually uses Operations through a real TOC session. Cross-machine OneDrive sync itself (does the file actually propagate to a second linked computer) is the one piece still unverified — inherently can't be checked from a single machine.

---

## FM/test-features workstream — active as of v185, 6 of 9 phases done

`planning/IDEAS-tests-fm-workouts.md` has a confirmed build order at the bottom: **X-Timeline → X-AAR → FM-1 (#2+2b) → FM-2 (#3) → FM-Adapt → X-Insight (A) → T (#1) → FM-3 (#5) → X-SmartFocus (B)**. It was originally gated behind the pyramid Commons workstream, which finished long ago (v167) — so this is simply the next thing to build, no re-confirmation needed unless you're changing something the doc already locked in.

- **Phase X-Timeline (idea D): DONE — v175, decluttered in v176.** A new `renderUpcomingTimeline()` in `src/tabs/today.js` merges quest due dates, boss target dates, the AFT test date, milestones, and qualification expiries into one sorted "Upcoming" card on the Dawn tab, with the pre-existing scattered per-source indicators (milestone bar, qual/counseling alerts, quest-due-soon/AFT-date notes) either removed (fully superseded) or trimmed to overdue-only (the complementary case Upcoming deliberately excludes). No open items.
- **Phase X-AAR (idea C): DONE — v177.** New `S.aarLog` array + UI in `records.js`/`records.html`, modeled directly on the existing counseling log's pattern (same delegated-click-handler style in `awards.js`, same `SECTIONS`/CSV export conventions). Real AAR structure (planned/actual/why/sustain/improve), not another free-text field. Contextually promptable per the doc's "ideally" note: `aarNudgeHtml()` on the Dawn tab fires after a broken streak or a below-standard AFT, suppressed once an AAR's been logged in the last 3 days. No open items.
- **Phase FM-1 (ideas #2/#2b): DONE — v178.** `WEEK_PLAN` in `src/core/training.js` is gone, replaced by `assignWeekSessions()` — a function of declared gym-access days via the designed 3-layer cascade (`S.gymAccess.default` → `S.gymAccess.week` confirmed-for-this-week → `S.gymAccessLive` same-day override). `pickAftMode()` picks mock/practice/circuit for AFT-circuit days by reusing `recoveryReadiness()` + AFT history/test-date. Guided mock-AFT walkthrough built in `aft.js` — full "mock" mode saves a real `S.aft` entry; single-event "practice" mode deliberately does **not**, to avoid a misleadingly-low faked "total". No open items.
- **Phase FM-2 (idea #3): DONE — v179, scope expanded live during the build session (see the v179 entry in `FINISHED-FEATURES.md` for the full account).** `S.hasGym` is gone, replaced by `S.equipProfiles` (named, user-editable profiles — real defaults "ROTC/Campus Gym" and "Dorm") built from a 19-tag `EQUIP_TAGS` taxonomy grounded in real Wake Forest research (Wellbeing Center's confirmed weight room/pool/climbing wall) plus Wyatt's direct confirmation of his battalion trailer's contents (full AFT kit, water jugs, weighted stretcher — everything else is an explicitly `unverified`-flagged common-gear placeholder). Every `SESSIONS` exercise slot is now a real multi-variant pool (`eq:[...]`/`m:[...]` tagged, `alt:{slotIdx:[...]}` for extras like the ROTC-trailer carries), filtered by the active profile and picked deterministically per day — the same mechanism gives both equipment-fallback and day-to-day variety. A "🔀 swap" affordance on any multi-option exercise lets you override the day's suggestion (`S.exChoice`), honored everywhere (Dawn, Coach, Log). Swim and Rock Climbing shipped as new opt-in, equipment-gated, coach-suggested (never auto-scheduled) session types. `prescriptionFor()` now suggests a starting weight sourced from your real logged history (`lastLoggedWeight()`) — a first, **non-adaptive** step; the full adaptive-learning ask got carved out as its own phase (next). No open items on what shipped.
- **Phase FM-Adapt: DONE — v181** (per-exercise effort rating later changed to a full 1-10 scale in v182, see below). Turned out not to need the "dedicated design pass" originally flagged — reading the codebase first (before designing) found `computeTarget()`/`renderAdaptiveTargets()` (`log.js`) already existed: a real, working, trend/stall-aware, baseline-blended next-session-target engine, with a per-workout RPE field already captured and saved but never actually read by anything. FM-Adapt turned into a bounded extension of that trusted engine rather than a new system: added a per-exercise effort rating + "had to cut it short" flag to the log form, plus a workout-level pre-session readiness check-in (logged for the record only — deliberately **not** fed into the math, since today's target is already computed before the workout starts and pretending a pre-tap recalculates it would overclaim). `computeTarget()` now factors in the last rating as a plain rule (effort≥8/reduced/RPE≥9 forces a hold; effort≤3/RPE≤6 nudges a flat trend up) — verified byte-for-byte unchanged when nothing's rated. Also retired FM-2's simpler `lastLoggedWeight()` in `prescriptionFor()` in favor of calling this same engine, so the coach card and the Adaptive Targets card never quietly disagree. No open items.
- **Phase X-Insight: DONE — v185.** This one genuinely did need the design pass (unlike FM-Adapt) — confirmed via research that no cross-series correlation logic existed anywhere, and that several data series (quizzes/SRS) have no usable per-event timeline at all. New `src/core/insights.js`/`computeInsights()`: three checks (streak consistency vs. AFT, training frequency vs. AFT improvement, weight vs. deadlift co-movement), each silent unless both sides of a comparison have real support — plain bucketed averages/co-occurrence counts, deliberately not a correlation coefficient, to avoid false statistical precision on a small personal dataset. Rendered as a new "🔍 Insights" card in `records.js`'s History tab. Verified via a Node `vm` sandbox (the module has zero DOM dependency) after the system's real memory pressure repeatedly stalled Playwright browser launches, plus one confirming real-browser UI pass. No open items.
- **Next phase: T** (stealth-assessment games) — see `IDEAS-tests-fm-workouts.md` for full scope. FM-3 (card-game workouts) and X-SmartFocus remain after that; both need their own greenlight/design pass respectively before building (see their entries).
- Remaining phases after that: T, FM-3, X-SmartFocus — see `IDEAS-tests-fm-workouts.md` for full scope/dependencies on each. **FM-3 (card-game workouts) is explicitly not build-greenlit even though its design is complete — Wyatt asked to hold it in planning; re-confirm before starting that one specifically, whenever its turn comes up.**

**A process note, not specific to this workstream:** `npm run regress` may intermittently hang (`page.goto`/`page.reload` never reaching networkidle/load) under system memory pressure, unrelated to app code — confirmed during v175 by loading the last-committed `index.html` standalone and seeing the identical hang. If this happens, it's not necessarily your change; check free memory (`Get-CimInstance Win32_OperatingSystem`) before assuming a regression, and ask Wyatt to free up resources rather than guessing at a code fix.

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
- `STRETCH_LIBRARY`/`AREA_MUSCLES` — **new in v180**, in `constants.js` — the tagged dynamic-warmup/static-cooldown pool every session's warm-up/cool-down (and Session 5's flexibility block) is composed from; see `warmupStretchesFor()`/`cooldownStretchesFor()`/`sessionExForProfile()` in `training.js`.
- `computeInsights()` — **new in v185**, in `src/core/insights.js` (a new core module — remember to add any future core module to **both** `scripts/build.py` and `scripts/build.js`'s `JS_FILES` lists, or the packaged zip silently drops it). Cross-domain pattern checks over the user's own logged history; each check returns `null` unless both sides of its comparison have real support. Rendered by `renderInsightsBlock()` in `records.js`.
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
