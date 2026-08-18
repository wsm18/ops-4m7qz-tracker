function syncSkillsFromActivity(){
  if(!S.lifeSkills||!S.lifeSkills.length) return false;
  let changed=false;
  const now=Date.now();
  const last=(S.aft||[])[S.aft.length-1];
  // recent workout text (for timer refresh of practiced exercises)
  const recentWk=(S.workouts||[]).filter(w=>now-(w.ts||0)<7*864e5);
  const recentText=JSON.stringify(recentWk.map(w=>[w.session,w.exercises])).toLowerCase();
  const recentPT=(S.ptLog||[]).filter(p=>now-(p.ts||0)<7*864e5);
  const ptText=JSON.stringify(recentPT.map(p=>[p.areas,p.text||""])).toLowerCase();
  // which auto-exercise keys were practiced recently (refresh their fade timer)
  const practiced=k=>{
    const map={pushups:["push-up","hand-release","hrp","push"],deadlift:["deadlift","hinge","dl"],pullups:["pull-up","pullup","row","pull"],squat:["squat"],run:["run","2-mile","sprint","interval","cardio"],ruck:["ruck","march"],sdc:["sprint-drag","sdc","drag","carry"],plank:["plank","core","hollow"],carry:["carry","carries","farmer","jug","sandbag"],lunges:["lunge"]};
    const terms=map[k]||[k];
    return terms.some(t=>recentText.includes(t)||ptText.includes(t));
  };
  S.lifeSkills.forEach(sk=>{
    if(!sk.auto || !sk.auto.startsWith("ex:")) return;
    const key=sk.auto.slice(3);
    const maxLevels=sk.levels.length;
    // bodyweight-relative strength: compute level from actual lift ÷ bodyweight
    const bw=S.profile&&S.profile.weightLb;
    if(bw && bw>0){
      let ratioLvl=null;
      if(key==="deadlift" && S.lifts.deadliftLb){
        const r=S.lifts.deadliftLb/bw;
        // matches the 10-rung Deadlift ladder anchors
        ratioLvl = r>=5?10 : r>=4?9 : r>=3.5?8 : r>=3?7 : r>=2.5?6 : r>=2?5 : r>=1.75?4 : r>=1.5?3 : r>=1.25?2 : r>=1?1 : 0;
      } else if(key==="squat" && S.lifts.squatLb){
        const r=S.lifts.squatLb/bw;
        // matches the 10-rung Squat ladder anchors
        ratioLvl = r>=4.5?10 : r>=4?9 : r>=3?8 : r>=2.5?7 : r>=2?6 : r>=1.75?5 : r>=1.5?4 : r>=1.25?3 : r>=1?2 : 1;
      }
      if(ratioLvl!==null){
        ratioLvl=Math.min(ratioLvl,maxLevels);
        if(ratioLvl>sk.currentLevel){ sk.currentLevel=ratioLvl; skUpdatePeak(sk); sk.lastQuestTs=now; sk.history.push({ts:now,type:"auto-lift",level:ratioLvl}); changed=true; }
        else if(ratioLvl>0 && ratioLvl>=sk.currentLevel && sk.lastQuestTs<now-864e5){ sk.lastQuestTs=now; changed=true; }
      }
    }
    // AFT events set a floor level by mapping the RAW performance directly to the ladder rung
    // achieved (reps / time), so hitting a rung's actual requirement sets exactly that level.
    // (Deadlift is handled by the bodyweight-ratio path above; an AFT raw deadlift also maps here
    //  via ratio if bodyweight is known.)
    if(last && last.raw){
      let lvl=null;
      const raw=last.raw;
      if(key==="pushups" && raw.hrp!=null){
        const v=raw.hrp; // reps in 2 min, ladder: 10,20,30,45,60,75,100,125,140,152
        lvl = v>=152?10:v>=140?9:v>=125?8:v>=100?7:v>=75?6:v>=60?5:v>=45?4:v>=30?3:v>=20?2:v>=10?1:0;
      } else if(key==="run" && raw.run!=null){
        const v=raw.run; // seconds, ladder: 1200,1080,960,900,840,780,720,600,480 (lower=better)
        lvl = v<=480?10:v<=600?9:v<=720?8:v<=780?7:v<=840?6:v<=900?5:v<=960?4:v<=1080?3:v<=1200?2:v<=1500?1:0;
      } else if(key==="sdc" && raw.sdc!=null){
        const v=raw.sdc; // seconds, ladder: complete,150,130,120,110,100,93,85,78,65
        lvl = v<=65?10:v<=78?9:v<=85?8:v<=93?7:v<=100?6:v<=110?5:v<=120?4:v<=130?3:v<=150?2:v<=240?1:0;
      } else if(key==="plank" && raw.plank!=null){
        const v=raw.plank; // seconds, ladder: 60,90,120,180,220,300,480,900,1800,34680
        lvl = v>=34680?10:v>=1800?9:v>=900?8:v>=480?7:v>=300?6:v>=220?5:v>=180?4:v>=120?3:v>=90?2:v>=60?1:0;
      } else if(key==="deadlift" && raw.dl!=null && bw && bw>0){
        const r=raw.dl/bw; // AFT deadlift raw ÷ bodyweight, same anchors as the ratio path
        lvl = r>=5?10:r>=4?9:r>=3.5?8:r>=3?7:r>=2.5?6:r>=2?5:r>=1.75?4:r>=1.5?3:r>=1.25?2:r>=1?1:0;
      }
      if(lvl!=null){
        lvl=Math.min(lvl, maxLevels);
        if(lvl>sk.currentLevel){ sk.currentLevel=lvl; skUpdatePeak(sk); sk.lastQuestTs=now; sk.history.push({ts:now,type:"auto-aft",level:lvl}); changed=true; }
        else if(lvl>0 && lvl>=sk.currentLevel && sk.lastQuestTs<now-864e5){ sk.lastQuestTs=now; changed=true; }
      }
    }
    // practice in Log/PT refreshes the fade timer so it doesn't decay
    if(sk.currentLevel>0 && practiced(key) && sk.lastQuestTs<now-864e5){ sk.lastQuestTs=now; changed=true; }
  });
  // ROTC knowledge skill: level from number of quiz banks passed
  const qsk=S.lifeSkills.find(s=>s.auto==="quiz");
  if(qsk){
    const passed=Object.values(S.quizzes||{}).filter(x=>x.passed).length;
    const lvl = passed>=16?6 : passed>=14?5 : passed>=11?4 : passed>=8?3 : passed>=5?2 : passed>=2?1 : 0;
    const capped=Math.min(lvl, qsk.levels.length);
    if(capped>qsk.currentLevel){ qsk.currentLevel=capped; skUpdatePeak(qsk); qsk.lastQuestTs=now; qsk.history.push({ts:now,type:"auto-quiz",level:capped}); changed=true; }
  }
  // Resting heart rate skill: level from the most-recent logged resting pulse (manual vitals
  // OR Apple Health import both write to S.vitals). Lower RHR = higher level.
  const rsk=S.lifeSkills.find(s=>s.auto==="vital:rhr");
  if(rsk){
    const withPulse=(S.vitals||[]).filter(v=>v.pulse!=null).sort((a,b)=>new Date(b.date)-new Date(a.date));
    if(withPulse.length){
      const lvl=Math.min(rhrToLevel(withPulse[0].pulse), rsk.levels.length);
      if(lvl>rsk.currentLevel){ rsk.currentLevel=lvl; skUpdatePeak(rsk); rsk.lastQuestTs=now; rsk.history.push({ts:now,type:"auto-rhr",level:lvl}); changed=true; }
    }
  }
  // Memory retention skill: was locked auto:"quiz:retention" with nothing feeding
  // it — permanently stuck at 0, self-contradicting its own howTo text ("there is
  // no automatic leveling for this skill yet"). Levels from real SRS review
  // quality: a card's SM-2 ease factor IS the standard measure of how easily
  // material is actually being retained (repeated "Again" grades drag it down,
  // "Good"/"Easy" grades raise it) — no invented formula, reusing srsGrade()'s
  // existing math. Only counts "mature" cards (reps>=2 — survived past the
  // initial-learning churn) so early noise doesn't move the level. The skill's
  // full ladder references streaks/time-windows/memory-palace milestones this
  // data doesn't track — deliberately capped at L5 ("Practitioner") rather than
  // faking the upper System-Builder/Master tiers, same honest-capping precedent
  // as nback (caps at L8) and Pattern recognition (caps at L7).
  const msk=S.lifeSkills.find(s=>s.auto==="quiz:retention");
  if(msk){
    const matureCards=(S.srsDecks||[]).flatMap(d=>d.cards).filter(c=>(c.reps||0)>=2);
    if(matureCards.length>=3){
      const avgEase=matureCards.reduce((s,c)=>s+c.ease,0)/matureCards.length;
      const lvl=Math.min(memRetentionLevel(matureCards.length, avgEase), msk.levels.length);
      if(lvl>msk.currentLevel){ msk.currentLevel=lvl; skUpdatePeak(msk); msk.lastQuestTs=now; msk.history.push({ts:now,type:"auto-srs",level:lvl}); changed=true; }
      else if(lvl>0 && lvl>=msk.currentLevel && msk.lastQuestTs<now-864e5){ msk.lastQuestTs=now; changed=true; }
    }
  }
  // Blood donation skill: levels from a plain donation count in S.donations —
  // no fitted model, just the real gallon-donor milestones blood banks already
  // use (1 gal = 8 donations), so the ladder is externally verifiable, not invented.
  const dsk=S.lifeSkills.find(s=>s.auto==="donation:count");
  if(dsk){
    const n=(S.donations||[]).length;
    const lvl=Math.min(donationLevel(n), dsk.levels.length);
    if(lvl>dsk.currentLevel){ dsk.currentLevel=lvl; skUpdatePeak(dsk); dsk.lastQuestTs=now; dsk.history.push({ts:now,type:"auto-donation",level:lvl}); changed=true; }
  }
  // Integrity skill: levels from the Weight ledger (read-only mirror). This is the
  // one auto skill that can move DOWN as well as up — broken vows cost integrity,
  // and a broken keystone/heavy vow costs far more than an ordinary one. Honest by
  // design: it measures consistency between word and deed, not a self-declared tier.
  const isk=S.lifeSkills.find(s=>s.auto==="weight:integrity");
  if(isk){
    const lvl=integrityLevel(isk.levels.length);
    if(lvl!==isk.currentLevel){
      // move toward the computed level (up or down); peak still tracks the all-time high
      isk.currentLevel=lvl; skUpdatePeak(isk); isk.lastQuestTs=now;
      isk.history.push({ts:now,type:"auto-integrity",level:lvl}); changed=true;
    }
  }
  return changed;
}
// Compute the Integrity level from S.weight.promises. Tier-weighted: keeping vows
// raises it, holding standing vows strengthens it, breaking vows lowers it — and
// breaking a keystone or heavy ("serious"/"standing") vow hurts far more than an
// ordinary one. Returns an integer level clamped to [0, maxLevel]; the skill engine
// floors a started skill at 1, so a rough patch never erases the record entirely.
function integrityLevel(maxLevel){
  const proms=(S.weight&&Array.isArray(S.weight.promises))?S.weight.promises.filter(p=>!p.favor):[];
  if(!proms.length) return 0;                      // unproven until you've made a vow
  const tierW=p=>{
    if(isKeystoneP(p)) return 5;                   // the keystone vow — gravest
    const t=(p.tier||"ordinary");
    return t==="serious"?3 : t==="standing"?3 : 1; // heavy vows weigh more
  };
  let keptW=0, brokeW=0, kept=0, broke=0, standingHeld=0, keystoneBroken=false, keystoneKept=false;
  proms.forEach(p=>{
    const w=tierW(p);
    if(p.status==="kept"){ keptW+=w; kept++; if(isKeystoneP(p))keystoneKept=true; }
    else if(p.status==="broken"){ brokeW+=w; broke++; if(isKeystoneP(p))keystoneBroken=true; }
    else if(p.status==="standing"){ keptW+=w*0.5; standingHeld++; }  // a held ongoing vow counts, but isn't "closed"
  });
  const tested=kept+broke;                         // resolved (closed) vows — the real test
  if(tested===0 && standingHeld===0) return 0;     // only open vows so far — not yet tested
  // weighted kept-rate: how much of your closed-vow weight you actually kept
  const denom=keptW+brokeW;
  const rate = denom>0 ? keptW/denom : 1;          // all-standing-no-closed -> treat as clean so far
  // base level from the weighted kept-rate
  let lvl;
  if(rate>=0.99 && tested>=12 && standingHeld>=1 && keystoneKept) lvl=8;
  else if(rate>=0.95 && tested>=8) lvl=7;
  else if(rate>=0.90 && tested>=6) lvl=6;
  else if(rate>=0.85 && tested>=4) lvl=5;
  else if(rate>=0.75 && tested>=2) lvl=4;
  else if(standingHeld>=1 && rate>=0.6) lvl=3;     // holding a standing vow with a decent record
  else if(kept>broke) lvl=2;                        // positive record begun
  else if(kept>=1 || standingHeld>=1) lvl=1;        // first kept/held vow
  else lvl=1;                                        // a vow exists but record isn't positive — floored, not erased
  // tier-weighted penalty for breaking heavy vows
  if(keystoneBroken) lvl=Math.min(lvl,2);          // a broken keystone caps integrity hard
  else if(brokeW>=6) lvl=Math.min(lvl,3);          // multiple heavy breaks cap it
  else if(brokeW>=3) lvl=Math.min(lvl,5);          // one heavy break holds it back
  return Math.max(0, Math.min(lvl, maxLevel));
}
// Ladder: L1 baseline, L2<75, L3<70, L4<65, L5<60, L6<56, L7<52, L8<48, L9<44, L10<=40 (lower=better).
function rhrToLevel(rhr){
  if(rhr==null) return 0;
  return rhr<=40?10 : rhr<44?9 : rhr<48?8 : rhr<52?7 : rhr<56?6 : rhr<60?5 : rhr<65?4 : rhr<70?3 : rhr<75?2 : 1;
}
// Ladder mirrors real blood-bank gallon-donor milestones (1 gallon whole blood = 8 donations).
function donationLevel(n){
  return n>=32?8 : n>=24?7 : n>=16?6 : n>=12?5 : n>=8?4 : n>=4?3 : n>=2?2 : n>=1?1 : 0;
}
// Two-factor: deck scale (mature card count) gates the level, ease quality
// (SM-2's own retention-difficulty signal, ~1.3 struggling to ~3.5+ retaining
// easily) breaks ties within a scale band. Caps at 5 — see the call site's
// comment for why the upper tiers aren't attempted.
function memRetentionLevel(cardCount, avgEase){
  if(cardCount<10) return avgEase>=2.3?1:0;
  if(cardCount<50) return avgEase>=2.7?3: avgEase>=2.3?2:1;
  if(cardCount<100) return avgEase>=2.7?4:3;
  return avgEase>=2.7?5:4;
}
