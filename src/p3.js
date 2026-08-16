/* ---------------- state ---------------- */
let tanks=[],bullets=[],parts=[],mines=[],pickups=[],floats=[],marks=[],amb=[],conf=[];
let shake=0,hitstop=0,frame=0;
let state='title',timer=0,mapIndex=0,roundWinner=null;
let cells=null,crateHp=null,movers=[],portals={},readyPinged=false,goPinged=false;
let ko={x:480,y:300},pickupClock=0,flash=0,campCls=1;
const ROUND_TIME=99*60,HURRY=15*60;let roundClock=ROUND_TIME,sudden=false;
const sel=[{i:1,locked:false},{i:3,locked:false}];let selTimer=0;
/* modes: 'duel' (solo vs bot) 'campaign' 'coop' 'online' */
let mode='coop',aiLevel=1,humans=[true,true],campStage=0,campResult='';
let menuIdx=0,subIdx=0,profIdx=0,profTeam=0,profField=0,nameTarget=0;
let toast=null,matchDone=false;
/* set by the online build; null offline */
let onLockIn=null,netBlockStart=null;
const MODES=[
  {id:'duel',    title:'SINGLEPLAYER',sub:'QUICK DUEL VS BOT',hint:'ONE HUMAN · PICK A DIFFICULTY'},
  {id:'campaign',title:'CAMPAIGN',    sub:'16 STAGES, RISING DIFFICULTY',hint:'BEAT EVERY ARENA TO UNLOCK TANKS'},
  {id:'coop',    title:'CO-OP 1V1',   sub:'TWO PLAYERS, ONE KEYBOARD',hint:'WASD VS ARROW KEYS'},
  {id:'online',  title:'ONLINE',      sub:'PLAY OVER THE INTERNET',hint:'NEEDS THE SELF-HOSTED BUILD'},
  {id:'profiles',title:'PROFILES',    sub:'NAMES, COLOURS, STATS, UNLOCKS',hint:'SAVED IN THIS BROWSER'},
];
const bg=document.createElement('canvas');bg.width=W;bg.height=H;const bgx=bg.getContext('2d');

