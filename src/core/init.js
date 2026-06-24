/* ---------------- Service worker (offline) ---------------- */
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});}

seedSkillsIfEmpty();
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
    if(S.streak>0&&(S.dailies||[]).some(d=>!d.done)){
      new Notification("🔥 Streak at risk",{body:`${S.streak}-day streak — orders remaining before midnight.`,tag:"streak-alert"});
    }
    scheduleStreakNotif(); // reschedule for next 7 pm
  }, target-now);
}
scheduleStreakNotif();

