// Weekly volume recommendation from AFT score gap + countdown to test date
function renderPlanRec(){
  const el=document.getElementById("planRec"); if(!el) return;
  const lastAft=(S.aft||[])[S.aft.length-1];
  const testDate=S.aftTestDate;
  if(!lastAft||!testDate){el.innerHTML="";return;}
  const weeksLeft=Math.max(1,Math.round((new Date(testDate+"T12:00:00")-Date.now())/(7*864e5)));
  const gap=380-lastAft.total;
  const rec=gap>60?"5 sessions/week":gap>30?"4 sessions/week":gap>10?"3 sessions/week":"2–3 sessions/week (maintenance)";
  el.innerHTML=`<div class="plan-rec">🎯 ${weeksLeft} week${weeksLeft!==1?'s':''} to AFT · gap: ${gap>0?'+'+gap+' pts needed':'on target'} · Recommendation: <b>${rec}</b></div>`;
}

// Live "your priorities" line — was previously a hardcoded prose block with
// frozen AFT numbers that silently went stale the moment real scores changed.
// Reuses fmFocusLine() (aft.js) so this stays consistent with the weakest-event
// line shown on Today, instead of computing it a second, independent way.
function renderPlanPriorities(){
  const el=document.getElementById("planPriorities"); if(!el) return;
  const focus=typeof fmFocusLine==="function"?fmFocusLine():null;
  if(!focus){ el.innerHTML=""; return; }
  const last=(S.aft||[])[S.aft.length-1];
  const evts=[{k:"dl",label:"deadlift"},{k:"hrp",label:"push-ups"},{k:"sdc",label:"Sprint-Drag-Carry"},{k:"plank",label:"plank"},{k:"run",label:"2-mile run"}];
  const solid=evts.filter(e=>last.scores[e.k]!=null&&last.scores[e.k]>=70).map(e=>e.label);
  el.innerHTML=`<div class="phase">🎯 <b>Your priorities (from your AFT history):</b> ${esc(focus)}${solid.length?` The rest (${esc(solid.join(", "))}) are solid — maintain them.`:''}</div>`;
}
// Beginner starting prescriptions — sets/reps/weight/rest for each session
// Bodyweight (bw) and gym variants match SESSIONS s1-s4
const BEGINNER_RX = {
  s1: {
    bw: [
      {name:"Reverse lunge",          sets:3, reps:"8/leg",  rest:"90s"},
      {name:"Single-leg glute bridge", sets:3, reps:"10/leg", rest:"60s"},
      {name:"Hand-release push-ups",  sets:3, reps:"6–8",    rest:"90s"},
      {name:"Knee push-ups",          sets:3, reps:"6–8",    rest:"90s"},
      {name:"Pike push-ups",          sets:2, reps:"6–8",    rest:"90s"},
      {name:"Hollow-body hold",       sets:3, reps:"20s",    rest:"45s"},
    ],
    gym: [
      {name:"Trap-bar deadlift",  sets:3, reps:"5",  weight:"65 lbs",        rest:"3 min"},
      {name:"Goblet squat",       sets:3, reps:"10", weight:"15 lbs",        rest:"90s"},
      {name:"DB bench press",     sets:3, reps:"10", weight:"15 lbs/hand",   rest:"90s"},
      {name:"Overhead press",     sets:3, reps:"10", weight:"10 lbs/hand",   rest:"90s"},
    ],
  },
  s2: {
    bw: [
      {name:"Intervals",     sets:"4×", reps:"400m hard",                          rest:"90s walk"},
      {name:"Tempo run",     sets:1,    reps:"15 min at only-a-few-words pace",     rest:"—"},
      {name:"Long easy run", sets:1,    reps:"25 min conversational",               rest:"—"},
      // Named to avoid cgFindRxRow() word-overlap collisions with the
      // "Intervals" row above — "Walk/run intervals" would score a tied 1.0
      // against both rows (every one of "Intervals"'s words also appears in
      // that name), and ties resolve to whichever row comes first in the
      // array, silently matching the wrong (harder) row.
      {name:"Run-walk build-up (beginner)", sets:1, reps:"20 min: 1 min run / 2 min walk, repeat", rest:"—"},
    ],
    gym: [
      {name:"Treadmill intervals", sets:"4×", reps:"400m, 1% incline", rest:"90s"},
      {name:"Rower intervals",     sets:"4×", reps:"250m all-out",     rest:"90s"},
    ],
  },
  s3: {
    bw: [
      {name:"Doorway/towel rows",  sets:3, reps:"8–10",        rest:"90s"},
      {name:"Decline push-ups",   sets:3, reps:"6–8",          rest:"90s"},
      {name:"Knee push-ups",      sets:3, reps:"6–8",          rest:"90s"},
      {name:"Plank",              sets:3, reps:"20–30s",        rest:"45s"},
      {name:"Side plank",         sets:2, reps:"15–20s/side",  rest:"45s"},
      {name:"Superman",           sets:3, reps:"10",            rest:"45s"},
      {name:"Grip squeeze",       sets:3, reps:"30s",           rest:"30s"},
    ],
    gym: [
      {name:"Lat pulldown",     sets:3, reps:"10", weight:"40 lbs",        rest:"90s"},
      {name:"Seated cable row", sets:3, reps:"10", weight:"35 lbs",        rest:"90s"},
      {name:"Incline DB press", sets:3, reps:"10", weight:"15 lbs/hand",   rest:"90s"},
      {name:"Farmer's carry",   sets:3, reps:"40 ft", weight:"25 lbs/hand", rest:"90s"},
    ],
  },
  s4: {
    bw: [
      {name:"Shuttle sprints",       sets:"3 rounds", reps:"4 lengths ~25m",     rest:"2 min between rounds"},
      {name:"Hand-release push-ups", sets:"3 rounds", reps:"10 (first day: 5)",  rest:""},
      {name:"Knee push-ups",         sets:"3 rounds", reps:"8 (first day: 5)",   rest:""},
      {name:"Squat jumps",           sets:"3 rounds", reps:"8",                   rest:""},
      {name:"Plank",                 sets:"3 rounds", reps:"30s",                 rest:""},
      {name:"200m run / jog",        sets:"3 rounds", reps:"1 lap",               rest:""},
    ],
    gym: [
      {name:"Sled push + return", sets:"3 rounds", reps:"25m + 25m",  weight:"no extra load",    rest:"2 min"},
      {name:"Loaded carry",       sets:"3 rounds", reps:"40 ft",      weight:"25 lbs/hand",       rest:""},
      {name:"Box jumps",          sets:"3 rounds", reps:"6–8",        weight:"12\" box",           rest:""},
      {name:"Rower 200m sprint",  sets:"3 rounds", reps:"all-out",                                rest:""},
    ],
  },
};

