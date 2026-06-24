#!/usr/bin/env python3
"""
build.py — assembles src/ source files into the shipped index.html

Usage (from project root):
    python scripts/build.py

Source layout:
  src/_shell.html        outer HTML frame with @@INJECT_*@@ placeholders
  src/styles/main.css    all CSS
  src/tabs/*.html        one <section> block per tab (HTML structure)
  src/tabs/*.js          render logic + event handlers per tab
  src/core/*.js          shared state, helpers, skill system, tree, etc.

JS files are concatenated in the same order they appeared in the original
monolithic script, preserving all const/let dependency order.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC  = os.path.join(ROOT, 'src')

def read(rel):
    p = os.path.join(SRC, rel)
    if not os.path.exists(p):
        print(f"MISSING: src/{rel}", file=sys.stderr)
        sys.exit(1)
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()

# ── Tab HTML ──────────────────────────────────────────────────────────────────
# Order matches the original HTML structure (determines DOM/CSS z-order).
TAB_HTML = [
    'tabs/today.html',
    'tabs/quests.html',
    'tabs/dailies.html',
    'tabs/bosses.html',
    'tabs/board.html',
    'tabs/shop.html',
    'tabs/quizzes.html',
    'tabs/aft.html',
    'tabs/profile.html',
    'tabs/test.html',
    'tabs/log.html',
    'tabs/skills.html',
    'tabs/garden.html',
    'tabs/plan.html',
    'tabs/awards.html',
    'tabs/records.html',
    'tabs/weight.html',
    'tabs/trophies.html',
]

# ── JS files ─────────────────────────────────────────────────────────────────
# Order matches the original script execution order.
# function declarations are hoisted, but const/let run in sequence —
# keep this list in the same order the code appeared in the original file.
JS_FILES = [
    # Core: constants and data models
    'core/constants.js',       # DEFAULT, TRACKS, VALUES, SESSIONS
    'core/training.js',        # WEATHER, WEEK_PLAN, EX_HOWTO, PT_AREAS, parsePT
    'core/state.js',           # KEY, load, save, render, simple tab renderers, esc
    'core/events.js',          # nav/body events, add-buttons, backup/reset, toast, showLevelUp
    # Tab implementations (in original file order)
    'tabs/quizzes.js',         # renderQuizzes, quiz state machine, parseTime
    'core/aft-scoring.js',     # AFT_TABLES, aftLookup, clampScore, score_* helpers
    'tabs/aft.js',             # renderAft, renderAftStandardBar, EVENT_FOCUS
    'tabs/log.js',             # workout log, PT system, fmtSec, AREA_LABEL, baseline
    'tabs/plan.js',            # renderSkillBalance, renderCoachToday, renderBaseline
    'tabs/board.js',           # renderBoard, add-task handler
    'tabs/weight.js',          # W_WEIGHTS, coin jars, renderWeight, importWeightLedger
    'tabs/awards.js',          # renderAwards, renderMemberships, renderEvents, renderVolunteer
    'tabs/profile.js',         # renderProfile, blood type, vitals, Apple Health parser
    'tabs/dailies.js',         # HABIT_STARTERS, habit logic, renderHabits
    'tabs/test.js',            # TESTS, reaction/digit/typing/nback/etc, SRS, palace, study
    'tabs/records.js',         # trendLine, renderHistory, renderCounsel, renderChecklists
    'tabs/today.js',           # renderToday, makeStudyPlan
    # Core: skill system (large data after tab code)
    'core/app-setup.js',       # skills-UI wiring, award/event editors, cloud file system
    'core/skills-data.js',     # SK_CAT, SK_CAT_ORDER, SEED_SKILLS, seedSkillsIfEmpty
    'core/migration.js',       # SKILL_LADDER_VER, RENAMES, mergeNewSeedSkills
    'core/auto-level.js',      # syncSkillsFromActivity, integrityLevel, rhrToLevel
    'core/skills-core.js',     # skSubsOf, skill calc fns, skCreate/Edit, skLeafColor
    'core/tree.js',            # SK_PATH_ICON, Yggdrasil SVG renderer, pan/zoom
    'tabs/skills.js',          # renderSkillsTab, skTier, skProgressBlock
    'tabs/garden.js',          # renderGarden, path idols, The Grove tab
    'tabs/trophies.js',        # renderTrophies, Carved Rings cabinet
    'core/init.js',            # SW register, seedSkillsIfEmpty(), render()  ← always last
]

# ── Assemble ──────────────────────────────────────────────────────────────────
css      = read('styles/main.css')
tab_html = '\n'.join(read(f) for f in TAB_HTML)
js       = '\n'.join(read(f) for f in JS_FILES)

shell = read('_shell.html')
shell = shell.replace('@@INJECT_CSS@@',  css)
shell = shell.replace('@@INJECT_TABS@@', tab_html)
shell = shell.replace('@@INJECT_JS@@',   js)

out_path = os.path.join(ROOT, 'index.html')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(shell)

line_count = shell.count('\n') + 1
print(f"OK index.html  ({line_count:,} lines | {len(JS_FILES)} JS modules | {len(TAB_HTML)} tab views)")
