// === SKILL EMBLEMS ===
// Each path has a base sigil. At level 1 all skills in the same path look identical.
// As eff/max (t) grows toward 1, the seed hash of the skill's id drives divergence,
// so at max level every skill has a unique, fully-realized form of the path motif.
// t = eff/max (0–1), seed = hash(id) 0–255+
const skEmblemSvg = (function(){
  function _s(id){ let h=0; for(let i=0;i<id.length;i++) h=((h<<5)-h+id.charCodeAt(i))|0; return Math.abs(h); }
  function _fi(t,a,b){ return Math.max(0,Math.min(1,(t-a)/(b-a))); }
  function _f(n){ return n.toFixed(1); }

  // Shared outer ring: plain circle → tick-marked → double-ringed
  function _ring(t,s){
    const r=17, sw=(1+t*.7).toFixed(2), op=(0.4+t*.5).toFixed(2);
    let o=[`<circle cx="24" cy="24" r="${r}" fill="none" stroke="currentColor" stroke-width="${sw}" opacity="${op}"/>`];
    if(t>.28){
      const fade=_fi(t,.28,.6), n=4+(s&3)*2;
      for(let i=0;i<n;i++){
        const a=i/n*Math.PI*2, c=Math.cos(a), sv=Math.sin(a), tl=1.5+fade*((s>>4&3)*.5);
        o.push(`<line x1="${_f(24+c*(r-.5))}" y1="${_f(24+sv*(r-.5))}" x2="${_f(24+c*(r-.5-tl))}" y2="${_f(24+sv*(r-.5-tl))}" stroke="currentColor" stroke-width="1" opacity="${_f(fade)}"/>`);
      }
    }
    if(t>.65) o.push(`<circle cx="24" cy="24" r="${_f(r*.82)}" fill="none" stroke="currentColor" stroke-width=".7" opacity="${_f(_fi(t,.65,.88)*.42)}"/>`);
    return o.join('');
  }

  // TACTICAL — Rune-sword
  // Base: vertical blade + crossguard. Diverges in pommel shape, crossguard style, rune.
  function _tactical(t,s){
    const s0=s%3, s1=s>>2&3, s2=s>>4&1;
    let o=[];
    const bw=_f(1.5+s2*.8*_fi(t,.4,1));
    o.push(`<rect x="${_f(24-parseFloat(bw)/2)}" y="7" width="${bw}" height="20" rx=".8" fill="none" stroke="currentColor" stroke-width="1.5"/>`);
    if(t>.12){
      const fi=_fi(t,.12,.38), cw=_f(7+s1*2.5*t);
      o.push(`<line x1="${_f(24-parseFloat(cw)*fi)}" y1="21" x2="${_f(24+parseFloat(cw)*fi)}" y2="21" stroke="currentColor" stroke-width="${_f(1+fi*.5)}" opacity="${_f(fi)}"/>`);
      if(t>.6&&s1===1){
        const tf=_fi(t,.6,.9)*2;
        o.push(`<path d="M${_f(24-parseFloat(cw))},21 q0,-${_f(tf)} ${_f(tf)},${_f(-tf*.6)}" fill="none" stroke="currentColor" stroke-width=".9"/>`);
        o.push(`<path d="M${_f(24+parseFloat(cw))},21 q0,-${_f(tf)} -${_f(tf)},${_f(-tf*.6)}" fill="none" stroke="currentColor" stroke-width=".9"/>`);
      }
      if(t>.6&&s1===2){ const tf=_fi(t,.6,.9); o.push(`<line x1="${_f(24-parseFloat(cw))}" y1="${_f(21-1.8*tf)}" x2="${_f(24+parseFloat(cw))}" y2="${_f(21-1.8*tf)}" stroke="currentColor" stroke-width=".8" opacity="${_f(tf)}"/>`); }
    }
    if(t>.28){
      const fi=_fi(t,.28,.55), pr=_f(2.2+s0*1.2*t);
      if(s0===0) o.push(`<circle cx="24" cy="31" r="${pr}" fill="none" stroke="currentColor" stroke-width="1.2" opacity="${_f(fi)}"/>`);
      else if(s0===1) o.push(`<ellipse cx="24" cy="31" rx="${_f(parseFloat(pr)*1.4)}" ry="${_f(parseFloat(pr)*.75)}" fill="none" stroke="currentColor" stroke-width="1.2" opacity="${_f(fi)}"/>`);
      else { const p=parseFloat(pr); o.push(`<polygon points="24,${_f(31-p)} ${_f(24+p*.7)},31 24,${_f(31+p)} ${_f(24-p*.7)},31" fill="none" stroke="currentColor" stroke-width="1.2" opacity="${_f(fi)}"/>`); }
    }
    if(t>.42&&s2===1){ const fi=_fi(t,.42,.72); o.push(`<line x1="24" y1="9" x2="24" y2="${_f(9+11*fi)}" stroke="currentColor" stroke-width=".6" opacity="${_f(fi*.65)}"/>`); }
    if(t>.68){
      const fi=_fi(t,.68,1);
      if(s0===0) o.push(`<path d="M24,13 L24,18 M22.5,15.5 L25.5,13.5" fill="none" stroke="currentColor" stroke-width=".85" opacity="${_f(fi)}"/>`);
      else if(s0===1) o.push(`<path d="M24,18 L24,13 M24,13 L22,10.5 M24,13 L26,10.5" fill="none" stroke="currentColor" stroke-width=".85" opacity="${_f(fi)}"/>`);
      else o.push(`<path d="M22.5,11 L25.5,14 L22.5,17" fill="none" stroke="currentColor" stroke-width=".85" opacity="${_f(fi)}"/>`);
    }
    return o.join('');
  }

  // PHYSICAL — Ember flame
  // Base: single teardrop flame. Diverges in lean, inner flame, tongues, ember field.
  function _physical(t,s){
    const s0=s%3, s1=s>>2&2;
    let o=[];
    const lean=[-1.5,0,1.5][s0]*t, fh=_f(10+5*t);
    o.push(`<path d="M${_f(24+lean)},${_f(27-parseFloat(fh))} C${_f(21+lean)},23 22,28 24,30 C26,28 ${_f(27)},23 ${_f(24+lean)},${_f(27-parseFloat(fh))}" fill="none" stroke="currentColor" stroke-width="1.4"/>`);
    if(t>.22){
      const fi=_fi(t,.22,.5), ih=_f(5+3.5*t);
      o.push(`<path d="M24,${_f(26-parseFloat(ih))} C23,23 23.5,27 24,28.5 C24.5,27 25,23 24,${_f(26-parseFloat(ih))}" fill="none" stroke="currentColor" stroke-width=".9" opacity="${_f(fi)}"/>`);
    }
    if(t>.4){
      const fi=_fi(t,.4,.65), side=s0===0?-4.5:4.5;
      o.push(`<path d="M24,28 C${_f(24+side*fi)},23 ${_f(24+side*fi*1.3)},21 ${_f(22.5+side*.5*fi)},${_f(19-fi*2)}" fill="none" stroke="currentColor" stroke-width=".9" opacity="${_f(fi*.8)}"/>`);
    }
    if(t>.58){
      const fi=_fi(t,.58,.82);
      o.push(`<path d="M20.5,30 Q24,32.5 27.5,30" fill="none" stroke="currentColor" stroke-width=".9" opacity="${_f(fi)}"/>`);
      const ns=1+s1; for(let i=0;i<ns;i++) o.push(`<circle cx="${_f(24+[-3,3][i])}" cy="${_f(25-fi*4-i*1.5)}" r=".8" fill="currentColor" opacity="${_f(fi*.65)}"/>`);
    }
    if(t>.78){
      const fi=_fi(t,.78,1);
      o.push(`<path d="M24,${_f(19-fi*2)} C21.5,21.5 23,${_f(17-fi)},24,${_f(15-fi*2)} C25,${_f(17-fi)},26.5,21.5 24,${_f(19-fi*2)}" fill="none" stroke="currentColor" stroke-width=".8" opacity="${_f(fi)}"/>`);
    }
    return o.join('');
  }

  // COGNITIVE — Rune-eye (Odin's eye)
  // Base: almond outline. Diverges in iris, pupil offset, brow curve, lash count, rune.
  function _cognitive(t,s){
    const s0=s%3, s1=s>>2&3;
    let o=[];
    const ew=_f(8+s0*1.8*_fi(t,.3,1)), ec=_f(24-s1*.4*_fi(t,.5,1));
    o.push(`<path d="M${_f(parseFloat(ec)-parseFloat(ew))},24 Q${ec},${_f(19.5-s0*.7*t)} ${_f(parseFloat(ec)+parseFloat(ew))},24 Q${ec},${_f(28.5+s0*.7*t)} ${_f(parseFloat(ec)-parseFloat(ew))},24" fill="none" stroke="currentColor" stroke-width="1.4"/>`);
    if(t>.22){
      const fi=_fi(t,.22,.5), ir=_f(3.2+fi*.6);
      o.push(`<circle cx="${ec}" cy="24" r="${ir}" fill="none" stroke="currentColor" stroke-width="1" opacity="${_f(fi)}"/>`);
    }
    if(t>.38){
      const fi=_fi(t,.38,.6), po=_f(s1*.5*fi);
      o.push(`<circle cx="${_f(parseFloat(ec)+parseFloat(po))}" cy="24" r="${_f(1.2+fi*.4)}" fill="currentColor" opacity="${_f(fi)}"/>`);
    }
    if(t>.52){
      const fi=_fi(t,.52,.75), bx1=_f(parseFloat(ec)-8*fi), bx2=_f(parseFloat(ec)+8*fi), by=_f(18.5-fi*1.5);
      o.push(`<path d="M${bx1},${by} Q${ec},${_f(parseFloat(by)-3*fi)} ${bx2},${by}" fill="none" stroke="currentColor" stroke-width="1" opacity="${_f(fi*.8)}"/>`);
    }
    if(t>.65){
      const fi=_fi(t,.65,.9);
      if(s0===0) o.push(`<path d="M21,24 L27,24 M21.5,22 L26.5,22" stroke="currentColor" stroke-width=".8" opacity="${_f(fi)}"/>`);
      else if(s0===1) o.push(`<path d="M22,22 L26,24 L22,26" fill="none" stroke="currentColor" stroke-width=".85" opacity="${_f(fi)}"/>`);
      else o.push(`<path d="M21.5,22 L26.5,26 M21.5,26 L26.5,22" stroke="currentColor" stroke-width=".75" opacity="${_f(fi)}"/>`);
    }
    if(t>.78){
      const fi=_fi(t,.78,1), nl=2+(s1>>1), ey_hi=_f(20-s0*.7*t), ey_lo=_f(28+s0*.7*t);
      for(let i=0;i<nl;i++){
        const xo=_f((i-nl/2+.5)*2.8+parseFloat(ec));
        o.push(`<line x1="${xo}" y1="${ey_hi}" x2="${_f(parseFloat(xo)+.3)}" y2="${_f(parseFloat(ey_hi)-1.8*fi)}" stroke="currentColor" stroke-width=".8" opacity="${_f(fi*.7)}"/>`);
        o.push(`<line x1="${xo}" y1="${ey_lo}" x2="${_f(parseFloat(xo)+.3)}" y2="${_f(parseFloat(ey_lo)+1.4*fi)}" stroke="currentColor" stroke-width=".8" opacity="${_f(fi*.5)}"/>`);
      }
    }
    return o.join('');
  }

  // PHYSIOLOGICAL — Valknut
  // Base: single triangle. Diverges in rotation, overlap, inner triangle, outer circle.
  function _physiological(t,s){
    const s0=s%3; // rotation offset
    let o=[];
    function tri(cx,cy,r,deg){
      const pts=[]; for(let i=0;i<3;i++){ const a=(deg+i*120)*Math.PI/180; pts.push(`${_f(cx+r*Math.cos(a))},${_f(cy+r*Math.sin(a))}`); }
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.2"/>`;
    }
    const rot=90+s0*20*t;
    o.push(tri(24,24,9,rot));
    if(t>.28){ const fi=_fi(t,.28,.55); o.push(`<g opacity="${_f(fi)}">${tri(24,24,8,rot+120)}</g>`); }
    if(t>.48){ const fi=_fi(t,.48,.7); o.push(`<g opacity="${_f(fi)}">${tri(24,24,7,rot+240)}</g>`); }
    if(t>.68){ const fi=_fi(t,.68,.88); o.push(`<g opacity="${_f(fi*.45)}">${tri(24,24,3,rot)}</g>`); }
    if(t>.82){ const fi=_fi(t,.82,1); o.push(`<circle cx="24" cy="24" r="11" fill="none" stroke="currentColor" stroke-width=".8" opacity="${_f(fi*.55)}"/>`); }
    return o.join('');
  }

  // TECHNICAL — Gear / circuit node
  // Base: 4-tooth gear. Diverges in tooth count, bore shape, spokes, circuit traces.
  function _technical(t,s){
    const s0=s%3, s1=s>>2&3;
    let o=[];
    const teeth=t<.2?4:t<.45?6:t<.65?8:10, gR=9, tH=2.5+t*.8;
    let pts=[]; for(let i=0;i<teeth;i++){ const tw=.38; const a1=i/teeth*Math.PI*2,a2=(i+tw)/teeth*Math.PI*2,a3=(i+1-tw)/teeth*Math.PI*2; pts.push(`${_f(24+gR*Math.cos(a1))},${_f(24+gR*Math.sin(a1))}`); pts.push(`${_f(24+(gR+tH)*Math.cos(a2))},${_f(24+(gR+tH)*Math.sin(a2))}`); pts.push(`${_f(24+(gR+tH)*Math.cos(a3))},${_f(24+(gR+tH)*Math.sin(a3))}`); }
    o.push(`<polygon points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.2"/>`);
    if(t>.32){
      const fi=_fi(t,.32,.55), br=_f(3+fi*1.5);
      o.push(`<circle cx="24" cy="24" r="${br}" fill="none" stroke="currentColor" stroke-width="1" opacity="${_f(fi)}"/>`);
      if(t>.58){
        const fi2=_fi(t,.58,.8);
        if(s0===0){ const hp=[]; for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; hp.push(`${_f(24+4*Math.cos(a))},${_f(24+4*Math.sin(a))}`); } o.push(`<polygon points="${hp.join(' ')}" fill="none" stroke="currentColor" stroke-width=".8" opacity="${_f(fi2)}"/>`); }
        else if(s0===1) o.push(`<rect x="20.5" y="20.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width=".8" opacity="${_f(fi2)}" transform="rotate(${_f(45*fi2)},24,24)"/>`);
        else o.push(`<circle cx="24" cy="24" r="${_f(3.5*fi2)}" fill="none" stroke="currentColor" stroke-width=".8" opacity="${_f(fi2)}"/>`);
      }
      if(t>.68){
        const fi2=_fi(t,.68,.88), ns=4+(s1&1), br_n=parseFloat(br);
        for(let i=0;i<ns;i++){ const a=i/ns*Math.PI*2; o.push(`<line x1="${_f(24+br_n*.9*Math.cos(a))}" y1="${_f(24+br_n*.9*Math.sin(a))}" x2="${_f(24+(gR-.5)*Math.cos(a))}" y2="${_f(24+(gR-.5)*Math.sin(a))}" stroke="currentColor" stroke-width=".8" opacity="${_f(fi2*.65)}"/>`); }
      }
    }
    if(t>.8){
      const fi=_fi(t,.8,1), nc=1+(s1%3), out=gR+tH+2;
      for(let i=0;i<nc;i++){ const a=(i/nc+.18)*Math.PI*2; const x1=_f(24+(gR+tH)*Math.cos(a)),y1=_f(24+(gR+tH)*Math.sin(a)),x2=_f(24+out*Math.cos(a)),y2=_f(24+out*Math.sin(a)),x3=_f(24+out*Math.cos(a)+3*Math.cos(a+Math.PI/2)),y3=_f(24+out*Math.sin(a)+3*Math.sin(a+Math.PI/2)); o.push(`<polyline points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="none" stroke="currentColor" stroke-width=".8" opacity="${_f(fi*.65)}"/>`); }
    }
    return o.join('');
  }

  // LEADERSHIP — Crown
  // Base: center spire + base line. Diverges in side spires, jewel shape, band ornamentation.
  function _leadership(t,s){
    const s0=s%3, s1=s>>2&2;
    let o=[];
    const bw=_f(9+4.5*t), sh=_f(7+5*t);
    o.push(`<line x1="${_f(24-parseFloat(bw))}" y1="29" x2="${_f(24+parseFloat(bw))}" y2="29" stroke="currentColor" stroke-width="${_f(1.2+t*.3)}"/>`);
    o.push(`<line x1="24" y1="29" x2="24" y2="${_f(29-parseFloat(sh))}" stroke="currentColor" stroke-width="${_f(1.3+t*.4)}"/>`);
    if(t>.18){
      const fi=_fi(t,.18,.44), bwn=parseFloat(bw), shn=parseFloat(sh);
      const sx=[24-bwn*.55,24+bwn*.55];
      sx.forEach(x=>o.push(`<line x1="${_f(x)}" y1="29" x2="${_f(x)}" y2="${_f(29-shn*.68*fi)}" stroke="currentColor" stroke-width="1.1" opacity="${_f(fi)}"/>`));
      if(t>.48){
        const fi2=_fi(t,.48,.68);
        const sx2=[24-bwn*.28,24+bwn*.28];
        sx2.forEach(x=>o.push(`<line x1="${_f(x)}" y1="29" x2="${_f(x)}" y2="${_f(29-shn*.48*fi2)}" stroke="currentColor" stroke-width="1" opacity="${_f(fi2)}"/>`));
      }
    }
    if(t>.62){
      const fi=_fi(t,.62,.82), bwn=parseFloat(bw), shn=parseFloat(sh);
      [[24,shn],[24-bwn*.55,shn*.68],[24+bwn*.55,shn*.68]].forEach(([jx,jh])=>{
        const jy=_f(29-jh*fi);
        if(s0===0) o.push(`<circle cx="${_f(jx)}" cy="${jy}" r="1.2" fill="currentColor" opacity="${_f(fi*.9)}"/>`);
        else if(s0===1){ const p=1.4; o.push(`<polygon points="${_f(jx)},${_f(parseFloat(jy)-p)} ${_f(jx+p*.7)},${jy} ${_f(jx)},${_f(parseFloat(jy)+p)} ${_f(jx-p*.7)},${jy}" fill="currentColor" opacity="${_f(fi*.9)}"/>`); }
        else o.push(`<path d="M${_f(jx-1.2)},${jy} L${_f(jx+1.2)},${jy} M${_f(jx)},${_f(parseFloat(jy)-1.2)} L${_f(jx)},${_f(parseFloat(jy)+1.2)}" stroke="currentColor" stroke-width=".9" opacity="${_f(fi*.7)}"/>`);
      });
    }
    if(t>.75){
      const fi=_fi(t,.75,1), bwn=parseFloat(bw);
      if(s1===0) o.push(`<line x1="${_f(24-bwn)}" y1="30.8" x2="${_f(24+bwn)}" y2="30.8" stroke="currentColor" stroke-width=".7" opacity="${_f(fi)}"/>`);
      else{ for(let i=0;i<5;i++) o.push(`<circle cx="${_f(24-bwn+bwn*2/4*i)}" cy="30.8" r=".75" fill="currentColor" opacity="${_f(fi)}"/>`); }
      if(t>.9&&s0===2){ const fi2=_fi(t,.9,1); [24-bwn,24+bwn].forEach(x=>o.push(`<line x1="${_f(x)}" y1="29" x2="${_f(x+(x<24?1:-1))}" y2="${_f(29-parseFloat(sh)*.32)}" stroke="currentColor" stroke-width=".9" opacity="${_f(fi2)}"/>`)); }
    }
    return o.join('');
  }

  // ACADEMIC — Open rune-scroll / tome
  // Base: horizontal scroll bar + curl ends. Diverges in page angle, text lines, chapter marks, bookmark.
  function _academic(t,s){
    const s0=s%3, s1=s>>2&1;
    let o=[];
    if(t<=.35){
      const fi=_fi(t,0,.35), sw=_f(9*fi);
      o.push(`<line x1="${_f(24-parseFloat(sw))}" y1="24" x2="${_f(24+parseFloat(sw))}" y2="24" stroke="currentColor" stroke-width="1.3" opacity="${_f(fi)}"/>`);
      o.push(`<path d="M${_f(24-parseFloat(sw))},24 Q${_f(24-parseFloat(sw)-2)},22 ${_f(24-parseFloat(sw)-1.5)},21" fill="none" stroke="currentColor" stroke-width="1" opacity="${_f(fi)}"/>`);
      o.push(`<path d="M${_f(24+parseFloat(sw))},24 Q${_f(24+parseFloat(sw)+2)},22 ${_f(24+parseFloat(sw)+1.5)},21" fill="none" stroke="currentColor" stroke-width="1" opacity="${_f(fi)}"/>`);
      if(t>.18){ const fi2=_fi(t,.18,.35),sw_n=parseFloat(sw); for(let i=0;i<2;i++) o.push(`<line x1="${_f(24-sw_n*.7)}" y1="${22+i*2.5}" x2="${_f(24+sw_n*.7)}" y2="${22+i*2.5}" stroke="currentColor" stroke-width=".7" opacity="${_f(fi2*.6)}"/>`); }
    }
    if(t>.3){
      const fi=_fi(t,.3,.58), pa=[11,8,14][s0]*fi, bh=14, bw=8;
      o.push(`<path d="M24,${_f(24-bh/2)} L${_f(24-bw)},${_f(24-bh/2+pa*.3)} L${_f(24-bw)},${_f(24+bh/2+pa*.3)} L24,${_f(24+bh/2)} Z" fill="none" stroke="currentColor" stroke-width="1.2" opacity="${_f(fi)}"/>`);
      o.push(`<path d="M24,${_f(24-bh/2)} L${_f(24+bw)},${_f(24-bh/2+pa*.3)} L${_f(24+bw)},${_f(24+bh/2+pa*.3)} L24,${_f(24+bh/2)} Z" fill="none" stroke="currentColor" stroke-width="1.2" opacity="${_f(fi)}"/>`);
      o.push(`<line x1="24" y1="${_f(24-bh/2)}" x2="24" y2="${_f(24+bh/2)}" stroke="currentColor" stroke-width="1.5" opacity="${_f(fi)}"/>`);
      if(t>.52){
        const fi2=_fi(t,.52,.78), nl=2+s0;
        for(let i=0;i<nl;i++){ const ly=_f(23-2+i*3.2); o.push(`<line x1="${_f(24-bw+1.5)}" y1="${ly}" x2="${_f(24-1.8)}" y2="${ly}" stroke="currentColor" stroke-width=".65" opacity="${_f(fi2*.55)}"/>`); o.push(`<line x1="${_f(24+1.8)}" y1="${ly}" x2="${_f(24+bw-1.5)}" y2="${ly}" stroke="currentColor" stroke-width=".65" opacity="${_f(fi2*.55)}"/>`); }
      }
      if(t>.72&&s1===1){ const fi2=_fi(t,.72,1), pa_n=pa; o.push(`<path d="M${_f(24+bw)},${_f(24-bh/2+pa_n*.3)} L${_f(24+bw)},${_f(24-bh/2+pa_n*.3+3*fi2)} L${_f(24+bw-2)},${_f(24-bh/2+pa_n*.3+1.5*fi2)} Z" fill="currentColor" opacity="${_f(fi2*.65)}"/>`); }
      if(t>.82){ const fi2=_fi(t,.82,1); o.push(`<line x1="24" y1="${_f(24-bh/2)}" x2="${_f(24-bw*.3)}" y2="${_f(24-bh/2)}" stroke="currentColor" stroke-width="1.2" opacity="${_f(fi2*.55)}"/>`); }
    }
    return o.join('');
  }

  // PERSONAL — Seed to sprout / small tree
  // Base: oval seed. Diverges in leaf shape, root depth, branch spread.
  function _personal(t,s){
    const s0=s%3, s1=s>>2&1;
    let o=[];
    const cy=_f(27-t*2), sw=_f(4+2.5*t), sh_v=_f(5+2.5*t);
    o.push(`<ellipse cx="24" cy="${cy}" rx="${sw}" ry="${sh_v}" fill="none" stroke="currentColor" stroke-width="1.3"/>`);
    const cy_n=parseFloat(cy), sh_n=parseFloat(sh_v);
    if(t>.18){ const fi=_fi(t,.18,.44), rl=(4+s1*2.5)*fi; o.push(`<line x1="24" y1="${_f(cy_n+sh_n*.5)}" x2="24" y2="${_f(cy_n+sh_n*.5+rl)}" stroke="currentColor" stroke-width="1" opacity="${_f(fi)}"/>`); }
    if(t>.38){
      const fi=_fi(t,.38,.58), sl=(7+3*t)*fi;
      o.push(`<line x1="24" y1="${_f(cy_n-sh_n*.3)}" x2="24" y2="${_f(cy_n-sh_n*.3-sl)}" stroke="currentColor" stroke-width="1.2" opacity="${_f(fi)}"/>`);
      const ly=_f(cy_n-sh_n*.3-sl*.5), lw=[3,1.8,4][s0];
      o.push(`<path d="M24,${ly} Q${_f(24+lw*fi)},${_f(parseFloat(ly)-3*fi)} 24,${_f(parseFloat(ly)-6*fi)}" fill="none" stroke="currentColor" stroke-width="1" opacity="${_f(fi)}"/>`);
    }
    if(t>.55){
      const fi=_fi(t,.55,.75), sl2=10+4*t, lw=[3,1.8,4][s0];
      const mx=_f(cy_n-sh_n*.3-sl2*.6);
      o.push(`<path d="M24,${mx} Q${_f(24-lw*fi)},${_f(parseFloat(mx)-2.5*fi)} ${_f(24-lw*fi*.5)},${_f(parseFloat(mx)-5*fi)}" fill="none" stroke="currentColor" stroke-width="1" opacity="${_f(fi)}"/>`);
    }
    if(t>.75){
      const fi=_fi(t,.75,1), sl3=13, top=cy_n-sh_n*.3-sl3, rl=(4+s1*2.5)*_fi(t,.18,.44);
      o.push(`<line x1="24" y1="${_f(top+3)}" x2="${_f(24-5*fi)}" y2="${_f(top-2*fi)}" stroke="currentColor" stroke-width=".9" opacity="${_f(fi)}"/>`);
      o.push(`<line x1="24" y1="${_f(top+3)}" x2="${_f(24+5*fi)}" y2="${_f(top-2*fi)}" stroke="currentColor" stroke-width=".9" opacity="${_f(fi)}"/>`);
      o.push(`<line x1="24" y1="${_f(cy_n+sh_n*.5+rl*.5)}" x2="${_f(24-3*fi)}" y2="${_f(cy_n+sh_n*.5+rl*.5+3*fi)}" stroke="currentColor" stroke-width=".7" opacity="${_f(fi*.65)}"/>`);
      o.push(`<line x1="24" y1="${_f(cy_n+sh_n*.5+rl*.5)}" x2="${_f(24+3*fi)}" y2="${_f(cy_n+sh_n*.5+rl*.5+3*fi)}" stroke="currentColor" stroke-width=".7" opacity="${_f(fi*.65)}"/>`);
    }
    return o.join('');
  }

  // HEARTH — Hearthstone arch
  // Base: ember dot. Diverges in flame size, arch width, keystone rune.
  function _hearth(t,s){
    const s0=s%3, s1=s>>2&2;
    let o=[];
    const er=_f(1.5+t*1.8);
    o.push(`<circle cx="24" cy="26.5" r="${er}" fill="currentColor" opacity="${_f(.55+t*.35)}"/>`);
    if(t>.18){
      const fi=_fi(t,.18,.44), fh=_f(9*fi);
      o.push(`<path d="M24,${_f(26.5+parseFloat(er))} C22,24 23,${_f(26-parseFloat(fh))} 24,${_f(24.5-parseFloat(fh))} C25,${_f(26-parseFloat(fh))} 26,24 24,${_f(26.5+parseFloat(er))}" fill="none" stroke="currentColor" stroke-width="1.2" opacity="${_f(fi)}"/>`);
    }
    if(t>.38){
      const fi=_fi(t,.38,.58), aw=[6,8,10][s0]*fi;
      o.push(`<path d="M${_f(24-aw)},29.5 Q24,${_f(29.5+3*fi)} ${_f(24+aw)},29.5" fill="none" stroke="currentColor" stroke-width="1.1" opacity="${_f(fi)}"/>`);
      o.push(`<circle cx="${_f(24-aw*.5)}" cy="29.5" r=".75" fill="currentColor" opacity="${_f(fi*.55)}"/>`);
      o.push(`<circle cx="${_f(24+aw*.5)}" cy="29.5" r=".75" fill="currentColor" opacity="${_f(fi*.55)}"/>`);
    }
    if(t>.52){
      const fi=_fi(t,.52,.72), aw=[7,9,11][s0], ah=11*fi;
      o.push(`<line x1="${_f(24-aw)}" y1="29.5" x2="${_f(24-aw)}" y2="${_f(29.5-ah)}" stroke="currentColor" stroke-width="1.3" opacity="${_f(fi)}"/>`);
      o.push(`<line x1="${_f(24+aw)}" y1="29.5" x2="${_f(24+aw)}" y2="${_f(29.5-ah)}" stroke="currentColor" stroke-width="1.3" opacity="${_f(fi)}"/>`);
      o.push(`<path d="M${_f(24-aw)},${_f(29.5-ah)} Q24,${_f(29.5-ah-aw*.65*fi)} ${_f(24+aw)},${_f(29.5-ah)}" fill="none" stroke="currentColor" stroke-width="1.3" opacity="${_f(fi)}"/>`);
    }
    if(t>.72){
      const fi=_fi(t,.72,1), aw=[7,9,11][s0], ah=11*_fi(t,.52,.72);
      const ky=_f(29.5-ah-aw*.65*_fi(t,.52,.72)-2);
      if(s1===0) o.push(`<path d="M24,${_f(parseFloat(ky)-2)} L${_f(24+2)},${ky} L24,${_f(parseFloat(ky)+2)} L${_f(24-2)},${ky} Z" fill="none" stroke="currentColor" stroke-width=".8" opacity="${_f(fi)}"/>`);
      else if(s1===1) o.push(`<path d="M24,${_f(parseFloat(ky)-2)} L${_f(24+2)},${ky} L24,${_f(parseFloat(ky)+2)} L${_f(24-2)},${ky} Z M${_f(24-2)},${ky} L${_f(24+2)},${ky}" fill="none" stroke="currentColor" stroke-width=".75" opacity="${_f(fi)}"/>`);
      else o.push(`<path d="M${_f(24-2.5)},${_f(parseFloat(ky)-1.5)} L${_f(24+2.5)},${_f(parseFloat(ky)+1.5)} M${_f(24+2.5)},${_f(parseFloat(ky)-1.5)} L${_f(24-2.5)},${_f(parseFloat(ky)+1.5)}" stroke="currentColor" stroke-width=".8" opacity="${_f(fi)}"/>`);
    }
    return o.join('');
  }

  // ROOTS — Root network
  // Base: single horizontal root bar. Diverges in branching angle spread, depth, knot detail.
  function _roots(t,s){
    const s0=s%3, s1=s>>2&1;
    let o=[];
    const rw=_f(7+6.5*t);
    o.push(`<line x1="${_f(24-parseFloat(rw))}" y1="25" x2="${_f(24+parseFloat(rw))}" y2="25" stroke="currentColor" stroke-width="1.3"/>`);
    if(t>.14){
      const fi=_fi(t,.14,.4), rl=(7+3*s1)*fi;
      o.push(`<line x1="24" y1="25" x2="24" y2="${_f(25+rl)}" stroke="currentColor" stroke-width="1.1" opacity="${_f(fi)}"/>`);
    }
    if(t>.28){
      const fi=_fi(t,.28,.55), sp=[5.5,7.5,9.5][s0]*fi, rl2=(5+2.5*t)*fi;
      [-sp,sp].forEach(dx=>o.push(`<line x1="${_f(24+dx)}" y1="25" x2="${_f(24+dx)}" y2="${_f(25+rl2)}" stroke="currentColor" stroke-width=".9" opacity="${_f(fi)}"/>`));
      [-.5*fi,.5*fi].forEach((dx,i)=>o.push(`<line x1="${_f(24+parseFloat(_f(sp*(i?1:-1)))*1)}" y1="25" x2="${_f(24+parseFloat(_f(sp*(i?1:-1)))*1.3)}" y2="${_f(25-rl2*.55)}" stroke="currentColor" stroke-width=".8" opacity="${_f(fi*.55)}"/>`));
    }
    if(t>.55){
      const fi=_fi(t,.55,.78), sp=[5.5,7.5,9.5][s0];
      [-sp,sp].forEach((dx,side)=>{
        const bx=24+dx, by=28.5;
        o.push(`<line x1="${_f(bx)}" y1="${by}" x2="${_f(bx+(side?3:-3)*fi)}" y2="${_f(by+3*fi)}" stroke="currentColor" stroke-width=".7" opacity="${_f(fi*.55)}"/>`);
        o.push(`<line x1="${_f(bx)}" y1="${by}" x2="${_f(bx+(side?-2:2)*fi)}" y2="${_f(by+3.5*fi)}" stroke="currentColor" stroke-width=".7" opacity="${_f(fi*.55)}"/>`);
      });
    }
    if(t>.78){
      const fi=_fi(t,.78,1), rl=(7+3*s1)*_fi(t,.14,.4), ky=_f(25+rl*.5);
      if(s1===0) o.push(`<circle cx="24" cy="${ky}" r="${_f(1.8*fi)}" fill="none" stroke="currentColor" stroke-width=".9" opacity="${_f(fi)}"/>`);
      else o.push(`<path d="M${_f(24-2*fi)},${ky} L${_f(24+2*fi)},${ky} M24,${_f(parseFloat(ky)-2*fi)} L24,${_f(parseFloat(ky)+2*fi)}" stroke="currentColor" stroke-width=".9" opacity="${_f(fi)}"/>`);
    }
    return o.join('');
  }

  const _FNS={tactical:_tactical,physical:_physical,cognitive:_cognitive,physiological:_physiological,technical:_technical,leadership:_leadership,academic:_academic,personal:_personal,hearth:_hearth,roots:_roots};

  return function(sk, eff, max){
    if(!eff||eff<1) return '';
    const t=Math.min(1,eff/max), s=_s(sk.id||sk.name), fn=_FNS[sk.cat];
    if(!fn) return '';
    const col=typeof skLeafColor==='function'?skLeafColor(eff,max):'#6e7459';
    return `<svg width="48" height="48" viewBox="0 0 48 48" style="color:${col}" aria-hidden="true">${_ring(t,s)}${fn(t,s)}</svg>`;
  };
})();