// Compact session card for the Dawn tab — exercise names only (no descriptions).
// Returns an HTML string; Dawn embeds it directly in the guided flow.
function dawnSessionHtml(){
  if(typeof todaysPlan!=="function") return "";
  const p=todaysPlan();
  const dayName=p.now.toLocaleDateString(undefined,{weekday:"long"});
  if(!p.sessionKey){
    const dp=p.dayPlan;
    if(dp.intensity==="rest"){
      return `<div class="dawn-sess rest-day">
        <div class="ds-top"><span class="ds-name">💤 ${esc(dayName)} · Rest day</span></div>
        <div class="ds-note">${esc(dp.note||dp.label||"")}</div>
      </div>`;
    }
    return "";
  }
  const sess=SESSIONS[p.sessionKey];
  const intensity=p.dayPlan.intensity;
  const intLabel={hard:"🔴 Hard",moderate:"🟠 Moderate",easy:"🟢 Easy"}[intensity]||"";
  const todayGym=typeof gymAccessForDate==="function"?gymAccessForDate(p.now):false;
  const modeTag=todayGym?`🏋️ ${esc(S.activeEquipProfile||"Gym")}`:(weatherBad()?`${WEATHER[(S.weather)||"clear"].icon} Indoor`:"🤸 Bodyweight");
  // AFT-circuit days: an adaptive coach call (full mock / single-event practice /
  // the normal circuit) instead of always just showing the circuit — see FM-1.
  if(p.sessionKey==="s4"&&typeof pickAftMode==="function"){
    const mode=pickAftMode();
    if(mode==="mock"){
      return `<div class="dawn-sess">
        <div class="ds-top"><span class="ds-name">${esc(dayName)} · AFT Circuit</span><span class="ds-badges">${intLabel} <span class="ds-mode">${modeTag}</span></span></div>
        <div class="ds-note">Today's call: a full guided mock AFT — all 5 events, timed, feeding straight into your real AFT history.</div>
        <div class="ds-actions"><button class="td-go ds-log-btn" data-mockaft="mock">🏁 Start guided mock AFT →</button></div>
      </div>`;
    }
    if(mode==="practice"){
      const weakest=typeof fmFocusLine==="function"?fmFocusLine():null;
      return `<div class="dawn-sess">
        <div class="ds-top"><span class="ds-name">${esc(dayName)} · AFT Circuit</span><span class="ds-badges">${intLabel} <span class="ds-mode">${modeTag}</span></span></div>
        <div class="ds-note">Today's call: single-event practice, not a full mock. ${weakest?esc(weakest):""}</div>
        <div class="ds-actions"><button class="td-go ds-log-btn" data-mockaft="practice">🎯 Start single-event practice →</button><button class="td-go ds-plan-btn" data-gototab="plan">Full plan →</button></div>
      </div>`;
    }
    // "circuit" mode falls through to the normal exercise-list rendering below.
  }
  const workOnly=p.exercises.filter(e=>!e._phase||e._phase==="work"||e._phase==="balance");
  const warmupCount=p.exercises.filter(e=>e._phase==="warmup").length;
  const cooldownCount=p.exercises.filter(e=>e._phase==="cooldown"||e._phase==="flex").length;
  // Same computeTarget() call Coach Today/Session-N cards make — the compact
  // preview shouldn't show a different (or absent) number than the full page.
  const exList=workOnly.slice(0,sess.pickOne?4:7).map(e=>{
    const tgt=typeof computeTarget==="function"?computeTarget(e,{skey:p.sessionKey,intensity,rich:todayGym}):null;
    return `<div class="ds-ex"><span class="ds-ex-n">${esc(e.n)}${e._swapped?' <span class="ds-swap">· indoor</span>':''}</span>${tgt?`<span class="ds-ex-tgt">${esc(tgt.target)}</span>`:''}</div>`;
  }).join("");
  const more=workOnly.length>(sess.pickOne?4:7)?`<div class="ds-ex ds-more">+${workOnly.length-(sess.pickOne?4:7)} more</div>`:"";
  const warmCoolNote=(warmupCount||cooldownCount)?`<div class="ds-warmcool">${warmupCount?`🔥 ${warmupCount}-move warm-up`:''}${warmupCount&&cooldownCount?' + ':''}${cooldownCount?`🧊 ${cooldownCount}-stretch cool-down`:''} included</div>`:"";
  const action=p.todayLogged
    ? `<div class="ds-done">✓ Logged — well done.</div>`
    : `<button class="td-go ds-log-btn" data-gototab="log" data-logsess="${p.sessionKey}">Log this session →</button>`;
  return `<div class="dawn-sess">
    <div class="ds-top">
      <span class="ds-name">${esc(dayName)} · ${esc(sess.name.split("·").slice(-1)[0].trim())}</span>
      <span class="ds-badges">${intLabel} <span class="ds-mode">${modeTag}</span></span>
    </div>
    <div class="ds-exlist">${exList}${more}</div>
    ${warmCoolNote}
    <div class="ds-actions">${action}<button class="td-go ds-plan-btn" data-gototab="plan">Full plan →</button></div>
  </div>`;
}

