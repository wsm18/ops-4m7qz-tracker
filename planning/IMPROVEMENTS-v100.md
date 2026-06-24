# Operations — Planned Improvements (v100+)

Eight features to implement next, ranked by cadet impact.

---

## 1. Path XP progress bar on Dawn tab
**Value:** The Dawn tab already shows sessions, orders, boss, discipline, and recovery cards — but the cadet has no fast read on where their Paths stand without switching to the Garden. A compact row of 5–6 path pips (width proportional to XP to next level) gives a daily check-in on where growth is concentrated and what's been neglected, without leaving the dashboard.

**Implementation sketch:**
- In `renderToday()` in `src/tabs/today.js`, add a `pathPipsHtml()` helper
- For each path in `SK_CAT_ORDER`, compute the current level from `S.pathXP[cat]` using `pathLevel()` (or equivalent from `garden.js`) and the XP fraction to next level
- Render a compact grid of mini bars: path icon + fill bar — 2 rows × 5 cols, ordered by XP descending
- Only show paths where `S.pathXP[cat] > 0` (don't clutter for new users)
- CSS: `.path-pips-row` with small pill bars, 36px wide each; show level number in tiny text above bar

---

## 2. Quest "snooze" (push due date by 3 days)
**Value:** Oaths without due dates never create urgency; oaths with dates get abandoned when life intervenes. A simple snooze button on each active quest — "Push 3 days" — keeps them alive and visible without the guilt of leaving them overdue. It also creates honest `createdDate` vs actual-completion data over time.

**Implementation sketch:**
- Add a `<button class="q-snooze" data-qsnooze="${q.id}">+3d</button>` to each quest card in `renderQuests()`
- Handler in `events.js`: find quest, if `q.due` exists add 3 days (or set `today + 3` if no due); save; render; toast "Oath postponed to ${newDue}"
- Only show the snooze button if the quest has a `due` date (or is overdue)
- No state changes needed beyond updating `q.due`

---

## 3. Weekly training summary card on Dawn
**Value:** `weekTrainingStats()` already computes sessions done vs scheduled this week. Surfacing it directly on Dawn — "Week: 3 of 5 sessions done ▓▓▓░░" — closes the feedback loop between effort and the plan without requiring a tab switch. Currently only shown inside the session detail card; a standalone card makes it a first-class check-in.

**Implementation sketch:**
- In `renderToday()`, call `weekTrainingStats()` and `todaysPlan()` if sessions exist
- Render a compact `<div class="dawn-week-card">Week: ${ws.done}/${ws.sched} · ${bar}</div>` only when `ws.sched > 0`
- Reuse the progress-bar fill pattern already in `.dawn-hpfill`
- Show which sessions are logged: `s1 ✓ · s2 ✓ · s3 ░ · s4 ░ · s5 ░`
- Keep it to 2 lines max so it doesn't dominate the dashboard

---

## 4. Skill decay countdown ring on the Tree
**Value:** The Yggdrasil tree shows leaf color for level health but gives no visual urgency for skills about to fade. Adding a thin arc around each leaf node, colored amber→red as the fade timer runs down, makes tending the tree feel like actual maintenance — you can see which branches need attention at a glance.

**Implementation sketch:**
- In `src/core/tree.js`, inside the leaf SVG rendering loop, compute `skDaysLeft(sk)` and `sk.fadeDays`
- If `daysLeft < fadeDays * 0.5`, render an SVG arc overlay on the leaf: `<circle class="fade-ring" .../>` with `stroke-dasharray` proportional to fraction remaining
- Color: >34%: `--gold`; <=34%: `--ember`; decayed: `--blood`
- Only render if `sk.currentLevel > 0` (don't show on unproven skills)
- CSS: `.fade-ring{fill:none;stroke-width:2.5;opacity:.75;pointer-events:none}`

---

## 5. Overdue oath count badge on nav button
**Value:** The Quests tab nav button shows no count. When oaths go overdue they're silent unless the cadet happens to open the tab. A small red badge on the nav button — `⚔️ (2)` — surfaces urgency without requiring a visit. Works the same way the browser tab title trick (document.title) does on web apps.

**Implementation sketch:**
- In `renderQuests()` (or `render()` in `state.js`), after computing overdue count, update the nav button:
  ```javascript
  const qdot=document.querySelector('#sideNav button[data-tab="quests"] .nav-badge');
  if(qdot) qdot.textContent=overdueCount>0?overdueCount:'';
  ```
- Add a `<span class="nav-badge"></span>` inside the quests nav button in `_shell.html`
- CSS: `.nav-badge{background:var(--blood);color:#fff;border-radius:99px;font-size:9px;font-weight:700;padding:1px 4px;margin-left:3px;vertical-align:middle;display:inline-block;min-width:14px;text-align:center}`
- Show nothing (empty span) when count is 0

---

## 6. AFT test countdown on the Dawn tab
**Value:** `S.aftTestDate` exists and `aftPrepCard()` renders a countdown in the AFT tab, but it's invisible from Dawn. A one-liner in Field Notes — "⏳ 23 days to AFT" — keeps the upcoming test in peripheral vision daily. Very small change, high daily-driver value.

**Implementation sketch:**
- In `renderToday()` in `today.js`, in the notes array block:
  ```javascript
  if(S.aftTestDate){ const d=Math.ceil((new Date(S.aftTestDate+"T12:00:00")-Date.now())/864e5); if(d>=0&&d<=60) notes.push(`<div class="fn-row"><span class="fn-dot">⏳</span><span>AFT in ${d===0?"today":d+" day"+(d!==1?"s":"")} · <span style="color:${d<=14?"var(--ember)":"var(--ink-dim)"}">stay on plan</span></span><button class="td-go-sm" data-gototab="aft">→</button></div>`); }
  ```
- No state changes, no new files

---

## 7. Habit "grace day" visual indicator
**Value:** The grace-day mechanic (miss one day, streak survives if you complete the next) is explained in a note but the note is easy to dismiss. A small clock icon or "⏰ 1 grace left" badge on the streak counter when grace is still available gives a persistent visual cue about streak fragility — so cadets know there's still a save available today.

**Implementation sketch:**
- In `renderHabits()` in `dailies.js`, update the streak badge:
  ```javascript
  const graceIcon = st.state==="grace" && !h.graceUsed ? ' ⏰' : (h.graceUsed ? ' ⚠️' : '');
  const streakBadge = st.streak>0 ? `<span class="hb-streak ${st.state}">🔥 ${st.streak}${graceIcon}</span>` : "";
  ```
- When `st.state==="grace"` and grace hasn't been used, show ⏰ as a visual save indicator
- When grace IS used and streak is at risk, show ⚠️ (no safety net)
- No state changes

---

## 8. Export/share a single skill card
**Value:** Cadets share this app with their unit. A single "Copy card" button on each skill card lets them paste a formatted text version of their skill status ("Land Navigation · L4 Navigator · fades in 18 days") into a Signal message or counseling form. No network required — plain clipboard text.

**Implementation sketch:**
- Add a small `<button class="sk-copy-btn" data-skcopy="${sk.id}">⧉</button>` in the skill card header (next to edit/delete)
- Handler in `app-setup.js` or `events.js`:
  ```javascript
  const sk=S.lifeSkills.find(x=>x.id===skId);
  const eff=skEffectiveLevel(sk), tier=getTierLabelForLevel(sk,eff);
  const days=skDaysLeft(sk);
  const txt=`${sk.name} · L${eff} ${tier} · peak L${sk.peakLevel||0}${days!==null?" · fades in "+days+"d":""}`;
  navigator.clipboard.writeText(txt);
  ```
- Reuse the clipboard pattern from `copyDailyBrief()`
- CSS: `.sk-copy-btn{background:none;border:none;color:var(--ink-faint);cursor:pointer;font-size:12px;padding:2px 4px}`

---

## Implementation order recommendation

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 1 | AFT test countdown on Dawn | Very low | High (daily reminder) |
| 2 | Overdue oath nav badge | Low | High (passive urgency) |
| 3 | Weekly training summary card | Low | High (habit loop) |
| 4 | Quest snooze button | Low | Medium (friction reducer) |
| 5 | Habit grace-day indicator | Very low | Medium (mechanic clarity) |
| 6 | Path XP pips on Dawn | Low-Med | Medium (progress visibility) |
| 7 | Export single skill card | Low | Medium (sharing) |
| 8 | Tree fade countdown ring | Med | Medium (visual urgency) |

Start with 1–3 (all trivial), then 4–7 as a batch, then 8 (tree surgery).
