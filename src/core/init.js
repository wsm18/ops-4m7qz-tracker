/* ---------------- Service worker (offline) ---------------- */
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});}

seedSkillsIfEmpty();
// Snapshot the gap since the last open, once, BEFORE overwriting the
// timestamp — this app has irregular ROTC-semester-driven usage, so
// re-orientation after a real break matters more than a stranger-facing
// tutorial (see Today's Getting Started card for that side of onboarding).
window._daysSinceLastOpen = S.lastOpenedTs ? Math.floor((Date.now()-S.lastOpenedTs)/864e5) : null;
S.lastOpenedTs = Date.now();
save();
render();

/* ---------------- Streak notification scheduler ---------------- */
// Fires a local notification at 7 pm if streak is alive and orders remain.
// Only runs while the tab is open; that's acceptable (the permission prompt alone adds value).
function scheduleStreakNotif(){
  if(typeof Notification==="undefined"||Notification.permission!=="granted"||!S.notifEnabled) return;
  const now=new Date();
  const target=new Date(now);
  target.setHours(19,0,0,0);
  if(target<=now) target.setDate(target.getDate()+1);
  setTimeout(()=>{
    if(S.streak>0&&(S.dailies||[]).some(d=>d.kind==="order"&&!d.done)){
      new Notification("🔥 Streak at risk",{body:`${S.streak}-day streak — orders remaining before midnight.`,tag:"streak-alert"});
    }
    scheduleStreakNotif(); // reschedule for next 7 pm
  }, target-now);
}
scheduleStreakNotif();

/* ---------------- Skill-decay notification scheduler ---------------- */
// Fading skills, SRS cards due, and an approaching AFT test all have real
// "silent unless something needs attention" logic already (computeSmartFocus,
// v203's consolidation of 5 competing urgency algorithms) — but until now
// none of it could reach the user outside the app, only streak risk could.
// Reuses the same permission/scheduling pattern, at a different hour so the
// two don't both fire at once.
function scheduleDecayNotif(){
  if(typeof Notification==="undefined"||Notification.permission!=="granted"||!S.notifEnabled) return;
  const now=new Date();
  const target=new Date(now);
  target.setHours(9,0,0,0);
  if(target<=now) target.setDate(target.getDate()+1);
  setTimeout(()=>{
    const focus=typeof computeSmartFocus==="function"?computeSmartFocus():null;
    if(focus&&focus.urgency>0){
      new Notification("🍂 A skill is slipping",{body:`${focus.sk.name} is ${focus.daysLeft} day${focus.daysLeft!==1?'s':''} from fading further.`,tag:"decay-alert"});
    }
    scheduleDecayNotif(); // reschedule for next 9 am
  }, target-now);
}
scheduleDecayNotif();

