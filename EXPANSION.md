# Operations → The Long Campaign — Expansion Brief

*A campaign of a life, woven honest — the saga of one cadet becoming an officer, sung only from deeds that actually happened.*

---

**The shift.** Today Operations is a magnificent *state machine*: it knows what you can do right now — 6,274 skills, an AFT board, a Yggdrasil tree of levels, decay, and peaks. But it has almost no sense of **time as a story**. It can tell you your Land Nav is Lv 3; it cannot tell you the *saga* of how you got here, what season you're in, or which rites still stand between you and commissioning. The Long Campaign turns the tracker into a **living saga**: the year becomes turning seasons, real deeds become a chronicle, the commissioning arc becomes a series of true rites of passage, and the three Norns at the root of the world-tree weave your past, present, and the debt you owe your future self — all from real data, none of it invented. The tree is the *where*. This is the *when*.

---

## Vows carried through every phase (non-negotiable)

These are the project's existing ethos, restated as the vows every phase below must keep. If a feature can't be built without breaking one, it doesn't get built.

- **One offline single-file PWA.** Ship stays `index.html` (assembled from `src/` via `python scripts/build.py`) + `quizbank.js` + `sw.js`. No framework, no CDN, no external fonts, **no network calls, no telemetry, ever.** Every new season, chronicle, and saga must render with the wifi off.
- **Honest data in, no fake gamification.** The saga narrates only what actually happened. A rite is marked when the *real* rite occurred, never as a tap-to-win. When a season was quiet, the chronicle says it was quiet. No invented deeds, no invented correlations, no morale-boosting lies.
- **Measurability over status.** Levels still describe what you can *do*; the Legend sheet aggregates real numbers, never awards a vibe. "Legend" is a *portrait of measured deeds*, not a rank label.
- **Progress is sacred.** A started skill still floors at L1 (`skEffectiveLevel`); peaks are still tracked; **every migration preserves every level, peak, and history entry.** Seasons and rites are *added on top* of the existing save — never at the cost of a single logged fact.
- **Earned, not self-reported.** Auto skills stay auto. Rites gate on logged evidence (an AFT record, an award entry, a dated event), not on a checkbox of good intentions.
- **Symbolism is a feature.** The Norns, the seasons, the skald, and the rites extend the existing Yggdrasil frame coherently — they are not decoration bolted on. The root worlds (Self, Hearth, Roots) are where the Norns already belong.
- **Low-RAM, built to scale.** The app already targets 10,000+ skills. New static/authorial content lives in seeds and resolves via hydration (`skHydrate`/`skSeedOf`); only user-owned data (deeds, dates, notes) is persisted per entry. No new field gets duplicated onto every live object without the storage-discipline check.
- **Single-user and private.** Data stays in `localStorage["operations_v2"]` plus the user's own cloud-JSON file. Nothing leaves the device.
- **Build discipline holds.** Every shipped change: edit `src/`, `build.py`, `npm run verify` (0 `pageerror`), bump `sw.js` cache, bump `SKILL_LADDER_VER` only if a ladder changed, `npm run package`, log the session in `planning/SESSION-TIMES.md`, commit before ending.

---

## Phase 0 — Stringing the Loom
*Before a saga can be sung, gather every real deed onto one thread.*

The cheapest, highest-soul move: a **read-only Chronicle** that aggregates every dated fact the app already stores into one honest, scrollable timeline. No new data model — pure aggregation over data you're already logging, the same low-risk shape as the Grove and Carved Rings tabs.

