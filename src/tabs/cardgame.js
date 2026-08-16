// ===== FM-3: Card-game workouts =====
// Full design rationale and deviations from the original spec are documented
// in the v188 entry of planning/FINISHED-FEATURES.md — read that before
// touching this file. Greenlit for a full build (not a one-slot prototype)
// after being deliberately held in planning for several sessions.
//
// Architecture (Wyatt's own framing): "the coach gives the material... the
// game mode picks exercises to work those." This build takes that literally
// — it does NOT re-derive session/slot/equipment selection. It calls
// sessionExForProfile() (FM-2, already trusted) for today's work-phase
// slots, and computeTarget()/BEGINNER_RX (FM-Adapt/starter data) for each
// slot's real prescribed volume. The card game is a presentation + pacing
// layer on top of that existing, trusted material — not a parallel system.
//
// One real, documented deviation from the original spec: it assumed each
// exercise slot has exactly 4 fixed "regression" variants at different
// difficulty tiers. The real SESSIONS data (built in FM-2) isn't shaped
// that way — a slot's eligible pool is 1-5 DIFFERENT real exercises for the
// same muscle group (not a hard->easy ladder of one movement), and nothing
// in the app tracks a real relative-difficulty ranking between them.
// Inventing one would be a faked metric (a CLAUDE.md hard-rule violation),
// so every variant in a pool gets an equal value multiplier here — the
// original "conversion rate" math still runs, it just always evaluates to 1,
// which is the honest choice given what the app actually knows. Suits still
// map to different real exercises (bucketing a variable-length pool onto 4
// suits, the same "bucket into N real options" idea already used to solve
// the original variable-suit-count problem), and reps still scale by rank
// — the game feel is intact, just without a fabricated difficulty score.
//
// The progressive-overload guardrails are a hard clamp, not an emergent
// property to hope for: every draw's reps land in an [8%,12%]-of-threshold
// band by construction (interpolated by rank within that band), so "roughly
// 8-13 draws per group" and "never wildly overshoot the real prescription"
// hold for any threshold. The adaptive difficulty-bias (too easy/too hard)
// nudges the rank draw INSIDE that band — it can never push a single draw
// outside the safety bounds.

const CG_SUITS=[{sym:"♠",col:"var(--ink)"},{sym:"♥",col:"var(--blood)"},{sym:"♦",col:"var(--violet)"},{sym:"♣",col:"var(--jade)"}];
function cgRankLabel(r){ return r===1?"A": r===11?"J": r===12?"Q": r===13?"K": String(r); }

function cgParseLeadingInt(str, fallback){
  const m=String(str||"").match(/\d+/);
  return m ? parseInt(m[0]) : fallback;
}
// Word-overlap match against a BEGINNER_RX row list — SESSIONS names and
// BEGINNER_RX names aren't guaranteed identical strings (e.g. SESSIONS'
// "Trap-bar / barbell deadlift" vs BEGINNER_RX's "Trap-bar deadlift"). A
// plain substring-either-direction check (the original approach) requires
// the RX row's words to appear contiguously and in order in the target
// name, which that exact real pair fails — "deadlift" isn't adjacent to
// "trap-bar" once "barbell" sits between them, so the match silently missed
// and fell through to a generic default (double the real prescribed volume,
// found and fixed in the v192 cleanup pass). This checks word-overlap
// instead — order-independent, tolerant of words like "barbell" or "/" in
// between — and requires at least half the RX row's own words to appear in
// the target name, picking the best-scoring match if more than one clears
// that bar.
function cgFindRxRow(rows, name){
  const norm=s=>String(s||"").toLowerCase().replace(/[\/(),]/g," ").split(/\s+/).filter(Boolean);
  const nameSet=new Set(norm(name));
  let best=null, bestScore=0;
  (rows||[]).forEach(r=>{
    const rWords=norm(r.name); if(!rWords.length) return;
    const score=rWords.filter(w=>nameSet.has(w)).length/rWords.length;
    if(score>bestScore && score>=0.5){ bestScore=score; best=r; }
  });
  return best;
}
// Real prescribed volume for one slot: {repsPerSet, setsTarget, threshold, source}.
// Same resolution order prescriptionFor() already uses (adaptive first,
// starter table second, generic default last) — just split into the two
// numbers the threshold math needs separately.
function cgSlotVolume(skey, exName){
  let repsPerSet=null, source="default";
  if(typeof computeTarget==="function"){
    const tgt=computeTarget(exName);
    if(tgt && tgt.target){
      const n=cgParseLeadingInt(tgt.target, null);
      if(n!=null){ repsPerSet=n; source="adaptive"; }
    }
  }
  const rx=BEGINNER_RX[skey];
  const row = rx ? (cgFindRxRow(rx.bw,exName) || cgFindRxRow(rx.gym,exName)) : null;
  if(repsPerSet==null && row){ repsPerSet=cgParseLeadingInt(row.reps, 10); source="starter"; }
  if(repsPerSet==null) repsPerSet=10;
  const setsTarget = row ? cgParseLeadingInt(String(row.sets), 3) : 3;
  return {repsPerSet, setsTarget, threshold:repsPerSet*setsTarget, source};
}
// Is there a card-game-eligible session today at all? (at least one
// reps-type work-phase slot, using the normal daily equipment resolution —
// just for deciding whether to show the entry button; the actual play
// session re-resolves against whatever equipment is chosen at start.)
function cgAvailableToday(){
  if(typeof todaysPlan!=="function") return null;
  const p=todaysPlan();
  if(!p.sessionKey) return null;
  const workSlots=(p.exercises||[]).filter(e=>e._phase==="work" && e.t==="reps");
  if(!workSlots.length) return null;
  return {sessionKey:p.sessionKey, intensity:p.dayPlan.intensity};
}