const SK_SUIT={
  tactical:      {sym:"⚔",  name:"Swords",    col:"#78909c", light:"#eceff1"},
  physical:      {sym:"🔥", name:"Wands",     col:"#bf5b30", light:"#fbe9e7"},
  cognitive:     {sym:"🌊", name:"Cups",      col:"#4a7fad", light:"#e3f2fd"},
  physiological: {sym:"🌿", name:"Pentacles", col:"#4caf70", light:"#e8f5e9"},
  technical:     {sym:"⚡", name:"Circuits",  col:"#7e57c2", light:"#ede7f6"},
  leadership:    {sym:"🛡", name:"Shields",   col:"#b58900", light:"#fff8e1"},
  academic:      {sym:"📜", name:"Scrolls",   col:"#00796b", light:"#e0f2f1"},
  personal:      {sym:"✦",  name:"Stars",     col:"#af8c00", light:"#fffde7"},
  hearth:        {sym:"🗝", name:"Keys",      col:"#8d6e63", light:"#efebe9"},
  roots:         {sym:"🌳", name:"Roots",     col:"#558b2f", light:"#f1f8e9"},
};
const CARD_RANKS=["A","2","3","4","5","6","7","8","9","10","Page","Knight","Queen","King"];

let _skSearchTerm = "";
let _skHeatmapVisible = false;