- **New module `src/core/chronicle.js`** exposing `buildChronicle()` → a `ts`-sorted array of `{ts, date, kind, path, title, detail, tab}` entries, merged from the arrays that already exist in `DEFAULT` (`src/core/constants.js`): each `sk.history[]` across `S.lifeSkills` (kinds `reach`/`qualify`), `S.aft[]`, `S.awards`/`S.academicHonors`/`S.events`/`S.volunteer`/`S.memberships`, `S.qualifications[]`, `S.counseling[]`, `S.baselines[]` PRs, `S.milestones[]`, and kept/broken vows from `S.weight.promises`.
- **Surface:** a `renderChronicle()` view. Cheapest home is a new section in the existing history-and-trends tab (`src/tabs/records.{html,js}`), avoiding a new nav tab; if it earns its own tab instead, update `TAB_HTML`/`JS_FILES` in `scripts/build.py` **and** the tab-count assertion in `scripts/regress.js` (currently 18). Reuse `miniSparkline()` (`state.js`) for trend flourishes, `esc()` for safety, and the existing `[data-gototab]` delegation so each entry links back to its home tab.
- **Forward half of the loom** (the X-Timeline idea already scoped in `IDEAS-tests-fm-workouts.md`): `buildUpcoming()` merges every real *future* date — quest `due`, `S.aftTestDate`, `S.milestones[].date`, `qual.expires`, and (once P3 lands) rite target dates — into a "what is coming" band, so the timeline reads past → now → owed.
- Honesty guard: empty stretches render as empty. No filler rows, no invented entries.

**Why first:** aggregation, not architecture; a real daily win immediately; and the literal foundation every later phase reads from.

**Acceptance:** loading a real (or old) save renders every dated fact in it as one descending timeline with zero fabricated rows, each row deep-links to its source tab, and `npm run regress` passes with 0 `pageerror`.

---

## Phase 1 — The Wheel of Seasons
*A life is lived in chapters. Give the campaign its turning seasons.*

Divide the campaign into named **Seasons** — chapters mapped to the real ROTC / academic calendar (Fall term, Winter, Spring term, FTX/lab pushes, Advanced Camp, the summer between MS years). A season is the unit of the saga: it opens with a muster and closes with a reckoning.

- **Schema (added to `DEFAULT` in `src/core/constants.js`):** `S.seasons:[]` of `{id, name, kind:"fall|winter|spring|summer|camp|ftx", start:"YYYY-MM-DD", end:"YYYY-MM-DD", focusPaths:[pathKey], oathIds:[questId], riteKey:null, reckoning:{whatIntended, whatHappened, why, sustain, improve, ts}|null}`, plus `S.currentSeasonId:null`. These are the RPG "acts" the given vision asks for, grounded in the real calendar rather than an arbitrary clock. `mergeNewSeedSkills()` (`migration.js`) already backfills missing `DEFAULT` keys onto old saves — verify it seeds `seasons`/`currentSeasonId` without disturbing existing data.
- **New module `src/core/seasons.js`:** `currentSeason()`, `seasonOf(ts)` (used by `chronicle.js` to group entries under season headers), `openSeason(kind, name, start, end)`, `closeSeason(id, reckoning)`, `seasonWeek()` (N of M from start/end).
- **The Muster** (season open): set the season's `focusPaths` (from `PATH_META` keys), tag existing quests as oaths via `oathIds`, and point `riteKey` at the rite you're marching toward (P3). Reuse the quest editor and `events.js` body-delegation; wire `data-seasonopen`.
- **The Reckoning** (season close): a structured **After-Action Review** (the X-AAR idea already green-lit in `IDEAS-tests-fm-workouts.md`: intended / happened / why / sustain / improve), stored on the season's `reckoning` field rather than a parallel array. Contextually promptable at a season boundary or off the existing streak-break detection (`streakBrokenDate` / `events.js`) and bad-AFT detection (`aftRegressionCard` / `aft.js`).
- **Dashboard banner:** `today.js` gains a quiet "You are in **[Season] · week N of M**" line, in the same restrained register as the existing commissioning-memento (v101) and rotating creed.

**Why here:** seasons are the container every later phase hangs on — the chronicle groups by them, the skald narrates them, rites close them.

**Acceptance:** opening a season, tagging oaths to it, and closing it with a Reckoning makes that AAR appear in the Chronicle under the correct season header; a stripped old save loads and gains `seasons`/`currentSeasonId` with every prior level, peak, and history entry intact.

---

## Phase 2 — The Legend
*One page that answers the only question that matters: who is this cadet becoming?*

A single evolving **Legend sheet** — the RPG character sheet the vision names — that gathers the whole person into one honest portrait that visibly grows season over season. Not a fantasy stat block: a *measured* one.

