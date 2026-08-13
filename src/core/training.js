const WEATHER={
  clear:{label:"Clear / fine", icon:"☀️", bad:false},
  rain:{label:"Rain", icon:"🌧️", bad:true},
  snow:{label:"Snow / ice", icon:"❄️", bad:true},
  heat:{label:"Extreme heat", icon:"🥵", bad:true},
  cold:{label:"Extreme cold", icon:"🧊", bad:true},
  wind:{label:"High wind", icon:"🌬️", bad:true},
  air:{label:"Poor air quality", icon:"😷", bad:true},
  dark:{label:"Dark / unsafe", icon:"🌙", bad:true},
};
function weatherBad(){ const w=WEATHER[(S&&S.weather)||"clear"]; return !!(w&&w.bad); }

// ── Equipment-aware exercise selection (FM-2) ────────────────────────────
const EQUIP_ALL_TAGS = Object.keys(typeof EQUIP_TAGS!=="undefined"?EQUIP_TAGS:{});
function activeEquipTags(){
  const p=(S.equipProfiles||{})[S.activeEquipProfile];
  return (p&&p.tags) || [];
}
function eqSubset(eq, tags){ return !eq || !eq.length || eq.every(t=>tags.includes(t)); }
// All candidate variants for one slot of a session: the bw entry (always
// eq:[]), the gym entry, and any extra pool members from `alt[slotIdx]` —
// deduped by name so an identical bw/gym pair (e.g. a shared stretch) only
// shows once.
function sessionSlotPool(skey, slotIdx){
  const s=SESSIONS[skey]; if(!s) return [];
  const cands=[s.bw&&s.bw[slotIdx], s.gym&&s.gym[slotIdx], ...((s.alt&&s.alt[slotIdx])||[])].filter(Boolean);
  const seen=new Set(), out=[];
  cands.forEach(c=>{ if(!seen.has(c.n)){ seen.add(c.n); out.push(Object.assign({eq:[]}, c)); } });
  return out;
}
// Stable per-day suggestion index into an eligible pool — same mechanism as
// the app's other daily deterministic shuffles (see hashStr/seededShuffle in
// today.js): varies day to day so it doesn't feel stale, but never flickers
// mid-day across renders.
function suggestedPoolIndex(skey, slotIdx, poolLen, dateObj){
  if(poolLen<=1) return 0;
  const key=localYMD(dateObj)+"|"+skey+"|"+slotIdx;
  return hashStr(key)%poolLen;
}
// ── True warm-up / cool-down composition (not a relabeled duplicate) ────
// See the STRETCH_LIBRARY comment in constants.js for the exercise-science
// reasoning: dynamic movement before, held static stretches after.
function areaMuscles(areas){
  const set=new Set();
  (areas||[]).forEach(a=>(typeof AREA_MUSCLES!=="undefined"&&AREA_MUSCLES[a]||[]).forEach(m=>set.add(m)));
  return [...set];
}
// Rank STRETCH_LIBRARY entries of one kind by how many of this session's
// muscle groups they hit (best fit first), filtered to what the active
// equipment profile actually supports, then take a stable-per-day rotation
// among the top matches so it's not the literal same N stretches forever.
function pickStretches(kind, muscles, tags, count, seedKey, dateObj){
  if(typeof STRETCH_LIBRARY==="undefined") return [];
  const eligible=STRETCH_LIBRARY.filter(s=>s.kind===kind && eqSubset(s.eq,tags) && (s.m||[]).some(m=>muscles.includes(m)));
  if(!eligible.length) return [];
  const ranked=eligible.slice().sort((a,b)=>
    (b.m||[]).filter(m=>muscles.includes(m)).length - (a.m||[]).filter(m=>muscles.includes(m)).length
  );
  if(ranked.length<=count) return ranked;
  const pool=ranked.slice(0, Math.min(ranked.length, count*2));
  const seed=hashStr(localYMD(dateObj||new Date())+"|"+seedKey);
  return seededShuffle(pool, seed).slice(0, count);
}
function warmupStretchesFor(skey, tags, dateObj, count){
  const s=SESSIONS[skey]; if(!s||!s.areas||!s.areas.length) return [];
  const muscles=areaMuscles(s.areas);
  const raise={n:"5-min easy cardio warm-up to raise your temperature (don't hold stretches cold yet)", t:"time", _phase:"warmup"};
  const dyn=pickStretches("dynamic", muscles, tags, count||3, skey+"|warmup", dateObj).map(e=>Object.assign({},e,{_phase:"warmup"}));
  return [raise, ...dyn];
}
function cooldownStretchesFor(skey, tags, dateObj, count){
  const s=SESSIONS[skey]; if(!s||!s.areas||!s.areas.length) return [];
  const muscles=areaMuscles(s.areas);
  return pickStretches("static", muscles, tags, count||3, skey+"|cooldown", dateObj).map(e=>Object.assign({},e,{_phase:"cooldown"}));
}
// Resolve one session's exercises against an equipment-tag set, honoring any
// per-day manual override (S.exChoice) and applying the weather indoor-swap
// to whichever variant actually gets chosen. Returns exercises annotated with
// _pool (all equipment-eligible alternates) and _slotIdx (for the override
// UI) so a disagreeing suggestion can be swapped without losing the rest.
// A real dynamic warm-up and static cool-down (see STRETCH_LIBRARY) are
// composed on, matched to the session's muscle groups — except for
// `other` (custom, nothing to match) and flexFromLibrary sessions (Session 5:
// its whole body IS the stretch library, not a wrapper around one).
function sessionExForProfile(skey, tags, dateObj){
  const s=SESSIONS[skey]; if(!s) return [];
  const dt=dateObj||new Date();
  const dateKey=localYMD(dt);
  const resolveSlot=(i)=>{
    const pool=sessionSlotPool(skey,i).filter(e=>eqSubset(e.eq,tags));
    if(!pool.length) return null;
    const overrideKey=dateKey+"|"+skey+"|"+i;
    const overrideIdx=(S.exChoice||{})[overrideKey];
    const idx=(overrideIdx!=null && overrideIdx<pool.length) ? overrideIdx : suggestedPoolIndex(skey,i,pool.length,dt);
    let e=pool[idx];
    if(e.out && e.indoor && weatherBad()) e=Object.assign({}, e.indoor, {_swapped:true, _from:e.n});
    return Object.assign({}, e, {_pool:pool, _slotIdx:i, _suggestedIdx:idx});
  };
  const base=s.bw||s.gym||[];
  if(skey==="other"){
    return base.map((_,i)=>resolveSlot(i)).filter(Boolean);
  }
  if(s.flexFromLibrary){
    const warmup=warmupStretchesFor(skey, tags, dt, 2);
    const flex=(typeof STRETCH_LIBRARY!=="undefined"?STRETCH_LIBRARY:[]).filter(e=>e.kind==="static" && eqSubset(e.eq,tags)).map(e=>Object.assign({},e,{_phase:"flex"}));
    const balance=base.map((_,i)=>resolveSlot(i)).filter(Boolean).map(e=>Object.assign({},e,{_phase:"balance"}));
    return [...warmup, ...flex, ...balance];
  }
  const working=base.map((_,i)=>resolveSlot(i)).filter(Boolean).map(e=>Object.assign({},e,{_phase:"work"}));
  const warmup=warmupStretchesFor(skey, tags, dt);
  const cooldown=cooldownStretchesFor(skey, tags, dt);
  return [...warmup, ...working, ...cooldown];
}
// Backward-compatible flat accessor (no pool/override metadata) for call
// sites that just want a display list. forceGym (true/false), if passed,
// synthesizes a rich-vs-empty tag set — used by FM-1's per-day resolved gym
// access; omit it to use the real active equipment profile (S.activeEquipProfile).
function sessionEx(skey, forceGym){
  const tags = forceGym==null ? activeEquipTags() : (forceGym ? EQUIP_ALL_TAGS : []);
  return sessionExForProfile(skey, tags, new Date());
}
// Set/clear today's manual exercise-slot override (the "suggestion, but let
// me choose if I disagree" layer). idx indexes into that slot's eligible pool
// as last rendered — callers pass it straight from a pool member's position.
function setExerciseChoice(skey, slotIdx, idx){
  if(!S.exChoice) S.exChoice={};
  S.exChoice[localYMD()+"|"+skey+"|"+slotIdx]=idx;
}
// Body areas / systems each FM session loads — used for PT recovery-aware adjustment.
const SESSION_AREAS = {
  s1:["legs","push","core"],   // Lower + Push
  s2:["cardio","legs"],         // Run
  s3:["pull","push","core"],    // Upper + Core
  s4:["legs","push","core","cardio"], // AFT circuit (full)
  s5:["mobility","balance"],    // Mobility + Balance (recovery-oriented, low fatigue)
  swim:["cardio"],              // Swim (optional)
  climb:["pull","core","legs"], // Rock Climbing (optional)
  other:[],
};
// Optional session types the coach may suggest (never auto-schedules) on a
// day whose active equipment profile carries the matching tag, once opted in.
function optionalSessionSuggestions(tags){
  return Object.keys(SESSIONS).filter(k=>{
    const s=SESSIONS[k];
    return s.optional && (S.optionalSessions||[]).includes(k) && eqSubset(s.eq,tags);
  });
}

