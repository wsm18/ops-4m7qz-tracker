const SK_PATH_ICON={tactical:"⚔️",physical:"💪",cognitive:"🧠",physiological:"❤️",technical:"⚙️",leadership:"⭐",academic:"📚",personal:"🌱",hearth:"🔥",roots:"🪶"};
// Pan/zoom state for the tree (persists across re-renders within a session)
let _treeView={k:1, x:0, y:0};
function _treeApply(){
  const g=document.getElementById("skTreeG"); if(!g) return;
  g.setAttribute("transform",`translate(${_treeView.x} ${_treeView.y}) scale(${_treeView.k})`);
}
function treeZoom(factor){
  const svg=document.getElementById("skTreeSvg"); if(!svg) return;
  const vb=svg.viewBox.baseVal; const cx0=vb.width/2, cy0=vb.height/2; // zoom about centre
  const nk=Math.max(0.5, Math.min(4, _treeView.k*factor));
  _treeView.x = cx0 - (cx0 - _treeView.x)*(nk/_treeView.k);
  _treeView.y = cy0 - (cy0 - _treeView.y)*(nk/_treeView.k);
  _treeView.k = nk; _treeApply();
}
function treeReset(){ _treeView={k:1,x:0,y:0}; renderSkillTree(); }

function renderSkillTree(){
  const host=document.getElementById("skTree"); if(!host) return;
  if(syncSkillsFromActivity()) save();
  const paths=SK_CAT_ORDER.filter(c=>skTopLevelInCat(c).length);
  if(!paths.length){ host.innerHTML=`<div class="aw-empty"><span class="big">🌱</span>Plant a skill to grow your tree.</div>`; return; }

  // ============================================================
  //  YGGDRASIL — the World Tree. One great ash: roots in the deep,
  //  a single rising trunk, a spreading crown. Each Path is a WORLD
  //  (a realm) hung upon the tree in the Norse manner. A realm is a
  //  luminous disc bearing its sigil; its skills hang from it as
  //  boughs and leaves. No rectangles, no stacked blocks.
  // ============================================================
  const W=2600, H=2640;
  const cx=W/2;
  const crownTopY=H*0.05;             // highest reach of the canopy
  const groundY=H*0.545;              // the world's surface — trunk meets roots
  const rootBotY=H*0.95;              // deepest reach of the roots
  const trunkTopY=H*0.35;             // where the trunk forks into the crown
  let parts=[];                       // wood: trunk, limbs, boughs, roots (behind)
  let glows=[];                       // realm halos (mid layer)
  let leaves=[];                      // realm discs, labels, skill leaves (front)

  // a smooth curved limb (bezier ribbon) — organic, tapering
  function limb(x1,y1,x2,y2,w1,w2,fill,bowK){
    const mx=(x1+x2)/2, my=(y1+y2)/2;
    const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1, nx=-dy/len, ny=dx/len;
    const bow=len*(bowK==null?0.14:bowK);
    const c1x=mx+nx*bow, c1y=my+ny*bow;
    const off =(s)=>`${(x1+nx*w1*s).toFixed(1)} ${(y1+ny*w1*s).toFixed(1)}`;
    const offE=(s)=>`${(x2+nx*w2*s).toFixed(1)} ${(y2+ny*w2*s).toFixed(1)}`;
    const cw=(w1+w2)/2;
    const ctrl=(s)=>`${(c1x+nx*cw*s).toFixed(1)} ${(c1y+ny*cw*s).toFixed(1)}`;
    return `<path d="M${off(1)} Q${ctrl(1)} ${offE(1)} L${offE(-1)} Q${ctrl(-1)} ${off(-1)} Z" fill="${fill}"/>`;
  }

  const barkDark="#332a1b", bark="#4a3d28", barkLite="#5d4c30";

  // ---- ROOTS: three great roots delving to the wells of the deep, each ending
  //  at a root-world. The connecting "limb" for each root-world is the root itself
  //  (drawn here as a thick tapering member), so the world sits at the very tip.
  const rootTipDepth = rootBotY;
  const rootSpreadL = cx-760, rootSpreadR = cx+760, rootCenterX = cx-20;
  // each root: {tip:{x,y}, path:"<svg d>", world:cat}
  const ROOTS=[
    { cat:"hearth",   tip:{x:rootSpreadL,  y:rootTipDepth-120},
      d:`M${cx-30} ${groundY+10} C${cx-260} ${groundY+150} ${rootSpreadL+180} ${groundY+260} ${rootSpreadL} ${rootTipDepth-120}` },
    { cat:"personal", tip:{x:rootCenterX,  y:rootTipDepth},
      d:`M${cx} ${groundY+10} C${cx-30} ${groundY+220} ${cx+10} ${rootTipDepth-360} ${rootCenterX} ${rootTipDepth}` },
    { cat:"roots",    tip:{x:rootSpreadR,  y:rootTipDepth-120},
      d:`M${cx+30} ${groundY+10} C${cx+260} ${groundY+150} ${rootSpreadR-180} ${groundY+260} ${rootSpreadR} ${rootTipDepth-120}` }
  ];
  // draw each root as a thick stroked member (tapered look via two passes)
  ROOTS.forEach(r=>{
    parts.push(`<path d="${r.d}" stroke="${bark}" stroke-width="30" fill="none" stroke-linecap="round" opacity=".95"/>`);
    parts.push(`<path d="${r.d}" stroke="${barkLite}" stroke-width="18" fill="none" stroke-linecap="round" opacity=".9"/>`);
  });
  // fine rootlets fraying off each tip into the deep
  ROOTS.forEach(r=>{
    const tx=r.tip.x, ty=r.tip.y;
    parts.push(`<path d="M${tx} ${ty} q-46 70 -82 96 M${tx} ${ty} q14 80 -6 120 M${tx} ${ty} q50 66 88 90"
        stroke="${barkDark}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`);
  });
  parts.push(`<line x1="${cx-980}" y1="${groundY}" x2="${cx+980}" y2="${groundY}" stroke="#2a2f1c" stroke-width="2.5" opacity=".4"/>`);

  // ---- TRUNK: a single great ash rising from the surface into the crown fork
  parts.push(limb(cx, groundY+10, cx, trunkTopY+18, 40, 23, bark, 0.02));
  parts.push(limb(cx-3, groundY+10, cx-2, trunkTopY+18, 34, 19, barkLite, 0.02));
  parts.push(`<path d="M${cx-11} ${groundY-20} C${cx-15} ${groundY-260} ${cx-8} ${groundY-560} ${cx-6} ${trunkTopY+30}
      M${cx+12} ${groundY-10} C${cx+16} ${groundY-280} ${cx+7} ${groundY-580} ${cx+6} ${trunkTopY+30}"
      stroke="${barkDark}" stroke-width="1.8" fill="none" opacity=".4"/>`);
  // a broad fork-knot where the limbs spring from the trunk, so the crown reads
  // as one continuous swelling of wood rather than separate sticks meeting in space.
  // The swollen limb bases all originate here and overlap across this knot.
  parts.push(`<ellipse cx="${cx}" cy="${trunkTopY}" rx="78" ry="56" fill="${bark}"/>`);
  parts.push(`<ellipse cx="${cx-2}" cy="${trunkTopY-4}" rx="70" ry="46" fill="${barkLite}"/>`);

  // ---- Fixed, balanced placement: each Path maps to a deliberate Norse realm slot.
  //  Canopy (high realms): the aspirational mind & command. Mid: body, war, craft,
  //  knowledge flanking the trunk. Root: the foundational self & vitality, cradled
  //  among the roots. Slots are keyed by category so layout is deterministic & even.
  //  The seven above-ground worlds fan out from the crown-fork on a wide arc,
  //  each far enough apart that a world's full foliage footprint (disc + boughs
  //  + leaves + label, ~230px radius) never reaches a neighbour. The eighth,
  //  the foundational Self, is cradled deep among the roots. Geometry is built
  //  from polar angles + radius so the spacing is guaranteed, not hand-nudged.
  const forkX=cx, forkY=trunkTopY;
  // angle measured from straight-up (−90°). Wide, even fan across the top.
  const ARM=1010;                      // distance from fork to each canopy/mid realm
  const polar=(deg,r)=>({rx:forkX+Math.cos((deg-90)*Math.PI/180)*r,
                         ry:forkY+Math.sin((deg-90)*Math.PI/180)*r});
  const tierOf=(deg)=> Math.abs(deg)<=22 ? "canopy" : "mid";
  function slot(deg,r,w){ const p=polar(deg,r); return {ax:forkX, ay:forkY, rx:p.rx, ry:p.ry, w, tier:tierOf(deg), deg}; }
  const SLOT_BY_CAT={
    // seven worlds on a wide fan across the CROWN: −78° … 0° … +78°
    physical:     slot(-78, ARM, 13),   // low-left
    cognitive:    slot(-52, ARM, 14),   // upper-left
    leadership:   slot(-20, ARM, 15),   // top-left-of-crown
    academic:     slot( 20, ARM, 15),   // top-right-of-crown
    tactical:     slot( 52, ARM, 14),   // upper-right
    technical:    slot( 78, ARM, 13),   // low-right
    physiological:slot(  0, ARM+120, 15), // crown apex, pushed highest & centred
    // THREE foundational worlds in the ROOTS, each at the tip of a real root.
    // The connecting limb for these is the root itself (drawn above), so the
    // world sits at the very end of the root that feeds it.
    hearth:   {ax:ROOTS[0].tip.x, ay:ROOTS[0].tip.y, rx:ROOTS[0].tip.x, ry:ROOTS[0].tip.y, w:0, tier:"root", rootLimb:true},
    personal: {ax:ROOTS[1].tip.x, ay:ROOTS[1].tip.y, rx:ROOTS[1].tip.x, ry:ROOTS[1].tip.y, w:0, tier:"root", rootLimb:true},
    roots:    {ax:ROOTS[2].tip.x, ay:ROOTS[2].tip.y, rx:ROOTS[2].tip.x, ry:ROOTS[2].tip.y, w:0, tier:"root", rootLimb:true}
  };
  // fallback slot ring for any unexpected category
  const fallbackSlots=Object.values(SLOT_BY_CAT);

  // Per-world two-tone palette {core, edge} — luminous, distinct, on-theme
  const realmPal={
    cognitive:    {core:"#6fa0c8", edge:"#2f4a66"},
    leadership:   {core:"#e0c878", edge:"#7a5e22"},
    academic:     {core:"#6fb894", edge:"#2f6450"},
    physical:     {core:"#d89a5a", edge:"#7a4a22"},
    tactical:     {core:"#d87a6a", edge:"#7a3028"},
    technical:    {core:"#7c8fb0", edge:"#3a4663"},
    physiological:{core:"#d87a9a", edge:"#7a2f4a"},
    personal:     {core:"#9ec46a", edge:"#4f6a2c"}
  };

  let palDefs="";
  paths.forEach((cat,i)=>{
    const slot=SLOT_BY_CAT[cat] || fallbackSlots[i%fallbackSlots.length];
    const tops=skTopLevelInCat(cat);
    const groups=tops.filter(s=>s.group);
    const looseLeaves=tops.filter(s=>!s.group);
    const nodes=[...groups, ...looseLeaves];
    const catLvl=catRolledLevel(cat);
    const pal=realmPal[cat]||{core:"#9ec46a",edge:"#4f6a2c"};

    // --- the great branch (or root) from the trunk to this realm.
    // Compute the realm radius up front so the limb can run all the way INTO the
    // disc edge (not stop short in empty space) and plug into it with real width.
    const realmR = 36 + Math.min(20, nodes.length*2.4);
    if(!slot.rootLimb){
      // direction from fork toward realm
      let ldx=slot.rx-slot.ax, ldy=slot.ry-slot.ay; const llen=Math.hypot(ldx,ldy)||1; ldx/=llen; ldy/=llen;
      // limb ends just inside the disc rim so wood and world overlap seamlessly
      const limbEndX = slot.rx - ldx*(realmR-10);
      const limbEndY = slot.ry - ldy*(realmR-10);
      const woodFill = slot.tier==="root" ? bark : barkLite;
      const baseW = slot.w*1.7;            // swollen where it leaves the trunk
      const tipW  = Math.max(9, slot.w*0.85); // still thick where it meets the world
      const bowK  = slot.tier==="root" ? 0.04 : 0.10;
      parts.push(limb(slot.ax, slot.ay, limbEndX, limbEndY, baseW, tipW, woodFill, bowK));
      // a soft inner highlight along the limb
      parts.push(limb(slot.ax, slot.ay, limbEndX, limbEndY, baseW*0.5, tipW*0.45, "rgba(255,255,255,.05)", bowK));
    }
    // for root-tip worlds the connecting root is already drawn (the world sits at its tip)

    // --- skills hang from the realm as boughs. Crown worlds radiate outward from
    // the fork; root worlds fan their boughs DOWNWARD into the deep (rootlets).
    const isCanopy = slot.tier==="canopy";
    let baseAng;
    if(slot.rootLimb){
      baseAng = Math.PI/2;               // straight down — roots reach deeper
    } else {
      let bdx=slot.rx-slot.ax, bdy=slot.ry-slot.ay; const blen=Math.hypot(bdx,bdy)||1; bdx/=blen; bdy/=blen;
      baseAng=Math.atan2(bdy,bdx);
    }
    const m=nodes.length;
    // draw boughs+leaves FIRST so the glowing realm disc sits on top of bough roots
    nodes.forEach((node,j)=>{
      const spread = Math.PI*(slot.rootLimb?1.4:(slot.tier==="root"?1.25:1.0));
      const a = baseAng + (m<=1?0:((j/(m-1))-0.5)*spread);
      const boughLen = 78 + (j%3)*18;            // longer boughs => fuller crown
      const fx = slot.rx + Math.cos(a)*(realmR-4);
      const fy = slot.ry + Math.sin(a)*(realmR-4);
      const tx = slot.rx + Math.cos(a)*(realmR+boughLen);
      const ty = slot.ry + Math.sin(a)*(realmR+boughLen);
      parts.push(limb(fx,fy,tx,ty,4.2,1.6,barkLite,0.12));

      // helper: push a fade-countdown arc onto a leaf if it's about to decay
      function pushFadeRing(cx,cy,baseRad,sk){
        const eff=skEffectiveLevel(sk);
        if(eff<=0) return;
        const days=skDaysLeft(sk);
        if(days===null) return;
        const threshold=sk.fadeDays?sk.fadeDays*0.5:15;
        if(days>=threshold) return;
        const frac=Math.max(0,days/threshold);
        const rr=baseRad+2.8;
        const circ=2*Math.PI*rr;
        const dash=(circ*frac).toFixed(1);
        const offset=(circ*0.25).toFixed(1); // start at 12 o'clock
        const col=days<=Math.ceil((sk.fadeDays||30)*0.34)?"var(--ember)":"var(--gold)";
        leaves.push(`<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(1)}" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="${dash} ${circ.toFixed(1)}" stroke-dashoffset="${offset}" opacity=".8" pointer-events="none"/>`);
      }
      if(node.group){
        const subs=skSubsOf(node);
        const lblAnchor = Math.cos(a)<-0.2?"end":(Math.cos(a)>0.2?"start":"middle");
        leaves.push(`<text x="${(tx+Math.cos(a)*10).toFixed(0)}" y="${(ty+Math.sin(a)*10+3).toFixed(0)}" text-anchor="${lblAnchor}" font-size="11.5" font-weight="600" fill="var(--ink-dim)" style="text-shadow:0 1px 3px #000,0 0 2px #000">${esc(node.name)}</text>`);
        const sc=subs.length;
        subs.forEach((leaf,k)=>{
          // fan the cluster wider and add a second ring so foliage looks full
          const la = a + (sc<=1?0:((k/(sc-1))-0.5)*1.15);
          const lr = 18 + (k%3)*13;
          const lx = tx + Math.cos(la)*lr;
          const ly = ty + Math.sin(la)*lr;
          // tiny twig to each leaf
          parts.push(`<line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${lx.toFixed(1)}" y2="${ly.toFixed(1)}" stroke="${barkLite}" stroke-width="1.1" opacity=".5"/>`);
          const eff=skEffectiveLevel(leaf), peak=leaf.peakLevel||0, max=leaf.levels.length;
          const rad = 4 + Math.min(5,(peak/max)*5);
          leaves.push(`<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="${rad.toFixed(1)}" fill="${skLeafColor(eff,max)}" stroke="rgba(0,0,0,.4)" stroke-width=".7"><title>${esc(leaf.name)} — ${eff>0?'Lv '+eff:'unproven'}${peak>eff?' · peak '+peak:''}</title></circle>`);
          pushFadeRing(lx.toFixed(1), ly.toFixed(1), rad, leaf);
        });
      } else {
        const eff=skEffectiveLevel(node), peak=node.peakLevel||0, max=node.levels.length;
        const rad = 4.5 + Math.min(5.2,(peak/max)*5.2);
        const lblAnchor = Math.cos(a)<-0.2?"end":(Math.cos(a)>0.2?"start":"middle");
        leaves.push(`<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${rad.toFixed(1)}" fill="${skLeafColor(eff,max)}" stroke="rgba(0,0,0,.4)" stroke-width=".7"><title>${esc(node.name)} — ${eff>0?'Lv '+eff:'unproven'}${peak>eff?' · peak '+peak:''}</title></circle>`);
        pushFadeRing(tx.toFixed(1), ty.toFixed(1), rad, node);
        leaves.push(`<text x="${(tx+Math.cos(a)*11).toFixed(0)}" y="${(ty+Math.sin(a)*11+3).toFixed(0)}" text-anchor="${lblAnchor}" font-size="10.5" fill="var(--ink-faint)" style="text-shadow:0 1px 3px #000,0 0 2px #000">${esc(node.name)}</text>`);
      }
    });

    // --- the realm itself: a luminous world-disc with a per-world radial gradient
    const gid=`realm_${cat}`;
    palDefs+=`<radialGradient id="${gid}" cx="38%" cy="34%" r="72%">
      <stop offset="0%" stop-color="${pal.core}"/>
      <stop offset="100%" stop-color="${pal.edge}"/>
    </radialGradient>`;
    const haloR = realmR + 18 + catLvl*3.6;
    glows.push(`<circle cx="${slot.rx.toFixed(1)}" cy="${slot.ry.toFixed(1)}" r="${haloR.toFixed(1)}" fill="url(#realmGlow)" opacity="${(0.16+catLvl*0.045).toFixed(2)}"/>`);
    leaves.push(`<circle cx="${slot.rx.toFixed(1)}" cy="${slot.ry.toFixed(1)}" r="${realmR.toFixed(1)}" fill="url(#${gid})" stroke="var(--gold)" stroke-width="2"/>`);
    leaves.push(`<circle cx="${slot.rx.toFixed(1)}" cy="${slot.ry.toFixed(1)}" r="${(realmR-5).toFixed(1)}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1"/>`);
    // specular glint
    leaves.push(`<ellipse cx="${(slot.rx-realmR*0.28).toFixed(1)}" cy="${(slot.ry-realmR*0.34).toFixed(1)}" rx="${(realmR*0.34).toFixed(1)}" ry="${(realmR*0.2).toFixed(1)}" fill="rgba(255,255,255,.18)"/>`);
    // sigil + name + level
    leaves.push(`<text x="${slot.rx.toFixed(0)}" y="${(slot.ry+realmR*0.16).toFixed(0)}" text-anchor="middle" font-size="${Math.min(34,realmR*0.78).toFixed(0)}">${SK_PATH_ICON[cat]||""}</text>`);
    const nm=esc(SK_CAT[cat]||cat);
    leaves.push(`<text x="${slot.rx.toFixed(0)}" y="${(slot.ry+realmR+20).toFixed(0)}" text-anchor="middle" font-size="16" font-weight="700" fill="var(--gold-bright)" style="text-shadow:0 1px 4px #000,0 0 3px #000">${nm}</text>`);
    leaves.push(`<text x="${slot.rx.toFixed(0)}" y="${(slot.ry+realmR+37).toFixed(0)}" text-anchor="middle" font-size="12" fill="var(--ink-dim)" style="text-shadow:0 1px 3px #000">World Lv ${fmtLvl(catLvl)}</text>`);
  });

  const defs=`<defs>
    <radialGradient id="realmGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e8d49a" stop-opacity=".85"/>
      <stop offset="100%" stop-color="#e8d49a" stop-opacity="0"/>
    </radialGradient>
    ${palDefs}
  </defs>`;
  const svg=`<svg id="skTreeSvg" class="sk-tree-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Roboto Condensed',sans-serif">
    ${defs}
    <g id="skTreeG">${parts.join("")}${glows.join("")}${leaves.join("")}</g>
  </svg>`;
  const controls=`<div class="sk-tree-ctrls">
    <button type="button" id="skTreeZoomOut" title="Zoom out">–</button>
    <button type="button" id="skTreeReset" title="Reset view">⟳</button>
    <button type="button" id="skTreeZoomIn" title="Zoom in">+</button>
  </div>`;
  const legend=`<div class="sk-tree-legend">
    <span><i class="sk-tree-dot" style="background:#3a4030"></i>unproven</span>
    <span><i class="sk-tree-dot" style="background:#c8772e"></i>growing</span>
    <span><i class="sk-tree-dot" style="background:#b8a06a"></i>established</span>
    <span><i class="sk-tree-dot" style="background:#6f9e54"></i>mastered</span>
    <span style="color:var(--ink-faint)">each glowing world is a Path · leaf size = all-time peak · drag to pan · pinch / buttons to zoom · tap a leaf for its skill</span>
  </div>`;
  host.innerHTML=`<div class="sk-tree-wrap">${svg}${controls}</div>${legend}`;
  // default view frames the whole world-tree (canopy through roots) on first open.
  if(!_treeView._init){
    const wrap=host.querySelector('.sk-tree-wrap');
    const r=wrap?wrap.getBoundingClientRect():{width:600,height:600};
    const treeTop=crownTopY-70, treeBot=rootBotY+50, treeH=treeBot-treeTop, treeMidY=(treeTop+treeBot)/2;
    // fit to whichever dimension is the binding constraint so the full crown shows
    const fitH=(r.height? (treeH/(H)) : 1);
    const kByH=(H*0.98)/treeH;
    const kByW=(r.width&&r.height)? ( (r.width/r.height) * (H/W) * kByH ) : kByH;
    const targetK = Math.max(0.32, Math.min(1.1, Math.min(kByH, kByW) ));
    _treeView.k = targetK;
    _treeView.x = (W/2) - cx*targetK;
    _treeView.y = (H/2) - treeMidY*targetK;
    _treeView._init=true;
  }
  _treeApply();
  _treeWireGestures();
}
function svg2vbScale(vbW, pxW){ return vbW/(pxW||vbW); }

