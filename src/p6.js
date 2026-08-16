/* ---------------- tank drawing ---------------- */
function drawTankBody(o){
  const c=o.cls,r=c.radius,rec=Math.max(0,o.recoil||0),fx=o.fx;
  const ghost=fx&&fx.ghost>0;
  if(ghost)cx.globalAlpha=.45;
  // ground shadow
  cx.fillStyle='rgba(20,22,40,.26)';
  cx.beginPath();cx.ellipse(o.x+3,o.y+6,r*1.2,r*.98,0,0,Math.PI*2);cx.fill();
  const sq=o.squash||0;
  cx.save();cx.translate(o.x,o.y);
  cx.scale(1+sq*.22,1-sq*.22);
  cx.rotate(o.ang);
  cx.lineWidth=3.4;cx.strokeStyle=INK;cx.lineJoin='round';
  // treads with rolling notches
  const ph=((o.dist||0)*.9)%7;
  for(const side of [-1,1]){
    const ty=side<0?-r*1.18:r*.56;
    const tg=cx.createLinearGradient(0,ty,0,ty+r*.62);
    tg.addColorStop(0,c.dark);tg.addColorStop(1,'rgba(20,22,40,.85)');
    cx.fillStyle=tg;rr(cx,-r*1.06,ty,r*2.12,r*.62,5);cx.fill();cx.stroke();
    cx.save();cx.beginPath();rr(cx,-r*1.06,ty,r*2.12,r*.62,5);cx.clip();
    cx.strokeStyle='rgba(255,255,255,.22)';cx.lineWidth=2.4;
    for(let n=-r*1.2;n<r*1.2;n+=7){cx.beginPath();cx.moveTo(n+ph,ty);cx.lineTo(n+ph,ty+r*.62);cx.stroke()}
    cx.restore();
    cx.strokeStyle=INK;cx.lineWidth=3.4;
  }
  // hull with a rounded gradient and a gloss band
  const hg=cx.createLinearGradient(0,-r,0,r);
  hg.addColorStop(0,c.light||c.color);hg.addColorStop(.55,c.color);hg.addColorStop(1,c.dark);
  cx.fillStyle=hg;rr(cx,-r,-r*.78,r*2,r*1.56,r*.42);cx.fill();cx.stroke();
  cx.fillStyle='rgba(255,255,255,.28)';rr(cx,-r*.82,-r*.62,r*1.64,r*.44,r*.2);cx.fill();
  cx.fillStyle='rgba(20,22,40,.16)';rr(cx,-r*.82,r*.2,r*1.64,r*.36,r*.16);cx.fill();
  cx.fillStyle=c.dark;rr(cx,-r-4,-4.5,6,9,2.5);cx.fill();cx.stroke(); // exhaust
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
  const tr=r*.72;
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
    Math.cos(o.ang),Math.sin(o.ang),(frame+(o.team||0)*77)%210<7);
  cx.restore();
  cx.beginPath();cx.arc(0,0,tr,0,Math.PI*2);cx.lineWidth=3.2;cx.strokeStyle=INK;cx.stroke();
  const ring=o.teamColor||(o.team!==undefined?TEAMS[o.team].color:null);
  if(ring){cx.lineWidth=2.6;cx.strokeStyle=ring;cx.beginPath();cx.arc(0,0,tr+4.5,0,Math.PI*2);cx.stroke()}
  cx.fillStyle='rgba(255,255,255,.4)';
  cx.beginPath();cx.ellipse(-tr*.4,-tr*.5,tr*.34,tr*.2,-.5,0,Math.PI*2);cx.fill();
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
    cx.fillStyle=b.gun==='shell'?'#f4a259':b.gun==='ricochet'?'#7ae0c3':'#ffd166';
    cx.strokeStyle=INK;cx.lineWidth=2.5;
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
  for(const p of parts){cx.globalAlpha=Math.min(1,p.life/14);cx.fillStyle=p.color;cx.beginPath();cx.arc(p.x,p.y,p.size,0,Math.PI*2);cx.fill()}
  cx.globalAlpha=1;
  drawBullets();
  tanks.forEach(drawTank);
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
  cx.save();
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
  cx.restore();
}

