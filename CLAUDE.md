# CLAUDE.md — Operating rules for AI assistants in this repo

You are continuing work on **Operations**, a gamified ROTC + life-tracker PWA. Read this file first, then **`docs/OPERATIONS-HANDOFF.md`** for orientation (who the user is, how the big systems fit together) and **`planning/FINISHED-FEATURES.md`** for the full feature history. This file is the short, binding rulebook.

---

## What this project is (30-second version)

- The app ships as **`index.html`** (assembled from `src/`) + **`quizbank.js`** + **`sw.js`** (service worker).
- **`index.html` is generated output** — never edit it directly. Edit the source files in `src/`, then run `python scripts/build.py` to assemble.
- Fully **offline**, no framework, no runtime dependencies. Data in `localStorage` (key `operations_v2`), optional cloud-JSON backup.
- Everything measurable is a **skill** with a measurable level ladder, decay, peak, and progression, themed as a **Yggdrasil world-tree**.
- Current version: **v220** (see `sw.js`).

The user is an Army ROTC cadet building this for himself. He values **honesty, measurability, privacy, preserved progress, and symbolism** above all.

---

## Hard rules (do not violate)

1. **Edit source files in `src/`, not `index.html`.** Run `python scripts/build.py` after every change to rebuild. The `dist/` preview is also generated — never edit it by hand.
2. **Honesty / no faked metrics.** Only real, evidence-based methods. Skill levels describe what the user can *do* (verifiable benchmarks), never status labels ("elite", "instructor"). Top level = a documented human ceiling, framed honestly.
3. **Offline & private.** Never add network calls, telemetry, analytics, external fonts/CDNs, or anything that uploads user data. The app must keep working with no internet.
4. **Preserve user progress in every migration.** The user uploads OLD save files. Adding/renaming/reshaping skills must never lose a level, peak, or history entry. See "Migrations" below.
5. **Auto skills are never self-reportable.** Any skill with an `auto:` field levels only from measured/logged data. Do not add tap-to-level UI to them. (Exception already designed: `weight:integrity` may move *down*, still read-only.)
6. **A skill is never lost.** `skEffectiveLevel` floors a started skill at level 1. Don't add logic that can zero or delete a started skill.
7. **Symbolism is intentional.** The tree-of-growth / Yggdrasil theme is a feature. Keep it coherent; don't strip it for convenience.
8. **Don't over-format the app or invent scope.** Make the requested change; ask before large architectural shifts.

---

## Source file layout (`src/`)

```
src/
  _shell.html              outer HTML frame (head, nav, footer, modals, script tags)
  styles/
    main.css               all CSS
  core/
    constants.js           DEFAULT, TRACKS, VALUES, SESSIONS
    training.js            WEATHER, WEEK_PLAN, EX_HOWTO, PT_AREAS, training helpers
    state.js               KEY, load(), save(), render(), simple tab renderers, esc()
    events.js              nav/body event delegation, add-buttons, backup, toast, showLevelUp
    aft-scoring.js         AFT_TABLES, aftLookup(), clampScore(), score_* helpers
    app-setup.js           skills-UI wiring, award/event editors, cloud file system
    skills-data.js         SK_CAT, SK_CAT_ORDER, SEED_SKILLS (~102,800 lines, ~12,525 skills), seedSkillsIfEmpty()
    migration.js           SKILL_LADDER_VER, RENAMES map, mergeNewSeedSkills()
    auto-level.js          syncSkillsFromActivity(), integrityLevel(), rhrToLevel()
    skills-core.js         skSubsOf, skRolledLevel, skEffectiveLevel, skReachLevel, skLeafColor, etc.
    tree.js                SK_PATH_ICON, Yggdrasil SVG renderer, pan/zoom gestures
    init.js                SW register, seedSkillsIfEmpty(), render()  ← runs last
  tabs/
    today.html / today.js         Dashboard: greeting, creed, quests, FM advisory, skill alerts
    quests.html / quests.js       Mission list
    dailies.html / dailies.js     Daily habit orders + streaks
    bosses.html / bosses.js       Big objective HP bars
    board.html / board.js         Branch-prep task board
    shop.html                     R&R reward shop (render in state.js)
    quizzes.html / quizzes.js     ROTC quiz + SRS
    aft.html / aft.js             AFT scoring + event-focus renders
    profile.html / profile.js     Profile, blood type, vitals, Apple Health import
    test.html / test.js           Cognitive tests, SRS, memory palace, study planner
    log.html / log.js             Workout log, PT, baseline testing
    skills.html / skills.js       Skills tab list view (renderSkillsTab)
    plan.html / plan.js           FM training plan: session lists, coach-today, baseline
    cardgame.js                   FM-3: card-game workout mode (cgOpen, draw/log loop)
    awards.html / awards.js       The Wall: awards, memberships, events, volunteer hours
    records.html / records.js     History/trends, counseling log, checklists, section export
    weight.html / weight.js       Promise ledger (read-only mirror of Weight app)
    garden.html / garden.js       The Grove: read-only Path-XP idol visualization
    trophies.html / trophies.js   Carved Rings: permanent record of every level ever reached
```

