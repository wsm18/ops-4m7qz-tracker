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
  const joker=!!(document.getElementById("skJoker")||{}).checked;
  if(_skEditId){
    const sk=S.lifeSkills.find(x=>x.id===_skEditId);
    if(sk){ sk.name=name; sk.cat=cat; sk.fadeDays=fadeDays; sk.levels=levels; sk.parent=parent; sk.joker=joker||undefined;
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
  const jEl=document.getElementById("skJoker"); if(jEl) jEl.checked=!!sk.joker;
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
// Rarity tier — explicit `rarity` field on seed takes priority; falls back to level-count inference
const _RARITY_MAP={
  common:    {name:"Common",   col:"#757575",light:"#f5f5f5",sym:"♠",border:"#9e9e9e"},
  uncommon:  {name:"Uncommon", col:"#2e7d32",light:"#e8f5e9",sym:"♣",border:"#4caf50"},
  rare:      {name:"Rare",     col:"#1565c0",light:"#e3f2fd",sym:"♦",border:"#42a5f5"},
  legendary: {name:"Legendary",col:"#6a1b9a",light:"#f3e5f5",sym:"♥",border:"#ab47bc"},
  mythic:    {name:"Mythic",   col:"#b8860b",light:"#fffde7",sym:"✦",border:"#ffd700"},
};
function skRarity(sk){
  if(sk.joker||sk.auto) return {name:"Joker",col:"#c62828",light:"#fff0f0",sym:"🃏",border:"#ef5350"};
  // Explicit rarity on the live skill object (rare — only set if manually copied)
  if(sk.rarity&&_RARITY_MAP[sk.rarity.toLowerCase()]) return _RARITY_MAP[sk.rarity.toLowerCase()];
  // Explicit rarity on the seed — live skill objects don't copy rarity, so check the seed
  const _seed=typeof skSeedOf==="function"?skSeedOf(sk.name,sk.cat):null;
  if(_seed&&_seed.rarity&&_RARITY_MAP[_seed.rarity.toLowerCase()]) return _RARITY_MAP[_seed.rarity.toLowerCase()];
  // Level-count fallback — filter empty-string levels so padded ladders don't over-count
  const _lvls=sk.levels||[];
  const n=_lvls.filter(l=>typeof l==="object"?!!(l.ability):!!l).length||_lvls.length;
  if(n<=4) return _RARITY_MAP.common;
  if(n<=7) return _RARITY_MAP.uncommon;
  if(n<=10) return _RARITY_MAP.rare;
  if(n<=13) return _RARITY_MAP.legendary;
  return _RARITY_MAP.mythic;
}
// ── Pyramid / Set mechanics ──────────────────────────────────────────────────
// Look up a SEED_SKILLS entry by name+cat (for reading pyramid fields at runtime).
// Indexed once (O(1) per lookup) rather than SEED_SKILLS.find() (O(n)) — matters
// once SEED_SKILLS runs into the thousands of entries.
let _skSeedIndex=null;
function skSeedIndex(){
  if(_skSeedIndex) return _skSeedIndex;
  _skSeedIndex=new Map();
  if(typeof SEED_SKILLS!=="undefined") SEED_SKILLS.forEach(s=>{
    const k=s.name+"|"+s.cat;
    if(!_skSeedIndex.has(k)) _skSeedIndex.set(k,s); // first match wins, same as the old .find()
  });
  return _skSeedIndex;
}
function skSeedOf(name, cat){
  return skSeedIndex().get(name+"|"+cat)||null;
}
// ── Live-skill hydration ─────────────────────────────────────────────────────
// A seeded skill's guidance text (why/whatYouDo/howTo/prep/recover/safety/roadmap/
// advance/maintain/tiers) and level-ladder strings are static content that already
// lives in SEED_SKILLS. Storing a full copy of it on every user's live save doesn't
// scale — it's what pushed localStorage past its browser quota once the skill count
// crossed ~2,500. Instead of persisting that text, skHydrate() attaches non-enumerable
// getters that resolve it from SEED_SKILLS at read time:
//  - every existing `sk.why` / `sk.levels` / etc. read site keeps working unchanged
//    (property access behaves identically whether it's a plain value or a getter)
//  - JSON.stringify(S) (localStorage save, cloud backup) automatically skips
//    non-enumerable properties, so the text is never re-duplicated into storage
//  - it self-heals old saves: the first time a bloated pre-refactor save loads, the
//    literal fields are deleted and replaced with getters, shrinking it immediately
// Custom (non-seeded) skills have no seed to defer to, so they keep their own
// literal `levels` (the user's own ladder) — hydration is a no-op for them.
const _SK_GUIDANCE_FIELDS=["why","whatYouDo","howTo","prep","recover","safety","roadmap","advance","maintain","tiers"];
// Returns true if it stripped at least one legacy literal field (i.e. this object came
// from a pre-refactor save and just shrank) — callers use this to force a save() even
// when nothing else about the skill changed, since that's the whole point: get the
// bloat out of localStorage on the very next load, not whenever some other edit happens to.
function skHydrate(sk){
  if(!sk||!sk.seeded) return false;
  const seed=skSeedOf(sk.name,sk.cat);
  if(!seed) return false; // orphaned seeded skill (renamed/removed from SEED_SKILLS) — leave as-is
  let stripped=false;
  _SK_GUIDANCE_FIELDS.forEach(f=>{
    const desc=Object.getOwnPropertyDescriptor(sk,f);
    if(desc&&desc.get) return; // already hydrated
    if(desc) stripped=true;
    delete sk[f];
    Object.defineProperty(sk,f,{get(){ return seed[f]!=null?seed[f]:null; }, enumerable:false, configurable:true});
  });
  const lvlDesc=Object.getOwnPropertyDescriptor(sk,"levels");
  if(!(lvlDesc&&lvlDesc.get)){
    if(lvlDesc) stripped=true;
    delete sk.levels;
    Object.defineProperty(sk,"levels",{
      get(){ return (seed.levels||[]).map((l,i)=>({n:i+1, ability:typeof l==="string"?l:l.ability})); },
      enumerable:false, configurable:true
    });
  }
  return stripped;
}
function skHydrateAll(list){
  let strippedAny=false;
  (list||[]).forEach(sk=>{ if(skHydrate(sk)) strippedAny=true; });
  return strippedAny;
}
// All SEED_SKILLS belonging to a set (by setKey), excluding group entries
function skSetMembers(setKey){
  if(!setKey||typeof SEED_SKILLS==="undefined") return [];
  return SEED_SKILLS.filter(s=>s.setKey===setKey&&!s.group);
}
// How many of a set are fully mastered (currentLevel >= levels.length) in S.lifeSkills
function skSetMasteredCount(setKey){
  const members=skSetMembers(setKey);
  return members.filter(m=>{
    const live=(S.lifeSkills||[]).find(s=>s.name===m.name&&s.cat===m.cat);
    return live&&(live.levels||[]).length>0&&live.currentLevel>=(live.levels||[]).length;
  }).length;
}
// True when all 5 (or all present) members of a set are fully mastered
function skSetCanCombine(setKey){
  const members=skSetMembers(setKey);
  return members.length>=2&&skSetMasteredCount(setKey)>=members.length;
}
// Trigger synthesis: mark the skill whose synthesizedFrom===setKey as synthesisUnlocked
function skCombineSet(setKey){
  if(!skSetCanCombine(setKey)) return false;
  const synthSeed=(typeof SEED_SKILLS!=="undefined"?SEED_SKILLS:[]).find(s=>s.synthesizedFrom===setKey);
  if(!synthSeed) return false;
  const live=(S.lifeSkills||[]).find(s=>s.name===synthSeed.name&&s.cat===synthSeed.cat);
  if(!live) return false;
  live.synthesisUnlocked=true;
  save(); render();
  toast(`⚡ Synthesis complete — <b>${esc(synthSeed.name)}</b> is now active!`);
  return true;
}
// Every synthesis-target skill whose set is fully mastered but not yet combined —
// the "ready to combine" list the Focus strip surfaces so a completed set doesn't
// sit unnoticed behind a face-down card the user has to stumble onto.
function skReadyToCombine(){
  if(typeof SEED_SKILLS==="undefined") return [];
  const seen=new Set(), ready=[];
  SEED_SKILLS.forEach(seed=>{
    if(!seed.synthesizedFrom||seen.has(seed.synthesizedFrom)) return;
    seen.add(seed.synthesizedFrom);
    if(!skSetCanCombine(seed.synthesizedFrom)) return;
    const live=(S.lifeSkills||[]).find(s=>s.name===seed.name&&s.cat===seed.cat);
    if(live&&(live.synthesisUnlocked||live.currentLevel>0)) return; // already combined/started
    ready.push(seed);
  });
  return ready;
}
// Pure structural walk of a category's pyramid tree(s), straight from SEED_SKILLS —
// no live-state dependency, so it's safe to memoize (SEED_SKILLS never changes at
// runtime). A category can hold more than one Mythic tree (e.g. a legacy tree plus
// a later second-gen one); this returns every one, not just the first.
// Shape: [{mythic, legendaries:[{legendary, rares:[{rare, uncommons:[{uncommon, commonSetKey}]}]}]}]
let _skPyramidTreeCache={};
function skPyramidTrees(cat){
  if(_skPyramidTreeCache[cat]) return _skPyramidTreeCache[cat];
  if(typeof SEED_SKILLS==="undefined") return [];
  const seeds=SEED_SKILLS.filter(s=>s.cat===cat&&!s.group);
  const bySetKey={};
  seeds.forEach(s=>{ if(s.setKey) (bySetKey[s.setKey]=bySetKey[s.setKey]||[]).push(s); });
  const mythics=seeds.filter(s=>skRarity(s).name==="Mythic"&&s.synthesizedFrom);
  const trees=mythics.map(mythic=>{
    const legendaries=(bySetKey[mythic.synthesizedFrom]||[]).map(legendary=>{
      const rares=(bySetKey[legendary.synthesizedFrom]||[]).map(rare=>{
        const uncommons=(bySetKey[rare.synthesizedFrom]||[]).map(uncommon=>({
          uncommon, commonSetKey:uncommon.synthesizedFrom
        }));
        return {rare, uncommons};
      });
      return {legendary, rares};
    });
    return {mythic, legendaries};
  });
  _skPyramidTreeCache[cat]=trees;
  return trees;
}
// Fraction (0-1) of all pyramid-tree skills in a category that are fully mastered —
// drives the tree view's per-world insignia brightness. A category can hold more
// than one Mythic tree (e.g. a legacy tree plus a later second-gen one); this counts
// every pyramid-tagged card across all of them, not just one tree.
function catPyramidCompletion(cat){
  if(typeof SEED_SKILLS==="undefined") return 0;
  const pyramidSeeds=SEED_SKILLS.filter(s=>s.cat===cat&&!s.group&&(s.setKey||s.synthesizedFrom));
  if(!pyramidSeeds.length) return 0;
  const getLive=(name)=>(S.lifeSkills||[]).find(s=>s.name===name&&s.cat===cat);
  const maxedCount=pyramidSeeds.filter(s=>{
    const live=getLive(s.name);
    return live&&live.levels&&live.currentLevel>=live.levels.length;
  }).length;
  return maxedCount/pyramidSeeds.length;
}
// Fraction (0-1) of how far along a whole Path is — sum of every leaf's effective
// level over the sum of every leaf's max level. Unlike catPyramidCompletion (which
// only credits a skill once fully mastered), this moves with any partial progress,
// so it's what the tree view uses to light up a world: a Path with a few skills at
// L2 reads as dimly lit, not unlit.
function catProgressFraction(cat){
  const leaves=(S.lifeSkills||[]).filter(s=>s.cat===cat&&!s.group&&s.levels&&s.levels.length);
  if(!leaves.length) return 0;
  let sumEff=0, sumMax=0;
  leaves.forEach(s=>{ sumEff+=skEffectiveLevel(s); sumMax+=s.levels.length; });
  return sumMax>0 ? sumEff/sumMax : 0;
}
// ── Synergy combos — complementary pairs that unlock ⚡ indicator at L4+ ───
const SYNERGY_PAIRS=[
  ["2-mile run","Rucking"],
  ["Marksmanship (M4)","Land navigation"],
  ["Leadership presence","Decision-making under pressure"],
  ["Push-ups / muscular endurance","Deadlift"],
  ["Deadlift","Rucking"],
  ["Swimming","Combat water survival"],
  ["ROTC knowledge (quizzes)","Land navigation"],
  ["Critical thinking","Decision-making under pressure"],
  ["Sleep quality","Resting heart rate"],
  ["Compound lifting mastery","Strength programming & periodization"],
  ["Running mastery","Aerobic base development"],
  ["Combatives foundation","Combat water survival"],
  ["Rucking mastery","Field endurance"],
  ["Mental toughness training","Field endurance"],
  ["Joint mobility","Injury prevention & prehab"],
];
// Returns the synergy partner's name if sk is at L4+ and its partner is also L4+, else null
function skHasSynergy(sk){
  if(!sk||sk.currentLevel<4) return null;
  for(const pair of SYNERGY_PAIRS){
    const otherName=pair[0]===sk.name?pair[1]:pair[1]===sk.name?pair[0]:null;
    if(!otherName) continue;
    const other=(S.lifeSkills||[]).find(s=>s.name===otherName&&s.currentLevel>=4);
    if(other) return otherName;
  }
  return null;
}

function skEffectiveLevel(sk){
  if(sk.currentLevel<=0) return 0;
  const elapsed=Date.now()-(sk.lastQuestTs||Date.now());
  const fd=sk.fadeDays||30;
  // 20% grace buffer: a skill doesn't drop the instant fadeDays elapses
  const grace=fd*0.2;
  const intervals=Math.floor(elapsed/((fd+grace)*864e5));
  // a started skill never decays below level 1 — it can be reverted but never lost
  return Math.max(1, sk.currentLevel - intervals);
}
// "current" = within fadeDays, "at-risk" = in grace period (fadeDays to fadeDays+grace), "decayed" = dropped
function skFadeState(sk){
  if(sk.currentLevel<=0) return "current";
  const elapsed=Date.now()-(sk.lastQuestTs||Date.now());
  const fd=sk.fadeDays||30;
  const grace=fd*0.2;
  if(elapsed<fd*864e5) return "current";
  if(elapsed<(fd+grace)*864e5) return "at-risk";
  return "decayed";
}
// keep peakLevel = highest level ever held (current or effective, whichever is higher seen)
function skUpdatePeak(sk){
  if(sk.peakLevel===undefined) sk.peakLevel=0;
  if(sk.currentLevel>sk.peakLevel) sk.peakLevel=sk.currentLevel;
  return sk.peakLevel;
}
function skDaysLeft(sk){
  if(sk.currentLevel<=0) return null;
  const fd=sk.fadeDays||30;
  const grace=fd*0.2;
  // returns days until the skill actually drops (after the grace buffer)
  const next=(sk.lastQuestTs||Date.now())+(fd+grace)*864e5;
  return Math.ceil((next-Date.now())/864e5);
}
// ===== X-SmartFocus: whole-tree leverage recommender (idea B) =====
// Surfaces the single highest-leverage already-started skill to re-engage
// right now. Distinct from Today's Hand's random daily draw (today.js) and
// from getWarriorsFocus()'s single "next action" decay check (today.js) —
// this is a whole-tree SCORED ranking, not a random sample or a first-match
// pick, weighted toward Cyber-branch commissioning relevance.
//
// Two deliberate, honest scoping choices, confirmed with Wyatt before
// building:
// - Path weight is a plain, visible multiplier (1.5x War/Craft/Knowledge/
//   Command — tactical/technical/academic/leadership — vs. 1.0x for the
//   other six Paths), not a hidden black-box score.
// - "Opportunity" is peakLevel - effectiveLevel (a real, already-tracked
//   number), not "how close to the next level." The app has no way to
//   measure fractional progress toward an unearned level (levels are
//   earned via real benchmarks, not a continuous XP bar), so inventing
//   that number would be a faked metric. Practically, this means the gap
//   is usually 0 until a skill has actually decayed (currentLevel only
//   moves down for a couple of explicitly read-only auto-skills — see
//   CLAUDE.md's weight:integrity note — decay itself is a computed, not
//   stored, drop) — so the recommender only ever surfaces skills you've
//   already started and either let slip or are about to. Fresh discovery
//   is Today's Hand's job, not this one's.
const SMARTFOCUS_PATH_WEIGHT={tactical:1.5, technical:1.5, academic:1.5, leadership:1.5};
function smartFocusPathWeight(cat){ return SMARTFOCUS_PATH_WEIGHT[cat]||1.0; }
function computeSmartFocus(){
  const skills=(S.lifeSkills||[]).filter(s=>!s.group && s.currentLevel>0 && s.levels && s.levels.length);
  let best=null, bestScore=0;
  skills.forEach(sk=>{
    const eff=skEffectiveLevel(sk);
    const peak=Math.max(sk.peakLevel||0, sk.currentLevel||0);
    const state=skFadeState(sk);
    const daysLeft=skDaysLeft(sk);
    let urgency=0;
    if(state==="at-risk" && daysLeft!=null){
      const fd=sk.fadeDays||30, grace=fd*0.2;
      urgency = grace>0 ? Math.max(0, Math.min(1, (grace-Math.max(0,daysLeft))/grace)) : 0;
    }
    const opportunity=Math.max(0, peak-eff);
    const raw=urgency+opportunity;
    if(raw<=0) return;
    const score=raw*smartFocusPathWeight(sk.cat);
    if(score>bestScore){ bestScore=score; best={sk, eff, peak, urgency, opportunity, daysLeft}; }
  });
  if(!best) return null;
  const pm=(typeof PATH_META!=="undefined"&&PATH_META[best.sk.cat])||{name:best.sk.cat, icon:"🌳", color:"var(--gold)"};
  let why;
  if(best.opportunity>0 && best.urgency>0){
    why=`down to level ${best.eff} (peak ${best.peak}) and ${best.daysLeft} day${best.daysLeft!==1?'s':''} from slipping further`;
  } else if(best.opportunity>0){
    why=`down to level ${best.eff} — ${best.opportunity} below your peak of ${best.peak}. One practice tap reclaims it.`;
  } else {
    why=`${best.daysLeft} day${best.daysLeft!==1?'s':''} from decaying past its grace period`;
  }
  return {sk:best.sk, path:pm, why};
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
  // skill growth feeds the Academic path lightly (earned, not gamifying the skill itself)
  if(!S.pathXP) S.pathXP={}; S.pathXP.academic=(S.pathXP.academic||0)+15;
  save();render();
  toast(q.type==="promote"?`⬆️ Promoted to Level ${sk.currentLevel} — ${esc(sk.name)}`:q.type==="decay"?`Reclaimed Level ${sk.currentLevel}`:`Maintained — ${esc(sk.name)}`);
}
// Mark that you've reached a specific level on a skill, by tapping that rung in its card.
// This is the embedded, per-skill version of the old promotion quest: the rung IS the button.
function skReachLevel(skId, level, note){
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
  const entry={ts:Date.now(),type:prevType,level};
  if(note&&note.trim()) entry.note=note.trim();
  sk.history.push(entry);
  if(!S.pathXP) S.pathXP={}; S.pathXP.academic=(S.pathXP.academic||0)+15;
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
// Reset the fade timer for a skill practiced outside the app — no level change.
// For skills that can't be tested in-app (land nav, swimming, etc.) but were genuinely practiced.
function skPractice(skId){
  const sk=S.lifeSkills.find(x=>x.id===skId); if(!sk) return;
  if(sk.auto){ toast("This skill levels automatically from measured results — it can't be manually refreshed."); return; }
  if(sk.currentLevel<=0){ toast("Tap a rung first to set your level, then use Practiced to maintain it."); return; }
  sk.lastQuestTs=Date.now();
  save();render();
  toast(`✓ Practiced — ${esc(sk.name)} fade timer reset`);
}
// Count consecutive calendar days with at least one history entry going backward from today.
function skStreak(sk){
  if(!sk.history||!sk.history.length) return 0;
  const days=new Set(sk.history.map(h=>new Date(h.ts).toISOString().slice(0,10)));
  let streak=0, d=new Date();
  d.setHours(12,0,0,0);
  while(days.has(d.toISOString().slice(0,10))){ streak++; d.setDate(d.getDate()-1); }
  return streak;
}
// "Work on this" — route a skill to the right trainer/plan/protocol
function skTrendSparkline(sk){
  if(!sk.history||sk.history.length<2) return '';
  const now=Date.now(); const day=86400000; const days=30;
  const pts=[];
  for(let d=days-1;d>=0;d--){
    const ts=now-d*day;
    const entries=sk.history.filter(h=>h.ts<=ts);
    pts.push(entries.length?(entries[entries.length-1].level||0):0);
  }
  if(pts.every(p=>p===pts[0])) return '';
  return typeof miniSparkline==="function"?miniSparkline(pts,220,28):'';
}
function skWorkGuidance(sk){
  if(!sk) return "";
  const go=(tab,label)=>`<button class="sk-work-go" data-gototab="${tab}">${label} →</button>`;
  const maxLv=(sk.levels||[]).length||1;
  const eff=typeof skEffectiveLevel==="function"?skEffectiveLevel(sk):sk.currentLevel;
  const nextLvl=eff+1;
  const placeholder=sk.advance&&sk.advance[nextLvl-1]?sk.advance[nextLvl-1]:"What did you practice? Add a brief note for your own record.";
  const noteInput=!sk.auto?`<div class="sk-note-wrap"><label class="sk-tgt-set-label">Practice note (optional — saved with next level-up)<textarea class="sk-note-input" data-sknote="${sk.id}" rows="2" placeholder="${esc(placeholder)}" maxlength="300"></textarea></label></div>`:"";
  const tgtInput=`<div class="sk-tgt-set"><label class="sk-tgt-set-label">Target level (optional)<input type="number" class="sk-tgt-inp-work" data-sktgtlv="${sk.id}" min="1" max="${maxLv}" value="${sk.targetLevel||''}"></label></div>`;
  const _spark=skTrendSparkline(sk);
  const tgtBlock=tgtInput+(_spark?`<div class="sk-trend-wrap"><span class="sk-trend-label">30-day</span>${_spark}</div>`:'');
  // cognitive skills with a test trainer
  const testMap={"Reaction speed":"reaction","Cognitive / processing speed":"procspeed","Working memory (n-back)":"nback","Memory span":"digitspan","Attention / sustained focus":"gonogo","Mental math":"mathsprint","Pattern recognition":"patterns","Typing speed & accuracy":"typing"};
  if(testMap[sk.name]) return `<div class="sk-work-body">Train this directly in the Test tab — run the <b>${esc(sk.name)}</b> test, and your level updates from the result.${go("test","Open Test tab")}</div>${noteInput}${tgtBlock}`;
  if(sk.name==="Memory technique") return `<div class="sk-work-body">Use the <b>Memory Track</b> in the Test tab: build a memory palace and run spaced-repetition decks. Practicing either keeps this skill sharp.${go("test","Open Memory Track")}</div>${noteInput}${tgtBlock}`;
  if(sk.name==="ROTC knowledge (quizzes)") return `<div class="sk-work-body">Pass quiz banks in the Quiz tab — each one you pass raises this skill. Build a study plan there for any graded test.${go("quizzes","Open Quiz tab")}</div>${noteInput}${tgtBlock}`;
  if(sk.cat==="academic") return `<div class="sk-work-body">Study with active recall and spacing: make a spaced-repetition deck in the Test tab's Memory Track, and build a study plan in the Quiz tab if you have a graded test coming.${go("test","Memory Track")} ${go("quizzes","Study plans")}</div>${noteInput}${tgtBlock}`;
  if(sk.cat==="cognitive") return `<div class="sk-work-body">Practice in the Test tab — pick the closest trainer and run it regularly.${go("test","Open Test tab")}</div>${noteInput}${tgtBlock}`;
  if(sk.cat==="physiological"){
    if(sk.name==="Resting heart rate") return `<div class="sk-work-body">This improves with cardio over time. Log your resting pulse in Profile → Vitals to track it; lower over months = fitter.${go("profile","Log vitals")}</div>${noteInput}${tgtBlock}`;
    return `<div class="sk-work-body">${esc(sk.whatYouDo||"Practice the self-test described above regularly and log your progress.")}</div>${noteInput}${tgtBlock}`;
  }
  if(sk.cat==="physical") return `<div class="sk-work-body">Train this in your PT sessions — the FM tab tells you what to prioritize, and logging workouts in the Log tab keeps the skill from fading.${go("plan","Open FM plan")} ${go("log","Log a workout")}</div>${noteInput}${tgtBlock}`;
  // generic practice protocol
  return `<div class="sk-work-body"><b>Practice protocol:</b> ${esc(sk.whatYouDo||"Find a real situation to practice the next level's ability, do it deliberately, then mark the level reached on its rung when you can do it reliably.")} When you can perform the next level reliably, tap that level's rung above to mark it.</div>${tgtBlock}`;
}
// ============ THE TREE VIEW — a living branching diagram of the whole skill tree ============
// Trunk = the cadet. Limbs = Paths. Boughs = sub-path branches. Leaves = skills.
// A leaf's colour runs from faded (low/decayed) to bright jade (mastered); its size grows with peak.
// This is the project's symbolism made literal: one tree, tended over a career.
// optional sk param: if provided and in at-risk grace period, show amber instead of normal color
function skLeafColor(eff, max, sk){
  if(eff<=0) return "#3a4030";                 // unproven — bare twig
  if(sk && typeof skFadeState==="function" && skFadeState(sk)==="at-risk") return "rgb(204,138,45)"; // amber — in grace period
  const t=Math.max(0,Math.min(1,(eff-1)/(Math.max(1,max)-1)));
  // interpolate ember (low) -> gold (mid) -> jade (high)
  const lerp=(a,b,f)=>Math.round(a+(b-a)*f);
  let r,g,bl;
  if(t<0.5){ const f=t/0.5; r=lerp(0xc8,0xb8,f); g=lerp(0x77,0xa0,f); bl=lerp(0x2e,0x6a,f); }
  else { const f=(t-0.5)/0.5; r=lerp(0xb8,0x6f,f); g=lerp(0xa0,0x9e,f); bl=lerp(0x6a,0x54,f); }
  return `rgb(${r},${g},${bl})`;
}
