const _ptSave=document.getElementById("ptSave"); if(_ptSave) _ptSave.onclick=savePT;
/* ---------------- GPA Semester History ---------------- */
function renderGpaHistory(){
  const el=document.getElementById("pfGpaHistory"); if(!el) return;
  const gh=(S.gpaHistory||[]).slice().sort((a,b)=>b.term>a.term?1:-1);
  if(!gh.length){
    el.innerHTML=`<div style="color:var(--ink-faint);font-size:12px;padding:4px 0">No semesters logged yet.</div>`;
  } else {
    const vals=gh.map(g=>g.gpa);
    const sparkHtml=vals.length>=2?`<div class="wl-spark" style="margin-bottom:6px">${miniSparkline(vals.slice().reverse(),220,36)}</div>`:"";
    el.innerHTML=sparkHtml+gh.map((g,i)=>`<div class="gpa-history-row"><span class="gpa-term">${esc(g.term||"?")}</span><b style="min-width:36px">${g.gpa}</b>${g.hours?`<span style="color:var(--ink-faint);font-size:11.5px">${g.hours} hrs</span>`:""}${g.standing?`<span class="gpa-standing">${esc(g.standing)}</span>`:""}${g.note?`<span style="flex:1;color:var(--ink-faint);font-size:11px;overflow:hidden;text-overflow:ellipsis">${esc(g.note)}</span>`:"<span style='flex:1'></span>"}<button class="del" data-gpadel="${i}">✕</button></div>`).join("");
  }
  // sync pfGpa to most-recent entry
  const gpaEl=document.getElementById("pfGpa");
  if(gpaEl && gh.length && document.activeElement!==gpaEl) gpaEl.value=gh[0].gpa;
  renderGpaProjection();
}
function renderGpaProjection(){
  const el=document.getElementById("pfGpaProjection"); if(!el) return;
  const gh=(S.gpaHistory||[]).slice().sort((a,b)=>a.term<b.term?-1:1); // oldest first
  if(gh.length<2){ el.innerHTML=""; return; }
  // linear regression on semester index vs GPA
  const n=gh.length, xs=gh.map((_,i)=>i), ys=gh.map(g=>g.gpa);
  const sx=xs.reduce((a,v)=>a+v,0), sy=ys.reduce((a,v)=>a+v,0);
  const sxy=xs.reduce((a,v,i)=>a+v*ys[i],0), sx2=xs.reduce((a,v)=>a+v*v,0);
  const denom=n*sx2-sx*sx;
  if(!denom){ el.innerHTML=""; return; }
  const slope=(n*sxy-sx*sy)/denom, intercept=(sy-slope*sx)/n;
  const totalSemesters=8; // 4-year degree
  const remaining=Math.max(0, totalSemesters-n);
  if(!remaining){ el.innerHTML=""; return; }
  const projIdx=totalSemesters-1;
  const proj=Math.min(4.0, Math.max(0, slope*projIdx+intercept));
  const goal=parseFloat(S.profile&&S.profile.gpaGoal)||null;
  const aboveGoal=goal&&proj>=goal;
  const col=goal?(aboveGoal?"var(--jade)":"var(--ember)"):"var(--ink-dim)";
  const goalLine=goal?` · goal: ${goal.toFixed(2)}`:"";
  el.innerHTML=`<div class="gpa-projection"><span>Projected graduation GPA:</span> <b style="color:${col}">${proj.toFixed(2)}</b><span style="color:var(--ink-faint);font-size:11px"> (${remaining} semester${remaining!==1?"s":""} remaining${goalLine})</span></div>`;
}
{
  const gpaAdd=document.getElementById("gpaHistAdd");
  if(gpaAdd) gpaAdd.onclick=()=>{
    const term=(document.getElementById("gpaTermIn").value||"").trim(); if(!term){toast("Enter a term (e.g. SP2026)");return;}
    const gpa=parseFloat(document.getElementById("gpaGpaIn").value);
    if(isNaN(gpa)||gpa<0||gpa>4.0){toast("Enter a valid GPA (0–4.0)");return;}
    const hrs=parseFloat(document.getElementById("gpaHrsIn").value)||null;
    const standing=(document.getElementById("gpaStandingIn").value||"").trim();
    const note=(document.getElementById("gpaNoteIn").value||"").trim();
    if(!S.gpaHistory) S.gpaHistory=[];
    S.gpaHistory.push({id:id(),term,gpa:Math.round(gpa*1000)/1000,hours:hrs,standing:standing||undefined,note:note||undefined});
    // auto-update cumulative GPA to the most recent entry
    const sorted=S.gpaHistory.slice().sort((a,b)=>b.term>a.term?1:-1);
    S.profile.gpa=sorted[0].gpa;
    ["gpaTermIn","gpaGpaIn","gpaHrsIn","gpaStandingIn","gpaNoteIn"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
    save(); renderGpaHistory(); toast("📊 Semester GPA logged");
  };
  document.body.addEventListener("click",e=>{
    const gd=e.target.closest("[data-gpadel]");
    if(gd){ const i=parseInt(gd.dataset.gpadel); if(!S.gpaHistory) return; S.gpaHistory.splice(i,1);
      if(S.gpaHistory.length){ const sorted=S.gpaHistory.slice().sort((a,b)=>b.term>a.term?1:-1); S.profile.gpa=sorted[0].gpa; }
      save(); renderGpaHistory(); return; }
  });
}
/* ---------------- Language / Clearance ---------------- */
function renderLanguages(){
  const el=document.getElementById("pfLangs"); if(!el) return;
  const langs=(S.profile&&S.profile.languages)||[];
  el.innerHTML=langs.length?langs.map((l,i)=>`<div class="lang-item"><span>${esc(l.lang)}</span>${l.ilr?`<span class="ilr-badge">ILR ${esc(l.ilr)}</span>`:""}<span style="flex:1;color:var(--ink-faint);font-size:11.5px">${l.notes?esc(l.notes):""}</span><button class="del" data-langdel="${i}">✕</button></div>`).join(""):
    `<div style="color:var(--ink-faint);font-size:12px;padding:4px 0">No languages added yet.</div>`;
  const clr=(S.profile&&S.profile.clearance)||{};
  const clrLv=document.getElementById("pfClrLevel"); const clrDt=document.getElementById("pfClrDate"); const clrNt=document.getElementById("pfClrNotes");
  if(clrLv&&document.activeElement!==clrLv) clrLv.value=clr.level||"";
  if(clrDt&&document.activeElement!==clrDt) clrDt.value=clr.grantedDate||"";
  if(clrNt&&document.activeElement!==clrNt) clrNt.value=clr.notes||"";
}
{
  const langAdd=document.getElementById("pfLangAdd");
  if(langAdd) langAdd.onclick=()=>{
    const lang=(document.getElementById("pfLangName").value||"").trim(); if(!lang){toast("Enter a language name");return;}
    const ilr=document.getElementById("pfLangIlr").value||"";
    const notes=(document.getElementById("pfLangNotes").value||"").trim();
    if(!S.profile) S.profile={};
    if(!S.profile.languages) S.profile.languages=[];
    S.profile.languages.push({lang,ilr:ilr||undefined,notes:notes||undefined});
    ["pfLangName","pfLangNotes"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
    const il=document.getElementById("pfLangIlr"); if(il) il.value="";
    save(); renderLanguages(); toast("🌐 Language added");
  };
  const clrSave=document.getElementById("pfClrSave");
  if(clrSave) clrSave.onclick=()=>{
    if(!S.profile) S.profile={};
    if(!S.profile.clearance) S.profile.clearance={};
    S.profile.clearance.level=document.getElementById("pfClrLevel").value||null;
    S.profile.clearance.grantedDate=document.getElementById("pfClrDate").value||null;
    S.profile.clearance.notes=(document.getElementById("pfClrNotes").value||"").trim()||"";
    save(); renderLanguages(); toast("🔐 Clearance saved");
  };
  document.body.addEventListener("click",e=>{
    const ld=e.target.closest("[data-langdel]");
    if(ld){ const i=parseInt(ld.dataset.langdel); if(!S.profile||!S.profile.languages) return; S.profile.languages.splice(i,1); save(); renderLanguages(); return; }
  });
}
// Body & Lifts profile
function ageFromDob(dob){
  if(!dob) return null;
  const d=new Date(dob); if(isNaN(d)) return null;
  const now=new Date(); let a=now.getFullYear()-d.getFullYear();
  const m=now.getMonth()-d.getMonth();
  if(m<0||(m===0&&now.getDate()<d.getDate())) a--;
  return a>=0&&a<130?a:null;
}
function fmtMeasDate(ds){
  if(!ds) return "";
  const d=new Date(ds); if(isNaN(d)) return "";
  const days=Math.floor((Date.now()-d)/864e5);
  const ago = days<=0?"today" : days===1?"1 day ago" : days<60?days+" days ago" : Math.round(days/30)+" months ago";
  return d.toLocaleDateString()+" ("+ago+")";
}
function renderMilestones(){
  const el=document.getElementById("pfMilestones"); if(!el) return;
  const ms=S.milestones||[];
  if(!ms.length){ el.innerHTML=`<div style="font-size:12px;color:var(--ink-faint);margin-bottom:6px">No milestones added yet. Add key dates (LDAC, commissioning exams, etc.) to see them on Dawn.</div>`; return; }
  const today=localYMD();
  el.innerHTML=ms.slice().sort((a,b)=>a.date<b.date?-1:1).map(m=>{
    const past=m.date<today;
    const days=Math.ceil((new Date(m.date+"T12:00:00")-Date.now())/864e5);
    const when=past?`${Math.abs(days)}d ago`:(days===0?"today":`in ${days}d`);
    return `<div class="milestone-row"><span class="milestone-date">${m.date}</span><span class="milestone-label">${esc(m.label)}</span><span class="milestone-when" style="color:${past?"var(--ink-faint)":"var(--jade)"}">${when}</span><button class="milestone-del" data-msdel="${m.id}">✕</button></div>`;
  }).join("");
}
function renderCommReadiness(){
  const el=document.getElementById("commReadyWrap"); if(!el) return;
  const items=[];
  const lastAft=(S.aftHistory||[]).slice(-1)[0];
  const aftTotal=lastAft&&lastAft.scores?Object.values(lastAft.scores).reduce((a,b)=>a+(+b||0),0):0;
  const aftOk=aftTotal>=270;
  items.push({label:"AFT total",value:lastAft?aftTotal+"pts":"no record",ok:aftOk,hint:"target ≥270 total"});
  const gpas=S.gpaHistory||[];
  const curGpa=gpas.length?gpas[gpas.length-1].gpa:null;
  const gpaOk=curGpa!=null&&curGpa>=2.0;
  items.push({label:"GPA",value:curGpa!=null?curGpa.toFixed(2):"no record",ok:gpaOk,hint:"min 2.0 to commission"});
  const withTgt=(S.lifeSkills||[]).filter(s=>!s.group&&(s.currentLevel||0)>0&&s.targetLevel!=null);
  const atTgt=withTgt.filter(s=>skEffectiveLevel(s)>=(s.targetLevel||0)).length;
  const skillOk=withTgt.length>0&&atTgt>=withTgt.length*0.7;
  items.push({label:"Skills at target",value:withTgt.length?atTgt+"/"+withTgt.length:"no targets set",ok:skillOk,hint:"advance lagging skills"});
  const quals=S.qualifications||[];
  const expired=quals.filter(q=>q.expDate&&new Date(q.expDate).getTime()<Date.now()).length;
  const qualOk=expired===0&&quals.length>0;
  items.push({label:"Qualifications",value:quals.length?quals.length+" held"+(expired?" · "+expired+" expired":""):"none logged",ok:qualOk,hint:"renew expired quals"});
  const rr=S.rotcRecord;
  const hasRecord=rr&&((rr.positions&&rr.positions.length)||(rr.competitions&&rr.competitions.length));
  items.push({label:"ROTC record",value:hasRecord?"entries logged":"none logged",ok:!!hasRecord,hint:"add positions & competition results"});
  const hasClear=S.profile&&S.profile.clearance&&S.profile.clearance.level;
  items.push({label:"Clearance status",value:hasClear?S.profile.clearance.level:"not logged",ok:!!hasClear,hint:"log clearance in Profile"});
  const passing=items.filter(i=>i.ok).length;
  el.innerHTML=`<div class="comm-ready-bar">
    <div class="comm-ready-score">${passing}/${items.length}</div>
    <div class="comm-ready-label">readiness indicators on track</div>
  </div>
  <div class="comm-ready-list">
    ${items.map(i=>`<div class="comm-ready-row ${i.ok?'cr-ok':'cr-behind'}">
      <span class="cr-dot">${i.ok?'●':'○'}</span>
      <span class="cr-label">${esc(i.label)}</span>
      <span class="cr-value">${esc(i.value)}</span>
      ${!i.ok?`<span class="cr-hint">${esc(i.hint)}</span>`:''}
    </div>`).join('')}
  </div>`;
}
function renderProfile(){
  if(!document.getElementById("pfWt")) return;
  renderCommReadiness(); renderGpaHistory(); renderMilestones();
  const p=S.profile||{}, l=S.lifts||{};
  const setv=(id,v)=>{const el=document.getElementById(id); if(el&&document.activeElement!==el) el.value=(v??"");};
  setv("pfName",S.name); setv("pfRank",S.rank); setv("pfPos",S.position); setv("pfBranch",S.branchGoal);
  setv("pfCommission",p.commissionDate||""); setv("pfGpa",p.gpa||""); setv("pfGpaGoal",p.gpaGoal||"");
  setv("pfDob",p.birthdate||""); setv("pfSex",p.sex||""); setv("pfBlood",p.bloodType||"");
  setv("pfHt",p.heightIn); setv("pfHtDate",p.heightDate||""); setv("pfWt",p.weightLb); setv("pfWtDate",p.weightDate||"");
  setv("pfDl",l.deadliftLb); setv("pfSq",l.squatLb); setv("pfBn",l.benchLb); setv("pfLiftDate",l.liftDate||"");
  setv("pfNotes",p.notes||"");
  const age=ageFromDob(p.birthdate);
  const ageEl=document.getElementById("pfAgeOut"); if(ageEl) ageEl.value=age!=null?age+" yrs":"—";
  const ro=document.getElementById("pfReadout"); if(!ro) return;
  const rows=[];
  if(age!=null) rows.push(`<div class="r-row"><span>Age</span><b>${age}</b></div>`);
  if(p.heightIn>0 && p.weightLb>0){ const bmi=(p.weightLb/(p.heightIn*p.heightIn))*703; rows.push(`<div class="r-row"><span>BMI</span><b>${bmi.toFixed(1)}</b></div>`); }
  if(p.weightLb>0 && l.deadliftLb) rows.push(`<div class="r-row"><span>Deadlift</span><b>${(l.deadliftLb/p.weightLb).toFixed(2)}× bodyweight</b></div>`);
  if(p.weightLb>0 && l.squatLb) rows.push(`<div class="r-row"><span>Squat</span><b>${(l.squatLb/p.weightLb).toFixed(2)}× bodyweight</b></div>`);
  if(p.weightLb>0 && l.benchLb) rows.push(`<div class="r-row"><span>Bench</span><b>${(l.benchLb/p.weightLb).toFixed(2)}× bodyweight</b></div>`);
  if(p.weightDate) rows.push(`<div class="r-row"><span>Weight measured</span><b>${fmtMeasDate(p.weightDate)}</b></div>`);
  if(p.heightDate) rows.push(`<div class="r-row"><span>Height measured</span><b>${fmtMeasDate(p.heightDate)}</b></div>`);
  ro.innerHTML=rows.length?(rows.join("")+`<div style="margin-top:8px;color:var(--ink-faint);font-style:italic">Your bodyweight drives the Deadlift & Squat skills automatically.</div>`):`<div style="color:var(--ink-faint)">Fill in your profile above to see computed stats and power the strength skills.</div>`;
  // Weight log section
  const wlEl=document.getElementById("wlSection"); if(!wlEl) return;
  const wlLogs=(S.weightLog||[]).slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
  const last30=wlLogs.filter(w=>{const d=new Date(w.date);return !isNaN(d)&&(Date.now()-d)/864e5<=30;});
  const last7=wlLogs.filter(w=>{const d=new Date(w.date);return !isNaN(d)&&(Date.now()-d)/864e5<=7;});
  const avg7=last7.length?Math.round(last7.reduce((s,w)=>s+w.lb,0)/last7.length*10)/10:null;
  const sparkHtml=last30.length>=2?`<div class="wl-spark">${miniSparkline(last30.map(w=>w.lb),260,50)}</div>`:"";
  // linear regression trend over last 30 entries
  let trendHtml="", _slope=0;
  if(last30.length>=5){
    const n=last30.length, ys=last30.map(p=>p.lb), xs=[...Array(n).keys()];
    const xm=xs.reduce((s,x)=>s+x,0)/n, ym=ys.reduce((s,y)=>s+y,0)/n;
    _slope=(xs.reduce((s,x,i)=>s+(x-xm)*(ys[i]-ym),0))/(xs.reduce((s,x)=>s+(x-xm)**2,0)||1);
    const monthlyDelta=Math.round(_slope*30*10)/10;
    const arrow=monthlyDelta>0.05?"📈":monthlyDelta<-0.05?"📉":"➡️";
    trendHtml=`<div class="wt-trend">${arrow} ${monthlyDelta>0?"+":""}${monthlyDelta} lbs/month at current rate</div>`;
  }
  const goalHtml=(()=>{
    const goal=S.profile.weightGoal, cur=S.profile.weightLb;
    if(!goal) return `<div class="wt-goal-setter"><label>Weight goal (lb): <input id="wlGoal" type="number" min="50" max="400" step="0.5" placeholder="target lb" style="width:72px;background:var(--panel-2);border:1px solid var(--line);color:var(--ink);padding:3px 6px;border-radius:5px;font-family:inherit;font-size:12px"> <button id="wlGoalSave" style="background:var(--panel-2);border:1px solid var(--line);color:var(--jade);border-radius:5px;padding:3px 9px;cursor:pointer;font-family:inherit;font-size:12px">Set</button></label></div>`;
    const gap=Math.round((goal-cur)*10)/10;
    const weeksToGoal=_slope&&Math.abs(_slope)>0.001?Math.round(Math.abs(gap/(_slope*7))):null;
    const onTrack=(gap>0&&_slope>0)||(gap<0&&_slope<0);
    const projLine=weeksToGoal!=null?(onTrack?"On track":"Off track")+` — ${Math.abs(gap)} lbs to go · ${weeksToGoal} week${weeksToGoal!==1?"s":""} at current rate`:`${Math.abs(gap)} lbs to go — log consistently to see projection`;
    return `<div class="wt-goal">${gap>0?"⬆":"⬇"} Goal: ${goal} lb · ${esc(projLine)} <button id="wlGoalClear" style="background:none;border:none;color:var(--ink-faint);font-size:10px;cursor:pointer;padding:0 4px">✕</button></div>`;
  })();
  wlEl.innerHTML=`<div class="adder" style="padding-bottom:12px">
    <div class="row" style="gap:9px;align-items:flex-end">
      <label class="lg-label" style="flex:1">Weight (lb)<input id="wlVal" type="number" min="50" max="400" step="0.5" placeholder="e.g. 175"></label>
      <button class="btn-add" id="wlLog" style="flex:0 0 auto;width:auto;padding:10px 14px;margin:0;font-size:13px">Log</button>
    </div>
    ${avg7!=null?`<div style="font-size:12px;color:var(--ink-faint);margin-top:6px">7-day avg: <b style="color:var(--ink)">${avg7} lb</b></div>`:""}
    ${sparkHtml}
    ${trendHtml}
    ${goalHtml}
    ${last30.length?`<div style="font-size:11px;color:var(--ink-faint);margin-top:4px">${last30.length} entr${last30.length===1?"y":"ies"} in last 30 days</div>`:`<div style="font-size:12px;color:var(--ink-faint);margin-top:6px">No weight entries yet. Log your weight above to start trending.</div>`}
  </div>`;
  const wlBtn=document.getElementById("wlLog");
  if(wlBtn) wlBtn.onclick=()=>{
    const val=parseFloat(document.getElementById("wlVal").value);
    if(!val||val<50||val>400){toast("Enter a valid weight (50–400 lb)");return;}
    const date=localYMD();
    if(!S.weightLog) S.weightLog=[];
    const existing=S.weightLog.find(w=>w.date===date);
    if(existing) existing.lb=val; else S.weightLog.push({date,lb:val,ts:Date.now()});
    S.profile.weightLb=val; S.profile.weightDate=date;
    save(); render();
    toast(`⚖️ ${val} lb logged`);
  };
  const wlGoalSave=document.getElementById("wlGoalSave");
  if(wlGoalSave) wlGoalSave.onclick=()=>{
    const v=parseFloat(document.getElementById("wlGoal").value);
    if(!v||v<50||v>400){toast("Enter a valid goal weight (50–400 lb)");return;}
    if(!S.profile) S.profile={};
    S.profile.weightGoal=v; save(); render();
    toast(`🎯 Weight goal set: ${v} lb`);
  };
  const wlGoalClear=document.getElementById("wlGoalClear");
  if(wlGoalClear) wlGoalClear.onclick=()=>{
    if(!S.profile) S.profile={};
    S.profile.weightGoal=null; save(); render();
  };
}
const _pfSave=document.getElementById("pfSave");
if(_pfSave) _pfSave.onclick=()=>{
  const num=id=>{const v=parseFloat(document.getElementById(id).value); return isNaN(v)?null:v;};
  const str=id=>{const v=document.getElementById(id).value.trim(); return v||null;};
  // identity (also updates header)
  const nm=str("pfName"); if(nm) S.name=nm;
  const rk=str("pfRank"); if(rk) S.rank=rk;
  S.position=str("pfPos")||"No leadership role";
  const br=str("pfBranch"); if(br) S.branchGoal=br;
  S.profile.commissionDate=document.getElementById("pfCommission").value||null;
  const gpaRaw=parseFloat(document.getElementById("pfGpa").value); S.profile.gpa=isNaN(gpaRaw)?null:Math.round(gpaRaw*100)/100;
  const gpaGoalRaw=parseFloat(document.getElementById("pfGpaGoal")?document.getElementById("pfGpaGoal").value:""); S.profile.gpaGoal=isNaN(gpaGoalRaw)?null:Math.round(gpaGoalRaw*100)/100;
  // dimensions
  S.profile.birthdate=document.getElementById("pfDob").value||null;
  S.profile.sex=document.getElementById("pfSex").value||null;
  S.profile.bloodType=document.getElementById("pfBlood").value||null;
  S.profile.heightIn=num("pfHt"); S.profile.heightDate=document.getElementById("pfHtDate").value||null;
  S.profile.weightLb=num("pfWt"); S.profile.weightDate=document.getElementById("pfWtDate").value||null;
  // record weight to trend log (dedupe by date)
  if(S.profile.weightLb>0){
    const wd=S.profile.weightDate||localYMD();
    if(!S.weightLog) S.weightLog=[];
    const existing=S.weightLog.find(w=>w.date===wd);
    if(existing) existing.lb=S.profile.weightLb;
    else S.weightLog.push({date:wd, lb:S.profile.weightLb});
  }
  S.profile.notes=document.getElementById("pfNotes").value.trim();
  S.lifts.deadliftLb=num("pfDl"); S.lifts.squatLb=num("pfSq"); S.lifts.benchLb=num("pfBn");
  S.lifts.liftDate=document.getElementById("pfLiftDate").value||null;
  save(); render();
  toast("🪪 Profile saved — strength skills updated");
};

// ===== Milestones =====
const _pfMsAdd=document.getElementById("pfMsAdd");
if(_pfMsAdd) _pfMsAdd.onclick=()=>{
  const lbl=document.getElementById("pfMsLabel").value.trim();
  const dt=document.getElementById("pfMsDate").value;
  if(!lbl||!dt){ toast("Enter a label and date"); return; }
  if(!S.milestones) S.milestones=[];
  S.milestones.push({id:Date.now().toString(36),label:lbl,date:dt});
  document.getElementById("pfMsLabel").value="";
  document.getElementById("pfMsDate").value="";
  save(); renderMilestones();
  toast("Milestone added");
};
// milestone delete handled by event delegation via data-msdel
const _pfMsWrap=document.getElementById("pfMilestones");
if(_pfMsWrap) _pfMsWrap.addEventListener("click",e=>{
  const btn=e.target.closest("[data-msdel]"); if(!btn) return;
  S.milestones=(S.milestones||[]).filter(m=>m.id!==btn.dataset.msdel);
  save(); renderMilestones();
});

// ===== Blood type: emergency card + scientifically-valid donation facts =====
// Compatibility is real transfusion science (ABO/Rh), not invented.
const BLOOD_FACTS={
  "O−":{donateTo:"everyone (universal red-cell donor)", receiveFrom:"O−", note:"Universal red-cell donor — your blood is in highest demand for emergencies."},
  "O+":{donateTo:"O+, A+, B+, AB+", receiveFrom:"O+, O−", note:"Most common type; O+ red cells are heavily used."},
  "A−":{donateTo:"A−, A+, AB−, AB+", receiveFrom:"A−, O−", note:""},
  "A+":{donateTo:"A+, AB+", receiveFrom:"A+, A−, O+, O−", note:""},
  "B−":{donateTo:"B−, B+, AB−, AB+", receiveFrom:"B−, O−", note:""},
  "B+":{donateTo:"B+, AB+", receiveFrom:"B+, B−, O+, O−", note:""},
  "AB−":{donateTo:"AB−, AB+", receiveFrom:"AB−, A−, B−, O−", note:""},
  "AB+":{donateTo:"AB+ only", receiveFrom:"everyone (universal red-cell recipient)", note:"Universal plasma donor — and you can receive red cells from any type."}
};
const WHOLE_BLOOD_DAYS=56; // real Red Cross eligibility interval for whole blood
function renderEmergencyAndBlood(){
  const p=S.profile||{};
  // Emergency card
  const eg=document.getElementById("pfEmergency");
  if(eg){
    const age=ageFromDob(p.birthdate);
    const rows=[
      ["Name", S.name||"—"],
      ["Blood type", p.bloodType||"— (set above)"],
      ["Age", age!=null?age:"—"],
      ["Allergies / medical", (p.notes&&p.notes.trim())?esc(p.notes):"none recorded"],
    ];
    eg.innerHTML=`<div class="emerg-card"><div class="emerg-h">⚕️ EMERGENCY INFO</div>${rows.map(r=>`<div class="emerg-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}<div class="emerg-foot">Hold to screenshot · keep current</div></div>`;
  }
  // Blood donation
  const bd=document.getElementById("pfBloodCard"); if(!bd) return;
  if(!p.bloodType){ bd.innerHTML=`<div class="bl-readout" style="color:var(--ink-faint)">Set your blood type above to see who you can donate to/receive from and track donation eligibility.</div>`; return; }
  const f=BLOOD_FACTS[p.bloodType]||{};
  const last=(S.donations||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  let elig="";
  if(last){
    const next=new Date(last.date); next.setDate(next.getDate()+WHOLE_BLOOD_DAYS);
    const daysLeft=Math.ceil((next-Date.now())/864e5);
    elig = daysLeft<=0
      ? `<div class="bl-elig ok">✅ Eligible to donate whole blood again (last: ${new Date(last.date).toLocaleDateString()})</div>`
      : `<div class="bl-elig wait">⏳ Next eligible in ${daysLeft} day${daysLeft!==1?'s':''} — ${next.toLocaleDateString()} (${WHOLE_BLOOD_DAYS}-day interval)</div>`;
  } else {
    elig=`<div class="bl-elig ok">No donations logged yet. Whole blood can be given every ${WHOLE_BLOOD_DAYS} days.</div>`;
  }
  const count=(S.donations||[]).length;
  bd.innerHTML=`<div class="blood-card">
    <div class="blood-type-big">${esc(p.bloodType)}</div>
    <div class="blood-compat">
      <div><span>Can donate to</span><b>${f.donateTo||"—"}</b></div>
      <div><span>Can receive from</span><b>${f.receiveFrom||"—"}</b></div>
    </div>
    ${f.note?`<div class="blood-note">${f.note}</div>`:""}
    ${elig}
    ${count?`<div class="blood-count">🩸 ${count} donation${count!==1?'s':''} logged${count>=1?` · ~${count*0.5} lives potentially helped`:''}</div>`:""}
  </div>`;
}
const _donAdd=document.getElementById("donAdd");
if(_donAdd) _donAdd.onclick=()=>{
  const d=document.getElementById("donDate").value || localYMD();
  S.donations.push({id:id(), date:d, type:S.profile.bloodType||null});
  document.getElementById("donDate").value="";
  save(); render();
  toast("🩸 Donation logged — thank you");
};

// ===== Vitals (manual; informational only) =====
function bpClass(sys,dia){
  if(sys==null||dia==null) return null;
  if(sys<120 && dia<80) return {label:"Normal", cls:"ok"};
  if(sys<130 && dia<80) return {label:"Elevated", cls:"warn"};
  if(sys<140 || dia<90) return {label:"High (Stage 1)", cls:"warn"};
  if(sys<180 || dia<120) return {label:"High (Stage 2)", cls:"bad"};
  return {label:"Very high — seek care", cls:"bad"};
}
function spark(vals){ // tiny inline sparkline from numbers
  const nums=vals.filter(v=>v!=null); if(nums.length<2) return "";
  const min=Math.min(...nums), max=Math.max(...nums), rng=(max-min)||1, w=90, h=22, step=w/(nums.length-1);
  const pts=nums.map((v,i)=>`${(i*step).toFixed(1)},${(h-((v-min)/rng)*h).toFixed(1)}`).join(" ");
  return `<svg width="${w}" height="${h}" style="vertical-align:middle"><polyline points="${pts}" fill="none" stroke="var(--jade)" stroke-width="1.5"/></svg>`;
}
function renderVitals(){
  const el=document.getElementById("pfVitals"); if(!el) return;
  const v=(S.vitals||[]).slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
  // Apple Health extras block (VO2 max, HRV, etc.) — shows whenever an import has run
  let ahBlock="";
  const hi=S.healthImport||{};
  if(hi.latest && Object.keys(hi.latest).length){
    const labelFor=k=>{ const t=Object.keys(AH_METRICS).find(t=>AH_METRICS[t].key===k); return t?AH_METRICS[t]:null; };
    const rows=Object.keys(hi.latest).map(k=>{ const d=labelFor(k); if(!d) return ""; return `<div class="r-row"><span>${esc(d.label)}</span><b>${hi.latest[k].value}${d.u?' '+d.u:''}</b></div>`; }).join("");
    const when=hi.lastImport?new Date(hi.lastImport).toLocaleDateString():"";
    const rec = typeof recoveryReadiness==="function" ? recoveryReadiness() : null;
    const recHtml = rec ? `<div class="ah-recovery ${rec.level}"><b>${rec.level==="easy"?"🟠 Ease off":rec.level==="caution"?"🟡 Train smart":"🟢 Good to train"}</b> — ${esc(rec.line)}${rec.detail?`<div class="ah-recovery-detail">${esc(rec.detail)} <span style="opacity:.7">Recovery signals are noisy day-to-day and aren't medical advice — use as a rough guide.</span></div>`:""}</div>` : "";
    ahBlock=`<div class="bl-readout" style="margin-top:10px"><div style="font-size:11.5px;color:var(--gold);font-weight:600;margin-bottom:6px"> Apple Health (imported ${when})</div>${recHtml}${rows}</div>`;
  }
  if(!v.length){
    el.innerHTML=(ahBlock||`<div class="bl-readout" style="color:var(--ink-faint)">No vitals logged yet. Add a reading below.</div>`);
    return;
  }
  const last=v[v.length-1];
  const rows=[];
  if(last.pulse!=null) rows.push(`<div class="r-row"><span>Resting pulse ${spark(v.map(x=>x.pulse))}</span><b>${last.pulse} bpm</b></div>`);
  if(last.bpSys!=null&&last.bpDia!=null){ const c=bpClass(last.bpSys,last.bpDia); rows.push(`<div class="r-row"><span>Blood pressure</span><b>${last.bpSys}/${last.bpDia} <span class="vt-tag ${c.cls}">${c.label}</span></b></div>`); }
  if(last.hemoglobin!=null){
    const hgb=last.hemoglobin; const lowDonate = (S.profile.sex==="f"? hgb<12.5 : hgb<13.0);
    rows.push(`<div class="r-row"><span>Hemoglobin ${spark(v.map(x=>x.hemoglobin))}</span><b>${hgb} g/dL${lowDonate?' <span class="vt-tag warn">donation may be deferred</span>':''}</b></div>`);
  }
  rows.push(`<div class="r-row"><span>Readings logged</span><b>${v.length}</b></div>`);
  el.innerHTML=`<div class="bl-readout">${rows.join("")}<div style="margin-top:8px;color:var(--ink-faint);font-style:italic">Latest reading shown; sparkline is your trend. Informational only.</div></div>`+ahBlock;
}
const _vtAdd=document.getElementById("vtAdd");
if(_vtAdd) _vtAdd.onclick=()=>{
  const num=id=>{const x=parseFloat(document.getElementById(id).value); return isNaN(x)?null:x;};
  const date=document.getElementById("vtDate").value || localYMD();
  const entry={id:id(), date, pulse:num("vtPulse"), bpSys:num("vtSys"), bpDia:num("vtDia"), hemoglobin:num("vtHgb"), note:document.getElementById("vtNote").value.trim()};
  if(entry.pulse==null&&entry.bpSys==null&&entry.hemoglobin==null){ toast("Enter at least one reading"); return; }
  S.vitals.push(entry);
  ["vtPulse","vtSys","vtDia","vtHgb","vtNote","vtDate"].forEach(x=>document.getElementById(x).value="");
  save(); render();
  toast("📈 Vitals logged");
};
const _vtImport=document.getElementById("vtImport");
if(_vtImport) _vtImport.onclick=()=>{ const f=document.getElementById("vtImportFile"); if(f) f.click(); };
const _vtImportFile=document.getElementById("vtImportFile");
if(_vtImportFile) _vtImportFile.onchange=e=>{ const f=e.target.files[0]; if(f) parseAppleHealth(f); e.target.value=""; };

// ---- Apple Health export.xml streaming parser ----
// The file can be hundreds of MB to several GB, so we stream it in chunks and keep ONLY
// the latest reading of each metric we care about — the raw file is never held or stored.
// Map: Apple HealthKit type -> {field, unit-handling}. We store the most-recent value.
const AH_METRICS={
  // vitals (go into S.vitals + healthImport.latest)
  "HKQuantityTypeIdentifierRestingHeartRate":       {key:"restingHR", label:"Resting heart rate", u:"bpm", round:0},
  "HKQuantityTypeIdentifierHeartRate":              {key:"heartRate", label:"Heart rate (last)", u:"bpm", round:0},
  "HKQuantityTypeIdentifierWalkingHeartRateAverage":{key:"walkHR", label:"Walking heart rate avg", u:"bpm", round:0},
  "HKQuantityTypeIdentifierHeartRateVariabilitySDNN":{key:"hrv", label:"HRV (SDNN)", u:"ms", round:0},
  "HKQuantityTypeIdentifierHeartRateRecoveryOneMinute":{key:"hrRecovery", label:"Heart-rate recovery (1 min)", u:"bpm", round:0},
  "HKQuantityTypeIdentifierVO2Max":                 {key:"vo2max", label:"VO₂ max", u:"mL/kg·min", round:1},
  "HKQuantityTypeIdentifierBloodPressureSystolic":  {key:"bpSys", label:"BP systolic", u:"mmHg", round:0},
  "HKQuantityTypeIdentifierBloodPressureDiastolic": {key:"bpDia", label:"BP diastolic", u:"mmHg", round:0},
  "HKQuantityTypeIdentifierBodyMass":               {key:"weightLb", label:"Body weight", u:"lb", round:1, conv:"mass"},
  "HKQuantityTypeIdentifierLeanBodyMass":           {key:"leanMass", label:"Lean body mass", u:"lb", round:1, conv:"mass"},
  "HKQuantityTypeIdentifierHeight":                 {key:"heightIn", label:"Height", u:"in", round:1, conv:"len"},
  "HKQuantityTypeIdentifierOxygenSaturation":       {key:"spo2", label:"Blood oxygen", u:"%", round:0, pct:true},
  "HKQuantityTypeIdentifierRespiratoryRate":        {key:"respRate", label:"Respiratory rate", u:"br/min", round:0},
  "HKQuantityTypeIdentifierAppleSleepingWristTemperature":{key:"wristTemp", label:"Sleeping wrist temp", u:"°F", round:1, conv:"temp"},
  "HKQuantityTypeIdentifierBodyMassIndex":          {key:"bmi", label:"BMI", u:"", round:1},
  "HKQuantityTypeIdentifierBodyFatPercentage":      {key:"bodyFat", label:"Body fat", u:"%", round:1, pct:true},
  "HKQuantityTypeIdentifierAppleWalkingSteadiness": {key:"steadiness", label:"Walking steadiness", u:"%", round:0, pct:true},
  "HKQuantityTypeIdentifierSixMinuteWalkTestDistance":{key:"sixMinWalk", label:"6-minute walk distance", u:"m", round:0},
  // activity (Apple-only extras)
  "HKQuantityTypeIdentifierStepCount":              {key:"steps", label:"Steps (last entry)", u:"", round:0},
  "HKQuantityTypeIdentifierFlightsClimbed":         {key:"flights", label:"Flights climbed (last)", u:"", round:0},
  "HKQuantityTypeIdentifierActiveEnergyBurned":     {key:"activeKcal", label:"Active energy (last)", u:"kcal", round:0},
  "HKQuantityTypeIdentifierAppleExerciseTime":      {key:"exerciseMin", label:"Exercise time (last)", u:"min", round:0},
  "HKQuantityTypeIdentifierDistanceWalkingRunning": {key:"distWalkRun", label:"Walk/run distance (last)", u:"mi", round:2, conv:"dist"},
};
// unit conversions, driven by each record's own unit attribute (robust to device differences)
function ahConvert(conv, val, unit){
  unit=(unit||"").toLowerCase();
  if(conv==="mass"){ if(unit==="kg") return val*2.20462; if(unit==="g") return val/453.592; return val; }   // -> lb
  if(conv==="len"){ if(unit==="ft") return val*12; if(unit==="cm") return val/2.54; if(unit==="m") return val*39.3701; return val; } // -> in
  if(conv==="dist"){ if(unit==="km") return val*0.621371; if(unit==="m") return val/1609.34; return val; } // -> mi
  if(conv==="temp"){ if(unit==="degc"||unit==="°c"||unit==="c") return val*9/5+32; return val; } // -> °F
  return val;
}
// regex pulls a record's type, unit, value and the best available date
const AH_REC_RE=/<Record\b[^>]*?\btype="([^"]+)"[^>]*?>/g;
function ahAttr(tag, name){ const m=tag.match(new RegExp('\\b'+name+'="([^"]*)"')); return m?m[1]:null; }
function ahDateOf(tag){ return ahAttr(tag,"endDate")||ahAttr(tag,"startDate")||ahAttr(tag,"creationDate")||null; }
function ahParseDate(s){ if(!s) return 0; // "2026-02-05 08:00:00 -0500"
  const m=s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/); if(!m) return Date.parse(s)||0;
  return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]).getTime(); }

