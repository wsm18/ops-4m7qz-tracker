const SKILL_LADDER_VER=96;
// Returns the user's current ROTC/Army career stage based on S.rank.
function careerStage(){
  const r=((S.profile&&S.profile.rank)||S.rank||"").toUpperCase();
  if(r.includes("MS1")) return "MS1";
  if(r.includes("MS2")) return "MS2";
  if(r.includes("MS3")) return "MS3";
  if(r.includes("LDAC")) return "LDAC";
  if(r.includes("MS4")) return "MS4";
  if(r.includes("O1")||r.includes("2LT")||r.includes("1LT")||r.includes("COMMISSION")) return "O1";
  return "MS2"; // sensible default for a cadet
}
// onto existing seeded skills. Never touches level/history/peak.
function mergeNewSeedSkills(){
  let changed=false;
  // A save from an older version may carry stale, shorter ladders that would otherwise
  // shadow the current seed. If its ladder version is behind, we force a full resync of
  // every skill's ladder content below (progress numbers are always preserved).
  const ladderStale = (S._skillLadderVer||0) < SKILL_LADDER_VER;
  // ---- RENAME MERGES: skills that were renamed in later versions. An old save still
  // carries the OLD name as an orphaned duplicate sitting next to the new-named skill.
  // For each {from->to}, carry the higher progress (level/peak/history) onto the new
  // skill so nothing is lost, then remove the orphan. (This is what was leaving a
  // stale 6-level "Push-ups" beside the current "Push-ups in 2 minutes".)
  const RENAMES=[
    {from:"Push-ups", to:"Push-ups in 2 minutes"},
    {from:"Pull-ups", to:"Pull-ups (max strict / weighted)"}
  ];
  RENAMES.forEach(r=>{
    const oldSk=S.lifeSkills.find(s=>s.name===r.from);
    if(!oldSk) return;
    const newSk=S.lifeSkills.find(s=>s.name===r.to);
    if(newSk){
      // carry over the higher progress so a rename never costs the user a level
      if((oldSk.currentLevel||0)>(newSk.currentLevel||0)){ newSk.currentLevel=oldSk.currentLevel; newSk.lastQuestTs=oldSk.lastQuestTs||newSk.lastQuestTs; }
      if((oldSk.peakLevel||0)>(newSk.peakLevel||0)){ newSk.peakLevel=oldSk.peakLevel; }
      if(Array.isArray(oldSk.history)&&oldSk.history.length){ newSk.history=(newSk.history||[]).concat(oldSk.history); }
      if((newSk.peakLevel||0)<(newSk.currentLevel||0)) newSk.peakLevel=newSk.currentLevel;
      S.lifeSkills=S.lifeSkills.filter(s=>s!==oldSk); changed=true;
    } else {
      // the new-named skill doesn't exist yet — just rename the old one in place
      oldSk.name=r.to; changed=true;
    }
  });
  // retire the old combined skill (v37) now that it's split into two. Only remove it if
  // it was never leveled, so we never silently delete real progress.
  const oldCombined=S.lifeSkills.find(s=>s.name==="Controlled force & composure");
  if(oldCombined && (oldCombined.currentLevel||0)<=0 && (oldCombined.peakLevel||0)<=0){
    S.lifeSkills=S.lifeSkills.filter(s=>s!==oldCombined); changed=true;
  }
  // Merge the duplicate physiological "Balance" into "Balance training" (Path of the Body),
  // carrying over the higher progress so nothing is lost, then remove the duplicate.
  const dupBal=S.lifeSkills.find(s=>s.name==="Balance" && s.cat==="physiological");
  if(dupBal){
    const keep=S.lifeSkills.find(s=>s.name==="Balance training");
    if(keep){
      if((dupBal.currentLevel||0)>(keep.currentLevel||0)){ keep.currentLevel=dupBal.currentLevel; keep.lastQuestTs=dupBal.lastQuestTs||keep.lastQuestTs; }
      if((dupBal.peakLevel||0)>(keep.peakLevel||0)){ keep.peakLevel=dupBal.peakLevel; }
    }
    S.lifeSkills=S.lifeSkills.filter(s=>s!==dupBal); changed=true;
  }
  const have=new Set(S.lifeSkills.map(s=>s.name));
  SEED_SKILLS.forEach(s=>{
    if(!have.has(s.name)){
      S.lifeSkills.push({
        id:id(), name:s.name, cat:s.cat, parent:s.parent||null, group:!!s.group,
        fadeDays:s.fadeDays, auto:s.auto||null,
        why:s.why||null, whatYouDo:s.whatYouDo||null, howTo:s.howTo||null, prep:s.prep||null, recover:s.recover||null, safety:s.safety||null,
        roadmap:s.roadmap||null, advance:s.advance||null, maintain:s.maintain||null, tiers:s.tiers||null,
        targetLevel:(s.targets&&s.targets[careerStage()]!=null?s.targets[careerStage()]:null),
        currentLevel:0, lastQuestTs:Date.now(), peakLevel:0,
        levels:(s.levels||[]).map((ability,i)=>({n:i+1,ability})), history:[], seeded:true
      });
      changed=true;
    } else if(s.why||s.whatYouDo||s.howTo||s.safety||s.prep||s.recover||s.roadmap||s.advance||s.maintain||s.levels){
      // backfill transparency copy + progression guidance onto an existing skill that lacks it
      const ex=S.lifeSkills.find(x=>x.name===s.name);
      if(ex){
        if((ex.why==null) && s.why){ ex.why=s.why; changed=true; }
        if((ex.whatYouDo==null) && s.whatYouDo){ ex.whatYouDo=s.whatYouDo; changed=true; }
        if((ex.howTo==null) && s.howTo){ ex.howTo=s.howTo; changed=true; }
        if((ex.safety==null) && s.safety){ ex.safety=s.safety; changed=true; }
        if((ex.prep==null) && s.prep){ ex.prep=s.prep; changed=true; }
        if((ex.recover==null) && s.recover){ ex.recover=s.recover; changed=true; }
        if((ex.roadmap==null) && s.roadmap){ ex.roadmap=s.roadmap; changed=true; }
        if((ex.advance==null) && s.advance){ ex.advance=s.advance; changed=true; }
        if((ex.maintain==null) && s.maintain){ ex.maintain=s.maintain; changed=true; }
        if((ex.tiers==null) && s.tiers){ ex.tiers=s.tiers; changed=true; }
        // Keep the ladder content in sync with the current seed (path length can change as
        // fields are refined or right-sized — grow OR shrink). User progress is stored as
        // numbers (currentLevel/peakLevel), so we preserve those and just clamp to the new length.
        if(s.levels && ex.levels){
          const seedAbilities=s.levels.map(l=>(typeof l==='string'?l:l.ability)).join("|");
          const exAbilities=ex.levels.map(l=>(l&&l.ability!=null)?l.ability:String(l)).join("|");
          if(ladderStale || seedAbilities!==exAbilities){
            ex.levels=s.levels.map((l,i)=>({n:i+1, ability:(typeof l==='string'?l:l.ability)}));
            changed=true;
          }
          const max=ex.levels.length;
          // RECOVER lost progress: an earlier version could have shrunk this ladder and
          // destructively clamped currentLevel/peakLevel down. Now that the ladder is the
          // correct (often longer) length again, restore the true high-water mark from the
          // skill's own history (every auto/manual level-up is recorded there).
          if(Array.isArray(ex.history) && ex.history.length){
            const histMax=ex.history.reduce((mx,h)=>Math.max(mx, (typeof h.level==='number'?h.level:0)), 0);
            if(histMax>(ex.peakLevel||0) && histMax<=max){ ex.peakLevel=histMax; changed=true; }
          }
          // peak can never be below the level you currently hold
          if((ex.peakLevel||0) < (ex.currentLevel||0)){ ex.peakLevel=ex.currentLevel; changed=true; }
          // only clamp DOWN when genuinely above the (real) ladder length
          if(ex.currentLevel>max){ ex.currentLevel=max; changed=true; }
          if(ex.peakLevel>max){ ex.peakLevel=max; changed=true; }
        }
        // Refresh roadmap/advance/maintain/tiers to the current seed when they differ
        // (or unconditionally when the saved ladder version is stale).
        if(s.roadmap && (ladderStale || JSON.stringify(ex.roadmap)!==JSON.stringify(s.roadmap))){ ex.roadmap=s.roadmap; changed=true; }
        if(s.advance && (ladderStale || JSON.stringify(ex.advance)!==JSON.stringify(s.advance))){ ex.advance=s.advance; changed=true; }
        if(s.maintain && (ladderStale || JSON.stringify(ex.maintain)!==JSON.stringify(s.maintain))){ ex.maintain=s.maintain; changed=true; }
        if(s.tiers && (ladderStale || JSON.stringify(ex.tiers)!==JSON.stringify(s.tiers))){ ex.tiers=s.tiers; changed=true; }
        // Backfill targets from seed (never overwrite user's manual target)
        if(s.targets && ex.targetLevel==null){
          const stg=careerStage();
          if(s.targets[stg]!=null){ ex.targetLevel=s.targets[stg]; changed=true; }
        }
      }
    }
  });
  // Reconcile parent/branch assignments to the current seed (so existing saves get the new
  // sub-path branching). Only touches skills whose seed defines a parent; preserves user skills.
  const seedByName={}; SEED_SKILLS.forEach(s=>{ seedByName[s.name]=s; });
  S.lifeSkills.forEach(ex=>{
    const seed=seedByName[ex.name];
    if(seed && seed.parent && ex.parent!==seed.parent){ ex.parent=seed.parent; changed=true; }
  });
  // stamp the current ladder version so the one-time forced resync doesn't repeat each load
  if((S._skillLadderVer||0)!==SKILL_LADDER_VER){ S._skillLadderVer=SKILL_LADDER_VER; changed=true; }
  if(changed) save();
}
// Returns true if anything changed (so render can re-save).
function aftLevelFromScores(scores){
  if(!scores) return 0;
  const vals=[scores.dl,scores.hrp,scores.sdc,scores.plank,scores.run].map(v=>v||0);
  const min=Math.min(...vals), max=Math.max(...vals);
  if(min<60) return 0;                 // not all events passed
  if(min>=90 && max>=100) return 5;    // a max + 90s everywhere
  if(min>=90) return 4;
  if(min>=80) return 3;
  if(min>=70) return 2;
  return 1;                            // all passed (>=60)
}
// Map a single AFT event score (0-100) to a skill level on the (now 10-rung) ladder.
// An AFT proves passing-to-strong performance, not the elite/record top end — so it
// floors into roughly L2–L6 and leaves the upper rungs to dedicated training/tests.
function eventScoreToLevel(score, maxLevels){
  if(score==null||score<60) return 0;
  let lvl;
  if(score>=100) lvl=6;        // maxed the AFT event = strong, but not world-record
  else if(score>=95) lvl=5;
  else if(score>=85) lvl=4;
  else if(score>=75) lvl=3;
  else lvl=2;                  // passed (60-74)
  return Math.min(maxLevels, lvl);
}
