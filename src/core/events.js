
/* ---------------- PWA install prompt / Notifications ---------------- */
let _deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); _deferredInstallPrompt = e; });

/* ---------------- Events ---------------- */
// Apply the More/Less collapsed state of the secondary nav section
function applyNavMore(){
  const nm=document.getElementById("navMore");
  const btn=document.getElementById("navMoreBtn");
  const open=!!(S.navExpanded);
  if(nm) nm.classList.toggle("open",open);
  if(btn){
    const lbl=btn.querySelector(".lbl");
    if(lbl) lbl.textContent=open?"Less":"More";
  }
}

document.querySelectorAll("nav.tabs button[data-tab]").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("nav.tabs button").forEach(x=>x.classList.remove("on"));
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("on"));
  b.classList.add("on");
  document.getElementById("view-"+b.dataset.tab).classList.add("on");
  const jb=document.getElementById("skJumpbar"); if(jb) jb.classList.toggle("show", b.dataset.tab==="skills");
  // if a secondary tab was clicked, ensure More section is open so it shows as active
  if(b.closest("#navMore") && !S.navExpanded){ S.navExpanded=true; save(); applyNavMore(); }
  window.scrollTo(0,0);
});
// side-rail label toggle (desktop)
function applyNavMode(){ document.getElementById("sideNav").classList.toggle("icons-only", !S.navLabels); }
const _navToggle=document.getElementById("navToggle");
if(_navToggle) _navToggle.onclick=()=>{ S.navLabels=!S.navLabels; save(); applyNavMode(); };
// More/Less toggle for secondary nav tabs
const _navMoreBtn=document.getElementById("navMoreBtn");
if(_navMoreBtn) _navMoreBtn.onclick=()=>{ S.navExpanded=!S.navExpanded; save(); applyNavMore(); };
applyNavMode();
applyNavMore();

document.getElementById("qAdd").onclick=()=>{
  const n=document.getElementById("qName").value.trim();if(!n)return;
  const path=document.getElementById("qPath").value||"tactical";
  const due=document.getElementById("qDue").value||null;
  S.quests.unshift({id:id(),name:n,diff:document.getElementById("qDiff").value,path:path,done:false,due,createdDate:localYMD()});
  document.getElementById("qName").value="";
  document.getElementById("qDue").value="";
  save();render();
};
document.getElementById("dAdd").onclick=()=>{
  const n=document.getElementById("dName").value.trim();if(!n)return;
  const path=document.getElementById("dPath").value||"tactical";
  S.dailies.unshift({id:id(),name:n,diff:document.getElementById("dDiff").value,path:path,done:false,best:0});
  document.getElementById("dName").value="";save();render();
};
document.getElementById("bAdd").onclick=()=>{
  const n=document.getElementById("bName").value.trim();if(!n)return;
  const hp=Math.max(2,Math.min(200,parseInt(document.getElementById("bHp").value)||10));
  S.bosses.unshift({id:id(),name:n,hp:hp,maxhp:hp});
  document.getElementById("bName").value="";save();render();
};
document.getElementById("rAdd").onclick=()=>{
  const n=document.getElementById("rName").value.trim();if(!n)return;
  const c=Math.max(1,parseInt(document.getElementById("rCost").value)||10);
  S.rewards.push({id:id(),name:n,cost:c});
  document.getElementById("rName").value="";save();render();
};