- **Surface + render:** new `src/tabs/legend.{html,js}` with `renderLegend()` (register it in `build.py` + `regress.js` as above). Read-only aggregation of: the ten rolled Path levels (`catRolledLevel(cat)` over `PATH_META`, already computed for the Grove), peak sum from Carved Rings (`peakLevel` / `trophies.js`), latest `S.aft[]` total + pass status and `aftStandard`, service hours (`S.volunteer` summed as in `renderVolunteer`), award/membership counts, the latest vitals headline (RHR from `S.vitals`), and the Integrity reading (`integrityLevel()` off `S.weight.promises`).
- **Presentation:** a dossier-meets-saga-frontispiece — reuse the Personnel-File dossier CSS chamber (`#view-profile`) and the sigil generator (`skEmblemSvg`, `skills.js`) for the crowning marks.
- **Growth is the feature:** add `S.legendSnapshots:[]` of `{ts, seasonId, pathLevels:{}, aftTotal, peakSum, serviceHrs, awardCount}`, stamped by `closeSeason()` (P1). Render *then → now* deltas from the two most recent snapshots — honest arithmetic on real numbers, never a padded stat.
- **Export:** `copyLegend()` modeled directly on the existing `copyWallResume()` in `awards.js` — a plain-text portrait to clipboard/print, on-device only. A page you could hand to cadre.

**Why here:** with the Chronicle (P0) and Seasons (P1) in place, the Legend has real history to draw a *growing* portrait from instead of a static snapshot.

**Acceptance:** the Legend renders all ten Path levels + AFT + service + peak sum from a real save; `closeSeason()` appends exactly one snapshot; after ≥2 snapshots the sheet shows then→now deltas; `copyLegend()` produces a plain-text portrait with no fabricated fields.

---

## Phase 3 — Rites of Passage
*The campaign's true bosses are its thresholds. Make crossing them mean something.*

The commissioning path is a sequence of real, irreversible **rites** — not skills that decay, but thresholds you cross once and carry forever. Model them honestly and let the saga mark them.

- **Seed catalog:** a `RITE_CATALOG` const in `constants.js` (sibling to the existing `QUAL_CATALOG`), each `{key, name, msYear, requires:{qual?:qualKey, event?:matcher, aftMin?, gpaMin?, boardTask?}, }`, plus live `S.rites:[]` of `{key, date:null, snapshotTs:null}`. Canonical arc: MS1→MS2→MS3→MS4 transitions, contracting, CWST, day/night land nav, BRM, CIET/Basic Camp, Advanced Camp, the branch/OML board, and **commissioning**. Several `requires` map straight onto existing `QUAL_CATALOG` keys (`cwst`, `landnav_d`, `landnav_n`, `brm_*`) so evidence is already being logged.
- **Evidence, not taps:** `riteEvidence(rite)` returns a fill fraction by checking `S.qualifications` (by `key`), `S.events`, latest `S.aft` total vs `aftMin`, `S.gpaHistory` vs `gpaMin`, and `S.boardTasks` done — never a manual HP tap. Render by extending the **Objectives** HP-bar visual (`renderBosses` in `state.js` / `bosses.js`) in a read-only variant; surface in a new `src/tabs/rites.{html,js}` or a Rites section on the board tab.
- **Crossing:** `crossRite(key, date)` records the date, stamps a `legendSnapshot` (P2) tagged `snapshotTs`, pushes a Chronicle entry, and fires the existing `showLevelUp()` in a rite-appropriate key. Reuse the commissioning-memento logic (`today.js`, v101) and `profile.commissionDate` for the final rite.
- Honesty guard: a rite is only ever marked from satisfied `requires` evidence or an explicit "this happened on [date]" confirmation — never auto-assumed, never faked forward.

**Why here:** rites are the season-spanning spine of the *whole* campaign; they need the season structure (P1) and the Legend snapshot (P2) to be worth crossing.

**Acceptance:** logging a qualification (e.g. `landnav_n`) visibly fills the matching rite's evidence bar; crossing a rite writes a dated, snapshot-stamped entry into the Chronicle; and no rite can reach "crossed" without either satisfied `requires` or an explicit dated confirmation.

---

## Phase 4 — The Norns at the Root
*Past, present, and the debt owed — the honest weave of a fate you are making.*

