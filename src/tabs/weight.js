/* ================= THE WEIGHT (promise ledger — solemn, no game mechanics) ============= */
const W_WEIGHTS={open:1,standing:3,kept:1,broken:1};
const W_COIN={ ordinary:{fill:"#c7cace",sheen:"#eef0f2",rx:3.0,ry:2.5}, serious:{fill:"#cda84e",sheen:"#f0d98a",rx:3.5,ry:3.0}, standing:{fill:"#c47b52",sheen:"#e6a878",rx:4.1,ry:3.5} };
function wseed(i,s){const x=Math.sin((i+1)*12.9898+s*78.233)*43758.5453;return x-Math.floor(x);}
function coinPile(items,x0,x1,yBot,fallback,salt){
  const order={standing:0,serious:1,ordinary:2};
  const list=items.slice().sort((a,b)=>(order[a.tier]??1)-(order[b.tier]??1));
  const n=Math.min(list.length,28); if(!n) return "";
  const w=x1-x0, coinW=8.5, perRow=Math.max(3,Math.floor(w/coinW)), rowH=5.2; let dots="";
  for(let i=0;i<n;i++){
    const p=list[i], st=W_COIN[p&&p.tier]||{fill:fallback,sheen:"rgba(255,255,255,.5)",rx:3.4,ry:2.9};
    const row=Math.floor(i/perRow), idx=i%perRow, stagger=(row%2)?coinW/2:0, usable=w-coinW;
    let x=x0+coinW/2+(idx/Math.max(1,perRow-1))*usable+stagger+(wseed(i,salt)-0.5)*2.4;
    x=Math.max(x0+st.rx+1,Math.min(x1-st.rx-1,x));
    const y=yBot-st.ry-row*rowH-(wseed(i,salt+5)-0.5)*1.2;
    dots+=`<g><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${st.rx}" ry="${st.ry}" fill="${st.fill}" opacity=".96" stroke="rgba(0,0,0,.3)" stroke-width=".5"/><ellipse cx="${(x-st.rx*0.3).toFixed(1)}" cy="${(y-st.ry*0.35).toFixed(1)}" rx="${(st.rx*0.45).toFixed(1)}" ry="${(st.ry*0.35).toFixed(1)}" fill="${st.sheen}" opacity=".5"/></g>`;
  }
  return dots;
}
function jarOpen(items){return `<svg class="jar-vessel" viewBox="0 0 80 130" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="co"><path d="M12 40 Q12 36 18 36 L62 36 Q68 36 68 40 L66 116 Q66 122 60 122 L20 122 Q14 122 14 116 Z"/></clipPath></defs><path d="M8 38 Q40 26 72 38" fill="none" stroke="#d8b06a" stroke-width="2.2" opacity=".85"/><path d="M12 40 Q12 36 18 36 L62 36 Q68 36 68 40 L66 116 Q66 122 60 122 L20 122 Q14 122 14 116 Z" fill="rgba(216,176,106,.05)" stroke="#d8b06a" stroke-width="1.8" opacity=".8"/><g clip-path="url(#co)">${coinPile(items,14,66,121,"#d8b06a",1)}</g></svg>`;}
function jarStanding(items){return `<svg class="jar-vessel" viewBox="0 0 80 130" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="cs"><path d="M18 32 L62 32 L62 118 L18 118 Z"/></clipPath></defs><rect x="26" y="16" width="28" height="12" rx="1.5" fill="none" stroke="#b3a0cf" stroke-width="2" opacity=".8"/><path d="M18 32 L62 32 L62 118 Q62 120 60 120 L20 120 Q18 120 18 118 Z" fill="rgba(125,106,156,.06)" stroke="#b3a0cf" stroke-width="2" opacity=".85"/><line x1="18" y1="58" x2="62" y2="58" stroke="#b3a0cf" stroke-width="1" opacity=".4"/><line x1="18" y1="88" x2="62" y2="88" stroke="#b3a0cf" stroke-width="1" opacity=".4"/><g clip-path="url(#cs)">${coinPile(items,18,62,119,"#b3a0cf",2)}</g></svg>`;}
function jarKept(items){return `<svg class="jar-vessel" viewBox="0 0 80 130" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="ck"><path d="M16 44 Q16 40 22 40 L58 40 Q64 40 64 44 L58 104 Q58 106 54 106 L26 106 Q22 106 22 104 Z"/></clipPath></defs><path d="M30 118 L50 118 L46 110 L34 110 Z" fill="none" stroke="#9fc59a" stroke-width="1.6" opacity=".8"/><line x1="40" y1="106" x2="40" y2="110" stroke="#9fc59a" stroke-width="1.6" opacity=".8"/><path d="M16 44 Q16 40 22 40 L58 40 Q64 40 64 44 L58 104 Q58 106 54 106 L26 106 Q22 106 22 104 Z" fill="rgba(159,197,154,.05)" stroke="#9fc59a" stroke-width="1.8" opacity=".85"/><g clip-path="url(#ck)">${coinPile(items,20,60,105,"#9fc59a",3)}</g></svg>`;}
function jarBroken(items){return `<svg class="jar-vessel" viewBox="0 0 80 130" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="cb"><path d="M16 56 Q16 38 40 38 Q64 38 64 56 L62 116 Q62 120 58 120 L22 120 Q18 120 18 116 Z"/></clipPath></defs><path d="M16 56 Q16 38 40 38 Q64 38 64 56 L62 116 Q62 120 58 120 L22 120 Q18 120 18 116 Z" fill="rgba(120,80,70,.10)" stroke="#a6584f" stroke-width="1.8" opacity=".8"/><path d="M44 40 l-5 16 l4 10 l-6 14" fill="none" stroke="#a6584f" stroke-width="1" opacity=".5"/><g clip-path="url(#cb)">${coinPile(items,18,62,119,"#a6584f",4)}</g></svg>`;}
function vesselMemorial(count){return `<svg class="jar-vessel" viewBox="0 0 80 130" preserveAspectRatio="xMidYMid meet"><path d="M30 26 L50 26 L46 32 L34 32 Z" fill="none" stroke="#b3a0cf" stroke-width="2" opacity=".8"/><line x1="40" y1="20" x2="40" y2="26" stroke="#b3a0cf" stroke-width="2" opacity=".8"/><rect x="28" y="32" width="24" height="62" rx="3" fill="rgba(125,106,156,.05)" stroke="#b3a0cf" stroke-width="2" opacity=".85"/><path d="M24 98 L56 98 L52 94 L28 94 Z" fill="none" stroke="#b3a0cf" stroke-width="2" opacity=".8"/><g class="mem-flame"><ellipse cx="40" cy="68" rx="9" ry="13" fill="rgba(220,200,150,.22)"/><path d="M40 54 Q47 64 40 78 Q33 64 40 54 Z" fill="#e6cf94" opacity=".85"/><path d="M40 60 Q44 66 40 76 Q36 66 40 60 Z" fill="#fff4d6" opacity=".9"/></g><text x="40" y="114" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="#b3a0cf" opacity=".7">${count} held</text></svg>`;}

