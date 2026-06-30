# Operations — v127: The Pyramid Continued (Physical Uncommons + Synthesis UI)

---

## The Full System — Design, Philosophy, and Rationale

### Why 7,810 cards

The pyramid isn't a gimmick. It's a complete mastery lattice — a structural answer to the question "how do you verifiably prove that you own a domain of human capability, not just a single skill?"

A checklist approach fails at depth. You can check "ran a mile" without ever building an aerobic base. You can check "lifted weights" without ever learning periodization. Checklists reward frequency, not integration.

The pyramid enforces a different contract:

> **You cannot synthesize a higher card until you've mastered every card in its set. No skipping. No grinding one card to compensate for another. Breadth is the prerequisite for depth.**

This mirrors how expertise actually develops in any physical domain. You don't build a marathon engine until you've built a running base. You don't build a strength periodization skill until you know how to deadlift, squat, and press with correct mechanics. The pyramid makes that invisible causal chain visible and gameable.

---

### The Five Tiers and What Each Proves

| Tier | Count (per path) | What it proves | Time horizon |
|---|---|---|---|
| Common | 625 | You DID the thing once — one verified training act | 1 session–1 week |
| Uncommon | 125 | You CAN DO the thing consistently — practiced and repeatable | 2–6 weeks |
| Rare | 25 | You OWN the thing — yours under any condition | 2–6 months |
| Legendary | 5 | You SYNTHESIZE multiple capacities into one unified capability | 6–24 months |
| Mythic | 1 | You EMBODY the entire path — sustained, automatic, unconscious competence | Years |

**Commons** are atomic drills: "I completed 10 strict pull-ups." "I ran 5km without stopping." They can be ticked in a single training session. Their purpose is to force contact with the fundamentals before you're allowed to claim you know something.

**Uncommons** are sustained competencies: "I hold a 7:30 pace for 5 miles at Zone 2 effort." They require weeks of repetition. Five Commons → one Uncommon enforces that you've touched every facet of the sub-skill before claiming ownership of it.

**Rares** are developed capacities: "I complete a 12-week periodized strength block at prescribed percentages." They require months of training. Five Uncommons → one Rare enforces that your competence is broad enough to synthesize.

**Legendaries** are integration: "My strength foundation, power output, accessory work, periodization, and recovery are all simultaneously at peak level." This can't happen in less than a year of deliberate work. Five Rares → one Legendary means you can't ignore any sub-domain.

**Mythic** is the path apex — the full integration of all five Legendary cards. One per path. It represents the documented human ceiling for this domain of training, held continuously.

---

### The Synthesis Mechanic — Why It Works

When all five cards in a set reach mastery, the Combine button appears on the locked synthesis card in the Side Deck. Pressing it sets `synthesisUnlocked=true` on the live skill, which moves it from the Side Deck into the main deck (face-up) at currentLevel=0 — you've unlocked the right to start leveling it.

This creates a layered unlock progression:
1. Master 5 Commons → Uncommon unlocks (starts in Side Deck at L0)
2. Start and level the Uncommon through its ladder → it eventually reaches max level
3. Repeat for all 5 Uncommons in the Rare's set → Rare unlocks
4. Level the Rare → eventually max
5. Repeat for all 5 Rares in the Legendary's set → Legendary unlocks
6. Level the Legendary → eventually max
7. Repeat for all 5 Legendaries → Mythic unlocks

The result is that **your collection automatically reflects your actual mastery trajectory**. A player who has maxed 4 of 5 Rares in the Strength set is 80% of the way to Foundation of Iron — and they can see that on the locked Legendary card's progress bar.

---

### The Naming Convention for setKeys

This is the system used to wire all synthesis relationships. Every future session must follow this exactly:

```
phys_c_[descriptor]     — Common set key (5 Commons combine into 1 Uncommon)
phys_u_[rare_set_name]  — Uncommon set key (5 Uncommons combine into 1 Rare)
phys_r_[legend_set]     — Rare set key (5 Rares combine into 1 Legendary)
phys_leg                — Legendary set key (5 Legendaries combine into Mythic)
```

When the system expands to other paths, the prefix changes:
```
tact_c_ / tact_u_ / tact_r_ / tact_leg  — tactical path
cog_c_  / cog_u_  / cog_r_  / cog_leg   — cognitive path
```

The `synthesizedFrom` on any card names the `setKey` of the 5 cards that unlock it:
- An Uncommon has `synthesizedFrom:"phys_c_hip_hinge"` → 5 Commons with `setKey:"phys_c_hip_hinge"` unlock it
- A Rare has `synthesizedFrom:"phys_u_strength_basics"` → 5 Uncommons with `setKey:"phys_u_strength_basics"` unlock it

---

### Path completion order across sessions

The full Physical path pyramid requires 781 seeds. Here is the implementation plan:

| Session | Work | Seeds added | Total physical |
|---|---|---|---|
| v126 (done) | Mythic + Legendaries + Rares | 31 | 31 |
| **v127 (this doc)** | **Strength Uncommons (25)** | **25** | **56** |
| v128 | Endurance Uncommons (25) | 25 | 81 |
| v129 | Composition Uncommons (25) | 25 | 106 |
| v130 | Combat Uncommons (25) | 25 | 131 |
| v131 | Movement Uncommons (25) | 25 | 156 |
| v132–v136 | All 5 Common clusters (125 each) | 625 | 781 |
| v137+ | Begin Tactical path | — | — |

---

### Integrating Existing Skills into the Pyramid

**Rule:** Before adding any new seeds for a cluster, read all existing `SEED_SKILLS` entries with `cat:"physical"` and audit them. For each one, determine the most logical pyramid placement based on its ladder depth and subject matter, then add `setKey` (and if needed `rarity`) directly to that existing seed object. The live skill is untouched — `setKey` is seed-only. Migration is safe.

**How to place an existing skill:**

| Ladder depth | Natural tier | Action |
|---|---|---|
| 3–4 levels | Common | Add `setKey:"phys_c_[descriptor]"` — it becomes one of 5 Commons feeding an Uncommon |
| 5–7 levels | Uncommon | Add `setKey:"phys_u_[cluster]"` and `synthesizedFrom:"phys_c_[descriptor]"` — it occupies one Uncommon slot |
| 8–10 levels | Rare | Add `setKey:"phys_r_[legendary_cluster]"` and `synthesizedFrom:"phys_u_[cluster]"` — it occupies one Rare slot |
| 11–13 levels | Legendary | Add `setKey:"phys_leg"` and `synthesizedFrom:"phys_r_[cluster]"` |

**Hard rules for integration:**

1. **Never force a complete set from existing skills.** An existing skill fills ONE slot. New seeds fill the remaining slots in that set. At most 2 existing skills per set of 5; never all 5.
2. **Parts of a skill may map to a slot even if the skill covers more.** "Rucking technique" covers both movement mechanics and endurance — it belongs in an endurance Uncommon set even if it only represents part of that slot's ideal scope. The other 4 Uncommons in the set cover the rest.
3. **Don't force every existing skill in.** If a skill doesn't fit cleanly in any set, leave it without a setKey. It stays as a standalone card.
4. **Keep the set count at exactly 5.** `skSetCanCombine` counts members with matching setKey. If a set already has 5 (from Rares defined in v126), an existing skill can't be added to that same set — pick the closest adjacent set instead.
5. **Add `rarity` field if the depth-based auto-rarity would be wrong.** E.g., a 7-level skill that is conceptually a Rare in its domain should get `rarity:"rare"` explicitly.

**The "parts" principle explained:**

> *"It is ok to lose parts of skills if they are taken apart to make parts of a skill set."*

If an existing skill covers 3 different things (e.g., "Strength programming" covers periodization, volume management, AND peak protocols), placing it in one slot means only ONE of those aspects anchors its set slot. The other aspects might appear as separate new seed slots in the same or adjacent sets. This is fine — the existing skill doesn't get deleted or split; it just represents one facet of a larger cluster. Its full ladder is still there.

---

### Progress Reset — Intentional, User-Authorized

> **"I want to be a blank slate even if I have in the past reached a certain level. I want to go back to basics and earn progress."**

**This is an intentional, permanent exception to CLAUDE.md Rule 4 ("preserve user progress in every migration").** The user has explicitly authorized this. Apply it without hesitation.

**What resets:**
When an existing skill gains a `setKey` through pyramid integration, its live progress is wiped clean:
- `currentLevel` → 0
- `history` → []
- `lastQuestTs` → null
- `synthesisUnlocked` → undefined (delete if present)

