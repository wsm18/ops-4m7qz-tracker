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
    const d=(S.dailies||[]).find(x=>x.kind==="order"&&!x.done && x.diff===diff);
    if(d) return {icon:"🎯", action:d.name, sub:"Daily order", btn:"All orders →", tab:"dailies"};
  }
  // 3. Habits due today
  const habitDue=(S.dailies||[]).find(h=>h.kind==="habit"&&h.lastDone!==localYMD());
  if(habitDue) return {icon:"📋", action:habitDue.name, sub:"Habit due today", btn:"All habits →", tab:"dailies"};
  // 4. Highest-leverage skill needing attention — computeSmartFocus() (skills-core.js)
  // is the one real urgency+opportunity ranker; this used to be a separate
  // first-match-in-array-order pick that could disagree with the Dawn callout
  // recommending a different skill in the same render (found by the v200-
  // session audit — 5 independent "what needs attention" algorithms).
  const smart=typeof computeSmartFocus==="function"?computeSmartFocus():null;
  if(smart) return {icon:"🌳", action:`Reclaim ${smart.sk.name}`, sub:smart.why, btn:"Tend the Tree →", tab:"skills", skId:smart.sk.id};
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
  const dailies=(S.dailies||[]).filter(d=>d.kind==="order");
  if(!dailies.length) return "";
  const done=dailies.filter(d=>d.done).length;
  const allDone=done===dailies.length;
  const sorted=dailies.slice().sort((a,b)=>(a.done?1:0)-(b.done?1:0));
  const show=sorted.slice(0,5);
  const extra=sorted.length>5?sorted.length-5:0;
  const rows=show.map(d=>`<div class="dawn-order-row${d.done?" done":""}"><button class="dawn-ck${d.done?" done":""}" data-dtdo="${d.id}">${d.done?"✓":""}</button><span class="dawn-order-name">${esc(d.name)}</span></div>`).join("");
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
    const col=e.pct>=100?"var(--jade)":e.pct>=50?"var(--gold)":e.pct>0?"var(--ember)":"var(--line)";
    return `<div class="disc-cell" title="${e.pct}% on ${e.date}" style="height:${h}px;background:${col}"></div>`;
  }).join('');
  const doneHours=(S.dailies||[]).filter(d=>d.done&&d.doneTs).map(d=>new Date(d.doneTs).getHours());
  const medHr=doneHours.length?doneHours.slice().sort((a,b)=>a-b)[Math.floor(doneHours.length/2)]:null;
  const medLine=medHr!==null?` · avg done by ${medHr}:00`:'';
  return `<div class="td-card fn-card">
    <div class="td-h fn-h">7-Day Discipline <span class="disc-avg">${avg}% avg</span></div>
    <div class="disc-log">${cells}</div>
    <div class="disc-legend">Orders completed per day — green=100%, gold≥50%, ember&gt;0%, grey=0%${medLine}</div>
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

// Unified cross-tab "what's coming up" — merges every forward-looking date
// already tracked independently across tabs (quest due dates, boss target
// dates, the AFT test date, milestones, qualification expiries, counseling
// follow-ups) into one chronologically-sorted view. Read-only aggregation —
// none of these dates are stored here; each source tab remains the owner of
// its own date field. Deliberately excludes already-overdue items (those get
// their own top-billing treatment via Warrior's Focus / the overdue-oaths
// count) — this is forward-looking only, "what's coming," not "what's late."
function renderUpcomingTimeline(){
  const today=localYMD();
  const items=[];
  (S.quests||[]).forEach(q=>{ if(!q.done&&q.due) items.push({date:q.due, icon:"🎯", label:q.name, tab:"quests"}); });
  (S.bosses||[]).forEach(b=>{ if(!b.completedAt&&b.hp>0&&b.targetDate) items.push({date:b.targetDate, icon:"⚔️", label:b.name, tab:"bosses"}); });
  if(S.aftTestDate) items.push({date:S.aftTestDate, icon:"💪", label:"AFT test", tab:"aft"});
  (S.milestones||[]).forEach(m=>{ if(m.date) items.push({date:m.date, icon:"📍", label:m.label, tab:null}); });
  (S.qualifications||[]).forEach(q=>{
    if(!q.expires) return;
    const cat=typeof QUAL_CATALOG!=="undefined"&&QUAL_CATALOG[q.key]?QUAL_CATALOG[q.key]:null;
    const name=q.key==="custom"?(q.label||q.key):(cat?cat.fullName:q.key);
    items.push({date:q.expires, icon:"🎖️", label:`${name} expires`, tab:"awards"});
  });
  (S.counseling||[]).forEach(c=>{
    if(c.followUp&&/^\d{4}-\d{2}-\d{2}$/.test(c.followUp)) items.push({date:c.followUp, icon:"📋", label:`Follow-up: ${(c.summary||"").slice(0,40)}`, tab:"records"});
  });

  const upcoming=items.filter(x=>x.date>=today).sort((a,b)=>a.date<b.date?-1:(a.date>b.date?1:0));
  if(!upcoming.length) return "";
  const show=upcoming.slice(0,8);
  const extra=upcoming.length-show.length;
  const rows=show.map(x=>{
    const days=Math.ceil((new Date(x.date+"T12:00:00")-Date.now())/864e5);
    const dayStr=days<=0?"today":days===1?"tomorrow":`in ${days}d`;
    const urgentColor=days<=3?"var(--ember)":days<=7?"var(--gold)":"var(--ink-dim)";
    const goBtn=x.tab?`<button class="td-go-sm" data-gototab="${x.tab}">→</button>`:"";
    return `<div class="tl-row"><span class="tl-icon">${x.icon}</span><span class="tl-label">${esc(x.label)}</span><span class="tl-when" style="color:${urgentColor}">${dayStr}</span>${goBtn}</div>`;
  }).join("");
  const moreLine=extra>0?`<div class="fn-row"><span class="fn-dot">+${extra} more upcoming</span></div>`:"";
  return `<div class="td-card fn-card"><div class="td-h fn-h">Upcoming</div>${rows}${moreLine}</div>`;
}

// Contextual AAR prompt — nudges toward the After-Action Review journal
// (records.js) after the two triggers the doc calls out: a broken streak or
// a below-standard AFT. Suppressed if an AAR was already logged in the last
// 3 days, so this doesn't nag once the user's actually reflected.
function aarNudgeHtml(){
  const recentAAR=(S.aarLog||[]).some(a=>a.date&&dayDiff(a.date,localYMD())<=3);
  if(recentAAR) return "";
  const streakBroke=S.streak===0&&S.streakBrokenDate&&dayDiff(S.streakBrokenDate,localYMD())<=3;
  const lastAft=(S.aft||[])[S.aft.length-1];
  let badAft=false;
  if(lastAft&&lastAft.date&&dayDiff(lastAft.date,localYMD())<=3){
    const c=typeof aftCtx==="function"?aftCtx():{standard:"general"};
    badAft=lastAft.total<(c.standard==="combat"?350:300);
  }
  if(!streakBroke&&!badAft) return "";
  const reason=streakBroke?"Your streak just broke":"Your last AFT came in below standard";
  return `<div class="aar-nudge">📝 ${reason} — worth an After-Action Review: what was planned, what happened, why, what to sustain or improve.<button class="td-go-sm" data-gototab="records">Write one →</button></div>`;
}

function copyDailyBrief(){
  const name=S.name||"Cadet";
  const rank=S.rank||"MS2 Cadet";
  const date=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  const lastAft=S.aft&&S.aft.length?S.aft[S.aft.length-1]:null;
  const aftLine=lastAft?`AFT: ${lastAft.total} pts (${lastAft.date})`:"AFT: not logged";
  const cd=S.profile&&S.profile.commissionDate;
  const commissLine=cd?`Commission: ${Math.max(0,Math.ceil((new Date(cd+"T12:00:00")-Date.now())/864e5))} days`:"Commission: date not set";
  const done=(S.dailies||[]).filter(d=>d.kind==="order"&&d.done).length, total=(S.dailies||[]).filter(d=>d.kind==="order").length;
  const overdueCount=(S.quests||[]).filter(q=>!q.done&&q.due&&q.due<localYMD()).length;
  const activeQ=(S.quests||[]).filter(q=>!q.done).length;
  const brief=[
    `FIELD BRIEF — ${name} · ${rank}`,
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
// Simple deterministic string hash (djb2-style, integer result)
function hashStr(s){
  let h=5381;
  for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0;
  return h;
}
// Seeded shuffle: Fisher-Yates with deterministic seed
function seededShuffle(arr, seed){
  const a=arr.slice();
  let s=seed>>>0;
  for(let i=a.length-1;i>0;i--){
    s=(s*1664525+1013904223)>>>0;
    const j=s%(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
// X-SmartFocus callout — the single highest-leverage skill to re-engage
// right now, per computeSmartFocus() (skills-core.js). Supplements Today's
// Hand's random draw rather than replacing it; silent when nothing in the
// tree currently has real urgency or a real peak/effective gap to close.
function smartFocusCalloutHtml(){
  const rec=typeof computeSmartFocus==="function"?computeSmartFocus():null;
  if(!rec) return "";
  return `<div class="sf-callout" style="--sf-col:${rec.path.color||'var(--gold)'}">
    <span class="sf-ic">🎯</span>
    <div class="sf-body">
      <div class="sf-lbl">Your real priority</div>
      <div class="sf-skill">${esc(rec.sk.name)} <span class="sf-path">${rec.path.icon||''} ${esc(rec.path.name||'')}</span></div>
      <div class="sf-why">${esc(rec.why)}</div>
    </div>
  </div>`;
}
// Today's Hand — 5 started skills drawn from deterministic daily shuffle
function renderTodaysHand(){
  const started=(S.lifeSkills||[]).filter(s=>!s.group&&s.currentLevel>0&&s.levels&&s.levels.length);
  if(started.length<2) return '';
  const dateKey=new Date().toISOString().slice(0,10);
  const seed=hashStr(dateKey+"hand");
  const hand=seededShuffle(started,seed).slice(0,5);
  const cardHtml=hand.map(sk=>{
    const eff=typeof skEffectiveLevel==="function"?skEffectiveLevel(sk):sk.currentLevel;
    const max=(sk.levels||[]).length||1;
    const pct=Math.round(eff/max*100);
    const col=typeof skLeafColor==="function"?skLeafColor(eff,max):"#6e7459";
    const dl=typeof skDaysLeft==="function"?skDaysLeft(sk):null;
    const fadeTag=dl!==null&&dl<=3?`<span class="th-urgent">⚠${dl}d</span>`:'';
    const suit=(typeof SK_SUIT!=="undefined"&&SK_SUIT[sk.cat])||{sym:"★",col:"#555"};
    return `<div class="th-card" style="--th-col:${col};--th-suit-col:${suit.col}">
      <div class="th-suit">${suit.sym}</div>
      <div class="th-name">${esc(sk.name)}</div>
      <div class="th-level">L${eff}/${max}</div>
      <div class="th-bar"><div class="th-bar-fill" style="width:${pct}%;background:${col}"></div></div>
      ${fadeTag}
      <button class="td-go-sm" data-skpractice="${esc(sk.id)}" title="Mark practiced">✓</button>
    </div>`;
  }).join('');
  return `<div class="td-card fn-card"><div class="td-h fn-h">Today's Hand <span style="font-size:11px;color:var(--muted)">daily draw</span></div>${smartFocusCalloutHtml()}<div class="th-hand">${cardHtml}</div></div>`;
}
// Quick PT Log — lightweight workout entry without opening Log tab
function renderQuickLog(){
  return `<div class="td-card fn-card" id="quickLogCard">
    <div class="td-h fn-h">Quick PT Log</div>
    <div class="ql-form">
      <select class="ql-type" id="qlType">
        <option value="">Type…</option>
        <option>Run</option><option>Ruck</option><option>Lift</option><option>Swim</option><option>PT</option><option>Other</option>
      </select>
      <input class="ql-dur" id="qlDur" type="number" min="1" max="360" placeholder="min" style="width:56px">
      <input class="ql-note" id="qlNote" placeholder="Notes / details" style="flex:1">
      <button class="ql-save" id="qlSave">+ Log</button>
    </div>
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
      const daysSince=Math.abs(daysLeft);
      commissionHtml=daysSince===0
        ?`<div class="commission-bar radiant">⚔️ ${firstName} — today is the day. You made it.</div>`
        :`<div class="commission-bar radiant">⭐ Commissioned ${cd} · ${daysSince} day${daysSince!==1?'s':''} of commissioned service. Well done, ${firstName}.</div>`;
    }
  }

  // ── Orders counts (used by both the inline card and streak protection) — kind:"order"
  // only, since habit-kind items never set .done (their "done today" signal is
  // lastDone===today instead) and shouldn't count toward the orders-remaining tally.
  const ordersLeft=(S.dailies||[]).filter(d=>d.kind==="order"&&!d.done).length;
  const ordersTotal=(S.dailies||[]).filter(d=>d.kind==="order").length;

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

  // ── Upcoming — unified cross-tab "what's coming up" timeline
  const upcomingHtml=renderUpcomingTimeline();

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
    if(S.aft.length>=2){
      const prev=S.aft[S.aft.length-2];
      const deltas=[
        {name:"DL",delta:(lastAft.scores&&lastAft.scores.dl||0)-(prev.scores&&prev.scores.dl||0)},
        {name:"HRP",delta:(lastAft.scores&&lastAft.scores.hrp||0)-(prev.scores&&prev.scores.hrp||0)},
        {name:"SDC",delta:(lastAft.scores&&lastAft.scores.sdc||0)-(prev.scores&&prev.scores.sdc||0)},
        {name:"Plank",delta:(lastAft.scores&&lastAft.scores.plank||0)-(prev.scores&&prev.scores.plank||0)},
        {name:"Run",delta:(lastAft.scores&&lastAft.scores.run||0)-(prev.scores&&prev.scores.run||0)},
      ].filter(d=>d.delta<0).map(d=>`${d.name} ${d.delta}`).join(" · ");
      if(deltas) notes.push(`<div class="fn-row"><span class="fn-dot">📉</span><span>Last AFT: ${deltas}</span><button class="td-go-sm" data-gototab="aft">→</button></div>`);
    }
    // F5: AFT linear trend projection (need ≥3 entries)
    if(S.aft.length>=3){
      const aftSorted=S.aft.slice().sort((a,b)=>a.date<b.date?-1:1);
      const n=aftSorted.length;
      const xs=aftSorted.map((_,i)=>i);
      const ys=aftSorted.map(a=>a.total);
      const sx=xs.reduce((s,v)=>s+v,0), sy=ys.reduce((s,v)=>s+v,0);
      const sxy=xs.reduce((s,v,i)=>s+v*ys[i],0), sx2=xs.reduce((s,v)=>s+v*v,0);
      const denom=n*sx2-sx*sx;
      if(denom){
        const slope=(n*sxy-sx*sy)/denom;
        const intercept=(sy-slope*sx)/n;
        const nextPts=Math.round(intercept+slope*n);
        const trend=slope>0?`▲ +${slope.toFixed(1)} pts/test`:(slope<0?`▼ ${slope.toFixed(1)} pts/test`:"→ flat");
        const clr=slope>0?"var(--jade)":(slope<-2?"var(--ember)":"var(--ink-dim)");
        notes.push(`<div class="fn-row"><span class="fn-dot">📈</span><span>AFT trend: <span style="color:${clr}">${trend}</span> → projected ${nextPts} pts next test</span><button class="td-go-sm" data-gototab="aft">→</button></div>`);
      }
    }
  }
  if(S.profile&&S.profile.gpa) notes.push(`<div class="fn-row"><span class="fn-dot">📊</span><span>GPA ${S.profile.gpa} · ${esc(S.branchGoal||"Branch TBD")}</span></div>`);
  if(S.profile&&S.profile.bloodType){
    const lastDon=(S.donations||[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    if(lastDon){const nxt=new Date(lastDon.date);nxt.setDate(nxt.getDate()+56);const d=Math.ceil((nxt-Date.now())/864e5);if(d<=7)notes.push(`<div class="fn-row"><span class="fn-dot">🩸</span><span>Blood donation: ${d<=0?"eligible now":`eligible in ${d} day${d!==1?"s":""}`}</span></div>`);}
  }
  // Overdue oaths — deliberately NOT duplicated in the Upcoming card (forward-looking
  // only, by design) or Warrior's Focus (surfaces only the single most urgent one).
  const overdueCount=(S.quests||[]).filter(q=>!q.done&&q.due&&q.due<localYMD()).length;
  if(overdueCount>1) notes.push(`<div class="fn-row"><span class="fn-dot">⚠️</span><span>${overdueCount} overdue oaths</span><button class="td-go-sm" data-gototab="quests">→</button></div>`);
  // fading-soon digest: show all skills within 20% of their fade window, not just the worst one
  const fadingSoon=(S.lifeSkills||[]).filter(s=>!s.group&&s.currentLevel>0)
    .map(s=>({s,days:typeof skDaysLeft==="function"?skDaysLeft(s):null}))
    .filter(x=>x.days!==null&&x.days<=Math.ceil((x.s.fadeDays||30)*0.2))
    .sort((a,b)=>a.days-b.days);
  if(fadingSoon.length>1) notes.push(
    `<div class="fn-row"><span class="fn-dot">🍂</span><span>${fadingSoon.length} skills fading: ${fadingSoon.slice(0,4).map(x=>esc(x.s.name)).join(' · ')}</span><button class="td-go-sm" data-gototab="skills">→</button></div>`
  );
  // baseline test due nudge: monthly max-effort test drives adaptive targets
  const lastBL=(S.baselines||[]).sort((a,b)=>b.ts-a.ts)[0];
  const daysSinceBL=lastBL?Math.round((Date.now()-lastBL.ts)/864e5):999;
  if(daysSinceBL>28) notes.push(
    `<div class="fn-row"><span class="fn-dot">📐</span><span>Baseline test ${lastBL?'last done '+daysSinceBL+'d ago':'not yet done'} — monthly max-effort test due</span><button class="td-go-sm" data-gototab="log">→</button></div>`
  );
  // weekly workout load: sessions logged, run distance, total reps — from S.workouts[]
  {
    const _now=new Date();
    const _dFromMon=(_now.getDay()+6)%7;
    const _monStart=new Date(_now); _monStart.setDate(_now.getDate()-_dFromMon); _monStart.setHours(0,0,0,0);
    const _weekW=(S.workouts||[]).filter(w=>w.ts?w.ts>=_monStart.getTime():(()=>{const d=new Date(w.date);return !isNaN(d)&&d>=_monStart;})());
    if(_weekW.length){
      let _reps=0, _dist=0;
      _weekW.forEach(w=>(w.exercises||[]).forEach(ex=>(ex.sets||[]).forEach(st=>{
        if(ex.t==="reps"||ex.type==="reps") _reps+=(parseInt(st.reps)||0);
        if(ex.t==="dist"||ex.type==="dist") _dist+=(parseFloat(st.dist)||0);
      })));
      const _parts=[`${_weekW.length} session${_weekW.length!==1?"s":""}`];
      if(_dist>0.01) _parts.push(`${_dist.toFixed(1)} mi`);
      if(_reps>0) _parts.push(`${_reps} reps`);
      notes.push(`<div class="fn-row"><span class="fn-dot">🏋️</span><span><b>This week:</b> ${_parts.join(' · ')} logged</span><button class="td-go-sm" data-gototab="log">Log →</button></div>`);
    }
  }
  // Skill needing attention — was its own 3rd independent urgency algorithm
  // (a ≤3-day threshold plus day-index cycling through all eligible skills),
  // disagreeing with Warrior's Focus and the Dawn callout above (found by the
  // v200-session audit — 5 competing "what needs attention" pickers). Now
  // reads computeSmartFocus()'s single real urgency+opportunity ranking
  // instead. Silent when nothing has real urgency or peak/effective gap —
  // Today's Hand already covers "something to practice" for the no-urgency
  // case, so a rotating filler pick here would just be a second, weaker copy
  // of that job. Suppressed if Warrior's Focus (above) is already showing
  // this exact skill, so the two don't literally repeat the same line twice.
  const smartDay=typeof computeSmartFocus==="function"?computeSmartFocus():null;
  if(smartDay && !(focus&&focus.skId===smartDay.sk.id)){
    const _eff=typeof skEffectiveLevel==="function"?skEffectiveLevel(smartDay.sk):smartDay.sk.currentLevel;
    notes.push(`<div class="fn-row"><span class="fn-dot">🎯</span><span><b>Needs attention:</b> ${esc(smartDay.sk.name)} — L${_eff} — ${esc(smartDay.why)}</span><button class="td-go-sm" data-skpractice="${esc(smartDay.sk.id)}" title="Mark as practiced — resets fade timer">✓ practiced</button><button class="td-go-sm" data-gototab="skills">→</button></div>`);
  }
  // Synthesis-ready alert — any set with all members mastered but card not yet unlocked
  if(typeof SEED_SKILLS!=="undefined" && typeof skSetCanCombine==="function"){
    const synthReady=[];
    const seenSets=new Set();
    const _synthLiveIdx=typeof skLiveIndex==="function"?skLiveIndex():null;
    SEED_SKILLS.forEach(target=>{
      if(!target.synthesizedFrom||seenSets.has(target.name)) return;
      seenSets.add(target.name);
      const live=_synthLiveIdx?_synthLiveIdx.get(target.name+"|"+target.cat):(S.lifeSkills||[]).find(s=>s.name===target.name&&s.cat===target.cat);
      if(live&&live.synthesisUnlocked) return;
      if(skSetCanCombine(target.synthesizedFrom)) synthReady.push(target.name);
    });
    if(synthReady.length){
      notes.push(`<div class="fn-row sk-synth-ready-row"><span class="fn-dot">⚡</span><span><b>Synthesis ready:</b> ${synthReady.slice(0,2).map(n=>esc(n)).join(', ')}${synthReady.length>2?` +${synthReady.length-2} more`:''} — open Skills to combine.</span><button class="td-go-sm" data-gototab="skills">Skills →</button></div>`);
    }
  }
  const notesHtml=notes.length?`<div class="td-card fn-card"><div class="td-h fn-h">Field Notes</div>${notes.join("")}</div>`:"";


  // ── Academic snapshot (only if GPA data exists)
  let academicHtml="";
  {
    const gh=(S.gpaHistory||[]).slice().sort((a,b)=>b.term>a.term?1:-1);
    const cum=S.profile&&S.profile.gpa;
    if(cum||gh.length){
      const last=gh.length?gh[0]:null;
      const dl=last&&last.standing&&/dean/i.test(last.standing);
      let stats="";
      if(cum) stats+=`<div class="acad-stat"><span>Cumulative GPA</span><b>${cum}</b></div>`;
      if(last) stats+=`<div class="acad-stat"><span>${esc(last.term||"Latest")}</span><b>${last.gpa}${dl?` <span class="dl-badge">Dean's List</span>`:""}</b></div>`;
      if(stats) academicHtml=`<div class="td-card fn-card"><div class="td-h fn-h">Academic Standing</div><div class="acad-strip">${stats}</div></div>`;
    }
  }

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

  // ── OML readiness snapshot — raw inputs for Order of Merit List (GPA, AFT, MS eval)
  let omlHtml="";
  {
    const cum=S.profile&&S.profile.gpa?parseFloat(S.profile.gpa):null;
    const bestAft=(S.aft||[]).reduce((best,a)=>(!best||a.total>best.total)?a:best, null);
    const campRes=(S.rotcRecord&&S.rotcRecord.campResults&&S.rotcRecord.campResults.length)?S.rotcRecord.campResults[0]:null;
    if(cum||bestAft||campRes){
      const rows=[];
      if(cum) rows.push(`<div class="oml-row"><span class="oml-label">Cumulative GPA</span><span class="oml-val">${cum.toFixed(2)}</span></div>`);
      if(bestAft) rows.push(`<div class="oml-row"><span class="oml-label">Best AFT total</span><span class="oml-val">${bestAft.total} pts <span class="oml-sub">(${bestAft.date})</span></span></div>`);
      if(campRes) rows.push(`<div class="oml-row"><span class="oml-label">MS Eval</span><span class="oml-val">${esc(campRes.result||campRes.name||"Recorded")}</span></div>`);
      omlHtml=`<div class="td-card fn-card oml-panel"><div class="td-h fn-h">OML Inputs <span class="oml-note">raw data — not a score</span></div>${rows.join("")}<button class="td-go-sm" data-gototab="profile">Profile →</button></div>`;
    }
  }

  // ── Counseling follow-up alert — OVERDUE only; upcoming ones now live in the
  // Upcoming card above (forward-looking, today included). This alert exists
  // specifically for the case Upcoming deliberately excludes: already past due.
  let cnAlertHtml="";
  {
    const overdueFU=(S.counseling||[]).filter(c=>{
      if(!c.followUp||!c.followUp.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
      return c.followUp<localYMD();
    }).sort((a,b)=>a.followUp<b.followUp?-1:1);
    if(overdueFU.length){
      const rows=overdueFU.map(c=>{
        const diff=Math.abs(Math.ceil((new Date(c.followUp+"T12:00:00")-Date.now())/864e5));
        return `<div class="cn-alert-row"><span class="cn-alert-date">${c.followUp} (${diff}d overdue)</span> — ${esc((c.summary||"").slice(0,60))}</div>`;
      }).join("");
      cnAlertHtml=`<div class="cn-alert"><div class="td-h fn-h">⚠️ Counseling Follow-Up Overdue</div>${rows}<button class="td-go-sm" data-gototab="records">Records →</button></div>`;
    }
  }

  // ── Qualification expiry alert — EXPIRED only; upcoming expiries now live in
  // the Upcoming card above, same reasoning as the counseling alert.
  let qualAlertHtml="";
  {
    const today2=localYMD();
    const pastExp=(S.qualifications||[]).filter(q=>q.expires&&q.expires<=today2);
    if(pastExp.length){
      const rows=pastExp.map(q=>{
        const cat=typeof QUAL_CATALOG!=="undefined"&&QUAL_CATALOG[q.key]?QUAL_CATALOG[q.key]:null;
        const name=q.key==="custom"?(q.label||q.key):cat?cat.fullName:q.key;
        return `<div class="qual-alert-row overdue">⚠️ <b>${esc(name)}</b> expired ${q.expires}</div>`;
      }).join("");
      qualAlertHtml=`<div class="td-card fn-card qual-alert">${rows}<button class="td-go-sm" data-gototab="awards">Wall →</button></div>`;
    }
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
        <div class="rm-title">⚡ Day ${dayNum} of forge-back</div>
        <div class="rm-body">${left===1?"One perfect day restores your momentum.":`${left} perfect days to restore your momentum.`} Today: complete all orders.</div>
        <div class="rm-pips">${pips}</div>
      </div>`;
    }
  }

  // ── Path health snapshot — one row per active path, jade/ember based on decay ratio
  let pathSummaryHtml="";
  {
    const pathRows=SK_CAT_ORDER.map(cat=>{
      const skills=(S.lifeSkills||[]).filter(s=>s.cat===cat&&!s.group&&s.currentLevel>0);
      if(!skills.length) return '';
      const atRisk=skills.filter(s=>skFadeState(s)!=='current').length;
      const avgLvl=(skills.reduce((a,s)=>a+skEffectiveLevel(s),0)/skills.length).toFixed(1);
      const color=atRisk>skills.length/2?'var(--ember)':'var(--jade)';
      const pm=PATH_META[cat]; if(!pm) return '';
      return `<div class="path-summary-row"><span class="path-summary-icon">${pm.icon}</span><span class="path-summary-name">${esc(pm.name)}</span><span class="path-summary-stat" style="color:${color}">${skills.length} active · avg L${avgLvl}${atRisk?' · ⚠ '+atRisk:''}</span></div>`;
    }).filter(Boolean).join('');
    if(pathRows) pathSummaryHtml=`<div class="td-card fn-card path-summary-strip"><div class="td-h fn-h">Path Health</div>${pathRows}</div>`;
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
  const briefBtnHtml=`<div class="brief-row"><button class="brief-btn" data-copybriefbtn="1">📋 Copy field brief</button></div>`;

  // ── Today's Hand (daily 5-card draw)
  const todaysHandHtml=typeof renderTodaysHand==="function"?renderTodaysHand():'';
  // ── Quick PT Log
  const quickLogHtml=typeof renderQuickLog==="function"?renderQuickLog():'';
  // ── Contextual AAR prompt (broken streak / below-standard AFT)
  const aarNudgeHtmlVal=aarNudgeHtml();
  // ── Assemble — creed always first, then guided flow
  const flow=[startHtml, todaysHandHtml, sessHtml, weekCardHtml, ordersHtml, recoveryHtml, aarNudgeHtmlVal, discHtml, bossHtml, streakHtml, commissionHtml, pathSummaryHtml, focusHtml, adaptHtml, upcomingHtml, neglectHtml, pathPips, notesHtml, academicHtml, omlHtml, cnAlertHtml, qualAlertHtml, fmHtml, quickLogHtml, briefBtnHtml, installHtml, notifPromptHtml].filter(Boolean).join("");

  el.innerHTML=`<div class="td-creed">🌲 <span>${creed}</span></div>`+(
    flow
      ? `<div class="td-flow">${flow}</div>`
      : `<div class="aw-empty"><span class="big">🌱</span>The ground is bare. Swear your oaths, plant your daily orders — and this becomes the soil your tree grows from.</div>`
  );
  renderDayLog();
}