document.body.addEventListener("click",e=>{
  const t=e.target;
  // complete quest
  if(t.dataset.q){
    const q=S.quests.find(x=>x.id===t.dataset.q);
    if(q&&!q.done){
      q.done=true;
      if(!S.questArchive) S.questArchive=[];
      S.questArchive.unshift({...q, completedDate:new Date().toLocaleDateString()});
      if(S.questArchive.length>200) S.questArchive=S.questArchive.slice(0,200);
      const v=VALUES.quest[q.diff];
      grant(v.xp,v.g,"Mission complete",q.path||"tactical");
      setTimeout(()=>{S.quests=S.quests.filter(x=>x.id!==q.id||!x.done);save();render();},900);
    }
    return;
  }
  // complete daily
  if(t.dataset.d){const d=S.dailies.find(x=>x.id===t.dataset.d);if(d&&!d.done){d.done=true;const v=VALUES.daily[d.diff];grant(v.xp,v.g,"Order executed",d.path||"tactical");const allNow=S.dailies.every(x=>x.done);if(allNow){onPerfectDay();}}else if(d&&d.done){d.done=false;save();render();}return}
  // boss hit
  if(t.dataset.hit){const b=S.bosses.find(x=>x.id===t.dataset.hit);if(b&&b.hp>0){b.hp--;grant(8,4,"Progress logged",b.path||"tactical");if(b.hp<=0){setTimeout(()=>{toast(`<span class="t-xp">✅ ${esc(b.name)} secured! Bonus awarded</span>`);S.gold+=b.maxhp*2;save();render();},400);}}return}
  // buy reward
  if(t.dataset.buy){const r=S.rewards.find(x=>x.id===t.dataset.buy);if(r&&S.gold>=r.cost){S.gold-=r.cost;save();render();toast(`🍺 Rest claimed: ${esc(r.name)} — you earned this. Take it fully.`);}return}
  // snooze quest +3 days
  if(t.dataset.qsnooze){
    const q=S.quests.find(x=>x.id===t.dataset.qsnooze); if(!q) return;
    const base=q.due&&q.due>=localYMD()?q.due:localYMD();
    const nd=new Date(base+"T12:00:00"); nd.setDate(nd.getDate()+3);
    q.due=localYMD(nd);
    save();render();
    toast(`Oath postponed to ${q.due}`);
    return;
  }
  // deletes
  if(t.dataset.dq){S.quests=S.quests.filter(x=>x.id!==t.dataset.dq);save();render();return}
  if(t.dataset.dd){S.dailies=S.dailies.filter(x=>x.id!==t.dataset.dd);save();render();return}
  if(t.dataset.db){S.bosses=S.bosses.filter(x=>x.id!==t.dataset.db);save();render();return}
  if(t.dataset.dr){S.rewards=S.rewards.filter(x=>x.id!==t.dataset.dr);save();render();return}
  // install prompt dismiss / one-tap install
  if(t.dataset.installDismiss){S.installPromptDismissed=true;save();if(typeof renderToday==="function")renderToday();return;}
  if(t.dataset.installNow&&_deferredInstallPrompt){_deferredInstallPrompt.prompt();_deferredInstallPrompt.userChoice.then(()=>{S.installPromptDismissed=true;save();if(typeof renderToday==="function")renderToday();});return;}
  // notification permission request
  if(t.dataset.notifPrompt){
    if(typeof Notification!=="undefined"){
      Notification.requestPermission().then(perm=>{
        if(perm==="granted"){S.notifEnabled=true;save();scheduleStreakNotif();}
        if(typeof renderToday==="function")renderToday();
      });
    }
    return;
  }
  // copy skill card to clipboard
  if(t.dataset.skcopy){
    const sk=S.lifeSkills.find(x=>x.id===t.dataset.skcopy); if(!sk) return;
    const eff=typeof skEffectiveLevel==="function"?skEffectiveLevel(sk):sk.currentLevel;
    const tierLabel=typeof getTierLabelForLevel==="function"?getTierLabelForLevel(sk,eff):"";
    const days=typeof skDaysLeft==="function"?skDaysLeft(sk):null;
    const peak=sk.peakLevel||0;
    const txt=[
      sk.name,
      `L${eff}${tierLabel?" "+tierLabel:""}`,
      peak>eff?`peak L${peak}`:"",
      days!==null?`fades in ${days}d`:""
    ].filter(Boolean).join(" · ");
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(()=>toast("⧉ Skill card copied")).catch(()=>toast("Copy failed — try long-pressing"));
    } else { toast("Clipboard not available in this browser"); }
    return;
  }
  // copy daily brief
  if(t.dataset.copybriefbtn){ if(typeof copyDailyBrief==="function") copyDailyBrief(); return; }
  // global tab navigation — any button with data-gototab anywhere in the app
  const goBtn=t.closest("[data-gototab]");
  if(goBtn){
    const tab=goBtn.dataset.gototab;
    const nb=document.querySelector(`#sideNav button[data-tab="${tab}"]`); if(nb) nb.click();
    // preload a session in Log tab if requested (e.g. dawn session card "Log done" button)
    if(goBtn.dataset.logsess){
      const sess=goBtn.dataset.logsess;
      setTimeout(()=>{ const sel=document.getElementById("lgSession"); if(sel&&sel.value!==sess){sel.value=sess;if(sel.onchange)sel.onchange();} }, 80);
    }
    return;
  }
});

document.getElementById("renameBtn").onclick=()=>{
  const n=prompt("Enter your name / callsign:",S.name);if(n&&n.trim()){S.name=n.trim().slice(0,30);save();render();}
};
document.getElementById("editRankBtn").onclick=()=>{
  const r=prompt("Your current MS year / rank (e.g. 'MS2 Cadet'):",S.rank);
  if(r===null) return;
  const p=prompt("Your leadership position (e.g. 'S1', 'Squad Leader', 'No leadership role'):",S.position);
  if(r&&r.trim()) S.rank=r.trim().slice(0,40);
  if(p!==null && p.trim()) S.position=p.trim().slice(0,40);
  save();render();
};

// Enter-to-submit
["qName","dName"].forEach(idn=>document.getElementById(idn).addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById(idn==="qName"?"qAdd":"dAdd").click();}));

/* ---------------- Toast & skill-up ---------------- */
let toastT;
function toast(html){const el=document.getElementById("toast");el.innerHTML=html;el.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove("show"),2200);}
function showLevelUp(path,lvl){
  const pm=PATH_META[path]||{icon:"⭐",name:path,idol:path};
  document.getElementById("luTitle").textContent=pm.icon+" "+pm.name+" — Level "+lvl;
  document.getElementById("luSub").textContent=pm.idol+" grows stronger. "+pm.lore.split(".")[0]+". Drive on.";
  document.getElementById("levelup").classList.add("show");
}
document.getElementById("luClose").onclick=()=>document.getElementById("levelup").classList.remove("show");

