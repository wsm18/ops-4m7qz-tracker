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

### Color palette (CSS variables — current as of v109)

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

### v149 — Commons-layer prerequisite: every Uncommon now has a unique, unshared Commons-tier key
**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v149`. `SKILL_LADDER_VER` unchanged at **116** (no ladder/guidance text touched — only `synthesizedFrom` metadata). Total skills: **2524** (unchanged — no skills added or removed, only relinked).

The Commons layer (base tier, the last unwritten piece of the pyramid) is designed on the same 5:1 ratio as every other tier: 5 Commons synthesize into 1 Uncommon, matching 5 Uncommons → 1 Rare → 1 Legendary → 1 Mythic. Before any Commons content gets written, every Uncommon needs its own unique, unshared placeholder `synthesizedFrom` key (pattern `<path>_c_<slug>`) for its future 5-member Common set to attach to. Audited this directly (walked every Mythic → Legendary → slot-holder → Uncommon-feeder chain, 2000 total feeder members) and found it wasn't true yet:

- **6 Uncommons had no `synthesizedFrom` at all** (all tactical: `Marksmanship (M17 / pistol)`, `Wilderness medicine / CASEVAC`, `9-line MEDEVAC`, `SALUTE / spot reporting`, `Rappelling & vertical movement`, `Grenade employment`) — no path to a future Commons set existed for them.
- **10 placeholder keys were each shared by 2–5 different Uncommons** (34 skills total) — e.g. `phys_c_cqc_striking` was claimed by `Stance & footwork`, `Punch`, `Elbow`, `Knee`, and `Kick` simultaneously. This is the exact bug class fixed once before in v145 (`skCombineSet()` only ever unlocks the *first* seed matching a given `synthesizedFrom`), just one tier down — building 5 Commons under `phys_c_cqc_striking` would only ever have synthesized `Stance & footwork`; the other 4 skills would've been permanently unreachable via synthesis.

**Fix:** assigned 6 new unique keys to the orphans and split each collision group so every one of the 34 affected skills got its own unique key (the first-listed member of each group kept its original key; the rest got new ones). Verified via a fresh Node-module audit: **0 orphans, 0 collisions, exactly 2000 unique Commons-tier keys for exactly 2000 Uncommons** — a clean 1:1 mapping, ready for 5-per-key Commons content whenever that work starts.

**Two more instances of the pre-existing name+cat duplicate problem (from the v148 entry's "10 collisions" list) surfaced mid-fix and were corrected in place:** `Penetration testing methodology` and `Legal literacy` each exist twice in `cat:"technical"`/`cat:"personal"` respectively — once as an older wired-in Rare/Uncommon with its own working `synthesizedFrom`, once as a newer pyramid-native duplicate. A brace-matched name-search script initially patched the *wrong* one of each pair (the older, already-correct one) before this was caught by a targeted re-verification pass checking every fix against its expected key; both were corrected to target the right object, and the older objects' original working links (`tech_u_pentest`, `pers_c_legal_literacy`) were restored untouched. **Lesson:** when scripting a fix keyed only on `name`, always verify against `cat` (and ideally `setKey`, since these two are the actual disambiguator when `name`+`cat` isn't unique) — see the v148 entry's still-open duplicate-name list before assuming any name lookup is unambiguous.

**Next workstream:** the Commons layer itself — exactly 10,000 cards now (2000 keys × 5), a genuinely multi-session effort. Pick a bounded slice (one or two paths) and scope it in a fresh `IMPROVEMENTS-vNNN.md` before writing content, same discipline as every prior pyramid-tier session.

**Next workstream is unchanged from the v147 entry above:** the Commons layer (base tier, currently unwritten for all 15 paths) is the next real work — the legacy pyramid trees never needed structural repair in the first place.

Verified with a script-based structural audit (not the stale doc): re-ran the same Node-based `SEED_SKILLS` audit after writing, confirming **zero** Rare-layer gap and **zero** Uncommon-layer gap across every true-Rare in cognitive, physiological, technical, academic, personal, and hearth. `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:2578`.

**Next workstream:** the Commons layer (base tier, currently unwritten for all 15 paths) is now unblocked — the legacy pyramid trees are a genuinely clean 5/5/5 through the Uncommon layer, matching the second-generation trees.

### v150 — Commons layer, first tree: Physical Mastery (625 new seeds)

**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v150`. `SKILL_LADDER_VER` unchanged at **116** (pure addition, no existing ladder/guidance text touched). Total skills: **3149** (2524 + 625).

First Commons-layer content session. Scoped to exactly one full Mythic tree — **Physical Mastery** (`cat:"physical"`, `setKey:"phys_mythic"`) — chosen because it has zero known name+cat collision risk (the 10 pre-existing duplicates are all in `technical`/`personal`/`cognitive`) and the domain (PT) is the most naturally measurable for a first Commons batch. Wrote exactly 5 new Common-tier skills against each of the 125 pre-existing `phys_c_*` placeholder keys under this tree (5 Legendaries × 5 Rares × 5 Uncommons × 5 Commons = 625), verified via `IMPROVEMENTS-v150.md` (deleted after implementation).

**Common card shape (new, no precedent before this session):** `rarity:"common"`, `fadeDays:30`, 4-item `levels`/`roadmap`/`advance`/`maintain` arrays (shorter than the 5-item Uncommon tier — Commons are the floor of the pyramid, kept deliberately terser in both content and byte footprint given the eventual 10,000-card target). No `synthesizedFrom`/`unlockHint`/`tiers` fields — nothing combines into a Common.

**Execution:** pre-placed 125 `// SLOT:<setKey>:<uncommonName>:physical` markers (with parent why/howTo as context) directly in the file, then dispatched one subagent per parent Rare (5 setKeys/25 skills per agent, 25 agents total) — the same pattern established in v145–v147. A first dispatch wave hit an account-wide session-limit cutoff partway through; most agents stopped mid-task, leaving the file in a syntactically broken state (one missing trailing comma) and 66 of 125 setKeys done (4 of those with only 4/5 Commons — an agent had been cut off between writing its content and finishing the count). Fixed the syntax break, hand-wrote the 4 missing 5th Commons directly, then re-dispatched fresh agents (one canary + 13 more, some full 5-setKey groups, some partial remainders) for the remaining 59 setKeys once the limit had visibly lifted (confirmed via a successful canary run before the full re-dispatch). All 13 succeeded this time.