async function parseAppleHealth(file){
  const statusEl=document.getElementById("vtImportStatus");
  const setS=(t)=>{ if(statusEl) statusEl.textContent=t; };
  if(/\.zip$/i.test(file.name)){ setS("Please unzip the export first and pick the export.xml inside (a web app can't open the multi-GB zip directly)."); return; }
  setS("Reading… 0%");
  // latest[ key ] = {value, ts}
  const latest={};
  const me={};  // <Me> characteristics
  const CHUNK=8*1024*1024; // 8MB chunks
  let offset=0, tail="", grabbedMe=false;
  const total=file.size;
  function handleChunk(text){
    // capture <Me .../> once (characteristics: DOB, sex, blood type)
    if(!grabbedMe){
      const meM=text.match(/<Me\b[^>]*\/?>/);
      if(meM){ grabbedMe=true; const mt=meM[0];
        me.dob=ahAttr(mt,"HKCharacteristicTypeIdentifierDateOfBirth");
        me.sex=ahAttr(mt,"HKCharacteristicTypeIdentifierBiologicalSex");
        me.blood=ahAttr(mt,"HKCharacteristicTypeIdentifierBloodType");
      }
    }
    AH_REC_RE.lastIndex=0; let m;
    while((m=AH_REC_RE.exec(text))){
      const type=m[1]; const def=AH_METRICS[type]; if(!def) continue;
      const tag=m[0];
      const vRaw=ahAttr(tag,"value"); if(vRaw==null) continue;
      const v=parseFloat(vRaw); if(isNaN(v)) continue;
      const ts=ahParseDate(ahDateOf(tag));
      const cur=latest[def.key];
      if(!cur || ts>=cur.ts){ latest[def.key]={value:v, ts, unit:ahAttr(tag,"unit")||""}; }
    }
  }
  function readNext(){
    return new Promise((resolve,reject)=>{
      const slice=file.slice(offset, offset+CHUNK);
      const rd=new FileReader();
      rd.onerror=()=>reject(rd.error);
      rd.onload=()=>{
        const text=tail + rd.result;
        // keep a tail so a <Record> split across the chunk boundary isn't lost
        const lastLt=text.lastIndexOf("<");
        let processable=text, keep="";
        if(lastLt>0 && lastLt>text.length-2000){ processable=text.slice(0,lastLt); keep=text.slice(lastLt); }
        handleChunk(processable);
        tail=keep;
        offset+=CHUNK;
        resolve();
      };
      rd.readAsText(slice);
    });
  }
  try{
    while(offset<total){
      await readNext();
      setS(`Reading… ${Math.min(99,Math.round(offset/total*100))}%`);
    }
    if(tail) handleChunk(tail);
    applyAppleHealth(latest, me);
  }catch(err){ setS("Couldn't read that file. Make sure it's the export.xml from your Health export."); }
}