---

## The required workflow for any change

```bash
# 1. (first time only) install dev tooling — requires Node.js
npm install
npx playwright install chromium

# 2. Edit the appropriate source file in src/
#    CSS changes  → src/styles/main.css
#    Tab HTML     → src/tabs/<tab>.html
#    Tab logic    → src/tabs/<tab>.js
#    Shared code  → src/core/<module>.js

# 3. Build index.html from sources
python scripts/build.py

# 4. Verify (requires Node.js)
npm run check        # syntax-check the assembled script (fast, no browser)
npm run regress      # headless: load app, click all 18 tabs, assert ZERO pageerror
npm run unit         # headless: call specific functions with known fixtures, assert known output
#   (npm run verify runs build + check + regress + unit)
#   add a tree screenshot when you change the tree:
npm run regress -- --shot   # writes dist/tree.png

# 5. if you changed any skill ladder/tier/guidance, bump SKILL_LADDER_VER in src/core/migration.js
# 6. ALWAYS bump the service-worker cache in sw.js:  operations-vNN -> vN+1
# 7. package the deliverables (requires Node.js)
npm run package      # runs build, regenerates icons, builds dist/operations.zip + preview
```

**Definition of done:** `npm run verify` passes with **0 `pageerror`**, the SW cache version is bumped, `SKILL_LADDER_VER` is bumped if any ladder changed, and `npm run package` has been run. Then tell the user to **hard-refresh / reopen the app** so the new service worker and any migration take effect.

> Benign console 404/403s from the headless test server (a font or icon fetch) are NOT `pageerror`s and don't fail the regression. Only uncaught JS errors do.

> When you verify a fix with a throwaway Playwright script, consider adding a permanent assertion to `scripts/unit-checks.js` instead (or in addition) — `regress.js` only catches thrown errors, not a function silently returning the wrong answer, so a fix verified only by a script you then delete has zero protection against being silently reintroduced later.

---

## Session time logging

