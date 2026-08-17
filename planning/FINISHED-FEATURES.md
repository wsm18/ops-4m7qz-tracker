# Operations PWA — Finished Features & Project Reference

This document is the permanent record. It holds all completed features, visual overhaul phases, and the project's design language and architecture. Use it as a reference when continuing work — you do not need to re-derive what's already been built.

---

## Project Identity

**Operations** is a gamified ROTC + life-tracker Progressive Web App built for one Army ROTC cadet (Wyatt, MS2, Cyber branch goal). It ships as a single `index.html` assembled from `src/` via `python scripts/build.py`. No framework, no dependencies, no CDN, no network calls. All data lives in `localStorage` key `operations_v2`.

### Core values
- **Honesty** — only real, evidence-based metrics. Skill levels describe what you can *do*, never status labels. Top level = documented human ceiling.
- **Measurability** — every skill has a ladder of verifiable benchmarks.
- **Privacy** — fully offline. No telemetry, no uploads, no accounts.
- **Preserved progress** — migrations never lose a level, peak, or history entry.
- **Symbolism** — the Yggdrasil / Norse world-tree theme is a feature, not decoration.

---

## Design Language & Themes

### The Yggdrasil World

The app's organizing metaphor is Yggdrasil, the Norse world-tree. Every skill is a leaf on the tree. Every path is a world within the tree. Progress is expressed as growth: leaves brighten from cold gray to ember gold as levels rise.

**Ten paths (worlds):**

| Key | Path name | World | Icon | Color |
|---|---|---|---|---|
| `tactical` | Path of War | Fólkvangr | ⚔️ | `--blood: #9c4a34` brick red |
| `physical` | Path of the Body | Midgard | 🌿 | `--jade: #6f9e54` OD green |
| `cognitive` | Path of the Mind | Well of Mimir | 🌀 | `--violet: #7c93a8` slate blue |
| `physiological` | Path of Vitality | Asgard | ❤️ | `--jade: #6f9e54` OD green |
| `technical` | Path of the Craft | Nidavellir | ⚙️ | `--ember: #c8772e` signal amber |
| `leadership` | Path of Command | Valhalla | ⭐ | `--gold: #b8a06a` coyote tan |
| `academic` | Path of Knowledge | Jotunheim | 📚 | `--gold: #b8a06a` coyote tan |
| `personal` | Path of the Self | Alfheim | 🌱 | `--jade: #6f9e54` OD green |
| `hearth` | Path of the Hearth | Vanaheim | 🔥 | `--ember: #c8772e` signal amber |
| `roots` | Path of Roots | Niflheim | 🌾 | `--jade: #6f9e54` OD green |

### Color palette (CSS variables — colors current as of v109, tokens added v190)

```
--bg:          #14160f    (dark forest green-black — body background)
--panel:       #1c1f15    (card / panel background)
--panel-2:     #252a1c    (nested card / inner panel)
--line:        #343a26    (border default)
--ink:         #e8ead9    (primary text)
--ink-dim:     #a4ab8e    (secondary text)
--ink-faint:   #6e7459    (muted text)
--gold:        #b8a06a    (coyote tan — earned / peak)
--gold-bright: #d9c48a    (light tan — highlight / header)
--ember:       #c8772e    (signal amber — warning / fading / fire)
--jade:        #6f9e54    (OD green — growth / promote)
--violet:      #7c93a8    (slate blue — cognitive / memory)
--blood:       #9c4a34    (brick red — tactical / danger)
--shadow:      0 8px 30px rgba(0,0,0,.6)
```

**Design-system tokens (added v190)** — for new/touched CSS only; most of the file's pre-existing raw px values are untouched by design:

```
--space-1:2px;  --space-2:4px;  --space-3:6px;  --space-4:8px;
--space-5:10px; --space-6:12px; --space-7:14px; --space-8:16px;
--radius-xs:4px; --radius-sm:8px; --radius-md:10px; --radius-lg:12px; --radius-pill:20px; --radius-full:999px;
--gold-rgb:184,160,106;  --jade-rgb:111,158,84;  --ember-rgb:200,119,46;
--violet-rgb:124,147,168; --blood-rgb:156,74,52;   (use as rgba(var(--gold-rgb),.08) etc.)
```

Shared base classes built on these tokens (also v190, additive alongside the many existing hand-declared classes): `.btn`/`.btn-primary`(gold)/`.btn-positive`(jade)/`.btn-secondary`(outline)/`.btn-block`/`.btn-sm`; `.card`(flat)/`.card-raised`(gradient)/`.card-tint`+`.card-gold`/`.card-jade`/`.card-ember`/`.card-violet`/`.card-blood`. By v191, all 18 tabs' primary card/button classes consume these tokens — `.sk-card`/`.cg-card` (distinct components) and the Weight tab (confirmed-intentional separate serif/tan identity) are the only deliberate exceptions.

### Body background layers (v109)

