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
      const meta=[a.year?String(a.year):null, a.org?("from "+esc(a.org)):null].filter(Boolean).join(" · ");
      return `<div class="aw-card"><button class="aw-del" data-daw="${a.id}">✕</button><button class="aw-edit" data-awedit="${a.id}">✎</button><div class="aw-ic">${AW_IC[a.kind]||"🏆"}</div><div class="aw-title">${esc(a.title)}</div>${meta?`<div class="aw-meta">${meta}</div>`:""}${a.note?`<div class="aw-note">${esc(a.note)}</div>`:""}<div class="aw-date">added ${esc(a.date||"")}</div></div>`;
    };
    el.innerHTML=years.map(yg=>`<div class="wall-year-hd">${yg.yr}</div>`+
      yg.orgs.map(og=>(og.org?`<div class="wall-org-hd">${esc(og.org)}</div>`:"")+`<div class="wall-grid">${og.items.map(card).join("")}</div>`).join("")
    ).join("");
  }
  renderMemberships(); renderEvents(); renderVolunteer();
}

const MB_TYPE={founder:"★ Founder",charter:"Charter",regular:"Member",honorary:"Honorary"};
function renderMemberships(){
  const el=document.getElementById("mbList"); if(!el) return;
  if(!S.memberships.length){ el.innerHTML=`<div class="aw-empty"><span class="big">🎟️</span>No memberships yet. Add organizations you belong to above.</div>`; return; }
  // founders/charter weighted to the top, then by start year desc
  const rank={founder:0,charter:1,regular:2,honorary:3};
  const sorted=S.memberships.slice().sort((a,b)=>(rank[a.memberType]-rank[b.memberType])||((b.startYear||0)-(a.startYear||0)));
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
    const meta=[ev.year?String(ev.year):null, ev.org?esc(ev.org):null].filter(Boolean).join(" · ");
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

/* ---------------- Weight mirror + Awards handlers ---------------- */
document.body.addEventListener("click",e=>{
  const daw=e.target.closest("[data-daw]");
  if(daw){if(confirm("Remove this from the wall?")){S.awards=S.awards.filter(a=>a.id!==daw.dataset.daw);save();render();}return;}
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
    if(sk){ const ab=sk.levels[lvl-1]; if(confirm(`Mark Level ${lvl} reached for "${sk.name}"?\n\nL${lvl}: ${ab?ab.ability:''}`)) skReachLevel(skId, lvl); }
    return;
  }
  const skskip=e.target.closest("[data-skskip]"); if(skskip){ skSkip(skskip.dataset.skskip); return; }
  const skdel=e.target.closest("[data-skdel]"); if(skdel){ if(confirm("Delete this skill?")){ S.lifeSkills=S.lifeSkills.filter(s=>s.id!==skdel.dataset.skdel); save(); render(); } return; }
  // wall delete + role-draft remove
  const mbdel=e.target.closest("[data-mbdel]"); if(mbdel){ if(confirm("Remove this membership?")){ S.memberships=S.memberships.filter(m=>m.id!==mbdel.dataset.mbdel); save(); render(); } return; }
  const mbrrm=e.target.closest("[data-mbrrm]"); if(mbrrm){ _mbRoles.splice(+mbrrm.dataset.mbrrm,1); renderMbRoleInputs(); return; }
  const evdel=e.target.closest("[data-evdel]"); if(evdel){ if(confirm("Remove this event?")){ S.events=S.events.filter(x=>x.id!==evdel.dataset.evdel); save(); render(); } return; }
  const voldel=e.target.closest("[data-voldel]"); if(voldel){ S.volunteer=S.volunteer.filter(v=>v.id!==voldel.dataset.voldel); save(); render(); return; }
  const hbdo=e.target.closest("[data-hbdo]"); if(hbdo){ habitDo(hbdo.dataset.hbdo); return; }
  const hbdel=e.target.closest("[data-hbdel]"); if(hbdel){ if(confirm("Delete this habit? Its streak history will be lost.")){ S.habits=S.habits.filter(h=>h.id!==hbdel.dataset.hbdel); save(); render(); } return; }
  const hbstart=e.target.closest("[data-hbstart]"); if(hbstart){ const st=HABIT_STARTERS.find(x=>x.name===hbstart.dataset.hbstart); if(st && !S.habits.some(h=>h.name===st.name)){ S.habits.push({id:id(),name:st.name,linkedSkill:st.skill,streak:0,bestStreak:0,lastDone:null,graceUsed:false,history:[]}); save(); render(); toast("📋 Added: "+st.name); } return; }
  const hbview=e.target.closest("[data-hbview]"); if(hbview){ const hid=hbview.dataset.hbview; if(typeof _hbView!=="undefined"){ _hbView[hid]=(_hbView[hid]==='month')?'strip':'month'; if(typeof renderHabits==="function")renderHabits(); } return; }
  const teststart=e.target.closest("[data-teststart]"); if(teststart){ const tid=teststart.dataset.teststart; if(tid==="reaction")startReaction(); else if(tid==="digitspan")startDigitSpan(); else if(tid==="typing")startTyping(); else if(tid==="nback")startNback(); else if(tid==="gonogo")startGoNoGo(); else if(tid==="procspeed")startProcSpeed(); else if(tid==="mathsprint")startMathSprint(); return; }
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
  const cndel=e.target.closest("[data-cndel]"); if(cndel){ if(confirm("Delete this entry?")){ S.counseling=S.counseling.filter(c=>c.id!==cndel.dataset.cndel); save(); render(); } return; }
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
  const skjump=e.target.closest("[data-skjump]"); if(skjump){ const t=document.getElementById("skcat-"+skjump.dataset.skjump); if(t) t.scrollIntoView({behavior:"smooth",block:"start"}); return; }
  const aftstd=e.target.closest("[data-aftstd]"); if(aftstd){ S.aftStandard=aftstd.dataset.aftstd; save(); render(); return; }
});