/* ---------------- helpers ---------------- */
function shade(hex,amt){
  const n=parseInt(hex.slice(1),16);
  const f=c=>Math.max(0,Math.min(255,Math.round(c+(amt<0?c:255-c)*amt)));
  return 'rgb('+f(n>>16&255)+','+f(n>>8&255)+','+f(n&255)+')';
}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
/* ---------------- pilot faces (drawn, no bitmaps) ---------------- */
function drawFace(p,r,mood,lookX,lookY,blink){
  const S=r/22; // art is authored at r=22 then scaled
  cx.save();cx.scale(S,S);
  // head
  cx.fillStyle=p.skin;cx.beginPath();cx.arc(0,1,17,0,Math.PI*2);cx.fill();
  cx.lineWidth=3.2;cx.strokeStyle=INK;cx.stroke();
  // hair peeking under the gear
  cx.fillStyle=p.hair;
  cx.beginPath();cx.arc(0,-2,16.5,Math.PI*1.06,Math.PI*1.94);cx.fill();
  const lx=(lookX||0)*2.4,ly=(lookY||0)*2;
  // eyes
  const eye=(ex)=>{
    if(blink){cx.strokeStyle=INK;cx.lineWidth=2.6;cx.beginPath();
      cx.moveTo(ex-4,3);cx.lineTo(ex+4,3);cx.stroke();return}
    if(p.eyes==='glow'){
      cx.fillStyle='#9ff6ff';cx.beginPath();cx.ellipse(ex,3,4.2,3.4,0,0,Math.PI*2);cx.fill();
      cx.fillStyle='#2ec4b6';cx.beginPath();cx.arc(ex+lx*.5,3+ly*.5,2,0,Math.PI*2);cx.fill();return;
    }
    cx.fillStyle='#fff';
    const w=p.eyes==='wide'?5:p.eyes==='squint'?4.4:4.6;
    const h=p.eyes==='squint'?2.6:p.eyes==='wide'?5:4.2;
    cx.beginPath();cx.ellipse(ex,3,w,h,0,0,Math.PI*2);cx.fill();
    cx.lineWidth=2.2;cx.strokeStyle=INK;cx.stroke();
    cx.fillStyle=INK;cx.beginPath();cx.arc(ex+lx,3+ly,p.eyes==='sharp'?1.9:2.4,0,Math.PI*2);cx.fill();
  };
  eye(-6.5);eye(6.5);
  // brows show the mood
  cx.strokeStyle=INK;cx.lineWidth=2.4;cx.lineCap='round';
  if(mood==='hurt'){
    cx.beginPath();cx.moveTo(-10,-3);cx.lineTo(-3,-1);cx.moveTo(10,-3);cx.lineTo(3,-1);cx.stroke();
  }else if(mood==='win'||p.mouth==='grin'){
    cx.beginPath();cx.moveTo(-10,-3);cx.lineTo(-3,-4.5);cx.moveTo(10,-3);cx.lineTo(3,-4.5);cx.stroke();
  }else{
    cx.beginPath();cx.moveTo(-10,-3.5);cx.lineTo(-3,-2.5);cx.moveTo(10,-3.5);cx.lineTo(3,-2.5);cx.stroke();
  }
  // mouth
  cx.lineWidth=2.4;
  if(mood==='hurt'){cx.beginPath();cx.ellipse(0,11,3.6,3,0,0,Math.PI*2);cx.fillStyle=INK;cx.fill()}
  else if(mood==='win'||p.mouth==='grin'){
    cx.fillStyle=INK;cx.beginPath();cx.arc(0,9,5.2,.1,Math.PI-.1);cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.rect(-3.4,9.2,6.8,1.8);cx.fill();
  }
  else if(p.mouth==='fangs'){
    cx.fillStyle=INK;cx.beginPath();cx.arc(0,9,4.6,.1,Math.PI-.1);cx.fill();
    cx.fillStyle='#fff';
    cx.beginPath();cx.moveTo(-2.6,9.4);cx.lineTo(-.6,12.4);cx.lineTo(-.2,9.4);cx.closePath();cx.fill();
    cx.beginPath();cx.moveTo(2.6,9.4);cx.lineTo(.8,12.4);cx.lineTo(.4,9.4);cx.closePath();cx.fill();
  }
  else if(p.mouth==='smirk'){cx.beginPath();cx.moveTo(-3.5,10);cx.quadraticCurveTo(1,13,5,9.5);cx.stroke()}
  else if(p.mouth==='flat'){cx.beginPath();cx.moveTo(-3.5,10.5);cx.lineTo(3.5,10.5);cx.stroke()}
  // headgear on top
  cx.lineWidth=3;
  if(p.gear==='cap'){
    cx.fillStyle=p.gearA;cx.beginPath();cx.arc(0,-4,16,Math.PI,0);cx.fill();cx.stroke();
    cx.fillStyle=p.gearB;rr(cx,-19,-6,22,6,3);cx.fill();cx.stroke();
  }else if(p.gear==='helmet'){
    cx.fillStyle=p.gearA;cx.beginPath();cx.arc(0,-2,17.5,Math.PI*1.02,Math.PI*1.98);cx.fill();cx.stroke();
    cx.fillStyle=p.gearB;rr(cx,-18,-5,36,5,2.5);cx.fill();cx.stroke();
  }else if(p.gear==='goggles'){
    cx.fillStyle=p.gearB;rr(cx,-18,-10,36,7,3);cx.fill();cx.stroke();
    cx.fillStyle=p.gearA;cx.beginPath();cx.arc(-8,-7,6,0,Math.PI*2);cx.arc(8,-7,6,0,Math.PI*2);cx.fill();cx.stroke();
    cx.fillStyle='rgba(255,255,255,.55)';cx.beginPath();cx.arc(-10,-9,2.2,0,Math.PI*2);cx.arc(6,-9,2.2,0,Math.PI*2);cx.fill();
  }else if(p.gear==='visor'){
    cx.fillStyle=p.gearA;cx.beginPath();cx.arc(0,-3,16.5,Math.PI*1.05,Math.PI*1.95);cx.fill();cx.stroke();
    cx.fillStyle='rgba(120,220,255,.75)';rr(cx,-15,-6,30,7,3.5);cx.fill();cx.lineWidth=2.4;cx.stroke();
  }else if(p.gear==='bandana'){
    cx.fillStyle=p.gearA;rr(cx,-17,-10,34,8,3);cx.fill();cx.stroke();
    cx.fillStyle=p.gearB;cx.beginPath();cx.moveTo(14,-8);cx.lineTo(24,-2);cx.lineTo(15,-1);cx.closePath();cx.fill();cx.stroke();
  }else if(p.gear==='headset'){
    cx.strokeStyle=p.gearB;cx.lineWidth=4;cx.beginPath();cx.arc(0,0,18,Math.PI*1.15,Math.PI*1.85);cx.stroke();
    cx.fillStyle=p.gearA;cx.strokeStyle=INK;cx.lineWidth=2.8;
    rr(cx,-21,-3,7,11,3);cx.fill();cx.stroke();rr(cx,14,-3,7,11,3);cx.fill();cx.stroke();
  }else if(p.gear==='hood'){
    cx.fillStyle=p.gearA;
    cx.beginPath();cx.arc(0,0,19,Math.PI*.92,Math.PI*2.08);cx.fill();cx.stroke();
    cx.fillStyle='rgba(34,35,59,.25)';cx.beginPath();cx.arc(0,-1,16,Math.PI,0);cx.fill();
  }
  cx.restore();
}
/* the round badge used on HUD plates, cards and the winner screen */
function drawBadge(x,y,r,cls,ringColor,mood,lookX,lookY){
  const p=PILOTS[cls.skin]||PILOTS.brawler;
  cx.save();
  cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);cx.clip();
  const g=cx.createLinearGradient(x,y-r,x,y+r);
  g.addColorStop(0,cls.color);g.addColorStop(1,cls.dark);
  cx.fillStyle=g;cx.fillRect(x-r,y-r,r*2,r*2);
  cx.fillStyle='rgba(255,255,255,.18)';cx.beginPath();cx.arc(x,y-r*.5,r*.9,0,Math.PI*2);cx.fill();
  cx.translate(x,y+r*.14);
  drawFace(p,r*.86,mood,lookX,lookY,(frame%210)<7);
  cx.restore();
  cx.beginPath();cx.arc(x,y,r,0,Math.PI*2);
  cx.lineWidth=ringColor?r*.22:3;cx.strokeStyle=INK;cx.stroke();
  if(ringColor){cx.lineWidth=r*.13;cx.strokeStyle=ringColor;cx.stroke()}
}
function splash(text,size,y,rot,fill){
  cx.save();cx.translate(W/2,y);cx.rotate(rot===undefined?-.035:rot);
  cx.font='italic 900 '+size+'px system-ui,Segoe UI,Arial,sans-serif';
  cx.textAlign='center';cx.textBaseline='middle';
  cx.lineWidth=size/8;cx.lineJoin='round';cx.strokeStyle=INK;
  cx.strokeText(text,0,0);cx.fillStyle=fill||'#fff';cx.fillText(text,0,0);
  cx.restore();
}
function lerpAngle(a,b,k){let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return a+d*k}
function burst(x,y,color,n,pow){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=(Math.random()*.7+.3)*pow;
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:20+Math.random()*22,color,size:3+Math.random()*4});}
}
function addFloat(x,y,txt,color){floats.push({x,y,txt,color,life:60})}

