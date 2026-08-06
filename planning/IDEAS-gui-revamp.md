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

## Status: not yet scoped into a build plan

This session's priority is finishing the last Mythic tree's Commons layer (see `planning/IMPROVEMENTS-v167.md` / `NEXT-SESSION-PROMPT.md`). Per `CLAUDE.md`'s "ask before large architectural shifts" rule, this revamp needs its own dedicated design pass — auditing what's actually built today (`src/tabs/skills.html`/`skills.js`, `src/core/tree.js`, `src/core/skills-core.js`), identifying concrete pain points, and proposing specific changes — before writing any implementation plan. That design pass should happen in its own session (or the start of the next one), not squeezed into the tail end of the tree-completion work.

**Next step when this is picked up:** read this doc, then audit the current skills tab (list view + tree view) and pyramid/unlock UI against the 4 pain points above, then bring concrete design options back to Wyatt (likely via `AskUserQuestion` or a walkthrough) before implementing.
