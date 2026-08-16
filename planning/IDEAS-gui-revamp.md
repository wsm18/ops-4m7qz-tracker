# IDEAS-gui-revamp — whole-app GUI revamp (queued, post-Cyber-Operator-tree)

Requested by Wyatt during the v167 (Cyber Operator Commons) session, 2026-08-06. Scope confirmed via `AskUserQuestion`: **all four** of visual/theme refresh, layout/navigation restructuring, mobile/responsive overhaul, and a specific priority on the skills tab. His own words on the skills tab specifically:

> "make sure that the gui for skills is better laid out, they are very much so not looking like they could, and there are a lot where I can not see them, and also skills can get cluttered, but have them organized in orders in some way that makes true sense along with being actually useful and the way its laid out currently is not helpful, and how to unlock skills is also not well laid out"

## What this means, unpacked

1. **Visual/theme refresh** — colors, typography, spacing, polish. Keep the existing Yggdrasil tree-of-growth symbolism (hard rule in `CLAUDE.md` — don't strip it for convenience) but make it look more refined.
2. **Layout/navigation restructuring** — how tabs/nav/screen layout are organized, not just visual polish. This is a bigger structural change than #1.
3. **Mobile/responsive overhaul** — specifically how the app looks and behaves on phone-sized screens.
4. **Skills tab specifically (explicitly named as the priority pain point):**
   - **Visibility**: skills exist that the user "can not see" — likely a discoverability/scroll/collapse problem in the current `skills.js` / tree renderer, worth auditing given the tree now holds 12,000+ skills across 16 Mythic trees.
   - **Clutter**: too many skills shown at once without a sensible grouping — needs real information architecture, not just visual tidying.
   - **Organization**: skills need to be grouped/ordered "in some way that makes true sense" AND is "actually useful" — this is two bars, not one: a scheme can be internally logical (e.g. alphabetical, or by rarity) without being useful for the user's actual workflow (e.g. "what should I work on next," "what's decaying," "what's close to unlocking"). Needs design thought, not just implementation.
   - **Unlock clarity**: how skills unlock (the pyramid Common→Uncommon→Rare→Legendary→Mythic synthesis system) is "not well laid out" — the underlying mechanic (`skSetMembers`, `skCombineSet`, Side Deck, Chain view in `skills.js`) may already support what's needed; this could be a presentation/UX problem on top of working mechanics, not a mechanics problem. Needs investigation before assuming a redesign of the mechanic itself.

## Status: skills-tab pain points fixed (v172); visual/nav/mobile still unscoped

**v172 closed out the skills-tab-specific priority (item 4 above).** Audit + fixes are done — see the v172 entry in `planning/FINISHED-FEATURES.md` for the full writeup. Summary:

- **Visibility root cause found and fixed:** `tree.js` was drawing every top-level skill (up to 1500+ per Path) as an individual leaf, which is what made skills "not visible" — they overlapped into an unreadable mess. Per Wyatt's confirmed direction, the tree now shows **only the 10 worlds**, each lit by how far its Path has progressed (`catProgressFraction` in `skills-core.js`) — no individual skill leaves at all. Individual skills are browsed in the List view, which already handles that at scale.
- **Clutter / organization:** Wyatt confirmed he likes the current List view's card/deck/pyramid layout as-is — **not touched**. Only additions: a new always-visible **Focus strip** (decaying soon / behind target / ready to combine) so "what to work on next" doesn't require hunting for a hidden toggle.
- **Unlock clarity:** a single collapsed pyramid explainer near the top of the tab, plain copy, collapsed by default.

**Still open, still unscoped:** visual/theme refresh (#1), layout/navigation restructuring (#2), mobile/responsive overhaul (#3). Wyatt confirmed these get their own dedicated session — skills tab was the priority and came first. When picked up: same audit-first approach (read what's built, identify concrete pain points, bring design options back via `AskUserQuestion`) before implementing, per `CLAUDE.md`'s "ask before large architectural shifts" rule and the project's standing feature-intake method.

## Status update — v190, Phase A of a scoped plan shipped

That dedicated session happened in v190. Wyatt confirmed real scope via `AskUserQuestion`: "visual AND structural" for Plan/Log/AFT specifically, "open to a fuller creative redesign" for the app-wide visual system (not the v174 "light polish only" boundary), and a nav reorg because "the 7/11 split itself feels arbitrary." Two research-agent audits (CSS visual system, nav structure) plus direct reads of `plan.html`/`log.html`/`aft.html` confirmed real, concrete problems — not just taste — and a plan-mode session produced an approved, deliberately-phased plan (full reasoning in the v190 `FINISHED-FEATURES.md` entry, since "full visual redesign + 3-tab structural rework + nav reorg" is genuinely large — 45+ button classes, 40+ card classes, 18 tabs — and doing it all in one pass risked a sloppy, hard-to-verify mega-diff).

**Phase A shipped in v190:** design-system foundation (spacing/radius tokens, RGB color tokens + a 197-occurrence mechanical sweep off raw `rgba()` literals, a dead-font cleanup, new shared `.btn`/`.card` base classes applied to Plan/Log/AFT's own components), the Plan tab restructure (removed a real content-integrity bug — a static "Glossary" that duplicated `EX_HOWTO` content and could drift — replaced with a live per-exercise how-to expand; grouped equipment/weather/gym-access/adaptive-targets into a collapsed "Setup" section so Coach Today is the first thing you see), the Log tab's 3x-duplicated rating-scale markup deduped into one function, and a real nav reorg (category group headers replacing two flat lists, grounded in a git-archaeology-confirmed finding that the old 7/11 split had zero documented rationale — pure historical accretion).

**Phase B shipped in v191, immediately after Phase A.** All three sub-threads confirmed via `AskUserQuestion` and done: the other ~15 tabs' card/button classes (25 cards + 12 buttons) retokenized onto the `--space-*`/`--radius-*` scale (same colors, same near-identical pixel values — a mechanical migration, not a redesign); the Weight tab's serif font + separate tan palette confirmed intentional and documented with a comment (not touched); the nav's category group headers are now collapsible (click to show/hide a group's tabs, defaults expanded, DOM-only state). Full detail in the v191 `FINISHED-FEATURES.md` entry.

**Nothing queued next from this doc.** The GUI-revamp workstream (visual/theme, nav/layout, mobile, skills tab) that's been open since v167 is now fully closed out across all its sub-items. Any further GUI work is a fresh ask, not a continuation.
