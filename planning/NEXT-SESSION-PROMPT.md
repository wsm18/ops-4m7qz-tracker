Paste this into a new Claude Code session to resume work.

---

You are continuing work on **Operations**, a gamified ROTC life-tracker PWA built for an Army ROTC cadet (Wyatt, MS2, Cyber branch goal). **Read all of these before touching any code:**

1. `CLAUDE.md` — the binding rulebook (hard rules, workflow, file layout)
2. `planning/FINISHED-FEATURES.md` — design language, color palette, completed features, project identity
3. `planning/IMPROVEMENTS-skills-expansion.md` — the comprehensive skills backlog; consult whenever adding skills so you don't duplicate effort or miss obvious gaps

**Current version: v156.** The service worker is at `operations-v156` in `sw.js`. `SKILL_LADDER_VER` is currently **117** (in `src/core/migration.js` — unchanged since v155; v156 didn't touch `SEED_SKILLS`). Total skills: **5649** (unchanged since v154 — v155 and v156 were both content-quality/gap-fill passes, no skill additions).

**v156 note (unrelated to the pyramid workstream below):** fixed a real content gap in the FM training plan (`src/core/constants.js` `SESSIONS`) — Sessions 1, 3, and 4 had no warm-up/cool-down stretch content at all, despite the coach-tip copy promising it. Added real content, see the v156 `FINISHED-FEATURES.md` entry. This is a separate data structure (`SESSIONS`, not `SEED_SKILLS`) and doesn't affect the Commons-layer work below.

**IMPORTANT: commit this work to git before starting anything new.** v153 and v154 both sat uncommitted in the working tree for an entire session each — this is exactly what turned a routine file-corruption incident during v154 into a multi-hour recovery instead of a trivial `git checkout`. Confirm `git status` is clean (or at least that `src/core/skills-data.js` and `sw.js` are committed) before dispatching any new agent wave.

**v155 found real, previously-undetected defects in v151 and v152** by retroactively running the required-field validator (only introduced mid-v153) against the earlier trees — see the v155 entry in `FINISHED-FEATURES.md`. **Lesson: a validator introduced partway through a workstream doesn't retroactively apply itself.** When you introduce a new check, consider whether it should also run once against everything that predates it, not just new work going forward.

There is no `IMPROVEMENTS-vNNN.md` file right now. **Read the v148 through v154 entries in `FINISHED-FEATURES.md` before doing any pyramid-completeness auditing or Commons-layer work** — they document real mistakes from prior sessions:
- v148: miscounting set membership by filtering out Joker/auto skills, which led to writing and then fully reverting 54 unnecessary skills. Lesson: **when checking whether a pyramid set is complete, count ALL members of its `setKey` (matching `skSetMembers()`'s own rarity-agnostic definition), never a rarity-filtered subset.**
- v149: a fix script that matched skills by `name` alone patched the wrong object twice, because two skill names (`Penetration testing methodology`, `Legal literacy`) are pre-existing duplicates within the same `cat`. Both were caught and corrected. Lesson: **any script-based fix keyed on `name` must also check `cat` (and ideally `setKey`) before assuming a match is unambiguous** — see the still-open list of 10 pre-existing name+cat duplicates in the v148 entry.
- v150: a large parallel-agent dispatch (25 agents) hit an account-wide session-limit cutoff partway through, leaving the file syntactically broken (one missing comma) and several setKeys partially written. Lesson: **after any large parallel dispatch, don't trust the agents' own success reports at face value — run `node --check` and the marker/member-count sweep yourself before proceeding**, the same discipline as the rest of the ship checklist, but now also as a first-response check for a broken mid-dispatch state. Also: two agents in different dispatch waves independently chose the same skill names for unrelated setKeys — concurrent bulk-writing carries a collision risk against **sibling agents' output**, not just the pre-existing file, so the final duplicate sweep is load-bearing even when every individual agent claims it pre-checked.
- v151: picked up mid-interruption from a prior v151 attempt (7 leftover unapplied agent-output files + a partially-written tree). Two of those leftover files themselves had only generated 4/5 Commons for 6 setKeys before being cut off — a defect that looked identical in quality/format to the complete files and would have shipped short without a full member-count sweep on *inherited* content, not just newly-generated content. Lesson: **when recovering from an interruption, don't assume a leftover/inherited file is internally complete just because it parses cleanly and its setKeys don't collide with anything else — count members per setKey regardless of where the content came from.** Also switched to smaller sequential dispatch waves (4 agents/wave instead of one 25-agent wave) specifically to bound the blast radius of another possible mid-dispatch cutoff, and it worked without incident.
- v152: no interruption this session — verifying after every wave (not just at the end) caught a real defect early: one agent wrote all 25 of its assigned skills correctly but left 4 stale marker comment lines in place instead of deleting them (harmless to parsing/counts, but sloppy and confusing on a later grep). Lesson: **after every wave, don't just check member counts — also grep for the exact expected reduction in leftover `SLOT:` marker count.** A mismatch there catches "wrote the content but didn't clean up the marker" mistakes that a pure member-count sweep won't flag (the skills exist and count correctly either way). Also: several agents self-caught their own dropped skills (wrote 4/5 instead of 5/5) during their own end-of-task verification before reporting done — a good sign the per-agent verification instructions are working, but don't rely on it exclusively; the after-every-wave sweep is still what actually confirms it.
- v153: two real defects caught by verifying after every wave. (1) Two sibling agents dispatched in the *same* wave independently picked the identical skill name ("Position of Attention Precision") for two different setKeys — neither agent's own pre-write grep could catch this since each only checked history that existed *before* the wave started, not a sibling's simultaneous output. Caught by the routine whole-file name+cat duplicate sweep (11 dupes instead of the expected 10), fixed by renaming one. (2) Far more serious: while investigating that collision, one agent's skill was found to be missing its `howTo` field — and it turned out the *same agent* had omitted `howTo` from all 25 of its 25 skills, despite the task prompt showing the exact required shape. **A pure member-count sweep never would have caught this** — every setKey still had exactly 5 members. It only surfaced because a new full required-field validator (checking every field's presence, array lengths, rarity, fadeDays, and absence of stray fields) was written and run for the first time. Lesson: **member-count + marker-count sweeps are necessary but not sufficient. Run a full required-field/array-length validator after every wave too** — a structurally-complete-looking set of 5 skills can still individually be missing required content.
- v154: **discovered v153 had never been committed to git** — it existed only in the uncommitted working tree, with zero git-level safety net, right alongside v154's own uncommitted work. This is exactly why the incident below required a manual OneDrive recovery instead of `git checkout`. **Two real file-corruption incidents this session**, both from concurrent agents editing the shared `skills-data.js`: (1) a script fallback used Python's `open(path,'w')` — a truncating write mode that zeros the file the instant it opens — which raced against another agent and then failed before writing replacement content, leaving the file at 0 bytes; recovered via OneDrive version history (a snapshot from ~23 minutes earlier, verified byte-for-byte clean before trusting it). (2) Even after switching to a safer "read fresh → write to temp → atomic rename" pattern, a **lost-update race** still silently reverted one already-completed setKey back to just its marker comment — atomic rename prevents a file being observed in a *truncated* state, but does NOT prevent one agent's full-file write (computed from a stale read) from clobbering another agent's concurrent edit that landed in between. Caught by the routine post-wave member-count sweep, fixed by hand-authoring the 5 skills directly. **Lesson: prefer the Edit tool (real staleness detection against the live file) over any script-based fallback, and if a script is truly unavoidable, never batch multiple markers into one read-modify-write-all cycle — read fresh immediately before each individual write.** After switching to Edit-tool-first + reduced 2-agent-per-wave concurrency from wave 5 onward, zero further incidents. **Also: commit uncommitted pyramid work to git at the end of every session** — don't let it sit uncommitted like v153 and v154 did.

The legacy pyramid trees (cognitive, physiological, technical, academic, personal, hearth, roots) are, as of right now, verified to be a genuinely clean 5/5/5 across all 80 Legendaries and every Rare/Joker slot-holder's Uncommon set — 400 total slot-holders, 2000 total Uncommons, zero gaps anywhere. Every one of those 2000 Uncommons has its own unique, unshared Commons-tier placeholder key (0 orphans, 0 collisions, verified as of v149). **As of v154, five full Mythic trees' worth of Commons content — Physical Mastery, Keeper of the Flame, Tactical Mastery, Battlefield Commander, and Vital Operator, 3125 skills across 625 setKeys — are written and verified**, the first five of 16 trees. Don't re-litigate any of this without re-deriving the count yourself first.

---

## What's already done

Full history is in `planning/FINISHED-FEATURES.md`. Do not re-implement anything listed there.

### Pyramid state (the active multi-session workstream)

The app has a card-game pyramid system where skills form a 5-tier synthesis chain: Common → Uncommon → Rare → Legendary → Mythic.

**Every Mythic tree — both generations, all 16 of them — is a clean 5/5/5 through the Uncommon layer, verified.** 16 Mythics × 5 Legendaries = 80 Legendaries, each with exactly 5 total slot-holder members (Rare-tier or, in several legacy sets, a pre-existing Joker/auto skill occupying a legitimate slot) = 400 slot-holders, and every slot-holder's Uncommon-tier feeder set has exactly 5 members = 2000 Uncommons. This was checked with a Node script that loads `skills-data.js` as a module and replicates `skRarity()` exactly (see the v148 `FINISHED-FEATURES.md` entry for the script's logic) — **do this yourself before trusting any inherited claim about missing Rares/Uncommons**, including claims in this very file if enough time has passed that drift is possible.

