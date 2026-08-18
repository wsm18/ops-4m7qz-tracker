// The Cyber-branch fact card only applies if that's actually the user's target —
// it used to render unconditionally regardless of S.branchGoal, so switching goals
// away from Cyber left stale, inapplicable branch facts on screen.
function renderBoardBranchCard(){
  const el=document.getElementById("boardBranchCard"); if(!el) return;
  const goal=(S.branchGoal||"").trim();
  const isCyber=!goal||/cyber/i.test(goal);
  if(isCyber){
    el.innerHTML=`<div class="adapt-card" style="border-color:var(--violet);background:linear-gradient(180deg,#1b1d28,#15171f)">
      <h3 style="color:var(--violet)">💻 Cyber Branch (17-series) — Your Target</h3>
      <div class="adapt-sub">From your branch orientation material. Verify specifics with your cadre & the latest DA PAM 600-3.</div>
      <div class="cy-fact"><b>Mission:</b> Plans, integrates, and executes cyberspace operations (CO) &amp; electromagnetic warfare (EW).</div>
      <div class="cy-fact"><b>CO missions:</b> Defensive (DCO), Offensive (OCO), and DODIN operations.</div>
      <div class="cy-fact"><b>AOCs:</b> 17A Cyber Warfare Officer · 17B Cyber Electromagnetic Warfare Officer · 17D Cyber Capabilities Development Officer.</div>
      <div class="cy-fact"><b>Lieutenant pipeline:</b> Cyber Basic Officer Leader Course (CyBOLC); must first qualify 17A.</div>
      <div class="cy-fact"><b>Requirements:</b> U.S. citizen (no dual citizenship), must obtain &amp; hold TS/SCI + favorable special background investigation; some positions require a CI polygraph.</div>
      <div class="cy-fact"><b>Proponent:</b> U.S. Army Cyber School, Fort Gordon (Cyber CoE), GA.</div>
      <div class="cy-fact" style="color:var(--ink-faint);border:none">Want to take the Cyber quiz? It's in the Quiz tab.</div>
    </div>`;
  } else {
    el.innerHTML=`<div class="adapt-card" style="border-color:var(--violet);background:linear-gradient(180deg,#1b1d28,#15171f)">
      <h3 style="color:var(--violet)">🎯 Branch Target: ${esc(goal)}</h3>
      <div class="adapt-sub">Set in Profile. No built-in branch fact card for this branch yet — check DA PAM 600-3 and your cadre for its mission, AOCs, and requirements.</div>
    </div>`;
  }
}
function boardTaskLi(t){
  const seed=t.seedKey?BOARD_TASK_SEEDS.find(s=>s.key===t.seedKey):null;
  const why=seed&&seed.why?`<div class="c-note">${esc(seed.why)}</div>`:'';
  return `<li class="card board-item ${t.done?'done':''}">
    <div class="check" data-bt="${t.id}">${t.done?'✓':''}</div>
    <div class="c-body"><div class="c-name">${esc(t.name)}</div>${why}${t.due?`<span class="tag" style="color:var(--ink-faint)">due ${esc(t.due)}</span>`:''}${t.done?'':`<span class="tag xp">+${VALUES.board.xp} XP · ${VALUES.board.g} pts</span>`}</div>
    <button class="del" data-dbt="${t.id}">✕</button>
  </li>`;
}
function renderBoard(){
  const listWrap=document.getElementById("boardList");
  if(!listWrap) return;
  renderBoardBranchCard();
  // Board/branch readiness used to be 3 disconnected screens sharing a
  // database (this checklist, Quiz's per-category readiness, Profile's
  // commissioning scorecard) — wiring the existing functions in here (not
  // reimplementing them) so board-prep season has one real readiness view.
  if(typeof renderBoardReadiness==="function") renderBoardReadiness("boardQuizReadiness");
  if(typeof renderCommReadiness==="function") renderCommReadiness("boardCommReadiness");
  document.getElementById("branchGoalHint").textContent="goal: "+(S.branchGoal||"Cyber");

  const stage=typeof careerStage==="function"?careerStage():"MS2";
  const stageHint=document.getElementById("boardStageHint");
  if(stageHint) stageHint.textContent="your stage: "+stage;

  const byStage={}; STAGE_ORDER.forEach(s=>byStage[s]=[]);
  const custom=[];
  S.boardTasks.forEach(t=>{ (t.stage&&byStage[t.stage])?byStage[t.stage].push(t):custom.push(t); });

  const done=S.boardTasks.filter(t=>t.done).length;
  document.getElementById("boardProg").textContent=done+"/"+S.boardTasks.length+" complete";

  const stageBlocks=STAGE_ORDER.map(s=>{
    const tasks=byStage[s], info=STAGE_INFO[s], isCur=(s===stage);
    const doneCt=tasks.filter(t=>t.done).length;
    const body=tasks.length
      ? `<ul class="list">${tasks.map(boardTaskLi).join("")}</ul>`
      : `<div class="sk-assess-empty">No tasks yet for this stage — tap ↑ Sync when you reach it.</div>`;
    return `<details class="wk" ${isCur?'open':''}>
      <summary><span class="wk-day">${esc(info.label)}</span> ${doneCt}/${tasks.length} complete</summary>
      <div class="wk-body">
        <p class="wk-target">${esc(info.blurb)}</p>
        ${body}
      </div>
    </details>`;
  }).join("");

  const customBlock=custom.length
    ? `<div class="sec-h" style="margin-top:14px"><h2>Your Tasks</h2><span class="hint">not tied to a career stage</span></div><ul class="list">${custom.map(boardTaskLi).join("")}</ul>`
    : "";

  listWrap.innerHTML=stageBlocks+customBlock;
}
// Additive-only: adds any current-stage default task the user doesn't
// already have and hasn't deliberately deleted before. Never removes or
// re-adds anything on its own — the explicit button click is the only
// trigger, mirroring Skills' own career-stage sync pattern (updateAllSkillTargets()).
function syncBoardTasksToStage(){
  const stage=typeof careerStage==="function"?careerStage():"MS2";
  const have=new Set(S.boardTasks.filter(t=>t.seedKey).map(t=>t.seedKey));
  const dismissed=new Set(S.boardDismissedSeeds||[]);
  const toAdd=BOARD_TASK_SEEDS.filter(s=>s.stage===stage && !have.has(s.key) && !dismissed.has(s.key));
  if(!toAdd.length){ toast(`All ${stage} default tasks already on your board`); return; }
  toAdd.forEach(s=>S.boardTasks.push({id:id(), seedKey:s.key, stage:s.stage, name:s.name, done:false, due:null}));
  save(); render();
  toast(`↑ ${toAdd.length} ${stage} task${toAdd.length!==1?'s':''} added`);
}
document.body.addEventListener("click",e=>{
  const t=e.target;
  if(t.dataset.bt){const task=S.boardTasks.find(x=>x.id===t.dataset.bt);if(task){const was=task.done;task.done=!task.done;if(!was&&task.done){grant(VALUES.board.xp,VALUES.board.g,"Board prep task done","academic");}else{save();render();}}return;}
  if(t.dataset.dbt){
    if(confirm("Delete this board task?")){
      const task=S.boardTasks.find(x=>x.id===t.dataset.dbt);
      if(task&&task.seedKey){
        S.boardDismissedSeeds=S.boardDismissedSeeds||[];
        if(!S.boardDismissedSeeds.includes(task.seedKey)) S.boardDismissedSeeds.push(task.seedKey);
      }
      S.boardTasks=S.boardTasks.filter(x=>x.id!==t.dataset.dbt);save();render();
    }
    return;
  }
});
const _btAdd=document.getElementById("btAdd");
if(_btAdd) _btAdd.onclick=()=>{
  const n=document.getElementById("btName").value.trim();if(!n)return;
  const due=(document.getElementById("btDue")||{}).value||null;
  S.boardTasks.push({id:id(),seedKey:null,stage:null,name:n,done:false,due});
  document.getElementById("btName").value="";
  const btDue=document.getElementById("btDue"); if(btDue) btDue.value="";
  save();render();
};