/* ---------------- movers ---------------- */
function moverOff(mv,f){
  const t=(f+(mv.phase||0))/mv.period*Math.PI*2;
  return (1-Math.cos(t))/2*mv.range*T;
}
function moverRect(mv){
  const off=moverOff(mv,frame);
  return {x:mv.gx*T+(mv.axis==='h'?off:0),y:mv.gy*T+(mv.axis==='v'?off:0),w:T,h:T,
    vx:mv.axis==='h'?off-moverOff(mv,frame-1):0,vy:mv.axis==='v'?off-moverOff(mv,frame-1):0};
}
function circleVsRect(x,y,r,rc){
  const nx=Math.max(rc.x,Math.min(x,rc.x+rc.w)),ny=Math.max(rc.y,Math.min(y,rc.y+rc.h));
  return (x-nx)*(x-nx)+(y-ny)*(y-ny)<r*r;
}

/* ---------------- grid collision ---------------- */
const GATES={R:[1,0],L:[-1,0],D:[0,1],U:[0,-1]};
function cellSolid(c,mode,dx,dy,ghost){
  if(c==='#')return !ghost;
  if(c==='x')return mode==='tank'?!ghost:true;
  if(c==='~')return mode==='tank'&&!ghost;
  if(GATES[c]){
    // one-way only along the arrow's own axis: crossing sideways is always fine,
    // otherwise a tank beside a gate can end up with no legal move at all
    const g=GATES[c];
    if(g[0])return g[0]>0?dx<-0.01:dx>0.01;
    return g[1]>0?dy<-0.01:dy>0.01;
  }
  return false;
}
function hitCell(x,y,r,mode,dx,dy,ghost){
  const x0=Math.max(0,(x-r)/T|0),x1=Math.min(COLS-1,(x+r)/T|0);
  const y0=Math.max(0,(y-r)/T|0),y1=Math.min(ROWS-1,(y+r)/T|0);
  for(let gy=y0;gy<=y1;gy++)for(let gx=x0;gx<=x1;gx++){
    const border=gx===0||gx===COLS-1||gy===0||gy===ROWS-1;
    const c=cells[gy][gx];
    if(!cellSolid(c,mode,dx||0,dy||0,ghost&&!border))continue;
    const rx=gx*T,ry=gy*T;
    const nx=Math.max(rx,Math.min(x,rx+T)),ny=Math.max(ry,Math.min(y,ry+T));
    if((x-nx)*(x-nx)+(y-ny)*(y-ny)<r*r)return{c,gx,gy};
  }
  return null;
}
function moverHit(x,y,r){
  for(const mv of movers){if(circleVsRect(x,y,r,moverRect(mv)))return mv}
  return null;
}
function tryMove(t,dx,dy){
  const gh=t.fx&&t.fx.ghost>0,r=t.cls.radius;
  if(dx&&!hitCell(t.x+dx,t.y,r,'tank',dx,0,gh)&&!moverHit(t.x+dx,t.y,r))t.x+=dx;
  if(dy&&!hitCell(t.x,t.y+dy,r,'tank',0,dy,gh)&&!moverHit(t.x,t.y+dy,r))t.y+=dy;
}
function tileAt(x,y){
  const gx=Math.max(0,Math.min(COLS-1,x/T|0)),gy=Math.max(0,Math.min(ROWS-1,y/T|0));
  return cells[gy][gx];
}
function nearestFree(x,y){
  for(let rad=0;rad<8;rad++)for(let gy=1;gy<ROWS-1;gy++)for(let gx=1;gx<COLS-1;gx++){
    if(Math.abs(gx-(x/T|0))+Math.abs(gy-(y/T|0))!==rad)continue;
    if(cells[gy][gx]==='.'||cells[gy][gx]==='*'||cells[gy][gx]==='b')return{x:gx*T+T/2,y:gy*T+T/2};
  }
  return{x,y};
}

