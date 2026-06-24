# Operations — Planned Improvements (v96+)

Six features to implement next, ranked by cadet impact.

---

## 1. Upcoming AFT test-date + per-event improvement math
**Value:** Turns the AFT tab from a history log into an active prep tool.

Set a next-test date in Profile (or a dedicated AFT tab field `aftTestDate`). The AFT tab then shows a countdown bar plus per-event math:

> "56 days to test — you need +18 pts on the 2-mile run and +12 pts on the deadlift to hit 300."

**Implementation sketch:**
- Add `aftTestDate: null` to `DEFAULT` in `src/core/constants.js`
- Add a date input in `src/tabs/aft.html` (top of the form)
- Wire save in `src/tabs/aft.js`
- In `renderAft()`, if `S.aftTestDate` and last AFT exist:
  - Compute days to test
  - Compute gap per event to reach `minTotal` (300 or 350 depending on standard)
  - Render a compact card above the history: `aftPrepCard()`
- No new deps, pure arithmetic from existing `S.aft` data

---

## 2. All-time personal records board on AFT tab
**Value:** Motivation + ceiling visibility. Right now AFT shows history rows but no "this is your best ever" summary.

**Implementation sketch:**
- In `renderAft()`, iterate `S.aft` to compute per-event all-time best:
  - `dl`: max `a.scores.dl`
  - `hrp`: max `a.scores.hrp`
  - `sdc`: min non-null `a.raw.sdc` (lower is better for time)
  - `plank`: max non-null `a.raw.plank`
  - `run`: min non-null `a.raw.run` (lower is better)
  - `total`: max `a.total` with date
- Render a `<div class="aft-pr-card">` above the history list showing each PR with the date it was set
- If current entry matches the PR, show a ⭐ badge

---

## 3. Session log note field
**Value:** A 120-char free-text note when logging a workout. Compounds into useful insight over months. Small now, valuable later.

**Implementation sketch:**
- In `src/tabs/log.html`, add `<textarea id="lgNote" placeholder="Optional note (conditions, felt strong, modified…)" rows="2" maxlength="120"></textarea>` above the Save button
- In `src/tabs/log.js`, when saving a workout entry, include `note: document.getElementById("lgNote").value.trim() || null`
- When rendering the log history, show the note as a small dimmed line below each entry if present
- No schema migration needed — note field on existing entries will just be `undefined`/`null`, render defensively

---

## 4. Quest / oath due dates
**Value:** Oaths with deadlines — APFT, LDAC application, course registration, commissioning requirements. Overdue oaths surface in `getWarriorsFocus()`.

**Implementation sketch:**
- Add `due: ""` to the quest add form in `src/tabs/quests.html` (a `<input type="date" id="qDue">`)
- In `events.js` `qAdd` handler: `due: document.getElementById("qDue").value || null`
- In `src/tabs/quests.js` `renderQuests()`: if `q.due && new Date(q.due) < new Date()`, add class `overdue` and amber badge "OVERDUE"
- In `src/tabs/today.js` `getWarriorsFocus()`: check for overdue quests first (before the training check), return `{icon:"⚠️", action: q.name, sub:"Overdue — was due "+q.due, ...}`
- CSS: `.quest-card.overdue { border-left-color: var(--ember); }`

---

## 5. PWA install prompt on Dawn (first visit, mobile only)
**Value:** Many cadets you share this with won't know they can install it. One-time nudge closes that gap.

**Implementation sketch:**
- In `src/core/constants.js` DEFAULT: add `installPromptDismissed: false`
- In `src/tabs/today.js` or `src/core/init.js`: check `!window.matchMedia("(display-mode:standalone)").matches && !S.installPromptDismissed`
- Render a dismissible card on Dawn: "📲 Add to Home Screen — tap your browser's share icon and choose 'Add to Home Screen' to install this as an app."
- A dismiss button sets `S.installPromptDismissed = true; save();`
- Also listen for `beforeinstallprompt` event; if captured, offer a one-tap "Install" button instead of the manual instructions

---

## 6. Push notifications for streak protection
**Value:** Extends the evening streak-alert from visual-only to actually reaching you when the device is locked.

**Implementation sketch:**
- In `src/core/init.js` or `src/core/events.js`, after the app loads:
  - If `Notification.permission === "default"` and `S.streak > 0`, show a toast with an "Enable alerts →" button that calls `Notification.requestPermission()`
  - Once granted, schedule a check at 19:00 local time using `setTimeout` (compute ms until 7pm today; if past 7pm, skip to tomorrow)
  - The scheduled check: if `S.streak > 0 && (S.dailies||[]).some(d=>!d.done)`, fire `new Notification("🔥 Streak at risk", {body: "You have orders left before midnight."})`
- Store `S.notifEnabled: false` in DEFAULT; toggle true when permission granted
- Handle the case where the app is closed (service worker `sync` or just accept the limitation — the prompt alone adds value)

---

## Implementation order recommendation

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 1 | AFT test date + improvement math | Medium | Very high |
| 2 | Personal records board | Low | High |
| 3 | Session log note field | Low | Medium (grows over time) |
| 4 | Quest due dates | Low-Medium | High |
| 5 | PWA install prompt | Low | High (for sharing) |
| 6 | Push notifications | Medium | Medium |

Start with 2, 3, and 5 together (all low effort) as a quick batch, then tackle 1 and 4 as a pair since they both touch the quest/AFT flow.
