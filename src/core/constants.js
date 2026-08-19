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
/* ── Military qualifications catalog ─────────────────────────────────────── */
const QUAL_CATALOG = {
  cwst:      {fullName:"CWST — Combat Water Survival Test", cat:"physical",   skills:[{name:"Swimming",level:5}]},
  brm_mks:   {fullName:"BRM — Marksman",                   cat:"tactical",   skills:[{name:"Marksmanship (M4)",level:4}]},
  brm_shp:   {fullName:"BRM — Sharpshooter",               cat:"tactical",   skills:[{name:"Marksmanship (M4)",level:5}]},
  brm_exp:   {fullName:"BRM — Expert",                     cat:"tactical",   skills:[{name:"Marksmanship (M4)",level:6}]},
  cls:       {fullName:"CLS — Combat Lifesaver",           cat:"tactical",   skills:[{name:"First aid",level:7}]},
  tccc:      {fullName:"TCCC",                             cat:"tactical",   skills:[{name:"First aid",level:5}]},
  sere:      {fullName:"SERE",                             cat:"tactical",   skills:[{name:"Fieldcraft & survival",level:10}]},
  landnav_d: {fullName:"Day land nav (pass)",              cat:"tactical",   skills:[{name:"Land navigation",level:4}]},
  landnav_n: {fullName:"Night land nav (pass)",            cat:"tactical",   skills:[{name:"Land navigation",level:5}]},
  landnav_r: {fullName:"Land nav — Ranger standard",       cat:"tactical",   skills:[{name:"Land navigation",level:10}]},
  airborne:  {fullName:"Airborne School",                  cat:"tactical",   skills:[{name:"Parachute operations",level:8}]},
  air_assault:{fullName:"Air Assault School",              cat:"tactical",   skills:[{name:"Air assault operations",level:7}]},
  wlc:       {fullName:"WLC — Warrior Leaders Course",     cat:"leadership", skills:[{name:"Small unit leadership",level:7}]},
  blc:       {fullName:"BLC — Basic Leader Course",        cat:"leadership", skills:[{name:"Small unit leadership",level:6}]},
  ruck:      {fullName:"Ruck march — 12 mi in <3h",        cat:"physical",   skills:[{name:"Rucking",level:8}]},
};

/* ── Track → Path migration map (old save field) ─────────────────────────── */
const TRACK_TO_PATH = {fitness:"physical", tactics:"tactical", knowledge:"academic", discipline:"personal"};

