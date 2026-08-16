/* ---------------- tank drawing ---------------- */
function drawDeco(c,hw,hh,r){
  const d=c.deco||'none';
  cx.lineWidth=2;
  if(d==='stripe'){
    cx.fillStyle='rgba(255,255,255,.7)';
    cx.fillRect(-hw,-5.5,hw*2,3.6);cx.fillRect(-hw,2.4,hw*2,3.6);
  }else if(d==='checker'){
    for(let i=0;i<6;i++){cx.fillStyle=i%2?'rgba(255,255,255,.8)':'rgba(20,22,40,.55)';
      cx.fillRect(-hw+ i*(hw*2/6),-4.5,hw*2/6,9)}
  }else if(d==='star'){
    cx.fillStyle='rgba(255,255,255,.75)';
    cx.save();cx.translate(-hw*.45,0);cx.beginPath();
    for(let i=0;i<10;i++){const rr2=i%2?2.4:5.5,a=i/10*Math.PI*2-Math.PI/2;cx.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}
    cx.closePath();cx.fill();cx.restore();
  }else if(d==='flame'){
    cx.fillStyle='rgba(255,210,63,.8)';
    for(const sy of [-hh*.55,hh*.55]){
      cx.beginPath();cx.moveTo(-hw*.7,sy);cx.quadraticCurveTo(-hw*.2,sy-3,hw*.1,sy);
      cx.quadraticCurveTo(-hw*.2,sy+3,-hw*.7,sy);cx.fill();
    }
  }else if(d==='bolt'){
    cx.fillStyle='rgba(255,255,255,.85)';
    cx.beginPath();cx.moveTo(3,-hh*.7);cx.lineTo(-4,-1);cx.lineTo(0,-1);
    cx.lineTo(-3,hh*.7);cx.lineTo(4,1);cx.lineTo(0,1);cx.closePath();cx.fill();
  }else if(d==='camo'){
    cx.fillStyle='rgba(20,22,40,.25)';
    for(const [bx,by,br2] of [[-hw*.5,-hh*.3,4.5],[hw*.2,hh*.35,5],[hw*.55,-hh*.4,3.5],[-hw*.1,0,4]]){
      cx.beginPath();cx.ellipse(bx,by,br2*1.5,br2,.5,0,Math.PI*2);cx.fill();
    }
  }else if(d==='sand'){
    cx.fillStyle='#d9c58f';cx.strokeStyle='rgba(20,22,40,.5)';
    for(let i=-2;i<=2;i++){cx.beginPath();cx.ellipse(hw*.72,i*4.4,3,2,0,0,Math.PI*2);cx.fill();cx.stroke()}
  }else if(d==='drums'){
    for(const sy of [-4.5,4.5]){
      cx.fillStyle='#8f5f2c';cx.beginPath();cx.arc(-hw*.68,sy,3.8,0,Math.PI*2);cx.fill();
      cx.strokeStyle=INK;cx.stroke();
    }
  }else if(d==='rack'){
    cx.fillStyle='rgba(20,22,40,.55)';
    for(let i=-1;i<=1;i++){rr(cx,-hw*.8,i*5.4-2,5,4,1.5);cx.fill()}
  }else if(d==='fin'){
    cx.fillStyle=c.dark;cx.strokeStyle=INK;
    cx.beginPath();cx.moveTo(-hw*.95,-hh*.5);cx.lineTo(-hw*.45,0);cx.lineTo(-hw*.95,hh*.5);cx.closePath();
    cx.fill();cx.stroke();
  }else if(d==='spikes'){
    cx.fillStyle='#e8e3d0';cx.strokeStyle=INK;
    for(let i=-1;i<=1;i++){
      cx.beginPath();cx.moveTo(hw*.85,i*6-2.5);cx.lineTo(hw*1.25,i*6);cx.lineTo(hw*.85,i*6+2.5);cx.closePath();
      cx.fill();cx.stroke();
    }
  }else if(d==='coil'){
    cx.strokeStyle='rgba(255,255,255,.8)';cx.lineWidth=1.8;
    for(let i=0;i<3;i++){cx.beginPath();cx.arc(-hw*.45,0,3+i*2.6,-.9,.9);cx.stroke()}
  }else if(d==='plate'){
    cx.strokeStyle='rgba(20,22,40,.45)';cx.lineWidth=2.4;
    rr(cx,-hw*.55,-hh*.5,hw*1.1,hh,4);cx.stroke();
    cx.fillStyle='rgba(20,22,40,.5)';
    for(const [px,py] of [[-hw*.55,-hh*.5],[hw*.55,-hh*.5],[-hw*.55,hh*.5],[hw*.55,hh*.5]]){
      cx.beginPath();cx.arc(px,py,1.6,0,Math.PI*2);cx.fill();
    }
  }
}
function drawTankBody(o){
  const c=o.cls,r=c.radius*1.22,rec=Math.max(0,o.recoil||0),fx=o.fx;
  const ta=(o.tang==null?o.ang:o.tang);
  const ghost=fx&&fx.ghost>0;
  if(ghost)cx.globalAlpha=.45;
  // team light pool, then the ground shadow
  const ring0=o.teamColor||(o.team!==undefined?TEAMS[o.team].color:null);
  if(ring0){
    cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.12;
    cx.fillStyle=ring0;cx.beginPath();cx.ellipse(o.x,o.y+4,r*1.7,r*1.35,0,0,Math.PI*2);cx.fill();
    cx.restore();
  }
  cx.fillStyle='rgba(20,22,40,.26)';
  cx.beginPath();cx.ellipse(o.x+3,o.y+6,r*1.2,r*.98,0,0,Math.PI*2);cx.fill();
  const sq=o.squash||0;
  const shape=c.shape||'box',hover=shape==='hover';
  const bob=hover?Math.sin(frame*.1+(o.team||0)*2)*2:0;
  cx.save();cx.translate(o.x,o.y-bob);
  cx.scale(1+sq*.22,1-sq*.22);
  cx.rotate(o.ang);
  cx.lineWidth=3.4;cx.strokeStyle=INK;cx.lineJoin='round';
  const ph=((o.dist||0)*.9)%7;
  if(hover){
    // no treads: an under-glow thruster ring
    cx.save();cx.globalCompositeOperation='lighter';
    cx.globalAlpha=.5+.2*Math.sin(frame*.2);
    cx.fillStyle=c.color;cx.beginPath();cx.ellipse(0,0,r*1.25,r*1.05,0,0,Math.PI*2);cx.fill();
    cx.restore();
  }else{
    const tl=shape==='long'?r*1.25:r*1.06,segs=shape==='hex'?2:1;
    for(const side of [-1,1]){
      const ty=side<0?-r*1.18:r*.56;
      for(let sg=0;sg<segs;sg++){
        const x0=-tl+sg*(tl*2/segs)+ (segs>1?2:0),w2=tl*2/segs-(segs>1?4:0);
        const tg=cx.createLinearGradient(0,ty,0,ty+r*.62);
        tg.addColorStop(0,c.dark);tg.addColorStop(1,'rgba(20,22,40,.85)');
        cx.fillStyle=tg;rr(cx,x0,ty,w2,r*.62,5);cx.fill();cx.stroke();
        cx.save();cx.beginPath();rr(cx,x0,ty,w2,r*.62,5);cx.clip();
        cx.strokeStyle='rgba(255,255,255,.22)';cx.lineWidth=2.4;
        for(let n=-tl*1.2;n<tl*1.2;n+=7){cx.beginPath();cx.moveTo(n+ph,ty);cx.lineTo(n+ph,ty+r*.62);cx.stroke()}
        cx.restore();
        cx.strokeStyle=INK;cx.lineWidth=3.4;
      }
    }
  }
  // hull silhouette per shape
  const hg=cx.createLinearGradient(0,-r,0,r);
  hg.addColorStop(0,c.light||c.color);hg.addColorStop(.55,c.color);hg.addColorStop(1,c.dark);
  cx.fillStyle=hg;
  const hw=shape==='long'?r*1.32:r*1.04,hh=r*.9;
  cx.beginPath();
  if(shape==='wedge'){
    cx.moveTo(hw*1.35,0);cx.lineTo(hw*.35,-hh);cx.lineTo(-hw,-hh*.8);
    cx.lineTo(-hw,hh*.8);cx.lineTo(hw*.35,hh);cx.closePath();
  }else if(shape==='hex'){
    cx.moveTo(hw*1.15,0);cx.lineTo(hw*.55,-hh);cx.lineTo(-hw*.55,-hh);
    cx.lineTo(-hw*1.15,0);cx.lineTo(-hw*.55,hh);cx.lineTo(hw*.55,hh);cx.closePath();
  }else if(shape==='round'||hover){
    cx.ellipse(0,0,hw*1.08,hh*1.06,0,0,Math.PI*2);
  }else{
    rr(cx,-hw,-hh,hw*2,hh*2,r*.42);
  }
  cx.fill();cx.stroke();
  cx.save();cx.clip();
  cx.fillStyle='rgba(255,255,255,.28)';rr(cx,-hw*.9,-hh*.8,hw*1.8,hh*.56,r*.2);cx.fill();
  cx.fillStyle='rgba(20,22,40,.16)';rr(cx,-hw*.9,hh*.26,hw*1.8,hh*.46,r*.16);cx.fill();
  drawDeco(c,hw,hh,r);
  cx.restore();
  cx.fillStyle=c.dark;rr(cx,-r-4,-4.5,6,9,2.5);cx.fill();cx.stroke(); // exhaust
  cx.strokeStyle='rgba(20,22,40,.28)';cx.lineWidth=1.6;
  cx.beginPath();cx.moveTo(-r*.4,-r*.74);cx.lineTo(-r*.4,r*.74);cx.moveTo(r*.45,-r*.74);cx.lineTo(r*.45,r*.74);cx.stroke();
  cx.strokeStyle=INK;cx.lineWidth=3.4;
  cx.restore();
  // barrel + muzzle flash follow the turret so shots go where the pilot looks
  cx.save();cx.translate(o.x,o.y);cx.scale(1+sq*.22,1-sq*.22);cx.rotate(ta);
  cx.lineWidth=3.4;cx.strokeStyle=INK;cx.lineJoin='round';
  // barrel per class
  cx.fillStyle=c.dark;
  if(c.skin==='scout'){
    rr(cx,4-rec,-8,c.bl+r-8,5,2.5);cx.fill();cx.stroke();
    rr(cx,4-rec,3,c.bl+r-8,5,2.5);cx.fill();cx.stroke();
  }else if(c.skin==='titan'){
    rr(cx,4-rec,-6.5,c.bl+r-8,13,4.5);cx.fill();cx.stroke();
    rr(cx,c.bl+r-10-rec,-9,5.5,18,2.5);cx.fill();cx.stroke();
  }else if(c.skin==='longshot'){
    rr(cx,4-rec,-3,c.bl+r-6,6,2.5);cx.fill();cx.stroke();
    cx.fillStyle=c.color;rr(cx,c.bl*.45,-4.5,7,9,2);cx.fill();cx.stroke();
  }else if(c.skin==='scatter'){
    rr(cx,4-rec,-7.5,c.bl+r-10,15,4.5);cx.fill();cx.stroke();
    rr(cx,c.bl+r-12-rec,-9.5,5.5,19,2.5);cx.fill();cx.stroke();
  }else if(c.skin==='ricochet'){
    rr(cx,4-rec,-4.5,c.bl+r-8,9,3.5);cx.fill();cx.stroke();
    cx.fillStyle='#7ae0c3';rr(cx,c.bl+r-11-rec,-4.5,5.5,9,2.5);cx.fill();cx.stroke();
  }else if(c.skin==='bombard'){
    cx.fillStyle=c.dark;rr(cx,2-rec,-7,c.bl+r-6,14,5);cx.fill();cx.stroke();
    cx.fillStyle='#3a3a2a';cx.beginPath();cx.arc(c.bl+r-6-rec,0,7.5,0,Math.PI*2);cx.fill();cx.stroke();
  }else if(c.skin==='blaze'){
    rr(cx,4-rec,-5.5,c.bl+r-10,11,3.5);cx.fill();cx.stroke();
    cx.fillStyle='#ffb703';
    cx.beginPath();cx.moveTo(c.bl+r-9-rec,-7.5);cx.lineTo(c.bl+r-1-rec,0);cx.lineTo(c.bl+r-9-rec,7.5);cx.closePath();
    cx.fill();cx.stroke();
  }else if(c.skin==='phantom'){
    cx.globalAlpha*=.9;
    rr(cx,4-rec,-4.5,c.bl+r-8,9,3.5);cx.fill();cx.stroke();
    cx.fillStyle='rgba(180,220,255,.65)';rr(cx,c.bl*.5,-3,8,6,2);cx.fill();
    cx.globalAlpha=ghost?.45:1;
  }else{
    rr(cx,4-rec,-4.5,c.bl+r-8,9,3.5);cx.fill();cx.stroke();
  }
  // muzzle flash
  if(rec>2.5){
    const mx=c.bl+r-2,k=rec/8;
    cx.fillStyle='#fff2b0';
    cx.beginPath();
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2,rad=(i%2?5:12)*(.6+k);cx.lineTo(mx+Math.cos(a)*rad,Math.sin(a)*rad)}
    cx.closePath();cx.fill();
    cx.fillStyle='rgba(255,183,3,.7)';cx.beginPath();cx.arc(mx,0,7*(.5+k),0,Math.PI*2);cx.fill();
  }
  cx.restore();
  // turret ring + pilot, upright so the character always reads
  const tr=r*.55;
  cx.save();cx.translate(o.x,o.y);cx.scale(1+sq*.18,1-sq*.18);
  cx.fillStyle=c.dark;cx.beginPath();cx.arc(0,0,tr+3,0,Math.PI*2);cx.fill();
  cx.lineWidth=3.2;cx.strokeStyle=INK;cx.stroke();
  cx.save();
  cx.beginPath();cx.arc(0,0,tr,0,Math.PI*2);cx.clip();
  const cg=cx.createLinearGradient(0,-tr,0,tr);
  cg.addColorStop(0,'#cfe6ff');cg.addColorStop(1,'#8fb6d8');
  cx.fillStyle=cg;cx.fillRect(-tr,-tr,tr*2,tr*2);
  cx.translate(0,tr*.16);
  drawFace(PILOTS[c.skin]||PILOTS.brawler,tr*.9,(o.inv>0?'hurt':o.mood||''),
    Math.cos(o.tang==null?o.ang:o.tang),Math.sin(o.tang==null?o.ang:o.tang),(frame+(o.team||0)*77)%210<7);
  cx.restore();
  cx.beginPath();cx.arc(0,0,tr,0,Math.PI*2);cx.lineWidth=3.2;cx.strokeStyle=INK;cx.stroke();
  const ring=o.teamColor||(o.team!==undefined?TEAMS[o.team].color:null);
  if(ring){cx.lineWidth=2.6;cx.strokeStyle=ring;cx.beginPath();cx.arc(0,0,tr+4.5,0,Math.PI*2);cx.stroke()}
  cx.fillStyle='rgba(255,255,255,.4)';
  cx.beginPath();cx.ellipse(-tr*.4,-tr*.5,tr*.34,tr*.2,-.5,0,Math.PI*2);cx.fill();
  // aerial with a little waving pennant in the team colour
  if(ring){
    const ax=tr*.72,ay=-tr*.72,wob=Math.sin(frame*.16+(o.team||0)*3)*2.5;
    cx.strokeStyle=INK;cx.lineWidth=2;
    cx.beginPath();cx.moveTo(ax,ay);cx.lineTo(ax+4,ay-13);cx.stroke();
    cx.fillStyle=ring;cx.strokeStyle=INK;cx.lineWidth=1.8;
    cx.beginPath();cx.moveTo(ax+4,ay-13);cx.lineTo(ax+15+wob,ay-10);cx.lineTo(ax+4,ay-6);cx.closePath();
    cx.fill();cx.stroke();
  }
  cx.restore();
  if(fx){
    if(o.shield>0){
      cx.strokeStyle='rgba(90,170,230,.85)';cx.lineWidth=3.5;
      cx.beginPath();cx.arc(o.x,o.y,r+8+Math.sin(frame*.15)*1.5,0,Math.PI*2);cx.stroke();
      cx.fillStyle='rgba(120,200,255,.12)';cx.fill();
    }
    if(fx.star>0){cx.strokeStyle='hsl('+(frame*9%360)+' 90% 62%)';cx.lineWidth=4.5;
      cx.beginPath();cx.arc(o.x,o.y,r+6,0,Math.PI*2);cx.stroke()}
    if(fx.frozen>0){
      cx.fillStyle='rgba(140,205,240,.45)';rr(cx,o.x-r-2,o.y-r-2,r*2+4,r*2+4,9);cx.fill();
      cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=2.5;rr(cx,o.x-r-2,o.y-r-2,r*2+4,r*2+4,9);cx.stroke();
    }
    if(fx.reverse>0){
      cx.fillStyle='#ff8c42';cx.font='900 16px system-ui,Arial,sans-serif';
      cx.textAlign='center';cx.textBaseline='middle';
      cx.lineWidth=3;cx.strokeStyle=INK;
      cx.strokeText('?',o.x+r*.9,o.y-r-9);cx.fillText('?',o.x+r*.9,o.y-r-9);
    }
  }
  cx.globalAlpha=1;
}
function drawTank(t){
  if(t.hp<=0)return;
  if(tileAt(t.x,t.y)==='b'&&state==='play')return; // hidden in a bush
  if(t.inv>0&&(t.inv>>2)%2===0)return;
  drawTankBody(t);
}
function drawTeamTag(t){
  const y=t.y-t.cls.radius-22;
  cx.fillStyle=t.teamColor;rr(cx,t.x-17,y-9,34,18,7);cx.fill();
  cx.lineWidth=2.5;cx.strokeStyle=INK;rr(cx,t.x-17,y-9,34,18,7);cx.stroke();
  cx.fillStyle='#fff';cx.font='900 11px system-ui,Arial,sans-serif';cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText(t.tag,t.x,y+1);
}
function drawBullets(){
  for(const b of bullets){
    if(b.air){
      const prog=1-(b.life/b.life0),h=Math.sin(prog*Math.PI);
      cx.fillStyle='rgba(34,35,59,.25)';
      cx.beginPath();cx.ellipse(b.x,b.y,6*(1-h*.4),3,0,0,Math.PI*2);cx.fill();
      cx.fillStyle='#8a9a2f';cx.strokeStyle=INK;cx.lineWidth=2.5;
      cx.beginPath();cx.arc(b.x,b.y-h*26,b.r*(1+h*.5),0,Math.PI*2);cx.fill();cx.stroke();
      continue;
    }
    const g=GUNS[b.gun];
    if(g.trail&&(b.px||b.py)){
      cx.strokeStyle='rgba(255,255,255,.6)';cx.lineWidth=3;
      cx.beginPath();cx.moveTo(b.px,b.py);cx.lineTo(b.x,b.y);cx.stroke();
    }
    if(b.gun==='flame'){
      const f=b.life/13;
      cx.globalAlpha=.35+f*.5;
      cx.fillStyle=f>.6?'#ffd166':f>.3?'#ff8c42':'#d95d39';
      cx.beginPath();cx.arc(b.x,b.y,b.r+(1-f)*5,0,Math.PI*2);cx.fill();
      cx.globalAlpha=1;continue;
    }
    if(b.phase){
      cx.globalAlpha=.6+.3*Math.sin(frame*.3);
      cx.fillStyle='#cfe3ff';cx.strokeStyle='#8d99ae';cx.lineWidth=2.5;
      cx.beginPath();cx.arc(b.x,b.y,b.r,0,Math.PI*2);cx.fill();cx.stroke();
      cx.globalAlpha=1;continue;
    }
    const col=b.gun==='shell'?'#f4a259':b.gun==='ricochet'?(b.hot?'#ffffff':'#7ae0c3'):b.heavy?'#ff8c42':'#ffd166';
    cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.4;
    cx.fillStyle=col;cx.beginPath();cx.arc(b.x,b.y,b.r+5,0,Math.PI*2);cx.fill();
    cx.restore();
    if(b.px||b.py){cx.strokeStyle=col;cx.globalAlpha=.35;cx.lineWidth=b.r;cx.lineCap='round';
      cx.beginPath();cx.moveTo(b.px,b.py);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=1}
    cx.fillStyle=col;cx.strokeStyle=INK;cx.lineWidth=2.5;
    cx.beginPath();cx.arc(b.x,b.y,b.r,0,Math.PI*2);cx.fill();cx.stroke();
  }
}
function drawArenaFrame(){
  cx.drawImage(bg,0,0);
  drawMarks();
  drawDynamicTiles();
  drawCrates();
  drawMovers();
  drawMinesAndPickups();
  for(const bn of burns){
    const f=bn.life/90;
    cx.save();cx.globalCompositeOperation='lighter';
    cx.globalAlpha=.35*f+.1*Math.sin(frame*.4+bn.x);
    cx.fillStyle='#ff8c42';cx.beginPath();cx.arc(bn.x,bn.y,11+Math.sin(frame*.3+bn.y)*2,0,Math.PI*2);cx.fill();
    cx.globalAlpha=.5*f;cx.fillStyle='#ffd166';
    cx.beginPath();cx.arc(bn.x,bn.y-2,6+Math.sin(frame*.5+bn.x)*1.5,0,Math.PI*2);cx.fill();
    cx.restore();
  }
  for(const p of parts){
    if(p.color==='smoke'){
      cx.globalAlpha=Math.min(1,p.life/34)*.3;cx.fillStyle='#6b6f7d';
      cx.beginPath();cx.arc(p.x,p.y,p.size+(34-p.life)*.18,0,Math.PI*2);cx.fill();
    }else{
      cx.globalAlpha=Math.min(1,p.life/14);cx.fillStyle=p.color;
      cx.beginPath();cx.arc(p.x,p.y,p.size,0,Math.PI*2);cx.fill();
    }
  }
  cx.globalAlpha=1;
  cx.save();cx.globalCompositeOperation='lighter';
  for(const rg of rings){
    cx.globalAlpha=rg.life/22*.7;cx.strokeStyle=rg.color;cx.lineWidth=rg.w*(rg.life/22)+1;
    cx.beginPath();cx.arc(rg.x,rg.y,rg.r,0,Math.PI*2);cx.stroke();
  }
  cx.restore();cx.globalAlpha=1;
  drawBullets();
  for(const t of tanks){
    if(!(t.charge>0)||t.hp<=0)continue;
    const ta=(t.tang==null?t.ang:t.tang),g=GUNS[t.cls.gun];
    const lx=t.x+Math.cos(ta)*t.charge,ly=t.y+Math.sin(ta)*t.charge;
    cx.save();
    // dotted flight path that arcs like the shell will
    cx.setLineDash([4,9]);cx.lineDashOffset=-frame*.9;
    cx.strokeStyle=t.teamColor;cx.lineWidth=3.5;cx.globalAlpha=.9;
    cx.beginPath();
    const steps=14;
    for(let k=0;k<=steps;k++){
      const f=k/steps;
      const px=t.x+Math.cos(ta)*t.charge*f,py=t.y+Math.sin(ta)*t.charge*f-Math.sin(f*Math.PI)*34;
      k?cx.lineTo(px,py):cx.moveTo(px,py);
    }
    cx.stroke();cx.setLineDash([]);
    // landing zone: pulsing blast ring + crosshair
    const pulse=1+Math.sin(frame*.25)*.08;
    cx.globalAlpha=.22;cx.fillStyle=t.teamColor;
    cx.beginPath();cx.arc(lx,ly,g.aoe*pulse,0,Math.PI*2);cx.fill();
    cx.globalAlpha=.95;cx.lineWidth=3;cx.strokeStyle=t.teamColor;
    cx.beginPath();cx.arc(lx,ly,g.aoe*pulse,0,Math.PI*2);cx.stroke();
    cx.lineWidth=2.5;
    cx.beginPath();cx.moveTo(lx-9,ly);cx.lineTo(lx+9,ly);cx.moveTo(lx,ly-9);cx.lineTo(lx,ly+9);cx.stroke();
    cx.strokeStyle=INK;cx.globalAlpha=.5;cx.lineWidth=1.5;
    cx.beginPath();cx.arc(lx,ly,g.aoe*pulse+2,0,Math.PI*2);cx.stroke();
    cx.restore();
  }
  tanks.forEach(drawTank);
  for(const t of tanks){
    if(!(t.lock>14)||t.ai)continue;
    const e=tanks[1-t.team];
    if(!e||e.hp<=0)continue;
    const rr2=e.cls.radius+13,a0=frame*.06;
    cx.save();cx.globalAlpha=.5;cx.strokeStyle=t.teamColor;cx.lineWidth=3;cx.lineCap='round';
    for(let k=0;k<4;k++){cx.beginPath();cx.arc(e.x,e.y,rr2,a0+k*Math.PI/2,a0+k*Math.PI/2+.5);cx.stroke()}
    cx.restore();
  }
  drawBushes();
  drawAmbient();
  for(const f of floats){
    cx.globalAlpha=Math.min(1,f.life/20);
    cx.font='900 14px system-ui,Arial,sans-serif';cx.textAlign='center';cx.textBaseline='middle';
    cx.lineWidth=3;cx.strokeStyle=INK;cx.strokeText(f.txt,f.x,f.y);
    cx.fillStyle=f.color;cx.fillText(f.txt,f.x,f.y);
  }
  cx.globalAlpha=1;
}

