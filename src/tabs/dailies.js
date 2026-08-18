// ===== Daily Tasks — unified Habits + Daily Orders (merged in v168) =====
// Both used to be separate lists with separate streak logic; they're now one array
// (S.dailies) with a `kind:"order"|"habit"` discriminator. Every item gets its own
// individual streak + one-time grace day (a feature that only Habits had before, and
// which completes the `d.best` field Daily Orders always displayed but never actually
// updated). Orders still grant Path XP/merit and count toward the day's overall
// readiness/perfect-day streak; Habits still grant a flat reward and can feed a
// linked skill's fade timer, deliberately kept off the Path-XP economy — that
// distinction is preserved from the pre-merge design, just presented as one list now.
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
// LOAD-ORDER WARNING: this file is #16 of ~27 in build.py's JS_FILES, but
// training.js (#2) and other early-loading files call localYMD/dayDiff from
// their own top-level code. That only works because these are hoisted
// `function` declarations — the whole app is one concatenated <script>, so
// hoisting reaches across every file regardless of order. If these are ever
// rewritten as `const x = (...) => ...`, every earlier-loading caller breaks
// with a TDZ ReferenceError at runtime — `npm run check` (parse-only) would
// NOT catch it, only `npm run regress`'s real page load would, and only
// incidentally. Keep these as function declarations, or move them to an
// earlier-loading file (state.js/constants.js) if converting.
function localYMD(d){ d=d||new Date(); const z=n=>String(n).padStart(2,"0"); return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate()); }
function todayStr(){ return localYMD(); }
function dayDiff(aStr,bStr){ return Math.round((new Date(bStr)-new Date(aStr))/864e5); }
// Individual per-item streak/grace bookkeeping — same algorithm for every daily task
// now, regardless of kind. Mutates d in place; caller handles the kind-specific reward.
function dailyTaskMarkDone(d){
  const today=todayStr();
  if(d.lastDone){
    const gap=dayDiff(d.lastDone, today);
    if(gap===1){ d.streak=(d.streak||0)+1; }                 // consecutive
    else if(gap===2 && !d.graceUsed){ d.streak=(d.streak||0)+1; d.graceUsed=true; } // one miss, grace covers it
    else { d.streak=1; d.graceUsed=false; }                  // streak broke
  } else { d.streak=1; d.graceUsed=false; }
  d.lastDone=today;
  if(d.streak>(d.best||0)) d.best=d.streak;
  d.history=d.history||[]; d.history.push(today); if(d.history.length>400) d.history=d.history.slice(-400);
}
// effective streak display: if more than 1 day missed and not done today, streak is stale → show at risk
function dailyTaskStreakState(h){
  if(!h.lastDone) return {streak:0, state:"new"};
  const gap=dayDiff(h.lastDone, todayStr());
  if(gap===0) return {streak:h.streak, state:"done"};
  if(gap===1) return {streak:h.streak, state:"due"};       // due today, streak intact if done now
  if(gap===2 && !h.graceUsed) return {streak:h.streak, state:"grace"}; // grace available
  return {streak:h.streak, state:"broken"};                // will reset
}
function dailyTaskHeatMap(h){
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
// per-task UI view: "strip" (60-day heat map) or "month" (current month grid)
const _hbView={};
function dailyTaskMonthGrid(h){
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

function renderDailyTasks(){
  const el=document.getElementById("dtList"); if(!el) return;
  // populate skill dropdown + starters (once per render is fine)
  const sel=document.getElementById("dtSkill");
  if(sel){ const cur=sel.value; sel.innerHTML='<option value="">— none —</option>'+S.lifeSkills.filter(s=>!s.group).map(s=>`<option value="${esc(s.name)}">${esc(s.name)}</option>`).join(""); sel.value=cur; }
  const starters=document.getElementById("hbStarters");
  if(starters){ starters.innerHTML=HABIT_STARTERS.filter(st=>!S.dailies.some(d=>d.name===st.name)).map(st=>`<button class="hb-starter-btn" data-hbstart="${esc(st.name)}">+ ${esc(st.name)}</button>`).join("")||'<span style="color:var(--ink-faint);font-size:12px">All starters added.</span>'; }
  if(!S.dailies.length){ el.innerHTML=`<div class="aw-empty"><span class="big">📋</span>No daily tasks yet. Add an Order (Path XP + readiness) or a Habit (streak + skill-feed) below.</div>`; return; }
  const activeLogDays=(S.streakLog||[]).filter(e=>e.pct>0).length;
  const isStale=d=>{
    if(d.paused) return false;
    if(!d.doneTs) return activeLogDays>=7;
    return (Date.now()-d.doneTs)/864e5>7;
  };
  el.innerHTML=S.dailies.map((d,i)=>{
    const isHabit=d.kind==="habit";
    const st=dailyTaskStreakState(d);
    const doneToday=isHabit?(d.lastDone===todayStr()):!!d.done;
    const graceIcon=(st.state==="grace"&&!d.graceUsed)?' ⏰':(d.graceUsed&&st.state!=="done"?' ⚠️':'');
    const streakBadge = st.streak>0 ? `<span class="hb-streak ${st.state}">🔥 ${st.streak}${graceIcon}</span>` : "";
    let note="";
    if(st.state==="grace") note=`<div class="hb-note warn">Missed yesterday — complete today to use your grace day and keep the streak.</div>`;
    else if(st.state==="broken" && (d.streak||0)>0) note=`<div class="hb-note warn">Streak will reset — that's okay, just start again today.</div>`;
    else if(isHabit&&d.linkedSkill) note=`<div class="hb-note">Feeds: ${esc(d.linkedSkill)}</div>`;
    const best=d.best||0;
    const cur=st.streak||0;
    const atPeak=cur>=best&&cur>0&&best>0;
    const bestHtml=best>0?`<div class="hb-best${atPeak?' at-peak':''}">Best: ${best} day${best!==1?'s':''} ${atPeak?' ⭐':''}</div>`:'';
    const view=_hbView[d.id]||'strip';
    const calView=(d.history&&d.history.length)?(view==='month'?dailyTaskMonthGrid(d):dailyTaskHeatMap(d)):'';
    const toggleBtn=(d.history&&d.history.length)?`<button class="hb-view-toggle ${view==='month'?'on':''}" data-hbview="${d.id}">${view==='month'?'60d':'Cal'}</button>`:'';
    const kindTag=isHabit?`<span class="tag habitt">Habit</span>`:diffTag('daily',d.diff);
    const meta=isHabit?kindTag:`${kindTag}${pathTag(d.path)}`;
    const pausedHtml=(!isHabit&&d.paused)?`<span class="order-paused">⏸ paused</span><button class="order-pause-btn" data-dpause="${d.id}" data-dpausestate="0" title="Resume">Resume</button>`:(!isHabit?`<button class="order-pause-btn" data-dpause="${d.id}" data-dpausestate="1" title="Pause">⏸</button>`:'');
    const upBtn=i>0?`<button class="daily-move-btn" data-moveup="${d.id}" title="Move up">▲</button>`:`<button class="daily-move-btn" style="visibility:hidden" aria-hidden="true">▲</button>`;
    const downBtn=i<S.dailies.length-1?`<button class="daily-move-btn" data-movedown="${d.id}" title="Move down">▼</button>`:`<button class="daily-move-btn" style="visibility:hidden" aria-hidden="true">▼</button>`;
    return `<div class="hb-card ${doneToday?'done':''}${d.paused?' paused':''}">
      <div class="hb-top-row">
        <div class="daily-move-col">${upBtn}${downBtn}</div>
        <button class="hb-check ${doneToday?'on':''}" data-dtdo="${d.id}" ${doneToday?'disabled':''}>${doneToday?'✓':''}</button>
        <div class="hb-body"><div class="hb-name">${esc(d.name)}</div>
          <div class="c-meta">${meta}${bestHtml?'':''}${isStale(d)?`<span class="order-stale" title="Not done in 7+ days — consider revising">⚠ stale</span>`:''}</div>
          ${note}
        </div>
        ${streakBadge}
        ${toggleBtn}
        ${pausedHtml}
        <button class="hb-del" data-dtdel="${d.id}">✕</button>
      </div>
      ${calView}
      ${bestHtml}
    </div>`;
  }).join("");
  if(typeof setupDailyCalToggle==="function") setupDailyCalToggle();
}

let _dailyCalVisible=false;
function renderDailyCal(){
  const el=document.getElementById("dailyCalWrap"); if(!el) return;
  const doneSet=new Set(S.dailyHistory||[]);
  const cells=[];
  for(let i=59;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const ds=localYMD(d);
    cells.push(`<div class="hm-day ${doneSet.has(ds)?'lv3':'lv0'}" title="${ds}"></div>`);
  }
  const doneCount=Array.from({length:60},(_,i)=>{const d=new Date();d.setDate(d.getDate()-59+i);return localYMD(d);}).filter(ds=>doneSet.has(ds)).length;
  el.innerHTML=`<div class="daily-cal-label">60-day perfect-day record · <b>${doneCount}/60</b> <span style="color:var(--ink-faint);font-size:10px">(green = all orders complete)</span></div><div class="daily-cal-grid">${cells.join('')}</div>`;
}
function setupDailyCalToggle(){
  const btn=document.getElementById("dailyCalToggle");
  const wrap=document.getElementById("dailyCalWrap");
  if(!btn||!wrap) return;
  btn.classList.toggle("active",_dailyCalVisible);
  wrap.style.display=_dailyCalVisible?"block":"none";
  if(_dailyCalVisible) renderDailyCal();
  btn.onclick=()=>{ _dailyCalVisible=!_dailyCalVisible; btn.classList.toggle("active",_dailyCalVisible); wrap.style.display=_dailyCalVisible?"block":"none"; if(_dailyCalVisible) renderDailyCal(); };
}

// ---- unified add form: Kind toggle switches which extra fields show ----
let _dtKind="order";
const _dtKindBtns=document.querySelectorAll("[data-dtkind]");
_dtKindBtns.forEach(btn=>{
  btn.onclick=()=>{
    _dtKind=btn.dataset.dtkind;
    _dtKindBtns.forEach(b=>b.classList.toggle("active",b===btn));
    const orderFields=document.getElementById("dtOrderFields");
    const habitFields=document.getElementById("dtHabitFields");
    if(orderFields) orderFields.style.display=_dtKind==="order"?"":"none";
    if(habitFields) habitFields.style.display=_dtKind==="habit"?"":"none";
  };
});
const _dtAdd=document.getElementById("dtAdd");
if(_dtAdd) _dtAdd.onclick=()=>{
  const name=document.getElementById("dtName").value.trim(); if(!name){toast("Name the task first");return;}
  if(_dtKind==="habit"){
    const linkedSkill=document.getElementById("dtSkill").value||null;
    S.dailies.push({id:id(),name,kind:"habit",linkedSkill,diff:"easy",path:null,done:false,streak:0,best:0,lastDone:null,graceUsed:false,history:[]});
    toast("📋 Habit added");
  } else {
    const diff=document.getElementById("dtDiff").value;
    const path=document.getElementById("dtPath").value;
    S.dailies.push({id:id(),name,kind:"order",diff,path,done:false,best:0,streak:0,lastDone:null,graceUsed:false,history:[]});
    toast("📋 Order added");
  }
  document.getElementById("dtName").value="";
  save(); render();
};
document.body.addEventListener("click",e=>{
  const sb=e.target.closest("[data-hbstart]");
  if(sb){
    const st=HABIT_STARTERS.find(s=>s.name===sb.dataset.hbstart); if(!st) return;
    S.dailies.push({id:id(),name:st.name,kind:"habit",linkedSkill:st.skill,diff:"easy",path:null,done:false,streak:0,best:0,lastDone:null,graceUsed:false,history:[]});
    save(); render();
    return;
  }
});
