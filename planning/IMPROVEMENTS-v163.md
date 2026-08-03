# v163 — Commons layer, twelfth tree: Cyberspace Operations Officer

**Status: STAGED, not yet written.** 125 `// SLOT:<setKey>:technical` markers placed in
`src/core/skills-data.js` (right after the technical Uncommon block, before the cognitive
pyramid section), grouped into 25 `// ── GROUP N | Leg: ... | Rare: ... ──` blocks of 5
setKeys each. `node --check` passes; marker count confirmed at 125. Zero skill objects
added yet — `SEED_SKILLS.length` is still 9399.

## Why this tree, picked next
Re-derived fresh at session start (matched the v162 doc exactly: 9399 total, 11 trees at
625 Commons, 5 at 0 — Cyberspace Operations Officer, Staff Excellence, Cyber Operator,
Cognitive Athlete, Life Architect). Of the 5 remaining, `technical` (Cyberspace Operations
Officer + Cyber Operator) is the only cat where **neither** Mythic tree has a shipped
Commons sibling yet — lowest collision risk per the v161 finding (a cat with an
already-shipped same-cat sibling can collide against that sibling's names, not just the
10-item known-dupe list). `technical` does carry 2 of the 10 known pre-existing name+cat
dupes (`Penetration testing methodology`, `Cyber Operator`) — grep those specifically
before finalizing any Common name near those Rares (groups 11 area).

## Structure (verified via Node script walking SEED_SKILLS)
5 Legendaries × 5 Rare/Joker slot-holders × 5 Uncommons = 125 Commons, one per group below.
Groups 1–5: Computing Foundations. 6–10: Software Craftsman. 11–15: Cyber Operator (Legendary,
not to be confused with the sibling Mythic tree of the same cat). 16–20: Infrastructure Mastery.
21–25: Technical Intelligence.

## Next session: execute the waves
1. Confirm `git status` clean and the 125 markers are still intact (`grep -c "// SLOT:"`).
2. Dispatch 2 agents/wave, 5 setKeys (25 skills) per agent, per the standing process in
   `NEXT-SESSION-PROMPT.md` (Edit-tool-first, no truncating script writes, watch the
   group-boundary trailing comma, warn about `howTo` omission and lost-update races).
3. After every wave: `node --check`, member-count sweep, marker-count-dropped-by-N check,
   `grep "// SLOT:" | sort | uniq -d`, full required-field validator, and a scan of
   undispatched groups for corruption — the full checklist in `NEXT-SESSION-PROMPT.md`.
4. Grep every candidate Common name against `cat:"technical"` before writing (both the
   10-item known-dupe list AND the whole cat, since `technical` will eventually carry
   two Mythic trees' worth of names once Cyber Operator's turn comes).
5. Final sweep: 125 setKeys × 5 members, 625 Commons total, whole-file dup sweep still at
   exactly 10, bump `sw.js` to `operations-v163`, `npm run package`, commit, update
   `FINISHED-FEATURES.md` and `NEXT-SESSION-PROMPT.md`.
