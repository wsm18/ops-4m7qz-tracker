/**
 * build.js — assembles src/ source files into the shipped index.html
 *
 * Source layout:
 *   src/_shell.html          outer HTML frame with @@INJECT_*@@ placeholders
 *   src/styles/main.css      all CSS
 *   src/tabs/*.html          one <section> block per tab (HTML structure)
 *   src/tabs/*.js            render logic + event handlers per tab
 *   src/core/*.js            shared state, helpers, skill system, tree, etc.
 *
 * JS files are concatenated in the same order they appeared in the original
 * monolithic script, preserving all const/let dependency order.
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'src');

function read(rel) {
  const p = path.join(SRC, rel);
  if (!fs.existsSync(p)) { console.error(`MISSING: src/${rel}`); process.exit(1); }
  return fs.readFileSync(p, 'utf8');
}

// ── Tab HTML ──────────────────────────────────────────────────────────────────
// Order matches the original HTML structure (determines DOM/CSS z-order).
const TAB_HTML = [
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
  'tabs/plan.html',
  'tabs/awards.html',
  'tabs/records.html',
  'tabs/weight.html',
];

// ── JS files ─────────────────────────────────────────────────────────────────
// Order matches the original script execution order.
// function declarations are hoisted, but const/let run in sequence —
// keep this list in the same order the code appeared in the original file.
const JS_FILES = [
  // Core: constants and data models
  'core/constants.js',       // DEFAULT, TRACKS, VALUES, SESSIONS
  'core/training.js',        // WEATHER, WEEK_PLAN, EX_HOWTO, PT_AREAS, parsePT
  'core/state.js',           // KEY, load, save, render, simple tab renderers, esc
  'core/events.js',          // nav/body events, add-buttons, backup/reset, toast, showLevelUp
  // Tab implementations (in original file order)
  'tabs/quizzes.js',         // renderQuizzes, quiz state machine, parseTime
  'core/aft-scoring.js',     // AFT_TABLES, aftLookup, clampScore, score_* helpers
  'core/insights.js',        // computeInsights — cross-domain pattern surfacing (X-Insight)
  'tabs/aft.js',             // renderAft, renderAftStandardBar, EVENT_FOCUS
  'tabs/log.js',             // workout log, PT system, fmtSec, AREA_LABEL, baseline
  'tabs/plan.js',            // renderSkillBalance, renderCoachToday, renderBaseline
  'tabs/cardgame.js',        // FM-3: card-game workout mode (cgOpen, draw/log loop)
  'tabs/board.js',           // renderBoard, add-task handler
  'tabs/weight.js',          // W_WEIGHTS, coin jars, renderWeight, importWeightLedger
  'tabs/awards.js',          // renderAwards, renderMemberships, renderEvents, renderVolunteer
  'tabs/profile.js',         // renderProfile, blood type, vitals, Apple Health parser
  'tabs/dailies.js',         // HABIT_STARTERS, habit logic, renderHabits
  'tabs/test.js',            // TESTS, reaction/digit/typing/nback/etc, SRS, palace, study
  'tabs/records.js',         // trendLine, renderHistory, renderCounsel, renderChecklists
  'tabs/today.js',           // renderToday, makeStudyPlan
  // Core: skill system (large data last so tab code can reference the functions)
  'core/app-setup.js',       // skills-UI wiring, award/event editors, cloud file system
  'core/skills-data.js',     // SK_CAT, SK_CAT_ORDER, SEED_SKILLS, seedSkillsIfEmpty
  'core/migration.js',       // SKILL_LADDER_VER, RENAMES, mergeNewSeedSkills
  'core/auto-level.js',      // syncSkillsFromActivity, integrityLevel, rhrToLevel
  'core/skills-core.js',     // skSubsOf, skill calc fns, skCreate/Edit, skLeafColor
  'core/tree.js',            // SK_PATH_ICON, Yggdrasil SVG renderer, pan/zoom
  'tabs/skills.js',          // renderSkillsTab, skTier, skProgressBlock
  'core/init.js',            // SW register, seedSkillsIfEmpty(), render()  ← always last
];

// ── Assemble ──────────────────────────────────────────────────────────────────
const css     = read('styles/main.css');
const tabHtml = TAB_HTML.map(read).join('\n');
const js      = JS_FILES.map(read).join('\n');

let shell = read('_shell.html');
shell = shell.replace('@@INJECT_CSS@@',  css);
shell = shell.replace('@@INJECT_TABS@@', tabHtml);
shell = shell.replace('@@INJECT_JS@@',   js);

const OUT = path.join(ROOT, 'index.html');
fs.writeFileSync(OUT, shell, 'utf8');

const lineCount = shell.split('\n').length;
console.log(`✓  index.html  (${lineCount.toLocaleString()} lines | ${JS_FILES.length} JS modules | ${TAB_HTML.length} tab views)`);