The skill still exists. Its ladder, `why`, `howTo`, and `levels` are unchanged. It moves from the face-up main deck into the Side Deck (since `currentLevel === 0`). To start leveling it again, the player must unlock it through the pyramid chain — mastering the prerequisites first. That IS the point.

**Implementation — one-time migration flag:**

In `src/core/migration.js`, add a constant:
```js
const PYRAMID_RESET_VER = 1;
```

In `mergeNewSeedSkills()`, after updating ladder content and before returning, add:
```js
// Pyramid reset — wipe progress on skills newly assigned to the pyramid
if(seed.setKey && !live.pyramidResetApplied){
  live.currentLevel = 0;
  live.history = [];
  live.lastQuestTs = null;
  delete live.synthesisUnlocked;
  live.pyramidResetApplied = PYRAMID_RESET_VER;
}
```

The `pyramidResetApplied` flag on the live skill prevents the reset from firing again on subsequent `SKILL_LADDER_VER` bumps. It only ever fires once per skill — when it first gains a `setKey`.

**Skills that already had `setKey` in v126 (the new pyramid seeds)** start at `currentLevel=0` anyway and have no history — the flag check still works correctly (they'll get `pyramidResetApplied=1` set on first run but there's nothing to wipe).

**Standalone skills without `setKey`** are never touched by this logic.

**Auto-skills** (`auto:` field) cannot have `setKey` by design (auto-skills are Jokers, not pyramid members). This code path will never execute for them.

---

**Workflow for each cluster session:**

1. Run `grep -n 'cat:"physical"' src/core/skills-data.js` to list all existing Physical seeds
2. For each, note: name, levels.length, and current `setKey` (if any)
3. Map each to the most logical pyramid slot using the table above
4. Edit those existing seeds to add `setKey` / `synthesizedFrom` / `rarity` fields
5. Add `pyramidResetApplied` migration logic to `src/core/migration.js` if not yet present
6. Count remaining open slots per set (5 minus however many existing skills you assigned)
7. Add only the needed new seeds to fill each set to exactly 5

---

## Feature 1 — Physical Path: Strength Uncommons (25 seeds)

**First**, audit existing Physical seeds for any that belong in the Strength Uncommon layer (depth 5–7, strength-related subject). If any existing skill maps cleanly to one of the 5 Strength Uncommon sets (`phys_u_strength_basics`, `phys_u_strength_power`, `phys_u_strength_accessory`, `phys_u_strength_programming`, `phys_u_strength_recovery`), add `setKey` to that existing seed and reduce the new seed count for that set accordingly. Then fill remaining slots with the new seeds below.

Add the remaining new seeds to `SEED_SKILLS` in `src/core/skills-data.js`, placed immediately after the last existing Physical pyramid seed (Athletic Locomotion). Bump `SKILL_LADDER_VER` to 97. The SW stays v127.

All 25 share `cat:"physical"` and `rarity:"uncommon"`. Each is locked until its 5 Commons are mastered (which don't exist yet — that's fine; the card will show "0/5 mastered" and the Combine button will appear when Commons are added in a future session).

### Set 1: phys_u_strength_basics (5 Uncommons → "Strength Foundation")

```js
// ---------- phys_u_strength_basics → "Strength Foundation" Rare ----------

{name:"Hip Hinge Mastery", cat:"physical", rarity:"uncommon", fadeDays:60,
 setKey:"phys_u_strength_basics", synthesizedFrom:"phys_c_hip_hinge",
 unlockHint:"Master 5 Hip Hinge Commons to unlock.",
 why:"The hip hinge is the foundation of the deadlift, kettlebell swing, and Romanian DL. Getting it wrong at the foundation means years of bad patterning and eventual injury.",
 howTo:"Practice a bodyweight hip hinge to a wall, then kettlebell deadlift, then RDL. The cue is: hinge at the hip, not the lower back. Your spine neutral the entire time.",
 safety:"Lumbar rounding under load is the injury mechanism. Learn the movement bodyweight first.",
 levels:["Demonstrate a bodyweight hip hinge to a wall with correct spine position","Perform a kettlebell deadlift for 10 reps with correct hinge mechanics","Romanian DL with a barbell for 3×8 at 50% BW — no lumbar flexion at bottom","Conventional deadlift setup and lift with 0.75× BW, correct brace and hinge","Hold 5 sets of hip hinge pattern at 1× BW over 4 consecutive weeks"],
 roadmap:["bodyweight hinge","KB deadlift 10 reps","RDL 3×8 at 50%BW","conv. DL 0.75×BW","5 sets at 1×BW sustained"],
 advance:["Practice hinge to wall daily for 1 week.","KB deadlift 3×10 before every strength session.","Program RDL as warmup for 4 weeks.","Add 5-10% load per week on the DL.","Hold this load for 4 weeks; log every session."],
 maintain:["Hold L1: hip hinge check each session.","Hold L2: KB deadlift warmup weekly.","Hold L3: RDL in every leg session.","Hold L4: DL weekly minimum.","Hold L5: sustained practice across 4 weeks."]},

{name:"Squat Pattern", cat:"physical", rarity:"uncommon", fadeDays:60,
 setKey:"phys_u_strength_basics", synthesizedFrom:"phys_c_squat",
 unlockHint:"Master 5 Squat Commons to unlock.",
 why:"The squat is the primary lower-body movement pattern. Without correct mechanics — ankle dorsiflexion, knee tracking, neutral spine — load cannot be safely added.",
 howTo:"Start with a goblet squat (counterweight pulls chest up). Progress to front squat, then back squat. Depth before load.",
 safety:"Knees caving inward under load is the primary injury risk. Cue externally: 'spread the floor.'",
 levels:["Bodyweight squat to parallel with spine neutral and no heel rise","Goblet squat 2×10 with a 35lb KB — depth below parallel, chest up","Box squat below parallel 3×5 with an empty barbell (45lb) — controlled descent","Back squat 0.75× BW × 5 reps, depth below parallel, no good morning tendency","5 consecutive weeks of at least 2 squat sessions per week at 0.75× BW or above"],
 roadmap:["BW squat to parallel","goblet squat 2×10","box squat 3×5 bar","back squat 0.75×BW×5","5 weeks sustained"],
 advance:["10 air squats with pause at bottom daily.","Goblet squat 3×10 as squat warm-up for 2 weeks.","Box squat to set depth; remove box gradually.","Add load weekly to back squat.","Program 2 squat sessions per week for 5 weeks."],
 maintain:["Hold L1: air squats daily.","Hold L2: goblet squat in warm-up.","Hold L3: box squat weekly.","Hold L4: back squat weekly.","Hold L5: 2 squat sessions/week minimum."]},

{name:"Push Pattern", cat:"physical", rarity:"uncommon", fadeDays:60,
 setKey:"phys_u_strength_basics", synthesizedFrom:"phys_c_push",
 unlockHint:"Master 5 Push Commons to unlock.",
 why:"Horizontal pushing is the upper-body strength foundation. The push-up is the bodyweight standard; the bench press is the loaded test. Both require scapular stability and shoulder health.",
 howTo:"Push-up before bench. If push-up mechanics are wrong, bench press load amplifies the dysfunction. Learn to retract and depress scapulae, then load.",
 safety:"Flared elbows (>60° from torso) strain the AC joint. Teach the 45° tuck early.",
 levels:["10 strict push-ups with no sagging hips and full ROM","20 strict push-ups — elbows 45° from torso, chest to floor","Barbell bench press with 0.5× BW for 5 reps — correct arch, foot drive, retracted scaps","Bench press 0.75× BW × 5 with a spotter or safeties — no bar crash","5 consecutive weeks of 2 push sessions per week at 0.75×BW or above"],
 roadmap:["10 strict push-ups","20 strict push-ups","bench 0.5×BW×5","bench 0.75×BW×5","5 weeks sustained"],
 advance:["Daily 3×10 push-up practice.","Progress to elevated-feet push-ups.","Bench 3×5 at 50% BW for 4 weeks.","Add 5 lbs per session until 75% BW.","Schedule 2 push sessions/week for 5 weeks."],
 maintain:["Hold L1: push-ups in every warm-up.","Hold L2: daily push-up sets.","Hold L3: bench weekly.","Hold L4: bench twice per week.","Hold L5: 2 push sessions/week sustained."]},

{name:"Pull Pattern", cat:"physical", rarity:"uncommon", fadeDays:60,
 setKey:"phys_u_strength_basics", synthesizedFrom:"phys_c_pull",
 unlockHint:"Master 5 Pull Commons to unlock.",
 why:"Horizontal pulling balances the pushing and builds the upper back that directly supports every loaded carry, ruck, and deadlift. It's the most undertrained movement pattern in most programs.",
 howTo:"Dumbbell row first (easy setup, unilateral, teaches lat engagement). Then barbell row. Cue: pull elbows back, not hands. Feel lat, not bicep.",
 safety:"Bouncing the barbell off the floor rounds the lower back under load. Start with strict reps, no momentum.",
 levels:["Dumbbell single-arm row 3×10 at 30% BW — full ROM, no rotation","Bent-over barbell row 3×8 at 0.4× BW — spine neutral, bar touching abdomen","Barbell row 0.5× BW × 5 strict (no hip drive) for 3 sets","Chest-supported dumbbell row 3×12 at 40% BW per arm — scapular ROM","5 consecutive weeks of 2 pull sessions per week with progressive loading"],
 roadmap:["DB row 3×10","BB row 3×8 at 0.4×BW","BB row 0.5×BW×5","CS row 3×12","5 weeks sustained"],
 advance:["DB row 3×10 before every upper body session.","Progress weight weekly.","Add BB row to main lift.","Program CS row as accessory.","2 pull sessions/week for 5 weeks."],
 maintain:["Hold L1: DB row weekly.","Hold L2: BB row in program.","Hold L3: progressive overload on BB row.","Hold L4: CS row for scap health.","Hold L5: 2 pull sessions/week sustained."]},

{name:"Compound Integration", cat:"physical", rarity:"uncommon", fadeDays:60,
 setKey:"phys_u_strength_basics", synthesizedFrom:"phys_c_compound_int",
 unlockHint:"Master 5 Compound Integration Commons to unlock.",
 why:"Knowing each pattern in isolation is not the same as executing a full strength session. Compound integration is the ability to sequence hinge + squat + push + pull in one coherent training session with appropriate loading and sequencing.",
 howTo:"Learn the A/B session template: A = squat + horizontal push + vertical pull; B = hinge + horizontal pull + vertical push. Execute each once per week, then twice.",
 safety:"Fatigue compounds poor mechanics. End a set the moment form breaks, regardless of rep count.",
 levels:["Execute a complete A session (squat + bench + row) with no form breakdown across all sets","Execute a complete B session (DL + OHP + pull-up) with no form breakdown across all sets","Complete one A session and one B session in the same week for 4 consecutive weeks","Add 5 lbs to at least one lift per session for 8 consecutive weeks (linear progression phase)","Complete 12 weeks of A/B sessions without missing a session or regressing on any main lift"],
 roadmap:["complete A session","complete B session","A+B in same week × 4","LP 8 weeks","12-week completion"],
 advance:["Schedule A and B days for next 4 weeks.","Aim to add load at every session.","Log every session: date, lift, weight, reps.","Track for 8 weeks.","Commit to 12 weeks with no session skips."],
 maintain:["Hold L1: A session weekly.","Hold L2: B session weekly.","Hold L3: A+B in same week.","Hold L4: LP minimum weekly.","Hold L5: never miss 2 consecutive sessions."]}
```

