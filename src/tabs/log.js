let LG=null; // current draft {session, exercises:[{name,type,w,sets:[...]}]}
function initLogTab(){
  const sel=document.getElementById("lgSession");
  if(!sel) return;
  if(!sel.options.length){
    sel.innerHTML=Object.keys(SESSIONS).map(k=>`<option value="${k}">${SESSIONS[k].name}</option>`).join("");
    sel.onchange=()=>buildLogForm(sel.value);
  }
  if(!LG) buildLogForm(sel.value);
}
function buildLogForm(skey){
  const s=SESSIONS[skey];
  LG={session:skey, exercises:sessionEx(skey).map(e=>({name:e.n,type:e.t,w:!!e.w,custom:!!e.custom,sets:[blankSet(e.t)]}))};
  renderLogForm();
}
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
  const f=e.target.dataset.f;
  if(f){const[xi,si,field]=f.split(".");LG.exercises[xi].sets[si][field]=e.target.value;return;}
  const cn=e.target.dataset.cn;
  if(cn!=null){LG.exercises[cn].name=e.target.value;}
});
document.addEventListener("click",e=>{
  const add=e.target.dataset.addset;
  if(add!=null){const ex=LG.exercises[add];ex.sets.push(blankSet(ex.type));renderLogForm();return;}
  const rm=e.target.dataset.rm;
  if(rm!=null){const[xi,si]=rm.split(".");LG.exercises[xi].sets.splice(si,1);renderLogForm();return;}
  const dw=e.target.dataset.delw;
  if(dw!=null){if(confirm("Delete this workout?")){S.workouts=S.workouts.filter(w=>w.id!==dw);save();renderLog();}return;}
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
  const rpe=parseInt(document.getElementById("lgRpe").value)||null;
  // keep only exercises with at least one filled set
  const exercises=LG.exercises.map(ex=>({
    name:ex.name, type:ex.type, w:ex.w,
    sets:ex.sets.filter(st=>setHasData(ex,st))
  })).filter(ex=>ex.sets.length>0 && ex.name && ex.name!=="Custom exercise");
  if(!exercises.length){toast("Log at least one set first");return;}
  const note=document.getElementById("lgNote").value.trim()||null;
  S.workouts.push({id:id(), date:new Date().toLocaleDateString(), ts:Date.now(), session:LG.session, duration:dur, rpe, exercises, note});
  if(!S.pathXP) S.pathXP={};
  S.pathXP.physical=(S.pathXP.physical||0)+25; S.gold+=8; S.totalDone++;
  save();
  document.getElementById("lgDur").value="";
  document.getElementById("lgRpe").value="";
  document.getElementById("lgNote").value="";
  buildLogForm(document.getElementById("lgSession").value);
  render();
  toast(`<span class="t-xp">Workout logged · +25 Fitness XP +8 pts</span>`);
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
    return `<div class="pt-recent-row"><span>${p.date} · <span class="areas">${what}</span> · ${p.intensity}</span><button class="del" data-dpt="${p.id}">✕</button></div>`;
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
// recovery load per area over the last N days, intensity-weighted & decaying
function recoveryLoad(){
  const now=Date.now(), W={light:1,moderate:2,hard:3};
  const load={legs:0,push:0,pull:0,core:0,cardio:0};
  S.ptLog.forEach(p=>{
    const ageDays=(now-p.ts)/864e5;
    if(ageDays>4) return;
    const decay=Math.max(0,1-ageDays/4);
    (p.areas||[]).forEach(k=>{ if(load[k]!=null) load[k]+=(W[p.intensity]||2)*decay; });
  });
  return load;
}
function savePT(){
  const eff=ptEffectiveAreas();
  const text=document.getElementById("ptText").value.trim();
  if(eff.size===0){toast("Type what PT did, or tap at least one area");return;}
  const intensity=document.getElementById("ptIntensity").value;
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
      out.push({ts:w.ts,ex,best,vol:setVolume(ex,best)});
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
  if(/2-?mile|long easy|tempo|interval/.test(n)) return "run_2mi";
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

function computeTarget(name){
  const s=exerciseSeries(name);
  if(!s.length) return null;
  const last=s[s.length-1];
  const ex=last.ex;
  const lowerBetter=(ex.type==="dist")||(ex.type==="time" && /run|sprint|drag|sdc|200m/i.test(name));
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
  // build target string
  if(ex.type==="reps"){
    const r=parseFloat(last.best.reps)||0; const w=parseFloat(last.best.weight)||0;
    if(w>0){
      if(trend==="down"||stalled) return {target:`${r} reps × ${w} lb (hold & nail form)`, hold:true, note:(stalled?"stalled — deload slightly or fix technique before adding":"dropped last time — repeat it clean")+baselineNote};
      if(r>=10) return {target:`${r-2} reps × ${w+5} lb`, note:"add weight, reset reps"+baselineNote};
      return {target:`${r+1} reps × ${w} lb`, note:"add a rep"+baselineNote};
    } else {
      if(trend==="down"||stalled) return {target:`${r} reps (hold)`, hold:true, note:(stalled?"stalled — try slower tempo or a harder variation":"dropped — repeat it")+baselineNote};
      return {target:`${r+2} reps`, note:"+2 reps"+baselineNote};
    }
  }
  if(ex.type==="time"){
    const sec=parseTime(last.best.time)||parseFloat(last.best.time)||0;
    if(lowerBetter){
      if(trend==="down"||stalled) return {target:`${fmtSec(sec)} (hold)`, hold:true, note:(stalled?"not getting faster — add a focused speed session":"slower last time — repeat & beat it")+baselineNote};
      return {target:`beat ${fmtSec(sec)}`, note:"shave a few seconds"+baselineNote};
    } else {
      if(trend==="down"||stalled) return {target:`${fmtSec(sec)} (hold)`, hold:true, note:(stalled?"plateaued — add side planks / hollow holds":"dropped — repeat it")+baselineNote};
      return {target:`${fmtSec(sec+10)}`, note:"+10 sec"+baselineNote};
    }
  }
  if(ex.type==="dist"){
    return {target:`log distance + time`, note:(trend==="up"?"trending faster — keep pushing":trend==="down"?"slower last run — focus the next one":"build consistency")+baselineNote};
  }
  return null;
}
function fmtSec(s){s=Math.round(s);const m=Math.floor(s/60);const r=s%60;return m>0?`${m}:${String(r).padStart(2,'0')}`:`${r}s`;}

function renderAdaptiveTargets(){
  const el=document.getElementById("adaptiveTargets");
  if(!el) return;
  // unique exercise names from the log
  const names=[...new Set((S.workouts||[]).flatMap(w=>(w.exercises||[]).map(e=>e.name)))];
  if(!names.length){
    el.innerHTML=`<div class="adapt-card"><h3>🎯 Adaptive Targets</h3><div class="adapt-empty">Log a few workouts (Log tab) and personalized next-session targets will appear here, auto-adjusting to your progress — pushing you when you're improving, holding when you've stalled.</div></div>`;
    return;
  }
  const rows=names.map(n=>{
    const t=computeTarget(n);
    if(!t) return "";
    return `<div class="adapt-row"><div class="adapt-ex"><div class="nm">${esc(n)}</div><div class="note">${esc(t.note||"")}</div></div><div class="adapt-tgt ${t.hold?'hold':''}">${esc(t.target)}</div></div>`;
  }).filter(Boolean).join("");
  el.innerHTML=`<div class="adapt-card">
    <h3>🎯 Your Next-Session Targets</h3>
    <div class="adapt-sub">Auto-calculated from your workout log. Green = push harder; amber = hold/fix before adding. Beat these and they climb.</div>
    ${rows}
  </div>`;
}

const AREA_LABEL={legs:"legs",push:"push (chest/shoulders)",pull:"pull (back)",core:"core",cardio:"cardio/running"};
// Reads every Physical leaf skill, finds laggards vs strengths, and builds whole-body guidance.
