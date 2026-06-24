#!/usr/bin/env node
// Regression test: serve the repo root, load the app, click all 17 tabs, assert no
// pageerror, optionally screenshot the skill tree. Auto-detects the local Chromium that
// `npx playwright install chromium` provides (no hard-coded path).
// Usage: node scripts/regress.js [--shot]
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SHOT = process.argv.includes("--shot");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".txt": "text/plain", ".webmanifest": "application/manifest+json" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end("nf"); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream" });
  fs.createReadStream(fp).pipe(res);
});

// Primary tabs are always visible; secondary tabs live inside the .nav-more drawer (hidden until opened).
const PRIMARY_TABS = ["today", "quests", "dailies", "plan", "aft", "log", "skills"];
const SECONDARY_TABS = ["profile", "test", "quizzes", "bosses", "board", "shop", "awards", "records", "weight", "trophies"];
const TABS = [...PRIMARY_TABS, ...SECONDARY_TABS];

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch(); // uses the browser installed by `npx playwright install`
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  for (const t of TABS) {
    // Open the More drawer before clicking secondary tabs (it's collapsed by default).
    if (SECONDARY_TABS.includes(t) && t === SECONDARY_TABS[0]) {
      const moreBtn = await page.$("#navMoreBtn");
      if (moreBtn) { await moreBtn.click(); await page.waitForTimeout(150); }
    }
    const btn = await page.$(`#sideNav button[data-tab="${t}"]`);
    if (!btn) { errors.push("MISSING TAB: " + t); continue; }
    await btn.click();
    await page.waitForTimeout(120);
  }

  // basic skill audit: ladders consistent, no progress beyond ladder length
  const audit = await page.evaluate(() => {
    const all = (window.S && S.lifeSkills) || [];
    let bad = [];
    all.forEach((s) => { if (s.group) return; const L = s.levels ? s.levels.length : 0;
      if (s.tiers && Math.max(...s.tiers.map((t) => t.upTo)) !== L) bad.push(s.name + " tiers");
      if (s.peakLevel > L) bad.push(s.name + " peak>" + L);
      if (s.currentLevel > L) bad.push(s.name + " cur>" + L);
    });
    return { total: all.length, badCount: bad.length, bad: bad.slice(0, 12) };
  });

  if (SHOT) {
    await page.click('#sideNav button[data-tab="skills"]');
    await page.waitForTimeout(250);
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /tree/i.test(x.textContent || "")); if (b) b.click(); });
    await page.waitForTimeout(600);
    const tree = await page.$("#skTree");
    if (tree) { fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true }); await tree.screenshot({ path: path.join(ROOT, "dist", "tree.png") }); }
  }

  console.log("PAGEERRORS", errors.length);
  errors.forEach((e) => console.log("  " + e));
  console.log("SKILL AUDIT", JSON.stringify(audit));
  await browser.close();
  server.close();
  process.exit(errors.length || audit.badCount ? 1 : 0);
})().catch((e) => { console.error("TEST CRASH:", e); process.exit(2); });