/* ---------------- HUD ---------------- */
function hudPlate(t,left){
  const w=216,h=62,x=left?14:W-14-w,y=H-h-12;
  let near=false;
  for(const k of tanks){
    if(k.hp<=0)continue;
    if(k.x>x-70&&k.x<x+w+70&&k.y>y-60)near=true;
  }
  t.plateA=t.plateA==null?1:t.plateA+((near?.22:1)-t.plateA)*.15;
  cx.save();
  cx.globalAlpha=t.plateA;
  cx.fillStyle='rgba(34,35,59,.25)';rr(cx,x+4,y+5,w,h,12);cx.fill();
  cx.fillStyle=CREAM;rr(cx,x,y,w,h,12);cx.fill();
  cx.lineWidth=3.5;cx.strokeStyle=INK;rr(cx,x,y,w,h,12);cx.stroke();
  drawBadge(x+31,y+29,18,t.cls,t.teamColor,t.hp<=1?'hurt':'',0,0);
  cx.fillStyle=t.teamColor;rr(cx,x+17,y+40,28,15,6);cx.fill();
  cx.lineWidth=2;cx.strokeStyle=INK;rr(cx,x+17,y+40,28,15,6);cx.stroke();
  cx.fillStyle='#fff';cx.font='900 10px system-ui,Arial,sans-serif';cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText(t.tag,x+31,y+48);
  const bx=x+58,by=y+12,bw=146,bh=16,seg=bw/t.maxHp;
  cx.fillStyle='#d8cbb4';rr(cx,bx,by,bw,bh,6);cx.fill();
  for(let i=0;i<t.hp;i++){cx.fillStyle=t.cls.color;rr(cx,bx+i*seg+1.5,by+1.5,seg-3,bh-3,4);cx.fill()}
  cx.lineWidth=2.5;cx.strokeStyle=INK;rr(cx,bx,by,bw,bh,6);cx.stroke();
  cx.fillStyle=INK;cx.font='800 11px system-ui,Arial,sans-serif';cx.textAlign='left';cx.textBaseline='middle';
  cx.fillText((t.name||t.tag).slice(0,12),bx,y+6);
  const goal=mode==='campaign'?1:WIN_SCORE;
  cx.font='15px system-ui,Arial,sans-serif';cx.textAlign='left';
  let stars='';for(let i=0;i<goal;i++)stars+=i<t.score?'★':'☆';
  cx.fillStyle='#e7a600';cx.fillText(stars,bx,by+33);
  cx.fillStyle=INK;cx.font='800 11px system-ui,Arial,sans-serif';cx.textAlign='right';
  cx.fillText(t.cls.name,bx+bw,by+33);
  // active effect chips above the plate
  let cxr=left?x+8:x+w-8-16,step=left?20:-20,drawn=0;
  const chips=[];
  for(const p of POWERS){
    if(p.id==='heal'||p.id==='freeze'||p.id==='flip')continue;
    if(p.id==='shield'){if(t.shield>0)chips.push(p)}
    else if(p.id==='mine'){if(t.minesToLay>0)chips.push(p)}
    else if(t.fx&&t.fx[p.id]>0)chips.push(p);
  }
  if(t.fx&&t.fx.frozen>0)chips.push(POWERS.find(p=>p.id==='freeze'));
  if(t.fx&&t.fx.reverse>0)chips.push(POWERS.find(p=>p.id==='flip'));
  for(const p of chips){
    const chx=cxr+step*drawn,chy=y-14;drawn++;
    cx.fillStyle=CREAM;cx.beginPath();cx.arc(chx+8,chy,9,0,Math.PI*2);cx.fill();
    cx.lineWidth=2;cx.strokeStyle=p.color;cx.stroke();
    cx.fillStyle=p.color;cx.font='900 10px system-ui,Arial,sans-serif';cx.textAlign='center';
    cx.fillText(p.glyph,chx+8,chy+1);
  }
  // the item slot sits beside the plate and spins like a kart item box
  cx.globalAlpha=1;
  const spin=t.roul,landed=t.lastRoll&&t.lastRoll.ttl>0;
  if(spin||landed){
    const sw=54,sx=left?x+w+10:x-10-sw,sy=y+h-sw;
    const pop=landed?1+Math.max(0,(t.lastRoll.ttl-92)/18)*.35:1;
    cx.save();cx.translate(sx+sw/2,sy+sw/2);cx.scale(pop,pop);
    cx.fillStyle='rgba(12,14,26,.4)';rr(cx,-sw/2+4,-sw/2+5,sw,sw,12);cx.fill();
    const gg=cx.createLinearGradient(0,-sw/2,0,sw/2);
    gg.addColorStop(0,'#fffaf0');gg.addColorStop(1,'#efe2c8');
    cx.fillStyle=gg;rr(cx,-sw/2,-sw/2,sw,sw,12);cx.fill();
    cx.strokeStyle=INK;cx.lineWidth=3.5;rr(cx,-sw/2,-sw/2,sw,sw,12);cx.stroke();
    cx.save();cx.beginPath();rr(cx,-sw/2+5,-sw/2+5,sw-10,sw-10,8);cx.clip();
    if(spin){
      const ph=(spin.n%6)/6;
      for(let k=-1;k<=1;k++){
        const p=POWERS[(spin.idx+k+POWERS.length)%POWERS.length];
        cx.fillStyle=p.color;cx.font='900 22px system-ui,Arial,sans-serif';
        cx.textAlign='center';cx.textBaseline='middle';cx.fillText(p.glyph,0,(k+ph)*30);
      }
    }else{
      const p=t.lastRoll.def;
      cx.fillStyle=p.color;cx.font='900 26px system-ui,Arial,sans-serif';
      cx.textAlign='center';cx.textBaseline='middle';cx.fillText(p.glyph,0,0);
    }
    cx.restore();
    if(landed){
      cx.lineWidth=3;cx.strokeStyle=t.lastRoll.def.color;
      rr(cx,-sw/2+3,-sw/2+3,sw-6,sw-6,10);cx.stroke();
      cx.fillStyle=INK;cx.font='800 9px system-ui,Arial,sans-serif';cx.textAlign='center';
      cx.fillText(t.lastRoll.def.label,0,sw/2+10);
    }
    cx.restore();
  }
  cx.restore();
}