Every substantive work session (a feature build, a Commons tree, a phase from any planning doc) gets its wall-clock time logged in `planning/SESSION-TIMES.md`, so future time estimates are based on measured data instead of inferred from git history — commits here often bundle multiple unrelated versions into one, which makes retroactive timing estimates unreliable (see that file's seeded historical row for a worked example of why).

- **At the start** of substantive work, run `date "+%Y-%m-%d %H:%M %Z"` and note the timestamp.
- **At the end** of that session (part of the definition of done above), run `date` again, compute elapsed wall-clock time, and append one row to `planning/SESSION-TIMES.md`: date, what was worked on, start, end, elapsed, and any notes (interruptions, whether the session was a resume of a prior cutoff, etc. — log these as real signal, not noise to hide).
- This is local dev-process bookkeeping only — it never leaves the repo and isn't user-facing telemetry, so it doesn't conflict with the offline/no-telemetry hard rule above.

---

## Where things live (source file → key code)

| What you want to change | Edit this file |
|---|---|
| App constants, DEFAULT state | `src/core/constants.js` |
| Training schedule, PT data | `src/core/training.js` |
| State machine (load/save/render) | `src/core/state.js` |
| AFT scoring tables | `src/core/aft-scoring.js` |
| SEED_SKILLS (all skill ladders) | `src/core/skills-data.js` |
| SKILL_LADDER_VER, RENAMES, migration | `src/core/migration.js` |
| Auto-level from activity (AFT/RHR/Integrity) | `src/core/auto-level.js` |
| Skill level/decay/peak calculations | `src/core/skills-core.js` |
| Yggdrasil tree SVG renderer | `src/core/tree.js` |
| Cloud file sync, event wiring | `src/core/app-setup.js` |
| Card-game (FM-3) workout mode | `src/tabs/cardgame.js` |
| Any tab's HTML structure | `src/tabs/<tab>.html` |
| Any tab's render logic | `src/tabs/<tab>.js` |
| All CSS / theming | `src/styles/main.css` |
| App init / SW registration | `src/core/init.js` |

---

## Migrations — read before touching skills

The user's saves are often many versions old. `mergeNewSeedSkills()` (in `src/core/migration.js`) must bring any old save fully current **without losing progress**. When you change skills:

- **Adding a skill:** add it to `SEED_SKILLS` in `src/core/skills-data.js`. Give it a full measurable ladder, `tiers` (top tier `upTo` == ladder length), `advance`/`maintain`/`roadmap` arrays whose lengths equal the ladder length, and the honesty/guidance copy.
- **Renaming a skill:** add `{from:"Old name", to:"New name"}` to the `RENAMES` array in `src/core/migration.js`. It carries the higher progress onto the new skill and removes the orphan.
- **Changing any ladder/tier/guidance text:** **bump `SKILL_LADDER_VER` in `src/core/migration.js`.** That triggers a one-time force-resync of all ladder content on old saves (progress numbers preserved).
- **Always test against a simulated old save:** strip the new skills/Paths, set a known progress, run the migration, and assert progress preserved + orphans merged + ladders correct + new Paths present.

---

## Tree (Yggdrasil) specifics

- 10 worlds: 7 in the crown on a radial fan, 3 in the roots (Self, Hearth, Roots).
- Placement is deterministic via `SLOT_BY_CAT` + polar math in `src/core/tree.js`, spaced so **no path's foliage overlaps another's**. If you add a Path or change spacing, re-verify there's no overlap and screenshot with `npm run regress -- --shot`.
- Limbs must visibly **connect** the trunk to each world. Root worlds connect via the drawn root.
- Keep CSS variables for colors; keep pan/zoom, leaf tooltips, and the List↔Tree toggle working.

---

## Style & conventions

- Match the existing code style (terse, no framework, lots of small helpers). No new dependencies.
- Keep copy in the app's honest, plain voice. Medical/health content stays "educational, not medical advice."
- Don't reformat or churn unrelated code. Small, surgical diffs.
- Never commit `dist/`, `node_modules/`, or scratch `_*` files (they're git-ignored).
- `index.html` is assembled output — commit it after building so users can install directly from the repo.
- **Any subjective self-rating input (effort, difficulty, intensity, readiness, mood, or similar) uses a 1-10 scale** — never a coarse 3-way bucket or emoji tap. Standing rule from v182-v184. Doesn't apply to objective categorical choices (award/task-difficulty-tier pickers, etc.) or inputs that feed a specific algorithm expecting discrete grades (e.g. SRS/Anki-style spaced-repetition grading) — those stay as designed.

When in doubt about scope or a design decision, ask the user — he iterates deliberately and cares about getting names and progressions right.

<!-- BEGIN CLAUDE PILOT (auto-generated — do not edit below) -->
# Project Memory — auto-generated by Claude Pilot
# Last updated: 2026-07-09 09:07

## File map
- README.md: README.md describes Operations PWA: single-file ROTC life-tracker with 12,524 skills across a 5-tier synthesis pyramid, Yggdrasil tree, offline-first, v192 caching, migrations, 10 Paths, 18 tabs.
- docs/HOW TO INSTALL.txt: Installation guide for OPERATIONS ROTC tracker app; covers feature overview, setup via Netlify, quiz editing, and cross-device data synchronization methods.
- docs/OPERATIONS-HANDOFF.md: Fast-onboarding orientation doc: who the user is, the skill pyramid's structure, and pointers to the other reference docs for detail.
- docs/SETUP.md: Setup guide for cloning Operations, installing Node/Python deps, configuring Claude Code, and the edit-verify-package-deploy workflow.
- index.html: Generated PWA shell assembling CSS theme variables, hero header, navigation tabs, stat displays, and mobile-responsive Yggdrasil-themed interface structure.
- manifest.json: Manifest for Operations PWA: configures display mode, theme colors, start URL, app metadata, and launcher icon assets.
- package-lock.json: npm lockfile for operations-pwa v88.0.0, recording exact versions of playwright 1.61.1 and transitive dependencies.
- package.json: Project manifest for Operations PWA v88; npm scripts: build, check, regress, verify, package, icons, preview; Playwright devDependency.
- personal/README.md: Describes the personal/ folder structure and import workflow for user data files: save.json, resume, AFT scores, awards, quals, memberships, events, volunteer hours, ROTC record, inbox.
- personal/aft-scores.txt: Manual AFT test results log template; captures deadlift, push-ups, sprint-drag-carry, plank, 2-mile run scores with date and notes.
- personal/awards.txt: Pipe-separated award/certification record (Title|Org|Year|Kind|Note) cataloging completed, pending corrections, and missing entries for bulk app sync.
- personal/events.txt: Events log (pipe-separated) documenting competitions, trips, ceremonies; lists already-imported entries and missing events for wall-additions sync.
- personal/inbox.txt: Drop-zone for logging AFT scores, awards, events, courses, volunteer hours; Claude processes and imports entries into Operations PWA.
- personal/memberships.txt: Data file of pipe-separated memberships with format Org|startYear|endYear|memberType|roles|note; split into verified and pending entries.
- personal/other.txt: Profile and career information for Wyatt Spencer Mendolia: education (WFU, DVHS), languages (English, German), programming (Java, JavaScript), clearance status, Cyber branch intent.
- personal/quals.txt: Template for logging military qualifications earned (BRM, land nav, CWST, CLS) with dates and scores; plaintext data format, no code.
- personal/resume.txt: This isn't a source code file â€” it's a personal rÃ©sumÃ©. Do you need help organizing this file within the PC Organization Project, or extracting data from it for the Operations PWA profile system?
- personal/rotc-record.txt: Personal ROTC career tracker for MS2 cadet at Wake Forest, documenting positions held, evaluations, ranger challenges, and camp experiences.
- personal/save.json: User save file with profile, pathXP skill progression, AFT scores, weight promises, awards, memberships, workouts, baselines, quizzes.
- personal/volunteer.txt: Volunteer service records totaling 69.53 hours from 2022â€“2024 across Athletic Department, American Legion, and NHS, with organization breakdown and pending additions.
- personal/wall-additions.json: JSON import file: corrections and new awards/memberships/honors/events/volunteer entries to merge into the Operations PWA user save file.
- planning/FINISHED-FEATURES.md: Permanent Operations PWA reference: design system (Yggdrasil, 10-path color palette), architecture overview, and completed features history indexed by version.
- planning/IMPROVEMENTS-skills-expansion.md: Planning document listing new skill entries (T1â€“T8 tactical: M17, CBRN, grenades, law, battle drills, SALUTE, rappelling, MDMP); no code exports.
- planning/NEXT-SESSION-PROMPT.md: Session-resume guide for Operations PWA v156; provides current state, required-reading checklist, git-workflow reminders, and lessons-learned from v148â€“v154 development phases.
- planning/SESSION-TIMES.md: Session timing log tracking wall-clock work duration by phase; table records date, start/end, elapsed time, notes; no code exports.
- quizbank.js: Exports QUIZ_BANK: categorized ROTC quiz bank with questions, answers, correct indices, explanations, and pass requirements sourced from Army doctrine and advance sheets.
- scripts/build.js: Assembles CSS, tabs, and JS via TAB_HTML/JS_FILES arrays and read() function into shipped index.html.
- scripts/build.py: Builds index.html by concatenating CSS, tab HTML, and JS modules in order; uses TAB_HTML and JS_FILES constants.
<!-- END CLAUDE PILOT -->
