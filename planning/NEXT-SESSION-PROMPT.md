# Next Session Prompt — Operations PWA

Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all three of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity
3. `planning/IMPROVEMENTS-v127.md` — the features to implement this session, with full rationale, implementation sketches, and CSS snippets
4. `planning/IMPROVEMENTS-skills-expansion.md` — the comprehensive skills backlog (60+ new skills across all paths, with ladder sketches and tier names); consult this whenever adding skills so you don't duplicate effort or miss obvious gaps

**Read `IMPROVEMENTS-v127.md` in full before writing a single line of code.** It is the authoritative spec for everything below. The implementation sketches, CSS, and data structures in that file are the designs to follow — do not improvise around them.

**Current version: v126.** The service worker is at `operations-v126` in `sw.js`. `SKILL_LADDER_VER` is currently **96** (in `src/core/migration.js`).

---

## What's already done — do not re-implement

All visual overhaul phases and features through v117 are complete. Full record in `planning/FINISHED-FEATURES.md`.

**v102–v109 (visual overhaul):**
- Phase 1: Skills tab → collapsible path decks, per-skill card anatomy with sigil, fill bar, tier label
- Phase 2: `skEmblemSvg` sigil system (10 paths × 5 tiers), Carved Rings overhauled to sigil grid
- Phase 3: All 18 tabs themed with `#view-*` scoped CSS; dark walnut wood grain; AFT 54px score; Dawn atmospheric strip

**v110 (10 features):** skill fading digest on Dawn, baseline test nudge, AFT sparkline, oath path breakdown, oath archive search, FM plan recommendation, daily order completion timestamps, skill decay grace period + amber at-risk state, qualification log with auto-skill advancement, FM beginner prescription.

**v111 (1 feature):** "practiced" button on every started non-auto skill card — resets fade timer without level change. Handler `skPractice(skId)` in `skills-core.js`; button in `skills.js` footer; CSS `.sk-practice-btn`.

**v112 (5 features):** skill search / quick-find (`#skSearch`, `_filterSkillDecks()` in `skills.js`), Dawn "skill of the day" (deterministic daily focal skill in `today.js` Field Notes), AFT event drill suggestions (`DRILL` object in `aft.js`, one-sentence prescription per event), boss sub-task checkpoints (`checkpoints:[]` on boss objects, inline checklist UI, migration in `state.js` load), profile weight trend line (linear regression slope → `±N lbs/month` in `profile.js`).

**v113 (5 features):** oath notes/why field (`q.notes`, textarea in add form, shown in list + archive), boss add-checkpoint inline form (input + `+` button on active boss cards, `data-baddcheckbtn` handler), weight goal + projection (`S.profile.weightGoal`, gap + weeks-to-goal using existing regression slope), skill "last practiced" date in card footer (`sk.lastQuestTs` → "practiced Nd ago"), daily orders stale warning (amber `⚠ stale` tag on orders not done in 7+ days).

**v114 (6 features):** boss checkpoint-driven HP (`cpDriven:true`, no free-hit strike button, "Conquer the Trial" only at `hp===1`, migration backfills existing checkpoint bosses), boss target date + daily pace (`b.targetDate`, `.boss-pace` row jade/ember), oath progress dispatch log (`q.updates[]`, `data-qupdateadd` handler, shown in archive), daily orders pause/resume (`d.paused`, `⏸` badge + Resume btn, excluded from perfect-day and stale), AFT per-event target scores (`S.aftEventTargets`, collapsible target-setter, `↑ N to target` / `✓ target` per event row), skill target level marker (`.sk-tgt-tick` gold tick on fill bar, `.sk-tgt-foot` footer note, set via `data-sktgtlv` input in Work panel).