function applyAppleHealth(latest, me){
  const today=todayStr();
  const imported=[]; // for the summary
  // 1) Profile characteristics
  if(me.dob){ const d=me.dob.slice(0,10); if(/^\d{4}-\d{2}-\d{2}$/.test(d)){ S.profile.birthdate=d; imported.push("Date of birth"); } }
  if(me.sex){ const s=/female/i.test(me.sex)?"f":/male/i.test(me.sex)?"m":null; if(s){ S.profile.sex=s; imported.push("Biological sex"); } }
  if(me.blood){ // Apple format e.g. "HKBloodTypeOPositive", "HKBloodTypeABNegative"
    const bm=me.blood.match(/BloodType(AB|A|B|O)(Positive|Negative)/);
    if(bm){ S.profile.bloodType=bm[1]+(bm[2]==="Positive"?"+":"-"); imported.push("Blood type"); }
  }
  // helper: convert a stored {value,unit} using the metric's own conversion + its unit attribute
  const tdefOf=k=>AH_METRICS[Object.keys(AH_METRICS).find(t=>AH_METRICS[t].key===k)];
  function conv(k){ const e=latest[k]; if(!e) return null; const d=tdefOf(k); let v=e.value; if(d&&d.conv) v=ahConvert(d.conv, v, e.unit); if(d&&d.pct&&v<=1) v=v*100; return v; }
  // 2) Weight & height into Profile (height converts ft->in via the record's own unit)
  if(latest.weightLb){ S.profile.weightLb=Math.round(conv("weightLb")*10)/10; S.profile.weightDate=today; (S.weightLog=S.weightLog||[]).push({date:today, lb:S.profile.weightLb}); imported.push("Body weight"); }
  if(latest.heightIn){ S.profile.heightIn=Math.round(conv("heightIn")*10)/10; S.profile.heightDate=today; imported.push("Height"); }
  // 3) Build a vitals entry from pulse / BP (hemoglobin isn't in a standard Health export)
  const vt={id:id(), date:today, pulse:null, bpSys:null, bpDia:null, hemoglobin:null, note:"Apple Health import"};
  if(latest.restingHR){ vt.pulse=Math.round(latest.restingHR.value); imported.push("Resting heart rate"); }
  else if(latest.walkHR){ vt.pulse=Math.round(latest.walkHR.value); imported.push("Walking heart rate"); }
  else if(latest.heartRate){ vt.pulse=Math.round(latest.heartRate.value); imported.push("Heart rate"); }
  if(latest.bpSys && latest.bpDia){ vt.bpSys=Math.round(latest.bpSys.value); vt.bpDia=Math.round(latest.bpDia.value); imported.push("Blood pressure"); }
  if(vt.pulse!=null || vt.bpSys!=null){ S.vitals.push(vt); }
  // 4) Richer Apple-only metrics stored in healthImport.latest (each converted via its own unit)
  const extra={};
  ["restingHR","heartRate","walkHR","hrv","hrRecovery","vo2max","spo2","respRate","wristTemp","steadiness","sixMinWalk","bmi","bodyFat","leanMass","steps","flights","activeKcal","exerciseMin","distWalkRun"].forEach(k=>{
    if(latest[k]){
      const d=tdefOf(k); const r=d?d.round:1;
      const val=conv(k);
      extra[k]={value:Math.round(val*Math.pow(10,r))/Math.pow(10,r), ts:latest[k].ts};
    }
  });
  // map to the physiological "Resting heart rate" skill auto-hook if present
  if(latest.restingHR){
    const sk=S.lifeSkills.find(s=>s.auto==="vital:rhr");
    if(sk){ const lvl=rhrToLevel(latest.restingHR.value); if(lvl>sk.currentLevel){ sk.currentLevel=Math.min(lvl,sk.levels.length); skUpdatePeak(sk); sk.lastQuestTs=Date.now(); } }
  }
  // keep a small rolling history of recovery markers (RHR/HRV/VO2) so the training
  // advisory can compare today vs your own baseline. Keyed by reading date to avoid dupes.
  const prevHist=(S.healthImport&&S.healthImport.history)||[];
  const histMap={}; prevHist.forEach(h=>{ histMap[h.date]=h; });
  const mk=(k)=> latest[k]? (conv(k)) : null;
  const recDate = latest.restingHR? localYMD(new Date(latest.restingHR.ts)) : today;
  if(latest.restingHR || latest.hrv || latest.vo2max){
    histMap[recDate]={ date:recDate, rhr: latest.restingHR?Math.round(latest.restingHR.value):null, hrv: latest.hrv?Math.round(latest.hrv.value):null, vo2: latest.vo2max?Math.round(mk("vo2max")*10)/10:null };
  }
  const history=Object.values(histMap).sort((a,b)=>a.date<b.date?-1:1).slice(-30); // keep last 30
  S.healthImport={ lastImport:new Date().toISOString(), latest:extra, fields:imported.slice(), history };
  save(); render();
  // summary UI
  const sumEl=document.getElementById("vtImportSummary");
  const st=document.getElementById("vtImportStatus");
  if(st) st.textContent = imported.length ? `✓ Imported ${imported.length} metric${imported.length!==1?'s':''}` : "No matching metrics found in that file.";
  if(sumEl){
    const rows=Object.keys(extra).map(k=>{ const d=AH_METRICS[Object.keys(AH_METRICS).find(t=>AH_METRICS[t].key===k)]; return d?`<div class="ah-row"><span>${esc(d.label)}</span><b>${extra[k].value}${d.u?' '+d.u:''}</b></div>`:""; }).join("");
    sumEl.innerHTML = rows ? `<div class="ah-summary"><div class="ah-h">Latest readings from your export</div>${rows}<div class="ah-note">Resting heart rate and blood pressure were also added to your Vitals log. Hemoglobin isn't in a standard Health export — log it manually from donations.</div></div>` : "";
  }
  toast(imported.length?`📥 Apple Health: imported ${imported.length} metrics`:"No matching metrics found");
}


