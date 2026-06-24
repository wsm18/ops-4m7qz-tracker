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
  const modeTag=S.hasGym?"🏋️ Gym":(weatherBad()?`${WEATHER[(S.weather)||"clear"].icon} Indoor`:"🤸 Bodyweight");
  const exList=p.exercises.slice(0,sess.pickOne?4:7).map(e=>`<div class="ds-ex">${esc(e.n)}${e._swapped?' <span class="ds-swap">· indoor</span>':''}</div>`).join("");
  const more=p.exercises.length>(sess.pickOne?4:7)?`<div class="ds-ex ds-more">+${p.exercises.length-(sess.pickOne?4:7)} more</div>`:"";
  const action=p.todayLogged
    ? `<div class="ds-done">✓ Logged — well done.</div>`
    : `<button class="td-go ds-log-btn" data-gototab="log" data-logsess="${p.sessionKey}">Log this session →</button>`;
  return `<div class="dawn-sess">
    <div class="ds-top">
      <span class="ds-name">${esc(dayName)} · ${esc(sess.name.split("·").slice(-1)[0].trim())}</span>
      <span class="ds-badges">${intLabel} <span class="ds-mode">${modeTag}</span></span>
    </div>
    <div class="ds-exlist">${exList}${more}</div>
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
  const overall=fmtLvl(catRolledLevel("physical"));
  let lines=`<div class="recovery-line">Overall physical level: <b>${overall}</b> (average across every physical skill). The way up is to raise your lowest areas while holding your best.</div>`;
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
  el.innerHTML=`<div class="recovery-card balance"><h3>📊 Whole-body balance (from your skill levels)</h3>${lines}</div>`;
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
  el.innerHTML=`<div class="recovery-card"><h3>♻️ Recovery-aware (from your PT log)</h3>${lines}</div>`;
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
    const modeTag = S.hasGym ? "🏋️ Gym version" : (weatherBad()? `${WEATHER[(S.weather)||"clear"].icon} indoor (weather)` : "🤸 No-equipment");
    if(sess.pickOne){
      // ONE exercise per session (e.g. the run): pick today's variant, explain it fully.
      const idx=pickRunIndex(p.now);
      const e=p.exercises[idx] || p.exercises[0];
      const desc=exHowto(e.n);
      const rx=prescriptionFor(intensity, e);
      const otherNames=p.exercises.filter((_,i)=>i!==idx).map(x=>x.n.replace(/\s*\(.*$/,"").trim());
      tHtml=`<div class="coach-body">
        <div class="coach-day-h">${esc(dayName)} · ${esc(sess.name.split(" · ")[0])} <span class="coach-int">${intLabel}</span></div>
        <p class="coach-intro">${esc(p.dayPlan.label)}. <span class="coach-mode">${modeTag}</span> — this is a <b>pick-one</b> session: you do <b>one</b> run today, not all of them. Today's pick:</p>
        <ol class="coach-list" style="list-style:none;padding-left:0"><li>
          <div class="coach-ex-n"><b>👉 ${esc(e.n)}</b>${e._swapped?' <span class="sess-swap">· indoors for weather</span>':''}</div>
          ${desc?`<div class="coach-ex-how">${esc(desc)}</div>`:''}
          <div class="coach-ex-rx">${esc(rx)}</div>
        </li></ol>
        <p class="coach-tip">Why this one: the plan rotates your runs so you train different systems — a faster quality run midweek (intervals/tempo) and a longer or test run on the weekend. You don't need to choose; it rotates for you. Want a different one today? Any of these also counts: ${esc(otherNames.join(", "))}.</p>
        ${p.todayLogged?`<div class="coach-done">✓ Logged today — nice work.</div>`:`<button class="btn-add" id="coachLogBtn" data-sess="${p.sessionKey}">Log this run →</button>`}
      </div>`;
    } else {
      // ALL exercises, in order (strength / circuit days).
      const items=p.exercises.map((e,i)=>{
        const rx=prescriptionFor(intensity, e);
        const desc=exHowto(e.n);
        return `<li><div class="coach-ex-n"><b>${esc(e.n)}</b>${e.w?' <span class="sess-eq">· equipment</span>':''}${e._swapped?' <span class="sess-swap">· indoors for weather</span>':''}</div>${desc?`<div class="coach-ex-how">${esc(desc)}</div>`:''}<div class="coach-ex-rx">${esc(rx)}</div></li>`;
      }).join("");
      tHtml=`<div class="coach-body">
        <div class="coach-day-h">${esc(dayName)} · ${esc(sess.name.split(" · ")[0])} <span class="coach-int">${intLabel}</span></div>
        <p class="coach-intro">${esc(p.dayPlan.label)}. <span class="coach-mode">${modeTag}</span> — do <b>all of these, in order</b>${intensity==="hard"?", resting 60–90s between sets":""}. ${intensity==="hard"?"Warm up 5 min first; leave 1–2 reps in the tank.":intensity==="moderate"?"Keep the effort conversational.":"Move easy — this is for recovery."}</p>
        <ol class="coach-list">${items}</ol>
        ${p.todayLogged?`<div class="coach-done">✓ Logged today — nice work.</div>`:`<button class="btn-add" id="coachLogBtn" data-sess="${p.sessionKey}">Log this session →</button>`}
        <p class="coach-tip">Tap any exercise's name in the session list below for the full how-to, warm-up, and stretches.</p>
      </div>`;
    }
  }
  el.innerHTML=`<div class="coach-card"><div class="coach-h">📋 Today's orders</div>${yHtml}${tHtml}</div>`;
  const lb=document.getElementById("coachLogBtn");
  if(lb) lb.onclick=()=>{
    // jump to Log tab, preload today's session
    const nav=document.querySelector('#sideNav button[data-tab="log"]'); if(nav) nav.click();
    setTimeout(()=>{ const sel=document.getElementById("lgSession"); if(sel){ sel.value=lb.dataset.sess; if(sel.onchange) sel.onchange(); } }, 60);
  };
}

