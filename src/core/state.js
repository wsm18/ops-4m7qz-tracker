const KEY="operations_v2";
let S = load();
try{ if(typeof window!=="undefined") window.S = S; }catch(_){}  // expose for tests/devtools; harmless in app

function id(){return Math.random().toString(36).slice(2,9)}
function load(){
  try{
    const r=JSON.parse(localStorage.getItem(KEY));
    if(!r) return structuredClone(DEFAULT);
    const merged=Object.assign(structuredClone(DEFAULT),r);
    // ensure nested structures exist after upgrades
    const defaultPXP={tactical:0,physical:0,cognitive:0,physiological:0,technical:0,leadership:0,academic:0,personal:0,hearth:0,roots:0};
    merged.pathXP=Object.assign({...defaultPXP},r.pathXP||{});
    // Migrate old skills.{fitness,tactics,knowledge,discipline} XP → pathXP (one-time, old saves)
    if(r.skills && !r.pathXP){
      if(r.skills.fitness)    merged.pathXP.physical  =(merged.pathXP.physical||0) +(r.skills.fitness.xp||0);
      if(r.skills.tactics)    merged.pathXP.tactical  =(merged.pathXP.tactical||0) +(r.skills.tactics.xp||0);
      if(r.skills.knowledge)  merged.pathXP.academic  =(merged.pathXP.academic||0) +(r.skills.knowledge.xp||0);
      if(r.skills.discipline) merged.pathXP.personal  =(merged.pathXP.personal||0) +(r.skills.discipline.xp||0);
    }
    // Migrate old track → path field in quests/dailies/bosses
    [...(merged.quests||[]),...(merged.dailies||[]),...(merged.bosses||[])].forEach(item=>{
      if(!item.path && item.track) item.path=TRACK_TO_PATH[item.track]||item.track;
    });
    merged.quizzes=r.quizzes||{};
    merged.aft=r.aft||[];
    merged.workouts=r.workouts||[];
    merged.baselines=r.baselines||[];
    merged.boardTasks=r.boardTasks||structuredClone(DEFAULT.boardTasks);
    merged.branchGoal=r.branchGoal||DEFAULT.branchGoal;
    merged.weight=r.weight||structuredClone(DEFAULT.weight);
    if(!merged.weight.promises) merged.weight.promises=[];
    if(!merged.weight.memorial) merged.weight.memorial=[];
    merged.weightAppUrl=r.weightAppUrl||"https://wsm-ai.github.io/tw-9f3kx-ledger/";
    merged.lastMirrorUpdate=r.lastMirrorUpdate||null;
    merged.awards=r.awards||[];
    merged.academicHonors=r.academicHonors||[];
    merged.rotcRecord=Object.assign({positions:[],competitions:[],campResults:[]}, r.rotcRecord||{});
    if(!merged.rotcRecord.positions) merged.rotcRecord.positions=[];
    if(!merged.rotcRecord.competitions) merged.rotcRecord.competitions=[];
    if(!merged.rotcRecord.campResults) merged.rotcRecord.campResults=[];
    merged.ptLog=r.ptLog||[];
    merged.memberships=r.memberships||[];
    merged.events=r.events||[];
    merged.volunteer=r.volunteer||[];
    merged.lifeSkills=r.lifeSkills||[];
    merged._seeded=r._seeded||false;
    merged._skillLadderVer=r._skillLadderVer||0;
    // migration: if skills exist but lack hierarchy fields, they're the old flat set — reseed fresh
    if(merged.lifeSkills.length && merged.lifeSkills.every(s=>s.group===undefined && s.parent===undefined)){
      merged.lifeSkills=[]; merged._seeded=false;
    }
    // backfill peakLevel (all-time high) for any skill missing it
    merged.lifeSkills.forEach(s=>{ s.peakLevel=Math.max(s.peakLevel||0, s.currentLevel||0); });
    // backfill auto flag on Reading speed — now tested in-app (v117)
    const _rdSkill=merged.lifeSkills.find(s=>s.name==="Reading speed");
    if(_rdSkill&&!_rdSkill.auto) _rdSkill.auto="test:reading";
    // backfill checkpoints on bosses created before v112
    (merged.bosses||[]).forEach(b=>{
      if(!b.checkpoints) b.checkpoints=[];
      if(b.cpDriven===undefined && b.checkpoints.length>0){
        const expectedHp=b.checkpoints.filter(c=>!c.done).length+1;
        if(b.hp<=expectedHp){b.cpDriven=true;b.maxhp=b.checkpoints.length+1;b.hp=expectedHp;}
      }
      // backfill completedAt for boss archive (v117)
      if(b.completedAt===undefined) b.completedAt=null;
    });
    merged.navLabels=r.navLabels!==undefined?r.navLabels:true;
    merged.navExpanded=r.navExpanded!==undefined?r.navExpanded:false;
    merged.missedTraining=r.missedTraining||[];
    merged.profile=Object.assign({birthdate:null,heightIn:null,heightDate:null,weightLb:null,weightDate:null,sex:null,bloodType:null,units:"imperial",notes:"",commissionDate:null,gpa:null,weightGoal:null,languages:[],clearance:{level:null,grantedDate:null,notes:""}}, r.profile||{});
    merged.profile.languages=r.profile?.languages||[];
    merged.profile.clearance=Object.assign({level:null,grantedDate:null,notes:""}, r.profile?.clearance||{});
    merged.lifts=Object.assign({deadliftLb:null,squatLb:null,benchLb:null,liftDate:null}, r.lifts||{});
    merged.aftStandard=r.aftStandard||"general";
    merged.aftEventTargets=Object.assign({hrp:null,sdc:null,run:null,dl:null,plank:null}, r.aftEventTargets||{});
    merged.donations=r.donations||[];
    merged.weightLog=r.weightLog||[];
    merged.vitals=r.vitals||[];
    merged.healthImport=Object.assign({lastImport:null}, r.healthImport||{});
    merged.habits=r.habits||[];
    merged.tests=r.tests||[];
    merged.srsDecks=r.srsDecks||[];
    merged.palaces=r.palaces||[];
    merged.studyPlans=r.studyPlans||[];
    merged.counseling=r.counseling||[];
    merged.checklists=r.checklists||[];
    merged.gpaHistory=r.gpaHistory||[];
    merged.milestones=r.milestones||[];
    merged.questArchive=r.questArchive||[];
    merged.streakLog=r.streakLog||[];
    merged.streakBrokenDate=r.streakBrokenDate||null;
    return merged;
  }catch(e){return structuredClone(DEFAULT)}
}
function save(){localStorage.setItem(KEY,JSON.stringify(S)); try{ if(typeof window!=="undefined") window.S=S; }catch(_){} cloudWriteDebounced();}
// skill level from xp: rising cost curve
function skillLevel(xp){let lvl=1,need=80,acc=0;while(xp>=acc+need){acc+=need;lvl++;need+=40;}return{lvl,into:xp-acc,need};}