At the root of the existing Yggdrasil tree sit the three Norns of Old Norse cosmology — Urðr (*what became*), Verðandi (*what is becoming*), Skuld (*what is owed*). This is the app's honesty philosophy made mythic: **your wyrd is literally the sum of your logged deeds.** The soul-fit is already in the code: `PATH_META.roots.idol` is literally `"Well of Urðr"` — the Norns' well already sits at the tree's root.

- **New module `src/core/norns.js`:** `urdrThreads()` (high-water peaks from `peakLevel` + Chronicle rites — what became), `verdandiThreads()` (`skEffectiveLevel` + `skFadeState` across started skills — what is), `skuldThreads()` (the debt: skills below peak via `skDaysLeft`/peak-gap, distance to the next rite from `riteEvidence()`, and commissioning gaps).
- **Render** in `tree.js`'s root zone (Self / Hearth / Roots worlds) as three strands drawn from the Well of Urðr into the trunk — keeping pan/zoom, the overlap-safety check, and the List↔Tree toggle intact per the tree's standing rules; verify with `npm run regress -- --shot`.
- **Skuld's one focus** = the X-SmartFocus recommender scoped in `IDEAS-tests-fm-workouts.md`: weight decay urgency × Path priority toward `S.branchGoal` and the next rite, surfacing the single highest-leverage skill *with its reason* — framed as "the debt the Norns say you owe your future self."
- Honest framing throughout: a *reading of your own data*, not prophecy. A `MIN_SAMPLE` gate means a thin dataset yields "not enough logged yet" rather than a confident guess (the same honesty bar the X-Insight design already demands). Skuld shows debts and gaps, never guarantees.

**Why here:** the most analytically demanding phase, and it *synthesizes* P0–P3 (chronicle, present state, rites) into one meaning-bearing view — best built once those exist to draw from.

**Acceptance:** the tree roots render three honest strands from real state, Skuld names the single highest-leverage skill and *why*, a deliberately thin save yields the "not enough logged yet" message instead of a guess, and the tree overlap check + `--shot` pass.

---

## Phase 5 — The Skald
*Let the deeds be sung — an honest saga, generated on-device, never invented.*

A fully-offline, **deterministic** narrative engine that renders a season's real logged deeds into saga prose — a chronicle you can read like an old book. The phase that most directly honors the love of old libraries and the deep past, and the one bound hardest by the honesty vow.

- **New module `src/core/skald.js`:** `sagaForSeason(seasonId)` reads that season's `buildChronicle()` slice (P0), its rites crossed (P3), and its `reckoning` (P1), and assembles plain, dignified prose by pure string templating ("In the Fall season the cadet crossed the night land-nav rite, raised the Path of War two levels, and held every dawn oath but three"). Every clause traces to a logged fact.
- **Strictly honest, strictly local:** no LLM, no `fetch`, no CDN, no fabrication — deterministic templates keyed by entry `kind`, with honest fallbacks ("the season was quiet — three oaths held, no rite crossed"). Keeps the "no in-app AI / stay deterministic" stance from `operations-expansion-outline.md`. A dull true season reads as a dull true season.
- **Register:** the app's plain honest voice with a light saga cadence — small-caps season headers, the wood-and-vellum CSS chambers already built. No purple prose, no hype.
- **Export:** `copySaga(seasonId | "all")` modeled on `copyDailyBrief()` / `copyWallResume()` — a printable heirloom chapter (or whole campaign), on-device only.

**Why here:** the skald needs seasons (P1), rites (P3), and the chronicle (P0) to have something true to sing.

**Acceptance:** generating a saga for a real season yields prose where every clause is traceable to a logged fact, an empty season reads honestly as empty, it runs with the network fully off (no `fetch`/CDN references), and syntax + regress stay clean.

---

## Phase 6 — The Long Campaign
*Bind the seasons into one arc that outlives any single term.*

The capstone: stop showing one season at a time and show the **whole campaign as one legend** — MS1 through commissioning, and the road beyond into the officer years.