/* ---------------- Equipment mode toggle ---------------- */
{
  const gb=document.getElementById("gymToggleBtn");
  if(gb) gb.onclick=()=>{ S.hasGym=!S.hasGym; save(); render(); toast(S.hasGym?"🏋️ Gym mode — equipment versions shown":"🤸 No-equipment mode — bodyweight only"); };
  const wb=document.getElementById("weatherBtns");
  if(wb) wb.onclick=(e)=>{ const b=e.target.closest("[data-weather]"); if(!b) return; S.weather=b.getAttribute("data-weather"); save(); render(); const w=WEATHER[S.weather]; toast(weatherBad()?`${w.icon} ${w.label} — outdoor work moved indoors`:"☀️ Clear — outdoor work restored"); };
}

/* ---------------- Backup / reset ---------------- */
document.getElementById("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download="questline-backup-"+today().replace(/ /g,"-")+".json";a.click();
};
document.getElementById("importBtn").onclick=()=>document.getElementById("importFile").click();
document.getElementById("importFile").onchange=e=>{
  const f=e.target.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{
    try{
      const parsed=JSON.parse(rd.result);
      if(!parsed||typeof parsed!=="object") throw new Error("bad");
      // Route the backup through the SAME path as normal startup: write to storage,
      // re-run load() (which merges in any new DEFAULT fields), then run the skill
      // migration so a backup from an older version GAINS the new skills instead of
      // reverting to its old set. Nothing the user had is lost.
      localStorage.setItem(KEY, JSON.stringify(parsed));
      S=load();
      seedSkillsIfEmpty();   // adds any new seed skills (cognitive, CQC, etc.) without wiping progress
      save(); render();
      toast("Backup restored");
    }catch(x){ toast("Could not read that file"); }
  };
  rd.readAsText(f);
};
document.getElementById("resetBtn").onclick=()=>{if(confirm("Erase all progress and start over? This cannot be undone.")){localStorage.removeItem(KEY);S=structuredClone(DEFAULT);save();render();}};
// Force-resync every skill's ladder/tiers/guidance from the current seed, preserving
// your progress (levels, peaks, history). Use this if a restored older backup shows
// outdated skill trees (e.g. a skill with the wrong number of levels).
document.getElementById("resyncBtn").onclick=()=>{
  if(!confirm("Resync all skill trees to the latest version?\n\nThis updates every skill's levels, tiers, and guidance to current — your progress (levels reached, peaks, history) is kept.")) return;
  S._skillLadderVer=0;                 // mark stale so the merge force-resyncs every ladder
  if(typeof mergeNewSeedSkills==="function") mergeNewSeedSkills();
  // re-derive auto skills from your logged performance afterward
  if(typeof syncSkillsFromActivity==="function") syncSkillsFromActivity();
  save(); render();
  toast("✅ Skill trees resynced to the latest version");
};

// ── Swipe left/right between tabs on mobile
{
  let _sx=0,_sy=0;
  document.addEventListener("touchstart",e=>{_sx=e.touches[0].clientX;_sy=e.touches[0].clientY;},{passive:true});
  document.addEventListener("touchend",e=>{
    const dx=e.changedTouches[0].clientX-_sx;
    const dy=e.changedTouches[0].clientY-_sy;
    if(Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.5) return;
    const tabs=Array.from(document.querySelectorAll("#sideNav button[data-tab]"));
    const cur=tabs.findIndex(b=>b.classList.contains("on"));
    if(cur===-1) return;
    const next=dx<0?cur+1:cur-1;
    if(next>=0&&next<tabs.length) tabs[next].click();
  },{passive:true});
}

// ── Quick-add oath modal
{
  const _qaBtn=document.getElementById("quickAddBtn");
  const _qaMod=document.getElementById("quickModal");
  const _qaClose=document.getElementById("quickModalClose");
  const _qaAdd=document.getElementById("qaAdd");
  const _qaName=document.getElementById("qaName");
  if(_qaBtn) _qaBtn.onclick=()=>{_qaMod.classList.add("open");_qaName&&_qaName.focus();};
  if(_qaClose) _qaClose.onclick=()=>_qaMod.classList.remove("open");
  if(_qaMod) _qaMod.addEventListener("click",e=>{if(e.target===_qaMod)_qaMod.classList.remove("open");});
  if(_qaAdd) _qaAdd.onclick=()=>{
    const n=_qaName?_qaName.value.trim():""; if(!n) return;
    const path=document.getElementById("qaPath").value||"tactical";
    const diff=document.getElementById("qaDiff").value||"easy";
    S.quests.unshift({id:id(),name:n,diff,path,done:false});
    if(_qaName) _qaName.value="";
    save();render();
    _qaMod.classList.remove("open");
    toast("Oath sworn.");
  };
  if(_qaName) _qaName.addEventListener("keydown",e=>{if(e.key==="Enter"&&_qaAdd)_qaAdd.click();});
}

