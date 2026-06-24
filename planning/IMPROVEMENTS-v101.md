# Operations — Planned Improvements (v101+)

Eight features to implement next, ranked by cadet impact.

---

## 1. Fix skill XP grant to write `pathXP.academic` (not dead `S.skills.knowledge`)
**Value:** `skReachLevel()` and `skPass()` in `src/core/skills-core.js` both write to `S.skills.knowledge.xp` — the old, deprecated skill system that was migrated to `S.pathXP` in v91–92. On a fresh install `S.skills` is undefined, so tapping any skill rung throws a silent TypeError and no XP is granted. This is a silent bug that corrupts path progress for new users.

**Implementation sketch:**
- In `skReachLevel()` and `skPass()` in `src/core/skills-core.js`, replace:
  ```javascript
  if(!S.skills.knowledge)S.skills.knowledge={xp:0}; S.skills.knowledge.xp+=15;
  ```
  with:
  ```javascript
  if(!S.pathXP) S.pathXP={}; S.pathXP.academic=(S.pathXP.academic||0)+15;
  ```
- No state migration needed (the old `S.skills` XP was already migrated on load in v92).

---

## 2. Post-log adaptive target feedback toast
**Value:** When a cadet logs a workout and their adaptive rep/weight targets auto-update (via `renderAdaptiveTargets()`), the change is completely silent. The cadet never knows the plan responded to their effort. Closing this loop — "🎯 3 targets updated from your log" — makes the adaptive system feel alive rather than invisible.

**Implementation sketch:**
- In `src/tabs/log.js`, after `save(); render();` in the workout-save handler, call a helper `computeAdaptiveDelta()` that diffs the target set before vs after the save and returns a count of changed targets.
- If count > 0, emit: `toast('🎯 ' + count + ' exercise target' + (count!==1?'s':'') + ' climbed — plan updated')`
- Keep the diff simple: compare `adaptiveTargets(session)` output before and after — the existing `adaptiveTarget()` function in `log.js` already does per-exercise computation.

---

## 3. AFT per-event delta note on Dawn
**Value:** The Dawn Field Notes already shows "Score dropped N pts from last test." But a cadet training for AFT needs to know *which event* dropped — a 5-point total drop from a 10-second slower run is a different training problem than losing 5 HRP reps. One sentence with specific events ("Run +8s vs last test") gives an immediately actionable target.

**Implementation sketch:**
- In `renderToday()` in `src/tabs/today.js`, extend the AFT regression note:
  ```javascript
  if(S.aft.length>=2){
    const prev=S.aft[S.aft.length-2], cur=S.aft[S.aft.length-1];
    const deltas=[
      {k:"dl",name:"DL",delta:(cur.scores.dl||0)-(prev.scores.dl||0)},
      {k:"hrp",name:"HRP",delta:(cur.scores.hrp||0)-(prev.scores.hrp||0)},
      {k:"sdc",name:"SDC",delta:(cur.scores.sdc||0)-(prev.scores.sdc||0)},
      {k:"plank",name:"Plank",delta:(cur.scores.plank||0)-(prev.scores.plank||0)},
      {k:"run",name:"Run",delta:(cur.scores.run||0)-(prev.scores.run||0)},
    ].filter(d=>d.delta<0).map(d=>`${d.name} ${d.delta}`).join(" · ");
    if(deltas) notes.push(`<div class="fn-row"><span class="fn-dot">📉</span><span>Last AFT: ${deltas}</span><button class="td-go-sm" data-gototab="aft">→</button></div>`);
  }
  ```
- Replace the existing regression note (which only fires on total drop >4) with this per-event version that fires when any event score fell.

---

## 4. Quest snooze fatigue counter
**Value:** Oaths can be snoozed indefinitely (+3 days, infinitely repeatable). A cadet can quietly stack 6 months of deferred oaths with no friction — which is the opposite of honest accountability. Tracking snooze count and showing a visual warning after 2 postponements keeps the mechanic honest.

