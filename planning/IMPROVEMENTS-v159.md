# IMPROVEMENTS-v159 — Commons layer, eighth tree: Sovereign Self

## Scope
Write the Commons (5th/bottom) tier for the **Sovereign Self** Mythic tree (`cat:"personal"`), the 8th of 16 Mythic trees to get its Commons layer. Same object shape and process as v150–v158 (Physical Mastery, Keeper of the Flame, Tactical Mastery, Battlefield Commander, Vital Operator, Scholar-Warrior, Soldier Athlete).

Confirmed fresh from `SEED_SKILLS` at session start (2026-07-30):
- Total skills: **6899** (matches `NEXT-SESSION-PROMPT.md`, no drift)
- 7 trees already have 625 Commons each; 9 trees have 0. Sovereign Self is one of the 9.
- Baseline name+cat duplicate count: **10** (matches known list) — 4 of these are `cat:"personal"` (`Personal finance`, `Legal literacy`, `Tax Strategy`, `Debt Management`). Must not reuse these names for new Commons skills in `personal`.

## Structure
Sovereign Self → 5 Legendaries → 25 Rares → 125 Uncommons → **125 Commons setKeys / 625 Commons skills** (5 per setKey).

Legendaries: Life Operations, Inner Discipline, Financial Sovereignty, Social Fluency, Physical Resilience.

25 Rare groups (= 25 agents, one per Rare, 5 setKeys/25 skills each):
1. Time management
2. Driving / vehicle ops
3. Home Operations
4. Administrative Competence
5. Logistics & Transition
6. Discipline / habits
7. Emotional Regulation
8. Identity & Values Clarity
9. Goal Architecture
10. Resilience & Adaptability
11. Personal finance
12. Investing & wealth building
13. Tax Strategy
14. Debt Management
15. Long-Term Financial Planning
16. Professional Presence
17. Relationship Depth
18. Communication Mastery
19. Social Presence
20. Community & Mentorship
21. First aid
22. Stress Mastery
23. Sleep & Recovery Mastery
24. Health Maintenance
25. Digital & Information Hygiene

setKey prefix: `pers_c_*`. Full setKey → parent-Uncommon-name mapping generated via Node script at session start (`/tmp/sovereign_self_groups.json`, not committed — regenerable from `SEED_SKILLS` any time).

## Object shape (exact copy of v150–v158 pattern)
```js
{name:"...", cat:"personal", rarity:"common", fadeDays:30, setKey:"pers_c_...",
 why:"...", howTo:"...",
 levels:["L1...","L2...","L3...","L4..."],
 roadmap:["...","...","...","..."],
 advance:["Reach L1: ...","Reach L2: ...","Reach L3: ...","Reach L4: ..."],
 maintain:["Hold L1: ...","Hold L2: ...","Hold L3: ...","Hold L4: ..."]}
```
No `synthesizedFrom`, `unlockHint`, or `tiers` fields. `levels`/`roadmap`/`advance`/`maintain` each exactly 4 items.

## Process (unchanged from v150–v158)
1. Pre-place 125 unique `// SLOT:<setKey>:<name>:<cat>` marker comments myself, grouped by parent Rare.
2. Dispatch 1 agent per Rare group (5 setKeys/25 skills), **2 agents per wave max**, ~13 waves.
3. Every agent: strongly prefer the Edit tool over any script; if a script is unavoidable, never truncate/batch — read fresh before each write.
4. Every agent: watch for the v157 group-boundary trailing-comma failure mode.
5. Every agent: self-verify `why`/`howTo` presence and a trailing comma on a sample before reporting done.
6. After EVERY wave: `node --check`, member-count sweep for that wave's setKeys, marker-count-dropped-by-10 check, `grep SLOT | sort | uniq -d` dup check, full required-field/array-length validator, and a check that no previously-clean setKey regressed (lost-update race signature).
7. After the full tree: recursive whole-tree sweep (125 setKeys × 5 = 625, all 5/5/5/5 down the chain) + whole-file name+cat dup sweep (expect exactly 10, zero new).
8. Ship checklist: build, check, regress, bump `sw.js` (v158→v159), `SKILL_LADDER_VER` unmodified (pure addition), package, update planning docs, commit.

Delete this file once implemented (recorded in `FINISHED-FEATURES.md` instead).