**v115 (5 features, Feature 2 was pre-existing):** Wall bulk-entry wizard (`.wall-bulk-toggle`/`.wall-bulk-panel` on all 5 Wall sections; `_bulkSetup()` helper; pipe-separated parse), Academic Honors section (`S.academicHonors[]`, "📚 Academic" sub-nav tab, `renderAcademicHonors()`, `.aw-card` reuse), ROTC Record section (`S.rotcRecord: {positions,competitions,campResults}`, "⭐ ROTC" sub-nav tab, `renderRotcRecord()`, `.rotc-item` cards with jade left-border, 3 collapsible sub-sections), Language proficiency + clearance on Profile (`S.profile.languages[]`/`clearance{}`, `renderLanguages()`, `.ilr-badge`), Wall → résumé copy (`copyWallResume()`, "📋 Copy résumé" `.wall-resume-btn` in Wall header, multi-section plain-text clipboard output).

**Skills expansion (between v115 and v116):** 7 new SEED_SKILLS added to `src/core/skills-data.js`; `SKILL_LADDER_VER` bumped to **86**. Total skill count was **100**. New skills: Competitive distance running, Programming (Java), Programming (JavaScript), Parliamentary procedure, Higher mathematics, Languages group node, German. Do NOT re-add these — check `src/core/skills-data.js` first.

**v116 (6 features + 4 new skills + 3 ladder improvements):** GPA semester history log on Profile (`S.gpaHistory[]`, `renderGpaHistory()`, sparkline, `data-gpadel`), quals catalog expansion (5 new entries + `custom` option with `qualCustomName` input), counseling bulk import (`.wall-bulk-toggle` in records.html, inline parser in records.js), Dawn academic snapshot (`academicHtml` block in `renderToday()`, `.acad-strip`/`.dl-badge`), membership active/past filter (`_mbFilter`, `.mb-filter-bar` buttons, filter logic in `renderMemberships()`). New skills: Radio communications, OPSEC / digital security, Negotiation & influence, Reading speed. Ladder improvements: Networking advance[2]+[7] cert milestones; Cybersecurity fundamentals expanded to 9 levels; Programming Python/Java/JavaScript L8 advance entries clarified. `SKILL_LADDER_VER` bumped to **87**. Total skills: **104**.

**v117 (6 features + 2 new skills + 2 ladder improvements):** Reading speed in-app timed passage test (4 passages, WPM + comprehension self-check, stores to `S.tests[]`, auto-levels skill), OML snapshot panel on Today tab (GPA/AFT/MS eval in one view), Boss archive (conquered bosses get `completedAt` date, split into active/archived with collapsible `<details>`), Skill decay heat-map (91-day calendar toggle on Skills tab, colored by activity density), Counseling follow-up alert on Today tab (7-day or overdue warning), Skill notes (practice textarea in Work panel, stored in `history[]`, shown in `sk-log-recent`). New skills: Memory retention (auto:`quiz:retention`, 10-level SRS ladder). Ladder improvements: Radio communications `howTo` now references FM 6-02; Reading speed `howTo` rewritten for in-app test. `SKILL_LADDER_VER` bumped to **88**. Total skills: **105**.

**v118 (3 features + 1 new skill + 2 ladder improvements):** Quest step tracking (optional `steps` count on oath creation, jade fill-bar progress display, `+1 step` button auto-completes when full, `q.steps`/`q.progress` fields), Skill mastery summary bar (`#skSummaryBar` above search bar in Skills tab — active/maxed/at-risk/decayed counts with color-coded chips), Counseling search & filter (type filter bar + text search in Records tab, `_cnFilter`/`_cnSearch` module vars, `renderCounsel()` updated). New skill: First aid / TCCC (`tactical / Soldier tasks`, fadeDays:180, 9-level TCCC ladder). Ladder improvements: Negotiation & influence `howTo` adds FM 6-22 reference; Memory retention `howTo` clarifies self-reported leveling. `SKILL_LADDER_VER` bumped to **89**. Total skills: **106**.