let _cgSetup=null; // {sessionKey, intensity} — equipment-pick step, before a real session exists
let _cg=null;       // {sessionKey, tags, workSlots, curSlot, curCard, startedAt, sessionLog, ended}
let _cgEffortDraft=null;
let _cgFinalRpeDraft=null;

function cgOpen(){
  const avail=cgAvailableToday();
  if(!avail){ toast("No card-game-eligible session today"); return; }
  _cgSetup=avail; _cg=null;
  const modal=document.getElementById("cardGameModal"); if(modal) modal.style.display="flex";
  cgRenderModal();
}
function cgClose(){
  const modal=document.getElementById("cardGameModal"); if(modal) modal.style.display="none";
  _cg=null; _cgSetup=null; _cgEffortDraft=null; _cgFinalRpeDraft=null;
}
function cgRenderModal(){
  const el=document.getElementById("cgBody"); if(!el) return;
  if(_cgSetup && !_cg){ el.innerHTML=cgEquipStepHtml(); cgWireEquipStep(); return; }
  if(_cg && !_cg.ended){ el.innerHTML=cgPlayHtml(); cgWirePlay(); return; }
  if(_cg && _cg.ended){ el.innerHTML=cgFinishHtml(); cgWireFinish(); return; }
}

// ---- Step 1: equipment choice (session-local, does not touch S.activeEquipProfile) ----
function cgEquipStepHtml(){
  const profiles=Object.keys(S.equipProfiles||{});
  const active=S.activeEquipProfile;
  return `<div class="cg-setup">
    <div class="cg-setup-h">🎴 Card-Game Workout</div>
    <p class="plan-intro">Exercises get drawn as cards instead of handed to you as a fixed list — same real prescribed volume, just dealt out a few reps at a time. Pick your equipment for this session; it won't change your saved default.</p>
    <p class="plan-intro">Covers rep-based exercise groups only — timed holds, runs, and distance carries aren't part of the deck yet, so a circuit-style session like the AFT Circuit will only cover a couple of its groups this way. The rest of today's session is still on the normal session list.</p>
    <div class="cg-profile-list">${profiles.map(n=>`<button class="cg-profile-btn${n===active?' on':''}" data-cgeq="${esc(n)}">${n===active?'✓ ':''}${esc(n)}</button>`).join("")}</div>
    <button class="btn-add" id="cgBeginBtn" style="margin-top:14px">Start the deal →</button>
  </div>`;
}
function cgWireEquipStep(){
  let chosen=S.activeEquipProfile;
  document.querySelectorAll("[data-cgeq]").forEach(b=>b.onclick=()=>{
    chosen=b.dataset.cgeq;
    document.querySelectorAll("[data-cgeq]").forEach(x=>x.classList.toggle("on", x.dataset.cgeq===chosen));
  });
  document.getElementById("cgBeginBtn").onclick=()=>cgBegin(chosen);
}
function cgBegin(profileName){
  const tags=(S.equipProfiles[profileName]||{}).tags||[];
  const exs=sessionExForProfile(_cgSetup.sessionKey, tags, new Date()).filter(e=>e._phase==="work" && e.t==="reps");
  if(!exs.length){ toast("No reps-based exercises available with that equipment today"); return; }
  const workSlots=exs.map(e=>{
    const vol=cgSlotVolume(_cgSetup.sessionKey, e.n);
    return Object.assign({slotIdx:e._slotIdx, pool:e._pool, progress:0, bias:0, draws:[], done:false}, vol);
  });
  _cg={sessionKey:_cgSetup.sessionKey, tags, workSlots, curSlot:0, curCard:null, startedAt:Date.now(), sessionLog:{}, ended:false};
  _cgSetup=null;
  cgDrawCard();
  cgRenderModal();
}

