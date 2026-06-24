# Next Session Prompt — Operations PWA

Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (MS2, Cyber branch goal). Read `CLAUDE.md` first — it is the binding rulebook. Then read `docs/OPERATIONS-HANDOFF.md` for full architecture. Then read `planning/IMPROVEMENTS-v101.md` for the prioritized feature list to implement next.

**Current version: v100.** The service worker is at `operations-v100` in `sw.js`.

### What was just completed (v100)

All 8 v100 features implemented:
1. **AFT countdown on Dawn** — `renderToday()` in `src/tabs/today.js` adds an ⏳ Field Notes row when `S.aftTestDate` is set and ≤60 days out; amber color when ≤14 days
2. **Overdue oath nav badge** — `<span class="nav-badge">` added to the Oaths nav button in `src/_shell.html`; `renderQuests()` in `src/core/state.js` updates the count after each render; CSS in `src/styles/main.css`
3. **Weekly training summary card** — `weekTrainCardHtml()` in `src/tabs/today.js` renders a standalone "This Week: N/M ▓▓▓░░" card in the Dawn flow; `weekBar` removed from `dawnSessionHtml()` in `src/tabs/plan.js` to avoid duplication
4. **Quest snooze button** — `+3d` button added to each quest with a due date in `renderQuests()` (`src/core/state.js`); handler in `src/core/events.js` advances `q.due` by 3 days (or from today if overdue); CSS in `main.css`
5. **Habit grace-day indicator** — `graceIcon` computed in `renderHabits()` in `src/tabs/dailies.js`: ⏰ when `state=grace` and grace not yet used; ⚠️ when grace is used and streak is at risk
6. **Path XP pips on Dawn** — `pathPipsHtml()` in `src/tabs/today.js` renders a compact grid of icon + level + fill bar for each active path using `skillLevel(S.pathXP[cat])`; CSS in `main.css`
7. **Skill card clipboard copy** — `⧉` copy button added to `leafCard()` in `src/tabs/skills.js`; handler in `src/core/events.js` writes "Name · Lv N Tier · peak Ln · fades in Nd" to clipboard; CSS in `main.css`
8. **Tree fade countdown ring** — `pushFadeRing()` helper in `src/core/tree.js` draws an SVG arc around each leaf when `daysLeft < fadeDays * 0.5`; amber→gold color; dasharray+dashoffset starts at 12 o'clock

### Your task

Implement the features from `IMPROVEMENTS-v101.md` in the recommended order. Start with feature 1 (bug fix — critical), then 2–3 (low effort, high daily impact), then 4–7, then 8 (tree surgery, most complex).

**Required workflow for every change:**
1. Edit source files in `src/` only — never touch `index.html` directly
2. Run `python scripts/build.py` after each feature to rebuild
3. Run `npm run check` (syntax check) and `npm run regress` (headless tab test, 17 tabs) to verify
4. Bump `sw.js` cache to `operations-v101` once all features are done
5. Run `npm run package` to produce the final zip

**After implementing the features in `planning/IMPROVEMENTS-v101.md`, do two more things:**

1. **Suggest 5–8 more improvements** based on what you observe in the codebase and what would genuinely help a cadet using this daily. Apply the same filter: honest, offline-safe, no fake metrics, no personal data pre-loaded. Rank them by impact.

2. **Create `planning/IMPROVEMENTS-v102.md`** with those new suggestions, formatted the same way — each with a value statement and implementation sketch. Also update `planning/NEXT-SESSION-PROMPT.md` to reflect the new version and what was completed.

### Key architecture reminders

- `index.html` is **assembled output** — edit `src/`, then build
- All data lives in `localStorage` key `"operations_v2"` via `S = load()`
- `pathXP` replaces the old `S.skills.{fitness,tactics,...}.xp` system (migrated in v91–92) — new XP grants must write to `S.pathXP[path]`, NOT `S.skills.*`
- `S.dailies` = daily orders (check-off), `S.quests` = oaths (complete-once missions)
- `S.aft` = array of `{date, raw, scores:{dl,hrp,sdc,plank,run}, total}`
- `S.profile` = `{birthdate, sex, bloodType, commissionDate, gpa}`
- `S.habits` = array of `{id, name, linkedSkill, streak, bestStreak, lastDone, graceUsed, history:[]}`
- `S.workouts` = workout log; `S.ptLog` = cadre PT log; `S.baselines` = monthly max-effort tests
- `S.questArchive` = completed oaths archive (added v97) — array of `{...quest, completedDate}`
- `S.streakLog` = daily order completion rates (added v98) — array of `{date, pct}`, last 90 days
- `S.streakBrokenDate` = YYYY-MM-DD when streak last broke (added v99), cleared after 3 recovery days
- `q.snoozeCount` = number of times an oath has been postponed (added v100, defaults absent=0)
- `miniSparkline(vals, W, H)` helper in `src/core/state.js` — reuse for any mini trend chart
- `getTierLabelForLevel(sk, level)` in `src/tabs/trophies.js` — returns tier label for a given level
- `_hbView` — module-level map in `src/tabs/dailies.js` for per-habit view state (strip|month)
- Auto skills (anything with `auto:` field in SEED_SKILLS) are never self-reportable
- Regression test covers **17 tabs** (`TABS` in `scripts/regress.js`)
- No network calls, no CDN fonts, no telemetry — ever

### Files most likely to touch for v101

| Feature | Files |
|---|---|
| Fix skill XP → pathXP.academic (bug) | `src/core/skills-core.js` |
| Post-log adaptive target toast | `src/tabs/log.js` |
| AFT per-event delta on Dawn | `src/tabs/today.js` |
| Quest snooze fatigue counter | `src/core/state.js`, `src/core/events.js`, `src/styles/main.css` |
| Habit 7-day consistency summary | `src/tabs/dailies.js`, `src/styles/main.css` |
| Commissioning memento card | `src/tabs/today.js` |
| Weight mirror sync-recency | `src/tabs/awards.js`, `src/styles/main.css` |
| Tree leaf tap → skill card | `src/core/tree.js` |

### Tone and constraints

The user (Wyatt) values: honesty, measurability, privacy, preserved progress, and the Yggdrasil symbolism. He is sharing this tool with other cadets in his unit. Default to asking before large architectural changes. Keep copy plain and honest — no hype, no fake metrics.
