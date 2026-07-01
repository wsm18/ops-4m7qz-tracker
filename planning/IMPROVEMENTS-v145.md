# IMPROVEMENTS v145 — Pyramid Structural Repair

Authoritative spec for the v145 session. Read in full before writing a single line of code.

---

## What this session does

Full pyramid audit (run in v144 Q&A) revealed structural gaps across 7 of 11 Mythics. This session repairs all gaps so every Mythic has exactly:

```
1 Mythic
  ← 5 Legendaries  (synthesizedFrom: <mythic>_leg)
      ← 5 Rares each  (synthesizedFrom: <mythic>_r_<cluster>)
          ← 5 Uncommons each  (synthesizedFrom: <mythic>_c_<cluster>)
```

Commons are NOT touched this session. Only Uncommon → Rare → Legendary → Mythic structure is repaired.

---

## Audit results — current state

| Mythic | Legs | Rares | Uncommons | Status |
|---|---|---|---|---|
| Keeper of the Flame | 5 | 25 | 125 | ✓ DONE |
| Physical Mastery | 5 | 25 | 125 | ✓ DONE |
| Scholar-Warrior | 5 | 25 | 125 | ✓ DONE |
| The Living Root | 5 | 25 | 125 | ✓ DONE |
| Vital Operator | 5 | 25 | **123** | Fix 2 Uncommons |
| Tactical Mastery | **6** | 27 | 135 | 6th Leg → new 2nd Mythic |
| Battlefield Commander | **6** | 26 | 130 | 6th Leg → new 2nd Mythic |
| Cyberspace Operations Officer | **6** | 26 | 130 | 6th Leg → new 2nd Mythic |
| Master of the Mind | **6** | 26 | 130 | 6th Leg → new 2nd Mythic |
| Sovereign Self | **6** | 26 | 130 | 6th Leg → new 2nd Mythic |
| Soldier Athlete | 5 | **16** | **30** | Fill Rare + Uncommon gaps |

---

## Fix 1 — Vital Operator: 2 missing Uncommons (quick)

Two Rares have only 4 Uncommons:

- **Grip strength** Rare (`setKey:"phys2_r_grip"`, `synthesizedFrom:"phys2_u_grip"`) — has 4: Pinch strength, Crushing strength endurance, Wrist stability, Forearm conditioning. **Add 1 more:**
  - "Grip endurance testing" (`cat:"physiological"`, `rarity:"uncommon"`, `setKey:"phys2_u_grip"`, 5L)

- **Resting heart rate** Rare (`synthesizedFrom:"phys2_u_cardio_biometrics"`) — has 4: Maximal heart rate estimation, Heart rate zone training, Heart rate drift, Cardiac output trends. **Add 1 more:**
  - "Heart rate variability tracking" (`cat:"physiological"`, `rarity:"uncommon"`, `setKey:"phys2_u_cardio_biometrics"`, 5L)

---

## Fix 2 — Soldier Athlete: fill Rare clusters + add Uncommons

### Missing Rares (9 total)

Each Legendary needs 5 Rares feeding it. Add to existing clusters:

**CQC Mastery** (`synthesizedFrom:"phys_r_cqc"`) — has 2, needs 3 more in `setKey:"phys_r_cqc"`:
- "CQC Weapons Retention" — defending and retaining your weapon in close quarters; 8L, `synthesizedFrom:"physb_u_cqc_weapons"`
- "CQC Ground Defense" — fighting off your back, guard maintenance, stand-up; 9L, `synthesizedFrom:"physb_u_cqc_ground"`
- "CQC Scenario Integration" — force continuum application across real scenarios; 10L, `synthesizedFrom:"physb_u_cqc_scenarios"`

**Army Fitness Excellence** (`synthesizedFrom:"physb_r_army_fit"`) — has 3, needs 2 more in `setKey:"physb_r_army_fit"`:
- "Tactical Athleticism" — speed, agility, and reactive athleticism in uniform; 9L, `synthesizedFrom:"physb_u_tac_athleticism"`
- "Physical Testing & Benchmarking" — self-testing, tracking trends, and identifying limiters; 8L, `synthesizedFrom:"physb_u_phys_benchmarking"`

**Physical Versatility** (`synthesizedFrom:"physb_r_phys_versatility"`) — has 1, needs 4 more in `setKey:"physb_r_phys_versatility"`:
- "Primal Movement Patterns" — crawl, climb, jump, hang, carry; 8L, `synthesizedFrom:"physb_u_primal_movement"`
- "Acrobatic Control" — rolls, breakfalls, controlled tumbling; 9L, `synthesizedFrom:"physb_u_acrobatic"`
- "Loaded Movement Arts" — movement quality under external load (sandbag, ruck, vest); 8L, `synthesizedFrom:"physb_u_loaded_movement"`
- "Environmental Movement" — climbing, swimming, running across terrain; 9L, `synthesizedFrom:"physb_u_env_movement"`

