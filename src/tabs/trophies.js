// ===== Carved Rings — trophy cabinet, one ring per level ever reached =====
// Uses peakLevel so rings are permanent even if a skill decays.

function getTierLabelForLevel(sk, level){
  if(!sk.tiers||!sk.tiers.length) return `L${level}`;
  for(const t of sk.tiers){ if(level<=t.upTo) return t.label; }
  return `L${level}`;
}

function getTierIndexForLevel(sk, level){
  if(!sk.tiers||!sk.tiers.length) return 0;
  for(let i=0;i<sk.tiers.length;i++){ if(level<=sk.tiers[i].upTo) return i; }
  return sk.tiers.length-1;
}

function renderSkillRings(sk, pm){
  const peak=sk.peakLevel||0;
  const levels=sk.levels||[];
  const maxLevel=levels.length;
  if(!maxLevel) return '';
  const isMaxed=peak>=maxLevel;

  const chips=levels.map((lv,i)=>{
    const lvNum=i+1;
    const earned=peak>=lvNum;
    const isMax=lvNum===maxLevel;
    const tierLabel=getTierLabelForLevel(sk,lvNum);
    const tierIdx=getTierIndexForLevel(sk,lvNum);
    const title=`${tierLabel} · ${sk.name} · L${lvNum}${earned?' (earned)':' (not yet)'}`;
    const interactAttrs=earned?` role="button" tabindex="0" data-trophychip="${sk.id}" data-trophylvl="${lvNum}"`:"";
    return `<div class="trophy-chip t${tierIdx} ${earned?'on':''} ${isMax&&earned?'max':''}"
      title="${esc(title)}"
      style="${earned?`--tpc:${pm.color}`:''}"
      ${interactAttrs}
    >${isMax&&earned?'★':lvNum}</div>`;
  }).join('');

  return `<div class="trophy-skill ${peak>0?'started':''}">
    <div class="trophy-skill-info">
      <div class="trophy-skill-name">${esc(sk.name)}</div>
      ${peak>0?`<div class="trophy-skill-tier">${getTierLabelForLevel(sk,peak)} · L${peak}/${maxLevel}${isMaxed?' ✦':''}</div>`:'<div class="trophy-skill-tier unstarted">not yet started</div>'}
    </div>
    <div class="trophy-chips">${chips}</div>
  </div>`;
}

function renderTrophies(){
  const el=document.getElementById("trophyGrid");
  const statsEl=document.getElementById("trophyStats");
  if(!el) return;

  const leafSkills=S.lifeSkills.filter(s=>!s.group&&s.levels&&s.levels.length);
  const totalRings=leafSkills.reduce((n,s)=>n+s.levels.length,0);
  const earnedRings=leafSkills.reduce((n,s)=>n+Math.min(s.peakLevel||0,s.levels.length),0);
  const pct=totalRings>0?Math.round(earnedRings/totalRings*100):0;

  if(statsEl){
    statsEl.innerHTML=`<div class="trophy-summary">
      <div class="trophy-counts"><span class="trophy-earned-n">${earnedRings}</span><span class="trophy-total-n"> / ${totalRings}</span><span class="trophy-rings-label"> rings carved · ${pct}% of the full tree</span></div>
      <div class="trophy-global-bar"><div class="trophy-global-fill" style="width:${pct}%"></div></div>
    </div>`;
  }

  if(!leafSkills.length){
    el.innerHTML=`<div class="aw-empty"><span class="big">🌱</span>Level up skills in The Tree to start carving your rings.</div>`;
    return;
  }

  let html='';
  for(const cat of SK_CAT_ORDER){
    const pm=PATH_META[cat]; if(!pm) continue;
    const catLeaves=leafSkills.filter(s=>s.cat===cat);
    if(!catLeaves.length) continue;
    const catEarned=catLeaves.reduce((n,s)=>n+Math.min(s.peakLevel||0,s.levels.length),0);
    const catTotal=catLeaves.reduce((n,s)=>n+s.levels.length,0);
    const catPct=catTotal>0?Math.round(catEarned/catTotal*100):0;
    const anyEarned=catEarned>0;

    html+=`<details class="trophy-path ${anyEarned?'has-rings':''}" ${anyEarned?'open':''}>
      <summary class="trophy-path-hdr" style="--tpc:${pm.color}">
        <span class="trophy-path-ic">${pm.icon}</span>
        <span class="trophy-path-nm">${pm.name}</span>
        <span class="trophy-path-ct">${catEarned}/${catTotal}</span>
        <span class="trophy-path-bar-wrap"><span class="trophy-path-bar-fill" style="width:${catPct}%"></span></span>
      </summary>
      <div class="trophy-path-body">
        ${catLeaves.map(sk=>renderSkillRings(sk,pm)).join('')}
      </div>
    </details>`;
  }

  el.innerHTML=html||`<div class="aw-empty">No skills seeded yet.</div>`;
}

let _lastTrophyChip=null;
document.addEventListener("click",e=>{
  const chip=e.target.closest("[data-trophychip]");
  const detail=document.getElementById("trophyDetail");
  if(!detail) return;
  if(!chip){ detail.style.display="none"; _lastTrophyChip=null; return; }
  const skId=chip.dataset.trophychip;
  const lvNum=parseInt(chip.dataset.trophylvl)||1;
  if(_lastTrophyChip===chip){ detail.style.display="none"; _lastTrophyChip=null; return; }
  _lastTrophyChip=chip;
  const sk=S.lifeSkills.find(x=>x.id===skId); if(!sk){ detail.style.display="none"; return; }
  const lvDef=(sk.levels||[]).find(l=>l.n===lvNum);
  const tierLabel=getTierLabelForLevel(sk,lvNum);
  const pm=PATH_META[sk.cat]||{name:sk.cat,icon:"•"};
  detail.innerHTML=`<div class="td-chip-icon">${pm.icon}</div>
    <div class="td-chip-body">
      <div class="td-chip-title">◆ ${esc(tierLabel)} · ${esc(sk.name)} · L${lvNum}</div>
      <div class="td-chip-ability">${lvDef?esc(lvDef.ability):"—"}</div>
    </div>`;
  detail.style.display="flex";
  e.stopPropagation();
});
