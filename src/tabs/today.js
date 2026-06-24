// ===== Dawn / Dashboard — one focus at a time, guide not overwhelm =====

// Determine the single most important action right now.
function getWarriorsFocus(){
  const p=typeof todaysPlan==="function"?todaysPlan():null;
  // 0. Overdue oaths
  const today=localYMD();
  const overdueQ=(S.quests||[]).find(q=>!q.done&&q.due&&q.due<today);
  if(overdueQ) return {icon:"⚠️", action:overdueQ.name, sub:`Overdue — was due ${overdueQ.due}`, btn:"All oaths →", tab:"quests"};
  // 1. Scheduled training session not yet logged — session is already shown above, so action = log it
  if(p&&p.sessionKey&&!p.todayLogged){
    return {icon:"💪", action:"Complete today's training — then log it.", sub:"Session details are above.", btn:"Open Log to record it →", tab:"log", logsess:p.sessionKey};
  }
  // 2. Hardest incomplete daily order
  for(const diff of ["hard","med","easy"]){
    const d=(S.dailies||[]).find(x=>!x.done && x.diff===diff);
    if(d) return {icon:"🎯", action:d.name, sub:"Daily order", btn:"All orders →", tab:"dailies"};
  }
  // 3. Habits due today
  const habitDue=(S.habits||[]).find(h=>!habitDoneToday(h));
  if(habitDue) return {icon:"📋", action:habitDue.name, sub:"Habit due today", btn:"All habits →", tab:"dailies"};
  // 4. Fading skill
  const fading=(S.lifeSkills||[]).filter(s=>!s.group).map(s=>({s,q:typeof skQuest==="function"?skQuest(s):null})).filter(x=>x.q&&x.q.type==="decay")[0];
  if(fading) return {icon:"🌳", action:`Reclaim ${fading.s.name}`, sub:"A branch fades — address it before it drops further", btn:"Tend the Tree →", tab:"skills"};
  // 5. SRS cards due
  const srsDue=typeof srsTotalDue==="function"?srsTotalDue():0;
  if(srsDue>0) return {icon:"📚", action:`${srsDue} SRS card${srsDue!==1?"s":""} ready for review`, sub:"Spaced repetition keeps knowledge from fading", btn:"Review now →", tab:"test"};
  // 6. Everything clear
  if(p&&p.todayLogged&&p.sessionKey) return {icon:"✅", action:"Training logged. All clear.", sub:"The ring is carved. Well done.", btn:null, tab:null};
  return null;
}

// Find the single most neglected path — only if genuinely out of balance.
function getNeglectedPath(){
  const pxp=S.pathXP||{};
  const entries=Object.keys(pxp).map(k=>({k,xp:pxp[k]||0})).filter(e=>e.xp>0);
  if(entries.length<2) return null;
  entries.sort((a,b)=>a.xp-b.xp);
  const avg=entries.reduce((s,e)=>s+e.xp,0)/entries.length;
  const lowest=entries[0];
  if(lowest.xp>avg*0.35) return null; // only flag when meaningfully neglected
  const pm=PATH_META[lowest.k]; if(!pm) return null;
  return {name:pm.name, icon:pm.icon, color:pm.color, idol:pm.idol};
}

// Inline daily orders card for Dawn — check off right here without switching tabs.
function dawnOrdersHtml(){
  const dailies=S.dailies||[];
  if(!dailies.length) return "";
  const done=dailies.filter(d=>d.done).length;
  const allDone=done===dailies.length;
  const sorted=dailies.slice().sort((a,b)=>(a.done?1:0)-(b.done?1:0));
  const show=sorted.slice(0,5);
  const extra=sorted.length>5?sorted.length-5:0;
  const rows=show.map(d=>`<div class="dawn-order-row${d.done?" done":""}"><button class="dawn-ck${d.done?" done":""}" data-d="${d.id}">${d.done?"✓":""}</button><span class="dawn-order-name">${esc(d.name)}</span></div>`).join("");
  const header=allDone
    ?`<div class="td-h fn-h" style="color:var(--jade)">✓ All orders complete</div>`
    :`<div class="td-h fn-h">Daily Orders <span style="color:var(--ember);font-size:12px">${done}/${dailies.length}</span></div>`;
  const moreLink=extra?`<div class="fn-row"><span class="fn-dot">+${extra} more</span><button class="td-go-sm" data-gototab="dailies">See all →</button></div>`:"";
  return `<div class="td-card fn-card dawn-orders-card">${header}${rows}${moreLink}</div>`;
}

