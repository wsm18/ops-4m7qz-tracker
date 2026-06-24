let _skLevels=["",""];  // draft level abilities being entered (start with 2 blanks)
function renderSkLevelInputs(){
  const el=document.getElementById("skLevelInputs"); if(!el) return;
  el.innerHTML=_skLevels.map((v,i)=>`<div class="sk-level-row">
    <span class="ln">L${i+1}</span>
    <input data-skl="${i}" placeholder="Ability at level ${i+1} — something you can test" value="${esc(v)}">
    ${_skLevels.length>1?`<button class="rm" data-skrm="${i}">✕</button>`:''}
  </div>`).join("");
}
let _skEditId=null;
function skCreate(){
  const name=document.getElementById("skName").value.trim(); if(!name){toast("Name the skill first");return;}
  const cat=document.getElementById("skCat").value;
  const fadeDays=parseInt(document.getElementById("skFade").value)||30;
  const parent=document.getElementById("skParent").value||null;
  const levels=_skLevels.map(s=>s.trim()).filter(Boolean).map((ability,i)=>({n:i+1,ability}));
  if(!levels.length){toast("Define at least one level (an ability)");return;}
  if(_skEditId){
    const sk=S.lifeSkills.find(x=>x.id===_skEditId);
    if(sk){ sk.name=name; sk.cat=cat; sk.fadeDays=fadeDays; sk.levels=levels; sk.parent=parent;
      if(sk.currentLevel>levels.length) sk.currentLevel=levels.length; }
    _skEditId=null; document.getElementById("skSave").textContent="Create skill"; toast("✎ Skill updated");
  } else {
    S.lifeSkills.push({id:id(),name,cat,parent,group:false,fadeDays,currentLevel:0,lastQuestTs:Date.now(),peakLevel:0,levels,history:[]});
    toast("🧠 Skill added");
  }
  _skLevels=["",""];
  document.getElementById("skName").value=""; document.getElementById("skParent").value="";
  save();render();
}
function skEdit(skId){
  const sk=S.lifeSkills.find(x=>x.id===skId); if(!sk) return;
  document.getElementById("skName").value=sk.name||"";
  document.getElementById("skCat").value=sk.cat||"personal";
  document.getElementById("skFade").value=String(sk.fadeDays||30);
  _skLevels=sk.levels.map(l=>l.ability);
  if(!_skLevels.length) _skLevels=[""];
  renderSkLevelInputs();
  _skEditId=skId; document.getElementById("skSave").textContent="Save changes";
  document.getElementById("skName").scrollIntoView({behavior:"smooth",block:"center"}); document.getElementById("skName").focus();
}
// effective level after decay: drop 1 level per fade interval missed
// ----- hierarchy helpers -----
function skSubsOf(sk){ return S.lifeSkills.filter(x=>x.parent===sk.name && x.cat===sk.cat); }
function skTopLevelInCat(cat){ return S.lifeSkills.filter(x=>x.cat===cat && !x.parent); }
// rolled-up *effective* level as a decimal. Leaf = its own effective level.
// Group skill = average of its sub-skills' rolled levels. (recursive)
function skRolledLevel(sk){
  const subs=skSubsOf(sk);
  if(subs.length){
    const avg=subs.reduce((s,x)=>s+skRolledLevel(x),0)/subs.length;
    return avg;
  }
  return skEffectiveLevel(sk);
}
// a category's rolled level = average of its top-level skills' rolled levels
function catRolledLevel(cat){
  const tops=skTopLevelInCat(cat);
  if(!tops.length) return 0;
  return tops.reduce((s,x)=>s+skRolledLevel(x),0)/tops.length;
}
function fmtLvl(n){ return (Math.round(n*10)/10).toFixed(1); }

