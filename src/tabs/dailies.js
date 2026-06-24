// ===== Habits (daily quests, per-habit streaks, skill feed, grace day) =====
const HABIT_STARTERS=[
  {name:"Sleep 7+ hours", skill:null},
  {name:"Drink water (hydrate)", skill:null},
  {name:"Daily mobility / stretch", skill:"Flexibility & mobility"},
  {name:"Read 20 minutes", skill:"Study & retention"},
  {name:"Spaced-repetition review", skill:"Study & retention"},
  {name:"Journal / reflect", skill:null},
  {name:"Meditate / box-breathing", skill:null},
  {name:"No phone first hour", skill:null},
  {name:"Practice a skill", skill:null},
  {name:"Balance practice", skill:"Balance training"},
];
// local YYYY-MM-DD (NOT UTC — toISOString shifts the day for users behind UTC, which
// corrupted habit streaks and study dates in the evening for e.g. Eastern-time users)
function localYMD(d){ d=d||new Date(); const z=n=>String(n).padStart(2,"0"); return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); }
function todayStr(){ return localYMD(); }
function dayDiff(aStr,bStr){ return Math.round((new Date(bStr)-new Date(aStr))/864e5); }
function habitDoneToday(h){ return h.lastDone===todayStr(); }
function habitDo(hid){
  const h=S.habits.find(x=>x.id===hid); if(!h||habitDoneToday(h)) return;
  const today=todayStr();
  if(h.lastDone){
    const gap=dayDiff(h.lastDone, today);
    if(gap===1){ h.streak=(h.streak||0)+1; }                 // consecutive
    else if(gap===2 && !h.graceUsed){ h.streak=(h.streak||0)+1; h.graceUsed=true; } // one miss, grace covers it
    else { h.streak=1; h.graceUsed=false; }                  // streak broke
  } else { h.streak=1; h.graceUsed=false; }
  h.lastDone=today;
  if(h.streak>(h.bestStreak||0)) h.bestStreak=h.streak;
  h.history=h.history||[]; h.history.push(today); if(h.history.length>400) h.history=h.history.slice(-400);
  // feed linked skill: refresh its fade timer (practiced today)
  if(h.linkedSkill){
    const sk=S.lifeSkills.find(s=>s.name===h.linkedSkill);
    if(sk && sk.currentLevel>0){ sk.lastQuestTs=Date.now(); }
  }
  // light global momentum (habits count toward the day's effort)
  S.gold=(S.gold||0)+3;
  save(); render();
  toast(`✅ ${esc(h.name)} — ${h.streak} day streak${h.graceUsed&&dayDiff(h.lastDone,today)===0?'':''}`);
}
function habitReset(){ /* streaks are computed lazily via gap on next complete; nothing scheduled needed */ }
// effective streak display: if more than 1 day missed and not done today, streak is stale → show at risk
function habitStreakState(h){
  if(!h.lastDone) return {streak:0, state:"new"};
  const gap=dayDiff(h.lastDone, todayStr());
  if(gap===0) return {streak:h.streak, state:"done"};
  if(gap===1) return {streak:h.streak, state:"due"};       // due today, streak intact if done now
  if(gap===2 && !h.graceUsed) return {streak:h.streak, state:"grace"}; // grace available
  return {streak:h.streak, state:"broken"};                // will reset
}
function habitHeatMap(h){
  if(!(h.history||[]).length) return "";
  const doneSet=new Set(h.history||[]);
  const squares=[];
  for(let i=59;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const ds=localYMD(d);
    squares.push(`<div class="heat-sq ${doneSet.has(ds)?'done':'miss'}" title="${ds}"></div>`);
  }
  return `<div class="habit-heat-row">${squares.join('')}</div>`;
}
function renderHabits(){
  const wrap=document.getElementById("habitQuests"); if(!wrap) return;
  // populate skill dropdown + starters (once per render is fine)
  const sel=document.getElementById("hbSkill");
  if(sel){ const cur=sel.value; sel.innerHTML='<option value="">— none —</option>'+S.lifeSkills.filter(s=>!s.group).map(s=>`<option value="${esc(s.name)}">${esc(s.name)}</option>`).join(""); sel.value=cur; }
  const starters=document.getElementById("hbStarters");
  if(starters){ starters.innerHTML=HABIT_STARTERS.filter(st=>!S.habits.some(h=>h.name===st.name)).map(st=>`<button class="hb-starter-btn" data-hbstart="${esc(st.name)}">+ ${esc(st.name)}</button>`).join("")||'<span style="color:var(--ink-faint);font-size:12px">All starters added.</span>'; }
  if(!S.habits.length){ wrap.innerHTML=`<div class="aw-empty"><span class="big">📋</span>No habits yet. Add one below to start building a daily routine.</div>`; return; }
  // count done today for the hint
  const doneCount=S.habits.filter(habitDoneToday).length;
  const hint=document.getElementById("habitStreakHint"); if(hint) hint.textContent=`${doneCount}/${S.habits.length} done today`;
  wrap.innerHTML=S.habits.map(h=>{
    const st=habitStreakState(h);
    const done=st.state==="done";
    const graceIcon=(st.state==="grace"&&!h.graceUsed)?' ⏰':(h.graceUsed&&st.state!=="done"?' ⚠️':'');
    const streakBadge = st.streak>0 ? `<span class="hb-streak ${st.state}">🔥 ${st.streak}${graceIcon}</span>` : "";
    let note="";
    if(st.state==="grace") note=`<div class="hb-note warn">Missed yesterday — complete today to use your grace day and keep the streak.</div>`;
    else if(st.state==="broken" && h.streak>0) note=`<div class="hb-note warn">Streak will reset — that's okay, just start again today.</div>`;
    else if(h.linkedSkill) note=`<div class="hb-note">Feeds: ${esc(h.linkedSkill)}</div>`;
    const best=h.bestStreak||0;
    const cur=st.streak||0;
    const bestHtml=best>0?`<div class="hb-best">Best: ${best} day${best!==1?'s':''} ${cur>=best&&cur>0?' ⭐':''}</div>`:'';
    const view=_hbView[h.id]||'strip';
    const calView=view==='month'?habitMonthGrid(h):habitHeatMap(h);
    const toggleBtn=(h.history&&h.history.length)?`<button class="hb-view-toggle ${view==='month'?'on':''}" data-hbview="${h.id}">${view==='month'?'60d':'Cal'}</button>`:'';
    return `<div class="hb-card ${done?'done':''}">
      <div class="hb-top-row">
        <button class="hb-check ${done?'on':''}" data-hbdo="${h.id}" ${done?'disabled':''}>${done?'✓':''}</button>
        <div class="hb-body"><div class="hb-name">${esc(h.name)}</div>${note}</div>
        ${streakBadge}
        ${toggleBtn}
        <button class="hb-del" data-hbdel="${h.id}">✕</button>
      </div>
      ${calView}
      ${bestHtml}
    </div>`;
  }).join("");
}
// per-habit UI view: "strip" (60-day heat map) or "month" (current month grid)
const _hbView={};
function habitMonthGrid(h){
  const doneSet=new Set(h.history||[]);
  const now=new Date();
  const year=now.getFullYear(), month=now.getMonth();
  const firstDay=new Date(year,month,1);
  const daysInMonth=new Date(year,month+1,0).getDate();
  // Monday-first: 0=Mon…6=Sun; getDay returns 0=Sun
  const startDow=(firstDay.getDay()+6)%7;
  const todayStr2=localYMD();
  const DOW=['M','T','W','T','F','S','S'];
  const header=DOW.map(d=>`<div class="hb-month-dow">${d}</div>`).join('');
  const cells=[];
  for(let i=0;i<startDow;i++) cells.push('<div class="hb-month-cell hm-future"></div>');
  for(let d=1;d<=daysInMonth;d++){
    const ds=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const isFuture=ds>todayStr2;
    const cls=isFuture?'hm-future':doneSet.has(ds)?'hm-done':'hm-miss';
    cells.push(`<div class="hb-month-cell ${cls}" title="${ds}"></div>`);
  }
  return `<div class="hb-month-header">${header}</div><div class="hb-month-grid">${cells.join('')}</div>`;
}

const _hbAdd=document.getElementById("hbAdd");
if(_hbAdd) _hbAdd.onclick=()=>{
  const name=document.getElementById("hbName").value.trim(); if(!name){toast("Name the habit");return;}
  const linkedSkill=document.getElementById("hbSkill").value||null;
  S.habits.push({id:id(),name,linkedSkill,streak:0,bestStreak:0,lastDone:null,graceUsed:false,history:[]});
  document.getElementById("hbName").value="";
  save(); render();
  toast("📋 Habit added");
};

