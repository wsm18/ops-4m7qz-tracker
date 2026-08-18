// skills: capture level-ability typing as it's entered
document.addEventListener("input",e=>{ const i=e.target.dataset.skl; if(i!=null){ _skLevels[+i]=e.target.value; } });
const _skAddLevel=document.getElementById("skAddLevel"); if(_skAddLevel) _skAddLevel.onclick=()=>{ _skLevels.push(""); renderSkLevelInputs(); };
const _skSave=document.getElementById("skSave"); if(_skSave) _skSave.onclick=skCreate;
// Skills tab: list ↔ tree view toggle
let _skView="list";
function setSkView(v){
  _skView=v;
  const list=document.getElementById("skList"), tree=document.getElementById("skTree");
  const bl=document.getElementById("skViewList"), bt=document.getElementById("skViewTree");
  if(!list||!tree) return;
  if(v==="tree"){ list.style.display="none"; tree.style.display="block"; renderSkillTree(); bt&&bt.classList.add("active"); bl&&bl.classList.remove("active"); }
  else { tree.style.display="none"; list.style.display="block"; bl&&bl.classList.add("active"); bt&&bt.classList.remove("active"); }
}
{ const bl=document.getElementById("skViewList"), bt=document.getElementById("skViewTree");
  if(bl) bl.onclick=()=>setSkView("list");
  if(bt) bt.onclick=()=>setSkView("tree"); }