/* ---------------- arena prerender ---------------- */
function prerenderArena(m,mi){
  bgx.clearRect(0,0,W,H);
  for(let gy=0;gy<ROWS;gy++)for(let gx=0;gx<COLS;gx++){
    bgx.fillStyle=((gx+gy)&1)?m.floorA:m.floorB;
    bgx.fillRect(gx*T,gy*T,T,T);
  }
  let s=mi*137+11;const rnd=()=>(s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff;
  for(let gy=1;gy<ROWS-1;gy++)for(let gx=1;gx<COLS-1;gx++){
    const c=m.grid[gy][gx];
    if(c==='.'&&rnd()<.09)drawDecal(bgx,m.decal,gx*T+8+rnd()*(T-16),gy*T+8+rnd()*(T-16),rnd);
    else if(c==='*')drawIceTile(bgx,gx,gy,rnd);
    else if(GATES[c])drawGate(bgx,gx,gy,c,m);
  }
  for(let gy=0;gy<ROWS;gy++)for(let gx=0;gx<COLS;gx++){
    if(m.grid[gy][gx]!=='~')continue;
    bgx.fillStyle=m.liqA;bgx.fillRect(gx*T,gy*T,T,T);
  }
  bgx.strokeStyle=INK;bgx.lineWidth=2.5;
  for(let gy=0;gy<ROWS;gy++)for(let gx=0;gx<COLS;gx++){
    if(m.grid[gy][gx]!=='~')continue;
    const x=gx*T,y=gy*T,at=(a,b)=>m.grid[b]&&(m.grid[b][a]==='~'||m.grid[b][a]==='#');
    bgx.beginPath();
    if(!at(gx,gy-1)){bgx.moveTo(x,y+1);bgx.lineTo(x+T,y+1)}
    if(!at(gx,gy+1)){bgx.moveTo(x,y+T-1);bgx.lineTo(x+T,y+T-1)}
    if(!at(gx-1,gy)){bgx.moveTo(x+1,y);bgx.lineTo(x+1,y+T)}
    if(!at(gx+1,gy)){bgx.moveTo(x+T-1,y);bgx.lineTo(x+T-1,y+T)}
    bgx.stroke();
  }
  // blocks: cast shadow, body gradient, lit top face, ink outline
  for(let gy=0;gy<ROWS;gy++)for(let gx=0;gx<COLS;gx++){
    if(m.grid[gy][gx]!=='#')continue;
    bgx.fillStyle='rgba(20,22,40,.30)';rr(bgx,gx*T+5,gy*T+7,T-4,T-4,9);bgx.fill();
  }
  for(let gy=0;gy<ROWS;gy++)for(let gx=0;gx<COLS;gx++){
    if(m.grid[gy][gx]!=='#')continue;
    const x=gx*T,y=gy*T;
    const bg2=bgx.createLinearGradient(x,y,x,y+T);
    bg2.addColorStop(0,m.blockTop);bg2.addColorStop(.42,m.block);bg2.addColorStop(1,shade(m.block,-.22));
    bgx.fillStyle=bg2;rr(bgx,x+1.5,y+1.5,T-3,T-3,8);bgx.fill();
    bgx.fillStyle='rgba(255,255,255,.30)';rr(bgx,x+5,y+4.5,T-10,9,4.5);bgx.fill();
    bgx.fillStyle='rgba(20,22,40,.18)';rr(bgx,x+5,y+T-13,T-10,7,3.5);bgx.fill();
    bgx.strokeStyle=INK;bgx.lineWidth=3.2;rr(bgx,x+1.5,y+1.5,T-3,T-3,8);bgx.stroke();
  }
  const g=bgx.createRadialGradient(W/2,H/2,H*.40,W/2,H/2,H*1.0);
  g.addColorStop(0,'rgba(34,35,59,0)');g.addColorStop(1,'rgba(20,22,40,.34)');
  bgx.fillStyle=g;bgx.fillRect(0,0,W,H);
}
function drawIceTile(c,gx,gy,rnd){
  const x=gx*T,y=gy*T;
  c.fillStyle='#e6f6fd';c.fillRect(x,y,T,T);
  c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=2;
  c.beginPath();c.moveTo(x+6+rnd()*6,y+28);c.lineTo(x+20+rnd()*8,y+10);c.stroke();
  c.strokeStyle='rgba(140,190,220,.4)';
  c.beginPath();c.moveTo(x+18,y+34);c.lineTo(x+32,y+20);c.stroke();
}
function drawGate(c,gx,gy,ch,m){
  const x=gx*T,y=gy*T,g=GATES[ch];
  c.fillStyle='rgba(255,244,224,.85)';rr(c,x+3,y+3,T-6,T-6,8);c.fill();
  c.strokeStyle=INK;c.lineWidth=2.5;rr(c,x+3,y+3,T-6,T-6,8);c.stroke();
  c.save();c.translate(x+T/2,y+T/2);c.rotate(Math.atan2(g[1],g[0]));
  c.fillStyle='#e7a600';c.strokeStyle=INK;c.lineWidth=2;
  c.beginPath();c.moveTo(10,0);c.lineTo(-4,-9);c.lineTo(-4,9);c.closePath();c.fill();c.stroke();
  c.restore();
}
function drawDecal(c,kind,x,y,rnd){
  if(kind==='flowers'||kind==='blooms'){
    if(rnd()<.45){ // grass tuft
      c.strokeStyle='rgba(30,90,30,.35)';c.lineWidth=2;c.lineCap='round';
      for(let i=-1;i<2;i++){c.beginPath();c.moveTo(x+i*3,y+4);c.quadraticCurveTo(x+i*3+2,y-1,x+i*4,y-5);c.stroke()}
      return;
    }
    const col=kind==='blooms'&&rnd()<.5?'#f7a8c4':'#fff';
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;c.fillStyle=col;c.beginPath();c.arc(x+Math.cos(a)*3.4,y+Math.sin(a)*3.4,2.3,0,Math.PI*2);c.fill()}
    c.fillStyle='#ffd166';c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fill();
  }else if(kind==='pebbles'||kind==='shells'){
    c.fillStyle=kind==='shells'?'#fdf4dd':'#d8b56b';
    c.beginPath();c.ellipse(x,y,4,2.8,rnd()*3,0,Math.PI*2);c.fill();
    c.fillStyle=kind==='shells'?'#e8d8b0':'#cfa95e';
    c.beginPath();c.ellipse(x+5,y+3,2.6,1.9,rnd()*3,0,Math.PI*2);c.fill();
  }else if(kind==='snow'){
    c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1.8;
    c.beginPath();c.moveTo(x-3.5,y);c.lineTo(x+3.5,y);c.moveTo(x,y-3.5);c.lineTo(x,y+3.5);c.stroke();
  }else if(kind==='embers'){
    if(rnd()<.5){c.fillStyle='rgba(255,140,66,.55)';c.beginPath();c.arc(x,y,2.6,0,Math.PI*2);c.fill()}
    else{c.strokeStyle='#4a495a';c.lineWidth=1.8;c.beginPath();c.moveTo(x-4,y-2);c.lineTo(x,y+1);c.lineTo(x+4,y-1);c.stroke()}
  }else if(kind==='bolts'){
    c.fillStyle='rgba(255,255,255,.14)';c.beginPath();c.arc(x,y,2.4,0,Math.PI*2);c.fill();
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.4;c.beginPath();c.arc(x,y,2.4,0,Math.PI*2);c.stroke();
  }
}
