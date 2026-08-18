const AW_IC={award:"🎖️",coin:"🪙",cert:"📜",badge:"🏅",milestone:"⭐",memento:"📦"};
function renderAwards(){
  const el=document.getElementById("awallGrid"); if(!el) return;
  if(!S.awards.length){el.innerHTML=`<div class="aw-empty"><span class="big">🏆</span>The wall is empty. Add your first award, coin, badge, or milestone above — it fills as you earn.</div>`;}
  else{
    const lc=s=>(s||"").toLowerCase().trim();
    const sorted=S.awards.slice().sort((a,b)=>{
      const ya=a.year||0, yb=b.year||0;
      if(yb!==ya) return yb-ya;
      const oa=lc(a.org), ob=lc(b.org);
      if(oa!==ob) return oa<ob?-1:1;
      return lc(a.title)<lc(b.title)?-1:1;
    });
    // build nested groups: year -> org -> [awards]
    const years=[];
    sorted.forEach(a=>{
      const yr=a.year||"Undated"; const org=a.org||"";
      let yg=years.find(y=>y.yr===yr); if(!yg){ yg={yr,orgs:[]}; years.push(yg); }
      let og=yg.orgs.find(o=>o.org===org); if(!og){ og={org,items:[]}; yg.orgs.push(og); }
      og.items.push(a);
    });
    const card=a=>{
      const meta=[a.year?esc(String(a.year)):null, a.org?("from "+esc(a.org)):null].filter(Boolean).join(" · ");
      return `<div class="aw-card"><button class="aw-del" data-daw="${a.id}">✕</button><button class="aw-edit" data-awedit="${a.id}">✎</button><div class="aw-ic">${AW_IC[a.kind]||"🏆"}</div><div class="aw-title">${esc(a.title)}</div>${meta?`<div class="aw-meta">${meta}</div>`:""}${a.note?`<div class="aw-note">${esc(a.note)}</div>`:""}<div class="aw-date">added ${esc(a.date||"")}</div></div>`;
    };
    el.innerHTML=years.map(yg=>`<div class="wall-year-hd">${yg.yr}</div>`+
      yg.orgs.map(og=>(og.org?`<div class="wall-org-hd">${esc(og.org)}</div>`:"")+`<div class="wall-grid">${og.items.map(card).join("")}</div>`).join("")
    ).join("");
  }
  renderMemberships(); renderEvents(); renderVolunteer();
}

const MB_TYPE={founder:"★ Founder",charter:"Charter",regular:"Member",honorary:"Honorary"};
let _mbFilter="all";
function renderMemberships(){
  const el=document.getElementById("mbList"); if(!el) return;
  if(!S.memberships.length){ el.innerHTML=`<div class="aw-empty"><span class="big">🎟️</span>No memberships yet. Add organizations you belong to above.</div>`; return; }
  // update filter button active state
  document.querySelectorAll(".mb-filter").forEach(b=>b.classList.toggle("on",b.dataset.mbfilter===_mbFilter));
  const curYear=new Date().getFullYear();
  const rank={founder:0,charter:1,regular:2,honorary:3};
  const isActive=m=>!m.endYear||m.endYear>=curYear;
  let pool=S.memberships.slice();
  if(_mbFilter==="active") pool=pool.filter(isActive);
  else if(_mbFilter==="past") pool=pool.filter(m=>!isActive(m));
  if(!pool.length){ el.innerHTML=`<div style="color:var(--ink-faint);font-size:12.5px;padding:8px 0">No ${_mbFilter==="all"?"memberships":_mbFilter+" memberships"} found.</div>`; return; }
  const sorted=pool.sort((a,b)=>(rank[a.memberType]-rank[b.memberType])||((b.startYear||0)-(a.startYear||0)));
  el.innerHTML=sorted.map(m=>{
    const yrs=(m.startYear||"?")+" – "+(m.endYear||"present");
    const roles=(m.roles||[]).map(r=>`<div class="mb-role">${esc(r.title)}${r.startYear?` (${r.startYear}${r.endYear?'–'+r.endYear:'–present'})`:''}</div>`).join("");
    return `<div class="mb-card ${m.memberType}"><button class="mb-del" data-mbdel="${m.id}">✕</button><button class="mb-edit" data-mbedit="${m.id}">✎</button>
      <div class="mb-card-top"><span class="mb-org">${esc(m.org)}</span><span class="mb-type ${m.memberType}">${MB_TYPE[m.memberType]||m.memberType}</span></div>
      <div class="mb-years">${yrs}</div>
      ${roles?`<div class="mb-roles">${roles}</div>`:""}
      ${m.note?`<div class="aw-note">${esc(m.note)}</div>`:""}
    </div>`;
  }).join("");
}
function renderEvents(){
  const el=document.getElementById("evList"); if(!el) return;
  if(!S.events.length){ el.innerHTML=`<div class="aw-empty"><span class="big">📅</span>No events yet. Add competitions, ceremonies, or activities you took part in.</div>`; return; }
  const sorted=S.events.slice().sort((a,b)=>(b.year||0)-(a.year||0));
  el.innerHTML=sorted.map(ev=>{
    const meta=[ev.year?esc(String(ev.year)):null, ev.org?esc(ev.org):null].filter(Boolean).join(" · ");
    return `<div class="ev-card"><button class="ev-del" data-evdel="${ev.id}">✕</button><button class="ev-edit" data-evedit="${ev.id}">✎</button>
      <div class="ev-title">${esc(ev.title)}</div>
      ${meta?`<div class="ev-meta">${meta}</div>`:""}
      ${ev.role?`<div class="ev-role">Role: ${esc(ev.role)}</div>`:""}
      ${ev.note?`<div class="aw-note">${esc(ev.note)}</div>`:""}
    </div>`;
  }).join("");
}
// a simple filling jar for volunteer hours. `uid` makes the clipPath id unique per jar
// (two years with identical hours would otherwise collide on a shared id and mis-clip).
function volJarSVG(hours, uid){
  const ratio=Math.min(1,hours/100); // 100h fills the jar
  const top=34, bot=116, level=bot-(bot-top)*ratio;
  const cid="cv"+(uid!=null?uid:Math.round(hours*10));
  return `<svg class="jar-vessel" viewBox="0 0 80 130" preserveAspectRatio="xMidYMid meet">
    <defs><clipPath id="${cid}"><path d="M14 38 L66 38 L64 120 Q64 122 60 122 L20 122 Q16 122 16 120 Z"/></clipPath></defs>
    <path d="M22 30 L58 30 L58 38 L22 38 Z" fill="none" stroke="#9fc59a" stroke-width="2" opacity=".7"/>
    <path d="M14 38 L66 38 L64 120 Q64 122 60 122 L20 122 Q16 122 16 120 Z" fill="rgba(159,197,154,.04)" stroke="#9fc59a" stroke-width="1.8" opacity=".8"/>
    <g clip-path="url(#${cid})"><rect x="14" y="${level.toFixed(1)}" width="52" height="${(bot-level+4).toFixed(1)}" fill="rgba(159,197,154,.32)"/><rect x="14" y="${level.toFixed(1)}" width="52" height="3" fill="rgba(159,197,154,.6)"/></g>
  </svg>`;
}
function renderVolunteer(){
  const jars=document.getElementById("volJars"); if(!jars) return;
  const byYear={};
  S.volunteer.forEach(v=>{ const y=v.year||"?"; byYear[y]=(byYear[y]||0)+(parseFloat(v.hours)||0); });
  const years=Object.keys(byYear).sort((a,b)=>b-a);
  jars.innerHTML=years.length?years.map(y=>`<div class="vjar"><div>${volJarSVG(byYear[y], y)}</div><div class="vjar-year">${y}</div><div class="vjar-hours">${byYear[y]} hrs</div></div>`).join(""):`<div class="aw-empty" style="grid-column:1/-1"><span class="big">🫙</span>No volunteer hours yet. Each year you log fills its own jar.</div>`;
  const log=document.getElementById("volLog");
  log.innerHTML=S.volunteer.length?`<div class="sec-h" style="margin-top:6px"><h2>Log</h2></div>`+S.volunteer.slice().reverse().map(v=>`<div class="vol-log-row"><span>${v.year} · <b>${v.hours} hrs</b>${v.org?' · '+esc(v.org):''}</span><button class="del" data-voldel="${v.id}">✕</button></div>`).join(""):"";
}