function renderSkillBalance(){
  const el=document.getElementById("skillBalance"); if(!el) return;
  if(!S.lifeSkills||!S.lifeSkills.length){ el.innerHTML=""; return; }
  // every physical leaf skill (sub-skills + standalone physical skills), excluding group containers
  const leaves=S.lifeSkills.filter(s=>s.cat==="physical" && !s.group && s.levels && s.levels.length);
  if(leaves.length<2){ el.innerHTML=""; return; }
  const lvl=s=>skEffectiveLevel(s);
  const avg=leaves.reduce((a,s)=>a+lvl(s),0)/leaves.length;
  const withLvl=leaves.map(s=>({name:s.name, parent:s.parent, l:lvl(s), max:s.levels.length})).sort((a,b)=>a.l-b.l);
  // laggards: clearly below your average (and not already maxed); strengths: at/above avg
  const lag=withLvl.filter(s=>s.l < avg-0.5 || s.l===0);
  const strong=withLvl.filter(s=>s.l>=avg && s.l>0).slice(-3).reverse();
  // catProgressFraction (not catRolledLevel) — catRolledLevel averages over
  // every top-level skill in the Path, which post-Commons-layer (~1,500+
  // skills) permanently rounds to ~0 regardless of real progress.
  const overall=typeof catProgressFraction==="function"?Math.round(catProgressFraction("physical")*100):0;
  let lines=`<div class="recovery-line">Overall physical development: <b>${overall}%</b> of your full physical pyramid's level-depth reached so far. The way up is to raise your lowest areas while holding your best.</div>`;
  if(lag.length){
    const names=lag.slice(0,5).map(s=>`${esc(s.name)} (Lv ${fmtLvl(s.l)})`);
    lines+=`<div class="recovery-line">🎯 <b>Prioritize these</b> — they're dragging your whole-body level down: ${names.join(", ")}. Put extra volume here.</div>`;
  } else {
    lines+=`<div class="recovery-line">✅ Your physical skills are well-balanced — no single area is lagging. Push the whole set up together.</div>`;
  }
  if(strong.length){
    lines+=`<div class="recovery-line">💪 <b>Keep pushing your strengths</b> too: ${strong.map(s=>esc(s.name)+" (Lv "+fmtLvl(s.l)+")").join(", ")} — maintain and keep climbing, don't coast.</div>`;
  }
  // make sure mobility/swimming aren't forgotten on the road to "elite"
  const neglected=leaves.filter(s=>["Flexibility & mobility","Swimming"].includes(s.name) && lvl(s) < Math.max(1, avg-1));
  if(neglected.length){
    lines+=`<div class="recovery-line">🧘 Don't skip <b>${neglected.map(s=>esc(s.name)).join(" & ")}</b> — true all-around fitness needs these, not just the AFT lifts.</div>`;
  }
  lines+=`<div class="recovery-line" style="color:var(--ink-faint);font-style:italic">Train laggards first in each session, keep one maintenance set for strengths, and log it so the skills update.</div>`;
  // profile-driven context: age pacing, height/stride, weight trend
  const p=S.profile||{};
  const age=ageFromDob(p.birthdate);
  let ctx="";
  if(age!=null){
    const rec = age<25?"You recover fast at your age — you can train hard most days, but still alternate heavy/easy."
      : age<35?"Recovery is solid — keep one full rest day and avoid two heavy days back-to-back."
      : "Build in extra recovery — leave 48h between heavy sessions for the same area and prioritize sleep/mobility.";
    ctx+=`<div class="recovery-line">⏱️ <b>Pacing (age ${age}):</b> ${rec}</div>`;
  }
  if(p.heightIn>0){
    const stride = p.heightIn>=72?"Your height gives you a long stride for running and reach for the deadlift bar — use a slightly wider stance and own your turnover on the run."
      : p.heightIn<=66?"Your shorter levers are an advantage in the deadlift and push-ups — leverage that strength; focus run gains on cadence."
      : "Average levers — balanced for all events; technique is your biggest lever.";
    ctx+=`<div class="recovery-line">📏 <b>Build:</b> ${stride}</div>`;
  }
  // weight trend from logged weight history
  if(S.weightLog && S.weightLog.length>=2){
    const sorted=S.weightLog.slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
    const first=sorted[0], lastw=sorted[sorted.length-1];
    const d=(lastw.lb-first.lb);
    if(Math.abs(d)>=1) ctx+=`<div class="recovery-line">⚖️ <b>Weight trend:</b> ${d>0?"+":""}${d.toFixed(1)} lb since ${new Date(first.date).toLocaleDateString()} — ${d>0?"if this is muscle, your strength ratios will follow; watch the run":"lighter bodyweight raises your strength-to-weight ratios"}.</div>`;
  }
  if(ctx) lines+=ctx;
  // No inner heading here — the collapsed <details> summary in plan.html
  // ("📊 Whole-body balance — beyond the AFT") already labels this section;
  // a second heading inside would just repeat it. This deliberately sits
  // secondary to #planPriorities (the AFT-weakest-event line) in the Coach
  // Hub: that one is tied to the actual graded test, this one is a broader,
  // whole-body-skill-level lens — two different questions, not competing
  // answers to the same one.
  el.innerHTML=`<div class="forge-recovery-card balance">${lines}</div>`;
}

