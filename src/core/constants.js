"use strict";
/* ── The Ten Sacred Paths — keys match SK_CAT_ORDER ──────────────────────────
   Each Path absorbs XP from quests/dailies/bosses tagged to it. As a Path
   levels up its idol in the Garden glows brighter and dormant skills awaken.
   The Norse idol names root each Path in the Yggdrasil mythology. */
const PATH_META = {
  tactical:      {name:"Path of War",          idol:"Brazier of Fólkvangr",   lore:"Where warriors consecrate their edge. War demands totality — precision, nerve, and the will to prevail under chaos.",          icon:"⚔️",  color:"var(--blood)"},
  physical:      {name:"Path of the Body",     idol:"Stones of Midgard",      lore:"The realm made flesh — what you build here endures. The body is the first weapon and the last fortress.",                      icon:"🌿",  color:"var(--jade)"},
  cognitive:     {name:"Path of the Mind",     idol:"Well of Mimir",          lore:"Wisdom costs something. Odin surrendered his eye to drink here. What are you willing to give for clarity?",                    icon:"🌀",  color:"var(--violet)"},
  physiological: {name:"Path of Vitality",     idol:"Spring of Hvergelmir",   lore:"The primordial well — source of all living rivers. Health is the ground on which all else is built.",                         icon:"💧",  color:"var(--violet)"},
  technical:     {name:"Path of the Craft",    idol:"Forge of Sindri",        lore:"The dwarven smith whose fire shaped Mjölnir. Mastery is made, not granted — one strike at a time.",                           icon:"🔨",  color:"var(--ember)"},
  leadership:    {name:"Path of Command",      idol:"Throne of Hliðskjálf",   lore:"From here, Odin sees all nine worlds. Command demands sight — of terrain, of people, of consequence.",                        icon:"🏴",  color:"var(--gold)"},
  academic:      {name:"Path of Knowledge",    idol:"Runes of the Hanging",   lore:"Odin hung nine days on Yggdrasil, wounded and fasting, to earn the runes. Knowledge demands sacrifice.",                      icon:"📜",  color:"var(--gold)"},
  personal:      {name:"Path of the Self",     idol:"Mirror of Vanir",        lore:"The Vanir gods understood things the Aesir had to learn. Know yourself before you can lead others.",                          icon:"🪞",  color:"var(--jade)"},
  hearth:        {name:"Path of the Hearth",   idol:"Heartstone of Ásgarðr",  lore:"Even Odin's hall has its fire. The people you tend are the roots that anchor the World Tree.",                                 icon:"🔥",  color:"var(--ember)"},
  roots:         {name:"Path of Roots",        idol:"Well of Urðr",           lore:"The Well of Fate, tended by the Norns. They water Yggdrasil with its clay. Your past shapes what grows.",                     icon:"🌳",  color:"var(--jade)"},
};
/* ── Track → Path migration map (old save field) ─────────────────────────── */
const TRACK_TO_PATH = {fitness:"physical", tactics:"tactical", knowledge:"academic", discipline:"personal"};

