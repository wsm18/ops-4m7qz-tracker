# Operations — Planned Improvements (v99+)

Eight features to implement next, ranked by cadet impact.

---

## 1. Rune name tooltips on Carved Rings trophies
**Value:** Each trophy chip currently shows the tier label and level in its `title` tooltip, but on mobile you can't hover. Tapping a chip should reveal the full trophy name and the ability description for that level — "Navigator of Land Navigation — Complete a night land-nav course unassisted" — making each ring feel like a real earned title, not just a dot.

**Implementation sketch:**
- Add a `#trophyDetail` div below `#trophyGrid` in `trophies.html`
- In `trophies.js`, make chips `data-skid` / `data-lvl` attributes clickable
- On click: find the skill, get the level's `ability` text, render into `#trophyDetail`:
  ```
  ◆ NAVIGATOR · Land Navigation · L4
  "Complete a night land-nav course unassisted"
  ```
- CSS: `.trophy-detail{background:var(--panel-2);border:1px solid var(--line);border-radius:9px;padding:12px;margin-top:12px;font-size:13px;color:var(--ink-dim)}`
- Dismiss on second tap or on any other tap

---

## 2. Trophy unlock toast on skill level-up
**Value:** When `skReachLevel()` is called and the user hits a new level, show a custom "ring carved" toast instead of the generic "Reached Level N" one — "🏺 QUALIFIED carved — Land Navigation L5." This makes each advancement feel like a tangible trophy drop, not just a number tick.

**Implementation sketch:**
- In `skReachLevel()` in `src/core/skills-core.js`, after the existing `toast()` call:
  ```javascript
  const tierLabel = getTierLabelForLevel ? getTierLabelForLevel(sk, level) : `L${level}`;
  toast(`🏺 <b>${esc(tierLabel)}</b> carved — ${esc(sk.name)} L${level}`);
  ```
- Add a brief CSS animation to the trophy chip for that skill (add/remove a `.just-carved` class)
- `getTierLabelForLevel` is already defined in `trophies.js` — since that runs after skills-core in the build order, use a safe check: `if(typeof getTierLabelForLevel==="function")`

---

## 3. Skill level-history timeline
**Value:** `sk.history` records every level change with a timestamp, but it's never shown. A simple "Progression log" section on each skill card — "L1 → Jun 3 · L2 → Jun 18 · L3 → Jul 5" — transforms the history array into a visible arc of growth that reinforces effort over time.

**Implementation sketch:**
- In `renderSkillsTab()` in `src/tabs/skills.js`, inside the skill card detail section:
  - Filter `sk.history` to promote/reclaim events, show last 8
  - Render a horizontal timeline or list:
    ```javascript
    const hist=(sk.history||[]).filter(h=>h.type==="promote"||h.type==="decay")
      .slice(-8).map(h=>`<span class="sk-hist-item">L${h.level} · ${new Date(h.ts).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span>`).join(' → ');
    ```
- CSS: `.sk-hist-item{font-size:11px;color:var(--ink-faint)}` with `→` separators in `--line` color
- Keep it compact — one line that wraps

---

## 4. Per-event AFT delta badges in result card
**Value:** The result card already shows per-event scores and flags the weakest, but a small ▲/▼ delta next to each score ("72 pts ▲8 from last") requires no tab-switch to see progress per event. The data is already computed in `trend()` inside `showAftResult()` — it just needs to be injected into the event row more visibly.

**Implementation sketch:**
- Already partially done: `trend(e)` returns a colored delta. Move it to be inline with the score, bigger font (13px instead of current 12px inline)
- Add a `.aft-event-delta` class for the delta: `font-size:13px;font-weight:600`
- Show `+0` explicitly as `—` (hold) in a neutral color for all events, not just declining ones — the full picture at a glance
- No state changes needed

---

## 5. Habit streak calendar (monthly view toggle)
**Value:** The 60-day heat map is great for seeing recent streaks, but a monthly grid (rows = weeks, columns = days M–Su, shade by completion) is easier to read and matches how cadets think about their schedule. A toggle between the 60-day strip and the monthly grid makes both available.

**Implementation sketch:**
- Add a `data-hbview="strip|month"` toggle button on each habit card
- Store view preference per habit in a lightweight local map (not in S — just UI state)
- Monthly render function:
  ```javascript
  function habitMonthGrid(h){
    const start = new Date(); start.setDate(1); // first of this month
    // render 5-6 rows × 7 cols grid, Mon-Sun
    // each cell: done (jade), missed (faint ember), future (dark)
  }
  ```
- CSS: `.hb-month-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-top:8px}`
- Each cell 16×16px with day number in tiny text on hover/focus

---

## 6. Personal record history cards for baseline tests
**Value:** `S.baselines` stores monthly max-effort results but there's no "personal records" view analogous to the AFT PR card. "Push-ups PR: 67 reps · Jun 2026" displayed above the baseline form would anchor every training session to your best-ever self, not just last month.

**Implementation sketch:**
- In `renderBaseline()` in `src/tabs/plan.js`:
  - Compute all-time best per test key from `S.baselines`
  - Render a compact PR row above the baseline form (analogous to `aftPrCard()`)
  - Use `miniSparkline()` for each test key trend
- No state changes — reads existing `S.baselines`
- CSS: `.bl-pr-card` mirroring `.aft-pr-card`

---

## 7. Oath (quest) completion time tracking
**Value:** When you complete an oath, the archive records `completedDate` but not how many days it took from when it was created. "Completed in 3 days" on an archive entry shows consistency, and "this oath has been open for 18 days" on an active card adds gentle urgency without a deadline.

**Implementation sketch:**
- At oath creation (`qAdd` in events.js): store `createdDate: new Date().toLocaleDateString()`
- In `renderQuests()`: for active oaths with `createdDate`, show "open ${n} days" tag if >3 days
- In archive render: show `Completed in ${dayDiff(q.createdDate, q.completedDate)} days` if both exist
- Migration: existing oaths without `createdDate` just don't show the badge (safe default)

---

## 8. Dawn tab streak-recovery mode
**Value:** When a streak breaks, the app shows a "💥 Streak broken" warning but nothing actionable. A brief "Recovery mode" message for the first 3 days after a break — "Day 1 of rebuilding. 3 perfect days restores your momentum. Today: all orders." — reframes a miss as a mission, not a failure. Research shows recovery framing reduces quit rates.

**Implementation sketch:**
- Track `S.streakBrokenDate` in DEFAULT: set when `S.streak` drops to 0 after being >0
- In `checkDailyReset()`: when a miss is detected, set `S.streakBrokenDate = today()`; clear it when `S.streak >= 3`
- In `renderToday()`: if `S.streak === 0 && S.streakBrokenDate`:
  - Compute days since break (0-3)
  - Show a compact recovery card: "Day N of rebuilding — ${3-n} more perfect days to restore momentum"
- CSS: `.recovery-card` with `--violet` border, calm not alarming

---

## Implementation order recommendation

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 1 | Trophy unlock toast | Very low | High (feedback loop) |
| 2 | Rune name tooltips | Low | High (mobile discoverability) |
| 3 | Dawn streak-recovery mode | Low | High (retention) |
| 4 | Oath completion timing | Low | Medium (accountability) |
| 5 | Skill level-history timeline | Low | Medium (progression visibility) |
| 6 | AFT delta badges (inline) | Very low | Medium (clarity) |
| 7 | Baseline PR history cards | Low-Med | Medium (tracking) |
| 8 | Habit monthly calendar grid | Med | Medium (readability) |

Start with 1 and 2 (together, trivial), then 3 and 4, then 5-8 as a final batch.