// disc number -> display label (matches Weight app: M-### to self, O-### to other)
function discLabel(p){
  const pre = p.who==="self" ? "M" : "O";
  const n = typeof p.disc==="number" ? p.disc : parseInt(String(p.disc).replace(/\D/g,""))||0;
  return pre+"-"+String(n).padStart(3,"0");
}
function isKeystoneP(p){ return p.keystone===true || (p.who==="self" && (p.disc===1 || p.disc==="M-001")); }
function wKeystone(){ return S.weight.promises.find(isKeystoneP); }

function renderWeight(){
  if(!document.getElementById("weightJars")) return;
  const proms=S.weight.promises||[];
  const nonFavor=proms.filter(p=>!p.favor);
  // carried total: open + standing (standing ×3) — mirrors the Weight app
  let grams=0; nonFavor.forEach(p=>{ if(p.status==="open")grams+=1; else if(p.status==="standing")grams+=3; });
  const carryEl=document.getElementById("weightCarry");
  carryEl.textContent = proms.length ? ("You carry "+grams+(grams===1?" gram":" grams")+" right now.") : "";
  const ilEl=document.getElementById("weightIntegrityLink");
  if(ilEl){
    const isk=(S.lifeSkills||[]).find(s=>s.auto==="weight:integrity");
    ilEl.innerHTML = isk
      ? `<button class="wm-btn ghost" data-gototab="skills">🌳 This ledger drives your Integrity skill — level ${skEffectiveLevel(isk)} →</button>`
      : "";
  }
  // keystone
  const ks=wKeystone();
  const ksEl=document.getElementById("weightKeystone");
  if(ks){ ksEl.innerHTML=`<div class="ks-card"><div class="ks-tag">${discLabel(ks)} · Keystone · ${ks.status}</div><div class="ks-vow">"${esc(ks.text)}"</div></div>`; }
  else if(proms.length){ ksEl.innerHTML=`<div class="ks-card"><div class="ks-tag">Keystone · not in this ledger</div><div class="ks-vow" style="color:var(--ink-faint)">No keystone (M-001) found in the imported ledger.</div></div>`; }
  else { ksEl.innerHTML=`<div class="ks-card"><div class="ks-tag">The Keystone</div><div class="ks-vow">"I will do what I believe is right, and bear the cost of it."</div></div>`; }
  // jars (read-only — no data-wjar binding hooks)
  const buckets={open:[],standing:[],kept:[],broken:[]};
  nonFavor.forEach(p=>{ if(buckets[p.status]) buckets[p.status].push(p); });
  document.getElementById("weightJars").innerHTML=`
    <div class="wjar open"><div class="jarbox">${jarOpen(buckets.open)}</div><div class="wjar-name">Open</div><div class="wjar-count">${buckets.open.length}</div></div>
    <div class="wjar standing"><div class="jarbox">${jarStanding(buckets.standing)}</div><div class="wjar-name">Standing</div><div class="wjar-count">${buckets.standing.length}</div></div>
    <div class="wjar kept"><div class="jarbox">${jarKept(buckets.kept)}</div><div class="wjar-name">Kept</div><div class="wjar-count">${buckets.kept.length}</div></div>
    <div class="wjar broken"><div class="jarbox">${jarBroken(buckets.broken)}</div><div class="wjar-name">Dead</div><div class="wjar-count">${buckets.broken.length}</div></div>`;
  // memorial
  document.getElementById("weightMemorial").innerHTML=vesselMemorial((S.weight.memorial||[]).length);
  // ledger
  const led=document.getElementById("weightLedger");
  const sorted=nonFavor.slice().sort((a,b)=>(isKeystoneP(b)?1:0)-(isKeystoneP(a)?1:0) || (a.disc||0)-(b.disc||0));
  if(sorted.length){
    led.innerHTML=sorted.map(p=>{
      const when=p.date_made?new Date(p.date_made).toLocaleDateString():(p.date||"");
      return `<div class="wl-entry ${isKeystoneP(p)?'keystone':''}">
        <span class="wl-disc">${discLabel(p)}</span>
        <div class="wl-body"><div class="wl-text">${esc(p.text||"")}</div><div class="wl-meta">${p.who==='self'?'to self':'to another'}${p.name?' · '+esc(p.name):''} · ${esc(p.tier||'')}${when?' · '+when:''}</div></div>
        <span class="wl-status ${p.status}">${p.status==='broken'?'dead':p.status}</span>
      </div>`;
    }).join("");
  } else {
    led.innerHTML=`<div class="aw-empty"><span class="big">⚖️</span>No promises mirrored yet. Export your ledger from the Weight app and tap "Update mirror" to bring it in.</div>`;
  }
  // sync-recency footer
  const sfEl=document.getElementById("wmSyncFooter");
  if(sfEl){
    if(S.lastMirrorUpdate){
      const sfD=Math.round((Date.now()-new Date(S.lastMirrorUpdate).getTime())/864e5);
      const sfN=(S.weight.promises||[]).length;
      sfEl.innerHTML=`Last synced ${sfD===0?"today":sfD+" day"+(sfD!==1?"s":"")+" ago"} · ${sfN} entr${sfN!==1?"ies":"y"}`;
    } else { sfEl.innerHTML=""; }
  }
  // daily refresh nudge — fires when the mirror snapshot is from an earlier day
  const nudge=document.getElementById("wmNudge");
  if(nudge){
    const today=new Date().toDateString();
    const stale = S.lastMirrorUpdate && S.lastMirrorUpdate!==today;
    if(stale){
      const since = S.lastMirrorUpdate;
      nudge.className="wm-nudge show";
      nudge.innerHTML=`🌅 Good morning. Your mirror is from <b>${esc(since)}</b> — bring in yesterday's promises?<br><button class="wm-nudge-btn" id="wmNudgeBtn">Update from the Weight app</button>`;
      const nb=document.getElementById("wmNudgeBtn");
      if(nb) nb.onclick=()=>{ const f=document.getElementById("wmFile"); if(f) f.click(); };
    } else {
      nudge.className="wm-nudge"; nudge.innerHTML="";
    }
  }
}
let _wToastT;
function weightToast(msg){const el=document.getElementById("toast");el.innerHTML=`<span style="color:#d8b06a">${esc(msg)}</span>`;el.classList.add("show");clearTimeout(_wToastT);_wToastT=setTimeout(()=>el.classList.remove("show"),2800);}

// Import a Weight-app export (raw `state` JSON: {nextDisc, promises[], memorial[]})
function importWeightLedger(obj){
  if(!obj || !Array.isArray(obj.promises)){ weightToast("That file isn't a Weight ledger export."); return; }
  S.weight = {
    nextDisc: obj.nextDisc||1,
    promises: obj.promises.map(p=>({
      id:p.id||id(), disc:p.disc, favor:!!p.favor, text:p.text||"", who:p.who||"self",
      name:p.name||"", tier:p.tier||"ordinary", keyword:p.keyword||"",
      status:p.status||"open", verify:p.verify||null, stamped:!!p.stamped,
      date_made:p.date_made||null, date_closed:p.date_closed||null, reason:p.reason||""
    })),
    memorial: Array.isArray(obj.memorial)? obj.memorial.map(m=>({name:m.name||"",date_gone:m.date_gone||"",note:m.note||""})) : []
  };
  S.lastMirrorUpdate = new Date().toDateString();
  save(); render();
  const n=S.weight.promises.length, mem=S.weight.memorial.length;
  weightToast(`Mirror updated — ${n} promise${n!==1?'s':''}${mem?`, ${mem} remembered`:''}.`);
}

/* ================= AWARDS — the "I Love Me" wall ================= */