function skEffectiveLevel(sk){
  if(sk.currentLevel<=0) return 0;
  const elapsed=Date.now()-(sk.lastQuestTs||Date.now());
  const intervals=Math.floor(elapsed/(sk.fadeDays*864e5));
  // a started skill never decays below level 1 — it can be reverted but never lost
  return Math.max(1, sk.currentLevel - intervals);
}
// keep peakLevel = highest level ever held (current or effective, whichever is higher seen)
function skUpdatePeak(sk){
  if(sk.peakLevel===undefined) sk.peakLevel=0;
  if(sk.currentLevel>sk.peakLevel) sk.peakLevel=sk.currentLevel;
  return sk.peakLevel;
}
function skDaysLeft(sk){
  if(sk.currentLevel<=0) return null;
  const next=(sk.lastQuestTs||Date.now())+sk.fadeDays*864e5;
  return Math.ceil((next-Date.now())/864e5);
}
// generate the active quest for a skill: maintain current, reclaim decayed, or promote
function skQuest(sk){
  const eff=skEffectiveLevel(sk);
  if(eff<sk.currentLevel){ // decayed — must re-prove the level just lost
    const lvl=sk.levels[eff]; // the level to reclaim (0-indexed -> level eff+1)
    return {type:"decay", level:eff+1, ability:lvl?lvl.ability:"", label:"Reclaim"};
  }
  if(sk.currentLevel<sk.levels.length){ // can promote
    const lvl=sk.levels[sk.currentLevel];
    return {type:"promote", level:sk.currentLevel+1, ability:lvl.ability, label:"Promotion test"};
  }
  // at max — maintenance only
  const lvl=sk.levels[sk.currentLevel-1];
  const days=skDaysLeft(sk);
  if(days!==null && days<=Math.ceil(sk.fadeDays*0.34)){
    return {type:"maintain", level:sk.currentLevel, ability:lvl.ability, label:"Maintain"};
  }
  return null; // fresh & maxed — no quest needed right now
}
function skPass(skId){
  const sk=S.lifeSkills.find(x=>x.id===skId); if(!sk) return;
  const q=skQuest(sk); if(!q) return;
  const eff=skEffectiveLevel(sk);
  if(q.type==="decay"){ sk.currentLevel=eff+1; }
  else if(q.type==="promote"){ sk.currentLevel=Math.min(sk.levels.length, sk.currentLevel+1); }
  skUpdatePeak(sk);
  // maintain just refreshes the timer
  sk.lastQuestTs=Date.now();
  sk.history.push({ts:Date.now(),type:q.type,level:q.level});
  // skill growth feeds the Knowledge track lightly (earned, not gamifying the skill itself)
  if(!S.skills.knowledge)S.skills.knowledge={xp:0}; S.skills.knowledge.xp+=15;
  save();render();
  toast(q.type==="promote"?`⬆️ Promoted to Level ${sk.currentLevel} — ${esc(sk.name)}`:q.type==="decay"?`Reclaimed Level ${sk.currentLevel}`:`Maintained — ${esc(sk.name)}`);
}
// Mark that you've reached a specific level on a skill, by tapping that rung in its card.
// This is the embedded, per-skill version of the old promotion quest: the rung IS the button.
function skReachLevel(skId, level){
  const sk=S.lifeSkills.find(x=>x.id===skId); if(!sk) return;
  if(sk.auto){ toast("This skill levels automatically from your measured results."); return; }
  const max=sk.levels.length;
  level=Math.max(1, Math.min(max, level|0));
  const eff=skEffectiveLevel(sk);
  // tapping a rung at or below your current effective level = no-op (already have it)
  if(level<=eff){ return; }
  const prevType = (eff<sk.currentLevel) ? "decay" : "promote";
  sk.currentLevel=level;
  skUpdatePeak(sk);
  sk.lastQuestTs=Date.now();
  sk.history.push({ts:Date.now(),type:prevType,level});
  if(!S.skills.knowledge)S.skills.knowledge={xp:0}; S.skills.knowledge.xp+=15;
  save();render();
  if(typeof getTierLabelForLevel==="function"){
    const tierLabel=getTierLabelForLevel(sk,level);
    toast(`🏺 <b>${esc(tierLabel)}</b> carved — ${esc(sk.name)} L${level}`);
  } else {
    toast(`✓ Reached Level ${level} — ${esc(sk.name)}`);
  }
}
function skSkip(skId){
  const sk=S.lifeSkills.find(x=>x.id===skId); if(!sk) return;
  // skipping a maintenance just dismisses it until next interval; decay still applies naturally
  toast("Left for later — the skill will keep fading until you prove it");
}
// "Work on this" — route a skill to the right trainer/plan/protocol
function skWorkGuidance(sk){
  if(!sk) return "";
  const go=(tab,label)=>`<button class="sk-work-go" data-gototab="${tab}">${label} →</button>`;
  // cognitive skills with a test trainer
  const testMap={"Reaction speed":"reaction","Cognitive / processing speed":"procspeed","Working memory (n-back)":"nback","Memory span":"digitspan","Attention / sustained focus":"gonogo","Mental math":"mathsprint","Pattern recognition":"patterns","Typing speed & accuracy":"typing"};
  if(testMap[sk.name]) return `<div class="sk-work-body">Train this directly in the Test tab — run the <b>${esc(sk.name)}</b> test, and your level updates from the result.${go("test","Open Test tab")}</div>`;
  if(sk.name==="Memory technique") return `<div class="sk-work-body">Use the <b>Memory Track</b> in the Test tab: build a memory palace and run spaced-repetition decks. Practicing either keeps this skill sharp.${go("test","Open Memory Track")}</div>`;
  if(sk.name==="ROTC knowledge (quizzes)") return `<div class="sk-work-body">Pass quiz banks in the Quiz tab — each one you pass raises this skill. Build a study plan there for any graded test.${go("quizzes","Open Quiz tab")}</div>`;
  if(sk.cat==="academic") return `<div class="sk-work-body">Study with active recall and spacing: make a spaced-repetition deck in the Test tab's Memory Track, and build a study plan in the Quiz tab if you have a graded test coming.${go("test","Memory Track")} ${go("quizzes","Study plans")}</div>`;
  if(sk.cat==="cognitive") return `<div class="sk-work-body">Practice in the Test tab — pick the closest trainer and run it regularly.${go("test","Open Test tab")}</div>`;
  if(sk.cat==="physiological"){
    if(sk.name==="Resting heart rate") return `<div class="sk-work-body">This improves with cardio over time. Log your resting pulse in Profile → Vitals to track it; lower over months = fitter.${go("profile","Log vitals")}</div>`;
    return `<div class="sk-work-body">${esc(sk.whatYouDo||"Practice the self-test described above regularly and log your progress.")}</div>`;
  }
  if(sk.cat==="physical") return `<div class="sk-work-body">Train this in your PT sessions — the FM tab tells you what to prioritize, and logging workouts in the Log tab keeps the skill from fading.${go("plan","Open FM plan")} ${go("log","Log a workout")}</div>`;
  // generic practice protocol
  return `<div class="sk-work-body"><b>Practice protocol:</b> ${esc(sk.whatYouDo||"Find a real situation to practice the next level's ability, do it deliberately, then mark the level reached on its rung when you can do it reliably.")} When you can perform the next level reliably, tap that level's rung above to mark it.</div>`;
}
// ============ THE TREE VIEW — a living branching diagram of the whole skill tree ============
// Trunk = the cadet. Limbs = Paths. Boughs = sub-path branches. Leaves = skills.
// A leaf's colour runs from faded (low/decayed) to bright jade (mastered); its size grows with peak.
// This is the project's symbolism made literal: one tree, tended over a career.
function skLeafColor(eff, max){
  if(eff<=0) return "#3a4030";                 // unproven — bare twig
  const t=Math.max(0,Math.min(1,(eff-1)/(Math.max(1,max)-1)));
  // interpolate ember (low) -> gold (mid) -> jade (high)
  const lerp=(a,b,f)=>Math.round(a+(b-a)*f);
  let r,g,bl;
  if(t<0.5){ const f=t/0.5; r=lerp(0xc8,0xb8,f); g=lerp(0x77,0xa0,f); bl=lerp(0x2e,0x6a,f); }
  else { const f=(t-0.5)/0.5; r=lerp(0xb8,0x6f,f); g=lerp(0xa0,0x9e,f); bl=lerp(0x6a,0x54,f); }
  return `rgb(${r},${g},${bl})`;
}
