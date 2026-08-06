# IMPROVEMENTS-v167 — Cyber Operator Commons layer (16th and final Mythic tree)

## Scope

Write the Commons tier (625 skills, `rarity:"common"`) for **Cyber Operator** (`cat:"technical"`), the last of the 16 Mythic trees still missing its Commons layer. 25 groups (one per parent Rare) × 5 setKeys each = 125 setKeys, 5 Commons per setKey = 625 skills.

Confirmed via `SEED_SKILLS` walk at session start: 11899 total skills, 15/16 Mythic trees at 625 Commons, Cyber Operator at 0. `npm run regress` passes cleanly (0 pageerrors) — the v166 Playwright failure was environment-specific, not a code defect.

## Object shape (copy exactly — see `tech_c_algo_analysis` for a shipped reference, e.g. line ~22007)

```js
{name:"...", cat:"technical", rarity:"common", fadeDays:30, setKey:"<parent Uncommon's synthesizedFrom>",
 why:"...", howTo:"...",
 levels:["L1...","L2...","L3...","L4..."],          // exactly 4 items
 roadmap:["...","...","...","..."],                  // exactly 4 items
 advance:["Reach L1: ...","Reach L2: ...","Reach L3: ...","Reach L4: ..."],  // exactly 4 items
 maintain:["Hold L1: ...","Hold L2: ...","Hold L3: ...","Hold L4: ..."]},    // exactly 4 items
```

No `synthesizedFrom`, `unlockHint`, or `tiers` fields on Commons. `rarity` must be exactly `"common"`, `fadeDays` exactly `30`.

## Insertion point

Append after the existing Life Architect Commons block, immediately before the closing `];` of `SEED_SKILLS` (currently line ~97768 of `src/core/skills-data.js`). SLOT markers placed there in one edit before any agent is dispatched, one `// SLOT:<setKey>:<name>:<cat>` comment per Common skill, grouped under `// ── GROUP N | Leg: <legendary> | Rare: <rare> ──` headers, 5 setKeys per group, 5 slots per setKey.

## Collision risk — read before writing any name

- `technical` cat already has **937 existing skill names** (legacy Technical Mythic tree + Cyberspace Operations Officer's full 625 Commons, both shipped, plus Cyber Operator's own Mythic/Legendary/Rare/Uncommon tiers already in the file). **Grep every candidate name against the whole `technical` cat before writing it** — not just the 10-item known pre-existing dupe list (which already includes 5 in `technical`: Penetration testing methodology, Cyber Operator, Threat Intelligence Analysis, Privilege Escalation, SIEM & Log Management — all confirmed pre-existing, do not "fix" them).
- The `technical` cat is unusually dense in **timeline**, **threat**, **vulnerability**, and **pentest** vocabulary already (37+ existing names containing those terms, from the legacy tree and Cyberspace Operations Officer). Be deliberate about wording — e.g. don't default to "Timeline Reconstruction" or "Vulnerability Assessment" as a Common name; make it concrete and specific to the Uncommon it's feeding.

## Within-tree thematic density — explicit group boundaries (v165-style differentiation required)

Cyber Operator's own 25 groups cluster heavily around a handful of recurring concepts. Do NOT give agents a generic "don't duplicate other groups" warning — name the specific sibling group and the scope boundary, per the v165 lesson (Cognitive Athlete). Key clusters:

**"Vulnerability" appears in 4 different Legendaries — each is a distinct role, not a synonym:**
- **Group 1** (Advanced Cyber Tradecraft → Uncommon "Vulnerability research"): novel vulnerability *discovery/research* — finding previously-unknown weaknesses, writing them up as findings, research tradecraft.
- **Group 6** (Vulnerability Assessment, Legendary "Offensive Cyber Mastery"): running an assessment *engagement* against a target — scanning, verifying findings aren't false positives, manual testing, prioritizing, reporting to the client.
- **Group 14** (Vulnerability Management Program, Legendary "Defensive Cyber Operations"): the ongoing organizational *program* — recurring scan cadence, tracking remediation to closure, metrics, coordinating with stakeholders who own the fix.
- **Group 19** (Vulnerability Intelligence, Legendary "Cyber Intelligence"): tracking *already-disclosed* vulnerabilities and *in-the-wild exploitation* — not discovering new ones, but monitoring disclosure feeds, assessing exploitability, correlating against your own asset inventory.

