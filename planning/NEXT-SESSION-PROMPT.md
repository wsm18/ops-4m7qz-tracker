Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity. **The GUI revamp (v168–v174, v190–v191) is now fully closed out — read that span before touching anything GUI-related again, so you don't re-audit or re-litigate a decision that's already been made** (see "GUI revamp" section below).

The FM/test-features and GUI-revamp *proposal* docs (`IDEAS-tests-fm-workouts.md`, `IDEAS-gui-revamp.md`) were deleted in v192 — both workstreams are fully shipped and their content (including the honesty/scoping precedents each phase set: FM-Adapt's "plain rule not a fitted model," X-Insight's "silent unless real support," FM-3's "don't invent a difficulty score," X-SmartFocus's "don't invent a progress-toward-next-level number") lives in their respective `FINISHED-FEATURES.md` version entries instead. Read those directly rather than looking for the old proposal docs.

**Current version: v207.** The service worker is at `operations-v207` in `sw.js`. `SKILL_LADDER_VER` is **118** (unchanged since v186 — v187 through v207 touched no ladder/tier/guidance content). Total skills: **12524**.

**v197-v203 arc (all shipped, see their own `FINISHED-FEATURES.md` entries for detail):** v197-v199 fixed the FM Coach engine's real-numbers gaps; v200 found 2 live bugs via a fresh 3-agent audit; v201 fixed broken Path-development math (`catRolledLevel()` deleted, `catProgressFraction()` is now canonical) and incidentally found/fixed the real cause of the long-flagged v195 cosmetic NaN warning; v202 built a new stealth-assessment game (Signal Intercept) and fixed Memory retention, both previously permanently stuck at level 0; v203 consolidated 5 competing skill-recommendation algorithms on Dawn onto `computeSmartFocus()`. **One small loose end, not urgent:** the "remember things" concept is still split across 4 skills (`Memory span`/`Memory technique`/`Memory retention`/`Study & retention`) with no shared model — v202 only fixed `Memory retention`'s dead auto-lock, didn't reconcile all 4 charters.

**Current workstream (started v204): make FM and Quizzes genuinely excellent, not just correct.** Wyatt's own framing: FM is the priority ("I am currently really bad at" physical training, wants real help), quizzes should "prepare me for anything in that topic I could encounter." This is a program/content-QUALITY effort, not a bug hunt — two deep audits (read their full findings in this session's conversation history if not yet ported to a doc) evaluated FM against real evidence-based strength & conditioning principles and the quiz bank against real ROTC knowledge-board domains. **v207 note:** the audit's own suggestion to put AR 600-9 content on "the Weight tab" was a naming mix-up — that tab is the unrelated Promise/vow ledger (confirmed-intentional identity, v191). Real height/weight data lives in Profile; that's where the note went.

**FM roadmap — ALL items now shipped (v204/v205/v207).** See those `FINISHED-FEATURES.md` entries for detail. Nothing queued for FM as of v207.

**Quiz roadmap:**
1. ✅ **v206 — SRS auto-feed mechanism + 4 new content categories.** `feedQuizMissToSrs()` (`quizzes.js`) hooked into `answerQuiz()` — a first-attempt-wrong quiz question now auto-creates/adds to a per-category SRS deck, deduped by `{quizKey,qIndex}`. Added `ranks`/`radiocomms`/`drill`/`aftknowledge` to `quizbank.js` (40 new questions, same `{q,a,c,e}` shape and sourced-explanation convention as the existing 16 categories) — bank is now 20 categories. See the v206 `FINISHED-FEATURES.md` entry.
2. **Not started — expand thin existing categories.** `leadership` (6 questions), `profession` (5), `comms` (5 — misleadingly named, it's generic interpersonal-communication theory, not radio procedure, which v206's new `radiocomms` category now actually covers), `history` (6, Revolutionary War only — no WWI/WWII/Korea/Vietnam/GWOT).
3. **Not started — fix category-content mismatches.** `weapons` promises M9/M17 in its name but has zero pistol questions (M4/M249 only) — either add pistol content or rename.
4. **Not started — per-question weak-area tracking.** `S.quizzes[key]` is currently just `{passed,bestPct,attempts}` — no record of which specific questions get missed repeatedly, beyond what the new v206 SRS auto-feed indirectly captures via deck contents.
5. **Not started — a real board-readiness view.** `records.js`'s history tab currently shows only a milestone tally ("X/20 quiz banks passed"), no per-domain breakdown of actual readiness.

