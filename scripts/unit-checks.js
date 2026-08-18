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

  console.log("UNIT CHECKS", fails.length === 0 ? "PASS" : "FAIL");
  fails.forEach((f) => console.log("  FAIL: " + f));
  if (pageErrors.length) { console.log("PAGEERRORS DURING SETUP", pageErrors.length); pageErrors.forEach((e) => console.log("  " + e)); }
  await browser.close();
  server.close();
  process.exit(fails.length || pageErrors.length ? 1 : 0);
})().catch((e) => { console.error("TEST CRASH:", e); process.exit(2); });
