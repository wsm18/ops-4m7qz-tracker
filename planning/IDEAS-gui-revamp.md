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
