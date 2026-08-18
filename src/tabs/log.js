let LG=null; // current draft {session, exercises:[{name,type,w,sets:[...]}]}
let _ptIntensity=6; // PT session "how hard" — 1-10, separate one-shot form from LG
function initLogTab(){
  const sel=document.getElementById("lgSession");
  if(!sel) return;
  if(!sel.options.length){
    sel.innerHTML=Object.keys(SESSIONS).map(k=>`<option value="${k}">${SESSIONS[k].name}</option>`).join("");
    sel.onchange=()=>buildLogForm(sel.value);
  }
  if(!LG) buildLogForm(sel.value);
  renderPtIntensityBtns();
}
function buildLogForm(skey){
  const s=SESSIONS[skey];
  LG={session:skey, readiness:null, rpe:null, exercises:sessionEx(skey).map(e=>({name:e.n,type:e.t,w:!!e.w,custom:!!e.custom,sets:[blankSet(e.t)],effort:null,reduced:false}))};
  renderLogForm();
  renderReadinessBtns();
  renderRpeBtns();
}
// Shared renderer for any 1-10 rating button group: generates the 10 buttons
// and marks the current value "on" in one pass. Replaces 3 near-identical
// hand-copied 20-line button blocks that used to live in log.html — the
// click delegation in this file already reads the same data-attributes off
// whatever's in the DOM, so regenerating the markup here needs no other change.
function renderRatingBtns(containerId, attr, value){
  const el=document.getElementById(containerId); if(!el) return;
  el.innerHTML=Array.from({length:10},(_,i)=>i+1)
    .map(n=>`<button type="button" class="lg-ready-btn${n===value?' on':''}" data-${attr}="${n}">${n}</button>`).join("");
}
function renderReadinessBtns(){ if(LG) renderRatingBtns("lgReadinessBtns","readiness",LG.readiness); }
function renderRpeBtns(){ if(LG) renderRatingBtns("lgRpeBtns","rpe",LG.rpe); }
function renderPtIntensityBtns(){ renderRatingBtns("ptIntensityBtns","ptintensity",_ptIntensity); }
function blankSet(type){
  if(type==="reps") return {reps:"",weight:""};
  if(type==="time") return {time:""};
  if(type==="dist") return {dist:"",time:""};
  return {reps:""};
}
function renderLogForm(){
  const el=document.getElementById("lgExercises");
  el.innerHTML=LG.exercises.map((ex,xi)=>{
    const typLabel=ex.type==="reps"?(ex.w?"reps × weight":"reps"):ex.type==="time"?"hold/time":"distance + time";
    return `<div class="lg-ex">
      <div class="lg-ex-name">${ex.custom?'':esc(ex.name)} <span class="typ">${typLabel}</span></div>
      ${ex.custom?`<input class="lg-custom-name" placeholder="Exercise name" value="${esc(ex.name==='Custom exercise'?'':ex.name)}" data-cn="${xi}">`:''}
      ${ex.sets.map((st,si)=>`<div class="lg-set">
        <span class="setn">#${si+1}</span>
        ${setInputs(ex,st,xi,si)}
        ${ex.sets.length>1?`<button class="rmset" data-rm="${xi}.${si}">✕</button>`:''}
      </div>`).join("")}
      <button class="lg-addset" data-addset="${xi}">+ add set</button>
      <div class="lg-diff-row">
        <span class="lg-diff-lbl">🎯 Effort (RPE) <span class="lg-diff-hint">1 = very easy · 10 = max effort — affects your next target for this exercise</span></span>
        <div class="lg-effort-scale">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" class="lg-effort-btn${ex.effort===n?' on':''}" data-effort="${xi}.${n}">${n}</button>`).join("")}</div>
        <label class="lg-reduced-lbl"><input type="checkbox" data-reduced="${xi}" ${ex.reduced?'checked':''}> had to cut it short</label>
      </div>
    </div>`;
  }).join("");
}
function setInputs(ex,st,xi,si){
  if(ex.type==="reps"){
    return `<input type="number" placeholder="reps" value="${st.reps}" data-f="${xi}.${si}.reps">`+
      (ex.w?`<input type="number" placeholder="lbs (opt)" value="${st.weight}" data-f="${xi}.${si}.weight">`:'');
  }
  if(ex.type==="time"){
    return `<input type="text" placeholder="m:ss or sec" value="${st.time}" data-f="${xi}.${si}.time">`;
  }
  if(ex.type==="dist"){
    return `<input type="text" placeholder="dist (mi/m)" value="${st.dist}" data-f="${xi}.${si}.dist">`+
      `<input type="text" placeholder="time m:ss" value="${st.time}" data-f="${xi}.${si}.time">`;
  }
  return "";
}
// delegated input + button handling for log form
document.addEventListener("input",e=>{
  if(e.target.id==="ptText"){ ptOnText(); return; }
  const f=e.target.dataset.f;
  if(f){const[xi,si,field]=f.split(".");LG.exercises[xi].sets[si][field]=e.target.value;return;}
  const cn=e.target.dataset.cn;
  if(cn!=null){LG.exercises[cn].name=e.target.value;}
});
document.addEventListener("change",e=>{
  const red=e.target.dataset.reduced;
  if(red!=null && LG){ LG.exercises[red].reduced=e.target.checked; }
});
document.addEventListener("click",e=>{
  const add=e.target.dataset.addset;
  if(add!=null){const ex=LG.exercises[add];ex.sets.push(blankSet(ex.type));renderLogForm();return;}
  const rm=e.target.dataset.rm;
  if(rm!=null){const[xi,si]=rm.split(".");LG.exercises[xi].sets.splice(si,1);renderLogForm();return;}
  const dw=e.target.dataset.delw;
  if(dw!=null){if(confirm("Delete this workout?")){S.workouts=S.workouts.filter(w=>w.id!==dw);save();renderLog();}return;}
  const eff=e.target.dataset.effort;
  if(eff!=null && LG){ const[xi,val]=eff.split("."); const ex=LG.exercises[xi]; const n=+val; ex.effort=(ex.effort===n)?null:n; renderLogForm(); return; }
  const readiness=e.target.dataset.readiness;
  if(readiness!=null && LG){ const n=+readiness; LG.readiness=(LG.readiness===n)?null:n; renderReadinessBtns(); return; }
  const rpe=e.target.dataset.rpe;
  if(rpe!=null && LG){ const n=+rpe; LG.rpe=(LG.rpe===n)?null:n; renderRpeBtns(); return; }
  const ptI=e.target.dataset.ptintensity;
  if(ptI!=null){ _ptIntensity=+ptI; renderPtIntensityBtns(); return; }
});
function setHasData(ex,st){
  if(ex.type==="reps") return st.reps!=="";
  if(ex.type==="time") return st.time!=="";
  if(ex.type==="dist") return st.dist!==""||st.time!=="";
  return false;
}
document.getElementById("lgSave").onclick=()=>{
  if(!LG) return;
  const dur=parseInt(document.getElementById("lgDur").value)||null;
  const rpe=LG.rpe||null;
  // keep only exercises with at least one filled set
  const exercises=LG.exercises.map(ex=>({
    name:ex.name, type:ex.type, w:ex.w,
    sets:ex.sets.filter(st=>setHasData(ex,st)),
    effort:ex.effort||null, reduced:!!ex.reduced,
  })).filter(ex=>ex.sets.length>0 && ex.name && ex.name!=="Custom exercise");
  if(!exercises.length){toast("Log at least one set first");return;}
  const note=document.getElementById("lgNote").value.trim()||null;
  // Snapshot adaptive targets BEFORE adding the new workout so we can diff
  const _exNames=exercises.map(e=>e.name);
  const _tBefore={}; _exNames.forEach(n=>{ _tBefore[n]=computeTarget(n); });
  S.workouts.push({id:id(), date:new Date().toLocaleDateString(), ts:Date.now(), session:LG.session, duration:dur, rpe, readiness:LG.readiness||null, exercises, note});
  if(!S.pathXP) S.pathXP={};
  S.pathXP.physical=(S.pathXP.physical||0)+25; S.gold+=8; S.totalDone++;
  save();
  document.getElementById("lgDur").value="";
  document.getElementById("lgNote").value="";
  buildLogForm(document.getElementById("lgSession").value);
  render();
  const _changed=_exNames.filter(n=>{const b=_tBefore[n],a=computeTarget(n);if(!b&&!a)return false;if(!b&&a)return true;if(b&&!a)return false;return b.target!==a.target;}).length;
  const _adaptMsg=_changed>0?` · 🎯 ${_changed} target${_changed!==1?'s':''} updated`:'';
  toast(`<span class="t-xp">Workout logged · +25 Fitness XP +8 pts${_adaptMsg}</span>`);
};
// best-set helpers for progress tracking
function setVolume(ex,st){ // a single comparable number per set for "best"
  if(ex.type==="reps"){const r=parseFloat(st.reps)||0;const w=parseFloat(st.weight)||0;return w>0?r*w:r;}
  if(ex.type==="time"){return parseTime(st.time)||parseFloat(st.time)||0;}
  if(ex.type==="dist"){return parseFloat(st.dist)||0;}
  return 0;
}
function fmtSet(ex,st){
  if(ex.type==="reps"){return st.reps+(st.weight?`×${st.weight}lb`:"");}
  if(ex.type==="time"){return st.time;}
  if(ex.type==="dist"){return [st.dist,st.time].filter(Boolean).join(" / ");}
  return "";
}

/* ---------------- CADRE PT (recovery-aware) ---------------- */
let _ptSel=null;          // manually toggled areas
let _ptTextAreas=new Set(); // areas detected from the text box
function ptEffectiveAreas(){ return new Set([..._ptSel, ..._ptTextAreas]); }
function renderPT(){
  const areasEl=document.getElementById("ptAreas"); if(!areasEl) return;
  if(!_ptSel) _ptSel=new Set();
  const eff=ptEffectiveAreas();
  areasEl.innerHTML=PT_AREAS.map(a=>{
    const on=eff.has(a.k), fromText=_ptTextAreas.has(a.k)&&!_ptSel.has(a.k);
    return `<div class="pt-chip ${on?'on':''}" data-pta="${a.k}">
      <div class="box">${on?'✓':''}</div>
      <div><div class="pt-lab">${a.label}${fromText?' <span style="color:var(--ink-faint);font-weight:400">· from text</span>':''}</div><div class="pt-sub">${a.note}</div></div>
    </div>`;}).join("");
  const recent=document.getElementById("ptRecent");
  const days7=Date.now()-7*864e5;
  const list=S.ptLog.filter(p=>p.ts>=days7).sort((a,b)=>b.ts-a.ts);
  recent.innerHTML=list.length?`<div class="sec-h" style="margin-top:16px"><h2>PT this week</h2></div>`+list.map(p=>{
    const what = p.text ? esc(p.text) : (p.areas||[]).map(k=>(PT_AREAS.find(x=>x.k===k)||{}).label||k).map(s=>s.split(' ')[0]).join(', ');
    const intensityLabel = typeof p.intensity==="number" ? `${p.intensity}/10` : p.intensity;
    return `<div class="pt-recent-row"><span>${p.date} · <span class="areas">${what}</span> · ${esc(String(intensityLabel))}</span><button class="del" data-dpt="${p.id}">✕</button></div>`;
  }).join(""):"";
}
// live-parse the text box, update detected areas + preview, re-render chips
function ptOnText(){
  const txt=document.getElementById("ptText").value;
  const det=document.getElementById("ptDetected");
  const parsed=parsePT(txt);
  _ptTextAreas=new Set(parsed.areas);
  if(parsed.moves.length){
    det.innerHTML=parsed.moves.map(m=>`<span class="pt-tag">${esc(m.name)}${m.areas.length?` <span class="mv">→ ${m.areas.join(', ')}</span>`:' <span class="mv">→ recovery</span>'}</span>`).join("");
  } else if(txt.trim()){
    det.innerHTML=`<span class="pt-unknown">Couldn't auto-recognize specific moves — tap the areas below to set them manually.</span>`;
  } else { det.innerHTML=""; }
  renderPT();
}
// Intensity weight for the recovery-load decay math below. Handles both the
// current 1-10 scale (mapped onto the same 0-3 range the old light/moderate/
// hard weights used, so the fatigued/sore thresholds in plan.js's
// renderRecoveryAdvisory — calibrated against that range — stay meaningful)
// and legacy string values from before this was a numeric scale.
function ptIntensityWeight(p){
  if(typeof p.intensity==="number") return (p.intensity/10)*3;
  return {light:1,moderate:2,hard:3}[p.intensity] || 2;
}
// recovery load per area over the last N days, intensity-weighted & decaying
function recoveryLoad(){
  const now=Date.now();
  const load={legs:0,push:0,pull:0,core:0,cardio:0};
  S.ptLog.forEach(p=>{
    const ageDays=(now-p.ts)/864e5;
    if(ageDays>4) return;
    const decay=Math.max(0,1-ageDays/4);
    (p.areas||[]).forEach(k=>{ if(load[k]!=null) load[k]+=ptIntensityWeight(p)*decay; });
  });
  return load;
}
// Macro-level deload/overtraining signal — deliberately distinct from
// recoveryLoad()'s 4-day per-muscle-group window and computeTarget()'s
// per-exercise hold-on-hard-effort logic. Found by the v204-session FM
// audit as a real structural gap: real overtraining often shows up as
// SEVERAL exercises each individually within normal bounds — no single
// exercise or muscle group ever trips its own threshold — but the whole
// log, across 2-3 weeks, shows a real struggle pattern. Looks at real
// logged struggle signals (session RPE, per-exercise effort, cut-short),
// nothing invented or estimated.
function detectOvertrainingTrend(){
  const now=Date.now();
  const windowDays=21;
  const wStruggled=w=>{
    if(w.rpe!=null && w.rpe>=9) return true;
    const exs=w.exercises||[];
    if(exs.some(e=>e.reduced)) return true;
    if(exs.filter(e=>e.effort!=null && e.effort>=9).length>=2) return true;
    return false;
  };
  // A cadet training mostly via logged unit PT (S.ptLog) instead of the gym
  // Log could never trip this — ptLog only has a whole-session `intensity`
  // (1-10, same self-rated-difficulty scale as a workout's rpe per
  // ptIntensityWeight()'s own comment), so that's the one honest signal to
  // reuse here rather than inventing a per-exercise equivalent it doesn't have.
  const pStruggled=p=>typeof p.intensity==="number" && p.intensity>=9;
  const recentW=(S.workouts||[]).filter(w=>w.ts && (now-w.ts)/864e5<=windowDays).map(w=>({ts:w.ts,struggled:wStruggled(w)}));
  const recentP=(S.ptLog||[]).filter(p=>p.ts && (now-p.ts)/864e5<=windowDays).map(p=>({ts:p.ts,struggled:pStruggled(p)}));
  const recent=[...recentW,...recentP].sort((a,b)=>a.ts-b.ts);
  if(recent.length<4) return null; // too few logged sessions to see a real trend, not just noise
  const strugglingCount=recent.filter(x=>x.struggled).length;
  const rate=strugglingCount/recent.length;
  if(rate<0.5) return null; // under half struggling — normal week-to-week variation, not a trend
  return {sessionsLogged:recent.length, strugglingCount, rate, windowDays};
}
function savePT(){
  const eff=ptEffectiveAreas();
  const text=document.getElementById("ptText").value.trim();
  if(eff.size===0){toast("Type what PT did, or tap at least one area");return;}
  const intensity=_ptIntensity;
  S.ptLog.push({id:id(),ts:Date.now(),date:new Date().toLocaleDateString(),areas:[...eff],intensity,text:text||null});
  _ptSel=new Set(); _ptTextAreas=new Set();
  document.getElementById("ptText").value="";
  document.getElementById("ptDetected").innerHTML="";
  save();render();
  toast("PT logged — FM plan eased off those muscles for recovery");
}
function renderLog(){
  if(!document.getElementById("lgSession")) return;
  initLogTab();
  // PT calendar — 30-day training frequency view
  const calEl=document.getElementById("ptCal");
  if(calEl){
    const workedDates=new Set();
    (S.workouts||[]).forEach(w=>workedDates.add(w.date));
    (S.ptLog||[]).forEach(p=>workedDates.add(p.date));
    const dots=[];
    for(let i=29;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      const ds=d.toLocaleDateString();
      dots.push(`<div class="pt-cal-dot ${workedDates.has(ds)?'on':''}" title="${ds}"></div>`);
    }
    calEl.innerHTML=`<div class="pt-cal-wrap"><div class="pt-cal-title">Training frequency — last 30 days</div><div class="pt-cal">${dots.join('')}</div><div class="pt-cal-legend">● = training day (workout or PT logged)</div></div>`;
  }
  // weekly volume summary
  const wkSumEl=document.getElementById("lgWeekSummary");
  if(wkSumEl){
    const cut=Date.now()-7*864e5;
    const wkW=(S.workouts||[]).filter(w=>w.ts>=cut);
    const wkP=(S.ptLog||[]).filter(p=>p.ts>=cut);
    const totalMin=wkW.reduce((s,w)=>s+(w.duration||0),0);
    const h=Math.floor(totalMin/60), m=totalMin%60;
    const sessions=wkW.length+wkP.length;
    wkSumEl.innerHTML=sessions>0
      ?`<div class="week-summary">${sessions} session${sessions!==1?'s':''} this week${totalMin>0?` · ${h>0?h+'h ':''}${m>0?m+'min':h>0?'':''}`:''}${wkP.length>0?` (${wkP.length} PT)`:''}  </div>`
      :`<div class="week-summary no-data">No sessions logged this week.</div>`;
  }
  // progress by exercise: scan all workouts, group by exercise name
  const prog=document.getElementById("lgProgress");
  const byEx={};
  (S.workouts||[]).forEach(w=>(w.exercises||[]).forEach(ex=>{
    if(!ex.sets||!ex.sets.length) return;
    const best=ex.sets.reduce((m,st)=>Math.max(m,setVolume(ex,st)),0);
    const bestSet=ex.sets.reduce((m,st)=>setVolume(ex,st)>setVolume(ex,m)?st:m,ex.sets[0]);
    (byEx[ex.name]=byEx[ex.name]||[]).push({ts:w.ts,best,bestSet,ex});
  }));
  const names=Object.keys(byEx);
  if(!names.length){prog.innerHTML=`<div class="empty"><span class="big">🏋️</span>No workouts logged yet. Pick a session above and log your sets.</div>`;}
  else{
    prog.innerHTML=names.map(n=>{
      const arr=byEx[n].sort((a,b)=>a.ts-b.ts);
      const latest=arr[arr.length-1];
      const allTimeBest=arr.reduce((m,x)=>x.best>m.best?x:m,arr[0]);
      let trend="";
      if(arr.length>1){
        const prev=arr[arr.length-2];
        const d=latest.best-prev.best;
        // for time/dist where lower is better (runs, SDC), invert interpretation
        const lowerBetter=(latest.ex.type==="dist") || (latest.ex.type==="time" && /run|sprint|drag|sdc|200m/i.test(n));
        if(Math.abs(d)<0.01) trend=`<span style="color:var(--ink-faint)">— holding steady</span>`;
        else if((d>0&&!lowerBetter)||(d<0&&lowerBetter)) trend=`<span style="color:var(--jade)">▲ improving</span>`;
        else trend=`<span style="color:var(--ember)">▼ slipping — push this next time</span>`;
      } else trend=`<span style="color:var(--ink-faint)">first entry</span>`;
      return `<div class="lg-prog-row">
        <div class="lg-prog-top"><span class="lg-prog-name">${esc(n)}</span><span class="lg-prog-best">best: ${esc(fmtSet(allTimeBest.ex,allTimeBest.bestSet))}</span></div>
        <div class="lg-prog-trend">${trend} · last: ${esc(fmtSet(latest.ex,latest.bestSet))} (${arr.length}×)</div>
      </div>`;
    }).join("");
  }
  // recent workouts
  const hist=document.getElementById("lgHistory");
  if(!S.workouts.length){hist.innerHTML="";}
  else{
    hist.innerHTML=S.workouts.slice().reverse().slice(0,12).map(w=>`<div class="lg-hist">
      <button class="del-w" data-delw="${w.id}">✕</button>
      <div class="lg-hist-top"><span class="dt">${SESSIONS[w.session]?SESSIONS[w.session].name.split(' · ')[0]:'Workout'}</span><span>${w.date}${w.duration?` · ${w.duration} min`:''}${w.rpe?`<span class="lg-rpe-tag">RPE ${w.rpe}</span>`:''}</span></div>
      ${w.exercises.map(ex=>`<div class="lg-hist-ex">${esc(ex.name)}: ${ex.sets.map(st=>esc(fmtSet(ex,st))).join(", ")}</div>`).join("")}
      ${w.note?`<div class="lg-hist-note">${esc(w.note)}</div>`:""}
    </div>`).join("");
  }
}

