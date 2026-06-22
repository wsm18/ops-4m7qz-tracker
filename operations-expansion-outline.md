# Operations — Expansion Outline
### Health data, full measurable-skill system, habits, in-app testing, study & practice plans

This is the working spec for the next phase of the **Operations** app. It captures everything discussed so we can build it across multiple sessions without re-deciding anything. Current app is at **v27** (13 tabs, official AFT tables, hierarchical skills, Profile/blood/emergency, FM balance advisory).

---

## Guiding principles (decided)

- **Honesty over hype.** Every feature uses real, evidence-based methods. No invented correlations (blood-type fitness, etc.). Where the science is limited, the app says so.
- **Manual now, designed for Apple Health import later.** A static PWA cannot read the Apple Watch directly (no HealthKit/Bluetooth from a web app). So: clean manual-entry now, with the data model and an importer stub shaped so a future Apple Health export file (XML/CSV) can be dropped in.
- **Everything measurable becomes a skill** with levels, decay, quests, and a "work on it" path — consistent with the existing hierarchical skill engine.
- **One honest caveat on memory/cognition:** deliberate memory *technique* training is genuinely powerful (people memorize decks of cards, long digit strings, whole speeches). General "brain training" largely improves *the trained task*, not a universal super-memory. The app will make you formidable at deliberate memorization and frame it accurately — no magic-pill promises.
- **A skill is never fully lost.** Once a skill has been started, it can decay over time but **floors at level 1** — it never drops to 0 or disappears. Every skill you've ever begun stays in the tree, permanently trackable.
- **Every skill remembers its all-time peak.** The app stores the highest level a skill has ever reached. The card shows current level *and* peak (e.g. "Lv 2 · peak Lv 5"), so you can see what you've lost and know that reclaiming it should be faster than learning it cold.

---

## Part 1 — Health & Vitals (expanded)

New data the user can log (Apple Watch + blood-donation readings):

| Metric | Source | Notes |
|---|---|---|
| Resting / active pulse | Apple Watch | manual entry, trend chart |
| Blood pressure (sys/dia) | taken at donation / cuff | manual, flag normal/elevated ranges (informational only) |
| Hemoglobin | taken at donation | manual; tie to donation eligibility |
| HRV, VO2 max, sleep (future) | Apple Watch | fields reserved for Health import |
| Body weight | already in Profile | already trend-tracked |

**Build notes**
- New `S.vitals = []` log: `{date, pulse, bpSys, bpDia, hemoglobin, note}`.
- Vitals section on the **Profile tab** (or a small **Health** sub-area) with a trend sparkline per metric.
- BP ranges shown as plain reference bands (normal / elevated / high) — clearly labeled informational, "not medical advice, see a clinician."
- Hemoglobin links to the existing **Blood Donation** feature (low reading = note that donation may be deferred).
- **Apple Health import stub:** a "Import from Apple Health export" button that parses an `export.xml`/CSV later. Build the parser interface now, wire the actual mapping in a later session.

---

## Part 2 — Measurable-function skills (the big one)

Every measurable body/mind function becomes a skill in the existing tree, with levels, decay, quests, and a practice path. Proposed new categories & skills:

### New category: **Cognitive**
- **Reaction speed** — testable in-app (see Part 4)
- **Cognitive / processing speed** — testable
- **Working memory (n-back)** — testable & trainable
- **Memory span** (digit span, word span) — testable
- **Attention / sustained focus** — testable
- **Memory technique** (memory palace / mnemonics) — trainable, the "memorize anything" track
- **Mental math** — testable
- **Pattern recognition** — testable

### New category: **Physiological** (measured, not trained directly)
- **Reflexes** (e.g., knee-jerk — manual log, or simple in-app proxy)
- **Resting heart rate** (lower = fitter, from vitals)
- **Recovery / HRV** (future, from Health import)
- **Flexibility** (already exists under Physical — cross-link)
- **Grip strength** (manual, if user has a dynamometer)

### Existing categories keep growing
- Physical (already has Strength/Endurance/Core sub-skills + Swimming/Flexibility)
- Tactical, Technical, Leadership, Academic, Personal (unchanged, extend as desired)