**Implementation sketch:**
- In the snooze handler in `src/core/events.js`, increment `q.snoozeCount = (q.snoozeCount||0)+1` before saving.
- In `renderQuests()` in `src/core/state.js`, add badge when `q.snoozeCount>=2`:
  ```javascript
  const snoozeWarn=q.snoozeCount>=2?`<span class="quest-snooze-warn">postponed ${q.snoozeCount}×</span>`:'';
  ```
- No migration needed — missing `snoozeCount` defaults to 0.
- CSS: `.quest-snooze-warn{font-size:10px;color:var(--ember);margin-left:4px;font-style:italic}`

---

## 5. Habit 7-day consistency summary
**Value:** With 6–10 habits, the Orders tab becomes a long scroll of individual heat maps. A cadet can't quickly tell which habit is failing them this week without scanning every card. A one-line summary at the top — "7-day: 71% · 🔥 Sleep, Study at risk" — gives the critical info in under a second.

**Implementation sketch:**
- In `renderHabits()` in `src/tabs/dailies.js`, compute a 7-day summary before rendering cards:
  ```javascript
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return localYMD(d);});
  const weekPcts=S.habits.map(h=>{
    const done=last7.filter(d=>(h.history||[]).includes(d)).length;
    return {name:h.name, pct:Math.round(done/7*100)};
  });
  const avg=weekPcts.length?Math.round(weekPcts.reduce((s,h)=>s+h.pct,0)/weekPcts.length):0;
  const atRisk=weekPcts.filter(h=>h.pct<57).map(h=>h.name); // <4/7 days
  ```
- Render a compact banner above `wrap.innerHTML`:
  `<div class="hb-week-summary">7-day: <b>${avg}%</b>${atRisk.length?' · ⚠️ '+atRisk.slice(0,2).map(esc).join(', ')+' lagging':' · on pace'}</div>`
- CSS: `.hb-week-summary{font-size:12px;color:var(--ink-dim);padding:6px 0 10px;border-bottom:1px solid var(--line);margin-bottom:8px}`

---

## 6. Commissioning "past date" memento card
**Value:** The commissioning countdown bar gracefully handles the future case. When the date passes, it shows "today is the day. You made it." — but then goes permanently silent. The cadet who commissioned 3 months ago sees nothing. A small memento card showing commissioned service time honors the milestone without cluttering the dashboard.

**Implementation sketch:**
- In `renderToday()` in `src/tabs/today.js`, in the commissioning block, extend the `daysLeft<=0` branch:
  ```javascript
  } else if(daysLeft<=0){
    const daysSince=Math.abs(daysLeft);
    commissionHtml=`<div class="commission-bar radiant">⭐ Commissioned ${cd} · ${daysSince} day${daysSince!==1?'s':''} of commissioned service. Well done, ${firstName}.</div>`;
  }
  ```
- No state changes needed — `cd` is already the date string, `daysLeft` is already computed.

---

## 7. Weight mirror sync-recency indicator
**Value:** The Weight tab mirror integration shows the imported ledger data but no timestamp. A cadet can miss that the mirror is 3 weeks stale. One line showing "Last synced: X days ago · N entries" makes sync freshness obvious without adding complexity.

**Implementation sketch:**
- In `renderWeight()` in `src/tabs/awards.js` (or wherever the weight mirror renders), add below the jar visualization:
  ```javascript
  if(S.lastMirrorUpdate){
    const d=Math.round((Date.now()-new Date(S.lastMirrorUpdate))/864e5);
    const n=(S.weight.promises||[]).length;
    mirrorFooter=`<div class="weight-sync-footer">Last synced ${d===0?"today":d+" day"+(d!==1?"s":"")+" ago"} · ${n} entr${n!==1?"ies":"y"}</div>`;
  }
  ```
- CSS: `.weight-sync-footer{font-size:11px;color:var(--ink-faint);text-align:center;padding-top:6px}`

---