/* ---------------- Daily reset & streak ---------------- */
function today(){return new Date().toDateString()}
function checkDailyReset(){
  const t=today();
  if(S.lastDaily===t) return;
  if(S.lastDaily){
    // record yesterday's completion rate before resetting
    if(S.dailies.length>0){
      const done=S.dailies.filter(d=>d.done).length;
      const pct=Math.round(done/S.dailies.length*100);
      if(!S.streakLog) S.streakLog=[];
      S.streakLog.push({date:S.lastDaily, pct});
      S.streakLog=S.streakLog.slice(-90);
    }
    const diff=Math.round((new Date(t)-new Date(S.lastDaily))/864e5);
    if(diff===1 && S._yesterdayComplete){ S.streak++; S.missedYesterday=false; }
    else {
      if(S.streak>0){ S.missedYesterday=true; S.streakBrokenDate=localYMD(); }
      S.streak=0;
    }
  }
  if(S.streak>=3) S.streakBrokenDate=null; // recovery complete
  if(S.streak>S.bestStreak) S.bestStreak=S.streak;
  S._yesterdayComplete = S.dailies.length>0 && S.dailies.every(d=>d.done);
  S.dailies.forEach(d=>d.done=false);
  S.lastDaily=t;
  save();
}
// readiness status — degrades as undone dailies pile up; this is the "don't slip" signal
function readiness(){
  const total=S.dailies.length||1;
  const done=S.dailies.filter(d=>d.done).length;
  const pct=done/total;
  if(pct>=1) return {label:"FULLY MISSION READY",color:"var(--jade)",pct};
  if(pct>=0.66) return {label:"READY",color:"var(--gold)",pct};
  if(pct>=0.34) return {label:"PARTIALLY READY",color:"var(--ember)",pct};
  return {label:"NOT MISSION READY",color:"var(--blood)",pct};
}

