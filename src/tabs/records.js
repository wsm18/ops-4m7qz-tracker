// ===== Skill Notes search =====
function renderSkillNotes(){
  const el=document.getElementById("skNotesArea"); if(!el) return;
  const srch=document.getElementById("skNoteSearch");
  if(srch) srch.oninput=()=>renderSkillNotes();
  const q=(srch?srch.value||"":"").toLowerCase().trim();
  const entries=[];
  (S.lifeSkills||[]).forEach(sk=>{
    (sk.history||[]).filter(h=>h.note).forEach(h=>{
      if(!q||sk.name.toLowerCase().includes(q)||h.note.toLowerCase().includes(q))
        entries.push({sk,h});
    });
  });
  entries.sort((a,b)=>b.h.ts-a.h.ts);
  if(!entries.length){ el.innerHTML=`<div style="font-size:12.5px;color:var(--ink-faint)">${q?"No notes match that search.":"No skill notes yet — open a skill card, expand the ladder, and use the Work panel to add a practice note."}</div>`; return; }
  el.innerHTML=entries.map(({sk,h})=>`<div class="sk-note-entry">
    <div class="sk-note-header"><span class="sk-note-skill">${esc(sk.name)}</span><span class="sk-note-date">${new Date(h.ts).toLocaleDateString()}</span></div>
    <div class="sk-note-text">${esc(h.note)}</div>
  </div>`).join("");
}