**Two auditing traps to avoid, both hit in the v148 session (see `FINISHED-FEATURES.md` for the full story):**
1. **A written gap-list doc can go stale.** If work happens between when an audit doc is written and when you act on it, re-derive counts from `SEED_SKILLS` directly rather than trusting the doc's numbers.
2. **Counting "true Rare" (rarity-filtered) members is not the same as counting "total slot-holder" (rarity-agnostic) members**, and only the second one matches `skSetMembers()`/`skSetCanCombine()`'s actual behavior and the project's "exactly 5 members" rule. Several legacy Legendary sets have 1-2 pre-existing Joker/auto skills (e.g. `Reaction speed`, `Resting heart rate`) legitimately occupying real slots alongside 3-4 authored Rare cards — filtering those out before counting makes a complete set look short.

**Session sequence:**
- v144: misc deck elimination + Soldier Athlete Mythic ✓ done
- v145: pyramid structural repair (190 Uncommons + 1 bug fix) ✓ done
- v146: Phase 7 structure — 5 new Mythics + 20 new Legendaries + 100 new Rares ✓ done
- v147: Phase 7 Uncommons (500 skills) + storage refactor (fixed a real quota crash) ✓ done
- v148: investigated a claimed legacy-pyramid gap, found it didn't exist (after a mid-session false start that got caught and fully reverted before shipping) — see `FINISHED-FEATURES.md` for the full account. Net change: none. Still at v147/2524 skills.
- v149: Commons-layer prerequisite — fixed 6 orphaned Uncommons (no `synthesizedFrom`) and split 10 collision groups (34 skills sharing keys) so every one of the 2000 Uncommons now has its own unique Commons-tier placeholder key, ready for a clean 5-Commons-per-Uncommon ratio. No skills added/removed (2524 unchanged), only `synthesizedFrom` relinked. See `FINISHED-FEATURES.md` for the full account, including two name-lookup near-misses caught mid-fix.
- v150: Commons layer, first tree — wrote all 625 Commons (125 setKeys × 5) for the **Physical Mastery** Mythic tree. Survived and recovered from an account-wide session-limit interruption mid-dispatch (fixed a broken file, hand-completed 4 partially-written setKeys, re-dispatched the remaining 59 once the limit lifted) and fixed 2 real name+cat collisions introduced by concurrent agent writes. 2524 → **3149** skills. See `FINISHED-FEATURES.md` for the full account.
- v151: Commons layer, second tree — wrote all 625 Commons (125 setKeys × 5) for the **Keeper of the Flame** Mythic tree, picking up mid-interruption from a prior v151 attempt (applied 7 leftover unapplied agent-output files, hand-completed 6 setKeys that were short a member even in the leftover files, fixed 1 new name+cat collision). Used smaller 4-agent sequential waves instead of one large wave to bound interruption risk, with no incident this time. 3149 → **3774** skills. See `FINISHED-FEATURES.md` for the full account.
- v152: Commons layer, third tree — wrote all 625 Commons (125 setKeys × 5) for the **Tactical Mastery** Mythic tree. No interruption this session; verifying after every wave (not just at the end) caught a real defect early (an agent left 4 stale marker comment lines in place after writing correct content). Several agents self-caught their own dropped skills before reporting done. 3774 → **4399** skills. See `FINISHED-FEATURES.md` for the full account.
- v153: Commons layer, fourth tree — wrote all 625 Commons (125 setKeys × 5) for the **Battlefield Commander** Mythic tree. No interruption this session. Caught and fixed a sibling-agent name collision within wave 1, and — more importantly — discovered one wave-1 agent had omitted the required `howTo` field from all 25 of its skills, a defect invisible to member-count/marker-count sweeps. Introduced a full required-field/array-length validator to the post-wave checklist as a direct result; every wave from the second onward repeated zero defects. 4399 → **5024** skills. **This entire session's work was never committed to git** — discovered during v154, see below. See `FINISHED-FEATURES.md` for the full account.
- v154: Commons layer, fifth tree — wrote all 625 Commons (125 setKeys × 5) for the **Vital Operator** Mythic tree. Survived a wave-3 account-wide agent stall (recovered via canary + re-dispatch, no data lost) and, far more seriously, two file-corruption incidents during wave 4: a truncating-write script zeroed `skills-data.js` to 0 bytes (recovered via OneDrive version history), then a lost-update race reverted one already-completed setKey back to its marker (caught by the post-wave sweep, hand-fixed). Switched to Edit-tool-first + 2-agent-per-wave concurrency from wave 5 onward; zero further incidents. Also discovered v153 had never been committed to git. 5024 → **5649** skills. See `FINISHED-FEATURES.md` for the full account, and `SESSION-TIMES.md`'s v154 row for the full incident timeline.
- **Next: the Commons layer for the remaining 5 Mythic trees** (3,125 cards) — five trees down, one proven-working process (now including the required-field validator AND the Edit-tool-first/reduced-concurrency discipline from v154), repeat it — see below