### Missing Uncommons (95 total = 10 existing Rares × 0 Uncommons + 9 new Rares × 5 Uncommons)

After adding 9 new Rares above, the total new Uncommon sets needed:

**Operational Endurance Rares (10 Rares × 5 = 50 Uncommons):**

| Rare | Uncommon setKey | 5 Uncommon seeds to write |
|---|---|---|
| Back-to-Back Performance | physb_u_bb_performance | Back-to-back day pacing; Recovery nutrition; Training density management; Cumulative fatigue monitoring; Multi-day programming |
| Sleep Deprivation Tolerance | physb_u_sleep_dep | Sleep debt awareness; Cognitive performance under sleep restriction; Stimulant management; Strategic napping; Post-deprivation recovery |
| Environmental Adaptation | physb_u_env_adapt | Heat acclimatization protocol; Cold weather operation; Altitude adjustment; Humidity management; Hydration under environmental stress |
| Sustained Physical Output | physb_u_sustained_output | Long-event pacing; Energy management (4–8 hrs); Caloric intake during sustained effort; Mental pacing strategies; Load/effort balance |
| Occupational Load Management | physb_u_occ_load | Load distribution principles; Hot-spot prevention; Kit packing discipline; Gait adaptation under load; Injury prevention under load |

**Physical Leadership Rares (5 Rares × 5 = 25 Uncommons):**

| Rare | Uncommon setKey | 5 Uncommon seeds to write |
|---|---|---|
| Unit PT Design | physb_u_unit_pt | Unit fitness assessment; PT periodization; Collective event selection; Safety planning; Progressive overload for groups |
| Physical Standards Coaching | physb_u_phys_coach | Event-specific technique coaching; Identifying performance limiters; Remediation programming; Feedback delivery; Motivation & accountability |
| Athlete Development | physb_u_athlete_dev | Individual development planning; Benchmark setting; Failure analysis; School/selection preparation; Long-term progression |
| Fitness Assessment & Evaluation | physb_u_fit_assess | AFT event administration; Score recording & documentation; Trend analysis; Body composition evaluation; Objection handling |
| Physical Mentorship | physb_u_phys_mentor | Opening conversation & baseline; Mentorship cycle management; Setback coaching; Long-distance mentorship; Building physical culture |

**CQC new Rares (3 Rares × 5 = 15 Uncommons):**

| Rare | Uncommon setKey | 5 Uncommon seeds to write |
|---|---|---|
| CQC Weapons Retention | physb_u_cqc_weapons | Holster security; Weapon strip defense; Retention strikes; One-handed weapon use; Recovery after retention breach |
| CQC Ground Defense | physb_u_cqc_ground | Guard position; Hip escape; Getting to feet; Back-take defense; Ground-and-pound defense |
| CQC Scenario Integration | physb_u_cqc_scenarios | Force continuum decision-making; LEAPS verbal de-escalation; Scenario-based training; After-action assessment; Legal justification awareness |

**Army Fitness new Rares (2 Rares × 5 = 10 Uncommons):**

| Rare | Uncommon setKey | 5 Uncommon seeds to write |
|---|---|---|
| Tactical Athleticism | physb_u_tac_athleticism | Reactive agility; Short-burst sprinting in kit; Direction change mechanics; Explosive jumping under load; Multi-directional acceleration |
| Physical Testing & Benchmarking | physb_u_phys_benchmarking | Establishing baseline metrics; Testing protocols; Tracking tools; Identifying limiters; Trend interpretation |

**Physical Versatility new Rares (4 Rares × 5 = 20 Uncommons):**

| Rare | Uncommon setKey | 5 Uncommon seeds to write |
|---|---|---|
| Primal Movement Patterns | physb_u_primal_movement | Crawling patterns; Climbing technique; Jumping mechanics; Hanging & grip; Object carry patterns |
| Acrobatic Control | physb_u_acrobatic | Forward roll; Backward roll; Breakfall; Lateral roll; Controlled tumbling |
| Loaded Movement Arts | physb_u_loaded_movement | Sandbag carries; Ruck movement quality; Weighted carries; Vest mobility; Load management in motion |
| Environmental Movement | physb_u_env_movement | Rope climbing; Obstacle crossing; Terrain running; Open water movement; Cross-terrain navigation |

---

