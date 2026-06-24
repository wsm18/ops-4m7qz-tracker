# SETUP — Operations in VS Code with Claude Code

A step-by-step for picking the project up after cloning the GitHub repo with GitHub Desktop and editing in VS Code with the Claude Code extension.

---

## 1. Get the code

You already have it via **GitHub Desktop → Clone**. Open the cloned folder in **VS Code** (`File → Open Folder…`). VS Code will suggest the recommended extension (Claude Code) from `.vscode/extensions.json`.

## 2. (Optional but recommended) install the dev tooling

You only need this to run the automated **tests and packaging**. The app itself runs without it.

Open a terminal in VS Code (`Terminal → New Terminal`) and run:

```bash
npm install                    # installs Playwright (dev-only test dependency)
npx playwright install chromium   # downloads the headless browser used by the regression test
```

Requirements: **Node.js 18+** and **Python 3** (Python is only used to regenerate icons and build the preview; `make_icons.py` uses Pillow — `pip install pillow` if you don't have it).

If you skip this, you can still edit and preview the app manually (step 5), you just won't have the one-command test/package.

## 3. Point Claude Code at the project context

When you start a Claude Code session, tell it to read the docs first. A good opening prompt:

> Read CLAUDE.md and OPERATIONS-HANDOFF.md, then confirm you understand the project, the current version, and the build/verify/package workflow before we start. Don't change anything yet.

Claude Code automatically picks up **CLAUDE.md** as repo instructions, but asking it to confirm context first keeps it on the rails. The key rules it must follow are in CLAUDE.md (honesty, offline, preserve progress, auto-skills-never-self-reportable, bump versions, run the regression).

## 4. The edit → verify → package loop

```bash
# after Claude makes an edit to index.html:
npm run check         # fast syntax check (no browser)
npm run regress       # loads the app headless, clicks all 16 tabs, asserts no JS errors
npm run verify        # = check + regress

# when changing the tree, capture a screenshot to eyeball it:
npm run regress -- --shot     # writes dist/tree.png  (open it in VS Code)

# before shipping a change:
#   - bump SKILL_LADDER_VER in index.html  (only if a skill ladder/tier/guidance changed)
#   - bump the cache string in sw.js:  operations-vNN -> vN+1   (always)
npm run package       # regenerates icons + builds dist/operations.zip and dist/operations-preview.html
```

The regression passes when it reports **0 pageerror**. Console 404/403 noise from the local test server is normal and does not fail it.

## 5. Preview the app while developing

Three ways, easiest first:

- **Single-file preview:** open `dist/operations-preview.html` in a browser (it has `quizbank.js` inlined, so it works as one file). Rebuild it with `npm run preview` or `npm run package`.
- **Served (enables the service worker / PWA features):**
  ```bash
  python3 -m http.server 8080
  # open http://localhost:8080/index.html
  ```
- **VS Code Live Server** extension, pointed at `index.html`.

The app stores data in `localStorage`, so each browser/profile is its own device. To test a fresh state, use the browser devtools to clear site data, or the app's own **reset everything** link.

## 6. Test against your real save (important)

Because your backup files are often several versions old, test that loading them migrates cleanly:

1. Open the app (served or preview).
2. Use **import backup** (Profile tab settings row) and pick your `operations-data.json`.
3. Confirm your skills look right (e.g. Push-ups is a single skill with the full ladder, your levels intact, the two root Paths present).
4. If anything looks stale, use **resync skill trees** (same settings row) to force every ladder to the current version while keeping your progress.

When Claude changes skills, ask it to also run a migration check against a simulated old save (see CLAUDE.md → Migrations).

## 7. Commit & push

Use GitHub Desktop to review the diff, commit, and push. **Do not commit** `dist/`, `node_modules/`, or scratch `_*` files — they're already git-ignored. A good commit includes: the `index.html` change, the bumped `sw.js` (and `SKILL_LADDER_VER` if relevant), and nothing generated.

## 8. Deploy / install on devices

The app is static files, so any static host works (e.g. **GitHub Pages** from the repo root). Once hosted, open the URL on each device and **Add to Home Screen**. Or sideload `dist/operations.zip` per the existing `HOW TO INSTALL.txt`. After any update, **hard-refresh or fully reopen** the app so the new service worker activates (the SW is network-first for app code as of v86, so being online is enough to pick up the latest).

---

## Troubleshooting

- **`npm run regress` can't find a browser** → run `npx playwright install chromium` again; the script auto-detects Playwright's local Chromium.
- **`make_icons.py` fails** → `pip install pillow` (a.k.a. PIL). Icons rarely change; not needed for normal edits.
- **App shows an old version after deploy** → hard-refresh; on iOS fully close the PWA and reopen. The cache version in `sw.js` must have been bumped for the SW to replace the cached app.
- **A skill looks stale / wrong ladder after importing an old save** → use the in-app **resync skill trees** link; if it persists, it's a migration gap — tell Claude which skill and share the save's entry for that skill.
- **Big diffs / line numbers moved** → expected after edits to `index.html`; have Claude re-read the region before a follow-up edit.
