Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity. **The GUI revamp (v168–v174, v190–v191) is now fully closed out — read that span before touching anything GUI-related again, so you don't re-audit or re-litigate a decision that's already been made** (see "GUI revamp" section below).
3. `planning/IDEAS-tests-fm-workouts.md` — **fully complete as of v189, no open items** — read it anyway for the honesty/scoping precedents each phase set (FM-Adapt's "plain rule not a fitted model," X-Insight's "silent unless real support," FM-3's "don't invent a difficulty score," X-SmartFocus's "don't invent a progress-toward-next-level number") before proposing whatever comes after it.
4. `planning/IDEAS-gui-revamp.md` — **fully complete as of v191, no open items.**

**Current version: v191.** The service worker is at `operations-v191` in `sw.js`. `SKILL_LADDER_VER` is **118** (unchanged since v186 — v187 through v191 touched no ladder/tier/guidance content). Total skills: **12524**. (v182-v184 were quick interrupts, not FM-doc phases — every subjective self-rating input in the app (effort, readiness, PT intensity, session RPE) now uses a 1-10 scale; this is now a **standing convention in `CLAUDE.md`** for any future rating input. See the v182/v183/v184 entries in `FINISHED-FEATURES.md`.)

**The entire FM/test-features workstream (`planning/IDEAS-tests-fm-workouts.md`) is DONE — X-Timeline, X-AAR, FM-1, FM-2, FM-Adapt, X-Insight, Phase T (all 9 constructs + the focus-picker menu), FM-3, and X-SmartFocus have all shipped (v175 through v189), and v190 independently re-confirmed FM-1/FM-2/FM-Adapt/FM-3 all still work correctly via real behavioral tests (not just re-reading code) — nothing needed fixing.**

**The GUI revamp is also fully DONE as of v191 — both Phase A (v190: font self-hosting, design-system foundation, Plan/Log/AFT restructure, nav reorg) and Phase B (v191: the other ~15 tabs' card/button classes retokenized, the Weight tab's distinct identity confirmed and documented, collapsible nav category groups) shipped.** See the dedicated GUI-revamp section below and the v190/v191 `FINISHED-FEATURES.md` entries for full detail.

**There is no queued next phase from either doc.** The next session should open by asking Wyatt what he wants to work on next — don't assume a workstream.

**Read this before touching `src/tabs/test.js`'s `*Done()` functions:** every test's results screen used to be silently wiped in the same tick it was written — `stage.innerHTML=results; ...; render();` — because `render()` unconditionally rebuilds the whole Test tab as a side effect, including a blank stage div, immediately after. Fixed in v186 for all 8 tests by reordering to `render()` first, then re-query and write into the fresh post-render element. **This pattern is now used by every construct in `test.js` — keep it if you touch any of them again.**

**Phase T (stealth-assessment games) is fully DONE as of v187 — all 9 constructs shipped**, and the workstream's last loose end — the session-start "pick a focus" menu — shipped in **v188**: a 9-tile grid on the Test tab (`renderFocusPicker()`) that scrolls to and auto-starts whichever game you tap. Every `test.js` cognitive drill and the `quizzes.js` knowledge quiz has a real game skin (Sentry, Land Nav Relay, Comms Relay, Perimeter Watch, Fire Discipline, Cipher Desk, Fire Mission, Intel Briefing, Climb the Tree). Nothing open here anymore.

**FM-3 (card-game workouts) is now DONE too, also v188** — Wyatt explicitly greenlit the full session build (not the one-slot prototype fallback) this session. New `src/tabs/cardgame.js`, entry point on Coach Today (`plan.js`), full-screen modal in `_shell.html` (`#cardGameModal`, same pattern as `mockAftModal`). **Read the v188 `FINISHED-FEATURES.md` entry before touching this again** — it documents one real, deliberate deviation from the design doc's literal math (no per-variant difficulty multiplier, since the real `SESSIONS` data doesn't have a hard→easy ladder per slot the way §5a assumed — inventing one would be a faked metric) and exactly how the progressive-overload guardrails are enforced (a hard `[8%,12%]`-of-threshold clamp per draw, not an emergent property). If you extend the card-game deck skins (tarot/skill-derived, from §5's "deck varies by day" idea — explicitly NOT built yet, flagged in the doc as still needing its own design pass) or touch the guardrail math, re-read that entry first.

**v180 was an unplanned, mid-workstream correctness fix** (real dynamic warm-up / static cool-down stretches, muscle-matched per session, sourced from a new `STRETCH_LIBRARY` — see its `FINISHED-FEATURES.md` entry) — not part of the FM-doc build order.

---

## The pyramid Commons-layer workstream (v150–v167) is DONE — do not restart it

All 16 of 16 Mythic trees have complete Commons layers (10,000 Commons skills), verified 5/5/5/5/5 with zero orphans. See the v167 entry in `FINISHED-FEATURES.md` if you ever need to re-derive that this is really finished.

---

## GUI revamp — the real history (read this before doing anything else GUI-related)

Wyatt requested a whole-app GUI revamp mid-session during v167: visual/theme refresh, layout/navigation restructuring, mobile/responsive overhaul, and a specifically-flagged skills-tab redesign. **This spanned SIX sessions (v168, v170, v171, v172, v174, v190) not all tracked as one continuous workstream at the time** — `FINISHED-FEATURES.md`/`SESSION-TIMES.md` went stale between v167 and v172 once already (backfilled during v173 specifically so it wouldn't happen again). **If you're about to "audit the skills tab," "audit the nav/visual/mobile state," or re-scope the visual system again, stop and read the v168–v174 span plus the v190 entry first — don't re-derive state that's already answered.** The actual state, accurately, as of v190:

- **Item 4, the skills tab (visibility/clutter/organization/unlock-clarity): DONE, v168–v172.** Chain view/Side Deck/tree insignia (v168), pyramid-structured List view — "the core piece of the GUI revamp" (v170), a duplicate-section cleanup (v171), Tree-view leaf-crowding fix + Focus strip + pyramid explainer (v172). Nothing else needed here unless Wyatt raises a new, specific complaint.
- **Item 2 (nav restructuring) + item 3 (mobile): DONE, v174 + v190 + v191.** v174 built the mobile bottom-bar (4 tabs) + slide-up drawer (the other 14), replacing an unpaginated horizontal-scroll strip. v190 did the desktop side v174 explicitly left alone: replaced the old 7-primary/11-"More" split's zero-documented-rationale flat list with real category group headers (Testing & Study / Identity & Record / Objectives / Reflection & Reward), applied the same grouping to the mobile drawer plus a pinned "Training" group (Plan/AFT/Log, which are desktop-primary but mobile-secondary) first. Desktop-7 and mobile-4 deliberately keep different counts, with a stated rationale (every-session vs. every-day-in-seconds) instead of silence. v191 made those group headers collapsible (`initNavGroupToggles()`, `events.js`) — tap to show/hide a group, defaults expanded, DOM-only state.
- **Item 1 (visual/theme refresh): DONE, Phase A (v190) + Phase B (v191).** v174 was explicitly "light polish only, don't redesign." v190/v191 went further — Wyatt confirmed "open to a fuller creative redesign" — building the *foundation* first in v190 (design tokens, a shared button/card class vocabulary, a 197-occurrence rgba→var() mechanical sweep, dead-font cleanup, self-hosted fonts) applied to Plan/Log/AFT, then in v191 the other ~15 tabs' card/button classes (25 cards + 12 buttons) retokenized onto that same scale — same colors, same near-identical pixel values, a mechanical migration, not a redesign. The Weight tab's serif font + separate tan palette was explicitly confirmed intentional (kept, not unified) and is now documented with a comment above `#view-weight` in `main.css` so a future session doesn't misread it as unaddressed drift.

**Nothing open in this workstream anymore.** Font self-hosting, Phase A, Phase B, and the nav interaction upgrade are all done (v190/v191). Any further GUI work — a different visual direction, new tabs needing the token system for the first time, revisiting the Weight tab decision — is a fresh ask, not a continuation of this backlog.

---

## v173 — TOC data bridge (cross-project, unrelated to the GUI revamp)

Wyatt asked, in a later session, for **TOC** — a separate personal project at `C:\Users\wyatt\Files\Projects\TOC\` (an offline desktop app that runs/serves/views his other local projects) — to give Operations more durable save-data persistence than the plain web version or installed Chrome PWA, on any machine that has both TOC and this repo. Full detail in the v173 entry of `FINISHED-FEATURES.md`. Short version:

- **Root cause:** TOC serves Operations from its own loopback origin (`127.0.0.1:8081`), different from Operations' normal hosted URL's origin — `localStorage` doesn't carry over between them at all.
- **TOC's side** (that repo's own `PHASE_7_NOTES.md`/`CLAUDE.md` have the full detail — **read those, not just this summary, before touching TOC's code again**): a new opt-in `data_bridge: true` registry field; `backend/projectdata.py` reads/writes `<project path>/personal/toc-save.json` **inside the project's own folder**, never TOC's own `config/`; new CORS-scoped `GET`/`POST /api/projects/{id}/data` routes on TOC's existing FastAPI backend (no `pywebview` bridge involved — TOC's whole frontend already talks to its backend over plain `fetch()`, so Operations does too, directly, cross-origin). Operations opted in. 243 tests passing there, ruff+mypy clean.
- **Operations' side** (`src/core/app-setup.js`, new "TOC DATA BRIDGE" section beside the pre-existing cloud-file-sync): `tocInit()` best-effort-probes `http://127.0.0.1:8799/api/health`; if TOC's there, adopts its save the same way `cloudInit()` already adopts a linked cloud file, running **after** `cloudInit()` so TOC wins if both differ. `tocWriteDebounced()` hooks into `state.js`'s `save()` alongside the existing `cloudWriteDebounced()` — both fire independently on every save (Wyatt wanted redundant locations, not either/or). Footer text (`setCloudStatus()`) names every active sync target.
- **A real cross-origin CORS wrinkle was found and fixed on TOC's side** (its `/api/health` route needed a wildcard CORS header so the *probe itself* doesn't log a console error for the common case of TOC not running) — verified live against a real, already-running TOC instance on this machine (not just a mock), using a throwaway Playwright script.

**Live end-to-end verification: DONE**, in a follow-up pass the same day. Started a real TOC instance, opened Operations through its actual static host (not a `file://` mock), made a change, confirmed it saved through the bridge, and — after a full page reload — confirmed the value correctly re-adopted from `personal/toc-save.json`. Zero console/page errors. Test artifacts (the fake save data, the TOC instance started for the test) were cleaned up afterward — `personal/toc-save.json` does not currently exist; it'll regenerate the first time Wyatt actually uses Operations through a real TOC session. Cross-machine OneDrive sync itself (does the file actually propagate to a second linked computer) is the one piece still unverified — inherently can't be checked from a single machine.

---

## FM/test-features workstream — CLOSED, all 9 top-level phases done as of v189

`planning/IDEAS-tests-fm-workouts.md` has a confirmed build order at the bottom: **X-Timeline → X-AAR → FM-1 (#2+2b) → FM-2 (#3) → FM-Adapt → X-Insight (A) → T (#1) → FM-3 (#5) → X-SmartFocus (B)**. It was originally gated behind the pyramid Commons workstream, which finished long ago (v167) — so this is simply the next thing to build, no re-confirmation needed unless you're changing something the doc already locked in.

- **Phase X-Timeline (idea D): DONE — v175, decluttered in v176.** A new `renderUpcomingTimeline()` in `src/tabs/today.js` merges quest due dates, boss target dates, the AFT test date, milestones, and qualification expiries into one sorted "Upcoming" card on the Dawn tab, with the pre-existing scattered per-source indicators (milestone bar, qual/counseling alerts, quest-due-soon/AFT-date notes) either removed (fully superseded) or trimmed to overdue-only (the complementary case Upcoming deliberately excludes). No open items.
- **Phase X-AAR (idea C): DONE — v177.** New `S.aarLog` array + UI in `records.js`/`records.html`, modeled directly on the existing counseling log's pattern (same delegated-click-handler style in `awards.js`, same `SECTIONS`/CSV export conventions). Real AAR structure (planned/actual/why/sustain/improve), not another free-text field. Contextually promptable per the doc's "ideally" note: `aarNudgeHtml()` on the Dawn tab fires after a broken streak or a below-standard AFT, suppressed once an AAR's been logged in the last 3 days. No open items.
- **Phase FM-1 (ideas #2/#2b): DONE — v178.** `WEEK_PLAN` in `src/core/training.js` is gone, replaced by `assignWeekSessions()` — a function of declared gym-access days via the designed 3-layer cascade (`S.gymAccess.default` → `S.gymAccess.week` confirmed-for-this-week → `S.gymAccessLive` same-day override). `pickAftMode()` picks mock/practice/circuit for AFT-circuit days by reusing `recoveryReadiness()` + AFT history/test-date. Guided mock-AFT walkthrough built in `aft.js` — full "mock" mode saves a real `S.aft` entry; single-event "practice" mode deliberately does **not**, to avoid a misleadingly-low faked "total". No open items.
- **Phase FM-2 (idea #3): DONE — v179, scope expanded live during the build session (see the v179 entry in `FINISHED-FEATURES.md` for the full account).** `S.hasGym` is gone, replaced by `S.equipProfiles` (named, user-editable profiles — real defaults "ROTC/Campus Gym" and "Dorm") built from a 19-tag `EQUIP_TAGS` taxonomy grounded in real Wake Forest research (Wellbeing Center's confirmed weight room/pool/climbing wall) plus Wyatt's direct confirmation of his battalion trailer's contents (full AFT kit, water jugs, weighted stretcher — everything else is an explicitly `unverified`-flagged common-gear placeholder). Every `SESSIONS` exercise slot is now a real multi-variant pool (`eq:[...]`/`m:[...]` tagged, `alt:{slotIdx:[...]}` for extras like the ROTC-trailer carries), filtered by the active profile and picked deterministically per day — the same mechanism gives both equipment-fallback and day-to-day variety. A "🔀 swap" affordance on any multi-option exercise lets you override the day's suggestion (`S.exChoice`), honored everywhere (Dawn, Coach, Log). Swim and Rock Climbing shipped as new opt-in, equipment-gated, coach-suggested (never auto-scheduled) session types. `prescriptionFor()` now suggests a starting weight sourced from your real logged history (`lastLoggedWeight()`) — a first, **non-adaptive** step; the full adaptive-learning ask got carved out as its own phase (next). No open items on what shipped.
- **Phase FM-Adapt: DONE — v181** (per-exercise effort rating later changed to a full 1-10 scale in v182, see below). Turned out not to need the "dedicated design pass" originally flagged — reading the codebase first (before designing) found `computeTarget()`/`renderAdaptiveTargets()` (`log.js`) already existed: a real, working, trend/stall-aware, baseline-blended next-session-target engine, with a per-workout RPE field already captured and saved but never actually read by anything. FM-Adapt turned into a bounded extension of that trusted engine rather than a new system: added a per-exercise effort rating + "had to cut it short" flag to the log form, plus a workout-level pre-session readiness check-in (logged for the record only — deliberately **not** fed into the math, since today's target is already computed before the workout starts and pretending a pre-tap recalculates it would overclaim). `computeTarget()` now factors in the last rating as a plain rule (effort≥8/reduced/RPE≥9 forces a hold; effort≤3/RPE≤6 nudges a flat trend up) — verified byte-for-byte unchanged when nothing's rated. Also retired FM-2's simpler `lastLoggedWeight()` in `prescriptionFor()` in favor of calling this same engine, so the coach card and the Adaptive Targets card never quietly disagree. No open items.
- **Phase X-Insight: DONE — v185.** This one genuinely did need the design pass (unlike FM-Adapt) — confirmed via research that no cross-series correlation logic existed anywhere, and that several data series (quizzes/SRS) have no usable per-event timeline at all. New `src/core/insights.js`/`computeInsights()`: three checks (streak consistency vs. AFT, training frequency vs. AFT improvement, weight vs. deadlift co-movement), each silent unless both sides of a comparison have real support — plain bucketed averages/co-occurrence counts, deliberately not a correlation coefficient, to avoid false statistical precision on a small personal dataset. Rendered as a new "🔍 Insights" card in `records.js`'s History tab. Verified via a Node `vm` sandbox (the module has zero DOM dependency) after the system's real memory pressure repeatedly stalled Playwright browser launches, plus one confirming real-browser UI pass. No open items.
- **Phase T (stealth-assessment games) — DONE, v186 (Sentry) + v187 (the other 8) + v188 (the focus-picker menu, the workstream's last loose end).** All 9 constructs shipped: Sentry (reaction), Land Nav Relay (digit span), Comms Relay (typing), Perimeter Watch (n-back), Fire Discipline (go/no-go), Cipher Desk (processing speed), Fire Mission (mental math), Intel Briefing (reading — a real measurement upgrade, objective comprehension replacing self-report), Climb the Tree (quizzes — first-attempt-accuracy scoring with unlimited retries), plus the "what do you want to train today?" tile menu on the Test tab. Nothing open here.
- **Phase FM-3 (card-game workouts) — DONE, v188.** Wyatt explicitly re-greenlit this after holding it in planning for several sessions, and chose the **full session build** over the doc's one-slot-prototype fallback. New `src/tabs/cardgame.js` + `#cardGameModal` in `_shell.html`, entry point on Coach Today. Implements the confirmed §5/§5a spec (auto-draw, suit→exercise, rank→reps, threshold auto-advance, adaptive difficulty-bias, progressive-overload guardrails) sitting entirely on top of FM-2's `sessionExForProfile()` and FM-Adapt's `computeTarget()`/`BEGINNER_RX` — no parallel exercise-selection or volume logic. **One documented, deliberate deviation from §5a's literal math:** no per-variant difficulty multiplier (the real `SESSIONS` data doesn't have a hard→easy ladder per slot the way §5a assumed a fixed 4-variant structure would — inventing a difficulty score would be a faked metric). See the v188 `FINISHED-FEATURES.md` entry before touching this again, especially before touching the guardrail math (a hard `[8%,12%]`-of-threshold clamp per draw) or building out the "deck skin varies by day" idea (tarot/skill-derived decks — explicitly NOT built, still needs its own design pass per the doc).
- **Phase X-SmartFocus — DONE, v189.** The last item in the doc. Needed its own goal-weighting design pass exactly as flagged — worked through it with Wyatt via `AskUserQuestion` (Path weighting, leverage math, deadline anchoring, surface placement) before writing any code. New `computeSmartFocus()` (`skills-core.js`) scores every already-started skill as `path_weight × (urgency + opportunity)` and surfaces the single highest scorer as a "🎯 Your real priority" callout supplementing Today's Hand (`smartFocusCalloutHtml()`, `today.js`) — silent when nothing qualifies. **One documented judgment call:** "opportunity" is `peakLevel − effectiveLevel` (a real, already-tracked number), not "closest to leveling up" as the doc's own phrasing suggested — the app has no way to measure fractional progress toward an unearned level, so inventing that number would be a faked metric. Practical effect: this recommender only surfaces skills you've already started and let slip (or are about to) — not new-skill discovery, which Today's Hand's random draw already covers. See the v189 `FINISHED-FEATURES.md` entry before touching this again.
- **The FM/test-features doc has no open items left.** Don't assume there's a queued next phase — ask Wyatt what to work on next.

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
- `cgOpen()`/`cgAvailableToday()` — **new in v188**, in `src/tabs/cardgame.js` (also registered in both build file lists — same reminder as above). FM-3's card-game workout entry points; `cgOpen()` launches `#cardGameModal`, `cgAvailableToday()` gates the Coach Today entry button to sessions with at least one real reps-type work-phase slot. `cgSlotVolume(skey, exName)` resolves a slot's real prescribed volume (adaptive `computeTarget()` first, `BEGINNER_RX` starter table second, a generic default last) into `{repsPerSet, setsTarget, threshold}` — the number FM-3's guardrail math clamps every draw against.
- `renderFocusPicker()` — **new in v188**, in `src/tabs/test.js`. Renders the Test tab's "what do you want to train today?" tile grid (`FOCUS_TILES`); each tile scrolls to and auto-clicks an existing test's real Start button — no duplicated start logic.
- `computeSmartFocus()` — **new in v189**, in `src/core/skills-core.js`. Whole-tree leverage recommender: `path_weight × (urgency + opportunity)` across every already-started skill, returns the top scorer or `null`. Rendered by `smartFocusCalloutHtml()` in `today.js`, supplementing Today's Hand. `opportunity` is `peakLevel − effectiveLevel`, deliberately not a "closest to next level" estimate (unmeasurable without inventing a metric) — see the v189 `FINISHED-FEATURES.md` entry for why.
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