// ===== Weekly training schedule (the coached rotation) =====
// JS getDay(): 0=Sun … 6=Sat. null = rest day.
//
// FM-1: the schedule is no longer a fixed day->session map. Which session TYPE
// lands on which day is now a function of that week's gym-access pattern —
// equipment-preferred sessions (heavy lower/push, upper/core, the AFT circuit)
// go on declared gym days; equipment-free sessions (runs, mobility) go on the
// rest. Sunday stays a fixed rest day, same as before; only Mon-Sat rotate.
// See assignWeekSessions()/gymAccessForDate() below.
const REST_DAY_META = { session:null, intensity:"rest", label:"Active recovery", note:"20–40 min easy walk + the Session 5 stretch block. Rest is when you actually adapt — take it." };
// Per-session label/intensity — travels with the session type wherever it lands.
// s2 (Run) is special-cased in resolveDayPlan(): the week's EARLIER run slot
// reads as the moderate "quality" run, the LATER slot as the hard/long one —
// preserving the original Tue-quality/Sat-hard distinction without pinning it
// to a fixed weekday, since which day gets which run now varies with gym access.
const SESSION_META = {
  s1:{ intensity:"hard",     label:"Strength A — Lower + Push" },
  s3:{ intensity:"hard",     label:"Strength B — Upper + Core" },
  s4:{ intensity:"hard",     label:"AFT Circuit — your weak events" },
  s5:{ intensity:"easy",     label:"Mobility + Balance (recovery)" },
};
const SESSION_META_S2 = {
  first:  { intensity:"moderate", label:"Run (keep it easy/tempo, not all-out)" },
  second: { intensity:"hard",     label:"Run (intervals OR long easy)" },
};
// Equipment-preferred sessions go on gym days first; the rest fill non-gym days.
// Order matters: earliest gym day gets s1, next gets s3, next gets s4 (mirrors
// the original week's Strength-A -> Strength-B -> AFT-circuit progression).
const GYM_PREFERRED = ["s1","s3","s4"];
const NO_GYM_PREFERRED = ["s2","s2","s5"];