/* ---------------- Academic Honors ---------------- */
function renderAcademicHonors(){
  const el=document.getElementById("ahGrid"); if(!el) return;
  const ah=S.academicHonors||[];
  if(!ah.length){el.innerHTML=`<div class="aw-empty"><span class="big">📚</span>No academic honors yet. Add Dean's List, scholarships, honor societies, or other academic recognitions above.</div>`;return;}
  const sorted=ah.slice().sort((a,b)=>(b.year||0)-(a.year||0));
  el.innerHTML=sorted.map(a=>{
    const meta=[a.year?esc(String(a.year)):null, a.org?esc(a.org):null].filter(Boolean).join(" · ");
    return `<div class="aw-card"><button class="aw-del" data-daoh="${a.id}">✕</button><button class="aw-edit" data-ahedit="${a.id}">✎</button><div class="aw-ic">📚</div><div class="aw-title">${esc(a.title)}</div>${meta?`<div class="aw-meta">${meta}</div>`:""}${a.note?`<div class="aw-note">${esc(a.note)}</div>`:""}<div class="aw-date">added ${esc(a.date||"")}</div></div>`;
  }).join("");
}
let _ahEditId=null;
function ahEdit(ahId){
  const a=(S.academicHonors||[]).find(x=>x.id===ahId); if(!a) return;
  document.getElementById("ahTitle").value=a.title||"";
  document.getElementById("ahOrg").value=a.org||"";
  document.getElementById("ahYear").value=a.year||"";
  document.getElementById("ahNote").value=a.note||"";
  _ahEditId=ahId;
  const btn=document.getElementById("ahAdd"); if(btn) btn.textContent="Save changes";
  if(typeof ensureEditCancelLink==="function") ensureEditCancelLink(btn, ()=>{
    _ahEditId=null; if(btn) btn.textContent="Add academic honor";
    ["ahTitle","ahOrg","ahYear","ahNote"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
  });
  document.getElementById("ahTitle").scrollIntoView({behavior:"smooth",block:"center"});
  document.getElementById("ahTitle").focus();
}
{
  const ahSave=document.getElementById("ahAdd");
  if(ahSave) ahSave.onclick=()=>{
    const title=(document.getElementById("ahTitle").value||"").trim(); if(!title){toast("Enter a title");return;}
    const org=(document.getElementById("ahOrg").value||"").trim();
    const yr=parseInt(document.getElementById("ahYear").value)||null;
    const note=(document.getElementById("ahNote").value||"").trim();
    if(!S.academicHonors) S.academicHonors=[];
    if(_ahEditId){
      const a=S.academicHonors.find(x=>x.id===_ahEditId);
      _ahEditId=null; ahSave.textContent="Add academic honor"; if(typeof hideEditCancelLink==="function") hideEditCancelLink(ahSave);
      if(a){ a.title=title; a.org=org||undefined; a.year=yr; a.note=note||undefined; toast("✎ Academic honor updated"); }
      else { toast("That academic honor was deleted — nothing to save"); }
    } else {
      S.academicHonors.push({id:id(),ts:Date.now(),date:new Date().toLocaleDateString(),title,org:org||undefined,year:yr,note:note||undefined});
      toast("📚 Academic honor added");
    }
    ["ahTitle","ahOrg","ahYear","ahNote"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
    save(); renderAcademicHonors();
  };
}

/* ---------------- ROTC Record ---------------- */
function renderRotcRecord(){
  const rr=S.rotcRecord||{positions:[],competitions:[],campResults:[]};
  const posEl=document.getElementById("rpList"), compEl=document.getElementById("rcList"), campEl=document.getElementById("campList");
  if(posEl) posEl.innerHTML=(rr.positions||[]).length?rr.positions.slice().sort((a,b)=>termSortKey(b.startSem)-termSortKey(a.startSem)).map(p=>`<div class="rotc-item"><button class="aw-del" data-drotcpos="${p.id}">✕</button><button class="aw-edit" data-rpedit="${p.id}">✎</button><div class="rotc-title">${esc(p.title)}</div><div class="rotc-meta">${esc(p.startSem||"")}${p.endSem?("–"+esc(p.endSem)):""}</div>${p.note?`<div class="aw-note">${esc(p.note)}</div>`:""}</div>`).join(""):`<div class="aw-empty" style="padding:10px">No positions yet.</div>`;
  if(compEl) compEl.innerHTML=(rr.competitions||[]).length?rr.competitions.slice().sort((a,b)=>(b.year||0)-(a.year||0)).map(c=>`<div class="rotc-item"><button class="aw-del" data-drotccomp="${c.id}">✕</button><button class="aw-edit" data-rcedit="${c.id}">✎</button><div class="rotc-title">${esc(c.name)}</div><div class="rotc-meta">${esc(c.year||"")}${c.placement?" · "+esc(c.placement):""}</div>${c.note?`<div class="aw-note">${esc(c.note)}</div>`:""}</div>`).join(""):`<div class="aw-empty" style="padding:10px">No competitions yet.</div>`;
  if(campEl) campEl.innerHTML=(rr.campResults||[]).length?rr.campResults.slice().sort((a,b)=>(b.year||0)-(a.year||0)).map(c=>`<div class="rotc-item"><button class="aw-del" data-drotccamp="${c.id}">✕</button><button class="aw-edit" data-campedit="${c.id}">✎</button><div class="rotc-title">${esc(c.camp)}</div><div class="rotc-meta">${esc(c.year||"")}${c.rating?" · "+esc(c.rating):""}</div>${c.note?`<div class="aw-note">${esc(c.note)}</div>`:""}</div>`).join(""):`<div class="aw-empty" style="padding:10px">No camp results yet.</div>`;
}
let _rpEditId=null,_rcEditId=null,_campEditId=null;
function rpEdit(pId){
  const rr=S.rotcRecord||{}; const p=(rr.positions||[]).find(x=>x.id===pId); if(!p) return;
  document.getElementById("rpTitle").value=p.title||"";
  document.getElementById("rpStart").value=p.startSem||"";
  document.getElementById("rpEnd").value=p.endSem||"";
  document.getElementById("rpNote").value=p.note||"";
  _rpEditId=pId;
  const btn=document.getElementById("rpSave"); if(btn) btn.textContent="Save changes";
  if(typeof ensureEditCancelLink==="function") ensureEditCancelLink(btn, ()=>{
    _rpEditId=null; if(btn) btn.textContent="Add position";
    ["rpTitle","rpStart","rpEnd","rpNote"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
  });
  document.getElementById("rpTitle").scrollIntoView({behavior:"smooth",block:"center"});
  document.getElementById("rpTitle").focus();
}
function rcEdit(cId){
  const rr=S.rotcRecord||{}; const c=(rr.competitions||[]).find(x=>x.id===cId); if(!c) return;
  document.getElementById("rcName").value=c.name||"";
  document.getElementById("rcYear").value=c.year||"";
  document.getElementById("rcPlacement").value=c.placement||"";
  document.getElementById("rcNote").value=c.note||"";
  _rcEditId=cId;
  const btn=document.getElementById("rcSave"); if(btn) btn.textContent="Save changes";
  if(typeof ensureEditCancelLink==="function") ensureEditCancelLink(btn, ()=>{
    _rcEditId=null; if(btn) btn.textContent="Add competition";
    ["rcName","rcYear","rcPlacement","rcNote"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
  });
  document.getElementById("rcName").scrollIntoView({behavior:"smooth",block:"center"});
  document.getElementById("rcName").focus();
}
function campEdit(cId){
  const rr=S.rotcRecord||{}; const c=(rr.campResults||[]).find(x=>x.id===cId); if(!c) return;
  document.getElementById("campName").value=c.camp||"";
  document.getElementById("campYear").value=c.year||"";
  document.getElementById("campRating").value=c.rating||"";
  document.getElementById("campNote").value=c.note||"";
  _campEditId=cId;
  const btn=document.getElementById("campSave"); if(btn) btn.textContent="Save changes";
  if(typeof ensureEditCancelLink==="function") ensureEditCancelLink(btn, ()=>{
    _campEditId=null; if(btn) btn.textContent="Add camp result";
    ["campName","campYear","campRating","campNote"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
  });
  document.getElementById("campName").scrollIntoView({behavior:"smooth",block:"center"});
  document.getElementById("campName").focus();
}
{
  const rpSave=document.getElementById("rpSave");
  if(rpSave) rpSave.onclick=()=>{
    const title=(document.getElementById("rpTitle").value||"").trim(); if(!title){toast("Enter a position title");return;}
    const start=(document.getElementById("rpStart").value||"").trim();
    const end=(document.getElementById("rpEnd").value||"").trim();
    const note=(document.getElementById("rpNote").value||"").trim();
    if(!S.rotcRecord) S.rotcRecord={positions:[],competitions:[],campResults:[]};
    if(!S.rotcRecord.positions) S.rotcRecord.positions=[];
    if(_rpEditId){
      const p=S.rotcRecord.positions.find(x=>x.id===_rpEditId);
      _rpEditId=null; rpSave.textContent="Add position"; if(typeof hideEditCancelLink==="function") hideEditCancelLink(rpSave);
      if(p){ p.title=title; p.startSem=start||undefined; p.endSem=end||undefined; p.note=note||undefined; toast("✎ Position updated"); }
      else { toast("That position was deleted — nothing to save"); }
    } else {
      S.rotcRecord.positions.push({id:id(),title,startSem:start||undefined,endSem:end||undefined,note:note||undefined});
      toast("⭐ Position added");
    }
    ["rpTitle","rpStart","rpEnd","rpNote"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
    save(); renderRotcRecord();
  };
  const rcSave=document.getElementById("rcSave");
  if(rcSave) rcSave.onclick=()=>{
    const name=(document.getElementById("rcName").value||"").trim(); if(!name){toast("Enter a competition name");return;}
    const yr=parseInt(document.getElementById("rcYear").value)||null;
    const placement=(document.getElementById("rcPlacement").value||"").trim();
    const note=(document.getElementById("rcNote").value||"").trim();
    if(!S.rotcRecord) S.rotcRecord={positions:[],competitions:[],campResults:[]};
    if(!S.rotcRecord.competitions) S.rotcRecord.competitions=[];
    if(_rcEditId){
      const c=S.rotcRecord.competitions.find(x=>x.id===_rcEditId);
      _rcEditId=null; rcSave.textContent="Add competition"; if(typeof hideEditCancelLink==="function") hideEditCancelLink(rcSave);
      if(c){ c.name=name; c.year=yr; c.placement=placement||undefined; c.note=note||undefined; toast("✎ Competition updated"); }
      else { toast("That competition was deleted — nothing to save"); }
    } else {
      S.rotcRecord.competitions.push({id:id(),name,year:yr,placement:placement||undefined,note:note||undefined});
      toast("⭐ Competition added");
    }
    ["rcName","rcYear","rcPlacement","rcNote"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
    save(); renderRotcRecord();
  };
  const campSave=document.getElementById("campSave");
  if(campSave) campSave.onclick=()=>{
    const camp=(document.getElementById("campName").value||"").trim(); if(!camp){toast("Enter a camp name");return;}
    const yr=parseInt(document.getElementById("campYear").value)||null;
    const rating=(document.getElementById("campRating").value||"").trim();
    const note=(document.getElementById("campNote").value||"").trim();
    if(!S.rotcRecord) S.rotcRecord={positions:[],competitions:[],campResults:[]};
    if(!S.rotcRecord.campResults) S.rotcRecord.campResults=[];
    if(_campEditId){
      const c=S.rotcRecord.campResults.find(x=>x.id===_campEditId);
      _campEditId=null; campSave.textContent="Add camp result"; if(typeof hideEditCancelLink==="function") hideEditCancelLink(campSave);
      if(c){ c.camp=camp; c.year=yr; c.rating=rating||undefined; c.note=note||undefined; toast("✎ Camp result updated"); }
      else { toast("That camp result was deleted — nothing to save"); }
    } else {
      S.rotcRecord.campResults.push({id:id(),camp,year:yr,rating:rating||undefined,note:note||undefined});
      toast("⭐ Camp result added");
    }
    ["campName","campYear","campRating","campNote"].forEach(x=>{const el=document.getElementById(x);if(el)el.value="";});
    save(); renderRotcRecord();
  };
}

/* ---------------- Wall → Résumé copy ---------------- */
function copyWallResume(){
  const lines=[];
  const ah=S.academicHonors||[];
  if(ah.length){ lines.push("ACADEMIC HONORS"); ah.slice().sort((a,b)=>(b.year||0)-(a.year||0)).forEach(a=>lines.push(`  ${a.title}${a.org?" — "+a.org:""}${a.year?" ("+a.year+")":""}${a.note?" · "+a.note:""}`)); }
  if(S.awards.length){ lines.push("","AWARDS & HONORS"); S.awards.slice().sort((a,b)=>(b.year||0)-(a.year||0)).forEach(a=>lines.push(`  ${a.title}${a.org?" — "+a.org:""}${a.year?" ("+a.year+")":""}${a.note?" · "+a.note:""}`)); }
  const rr=S.rotcRecord||{};
  if((rr.positions||[]).length||(rr.competitions||[]).length||(rr.campResults||[]).length){
    lines.push("","ROTC RECORD");
    (rr.positions||[]).forEach(p=>lines.push(`  ${p.title}${p.startSem?" ("+p.startSem+(p.endSem?"–"+p.endSem:"")+")":""}`));
    (rr.competitions||[]).forEach(c=>lines.push(`  ${c.name}${c.year?" ("+c.year+")":""}${c.placement?" — "+c.placement:""}`));
    (rr.campResults||[]).forEach(c=>lines.push(`  ${c.camp}${c.year?" ("+c.year+")":""}${c.rating?" — "+c.rating:""}`));
  }
  if(S.memberships.length){ lines.push("","MEMBERSHIPS & LEADERSHIP"); S.memberships.slice().sort((a,b)=>(b.startYear||0)-(a.startYear||0)).forEach(m=>{ const yrs=m.endYear?`${m.startYear}–${m.endYear}`:m.startYear?`${m.startYear}–present`:""; const roles=(m.roles||[]).map(r=>r.title).join(", "); lines.push(`  ${m.org}${yrs?" ("+yrs+")":""}${m.memberType&&m.memberType!=="regular"?" — "+m.memberType:""}${roles?" · "+roles:""}`); }); }
  if(S.events.length){ lines.push("","EVENTS & COMPETITIONS"); S.events.slice().sort((a,b)=>(b.year||0)-(a.year||0)).forEach(e=>lines.push(`  ${e.title}${e.org?" — "+e.org:""}${e.year?" ("+e.year+")":""}${e.role?" · "+e.role:""}`)); }
  if(S.volunteer.length){ lines.push("","VOLUNTEER SERVICE"); const byOrg={}; S.volunteer.forEach(v=>{const k=v.org||"General";byOrg[k]=(byOrg[k]||0)+(parseFloat(v.hours)||0);}); Object.entries(byOrg).forEach(([org,h])=>lines.push(`  ${org}${h>0?": "+h+" hrs":""}`)); }
  if((S.qualifications||[]).length){ lines.push("","QUALIFICATIONS"); S.qualifications.forEach(q=>{const cat=typeof QUAL_CATALOG!=="undefined"&&QUAL_CATALOG[q.key]?QUAL_CATALOG[q.key]:null; const name=q.key==="custom"?(q.label||q.key):cat?cat.fullName:q.key; lines.push(`  ${name}${q.date?" ("+q.date+")":""}`);});}
  const langs=S.profile?.languages||[];
  const clr=S.profile?.clearance;
  if(langs.length||(clr&&clr.level&&clr.level!=="None")){ lines.push("","LANGUAGES & CLEARANCE"); langs.forEach(l=>lines.push(`  ${l.lang}${l.ilr?" — ILR "+l.ilr:""}${l.notes?" ("+l.notes+")":""}`)); if(clr&&clr.level&&clr.level!=="None") lines.push(`  Clearance: ${clr.level}${clr.grantedDate?" ("+clr.grantedDate+")":""}`); }
  navigator.clipboard.writeText(lines.join("\n")).then(()=>toast("📋 Wall copied to clipboard")).catch(()=>toast("Copy failed — try again"));
}
{
  const rb=document.getElementById("wallResumeBtn");
  if(rb) rb.onclick=copyWallResume;
}

/* ---------------- Bulk-entry wizard ---------------- */
function _bulkPreviewAw(lines){
  return lines.map(l=>{const p=l.split("|").map(s=>s.trim()); if(p.length<1||!p[0]) return null; return {title:p[0],org:p[1]||"",year:parseInt(p[2])||null,note:p[3]||""};}).filter(Boolean);
}
function _bulkPreviewMb(lines){
  return lines.map(l=>{const p=l.split("|").map(s=>s.trim()); if(!p[0]) return null; return {org:p[0],startYear:parseInt(p[1])||null,endYear:parseInt(p[2])||null,memberType:p[3]||"regular",note:p[4]||""};}).filter(Boolean);
}
function _bulkPreviewEv(lines){
  return lines.map(l=>{const p=l.split("|").map(s=>s.trim()); if(p.length<1||!p[0]) return null; return {title:p[0],org:p[1]||"",year:parseInt(p[2])||null,role:p[3]||"",note:p[4]||""};}).filter(Boolean);
}
function _bulkPreviewVol(lines){
  return lines.map(l=>{const p=l.split("|").map(s=>s.trim()); if(!p[0]) return null; return {org:p[0],year:parseInt(p[1])||null,hours:parseFloat(p[2])||0,note:p[3]||""};}).filter(Boolean);
}
function _bulkSetup(textId, previewId, previewBtnId, commitBtnId, parseFn, commitFn){
  const textarea=document.getElementById(textId);
  const previewEl=document.getElementById(previewId);
  const previewBtn=document.getElementById(previewBtnId);
  const commitBtn=document.getElementById(commitBtnId);
  if(!textarea||!previewEl||!previewBtn||!commitBtn) return;
  let _parsed=[];
  previewBtn.onclick=()=>{
    const lines=textarea.value.split("\n").map(l=>l.trim()).filter(l=>l&&!l.startsWith("#"));
    _parsed=parseFn(lines);
    if(!_parsed.length){previewEl.innerHTML=`<div style="color:var(--ink-faint)">Nothing to preview — check your format.</div>`; commitBtn.style.display="none"; return;}
    previewEl.innerHTML=`<b>${_parsed.length} entr${_parsed.length===1?"y":"ies"} ready:</b><ul style="margin:6px 0 0 14px">${_parsed.map(x=>`<li>${esc(Object.values(x).filter(v=>v&&v!==0&&v!==null).slice(0,4).join(" · "))}</li>`).join("")}</ul>`;
    commitBtn.style.display="";
  };
  commitBtn.onclick=()=>{ commitFn(_parsed); textarea.value=""; previewEl.innerHTML=""; commitBtn.style.display="none"; _parsed=[]; };
}
// Wire up all bulk panels after DOM ready
{
  const d=new Date().toLocaleDateString();
  _bulkSetup("awBulkText","awBulkPreview","awBulkPreviewBtn","awBulkCommit",_bulkPreviewAw,parsed=>{
    parsed.forEach(e=>{S.awards.push({id:id(),ts:Date.now(),date:d,kind:"award",title:e.title,org:e.org||undefined,year:e.year,note:e.note||undefined});});
    save(); renderAwards(); toast(`🏆 Added ${parsed.length} award${parsed.length===1?"":"s"}`);
  });
  _bulkSetup("ahBulkText","ahBulkPreview","ahBulkPreviewBtn","ahBulkCommit",_bulkPreviewAw,parsed=>{
    if(!S.academicHonors) S.academicHonors=[];
    parsed.forEach(e=>{S.academicHonors.push({id:id(),ts:Date.now(),date:d,title:e.title,org:e.org||undefined,year:e.year,note:e.note||undefined});});
    save(); renderAcademicHonors(); toast(`📚 Added ${parsed.length} academic honor${parsed.length===1?"":"s"}`);
  });
  _bulkSetup("mbBulkText","mbBulkPreview","mbBulkPreviewBtn","mbBulkCommit",_bulkPreviewMb,parsed=>{
    parsed.forEach(e=>{S.memberships.push({id:id(),org:e.org,startYear:e.startYear,endYear:e.endYear||null,memberType:e.memberType||"regular",roles:[],note:e.note||""});});
    save(); renderMemberships(); toast(`🎟️ Added ${parsed.length} membership${parsed.length===1?"":"s"}`);
  });
  _bulkSetup("evBulkText","evBulkPreview","evBulkPreviewBtn","evBulkCommit",_bulkPreviewEv,parsed=>{
    parsed.forEach(e=>{S.events.push({id:id(),title:e.title,org:e.org||undefined,year:e.year,role:e.role||undefined,note:e.note||undefined});});
    save(); renderEvents(); toast(`📅 Added ${parsed.length} event${parsed.length===1?"":"s"}`);
  });
  _bulkSetup("volBulkText","volBulkPreview","volBulkPreviewBtn","volBulkCommit",_bulkPreviewVol,parsed=>{
    parsed.forEach(e=>{S.volunteer.push({id:id(),org:e.org,year:e.year,hours:e.hours,note:e.note||undefined});});
    save(); renderVolunteer(); toast(`🫙 Added ${parsed.length} volunteer entr${parsed.length===1?"y":"ies"}`);
  });
}
// Bulk panel toggle
document.body.addEventListener("click",e=>{
  const bt=e.target.closest("[data-bulktoggle]");
  if(bt){ const wrap=document.getElementById(bt.dataset.bulktoggle); if(wrap){ const open=wrap.style.display!=="none"; wrap.style.display=open?"none":"block"; bt.textContent=open?"Bulk add…":"Hide bulk add"; } return; }
  const mbfilter=e.target.closest("[data-mbfilter]");
  if(mbfilter){ _mbFilter=mbfilter.dataset.mbfilter; renderMemberships(); return; }
  const daoh=e.target.closest("[data-daoh]");
  if(daoh){if(confirm("Remove this academic honor?")){S.academicHonors=(S.academicHonors||[]).filter(a=>a.id!==daoh.dataset.daoh);save();renderAcademicHonors();}return;}
  const ahedit=e.target.closest("[data-ahedit]");
  if(ahedit){ahEdit(ahedit.dataset.ahedit);return;}
  const drotcpos=e.target.closest("[data-drotcpos]");
  if(drotcpos){if(!S.rotcRecord) return; S.rotcRecord.positions=(S.rotcRecord.positions||[]).filter(p=>p.id!==drotcpos.dataset.drotcpos);save();renderRotcRecord();return;}
  const rpedit=e.target.closest("[data-rpedit]");
  if(rpedit){rpEdit(rpedit.dataset.rpedit);return;}
  const drotccomp=e.target.closest("[data-drotccomp]");
  if(drotccomp){if(!S.rotcRecord) return; S.rotcRecord.competitions=(S.rotcRecord.competitions||[]).filter(c=>c.id!==drotccomp.dataset.drotccomp);save();renderRotcRecord();return;}
  const rcedit=e.target.closest("[data-rcedit]");
  if(rcedit){rcEdit(rcedit.dataset.rcedit);return;}
  const drotccamp=e.target.closest("[data-drotccamp]");
  if(drotccamp){if(!S.rotcRecord) return; S.rotcRecord.campResults=(S.rotcRecord.campResults||[]).filter(c=>c.id!==drotccamp.dataset.drotccamp);save();renderRotcRecord();return;}
  const campedit=e.target.closest("[data-campedit]");
  if(campedit){campEdit(campedit.dataset.campedit);return;}
});

/* ---------------- Qualifications ---------------- */
function renderQuals(){
  const el=document.getElementById("qualsList"); if(!el) return;
  const quals=S.qualifications||[];
  if(!quals.length){
    el.innerHTML=`<div class="aw-empty"><span class="big">🎗️</span>No qualifications logged yet. Log a CWST, BRM score, CLS, or land nav pass to automatically advance the matching skill.</div>`;
    return;
  }
  const QCAT_COLOR={physical:"var(--jade)",tactical:"var(--blood)",cognitive:"var(--violet)"};
  el.innerHTML=quals.slice().reverse().map(q=>{
    const cat=typeof QUAL_CATALOG!=="undefined"&&QUAL_CATALOG[q.key]?QUAL_CATALOG[q.key]:null;
    const fullName=q.key==="custom"?(q.label||q.key):cat?cat.fullName:q.key;
    const catLabel=q.key==="custom"?"custom":cat?cat.cat:"";
    const advancedLines=(q.skills||[]).filter(s=>s.toLevel>s.fromLevel).map(s=>`${esc(s.skillName)} L${s.fromLevel}→${s.toLevel}`).join(" · ");
    const today2=typeof localYMD==="function"?localYMD():new Date().toISOString().slice(0,10);
    const expiresNote=q.expires?(q.expires<=today2?`<span class="qual-expired">⚠️ expired ${q.expires}</span>`:`<span class="qual-expiry">expires ${q.expires}</span>`):"";
    return `<div class="qual-card">
      <button class="aw-del" data-qualdel="${q.id}">✕</button>
      ${catLabel?`<span class="qual-badge" style="background:${QCAT_COLOR[catLabel]||'var(--ink-faint)'}">${catLabel}</span>`:''}
      <div class="qual-name">${esc(fullName)}</div>
      <div class="qual-meta">${q.date||''}${advancedLines?` · ${advancedLines}`:''}${expiresNote?` · ${expiresNote}`:''}</div>
    </div>`;
  }).join("");
}

// update the preview when a qual is selected
{
  const qsel=document.getElementById("qualKey");
  const qprev=document.getElementById("qualPreview");
  const qcustom=document.getElementById("qualCustomName");
  function _qualUpdatePreview(){
    if(!qsel||!qprev) return;
    const key=qsel.value;
    if(qcustom) qcustom.style.display=(key==="custom")?"":"none";
    if(!key){qprev.innerHTML="";return;}
    if(key==="custom"){qprev.innerHTML=`<div class="qual-preview"><b>Custom qualification</b> — logged by name only, no skill advancement.</div>`;return;}
    if(typeof QUAL_CATALOG==="undefined"||!QUAL_CATALOG[key]){qprev.innerHTML="";return;}
    const cat=QUAL_CATALOG[key];
    const lines=cat.skills.map(s=>{
      const sk=S.lifeSkills.find(x=>x.name===s.name);
      const cur=sk?skEffectiveLevel(sk):0;
      const adv=s.level>cur?` <b>L${cur}→${s.level}</b>`:` <span style="color:var(--ink-faint)">already at L${cur}≥${s.level}, no change</span>`;
      return `<div class="qual-preview-row">${esc(s.name)}${adv}</div>`;
    }).join("");
    qprev.innerHTML=`<div class="qual-preview"><b>This will advance:</b>${lines}</div>`;
  }
  if(qsel) qsel.addEventListener("change",_qualUpdatePreview);
  // save handler
  const qsave=document.getElementById("qualSave");
  if(qsave) qsave.onclick=()=>{
    const key=qsel?qsel.value:""; if(!key){toast("Select a qualification first");return;}
    const dateVal=document.getElementById("qualDate").value||new Date().toLocaleDateString();
    const expiresVal=document.getElementById("qualExpires")?document.getElementById("qualExpires").value:"";
    const clearForm=()=>{
      if(qsel) qsel.value=""; if(qprev) qprev.innerHTML=""; if(qcustom){qcustom.value="";qcustom.style.display="none";}
      if(document.getElementById("qualDate")) document.getElementById("qualDate").value="";
      if(document.getElementById("qualExpires")) document.getElementById("qualExpires").value="";
    };
    // custom qualification — no catalog lookup, no skill advancement
    if(key==="custom"){
      const customName=(qcustom?qcustom.value.trim():""); if(!customName){toast("Enter a name for this qualification");return;}
      if(!S.qualifications) S.qualifications=[];
      const entry={id:id(),key:"custom",label:customName,date:dateVal,skills:[]};
      if(expiresVal) entry.expires=expiresVal;
      S.qualifications.push(entry);
      save(); render(); toast(`🎗️ ${esc(customName)} logged`);
      clearForm(); return;
    }
    const cat=typeof QUAL_CATALOG!=="undefined"?QUAL_CATALOG[key]:null; if(!cat){toast("Unknown qualification");return;}
    const advancedSkills=[];
    cat.skills.forEach(spec=>{
      const sk=S.lifeSkills.find(x=>x.name===spec.name);
      if(!sk) return; // skill not in this cadet's tree
      const before=sk.currentLevel;
      if(spec.level>before){
        sk.currentLevel=spec.level;
        skUpdatePeak(sk);
        sk.lastQuestTs=Date.now();
        sk.history.push({ts:Date.now(),type:"qualify",level:spec.level});
        if(!S.pathXP) S.pathXP={}; S.pathXP.academic=(S.pathXP.academic||0)+15;
        advancedSkills.push({skillName:spec.name,fromLevel:before,toLevel:spec.level});
      } else {
        advancedSkills.push({skillName:spec.name,fromLevel:before,toLevel:before});
      }
    });
    if(!S.qualifications) S.qualifications=[];
    const entry={id:id(),key,date:dateVal,skills:advancedSkills};
    if(expiresVal) entry.expires=expiresVal;
    S.qualifications.push(entry);
    save(); render();
    const adv=advancedSkills.filter(s=>s.toLevel>s.fromLevel);
    if(adv.length) toast(`🎗️ ${esc(cat.fullName.split("—")[0].trim())} logged · ${adv.map(s=>`${esc(s.skillName)} Lv ${s.toLevel}`).join(", ")}`);
    else toast(`🎗️ ${esc(cat.fullName.split("—")[0].trim())} logged`);
    clearForm();
  };
}

/* ---------------- Weight mirror + Awards handlers ---------------- */
document.body.addEventListener("click",e=>{
  const daw=e.target.closest("[data-daw]");
  if(daw){if(confirm("Remove this from the wall?")){S.awards=S.awards.filter(a=>a.id!==daw.dataset.daw);save();render();}return;}
  const qualdel=e.target.closest("[data-qualdel]");
  if(qualdel){if(confirm("Remove this qualification log entry?")){S.qualifications=(S.qualifications||[]).filter(q=>q.id!==qualdel.dataset.qualdel);save();render();}return;}
  const pta=e.target.closest("[data-pta]");
  if(pta){ if(!_ptSel)_ptSel=new Set(); const k=pta.dataset.pta;
    const onByText=_ptTextAreas.has(k), onByManual=_ptSel.has(k);
    if(onByManual){ _ptSel.delete(k); }
    else if(onByText){ _ptTextAreas.delete(k); }   // tapping off a text-detected area removes it
    else { _ptSel.add(k); }
    renderPT(); return; }
  const dpt=e.target.closest("[data-dpt]");
  if(dpt){ S.ptLog=S.ptLog.filter(p=>p.id!==dpt.dataset.dpt); save(); render(); return; }
  // skills
  const skrm=e.target.closest("[data-skrm]"); if(skrm){ _skLevels.splice(+skrm.dataset.skrm,1); if(!_skLevels.length)_skLevels=[""]; renderSkLevelInputs(); return; }
  const skpass=e.target.closest("[data-skpass]"); if(skpass){ skPass(skpass.dataset.skpass); return; }
  const skreach=e.target.closest("[data-skreach]"); if(skreach){
    const skId=skreach.dataset.skreach, lvl=+skreach.dataset.skreachlvl;
    const sk=S.lifeSkills.find(x=>x.id===skId);
    if(sk){
      const ab=sk.levels[lvl-1];
      if(confirm(`Mark Level ${lvl} reached for "${sk.name}"?\n\nL${lvl}: ${ab?ab.ability:''}`)){
        const noteEl=document.querySelector(`[data-sknote="${skId}"]`);
        const note=noteEl?noteEl.value:"";
        skReachLevel(skId, lvl, note);
        if(noteEl) noteEl.value="";
      }
    }
    return;
  }
  const skskip=e.target.closest("[data-skskip]"); if(skskip){ skSkip(skskip.dataset.skskip); return; }
  const skdel=e.target.closest("[data-skdel]"); if(skdel){ if(confirm("Delete this skill?")){ S.lifeSkills=S.lifeSkills.filter(s=>s.id!==skdel.dataset.skdel); save(); render(); } return; }
  // wall delete + role-draft remove
  const mbdel=e.target.closest("[data-mbdel]"); if(mbdel){ if(confirm("Remove this membership?")){ S.memberships=S.memberships.filter(m=>m.id!==mbdel.dataset.mbdel); save(); render(); } return; }
  const mbrrm=e.target.closest("[data-mbrrm]"); if(mbrrm){ _mbRoles.splice(+mbrrm.dataset.mbrrm,1); renderMbRoleInputs(); return; }
  const evdel=e.target.closest("[data-evdel]"); if(evdel){ if(confirm("Remove this event?")){ S.events=S.events.filter(x=>x.id!==evdel.dataset.evdel); save(); render(); } return; }
  const voldel=e.target.closest("[data-voldel]"); if(voldel){ S.volunteer=S.volunteer.filter(v=>v.id!==voldel.dataset.voldel); save(); render(); return; }
  // Habit done/delete/starter/calendar-toggle handlers now live in events.js and
  // dailies.js — Habits merged into the unified S.dailies list in v168.
  const teststart=e.target.closest("[data-teststart]"); if(teststart){ const tid=teststart.dataset.teststart; if(tid==="reaction")startReaction(); else if(tid==="digitspan")startDigitSpan(); else if(tid==="typing")startTyping(); else if(tid==="nback")startNback(); else if(tid==="gonogo")startGoNoGo(); else if(tid==="procspeed")startProcSpeed(); else if(tid==="mathsprint")startMathSprint(); else if(tid==="patterns")startPatterns(); return; }
  const rdstart=e.target.closest("[data-rdstart]"); if(rdstart){ if(typeof startReading==="function") startReading(); return; }
  const srsReview=e.target.closest("[data-srsreview]"); if(srsReview){ startSrsReview(srsReview.dataset.srsreview); return; }
  const srsGradeBtn=e.target.closest("[data-srsgrade]"); if(srsGradeBtn){ srsGrade(parseInt(srsGradeBtn.dataset.srsgrade)); return; }
  const srsAdd=e.target.closest("[data-srsadd]"); if(srsAdd){ const d=S.srsDecks.find(x=>x.id===srsAdd.dataset.srsadd); if(d){ const front=(prompt("Front of card (question/prompt):")||"").trim(); if(!front)return; const back=(prompt("Back of card (answer):")||"").trim(); if(!back)return; d.cards.push({id:id(),front,back,due:0,interval:0,ease:2.5,reps:0}); save(); render(); } return; }
  const srsDel=e.target.closest("[data-srsdel]"); if(srsDel){ if(confirm("Delete this deck and all its cards?")){ S.srsDecks=S.srsDecks.filter(x=>x.id!==srsDel.dataset.srsdel); save(); render(); } return; }
  const palAdd=e.target.closest("[data-paladd]"); if(palAdd){ const p=S.palaces.find(x=>x.id===palAdd.dataset.paladd); if(p){ const card=palAdd.closest(".palace"); const place=card.querySelector(".pal-place").value.trim(); const item=card.querySelector(".pal-item").value.trim(); if(!place||!item){toast("Enter both a place and an item");return;} p.loci.push({place,item}); save(); render(); } return; }
  const palTest=e.target.closest("[data-paltest]"); if(palTest){ palaceTest(palTest.dataset.paltest); return; }
  const palDel=e.target.closest("[data-paldel]"); if(palDel){ if(confirm("Delete this palace?")){ S.palaces=S.palaces.filter(x=>x.id!==palDel.dataset.paldel); save(); render(); } return; }
  const studyDone=e.target.closest("[data-studydone]"); if(studyDone){ const [pid,...rest]=studyDone.dataset.studydone.split("|"); const key=rest.join("|"); const pl=S.studyPlans.find(x=>x.id===pid); if(pl){ pl.done=pl.done||[]; if(!pl.done.includes(key)){ pl.done.push(key); const qsk=S.lifeSkills.find(s=>s.name==="Study & retention"); if(qsk&&qsk.currentLevel>0) qsk.lastQuestTs=Date.now(); save(); render(); toast("✅ Review done"); } } return; }
  const studyDel=e.target.closest("[data-studydel]"); if(studyDel){ if(confirm("Delete this study plan?")){ S.studyPlans=S.studyPlans.filter(x=>x.id!==studyDel.dataset.studydel); save(); render(); } return; }
  const skwork=e.target.closest("[data-skwork]"); if(skwork){ const panel=document.getElementById("skwork-"+skwork.dataset.skwork); if(panel){ if(panel.innerHTML){ panel.innerHTML=""; } else { panel.innerHTML=skWorkGuidance(S.lifeSkills.find(s=>s.id===skwork.dataset.skwork)); } } return; }
  const goTab=e.target.closest("[data-gototab]"); if(goTab){ const tb=document.querySelector(`#sideNav button[data-tab="${goTab.dataset.gototab}"]`); if(tb) tb.click(); return; }
  const mockAftBtn=e.target.closest("[data-mockaft]"); if(mockAftBtn){ if(typeof openMockAft==="function") openMockAft(mockAftBtn.dataset.mockaft); return; }
  const gymDayBtn=e.target.closest("[data-gymday]"); if(gymDayBtn){ const d=+gymDayBtn.dataset.gymday; if(!_gymEditDraft) _gymEditDraft=weekGymPatternForEditing(); _gymEditDraft[d]=!_gymEditDraft[d]; renderGymAccessUI(); return; }
  const gymConfirmBtn=e.target.closest("#gymConfirmWeekBtn"); if(gymConfirmBtn){ confirmWeekGymPattern(_gymEditDraft||weekGymPatternForEditing()); save(); render(); toast("✅ This week's gym access confirmed"); return; }
  const gymDefaultBtn=e.target.closest("#gymSaveDefaultBtn"); if(gymDefaultBtn){ saveDefaultGymPattern(_gymEditDraft||weekGymPatternForEditing()); save(); render(); toast("✅ Saved as your usual pattern"); return; }
  const gymLiveBtn=e.target.closest("[data-gymlive]"); if(gymLiveBtn){ const v=gymLiveBtn.dataset.gymlive; if(v==="clear"){ if(S.gymAccessLive) delete S.gymAccessLive[localYMD()]; } else { setGymAccessToday(v==="1"); } save(); render(); return; }
  const ptDayBtn=e.target.closest("[data-ptday]"); if(ptDayBtn){ const d=+ptDayBtn.dataset.ptday; if(!_ptEditDraft) _ptEditDraft=weekPtPatternForEditing(); _ptEditDraft[d]=!_ptEditDraft[d]; renderPtDayUI(); return; }
  const ptConfirmBtn=e.target.closest("#ptConfirmWeekBtn"); if(ptConfirmBtn){ confirmWeekPtPattern(_ptEditDraft||weekPtPatternForEditing()); save(); render(); toast("✅ This week's PT days confirmed"); return; }
  const ptDefaultBtn=e.target.closest("#ptSaveDefaultBtn"); if(ptDefaultBtn){ saveDefaultPtPattern(_ptEditDraft||weekPtPatternForEditing()); save(); render(); toast("✅ Saved as your usual PT pattern"); return; }
  // ── Equipment profiles + optional sessions (FM-2) ──
  const equipEditBtn=e.target.closest("[data-equipedit]"); if(equipEditBtn){ _equipEditProfile=equipEditBtn.dataset.equipedit; renderEquipProfileUI(); return; }
  const equipActiveBtn=e.target.closest("[data-equipactive]"); if(equipActiveBtn){ S.activeEquipProfile=equipActiveBtn.dataset.equipactive; save(); render(); toast(`✅ Active profile: ${esc(S.activeEquipProfile)}`); return; }
  const equipTagBtn=e.target.closest("[data-equiptag]"); if(equipTagBtn){ const k=equipTagBtn.dataset.equiptag; const p=S.equipProfiles[_equipEditProfile]; if(p){ p.tags=p.tags||[]; const i=p.tags.indexOf(k); if(i<0) p.tags.push(k); else p.tags.splice(i,1); save(); render(); } return; }
  const equipNewBtn=e.target.closest("[data-equipnew]"); if(equipNewBtn){ const name=(prompt("New equipment profile name:")||"").trim(); if(!name||S.equipProfiles[name]) return; S.equipProfiles[name]={tags:[]}; _equipEditProfile=name; save(); render(); return; }
  const equipRenameBtn=e.target.closest("[data-equiprename]"); if(equipRenameBtn){ const old=equipRenameBtn.dataset.equiprename; const name=(prompt("Rename profile:",old)||"").trim(); if(!name||name===old||S.equipProfiles[name]) return; S.equipProfiles[name]=S.equipProfiles[old]; delete S.equipProfiles[old]; if(S.activeEquipProfile===old) S.activeEquipProfile=name; if(_equipEditProfile===old) _equipEditProfile=name; save(); render(); return; }
  const equipDelBtn=e.target.closest("[data-equipdel]"); if(equipDelBtn){ const name=equipDelBtn.dataset.equipdel; if(Object.keys(S.equipProfiles).length<=1) return; if(confirm(`Delete equipment profile "${name}"?`)){ delete S.equipProfiles[name]; if(S.activeEquipProfile===name) S.activeEquipProfile=Object.keys(S.equipProfiles)[0]; _equipEditProfile=null; save(); render(); } return; }
  const equipOptBtn=e.target.closest("[data-equipopt]"); if(equipOptBtn && !equipOptBtn.disabled){ const k=equipOptBtn.dataset.equipopt; if(!S.optionalSessions) S.optionalSessions=[]; const i=S.optionalSessions.indexOf(k); if(i<0) S.optionalSessions.push(k); else S.optionalSessions.splice(i,1); save(); render(); return; }
  const exSwapBtn=e.target.closest("[data-exswap]"); if(exSwapBtn){ toggleExSwap(exSwapBtn.dataset.exswap); return; }
  const exPickBtn=e.target.closest("[data-expick]"); if(exPickBtn){ const [skey,slotIdx,idx]=exPickBtn.dataset.expick.split("|"); setExerciseChoice(skey,+slotIdx,+idx); _exSwapOpen=null; save(); render(); return; }
  const cndel=e.target.closest("[data-cndel]"); if(cndel){ if(confirm("Delete this entry?")){ S.counseling=S.counseling.filter(c=>c.id!==cndel.dataset.cndel); save(); render(); } return; }
  const aardel=e.target.closest("[data-aardel]"); if(aardel){ if(confirm("Delete this AAR?")){ S.aarLog=S.aarLog.filter(a=>a.id!==aardel.dataset.aardel); save(); render(); } return; }
  const cltemplate=e.target.closest("[data-cltemplate]"); if(cltemplate){ const t=cltemplate.dataset.cltemplate; const names={ruck:"Ruck march",ftx:"FTX",lab:"Lab day"}; S.checklists.push({id:id(),name:names[t],items:CHECKLIST_TEMPLATES[t].map(text=>({text,done:false})),template:true}); save(); render(); toast("✅ Checklist created"); return; }
  const cltoggle=e.target.closest("[data-cltoggle]"); if(cltoggle){ const [cid,i]=cltoggle.dataset.cltoggle.split("|"); const cl=S.checklists.find(x=>x.id===cid); if(cl&&cl.items[+i]){ cl.items[+i].done=!cl.items[+i].done; save(); render(); } return; }
  const clreset=e.target.closest("[data-clreset]"); if(clreset){ const cl=S.checklists.find(x=>x.id===clreset.dataset.clreset); if(cl){ cl.items.forEach(it=>it.done=false); save(); render(); } return; }
  const cldel=e.target.closest("[data-cldel]"); if(cldel){ if(confirm("Delete this checklist?")){ S.checklists=S.checklists.filter(x=>x.id!==cldel.dataset.cldel); save(); render(); } return; }
  const clitemdel=e.target.closest("[data-clitemdel]"); if(clitemdel){ const [cid,i]=clitemdel.dataset.clitemdel.split("|"); const cl=S.checklists.find(x=>x.id===cid); if(cl){ cl.items.splice(+i,1); save(); render(); } return; }
  const exp=e.target.closest("[data-export]"); if(exp){ exportData(exp.dataset.export); return; }
  const awedit=e.target.closest("[data-awedit]"); if(awedit){ awEdit(awedit.dataset.awedit); return; }
  const evedit=e.target.closest("[data-evedit]"); if(evedit){ evEdit(evedit.dataset.evedit); return; }
  const mbedit=e.target.closest("[data-mbedit]"); if(mbedit){ mbEdit(mbedit.dataset.mbedit); return; }
  const skedit=e.target.closest("[data-skedit]"); if(skedit){ skEdit(skedit.dataset.skedit); return; }
  const skjump=e.target.closest("[data-skjump]"); if(skjump){ const t=document.getElementById("skcat-"+skjump.dataset.skjump); if(t){ const hdr=t.querySelector('.sk-deck-header'),body=t.querySelector('.sk-deck-body'); if(hdr&&!hdr.classList.contains('open')){ hdr.classList.add('open'); if(body) body.classList.add('open'); } t.scrollIntoView({behavior:"smooth",block:"start"}); } return; }
  const aftstd=e.target.closest("[data-aftstd]"); if(aftstd){ S.aftStandard=aftstd.dataset.aftstd; save(); render(); return; }
});
document.addEventListener("change",e=>{
  const k=e.target.dataset&&e.target.dataset.sktgtlv;
  if(k){const sk=S.lifeSkills.find(x=>x.id===k);if(sk){sk.targetLevel=parseInt(e.target.value)||null;save();if(typeof renderSkillsTab==="function")renderSkillsTab();}}
});
