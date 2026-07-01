Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity
3. `planning/IMPROVEMENTS-v145.md` — the features to implement this session, with full rationale, implementation sketches, and CSS snippets
4. `planning/IMPROVEMENTS-skills-expansion.md` — the comprehensive skills backlog (60+ new skills across all paths, with ladder sketches and tier names); consult this whenever adding skills so you don't duplicate effort or miss obvious gaps

**Read `IMPROVEMENTS-v145.md` in full before writing a single line of code.** It is the authoritative spec for everything below. The implementation sketches, CSS, and data structures in that file are the designs to follow — do not improvise around them.

**Current version: v144.** The service worker is at `operations-v144` in `sw.js`. `SKILL_LADDER_VER` is currently **113** (in `src/core/migration.js`).

---

## What's already done

Full history is in `planning/FINISHED-FEATURES.md`. Do not re-implement anything listed there. Current skill total: **1648**.

### Pyramid state (the active multi-session workstream)

The app has a card-game pyramid system where skills form a 5-tier synthesis chain: Common → Uncommon → Rare → Legendary → Mythic. All 10 paths now have complete pyramid builds through the Uncommon layer:

**Physical pyramid — complete through Uncommon layer (v126–v130, extended v143):**
- 1 Mythic, 6 Legendaries (incl. new Close-Quarters Combat Mastery from v143), 30 Rares (incl. AFT Mastery, Soldier Fitness Standards, Field Physical Readiness, CQC Striking, CQC Grappling from v143), 125+ Uncommons across clusters. All Uncommons have `synthesizedFrom:"phys_c_*"` for future Common layer.
- Misc deck: `phys_misc` Rare header created (Flexibility & mobility, Gymnastics/bodyweight, Strength programming, Restraint/detain)

**Tactical pyramid — complete through Uncommon layer (v131–v135):**
- 1 Mythic ("Tactical Mastery"), 5 Legendaries, 25 Rares, 125 Uncommons across 5 clusters. All Uncommons have `synthesizedFrom:"tac_c_*"`.
- Misc deck: `tac_misc` Rare header created (10 core tactical skills including Land navigation, Marksmanship, Tactical movement, TLPs, Radio, TCCC, Fieldcraft, CBRN, Military law, Battle drills). Land navigation 8L duplicate deleted.

**Leadership pyramid — complete through Uncommon layer (v135):**
- 1 Mythic ("Battlefield Commander"), 5 Legendaries, 25 Rares, ~121 Uncommons across 5 clusters. All have `synthesizedFrom:"lead_c_*"`.
- Misc deck: `lead_misc` Rare header created (Parliamentary procedure, Negotiation & influence, Project management)

**Technical pyramid — complete through Uncommon layer (v136):**
- 1 Mythic ("Cyberspace Operations Officer"), 5 Legendaries, 25 Rares, 125 Uncommons across 5 clusters. All Uncommons have `synthesizedFrom:"tech_c_*"`.
- Misc deck: `tech_misc` Rare header created (Web application development, Malware analysis, Reverse engineering)

**Cognitive pyramid — complete through Uncommon layer (v137):**
- 1 Mythic ("Master of the Mind"), 5 Legendaries, 25 Rares, ~124 Uncommons across 5 clusters. All Uncommons have `synthesizedFrom:"cog_c_*"`.
- Misc deck: `cog_misc` Rare header created (Memory technique, Memory retention, Typing speed & accuracy, Second language retention)

**Physiological pyramid — complete through Uncommon layer (v138), Stress Physiology wired v143:**
- 1 Mythic ("Vital Operator"), 5 Legendaries (Stress Physiology now wired as 5th with `setKey:"phys2_leg", synthesizedFrom:"phys2_r_stress"`), 25 Rares, 125 Uncommons across 5 clusters. All Uncommons have `synthesizedFrom:"phys2_c_*"`.

**Academic pyramid — complete through Uncommon layer (v139):**
- 1 Mythic ("Scholar-Warrior"), 5 Legendaries, 25 Rares, 125 Uncommons across 5 clusters. All Uncommons have `synthesizedFrom:"acad_c_*"`. 17 existing academic skills wired.