**After the Commons layer (all 16 Mythic trees + 6 second-gen Phase 7 trees) is fully complete:** the next workstream is queued in `planning/IDEAS-tests-fm-workouts.md` — a fully-designed, Wyatt-confirmed set of FM/test features (gym-schedule-aware training planning, equipment-aware exercise selection, stealth-assessment cognitive/quiz games, card-game workouts) plus four additional green-lit novel ideas (a unified cross-tab deadline timeline, an AAR-style reflection journal, a cross-domain data-insight engine, and a whole-tree "smart focus" recommender), with a recommended 8-phase build order (X-Timeline → X-AAR → FM-1 → FM-2 → X-Insight → T → FM-3 → X-SmartFocus) at the bottom of that doc. Read it before starting that work; don't re-derive the design from scratch.

---

## What's next: continue writing Commons content, tree by tree

The prerequisite is done, the object shape is established, and five trees (Physical Mastery + Keeper of the Flame + Tactical Mastery + Battlefield Commander + Vital Operator, 3125 skills) are written and verified as of v154. What's left is repeating that process for the other 5 Mythic trees (Cyberspace Operations Officer, Master of the Mind, Scholar-Warrior, Sovereign Self, The Living Root):

1. **Confirm the current total** before starting, in case anything has drifted: `grep -oE 'synthesizedFrom:"[a-z0-9_]+_c_[a-z0-9_]+"' src/core/skills-data.js | sort -u | wc -l` should still read **2000** (one key per Uncommon, unchanged since v149 — Commons don't get their own `_c_` feeder keys, they're the floor). Total `SEED_SKILLS` should read **5649**. If either number is off, something changed and needs auditing the same way v148-v154 did.
2. **Pick the next Mythic tree** to complete (any of the 5 untouched ones — check for name+cat collision risk in that `cat` first via the duplicate sweep in the Ship checklist; `technical`/`personal`/`cognitive` carry the 10 known pre-existing collisions, so a first pass there needs extra care). Each tree is 125 setKeys / 625 skills, same shape as v150–v154.
3. **Reuse the v150–v154 Common object shape exactly** — no redesign needed: `rarity:"common"`, `fadeDays:30`, `setKey` = the parent Uncommon's own `synthesizedFrom` value, 4-item `levels`/`roadmap`/`advance`/`maintain` arrays, no `synthesizedFrom`/`unlockHint`/`tiers` fields. Grep any `phys_c_*`, `hearth_c_*`, `tac_c_*`, `lead_c_*`, or `phys2_c_*` skill for a concrete reference.
4. Write `planning/IMPROVEMENTS-vNNN.md` scoping the chosen tree, then execute with the SLOT-marker + parallel-subagent pattern (see "Writing seeds at scale" below) — one agent per parent Rare (5 setKeys/25 skills per agent). **Cap concurrency at 2 agents per wave, not 4** — v154 reduced from 4 to 2 after two file-corruption incidents happened at 4-agent concurrency (see the v154 FINISHED-FEATURES/SESSION-TIMES entries), and had zero further incidents afterward.
5. **In every agent prompt, instruct a strong preference for the Edit tool over any script-based fallback** (new in v154). The Edit tool has live staleness detection against the real file. A script that reads the file into memory and later writes a full-content replacement — even via a "safe" atomic temp-file-then-rename pattern — can still silently clobber a concurrent agent's edit that landed in between the read and the write (a "lost update"; atomic rename only prevents the file being *observed* mid-write, not this). If a script is truly unavoidable, it must re-read fresh immediately before each individual write and do a minimal targeted replacement, never batching multiple markers into one read-modify-write-all cycle. NEVER use `open(path,'w')`/`fs.writeFileSync(path,...)` directly against the shared target file — that truncates it to 0 bytes the instant it opens, before new content is written, which is exactly what caused v154's worse incident.
6. **Verify after EVERY wave, not just at the end** — this is what caught v152's stale-marker-comment defect, v153's missing-required-field defect, and v154's lost-update regression early. After each wave, run ALL of:
   - `node --check`
   - a rarity-agnostic member-count sweep for that wave's setKeys
   - a check that the expected number of `SLOT:` markers actually disappeared (a marker count that doesn't drop by exactly 5×(agents in wave) means someone left stale marker text behind even if their skill content is otherwise correct)
   - a full required-field/array-length validator across that wave's new skills: confirm every skill has `name/cat/rarity/fadeDays/setKey/why/howTo/levels/roadmap/advance/maintain`, that `levels`/`roadmap`/`advance`/`maintain` each have exactly 4 items, `rarity==="common"`, `fadeDays===30`, and none of `synthesizedFrom`/`unlockHint`/`tiers` are present. A member-count sweep alone CANNOT catch a skill that exists, counts correctly, but is missing a required field.
   - **(new in v154) don't just check that this wave's OWN setKeys are still at 5 members — a lost-update race can silently revert a DIFFERENT, already-verified setKey from an earlier wave.** If a member count for a previously-clean setKey unexpectedly drops, that's the signature of this exact race; fix it by hand rather than re-dispatching (redispatching risks racing again).
7. **Budget for a possible mid-dispatch interruption anyway.** v150, a prior v151 attempt, and v154's wave 3 all hit an account-wide session-limit/stall cutoff partway through a dispatch. If interrupted, a small canary agent (one group) is a cheap way to confirm the limit has lifted before re-dispatching the rest. **This includes leftover/inherited content from a prior interrupted session** — count members per setKey (and run the required-field validator) on any leftover file before trusting it, the same as newly-generated content.
8. **If the file gets corrupted (truncated to 0 bytes or otherwise unreadable) mid-session:** stop all agents immediately, then check in this order: (a) `git diff`/`git show HEAD:<path>` — but confirm HEAD is actually up to date first, don't assume it is (v154's HEAD was two tree-versions behind the uncommitted working copy); (b) OneDrive version history (right-click the file in Explorer, or onedrive.com) for a snapshot from just before the incident — verify byte-for-byte via the full required-field+member-count+dup sweep before trusting it, exactly like any other inherited content; (c) only as a last resort, accept the loss and rebuild from the last good state you can find, redispatching the lost waves.
9. After writing the full tree, run a **recursive whole-tree sweep** (walk Mythic → Legendaries → slot-holders → Uncommons → Commons, confirming exactly 125 setKeys and exactly 625 Common skills, all at 5/5/5/5) AND re-run the full required-field validator across all 625 Commons together — rather than only checking each wave's own setKeys/skills in isolation. This is what confirms the tree is genuinely complete, not just that no individual wave regressed.
10. Run the full verification: syntax check, name+cat duplicate sweep across the **whole file** (expect exactly 10, the known pre-existing list, zero new) — v150 through v154 all found or avoided new collisions this way, so this isn't optional even when every agent claims it pre-checked.
11. In each wave's agent prompts, explicitly call out the exact v153 mistake (a full agent omitting `howTo` from all 25 skills) and the v154 incidents (truncating writes, lost-update races) as concrete failure modes to avoid, and require the agent to self-verify both `why:` and `howTo:` are present as separate fields on a sample of its own output before reporting done. This did not eliminate the need for your own post-wave validator, but it did prevent recurrence in every wave after the one where it happened.
12. **Commit the finished tree's work to git before ending the session** (new discipline after v153/v154 both went uncommitted for a full session each). Don't leave a completed tree sitting only in the working directory.