**v119 (7 features + career-stage target system):** Career-stage skill targets (auto goal-line ticks on skill cards from `targets:{MS1…O1}` in seed data, `careerStage()` in migration.js, dim next-stage secondary tick in leafCard), Habit streak calendar (60-day perfect-day calendar on Dailies with `S.dailyHistory[]`), Skill export / print view (📋 copy-to-clipboard skills summary button in Skills toolbar), Qualification expiry alerts on Today tab (60-day look-ahead, expired overdue styling), Boss sprint mode (`b.todayCommit`, daily HP commitment bar with progress + missed warning), Weekly training load summary in Today Field Notes (sessions/mi/reps from `S.workouts[]`), GPA goal + projected graduation GPA (linear regression through semester history, jade/ember vs. goal). `SKILL_LADDER_VER` bumped to **90**. SW bumped to `operations-v119`.

**v120 (6 features):** Skill target sync button (↑ sync in Skills toolbar, `updateAllSkillTargets()`, `data-updateskilltgts`), Skill assessment panel (📊 toggle, flat gap table sorted by behind-ness, `renderSkillAssessment()`), User milestones (`S.milestones[]`, Profile form, `renderMilestones()`, dawn `.milestone-dawn` pill row for up to 3 upcoming), Quest due-soon alert in Today Field Notes (🚩 oaths due ≤7 days), AFT linear trend projection in Today Field Notes (≥3 entries, slope + projected next score), New skills: Strength programming (physical/Fitness programming group, 8 levels) + Military writing (leadership, 8 levels). `SKILL_LADDER_VER` bumped to **91**. SW bumped to `operations-v120`.

**v121 (6 features + 2 new skills):** Milestone countdown progress bar on Dawn (`.milestone-bar-wrap` panel with fill bar, jade/amber based on proximity, progress computed from last past milestone as origin), Skill streak counter (`skStreak(sk)` in skills-core.js, `🔥 N-day streak` in leaf card footer if ≥2, `.sk-streak` CSS), Daily orders up/down reorder buttons (`.daily-move-col` with `▲`/`▼` `data-moveup`/`data-movedown` buttons, handlers swap adjacent array elements and call `renderDailies()`), Skill-of-the-day "practiced" quick-log on Dawn (inline `✓ practiced` button with `data-skpractice` on focal skill row, uses existing handler from v111), AFT event trend sparklines (`miniSparkline(evVals, 60, 16)` per event row in `showAftResult()`, `.aft-event-spark`). New skills: Rucking technique (physical/Endurance, 6 levels, fadeDays:90) + Army history & officership (leadership, 6 levels, fadeDays:180). `SKILL_LADDER_VER` bumped to **92**. SW bumped to `operations-v121`. Total skills: **111**.

**v122 (skills expansion — 64 new skills):** Pure data session. Added 64 skills to `SEED_SKILLS` in `src/core/skills-data.js`. No UI changes. Covers: tactical (Marksmanship M17, CBRN, Grenade employment, Military law & ROE, Battle drills, SALUTE/spot reporting, Rappelling, MDMP/Operational planning); physical (Combat water survival, Obstacle course, Cycling, Gymnastics/bodyweight); cognitive (Critical thinking, Decision science, Spatial reasoning); physiological (Recovery tracking, Injury prevention & prehab, Vision training); technical core CS (Git, SQL & databases, Bash scripting, Cloud computing, Data structures & algorithms); technical cyber/security (Systems programming C/C++, Web app dev, Penetration testing, DFIR, Malware analysis, Cryptography, Network defense/blue team, Reverse engineering); technical DevOps (DevOps/containerization, PowerShell, CTF/competitive security, ML/AI fundamentals, Software testing); leadership (Brief prep & delivery, Ethics & moral reasoning, Cross-cultural competence, Project management); academic (Statistics & data analysis, Research skills, Geopolitics, Spanish, French, Mandarin, Arabic, Russian, Philosophy & ethics, Economics fundamentals); personal/hearth/roots (Professional networking, Interview skills, Tax prep, Investing, Home maintenance, Health literacy, Legal literacy, Mindfulness, Sleep optimization, Mental health literacy, Vehicle preparedness, Amateur radio, Self-awareness, Gratitude). `SKILL_LADDER_VER` bumped to **93**. SW bumped to `operations-v122`. Total skills: **175**.