function renderHeatmap(){
  const el=document.getElementById("skHeatmap"); if(!el) return;
  // build date → count map for past 91 days
  const now=Date.now();
  const day91=91;
  const counts={};
  (S.lifeSkills||[]).filter(s=>!s.group).forEach(s=>{
    (s.history||[]).forEach(h=>{
      const d=Math.round((now-h.ts)/864e5);
      if(d>=0&&d<day91){
        const dt=localYMD(new Date(h.ts));
        counts[dt]=(counts[dt]||0)+1;
      }
    });
  });
  // build 13 cols × 7 rows grid (oldest first, top-left)
  const cols=13, rows=7;
  const startMs=now-(day91-1)*864e5;
  const cells=[];
  for(let i=0;i<day91;i++){
    const d=new Date(startMs+i*864e5);
    const dt=localYMD(d);
    const cnt=counts[dt]||0;
    const lv=cnt===0?0:cnt<=2?1:cnt<=5?2:3;
    cells.push(`<div class="hm-day lv${lv}" title="${dt}: ${cnt} skill event${cnt!==1?'s':''}"></div>`);
  }
  // label row: month initials at column boundaries
  const labels=[];
  for(let c=0;c<cols;c++){
    const d=new Date(startMs+c*7*864e5);
    labels.push(`<div class="hm-label">${d.toLocaleDateString(undefined,{month:'short'})}</div>`);
  }
  el.innerHTML=`<div class="hm-header"><span class="hm-title">90-day skill activity</span><span class="hm-legend"><span class="hm-day lv0"></span><span class="hm-day lv1"></span><span class="hm-day lv2"></span><span class="hm-day lv3"></span></span></div><div class="hm-month-row">${labels.join('')}</div><div class="hm-grid">${cells.join('')}</div>`;
}