/* ---------------- ADAPTIVE TARGETS (FM auto-rewrite) ---------------- */
// For each logged exercise, compute the next target from recent performance.
// Progressive overload when trending up/steady; HOLD + flag when stalling.
function exerciseSeries(name){
  const out=[];
  (S.workouts||[]).slice().sort((a,b)=>a.ts-b.ts).forEach(w=>{
    (w.exercises||[]).filter(e=>e.name===name && e.sets && e.sets.length).forEach(ex=>{
      const best=ex.sets.reduce((m,st)=>setVolume(ex,st)>setVolume(ex,m)?st:m,ex.sets[0]);
      out.push({ts:w.ts,ex,best,vol:setVolume(ex,best),effort:ex.effort||null,reduced:!!ex.reduced,sessionRpe:w.rpe||null});
    });
  });
  return out;
}
// map a logged exercise name to a baseline test key (loose matching)
function baselineKeyFor(name){
  const n=String(name||"").toLowerCase();
  if(/push-?up/.test(n)) return "max_pushups";
  if(/plank/.test(n)&&!/side/.test(n)) return "max_plank";
  if(/deadlift/.test(n)) return "max_deadlift";
  if(/pull-?up|inverted row/.test(n)) return "max_pullups";
  if(/squat/.test(n)&&!/bulgarian|split|pistol|jump/.test(n)) return "max_squat";
  // "tempo"/"interval" alone used to match ANY cardio exercise with that word
  // in its name — "Rower intervals," "Stationary bike intervals," "Swim
  // intervals," and the indoor bodyweight-circuit swaps ("Indoor intervals,"
  // "Indoor tempo") all got bucketed under the 2-mile-run baseline even
  // though none of them are running. computeTarget()'s baseline-blending
  // could then attribute an unrelated exercise's monthly improvement (or
  // plateau) to whichever of these the user actually did, masking a real
  // trend on the thing they were really training. Treadmill variants stay
  // included — a treadmill genuinely is running.
  if(/2-?mile|long easy/.test(n)) return "run_2mi";
  if(/tempo|interval/.test(n) && !/row|bike|swim|indoor/.test(n)) return "run_2mi";
  if(/sprint-drag|sdc/.test(n)) return "sdc_sim";
  return null;
}
// numeric "value" for a baseline result, comparable across months
function baselineVolume(def,val){
  if(!val) return null;
  if(def.type==="reps") return (parseFloat(val.reps)||0)*((parseFloat(val.weight)||0)>0?(parseFloat(val.weight)||0):1);
  if(def.type==="time") return parseTime(val.time)||parseFloat(val.time)||0;
  if(def.type==="dist") return parseTime(val.time)||0; // for runs, time is the comparable (lower better)
  return null;
}
// get last two baselines' values for a key -> {latest, prev, def}
function baselineTrend(bkey){
  if(!bkey) return null;
  const def=BASELINE_TEST.find(d=>d.key===bkey);
  const entries=S.baselines.filter(b=>b.results&&b.results[bkey]).sort((a,b)=>a.ts-b.ts);
  if(!entries.length) return null;
  const latest=entries[entries.length-1].results[bkey];
  const prev=entries.length>1?entries[entries.length-2].results[bkey]:null;
  return {def, latest, prev, latestVol:baselineVolume(def,latest), prevVol:prev?baselineVolume(def,prev):null};
}