/* ---------------- XP / rewards ---------------- */
function grant(xp,gold,label,path){
  S.gold+=gold; S.totalDone++;
  path=path||"tactical";
  if(!S.pathXP) S.pathXP={};
  if(!S.pathXP[path]) S.pathXP[path]=0;
  const before=skillLevel(S.pathXP[path]).lvl;
  S.pathXP[path]+=xp;
  const after=skillLevel(S.pathXP[path]).lvl;
  save(); render();
  const pm=PATH_META[path];
  if(after>before) showLevelUp(path,after);
  else toast(`<span class="t-xp">+${xp} XP → ${pm?pm.name:path} &nbsp;+${gold} pts</span> &nbsp;·&nbsp; ${label}`);
}

// Perfect day = all dailies cleared. Escalating dopamine + streak milestones.
function onPerfectDay(){
  const t=today();
  if(S.lastPerfect===t) return; // only once per day
  S.lastPerfect=t;
  S.perfectDays=(S.perfectDays||0)+1;
  // log to daily history for streak calendar
  if(!S.dailyHistory) S.dailyHistory=[];
  if(!S.dailyHistory.includes(t)){ S.dailyHistory.push(t); if(S.dailyHistory.length>365) S.dailyHistory=S.dailyHistory.slice(-365); }
  // tomorrow's reset will bump the streak; the *pending* streak is streak+1
  const pending=S.streak+1;
  // bonus merit scales with streak (loss aversion: the longer the streak, the more you'd lose)
  const bonus=20+Math.min(80,pending*3);
  S.gold+=bonus;
  if(!S.pathXP) S.pathXP={};
  S.pathXP.personal=(S.pathXP.personal||0)+40;
  save();render();
  // milestone celebrations
  const milestones={3:"3-day streak — momentum building.",7:"7 days straight. One week locked in.",14:"Two weeks. This is becoming who you are.",30:"30 DAYS. Discipline is now a habit, not a choice.",60:"60 days. Most people never get here.",100:"100 DAYS. Elite consistency."};
  const ms=milestones[pending];
  document.getElementById("luTitle").textContent=ms?("🔥 "+pending+"-Day Streak!"):"✅ Perfect Day";
  document.getElementById("luSub").textContent=(ms||"All orders cleared. +"+bonus+" merit, +40 Discipline XP.")+(ms?` +${bonus} merit.`:"");
  document.querySelector("#levelup .lu-burst").textContent=ms?"🔥":"🎖️";
  document.getElementById("levelup").classList.add("show");
}

