# Operations — Planned Improvements (v97+)

Seven features to implement next, ranked by cadet impact.

---

## 1. Habit streak calendar / heat-map
**Value:** Right now habits show a running streak number but no visual history. A small calendar heat-map (last 60 days) instantly shows consistency patterns — where you broke the chain and how many days you've rebuilt since. This is the most motivating view possible for a daily-discipline tool.

**Implementation sketch:**
- In `src/tabs/dailies.js` (inside each habit's detail section, or as an expandable view):
  - Iterate `h.history` (array of `{date, done}` or just done-date strings) for the last 60 days
  - Render a 10-column grid of small squares, color = done (jade) / missed (ember) / future (line)
- CSS: `.habit-heat-row`, `.heat-sq` (10×10px, border-radius 2px), gap 2px
- No data migration needed — history is already stored per-habit in `S.habits`
- Keep the total streak number above the heat-map

---

## 2. Daily weight tracking on the Profile / Weight tab
**Value:** `S.weightLog` already exists (array of `{date, lb}`) and `S.profile.weightLb` stores a one-time entry. But there's no UI to log a daily weight check-in or plot the trend. For a cadet tracking body composition around PT cycles, a simple log + 30-day sparkline is immediately useful.

**Implementation sketch:**
- In `src/tabs/profile.js` renderProfile(): add a small weight-log form at the bottom:
  - `<input type="number" id="wlVal" placeholder="lbs">` + `<button id="wlLog">Log weight</button>`
  - On save: push `{date: new Date().toLocaleDateString(), ts: Date.now(), lb: val}` into `S.weightLog`; update `S.profile.weightLb` to the new value
- Render a 30-day sparkline (same SVG pattern as `aftSparkline()`) below the log button
- Show 7-day rolling average as a horizontal line for context
- No new deps — pure arithmetic from existing data

---

## 3. PT session calendar (last 30 days, one row)
**Value:** There's no at-a-glance view of training frequency. A single row of 30 day-circles — filled green if a workout or PT session was logged that day — immediately shows gaps and load distribution. Placed at the top of the Log tab, it answers "how often am I actually training?" honestly.

**Implementation sketch:**
- At the top of the Workout Log section in `src/tabs/log.js` `renderLog()`:
  - Iterate the last 30 days
  - For each day, check if `S.workouts` or `S.ptLog` has an entry matching that date
  - Render a row of 30 small circles (`<div class="pt-cal-dot">`) with `on` class if trained
- CSS: `.pt-cal{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:12px}` `.pt-cal-dot{width:14px;height:14px;border-radius:50%;background:var(--line)}` `.pt-cal-dot.on{background:var(--jade)}`
- Add a legend: "● = training day (workout or PT)"
- No state changes needed — reads from existing `S.workouts` and `S.ptLog`

---

## 4. Oath (quest) archive — completed oaths list
**Value:** Right now completed quests disappear after 900ms (cleared on complete). There's no history. Cadets completing major milestones — branch interviews, lab exams, commissioning requirements — lose that record. An archive tab section shows when each was sworn and completed.

**Implementation sketch:**
- Add `questArchive: []` to DEFAULT in `src/core/constants.js`
- In `src/core/events.js` where quest completion is handled (the `t.dataset.q` branch): before removing the completed quest, push `{...q, completedDate: new Date().toLocaleDateString()}` to `S.questArchive`
- In `src/tabs/quests.html`: add a collapsible "Completed" section below the Active Oaths list (`<div id="qArchive">`)
- In `src/core/state.js` renderQuests(): render the last 20 completed oaths in reverse order with a muted "✓ completed [date]" style
- No migration needed — new field, old saves just start empty

---

## 5. Session-level RPE (Rate of Perceived Exertion) on the workout log
**Value:** Duration alone doesn't capture load. A 1–10 RPE takes 1 second to enter and turns the workout history into an honest fatigue/load tracker. With RPE, the adaptive target engine can eventually distinguish "hard session stalled" from "easy session stalled."

**Implementation sketch:**
- In `src/tabs/log.html`, add a simple RPE selector next to Duration:
  `<select id="lgRpe"><option value="">RPE (opt)</option><option value="6">6 — easy</option>...<option value="10">10 — max</option></select>`
- In `src/tabs/log.js` lgSave handler: include `rpe: parseInt(...) || null`
- Clear after save; show in recent workouts history as a small tag: `RPE ${w.rpe}`
- No schema migration needed — `rpe` on old entries is just undefined

---

## 6. Dawn tab: overdue oath count in Field Notes
**Value:** The overdue-quest surfacing in getWarriorsFocus() shows one overdue oath at a time. If you have 3 overdue oaths but only the oldest surfaces, the others are invisible until you visit the Oaths tab. A count line in Field Notes ("3 overdue oaths") makes the full scope visible.

**Implementation sketch:**
- In `src/tabs/today.js` renderToday(), in the Field Notes section:
  - Compute `const overdueCount=(S.quests||[]).filter(q=>!q.done&&q.due&&q.due<localYMD()).length;`
  - If `overdueCount>1`, push a Field Note: `⚠️ ${overdueCount} overdue oaths`
  - (The first is already surfaced in Warrior's Focus, so only show the note when there are multiples)
- 3-line addition to the existing notes array in renderToday()

---

## 7. Baseline test history chart (plan.js / log.js)
**Value:** `S.baselines` stores monthly max-effort results but the only visual is the "Adaptive Targets" card which shows text. A per-exercise sparkline (same pattern as AFT) would show month-over-month progress in a glance — the most honest metric for whether training is working.

**Implementation sketch:**
- In `src/tabs/log.js` (or `plan.js`) after `renderAdaptiveTargets()`:
  - For each baseline test key, collect all history entries and their `baselineVolume()` values
  - If ≥2 entries: render a small inline SVG sparkline (reuse the `aftSparkline()` pattern, or extract a shared `miniSparkline(vals, W, H)` helper into `state.js`)
  - Show best value and month it was set
- CSS: `.bl-spark` — same as `.aft-spark` with a smaller height (40px)
- This would unlock the miniSparkline helper for re-use in the weight trend (improvement 2 above)

---

## Implementation order recommendation

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 1 | Habit heat-map calendar | Low | High (daily visibility) |
| 2 | Daily weight log + sparkline | Low | High (profile completeness) |
| 3 | PT calendar (30-day) | Low | Medium (training frequency) |
| 4 | Quest archive (completed oaths) | Low | High (milestone record) |
| 5 | RPE on workout log | Low | Medium (grows over time) |
| 6 | Overdue oath count in Field Notes | Very low | Medium |
| 7 | Baseline test history sparkline | Low-Medium | High (progress proof) |

Start with 1, 4, and 6 together (smallest changes, highest value-to-effort ratio), then 2+3+5 as a batch, then 7.