## Fix 3 — 5 paths with 6 Legendaries: create second Mythics

Each of tac, lead, tech, cog, pers has 6 Legendaries. The 6th moves to a new second Mythic. Each second Mythic needs the 6th Legendary + 4 new Legendaries (each with 5 Rares + 5 Uncommons).

### 3A — Tactical: create "Warrior Foundation" Mythic

**Existing 6th Legendary to move:** Soldier Fundamentals (`setKey:"tac_leg"` → change to `setKey:"tac2_leg"`)
- Has 2 Rares (Field Operations Mastery, Combat Task Mastery) → needs **3 more Rares** in `setKey:"tac_r_soldier"`:
  - "Soldier Equipment Mastery" — weapons qualification, kit function, equipment checks; 9L, `synthesizedFrom:"tac_u_equipment"`
  - "Deployed Soldier Skills" — force protection, patrol base, guard duty, detainee handling; 9L, `synthesizedFrom:"tac_u_deployed"`
  - "Warrior Resilience" — mental toughness in field ops, hardship under mission; 8L, `synthesizedFrom:"tac_u_warrior_resilience"`

**4 new Legendaries** needed for `setKey:"tac2_leg"`:
- "Weapons Mastery" — synthesizedFrom:"tac2_r_weapons" (5 Rares, 25 Uncommons)
- "Small Unit Tactics" — synthesizedFrom:"tac2_r_sut" (5 Rares, 25 Uncommons)
- "Field Medicine & CASEVAC" — synthesizedFrom:"tac2_r_field_med" (5 Rares, 25 Uncommons)
- "Operational Communications" — synthesizedFrom:"tac2_r_comms" (5 Rares, 25 Uncommons)

**New Mythic:** "Warrior Foundation" (`cat:"tactical"`, `rarity:"mythic"`, `setKey:"tac2_mythic"`, `synthesizedFrom:"tac2_leg"`)

**Tactical Mastery unlockHint:** revert to "all 5 Tactical Legendaries" (Soldier Fundamentals leaves tac_leg)

### 3B — Leadership: create "Staff Excellence" Mythic

**Existing 6th Legendary to move:** Organizational Excellence (`setKey:"lead_leg"` → `setKey:"lead2_leg"`)
- Has 1 Rare (Leadership Operations) → needs **4 more Rares** in `setKey:"lead_r_org_tools"`:
  - "Meeting Facilitation Mastery" — structured meetings, consensus building, minutes; 9L, `synthesizedFrom:"lead_u_meetings"`
  - "Negotiation Tactics" — principled negotiation, BATNA, positional vs interest; 9L, `synthesizedFrom:"lead_u_negotiation"`
  - "Program Management" — multi-project tracking, dependency management, reporting; 8L, `synthesizedFrom:"lead_u_program_mgmt"`
  - "Organizational Systems Design" — SOPs, battle rhythm, process improvement; 9L, `synthesizedFrom:"lead_u_org_systems"`

**4 new Legendaries** for `setKey:"lead2_leg"`:
- "Administrative Command" — synthesizedFrom:"lead2_r_admin" (5 Rares, 25 Uncommons)
- "Training Management" — synthesizedFrom:"lead2_r_training_mgmt" (5 Rares, 25 Uncommons)
- "Logistics & Sustainment" — synthesizedFrom:"lead2_r_logs" (5 Rares, 25 Uncommons)
- "Multi-Echelon Coordination" — synthesizedFrom:"lead2_r_coord" (5 Rares, 25 Uncommons)

**New Mythic:** "Staff Excellence" (`cat:"leadership"`, `rarity:"mythic"`, `setKey:"lead2_mythic"`, `synthesizedFrom:"lead2_leg"`)

**Battlefield Commander unlockHint:** revert to "all 5 Leadership Legendaries"

### 3C — Technical: create "Cyber Operator" Mythic

**Existing 6th Legendary to move:** Cyber Operations Mastery (`setKey:"tech_leg"` → `setKey:"tech2_leg"`)
- Has 1 Rare (Advanced Cyber Tradecraft) → needs **4 more Rares** in `setKey:"tech_r_advanced_cyber"`:
  - "Exploit Development" — custom exploit writing, shellcode, proof-of-concept; 10L, `synthesizedFrom:"tech_u_exploit_dev"`
  - "Red Team Operations" — red team methodology, C2 frameworks, campaign planning; 10L, `synthesizedFrom:"tech_u_red_team"`
  - "Digital Forensics & Incident Response" — evidence collection, timeline reconstruction, DFIR; 9L, `synthesizedFrom:"tech_u_dfir"`
  - "Threat Intelligence Analysis" — APT tracking, TTPs, MITRE ATT&CK, finished intel products; 9L, `synthesizedFrom:"tech_u_threat_intel"`