Read the full quiz audit report (dispatched as a background agent in the v204-session conversation) before continuing this workstream if the summary above isn't enough context — it has exact evidence (file/line citations, exact category names/counts) this summary compresses.

Any of the small bug findings not yet fixed as of a future session (see the full 3-agent audit results in this conversation's history if not yet ported to a doc) are fair game to just fix — they were confirmed live and low-risk, not design decisions. (v182-v184 were quick interrupts, not FM-doc phases — every subjective self-rating input in the app (effort, readiness, PT intensity, session RPE) now uses a 1-10 scale; this is now a **standing convention in `CLAUDE.md`** for any future rating input. See the v182/v183/v184 entries in `FINISHED-FEATURES.md`.)

**v197-v198 fixed real bugs stopping "Today's Orders" (`renderCoachToday()`'s heading, `#coachToday` on the Coach Hub) from showing real adaptive numbers — read both `FINISHED-FEATURES.md` entries before touching `computeTargetFallback()` (`log.js`) again.** v197: (1) Logged workout exercise names transcribed in v193/v196 didn't exactly match `SESSIONS`' canonical names, so tier-1 "adaptive" resolution silently missed real history — fixed by renaming 16 logged exercise names to their canonical equivalents, pushed live via TOC's own `POST /api/projects/operations/data`. (2) tier-3 "starter" only checked one `BEGINNER_RX` list (`gym` or `bw`) based on the day's gym-access flag, missing bodyweight-only accessories that appear even on gym days — fixed to check both, which then surfaced a false-match bug: the word-overlap matcher started matching warm-up/cool-down stretches onto unrelated strength rows via common short words like "hold". Fixed by gating tier-3 on `exArg._phase` not being warmup/cooldown/flex. v198: tier-4's generic fallback text was still the intensity-based strength-set prose ("leave 1-2 reps in the tank") even for warm-up/cool-down items, which is wrong for movement prep — fixed with a phase-aware branch that extracts the real rep/hold spec already embedded in most `STRETCH_LIBRARY` names (e.g. "(10/leg)", "(hold 30s ×2/side)") via a digit-gated regex, falling back to a short phase-appropriate qualifier when no spec exists.

**v196 fixed a real, previously-unnoticed data-loss bug in the TOC bridge (`app-setup.js`) — read this if `personal/toc-save.json` ever looks emptied out again.** `tocInit()` used to mark TOC "present" (and therefore safe to write to) as soon as its health-check endpoint answered, before the separate fetch for the actual saved data had resolved — on a slow/cold backend response (a real risk for a local Python service), that data fetch could time out, leaving the real save never adopted but writes still enabled. The next `save()` for any reason (even an automatic `checkDailyReset()`) would then silently flush the still-fresh/default local state over the real one. This happened for real, twice, before it was traced and fixed this session. Fix: a new `_tocDataConfirmed` flag, separate from `_tocPresent`, gates all writes — it only becomes true on a *definitive* answer (data adopted, or an explicit "nothing there yet"), never on a timeout, and the data fetch now retries once with a longer timeout before giving up. Verified via a mocked-timeout Playwright scenario that no write is attempted when data can't be confirmed. **If you ever need to touch `personal/toc-save.json`/`personal/save.json` directly again: always block `http://127.0.0.1:8799/**` in any Playwright script that seeds/mutates `S` before writing the result, and never trust a "TOC responded" signal alone as license to write.**

**v192-v195 were a continuous project-cleanup-then-FM-redesign arc.** v192 was a full project cleanup (dead code, real bugs, planning-doc maintenance). v193-v194 wired AFT history into `computeTarget()` and merged the adaptive engine into the Plan tab's own views — both since fully superseded by v195's larger restructure, so **read v195's `FINISHED-FEATURES.md` entry, not v193/v194, for the FM subsystem's current shape.**

**v195 is the FM subsystem's current architecture — read this before touching Plan/Log/AFT/card-game again:**
- **`computeTarget()` (`log.js`) is the single source of truth everywhere**, resolved through 4 tiers: "adaptive" (real logged trend) → "aft-anchor" (seeded from AFT history, no log yet) → "starter" (NEW: no history, falls back to the `BEGINNER_RX` table, AFT-fitness-scaled if weighted) → "generic" (NEW: no starter row either, plain intensity-based prose — absorbed from the old `prescriptionFor()`, which is now just a thin wrapper). **Tiers 3/4 are strictly opt-in via an `opts:{skey,intensity,rich}` parameter — a bare `computeTarget(name)` call with no opts still returns only tiers 1-2 or `null`, exactly as before.** This matters for anything doing an existence check (e.g. the save-toast diff) — don't pass `opts` unless you actually want the richer fallback tiers.
- **`aftFitnessMultiplier()` (`aft-scoring.js`)** — a plain ±10% nudge on generic beginner-starter *weights only* (never reps), from the same `<300/300-349/≥350` bands already used for sparkline coloring. Applied in exactly one place (tier 3 of `computeTarget()`) — don't call it a second time elsewhere.
- **The Plan tab is now the "Coach Hub"** — `#coachHub` wraps Coach Today/the AFT-priorities line/recovery advisory as one always-visible unit, with whole-body skill balance demoted to a collapsed "beyond the AFT" details. Everything else (Week overview, Session N reference cards, Equipment/Gym-Access setup) lives below a "Schedule & Setup" divider as secondary reference material.
- **Session N reference cards** (`renderSessionLists()`) now render a single-column `.rx-list` (not the old fixed-column table) showing real `computeTarget()` output per exercise, tier-tagged with an icon (🎯/🔰/📋).
- Log and AFT each gained a real outbound link back to Coach Hub; the AFT tab gained its own "start a guided mock AFT" buttons (previously only reachable from Plan/Dawn); the duplicate AFT sparkline and the static, pre-adaptive `DRILL` advice text are both gone.
- **If you touch any of this, read the v195 `FINISHED-FEATURES.md` entry first** — it has the full before/after, the real bug caught during verification (tier 3's target string had to lead with reps, not sets, or card-game would silently misread the rep count), and exactly which call sites pass `opts` vs. stay bare.

**The entire FM/test-features workstream is DONE — X-Timeline, X-AAR, FM-1, FM-2, FM-Adapt, X-Insight, Phase T (all 9 constructs + the focus-picker menu), FM-3, and X-SmartFocus have all shipped (v175 through v189), and v190 independently re-confirmed FM-1/FM-2/FM-Adapt/FM-3 all still work correctly via real behavioral tests (not just re-reading code) — nothing needed fixing.**

**The GUI revamp is also fully DONE as of v191 — both Phase A (v190: font self-hosting, design-system foundation, Plan/Log/AFT restructure, nav reorg) and Phase B (v191: the other ~15 tabs' card/button classes retokenized, the Weight tab's distinct identity confirmed and documented, collapsible nav category groups) shipped.** See the dedicated GUI-revamp section below and the v190/v191 `FINISHED-FEATURES.md` entries for full detail.

**There is no queued next phase from either doc.** The next session should open by asking Wyatt what he wants to work on next — don't assume a workstream.

**Read this before touching `src/tabs/test.js`'s `*Done()` functions:** every test's results screen used to be silently wiped in the same tick it was written — `stage.innerHTML=results; ...; render();` — because `render()` unconditionally rebuilds the whole Test tab as a side effect, including a blank stage div, immediately after. Fixed in v186 for all 8 tests by reordering to `render()` first, then re-query and write into the fresh post-render element. **This pattern is now used by every construct in `test.js` — keep it if you touch any of them again.**

**Phase T (stealth-assessment games) is fully DONE as of v187 — all 9 constructs shipped**, and the workstream's last loose end — the session-start "pick a focus" menu — shipped in **v188**: a 9-tile grid on the Test tab (`renderFocusPicker()`) that scrolls to and auto-starts whichever game you tap. Every `test.js` cognitive drill and the `quizzes.js` knowledge quiz has a real game skin (Sentry, Land Nav Relay, Comms Relay, Perimeter Watch, Fire Discipline, Cipher Desk, Fire Mission, Intel Briefing, Climb the Tree). **A 10th construct, Signal Intercept (pattern recognition), was added in v202** — see that `FINISHED-FEATURES.md` entry; it wasn't part of the original Phase T build order, added later to fix a permanently-stuck-at-0 skill found by the v200-session audit. If you add a new `test.js` game, remember `awards.js`'s `data-teststart` click delegation is a hardcoded if/else chain by test id (not automatic from the `TESTS` array) — easy to add the game function and `TESTS` entry and forget this dispatch line.

**FM-3 (card-game workouts) is now DONE too, also v188** — Wyatt explicitly greenlit the full session build (not the one-slot prototype fallback) this session. New `src/tabs/cardgame.js`, entry point on Coach Today (`plan.js`), full-screen modal in `_shell.html` (`#cardGameModal`, same pattern as `mockAftModal`). **Read the v188 `FINISHED-FEATURES.md` entry before touching this again** — it documents one real, deliberate deviation from the original design's literal math (no per-variant difficulty multiplier, since the real `SESSIONS` data doesn't have a hard→easy ladder per slot the way the original spec assumed — inventing one would be a faked metric) and exactly how the progressive-overload guardrails are enforced (a hard `[8%,12%]`-of-threshold clamp per draw, not an emergent property). If you extend the card-game deck skins (tarot/skill-derived, a "deck varies by day" idea — explicitly NOT built yet, still needs its own design pass) or touch the guardrail math, re-read that entry first.

**v180 was an unplanned, mid-workstream correctness fix** (real dynamic warm-up / static cool-down stretches, muscle-matched per session, sourced from a new `STRETCH_LIBRARY` — see its `FINISHED-FEATURES.md` entry) — not part of the FM-doc build order.

---

## The pyramid Commons-layer workstream (v150–v167) is DONE — do not restart it

All 16 of 16 Mythic trees have complete Commons layers (10,000 Commons skills), verified 5/5/5/5/5 with zero orphans. See the v167 entry in `FINISHED-FEATURES.md` if you ever need to re-derive that this is really finished.

---

## GUI revamp — DONE (v168–v174, v190–v191) — do not restart or re-audit

All four fronts are finished. Full detail lives in each version's `FINISHED-FEATURES.md` entry — read the relevant one before touching that area again, don't re-derive state that's already answered:

- **Skills tab** (v168–v172): Chain view/Side Deck/tree insignia, pyramid-structured List view, a duplicate-section cleanup, Tree-view leaf-crowding fix + Focus strip + pyramid explainer.
- **Nav** (v174, v190, v191): mobile bottom-bar (4 tabs) + drawer (other 14, v174); desktop "More" drawer got category group headers replacing the old undocumented 7/11 split (v190); both drawers' groups are now collapsible via `initNavGroupToggles()` in `events.js` (v191).
- **Visual/theme** (v190 Phase A, v191 Phase B): design tokens (`--space-*`/`--radius-*`/`--*-rgb`) and shared `.btn`/`.card` base classes, applied first to Plan/Log/AFT then all remaining ~15 tabs. Weight tab's serif/tan identity confirmed intentional and documented with a comment in `main.css`.

Any further GUI work — a different visual direction, new tabs needing the token system, revisiting the Weight tab decision — is a fresh ask, not a continuation of this backlog.

---

## v173 — TOC data bridge (cross-project, unrelated to the GUI revamp)

Wyatt asked, in a later session, for **TOC** — a separate personal project at `C:\Users\wyatt\Files\Projects\TOC\` (an offline desktop app that runs/serves/views his other local projects) — to give Operations more durable save-data persistence than the plain web version or installed Chrome PWA, on any machine that has both TOC and this repo. Full detail in the v173 entry of `FINISHED-FEATURES.md`. Short version:

- **Root cause:** TOC serves Operations from its own loopback origin (`127.0.0.1:8081`), different from Operations' normal hosted URL's origin — `localStorage` doesn't carry over between them at all.
- **TOC's side** (that repo's own `PHASE_7_NOTES.md`/`CLAUDE.md` have the full detail — **read those, not just this summary, before touching TOC's code again**): a new opt-in `data_bridge: true` registry field; `backend/projectdata.py` reads/writes `<project path>/personal/toc-save.json` **inside the project's own folder**, never TOC's own `config/`; new CORS-scoped `GET`/`POST /api/projects/{id}/data` routes on TOC's existing FastAPI backend (no `pywebview` bridge involved — TOC's whole frontend already talks to its backend over plain `fetch()`, so Operations does too, directly, cross-origin). Operations opted in. 243 tests passing there, ruff+mypy clean.
- **Operations' side** (`src/core/app-setup.js`, new "TOC DATA BRIDGE" section beside the pre-existing cloud-file-sync): `tocInit()` best-effort-probes `http://127.0.0.1:8799/api/health`; if TOC's there, adopts its save the same way `cloudInit()` already adopts a linked cloud file, running **after** `cloudInit()` so TOC wins if both differ. `tocWriteDebounced()` hooks into `state.js`'s `save()` alongside the existing `cloudWriteDebounced()` — both fire independently on every save (Wyatt wanted redundant locations, not either/or). Footer text (`setCloudStatus()`) names every active sync target.
- **A real cross-origin CORS wrinkle was found and fixed on TOC's side** (its `/api/health` route needed a wildcard CORS header so the *probe itself* doesn't log a console error for the common case of TOC not running) — verified live against a real, already-running TOC instance on this machine (not just a mock), using a throwaway Playwright script.

**Live end-to-end verification: DONE**, in a follow-up pass the same day. Started a real TOC instance, opened Operations through its actual static host (not a `file://` mock), made a change, confirmed it saved through the bridge, and — after a full page reload — confirmed the value correctly re-adopted from `personal/toc-save.json`. Zero console/page errors. Test artifacts (the fake save data, the TOC instance started for the test) were cleaned up afterward — `personal/toc-save.json` does not currently exist; it'll regenerate the first time Wyatt actually uses Operations through a real TOC session. Cross-machine OneDrive sync itself (does the file actually propagate to a second linked computer) is the one piece still unverified — inherently can't be checked from a single machine.

---

## FM/test-features workstream — CLOSED, all 9 phases done as of v189

The FM/test-features build order is fully complete: X-Timeline, X-AAR, FM-1, FM-2, FM-Adapt, X-Insight, Phase T (all 9 stealth-assessment constructs + the focus-picker menu), FM-3, X-SmartFocus (v175–v189). No queued next phase — ask Wyatt what to work on next. Full detail is in each version's `FINISHED-FEATURES.md` entry (the original proposal doc, `IDEAS-tests-fm-workouts.md`, was deleted in v192 — everything it once specified either shipped or is documented in FINISHED-FEATURES.md); the load-bearing gotchas if you touch this code again:

- `test.js`'s `*Done()` functions must call `render()` *before* re-querying and writing results — `render()` wipes the stage div as a side effect (fixed v186 for all 8 tests; keep the pattern for any new construct).
- FM-3 (`src/tabs/cardgame.js`) deliberately has no per-variant difficulty multiplier — the real `SESSIONS` data has no hard→easy ladder per slot, so inventing one would be a faked metric. Guardrail is a hard `[8%,12%]`-of-threshold clamp per draw. "Deck skin varies by day" (tarot/skill-derived decks) is explicitly NOT built — needs its own design pass if picked up.
- X-SmartFocus's "opportunity" is `peakLevel − effectiveLevel`, not "closest to leveling up" — the app can't measure fractional progress toward an unearned level without inventing a metric.
- `npm run regress` can intermittently hang under system memory pressure (unrelated to app code, confirmed v175) — check free memory before assuming a regression.

**`planning/IMPROVEMENTS-skills-expansion.md` (new T1–T8 tactical skills) was explicitly declined for the v192 cleanup session** — Wyatt didn't want more skills without also building their mythic trees, given how long the Commons-layer mythic-tree work took. Don't propose it unprompted; it's still there if he wants it later.

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
- `catProgressFraction(cat)` → **new in v172, the one canonical "how developed is this Path" number as of v201** — 0-1 fraction of overall progress across every leaf in a Path (sum eff / sum max); drives the Tree view's world-lighting, the Skills-tab deck header corners, and Plan's "Overall physical development" line. (`catRolledLevel(cat)` — the old top-level-skill average — was deleted in v201: it became structurally broken once the Commons-layer's ~10,000 flat per-Path skills were added, since they count as "top-level" and permanently drag the average toward 0.)
- `catPyramidCompletion(cat)` → 0-1 fraction of pyramid-tagged skills *fully mastered* (stricter than the above); drives the Tree view's rim-stud ring.
- `skReadyToCombine()` → **new in v172**, in `skills-core.js` — every synthesis-target seed whose set is fully mastered but not yet combined; backs the Focus strip's "Ready to combine" column.
- `PATH_META` — path metadata (name, icon, color, world, lore), in `constants.js`.
- `SK_PATH_ICON` — path → emoji map, in `tree.js`.
- `STRETCH_LIBRARY`/`AREA_MUSCLES` — **new in v180**, in `constants.js` — the tagged dynamic-warmup/static-cooldown pool every session's warm-up/cool-down (and Session 5's flexibility block) is composed from; see `warmupStretchesFor()`/`cooldownStretchesFor()`/`sessionExForProfile()` in `training.js`.
- `computeInsights()` — **new in v185**, in `src/core/insights.js` (a new core module — remember to add any future core module to **both** `scripts/build.py` and `scripts/build.js`'s `JS_FILES` lists, or the packaged zip silently drops it). Cross-domain pattern checks over the user's own logged history; each check returns `null` unless both sides of its comparison have real support. Rendered by `renderInsightsBlock()` in `records.js`.
- `cgOpen()`/`cgAvailableToday()` — **new in v188**, in `src/tabs/cardgame.js` (also registered in both build file lists — same reminder as above). FM-3's card-game workout entry points; `cgOpen()` launches `#cardGameModal`, `cgAvailableToday()` gates the Coach Today entry button to sessions with at least one real reps-type work-phase slot. `cgSlotVolume(skey, exName, rich)` — **updated in v195** — resolves a slot's real prescribed volume via a single `computeTarget(exName,{skey,rich})` call (the same 4-tier engine everything else uses now, not a separate manual fallback chain) into `{repsPerSet, setsTarget, threshold}` — the number FM-3's guardrail math clamps every draw against.
- `renderFocusPicker()` — **new in v188**, in `src/tabs/test.js`. Renders the Test tab's "what do you want to train today?" tile grid (`FOCUS_TILES`); each tile scrolls to and auto-clicks an existing test's real Start button — no duplicated start logic.
- `computeSmartFocus()` — **new in v189, the single canonical "what skill needs attention" ranker as of v203** — in `src/core/skills-core.js`. Whole-tree leverage recommender: `path_weight × (urgency + opportunity)` across every already-started skill, returns the top scorer or `null`. Consumed in 3 places in `today.js`: `smartFocusCalloutHtml()` (the callout embedded in Today's Hand), `getWarriorsFocus()`'s skill-focus step (returns the pick's id as `skId`), and the "Skill needing attention" Field Notes row (suppressed if `skId` matches `getWarriorsFocus()`'s pick, so a real agreement doesn't print the same skill twice). Today's Hand's own random 5-skill draw stays independent by design — it's the deliberate "practice something, not urgency-driven" mode, not a 4th competing urgency picker. `opportunity` is `peakLevel − effectiveLevel`, deliberately not a "closest to next level" estimate (unmeasurable without inventing a metric) — see the v189 `FINISHED-FEATURES.md` entry for why.
- **Design-system tokens** — **new in v190**, in `main.css`'s `:root`: `--space-1` through `--space-8` (2–16px) and `--radius-xs/sm/md/lg/pill/full` (4–999px), plus `--gold-rgb`/`--jade-rgb`/`--ember-rgb`/`--violet-rgb`/`--blood-rgb` (use as `rgba(var(--gold-rgb),.08)` etc.). For new/touched CSS — most of the file's 400+ raw px values are untouched by design (retrofitting all of them wasn't the goal).
- **Shared button/card classes** — **new in v190**, in `main.css`, additive alongside (not replacing) the many existing hand-declared classes: `.btn`/`.btn-primary`(gold)/`.btn-positive`(jade)/`.btn-secondary`(outline)/`.btn-block`/`.btn-sm`; `.card`(flat)/`.card-raised`(gradient)/`.card-tint`+`.card-gold`/`.card-jade`/`.card-ember`/`.card-violet`/`.card-blood`. `.btn-add`/`.btn-buy` were deliberately left untouched (not merged into the new classes) since 12+ tab HTML files reference them and a literal merge risked subtly changing their exact rendered output. Use the new classes for anything new; only Plan/Log/AFT's own existing cards were migrated onto the token scale so far — the other ~15 tabs are Phase B (see the GUI-revamp section above).
- `exHowto(name)` (`training.js`) is now also wired into `renderSessionLists()`'s per-exercise list (`plan.js`, via a small `.ex-how` expand-on-request `<details>`) — **not just Coach Today** as before v190. If you add a new exercise-list render path, wire the how-to in the same way rather than leaving it name-only; the old hand-written static "Glossary" this replaced is gone (deleted v190) precisely because a second hand-maintained copy was a real drift risk.
- `initNavGroupToggles(container)` — **new in v191**, in `src/core/events.js`. Makes `.nav-group-h` category headers collapsible (walks siblings until the next header, toggles `display`). Called once each for `#navMore` and `.mobile-drawer-panel` at load. If you add a new `.nav-group-h` to either drawer, no extra wiring needed — it's picked up automatically since the function queries all `.nav-group-h` in the container.
- **By v191, all 18 tabs' primary card/button classes consume the `--space-*`/`--radius-*` design tokens** (`.sk-card`/`.cg-card` — distinct components — and the Weight tab — confirmed-intentional separate identity — are the only deliberate exceptions). If you add a new card or button class anywhere, use `.card`/`.card-raised`/`.card-tint`+color or `.btn`/`.btn-primary`/`.btn-positive`/`.btn-secondary` (`main.css`) instead of hand-declaring background/border/radius/padding from scratch.
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