### Set 2: phys_u_strength_power (5 Uncommons → "Power Development")

```js
// ---------- phys_u_strength_power → "Power Development" Rare ----------

{name:"Jump Training", cat:"physical", rarity:"uncommon", fadeDays:45,
 setKey:"phys_u_strength_power", synthesizedFrom:"phys_c_jump",
 unlockHint:"Master 5 Jump Commons to unlock.",
 why:"Vertical and broad jump are the clearest measures of lower-body power output. Jump training improves rate of force development — which transfers to every explosive athletic movement.",
 howTo:"Box jumps for height, broad jumps for distance, depth drops for reactive strength. Land softly — the eccentric (landing) is where adaptation happens.",
 safety:"Land with knees slightly bent, soft feet, and weight on mid-foot. Straight-leg landings under fatigue are the primary ACL risk.",
 levels:["Box jump to 20\" box from standing, 3×5 — controlled landing","Vertical leap ≥20\" (male) or ≥15\" (female) measured three times","Broad jump ≥5 ft (male) or ≥4 ft (female)","Complete 4 consecutive weeks of 2 jump sessions per week (3×5 each)","Box jump to 30\" (male) or 24\" (female) from a standstill"],
 roadmap:["box jump 20\"","vert ≥20\"/15\"","broad ≥5/4 ft","4 weeks 2× sessions","box jump 30\"/24\""],
 advance:["Box jump 3×5 before every leg session.","Measure vertical with wall mark weekly.","Add distance measurements to warm-up.","Schedule 2 jump sessions per week.","Raise box height by 2\" every 2 weeks."],
 maintain:["Hold L1: box jumps in warm-up.","Hold L2: vertical test monthly.","Hold L3: broad jump monthly.","Hold L4: jump sessions weekly.","Hold L5: max-height jump monthly."]},

{name:"Sprint Mechanics", cat:"physical", rarity:"uncommon", fadeDays:45,
 setKey:"phys_u_strength_power", synthesizedFrom:"phys_c_sprint",
 unlockHint:"Master 5 Sprint Commons to unlock.",
 why:"Sprinting is the highest-output locomotion pattern the body can produce. Technique matters because it determines how efficiently power reaches the ground — and prevents hamstring tears.",
 howTo:"Acceleration phase (0–20m): forward lean, high knees, full hip extension, arm drive. Top speed (20m+): upright torso, toe down at ground contact. Drill both phases separately.",
 safety:"Hamstring tears happen when the hip flexor fires before the hamstring is loaded. Warm up thoroughly, never sprint cold.",
 levels:["20m sprint from standing start in ≤3.5s (male) or ≤4.0s (female)","40m sprint from standing start in ≤6.0s (male) or ≤6.8s (female)","Film yourself sprinting from the side; identify your acceleration phase vs. top speed phase","Complete 4 consecutive weeks of sprint sessions (3-4×40m with full recovery)","10m sprint from starting position in ≤1.90s"],
 roadmap:["20m sprint time","40m sprint time","film self + identify phases","4 weeks of sprint sessions","10m in ≤1.90s"],
 advance:["Sprint 3×20m before every speed workout.","Time 40m twice per week.","Film a sprint session; self-analyze.","Schedule weekly sprint sessions for 4 weeks.","Reaction-start 10m sprints."],
 maintain:["Hold L1: 20m sprints in warm-up.","Hold L2: 40m timing monthly.","Hold L3: film review quarterly.","Hold L4: sprint sessions weekly.","Hold L5: 10m time monthly."]},

{name:"Ballistic Power", cat:"physical", rarity:"uncommon", fadeDays:45,
 setKey:"phys_u_strength_power", synthesizedFrom:"phys_c_ballistic",
 unlockHint:"Master 5 Ballistic Commons to unlock.",
 why:"Medicine ball throws, trap bar jumps, and jump squats develop the ability to apply maximal force in minimal time — the definition of power. They bridge strength and speed.",
 howTo:"Med ball slams, chest passes, and rotational throws for upper-body ballistics. Jump squats and trap bar jumps for lower. Always throw or jump with maximal intent — half-effort ballistic training is useless.",
 safety:"Maximal intent means the limiting factor should be power, not form. If form collapses first, the weight is too heavy.",
 levels:["Med ball slam 3×8 at 15lb (male) or 10lb (female) — maximal height each rep","Jump squat 3×5 with 20% BW on barbell — maximum height at top","Trap bar jump (if available) or jump squat 3×5 at 30% BW","Med ball chest pass measured: ≥18 ft (male) or ≥12 ft (female)","Complete 4 consecutive weeks of 2 ballistic sessions per week"],
 roadmap:["med ball slam 3×8","jump squat 20%BW","trap bar/JS 30%BW","med ball chest pass distance","4 weeks 2× sessions"],
 advance:["Add med ball slams before every conditioning session.","Jump squats at end of each leg warm-up.","Increase load on jump squats by 5% per week.","Measure chest pass distance monthly.","Program ballistic block 2× per week."],
 maintain:["Hold L1: med ball slams weekly.","Hold L2: jump squats in warm-up.","Hold L3: trap bar jumps in program.","Hold L4: chest pass test monthly.","Hold L5: 2 ballistic sessions/week."]},

{name:"Speed-Strength Training", cat:"physical", rarity:"uncommon", fadeDays:60,
 setKey:"phys_u_strength_power", synthesizedFrom:"phys_c_speed_strength",
 unlockHint:"Master 5 Speed-Strength Commons to unlock.",
 why:"Speed-strength is training heavy lifts as fast as possible — 50-70% 1RM, maximal bar speed. The contrast between heavy days (strength) and fast days (speed-strength) is the foundation of Westside and conjugate periodization.",
 howTo:"Dynamic effort method: 8-12 sets of 2-3 reps at 50-70% 1RM, moving the bar as fast as possible. Rest 60-90s between sets. The bar should be moving fast — not grinding.",
 safety:"Compensatory acceleration on a lift that gets too heavy becomes a regular strength lift. Drop weight rather than grind.",
 levels:["Complete a dynamic effort squat session: 8×2 at 50% 1RM, maximal bar speed","Complete a dynamic effort deadlift session: 8×1 at 60% 1RM, maximal pull speed","Measure bar velocity on a squat: achieve >0.8 m/s at 60% 1RM","Complete 4 consecutive weeks of dynamic effort sessions (1 squat + 1 DL per week)","Pair dynamic effort with maximal effort: 1 ME day + 1 DE day per lift group per week for 8 weeks"],
 roadmap:["DE squat 8×2 at 50%","DE DL 8×1 at 60%","bar velocity ≥0.8m/s","4 weeks DE sessions","ME+DE split 8 weeks"],
 advance:["Introduce DE squat once per week.","Introduce DE DL once per week.","Track bar velocity if VBT unit available.","Pair with ME week after week.","Program 8-week block."],
 maintain:["Hold L1: DE squat in program.","Hold L2: DE DL in program.","Hold L3: velocity tracking.","Hold L4: DE sessions weekly.","Hold L5: ME+DE split maintained."]},

{name:"Reactive Strength", cat:"physical", rarity:"uncommon", fadeDays:45,
 setKey:"phys_u_strength_power", synthesizedFrom:"phys_c_reactive",
 unlockHint:"Master 5 Reactive Strength Commons to unlock.",
 why:"Reactive strength is the ability to rapidly switch from absorbing force (landing) to producing force (takeoff) — the bounce in an ankle or knee. Measured by the Reactive Strength Index (RSI). Required for any team sport, obstacle course, and combat movement.",
 howTo:"Depth drops (fall off a box, absorb, immediately jump), pogo jumps (minimal ground contact), and bounding drills. RSI = jump height / ground contact time.",
 safety:"Ground contact time is the key variable. The moment a rep has slow ground contact, stop — you're building strength, not reactivity.",
 levels:["Pogo jumps: 10 consecutive jumps with ≤0.22s ground contact time (measured or estimated)","Depth drop from 12\" box: absorb and hold — no wobble, soft feet, knee tracking good","Depth jump from 12\" box: absorb and immediately jump as high as possible, 3×5","Bounding: 10m triple jump (3 bounds) covering ≥7m (male) or ≥5.5m (female)","4 consecutive weeks of reactive strength training 2×/week — RSI improving or maintained"],
 roadmap:["pogo jumps ≤0.22s contact","depth drop 12\"","depth jump 3×5","10m triple jump distance","4 weeks reactive training"],
 advance:["Pogo jump practice before conditioning.","Depth drops as landing quality drill.","Depth jumps on leg days.","Triple jump drills in sprint warm-up.","Block reactive work into program."],
 maintain:["Hold L1: pogo jumps in warm-up.","Hold L2: depth drops on leg days.","Hold L3: depth jumps weekly.","Hold L4: triple jump monthly.","Hold L5: reactive block each mesocycle."]}
```

