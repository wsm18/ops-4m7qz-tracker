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
  cloudDirty=true; clearTimeout(_cloudT);
  _cloudT=setTimeout(cloudFlush, 800);
}
async function cloudFlush(){
  if(!fileHandle||!cloudDirty) return;
  try{
    if(!(await verifyPerm(fileHandle,true))){ setCloudStatus("permission needed — tap 'link cloud file' to re-grant", true); return; }
    const w=await fileHandle.createWritable();
    await w.write(JSON.stringify(S,null,2));
    await w.close();
    cloudDirty=false; setCloudStatus(null);
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
        if(txt.trim()){ try{ const data=JSON.parse(txt); if(data&&typeof data==="object"){ localStorage.setItem(KEY,JSON.stringify(data)); S=load(); seedSkillsIfEmpty(); } }catch(_){} }
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
    if(typeof _tocPresent!=="undefined"&&_tocPresent) synced.push("TOC");
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
        if(txt.trim()){ try{ const data=JSON.parse(txt); if(data&&typeof data==="object"){ localStorage.setItem(KEY,JSON.stringify(data)); S=load(); seedSkillsIfEmpty(); render(); } }catch(_){} }
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
function tocWriteDebounced(){
  if(!_tocPresent) return;
  _tocDirty=true; clearTimeout(_tocT);
  _tocT=setTimeout(tocFlush, 800);
}
async function tocFlush(){
  if(!_tocPresent||!_tocDirty) return;
  try{
    const r=await fetch(`${TOC_BASE}/api/projects/${TOC_PROJECT}/data`,{
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(S)
    });
    if(r.ok) _tocDirty=false;
  }catch(e){ /* TOC likely closed mid-session — next save retries */ }
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
  try{
    const r=await fetch(`${TOC_BASE}/api/projects/${TOC_PROJECT}/data`,{signal:AbortSignal.timeout(800)});
    if(r.ok){
      const body=await r.json();
      if(body.ok&&body.data&&typeof body.data==="object"){
        localStorage.setItem(KEY,JSON.stringify(body.data)); S=load(); seedSkillsIfEmpty(); render();
      }
    }
  }catch(e){ /* TOC's running but this project isn't opted in / a transient hiccup — keep syncing writes */ }
  setCloudStatus(null);
}
cloudInit().then(tocInit);

/* ================= SKILLS (levels, decay, promotion quests) ================= */