**v123 (6 UX + intelligence features + skill hierarchies):** Path health snapshot on Dawn (`.path-summary-strip` card listing every active path: icon, name, active skill count, avg level, at-risk count; color jade/ember by decay ratio). Skill gap heatmap (🗺️ toggle on Skills toolbar, `renderSkillGapMap()`, table paths × career stages, jade/ember/blood cells). Skill notes search on Records tab (`renderSkillNotes()` at top, `#skNoteSearch` filter, all `history[].note` entries sorted desc). Weekly skill practice planner (🗓️ toggle, `renderWeeklyQueue()`, skills with `skDaysLeft ≤ 7` or decayed, urgency-sorted with ✓ practiced button). 4 new leaf skills: Combatives (physical control) (physical, 7L); Obstacle leadership (leadership, 6L); Second language retention (cognitive, 5L); Wilderness medicine / CASEVAC (tactical, 7L). Skill hierarchies: 7 new group nodes for technical (Foundations, Programming, Cybersecurity, DevOps & ops) and leadership (Communication, Command skills, Operations & planning) paths; `parent:` assigned to 36 existing skills; migration auto-reconciler backfills existing saves. `SKILL_LADDER_VER` bumped to **94**. SW bumped to `operations-v123`. Total skills: **186**.

**v124 (6 features):** Commissioning readiness dashboard on Profile (`renderCommReadiness()` in `profile.js`, 6 traffic-light indicators: AFT total, GPA, skills at target, qualifications, ROTC record, clearance). Skill-linked oath completion (skill-link row on each active quest card with select + practice/level-up radio; on completion the linked skill is auto-practiced or leveled; persisted as `q.linkedSkillId`/`q.linkedSkillType`). Card table redesign of Skills tab: dark green felt `#view-skills` background, 10 path deck cards with embossed back (sigil, path name, suit name, level corners), decks open to flex-wrap card grids; rank corners on skill cards (Ace–King, importance-sorted: most important skill in each deck → King); group sub-skills rendered as 110px mini playing cards in `.sk-mini-grid`; `SK_SUIT` and `CARD_RANKS` constants in `skills.js`. End-of-day training journal on Dawn (`S.dayLog[]`, `renderDayLog()` in `today.js`, 3-field form + last-3-days display). 30-day skill history sparkline in Work panel (`skTrendSparkline(sk)` in `skills-core.js`, appended to `skWorkGuidance()` output via `tgtBlock`). Fix 5 orphaned skills missing `parent:` field (`Statistics & data analysis`, `Geopolitics & foreign policy`, `Philosophy & ethics`, `Economics fundamentals`, `Injury prevention & prehab`). `SKILL_LADDER_VER` bumped to **95**. SW bumped to `operations-v124`. Total skills: **186**.

**v125 ("All the Skills" card mechanics):** Rarity system — `skRarity(sk)` in `skills-core.js` assigns Common/Uncommon/Rare/Legendary/Mythic/Joker tiers based on skill ladder depth (≤4→Common, 5-7→Uncommon, 8-10→Rare, 11-13→Legendary, 14+→Mythic, auto/joker→Joker); rarity badge shown on card tier line; rarity border color applied via `--rar-col` CSS var. Sub-deck pages — paths with >13 top-level skills split into sub-decks of 13 each (I, II, III...); each sub-deck gets its own embossed card back inside the opened path deck; path card back shows "N decks" indicator. Joker deck — all `auto:true` skills + user-tagged joker skills aggregated in a Wildcards deck (deep violet gradient) at the top of `#skList`; jump-bar gets 🃏 Wildcards button. Joker toggle — checkbox in the skill add/edit form ("Wildcard (Joker)") persists `sk.joker=true`; wired in `skCreate()` and `skEdit()` in `skills-core.js`. No skill is ever removed — all mechanics preserve skills permanently. SW bumped to `operations-v125`. Total skills: **186**.

**v126 (6 card features + pyramid seeds + 3 utility skills + 4 utility improvements):**