**Personal pyramid — complete through Uncommon layer (v140):**
- 1 Mythic ("Sovereign Self"), 5 Legendaries, 25 Rares, 125 Uncommons across 5 clusters. All Uncommons have `synthesizedFrom:"pers_c_*"`. 20 existing personal skills wired.
- Misc deck: `pers_misc` Rare header created (Personal finance)

**Hearth pyramid — complete through Uncommon layer (v141):**
- 1 Mythic ("Keeper of the Flame"), 5 Legendaries, 25 Rares, ~119 Uncommons across 5 clusters. All Uncommons have `synthesizedFrom:"hearth_c_*"`. 6 existing hearth skills wired.

**Roots pyramid — complete through Uncommon layer (v142):**
- 1 Mythic ("The Living Root"), 5 Legendaries, 25 Rares, ~122 Uncommons across 5 clusters. All Uncommons have `synthesizedFrom:"roots_c_*"`. 6 existing roots skills wired.

**v143 Straggler Audit — COMPLETE:**
- All 63 stragglers across 7 paths assigned to clusters or misc decks
- Zero stragglers remain (badCount:0 confirmed by regress)
- 6 new Rare/Legendary seeds inserted for physical CQC + AFT + Soldier Strength + Field Readiness clusters
- 6 misc Rare headers created (phys, tac, lead, tech, cog, pers)

**v144 Misc Deck Elimination + Soldier Athlete Mythic — COMPLETE:**
- All 6 misc decks eliminated; every skill now in a proper synthesis chain
- 10 new Uncommon seeds generated to fill sets to 5 (Yoga & mindful movement; Conflict resolution & mediation; Resource management; Vulnerability research; Penetration testing methodology; Cognitive flexibility & task-switching; Career planning & development; Legal literacy; Healthcare navigation; Side income & entrepreneurship)
- 8 new Rare seeds: Movement Arts (physb), Field Operations Mastery (tac), Combat Task Mastery (tac), Leadership Operations (lead), Advanced Cyber Tradecraft (tech), Cognitive Enhancement Toolkit (cog), Life Administration (pers)
- 9 new Legendary seeds: Army Fitness Excellence, Physical Versatility (physb_leg); Soldier Fundamentals (tac_leg); Organizational Excellence (lead_leg); Cyber Operations Mastery (tech_leg); Cognitive Versatility (cog_leg); Life Mastery (pers_leg)
- Soldier Athlete Mythic added (physb_mythic) — 3 Legendaries: CQC Mastery, Army Fitness Excellence, Physical Versatility
- Tactical, Leadership, Technical, Cognitive, Personal Mythics updated to "6 Legendaries"
- Total skills after v144: **1667**

**Active workstream:** Commons layer for all paths (v145+).

**Session sequence:**
- v142: roots path ✓ done
- v143: full pyramid audit + straggler cleanup + misc deck creation ✓ done
- v144: misc deck elimination + Soldier Athlete Mythic ✓ done
- v145: Physical path Commons (125 seeds — 25 Uncommon sets × 5 Commons each) ← **this session**
- v146+: Commons for remaining paths

---

## Features to implement this session

*See `planning/IMPROVEMENTS-v144.md` for the full spec.*

**This session goal:** Pyramid structural repair — every Mythic must have exactly 5 Legendaries → 25 Rares → 125 Uncommons before Commons work begins. Full spec in `planning/IMPROVEMENTS-v145.md`.

Summary of work:
- Fix 2 missing Uncommons in Vital Operator
- Revert 5 Mythic unlockHints from "6" back to "5 Legendaries"
- Move 5 "6th Legendaries" (Soldier Fundamentals, Organizational Excellence, Cyber Operations Mastery, Cognitive Versatility, Life Mastery) from their current `X_leg` setKey to new `X2_leg` setKey
- Fill all Legendary clusters to 5 Rares (28 new Rares: 19 for the moved Legendaries, 9 for Soldier Athlete)
- Write 5 Uncommons for every new Rare (140 Uncommons)
- Write 5 Uncommons for existing Soldier Athlete physb Rares that have 0 (50 Uncommons)
- Seed 5 new Mythics + 20 new Legendaries + 100 new Rares + as many of the 500 new Uncommons as the session allows