// ---- Draw / log loop ----
function cgDrawCard(){
  const slot=_cg.workSlots[_cg.curSlot];
  const suitIdx=Math.floor(Math.random()*4);
  const baseRank=1+Math.floor(Math.random()*13);
  const rank=Math.max(1, Math.min(13, baseRank + slot.bias*2)); // adaptive bias nudges INSIDE the guardrail band below, never outside it
  const variant=slot.pool[suitIdx % slot.pool.length];
  const minC=Math.max(1, Math.round(slot.threshold*0.08));   // §5a guardrail: min ~8% of threshold per draw
  const maxC=Math.max(minC+1, Math.round(slot.threshold*0.12)); // §5a guardrail: max ~12% of threshold per draw
  const repsTarget = minC + Math.round((rank-1)/12 * (maxC-minC));
  _cg.curCard={suitIdx, rank, variant, repsTarget};
}
function cgLogDraw(actualReps, effort){
  const slot=_cg.workSlots[_cg.curSlot];
  const card=_cg.curCard;
  const name=card.variant.n;
  if(!_cg.sessionLog[name]) _cg.sessionLog[name]={type:"reps", w:!!card.variant.w, sets:[], efforts:[]};
  _cg.sessionLog[name].sets.push({reps:String(actualReps), weight:""});
  _cg.sessionLog[name].efforts.push(effort);
  slot.progress+=actualReps;
  slot.draws.push({name, rank:card.rank, suitIdx:card.suitIdx, reps:actualReps, effort});
  // adaptive draw-bias (§5a point 4) — session-local, not persisted; distinct
  // timescale from FM-Adapt's cross-session computeTarget() signal on purpose.
  if(effort<=3) slot.bias=Math.max(-3, Math.min(3, slot.bias+1));
  else if(effort>=8) slot.bias=Math.max(-3, Math.min(3, slot.bias-1));
  if(slot.progress>=slot.threshold){
    slot.done=true;
    _cg.curSlot++;
    if(_cg.curSlot>=_cg.workSlots.length){ cgFinish(); cgRenderModal(); return; }
    cgDrawCard();
  } else {
    cgDrawCard();
  }
  cgRenderModal();
}
function cgFinish(){ _cg.ended=true; }