## 8. Tree leaf tap → skill card navigation
**Value:** The Yggdrasil tree shows leaf tooltips on hover (`<title>` text) but has no tap action on mobile — tapping a leaf does nothing. A cadet who sees a dim leaf (fading skill) on the tree has no way to jump to that skill's card without manually finding it in the list. Wiring up tap-to-navigate would make the tree genuinely interactive and close the tree↔list loop.

**Implementation sketch:**
- In `renderSkillTree()` in `src/core/tree.js`, replace the static `<title>` tooltip approach with a `data-skid` attribute on each leaf `<circle>`:
  ```javascript
  leaves.push(`<circle cx="..." cy="..." ... data-skid="${esc(node.id)}"><title>...</title></circle>`);
  ```
- In the gesture handler `_treeWireGestures()`, add a click/tap handler on the SVG:
  ```javascript
  svg.addEventListener("click", e=>{
    const skId=e.target.dataset.skid; if(!skId) return;
    const nb=document.querySelector('#sideNav button[data-tab="skills"]'); if(nb) nb.click();
    setTimeout(()=>{ const el=document.getElementById(`skcat-${S.lifeSkills.find(s=>s.id===skId)?.cat}`); if(el)el.scrollIntoView({behavior:"smooth",block:"start"}); },100);
  });
  ```
- No state changes needed. This gives the tree action on both mobile and desktop.

---

## 9. Skill card Yggdrasil theming
**Value:** Every skill card is a plain white/dark panel with a neutral border — nothing connects it visually to the Norse-world-tree theme that defines the rest of the app. The tree already uses `skLeafColor()` to code health (gold/amber/blood/grey) and every skill belongs to a named Path with its own world. Surfacing both on the card — a left-border accent in the leaf's health color, a subtle path-world label using the path's icon, and a thin level-fill bar that mirrors the tree's visual language — makes the list view feel like a part of the same living tree rather than a generic task manager.

**Implementation sketch:**
- In `renderSkillCard()` in `src/tabs/skills.js`, compute:
  ```javascript
  const leafCol = skLeafColor(sk);          // already returns --gold / --ember / --blood / --ink-faint
  const pathIcon = SK_PATH_ICON[sk.cat] || '🌿';  // from src/core/tree.js export
  const eff = skEffectiveLevel(sk);
  const maxLv = (sk.ladder||[]).length || 1;
  const fillPct = Math.round((eff / maxLv) * 100);
  ```
- Replace the generic `.sk-card` open tag with:
  ```javascript
  `<div class="sk-card ${isSub?'sk-sub':''}" style="border-left:3px solid var(${leafCol});--sk-fill:${fillPct}%">`
  ```
- Add a world-path label line below the skill name:
  ```javascript
  `<div class="sk-card-world">${pathIcon} ${esc(sk.cat||'')}</div>`
  ```
