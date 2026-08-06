# v166 — Commons layer, sixteenth (final) Mythic tree: Life Architect

## State re-derived at session start (2026-08-06)
- Total `SEED_SKILLS`: 11274 (matches v165's doc exactly, no drift)
- 14/16 Mythic trees at 625 Commons: Physical Mastery, Keeper of the Flame, Tactical Mastery,
  Battlefield Commander, Vital Operator, Scholar-Warrior, Soldier Athlete, Sovereign Self,
  The Living Root, Warrior Foundation, Master of the Mind, Cyberspace Operations Officer,
  Staff Excellence, Cognitive Athlete
- 2 remaining at 0 Commons: **Cyber Operator** (`cat:"technical"`), **Life Architect** (`cat:"personal"`)
- Whole-file name+cat dup sweep: exactly 10 known dupes (5 in `technical`, 4 in `personal`,
  1 in `cognitive`) — matches doc exactly, no new dupes.

## Tree picked: Life Architect (`cat:"personal"`)
Picked over Cyber Operator because `personal` has fewer known pre-existing dupes (4 vs
`technical`'s 5), per the doc's own tiebreaker reasoning. Both remaining trees have a shipped
same-cat sibling (`personal` → Sovereign Self, `technical` → Cyberspace Operations Officer) —
per the v161 finding, every candidate Commons name will be grepped against the whole `personal`
cat before writing, not just the 10-item known-dupe list.

## Structure (mapped directly from SEED_SKILLS, not inferred)
Mythic `Life Architect` → `synthesizedFrom: pers2_leg` → 5 Legendaries → 25 Rare slot-holders
(5 per Legendary) → 125 Uncommons (5 per Rare) → 125 Commons setKeys (1 per Uncommon, 5 skills
each = 625 total).

Legendaries: Life Mastery, Wealth Architecture, Purpose & Identity, Social Capital,
Physical Sovereignty.

**Benign legacy-prefix quirk (same pattern as v164/v165):** the 5 setKeys under the first
Legendary (Life Mastery → Life Administration) use the OLD `pers_c_*` prefix instead of this
tree's own `pers2_c_*`, because those 5 Uncommons (Personal finance, Career planning &
development, Legal literacy, Healthcare navigation, Side income & entrepreneurship) are
pre-existing legacy skills wired into this tree per the existing-skill-integration rule.
Verified all 5 `pers_c_*` keys have zero existing members — genuinely unclaimed, not a defect.
Two of those five Uncommon names (`Personal finance`, `Legal literacy`) ARE among the known
10 pre-existing name+cat dupes — expected, already accounted for.

Full 25-group / 125-setKey breakdown is staged directly in `src/core/skills-data.js` as
`// SLOT:<setKey>:personal` markers under the header
`PERSONAL PYRAMID (Life Architect) — COMMONS LAYER — v166 STAGED`, one group per parent Rare.

## Execution plan
- One agent per group (5 setKeys / 25 skills per agent), 25 groups total.
- **2 agents per wave, 13 waves** (12 waves of 2 + final wave of 1) — standing concurrency cap,
  zero file-corruption incidents across the last 12 trees at this concurrency.
- Reuse the v150–v165 Common object shape exactly: `rarity:"common"`, `fadeDays:30`, `setKey`
  = the given SLOT key, 4-item `levels`/`roadmap`/`advance`/`maintain` arrays, no
  `synthesizedFrom`/`unlockHint`/`tiers`. Reference: any `pers2_c_*` or `pers_c_*` skill
  already shipped (e.g. Sovereign Self's commons) for exact shape.
- Every agent prompt must include: Edit-tool preference over scripts, the group-boundary
  trailing-comma warning (v157), the v153 all-25-missing-`howTo` warning, the v154
  truncating-write/lost-update warnings, the "re-grep markers after every Edit call"
  discipline, and a live `grep '{name:"<candidate>", cat:"personal"'` check per candidate name
  before writing (v161 same-cat collision finding).
- After every wave: `node --check`, member-count sweep for that wave's setKeys, marker-count
  drop check, `grep "// SLOT:" | sort | uniq -d` for dup markers, full required-field
  validator, AND a check that previously-verified setKeys haven't regressed (lost-update
  race check), AND a scan of undispatched groups' markers/headers for corruption (v159).
- 3 intermediate checkpoint commits at Legendary boundaries (after groups 5, 10, 15, 20 — i.e.
  after each Legendary's 5 groups complete).
- After all 25 groups: full recursive whole-tree sweep (125 setKeys, 625 skills, 5/5/5/5
  throughout), full required-field validator across all 625, whole-file name+cat dup sweep
  (expect exactly 10, unchanged).

## Ship checklist
Same as every session — see `planning/NEXT-SESSION-PROMPT.md` steps 0–16. Bump `sw.js` to
v166. `SKILL_LADDER_VER` unchanged (no existing ladder/tier/guidance text changed, pure
addition). This is the **final** Mythic tree — once done, all 16/16 Mythic trees have complete
Commons layers (11274 → 11899, 10000 total pyramid skills complete... verify exact total after).