/* ---------------- MONTHLY BASELINE ---------------- */
// Relocated here from plan.js — this is real data-entry + history, matching
// Log's role in the redesign ("raw data entry + history"), and log.js
// already owned every *consumer* of this data (baselineTrend/baselineVolume/
// baselineKeyFor above) — this reunites data that was artificially split
// across two files, not a new split.
function currentMonth(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");}
function monthLabel(m){const[y,mo]=m.split("-");return new Date(y,mo-1,1).toLocaleDateString(undefined,{month:"long",year:"numeric"});}
function baselineDueThisMonth(){
  return !S.baselines.some(b=>b.month===currentMonth());
}
let BL_DRAFT=null;
function baselinePrCard(){
  const entries=(S.baselines||[]);
  if(entries.length<1) return "";
  const sorted=entries.slice().sort((a,b)=>a.ts-b.ts);
  const latest=sorted[sorted.length-1];
  const rows=BASELINE_TEST.map(def=>{
    const allVals=sorted.filter(b=>b.results&&b.results[def.key]);
    if(!allVals.length) return null;
    const best=allVals.reduce((bst,b)=>{
      const v=baselineVolume(def,b.results[def.key]); if(v==null) return bst;
      const bv=bst?baselineVolume(def,bst.results[def.key]):null;
      return (bv==null||(def.lowerBetter?v<bv:v>bv))?b:bst;
    },null);
    if(!best) return null;
    const isCurrent=latest&&best===latest;
    const valStr=fmtBaselineVal(def,best.results[def.key]);
    const shortName=def.name.replace(/ \(.*\)/,'');
    return `<div class="bl-pr-row"><span class="bl-pr-label">${esc(shortName)}</span><span class="bl-pr-val">${esc(valStr)}${isCurrent?' <span class="bl-pr-star">⭐</span>':''}</span><span class="bl-pr-date">${esc(monthLabel(best.month))}</span></div>`;
  }).filter(Boolean);
  if(!rows.length) return "";
  return `<div class="bl-pr-card"><div class="bl-pr-title">🏅 Baseline Personal Records</div>${rows.join("")}</div>`;
}

function renderBaseline(){
  const area=document.getElementById("baselineArea");
  const prompt=document.getElementById("baselinePrompt");
  if(!area) return;
  const due=baselineDueThisMonth();
  // prompt banner
  if(due){
    prompt.innerHTML=`<div class="bl-prompt">📅 <b>New month — baseline due.</b> Run a max-effort test on the movements below (one all-out set each). This re-anchors your training targets so they track your real strength, not just day-to-day noise.</div>`;
  } else {
    const thisMonth=S.baselines.filter(b=>b.month===currentMonth()).pop();
    prompt.innerHTML=`<div class="bl-prompt" style="background:rgba(111,158,84,.1);border-color:#3c5230">✅ <b style="color:var(--jade)">${monthLabel(currentMonth())} baseline logged.</b> Targets are anchored to it. Next baseline prompts at the start of next month.</div>`;
  }
  // latest baseline summary (with month-over-month deltas)
  let latestHtml="";
  if(S.baselines.length){
    const sorted=S.baselines.slice().sort((a,b)=>a.ts-b.ts);
    const latest=sorted[sorted.length-1];
    const prev=sorted.length>1?sorted[sorted.length-2]:null;
    latestHtml=`<div class="bl-latest"><h4>Latest baseline — ${monthLabel(latest.month)}</h4>`+
      BASELINE_TEST.map(def=>{
        const v=latest.results[def.key]; if(!v) return "";
        const disp=fmtBaselineVal(def,v);
        let delta="";
        if(prev&&prev.results[def.key]){
          const a=baselineVolume(def,v), b=baselineVolume(def,prev.results[def.key]);
          const better=def.lowerBetter? a<b : a>b;
          const same=Math.abs(a-b)<0.01;
          delta=same?`<span class="delta" style="color:var(--ink-faint)">—</span>`:
            better?`<span class="delta" style="color:var(--jade)">▲ improved</span>`:
            `<span class="delta" style="color:var(--ember)">▼ down</span>`;
        }
        return `<div class="bl-latest-row"><span>${esc(def.name.replace(/ \(.*\)/,''))}: <b>${esc(disp)}</b></span>${delta}</div>`;
      }).filter(Boolean).join("")+`</div>`;
  }
  // input form
  if(!BL_DRAFT) BL_DRAFT={};
  const form=`<div class="bl-card ${due?'due':''}">
    ${BASELINE_TEST.map(def=>{
      const last=lastBaselineVal(def.key);
      const warmupHtml=def.warmupProtocol
        ? `<details class="bl-warmup"><summary>⚠️ Before you test</summary><ol>${def.warmupProtocol.map(s=>`<li>${esc(s)}</li>`).join("")}</ol><div class="bl-warmup-stop">${esc(def.warmupStop||"")}</div></details>`
        : def.warmupNote ? `<details class="bl-warmup"><summary>⚠️ Before you test</summary><div class="bl-warmup-stop">${esc(def.warmupNote)}</div></details>` : '';
      return `<div class="bl-ex">
        <div class="bl-ex-row">
          <div class="bl-ex-name">${esc(def.name)}${last?`<div class="prev">last: ${esc(fmtBaselineVal(def,last))}</div>`:''}</div>
          <div class="units">${baselineInputs(def)}</div>
        </div>
        ${warmupHtml}
      </div>`;
    }).join("")}
    <button class="btn-add" id="blSave" style="margin-top:12px">${due?'Log This Month&rsquo;s Baseline':'Save Baseline (updates targets)'}</button>
  </div>`;
  area.innerHTML=baselinePrCard()+latestHtml+baselineSparklines()+form;
  const btn=document.getElementById("blSave");
  if(btn) btn.onclick=saveBaseline;
}
function baselineSparklines(){
  if((S.baselines||[]).length<2) return "";
  const sorted=S.baselines.slice().sort((a,b)=>a.ts-b.ts);
  const rows=BASELINE_TEST.map(def=>{
    const entries=sorted.filter(b=>b.results&&b.results[def.key]);
    const vals=entries.map(b=>baselineVolume(def,b.results[def.key])).filter(v=>v!=null&&v>0);
    if(vals.length<2) return "";
    const bestEntry=entries.reduce((bst,b)=>{
      const v=baselineVolume(def,b.results[def.key]); if(v==null) return bst;
      const bv=bst?baselineVolume(def,bst.results[def.key]):null;
      return (bv==null||(def.lowerBetter?v<bv:v>bv))?b:bst;
    },null);
    const bestLabel=bestEntry?`Best: <b>${esc(fmtBaselineVal(def,bestEntry.results[def.key]))}</b> (${esc(monthLabel(bestEntry.month))})`:"";
    return `<div class="bl-spark-row">
      <div class="bl-spark-name">${esc(def.name.replace(/ \(.*\)/,''))}</div>
      <div class="wl-spark">${miniSparkline(vals,240,40)}</div>
      <div class="bl-spark-best">${bestLabel}</div>
    </div>`;
  }).filter(Boolean).join("");
  if(!rows) return "";
  return `<div class="bl-sparks"><div class="sec-h" style="margin-bottom:8px"><h2>Baseline History</h2><span class="hint">month-over-month</span></div>${rows}</div>`;
}
function baselineInputs(def){
  if(def.type==="reps"){
    return `<input type="number" placeholder="reps" data-bl="${def.key}.reps">`+(def.w?`<input type="number" placeholder="lb" data-bl="${def.key}.weight">`:'');
  }
  if(def.type==="time") return `<input type="text" class="wide" placeholder="m:ss" data-bl="${def.key}.time">`;
  if(def.type==="dist") return `<input type="text" class="wide" placeholder="time m:ss" data-bl="${def.key}.time">`;
  return "";
}
function lastBaselineVal(key){
  const e=S.baselines.filter(b=>b.results&&b.results[key]).sort((a,b)=>a.ts-b.ts);
  return e.length?e[e.length-1].results[key]:null;
}
function fmtBaselineVal(def,v){
  if(def.type==="reps") return v.reps+(v.weight?`×${v.weight}lb`:"")+" reps";
  if(def.type==="time") return v.time;
  if(def.type==="dist") return v.time;
  return "";
}
// capture baseline inputs
document.addEventListener("input",e=>{
  const b=e.target.dataset.bl;
  if(b){const[key,field]=b.split(".");if(!BL_DRAFT)BL_DRAFT={};(BL_DRAFT[key]=BL_DRAFT[key]||{})[field]=e.target.value;}
});
function saveBaseline(){
  if(!BL_DRAFT||!Object.keys(BL_DRAFT).length){toast("Enter at least one baseline result");return;}
  // keep only keys with real data
  const results={};
  Object.keys(BL_DRAFT).forEach(k=>{
    const v=BL_DRAFT[k];
    const has=(v.reps&&v.reps!=="")||(v.time&&v.time!=="");
    if(has) results[k]=v;
  });
  if(!Object.keys(results).length){toast("Enter at least one baseline result");return;}
  const m=currentMonth();
  // replace existing baseline for this month if re-logging
  S.baselines=S.baselines.filter(b=>b.month!==m);
  S.baselines.push({date:new Date().toLocaleDateString(),ts:Date.now(),month:m,results});
  S.lastBaselineMonth=m;
  if(!S.pathXP) S.pathXP={};
  S.pathXP.physical=(S.pathXP.physical||0)+60; S.gold+=25;
  BL_DRAFT=null;
  save();render();
  toast(`<span class="t-xp">Baseline logged · +60 Fitness XP +25 pts</span> · targets re-anchored`);
}

// The 4 AFT events with a clean, unambiguous 1:1 exercise-name match (SDC has
// no single canonical logged exercise — it's simulated via several different
// carry/drag variants depending on equipment — so it's deliberately left out
// rather than guessing at a fuzzy match).
const AFT_EXERCISE_KEY={
  "Trap-bar / barbell deadlift":"dl",
  "Hand-release push-ups":"hrp",
  "Plank":"plank",
  "Timed 2-mile":"run",
  "Timed 2-mile (treadmill)":"run",
};
const AFT_KEY_LOWER_BETTER={dl:false,hrp:false,plank:false,run:true};
// last two real AFT raw event values for a logged exercise name (S.aft entries
// are always appended in order, same "last two array elements" convention
// already used elsewhere for S.aft — no date parsing needed).
function aftTrendFor(name){
  const key=AFT_EXERCISE_KEY[name];
  if(!key) return null;
  const entries=(S.aft||[]).filter(a=>a.raw&&a.raw[key]!=null);
  if(!entries.length) return null;
  const latest=entries[entries.length-1].raw[key];
  const prev=entries.length>1?entries[entries.length-2].raw[key]:null;
  return {key,latest,prev,lowerBetter:AFT_KEY_LOWER_BETTER[key]};
}
// computeTarget() is the single source of truth for "what should I do on this
// exercise" everywhere in the app — Coach Today, the Session N reference
// cards, and the card-game mode all call this one function instead of each
// keeping its own guess. It resolves through up to 4 tiers, tiers 1-2 are the
// original FM-Adapt/AFT-blended engine (unconditional); tiers 3-4 are an
// opt-in fallback (see below) added when this was unified.
//
// exArg: a string exercise name (back-compat with existing bare callers), OR
//        the real exercise object ({n, t/type, w, ...}) SESSIONS/BEGINNER_RX
//        callers already have on hand — required for tier 4's type-aware prose.
// opts:  {skey, intensity, rich} — all optional. Tiers 3/4 are STRICTLY
//        opt-in: a bare computeTarget(name) call with no opts must keep
//        returning tiers 1-2 or null exactly as before. This matters concretely
//        for the save-toast diff in lgSave's onclick below (`_tBefore`/`_changed`),
//        which uses "did a real target appear that wasn't there before" as its
//        signal — if bare calls started returning tier-4 generic prose
//        unconditionally, that diff would break. Only call sites with real
//        skey/intensity context in hand (Coach Today, Session N cards,
//        card-game) should pass opts.
function computeTarget(exArg, opts){
  opts = opts || {};
  const name = typeof exArg==="string" ? exArg : exArg.n;
  const s=exerciseSeries(name);
  if(!s.length){
    // Tier "aft-anchor": no logged workout sets yet — if this exercise has a
    // clean AFT-event match and real AFT history exists, seed from that real
    // number instead of going silent. Deliberately doesn't invent a
    // working-set percentage off a max-effort AFT test (a faked-formula
    // risk) — just anchors to the real tested number and lets normal
    // set-by-set progression take over once a first set is actually logged.
    const at=aftTrendFor(name);
    if(at){
      if(at.key==="dl") return {target:`log your first working set (last AFT max: ${at.latest} lb)`, note:"no logged sets yet — start conservative below that max, then targets adapt from your own log", tier:"aft-anchor"};
      if(at.key==="hrp") return {target:`${at.latest} reps`, note:`based on your last AFT push-up count (${at.latest}) — not yet logged as a workout here`, tier:"aft-anchor"};
      if(at.key==="plank") return {target:`${fmtSec(at.latest)}`, note:`based on your last AFT plank hold — not yet logged as a workout here`, tier:"aft-anchor"};
      if(at.key==="run") return {target:`beat ${fmtSec(at.latest)}`, note:`based on your last AFT 2-mile time — not yet logged as a workout here`, tier:"aft-anchor"};
    }
    return computeTargetFallback(exArg, name, opts);
  }
  const last=s[s.length-1];
  const ex=last.ex;
  const lowerBetter=(ex.type==="dist")||(ex.type==="time" && /run|sprint|drag|sdc|200m/i.test(name));
  // ---- LAYOFF / DETRAINING (a missed week+ resets the starting point) ----
  // plan.html's own copy promises "come back lighter" after a missed week or
  // more — nothing enforced that. A plain flat-percentage reduction off the
  // last logged set, not a fitted decay curve: this isn't claiming to model
  // real detraining physiology, just refusing to hand back the same
  // progressive-overload target as if no time had passed. Short-circuits the
  // normal trend/stall math below since comparing across a real gap isn't a
  // meaningful "trend" anyway.
  const daysSinceLast=(Date.now()-last.ts)/864e5;
  if(daysSinceLast>=7){
    const layoffNote=` (${Math.floor(daysSinceLast)} days since your last logged set on this — easing back in, not picking up where you left off)`;
    if(ex.type==="reps"){
      const r=parseFloat(last.best.reps)||0, w=parseFloat(last.best.weight)||0;
      if(w>0){
        const w2=Math.max(5, Math.round((w*0.9)/5)*5);
        return {target:`${Math.max(1,r-2)} reps × ${w2} lb (easing back in)`, hold:true, layoff:true, tier:"adaptive", note:"missed a week or more — dropped the load a notch"+layoffNote};
      }
      return {target:`${Math.max(1,r-2)} reps (easing back in)`, hold:true, layoff:true, tier:"adaptive", note:"missed a week or more — fewer reps, more left in the tank"+layoffNote};
    }
    if(ex.type==="time"){
      const sec=parseTime(last.best.time)||parseFloat(last.best.time)||0;
      if(lowerBetter) return {target:`${fmtSec(Math.round(sec*1.1))} (easing back in)`, hold:true, layoff:true, tier:"adaptive", note:"missed a week or more — pace it, don't chase your old time yet"+layoffNote};
      return {target:`${fmtSec(Math.max(10,Math.round(sec*0.85)))} (easing back in)`, hold:true, layoff:true, tier:"adaptive", note:"missed a week or more — shorter hold, rebuild from here"+layoffNote};
    }
    if(ex.type==="dist") return {target:`log distance + time (easing back in)`, layoff:true, tier:"adaptive", note:"missed a week or more — go easier than your last effort"+layoffNote};
  }
  // session trend over last up-to-3 entries
  let trend="first";
  if(s.length>=2){
    const a=s[s.length-1].vol, b=s[s.length-2].vol;
    const better=lowerBetter? a<b-0.01 : a>b+0.01;
    const worse =lowerBetter? a>b+0.01 : a<b-0.01;
    trend=better?"up":worse?"down":"flat";
  }
  let stalled=false;
  if(s.length>=3){
    const v=[s[s.length-3].vol,s[s.length-2].vol,s[s.length-1].vol];
    stalled = lowerBetter ? !(v[2]<v[0]) : !(v[2]>v[0]);
  }
  // ---- BASELINE BLENDING ----
  const bt=baselineTrend(baselineKeyFor(name));
  let baselineNote="";
  if(bt){
    // is the latest baseline month-over-month improving?
    if(bt.prevVol!=null){
      const blBetter = bt.def.lowerBetter ? bt.latestVol<bt.prevVol-0.01 : bt.latestVol>bt.prevVol+0.01;
      const blWorse  = bt.def.lowerBetter ? bt.latestVol>bt.prevVol+0.01 : bt.latestVol<bt.prevVol-0.01;
      if(blBetter){
        // baseline says you're stronger — override a false "stall" and push
        if(stalled||trend==="flat"||trend==="down"){ stalled=false; trend="up"; baselineNote=" (baseline up this month — keep climbing)"; }
        else baselineNote=" (baseline confirms progress)";
      } else if(blWorse || (!blBetter && !blWorse)){
        // baseline flat or down confirms a real stall
        if(stalled||trend==="flat") baselineNote = blWorse?" (baseline also down — reset & rebuild)":" (baseline flat — change the stimulus)";
      }
    } else {
      baselineNote=" (anchored to this month's baseline)";
    }
  }
  // ---- AFT BLENDING (same corroborating-signal pattern as baseline blending) ----
  const at=aftTrendFor(name);
  if(at){
    if(at.prev!=null){
      const aftBetter = at.lowerBetter ? at.latest<at.prev-0.01 : at.latest>at.prev+0.01;
      const aftWorse  = at.lowerBetter ? at.latest>at.prev+0.01 : at.latest<at.prev-0.01;
      if(aftBetter){
        if(stalled||trend==="flat"||trend==="down"){ stalled=false; trend="up"; baselineNote+=" (your last AFT also improved on this event — keep climbing)"; }
        else baselineNote+=" (your last AFT confirms progress on this event)";
      } else if(aftWorse && (stalled||trend==="flat")){
        baselineNote+=" (your last AFT also dropped on this event)";
      }
    } else {
      baselineNote+=` (last real AFT on this event: ${at.key==="dl"?at.latest+" lb":at.key==="hrp"?at.latest+" reps":fmtSec(at.latest)})`;
    }
  }
  // ---- EFFORT / REDUCED SIGNAL (FM-Adapt) ----
  // A plain rule applied to what you actually told us last time, not a fitted
  // model — stays honest with a single data point since it's not claiming to
  // have "learned" a pattern, just repeating your own most recent rating back.
  // Effort is a 1-10 RPE scale (1 = very easy, 10 = max effort); only the two
  // clearest bands move anything: 8+ or had to cut a set short forces a hold
  // (safety/injury-reduction first); 3 or under nudges a flat/first trend up
  // a notch. Silent when nothing was rated — this never invents a signal you
  // didn't give it.
  let diffNote="";
  const hardSignal = last.reduced || (last.effort!=null && last.effort>=8) || (last.sessionRpe!=null && last.sessionRpe>=9);
  const easySignal = !hardSignal && ((last.effort!=null && last.effort<=3) || (last.sessionRpe!=null && last.sessionRpe<=6));
  if(hardSignal && trend!=="down"){
    stalled=true; trend="down";
    diffNote = last.reduced ? " (you had to cut it short last time — hold here)"
      : last.effort!=null ? ` (rated ${last.effort}/10 effort last time — hold here)`
      : ` (RPE ${last.sessionRpe} last session — hold here)`;
  } else if(easySignal && (trend==="flat"||trend==="first")){
    trend="up";
    diffNote = last.effort!=null ? ` (rated ${last.effort}/10 effort last time — pushing a bit more)` : " (low RPE last session — pushing a bit more)";
  }
  baselineNote = baselineNote + diffNote;
  // build target string
  if(ex.type==="reps"){
    const r=parseFloat(last.best.reps)||0; const w=parseFloat(last.best.weight)||0;
    if(w>0){
      if(trend==="down"||stalled) return {target:`${r} reps × ${w} lb (hold & nail form)`, hold:true, tier:"adaptive", note:(stalled?"stalled — deload slightly or fix technique before adding":"dropped last time — repeat it clean")+baselineNote};
      if(r>=10) return {target:`${r-2} reps × ${w+5} lb`, tier:"adaptive", note:"add weight, reset reps"+baselineNote};
      return {target:`${r+1} reps × ${w} lb`, tier:"adaptive", note:"add a rep"+baselineNote};
    } else {
      if(trend==="down"||stalled) return {target:`${r} reps (hold)`, hold:true, tier:"adaptive", note:(stalled?"stalled — try slower tempo or a harder variation":"dropped — repeat it")+baselineNote};
      return {target:`${r+2} reps`, tier:"adaptive", note:"+2 reps"+baselineNote};
    }
  }
  if(ex.type==="time"){
    const sec=parseTime(last.best.time)||parseFloat(last.best.time)||0;
    if(lowerBetter){
      if(trend==="down"||stalled) return {target:`${fmtSec(sec)} (hold)`, hold:true, tier:"adaptive", note:(stalled?"not getting faster — add a focused speed session":"slower last time — repeat & beat it")+baselineNote};
      return {target:`beat ${fmtSec(sec)}`, tier:"adaptive", note:"shave a few seconds"+baselineNote};
    } else {
      if(trend==="down"||stalled) return {target:`${fmtSec(sec)} (hold)`, hold:true, tier:"adaptive", note:(stalled?"plateaued — add side planks / hollow holds":"dropped — repeat it")+baselineNote};
      return {target:`${fmtSec(sec+10)}`, tier:"adaptive", note:"+10 sec"+baselineNote};
    }
  }
  if(ex.type==="dist"){
    return {target:`log distance + time`, tier:"adaptive", note:(trend==="up"?"trending faster — keep pushing":trend==="down"?"slower last run — focus the next one":"build consistency")+baselineNote};
  }
  return computeTargetFallback(exArg, name, opts);
}
// Tiers 3 ("starter") and 4 ("generic") — reached only when tiers 1-2 (above)
// found nothing AND the caller opted in via `opts` (see computeTarget's own
// header comment for why bare callers must not reach these unconditionally).
function computeTargetFallback(exArg, name, opts){
  // Tier "starter": no logged/AFT history, but a BEGINNER_RX row exists for
  // this session. Reuses the same word-overlap matcher FM-3 already uses
  // (cgFindRxRow) instead of a second lookup style. Weighted rows get nudged
  // by the user's own AFT fitness level (aftFitnessMultiplier, aft-scoring.js)
  // — a plain, honest, single multiplier reused from the app's existing
  // 300/350 standard bands, never a per-exercise invented formula.
  const phase=typeof exArg==="object" && exArg ? exArg._phase : null;
  const isWarmCool=phase==="warmup"||phase==="cooldown"||phase==="flex";
  if(!isWarmCool && opts.skey && typeof BEGINNER_RX!=="undefined" && typeof cgFindRxRow==="function"){
    const rx=BEGINNER_RX[opts.skey];
    // A session's work list mixes bodyweight-only accessory moves (glute
    // bridge, hollow-body hold) with gym-equipment lifts even on a gym day —
    // SESSIONS doesn't swap every exercise wholesale. So on a rich/gym day,
    // check both lists (gym first) rather than only rx.gym, or bodyweight
    // accessories with no gym row of their own silently lose their starter
    // number and fall through to vague generic effort text instead.
    const rows=rx?(opts.rich?(rx.gym||[]).concat(rx.bw||[]):(rx.bw||[]).concat(rx.gym||[])):null;
    const row=rows?cgFindRxRow(rows,name):null;
    if(row){
      let weightNote="";
      let weightOut=row.weight;
      const m=typeof row.weight==="string"?row.weight.match(/^(\d+(?:\.\d+)?)(.*)$/):null;
      if(m && typeof aftFitnessMultiplier==="function"){
        const mult=aftFitnessMultiplier();
        if(mult!==1){
          const scaled=Math.round((parseFloat(m[1])*mult)/5)*5;
          if(scaled!==parseFloat(m[1])){ weightOut=`${scaled}${m[2]}`; weightNote=" · nudged for your AFT level"; }
        }
      }
      // Leads with reps (not sets) to match the adaptive tier's target-string
      // convention ("14 reps", "3 reps × 15 lb") — cgSlotVolume() derives
      // card-game's rep count from this string's LEADING number, so a
      // sets-first format would silently hand it the sets count instead.
      const target=`${row.reps}`+(weightOut?` @ ${weightOut}`:"")+` × ${row.sets} sets`+(row.rest?` (rest ${row.rest})`:"");
      return {target, note:"beginner starting point"+weightNote, tier:"starter", sets:row.sets, reps:row.reps, rest:row.rest};
    }
  }
  // Tier "generic": no history, no AFT anchor, no BEGINNER_RX row (a fully
  // custom/off-plan exercise). The old prescriptionFor() intensity-based
  // prose, moved here so every call site shares one fallback instead of
  // training.js keeping an independent copy.
  if(opts.intensity && typeof exArg==="object" && exArg){
    const t=exArg.type||exArg.t;
    // Warm-up/cool-down/flex movements are prep, not a graded work set —
    // the intensity-based strength prose below ("leave 1-2 reps in the
    // tank", "3 sets") is actively wrong here (nobody grades effort on a
    // leg swing). Most STRETCH_LIBRARY names already carry their own real
    // rep/hold spec in a trailing "(...)" (e.g. "(10/leg)", "(hold 30s
    // ×2/side)") — surface that as the real target instead of vague copy.
    // Require a digit inside the parens so descriptive asides (e.g. "(don't
    // hold stretches cold yet)") aren't mistaken for a spec.
    if(isWarmCool){
      const m=/\(([^()]*\d[^()]*)\)\s*$/.exec(exArg.n||"");
      const qualifier=phase==="warmup"?"easy and controlled":"relaxed, breathe through it";
      return {target: m?`${m[1]} — ${qualifier}`:qualifier, note:null, tier:"generic"};
    }
    let base="as prescribed";
    if(opts.intensity==="hard"){
      if(t==="reps") base="3–4 sets, leave 1–2 reps in the tank";
      else if(t==="time") base="3 sets, push the hold/effort";
      else if(t==="dist") base="main effort — see the session note for distance/pace";
    } else if(opts.intensity==="moderate"){
      if(t==="reps") base="2–3 sets, controlled";
      else if(t==="time") base="2–3 sets, steady";
      else if(t==="dist") base="easy–tempo pace, conversational";
    } else {
      if(t==="reps") base="1–2 easy sets, focus on form";
      else if(t==="time") base="hold as prescribed, relaxed";
      else if(t==="dist") base="easy pace only";
    }
    if(t==="reps" && exArg.w) base+=" · no logged weight yet — start conservative and find a load where the last 1–2 reps are genuinely hard";
    return {target:base, note:null, tier:"generic"};
  }
  return null;
}
function fmtSec(s){s=Math.round(s);const m=Math.floor(s/60);const r=s%60;return m>0?`${m}:${String(r).padStart(2,'0')}`:`${r}s`;}

const AREA_LABEL={legs:"legs",push:"push (chest/shoulders)",pull:"pull (back)",core:"core",cardio:"cardio/running"};
// Reads every Physical leaf skill, finds laggards vs strengths, and builds whole-body guidance.
