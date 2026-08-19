#!/usr/bin/env node
// Function-level regression checks: load the REAL built app in a real headless
// browser (same approach as regress.js), then call specific functions with
// crafted fixtures and assert known outputs.
//
// Why this exists: scripts/regress.js only asserts "no pageerror" — it can't
// catch a function silently returning the WRONG (but non-throwing) answer.
// Every specific fix in the v212/v213 full-project audits (cross-category
// skill keying, the clock-skew clamp in skEffectiveLevel, the pyramid-reset
// storage collapse, integrityLevel's tier-weighted math, skDaysLeft's floor)
// was verified with a throwaway Playwright script, then deleted — meaning
// NONE of it had regression protection until now. This file is the permanent
// home for that kind of check; add to it instead of writing a throwaway one.
//
// Usage: node scripts/unit-checks.js
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".txt": "text/plain", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end("nf"); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream" });
  fs.createReadStream(fp).pipe(res);
});

function eq(fails, label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) fails.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function ok(fails, label, cond) {
  if (!cond) fails.push(`${label}: condition failed`);
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const fails = [];

  // ---- skEffectiveLevel: a future lastQuestTs (clock skew / bad restore)
  // must never produce an effective level ABOVE currentLevel.
  const skewResult = await page.evaluate(() => {
    const sk = { currentLevel: 4, peakLevel: 4, fadeDays: 30, lastQuestTs: Date.now() + 30 * 864e5 };
    return skEffectiveLevel(sk);
  });
  ok(fails, "skEffectiveLevel: future timestamp clamps, doesn't exceed currentLevel", skewResult <= 4);
  eq(fails, "skEffectiveLevel: future timestamp with full ladder alive", skewResult, 4);

  // ---- skEffectiveLevel: a very stale skill floors at 1, never 0 or negative.
  const staleResult = await page.evaluate(() => {
    const sk = { currentLevel: 4, peakLevel: 4, fadeDays: 30, lastQuestTs: Date.now() - 3650 * 864e5 };
    return skEffectiveLevel(sk);
  });
  eq(fails, "skEffectiveLevel: years-stale skill floors at 1", staleResult, 1);

  // ---- skDaysLeft: years-stale must floor at 0, never a large negative number.
  const daysLeftResult = await page.evaluate(() => {
    const sk = { currentLevel: 2, fadeDays: 30, lastQuestTs: Date.now() - 3650 * 864e5 };
    return skDaysLeft(sk);
  });
  eq(fails, "skDaysLeft: years-stale floors at 0", daysLeftResult, 0);

  // ---- mergeNewSeedSkills: two SEED_SKILLS entries sharing a name across
  // different cats must resolve independently, not collide on a name-only key.
  const crossCatResult = await page.evaluate(() => {
    const pair = {};
    for (const s of SEED_SKILLS) {
      if (pair[s.name] && pair[s.name].cat !== s.cat) { pair.match = { name: s.name, catA: pair[s.name].cat, catB: s.cat }; break; }
      pair[s.name] = s;
    }
    if (!pair.match) return { skipped: true }; // no such pair in current content — nothing to test
    S.lifeSkills = []; // start from an empty save so we control exactly what merges in
    mergeNewSeedSkills();
    const { name, catA, catB } = pair.match;
    const a = S.lifeSkills.find((x) => x.name === name && x.cat === catA);
    const b = S.lifeSkills.find((x) => x.name === name && x.cat === catB);
    return { skipped: false, name, catA, catB, aFound: !!a, bFound: !!b, distinct: a !== b };
  });
  if (!crossCatResult.skipped) {
    ok(fails, `mergeNewSeedSkills: cross-category "${crossCatResult.name}" both cats seeded`, crossCatResult.aFound && crossCatResult.bFound);
    ok(fails, `mergeNewSeedSkills: cross-category "${crossCatResult.name}" resolve to distinct live skills`, crossCatResult.distinct);
  }

  // ---- integrityLevel: no promises yet -> 0 (unproven, not floored-at-1 like a started skill).
  const integrityEmpty = await page.evaluate(() => {
    S.weight = { promises: [] };
    return integrityLevel(8);
  });
  eq(fails, "integrityLevel: no promises returns 0", integrityEmpty, 0);

  // ---- integrityLevel: a broken keystone vow caps the level at 2 regardless
  // of how many ordinary vows were kept.
  const integrityKeystone = await page.evaluate(() => {
    const kept = Array.from({ length: 10 }, (_, i) => ({ id: "k" + i, status: "kept", tier: "ordinary" }));
    S.weight = { promises: [...kept, { id: "keystone", status: "broken", keystone: true }] };
    return integrityLevel(8);
  });
  ok(fails, "integrityLevel: broken keystone caps level <=2 despite 10 kept vows", integrityKeystone <= 2);

  // ---- mergeBoardTaskSeeds: existing users' original 10 (untagged) board
  // tasks must survive with done-state intact and get retagged to MS3, and
  // the migration must be idempotent (version-gated).
  const boardMigResult = await page.evaluate(() => {
    S.boardTasks = [
      { id: "a", name: "Build your Talent-Based Branching (TBB) accessions file", done: true, due: null },
      { id: "b", name: "Write & polish your branch résumé", done: true, due: null },
      { id: "c", name: "Confirm your clearance eligibility for your desired branch", done: false, due: null },
    ];
    S._boardTasksVer = 0;
    mergeBoardTaskSeeds();
    const firstPassVer = S._boardTasksVer;
    const snapshot = JSON.stringify(S.boardTasks);
    mergeBoardTaskSeeds(); // second call must be a no-op
    return { tasks: S.boardTasks, verAfterFirst: firstPassVer, stableAcrossSecondCall: JSON.stringify(S.boardTasks) === snapshot };
  });
  ok(fails, "mergeBoardTaskSeeds: all 3 tasks survive with original ids", boardMigResult.tasks.length === 3 && boardMigResult.tasks.every((t, i) => t.id === ["a", "b", "c"][i]));
  ok(fails, "mergeBoardTaskSeeds: done-state preserved (a,b done; c not)", boardMigResult.tasks[0].done === true && boardMigResult.tasks[1].done === true && boardMigResult.tasks[2].done === false);
  ok(fails, "mergeBoardTaskSeeds: all retagged to MS3 with a matching seedKey", boardMigResult.tasks.every((t) => t.stage === "MS3" && typeof t.seedKey === "string" && t.seedKey.startsWith("ms3_")));
  eq(fails, "mergeBoardTaskSeeds: version stamped", boardMigResult.verAfterFirst, 1);
  ok(fails, "mergeBoardTaskSeeds: second call is a no-op (version-gated)", boardMigResult.stableAcrossSecondCall);

  // ---- syncBoardTasksToStage: idempotent (no duplicates on a second call),
  // and a dismissed seed never reappears on a later sync.
  const boardSyncResult = await page.evaluate(() => {
    S.rank = "MS1 Cadet"; // careerStage() reads S.rank directly
    S.boardTasks = [];
    S.boardDismissedSeeds = [];
    syncBoardTasksToStage();
    const firstCount = S.boardTasks.length;
    syncBoardTasksToStage(); // second call should add nothing
    const secondCount = S.boardTasks.length;
    const seedKeys = S.boardTasks.map((t) => t.seedKey);
    const noDupes = new Set(seedKeys).size === seedKeys.length;
    // dismiss one, then sync again — it must not come back
    const dismissedKey = S.boardTasks[0].seedKey;
    S.boardDismissedSeeds.push(dismissedKey);
    S.boardTasks = S.boardTasks.filter((t) => t.seedKey !== dismissedKey);
    syncBoardTasksToStage();
    const afterDismissAndResync = S.boardTasks.some((t) => t.seedKey === dismissedKey);
    return { firstCount, secondCount, noDupes, dismissedKey, afterDismissAndResync, finalCount: S.boardTasks.length };
  });
  ok(fails, "syncBoardTasksToStage: adds MS1 seeds on first call", boardSyncResult.firstCount > 0);
  eq(fails, "syncBoardTasksToStage: second call adds nothing", boardSyncResult.secondCount, boardSyncResult.firstCount);
  ok(fails, "syncBoardTasksToStage: no duplicate seedKeys", boardSyncResult.noDupes);
  ok(fails, "syncBoardTasksToStage: a dismissed task never reappears on resync", !boardSyncResult.afterDismissAndResync);
  eq(fails, "syncBoardTasksToStage: resync only backfills the other (non-dismissed) MS1 seeds", boardSyncResult.finalCount, boardSyncResult.firstCount - 1);

  // ---- Fresh-install seeding: DEFAULT's 10 board tasks are all correctly
  // pre-tagged MS3, and boardDismissedSeeds starts empty.
  const boardFreshResult = await page.evaluate(() => {
    const fresh = structuredClone(DEFAULT);
    return {
      count: fresh.boardTasks.length,
      allMs3Tagged: fresh.boardTasks.every((t) => t.stage === "MS3" && typeof t.seedKey === "string"),
      dismissedEmpty: Array.isArray(fresh.boardDismissedSeeds) && fresh.boardDismissedSeeds.length === 0,
    };
  });
  eq(fails, "DEFAULT.boardTasks: exactly 10 tasks", boardFreshResult.count, 10);
  ok(fails, "DEFAULT.boardTasks: all pre-tagged MS3 with a seedKey", boardFreshResult.allMs3Tagged);
  ok(fails, "DEFAULT.boardDismissedSeeds: starts empty", boardFreshResult.dismissedEmpty);

  // ---- planForDay(): the taper generalized from AFT-only to the nearest
  // upcoming of {AFT test date, LDAC report date}. Finds a real hard day via
  // the actual scheduler first (mirroring the v213-session technique for
  // testing taper-boundary behavior) rather than assuming a fixed weekday.
  const taperResult = await page.evaluate(() => {
    function findHardDate(){
      for(let i=1;i<=21;i++){ const d=new Date(); d.setDate(d.getDate()+i); const p=planForDay(d); if(p&&p.intensity==="hard") return d; }
      return null;
    }
    function offsetYmd(base,days){ const d=new Date(base); d.setDate(d.getDate()+days); return localYMD(d); }
    const hardDate=findHardDate();
    if(!hardDate) return { skipped:true };
    S.profile=S.profile||{};

    S.aftTestDate=offsetYmd(hardDate,10); S.profile.ldacDate=offsetYmd(hardDate,3);
    const ldacCloser=planForDay(hardDate);

    S.aftTestDate=offsetYmd(hardDate,3); S.profile.ldacDate=offsetYmd(hardDate,10);
    const aftCloser=planForDay(hardDate);

    S.aftTestDate=null; S.profile.ldacDate=offsetYmd(hardDate,-5); // past — must not taper
    const pastLdacOnly=planForDay(hardDate);

    S.aftTestDate=offsetYmd(hardDate,-5); S.profile.ldacDate=null; // past — must not taper
    const pastAftOnly=planForDay(hardDate);

    S.aftTestDate=null; S.profile.ldacDate=null;
    const neitherSet=planForDay(hardDate);

    return { skipped:false, ldacCloser, aftCloser, pastLdacOnly, pastAftOnly, neitherSet };
  });
  if(!taperResult.skipped){
    eq(fails, "planForDay: nearer LDAC wins the taper over a farther AFT date", taperResult.ldacCloser.taperFor, "LDAC");
    ok(fails, "planForDay: nearer-LDAC case actually downgrades to moderate", taperResult.ldacCloser.intensity==="moderate");
    eq(fails, "planForDay: nearer AFT wins the taper over a farther LDAC date", taperResult.aftCloser.taperFor, "AFT");
    ok(fails, "planForDay: a past-only LDAC date never triggers a taper", !taperResult.pastLdacOnly.taper);
    ok(fails, "planForDay: a past-only AFT date never triggers a taper", !taperResult.pastAftOnly.taper);
    ok(fails, "planForDay: neither date set never triggers a taper", !taperResult.neitherSet.taper);
  }

  // ---- ldacCountdownHtml(): pure day-math + careerStage()-gated past branch.
  const ldacBannerResult = await page.evaluate(() => {
    const future=ldacCountdownHtml(localYMD(new Date(Date.now()+10*864e5)), "Cadet", "MS2");
    const todayStr2=ldacCountdownHtml(localYMD(new Date()), "Cadet", "MS2");
    const pastStillLdac=ldacCountdownHtml(localYMD(new Date(Date.now()-5*864e5)), "Cadet", "LDAC");
    const pastMovedOn=ldacCountdownHtml(localYMD(new Date(Date.now()-5*864e5)), "Cadet", "MS4");
    const unset=ldacCountdownHtml(null, "Cadet", "MS2");
    return { future, todayStr2, pastStillLdac, pastMovedOn, unset };
  });
  ok(fails, "ldacCountdownHtml: future date mentions 'days to LDAC'", ldacBannerResult.future.includes("days to LDAC"));
  ok(fails, "ldacCountdownHtml: today mentions 'starts today'", ldacBannerResult.todayStr2.includes("starts today"));
  ok(fails, "ldacCountdownHtml: past date + stage still LDAC mentions 'began'", ldacBannerResult.pastStillLdac.includes("began"));
  eq(fails, "ldacCountdownHtml: past date + stage moved on renders nothing", ldacBannerResult.pastMovedOn, "");
  eq(fails, "ldacCountdownHtml: no date set renders nothing", ldacBannerResult.unset, "");

  // ---- STAGE_INFO relocation (board.js -> constants.js): renderBoard()
  // must still resolve it correctly from its new home.
  const stageRelocResult = await page.evaluate(() => {
    S.rank="LDAC Cadet";
    if(typeof renderBoard==="function") renderBoard();
    const el=document.getElementById("boardList");
    return el ? el.innerHTML : "";
  });
  ok(fails, "STAGE_INFO relocation: renderBoard() still renders the real LDAC blurb", stageRelocResult.includes("Camp OML score is a direct"));

  // ---- applyAvoidTags(): injury-aware exercise avoidance is a SOFT
  // preference — narrows the pool when a safe alternative exists, but never
  // empties a slot outright.
  const avoidResult = await page.evaluate(() => {
    const pool = [ {n:"Push-up", m:["chest","triceps"]}, {n:"Incline row", m:["back","biceps"]} ];
    return {
      safeNames: applyAvoidTags(pool, ["chest"]).map(e => e.n),
      allNames: applyAvoidTags(pool, ["chest","back"]).map(e => e.n),
      noneNames: applyAvoidTags(pool, []).map(e => e.n),
    };
  });
  eq(fails, "applyAvoidTags: drops the flagged exercise when a safe alternative exists", avoidResult.safeNames, ["Incline row"]);
  eq(fails, "applyAvoidTags: falls back to the full pool rather than emptying a slot", avoidResult.allNames, ["Push-up","Incline row"]);
  eq(fails, "applyAvoidTags: an empty avoid-list leaves the pool untouched", avoidResult.noneNames, ["Push-up","Incline row"]);

  // ---- planForDay(): proactive deload cadence (every 4th week, reusing
  // pickRunIndex()'s epoch-anchored week counter) and its precedence vs taper.
  const deloadResult = await page.evaluate(() => {
    S.aftTestDate=null; S.profile=S.profile||{}; S.profile.ldacDate=null;
    const deloadWeekDates=[];
    for(let i=1;i<=60;i++){ const d=new Date(); d.setDate(d.getDate()+i); if(weeksSinceEpoch(d)%4===3) deloadWeekDates.push(d); }
    const anyHardSurvives=deloadWeekDates.some(d=>{ const p=planForDay(d); return p&&p.intensity==="hard"; });
    const anyDeloadFlagged=deloadWeekDates.some(d=>{ const p=planForDay(d); return p&&p.deload===true; });
    let precedence=null;
    if(deloadWeekDates.length){
      const candidate=deloadWeekDates[0];
      S.aftTestDate=localYMD(candidate); // guaranteed within the taper window (daysAway=0)
      const p=planForDay(candidate);
      precedence={taper:p.taper, deload:p.deload};
    }
    return { sampleCount:deloadWeekDates.length, anyHardSurvives, anyDeloadFlagged, precedence };
  });
  ok(fails, "planForDay: no hard day survives a deload week (no taper active)", !deloadResult.anyHardSurvives);
  ok(fails, "planForDay: the deload cadence actually fires at least once across the scan", deloadResult.anyDeloadFlagged);
  if(deloadResult.precedence) ok(fails, "planForDay: taper and deload are never both true on the same day (taper wins)", !(deloadResult.precedence.taper && deloadResult.precedence.deload));

  // ---- bucketSleepIntervals(): merges overlapping "asleep" records instead
  // of double-counting, and buckets a post-midnight session to the PREVIOUS
  // night rather than splitting it onto a new day.
  const sleepBucketResult = await page.evaluate(() => {
    const night1Start=new Date(2026,1,5,23,0,0).getTime();
    const night1End=new Date(2026,1,6,3,0,0).getTime();
    const overlapStart=new Date(2026,1,6,2,0,0).getTime(); // overlaps the last hour of night1
    const overlapEnd=new Date(2026,1,6,6,30,0).getTime();
    const merged=bucketSleepIntervals([[night1Start,night1End],[overlapStart,overlapEnd]]);
    const nightKey=localYMD(new Date(2026,1,5));
    const postMidStart=new Date(2026,1,6,1,0,0).getTime();
    const postMidEnd=new Date(2026,1,6,5,0,0).getTime();
    const mergedPostMid=bucketSleepIntervals([[postMidStart,postMidEnd]]);
    const prevNightKey=localYMD(new Date(2026,1,5));
    return { overlapHours: merged[nightKey], postMidHours: mergedPostMid[prevNightKey] };
  });
  eq(fails, "bucketSleepIntervals: overlapping intervals merge without double-counting (7.5h, not 11.5h)", Math.round((sleepBucketResult.overlapHours||0)*10)/10, 7.5);
  eq(fails, "bucketSleepIntervals: a post-midnight session buckets to the previous night", Math.round((sleepBucketResult.postMidHours||0)*10)/10, 4);

  // ---- recoveryReadiness(): sleep uses a fixed 7-9h target, not a self-
  // relative baseline (unlike rhr/hrv) — see the comment at its call site.
  const sleepFlagResult = await page.evaluate(() => {
    S.healthImport={ history:[
      {date:"2026-01-01", rhr:60, hrv:50, vo2:null, sleepHrs:7},
      {date:"2026-01-02", rhr:60, hrv:50, vo2:null, sleepHrs:7},
      {date:"2026-01-03", rhr:60, hrv:50, vo2:null, sleepHrs:5.5},
    ]};
    const low=recoveryReadiness();
    S.healthImport.history[2].sleepHrs=8.5;
    const high=recoveryReadiness();
    return { low, high };
  });
  ok(fails, "recoveryReadiness: a short night (<6h) contributes a negative flag", !!(sleepFlagResult.low && sleepFlagResult.low.detail && sleepFlagResult.low.detail.includes("sleep")));
  ok(fails, "recoveryReadiness: a long night (>=7.5h) still reads as ready", !!(sleepFlagResult.high && sleepFlagResult.high.level==="ready"));

  // ---- weaveOptionalSessions() (via assignWeekSessions): automatic
  // pool/rock-climbing days only fire on their assigned 4-week cadence AND
  // only when the active equipment profile actually carries the matching
  // tag — a same-day relabel, so it should never touch more than one day.
  const weaveResult = await page.evaluate(() => {
    S.activeEquipProfile = "ROTC/Campus Gym"; // has both pool + climbwall tags
    const swimWeek = assignWeekSessions(new Date(2024,0,1));   // week 0 (swim cadence)
    const normalWeek = assignWeekSessions(new Date(2024,0,8)); // week 1 (off cadence)
    const climbWeek = assignWeekSessions(new Date(2024,0,15)); // week 2 (climb cadence)
    const countOf = (assign, val) => Object.values(assign).filter(v => v === val).length;
    S.activeEquipProfile = "Dorm"; // tags:[] — no pool/climbwall
    const untaggedSwimWeek = assignWeekSessions(new Date(2024,0,1));
    S.activeEquipProfile = "ROTC/Campus Gym";
    return {
      swimCount: countOf(swimWeek, "swim"),
      climbCountOnSwimWeek: countOf(swimWeek, "climb"),
      normalOffCadenceCount: countOf(normalWeek, "swim") + countOf(normalWeek, "climb"),
      climbCount: countOf(climbWeek, "climb"),
      untaggedSwimCount: countOf(untaggedSwimWeek, "swim"),
    };
  });
  eq(fails, "weaveOptionalSessions: a qualifying week gets exactly one swim day", weaveResult.swimCount, 1);
  eq(fails, "weaveOptionalSessions: swim week doesn't also weave in a climb day", weaveResult.climbCountOnSwimWeek, 0);
  eq(fails, "weaveOptionalSessions: an off-cadence week gets neither swim nor climb", weaveResult.normalOffCadenceCount, 0);
  eq(fails, "weaveOptionalSessions: the climb-cadence week gets exactly one climb day", weaveResult.climbCount, 1);
  eq(fails, "weaveOptionalSessions: a profile without the pool tag never gets a swim day", weaveResult.untaggedSwimCount, 0);

  // ---- sessionExForProfile("swim"/"climb"): the content reshape (single-
  // slot bw+alt pool, replacing 3 separate bw[] slots) must resolve to
  // exactly ONE worked exercise, not all 3 variants merged together.
  const swimClimbExResult = await page.evaluate(() => {
    const tags = activeEquipTags();
    const swimWork = sessionExForProfile("swim", tags, new Date(2024,0,1)).filter(e => e._phase === "work");
    const climbWork = sessionExForProfile("climb", tags, new Date(2024,0,1)).filter(e => e._phase === "work");
    return { swimCount: swimWork.length, climbCount: climbWork.length };
  });
  eq(fails, "sessionExForProfile('swim'): resolves to exactly one worked exercise", swimClimbExResult.swimCount, 1);
  eq(fails, "sessionExForProfile('climb'): resolves to exactly one worked exercise", swimClimbExResult.climbCount, 1);

  // ---- Month-ahead view data integrity: a 28-day planForDay() pull (the
  // exact loop renderMonthAheadHtml() runs) must never throw and every
  // returned plan needs a valid intensity to color its square.
  const monthResult = await page.evaluate(() => {
    const VALID = ["hard","moderate","easy","rest"];
    let threw = false, badIntensity = 0, count = 0;
    const start = new Date(); start.setHours(0,0,0,0);
    for (let i = 0; i < 28; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      try {
        const p = planForDay(d);
        count++;
        if (!p || !VALID.includes(p.intensity)) badIntensity++;
      } catch (e) { threw = true; }
    }
    return { threw, badIntensity, count };
  });
  ok(fails, "planForDay: a 28-day month-ahead pull never throws", !monthResult.threw);
  eq(fails, "planForDay: every day in a 28-day pull has a valid intensity", monthResult.badIntensity, 0);
  eq(fails, "planForDay: a 28-day month-ahead pull covers all 28 days", monthResult.count, 28);

  // ---- planForDay(): the recovery-readiness downgrade only ever applies to
  // the REAL current calendar day (recoveryReadiness() has no way to know a
  // future day's recovery) — stub assignWeekSessions so every weekday is
  // forced "hard", regardless of what real weekday the test happens to run
  // on, then compare a "ready" vs. an "easy" readiness reading for today.
  const readinessDowngradeResult = await page.evaluate(() => {
    S.aftTestDate = null;
    if (!S.profile) S.profile = {};
    S.profile.ldacDate = null;
    const todayDate = new Date();
    const todayDow = todayDate.getDay(); // 0 = Sunday = a fixed rest day, unaffected by the stub
    const origAssign = assignWeekSessions;
    assignWeekSessions = function () { const a = {}; for (let d = 1; d <= 6; d++) a[d] = "s1"; return a; };
    S.healthImport = { history: [
      {date:"2026-01-01", rhr:60, hrv:50, sleepHrs:8},
      {date:"2026-01-02", rhr:60, hrv:50, sleepHrs:8},
      {date:"2026-01-03", rhr:60, hrv:50, sleepHrs:8},
    ]};
    const readyPlan = todayDow === 0 ? null : planForDay(todayDate);
    S.healthImport.history.push({date:"2026-01-04", rhr:70, hrv:38, sleepHrs:8}); // 2 negative flags -> "easy"
    const easyPlan = todayDow === 0 ? null : planForDay(todayDate);
    assignWeekSessions = origAssign;
    return {
      todayDow,
      readyIntensity: readyPlan && readyPlan.intensity,
      readyFlag: !!(readyPlan && readyPlan.readinessEase),
      easyIntensity: easyPlan && easyPlan.intensity,
      easyFlag: !!(easyPlan && easyPlan.readinessEase),
    };
  });
  if (readinessDowngradeResult.todayDow === 0) {
    ok(fails, "planForDay: readiness downgrade correctly skipped on a fixed Sunday rest day (test happened to run on a Sunday)", true);
  } else {
    eq(fails, "planForDay: a normal ('ready') recovery reading leaves a hard day hard", readinessDowngradeResult.readyIntensity, "hard");
    ok(fails, "planForDay: no readiness-ease flag when recovery reads normal", !readinessDowngradeResult.readyFlag);
    eq(fails, "planForDay: a real ('easy') recovery reading downgrades today's hard session", readinessDowngradeResult.easyIntensity, "moderate");
    ok(fails, "planForDay: the readiness-ease flag is set when the downgrade fires", readinessDowngradeResult.easyFlag);
  }

  // ---- checkDailyReset(): a manually-set weather flag auto-expires once a
  // new calendar day starts, instead of silently staying in effect forever.
  const weatherExpiryResult = await page.evaluate(() => {
    const t = today();
    S.weather = "rain"; S.weatherSetDate = "Mon Jan 01 2024"; S.lastDaily = "Mon Jan 01 2024";
    checkDailyReset();
    const staleCleared = S.weather === "clear" && S.weatherSetDate === null;
    S.weather = "rain"; S.weatherSetDate = t; S.lastDaily = "Mon Jan 01 2024";
    checkDailyReset();
    const freshKept = S.weather === "rain";
    return { staleCleared, freshKept };
  });
  ok(fails, "checkDailyReset: a weather flag set on a prior day auto-clears to 'clear'", weatherExpiryResult.staleCleared);
  ok(fails, "checkDailyReset: a weather flag set TODAY survives the same day-boundary check", weatherExpiryResult.freshKept);

  // ---- aftDecliningEvent()/fmFocusLine(): a real multi-test declining
  // trend on one event is distinct from (and preferred over) "currently
  // weakest score" framing — and a flat/stable history is never flagged.
  const declineResult = await page.evaluate(() => {
    const mk = (dl,hrp,sdc,plank,run) => ({scores:{dl,hrp,sdc,plank,run}});
    S.aft = [ mk(70,70,79,70,70), mk(70,70,74,70,70), mk(70,70,69,70,70), mk(70,70,65,70,70) ];
    const declining = aftDecliningEvent();
    const focus = fmFocusLine();
    S.aft = [ mk(70,70,70,70,70), mk(70,70,70,70,70), mk(70,70,70,70,70) ];
    const stableDeclining = aftDecliningEvent();
    return { decliningKey: declining && declining.k, decliningScores: declining && declining.scores, focus, stableDeclining };
  });
  eq(fails, "aftDecliningEvent: flags SDC as the declining event across a real 4-test slide", declineResult.decliningKey, "sdc");
  eq(fails, "aftDecliningEvent: reports the real score sequence, not a computed summary", declineResult.decliningScores, [79,74,69,65]);
  ok(fails, "fmFocusLine: prefers the declining-trend framing over plain weakest-score", !!(declineResult.focus && declineResult.focus.includes("Sprint-Drag-Carry") && declineResult.focus.includes("gotten worse on every AFT test")));
  eq(fails, "aftDecliningEvent: a flat/stable history is never flagged as declining", declineResult.stableDeclining, null);

  // ---- vdotPaceZones()/exercisePaceZone(): a real, published VO2max->pace
  // method (Daniels & Gilbert), not an invented formula — and it must win
  // over BEGINNER_RX's vague qualitative run cues once real VO2max data
  // exists, while a bare computeTarget(name) call (no opts) still returns
  // null exactly as documented, never silently gaining a new return value.
  const vdotResult = await page.evaluate(() => {
    S.healthImport = { latest: { vo2max: { value: 45 } }, history: [] };
    const zones = vdotPaceZones();
    const zoneForTempo = exercisePaceZone("Tempo run");
    const zoneForNonRun = exercisePaceZone("Loaded backpack carry (books/household items)");
    const savedHi = S.healthImport;
    S.healthImport = { latest: {}, history: [] };
    const noVo2 = vdotPaceZones();
    S.healthImport = savedHi;
    const withOpts = computeTarget({n:"Tempo run", t:"dist"}, {skey:"s2", intensity:"hard"});
    const bareCall = computeTarget({n:"Tempo run", t:"dist"});
    return { zones, zoneForTempo, zoneForNonRun, noVo2, withOptsTarget: withOpts && withOpts.target, withOptsTier: withOpts && withOpts.tier, bareCall };
  });
  eq(fails, "exercisePaceZone: 'Tempo run' resolves to the threshold zone", vdotResult.zoneForTempo, "threshold");
  eq(fails, "exercisePaceZone: a non-running exercise has no pace zone", vdotResult.zoneForNonRun, null);
  ok(fails, "vdotPaceZones: returns a real per-mile pace string for a real VO2max", !!(vdotResult.zones && /^\d+:\d{2}\/mi$/.test(vdotResult.zones.threshold)));
  ok(fails, "vdotPaceZones: interval pace is faster than easy pace (higher %vVO2max)", (() => { const toSec=s=>{const [m,ss]=s.replace("/mi","").split(":").map(Number); return m*60+ss;}; return toSec(vdotResult.zones.interval) < toSec(vdotResult.zones.easy); })());
  eq(fails, "vdotPaceZones: returns null with no imported VO2max", vdotResult.noVo2, null);
  ok(fails, "computeTarget: a real VO2max pace wins over BEGINNER_RX's vague run cue when opts.skey is given", !!(vdotResult.withOptsTarget && vdotResult.withOptsTarget.includes("target pace") && vdotResult.withOptsTier === "vdot-pace"));
  eq(fails, "computeTarget: a bare call with no opts still returns null (tier 3/4 stay strictly opt-in)", vdotResult.bareCall, null);

  console.log("UNIT CHECKS", fails.length === 0 ? "PASS" : "FAIL");
  fails.forEach((f) => console.log("  FAIL: " + f));
  if (pageErrors.length) { console.log("PAGEERRORS DURING SETUP", pageErrors.length); pageErrors.forEach((e) => console.log("  " + e)); }
  await browser.close();
  server.close();
  process.exit(fails.length || pageErrors.length ? 1 : 0);
})().catch((e) => { console.error("TEST CRASH:", e); process.exit(2); });