// Fill each session writeup's exercise list based on the equipment mode (S.hasGym).
function renderSessionLists(){
  // update the toggle button + subtitle
  const sub=document.getElementById("gymModeSub");
  const btn=document.getElementById("gymToggleBtn");
  const tgl=document.getElementById("gymToggle");
  if(sub) sub.textContent = S.hasGym ? "Gym — equipment versions of each session" : "No-equipment — bodyweight only (floor + wall)";
  if(btn) btn.textContent = S.hasGym ? "Switch to No-equipment" : "Switch to Gym";
  if(tgl) tgl.className = "gym-toggle"+(S.hasGym?" on":"");
  // weather picker
  const wp=document.getElementById("weatherBtns");
  const wsub=document.getElementById("weatherSub");
  const cur=(S.weather)||"clear";
  if(wp){
    wp.innerHTML=Object.keys(WEATHER).map(k=>`<button class="weather-b${k===cur?' on':''}" data-weather="${k}">${WEATHER[k].icon} ${esc(WEATHER[k].label)}</button>`).join("");
  }
  if(wsub){
    if(S.hasGym) wsub.textContent="Gym mode — weather doesn't matter (you're indoors)";
    else wsub.textContent = weatherBad() ? `${WEATHER[cur].icon} ${WEATHER[cur].label} — outdoor work swapped to indoor` : "Clear — outdoor runs as planned";
  }
  // fill each session's exercise container
  document.querySelectorAll(".sess-ex").forEach(div=>{
    const skey=div.getAttribute("data-sess");
    const list=sessionEx(skey);
    const swapped = !S.hasGym && weatherBad() && list.some(e=>e._swapped);
    const pickOne = SESSIONS[skey] && SESSIONS[skey].pickOne;
    const pickNote = pickOne ? `<div class="pickone-note">Pick <b>one</b> per run day — the plan rotates these for you.</div>` : "";
    div.innerHTML = `<div class="sess-ex-tag">${S.hasGym?"🏋️ Gym version":(swapped?`${WEATHER[(S.weather)||"clear"].icon} No-equipment · indoor (weather)`:"🤸 No-equipment version")}</div>${pickNote}<ul class="gl">${list.map(e=>`<li>${esc(e.n)}${e.w?' <span class="sess-eq">· equipment</span>':''}${e._swapped?` <span class="sess-swap">· indoors for weather</span>`:''}</li>`).join("")}</ul>`;
  });
}

/* ---------------- MONTHLY BASELINE ---------------- */
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
      return `<div class="bl-ex">
        <div class="bl-ex-name">${esc(def.name)}${last?`<div class="prev">last: ${esc(fmtBaselineVal(def,last))}</div>`:''}</div>
        <div class="units">${baselineInputs(def)}</div>
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

/* ---------------- BRANCH / BOARD PREP ---------------- */