### Set 3: phys_u_strength_accessory (5 Uncommons → "Accessory Work")

```js
// ---------- phys_u_strength_accessory → "Accessory Work" Rare ----------

{name:"Shoulder Health Work", cat:"physical", rarity:"uncommon", fadeDays:45,
 setKey:"phys_u_strength_accessory", synthesizedFrom:"phys_c_shoulder_health",
 unlockHint:"Master 5 Shoulder Health Commons to unlock.",
 why:"The shoulder is the most injury-prone joint in overhead athletes and lifters. Rotator cuff, serratus anterior, and lower trap work are not optional — they're what allow you to keep pressing and pulling for years without surgery.",
 howTo:"Band pull-aparts, face pulls, YTWs, and external rotation drills. 3×15–20 at the end of every upper body session. Light, controlled, full ROM.",
 safety:"Popping or clicking in the shoulder is not a warm-up sound — it's a warning. Stop pressing if you feel impingement.",
 levels:["Band pull-aparts 3×20 at the end of every pressing session for 4 weeks","YTW (3-position dumbbell raise) 3×10 at 5lb (male) or 3lb (female) — no trapping","Face pull 3×15 on cable machine — external rotation at top","Pass a basic shoulder screen: 90° internal/external rotation each arm, no pain on Neer/Hawkins test","Complete a 12-week shoulder health block (2×/week) with no shoulder pain during pressing movements"],
 roadmap:["band pull-aparts 4 weeks","YTW 3×10","face pull 3×15","pass shoulder screen","12-week block no pain"],
 advance:["Band pull-aparts at the end of every session.","Add YTWs to warm-up.","Add face pulls to cool-down.","Get screened by a trainer or PT.","Schedule 12-week shoulder health block."],
 maintain:["Hold L1: band pull-aparts every session.","Hold L2: YTWs in warm-up.","Hold L3: face pulls weekly.","Hold L4: shoulder screen annually.","Hold L5: health work in every block."]},

{name:"Posterior Chain Work", cat:"physical", rarity:"uncommon", fadeDays:45,
 setKey:"phys_u_strength_accessory", synthesizedFrom:"phys_c_hip_glute",
 unlockHint:"Master 5 Hip & Glute Commons to unlock.",
 why:"Glute weakness is the root cause of most low back pain, knee cave, and hip instability. The glutes are the largest muscles in the body and the primary driver of every hip extension movement.",
 howTo:"Hip thrusts, single-leg RDLs, lateral band walks, and clamshells. The glutes need direct work because heavy compound lifts often let the quads compensate.",
 safety:"Feel the glutes contracting, not the low back. If your back is doing the work in hip thrusts, the hips aren't extending fully.",
 levels:["Clamshells with mini band 3×20 each side — feel glute, not IT band","Hip thrust with barbell 3×8 at 0.75× BW — full hip extension at top, no back hyperextension","Single-leg RDL bodyweight 3×10 each side — balance and hip hinge quality","Single-leg hip thrust 3×8 each side","Complete 4 weeks of 2 posterior chain sessions per week"],
 roadmap:["clamshells 3×20","hip thrust 0.75×BW","SL-RDL BW 3×10","SL hip thrust 3×8","4 weeks 2× sessions"],
 advance:["Clamshells before every leg session.","Progress hip thrust weight weekly.","SL-RDL in every hip hinge warm-up.","SL hip thrust in leg day finisher.","2 posterior sessions/week for 4 weeks."],
 maintain:["Hold L1: clamshells in warm-up.","Hold L2: hip thrust weekly.","Hold L3: SL-RDL weekly.","Hold L4: SL hip thrust monthly.","Hold L5: 2 PC sessions/week."]},

{name:"Grip Strength", cat:"physical", rarity:"uncommon", fadeDays:30,
 setKey:"phys_u_strength_accessory", synthesizedFrom:"phys_c_grip",
 unlockHint:"Master 5 Grip Commons to unlock.",
 why:"Grip is the limiting factor in the deadlift, pull-up, ruck, and every carrying event. It fades faster than any other strength quality and requires direct training. The hands are the last point of contact with everything.",
 howTo:"Dead hangs, farmer carries, fat-bar training, and hand gripper work. Never use straps as a crutch on submaximal deadlifts — earn your grip.",
 safety:"Wrist pain during wrist curls is a warning. Check for carpal tunnel symptoms.",
 levels:["Dead hang from pull-up bar for 60 seconds — no kip, full relaxation","Farmer carry 0.5× BW per hand for 50m without setting down","Deadlift at 1.25× BW with double-overhand grip (no straps) for 3 reps","Hold a 45lb plate pinch in each hand simultaneously for 30 seconds","Complete 4 weeks of direct grip work 3×/week — dead hangs + farmer carries + gripper"],
 roadmap:["60s dead hang","farmer carry 0.5×BW 50m","DL 1.25×BW double-overhand","45lb plate pinch 30s","4 weeks direct grip work"],
 advance:["Dead hang at end of every pull session.","Farmer carry 1×/week.","Deadlift double-overhand weekly.","Plate pinch in warm-up.","3×/week grip work for 4 weeks."],
 maintain:["Hold L1: dead hang weekly.","Hold L2: farmer carry weekly.","Hold L3: double-overhand DL.","Hold L4: plate pinch monthly.","Hold L5: grip work 3×/week."]},

{name:"Core Basics", cat:"physical", rarity:"uncommon", fadeDays:30,
 setKey:"phys_u_strength_accessory", synthesizedFrom:"phys_c_core_basics",
 unlockHint:"Master 5 Core Basics Commons to unlock.",
 why:"The core is not about crunches. It's about anti-rotation, anti-extension, and anti-lateral-flexion — the ability to keep the spine rigid under load so that force transfers efficiently from legs through trunk to bar.",
 howTo:"Hollow body hold, plank (with active squeeze, not passive hang), Pallof press, and dead bug. All four patterns: plank = anti-extension; side plank = anti-lateral; Pallof = anti-rotation; hollow = integrated.",
 safety:"If you feel spinal compression in a plank, you're not bracing — you're sagging. Reset and try again at shorter duration.",
 levels:["Hollow body hold for 30 consecutive seconds — arms overhead, lower back pressed to floor","2-minute plank with rib cage pulled down and glutes squeezed — no hip drop","Pallof press: cable at 45lb × 3×10 each side — no rotation at torso","Dead bug: arm/leg extension 3×8 each side — lower back stays pressed to floor","Complete a 30-day core protocol (all 4 exercises, 3×/week) without missing a session"],
 roadmap:["hollow hold 30s","2-min plank","Pallof press 45lb 3×10","dead bug 3×8","30-day protocol"],
 advance:["Hollow hold at end of every warm-up.","Plank before every session.","Pallof press in every upper body day.","Dead bug as cool-down.","30-day 3×/week commit."],
 maintain:["Hold L1: hollow holds weekly.","Hold L2: plank daily.","Hold L3: Pallof press weekly.","Hold L4: dead bug weekly.","Hold L5: core protocol every block."]},

{name:"Vertical Pull Pattern", cat:"physical", rarity:"uncommon", fadeDays:45,
 setKey:"phys_u_strength_accessory", synthesizedFrom:"phys_c_vertical_pull",
 unlockHint:"Master 5 Vertical Pull Commons to unlock.",
 why:"Pull-ups and lat pulldowns develop the vertical pull pattern — lats, upper back, and biceps working together to pull from overhead. This is the most undertrained movement in most beginner programs.",
 howTo:"Dead hang pull-ups, not kipping. If you can't do 1 strict pull-up, use lat pulldown for months until you can. Focus on initiating with lat depression, not a bicep curl.",
 safety:"Partial reps don't build the shoulder health benefits of a full ROM pull-up. Dead hang at the bottom, chin over bar at the top.",
 levels:["1 strict dead-hang pull-up with full ROM (dead hang → chin over bar)","5 consecutive strict pull-ups, same standard","10 consecutive strict pull-ups","Lat pulldown 1× BW for 5 reps (demonstrates vertical pull strength independent of BW)","Complete 4 consecutive weeks of at least 2 vertical pull sessions per week"],
 roadmap:["1 strict pull-up","5 strict pull-ups","10 strict pull-ups","lat pulldown 1×BW×5","4 weeks 2× vertical pull sessions"],
 advance:["Negative pull-ups 3×5 until first full rep.","Progress reps week to week.","Test max reps monthly.","Add load once at 10+ BW reps.","2 vertical pull sessions/week for 4 weeks."],
 maintain:["Hold L1: pull-up in every session.","Hold L2: 5 pull-ups in warm-up.","Hold L3: 10 pull-ups standard.","Hold L4: lat pulldown weekly.","Hold L5: 2 vertical pull sessions/week."]}
```