// drag-to-pan + wheel/pinch zoom on the tree viewport
function _treeWireGestures(){
  const svg=document.getElementById("skTreeSvg"); if(!svg) return;
  const zi=document.getElementById("skTreeZoomIn"), zo=document.getElementById("skTreeZoomOut"), rz=document.getElementById("skTreeReset");
  if(zi) zi.onclick=()=>treeZoom(1.25);
  if(zo) zo.onclick=()=>treeZoom(0.8);
  if(rz) rz.onclick=treeReset;
  // map a client point to viewBox units (account for current scale)
  const scaleFactor=()=>{ const vb=svg.viewBox.baseVal; const r=svg.getBoundingClientRect(); return vb.width/r.width; };
  let dragging=false, lastX=0, lastY=0;
  const down=(x,y)=>{ dragging=true; lastX=x; lastY=y; svg.style.cursor="grabbing"; };
  const move=(x,y)=>{ if(!dragging) return; const f=scaleFactor(); _treeView.x+=(x-lastX)*f; _treeView.y+=(y-lastY)*f; lastX=x; lastY=y; _treeApply(); };
  const up=()=>{ dragging=false; svg.style.cursor="grab"; };
  svg.addEventListener("mousedown",e=>{ down(e.clientX,e.clientY); e.preventDefault(); });
  window.addEventListener("mousemove",e=>move(e.clientX,e.clientY));
  window.addEventListener("mouseup",up);
  svg.addEventListener("wheel",e=>{ e.preventDefault(); treeZoom(e.deltaY<0?1.12:0.89); },{passive:false});
  // touch: one finger pan, two finger pinch
  let pinchDist=0;
  svg.addEventListener("touchstart",e=>{
    if(e.touches.length===1) down(e.touches[0].clientX,e.touches[0].clientY);
    else if(e.touches.length===2){ dragging=false; pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); }
  },{passive:true});
  svg.addEventListener("touchmove",e=>{
    if(e.touches.length===1){ move(e.touches[0].clientX,e.touches[0].clientY); }
    else if(e.touches.length===2){ const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); if(pinchDist){ treeZoom(d/pinchDist); } pinchDist=d; e.preventDefault(); }
  },{passive:false});
  svg.addEventListener("touchend",up);
  svg.style.cursor="grab";
}