- `campaignArc()` chains every `S.seasons` reckoning, every crossed rite, and the `S.legendSnapshots` growth curve into one continuous spine — the Norns' weave read across years, not weeks. Render on `legend.js` (a whole-campaign mode) or a dedicated capstone view.
- The commissioning rite (P3) becomes the campaign's great threshold, not its end: extend `RITE_CATALOG` with a **post-commissioning** chain (BOLC, the 17-series / cyber officer path) gated behind the commissioning rite, so the app keeps meaning after the gold bar — the campaign is a life, not a checklist.
- Whole-campaign exports: `copySaga("all")` at book length (P5) and `copyLegend()` across all snapshots (P2) — the honest story of who you became, kept in your own hands.

**Why last:** pure synthesis — nothing new to measure, everything already built now bound into one arc.

**Acceptance:** after ≥2 completed seasons the arc view shows the continuous spine (seasons → rites → legend-snapshot growth), the post-commissioning rite chain stays locked until the commissioning rite is crossed, and the full `npm run verify` + `npm run package` pipeline is clean.

---

## Beyond

The Long Campaign turns Operations from *a tracker you check* into *a saga you are living inside* — the single most distinctive thing this app could become, because it needs exactly the large, honest, cross-domain, longitudinal dataset that only this app already has. Where it leads next:

- **The already-scoped workstreams feed it.** The stealth-assessment games (Phase T), gym-schedule-aware planning (FM-1/2), and card-game workouts (FM-3) in `IDEAS-tests-fm-workouts.md` all become *deeds the skald can sing and seasons can muster toward* — the Campaign gives them a narrative home. The pyramid Commons layer (the current v150→ workstream) becomes the raw material the Legend and Norns reason over. None of that work is wasted; the Campaign is the frame that unifies it.
- **The X-Insight engine finds its voice.** Cross-domain patterns ("your AFT dips in weeks your streak breaks") read naturally as Skuld's counsel — honest observations, not predictions, exactly as that idea already requires.
- **Natural synergies with the wider profile, if fitting.** The Weight promise-ledger is already mirrored in as Integrity; the same honest-mirror pattern could let the Campaign quietly acknowledge parallel efforts (a Muster board, a Quartermaster inventory, a cyber playbook's phase count) as deeds in the chronicle — always offline, always read-only, always opt-in, never reaching across the network. The saga export is the kind of artifact that belongs in the personal data vault, not in any cloud.

---

## Suggested order

Ordered by depth-per-effort — each phase is buildable on its own and leaves the app shippable, and each later phase reads from the ones before it.

1. **Phase 0 — Stringing the Loom** (cheap aggregation, foundational, immediate daily win)
2. **Phase 1 — The Wheel of Seasons** (the container everything else hangs on)
3. **Phase 2 — The Legend** (needs P0+P1 to draw a *growing* portrait)
4. **Phase 3 — Rites of Passage** (the campaign spine; needs seasons + the Legend snapshot)
5. **Phase 4 — The Norns at the Root** (the analytical synthesis of P0–P3)
6. **Phase 5 — The Skald** (needs real seasons + rites to have something true to sing)
7. **Phase 6 — The Long Campaign** (pure capstone synthesis)

P0–P2 are the honest, high-value foundation and could ship as a first flagship milestone on their own. P4 (Norns) and P5 (Skald) are the two phases to slow down on — both live or die by the honesty vow, and both deserve their own design pass (confidence-gating for Skuld; the strict no-fabrication templating rule for the skald) before a line of code, exactly the deliberate way the FM and stealth-game ideas were worked out.

## ⚖️ Decisions to settle at construction
_Open forks — raise each when you build its phase, not before. Pick the default in the moment._

- P0/2/3 Nav: three new tabs, or fold into the existing 18-tab strip.
- ⚠️ P1 Season boundaries: your real term / FTX / camp dates — auto from a calendar you enter once, or hand-defined.
- ⚠️ P3 Rite catalog: your actual commissioning milestones + each rite's evidence bar (AFT/GPA/quals/board).
- P4 Readiness weights: which Paths matter most for a Cyber/17-series branch.
- Priority: ahead of / after / interleaved with your live Commons + FM workstreams.

## In the web
- **Needs <-** your real ROTC data.
- **Feeds ->** personal (a life-saga toward commissioning).
