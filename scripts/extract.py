#!/usr/bin/env python3
"""
One-time extraction script: reads index.html and splits it into organized
source files under src/. Run once after cloning or after merging a legacy
monolithic index.html. The normal workflow is: edit src/ files -> npm run build.

Usage (from project root):
    python scripts/extract.py
"""
import os, sys

HERE  = os.path.dirname(os.path.abspath(__file__))
ROOT  = os.path.dirname(HERE)
HTML  = os.path.join(ROOT, 'index.html')
SRC   = os.path.join(ROOT, 'src')

with open(HTML, 'r', encoding='utf-8') as f:
    lines = f.readlines()

total = len(lines)
print(f"Reading index.html ({total} lines)...")

def ex(s, e):
    """Extract 1-indexed lines s..e (inclusive) as a single string."""
    assert 1 <= s <= e <= total, f"Bad range {s}..{e} (file has {total} lines)"
    return ''.join(lines[s-1:e])

def write(rel, content):
    path = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    n = len(content.splitlines())
    print(f"  wrote  src/{rel:<38} ({n:>4} lines)")

# ── SHELL HTML ────────────────────────────────────────────────────────────────
# Assembled from non-content fragments; build.py injects CSS, tab HTML, and JS.
head           = ex(1,    15)    # DOCTYPE + <head> meta/links (before <style>)
body_nav       = ex(939,  994)   # </head><body>…nav…<div class="content-col">
footer_scripts = ex(1731, 1761)  # close divs, footer, toast, levelup, quizModal,
                                 # <script src="quizbank.js">, <script>
shell_close    = ex(8224, 8226)  # </script></body></html>

shell = (
    head
    + '<style>\n@@INJECT_CSS@@\n</style>\n'
    + body_nav
    + '\n@@INJECT_TABS@@\n'
    + footer_scripts
    + '@@INJECT_JS@@\n'
    + shell_close
)
write('_shell.html', shell)

# ── CSS ───────────────────────────────────────────────────────────────────────
write('styles/main.css', ex(17, 937))

# ── TAB HTML (one <section> block per tab) ────────────────────────────────────
tabs_html = [
    ('today',    995,  998),
    ('quests',  1000, 1014),
    ('dailies', 1017, 1048),
    ('bosses',  1051, 1061),
    ('board',   1064, 1092),
    ('shop',    1095, 1105),
    ('quizzes', 1108, 1118),
    ('aft',     1121, 1138),
    ('profile', 1142, 1215),
    ('test',    1218, 1237),
    ('log',     1240, 1275),
    ('skills',  1278, 1323),
    ('plan',    1326, 1561),
    ('awards',  1564, 1650),
    ('records', 1654, 1703),
    ('weight',  1705, 1730),
]
for name, s, e in tabs_html:
    write(f'tabs/{name}.html', ex(s, e))

# ── CORE JS files (shared across tabs) ───────────────────────────────────────
core_js = [
    # File                    Start  End    Contents
    ('core/constants.js',    1762, 1976),  # DEFAULT, TRACKS, VALUES, SESSIONS
    ('core/training.js',     1977, 2217),  # WEATHER, WEEK_PLAN, EX_HOWTO, PT_AREAS, parsePT
    ('core/state.js',        2218, 2476),  # KEY, load, save, render, simple tab renderers, esc
    ('core/events.js',       2477, 2606),  # nav/body events, add-buttons, backup, toast, showLevelUp
    ('core/aft-scoring.js',  2725, 2828),  # AFT_TABLES, aftLookup, clampScore, score_* helpers
    ('core/app-setup.js',    5194, 5488),  # skills-UI wiring, award/event editors, cloud file system
    ('core/skills-data.js',  5489, 7295),  # SK_CAT, SK_CAT_ORDER, SEED_SKILLS, seedSkillsIfEmpty
    ('core/migration.js',    7296, 7441),  # SKILL_LADDER_VER, RENAMES, mergeNewSeedSkills
    ('core/auto-level.js',   7442, 7592),  # syncSkillsFromActivity, integrityLevel, rhrToLevel
    ('core/skills-core.js',  7593, 7764),  # skSubsOf, skill calc fns, skCreate/Edit, skLeafColor
    ('core/tree.js',         7765, 8076),  # SK_PATH_ICON, Yggdrasil SVG renderer, pan/zoom
    ('core/init.js',         8217, 8222),  # SW register, seedSkillsIfEmpty(), render()
]
for fname, s, e in core_js:
    write(fname, ex(s, e))

# ── TAB JS files (render logic + event handlers per tab) ─────────────────────
tabs_js = [
    # File                  Start  End    Contents
    ('tabs/quizzes.js',  2607, 2724),  # renderQuizzes, quiz state machine, parseTime
    ('tabs/aft.js',      2829, 2983),  # renderAft, renderAftStandardBar, EVENT_FOCUS
    ('tabs/log.js',      2984, 3328),  # workout log, PT system, fmtSec, AREA_LABEL, baseline
    ('tabs/plan.js',     3329, 3608),  # renderSkillBalance, renderCoachToday, renderBaseline
    ('tabs/board.js',    3609, 3632),  # renderBoard, add-task handler
    ('tabs/weight.js',   3633, 3744),  # W_WEIGHTS, coin jars, renderWeight, importWeightLedger
    ('tabs/awards.js',   3745, 3889),  # renderAwards, renderMemberships, renderEvents, renderVolunteer
    ('tabs/profile.js',  3890, 4251),  # renderProfile, blood type, vitals, Apple Health parser
    ('tabs/dailies.js',  4252, 4339),  # HABIT_STARTERS, habit logic, renderHabits
    ('tabs/test.js',     4340, 4936),  # TESTS, reaction/digit/typing/nback/gonogo/etc, SRS, study
    ('tabs/records.js',  4937, 5062),  # trendLine, renderHistory, renderCounsel, renderChecklists
    ('tabs/today.js',    5063, 5193),  # renderToday, makeStudyPlan
    ('tabs/skills.js',   8077, 8216),  # renderSkillsTab, skTier, skProgressBlock
]
for fname, s, e in tabs_js:
    write(fname, ex(s, e))

n_core = len(core_js)
n_tabs_html = len(tabs_html)
n_tabs_js = len(tabs_js)
print(f"\nDone — {n_tabs_html} tab HTML + {n_core} core JS + {n_tabs_js} tab JS files created in src/")
print("Next: npm run build  (or: python scripts/build.py)")