## Storage discipline — read before adding fields to every skill

v147's storage refactor bought real headroom, but the user's stated goal is 10,000+ skills. Before adding ANY new field that would exist on every seed (and by extension every live skill), ask: **does this need to be duplicated onto the live object, or can it be resolved from the seed via `skSeedOf()`/hydration like the guidance fields now are?**
- Static/authorial content (guidance text, ladder descriptions, tier labels, anything that's the same for every user) → belongs in `SEED_SKILLS` only, resolved live. Do NOT add it as a literal field copied onto `S.lifeSkills` entries.
- User-owned data (progress, history, personal notes, targets) → must stay on the live object; this is the only data that actually needs to scale per-skill in localStorage.
- If you do add a new per-skill static field to `SEED_SKILLS`, check whether `skHydrate()`'s `_SK_GUIDANCE_FIELDS` list (in `skills-core.js`) needs the new field added so it gets the same non-enumerable-getter treatment instead of being persisted.

---

## Required workflow summary

```bash
# After every feature or batch of changes:
python scripts/build.py       # must say OK
npm run check                 # must say SYNTAX OK
npm run regress                # must say PAGEERRORS 0

# After all features, before reporting done:
# bump sw.js: operations-v156 -> operations-v157 (or whatever's next)
# bump SKILL_LADDER_VER in src/core/migration.js only if you changed an EXISTING ladder/tier/guidance text (currently 116) — pure additions don't need it, mergeNewSeedSkills() picks up new seed names on any old save regardless of ladder version
npm run package               # produces dist/operations.zip
```

### Ship checklist (same every session)
0. **At the very start of the session, before any other work:** run `date "+%Y-%m-%d %H:%M %Z"` and note the timestamp (see "Session time logging" in `CLAUDE.md`) — needed for step 14 below.
1. `python scripts/build.py` → `OK index.html`
2. `npm run check` → `SYNTAX OK`
3. `npm run regress` → `PAGEERRORS 0`, check `badCount`
4. Run a duplicate `name`+`cat` sweep across `SEED_SKILLS` (Node script loading `skills-data.js` as a module) — regress won't catch this
5. If you added or claimed to fix any pyramid set membership, run the rarity-agnostic `skSetMembers()`-style member-count sweep too (see "Two auditing traps" above) — regress won't catch a 7-member set either, it only validates individual skill objects
6. **(new in v153) Run a full required-field/array-length validator** on any new skills — regress validates individual skill objects but won't catch every field-shape mistake a wave might make; see the missing-`howTo` incident in the v153 FINISHED-FEATURES entry
7. Bump `sw.js` cache version — **only if something actually shipped**; if a session's work nets out to a revert (like v148), leave the version alone
8. Bump `SKILL_LADDER_VER` in `src/core/migration.js` **only if** an existing ladder/tier/guidance changed
9. `npm run package` → produces `dist/operations.zip`
10. If you wrote an `IMPROVEMENTS-vNNN.md` for this session, delete it once implemented (it's recorded in `FINISHED-FEATURES.md`)
11. If incomplete, write `planning/IMPROVEMENTS-vNNN+1.md` for the remainder
12. Add a `planning/FINISHED-FEATURES.md` entry — including an honest one if the session's net result was "investigated, found nothing to do, reverted a false start"
13. Update `planning/NEXT-SESSION-PROMPT.md` (this file) with new version numbers
14. Tell Wyatt to **hard-refresh / reopen the app** so the new service worker activates and any migration runs (skip if nothing shipped)
15. Run `date` again, compute elapsed time since step 0's timestamp, and append a row to `planning/SESSION-TIMES.md` (version/tree worked, start, end, elapsed, and any interruption notes) — this is what makes future "how long will the rest take" estimates real instead of inferred from squashed git commits.
16. **(new after v153/v154) Commit the session's work to git** — `src/core/skills-data.js`, `sw.js`, and the planning docs touched. Don't let a finished tree sit uncommitted; v153 and v154 both did this and it directly caused v154's file-corruption incident to require a manual OneDrive recovery instead of a trivial `git checkout`.

### What not to do
- Don't trust an inherited audit/gap-count doc without re-deriving it from `SEED_SKILLS` first.
- Don't count "rarity-filtered members" when checking set completeness — count all members of the `setKey`, matching `skSetMembers()`'s actual behavior. See "Two auditing traps" above.
- Don't read reference docs and then skip reading the actual source files — the code is what matters.
- Don't stop after one cluster and call it done unless you've explicitly scoped the session that way in an `IMPROVEMENTS-vNNN.md` doc.
- Don't add error handling, fallbacks, or validation for scenarios that can't happen.
- Don't add comments explaining what the code does — only the why if it's non-obvious.
- Don't restructure or reformat unrelated code while making a targeted change.
- Don't parallelize structural (Mythic/Legendary/Rare) edits across subagents — too interdependent, do it yourself. Only parallelize bulk seed-writing (Uncommons, Commons), using the SLOT-marker pattern.
- Don't add a new field to every seed/live skill without reading "Storage discipline" above first.
- Don't reuse a `name`+`cat` pair, or a `synthesizedFrom` key, that's already used elsewhere in the file — grep before finalizing, every time.
- Don't trust a wave "succeeded" just because member counts are right — also check that stale `SLOT:` marker comment lines were actually deleted (v152's finding), AND that every skill has all required fields present, not just the right count of skills (v153's finding — a full agent can omit a required field from every one of its 25 skills while still passing a member-count check).
- Don't assume an agent's own self-reported "I verified X" is sufficient — v153's missing-`howTo` agent likely didn't actually check its own output against the required shape despite being shown it; your own independent post-wave validator is what actually catches this.

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

**Live-skill storage (v147+):**
- `S.lifeSkills` entries hold ONLY user-owned data: `id, name, cat, parent, group, fadeDays, auto, currentLevel, lastQuestTs, peakLevel, targetLevel, history, seeded, joker` (plus pyramid fields `synthesisUnlocked`, `pyramidResetApplied`).
- Guidance text (`why/whatYouDo/howTo/prep/recover/safety/roadmap/advance/maintain/tiers`) and `levels` are **not stored** on seeded live skills — `skHydrate(sk)` (skills-core.js) attaches non-enumerable getters that resolve them from `SEED_SKILLS` via `skSeedOf(name, cat)` at read time. Reading `sk.why` / `sk.levels` works exactly as before; nothing else needs to change when you read these fields.
- `skHydrateAll(list)` is called from `seedSkillsIfEmpty()` (fresh installs) and at the end of `mergeNewSeedSkills()` (every returning-user load) — it also strips legacy literal fields from pre-v147 saves and reports whether it stripped anything, so `mergeNewSeedSkills()` can force a `save()` on the spot.
- `skSeedOf(name, cat)` is now backed by a memoized `Map` (`skSeedIndex()`), O(1) per lookup — safe to call in render loops even at large skill counts. **This is exactly why name+cat collisions matter**: the Map can only hold one seed per key, so a collision means one skill silently becomes unreachable by lookup even though both objects exist in `SEED_SKILLS`.
- Custom (user-created, non-seeded) skills are never hydrated — they keep their own literal `levels` and have no guidance fields (same as before).
- `save()` (state.js) now catches `QuotaExceededError` (or any storage failure) and toasts instead of crashing — but the real fix is not re-introducing per-skill duplication; see "Storage discipline" above.

**Pyramid system:**
- `skRarity(sk)` — rarity from explicit `rarity` field or ladder depth (≤4 Common, 5-7 Uncommon, 8-10 Rare, 11-13 Legendary, 14+ Mythic, auto/joker Joker). **Auto/joker check happens first** — a pre-existing skill with an `auto:` field (e.g. a test-driven skill like "Reaction speed") is a Joker regardless of its ladder length, even if that length would otherwise read as Rare-tier. **A Joker can still be a legitimate, load-bearing member of a Legendary's 5-slot Rare set** — don't exclude Jokers when counting whether a set is complete (see "Two auditing traps" above).
- `skSeedOf(name, cat)` — find a skill's seed in SEED_SKILLS (O(1), see above)
- `skSetMembers(setKey)` — all non-group seeds with matching setKey (rarity-agnostic — includes Jokers). **This is the authoritative definition of "how many members does this set have" — match it exactly when auditing, don't filter by rarity first.**
- `skSetMasteredCount(setKey)` / `skSetCanCombine(setKey)` — set progress. `skSetCanCombine` requires ALL members (Jokers included) individually mastered — this is why a set with more than 5 members is a real regression, not a cosmetic issue.
- `skCombineSet(setKey)` — finds the FIRST seed whose `synthesizedFrom===setKey` and unlocks it. **Never reuse a `synthesizedFrom` key across two different skills** — the second one becomes permanently unreachable (this is the exact bug fixed in v145).
- `SYNERGY_PAIRS` — 15 complementary skill pairs; `skHasSynergy(sk)` — partner at L4+?
- Seeds use: `rarity`, `setKey`, `synthesizedFrom`, `unlockHint` fields
- Live skills use: `synthesisUnlocked` (boolean, the only pyramid field on live data)
- Live skills use: `pyramidResetApplied` (int, set once when skill first gains setKey — prevents re-wipe)
- Side Deck (unstarted leaves): collapsible `<details class="sk-side-deck">` in `skills.js`
- Face-down card function: `faceDownCard(sk, suit, rank, isSynthPending)` in `skills.js`
- Combine button handler: `data-skcombine` in `events.js` delegation
- Chain view: `renderSynthesisChain(cat)` in `skills.js`; toggle `.sc-toggle[data-sctoggle]` wired post-render; output in `.sc-wrap#sc-{cat}`

**Existing skill integration rule (applies whenever wiring existing skills into a new cluster):**
When arriving at a new cluster, first grep existing `SEED_SKILLS` for that `cat` and audit ladder depths. Assign each existing skill that fits by adding `setKey` (and if needed `rarity` or `synthesizedFrom`) directly to its seed object. Rules:
- Existing skills fill slots, not complete sets. At most 2 existing skills per set of 5; never all 5 from existing seeds.
- A skill that covers multiple aspects is OK as one slot — its extra aspects are represented by other new seeds.
- Don't force every existing skill into the pyramid. If one doesn't fit, leave it without a setKey.
- **Sets must have exactly 5 members, full stop — counting every member regardless of rarity/Joker status. If a set already has 5 total members (even if only 3 are "true Rare" and the other 2 are pre-existing Jokers), it is already complete and a new skill cannot be added, structurally or as a fix for a perceived gap.**
- Add explicit `rarity` field when the depth-based auto-rarity is wrong for the skill's role.

**Progress reset rule — intentional, permanent, user-authorized:**
> *"I want to be a blank slate even if I have in the past reached a certain level. I want to go back to basics and earn progress."*

When an existing skill gains a `setKey`, its live progress is wiped (`currentLevel→0`, `history→[]`, `lastQuestTs→null`). It moves from the face-up deck into the Side Deck. `pyramidResetApplied` flag prevents re-wipe on subsequent migrations. Already implemented in `src/core/migration.js` — no changes needed unless adding new pyramid paths.

**Writing seeds at scale (established v145, refined through v154):** pre-place unique `// SLOT:<setKey>:<name>:<cat>` marker comments yourself in one edit, then dispatch one subagent per marker group in parallel, **capped at 5 setKey groups (25 skills) per agent, never more**, and **capped at 2 agents concurrently per wave (not 4)** — v154 hit two real file-corruption incidents at 4-agent concurrency and had zero incidents after dropping to 2. Concurrent agents editing the same file will hit Edit-tool staleness retries — that's expected and safe, not a failure; **instruct every agent to strongly prefer retrying the Edit tool over falling back to a script**, since the Edit tool does real staleness detection against the live file. If a script fallback is truly unavoidable, it must NEVER use a truncating write mode (`open(path,'w')`, `fs.writeFileSync(path,...)`) directly against the target — write to a uniquely-named temp file and atomically rename it in. But even atomic rename is **not** sufficient on its own: a script that reads the full file, computes a full replacement in memory, and later writes it via atomic rename can still silently overwrite ("lost update") another agent's edit that landed in the gap between that read and that write. Minimize this by reading fresh immediately before each individual write and never batching multiple markers into one read-modify-write-all cycle. Verify with the full build/check/regress pipeline yourself once at the end, not per-agent — but DO run the syntax + member-count + marker-count + required-field-validator sweep after **every wave**, not just at the end (v152's stale-marker finding, v153's missing-required-field finding, and v154's lost-update-race finding all came from this discipline — the last one specifically requires checking that *previously-clean* setKeys from earlier waves haven't silently regressed, not just this wave's own setKeys). Always run both the duplicate `name`+`cat` sweep and the rarity-agnostic member-count sweep too (see Ship checklist), plus a final recursive whole-tree sweep once a tree is fully written. **If the file is ever found truncated/corrupted mid-session:** stop all agents immediately, don't assume `git HEAD` is current (verify it actually matches expectations first), and check OneDrive version history for a recent snapshot before accepting any data loss — verify any recovered version byte-for-byte with the same full sweep before trusting it.

---

## Tone constraints

Wyatt values: honesty, measurability, privacy, preserved progress, Yggdrasil symbolism. Keep copy plain and honest — no hype, no fake metrics. Ask before large architectural changes. Small surgical diffs.