// ===== History / Trends =====
function trendLine(vals, w, h, color, lowerBetter){
  const nums=vals.filter(v=>v!=null); if(nums.length<2) return `<div class="hist-nodata">Need 2+ data points</div>`;
  const min=Math.min(...nums), max=Math.max(...nums), rng=(max-min)||1, step=w/(nums.length-1);
  const pts=nums.map((v,i)=>`${(i*step).toFixed(1)},${(h-((v-min)/rng)*h).toFixed(1)}`).join(" ");
  return `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
}
// Cross-domain pattern block (X-Insight) — see computeInsights() in insights.js
// for the honesty rules (silent unless there's real support on both sides of
// a comparison, plain bucketed averages rather than a fake-precision r value).
function renderInsightsBlock(){
  const insights=typeof computeInsights==="function"?computeInsights():[];
  if(!insights.length){
    return `<div class="hist-block hist-block-wide"><div class="hist-h">🔍 Insights</div><div class="hist-meta">Not enough logged history yet to surface a real pattern — keep logging AFT tests, workouts, and daily orders and this fills in over time.</div></div>`;
  }
  return `<div class="hist-block hist-block-wide"><div class="hist-h">🔍 Insights <span class="hist-insight-sub">from your own logged data — not predictions</span></div>${insights.map(i=>`<div class="recovery-line">${i.line}<div class="insight-detail">${i.detail}</div></div>`).join("")}</div>`;
}
function renderHistory(){
  const el=document.getElementById("historyArea"); if(!el) return;
  const blocks=[];
  blocks.push(renderInsightsBlock());
  // AFT total over time
  if((S.aft||[]).length){
    const totals=S.aft.map(a=>a.total);
    blocks.push(`<div class="hist-block"><div class="hist-h">AFT total <b>${totals[totals.length-1]}</b></div>${trendLine(totals,300,46,'var(--gold)')}<div class="hist-meta">${S.aft.length} test${S.aft.length!==1?'s':''} · range ${Math.min(...totals)}–${Math.max(...totals)}</div></div>`);
  }
  // weight
  if((S.weightLog||[]).length){
    const w=S.weightLog.slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).map(x=>x.lb);
    blocks.push(`<div class="hist-block"><div class="hist-h">Body weight <b>${w[w.length-1]} lb</b></div>${trendLine(w,300,46,'var(--jade)')}<div class="hist-meta">${w.length} readings</div></div>`);
  }
  // vitals: resting pulse
  const pulses=(S.vitals||[]).filter(v=>v.pulse!=null);
  if(pulses.length){
    const pv=pulses.map(v=>v.pulse);
    blocks.push(`<div class="hist-block"><div class="hist-h">Resting pulse <b>${pv[pv.length-1]} bpm</b></div>${trendLine(pv,300,46,'var(--violet)')}<div class="hist-meta">${pv.length} readings</div></div>`);
  }
  // skills leveled
  const started=(S.lifeSkills||[]).filter(s=>!s.group && s.currentLevel>0).length;
  const totalLeaf=(S.lifeSkills||[]).filter(s=>!s.group).length;
  blocks.push(`<div class="hist-block"><div class="hist-h">Skills developed <b>${started}/${totalLeaf}</b></div><div class="hist-bar"><div class="hist-bar-fill" style="width:${totalLeaf?Math.round(started/totalLeaf*100):0}%"></div></div><div class="hist-meta">leaf skills with at least Level 1</div></div>`);
  // donations + quizzes passed
  const don=(S.donations||[]).length;
  const quizzes=Object.values(S.quizzes||{}).filter(x=>x.passed).length;
  // was hardcoded "16" — went stale the moment quizbank.js grew past that
  // count (found while adding the v207 quiz categories); read the bank's
  // real size instead so this never silently drifts again.
  const quizTotal=Object.keys(window.QUIZ_BANK||{}).length;
  blocks.push(`<div class="hist-block"><div class="hist-h">Milestones</div><div class="hist-meta">🩸 ${don} donation${don!==1?'s':''} · 📚 ${quizzes}/${quizTotal} quiz banks passed · 🧪 ${(S.tests||[]).length} cognitive tests taken</div></div>`);
  el.innerHTML=`<div class="hist-grid">${blocks.join("")}</div>`;
}
// ===== Counseling log =====
let _cnFilter="all", _cnSearch="";
function renderCounsel(){
  const el=document.getElementById("counselArea"); if(!el) return;
  // wire filter bar
  document.querySelectorAll("[data-cnfilter]").forEach(btn=>{
    btn.classList.toggle("on",btn.dataset.cnfilter===_cnFilter);
    btn.onclick=()=>{ _cnFilter=btn.dataset.cnfilter; renderCounsel(); };
  });
  const srch=document.getElementById("cnSearch");
  if(srch){ srch.value=_cnSearch; srch.oninput=e=>{ _cnSearch=e.target.value; renderCounsel(); }; }
  let items=(S.counseling||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(_cnFilter!=="all") items=items.filter(c=>c.type===_cnFilter);
  if(_cnSearch.trim()){
    const q=_cnSearch.toLowerCase();
    items=items.filter(c=>(c.summary||"").toLowerCase().includes(q)||(c.people||"").toLowerCase().includes(q));
  }
  if(!items.length){ el.innerHTML=`<div style="font-size:12.5px;color:var(--ink-faint)">${(S.counseling||[]).length?"No entries match this filter.":"No entries yet."}</div>`; return; }
  const typeLabel={event:"Event",monthly:"Monthly",developmental:"Developmental",received:"Received",given:"Given"};
  el.innerHTML=items.map(c=>`<div class="cn-card">
    <div class="cn-top"><span class="cn-type">${typeLabel[c.type]||c.type}</span><span class="cn-date">${new Date(c.date).toLocaleDateString()}</span><button class="hb-del" data-cndel="${c.id}">✕</button></div>
    ${c.people?`<div class="cn-people">${esc(c.people)}</div>`:''}
    ${c.summary?`<div class="cn-summary">${esc(c.summary)}</div>`:''}
    ${c.plan?`<div class="cn-plan"><b>Plan:</b> ${esc(c.plan)}</div>`:''}
  </div>`).join("");
}
// ===== After-Action Review journal =====
// Distinct from the counseling log above — a real AAR (what was supposed to
// happen / what actually happened / why / sustain vs. improve), not free-text
// notes. See today.js's aarNudgeHtml() for the contextual prompt (broken
// streak / below-standard AFT) that points here.
function renderAAR(){
  const el=document.getElementById("aarArea"); if(!el) return;
  const items=(S.aarLog||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!items.length){ el.innerHTML=`<div style="font-size:12.5px;color:var(--ink-faint)">No AARs yet. After a test, a broken streak, or a rough week, write one — what was planned, what actually happened, why, and what to sustain or improve.</div>`; return; }
  el.innerHTML=items.map(a=>`<div class="cn-card">
    <div class="cn-top"><span class="cn-type">${esc(a.title||"AAR")}</span><span class="cn-date">${new Date(a.date).toLocaleDateString()}</span><button class="hb-del" data-aardel="${a.id}">✕</button></div>
    ${a.planned?`<div class="aar-field"><b>Planned:</b> ${esc(a.planned)}</div>`:''}
    ${a.actual?`<div class="aar-field"><b>Actual:</b> ${esc(a.actual)}</div>`:''}
    ${a.why?`<div class="aar-field"><b>Why:</b> ${esc(a.why)}</div>`:''}
    ${a.sustain?`<div class="aar-field sustain"><b>Sustain:</b> ${esc(a.sustain)}</div>`:''}
    ${a.improve?`<div class="aar-field improve"><b>Improve:</b> ${esc(a.improve)}</div>`:''}
  </div>`).join("");
}

// ===== Checklists =====
const CHECKLIST_TEMPLATES={
  ruck:["Rucksack + frame","Water (full)","Boots broken in","Socks (extra pairs)","Reflective belt","Weather layers","Snacks/fuel","ID + meds","Foot care / moleskin","Headlamp"],
  ftx:["Sleep system","Poncho + liner","Eye pro + ear pro","Weapon + cleaning kit","MREs","Canteen/CamelBak","Cold/wet weather gear","Notebook + pen","Hygiene kit","Map + protractor + compass"],
  lab:["Uniform serviceable","Boots polished","Reflective belt","Notebook","Water","Knowledge to study","Phone charged","Arrive early"]
};
function renderChecklists(){
  const el=document.getElementById("checklistArea"); if(!el) return;
  const lists=S.checklists||[];
  if(!lists.length){ el.innerHTML=`<div style="font-size:12.5px;color:var(--ink-faint)">No checklists yet. Create one or use a template.</div>`; return; }
  el.innerHTML=lists.map(cl=>{
    const done=cl.items.filter(i=>i.done).length;
    return `<div class="cl-card"><div class="cl-top"><b>${esc(cl.name)}</b><span class="cl-count">${done}/${cl.items.length}</span>
      <button class="hb-starter-btn" data-clreset="${cl.id}">uncheck all</button><button class="hb-del" data-cldel="${cl.id}">✕</button></div>
      ${cl.items.map((it,i)=>`<div class="cl-item ${it.done?'done':''}"><button class="hb-check ${it.done?'on':''}" data-cltoggle="${cl.id}|${i}">${it.done?'✓':''}</button><span>${esc(it.text)}</span><button class="cl-itemdel" data-clitemdel="${cl.id}|${i}">✕</button></div>`).join("")}
      <div class="cl-additem"><input class="cl-newitem" data-clnewitem="${cl.id}" placeholder="+ add item" maxlength="50"></div>
    </div>`;
  }).join("");
}
// ===== CSV export =====
function downloadCSV(filename, rows){
  // A cell starting with =/+/-/@ is read as a live formula by Excel/Sheets —
  // these exports are explicitly meant to be shared with a battle buddy/
  // cadre, and free-text fields (titles, notes, summaries) could contain
  // one, intentionally or via an imported/adversarial save. Prefixing with a
  // leading quote defuses it without changing what the cell displays.
  const csvSafe=c=>{ const s=String(c==null?"":c); return /^[=+\-@]/.test(s)?"'"+s:s; };
  const csv=rows.map(r=>r.map(c=>`"${csvSafe(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}
function exportData(kind){
  if(kind==="aft"){ const rows=[["Date","Deadlift","Push-ups","SDC","Plank","Run","Total"]]; (S.aft||[]).forEach(a=>rows.push([new Date(a.date).toLocaleDateString(),a.scores.dl,a.scores.hrp,a.scores.sdc,a.scores.plank,a.scores.run,a.total])); downloadCSV("aft-history.csv",rows); }
  else if(kind==="awards"){ const rows=[["Title","Org","Year"]]; (S.awards||[]).forEach(a=>rows.push([a.title||a.name,a.org||"",a.year||""])); downloadCSV("awards.csv",rows); }
  else if(kind==="volunteer"){ const rows=[["Year","Org","Hours","Note"]]; (S.volunteer||[]).forEach(v=>rows.push([v.year||"",v.org||"",v.hours||"",v.note||""])); downloadCSV("volunteer-hours.csv",rows); }
  else if(kind==="counseling"){ const rows=[["Date","Type","People","Summary","Plan"]]; (S.counseling||[]).forEach(c=>rows.push([new Date(c.date).toLocaleDateString(),c.type,c.people,c.summary,c.plan])); downloadCSV("counseling-log.csv",rows); }
  else if(kind==="aar"){ const rows=[["Date","Title","Planned","Actual","Why","Sustain","Improve"]]; (S.aarLog||[]).forEach(a=>rows.push([new Date(a.date).toLocaleDateString(),a.title,a.planned,a.actual,a.why,a.sustain,a.improve])); downloadCSV("aar-log.csv",rows); }
  toast("📄 CSV exported");
}

// ===== Section-specific JSON export / import =====
// Each section maps to one or more top-level state keys. Importing replaces only those keys.
const SECTIONS={
  wall:        {label:"The Wall (awards, memberships, events, volunteer)", keys:["awards","memberships","events","volunteer"]},
  skills:      {label:"Skills (full skill tree + progress)", keys:["lifeSkills"]},
  aft:         {label:"AFT history", keys:["aft"]},
  profile:     {label:"Profile, lifts & vitals", keys:["profile","lifts","vitals","donations","weightLog","healthImport"]},
  habits:      {label:"Habits", keys:["habits"]},
  tests:       {label:"Cognitive test results", keys:["tests"]},
  memory:      {label:"Memory (SRS decks + palaces)", keys:["srsDecks","palaces"]},
  study:       {label:"Study plans", keys:["studyPlans"]},
  counseling:  {label:"Counseling log", keys:["counseling"]},
  aar:         {label:"After-Action Reviews", keys:["aarLog"]},
  checklists:  {label:"Packing / gear checklists", keys:["checklists"]},
  quizzes:     {label:"Quiz progress", keys:["quizzes"]},
  missions:    {label:"Missions, daily orders & objectives", keys:["quests","dailies","bosses"]},
  workouts:    {label:"Workout & PT logs", keys:["workouts","ptLog"]},
};
function exportSection(secId){
  const sec=SECTIONS[secId]; if(!sec) return;
  const payload={ _opsSection:secId, _exported:new Date().toISOString(), data:{} };
  sec.keys.forEach(k=>{ payload.data[k]=S[k]!==undefined?S[k]:null; });
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download="operations-"+secId+"-"+localYMD()+".json"; a.click(); URL.revokeObjectURL(a.href);
  toast("📦 Exported: "+sec.label.split(" (")[0]);
}
function importSection(text){
  let payload; try{ payload=JSON.parse(text); }catch(_){ toast("Couldn't read that file"); return; }
  if(!payload || !payload._opsSection || !payload.data){ toast("That's not a section file"); return; }
  const sec=SECTIONS[payload._opsSection];
  if(!sec){ toast("Unknown section in file"); return; }
  if(!confirm(`Import "${sec.label.split(" (")[0]}"? This replaces your current ${payload._opsSection} data and leaves everything else untouched.`)) return;
  let skippedAny=false;
  sec.keys.forEach(k=>{
    if(payload.data[k]===undefined || payload.data[k]===null) return;
    // If DEFAULT declares this key as an array, the imported value must be
    // one too — a malformed/hand-edited file assigning e.g. a string or
    // object into S.awards used to crash the very next renderAwards() call
    // (or CSV export, or any downstream .filter/.sort), breaking render()
    // for every tab, not just this one section.
    if(Array.isArray(DEFAULT[k]) && !Array.isArray(payload.data[k])){ skippedAny=true; return; }
    S[k]=payload.data[k];
  });
  if(skippedAny) toast("⚠️ Part of that file didn't match the expected shape — skipped, nothing else was touched.");
  // re-run migrations so imported skills get peak/transparency backfill etc.
  if(payload._opsSection==="skills" && typeof mergeNewSeedSkills==="function"){ S.lifeSkills.forEach(s=>{ s.peakLevel=Math.max(s.peakLevel||0,s.currentLevel||0); }); mergeNewSeedSkills(); }
  save(); render();
  toast("✅ Imported: "+sec.label.split(" (")[0]);
}
function renderSectionPicker(){
  const sel=document.getElementById("sectionPick"); if(!sel || sel.options.length) return;
  sel.innerHTML=Object.keys(SECTIONS).map(k=>`<option value="${k}">${esc(SECTIONS[k].label)}</option>`).join("");
}

function exportBattleBuddyReport(){
  const p=S.profile||{};
  const name=S.name||"Cadet";
  const now=new Date().toLocaleDateString();
  const aftArr=S.aft||[];
  // esc() every field below that can hold free-typed text — this builds a
  // real HTML document via document.write() (found by the v208-session
  // cross-cutting audit as a genuine stored-injection path: award titles,
  // counseling summaries, and name/rank/position are all free text with no
  // server-side sanitization, and this is the one export explicitly meant
  // to be printed/shared with a battle buddy or cadre).
  const aftRows=aftArr.slice(-5).reverse().map(a=>`<tr><td>${esc(a.date)}</td><td>${esc(a.total)}</td><td>${esc(a.scores.dl||"—")}</td><td>${esc(a.scores.hrp||"—")}</td><td>${esc(a.scores.sdc||"—")}</td><td>${esc(a.scores.plank||"—")}</td><td>${esc(a.scores.run||"—")}</td></tr>`).join("");
  const topSkills=(S.lifeSkills||[]).filter(s=>!s.group&&skEffectiveLevel(s)>0).sort((a,b)=>skEffectiveLevel(b)-skEffectiveLevel(a)).slice(0,12);
  const skillRows=topSkills.map(s=>`<li>${esc(s.name)} — Level ${skEffectiveLevel(s)} / ${s.levels&&s.levels.length}</li>`).join("");
  const awardRows=(S.awards||[]).map(a=>`<li>${esc(a.title)}</li>`).join("");
  const volHours=(S.volunteer||[]).reduce((s,v)=>s+(parseFloat(v.hours)||0),0);
  const counselRows=(S.counseling||[]).slice(-5).reverse().map(c=>`<li><b>${esc(c.date)}</b> [${esc(c.type)}]${c.people?" · "+esc(c.people):""} — ${esc(c.summary||"")}</li>`).join("");
  // The rest of these sections used to live only in Wall → Résumé (a
  // plaintext clipboard export), leaving a cadet with two partial exports and
  // no single "everything" document for a commissioning/OER-support moment —
  // reading the same underlying fields Wall's copyWallResume() reads, not
  // duplicating its logic.
  const ahRows=(S.academicHonors||[]).slice().sort((a,b)=>(b.year||0)-(a.year||0)).map(a=>`<li>${esc(a.title)}${a.org?" — "+esc(a.org):""}${a.year?" ("+esc(a.year)+")":""}</li>`).join("");
  const rr=S.rotcRecord||{};
  const rrRows=[
    ...(rr.positions||[]).map(p=>`<li>${esc(p.title)}${p.startSem?" ("+esc(p.startSem)+(p.endSem?"–"+esc(p.endSem):"")+")":""}</li>`),
    ...(rr.competitions||[]).map(c=>`<li>${esc(c.name)}${c.year?" ("+esc(c.year)+")":""}${c.placement?" — "+esc(c.placement):""}</li>`),
    ...(rr.campResults||[]).map(c=>`<li>${esc(c.camp)}${c.year?" ("+esc(c.year)+")":""}${c.rating?" — "+esc(c.rating):""}</li>`)
  ].join("");
  const mbRows=(S.memberships||[]).slice().sort((a,b)=>(b.startYear||0)-(a.startYear||0)).map(m=>{
    const yrs=m.endYear?`${m.startYear}–${m.endYear}`:m.startYear?`${m.startYear}–present`:"";
    const roles=(m.roles||[]).map(r=>esc(r.title)).join(", ");
    return `<li>${esc(m.org)}${yrs?" ("+yrs+")":""}${roles?" · "+roles:""}</li>`;
  }).join("");
  const qualRows=(S.qualifications||[]).map(q=>{
    const cat=typeof QUAL_CATALOG!=="undefined"&&QUAL_CATALOG[q.key]?QUAL_CATALOG[q.key]:null;
    const qname=q.key==="custom"?(q.label||q.key):(cat?cat.fullName:q.key);
    return `<li>${esc(qname)}${q.date?" ("+esc(q.date)+")":""}</li>`;
  }).join("");
  const langs=S.profile?.languages||[]; const clr=S.profile?.clearance;
  const langRows=langs.map(l=>`<li>${esc(l.lang)}${l.ilr?" — ILR "+esc(l.ilr):""}</li>`).join("")+((clr&&clr.level&&clr.level!=="None")?`<li>Clearance: ${esc(clr.level)}</li>`:"");
  const gpas=(S.gpaHistory||[]).slice().sort((a,b)=>termSortKey(b.term)-termSortKey(a.term));
  const curGpa=gpas.length?gpas[0].gpa:null;
  const quizBank=window.QUIZ_BANK||{}; const quizKeys=Object.keys(quizBank);
  const quizPassed=quizKeys.filter(k=>S.quizzes[k]&&S.quizzes[k].passed).length;
  const readinessLine=quizKeys.length?`Board/quiz readiness: ${Math.round(quizPassed/quizKeys.length*100)}% (${quizPassed}/${quizKeys.length} categories passed)`:null;
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Battle Buddy Report — ${esc(name)}</title>
<style>body{font-family:Arial,sans-serif;color:#111;max-width:720px;margin:20px auto;padding:0 20px}h1{font-size:22px;border-bottom:3px solid #333;padding-bottom:8px;margin-bottom:4px}h2{font-size:15px;margin-top:20px;border-bottom:1px solid #ccc;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:13px;margin-top:8px}th,td{border:1px solid #ccc;padding:5px 8px;text-align:left}th{background:#f5f5f5}ul{margin:6px 0;padding-left:20px;font-size:13px}li{margin-bottom:3px}.meta{font-size:12px;color:#777;margin-bottom:16px}p{font-size:13px}@media print{body{margin:0;padding:12px}}</style>
</head><body>
<h1>Battle Buddy Report</h1>
<div class="meta">Generated: ${esc(now)} · All data from your device only — nothing was transmitted.</div>
<h2>Identity</h2>
<p><b>Name:</b> ${esc(name)} &nbsp;|&nbsp; <b>Rank/MS:</b> ${esc(S.rank||"—")} &nbsp;|&nbsp; <b>Position:</b> ${esc(S.position||"—")}</p>
${p.commissionDate?`<p><b>Commission date:</b> ${esc(p.commissionDate)}</p>`:""}
${curGpa!=null?`<p><b>GPA:</b> ${esc(curGpa.toFixed(2))}</p>`:(p.gpa?`<p><b>GPA:</b> ${esc(p.gpa)}</p>`:"")}
${S.branchGoal?`<p><b>Branch goal:</b> ${esc(S.branchGoal)}</p>`:""}
${readinessLine?`<p><b>${esc(readinessLine)}</b></p>`:""}
<h2>AFT History (last 5)</h2>
${aftRows?`<table><thead><tr><th>Date</th><th>Total</th><th>DL</th><th>HRP</th><th>SDC</th><th>Plank</th><th>Run</th></tr></thead><tbody>${aftRows}</tbody></table>`:"<p>No AFT scores recorded.</p>"}
<h2>Top Skills</h2>
${skillRows?`<ul>${skillRows}</ul>`:"<p>No skills leveled yet.</p>"}
${ahRows?`<h2>Academic Honors</h2><ul>${ahRows}</ul>`:""}
<h2>Awards &amp; Recognitions</h2>
${awardRows?`<ul>${awardRows}</ul>`:"<p>None recorded.</p>"}
${rrRows?`<h2>ROTC Record</h2><ul>${rrRows}</ul>`:""}
${mbRows?`<h2>Memberships &amp; Leadership</h2><ul>${mbRows}</ul>`:""}
${qualRows?`<h2>Qualifications</h2><ul>${qualRows}</ul>`:""}
${langRows?`<h2>Languages &amp; Clearance</h2><ul>${langRows}</ul>`:""}
<p>Volunteer hours logged: ${esc(volHours)}</p>
${counselRows?`<h2>Counseling Log (last 5)</h2><ul>${counselRows}</ul>`:""}
<p style="margin-top:28px;font-size:11px;color:#999;">Operations · offline cadet tool · no data transmitted</p>
</body></html>`;
  const w=window.open("","_blank");
  if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),400);}
  else toast("Allow pop-ups to generate the report.");
}
const _rptBtn=document.getElementById("battleBuddyBtn");
if(_rptBtn) _rptBtn.onclick=exportBattleBuddyReport;
function copySkillHistory(){
  const started=(S.lifeSkills||[]).filter(s=>!s.group&&s.currentLevel>0&&s.levels&&s.levels.length);
  if(!started.length){ toast("No skill history to export"); return; }
  const lines=["# Skill History Export","","Date: "+new Date().toLocaleDateString(),""];
  const byPath={};
  started.forEach(s=>{ (byPath[s.cat]=byPath[s.cat]||[]).push(s); });
  (typeof SK_CAT_ORDER!=="undefined"?SK_CAT_ORDER:Object.keys(byPath)).forEach(cat=>{
    if(!byPath[cat]) return;
    const catName=(typeof SK_CAT!=="undefined"&&SK_CAT[cat])||cat;
    lines.push(`## ${catName}`);
    byPath[cat].sort((a,b)=>b.currentLevel-a.currentLevel).forEach(s=>{
      const eff=typeof skEffectiveLevel==="function"?skEffectiveLevel(s):s.currentLevel;
      const peak=s.peakLevel||eff;
      const maxLv=(s.levels||[]).length;
      const hist=(s.history||[]).filter(h=>h.type==="promote").slice(-5).map(h=>`${new Date(h.ts).toLocaleDateString()} L${h.level}`).join(" → ");
      lines.push(`- ${s.name}: L${eff}/${maxLv}${peak>eff?` (peak L${peak})`:''}${hist?` | ${hist}`:''}`);
    });
    lines.push("");
  });
  const txt=lines.join("\n");
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(()=>toast("📋 Skill history copied to clipboard")).catch(()=>toast("Copy failed"));
  } else { toast("Clipboard unavailable in this browser"); }
}
const _skHistExportBtn=document.getElementById("skHistExport");
if(_skHistExportBtn) _skHistExportBtn.onclick=copySkillHistory;