function disciplineLogHtml(){
  const log=(S.streakLog||[]).slice(-7);
  if(log.length<2) return "";
  const avg=Math.round(log.reduce((s,e)=>s+e.pct,0)/log.length);
  const cells=log.map(e=>{
    const h=Math.max(4,Math.round(e.pct/100*28));
    const col=e.pct>=100?"var(--jade)":e.pct>=50?"var(--gold)":"var(--ember)";
    return `<div class="disc-cell" title="${e.pct}% on ${e.date}" style="height:${h}px;background:${col}"></div>`;
  }).join('');
  return `<div class="td-card fn-card">
    <div class="td-h fn-h">7-Day Discipline <span class="disc-avg">${avg}% avg</span></div>
    <div class="disc-log">${cells}</div>
    <div class="disc-legend">Orders completed per day — green=100%, amber≥50%, ember&lt;50%</div>
  </div>`;
}

function dawnBossHtml(){
  const boss=(S.bosses||[]).find(b=>b.hp>0); if(!boss) return "";
  const progress=boss.maxhp-boss.hp;
  const pct=Math.round(progress/boss.maxhp*100);
  return `<div class="dawn-boss-card">
    <div class="dawn-boss-header">
      <span class="dawn-boss-icon">⚔️</span>
      <div class="dawn-boss-name">${esc(boss.name)}</div>
      <button class="td-go-sm" data-gototab="bosses">All →</button>
    </div>
    <div class="dawn-hpbar"><div class="dawn-hpfill" style="width:${pct}%"></div></div>
    <div class="dawn-boss-meta">${progress}/${boss.maxhp} steps complete · ${boss.hp} remaining</div>
    <button class="dawn-hit-btn" data-hit="${boss.id}">⚔️ Strike it</button>
  </div>`;
}

function copyDailyBrief(){
  const name=S.name||"Cadet";
  const rank=S.rank||"MS2 Cadet";
  const date=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  const lastAft=S.aft&&S.aft.length?S.aft[S.aft.length-1]:null;
  const aftLine=lastAft?`AFT: ${lastAft.total} pts (${lastAft.date})`:"AFT: not logged";
  const cd=S.profile&&S.profile.commissionDate;
  const commissLine=cd?`Commission: ${Math.max(0,Math.ceil((new Date(cd+"T12:00:00")-Date.now())/864e5))} days`:"Commission: date not set";
  const done=(S.dailies||[]).filter(d=>d.done).length, total=(S.dailies||[]).length;
  const overdueCount=(S.quests||[]).filter(q=>!q.done&&q.due&&q.due<localYMD()).length;
  const activeQ=(S.quests||[]).filter(q=>!q.done).length;
  const brief=[
    `DAILY BRIEF — ${name} · ${rank}`,
    `Date: ${date}`,
    `─────────────────────`,
    aftLine,
    commissLine,
    `Orders: ${done}/${total} complete today`,
    `Active oaths: ${activeQ}${overdueCount>0?` (${overdueCount} OVERDUE)`:""}`,
    `Branch goal: ${S.branchGoal||"TBD"}`,
    `─────────────────────`,
    `OPERATIONS — carried at the root`,
  ].join("\n");
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(brief).then(()=>toast("📋 Brief copied to clipboard")).catch(()=>toast("Copy failed — try long-pressing"));
  } else { toast("Clipboard not available in this browser"); }
}