### Set 4: phys_u_strength_programming (5 Uncommons → "Strength Periodization")

```js
// ---------- phys_u_strength_programming → "Strength Periodization" Rare ----------

{name:"1RM Testing", cat:"physical", rarity:"uncommon", fadeDays:90,
 setKey:"phys_u_strength_programming", synthesizedFrom:"phys_c_1rm",
 unlockHint:"Master 5 1RM Testing Commons to unlock.",
 why:"Without a tested 1RM, percentage-based programming is guesswork. Every serious strength program uses 1RM as the anchor. Testing it safely and repeatably is a distinct skill.",
 howTo:"Work up in sets of 3, then 2, then 1, extending rest time. Stop when bar speed slows dramatically. True 1RM = heaviest single with clean technique, no grinding for more than 4 seconds.",
 safety:"No 1RM testing when fatigued, sleep-deprived, or after a hard training week. Always test at the end of a deload.",
 levels:["Test 1RM on squat using the ramp protocol (3s → 2s → singles): record weight and note technique quality","Test 1RM on bench press using the same protocol","Test 1RM on deadlift using the same protocol","Estimate 1RM from a 3RM using Epley formula: 1RM ≈ 3RM × 1.033; compare to tested — within 5%","Test all three lifts in a single session within 2 hours; record: date, weight, technique notes, estimated recovery"],
 roadmap:["squat 1RM test","bench 1RM test","DL 1RM test","3RM→1RM estimate","all three in one session"],
 advance:["Test squat 1RM at end of a training block.","Test bench 1RM same day.","Test DL 1RM same day or next.","Calculate estimated 1RM from training sets.","Schedule full test day at end of mesocycle."],
 maintain:["Hold L1: squat 1RM test each cycle.","Hold L2: bench 1RM each cycle.","Hold L3: DL 1RM each cycle.","Hold L4: estimate 1RM monthly.","Hold L5: full test day at cycle end."]},

{name:"Percentage Training", cat:"physical", rarity:"uncommon", fadeDays:60,
 setKey:"phys_u_strength_programming", synthesizedFrom:"phys_c_progressive_overload",
 unlockHint:"Master 5 Progressive Overload Commons to unlock.",
 why:"Moving from 'lift more if it feels easy' to prescriptive percentage-based loading is the jump from beginner to intermediate training. It requires knowing your 1RM and trusting the process.",
 howTo:"5/3/1, Starting Strength, Texas Method. All use percentages. The key: resist the urge to add weight faster than prescribed. The program is smarter than you in the moment.",
 safety:"Training at 90%+ 1RM every session is how intermediate lifters plateau and get hurt. The submax volume is where adaptation happens.",
 levels:["Complete Week 1 of a 4-week percentage block (e.g., 5/3/1 Week 1: 3×5 at 65/75/85%)","Complete Week 2 (3×3 at 70/80/90%)","Complete Week 3 (3×1 at 75/85/95%)","Complete a full deload week at 60% — no going heavier because it 'feels easy'","Complete three full 4-week cycles of percentage-based programming without deviation"],
 roadmap:["Week 1 (65/75/85% 3×5)","Week 2 (70/80/90% 3×3)","Week 3 (75/85/95% 3×1)","deload week","3 complete cycles"],
 advance:["Set up 5/3/1 template with your current 1RM.","Run Week 1 exactly as written.","Run Week 2.","Run deload week.","Complete 3 cycles."],
 maintain:["Hold L1: percentage week monthly.","Hold L2: progressive weeks in program.","Hold L3: near-max week each cycle.","Hold L4: deload every 4th week.","Hold L5: 3 cycles per quarter."]},

{name:"Volume Prescription", cat:"physical", rarity:"uncommon", fadeDays:60,
 setKey:"phys_u_strength_programming", synthesizedFrom:"phys_c_volume",
 unlockHint:"Master 5 Volume Commons to unlock.",
 why:"Training volume (sets × reps × load) is the primary driver of hypertrophy and the limiting factor in recovery. Knowing how much is enough — and how much is too much — separates smart programming from grinding.",
 howTo:"Track weekly sets per muscle group. 10–20 sets per week is the effective range for most trained lifters. Below 10 = insufficient stimulus. Above 20 = likely exceeding recovery.",
 safety:"More is not always better. If you're always sore and never PR, you're in a volume hangover — reduce sets.",
 levels:["Track total weekly sets per main muscle group for 4 consecutive weeks — log into a spreadsheet or notebook","Reduce a muscle group from 20+ sets/week to 12–15 and hold for 3 weeks; observe recovery improvement","Increase a lagging muscle group from 8 sets to 16 sets over 3 weeks; observe growth response","Apply Mike Israetel's MEV/MAV/MRV framework: identify your MEV and MAV for one lift","Complete a 12-week volume-equated program where every muscle group hits 15–20 weekly sets consistently"],
 roadmap:["4 weeks tracking sets","reduce to 12-15 sets","increase lagging muscle","MEV/MAV identification","12-week equated program"],
 advance:["Start logging weekly sets per muscle.","Identify overstuffed and underdeveloped areas.","Adjust one direction at a time.","Research MEV/MAV/MRV for your level.","Build a 12-week volume-equated template."],
 maintain:["Hold L1: weekly set tracking ongoing.","Hold L2: reduce when needed.","Hold L3: increase lagging muscle periodically.","Hold L4: MEV/MAV annual review.","Hold L5: volume-equated program each cycle."]},

{name:"Deload Protocol", cat:"physical", rarity:"uncommon", fadeDays:45,
 setKey:"phys_u_strength_programming", synthesizedFrom:"phys_c_deload",
 unlockHint:"Master 5 Deload Commons to unlock.",
 why:"A deload is not a rest week — it's the week your body supercompensates from the accumulated training load. Athletes who skip deloads trade short-term gains for long-term plateaus. Deloading on schedule, even when you feel good, is the mark of a mature athlete.",
 howTo:"Reduce volume by 40-50%, keep intensity the same, and don't add a 'bonus session' to make up for it. The deload is the training.",
 safety:"'I feel great, I don't need to deload' is the most dangerous thought in strength training. Deload before you feel you need to.",
 levels:["Complete one planned deload week: same lifts, 60% of working sets, same intensity — no deviation","Complete deloads on schedule at the end of 3 consecutive training blocks (deload every 4th week)","Keep a recovery metric (sleep quality, soreness, HRV if tracked) during deload and record the trend","Use the deload as an active recovery week: add 15–20 min of low-intensity cardio on off days","Plan your next 12-week cycle so that deloads fall on high-stress weeks (exams, FTX, travel) and hard weeks fall on low-stress weeks"],
 roadmap:["one planned deload","3 consecutive deloads on schedule","recovery metric tracking","active recovery in deload","calendar-planned cycle"],
 advance:["Schedule deload in calendar before starting a block.","Execute exactly as written.","3 cycles with scheduled deloads.","Add light cardio in deload week.","Plan 12-week cycle around life calendar."],
 maintain:["Hold L1: deload each cycle.","Hold L2: scheduled deloads consistently.","Hold L3: track recovery during deload.","Hold L4: active recovery in deload.","Hold L5: calendar-planned deloads always."]},

{name:"Peaking Cycle", cat:"physical", rarity:"uncommon", fadeDays:90,
 setKey:"phys_u_strength_programming", synthesizedFrom:"phys_c_peak",
 unlockHint:"Master 5 Peaking Commons to unlock.",
 why:"Peaking is the process of reducing volume and increasing intensity over 2–4 weeks to express maximal strength on a specific day (a test, a competition, or an AFT). It's the advanced application of periodization.",
 howTo:"In the final 3 weeks before a peak day: Week 3 = moderate volume, high intensity (90–95%). Week 2 = reduced volume, same intensity. Week 1 = very low volume, test day only. Eat more. Sleep more.",
 safety:"Never introduce new exercises in a peak. Use only movements you know well and trust.",
 levels:["Execute a 3-week peak cycle: design the wave, execute it, and record the result","Peak to a successful deadlift 1RM test — PR or tie in a rested state","Peak to a successful AFT or physical test — planned, not just 'tested well that day'","Complete two peak cycles in one year — both producing new 1RM or performance records","Plan a peak cycle around a specific real event (AFT, powerlifting meet, or field test) with documented pre-peak planning"],
 roadmap:["design + execute 3-week peak","peak to DL 1RM test","peak to AFT or physical test","2 peaks in one year","planned peak around real event"],
 advance:["Design a 3-week peak wave with dates and target weights.","Execute it, then test.","Align next peak with AFT date.","Record outcome and adjust next cycle.","Plan all peaks at year start."],
 maintain:["Hold L1: peak cycle annually.","Hold L2: peak to DL test.","Hold L3: peak to AFT.","Hold L4: 2 peaks per year.","Hold L5: calendar-planned peaks."]}
```