function renderRecoveryAdvisory(){
  const el=document.getElementById("recoveryAdvisory"); if(!el) return;
  const load=recoveryLoad();
  const fatigued=Object.keys(load).filter(k=>load[k]>=2.5);   // meaningfully worked recently
  const sore=Object.keys(load).filter(k=>load[k]>=4.5);        // hit hard / repeatedly
  if(!fatigued.length){ el.innerHTML=""; return; }
  // which FM sessions to ease off (those whose areas overlap fatigued areas)
  const easeSessions=Object.keys(SESSION_AREAS).filter(s=>s!=="other" && SESSION_AREAS[s].some(a=>fatigued.includes(a)));
  // which sessions are still fresh (no overlap with fatigued)
  const freshSessions=Object.keys(SESSION_AREAS).filter(s=>s!=="other" && !SESSION_AREAS[s].some(a=>fatigued.includes(a)));
  const sName=s=>SESSIONS[s].name.split(" · ")[0]+" ("+SESSIONS[s].name.split(" · ")[1]+")";
  let lines="";
  lines+=`<div class="recovery-line">PT recently worked: <b>${fatigued.map(k=>AREA_LABEL[k]).join(", ")}</b>. Give ${fatigued.length>1?'those':'that'} a chance to recover.</div>`;
  if(sore.length) lines+=`<div class="recovery-line">⚠️ <b>${sore.map(k=>AREA_LABEL[k]).join(", ")}</b> got hit hard — avoid loading ${sore.length>1?'them':'it'} heavily for a day or two.</div>`;
  if(freshSessions.length) lines+=`<div class="recovery-line">✅ Good to train now: <b>${freshSessions.map(sName).join(", ")}</b> — ${freshSessions.length>1?'these hit':'this hits'} muscles PT left fresh.</div>`;
  if(easeSessions.length) lines+=`<div class="recovery-line">🟠 Ease off / reduce volume: <b>${easeSessions.map(sName).join(", ")}</b> — overlaps what PT already worked.</div>`;
  el.innerHTML=`<div class="forge-recovery-card"><h3>♻️ Recovery-aware (from your PT log)</h3>${lines}</div>`;
}