**Two real name+cat collisions surfaced from the concurrent writing** (two different agent dispatches, working from different parts of the tree, independently chose the same sleep-related names — `Sleep Duration Logging` and `Caffeine Cutoff Discipline` — for both the `phys_c_sleep_protocol` set, written by my own manual fix, and the pre-existing `phys_c_sleep_duration`/`phys_c_sleep_hygiene` sets from an earlier wave). Caught by the standard post-write duplicate sweep (not by any agent's own pre-check, since agents can't see each other's concurrent writes) and renamed to `Bed and Wake Time Logging` and `Afternoon Caffeine Cutoff`. **Lesson confirmed again:** the duplicate-name risk in concurrent bulk-writing isn't just against the pre-existing file — it's against sibling agents' output too, invisible until everyone's done, so the final sweep is load-bearing, not a formality.

Verified: `node --check` syntax OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:3149`. Full member-count sweep: 625 common-rarity skills across exactly 125 setKeys, every key with exactly 5 members. name+cat duplicate sweep: exactly 10 (the known pre-existing list, zero new ones after the rename fix).

**Next workstream:** 9 more Mythic trees' worth of Commons remain — 9,375 cards. Pick the next tree (any of the other 15, still zero known collision risk outside `technical`/`personal`/`cognitive`) and repeat this session's process. If dispatching another large parallel-agent wave, budget for the possibility of an account-wide session-limit interruption mid-wave — check for a broken/partial state (syntax check + marker-count sweep) before assuming a wave completed cleanly, the way this session had to.

### v151 — Commons layer, second tree: Keeper of the Flame (625 new seeds), recovered from a v150-session interruption

**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v151`. `SKILL_LADDER_VER` unchanged at **116** (pure addition). Total skills: **3774** (3149 + 625).

This session opened mid-interruption: a prior v151 attempt had hit an account-wide session-limit cutoff during its first large parallel dispatch, leaving 7 leftover `_group*_replacement.txt`/`_group*_block.txt` files in the repo root (valid, unapplied agent output for 35 of the tree's 125 setKeys) and 112 still-unwritten `// SLOT:` markers in `src/core/skills-data.js`. First action was diagnosing this state rather than trusting it: `node --check` showed the file was actually syntactically intact this time (unlike the v150 interruption), and a marker/setKey sweep confirmed the 7 leftover files' 35 setKeys didn't overlap with the 13 setKeys already written directly into the file — so all 7 were genuine, safe-to-apply agent output, not stale or conflicting. Applied them via a small Node script matching each file's `setKey`s to their corresponding marker lines and replacing the marker block in place (same technique as the rest of this session), then deleted the scratch files.

**Scope:** completed the remaining 90 setKeys (450 skills) for the **Keeper of the Flame** tree (`cat:"hearth"`, `setKey:"hearth_mythic"`) — the tree the interrupted session had already chosen and partially started. Given the user's explicit instruction to run this more conservatively than the v150 session's 25-agent single-wave dispatch (which was the direct cause of that session's interruption), work was split into **4 sequential waves of 4 agents each** (16 agents total, capped at 5 setKeys/25 skills per agent as usual) instead of one large wave, with a full `node --check` + member-count verification after every wave before starting the next — cheap insurance against another mid-wave cutoff losing more than 4 groups' worth of work at a time.

**Two real defects surfaced by the post-write verification sweep, both fixed directly rather than by re-dispatching agents:**
1. **6 setKeys with only 4/5 members instead of 5** — traced to the two oldest leftover files (`_group1_replacement.txt`, `_group5_replacement.txt`) from the interrupted prior session, which had themselves only generated 4 Commons for `hearth_c_post_mission_check`, `hearth_c_deficiency_tracking`, `hearth_c_multi_tool`, `hearth_c_cutting_tools`, `hearth_c_measuring_marking`, and `hearth_c_power_tools` before that session was cut off — a defect inherited from before this session started, not introduced by it. Wrote one additional Common skill by hand for each (`Field Loss Prevention Count`, `Fault Correction Deadline Tracking`, `Multitool Pliers Torque Control`, `Batoning Technique`, `Fractional-to-Metric Conversion Reading`, `Power Tool Kickback Prevention`), checked against the rest of the file for name+cat collisions before inserting.
2. **One new name+cat collision**: `Water Source Risk Assessment` was independently generated for the new `hearth_c_water_purif` setKey, colliding with a pre-existing skill of the same name under `hearth_c_water_procurement` from an earlier (pre-v150) session. Caught by the standard duplicate sweep and renamed to `Pre-Treatment Water Source Selection`.

Verified: `node --check` syntax OK, member-count sweep — all 125 `hearth_c_*` setKeys have exactly 5 members (0 bad, down from 6), name+cat duplicate sweep — 0 new duplicates (the same 10 pre-existing ones from before this session are still present and untouched, as expected). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:3774`.

**Lesson for future interruption recovery:** don't assume an inherited partial-batch file is internally complete just because it parses and its setKeys don't collide — count members per setKey even on leftover/inherited content, not just newly-generated content. The 6 short setKeys in this session came from files that looked identical in format and quality to the other 5 leftover files, and would have shipped short without the full sweep.

### v152 — Commons layer, third tree: Tactical Mastery (625 new seeds)

**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v152`. `SKILL_LADDER_VER` unchanged at **116** (pure addition, no existing ladder/guidance text touched). Total skills: **4399** (3774 + 625).

Third Commons-layer tree, chosen for zero known name+cat collision risk (`tactical` is outside the technical/personal/cognitive collision list) and strong domain fit for measurable ROTC content. Wrote all 625 Commons (125 setKeys × 5) for the **Tactical Mastery** Mythic tree (`cat:"tactical"`, `setKey:"tac_mythic"`): 5 Legendaries (Combat Soldier, Field Operator, Leader's Tools, Intelligence & Reporting, Tactical Specialties) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:tactical` markers (with parent why/howTo as context) in one edit, grouped by the 25 slot-holders, then dispatched one subagent per slot-holder group (5 setKeys/25 skills per agent) in 7 sequential waves of 4 agents each (the last wave was a single agent for the 25th group) — continuing the smaller-wave discipline from v151 rather than v150's single 25-agent dispatch. Ran a full `node --check` + rarity-agnostic member-count sweep after every wave before starting the next one, catching problems immediately rather than at the end. No account-wide session-limit interruption occurred this session.

**One process defect caught by the after-every-wave discipline:** the wave-3 "Military Law Practitioner" agent wrote all 25 skills correctly (verified 5/5 members per setKey) but left 4 of its 5 marker comment lines in place instead of deleting them — harmless since they're JS comments and don't affect parsing or member counts, but stale cruft that would have looked like unfinished work on a later grep. Caught by the routine post-wave `grep -c "SLOT:"` sweep (count didn't match the expected reduction), diagnosed by reading the surrounding lines, and fixed with a small Node script asserting each stale marker occurred exactly once before removing it. Later waves were told explicitly to delete marker text as part of their replacement, and none repeated the mistake.

**Several agents self-caught and fixed their own defects before reporting done** (a good sign the per-agent verification instructions are working): two agents each found they'd only written 4/5 skills for one setKey (CBRN Reporting in wave 1, Prusik System Troubleshooting in wave 6, Reporting While Directing a Bound in wave 5's Contact Reporting group) and added the missing skill themselves during their own count verification, before reporting completion. Several agents also found and avoided real name+cat collisions against existing content: "SPOTREP Proword Sequence" (renamed from a colliding "Proword Usage"), "Cover & Concealment Terrain Reading" (renamed from a colliding "Cover and Concealment Assessment"), and four MACP/combatives names renamed to avoid collisions with pre-existing `phys_c_*` takedown/sprawl/guard skills.

Verified: `node --check` syntax OK, full recursive member-count sweep of the entire `tac_mythic` tree (not just per-wave slices) confirmed exactly 125 setKeys checked, all with exactly 5 Legendaries/slot-holders/Uncommons/Commons at every tier — a genuinely clean 5/5/5/5 for the whole tree. Name+cat duplicate sweep across the whole file: still exactly the same 10 pre-existing duplicates from before this session, zero new ones. Unique Commons feeder key count (`_c_` keys) unchanged at 2000, confirming no accidental key reuse. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:4399`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 7 more Mythic trees' worth of Commons remain — 4,375 cards (Battlefield Commander, Cyberspace Operations Officer, Master of the Mind, Vital Operator, Scholar-Warrior, Sovereign Self, The Living Root — plus the 6 second-generation Phase 7 trees beyond that). Repeat this session's process: pre-place markers, dispatch in small sequential waves, verify after every wave (both the syntax/member-count sweep and, per this session's finding, a stale-marker-text check), then a full whole-tree recursive sweep at the end before build/package.

### v153 — Commons layer, fourth tree: Battlefield Commander (625 new seeds)

**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v153`. `SKILL_LADDER_VER` unchanged at **116** (pure addition, no existing ladder/guidance text touched). Total skills: **5024** (4399 + 625).

Fourth Commons-layer tree, chosen for zero known name+cat collision risk (`leadership` is outside the technical/personal/cognitive collision list). Wrote all 625 Commons (125 setKeys × 5) for the **Battlefield Commander** Mythic tree (`cat:"leadership"`, mythic setKey `lead_mythic`, legendary setKey `lead_leg`): 5 Legendaries (Command Presence, People Development, Operational Mastery, Communication Mastery, Character & Ethics) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:leadership` markers (with parent why/howTo as context) in one edit, grouped by the 25 slot-holders, then dispatched one subagent per slot-holder group (5 setKeys/25 skills per agent) in 7 sequential waves of 4 agents each (the last wave was a single agent for the 25th group), continuing the v151/v152 smaller-wave discipline. No account-wide session-limit interruption occurred this session.

**Two real defects caught by verifying after every wave, not just member/marker counts:**
1. **A sibling-agent name collision within the very first wave**: two of the four wave-1 agents (Drill & ceremony and Physical Bearing Standards, both writing concurrently) independently chose the identical name "Position of Attention Precision" for two different setKeys (`lead_c_dc_stationary` and `lead_c_posture`). Neither agent's own pre-write grep caught it since each only checked against content that existed *before* the wave started, not against a sibling agent's simultaneous output. Caught by the standard whole-file name+cat duplicate sweep run immediately after the wave (which found 11 duplicates instead of the expected 10), fixed by renaming the `lead_c_posture` copy to "Foundational Attention Posture Check."
2. **A missing required field across an entire agent's output**: while fixing the naming collision, the `lead_c_posture` skill was also found to be missing its `howTo` field entirely — and further investigation showed the *same* agent (Physical Bearing Standards) had omitted `howTo` from all 25 of its 25 skills, despite the task prompt showing the exact required object shape. A pure member-count sweep would never have caught this (all setKeys still had exactly 5 members); it surfaced only because a new full required-field validator (checking every field's presence, plus array lengths, rarity, fadeDays, and absence of stray fields) was written and run for the first time this session, as a direct response to the naming-collision investigation. All 24 missing `howTo` values were hand-authored (matching each skill's `why`/`advance` context) and inserted via a small Node script; re-running the validator confirmed zero remaining gaps. **From this wave onward, every subsequent wave's agent prompt was strengthened** to explicitly warn about this exact prior mistake and require the agent to self-verify both `why:` and `howTo:` are present as separate fields before reporting done — no wave after the first repeated either defect.

**Process change carried forward:** the post-wave verification checklist now includes, in addition to the syntax check, member-count sweep, and marker-count sweep established in v150–v152, a full required-field/array-length validator run across every wave's new skills (and once more across the whole finished tree at the end). A pure member-count+marker-count sweep is necessary but not sufficient — it cannot detect a structurally-valid-but-incomplete skill object.

Verified: `node --check` syntax OK, full recursive whole-tree sweep of `lead_mythic` confirmed exactly 125 setKeys, 625 Commons, 5/5/5/5 at every tier (Mythic → 5 Legendaries → 25 slot-holders → 125 Uncommons → 625 Commons), zero orphans. A full required-field validator run across all 625 Commons together (not just per-wave) found zero remaining problems and zero internal name duplicates. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones (after the one collision fixed mid-session). Unique Commons feeder key count (`_c_` keys) unchanged at 2000, confirming no accidental key reuse. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:5024`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 6 more Mythic trees' worth of Commons remain — 3,750 cards (Cyberspace Operations Officer, Master of the Mind, Vital Operator, Scholar-Warrior, Sovereign Self, The Living Root — plus the 6 second-generation Phase 7 trees beyond that). Repeat this session's process, and specifically carry forward the required-field validator introduced this session — it is now part of the standard after-every-wave sweep, not an optional extra.

### v154 — Commons layer, fifth tree: Vital Operator (625 new seeds) — survived two real file-corruption incidents

**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v154`. `SKILL_LADDER_VER` unchanged at **116** (pure addition, no existing ladder/guidance text touched). Total skills: **5649** (5024 + 625).

**First, a correction discovered mid-session:** v153 (Battlefield Commander, above) had never actually been committed to git — the entire session's work existed only in the uncommitted working tree, sitting alongside this session's own uncommitted marker-placement and wave work with zero git-level safety net. This is directly why the incident below required a manual OneDrive recovery instead of a trivial `git checkout`. This session's closing commit finally lands both v153 and v154 in git together.

Fifth Commons-layer tree, chosen for zero known name+cat collision risk (`physiological` is outside the technical/personal/cognitive collision list) and strong domain fit (recovery/nutrition/biometrics/stress are all directly measurable). Wrote all 625 Commons (125 setKeys × 5) for the **Vital Operator** Mythic tree (`cat:"physiological"`, mythic setKey `phys2_mythic`, legendary setKey `phys2_leg`): 5 Legendaries (Recovery Mastery, Nutritional Command, Mobility & Durability, Biometric Mastery, Stress Physiology) × 5 slot-holder Rares each (one, Resting heart rate, is a pre-existing Joker/auto skill legitimately occupying a real slot) × 5 Uncommons each × 5 new Commons each.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:physiological` markers (with parent why/howTo as context) in one edit, grouped by the 25 slot-holders, then dispatched sequential waves of subagents (waves 1–4 at 4 agents/wave, waves 5–7 reduced to 2 agents/wave after the incidents below).

**Incident 1 — file truncation.** During wave 3, all 4 concurrent agents hit a simultaneous stall/API failure mid-wave (an account-wide infrastructure interruption, the same class of incident seen in v150/v151). Recovered cleanly: a small canary agent confirmed the interruption had lifted, then the 3 unfinished groups were re-dispatched with zero data lost (the 4th group, Body Composition Nutrition, had already gotten 4/5 setKeys done before the stall and those were verified clean before continuing).

During wave 4, a much more serious incident occurred: multiple agents fell back to script-based edits (per the established fallback pattern for Edit-tool staleness conflicts) and one script used Python's `open(path, 'w')` — which truncates a file to 0 bytes the instant it opens, before any content is written. That script raced against another concurrent agent's write and then failed before writing replacement content, leaving `src/core/skills-data.js` at 0 bytes. All background agents were immediately stopped. Investigation found: (a) git HEAD (`cf2216d`) was actually two versions behind the working tree (v152, missing both Battlefield Commander and this session's marker placement — see the correction above), so a plain `git checkout` would have silently discarded far more than the incident itself lost; (b) OneDrive version history had a snapshot from ~23 minutes prior that, by good fortune, captured the state almost exactly at the interruption point. Restored that snapshot and verified it byte-for-byte via the full required-field + member-count + marker-count sweep before trusting it — it held 67 of 125 setKeys cleanly complete, matching exactly what waves 1–3 plus part of wave 4 had produced.

**Incident 2 — a lost-update race, distinct from incident 1.** After switching every remaining agent to a "read fresh → compute new content → write to temp file → atomic rename" pattern (intended to prevent truncation), one already-completed setKey (`phys2_c_self_massage`, 5 skills, verified clean immediately after the OneDrive recovery) was later found reverted back to just its marker comment. Root cause: atomic rename prevents a file ever being *observed* in a truncated/torn state, but it does **not** prevent a "lost update" — if Agent A reads the full file, then Agent B reads the same full file, then A writes its version (with A's edit applied) via rename, then B writes *its* version (computed from before A's edit landed) via rename, B's write silently clobbers A's, even though neither write ever truncated anything. Caught immediately by the routine post-wave member-count sweep (one setKey's count dropped from 5 to 0 with no corresponding new marker-count change to explain it) — fixed by hand-authoring the 5 skills directly rather than risking a third agent dispatch on the same setKey.

**Process change made mid-session as a direct result:** from wave 5 onward, every agent prompt explicitly named both incidents as concrete failure modes to avoid, instructed a strong preference for the Edit tool (which has live staleness detection against the real file, unlike a script working from its own cached read) over any script fallback, and reduced concurrency from 4 to 2 agents per wave. Zero further incidents occurred across waves 5, 6, and 7 — every remaining edit went through the Edit tool directly, no scripts needed.

Verified: `node --check` syntax OK, full recursive whole-tree sweep of `phys2_mythic` confirmed exactly 125 setKeys, 625 Commons, 5/5/5/5 at every tier, zero orphans. A full required-field validator run across all 625 Commons together found zero remaining problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:5649`. `npm run package` → produced `dist/operations.zip`.

**Lesson for future sessions (see `planning/SESSION-TIMES.md` v154 entry for full detail):** atomic rename is necessary but not sufficient for concurrent shared-file writes — it only prevents a torn/truncated file, not a full-file "lost update" when two agents' read-modify-write cycles overlap in time. The only real fixes are serializing writers or preferring the harness's own Edit tool, which does genuine staleness detection against the live file rather than a script's own stale in-memory copy. Also: **commit uncommitted pyramid work to git promptly** — this project had gone two full Commons-tree sessions (v153, v154) without a commit, which is exactly why a routine file-corruption incident turned into a multi-hour recovery investigation instead of a `git checkout`.

**Next workstream:** 5 more Mythic trees' worth of Commons remain — 3,125 cards (Cyberspace Operations Officer, Master of the Mind, Scholar-Warrior, Sovereign Self, The Living Root — plus the 6 second-generation Phase 7 trees beyond that). Repeat this session's process, but adopt the wave-5-onward discipline (Edit-tool-first, 2 agents/wave, no script fallback unless truly necessary) from the start rather than discovering it mid-session. Commit to git at the end of every session from now on, not just when convenient.

### v155 — Retroactive audit: found and fixed real defects that predated the v153 required-field validator

**Files changed:** `src/core/skills-data.js`, `src/core/migration.js`, `sw.js`

SW bumped to `operations-v155`. **`SKILL_LADDER_VER` bumped to 117** (existing guidance text was changed on 12 pre-existing skills and 48 Commons had their `roadmap`/`maintain` arrays rewritten — this is exactly the kind of change that requires a force-resync so old saves pick up the fix). Total skills: **5649** (unchanged — this was a pure content-quality fix, no skills added or removed).

Prompted by a direct question about whether earlier trees got the same scrutiny as the two most recent ones: the full required-field/array-length validator was only introduced mid-way through v153, meaning **Physical Mastery (v150), Keeper of the Flame (v151), and Tactical Mastery (v152) had never been checked with it** — they'd only ever passed the older member-count + marker-count sweeps. Ran the validator retroactively across all 5 completed Commons trees and found two real, previously-undetected defects:

1. **Tactical Mastery (v152):** one skill, `Live-Range Readiness Certification` (`tac_c_grenade_basics`), had `fadeDays:60` instead of the required `30`. Trivial, fixed directly.
2. **Keeper of the Flame (v151):** 74 field defects across 48 skills in 10 setKeys — `maintain` and/or `roadmap` arrays written with only 2-3 items instead of the required 4, using a "Hold L1-L2: ..." grouped shorthand instead of one entry per level. Traced to (at least) two of the original 25 wave-1/wave-2 v151 agents having used this shorthand style throughout their entire batch, which the member-count/marker-count sweeps of the time couldn't catch (every setKey still had exactly 5 members — the defect was purely in array shape, not skill count). Fixed by dispatching 2 focused agents (one per affected group of 5 setKeys) to expand each `roadmap`/`maintain` array to a proper 4-item, one-per-level structure, deriving the content from each skill's own (correct) `levels`/`advance` arrays rather than inventing new guidance. Verified with a bracket-aware array-length checker: 50/50 skills now clean, and a diff-based check confirmed `levels`/`advance` were never touched.

Also ran a broader, tier-agnostic sweep (any pyramid skill — Common through Legendary — missing `why`, `howTo`, or `levels` regardless of its specific shape) across the **entire file**, not just the 5 Commons trees, since Uncommons/Rares were also bulk-written in earlier sessions (v145's 190 Uncommons, v147's 500 Phase-7 Uncommons) via the same SLOT-marker/subagent pattern and could plausibly have the same class of defect. Found **12 pre-existing Uncommon/Rare-tier skills with `howTo` missing entirely** (2 of those, `Strength programming` and `Military writing`, were also missing `why`) — these predate the Commons pipeline entirely, some tagged with old version comments (`// v120: Military writing`), and had simply never been caught because no full-file required-field check existed before this session. Fixed by hand-authoring `why`/`howTo` text for each from their existing `levels`/`advance` content (not part of the bulk-agent pipeline — this was original content grounded in what was already there).

Also re-verified, since finding real gaps warranted not trusting old claims at face value:
- **The "all 16 Mythic trees are a clean 5/5/5 through the Uncommon layer" claim (originally verified v149)** — re-ran the full recursive count (16 Mythics → 80 Legendaries → 400 slot-holders → 2000 Uncommons) fresh. Still holds; no drift.
- **Whole-file name+cat duplicate count** — still exactly the same 10 pre-existing duplicates, zero new ones introduced by any of this session's fixes.
- **Total skill count** — confirmed still exactly 5649 before and after (pure content fixes, no insertions/deletions), and a universal `why`/`howTo`/`levels` presence check across all 5621 pyramid-tier skills (any rarity) now shows zero gaps anywhere in the file.

**Lesson:** a validator introduced partway through a multi-session workstream doesn't retroactively apply itself — the trees that existed before it was written need an explicit retroactive pass, or they silently carry whatever the old, weaker checks missed forever. Worth doing this kind of retroactive audit periodically, not just once. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:5649`. `npm run package` → produced `dist/operations.zip`.

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

### v157 — Commons layer, sixth tree: Scholar-Warrior (625 new seeds) — corrected a stale "5 trees remain" count to the real 11

**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v157`. `SKILL_LADDER_VER` unchanged at **117** (pure addition, no existing ladder/guidance text touched). Total skills: **6274** (5649 + 625).

**Correction found before starting any writing:** the prior `NEXT-SESSION-PROMPT.md` claimed only 5 Mythic trees remained for the Commons layer (naming Cyberspace Operations Officer, Master of the Mind, Scholar-Warrior, Sovereign Self, The Living Root). Re-deriving the count directly from `SEED_SKILLS` (per this project's own standing rule to never trust an inherited doc's numbers) found **11 trees actually remain** — those same 5 legacy-gen trees, plus 6 second-generation Phase 7 trees (Soldier Athlete, Warrior Foundation, Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect) that the doc's own separate "16 Mythic trees + 6 second-gen Phase 7 trees" framing implied but its own next-steps summary undercounted. Verified via a Node script walking every one of the 16 Mythic trees down to their Commons layer: exactly 5 trees (Physical Mastery, Keeper of the Flame, Tactical Mastery, Battlefield Commander, Vital Operator) had 625 Commons each; the other 11, including Scholar-Warrior, had zero. This changes the remaining scope from an estimated 3,125 cards to 6,875.

Sixth Commons-layer tree, chosen by the user from a shortlist after being informed of the corrected count. Wrote all 625 Commons (125 setKeys × 5) for the **Scholar-Warrior** Mythic tree (`cat:"academic"`, mythic setKey `acad_mythic`, legendary setKey `acad_leg`): 5 Legendaries (Scholar's Method, Clear Communicator, Critical Analyst, Polyglot Operator, Domain Scholar) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — all 25 slot-holders were pure Rare cards, no pre-existing Jokers in this tree.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:academic` markers (with parent why/howTo context written directly into each agent's prompt rather than left as file comments) in one edit, grouped by the 25 slot-holders, then dispatched 13 sequential waves of 2 agents each (continuing the v154-established 2-agent-per-wave discipline throughout, never scaling up). Verified after every single wave: `node --check`, a rarity-agnostic member-count sweep, a marker-count sweep, and a full required-field/array-length validator — all four checks, every wave, not just at the end.

**One real defect caught by the after-every-wave discipline:** between wave 8 (ending with the last Uncommon of "Western European Languages") and wave 9 (starting "Romance Languages"), the boundary between the two groups' content was missing its trailing comma — the wave-8 agent's last skill object ended with `]}` instead of `]},` immediately before the next group's `// -- Rare: Romance Languages --` comment, which is a syntactically valid state only in isolation (a comment can follow anything) but breaks the moment the next group's array elements land after it with no separator. `node --check` caught it immediately as an `Unexpected token '{'` at the exact insertion point; fixed with a one-line Edit adding the missing comma. Every subsequent wave's agent prompt (waves 10–13) was given this exact incident as a named failure mode and told to double-check the boundary comma before finishing — zero further occurrences.

Verified: `node --check` syntax OK, full recursive whole-tree sweep of `acad_mythic` confirmed exactly 125 setKeys, 625 Commons, 5/5/5/5 at every tier (Mythic → 5 Legendaries → 25 slot-holders → 125 Uncommons → 625 Commons), zero orphans. A full required-field validator run across all 625 Commons together found zero remaining problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones across all 13 waves. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:6274`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 10 more Mythic trees' worth of Commons remain — 6,250 cards (Cyberspace Operations Officer, Master of the Mind, Sovereign Self, The Living Root, plus the 6 second-generation Phase 7 trees: Soldier Athlete, Warrior Foundation, Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect). Repeat this session's process — 2-agent waves, verify every wave, watch specifically for the group-boundary trailing-comma failure mode found this session in addition to the v152/v153/v154 failure modes already in the standard checklist.

### v158 — Commons layer, seventh tree: Soldier Athlete (625 new seeds)

**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v158`. `SKILL_LADDER_VER` unchanged at **117** (pure addition, no existing ladder/guidance text touched). Total skills: **6899** (6274 + 625).

Re-derived the pyramid state directly from `SEED_SKILLS` before starting, per the project's standing rule: confirmed 6274 total, 6 trees complete (Physical Mastery, Keeper of the Flame, Tactical Mastery, Battlefield Commander, Vital Operator, Scholar-Warrior — 3750 Commons), 10 trees at 0 Commons. Matched the prior session's claim exactly, no drift. User picked **Soldier Athlete** (`cat:"physical"`) from a shortlist of trees outside the three cats with known pre-existing name+cat duplicates (technical/personal/cognitive), to keep the collision-check overhead low on this pass.

Wrote all 625 Commons (125 setKeys × 5) for the Soldier Athlete Mythic tree, mythic setKey `physb_leg`: 5 Legendaries (Close-Quarters Combat Mastery, Army Fitness Excellence, Physical Versatility, Operational Endurance, Physical Leadership) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — all 25 slot-holders were pure Rare cards, no pre-existing Jokers in this tree. Confirmed 0 pre-existing members on all 125 target setKeys before writing.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:physical` markers in one edit, grouped by the 25 slot-holders (with parent Uncommon names given directly in each agent's prompt), then dispatched 13 sequential waves of 2 agents each, continuing the established 2-agent-per-wave discipline throughout — zero file-corruption incidents. Verified after every single wave, independently of any agent's self-report: `node --check`, a rarity-agnostic member-count sweep, a marker-count sweep, a whole-file name+cat duplicate sweep, and a full required-field/array-length validator (a small reusable Node script written for this session and re-run after every wave). Also ran a cumulative sweep across all previously-completed setKeys periodically (not just the new wave's) to catch any lost-update regression on earlier work — none occurred.

**Real issues caught and handled during the session, none of which reached the committed file uncaught:**
- One agent (CQC Grappling group) found two of its own planned names ("Double-Leg Takedown", "Single-Leg Takedown") would have collided with a pre-existing `cat:"physical"` setKey elsewhere in the file; renamed both to "...Under Resistance" before writing, per its own pre-write grep discipline.
- One agent (Environmental Adaptation group) found a genuine pre-existing name collision ("Electrolyte Replacement Practice" already existed under a different setKey) and renamed its skill to "Long-Session Electrolyte Dosing" before landing it — caught by pre-write grep, never entered the file as a duplicate.
- Several agents across different waves independently reported a transient marker-duplication artifact under heavy concurrent editing (a `// SLOT:...` comment line appearing doubled after a neighboring agent's edit landed nearby). Every occurrence was self-caught by the now-standard "re-grep after every Edit call" discipline and folded into a clean single replacement before the agent reported done. The end-of-session `grep | sort | uniq -d` sweep for literal duplicate marker lines confirmed zero survived into the final file at any checkpoint.

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `physb_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans. The full required-field validator, re-run cumulatively across all 125 setKeys together at the end, found zero remaining problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones introduced across all 13 waves. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:6899`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 9 more Mythic trees' worth of Commons remain — 5,625 cards (Cyberspace Operations Officer, Master of the Mind, Sovereign Self, The Living Root, Warrior Foundation, Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect). Repeat this session's process — 2-agent waves, verify every wave (member-count + marker-count + duplicate + required-field, plus a periodic cumulative re-check of earlier waves), watch for the group-boundary trailing-comma failure mode (v157) and the transient marker-duplication-under-concurrency artifact (v158, harmless if caught by the standing re-grep-after-every-edit discipline).

### v159 — Commons layer, eighth tree: Sovereign Self (625 new seeds)

**Files changed:** `src/core/skills-data.js`, `sw.js`

SW bumped to `operations-v159`. `SKILL_LADDER_VER` unchanged at **117** (pure addition, no existing ladder/guidance text touched). Total skills: **7524** (6899 + 625).

Re-derived the pyramid state directly from `SEED_SKILLS` before starting, per the project's standing rule: confirmed 6899 total, 7 trees complete (Physical Mastery, Keeper of the Flame, Tactical Mastery, Battlefield Commander, Vital Operator, Scholar-Warrior, Soldier Athlete — 4375 Commons), 9 trees at 0 Commons. Matched the prior session's claim exactly, no drift. User picked **Sovereign Self** (`cat:"personal"`) from a shortlist that included the three collision-flagged cats (technical/personal/cognitive) — accepted the extra collision-check overhead for this pick rather than avoiding it.

Wrote all 625 Commons (125 setKeys × 5) for the Sovereign Self Mythic tree, mythic setKey `pers_leg`: 5 Legendaries (Life Operations, Inner Discipline, Financial Sovereignty, Social Fluency, Physical Resilience) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — all 25 slot-holders were pure Rare cards, no pre-existing Jokers in this tree. Confirmed all 125 target setKeys were unique among existing Uncommons (a pre-existing harmless duplicate-property-line bug was found on one unrelated existing skill, `Social media discipline` at `pers_u_digital_hygiene` — a single object with its `setKey`/`synthesizedFrom` line accidentally duplicated verbatim, not a cross-skill collision; left as out-of-scope, noted here for a future session) before writing.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:personal` markers in one edit, grouped by the 25 slot-holders, then dispatched 13 sequential waves (1 canary solo group, 11 waves of 2 agents, 1 final solo group), continuing the established 2-agent-per-wave discipline throughout — zero file-corruption incidents. Verified after every single wave: `node --check`, a rarity-agnostic member-count sweep, a marker-count sweep, a whole-file name+cat duplicate sweep, a duplicate-marker-line sweep, and a full required-field/array-length validator, plus a regression check against every previously-completed setKey at each step (none regressed).

**Real issues caught and handled during the session, none of which reached the committed file uncaught:**
- The known `cat:"personal"` pre-existing duplicate names ("Personal finance", "Legal literacy", "Tax Strategy", "Debt Management") were explicitly called out per-agent whenever a group's marker hint text matched one, and every agent avoided reusing them verbatim.
- Several agents across different waves independently hit the same transient marker-duplication artifact documented in v158 (a `// SLOT:...` line briefly doubled from a neighboring concurrent edit) — every occurrence was self-caught via the standing re-grep-after-every-edit discipline.
- Two agents each self-caught and corrected an accidentally-introduced duplicate boundary comment line (their own `new_string` included a `// ── GROUP N ──` header that already existed after the markers they replaced) before reporting done.
- The orchestrating session itself (not a dispatched agent) caught and fixed two defects between waves that would otherwise have reached a live agent: (1) a marker for `pers_c_first_impression` had been split across two physical lines by a concurrent-edit artifact (`// SLOT:pers_c_first_impression:First impression` / `//  management:personal`), flagged by an adjacent group's agent as out-of-scope and fixed directly before the group 19 agent was dispatched; (2) a duplicated `// ── GROUP 25 ──` header comment line, found during the routine post-wave verification sweep (not self-reported by any agent), fixed the same way. Lesson for future sessions: the after-every-wave verification sweep should explicitly include a scan for duplicated/malformed marker and header lines belonging to *not-yet-dispatched* groups, not just the just-completed wave's own markers — both defects here were sitting in undispatched territory and would have been handed to the next agent as-is if the orchestrator hadn't caught them independently.

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `pers_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans. The full required-field validator, run across all 625 Commons together at the end, found zero remaining problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones introduced across all 25 groups. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:7524`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 8 more Mythic trees' worth of Commons remain — 5,000 cards (Cyberspace Operations Officer, Master of the Mind, The Living Root, Warrior Foundation, Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect). Repeat this session's process — 2-agent waves, verify every wave (member-count + marker-count + duplicate + required-field + regression-check-on-earlier-waves), watch for the group-boundary trailing-comma failure mode (v157), the transient marker-duplication-under-concurrency artifact (v158/v159), and this session's new lesson: scan undispatched groups' markers/headers for corruption during routine wave verification, not just the just-completed group's own content.

### v160 — Commons layer, ninth tree: The Living Root (625 new seeds) — last legacy-gen tree done, halfway point passed

**Files changed:** `src/core/skills-data.js`, `sw.js`, `planning/IMPROVEMENTS-v160.md` (deleted after completion)

SW bumped to `operations-v160`. `SKILL_LADDER_VER` unchanged at **117** (pure addition, no existing ladder/guidance text touched). Total skills: **8149** (7524 + 625).

Re-derived the pyramid state directly from `SEED_SKILLS` before starting, per the project's standing rule: confirmed 7524 total, 8 trees complete (Physical Mastery, Keeper of the Flame, Tactical Mastery, Battlefield Commander, Vital Operator, Scholar-Warrior, Soldier Athlete, Sovereign Self — 5000 Commons), 8 trees at 0 Commons. Matched the prior session's claim exactly, no drift. Ran the whole-file name+cat duplicate sweep first: exactly the same 10 pre-existing duplicates, `roots` cat carries zero of them — picked **The Living Root** (`cat:"roots"`) as the lowest-collision-risk of the 8 remaining trees, and the last of the original legacy-gen 16 Mythics (the other 7 remaining are all second-gen Phase 7 trees).

Wrote all 625 Commons (125 setKeys × 5) for The Living Root Mythic tree, mythic setKey `roots_leg`: 5 Legendaries (The Covenant, Indomitable Will, The Still Point, True North, Vital Roots) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — all 25 slot-holders were pure Rare cards, no pre-existing Jokers in this tree. Confirmed all 125 target setKeys were unique and non-null among existing Uncommons (no orphans, consistent with v149's fix) before writing.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:roots` markers in one edit, grouped by the 25 slot-holders, then dispatched 13 sequential waves (12 waves of 2 agents, 1 final solo group for the last group in the file), continuing the established 2-agent-per-wave discipline throughout — zero file-corruption incidents. Verified after every single wave: `node --check`, a rarity-agnostic member-count sweep, a marker-count sweep, a whole-file duplicate-marker-line sweep, a whole-file duplicate-group-header sweep, and a cumulative required-field/array-length validator re-run across every previously-completed setKey (not just the new wave's) at each step — no regressions found.

**Real issues caught and handled during the session, none of which reached the committed file uncaught:**
- Found a pre-existing, unrelated defect while running the very first duplicate-header sweep: a literal duplicated `// ── GROUP 8 | Leg: Army Fitness Excellence | Rare: Field Physical Readiness ──` header line sitting in the already-shipped Soldier Athlete tree (`cat:"physical"`, from a prior session) — harmless to parsing/counts, fixed on sight since it was already flagged by the sweep.
- The group 3 agent (Accountability) accidentally duplicated the following group's header comment on its first edit attempt (its `new_string` included the pre-existing `// ── GROUP 4 ──` header as a defensive measure), self-caught via its own post-edit re-grep, and fixed with a follow-up Edit before reporting done.
- The group 12 agent (Emotional Intelligence) and group 16 agent (Values Integration) each independently left a stray marker/comma artifact from an early edit (a re-inserted `// SLOT:` line in one case, an orphan `},` in the other), both self-caught via the standing re-grep-after-every-edit discipline and fixed before reporting done.
- The group 21 agent (Gratitude Discipline) initially wrote only 4 of 5 skills for one setKey (`roots_c_gratitude_letter`), caught it during its own final count check, and added the missing 5th skill before finishing.
- Several agents again reported the file being concurrently modified between read and edit (expected under 2-agent concurrency); every edit still applied cleanly via the Edit tool's staleness detection with no lost updates.

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `roots_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans — and confirmed all 7 previously-completed trees remained untouched at 625 each, and all 7 other still-pending trees remained untouched at 0. The full required-field validator, run across all 625 new Commons together at the end, found zero remaining problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones introduced across all 25 groups. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:8149`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 7 more Mythic trees' worth of Commons remain — 4,375 cards, all second-gen Phase 7 trees (Cyberspace Operations Officer, Master of the Mind, Warrior Foundation, Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect). `technical`/`cognitive` still carry the remaining known pre-existing name+cat collisions — a first pass into either needs extra care with the duplicate sweep. Repeat this session's process — 2-agent waves, verify every wave (member-count + marker-count + duplicate + required-field + regression-check-on-earlier-waves + undispatched-territory scan), watch for the group-boundary trailing-comma failure mode (v157) and the transient marker-duplication-under-concurrency artifact (v158/v159).

### v161 — Commons layer, tenth tree: Warrior Foundation (625 new seeds) — first second-gen Phase 7 tree done, past the halfway point

**Files changed:** `src/core/skills-data.js`, `sw.js`, `planning/IMPROVEMENTS-v161.md` (deleted after completion)

SW bumped to `operations-v161`. `SKILL_LADDER_VER` unchanged at **117** (pure addition, no existing ladder/guidance text touched). Total skills: **8774** (8149 + 625).

Re-derived the pyramid state directly from `SEED_SKILLS` before starting: confirmed 8149 total, 9 trees complete (the 7 legacy-gen trees plus Soldier Athlete and Sovereign Self were already done as of v160 — actually the audit script found the correct 9: hearth, physical×2, tactical(legacy), leadership, physiological, academic, personal, roots — 5625 Commons), 7 trees at 0 Commons. Matched the prior session's claim exactly, no drift. Ran the whole-file name+cat duplicate sweep first: exactly the same 10 pre-existing duplicates. Picked **Warrior Foundation** (`cat:"tactical"`) — the lowest-collision-risk of the 7 remaining trees per the known-duplicate list (`tactical`/`leadership` carry zero of the 10 known dupes), and the first second-gen Phase 7 tree to get its Commons layer.

Wrote all 625 Commons (125 setKeys × 5) for Warrior Foundation, mythic setKey `tac2_leg`: 5 Legendaries (Soldier Fundamentals, Weapons Mastery, Small Unit Tactics, Field Medicine & CASEVAC, Operational Communications) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — all 25 slot-holders were pure Rare cards, no pre-existing Jokers in this tree.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:tactical` markers in one script-based edit (safe as a single pre-dispatch setup edit, no concurrent agents yet), grouped by the 25 slot-holders into `// ── GROUP N | Leg: X | Rare: Y ──` blocks, then dispatched 13 sequential waves (12 waves of 2 agents, 1 final solo group for the last group in the file), continuing the established 2-agent-per-wave discipline throughout — zero file-corruption incidents. Verified after every single wave: `node --check`, a rarity-agnostic member-count sweep, a marker-count sweep, a whole-file duplicate-marker-line sweep, a whole-file duplicate-group-header sweep, and a cumulative required-field/array-length validator re-run across every previously-completed setKey — no regressions found.

**New failure mode discovered and documented this session, not previously seen across the 9 prior trees:** wave 1 (groups 1-2) introduced 3 name+cat collisions not against each other or the known 10 pre-existing dupes, but against the ALREADY-SHIPPED legacy "Tactical Mastery" Mythic tree's Commons — a sibling tree sharing the same `cat:"tactical"`. Generic military-training names ("METT-TC Mission Analysis", "MARCH Sequence Recall", "Protective Mask Donning Speed") happened to already exist in that other 625-skill tree written in a prior session. Caught immediately by the routine post-wave duplicate sweep (10 dupes became 13), fixed by renaming the 3 new (Warrior Foundation) skills rather than touching the already-shipped Tactical Mastery content. **From wave 2 onward, every agent prompt was strengthened** with an explicit instruction to grep `{name:"<candidate>", cat:"tactical"` against the whole file before finalizing each of its 25 names — several subsequent agents (groups 3, 11, 13, 15, 16, 21, 24) self-caught and renamed 1-2 collisions each this way before ever writing the object, and zero further collisions reached the committed file uncaught after the fix. **Lesson for future same-cat second-gen trees:** when two Mythic trees share a `cat`, the collision risk isn't limited to the pre-existing 10-item list — it also includes every skill already shipped by that cat's *other* tree(s), and needs the same per-name grep discipline as the known list, not just a fixed enumerable check.

Other minor self-caught issues, none reaching the committed file: one agent (group 5) introduced a duplicated array item during a stale-file retry and caught it in its own final verification before reporting done; several agents reported the file being concurrently modified between read and edit (expected under 2-agent concurrency), and every edit still applied cleanly via the Edit tool's staleness detection with no lost updates.

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `tac2_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans — and confirmed all 9 previously-completed trees remained untouched at 625 each, and all 6 other still-pending trees remained untouched at 0. The full required-field validator, run across all 625 new Commons together at the end, found zero remaining problems. Name+cat duplicate sweep across the whole file after the fix: exactly the same 10 pre-existing duplicates from before this session, zero new ones. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:8774`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 6 more Mythic trees' worth of Commons remain — 3,750 cards, all second-gen Phase 7 trees (Cyberspace Operations Officer, Master of the Mind, Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect). `technical`/`cognitive` still carry the remaining known pre-existing name+cat collisions — a first pass into either needs extra care with the duplicate sweep, PLUS this session's new lesson: also watch for collisions against any other already-shipped tree sharing the same `cat`. `leadership` (Staff Excellence) is the only fully collision-free cat left among the remaining 6. Repeat this session's process — 2-agent waves, verify every wave (member-count + marker-count + duplicate + required-field + regression-check-on-earlier-waves + undispatched-territory scan), watch for the group-boundary trailing-comma failure mode (v157), the transient marker-duplication-under-concurrency artifact (v158/v159), and the cross-tree same-cat name collision risk (v161).

### v162 — Commons layer, eleventh tree: Master of the Mind (625 new seeds) — second second-gen Phase 7 tree done

**Files changed:** `src/core/skills-data.js`, `sw.js`, `planning/IMPROVEMENTS-v162.md` (deleted after completion)

SW bumped to `operations-v162`. `SKILL_LADDER_VER` unchanged at **117** (pure addition, no existing ladder/guidance text touched). Total skills: **9399** (8774 + 625).

Re-derived the pyramid state directly from `SEED_SKILLS` before starting: confirmed 8774 total, 10 trees complete (Physical Mastery, Keeper of the Flame, Tactical Mastery, Battlefield Commander, Vital Operator, Scholar-Warrior, Soldier Athlete, Sovereign Self, The Living Root, Warrior Foundation — 6250 Commons), 6 trees at 0 Commons. Matched v161's doc exactly, no drift. Ran the whole-file name+cat duplicate sweep first: exactly the same 10 pre-existing duplicates (5 `technical`, 4 `personal`, 1 `cognitive`, 0 `leadership`). Picked **Master of the Mind** (`cat:"cognitive"`) over the seemingly-safer-looking `leadership`: `cognitive` carries only 1 known dupe and neither of its two Mythic trees (Master of the Mind, Cognitive Athlete) has shipped yet, so zero same-cat-sibling risk — whereas `leadership` already has Battlefield Commander's 625 skills sharing its cat, which is exactly the risk that produced v161's 3 collisions. Judged the "no sibling yet" property to matter more than the raw known-dupe count.

Wrote all 625 Commons (125 setKeys × 5) for Master of the Mind, mythic setKey `cog_leg`: 5 Legendaries (Processing Speed, Memory Mastery, Attentional Command, Mental Operations, Cognitive Synthesis) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — several slot-holders were pre-existing Jokers (`Reaction speed`, `Cognitive / processing speed`, `Working memory (n-back)`, `Memory span`, `Attention / sustained focus`, `Reading speed`, `Mental math`, `Pattern recognition`, `Critical thinking`) from the legacy pyramid, same as expected for this tree per the "Two auditing traps" note — didn't affect Commons-writing since Commons attach to the Uncommon layer, not the slot-holder layer.

**Execution:** pre-placed all 125 `// SLOT:<setKey>:<uncommonName>:cognitive` markers in one edit, grouped into 25 `// ── GROUP N | Leg: X | Rare: Y ──` blocks, then dispatched 13 sequential waves (12 waves of 2 agents, 1 final solo group for the last group before the array's closing `];`), continuing the established 2-agent-per-wave discipline throughout — zero file-corruption incidents. Verified after every single wave: `node --check`, a rarity-agnostic member-count sweep, a marker-count sweep, a whole-file duplicate-marker-line sweep, a whole-file duplicate-group-header sweep, and a cumulative required-field/array-length validator re-run across every previously-completed setKey (a single reusable Node script, re-run after each wave) — caught one real regression (below), no others.

**One real defect caught by the post-wave member-count sweep, fixed by hand:** wave 5's `cog_c_proc_interference` and `cog_c_skill_transfer` setKeys both landed at 4/5 members — the dispatched agent's own self-report claimed 5 each and described a plausible-sounding 5th skill for `cog_c_proc_interference` in its summary text, but the actual file content only had 4 objects for each set. This is the same class of failure as v152/v153: an agent's own "I verified X" is not sufficient, only the orchestrator's independent grep-count sweep actually confirms it. Fixed by hand-authoring one additional Common skill for each set ("Extended Interference Fade Tracking" and "Delayed Transfer Retention") rather than redispatching, per the standing rule to avoid re-racing a wave once other work has moved past it.

Several agents self-caught and fixed their own mid-task slips before reporting done: a stray non-ASCII character accidentally typed into a `why` field, two separate instances of accidentally re-duplicating the next marker's comment line mid-edit, one skill mis-assigned to the wrong sibling `setKey` within the same group (self-corrected via the per-setKey grep-count check), and one instance of accidentally including a neighboring group's header comment inside a replacement string (self-caught via the "GROUP header still intact" check) — all fixed before the agent reported done, none reached the committed file uncaught. Two markers (`cog_c_decision_sci:Decision science` and `cog_c_spatial_reasoning:Spatial reasoning`) had pre-existing setKey/name-label mismatches baked into the underlying data (an artifact of how the marker-generation script paired names to setKeys) — both were flagged explicitly in the relevant agent's prompt with instructions to write content matching the setKey's actual thematic slot (a 5th Decision-Making sub-skill and a 5th Spatial-Operations sub-skill respectively) rather than the misleading label text, and both agents handled it correctly.

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `cog_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans. The full required-field validator, run across all 625 new Commons together at the end, found zero remaining problems. Name+cat duplicate sweep across the whole file after the fix: exactly the same 10 pre-existing duplicates from before this session, zero new ones (agents proactively renamed several near-collision candidates before writing, including avoiding the pre-existing "Cognitive Resilience", "Signal-in-Noise Detection", "Rapid Category Sorting", and "Category Fluency" skills). `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:9399`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 5 more Mythic trees' worth of Commons remain — 3,125 cards, all second-gen Phase 7 trees (Cyberspace Operations Officer, Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect). `technical` still carries all 5 of its known pre-existing name+cat collisions and has zero shipped sibling yet (both its trees — Cyberspace Operations Officer and Cyber Operator — are still at 0 Commons), same "no sibling risk yet" property that made `cognitive` attractive this session. `personal` (Life Architect) now has a shipped sibling (Sovereign Self) on top of its 4 known dupes. `leadership` (Staff Excellence) has 0 known dupes but a shipped sibling (Battlefield Commander) — same risk profile as before. Repeat this session's process — 2-agent waves, verify every wave (member-count + marker-count + duplicate + required-field + regression-check-on-earlier-waves + undispatched-territory scan), and don't skip the required-field/member-count sweep just because an agent's own summary sounds confident — v162 found a real 4/5 undercount despite a confident-sounding self-report.

### v163 — Commons layer, twelfth tree: Cyberspace Operations Officer (625 new seeds) — third second-gen Phase 7 tree done, technical cat's first tree complete

**Files changed:** `src/core/skills-data.js`, `sw.js`, `planning/IMPROVEMENTS-v163.md` (deleted after completion)

SW bumped to `operations-v163`. `SKILL_LADDER_VER` unchanged at **117** (pure addition, no existing ladder/guidance text touched). Total skills: **10024** (9399 + 625) — crossed the 10,000-skill mark this session.

This session picked up a **staged** state left by the immediately-preceding session (uncommitted-work-avoided): a prior pass had already re-derived the pyramid state fresh (9399 total, 11 trees at 625 Commons, 5 at 0), picked **Cyberspace Operations Officer** (`cat:"technical"`) as lowest-collision-risk of the 5 remaining trees (neither `technical` Mythic tree — Cyberspace Operations Officer nor Cyber Operator — had a shipped Commons sibling yet), pre-placed all 125 `// SLOT:<setKey>:technical` markers grouped into 25 `// ── GROUP N | Leg: X | Rare: Y ──` blocks, and committed that staging as `v163 (staged)` — `planning/IMPROVEMENTS-v163.md` recorded the plan. This session re-verified the staged state before trusting it: confirmed 125 markers intact via `grep -c`, `node --check` passed, and independently re-derived the 9399/11-trees-done/5-remaining state directly from `SEED_SKILLS` rather than trusting the staging doc's numbers — matched exactly, no drift between the staging session and this one.

Wrote all 625 Commons (125 setKeys × 5) for Cyberspace Operations Officer, mythic setKey `tech_mythic`: 5 Legendaries (Computing Foundations, Software Craftsman, Cyber Operator, Infrastructure Mastery, Technical Intelligence) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — all 25 slot-holders were pure Rare cards for this tree, no pre-existing Jokers.

**Execution:** dispatched 13 sequential waves (12 waves of 2 agents, 1 final solo group for group 25), continuing the established 2-agent-per-wave discipline throughout — zero file-corruption incidents. Verified after every single wave: `node --check`, a rarity-agnostic member-count sweep, a marker-count-dropped-by-exactly-10-per-wave check, a whole-file duplicate-marker-line sweep, a whole-file duplicate-group-header sweep, and a cumulative required-field/array-length validator re-run across every previously-completed setKey (confirming no lost-update regressions from concurrent editing) — zero defects found in any wave, a first for this workstream (every prior tree from v150 onward had at least one self-caught or orchestrator-caught defect somewhere in its 13 waves). Made 3 intermediate safety commits at natural Legendary-boundary checkpoints (after waves 5, 8, and 10) rather than holding all 625 skills uncommitted for the whole session, given this project's standing lesson from v153/v154 about uncommitted work compounding file-corruption risk.

**Highest-scrutiny area handled cleanly:** `technical` carries 2 of the file's 10 known pre-existing name+cat duplicates ("Penetration testing methodology" and "Cyber Operator" — the latter also the name of this tree's own not-yet-built sibling Mythic tree in the same cat), both landing squarely in groups 11-15 (the "Cyber Operator" Legendary, wave 6-8). Every agent prompt for `technical`-cat groups carried an explicit warning to grep every candidate name against the whole file (not just the known-dupe list) before finalizing, given v161's finding that same-cat sibling trees are a collision source beyond the fixed list. The post-wave duplicate sweep after wave 6 (the highest-risk wave) confirmed exactly 10 dupes, zero new — the discipline held under the area of greatest exposure.

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `tech_mythic` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans. The full required-field validator, run across all 625 new Commons together at the end, found zero problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:10024`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 4 more Mythic trees' worth of Commons remain — 2,500 cards, all second-gen Phase 7 trees (Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect). `technical` (Cyber Operator) now has a shipped sibling (this session's Cyberspace Operations Officer) on top of its 5 known dupes — same elevated risk profile v161 first identified; a first pass into `technical` again needs the whole-cat per-name grep discipline, not just the known-dupe list. `personal` (Life Architect) has a shipped sibling (Sovereign Self) on top of 4 known dupes. `leadership` (Staff Excellence) has 0 known dupes but a shipped sibling (Battlefield Commander). `cognitive` (Cognitive Athlete) has a shipped sibling (Master of the Mind) on top of 1 known dupe. Every remaining tree now has a same-cat shipped sibling — this is the first time in the workstream all remaining trees carry that risk simultaneously, so the whole-cat grep discipline (not just the 10-item list) is no longer optional for any of them. Repeat this session's process — 2-agent waves, verify every wave, intermediate checkpoint commits at Legendary boundaries.

### v164 — Commons layer, thirteenth tree: Staff Excellence (625 new seeds) — fourth second-gen Phase 7 tree done, crossed 10,500 skills

**Files changed:** `src/core/skills-data.js`, `sw.js`, `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`. No `IMPROVEMENTS-v164.md` was written this session — the user asked directly to "begin the next skill group" mid-conversation rather than starting a fresh session from the resume doc, so the tree was picked, mapped, staged, and executed inline in one continuous pass instead of the usual stage-then-resume split.

SW bumped to `operations-v164`. `SKILL_LADDER_VER` unchanged at **117** (pure addition, no existing ladder/guidance text touched). Total skills: **10649** (10024 + 625).

Re-derived the pyramid state fresh from `SEED_SKILLS` at the start (rather than trusting the just-written v163 doc): confirmed 10024 total, 12 trees at 625 Commons, 4 at 0 (Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect) — matched exactly, no drift. Picked **Staff Excellence** (`cat:"leadership"`) — the only one of the 4 remaining trees with 0 known pre-existing name+cat dupes, even though (per v161's standing finding, true for all 4 remaining trees as of this session) it has a shipped same-cat sibling (Battlefield Commander).

Mapped the tree's full structure directly from `SEED_SKILLS` (Mythic `lead2_mythic` → 5 Legendaries sharing setKey `lead2_leg` → each Legendary's own 5 Rare slot-holders → each Rare's own 5 Uncommons → each Uncommon's own unique Commons setKey) before placing any markers, and ran the v149-style prerequisite check (each of the 125 target Commons setKeys has exactly 0 existing members and exactly 1 Uncommon pointing to it) to confirm no orphans/collisions before staging. **Found a structural quirk worth noting for future sessions:** the first Legendary's ("Organizational Excellence") 5 Rare slot-holders synthesize from Commons setKeys using the OLD `lead_c_*` prefix (shared with the legacy Battlefield Commander tree's own Commons naming convention) rather than this tree's own `lead2_c_*` prefix — this is because those 5 Uncommons (Parliamentary procedure, Negotiation & influence, Project management, Conflict resolution & mediation, Resource management) are pre-existing legacy skills wired into this tree per the "Existing skill integration rule," not newly-authored Phase 7 content, and they'd been given `lead_c_*`-prefixed Commons keys back when they were first authored, before the `lead2_` naming convention existed. Verified those 5 setKeys were genuinely unclaimed (0 existing Commons members, exactly 1 Uncommon pointing to each) before treating them as safe to fill — a prefix mismatch alone is not evidence of a problem, but it's exactly the kind of thing that would look suspicious without checking.

Wrote all 625 Commons (125 setKeys × 5) for Staff Excellence: 5 Legendaries (Organizational Excellence, Administrative Command, Training Management, Logistics & Sustainment, Multi-Echelon Coordination) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — all 25 slot-holders were pure Rare cards, no pre-existing Jokers in this tree.

**Execution:** dispatched 13 sequential waves (12 waves of 2 agents, 1 final solo group for group 25), continuing the established 2-agent-per-wave discipline throughout. Verified after every wave: `node --check`, member-count sweep, marker-count-dropped-by-10 check, duplicate marker/header sweep, cumulative required-field validator across all previously-completed setKeys. Made 3 intermediate safety checkpoint commits at Legendary boundaries (after waves 5, 8, 10).

**One real account-wide interruption this session, handled cleanly per the standing protocol:** wave 8's group-15 agent hit a mid-task API connection failure before writing anything. Checked file state immediately (per the "budget for interruption" protocol) — confirmed `node --check` still passed and all 5 of group 15's markers were untouched, so this was a clean zero-write failure, not a corruption incident. Redispatched a single fresh agent for that one group with no further incident. **Also hit one transient false-alarm during the same wave:** the orchestrator's independent post-wave count check briefly read `lead2_c_logs_lost_damaged` at 4/5 members while group 16's concurrent agent was still mid-write on its final skill; a re-check seconds later (after the notification confirming group 16's own self-caught 4/5-to-5/5 fix) showed 5/5 — this was a read racing a legitimate concurrent write, not a real defect, and no fix was needed. **Lesson: when an independent post-wave count check finds a shortfall on a setKey whose owning agent hasn't yet reported done, re-check after a brief pause before treating it as confirmed — the v152/v162/v163 "don't trust agent self-report" lesson holds, but the inverse (don't panic-fix on an in-flight read either) also matters.**

Multiple agents self-caught and fixed their own undercounts this session before reporting done (groups 4, 7, 11, 16 each briefly wrote 4/5 on one setKey and corrected it via their own re-count step) — the standing "re-count as your last action, after a brief pause" instruction (added to every agent prompt from wave 8 onward specifically because of the race described above) appears to be doing real work catching these before they ever reach the committed file.

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `lead2_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans. The full required-field validator, run across all 625 new Commons together at the end, found zero problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones — notable since `leadership` has 0 of its own known dupes, meaning every collision risk here was purely from the shipped Battlefield Commander sibling, and the whole-cat grep discipline held clean across all 25 groups. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:10649`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 3 more Mythic trees' worth of Commons remain — 1,875 cards, all second-gen Phase 7 trees (Cyber Operator, Cognitive Athlete, Life Architect). All 3 have a shipped same-cat sibling now (Cyberspace Operations Officer for `technical`, Master of the Mind for `cognitive`, Sovereign Self for `personal`) — the whole-cat per-name grep discipline (not just the 10-item known-dupe list) is mandatory for all 3, no exceptions. Repeat this session's process — 2-agent waves, verify every wave, intermediate checkpoint commits at Legendary boundaries, and don't skip the final-action re-count-after-a-pause instruction in agent prompts given this session's race-condition finding.

### v165 — Commons layer, fourteenth tree: Cognitive Athlete (625 new seeds) — fifth second-gen Phase 7 tree done, crossed 11,000 skills

**Files changed:** `src/core/skills-data.js`, `sw.js`, `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`. No `IMPROVEMENTS-v165.md` written — same direct-continuation pattern as v164 (user asked to "begin the next commons layer" mid-conversation).

SW bumped to `operations-v165`. `SKILL_LADDER_VER` unchanged at **117** (pure addition). Total skills: **11274** (10649 + 625) — crossed 11,000 mid-session.

Re-derived the pyramid state fresh at start: confirmed 10649 total, 13 trees at 625 Commons, 3 at 0 (Cyber Operator, Cognitive Athlete, Life Architect) — matched exactly, no drift. Picked **Cognitive Athlete** (`cat:"cognitive"`) — the lowest known-dupe-count (1, "Cognitive Resilience" — confirmed to be a pre-existing Rare-vs-Legendary-name collision unrelated to Commons work, not something new to fix) among the 3 remaining trees, though (true for all 3 now) it has a shipped same-cat sibling (Master of the Mind).

Mapped the tree's full structure from `SEED_SKILLS`, ran the v149-style prerequisite check (0 existing members, exactly 1 Uncommon pointing to each of the 125 target Commons setKeys) before staging. **Same legacy-prefix quirk as v164's Staff Excellence:** the first Legendary's ("Cognitive Versatility") 5 slot-holders synthesize from Commons setKeys using the OLD `cog_c_*` prefix (shared with the legacy Master of the Mind tree's own naming convention) rather than this tree's `cog2_c_*` prefix, because those 5 Uncommons (Memory technique, Typing speed & accuracy, Memory retention, Second language retention, Cognitive flexibility & task-switching) are pre-existing legacy skills wired in per the "existing skill integration rule." Verified genuinely unclaimed before proceeding, consistent with v164's finding that this pattern is benign, not a defect signal.

Wrote all 625 Commons (125 setKeys × 5) for Cognitive Athlete: 5 Legendaries (Cognitive Versatility, Performance Psychology, Advanced Learning Systems, Cognitive Resilience, Tactical Cognition) × 5 slot-holder Rares each × 5 Uncommons each × 5 new Commons each — all 25 slot-holders were pure Rare cards, no pre-existing Jokers.

**Execution:** 13 sequential waves (12 waves of 2 agents, 1 solo final wave), 2-agent concurrency throughout. Verified after every wave: `node --check`, member-count sweep, marker-count-dropped-by-10 check, duplicate marker/header sweep, cumulative required-field validator. 3 intermediate checkpoint commits at Legendary boundaries (after waves 5, 8, 10).

**One clean interruption, same failure mode as v164:** wave 9's group-17 agent hit a mid-task API server error before writing anything. Confirmed zero-write via `node --check` + untouched markers, redispatched a single fresh agent with no further incident — the second session in a row to hit and cleanly recover from this exact pattern, reinforcing it as a routine (not exceptional) occurrence worth budgeting for every session.

**High density of tightly-adjacent setKeys this tree, more than any prior tree:** because "cognitive" content naturally clusters around a small set of core concepts (fatigue, load, offloading, reframing, pattern recognition), 6+ groups this session needed explicit differentiation instructions to keep new setKeys distinct from earlier ones in the SAME tree, not just the sibling Master of the Mind tree — e.g. Group 12's skill-acquisition interleaving vs. Group 3's academic-study interleaving, Group 19's decision-fatigue recovery vs. Group 4's general cognitive-fatigue recovery, Group 24's field task-offloading vs. Group 19's decision-offloading. All held clean; zero cross-group collisions reached the committed file. **Lesson: when a tree's own internal thematic density is high (not just cross-tree sibling risk), explicitly name the specific sibling group and the boundary between the two setKeys' scope in the agent prompt — generic "don't duplicate" warnings aren't precise enough to reliably prevent near-miss overlap at this density.**

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `cog2_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans. The full required-field validator, run across all 625 new Commons together at the end, found zero problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:11274`. `npm run package` → produced `dist/operations.zip`.

**Next workstream:** 2 more Mythic trees' worth of Commons remain — 1,250 cards, both second-gen Phase 7 trees (Cyber Operator, Life Architect). Both have a shipped same-cat sibling (Cyberspace Operations Officer for `technical`, Sovereign Self for `personal`) — whole-cat per-name grep discipline remains mandatory for both. `technical` carries 5 known dupes, `personal` carries 4. Repeat this session's process — 2-agent waves, verify every wave, intermediate checkpoint commits at Legendary boundaries, budget for a possible mid-dispatch API failure as routine (not exceptional), and watch for high within-tree thematic density requiring explicit sibling-group differentiation in agent prompts (v165's finding) — check whether either remaining tree has that same characteristic before assuming a generic "don't duplicate the sibling tree" warning is sufficient.

### v166 — Commons layer, fifteenth tree: Life Architect (625 new seeds) — sixth second-gen Phase 7 tree done, `personal` cat's second tree complete

**Files changed:** `src/core/skills-data.js`, `sw.js`, `planning/IMPROVEMENTS-v166.md` (written and then deleted per the standard workflow), `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`.

SW bumped to `operations-v166`. `SKILL_LADDER_VER` unchanged at **117** (pure addition). Total skills: **11899** (11274 + 625).

Re-derived the pyramid state fresh at start: confirmed 11274 total, 14 trees at 625 Commons, 2 at 0 (Cyber Operator, Life Architect) — matched v165's doc exactly, no drift. Picked **Life Architect** (`cat:"personal"`) over Cyber Operator per the doc's own tiebreaker: `personal` carries fewer known pre-existing name+cat dupes (4) than `technical` (5), reconfirmed via a fresh whole-file dup sweep before starting (exactly 10 total, split 5 `technical` / 4 `personal` / 1 `cognitive`, matching prior sessions).

Mapped the tree's full structure from `SEED_SKILLS` before staging: 5 Legendaries (Life Mastery, Wealth Architecture, Purpose & Identity, Social Capital, Physical Sovereignty) × 5 Rare slot-holders each × 5 Uncommons each × 5 new Commons each = 125 setKeys / 625 skills. **Same legacy-prefix quirk as v164/v165:** the first Legendary's ("Life Mastery" → "Life Administration") 5 Commons setKeys use the OLD `pers_c_*` prefix instead of this tree's own `pers2_c_*`, because those 5 Uncommons (Personal finance, Career planning & development, Legal literacy, Healthcare navigation, Side income & entrepreneurship) are pre-existing legacy skills wired in per the existing-skill-integration rule. Verified all 5 keys genuinely unclaimed (0 existing members) before staging — benign, not a defect, consistent with the last two sessions' finding.

**Execution:** staged all 125 `// SLOT:` markers in one pass, committed as "v166 (staged)" before dispatching any agent (per the standing "commit before large fan-outs" rule). 14 waves total (13 waves of 2 agents, 1 solo final wave), 2-agent concurrency throughout — 15 trees straight now at this concurrency with only one true content defect (see below), reinforcing the standing "don't scale past 2/wave" rule. Verified after every wave: `node --check`, member-count sweep, marker-count-drop check, duplicate marker/header sweep across the WHOLE remaining marker block (not just the just-completed wave), and a full required-field validator. 4 intermediate checkpoint commits at Legendary boundaries (after groups 6, 10, 15, 20).

**One real content defect this session, caught by the routine post-wave field-shape validator, not by any agent's self-report:** Group 21 (Personal Health Advocacy)'s first-draft agent wrote all 25 of its skills with 5-item `levels`/`roadmap`/`advance`/`maintain` arrays instead of the required 4-item shape — apparently by copying the sibling Uncommon-tier ladder length instead of the Commons-tier one. The orchestrator's independent validator caught it immediately after the wave. A dedicated fix agent was dispatched to correct it, but by the time it ran, found the file **already correct** — the original agent had self-caught and silently corrected its own mistake mid-task (its task summary, which arrived out of order/late, confirmed this: "my first draft mistakenly copied the sibling Uncommon-tier 5-level ladder format; I caught this... and rewrote all 25 objects"). Re-verification confirmed 4-item arrays throughout, zero regressions. **Lesson (new, mirror image of v164's finding): a validator catching a defect immediately after a wave completes can race against that same agent's own in-flight self-correction** if the agent's task hasn't actually finished reporting yet — the orchestrator's own catch isn't automatically final either; a same-group re-check moments later is worth doing before dispatching a fix, the same discipline as v164's "don't trust a shortfall count without a pause-and-recheck" but for the opposite direction (a real-looking defect that turns out to have already self-resolved).

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `pers2_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans. The full required-field validator, run across all 625 new Commons together at the end, found zero problems (the group-21 defect above was fully resolved before this final sweep ran). Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones. `npm run build` → OK, `npm run check` → SYNTAX OK. **`npm run regress` could not be completed this session** — Playwright's headless Chromium failed to launch in this environment (`browserType.launch: Timeout 180000ms exceeded`, reproduced 3 times including a bare `chromium.launch()` smoke test with no app code involved), an environment/sandbox limitation unrelated to the content changes, not a code defect. `npm run package` → succeeded regardless (no Playwright dependency) → produced `dist/operations.zip`. **The regression suite should be run in a normal environment before the next session trusts this build's runtime behavior**, even though every other verification layer (syntax, structural, field-shape) passed cleanly.

**Next workstream:** exactly 1 Mythic tree's worth of Commons remains — **Cyber Operator** (`cat:"technical"`, 625 cards), the last of all 16 Mythic trees. It has a shipped same-cat sibling (Cyberspace Operations Officer) plus 5 known pre-existing dupes in `technical` — whole-cat per-name grep discipline remains mandatory. Repeat this session's process. **Also: before starting that session, get a working `npm run regress` run** — either in a fresh environment or after confirming this session's environment issue was transient — to close the loop on this session's unverified runtime check before treating v166's content as fully shipped.

### v167 — Commons layer, sixteenth and FINAL tree: Cyber Operator (625 new seeds) — all 16 Mythic trees now have complete Commons layers

**Files changed:** `src/core/skills-data.js`, `sw.js`, `planning/IMPROVEMENTS-v167.md` (written and then deleted per the standard workflow), `planning/IDEAS-gui-revamp.md` (new — queued follow-up workstream, see below), `planning/FINISHED-FEATURES.md`, `planning/NEXT-SESSION-PROMPT.md`, `planning/SESSION-TIMES.md`.

SW bumped to `operations-v167`. `SKILL_LADDER_VER` unchanged at **117** (pure addition). Total skills: **12524** (11899 + 625).

Re-derived the pyramid state fresh at start via a Node script walking all 16 Mythic trees to their Commons layer: confirmed 11899 total, 15 trees at 625 Commons, 1 at 0 (Cyber Operator) — matched v166's doc exactly, no drift. `npm run regress` was run first thing this session to close the loop on v166's unverified runtime check — **passed cleanly, 0 pageerrors** — confirming v166's Playwright failure was a transient environment issue, not a code defect.

Mapped the tree's full structure from `SEED_SKILLS` before staging: 5 Legendaries (Cyber Operations Mastery, Offensive Cyber Mastery, Defensive Cyber Operations, Cyber Intelligence, Mission Command Integration) × 5 Rare slot-holders each × 5 Uncommons each × 5 new Commons each = 125 setKeys / 625 skills, all pure Rare cards (no pre-existing Jokers, no legacy-prefix quirk this time — the Legendary "Cyber Operations Mastery" does carry an OLD `tech_c_*` prefix on its 5 Commons setKeys vs. the tree's own `tech2_c_*`, matching prior sessions' benign pattern, verified unclaimed before staging).

**Unusually high thematic density flagged and pre-mitigated in the scoping doc before any agent was dispatched** (unlike prior sessions where this was only discovered mid-wave): this tree has **four separate "vulnerability"-themed groups** (Group 1's novel-discovery research, Group 6's single-engagement offensive assessment, Group 14's ongoing remediation-program management, Group 19's disclosed-vuln/exploitation-in-the-wild intelligence), **two ATT&CK-mapping setKeys** (Group 5's tactical single-incident mapping vs. Group 17's strategic sector-wide mapping), **two actor-related setKeys** (Group 5's already-named-actor profiling vs. Group 18's who-did-it attribution), and **two timeline-reconstruction setKeys** (Group 4's raw-evidence disk/memory forensics vs. Group 12's SIEM-query-output correlation). Every agent prompt for these groups named the specific sibling group and the exact scope boundary explicitly, per v165's lesson — held clean across all of them, confirmed via targeted post-wave comparisons (e.g. Group 17's agent was explicitly instructed to grep and read Group 5's `tech_c_attck_mapping` content before finishing, to self-verify no framing overlap).

**Execution:** staged all 125 `// SLOT:` markers in one pass (using a temp-file+atomic-rename Node script after a transient OneDrive file-lock error on the first attempt — file was confirmed untouched via `git diff` before retrying), committed as "v167 (staged)" before dispatching any agent. 13 waves total (12 waves of 2 agents, 1 solo final wave — no concurrency needed for the last group), 2-agent concurrency throughout — 16 trees straight now at this concurrency, zero file-corruption incidents. Verified after every wave: `node --check`, member-count sweep, marker-count-drop-by-exactly-10 check, duplicate marker/header sweep, cumulative required-field validator, whole-file name+cat duplicate sweep. 5 intermediate checkpoint commits at Legendary boundaries (after waves 3, 5, 8, 10, and the final wave).

**Zero uncaught defects reached the committed file, but far more self-caught mid-task defects than any prior session — worth noting as a density signal, not a regression:** nearly every wave had at least one agent self-catch and fix a real mistake before reporting done — Edit `old_string`/`new_string` spans accidentally including a neighboring `// SLOT:` marker line (causing transient duplication or deletion, self-corrected via the standing re-grep-after-every-edit discipline, groups 6/7/11/15/16/18), and undercounts or a missing `maintain` array on a first draft (groups 14, 19, 21, 22, 23) caught by the mandatory pre-report field-and-count check. **None of these reached the orchestrator's independent post-wave validator as a real defect** — every single one was self-corrected before the agent's final report. This is the first tree in the workstream where the "prefer Edit tool, re-grep after every call, count before reporting" standing instructions did literally all of the defect-catching work; the orchestrator's own validator served purely as confirmation, not correction, every single wave.

Verified: `node --check` syntax OK at every wave boundary and at the end. Full recursive whole-tree sweep of `tech2_leg` confirmed exactly 5 Legendaries → 25 Rares → 125 Uncommons → 625 Commons, 5/5/5/5 at every tier, zero orphans. The full required-field validator, run across all 625 new Commons together at the end, found zero problems. Name+cat duplicate sweep across the whole file: exactly the same 10 pre-existing duplicates from before this session, zero new ones. `npm run build` → OK, `npm run check` → SYNTAX OK, `npm run regress` → `PAGEERRORS 0`, `badCount:0`, `total:12524`. `npm run package` → produced `dist/operations.zip`.

**This is the sixteenth and final Mythic tree — all 16/16 now have complete Commons layers.** The multi-session Commons-layer workstream that ran from v150 through v167 is complete: 10000 Commons skills total (16 trees × 625) plus the pre-existing Mythic/Legendary/Rare/Uncommon structure, all verified 5/5/5/5/5 with zero orphans across the whole pyramid.

**Mid-session, Wyatt requested a new workstream via `AskUserQuestion`: a whole-app GUI revamp** (visual/theme refresh + layout/navigation restructuring + mobile/responsive overhaul + a specifically-flagged skills-tab redesign for visibility/clutter/organization/unlock-clarity problems). Captured in the new `planning/IDEAS-gui-revamp.md` — not yet scoped into a build plan; needs its own dedicated audit-and-design session before implementation, per `CLAUDE.md`'s "ask before large architectural shifts" rule. **Next workstream is this GUI revamp**, not the previously-queued FM/test features doc (`planning/IDEAS-tests-fm-workouts.md`) — that doc is still valid and queued for whenever the GUI work wraps.

> **Backfill note (added during the v173 session):** v168–v171 below were shipped in real sessions between v167 and v172 but were never logged in this file or `SESSION-TIMES.md` at the time — this doc's own next-session prompt went stale as a result, claiming "v167 current" when the app was actually four versions ahead, which caused v172 to partly re-audit territory v168/v170/v171 had already covered. Reconstructed from `git log`'s full commit messages (the real record — these entries paraphrase them, not the reverse) specifically so this doesn't happen again.

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