/* ---------------- State ---------------- */
const DEFAULT = {
  name:"Cadet", rank:"MS2 Cadet", position:"No leadership role",
  gold:0, streak:0, lastDaily:null, totalDone:0,
  bestStreak:0, perfectDays:0, lastPerfect:null, missedYesterday:false,
  pathXP:{tactical:0,physical:0,cognitive:0,physiological:0,technical:0,leadership:0,academic:0,personal:0,hearth:0,roots:0},
  aft:[],
  quizzes:{},        // { topicKey: {passed:bool, bestPct, attempts} }
  workouts:[],       // [{date, session, duration, exercises:[{name, type, sets:[{reps,weight} | {time} | {dist}]}], notes}]
  baselines:[],      // [{date, ts, month:"2026-06", results:{exKey:{type, value:{...}}}}]
  lastBaselineMonth:null,
  branchGoal:"",
  weight:{ nextDisc:1, promises:[], memorial:[] },  // The Weight — read-only mirror of the standalone Weight app
  weightAppUrl:"https://wsm-ai.github.io/tw-9f3kx-ledger/",   // hosted URL of the standalone Weight app (portal link)
  lastMirrorUpdate:null,   // toDateString() of the last mirror refresh, for the daily nudge
  awards:[],         // Wall awards: {id, ts, date, kind, title, org, year, note}
  memberships:[],    // {id, org, startYear, endYear|null, memberType, roles:[{title,startYear,endYear|null}], note}
  events:[],         // event participation: {id, title, org, year, role, note}
  volunteer:[],      // {id, year, org, hours, note}  (aggregated into per-year jars)
  lifeSkills:[],     // {id, name, cat, fadeDays, currentLevel, lastQuestTs, levels:[{n, ability}], history:[]}
  ptLog:[],          // cadre PT sessions: {id, ts, date, areas:[...], intensity}
  navLabels:true,    // side rail shows labels (true) or icons only (false)
  navExpanded:false, // whether the "More" nav section is open
  missedTraining:[], // [{date:"YYYY-MM-DD", session:"s1"}] — auto-tracked missed sessions, last 28 days
  profile:{ birthdate:null, heightIn:null, heightDate:null, weightLb:null, weightDate:null, sex:null, bloodType:null, units:"imperial", notes:"", commissionDate:null, gpa:null },
  lifts:{ deadliftLb:null, squatLb:null, benchLb:null, liftDate:null },  // best lifts for bodyweight-relative skills
  aftStandard:"general",  // "general" (sex+age normed, 300 min) or "combat" (sex-neutral, 350 min)
  hasGym:false,           // equipment mode: false = no-equipment (bodyweight) plans, true = gym versions
  weather:"clear",        // manual weather: clear|rain|snow|heat|cold|wind|air|dark — bad conditions swap outdoor work indoors
  donations:[],           // blood donations: [{id, date, type}]
  weightLog:[],           // weight history for trend: [{date, lb}]
  vitals:[],              // health readings: [{id, date, pulse, bpSys, bpDia, hemoglobin, note}]
  healthImport:{lastImport:null},  // Apple Health export import stub
  installPromptDismissed:false,    // true once user dismisses the "add to home screen" nudge
  notifEnabled:false,              // true once user grants notification permission
  habits:[],              // {id, name, linkedSkill, streak, bestStreak, lastDone, graceUsed, history:[]}
  tests:[],               // test results: [{id, type, date, score, raw, linkedSkill}]
  srsDecks:[],            // [{id, name, cards:[{id, front, back, due, interval, ease, reps}]}]
  palaces:[],             // memory palaces: [{id, name, loci:[{place, item}]}]
  studyPlans:[],          // [{id, title, testDate, topics:[], created, done:[]}]
  counseling:[],          // DA 4856-style: [{id, date, type, people, summary, plan, followUp}]
  checklists:[],          // packing/gear: [{id, name, items:[{text,done}], template}]
  _seeded:false,     // whether starter skills have been seeded
  _skillLadderVer:0, // bumped whenever seed ladders change; forces a full ladder resync on load
  boardTasks:[
    {id:id(), name:"Create / verify your CC IMS (Cadet Command) & TBB account", done:false},
    {id:id(), name:"Build your Talent-Based Branching (TBB) accessions file", done:false},
    {id:id(), name:"Write & polish your branch résumé", done:false},
    {id:id(), name:"Research your top branch choices and their OML requirements", done:false},
    {id:id(), name:"Request branch interviews with your top-choice branch(es)", done:false},
    {id:id(), name:"Enter & rank your branch preferences in TBB", done:false},
    {id:id(), name:"Decide on BrADSO (Branch Active Duty Service Obligation) strategy", done:false},
    {id:id(), name:"Max your OML inputs: GPA, AFT score, leadership eval (CDT OER)", done:false},
    {id:id(), name:"Research branch-relevant certifications and coursework", done:false},
    {id:id(), name:"Confirm your clearance eligibility for your desired branch", done:false},
  ],
  quests:[
    {id:id(), name:"Find your baseline: test 2-mile run time", diff:"med", path:"physical", done:false},
    {id:id(), name:"Find your baseline: max push-ups in 2 min", diff:"easy", path:"physical", done:false},
    {id:id(), name:"Find your baseline: max plank hold", diff:"easy", path:"physical", done:false},
    {id:id(), name:"Set a phone reminder for morning meditation", diff:"easy", path:"personal", done:false},
    {id:id(), name:"Pick a book for your reward shelf", diff:"easy", path:"personal", done:false},
  ],
  dailies:[
    {id:id(), name:"🧘 Meditate 20–30 min (morning)", diff:"med", path:"personal", done:false, best:0},
    {id:id(), name:"💪 Today's training session (see FM tab)", diff:"hard", path:"physical", done:false, best:0},
    {id:id(), name:"📚 Study for an officer-knowledge quiz", diff:"med", path:"academic", done:false, best:0},
    {id:id(), name:"📋 Plan top 3 priorities for the day", diff:"easy", path:"tactical", done:false, best:0},
    {id:id(), name:"🎯 Deep-work block: 60 min, no phone", diff:"med", path:"cognitive", done:false, best:0},
    {id:id(), name:"📵 Phone away 30 min before bed", diff:"easy", path:"personal", done:false, best:0},
    {id:id(), name:"💧 Hydrate + 7+ hrs sleep target", diff:"easy", path:"physiological", done:false, best:0},
  ],
  bosses:[
    {id:id(), name:"Hit 450+ AFT (raise DL & SDC)", hp:20, maxhp:20, path:"physical"},
    {id:id(), name:"Pass all 16 officer-knowledge quizzes", hp:16, maxhp:16, path:"academic", auto:"quizzes"},
  ],
  rewards:[
    {id:id(), name:"Read 1 chapter of your book", cost:15},
    {id:id(), name:"Read 3 chapters (binge session)", cost:40},
    {id:id(), name:"30 min guilt-free gaming", cost:25},
    {id:id(), name:"Favorite coffee / treat", cost:20},
    {id:id(), name:"One episode of your show", cost:30},
    {id:id(), name:"Full rest/recovery day, no guilt", cost:60},
  ],
  questArchive: [],
  streakLog: [],    // [{date, pct}] — daily order completion rate, last 90 days
  streakBrokenDate: null, // YYYY-MM-DD when streak last broke (cleared after 3 recovery days)
};
const VALUES = {
  quest:{easy:{xp:15,g:5},med:{xp:35,g:12},hard:{xp:70,g:28}},
  daily:{easy:{xp:10,g:4},med:{xp:20,g:8},hard:{xp:40,g:16}},
};
// Exercise library — type drives which inputs show: "reps"=sets×reps(±weight), "time"=duration, "dist"=distance+time
// Each session has TWO variants that train the SAME muscle groups:
//  bw  = no-equipment (floor + wall/doorway only)
//  gym = equipment version (different movements, used when you have gym access)
// A global toggle (S.hasGym) decides which one the log form and plan show.
const SESSIONS = {
  s1:{name:"Session 1 · Lower + Push", areas:["legs","push","core"],
    bw:[
      {n:"Reverse lunge (no support)", t:"reps"},
      {n:"Single-leg glute bridge", t:"reps"},
      {n:"Hand-release push-ups", t:"reps"},
      {n:"Pike push-ups", t:"reps"},
      {n:"Shrimp squat / split squat (floor)", t:"reps"},
      {n:"Hollow-body hold", t:"time"},
      {n:"Single-leg hip hinge (airplane)", t:"reps"},
    ],
    gym:[
      {n:"Bulgarian split squat (bench)", t:"reps", w:true},
      {n:"Single-leg RDL (dumbbells)", t:"reps", w:true},
      {n:"Barbell / DB bench press", t:"reps", w:true},
      {n:"Overhead press (barbell/DB)", t:"reps", w:true},
      {n:"Leg press or goblet squat", t:"reps", w:true},
      {n:"Cable / machine crunch", t:"reps", w:true},
      {n:"Trap-bar / barbell deadlift", t:"reps", w:true},
    ]},
  s2:{name:"Session 2 · Run", areas:["cardio","legs"], pickOne:true,
    bw:[
      {n:"Intervals (sprint reps, any open ground)", t:"dist", out:true, indoor:{n:"Indoor intervals — 30s hard / 60s easy ×8, rotating burpees → high-knees → mountain-climbers → squat jumps", t:"time"}},
      {n:"Tempo run", t:"dist", out:true, indoor:{n:"Indoor tempo — 20 min continuous, cycling jumping jacks → shadow boxing → step-ups → jog-in-place", t:"time"}},
      {n:"Long easy run", t:"dist", out:true, indoor:{n:"Indoor steady cardio — 40 min easy, cycling march/jog-in-place → step-ups → jacks → shadow boxing (10 min each)", t:"time"}},
      {n:"Timed 2-mile", t:"dist", out:true, indoor:{n:"Indoor cardio test — 20 min, max jog-in-place / burpee reps (log the count as your benchmark)", t:"reps"}},
    ],
    gym:[
      {n:"Treadmill intervals (incline)", t:"dist", w:true},
      {n:"Treadmill tempo run", t:"dist", w:true},
      {n:"Rower or bike intervals", t:"time", w:true},
      {n:"Timed 2-mile (treadmill)", t:"dist", w:true},
    ]},
  s3:{name:"Session 3 · Upper + Core", areas:["pull","push","core"],
    bw:[
      {n:"Doorway/towel rows (isometric pull)", t:"reps"},
      {n:"Towel pull-aparts / prone Y-T-W raises (pull)", t:"reps"},
      {n:"Decline push-ups (feet on floor ledge/step)", t:"reps"},
      {n:"Plank", t:"time"},
      {n:"Side plank", t:"time"},
      {n:"Superman / back extension", t:"reps"},
      {n:"Grip squeeze (grip trainer / towel)", t:"time"},
    ],
    gym:[
      {n:"Pull-ups / lat pulldown", t:"reps", w:true},
      {n:"Seated cable / barbell row", t:"reps", w:true},
      {n:"Incline DB press", t:"reps", w:true},
      {n:"Cable face pulls", t:"reps", w:true},
      {n:"Hanging knee raises", t:"reps"},
      {n:"Back extension (machine/bench)", t:"reps", w:true},
      {n:"Farmer's carry (dumbbells)", t:"dist", w:true},
    ]},
  s4:{name:"Session 4 · AFT Circuit", areas:["legs","push","core","cardio"],
    bw:[
      {n:"Shuttle sprints (SDC substitute)", t:"time", out:true, indoor:{n:"In-place shuttle — 5-yard touch-downs and lateral steps in a hallway (or burpee-to-sprint-step), 6 trips", t:"time"}},
      {n:"Bear crawl (drag substitute)", t:"time"},
      {n:"Hand-release push-ups", t:"reps"},
      {n:"Squat jumps", t:"reps"},
      {n:"Plank", t:"time"},
      {n:"200m run", t:"time", out:true, indoor:{n:"45s hard cardio burst — pick one: mountain climbers, jog-in-place, or jacks", t:"time"}},
    ],
    gym:[
      {n:"Sled push/pull or SDC sim", t:"time", w:true},
      {n:"Loaded carry (kettlebells)", t:"dist", w:true},
      {n:"Hand-release push-ups", t:"reps"},
      {n:"Box jumps", t:"reps", w:true},
      {n:"Plank", t:"time"},
      {n:"Rower 200m sprint", t:"time", w:true},
    ]},
  s5:{name:"Session 5 · Mobility + Balance", areas:["mobility","balance"],
    bw:[
      // --- Flexibility block (held static stretches, after a light warm-up) ---
      {n:"5-min easy cardio warm-up (don't stretch cold)", t:"time"},
      {n:"World's-greatest-stretch (each side)", t:"reps"},
      {n:"Standing hamstring stretch (hold 30s ×2/side)", t:"time"},
      {n:"Kneeling hip-flexor stretch (hold 30s ×2/side)", t:"time"},
      {n:"Figure-4 glute stretch (hold 30s ×2/side)", t:"time"},
      {n:"Quad stretch (hold 30s ×2/side)", t:"time"},
      {n:"Calf stretch, straight + bent knee (hold 30s/side)", t:"time"},
      {n:"Doorway chest/shoulder stretch (hold 30s ×2)", t:"time"},
      {n:"Thoracic rotations + cat-cow (slow reps)", t:"reps"},
      // --- Balance block (progressive, near a wall to catch yourself) ---
      {n:"Single-leg stand, eyes OPEN (hold 30–45s/leg)", t:"time"},
      {n:"Single-leg stand, eyes CLOSED (hold 15–30s/leg)", t:"time"},
      {n:"Single-leg stand on cushion/pillow (hold 20–30s/leg)", t:"time"},
      {n:"Single-leg hinge reach (balance, reps/leg)", t:"reps"},
      {n:"Tandem (heel-to-toe) walk, 10–20 steps", t:"reps"},
      {n:"Y-balance reach: stand on one leg, reach foot front/side/back", t:"reps"},
    ],
    gym:[
      // mobility/balance is the same either way; gym just adds a couple of tools
      {n:"5-min easy cardio warm-up (don't stretch cold)", t:"time"},
      {n:"World's-greatest-stretch (each side)", t:"reps"},
      {n:"Standing hamstring stretch (hold 30s ×2/side)", t:"time"},
      {n:"Kneeling hip-flexor stretch (hold 30s ×2/side)", t:"time"},
      {n:"Figure-4 glute stretch (hold 30s ×2/side)", t:"time"},
      {n:"Quad stretch (hold 30s ×2/side)", t:"time"},
      {n:"Calf stretch on a step (straight + bent knee)", t:"time"},
      {n:"Band shoulder dislocates / chest opener", t:"reps", w:true},
      {n:"Foam-roll back + thoracic rotations", t:"reps"},
      {n:"Single-leg stand, eyes OPEN (hold 30–45s/leg)", t:"time"},
      {n:"Single-leg stand, eyes CLOSED (hold 15–30s/leg)", t:"time"},
      {n:"Single-leg stand on a balance pad/BOSU", t:"time", w:true},
      {n:"Single-leg RDL reach (light DB)", t:"reps", w:true},
      {n:"Tandem (heel-to-toe) walk, 10–20 steps", t:"reps"},
      {n:"Y-balance reach: stand on one leg, reach foot front/side/back", t:"reps"},
    ]},
  other:{name:"Other / Custom", areas:[],
    bw:[{n:"Custom exercise", t:"reps", w:true, custom:true}],
    gym:[{n:"Custom exercise", t:"reps", w:true, custom:true}]},
};
// resolve a session's exercise list for the current equipment mode
// Weather conditions. "outdoorBad" = conditions where you'd skip outdoor work.