// Monday (local midnight) of the week containing dateObj.
function weekMonday(dateObj){
  const d=new Date(dateObj); const dow=(d.getDay()+6)%7;
  d.setDate(d.getDate()-dow); d.setHours(0,0,0,0);
  return d;
}
// Resolved gym-access boolean for a specific calendar date, cascading:
// 1. a same-day live override (set via the "actually I do/don't have gym
//    today" toggle) — always wins when present, for TODAY specifically.
// 2. this week's confirmed/adjusted pattern, IF gymAccess.weekOf still matches
//    that date's Monday (once the user moves on to a new week without
//    touching it, weekOf stops matching and older weeks correctly fall back
//    to the default below — a deliberate simplification instead of keeping a
//    full frozen per-date history, see FINISHED-FEATURES.md's FM-1 entry).
// 3. the saved recurring default pattern.
function gymAccessForDate(dateObj){
  const ymd=localYMD(dateObj);
  const live=(S.gymAccessLive||{})[ymd];
  if(live!=null) return !!live;
  const ga=S.gymAccess||{};
  const mon=localYMD(weekMonday(dateObj));
  if(ga.weekOf===mon && ga.week && ga.week[dateObj.getDay()]!=null) return !!ga.week[dateObj.getDay()];
  return !!((ga.default||{})[dateObj.getDay()]);
}
// Set/clear today's live gym-access override (the "same-day ad-hoc change" layer).
function setGymAccessToday(val){
  if(!S.gymAccessLive) S.gymAccessLive={};
  S.gymAccessLive[localYMD()]=!!val;
}
// The pattern to show in the per-week confirm-or-adjust UI: this week's already-
// confirmed pattern if one exists for the current week, else a copy of the
// default (the starting point the user adjusts from).
function weekGymPatternForEditing(){
  const ga=S.gymAccess||{}; const mon=localYMD(weekMonday(new Date()));
  if(ga.weekOf===mon && ga.week) return Object.assign({}, ga.week);
  return Object.assign({}, ga.default||{});
}
function weekGymPatternIsConfirmed(){
  return (S.gymAccess||{}).weekOf===localYMD(weekMonday(new Date()));
}
function confirmWeekGymPattern(pattern){
  if(!S.gymAccess) S.gymAccess={default:{1:true,3:true,5:true},weekOf:null,week:{}};
  S.gymAccess.weekOf=localYMD(weekMonday(new Date()));
  S.gymAccess.week=Object.assign({}, pattern);
}
function saveDefaultGymPattern(pattern){
  if(!S.gymAccess) S.gymAccess={default:{1:true,3:true,5:true},weekOf:null,week:{}};
  S.gymAccess.default=Object.assign({}, pattern);
}
// Assign session types to Mon-Sat for the week containing mondayDate, based on
// that week's per-day resolved gym access. Deterministic given the same
// gym-access pattern (no randomness), so it doesn't flicker across renders.
function assignWeekSessions(mondayDate){
  const days=[1,2,3,4,5,6];
  const gymDays=days.filter(d=>{ const dt=new Date(mondayDate); dt.setDate(mondayDate.getDate()+(d-1)); return gymAccessForDate(dt); });
  const nonGymDays=days.filter(d=>!gymDays.includes(d));
  const poolA=GYM_PREFERRED.slice(), poolB=NO_GYM_PREFERRED.slice();
  const assign={};
  gymDays.forEach(d=>{ if(!assign[d] && poolA.length) assign[d]=poolA.shift(); });
  nonGymDays.forEach(d=>{ if(!assign[d] && poolB.length) assign[d]=poolB.shift(); });
  // leftovers: not enough gym days for all equipment-preferred sessions, or vice versa
  nonGymDays.forEach(d=>{ if(!assign[d] && poolA.length) assign[d]=poolA.shift(); });
  gymDays.forEach(d=>{ if(!assign[d] && poolB.length) assign[d]=poolB.shift(); });
  days.forEach(d=>{ if(!assign[d]) assign[d]=null; });
  return assign;
}
// Which of this week's two s2 (Run) slots a given day is — "first" (earlier,
// the quality/moderate run) or "second" (later, the hard/long one) — or null
// if that day isn't a run day. Falls back to "first" if only one run landed
// this week (an edge case: e.g. 7/7 gym days leaves only 1 non-gym-preferred
// slot filled before the pool runs out... in practice always 2 with 6 active
// days, but stay defensive).
function runSlotFor(dateObj){
  const mon=weekMonday(dateObj);
  const assign=assignWeekSessions(mon);
  const runDays=Object.keys(assign).map(Number).filter(d=>assign[d]==="s2").sort((a,b)=>a-b);
  const day=dateObj.getDay();
  const idx=runDays.indexOf(day);
  if(idx<0) return null;
  return (idx===runDays.length-1 && runDays.length>1) ? "second" : "first";
}
// Short how-to for each exercise that appears in a session (matched by a keyword in the name).
// Keeps the coached card self-explanatory without opening the glossary.
const EX_HOWTO=[
  // --- no-equipment lower/push ---
  ["reverse lunge","From standing, step one foot straight back and lower until both knees are ~90°, then drive through the front heel back up. Alternate legs."],
  ["single-leg glute bridge","Lie on your back, one knee bent with that foot flat, other leg straight out. Push through the planted heel to lift your hips into a line, squeeze, lower."],
  ["hand-release push-up","A push-up where, at the bottom, you lower fully to the floor and lift your hands off for a moment, then place them and press up."],
  ["pike push-up","From a push-up position, walk your feet in and raise your hips into an upside-down V. Bend your elbows to lower your head toward the floor, then press up."],
  ["shrimp","A single-leg squat on the floor: stand on one leg, hold the other foot behind you (or just keep it lifted), and lower under control as far as you can, then stand. Hold a wall to balance."],
  ["hollow-body","Lie on your back, press your lower back into the floor, and lift your shoulders and legs a few inches so your body makes a shallow banana. Hold and breathe."],
  ["single-leg hip hinge","Stand on one leg, slight knee bend. Tip your torso forward and float the free leg straight behind you (arms out like wings), then stand tall. Hamstrings + balance."],
  // --- gym lower/push ---
  ["bulgarian split squat","Rest the top of your back foot on a bench behind you, lower the front leg until the thigh is ~parallel, drive back up through the front heel."],
  ["single-leg rdl","Stand on one leg holding a weight; hinge at the hip, tipping forward while the free leg lifts behind you, then stand tall. Keep your back flat."],
  ["bench press","Lying on a bench, press the bar or dumbbells from your chest to straight arms and back down."],
  ["overhead press","Standing, press a barbell or dumbbells from your shoulders to overhead, then lower under control."],
  ["leg press","Push the weighted platform away with your legs on the machine, then return under control without locking the knees hard."],
  ["goblet squat","Hold a dumbbell or kettlebell at your chest and squat down to at least parallel, chest tall, then stand."],
  ["machine crunch","Loaded core flexion on a cable or ab machine — curl your ribs toward your hips against the resistance."],
  ["deadlift","Bar over mid-foot; hinge with a flat back and grip it, then stand tall driving your hips forward, bar close to your body. Never round the lower back."],
  // --- runs / cardio (outdoor) ---
  ["intervals (sprint","Short fast efforts with rest between: sprint ~400m or 60–90s hard, then walk/jog 90s, and repeat for the set count. Builds speed."],
  ["tempo run","A sustained 'comfortably hard' pace you can only say a few words at — hold it for 15–25 minutes."],
  ["long easy run","A slow, conversational-pace run, longer than usual (30–50 min). Builds the aerobic base behind the 2-mile."],
  ["timed 2-mile","Run 2 miles as fast as you can sustain and record the time — the AFT run, used as a test, not every week."],
  // --- gym cardio ---
  ["treadmill interval","Run hard/easy bursts on a treadmill; add incline to build power and spare your joints."],
  ["treadmill tempo","Hold a comfortably-hard pace on the treadmill for 15–25 min."],
  ["rower interval","Hard/easy bursts on a rowing machine — cardio that spares your legs for lifting days."],
  ["stationary bike","Hard/easy bursts on a stationary bike — cardio that spares your legs for lifting days."],
  // --- indoor weather swaps ---
  ["indoor intervals","8 rounds of 30 seconds hard / 60 seconds easy (rest or march in place). Rotate through 4 moves so each gets hit exactly twice: round 1 burpees, 2 high-knees, 3 mountain-climbers, 4 squat jumps, then repeat the cycle for rounds 5–8. That keeps every move balanced. A burpee = squat down, kick your feet back to a push-up, do the push-up, jump your feet in, jump up."],
  ["indoor tempo","Keep moving continuously for 20 minutes at a steady, comfortably-hard effort — never fully stopping. Cycle through the 4 moves 5 minutes each (jumping jacks, shadow boxing, step-ups, jog in place) so every move gets equal time. The rotation just keeps any one move from wearing you out — the goal is continuous effort."],
  ["indoor steady cardio","40 min of easy, continuous low-impact movement. Cycle through the 4 moves 10 minutes each (march or jog in place, step-ups, jumping jacks, shadow boxing) so every move gets equal time. Keep it conversational; this is base-building, not a sprint."],
  ["indoor cardio test","Set a 20-minute clock and do as much steady jog-in-place / burpee work as you can, counting your reps or rounds. Log that number — it's your indoor benchmark to beat next time."],
  ["in-place shuttle","In a hallway or room, step or shuffle quickly to a mark a few yards away, touch low, and come back — repeat for the time. Or do burpee-to-sprint-step in place. Mimics the change-of-direction of the Sprint-Drag-Carry."],
  ["hard cardio burst","45 seconds all-out on one move — mountain climbers, jog in place, or jumping jacks — then move to the next exercise in the circuit."],
  // --- upper / core (no-equipment) ---
  ["doorway/towel row","Loop a towel around a sturdy doorknob (both sides of a door) or a fixed post, lean back with arms straight, then pull your chest toward your hands and squeeze your shoulder blades."],
  ["towel pull-apart","Hold a towel in front of you at shoulder width and pull it apart hard (it won't stretch — it's the tension that works the back). For Y-T-W raises: lie face-down and lift your arms off the floor tracing a Y, then a T, then a W shape, squeezing the upper back each time. Builds the pulling and posture muscles without a bar."],
  ["decline push-up","Push-ups with your feet up on a step or ledge so you're angled head-down. Shifts load to the upper chest and shoulders."],
  ["diamond push-up","Push-ups with your hands close together under your chest (thumbs and index fingers forming a diamond). Hits the triceps."],
  ["side plank","On one forearm, body turned sideways in a straight line, hips lifted and stacked. Hold, then switch sides. Trains the obliques."],
  ["superman","Lie face-down, arms extended ahead. Lift your arms, chest, and legs off the floor together (like flying), hold a moment, lower. Strengthens the lower back."],
  ["plank","Forearms under your shoulders, body in a straight line from head to heels, abs and glutes tight. Hold without letting your hips sag or pike up."],
  ["grip squeeze","Squeeze a grip trainer or a rolled towel hard for the time, then rest and repeat. Builds the grip that carries the Sprint-Drag-Carry."],
  // --- upper / core (gym) ---
  ["pull-up","Hang from a bar (palms away), arms straight, and pull until your chin clears the bar, then lower all the way. Use a band or the lat-pulldown machine if you can't do one yet."],
  ["lat pulldown","Seated at the machine, pull the bar down to your upper chest, squeezing your shoulder blades, then return under control."],
  ["seated cable row","Pull a cable handle toward your stomach, squeezing the shoulder blades, then return under control. Horizontal pulling for the mid-back."],
  ["barbell row","Hinge over a barbell with a flat back and pull it toward your stomach, squeezing the shoulder blades, then lower under control. The barbell-loaded version of the cable row."],
  ["incline db press","Press dumbbells from your shoulders to straight arms on an inclined bench — upper chest and shoulders."],
  ["face pull","Pull a rope to your face with your elbows high — strengthens the rear shoulders and posture muscles."],
  ["hanging knee raise","Hang from a bar and raise your knees toward your chest, then lower under control. Core."],
  ["back extension","Hinge over a back-extension bench or machine and raise your torso to a straight line, then lower. Loaded lower back."],
  ["farmer's carry","Hold a heavy dumbbell or kettlebell in each hand and walk a set distance, standing tall and braced. Grip, core, and carry strength."],
  // --- ROTC-trailer carries/drags (confirmed equipment: full AFT kit, water jugs, weighted stretcher) ---
  ["water jug carry","Hold a filled water jug in each hand (or one held at your chest with both hands) and walk a set distance, standing tall and braced. Grip, core, and carry strength — same movement as the farmer's carry, trailer-equipment version."],
  ["stretcher carry","With a partner, grip the stretcher's handles at each end (add weight — sandbags, plates, or more water jugs — across it) and carry it a set distance, staying tall and in step with each other. Grip, core, and shoulders — mirrors a real casualty-carry load."],
  ["stretcher drag","Grip the stretcher's near handles, hinge at the hips with a flat back, and drag it a set distance, driving through your legs. Mimics the SDC drag using real trailer equipment."],
  ["loaded ruck carry","Load the rucksack to a manageable, honest weight, put it on with both straps snug, and walk/carry it a set distance standing tall. Build the load up gradually — this is a loaded carry, not a max-effort lift."],
  ["sandbag carry","Hold a sandbag against your chest (or one in each hand if using smaller bags) and walk a set distance, standing tall and braced. The shifting weight adds a real core-stability demand a fixed dumbbell doesn't."],
  ["tire flip","Squat down, grip the tire's near edge, and drive through your legs and hips to flip it forward, then reset and repeat. Full-body power — legs, back, and grip."],
  // --- AFT circuit ---
  ["shuttle sprint","Sprint to a line ~25m away, touch it, sprint back, and repeat. Mimics the change-of-direction of the Sprint-Drag-Carry without a sled."],
  ["bear crawl","On hands and feet with knees just off the floor, crawl forward keeping your back flat. Replaces the SDC drag — taxes legs, shoulders, and core."],
  ["squat jump","Drop into a squat, explode straight up off the floor, land soft with bent knees, and immediately go into the next one. Explosive leg power."],
  ["200m run","A half-lap of a track at a hard pace — a short conditioning burst."],
  ["sled push","Push or drag a weighted sled the set distance — the closest thing to the real Sprint-Drag-Carry."],
  ["loaded carry","Carry heavy kettlebells or dumbbells a set distance, tall and braced — the carry portion of the SDC."],
  ["box jump","Jump from a squat onto a sturdy box, step back down, and repeat. Explosive power with a target."],
  ["rower 200m","An all-out 200m on the rowing machine — a full-body conditioning burst."],
  // --- mobility / balance ---
  ["world's-greatest","Step into a deep lunge, place both hands inside your front foot, then rotate your torso and reach the inside arm up toward the ceiling. Return, switch legs."],
  ["hamstring stretch","Standing, put one heel out front with the leg straight, toes up; hinge forward at the hips with a flat back until you feel the back of the thigh. Hold, switch."],
  ["hip-flexor stretch","Kneel on one knee with the other foot flat in front. Tuck your hips under and push them gently forward until you feel the front of the kneeling-leg hip. Hold, switch."],
  ["figure-4 glute","Lie on your back, cross one ankle over the opposite knee (a '4'), then pull that opposite thigh toward your chest until you feel the crossed-leg glute. Hold, switch."],
  ["quad stretch","Standing (hold a wall), grab one ankle behind you and pull your heel toward your butt, knees together, hips forward. Hold, switch."],
  ["calf stretch","Hands on a wall, one foot back with the leg straight and heel down — feel the upper calf. Then slightly bend that knee to shift the stretch lower. Hold each, switch."],
  ["doorway chest","Forearm on a door frame, elbow about shoulder height, step through gently until you feel a stretch across the chest and front shoulder. Hold, switch arms."],
  ["thoracic rotation","On hands and knees, hand behind your head, rotate that elbow down toward the opposite arm, then open it up toward the ceiling. Pair with cat-cow to loosen the mid-back."],
  ["single-leg stand","Stand on one leg near a wall. Progress over time: eyes open, then eyes closed, then on a pillow. Hold for the time, then switch legs."],
  ["single-leg hinge reach","Stand on one leg and slowly hinge forward, reaching toward the floor, then stand tall. Slow and controlled — it's a balance drill."],
  ["tandem","Walk a straight line placing the heel of each step directly against the toe of the other foot, like a tightrope. Arms out to balance."],
  ["y-balance","Stand on one leg. With the free foot, reach as far as you can to the front, then the side, then behind you (tracing a Y) without touching down. Return to center between reaches."],
  ["warm-up","5 minutes of easy movement to raise your temperature — jog in place, jumping jacks, or a brisk walk. Don't stretch cold muscles."],
  ["band shoulder","Hold a band wider than shoulder-width and, keeping your arms straight, take it from in front of you up and over your head to behind you, then back. Opens the shoulders."],
  ["foam-roll","Slowly roll the target muscle over a foam roller, pausing on tight spots, to loosen the tissue before stretching."],
  // --- dynamic warm-up moves (moving, done cold — never held) ---
  ["leg swings, front","Hold a wall for balance and swing one leg forward and back in a controlled arc, keeping your knee mostly straight. Do the set, then switch legs."],
  ["leg swings, side","Hold a wall for balance and swing one leg out to the side and back across your body in a controlled arc. Do the set, then switch legs."],
  ["walking lunges","Step forward into a lunge, both knees near 90°, then as you stand rotate your torso toward your front leg. Alternate legs as you walk forward."],
  ["bodyweight squats","Feet shoulder-width, squat down under control until your thighs are near parallel, then stand. Slow and controlled — this is a mobility opener, not a max-effort set."],
  ["arm circles","Arms out to your sides, make small circles that gradually grow larger, then reverse direction. Warms up the shoulder joint through its full range."],
  ["arm swings","Swing both arms across your chest and back out wide, like a big self-hug and release, picking up a little more range each rep."],
  ["cat-cow flow","On hands and knees, alternate between arching your back up and looking down (cat) and letting it sag while lifting your head (cow), flowing smoothly between the two."],
  ["torso twists","Standing, feet shoulder-width, rotate your upper body side to side with a little momentum, letting your arms swing loosely. Keep your hips mostly facing forward."],
  ["high knees","Jog in place, driving your knees up toward your chest each step, arms pumping."],
  ["butt kicks","Jog in place, kicking your heels back up toward your glutes each step."],
  ["inchworm","From standing, hinge over and walk your hands out to a push-up position, do one push-up, then walk your feet back up to your hands and stand. Warms hamstrings, shoulders, and core together."],
  ["hip circles","Hands on your hips, make slow, large circles with your hips like a hula-hoop, then reverse direction. Switch which leg bears more weight to bias each side."],
  ["ankle circles","Lift one foot slightly off the floor and circle it at the ankle, both directions, then switch feet. Follow with a few slow calf raises to finish warming the lower leg."],
  // --- static cool-down stretches (held, muscles warm) ---
  ["cross-body shoulder","Bring one arm straight across your chest, use the other forearm to gently pull it closer, and hold. Switch arms."],
  ["lat stretch","Reach one arm overhead, grab that wrist with your other hand, and lean your torso to the opposite side until you feel a stretch down your side/lat. Hold, switch."],
  ["triceps stretch","Reach one arm overhead and bend the elbow so your hand drops behind your head; use the other hand to gently press the elbow further. Hold, switch."],
  ["child's pose","Kneel and sit back toward your heels, reaching your arms forward on the floor and letting your chest sink toward the ground. Breathe and relax into it."],
  ["spinal twist","Sitting with legs extended (or one crossed over the other), rotate your torso toward one side, using your arm against your leg for leverage. Hold, switch sides."],
  ["wrist/forearm","Extend one arm out, palm up, and gently pull the fingers back with the other hand until you feel a stretch through the forearm; repeat palm-down. Switch arms."],
  // --- Swim (optional session) ---
  ["easy continuous swim","Swim continuously at a conversational, sustainable pace for the time — any stroke, mixing strokes is fine. Builds the aerobic base without pounding your joints."],
  ["swim intervals","Swim a hard 50m, then rest ~30s at the wall, and repeat for the set count. Builds swim-specific speed and lung capacity."],
  ["kickboard","Hold a kickboard out front and kick continuous laps, then switch to a pull-buoy between your legs and pull with your arms only. Isolates legs, then arms, to build technique in each separately."],
  // --- Rock Climbing (optional session) ---
  ["bouldering","Climb short, unroped problems on the bouldering wall at a moderate grade you can mostly complete, resting between attempts. Builds pulling strength, grip, and body awareness."],
  ["top-rope climbing","Climb roped routes on the wall with a belay partner or auto-belay, resting between routes. Sustained pulling and grip endurance over a longer route than bouldering."],
  ["traverse","Move sideways across the wall low to the ground without climbing up, staying on for the full time. Builds grip and pulling endurance without the fall risk of height."],
];
function exHowto(name){
  const n=String(name||"").toLowerCase();
  const hit=EX_HOWTO.find(([k])=> n.includes(k));
  return hit? hit[1] : "";
}
// Resolve a full day-plan object {session, intensity, label, note?} for a
// given Date. Sunday is a fixed rest day; Mon-Sat's session type comes from
// that week's gym-access-driven assignment (assignWeekSessions), with s2's
// label/intensity further split by which of the week's two run slots this
// day landed (see runSlotFor).
function planForDay(dateObj){
  const day=dateObj.getDay();
  if(day===0) return REST_DAY_META;
  const assign=assignWeekSessions(weekMonday(dateObj));
  const skey=assign[day];
  if(!skey) return REST_DAY_META;
  if(skey==="s2"){
    const slot=runSlotFor(dateObj)||"first";
    return Object.assign({session:"s2"}, SESSION_META_S2[slot]);
  }
  return Object.assign({session:skey}, SESSION_META[skey]);
}
// For "pick one" sessions (the run), choose which variant to do today, with a
// sensible rotation. The week's earlier run slot = the easier/quality
// midweek-style run; the later slot = the harder/longer one — see runSlotFor
// for how "earlier/later" is now determined (gym-access can move which actual
// weekday each run lands on, so this no longer hardcodes Tue/Sat).
// Every 3rd week, the later slot becomes a timed 2-mile test so progress gets measured.
function pickRunIndex(dateObj){
  const slot=runSlotFor(dateObj)||"first";
  // Continuous week count since a fixed epoch (a Monday) so the cadence never resets
  // at the New Year. Using local midnight avoids DST drift.
  const EPOCH=Date.UTC(2024,0,1); // Mon Jan 1 2024, an arbitrary stable anchor
  const dayUTC=Date.UTC(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate());
  const week=Math.floor((dayUTC-EPOCH)/(7*864e5));
  if(slot==="second"){ // harder/longer slot
    if(week%3===2) return 3;   // timed 2-mile test every 3rd week (continuous cadence)
    return 2;                  // long easy run
  }
  // earlier/quality slot = alternating intervals/tempo
  return (week%2===0) ? 0 : 1; // intervals on even weeks, tempo on odd
}
// Adaptive pick for what an AFT-circuit (s4) day should actually be: a full
// guided mock AFT, single-event practice on the weakest event, or the normal
// bodyweight/gym circuit — per the doc's "let the coach decide adaptively,
// no fixed cadence" resolution. Reuses signals the app already computes
// (recoveryReadiness, AFT history, the declared test date) rather than adding
// new tracking.
function pickAftMode(){
  const lastAft=(S.aft||[])[S.aft.length-1];
  const daysSinceTest=lastAft?Math.abs(dayDiff(lastAft.date,localYMD())):999;
  const testDate=S.aftTestDate;
  const daysToTest=testDate?dayDiff(localYMD(),testDate):null;
  const rec=typeof recoveryReadiness==="function"?recoveryReadiness():null;
  const notRecovered=rec&&rec.level==="easy"; // two-or-more negative recovery flags
  if(notRecovered) return "circuit"; // lower-demand default when markers say ease off
  // close to a real test -> rehearse full conditions
  if(daysToTest!=null && daysToTest>=0 && daysToTest<=14) return "mock";
  // haven't tested in a long time -> a full mock re-baselines
  if(daysSinceTest>=45) return "mock";
  // otherwise: sharpen the weakest single event
  if(lastAft) return "practice";
  // no AFT history at all yet -> a full mock establishes the baseline
  return "mock";
}
// Most recent logged weight for a named weighted exercise, straight from real
// workout history (S.workouts) — never fabricated. Returns null if it's never
// been logged with a weight before.
function lastLoggedWeight(exName){
  const workouts=(S.workouts||[]).slice().sort((a,b)=>new Date(b.ts||b.date)-new Date(a.ts||a.date));
  for(const w of workouts){
    const ex=(w.exercises||[]).find(e=>e.name===exName && e.w);
    const withWeight=(ex&&ex.sets||[]).slice().reverse().find(s=>s.weight);
    if(withWeight) return {weight:withWeight.weight, date:w.date};
  }
  return null;
}
// Set/rep/weight prescription per intensity — how to actually run today's exercises, in order.
function prescriptionFor(intensity, ex){
  // returns a short "what to do" string for an exercise given the day's intensity
  const t=ex.type||ex.t;
  let base="as prescribed";
  if(intensity==="hard"){
    if(t==="reps") base="3–4 sets, leave 1–2 reps in the tank";
    else if(t==="time") base="3 sets, push the hold/effort";
    else if(t==="dist") base="main effort — see the session note for distance/pace";
  } else if(intensity==="moderate"){
    if(t==="reps") base="2–3 sets, controlled";
    else if(t==="time") base="2–3 sets, steady";
    else if(t==="dist") base="easy–tempo pace, conversational";
  } else { // easy / recovery / rest
    if(t==="reps") base="1–2 easy sets, focus on form";
    else if(t==="time") base="hold as prescribed, relaxed";
    else if(t==="dist") base="easy pace only";
  }
  // Weight suggestion — only for weighted (equipment) exercises, sourced from
  // your own logged history, not guessed. A real adaptive version (learning
  // from logged difficulty/completion, not just "repeat last time") is a
  // planned future phase — see planning/IDEAS-tests-fm-workouts.md.
  if(t==="reps" && ex.w){
    const last=lastLoggedWeight(ex.n);
    base += last
      ? ` · last logged: ${last.weight} (${last.date}) — repeat it, or add a little if every rep felt easy`
      : " · no logged weight yet — start conservative and find a load where the last 1–2 reps are genuinely hard";
  }
  return base;
}
// Did the user log a workout on a given Date (local day)?
function workoutOnDay(dateObj){
  const ymd=localYMD(dateObj);
  return (S.workouts||[]).find(w=> (w.ts? localYMD(new Date(w.ts)) : null)===ymd || w.date===dateObj.toLocaleDateString());
}
// Build a structured "today's plan": what session, the ordered exercises with prescriptions,
// and a read on yesterday (what was scheduled vs. what was logged).
function todaysPlan(){
  const now=new Date();
  const dayPlan=planForDay(now);
  const yest=new Date(now); yest.setDate(now.getDate()-1);
  const yPlan=planForDay(yest);
  const yLogged=workoutOnDay(yest);
  const tLogged=workoutOnDay(now);
  return {
    now, dayPlan,
    sessionKey: dayPlan.session,
    exercises: dayPlan.session ? sessionExForProfile(dayPlan.session, gymAccessForDate(now)?activeEquipTags():[], now) : [],
    todayLogged: !!tLogged, todayLog: tLogged,
    yesterday: {
      plan: yPlan,
      wasRest: !yPlan.session,
      logged: !!yLogged,
      log: yLogged,
      // did yesterday's log match what was scheduled?
      onPlan: yLogged && yPlan.session && yLogged.session===yPlan.session,
    }
  };
}
// The areas the cadet can tag a PT session with.
const PT_AREAS = [
  {k:"legs",   label:"Legs / lower body", note:"squats, lunges, ruck, sprints"},
  {k:"push",   label:"Push (chest/shoulders/tris)", note:"push-ups, presses"},
  {k:"pull",   label:"Pull (back/biceps)", note:"pull-ups, rows"},
  {k:"core",   label:"Core", note:"planks, flutter kicks, sit-ups"},
  {k:"cardio", label:"Cardio / conditioning", note:"runs, sprints, circuits"},
];
// Movement keyword library: maps PT exercises (typed in free text) to the areas they load.
// Each entry: regex of synonyms -> {name (canonical), areas[]}. Order roughly specific→general.
const PT_MOVES = [
  {re:/\b(2[\s-]?mile|two[\s-]?mile|distance run|long run|formation run|ability group run|agr)\b/i, name:"distance run", areas:["cardio","legs"]},
  {re:/\b(sprint|interval|gasser|shuttle|suicides?|wind ?sprints?|200m|400m|hill repeats?)\b/i, name:"sprints/intervals", areas:["cardio","legs"]},
  {re:/\b(run|ruck|march|road march|jog)\b/i, name:"run/ruck", areas:["cardio","legs"]},
  {re:/\b(lunge|walking lunge|reverse lunge|step[\s-]?up)/i, name:"lunges", areas:["legs"]},
  {re:/\b(squat|air squat|jump squat|squat jump|wall sit|pistol)/i, name:"squats", areas:["legs"]},
  {re:/\b(deadlift|rdl|hinge|kettlebell swing|kb swing)/i, name:"deadlift/hinge", areas:["legs","pull","core"]},
  {re:/\b(jug carry|jug carries|water jug|farmer'?s? carr|sandbag carr|\bcarry\b|\bcarries\b|sdc|sprint[\s-]?drag[\s-]?carry)/i, name:"loaded carries", areas:["legs","core","pull"]},
  {re:/\b(box jump|broad jump|burpee|bound|plyo)/i, name:"plyometrics", areas:["legs","cardio","core"]},
  {re:/\b(push[\s-]?up|hand[\s-]?release|hrp|diamond push|pike push|incline push|decline push)/i, name:"push-ups", areas:["push","core"]},
  {re:/\b(bench|overhead press|ohp|shoulder press|\bdip|press)/i, name:"presses", areas:["push"]},
  {re:/\b(pull[\s-]?up|chin[\s-]?up|inverted row|\brow|lat pull)/i, name:"pulls/rows", areas:["pull"]},
  {re:/\b(plank|hollow|flutter|leg raise|sit[\s-]?up|crunch|v[\s-]?up|russian twist|mountain climber|toe touch|superman|back extension)/i, name:"core work", areas:["core"]},
  {re:/\b(jumping jack|sprawl|bear crawl|crawl|circuit|wod|metcon|conditioning|jump rope)/i, name:"conditioning", areas:["cardio","core","legs"]},
  {re:/\b(yoga|stretch|mobility|recovery|foam roll|cooldown|warm[\s-]?up)\b/i, name:"mobility", areas:[]},
];
// Parse free text -> {moves:[{name,areas}], areas[]}
function parsePT(text){
  const found=[], areas=new Set();
  const haveRun = /\b(2[\s-]?mile|two[\s-]?mile|distance run|long run|formation run|ability group run|agr|sprint|interval|gasser|shuttle|suicides?|wind ?sprints?|200m|400m|hill repeats?)\b/i.test(text);
  PT_MOVES.forEach(m=>{
    // skip the generic "run/ruck" if a more specific run/sprint already matched (avoids duplicate tag)
    if(m.name==="run/ruck" && haveRun) return;
    if(m.re.test(text)){ found.push({name:m.name,areas:m.areas}); m.areas.forEach(a=>areas.add(a)); }
  });
  return {moves:found, areas:[...areas]};
}
// ===== Adaptive training: missed-session tracking =====
// Scans the past 7 days, records any scheduled session that had no matching workout.
// Deduplicates — safe to call on every render. Trims to last 28 days automatically.
function trackMissedSessions(){
  if(!S.missedTraining) S.missedTraining=[];
  const now=new Date();
  for(let i=1;i<=7;i++){
    const d=new Date(now); d.setDate(now.getDate()-i);
    const plan=planForDay(d);
    if(!plan||!plan.session) continue;
    const dayStr=localYMD(d);
    if(S.missedTraining.some(m=>m.date===dayStr)) continue;
    if(!workoutOnDay(d)) S.missedTraining.push({date:dayStr, session:plan.session});
  }
  const cutoff=localYMD(new Date(now.getTime()-28*864e5));
  S.missedTraining=S.missedTraining.filter(m=>m.date>=cutoff);
}

// Sessions missed in the past N days (most-recent first).
function recentMissed(days){
  if(!S.missedTraining) return [];
  const cutoff=localYMD(new Date(Date.now()-days*864e5));
  return S.missedTraining.filter(m=>m.date>=cutoff).slice().reverse();
}

// Short coaching paragraph based on recent missed sessions.
function getAdaptiveNote(){
  const missed=recentMissed(7);
  if(!missed.length) return null;
  const names=[...new Set(missed.map(m=>(SESSIONS[m.session]?SESSIONS[m.session].name.split("·").slice(-1)[0].trim():"a session")))];
  if(missed.length===1){
    return `You missed ${names[0]} last week. Don't double up to compensate — just don't let it happen twice in a row. One missed session means nothing; a habit of skipping one type of work shows up in your score.`;
  }
  return `Last week you missed ${names.join(" and ")} (${missed.length} session${missed.length!==1?'s':''}). The plan keeps rolling — don't try to cram missed work in. Pick back up from today and hit the sessions you tend to skip hardest next week.`;
}

// How many training sessions have been completed vs scheduled this week (Mon–Sun).
function weekTrainingStats(){
  const now=new Date();
  const dFromMon=(now.getDay()+6)%7;
  const mon=new Date(now); mon.setDate(now.getDate()-dFromMon); mon.setHours(0,0,0,0);
  let sched=0,done=0;
  for(let i=0;i<7;i++){
    const d=new Date(mon); d.setDate(mon.getDate()+i);
    const plan=planForDay(d);
    if(!plan||!plan.session) continue;
    sched++;
    const dayEnd=new Date(d); dayEnd.setHours(23,59,59,999);
    if(dayEnd<=now && workoutOnDay(d)) done++;
  }
  return {done,sched};
}

// Monthly baseline = one max-effort set per key movement. These map to AFT
// events + the plan's core lifts so the updater can re-anchor each month.
const BASELINE_TEST = [
  {key:"max_pushups", name:"Max hand-release push-ups (2 min)", type:"reps", aft:"hrp"},
  {key:"max_plank",   name:"Max plank hold", type:"time", aft:"plank"},
  {key:"max_deadlift",name:"3-rep max deadlift (lbs)", type:"reps", w:true, aft:"dl"},
  {key:"max_pullups", name:"Max pull-ups (one set)", type:"reps"},
  {key:"max_squat",   name:"Max bodyweight squats (2 min)", type:"reps"},
  {key:"run_2mi",     name:"Timed 2-mile run", type:"dist", aft:"run", lowerBetter:true},
  {key:"sdc_sim",     name:"Sprint-Drag-Carry sim (time)", type:"time", aft:"sdc", lowerBetter:true},
];
