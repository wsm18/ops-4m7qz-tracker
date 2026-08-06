/* ---------------- QUIZZES ---------------- */
function renderQuizzes(){
  const el=document.getElementById("quizList");
  if(!el) return;
  const bank=window.QUIZ_BANK||{};
  el.innerHTML=Object.keys(bank).map(key=>{
    const t=bank[key];
    const st=S.quizzes[key]||{passed:false,bestPct:0,attempts:0};
    const passLabel=Math.round(t.pass*100);
    return `<div class="quiz-card ${st.passed?'passed':''}">
      <div class="quiz-head">
        <span class="quiz-ic">${t.icon}</span>
        <div class="quiz-meta">
          <div class="quiz-title">${t.name}</div>
          <div class="quiz-sub">${t.questions.length} questions · pass ≥ ${passLabel}%${st.attempts?` · best ${st.bestPct}%`:''}</div>
        </div>
        <span class="quiz-badge ${st.passed?'pass':'todo'}">${st.passed?'✓ passed':'not passed'}</span>
      </div>
      <button class="quiz-btn" data-quiz="${key}">${st.passed?'Retake / Review':'Start Quiz'}</button>
    </div>`;
  }).join("");
}

let QZ=null; // {key, idx, correct, order}
function startQuiz(key){
  const t=window.QUIZ_BANK[key]; if(!t) return;
  // shuffle a copy of questions
  const order=t.questions.map((q,i)=>i).sort(()=>Math.random()-0.5);
  QZ={key,idx:0,correct:0,order};
  document.getElementById("qmTitle").textContent=t.icon+" "+t.name;
  document.getElementById("quizModal").classList.add("show");
  showQuizQ();
}
function showQuizQ(){
  const t=window.QUIZ_BANK[QZ.key];
  const total=QZ.order.length;
  document.getElementById("qmProg").style.width=(QZ.idx/total*100)+"%";
  if(QZ.idx>=total){ return finishQuiz(); }
  const q=t.questions[QZ.order[QZ.idx]];
  const body=document.getElementById("qmBody");
  body.innerHTML=`<div class="qm-qnum">Question ${QZ.idx+1} of ${total}</div>
    <div class="qm-q">${esc(q.q)}</div>
    <div id="qmOpts">${q.a.map((opt,i)=>`<button class="qm-opt" data-opt="${i}">${esc(opt)}</button>`).join("")}</div>`;
  body.scrollTop=0;
}
function answerQuiz(choice){
  const t=window.QUIZ_BANK[QZ.key];
  const q=t.questions[QZ.order[QZ.idx]];
  const opts=document.querySelectorAll("#qmOpts .qm-opt");
  opts.forEach((o,i)=>{o.disabled=true;if(i===q.c)o.classList.add("correct");if(i===choice&&choice!==q.c)o.classList.add("wrong");});
  if(choice===q.c) QZ.correct++;
  const body=document.getElementById("qmBody");
  const exp=document.createElement("div");
  exp.className="qm-exp";
  exp.innerHTML=(choice===q.c?"✅ Correct. ":"❌ Not quite. ")+esc(q.e);
  body.appendChild(exp);
  const nx=document.createElement("button");
  nx.className="qm-next";
  nx.textContent=QZ.idx+1>=QZ.order.length?"See Results":"Next Question";
  nx.onclick=()=>{QZ.idx++;showQuizQ();};
  body.appendChild(nx);
  body.scrollTop=body.scrollHeight;
}
function finishQuiz(){
  const t=window.QUIZ_BANK[QZ.key];
  const total=QZ.order.length;
  const pct=Math.round(QZ.correct/total*100);
  const passed=pct>=Math.round(t.pass*100);
  const prev=S.quizzes[QZ.key]||{passed:false,bestPct:0,attempts:0};
  const firstPass=passed && !prev.passed;
  S.quizzes[QZ.key]={passed:prev.passed||passed, bestPct:Math.max(prev.bestPct,pct), attempts:prev.attempts+1};
  // first time passing: reward + convert to daily review + advance knowledge objective
  if(firstPass){
    S.gold+=20;
    if(!S.pathXP) S.pathXP={}; S.pathXP.academic=(S.pathXP.academic||0)+50;
    // add daily review order if not present
    const reviewName="🧠 Review: "+t.name+" (retake quiz)";
    if(!S.dailies.some(d=>d.review===QZ.key)){
      S.dailies.push({id:id(),name:reviewName,diff:"easy",track:"knowledge",done:false,best:0,review:QZ.key});
    }
    // advance the "pass every quiz" objective
    const obj=S.bosses.find(b=>b.auto==="quizzes");
    if(obj){const passedCount=Object.values(S.quizzes).filter(x=>x.passed).length; obj.hp=Math.max(0,obj.maxhp-passedCount); if(obj.hp<=0){toast("⭐ All quizzes passed — Knowledge objective secured!");}}
  }
  save();
  const body=document.getElementById("qmBody");
  document.getElementById("qmProg").style.width="100%";
  body.innerHTML=`<div class="qm-result">
    <div class="big">${passed?"🎖️":"📚"}</div>
    <h2>${passed?"Passed":"Keep Studying"}</h2>
    <div class="score" style="color:${passed?'var(--jade)':'var(--ember)'}">${pct}%</div>
    <p style="color:var(--ink-dim)">${QZ.correct} of ${total} correct · need ${Math.round(t.pass*100)}%</p>
    ${firstPass?`<p style="color:var(--gold);margin-top:12px">+20 merit pts · +50 Knowledge XP<br>Daily review order added to keep it sharp.</p>`:''}
    <button class="qm-next" style="margin-top:22px;max-width:300px" id="qmDone">Return</button>
  </div>`;
  document.getElementById("qmDone").onclick=closeQuiz;
}
function closeQuiz(){document.getElementById("quizModal").classList.remove("show");QZ=null;render();}
document.getElementById("qmClose").onclick=closeQuiz;
document.getElementById("qmBody").addEventListener("click",e=>{
  const o=e.target.closest(".qm-opt");
  if(o && !o.disabled){answerQuiz(parseInt(o.dataset.opt));}
});
document.body.addEventListener("click",e=>{
  const qb=e.target.closest("[data-quiz]");
  if(qb){startQuiz(qb.dataset.quiz);}
});

// Shared "m:ss"/"mm:ss" -> seconds parser, used by AFT event entry (aft.js) and
// the workout log's time-based exercises (log.js), not just this tab.
function parseTime(str){ // "m:ss" or "mm:ss" -> seconds
  if(!str) return null;
  const p=String(str).split(":").map(s=>parseInt(s.trim()));
  if(p.length===2 && !isNaN(p[0]) && !isNaN(p[1])) return p[0]*60+p[1];
  return null;
}