### Set 5: phys_u_strength_recovery (5 Uncommons → "Recovery Science")

```js
// ---------- phys_u_strength_recovery → "Recovery Science" Rare ----------

{name:"Sleep Discipline", cat:"physical", rarity:"uncommon", fadeDays:21,
 setKey:"phys_u_strength_recovery", synthesizedFrom:"phys_c_sleep_protocol",
 unlockHint:"Master 5 Sleep Protocol Commons to unlock.",
 why:"Sleep is when adaptation happens. Growth hormone is secreted almost exclusively during deep sleep. Training without consistent sleep is like lifting with one hand tied behind your back.",
 howTo:"Set a fixed wake time. Work backward 8 hours for bedtime. Blackout curtains. Room temperature 65–68°F. No screen for 30 min before bed. Non-negotiable.",
 safety:"Chronic sleep deprivation below 6 hours increases injury risk by >60% in athletes. It's not toughness — it's deficit.",
 levels:["7+ hours of sleep for 7 consecutive days — log wake time and sleep time","7+ hours for 21 consecutive days — no exceptions for social reasons","Fixed wake time (±20 min) for 30 consecutive days","Sleep before 11pm for 30 consecutive days","Sustained: 7+ hrs sleep, fixed wake, pre-11pm bed — all three, for 60 consecutive days"],
 roadmap:["7h × 7 days","7h × 21 days","fixed wake ×30","pre-11pm ×30","all three ×60 days"],
 advance:["Set fixed wake time; log tonight.","Hold for 7 nights.","Extend to 21 nights.","Enforce bedtime.","60-day sustained protocol."],
 maintain:["Hold L1: 7h tracked weekly.","Hold L2: 21-day streak maintained.","Hold L3: wake time fixed.","Hold L4: bedtime enforced.","Hold L5: all three standards sustained."]},

{name:"Nutrition Timing", cat:"physical", rarity:"uncommon", fadeDays:30,
 setKey:"phys_u_strength_recovery", synthesizedFrom:"phys_c_nutrition_timing",
 unlockHint:"Master 5 Nutrition Timing Commons to unlock.",
 why:"Pre- and post-workout nutrition timing affects muscle protein synthesis and glycogen replenishment. It's not magic, but it compounds over months into meaningfully faster recovery.",
 howTo:"Pre-workout: 20-40g protein + complex carbs 60-90 min before training. Post-workout: 20-40g fast protein within 30-60 min. This is the anabolic window — real but smaller than gym bro lore suggests.",
 safety:"Eat whole food, not just supplements. The timing matters less than the totals. Hit your daily protein first, then worry about timing.",
 levels:["Eat a pre-workout meal within 2 hours before every training session for 2 weeks — log it","Consume 20-40g protein within 45 min of training end for 2 weeks — log it","Hit ≥0.7g protein per lb of BW per day for 14 consecutive days — log every day","Combine pre-workout + post-workout + daily protein target for 30 consecutive days","Sustain all three nutrition timing protocols for 60 consecutive days"],
 roadmap:["pre-workout meal × 14 days","post-workout protein × 14 days","daily protein target × 14 days","all three × 30 days","all three × 60 days"],
 advance:["Set calendar reminder for pre-workout meal.","Set post-workout shake/meal as habit.","Track daily protein for 14 days.","Combine all three.","Hold 60 days."],
 maintain:["Hold L1: pre-workout meal always.","Hold L2: post-workout protein always.","Hold L3: daily protein target always.","Hold L4: all three × 30 days.","Hold L5: all three × 60 days sustained."]},

{name:"Active Recovery", cat:"physical", rarity:"uncommon", fadeDays:21,
 setKey:"phys_u_strength_recovery", synthesizedFrom:"phys_c_active_rec",
 unlockHint:"Master 5 Active Recovery Commons to unlock.",
 why:"Active recovery — light movement, blood flow, and mobility work on off days — accelerates metabolite clearance and reduces DOMS better than passive rest. It requires its own training habit.",
 howTo:"20-30 min easy walking, Zone 1 cardio, or yoga on rest days. Not a workout — the goal is blood flow and parasympathetic activation, not training stimulus.",
 safety:"Active recovery that makes you sore is not recovery — it's extra training. Keep it under 60% max HR.",
 levels:["20-minute easy walk on one rest day per week for 4 weeks","Foam roll + 5 min dynamic stretch on every rest day for 2 consecutive weeks","Active recovery yoga session (20+ min) on at least one day per week for 4 weeks","At least one intentional active recovery session on every rest day for 4 consecutive weeks","Sustained: structured active recovery on all rest days for 8 consecutive weeks"],
 roadmap:["easy walk × 4 weeks","foam roll + stretch × 2 weeks","yoga × 4 weeks","active recovery every rest day × 4 weeks","all rest days × 8 weeks"],
 advance:["Add 20-min walk on next rest day.","Foam roll as daily habit.","Add yoga session weekly.","Active recovery every rest day.","8-week sustained habit."],
 maintain:["Hold L1: rest day walks.","Hold L2: foam roll daily.","Hold L3: yoga weekly.","Hold L4: structured active recovery.","Hold L5: all rest days covered."]},

{name:"HRV Fundamentals", cat:"physical", rarity:"uncommon", fadeDays:21,
 setKey:"phys_u_strength_recovery", synthesizedFrom:"phys_c_hrv",
 unlockHint:"Master 5 HRV Commons to unlock.",
 why:"Heart Rate Variability (HRV) is the most validated objective marker of recovery status available without a lab. A morning HRV reading below your baseline predicts reduced performance and elevated injury risk. Using it requires understanding what you're measuring.",
 howTo:"Take a 5-minute morning HRV reading every day for 4 weeks using a validated app (HRV4Training, Polar, Garmin). Compare to your 7-day rolling average, not an absolute number. Your baseline is yours, not a norm.",
 safety:"HRV responds to everything — alcohol, poor sleep, illness, travel. A single low reading is not a crisis. A trend of 5+ consecutive low days is.",
 levels:["Explain what HRV measures (ANS balance, vagal tone, recovery readiness) — write 3 sentences from memory","Take a morning HRV reading 5 consecutive days using the same protocol — same time, same device","Build a 7-day rolling average baseline; identify your personal normal range","Log HRV for 21 consecutive days; correlate 3 low-HRV mornings with subjective recovery","Adjust training based on HRV for 14 consecutive days: deload or reduce intensity when HRV is >10% below baseline"],
 roadmap:["explain HRV","5 consecutive readings","7-day baseline","21-day log + correlation","14 days HRV-guided training"],
 advance:["Write HRV explanation from memory.","Set daily HRV alarm for 5 days.","Track for 7 days and compute average.","Extend to 21 days.","Act on HRV data for 14 days."],
 maintain:["Hold L1: HRV knowledge current.","Hold L2: morning readings consistent.","Hold L3: baseline current.","Hold L4: log ongoing.","Hold L5: HRV-guided training standard."]},

{name:"Stress Load Balance", cat:"physical", rarity:"uncommon", fadeDays:21,
 setKey:"phys_u_strength_recovery", synthesizedFrom:"phys_c_stress_balance",
 unlockHint:"Master 5 Stress Balance Commons to unlock.",
 why:"Training stress and life stress share the same recovery pool. A week of field exercises, finals, or a difficult relationship is physiologically equivalent to extra training load. Failing to account for life stress when programming is why athletes burn out and get injured.",
 howTo:"Perceived exertion of life stress: rate your total stress load 1-10 daily. When life stress >6, training intensity should decrease proportionally. The formula: Training + Life = Total Load; Total Load > Capacity = Overreach.",
 safety:"High life stress + maximal training = overreach within 2 weeks. You don't get to train hard through everything.",
 levels:["Rate perceived life stress (1-10) every day for 14 days — log it alongside training","Identify 2 weeks in 14 days where life stress was ≥7 and note whether training performance suffered","Reduce training volume by 30% during a high-stress week and document recovery effect","Build a stress management plan for your highest-load calendar period (finals, FTX, field rotation)","Apply the full load balance model for 8 consecutive weeks: daily stress rating, training adjustment, recovery outcome log"],
 roadmap:["14 days stress rating","2 high-stress correlations","reduce volume during high stress","stress management plan","8-week load balance model"],
 advance:["Start daily stress log today.","Review 14 days.","Act on a high-stress week.","Build a plan for your next hard period.","8-week full model."],
 maintain:["Hold L1: daily stress rating.","Hold L2: correlation awareness.","Hold L3: volume reduction protocol.","Hold L4: planning for hard periods.","Hold L5: full balance model sustained."]}
```