At the end of the session, write `planning/IMPROVEMENTS-v146.md` for continued pyramid repair or the first Commons session (whichever is appropriate).

---

## How to work — the exact process used every session

Follow this exactly, in order:

### Throughput expectation
**Each session targets 100–200 new skills.** The improvements doc specifies multiple clusters or entire path layers per session — not a single 25-skill cluster. Do not stop after the first cluster. The total skill goal is 1000+; getting there requires batching aggressively.

### Phase 0 — Orient before writing a single line
1. Read `CLAUDE.md`, `planning/FINISHED-FEATURES.md`, and `planning/IMPROVEMENTS-v144.md` in full.
2. For each cluster or feature block, read the **specific source files** that will be touched before editing them:
   - Grep `src/core/skills-data.js` for existing skills in the relevant cat before writing seeds.
   - Use `Read` with `offset` + `limit` to read the exact surrounding code.
   - Never edit a file you haven't read in this session — the Edit tool will reject it and you'll break context.
3. Use `TodoWrite` to lay out all tasks as `pending` before starting any of them. One task per cluster/block, not per file.

### Phase 1 — Implement one cluster at a time
4. Mark the first cluster task `in_progress`.
5. Edit source files in `src/` only — **never touch `index.html`**.
6. For each file edit: read the relevant block first, make a surgical diff. Match existing code style exactly (terse, no framework, small helpers).
7. After all edits for a cluster: mark the task `completed` immediately. Move to the next cluster without stopping to build (build at phase 2).
8. Repeat until all clusters in the improvements doc are complete.

### Phase 2 — Build and verify (once per session, or after every 50–75 skills)
9. `python scripts/build.py` — assemble `index.html`. Must print `OK index.html`.
10. `npm run check` — syntax-check the assembled script. Must print `SYNTAX OK`.
11. `npm run regress` — headless 18-tab test. Must print `PAGEERRORS 0`. Fix any pageerrors before continuing.
12. If a build or check fails: read the error, find the source file that's wrong, fix it, rebuild.

### Phase 3 — Ship
13. Bump `sw.js`: `operations-v144` → `operations-v145` (increment once per session; increment again if you ship a second batch).
14. Bump `SKILL_LADDER_VER` in `src/core/migration.js` (currently **113**) if any ladder changed.
15. `npm run package` — produces `dist/operations.zip`. Must complete without error.
16. Delete the now-implemented improvements doc: `rm planning/IMPROVEMENTS-v145.md`. It has been recorded in `FINISHED-FEATURES.md` — no need to keep the draft.
17. **Create the next session's improvements doc** — write `planning/IMPROVEMENTS-v146.md` for the next batch.
18. **Update `NEXT-SESSION-PROMPT.md`** — change every `v144`/`v145` reference to the new version numbers so the next session prompt is self-consistent.
19. Tell Wyatt to **hard-refresh / reopen the app** so the new service worker activates and any migrations run.

### What not to do
- Don't read reference docs and then skip reading the actual source files — the code is what matters.
- Don't stop after one cluster and call it done — the improvements doc specifies multiple clusters per session.
- Don't add error handling, fallbacks, or validation for scenarios that can't happen.
- Don't add comments explaining what the code does — only the why if it's non-obvious.
- Don't restructure or reformat unrelated code while making a targeted change.

---

## Required workflow summary

```bash
# After every feature or batch of changes:
python scripts/build.py       # must say OK
npm run check                 # must say SYNTAX OK
npm run regress               # must say PAGEERRORS 0

# After all features, before reporting done:
# bump sw.js: operations-v143 → operations-v144
npm run package               # produces dist/operations.zip
```

---

## Key architecture reminders