**Each skill needs (consistent with current engine):**
- Level ladder (concrete, testable abilities per level)
- Fade interval (decay)
- Auto-level hook where a real measurement exists (`auto:"test:reaction"`, `auto:"vital:rhr"`, etc.)
- A **"Work on this"** action (links to a trainer, a study plan, or a practice protocol)

---

## Part 3 — Habits system (daily quests + streaks + skill feed)

- New `S.habits = []`: `{id, name, schedule, streak, bestStreak, lastDone, linkedSkill, history}`.
- **Daily habit quests** appear in a Daily Orders–style list each day.
- **Each habit has its own streak** (independent of the global day-streak).
- Completing a habit **feeds its linked skill** (refreshes fade timer / contributes XP), e.g. "Daily reading" → Study & retention; "Cold approach / brief someone" → Public speaking.
- **Good-habit starter library** (suggested, editable): sleep schedule, hydration, daily mobility, reading, spaced-repetition review, journaling, meditation/box-breathing, no-phone-first-hour, daily skill practice, etc.
- Habit completion history → small calendar/heatmap.

**Honest note:** habit streaks are motivating but shouldn't become a stick. Build a "grace day" / streak-freeze option so one miss doesn't nuke months of progress (prevents the all-or-nothing trap).

---

## Part 4 — New **Test** tab (in-app measurement + suggestions)

A dedicated tab where anything testable from the computer can be measured; each test writes a result, updates the linked skill, and gives improvement suggestions.

**Tests to build (all real, all browser-feasible):**
1. **Reaction time** — tap when the screen changes; average over N trials. (ms → level)
2. **Choice reaction** — react to the correct stimulus only (adds decision speed).
3. **Digit span** — forward & backward; longest correct sequence.
4. **N-back (1/2/3-back)** — working-memory trainer + score.
5. **Go/No-Go** — sustained attention & inhibition.
6. **Processing speed** — symbol/number matching against the clock.
7. **Typing speed & accuracy** — WPM (cognitive + motor output).
8. **Mental math sprint** — problems solved per minute.
9. **Memory palace trainer** — guided encode/recall of a list using loci.
10. **Spaced-repetition decks (SRS)** — Leitner/SM-2-style; the engine behind memorization.
11. **Knowledge quizzes** — the existing 16 ROTC quiz banks, now tied to Academic skills.

**Each test produces:** a score, a trend, an updated skill level, and **specific improvement suggestions** ("your backward span lags forward — practice chunking," "reaction floor ~250ms is normal; train with choice-reaction for decision speed," etc.).

**Important caveats baked into the UI:**
- In-app tests are affected by device, browser, and input lag — treat as *relative* progress trackers, not clinical measurements.
- N-back/processing-speed gains tend to be task-specific; framed as honest training, not IQ-boosting.

---

## Part 5 — Study plans (for knowledge tests)

- For any Academic/knowledge skill or upcoming graded test, generate a **study plan**: target date, topics, spaced-repetition schedule, daily review load, and checkpoints.
- Pulls from the existing quiz banks + any SRS decks the user builds.
- Outputs daily study quests (which flow into the habit/quest system).
- "Cram vs. spaced" honesty: the plan defaults to spaced repetition because it works better than cramming, and says why.

---

## Part 6 — "Work on this" practice hub (every skill)

- Every skill card gets a **Work on this** button.
- It routes to the right place:
  - Cognitive skill → its trainer in the Test tab
  - Academic skill → study plan + quiz bank + SRS deck
  - Physical skill → the FM session that targets it
  - Memory technique → the memory-palace trainer
- For skills with no in-app trainer (e.g., land nav), it shows a **practice protocol** (what to do, how to self-verify, how to log it).

---

## Part 7 — The Memory track (special focus)

Goal: become able to deliberately memorize whatever you choose. Real method stack:
1. **Memory palace (method of loci)** trainer — build palaces, place items, practice recall.
2. **Major system / PAO** for numbers — convert digits to images.
3. **Spaced repetition** — retention over time (the real "never forget" engine).
4. **Digit/word span tests** — measure raw working-memory progress.
5. **Progressive challenges** — memorize a shuffled deck, a 50-digit string, a speech, etc., with levels.

**Honest framing in-app:** "This trains *deliberate* memorization to a very high level. It won't make unrelated remembering effortless, but with these techniques you can reliably memorize anything you put through the system."