// Records: counseling + checklists
const _cnAdd=document.getElementById("cnAdd");
if(_cnAdd) _cnAdd.onclick=()=>{
  const date=document.getElementById("cnDate").value||localYMD();
  const entry={id:id(),date,type:document.getElementById("cnType").value,people:document.getElementById("cnPeople").value.trim(),summary:document.getElementById("cnSummary").value.trim(),plan:document.getElementById("cnPlan").value.trim(),followUp:""};
  if(!entry.summary){ toast("Add a summary at least"); return; }
  S.counseling.push(entry);
  ["cnPeople","cnSummary","cnPlan","cnDate"].forEach(x=>document.getElementById(x).value="");
  save(); render(); toast("📝 Entry saved");
};
const _aarAdd=document.getElementById("aarAdd");
if(_aarAdd) _aarAdd.onclick=()=>{
  const date=document.getElementById("aarDate").value||localYMD();
  const entry={id:id(),date,
    title:document.getElementById("aarTitle").value.trim(),
    planned:document.getElementById("aarPlanned").value.trim(),
    actual:document.getElementById("aarActual").value.trim(),
    why:document.getElementById("aarWhy").value.trim(),
    sustain:document.getElementById("aarSustain").value.trim(),
    improve:document.getElementById("aarImprove").value.trim(),
    trigger:null};
  if(!entry.planned&&!entry.actual){ toast("Fill in at least planned and actual"); return; }
  if(!S.aarLog) S.aarLog=[];
  S.aarLog.push(entry);
  ["aarTitle","aarPlanned","aarActual","aarWhy","aarSustain","aarImprove","aarDate"].forEach(x=>document.getElementById(x).value="");
  save(); render(); toast("📝 AAR saved");
};
const _clAdd=document.getElementById("clAdd");
if(_clAdd) _clAdd.onclick=()=>{
  const n=document.getElementById("clName").value.trim(); if(!n){toast("Name the checklist");return;}
  S.checklists.push({id:id(),name:n,items:[],template:false});
  document.getElementById("clName").value="";
  save(); render(); toast("✅ Checklist created");
};
// Section-specific export / import
const _secExport=document.getElementById("sectionExport");
if(_secExport) _secExport.onclick=()=>{ const sel=document.getElementById("sectionPick"); if(sel) exportSection(sel.value); };
const _secImportBtn=document.getElementById("sectionImportBtn");
if(_secImportBtn) _secImportBtn.onclick=()=>{ const f=document.getElementById("sectionImportFile"); if(f) f.click(); };
const _secImportFile=document.getElementById("sectionImportFile");
if(_secImportFile) _secImportFile.onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{ importSection(rd.result); };
  rd.readAsText(f);
  e.target.value=""; // allow re-importing the same file
};
// checklist add-item on Enter
document.addEventListener("keydown",e=>{
  if(e.key==="Enter" && e.target.dataset && e.target.dataset.clnewitem){
    const cl=S.checklists.find(x=>x.id===e.target.dataset.clnewitem);
    const v=e.target.value.trim();
    if(cl&&v){ cl.items.push({text:v,done:false}); save(); render(); }
  }
});
// Open the Weight app (portal link)
const _wmOpen=document.getElementById("wmOpen");
if(_wmOpen) _wmOpen.onclick=()=>{
  let url=S.weightAppUrl;
  if(!url){ url=(prompt("Paste the link to your hosted Weight app:","https://")||"").trim(); if(!url||url==="https://")return; S.weightAppUrl=url; save(); }
  window.open(url,"_blank","noopener");
};
// Edit / set the Weight app link
const _wmLinkEdit=document.getElementById("wmLinkEdit");
if(_wmLinkEdit) _wmLinkEdit.onclick=()=>{
  const url=(prompt("Weight app link:",S.weightAppUrl||"https://")||"").trim();
  if(url&&url!=="https://"){ S.weightAppUrl=url; save(); weightToast("Link saved."); updateWmStatus(); }
};
// Update mirror — import a Weight ledger .json export
const _wmImport=document.getElementById("wmImport"), _wmFile=document.getElementById("wmFile");
if(_wmImport&&_wmFile){
  _wmImport.onclick=()=>_wmFile.click();
  _wmFile.onchange=ev=>{
    const f=ev.target.files[0]; if(!f)return;
    const r=new FileReader();
    r.onload=()=>{ try{ importWeightLedger(JSON.parse(r.result)); }catch(err){ weightToast("Couldn't read that file."); } _wmFile.value=""; };
    r.readAsText(f);
  };
}
function updateWmStatus(){
  const el=document.getElementById("wmStatus"); if(!el)return;
  el.textContent = S.weightAppUrl
    ? 'Read-only mirror. Linked to your Weight app. To refresh, export your ledger there and tap "Update mirror."'
    : 'Read-only mirror. Set the Weight app link below, then export your ledger there and tap "Update mirror" to bring it in.';
}
updateWmStatus();
let _awEditId=null;
const _awAdd=document.getElementById("awAdd");
if(_awAdd) _awAdd.onclick=()=>{
  const title=document.getElementById("awTitle").value.trim(); if(!title){toast("Give it a title first");return;}
  const kind=document.getElementById("awKind").value;
  const note=document.getElementById("awNote").value.trim();
  const year=parseInt(document.getElementById("awYear").value)||null;
  const org=document.getElementById("awOrg").value.trim();
  if(_awEditId){
    const a=S.awards.find(x=>x.id===_awEditId);
    if(a){ a.kind=kind; a.title=title; a.note=note; a.year=year; a.org=org; }
    _awEditId=null; _awAdd.textContent="Add to the Wall";
    toast("✎ Award updated");
  } else {
    S.awards.push({id:id(),ts:Date.now(),date:new Date().toLocaleDateString(),kind,title,note,year,org});
    toast("🏆 Added to the wall");
  }
  document.getElementById("awTitle").value=""; document.getElementById("awNote").value="";
  document.getElementById("awYear").value=""; document.getElementById("awOrg").value="";
  save();render();
};
function awEdit(awId){
  const a=S.awards.find(x=>x.id===awId); if(!a) return;
  document.getElementById("awKind").value=a.kind||"award";
  document.getElementById("awTitle").value=a.title||"";
  document.getElementById("awYear").value=a.year||"";
  document.getElementById("awOrg").value=a.org||"";
  document.getElementById("awNote").value=a.note||"";
  _awEditId=awId; _awAdd.textContent="Save changes";
  document.getElementById("awTitle").scrollIntoView({behavior:"smooth",block:"center"});
  document.getElementById("awTitle").focus();
}

/* ---- Wall sub-navigation ---- */
document.querySelectorAll(".wsub").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".wsub").forEach(x=>x.classList.remove("on"));
  document.querySelectorAll(".wall-sec").forEach(x=>x.classList.remove("on"));
  btn.classList.add("on");
  document.getElementById("wsec-"+btn.dataset.wsub).classList.add("on");
});

