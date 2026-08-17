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

// ---- Climb the Tree: knowledge quizzes, disguised as a Yggdrasil-climb game (Phase T) ----
// Same underlying measurement as before — every question in the bank is
// still asked, in the same shuffled order, and pass/fail still compares
// against the same t.pass threshold — only the presentation and the scoring
// signal changed. A small climber (🐿️, after Ratatoskr, the squirrel who
// runs Yggdrasil's trunk in the source myth) advances one node per question
// answered correctly. A wrong answer doesn't fail the run — it's a small
// setback: the climber slips, the explanation still shows, and you retry
// the SAME junction until you clear it, so everyone reaches the top. The
// score that actually counts (and feeds the pass/fail + rewards below) is
// the first-attempt accuracy — retries let you keep climbing, but they
// don't inflate the honest measurement of what you knew on first read.
// Auto-feed a missed quiz question into a per-category SRS deck, reusing
// the existing SM-2-lite scheduler (srsGrade(), test.js) as-is — this only
// adds a new insertion point, no new scheduling logic. One deck per quiz
// category ("Quiz misses: <name>"), auto-created on first miss. Deduped by
// {quizKey, qIndex} so re-missing the same question across attempts doesn't
// pile up duplicate cards.
function feedQuizMissToSrs(quizKey, quizName, qIndex, q){
  if(!S.srsDecks) S.srsDecks=[];
  let deck=S.srsDecks.find(d=>d.quizMissDeck===quizKey);
  if(!deck){ deck={id:id(), name:"Quiz misses: "+quizName, cards:[], quizMissDeck:quizKey}; S.srsDecks.push(deck); }
  if(deck.cards.some(c=>c.quizKey===quizKey && c.qIndex===qIndex)) return; // already added from an earlier miss
  const front=q.q+"\n"+q.a.map((opt,i)=>String.fromCharCode(65+i)+". "+opt).join("\n");
  const back=String.fromCharCode(65+q.c)+". "+q.a[q.c]+" — "+q.e;
  deck.cards.push({id:id(), front, back, quizKey, qIndex});
  save();
}
let QZ=null; // {key, idx, firstCorrect, retried, order}
function startQuiz(key){
  const t=window.QUIZ_BANK[key]; if(!t) return;
  // shuffle a copy of questions
  const order=t.questions.map((q,i)=>i).sort(()=>Math.random()-0.5);
  QZ={key,idx:0,firstCorrect:0,retried:false,order};
  document.getElementById("qmTitle").textContent="🐿️ Climb the Tree — "+t.icon+" "+t.name;
  document.getElementById("quizModal").classList.add("show");
  showQuizQ();
}
function ctPathHtml(total,idx){
  const nodes=Array.from({length:total},(_,i)=>{
    const cls=i<idx?"done":i===idx?"cur":"todo";
    const ic=i<idx?"🌿":i===idx?"🐿️":"🍃";
    return `<span class="ct-node ${cls}" id="ctNode${i}">${ic}</span>`;
  }).join("");
  return `<div class="ct-path">${nodes}</div>`;
}
function showQuizQ(){
  const t=window.QUIZ_BANK[QZ.key];
  const total=QZ.order.length;
  document.getElementById("qmProg").style.width=(QZ.idx/total*100)+"%";
  if(QZ.idx>=total){ return finishQuiz(); }
  const q=t.questions[QZ.order[QZ.idx]];
  const body=document.getElementById("qmBody");
  body.innerHTML=`${ctPathHtml(total,QZ.idx)}
    <div class="qm-qnum">${QZ.retried?"Same junction — try again":`Junction ${QZ.idx+1} of ${total}`}</div>
    <div class="qm-q">${esc(q.q)}</div>
    <div id="qmOpts">${q.a.map((opt,i)=>`<button class="qm-opt" data-opt="${i}">${esc(opt)}</button>`).join("")}</div>`;
  body.scrollTop=0;
}
function answerQuiz(choice){
  const t=window.QUIZ_BANK[QZ.key];
  const qIndex=QZ.order[QZ.idx];
  const q=t.questions[qIndex];
  const opts=document.querySelectorAll("#qmOpts .qm-opt");
  opts.forEach((o,i)=>{o.disabled=true;if(i===q.c)o.classList.add("correct");if(i===choice&&choice!==q.c)o.classList.add("wrong");});
  const correct=choice===q.c;
  // Missed on the first real attempt (not a retry) -> auto-feed the SRS
  // system instead of leaving it dead until the whole quiz is retaken.
  // Found by the v204-session quiz audit as the single biggest mechanism
  // gap: SRS existed but was 100% manually authored, so a wrong answer
  // just... stayed wrong until you happened to retake the same quiz.
  if(!correct && !QZ.retried && typeof feedQuizMissToSrs==="function"){
    feedQuizMissToSrs(QZ.key, t.name, qIndex, q);
  }
  const body=document.getElementById("qmBody");
  const exp=document.createElement("div");
  exp.className="qm-exp";
  exp.innerHTML=(correct?"✅ Correct — the path clears. ":"❌ Not quite — the branch holds. ")+esc(q.e);
  body.appendChild(exp);
  const nx=document.createElement("button");
  nx.className="qm-next";
  if(correct){
    if(!QZ.retried) QZ.firstCorrect++;
    nx.textContent=QZ.idx+1>=QZ.order.length?"Reach the top":"Climb on →";
    nx.onclick=()=>{ QZ.idx++; QZ.retried=false; showQuizQ(); };
  } else {
    const node=document.getElementById("ctNode"+QZ.idx); if(node) node.classList.add("slip");
    QZ.retried=true;
    nx.textContent="Try this junction again";
    nx.onclick=()=>{ showQuizQ(); };
  }
  body.appendChild(nx);
  body.scrollTop=body.scrollHeight;
}
function finishQuiz(){
  const t=window.QUIZ_BANK[QZ.key];
  const total=QZ.order.length;
  const pct=Math.round(QZ.firstCorrect/total*100);
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
      S.dailies.push({id:id(),name:reviewName,kind:"order",diff:"easy",track:"knowledge",done:false,best:0,streak:0,lastDone:null,graceUsed:false,history:[],review:QZ.key});
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
    <h2>${passed?"Reached the crown":"Keep climbing"}</h2>
    <div class="score" style="color:${passed?'var(--jade)':'var(--ember)'}">${pct}%</div>
    <p style="color:var(--ink-dim)">${QZ.firstCorrect} of ${total} junctions cleared on the first try · need ${Math.round(t.pass*100)}%</p>
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
