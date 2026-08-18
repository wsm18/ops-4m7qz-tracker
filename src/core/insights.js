"use strict";
/* ===== X-Insight: cross-domain pattern surfacing =====
   Looks across your own logged history for genuine patterns and states them
   plainly — never predictions, never invented advice, only what your data
   already shows. Same honesty philosophy as computeTarget()'s difficulty
   signal (log.js) and recoveryReadiness() (aft.js): silent when there isn't
   enough logged history to say anything real. Deliberately compares plain
   bucketed averages / co-occurrence counts rather than a correlation
   coefficient — a coefficient implies a precision this app's small personal
   dataset can't actually support, and would risk presenting a spurious
   small-N coincidence as fact.

   Every series in this app formats its dates differently (toDateString,
   toLocaleDateString, or a plain YYYY-MM-DD) — insDate()/insDayMs() hand
   them all to Date() and return null for anything unparseable, so a bad or
   legacy entry is silently skipped rather than crashing or guessing. */
function insDate(v){
  if(v==null) return null;
  const d=new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function insDayMs(v){ const d=insDate(v); return d?d.getTime():null; }

// A comparison needs real support on both sides before it's shown at all —
// deliberately conservative, so a technically-nonzero sample doesn't read as
// a discovered pattern.
const INSIGHT_MIN_PER_BUCKET=2;
const INSIGHT_MIN_TOTAL=4;

// ---- Consistency (daily-order streak) in the 2 weeks before an AFT test, vs that test's score ----
function insightStreakVsAft(){
  const tests=(S.aft||[]).map(a=>({ts:insDayMs(a.date), total:a.total})).filter(t=>t.ts!=null);
  const log=(S.streakLog||[]).map(l=>({ts:insDayMs(l.date), pct:l.pct})).filter(l=>l.ts!=null && l.pct!=null);
  if(tests.length<INSIGHT_MIN_TOTAL || !log.length) return null;
  const consistent=[], inconsistent=[];
  tests.forEach(t=>{
    const window=log.filter(l=>l.ts<=t.ts && l.ts>=t.ts-14*864e5);
    if(!window.length) return;
    // streakLog[].pct is stored as an integer 0-100 (state.js: Math.round(done/orders.length*100)),
    // not a 0-1 fraction — every other consumer (today.js, dailies.js) treats it that way.
    // Comparing it against 0.7 here meant any window averaging >=1% completion
    // was bucketed as "consistent," which either made this check permanently
    // inert (rarely finding 2+ genuinely-inconsistent windows) or, worse,
    // let it publish "a real pattern" using a "consistent" bucket that
    // actually averaged single-digit completion.
    const avgPct=window.reduce((s,l)=>s+l.pct,0)/window.length;
    (avgPct>=70?consistent:inconsistent).push(t.total);
  });
  if(consistent.length<INSIGHT_MIN_PER_BUCKET || inconsistent.length<INSIGHT_MIN_PER_BUCKET) return null;
  const avg=arr=>arr.reduce((a,b)=>a+b,0)/arr.length;
  const avgC=avg(consistent), avgI=avg(inconsistent), diff=avgC-avgI;
  if(Math.abs(diff)<5) return null;
  return {
    line: diff>0
      ? `Your AFT scores average ${Math.round(diff)} points higher on tests taken after a consistent daily-order streak (≥70% completion in the prior 2 weeks) than after an inconsistent one.`
      : `Your AFT scores average ${Math.round(-diff)} points lower on tests taken after a consistent daily-order streak than after an inconsistent one — worth a second look, not necessarily causal.`,
    detail: `${consistent.length} test${consistent.length!==1?'s':''} after a consistent streak (avg ${Math.round(avgC)}), ${inconsistent.length} after an inconsistent one (avg ${Math.round(avgI)}). A pattern in your own data, not a guarantee.`,
  };
}

// ---- Training frequency in the 3 weeks before an AFT test, vs whether that test improved ----
function insightTrainingFreqVsAftTrend(){
  const tests=(S.aft||[]).map(a=>({ts:insDayMs(a.date), total:a.total})).filter(t=>t.ts!=null).sort((a,b)=>a.ts-b.ts);
  if(tests.length<3) return null;
  const trainDates=[
    ...(S.workouts||[]).map(w=>w.ts||insDayMs(w.date)),
    ...(S.ptLog||[]).map(p=>p.ts||insDayMs(p.date)),
  ].filter(Boolean);
  if(!trainDates.length) return null;
  const improved=[], notImproved=[];
  for(let i=1;i<tests.length;i++){
    const cur=tests[i], prev=tests[i-1];
    const windowStart=cur.ts-21*864e5;
    const perWeek=trainDates.filter(t=>t>=windowStart && t<=cur.ts).length/3;
    (cur.total>prev.total?improved:notImproved).push(perWeek);
  }
  if(improved.length<INSIGHT_MIN_PER_BUCKET || notImproved.length<INSIGHT_MIN_PER_BUCKET) return null;
  const avg=arr=>arr.reduce((a,b)=>a+b,0)/arr.length;
  const avgImp=avg(improved), avgNot=avg(notImproved);
  if(Math.abs(avgImp-avgNot)<0.5) return null;
  return {
    line: avgImp>avgNot
      ? `Tests where your AFT score improved over the last one were preceded by more frequent training (avg ${avgImp.toFixed(1)} sessions/week in the prior 3 weeks) than tests where it didn't (avg ${avgNot.toFixed(1)}/week).`
      : `Training frequency before a test hasn't tracked with whether your score improved (avg ${avgImp.toFixed(1)}/week before an improvement vs ${avgNot.toFixed(1)}/week before a non-improvement) — for you, other factors may matter more than raw frequency.`,
    detail: `${improved.length} improved test${improved.length!==1?'s':''}, ${notImproved.length} that didn't, each compared against workouts + PT sessions logged in the 3 weeks before.`,
  };
}

// ---- Body weight movement vs deadlift movement, paired by nearest date ----
function insightWeightVsDeadlift(){
  const dl=(S.aft||[]).map(a=>({ts:insDayMs(a.date), val:a.raw&&a.raw.dl})).filter(d=>d.ts!=null&&d.val!=null).sort((a,b)=>a.ts-b.ts);
  const wt=(S.weightLog||[]).map(w=>({ts:insDayMs(w.date), val:w.lb})).filter(w=>w.ts!=null&&w.val!=null).sort((a,b)=>a.ts-b.ts);
  if(dl.length<3 || wt.length<3) return null;
  const pairs=[];
  dl.forEach(d=>{
    let best=null, bestDiff=Infinity;
    wt.forEach(w=>{ const diff=Math.abs(w.ts-d.ts); if(diff<14*864e5 && diff<bestDiff){ best=w; bestDiff=diff; } });
    if(best) pairs.push({dl:d.val, wt:best.val});
  });
  if(pairs.length<3) return null;
  let agree=0, total=0;
  for(let i=1;i<pairs.length;i++){
    const dDl=pairs[i].dl-pairs[i-1].dl, dWt=pairs[i].wt-pairs[i-1].wt;
    if(dDl===0||dWt===0) continue;
    total++;
    if((dDl>0)===(dWt>0)) agree++;
  }
  if(total<INSIGHT_MIN_TOTAL) return null;
  const pct=Math.round(agree/total*100);
  return {
    line: `${agree} of ${total} times your logged body weight moved between AFT tests, your deadlift moved the same direction (${pct}%).`,
    detail: pct>=65 ? "A real pattern in your logged data — for you, weight and deadlift strength tend to move together." : pct<=35 ? "Your deadlift and body weight tend to move in opposite directions in your logged data — could mean strength gains without added mass, or the reverse." : "No clear pattern either way yet in your logged data.",
  };
}

const INSIGHT_CHECKS=[insightStreakVsAft, insightTrainingFreqVsAftTrend, insightWeightVsDeadlift];
// Every insight the current save has enough logged history to actually
// support — empty array, not fabricated content, when nothing qualifies yet.
function computeInsights(){
  return INSIGHT_CHECKS.map(fn=>fn()).filter(Boolean);
}