function pathPipsHtml(){
  const pxp=S.pathXP||{};
  const order=typeof SK_CAT_ORDER!=="undefined"?SK_CAT_ORDER:Object.keys(PATH_META);
  const active=order.filter(cat=>pxp[cat]>0);
  if(!active.length) return "";
  const pips=active.map(cat=>{
    const xp=pxp[cat]||0;
    const {lvl,into,need}=typeof skillLevel==="function"?skillLevel(xp):{lvl:1,into:0,need:80};
    const pct=Math.round(into/need*100);
    const pm=PATH_META[cat]||{icon:"•",name:cat,color:"var(--ink-faint)"};
    return `<div class="path-pip"><div class="path-pip-icon">${pm.icon}</div><div class="path-pip-right"><div class="path-pip-lv" style="color:${pm.color}">Lv${lvl}</div><div class="path-pip-track"><div class="path-pip-fill" style="width:${pct}%;background:${pm.color}"></div></div></div></div>`;
  }).join('');
  return `<div class="td-card fn-card path-pips-card">
    <div class="td-h fn-h">Paths <span style="color:var(--ink-faint);font-weight:400;font-size:12px">${active.length} active</span></div>
    <div class="path-pips-row">${pips}</div>
  </div>`;
}
function weekTrainCardHtml(){
  const ws=typeof weekTrainingStats==="function"?weekTrainingStats():{done:0,sched:0};
  if(!ws.sched) return "";
  const done=ws.done, sched=ws.sched;
  const bar='▓'.repeat(done)+'░'.repeat(Math.max(0,sched-done));
  const allDone=done>=sched;
  return `<div class="td-card fn-card dawn-week-card">
    <div class="td-h fn-h">This Week <span class="dawn-week-count" style="color:${allDone?"var(--jade)":"var(--ink-dim)"}">${done}/${sched} sessions</span></div>
    <div class="dawn-week-bar"><span class="dawn-week-blocks">${bar}</span><button class="td-go-sm" style="margin-left:auto" data-gototab="plan">Plan →</button></div>
  </div>`;
}
function renderToday(){
  const el=document.getElementById("todayDash"); if(!el) return;
  const hour=new Date().getHours();
  const firstName=esc((S.name||"Cadet").split(" ")[0]);
  const greet = hour<5  ? `Before dawn, ${firstName}. The tree does not sleep.`
              : hour<12 ? `At dawn, ${firstName}.`
              : hour<17 ? `Midday, ${firstName}. Hold the ground.`
              : hour<21 ? `The day closes, ${firstName}. What was carved today?`
              :            `Night watch, ${firstName}. Rest is part of the work.`;
  const g=document.getElementById("todayGreeting"); if(g) g.textContent=greet;
  const dd=document.getElementById("todayDate"); if(dd) dd.textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});

  // ── Creed — one line of hard-won truth, drawn fresh each day
  const CREEDS=[
    "A tree is grown one season at a time. Tend yours today.",
    "The branch you neglect sheds its leaves — but it never dies. Tend it and it returns.",
    "Rings form in the quiet years. Show up when no one is watching.",
    "Deep roots are not reached by the frost. Build your base.",
    "Small daily reps are the rings of the trunk — invisible now, unbreakable later.",
    "The seed doesn't see the forest. Plant anyway.",
    "A leader is a tree others shelter under. Grow tall, stay rooted.",
    "Consistency over intensity. The oak outlasts the storm by being there every day.",
    "Reclaiming lost ground is faster than breaking new — you have done it before.",
    "You cannot see the crown of Yggdrasil from its roots. Grow anyway.",
    "Every path on the tree costs something. Invest where it matters.",
    "Discipline is the root; everything you want grows from it.",
    "The strongest wood grows against the wind. Lean into the hard thing.",
    "Standards are met in private long before they are tested in public.",
    "Mind, body, and will are one tree. Starve none of them.",
    "What you do today, you become. Choose the next ring well.",
    "You are not behind. You are growing. Growth has no shortcut.",
    "You do not need motivation. You need the next rep. Just that one.",
    "The warrior who sleeps well is the warrior who trained hard. Do the work that earns the rest.",
    "Your rank is a seed, not a crown. Water it.",
    "Discipline is not the enemy of freedom — it is the price of it. Pay daily.",
    "Odin did not receive the runes — he earned them. Nine days. No food. No water. What will you endure for wisdom?",
    "Mjölnir was forged by those who refused to stop. The work was imperfect; it still split mountains.",
    "An oath made and kept is a ring in the trunk. An oath broken rots at the root.",
    "The Einherjar do not wait for worthy opponents. They train until worthy opponents arise.",
    "The three wells of Yggdrasil water fate, wisdom, and power. Which are you tending today?",
    "The Norns weave your thread. You choose how it runs.",
    "Hel does not take you because you are old. She takes you because you stopped growing.",
    "A cadet who knows why they are training is harder to exhaust than one who doesn't.",
    "Your ancestors built something harder than this with fewer tools. Less excuses, more reps.",
    "Every tree that grew tall once grew in the dark, reaching for light it could not yet see.",
  ];
  const ymd=localYMD(); const seed=ymd.split("-").reduce((a,n)=>a+parseInt(n),0);
  const creed=CREEDS[seed % CREEDS.length];

  // ── Commissioning countdown
  let commissionHtml="";
  const cd=S.profile&&S.profile.commissionDate;
  if(cd){
    const daysLeft=Math.ceil((new Date(cd+`T12:00:00`)-Date.now())/864e5);
    if(daysLeft>0){
      const weeks=Math.floor(daysLeft/7);
      const sub=weeks>0?`${weeks} week${weeks!==1?"s":""} and ${daysLeft%7} day${daysLeft%7!==1?"s":""}`:
        `${daysLeft} day${daysLeft!==1?"s":""}`;
      commissionHtml=`<div class="commission-bar">⚔️ <b>${daysLeft}</b> days to commissioning <span class="commission-sub">· ${sub} remaining · The long march continues, ${firstName}.</span></div>`;
    } else if(daysLeft<=0){
      commissionHtml=`<div class="commission-bar radiant">⚔️ ${firstName} — today is the day. You made it.</div>`;
    }
  }

  // ── Orders counts (used by both the inline card and streak protection)
  const ordersLeft=(S.dailies||[]).filter(d=>!d.done).length;
  const ordersTotal=(S.dailies||[]).length;

  // ── Today's training session (always shown; compact card from plan.js)
  const sessHtml=typeof dawnSessionHtml==="function"?dawnSessionHtml():"";

  // ── Inline daily orders card
  const ordersHtml=dawnOrdersHtml();

  // ── Streak protection — evening warning if streak is alive but orders remain
  const atRisk=S.streak>0 && ordersLeft>0 && ordersTotal>0 && hour>=17;
  const streakHtml=atRisk
    ?`<div class="streak-alert">🔥 ${S.streak}-day streak at risk — ${ordersLeft} order${ordersLeft!==1?"s":""} left before midnight.</div>`
    :"";

  // ── Warrior's Focus — the one non-training thing to do right now
  const focus=getWarriorsFocus();
  const focusLogsess=focus&&focus.logsess?` data-logsess="${focus.logsess}"`:"";
  const focusHtml=focus?`<div class="focus-card">
    <div class="focus-label">Today's Focus</div>
    <div class="focus-main">${focus.icon} ${esc(focus.action)}</div>
    ${focus.sub?`<div class="focus-sub">${esc(focus.sub)}</div>`:""}
    ${focus.btn?`<button class="td-go focus-go" data-gototab="${focus.tab}"${focusLogsess}>${focus.btn}</button>`:""}
  </div>`:"";

  // ── Adaptive training note (missed sessions last 7 days)
  const adaptNote=typeof getAdaptiveNote==="function"?getAdaptiveNote():null;
  const adaptHtml=adaptNote?`<div class="adapt-note">⚠️ ${esc(adaptNote)}</div>`:"";

  // ── Neglected path (only the worst one, only if genuinely behind)
  const neglected=getNeglectedPath();
  const neglectHtml=neglected?`<div class="path-alert" style="border-left-color:${neglected.color}">
    ${neglected.icon} <b>${esc(neglected.name)}</b> grows dim — ${esc(neglected.idol)} dims in your absence.
    <button class="td-go-sm path-alert-go" data-gototab="garden">Tend →</button>
  </div>`:"";

  // ── Field Notes — compact secondary info (orders now shown in their own card above)
  const notes=[];
  const srsDue=typeof srsTotalDue==="function"?srsTotalDue():0;
  if(srsDue>0) notes.push(`<div class="fn-row"><span class="fn-dot">📚</span><span>${srsDue} SRS card${srsDue!==1?"s":""} due</span><button class="td-go-sm" data-gototab="test">→</button></div>`);
  const tStr=todayStr();
  const studyCount=(S.studyPlans||[]).reduce((cnt,pl)=>cnt+((pl.schedule||[]).filter(s=>s.date===tStr&&!(pl.done||[]).includes(s.date+"|"+s.topic)).length),0);
  if(studyCount>0) notes.push(`<div class="fn-row"><span class="fn-dot">📅</span><span>${studyCount} study review${studyCount!==1?"s":""} due</span><button class="td-go-sm" data-gototab="quizzes">→</button></div>`);
  const lastAft=(S.aft||[])[S.aft.length-1];
  if(lastAft){
    const c=typeof aftCtx==="function"?aftCtx():{standard:"general"};
    const pass=lastAft.total>=(c.standard==="combat"?350:300);
    notes.push(`<div class="fn-row"><span class="fn-dot">⚔️</span><span>AFT: ${lastAft.total} pts <span style="color:${pass?"var(--jade)":"var(--ember)"}">(${pass?"passing":"below standard"})</span></span></div>`);
    // AFT regression note
    if(S.aft.length>=2){
      const prevAft=S.aft[S.aft.length-2];
      if(lastAft.total < prevAft.total - 4){
        notes.push(`<div class="fn-row"><span class="fn-dot">📉</span><span>Score dropped ${prevAft.total-lastAft.total} pts from last test</span><button class="td-go-sm" data-gototab="aft">→</button></div>`);
      }
    }
  }
  if(S.profile&&S.profile.gpa) notes.push(`<div class="fn-row"><span class="fn-dot">📊</span><span>GPA ${S.profile.gpa} · ${esc(S.branchGoal||"Branch TBD")}</span></div>`);
  if(S.profile&&S.profile.bloodType){
    const lastDon=(S.donations||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    if(lastDon){const nxt=new Date(lastDon.date);nxt.setDate(nxt.getDate()+56);const d=Math.ceil((nxt-Date.now())/864e5);if(d<=7)notes.push(`<div class="fn-row"><span class="fn-dot">🩸</span><span>Blood donation: ${d<=0?"eligible now":`eligible in ${d} day${d!==1?"s":""}`}</span></div>`);}
  }
  if(S.aftTestDate){const _aftD=Math.ceil((new Date(S.aftTestDate+"T12:00:00")-Date.now())/864e5);if(_aftD>=0&&_aftD<=60)notes.push(`<div class="fn-row"><span class="fn-dot">⏳</span><span>AFT in ${_aftD===0?"today":_aftD+" day"+(_aftD!==1?"s":"")} · <span style="color:${_aftD<=14?"var(--ember)":"var(--ink-dim)"}">stay on plan</span></span><button class="td-go-sm" data-gototab="aft">→</button></div>`);}
  const overdueCount=(S.quests||[]).filter(q=>!q.done&&q.due&&q.due<localYMD()).length;
  if(overdueCount>1) notes.push(`<div class="fn-row"><span class="fn-dot">⚠️</span><span>${overdueCount} overdue oaths</span><button class="td-go-sm" data-gototab="quests">→</button></div>`);
  const notesHtml=notes.length?`<div class="td-card fn-card"><div class="td-h fn-h">Field Notes</div>${notes.join("")}</div>`:"";

  // ── FM Advisory (only if recovery data exists)
  let fmHtml="";
  const rec=typeof recoveryReadiness==="function"?recoveryReadiness():null;
  const vo2=typeof vo2Benchmark==="function"?vo2Benchmark():null;
  if(rec||vo2){
    const fl=typeof fmFocusLine==="function"?fmFocusLine():null;
    const recIcon=rec?(rec.level==="easy"?"🟠":rec.level==="caution"?"🟡":"🟢"):"";
    let body="";
    if(rec) body+=`<div class="fn-row"><span>${recIcon} ${esc(rec.line)}</span></div>`;
    if(fl) body+=`<div class="fn-row"><span>${esc(fl)}</span></div>`;
    if(vo2) body+=`<div class="fn-row"><span>🫁 ${esc(vo2.line)}</span></div>`;
    fmHtml=`<div class="td-card fn-card"><div class="td-h fn-h">FM Advisory</div>${body}<button class="td-go" data-gototab="plan">Open FM plan →</button></div>`;
  }

  // ── Getting started — shown only when the user has no data at all yet
  let startHtml="";
  const isNew = S.name==="Cadet" && !S.aft.length && !S.totalDone && !S.profile.commissionDate;
  if(isNew){
    startHtml=`<div class="start-card">
      <div class="start-h">🌱 Getting Started</div>
      <p class="start-intro">The tree grows one ring at a time. Work through these in order — each one unlocks the next thing this app can do for you.</p>
      <div class="start-step"><span class="start-num">1</span><span>Set your name, rank, and commission date</span><button class="td-go-sm" data-gototab="profile">Profile →</button></div>
      <div class="start-step"><span class="start-num">2</span><span>Log your first AFT score to set your baseline</span><button class="td-go-sm" data-gototab="aft">AFT →</button></div>
      <div class="start-step"><span class="start-num">3</span><span>Add at least one daily order you'll complete every day</span><button class="td-go-sm" data-gototab="dailies">Orders →</button></div>
      <div class="start-step"><span class="start-num">4</span><span>Open the FM Plan and log today's training session</span><button class="td-go-sm" data-gototab="plan">FM Plan →</button></div>
    </div>`;
  }

  // ── PWA install nudge — shown once (mobile only, before the user installs)
  let installHtml="";
  if(!window.matchMedia("(display-mode:standalone)").matches && !S.installPromptDismissed){
    const canOneTab=typeof _deferredInstallPrompt!=="undefined"&&_deferredInstallPrompt;
    installHtml=`<div class="install-card">
      <div class="install-body">
        <div class="install-title">📲 Install as App</div>
        <div class="install-sub">${canOneTab?"Tap <b>Install</b> to add Operations to your home screen.":"Open your browser's share menu and choose <b>Add to Home Screen</b> to install."}</div>
      </div>
      <div class="install-actions">${canOneTab?`<button class="install-btn" data-install-now="1">Install</button>`:""}<button class="install-dismiss" data-install-dismiss="1">Dismiss</button></div>
    </div>`;
  }

  // ── Notification prompt — shown only when streak is active and permission not yet granted
  let notifPromptHtml="";
  if(typeof Notification!=="undefined"&&Notification.permission==="default"&&S.streak>0&&!S.notifEnabled){
    notifPromptHtml=`<div class="notif-prompt-card">🔔 Enable streak alerts to get a reminder at 7 pm when orders are still open.<button class="notif-prompt-btn" data-notif-prompt="1">Enable →</button></div>`;
  }

  // ── Streak recovery mode (first 3 days after a break)
  let recoveryHtml="";
  if(S.streak===0 && S.streakBrokenDate){
    const daysSince=dayDiff(S.streakBrokenDate, localYMD());
    const dayNum=Math.min(daysSince+1, 3);
    const left=3-daysSince;
    if(left>0){
      const pips=[1,2,3].map(n=>`<div class="rm-pip${n<dayNum?' done':''}">${n<dayNum?'✓':n}</div>`).join('');
      recoveryHtml=`<div class="recovery-mode-card">
        <div class="rm-title">⚡ Day ${dayNum} of rebuilding</div>
        <div class="rm-body">${left===1?"One perfect day restores your momentum.":`${left} perfect days to restore your momentum.`} Today: complete all orders.</div>
        <div class="rm-pips">${pips}</div>
      </div>`;
    }
  }

  // ── Path XP pips
  const pathPips=pathPipsHtml();

  // ── Weekly training summary card
  const weekCardHtml=weekTrainCardHtml();

  // ── Active boss card
  const bossHtml=dawnBossHtml();

  // ── 7-day discipline bar
  const discHtml=disciplineLogHtml();

  // ── Copy daily brief button (compact row)
  const briefBtnHtml=`<div class="brief-row"><button class="brief-btn" data-copybriefbtn="1">📋 Copy today's brief</button></div>`;

  // ── Assemble — creed always first, then guided flow
  const flow=[startHtml, sessHtml, weekCardHtml, ordersHtml, recoveryHtml, discHtml, bossHtml, streakHtml, commissionHtml, focusHtml, adaptHtml, neglectHtml, pathPips, notesHtml, fmHtml, briefBtnHtml, installHtml, notifPromptHtml].filter(Boolean).join("");

  el.innerHTML=`<div class="td-creed">🌲 <span>${creed}</span></div>`+(
    flow
      ? `<div class="td-flow">${flow}</div>`
      : `<div class="aw-empty"><span class="big">🌱</span>The ground is bare. Swear your oaths, plant your daily orders — and this becomes the soil your tree grows from.</div>`
  );
}

function makeStudyPlan(title,testDate,topics){
  const today=new Date(); today.setHours(0,0,0,0);
  const test=new Date(testDate); test.setHours(0,0,0,0);
  const totalDays=Math.max(1, Math.round((test-today)/864e5));
  let offsets=[0,1,3,6,10,14,20,27].filter(o=>o<=totalDays);
  if(totalDays>0 && !offsets.includes(totalDays-1) && (totalDays-1)>=0) offsets.push(totalDays-1);
  offsets=[...new Set(offsets)].sort((a,b)=>a-b);
  const schedule=[];
  topics.forEach((topic)=>{
    offsets.forEach(o=>{
      const d=new Date(today); d.setDate(d.getDate()+o);
      schedule.push({date:localYMD(d), topic});
    });
  });
  return {id:id(), title, testDate, topics, created:Date.now(), schedule, done:[]};
}
