# Operations — Planned Improvements (v98+)

Seven features to implement next, ranked by cadet impact.

---

## 1. Quest sorting by urgency (due date first)
**Value:** Right now active oaths are shown newest-first — an oath due tomorrow sits below one sworn five minutes ago. Sorting by urgency (overdue → due soonest → no date, newest last) makes it impossible to miss a deadline by accident.

**Implementation sketch:**
- In `src/core/state.js` `renderQuests()`, sort before rendering:
  - Overdue (due < today) first
  - Then due soonest → later → null (no date)
  - Within each bucket, preserve original order
  ```javascript
  const today=localYMD();
  const sorted=S.quests.slice().sort((a,b)=>{
    const aOver=a.due&&a.due<today, bOver=b.due&&b.due<today;
    if(aOver&&!bOver) return -1; if(bOver&&!aOver) return 1;
    if(a.due&&b.due) return a.due<b.due?-1:a.due>b.due?1:0;
    if(a.due&&!b.due) return -1; if(b.due&&!a.due) return 1;
    return 0;
  });
  ```
- Replace `S.quests.map(...)` with `sorted.map(...)`
- No data model change needed

---

## 2. Active boss on Dawn tab
**Value:** Bosses (big objective HP bars) are only visible if you switch to the Bosses tab. Showing one compact active boss on the Dawn card — name + progress bar + a "Strike it" button — surfaces a major goal without a tab switch. Research shows progress bars increase goal engagement.

**Implementation sketch:**
- In `src/tabs/today.js` `renderToday()`:
  - Find the first boss with `hp > 0`
  - Render a compact card:
    ```
    ⚔️ <name> — 7/20 steps remaining
    [■■■□□□□□□□] 35%
    [Strike it →]  [All bosses →]
  ```
  - The "Strike it" button fires the same `data-hit` path as in the Bosses tab
- Add a `dawn-boss-card` style: left-border in `--blood`, compact HP bar using same pattern as `.hpbar`
- Insert into the flow array in `renderToday()` after `focusHtml`

---

## 3. Habit best streak badge
**Value:** `h.bestStreak` is stored but never displayed. Showing "Best: 14 days" below the heat-map transforms a number in a black box into a personal record worth chasing — the same "beat your ghost" mechanic that makes Strava compelling.

**Implementation sketch:**
- In `habitHeatMap(h)` (or in the `renderHabits()` card body):
  - After the 60-day grid, append:
    ```javascript
    const best=h.bestStreak||0;
    const cur=st.streak||0;
    if(best>0) return `...grid... <div class="hb-best">Best: ${best} day${best!==1?'s':''} ${cur>=best?'⭐':''}</div>`;
    ```
  - `⭐` if current streak equals the best (you're at your record right now)
- CSS: `.hb-best{font-size:11px;color:var(--ink-faint);margin-top:3px}`

---

## 4. Daily completion log (7-day discipline score)
**Value:** The streak number penalizes any miss. A 7-day completion rate (% of dailies done each day) is a more forgiving and honest metric — a 6/7 day with 85% average is different from a 6/7 day with 30% average. This turns "did I show up?" into "how hard did I work when I did?".

**Implementation sketch:**
- Extend `checkDailyReset()` in `src/core/state.js`: before resetting `S.dailies`, push `{date: S.lastDaily, pct: done/total}` to `S.streakLog` (add `streakLog:[]` to DEFAULT)
- Keep last 90 entries: `S.streakLog=S.streakLog.slice(-90)`
- In `renderHabits()` (or on Dawn), render a compact 7-cell grid:
  - One cell per day, height proportional to completion %
  - Green if 100%, amber if ≥50%, ember if <50%, dark if no data
- CSS: `.streak-log-bar{display:flex;gap:2px;align-items:flex-end;height:28px;margin-top:10px}`
- No migration needed — old saves just start empty, the log builds forward

---

## 5. AFT score drop detection
**Value:** If the most recent AFT total is lower than the previous one, the app silently shows the lower score. An honest "score dropped X pts since last test — here's what moved" line on the AFT tab and in Field Notes catches regressions before they become patterns.

**Implementation sketch:**
- In `src/tabs/aft.js`, after the sparkline render:
  - Compare last two AFT entries' totals
  - If latest < previous: show a `<div class="aft-regress">` card:
    - Overall delta: `▼ ${diff} pts from last test (${prev.date})`
    - Per-event breakdown: which events dropped, which held
  - Only show if the drop is ≥5 pts (noise threshold)
- In `src/tabs/today.js` Field Notes: add a note if `S.aft.length>=2 && lastAft.total < S.aft[S.aft.length-2].total - 4`
- No state changes needed — reads existing `S.aft`

---

## 6. Workout weekly volume summary
**Value:** The log shows individual workouts but no weekly load. "4 sessions, 3h 15min this week" answers "am I actually training enough?" in one line. Combined with the PT calendar, this turns the Log tab into a genuine training-load dashboard.

**Implementation sketch:**
- In `src/tabs/log.js` `renderLog()`, compute and render above `lgProgress`:
  ```javascript
  const cutoff=Date.now()-7*864e5;
  const week=(S.workouts||[]).filter(w=>w.ts>=cutoff);
  const totalMin=week.reduce((s,w)=>s+(w.duration||0),0);
  const h=Math.floor(totalMin/60), m=totalMin%60;
  ```
  - Render: `4 sessions · 3h 15min this week`
  - Add PT sessions count too (`S.ptLog.filter(p=>p.ts>=cutoff).length`)
- CSS: a small `week-summary` line, `font-size:12px;color:var(--ink-dim);margin-bottom:10px`
- No state changes needed

---

## 7. Printable daily OPORD (copy-to-clipboard)
**Value:** A cadet sharing this app with their chain of command or battle buddy needs a human-readable summary. A "copy today's brief" button produces a plain-text OPORD-style summary: name, rank, AFT score, today's orders, active quests, commission countdown. No new tech — just `navigator.clipboard.writeText()`.

**Implementation sketch:**
- Add a `📋 Copy daily brief` button to Dawn tab (or Records tab)
- On click, build a plain-text string:
  ```
  DAILY BRIEF — [Name] · [Rank] · [Date]
  AFT: [score] ([passing/below standard])
  Commission: [N] days
  Orders today: [N]/[total] complete
  Active oaths: [count] ([overdue] overdue)
  Branch goal: [branch]
  ```
- `navigator.clipboard.writeText(brief).then(()=>toast('Brief copied'))`
- No state changes, no deps, offline-safe

---

## Implementation order recommendation

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 1 | Quest sort by urgency | Very low | High (safety net) |
| 2 | Habit best streak badge | Very low | Medium (motivation) |
| 3 | AFT score drop detection | Low | High (honest regression catch) |
| 4 | Workout weekly volume | Very low | Medium (load tracking) |
| 5 | Active boss on Dawn | Low | Medium (goal visibility) |
| 6 | Daily completion log | Low-Medium | High (discipline trend) |
| 7 | Printable daily brief | Low | Medium (share/chain of command) |

Start with 1, 2, and 4 together (all trivial), then 3, then 5+6+7 as a batch.
