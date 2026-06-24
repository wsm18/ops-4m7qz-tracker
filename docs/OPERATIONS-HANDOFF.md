# OPERATIONS — Project Handoff & Context

**Purpose:** Full context for anyone (human or AI) continuing the build. This captures the state, architecture, conventions, standing decisions, and history so nothing has to be re-decided. If you are an AI assistant, also read **CLAUDE.md** — it has the hard operating rules.

**Current shipped version: v89.** Single-file HTML/JS Progressive Web App, fully offline, no external runtime dependencies.

---

## 1. WHO / WHAT

- **User:** Wyatt, an Army ROTC cadet (MS2) aiming for a Cyber / 17-series branch.
- **The app — "Operations":** a gamified ROTC + life-tracker PWA for personal use on Windows laptop, Samsung tablet, and iPhone. Installs via "Add to Home Screen." Data lives per-device in `localStorage` with an optional cloud-file (JSON) sync/backup. Military visual theme.
- **Core idea:** a self-development and performance-tracking system where everything measurable becomes a *skill* with levels, decay, and progression — framed around a **Yggdrasil world-tree** (the user loves symbolism woven in; this is the project's through-line).

### What success looks like
A fully functional, offline-capable PWA that meaningfully tracks measurable skill progression across every domain relevant to a cadet's and soldier's development — honestly, with real training science, no faked metrics.

### User's working style & values
- Iterative ("please continue", "do both in steps"). Builds in sessions.
- Cares deeply about: **honesty / no faking**, real evidence-based methods, **offline & private**, **measurability over status** (levels describe what you *can do*, never a vague tier), progressions that make logical sense, names that match reality, and **symbolism** woven throughout.

---

## 2. FILE LAYOUT & THE BUILD/PACKAGE ROUTINE

**Working files (the app):**
- `index.html` (~8,200 lines — **assembled output**, never edit directly)
- `src/` — source files (CSS, tab HTML, core JS, tab JS) — **edit these**
- `quizbank.js` (the 16 ROTC quiz banks, loaded via `<script src>`)
- `sw.js` (service worker; holds the cache version string)
- `manifest.json`, `HOW TO INSTALL.txt`
- `icon-192.png`, `icon-512.png` (regenerated each package via a PIL chevron script)

**Source layout (`src/`):**
```
src/
  _shell.html              outer HTML frame with @@INJECT_*@@ placeholders
  styles/main.css          all CSS (~920 lines)
  core/
    constants.js           DEFAULT, TRACKS, VALUES, SESSIONS
    training.js            WEATHER, WEEK_PLAN, EX_HOWTO, PT_AREAS
    state.js               KEY, load, save, render, simple renderers
    events.js              nav/body events, backup, toast, showLevelUp
    aft-scoring.js         AFT_TABLES, aftLookup, clampScore
    app-setup.js           skills-UI wiring, cloud file system
    skills-data.js         SK_CAT, SEED_SKILLS (~1,800 lines), seedSkillsIfEmpty
    migration.js           SKILL_LADDER_VER, RENAMES, mergeNewSeedSkills
    auto-level.js          syncSkillsFromActivity, integrityLevel, rhrToLevel
    skills-core.js         skSubsOf, skRolledLevel, skEffectiveLevel, skReachLevel…
    tree.js                Yggdrasil SVG renderer, pan/zoom
    init.js                SW register, seedSkillsIfEmpty(), render()
  tabs/
    <tab>.html             HTML <section> block for each tab (16 tabs)
    <tab>.js               Render logic + handlers for each tab
```

**State:** `localStorage` key `KEY="operations_v2"`; state object is `let S=load()`; `DEFAULT` object defines the seed/initial state. `save()` persists; `render()` re-renders the active tab.

**Build/test tooling (dev-only — the app ships as static files):**
- `python scripts/build.py` — assemble `src/` → `index.html`. **Run after every source edit.**
- `npm run check` → `scripts/check_syntax.js` — syntax-check the assembled `<script>` via `new Function` with stubbed globals. Fast, no browser. (Requires Node.js)
- `npm run regress` → `scripts/regress.js` — Playwright headless chromium: serve the repo, load the app, clear localStorage, reload, click all 16 tabs, assert **no `pageerror`**. `--shot` also screenshots the skill tree. (Requires Node.js + `npx playwright install chromium`)
- `npm run verify` — build + check + regress. (Requires Node.js)
- `npm run package` → build + `scripts/package.js` — regenerate icons, zip the app to `dist/operations.zip`, build `dist/operations-preview.html`. (Requires Node.js)
- `scripts/build_preview.py`, `scripts/make_icons.py` — used by package.js / runnable directly with Python.
- `scripts/extract.py` — one-time extraction: reads a monolithic `index.html` and splits it into `src/`. Only needed if merging a legacy single-file version.

**Deliverables produced by packaging:**
- `dist/operations.zip` — the installable app
- `dist/operations-preview.html` — a single self-contained file for instant browser preview

**Release checklist for any shipped change:**
1. Edit the appropriate file in `src/` (and/or `quizbank.js`, `sw.js`).
2. `python scripts/build.py` to rebuild `index.html`.
3. If any skill ladder/tier/guidance changed, **bump `SKILL_LADDER_VER`** in `src/core/migration.js`.
4. **Bump the SW cache** in `sw.js`: `const CACHE="operations-vNN"` → increment.
5. `npm run verify` (build + syntax + 16-tab regression, zero `pageerror`).
6. `npm run package` (rebuild + regenerate icons + build the zip + preview into `dist/`).
7. Remind the user to **hard-refresh / reopen** after installing so the new SW + any migration take effect.

---

## 3. APP STRUCTURE — 16 TABS

Tabs (`#sideNav button[data-tab=X]` ↔ `id=view-X`):
`today, quests, profile, test, dailies, quizzes, aft, log, skills, bosses, board, plan (FM), shop, awards, records, weight`.

Key helpers: `localYMD(d)` (LOCAL date, not UTC — important, a past bug), `todayStr()`, `today()`, `esc()` (null-safe HTML escape), `id()`, `fmtLvl(n)`, `fmtSec(s)`, `ageFromDob(dob)`, `aftAgeBracket(age)`. ~50 render functions.

---

## 4. THE SKILL SYSTEM (the heart of the app) — v88 state

**93 total skills** = leaf skills + group/branch nodes, organized as **PATHS** (symbolic category names). Category *keys* are stable; only display labels/icons are themed.

| key | Path label | icon | role |
|---|---|---|---|
| physical | Path of the Body | 💪 | crown |
| tactical | Path of War | ⚔️ | crown |
| cognitive | Path of the Mind | 🧠 | crown |
| physiological | Path of Vitality | ❤️ | crown |
| technical | Path of the Craft | ⚙️ | crown |
| leadership | Path of Command | ⭐ | crown |
| academic | Path of Knowledge | 📚 | crown |
| personal | Path of the Self | 🌱 | **root** |
| hearth | Path of the Hearth | 🔥 | **root** (added v83) |
| roots | Path of Roots | 🪶 | **root** (added v83) |

Maps: `SK_CAT` (key→label), `SK_CAT_ORDER`, `SK_PATH_ICON`. Seed array `SEED_SKILLS`.

### Hierarchy: Path (category) → branch (group skill) → leaf skill → optional sub-skill (via `parent`).
- A **group** skill has `group:true`, no ladder of its own; its level is the **rolled-up average** of its children.
- Rollup functions are category-independent: `skSubsOf(sk)`, `skTopLevelInCat(cat)`, `skRolledLevel(sk)`, `catRolledLevel(cat)`.

### Each skill object
`{id, name, cat, parent|null, group:bool, fadeDays, auto|null, why, whatYouDo, howTo, prep, recover, safety, roadmap, advance, maintain, tiers, currentLevel, peakLevel, lastQuestTs, levels:[{n,ability}], history:[]}`

- **Ladders are measurable**: every level is a "do X" capability with verifiable benchmarks; **L-top is anchored to the documented human ceiling** (world record / elite-school standard), framed honestly. Ladder lengths are right-sized per skill (not all 10).
- **`tiers`** = per-skill tier bands `[{label, upTo}]`, shown as a name prefix + level-side badge. Top tier's `upTo` must equal the ladder length.
- **Decay & permanence:** `skEffectiveLevel(sk)` decays 1 level per `fadeDays`, but **floors at L1 once started — a skill is never lost** (core tree symbolism). `peakLevel` tracks the all-time high; when current < peak the card shows a "reclaim faster" note.
- **Companion skills for timed metrics:** any time-bounded skill is paired with an absolute-max variant (e.g. "Push-ups in 2 minutes" + "Push-ups in one continuous set").

### Auto-leveling (`syncSkillsFromActivity()`)
Maps real logged performance directly to ladder rungs for `auto` skills. AFT-driven skills map **raw performance** (reps/time/weight) to the rung — NOT through the 0–100 AFT score. ~20 auto skills: `ex:pushups/deadlift/pullups/squat/run/ruck/sdc/plank/carry/lunges`, `quiz`, `test:reaction/procspeed/nback/digitspan/gonogo/mathsprint/patterns/typing`, `vital:rhr`, and **`weight:integrity`** (see below). Helper `rhrToLevel(rhr)` maps resting HR to the ladder.

**Auto skills NEVER show tap-to-level targets.** They level only from measured results.

### Integrity ← the Weight ledger (added v83; the one auto skill that can move DOWN)
- The **Integrity** skill (`auto:"weight:integrity"`, in Path of Roots) levels from `S.weight.promises` via `integrityLevel(maxLevel)`. It is **read-only** — a measure of consistency between word and deed, not self-declared.
- Logic: weighted kept-rate + volume. Kept vows raise it; a held **standing** vow strengthens it; **broken** vows lower it, **tier-weighted** — a broken **keystone** caps it hard (L2), serious/standing breaks hold it back, ordinary breaks cost little. It can move up *or* down (the only auto skill that does), but the L1 floor still protects a started skill from being erased.

### LEVEL-UP UX (v78+)
No separate quest list. **Each ladder rung is the button** on a manual (non-auto) skill: the next reachable rung is highlighted ("TAP IF REACHED →"); tapping calls `skReachLevel(skId, level)` (sets level, updates peak, resets fade, feeds Knowledge track). Higher rungs are tappable (jump/reclaim). A small `#skAttention` banner points to cards. Handler: `data-skreach` / `data-skreachlvl`.

### THE TREE VIEW — YGGDRASIL (Skills tab has a List ↔ Tree toggle) — v82–v85 redesign
`renderSkillTree()` draws an SVG **Yggdrasil world-tree**:
- One great ash: roots in the deep, a single trunk rising into a spreading crown.
- **Each Path is a "world"** — a luminous gradient disc bearing its sigil, name, and rolled-up "World Lv", with its skills hanging off as boughs + leaf-dots.
- **Seven crown worlds** fan out on a wide radial arc from a fork-knot; **three root worlds** (Self, Hearth, Roots) sit at the tips of three deep roots, foliage fanning downward.
- Placement is **deterministic** (`SLOT_BY_CAT` keyed by category, polar geometry) and **spaced so no path's foliage overlaps another's** (verified by an overlap check — min disc gap >> max foliage radius).
- Limbs **plug into each world's disc edge** with real width (swollen base, tapered tip, slight bow) so the trunk visibly connects to every Path. Root worlds connect via the root itself.
- Leaf color runs faded→ember→gold→jade by effective level (`skLeafColor`); leaf size grows with peak; each leaf has a `<title>` tooltip.
- **Pan/zoom** implemented: drag to pan, wheel/pinch/+–⟳ to zoom (`_treeView`, `treeZoom`, `treeReset`, `_treeWireGestures`). Default view frames the whole tree. Toggle state in `_skView`; `setSkView(v)`.

---

## 5. OTHER MAJOR SYSTEMS (all audited & verified)

- **AFT scoring** (`AFT_TABLES`, `aftLookup`, `clampScore`): validated against the **official 1 June 2025 Army AFT scoring scales**. Interpolation sound; scores clamp 0–100. Event keys: mdl/hrp/sdc/plk/run (stored plank score uses key `plank`).
- **Quiz + SRS:** quiz scoring with first-pass rewards; SRS is a faithful SM-2-lite (ease 2.5, floor 1.3, canonical EF formula, interval 1→3→×ease).
- **Vitals + Apple Health import:** manual vitals log (pulse, BP, hemoglobin) + a streaming XML parser for Apple Health `export.xml` (read on-device, never uploaded; unit conversions driven by each record's unit attr; chunk-boundary tail logic). Hemoglobin ties to blood-donation deferral (sex-aware). All ranges are "informational, not medical advice."
- **FM (training plan):** 4 hard sessions/week, never two heavy back-to-back, mobility+balance on easy days, runs rotate. Continuous epoch-based week counter. Equipment toggle (bodyweight/gym); weather picker swaps outdoor→indoor in no-equipment mode.
- **Today / Dashboard:** read-only aggregator of habit quests, skill attention, FM advisory, vitals/donation reminders, AFT pass status. Daily rotating **creed** (tree-of-growth lines) and rest-day messaging.
- **Weight:** a promise-ledger project mirrored read-only into the app (`S.weight.promises` with statuses open/standing/kept/broken, tiers ordinary/serious/standing, an `isKeystoneP` keystone vow). The Integrity skill reads it (see §4). "Update mirror" pulls the latest.
- **Wall/Records tabs:** awards, memberships, events, volunteer hours, counseling log (DA 4856-style), checklists, board prep.

---

## 6. STANDING DECISIONS / CONSTRAINTS (keep these true)

- Levels are **measurable capabilities**, never status labels; L-top = real documented ceiling, framed honestly.
- A skill is **never lost** (floors at L1); peak is tracked; migrations preserve & clamp user progress.
- **No automatic Apple Watch sync** is possible in a static PWA — manual entry or Health-export import only. Say so honestly in-app.
- In-app cognitive tests are **relative trackers, not clinical/IQ instruments**; brain-training transfer is limited — memory *technique* is the real lever. Frame honestly.
- BP/hemoglobin/nutrition/stress content is **educational, not medical advice**.
- Everything stays **on-device / in the user's own cloud file** — nothing is uploaded.
- Auto-measured skills must never be self-reportable (no tap-to-level on `auto` skills).
- Symbolism (the tree) is a feature, not decoration — weave it in where natural.

---

## 7. MIGRATIONS (critical — the user uploads OLD saves)

The user's autosave/backup files are often **many versions behind** (they back up after kinks are worked out). So migration robustness matters more than usual. On load, `seedSkillsIfEmpty()` runs and (for hierarchical saves) calls **`mergeNewSeedSkills()`**, which:

1. **Adds** any new seed skills the save lacks (by name) — including whole new Paths/categories.
2. **Rename-merges** renamed skills via the `RENAMES` map: carries the higher progress (level/peak/history) from the old-named orphan onto the current skill, then removes the orphan. *(This fixed a real bug where an old "Push-ups" skill survived next to the renamed "Push-ups in 2 minutes", and "Pull-ups" next to "Pull-ups (max strict / weighted)".)* Add to this map for any future rename.
3. **Force-resyncs ladders when stale:** a `SKILL_LADDER_VER` constant stamps each save. If a save's `_skillLadderVer` is behind, every skill's `levels`/`tiers`/`advance`/`maintain`/`roadmap` is re-synced from the seed (progress numbers preserved). **Bump `SKILL_LADDER_VER` whenever any ladder/tier/guidance changes.**
4. **Recovers clamped progress:** when a ladder grows back, peak is restored from the skill's own `history` high-water mark, and peak never sits below current.
5. **Reconciles `parent`/branch assignments** so old saves gain new branching without losing progress.

There is also a manual **"resync skill trees"** link (Profile tab settings row, `#resyncBtn`) that forces a full resync regardless of stamp — the guaranteed override if anything ever looks stale.

**Service worker is network-first for app code** (HTML/JS) as of v86, so a new version is always picked up when online (a stale cached `index.html` previously shadowed updates). Icons/manifest stay cache-first.

**Always test migrations against a simulated old save** (strip new skills / new Paths, set a known progress, optionally seed `S.weight.promises`), run the migration, and confirm progress is preserved, orphans merged, ladders correct, and new Paths added.

---

## 8. HOW TO RESUME (for the next session / Claude Code)

1. Open the repo in VS Code. `npm install && npx playwright install chromium` once (requires Node.js).
2. Confirm version: `grep operations-v sw.js` (currently v89).
3. Read **CLAUDE.md** for the operating rules, then edit the appropriate file in `src/`.
4. `python scripts/build.py` to rebuild `index.html`.
5. `npm run verify` (build + syntax + 16-tab regression, zero `pageerror`); screenshot tree changes with `npm run regress -- --shot`.
6. If a ladder changed, bump `SKILL_LADDER_VER` in `src/core/migration.js`; always bump the `sw.js` cache version; `npm run package`.
6. Remind the user to **hard-refresh / reopen** after installing so the new SW + migration take effect.

---

## 9. STATUS & HISTORY

- **v89 is current and clean.** No outstanding bugs.
- **Recent arc:** full audit & bug fixes → sub-path branching → Yggdrasil tree redesign → two new ROOT paths (Hearth 🔥, Roots 🪶) → Integrity skill wired to Weight ledger → migration hardening → **v89: full source split** — `index.html` is now assembled from `src/` (CSS, 16 tab HTML, 12 core JS, 13 tab JS files) via `python scripts/build.py`. The monolithic file is gone; all edits happen in `src/`.
- **Possible next directions** (only if the user asks): richer History/Trends views; more ROTC quiz banks (extends the ROTC-knowledge ladder); per-device tree canopy framing tuning; growing the Hearth/Roots paths.

*Maintain the standing decisions in §6 and the user's emphasis on honesty, measurability, and symbolism. The codebase is well-engineered and defensive; keep it that way.*