/* ---- Memberships ---- */
let _mbRoles=[];  // draft leadership roles {title,startYear,endYear}
function renderMbRoleInputs(){
  const el=document.getElementById("mbRoleInputs"); if(!el) return;
  el.innerHTML=_mbRoles.map((r,i)=>`<div class="mb-role-row">
    <input class="rt" data-mbr="${i}.title" placeholder="Position — e.g. Squad Leader, President" value="${esc(r.title)}">
    <div class="yrs"><input data-mbr="${i}.startYear" type="number" placeholder="Start yr" value="${r.startYear||''}"><input data-mbr="${i}.endYear" type="number" placeholder="End yr (blank=present)" value="${r.endYear||''}"><button class="rm" data-mbrrm="${i}">✕</button></div>
  </div>`).join("");
}
const _mbAddRole=document.getElementById("mbAddRole"); if(_mbAddRole) _mbAddRole.onclick=()=>{ _mbRoles.push({title:"",startYear:"",endYear:""}); renderMbRoleInputs(); };
document.addEventListener("input",e=>{
  const r=e.target.dataset.mbr; if(r){ const [i,f]=r.split("."); _mbRoles[+i][f]=e.target.value; }
});
let _mbEditId=null;
const _mbSave=document.getElementById("mbSave"); if(_mbSave) _mbSave.onclick=()=>{
  const org=document.getElementById("mbOrg").value.trim(); if(!org){toast("Name the organization");return;}
  const startYear=parseInt(document.getElementById("mbStart").value)||null;
  const endYear=parseInt(document.getElementById("mbEnd").value)||null;
  const memberType=document.getElementById("mbType").value;
  const note=document.getElementById("mbNote").value.trim();
  const roles=_mbRoles.filter(r=>r.title.trim()).map(r=>({title:r.title.trim(),startYear:parseInt(r.startYear)||null,endYear:parseInt(r.endYear)||null}));
  if(_mbEditId){
    const m=S.memberships.find(x=>x.id===_mbEditId);
    if(m){ m.org=org; m.startYear=startYear; m.endYear=endYear; m.memberType=memberType; m.note=note; m.roles=roles; }
    _mbEditId=null; _mbSave.textContent="Add membership"; toast("✎ Membership updated");
  } else {
    S.memberships.push({id:id(),org,startYear,endYear,memberType,roles,note}); toast("🎟️ Membership added");
  }
  _mbRoles=[]; renderMbRoleInputs();
  ["mbOrg","mbStart","mbEnd","mbNote"].forEach(x=>document.getElementById(x).value="");
  save();render();
};
function mbEdit(mbId){
  const m=S.memberships.find(x=>x.id===mbId); if(!m) return;
  document.getElementById("mbOrg").value=m.org||"";
  document.getElementById("mbStart").value=m.startYear||"";
  document.getElementById("mbEnd").value=m.endYear||"";
  document.getElementById("mbType").value=m.memberType||"regular";
  document.getElementById("mbNote").value=m.note||"";
  _mbRoles=(m.roles||[]).map(r=>({title:r.title||"",startYear:r.startYear||"",endYear:r.endYear||""}));
  renderMbRoleInputs();
  _mbEditId=mbId; _mbSave.textContent="Save changes";
  document.getElementById("mbOrg").scrollIntoView({behavior:"smooth",block:"center"}); document.getElementById("mbOrg").focus();
}

/* ---- Events ---- */
let _evEditId=null;
const _evSave=document.getElementById("evSave"); if(_evSave) _evSave.onclick=()=>{
  const title=document.getElementById("evTitle").value.trim(); if(!title){toast("Name the event");return;}
  const data={title,year:parseInt(document.getElementById("evYear").value)||null,org:document.getElementById("evOrg").value.trim(),role:document.getElementById("evRole").value.trim(),note:document.getElementById("evNote").value.trim()};
  if(_evEditId){ const ev=S.events.find(x=>x.id===_evEditId); if(ev) Object.assign(ev,data); _evEditId=null; _evSave.textContent="Add event"; toast("✎ Event updated"); }
  else { S.events.push({id:id(),...data}); toast("📅 Event added"); }
  ["evTitle","evYear","evOrg","evRole","evNote"].forEach(x=>document.getElementById(x).value="");
  save();render();
};
function evEdit(evId){
  const ev=S.events.find(x=>x.id===evId); if(!ev) return;
  document.getElementById("evTitle").value=ev.title||"";
  document.getElementById("evYear").value=ev.year||"";
  document.getElementById("evOrg").value=ev.org||"";
  document.getElementById("evRole").value=ev.role||"";
  document.getElementById("evNote").value=ev.note||"";
  _evEditId=evId; _evSave.textContent="Save changes";
  document.getElementById("evTitle").scrollIntoView({behavior:"smooth",block:"center"}); document.getElementById("evTitle").focus();
}