**4 new Legendaries** for `setKey:"tech2_leg"`:
- "Offensive Cyber Mastery" — synthesizedFrom:"tech2_r_offensive" (5 Rares, 25 Uncommons)
- "Defensive Cyber Operations" — synthesizedFrom:"tech2_r_defensive" (5 Rares, 25 Uncommons)
- "Cyber Intelligence" — synthesizedFrom:"tech2_r_cyber_intel" (5 Rares, 25 Uncommons)
- "Mission Command Integration" — synthesizedFrom:"tech2_r_mission_cmd" (5 Rares, 25 Uncommons)

**New Mythic:** "Cyber Operator" (`cat:"technical"`, `rarity:"mythic"`, `setKey:"tech2_mythic"`, `synthesizedFrom:"tech2_leg"`)

**Cyberspace Operations Officer unlockHint:** revert to "five Technical Legendary cards"

### 3D — Cognitive: create "Cognitive Athlete" Mythic

**Existing 6th Legendary to move:** Cognitive Versatility (`setKey:"cog_leg"` → `setKey:"cog2_leg"`)
- Has 1 Rare (Cognitive Enhancement Toolkit) → needs **4 more Rares** in `setKey:"cog_r_cog_tools"`:
  - "Flow State Induction" — deep work, trigger stacking, performance flow; 9L, `synthesizedFrom:"cog_u_flow"`
  - "Learning Acceleration" — spaced repetition, interleaving, elaborative interrogation; 8L, `synthesizedFrom:"cog_u_learning_accel"`
  - "Cognitive Fatigue Management" — identifying fatigue signatures, recovery protocols; 8L, `synthesizedFrom:"cog_u_cog_fatigue"`
  - "Mental Simulation & Rehearsal" — visualization, mental rehearsal, scenario pre-mortem; 9L, `synthesizedFrom:"cog_u_mental_sim"`

**4 new Legendaries** for `setKey:"cog2_leg"`:
- "Performance Psychology" — synthesizedFrom:"cog2_r_perf_psych" (5 Rares, 25 Uncommons)
- "Advanced Learning Systems" — synthesizedFrom:"cog2_r_learning_sys" (5 Rares, 25 Uncommons)
- "Cognitive Resilience" — synthesizedFrom:"cog2_r_cog_resilience" (5 Rares, 25 Uncommons)
- "Tactical Cognition" — synthesizedFrom:"cog2_r_tac_cognition" (5 Rares, 25 Uncommons)

**New Mythic:** "Cognitive Athlete" (`cat:"cognitive"`, `rarity:"mythic"`, `setKey:"cog2_mythic"`, `synthesizedFrom:"cog2_leg"`)

**Master of the Mind unlockHint:** revert to "all 5 Cognitive Legendaries"

### 3E — Personal: create "Life Architect" Mythic

**Existing 6th Legendary to move:** Life Mastery (`setKey:"pers_leg"` → `setKey:"pers2_leg"`)
- Has 1 Rare (Life Administration) → needs **4 more Rares** in `setKey:"pers_r_life_admin"`:
  - "Personal Brand & Reputation" — professional identity, online presence, referral network; 8L, `synthesizedFrom:"pers_u_brand"`
  - "Systems Thinking in Daily Life" — habit stacking, environment design, feedback loops; 8L, `synthesizedFrom:"pers_u_systems"`
  - "Risk Management & Insurance" — life insurance, disability, risk identification; 8L, `synthesizedFrom:"pers_u_risk_mgmt"`
  - "Long-Term Life Planning" — 10-year visioning, milestone tracking, life review cadence; 9L, `synthesizedFrom:"pers_u_life_planning"`

**4 new Legendaries** for `setKey:"pers2_leg"`:
- "Wealth Architecture" — synthesizedFrom:"pers2_r_wealth" (5 Rares, 25 Uncommons)
- "Purpose & Identity" — synthesizedFrom:"pers2_r_purpose" (5 Rares, 25 Uncommons)
- "Social Capital" — synthesizedFrom:"pers2_r_social_cap" (5 Rares, 25 Uncommons)
- "Physical Sovereignty" — synthesizedFrom:"pers2_r_phys_sov" (5 Rares, 25 Uncommons)

**New Mythic:** "Life Architect" (`cat:"personal"`, `rarity:"mythic"`, `setKey:"pers2_mythic"`, `synthesizedFrom:"pers2_leg"`)