/* ---------------- Render ---------------- */
function render(){
  checkDailyReset();
  document.getElementById("heroName").textContent=S.name;
  document.getElementById("rankLine").textContent=S.rank;
  document.getElementById("posLine").textContent=S.position;
  document.getElementById("sGold").textContent=S.gold;
  document.getElementById("sStreak").textContent=S.streak;
  document.getElementById("sBest").textContent=S.bestStreak||0;
  // readiness bar
  const rd=readiness();
  const done=S.dailies.filter(d=>d.done).length, total=S.dailies.length;
  document.getElementById("rdLabel").textContent=rd.label;
  document.getElementById("rdLabel").style.color=rd.color;
  document.getElementById("rdPct").textContent=done+"/"+total+" orders today";
  document.getElementById("rdFill").style.width=Math.round(rd.pct*100)+"%";
  document.getElementById("rdFill").style.background=rd.color;
  const warn=document.getElementById("rdWarn");
  const undone=total-done;
  if(S.missedYesterday && S.streak===0){
    warn.className="rd-warn show"; warn.style.color="var(--blood)";
    warn.innerHTML="💥 Streak broken — you missed a day. Clear every order today to start forge-back.";
  } else if(undone>0 && S.streak>0){
    warn.className="rd-warn show"; warn.style.color="var(--ember)";
    warn.innerHTML=`⚠️ ${S.streak}-day streak AT RISK — ${undone} order${undone>1?'s':''} left. Don't lose it now.`;
  } else if(undone>0){
    warn.className="rd-warn show"; warn.style.color="var(--ink-faint)";
    warn.innerHTML=`${undone} order${undone>1?'s':''} left to lock in a perfect day.`;
  } else {
    warn.className="rd-warn"; warn.innerHTML="";
  }
  renderQuests(); renderDailies(); renderBosses(); renderShop();
  if(typeof renderQuizzes==="function") renderQuizzes();
  if(typeof renderAft==="function") renderAft();
  if(typeof renderLog==="function") renderLog();
  if(typeof renderProfile==="function") renderProfile();
  if(typeof renderEmergencyAndBlood==="function") renderEmergencyAndBlood();
  if(typeof renderVitals==="function") renderVitals();
  if(typeof renderHabits==="function") renderHabits();
  if(typeof renderTests==="function") renderTests();
  if(typeof renderReadingTest==="function") renderReadingTest();
  if(typeof renderSRS==="function") renderSRS();
  if(typeof renderPalace==="function") renderPalace();
  if(typeof renderStudy==="function") renderStudy();
  if(typeof renderToday==="function") renderToday();
  if(typeof renderSkillNotes==="function") renderSkillNotes();
  if(typeof renderHistory==="function") renderHistory();
  if(typeof renderCounsel==="function") renderCounsel();
  if(typeof renderChecklists==="function") renderChecklists();
  if(typeof renderSectionPicker==="function") renderSectionPicker();
  if(typeof renderPT==="function") renderPT();
  if(typeof renderPlanRec==="function") renderPlanRec();
  if(typeof renderSkillBalance==="function") renderSkillBalance();
  if(typeof renderRecoveryAdvisory==="function") renderRecoveryAdvisory();
  if(typeof renderSessionLists==="function") renderSessionLists();
  if(typeof renderCoachToday==="function") renderCoachToday();
  if(typeof renderSkillsTab==="function") renderSkillsTab();
  if(typeof renderAdaptiveTargets==="function") renderAdaptiveTargets();
  if(typeof renderBaseline==="function") renderBaseline();
  if(typeof renderBoard==="function") renderBoard();
  if(typeof renderWeight==="function") renderWeight();
  if(typeof renderAwards==="function") renderAwards();
  if(typeof renderQuals==="function") renderQuals();
  if(typeof renderAcademicHonors==="function") renderAcademicHonors();
  if(typeof renderRotcRecord==="function") renderRotcRecord();
  if(typeof renderLanguages==="function") renderLanguages();
  if(typeof renderGarden==="function") renderGarden();
  if(typeof renderTrophies==="function") renderTrophies();
}

function pathTag(path){
  const pm=PATH_META[path];
  if(!pm) return "";
  return `<span class="tag path-tag" style="color:${pm.color}">${pm.icon} ${pm.name}</span>`;
}
function diffTag(scope,diff){
  const cls=diff==="easy"?"diff-easy":diff==="hard"?"diff-hard":"diff-med";
  const labels={easy:"routine",med:"priority",hard:"high-risk"};
  const v=VALUES[scope][diff];
  return `<span class="tag ${cls}">${labels[diff]}</span><span class="tag xp">+${v.xp} XP · ${v.g} pts</span>`;
}