function renderDayLog(){
  const el=document.getElementById("dayLogWrap"); if(!el) return;
  const today=new Date().toISOString().slice(0,10);
  const log=S.dayLog||[];
  const todayEntry=log.find(e=>e.date===today)||{date:today,trained:'',wins:'',notes:''};
  const recent=log.filter(e=>e.date!==today).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  el.innerHTML=`<div class="dl-form">
    <input class="dl-input" id="dlTrained" placeholder="What did you train today?" value="${esc(todayEntry.trained||'')}">
    <input class="dl-input" id="dlWins" placeholder="Win of the day" value="${esc(todayEntry.wins||'')}">
    <input class="dl-input" id="dlNotes" placeholder="Notes" value="${esc(todayEntry.notes||'')}">
    <button class="dl-save-btn" id="dlSave">Save</button>
  </div>
  ${recent.map(e=>`<div class="dl-past-row">
    <span class="dl-past-date">${e.date.slice(5)}</span>
    <span class="dl-past-text">${esc(e.trained||'—')}</span>
    ${e.wins?`<span class="dl-past-win">✓ ${esc(e.wins)}</span>`:''}
  </div>`).join('')}`;
  document.getElementById("dlSave").onclick=()=>{
    const entry={date:today,
      trained:(document.getElementById("dlTrained").value||'').trim(),
      wins:(document.getElementById("dlWins").value||'').trim(),
      notes:(document.getElementById("dlNotes").value||'').trim()};
    S.dayLog=(S.dayLog||[]).filter(e=>e.date!==today);
    if(entry.trained||entry.wins||entry.notes) S.dayLog.push(entry);
    save(); toast("Day logged");
  };
  // Quick PT log save handler
  const qlSave=document.getElementById("qlSave");
  if(qlSave){
    qlSave.onclick=()=>{
      const type=(document.getElementById("qlType")||{}).value||"";
      const dur=parseInt((document.getElementById("qlDur")||{}).value)||0;
      const note=((document.getElementById("qlNote")||{}).value||"").trim();
      if(!type&&!dur&&!note){ toast("Add at least a type or duration"); return; }
      if(!S.workouts) S.workouts=[];
      S.workouts.push({id:id(), date:today, session:type||"PT", durationMin:dur||null, notes:note, ts:Date.now()});
      save();
      const qlType=document.getElementById("qlType"); if(qlType) qlType.value="";
      const qlDur=document.getElementById("qlDur"); if(qlDur) qlDur.value="";
      const qlNote=document.getElementById("qlNote"); if(qlNote) qlNote.value="";
      toast(`Logged: ${type||"PT"}${dur?" "+dur+"min":""}`);
    };
  }
}

function makeStudyPlan(title,testDate,topics){
  const today=new Date(); today.setHours(0,0,0,0);
  // testDate is a bare "YYYY-MM-DD" from <input type=date> — parsed as UTC
  // midnight by the Date constructor, not local midnight, which for anyone
  // west of UTC (all of the Americas) silently shifts it back a day once
  // .setHours(0,0,0,0) floors that already-shifted instant to LOCAL
  // midnight. Anchoring to local noon first (same fix already used for
  // quest snoozing in events.js) avoids the UTC/local mismatch entirely.
  const test=new Date(testDate+"T12:00:00"); test.setHours(0,0,0,0);
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