**Sovereign Self unlockHint:** revert to "five personal Legendaries" (removing Life Mastery from that list)
**Sovereign Self howTo:** revert to "Life Operations, Inner Discipline, Financial Sovereignty, Social Fluency, and Physical Resilience" (remove "Life Mastery")

---

## Implementation order for v145

### Phase 1: Quick fixes (do first)
1. Add 2 missing Uncommons to Vital Operator (Grip endurance testing + Heart rate variability tracking)
2. Update Tactical Mastery, Battlefield Commander, Cyberspace Operations Officer, Master of the Mind, Sovereign Self — revert unlockHints/howTo from "6" back to "5"

### Phase 2: Move 6th Legendaries to new Mythic sets
For each of the 5 affected Legendaries, change `setKey` from `X_leg` to `X2_leg`:
- Soldier Fundamentals: `setKey:"tac_leg"` → `setKey:"tac2_leg"`
- Organizational Excellence: `setKey:"lead_leg"` → `setKey:"lead2_leg"`
- Cyber Operations Mastery: `setKey:"tech_leg"` → `setKey:"tech2_leg"`
- Cognitive Versatility: `setKey:"cog_leg"` → `setKey:"cog2_leg"`
- Life Mastery: `setKey:"pers_leg"` → `setKey:"pers2_leg"`

### Phase 3: Fill Rare clusters for the 6th Legendaries (19 new Rares)
Write the Rares specified in sections 3A–3E above. Each needs:
- `synthesizedFrom` → a new Uncommon setKey
- 8–10L ladder
- `unlockHint`, `why`, `howTo`, `levels`

### Phase 4: Fill Soldier Athlete Rare clusters (9 new Rares)
Write the Rares from Fix 2 above.

### Phase 5: Write all missing Uncommons (120 new Uncommons from the new Rares)
For every new Rare written in phases 3 + 4, write 5 Uncommons using the setKey specified.
5 Uncommons × 28 new Rares = 140 Uncommons.

### Phase 6: Write missing Uncommons for existing physb Rares (50 Uncommons)
The 10 existing Operational Endurance + Physical Leadership Rares already have `synthesizedFrom` keys set. Write 5 Uncommons for each using the setKey table in Fix 2.

### Phase 7: Create 5 new Mythics + 20 new Legendaries
- 5 new Mythic seeds (Warrior Foundation, Staff Excellence, Cyber Operator, Cognitive Athlete, Life Architect)
- 20 new Legendary seeds (4 per new Mythic) — `setKey:"X2_leg"`, each with `synthesizedFrom:"X2_r_<cluster>"`
- For each new Legendary, create 5 Rares (`setKey:"X2_r_<cluster>"`, `synthesizedFrom:"X2_u_<cluster>"`)
- For each new Rare, create 5 Uncommons (`setKey:"X2_u_<cluster>"`)

Total for Phase 7: 5 Mythics + 20 Legendaries + 100 Rares + 500 Uncommons

---

## Session close checklist for v145

- [ ] Vital Operator: 2 missing Uncommons added → Uncommons 123→125
- [ ] 5 Mythic unlockHints reverted to "5 Legendaries"
- [ ] 5 Legendaries moved from X_leg → X2_leg
- [ ] 19 new Rares added (6th Legendary clusters filled to 5)
- [ ] 9 new Rares added (Soldier Athlete clusters filled to 5)
- [ ] New Uncommons written for all new Rares (140 Uncommons)
- [ ] New Uncommons written for existing physb Rares (50 Uncommons)
- [ ] 5 new Mythics seeded
- [ ] 20 new Legendaries seeded
- [ ] 100 new Rares seeded (for new Legendaries)
- [ ] 500 new Uncommons seeded (for new Rares) ← likely spans v146+
- [ ] `python scripts/build.py` → OK
- [ ] `npm run check` → SYNTAX OK
- [ ] `npm run regress` → PAGEERRORS 0, badCount:0
- [ ] `SKILL_LADDER_VER` bumped (113 → 114)
- [ ] SW bumped to operations-v145
- [ ] `npm run package` → zip created
- [ ] `planning/IMPROVEMENTS-v145.md` deleted
- [ ] `planning/IMPROVEMENTS-v146.md` created (continue pyramid repair or begin Commons)
- [ ] `planning/NEXT-SESSION-PROMPT.md` updated
- [ ] Tell Wyatt to hard-refresh

---

## Throughput note

Phases 1–6 (~190 new seeds) are achievable in one session. Phase 7 (~625 new seeds) will span v146–v147. Do not start Phase 7 until Phases 1–6 are verified with `npm run regress badCount:0`.