*Card system:*
- **Today's Hand**: 5 started skills drawn deterministically each day via `hashStr(dateKey)` + `seededShuffle()` in `today.js`. Shown as horizontal card strip `.th-hand` on Dawn above Field Notes.
- **Collection stats**: `X/N collected` chip in `skSummaryBar` (started/total leaves per path, gold font).
- **Foil shimmer**: Legendary and Mythic cards get a `::after` CSS animation (`foilShimmer`, 4s linear infinite) on `.sk-card.rarity-legendary` and `.sk-card.rarity-mythic`.
- **Path completion badges**: `<span class="sk-path-badge discovered">All Collected</span>` and `<span class="sk-path-badge mastered">★ All Mastered</span>` in deck header when all leaves started or maxed.
- **Skill synergy combos**: `SYNERGY_PAIRS` array (15 pairs) in `skills-core.js`, `skHasSynergy(sk)` checks if partner is at L4+; `⚡ Partner Name` shown in `.sk-synergy-foot` on card footer.
- **Side Deck (face-down cards)**: Unstarted leaves render face-down in a collapsible `<details class="sk-side-deck">` section below each path's active cards. `faceDownCard()` function renders card back with rarity pip, name hidden, synthesis set progress bar and Combine button if locked synthesis card.

*Pyramid system (skills-core.js):*
- `skSeedOf(name, cat)` — finds a seed in `SEED_SKILLS`
- `skSetMembers(setKey)` — all non-group seeds matching setKey
- `skSetMasteredCount(setKey)` / `skSetCanCombine(setKey)` — progress toward synthesis
- `skCombineSet(setKey)` — sets `synthesisUnlocked=true` on synthesis card, saves, renders
- Combine button handler wired in `events.js` via `data-skcombine`

*Pyramid seeds added to `SEED_SKILLS`:*
- 3 utility skills: "Land navigation" (tactical, 8L), "9-line MEDEVAC" (tactical, 6L), "Personal finance" (personal, 7L)
- Physical path pyramid seeds: 1 Mythic ("Physical Mastery", synthesizedFrom:"phys_leg") + 5 Legendaries (setKey:"phys_leg", each synthesizedFrom a Rare setKey) + 25 Rares across 5 sets (phys_r_strength, phys_r_endurance, phys_r_composition, phys_r_combat, phys_r_movement) — each Rare synthesizedFrom a phys_u_* Uncommon setKey

*4 utility improvements:*
- **Quick PT Log**: 3-field form (type/duration/notes) on Dawn tab below Day Log, saves to `S.workouts[]`
- **AFT Goal**: `S.aftGoal` integer in DEFAULT; `renderAftGoal(el)` in `aft.js`; progress bar toward target in `#aftGoalWrap`
- **Urgency-first focal skill**: Skills ≤3 days from fade shown first on Dawn with `⚠ Nd left` badge (`.sk-focal-urgent`)
- **Skill history export**: "📋 Copy skill history" button in Records tab → clipboard summary of all level-up history grouped by path

`SKILL_LADDER_VER` bumped to **96**. SW bumped to `operations-v126`. Total skills: **220** (186 + 3 utility + 31 Physical pyramid seeds).

---

## Features to implement this session

These are drawn from `planning/IMPROVEMENTS-v127.md`. Read that file now — the sketches here are summaries only.

The primary work this session is the **Physical path Strength Uncommons** (25 seeds) — the next cycle of the 7,810-card pyramid. These are the 5-member sets whose `setKey` values match the `synthesizedFrom` fields already defined on the 25 Physical Rares added in v126. The doc also includes a **Synthesis Chain View** (UI) and a **Synthesis-Ready Alert** on Dawn.

---

*Features for this session are in `planning/IMPROVEMENTS-v127.md`.*

---

## How to work — the exact process used every session

Follow this exactly, in order:

### Phase 0 — Orient before writing a single line
1. Read `CLAUDE.md`, `planning/FINISHED-FEATURES.md`, and `planning/IMPROVEMENTS-v127.md` in full.
2. For each feature, read the **specific source files** that will be touched before editing them:
   - Use `Grep` to find where the function/element you're adding near lives.
   - Use `Read` with `offset` + `limit` to read the exact surrounding code.
   - Never edit a file you haven't read in this session — the Edit tool will reject it and you'll break context.