function renderQuests(){
  const el=document.getElementById("qList");
  if(!S.quests.length){el.innerHTML=`<div class="empty"><span class="big">🎯</span>The board is clear. Swear an oath above and carry it forward.</div>`;}
  else{
    const today=localYMD();
    const sorted=S.quests.slice().sort((a,b)=>{
      const aOver=a.due&&a.due<today, bOver=b.due&&b.due<today;
      if(aOver&&!bOver) return -1; if(bOver&&!aOver) return 1;
      if(a.due&&b.due) return a.due<b.due?-1:a.due>b.due?1:0;
      if(a.due&&!b.due) return -1; if(b.due&&!a.due) return 1;
      return 0;
    });
    el.innerHTML=sorted.map(q=>{
      const overdue=!q.done&&q.due&&q.due<today;
      const dueTag=q.due?`<span class="tag ${overdue?'overdue-tag':'due-tag'}">${overdue?'OVERDUE':'due '+q.due}</span>`:'';
      const ageDays=q.createdDate&&!q.done?dayDiff(q.createdDate,today):0;
      const ageTag=ageDays>3?`<span class="quest-age${ageDays>14?' old':''}">open ${ageDays}d</span>`:'';
      const snoozeCount=q.snoozeCount||0;
      const snoozeWarn=(!q.done&&snoozeCount>=2)?`<span class="oath-postpone-warn">postponed ${snoozeCount}×</span>`:'';
      const snoozeBtn=(!q.done&&q.due)?`<button class="q-snooze" data-qsnooze="${q.id}" title="Postpone 3 days">+3d</button>${snoozeWarn}`:'';
      const updatesHtml=(q.updates&&q.updates.length)?`<div class="q-updates">${q.updates.slice().reverse().map(u=>`<div class="q-update-item"><span class="q-update-ts">${new Date(u.ts).toLocaleDateString()}</span>${esc(u.text)}</div>`).join("")}</div>`:"";
      const updateForm=`<div class="q-update-form"><input class="q-update-input" data-qupdateid="${q.id}" placeholder="Log a dispatch…" maxlength="120"><button class="q-update-add" data-qupdateadd="${q.id}">→</button></div>`;
      const stepsProg=q.steps>=2&&!q.done?`<div class="q-steps-row"><div class="q-steps-bar"><div class="q-steps-fill" style="width:${Math.round((q.progress||0)/q.steps*100)}%"></div></div><span class="q-steps-count">${q.progress||0}/${q.steps}</span><button class="q-step-btn" data-qprogress="${q.id}">+1 step</button></div>`:'';
      const startedSkills=!q.done?(S.lifeSkills||[]).filter(s=>!s.group&&(s.currentLevel||0)>0):[];
      const skillLinkHtml=!q.done&&startedSkills.length?`<div class="q-skilllink">
        <select class="q-skilllink-sel" data-qsklink="${q.id}">
          <option value="">link to skill…</option>${startedSkills.map(s=>`<option value="${s.id}"${q.linkedSkillId===s.id?' selected':''}>${esc(s.name)}</option>`).join('')}
        </select>
        <span class="q-skilllink-type">
          <label><input type="radio" name="qlt${q.id}" value="practice"${q.linkedSkillType!=='level'?' checked':''}> practice</label>
          <label><input type="radio" name="qlt${q.id}" value="level"${q.linkedSkillType==='level'?' checked':''}> level up</label>
        </span>
      </div>`:'';
      return `<li class="card ${q.done?'done':''}${overdue?' overdue':''}">
        <div class="check" data-q="${q.id}">${q.done?'✓':''}</div>
        <div class="c-body"><div class="c-name">${esc(q.name)}</div>
          ${q.notes?`<div class="q-notes">${esc(q.notes)}</div>`:''}
          <div class="c-meta">${diffTag('quest',q.diff)}${pathTag(q.path)}${dueTag}${ageTag}</div>
          ${stepsProg}${updatesHtml}${updateForm}${skillLinkHtml}</div>
        ${snoozeBtn}
        <button class="del" data-dq="${q.id}">✕</button>
      </li>`;
    }).join("");
    // path distribution breakdown: shows balance of active oaths across paths
    const _oldDist=document.querySelector('.q-path-dist');
    if(_oldDist) _oldDist.remove();
    const _active=S.quests.filter(q=>!q.done);
    const _byPath={};
    _active.forEach(q=>{ _byPath[q.path||"tactical"]=(_byPath[q.path||"tactical"]||0)+1; });
    const _pathRow=Object.entries(_byPath).sort((a,b)=>b[1]-a[1]).map(([p,n])=>{
      const pm=PATH_META[p]||{icon:"•",name:p,color:"var(--ink-faint)"};
      return `<span class="q-path-chip" style="color:${pm.color}">${pm.icon} ${n}</span>`;
    }).join("");
    if(_pathRow) el.insertAdjacentHTML("beforebegin",`<div class="q-path-dist">${_pathRow}</div>`);
  }
  // Update overdue oath count badge on the nav button
  const _overdueC=(S.quests||[]).filter(q=>!q.done&&q.due&&q.due<localYMD()).length;
  const _qdot=document.querySelector('#sideNav button[data-tab="quests"] .nav-badge');
  if(_qdot) _qdot.textContent=_overdueC>0?String(_overdueC):'';
  const archEl=document.getElementById("qArchive");
  if(!archEl) return;
  const fullArch=(S.questArchive||[]);
  if(!fullArch.length){archEl.innerHTML="";return;}
  const _archItemHtml=items=>items.map(q=>{
    const timingStr=(q.createdDate&&q.completedDate)?` · ${dayDiff(q.createdDate,q.completedDate)} day${dayDiff(q.createdDate,q.completedDate)!==1?'s':''}`:'' ;
    const archUpdates=(q.updates&&q.updates.length)?`<div class="q-updates">${q.updates.slice().reverse().map(u=>`<div class="q-update-item"><span class="q-update-ts">${new Date(u.ts).toLocaleDateString()}</span>${esc(u.text)}</div>`).join("")}</div>`:"";
    return `<div class="q-arch-item"><span class="q-arch-check">✓</span><div class="q-arch-body"><div class="q-arch-name">${esc(q.name)}</div>${q.notes?`<div class="q-notes">${esc(q.notes)}</div>`:''}${archUpdates}<div class="q-arch-meta">${pathTag(q.path)}<span class="q-arch-date">Completed ${esc(q.completedDate||'')}</span><span class="quest-archive-timing">${timingStr}</span></div></div></div>`;
  }).join("");
  archEl.innerHTML=`<input class="q-arch-search" placeholder="Search completed oaths…">
  <details class="q-archive">
    <summary>✓ Completed oaths (${fullArch.length})</summary>
    ${_archItemHtml(fullArch.slice(0,40))}
  </details>`;
}
function renderDailies(){
  const el=document.getElementById("dList");
  if(!S.dailies.length){el.innerHTML=`<div class="empty"><span class="big">📋</span>No orders standing. Lay your daily oaths — executed at dawn, every dawn.</div>`;return}
  const activeLogDays=(S.streakLog||[]).filter(e=>e.pct>0).length;
  const isStale=d=>{
    if(d.paused) return false;
    if(!d.doneTs) return activeLogDays>=7;
    return (Date.now()-d.doneTs)/864e5>7;
  };
  el.innerHTML=S.dailies.map((d,i)=>{
    const pausedHtml=d.paused?`<span class="order-paused">⏸ paused</span><button class="order-pause-btn" data-dpause="${d.id}" data-dpausestate="0" title="Resume">Resume</button>`:`<button class="order-pause-btn" data-dpause="${d.id}" data-dpausestate="1" title="Pause">⏸</button>`;
    const upBtn=i>0?`<button class="daily-move-btn" data-moveup="${d.id}" title="Move up">▲</button>`:`<button class="daily-move-btn" style="visibility:hidden" aria-hidden="true">▲</button>`;
    const downBtn=i<S.dailies.length-1?`<button class="daily-move-btn" data-movedown="${d.id}" title="Move down">▼</button>`:`<button class="daily-move-btn" style="visibility:hidden" aria-hidden="true">▼</button>`;
    return `<li class="card ${d.done?'done':''}${d.paused?' paused':''}">
      <div class="daily-move-col">${upBtn}${downBtn}</div>
      <div class="check" data-d="${d.id}">${d.done?'✓':''}</div>
      <div class="c-body"><div class="c-name">${esc(d.name)}</div>
        <div class="c-meta">${diffTag('daily',d.diff)}${pathTag(d.path)}${d.best?`<span class="tag streakt">🔥 best ${d.best}</span>`:''}${isStale(d)?`<span class="order-stale" title="Not done in 7+ days — consider revising">⚠ stale</span>`:''}</div></div>
      ${pausedHtml}
      <button class="del" data-dd="${d.id}">✕</button>
    </li>`;
  }).join("");
  if(typeof setupDailyCalToggle==="function") setupDailyCalToggle();
}
function renderBosses(){
  const el=document.getElementById("bList");
  const active=(S.bosses||[]).filter(b=>!b.completedAt);
  const archived=(S.bosses||[]).filter(b=>b.completedAt);
  if(!S.bosses.length){el.innerHTML=`<div class="empty"><span class="big">⚔️</span>No trials set. Name what you must endure and begin the reckoning.</div>`;return}
  const bossCard=b=>{
    const pct=Math.max(0,b.hp/b.maxhp*100);
    const checks=(b.checkpoints||[]);
    const checksHtml=checks.length?`<div class="boss-checks">${checks.map((c,i)=>`<div class="boss-check-item${c.done?' done':''}"><button class="boss-check-btn" data-bcheck="${b.id}" data-bchkidx="${i}">${c.done?'✓':'○'}</button><span>${esc(c.name)}</span></div>`).join("")}</div>`:"";
    const doneChecks=checks.filter(c=>c.done).length;
    const checksMeta=checks.length?` · ${doneChecks}/${checks.length} checkpoints`:"";
    return `<li class="card boss">
      <div class="boss-top">
        <div class="boss-skull">⚔️</div>
        <div class="boss-name">${esc(b.name)}</div>
        <button class="del" data-db="${b.id}">✕</button>
      </div>
      <div class="hpbar"><div class="hpfill" style="width:${pct}%"></div></div>
      <div class="hp-meta"><span>${b.hp} / ${b.maxhp} steps remaining${checksMeta}</span><span>+${b.maxhp*8} XP · ${b.maxhp*4} pts when conquered</span></div>
      ${(()=>{if(!b.targetDate||b.hp<=0)return "";const daysLeft=Math.ceil((new Date(b.targetDate+"T12:00:00")-Date.now())/864e5);if(daysLeft<=0)return `<div class="boss-pace overdue">⚠ Target date passed — ${b.hp} steps remain</div>`;const needed=(b.hp/daysLeft).toFixed(1);const onPace=parseFloat(needed)<=1;return `<div class="boss-pace${onPace?' on-pace':''}">${onPace?"✓":"⚠"} ${needed} steps/day to finish by ${b.targetDate} · ${daysLeft}d left</div>`;})()}
      ${checksHtml}
      <div class="boss-add-check">
        <input class="boss-check-input" data-baddcheck="${b.id}" placeholder="Add a milestone…" maxlength="80">
        <button class="boss-check-add-btn" data-baddcheckbtn="${b.id}">+</button>
      </div>
      ${(()=>{
        const tc=b.todayCommit; const td=typeof localYMD==="function"?localYMD():"";
        if(tc&&tc.date===td){
          const hit=(tc.startHp||b.maxhp)-b.hp;
          const met=hit>=tc.hp;
          const pct=Math.min(100,Math.round(hit/tc.hp*100));
          if(met) return `<div class="boss-sprint done">✓ Sprint complete — ${tc.hp} step${tc.hp!==1?"s":""} hit today</div>`;
          return `<div class="boss-sprint"><div class="boss-sprint-label">Sprint: ${hit}/${tc.hp} steps today <span style="color:var(--ink-faint);font-size:10px">${pct}%</span></div><div class="boss-sprint-bar"><div class="boss-sprint-fill" style="width:${pct}%"></div></div></div>`;
        } else if(tc&&tc.date<td){
          const missed=(tc.startHp||b.maxhp)-b.hp < tc.hp;
          return missed?`<div class="boss-sprint missed">⚠ Yesterday's sprint (${tc.hp} step${tc.hp!==1?"s":""}) was not completed</div>`:``;
        }
        return `<div class="boss-sprint-setter"><span class="boss-sprint-lbl">Today's commitment:</span><input class="boss-sprint-input" type="number" min="1" max="${b.hp}" step="1" placeholder="steps" id="bsprint-${b.id}"><button class="boss-sprint-btn" data-bsprintset="${b.id}">Set</button></div>`;
      })()}
      <div class="boss-actions">
        ${b.cpDriven&&b.hp===1?`<button class="hit conquer" data-hit="${b.id}">🏆 Conquer the Trial</button>`:b.cpDriven&&b.hp>1?`<div class="boss-no-strike">Complete a milestone to make progress</div>`:`<button class="hit" data-hit="${b.id}">⚔️ Strike it</button>`}
      </div>
    </li>`;
  };
  const archiveHtml=archived.length?`<details class="boss-archive">
    <summary>🏆 Conquered (${archived.length})</summary>
    ${archived.map(b=>`<div class="boss-archive-item">
      <span class="boss-archive-icon">🏆</span>
      <div class="boss-archive-body">
        <div class="boss-archive-name">${esc(b.name)}</div>
        <div class="boss-conquered-date">Conquered ${esc(b.completedAt)} · ${b.maxhp} steps total</div>
      </div>
      <button class="del" data-db="${b.id}" title="Remove">✕</button>
    </div>`).join("")}
  </details>`:"";
  el.innerHTML=(active.length?active.map(bossCard).join(""):
    `<div class="empty" style="margin-bottom:12px"><span class="big">⚔️</span>No active trials. Name what you must endure and begin the reckoning.</div>`
  )+archiveHtml;
}
function renderShop(){
  const el=document.getElementById("rList");
  if(!S.rewards.length){el.innerHTML=`<div class="empty"><span class="big">🍺</span>The Mead Hall is empty. Name your earned rest so victory has a destination.</div>`;return}
  el.innerHTML=S.rewards.map(r=>`
    <li class="card">
      <div class="c-body reward">
        <div style="flex:1"><div class="c-name">${esc(r.name)}</div>
          <div class="c-meta"><span class="cost">🎖️ ${r.cost} merit</span></div></div>
        <button class="btn-buy" data-buy="${r.id}" ${S.gold<r.cost?'disabled':''}>Claim Rest</button>
      </div>
      <button class="del" data-dr="${r.id}">✕</button>
    </li>`).join("");
}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function miniSparkline(vals,W,H){
  if(!vals||vals.length<2) return "";
  const PAD=4;
  const mn=Math.min(...vals),mx=Math.max(...vals),rng=(mx-mn)||1;
  const cx=i=>PAD+Math.round((i/(vals.length-1))*(W-PAD*2));
  const cy=v=>H-PAD-Math.round(((v-mn)/rng)*(H-PAD*2));
  const pts=vals.map((v,i)=>`${cx(i)},${cy(v)}`).join(" ");
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px">
    <polyline points="${pts}" fill="none" stroke="var(--jade)" stroke-width="1.5" stroke-linejoin="round"/>
    ${vals.map((v,i)=>`<circle cx="${cx(i)}" cy="${cy(v)}" r="2.5" fill="var(--jade)"/>`).join("")}
  </svg>`;
}
