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
function renderHistory(){
  const el=document.getElementById("historyArea"); if(!el) return;
  const blocks=[];
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
  blocks.push(`<div class="hist-block"><div class="hist-h">Milestones</div><div class="hist-meta">🩸 ${don} donation${don!==1?'s':''} · 📚 ${quizzes}/16 quiz banks passed · 🧪 ${(S.tests||[]).length} cognitive tests taken</div></div>`);
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
  const csv=rows.map(r=>r.map(c=>`"${String(c==null?"":c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}
function exportData(kind){
  if(kind==="aft"){ const rows=[["Date","Deadlift","Push-ups","SDC","Plank","Run","Total"]]; (S.aft||[]).forEach(a=>rows.push([new Date(a.date).toLocaleDateString(),a.scores.dl,a.scores.hrp,a.scores.sdc,a.scores.plank,a.scores.run,a.total])); downloadCSV("aft-history.csv",rows); }
  else if(kind==="awards"){ const rows=[["Title","Org","Year"]]; (S.awards||[]).forEach(a=>rows.push([a.title||a.name,a.org||"",a.year||""])); downloadCSV("awards.csv",rows); }
  else if(kind==="volunteer"){ const rows=[["Date","Activity","Hours"]]; (S.volunteer||[]).forEach(v=>rows.push([v.date||"",v.name||v.activity||"",v.hours||""])); downloadCSV("volunteer-hours.csv",rows); }
  else if(kind==="counseling"){ const rows=[["Date","Type","People","Summary","Plan"]]; (S.counseling||[]).forEach(c=>rows.push([new Date(c.date).toLocaleDateString(),c.type,c.people,c.summary,c.plan])); downloadCSV("counseling-log.csv",rows); }
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
  sec.keys.forEach(k=>{ if(payload.data[k]!==undefined && payload.data[k]!==null) S[k]=payload.data[k]; });
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
  const aftRows=aftArr.slice(-5).reverse().map(a=>`<tr><td>${a.date}</td><td>${a.total}</td><td>${a.scores.dl||"—"}</td><td>${a.scores.hrp||"—"}</td><td>${a.scores.sdc||"—"}</td><td>${a.scores.plank||"—"}</td><td>${a.scores.run||"—"}</td></tr>`).join("");
  const topSkills=(S.lifeSkills||[]).filter(s=>!s.group&&skEffectiveLevel(s)>0).sort((a,b)=>skEffectiveLevel(b)-skEffectiveLevel(a)).slice(0,12);
  const skillRows=topSkills.map(s=>`<li>${s.name} — Level ${skEffectiveLevel(s)} / ${s.levels&&s.levels.length}</li>`).join("");
  const awardRows=(S.awards||[]).map(a=>`<li>${a.n}</li>`).join("");
  const volHours=(S.events||[]).reduce((s,e)=>s+(e.hours||0),0);
  const counselRows=(S.counseling||[]).slice(-5).reverse().map(c=>`<li><b>${c.date}</b> [${c.type}]${c.people?" · "+c.people:""} — ${c.summary||""}</li>`).join("");
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Battle Buddy Report — ${name}</title>
<style>body{font-family:Arial,sans-serif;color:#111;max-width:720px;margin:20px auto;padding:0 20px}h1{font-size:22px;border-bottom:3px solid #333;padding-bottom:8px;margin-bottom:4px}h2{font-size:15px;margin-top:20px;border-bottom:1px solid #ccc;padding-bottom:4px}table{border-collapse:collapse;width:100%;font-size:13px;margin-top:8px}th,td{border:1px solid #ccc;padding:5px 8px;text-align:left}th{background:#f5f5f5}ul{margin:6px 0;padding-left:20px;font-size:13px}li{margin-bottom:3px}.meta{font-size:12px;color:#777;margin-bottom:16px}p{font-size:13px}@media print{body{margin:0;padding:12px}}</style>
</head><body>
<h1>Battle Buddy Report</h1>
<div class="meta">Generated: ${now} · All data from your device only — nothing was transmitted.</div>
<h2>Identity</h2>
<p><b>Name:</b> ${name} &nbsp;|&nbsp; <b>Rank/MS:</b> ${S.rank||"—"} &nbsp;|&nbsp; <b>Position:</b> ${S.position||"—"}</p>
${p.commissionDate?`<p><b>Commission date:</b> ${p.commissionDate}</p>`:""}
${p.gpa?`<p><b>GPA:</b> ${p.gpa}</p>`:""}
${S.branchGoal?`<p><b>Branch goal:</b> ${S.branchGoal}</p>`:""}
<h2>AFT History (last 5)</h2>
${aftRows?`<table><thead><tr><th>Date</th><th>Total</th><th>DL</th><th>HRP</th><th>SDC</th><th>Plank</th><th>Run</th></tr></thead><tbody>${aftRows}</tbody></table>`:"<p>No AFT scores recorded.</p>"}
<h2>Top Skills</h2>
${skillRows?`<ul>${skillRows}</ul>`:"<p>No skills leveled yet.</p>"}
<h2>Awards &amp; Recognitions</h2>
${awardRows?`<ul>${awardRows}</ul>`:"<p>None recorded.</p>"}
<p>Volunteer hours logged: ${volHours}</p>
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