3. Use `TodoWrite` to lay out all tasks as `pending` before starting any of them.

### Phase 1 — Implement one feature at a time
4. Mark the first task `in_progress`.
5. Edit source files in `src/` only — **never touch `index.html`**.
6. For each file edit: read the relevant block first, make a surgical diff. Match existing code style exactly (terse, no framework, small helpers).
7. After all edits for a feature: mark the task `completed` immediately.
8. Move to the next task.

### Phase 2 — Build and verify after each batch (or at the end for low-risk changes)
9. `python scripts/build.py` — assemble `index.html`. Must print `OK index.html`.
10. `npm run check` — syntax-check the assembled script. Must print `SYNTAX OK`.
11. `npm run regress` — headless 18-tab test. Must print `PAGEERRORS 0`. Fix any pageerrors before continuing.
12. If a build or check fails: read the error, find the source file that's wrong, fix it, rebuild.

### Phase 3 — Ship
13. Bump `sw.js`: `operations-v126` → `operations-v127` (increment once per session; increment again if you ship a second batch).
14. Bump `SKILL_LADDER_VER` in `src/core/migration.js` (currently **96**) to **97** — new Uncommon ladders are being added.
15. `npm run package` — produces `dist/operations.zip`. Must complete without error.
16. Delete the now-implemented improvements doc: `rm planning/IMPROVEMENTS-v127.md`. It has been recorded in `FINISHED-FEATURES.md` — no need to keep the draft.
17. **Create the next session's improvements doc** — write `planning/IMPROVEMENTS-v128.md` for Physical Endurance Uncommons (25 seeds) + Composition Uncommons (25 seeds) + any other improvements.
18. **Update `NEXT-SESSION-PROMPT.md`** — change every `v126`/`v127` reference to the new version numbers so the next session prompt is self-consistent.
19. Tell Wyatt to **hard-refresh / reopen the app** so the new service worker activates and any migrations run.

### What not to do
- Don't read reference docs and then skip reading the actual source files — the code is what matters.
- Don't edit more than one feature's files in a single batch before building/checking.
- Don't add error handling, fallbacks, or validation for scenarios that can't happen.
- Don't add comments explaining what the code does — only the why if it's non-obvious.
- Don't restructure or reformat unrelated code while making a targeted change.

---

## Required workflow summary

```bash
# After every feature or batch of changes:
python scripts/build.py       # must say OK
npm run check                 # must say SYNTAX OK
npm run regress               # must say PAGEERRORS 0

# After all features, before reporting done:
# bump sw.js: operations-v126 → operations-v127
npm run package               # produces dist/operations.zip
```

---

## Key architecture reminders

- `index.html` is **assembled output** — edit `src/`, then build
- All data in `localStorage["operations_v2"]` via `S = load()`; `DEFAULT` is in `src/core/constants.js`
- `skLeafColor(eff, max, sk?)` → `rgb(r,g,b)` string; optional `sk` returns amber if at-risk
- `skEffectiveLevel(sk)` → working level accounting for decay + 20% grace, floors at 1 if started
- `skFadeState(sk)` → `"current" | "at-risk" | "decayed"`
- `skDaysLeft(sk)` → days until actual decay (after grace); null if not started
- `skPractice(skId)` → resets fade timer without level change (non-auto, started skills only)
- `skReachLevel(skId, targetLevel, note?)` → levels up to targetLevel, stores optional note in history
- `skEmblemSvg(sk, eff, max)` — sigil generator in `skills.js`, also used in `trophies.js`
- `miniSparkline(values, w, h)` — small SVG sparkline, defined in `state.js`
- `toast(msg)` — bottom toast, defined in `events.js`
- `PATH_META` — path metadata (name, icon, color, world, lore), in `constants.js`
- `SK_PATH_ICON` — path → emoji map, in `tree.js`
- `renderBosses()` lives in `src/core/state.js` (not a dedicated bosses.js)
- All CSS in `src/styles/main.css` — no per-tab CSS files
- Regression covers **18 tabs** (see `scripts/regress.js`)
- No network calls, no CDN fonts, no telemetry — ever