---

## Part 8 — Skill permanence & peak tracking

Applies to **every** skill in the tree (existing and new).

**Never fully lost — floors at level 1.**
- Current decay logic can drop a skill toward 0. New rule: once a skill's `currentLevel` has ever been ≥ 1, decay can reduce its *effective* level but never below **1**, and the skill is never removed.
- This guarantees a permanent record of everything you've ever started or done. The Skills tab always shows the full history of your development.

**Peak tracking.**
- Add `peakLevel` to each skill (and update it whenever `currentLevel` rises above the stored peak — including from auto-leveling like AFT/lift ratios).
- Skill card shows **current + peak**: e.g. `Lv 2 · peak Lv 5`.
- When current < peak, surface a gentle prompt: "You've held Level 5 before — reclaiming it should come faster."
- Rolled-up group/category levels can optionally show a peak too (peak of the rollup over time), decided at build time.

**Open build-time choice (note, don't block):**
- *Easier reclaim?* When climbing back toward a previously-held level, should the promotion quest be genuinely lighter (you've proven it before), or just *labeled* "previously reached" with normal difficulty? Recommendation: label it as "re-prove" (lighter framing, maybe a shorter fade reset) so it's encouraging without pretending the ability is automatic.

**Data-model impact:** every skill gains `peakLevel` (defaults to its current/seed level). Decay/effective-level function clamps to a floor of 1 for any started skill. Migration: on load, backfill `peakLevel = max(currentLevel, existing peak)` for all existing skills.

---

## Part 9 — Additional features (suggested)

Grouped by recommendation strength. The first group fills real gaps in what's already built; the ROTC group is high-utility for a cadet; the last group is deliberately flagged as *probably skip*.

### 9A — Fills real gaps (high value)

**Dashboard / "Today" landing view** *(highest-value remaining item)*
- A single landing tab that aggregates everything actionable today: today's habit quests, skill quests due, the FM training advisory ("train X, ease off Y"), vitals/donation reminders, and AFT pass status at a glance.
- Goal: open the app → immediately know what to *do*, without touring 13+ tabs.
- Build note: mostly a read-only aggregator of existing render functions; low risk, high daily payoff. Strong candidate to build first in the next phase.

**History / trends view**
- A timeline/charts view turning the accumulating logs into visible progress: AFT total over time, individual skill levels climbing, weight & vitals trends, donation count, habit heatmap.
- Pulls from data already being logged (`S.aft`, `S.weightLog`, `S.vitals`, skill history, `S.donations`).
- Honest note: keep charts simple/legible; this is about seeing the long arc, not dense analytics.

**Data export (CSV / printable)**
- Export AFT history, awards, memberships, volunteer hours, etc. to CSV or a printable sheet (beyond the existing JSON backup).
- Practical for handing records to cadre or dropping into an official file.

### 9B — ROTC-specific (high utility)

**Counseling / event log (DA Form 4856-style)**
- Private running record of leadership events — counselings received and given, key dates, outcomes.
- Real fuel for OML / branch boards and self-reflection. Fields: date, type (event/monthly/developmental), people involved, summary, plan of action, follow-up.

**Board-prep flashcards / SRS**
- Extends the planned spaced-repetition engine (Part 4/7) with board-specific decks beyond the existing 16 quiz banks — branch knowledge, leadership principles, current events, "why this branch" talking points.

**Packing / gear checklist builder**
- Reusable templates (ruck march, FTX, lab, CULP, etc.). Check off as you pack; save templates; clone per event.

### 9C — Deliberately NOT recommended (avoid feature-creep)

- **Social / sharing layer** — a static offline PWA can't do it well; dilutes a focused personal tool.
- **Push notifications** — not reliable from this kind of PWA; would over-promise.
- **In-app AI chat** — out of scope for an offline tool; keep the app deterministic and private.
- **More gamification** (beyond current XP/streaks) — engagement mechanics tend to backfire on self-improvement apps: they shift effort from doing the work to managing the app.

### Meta-recommendation
The highest-leverage next move may not be a new feature at all — it's the **Dashboard (9A)** that makes everything already built easier to use daily, followed by **actually living in the app for a few weeks**. Real usage reveals what to build next more reliably than guessing: build what you naturally reach for, prune what you never open.

---

## Recommended build order (across sessions)

Built cheapest-high-value first, each piece self-contained and testable.

**Session A — Foundations (data + habits)**
1. Vitals log (pulse, BP, hemoglobin) on Profile + trend sparklines.
2. Apple Health import *stub* (parser interface, no mapping yet).
3. Habits system: data model, daily habit quests, per-habit streaks, starter library, skill-feed link, grace-day.
4. **Skill permanence + peak tracking** (small, touches the existing skill engine — good to do early): floor decayed skills at level 1, add `peakLevel`, show "current · peak" on cards, backfill on load.

**Session B — Cognitive skills + first tests**
5. Add **Cognitive** & **Physiological** skill categories with ladders + auto hooks.
6. Build the **Test tab** shell + the 3 easiest tests: **reaction time, digit span, typing speed**. Wire results → skills + suggestions.

**Session C — Memory & working memory**
7. **N-back** trainer + **Go/No-Go** + **processing speed** + **mental math**.
8. **Memory palace trainer** + **spaced-repetition deck engine** (the memory track core).

**Session D — Knowledge & integration**
9. Tie existing **quiz banks** to Academic skills; build **study-plan generator** (spaced schedule → daily quests).
10. **"Work on this"** hub on every skill card, routing to the right trainer/plan/protocol.

**Session E — Dashboard, history & ROTC tools (Part 9)**
11. **Dashboard / "Today" view** (9A) — aggregator landing tab; consider pulling earlier since it's high daily value.
12. **History / trends view** (9A) + **CSV/printable export** (9A).
13. **Counseling/event log**, **board-prep SRS decks**, **packing/gear checklist** (9B).

**Session F — Polish**
14. Cross-tab dashboards (cognition trend, vitals trend, habit heatmap).
15. Apple Health import: wire the real mapping when a sample export is available.
16. Full regression, cache bump, repackage.

---

## Constraints & honest limits (keep visible in the app)

- **No automatic Apple Watch sync** in a static PWA — manual entry or Health-export import only.
- **Reflexes, BP, hemoglobin, grip** need a real device or clinic — the app logs and trends them, doesn't measure them.
- **In-app cognitive tests are relative trackers**, not clinical/IQ instruments; device lag affects reaction/processing scores.
- **Brain-training transfer is limited** — gains are mostly task-specific; memory *technique* is the real lever.
- **BP/hemoglobin ranges are informational, not medical advice** — defer to a clinician.
- **AFT scoring** is from the official 1 Jun 2025 tables (anchor points + interpolation); official PDF/cadre is the final word for graded tests.
- All data stays on-device / in your cloud file; nothing is uploaded anywhere.

---

## Data-model additions (reference for next session)

```
S.vitals      = []   // {date, pulse, bpSys, bpDia, hemoglobin, hrv?, vo2?, note}
S.habits      = []   // {id, name, schedule, streak, bestStreak, lastDone, linkedSkill, graceUsed, history:[]}
S.tests       = []   // {id, type, date, score, raw, linkedSkill}  e.g. type:"reaction"
S.srsDecks    = []   // {id, name, cards:[{front,back,due,interval,ease,reps}]}
S.studyPlans  = []   // {id, title, testDate, topics:[], schedule:[], done:[]}
S.lifeSkills  += new Cognitive & Physiological skills (group/parent/levels/auto/fadeDays)
                 + every skill gains `peakLevel` (all-time high); effective-level floors at 1 once started
S.healthImport = { lastImport:null }  // Apple Health export stub
S.counseling  = []   // {id, date, type, people, summary, plan, followUp}   (9B)
S.checklists  = []   // {id, name, items:[{text,done}], template:bool}        (9B packing/gear)
// Dashboard & trends (9A) are read-only views over existing data — no new storage needed.
// CSV/printable export (9A) reads existing collections; no new storage.
```

New tabs/sections: **Test** (new tab), **Vitals** (Profile section), **Habits** (Daily Orders area or own tab), **Study** (could live in FM or its own tab), **Work-on-this** (per skill card), **Dashboard/Today** (new landing tab, 9A), **History/Trends** (new tab, 9A), **Counseling log** & **Checklists** (9B, own tab or under The Wall).
