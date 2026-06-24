function renderSkillsTab(){
  const listEl=document.getElementById("skList"); if(!listEl) return;
  if(syncSkillsFromActivity()) save();
  // if the tree view is the active one, (re)draw it too
  if(_skView==="tree") renderSkillTree();
  renderSkLevelInputs();
  // populate parent dropdown (top-level, non-group OR group skills can be parents; offer all non-sub skills)
  const psel=document.getElementById("skParent");
  if(psel){
    const cur=psel.value;
    const candidates=S.lifeSkills.filter(s=>!s.parent); // can nest under any top-level skill
    psel.innerHTML='<option value="">— top-level skill —</option>'+candidates.map(s=>`<option value="${esc(s.name)}">${esc(s.name)} (${SK_CAT[s.cat]||s.cat})</option>`).join("");
    psel.value=cur;
  }
  // Compact "needs attention" summary — slipped skills + ones ready to level. The actual
  // level-up action lives on each skill card's ladder (tap the rung you've reached).
  const aEl=document.getElementById("skAttention");
  const leaves=S.lifeSkills.filter(s=>!s.group && s.levels && s.levels.length);
  const slipped=leaves.filter(s=>!s.auto && skEffectiveLevel(s)<s.currentLevel);
  const ready=leaves.filter(s=>!s.auto && skEffectiveLevel(s)>=s.currentLevel && s.currentLevel<s.levels.length);
  if(aEl){
    if(slipped.length){
      aEl.innerHTML=`<div class="sk-attn warn">⚠️ <b>${slipped.length}</b> skill${slipped.length!==1?'s have':' has'} slipped and can be reclaimed — find ${slipped.length!==1?'them':'it'} below and tap the level you can still do. <span class="sk-attn-names">${slipped.slice(0,4).map(s=>esc(s.name)).join(", ")}${slipped.length>4?"…":""}</span></div>`;
    } else if(ready.length){
      aEl.innerHTML=`<div class="sk-attn">🌱 Reached a new level in a skill? Tap that rung on its card below to mark it. <span class="sk-attn-names">${ready.length} skill${ready.length!==1?'s':''} can grow</span></div>`;
    } else {
      aEl.innerHTML="";
    }
  }
  // skill list — category → top-level skill (group shows subs) → leaf
  if(!S.lifeSkills.length){ listEl.innerHTML=`<div class="aw-empty"><span class="big">🧠</span>No skills yet. Add one above to start tracking levels.</div>`; return; }

// Return the tier {label, from, to} that applies at a given effective level, from a skill's
// `tiers` field: [{label:"Basics", upTo:3}, {label:"Advanced", upTo:6}, ...].
// upTo is the highest level that still belongs to that tier. Falls back to null if no tiers.
function skTier(sk, eff){
  if(!sk.tiers || !sk.tiers.length) return null;
  const lvl=Math.max(1, eff||1);
  for(const t of sk.tiers){ if(lvl<=t.upTo) return t; }
  return sk.tiers[sk.tiers.length-1];
}
function skProgressBlock(sk, eff){
  let out="";
  // Full 10-step roadmap at a glance, with tier bands marked
  if(sk.roadmap && sk.roadmap.length){
    const tierAt = lvl => skTier(sk, lvl);
    out+=`<div class="sk-roadmap"><b>🗺️ Roadmap to peak:</b><ol class="sk-roadmap-list">${sk.roadmap.map((step,i)=>{
      const lvl=i+1;
      const t=tierAt(lvl), prevT=i>0?tierAt(i):null;
      const newTier = t && (!prevT || prevT.label!==t.label);
      const band = newTier ? `<span class="sk-tier-band">${esc(t.label)}</span>` : "";
      return `<li class="${lvl<=eff?'done':''} ${lvl===eff?'cur':''}">${band}${esc(step)}</li>`;
    }).join("")}</ol></div>`;
  }
  // In-depth: how to hold the current level
  const curLvl=Math.max(1,eff||1);
  if(sk.maintain && sk.maintain[curLvl-1]){
    out+=`<p class="sk-maintain"><b>🔒 Hold L${curLvl} (maintain):</b> ${esc(sk.maintain[curLvl-1])}</p>`;
  }
  // In-depth: how to reach the next level
  const nextLvl=(eff||0)+1;
  if(sk.advance && sk.advance[nextLvl-1] && nextLvl<=(sk.levels?sk.levels.length:10)){
    out+=`<p class="sk-advance"><b>⬆️ Reach L${nextLvl} (advance):</b> ${esc(sk.advance[nextLvl-1])}</p>`;
  } else if(eff>=(sk.levels?sk.levels.length:10) && sk.levels){
    out+=`<p class="sk-advance"><b>🏔️ Peak reached:</b> You're at the documented human ceiling for this skill. Maintain it — that alone is elite.</p>`;
  }
  return out;
}
  const leafCard=(sk,isSub)=>{
    const eff=skEffectiveLevel(sk), maxed=sk.currentLevel>=sk.levels.length && eff>=sk.levels.length;
    const days=skDaysLeft(sk);
    const ladder=sk.levels.map(l=>{
      const have=l.n<=eff, current=l.n===eff;
      const next = l.n===eff+1;                       // the level you'd reach next
      const reachable = !sk.auto && l.n>eff;          // any un-held level can be marked (manual skills)
      const cls=`sk-rung ${have?'have':''} ${current?'current':''} ${reachable?'reachable':''} ${next?'next':''}`;
      const attrs = reachable ? ` role="button" tabindex="0" data-skreach="${sk.id}" data-skreachlvl="${l.n}"` : "";
      const cta = next ? `<span class="sk-rung-cta">tap if reached →</span>` : (reachable?`<span class="sk-rung-cta dim">reached?</span>`:"");
      return `<div class="${cls}"${attrs}><div class="dot">${have?'✓':l.n}</div><div class="rung-txt"><b>L${l.n}.</b> ${esc(l.ability)}</div>${cta}</div>`;
    }).join("");
    let fadeNote="";
    if(sk.currentLevel>0){
      if(eff<sk.currentLevel) fadeNote=`<div class="sk-fade-note warn">⚠️ Slipped from L${sk.currentLevel} to L${eff} — tap L${eff+1} below when you can do it again to reclaim it.</div>`;
      else if(days!==null) fadeNote=`<div class="sk-fade-note ${days<=Math.ceil(sk.fadeDays*0.34)?'warn':''}">Fades in ${days} day${days!==1?'s':''} (every ${sk.fadeDays}d).</div>`;
    }
    const histItems=(sk.history||[]).filter(h=>h.type==="promote"||h.type==="decay").slice(-8);
    const histHtml=histItems.length>1?(()=>{
      const parts=histItems.map((h,i)=>{
        const dt=new Date(h.ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});
        const sep=i<histItems.length-1?'<span class="sk-hist-sep">→</span>':'';
        return '<span class="sk-hist-item '+h.type+'">L'+h.level+'<span class="sk-hist-date"> '+dt+'</span></span>'+sep;
      });
      return '<div class="sk-hist">'+parts.join('')+'</div>';
    })():'';
    const peak=sk.peakLevel||0;
    const peakStr = (peak>0 && peak>eff) ? ` · peak L${peak}` : "";
    let reclaimNote="";
    if(peak>eff && peak>0){
      reclaimNote=`<div class="sk-fade-note reclaim">🏔️ You've held Level ${peak} before — reclaiming it should come faster than learning it new.</div>`;
    }
    const tier=skTier(sk, eff);
    const tierPrefix = (tier && eff>0) ? `<span class="sk-tier-prefix">${esc(tier.label)}:</span> ` : "";
    const tierBadge = (tier && eff>0) ? ` <span class="sk-tier-tag">${esc(tier.label)}</span>` : "";
    return `<div class="sk-card ${isSub?'sk-sub':''}">
      <div class="sk-card-top">
        <div><div class="sk-card-name">${tierPrefix}${esc(sk.name)}${sk.auto?' <span class="sk-auto">auto</span>':''}</div></div>
        <span class="sk-level-badge ${maxed?'maxed':''}">${eff>0?'Lv '+eff:'Unproven'}${tierBadge}${maxed?' · MAX':peakStr}</span>
        <button class="sk-copy-btn" data-skcopy="${sk.id}" title="Copy skill card">⧉</button>
        <button class="sk-card-edit" data-skedit="${sk.id}">✎</button>
        <button class="sk-card-del" data-skdel="${sk.id}">✕</button>
      </div>
      <div class="sk-ladder">${ladder}</div>
      ${histHtml}
      ${fadeNote}
      ${reclaimNote}
      ${(sk.why||sk.whatYouDo||sk.howTo||sk.prep||sk.recover||sk.safety||sk.roadmap||sk.advance||sk.maintain)?`<details class="sk-info"><summary>ℹ️ Why, how &amp; how to level up</summary><div class="sk-info-body">${sk.why?`<p><b>Why:</b> ${esc(sk.why)}</p>`:''}${sk.whatYouDo?`<p><b>What you do:</b> ${esc(sk.whatYouDo)}</p>`:''}${sk.howTo?`<p><b>How:</b> ${esc(sk.howTo)}</p>`:''}${sk.prep?`<p class="sk-prep"><b>🤸 Warm-up before:</b> ${esc(sk.prep)}</p>`:''}${sk.recover?`<p class="sk-recover"><b>🧘 Stretch after:</b> ${esc(sk.recover)}</p>`:''}${skProgressBlock(sk,eff)}${sk.safety?`<p class="sk-safety">⚠️ ${esc(sk.safety)}</p>`:''}</div></details>`:''}
      <button class="sk-work" data-skwork="${sk.id}">▶ Work on this</button>
      <div class="sk-work-panel" id="skwork-${sk.id}"></div>
    </div>`;
  };
  const groupCard=sk=>{
    const subs=skSubsOf(sk);
    const rolled=skRolledLevel(sk);
    return `<div class="sk-group">
      <div class="sk-group-top">
        <div class="sk-group-name">${esc(sk.name)} <span class="sk-group-sub">${subs.length} sub-skill${subs.length!==1?'s':''}</span></div>
        <span class="sk-level-badge group">Lv ${fmtLvl(rolled)}</span>
        <button class="sk-card-edit" data-skedit="${sk.id}">✎</button>
        <button class="sk-card-del" data-skdel="${sk.id}">✕</button>
      </div>
      <div class="sk-subs">${subs.map(s=>leafCard(s,true)).join("")}</div>
    </div>`;
  };
  let html="";
  SK_CAT_ORDER.forEach(cat=>{
    const tops=skTopLevelInCat(cat);
    if(!tops.length) return;
    const catLvl=catRolledLevel(cat);
    html+=`<div class="sk-cat-hd" id="skcat-${cat}"><span class="sk-cat-name">${SK_CAT[cat]}</span><span class="sk-cat-lvl">Lv ${fmtLvl(catLvl)}</span></div>`;
    tops.forEach(sk=>{ html += sk.group ? groupCard(sk) : leafCard(sk,false); });
  });
  listEl.innerHTML=html;
  // populate the right-side category jump bar (only cats that have skills)
  const jb=document.getElementById("skJumpbar");
  if(jb){
    const icons={tactical:"⚔️",physical:"💪",cognitive:"🧠",physiological:"❤️",technical:"⚙️",leadership:"⭐",academic:"📚",personal:"🌱"};
    jb.innerHTML=SK_CAT_ORDER.filter(c=>skTopLevelInCat(c).length).map(c=>
      `<button data-skjump="${c}">${icons[c]||"•"}<span class="jb-tip">${SK_CAT[c]}</span></button>`).join("");
  }
}

