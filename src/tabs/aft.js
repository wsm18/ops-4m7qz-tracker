function aftPrCard(){
  const entries=S.aft||[]; if(!entries.length) return "";
  const last=entries[entries.length-1];
  let bestDl=null,bestHrp=null,bestSdc=null,bestPlank=null,bestRun=null,bestTotal=null;
  entries.forEach(a=>{
    if(a.raw.dl!=null&&(bestDl===null||a.raw.dl>bestDl.v)) bestDl={v:a.raw.dl,date:a.date,a};
    if(a.raw.hrp!=null&&(bestHrp===null||a.raw.hrp>bestHrp.v)) bestHrp={v:a.raw.hrp,date:a.date,a};
    if(a.raw.sdc!=null&&(bestSdc===null||a.raw.sdc<bestSdc.v)) bestSdc={v:a.raw.sdc,date:a.date,a};
    if(a.raw.plank!=null&&(bestPlank===null||a.raw.plank>bestPlank.v)) bestPlank={v:a.raw.plank,date:a.date,a};
    if(a.raw.run!=null&&(bestRun===null||a.raw.run<bestRun.v)) bestRun={v:a.raw.run,date:a.date,a};
    if(bestTotal===null||a.total>bestTotal.v) bestTotal={v:a.total,date:a.date,a};
  });
  const rows=[
    bestDl   &&{label:"Deadlift",  val:`${bestDl.v} lb`,    date:bestDl.date,   cur:bestDl.a===last},
    bestHrp  &&{label:"Push-ups",  val:`${bestHrp.v} reps`, date:bestHrp.date,  cur:bestHrp.a===last},
    bestSdc  &&{label:"SDC",       val:fmtSec(bestSdc.v),   date:bestSdc.date,  cur:bestSdc.a===last},
    bestPlank&&{label:"Plank",     val:fmtSec(bestPlank.v), date:bestPlank.date,cur:bestPlank.a===last},
    bestRun  &&{label:"2-Mile",    val:fmtSec(bestRun.v),   date:bestRun.date,  cur:bestRun.a===last},
    bestTotal&&{label:"Total",     val:`${bestTotal.v} pts`,date:bestTotal.date,cur:bestTotal.a===last},
  ].filter(Boolean);
  if(!rows.length) return "";
  return `<div class="aft-pr-card">
    <div class="pr-title">🏅 Personal Records</div>
    ${rows.map(r=>`<div class="pr-row"><span class="pr-label">${r.label}</span><span class="pr-val">${r.val}${r.cur?' <span class="pr-star">⭐</span>':''}</span><span class="pr-date">${r.date}</span></div>`).join("")}
  </div>`;
}
function aftPrepCard(){
  if(!S.aftTestDate) return "";
  const last=(S.aft||[])[S.aft.length-1]; if(!last) return "";
  const days=Math.ceil((new Date(S.aftTestDate+"T12:00:00")-Date.now())/864e5);
  if(days<0) return "";
  const c=aftCtx();
  const minTotal=c.standard==="combat"?350:300;
  const gap=minTotal-last.total;
  let gapHtml;
  if(gap>0){
    const events=[
      {k:"dl",label:"Deadlift",s:last.scores.dl},
      {k:"hrp",label:"Push-ups",s:last.scores.hrp},
      {k:"sdc",label:"SDC",s:last.scores.sdc},
      {k:"plank",label:"Plank",s:last.scores.plank},
      {k:"run",label:"2-Mile Run",s:last.scores.run},
    ].filter(e=>e.s!=null).sort((a,b)=>a.s-b.s);
    const minPer=c.standard==="combat"?70:60;
    const focus=events.slice(0,2).map(e=>{
      const eg=Math.max(0,minPer-e.s);
      return eg>0?`${e.label} (+${eg} to floor)`:e.label;
    });
    gapHtml=`<div class="prep-gap">Need <b>${gap} more pts</b> to hit ${minTotal}. Focus: ${focus.join(" · ")}</div>`;
  } else {
    gapHtml=`<div class="prep-gap ok">✅ Currently at ${last.total} — meeting ${minTotal}-pt standard. Keep pushing.</div>`;
  }
  const dayColor=days<=14?"var(--ember)":days<=30?"var(--gold)":"var(--jade)";
  return `<div class="aft-prep-card">
    <div class="prep-top"><span class="prep-countdown" style="color:${dayColor}">⏳ ${days===0?"Test day!":days+" day"+(days!==1?"s":"")} to test</span><span class="prep-date">· ${S.aftTestDate}</span></div>
    ${gapHtml}
  </div>`;
}
function aftRegressionCard(){
  const entries=S.aft||[]; if(entries.length<2) return "";
  const last=entries[entries.length-1];
  const prev=entries[entries.length-2];
  const diff=last.total-prev.total;
  if(diff>-5) return ""; // only flag drops >= 5 pts
  const evts=[
    {k:"dl",label:"Deadlift"},{k:"hrp",label:"Push-ups"},
    {k:"sdc",label:"SDC"},{k:"plank",label:"Plank"},{k:"run",label:"2-Mile"},
  ];
  const dropped=evts.filter(e=>last.scores[e.k]!=null&&prev.scores[e.k]!=null&&last.scores[e.k]<prev.scores[e.k]-2);
  const held=evts.filter(e=>last.scores[e.k]!=null&&prev.scores[e.k]!=null&&Math.abs(last.scores[e.k]-prev.scores[e.k])<=2);
  return `<div class="aft-regress">
    <div class="aft-regress-h">▼ ${Math.abs(diff)} pts from last test (${prev.date})</div>
    ${dropped.length?`<div class="aft-regress-row drop">Dropped: ${dropped.map(e=>`${e.label} (${last.scores[e.k]-prev.scores[e.k]})`).join(' · ')}</div>`:''}
    ${held.length?`<div class="aft-regress-row ok">Held: ${held.map(e=>e.label).join(' · ')}</div>`:''}
    <div class="aft-regress-note">Address the dropped events before the next test — one focused block per event is enough to reverse a small regression.</div>
  </div>`;
}
function aftSparkline(){
  const entries=S.aft||[]; if(entries.length<2) return "";
  const vals=entries.map(a=>a.total);
  const W=280,H=60,PAD=6;
  const mn=Math.min(...vals,270),mx=Math.max(...vals,350);
  const rng=(mx-mn)||1;
  const cx=i=>PAD+Math.round((i/(vals.length-1))*(W-PAD*2));
  const cy=v=>H-PAD-Math.round(((v-mn)/rng)*(H-PAD*2));
  const pts=vals.map((v,i)=>`${cx(i)},${cy(v)}`).join(" ");
  const lastVal=vals[vals.length-1];
  const color=lastVal>=350?"var(--jade)":lastVal>=300?"var(--gold)":"var(--ember)";
  const ty=cy(300);
  const lines=[300,350].filter(t=>t>=mn&&t<=mx).map(t=>{
    const y=cy(t);
    return `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="var(--ink-faint)" stroke-width="1" stroke-dasharray="4,3"/>
    <text x="${W-PAD+2}" y="${y+3}" font-size="8" fill="var(--ink-faint)">${t}</text>`;
  }).join("");
  return `<div class="aft-spark"><svg viewBox="0 0 ${W+16} ${H}" style="width:100%;height:${H}px">
    ${lines}
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
    ${vals.map((v,i)=>`<circle cx="${cx(i)}" cy="${cy(v)}" r="3" fill="${color}"/>`).join("")}
  </svg></div>`;
}
function renderAftStandardBar(){
  const el=document.getElementById("aftStandardBar"); if(!el) return;
  const c=aftCtx();
  const minTotal=c.standard==="combat"?350:300;
  const last=S.aft[S.aft.length-1];
  const ageStr = c.age!=null ? `age ${c.age} · band ${aftAgeBracket(c.age)}` : `<span style="color:var(--ember)">set birthdate in Profile</span>`;
  const sexStr = c.standard==="combat" ? "sex-neutral" : (c.sex==="f"?"female-normed":c.sex==="m"?"male-normed":"set sex in Profile");
  let passLine="";
  if(last){
    const sc=last.scores; const vals=[sc.dl,sc.hrp,sc.sdc,sc.plank,sc.run].filter(v=>v!=null);
    const anyFail=vals.some(v=>v<60); const total=last.total;
    const pass = !anyFail && total>=minTotal;
    passLine=`<div class="std-pass ${pass?'ok':'no'}">${pass?'✅ Meets':'❌ Below'} ${c.standard==="combat"?"Combat":"General"} standard — ${total}/${minTotal} total${anyFail?", an event is under 60":""}</div>`;
  }
  el.innerHTML=`<div class="std-card">
    <div class="std-row">
      <span class="std-label">Standard</span>
      <div class="std-toggle">
        <button data-aftstd="general" class="${c.standard==='general'?'on':''}">General · 300</button>
        <button data-aftstd="combat" class="${c.standard==='combat'?'on':''}">Combat · 350</button>
      </div>
    </div>
    <div class="std-ctx">${ageStr} · ${sexStr}</div>
    ${passLine}
    <div class="std-note">Scored from the official AFT tables (HQDA EXORD 218-25, Annex B, eff 1 Jun 2025). Cyber (17-series) is general/enabling, so General is the default; switch to Combat if your role requires it.</div>
  </div>`;
}
function renderAftGoal(el){
  if(!el) return;
  const last=S.aft&&S.aft.length?S.aft[S.aft.length-1]:null;
  const current=last?last.total:null;
  const goal=S.aftGoal||null;
  const gap=goal&&current!==null?goal-current:null;
  const pct=goal&&current!==null?Math.min(100,Math.round(current/goal*100)):null;
  const gapStr=gap!==null?(gap>0?`${gap} pts to go`:(gap===0?'Goal reached!':`${Math.abs(gap)} pts over goal`)):'';
  const barFill=pct!==null?`<div class="aft-goal-fill" style="width:${pct}%"></div>`:'';
  const barGoalLine=goal?`<div class="aft-goal-line" title="Goal: ${goal}" style="left:100%"></div>`:'';
  el.innerHTML=`<div class="aft-goal-row">
    <label class="aft-goal-lbl">AFT Score Goal</label>
    <input class="aft-goal-inp" id="aftGoalInp" type="number" min="0" max="600" step="5" placeholder="e.g. 450" value="${goal||''}">
    <button class="aft-goal-set-btn" id="aftGoalSetBtn">Set</button>
    ${goal?`<span class="aft-goal-clear" id="aftGoalClear" title="Clear goal">✕</span>`:''}
  </div>
  ${goal&&current!==null?`<div class="aft-goal-progress">
    <div class="aft-goal-bar">${barFill}${barGoalLine}</div>
    <div class="aft-goal-gap">${current} / ${goal} — ${gapStr}</div>
  </div>`:''}`;
  document.getElementById("aftGoalSetBtn").onclick=()=>{
    const v=parseInt((document.getElementById("aftGoalInp")||{}).value)||null;
    S.aftGoal=v&&v>0?v:null; save(); renderAft();
  };
  const clr=document.getElementById("aftGoalClear");
  if(clr) clr.onclick=()=>{ S.aftGoal=null; save(); renderAft(); };
}
function renderAft(){
  const hist=document.getElementById("aftHistory");
  if(!hist) return;
  // wire test-date input
  const tdInput=document.getElementById("aftTestDateInput");
  if(tdInput){tdInput.value=S.aftTestDate||"";tdInput.onchange=()=>{S.aftTestDate=tdInput.value||null;save();renderAft();};}
  // target-setter collapsible — inject once after tdInput's parent, replacing any previous
  const _prevTgt=document.querySelector('.aft-target-set');
  if(_prevTgt) _prevTgt.remove();
  const tgtSetHtml=`<details class="aft-target-set"><summary style="font-size:12px;color:var(--ink-faint);cursor:pointer">Set event targets…</summary><div class="aft-target-grid">${["hrp","sdc","run","dl","plank"].map(k=>`<label class="aft-tgt-label">${k.toUpperCase()}<input class="aft-tgt-inp" data-afttgt="${k}" type="number" min="0" max="100" step="1" value="${(S.aftEventTargets&&S.aftEventTargets[k])||""}"></label>`).join("")}</div></details>`;
  if(tdInput&&tdInput.parentElement) tdInput.parentElement.insertAdjacentHTML("afterend",tgtSetHtml);
  // render prep card
  const prepEl=document.getElementById("aftPrepArea");
  if(prepEl) prepEl.innerHTML=aftPrepCard();
  renderAftStandardBar();
  if(!S.aft.length){hist.innerHTML=`<div class="empty"><span class="big">💪</span>No AFT logged yet. Enter your scores above.</div>`;}
  else{
    const rev=S.aft.slice().reverse();
    const prHtml=S.aft.length>=1?aftPrCard():"";
    const sparkHtml=S.aft.length>=2?aftSparkline():"";
    const regressHtml=S.aft.length>=2?aftRegressionCard():"";
    hist.innerHTML=prHtml+sparkHtml+regressHtml+rev.map((a,i)=>{
      const older=rev[i+1];
      let tr="";
      if(older){const d=a.total-older.total; tr=d>0?`<span style="color:var(--jade);font-size:12px"> ▲${d}</span>`:d<0?`<span style="color:var(--ember);font-size:12px"> ▼${Math.abs(d)}</span>`:`<span style="color:var(--ink-faint);font-size:12px"> —</span>`;}
      return `<div class="aft-hist-row"><span>${a.date}</span><span class="ttl">${a.total} pts${tr}</span></div>`;
    }).join("");
  }
  if(S.aft.length){ showAftResult(S.aft[S.aft.length-1]); }
  // AFT Goal setter
  const goalEl=document.getElementById("aftGoalWrap");
  if(goalEl) renderAftGoal(goalEl);
  // mini trend sparkline — insert before history element, replacing any previous one
  const _prevTrend=document.querySelector('.aft-trend-wrap');
  if(_prevTrend) _prevTrend.remove();
  const last7=(S.aft||[]).slice(-7);
  if(last7.length>=2){
    const svg=typeof miniSparkline==="function"?miniSparkline(last7.map(t=>t.total),200,44):"";
    if(svg) hist.insertAdjacentHTML("beforebegin",
      `<div class="aft-trend-wrap">${svg}<div class="aft-trend-range">${Math.min(...last7.map(t=>t.total))} – ${Math.max(...last7.map(t=>t.total))} pts</div></div>`
    );
  }
}
function fmFocusLine(){
  const a=(S.aft||[])[S.aft.length-1]; if(!a) return null;
  const events=[{k:"dl",label:"Deadlift",s:a.scores.dl},{k:"hrp",label:"push-ups",s:a.scores.hrp},{k:"sdc",label:"Sprint-Drag-Carry",s:a.scores.sdc},{k:"plank",label:"plank/core",s:a.scores.plank},{k:"run",label:"2-mile run",s:a.scores.run}].filter(e=>e.s!=null);
  if(!events.length) return null;
  const weakest=events.reduce((m,e)=>e.s<m.s?e:m,events[0]);
  return `Prioritize your ${weakest.label} (${weakest.s} pts) — it's your weakest AFT event right now.`;
}
// Recovery readiness from imported RHR/HRV vs your own baseline. Honest + directional only:
// returns {level:'ready'|'caution'|'easy'|null, line, detail} or null if not enough data.
function recoveryReadiness(){
  const hi=S.healthImport||{}; const hist=hi.history||[];
  if(hist.length<3) return null; // need a baseline of a few readings
  const latest=hist[hist.length-1];
  const prior=hist.slice(0,-1);
  const avg=(arr,key)=>{ const v=arr.map(h=>h[key]).filter(x=>x!=null); return v.length? v.reduce((a,b)=>a+b,0)/v.length : null; };
  const rhrBase=avg(prior,"rhr"), hrvBase=avg(prior,"hrv");
  let flags=[]; // negative = needs recovery
  if(latest.rhr!=null && rhrBase!=null){
    const d=latest.rhr-rhrBase;
    if(d>=5) flags.push({dir:-1, txt:`resting HR is ${Math.round(d)} bpm above your baseline`});
    else if(d<=-3) flags.push({dir:1, txt:`resting HR is below baseline (well-recovered)`});
  }
  if(latest.hrv!=null && hrvBase!=null){
    const pct=(latest.hrv-hrvBase)/hrvBase;
    if(pct<=-0.15) flags.push({dir:-1, txt:`HRV is ${Math.round(-pct*100)}% below your baseline`});
    else if(pct>=0.10) flags.push({dir:1, txt:`HRV is above baseline (well-recovered)`});
  }
  if(!flags.length) return {level:"ready", line:"Recovery markers look normal vs your baseline — train as planned.", detail:""};
  const neg=flags.filter(f=>f.dir<0), pos=flags.filter(f=>f.dir>0);
  if(neg.length>=2) return {level:"easy", line:"Recovery markers are down — consider an easier session or extra rest today.", detail:neg.map(f=>f.txt).join("; ")+"."};
  if(neg.length===1) return {level:"caution", line:"One recovery marker is off — train, but listen to your body and don't force a PR today.", detail:neg[0].txt+"."};
  return {level:"ready", line:"Recovery markers look strong — a good day to push.", detail:pos.map(f=>f.txt).join("; ")+"."};
}
// VO2 max -> aerobic fitness benchmark (general ACSM-style age/sex bands, directional)
function vo2Benchmark(){
  const hi=S.healthImport||{}; const v=hi.latest&&hi.latest.vo2max?hi.latest.vo2max.value:null;
  if(v==null) return null;
  const age=aftCtx&&aftCtx().age?aftCtx().age:20; const male=(S.profile.sex||"m")!=="f";
  // rough male/female under-30 bands; coarse but honest as a directional category
  let band;
  const m=male?[(30),(38),(45),(52)]:[(26),(33),(40),(46)];
  if(v<m[0]) band="below average"; else if(v<m[1]) band="average"; else if(v<m[2]) band="above average"; else if(v<m[3]) band="excellent"; else band="superior";
  return {v, band, line:`VO₂ max ${v} — ${band} aerobic fitness for your age. This is the engine behind your 2-mile run; steady zone-2 work plus intervals raises it over weeks.`};
}
const DRILL={
  hrp: gap=>gap>40?"3×max-effort HRP daily, rest 90s between sets":gap>20?"2×max-effort + 1×sub-max (75%) every session":"Maintain — one max set every 2 days",
  sdc: gap=>gap>30?"Add 2 practice SDC runs/week at race pace":"Maintain pace — add one rep-effort run/week",
  run: gap=>gap>40?"4×400m intervals 3×/week + one long easy run":"Tempo runs 2×/week — target pace at test intensity",
  dl:  gap=>gap>30?"3×5 DL at challenging weight, add 5 lbs weekly":"Maintain — 2×5 at current weight",
  plank:gap=>gap>30?"Plank 3×/day to max hold, add 5s each session":"One max hold daily, 5s progression every 3 days",
};
function showAftResult(a){
  const el=document.getElementById("aftResult");
  const prev = S.aft.length>1 ? S.aft[S.aft.indexOf(a)-1] : null;
  const events=[
    {k:"dl",label:"Deadlift",s:a.scores.dl},
    {k:"hrp",label:"Hand-Release Push-up",s:a.scores.hrp},
    {k:"sdc",label:"Sprint-Drag-Carry",s:a.scores.sdc},
    {k:"plank",label:"Plank",s:a.scores.plank},
    {k:"run",label:"2-Mile Run",s:a.scores.run},
  ].filter(e=>e.s!=null);
  if(!events.length){el.innerHTML="";return;}
  const weakest=events.reduce((m,e)=>e.s<m.s?e:m,events[0]);
  const failing=events.filter(e=>e.s<60);
  const nearMin=events.filter(e=>e.s>=60 && e.s<=65 && e.k!==weakest.k);
  // declining events vs previous test
  const declining=prev?events.filter(e=>prev.scores[e.k]!=null && e.s < prev.scores[e.k]-2):[];
  function trend(e){
    if(!prev||prev.scores[e.k]==null) return "";
    const d=e.s-prev.scores[e.k];
    if(d>2) return `<span class="aft-event-delta" style="color:var(--jade)">▲${d}</span>`;
    if(d<-2) return `<span class="aft-event-delta" style="color:var(--ember)">▼${Math.abs(d)}</span>`;
    return `<span class="aft-event-delta" style="color:var(--ink-faint)">—</span>`;
  }
  // build focus: primary weakest + any declining secondary
  let focus=EVENT_FOCUS[weakest.k];
  const secondary=declining.filter(e=>e.k!==weakest.k);
  if(secondary.length){
    focus+=` <br><br><b>Also watch:</b> ${secondary.map(e=>e.label).join(", ")} ${secondary.length>1?'are':'is'} trending down — ${secondary.map(e=>EVENT_FOCUS_SHORT[e.k]).join("; ")}.`;
  }
  const scoreCls=a.total>=350?'aft-score-pass':a.total>=300?'aft-score-pass':'aft-score-fail';
  const scoreLabel=a.total>=350?'✓ 350+ combat standard':a.total>=300?'✓ 300+ general standard':'✗ below 300 standard';
  el.innerHTML=`<div class="aft-result-card">
    <h3>Latest — ${a.date}</h3>
    <div class="aft-score-big">${a.total}<span class="${scoreCls}">${scoreLabel}</span></div>
    ${events.map(e=>{const gap=100-e.s; const drill=DRILL[e.k]?DRILL[e.k](gap):""; const tgt=S.aftEventTargets&&S.aftEventTargets[e.k]; const tgtHtml=tgt&&e.s!=null?`<span class="aft-tgt-gap" style="color:${e.s>=tgt?'var(--jade)':'var(--ember)'}">${e.s>=tgt?"✓ target":"↑ "+(tgt-e.s)+" to target"}</span>`:""; const evVals=S.aft.slice().sort((a,b)=>a.date<b.date?-1:1).map(a=>a.scores&&a.scores[e.k]||0).filter(v=>v>0); const evSpark=evVals.length>=2?`<span class="aft-event-spark">${miniSparkline(evVals,60,16)}</span>`:""; return `<div class="aft-event ${e.k===weakest.k?'weak':''}"><span>${e.label}${e.k===weakest.k?' ← weakest':''}</span><span class="ev-score">${e.s} pts${trend(e)}${e.s<60?' ⚠️':''}</span>${evSpark}${tgtHtml}${drill?`<div class="aft-drill">${drill}</div>`:''}</div>`;}).join("")}
    <div class="aft-focus">📍 <b>Plan focus:</b> ${focus} ${failing.length?`<br><br>⚠️ ${failing.length} event(s) below the 60-pt minimum — fix immediately to avoid a no-go.`:nearMin.length?`<br><br>⚠️ ${nearMin.map(e=>e.label).join(", ")} sitting near the 60-pt floor — keep a buffer.`:''}</div>
  </div>`;
}
const EVENT_FOCUS={
  dl:"Deadlift is your lowest event and the closest to the 60-pt floor — that's your standing risk. Run the equipment deadlift block (4×6) twice a week, add heavy carries, and push the load up steadily. Don't let this one fail you.",
  hrp:"Push-ups are the weak point. Daily grease-the-groove sets plus the Session-1 and Session-3 push-up volume; train to failure twice a week.",
  sdc:"Sprint-Drag-Carry needs work. Make Session 4 (the AFT circuit) twice a week — sprints, drags, and loaded carries for speed under load.",
  plank:"Plank is the weak link. 3× max-hold planks daily, progress side planks + hollow holds for core endurance.",
  run:"The 2-mile is your weakest. Make Session 2 the priority — add a third run some weeks (intervals, tempo, long easy).",
};
const EVENT_FOCUS_SHORT={
  dl:"add deadlift volume and grip work",
  hrp:"hold your push-up volume up",
  sdc:"hit the AFT circuit for speed under load",
  plank:"keep up daily max-hold planks",
  run:"add a weekly run",
};
document.getElementById("aftSave").onclick=()=>{
  const dl=parseInt(document.getElementById("aDl").value)||null;
  const hrp=parseInt(document.getElementById("aHrp").value)||null;
  const sdc=parseTime(document.getElementById("aSdc").value);
  const plank=parseTime(document.getElementById("aPlank").value);
  const run=parseTime(document.getElementById("aRun").value);
  if(dl==null&&hrp==null&&sdc==null&&plank==null&&run==null){toast("Enter at least one event score");return;}
  const scores={dl:score_dl(dl),hrp:score_hrp(hrp),sdc:score_sdc(sdc),plank:score_plank(plank),run:score_run(run)};
  const total=Object.values(scores).reduce((s,v)=>s+(v||0),0);
  const entry={date:new Date().toLocaleDateString(),raw:{dl,hrp,sdc,plank,run},scores,total};
  S.aft.push(entry);
  if(!S.pathXP) S.pathXP={};
  S.pathXP.physical=(S.pathXP.physical||0)+30;
  save();render();
  ["aDl","aHrp","aSdc","aPlank","aRun"].forEach(i=>document.getElementById(i).value="");
  toast(`<span class="t-xp">AFT logged: ${total} pts</span> · plan re-tuned`);
};
document.addEventListener("input",e=>{
  const k=e.target.dataset&&e.target.dataset.afttgt;
  if(k){if(!S.aftEventTargets)S.aftEventTargets={hrp:null,sdc:null,run:null,dl:null,plank:null};S.aftEventTargets[k]=parseInt(e.target.value)||null;save();}
});

/* ---------------- WORKOUT LOG ---------------- */