- `index.html` is **assembled output** — edit `src/`, then build
- All data in `localStorage["operations_v2"]` via `S = load()`; `DEFAULT` is in `src/core/constants.js`
- `skLeafColor(eff, max, sk?)` → `rgb(r,g,b)` string; optional `sk` returns amber if at-risk
- `skEffectiveLevel(sk)` → working level accounting for decay + 20% grace, floors at 1 if started
- `skFadeState(sk)` → `"current" | "at-risk" | "decayed"`
- `skDaysLeft(sk)` → days until actual decay (after grace); null if not started
- `skPractice(skId)` → resets fade timer without level change (non-auto, started skills only)
- `skReachLevel(skId, targetLevel, note?)` → levels up to targetLevel, stores optional note in history
- `skEmblemSvg(sk, eff, max)` — sigil generator in `skills.js`, also used in `trophies.js`
- `miniSparkline(values, w, h)` — small SVG sparkline, defined in `state.js`
- `toast(msg)` — bottom toast, defined in `events.js`
- `PATH_META` — path metadata (name, icon, color, world, lore), in `constants.js`
- `SK_PATH_ICON` — path → emoji map, in `tree.js`
- `renderBosses()` lives in `src/core/state.js` (not a dedicated bosses.js)
- All CSS in `src/styles/main.css` — no per-tab CSS files
- Regression covers **18 tabs** (see `scripts/regress.js`)
- No network calls, no CDN fonts, no telemetry — ever

**Pyramid system:**
- `skRarity(sk)` — rarity from explicit `rarity` field or ladder depth (≤4 Common, 5-7 Uncommon, 8-10 Rare, 11-13 Legendary, 14+ Mythic, auto/joker Joker)
- `skSeedOf(name, cat)` — find a skill's seed in SEED_SKILLS
- `skSetMembers(setKey)` — all non-group seeds with matching setKey
- `skSetMasteredCount(setKey)` / `skSetCanCombine(setKey)` — set progress
- `skCombineSet(setKey)` — sets `synthesisUnlocked=true`, saves, renders
- `SYNERGY_PAIRS` — 15 complementary skill pairs; `skHasSynergy(sk)` — partner at L4+?
- Seeds use: `rarity`, `setKey`, `synthesizedFrom`, `unlockHint` fields
- Live skills use: `synthesisUnlocked` (boolean, the only pyramid field on live data)
- Live skills use: `pyramidResetApplied` (int, set once when skill first gains setKey — prevents re-wipe)
- Side Deck (unstarted leaves): collapsible `<details class="sk-side-deck">` in `skills.js`
- Face-down card function: `faceDownCard(sk, suit, rank, isSynthPending)` in `skills.js`
- Combine button handler: `data-skcombine` in `events.js` delegation
- Chain view: `renderSynthesisChain(cat)` in `skills.js`; toggle `.sc-toggle[data-sctoggle]` wired post-render; output in `.sc-wrap#sc-{cat}`

**Existing skill integration rule (applies every session that builds out a path cluster):**
When arriving at a new cluster, first grep existing `SEED_SKILLS` for that `cat` and audit ladder depths. Assign each existing skill that fits by adding `setKey` (and if needed `rarity` or `synthesizedFrom`) directly to its seed object. Rules:
- Existing skills fill slots, not complete sets. At most 2 existing skills per set of 5; never all 5 from existing seeds.
- A skill that covers multiple aspects is OK as one slot — its extra aspects are represented by other new seeds.
- Don't force every existing skill into the pyramid. If one doesn't fit, leave it without a setKey.
- Sets must have exactly 5 members. If a set already has 5, an existing skill cannot be added.
- Add explicit `rarity` field when the depth-based auto-rarity is wrong for the skill's role.

**Progress reset rule — intentional, permanent, user-authorized:**
> *"I want to be a blank slate even if I have in the past reached a certain level. I want to go back to basics and earn progress."*

When an existing skill gains a `setKey`, its live progress is wiped (`currentLevel→0`, `history→[]`, `lastQuestTs→null`). It moves from the face-up deck into the Side Deck. `pyramidResetApplied` flag prevents re-wipe on subsequent migrations. Already implemented in `src/core/migration.js` — no changes needed unless adding new pyramid paths.

---

## Tone constraints

Wyatt values: honesty, measurability, privacy, preserved progress, Yggdrasil symbolism. Keep copy plain and honest — no hype, no fake metrics. Ask before large architectural changes. Small surgical diffs.


be aware, this has already been started, and the previous instance crashed with an API Error, please split up the uncommon construction a bit more than you have been