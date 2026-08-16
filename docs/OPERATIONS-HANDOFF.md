# OPERATIONS — Project Handoff & Orientation

**Purpose:** a fast-onboarding read for anyone (human or AI) picking this project up for the first time, or after a long gap. This is the *mental model* doc — who the user is, what the app is, how the big systems fit together. It deliberately does **not** duplicate the other three reference docs:

- **`CLAUDE.md`** (repo root) — the binding operating rules: hard rules, workflow, file→code pointer table. Read this first, always — it overrides everything else.
- **`planning/FINISHED-FEATURES.md`** — the permanent, exhaustive reference: design language, full architecture summary, and every shipped feature indexed by version (has its own table of contents).
- **`planning/NEXT-SESSION-PROMPT.md`** — current session-resume state: what's open right now, what's closed and shouldn't be re-litigated, load-bearing gotchas in recently-touched code.

If you only have time to read one thing before writing code, read `CLAUDE.md`. Read this doc once to get oriented; read the other two for anything version-specific or currently in flight.

**Current shipped version: v192** (see `sw.js`'s cache string for the ground truth — this number will drift out of date faster than anything else in this file).

---

## 1. WHO / WHAT

- **User:** Wyatt, an Army ROTC cadet (MS2 as of this writing) aiming for a Cyber / 17-series branch.
- **The app — "Operations":** a gamified ROTC + life-tracker PWA for personal use across a Windows laptop, tablet, and phone. Installs via "Add to Home Screen." Data lives per-device in `localStorage`, with an optional cloud-JSON file sync/backup. Military visual theme, Yggdrasil world-tree symbolism throughout.
- **Core idea:** a self-development and performance-tracking system where everything measurable becomes a *skill* with levels, decay, and progression.

### User's working style & values
Iterative — works in sessions, confirms scope before large changes, iterates on names/progressions until they're right. Cares deeply about:
- **Honesty / no faking** — real, evidence-based methods; no invented correlations or faked metrics.
- **Offline & private** — nothing leaves the device, ever.
- **Measurability over status** — a level describes what you can *do*, never a vague tier.
- **Preserved progress** — a migration that loses a level, peak, or history entry is a bug, full stop.
- **Symbolism** — the Yggdrasil tree-of-growth theme is a feature he actively wants woven in, not decoration to strip for convenience.

---

## 2. THE BIG PICTURE: what's actually in this app now

The app has grown across ~190 shipped versions from a simple flat skill list into several interlocking systems. If you're orienting for the first time, here's the shape of it:

- **The skill pyramid** (§3 below) — 12,524 skills across 10 Paths, structured as a five-tier synthesis pyramid (Common → Uncommon → Rare → Legendary → Mythic), not a flat list. This is the single biggest structural fact about the app and the thing most likely to surprise someone expecting the old flat-skill model.
- **FM (the training plan)** — a full adaptive training system: gym-access-aware weekly scheduling, equipment-profile-aware exercise pools with swap/override, adaptive rep/set/weight targets that learn from logged difficulty, a guided mock-AFT walkthrough, and card-game-style gamified workouts (FM-3). See the Plan/Log/AFT tabs.
- **Cognitive testing** — 9 real stealth-assessment mini-games (Sentry, Land Nav Relay, Comms Relay, Perimeter Watch, Fire Discipline, Cipher Desk, Fire Mission, Intel Briefing, Climb the Tree) measuring reaction time, memory, attention, processing speed, math, reading comprehension, and quiz recall — each a real game with the measurement hidden until the round ends, not a gamified trial with a visible score UI.
- **Cross-cutting intelligence layers** — a unified "Upcoming" deadline view (X-Timeline), a cross-domain pattern-insight engine (X-Insight, e.g. "your AFT dips in weeks your streak breaks"), and a whole-tree "what's the single highest-leverage thing to work on" recommender (X-SmartFocus).
- **Records & reflection** — an AFT scoring engine (official Army tables), a structured After-Action Review journal, a counseling log, checklists, awards/memberships/volunteer-hours tracking ("The Wall"), and a read-only Weight promise-ledger mirror (feeding the Integrity skill).
- **Design system** (added v190–v191) — shared `--space-*`/`--radius-*`/`--*-rgb` CSS tokens and `.btn`/`.card` base classes, consumed by all 18 tabs' primary UI.

For exactly what shipped in which version, `planning/FINISHED-FEATURES.md` is authoritative — its table of contents (under "Completed Features by Version") lets you jump straight to any version's entry.

---

## 3. THE SKILL PYRAMID (the heart of the app)

**12,524 skills** across **10 Paths** (themed categories), each Path containing one or more **Mythic trees** — 16 Mythic trees total, each a complete 5-tier synthesis pyramid:

```
Mythic (1)  →  5 Legendaries  →  25 Rares  →  125 Uncommons  →  625 Commons
```

- A skill's `rarity` field (or ladder-depth fallback) places it in this pyramid. Higher tiers "synthesize" from a complete set of 5 lower-tier skills via `synthesizedFrom`/`skCombineSet()` — hitting mastery on all 5 members of a set unlocks the next tier up.
- **Every skill still has the original flat-model properties**: a measurable level ladder (`levels[]`, each rung a verifiable "can do X" capability, top rung anchored to a documented human ceiling), `fadeDays` decay, `peakLevel` tracking, and a floor at level 1 once started — **a skill is never lost**, regardless of pyramid tier.
- **Auto-leveling** (`syncSkillsFromActivity()`) maps real logged performance (AFT events, cognitive test scores, resting heart rate, etc.) directly to ladder rungs for skills with an `auto:` field. These never show tap-to-level UI — they level only from measured data. The one exception that can move *down* as well as up is **Integrity** (`auto:"weight:integrity"`), which mirrors the Weight promise-ledger read-only.
- **10 Paths** (`PATH_META` in `constants.js`): tactical, physical, cognitive, physiological, technical, leadership, academic, personal, hearth, roots — 7 in the tree's crown, 3 in the roots (Self, Hearth, Roots).
- **The Yggdrasil tree view** (`tree.js`) renders the 10 Paths as glowing world-discs on a trunk-and-crown SVG, lit by how far each Path has progressed — not individual skill leaves (that rendered as an unreadable swarm at this scale and was redesigned away in v172). Individual skills are browsed in the List view instead.

**How this got built:** the flat skill system existed first (~v1–v144); the pyramid structure and Mythic/Legendary/Rare/Uncommon tiers came in a series of "Phase 7" and "Commons layer" sessions (roughly v130–v167), building one full Mythic tree's worth of content per session. That whole arc is condensed into one entry in `planning/FINISHED-FEATURES.md` (`v149–v167`) if you need the history — the individual per-tree sessions aren't narrated separately there anymore.

---

## 4. FILE LAYOUT & BUILD ROUTINE

Full current file-by-file layout lives in `CLAUDE.md`'s "Source file layout" table and `planning/FINISHED-FEATURES.md`'s "Architecture Summary" — not repeated here to avoid drift between three copies. The short version:

- `index.html` is **generated** from `src/` via `python scripts/build.py` — never edit it directly.
- `src/core/` holds shared logic (constants, state, skills engine, migration, training data, etc.); `src/tabs/` holds one `.html`+`.js` pair per tab (18 tabs, plus `cardgame.js`, which has no `.html` — it renders into a modal from Coach Today).
- Release checklist: build → `npm run check` (syntax) → `npm run regress` (0 `pageerror` across all 18 tabs) → bump `SKILL_LADDER_VER` if any ladder/tier/guidance text changed → bump the `sw.js` cache version → `npm run package`. Full detail and the *why* behind each step is in `CLAUDE.md`.

---

## 5. STANDING DECISIONS / CONSTRAINTS (keep these true)

- Levels are **measurable capabilities**, never status labels; top level = a real documented ceiling, framed honestly.
- A skill is **never lost** (floors at level 1 once started); peak is tracked; migrations preserve and clamp user progress.
- No automatic device sync is possible in a static offline PWA — manual entry or an explicit local import only. Say so honestly in-app.
- In-app cognitive tests are **relative trackers, not clinical/IQ instruments** — frame honestly.
- Health-adjacent content (BP, hemoglobin, nutrition, stress) is **educational, not medical advice**.
- Everything stays **on-device / in the user's own cloud file** — nothing is uploaded, ever.
- Auto-measured skills must never be self-reportable.
- Every subjective self-rating input (effort, readiness, intensity, mood) uses a real **1-10 scale** — a standing convention since v182–v184, not a coarse 3-way bucket.
- Symbolism (the tree) is a feature, not decoration — weave it in where natural.

---

## 6. MIGRATIONS (critical — the user uploads OLD saves)

The user's backup files are often many versions behind. `mergeNewSeedSkills()` (`src/core/migration.js`) runs on load and must bring any old save fully current **without losing progress**:

1. Adds any new seed skills the save lacks (including whole new Paths or pyramid tiers).
2. Rename-merges renamed skills via the `RENAMES` map — carries the higher progress from the old-named orphan onto the current skill.
3. Force-resyncs ladder/tier/guidance content when `SKILL_LADDER_VER` (currently **118**) is behind the save's stamped version — progress numbers are always preserved through this resync.
4. Recovers clamped progress and reconciles parent/branch/synthesis-set assignments so old saves gain new structure without losing history.

**Always test a skill-content migration against a simulated old save** (strip the new content, set known progress, run the migration, confirm progress preserved + orphans merged + new structure present) before shipping. Full detail and the historical incidents that shaped this discipline (concurrent-write races during the Commons-layer build sessions, a validator introduced partway through that needed a retroactive pass, etc.) are in `planning/FINISHED-FEATURES.md`'s `v149–v167` entry.

---

## 7. HOW TO RESUME

1. Read `CLAUDE.md`, then `planning/NEXT-SESSION-PROMPT.md` for current state.
2. `npm install && npx playwright install chromium` once, if not already done (requires Node.js).
3. Confirm the shipped version: `grep operations-v sw.js`.
4. Edit the appropriate file(s) in `src/`, then `python scripts/build.py`.
5. `npm run verify` (build + syntax + 18-tab regression, zero `pageerror`); `npm run regress -- --shot` if you touched `tree.js`.
6. Bump `SKILL_LADDER_VER` if a ladder/tier/guidance changed; always bump the `sw.js` cache version if something shipped; `npm run package`.
7. Log the session in `planning/SESSION-TIMES.md`, add a `planning/FINISHED-FEATURES.md` entry, update `planning/NEXT-SESSION-PROMPT.md`, commit.

*Maintain the standing decisions in §5 and the user's emphasis on honesty, measurability, and symbolism throughout. The codebase is well-engineered and defensive — keep it that way.*