/* ---------------- State ---------------- */
const DEFAULT = {
  name:"Cadet", rank:"MS2 Cadet", position:"No leadership role",
  gold:0, streak:0, lastDaily:null, totalDone:0, lastOpenedTs:null,
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
  academicHonors:[], // {id, ts, date, title, org, year, note}
  rotcRecord:{positions:[],competitions:[],campResults:[]}, // ROTC history
  memberships:[],    // {id, org, startYear, endYear|null, memberType, roles:[{title,startYear,endYear|null}], note}
  events:[],         // event participation: {id, title, org, year, role, note}
  volunteer:[],      // {id, year, org, hours, note}  (aggregated into per-year jars)
  qualifications:[], // logged military qualifications: {id, key, date, skills:[{skillName, fromLevel, toLevel}]}
  lifeSkills:[],     // {id, name, cat, fadeDays, currentLevel, lastQuestTs, levels:[{n, ability}], history:[]}
  ptLog:[],          // cadre PT sessions: {id, ts, date, areas:[...], intensity}
  navLabels:true,    // side rail shows labels (true) or icons only (false)
  navExpanded:false, // whether the "More" nav section is open
  missedTraining:[], // [{date:"YYYY-MM-DD", session:"s1"}] — auto-tracked missed sessions, last 28 days
  milestones:[],   // [{id, label, date:"YYYY-MM-DD"}] — user-defined ROTC/life milestones shown on Dawn
  gpaHistory:[],   // [{id, term, gpa, hours, standing, note}] — semester-by-semester record
  profile:{ birthdate:null, heightIn:null, heightDate:null, weightLb:null, weightDate:null, sex:null, bloodType:null, units:"imperial", notes:"", commissionDate:null, ldacDate:null, gpa:null, weightGoal:null, gpaGoal:null, languages:[], clearance:{level:null,grantedDate:null,notes:""} },
  lifts:{ deadliftLb:null, squatLb:null, benchLb:null, liftDate:null },  // best lifts for bodyweight-relative skills
  aftEventTargets:{hrp:null,sdc:null,run:null,dl:null,plank:null},
  aftStandard:"general",  // "general" (sex+age normed, 300 min) or "combat" (sex-neutral, 350 min)
  aftGoal:null,           // target total AFT score (e.g. 500); shown as a gap line on the score display
  hasGym:false,           // legacy (pre-FM-2) equipment toggle — superseded by equipProfiles/activeEquipProfile below; kept only so old saves still validate
  weather:"clear",        // manual weather: clear|rain|snow|heat|cold|wind|air|dark — bad conditions swap outdoor work indoors
  weatherSetDate:null,     // today()-format date string weather was last changed — checkDailyReset() (state.js) auto-clears a stale non-clear flag once a new day starts, so a single "rain" tap can't silently stay in effect for days
  // Gym-access-aware weekly planning (FM-1). Three layers, checked in this order
  // by gymAccessForDate() in training.js: gymAccessLive (today-only override) ->
  // gymAccess.week (this week's confirmed/adjusted pattern, only valid while
  // gymAccess.weekOf matches the current week's Monday) -> gymAccess.default
  // (the saved recurring pattern). Keyed by JS getDay() (0=Sun..6=Sat).
  gymAccess:{ default:{1:true,3:true,5:true}, weekOf:null, week:{} },
  gymAccessLive:{},       // {"YYYY-MM-DD": true|false} same-day ad-hoc overrides
  ptDays:{ default:{}, weekOf:null, week:{} }, // declared unit-PT days — same 3-layer cascade as gymAccess; assignWeekSessions() skips assigning a duplicate hard FM session on these days
  // Equipment inventory (FM-2). Named, editable profiles built from EQUIP_TAGS
  // (constants.js) replace the old flat hasGym boolean for exercise SELECTION
  // (which specific exercise fills a slot); gymAccess above still separately
  // decides which session TYPE lands on which day (FM-1) — the two compose.
  equipProfiles:{
    "ROTC/Campus Gym":{tags:["barbell","dumbbells","kettlebell","machines","pullupbar","dipbars","bands","treadmill","rower","bike","pool","climbwall","aftkit","waterjugs","stretcher","ruck","sandbag","tires"]},
    "Dorm":{tags:[]},
  },
  activeEquipProfile:"ROTC/Campus Gym",
  exChoice:{},   // per-day manual exercise-slot overrides: {"YYYY-MM-DD|skey|slotIdx": variantIndex} — suggestion still shown, this just wins when set
  optionalSessions:[], // opted-in optional session types beyond the core 5, e.g. ["swim","climb"] — coach may suggest, never auto-schedules without opt-in
  avoidTags:[], // muscle-group tags (SESSIONS entries' m[]) to steer exercise selection away from — a nagging shoulder/back/etc., not a hard exclusion (see resolveSlot() in training.js: never lets a slot go empty)
  donations:[],           // blood donations: [{id, date, type}]
  weightLog:[],           // weight history for trend: [{date, lb}]
  vitals:[],              // health readings: [{id, date, pulse, bpSys, bpDia, hemoglobin, note}]
  healthImport:{lastImport:null, latest:null, fields:[], history:[]},  // Apple Health export import — profile.js writes {lastImport,latest,fields,history} wholesale on each import; declared here to match what's actually read (aft.js/profile.js) rather than the stale lastImport-only shape
  installPromptDismissed:false,    // true once user dismisses the "add to home screen" nudge
  notifEnabled:false,              // true once user grants notification permission
  habits:[],              // legacy pre-v168 array; merged into `dailies` on load, always empty after that (see load()'s migration)
  tests:[],               // test results: [{id, type, date, score, raw, linkedSkill}]
  srsDecks:[],            // [{id, name, cards:[{id, front, back, due, interval, ease, reps}]}]
  palaces:[],             // memory palaces: [{id, name, loci:[{place, item}]}]
  studyPlans:[],          // [{id, title, testDate, topics:[], created, done:[]}]
  counseling:[],          // DA 4856-style: [{id, date, type, people, summary, plan, followUp}]
  aarLog:[],              // After-Action Reviews: [{id, date, title, planned, actual, why, sustain, improve, trigger}]
  checklists:[],          // packing/gear: [{id, name, items:[{text,done}], template}]
  dayLog:[],              // [{date:"YYYY-MM-DD", trained, wins, notes}]
  _seeded:false,     // whether starter skills have been seeded
  _skillLadderVer:0, // bumped whenever seed ladders change; forces a full ladder resync on load
  // Every default task is MS3-flavored (TBB/board season) and tagged as such
  // via seedKey/stage — see BOARD_TASK_SEEDS below for the other 5 career
  // stages. Fresh installs land pre-tagged; existing saves get retagged once
  // by mergeBoardTaskSeeds() (migration.js) matching this exact wording.
  boardTasks:[
    {id:id(), seedKey:"ms3_ims_account", stage:"MS3", name:"Create / verify your CC IMS (Cadet Command) & TBB account", done:false, due:null},
    {id:id(), seedKey:"ms3_accessions_file", stage:"MS3", name:"Build your Talent-Based Branching (TBB) accessions file", done:false, due:null},
    {id:id(), seedKey:"ms3_branch_resume", stage:"MS3", name:"Write & polish your branch résumé", done:false, due:null},
    {id:id(), seedKey:"ms3_research_branch", stage:"MS3", name:"Research your top branch choices and their OML requirements", done:false, due:null},
    {id:id(), seedKey:"ms3_branch_interview", stage:"MS3", name:"Request branch interviews with your top-choice branch(es)", done:false, due:null},
    {id:id(), seedKey:"ms3_rank_prefs", stage:"MS3", name:"Enter & rank your branch preferences in TBB", done:false, due:null},
    {id:id(), seedKey:"ms3_bradso", stage:"MS3", name:"Decide on BrADSO (Branch Active Duty Service Obligation) strategy", done:false, due:null},
    {id:id(), seedKey:"ms3_oml_inputs", stage:"MS3", name:"Max your OML inputs: GPA, AFT score, leadership eval (CDT OER)", done:false, due:null},
    {id:id(), seedKey:"ms3_certs", stage:"MS3", name:"Research branch-relevant certifications and coursework", done:false, due:null},
    {id:id(), seedKey:"ms3_clearance", stage:"MS3", name:"Confirm your clearance eligibility for your desired branch", done:false, due:null},
  ],
  boardDismissedSeeds:[], // seedKeys the user deliberately deleted — sync never re-adds these
  quests:[
    {id:id(), name:"Find your baseline: test 2-mile run time", diff:"med", path:"physical", done:false},
    {id:id(), name:"Find your baseline: max push-ups in 2 min", diff:"easy", path:"physical", done:false},
    {id:id(), name:"Find your baseline: max plank hold", diff:"easy", path:"physical", done:false},
    {id:id(), name:"Set a phone reminder for morning meditation", diff:"easy", path:"personal", done:false},
    {id:id(), name:"Pick a book for your reward shelf", diff:"easy", path:"personal", done:false},
  ],
  dailies:[               // kind:"order" (Path XP + readiness) or "habit" (flat reward, optional skill-feed) — merged v168
    {id:id(), name:"🧘 Meditate 20–30 min (morning)", kind:"order", diff:"med", path:"personal", done:false, best:0, streak:0, lastDone:null, graceUsed:false, history:[]},
    {id:id(), name:"💪 Today's training session (see FM tab)", kind:"order", diff:"hard", path:"physical", done:false, best:0, streak:0, lastDone:null, graceUsed:false, history:[]},
    {id:id(), name:"📚 Study for an officer-knowledge quiz", kind:"order", diff:"med", path:"academic", done:false, best:0, streak:0, lastDone:null, graceUsed:false, history:[]},
    {id:id(), name:"📋 Plan top 3 priorities for the day", kind:"order", diff:"easy", path:"tactical", done:false, best:0, streak:0, lastDone:null, graceUsed:false, history:[]},
    {id:id(), name:"🎯 Deep-work block: 60 min, no phone", kind:"order", diff:"med", path:"cognitive", done:false, best:0, streak:0, lastDone:null, graceUsed:false, history:[]},
    {id:id(), name:"📵 Phone away 30 min before bed", kind:"order", diff:"easy", path:"personal", done:false, best:0, streak:0, lastDone:null, graceUsed:false, history:[]},
    {id:id(), name:"💧 Hydrate + 7+ hrs sleep target", kind:"order", diff:"easy", path:"physiological", done:false, best:0, streak:0, lastDone:null, graceUsed:false, history:[]},
  ],
  bosses:[
    {id:id(), name:"Hit 450+ AFT (raise DL & SDC)", hp:20, maxhp:20, path:"physical", checkpoints:[]},
    {id:id(), name:"Pass all 20 officer-knowledge quizzes", hp:20, maxhp:20, path:"academic", auto:"quizzes", checkpoints:[]},
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
  dailyHistory: [], // YYYY-MM-DD strings — days when ALL (non-paused) orders were completed
};
const VALUES = {
  quest:{easy:{xp:15,g:5},med:{xp:35,g:12},hard:{xp:70,g:28}},
  daily:{easy:{xp:10,g:4},med:{xp:20,g:8},hard:{xp:40,g:16}},
  board:{xp:20,g:10}, // board-prep tasks have no difficulty tiers — one flat reward
};
// Season-aware Board tab content — real, doctrine-grounded Talent-Based
// Branching program tasks per career stage (careerStage()'s exact 6-value
// vocabulary, migration.js). Deliberately short per stage and free of
// invented dates/specifics; hedging ("verify with cadre/current handbook")
// lives once in board.html's disclaimer + each stage's blurb (board.js),
// not repeated per task. `key` is a stable identity separate from `name` —
// used by syncBoardTasksToStage()/mergeBoardTaskSeeds() so a user renaming
// or deleting their copy never breaks or gets silently overwritten.
const BOARD_TASK_SEEDS = [
  {key:"ms1_meet_cadre", stage:"MS1", name:"Meet with your cadre/PMS to understand how contracting and the OML process work", why:"No TBB engagement yet — this is about knowing what's coming."},
  {key:"ms1_baseline", stage:"MS1", name:"Set your PT & AFT baseline (see FM tab)", why:"OML weighs AFT heavily later — an early honest baseline pays off."},
  {key:"ms1_gpa_tracking", stage:"MS1", name:"Start logging your GPA every semester (Profile → GPA Semester Log)", why:"GPA is an OML input from day one, not just MS3 year."},
  {key:"ms1_branch_explore", stage:"MS1", name:"Informally explore Army branches that interest you — attend any branch orientation events your battalion offers", why:null},
  {key:"ms1_learn_tbb", stage:"MS1", name:"Learn what Talent-Based Branching (TBB) actually is and roughly when it happens for your year group", why:"Ask your cadre — timelines shift year to year."},

  {key:"ms2_oml_discipline", stage:"MS2", name:"Keep building GPA, AFT, and leadership record — all three feed your OML", why:null},
  {key:"ms2_narrow_branches", stage:"MS2", name:"Narrow your branch interest list to a few realistic top choices", why:null},
  {key:"ms2_research_reqs", stage:"MS2", name:"Research your top branches' real requirements against DA PAM 600-3", why:"Reputation isn't the same as requirements — check the actual pamphlet."},
  {key:"ms2_ask_upperclass", stage:"MS2", name:"Ask upper-class cadets or cadre what made past TBB accessions files strong", why:null},
  {key:"ms2_service_oblig", stage:"MS2", name:"If contracted, confirm your understanding of your service obligation type (Active/Guard/Reserve) with cadre", why:null},

  {key:"ms3_ims_account", stage:"MS3", name:"Create / verify your CC IMS (Cadet Command) & TBB account", why:null},
  {key:"ms3_accessions_file", stage:"MS3", name:"Build your Talent-Based Branching (TBB) accessions file", why:null},
  {key:"ms3_branch_resume", stage:"MS3", name:"Write & polish your branch résumé", why:null},
  {key:"ms3_research_branch", stage:"MS3", name:"Research your top branch choices and their OML requirements", why:null},
  {key:"ms3_branch_interview", stage:"MS3", name:"Request branch interviews with your top-choice branch(es)", why:null},
  {key:"ms3_rank_prefs", stage:"MS3", name:"Enter & rank your branch preferences in TBB", why:null},
  {key:"ms3_bradso", stage:"MS3", name:"Decide on BrADSO (Branch Active Duty Service Obligation) strategy", why:null},
  {key:"ms3_oml_inputs", stage:"MS3", name:"Max your OML inputs: GPA, AFT score, leadership eval (CDT OER)", why:null},
  {key:"ms3_certs", stage:"MS3", name:"Research branch-relevant certifications and coursework", why:null},
  {key:"ms3_clearance", stage:"MS3", name:"Confirm your clearance eligibility for your desired branch", why:null},

  {key:"ldac_confirm_dates", stage:"LDAC", name:"Confirm your LDAC/CST dates and any pre-camp requirements with cadre", why:null},
  {key:"ldac_oml_link", stage:"LDAC", name:"Understand how your Camp OML score factors into your final national OML", why:"LDAC isn't board-prep itself, but it's a direct OML input."},
  {key:"ldac_precamp_admin", stage:"LDAC", name:"Complete required pre-camp packing, medical, and administrative requirements", why:null},
  {key:"ldac_perform", stage:"LDAC", name:"Perform your best at LDAC — Camp leadership evaluations are a real, direct OML input", why:null},

  {key:"ms4_confirm_oml", stage:"MS4", name:"Confirm your final OML placement and branch result", why:null},
  {key:"ms4_branch_orders", stage:"MS4", name:"Review and process your branch orders per current TBB/HRC guidance", why:null},
  {key:"ms4_accessions_pkt", stage:"MS4", name:"Finalize your accessions packet (medical, background/clearance paperwork) for your branch", why:null},
  {key:"ms4_bolc_prep", stage:"MS4", name:"Research your branch's Basic Officer Leader Course (BOLC) — timeline, location, prerequisites", why:null},
  {key:"ms4_commission_reqs", stage:"MS4", name:"Confirm your commissioning date and any outstanding degree/commissioning requirements with cadre", why:null},

  {key:"o1_gaining_unit", stage:"O1", name:"Confirm your gaining unit / first duty station and projected BOLC report date", why:null},
  {key:"o1_bolc_inprocess", stage:"O1", name:"Complete BOLC in-processing / pre-arrival requirements (medical, packing list, admin)", why:null},
  {key:"o1_train_transition", stage:"O1", name:"Shift training focus toward BOLC and your branch's officer fundamentals", why:null},
  {key:"o1_outprocess", stage:"O1", name:"Out-process from ROTC/Cadet Command records and complete final cadet administrative requirements", why:null},
];
// Career-stage vocabulary and per-stage framing — same 6 values careerStage()
// (migration.js) resolves to, and the same ones BOARD_TASK_SEEDS above tags
// its content with. Originally board.js-local; moved here once Dawn's
// stage-context card (today.js) became a second consumer, so both read one
// copy instead of duplicating the label/blurb content a second time.
const STAGE_ORDER=["MS1","MS2","MS3","LDAC","MS4","O1"];
const STAGE_INFO={
  MS1:{label:"MS1 — Early Groundwork", blurb:"No real Talent-Based Branching engagement yet. This stage is about building the baseline — PT, GPA, leadership record — that becomes your OML later, and getting an honest early picture of what branches actually do."},
  MS2:{label:"MS2 — Building Your Case", blurb:"Still no TBB file yet, but OML-input discipline and real branch research here pay off once MS3's board season hits."},
  MS3:{label:"MS3 — Board Season", blurb:"The path runs through the Order of Merit List (OML). Talent-Based Branching mostly happens here: you build an accessions file, interview with branches, and rank preferences for the branching board. Your OML — driven by GPA, AFT, and leadership evaluations — is the biggest lever you control."},
  LDAC:{label:"LDAC — Cadet Summer Training", blurb:"LDAC isn't a board-prep activity itself, but your Camp OML score is a direct, real input into your final national OML — perform here, and square away the admin basics before you go."},
  MS4:{label:"MS4 — Post-Board", blurb:"TBB is mostly behind you. This stage is about finalizing your branch result and getting square for commissioning and BOLC."},
  O1:{label:"O1 — Commissioned", blurb:"You're commissioned. The checklist shifts from ROTC/branching to transitioning into your gaining unit and BOLC."},
};
// ── Equipment taxonomy (FM-2) ────────────────────────────────────────────
// A deliberately coarse tag set (machines is one umbrella tag, not per-machine)
// so a profile is a short, honest checklist, not an unmaintainable catalog.
// Sourced two ways, both real, neither invented:
//  - Campus gym tags (barbell..climbwall): confirmed via research against
//    Wake Forest's Wellbeing Center (Reynolds Gym + Sutton Center) — a real
//    weight room, cardio floor, pool+whirlpool, and a climbing/bouldering wall.
//  - ROTC trailer tags (aftkit/waterjugs/stretcher): confirmed directly by
//    Wyatt ("everything needed to run a full and proper AFT, water jugs and
//    stretchers that can have weights put on them").
// unverified:true tags are common ROTC PT-trailer gear by general knowledge
// only (no public battalion inventory exists to check against) — included as
// editable placeholders, flagged honestly rather than presented as confirmed.
const EQUIP_TAGS = {
  barbell:   {label:"Barbell + plates"},
  dumbbells: {label:"Dumbbells"},
  kettlebell:{label:"Kettlebell"},
  machines:  {label:"Machines (cable / leg press / etc.)"},
  pullupbar: {label:"Pull-up bar"},
  dipbars:   {label:"Dip bars / parallettes"},
  bands:     {label:"Resistance bands"},
  treadmill: {label:"Treadmill"},
  rower:     {label:"Rowing machine"},
  bike:      {label:"Stationary bike"},
  pool:      {label:"Pool"},
  climbwall: {label:"Climbing / bouldering wall"},
  aftkit:    {label:"Full AFT event kit (sled, plates, SDC lane gear)"},
  waterjugs: {label:"Water jugs"},
  stretcher: {label:"Weighted stretcher / litter"},
  ruck:      {label:"Rucksack", unverified:true},
  sandbag:   {label:"Sandbag", unverified:true},
  tires:     {label:"Tires", unverified:true},
  // agility (ladder/cones) and battlerope were removed in the v192 cleanup
  // pass — confirmed toggleable in the UI and on by default in the seeded
  // "ROTC/Campus Gym" profile, but zero exercises anywhere were tagged
  // eq:["agility"] or eq:["battlerope"], so the toggle did nothing either
  // way. Re-add properly (tag + real exercises using it) if these are ever
  // genuinely wired to something.
};
// ── Stretch library (true warm-up vs. cool-down, not a relabeled duplicate) ──
// Real exercise-science distinction the app already states elsewhere ("never
// static-stretch cold muscles"): a warm-up should be a brief temperature-raise
// plus DYNAMIC, moving mobilization of the muscles about to be worked — never
// held static stretches, which measurably reduce power output when done cold
// and don't actually prepare a muscle to contract hard. A cool-down is where
// held STATIC stretches belong — muscles are warm, and holding them there is
// what actually helps recovery/soreness/range of motion. Every session's
// warm-up and cool-down are composed from this one tagged library (see
// warmupStretchesFor()/cooldownStretchesFor() in training.js), matched to
// that session's `areas`, instead of hand-duplicating the same few stretches
// into every session's own list — the same entries also back Session 5's
// flexibility block, so "cool-down stretch" and "flexibility work" are
// literally the same tagged pool, not two maintained separately.
const AREA_MUSCLES = {
  legs:["quads","hamstrings","glutes","calves","hips"],
  push:["chest","shoulders","triceps"],
  pull:["back","lats","biceps","rear delts"],
  core:["core","obliques","lower back"],
  cardio:["hips","calves","hamstrings"],
  mobility:["hips","shoulders","core","lower back","quads","hamstrings"],
  balance:["hips","calves"],
};
const STRETCH_LIBRARY=[
  // --- dynamic (warm-up — moving, never held) ---
  {n:"Leg swings, front-to-back (10/leg)", kind:"dynamic", t:"reps", m:["hamstrings","quads","hips"]},
  {n:"Leg swings, side-to-side (10/leg)", kind:"dynamic", t:"reps", m:["hips","glutes"]},
  {n:"Walking lunges with a torso twist (8/leg)", kind:"dynamic", t:"reps", m:["quads","glutes","core"]},
  {n:"Bodyweight squats, slow and controlled (10)", kind:"dynamic", t:"reps", m:["quads","glutes"]},
  {n:"Arm circles, small to large (10 each direction)", kind:"dynamic", t:"reps", m:["shoulders"]},
  {n:"Arm swings across the chest (10)", kind:"dynamic", t:"reps", m:["chest","back","rear delts"]},
  {n:"Cat-cow flow (8 reps)", kind:"dynamic", t:"reps", m:["core","lower back"]},
  {n:"Standing torso twists (10/side)", kind:"dynamic", t:"reps", m:["core","obliques"]},
  {n:"High knees in place (20s)", kind:"dynamic", t:"time", m:["hips","hamstrings"]},
  {n:"Butt kicks in place (20s)", kind:"dynamic", t:"time", m:["hamstrings"]},
  {n:"Inchworm to push-up (5 reps)", kind:"dynamic", t:"reps", m:["hamstrings","shoulders","core"]},
  {n:"Hip circles, standing (8/direction/side)", kind:"dynamic", t:"reps", m:["hips","glutes"]},
  {n:"Ankle circles + calf raises (10 each)", kind:"dynamic", t:"reps", m:["calves"]},
  {n:"World's-greatest-stretch (each side)", kind:"dynamic", t:"reps", m:["hips","hamstrings","core","shoulders"]},
  {n:"Band shoulder dislocates / chest opener", kind:"dynamic", t:"reps", eq:["bands"], m:["shoulders","chest"]},
  {n:"Foam-roll the muscles you're about to work", kind:"dynamic", t:"reps", m:["lower back","quads","hamstrings","glutes","calves"]},
  // --- static (cool-down / flexibility — held, muscles warm) ---
  {n:"Standing quad stretch (hold 30s ×2/side)", kind:"static", t:"time", m:["quads"]},
  {n:"Standing hamstring stretch (hold 30s ×2/side)", kind:"static", t:"time", m:["hamstrings"]},
  {n:"Kneeling hip-flexor stretch (hold 30s ×2/side)", kind:"static", t:"time", m:["hips"]},
  {n:"Figure-4 glute stretch (hold 30s ×2/side)", kind:"static", t:"time", m:["glutes"]},
  {n:"Calf stretch, straight + bent knee (hold 30s/side)", kind:"static", t:"time", m:["calves"]},
  {n:"Doorway chest/shoulder stretch (hold 30s ×2)", kind:"static", t:"time", m:["chest","shoulders"]},
  {n:"Cross-body shoulder stretch (hold 30s ×2/side)", kind:"static", t:"time", m:["shoulders","rear delts"]},
  {n:"Overhead lat stretch, reach and lean to the side (hold 30s ×2/side)", kind:"static", t:"time", m:["back","lats"]},
  {n:"Overhead triceps stretch (hold 30s ×2/side)", kind:"static", t:"time", m:["triceps"]},
  {n:"Child's pose (hold 45s)", kind:"static", t:"time", m:["lower back","hips"]},
  {n:"Seated spinal twist (hold 30s ×2/side)", kind:"static", t:"time", m:["core","obliques","lower back"]},
  {n:"Wrist/forearm stretch (hold 20s ×2/side)", kind:"static", t:"time", m:["grip","forearms"]},
];
// Exercise library — type drives which inputs show: "reps"=sets×reps(±weight), "time"=duration, "dist"=distance+time
// Each session slot is a POOL of one-or-more tagged variants (eq:[EQUIP_TAGS
// keys]) that all train the same muscle group in that slot — bodyweight
// entries carry eq:[] (always available). Selection (see sessionExForProfile()
// in training.js) filters each slot's pool to variants the active equipment
// profile can support, then suggests one (stable per day) while surfacing the
// rest so a disagreeing suggestion can be swapped for another eligible one —
// the same mechanism doubles as equipment-fallback and as day-to-day variety.
// Warm-up/cool-down stretches are NOT listed per session below — they're
// composed fresh from STRETCH_LIBRARY, matched to `areas`, by
// warmupStretchesFor()/cooldownStretchesFor() in training.js.
const SESSIONS = {
  s1:{name:"Session 1 · Lower + Push", areas:["legs","push","core"],
    bw:[
      {n:"Reverse lunge (no support)", t:"reps", m:["quads","glutes"]},
      {n:"Single-leg glute bridge", t:"reps", m:["glutes","hamstrings"]},
      {n:"Hand-release push-ups", t:"reps", m:["chest","triceps"]},
      {n:"Pike push-ups", t:"reps", m:["shoulders","triceps"]},
      {n:"Shrimp squat / split squat (floor)", t:"reps", m:["quads","glutes"]},
      {n:"Hollow-body hold", t:"time", m:["core"]},
      {n:"Single-leg hip hinge (airplane)", t:"reps", m:["hamstrings","glutes"]},
    ],
    gym:[
      {n:"Bulgarian split squat (bench)", t:"reps", w:true, eq:["dumbbells"], m:["quads","glutes"]},
      {n:"Single-leg RDL (dumbbells)", t:"reps", w:true, eq:["dumbbells"], m:["hamstrings","glutes"]},
      {n:"Barbell / DB bench press", t:"reps", w:true, eq:["barbell"], m:["chest","triceps"]},
      {n:"Overhead press (barbell/DB)", t:"reps", w:true, eq:["barbell"], m:["shoulders","triceps"]},
      {n:"Leg press or goblet squat", t:"reps", w:true, eq:["machines"], m:["quads","glutes"]},
      {n:"Cable / machine crunch", t:"reps", w:true, eq:["machines"], m:["core"]},
      {n:"Trap-bar / barbell deadlift", t:"reps", w:true, eq:["barbell"], m:["hamstrings","glutes","back"]},
    ],
    // slot 2's "Knee push-ups" alt: found by the v200-session FM audit —
    // the push-up slot had no easier variant, so anyone who can't yet do a
    // full hand-release push-up had nothing to substitute. Swappable via the
    // existing "🔀 swap" affordance, not auto-prescribed.
    alt:{2:[{n:"Knee push-ups", t:"reps", m:["chest","triceps"]}], 4:[{n:"Kettlebell goblet squat", t:"reps", w:true, eq:["kettlebell"], m:["quads","glutes"]}]}},
  s2:{name:"Session 2 · Run", areas:["cardio","legs"], pickOne:true,
    bw:[
      {n:"Intervals (sprint reps, any open ground)", t:"dist", out:true, m:["cardio","legs"], paceZone:"interval", indoor:{n:"Indoor intervals — 30s hard / 60s easy ×8, rotating burpees → high-knees → mountain-climbers → squat jumps", t:"time"}},
      {n:"Tempo run", t:"dist", out:true, m:["cardio"], paceZone:"threshold", indoor:{n:"Indoor tempo — 20 min continuous, cycling jumping jacks → shadow boxing → step-ups → jog-in-place", t:"time"}},
      {n:"Long easy run", t:"dist", out:true, m:["cardio"], paceZone:"easy", indoor:{n:"Indoor steady cardio — 40 min easy, cycling march/jog-in-place → step-ups → jacks → shadow boxing (10 min each)", t:"time"}},
      {n:"Timed 2-mile", t:"dist", out:true, m:["cardio"], indoor:{n:"Indoor cardio test — 20 min, max jog-in-place / burpee reps (log the count as your benchmark)", t:"reps"}},
    ],
    gym:[
      {n:"Treadmill intervals (incline)", t:"dist", w:true, eq:["treadmill"], m:["cardio","legs"], paceZone:"interval"},
      {n:"Treadmill tempo run", t:"dist", w:true, eq:["treadmill"], m:["cardio"], paceZone:"threshold"},
      {n:"Rower intervals", t:"time", w:true, eq:["rower"], m:["cardio","back"]},
      {n:"Timed 2-mile (treadmill)", t:"dist", w:true, eq:["treadmill"], m:["cardio"]},
    ],
    // "Run-walk build-up" alt on every run slot: found by the v200-session
    // FM audit — the easiest bw run option was a straight 25-min continuous
    // run, no on-ramp for someone who can't run continuously yet. Swappable
    // via the existing "🔀 swap" affordance on any run day, not just one.
    alt:{
      0:[{n:"Run-walk build-up (beginner)", t:"dist", m:["cardio","legs"]}],
      1:[{n:"Run-walk build-up (beginner)", t:"dist", m:["cardio","legs"]}],
      2:[{n:"Stationary bike intervals", t:"time", w:true, eq:["bike"], m:["cardio","legs"]}, {n:"Run-walk build-up (beginner)", t:"dist", m:["cardio","legs"]}],
      3:[{n:"Run-walk build-up (beginner)", t:"dist", m:["cardio","legs"]}],
    }},
  s3:{name:"Session 3 · Upper + Core", areas:["pull","push","core"],
    bw:[
      {n:"Doorway/towel rows (isometric pull)", t:"reps", m:["back","biceps"]},
      {n:"Towel pull-aparts / prone Y-T-W raises (pull)", t:"reps", m:["upper back","rear delts"]},
      {n:"Decline push-ups (feet on floor ledge/step)", t:"reps", m:["chest","shoulders"]},
      {n:"Plank", t:"time", m:["core"]},
      {n:"Side plank", t:"time", m:["obliques"]},
      {n:"Superman / back extension", t:"reps", m:["lower back"]},
      // Was "Grip squeeze" — real but isolated grip work, not an actual
      // loaded-carry stimulus. Found by the v204-session FM audit: SDC gets
      // the least frequency/specificity of any AFT event, and this bw slot's
      // weak default was a real, fixable part of that — a loaded carry with
      // whatever's on hand (books, a full water jug, a duffel bag) is the
      // honest no-equipment substitute for the gym's Farmer's carry at this
      // same slot, and directly trains the SDC's loaded-locomotion demand
      // instead of just grip in isolation. Grip squeeze stays as an alt for
      // whoever genuinely has nothing loadable to carry.
      {n:"Loaded backpack carry (books/household items)", t:"dist", m:["grip","core","legs"]},
    ],
    gym:[
      {n:"Pull-ups", t:"reps", w:true, eq:["pullupbar"], m:["back","biceps"]},
      {n:"Seated cable row", t:"reps", w:true, eq:["machines"], m:["back","biceps"]},
      {n:"Incline DB press", t:"reps", w:true, eq:["dumbbells"], m:["chest","shoulders"]},
      {n:"Cable face pulls", t:"reps", w:true, eq:["machines"], m:["rear delts","upper back"]},
      {n:"Hanging knee raises", t:"reps", eq:["pullupbar"], m:["core"]},
      {n:"Back extension (machine/bench)", t:"reps", w:true, eq:["machines"], m:["lower back"]},
      {n:"Farmer's carry (dumbbells)", t:"dist", w:true, eq:["dumbbells"], m:["grip","core"]},
    ],
    alt:{
      0:[{n:"Lat pulldown (machine)", t:"reps", w:true, eq:["machines"], m:["back","biceps"]}],
      1:[{n:"Barbell row", t:"reps", w:true, eq:["barbell"], m:["back","biceps"]}],
      2:[{n:"Knee push-ups", t:"reps", m:["chest","shoulders"]}],
      6:[
        {n:"Grip squeeze (grip trainer / towel)", t:"time", m:["grip"]},
        {n:"Water jug carry", t:"dist", w:true, eq:["waterjugs"], m:["grip","core"]},
        {n:"Weighted stretcher carry (2-person)", t:"dist", w:true, eq:["stretcher"], m:["grip","core","shoulders"]},
        {n:"Loaded ruck carry", t:"dist", w:true, eq:["ruck"], m:["grip","core"]},
      ],
    }},
  s4:{name:"Session 4 · AFT Circuit", areas:["legs","push","core","cardio"],
    bw:[
      {n:"Shuttle sprints (SDC substitute)", t:"time", out:true, m:["cardio","legs"], indoor:{n:"In-place shuttle — 5-yard touch-downs and lateral steps in a hallway (or burpee-to-sprint-step), 6 trips", t:"time"}},
      {n:"Bear crawl (drag substitute)", t:"time", m:["shoulders","core"]},
      {n:"Hand-release push-ups", t:"reps", m:["chest","triceps"]},
      {n:"Squat jumps", t:"reps", m:["quads","glutes"]},
      {n:"Plank", t:"time", m:["core"]},
      {n:"200m run", t:"time", out:true, m:["cardio"], indoor:{n:"45s hard cardio burst — pick one: mountain climbers, jog-in-place, or jacks", t:"time"}},
    ],
    gym:[
      {n:"Sled push/pull (SDC sim)", t:"time", w:true, eq:["aftkit"], m:["legs","cardio"]},
      {n:"Loaded carry (kettlebells)", t:"dist", w:true, eq:["kettlebell"], m:["grip","core"]},
      {n:"Hand-release push-ups", t:"reps", m:["chest","triceps"]},
      {n:"Box jumps", t:"reps", m:["quads","glutes"]},
      {n:"Plank", t:"time", m:["core"]},
      {n:"Rower 200m sprint", t:"time", w:true, eq:["rower"], m:["cardio","back"]},
    ],
    alt:{
      0:[
        {n:"Weighted stretcher drag (SDC sim)", t:"time", w:true, eq:["stretcher"], m:["legs","cardio"]},
        {n:"Tire flips", t:"time", w:true, eq:["tires"], m:["legs","cardio"]},
      ],
      1:[
        {n:"Water jug carry", t:"dist", w:true, eq:["waterjugs"], m:["grip","core"]},
        {n:"Sandbag carry", t:"dist", w:true, eq:["sandbag"], m:["grip","core"]},
      ],
      2:[{n:"Knee push-ups", t:"reps", m:["chest","triceps"]}],
      5:[{n:"Stationary bike 500m sprint", t:"time", w:true, eq:["bike"], m:["cardio"]}],
    }},
  // Flexibility block is intentionally NOT listed here — flexFromLibrary tells
  // sessionExForProfile() to compose it fresh from the full STRETCH_LIBRARY
  // (every static entry the active equipment profile supports), so this
  // session's flexibility work and every other session's cool-down stretches
  // are always the exact same pool, never two hand-maintained copies.
  s5:{name:"Session 5 · Mobility + Balance", areas:["mobility","balance"], flexFromLibrary:true,
    bw:[
      // --- Balance block (progressive, near a wall to catch yourself) ---
      {n:"Single-leg stand, eyes OPEN (hold 30–45s/leg)", t:"time", m:["balance"]},
      {n:"Single-leg stand, eyes CLOSED (hold 15–30s/leg)", t:"time", m:["balance"]},
      {n:"Single-leg stand on cushion/pillow (hold 20–30s/leg)", t:"time", m:["balance"]},
      {n:"Single-leg hinge reach (balance, reps/leg)", t:"reps", m:["balance","hamstrings"]},
      {n:"Tandem (heel-to-toe) walk, 10–20 steps", t:"reps", m:["balance"]},
      {n:"Y-balance reach: stand on one leg, reach foot front/side/back", t:"reps", m:["balance"]},
    ],
    gym:[
      // mobility/balance is the same either way; gym just adds a couple of tools
      {n:"Single-leg stand, eyes OPEN (hold 30–45s/leg)", t:"time", m:["balance"]},
      {n:"Single-leg stand, eyes CLOSED (hold 15–30s/leg)", t:"time", m:["balance"]},
      {n:"Single-leg stand on a balance pad/BOSU", t:"time", w:true, eq:["machines"], m:["balance"]},
      {n:"Single-leg RDL reach (light DB)", t:"reps", w:true, eq:["dumbbells"], m:["balance","hamstrings"]},
      {n:"Tandem (heel-to-toe) walk, 10–20 steps", t:"reps", m:["balance"]},
      {n:"Y-balance reach: stand on one leg, reach foot front/side/back", t:"reps", m:["balance"]},
    ]},
  other:{name:"Other / Custom", areas:[],
    bw:[{n:"Custom exercise", t:"reps", w:true, custom:true}],
    gym:[{n:"Custom exercise", t:"reps", w:true, custom:true}]},
  // Optional session types (FM-2). v217-session career-arc/coaching pass:
  // when the active equipment profile carries the matching tag, these now
  // ALSO get automatically woven into the real weekly rotation on a bounded
  // cadence (see assignWeekSessions()'s weave step, training.js) — the
  // manual "feel like a change today?" chip + S.optionalSessions opt-in
  // (optionalSessionSuggestions(), still below) remain as a SEPARATE,
  // secondary way to get one on a day it wasn't auto-scheduled.
  // Single-slot pool (bw[0] + the other 2 variants in alt[0]) rather than 3
  // separate bw[] slot-indices — reuses sessionSlotPool()/resolveSlot()'s
  // existing single-slot pick-one-of-N rotation (same mechanism every non-
  // pickOne session's individual exercise slots already use) instead of
  // needing pickOne's dispatch, which is hardcoded to pickRunIndex() and
  // would resolve the wrong index semantics for these.
  swim:{name:"Swim (optional)", areas:["cardio"], optional:true, eq:["pool"],
    bw:[{n:"Easy continuous swim, 20–30 min", t:"time", m:["cardio","full-body"]}],
    alt:{0:[
      {n:"Swim intervals — 50m hard / 30s rest ×8–10", t:"time", m:["cardio","full-body"]},
      {n:"Kickboard + pull-buoy technique set, 20 min", t:"time", m:["legs","back"]},
    ]}},
  climb:{name:"Rock Climbing (optional)", areas:["pull","core","legs"], optional:true, eq:["climbwall"],
    bw:[{n:"Bouldering — top-out problems, moderate grade, 45–60 min", t:"time", m:["back","forearms","core"]}],
    alt:{0:[
      {n:"Top-rope climbing, 45–60 min", t:"time", m:["back","forearms","legs"]},
      {n:"Traverse laps for grip/pull endurance, 30–40 min", t:"time", m:["forearms","back"]},
    ]}},
};
// resolve a session's exercise list for the current equipment mode
// Weather conditions. "outdoorBad" = conditions where you'd skip outdoor work.