/* ---- Counseling bulk import ---- */
{
  const cnBulkText=document.getElementById("cnBulkText");
  const cnBulkPreview=document.getElementById("cnBulkPreview");
  const cnBulkPreviewBtn=document.getElementById("cnBulkPreviewBtn");
  const cnBulkCommit=document.getElementById("cnBulkCommit");
  if(cnBulkPreviewBtn&&cnBulkText&&cnBulkPreview&&cnBulkCommit){
    let _cnParsed=[];
    cnBulkPreviewBtn.onclick=()=>{
      const lines=cnBulkText.value.split("\n").map(l=>l.trim()).filter(l=>l&&!l.startsWith("#"));
      _cnParsed=lines.map(l=>{const p=l.split("|").map(s=>s.trim()); if(!p[2]&&!p[0]) return null; return {id:id(),date:p[0]||localYMD(),type:p[1]||"event",people:"",summary:p[2]||"",plan:p[3]||"",followUp:p[4]||""};}).filter(Boolean);
      if(!_cnParsed.length){cnBulkPreview.innerHTML=`<div style="color:var(--ink-faint)">Nothing to preview — use: Date | Type | Summary | Plan | FollowUp</div>`;cnBulkCommit.style.display="none";return;}
      cnBulkPreview.innerHTML=`<b>${_cnParsed.length} entr${_cnParsed.length===1?"y":"ies"} ready:</b><ul style="margin:6px 0 0 14px">${_cnParsed.map(c=>`<li>${esc(c.date)} [${esc(c.type)}] ${esc(c.summary.slice(0,50))}</li>`).join("")}</ul>`;
      cnBulkCommit.style.display="";
    };
    cnBulkCommit.onclick=()=>{
      if(!S.counseling) S.counseling=[];
      _cnParsed.forEach(e=>S.counseling.push(e));
      save(); render(); toast(`📝 Added ${_cnParsed.length} counseling entr${_cnParsed.length===1?"y":"ies"}`);
      cnBulkText.value=""; cnBulkPreview.innerHTML=""; cnBulkCommit.style.display="none"; _cnParsed=[];
    };
  }
  // bulk toggle handled by the main document.body click in awards.js
}

