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
function renderBoard(){
  const list=document.getElementById("boardList");
  if(!list) return;
  renderBoardBranchCard();
  document.getElementById("branchGoalHint").textContent="goal: "+(S.branchGoal||"Cyber");
  const done=S.boardTasks.filter(t=>t.done).length;
  document.getElementById("boardProg").textContent=done+"/"+S.boardTasks.length+" complete";
  list.innerHTML=S.boardTasks.map(t=>`<li class="card board-item ${t.done?'done':''}">
    <div class="check" data-bt="${t.id}">${t.done?'✓':''}</div>
    <div class="c-body"><div class="c-name">${esc(t.name)}</div>${t.done?'':`<span class="tag xp">+${VALUES.board.xp} XP · ${VALUES.board.g} pts</span>`}</div>
    <button class="del" data-dbt="${t.id}">✕</button>
  </li>`).join("");
}
document.body.addEventListener("click",e=>{
  const t=e.target;
  if(t.dataset.bt){const task=S.boardTasks.find(x=>x.id===t.dataset.bt);if(task){const was=task.done;task.done=!task.done;if(!was&&task.done){grant(VALUES.board.xp,VALUES.board.g,"Board prep task done","academic");}else{save();render();}}return;}
  if(t.dataset.dbt){S.boardTasks=S.boardTasks.filter(x=>x.id!==t.dataset.dbt);save();render();return;}
});
const _btAdd=document.getElementById("btAdd");
if(_btAdd) _btAdd.onclick=()=>{
  const n=document.getElementById("btName").value.trim();if(!n)return;
  S.boardTasks.push({id:id(),name:n,done:false});
  document.getElementById("btName").value="";save();render();
};