// "skey|slotIdx" of the currently open swap panel on the coach card, or null —
// module-scope UI state, same pattern as _gymEditDraft/_equipEditProfile above.
let _exSwapOpen=null;
function toggleExSwap(key){ _exSwapOpen=(_exSwapOpen===key)?null:key; if(typeof renderCoachToday==="function") renderCoachToday(); }
// The suggestion-plus-override affordance for one exercise: a "🔀 swap" toggle
// (only shown when the slot has more than one equipment-eligible variant) and,
// when open, the full eligible pool as pickable buttons — the suggested one
// starred. This is the "give a suggestion, but let me choose if I disagree" UI.
function exSwapHtml(sessKey, e){
  if(!e._pool || e._pool.length<2) return "";
  const swapKey=sessKey+"|"+e._slotIdx;
  const open=_exSwapOpen===swapKey;
  const btn=`<button class="ex-swap-btn" data-exswap="${swapKey}">🔀 ${open?'hide':'swap'}</button>`;
  const panel=open?`<div class="ex-alt-panel">${e._pool.map((alt,ai)=>`<button class="ex-alt-btn${ai===e._suggestedIdx?' suggested':''}${alt.n===e.n?' current':''}" data-expick="${sessKey}|${e._slotIdx}|${ai}">${ai===e._suggestedIdx?'⭐ ':''}${esc(alt.n)}</button>`).join("")}</div>`:"";
  return btn+panel;
}
// One exercise <li>, shared by the warm-up/cool-down blocks and the main
// working-set list so they render identically.
function exLiHtml(e, intensity, sessKey, rich){
  const rx=prescriptionFor(intensity, e, sessKey, rich);
  const desc=exHowto(e.n);
  return `<li><div class="coach-ex-n"><b>${esc(e.n)}</b>${e.w?' <span class="sess-eq">· equipment</span>':''}${e._swapped?' <span class="sess-swap">· indoors for weather</span>':''}${exSwapHtml(sessKey,e)}</div>${desc?`<div class="coach-ex-how">${esc(desc)}</div>`:''}<div class="coach-ex-rx">${esc(rx)}</div></li>`;
}
// A labeled Warm-up/Cool-down/Flexibility group — real dynamic-before,
// static-after stretches composed from STRETCH_LIBRARY (see training.js),
// not the working set. Renders nothing if this session has none (e.g. `other`).
function warmCoolBlockHtml(items, sessKey, intensity, label, cls, rich){
  if(!items || !items.length) return "";
  return `<div class="coach-phase-h ${cls}">${esc(label)}</div><ol class="coach-list coach-list-sm">${items.map(e=>exLiHtml(e,intensity,sessKey,rich)).join("")}</ol>`;
}
// Optional-session suggestion (FM-2): shown when the user has opted in and
// today's active equipment profile actually unlocks it (pool/climbwall tag) —
// the coach never auto-schedules these, just surfaces them as a real option.
function optionalSessionSuggestionHtml(){
  const tags=typeof activeEquipTags==="function"?activeEquipTags():[];
  const opts=typeof optionalSessionSuggestions==="function"?optionalSessionSuggestions(tags):[];
  if(!opts.length) return "";
  const chips=opts.map(k=>`<button class="opt-sess-chip" data-gototab="log" data-logsess="${k}">${SESSIONS[k].name.replace(" (optional)","")}</button>`).join("");
  return `<div class="coach-opt-suggest">🌊 Feel like a change today? Your active profile unlocks: ${chips}</div>`;
}
// The coached "today" block: yesterday's read + today's session, fully explained, in order.
function renderCoachToday(){
  const el=document.getElementById("coachToday"); if(!el) return;
  // auto-track any sessions missed in the past week (safe to call every render)
  if(typeof trackMissedSessions==="function") trackMissedSessions();
  const p=todaysPlan();
  const dayName=p.now.toLocaleDateString(undefined,{weekday:"long"});
  // ---- Yesterday read ----
  const y=p.yesterday; let yHtml="";
  if(y.wasRest){
    yHtml=`<div class="coach-yest rest">Yesterday was a scheduled <b>rest / recovery</b> day — nothing to make up. A tree grows in the dormant season too; rest is when the work takes root.</div>`;
  } else if(y.onPlan){
    yHtml=`<div class="coach-yest ok">✓ Yesterday you did <b>${esc(SESSIONS[y.plan.session].name.split(" · ")[0])}</b> as planned. On track.</div>`;
  } else if(y.logged){
    yHtml=`<div class="coach-yest ok">✓ Yesterday you logged <b>${esc(SESSIONS[y.log.session]?SESSIONS[y.log.session].name.split(" · ")[0]:"a workout")}</b>. Planned was ${esc(SESSIONS[y.plan.session].name.split(" · ")[0])} — close enough, keep rolling.</div>`;
  } else {
    yHtml=`<div class="coach-yest miss">⚠️ Yesterday was <b>${esc(SESSIONS[y.plan.session].name.split(" · ")[0])}</b> and isn't logged. Don't double up to make it up — just do today's session below. If you want to swap, do yesterday's instead of today and shift the week back one.</div>`;
  }
  // ---- Today ----
  let tHtml;
  if(!p.sessionKey){
    tHtml=`<div class="coach-body"><div class="coach-day-h">${esc(dayName)} · Active recovery</div>
      <p class="coach-intro">${esc(p.dayPlan.note||"")}</p>
      <ol class="coach-list">${sessionEx("s5").slice(0,9).map(e=>{const d=exHowto(e.n);return `<li><div class="coach-ex-n"><b>${esc(e.n)}</b></div>${d?`<div class="coach-ex-how">${esc(d)}</div>`:''}</li>`;}).join("")}</ol>
      <p class="coach-tip">No hard training today — a walk plus the stretch block keeps you loose without adding fatigue.</p></div>`;
  } else {
    const sess=SESSIONS[p.sessionKey];
    const intensity=p.dayPlan.intensity;
    const intLabel={hard:"🔴 Hard day",moderate:"🟠 Moderate",easy:"🟢 Easy / recovery",rest:"💤 Rest"}[intensity]||"";
    const todayGym=typeof gymAccessForDate==="function"?gymAccessForDate(p.now):false;
    const modeTag = todayGym ? `🏋️ ${esc(S.activeEquipProfile||"Gym")} version` : (weatherBad()? `${WEATHER[(S.weather)||"clear"].icon} indoor (weather)` : "🤸 No-equipment");
    const aftMode=(p.sessionKey==="s4"&&typeof pickAftMode==="function")?pickAftMode():null;
    if(aftMode==="mock"||aftMode==="practice"){
      // Adaptive coach call for the AFT-circuit slot (FM-1/§2b) — a full guided
      // mock or single-event practice instead of the normal fixed circuit.
      const weakest=typeof fmFocusLine==="function"?fmFocusLine():null;
      // Real AFT events (a standardized deadlift 3RM + the actual SDC lane)
      // genuinely require specific gear — they can't be honestly bodyweight-
      // substituted the way a normal training exercise slot can, since the
      // whole point of a mock AFT is rehearsing the real test. This doesn't
      // block the flow (a partial mock with real events you DO have gear
      // for is still worth doing) — it just tells you up front instead of
      // finding out mid-event, closing a real gap the FM-1 design flagged.
      const activeTags=typeof activeEquipTags==="function"?activeEquipTags():[];
      const missingGear=["barbell","aftkit"].filter(t=>!activeTags.includes(t));
      const gearNote=missingGear.length?`<p class="coach-tip">⚠️ Your active equipment profile (<b>${esc(S.activeEquipProfile||"")}</b>) is missing ${missingGear.map(t=>esc((EQUIP_TAGS[t]||{}).label||t)).join(" and ")} — the deadlift and/or Sprint-Drag-Carry events won't be realistic without it. Switch profiles first if you have access elsewhere today, or expect those specific events to be a rough estimate.</p>`:"";
      tHtml=`<div class="coach-body">
        <div class="coach-day-h">${esc(dayName)} · AFT Circuit <span class="coach-int">${intLabel}</span></div>
        <p class="coach-intro">${aftMode==="mock"
          ? "Today's call: a full guided mock AFT — all 5 events, timed, feeding straight into your real AFT history."
          : "Today's call: single-event practice, not a full mock." + (weakest?" "+esc(weakest):"")}</p>
        ${gearNote}
        <button class="btn-add" data-mockaft="${aftMode}">${aftMode==="mock"?"🏁 Start guided mock AFT":"🎯 Start single-event practice"} →</button>
        <p class="coach-tip">The coach picks between a full mock, single-event practice, and the normal circuit based on how close your test date is, how long since your last AFT, and your recent recovery markers — not a fixed schedule.</p>
      </div>`;
    } else if(sess.pickOne){
      // ONE exercise per session (e.g. the run): pick today's variant, explain it fully.
      const idx=pickRunIndex(p.now);
      const workEx=p.exercises.filter(x=>x._phase==="work");
      const e=workEx.find(x=>x._slotIdx===idx) || workEx[0] || p.exercises[0];
      const desc=exHowto(e.n);
      const rx=prescriptionFor(intensity, e, p.sessionKey, todayGym);
      const otherNames=workEx.filter(x=>x._slotIdx!==idx).map(x=>x.n.replace(/\s*\(.*$/,"").trim());
      const warmHtml=warmCoolBlockHtml(p.exercises.filter(x=>x._phase==="warmup"), p.sessionKey, intensity, "🔥 Warm-up (dynamic — keep moving)", "warm", todayGym);
      const coolHtml=warmCoolBlockHtml(p.exercises.filter(x=>x._phase==="cooldown"), p.sessionKey, intensity, "🧊 Cool-down (hold each stretch)", "cool", todayGym);
      tHtml=`<div class="coach-body">
        <div class="coach-day-h">${esc(dayName)} · ${esc(sess.name.split(" · ")[0])} <span class="coach-int">${intLabel}</span></div>
        <p class="coach-intro">${esc(p.dayPlan.label)}. <span class="coach-mode">${modeTag}</span> — this is a <b>pick-one</b> session: you do <b>one</b> run today, not all of them. Today's pick:</p>
        ${warmHtml}
        <div class="coach-phase-h work">🏃 Today's run</div>
        <ol class="coach-list" style="list-style:none;padding-left:0"><li>
          <div class="coach-ex-n"><b>👉 ${esc(e.n)}</b>${e._swapped?' <span class="sess-swap">· indoors for weather</span>':''}${exSwapHtml(p.sessionKey,e)}</div>
          ${desc?`<div class="coach-ex-how">${esc(desc)}</div>`:''}
          <div class="coach-ex-rx">${esc(rx)}</div>
        </li></ol>
        <p class="coach-tip">Why this one: the plan rotates your runs so you train different systems — a faster quality run midweek (intervals/tempo) and a longer or test run on the weekend. You don't need to choose; it rotates for you. Want a different one today? Any of these also counts: ${esc(otherNames.join(", "))}.</p>
        ${coolHtml}
        ${p.todayLogged?`<div class="coach-done">✓ Logged today — nice work.</div>`:`<button class="btn-add" id="coachLogBtn" data-sess="${p.sessionKey}">Log this run →</button>`}
      </div>`;
    } else {
      // ALL exercises, in order (strength / circuit days) — or, for Session 5,
      // warm-up + the full flexibility sweep + the balance block (flexFromLibrary).
      const isFlexSession=!!sess.flexFromLibrary;
      const warmItems=p.exercises.filter(x=>x._phase==="warmup");
      const workItems=p.exercises.filter(x=>x._phase==="work"||x._phase==="flex"||x._phase==="balance"||!x._phase);
      const coolItems=p.exercises.filter(x=>x._phase==="cooldown");
      const items=workItems.map((e,i)=>exLiHtml(e,intensity,p.sessionKey,todayGym)).join("");
      const warmHtml=warmCoolBlockHtml(warmItems, p.sessionKey, intensity, "🔥 Warm-up (dynamic — keep moving)", "warm", todayGym);
      const coolHtml=warmCoolBlockHtml(coolItems, p.sessionKey, intensity, "🧊 Cool-down (hold each stretch)", "cool", todayGym);
      tHtml=`<div class="coach-body">
        <div class="coach-day-h">${esc(dayName)} · ${esc(sess.name.split(" · ")[0])} <span class="coach-int">${intLabel}</span></div>
        <p class="coach-intro">${esc(p.dayPlan.label)}. <span class="coach-mode">${modeTag}</span>${isFlexSession?' — a real, dedicated flexibility sweep plus balance work, not a throwaway day.':` — do all of these, in order${intensity==="hard"?", resting 60–90s between sets":""}. ${intensity==="hard"?"Leave 1–2 reps in the tank.":intensity==="moderate"?"Keep the effort conversational.":"Move easy — this is for recovery."}`}</p>
        ${warmHtml}
        <div class="coach-phase-h work">${isFlexSession?"🤸 Flexibility + balance":"💪 Today's session"}</div>
        <ol class="coach-list">${items}</ol>
        ${coolHtml}
        ${p.todayLogged?`<div class="coach-done">✓ Logged today — nice work.</div>`:`<button class="btn-add" id="coachLogBtn" data-sess="${p.sessionKey}">Log this session →</button>`}
        ${(!p.todayLogged && typeof cgAvailableToday==="function" && cgAvailableToday())?`<button class="hb-starter-btn" id="coachCardGameBtn" style="margin-top:8px">🎴 Play it as a card-game workout instead</button>`:''}
        <p class="coach-tip">Tap any exercise's name in the session list below for the full how-to.</p>
      </div>`;
    }
  }
  el.innerHTML=`<div class="coach-card"><div class="coach-h">📋 Today's orders</div>${yHtml}${tHtml}${optionalSessionSuggestionHtml()}</div>`;
  const lb=document.getElementById("coachLogBtn");
  if(lb) lb.onclick=()=>{
    // jump to Log tab, preload today's session
    const nav=document.querySelector('#sideNav button[data-tab="log"]'); if(nav) nav.click();
    setTimeout(()=>{ const sel=document.getElementById("lgSession"); if(sel){ sel.value=lb.dataset.sess; if(sel.onchange) sel.onchange(); } }, 60);
  };
  const cgb=document.getElementById("coachCardGameBtn");
  if(cgb) cgb.onclick=()=>{ if(typeof cgOpen==="function") cgOpen(); };
}

// ===== Gym-access-aware weekly planning (FM-1) =====
// In-progress edits to this week's day-toggle pattern, before "Confirm"/"Save
// as default" is clicked — module-scope draft, not persisted to S until acted
// on, matching the module-scope draft pattern used elsewhere in this codebase
// (e.g. skills.js's level-input draft). Resets to the confirmed/default
// pattern on a fresh page load.
let _gymEditDraft=null;
function renderGymAccessUI(){
  const el=document.getElementById("gymAccessArea"); if(!el) return;
  if(!_gymEditDraft) _gymEditDraft=typeof weekGymPatternForEditing==="function"?weekGymPatternForEditing():{};
  const confirmed=typeof weekGymPatternIsConfirmed==="function"&&weekGymPatternIsConfirmed();
  const dayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dayToggles=[1,2,3,4,5,6].map(d=>`<button class="gym-day-tgl${_gymEditDraft[d]?' on':''}" data-gymday="${d}">${dayNames[d]}</button>`).join("");

  const mon=weekMonday(new Date());
  const assign=assignWeekSessions(mon);
  const sessLabel={s1:"Str A",s2:"Run",s3:"Str B",s4:"AFT",s5:"Mobility"};
  const previewCells=[1,2,3,4,5,6].map(d=>{
    const skey=assign[d];
    const dt=new Date(mon); dt.setDate(mon.getDate()+(d-1));
    const isGym=gymAccessForDate(dt);
    return `<div class="gym-preview-cell${isGym?' gym':''}"><span class="gym-preview-day">${dayNames[d]}</span><span class="gym-preview-sess">${skey?(sessLabel[skey]||skey):'Rest'}</span></div>`;
  }).join("");

  const todayLive=(S.gymAccessLive||{})[localYMD()];
  const todayGym=gymAccessForDate(new Date());

  el.innerHTML=`<div class="gym-access-card">
    <div class="td-h fn-h">Gym Access ${confirmed?'This Week':'— not yet confirmed for this week'}</div>
    <div class="plan-intro" style="margin-bottom:8px">Toggle which days (Mon–Sat) you'll have gym access. The coach puts equipment-heavy sessions (lifting, the AFT circuit) on those days and runs/mobility on the rest — Sunday stays a fixed rest day.</div>
    <div class="gym-day-toggles">${dayToggles}</div>
    <div class="gym-access-actions">
      <button class="hb-starter-btn" id="gymConfirmWeekBtn">${confirmed?'Update this week':'Confirm this week'}</button>
      <button class="hb-starter-btn" id="gymSaveDefaultBtn" style="background:transparent;border:1px solid var(--line)">Save as my usual pattern</button>
    </div>
    <div class="gym-week-preview">${previewCells}</div>
    <div class="gym-today-live">
      <span class="gym-today-lbl">Today specifically:</span>
      <button class="gym-live-btn${todayGym?' on':''}" data-gymlive="1">🏋️ Have gym</button>
      <button class="gym-live-btn${!todayGym?' on':''}" data-gymlive="0">🤸 No gym</button>
      ${todayLive!=null?`<button class="gym-live-clear" data-gymlive="clear">↺ use the week's plan</button>`:''}
    </div>
  </div>`;
}

// ===== Equipment profiles + optional sessions (FM-2) =====
// Which profile is currently being tag-edited in the UI — module-scope draft,
// same pattern as _gymEditDraft above. Defaults to the active profile.
let _equipEditProfile=null;
function renderEquipProfileUI(){
  const el=document.getElementById("equipProfileArea"); if(!el) return;
  const profiles=S.equipProfiles||{};
  const names=Object.keys(profiles);
  if(!_equipEditProfile || !profiles[_equipEditProfile]) _equipEditProfile=S.activeEquipProfile||names[0];
  const active=S.activeEquipProfile;
  const profileBtns=names.map(n=>`<button class="equip-profile-btn${n===active?' on':''}${n===_equipEditProfile?' editing':''}" data-equipedit="${esc(n)}">${n===active?'✓ ':''}${esc(n)}</button>`).join("");
  const editing=profiles[_equipEditProfile]||{tags:[]};
  const tagBtns=Object.keys(EQUIP_TAGS).map(k=>{
    const t=EQUIP_TAGS[k];
    const on=(editing.tags||[]).includes(k);
    return `<button class="equip-tag-tgl${on?' on':''}" data-equiptag="${k}">${esc(t.label)}${t.unverified?' <span class="equip-unverified" title="Common ROTC PT gear by general knowledge — not verified against your trailer. Edit if this is wrong.">?</span>':''}</button>`;
  }).join("");
  const canDelete=names.length>1;
  const editingTags=editing.tags||[];
  const optToggles=Object.keys(SESSIONS).filter(k=>SESSIONS[k].optional).map(k=>{
    const s=SESSIONS[k];
    const unlocked=eqSubset(s.eq,editingTags);
    const on=(S.optionalSessions||[]).includes(k);
    return `<button class="equip-opt-tgl${on?' on':''}${unlocked?'':' locked'}" data-equipopt="${k}" ${unlocked?'':'disabled title="Needs the '+esc((EQUIP_TAGS[s.eq[0]]||{}).label||s.eq[0])+' tag on this profile"'}>${on?'✓ ':''}${esc(s.name)}</button>`;
  }).join("");
  el.innerHTML=`<div class="equip-profile-card">
    <div class="td-h fn-h">Equipment Profiles</div>
    <div class="plan-intro" style="margin-bottom:8px">The <b>active</b> profile decides which exercise variant gets suggested per slot on gym days. Tags marked <span class="equip-unverified">?</span> are common ROTC PT-trailer gear by general knowledge only — no public battalion inventory exists to check against, so correct them to match what your trailer actually has.</div>
    <div class="equip-profile-list">${profileBtns}<button class="equip-profile-btn equip-profile-add" data-equipnew="1">+ New profile</button></div>
    <div class="equip-edit-label">Editing: <b>${esc(_equipEditProfile)}</b>${_equipEditProfile!==active?` <button class="equip-edit-switch" data-equipactive="${esc(_equipEditProfile)}">make active</button>`:''}${canDelete?` <button class="equip-profile-del" data-equipdel="${esc(_equipEditProfile)}">delete</button>`:''} <button class="equip-profile-rename" data-equiprename="${esc(_equipEditProfile)}">rename</button></div>
    <div class="equip-tag-toggles">${tagBtns}</div>
    ${optToggles?`<div class="equip-opt-h">Optional sessions (coach suggests these on a day this profile's tags unlock them, once opted in):</div><div class="equip-opt-toggles">${optToggles}</div>`:''}
  </div>`;
}

// Fill each session writeup's exercise list based on the active equipment profile (FM-2).
// Expands the Session N reference block that matches today's actual
// scheduled session (per the adaptive gym-access-aware scheduler,
// assignWeekSessions()/todaysPlan()) instead of always Session 1 regardless
// of what's really happening today. Deliberately only called once per tab
// visit (from the nav click handler), not on every render() — re-forcing
// it open on every render would fight a user who manually collapses it.
function openTodaysSessionBlock(){
  const p=typeof todaysPlan==="function"?todaysPlan():null;
  const todayKey=p&&p.sessionKey;
  document.querySelectorAll(".sess-ex").forEach(div=>{
    const details=div.closest("details.wk");
    if(!details) return;
    details.open = (div.getAttribute("data-sess")===todayKey);
  });
}
function renderSessionLists(){
  // weather picker
  const wp=document.getElementById("weatherBtns");
  const wsub=document.getElementById("weatherSub");
  const cur=(S.weather)||"clear";
  if(wp){
    wp.innerHTML=Object.keys(WEATHER).map(k=>`<button class="weather-b${k===cur?' on':''}" data-weather="${k}">${WEATHER[k].icon} ${esc(WEATHER[k].label)}</button>`).join("");
  }
  if(wsub){
    wsub.textContent = weatherBad() ? `${WEATHER[cur].icon} ${WEATHER[cur].label} — outdoor work swapped to indoor on days that need it` : "Clear — outdoor runs as planned";
  }
  const tags=activeEquipTags();
  const rich=tags.length>0;
  // fill each session's exercise container and inject beginner prescriptions
  document.querySelectorAll(".sess-ex").forEach(div=>{
    const skey=div.getAttribute("data-sess");
    const list=sessionExForProfile(skey, tags, new Date());
    const swapped = list.some(e=>e._swapped);
    const pickOne = SESSIONS[skey] && SESSIONS[skey].pickOne;
    const pickNote = pickOne ? `<div class="pickone-note">Pick <b>one</b> per run day — the plan rotates these for you.</div>` : "";
    // Per-exercise how-to, sourced live from the same EX_HOWTO array Coach
    // Today already uses — replaces the old static "Glossary" details block,
    // which hand-copied this same text and could silently drift out of sync
    // if SESSIONS/EX_HOWTO ever changed. One source of truth, browsable here
    // for any session (not just today's), on request instead of by default.
    const exLi=e=>{
      const how=exHowto(e.n);
      return `<li>${esc(e.n)}${e.w?' <span class="sess-eq">· equipment</span>':''}${e._swapped?` <span class="sess-swap">· indoors for weather</span>`:''}${(e._pool&&e._pool.length>1)?` <span class="sess-alt">· ${e._pool.length-1} alt${e._pool.length>2?'s':''}</span>`:''}${how?`<details class="ex-how"><summary>ℹ️ how-to</summary><div class="ex-how-body">${esc(how)}</div></details>`:''}</li>`;
    };
    const warmItems=list.filter(e=>e._phase==="warmup");
    const workItems=list.filter(e=>e._phase==="work"||e._phase==="flex"||e._phase==="balance"||!e._phase);
    const coolItems=list.filter(e=>e._phase==="cooldown");
    const group=(items,label,cls)=>items.length?`<div class="sess-phase-h ${cls}">${label}</div><ul class="gl">${items.map(exLi).join("")}</ul>`:"";
    div.innerHTML = `<div class="sess-ex-tag">${esc(S.activeEquipProfile||"")}${swapped?` · ${WEATHER[(S.weather)||"clear"].icon} indoor (weather)`:""}</div>${pickNote}${group(warmItems,"🔥 Warm-up (dynamic)","warm")}${group(workItems,SESSIONS[skey]&&SESSIONS[skey].flexFromLibrary?"🤸 Flexibility + balance":"💪 Session","work")}${group(coolItems,"🧊 Cool-down (static)","cool")}`;
    // remove any previous rx-card for this session, then inject fresh
    const prevRx=div.nextElementSibling;
    if(prevRx&&prevRx.classList.contains('rx-card')) prevRx.remove();
    // computeTarget() is the single source of truth here too — same engine,
    // same call shape as Coach Today and card-game, so this reference card
    // can never quietly disagree with what those show for the same exercise.
    // Tiers surface as an icon only: 🎯 adaptive (your real trend/AFT-blended
    // target), 🔰 starter (BEGINNER_RX, AFT-fitness-nudged if weighted),
    // 📋 generic (no starter row exists — plain intensity-based prose).
    const intensity=(typeof SESSION_META!=="undefined"&&SESSION_META[skey]&&SESSION_META[skey].intensity)||"moderate";
    const tierIcon={adaptive:"🎯","aft-anchor":"🎯",starter:"🔰",generic:"📋"};
    let anyAdaptive=false;
    const rows=workItems.map(e=>{
      const tgt=computeTarget(e,{skey,intensity,rich});
      if(!tgt) return '';
      if(tgt.tier==="adaptive"||tgt.tier==="aft-anchor") anyAdaptive=true;
      const cls=tgt.tier==="adaptive"||tgt.tier==="aft-anchor"?' rx-adaptive-row':'';
      return `<li class="rx-row${cls}"><span class="rx-ex-n">${tierIcon[tgt.tier]||''} ${esc(e.n)}</span><span class="rx-ex-tgt${tgt.hold?' hold':''}">${esc(tgt.target)}</span>${tgt.note?`<span class="rx-adapt-note">${esc(tgt.note)}</span>`:''}</li>`;
    }).filter(Boolean).join('');
    if(!rows) return;
    const rxNote=anyAdaptive
      ? "🎯 rows are your real next-session target, adapted from your own log/AFT history. 🔰 is a beginner starting point (nudged for your AFT level where it's a weighted lift) — log a session to start adapting those too."
      : "🔰 New to this? These are beginner starting points. Add reps when all sets feel easy — not before.";
    div.insertAdjacentHTML('afterend',
      `<div class="rx-card"><p class="rx-note">${esc(rxNote)}</p>
      <ul class="rx-list">${rows}</ul>
      <p class="rx-effort">Stop each set when you could still do 2 clean reps. That margin is what makes this sustainable for months.</p></div>`
    );
  });
}

/* ---------------- BRANCH / BOARD PREP ---------------- */