/* ---- Volunteer ---- */
const _volSave=document.getElementById("volSave"); if(_volSave) _volSave.onclick=()=>{
  const year=parseInt(document.getElementById("volYear").value)||null;
  const hours=parseFloat(document.getElementById("volHours").value)||0;
  if(!year||hours<=0){toast("Enter a year and hours");return;}
  S.volunteer.push({id:id(),year,hours,org:document.getElementById("volOrg").value.trim()});
  ["volYear","volHours","volOrg"].forEach(x=>document.getElementById(x).value="");
  save();render();
  toast("🫙 Hours added to "+year+"'s jar");
};

/* ================= CLOUD FILE SYNC (File System Access API) =================
   Link a JSON file in a synced folder (OneDrive/iCloud/Drive). The app writes
   to that local file on every change; the cloud client syncs it across devices.
   Not supported on iPhone/iPad Safari — those fall back to export/import. */
const FS_SUPPORTED = ("showSaveFilePicker" in window) && ("showOpenFilePicker" in window);
let fileHandle=null, cloudDirty=false, _cloudT=null;
// A generation counter, not just the `cloudDirty` boolean below — a write to
// the cloud file routinely takes >1s (OneDrive/iCloud sync backends), and if
// a NEW change came in while a flush was already in flight, the in-flight
// flush's completion used to unconditionally clear cloudDirty — so the
// already-scheduled next flush (its setTimeout still pending) would see
// cloudDirty===false when it fired and silently skip, permanently dropping
// that last change from the cloud copy. Comparing generations instead of a
// boolean means a flush only "counts" if nothing newer has queued since it
// started.
let _cloudGen=0;

// tiny IndexedDB to persist the file handle across sessions
function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open("ops_cloud",1);r.onupgradeneeded=()=>r.result.createObjectStore("h");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function idbSet(k,v){const db=await idbOpen();return new Promise((res,rej)=>{const t=db.transaction("h","readwrite");t.objectStore("h").put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);});}
async function idbGet(k){const db=await idbOpen();return new Promise((res,rej)=>{const t=db.transaction("h","readonly");const rq=t.objectStore("h").get(k);rq.onsuccess=()=>res(rq.result);rq.onerror=()=>rej(rq.error);});}
async function idbDel(k){const db=await idbOpen();return new Promise((res)=>{const t=db.transaction("h","readwrite");t.objectStore("h").delete(k);t.oncomplete=()=>res();});}