**Pyramid system (added v125–v126):**
- `skRarity(sk)` — rarity from explicit `rarity` field or ladder depth
- `skSeedOf(name, cat)` — find a skill's seed in SEED_SKILLS
- `skSetMembers(setKey)` — all non-group seeds with matching setKey
- `skSetMasteredCount(setKey)` / `skSetCanCombine(setKey)` — set progress
- `skCombineSet(setKey)` — sets `synthesisUnlocked=true`, saves, renders
- `SYNERGY_PAIRS` — 15 complementary skill pairs; `skHasSynergy(sk)` — partner at L4+?
- Seeds use: `rarity`, `setKey`, `synthesizedFrom`, `unlockHint` fields
- Live skills use: `synthesisUnlocked` (boolean, the only pyramid field on live data)
- Side Deck (unstarted leaves): collapsible `<details class="sk-side-deck">` in `skills.js`
- Face-down card function: `faceDownCard(sk, suit, rank, isSynthPending)` in `skills.js`
- Combine button handler: `data-skcombine` in `events.js` delegation
- Total physical pyramid seeds in v126: 31 (1 Mythic + 5 Legendaries + 25 Rares)
- Physical Uncommons NOT yet added — that is v127's work (25 Strength Uncommons)
- Physical Uncommon setKey naming: `phys_u_[rare_set_name]` (must match `synthesizedFrom` on corresponding Rares)

**Existing skill integration rule (applies every session that builds out a path cluster):**
When arriving at a new cluster (e.g., Strength Uncommons), first grep all existing `SEED_SKILLS` entries for that `cat` and audit their ladder depth. Assign each existing skill that fits into the pyramid by adding `setKey` (and if needed `rarity` or `synthesizedFrom`) directly to its seed object. Then count open slots per set (5 minus assigned existing skills) and add only the remaining new seeds. Rules:
- Existing skills fill slots, not complete sets. At most 2 existing skills per set of 5; never all 5 from existing seeds.
- A skill that covers multiple aspects is OK placed as one slot — its "extra" aspects are represented by other new seeds in the same set. No need to split or alter the existing ladder.
- Don't force every existing skill into the pyramid. If one doesn't fit, leave it without a setKey — it stays as a standalone card.
- Sets must have exactly 5 members. If a set already has 5 defined (from prior sessions), an existing skill cannot be added to it; find the next best fit instead.
- Add explicit `rarity` field when the depth-based auto-rarity is wrong for the skill's actual role.

**Progress reset rule — intentional, permanent, user-authorized:**
> *"I want to be a blank slate even if I have in the past reached a certain level. I want to go back to basics and earn progress."*

This overrides CLAUDE.md Rule 4 for pyramid-integrated skills. When an existing skill gains a `setKey` (is integrated into the pyramid), its live progress is wiped: `currentLevel→0`, `history→[]`, `lastQuestTs→null`. The skill still exists with its full ladder intact — it moves from the face-up deck into the Side Deck, locked until prerequisites are earned. Progress can only be re-earned by working through the pyramid chain from the bottom.

Implementation via a one-time migration flag in `src/core/migration.js`:
```js
const PYRAMID_RESET_VER = 1;
// Inside mergeNewSeedSkills(), after ladder sync:
if(seed.setKey && !live.pyramidResetApplied){
  live.currentLevel = 0;
  live.history = [];
  live.lastQuestTs = null;
  delete live.synthesisUnlocked;
  live.pyramidResetApplied = PYRAMID_RESET_VER;
}
```
The `pyramidResetApplied` flag prevents re-firing on future SKILL_LADDER_VER bumps. Only runs once per skill, the first time it gains a setKey. Skills without setKey are never touched. Auto-skills (Jokers) never have setKey and are never touched.

---

## Tone constraints

Wyatt values: honesty, measurability, privacy, preserved progress, Yggdrasil symbolism. Keep copy plain and honest — no hype, no fake metrics. Ask before large architectural changes. Small surgical diffs.
