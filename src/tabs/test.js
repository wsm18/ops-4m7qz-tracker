// ===== Focus picker: "what do you want to train today?" (Phase T, idea #1's own §1 ask) =====
// The last unbuilt piece of the stealth-assessment workstream — Wyatt's
// original ask was to present a menu of what to train, not a flat list of
// named tests. Now that every construct is a real game, this is a thin
// front door onto the existing per-test cards: pick a tile, it scrolls to
// and starts that game directly. The detailed list below still exists for
// stats/history — this doesn't replace it, just stops it being the first
// thing you see.
const FOCUS_TILES=[
  {key:"reflexes",testId:"reaction",icon:"🌲",label:"Reflexes",blurb:"Stand night watch — pure reaction speed."},
  {key:"memory",testId:"digitspan",icon:"🗺️",label:"Memory",blurb:"Memorize and relay a route."},
  {key:"typing",testId:"typing",icon:"📻",label:"Typing",blurb:"Type fast under a radio deadline."},
  {key:"workingmem",testId:"nback",icon:"🗼",label:"Working memory",blurb:"Track a rotating patrol."},
  {key:"impulse",testId:"gonogo",icon:"🎯",label:"Impulse control",blurb:"Target discrimination under pressure."},
  {key:"procspeed",testId:"procspeed",icon:"🔐",label:"Processing speed",blurb:"Decode a stream of symbols fast."},
  {key:"math",testId:"mathsprint",icon:"💥",label:"Math",blurb:"Quick fire-mission arithmetic."},
  {key:"reading",testId:"reading",icon:"📡",label:"Reading",blurb:"Read fast, act on what it said."},
  {key:"patterns",testId:"patterns",icon:"📶",label:"Pattern recognition",blurb:"Intercept a repeating signal — call the next blip."},
  {key:"knowledge",quiz:true,icon:"🐿️",label:"Knowledge",blurb:"Climb Yggdrasil on real ROTC knowledge."},
];
function renderFocusPicker(){
  const el=document.getElementById("focusPicker"); if(!el) return;
  el.innerHTML=`<div class="fp-grid">${FOCUS_TILES.map(t=>`<button class="fp-tile" data-fp="${t.key}"><span class="fp-icon">${t.icon}</span><span class="fp-label">${esc(t.label)}</span><span class="fp-blurb">${esc(t.blurb)}</span></button>`).join("")}</div>`;
  el.querySelectorAll("[data-fp]").forEach(btn=>{
    const tile=FOCUS_TILES.find(t=>t.key===btn.dataset.fp);
    btn.onclick=()=>focusPickerGo(tile);
  });
}
function focusPickerGo(tile){
  if(tile.quiz){
    const navBtn=document.querySelector('#sideNav button[data-tab="quizzes"]');
    if(navBtn) navBtn.click();
    return;
  }
  const card=document.getElementById("test-"+tile.testId);
  if(!card) return;
  card.scrollIntoView({behavior:"smooth", block:"start"});
  setTimeout(()=>{
    const startBtn=card.querySelector("[data-teststart],[data-rdstart]");
    if(startBtn) startBtn.click();
  }, 350);
}

// ===== TEST tab: cognitive tests/trainers =====
// Each test: id, name, the skill it feeds, and scoreToLevel(raw)->1..N.
const TESTS=[
  {id:"reaction", name:"Reaction time", skill:"Reaction speed", unit:"ms (lower better)", dur:"~20 sec · 5 taps",
   scoreToLevel:ms=> ms<=150?10: ms<=180?9: ms<=200?8: ms<=215?7: ms<=230?6: ms<=250?5: ms<=270?4: ms<=300?3: ms<=350?2: ms<=400?1: 0},
  {id:"digitspan", name:"Memory span (digit span)", skill:"Memory span", unit:"digits", dur:"~1–2 min",
   scoreToLevel:span=> span>=20?10: span>=18?9: span>=15?8: span>=13?7: span>=11?6: span>=9?5: span>=8?4: span>=7?3: span>=6?2: span>=5?1: 0},
  {id:"typing", name:"Typing speed & accuracy", skill:"Typing speed & accuracy", unit:"WPM", dur:"~30 sec · 1 sentence",
   scoreToLevel:wpm=> wpm>=216?10: wpm>=150?9: wpm>=110?8: wpm>=95?7: wpm>=80?6: wpm>=70?5: wpm>=60?4: wpm>=50?3: wpm>=40?2: wpm>=30?1: 0},
  {id:"nback", name:"N-back (working memory)", skill:"Working memory (n-back)", unit:"highest n passed", dur:"~1 min per round",
   scoreToLevel:n=> n>=5?8: n>=4?6: n>=3?4: n>=2?2: n>=1?1: 0},
  {id:"gonogo", name:"Go / No-Go (attention)", skill:"Attention / sustained focus", unit:"accuracy %", dur:"~45 sec · 25 signals",
   scoreToLevel:acc=> acc>=100?10: acc>=99?9: acc>=98?8: acc>=97?7: acc>=96?6: acc>=94?5: acc>=92?4: acc>=90?3: acc>=85?2: acc>=70?1: 0},
  {id:"procspeed", name:"Processing speed", skill:"Cognitive / processing speed", unit:"matches/min", dur:"60 sec",
   scoreToLevel:mpm=> mpm>=80?10: mpm>=70?9: mpm>=60?8: mpm>=52?7: mpm>=45?6: mpm>=38?5: mpm>=30?4: mpm>=22?3: mpm>=15?2: mpm>=1?1: 0},
  {id:"mathsprint", name:"Mental math sprint", skill:"Mental math", unit:"correct/min", dur:"60 sec",
   scoreToLevel:cpm=> cpm>=40?10: cpm>=34?9: cpm>=28?8: cpm>=24?7: cpm>=20?6: cpm>=16?5: cpm>=13?4: cpm>=10?3: cpm>=7?2: cpm>=1?1: 0},
  // Caps at 7, not 10 — same honest-capping precedent as nback (caps at 8):
  // this game format (modular/interleaved sequences) genuinely tests the
  // skill's L1-L7 rule families, but not L8-L10 (subtle/positional rules,
  // abstract matrix-style puzzles) — a different visual format this game
  // doesn't attempt. Those top rungs stay unreached rather than faked.
  {id:"patterns", name:"Pattern recognition", skill:"Pattern recognition", unit:"pattern round reached", dur:"~1 min per round",
   scoreToLevel:round=> round>=8?7: round>=6?6: round>=5?5: round>=4?4: round>=3?3: round>=2?2: round>=1?1: 0},
];
function testSkillOf(t){ return S.lifeSkills.find(s=>s.name===t.skill); }
function lastTest(typeId){ const r=(S.tests||[]).filter(x=>x.type===typeId).sort((a,b)=>new Date(b.date)-new Date(a.date)); return r[0]||null; }
function bestTest(typeId){
  const r=(S.tests||[]).filter(x=>x.type===typeId); if(!r.length) return null;
  const t=TESTS.find(x=>x.id===typeId);
  if(typeId==="reaction") return r.reduce((a,b)=>b.raw<a.raw?b:a);
  return r.reduce((a,b)=>b.raw>a.raw?b:a);
}
// record a result, level the linked skill if improved, return a suggestion string
function recordTest(typeId, raw, extra){
  const t=TESTS.find(x=>x.id===typeId); if(!t) return;
  const lvl=t.scoreToLevel(raw);
  S.tests.push({id:id(), type:typeId, date:new Date().toISOString(), raw, score:lvl, linkedSkill:t.skill});
  const sk=testSkillOf(t);
  let leveled=false;
  if(sk){
    const capped=Math.min(lvl, sk.levels.length);
    if(capped>sk.currentLevel){ sk.currentLevel=capped; skUpdatePeak(sk); sk.history.push({ts:Date.now(),type:"auto-test",level:capped}); leveled=true; }
    else { sk.lastQuestTs=Date.now(); } // practiced — refresh fade timer even if no new level
  }
  save();
  return {lvl, leveled, sk};
}
function testSuggestion(typeId, raw){
  if(typeId==="reaction"){
    if(raw>300) return "Over ~300ms — first, make sure you're rested and focused (reaction is very fatigue-sensitive) and not anticipating the change. Train it: 5 clean reps daily, reacting to the change rather than guessing. See the Reaction speed skill for the full level path.";
    if(raw>250) return "Around average. To push under 250ms, stay loose and let the change trigger you — pre-loading the tap hurts your average. Daily short reps build it. The Reaction speed skill lays out each level.";
    if(raw>180) return "Quick. Trimming further means reducing variance across trials and adding choice-reaction practice. See the Reaction speed roadmap for the elite levels.";
    return "Elite-class — near the human floor (~100ms is the hard limit). Maintain with short regular sessions and good sleep.";
  }
  if(typeId==="digitspan"){
    if(raw<6) return "Most people reach ~7. Train it: 'chunk' the digits — group them like a phone number (3-3-4) instead of memorizing singles. A few reps daily. The Memory span skill shows the path.";
    if(raw<9) return "Good span. Push higher by chunking into 3s and rehearsing the groups as you go. To break ~9, learn the Major system in the Memory technique skill — that's how spans reach the teens.";
    return "Excellent. Past here, span grows through mnemonic technique (Major system / images), not raw memory — see the Memory technique skill for the competition-level path.";
  }
  if(typeId==="typing"){
    if(raw<40) return "Build technique first: all ten fingers, eyes off the keyboard, accuracy over speed (errors are penalized). Daily practice on real sentences. The Typing skill lists every level.";
    if(raw<70) return "Good pace. Work your weak keys and common words to build muscle memory, and learn to read ahead of your fingers. See the Typing roadmap.";
    if(raw<100) return "Fast. To reach professional 100+ WPM, minimize error-correction time and keep accuracy high. The Typing skill shows the competitive levels.";
    return "Professional-class typing — a real Cyber asset. The top (150+) is competitive-typist territory; maintain with daily real-text typing.";
  }
  if(typeId==="nback"){
    if(raw<2) return "1-back is just 'did it repeat?' — get comfortable there. Say the position to yourself as it appears to anchor it. Train daily; it improves fast. The Working memory skill shows the path.";
    if(raw<3) return "2-back passed — a real working-memory workout. Push to 3-back by holding a rolling mental list of the last 3 items. Keep sessions short and frequent.";
    if(raw<5) return "Strong. 3–4 back is genuinely hard; get each level consistent (>80%) before climbing. The Working memory skill explains the dual-n-back top levels.";
    return "Exceptional. The very top is dual n-back (position + sound) — see the Working memory skill. Honest note: this trains the task, not general IQ.";
  }
  if(typeId==="gonogo"){
    if(raw<90) return "Watch the false taps — the Go signal lulls you into auto-tapping. Train it: keep a light, ready finger and stay deliberate; a meditation habit measurably helps sustained attention. The Attention skill shows the levels.";
    if(raw<97) return "Good control. The skill is resisting the easy tap on No-Go. Test rested — attention collapses with fatigue. See the Attention roadmap.";
    return "Excellent inhibition — real trigger-discipline and focus. Maintain with short regular sessions; near-perfect is the practical ceiling.";
  }
  if(typeId==="procspeed"){
    if(raw<25) return "Build familiarity with the key so you're not hunting for it — speed comes from automaticity, not rushing, and accuracy still counts. Train daily. The Processing speed skill lists each level.";
    if(raw<45) return "Solid throughput. Keep your eyes moving and trust the pattern; reduce the hesitation between matches. Test rested — this dips with poor sleep. See the roadmap.";
    return "Fast processing. Use it as a daily readiness check (it tracks sleep/fatigue closely). The top (~80/min) is near the practical ceiling.";
  }
  if(typeId==="mathsprint"){
    if(raw<15) return "Drill your times tables and number facts to automatic — most speed comes from not having to think about single facts. The Mental math skill shows the layered path.";
    if(raw<28) return "Good pace. Learn a couple of methods (left-to-right addition, ×11, doubling/halving) to speed multi-step problems. See the Mental math roadmap.";
    return "Fast — genuinely useful for land nav and logistics. The top levels use formal mental-calculation methods (Trachtenberg/Vedic); see the Mental math skill.";
  }
  if(typeId==="patterns"){
    if(raw<3) return "You're catching the simple modular patterns. The next step is holding two interleaved sequences in mind at once (the rounds where two symbol sets alternate) — watch a full repeat before answering rather than guessing early. The Pattern recognition skill lists every rule family.";
    if(raw<6) return "Solid — you're reading moderate and interleaved patterns reliably. Push into the larger, faster symbol pools and don't let the pace rush you into guessing. See the Pattern recognition roadmap for what's next.";
    return "Strong pattern extraction — consistently decoding complex, larger-pool sequences. The top of this skill (subtle/positional rules, abstract matrix-style puzzles) goes beyond what this game format tests; see the Pattern recognition skill for that path.";
  }
  return "";
}
function testUnit(typeId, raw){
  return raw + ({reaction:'ms', typing:' WPM', nback:'-back', gonogo:'%', procspeed:'/min', mathsprint:'/min', patterns:' rounds'}[typeId]||'');
}
function renderTests(){
  const wrap=document.getElementById("testList"); if(!wrap) return;
  wrap.innerHTML=TESTS.map(t=>{
    const sk=testSkillOf(t);
    const best=bestTest(t.id), last=lastTest(t.id);
    const lvl = sk ? skEffectiveLevel(sk) : 0;
    const bestStr = best ? testUnit(t.id, best.raw) : "—";
    const lastStr = last ? testUnit(t.id, last.raw) : "—";
    return `<div class="test-card" id="test-${t.id}">
      <div class="test-head">
        <div class="test-title">${esc(t.name)} <span class="test-dur">⏱ ${esc(t.dur)}</span></div>
        <span class="test-lvl">${sk?('Lv '+lvl):''}</span>
      </div>
      <div class="test-stats">Best: <b>${bestStr}</b> · Last: <b>${lastStr}</b> · feeds <b>${esc(t.skill)}</b></div>
      <details class="test-info"><summary>ℹ️ Why &amp; how</summary>
        <div class="test-why">${sk&&sk.why?`<p><b>Why:</b> ${esc(sk.why)}</p>`:''}${sk&&sk.whatYouDo?`<p><b>What you do:</b> ${esc(sk.whatYouDo)}</p>`:''}</div>
      </details>
      <div class="test-stage" id="stage-${t.id}"></div>
      <button class="btn-add test-start" data-teststart="${t.id}">Start (${esc(t.dur)})</button>
    </div>`;
  }).join("");
}