async function verifyPerm(handle, write){
  const opts={mode: write?"readwrite":"read"};
  if((await handle.queryPermission(opts))==="granted") return true;
  if((await handle.requestPermission(opts))==="granted") return true;
  return false;
}
function cloudWriteDebounced(){
  if(!fileHandle) return;
  cloudDirty=true; _cloudGen++; clearTimeout(_cloudT);
  _cloudT=setTimeout(cloudFlush, 800);
}
async function cloudFlush(){
  if(!fileHandle||!cloudDirty) return;
  const gen=_cloudGen; // snapshot — see _cloudGen's declaration for why
  try{
    if(!(await verifyPerm(fileHandle,true))){ setCloudStatus("permission needed — tap 'link cloud file' to re-grant", true); return; }
    const w=await fileHandle.createWritable();
    await w.write(JSON.stringify(S,null,2));
    await w.close();
    if(gen===_cloudGen){ cloudDirty=false; }
    // else: a newer change queued while this write was in flight — leave
    // cloudDirty true so the already-scheduled next flush actually runs.
    setCloudStatus(null);
  }catch(e){ setCloudStatus("couldn't write the cloud file — re-link or export", true); }
}
async function linkCloudFile(){
  if(!FS_SUPPORTED){
    setCloudStatus("This device can't link a file (iPhone/Safari). Use export/import to move data here.", true);
    return;
  }
  const existing=confirm("Link your Operations data file.\n\nOK = pick an EXISTING operations-data.json (e.g. already in your OneDrive)\nCancel = create a NEW file in your OneDrive folder");
  try{
    let handle;
    if(existing){
      [handle]=await window.showOpenFilePicker({types:[{description:"Operations data",accept:{"application/json":[".json"]}}]});
      // read it in and adopt that data
      if(await verifyPerm(handle,false)){
        const f=await handle.getFile(); const txt=await f.text();
        if(txt.trim()){
          // A genuinely empty file is fine (a new/blank OneDrive placeholder) —
          // proceed to the initial write below, which fills it with the
          // current local state. But a NON-empty file that fails to parse (a
          // 0-byte-turned-partial sync, truncated mid-write) used to be
          // silently swallowed here and then immediately overwritten by that
          // same initial write a few lines down — destroying whatever real
          // data was actually in the file, with no warning at all. Abort the
          // link instead so the user can investigate/re-sync before anything
          // gets overwritten.
          let data;
          try{ data=JSON.parse(txt); }
          catch(_){ setCloudStatus("that file didn't parse as valid JSON — link aborted so nothing got overwritten. Check the file, then try again.", true); return; }
          if(data&&typeof data==="object"&&!Array.isArray(data)){ localStorage.setItem(KEY,JSON.stringify(data)); S=load(); seedSkillsIfEmpty(); }
          else { setCloudStatus("that file isn't a recognizable Operations save — link aborted so nothing got overwritten.", true); return; }
        }
      }
    } else {
      handle=await window.showSaveFilePicker({suggestedName:"operations-data.json",types:[{description:"Operations data",accept:{"application/json":[".json"]}}]});
    }
    fileHandle=handle;
    await idbSet("handle",handle);
    if(!(await verifyPerm(fileHandle,true))){ setCloudStatus("permission not granted", true); return; }
    // initial write so the file holds current data
    cloudDirty=true; await cloudFlush();
    render();
    setCloudStatus(null);
    toast("☁️ Cloud file linked — data now auto-saves there");
  }catch(e){ /* user cancelled picker — ignore */ }
}
async function unlinkCloudFile(){
  fileHandle=null; await idbDel("handle"); render(); setCloudStatus(null);
  toast("Cloud file unlinked on this device");
}
function setCloudStatus(msg,warn){
  const hint=document.getElementById("cloudHint"), foot=document.getElementById("footStatus");
  if(foot){
    const synced=[];
    if(fileHandle) synced.push("your linked cloud file");
    // Gated on _tocDataConfirmed too, not just _tocPresent — TOC answering
    // the health check doesn't mean writes are actually enabled (see
    // _tocDataConfirmed's own comment); the footer used to claim "synced to
    // TOC" for the whole session even when both data-fetch attempts timed
    // out and tocWriteDebounced() was silently refusing every write.
    if(typeof _tocPresent!=="undefined"&&_tocPresent&&typeof _tocDataConfirmed!=="undefined"&&_tocDataConfirmed) synced.push("TOC");
    foot.textContent = synced.length ? "OPERATIONS · synced to "+synced.join(" & ") : "OPERATIONS · all data lives only on this device";
    foot.className = synced.length?"linked":"";
  }
  if(hint){ hint.textContent = msg||""; hint.className = "cloud-hint"+(warn?" warn":""); }
}
// on launch: try to restore a previously linked handle and read latest from it
async function cloudInit(){
  if(!FS_SUPPORTED) return;
  try{
    const h=await idbGet("handle");
    if(h){
      fileHandle=h;
      if(await verifyPerm(h,false)){
        const f=await h.getFile(); const txt=await f.text();
        // `typeof x==="object"` alone also accepts an array — silently adopts
        // as a save whose every top-level key becomes a numeric index,
        // effectively a factory reset with no warning. Require a real object.
        if(txt.trim()){ try{ const data=JSON.parse(txt); if(data&&typeof data==="object"&&!Array.isArray(data)){ localStorage.setItem(KEY,JSON.stringify(data)); S=load(); seedSkillsIfEmpty(); render(); } }catch(_){} }
      }
    }
  }catch(e){}
  setCloudStatus(null);
}
const _cloudBtn=document.getElementById("cloudBtn");
if(_cloudBtn) _cloudBtn.onclick=()=>{ if(fileHandle){ if(confirm("Unlink this cloud file on this device? Your data stays; it just stops auto-saving to the file.")) unlinkCloudFile(); } else linkCloudFile(); };