**"Pentest methodology" (Group 1) vs "Network Penetration Testing" (Group 7):** Group 1 is process/methodology knowledge (how engagements are planned and structured); Group 7 is hands-on technical execution against a network target (enumeration, foothold, privilege escalation, lateral movement).

**"Threat intelligence" appears in Group 5 AND the whole Cyber Intelligence Legendary (Groups 16-20) — different altitudes:**
- **Group 5** (Threat Intelligence Analysis, under "Cyber Operations Mastery"): *tactical* intel directly feeding detection engineering — mapping an incident's observed behavior to ATT&CK to drive signature writing, profiling a specific known actor, writing finished intel products, briefing non-technical audiences.
- **Group 16** (OSINT Collection): the *collection discipline itself* — footprint mapping, search tradecraft, public records research, source reliability — not analysis of what's collected.
- **Group 17** (Cyber Threat Landscape Analysis) — includes its own ATT&CK-mapping Uncommon: this is *strategic/sector-wide* trend analysis across many reports over time, distinct from Group 5's tactical single-incident TTP mapping. Name the distinction explicitly in the agent prompt for Groups 5 and 17.
- **Group 18** (Attribution Analysis): determining *which* actor was responsible for a specific incident from ambiguous evidence — distinct from Group 5's profiling of an *already-identified* actor.
- **Group 20** (Strategic Cyber Assessment): the *translation/communication* function — converting technical risk into business/mission terms for decision-makers, not the underlying technical analysis itself.

**"Timeline reconstruction" appears in Group 4 AND Group 12 — different evidence sources:**
- **Group 4** (Digital Forensics & Incident Response): deep forensic investigation working directly with raw evidence (disk images, filesystem artifacts) across multiple evidence sources over an extended investigation.
- **Group 12** (SIEM & Log Management): using the SIEM platform specifically — log correlation across ingested log sources, not disk forensics.
- **Group 13** (Endpoint Detection & Response) is narrower still: endpoint-agent-specific detection/response tooling, distinct from both.

**Groups 21-25 (Mission Command Integration)** are Army/military-context cyber integration — lower collision risk with Groups 1-20's generic cyber content, but internally: Group 21 (Cyber Effects Planning) is planning at the higher echelon; Group 24 (Cyber Support to Maneuver) is synchronized execution during an active maneuver; Group 25 (Cyber Battle Damage Assessment) is post-action effect assessment, distinct from Group 20's Strategic Cyber Assessment (which is risk/impact assessment, not BDA).

## Execution plan

1. Place all 125 `// SLOT:` markers in one edit (orchestrator does this directly, not delegated — structural work).
2. Dispatch 13 waves, 2 agents/wave (groups paired sequentially: 1+2, 3+4, ... 25 solo), one agent per group (5 setKeys/25 skills).
3. Every agent prompt must include: the object shape template, the specific differentiation guidance for its group(s) from above, an instruction to grep every candidate name against the whole `technical` cat before writing, the v153 (`howTo` omission), v154 (truncating writes / lost-update races), v157 (trailing comma at group boundary), and v166 (4-item not 5-item ladders) failure modes, and a requirement to self-verify exact 4-item arrays and re-grep remaining `SLOT:` markers after every Edit call, plus a final re-count after a brief pause before reporting done.
4. After every wave: `node --check`, member-count sweep (rarity-agnostic) for that wave's setKeys, marker-count-dropped-by-exactly-10 check (5×2 agents), `grep "// SLOT:" | sort | uniq -d` for duplicates, full required-field/array-length validator, check previously-completed setKeys haven't regressed, scan undispatched groups' markers/headers for corruption.
5. After all 25 groups: recursive whole-tree sweep (Mythic → Legendaries → Rares → Uncommons → Commons, confirm 125 setKeys / 625 Commons, 5/5/5/5 throughout), full required-field validator across all 625 together, whole-file name+cat duplicate sweep (expect exactly 10, the known list, zero new).
6. Ship checklist: build, check, regress, sw.js bump (`operations-v167`), `SKILL_LADDER_VER` unchanged (pure addition), `npm run package`, commit.

This is the last tree — once shipped, all 16/16 Mythic trees have complete Commons layers.