function cgPlayHtml(){
  const slot=_cg.workSlots[_cg.curSlot];
  const card=_cg.curCard;
  const suit=CG_SUITS[card.suitIdx];
  const pct=Math.min(100, Math.round(slot.progress/slot.threshold*100));
  const groupsLeft=_cg.workSlots.length-_cg.curSlot;
  const how=exHowto(card.variant.n);
  return `<div class="cg-play">
    <div class="cg-groupline">Exercise group ${_cg.curSlot+1} of ${_cg.workSlots.length}</div>
    <div class="cg-card" style="--cg-suit-col:${suit.col}">
      <div class="cg-card-corner">${cgRankLabel(card.rank)}${suit.sym}</div>
      <div class="cg-card-suit-big">${suit.sym}</div>
      <div class="cg-card-corner cg-card-corner-b">${cgRankLabel(card.rank)}${suit.sym}</div>
    </div>
    <div class="cg-exname">${esc(card.variant.n)}</div>
    ${how?`<div class="cg-how">${esc(how)}</div>`:''}
    <div class="cg-target">Target: about <b>${card.repsTarget}</b> reps</div>
    <div class="cg-progress"><div class="cg-progress-fill" style="width:${pct}%"></div></div>
    <div class="cg-progress-lbl">${slot.progress}/${slot.threshold} toward this group${groupsLeft>1?` · ${groupsLeft-1} group${groupsLeft-1!==1?'s':''} after this`:''}</div>
    <div class="cg-log">
      <label class="lg-label">Actual reps done</label>
      <input type="number" id="cgActualReps" value="${card.repsTarget}" inputmode="numeric">
      <label class="lg-label" style="margin-top:8px">Difficulty <span class="lg-diff-hint">1 = very easy · 10 = max effort</span></label>
      <div class="lg-effort-scale">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" class="lg-effort-btn" data-cgeffort="${n}">${n}</button>`).join("")}</div>
      <button class="btn-add" id="cgLogBtn" style="margin-top:10px">Log this draw →</button>
    </div>
    <button class="hb-starter-btn" id="cgStopBtn" style="margin-top:12px">Stop &amp; log what I've done</button>
  </div>`;
}
function cgWirePlay(){
  document.querySelectorAll("[data-cgeffort]").forEach(b=>{
    b.classList.toggle("on", _cgEffortDraft!=null && +b.dataset.cgeffort===_cgEffortDraft);
    b.onclick=()=>{ _cgEffortDraft=+b.dataset.cgeffort; document.querySelectorAll("[data-cgeffort]").forEach(x=>x.classList.toggle("on",+x.dataset.cgeffort===_cgEffortDraft)); };
  });
  document.getElementById("cgLogBtn").onclick=()=>{
    const reps=parseInt(document.getElementById("cgActualReps").value)||0;
    if(reps<=0){ toast("Log at least 1 rep"); return; }
    if(_cgEffortDraft==null){ toast("Rate the difficulty first"); return; }
    const effort=_cgEffortDraft; _cgEffortDraft=null;
    cgLogDraw(reps, effort);
  };
  document.getElementById("cgStopBtn").onclick=()=>{ cgFinish(); cgRenderModal(); };
}

// ---- Finish: whole-session RPE, then push into S.workouts exactly like a normal log ----
function cgFinishHtml(){
  const totalDraws=_cg.workSlots.reduce((a,s)=>a+s.draws.length,0);
  const totalReps=_cg.workSlots.reduce((a,s)=>a+s.progress,0);
  const groupsCleared=_cg.workSlots.filter(s=>s.done).length;
  return `<div class="cg-finish">
    <div class="big">🎴 Deal complete</div>
    <div>${groupsCleared} of ${_cg.workSlots.length} exercise groups cleared · ${totalDraws} draws · ${totalReps} total reps</div>
    <label class="lg-label" style="margin-top:14px">Session effort (whole workout) <span class="lg-diff-hint">1 = very easy · 10 = max effort</span></label>
    <div class="lg-effort-scale">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button type="button" class="lg-effort-btn" data-cgfinalrpe="${n}">${n}</button>`).join("")}</div>
    <button class="btn-add" id="cgFinishBtn" style="margin-top:14px">Save workout →</button>
  </div>`;
}
function cgWireFinish(){
  document.querySelectorAll("[data-cgfinalrpe]").forEach(b=>{
    b.classList.toggle("on", _cgFinalRpeDraft!=null && +b.dataset.cgfinalrpe===_cgFinalRpeDraft);
    b.onclick=()=>{ _cgFinalRpeDraft=+b.dataset.cgfinalrpe; document.querySelectorAll("[data-cgfinalrpe]").forEach(x=>x.classList.toggle("on",+x.dataset.cgfinalrpe===_cgFinalRpeDraft)); };
  });
  document.getElementById("cgFinishBtn").onclick=()=>cgSubmitFinalRpe(_cgFinalRpeDraft);
}
function cgSubmitFinalRpe(rpe){
  const exercises=Object.keys(_cg.sessionLog).map(name=>{
    const rec=_cg.sessionLog[name];
    const effs=rec.efforts.filter(e=>e!=null);
    const avgEffort = effs.length? Math.round(effs.reduce((a,b)=>a+b,0)/effs.length) : null;
    return {name, type:"reps", w:rec.w, sets:rec.sets, effort:avgEffort, reduced:false};
  });
  if(!exercises.length){ toast("Nothing logged — session discarded"); cgClose(); return; }
  const dur=Math.max(1, Math.round((Date.now()-_cg.startedAt)/60000));
  S.workouts.push({id:id(), date:new Date().toLocaleDateString(), ts:Date.now(), session:_cg.sessionKey, duration:dur, rpe:rpe||null, readiness:null, exercises, note:"Card-game mode"});
  if(!S.pathXP) S.pathXP={};
  S.pathXP.physical=(S.pathXP.physical||0)+25; S.gold+=8; S.totalDone++;
  save();
  cgClose();
  render();
  toast(`<span class="t-xp">Card-game workout logged · +25 Fitness XP +8 pts</span>`);
}
document.getElementById("cgClose").onclick=()=>{
  if(_cg && !_cg.ended && Object.keys(_cg.sessionLog).length && !confirm("Leave without saving? What you've logged so far will be lost.")) return;
  cgClose();
};