/* ================= TOC DATA BRIDGE =================
   On a machine that also runs TOC (a personal offline project-launcher app —
   see its own repo), TOC serves this app from its own loopback origin, which
   has its own separate localStorage from wherever else this app is opened
   (its hosted URL, an installed PWA icon, etc). TOC can optionally persist
   this app's save data to a file inside THIS repo's own personal/ folder
   (personal/toc-save.json — gitignored, never committed), which — because
   this repo already lives in a synced folder — carries progress across every
   device that has both TOC and this repo, independent of any browser's
   storage. Entirely opt-in from TOC's side (data_bridge: true in its
   registry) and entirely best-effort from this side: a quick loopback health
   check decides whether TOC is even running; if it isn't, this whole section
   is a no-op. Still just localhost — no different in spirit than the cloud
   file sync above, just a second, TOC-provided sync target. */
const TOC_BASE="http://127.0.0.1:8799", TOC_PROJECT="operations";
let _tocPresent=false, _tocDirty=false, _tocT=null;
// Separate from _tocPresent (just "the TOC server answered the health
// check") — this only becomes true once we have a DEFINITIVE read on
// whether real saved data exists there: either we adopted it, or the
// server gave a real "nothing here yet" answer. A real incident traced to
// this distinction not existing: the data-fetch below has a short timeout
// (TOC's backend can be slow to respond on a cold start), and on a timeout
// the old code still marked TOC "present" and let writes proceed — so the
// very next save() (anything at all — even an automatic checkDailyReset())
// would flush whatever fresh/local state was already in memory over TOC's
// real stored save, silently destroying it. Gating writes on a *confirmed*
// read (not just "the server responded to a ping") closes that window: an
// ambiguous outcome (timeout/network error) now leaves writes disabled for
// the session instead of risking a clobber.
let _tocDataConfirmed=false;
let _tocGen=0; // same generation-counter fix as cloudFlush() above — see _cloudGen's comment
function tocWriteDebounced(){
  if(!_tocPresent||!_tocDataConfirmed) return;
  _tocDirty=true; _tocGen++; clearTimeout(_tocT);
  _tocT=setTimeout(tocFlush, 800);
}
async function tocFlush(){
  if(!_tocPresent||!_tocDataConfirmed||!_tocDirty) return;
  const gen=_tocGen;
  try{
    const r=await fetch(`${TOC_BASE}/api/projects/${TOC_PROJECT}/data`,{
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(S)
    });
    if(r.ok && gen===_tocGen) _tocDirty=false;
  }catch(e){ /* TOC likely closed mid-session — next save retries */ }
}
// One fetch attempt for TOC's stored project data, with a given timeout —
// factored out so tocInit() can retry once on a slow/cold first response
// instead of writing the whole session off after a single 800ms miss.
async function tocFetchData(timeoutMs){
  const r=await fetch(`${TOC_BASE}/api/projects/${TOC_PROJECT}/data`,{signal:AbortSignal.timeout(timeoutMs)});
  return r;
}
// on launch: if TOC is running and already opted this project in, adopt its
// save (if any) — runs after cloudInit() so TOC, the most persistent source,
// has the final say when both a cloud file and TOC are present.
async function tocInit(){
  try{
    const health=await fetch(`${TOC_BASE}/api/health`,{signal:AbortSignal.timeout(800)});
    if(!health.ok) return;
    const hbody=await health.json();
    if(hbody.app!=="TOC") return;
  }catch(e){ return; } // no TOC on this machine/port — silently do nothing
  _tocPresent=true;
  // Try the real data fetch twice (800ms, then a more generous 3000ms) before
  // giving up — a local backend can be genuinely slow to answer its first
  // request after a cold start, and treating that as "confirmed empty" is
  // exactly the bug that caused real save data to be overwritten before.
  for(const timeoutMs of [800,3000]){
    try{
      const r=await tocFetchData(timeoutMs);
      if(r.ok){
        const body=await r.json();
        if(body.ok&&body.data&&typeof body.data==="object"&&!Array.isArray(body.data)){
          localStorage.setItem(KEY,JSON.stringify(body.data)); S=load(); seedSkillsIfEmpty(); render();
        }
        // A real, well-formed response either way (with or without data) is
        // a definitive answer — safe to allow writes from here on.
        _tocDataConfirmed=true;
      }
      break; // got a real HTTP response (ok or not) — stop retrying either way
    }catch(e){
      // timeout/network error — genuinely ambiguous, try again once before
      // giving up; on the final failure _tocDataConfirmed stays false, so
      // tocWriteDebounced() keeps refusing to write for this whole session
      // rather than guessing.
    }
  }
  setCloudStatus(null);
}
cloudInit().then(tocInit);

/* ================= SKILLS (levels, decay, promotion quests) ================= */
