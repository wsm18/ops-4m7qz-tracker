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
// Continuous week count since a fixed epoch (a Monday) so any week-based
// cadence never resets at the New Year, and stays DST-safe (local-midnight
// UTC day math). Originally inlined only in pickRunIndex(); extracted so
// the deload cadence in planForDay() can share the exact same clock rather
// than inventing a second one.
const TRAINING_EPOCH=Date.UTC(2024,0,1); // Mon Jan 1 2024, an arbitrary stable anchor
function weeksSinceEpoch(dateObj){
  const dayUTC=Date.UTC(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate());
  return Math.floor((dayUTC-TRAINING_EPOCH)/(7*864e5));
}
// Every muscle-group tag actually in use across SESSIONS (bw/gym/alt slots),
// derived live rather than hand-maintained as a second list — so the avoid-
// tags UI (renderAvoidTagsUI(), plan.js) can never drift out of sync with
// what exercises are really tagged.
function allMuscleTags(){
  const set=new Set();
  Object.keys(SESSIONS).forEach(skey=>{
    const s=SESSIONS[skey];
    [...(s.bw||[]), ...(s.gym||[]), ...Object.values(s.alt||{}).flat()].forEach(e=>(e.m||[]).forEach(m=>set.add(m)));
  });
  return [...set].sort();
}
// Which VDOT pace zone (see vdotPaceZones(), aft.js) a given run exercise
// NAME targets — "easy"/"threshold"/"interval" — or null for exercises that
// aren't a real running pace (rower/bike cross-training, the beginner
// run-walk alt, or "Timed 2-mile" itself, which IS the benchmark test, not
// a pace-zone target). Tagged directly on the specific SESSIONS.s2 entries
// (paceZone field) rather than a separate name-string lookup table, so a
// future rename can't silently desync the two.
function exercisePaceZone(name){
  const s2=SESSIONS.s2; if(!s2) return null;
  const hit=[...(s2.bw||[]), ...(s2.gym||[])].find(e=>e.n===name);
  return (hit && hit.paceZone) || null;
}
// Injury-aware avoidance is a SOFT preference, not a hard exclusion: if a
// nagging shoulder/back/etc. is set (S.avoidTags) and the WHOLE pool loads
// that area, filtering it out entirely would silently empty a slot (or, on
// a run/AFT-circuit day with thin alt pools, could gut most of the session)
// — worse than just suggesting the flagged move. Only narrows the pool when
// a genuinely unflagged alternative actually exists within it.
function applyAvoidTags(pool, avoidTags){
  if(!avoidTags||!avoidTags.length) return pool;
  const safe=pool.filter(e=>!(e.m||[]).some(m=>avoidTags.includes(m)));
  return safe.length?safe:pool;
}
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
    const eqPool=sessionSlotPool(skey,i).filter(e=>eqSubset(e.eq,tags));
    const pool=applyAvoidTags(eqPool, S.avoidTags||[]);
    if(!pool.length) return null;
    const overrideKey=dateKey+"|"+skey+"|"+i;
    const overrideIdx=(S.exChoice||{})[overrideKey];
    let idx;
    if(overrideIdx!=null && overrideIdx<pool.length){
      idx=overrideIdx;
    } else {
      // Prefer whichever pool candidate the user has actually logged sets
      // for before, over the date-hash rotation — computeTarget()'s adaptive
      // tier needs 2-3 CONSECUTIVE logs under the exact same exercise name to
      // read a trend/stall. Rotating the suggested name day-to-day (even
      // among equipment-eligible equivalents, e.g. hand-release vs. knee
      // push-ups) fragmented that history across names that individually
      // never accumulated enough logs — quietly locking a consistent user
      // out of the adaptive tier for that slot indefinitely. Only kicks in
      // once real history exists; a never-logged slot still rotates for
      // discovery/variety.
      const loggedIdx=typeof exerciseSeries==="function"?pool.findIndex(e=>exerciseSeries(e.n).length>0):-1;
      idx=loggedIdx>=0?loggedIdx:suggestedPoolIndex(skey,i,pool.length,dt);
    }
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
// Both this map and S.gymAccessLive add one new key per day forever with no
// cutoff — unlike S.missedTraining, which explicitly trims to a 28-day
// window in this same file. Same trim, applied consistently now.
function trimDateKeyedMap(map, days){
  const cutoff=localYMD(new Date(Date.now()-days*864e5));
  Object.keys(map).forEach(k=>{ if(k.split("|")[0]<cutoff) delete map[k]; });
}
function setExerciseChoice(skey, slotIdx, idx){
  if(!S.exChoice) S.exChoice={};
  S.exChoice[localYMD()+"|"+skey+"|"+slotIdx]=idx;
  trimDateKeyedMap(S.exChoice, 28);
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
const PT_DAY_META = { session:"pt", intensity:"hard", label:"ROTC PT (unit-led)", note:"This counts as today's session — log it in the PT box on the Log tab. No separate FM session today, so you don't double up on a day already loaded by cadre." };
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
  swim:{ intensity:"moderate", label:"Swim (cross-training)" },
  climb:{ intensity:"hard",    label:"Rock Climbing (cross-training)" },
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
  trimDateKeyedMap(S.gymAccessLive, 28);
}
// Declared unit-PT days — same cascade as gymAccessForDate() (no live-override
// layer, since a same-day PT surprise is better handled by just logging PT and
// letting the deload advisory see it, not a second toggle to remember).
function ptDayForDate(dateObj){
  const pd=S.ptDays||{};
  const mon=localYMD(weekMonday(dateObj));
  if(pd.weekOf===mon && pd.week && pd.week[dateObj.getDay()]!=null) return !!pd.week[dateObj.getDay()];
  return !!((pd.default||{})[dateObj.getDay()]);
}
function weekPtPatternForEditing(){
  const pd=S.ptDays||{}; const mon=localYMD(weekMonday(new Date()));
  if(pd.weekOf===mon && pd.week) return Object.assign({}, pd.week);
  return Object.assign({}, pd.default||{});
}
function weekPtPatternIsConfirmed(){
  return (S.ptDays||{}).weekOf===localYMD(weekMonday(new Date()));
}
function confirmWeekPtPattern(pattern){
  if(!S.ptDays) S.ptDays={default:{},weekOf:null,week:{}};
  S.ptDays.weekOf=localYMD(weekMonday(new Date()));
  S.ptDays.week=Object.assign({}, pattern);
}
function saveDefaultPtPattern(pattern){
  if(!S.ptDays) S.ptDays={default:{},weekOf:null,week:{}};
  S.ptDays.default=Object.assign({}, pattern);
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
// Which assigned session types count as "hard" for spacing purposes — kept
// as its own set (not derived from SESSION_META) since s2's intensity is
// itself day-dependent (see runSlotFor()) and s5 is always easy.
const HARD_SESSIONS=new Set(["s1","s3","s4"]);
// De-stack: the app tells the user elsewhere (renderSkillBalance, the
// Week section's own copy in plan.html) "never two hard days back-to-back"
// — but the plain greedy fill above assigns GYM_PREFERRED (all 3 hard) to
// gym days in pure day order, so any run of 3+ consecutive gym days (or,
// separately, any week with very few gym days, which pushes leftover hard
// sessions onto trailing non-gym days in a block) produced straight runs of
// hard days with nothing checking that promise. Three explicitly-hard
// sessions (s1/s3/s4) and three non-hard ones (s2 x2, s5) is always
// separable into a fully alternating week — this repeatedly finds any
// remaining adjacent hard pair and swaps one side with the nearest non-hard
// day in either direction, until a pass makes no more changes. Bounded to
// a handful of passes; verified (see the v192 cleanup entry) to reach zero
// adjacent hard days across every gym-access pattern tested, including zero
// gym days at all. Doesn't account for s2's own hard/moderate split (which
// SESSION_META_S2/runSlotFor only resolve chronologically, after this runs)
// — a real, smaller residual gap, not silently claimed as solved.
// A declared PT day counts as "hard" for spacing purposes too (avoids a hard
// FM day landing right next to unit PT, same double-up plan.html already
// warns against) — but it's fixed by the user's real schedule, so it can only
// ever be the DONOR side that stays put; the FM-assigned neighbor is what moves.
function spaceOutHardDays(assign, days){
  const isHard=v=>HARD_SESSIONS.has(v)||v==="pt";
  let changed=true, guard=0;
  while(changed && guard++<12){
    changed=false;
    for(let i=0;i<days.length-1;i++){
      const next=days[i+1];
      if(!isHard(assign[days[i]]) || !isHard(assign[next])) continue;
      const movable = assign[next]!=="pt" ? next : (assign[days[i]]!=="pt" ? days[i] : null);
      if(movable==null) continue; // both sides are fixed PT days — nothing to space out
      for(let off=1; off<days.length; off++){
        const afterIdx=i+1+off, beforeIdx=i-off;
        let swapIdx=-1;
        if(afterIdx<days.length && !isHard(assign[days[afterIdx]])) swapIdx=afterIdx;
        else if(beforeIdx>=0 && !isHard(assign[days[beforeIdx]])) swapIdx=beforeIdx;
        if(swapIdx>=0){
          const swapDay=days[swapIdx];
          const tmp=assign[movable]; assign[movable]=assign[swapDay]; assign[swapDay]=tmp;
          changed=true;
          break;
        }
      }
    }
  }
  return assign;
}
// Assign session types to Mon-Sat for the week containing mondayDate, based on
// that week's per-day resolved gym access. Deterministic given the same
// gym-access pattern (no randomness), so it doesn't flicker across renders.
function assignWeekSessions(mondayDate){
  const days=[1,2,3,4,5,6];
  const dateFor=d=>{ const dt=new Date(mondayDate); dt.setDate(mondayDate.getDate()+(d-1)); return dt; };
  // Declared PT days are pre-occupied — "count it as that day's session and
  // don't double up" (plan.html's own copy) — so they're claimed before either
  // gym-access pool gets a chance to also assign a hard FM session there.
  const ptDays=days.filter(d=>ptDayForDate(dateFor(d)));
  const gymDays=days.filter(d=>!ptDays.includes(d) && gymAccessForDate(dateFor(d)));
  const nonGymDays=days.filter(d=>!ptDays.includes(d) && !gymDays.includes(d));
  const poolA=GYM_PREFERRED.slice(), poolB=NO_GYM_PREFERRED.slice();
  const assign={};
  ptDays.forEach(d=>{ assign[d]="pt"; });
  gymDays.forEach(d=>{ if(!assign[d] && poolA.length) assign[d]=poolA.shift(); });
  nonGymDays.forEach(d=>{ if(!assign[d] && poolB.length) assign[d]=poolB.shift(); });
  // leftovers: not enough gym days for all equipment-preferred sessions, or vice versa
  nonGymDays.forEach(d=>{ if(!assign[d] && poolA.length) assign[d]=poolA.shift(); });
  gymDays.forEach(d=>{ if(!assign[d] && poolB.length) assign[d]=poolB.shift(); });
  days.forEach(d=>{ if(!assign[d]) assign[d]=null; });
  const spaced=spaceOutHardDays(assign, days);
  return weaveOptionalSessions(spaced, days, mondayDate);
}
// Automatic pool/rock-climbing days (v218 coaching-improvements pass): a
// same-day RELABEL of an already-spaced week, never a day-move — so it can't
// disturb the hard-day-spacing guarantee spaceOutHardDays() just established
// on the original s1/s3/s4 keys. Fully backward-compatible/zero-effect for
// anyone whose active equipment profile doesn't carry the pool/climbwall
// tag. Spread across the existing 4-week cadence so it doesn't collide with
// the deload week (week%4===3, planForDay()): week 0 = swim variety, week 1
// = normal, week 2 = climb variety, week 3 = deload. The manual "feel like a
// change today?" chip (optionalSessionSuggestionHtml(), plan.js) and its
// S.optionalSessions opt-in are unrelated and untouched by this — still
// available for spontaneous variety on a week this doesn't fire.
function weaveOptionalSessions(assign, days, mondayDate){
  const tags=typeof activeEquipTags==="function"?activeEquipTags():[];
  const week=weeksSinceEpoch(mondayDate);
  if(tags.includes("pool") && week%4===0){
    const d=days.find(d=>assign[d]==="s2");
    if(d!=null) assign[d]="swim";
  }
  if(tags.includes("climbwall") && week%4===2){
    const d=days.find(d=>assign[d]==="s3");
    if(d!=null) assign[d]="climb";
  }
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
  ["knee push-up","A push-up with your knees on the floor instead of your toes — same hand position and chest-to-floor range of motion, just less bodyweight to press. The real regression if a full push-up isn't there yet: build reps here first, then move to toes."],
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
  ["run-walk build-up","The real on-ramp if continuous running isn't there yet: run 1 minute, walk 2 minutes, repeat for the session. As it gets easier over a few weeks, stretch the run minute and shrink the walk — that's the whole progression, no app tracking needed. Swap to this on any run day."],
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
  ["loaded backpack carry","Load a backpack or duffel bag with books or anything heavy you have, put it on (or carry it at your chest for a front-loaded carry), and walk a set distance standing tall and braced. The honest no-equipment version of the farmer's carry — same grip/core/loaded-locomotion demand the Sprint-Drag-Carry actually tests. Add weight or distance as it gets easy."],
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
  if(skey==="pt") return PT_DAY_META;
  let plan;
  if(skey==="s2"){
    const slot=runSlotFor(dateObj)||"first";
    plan=Object.assign({session:"s2"}, SESSION_META_S2[slot]);
  } else {
    plan=Object.assign({session:skey}, SESSION_META[skey]);
  }
  // Taper window: found by the v204-session FM audit as a real structural
  // gap — the app had no macro-level volume reduction before a declared AFT
  // test date at all, every week identical regardless of proximity. In the
  // final 6 days before a real test, downgrade hard sessions to moderate so
  // the user arrives fresh instead of fatigued from a full-intensity week
  // right up to test day. Doesn't touch easy/rest days (nothing to taper).
  // v216-session career-arc layer: generalized from AFT-only to the NEAREST
  // upcoming of the user's declared "big day" dates (AFT test or LDAC report
  // date, S.profile.ldacDate) — not AFT alone. A date that's unset or
  // already past is excluded from "nearest upcoming" via the same >=0 guard
  // the original single-date version used (test day itself, daysAway===0,
  // stays included — a hard session landing ON test/report day is exactly
  // what this taper exists to prevent).
  const upcomingEvents=[
    {key:"AFT", date:S.aftTestDate},
    {key:"LDAC", date:S.profile&&S.profile.ldacDate},
  ]
    .filter(e=>e.date)
    .map(e=>({key:e.key, daysAway:dayDiff(localYMD(dateObj),e.date)}))
    .filter(e=>e.daysAway>=0);
  const nearestEvent=upcomingEvents.length ? upcomingEvents.reduce((a,b)=>a.daysAway<=b.daysAway?a:b) : null;
  if(nearestEvent && nearestEvent.daysAway<=6 && plan.intensity==="hard"){
    plan=Object.assign({}, plan, {intensity:"moderate", taper:true, taperFor:nearestEvent.key, label:plan.label+` — taper week, ease off (${nearestEvent.key})`});
  }
  // Proactive deload cadence: absent an imminent test/LDAC date, the app's
  // only other intensity-reducing mechanism was reactive — detectOvertrainingTrend()
  // only fires AFTER 21 days of already-manifested struggle. Nothing scheduled
  // a lighter week in advance; computeTarget()'s default is to keep escalating
  // load indefinitely. The app's own Skills tree already teaches this as
  // correct practice (the phys_c_deload set: "mark a deload week on the
  // calendar every 4-6 weeks... before fatigue arrives") — the coach engine
  // just never followed it. Reuses the exact epoch-anchored week counter
  // pickRunIndex() already trusts (no new S field) and the same downgrade
  // shape the taper uses. A taper always takes precedence — test/report-date
  // proximity is more specific and more urgent than routine periodization.
  if(!plan.taper && plan.intensity==="hard" && weeksSinceEpoch(dateObj)%4===3){
    plan=Object.assign({}, plan, {intensity:"moderate", deload:true, label:plan.label+" — deload week, ease off"});
  }
  // Daily recovery-readiness downgrade (v218-coaching-improvements pass):
  // recoveryReadiness() (aft.js) had computed a real RHR/HRV/sleep-based
  // easy/caution/ready flag since v217 but nothing ever fed it back into the
  // actual prescribed session — it only ever printed as an advisory card the
  // user had to read and manually decide to act on. It reads TODAY's
  // imported health snapshot, so it has no way to know what a FUTURE day's
  // recovery will look like — this only fires when dateObj IS the real
  // current calendar day, never for a month-ahead lookup. Scoped to an
  // otherwise-untouched hard day (taper/deload already downgrade for their
  // own scheduled reasons) so this is purely closing the gap, not stacking.
  if(!plan.taper && !plan.deload && plan.intensity==="hard" && localYMD(dateObj)===localYMD(new Date()) && typeof recoveryReadiness==="function"){
    const rr=recoveryReadiness();
    if(rr && rr.level==="easy"){
      plan=Object.assign({}, plan, {intensity:"moderate", readinessEase:true, label:plan.label+" — recovery markers are down, easing off today"});
    }
  }
  return plan;
}
// For "pick one" sessions (the run), choose which variant to do today, with a
// sensible rotation. The week's earlier run slot = the easier/quality
// midweek-style run; the later slot = the harder/longer one — see runSlotFor
// for how "earlier/later" is now determined (gym-access can move which actual
// weekday each run lands on, so this no longer hardcodes Tue/Sat).
// Every 3rd week, the later slot becomes a timed 2-mile test so progress gets measured.
function pickRunIndex(dateObj){
  const slot=runSlotFor(dateObj)||"first";
  const week=weeksSinceEpoch(dateObj);
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
  // lastAft.date is a locale-formatted string (new Date().toLocaleDateString())
  // — dayDiff() parses it against localYMD()'s ISO format, which silently
  // produces Invalid Date (and therefore NaN, and therefore never>=45) for
  // any non-US locale where toLocaleDateString() isn't M/D/YYYY. Newer AFT
  // entries also carry a real ts (Date.now()); prefer that when present and
  // only fall back to the locale-string parse for older entries.
  const daysSinceTest=lastAft?(lastAft.ts!=null?Math.abs(Math.round((Date.now()-lastAft.ts)/864e5)):Math.abs(dayDiff(lastAft.date,localYMD()))):999;
  const testDate=S.aftTestDate;
  const daysToTest=testDate?dayDiff(localYMD(),testDate):null;
  const rec=typeof recoveryReadiness==="function"?recoveryReadiness():null;
  const notRecovered=rec&&rec.level==="easy"; // two-or-more negative recovery flags
  if(notRecovered) return "circuit"; // lower-demand default when markers say ease off
  // Taper window (found by the v204-session FM audit): the final week before
  // a real test is for arriving fresh, not rehearsing at full effort again —
  // a full mock AFT IS itself a hard, near-max-effort session. This used to
  // return "mock" for the entire 0-14 day window, meaning mock-AFT frequency
  // actually INCREASED right up to test day — the opposite of standard taper
  // practice. Cap at single-event practice (lighter) here instead.
  if(daysToTest!=null && daysToTest>=1 && daysToTest<=6) return "practice";
  // 7-14 days out: one last full-conditions rehearsal is genuinely useful —
  // real value in practicing pacing/nerves under test conditions — with
  // enough runway left to recover before the taper window above kicks in.
  if(daysToTest!=null && daysToTest>=7 && daysToTest<=14) return "mock";
  // haven't tested in a long time -> a full mock re-baselines
  if(daysSinceTest>=45) return "mock";
  // otherwise: sharpen the weakest single event
  if(lastAft) return "practice";
  // no AFT history at all yet -> a full mock establishes the baseline
  return "mock";
}
// Most recent logged weight for a named weighted exercise, straight from real
// Set/rep/weight prescription per intensity — how to actually run today's exercises, in order.
// Thin wrapper: computeTarget() (log.js) is the single source of truth for
// "what should I do" everywhere in the app now — this used to keep its own
// independent intensity-based guess and only append computeTarget()'s answer
// as an afterthought, which is exactly how the app ended up with competing
// prescriptions for the same exercise on the same page (the redesign this
// session set out to fix). All of the intensity/type prose that used to live
// here now lives inside computeTarget()'s tier-4 ("generic") fallback.
function prescriptionFor(intensity, ex, skey, rich){
  const tgt=computeTarget(ex, {skey, intensity, rich});
  return tgt ? tgt.target+(tgt.note?` (${tgt.note})`:"") : "as prescribed";
}
// Did the user log a workout on a given Date (local day)?
function workoutOnDay(dateObj){
  const ymd=localYMD(dateObj);
  return (S.workouts||[]).find(w=> (w.ts? localYMD(new Date(w.ts)) : null)===ymd || w.date===dateObj.toLocaleDateString());
}
function ptOnDay(dateObj){
  const ymd=localYMD(dateObj);
  return (S.ptLog||[]).find(p=> (p.ts? localYMD(new Date(p.ts)) : null)===ymd);
}
// Build a structured "today's plan": what session, the ordered exercises with prescriptions,
// and a read on yesterday (what was scheduled vs. what was logged).
function todaysPlan(){
  const now=new Date();
  const dayPlan=planForDay(now);
  const yest=new Date(now); yest.setDate(now.getDate()-1);
  const yPlan=planForDay(yest);
  const yLogged=workoutOnDay(yest);
  const tLogged = dayPlan.session==="pt" ? ptOnDay(now) : workoutOnDay(now);
  return {
    now, dayPlan,
    sessionKey: dayPlan.session,
    exercises: (dayPlan.session && dayPlan.session!=="pt") ? sessionExForProfile(dayPlan.session, gymAccessForDate(now)?activeEquipTags():[], now) : [],
    todayLogged: !!tLogged, todayLog: tLogged,
    yesterday: {
      plan: yPlan,
      wasRest: !yPlan.session,
      ptDay: yPlan.session==="pt",
      loggedPt: !!ptOnDay(yest),
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
  const curWeekMon=localYMD(weekMonday(now));
  for(let i=1;i<=7;i++){
    const d=new Date(now); d.setDate(now.getDate()-i);
    // gymAccessForDate()/ptDayForDate() only trust S.gymAccess.week/S.ptDays.week
    // when weekOf matches THAT date's Monday — a deliberate simplification for
    // displaying/confirming the CURRENT week (no full frozen per-date history
    // is kept). Reusing planForDay() here for a date outside the current week
    // reconstructs it from the DEFAULT pattern instead, which silently
    // disagrees with reality the moment the user has since confirmed a new
    // week (e.g. a declared PT day differing from default, from a week that's
    // now "in the past" as far as gymAccess/ptDays are concerned) — producing
    // a false "you missed this session" accusation for a day the user
    // actually handled correctly. Only the current week's reconstruction is
    // reliable, so cap the lookback there.
    if(localYMD(weekMonday(d))!==curWeekMon) continue;
    const plan=planForDay(d);
    if(!plan||!plan.session) continue;
    const dayStr=localYMD(d);
    if(S.missedTraining.some(m=>m.date===dayStr)) continue;
    const wasLogged = plan.session==="pt" ? !!ptOnDay(d) : !!workoutOnDay(d);
    if(!wasLogged) S.missedTraining.push({date:dayStr, session:plan.session});
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
  const names=[...new Set(missed.map(m=>m.session==="pt"?"ROTC PT":(SESSIONS[m.session]?SESSIONS[m.session].name.split("·").slice(-1)[0].trim():"a session")))];
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
    const wasLogged = plan.session==="pt" ? !!ptOnDay(d) : !!workoutOnDay(d);
    if(dayEnd<=now && wasLogged) done++;
  }
  return {done,sched};
}

// Generic reminder for the bodyweight/timed max-effort tests below — real
// warm-up matters for all of them, but a staged % ramp only makes sense for
// a loaded lift (see max_deadlift's warmupProtocol).
const BL_WARMUP_GENERIC="Warm up first — a few easy reps or light effort, not cold. Never test max effort on a cold body.";
// Monthly baseline = one max-effort set per key movement. These map to AFT
// events + the plan's core lifts so the updater can re-anchor each month.
// warmupProtocol/warmupNote: found by the v200-session FM audit as the
// single highest injury-risk gap in the subsystem — the deadlift 3RM test
// previously had no ramp, just "one all-out set." Framed as % of your OWN
// best guess (never a fabricated formula) — matches computeTarget()'s
// existing refusal to invent percentage-of-max math elsewhere in FM.
const BASELINE_TEST = [
  {key:"max_pushups", name:"Max hand-release push-ups (2 min)", type:"reps", aft:"hrp", warmupNote:BL_WARMUP_GENERIC},
  {key:"max_plank",   name:"Max plank hold", type:"time", aft:"plank", warmupNote:BL_WARMUP_GENERIC},
  {key:"max_deadlift",name:"3-rep max deadlift (lbs)", type:"reps", w:true, aft:"dl",
   warmupProtocol:[
     "Empty bar or very light — 5–8 reps to groove the pattern",
     "~50% of what you think you'll hit for 3 — 5 reps",
     "~70% — 3 reps",
     "~85% — 1 rep",
     "Now attempt your real 3-rep max",
   ],
   warmupStop:"Stop the moment your form breaks down — a slower clean pull beats a fast one with a rounded back. If you have someone who can check your form, use them."},
  {key:"max_pullups", name:"Max pull-ups (one set)", type:"reps", warmupNote:BL_WARMUP_GENERIC},
  {key:"max_squat",   name:"Max bodyweight squats (2 min)", type:"reps", warmupNote:BL_WARMUP_GENERIC},
  {key:"run_2mi",     name:"Timed 2-mile run", type:"dist", aft:"run", lowerBetter:true, warmupNote:BL_WARMUP_GENERIC},
  {key:"sdc_sim",     name:"Sprint-Drag-Carry sim (time)", type:"time", aft:"sdc", lowerBetter:true, warmupNote:BL_WARMUP_GENERIC},
];