The body uses a stacked `background` of 7 layers (top to bottom):
1. Crown of Yggdrasil — `radial-gradient` gold ellipse from above (rgba(184,160,106,.14))
2. Deep roots — `radial-gradient` jade tinge from below (rgba(111,158,84,.11))
3. Side vignettes — two `radial-gradient` forest shadows on the flanks
4. **Dark walnut annual rings** — `repeating-linear-gradient` at 90° (rgba(120,65,12,.13))
5. **Medium grain bands** — `repeating-linear-gradient` at 89.4° (rgba(165,92,18,.15))
6. **Fine tight grain** — `repeating-linear-gradient` at 88° (rgba(185,105,22,.16))
7. Base solid color — `var(--bg)` (#14160f)

The wood grain (layers 4–6) creates a dark walnut table texture, warm amber against the forest-green base, visible in the gaps between panel cards.

### Visual character

- Background: dark forest green with wood grain texture and Yggdrasil atmospheric gradients.
- Cards: `.card` surfaces also carry subtle grain (`repeating-linear-gradient` at 88°/89.5°, opacity 0.05–0.06) layered above the panel gradient.
- Typography: slightly loose letter-spacing on labels; small-caps for path names and military titles; `ui-monospace` for scores and data.
- Icons: emoji for path/tab icons (avoids font loading); SVG for all skill emblems (inline, generated in JS).
- Per-tab atmosphere: each of the 18 tabs has scoped `#view-*` CSS giving it a distinct chamber feel (see Phase 3 below).

---

## Architecture Summary

```
src/
  _shell.html              outer HTML frame (head, nav, footer, modals, script tags)
  styles/main.css          all CSS
  core/
    constants.js           DEFAULT, TRACKS, VALUES, PATH_META, SESSIONS
    training.js            WEATHER, WEEK_PLAN, EX_HOWTO, PT_AREAS
    state.js               KEY, load(), save(), render(), esc(), miniSparkline()
    events.js              nav/body event delegation, add-buttons, backup, toast
    aft-scoring.js         AFT_TABLES, aftLookup(), score_* helpers
    app-setup.js           skills-UI wiring, award/event editors, cloud sync
    skills-data.js         SK_CAT, SK_CAT_ORDER, SK_PATH_ICON, SEED_SKILLS
    migration.js           SKILL_LADDER_VER, RENAMES, mergeNewSeedSkills()
    auto-level.js          syncSkillsFromActivity(), integrityLevel(), rhrToLevel()
    skills-core.js         skEffectiveLevel, skRolledLevel, skLeafColor, skDaysLeft, etc.
    tree.js                SK_PATH_ICON, Yggdrasil SVG renderer, pan/zoom
    insights.js             computeInsights() — cross-domain pattern checks (v185)
    init.js                SW register, seedSkillsIfEmpty(), render()
  tabs/
    today.{html,js}        Dawn dashboard
    quests.{html,js}       Oaths (mission list)
    dailies.{html,js}      Orders (daily habits)
    bosses.{html,js}       Objectives (HP bars)
    board.{html,js}        Branch-prep task board
    shop.html              R&R reward shop
    quizzes.{html,js}      ROTC quiz + SRS
    aft.{html,js}          AFT scoring
    profile.{html,js}      Profile + Apple Health import
    test.{html,js}         Cognitive tests, SRS, memory palace
    log.{html,js}          Workout log, PT, baseline testing
    skills.{html,js}       Skills tab (deck card view + sigil system)
    plan.{html,js}         FM training plan
    awards.{html,js}       The Wall (awards, events, volunteer hours)
    records.{html,js}      History, counseling log, checklists
    weight.{html,js}       Promise ledger
    garden.{html,js}       Grove of the World Tree (path XP idols)
    trophies.{html,js}     Carved Rings (peak-level skill record)
    cardgame.js            FM-3 card-game workouts (v188) — no own .html, launched via #cardGameModal in _shell.html from Coach Today
```

**Build workflow:**
```bash
python scripts/build.py   # assemble index.html from src/
npm run check             # syntax-check assembled script
npm run regress           # headless 18-tab test, assert 0 pageerror
npm run package           # build zip + preview
```

**Key data paths:**
- `S = load()` — full state from `localStorage["operations_v2"]`
- `S.lifeSkills[]` — all skill objects with `.id, .cat, .levels[], .currentLevel, .peakLevel, .history[]`
- `S.pathXP{}` — XP per path key (feeds Garden and path level display)
- `skEffectiveLevel(sk)` — returns current working level (floors at 1 if started, accounts for decay)
- `skLeafColor(eff, max)` — returns `rgb(r,g,b)` string (cold gray at 0 → ember gold at max)
- `skDaysLeft(sk)` — days until the current level fades; null if not started or no fadeDays

---

## Completed Features by Version

### Index of versions

- [v96 — AFT Prep + Daily Engagement](#v96-aft-prep-daily-engagement)
- [v97 — Habit Heat Maps + Weight Log](#v97-habit-heat-maps-weight-log)
- [v98 — Discipline Tracking + Boss Sync](#v98-discipline-tracking-boss-sync)
- [v99 — Trophy System + Timeline](#v99-trophy-system-timeline)
- [v100 — Tree Decay + Navigation Polish](#v100-tree-decay-navigation-polish)
- [v101 — Theme Sweep + 9 Features](#v101-theme-sweep-9-features)
- [Phase 1 — Skill Cards + Path Deck UI](#phase-1-skill-cards-path-deck-ui)
- [Phase 2 — Per-Skill Sigil System](#phase-2-per-skill-sigil-system)
- [Carved Rings Tab Overhaul](#carved-rings-tab-overhaul)
- [Phase 3 — Per-Tab Visual Atmosphere](#phase-3-per-tab-visual-atmosphere)
- [v110 — 10 Features from IMPROVEMENTS-v101 + v102](#v110-10-features-from-improvements-v101-v102)
- [v111 — Skill "Practiced" Button](#v111-skill-practiced-button)
- [v112 — 5 Features](#v112-5-features)
- [v113 — 5 Features](#v113-5-features)
- [v115 — 5 Features (Feature 2 was already implemented)](#v115-5-features-feature-2-was-already-implemented)
- [v114 — 6 Features](#v114-6-features)
- [v116 — 6 Features + 4 New Skills + 3 Ladder Improvements](#v116-6-features-4-new-skills-3-ladder-improvements)
- [v117 — 6 Features + 2 New Skills + 2 Ladder Improvements](#v117-6-features-2-new-skills-2-ladder-improvements)
- [v118 — 3 Features + 1 New Skill + 2 Ladder Improvements](#v118-3-features-1-new-skill-2-ladder-improvements)
- [v119 — 7 Features + Career-Stage Target System](#v119-7-features-career-stage-target-system)
- [v120 — 6 Features: Skill assessment, milestones, quest alerts, AFT trend, new skills](#v120-6-features-skill-assessment-milestones-quest-alerts-aft-trend-new-skills)
- [v121 — 6 Features + 2 new skills: Milestone progress bar, skill streak, daily reorder, practiced quick-log, AFT sparklines, new skills](#v121-6-features-2-new-skills-milestone-progress-bar-skill-streak-daily-reorder-practiced-quick-log-aft-sparklines-new-skills)
- [v122 — Full skills expansion: 64 new skills across all 10 paths](#v122-full-skills-expansion-64-new-skills-across-all-10-paths)
- [v123 — 6 UX + intelligence features, 4 new skills, full technical & leadership hierarchies](#v123-6-ux-intelligence-features-4-new-skills-full-technical-leadership-hierarchies)
- [v124 — 6 features + 3 utility skills + skill fixes](#v124-6-features-3-utility-skills-skill-fixes)
- [v125 — Rarity system, sub-deck pages, Joker deck, foil shimmer](#v125-rarity-system-sub-deck-pages-joker-deck-foil-shimmer)
- [v126 — 6 card features + physical pyramid seeds + 3 utility skills + 4 utility improvements](#v126-6-card-features-physical-pyramid-seeds-3-utility-skills-4-utility-improvements)
- [v127 — 25 Strength Uncommons + Synthesis Chain View + Synthesis-Ready Alert + pyramid reset migration](#v127-25-strength-uncommons-synthesis-chain-view-synthesis-ready-alert-pyramid-reset-migration)
- [v128 — 48 Physical Uncommons (Endurance + Composition clusters)](#v128-48-physical-uncommons-endurance-composition-clusters)
- [v129 — 47 Physical Uncommons (Combat + Movement clusters)](#v129-47-physical-uncommons-combat-movement-clusters)
- [v135 — Tactical Specialties Uncommons + Full Leadership Pyramid (168 new seeds)](#v135-tactical-specialties-uncommons-full-leadership-pyramid-168-new-seeds)
- [v134 — Tactical pyramid Intelligence & Reporting Uncommons (24 new seeds)](#v134-tactical-pyramid-intelligence-reporting-uncommons-24-new-seeds)
- [v139 — Academic path pyramid (139 new seeds + 17 existing wired)](#v139-academic-path-pyramid-139-new-seeds-17-existing-wired)
- [v138 — Physiological path pyramid (146 new seeds + 7 existing wired)](#v138-physiological-path-pyramid-146-new-seeds-7-existing-wired)
- [v137 — Cognitive path pyramid (144 new seeds + 11 existing wired)](#v137-cognitive-path-pyramid-144-new-seeds-11-existing-wired)
- [v133 — Tactical pyramid Leader's Tools Uncommons (25 new seeds)](#v133-tactical-pyramid-leaders-tools-uncommons-25-new-seeds)
- [v132 — Tactical pyramid Field Operator Uncommons (23 new seeds)](#v132-tactical-pyramid-field-operator-uncommons-23-new-seeds)
- [v131 — Tactical pyramid (Mythic + 5 Legendaries + 25 Rares + Combat Soldier Uncommons)](#v131-tactical-pyramid-mythic-5-legendaries-25-rares-combat-soldier-uncommons)
- [v130 — synthesizedFrom backfill (all Physical Uncommons)](#v130-synthesizedfrom-backfill-all-physical-uncommons)
- [v145 — Pyramid structural repair: 190 missing Uncommons + a real synthesis bug fixed](#v145-pyramid-structural-repair-190-missing-uncommons-a-real-synthesis-bug-fixed)
- [v146 — Phase 7: Five New Mythics (Mythic + Legendary + Rare structure, 125 new seeds)](#v146-phase-7-five-new-mythics-mythic-legendary-rare-structure-125-new-seeds)
- [v147 — Phase 7 Uncommons (500 new seeds) + live-skill storage refactor (localStorage quota fix)](#v147-phase-7-uncommons-500-new-seeds-live-skill-storage-refactor-localstorage-quota-fix)
- [v148 — Attempted (and reverted): the legacy pyramid trees were already complete](#v148-attempted-and-reverted-the-legacy-pyramid-trees-were-already-complete)
- [v149–v167 — Commons-layer workstream: all 16 Mythic trees' Commons layers built (10,000 new skills)](#v149v167-commons-layer-workstream-all-16-mythic-trees-commons-layers-built-10000-new-skills)
- [v156 — FM plan: real warm-up + cool-down stretches for Sessions 1, 3, and 4](#v156-fm-plan-real-warm-up-cool-down-stretches-for-sessions-1-3-and-4)
- [v168 — GUI audit fixes: Chain view, Side Deck scale, tree mastery insignia, 5 cross-tab bugs](#v168-gui-audit-fixes-chain-view-side-deck-scale-tree-mastery-insignia-5-cross-tab-bugs)
- [v169 — Consolidate Habits + Daily Orders into one unified daily-tasks list](#v169-consolidate-habits-daily-orders-into-one-unified-daily-tasks-list)
- [v170 — Pyramid-tree-first skills browsing (Mythic → Legendary → Rare → Uncommon → Common)](#v170-pyramid-tree-first-skills-browsing-mythic-legendary-rare-uncommon-common)
- [v171 — Remove duplicate Core Skills section from the skills tab](#v171-remove-duplicate-core-skills-section-from-the-skills-tab)
- [v172 — GUI revamp, session 1: skills-tab audit + fixes (Tree view crowding, Focus strip, pyramid explainer)](#v172-gui-revamp-session-1-skills-tab-audit-fixes-tree-view-crowding-focus-strip-pyramid-explainer)
- [v173 — TOC data bridge: persistent save data across origins/reinstalls via TOC (Phase 7 on TOC's side)](#v173-toc-data-bridge-persistent-save-data-across-originsreinstalls-via-toc-phase-7-on-tocs-side)
- [v174 — GUI revamp, session 2: mobile nav restructuring (bottom bar + drawer) + a light visual-polish pass](#v174-gui-revamp-session-2-mobile-nav-restructuring-bottom-bar-drawer-a-light-visual-polish-pass)
- [v175 — Phase X-Timeline: unified cross-tab "Upcoming" view](#v175-phase-x-timeline-unified-cross-tab-upcoming-view)
- [v176 — Declutter: resolve the Upcoming/existing-indicator overlap from v175](#v176-declutter-resolve-the-upcomingexisting-indicator-overlap-from-v175)
- [v177 — Phase X-AAR: After-Action Review journal](#v177-phase-x-aar-after-action-review-journal)
- [v178 — Phase FM-1: gym-access-aware weekly training scheduling + guided mock-AFT walkthrough](#v178-phase-fm-1-gym-access-aware-weekly-training-scheduling-guided-mock-aft-walkthrough)
- [v179 — Phase FM-2: equipment inventory + exercise pools (idea #3) — scope expanded live during the build](#v179-phase-fm-2-equipment-inventory-exercise-pools-idea-3-scope-expanded-live-during-the-build)
- [v180 — True dynamic warm-up / static cool-down stretches (unplanned, mid-workstream correctness fix)](#v180-true-dynamic-warm-up-static-cool-down-stretches-unplanned-mid-workstream-correctness-fix)
- [v181 — Phase FM-Adapt: difficulty-rating-aware adaptive rep/set/weight targets](#v181-phase-fm-adapt-difficulty-rating-aware-adaptive-repsetweight-targets)
- [v182 — Effort rating: 1-3 scale → real 1-10 RPE scale](#v182-effort-rating-1-3-scale-real-1-10-rpe-scale)
- [v183 — Readiness check-in: 1-3 scale → 1-10, matching v182's effort scale](#v183-readiness-check-in-1-3-scale-1-10-matching-v182s-effort-scale)
- [v184 — Standing rule applied: every subjective self-rating scale is 1-10](#v184-standing-rule-applied-every-subjective-self-rating-scale-is-1-10)
- [v185 — Phase X-Insight: cross-domain pattern surfacing](#v185-phase-x-insight-cross-domain-pattern-surfacing)
- [v186 — Phase T, sub-phase 1: Sentry (reaction time, the first stealth-assessment game)](#v186-phase-t-sub-phase-1-sentry-reaction-time-the-first-stealth-assessment-game)
- [v187 — Phase T, sub-phases 2-9: the remaining 8 stealth-assessment constructs — Phase T now DONE](#v187-phase-t-sub-phases-2-9-the-remaining-8-stealth-assessment-constructs-phase-t-now-done)
- [v188 — Focus-picker menu + Phase FM-3: card-game workouts (build greenlit and shipped)](#v188-focus-picker-menu-phase-fm-3-card-game-workouts-build-greenlit-and-shipped)
- [v189 — Phase X-SmartFocus: whole-tree leverage recommender — the FM/test-features doc is now fully complete](#v189-phase-x-smartfocus-whole-tree-leverage-recommender-the-fmtest-features-doc-is-now-fully-complete)
- [v190 — FM subsystem audit, font self-hosting, and GUI-revamp Phase A: design-system foundation + Plan/Log/AFT restructure + nav reorg](#v190-fm-subsystem-audit-font-self-hosting-and-gui-revamp-phase-a-design-system-foundation-planlogaft-restructure-nav-reorg)
- [v191 — GUI-revamp Phase B: remaining-tab token migration, Weight tab identity confirmed, collapsible nav categories](#v191-gui-revamp-phase-b-remaining-tab-token-migration-weight-tab-identity-confirmed-collapsible-nav-categories)
- [v192 — Full project cleanup: dead code, real bugs found along the way, and planning-doc maintenance](#v192-full-project-cleanup-dead-code-real-bugs-found-along-the-way-and-planning-doc-maintenance)
- [v193 — Docs cleanup follow-through: removed superseded planning docs, fixed a real adaptive-trainer visibility bug, wired AFT history into FM-Adapt](#v193-docs-cleanup-follow-through-removed-superseded-planning-docs-fixed-a-real-adaptive-trainer-visibility-bug-wired-aft-history-into-fm-adapt)
- [v194 — Plan-tab restructure: the adaptive coaching engine now IS the workout view, not a separate card to cross-reference](#v194-plan-tab-restructure-the-adaptive-coaching-engine-now-is-the-workout-view-not-a-separate-card-to-cross-reference)
- [v195 — Ground-up FM redesign: the Coach Hub, a fully unified computeTarget(), and AFT-scaled starter numbers](#v195-ground-up-fm-redesign-the-coach-hub-a-fully-unified-computetarget-and-aft-scaled-starter-numbers)
- [v196 — Real fix for the TOC save-data-loss bug (not just a third re-restore)](#v196-real-fix-for-the-toc-save-data-loss-bug-not-just-a-third-re-restore)

---

### v96 — AFT Prep + Daily Engagement
**Files changed:** `src/core/constants.js`, `src/tabs/aft.{html,js}`, `src/tabs/today.js`, `src/tabs/log.{html,js}`, `src/core/events.js`, `src/core/init.js`

1. **AFT test date + per-event improvement math** — `S.aftTestDate` input on AFT tab; `aftPrepCard()` computes event-level improvement targets and days-to-test countdown.
2. **All-time personal records board** — `aftPrCard()` on AFT tab showing best-ever per-event score; `.aft-pr-card` CSS.
3. **Session log note field** — `<textarea id="lgNote">` on Log tab; note saved with each session entry.
4. **Quest / oath due dates** — `qDue` input, `due` field on quest object, `overdue` CSS class, overdues sorted first in the list.
5. **PWA install prompt on Dawn** — `beforeinstallprompt` captured, dismissed state in `DEFAULT`, install/dismiss card rendered in Field Notes.
6. **Push notifications for streak protection** — `Notification.requestPermission()` flow, `scheduleStreakNotif()` in `init.js`, opt-in card on Dawn.

---

### v97 — Habit Heat Maps + Weight Log
**Files changed:** `src/tabs/dailies.{html,js}`, `src/tabs/profile.js`, `src/tabs/log.js`, `src/tabs/quests.html`, `src/core/state.js`, `src/core/constants.js`, `src/core/events.js`, `src/tabs/today.js`, `src/tabs/plan.js`

1. **Habit streak calendar / heat-map** — `habitHeatMap()` in `dailies.js`; last-90-days heat grid, `.habit-heat-row` / `.heat-sq` CSS.
2. **Daily weight tracking on Profile** — weight log input, 30-day sparkline via `miniSparkline()`.
3. **PT session calendar (last 30 days)** — `.pt-cal-dot` grid in Log tab history; each session leaves a dot.
4. **Quest / oath archive** — `questArchive:[]` in DEFAULT, completed oaths pushed to archive, `#qArchive` rendered in Oaths tab.
5. **Session-level RPE** — `<select id="lgRpe">` on Log tab; saved with each session, shown in history.
6. **Dawn overdue oath count** — overdueCount computed and pushed to Field Notes with link to Oaths tab.
7. **Baseline test history sparkline** — `miniSparkline()` for each baseline (pushup/plank/2-mile) in Plan tab adaptive targets section.

---

### v98 — Discipline Tracking + Boss Sync
**Files changed:** `src/core/state.js`, `src/core/constants.js`, `src/tabs/today.js`, `src/tabs/aft.js`, `src/tabs/log.js`, `src/core/events.js`

1. **Quest sorting by urgency** — overdue first, then soonest due date, then no date; in `state.js` render.
2. **Active boss on Dawn tab** — `dawnBossHtml()` card showing highest-HP active objective.
3. **Habit best streak badge** — `hb-best` class shows all-time best run in each habit's header.
4. **Daily completion log (7-day discipline score)** — `streakLog:[]` in DEFAULT; 7-day bar chart `disciplineLogHtml()` on Dawn.
5. **AFT score drop detection** — `aftRegressionCard()` detects per-event regressions across last 2 tests, `.aft-regress` styling.
6. **Workout weekly volume summary** — `.week-summary` in Log history; sets/reps/exercises totaled for the current week.
7. **Printable daily OPORD** — `copyDailyBrief()` formats today's state as clipboard-ready text; triggered by Dawn copy button.

---

### v99 — Trophy System + Timeline
**Files changed:** `src/tabs/trophies.{html,js}`, `src/tabs/skills.js`, `src/tabs/dailies.js`, `src/tabs/plan.js`, `src/core/skills-core.js`, `src/core/events.js`, `src/core/constants.js`, `src/tabs/today.js`

1. **Rune name tooltips on Carved Rings** — `#trophyDetail` panel, click → reveals tier name, ability description, level date.
2. **Trophy unlock toast on skill level-up** — `getTierLabelForLevel` check in `skills-core.js` triggers 🏺 toast when a tier boundary is crossed.
3. **Skill level-history timeline** — collapsible history entries under each skill card; `.sk-hist-item` / `.sk-hist-sep` CSS.
4. **Per-event AFT delta badges** — inline `trend()` function in `aft.js` shows ▲/▼ per event vs. previous test.
5. **Habit streak calendar (monthly toggle)** — `habitMonthGrid()` adds calendar month grid view; toggle button switches heat vs. month.
6. **Baseline PR history cards** — `blPrCard()` in `plan.js`; best-ever for each baseline test shown in Plan tab.
7. **Oath completion time tracking** — `createdDate` set at creation; archive shows days-to-complete and age tag.
8. **Dawn streak-recovery mode** — `streakBrokenDate` in DEFAULT; `.recovery-mode-card` rendered for 3 days after streak break, guiding re-entry.

---

### v100 — Tree Decay + Navigation Polish
**Files changed:** `src/tabs/today.js`, `src/core/state.js`, `src/core/events.js`, `src/core/tree.js`, `src/tabs/skills.js`, `src/core/training.js`, `src/_shell.html`

1. **Path XP progress bar on Dawn** — `pathPipsHtml()` shows XP pips per path in the Dawn header row.
2. **Quest "snooze" (+3 days)** — `q-snooze` button; bumps due date, increments `snoozeCount`.
3. **Weekly training summary card on Dawn** — `weekTrainCardHtml()` + `weekTrainingStats()` shows this-week session count and type breakdown.
4. **Skill decay countdown ring on the Tree** — `pushFadeRing()` in `tree.js`; concentric amber ring around leaves within 20% of their fade window.
5. **Overdue oath count badge on nav button** — `<span class="nav-badge">` in nav, populated in `state.js`; visible in mobile strip and sidebar.
6. **AFT test countdown on Dawn** — days-to-AFT pushed to Field Notes from `S.aftTestDate`.
7. **Habit "grace day" visual indicator** — `graceIcon` (⏰ available, ⚠️ used) displayed in habit card header.
8. **Export / share a single skill card** — `sk-copy-btn` copies skill name + level + tier + ladder to clipboard.

---

### v101 — Theme Sweep + 9 Features
**Files changed:** `src/core/skills-core.js`, `src/tabs/today.js`, `src/core/events.js`, `src/tabs/dailies.js`, `src/tabs/aft.js`, `src/core/constants.js`, `src/tabs/weight.js`, `src/core/tree.js`, `src/tabs/skills.js`, `src/styles/main.css`

1. **Fix skill XP → pathXP.academic** — silent bug where leveling Knowledge skills credited wrong path; fixed in `skPass()` and `skReachLevel()`.
2. ~~Post-log adaptive target toast~~ — **NOT IMPLEMENTED.** The diff-before/after logic and "🎯 N targets climbed" toast was never added to `log.js`. Remaining in `IMPROVEMENTS-v101.md`.
3. **AFT per-event delta note on Dawn** — per-event deltas vs. previous test pushed to Field Notes with 📉 icon and link.
4. **Quest snooze fatigue counter** — `q.snoozeCount` incremented; `.oath-postpone-warn` badge shown when count > 1.
5. **Habit 7-day consistency summary** — `.orders-week-summary` bar above the daily list; this-week done/total count.
6. **Commissioning memento card** — past-commission date shows "Commissioned [date] · N days of commissioned service" on Dawn.
7. **Weight mirror sync-recency indicator** — `S.lastMirrorUpdate` in DEFAULT; `.weight-sync-footer` shows last sync date in Weight tab.
8. **Tree leaf tap → skill card navigation** — `data-skid` on leaf circles; tap opens target path deck in Skills tab and scrolls to card.
9. **Yggdrasil skill card theming** — path-colored left border, world path badge, level fill bar (`--sk-col`, `--sk-fill`) on every skill card.
10. **Full Yggdrasil theme sweep** — vocabulary (Oaths/Orders/Postpone), `.forge-recovery-card`, discipline bar rename, CSS color semantics, radial gradients.

---

### Phase 1 — Skill Cards + Path Deck UI
**Shipped: v102**
**Files changed:** `src/tabs/skills.js`, `src/styles/main.css`, `src/core/tree.js`, `src/tabs/awards.js`

The skills tab was transformed from a flat scrolling list into a **deck-based card interface**. Each of the 10 paths became a collapsible `.sk-deck` container. The most recently active path (highest `pathXP[cat]`) expands by default; all others collapse.

**Deck header (`.sk-deck-header`):**
- Path icon + path name + world level + skill count + fading badge + expand arrow
- 4px left accent border in path color; faint path-color background tint
- Arrow rotates 180° when open (CSS transition)

**Skill card anatomy (`.sk-card`):**
```
┌─────────────────────────────────────┐
│ ⚔️  PATH OF WAR          [Lv 3 / 7] │  ← header band, path color tint
├─────────────────────────────────────┤
│           [emblem SVG]              │  ← center sigil (Phase 2)
│  Land Navigation                    │  ← skill name
│  Tier II — Map Reading              │  ← current tier label
│  ████████░░░░░░░░                   │  ← level fill bar (path color)
│  🍂 14d left          ⧉ copy        │  ← footer
└─────────────────────────────────────┘
  ▸ Ladder & history                     ← collapsible <details>
```

- Corner bracket accents via `::before` / `::after` (started skills only)
- `--sk-col` CSS var drives the fill bar color (via `skLeafColor`)
- `--sk-fill` CSS var drives fill bar width
- Slipped skills show `⚠️ Slipped` in footer
- Sub-skills rendered indented inside `.sk-group` wrappers

**Navigation updated:**
- Tree-leaf tap now opens the target deck before scrolling to it
- Awards tab skill-jump also opens the deck

**CSS classes added:** `.sk-deck`, `.sk-deck-header`, `.sk-deck-body`, `.sk-deck-icon`, `.sk-deck-name`, `.sk-deck-lv`, `.sk-deck-count`, `.sk-deck-fading`, `.sk-deck-arrow`, `.sk-card` (redesigned), `.sk-card-header`, `.sk-card-path-icon`, `.sk-card-path-label`, `.sk-card-path-lv`, `.sk-card-emblem`, `.sk-card-name`, `.sk-card-tier`, `.sk-level-bar`, `.sk-level-fill`, `.sk-card-footer`, `.sk-emblem-placeholder`, `.sk-emblem-svg`

---

### Phase 2 — Per-Skill Sigil System
**Shipped: v102 (skills tab) + v103 (carved rings tab)**
**Files changed:** `src/tabs/skills.js`, `src/tabs/trophies.js`, `src/styles/main.css`

Every skill gets a unique SVG sigil that evolves as the skill's level grows. The sigil is generated entirely in JavaScript as an inline SVG string — no images, no fonts, no external assets.

**The sigil system lives in `src/tabs/skills.js`** as the `skEmblemSvg` IIFE. It is globally available to `trophies.js` which loads after it.

**Tier system:**
| Tier | Threshold | Visual character |
|---|---|---|
| 0 — Nascent | Not started | No sigil (placeholder circle) |
| 1 — Raw | 1–20% of max | Single stroke / outline shape |
| 2 — Forged | 21–40% | Complete base form |
| 3 — Tempered | 41–60% | One inner element added |
| 4 — Refined | 61–80% | Secondary ornamentation |
| 5 — Mastered | 81–100% | Full complexity, all elements |

**Variation seed:** `Math.abs(hash(skill.id)) % 4` → 0–3. Controls which variant of each ornament appears so skills on the same path look related but not identical.

**Per-path motifs:**

| Path | Motif | Progression summary |
|---|---|---|
| `tactical` | Rune-sword | Vertical blade → crossguard → pommel (seed variant) → rune mark on blade |
| `physical` | Ember flame | Teardrop outline → inner flame → side tongue → ember base arc → crown flame |
| `cognitive` | Rune-eye | Almond outline → iris ring → pupil dot → brow arc → lashes + rune marks |
| `physiological` | Valknut | Single triangle → two → three → inner detail → outer circle |
| `technical` | Gear / circuit node | 4-tooth gear → 6 → 8 + bore → inner shape + spokes → circuit traces |
| `leadership` | Crown | Center spire → side spires → more → jewels → base band ornamentation |
| `academic` | Open rune-scroll | Scroll bar + curls → open book → text lines → chapter marks → page curl + bookmark |
| `personal` | Seed to sprout | Oval seed → taproot → sprout + leaf → two leaves → full small tree |
| `hearth` | Hearthstone arch | Ember dot → flame → arch arc → full arch with pillars → keystone rune |
| `roots` | Root network | Horizontal bar → T-branch → 4-branch → secondary branchlets → knotwork node |

**Color:** sigils use `skLeafColor(eff, max)` — the same color as the skill's leaf on the Yggdrasil tree.

**On skill cards:** sigil at 48×48 using current effective level.
**On Carved Rings:** sigil at 62×62 using peak level — permanent record of highest ever reached.

---

### Carved Rings Tab Overhaul
**Shipped: v103**
**Files changed:** `src/tabs/trophies.js`, `src/styles/main.css`

The Carved Rings tab was redesigned from a horizontal row layout into a **sigil card grid**.

- Path sections remain `<details>` accordions (paths with earned rings open by default)
- Inside each path: responsive grid (`repeat(auto-fill, minmax(118px, 1fr))`)
- Each card: 62px sigil (clickable → detail panel) + skill name + tier label + chip row
- Chips shrank to 22×22 to fit neatly under the sigil

---

### Phase 3 — Per-Tab Visual Atmosphere
**Shipped: v104–v109**
**Files changed:** `src/styles/main.css`, `src/tabs/aft.js`

All 18 tabs received `#view-*` scoped CSS giving each a distinct chamber feel. Every card and element within a tab is themed by its tab's identity.

**Tab themes:**

| Tab | Theme concept | Key treatments |
|---|---|---|
| Dawn (`today`) | First light over Asgard | Gold atmospheric gradient strip at top; gold-glow section headers; `.fn-card` with corner rune accents; commissioning bar pulses gold |
| Oaths (`quests`) | Sworn word on parchment | Gold left-border cards; ember left-border for overdue; wax-seal dot on due-dated cards; sepia archive with small-caps |
| Orders (`dailies`) | Military orders board | Dark board background; square checkboxes; jade flash animation on task completion (`@keyframes order-done`); monospace week summary |
| AFT (`aft`) | Combat readiness — measurement-forward | Black card background; large 54px total score display (`.aft-score-big`, added in JS `showAftResult()`); faint date label; ember border; crosshatch sparkline grid |
| Log (`log`) | Warrior's journal | Ruled ledger line at 40px (red vertical rule via gradient); gold date headers; monospace exercise rows |
| Plan (`plan`) | Tactical map — grid paper | Crosshatch grid on view background; amber coach card with gold left-border |
| Awards (`awards`) | Trophy case / shadow box | Navy-shifted card background; gold aw-title; amber member/event card tints |
| Records (`records`) | Stone inscription | Embossed section headers; gold-tinted history/checklist cards |
| Profile (`profile`) | Personnel dossier | `.adder::before` "PERSONNEL FILE" folder tab; amber border; gold form section labels; blood-tinted blood card |
| Weight (`weight`) | Sacred oath on vellum | Amber atmospheric gradient; gold vow text; amber ledger entries with left-border |
| Board (`board`) | The Muster — cyber prep | Dark board background; violet left-border items; jade border on done items |
| Shop (`shop`) | The Mead Hall | Gold section header; ember-tinted reward cards |
| Objectives (`bosses`) | Trials — fortress under siege | Blood-tinted boss cards; ember name color; HP bar gets a striped overlay (`.hpfill::after`) |
| Grove (`garden`) | Grove of the World Tree | Jade section headers |
| Quizzes (`quizzes`) | Well of Mimir | Violet-tinted quiz cards; jade tint for passed |
| Test & Train (`test`) | Cognitive measurement | Steel-blue test cards; violet mem-block cards |
| Skills (`skills`) | Yggdrasil deck | Jade section header; 2px jade top border on `.adder` |
| Carved Rings (`trophies`) | Permanent record | Gold section header with subtle glow |

**New CSS additions in Phase 3:**
- `@keyframes pulse-gold` — commissioning bar heartbeat
- `@keyframes order-done` — jade flash on Orders completion
- `.aft-score-big` — 54px monospace total score
- `.aft-score-pass` / `.aft-score-fail` — color-coded pass/fail label under score
- Profile `.adder::before` folder tab with clip-path shape and "PERSONNEL FILE" label

**AFT JS change (v108):** `showAftResult()` in `src/tabs/aft.js` now extracts the total score into a `<div class="aft-score-big">` above the event rows. The `<h3>` was reduced to a small date label.

**Wood grain (v109):** `body` background gained 3 repeating-linear-gradient layers (fine/medium/coarse) for dark walnut texture. `li.card` also gained a subtle grain overlay. See "Body background layers" section above.

---

---

### v110 — 10 Features from IMPROVEMENTS-v101 + v102
**Files changed:** `src/tabs/today.js`, `src/tabs/aft.js`, `src/core/state.js`, `src/core/events.js`, `src/tabs/plan.{html,js}`, `src/core/skills-core.js`, `src/core/tree.js`, `src/core/migration.js`, `src/core/constants.js`, `src/tabs/awards.{html,js}`, `src/styles/main.css`

1. **Post-log adaptive target toast** — `log.js` already contained the diff-before/after logic and "🎯 N targets climbed" toast; verified present and working (no change needed).
2. **Skill fading digest on Dawn** — Field Notes row listing all skills within 20% of their fade window: "🍂 N skills fading: A · B · C → Skills".
3. **Baseline test due nudge on Dawn** — Field Notes row when no baseline test in 28+ days: "📐 Baseline test last done Nd ago — monthly max-effort test due → Log".
4. **AFT score history sparkline** — mini `miniSparkline()` trend above the AFT history list, with min–max range; inserted with duplicate-guard.
5. **Oath path/category breakdown** — compact path-chip row at top of Oaths tab showing oath count per path (⚔️ 3, 🌿 1, …).
6. **Oath archive search** — `<input class="q-arch-search">` above completed-oaths accordion; keystroke handler in `events.js` filters and re-renders archive details content without resetting the input.
7. **FM plan weekly goal from AFT gap** — `renderPlanRec()` function computes weeks-to-AFT and score gap, shows recommended sessions/week in a `#planRec` card above the FM plan.
8. **Daily order completion time tracking** — `d.doneTs=Date.now()` saved on completion; `disciplineLogHtml()` computes and shows median done hour in the discipline legend.
9. **Skill decay grace period (20%)** — `skEffectiveLevel()` uses `(fadeDays + 20%)` per interval; `skFadeState()` returns `"current"|"at-risk"|"decayed"`; `skLeafColor()` accepts optional `sk` param for amber on at-risk; tree fade-ring shows full amber when at-risk. `SKILL_LADDER_VER` bumped to 85.
10. **Qualification log with auto-skill advancement** — `QUAL_CATALOG` constant (10 military quals); `S.qualifications=[]` in DEFAULT; Awards tab "🎗️ Quals" section; live skill-advancement preview dropdown; `renderQuals()` renders earned qual cards; saving a qual calls `skReachLevel`-equivalent and records from/to levels.
11. **FM beginner prescription** — `BEGINNER_RX` constant (s1–s4, bodyweight/gym); `.rx-card` injected after each session exercise list showing sets × reps, rest, and effort note.

---

### v111 — Skill "Practiced" Button
**Files changed:** `src/core/skills-core.js`, `src/tabs/skills.js`, `src/core/events.js`, `src/styles/main.css`

1. **"practiced" button on skill cards** — Every started, non-auto skill card now shows a jade `practiced` button in the footer. Tapping it calls `skPractice(skId)` which resets `sk.lastQuestTs = Date.now()` and saves, resetting the fade countdown without changing the skill level. For skills that can't be tested in-app (land nav, swimming, marksmanship, etc.) but were genuinely practiced. Auto skills are blocked with an explanatory toast.

---

### v112 — 5 Features
**Files changed:** `src/tabs/skills.html`, `src/tabs/skills.js`, `src/tabs/today.js`, `src/tabs/aft.js`, `src/tabs/bosses.html`, `src/tabs/profile.js`, `src/core/state.js`, `src/core/events.js`, `src/core/constants.js`, `src/styles/main.css`

1. **Skill search / quick-find** — Persistent `<input id="skSearch" class="sk-search-input">` above the deck list in Skills tab. Module-level `_skSearchTerm` string; `_filterSkillDecks()` toggles `hidden` on `.sk-deck` elements and auto-expands matching decks without a full re-render. Term survives re-renders. CSS `.sk-search-input` / `::placeholder` / `:focus` with jade focus ring.

2. **Dawn "skill of the day"** — Deterministic daily focal skill computed in `renderToday()`. Eligible pool: started, non-auto, non-group skills. Sorted by `skDaysLeft()` ascending (soonest-to-fade first), then cycled by `Math.floor(Date.now()/864e5) % count`. Displayed as a Field Notes row: skill name, level, days-until-fade, link to Skills tab.

3. **AFT event drill suggestions** — `DRILL` object in `aft.js` maps each of the 5 AFT events (`hrp`, `sdc`, `run`, `dl`, `plank`) to a gap-keyed function returning a one-sentence training prescription. Gap = `100 - eventScore`. Drill note rendered as `.aft-drill` (11px italic `var(--ink-faint)`) below each event row in `showAftResult()`. `.aft-event` made `flex-wrap:wrap` so the drill note spans full width.

4. **Boss sub-task checkpoints** — Optional `checkpoints:[{name, done}]` array on boss objects. Textarea `id="bChecks"` in add-boss form (`bosses.html`); parsed in `bAdd` handler (`events.js`). `renderBosses()` in `state.js` renders checklist below HP bar; `data-bcheck` / `data-bchkidx` handler in `events.js` marks done + decrements HP + grants XP. Migration: `(b.checkpoints||[])` everywhere; `load()` backfills `checkpoints:[]` on all pre-v112 boss objects. CSS `.boss-checks`, `.boss-check-item`, `.boss-check-btn`.

5. **Profile body weight trend line** — Linear regression over last 30 weight entries (requires ≥5 points) in `renderProfile()`. Slope in lbs/entry × 30 = monthly delta. Displayed as `.wt-trend` below the sparkline: `📈/📉/➡️ ±N lbs/month at current rate`.

---

### v113 — 5 Features
**Files changed:** `src/tabs/quests.html`, `src/core/state.js`, `src/core/events.js`, `src/core/constants.js`, `src/tabs/profile.js`, `src/tabs/skills.js`, `src/styles/main.css`

1. **Oath notes / why field** — Optional `q.notes` string on quest objects. Textarea `id="qNotes"` in the add-oath form (`quests.html`); read and stored in the `qAdd` handler (`events.js`). Shown as a small italic `.q-notes` div under the oath name in both the active list and the archive. CSS `.q-notes`.

2. **Boss: add checkpoints to existing boss cards** — Inline add-checkpoint form on every active boss card: `<input class="boss-check-input" data-baddcheck>` + `<button class="boss-check-add-btn" data-baddcheckbtn>`. Click handler in `events.js` reads the input, pushes `{name, done:false}` to `b.checkpoints`, clears the input, saves, and re-renders. CSS `.boss-add-check`, `.boss-check-input`, `.boss-check-add-btn`.

3. **Weight goal + time-to-goal projection** — `S.profile.weightGoal` (number or null) added to `DEFAULT` and `load()` profile baseline. After the trend line in `renderProfile()`, shows a goal-setter input when unset, or a `.wt-goal` line with gap-to-goal and projected weeks-to-goal using the existing regression slope. Buttons wire to set/clear `S.profile.weightGoal`. CSS `.wt-goal`, `.wt-goal-setter`.

4. **Skill "last practiced" date in card footer** — In `leafCard()` in `skills.js`, computes `pracDays` from `sk.lastQuestTs` (set by both `skPractice()` and `skReachLevel()`). Renders "practiced today" or "practiced Nd ago" as a dim `.sk-prac-foot` span in the footer-left, after `fadeFoot`. CSS `.sk-prac-foot`.

5. **Daily orders stale warning** — In `renderDailies()` in `state.js`, computes stale status: a daily is stale if `doneTs` is unset and `streakLog` has ≥7 active days, or if `doneTs` is more than 7 days ago. Shows amber `⚠ stale` tag (`.order-stale`) in the order card meta row. CSS `.order-stale`.

---

### v115 — 5 Features (Feature 2 was already implemented)
**Files changed:** `src/core/constants.js`, `src/core/state.js`, `src/tabs/awards.html`, `src/tabs/awards.js`, `src/tabs/profile.html`, `src/tabs/profile.js`, `src/styles/main.css`, `sw.js`

1. **Wall bulk-entry wizard** — "Bulk add…" toggle (`.wall-bulk-toggle`, `data-bulktoggle`) on every Wall sub-section (Awards, Academic Honors, Memberships, Events, Volunteer). Opens `.wall-bulk-panel-wrap` with a monospace textarea, Preview button, and Commit button. Parser: `lines.map(l=>l.split("|").map(s=>s.trim()))`, one parser per section shape. Commit pushes parsed entries to the matching `S.*` array and re-renders. `_bulkSetup()` helper wires all 5 panels. CSS `.wall-bulk-toggle`, `.wall-bulk-panel`, `.wall-bulk-preview`, `.wall-bulk-preview-btn`, `.wall-bulk-commit`.

2. **Save file import** — already implemented via `importBtn` / `importFile` in `events.js` (not re-added).

3. **Academic Honors section on The Wall** — New `S.academicHonors: []` array in `DEFAULT` and `load()`. New "📚 Academic" sub-nav tab → `wsec-academic`. `renderAcademicHonors()` in `awards.js` renders cards reusing `.aw-card` anatomy. Add form: title, year, org, note. Bulk-entry wizard (Feature 1) also covers this section. `state.js` calls `renderAcademicHonors()` in `render()`. Migration: `merged.academicHonors = r.academicHonors || []`.

4. **ROTC Record section** — New `S.rotcRecord: {positions:[], competitions:[], campResults:[]}` in `DEFAULT` and `load()`. New "⭐ ROTC" sub-nav tab → `wsec-rotc`. Three collapsible `<details class="rotc-sub">` blocks: Positions held (`{id, title, startSem, endSem, note}`), Competitions & exercises (`{id, name, year, placement, note}`), Camp & evaluations (`{id, camp, year, rating, note}`). `renderRotcRecord()` in `awards.js` renders `.rotc-item` cards with jade left-border. Delete handlers via `data-drotcpos`, `data-drotccomp`, `data-drotccamp`. CSS `.rotc-sub`, `.rotc-sub-hd`, `.rotc-item`, `.rotc-title`, `.rotc-meta`.

5. **Language proficiency + clearance on Profile** — `S.profile.languages: []` (each `{lang, ilr, notes}`) and `S.profile.clearance: {level, grantedDate, notes}` added to `DEFAULT` and migrated in `load()`. Profile tab gains two sub-blocks: Language proficiency (list + add form with ILR level select 0+–5, `data-langdel` delete) and Clearance (select: None/Pending/Secret/TS/TS-SCI + date + notes). `renderLanguages()` in `profile.js` re-renders both. CSS `.lang-item`, `.ilr-badge`.

6. **Wall → résumé copy** — "📋 Copy résumé" button (`.wall-resume-btn`) in The Wall `sec-h`. `copyWallResume()` in `awards.js` builds multi-section plain-text string: Academic Honors, Awards, ROTC Record, Memberships, Events, Volunteer, Qualifications, Languages & Clearance; copies to clipboard via `navigator.clipboard.writeText()`.

---

### v114 — 6 Features
**Files changed:** `src/tabs/bosses.html`, `src/core/events.js`, `src/core/state.js`, `src/core/constants.js`, `src/core/skills-core.js`, `src/tabs/aft.js`, `src/tabs/skills.js`, `src/tabs/awards.js`, `src/styles/main.css`

1. **Boss: checkpoint-driven HP** — Boss HP is now always `checkpoints.length + 1`. Removed `<input id="bHp">` from `bosses.html`. `bAdd` derives `maxhp` from checkpoints and sets `cpDriven:true`. Inline checkpoint add increments `hp++` and `maxhp++` on `cpDriven` bosses. `renderBosses()` shows "🏆 Conquer the Trial" only when `hp===1`; otherwise "Complete a milestone to make progress" (no free hit). Legacy non-`cpDriven` bosses keep "⚔️ Strike it". Migration in `load()` backfills `cpDriven:true` on existing checkpoint-bearing bosses with consistent HP. CSS `.boss-no-strike`, `.hit.conquer`.

2. **Boss target date + daily pace** — Optional `b.targetDate` (YYYY-MM-DD) on boss objects. Date input in the add-boss form. After `.hp-meta`, `renderBosses()` computes `hp/daysLeft` steps/day needed and days remaining; shows `.boss-pace` row in jade (on pace ≤1 step/day) or ember (off-pace / overdue). CSS `.boss-pace`, `.boss-pace.on-pace`, `.boss-pace.overdue`.

3. **Oath progress updates (running log)** — `q.updates: [{ts, text}]` on quest objects. Each active oath shows a left-bordered log of time-stamped dispatches + an input/button to add new ones. Updates shown in archive too. Handler `data-qupdateadd` in `events.js` pushes to `q.updates`, saves, re-renders. CSS `.q-updates`, `.q-update-item`, `.q-update-ts`, `.q-update-form`, `.q-update-input`, `.q-update-add`.

4. **Daily orders: pause / resume** — `d.paused: bool` on daily objects. Paused orders show dimmed (`li.card.paused { opacity:.45 }`) with `⏸ paused` badge and Resume button; excluded from perfect-day math (`filter(x=>!x.paused)`) and stale checks. `data-dpause` / `data-dpausestate` handler in `events.js`. CSS `li.card.paused`, `.order-paused`, `.order-pause-btn`.

5. **AFT per-event target scores** — `S.aftEventTargets: {hrp, sdc, run, dl, plank}` in `DEFAULT` and `load()`. Collapsible `<details class="aft-target-set">` below the test date input in `renderAft()`; `document.addEventListener("input")` in `aft.js` saves on change. In `showAftResult()`, each event row shows `✓ target` (jade) or `↑ N to target` (ember) via `.aft-tgt-gap`. CSS `.aft-tgt-gap`, `.aft-target-set`, `.aft-target-grid`, `.aft-tgt-label`, `.aft-tgt-inp`.

6. **Skill target level marker on fill bar** — `sk.targetLevel` (int or null) per skill. Gold tick mark (`.sk-tgt-tick`) on the fill bar at `targetLevel/maxLv * 100%`. Footer shows "N to L[target] target" or "L[target] target reached" via `.sk-tgt-foot`. Set via a number input in the `sk-work-panel` (added to `skWorkGuidance()` in `skills-core.js`); saved on `change` event via `data-sktgtlv` handler in `awards.js`. `.sk-level-bar` gained `position:relative`. CSS `.sk-tgt-tick`, `.sk-tgt-foot`, `.sk-tgt-foot.reached`, `.sk-tgt-set`, `.sk-tgt-set-label`, `.sk-tgt-inp-work`.

---

### v116 — 6 Features + 4 New Skills + 3 Ladder Improvements
**Files changed:** `src/core/constants.js`, `src/core/state.js`, `src/core/skills-data.js`, `src/core/migration.js`, `src/tabs/profile.html`, `src/tabs/profile.js`, `src/tabs/awards.html`, `src/tabs/awards.js`, `src/tabs/records.html`, `src/tabs/records.js`, `src/tabs/today.js`, `src/styles/main.css`, `sw.js`

1. **GPA semester history log (Profile)** — `S.gpaHistory: []` added to `DEFAULT` and `load()` migration. Each entry: `{id, term, gpa, hours, standing, note}`. Profile tab gained a "GPA Semester Log" block with sparkline (`renderGpaHistory()`) and mini add-form (term, GPA, credit hours, standing, note). Committing auto-updates `S.profile.gpa` to the most-recent entry. `data-gpadel` deletes a row and re-syncs cumulative GPA. Label changed from "GPA (current)" to "GPA (cumulative)". CSS `.gpa-history-row`, `.gpa-term`, `.gpa-standing`.

2. **Membership edit** — Already fully implemented in `app-setup.js` (`mbEdit()`, `_mbEditId`, `_mbSave` handler, role management) — confirmed present, not re-added.

3. **Qualifications catalog expansion + custom quals** — `QUAL_CATALOG` in `constants.js` expanded with 5 entries: `airborne`, `air_assault`, `wlc`, `blc`, `ruck`. Added `<option value="custom">✏️ Custom / civilian cert</option>` to `qualKey` select and hidden `#qualCustomName` input. Custom quals push `{id, key:"custom", label, date, skills:[]}` without skill advancement. `renderQuals()` and `copyWallResume()` handle `q.key==="custom"` branch.

4. **Counseling bulk import** — "Bulk add counselings…" toggle (`.wall-bulk-toggle`, `data-bulktoggle="cnBulk"`) added above the counseling log in `records.html`. Inline block in `records.js` wires preview/commit: parser splits on `|` → `{id, date, type, people:"", summary, plan, followUp}` pushed to `S.counseling[]`. Reuses `.wall-bulk-panel` / `.wall-bulk-preview` / `.wall-bulk-commit` CSS from v115.

5. **Dawn academic snapshot (Today tab)** — Inline `academicHtml` block in `renderToday()` computes from `S.gpaHistory` and `S.profile.gpa`. Renders a `.td-card fn-card` with cumulative GPA + latest semester GPA; shows `.dl-badge` if `standing` contains "dean". Placed between field notes and FM Advisory in the flow array. CSS `.acad-strip`, `.acad-stat`, `.acad-stat b`, `.dl-badge`.

6. **Membership active/past filter** — Module-level `_mbFilter="all"` in `awards.js`. Filter bar (`<div class="mb-filter-bar">`) above `#mbList` with All/Active/Past buttons. `data-mbfilter` click handler updates `_mbFilter`, toggles `.on` class, calls `renderMemberships()`. Active = `!m.endYear || m.endYear >= currentYear`. CSS `.mb-filter-bar`, `.mb-filter`, `.mb-filter.on`.

**New skills (S2–S5; S1 Sleep discipline was already present):**
- **Radio communications** (`tactical / Soldier tasks`, fadeDays:90) — 8-level ladder from phonetic alphabet to company-level comms plan. Tiers: User/Operator/Net-Control/Comms-Planner.
- **OPSEC / digital security** (`personal / Life admin`, fadeDays:60) — 7-level ladder from unique passwords to sustained OPSEC discipline. Tiers: Unaware/Practicing/Disciplined. Includes `safety:` field.
- **Negotiation & influence** (`leadership`, fadeDays:90) — 8-level ladder from positions-vs-interests to third-party mediation. Tiers: Positional/Interest-Based/Skilled/Mediator.
- **Reading speed** (`cognitive / Speed`, fadeDays:45) — 10-level ladder from 150 WPM to 1500+ WPM. Tiers: Average/Fast/Efficient/Speed-Reader. Self-reported for now.

**Ladder improvements (SKILL_LADDER_VER 86→87):**
- **L1 Networking**: `advance[2]` now mentions "CompTIA Network+ maps well to L1–L3"; `advance[7]` updated to "CCNA/CCNP-level standard — CCNP roughly marks this tier; CCIE is the documented expert ceiling."
- **L2 Cybersecurity fundamentals**: Expanded from 8 to 9 levels. L7 = Security+ + 3 unguided CTFs across categories; L8 = eJPT/PNPT intermediate cert; L9 = OSCP/full-scope (formerly L8). `tiers` Expert bumped to `upTo:9`.
- **L3 Programming (Python/Java/JavaScript)**: All three L8 `advance` entries now specify concrete examples: "a deployed tool used by at least one real user outside yourself, a merged open-source PR in an active project, or a maintained internal tool with documented usage."

---

### v117 — 6 Features + 2 New Skills + 2 Ladder Improvements
**Files changed:** `src/core/state.js`, `src/core/events.js`, `src/core/skills-core.js`, `src/core/migration.js`, `src/core/skills-data.js`, `src/tabs/today.js`, `src/tabs/skills.html`, `src/tabs/skills.js`, `src/tabs/test.html`, `src/tabs/test.js`, `src/tabs/awards.js`, `src/styles/main.css`, `sw.js`

1. **Reading speed test (Test tab auto-integration)** — Four ~280-word timed passages from varied domains (FM 6-0, Army Writing, Leadership, Sleep & Recovery). Start timer → read → Done → comprehension self-check (yes/partial/no adjusts WPM × 1.0/0.7/0.4). Stores to `S.tests[]` with type `"reading"`. Updates Reading speed skill level if result improves on current. Reading speed `auto:"test:reading"` and `howTo` updated; `load()` migration backfills `auto` on old saves. `renderReadingTest()` wired into render chain from `state.js`. CSS `.rd-card`, `.rd-passage-wrap`, `.rd-timer`, `.rd-result-row`, `.rd-btn`, `.rd-history`, etc.

2. **OML snapshot panel (Today tab)** — Small read-only panel below the academic strip. Three rows: cumulative GPA (from `S.profile.gpa`), best AFT total (from `S.aft[]`), latest MS eval (from `S.rotcRecord.campResults[0]`). Shows only when any of these is present. "Profile →" button links to Profile tab. CSS `.oml-panel`, `.oml-row`, `.oml-label`, `.oml-val`, `.oml-sub`, `.oml-note`.

3. **Boss archive (conquered bosses)** — `completedAt: null` added to boss objects. When a boss reaches HP 0 (checkpoint handler or direct hit), `b.completedAt = localYMD()` is set instead of deleting. `renderBosses()` splits active (`!b.completedAt`) vs archived (`b.completedAt`). Archived renders in collapsible `<details class="boss-archive">` with conquest date and total HP. Migration in `load()` backfills `completedAt: null` on all existing boss objects. CSS `.boss-archive`, `.boss-archive-item`, `.boss-archive-icon`, `.boss-archive-name`, `.boss-conquered-date`.

4. **Skill decay heat-map (Skills tab)** — Toggle button (📅) next to search bar shows/hides a 13×7 = 91-day practice calendar. Each cell colored by count of skill history events that day: 0 = faint, 1–2 = light jade, 3–5 = mid jade, 6+ = full jade. Computed live from `sk.history[].ts` across all non-group skills. CSS `.sk-toolbar-row`, `.sk-hm-toggle`, `.sk-heatmap-wrap`, `.hm-grid`, `.hm-day`, `.hm-day.lv0–lv3`, `.hm-header`, `.hm-label`, `.hm-month-row`, `.hm-legend`.

5. **Counseling follow-up alert (Today tab)** — `renderToday()` scans `S.counseling[]` for entries with `followUp` dates within 7 days or past due. Renders a `.cn-alert` card listing each (date, relative label, summary excerpt). "Records →" button links to Records tab. CSS `.cn-alert`, `.cn-alert-row`, `.cn-alert-date`.

6. **Skill notes / log entries** — `skReachLevel(skId, level, note)` now accepts an optional `note` and stores it on the `history[]` entry. `skWorkGuidance()` renders a textarea (data-sknote) before the level-confirm button, pre-populated with the next advance guidance as placeholder. `data-skreach` handler in `awards.js` reads the note from the textarea and passes it through. `leafCard()` shows the last 3 noted history entries below the level bar in `.sk-log-recent`. CSS `.sk-note-wrap`, `.sk-note-input`, `.sk-log-recent`, `.sk-log-entry`, `.sk-log-entry-ts`.

**New skills (SKILL_LADDER_VER 87→88):**
- **Memory retention** (`cognitive / Memory`, fadeDays:30, auto:`quiz:retention`) — 10-level ladder from "complete a 10-card SRS session" to "sustain >90% retention across 500+ cards for 6+ months." Tiers: Learner/Practitioner/System-Builder/Master. Ties to the existing SRS system in the Test tab.
- **Reading speed** auto-upgraded — Previously self-reported, now set `auto:"test:reading"` and measured in-app via the new timed passage test.

**Ladder improvements:**
- **L5 Radio communications** — `howTo` now references FM 6-02 (Signal Support to Operations) as the authoritative doctrine source for PACE planning and net management.
- **Reading speed** — `howTo` rewritten to reference the in-app test and explain the comprehension adjustment. `auto:"test:reading"` field added.

---

### v118 — 3 Features + 1 New Skill + 2 Ladder Improvements
**Files changed:** `src/tabs/quests.html`, `src/core/events.js`, `src/core/state.js`, `src/tabs/skills.html`, `src/tabs/skills.js`, `src/tabs/records.html`, `src/tabs/records.js`, `src/core/skills-data.js`, `src/core/migration.js`, `src/styles/main.css`, `sw.js`

1. **Quest partial credit / step tracking (Oaths tab)** — Optional "Steps" field on quest creation form (`#qSteps`, number 2–20). If set, quest card shows a jade fill-bar (`q.progress / q.steps`), step count (`X/N`), and a "+1 step" button (`data-qprogress`). Tapping +1 increments `q.progress`; when progress reaches steps, the quest auto-completes and awards XP identically to a manual check. Progress is stored on the quest object (`q.steps`, `q.progress`). CSS `.q-steps-row`, `.q-steps-bar`, `.q-steps-fill`, `.q-steps-count`, `.q-step-btn`.

2. **Skill mastery summary bar (Skills tab)** — A compact stat row (`#skSummaryBar`, `.sk-summary-bar`) appears above the search bar. Computed on every `renderSkillsTab()` from all non-group leaf skills with levels: "N active", "⭐ N maxed", "🔶 N at risk", "🍂 N decayed". Each stat chip color-coded (gold/ember/blood) to match the state. Only shows when at least one skill is started. CSS `.sk-summary-bar`, `.sk-summary-stat`, `.sk-summary-stat.maxed`, `.sk-summary-stat.atrisk`, `.sk-summary-stat.decayed`.

3. **Counseling search & filter (Records tab)** — Filter bar above `#counselArea` with All / Event / Monthly / Developmental / Received / Given type buttons (`.mb-filter-bar`, reusing v116 CSS). Text search input (`#cnSearch`) filters by `c.summary` or `c.people` contains match. Module-level `_cnFilter` and `_cnSearch` in `records.js`; wired in `renderCounsel()`. CSS `.cn-filter-wrap`, `.cn-search-input`.

**New skill (SKILL_LADDER_VER 88→89):**
- **First aid / TCCC** (`tactical / Soldier tasks`, fadeDays:180) — 9-level ladder from "know the TCCC phases and MARCH protocol" through CPR/AED cert, tourniquet self-application, wound packing, airway management, tension pneumothorax recognition, full MARCH simulation, formal TCCC course completion, to serving as an instructor. Tiers: Aware/Responder/TCCC/Instructor.

**Ladder improvements:**
- **Negotiation & influence** — `howTo` now references FM 6-22 (Leader Development) for the upper levels where influence and command climate tie to leadership doctrine.
- **Memory retention** — `howTo` updated to clarify that level advancement is self-reported (no automatic wiring yet); honest metric is the SRS retention rate described in each level's criteria.

---

### v119 — 7 Features + Career-Stage Target System
**Files changed:** `src/core/constants.js`, `src/core/state.js`, `src/core/events.js`, `src/core/migration.js`, `src/core/skills-data.js`, `src/tabs/skills.html`, `src/tabs/skills.js`, `src/tabs/today.js`, `src/tabs/awards.html`, `src/tabs/awards.js`, `src/tabs/dailies.html`, `src/tabs/dailies.js`, `src/tabs/profile.html`, `src/tabs/profile.js`, `src/styles/main.css`, `sw.js`

1. **Career-stage skill targets (F1)** — Every major tactical, physical, technical, and leadership skill in `SEED_SKILLS` now has a `targets:{MS1,MS2,MS3,LDAC,MS4,commission,O1}` object with recommended level milestones per ROTC career stage. `careerStage()` in `migration.js` parses `S.rank` to detect current stage. `mergeNewSeedSkills()` auto-populates `sk.targetLevel` from the seed target on first install (only when `null` — manual overrides preserved). In `leafCard()` (skills.js), a dim secondary tick (`.sk-tgt-tick-next`, 25% opacity dashed gold) marks the next stage's target on the skill fill-bar alongside the existing bright tick. Skills with targets: Land navigation, Marksmanship (M4), Tactical movement, Troop leading procedures, Radio communications, First aid / TCCC, Fieldcraft & survival, Push-ups in 2 minutes, Run (2-mile), Public speaking, Decision-making under pressure, Counseling & mentorship, Networking, Programming (Python), Cybersecurity fundamentals, ROTC knowledge (quizzes). `SKILL_LADDER_VER` bumped **89→90**.

2. **Habit streak calendar (F2)** — 60-day perfect-day calendar on the Dailies tab. Toggle button (`#dailyCalToggle`) next to the Daily Orders section header shows/hides a `.daily-cal-grid` of 60 day-cells (10-column layout, jade for completed, dark for missed). Data source: `S.dailyHistory[]` (YYYY-MM-DD strings) populated by `onPerfectDay()` in `state.js`, trimmed to 365 entries. `renderDailyCal()` and `setupDailyCalToggle()` in `dailies.js`; `setupDailyCalToggle()` called from `renderDailies()`. CSS `.daily-cal-grid`, `.daily-cal-label`.

3. **Skill export / print view (F3)** — 📋 button in the Skills tab toolbar (`data-copyskillssummary`) calls `copySkillsSummary()` in `skills.js`. Outputs a multi-section plain-text block to clipboard, grouped by path, listing all started skills with level and tier: `[Path of War]\n  Land navigation — Level 4 (Navigator)`. Handler wired in `events.js`.

4. **Qualification expiry alerts (F4)** — `expires` date field added to the qualification form in awards.html and saved by awards.js. In `renderToday()`, scans `S.qualifications[]` for entries expiring within 60 days or already past. Shows a `.qual-alert` card in Field Notes with ember `⚠️ expired` rows and jade `🔔 expires in Nd` rows, plus a "Wall →" nav button. CSS `.qual-alert`, `.qual-alert-row`, `.qual-alert-row.overdue`.

5. **Boss sprint mode (F5)** — Daily HP commitment system on boss cards. If no sprint set for today, a setter row shows `b.hp` input + Set button (`data-bsprintset`). After setting, `b.todayCommit={date,hp,startHp}` is stored; the card shows a jade progress bar (actual HP hit today vs. committed). Done = jade `✓ Sprint complete`. If yesterday's sprint was missed, an ember `⚠ missed` warning shows. CSS `.boss-sprint`, `.boss-sprint.done`, `.boss-sprint.missed`, `.boss-sprint-bar`, `.boss-sprint-fill`, `.boss-sprint-setter`, `.boss-sprint-btn`, `.boss-sprint-input`.

6. **Weekly training load summary (F6)** — Field Notes on Today tab shows a `🏋️ This week:` row counting all workout sessions logged since Monday, total run distance (mi), and total reps. Computed from `S.workouts[]` filtered to the current ISO week using `w.ts` timestamp. Includes a "Log →" nav button.

7. **GPA goal + projected graduation GPA (F7)** — `S.profile.gpaGoal` (float) added to DEFAULT. `pfGpaGoal` number input below the GPA semester log in profile.html. `renderGpaProjection()` in `profile.js` fits a linear regression through `S.gpaHistory[]` by semester index and extrapolates to semester 8. Shows "Projected graduation GPA: X.XX" in jade if at or above goal, ember if below. Saved by profile save handler. CSS `.gpa-projection`.

---

### v120 — 6 Features: Skill assessment, milestones, quest alerts, AFT trend, new skills
**Files changed:** `src/core/constants.js`, `src/core/state.js`, `src/core/events.js`, `src/core/migration.js`, `src/core/skills-data.js`, `src/tabs/skills.html`, `src/tabs/skills.js`, `src/tabs/today.js`, `src/tabs/profile.html`, `src/tabs/profile.js`, `src/styles/main.css`, `sw.js`

1. **Skill target sync button (F1)** — `↑ sync` button in the Skills tab toolbar (`data-updateskilltgts`, `id="skSyncTargets"`). Calls `updateAllSkillTargets()` in `skills.js`: iterates all skills, finds `seed.targets[careerStage()]`, updates `sk.targetLevel` if null or behind (never downgrades manual overrides). Shows toast "↑ N skill targets updated to MS2". Handler wired via `events.js` `data-updateskilltgts`.

2. **Skill assessment panel (F3)** — `📊` toggle button in Skills tab toolbar (`id="skAssessToggle"`). When active, shows a flat gap table (`#skAssessWrap`, `.sk-assessment-table`) sorted by gap descending: path icon, skill name, current level, target level, gap (behind in ember, ahead in jade, met = ✓). Module-level `_skAssessVisible` flag. `renderSkillAssessment()` in `skills.js`. CSS `.sk-assessment-table`, `.sk-assess-head`, `.sk-assess-row`, `.sk-assess-gap.*`, `.sk-assess-empty`.

3. **User milestones (F2)** — `S.milestones[]` array added to `DEFAULT` (constants.js) and explicitly merged in `load()` (state.js). Profile tab has a milestone form: `#pfMsLabel` (label input), `#pfMsDate` (date input), `#pfMsAdd` (add button), `#pfMilestones` (rendered list). `renderMilestones()` in `profile.js` lists upcoming/past milestones with delete buttons. Milestone delete uses local `addEventListener("click", data-msdel)` in `profile.js`. Dawn tab (`renderToday()`) shows up to 3 upcoming milestones in a `.milestone-dawn` pill row below the commission countdown. CSS `.milestone-row`, `.milestone-date`, `.milestone-label`, `.milestone-when`, `.milestone-del`, `.milestone-dawn`, `.ms-pill`.

4. **Quest due-soon alert (F4)** — Field Notes row in `renderToday()` scans `S.quests[]` for open quests with `q.due` within 0–7 days. Shows "🚩 N oaths due within 7 days: [name] · [name]" with a Quests nav button.

5. **AFT linear trend projection (F5)** — When `S.aft.length >= 3`, `renderToday()` fits a linear regression through total scores (sorted by date), computes slope (pts/test), and projects next score. Field Notes shows "📈 AFT trend: ▲ +N.N pts/test → projected NNN pts next test" in jade/ember based on slope direction.

6. **New skills: Strength programming + Military writing (F6)** — Two new skills added to `SEED_SKILLS` (skills-data.js). **Strength programming** (cat:`physical`, parent:`Fitness programming` — new group also added, 8-level ladder from template-following to real-time coaching, fadeDays:60). **Military writing** (cat:`leadership`, 8-level ladder from BLUF paragraph to doctrine-quality OPORDs under time pressure, fadeDays:90). Both have `targets:{MS1–O1}` and full advance/maintain arrays. `SKILL_LADDER_VER` bumped **90→91**.

---

### v121 — 6 Features + 2 new skills: Milestone progress bar, skill streak, daily reorder, practiced quick-log, AFT sparklines, new skills
**Files changed:** `src/tabs/today.js`, `src/tabs/skills.js`, `src/tabs/aft.js`, `src/core/skills-core.js`, `src/core/state.js`, `src/core/events.js`, `src/core/skills-data.js`, `src/core/migration.js`, `src/styles/main.css`, `sw.js`

1. **Milestone countdown progress bar (F1)** — The nearest upcoming milestone in Dawn now shows as a `.milestone-bar-wrap` panel with a label ("📍 Label — Nd away") and a 5px fill bar (jade, amber if ≤7 days). Progress computed from the most recent past milestone (or 30 days before) as origin to the target date. Additional upcoming milestones still render as `.ms-pill` chips below. CSS `.milestone-bar-wrap`, `.milestone-bar-label`, `.milestone-bar`, `.milestone-bar-fill`.

2. **Skill streak — consecutive practice days (F2)** — `skStreak(sk)` added to `skills-core.js`: iterates `sk.history[]` sorted descending, counts consecutive calendar days (by ISO date string) with at least one entry going back from today. If streak ≥ 2, leaf card footer shows `🔥 N-day streak` in `.sk-streak` (ember color). Rendered in `skills.js` after `pracFoot`.

3. **Daily orders up/down reorder buttons (F3)** — `renderDailies()` in `state.js` now passes the index `(d, i)` to the map and renders a `.daily-move-col` column with `▲` / `▼` buttons (`data-moveup` / `data-movedown`) on each order row. Up arrow hidden (visibility:hidden) on first item; down arrow hidden on last. Handlers in `events.js` swap adjacent array elements and call `renderDailies()`. CSS `.daily-move-col`, `.daily-move-btn`.

4. **Skill-of-the-day "practiced" quick-log on Dawn (F4)** — The focal skill row in Today Field Notes now includes a `✓ practiced` button (`data-skpractice="[skId]"`) inline. Tapping it calls the existing `skPractice()` handler, which resets the fade timer and calls `save(); render()`. No new handler needed — the `data-skpractice` delegation already existed in `events.js` from v111.

5. **AFT event trend sparklines (F5)** — `showAftResult()` in `aft.js`: for each event row, computes `evVals` from all `S.aft[]` entries sorted by date. If ≥ 2 entries exist, renders `miniSparkline(evVals, 60, 16)` in a `.aft-event-spark` span inline with the event score. CSS `.aft-event-spark` (inline-flex, vertical-align:middle, opacity:.8).

6. **New skills: Rucking technique + Army history & officership (F6)** — Two skills added to `SEED_SKILLS`. **Rucking technique** (cat:`physical`, parent:`Endurance`, fadeDays:90, 6-level ladder from fit/load basics through teaching others; targets MS1–O1). **Army history & officership** (cat:`leadership`, fadeDays:180, 6-level ladder from naming major battles through facilitating peer discussions; targets MS1–O1). `SKILL_LADDER_VER` bumped **91→92**. Total skills: **111**.

---

### v122 — Full skills expansion: 64 new skills across all 10 paths
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

Pure skills expansion session — no UI changes. Added 64 new skills to `SEED_SKILLS`. `SKILL_LADDER_VER` bumped **92→93**. Total skills: **175**.

**Tactical batch (8 skills, parent:"Soldier tasks"):** Marksmanship (M17/pistol) — 7 levels, Familiar→Instructor; CBRN/NBC awareness — 8 levels, Aware→Evaluator; Grenade employment — 6 levels, Aware→Certifier; Military law & ROE — 8 levels, Aware→Advisor; Battle drills — 8 levels, Aware→Evaluator; SALUTE/spot reporting — 6 levels, Know it→Teach it; Rappelling & vertical movement — 6 levels, Aware→Rigger; Operational planning (MDMP) — 9 levels, Aware→Staff Officer (cat:`leadership`, standalone).

**Physical batch (4 skills):** Combat water survival (parent:`Endurance`, 7 levels); Obstacle course (parent:`Endurance`, 6 levels); Cycling/cross-training (parent:`Endurance`, 6 levels); Gymnastics/bodyweight skills (parent:`Strength`, 8 levels).

**Cognitive batch (3 skills, parent:"Reasoning"):** Critical thinking — 8 levels; Decision science — 7 levels; Spatial reasoning — 7 levels.

**Physiological batch (3 skills):** Recovery tracking (parent:`Daily inputs`, 6 levels); Injury prevention & prehab (standalone, 7 levels); Vision training (parent:`Body markers`, 6 levels).

**Technical batch — Core CS (5 skills):** Version control/Git (8 levels); SQL & databases (9 levels); Bash/shell scripting (parent:`Linux / command line`, 8 levels); Cloud computing (9 levels); Data structures & algorithms (10 levels).

**Technical batch — Cyber/Security (8 skills):** Systems programming C/C++ (9 levels); Web application development (9 levels); Penetration testing methodology (9 levels); Digital forensics & incident response (9 levels); Malware analysis (8 levels); Cryptography applied (8 levels); Network defense/blue team (9 levels); Reverse engineering (8 levels).

**Technical batch — DevOps & Emerging (5 skills):** DevOps/containerization (8 levels); PowerShell/Windows administration (7 levels); CTF/competitive security (8 levels); Machine learning/AI fundamentals (8 levels); Software testing (7 levels).

**Leadership batch (4 skills):** Brief preparation & delivery (7 levels); Ethics & moral reasoning (7 levels); Cross-cultural competence (6 levels); Project management (8 levels).

**Academic batch (10 skills):** Statistics & data analysis (9 levels); Research skills (parent:`Learning systems`, 7 levels); Geopolitics & foreign policy (7 levels); Spanish (parent:`Languages`, 8 levels ILR); French (parent:`Languages`, 8 levels ILR); Mandarin Chinese (parent:`Languages`, 8 levels ILR, fadeDays:21); Arabic (parent:`Languages`, 8 levels ILR, fadeDays:21); Russian (parent:`Languages`, 8 levels ILR, fadeDays:21); Philosophy & ethics (7 levels); Economics fundamentals (7 levels).

**Personal/Hearth/Roots batch (14 skills):** Professional networking (7L); Interview skills (7L); Tax preparation (5L); Investing & wealth building (8L); Home & life maintenance (7L); Health literacy (6L); Legal literacy (6L); Mindfulness & meditation (7L, fadeDays:14); Sleep optimization (7L, fadeDays:14); Mental health literacy (6L); Vehicle preparedness (6L, parent:`Sustainment`); Amateur radio/backup communications (6L, parent:`Sustainment`); Self-awareness (7L, parent:`Character`); Gratitude & positive reframing (5L, parent:`Character`, fadeDays:14).

### v123 — 6 UX + intelligence features, 4 new skills, full technical & leadership hierarchies
**Files changed:** `src/tabs/today.js`, `src/tabs/skills.js`, `src/tabs/skills.html`, `src/tabs/records.html`, `src/tabs/records.js`, `src/core/state.js`, `src/core/skills-data.js`, `src/core/migration.js`, `src/styles/main.css`, `sw.js`

`SKILL_LADDER_VER` bumped **93→94**. SW bumped to `operations-v123`. Total skills: **186** (4 new leaf skills + 7 new group nodes).

**Feature 1 — Path health snapshot on Dawn:** `renderToday()` in `today.js` now builds a `pathSummaryHtml` block listing every active path (one row: icon, name, active skill count, avg level, at-risk count). Color-coded jade/ember based on decay ratio. Appears between the milestone bar and Warrior's Focus. CSS `.path-summary-strip`, `.path-summary-row`, `.path-summary-icon`, `.path-summary-name`, `.path-summary-stat`.

**Feature 2 — Skill gap heatmap by career stage:** New `renderSkillGapMap()` in `skills.js`, toggled by 🗺️ button in the Skills toolbar. Renders a table: one row per path, columns = career stages (MS1→O1). Each cell shows ✓ (on track), count of skills behind, or — (no targets). Current stage column highlighted gold. `_gapMapVisible` module flag. CSS `.sk-gap-map`, `.sk-gm-table`, `.sk-gm-cur`, `.sk-gm-path`, `.sk-gm-td`, `.sk-gm-stage`, `.sk-gm-legend`.

**Feature 3 — Skill notes search / history viewer:** New `renderSkillNotes()` in `records.js`, called from `render()` in `state.js`. Shows all `history[]` entries with a `note` field across all skills, sorted descending by timestamp, filterable by a `#skNoteSearch` text input. Added "Skill Notes" section at top of `records.html`. CSS `.sk-note-entry`, `.sk-note-header`, `.sk-note-skill`, `.sk-note-date`, `.sk-note-text`.

**Feature 4 — Weekly skill practice planner:** New `renderWeeklyQueue()` in `skills.js`, toggled by 🗓️ button in Skills toolbar. Shows all started non-auto skills with `skDaysLeft(sk) ≤ 7` OR `skFadeState !== 'current'`, sorted by urgency. Each row shows sigil, name, days remaining, and a quick ✓ practiced button. `_skWeeklyVisible` module flag. CSS `.sk-weekly-queue`, `.sk-wq-row`, `.sk-wq-info`, `.sk-wq-name`, `.sk-wq-days`, `.sk-wq-tag`, `.sk-wq-btn`, `.sk-wq-emblem`.

**Feature 5 — New skills + skill hierarchies:** 4 new leaf skills added; 7 group nodes added to create hierarchies in the technical (4 groups) and leadership (3 groups) paths. All 23 technical skills and 13 leadership skills now have `parent` assignments. Migration reconciler automatically updates existing saves.

New groups — **technical:** `Foundations` (Linux, Networking, Git, SQL, Cloud, DSA, Bash); `Programming` (Python, Java, JavaScript, C/C++, Web app dev, ML/AI); `Cybersecurity` (Cybersecurity fundamentals, Pen testing, DFIR, Malware analysis, Cryptography, Network defense, Reverse engineering, CTF); `DevOps & ops` (DevOps/containerization, PowerShell, Software testing). **Leadership:** `Communication` (Public speaking, Negotiation, Brief prep, Military writing, Parliamentary procedure); `Command skills` (Drill & ceremony, Counseling, Army history & officership, Ethics, Cross-cultural); `Operations & planning` (Decision-making, MDMP, Project management, Obstacle leadership).

New leaf skills: **Combatives (physical control)** (physical, parent:`Close-Quarters Combat`, 7L, MACP Level 1–2 ladder, fadeDays:90); **Obstacle leadership** (leadership, parent:`Operations & planning`, 6L, individual→platoon evaluation, fadeDays:90); **Second language retention** (cognitive, parent:`Memory`, 5L, passive recognition→6-month no-decay maintenance, fadeDays:30); **Wilderness medicine / CASEVAC** (tactical, parent:`Soldier tasks`, 7L, WFA→WFR→platoon CASEVAC lead, fadeDays:180).

**Feature 6 — Tree layout audit:** `PAGEERRORS 0` confirmed; tree renders with updated hierarchy structure. Headless `--shot` screenshot has a pre-existing visibility limitation in the test runner.

### v124 — 6 features + 3 utility skills + skill fixes
**Files changed:** `src/tabs/profile.js`, `src/tabs/profile.html`, `src/tabs/skills.js`, `src/tabs/skills.html`, `src/tabs/quests.js`, `src/tabs/today.js`, `src/core/skills-core.js`, `src/core/skills-data.js`, `src/core/migration.js`, `src/styles/main.css`, `sw.js`

`SKILL_LADDER_VER` bumped **94→95**. SW bumped to `operations-v124`. Total skills: **186**.

**Feature 1 — Commissioning readiness dashboard:** `renderCommReadiness()` in `profile.js`. Six traffic-light indicators: AFT total score, GPA, skills at career target, qualifications current, ROTC record completeness, clearance status. Each indicator shows green/amber/red with specific gap text. Panel in `profile.html` after vitals. CSS `.comm-ready-wrap`, `.comm-indicator`, `.cr-green/.cr-amber/.cr-red`.

**Feature 2 — Skill-linked oath completion:** Skill-link row on each active quest card. A `<select>` of started skills + a radio (practice / level-up). On quest completion the linked skill auto-practices or levels up. Fields: `q.linkedSkillId`, `q.linkedSkillType`. Wired in `quests.js`.

**Feature 3 — Card table redesign of Skills tab:** Dark green felt `#view-skills` background. 10 path deck "cards" with embossed backs (sigil, path name, suit name, level corners). Decks open to a flex-wrap card grid. Rank corners on skill cards (Ace–King, importance-sorted). Group sub-skills render as 110px mini playing cards in `.sk-mini-grid`. Constants `SK_SUIT` and `CARD_RANKS` in `skills.js`.

**Feature 4 — End-of-day training journal:** `S.dayLog[]` array. `renderDayLog()` in `today.js`. 3-field form (title/notes/mood). Last 3 days shown in collapsible panel on Dawn. Handler `data-daylogadd`/`data-daylogdel` in `events.js`.

**Feature 5 — 30-day skill history sparkline in Work panel:** `skTrendSparkline(sk)` in `skills-core.js`. Produces a small SVG of level history over the last 30 days. Appended to `skWorkGuidance()` output.

**Feature 6 — Fix 5 orphaned skills missing `parent:` field:** `Statistics & data analysis`, `Geopolitics & foreign policy`, `Philosophy & ethics`, `Economics fundamentals`, `Injury prevention & prehab` — all given correct parent assignments in `skills-data.js`.

### v125 — Rarity system, sub-deck pages, Joker deck, foil shimmer
**Files changed:** `src/core/skills-core.js`, `src/tabs/skills.js`, `src/tabs/skills.html`, `src/core/events.js`, `src/styles/main.css`, `sw.js`

SW bumped to `operations-v125`. Total skills: **186**.

**Rarity system:** `skRarity(sk)` in `skills-core.js` — Common (≤4L), Uncommon (5–7L), Rare (8–10L), Legendary (11–13L), Mythic (14+L), Joker (auto or tagged). Rarity badge shown on card tier line. `--rar-col` CSS variable drives border color per card.

**Sub-deck pages:** Paths with >13 top-level skills split into sub-decks of 13 (I, II, III…). Each sub-deck gets its own embossed card back inside the opened path deck. Path card back shows "N decks" indicator.

**Joker deck:** All `auto:true` and `joker:true` skills aggregated in a "Wildcards" deck (deep violet gradient) at the top of `#skList`. Jump-bar includes 🃏 Wildcards button. Joker toggle checkbox on skill add/edit form (`sk.joker=true`, wired in `skCreate()`/`skEdit()`).

**Foil shimmer:** Legendary and Mythic cards get a `::after` CSS animation (`foilShimmer`, 4s linear infinite) — a diagonal gradient sweep on `.sk-card.rarity-legendary` and `.sk-card.rarity-mythic`.

**Path completion badges:** `<span class="sk-path-badge discovered">All Collected</span>` and `<span class="sk-path-badge mastered">★ All Mastered</span>` appear in deck header when all leaves started or all maxed.

**Skill synergy combos:** `SYNERGY_PAIRS` array (15 pairs) in `skills-core.js`. `skHasSynergy(sk)` checks if partner skill is at L4+. `⚡ Partner Name` shown in `.sk-synergy-foot` on card footer.

**Side Deck:** Unstarted leaves render face-down in a collapsible `<details class="sk-side-deck">` section below each path's active cards. `faceDownCard()` renders card back with rarity pip, name hidden, synthesis set progress bar and Combine button if synthesis pending.

### v126 — 6 card features + physical pyramid seeds + 3 utility skills + 4 utility improvements
**Files changed:** `src/tabs/today.js`, `src/tabs/skills.js`, `src/core/skills-core.js`, `src/core/skills-data.js`, `src/core/events.js`, `src/tabs/aft.js`, `src/styles/main.css`, `sw.js`

`SKILL_LADDER_VER` bumped **95→96**. SW bumped to `operations-v126`. Total skills: **220** (186 + 3 utility + 31 physical pyramid seeds).

**Today's Hand:** 5 started skills drawn deterministically each day via `hashStr(dateKey)` + `seededShuffle()` in `today.js`. Horizontal card strip `.th-hand` on Dawn above Field Notes.

**Collection stats chip:** `X/N collected` chip in `skSummaryBar` — started/total leaves per path, gold font.

**Pyramid system (skills-core.js):** `skSeedOf(name,cat)`, `skSetMembers(setKey)`, `skSetMasteredCount(setKey)`, `skSetCanCombine(setKey)`, `skCombineSet(setKey)`. Combine button handler via `data-skcombine` in `events.js`.

**Physical path pyramid seeds added to SEED_SKILLS:**
- 1 Mythic: "Physical Mastery" (`synthesizedFrom:"phys_leg"`)
- 5 Legendaries: one per cluster (Strength, Endurance, Composition, Combat, Movement), `setKey:"phys_leg"`, each `synthesizedFrom:"phys_r_[cluster]"`
- 25 Rares: 5 per Legendary cluster, `setKey:"phys_r_[cluster]"`, each `synthesizedFrom:"phys_u_[cluster]_[subset]"`

**3 utility skills:** Land navigation (tactical, 8L), 9-line MEDEVAC (tactical, 6L), Personal finance (personal, 7L).

**4 utility improvements:** Quick PT Log (3-field form on Dawn, saves to `S.workouts[]`); AFT Goal (`S.aftGoal`, `renderAftGoal()`, progress bar in `#aftGoalWrap`); Urgency-first focal skill (≤3 days from fade shown first with `⚠ Nd left`); Skill history export ("📋 Copy skill history" in Records tab).

### v127 — 25 Strength Uncommons + Synthesis Chain View + Synthesis-Ready Alert + pyramid reset migration
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `src/tabs/skills.js`, `src/tabs/today.js`, `src/styles/main.css`, `sw.js`

`SKILL_LADDER_VER` bumped **96→97**. SW bumped to `operations-v127`. Total skills: **245** (220 + 25 Strength Uncommons).

**25 Physical Strength Uncommons:** Added to `SEED_SKILLS`. Five sets of 5, each feeding a Strength Rare:
- `phys_u_strength_basics` (→ "Strength Foundation"): Hip Hinge Mastery, Squat Pattern, Push Pattern, Pull Pattern, Compound Integration
- `phys_u_strength_power` (→ "Power Development"): Jump Training, Sprint Mechanics, Ballistic Power, Speed-Strength Training, Reactive Strength
- `phys_u_strength_accessory` (→ "Accessory Work"): Shoulder Health Work, Posterior Chain Work, Grip Strength, Core Basics, Vertical Pull Pattern
- `phys_u_strength_programming` (→ "Strength Periodization"): 1RM Testing, Percentage Training, Volume Prescription, Deload Protocol, Peaking Cycle
- `phys_u_strength_recovery` (→ "Recovery Science"): Sleep Discipline, Nutrition Timing, Active Recovery, HRV Fundamentals, Stress Load Balance

Each Uncommon: `cat:"physical"`, `rarity:"uncommon"`, `fadeDays:30`, 5-level honest-benchmark ladder, `why`/`howTo`/`safety`/`roadmap`/`advance`/`maintain`.

**Pyramid reset migration:** `PYRAMID_RESET_VER=1` constant in `migration.js`. In `mergeNewSeedSkills()`, when `seed.setKey` is set and `live.pyramidResetApplied` is falsy: wipes `currentLevel→0`, `history→[]`, `lastQuestTs→null`, deletes `synthesisUnlocked`, sets `live.pyramidResetApplied=1`. User-authorized blank-slate rule. Fires once per skill.

**Synthesis Chain View:** `renderSynthesisChain(cat)` in `skills.js` — walks seed data to display mythic→legendary→rare tree. Each Legendary is a collapsible `<details>`, each Rare shows Uncommon mastery count. Status icons: ✦ mythic, ★ maxed, ▶ started, ⚡ ready-to-combine, 🔒 locked. Toggle button `.sc-toggle[data-sctoggle]` on each path deck header; `btn.onclick` with `e.stopPropagation()` to prevent parent header toggle. Output goes in `.sc-wrap#sc-{cat}`. CSS: `.sc-toggle`, `.sc-wrap`, `.synth-chain`, `.sc-mythic`, `.sc-legend`, `.sc-rares`, `.sc-rare`, `.sc-{maxed|started|ready|locked}`.

**Synthesis-Ready Alert on Dawn:** In `renderToday()`, after focal skill row. Iterates `SEED_SKILLS` for synthesis targets with `synthesizedFrom` set; checks `skSetCanCombine()` but not yet `synthesisUnlocked` on live skill. Shows gold-bordered `.sk-synth-ready-row` with `⚡ Synthesis ready: Name1, Name2 — open Skills to combine.` and a Skills → button.

### v128 — 48 Physical Uncommons (Endurance + Composition clusters)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **97→98**. SW bumped to `operations-v128`. Total skills: **293** (245 + 48 new seeds).

**Existing skill modifications:** "Rucking technique" and "Cycling (cross-training)" each received `setKey` and `rarity:"uncommon"` fields to slot them into the Ruck Mastery and Durability Training Rare chains respectively. Their existing ladders are unchanged. Pyramid reset migration fires on these on next load (user-authorized blank-slate).

**25 Physical Endurance Uncommons:** Added to `SEED_SKILLS`. Five sets feeding five Endurance Rares:
- `phys_u_running_basics` (→ "Running Foundation"): Weekly Run Consistency, Easy Pace Discipline, Run Warm-Up Protocol, Run Mileage Tracking, Running Frequency Base
- `phys_u_running_speed` (→ "Running Performance"): Tempo Running, Interval Training, Cadence Training, Running Drills, Race Pacing Protocol
- `phys_u_endurance_aerobic` (→ "Aerobic Base"): Zone 2 Training, Cardiac Output Sessions, Aerobic Threshold Runs, Breathing Mechanics, Aerobic Baseline Testing
- `phys_u_endurance_durability` (→ "Durability Training"): Cycling [existing], Progressive Volume Building, Back-to-Back Training Days, Long Effort Endurance, Training Load Management
- `phys_u_rucking` (→ "Ruck Mastery"): Rucking technique [existing], Pack Fitting & Load Distribution, Ruck Pacing, Foot Care for Rucking, Load Progression

**25 Physical Composition Uncommons:** Added to `SEED_SKILLS`. Five sets feeding five Composition Rares:
- `phys_u_lean_mass` (→ "Lean Mass Building"): Progressive Overload Practice, Protein Intake Protocol, Caloric Surplus Management, Hypertrophy Training Block, Lean Mass Tracking
- `phys_u_fat_loss` (→ "Fat Loss Protocol"): Caloric Deficit Execution, Protein Preservation During a Cut, Plateau Recognition and Response, Deficit Adherence Strategy, Body Composition Confirmation
- `phys_u_nutrition` (→ "Nutrition System"): Macronutrient Understanding, Food Label Reading, Protein Priority at Every Meal, Meal Prep Discipline, Hydration Baseline
- `phys_u_sleep` (→ "Sleep Mastery"): Sleep Duration Baseline, Consistent Wake Time, Pre-Sleep Hygiene Protocol, Sleep Environment Optimization, Sleep as Performance Input
- `phys_u_prehab` (→ "Injury Resilience"): Daily Movement Prep, Bilateral Symmetry Work, Load Management Awareness, Mobility Maintenance Routine, Return-to-Training Protocol

All Uncommons: `cat:"physical"`, `rarity:"uncommon"`, 5-level honest-benchmark ladders, `why`/`howTo`/`safety`/`roadmap`/`advance`/`maintain`. No UI changes this session — pure data.

### v129 — 47 Physical Uncommons (Combat + Movement clusters)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **98→99**. SW bumped to `operations-v129`. Total skills: **340** (293 + 47 new seeds). Physical pyramid Uncommon layer is now complete — all 5 Legendary chains fully fed.

**Existing skill modifications:** "Combat water survival" → `setKey:"phys_u_swimming"`, "Combatives (physical control)" → `setKey:"phys_u_combatives"`, "Obstacle course" → `setKey:"phys_u_field"`. All three also received `rarity:"uncommon"`. Pyramid reset migration fires on next load (user-authorized blank-slate).

**22 Physical Combat Uncommons:** Added to `SEED_SKILLS`. Five sets feeding five Combat Rares:
- `phys_u_swimming` (→ "Combat Swim Cert"): Combat water survival [existing], Basic Water Confidence, Freestyle Stroke Mechanics, Uniform/Gear Swimming, Back Float and Survival Float
- `phys_u_combatives` (→ "Combatives Level 2"): Combatives (physical control) [existing], Stand-Up Control and Takedowns, Guard Position and Sweeps, Escapes from Bad Positions, Safe Training Habits
- `phys_u_field` (→ "Field Hardening"): Obstacle course [existing], Cold Weather Acclimatization, Field Sleep Discipline, Load Carry Fitness, Heat Management and Hydration
- `phys_u_power_combat` (→ "Explosive Athleticism"): Box Jump Proficiency, Broad Jump Power, Lateral Quickness Drills, Explosive Hip Extension, Sprint Acceleration Mechanics
- `phys_u_mentaltoughness` (→ "Stress Inoculation"): Discomfort Tolerance Training, Breathing Under Stress, Focus During Fatigue, Self-Talk and Reframing, Embracing the Grind

**25 Physical Movement Uncommons:** Added to `SEED_SKILLS`. Five sets feeding five Movement Rares:
- `phys_u_mobility` (→ "Joint Mobility"): Hip Mobility Baseline, Thoracic Spine Rotation, Ankle Dorsiflexion Work, Shoulder Mobility Assessment, Full-Body Mobility Flow
- `phys_u_stability` (→ "Core Stability"): Plank Progressions, Anti-Rotation Training, Dead Bug Drill, Single-Leg Balance Progressions, Loaded Carry Stability
- `phys_u_mechanics` (→ "Movement Literacy"): Hip Hinge Pattern, Squat Pattern Quality, Push Pattern Quality, Pull Pattern Quality, Carry Pattern Quality
- `phys_u_flexibility` (→ "Soft Tissue Recovery"): Foam Rolling Protocol, Targeted Post-Run Stretching, Sleep Recovery Positioning, Contrast Therapy Basics, Active Recovery Sessions
- `phys_u_locomotion` (→ "Athletic Locomotion"): Ground Contact Time Reduction, Hill Running Mechanics, Arm Carriage Mechanics, Stride Length Optimization, Variable Terrain Adaptation

All Uncommons: `cat:"physical"`, `rarity:"uncommon"`, 5-level honest-benchmark ladders, `why`/`howTo`/`safety`/`roadmap`/`advance`/`maintain`. No UI changes this session — pure data.

### v135 — Tactical Specialties Uncommons + Full Leadership Pyramid (168 new seeds)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **103→104**. SW bumped to `operations-v135`. Total skills: **635** (467 + 168 new seeds).

**Part 1 — Tactical Specialties Uncommons (23 new seeds):** Completed the 5th and final Tactical Uncommon cluster.
- `tac_u_rappelling` ×4 new (Anchor System Rigging, Hasty Rappel Technique, Ascending Fundamentals, Tower NCO/Evaluator Duties; +1 existing "Rappelling & vertical movement" = 5 total)
- `tac_u_combatives_tac` ×5 new (MACP Ground Position Fundamentals, Takedowns and Trips, Guard Sweeps and Escapes, Weapon Retention under Grapple, MACP Sparring Safety and Habits)
- `tac_u_grenades` ×4 new (Grenade Types and Safety, Dry-Run Mechanics, Throw Accuracy, Employment Principles; +1 existing "Grenade employment" = 5 total)
- `tac_u_urban` ×5 new (MOUT Fundamentals, Building Entry Techniques, Room Clearing Sequence, Multi-Room Structure Clearance, Outer Cordon Establishment)
- `tac_u_convoy` ×5 new (Convoy Planning Basics, Vehicle Spacing and Communications, React to IED Drill, React to Vehicle Ambush, Convoy After-Action Report)

**Part 2 — Full Leadership Pyramid (145 new + existing integrations):**
- 1 Mythic: "Battlefield Commander" (14L, setKey:"lead_mythic")
- 5 Legendaries: Command Presence, People Development, Operational Mastery, Communication Mastery, Character & Ethics (11L each, setKey:"lead_leg")
- 25 Rares: 18 new 8L seeds + 7 existing skills with setKey added in-place. Rarities manually overridden where ladder depth differed from pyramid role.
- 121 Uncommon seeds across 25 sets (5 per set, max 2 existing per set):
  - Cluster 1 Command Presence: lead_u_dc ×4 new, lead_u_voice ×5, lead_u_bearing ×5, lead_u_authority ×5, lead_u_formation ×5 (+1 existing "Obstacle leadership")
  - Cluster 2 People Development: lead_u_counsel ×5 new, lead_u_dev ×5, lead_u_cohesion ×5, lead_u_feedback ×5, lead_u_conflict ×5 (+1 existing "Counseling & mentorship" as the Rare)
  - Cluster 3 Operational Mastery: lead_u_ops_mdmp ×5 new, lead_u_decision ×5, lead_u_risk ×5, lead_u_aar ×5, lead_u_pm ×5 (+2 existing as Rares)
  - Cluster 4 Communication Mastery: lead_u_speaking ×4 new, lead_u_writing ×5, lead_u_negot ×5, lead_u_orders ×5, lead_u_orgcomms ×5 (+1 existing "Brief preparation & delivery")
  - Cluster 5 Character & Ethics: lead_u_history ×5 new, lead_u_ethics_found ×4, lead_u_cross_cultural ×4, lead_u_identity ×5, lead_u_resilience ×5 (+2 existing "Ethics & moral reasoning", "Cross-cultural competence")
- All Uncommons: 5-level honest-benchmark ladders, why/howTo/roadmap/advance/maintain, synthesizedFrom:"lead_c_*" for future Common layer.

### v134 — Tactical pyramid Intelligence & Reporting Uncommons (24 new seeds)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **102→103**. SW bumped to `operations-v134`. Total skills: **467** (443 + 24 new seeds).

Added 24 new Intelligence & Reporting Uncommon seeds completing the 4th of 5 Tactical Uncommon clusters. Existing "SALUTE / spot reporting" already filled 1 slot in tac_u_salute from v131. Five sets complete:
- `tac_u_salute` ×4 new (SPOTREP Form Completion, Voice SPOTREP on Radio, Patrol Debrief Compilation, Pattern-of-Life Analysis; +1 existing = 5 total)
- `tac_u_terrain_analysis` ×5 new (OAKOC Framework, Terrain Overlay, Terrain Brief, Avenues of Approach Identification, Defensive Position Recommendation)
- `tac_u_osint` ×5 new (OSINT Categories, OSINT Search Exercise, Source Verification, Credibility Rating, OSINT Collection Plan)
- `tac_u_map_reading` ×5 new (Map Orientation, MGRS Grids, Declination and Azimuth, Terrain Features from Contour, Map-to-Ground Cross-Reference)
- `tac_u_contact_report` ×5 new (SALUTE Under Contact, ACE Report, Relay Up Chain, Multi-Contact Debrief, Lead Element Through Contact)

All seeds: 5-level honest-benchmark ladders, why/howTo/roadmap/advance/maintain. No UI changes this session — pure data.

### v139 — Academic path pyramid (139 new seeds + 17 existing wired)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **107→108**. SW bumped to `operations-v139`. Total skills: **1201**.

Built the complete Academic path pyramid: 1 Mythic ("Scholar-Warrior", 14L, synthesizedFrom:"acad_leg"); 5 Legendaries (Scholar's Method, Clear Communicator, Critical Analyst, Polyglot Operator, Domain Scholar — all 11L, setKey:"acad_leg"); 25 Rares across 5 clusters (acad_r_study, acad_r_comm, acad_r_analysis, acad_r_lang, acad_r_domains — 22 new 8L seeds + 3 existing wired: Writing, Higher mathematics, Statistics & data analysis). 111 new Uncommon seeds across 25 sets (5L each) plus 14 existing Uncommons wired. Wired existing skills: Writing→acad_r_comm/acad_u_writing; Higher mathematics→acad_r_analysis/acad_u_math; Statistics→acad_r_analysis/acad_u_data_analysis; Military history→acad_u_military_sci; Study & retention→acad_u_study_arch; ROTC knowledge→acad_u_military_sci; Note-taking→acad_u_capture; Research skills→acad_u_writing; Geopolitics→acad_u_geopolitics; Spanish/French/Mandarin/Arabic/Russian/German all assigned rarity:"uncommon" to override 8L auto-Rare and placed in respective Lang Uncommon clusters. Philosophy & ethics→acad_u_philosophy; Economics fundamentals→acad_u_economics. All Uncommons have synthesizedFrom:"acad_c_*" placeholder for future Common layer.

### v138 — Physiological path pyramid (146 new seeds + 7 existing wired)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **106→107**. SW bumped to `operations-v138`. Total skills: **1062**.

Built the complete Physiological path pyramid: 1 Mythic ("Vital Operator"); 5 Legendaries; 25 Rares across 5 clusters (phys2_r_nutrition, phys2_r_sleep, phys2_r_recovery, phys2_r_health, phys2_r_body). 125 Uncommon seeds across 25 sets. 7 existing physiological skills wired. All Uncommons have synthesizedFrom:"phys2_c_*".

### v137 — Cognitive path pyramid (144 new seeds + 11 existing wired)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **105→106**. SW bumped to `operations-v137`. Total skills: **915**.

Built the complete Cognitive path pyramid: 1 Mythic ("Master of the Mind", 14L, synthesizedFrom:"cog_leg"); 5 Legendaries (Processing Speed, Memory Mastery, Attentional Command, Mental Operations, Cognitive Synthesis — all 11L, setKey:"cog_leg"); 25 Rares across 5 clusters (cog_r_speed, cog_r_memory, cog_r_attention, cog_r_operations, cog_r_synthesis — 15 new 8L seeds + 10 existing skills wired). 124 new Uncommon seeds across 25 sets (5L each) plus 2 existing Uncommons wired. Wired 11 existing Rares: Reaction speed (cog_r_speed/cog_u_reaction), Cognitive/processing speed (cog_r_speed/cog_u_proc_speed), Working memory n-back (cog_r_memory/cog_u_working_mem), Memory span (cog_r_memory/cog_u_mem_span), Attention/sustained focus (cog_r_attention/cog_u_attention), Reading speed (cog_r_attention/cog_u_reading), Mental math (cog_r_operations/cog_u_mental_math), Pattern recognition (cog_r_operations/cog_u_pattern), Critical thinking (cog_r_synthesis/cog_u_critical). Wired 2 existing Uncommons: Decision science (cog_u_spatial_ops), Spatial reasoning (cog_u_decision). Memory technique and Memory retention left standalone (no cog_r_reasoning cluster exists). Typing speed & accuracy and Second language retention left standalone. All Uncommons have synthesizedFrom:"cog_c_*" placeholder for future Common layer.

### v133 — Tactical pyramid Leader's Tools Uncommons (25 new seeds)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **101→102**. SW bumped to `operations-v133`. Total skills: **443** (418 + 25 new seeds).

Added 25 new Leader's Tools Uncommon seeds completing the 3rd of 5 Tactical Uncommon clusters. Five sets complete: tac_u_mdmp ×5 (Mission Analysis Fundamentals, COA Development, COA Analysis and Wargaming, COA Comparison and Approval, MDMP Integration), tac_u_law ×5 (Law of War Foundations, ROE Application, LOAC Principles in Training, EPW Handling, Reporting Violations), tac_u_opord ×5 (OPORD Structure, Situation Paragraph, Mission Statement, Execution Concept, Service Support and C2), tac_u_tlp ×5 (TLP Steps 1-3, TLP Steps 4-5, Warning Order Execution, Map Reconnaissance and Tentative Plan, TLP Steps 6-8), tac_u_counseling ×5 (DA 4856 Form Proficiency, Initial Counseling, Event Counseling, Performance Counseling, Follow-Up Counseling). All seeds: 5-level honest-benchmark ladders, why/howTo/roadmap/advance/maintain.

### v132 — Tactical pyramid Field Operator Uncommons (23 new seeds)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped to **101**. SW bumped to `operations-v132`. Total skills: **418**.

Added 23 new Field Operator Uncommon seeds. All existing tactical skills checked for integration — Radio communications (8L) and Fieldcraft & survival (10L) are both Rare depth and remain standalone. Five sets complete: tac_u_landnav ×5 (Map Reading Basics, Compass Fundamentals, Dead Reckoning, Terrain Association, Night Navigation), tac_u_comms ×5 (NATO Phonetic Alphabet, Radio Check Procedure, Radio Operation, PACE Planning, Net Control Duties), tac_u_fieldcraft ×5 (Kit Management, Field Shelter, Water and Rations Management, Temperature Management, Extended Field Sustainment), tac_u_terrain ×5 (Individual Movement Techniques, Cover and Concealment Use, Squad Formations, Bounding Overwatch, Obstacle Crossing Fundamentals), tac_u_casevac ×3 new (LZ Selection and Marking, Litter Construction and Patient Carry, Mass Casualty Triage — the remaining 3 slots of the 5-slot set; the other 2 were filled in v131). All seeds follow established pattern: 5-level honest-benchmark ladders, why/howTo/safety/roadmap/advance/maintain.

### v131 — Tactical pyramid (Mythic + 5 Legendaries + 25 Rares + Combat Soldier Uncommons)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped to **100**. SW bumped to `operations-v131`. Total skills: **395**.

Added the full Tactical pyramid skeleton: 1 Mythic ("Tactical Mastery", synthesizedFrom:"tac_leg"); 5 Legendaries (Combat Soldier, Field Operator, Leader's Tools, Intelligence & Reporting, Tactical Specialties); 25 Rares across 5 clusters (tac_r_combat_soldier, tac_r_field_operator, tac_r_leader_tools, tac_r_intel, tac_r_specialties). Integrated 6 existing tactical skills as Uncommons by adding `rarity:"uncommon"` + `setKey`: Marksmanship M17 (tac_u_weapons), Grenade employment (tac_u_grenades), SALUTE/spot reporting (tac_u_salute), Rappelling (tac_u_rappelling), Wilderness medicine/CASEVAC (tac_u_casevac), 9-line MEDEVAC (tac_u_casevac). Added 24 new Combat Soldier Uncommon seeds: tac_u_weapons ×4 (Weapon Safety Fundamentals, Trigger Control Mechanics, Malfunction Clearance, Qualification Course Prep), tac_u_battle_drills ×5 (React to Contact Actions, Break Contact Execution, React to Indirect Fire, Bunker and Fortification Actions, Battle Drill Integration), tac_u_cbrn ×5 (CBRN Threat Identification, MOPP Gear Execution, Detection Equipment Use, Hasty Decontamination, CBRN Reporting), tac_u_tccc ×5 (Tourniquet Application, Wound Packing and Occlusion, Airway and Breathing Control, Circulation and Hypothermia Prevention, MARCH Protocol Execution), tac_u_swimming ×5 (Water Entry Under Load, Uniform Swimming Technique, Equipment Buoyancy Management, Buddy Tow Technique, Combat Water Exit). All seeds follow the established pattern with `why`, `howTo`, `safety`, `levels`, `roadmap`, `advance`, `maintain`.

### v130 — synthesizedFrom backfill (all Physical Uncommons)
**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v130`. No SKILL_LADDER_VER change (`synthesizedFrom` is a seed-only field, never synced to live skills).

Added `synthesizedFrom:"phys_c_*"` to all 100 Physical Uncommons that were previously leaf cards (Endurance, Composition, Combat, Movement clusters — 95 new seeds + 5 existing integrated skills). The 25 Strength Uncommons already had `synthesizedFrom` from v127. Every Physical Uncommon now points to a unique `phys_c_*` Common set key, making the Physical pyramid a consistent 5-layer tree across all 5 clusters. No Common seeds exist yet — those are written after all path pyramids reach Uncommon. Design decision: build all paths to Mythic first, then add Commons to all paths in one dedicated batch.

### v145 — Pyramid structural repair: 190 missing Uncommons + a real synthesis bug fixed
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **113→114**. SW bumped to `operations-v145`. Total skills: **1899** (was 1709).

An earlier session (interrupted mid-work) had already committed all the Rare/Legendary structure from the v145 plan (5 sixth-Legendaries moved to new `X2_leg` setKeys, 28 new Rares written), but left ~190 Uncommons unwritten. This session found that state, audited it against the plan with grep-based setKey counts (not assumptions), and filled every gap:
- Fixed a real bug: two new Rares ("Digital Forensics & Incident Response" and "Threat Intelligence Analysis" under `tech_r_advanced_cyber`) had been given `synthesizedFrom` keys (`tech_u_dfir`, `tech_u_threat_intel`) that were already in use by unrelated, older Rares. Since `skCombineSet()` looks up the *first* seed matching a `synthesizedFrom` key, the new Rares were permanently unreachable. Renamed to `tech_u_dfir2` / `tech_u_threat_intel2` and gave them their own Uncommon sets.
- Wrote 38 missing Uncommon sets (190 skills): 19 sets for the tac/lead/tech/cog/pers sixth-Legendary Rare clusters, 9 sets for new Soldier Athlete Rares (CQC + Army Fitness + Physical Versatility), and 10 sets for existing Soldier Athlete Rares (Operational Endurance + Physical Leadership clusters) that had `synthesizedFrom` set but zero Uncommons.
- Confirmed the 2 "missing" Vital Operator Uncommons and the 5 Mythic unlockHint reverts from the plan were already done in the prior session's commit.
- Work was parallelized across 10 subagents editing the same file concurrently (each targeting a unique pre-placed `// SLOT:<setKey>` marker comment to avoid overlapping edits) — this is now the standard pattern for large multi-cluster Uncommon-writing sessions, since a single sequential pass previously overflowed context and crashed.

`npm run regress` → `PAGEERRORS 0`, `badCount:0`. Phase 7 of the original v145 plan (5 new Mythics + 20 new Legendaries + 100 new Rares + 500 new Uncommons for Warrior Foundation / Staff Excellence / Cyber Operator / Cognitive Athlete / Life Architect) was not started this session — deferred to v146+, see `planning/IMPROVEMENTS-v146.md`.

### v146 — Phase 7: Five New Mythics (Mythic + Legendary + Rare structure, 125 new seeds)
**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

`SKILL_LADDER_VER` bumped **114→115**. SW bumped to `operations-v146`. Total skills: **2024** (was 1899).

Built the 5 new second-Mythic trees planned in `IMPROVEMENTS-v146.md`: Warrior Foundation (tactical), Staff Excellence (leadership), Cyber Operator (technical), Cognitive Athlete (cognitive), Life Architect (personal). Each path's already-existing "6th Legendary" (seeded in v145 at setKey `X2_leg`) now has 4 sibling Legendaries plus a crowning Mythic:
- 5 new Mythics (`X2_mythic`, `synthesizedFrom:"X2_leg"`)
- 20 new Legendaries (4 per path, `setKey:"X2_leg"`, each with a unique `synthesizedFrom:"X2_r_<cluster>"`)
- 100 new Rares (5 per new Legendary, sharing that Legendary's `X2_r_<cluster>` setKey, each with a unique placeholder `synthesizedFrom:"X2_u_<cluster>_<slug>"` Uncommon key — no Commons layer exists yet at this tier)

Written directly (not parallelized — the spec calls for sequential, cross-referencing work at this density) in 5 batches of exactly 25 skills, one path per batch, each batch saved to disk immediately after writing so an interrupted session would lose at most one path's worth of work. Offensive-cyber Rares under Cyber Operator (pentesting, web app testing, wireless assessment, social engineering assessment) are explicitly framed as authorized/lab-only work throughout, matching the plan's guidance.

`npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:2024`. The 500 new Uncommons (5 per new Rare, plus corresponding Commons eventually) were intentionally deferred — see `planning/IMPROVEMENTS-v147.md`.

### v147 — Phase 7 Uncommons (500 new seeds) + live-skill storage refactor (localStorage quota fix)
**Files changed:** `src/core/skills-data.js`, `src/core/skills-core.js`, `src/core/migration.js`, `src/core/state.js`, `sw.js`

`SKILL_LADDER_VER` bumped **115→116**. SW bumped to `operations-v147`. Total skills: **2524** (was 2024).

Wrote all 500 Uncommons feeding the 100 new Rares seeded in v146 (5 per Rare, 20 Rare clusters, one parallel subagent per cluster — 25 skills/agent, matching the v145-established SLOT-marker pattern). All 100 target `setKey`s confirmed with exactly 5 members via grep audit; 20 leftover marker comments cleaned up.

`npm run regress` then crashed on tab-click timeouts — not a code bug. Root cause: seeding a fresh save now threw `QuotaExceededError`. Measured directly: the live `S.lifeSkills` save had grown to ~5.0MB at 2,524 skills, and `localStorage` hard-caps around 4-5MB in this (and every mainstream) browser regardless of the origin's other storage quota. This wasn't purely a v147 problem — the v146 state (2,024 skills, ~3.9MB) was already close to the ceiling, and the next planned workstream (a Commons layer across 15 paths) would have blown through it regardless.

**Root cause:** every live skill object duplicated its seed's full static content — `why`, `whatYouDo`, `howTo`, `prep`, `recover`, `safety`, `roadmap`, `advance`, `maintain`, `tiers`, and the full level-ladder text — even though `SEED_SKILLS` already holds this and `skSeedOf(name, cat)` already existed to look it up. That duplication was affordable at ~1,700 skills (3.26MB) but not at 2,524 (5.0MB), and the user's stated goal is 10,000+ skills.

**Fix — live-skill hydration (`skHydrate`/`skHydrateAll` in `skills-core.js`):**
- `skSeedOf()` is now backed by a memoized `Map` (`name|cat` → seed), O(1) instead of the old `SEED_SKILLS.find()` O(n) scan — matters once SEED_SKILLS is in the thousands.
- `skHydrate(sk)` attaches **non-enumerable getters** for the 10 guidance fields plus `levels`, sourced live from the skill's seed. Property access (`sk.why`, `sk.levels[i]`, `sk.levels.length`, etc.) works identically to a plain value at every existing read site — zero changes needed across the ~50 call sites in `skills.js`, `today.js`, `trophies.js`, `test.js`, `auto-level.js`, `tree.js`, etc. `JSON.stringify(S)` (the `save()` call, and cloud backups) automatically skips non-enumerable properties, so this text is never written to `localStorage` again.
- Custom (non-seeded) skills are untouched — `skHydrate` no-ops when `sk.seeded` is falsy, so a user's own hand-authored ladder stays a real, editable, persisted field.
- `seedSkillsIfEmpty()` now builds minimal live objects (id/name/cat/parent/group/fadeDays/auto/progress fields only) and hydrates them, instead of copying the seed's static fields in.
- `mergeNewSeedSkills()` (migration.js) dropped its entire "backfill transparency copy + resync ladder/roadmap/advance/maintain/tiers on drift" block — guidance text can no longer go stale, since it's always resolved live. What's left: new-skill creation (minimal shape), currentLevel/peakLevel clamp-and-recover when a seed's ladder length changes, targetLevel backfill, and a final `skHydrateAll()` pass.
- Critically, `skHydrateAll()` **strips legacy literal fields from old (pre-refactor) saves** the moment they're hydrated, and reports whether it stripped anything so `mergeNewSeedSkills()` forces a `save()` even when nothing else changed — a save already sitting at the quota ceiling gets relief on its very next load, not whenever some unrelated edit happens to trigger a write.
- `save()` (state.js) now wraps `localStorage.setItem` in a try/catch with a toast fallback instead of throwing uncaught — a future quota overflow degrades gracefully instead of crashing the app.

**Verified (via Playwright + Node simulation, not assumption):** a fresh seed's `localStorage` payload dropped from ~5.0MB (over quota, crashing) to **0.51MB** — a ~90% reduction. Injected a synthetic pre-refactor save (bloated literal fields, stale 1-level ladder, real `currentLevel`/`peakLevel`/`history`/`targetLevel`/notes) and confirmed on reload: all progress fields survive byte-for-byte, the stale literal text is fully stripped from the stored JSON, and the getters resolve the correct, current seed content. `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:2524`.

**Next workstream:** the Commons layer (base tier, currently unwritten for all 15 paths) — now safe to build at any scale, since live saves no longer grow with SEED_SKILLS size.

### v148 — Attempted (and reverted): the legacy pyramid trees were already complete
**Files changed:** none, net — `src/core/skills-data.js` and `sw.js` were edited and then fully reverted within the same session. Total skills: **2524** (unchanged from v147).

This entry exists to record the investigation and a mistake, so a future session doesn't repeat it.

The session opened with `planning/IMPROVEMENTS-v148.md` claiming 30 missing Rares + 173 missing Uncommons (223 skills) across the 6 legacy Mythic trees. Re-deriving the audit directly from `SEED_SKILLS` (loading the file as a Node module, replicating the app's real `skRarity()` logic exactly, including the `joker`/`auto` exclusion and depth-based rarity fallback) showed the doc was stale: a round of "wire existing pre-pyramid skills into the pyramid via `setKey`" done earlier in this same uncommitted work (e.g. `Version control (Git)`, `SQL & databases`, `Critical thinking`, `Grip strength`, two dozen others) had already closed the claimed Uncommon gaps entirely and most of the claimed Rare gaps. That first correction (223 → 54 claimed-missing skills) was itself still wrong, for a second, more subtle reason caught immediately after: the audit script counted each Legendary's Rare-tier set by **true-Rare members only**, filtering out `joker`/`auto` skills (e.g. `Reaction speed`, `Cognitive / processing speed`, `Resting heart rate`) — but those Jokers were already legitimately occupying real slots in a 5-member set (2 Jokers + 3 authored Rares = 5 total, by original design). `skSetCanCombine()` requires **every** member of a set (Jokers included) to be individually mastered before a Legendary unlocks, and the project's own explicit rule states *"Sets must have exactly 5 members. If a set already has 5, an existing skill cannot be added."* Filtering out Jokers before counting made 5 already-complete sets (Processing Speed, Memory Mastery, Attentional Command, Mental Operations, Biometric Mastery) look short by 2 or 1 members, when they were not short at all.

**What happened before the mistake was caught:** wrote 9 new Rares + 45 new Uncommons against that wrong count, shipped it as `operations-v148` with a `FINISHED-FEATURES.md` entry, and reported it done. The user then asked a "why does grep show fewer rare/uncommon cards than a target count" question that led to a from-scratch total-count audit across *all* categories (not just the 6 originally in scope) — which is what surfaced both the true global card counts (408 rare / 2023 uncommon vs. a 16-Mythic-tree target of 400/2000) and, on asking "why am I over," the actual root cause: the 5 sets this session had just pushed from 5 members to 7 (or 6) each, accounting for the entire +9 rare-slot overage. `roots_r_integrity` (The Covenant, flagged as "1 more gap" using the same flawed joker-excluding count) was checked the same way and confirmed to already be a clean 5-member set too — never touched.

**Fix:** removed all 9 newly-written Rares and their 45 Uncommons via a brace-matched script-based removal (verified by name/setKey against the exact list written), confirmed via a full re-audit that every one of the 80 Legendaries across all cats (not just the original 6) has exactly 5 total slot-holder members (390 true-Rare + 10 Joker = 400) and every slot-holder's Uncommon set has exactly 5 members (2000 total) — a clean, complete 5/5/5 pyramid with zero gaps anywhere, including `roots` and every other path never mentioned in the original doc. Reverted `sw.js` back to `operations-v147` since the net shipped content is unchanged. `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:2524` (back to the exact v147 baseline).

**Lesson for future sessions:** when auditing a pyramid set's completeness, count **all** members of a `setKey` (`skSetMembers()`'s own definition — rarity-agnostic), never a rarity-filtered subset. "5 true-Rare cards" and "5 total slot-holders" are different, easily-conflated numbers, and only the second one is what the game's synthesis mechanics and the project's "exactly 5 members" rule actually care about. A duplicate `name`+`cat` sweep (see below) is necessary but not sufficient — a member-count sweep against `skSetMembers()`'s literal, unfiltered definition is what would have caught this immediately.

**Unrelated, still-real finding kept from this session's investigation (not fixed, out of scope):** a duplicate `name`+`cat` sweep across `SEED_SKILLS` found 10 pre-existing collisions unrelated to anything touched this session — e.g. `Cognitive Resilience` exists as both a `cog_r_synthesis` Rare and a `cog2_r_cog_resilience` Legendary; `Tax Strategy`/`Debt Management`/`Personal finance` are each duplicated between the first-gen `Financial Sovereignty` Legendary set and the second-gen `Wealth Architecture` one; similar duplicates exist in technical (`Cyber Operator`, `Threat Intelligence Analysis`, `Penetration testing methodology`, `Privilege Escalation`, `SIEM & Log Management`) and personal (`Legal literacy`). None break `npm run regress` (each skill is individually well-formed), but `skSeedOf(name, cat)`'s memoized Map means one of each pair silently shadows the other on lookup. Worth a dedicated audit-and-rename session (needs a `RENAMES` entry per rename to preserve any user's progress) — do not fix opportunistically mid-other-work.

**Separately, also found and left alone (cosmetic, not structural):** 9 pre-existing technical skills (`Linux / command line`, `Networking`, `Programming (Python/Java/JavaScript)`, `Cybersecurity fundamentals`, `DevOps / containerization`, `CTF / competitive security`, `Machine learning / AI fundamentals`) are wired as Uncommon-tier cards (their `setKey` feeds a Rare, e.g. `tech_u_linux_admin` feeds `Linux Systems Administration`) but have 8–10 level ladders, which trips `skRarity()`'s depth-based fallback and renders them with Rare-tier coloring in the UI despite sitting at the Uncommon layer structurally. Doesn't affect set-completion counts (their Uncommon-layer parent sets are still exactly 5 members), just a cosmetic mismatch. Fix would be either an explicit `rarity:"uncommon"` field or trimming their ladders to ≤7 levels — out of scope here, flagged for later.

### v149–v167 — Commons-layer workstream: all 16 Mythic trees' Commons layers built (10,000 new skills)

**Files changed:** `src/core/skills-data.js`, `sw.js` every session; `src/core/migration.js` in v155 only (see below). `SKILL_LADDER_VER` stayed at **116** throughout except one bump to **117** in v155 (see below); every other session in this span was a pure addition touching no existing ladder/guidance text.

**v149** was the prerequisite: every one of the pyramid's 2000 Uncommons needed its own unique, unshared Commons-tier `synthesizedFrom` key before any Commons content could be written. An audit found 6 Uncommons with no key at all and 10 keys shared by 2–5 Uncommons each (34 skills) — the same "only the first seed ever synthesizes" bug class fixed once before at the Rare/Uncommon tier. Fixed: 6 new keys assigned, all 34 collision-group skills split to unique keys. Verified 0 orphans, 0 collisions, exactly 2000 unique Commons feeder keys for exactly 2000 Uncommons.

**v150 through v167** (skipping v156, an unrelated FM-plan fix kept as its own entry directly below) then wrote all 16 Mythic trees' Commons layers, one full tree (625 skills = 125 setKeys × 5) per session, taking the skill count from 2524 to **12524** — 10,000 Commons skills across Physical Mastery, Keeper of the Flame, Tactical Mastery, Battlefield Commander, Vital Operator, Scholar-Warrior, Soldier Athlete, Sovereign Self, The Living Root, Warrior Foundation, Master of the Mind, Cyberspace Operations Officer, Staff Excellence, Cognitive Athlete, Life Architect, and Cyber Operator (final tree, v167). **v155** was a retroactive audit mid-arc (not a new tree) that found and fixed real defects predating the required-field validator introduced in v153 — a `fadeDays` typo in Tactical Mastery, 74 field-shape defects across 48 Keeper of the Flame skills (2–3-item `roadmap`/`maintain` arrays instead of the required 4), and 12 legacy Uncommon/Rare skills missing `howTo` entirely — which is why `SKILL_LADDER_VER` bumped to 117 there and nowhere else in this span.

**The standing execution process, hardened by real incidents as the arc went on:** pre-place `// SLOT:` markers for a tree's 125 setKeys, dispatch one subagent per 5-setKey group in small sequential waves, and independently verify every wave (never trusting an agent's own "done" report) with `node --check`, a member-count sweep, a marker-count sweep, a whole-file name+cat duplicate sweep, and — from v153 onward — a full required-field/array-length validator, plus — from v158/v159 onward — a duplicate marker/header-line sweep that also covers not-yet-dispatched groups, not just the just-finished wave's.

**Key incidents and lessons, roughly in the order they were learned (full detail lives in git history if ever needed again, not reproduced here):**
- **v150/v151:** account-wide session-limit cutoffs mid-wave are routine, not exceptional — always check for a syntactically-broken or partially-written state before assuming a wave completed.
- **v154:** two real file-corruption incidents — a script's truncating `open(path,'w')` zeroed the whole skills file (recovered via OneDrive version history), and even a safer "read → temp file → atomic rename" script pattern still lost an update to a concurrent writer. From here on, agents were told to strongly prefer the Edit tool (which does real staleness detection against the live file) over any script fallback, and wave concurrency was permanently capped at 2 agents — both held for the rest of the workstream with zero further corruption.
- **v161:** collision risk isn't limited to the 10 known pre-existing name+cat duplicates — two Mythic trees sharing the same `cat` are a real collision source too, once a same-cat sibling tree has already shipped. Whole-cat per-name grep discipline became mandatory for every subsequent same-cat tree (which, by the workstream's final third, was every remaining tree).
- **v162:** an agent's own confident self-report is not sufficient evidence — one agent claimed 5/5 on two setKeys that the independent post-wave count found at 4/5. Don't skip the independent count just because the summary sounds sure of itself.
- **v164 / v166:** the inverse lesson — an apparent shortfall or defect caught by the orchestrator's own check can be a stale read racing a concurrent write (v164) or a real defect the same agent was already self-correcting mid-task (v166). Re-check after a brief pause before dispatching a fix.
- **v165:** a single tree with high internal thematic density (concepts clustering tightly, e.g. Cognitive Athlete's fatigue/load/offloading/reframing skills) needs explicit sibling-*group* differentiation in agent prompts, not just a generic "don't duplicate" warning — generic warnings aren't precise enough to prevent near-miss overlap within one tree.
- **v167** (final tree): zero defects reached the orchestrator's independent validator uncaught — every wave had at least one agent self-catch and fix its own mistake first, the first tree where the standing self-verification instructions did all of the actual defect-catching.

**Final state, confirmed at every tree and reconfirmed at v167:** all 16/16 Mythic trees have complete, verified 5/5/5/5/5 Commons layers (Mythic → 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons each) with zero orphans; the whole-file name+cat duplicate count stayed at exactly the same 10 pre-existing pairs from v149 through v167, with zero new ones introduced by any of the 16 trees. `npm run regress` confirmed `PAGEERRORS 0`, `badCount:0`, `total:12524` at the close of v167. Mid-session at the very end of v167, Wyatt requested the GUI-revamp workstream that occupies the next span of entries below.

### v156 — FM plan: real warm-up + cool-down stretches for Sessions 1, 3, and 4

**Files changed:** `src/core/constants.js`, `src/tabs/plan.html`, `sw.js`

SW bumped to `operations-v156`. No `SKILL_LADDER_VER` bump (this touches `SESSIONS`, an entirely separate data structure from `SEED_SKILLS` with no migration mechanism tied to that version). Total skills unchanged at 5649 — this is FM training-plan content, not a skill-pyramid change.

Surfaced from real dogfooding: Wyatt did the actual Session 3 (Upper + Core, gym variant) workout and reported the FM tab had no before/after stretches, suspecting a bug. Investigation found it wasn't a rendering bug — `SESSIONS.s1`, `s3`, and `s4` (the three strength/circuit sessions) had genuinely never had any warm-up or stretch content authored, ever, while the coach-tip copy on those sessions' pages promised "the full how-to, warm-up, and stretches" regardless. Only `SESSIONS.s5` (the dedicated Mobility + Balance recovery day) had real stretch content.

**Fix:** added a `5-min easy cardio warm-up (don't stretch cold)` entry (prepended) and 3 session-appropriate static cool-down stretches (appended) to both the `bw` and `gym` variants of Sessions 1, 3, and 4 in `SESSIONS` (`src/core/constants.js`):
- **Session 1 (Lower + Push):** quad stretch, standing hamstring stretch, doorway chest/shoulder stretch
- **Session 3 (Upper + Core):** doorway chest/shoulder stretch, thoracic rotations + cat-cow, figure-4 glute stretch
- **Session 4 (AFT Circuit):** standing hamstring stretch, calf stretch, doorway chest/shoulder stretch

Deliberately reused the exact exercise name strings already established by Session 5 (e.g. `"Quad stretch (hold 30s ×2/side)"`) rather than inventing new ones — `exHowto()` (`src/core/training.js`) matches exercise names against `EX_HOWTO` by substring, so every new entry automatically resolves correct how-to text with **zero new `EX_HOWTO` entries needed**. Verified this directly: loaded `SESSIONS`/`exHowto` in a Node sandbox and confirmed all 64 exercises across the 6 modified session/variant combinations (s1/s3/s4 × bw/gym) resolve non-empty how-to text.

Also updated `src/tabs/plan.html`: each session's write-up intro now mentions the warm-up/cool-down, and the glossary section gained matching bullet entries for the new exercises (short descriptions that point to Session 5's glossary for the full version, matching the existing cross-reference pattern already used there, e.g. "Hand-release push-ups: (see Session 1)").

Verified: `node --check` on `constants.js` after edits, exercise counts confirmed correct (s1: 7→11, s3: 7→11, s4: 6→10, each ×2 for bw/gym), `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:5649` (unchanged, confirming no skill-pyramid side effects). `npm run package` → produced `dist/operations.zip`.

### v168 — GUI audit fixes: Chain view, Side Deck scale, tree mastery insignia, 5 cross-tab bugs

Skills tab / pyramid: Chain view was silently showing only the *first* Mythic tree per path via a `.find()` — fixed to show all of them (6 of 10 paths have two). Side Deck now groups unstarted skills by rarity tier and lazy-renders each tier's cards on first open, instead of dumping every unstarted skill (up to ~1500 per path) into one flat unpaginated list. Search now also matches unstarted skills sitting in unopened tiers, auto-expanding the match (previously it only ever matched started skills' already-rendered card text). Tree view: each world gained a ring of mastery-insignia studs that brighten as more of that world's pyramid content is mastered — this shipped before the leaf-crowding problem itself was found and fixed (v172); the studs sat on top of the still-crowded leaf swarm at this point.

Five bugs found via a full 18-tab audit: Profile's Commissioning Readiness AFT indicator always read "no record" (referenced a field, `S.aftHistory`, that never existed — real field is `S.aft`); Plan's "your priorities" card was hardcoded/stale instead of live; Board's Cyber-branch fact card rendered regardless of `S.branchGoal`; Dailies' "reset 0600" copy didn't match the actual midnight-reset logic; a stale AFT-specific comment sat over a genuinely shared time-parsing utility in `quizzes.js`. Also: `CLAUDE.md`'s tab layout table was missing `garden.html`/`.js` and `trophies.html`/`.js` (both fully wired, just undocumented).

sw.js → `operations-v168`. `SKILL_LADDER_VER` unchanged. `npm run regress`: `PAGEERRORS 0`.

### v169 — Consolidate Habits + Daily Orders into one unified daily-tasks list

Requested as part of the same GUI overlap audit as v168: Habits and Daily Orders were two parallel streak-tracking systems in the same tab with separate data structures and no shared logic. Merged into one array (`S.dailies`) with a `kind:"order"|"habit"` discriminator, one add form, one card style, one calendar/heatmap component. Every item now gets its own individual streak + one-time grace day (previously habits-only), and this finally activated Daily Orders' `best` field, which had been displayed but never actually updated by any code path before.

**A real near-miss caught before shipping:** an early version of the merge left habit items permanently failing an `every(d=>d.done)` check (a habit's "done today" signal is `lastDone===today`, not a `.done` flag), which would have made a perfect day unreachable forever the moment any habit existed. Caught via a full functional Playwright smoke test exercising both completion paths end to end, not just the regression suite. The master perfect-day/readiness/streak economy stayed scoped to `kind:"order"` items only — exactly matching pre-merge behavior, habits never counted toward it and still don't. Migration (`state.js` `load()`): `S.habits` merges into `S.dailies` once, idempotently, preserving every habit's streak/best/lastDone/graceUsed/history. Also: nav label "Orders" → "Tasks," and `garden` (found missing during the tab audit) added to `regress.js`'s tab coverage list.

sw.js → `operations-v169`. `SKILL_LADDER_VER` unchanged. `npm run regress`: `PAGEERRORS 0` across all 18 tabs.

### v170 — Pyramid-tree-first skills browsing (Mythic → Legendary → Rare → Uncommon → Common)

**Explicitly "the core piece of the GUI revamp Wyatt asked for"** (the commit's own words) — the piece v172 later re-diagnosed against without realizing it was already built. Skills within a path are organized around the actual authored pyramid structure instead of "did you start it, chunked into groups of 13." That old scheme organized ~700–1500+ skills per path by an arbitrary count with no information about what's inside each chunk, and directly caused the "can't see them" / "not laid out well" / "unlock mechanic isn't clear" complaints from the GUI audit.

New per-path structure: **Core Skills** (the ~2–7 legacy group-organized skills — Strength, Endurance, etc. — unchanged, own small section, later found fully redundant and removed in v171); **Pyramid trees** — one collapsed entry per Mythic tree (a path can hold two), opening to the Mythic's own card plus its 5 Legendaries, each opening to 5 Rares, each to 5 Uncommons, each to 5 Commons (the leaf tier, Combine button surfacing in context); **Custom skills** — whatever's left, kept on the old flat list (a fine fit at that much smaller scale). Every tier lazily rendered — a tier's children don't exist in the DOM until opened — for the same DOM-cost reason the Side Deck fix (v168) needed it. `skPyramidTrees(cat)` (`skills-core.js`) is a pure, memoized structural walk of `SEED_SKILLS`. Search extended to walk the pyramid tree and auto-open the full chain down to a match — verified via Playwright that an unstarted Common four tiers deep is correctly found and revealed.

Verified end-to-end via functional smoke tests (not just the regression suite): full 5-tier expansion on a 2-Mythic path (technical) and a single-Mythic path (physiological), and the Combine button correctly appearing after maxing all 5 Commons in a set.

sw.js → `operations-v170`. `SKILL_LADDER_VER` unchanged. `npm run regress`: `PAGEERRORS 0` across all 18 tabs.

### v171 — Remove duplicate Core Skills section from the skills tab

Wyatt asked whether Core Skills was still needed after seeing v170's new layout. Checked (not assumed): all 158 of its member skills — the legacy group-organized ones like Strength, Endurance, Foundations — are also independently reachable inside the Pyramid trees section via their own `setKey` chain, verified by walking every Mythic tree's full `setKey` graph, not just spot-checked. Every skill in Core Skills was rendering twice. Removed the section and its `groupCard()` rendering entirely; the underlying group/parent data model, `skRolledLevel()`, `skSubsOf()`, and `catRolledLevel()` (still used for path-level "Lv X" badges elsewhere) were untouched — only the duplicate card rendering is gone. Verified via smoke test that a formerly-grouped skill (Swimming) is still fully reachable through the Pyramid tree and search.

sw.js → `operations-v171`. `npm run regress`: `PAGEERRORS 0`.

### v172 — GUI revamp, session 1: skills-tab audit + fixes (Tree view crowding, Focus strip, pyramid explainer)

**Files changed:** `src/core/tree.js`, `src/core/skills-core.js`, `src/tabs/skills.html`, `src/tabs/skills.js`, `src/styles/main.css`, `scripts/regress.js`, `sw.js`, `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`.

> **Correction (added during the v173 session, once v168–v171 were backfilled above):** this entry's framing was wrong in two ways, caused by `NEXT-SESSION-PROMPT.md` having gone stale (it claimed "v167 current" when `sw.js` was actually already at v171). First, this wasn't "opening" the GUI-revamp workstream — v168/v170/v171 (see above) had already substantially executed the skills-tab piece of it, including the exact List-view pyramid restructuring this entry originally misattributed to v167 below. Second, the re-audit this session ran largely re-covered ground v168/v170/v171 had already settled, rather than picking up from where they left off. The tree-view crowding fix, Focus strip, and pyramid explainer below were genuinely new work either way — v168's tree-view change only added the mastery-insignia stud ring, it never touched the underlying leaf-crowding bug — but the "audit from scratch" framing itself was the redundant part.

Ran the audit-first pass `planning/IDEAS-gui-revamp.md` calls for: read `skills.html`/`skills.js` (List view), `tree.js` (Yggdrasil SVG view), and `skills-core.js` (pyramid mechanics) end to end before proposing anything, then checked findings against Wyatt's 4 named pain points.

**Root cause found for "I can not see them" (skill visibility):** `tree.js` was drawing every top-level skill in a category as an individual bough+leaf on the SVG — unstarted or not. The List view got a scale-appropriate rework in **v170** (lazy Mythic→Legendary→Rare→Uncommon→Common accordion — see the backfilled entry above), but the Tree view never did. With 700–1500+ top-level pyramid skills per Path, the tree tried to fan that many leaves around one realm disc on a fixed angular spread — they necessarily overlapped into an unreadable mess. This was a real rendering bug, not a vague complaint.

Brought findings + design options back to Wyatt via `AskUserQuestion` (per the project's standing feature-intake method) before touching any code. He confirmed: (1) the tree should show **only the ten worlds, no individual skill leaves at all** — each world lit up by how far its Path has progressed, a bigger simplification than the "started-skills-only" option offered; (2) a new combined **Focus strip** (decaying-soon + behind-target + ready-to-combine) visible by default, replacing the need to hunt for the right hidden toggle; (3) **one persistent short explainer** for how the Common→Uncommon→Rare→Legendary→Mythic pyramid unlocks; (4) the other 3 asks (visual refresh, nav restructuring, mobile) get their own session later — skills tab first. He also separately confirmed he likes the current List view's card/deck/pyramid layout as-is — nothing about that structure changed this session, only additions on top of it.

**Tree view (`tree.js`):** removed the entire per-skill bough+leaf rendering block (boughs, leaf circles, fade-decay rings, sub-skill fan-out) — the tree now draws only the 10 realm discs. Added `catProgressFraction(cat)` to `skills-core.js` (sum of every leaf's effective level ÷ sum of every leaf's max level in that Path, 0–1) — unlike the pre-existing `catPyramidCompletion` (which only credits a skill once fully mastered), this moves with any partial progress, which is what "lit up by how far along" needed. Each realm disc now dims toward black at 0% progress and reads fully luminous at 100%, with the halo glow's radius/opacity scaling the same way; the existing rim-stud mastery ring (driven by `catPyramidCompletion`, a stricter "fully mastered" signal) was kept as a separate, complementary indicator. Tapping a world now navigates to that Path's deck in the List view (previously tapped individual leaf → individual skill card, which no longer exists). Verified visually via `npm run regress -- --shot` — ten clean, evenly-spaced glowing worlds, no crowding.

**Focus strip (`skills.js`/`skills.html`):** new `renderFocusStrip()`, always visible above the toolbar (not a toggle) — three compact columns (Decaying soon, Behind target, Ready to combine) built from data that already existed (Weekly Queue's fade logic, Assessment's gap logic, and a new `skReadyToCombine()` in `skills-core.js` that walks `SEED_SKILLS` for fully-masterable-but-not-yet-combined sets). The existing Weekly Queue/Assessment/Gap Map toggles were left in place, untouched, for users who want the fuller detail — this is additive, not a replacement.

**Pyramid explainer:** a single collapsed `<details>` near the top of the Skills tab, plain-copy explanation of the 5-tier Common→Mythic synthesis mechanic and the Combine button — collapsed by default per Wyatt's "no hand-holding elsewhere" preference.

**Test-infra fix (unrelated latent bug, found while verifying):** `scripts/regress.js --shot` was selecting the tree-view screenshot target via `document.querySelectorAll("button").find(x => /tree/i.test(x.textContent))` — this matched the sidebar's "🌳The Tree" nav button (the Skills tab's own nav label) before ever reaching the actual List/Tree view toggle, since it's earlier in DOM order. Confirmed via a direct-click debug script that `tree.js`'s new code renders correctly with zero page errors; the crash was purely a bad selector, pre-existing and unrelated to this session's tree changes. Fixed to click `#skViewTree` directly.

SW bumped to `operations-v172`. `SKILL_LADDER_VER` unchanged at **117** (no ladder/tier/guidance text touched). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run regress -- --shot` → clean tree screenshot. `npm run package` → produced `dist/operations.zip`.

**Next:** the rest of the GUI revamp (visual/theme refresh, layout/nav restructuring, mobile/responsive overhaul) is still queued and unscoped — its own dedicated session, per Wyatt's confirmed sequencing.

### v173 — TOC data bridge: persistent save data across origins/reinstalls via TOC (Phase 7 on TOC's side)

**Files changed (this repo):** `src/core/app-setup.js`, `src/core/state.js`, `sw.js`, `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`. **Files changed (TOC's own repo, `C:\Users\wyatt\Files\Projects\TOC`):** `backend/registry.py`, `backend/projectdata.py` (new), `backend/app.py`, `config/projects.yaml`, `config/projects.example.yaml`, `BRIEF.md`, `CLAUDE.md`, `PHASE_7_NOTES.md` (new), `tests/test_registry.py`, `tests/test_projectdata.py` (new), `tests/test_data_routes.py` (new), `tests/test_app.py`, `tests/test_vows.py`.

Wyatt asked for TOC (a separate personal project — an offline desktop app that runs/serves/views his other local projects, including this one) to give Operations more durable, cross-device save persistence than the plain web version or the installed Chrome PWA. Root cause investigated first, not assumed: TOC serves Operations from its own loopback origin (`127.0.0.1:8081`), a different browser origin from Operations' normal hosted URL — so `localStorage` genuinely doesn't carry over between them; that's the real gap behind "more persistent than the web/Chrome version."

**Design surfaced two real constraints before any code was written** (both projects have their own `CLAUDE.md` hard rules): TOC's static host is deliberately read-only (`hostserve.py` hard-rejects every HTTP verb but GET/HEAD) and TOC's own stated principle is "never mutate another project." Brought the landscape back to Wyatt via `AskUserQuestion` rather than picking a mechanism unilaterally. He chose a `pywebview` JS↔Python bridge over reusing Operations' existing browser-native cloud-file-sync feature (already in `app-setup.js`, unrelated/untouched by this work), and asked for the save file to live **both** inside the Operations repo itself and in whatever OneDrive file the existing cloud-file-sync already uses — i.e. redundant, not either/or.

**Investigated TOC's actual code before implementing the chosen mechanism, and it changed the plan for the better.** TOC's "tabs" turned out to be a single sandboxed `<iframe>` in one shell page (`src` swapped per tab), not separate windows — so a direct `window.pywebview.api` call from Operations' JS (running in that iframe, a different origin from the shell page pywebview actually renders into) was never reachable without a `postMessage` relay. But TOC's shell doesn't use `js_api` at all — its entire existing architecture is a real FastAPI backend (`127.0.0.1:8799`) the shell talks to over plain `fetch()`. Flagged this back to Wyatt (a legitimate complexity change to the approach he'd already picked, not a new open question) and got confirmation to proceed with the simpler, more idiomatic path: one new pair of CORS-scoped HTTP routes on TOC's existing backend, called directly via `fetch()` from Operations' own JS — no relay, no bridge, matching every other route TOC already has.

**TOC's side (Phase 7 there — see that repo's own `PHASE_7_NOTES.md` for full detail):** a new opt-in `data_bridge: true` registry field (only valid on `web`/`serve` kinds — needs a declared origin to trust); a new `backend/projectdata.py` module that reads/writes `<project path>/personal/toc-save.json` **inside the project's own folder**, never TOC's `config/`; new `GET`/`POST`/`OPTIONS /api/projects/{id}/data` routes, CORS-scoped only to that one project's own origin. TOC's own `test_vows.py` (a meta-test enforcing that only an explicit allow-list of modules may write to disk) caught `projectdata.py` automatically on first run — added deliberately, not bypassed, with its own carve-out sentence in the guard comment. Operations opted in (`data_bridge: true` in TOC's `config/projects.yaml`). 243 tests passing, ruff + mypy clean on TOC's side.

**A live-verification pass caught a real cross-origin wrinkle:** Operations needs to probe "is TOC even running?" (`GET /api/health`) before it knows what origin it's calling from — that pre-existing route had no CORS header, so every page load without TOC running would still log a red CORS/network console error even though the failure was harmlessly caught. Confirmed live with a throwaway Playwright script under `file://` before AND after the fix (there's a real TOC instance running on this machine day-to-day, which made this reproducible against the genuine article, not just a mock). Fixed with a deliberate, narrow wildcard `Access-Control-Allow-Origin: *` on `/api/health` specifically — safe because that endpoint returns nothing sensitive and its whole purpose is being probeable by anything — while the actual data routes stay tightly scoped per-project. Note: the TOC instance already running on this machine (started this morning, unrelated to this session) is still serving its pre-fix code — Python doesn't hot-reload a running process — so it needs a restart before today's TOC-side changes take effect. Left running rather than force-killed, since it's Wyatt's own active window.

**Operations' side (`app-setup.js`):** a new "TOC DATA BRIDGE" section, same file as the pre-existing cloud-file-sync it sits beside. `tocInit()` does a best-effort loopback health probe (`AbortSignal.timeout(800)`, silently no-ops if TOC isn't reachable — the common case for anyone not running TOC); if TOC responds, adopts its saved data the same way `cloudInit()` already adopts a linked cloud file, and runs strictly **after** `cloudInit()` (`cloudInit().then(tocInit)`) so TOC — framed as the most-persistent source — wins if both a cloud file and TOC are present and they've diverged. `tocWriteDebounced()` hooks into `state.js`'s existing `save()` alongside the pre-existing `cloudWriteDebounced()` — both fire on every save, independently, matching Wyatt's "more than one location can't hurt" answer. Footer status text (`setCloudStatus()`) extended to name every active sync target ("synced to your linked cloud file & TOC") instead of just the cloud file, so this is never a silent/hidden capability.

SW bumped to `operations-v173`. `SKILL_LADDER_VER` unchanged at **117** (no ladder/tier/guidance text touched). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`. TOC's own `python -m pytest -q` → **243 passed**, ruff + mypy clean.

**Next:** restart the already-running TOC instance to pick up today's changes, then confirm live end-to-end (open Operations through TOC, make a change, confirm `personal/toc-save.json` appears in this repo and syncs via OneDrive to another linked machine). The GUI revamp (visual/nav/mobile) from v172 is still queued and unaffected by this session.

### v174 — GUI revamp, session 2: mobile nav restructuring (bottom bar + drawer) + a light visual-polish pass

**Files changed:** `src/_shell.html`, `src/core/events.js`, `src/styles/main.css`, `sw.js`, `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`.

The genuinely-undone remainder of the GUI revamp (visual/theme refresh, layout/nav restructuring, mobile/responsive overhaul — items 1–3; item 4, the skills tab, was done across v168/v170/v171/v172, see the backfill above). Audited current state first: the dark Yggdrasil theme is already coherent and intentional (wood-grain layered background, a full OD-green/tan/ember/blood/violet CSS-variable palette, a condensed military font stack) — not a blank slate. The concrete, non-vague problem found was in nav: on mobile (≤560px) the sidebar rail turned into a single unpaginated horizontally-scrolling strip holding all 18 tabs, with the desktop "More" grouping disabled entirely at that width.

Brought findings back to Wyatt via `AskUserQuestion` before touching anything: (1) visual — **light polish only**, keep the existing identity, don't redesign; (2) mobile nav — replace the scrolling strip with a **bottom tab bar + slide-up drawer**, the standard mobile-app pattern; (3) priority — roughly even across the three asks, engineering-sensible order (visual → nav → mobile, since mobile nav depends on the nav split anyway).

**Mobile nav (`_shell.html`/`events.js`/`main.css`):** added a 4-tab bottom bar (Dawn, Tasks, Oaths, Tree — the most re-visited tabs, a judgment call not re-confirmed with Wyatt since it's a low-stakes, trivially-adjustable choice) plus a Menu button opening a slide-up drawer grid with the other 14 tabs. The new buttons reuse the exact same `<button data-tab="...">` elements' `class="tabs"` so the existing click-delegation (`document.querySelectorAll("nav.tabs button[data-tab]")`) picks them up for free — no new binding logic needed, just one fix to keep duplicate copies of the same tab in sync on the `.on` (active) class, since a click now needs to mark every copy of that `data-tab`, not just the one instance tapped. `#sideNav` is hidden entirely on mobile now (previously it collapsed into the horizontal strip); the drawer auto-closes on any tab tap or backdrop tap.

**A real CSS specificity bug found via screenshot, not assumed working:** the first pass used plain class selectors (`.mobile-bar`, `.mobile-drawer-panel`) to override `nav.tabs`/`nav.tabs button`'s base flex layout — but `nav.tabs` (element+class) is *more specific* than a bare class selector, so most of the override properties (display mode, width, padding, background) silently lost per-property, rendering as a vertical stack of full desktop-sized card buttons overlapping the page instead of a slim bottom bar. Caught by actually screenshotting the result (Playwright, 375×700 viewport) rather than trusting the CSS looked right — fixed by bumping every override to `nav.tabs.mobile-bar`/`nav.tabs.mobile-drawer-panel` (element+2 classes, safely more specific). A second, smaller visual bug in the same screenshot pass: the floating quick-add `+` button (`z-index:900`) rendered on top of the open drawer (`z-index:55`) since they're DOM siblings-of-different-parents, not nested — fixed by dropping the button's z-index below the drawer's specifically on mobile widths (safe when the drawer's closed too, since `visibility:hidden` paints nothing regardless of stacking order). Re-verified both with fresh screenshots after the fix.

**Functional verification (Playwright, not just visual):** at a 375px viewport — `#sideNav` correctly hidden, bottom bar visible, drawer starts closed; tapping a bottom-bar tab switches the view and marks it active; opening the drawer and tapping a drawer-only tab switches the view *and* auto-closes the drawer; reopening and tapping the backdrop closes without navigating. Zero console/page errors throughout.

**Visual light-polish pass:** kept narrow and objective rather than a subjective sweep — `nav.tabs button` (the single most-clicked element in the app) had *no hover state at all*, only the active tab had any visual treatment. Added a subtle border/color hover, `:not(.on)` so it doesn't fight the active-tab gradient.

**Flagged, not fixed (out of the confirmed "light polish" scope):** `_shell.html` links Google Fonts (`fonts.googleapis.com`) for Oswald/Roboto Condensed — a real, pre-existing tension with `CLAUDE.md`'s own hard rule 3 ("no external fonts/CDNs... must keep working with no internet"). It degrades gracefully (the font-family stack falls back to system fonts if the fetch fails) but still fires an external network request on every load. Fixing it properly means self-hosting the same two open-source (OFL-licensed) font files rather than dropping them (dropping would be a visible identity change, out of scope for "light polish, don't redesign"). Left for Wyatt to decide whether/when to do that vendoring pass.

SW bumped to `operations-v174`. `SKILL_LADDER_VER` unchanged at **117** (no ladder/tier/guidance text touched). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** the visual/theme refresh (beyond the one hover-state fix) and any further nav restructuring are still open — Wyatt's answers scoped this session specifically to the mobile-nav pain point plus "light polish," not a full pass through all three. The Google Fonts CDN flag above is unresolved. After the GUI revamp fully wraps, `planning/IDEAS-tests-fm-workouts.md`'s confirmed 8-phase FM/test-features build is next in line.

### v175 — Phase X-Timeline: unified cross-tab "Upcoming" view

**Files changed:** `src/tabs/today.js`, `src/styles/main.css`, `sw.js`, `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`.

First phase of `planning/IDEAS-tests-fm-workouts.md`'s confirmed 8-phase build order (**X-Timeline → X-AAR → FM-1 → FM-2 → X-Insight → T → FM-3 → X-SmartFocus**) — that doc noted it was gated behind the pyramid Commons workstream wrapping, which finished long ago (v167), so this was the genuinely-next thing to build. Fully designed already in the doc (idea D / Phase X-Timeline), no open questions, so this went straight to implementation rather than another audit-and-ask round.

**What was actually found vs. what the doc assumed:** the doc (written 2026-07-03) described the gap as "each tab manages its own dates in total isolation, no merged view anywhere." By now, `today.js` has grown substantially and already surfaces *several* of these dates individually — quest due-within-7-days, overdue-oath count, a milestone progress bar, qualification-expiry alerts, counseling follow-up alerts, and an AFT-test-date nudge all exist as separate, differently-styled Field Notes entries. So the real gap by v175 wasn't total absence — it was the lack of *one unified, chronologically-sorted* view. Built `renderUpcomingTimeline()` as a new read-only aggregation (no new data model, matching the phase's own "Size: small-medium" scoping): merges quest `.due`, boss `.targetDate`, `S.aftTestDate`, milestone `.date`, qualification `.expires`, and counseling `.followUp` into one sorted list, forward-looking only (deliberately excludes already-overdue items, which already get top billing via Warrior's Focus / the overdue-oaths count elsewhere on the same tab). Checked `awards.js` for "dated award/event entries" per the doc's scope — confirmed those dates are all retrospective ("added" dates, not upcoming ones), so nothing to pull from there.

**Known, deliberate overlap — not fixed this session:** since the existing scattered indicators (milestone bar, qual/counseling alert cards, the quest-due-soon Field Notes row, the AFT-test-date row) were left in place rather than removed, the same date can now appear in both the new Upcoming card and its original spot. The phase's own scope was "a cross-tab read + merge + render," not a refactor of already-shipped, tested UI — removing/consolidating those is a real UX judgment call (e.g. the milestone bar's progress-fill visual doesn't translate to a flat list row) that wasn't asked for, so it's flagged here for Wyatt to decide rather than done unilaterally.

**A real, unrelated environmental problem surfaced while verifying, not a code bug:** `npm run regress` hung repeatedly (`page.goto`/`page.reload` never reaching `networkidle`/`load`). Diagnosed rather than assumed: extracted the *last-committed, already-shipped* `index.html` and loaded it standalone — it hung identically, proving the cause was system memory pressure (4.6GB free of 31.5GB at the time), not this session's changes. Surfaced to Wyatt directly rather than guessing at a fix or shipping unverified; he freed up memory and the suite passed cleanly on a subsequent retry (after one more transient timeout).

SW bumped to `operations-v175`. `SKILL_LADDER_VER` unchanged at **117** (no ladder/tier/guidance text touched). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`. A visual screenshot check was skipped (not part of the required definition of done) since the system was still under load after the regress pass succeeded — worth a manual look next time the app's open.

**Next:** Phase X-AAR (After-Action-Review journal, idea C) is next in the confirmed build order — a new structured reflection entry type in `records.js`, small-medium, zero dependencies. The deliberate Upcoming/existing-indicator overlap noted above is an open decision, not a blocker.

### v176 — Declutter: resolve the Upcoming/existing-indicator overlap from v175

**Files changed:** `src/tabs/today.js`, `src/styles/main.css`, `sw.js`, `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`.

Wyatt asked to resolve the duplication v175 deliberately left open. Removed the pieces the new Upcoming card fully superseded: the milestone progress-bar section (`milestoneHtml`), the quest-due-within-7-days Field Notes row, and the AFT-test-date Field Notes row — all forward-looking-only and now strictly covered by Upcoming. Removed the now-dead `.milestone-bar-wrap`/`.milestone-bar`/`.milestone-bar-fill`/`.milestone-bar-label`/`.milestone-dawn`/`.ms-pill` CSS (confirmed dead via a repo-wide grep before deleting — the separate `.milestone-date`/`.milestone-label`/`.milestone-when`/`.milestone-del` rules for the actual milestone-management list elsewhere were left alone, different UI).

The qualification-expiry and counseling-follow-up alerts weren't fully redundant — each covered both upcoming *and already-overdue* items, and Upcoming deliberately excludes overdue (that's Warrior's Focus / the overdue-oaths count's job). Trimmed both to overdue-only rather than deleting them outright: `qualAlertHtml` now shows only expired qualifications, `cnAlertHtml` only past-due follow-ups, headers reworded accordingly ("Counseling Follow-Up Overdue"). Net result: Upcoming owns everything forward-looking across all 6 sources; the two trimmed alerts plus the pre-existing overdue-oaths count own everything already past due; no date now appears in two places.

Verified with a functional Playwright smoke test seeding one future + one past item in each of quals and counseling: confirmed the milestone bar is gone, the overdue alert fires only for the past item, and the future item is correctly absent from the overdue alert (present in Upcoming instead).

SW bumped to `operations-v176`. `SKILL_LADDER_VER` unchanged at **117**. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** Phase X-AAR (After-Action-Review journal, idea C) — no more open decisions blocking it.

### v177 — Phase X-AAR: After-Action Review journal

**Files changed:** `src/core/constants.js`, `src/core/state.js`, `src/tabs/records.js`, `src/tabs/records.html`, `src/tabs/today.js`, `src/tabs/awards.js`, `src/core/app-setup.js`, `src/styles/main.css`, `sw.js`.

Second phase of the confirmed FM/test-features build order (idea C). New `S.aarLog` array, distinct from the existing free-text counseling log per the doc's explicit requirement — a real AAR structure (planned / actual / why / sustain / improve), not another notes field. Modeled the implementation directly on the counseling log's existing pattern (`renderCounsel`/`_cnAdd`/`data-cndel` in `awards.js`'s delegated click handler/`SECTIONS` JSON export config/CSV export) rather than inventing a new one, since that pattern was already right for this shape of data.

**Contextually promptable, per the doc's "ideally" qualifier:** a new `aarNudgeHtml()` on the Dawn tab fires after the two triggers the doc names — a broken streak (reusing the same `S.streak===0 && S.streakBrokenDate` condition the existing recovery-mode card already checks) or a below-standard AFT score (reusing the pass/fail threshold already computed elsewhere in `today.js`). Suppressed once an AAR has been logged in the last 3 days, so it prompts without nagging after the user's actually written one.

Verified through the real UI, not just internal function calls: a Playwright test opened the Records tab (had to expand the desktop "More" section first — `records` is a secondary nav tab, hidden by default), filled and submitted the actual `#aarAdd` form, confirmed the entry landed in `S.aarLog` and rendered correctly, then confirmed the Dawn nudge appears when a break is simulated and correctly suppresses once a recent AAR exists.

SW bumped to `operations-v177`. `SKILL_LADDER_VER` unchanged at **117**. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** Phase FM-1 (gym-schedule-aware planning + guided mock-AFT flow, ideas #2/#2b) — medium-large, the design has no remaining open questions per the doc, zero dependencies.

### v178 — Phase FM-1: gym-access-aware weekly training scheduling + guided mock-AFT walkthrough

**Files changed:** `src/core/constants.js`, `src/core/state.js`, `src/core/training.js`, `src/tabs/plan.js`, `src/tabs/plan.html`, `src/tabs/aft.js`, `src/tabs/awards.js`, `src/_shell.html`, `src/styles/main.css`, `sw.js`.

Third and largest phase of the confirmed FM/test-features build order (ideas #2/#2b). Replaced the entire fixed `WEEK_PLAN` schedule in `training.js` with dynamic, gym-access-aware assignment. New `S.gymAccess` (`{default, weekOf, week}`) and `S.gymAccessLive` model a 3-layer cascade for "do I have gym access on day X": a live same-day override beats a confirmed pattern for the current week, which beats a saved default pattern. `assignWeekSessions()` sorts each week's gym-access vs. non-gym-access days into equipment-heavy sessions (lifting, the AFT circuit) vs. runs/mobility, preferring gym days for the former; Sunday stays a fixed rest day as before. `planForDay()`, `pickRunIndex()`, and `sessionEx()` were all rewired onto this instead of the old static day-of-week table.

Added `pickAftMode()` — decides mock/practice/circuit for AFT-circuit days by reusing existing signals (`recoveryReadiness()`, AFT history, `S.aftTestDate`) rather than adding new tracking: not recovered → circuit; within 14 days of a declared test date, or 45+ days since the last logged AFT → full mock; otherwise → single-event practice on the weakest event.

Built the guided mock-AFT walkthrough end-to-end in `aft.js`: a uniform stopwatch UI across all 5 scored events (deadlift has no timer — it's a weight entry, not a timed event) feeding the same `score_dl/hrp/sdc/plank/run()` functions the manual `aftSave()` form already uses. **Honesty-driven design decision:** "mock" (full 5-event) mode pushes a real `S.aft` history entry, same shape as `aftSave()`'s (`source:"mock"`); "practice" (single-event) mode shows an ephemeral score toast only and does **not** save an `S.aft` entry — a one-event result read as a full AFT "total" would misrepresent the other four events as zero, which this app's no-faked-metrics rule doesn't allow.

**Caught before shipping:** the mock-AFT trigger buttons render inside a string returned by `dawnSessionHtml()`/`renderCoachToday()` that becomes part of a larger `innerHTML` assignment in `today.js`/`plan.js` — an initial `id`+`.onclick` wiring attempt would have silently no-op'd, since nothing re-queries that specific ID after the bigger `innerHTML` set. Fixed by switching to `data-mockaft="mock"|"practice"` plus the existing global click-delegation handler in `awards.js`, the same pattern already used for `data-gototab`/`data-cndel`/etc.

New `#gymAccessArea` UI on the Plan tab (day toggles, confirm-this-week / save-as-usual-pattern actions, a live week preview showing which session lands on which day, and a "today specifically" live override) replaces the old static, now-factually-wrong "Your 7-day plan" table in `plan.html` with prose describing the dynamic system.

Verified well beyond the standard regress suite, per the doc's explicit testing note: a throwaway Playwright script exercised zero-gym-day, all-seven-day, and same-day live-override patterns (confirmed `assignWeekSessions`/`gymAccessForDate` never throw and behave correctly at each extreme), the gym-access UI (toggle → confirm → persisted `S.gymAccess.week`), a full 5-event mock AFT run (confirmed exactly one new `S.aft` entry with `source:"mock"` and correct scores), practice mode (confirmed **zero** new `S.aft` entries), and the timer's start/stop/elapsed mechanics on a timer-bearing event. Script deleted after use per the repo's scratch-file convention.

SW bumped to `operations-v178`. `SKILL_LADDER_VER` unchanged at **117** (no ladder/tier/guidance text touched). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress -- --shot` → `PAGEERRORS 0`, `total:12524`, `badCount:0` (screenshot taken since the weekly plan render layout changed). `npm run package` → produced `dist/operations.zip`.

**Next:** Phase FM-2 (equipment inventory + exercise tagging, idea #3) is next in the confirmed build order, followed by X-Insight, T, FM-3 (not build-greenlit without re-confirmation), and X-SmartFocus — start only when explicitly asked, per this workstream's established pattern of gating each phase on the user's go-ahead.

### v179 — Phase FM-2: equipment inventory + exercise pools (idea #3) — scope expanded live during the build

**Files changed:** `src/core/constants.js`, `src/core/training.js`, `src/core/state.js`, `src/tabs/plan.js`, `src/tabs/plan.html`, `src/tabs/awards.js`, `src/core/events.js`, `src/styles/main.css`, `sw.js`, `planning/IDEAS-tests-fm-workouts.md`.

Fourth phase of the confirmed FM/test-features build order (idea #3). Started as the doc's original scope — replace `hasGym` with named equipment profiles, tag the exercise library — then grew substantially through live requests mid-session, each handled by asking rather than guessing or quietly cutting scope:

1. **"Build the full spec as designed" (not the right-sized two-profile version)** — asked directly since the original spec (a graded equipment matrix + pooled selection) was written before Wyatt resolved the real-world need down to exactly two binary profiles; he chose the full spec.
2. **Real variety + swim/rock-climbing + Wake Forest research** — asked for genuine day-to-day exercise variety (not just equipment fallback), optional swim/climbing days, and research into what a Wake Forest ROTC cadet actually has access to. Researched Wake Forest's Wellbeing Center (Reynolds Gym + Sutton Center) via web search and **confirmed** a real weight room, pool + whirlpool, and climbing/bouldering wall — not assumed. For the ROTC-trailer side (no public battalion inventory exists to check against), asked Wyatt directly rather than fabricating one; he confirmed a full AFT-event kit, water jugs, and a weighted stretcher, and explicitly OK'd seeding common ROTC PT-trailer gear (ruck, sandbag, tires, agility ladder, battle ropes) as placeholders, honestly flagged `unverified` in the UI, rather than leaving them out.
3. **Adaptive rep/set/weight suggestions that learn over time** — recognized as a genuinely large, undesigned capability (the same small-N-honesty problem already flagged for the future X-Insight phase), so it was **not** built half-designed under time pressure. Instead: a first honest, non-adaptive step shipped now (see below), and the real ask was written up as a new deferred phase, **FM-Adapt**, in `IDEAS-tests-fm-workouts.md`, so it isn't lost.

**What actually shipped:**
- `EQUIP_TAGS` (`constants.js`) — a 19-tag taxonomy, each tag traceable to either the Wake Forest research or Wyatt's direct trailer confirmation (or explicitly marked `unverified` placeholder). `S.equipProfiles` (named, user-editable, add/rename/delete) replaces the flat `S.hasGym` boolean; seeded with Wyatt's two real situations, "ROTC/Campus Gym" (all tags) and "Dorm" (none). `S.activeEquipProfile` is the one currently in effect.
- **Exercise slots became real multi-variant pools**, not a fixed bw/gym pair — `SESSIONS[skey].alt` adds extra tagged variants per slot (ROTC-trailer carries/drags: water-jug carry, weighted-stretcher carry/drag, plus a few common-gear alternates) alongside the existing bw/gym entries, all now tagged `eq:[...]`/`m:[...]` (equipment + primary muscles). `sessionSlotPool()`/`sessionExForProfile()` in `training.js` filter each slot's pool to what the active profile's tags actually support, then pick one **deterministically per day** (`hashStr`-seeded, same mechanism as the existing daily skill-card shuffle) — equipment-fallback and day-to-day variety are the same mechanism by design, not two separate systems.
- **"Suggest one, let me choose if I disagree"** — `exSwapHtml()`/`toggleExSwap()` in `plan.js` add a "🔀 swap" affordance to any exercise with more than one equipment-eligible pool member, on both the pick-one (run) and all-exercises (strength/circuit) coach-card branches; picking an alternate calls `setExerciseChoice()`, which persists a per-day override in `S.exChoice` that every downstream consumer (Dawn card, Coach card, Log tab's pre-filled workout) already honors for free, since they all resolve through the same `sessionExForProfile()`/`sessionEx()` path.
- **Swim and Rock Climbing** — two new `optional:true` session types in `SESSIONS`, gated by the `pool`/`climbwall` equipment tags and an explicit per-session opt-in (`S.optionalSessions`, toggled in the new Equipment Profiles card). The weekly scheduler never auto-assigns them; `optionalSessionSuggestions()` only surfaces them as a dismissible coach-card suggestion on a day the active profile genuinely unlocks them.
- **A first honest weight suggestion** — `lastLoggedWeight()` (`training.js`) reads your own most recent logged weight for that exact exercise straight from `S.workouts`; `prescriptionFor()` now appends it for weighted exercises ("last logged: 95 lbs — repeat it, or add a little if every rep felt easy" / "no logged weight yet — start conservative..."). Explicitly **not** adaptive — it doesn't read difficulty ratings or learn — that's the deferred FM-Adapt phase.
- Removed the old `#gymToggleBtn`/`S.hasGym` toggle (`events.js`, `plan.html`) entirely, replaced by the new Equipment Profiles card; `hasGym` stays in `DEFAULT` only so old saves still validate. Fixed two now-stale `EX_HOWTO` keywords (`"rower or bike interval"`, `"cable / barbell row"`) that would have silently stopped matching once their source exercise names changed, and added entries for every new alt/pool/swim/climb exercise — no exercise in the app is missing its honest how-to text.

Verified well beyond the standard regress suite, across two throwaway Playwright scripts (deleted after use): pool selection against rich/empty/trailer-only equipment-tag sets (confirmed the right variant wins in each case, including the ROTC-trailer carry/drag alternates); the Equipment Profiles UI end-to-end (switch active profile, edit tags, create/rename/delete a profile); the reference library reflecting the active profile; optional-session opt-in gating (disabled until the profile has the right tag, enabled after); the weight-suggestion text with and without logged history; and the swap+override UI (opened the alt panel on a rich-profile gym day, picked a non-suggested variant, confirmed `S.exChoice` was set and every render path picked it up).

SW bumped to `operations-v179`. `SKILL_LADDER_VER` unchanged at **117** (no ladder/tier/guidance text touched). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress -- --shot` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** Phase **FM-Adapt** (the deferred adaptive rep/set/weight auto-regulation ask — needs its own design pass before any code, same caliber as X-Insight) now sits in the confirmed build order right after FM-2, ahead of X-Insight/T/FM-3/X-SmartFocus. Start only when explicitly asked; FM-Adapt specifically should open with a design pass, not straight into implementation.

### v180 — True dynamic warm-up / static cool-down stretches (unplanned, mid-workstream correctness fix)

**Files changed:** `src/core/constants.js`, `src/core/training.js`, `src/tabs/plan.js`, `src/tabs/plan.html`, `src/styles/main.css`, `sw.js`.

Not part of the confirmed FM-doc build order — Wyatt asked directly, mid-session, to fix something real: every session's "warm-up" and "cool-down" were the exact same few hand-duplicated static stretch lines (Quad stretch / Standing hamstring stretch / Doorway chest-shoulder stretch, near-verbatim, opening AND closing several sessions), and Session 2 (Run) had **no cool-down at all**. That also quietly contradicted the app's own stated rule elsewhere in its copy — "never static-stretch cold muscles" — since a held stretch was literally the first thing several sessions did.

**The real fix, not a relabel:** new `STRETCH_LIBRARY` in `constants.js` — 13 dynamic entries (leg swings, walking lunges, arm circles, cat-cow flow, high knees, inchworm, hip/ankle circles, World's-greatest-stretch, band dislocates, foam-rolling) and 15 static entries (the existing quad/hamstring/hip-flexor/calf/chest stretches plus new cross-body shoulder, lat, triceps, child's pose, spinal twist, wrist/forearm), each tagged with real muscle groups (`m:[...]`) and, where relevant, required equipment (`eq:[...]`, e.g. band dislocates need `bands`). New `AREA_MUSCLES` maps each session's existing coarse `areas` (legs/push/pull/core/cardio/mobility/balance) to the fine-grained muscle vocabulary. `warmupStretchesFor()`/`cooldownStretchesFor()` in `training.js` pick a temperature-raise plus 3 dynamic moves before, and 3 muscle-matched static holds after, for whichever muscles that specific session actually works — composed inside the existing `sessionExForProfile()` equipment-pool pipeline, so the daily seeded-variety mechanism and equipment-profile gating (FM-2) apply to stretches automatically, not as a separate system.

**Session 5 (Mobility + Balance) was rebuilt around the same library** (`flexFromLibrary` flag) instead of maintaining a third hand-copy of the same stretch descriptions — its flexibility block is now literally every static entry in `STRETCH_LIBRARY` the active equipment profile supports, directly delivering "the stretches can also double as flexibility work" rather than two parallel lists that could drift apart. Its balance block (single-leg stand progression, Y-balance, tandem walk) is unchanged, since that content isn't stretching.

**A real bug of my own making, caught and fixed before shipping:** prepending warm-up entries to each session's exercise list shifted every existing `alt` equipment-pool's slot indices out of alignment with the `bw`/`gym` arrays they're keyed against (all hand-recomputed for s1/s3/s4 after stripping the old hardcoded warmup/cooldown lines from those arrays). Separately, `pickRunIndex()`'s consumer in `plan.js` assumed raw array-position indexing into `p.exercises` to find "today's picked run" — broken the moment warm-up items got prepended — fixed by matching on the exercise's stable `_slotIdx` metadata instead of its position in the final array, which stays correct regardless of what gets composed around the working set.

UI: `dawnSessionHtml()`, `renderCoachToday()`, and the reference library (`renderSessionLists()`) all now visually group exercises under "🔥 Warm-up," the session's own working-set header, and "🧊 Cool-down" instead of one undifferentiated list. `plan.html`'s glossary gained a new consolidated Warm-up/Cool-down reference section (the authoritative description of every library entry) and had each session's now-inaccurate hardcoded "same cool-down as above" bullets replaced with a pointer to it — removing a maintenance/correctness risk (stale duplicated stretch text) rather than leaving it to drift.

Verified via direct function calls (pool composition and phase-tagging per session, alt-pool index alignment after the reindex, equipment gating on the one equipment-tagged stretch) and real UI interaction (the reference library's and coach card's Warm-up/Session/Cool-down grouping — had to force a non-AFT-circuit day via a throwaway gym-access pattern since today's real date landed on the AFT day's early-return branch by default — plus confirming the exercise swap UI still resolves correctly against phase-tagged exercises, and the workout-log form still builds with the fuller exercise list).

SW bumped to `operations-v180`. `SKILL_LADDER_VER` unchanged at **117**. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress -- --shot` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** back to the confirmed build order — Phase **FM-Adapt**'s design pass, or X-Insight if Wyatt wants to skip ahead. Nothing about this session's request is still open.

### v181 — Phase FM-Adapt: difficulty-rating-aware adaptive rep/set/weight targets

**Files changed:** `src/tabs/log.js`, `src/tabs/log.html`, `src/core/training.js`, `src/styles/main.css`, `sw.js`.

Fifth phase of the confirmed FM/test-features build order — the one raised live during FM-2 and deliberately carved out as its own phase rather than built half-designed. `IDEAS-tests-fm-workouts.md` flagged it as needing "its own dedicated design pass before any code, same caliber as X-Insight." Before writing that design, read the actual codebase first (per this project's own standing "check what's built before proposing" rule) — and found `computeTarget()`/`renderAdaptiveTargets()` already existed in `log.js`: a real, working, per-exercise next-session-target engine that already does trend detection (up/down/flat/stalled across a real logged history), monthly-baseline blending, and honest hold-vs-push phrasing. It had a per-workout RPE field (`lgRpe`) already being captured and saved — and never read back by anything. That discovery reframed the whole phase: not a new adaptive system to invent, but a bounded extension of trusted, already-shipped logic to finally use the signal it was already half-collecting, plus the two genuinely new signals Wyatt asked for.

**What shipped, mapped directly to the original ask:**
- *"Rate difficulty of reps... at end"* → a per-exercise "How did it feel?" tap (😌 Easy / 👍 Right / 😤 Hard) in the log form (`log.js`/`log.html`), saved on that exercise's log entry.
- *"If I needed to reduce half way, if I needed to do less reps because my body wasn't able to keep up"* → a per-exercise "had to cut it short" checkbox, same log entry.
- *"Rate difficulty... at start"* → a workout-level "How do you feel today?" check-in (😓 Rough / 😐 Normal / 💪 Strong), saved on the workout for the historical record. **Deliberately not fed into the math** — today's target is already computed and shown before the workout starts, so there's no honest way for a pre-workout tap to retroactively recalculate a number already on screen; pretending otherwise would be exactly the kind of overclaiming the app's honesty rule forbids. The UI says so directly.
- *"Learn from all of that... give the best possible suggestions... keep me constantly improving"* → `computeTarget()` now factors in the last logged difficulty rating and reduced flag (plus the existing-but-previously-unused session RPE, at last put to use) as a plain rule, not a fitted model: a hard rating, a cut-short flag, or RPE ≥9 forces a hold regardless of what the raw numbers say (safety first, matches the injury/soreness-reduction spirit of the v180 stretch work); an easy rating or RPE ≤6 nudges a flat/first-ever trend up a notch. No rating at all leaves `computeTarget()`'s behavior byte-for-byte identical to before — verified directly, not assumed — so this never invents a signal that wasn't actually given, and stays honest even off a single data point since it's just repeating your own last answer back, not claiming to have detected a pattern.
- **Unified, not duplicated:** FM-2's simpler `lastLoggedWeight()`-based note in `prescriptionFor()` (training.js) is retired — `prescriptionFor()` now calls the same `computeTarget()` engine `renderAdaptiveTargets()` already uses, so the weight/rep suggestion shown on the daily coach card and the one on the dedicated Adaptive Targets card are the same number from the same source, not two independently-computed guesses that could quietly disagree.

Verified via direct function calls covering the exact behaviors above (first-ever entry rated hard → forced hold with an honest note; a flat trend plus an easy rating → pushed up a notch; an improving raw-number trend but a reduced-mid-exercise flag → still forced to hold; no rating at all → output identical to pre-v181 behavior) and real UI interaction (clicked the readiness/difficulty/reduced controls, filled and saved a real workout, confirmed the persisted record carried every new field correctly).

SW bumped to `operations-v181`. `SKILL_LADDER_VER` unchanged at **117** (no ladder/tier/guidance text touched). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** back to the confirmed build order — **X-Insight** (needs its own design pass for the small-N-honesty problem, same as this phase turned out not to need once the existing engine was found) — or **T** (stealth-assessment games) if Wyatt wants to switch subsystems. Start only when explicitly asked.

### v182 — Effort rating: 1-3 scale → real 1-10 RPE scale

**Files changed:** `src/tabs/log.js`, `src/styles/main.css`, `sw.js`.

Quick, direct fix: Wyatt asked to change FM-Adapt's per-exercise effort rating from the 3-way 😌/👍/😤 tap to a proper 1-10 scale, matching standard RPE (Rate of Perceived Exertion) convention rather than a coarse 3-bucket approximation. `ex.difficulty` (string enum `"easy"|"right"|"hard"`) became `ex.effort` (number 1-10) throughout `log.js` — the log form now renders 10 small numbered buttons per exercise instead of 3 emoji buttons. `computeTarget()`'s hard/easy detection moved from string equality to effort bands (≥8 = hard/hold, ≤3 = easy/push, 4-7 = neutral/no override — same 3-tier *logic*, just finer-grained input), with a graceful fallback to the existing session-level RPE wording for the rare case only that signal is present. Verified the same three logic cases from v181 (hard/easy/neutral) now driven by numeric thresholds, plus real UI clicks confirming all 10 buttons render per exercise and set the value correctly.

SW bumped to `operations-v182`. `SKILL_LADDER_VER` unchanged at **117**. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** X-Insight or T, same as noted above — this was a quick interrupt, not a phase change.

### v183 — Readiness check-in: 1-3 scale → 1-10, matching v182's effort scale

**Files changed:** `src/tabs/log.js`, `src/tabs/log.html`, `src/styles/main.css`, `sw.js`.

Direct follow-up to v182: Wyatt asked to make the pre-session readiness check-in 1-10 too, for consistency with the just-converted effort rating. `LG.readiness`/`S.workouts[].readiness` changed from a string enum (`"rough"|"normal"|"strong"`) to a number (1-10); the log form's readiness row now shows 10 numbered buttons instead of 3 emoji buttons, same visual pattern as the per-exercise effort scale. Readiness still isn't read by `computeTarget()` — that design decision from v181 stands: it's captured before the workout starts, so it can't honestly recalculate a target that's already been shown, and pretending otherwise would overclaim. Verified with real UI clicks (button count, click-to-set, click-to-toggle-off, and a full save round-trip persisting the numeric value correctly).

SW bumped to `operations-v183`. `SKILL_LADDER_VER` unchanged at **117**. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** X-Insight or T — same as noted above, unchanged by this quick interrupt.

### v184 — Standing rule applied: every subjective self-rating scale is 1-10

**Files changed:** `src/tabs/log.js`, `src/tabs/log.html`, `sw.js`.

Wyatt generalized v182/v183 into a standing instruction: *"for any effort level or self rating thing or anything else similar to this please have it use a 1-10 scale."* Rather than guess at scope, dispatched an Explore agent to audit every rating-shaped input (`<select>` dropdowns and emoji-tap button groups) across all of `src/`. Found exactly two more genuine matches, and confirmed everything else deliberately stays as-is:

- **Converted:** `#ptIntensity` (Log tab's cadre-PT "how hard," was Light/Moderate/Hard) and `#lgRpe` (workout session RPE, was a `<select>` oddly capped to values 6-10 only — missing 1 through 5 entirely, so not even honestly "1-10" before). Both now use the same 10-numbered-button pattern as the effort/readiness scales from v182/v183.
- **Confirmed out of scope, with reasoning (not touched):** task-difficulty pickers (`#qaDiff`/`#qDiff`/`#dtDiff`) set fixed XP/reward tiers when *creating* a task — an objective reward-tier choice, not a self-rating of state; award/membership/qualification category pickers are objective classification; the ILR language-proficiency field is already a standardized fine-grained government scale, not an ad hoc 1-3; and SRS/flashcard grading (Again/Hard/Good/Easy) feeds a real SM-2 spaced-repetition algorithm where the four discrete grades map to specific ease/interval-adjustment formulas — forcing that to 1-10 would break the scheduling math, not just relabel it.

**A real calculation dependency caught before shipping:** `recoveryLoad()` (feeds `plan.js`'s PT-fatigue-aware session-easing) used `{light:1,moderate:2,hard:3}` as a decay weight per logged PT session. Converting the input to a raw 1-10 number without adjusting this would have silently thrown off `renderRecoveryAdvisory()`'s fatigued/sore thresholds, which are calibrated against that old 0-3 magnitude — so the new `ptIntensityWeight()` scales `(intensity/10)*3` to land in the same effective range, with a fallback for any legacy string-valued `S.ptLog` entries already on disk from before this change.

Verified via direct function calls (`recoveryLoad()`'s output confirmed at the expected ~2.7 weight for a rated-9 session, matching a pre-v184 "hard"-rated session's ~3 weight) and real UI interaction (PT intensity default-highlight and click-to-set; RPE's full 10-button render, click, and a saved-workout round-trip confirming the numeric value persists).

SW bumped to `operations-v184`. `SKILL_LADDER_VER` unchanged at **117**. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** X-Insight or T — unchanged by this interrupt. The "every self-rating is 1-10" rule is now a standing convention for any future rating input added to the app.

### v185 — Phase X-Insight: cross-domain pattern surfacing

**Files changed:** `src/core/insights.js` (new), `src/tabs/records.js`, `src/styles/main.css`, `scripts/build.py`, `scripts/build.js`, `sw.js`.

Sixth phase of the confirmed FM/test-features build order. Unlike FM-Adapt, this one genuinely needed the "dedicated design pass" originally anticipated — a research pass first confirmed no cross-series correlation logic already existed anywhere in the app (the closest precedents, `computeTarget()` and `recoveryReadiness()`, only ever compare one metric against its own past, never two different metrics against each other), and mapped out the real, honest constraints: every data series in the app formats dates differently (`toDateString()`, `toLocaleDateString()`, ISO, or plain `YYYY-MM-DD`, sometimes inconsistently within the same object), several series are inherently too sparse or timeline-less to correlate at all (quizzes/SRS have no per-event history — a scalar tally only), and a cadet's own logged history is small enough that a naive correlation coefficient would imply a precision the data can't support.

**Deliberately avoided the "invent advice" failure mode two ways:** first, by not computing a correlation coefficient at all — every check instead compares plain bucketed averages or a co-occurrence count (the same "plain rule, not a fitted model" philosophy `computeTarget()`'s difficulty signal already established, generalized to cross-series comparisons), which stays interpretable and doesn't overclaim precision. Second, by requiring real support on both sides of any comparison before showing anything (at least 2 data points in each bucket, at least 4 total) — verified directly that an empty save and a one-sided dataset (e.g. every AFT test preceded by a consistent streak, no inconsistent-streak tests to compare against) both correctly produce nothing, not a fabricated or half-supported claim.

**What shipped — three grounded checks**, all in new `src/core/insights.js` (`computeInsights()`):
1. **Streak consistency vs. AFT score** — average AFT total on tests preceded by a ≥70%-consistent daily-order streak (prior 2 weeks) vs. tests preceded by an inconsistent one.
2. **Training frequency vs. AFT improvement** — average workouts+PT sessions/week in the 3 weeks before a test that improved over the last one, vs. before a test that didn't.
3. **Body-weight movement vs. deadlift movement** — of the times your logged body weight changed between AFT tests, how often your deadlift moved the same direction (paired by nearest date, within 14 days).

Rendered as a new "🔍 Insights" card in the History & Trends tab (`renderInsightsBlock()` in `records.js`, a new `.hist-block-wide` spanning both grid columns, placed first since it's the most synthesized/interesting content), reusing the existing `.recovery-line` honest-observation styling already established by `renderRecoveryAdvisory()`/`renderSkillBalance()` elsewhere in the app rather than inventing new visual language for "here's what your data shows."

**Verification took a real detour worth recording:** the system was under genuine memory pressure during this session (~4GB/31.6GB free, confirmed via `Get-CimInstance Win32_OperatingSystem`, the same diagnostic used during v175's), which repeatedly stalled Playwright's browser launches well past normal retry territory. Rather than keep fighting it or falsely claim untested confidence, verified the pure logic (which has zero DOM dependencies) via a lightweight Node `vm` sandbox instead — confirmed the empty-state/one-sided-data silence directly, then confirmed a rich synthetic dataset correctly triggers all three checks with accurate N-counts in the generated phrasing. A lighter real-browser pass afterward confirmed the actual UI card renders with 0 page errors, and `npm run regress` passed clean (after one environmental retry).

SW bumped to `operations-v185`. `SKILL_LADDER_VER` unchanged at **117** (no ladder/tier/guidance text touched). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** back to the confirmed build order — **T** (stealth-assessment games) or **FM-3** (card-game workouts, re-confirm the build greenlight first — Wyatt asked to hold it in planning even with a complete design) or **X-SmartFocus** (needs its own goal-weighting design pass). Start only when explicitly asked.

### v186 — Phase T, sub-phase 1: Sentry (reaction time, the first stealth-assessment game)

**Files changed:** `src/tabs/test.js`, `src/styles/main.css`, `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`.

First of Phase T's N sub-phases (stealth-assessment games, idea #1), per the doc's own sizing note treating each construct as an independent sub-phase and its explicit recommendation to start with Sentry — "the simplest real-game wrapper." Researched the existing reaction-time drill (`startReaction()`, a plain tap-on-green with a visible timer/score UI) and the app's game-feel infrastructure first: no `<canvas>` or audio anywhere in the app (everything is DOM+CSS), and Go/No-Go's `setTimeout`-driven "flash a stimulus, judge the tap" state machine is the closest existing structural template. The design itself needed no further work — §1a had already fully locked in Sentry's concept (night-watch theme, tap threat silhouettes fast, ignore decoys) in an earlier session.

**What shipped:** `startReaction()` now launches Sentry — a night-watch scene with 5 treeline slots. 5 threat silhouettes (▲) appear at random slots and must be tapped fast (that's the real, unchanged reaction-latency measurement, still scored through the exact same `TESTS[0].scoreToLevel` curve and `recordTest("reaction", avg)` pipeline as before — only the presentation changed). 3 decoys (●) are interspersed and must be held off; tapping one is a real false alarm, not a no-op — a felt cost, doubling as impulse-control practice per the confirmed design. During play, only game-native feedback shows (a "threats spotted"/"false alarms" tally and a slow tension ramp via a CSS class), never a visible timer or ms — the real average, a PR check, and any level-up only appear on the results screen once the watch ends, matching the resolved "hide during play, honest after" rule for the whole stealth-assessment workstream.

**A real, previously-unnoticed bug was found and fixed while verifying, affecting every cognitive test, not just Sentry:** each of the 8 tests' `*Done()` functions wrote its results HTML into the stage element, then immediately called the global `render()` — which unconditionally rebuilds the entire Test tab (`renderTests()`), including a blank stage div, as a side effect. That wipes the just-written results in the same synchronous tick, before the browser ever paints the intermediate state. Confirmed directly (not assumed) via a targeted DOM check proving the stage node is swapped for a fresh, empty one. Fixed all 8 (`sentryDone`, `dsDone`, the typing test's inline handler, `nbDone`, `ggDone`, `psDone`, `mmDone`, `rdDone`'s comprehension handler) with the same reorder: call `render()` first, then re-query and write results into the fresh post-render element — snapshotting any values read from a test's state object into locals first, since the state gets nulled before the re-render.

`SKILL_LADDER_VER` bumped for one guidance-text edit: Reaction speed's `whatYouDo` (`skills-data.js`) described the retired tap-on-green mechanic; updated to describe Sentry.

Verified via a full real-browser playthrough of Sentry, driven programmatically through all 8 rounds: confirmed threats produce real latency measurements while decoys are correctly excluded from the average and counted separately as false alarms, the results screen now actually persists (previously would have been empty due to the bug above), a PR flag and level-up correctly fire on this first-ever entry, and `S.tests` gets exactly one correctly-shaped entry. Spot-checked Go/No-Go's identical fix pattern (ran out of its own 25-round time budget mid-test, but the code path is byte-for-byte the same pattern already proven on Sentry). `npm run regress -- --shot` passed clean, 0 page errors, one retry needed for the same environmental memory-pressure flakiness documented in v175/v185.

SW bumped to `operations-v186`. `SKILL_LADDER_VER` bumped to **118**. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress -- --shot` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Next:** Phase T continues one construct at a time — Land Nav Relay (digit span), Comms Relay (typing), Perimeter Watch (n-back), Fire Discipline (go/no-go), Cipher Desk (processing speed), Fire Mission (mental math), Intel Briefing (reading), Climb the Tree (quizzes) are all designed and confirmed in §1a, ready to build in any order. Start only when explicitly asked; each is its own small, self-contained sub-phase.

### v187 — Phase T, sub-phases 2-9: the remaining 8 stealth-assessment constructs — Phase T now DONE

**Files changed:** `src/tabs/test.js`, `src/tabs/test.html`, `src/tabs/quizzes.js`, `src/styles/main.css`, `sw.js`.

Wyatt asked for all 8 remaining constructs in one session rather than one-at-a-time. Built each as the same kind of reskin Sentry established in v186 — same underlying `TESTS[i].scoreToLevel`/`recordTest()` measurement pipeline, same "hide clinical stuff during play, reveal real stats only on the results screen" rule, same render()-then-re-query fix for the results-wipe bug — with the moment-to-moment mechanics from the confirmed §1a designs:

- **Land Nav Relay** (`startDigitSpan`→`startLandNav`) — the flashed digit sequence becomes a call-out order across 10 numbered waypoint markers on a course map; recall becomes tapping the waypoints back in the same order to "relay the route." Same adaptive staircase (span grows by 1 each success) as the original digit-span test.
- **Comms Relay** (`startTyping`→`startCommsRelay`) — one long typed sentence becomes a stream of 5 short "radio transmissions," each on its own garble countdown (scaled to message length). Per-message elapsed time and per-char accuracy aggregate into the same gross-WPM×accuracy formula the original single-sentence test used; no live WPM number shown mid-play, only a "messages relayed" tally and a decoded/lost flash per line.
- **Perimeter Watch** (`startNback`→`startPerimeterWatch`) — the bare 3×3 grid + MATCH button becomes 9 watch-post markers + a "🚨 Report repeat" button. Identical trial generation/timing/pass thresholds; visual+copy reskin only.
- **Fire Discipline** (`startGoNoGo`→`startFireDiscipline`) — green-circle/red-square go/no-go becomes hostile (▲, engage) vs. friendly/non-combatant (●, hold fire) — the exact framing Wyatt confirmed directly in the §1a design pass ("Good, keep it"). Identical 25-signal timing/accuracy math.
- **Cipher Desk** (`startProcSpeed`→`startCipherDesk`) — lightest-touch reskin: the fixed symbol→number key is now framed as a "cipher key," each correct match adds to a "Decrypted: N" tally. Mechanically byte-for-byte the original 60-second matching-pad sprint.
- **Fire Mission** (`startMathSprint`→`startFireMission`) — `a + b =` becomes artillery/logistics corrections ("Adjust fire: 23 mils, add 50 =", "Rounds needed: 4 guns × 7 rounds each ="); added a brief "🎯 Target hit" flash on each correct entry (the original silently auto-advanced with no feedback at all). Same three operators, same generation math, same 60s sprint.
- **Intel Briefing** (`startReading`/`rdDone`) — a genuine measurement upgrade, not just a skin: the old self-reported "did you understand it? yes/partial/no" comprehension check is replaced by 2-3 possible next actions per passage, exactly one of which is actually consistent with what the report said (all 4 passages got real, content-grounded action sets and a `why` explanation written for this). Whether you pick correctly *is* the comprehension measurement now — an objective decision-correctness signal, closing a real honesty gap the original self-report design had (flagged explicitly in the §1a doc). `test.html`'s Reading Speed section intro updated to stop claiming comprehension is self-reported.
- **Climb the Tree** (`quizzes.js` — `startQuiz`/`showQuizQ`/`answerQuiz`/`finishQuiz`) — the existing quiz modal becomes a Yggdrasil-climb: a small climber (🐿️, after Ratatoskr — the squirrel who runs the World Tree's trunk in the source myth, a deliberate nod per the "symbolism is intentional" rule) advances one node per question, rendered as a path of leaf/branch markers above the question. A wrong answer doesn't fail the run — it's a "the branch holds" setback, the explanation still shows, and you retry the *same* junction until you clear it, so every run reaches the top. The score that actually counts toward pass/fail and the existing rewards (gold, Knowledge XP, daily review order, the `quizzes` boss objective) is **first-attempt accuracy** (`QZ.firstCorrect`), not "eventually got it" — retries let you keep climbing without inflating the honest measurement of what you knew on first read. Every question in the bank is still asked, in the same shuffled order, against the same `t.pass` threshold as before.

**Real bugs found and fixed during verification (both in Land Nav Relay, both real, neither hypothetical):**
1. **Repeat-waypoint tap bug.** The original digit-span sequence allows repeats (`Math.floor(Math.random()*10)` per digit, no repeat-guard) — e.g. a sequence like `[8,3,3,2]`. The first waypoint-tap implementation permanently disabled a marker after one tap, making a repeated waypoint (the second `3`) untappable — an unwinnable state for any sequence with a repeat, which is common. Fixed by allowing repeated taps on the same marker (each tap always pushes to the recall array; the marker just gets a brief visual pulse instead of a permanent disabled state).
2. **Click-event bubbling skipped a round.** On a correct relay, the code replaced the stage's content with a "✓ Route relayed — tap to continue" message and attached a new `stage.onclick` handler for that tap — but the winning tap's original click event was still bubbling up through the DOM at that moment (removing an element's children mid-handler doesn't stop its event from finishing its already-computed bubble path to a still-present ancestor). That same event immediately fired the just-attached `stage.onclick`, silently skipping the "tap to continue" step and jumping straight to the next round. Fixed by deferring the handler attachment one tick (`setTimeout(...,0)`) so it attaches after the triggering event finishes bubbling. Checked test.js for the same `stage.onclick`-set-from-inside-a-descendant-click-handler pattern elsewhere — Land Nav Relay was the only place using it, so no other construct needed the same fix.

**Verification approach:** `npm run regress` only clicks tab nav buttons, not individual game "Start" buttons or their interaction logic, so it wouldn't have caught either bug above. Wrote a throwaway real-browser Playwright script (deleted after use, not part of the repo) that actually played through all 8 constructs: multiple full Land Nav Relay rounds (including a deliberate failure to reach the results screen), a full 5-message Comms Relay session, Climb the Tree end-to-end including a deliberate wrong answer to exercise the retry path (confirmed it correctly reached "Reached the crown" with first-try-only scoring), and smoke checks (start renders expected DOM, no console/page errors) for the four constructs whose underlying logic is unchanged from the already-tested originals (Perimeter Watch, Fire Discipline, Cipher Desk, Fire Mission). Intel Briefing's action-choice UI was confirmed correct via a targeted debug script after the main script's own click-timing produced a false negative (a test-script bug, not a product bug — isolated and confirmed separately). Zero page errors across every pass. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`.

No `SEED_SKILLS`/ladder/tier/guidance content was touched, so `SKILL_LADDER_VER` stays at **118**. SW bumped to `operations-v187`. `npm run package` → produced `dist/operations.zip`.

**Phase T is now fully done — all 9 stealth-assessment constructs shipped.** Still open from the original idea #1 scope, not yet built: the session-start "pick a focus" menu (present what-to-train-today instead of a flat test list) — worth doing now that every construct is converted, since redesigning the picker earlier (while most tests were still old-style) would have been premature. **Next in the confirmed build order:** FM-3 (card-game workouts — re-confirm the build greenlight first, Wyatt explicitly asked to hold it in planning even with a complete design) or X-SmartFocus (needs its own goal-weighting design pass). Start only when explicitly asked.

### v188 — Focus-picker menu + Phase FM-3: card-game workouts (build greenlit and shipped)

**Files changed:** `src/tabs/test.js`, `src/tabs/test.html`, `src/core/state.js`, `src/tabs/plan.js`, `src/tabs/cardgame.js` (new), `src/_shell.html`, `src/styles/main.css`, `scripts/build.py`, `scripts/build.js`, `sw.js`.

Two items in one session: the last unbuilt piece of Phase T, and FM-3 (card-game workouts), re-confirmed for a **full session build** (not the one-slot prototype the doc had suggested as a fallback) after Wyatt explicitly greenlit it this session.

**1. Focus-picker menu.** A new "🎯 What do you want to train today?" tile grid (`renderFocusPicker()`, `#focusPicker`) sits above the existing detailed test list on the Test tab — 9 tiles (Reflexes, Memory, Typing, Working memory, Impulse control, Processing speed, Math, Reading, Knowledge), each a thin front door onto an existing game: tap one, it scrolls to that test's card and clicks its real Start button (or, for Knowledge, switches to the Quizzes tab) — no duplicated start logic, just reuses what already exists. The detailed list stays exactly as it was, for stats/history; this only stops it being the first thing you see, per Wyatt's original "present a menu of what to focus on, not a flat list" ask from idea #1.

**2. Phase FM-3 — card-game workouts.** Built the full §5 session-flow spec against the confirmed §5a math, sitting entirely on top of FM-2/FM-Adapt's already-trusted machinery rather than re-deriving it — per Wyatt's own architecture framing ("the coach gives the material... the game mode picks exercises to work those"), `sessionExForProfile()` (FM-2) supplies the day's real equipment-resolved exercise pool per slot, and `computeTarget()`/`BEGINNER_RX` (FM-Adapt / starter data) supply each slot's real prescribed volume — the card game never invents its own exercise selection or volume numbers.

**A real, documented deviation from §5a's literal spec, not a silent one:** §5a assumed exactly 4 fixed "regression" variants per exercise slot with distinct difficulty tiers, and a value-multiplier conversion rate between them. The real `SESSIONS` data (built in FM-2) isn't shaped that way — a slot's eligible pool is 1-5 *different* real exercises for the same muscle group (e.g. "Bulgarian split squat" vs. "Trap-bar deadlift"), not a hard→easy ladder of one movement, and nothing in the app tracks a real relative-difficulty ranking between them. Inventing one would be a faked metric (a `CLAUDE.md` hard-rule violation), so every variant in a pool gets an equal value multiplier here — §5a's conversion-rate math still runs, it just always evaluates to 1. Suits still map to different real exercises (`pool[suitIndex % pool.length]`, generalizing §5a's own "bucket suits into the real option count" solution to a variable-length pool instead of a fixed 4), and reps still scale by rank — the game feel is intact, just without a fabricated difficulty score.

**The progressive-overload guardrails (§5a point 5) are a hard clamp by construction, not an emergent property hoped for:** `threshold` = the real prescribed volume for that slot (`repsPerSet × setsTarget`, resolved via `computeTarget()` first, `BEGINNER_RX` second, a generic 3×10 default last — the same resolution order `prescriptionFor()` already uses). Every draw's reps land in an `[8%, 12%]`-of-threshold band, interpolated by rank *inside* that band — so "roughly 8-13 draws per group" and "never wildly overshoot the real prescription" hold for any threshold, not just the doc's own 36-rep worked example. The adaptive difficulty-bias (§5a point 4 — a 1-10 difficulty rating per draw, following the app's standing 1-10 self-rating convention) nudges the rank roll *inside* that same band; a "too easy" rating (≤3) or "too hard" rating (≥8) can shift where in the 8-12% range the next draw lands, but can never push a draw outside the safety bounds. Bias is session-local (reset each new session), deliberately not persisted — a different timescale from FM-Adapt's cross-session `computeTarget()` signal, matching the reasoning already recorded in FM-Adapt's own entry.

**Session flow, matching §5's spec point for point:** an explicit "🎴 Play it as a card-game workout instead" button appears on Coach Today only for sessions with at least one real reps-type work-phase slot (naturally excludes run days, AFT-mock/practice days, and the mobility/balance session — none of those fit a "draw a card, do reps" mechanic, and no button means no confusing dead-end). Equipment is chosen explicitly at start (any saved `S.equipProfiles` entry, session-local — doesn't touch the saved default) and holds for the whole session. A dedicated full-screen modal (`#cardGameModal`, same pattern as the existing `mockAftModal`) auto-draws each card (suit → exercise via the pool-bucketing above, rank → target reps via the guardrail band), shows the real `exHowto()` how-to for whatever got drawn, and takes inline actual-reps + per-draw difficulty logging — no separate post-hoc log-tab step. Progress toward the current group's threshold is tracked and displayed live; crossing it auto-advances to the next slot. A "Stop & log what I've done" escape hatch is always available. On completion (or early stop), a whole-session RPE prompt feeds directly into a normal `S.workouts.push(...)` entry — same shape, same reward (`pathXP.physical+=25`, `+8 gold`, `totalDone++`) as a normal logged workout, so card mode is a presentation choice, not a reason for bonus reward.

Verified with a throwaway real-browser Playwright script (deleted after use): the focus-picker's Reflexes tile correctly scrolled to and auto-started Sentry; a forced `s1` (Lower+Push) card-game session was played end-to-end through all 6 real exercise groups (57 total draws, alternating too-easy/too-hard ratings on purpose to exercise both bias branches), correctly logged a real, well-shaped `S.workouts` entry with 13 distinct exercise variants and per-exercise averaged effort; a 200-trial synthetic sweep of the guardrail formula across varied thresholds and bias values confirmed draws stay within (or very close to) the intended 8-12% band — the small observed spread on a real, small, legitimate threshold (Pike push-ups: 2 sets × 6 reps = 12 total) is an honest, expected consequence of keeping rep counts as whole integers at low volume, not a formula bug. Zero page errors throughout.

No `SEED_SKILLS`/ladder content touched — `SKILL_LADDER_VER` stays at **118**. SW bumped to `operations-v188`. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**Remaining from the FM/test-features doc:** X-SmartFocus — the last item, needs its own goal-weighting design pass before it's buildable. Start only when explicitly asked.

### v189 — Phase X-SmartFocus: whole-tree leverage recommender — the FM/test-features doc is now fully complete

**Files changed:** `src/core/skills-core.js`, `src/tabs/today.js`, `src/styles/main.css`, `sw.js`.

Last item in the FM/test-features build order. This one genuinely needed its own design pass (per the doc's own note — "commissioning readiness" wasn't defined anywhere in terms of the tree's Paths) — worked through four open questions with Wyatt via `AskUserQuestion` before writing any code: how to weight the 10 Paths, what "highest-leverage" should mean, whether to anchor urgency to a real deadline, and where the recommendation should surface. All four landed on the recommended option: weight branch-relevant Paths higher, blend urgency + opportunity, no fixed deadline (open-ended), and supplement Today's Hand rather than build a new surface.

**What shipped:** `computeSmartFocus()` (`skills-core.js`) scores every already-started skill as `path_weight × (urgency + opportunity)` and returns the single highest scorer, or `null` if nothing qualifies (stays silent rather than forcing a pick, same "silent unless real support" philosophy X-Insight already established). `path_weight` is a plain 1.5x/1.0x multiplier — 1.5x for War/Craft/Knowledge/Command (tactical/technical/academic/leadership, the four Paths most directly tied to Cyber-branch commissioning performance), 1.0x for the other six. `urgency` is nonzero only in the `"at-risk"` fade window (ramps 0→1 as `skDaysLeft()` counts down through the skill's own grace period, not a fixed constant — different skills have different `fadeDays`, so the ramp is normalized per-skill). `opportunity` is `peakLevel − effectiveLevel`.

**A real, documented judgment call, made honestly rather than silently:** the doc's "opportunity" language suggested "closest to leveling up," but the app has no way to measure fractional progress toward an unearned level — levels are earned via real benchmarks (self-reported taps, auto-level from measured data, or `recordTest()`), not a continuous XP bar. Inventing a "how close" number would be a faked metric (a `CLAUDE.md` hard-rule violation), so `opportunity` uses the peak/effective gap instead — a real, already-tracked number. **A consequence worth being explicit about:** since decay is a purely computed (not stored) reduction — `skEffectiveLevel()` reads `sk.currentLevel` and time elapsed fresh on every call, never writing a lower value back to `sk.currentLevel` — the peak/effective gap is normally 0 right up until a skill has actually decayed, and closes back to 0 the instant it's practiced again (no gradual "reclaim," it's immediate). So this recommender only ever surfaces skills you've already started and have either let slip or are about to — a "shore up what's slipping" tool, not a "what should I try next" one. Today's Hand's existing random draw still covers fresh discovery; this doesn't replace it.

**Where it shows:** a `🎯 Your real priority` callout (`smartFocusCalloutHtml()`, `today.js`) inside the same card as Today's Hand, above the card row — supplementing it, not replacing it, per the confirmed decision. Shows the skill name, its Path (icon + name, color-matched via a CSS custom property), and a plain-language reason (e.g. "2 days from decaying past its grace period" or "down to level 3 — 2 below your peak of 5. One practice tap reclaims it.").

Verified with a throwaway real-browser Playwright script (deleted after use): confirmed a completely fresh save correctly returns `null` (silent, no forced pick); hand-derived the expected score for two synthetic skills (a decayed Path-of-the-Self skill with a real 2-level gap vs. an at-risk Path-of-Command skill about to lose its first level) before running it, then confirmed the actual computed `eff`/`state`/picked-skill values matched the hand calculation exactly; confirmed the callout renders live on the Dawn tab with the correct skill, Path, and why-text. `npm run regress` hit the same documented environmental memory-pressure flakiness noted in v175/v185/v186 (a `page.goto` timeout, ~6GB free of 31.6GB at the time) — passed clean on an immediate retry, confirming it was transient and not a regression.

No `SEED_SKILLS`/ladder content touched — `SKILL_LADDER_VER` stays at **118**. SW bumped to `operations-v189`. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**The entire `planning/IDEAS-tests-fm-workouts.md` build order is now complete** — X-Timeline, X-AAR, FM-1, FM-2, FM-Adapt, X-Insight, Phase T (all 9 constructs + the focus-picker menu), FM-3, and X-SmartFocus have all shipped. No open items remain in that doc.

### v190 — FM subsystem audit, font self-hosting, and GUI-revamp Phase A: design-system foundation + Plan/Log/AFT restructure + nav reorg

**Files changed:** `src/_shell.html`, `src/styles/main.css`, `src/tabs/plan.html`, `src/tabs/plan.js`, `src/tabs/log.html`, `src/tabs/log.js`, `sw.js`, `scripts/package.js`, `scripts/regress.js`, new `fonts/oswald.woff2`, `fonts/roboto-condensed.woff2`.

Wyatt asked for confirmation that FM-1/FM-2/FM-Adapt/FM-3 actually work as designed, plus resumption of the GUI-revamp threads left open since v174 (visual/nav/mobile), scoped up live via `AskUserQuestion` to "visual AND structural" for Plan/Log/AFT, "open to a fuller creative redesign," and a nav reorg because "the 7/11 split itself feels arbitrary."

**FM subsystem audit — all four confirmed working correctly, nothing needed fixing.** Verified with real behavioral tests (not just code review) via a throwaway Playwright script: FM-1's `assignWeekSessions()` correctly puts equipment-preferred sessions on declared gym days (tested a Mon/Wed/Fri pattern, a zero-gym-day pattern confirming bodyweight fallback fills every day, and a full 6/6 pattern confirming the fixed weekly session-type mix never changes, only which day gets what); FM-2's equipment profiles correctly resolve to all-bodyweight (Dorm) vs. weighted-inclusive (gym) exercise pools, and the manual swap override genuinely persists (tested on a real 5-option pool); FM-Adapt's `computeTarget()` correctly holds instead of progressing on a hard-effort or cut-short rating, and correctly nudges up on a low-effort first-time rating; FM-3 was already thoroughly verified in the v188 session. No code changes resulted from this audit — it's a confirmation entry, not a fix entry.

**Font self-hosting.** `_shell.html` no longer links `fonts.googleapis.com`/`fonts.gstatic.com` — a real, previously-flagged violation of `CLAUDE.md`'s own no-external-fonts/CDNs hard rule. Both Oswald and Roboto Condensed are variable fonts, so one vendored `.woff2` file per family (fetched from Google's own CDN once, during this session, then committed to the repo — not re-fetched at runtime) covers every weight the app uses; new `@font-face` rules in `main.css` point to them. Registered in `sw.js`'s precache list (so they work fully offline, the actual point of self-hosting) and in `scripts/package.js`'s `FILES` list — which required dropping that script's `zip -j` (junk-paths) flag, since flattening would have stripped the `fonts/` prefix the CSS's relative URL depends on; verified the packaged `dist/operations.zip` still contains `fonts/oswald.woff2` at the correct path via Python's `zipfile` module, not just assumed. Verified zero external requests fire and both fonts report `"loaded"` via `document.fonts.ready` in a real browser pass.

**GUI revamp — Phase A of a deliberately-scoped plan** (written up and approved via plan mode after two research-agent audits — one of the CSS visual system, one of the nav structure — plus direct reads of `plan.html`/`log.html`/`aft.html`; full reasoning in the approved plan). Given the true size of "full visual redesign + structural rework of 3 tabs + nav reorg" (45+ button classes, 40+ card classes, 18 tabs), this explicitly does not touch everything in one pass — see "still open" below for what's deliberately deferred.

- **Design tokens:** new `--space-1` through `--space-8` and `--radius-xs/sm/md/lg/pill/full` custom properties in `:root`, values grounded in the file's own actual observed distributions (radius clusters at 8/10/7/9/11px, spacing at 8/6/10/5/7/9/4/12px) rather than an invented scale. For new/touched code only — nothing untouched changed size.
- **RGB tokens + mechanical sweep:** added `--gold-rgb`/`--jade-rgb`/`--ember-rgb`/`--violet-rgb`/`--blood-rgb`, then replaced all 197 exact-match occurrences of a palette color hand-typed as `rgba(R,G,B,...)` with `rgba(var(--x-rgb),...)` — a verified zero-visual-change, file-wide fix (confirmed 0 raw literals remain). Deliberately did **not** touch the Weight tab's near-duplicate (not exact-match) tans (`#c9a06a`/`#d8b06a`) — those are a real, different, deliberately-separate palette tied to that tab's already-flagged serif-font identity, and touching them would be a real visual change, not a mechanical no-op.
- **Dropped the dead `"Bebas Neue"` font-stack entry** — confirmed via the visual-system audit it was never vendored and had always silently fallen through to Roboto Condensed; removing it is a zero-visual-change cleanup, not a new gap.
- **Shared button/card base classes** (`.btn`/`.btn-primary`/`.btn-positive`/`.btn-secondary`/`.btn-block`/`.btn-sm`, `.card`/`.card-raised`/`.card-tint` + 5 color modifiers) added as new, additive CSS — deliberately **not** merged into the existing `.btn-add`/`.btn-buy` selectors (12+ tab HTML files reference those by name; true selector-merging risked subtly changing their exact rendered output, e.g. forcing letter-spacing onto `.btn-buy` which never had it). Existing classes are fully untouched and keep working exactly as before; the new classes are the vocabulary for new buttons/cards going forward. Plan/AFT's own card classes (`.coach-card`, `.gym-access-card`, `.equip-profile-card`, `.rx-card`, `.gym-toggle`, `.adder`, `.aft-result-card`, `.aft-prep-card`) were re-tokenized to consume the new spacing/radius variables (same visual dialect, same near-identical pixel values, now sourced from the shared scale instead of one-off raw numbers).
- **Plan tab restructure:** deleted the ~125-line static "Glossary" `<details>` block, which hand-copied exercise how-to text that already exists programmatically via `EX_HOWTO`/`exHowto()` (`training.js`) — a real content-integrity risk (could silently drift if `SESSIONS` ever changed). Confirmed via direct code read that `renderSessionLists()`'s exercise list (`exLi` in `plan.js`) didn't already show how-to text, unlike Coach Today which does — closed that real gap instead of just deleting the drift risk, by wiring `exHowto()` into a small per-exercise `<details class="ex-how">` expand affordance, sourced from the same array Coach Today already trusts. Verified `EX_HOWTO` already covers warm-up/cool-down stretch names too (not just main session exercises), so this closes the Glossary's full scope with zero content gap. Also reorganized the top-of-tab card stack: equipment profile, weather, gym-access, and the (previously always-visible, unbounded) adaptive-targets table now live inside one collapsed-by-default "⚙️ Setup" section below Coach Today, instead of competing with "what do I do today" for the first thing you see.
- **Log tab dedup:** the 3 near-identical hand-copied 10-button rating-scale HTML blocks (`ptIntensityBtns`/`lgRpeBtns`/`lgReadinessBtns`) are now generated by one shared function (`renderRatingBtns()`, already existed for the toggle logic — extended to also generate the markup) instead of three copy-pasted 10-line blocks in `log.html`.
- **Nav reorg:** confirmed via git archaeology (research agent) that the desktop 7-primary/11-secondary split has zero documented rationale anywhere in the repo — predates the earliest tracked commit, and every tab added since (confirmed: Carved Rings) just got appended to the bottom of "More" with no re-evaluation. The "More" drawer (and the mobile drawer, which — separately confirmed — is a strict superset containing desktop's "More" 11 plus Plan/AFT/Log, an inconsistency the v174 session itself flagged as "a judgment call, not re-confirmed") were both flat, undifferentiated lists. Added static category group headers — Testing & Study, Identity & Record, Objectives, Reflection & Reward on desktop; the same four plus a pinned Training group (Plan/AFT/Log) first on mobile, since those are desktop-primary but buried alphabetically-by-accident on mobile. Desktop's primary-7 and mobile's primary-4 deliberately stay different counts, now with a stated rationale instead of silence (desktop-7 = tabs opened every session; mobile-4 = tabs opened every day in seconds, the practical ceiling for a bottom bar). Confirmed safe against the nav click-delegation (`events.js` filters by `[data-tab]`, not positional child indexing) before adding non-button group-header divs.

**Verification:** `npm run regress -- --shot` after Part 1 (screenshot check justified given `.btn-add`/nav touch all 18 tabs, not just Plan/Log/AFT), plus a manual multi-tab screenshot spot-check (Today, Plan) confirming no unintended visual shift — one apparent duplicate-nav artifact in a full-page screenshot was traced to a known Playwright quirk with `position:sticky` elements during page-stitching, not a real bug (confirmed by checking the untouched CSS). A second throwaway Playwright script after Part 2 confirmed, behaviorally: desktop nav group headers render and a grouped tab still opens correctly on click; the Glossary is gone and the Setup section correctly contains equipment/gym-access/adaptive-targets; the exercise how-to expand affordance exists and shows real, distinct content (not just an echo of the exercise name); all three Log rating-scale containers render exactly 10 buttons and toggle correctly (only one "on" at a time); mobile drawer groups render in the right order and a grouped mobile button still activates its tab. Zero page errors throughout. Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`.

**Still open (explicitly deferred, not silently dropped):**
1. Migrating the remaining ~15 tabs' bespoke button/card classes onto the new shared base classes.
2. Revisiting each tab's per-tab "visual atmosphere" treatment (the documented Phase-3 CSS block) now that a real base system exists.
3. Deciding intentionally whether the Weight tab's serif font + near-duplicate tan palette (confirmed to live in one contiguous, deliberately-separate CSS block — likely one "set apart" design choice, not two accidents) is a keeper or something to unify.
4. Any deeper interaction-model change to the More/mobile drawer (e.g. collapsible per-category sections) — this session only added static group-header labels.

No `SEED_SKILLS`/ladder content touched — `SKILL_LADDER_VER` stays at **118**. SW bumped to `operations-v190`. `npm run package` → produced `dist/operations.zip` (verified `fonts/*.woff2` present at the correct path inside it).

### v191 — GUI-revamp Phase B: remaining-tab token migration, Weight tab identity confirmed, collapsible nav categories

**Files changed:** `src/styles/main.css`, `src/core/events.js`.

Immediate follow-up to v190's Phase A. Wyatt confirmed all three Phase B sub-threads via `AskUserQuestion`: migrate the other ~15 tabs onto the `.btn`/`.card` token system, decide the Weight tab's visual identity, and add real interaction to the nav drawer categories.

**Tab migration:** retokenized 25 more `*-card` classes (`.quiz-card`, `.adapt-card`, `.std-card`, `.emerg-card`, `.blood-card`, `.forge-recovery-card`, `.hb-card`, `.test-card`, `.srs-card`, `.td-card`, `.cn-card`, `.cl-card`, `.aw-card`, `.mb-card`, `.ev-card`, `.bl-card`, `.aft-pr-card`, `.install-card`, `.notif-prompt-card`, `.dawn-boss-card`, `.trophy-ring-card`, `.recovery-mode-card`, `.bl-pr-card`, `.qual-card`, `.rd-card`) and 12 more button classes (`.dt-kind-btn`, `.hb-starter-btn`, `.wall-resume-btn`, `.rpt-btn`, `.sk-practice-btn`, `.rd-btn`, `.sk-wq-btn`, `.gym-live-btn`, `.cg-profile-btn`, `.equip-profile-btn`, `.ex-alt-btn`, `.lg-effort-btn`) onto the `--space-*`/`--radius-*` tokens Phase A introduced — same colors, same near-identical pixel values (snapped to the nearest token, same "1px is visually indistinguishable" tolerance Phase A already established), applied via an exact-string-match Python script (25 + 12 replacements, all confirmed applied, zero misses) rather than a blanket regex sweep, to keep every change individually traceable. Deliberately skipped `.sk-card`/`.cg-card` (distinct components, not drift, per Phase A's own scope) and `.wm-btn`/`.wm-nudge-btn`/`.wb-btn` (Weight-tab-exclusive — see below). `.rpt-btn` (used in the Records/Saga tab, not Weight) reuses the Weight tan color intentionally for its report buttons — retokenized its spacing only, left the color untouched.

**Weight tab identity — confirmed intentional, formalized in a comment, zero code change.** Wyatt chose to keep it distinct rather than unify it with the main theme. Added a comment directly above `#view-weight`'s font-family rule stating this explicitly, so a future session (or agent) doesn't misread the serif font + `#c9a06a`/`#d8b06a` tan as unaddressed drift and "fix" it without asking — exactly the kind of thing the original visual audit flagged as ambiguous.

**Collapsible nav categories.** The category group headers Phase A added (`.nav-group-h`) are now interactive — `initNavGroupToggles()` (`events.js`) attaches a click handler to each header that walks its following siblings (until the next header or end of container) and toggles their `display`, both in the desktop "More" drawer and the mobile drawer. Defaults to expanded (matches the pre-existing always-visible behavior, so this is additive, not a regression for anyone who never taps a header) and is DOM-only state, not persisted to `S` — a low-stakes display convenience, not user data worth a save-schema field. A small `▾`/`▸` chevron (CSS rotation on `.collapsed`) shows the state. Confirmed safe against the existing nav click-delegation before building (same check as Phase A: `events.js` filters by `[data-tab]`, not positional indexing, and the group headers are `<div>`s with no `data-tab`, so they're structurally invisible to the tab-switching logic — no risk of a header accidentally triggering navigation).

Verified with a throwaway real-browser Playwright script: confirmed a category's tabs are visible by default, collapse to zero visible buttons on header click, and correctly re-expand back to the original count on a second click; confirmed a tab in a *different*, still-expanded group remains clickable and correctly activates while another group is collapsed (no cross-group interference). Also took real screenshots of the Test tab (confirming the nav group headers + chevrons render correctly alongside the retokenized `.test-card`) and the Weight tab (confirming its serif font and tan palette are visually untouched, exactly as decided). `npm run regress -- --shot` and a full `npm run regress` both passed clean, zero page errors.

No `SEED_SKILLS`/ladder content touched — `SKILL_LADDER_VER` stays at **118**. SW bumped to `operations-v191`. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `total:12524`, `badCount:0`. `npm run package` → produced `dist/operations.zip`.

**GUI revamp Phase B is now done.** All three sub-threads Wyatt confirmed are shipped. Nothing queued next from this doc — the next open GUI thread, if any, needs its own fresh ask.

### v192 — Full project cleanup: dead code, real bugs found along the way, and planning-doc maintenance

**Files changed:** `src/core/tree.js`, `src/tabs/log.js`, `src/core/migration.js`, `src/styles/main.css`, `src/tabs/test.js`, `src/tabs/cardgame.js`, `src/tabs/plan.js`, `src/core/skills-core.js`, `src/core/training.js`, `src/core/constants.js`, `sw.js`, `planning/SESSION-TIMES.md`, `planning/FINISHED-FEATURES.md` (this file), `planning/NEXT-SESSION-PROMPT.md`.

Wyatt declined the queued skills-expansion doc (`planning/IMPROVEMENTS-skills-expansion.md`) given how long the Commons-layer mythic-tree work took, and asked instead for a full cleanup pass: code audit, planning-doc cleanup, and any further FM/training improvements. No new skills or ladder content — `SKILL_LADDER_VER` stays at **118** throughout.

**Real bugs found and fixed, not just cosmetic cleanup:**
- `src/core/tree.js`'s `_treeWireGestures()` added `window` mousemove/mouseup listeners on every tree render with no cleanup — the SVG itself gets torn down each render but the listeners didn't, a real accumulating leak. Fixed with a module-scope cleanup closure that removes the previous render's listeners before adding new ones.
- `src/tabs/cardgame.js`'s `cgFindRxRow()` matched exercise names via substring-either-direction, which silently failed on real name-shape mismatches between `SESSIONS` and `BEGINNER_RX` (e.g. "Trap-bar deadlift" vs. "Trap-bar / barbell deadlift" never matched, doubling the prescribed volume by falling through to a generic default). Rewrote as word-overlap matching.
- `src/tabs/plan.js`'s Coach Today rx-card always showed the canonical `BEGINNER_RX` exercise name regardless of what the session list right above it actually displayed (could mismatch on a swap/alt day). Now built from the actually-displayed exercises via `cgFindRxRow`.
- `src/core/training.js`'s `assignWeekSessions()` had no recovery spacing — could stack 3-4 consecutive hard-intensity training days. Added `spaceOutHardDays()`, a bidirectional multi-pass swap that de-stacks adjacent hard days without breaking a zero-gym-day week; verified across 5 gym-access patterns, all resolved to zero adjacent hard pairs.
- `src/styles/main.css`'s `.sk-pyr-mythic.sk-pyr-maxed .sk-pyr-mythic-pct` selector never matched (`sk-pyr-mythic` is on a `<details>`, `sk-pyr-maxed` on its child `<summary>` — different elements); fixed to a correct descendant selector.
- Intel Briefing (Phase T, shipped v187) had **zero real CSS** since it shipped — its actual classes (`.rd-title`, `.rd-passage`, `.rd-instructions`, `.rd-comp-btns`) never had matching rules, only dead pre-Phase-T `.rd-*` CSS for a retired reading-test design existed. Added real styling; also fixed a class-name collision where its results wrapper had reused `.rd-comprehension`, a dead class already styling an unrelated tiny badge — renamed to `.rd-choice-wrap`.
- `src/tabs/log.js`'s `ptOnText()` existed but was never wired to anything — added the missing `input`-delegation case (confirmed safe: `renderPT()` only touches `#ptAreas`/`#ptRecent`, never the text field itself, so no cursor-jump risk).

**Other cleanup:**
- Deleted confirmed-dead functions: `aftLevelFromScores`/`eventScoreToLevel` (`migration.js`), `svg2vbScale` (`tree.js`, a duplicate of inline scale logic).
- Removed ~30 confirmed-orphaned CSS blocks (`.sk-quest*`, `.sk-pass`/`.sk-skip`, `.sk-group*`, `.ds-*`, `.nb-*`, `.week-tbl`, and others) plus the dead `.weight-bind`/`.wb-title`/`.wb-btn` trio and the retired reading-test block — verified each via direct grep, checking specifically for dynamic class-name construction (template literals) before removing anything, which caught one real false positive (`.trophy-chip.on.t1`/`.t3`, constructed dynamically in `trophies.js` — kept).
- Removed the inert `agility`/`battlerope` `EQUIP_TAGS` entries (`constants.js`) — confirmed zero exercises anywhere tagged with either.
- Added an equipment-requirement warning to the guided mock-AFT flow (`plan.js`) when the active profile lacks `barbell`/`aftkit` — doesn't block the flow, just surfaces the gap before the deadlift/SDC events turn out unrealistic.
- Added a scope-clarity note to FM-3's equipment-step UI (`cardgame.js`) — the card deck only covers rep-based exercise groups, not timed holds/runs/carries, so a circuit-style session like the AFT Circuit will only get partial deck coverage.
- Added `physical:1.5` to X-SmartFocus's `SMARTFOCUS_PATH_WEIGHT` (`skills-core.js`) — confirmed via `AskUserQuestion`, since AFT/physical readiness is an explicit OML input alongside the four already-weighted paths.

**Planning-doc maintenance:**
- `planning/SESSION-TIMES.md` had drifted from its own "most recent first" convention — v163–v167 and v172 had been appended out of chronological order instead of inserted. Reordered the whole table by descending version number (a small Python script, deleted after use) and pinned the convention explicitly in the footer note.
- `planning/FINISHED-FEATURES.md` (this file): condensed the ~389-line v149–v167 Commons-layer span (16 nearly-identical tree-building sessions) into one entry preserving the load-bearing incidents/lessons, added a version index (TOC) under "Completed Features by Version," updated the color-palette section to include v190's design tokens (was stale at "current as of v109"), and added `insights.js`/`cardgame.js` to the Architecture Summary's file list (both missing since they shipped).
- `planning/NEXT-SESSION-PROMPT.md`: trimmed the GUI-revamp and FM/test-features workstream sections from full historical re-narration down to short closed-state pointers plus the load-bearing gotchas a future session actually needs; added a note that the skills-expansion doc was explicitly declined this session so it isn't re-proposed blind.

Verified: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524` (unchanged — no skills added/removed). Behaviorally re-verified the two fixes not otherwise covered by regress via throwaway Playwright scripts (deleted after use): `cgFindRxRow`'s word-overlap matching, the Plan tab rx-card now showing the actually-displayed exercise, and the mock-AFT equipment-warning logic firing correctly for a gear-lacking profile (Dorm) and staying silent for a fully-equipped one (ROTC/Campus Gym). SW bumped to `operations-v192`. `npm run package` → produced `dist/operations.zip`.

### v193 — Docs cleanup follow-through: removed superseded planning docs, fixed a real adaptive-trainer visibility bug, wired AFT history into FM-Adapt

**Files changed:** `src/tabs/plan.html`, `src/tabs/log.js`, `CLAUDE.md`, `EXPANSION.md`, `README.md`, `docs/OPERATIONS-HANDOFF.md`, `docs/SETUP.md`, `planning/NEXT-SESSION-PROMPT.md`, `src/tabs/cardgame.js`, `src/tabs/test.js`; deleted `planning/IDEAS-gui-revamp.md`, `planning/IDEAS-tests-fm-workouts.md`, `docs/operations-expansion-outline.md`.

Direct continuation of the v192 cleanup, in two parts: finishing the planning-doc cleanup, then a real bug the user flagged mid-session.

**Doc cleanup (part 2):** deleted three docs that had zero remaining use — `planning/IDEAS-gui-revamp.md` and `planning/IDEAS-tests-fm-workouts.md` (both fully shipped workstreams, no open items, their content already lives in the relevant `FINISHED-FEATURES.md` version entries) and `docs/operations-expansion-outline.md` (a v27-era pre-build spec where every single item — vitals, habits, cognitive skills, the Test tab, study plans, dashboard, history/trends, CSV export, counseling log, checklists — has since shipped, confirmed by reading it in full against the current app). Rewrote `docs/OPERATIONS-HANDOFF.md`, which had drifted to describing a 100+-version-old app state (v89, 16 tabs, 93 flat skills, no pyramid system at all) — it's now a short, accurate orientation doc explicitly scoped to *not* duplicate `CLAUDE.md` (rules) or `FINISHED-FEATURES.md` (exhaustive history). Refreshed `README.md` and `docs/SETUP.md`'s stale version/tab/skill counts and a wrong `SKILL_LADDER_VER` file pointer (it pointed at `index.html`, which is generated output). Fixed every dangling reference to the three deleted docs, including code comments in `cardgame.js`/`test.js` that cited now-nonexistent section numbers (`§5`, `§1a`) — repointed to the relevant `FINISHED-FEATURES.md` version entries instead.

**Real bug found and fixed — the adaptive-targets trainer was effectively invisible.** Wyatt asked directly: "the adaptive FM trainer isnt really accessable... how do I access the adaptive trainer that tells you exactly how to do everything." Traced it to `plan.html`: `renderAdaptiveTargets()` (`log.js`, the "🎯 Your Next-Session Targets" card — real, working, auto-calculated per-exercise rep/weight/time targets from the workout log) was mounted inside a `<details class="wk card-raised">` labeled "⚙️ Setup — Equipment, weather, gym access & adaptive targets," **collapsed by default**. This was a real regression introduced in v190's Plan-tab restructure, which deliberately grouped it in with static configuration (equipment profile, weather, gym access) under one collapsed "Setup" accordion — treating an actionable, per-session coaching output the same as one-time settings. Moved `#adaptiveTargets` out of that accordion to sit directly below Coach Today, alongside the tab's other always-visible coaching cards (Skill Balance, Recovery Advisory); trimmed the Setup summary's label to match what's actually left inside it.

**Real gap fixed — the adaptive trainer never looked at AFT history.** Read `computeTarget()` (`log.js`) end to end and confirmed it only reads `S.workouts` (the workout log) and `S.baselines` (periodic baseline tests) — `S.aft` (real AFT test history, which stores raw per-event performance in `entry.raw:{dl,hrp,sdc,plank,run}`, not just the 0–100 score) was never referenced anywhere in it, despite the AFT-save toast literally claiming "plan re-tuned." Fixed two ways, both modeled directly on the existing baseline-test blending mechanism (`baselineTrend()`) rather than inventing a new pattern: (1) **AFT-as-corroborating-signal**, exactly mirroring how baseline tests already override a false stall/confirm a real one — added `aftTrendFor(name)` alongside a new `AFT_EXERCISE_KEY` map covering the 4 AFT events with an unambiguous 1:1 logged-exercise match (deadlift, hand-release push-ups, plank, the timed 2-mile; **SDC deliberately excluded** — it has no single canonical logged exercise, only several different carry/drag variants depending on equipment, and a fuzzy match there would be a real accuracy risk, not just a missed nicety); (2) **seed-from-AFT when there's no workout-log history at all** for a matched exercise — `computeTarget()` previously returned `null` outright in that case, meaning someone who's tested a real AFT but never logged a workout under that exact exercise name got nothing. Now it anchors a starting target to the real tested number instead of going silent, with one deliberate honesty constraint: for deadlift, rather than inventing a percentage-of-max training formula off a single max-effort AFT lift (a faked-methodology risk), it plainly surfaces the tested max and tells you to start conservative and log a first set — letting the normal set-by-set progression take over from there, same as everywhere else in the app's "plain rule, not a fitted model" precedent.

Verified via a throwaway Playwright script (deleted after use): confirmed `#adaptiveTargets` renders with real content and sits outside any collapsed ancestor; confirmed all 4 seed-from-AFT cases produce sensible targets from synthetic AFT raw data while the excluded SDC case correctly still returns `null`; confirmed the corroborating-override case (a flat 3-workout push-up log + genuine AFT improvement between two real tests) correctly overrides the stall to a push with a note crediting the AFT result; confirmed a fresh no-AFT-data case behaves byte-for-byte the same as before the change (pure regression check). Also spot-checked the other cross-cutting recommendation surfaces (X-SmartFocus callout, the Insights block, the Upcoming timeline, the Test tab's focus-picker grid, nav reachability of all 18 tabs on both desktop and mobile) for the same "buried in a closed collapsible" failure mode — none found; the Upcoming timeline's initial "not showing" reading turned out to be correctly-silent-on-empty-data (its own designed behavior), not a bug, confirmed by re-testing with real seeded dates.

`npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v193`. `npm run package` → produced `dist/operations.zip`.

### v194 — Plan-tab restructure: the adaptive coaching engine now IS the workout view, not a separate card to cross-reference

**Files changed:** `src/tabs/plan.html`, `src/tabs/plan.js`, `src/tabs/log.js`, `src/core/state.js`, `src/core/events.js`, `src/styles/main.css`.

Direct continuation of v193's fixes, same session. Wyatt pushed further: "the coaching/recomendations should replace the previous FM stuff where it actually gives the things that are required when looking at the workout instead of needing to find it seperately also, the workouts layout should be based on the adaptive coachings scheduling and other stuff." v193 had made the Adaptive Targets card *visible*; this session made its content actually *live where you look*, and removed the standalone card v193 had just relocated — read closely before assuming that card still exists.

**Investigated first, rather than assuming what needed to change:** read `renderCoachToday()`/`exLiHtml()`/`prescriptionFor()` end to end and found Coach Today's per-exercise line already calls `computeTarget()` internally (wired in back in v181/FM-Adapt) — so "today's orders" was already showing real adaptive numbers inline, not the gap it first looked like. The actual redundancy was elsewhere: the static "Session 1–5" reference blocks below Coach Today (`renderSessionLists()`'s rx-card) showed only the fixed `BEGINNER_RX` beginner-starter table — a completely separate, non-adaptive number system from `computeTarget()` — and the standalone Adaptive Targets card (just relocated in v193) duplicated the same "next: X" text a third time, in a flat list disconnected from session structure. Three parallel "what should I do" surfaces for the same exercises, only one of which was actually adaptive.

**Fix — merged, not duplicated:**
1. **`renderSessionLists()`'s rx-card now prefers `computeTarget()` over the static beginner table** for every exercise with real logged/AFT history — the same engine Coach Today already uses, so the numbers never disagree. An exercise with zero history still falls back to the `BEGINNER_RX` starter row (still useful as a first-timer's actual starting point). The card's own note line changes accordingly ("🎯 rows are your real next-session target..." vs. the original "New to this? Start here.").
2. **The standalone Adaptive Targets card is gone** — `renderAdaptiveTargets()` (`log.js`), its `#adaptiveTargets` mount (`plan.html`), and its dispatch call (`state.js`) all removed. Its content wasn't unique information; it was the same `computeTarget()` output already inline in (1) and in Coach Today, just re-listed flat and disconnected from either. Removing it is the literal fix for "instead of needing to find it separately." (The `.adapt-card`/`.adapt-sub` CSS classes stay — `board.js`'s Cyber-branch fact card reuses that same base styling for something unrelated; only the now-truly-dead `.adapt-row`/`.adapt-ex`/`.adapt-tgt`/`.adapt-empty` rules were removed.)
3. **"The workouts layout should be based on the adaptive coaching's scheduling":** the Session N reference blocks previously had Session 1 hardcoded `open` regardless of what's actually scheduled today — so on any day that wasn't Session 1's turn, the layout contradicted Coach Today's own "here's what to do today" call directly above it. New `openTodaysSessionBlock()` (`plan.js`) expands whichever Session block matches `todaysPlan().sessionKey` (the same adaptive, gym-access-aware scheduler `assignWeekSessions()` already drives) and collapses the rest — including all of them on a rest day, when nothing is "today's session." Called once from the nav click handler (`events.js`) when navigating to the Plan tab, not on every `render()`, so it doesn't fight a user who's manually expanded a different session to browse it.

Verified via a throwaway Playwright script (deleted after use): confirmed `#adaptiveTargets` no longer exists in the DOM anywhere; confirmed `openTodaysSessionBlock()` correctly opens only the matching session and closes the others (tested by temporarily stubbing `todaysPlan()` to a fixed session, since real "today" in the sandbox environment happens to be a Sunday/rest day); confirmed the rx-card correctly renders real `computeTarget()` output (e.g. "🎯 14 reps (+2 reps (last real AFT on this event: 35 reps))") for exercises with seeded log/AFT history, sourced from the same engine as Coach Today, with sensible fallback rows for exercises still on the beginner table. Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v194`. `npm run package` → produced `dist/operations.zip`.

### v195 — Ground-up FM redesign: the Coach Hub, a fully unified computeTarget(), and AFT-scaled starter numbers

**Files changed:** `src/tabs/log.js`, `src/core/training.js`, `src/core/aft-scoring.js`, `src/tabs/plan.js`, `src/tabs/plan.html`, `src/tabs/cardgame.js`, `src/tabs/aft.js`, `src/tabs/aft.html`, `src/tabs/log.html`, `src/styles/main.css`.

Wyatt asked directly for a ground-up redesign of the FM tab and its connecting tabs (Log, AFT, card-game) "to be better and more properly suited to the redesign" (i.e., v194's adaptive-coaching merge), plus the broader version of AFT-informed starter numbers that v193/v194 had only partly built (the 4 directly-matching events only). Given the scope, this went through the project's full plan-mode process rather than being guessed at: a general-purpose audit agent read all 4 tabs end to end and produced a structured pain-point report, a second Explore agent verified the mechanics of adding a new tab / the AFT scoring bands / the design-token system, a Plan agent turned both into a concrete file-by-file implementation plan, and Wyatt confirmed 3 direction decisions via `AskUserQuestion` before any code was written.

**The audit's core finding:** `computeTarget()` (the real adaptive engine) had no home screen — it only ever showed up as rows in a legacy-styled table, a save-toast, and inside the card-game modal — while **three separate "what should I do" systems competed** for the same exercise on the same page: `computeTarget()` itself, `prescriptionFor()` (a parallel, simpler intensity-based guess that only appended `computeTarget()`'s answer as an afterthought), and the static `BEGINNER_RX` table (duplicated between `renderSessionLists()` and card-game's `cgSlotVolume()`). Confirmed decisions: build one unified **Coach Hub** (Plan restructured in place, not a new tab), keep the 3 tabs' distinct visual identities and extend them to cover newer FM-1/2/3 additions, and scale generic beginner-starter weights by a plain AFT-fitness signal.

**1. `computeTarget()` is now the single source of truth everywhere**, resolved through 4 tiers instead of 2: tier 1 "adaptive" (real logged trend, unchanged), tier 2 "aft-anchor" (unchanged), tier 3 "starter" (NEW — no history but a `BEGINNER_RX` row exists, AFT-fitness-scaled if weighted), tier 4 "generic" (NEW — `prescriptionFor()`'s old intensity-based prose, absorbed verbatim). Tiers 3/4 are **strictly opt-in via an `opts` parameter** (`{skey, intensity, rich}`) — a bare `computeTarget(name)` call with no opts still behaves exactly as before, tiers 1-2 or `null`, which matters concretely for the save-toast's "did a real target appear" diff logic in `log.js`. Every call site with real session context now passes `opts` and gets the richer answer: Coach Today's `exLiHtml()` (via a rewritten `prescriptionFor()`, now a thin wrapper), the Session N reference cards (`renderSessionLists()`, now a single-column `.rx-list` instead of a fixed-column table, since row content varies by tier), and card-game's `cgSlotVolume()` (now one call instead of a parallel two-step lookup). Grepped every real `computeTarget(` call site in `src/` before touching the signature to confirm exactly which 2 (the toast diff) needed to stay bare.

**One real bug caught during verification, not before shipping:** the first version of tier 3's target string led with the sets count ("3 × 8/leg..."), but `cgSlotVolume()` parses the *leading* number of the target string as the rep count (matching every other tier's "reps-first" convention, e.g. "14 reps") — so card-game would have silently drawn 3 reps per card instead of 8. Caught by a direct behavioral check comparing `computeTarget()`'s output against `cgSlotVolume()`'s derived numbers for the same exercise, fixed by reordering the string to lead with reps and adding a structured `reps` field tier 3 can hand card-game directly instead of re-parsing.

**2. The AFT fitness-multiplier** (`aftFitnessMultiplier()`, `aft-scoring.js`) reuses the exact `<300 / 300–349 / ≥350` bands already established elsewhere for sparkline coloring — no new thresholds invented. Scales **weight only, never reps** (a beginner's prescribed rep count is a real, self-limiting target; a beginner starting *weight* is already a rough guess in the source data, so a plain ±10% nudge from a real measured signal is honest in a way a fabricated rep formula wouldn't be), applied in exactly one place (tier 3), rounded to the nearest 5 lb. Verified all 3 bands plus the critical no-regression case: with `S.aft` empty entirely, output is bit-for-bit identical to the un-multiplied `BEGINNER_RX` value.

**3. The Coach Hub — Plan restructured in place, no new tab.** Reasoning: Plan is already the tab every cross-tab CTA points to, and a new tab means 4 extra places that can silently break (`build.py`'s file lists, `state.js`'s `render()` dispatcher — not automatic, `_shell.html`'s 2 independent hand-written nav markups). `#coachHub` now wraps `#planRec`/`#coachToday`/`#planPriorities` (moved up, next to "what to do" instead of buried below the weekly schedule)/`#recoveryAdvisory`, plus `#skillBalance` demoted into a collapsed `<details>` ("beyond the AFT" — it answers a genuinely different, broader question than the AFT-weakest-event line, so both stay, just no longer competing for the same visual weight). A new "Schedule & Setup" section divider marks the old Week/Session-N/equipment/gym-access content as reference material below the fold; the Week `<details>` lost its hardcoded `open` since Coach Hub already shows today.

**4. Other redundancies closed, per the plan's own audit:** AFT's static `DRILL` (canned per-event volume prescriptions, exactly the kind of guess `computeTarget()` exists to replace) deleted, replaced by a direct link to Coach Hub; the second, duplicate AFT-total sparkline (`.aft-trend-wrap`) deleted, keeping only `aftSparkline()` (has real 300/350 threshold lines); Monthly Baseline's logic relocated from `plan.js` to `log.js` (its DOM already lived in `log.html` — `log.js` already owned every *consumer* of baseline data, so this reunites what was artificially split, not a new split); the Log form's 3 overlapping 1-10 scales **relabeled, not deleted** (readiness was a deliberate FM-Adapt design choice — logged for the record, never meant to feed targets — cutting it would remove real functionality nobody asked to lose; instead it's now visually grouped separately from the two that do feed `computeTarget()`, under explicit "affects your targets" vs. "for your record only" headers); real outbound links added Log→Coach Hub and AFT→Coach Hub (previously one-directional, Plan-centric); two real buttons added to the AFT tab itself to start a guided mock AFT (previously only reachable from Plan/Dawn, a real dead-end gap, reusing the existing global `data-mockaft` delegated handler — zero new JS).

**5. Visual identity preserved, not unified** — the 3 tabs' distinct themes (Plan = tactical map, Log = warrior's journal, AFT = combat readiness) stay, extended to cover components that sat outside all three as generic chrome since they were added: `#cardGameModal`/`#mockAftModal` (top-level in `_shell.html`, not nested in `#view-plan`/`#view-aft`, so they never inherited either theme) now get their own gold/ember accent borders and re-tinted timer/instruction elements; `.gym-access-card`/`.equip-profile-card` (FM-1/FM-2 additions) get Plan's gold tint; the relocated baseline card gets Log's gold/ledger tint.

Also cleaned up 2 small pieces of now-genuinely-dead CSS found along the way (not part of the plan, caught during a routine dead-code check after the `DRILL`/duplicate-sparkline removals): `.aft-drill` and `.aft-trend-wrap`/`.aft-trend-range`.

**Verified extensively, beyond the standard suite:** a throwaway Playwright script confirmed all 4 `computeTarget()` tiers produce correct output (including the reps-order bug fix above), the AFT-multiplier's exact scaled values at all 3 bands plus the no-AFT no-regression case, bare-call backward compatibility (still `null` with no opts, protecting the toast diff), cross-call-site numeric agreement between Coach Today/the Session N card/card-game for the same exercise, the Coach Hub's DOM structure and the collapsed skill-balance details, the relocated baseline card rendering correctly on Log, only one AFT sparkline existing, the 2 new AFT-tab mock-AFT buttons actually opening the modal, and both new cross-tab links being present and wired. One pre-existing, unrelated cosmetic issue was found (not fixed) while testing with sparse synthetic data: a `<circle>` SVG attribute NaN warning appears somewhere in the render cascade under certain sparse-data shapes — confirmed via isolation that it's unrelated to AFT's own sparkline (which correctly didn't fire) and reproducible with data shapes this session's changes don't touch; noted here for a future session, not blocking since it never threw (`pageerrors` stayed 0 throughout, and `npm run regress`'s own data flow doesn't hit it).

Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` (including `--shot`) → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v195`. `npm run package` → produced `dist/operations.zip`.

### v196 — Real fix for the TOC save-data-loss bug (not just a third re-restore)

**Files changed:** `src/core/app-setup.js`.

The real personal save data restored during the v193 session (see that entry) had reverted to a totally empty state twice more since — once discovered mid-session (restored again, same session), and once more found this session, still empty as of this morning. Rather than restore a third time and hope, this session traced the actual root cause in `tocInit()`/`tocWriteDebounced()` (`app-setup.js`) before touching the data again.

**The bug:** `_tocPresent` (the flag gating whether `tocWriteDebounced()` is allowed to sync writes to TOC) was set to `true` as soon as TOC's health-check endpoint responded — *before* the separate fetch for the actual saved project data had resolved. That data fetch used an 800ms `AbortSignal.timeout`, short enough that a slow/cold local backend (a real possibility for a Python service that isn't always warm) could plausibly miss it. On a timeout, the code fell into a catch block whose own comment said "a transient hiccup — keep syncing writes" — meaning `_tocPresent` stayed `true` with the real remote data never adopted into `S`, which at that point still held whatever fresh/default state had been seeded locally moments earlier. The very next `save()` call *for any reason* — including an entirely automatic one like `checkDailyReset()` running inside the normal `render()` cycle — would then flush that fresh/default state to TOC's stored file via the debounced `tocFlush()`, silently overwriting the real save with an empty one. This is a real, load-bearing distinction the code was missing: "TOC's server answered a ping" is not the same fact as "we know what's really saved there."

**Fix:** introduced a second flag, `_tocDataConfirmed`, distinct from `_tocPresent`. `tocWriteDebounced()`/`tocFlush()` now require *both* before writing anything. `_tocDataConfirmed` only becomes `true` on a definitive answer from the data-fetch — either real data was adopted, or the server gave an explicit "nothing here yet" response (`r.ok` true either way) — never on a timeout or network error. The data fetch itself now retries once (800ms, then a more generous 3000ms) before giving up, since a single missed 800ms window on a cold backend was plausibly the actual trigger for the incidents; if both attempts fail, `_tocDataConfirmed` stays `false` for the rest of that session, meaning writes stay disabled rather than risking a guess. A session that can't confirm what's really saved now does nothing, instead of assuming it's safe to overwrite.

**Verified behaviorally, not just by reading the fix:** a throwaway Playwright script (deleted after use) mocked TOC's health endpoint as healthy but the data endpoint as hanging past both retry timeouts — confirmed `_tocPresent:true, _tocDataConfirmed:false`, and confirmed no `POST` (write) was ever attempted even after explicitly calling `save()` twice, which is exactly the scenario that caused real data loss under the old code. A second, simpler check confirmed the ordinary success path still works correctly end to end (`_tocDataConfirmed` becomes `true`, real data adopts) on a clean, fast response. A live check against the actual running TOC backend on this machine (not mocked) confirmed the safety property holds for real: from a `file://` origin the data fetch couldn't complete (a testing-environment restriction, not a real-world one — the real user path is `http://127.0.0.1:8081`, already confirmed working in the v193 session), and the fix correctly left writes disabled rather than risking anything.

**Then restored the real save data a third time**, migrated fresh from `personal/save.json` through the app's real migration pipeline (same technique as v193) plus the 6 real workout sessions added this conversation, written to `personal/toc-save.json` in an isolated, TOC-blocked Playwright pass so nothing live could interfere mid-write. This time it's backed by the actual fix, not just a repeat of the same unprotected write path that lost the data twice before.

Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v196`. `npm run package` → produced `dist/operations.zip`.

### v197 — Fixed two real gaps that kept Coach Hub's "Today's Orders" from showing real adaptive numbers

**Files changed:** `src/tabs/log.js`; personal save data (`personal/toc-save.json` via TOC's live API, `personal/save.json`) — gitignored, not committed.

Wyatt sent screenshots of the live "📋 Today's Orders" card (the `renderCoachToday()` output at the top of the new v195 Coach Hub) showing most Session 1 exercises still displaying generic "beginner starting point" numbers instead of his real logged history, even though the v196 session had just restored real workout data. Two separate, real bugs, both found and fixed this session — not one:

**Bug 1 — exercise-name mismatch broke tier-1 "adaptive" resolution.** `computeTarget()`'s real-history lookup (`exerciseSeries()`) matches by exact name string against `S.workouts[].exercises[].name`. The workout entries transcribed into the save during the v193/v196 sessions used slightly different exercise names than the app's own coded `SESSIONS` pool (e.g. logged "Single leg RDL (each leg)" vs. the app's "Single-leg RDL (dumbbells)"; logged "DB bench press"/"Bench press" vs. the app's single combined "Barbell / DB bench press" slot). Only "Trap-bar / barbell deadlift" happened to already match exactly, which is why it was the one exercise already showing real numbers in the screenshots. Fixed by renaming 16 distinct logged exercise names to their canonical `SESSIONS` equivalents wherever the same movement could be confidently identified (left 3 genuinely ambiguous ones — e.g. "Upper back pull machine" could be either lat pulldown or seated cable row — untouched rather than guess wrong). Applied live via TOC's `POST /api/projects/operations/data` (the same path the app itself uses to sync), not a direct file edit, then verified end-to-end against the real running app at `http://127.0.0.1:8081` — Session 1's 7 gym exercises went from 1/7 to 7/7 resolving to real adaptive data.

**Bug 2 — tier-3 "starter" fallback only checked one BEGINNER_RX list, then (once fixed) over-matched onto warm-up/cool-down stretches.** `computeTargetFallback()`'s tier-3 branch picked either `BEGINNER_RX[skey].gym` or `.bw` based on `opts.rich` (today's gym-access flag) — but a `SESSIONS` session's work list actually mixes bodyweight-only accessory moves (glute bridge, pike push-ups, hollow-body hold) with gym-equipment lifts even on a gym day; nothing in the app ever swaps a session wholesale. Since those bodyweight accessories only exist in the `bw` list, they had zero row to match on a gym day and fell all the way through to vague generic effort prose ("3–4 sets, leave 1–2 reps in the tank") with no actual numbers — a second, independent path to the same "not using coach" complaint. First fix (search both `gym` and `bw` lists, richer list first) immediately surfaced a second real bug: `cgFindRxRow()`'s word-overlap matcher started false-matching warm-up/cool-down stretches against unrelated `BEGINNER_RX` strength rows purely because of common short words (e.g. "Doorway chest/shoulder stretch (hold 30s ×2)" scored 0.5 overlap against "Hollow-body hold" on the single word "hold", clearing the matcher's ≥0.5 threshold) — stretches started showing nonsense like "20s × 3 sets (rest 45s)" copied from an unrelated lift. Root cause: `BEGINNER_RX` was only ever designed to describe a session's work-phase exercises, never the shared warm-up/cool-down stretch libraries, which carry an `_phase` tag (`"warmup"`/`"cooldown"`/`"flex"`) precisely because they're pooled separately. Fixed by gating the whole tier-3 branch on `exArg._phase` not being warm-up/cool-down/flex, restoring the correct generic stretch prose for those phases while work-phase items keep their real starter numbers. (This narrower over-match risk likely predates this session on bodyweight-only days too, since `rx.bw` alone already contained "Hollow-body hold" — the phase guard fixes it everywhere, not just the newly-widened gym-day path.)

Verified behaviorally via throwaway Playwright scripts (deleted after use) against the real running app at `http://127.0.0.1:8081`: all 7 Session 1 exercises (gym), all 6 Session 4 exercises (gym), and 6 of 7 Session 3 exercises (gym) now resolve to real adaptive/starter numbers with correct per-exercise data (spot-checked several against the raw logged sets to rule out cross-exercise data bleed — confirmed real, not a bug); warm-up/cool-down items across bodyweight and gym modes for Sessions 1/3/4 confirmed back to correct generic prose with zero false `BEGINNER_RX` matches.

Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v197`. `npm run package` → produced `dist/operations.zip`.

### v198 — Warm-up/cool-down items now get real, phase-appropriate targets instead of wrong strength-set prose

**Files changed:** `src/tabs/log.js`.

Direct follow-up to v197: Wyatt asked to "do warmups" — the fix for the main session's exercise list still left warm-up/cool-down items (leg swings, hollow-body prep, static stretches) showing `computeTargetFallback()`'s tier-4 generic text, which is intensity-based strength-set prose ("3–4 sets, leave 1–2 reps in the tank", "3 sets, push the hold/effort"). That text is actively wrong for warm-up/cool-down movement prep — nobody grades effort or does graded working sets on a leg swing — because `exLiHtml()` passes the same session-level `intensity` to warmup/cooldown calls as it does to real work-phase exercises, and the generic tier never distinguished phase.

**Fix:** added a phase-aware branch at the top of tier 4, gated on the same `isWarmCool` flag tier 3 already uses. Most `STRETCH_LIBRARY` exercise names already carry their own real rep/hold spec in a trailing parenthetical (`"Leg swings, front-to-back (10/leg)"`, `"Doorway chest/shoulder stretch (hold 30s ×2)"`) — extracted via a regex requiring at least one digit inside the parens (so descriptive asides like `"(don't hold stretches cold yet)"` on the hardcoded cardio-raise warm-up aren't mistaken for a spec) and surfaced directly as the target, with a short phase-appropriate qualifier appended ("easy and controlled" for warm-up, "relaxed, breathe through it" for cool-down/flex) instead of the strength-oriented language. Entries with no embedded spec fall back to the qualifier alone rather than inventing a number.

Verified against the real running app: "Leg swings, front-to-back (10/leg)" now shows "10/leg — easy and controlled" instead of "3–4 sets, leave 1–2 reps in the tank"; "Doorway chest/shoulder stretch (hold 30s ×2)" now shows "hold 30s ×2 — relaxed, breathe through it" instead of "3 sets, push the hold/effort"; the hardcoded cardio-raise warm-up (no real spec in its parenthetical) correctly falls back to "easy and controlled" alone. Work-phase exercises (adaptive/starter tiers, fixed in v197) are unaffected.

Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v198`. `npm run package` → produced `dist/operations.zip`.

### v199 — Today tab's compact session preview now shows real numbers too

**Files changed:** `src/tabs/plan.js`, `src/styles/main.css`.

Closing the last piece of the "make everything use coach properly" ask: `dawnSessionHtml()` (the compact session card on the Today/Dashboard tab, above the Daily Orders checklist) only ever listed exercise names, by original design, as a lightweight teaser linking to "Full plan →" for detail. Asked Wyatt directly whether that was fine as a minimal preview or should also carry real numbers — he wanted the numbers.

**Fix:** each exercise row now calls the same `computeTarget(e,{skey:p.sessionKey,intensity,rich:todayGym})` that Coach Today and the Session-N reference cards use — same engine, same tiers, so the compact preview can never show a different (or absent) number than the full Coach Hub page. Restructured `.ds-ex` into a flex row (`.ds-ex-n` name / `.ds-ex-tgt` target, name-left target-right, reusing the gold-bright target color already established by `.rx-ex-tgt`) instead of a single plain text line.

Verified against the real running app and a real screenshot of the card: all 7 Session 1 exercises show their real target inline, readable at a glance, no wrapping/overflow issues even with the longest exercise/target strings in today's session.

Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v199`. `npm run package` → produced `dist/operations.zip`.

### v200 — Two real, confirmed bugs found by a fresh 3-agent audit of the rest of the app

**Files changed:** `src/tabs/board.js`, `src/tabs/records.js`.

Wyatt asked for another audit-driven redesign candidate, comparable in scope to the FM subsystem work. Ran 3 parallel read-only audit agents covering everything not recently touched: (1) skills/pyramid/tree/garden/trophies, (2) test/quizzes/records/board/awards, (3) the daily-loop tabs (Today/Quests/Dailies/Bosses/Shop/Weight/Profile). All 3 surfaced genuine "FM-redesign-sized" candidates (see the next planning-doc entry for the chosen one and the full list); this entry covers two small, unambiguous, live bugs found along the way and fixed immediately rather than bundled into a larger redesign:

- **`board.js`'s Board-task completion handler called `grant(20,10,"Board prep task done","knowledge")`** — `"knowledge"` isn't a real path key (the valid keys are `SK_CAT_ORDER`; `"knowledge"` is only ever the *display name* substring of `academic`, "Path of Knowledge"). This silently created and grew an `S.pathXP.knowledge` bucket that Garden/Tree/every category-driven loop never reads — completing Board tasks granted XP into a black hole, invisible forever, and any level-up would have shown a broken toast (`{icon:"⭐",name:"knowledge",idol:"knowledge"}` fallback). Fixed to `"academic"`, matching the intent (Board prep for academic/officer requirements).
- **`records.js`'s `exportBattleBuddyReport()` read the wrong fields**: `a.n` (should be `a.title` — confirmed against every award-writing call site, which never write `.n`) and `S.events`'s nonexistent `.hours` field instead of the real `S.volunteer` array. Every Battle Buddy Report ever generated showed blank/undefined bullets under Awards and always reported "Volunteer hours logged: 0," even for a save with real awards and volunteer history.

Verified behaviorally: seeded a fake award + volunteer entry and confirmed the export logic now reads `"Test Award"` and sums `12.5` hours correctly; confirmed `grant(...,"academic")` credits the real `academic` bucket and no `knowledge` bucket is created.

Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v200`. `npm run package` → produced `dist/operations.zip`.

### v201 — Fixed the broken Path-development math (first of 3 confirmed post-audit redesigns), and found the real root cause of the v195 "cosmetic NaN" warning along the way

**Files changed:** `src/core/skills-core.js`, `src/core/tree.js`, `src/tabs/skills.js`, `src/tabs/plan.js`.

The v200-session's 3-agent audit's top finding: `catRolledLevel(cat)` (averages a Path's level across every "top-level" skill) became structurally broken once the Commons-layer work (v150–v167) added ~10,000 flat per-Path skills that use `setKey`, not `parent` — so they all count as "top-level" in that average. A developed Path (e.g. 40 skills leveled to 5) now computes a permanent near-zero ("Lv 0.1"), regardless of real progress, and that broken number was still shown in 3 places: the Tree's world label, both corners of every Skills-tab deck header, and Plan's "Overall physical level" line. `catProgressFraction()` (added v172, correctly scaled) was already the fix — just never finished being wired into the other 2 call sites.

Wyatt confirmed 2 direction decisions via `AskUserQuestion` before implementing: (1) `catProgressFraction()` as a % becomes the one canonical Path-development number everywhere — swapped into the Skills-tab deck header (`skills.js`) and Plan's headline (`plan.js`, reworded from "Overall physical level: X" to "Overall physical development: X% of your full physical pyramid's level-depth reached so far" to stay honest about what the % actually measures); the Tree's world label (`tree.js`) already computed `progress` correctly for its glow, so it just needed the redundant broken "World Lv X ·" prefix removed, leaving only the % it already had right. `catRolledLevel()` itself is now fully dead (confirmed via a repo-wide grep with zero remaining call sites) and was deleted from `skills-core.js`. (2) The Garden/Grove's idol growth (`S.pathXP`) barely reflected real skill leveling for 6 of 10 Paths — every skill level-up (`skPass()`/`skReachLevel()` in `skills-core.js`) hardcoded `+15 XP` to `academic` specifically regardless of what Path the skill belonged to ("skill growth feeds the Academic path lightly," a deliberate but narrow original design). Changed both call sites to credit `sk.cat` (the leveled skill's own Path) instead — now leveling a tactical skill genuinely grows the War idol, matching the Grove's own "every deed you complete is offered to a Path" intro copy, which was already accurate wording, just not matched by the code.

**Found the real cause of the v195-flagged "cosmetic `<circle>` NaN warning"** (previously investigated this session and NOT reproduced across 6 sparse-data scenarios) as a side effect of testing this fix: seeding ~40 physical skills to level 5 to verify `catProgressFraction()` reliably reproduced it. Traced to `skEmblemSvg`'s `_physical()` sigil generator (`skills.js`): `s1=s>>2&2` (a seed-hash bitmask) can only ever produce `0` or `2`, but the code immediately below does `ns=1+s1` to index a 2-element position array `[-3,3]` — when `s1===2`, `ns===3`, and the loop reads `[-3,3][2]`, an out-of-bounds `undefined`, producing `cx="NaN"` on one ember-cluster circle. The correct mask is `&1` (confirmed by comparison: `_roots()`, a sibling emblem function in the same file, already uses the correct `s>>2&1` for the identical pattern — this was a copy-paste typo, not a design choice). Fixed the one broken occurrence (`_physical`); grepped for the same `>>2&2` pattern elsewhere and found 2 more (`_leadership`, `_hearth`) — inspected both and confirmed neither has the same array-overflow risk (`_leadership`'s `s1` only feeds a 2-way `if/else`, so `{0,2}` is still a valid fair split; `_hearth`'s 3-way switch does lose one visual variant to the same mask bug, but it's a minor variety-loss, not an error, and fixing it well needs a different, non-matching mask — left as a separately-notable minor item, not fixed in this pass since it wasn't the thing being chased).

Verified behaviorally end-to-end via a throwaway Playwright script (deleted after use): leveled 40 real physical skills to 5, confirmed `catProgressFraction("physical")` computes a small honest % (not near-zero, not NaN) and that exact % renders identically in the Skills-tab deck header and Plan's headline; confirmed `catRolledLevel` is fully gone (throws `ReferenceError` if called); confirmed leveling a tactical skill via `skReachLevel()` now grows `S.pathXP.tactical` while `S.pathXP.academic` stays untouched; confirmed zero `circle[cx="NaN"]` elements exist anywhere in the DOM after the same skill-leveling seed that previously produced 6 real console NaN warnings. `npm run regress -- --shot` re-confirmed the Tree renders cleanly.

Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` (incl. `--shot`) → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v201`. `npm run package` → produced `dist/operations.zip`.

### v202 — Second confirmed post-audit redesign: the 2 permanently-stuck-at-0 skills now actually level

**Files changed:** `src/tabs/test.js`, `src/tabs/awards.js`, `src/core/auto-level.js`, `src/styles/main.css`.

The v200-session audit's #2 finding: `Pattern recognition` (`auto:"test:patterns"`) and `Memory retention` (`auto:"quiz:retention"`) were both locked as auto-leveling but had nothing in `test.js`/`auto-level.js` that actually fed them — permanently stuck at level 0. `Memory retention`'s own `howTo` copy directly contradicted its lock ("there is no automatic leveling for this skill yet — honesty here is the whole point"). Wyatt confirmed both directions via `AskUserQuestion`: build a real 10th stealth-assessment game for Pattern recognition (sequence-prediction mechanic, "Signal Intercept" theme), and wire Memory retention to real SRS stats instead of leaving it dead.

**Signal Intercept (Pattern recognition)** — a genuinely new construct, not a re-skin of an existing test. Player watches a flashed sequence of blips generated by a hidden modular rule (a repeating cycle, or two interleaved cycles in "alt" mode) and predicts the next blip from 4 choices. Difficulty escalates across 8 rounds via symbol-pool size, step size, and single-vs-interleaved rule — not sequence length alone, which would just be digit span again. A generator closure (`siMakeGenerator`) is the single source of truth for both the flashed sequence and the correct answer, avoiding any re-derivation-from-the-tail-of-the-array bug class. `scoreToLevel` deliberately caps at L7 of the skill's 10-level ladder — same honest-capping precedent as `nback` capping at L8 (dual n-back isn't built either): the top 2 rungs describe subtle/positional rules and abstract matrix-style puzzles, a different visual format this game doesn't attempt. Wired into `TESTS`, `FOCUS_TILES`, `testUnit()`/`testSuggestion()`, and `awards.js`'s `data-teststart` dispatch chain (a hardcoded if/else list per test id, not automatic from the `TESTS` array — checked and added the new id there before any testing, since it's an easy thing to forget when adding a game).

**Memory retention** now levels from real SRS review quality: a card's SM-2 ease factor (already computed by the existing `srsGrade()`) is the standard measure of how easily material is actually being retained — no invented formula, just reading data the app already produces. Only counts "mature" cards (`reps>=2`, survived past the initial-learning churn) so early noise can't move the level, and stays silent (level 0) below a 3-card minimum sample, matching the app's established "don't compute from noise" precedent (X-Insight). The skill's full 10-level ladder references things this data doesn't track (day-streaks, sustained time windows, memory-palace integration for L4/L8) — deliberately capped at L5 ("Practitioner" tier) rather than faking the System-Builder/Master tiers.

**Verified extensively, given this is new game surface:** a throwaway Playwright script sanity-checked the sequence generator and multiple-choice logic across all 8 rounds × 20 random trials each (160 checks, zero failures — always exactly 4 unique choices, correct answer always among them, no undefined/NaN). Played the game for real (actual flash timing, actual clicks) through all 8 rounds twice, confirming correct-answer detection and round progression. Hit an intermittent "Target crashed" browser error during testing — traced it to 44+ orphaned Chromium processes accumulated from this session's extensive Playwright use (not a code defect): confirmed via a clean-environment re-run (0 leftover processes) completing 8 real rounds without issue, and via a DOM-node-count probe across 5 rounds showing a perfectly constant node count (no leak). Confirmed `recordTest("patterns", 5)` correctly levels the skill 0→5. For Memory retention, confirmed 3 scenarios: too few mature cards stays at 0 (silent, no fabricated level); a small 15-card deck at moderate ease levels to 2; a large 120-card deck at high ease reaches the intended L5 cap exactly, never exceeding it.

Full ship checklist: `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. No `SEED_SKILLS`/ladder content touched, `SKILL_LADDER_VER` stayed at 118. SW bumped to `operations-v202`. `npm run package` → produced `dist/operations.zip`.