---

## Feature 2 — Synthesis Chain View (UI)

A collapsible panel on each path deck showing the complete pyramid with progress at every level. This is the "map of the path" — so Wyatt can see, at a glance, how far up the pyramid he is and what's left.

**Value:** Right now there's no way to visualize the full synthesis chain. A player with 4/5 Rare sets started needs to know what Legendaries are in reach and what Commons are still needed. This view provides that.

**Implementation:**

`src/tabs/skills.js` — add a `renderSynthesisChain(cat)` function and a toggle button in the deck header.

```js
function renderSynthesisChain(cat){
  // Walk the seed data and build a tree: mythic → legendaries → rares → uncommons → commons
  const seeds=(typeof SEED_SKILLS!=="undefined"?SEED_SKILLS:[]).filter(s=>s.cat===cat&&(s.synthesizedFrom||s.setKey));
  const mythic=seeds.find(s=>s.rarity==="mythic"&&s.synthesizedFrom);
  if(!mythic) return '<div class="synth-chain-empty">No synthesis chain defined for this path yet.</div>';

  const getLive=(name)=>(S.lifeSkills||[]).find(s=>s.name===name&&s.cat===cat);
  const isStarted=(name)=>{ const l=getLive(name); return l&&l.currentLevel>0; };
  const isMaxed=(name)=>{ const l=getLive(name); return l&&l.levels&&l.currentLevel>=l.levels.length; };
  const setCount=(setKey)=>{
    const members=seeds.filter(s=>s.setKey===setKey&&!s.group);
    const mastered=members.filter(s=>isMaxed(s.name)).length;
    return {total:members.length, mastered, started:members.filter(s=>isStarted(s.name)).length};
  };

  const legends=seeds.filter(s=>s.setKey===mythic.synthesizedFrom&&s.rarity==="legendary");
  const rows=legends.map(leg=>{
    const lc=setCount(leg.synthesizedFrom||"");
    const rares=seeds.filter(s=>s.setKey===leg.synthesizedFrom&&s.rarity==="rare");
    const rareRows=rares.map(r=>{
      const rc=setCount(r.synthesizedFrom||"");
      const status=isMaxed(r.name)?'maxed':isStarted(r.name)?'started':rc.mastered>=rc.total&&rc.total>0?'ready':'locked';
      return `<div class="sc-rare sc-${status}">
        <span class="sc-icon">${status==='maxed'?'★':status==='started'?'▶':status==='ready'?'⚡':'🔒'}</span>
        <span class="sc-name">${esc(r.name)}</span>
        <span class="sc-prog">${rc.mastered}/${rc.total} U</span>
      </div>`;
    }).join('');
    const legStatus=isMaxed(leg.name)?'maxed':isStarted(leg.name)?'started':lc.mastered>=lc.total&&lc.total>0?'ready':'locked';
    return `<details class="sc-legend sc-${legStatus}">
      <summary>
        <span class="sc-icon">${legStatus==='maxed'?'★':legStatus==='started'?'▶':legStatus==='ready'?'⚡':'🔒'}</span>
        <span class="sc-name">${esc(leg.name)}</span>
        <span class="sc-prog">${lc.mastered}/${lc.total} Rares mastered</span>
      </summary>
      <div class="sc-rares">${rareRows}</div>
    </details>`;
  }).join('');

  const mythicStatus=isMaxed(mythic.name)?'maxed':isStarted(mythic.name)?'started':'locked';
  return `<div class="synth-chain">
    <div class="sc-mythic sc-${mythicStatus}">
      <span class="sc-icon">✦</span><span class="sc-name">${esc(mythic.name)}</span>
      <span class="sc-prog">${legends.filter(l=>isMaxed(l.name)).length}/${legends.length} Legendaries</span>
    </div>
    <div class="sc-legends">${rows}</div>
  </div>`;
}
```

