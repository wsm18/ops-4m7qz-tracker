const SKILL_LADDER_VER=119;
const PYRAMID_RESET_VER=1;
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
  // De-duplicate live skills sharing the exact same name+cat — found in v210:
  // several SEED_SKILLS entries independently reused the same display name
  // (an accidental collision between unrelated content, or a higher-tier
  // capstone reusing a lower tier's flagship name). skSeedOf()'s first-wins
  // name+cat lookup always resolved both to the SAME (first) entry's guidance/
  // ladder/rarity, but this loop below still pushes a live skill object for
  // EVERY seed entry regardless — so affected saves ended up with confusing
  // duplicate cards that always showed identical, and for one of them wrong,
  // content. The seed-side fix is renaming the shadowed entry to a distinct
  // name (see the v210 renames below/above in this file's history) — this is
  // the live-save cleanup half of it. A shadowed duplicate could never have
  // shown its own real content to level meaningfully, so any group of 2+ live
  // skills sharing name+cat where at most one has ever been touched collapses
  // to just that one (or the first, if neither was touched). If 2+ in a group
  // show real progress, nothing is touched — no way to tell which is "real"
  // without guessing, so leave both rather than risk losing a level.
  {
    const groups={};
    S.lifeSkills.forEach(s=>{ const k=s.name+"|"+s.cat; (groups[k]=groups[k]||[]).push(s); });
    Object.values(groups).forEach(group=>{
      if(group.length<2) return;
      const touched=group.filter(s=>(s.currentLevel||0)>0||(s.peakLevel||0)>0);
      if(touched.length>1) return; // ambiguous — don't guess, leave all as-is
      const keep=touched[0]||group[0];
      const drop=new Set(group.filter(s=>s!==keep));
      if(drop.size){ S.lifeSkills=S.lifeSkills.filter(s=>!drop.has(s)); changed=true; }
    });
  }
  const have=new Set(S.lifeSkills.map(s=>s.name));
  SEED_SKILLS.forEach(s=>{
    if(!have.has(s.name)){
      // Guidance text and the level ladder are resolved live from SEED_SKILLS via
      // skHydrateAll() below — not copied here, so they're never persisted.
      S.lifeSkills.push({
        id:id(), name:s.name, cat:s.cat, parent:s.parent||null, group:!!s.group,
        fadeDays:s.fadeDays, auto:s.auto||null,
        targetLevel:(s.targets&&s.targets[careerStage()]!=null?s.targets[careerStage()]:null),
        currentLevel:0, lastQuestTs:Date.now(), peakLevel:0,
        history:[], seeded:true
      });
      changed=true;
    } else if(s.levels||s.targets){
      // Existing skill: guidance text/ladder content are always live via skHydrate — nothing
      // to resync. Only reconcile things that depend on the user's own progress numbers:
      // clamp currentLevel/peakLevel if the seed's ladder length changed, and backfill a
      // target level the user never set.
      const ex=S.lifeSkills.find(x=>x.name===s.name);
      if(ex){
        // Backfill the seeded flag on a skill that predates it — skHydrate()
        // (skills-core.js) only ever hydrates live guidance/ladder text for
        // skills with seeded===true, so a skill from a save old enough to
        // predate that flag would silently never hydrate, freezing it on
        // whatever ladder/guidance text it had at save time forever. Found
        // by the v208-session cross-cutting audit.
        if(!ex.seeded) ex.seeded=true;
        if(s.levels){
          const max=s.levels.length;
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
  // Pyramid reset — wipe progress on skills newly assigned to the pyramid (user-authorized)
  const seedByName2={}; SEED_SKILLS.forEach(s=>{ seedByName2[s.name]=s; });
  S.lifeSkills.forEach(live=>{
    const seed=seedByName2[live.name];
    if(seed && seed.setKey && !live.pyramidResetApplied){
      live.currentLevel=0;
      live.history=[];
      live.lastQuestTs=null;
      delete live.synthesisUnlocked;
      live.pyramidResetApplied=PYRAMID_RESET_VER;
      changed=true;
    }
  });
  // Strip any legacy duplicated guidance/ladder text still sitting on old saves (from
  // before static content moved to live SEED_SKILLS lookups) and attach live getters in
  // its place. This is what actually shrinks an existing user's save — force a save()
  // below even if nothing else changed, so a save already at the quota ceiling gets
  // relief on this very load instead of waiting for some unrelated future edit.
  if(skHydrateAll(S.lifeSkills)) changed=true;
  if((S._skillLadderVer||0)!==SKILL_LADDER_VER){ S._skillLadderVer=SKILL_LADDER_VER; changed=true; }
  if(changed) save();
}