function _filterSkillDecks(){
  const q = _skSearchTerm.toLowerCase().trim();
  document.querySelectorAll("#skList .sk-deck").forEach(deck=>{
    if(!q){ deck.hidden=false; return; }
    const cards = deck.querySelectorAll(".sk-card-name");
    const match = [...cards].some(n=>n.textContent.toLowerCase().includes(q));
    deck.hidden = !match;
    if(match){
      const body=deck.querySelector(".sk-deck-body");
      const hdr=deck.querySelector(".sk-deck-header");
      if(body&&!body.classList.contains("open")){ body.classList.add("open"); hdr&&hdr.classList.add("open"); }
    }
  });
}

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
  // Mastery summary bar — at-a-glance health of the whole tree
  const sbEl=document.getElementById("skSummaryBar");
  if(sbEl){
    const allLeaves=S.lifeSkills.filter(s=>!s.group&&s.levels&&s.levels.length);
    const started=allLeaves.filter(s=>s.currentLevel>0);
    const decayed=started.filter(s=>skEffectiveLevel(s)<s.currentLevel);
    const atRisk=started.filter(s=>!decayed.includes(s)&&skFadeState(s)==="at-risk");
    const maxed=started.filter(s=>s.currentLevel>=s.levels.length);
    const totalCollectable=allLeaves.length;
    if(started.length||totalCollectable>0){
      sbEl.innerHTML=`<div class="sk-summary-bar">
        <span class="sk-summary-stat discovered">${started.length}<span class="sk-stat-sep">/</span>${totalCollectable} <span class="sk-stat-label">collected</span></span>
        ${maxed.length?`<span class="sk-summary-stat maxed">⭐ ${maxed.length} mastered</span>`:''}
        ${atRisk.length?`<span class="sk-summary-stat atrisk">🔶 ${atRisk.length} at risk</span>`:''}
        ${decayed.length?`<span class="sk-summary-stat decayed">🍂 ${decayed.length} decayed</span>`:''}
      </div>`;
    } else { sbEl.innerHTML=""; }
  }
  // skill list — category → top-level skill (group shows subs) → leaf
  if(!S.lifeSkills.length){ listEl.innerHTML=`<div class="aw-empty"><span class="big">🧠</span>No skills yet. Add one above to start tracking levels.</div>`; return; }

  // Path color mapping for deck headers and card tints
  const PATH_COL={tactical:"#7a3e3e",physical:"#7a5c2a",cognitive:"#3a5c7a",physiological:"#3a6b4a",technical:"#4a4a6b",leadership:"#6b5a2a",academic:"#5a3a6b",personal:"#3a6b3a",hearth:"#7a4a2a",roots:"#4a5a3a"};

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

  // Face-down card for unstarted skills
  const faceDownCard=(sk,suit,rank,isSynthPending)=>{
    const s=suit||(SK_SUIT[sk.cat]||{sym:"★",col:"#555",light:"#ddd"});
    const rar=typeof skRarity==="function"?skRarity(sk):{name:"",col:"#555",border:"#555"};
    const pathCol=PATH_COL[sk.cat]||"#3a3a3a";
    // Synthesis cards: show set progress + combine button
    const seed=typeof skSeedOf==="function"?skSeedOf(sk.name,sk.cat):null;
    const setKey=seed&&seed.setKey;
    const synthFrom=seed&&seed.synthesizedFrom;
    const members=synthFrom&&typeof skSetMembers==="function"?skSetMembers(synthFrom):[];
    const mastCount=synthFrom&&typeof skSetMasteredCount==="function"?skSetMasteredCount(synthFrom):0;
    const canCombine=synthFrom&&typeof skSetCanCombine==="function"?skSetCanCombine(synthFrom):false;
    const hint=seed&&seed.unlockHint?`<div class="sk-fd-hint">${esc(seed.unlockHint)}</div>`:'';
    const setProBar=members.length>1?`<div class="sk-fd-setprog"><div class="sk-fd-prog-fill" style="width:${Math.round(mastCount/members.length*100)}%"></div><span>${mastCount}/${members.length} mastered</span></div>`:'';
    const combineBtn=canCombine&&sk.synthesisUnlocked!==true?`<button class="sk-combine-btn" data-skcombine="${esc(synthFrom)}">⚡ Combine all ${members.length}</button>`:'';
    const typeTag=isSynthPending?`<span class="sk-fd-synth-tag">Synthesis card</span>`:'';
    return `<div class="sk-card sk-card-facedown rarity-${rar.name.toLowerCase()}" style="--sk-col:${pathCol};--deck-col:${s.col};--deck-light:${s.light};--rar-col:${rar.border}">
      <div class="spc-corner tl" style="color:${s.col}"><div class="spc-rank">${rank||""}</div><div class="spc-suit">${s.sym}</div></div>
      <div class="sk-fd-body">
        <div class="sk-fd-top"><span class="sk-fd-rar" style="color:${rar.col}">${esc(rar.name)}</span>${typeTag}</div>
        <div class="sk-fd-name">${esc(sk.name)}</div>
        ${isSynthPending&&members.length>1?`<div class="sk-fd-synth-lbl">Requires mastery of a set</div>`:``}
        ${hint}
        ${setProBar}
        ${combineBtn}
        ${!isSynthPending&&!sk.synthesisUnlocked?`<button class="sk-fd-start-btn" data-skreach="${sk.id}" data-skreachlvl="1">Unlock → set level 1</button>`:''}
        ${sk.synthesisUnlocked?`<div class="sk-fd-unlocked">⚡ Synthesis unlocked — set level 1 to start</div><button class="sk-fd-start-btn" data-skreach="${sk.id}" data-skreachlvl="1">Start training</button>`:''}
      </div>
      <div class="spc-corner br" style="color:${s.col}"><div class="spc-rank">${rank||""}</div><div class="spc-suit">${s.sym}</div></div>
    </div>`;
  };

  const leafCard=(sk,isSub,suit,rank)=>{
    const suitInfo=suit||(SK_SUIT[sk.cat]||{sym:"★",col:"#555",light:"#ddd"});
    const cardRank=rank||"";
    const rar=typeof skRarity==="function"?skRarity(sk):{name:"",col:"#555",border:"#555"};
    const eff=skEffectiveLevel(sk), maxed=sk.currentLevel>=sk.levels.length && eff>=sk.levels.length;
    const days=skDaysLeft(sk);
    const pathCol=PATH_COL[sk.cat]||"#3a3a3a";
    const maxLv=(sk.levels||[]).length||1;
    const fillPct=Math.round((eff/maxLv)*100);
    const leafCol=typeof skLeafColor==="function"?skLeafColor(eff,maxLv):"#6e7459";
    const pathIcon=(typeof SK_PATH_ICON!=="undefined"&&SK_PATH_ICON[sk.cat])||"🌿";
    const pathName=(typeof SK_CAT!=="undefined"&&SK_CAT[sk.cat])||sk.cat||"";
    const tier=skTier(sk, eff);
    const tierLabel=tier && eff>0 ? tier.label : (eff>0 ? ("Level "+eff) : "Unproven");
    const peak=sk.peakLevel||0;

    // Ladder rungs
    const ladder=sk.levels.map(l=>{
      const have=l.n<=eff, current=l.n===eff;
      const next = l.n===eff+1;                       // the level you'd reach next
      const reachable = !sk.auto && l.n>eff;          // any un-held level can be marked (manual skills)
      const cls=`sk-rung ${have?'have':''} ${current?'current':''} ${reachable?'reachable':''} ${next?'next':''}`;
      const attrs = reachable ? ` role="button" tabindex="0" data-skreach="${sk.id}" data-skreachlvl="${l.n}"` : "";
      const cta = next ? `<span class="sk-rung-cta">tap if reached →</span>` : (reachable?`<span class="sk-rung-cta dim">reached?</span>`:"");
      return `<div class="${cls}"${attrs}><div class="dot">${have?'✓':l.n}</div><div class="rung-txt"><b>L${l.n}.</b> ${esc(l.ability)}</div>${cta}</div>`;
    }).join("");

    // History timeline
    const histItems=(sk.history||[]).filter(h=>h.type==="promote"||h.type==="decay").slice(-8);
    const histHtml=histItems.length>1?(()=>{
      const parts=histItems.map((h,i)=>{
        const dt=new Date(h.ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});
        const sep=i<histItems.length-1?'<span class="sk-hist-sep">→</span>':'';
        return '<span class="sk-hist-item '+h.type+'">L'+h.level+'<span class="sk-hist-date"> '+dt+'</span></span>'+sep;
      });
      return '<div class="sk-hist">'+parts.join('')+'</div>';
    })():'';

    // Detail-section fade / reclaim notes
    let fadeDetail="";
    if(sk.currentLevel>0){
      if(eff<sk.currentLevel) fadeDetail=`<div class="sk-fade-note warn">⚠️ Slipped from L${sk.currentLevel} to L${eff} — tap L${eff+1} below when you can do it again to reclaim it.</div>`;
      else if(days!==null) fadeDetail=`<div class="sk-fade-note ${days<=Math.ceil((sk.fadeDays||30)*0.34)?'warn':''}">Fades in ${days} day${days!==1?'s':''} (every ${sk.fadeDays}d).</div>`;
    }
    let reclaimNote="";
    if(peak>eff && peak>0){
      reclaimNote=`<div class="sk-fade-note reclaim">🏔️ You've held Level ${peak} before — reclaiming it should come faster than learning it new.</div>`;
    }

    // Card-face footer: short fade indicator
    let fadeFoot="";
    if(sk.currentLevel>0){
      if(eff<sk.currentLevel) fadeFoot=`<span class="sk-fade-foot warn">⚠️ Slipped</span>`;
      else if(days!==null && days<=Math.ceil((sk.fadeDays||30)*0.34)) fadeFoot=`<span class="sk-fade-foot warn">🍂 ${days}d left</span>`;
      else if(days!==null) fadeFoot=`<span class="sk-fade-foot">🍂 ${days}d</span>`;
    }
    const pracDays=sk.lastQuestTs&&sk.currentLevel>0?Math.round((Date.now()-sk.lastQuestTs)/864e5):null;
    const pracFoot=pracDays!==null?(pracDays===0?"practiced today":`practiced ${pracDays}d ago`):"";
    const streak=typeof skStreak==="function"?skStreak(sk):0;
    const streakFoot=streak>=2?`<span class="sk-streak">🔥 ${streak}-day streak</span>`:"";
    const synergyWith=typeof skHasSynergy==="function"?skHasSynergy(sk):null;
    const synergyFoot=synergyWith?`<span class="sk-synergy-foot">⚡ ${esc(synergyWith)}</span>`:'';

    // Target level tick + footer
    const tgt=sk.targetLevel&&sk.targetLevel>0&&sk.targetLevel<=maxLv?sk.targetLevel:null;
    const tgtPct=tgt?Math.round(tgt/maxLv*100):null;
    const tgtFoot=tgt&&eff<tgt?`<span class="sk-tgt-foot">${tgt-eff} to L${tgt} target</span>`:(tgt&&eff>=tgt?`<span class="sk-tgt-foot reached">L${tgt} target reached</span>`:"");
    // Next-stage target dim tick
    const _stageOrder=["MS1","MS2","MS3","LDAC","MS4","commission","O1"];
    const _curIdx=typeof careerStage==="function"?_stageOrder.indexOf(careerStage()):-1;
    const _nextStage=_curIdx>=0&&_curIdx<_stageOrder.length-1?_stageOrder[_curIdx+1]:null;
    const _nextTgt=(sk.targets&&_nextStage&&sk.targets[_nextStage]!=null&&sk.targets[_nextStage]!==tgt&&sk.targets[_nextStage]<=maxLv)?sk.targets[_nextStage]:null;
    const _nextPct=_nextTgt?Math.round(_nextTgt/maxLv*100):null;

    // Level / max badge in header
    const lvBadge=maxed ? `Lv ${eff} / ${maxLv} <span class="sk-max-badge">MAX</span>` : (peak>eff&&peak>0 ? `Lv ${eff} / ${maxLv} <span class="sk-peak-badge">peak L${peak}</span>` : `Lv ${eff} / ${maxLv}`);

    return `<div class="sk-card ${isSub?'sk-sub':''} ${eff>0?'started':''} rarity-${rar.name.toLowerCase()}" style="--sk-col:${leafCol};--sk-fill:${fillPct}%;--deck-col:${suitInfo.col};--deck-light:${suitInfo.light||'#eee'};--rar-col:${rar.border}">
      <div class="spc-corner tl" style="color:${suitInfo.col}"><div class="spc-rank">${cardRank}</div><div class="spc-suit">${suitInfo.sym}</div></div>
      <div class="sk-card-header" style="background:${pathCol}22;border-bottom:1px solid ${pathCol}55">
        <span class="sk-card-path-icon">${pathIcon}</span>
        <span class="sk-card-path-label">PATH OF ${esc(pathName.toUpperCase())}</span>
        <span class="sk-card-path-lv">${lvBadge}</span>
        <button class="sk-card-edit" data-skedit="${sk.id}" title="Edit">✎</button>
        <button class="sk-card-del" data-skdel="${sk.id}" title="Delete">✕</button>
      </div>
      <div class="sk-card-emblem">
        ${skEmblemSvg(sk,eff,maxLv)||`<div class="sk-emblem-placeholder" style="border-color:${leafCol}"></div>`}
      </div>
      <div class="sk-card-name">${esc(sk.name)}${sk.auto?' <span class="sk-auto">auto</span>':''}</div>
      <div class="sk-card-tier">${esc(tierLabel)} <span class="sk-rarity-badge" style="color:${rar.col}">${esc(rar.name)}</span></div>
      <div class="sk-level-bar"><div class="sk-level-fill" style="background:${leafCol}"></div>${tgtPct?`<div class="sk-tgt-tick" style="left:${tgtPct}%"></div>`:''}${_nextPct?`<div class="sk-tgt-tick-next" style="left:${_nextPct}%" title="${_nextStage} target: L${_nextTgt}"></div>`:''}</div>
      ${(()=>{const noted=(sk.history||[]).filter(h=>h.note).slice(-3).reverse();return noted.length?`<div class="sk-log-recent">${noted.map(h=>`<div class="sk-log-entry"><span class="sk-log-entry-ts">${new Date(h.ts).toLocaleDateString()}</span> ${esc(h.note.slice(0,80))}</div>`).join('')}</div>`:'';})()}
      <div class="sk-card-footer">
        <div class="sk-card-footer-left">${fadeFoot}${pracFoot?`<span class="sk-prac-foot">${pracFoot}</span>`:''}${streakFoot}${tgtFoot}${synergyFoot}</div>
        <div class="sk-footer-actions">
          ${!sk.auto && sk.currentLevel>0 ? `<button class="sk-practice-btn" data-skpractice="${esc(sk.id)}" title="Reset fade timer — mark as practiced outside the app">practiced</button>` : ''}
          <button class="sk-copy-btn" data-skcopy="${sk.id}" title="Copy skill card">⧉ copy</button>
        </div>
      </div>
      <details class="sk-card-detail">
        <summary>▸ Ladder &amp; history</summary>
        <div class="sk-card-detail-inner">
          <div class="sk-ladder">${ladder}</div>
          ${histHtml}
          ${fadeDetail}
          ${reclaimNote}
          ${(sk.why||sk.whatYouDo||sk.howTo||sk.prep||sk.recover||sk.safety||sk.roadmap||sk.advance||sk.maintain)?`<details class="sk-info"><summary>ℹ️ Why, how &amp; how to level up</summary><div class="sk-info-body">${sk.why?`<p><b>Why:</b> ${esc(sk.why)}</p>`:''}${sk.whatYouDo?`<p><b>What you do:</b> ${esc(sk.whatYouDo)}</p>`:''}${sk.howTo?`<p><b>How:</b> ${esc(sk.howTo)}</p>`:''}${sk.prep?`<p class="sk-prep"><b>🤸 Warm-up before:</b> ${esc(sk.prep)}</p>`:''}${sk.recover?`<p class="sk-recover"><b>🧘 Stretch after:</b> ${esc(sk.recover)}</p>`:''}${skProgressBlock(sk,eff)}${sk.safety?`<p class="sk-safety">⚠️ ${sk.safety}</p>`:''}</div></details>`:''}
          <button class="sk-work" data-skwork="${sk.id}">▶ Work on this</button>
          <div class="sk-work-panel" id="skwork-${sk.id}"></div>
        </div>
      </details>
      <div class="spc-corner br" style="color:${suitInfo.col}"><div class="spc-rank">${cardRank}</div><div class="spc-suit">${suitInfo.sym}</div></div>
    </div>`;
  };

  const groupCard=(sk,suit,rankMap)=>{
    const subs=skSubsOf(sk);
    const rolled=skRolledLevel(sk);
    const s=suit||{sym:"★",col:"#555",light:"#ddd"};
    const miniCard=sub=>{
      const eff=skEffectiveLevel(sub); const max=(sub.levels||[]).length||10;
      const pct=Math.min(100,Math.round(eff/max*100));
      const col=skLeafColor(eff,max,sub);
      const tier=skTier(sub,eff); const tierLabel=tier&&eff>0?tier.label:(eff>0?"L"+eff:"—");
      const state=skFadeState(sub);
      const r=rankMap&&rankMap[sub.id]||"";
      return `<div class="sk-mini-card${state!=='current'?' sk-mini-atrisk':''}${eff===0?' sk-mini-unstarted':''}" style="--deck-col:${s.col};--deck-light:${s.light}">
        <div class="spc-corner tl" style="color:${s.col}"><div class="spc-rank">${r}</div><div class="spc-suit">${s.sym}</div></div>
        <div class="sk-mini-emb">${skEmblemSvg(sub,eff,max)||''}</div>
        <div class="sk-mini-name">${esc(sub.name)}</div>
        <div class="sk-mini-tier">${esc(tierLabel)}</div>
        <div class="sk-mini-bar"><div class="sk-mini-fill" style="width:${pct}%;background:${col}"></div></div>
        <div class="sk-mini-lvl">L${eff}/${max}</div>
        ${sub.auto?'':`<button class="sk-mini-prac" data-skpractice="${sub.id}" title="practiced">✓</button>`}
        <div class="spc-corner br" style="color:${s.col}"><div class="spc-rank">${r}</div><div class="spc-suit">${s.sym}</div></div>
      </div>`;
    };
    return `<div class="sk-group">
      <div class="sk-group-top">
        <span class="sk-group-suit">${s.sym}</span>
        <div class="sk-group-name">${esc(sk.name)} <span class="sk-group-sub">${subs.length} skill${subs.length!==1?'s':''}</span></div>
        <span class="sk-level-badge group">Lv ${fmtLvl(rolled)}</span>
        <button class="sk-card-edit" data-skedit="${sk.id}">✎</button>
        <button class="sk-card-del" data-skdel="${sk.id}">✕</button>
      </div>
      <div class="sk-subs sk-mini-grid">${subs.map(miniCard).join("")}</div>
    </div>`;
  };

  // Determine the most recently active path to expand by default
  const px=S.pathXP||{};
  let maxPxCat=null, maxPxVal=-1;
  SK_CAT_ORDER.forEach(c=>{
    const tops=skTopLevelInCat(c);
    if(!tops.length) return;
    if((px[c]||0)>maxPxVal){ maxPxVal=px[c]||0; maxPxCat=c; }
    if(maxPxCat===null) maxPxCat=c; // fallback: first cat with skills
  });

  let html="";
  SK_CAT_ORDER.forEach(cat=>{
    const tops=skTopLevelInCat(cat);
    if(!tops.length) return;
    const catLvl=catRolledLevel(cat);
    const pathCol=PATH_COL[cat]||"#3a3a3a";
    const pathIcon=(typeof SK_PATH_ICON!=="undefined"&&SK_PATH_ICON[cat])||"🌿";
    const pathName=(typeof SK_CAT!=="undefined"&&SK_CAT[cat])||cat||"";
    const isOpen=false;
    // fading skill count for this category
    const catLeaves=S.lifeSkills.filter(s=>s.cat===cat&&!s.group&&s.levels&&s.levels.length&&s.currentLevel>0);
    const fadingCount=catLeaves.filter(s=>{ const d=skDaysLeft(s); return d!==null && d<=Math.ceil((s.fadeDays||30)*0.34); }).length;
    const suit=SK_SUIT[cat]||{sym:"★",name:cat,col:"#555",light:"#ddd"};
    const rankMap={};
    // importance-ranked: most important leaf → King (highest face), least → Ace/2
    const _stage=typeof careerStage==="function"?careerStage():"MS2";
    const _allLeaves=[];
    tops.forEach(sk=>{ if(sk.group) _allLeaves.push(...skSubsOf(sk)); else _allLeaves.push(sk); });
    _allLeaves.sort((a,b)=>{
      const tA=(a.targets&&a.targets[_stage])||a.targetLevel||a.currentLevel||0;
      const tB=(b.targets&&b.targets[_stage])||b.targetLevel||b.currentLevel||0;
      return tB-tA;
    });
    _allLeaves.forEach((sk,i)=>{ rankMap[sk.id]=CARD_RANKS[Math.max(0,CARD_RANKS.length-1-i)]; });
    const deckEmblemSvg=skEmblemSvg({id:cat+"-deck",cat:cat},5,10)||'';
    const pathAllLeaves=S.lifeSkills.filter(s=>s.cat===cat&&!s.group&&s.levels&&s.levels.length);
    const totalLeaves=pathAllLeaves.length;
    const pathStartedCount=pathAllLeaves.filter(s=>s.currentLevel>0).length;
    const pathMaxedCount=pathAllLeaves.filter(s=>s.currentLevel>0&&s.currentLevel>=s.levels.length).length;
    const allStartedBadge=pathStartedCount===totalLeaves&&totalLeaves>0?`<span class="sk-path-badge discovered">All Collected</span>`:'';
    const allMaxedBadge=pathMaxedCount===totalLeaves&&totalLeaves>0?`<span class="sk-path-badge mastered">★ All Mastered</span>`:'';
    const pathBadges=allMaxedBadge||allStartedBadge;
    // Split tops: groups always in main deck; leaves split by started vs unstarted
    const mainTops=tops.filter(sk=>sk.group||(sk.currentLevel>0));
    const sideTops=tops.filter(sk=>!sk.group&&sk.currentLevel===0);
    const _roman=["I","II","III","IV","V","VI","VII","VIII"];
    const _SUBDECK=13;
    const chunks=[];
    for(let i=0;i<mainTops.length;i+=_SUBDECK) chunks.push(mainTops.slice(i,i+_SUBDECK));
    const bodyContent=mainTops.length===0?'':(chunks.length>1
      ? chunks.map((chunk,ci)=>{
          const chCards=chunk.map(sk=>sk.group?groupCard(sk,suit,rankMap):leafCard(sk,false,suit,rankMap[sk.id])).join("");
          const num=_roman[ci]||String(ci+1);
          const sdCount=chunk.reduce((a,sk)=>a+(sk.group?skSubsOf(sk).length:1),0);
          return `<div class="sk-subdeck" style="--deck-col:${suit.col};--deck-light:${suit.light}">
            <div class="sk-subdeck-hdr" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
              <div class="sdb-corner tl"><div class="sdb-rank">${num}</div><div class="sdb-suit">${suit.sym}</div></div>
              <div class="sdb-center"><div class="sdb-path-name" style="font-size:.72rem">${esc(suit.name)} ${num}</div><div class="sdb-count">${sdCount} skill${sdCount!==1?'s':''}</div></div>
              <div class="sdb-corner br"><div class="sdb-rank">${num}</div><div class="sdb-suit">${suit.sym}</div></div>
            </div>
            <div class="sk-subdeck-body">${chCards}</div>
          </div>`;
        }).join("")
      : mainTops.map(sk=>sk.group?groupCard(sk,suit,rankMap):leafCard(sk,false,suit,rankMap[sk.id])).join(""));
    const multiTag=chunks.length>1?` · <span class="sdb-subdeck-tag">${chunks.length} decks</span>`:"";
    // Side Deck — face-down cards for unstarted skills
    let sideDeckHtml='';
    if(sideTops.length>0){
      const sideCards=sideTops.map((sk,i)=>{
        const seed=typeof skSeedOf==="function"?skSeedOf(sk.name,sk.cat):null;
        const isSynth=!!(seed&&seed.synthesizedFrom)&&!sk.synthesisUnlocked;
        return faceDownCard(sk,suit,rankMap[sk.id],isSynth);
      }).join("");
      sideDeckHtml=`<details class="sk-side-deck">
        <summary class="sk-side-deck-hdr">
          <span class="sk-side-deck-icon">${suit.sym}</span>
          <span class="sk-side-deck-title">Side Deck</span>
          <span class="sk-side-deck-count">${sideTops.length} unstarted</span>
        </summary>
        <div class="sk-side-deck-body">${sideCards}</div>
      </details>`;
    }

    html+=`<div class="sk-deck" id="skcat-${cat}" style="--deck-col:${suit.col};--deck-light:${suit.light}">
      <div class="sk-deck-header${isOpen?' open':''}" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
        <div class="sdb-corner tl"><div class="sdb-rank">Lv${fmtLvl(catLvl)}</div><div class="sdb-suit">${suit.sym}</div></div>
        <div class="sdb-center">
          <div class="sdb-emblem">${deckEmblemSvg}</div>
          <div class="sdb-path-name">${esc(pathName)}${pathBadges?` ${pathBadges}`:''}</div>
          <div class="sdb-suit-name">${esc(suit.name)}</div>
          <div class="sdb-count">${pathStartedCount}/${totalLeaves} skill${totalLeaves!==1?'s':''}${fadingCount?` · <span class="sdb-fading">🍂${fadingCount}</span>`:''}${multiTag}</div>
        </div>
        <div class="sdb-corner br"><div class="sdb-rank">Lv${fmtLvl(catLvl)}</div><div class="sdb-suit">${suit.sym}</div></div>
      </div>
      <div class="sk-deck-body${isOpen?' open':''}">
        ${bodyContent}
        ${sideDeckHtml}
      </div>
    </div>`;
  });
  // Jokers deck — auto skills + user-tagged jokers from all paths
  const _jokers=(S.lifeSkills||[]).filter(s=>!s.group&&(s.auto||s.joker)&&s.levels&&s.levels.length);
  if(_jokers.length){
    const _jSuit={sym:"🃏",name:"Wildcards",col:"#7b1fa2",light:"#fce4ec"};
    _jokers.sort((a,b)=>{ const tA=(a.targets&&a.targets[_stage])||a.targetLevel||a.currentLevel||0; const tB=(b.targets&&b.targets[_stage])||b.targetLevel||b.currentLevel||0; return tB-tA; });
    const _jRankMap={};
    _jokers.forEach((sk,i)=>{ _jRankMap[sk.id]=CARD_RANKS[Math.max(0,CARD_RANKS.length-1-i)]; });
    const _jCards=_jokers.map(sk=>leafCard(sk,false,_jSuit,_jRankMap[sk.id])).join("");
    html=`<div class="sk-deck sk-joker-deck" id="skcat-joker" style="--deck-col:#7b1fa2;--deck-light:#fce4ec">
      <div class="sk-deck-header" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
        <div class="sdb-corner tl"><div class="sdb-rank">★</div><div class="sdb-suit">🃏</div></div>
        <div class="sdb-center">
          <div class="sdb-path-name">WILDCARDS</div>
          <div class="sdb-suit-name">Jokers</div>
          <div class="sdb-count">${_jokers.length} card${_jokers.length!==1?'s':''}</div>
        </div>
        <div class="sdb-corner br"><div class="sdb-rank">★</div><div class="sdb-suit">🃏</div></div>
      </div>
      <div class="sk-deck-body">${_jCards}</div>
    </div>`+html;
  }

  listEl.innerHTML=html;
  // wire search input — persist term across re-renders, filter immediately
  const srchEl=document.getElementById("skSearch");
  if(srchEl){
    srchEl.value=_skSearchTerm;
    srchEl.oninput=e=>{ _skSearchTerm=e.target.value; _filterSkillDecks(); };
  }
  if(_skSearchTerm) _filterSkillDecks();
  // heat-map toggle
  const hmBtn=document.getElementById("skHeatmapToggle");
  const hmEl=document.getElementById("skHeatmap");
  if(hmBtn){
    hmBtn.classList.toggle("active",_skHeatmapVisible);
    hmEl&&(hmEl.style.display=_skHeatmapVisible?"block":"none");
    if(_skHeatmapVisible) renderHeatmap();
    hmBtn.onclick=()=>{ _skHeatmapVisible=!_skHeatmapVisible; hmBtn.classList.toggle("active",_skHeatmapVisible); if(hmEl){hmEl.style.display=_skHeatmapVisible?"block":"none"; if(_skHeatmapVisible)renderHeatmap();} };
  }
  // assessment toggle
  const assBtn=document.getElementById("skAssessToggle");
  const assEl=document.getElementById("skAssessWrap");
  if(assBtn){
    assBtn.classList.toggle("active",_skAssessVisible);
    if(assEl) assEl.style.display=_skAssessVisible?"block":"none";
    if(_skAssessVisible) renderSkillAssessment();
    assBtn.onclick=()=>{ _skAssessVisible=!_skAssessVisible; assBtn.classList.toggle("active",_skAssessVisible); if(assEl){assEl.style.display=_skAssessVisible?"block":"none"; if(_skAssessVisible)renderSkillAssessment();} };
  }
  // gap map toggle
  const gmBtn=document.getElementById("skGapMapToggle");
  const gmEl=document.getElementById("skGapMapWrap");
  if(gmBtn){
    gmBtn.classList.toggle("active",_gapMapVisible);
    if(gmEl) gmEl.style.display=_gapMapVisible?"block":"none";
    if(_gapMapVisible) renderSkillGapMap();
    gmBtn.onclick=()=>{ _gapMapVisible=!_gapMapVisible; gmBtn.classList.toggle("active",_gapMapVisible); if(gmEl){gmEl.style.display=_gapMapVisible?"block":"none"; if(_gapMapVisible)renderSkillGapMap();} };
  }
  // weekly queue toggle
  const wqBtn=document.getElementById("skWeeklyToggle");
  const wqEl=document.getElementById("skWeeklyQueue");
  if(wqBtn){
    wqBtn.classList.toggle("active",_skWeeklyVisible);
    if(wqEl) wqEl.style.display=_skWeeklyVisible?"block":"none";
    if(_skWeeklyVisible) renderWeeklyQueue();
    wqBtn.onclick=()=>{ _skWeeklyVisible=!_skWeeklyVisible; wqBtn.classList.toggle("active",_skWeeklyVisible); if(wqEl){wqEl.style.display=_skWeeklyVisible?"block":"none"; if(_skWeeklyVisible)renderWeeklyQueue();} };
  }
  // populate the right-side category jump bar (only cats that have skills)
  const jb=document.getElementById("skJumpbar");
  if(jb){
    const icons={tactical:"⚔️",physical:"💪",cognitive:"🧠",physiological:"❤️",technical:"⚙️",leadership:"⭐",academic:"📚",personal:"🌱"};
    const jokerBtn=_jokers&&_jokers.length?`<button data-skjump="joker">🃏<span class="jb-tip">Wildcards</span></button>`:"";
    jb.innerHTML=jokerBtn+SK_CAT_ORDER.filter(c=>skTopLevelInCat(c).length).map(c=>
      `<button data-skjump="${c}">${icons[c]||"•"}<span class="jb-tip">${SK_CAT[c]}</span></button>`).join("");
  }
}
function copySkillsSummary(){
  const started=(S.lifeSkills||[]).filter(s=>!s.group&&s.currentLevel>0);
  if(!started.length){ toast("No started skills to export"); return; }
  const byPath={};
  started.forEach(s=>{ const p=s.cat||"personal"; (byPath[p]=byPath[p]||[]).push(s); });
  const text=SK_CAT_ORDER.filter(p=>byPath[p]).map(p=>{
    const pm=PATH_META[p]||{name:p};
    const lines=byPath[p].map(s=>{
      const eff=skEffectiveLevel(s), t2=skTier(s,eff);
      return `  ${s.name} — Level ${eff}${t2?` (${t2.label})`:''}`;
    });
    return `[${pm.name}]\n${lines.join("\n")}`;
  }).join("\n\n");
  navigator.clipboard.writeText(text).then(()=>toast("📋 Skills summary copied")).catch(()=>toast("Copy failed"));
}
function updateAllSkillTargets(){
  const stage=typeof careerStage==="function"?careerStage():"MS2";
  let n=0;
  S.lifeSkills.forEach(sk=>{
    const seed=SEED_SKILLS.find(s=>s.name===sk.name);
    if(!seed||!seed.targets||seed.targets[stage]==null) return;
    const newTgt=seed.targets[stage];
    if(sk.targetLevel==null||sk.targetLevel<newTgt){ sk.targetLevel=newTgt; n++; }
  });
  if(n>0){ save(); renderSkillsTab(); toast(`↑ ${n} skill target${n!==1?"s":""} updated to ${stage}`); }
  else toast(`All targets already at ${stage} level`);
}
let _skWeeklyVisible=false;
function renderWeeklyQueue(){
  const el=document.getElementById("skWeeklyQueue"); if(!el) return;
  const urgent=(S.lifeSkills||[])
    .filter(s=>!s.group&&s.currentLevel>0&&!s.auto)
    .map(s=>({s,days:skDaysLeft(s),state:skFadeState(s)}))
    .filter(x=>x.state!=='current'||(x.days!==null&&x.days<=7))
    .sort((a,b)=>(a.days!==null?a.days:-999)-(b.days!==null?b.days:-999));
  if(!urgent.length){ el.innerHTML=`<div class="sk-wq-empty">All started skills have ≥8 days remaining — nothing urgent this week.</div>`; return; }
  el.innerHTML=urgent.map(({s,days,state})=>{
    const eff=skEffectiveLevel(s), maxLv=(s.levels||[]).length||1;
    const leafCol=typeof skLeafColor==="function"?skLeafColor(eff,maxLv,s):"#6e7459";
    const overdue=state==='decayed', atRisk=state==='at-risk';
    const dayStr=days===null?"overdue":days<=0?"overdue":`${days}d left`;
    const dayCol=days===null||days<=0?'var(--blood)':days<=3?'var(--ember)':'var(--gold)';
    return `<div class="sk-wq-row">
      <div class="sk-wq-emblem">${skEmblemSvg(s,eff,maxLv)||`<div class="sk-wq-dot" style="background:${leafCol}"></div>`}</div>
      <div class="sk-wq-info">
        <div class="sk-wq-name">${esc(s.name)}${overdue?' <span class="sk-wq-tag blood">decayed</span>':atRisk?' <span class="sk-wq-tag amber">at risk</span>':''}</div>
        <div class="sk-wq-days" style="color:${dayCol}">${dayStr}</div>
      </div>
      <button class="sk-wq-btn" data-skpractice="${esc(s.id)}">✓ practiced</button>
    </div>`;
  }).join('');
}
let _skAssessVisible=false;
let _gapMapVisible=false;
function renderSkillGapMap(){
  const el=document.getElementById("skGapMapWrap"); if(!el) return;
  const stages=['MS1','MS2','MS3','LDAC','MS4','commission','O1'];
  const curStage=typeof careerStage==="function"?careerStage():"MS2";
  const seedByName={};
  (typeof SEED_SKILLS!=="undefined"?SEED_SKILLS:[]).forEach(s=>{ if(s.targets) seedByName[s.name]=s.targets; });
  const rows=SK_CAT_ORDER.map(cat=>{
    const pm=PATH_META[cat]; if(!pm) return '';
    const cols=stages.map(stage=>{
      const skills=(S.lifeSkills||[]).filter(s=>s.cat===cat&&!s.group&&s.levels&&s.levels.length&&seedByName[s.name]&&seedByName[s.name][stage]!=null);
      if(!skills.length) return `<td class="sk-gm-td">—</td>`;
      const behind=skills.filter(s=>skEffectiveLevel(s)<seedByName[s.name][stage]).length;
      const color=behind===0?'var(--jade)':behind<=2?'var(--ember)':'var(--blood)';
      const isCur=stage===curStage;
      return `<td class="sk-gm-td${isCur?' sk-gm-cur':''}" style="color:${color}">${behind===0?'✓':behind}</td>`;
    }).join('');
    return `<tr><td class="sk-gm-path">${pm.icon} ${esc(SK_CAT[cat]||cat)}</td>${cols}</tr>`;
  }).filter(Boolean).join('');
  el.innerHTML=`<div class="sk-gap-map"><table class="sk-gm-table">
    <thead><tr><th></th>${stages.map(s=>`<th class="sk-gm-stage${s===curStage?' sk-gm-cur':''}">${s}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="sk-gm-legend"><span style="color:var(--jade)">✓ on track</span> · <span style="color:var(--ember)">1–2 behind</span> · <span style="color:var(--blood)">3+ behind</span> · current stage highlighted</div>
  </div>`;
}
function renderSkillAssessment(){
  const el=document.getElementById("skAssessWrap"); if(!el) return;
  const stage=typeof careerStage==="function"?careerStage():"MS2";
  const rows=(S.lifeSkills||[])
    .filter(sk=>!sk.group&&sk.levels&&sk.targetLevel!=null)
    .map(sk=>{ const eff=skEffectiveLevel(sk); return {sk,eff,gap:sk.targetLevel-eff}; })
    .sort((a,b)=>b.gap-a.gap);
  if(!rows.length){ el.innerHTML=`<div class="sk-assess-empty">No skill targets set. Open a skill card, use the Work panel to set a target, or tap ↑ sync to auto-fill from your career stage.</div>`; return; }
  const pm=PATH_META||{};
  el.innerHTML=`<div class="sk-assessment-table">
    <div class="sk-assess-head"><span>Stage: ${stage}</span><span>${rows.filter(r=>r.gap<=0).length} / ${rows.length} at target</span></div>
    ${rows.map(r=>{
      const pathCol=(pm[r.sk.cat]&&pm[r.sk.cat].color)||"var(--ink-faint)";
      const gapStr=r.gap>0?`<span class="sk-assess-gap behind">−${r.gap}</span>`:(r.gap<0?`<span class="sk-assess-gap ahead">+${Math.abs(r.gap)}</span>`:`<span class="sk-assess-gap met">✓</span>`);
      return `<div class="sk-assess-row"><span class="sk-assess-path" style="color:${pathCol}">${SK_PATH_ICON[r.sk.cat]||"•"}</span><span class="sk-assess-name">${esc(r.sk.name)}</span><span class="sk-assess-lv">L${r.eff}</span><span class="sk-assess-tgt">→L${r.sk.targetLevel}</span>${gapStr}</div>`;
    }).join("")}
  </div>`;
}