- Add a thin level-progress fill bar at the bottom of each card (reuses the tree's color logic):
  ```javascript
  `<div class="sk-level-bar"><div class="sk-level-fill" style="width:var(--sk-fill);background:var(${leafCol})"></div></div>`
  ```
- CSS additions in `src/styles/main.css`:
  ```css
  .sk-card{border-left:3px solid var(--line)}  /* default; overridden inline */
  .sk-card-world{font-size:10px;color:var(--ink-faint);letter-spacing:.04em;margin-top:1px}
  .sk-level-bar{height:3px;background:var(--line);border-radius:2px;margin-top:10px}
  .sk-level-fill{height:3px;border-radius:2px;transition:width .3s}
  ```
- No state changes, no new dependencies — purely presentational, all data already computed.

---

## 10. Yggdrasil theme consistency sweep
**Value:** The app has a clear visual and narrative identity — dark military palette, Norse world-tree, oaths/orders/rings — but the UI still uses mismatched generic language in several places. "Quests" appears in tab labels and button text where the codebase calls them "oaths." "Habits"/"dailies" shows in headings where the voice should say "orders." CSS class names like `.quest-snooze-warn`, `.streak-log-bar`, `.hb-month-grid` have no connection to the world-tree theme. Skill cards are styled like plain panels with no left-border health color or path-world label. Doing this as one sweep rather than piecemeal keeps the voice coherent and avoids a half-themed app.

**Implementation sketch — four areas:**

**1. Vocabulary: user-visible text**
- Global pass over `src/tabs/` and `src/core/state.js`:
  - "Quest"/"quest" → "Oath"/"oath" in all rendered strings, nav labels, toast messages, and tab headers (not in JS variable names or `S.quests` data key — that stays for migration safety)
  - "Habits"/"Dailies" → "Orders" in rendered headings and button labels (not `S.habits` data key)
  - "Snooze" → "Postpone" in the quest-snooze button label and its toast message
  - "Daily brief" → "Field brief" in the OPORD copy button label
  - "Recovery mode" → "Forge-back" in the streak-recovery card copy

**2. Skill cards — Yggdrasil theming** *(from item 9)*
- Left-border color from `skLeafColor(sk)`: gold (healthy), ember (fading), blood (decayed), ink-faint (unproven)
- World-path label line under skill name: `${SK_PATH_ICON[sk.cat]} ${sk.cat}`
- Level progress bar at card bottom: thin fill using same leaf color
- CSS: `.sk-card{border-left:3px solid var(--line)}` overridden inline per card

**3. CSS class names — themed naming**
- `.quest-snooze-warn` → `.oath-postpone-warn`
- `.streak-log-bar` → `.discipline-log-bar` with explicit cell colors: 100% `--jade`, ≥50% `--gold`, >0% `--ember`, no-data `--line`
- `.recovery-card` → `.forge-recovery-card` with `--violet` left border
- `.hb-week-summary` → `.orders-week-summary`
- `.hb-best` PR star: color it `--gold` when current streak equals best
- New `.sk-forge-step` / `.sk-forge-decay` classes for skill history timeline (decay entries in `--ember` instead of faint)

**4. Color semantics — consistent signal meaning**
- `--blood` (#9c4a34): urgency/danger — overdue oaths, HP critical, boss bar low
- `--ember` (#c8772e): caution/warning — fading skills, at-risk orders, snooze fatigue
- `--jade` (#6f9e54): success/on-pace — completed orders, 100% discipline days, healthy streaks
- `--gold` (#b8a06a): achievement/peak — personal records, at-ceiling skill levels, Dawn greeting
- `--violet` (#7c93a8): calm resolve — forge-recovery card, info states with no urgency
- Audit any hardcoded hex colors in `src/styles/main.css` that duplicate these and replace with variables

**Implementation order within this sweep:**
1. Vocabulary pass (search-replace in rendered strings — no logic change, lowest risk)
2. Skill card theming (skills.js + main.css only)
3. CSS class renames (main.css + the JS that emits those class names — must be atomic)
4. Color semantics audit (main.css cleanup)

---

## Implementation order recommendation

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 1 | Fix skill XP → pathXP.academic (bug) | Very low | Critical (silent crash) |
| 2 | Post-log adaptive target toast | Low | High (closes training loop) |
| 3 | AFT per-event delta on Dawn | Low | High (daily actionable) |
| 4 | Quest snooze fatigue counter | Very low | Medium (accountability) |
| 5 | Habit 7-day consistency summary | Low | Medium (quick-scan) |
| 6 | Commissioning memento card | Very low | Medium (symbolic) |
| 7 | Weight mirror sync-recency | Very low | Low-Medium (quality of life) |
| 8 | Tree leaf tap → skill card | Medium | Medium (power-user UX) |
| 9 | Skill card Yggdrasil theming | Low | Medium (coherence/immersion) |
| 10 | Yggdrasil theme consistency sweep | Medium | High (whole-app coherence) |

Start with 1–3 (all low or very-low effort), then 4–7 as a batch, then 8–10 (visual/theme work — do 9 and 10 together since they overlap on skill cards and CSS).