// ---- Sentry: reaction time, disguised as a night-watch game (Phase T / idea #1) ----
// Same underlying measurement as before — reaction latency, scored through
// the unchanged TESTS[0].scoreToLevel and recordTest("reaction", avg) — this
// only replaces the presentation. A threat silhouette requires a fast tap
// (that's the measured trial, exactly 5 per session); a decoy/wildlife
// silhouette must be ignored — tapping one is a real, felt false alarm, not
// a no-op, which doubles as impulse-control practice per the confirmed
// design (see the v186 entry in planning/FINISHED-FEATURES.md). No ms or timer is shown
// during play, only game-native tallies and a slow tension ramp — the real
// numbers (and a PR check) only appear once the watch ends, matching the
// resolved "hide during play, honest after" rule for the whole stealth-
// assessment workstream.
let _sentryState=null;
const SENTRY_SLOTS=5, SENTRY_THREATS=5, SENTRY_DECOYS=3;
function shuffleInPlace(arr){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function startReaction(){ startSentry(); }
function startSentry(){
  const stage=document.getElementById("stage-reaction"); if(!stage) return;
  if(_sentryState){ clearTimeout(_sentryState.timer); clearTimeout(_sentryState.hideTimer); }
  const rounds=shuffleInPlace([...Array(SENTRY_THREATS).fill(true), ...Array(SENTRY_DECOYS).fill(false)]);
  _sentryState={rounds, i:-1, trials:[], falseAlarms:0, missed:0, showing:false, isThreat:false, activeSlot:null, t0:0, timer:null, hideTimer:null};
  stage.className="test-stage";
  stage.innerHTML=`<div class="sentry-scene" id="sentryScene">
    <div class="sentry-tally">Threats spotted: <b id="sentrySpotted">0</b>/${SENTRY_THREATS} &nbsp;·&nbsp; False alarms: <b id="sentryAlarms">0</b></div>
    <div class="sentry-treeline" id="sentryTreeline"></div>
    <div class="sentry-note">Night watch — tap the instant a threat silhouette (▲) breaks the treeline. Hold on wildlife (●); a false alarm costs you.</div>
  </div>`;
  const scene=document.getElementById("sentryScene");
  const treeline=document.getElementById("sentryTreeline");
  const slots=[];
  for(let i=0;i<SENTRY_SLOTS;i++){
    const d=document.createElement("div"); d.className="sentry-slot"; treeline.appendChild(d);
    d.onclick=()=>sentryTap(d);
    slots.push(d);
  }
  function sentryTap(slot){
    if(!_sentryState.showing || slot!==_sentryState.activeSlot) return;
    _sentryState.showing=false; clearTimeout(_sentryState.hideTimer);
    if(_sentryState.isThreat){
      const ms=Math.round(performance.now()-_sentryState.t0);
      _sentryState.trials.push(ms);
      document.getElementById("sentrySpotted").textContent=_sentryState.trials.length;
      slot.className="sentry-slot hit";
    } else {
      _sentryState.falseAlarms++;
      document.getElementById("sentryAlarms").textContent=_sentryState.falseAlarms;
      slot.className="sentry-slot alarm";
    }
    setTimeout(sentryNext, 500);
  }
  function sentryNext(){
    _sentryState.i++;
    if(_sentryState.i>=_sentryState.rounds.length){ sentryDone(); return; }
    const isThreat=_sentryState.rounds[_sentryState.i];
    _sentryState.isThreat=isThreat; _sentryState.showing=false;
    slots.forEach(s=>{ s.className="sentry-slot"; s.textContent=""; });
    const tenseFrac=_sentryState.i/_sentryState.rounds.length;
    scene.className="sentry-scene"+(tenseFrac>0.5?" tense":"");
    const delay=(900-tenseFrac*300)+Math.random()*(1800-tenseFrac*400);
    _sentryState.timer=setTimeout(()=>{
      const slot=slots[Math.floor(Math.random()*slots.length)];
      _sentryState.activeSlot=slot; _sentryState.showing=true;
      slot.className="sentry-slot "+(isThreat?"threat":"decoy");
      slot.textContent=isThreat?"▲":"●";
      _sentryState.t0=performance.now();
      _sentryState.hideTimer=setTimeout(()=>{
        if(!_sentryState.showing) return;
        _sentryState.showing=false;
        if(isThreat){ _sentryState.missed++; slot.className="sentry-slot missed"; }
        setTimeout(sentryNext, 500);
      }, isThreat?900:1100);
    }, delay);
  }
  function sentryDone(){
    const trials=_sentryState.trials;
    const avg=trials.length?Math.round(trials.reduce((a,b)=>a+b,0)/trials.length):null;
    const prev=bestTest("reaction");
    const isPR=avg!=null && (!prev || avg<prev.raw);
    const res=avg!=null?recordTest("reaction", avg):{leveled:false};
    const missedNote=_sentryState.missed?`${_sentryState.missed} threat${_sentryState.missed!==1?'s':''} slipped past`:"";
    const alarmNote=_sentryState.falseAlarms?`${_sentryState.falseAlarms} false alarm${_sentryState.falseAlarms!==1?'s':''}`:"clean watch, no false alarms";
    if(res.leveled && typeof showLevelUp==="function") showLevelUp(res.sk.cat, res.sk.currentLevel);
    // render() rebuilds the whole test list (so the card's Lv/Best badges pick
    // up this result) — that also wipes #stage-reaction back to empty, so the
    // results screen has to be written into a FRESH reference AFTER render(),
    // not the pre-render `stage` var, or it's overwritten in the same tick
    // before ever painting.
    _sentryState=null; render();
    const stageEl=document.getElementById("stage-reaction"); if(!stageEl) return;
    stageEl.className="test-stage result";
    stageEl.innerHTML = avg!=null ? `<div class="test-result">
        <div class="big">${avg}ms</div>
        <div>average over ${trials.length} threat${trials.length!==1?'s':''} spotted (${trials.join(", ")})${isPR?' · <span class="sentry-pr">🏆 new best</span>':''}</div>
        <div>${[missedNote,alarmNote].filter(Boolean).join(' · ')}</div>
        ${res.leveled?`<div class="leveled">⬆️ ${esc(res.sk.name)} → Level ${res.sk.currentLevel}</div>`:''}
        <div class="sugg">${testSuggestion("reaction",avg)}</div>
      </div>` : `<div class="test-result"><div class="big">No threats spotted</div><div>Every threat slipped past this watch — stand it again.</div></div>`;
  }
  sentryNext();
}

// ---- Land Nav Relay: digit span, disguised as a route-memorization game (Phase T) ----
// Same underlying measurement as before — an adaptive recall span, unchanged
// TESTS[1].scoreToLevel and recordTest("digitspan", span) — only the skin
// changed. Digits (0-9) become 10 numbered waypoint markers on a course map;
// the flashed sequence (identical 650ms-on/250ms-gap timing) becomes a route
// call-out, and typed recall becomes tapping the same waypoints back in
// order to "relay the route." Waypoint numbers stay visible on the map at
// all times (a real map would label its own waypoints) — that doesn't leak
// the answer, since the thing that must be recalled is still the *order*
// they light up in, exactly as before.
let _lnState=null;
const LN_WAYPOINTS=10;
function startDigitSpan(){ startLandNav(); }
function startLandNav(){
  const stage=document.getElementById("stage-digitspan"); if(!stage) return;
  _lnState={len:4, seq:[], best:0, tapped:[]};
  lnShow();
  function lnMap(){
    stage.className="test-stage ln";
    stage.innerHTML=`<div class="ln-map" id="lnMap">${Array.from({length:LN_WAYPOINTS},(_,i)=>`<div class="ln-wp" data-lnwp="${i}"><span class="ln-wp-n">${i}</span></div>`).join("")}</div><div class="ln-note" id="lnNote"></div>`;
    return stage.querySelectorAll("[data-lnwp]");
  }
  function lnShow(){
    _lnState.seq=Array.from({length:_lnState.len},()=>Math.floor(Math.random()*10));
    _lnState.tapped=[];
    const wps=lnMap();
    document.getElementById("lnNote").textContent="Route incoming — watch the waypoint call-out order.";
    let i=0;
    const show=()=>{
      if(i<_lnState.seq.length){
        const wp=wps[_lnState.seq[i]]; wp.classList.add("lit"); i++;
        setTimeout(()=>{ wp.classList.remove("lit"); setTimeout(show,250); },650);
      } else { lnAsk(wps); }
    };
    setTimeout(show, 400);
  }
  function lnAsk(wps){
    document.getElementById("lnNote").textContent=`Relay the route — tap the ${_lnState.seq.length} waypoints back in the order they lit.`;
    // A waypoint marker isn't disabled after one tap — the same digit (and
    // so the same waypoint) can legitimately appear more than once in a
    // sequence, and a relay needs to be able to call it out again.
    wps.forEach(wp=>{
      wp.classList.add("pickable");
      wp.onclick=()=>{
        if(_lnState.tapped.length>=_lnState.seq.length) return;
        _lnState.tapped.push(parseInt(wp.dataset.lnwp));
        wp.classList.add("picked"); setTimeout(()=>wp.classList.remove("picked"),200);
        if(_lnState.tapped.length>=_lnState.seq.length) lnCheck(wps);
      };
    });
  }
  function lnCheck(wps){
    wps.forEach(wp=>{ wp.onclick=null; wp.classList.remove("pickable"); });
    if(_lnState.tapped.join(",")===_lnState.seq.join(",")){
      _lnState.best=_lnState.len; _lnState.len++;
      stage.innerHTML=`<div class="ln-ok">✓ Route relayed — ${_lnState.best} waypoints. Next: ${_lnState.len}. Tap to continue.</div>`;
      // deferred a tick — the winning tap's click event is still bubbling up
      // to this same `stage` element; attaching the handler synchronously
      // lets that same event fire it immediately and skip the round.
      setTimeout(()=>{ stage.onclick=()=>{ stage.onclick=null; lnShow(); }; },0);
    } else {
      lnDone();
    }
  }
  function lnDone(){
    const span=_lnState.best;
    if(span<4){ stage.className="test-stage ln result"; stage.innerHTML=`<div class="test-result"><div class="big">${span}</div><div>Route lost early — stand it again. Watch the call-out, then chunk it.</div></div>`; _lnState=null; return; }
    const res=recordTest("digitspan", span);
    // see the comment in sentryDone() — render() wipes the stage, so write
    // results into a fresh post-render reference.
    _lnState=null; render();
    const stageEl=document.getElementById("stage-digitspan"); if(!stageEl) return;
    stageEl.className="test-stage ln result";
    stageEl.innerHTML=`<div class="test-result"><div class="big">${span} waypoints</div><div>longest route relayed</div>${res.leveled?`<div class="leveled">⬆️ ${esc(res.sk.name)} → Level ${res.sk.currentLevel}</div>`:''}<div class="sugg">${testSuggestion("digitspan",span)}</div></div>`;
  }
}

// ---- Comms Relay: typing speed, disguised as a radio-traffic game (Phase T) ----
// Same underlying measurement as before — keystroke-timed WPM × accuracy,
// unchanged TESTS[2].scoreToLevel and recordTest("typing", wpm) — only the
// skin changed. One long sentence becomes a stream of short "transmissions"
// each on its own garble countdown; per-message elapsed time and per-char
// accuracy aggregate into the same gross-WPM-times-accuracy formula the
// original single-sentence test used. No live WPM number is shown mid-play
// — only a "messages relayed" tally and a decoded/lost flash per line.
const COMMS_MESSAGES=[
  "Enemy contact, grid four two one seven",
  "Requesting immediate resupply at checkpoint bravo",
  "Convoy departing now, hold this position",
  "Casualty evacuation needed, landing zone secure",
  "Fire mission complete, shifting to next target",
  "All clear, proceeding to phase line charlie",
  "Command post relocating, stand by for update",
  "Squad in position, awaiting your signal"
];
const COMMS_ROUNDS=5;
let _crState=null;
function startTyping(){ startCommsRelay(); }
function startCommsRelay(){
  const stage=document.getElementById("stage-typing"); if(!stage) return;
  if(_crState && _crState.garbleTimer) clearTimeout(_crState.garbleTimer);
  const queue=shuffleInPlace(COMMS_MESSAGES).slice(0,COMMS_ROUNDS);
  _crState={queue, i:-1, results:[], garbleTimer:null, resolved:false};
  crNext();
  function crNext(){
    _crState.i++;
    if(_crState.i>=_crState.queue.length){ crDone(); return; }
    const text=_crState.queue[_crState.i];
    _crState.resolved=false;
    const windowMs=Math.max(5000, text.length*180);
    stage.className="test-stage cr";
    stage.innerHTML=`<div class="cr-tally">Messages relayed: <b id="crTally">${_crState.results.length}</b>/${_crState.queue.length}</div>
      <div class="cr-msg">${esc(text)}</div>
      <textarea id="crInput" class="ty-input" rows="2" placeholder="Type the transmission before it garbles…"></textarea>
      <div class="cr-note">Incoming transmission — type it exactly before the signal is lost.</div>`;
    const inp=stage.querySelector("#crInput"); inp.focus();
    const t0=performance.now();
    _crState.garbleTimer=setTimeout(()=>crResolve(text,inp.value,t0,false), windowMs);
    inp.oninput=()=>{ if(inp.value===text) crResolve(text,inp.value,t0,true); };
  }
  function crResolve(text,typed,t0,success){
    if(_crState.resolved) return;
    _crState.resolved=true; clearTimeout(_crState.garbleTimer);
    const secs=Math.max(0.4,(performance.now()-t0)/1000);
    const words=text.split(/\s+/).length;
    let correct=0; for(let i=0;i<text.length;i++){ if(typed[i]===text[i]) correct++; }
    _crState.results.push({words, secs, correct, total:text.length});
    stage.innerHTML=`<div class="cr-flash ${success?'ok':'lost'}">${success?'✓ Message decoded':'✗ Signal lost'}</div>`;
    setTimeout(crNext, 500);
  }
  function crDone(){
    const r=_crState.results;
    const totalWords=r.reduce((a,b)=>a+b.words,0);
    const totalSecs=r.reduce((a,b)=>a+b.secs,0);
    const totalCorrect=r.reduce((a,b)=>a+b.correct,0);
    const totalChars=r.reduce((a,b)=>a+b.total,0);
    const acc=totalChars?totalCorrect/totalChars:0;
    const grossWpm=totalSecs>0?(totalWords/(totalSecs/60)):0;
    const wpm=Math.max(0, Math.min(250, Math.round(grossWpm*acc)));
    const res=recordTest("typing", wpm);
    // see the comment in sentryDone() — render() wipes the stage, so write
    // results into a fresh post-render reference.
    _crState=null; render();
    const stageEl=document.getElementById("stage-typing"); if(!stageEl) return;
    stageEl.className="test-stage cr result";
    stageEl.innerHTML=`<div class="test-result"><div class="big">${wpm} WPM</div><div>${Math.round(acc*100)}% accuracy across ${r.length} messages</div>${res.leveled?`<div class="leveled">⬆️ ${esc(res.sk.name)} → Level ${res.sk.currentLevel}</div>`:''}<div class="sugg">${testSuggestion("typing",wpm)}</div></div>`;
  }
}

// ---- Perimeter Watch: n-back, disguised as a patrol-rotation game (Phase T) ----
// Same underlying measurement as before — identical trial generation,
// unchanged TESTS[3].scoreToLevel and recordTest("nback", n) — only the skin
// changed. The bare 3x3 grid becomes 9 watch-post markers, and the lit cell
// each step becomes "which post the patrol is currently covering." The
// MATCH button becomes "Report repeat" — tap it whenever the currently lit
// post matches the one N steps back in the rotation, exactly the n-back task.
let _nbState=null;
function startNback(){ startPerimeterWatch(); }
function startPerimeterWatch(){
  const stage=document.getElementById("stage-nback"); if(!stage) return;
  stage.innerHTML=`<div class="pw-setup">Set the watch depth:
    <div class="nb-levels">${[1,2,3,4].map(n=>`<button class="hb-starter-btn" data-nbn="${n}">${n}-back</button>`).join("")}</div>
    <div class="nb-hint" style="font-size:12px;color:var(--ink-faint);margin-top:6px">Posts light up in rotation. Tap "Report repeat" when the currently lit post matches the one N steps back. Start at 1.</div></div>`;
  stage.querySelectorAll("[data-nbn]").forEach(btn=>btn.onclick=()=>nbRun(parseInt(btn.dataset.nbn)));
  function nbRun(n){
    const trials=20+n*2, seq=[];
    for(let i=0;i<trials;i++){
      if(i>=n && Math.random()<0.3) seq.push(seq[i-n]);
      else { let p; do{p=Math.floor(Math.random()*9);}while(i>=n && p===seq[i-n] && Math.random()<0.5); seq.push(p); }
    }
    _nbState={n, seq, i:-1, hits:0, misses:0, fa:0, correctRej:0, responded:false, gen:(window._nbGen=(window._nbGen||0)+1)};
    const myGen=_nbState.gen;
    stage.innerHTML=`<div class="pw-posts">${Array.from({length:9},(_,k)=>`<div class="pw-post" data-cell="${k}">🗼</div>`).join("")}</div>
      <div class="nb-status" id="nbStatus">Watching the rotation…</div>
      <button class="btn-add" id="nbMatch" disabled>🚨 Report repeat (${n}-back)</button>`;
    const cells=stage.querySelectorAll(".pw-post");
    const matchBtn=stage.querySelector("#nbMatch");
    const status=stage.querySelector("#nbStatus");
    matchBtn.onclick=()=>{
      if(_nbState.i<_nbState.n || _nbState.responded) return;
      _nbState.responded=true;
      const isMatch=_nbState.seq[_nbState.i]===_nbState.seq[_nbState.i-_nbState.n];
      if(isMatch){ _nbState.hits++; matchBtn.classList.add("good"); } else { _nbState.fa++; matchBtn.classList.add("bad"); }
    };
    let step=()=>{
      if(!_nbState || _nbState.gen!==myGen) return;  // a newer run replaced this one — stop
      if(_nbState.i>=_nbState.n && !_nbState.responded){
        const wasMatch=_nbState.seq[_nbState.i]===_nbState.seq[_nbState.i-_nbState.n];
        if(wasMatch) _nbState.misses++; else _nbState.correctRej++;
      }
      _nbState.i++;
      if(_nbState.i>=_nbState.seq.length){ nbDone(); return; }
      _nbState.responded=false;
      matchBtn.disabled=_nbState.i<_nbState.n;
      matchBtn.classList.remove("good","bad");
      cells.forEach(c=>c.classList.remove("on"));
      cells[_nbState.seq[_nbState.i]].classList.add("on");
      status.textContent=`Post ${_nbState.i+1} of ${_nbState.seq.length}`;
      setTimeout(()=>{ cells.forEach(c=>c.classList.remove("on")); }, 700);
      setTimeout(step, 2200);
    };
    setTimeout(step, 800);
    function nbDone(){
      const matches=_nbState.hits+_nbState.misses;
      const correct=_nbState.hits+_nbState.correctRej;
      const total=_nbState.seq.length-_nbState.n;
      const acc=total>0?Math.round((correct/total)*100):0;
      const passed = acc>=80 && _nbState.hits>=Math.ceil(matches*0.6);
      const nUsed=_nbState.n, hits=_nbState.hits, fa=_nbState.fa;
      let res=null;
      if(passed) res=recordTest("nback", nUsed);
      // see the comment in sentryDone() — render() wipes the stage, so write
      // results into a fresh post-render reference (and snapshot every value
      // read below into a local first, since _nbState is about to go away).
      _nbState=null; render();
      const stageEl=document.getElementById("stage-nback"); if(!stageEl) return;
      stageEl.className="test-stage result";
      stageEl.innerHTML=`<div class="test-result"><div class="big">${passed?nUsed+'-back watch ✓':'Keep practicing'}</div>
        <div>${acc}% accuracy · caught ${hits}/${matches} repeats · ${fa} false reports</div>
        ${res&&res.leveled?`<div class="leveled">⬆️ ${esc(res.sk.name)} → Level ${res.sk.currentLevel}</div>`:''}
        <div class="sugg">${testSuggestion("nback", passed?nUsed:0)}</div></div>`;
    }
  }
}

// ---- Fire Discipline: go/no-go, disguised as a target-discrimination drill (Phase T) ----
// Same underlying measurement as before — identical 25-signal trial timing
// and accuracy math, unchanged TESTS[4].scoreToLevel and recordTest("gonogo",
// acc) — only the skin changed. The green-circle/red-square go/no-go pair
// becomes hostile (▲, tap to engage) vs. friendly/non-combatant (●, hold
// fire) — a real, legitimate ROTC target-discrimination concept (Wyatt
// confirmed this framing directly — see the v186/v187 entries in
// planning/FINISHED-FEATURES.md), tasteful abstract silhouettes, no graphic content.
let _ggState=null;
function startGoNoGo(){ startFireDiscipline(); }
function startFireDiscipline(){
  const stage=document.getElementById("stage-gonogo"); if(!stage) return;
  if(_ggState && _ggState.t2) clearTimeout(_ggState.t2);
  _ggState={i:0, max:25, correct:0, total:0, showing:false, isGo:false, t2:null};
  stage.innerHTML=`<div class="gg-zone fd-zone wait" id="ggZone">Get ready…</div><div class="gg-status" id="ggStatus">Engage hostile ▲ silhouettes. Hold fire on friendly ● silhouettes.</div>`;
  const zone=stage.querySelector("#ggZone");
  const status=stage.querySelector("#ggStatus");
  zone.onclick=()=>{
    if(!_ggState.showing) return;
    _ggState.showing=false; clearTimeout(_ggState.t2);
    if(_ggState.isGo){ _ggState.correct++; zone.className="gg-zone fd-zone hit"; }
    else { zone.className="gg-zone fd-zone miss"; }
    _ggState.total++;
    setTimeout(next, 350);
  };
  let next=()=>{
    if(_ggState.i>=_ggState.max){ ggDone(); return; }
    _ggState.i++;
    _ggState.isGo=Math.random()<0.72;
    zone.className="gg-zone fd-zone wait"; zone.textContent="";
    setTimeout(()=>{
      _ggState.showing=true;
      zone.className="gg-zone fd-zone "+(_ggState.isGo?"hostile":"friendly");
      zone.textContent=_ggState.isGo?"▲":"●";
      status.textContent=`Silhouette ${_ggState.i} of ${_ggState.max}`;
      _ggState.t2=setTimeout(()=>{
        if(_ggState.showing){
          _ggState.showing=false;
          if(!_ggState.isGo){ _ggState.correct++; }
          _ggState.total++;
          next();
        }
      }, 900);
    }, 500+Math.random()*900);
  };
  setTimeout(next, 700);
  function ggDone(){
    const acc=Math.round((_ggState.correct/_ggState.max)*100);
    const maxUsed=_ggState.max;
    const res=recordTest("gonogo", acc);
    // see the comment in sentryDone() — render() wipes the stage, so write
    // results into a fresh post-render reference.
    _ggState=null; render();
    const stageEl=document.getElementById("stage-gonogo"); if(!stageEl) return;
    stageEl.className="test-stage result";
    stageEl.innerHTML=`<div class="test-result"><div class="big">${acc}%</div><div>target discrimination over ${maxUsed} silhouettes</div>
      ${res.leveled?`<div class="leveled">⬆️ ${esc(res.sk.name)} → Level ${res.sk.currentLevel}</div>`:''}
      <div class="sugg">${testSuggestion("gonogo", acc)}</div></div>`;
  }
}

// ---- Cipher Desk: processing speed, disguised as a codebreaking game (Phase T) ----
// Same underlying measurement as before — identical symbol→number matching-
// pad mechanic and 60-second sprint timing, unchanged TESTS[5].scoreToLevel
// and recordTest("procspeed", mpm) — only the skin changed. The fixed key
// becomes a displayed "cipher key," and each correct match is a "decrypted"
// symbol rather than a bare score tick.
let _psState=null;
function startProcSpeed(){ startCipherDesk(); }
function startCipherDesk(){
  const stage=document.getElementById("stage-procspeed"); if(!stage) return;
  if(_psState && _psState.tick) clearInterval(_psState.tick);
  const symbols=["◆","●","■","▲","★","✦","♦","◐","✚"];
  const key=symbols.map((s,i)=>({s,n:i+1}));
  _psState={correct:0, attempts:0, endsAt:Date.now()+60000, cur:null, tick:null};
  const keyHtml=key.map(k=>`<span class="ps-key"><b>${k.s}</b>${k.n}</span>`).join("");
  function nextItem(){
    _psState.cur=key[Math.floor(Math.random()*key.length)];
    const sym=stage.querySelector("#psSymbol"); if(sym) sym.textContent=_psState.cur.s;
    stage.querySelectorAll(".ps-num").forEach(b=>b.classList.remove("good","bad"));
  }
  stage.innerHTML=`<div class="cd-intro">Cipher key — decode each symbol to its number as fast as you can:</div>
    <div class="ps-keyrow">${keyHtml}</div>
    <div class="ps-prompt">Decode: <span id="psSymbol" class="ps-symbol"></span> = ?</div>
    <div class="ps-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="ps-num" data-psn="${n}">${n}</button>`).join("")}</div>
    <div class="cd-tally">Decrypted: <b id="cdTally">0</b></div>
    <div class="ps-status" id="psStatus">60s</div>`;
  stage.querySelectorAll("[data-psn]").forEach(btn=>btn.onclick=()=>{
    if(Date.now()>=_psState.endsAt) return;
    _psState.attempts++;
    if(parseInt(btn.dataset.psn)===_psState.cur.n){ _psState.correct++; btn.classList.add("good"); const t=stage.querySelector("#cdTally"); if(t) t.textContent=_psState.correct; }
    else btn.classList.add("bad");
    setTimeout(nextItem, 110);
  });
  nextItem();
  _psState.tick=setInterval(()=>{
    const left=Math.max(0,Math.ceil((_psState.endsAt-Date.now())/1000));
    const st=stage.querySelector("#psStatus"); if(st) st.textContent=left+"s";
    if(left<=0){ clearInterval(_psState.tick); psDone(); }
  }, 250);
  function psDone(){
    const mpm=_psState.correct, attempts=_psState.attempts;
    const res=recordTest("procspeed", mpm);
    // see the comment in sentryDone() — render() wipes the stage, so write
    // results into a fresh post-render reference.
    _psState=null; render();
    const stageEl=document.getElementById("stage-procspeed"); if(!stageEl) return;
    stageEl.className="test-stage result";
    stageEl.innerHTML=`<div class="test-result"><div class="big">${mpm}/min</div><div>${mpm} of ${attempts} messages decrypted</div>
      ${res.leveled?`<div class="leveled">⬆️ ${esc(res.sk.name)} → Level ${res.sk.currentLevel}</div>`:''}
      <div class="sugg">${testSuggestion("procspeed", mpm)}</div></div>`;
  }
}

// ---- Fire Mission: mental math sprint, disguised as a call-for-fire drill (Phase T) ----
// Same underlying measurement as before — identical arithmetic generation
// and 60-second sprint timing, unchanged TESTS[6].scoreToLevel and
// recordTest("mathsprint", cpm) — only the skin changed. "a + b =" becomes
// an artillery/logistics correction ("adjust", "drop", "rounds needed"),
// and each correct entry gets a brief "Target hit" flash before the next
// mission loads, instead of a silent auto-advance.
let _mmState=null;
function startMathSprint(){ startFireMission(); }
function startFireMission(){
  const stage=document.getElementById("stage-mathsprint"); if(!stage) return;
  if(_mmState && _mmState.tick) clearInterval(_mmState.tick);
  _mmState={correct:0, attempts:0, endsAt:Date.now()+60000, ans:0, tick:null};
  function gen(){
    const op=["+","−","×"][Math.floor(Math.random()*3)];
    let a,b,ans,prompt;
    if(op==="+"){ a=2+Math.floor(Math.random()*98); b=2+Math.floor(Math.random()*98); ans=a+b; prompt=`Adjust fire: ${a} mils, add ${b} =`; }
    else if(op==="−"){ a=10+Math.floor(Math.random()*90); b=1+Math.floor(Math.random()*a); ans=a-b; prompt=`Adjust fire: ${a} mils, drop ${b} =`; }
    else { a=2+Math.floor(Math.random()*11); b=2+Math.floor(Math.random()*11); ans=a*b; prompt=`Rounds needed: ${a} guns × ${b} rounds each =`; }
    _mmState.ans=ans;
    const q=stage.querySelector("#mmQ"); if(q) q.textContent=prompt;
    const inp=stage.querySelector("#mmA"); if(inp){ inp.value=""; inp.focus(); inp.classList.remove("fm-hit"); }
  }
  stage.innerHTML=`<div class="mm-q" id="mmQ"></div>
    <input id="mmA" inputmode="numeric" class="ds-input" autocomplete="off">
    <div class="fm-flash" id="fmFlash"></div>
    <div class="ps-status" id="mmStatus">60s</div>`;
  const inp=stage.querySelector("#mmA");
  const flash=stage.querySelector("#fmFlash");
  inp.oninput=()=>{
    if(Date.now()>=_mmState.endsAt) return;
    const v=inp.value.replace(/[^\d-]/g,"");
    if(v!=="" && parseInt(v)===_mmState.ans){
      _mmState.correct++; _mmState.attempts++;
      inp.classList.add("fm-hit");
      flash.textContent="🎯 Target hit";
      setTimeout(()=>{ flash.textContent=""; gen(); }, 150);
    }
  };
  gen();
  _mmState.tick=setInterval(()=>{
    const left=Math.max(0,Math.ceil((_mmState.endsAt-Date.now())/1000));
    const st=stage.querySelector("#mmStatus"); if(st) st.textContent=left+"s";
    if(left<=0){ clearInterval(_mmState.tick); mmDone(); }
  }, 250);
  function mmDone(){
    const cpm=_mmState.correct;
    const res=recordTest("mathsprint", cpm);
    // see the comment in sentryDone() — render() wipes the stage, so write
    // results into a fresh post-render reference.
    _mmState=null; render();
    const stageEl=document.getElementById("stage-mathsprint"); if(!stageEl) return;
    stageEl.className="test-stage result";
    stageEl.innerHTML=`<div class="test-result"><div class="big">${cpm}/min</div><div>fire missions completed in 60s</div>
      ${res.leveled?`<div class="leveled">⬆️ ${esc(res.sk.name)} → Level ${res.sk.currentLevel}</div>`:''}
      <div class="sugg">${testSuggestion("mathsprint", cpm)}</div></div>`;
  }
}

// ---- Signal Intercept: pattern recognition, disguised as decoding a repeating radio-blip transmission ----
// A genuinely NEW construct, not a re-skin — "Pattern recognition" was a
// seeded skill locked auto:"test:patterns" with no game ever built to feed
// it (found by the v200-session audit; the skill was permanently stuck at
// level 0). Measures real rule extraction: a flashed sequence of blips
// follows a hidden modular (or two-interleaved-modular) rule; the player
// predicts the next blip from 4 choices. Difficulty escalates via symbol-
// pool size, step size, and single-vs-interleaved rule — not sequence
// LENGTH alone, which would just be digit span again. Confirmed with Wyatt
// via AskUserQuestion: sequence-prediction mechanic, "Signal Intercept"
// theme. scoreToLevel deliberately caps at L7 of the skill's 10-level
// ladder — same honest-capping precedent as nback capping at L8 (dual
// n-back isn't built either): the top 2 rungs here describe subtle/
// positional rules and abstract matrix-style puzzles, a different visual
// format this game doesn't attempt, so they stay honestly unreached.
let _siState=null;
const SI_SET_A=["●","▲","■","◆","★","✦","♦","♣"];
const SI_SET_B=["○","△","□","◇","☆","✧","♢","♧"];
const SI_ROUNDS=[
  {pool:3, mode:"cycle", step:1},
  {pool:4, mode:"cycle", step:1},
  {pool:4, mode:"cycle", step:2},
  {pool:5, mode:"alt"},
  {pool:5, mode:"cycle", step:2},
  {pool:6, mode:"cycle", step:1},
  {pool:6, mode:"alt"},
  {pool:7, mode:"cycle", step:2},
];
// A generator closure is the single source of truth for both the flashed
// sequence and the correct "next" answer — avoids re-deriving next from the
// tail of the shown array, which is what actually breaks for alt-mode.
function siMakeGenerator(cfg){
  if(cfg.mode==="cycle"){
    let cur=Math.floor(Math.random()*cfg.pool);
    return ()=>{ const v=SI_SET_A[cur]; cur=(cur+cfg.step)%cfg.pool; return v; };
  }
  let a=Math.floor(Math.random()*cfg.pool), b=Math.floor(Math.random()*cfg.pool), i=0;
  return ()=>{
    let v;
    if(i%2===0){ v=SI_SET_A[a]; a=(a+1)%cfg.pool; } else { v=SI_SET_B[b]; b=(b+1)%cfg.pool; }
    i++; return v;
  };
}
function siChoices(cfg, next){
  const inPlay=new Set();
  if(cfg.mode==="cycle"){ for(let k=0;k<cfg.pool;k++) inPlay.add(SI_SET_A[k]); }
  else { for(let k=0;k<cfg.pool;k++){ inPlay.add(SI_SET_A[k]); inPlay.add(SI_SET_B[k]); } }
  inPlay.delete(next);
  let pool=shuffleInPlace([...inPlay]);
  const fullPool=SI_SET_A.concat(SI_SET_B);
  while(pool.length<3){
    const extra=fullPool.filter(s=>s!==next && !pool.includes(s));
    if(!extra.length) break;
    pool.push(extra[Math.floor(Math.random()*extra.length)]);
  }
  return shuffleInPlace([next, ...pool.slice(0,3)]);
}
function startPatterns(){ startSignalIntercept(); }
function startSignalIntercept(){
  const stage=document.getElementById("stage-patterns"); if(!stage) return;
  _siState={round:0, best:0, next:null};
  siShow();
  function siStageMap(){
    stage.className="test-stage si";
    stage.innerHTML=`<div class="si-display" id="siDisplay"></div><div class="si-note" id="siNote">Signal incoming — watch the pattern.</div><div class="si-choices" id="siChoices"></div>`;
  }
  function siShow(){
    siStageMap();
    const cfg=SI_ROUNDS[Math.min(_siState.round, SI_ROUNDS.length-1)];
    const gen=siMakeGenerator(cfg);
    const len=cfg.mode==="cycle"?cfg.pool*2+1:cfg.pool*2;
    const seq=Array.from({length:len},()=>gen());
    _siState.next=gen();
    const disp=document.getElementById("siDisplay");
    let i=0;
    const show=()=>{
      if(i<seq.length){
        disp.innerHTML=`<span class="si-blip">${esc(seq[i])}</span>`;
        i++;
        setTimeout(()=>{ disp.innerHTML=""; setTimeout(show,220); },550);
      } else { siAsk(cfg); }
    };
    setTimeout(show,400);
  }
  function siAsk(cfg){
    const note=document.getElementById("siNote"); if(note) note.textContent="What comes next?";
    const choices=siChoices(cfg, _siState.next);
    const choicesEl=document.getElementById("siChoices");
    choicesEl.innerHTML=choices.map(c=>`<button class="si-choice" data-sic="${esc(c)}">${esc(c)}</button>`).join("");
    choicesEl.querySelectorAll("[data-sic]").forEach(btn=>{ btn.onclick=()=>siPick(btn.dataset.sic); });
  }
  function siPick(val){
    const choicesEl=document.getElementById("siChoices");
    if(choicesEl) choicesEl.querySelectorAll("[data-sic]").forEach(b=>b.onclick=null);
    if(val===_siState.next){
      _siState.best=_siState.round+1; _siState.round++;
      stage.innerHTML=`<div class="si-ok">✓ Intercepted — pattern ${_siState.best} decoded. Tap to continue.</div>`;
      // deferred a tick — the winning tap's click event is still bubbling up
      // to this same `stage` element; attaching synchronously would let it
      // fire immediately and skip the round (same fix as Land Nav Relay).
      setTimeout(()=>{ stage.onclick=()=>{ stage.onclick=null; siShow(); }; },0);
    } else {
      siDone();
    }
  }
  function siDone(){
    const round=_siState.best;
    if(round<1){ stage.className="test-stage si result"; stage.innerHTML=`<div class="test-result"><div class="big">0</div><div>Signal lost on the first pattern — stand by and try again. Watch for the repeat before answering.</div></div>`; _siState=null; return; }
    const res=recordTest("patterns", round);
    // see the comment in sentryDone() — render() wipes the stage, so write
    // results into a fresh post-render reference.
    _siState=null; render();
    const stageEl=document.getElementById("stage-patterns"); if(!stageEl) return;
    stageEl.className="test-stage si result";
    stageEl.innerHTML=`<div class="test-result"><div class="big">${round}</div><div>pattern${round!==1?'s':''} decoded</div>${res.leveled?`<div class="leveled">⬆️ ${esc(res.sk.name)} → Level ${res.sk.currentLevel}</div>`:''}<div class="sugg">${testSuggestion("patterns",round)}</div></div>`;
  }
}

// ===== Intel Briefing: reading speed, disguised as an intercepted-report drill (Phase T) =====
// Same underlying measurement as before — identical timed-passage mechanic
// and the same WPM formula, unchanged READING_SCORE_MAP and the "reading"
// test type — only the comprehension check changed, and it's a genuine
// honesty upgrade, not just a skin: instead of self-reporting how well you
// understood the passage, you're given 2-3 possible next actions and must
// pick the one that's actually consistent with what the report said.
// Whether you pick correctly *is* the comprehension measurement, an
// objective decision-correctness signal replacing self-report (confirmed
// direction — see the v187 entry in planning/FINISHED-FEATURES.md).
const READING_PASSAGES=[
  {title:"FM 6-0 Excerpt",words:284,text:"Mission command is the exercise of authority and direction by the commander using mission orders to enable disciplined initiative within the commander's intent to empower agile and adaptive leaders in the conduct of unified land operations. Mission command rests on the principle that subordinate leaders must be able to act and make decisions rapidly and on their own initiative to exploit fleeting opportunities. The key to success in mission command is trust — trust developed through shared understanding and the exercise of disciplined initiative. Leaders at all levels must understand the commander's intent two levels up. This understanding allows them to act in the absence of orders and to adapt their actions to the changing situation. The commander creates a shared understanding by clearly expressing his intent, providing mission-type orders, and creating an environment that fosters initiative. Subordinate leaders are empowered to make decisions within the framework established by the commander. They must not wait for orders when the situation changes rapidly. Instead, they must act boldly and decisively to accomplish the mission. The Army's doctrine of mission command has its roots in the 19th-century Prussian military model of Auftragstaktik, which emphasized decentralized decision-making and trust in subordinate judgment. This model proved decisive in numerous campaigns and remains the foundation of Army leadership today.",
   scenario:"Situation changes rapidly and you can't reach the commander. What do you do?",
   actions:["Wait for updated orders from higher before adjusting the plan.","Act on the commander's intent and adjust to the new situation without waiting for orders.","Escalate the decision to the commander's commander for clarification."],
   correct:1, why:"The report's whole point is that subordinate leaders act on intent and don't wait for orders when the situation changes."},
  {title:"Army Writing Passage",words:296,text:"Clear writing is a military skill. Officers and NCOs who write clearly save time, reduce friction, and drive results. Poor writing wastes effort: a vague order requires clarification; an unclear report forces a follow-up; an ambiguous policy breeds inconsistent action. The Army's standard for writing is the BLUF — Bottom Line Up Front. State the purpose in the first sentence. Follow with supporting detail. Close with required actions, deadlines, and who is responsible. This structure mirrors how busy leaders consume information — they read the first sentence, decide if they need the rest, and act. Military writing strips filler: no passive voice when active is available, no jargon when plain English works, no long preamble before the point. Every word must earn its place. Good writers revise. A first draft is thinking on paper; the revision is the actual writing. Before sending, ask: Would someone who knows nothing about this understand what to do, by when, and why? If not, revise. The Army invests in writing skills for a reason: when words fail, missions fail. An incomplete OPORD, a poorly drafted counseling statement, or a vague message to higher can cascade into real consequences in the field. Writing is not a soft skill; it is a force multiplier. Treat it like a weapon and maintain it like one.",
   scenario:"You're drafting a report for a busy commander. How do you structure it?",
   actions:["Open with a long preamble giving full background before the main point.","State the purpose first, then supporting detail, then clear required actions.","List every possible consideration so nothing is left out, regardless of length."],
   correct:1, why:"The report's whole point is BLUF — bottom line up front, then detail, then required actions."},
  {title:"Leadership Story",words:278,text:"The squad leader had twelve seconds to decide. His team was pinned on the left flank, the platoon sergeant unreachable, and the enemy crew-served weapon was repositioning. He had trained for exactly this — not because anyone had told him this scenario would happen, but because the Army trains leaders to think under pressure, not just to follow scripts. He checked his sectors, assessed his casualties — one walking wounded, the others still effective — and made the call. The squad would bound right, using the creek bed for cover, and suppress from a position of advantage while the weapons squad shifted fire. It was not the perfect plan. The creek bed was shallow and the right flank had unknown threats. But a good plan now beats a perfect plan too late. He signaled his team leaders and they moved. Within ninety seconds the crew-served weapon was silenced and the platoon was able to maneuver. After the action, his platoon leader asked how he had made the call so quickly. He did not have a clever answer. He had drilled the fundamentals — cover and concealment, bounding overwatch, fire and movement — until they were instinct. When the moment came, he did not think. He acted on what he knew. That is what training builds: not answers to specific questions, but the capacity to find answers to questions no one anticipated.",
   scenario:"You're the squad leader in this exact spot, with the platoon sergeant unreachable. What do you do?",
   actions:["Hold position and wait until contact with the platoon sergeant is re-established.","Bound right using the creek bed for cover while shifting suppressive fire — an imperfect but timely plan.","Retreat immediately to avoid casualties until a perfect plan can be devised."],
   correct:1, why:"The report's point is a good plan now beats a perfect plan too late — the squad leader acted, he didn't wait or retreat."},
  {title:"Sleep & Recovery",words:271,text:"Sleep is not passive recovery. During sleep, the brain consolidates memories, clears metabolic waste, and restores the cognitive capacity degraded by a day of sustained attention and decision-making. For a soldier or officer operating in a demanding environment, sleep is as important as ammunition: you can fight for a while without it, but performance degrades fast, and the degradation compounds. Research on sleep deprivation shows that after 17 to 19 hours without sleep, cognitive performance drops to the equivalent of a blood alcohol level of 0.05 percent. After 24 hours, it reaches 0.10 percent — legally impaired in every U.S. state. What makes sleep deprivation particularly dangerous is that the impaired person rarely notices the impairment. Confidence stays high while judgment erodes. Leaders who operate on chronic sleep debt make worse decisions while believing they are sharp. The Army acknowledges this: Performance Triad doctrine lists sleep alongside nutrition and physical activity as the three pillars of physical and cognitive readiness. The prescription is seven to nine hours for most adults. The challenge is building the conditions and culture that make that possible — consistent sleep schedules, protected sleep windows before operations, and leaders who model recovery rather than treating sleeplessness as a badge of toughness. Sleep is a weapon system. Maintain it accordingly.",
   scenario:"You're leading into an operation tomorrow and feel confident tonight despite a short night's sleep. What's the right call?",
   actions:["Push through — feeling confident and sharp means you're still fit to lead.","Protect a consistent sleep window before the operation — impaired judgment isn't self-evident.","Rely on caffeine before the mission to replace the lost sleep hours."],
   correct:1, why:"The report's key point is that confidence stays high while judgment erodes — you can't trust how sharp you feel."},
];
const READING_SCORE_MAP=wpm=>wpm>=1000?10:wpm>=700?9:wpm>=500?8:wpm>=400?7:wpm>=300?6:wpm>=250?5:wpm>=200?4:wpm>=150?3:wpm>=100?2:wpm>=50?1:0;

let _rdState=null;
function renderReadingTest(){
  const el=document.getElementById("readingTest"); if(!el) return;
  const best=(S.tests||[]).filter(x=>x.type==="reading").reduce((b,x)=>(!b||x.raw>b.raw)?x:b,null);
  const sk=S.lifeSkills.find(s=>s.name==="Reading speed");
  const lvl=sk?skEffectiveLevel(sk):0;
  el.innerHTML=`<div class="test-card" id="test-reading">
    <div class="test-head">
      <div class="test-title">Reading speed <span class="test-dur">⏱ ~1 min</span></div>
      <span class="test-lvl">${sk?'Lv '+lvl:''}</span>
    </div>
    <div class="test-stats">Best: <b>${best?best.raw+' WPM':'—'}</b> · feeds <b>Reading speed</b></div>
    <div class="test-stage" id="stage-reading"></div>
    <button class="btn-add test-start" data-rdstart="1">Start (pick a passage)</button>
  </div>`;
}
function startReading(){ startIntelBriefing(); }
function startIntelBriefing(){
  const stage=document.getElementById("stage-reading"); if(!stage) return;
  const p=READING_PASSAGES[Math.floor(Math.random()*READING_PASSAGES.length)];
  _rdState={passage:p, t0:null, running:false};
  stage.className="test-stage rd";
  stage.innerHTML=`<div class="rd-title">📡 Intercepted report — ${esc(p.title)}</div>
    <div class="rd-passage">${esc(p.text)}</div>
    <div class="rd-instructions">Read the report above at your natural pace. When you finish, tap <b>Done reading</b> — you'll then have to act on what it actually said.</div>
    <button class="btn-add" id="rdBegin">Begin reading (starts timer)</button>`;
  document.getElementById("rdBegin").onclick=()=>{
    _rdState.t0=performance.now(); _rdState.running=true;
    document.getElementById("rdBegin").remove();
    const done=document.createElement("button"); done.className="btn-add"; done.textContent="Done reading"; done.style.marginTop="10px";
    stage.appendChild(done);
    done.onclick=()=>rdDone();
  };
}
function rdDone(){
  if(!_rdState||!_rdState.t0) return;
  const secs=(performance.now()-_rdState.t0)/1000;
  const wpm=Math.round(_rdState.passage.words/(secs/60));
  const p=_rdState.passage;
  const stage=document.getElementById("stage-reading"); if(!stage) return;
  stage.innerHTML=`<div class="rd-choice-wrap">
    <div style="font-size:12.5px;color:var(--ink-dim);margin-bottom:10px">${esc(p.scenario)}</div>
    <div class="rd-comp-btns">${p.actions.map((a,i)=>`<button class="hb-starter-btn" data-rdact="${i}">${esc(a)}</button>`).join("")}</div>
  </div>`;
  stage.querySelectorAll("[data-rdact]").forEach(btn=>btn.onclick=()=>{
    const picked=parseInt(btn.dataset.rdact);
    const correct=picked===p.correct;
    const adjWpm=correct?wpm:Math.round(wpm*0.4);
    const lvl=READING_SCORE_MAP(adjWpm);
    S.tests.push({id:id(),type:"reading",date:new Date().toISOString(),raw:adjWpm,score:lvl,rawWpm:wpm,comprehension:correct?"yes":"no",linkedSkill:"Reading speed"});
    const sk=S.lifeSkills.find(s=>s.name==="Reading speed");
    let leveled=false;
    if(sk){
      const capped=Math.min(lvl,sk.levels.length);
      if(capped>sk.currentLevel){sk.currentLevel=capped;skUpdatePeak(sk);sk.history.push({ts:Date.now(),type:"auto-test",level:capped});leveled=true;}
      else{sk.lastQuestTs=Date.now();}
    }
    save();
    const sugg=(correct?(adjWpm>=500?"Excellent pace with real comprehension — that's proficient speed-reading territory. Maintain with regular varied reading.":adjWpm>=300?"Solid pace with real comprehension. Push further with regression-elimination (force yourself not to re-read) and chunking 2–3 words at a time.":"Correct call, average pace. Try pacing with a finger or pointer to reduce fixation time, and minimize re-reading.")
      :"You picked the action the report doesn't actually support — that's what this check catches. Slow down slightly and read for the actual point, not just the words. Speed only counts when it holds up to a real decision.");
    // see the comment in sentryDone() — render() wipes the stage (and here,
    // renderReadingTest() also rebuilds #stage-reading the same way), so
    // write results into a fresh post-render reference.
    _rdState=null; render();
    const stageEl=document.getElementById("stage-reading"); if(!stageEl) return;
    stageEl.innerHTML=`<div class="test-result"><div class="big">${adjWpm} WPM</div><div>${wpm} raw · ${correct?'✓ correct action picked':'✗ wrong action picked'}</div><div style="font-size:12px;color:var(--ink-faint);margin-top:4px">${esc(p.why)}</div>${leveled&&sk?`<div class="leveled">⬆️ Reading speed → Level ${sk.currentLevel}</div>`:''}<div class="sugg">${sugg}</div></div>`;
  });
}

// ===== Memory Track: Spaced Repetition (SM-2-lite) + Memory Palace =====
function srsDue(deck){ const now=Date.now(); return deck.cards.filter(c=>!c.due || c.due<=now); }
function srsTotalDue(){ return (S.srsDecks||[]).reduce((n,d)=>n+srsDue(d).length,0); }
function feedMemorySkill(){ // reviewing/practicing refreshes the Memory technique skill timer
  const sk=S.lifeSkills.find(s=>s.name==="Memory technique");
  if(sk && sk.currentLevel>0) sk.lastQuestTs=Date.now();
}
let _srsSession=null;
function renderSRS(){
  const area=document.getElementById("srsArea"); if(!area) return;
  if(_srsSession){ renderSrsCard(); return; }
  const decks=S.srsDecks||[];
  const list=decks.map(d=>{
    const due=srsDue(d).length;
    return `<div class="srs-deck">
      <div class="srs-deck-info"><b>${esc(d.name)}</b><span>${d.cards.length} cards · ${due} due</span></div>
      <div class="srs-deck-btns">
        ${due>0?`<button class="hb-starter-btn" data-srsreview="${d.id}">Review ${due}</button>`:'<span style="font-size:11px;color:var(--ink-faint)">all done</span>'}
        <button class="hb-starter-btn" data-srsadd="${d.id}">+ card</button>
        <button class="hb-starter-btn" data-srsdel="${d.id}">✕</button>
      </div>
    </div>`;
  }).join("");
  area.innerHTML=`${list||'<div style="font-size:12.5px;color:var(--ink-faint)">No decks yet. Create one to start.</div>'}
    <div class="srs-newdeck"><input id="srsNewName" placeholder="New deck name — e.g. Branch knowledge" maxlength="40"><button class="btn-add" id="srsNewBtn" style="margin-top:8px">Create deck</button></div>`;
  const nb=document.getElementById("srsNewBtn");
  if(nb) nb.onclick=()=>{ const n=document.getElementById("srsNewName").value.trim(); if(!n)return; S.srsDecks.push({id:id(),name:n,cards:[]}); save(); render(); };
}
function renderSrsCard(){
  const area=document.getElementById("srsArea"); if(!area) return;
  const s=_srsSession;
  if(s.idx>=s.queue.length){ // session done
    area.innerHTML=`<div class="srs-done">✓ Reviewed ${s.queue.length} card${s.queue.length!==1?'s':''}. ${srsTotalDue()} still due across decks.</div>`;
    _srsSession=null; feedMemorySkill(); save();
    setTimeout(()=>render(),1400); return;
  }
  const card=s.queue[s.idx];
  area.innerHTML=`<div class="srs-card">
    <div class="srs-front">${esc(card.front)}</div>
    ${s.revealed?`<div class="srs-back">${esc(card.back)}</div>
      <div class="srs-grade">How well did you know it?
        <div class="srs-grade-btns">
          <button class="srs-g again" data-srsgrade="0">Again</button>
          <button class="srs-g hard" data-srsgrade="3">Hard</button>
          <button class="srs-g good" data-srsgrade="4">Good</button>
          <button class="srs-g easy" data-srsgrade="5">Easy</button>
        </div></div>`
    :`<button class="btn-add" id="srsReveal">Show answer</button>`}
  </div>`;
  if(!s.revealed){ const rv=document.getElementById("srsReveal"); if(rv) rv.onclick=()=>{ s.revealed=true; renderSrsCard(); }; }
}
function srsGrade(q){
  const s=_srsSession; if(!s) return;
  const card=s.queue[s.idx];
  // SM-2-lite: ease starts 2.5, interval grows; "Again" resets
  card.ease=card.ease||2.5; card.reps=card.reps||0;
  if(q<3){ card.reps=0; card.interval=0; card.ease=Math.max(1.3,card.ease-0.2); }
  else {
    card.ease=Math.max(1.3, card.ease + (0.1-(5-q)*(0.08+(5-q)*0.02)));
    card.reps++;
    if(card.reps===1) card.interval=1;
    else if(card.reps===2) card.interval=3;
    else card.interval=Math.round((card.interval||1)*card.ease);
  }
  card.due=Date.now()+(card.interval||0)*864e5;
  s.idx++; s.revealed=false; save(); renderSrsCard();
}
function startSrsReview(deckId){
  const d=S.srsDecks.find(x=>x.id===deckId); if(!d) return;
  const due=srsDue(d); if(!due.length){ toast("Nothing due in this deck"); return; }
  _srsSession={deckId, queue:due.slice(), idx:0, revealed:false};
  renderSrsCard();
}

// ---- Memory palace ----
function renderPalace(){
  const area=document.getElementById("palaceArea"); if(!area) return;
  const palaces=S.palaces||[];
  const list=palaces.map(p=>{
    const loci=p.loci||[];
    return `<div class="palace">
      <div class="palace-top"><b>${esc(p.name)}</b><span>${loci.length} stops</span>
        <button class="hb-starter-btn" data-paltest="${p.id}">Test recall</button>
        <button class="hb-starter-btn" data-paldel="${p.id}">✕</button></div>
      <ol class="palace-loci">${loci.map((l,i)=>`<li><span class="loc-place">${esc(l.place)}</span> → <span class="loc-item">${esc(l.item)}</span></li>`).join("")}</ol>
      <div class="palace-add"><input class="pal-place" data-palplace="${p.id}" placeholder="place (e.g. front door)" maxlength="40"><input class="pal-item" data-palitem="${p.id}" placeholder="item to remember" maxlength="40"><button class="hb-starter-btn" data-paladd="${p.id}">+ place item</button></div>
    </div>`;
  }).join("");
  area.innerHTML=`${list||'<div style="font-size:12.5px;color:var(--ink-faint)">No palaces yet. Build one from a place you know well.</div>'}
    <div class="srs-newdeck"><input id="palNewName" placeholder="New palace — e.g. My apartment" maxlength="40"><button class="btn-add" id="palNewBtn" style="margin-top:8px">Build palace</button></div>`;
  const nb=document.getElementById("palNewBtn");
  if(nb) nb.onclick=()=>{ const n=document.getElementById("palNewName").value.trim(); if(!n)return; S.palaces.push({id:id(),name:n,loci:[]}); save(); render(); };
}
function palaceTest(pid){
  const p=S.palaces.find(x=>x.id===pid); if(!p||!p.loci.length){ toast("Add some stops first"); return; }
  const area=document.getElementById("palaceArea");
  let i=0, correct=0;
  const ask=()=>{
    if(i>=p.loci.length){
      area.innerHTML=`<div class="srs-done">✓ Walked all ${p.loci.length} stops. How many did you recall? Be honest — the practice is what counts.</div>`;
      feedMemorySkill(); save(); setTimeout(()=>render(),1800); return;
    }
    const l=p.loci[i];
    area.innerHTML=`<div class="srs-card"><div class="srs-front">At: <b>${esc(l.place)}</b><br><span style="font-size:13px;color:var(--ink-faint)">what did you place here?</span></div>
      <button class="btn-add" id="palShow">Reveal</button></div>`;
    document.getElementById("palShow").onclick=()=>{
      area.innerHTML=`<div class="srs-card"><div class="srs-front">At: <b>${esc(l.place)}</b></div><div class="srs-back">${esc(l.item)}</div>
        <button class="hb-starter-btn" id="palNext">Next stop →</button></div>`;
      document.getElementById("palNext").onclick=()=>{ i++; ask(); };
    };
  };
  ask();
}

// ===== Study Plans (spaced schedule for a graded test) =====
function renderStudy(){
  const area=document.getElementById("studyArea"); if(!area) return;
  const bank=window.QUIZ_BANK||{};
  const topicOpts=Object.keys(bank).map(k=>`<label class="study-topic"><input type="checkbox" data-studytopic="${k}"> ${esc(bank[k].name||k)}</label>`).join("");
  const plans=(S.studyPlans||[]).map(pl=>{
    const days=studyDaysLeft(pl);
    const total=pl.schedule?pl.schedule.length:0;
    const done=(pl.done||[]).length;
    return `<div class="study-plan">
      <div class="study-top"><b>${esc(pl.title)}</b><button class="hb-starter-btn" data-studydel="${pl.id}">✕</button></div>
      <div class="study-meta">Test ${days>=0?`in ${days} day${days!==1?'s':''}`:'date passed'} · ${done}/${total} reviews done</div>
      <div class="study-prog"><div class="study-prog-fill" style="width:${total?Math.round(done/total*100):0}%"></div></div>
      <div class="study-today" id="studytoday-${pl.id}"></div>
    </div>`;
  }).join("");
  area.innerHTML=`${plans}
    <details class="habit-add-wrap"><summary>+ New study plan</summary>
      <div class="adder" style="margin-top:10px">
        <input id="studyTitle" placeholder="Test name — e.g. Land Nav written exam" maxlength="50">
        <label class="lg-label" style="margin-top:9px;display:block">Test date</label>
        <input id="studyDate" type="date">
        <label class="lg-label" style="margin-top:9px;display:block">Topics to review (pick the quiz banks it covers)</label>
        <div class="study-topics">${topicOpts}</div>
        <button class="btn-add" id="studyGen" style="margin-top:10px">Generate spaced plan</button>
      </div>
    </details>`;
  const gen=document.getElementById("studyGen");
  if(gen) gen.onclick=()=>{
    const title=document.getElementById("studyTitle").value.trim();
    const date=document.getElementById("studyDate").value;
    if(!title||!date){ toast("Name the test and pick a date"); return; }
    const topics=[...area.querySelectorAll("[data-studytopic]:checked")].map(c=>c.dataset.studytopic);
    if(!topics.length){ toast("Pick at least one topic"); return; }
    S.studyPlans.push(makeStudyPlan(title,date,topics));
    save(); render();
    toast("📅 Study plan generated");
  };
  // render today's tasks per plan
  (S.studyPlans||[]).forEach(pl=>{
    const el=document.getElementById("studytoday-"+pl.id); if(!el) return;
    const today=todayStr();
    const todays=(pl.schedule||[]).filter(s=>s.date===today);
    if(!todays.length){ el.innerHTML=`<div class="study-rest">No review scheduled today — spacing means rest days count too.</div>`; return; }
    el.innerHTML=todays.map(s=>{
      const key=s.date+"|"+s.topic;
      const isDone=(pl.done||[]).includes(key);
      const bank=window.QUIZ_BANK||{};
      return `<div class="study-task ${isDone?'done':''}">
        <button class="hb-check ${isDone?'on':''}" data-studydone="${pl.id}|${key}" ${isDone?'disabled':''}>${isDone?'✓':''}</button>
        <span>Review: <b>${esc(bank[s.topic]?bank[s.topic].name:s.topic)}</b></span>
      </div>`;
    }).join("");
  });
}
function studyDaysLeft(pl){ return Math.ceil((new Date(pl.testDate)-Date.now())/864e5); }