Wire into each deck: in the deck header, add a `<button class="sc-toggle" data-sctoggle="${cat}">⛓ Chain</button>`, and after the deck body add `<div class="sc-wrap" id="sc-${cat}" style="display:none"></div>`. In the click delegation, handle `data-sctoggle` to toggle display and call `renderSynthesisChain(cat)` into the wrap.

**CSS:**
```css
.sc-toggle{font-size:.55rem;padding:.2rem .4rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#ccc;border-radius:.25rem;cursor:pointer;margin-left:auto}
.synth-chain{padding:.5rem .25rem}
.synth-chain-empty{font-size:.7rem;color:var(--ink-faint);padding:.5rem}
.sc-mythic{display:flex;align-items:center;gap:.4rem;padding:.4rem .5rem;background:rgba(255,215,0,.12);border:1px solid rgba(255,215,0,.3);border-radius:.4rem;margin-bottom:.5rem}
.sc-legend{margin-bottom:.3rem}
.sc-legend summary{display:flex;align-items:center;gap:.4rem;padding:.3rem .4rem;background:rgba(171,71,188,.1);border:1px solid rgba(171,71,188,.25);border-radius:.3rem;cursor:pointer;list-style:none}
.sc-legend summary::-webkit-details-marker{display:none}
.sc-rares{padding:.25rem 0 .25rem 1rem;display:flex;flex-direction:column;gap:.2rem}
.sc-rare{display:flex;align-items:center;gap:.35rem;padding:.25rem .4rem;background:rgba(30,100,200,.1);border:1px solid rgba(30,100,200,.2);border-radius:.25rem;font-size:.68rem}
.sc-name{flex:1;font-size:.7rem;font-weight:600}
.sc-prog{font-size:.58rem;color:var(--ink-faint);white-space:nowrap}
.sc-icon{font-size:.75rem;flex:none}
.sc-maxed .sc-icon{color:var(--gold)}
.sc-started .sc-icon{color:var(--jade)}
.sc-ready .sc-icon{color:var(--gold);animation:pulse .8s ease-in-out infinite alternate}
.sc-locked .sc-icon{color:#555}
```

---

## Feature 3 — Synthesis-Ready Alert on Dawn Tab

When any set has all 5 members mastered and the synthesis card isn't yet unlocked, show an alert in the Today tab Field Notes row — same urgency as a fading skill alert.

**Value:** Wyatt shouldn't have to check the Skills tab to know when a synthesis is ready. Push it to Dawn where it's seen daily.

**Implementation:**

`src/tabs/today.js` — add to the Field Notes block (near the existing skill-of-the-day row):

```js
// Synthesis ready checks — any set with all members mastered but card not yet unlocked
if(typeof SEED_SKILLS!=="undefined" && typeof skSetCanCombine==="function"){
  const synthReady=[];
  const seenSynths=new Set();
  SEED_SKILLS.forEach(seed=>{
    if(!seed.synthesizedFrom||seenSynths.has(seed.synthesizedFrom)) return;
    seenSynths.add(seed.synthesizedFrom);
    const target=SEED_SKILLS.find(s=>s.synthesizedFrom===seed.synthesizedFrom&&!s.setKey);
    // Actually find the synthesis target: the card synthesizedFrom this setKey
    const synthSeed=SEED_SKILLS.find(s=>s.synthesizedFrom===seed.synthesizedFrom&&typeof s.setKey==="undefined");
    // Wait — synthesis target is the card WHERE synthesizedFrom === setKey of this set
    // Already handled below
  });
  // Cleaner approach: find all seeds that have synthesizedFrom pointing to a set
  const synthTargets=SEED_SKILLS.filter(s=>s.synthesizedFrom&&!s.setKey);
  synthTargets.forEach(target=>{
    const live=(S.lifeSkills||[]).find(s=>s.name===target.name&&s.cat===target.cat);
    if(live&&live.synthesisUnlocked) return; // already unlocked
    if(skSetCanCombine(target.synthesizedFrom)){
      synthReady.push(target.name);
    }
  });
  if(synthReady.length){
    notes.push(`<div class="fn-row sk-synth-ready-row"><span class="fn-dot">⚡</span><span><b>Synthesis ready:</b> ${synthReady.slice(0,2).map(n=>esc(n)).join(', ')}${synthReady.length>2?` +${synthReady.length-2} more`:''}. Open Skills to combine.</span><button class="td-go-sm" data-gototab="skills">Skills →</button></div>`);
  }
}
```

**CSS:**
```css
.sk-synth-ready-row{background:rgba(255,215,0,.08);border-left:3px solid var(--gold);border-radius:.2rem;padding-left:.4rem}
```

---

## Feature 4 — Common Framework Documentation (No Code)

Commons (625 per path) will be added in v132–v136. Each Uncommon added in this session references a `synthesizedFrom` Common setKey (e.g., `"phys_c_hip_hinge"`). Before those sessions, the face-down card for each Uncommon will show "0/5 mastered" — which is correct and honest.

When Commons are added, they need only:
- `name`, `cat:"physical"`, `rarity:"common"`, `fadeDays: 14–30`
- `setKey:"phys_c_[descriptor]"` matching what their Uncommon `synthesizedFrom` references
- 3–4 level ladder (short; Commons are simple drills)
- `why`, `howTo`, one-line `roadmap` and `advance`/`maintain` arrays

Commons do NOT need `synthesizedFrom` — they are the base of the pyramid.

The naming convention for all Physical Commons:
```
phys_c_hip_hinge         (5 Commons → "Hip Hinge Mastery" Uncommon)
phys_c_squat             (5 Commons → "Squat Pattern" Uncommon)
phys_c_push              (5 Commons → "Push Pattern" Uncommon)
phys_c_pull              (5 Commons → "Pull Pattern" Uncommon)
phys_c_compound_int      (5 Commons → "Compound Integration" Uncommon)
phys_c_jump              (5 Commons → "Jump Training" Uncommon)
phys_c_sprint            (5 Commons → "Sprint Mechanics" Uncommon)
phys_c_ballistic         (5 Commons → "Ballistic Power" Uncommon)
phys_c_speed_strength    (5 Commons → "Speed-Strength Training" Uncommon)
phys_c_reactive          (5 Commons → "Reactive Strength" Uncommon)
phys_c_shoulder_health   (5 Commons → "Shoulder Health Work" Uncommon)
phys_c_hip_glute         (5 Commons → "Posterior Chain Work" Uncommon)
phys_c_grip              (5 Commons → "Grip Strength" Uncommon)
phys_c_core_basics       (5 Commons → "Core Basics" Uncommon)
phys_c_vertical_pull     (5 Commons → "Vertical Pull Pattern" Uncommon)
phys_c_1rm               (5 Commons → "1RM Testing" Uncommon)
phys_c_progressive_overload (5 Commons → "Percentage Training" Uncommon)
phys_c_volume            (5 Commons → "Volume Prescription" Uncommon)
phys_c_deload            (5 Commons → "Deload Protocol" Uncommon)
phys_c_peak              (5 Commons → "Peaking Cycle" Uncommon)
phys_c_sleep_protocol    (5 Commons → "Sleep Discipline" Uncommon)
phys_c_nutrition_timing  (5 Commons → "Nutrition Timing" Uncommon)
phys_c_active_rec        (5 Commons → "Active Recovery" Uncommon)
phys_c_hrv               (5 Commons → "HRV Fundamentals" Uncommon)
phys_c_stress_balance    (5 Commons → "Stress Load Balance" Uncommon)
```

---

## v127 Build Checklist

```bash
# In src/core/skills-data.js: add 25 Strength Uncommons after Athletic Locomotion
# In src/tabs/skills.js: add renderSynthesisChain() + Chain toggle in deck header
# In src/tabs/today.js: add synthesis-ready alert in Field Notes block
# In src/styles/main.css: add synth-chain CSS

python scripts/build.py    # must say OK
npm run check              # SYNTAX OK
npm run regress            # PAGEERRORS 0 — skill audit total will be 245

# Bump SKILL_LADDER_VER to 97 in src/core/migration.js
# Bump SW to operations-v127 in sw.js
npm run package
```

---

## Version notes

- **SW:** `operations-v127`
- **SKILL_LADDER_VER:** 97 (Uncommon ladders added)
- **Total skills after v127:** ~245 (220 + 25 Strength Uncommons)
- **Next session (v128):** Physical Endurance Uncommons (25 seeds) + Composition Uncommons (25 seeds)
