/* ================= TANK ART =================
   Every class has its own chassis routine. They share only the lighting model:
   a shadow cast down-right, a body lit from the top-left, a gloss band, and a
   raised turret that sits above the hull with its own contact shadow. */
const BODY_H=7;                 // how far the hull sits "above" the ground

function lit(c,x0,y0,x1,y1,col){
  const g=c.createLinearGradient(x0,y0,x1,y1);
  g.addColorStop(0,shade(col,.42));g.addColorStop(.45,col);g.addColorStop(1,shade(col,-.20));
  return g;
}
function tread(c,x,y,w,h,dark,roll){
  c.fillStyle=shade(dark,-.35);rr(c,x,y,w,h,h*.42);c.fill();
  c.strokeStyle=INK;c.lineWidth=3;rr(c,x,y,w,h,h*.42);c.stroke();
  c.save();c.beginPath();rr(c,x,y,w,h,h*.42);c.clip();
  c.strokeStyle='rgba(255,255,255,.20)';c.lineWidth=2.4;
  for(let n=-w;n<w*2;n+=7){c.beginPath();c.moveTo(x+((n+roll)%(w+7)),y);c.lineTo(x+((n+roll)%(w+7)),y+h);c.stroke()}
  c.restore();
}
function wheel(c,x,y,r,dark,roll){
  c.fillStyle=shade(dark,-.4);c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  c.lineWidth=2.6;c.strokeStyle=INK;c.stroke();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;
  c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(roll)*r*.7,y+Math.sin(roll)*r*.7);c.stroke();
}
function plate(c,pts,col,strokeW){
  c.beginPath();
  pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
  c.closePath();c.fillStyle=col;c.fill();
  c.lineWidth=strokeW||3.2;c.strokeStyle=INK;c.stroke();
}
/* ---- the twelve chassis ---- */
function drawChassis(o,c,r,roll){
  const kind=c.chassis,col=c.color,dk=c.dark;
  const body=lit(cx,-r,-r,r,r,col);
  if(kind==='wedge'){                       // RAZOR: arrowhead speedster
    tread(cx,-r*.95,-r*1.2,r*1.9,r*.5,dk,roll);
    tread(cx,-r*.95, r*.7, r*1.9,r*.5,dk,roll);
    plate(cx,[[r*1.4,0],[r*.2,-r*.85],[-r*.95,-r*.7],[-r*.95,r*.7],[r*.2,r*.85]],body);
    plate(cx,[[r*.9,0],[r*.15,-r*.42],[-r*.5,-r*.34],[-r*.5,r*.34],[r*.15,r*.42]],'rgba(255,255,255,.25)',0);
  }else if(kind==='hover'){                 // HORNET: no tracks, thruster skirt
    cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.35+.15*Math.sin(frame*.25);
    cx.fillStyle=c.light;cx.beginPath();cx.ellipse(0,0,r*1.5,r*1.15,0,0,Math.PI*2);cx.fill();cx.restore();
    cx.fillStyle=shade(dk,-.2);cx.beginPath();cx.ellipse(0,0,r*1.18,r*.95,0,0,Math.PI*2);cx.fill();
    cx.lineWidth=3.2;cx.strokeStyle=INK;cx.stroke();
    cx.fillStyle=body;cx.beginPath();cx.ellipse(0,-2,r*.95,r*.72,0,0,Math.PI*2);cx.fill();cx.stroke();
    cx.fillStyle='rgba(255,255,255,.3)';cx.beginPath();cx.ellipse(-r*.2,-r*.35,r*.5,r*.22,-.3,0,Math.PI*2);cx.fill();
  }else if(kind==='sixwheel'){              // VIPER: six fat wheels
    for(const sx of [-r*.72,0,r*.72])for(const sy of [-1,1])
      wheel(cx,sx,sy*r*.92,r*.34,dk,roll*.5+sx);
    plate(cx,[[r*1.1,-r*.5],[r*1.1,r*.5],[-r*1.0,r*.66],[-r*1.0,-r*.66]],body);
    cx.fillStyle='rgba(255,255,255,.24)';rr(cx,-r*.8,-r*.42,r*1.7,r*.34,4);cx.fill();
  }else if(kind==='phantom'){               // SPECTRE: floating, translucent
    cx.globalAlpha*=.86;
    cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.25;
    cx.fillStyle=c.light;cx.beginPath();cx.ellipse(0,0,r*1.3,r*1.05,0,0,Math.PI*2);cx.fill();cx.restore();
    plate(cx,[[r*1.15,0],[r*.3,-r*.8],[-r*.85,-r*.55],[-r*1.05,0],[-r*.85,r*.55],[r*.3,r*.8]],body);
    cx.strokeStyle='rgba(255,255,255,.5)';cx.lineWidth=2;
    for(let i=-1;i<=1;i++){cx.beginPath();cx.moveTo(-r*.6,i*r*.3);cx.lineTo(r*.5,i*r*.3);cx.stroke()}
  }else if(kind==='boxtank'){               // BULWARK: classic angled armour
    tread(cx,-r*1.02,-r*1.24,r*2.04,r*.56,dk,roll);
    tread(cx,-r*1.02, r*.68, r*2.04,r*.56,dk,roll);
    plate(cx,[[r*1.05,-r*.45],[r*1.05,r*.45],[r*.55,r*.8],[-r*.95,r*.8],[-r*.95,-r*.8],[r*.55,-r*.8]],body);
    cx.fillStyle='rgba(255,255,255,.26)';rr(cx,-r*.75,-r*.6,r*1.5,r*.42,5);cx.fill();
    cx.fillStyle='rgba(20,22,40,.35)';
    for(const p of [[-r*.72,-r*.55],[r*.62,-r*.55],[-r*.72,r*.5],[r*.62,r*.5]]){
      cx.beginPath();cx.arc(p[0],p[1],2.1,0,Math.PI*2);cx.fill();
    }
  }else if(kind==='turbine'){               // TEMPEST: spinning intake rings
    tread(cx,-r*.95,-r*1.18,r*1.9,r*.5,dk,roll);
    tread(cx,-r*.95, r*.68, r*1.9,r*.5,dk,roll);
    cx.fillStyle=body;cx.beginPath();cx.arc(0,0,r*.95,0,Math.PI*2);cx.fill();
    cx.lineWidth=3.2;cx.strokeStyle=INK;cx.stroke();
    cx.save();cx.rotate(frame*.12);
    cx.strokeStyle='rgba(255,255,255,.4)';cx.lineWidth=3;
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;
      cx.beginPath();cx.moveTo(Math.cos(a)*r*.3,Math.sin(a)*r*.3);
      cx.lineTo(Math.cos(a)*r*.82,Math.sin(a)*r*.82);cx.stroke()}
    cx.restore();
  }else if(kind==='roller'){                // CAROM: bumper-car ring
    cx.fillStyle=shade(dk,-.25);cx.beginPath();cx.arc(0,0,r*1.12,0,Math.PI*2);cx.fill();
    cx.lineWidth=3.2;cx.strokeStyle=INK;cx.stroke();
    cx.fillStyle=body;cx.beginPath();cx.arc(0,0,r*.82,0,Math.PI*2);cx.fill();cx.stroke();
    cx.strokeStyle=c.light;cx.lineWidth=3;
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+roll*.1;
      cx.beginPath();cx.arc(0,0,r*.98,a,a+.4);cx.stroke()}
  }else if(kind==='halftrack'){             // CINDER: wheels front, track rear
    wheel(cx,r*.78,-r*.9,r*.32,dk,roll);wheel(cx,r*.78,r*.9,r*.32,dk,roll);
    tread(cx,-r*1.05,-r*1.2,r*1.35,r*.52,dk,roll);
    tread(cx,-r*1.05, r*.7, r*1.35,r*.52,dk,roll);
    plate(cx,[[r*1.05,-r*.55],[r*1.05,r*.55],[-r*1.0,r*.72],[-r*1.0,-r*.72]],body);
    cx.fillStyle=shade(dk,-.1);                       // fuel drums
    for(const sy of [-r*.42,r*.42]){rr(cx,-r*.95,sy-r*.18,r*.5,r*.36,4);cx.fill();
      cx.lineWidth=2.4;cx.strokeStyle=INK;cx.stroke()}
  }else if(kind==='artillery'){             // MORTIS: braced siege platform
    tread(cx,-r*1.05,-r*1.22,r*2.1,r*.58,dk,roll);
    tread(cx,-r*1.05, r*.66, r*2.1,r*.58,dk,roll);
    plate(cx,[[r*.9,-r*.6],[r*.9,r*.6],[-r*1.0,r*.75],[-r*1.0,-r*.75]],body);
    cx.fillStyle=shade(dk,-.15);                      // outriggers
    for(const sy of [-1,1]){rr(cx,-r*.2,sy*r*.62,r*.9,r*.22,3);cx.fill();
      cx.lineWidth=2.2;cx.strokeStyle=INK;cx.stroke()}
  }else if(kind==='railer'){                // LANCER: long spine + fins
    tread(cx,-r*1.1,-r*1.1,r*2.2,r*.46,dk,roll);
    tread(cx,-r*1.1, r*.64, r*2.2,r*.46,dk,roll);
    plate(cx,[[r*1.2,-r*.32],[r*1.2,r*.32],[-r*1.1,r*.6],[-r*1.1,-r*.6]],body);
    plate(cx,[[-r*1.05,-r*.55],[-r*1.5,-r*.95],[-r*1.5,r*.95],[-r*1.05,r*.55]],shade(dk,-.1),2.6);
    cx.strokeStyle=c.light;cx.lineWidth=2.4;
    cx.beginPath();cx.moveTo(-r*.6,0);cx.lineTo(r*1.0,0);cx.stroke();
  }else if(kind==='walker'){                // WARDEN: legged mine layer
    cx.strokeStyle=shade(dk,-.3);cx.lineWidth=5;cx.lineCap='round';
    for(const sx of [-1,1])for(const sy of [-1,1]){
      const ph=Math.sin(roll*.5+sx+sy)*4;
      cx.beginPath();cx.moveTo(sx*r*.5,sy*r*.4);
      cx.lineTo(sx*r*1.1,sy*(r*1.05)+ph);cx.stroke();
    }
    cx.lineCap='butt';
    plate(cx,[[r*.95,0],[r*.5,-r*.78],[-r*.5,-r*.78],[-r*.95,0],[-r*.5,r*.78],[r*.5,r*.78]],body);
    cx.fillStyle='rgba(20,22,40,.4)';                 // mine rack
    for(let i=-1;i<=1;i++){cx.beginPath();cx.arc(-r*.55,i*r*.32,r*.13,0,Math.PI*2);cx.fill()}
  }else{                                    // TITANIA: fortress with skirts
    tread(cx,-r*1.06,-r*1.3,r*2.12,r*.6,dk,roll);
    tread(cx,-r*1.06, r*.7, r*2.12,r*.6,dk,roll);
    cx.fillStyle=shade(dk,-.2);rr(cx,-r*1.12,-r*.9,r*2.24,r*1.8,r*.3);cx.fill();
    cx.lineWidth=3.4;cx.strokeStyle=INK;cx.stroke();
    plate(cx,[[r*1.0,-r*.6],[r*1.0,r*.6],[r*.4,r*.86],[-r*.9,r*.86],[-r*.9,-r*.86],[r*.4,-r*.86]],body);
    cx.fillStyle='rgba(255,255,255,.22)';rr(cx,-r*.7,-r*.66,r*1.4,r*.4,5);cx.fill();
    cx.strokeStyle='rgba(20,22,40,.35)';cx.lineWidth=2.4;
    rr(cx,-r*.62,-r*.55,r*1.24,r*1.1,6);cx.stroke();
  }
}
/* ---- the barrels, one per gun ---- */
function drawBarrel(o,c,r,rec){
  const dk=c.dark,g=c.gun;
  cx.fillStyle=shade(dk,-.1);cx.strokeStyle=INK;cx.lineWidth=3.2;
  const L=c.bl+r-8;
  if(g==='needler'){
    rr(cx,4-rec,-8,L,4.6,2);cx.fill();cx.stroke();
    rr(cx,4-rec, 3.4,L,4.6,2);cx.fill();cx.stroke();
  }else if(g==='stinger'){
    rr(cx,4-rec,-7.5,L,5,2.4);cx.fill();cx.stroke();
    rr(cx,4-rec, 2.5,L,5,2.4);cx.fill();cx.stroke();
    cx.fillStyle=c.light;rr(cx,L-4-rec,-9.5,4,19,2);cx.fill();cx.stroke();
  }else if(g==='gatling'){
    rr(cx,4-rec,-6,L-4,12,4);cx.fill();cx.stroke();
    cx.save();cx.translate(L-2-rec,0);cx.rotate(frame*.35);
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;
      cx.fillStyle=shade(dk,-.25);cx.beginPath();
      cx.arc(Math.cos(a)*4,Math.sin(a)*4,2.6,0,Math.PI*2);cx.fill()}
    cx.restore();
  }else if(g==='phaser'){
    rr(cx,4-rec,-5,L,10,4);cx.fill();cx.stroke();
    cx.fillStyle='rgba(180,220,255,.75)';rr(cx,L*.5,-3,L*.5,6,3);cx.fill();
  }else if(g==='howitzer'){
    cx.fillStyle=shade(dk,-.05);rr(cx,2-rec,-7.5,L*.8,15,5);cx.fill();cx.stroke();
    cx.fillStyle='#2f2f22';cx.beginPath();cx.arc(L*.8-rec,0,8,0,Math.PI*2);cx.fill();cx.stroke();
  }else if(g==='railspike'){
    rr(cx,4-rec,-3.4,L,7,3);cx.fill();cx.stroke();
    cx.strokeStyle=c.light;cx.lineWidth=2.6;
    for(let i=0;i<3;i++){cx.beginPath();cx.arc(L*.35+i*9-rec,0,5.5,-1,1);cx.stroke()}
  }else if(g==='torch'){
    rr(cx,4-rec,-5.5,L-6,11,4);cx.fill();cx.stroke();
    cx.fillStyle='#ffb703';
    cx.beginPath();cx.moveTo(L-8-rec,-8);cx.lineTo(L-rec,0);cx.lineTo(L-8-rec,8);cx.closePath();
    cx.fill();cx.stroke();
  }else if(g==='caroms'){
    rr(cx,4-rec,-5,L,10,4.5);cx.fill();cx.stroke();
    cx.fillStyle=c.light;cx.beginPath();cx.arc(L-2-rec,0,5,0,Math.PI*2);cx.fill();cx.stroke();
  }else if(g==='seeder'){
    rr(cx,4-rec,-6.5,L-4,13,5);cx.fill();cx.stroke();
    cx.fillStyle='rgba(20,22,40,.5)';
    for(let i=0;i<3;i++){cx.beginPath();cx.arc(8+i*8-rec,0,2.4,0,Math.PI*2);cx.fill()}
  }else if(g==='squall'){
    rr(cx,4-rec,-8,L-6,16,5);cx.fill();cx.stroke();
    cx.fillStyle=shade(dk,-.25);rr(cx,L-8-rec,-10,5,20,2.5);cx.fill();cx.stroke();
  }else{ // duocannon
    rr(cx,4-rec,-9.5,L,7.5,3);cx.fill();cx.stroke();
    rr(cx,4-rec, 2,  L,7.5,3);cx.fill();cx.stroke();
    cx.fillStyle=shade(dk,-.3);rr(cx,L-5-rec,-11,5,22,2.5);cx.fill();cx.stroke();
  }
}
/* ---- powerup icons, drawn like little Mario Kart items ---- */
function drawPowerIcon(id,x,y,s){
  cx.save();cx.translate(x,y);cx.scale(s/20,s/20);
  cx.lineWidth=2.6;cx.strokeStyle=INK;cx.lineJoin='round';
  const cap=(top,dots)=>{                    // mushroom-ish capsule
    cx.fillStyle='#fffaf0';rr(cx,-7,0,14,11,4);cx.fill();cx.stroke();
    cx.fillStyle=top;cx.beginPath();cx.arc(0,0,11,Math.PI,0);cx.fill();cx.stroke();
    cx.fillStyle='rgba(255,255,255,.85)';
    (dots||[[-5,-4],[5,-5],[0,-8]]).forEach(d=>{cx.beginPath();cx.arc(d[0],d[1],2.4,0,Math.PI*2);cx.fill()});
  };
  if(id==='rapid'){                          // red boost mushroom
    cap('#ef3e4a');
  }else if(id==='triple'){                   // three shells fanned
    for(let i=-1;i<=1;i++){
      cx.save();cx.translate(i*7,Math.abs(i)*2);
      cx.fillStyle='#ffd23f';cx.beginPath();cx.arc(0,0,5.5,0,Math.PI*2);cx.fill();cx.stroke();
      cx.fillStyle='#fffaf0';cx.beginPath();cx.arc(0,1.5,3,0,Math.PI);cx.fill();
      cx.restore();
    }
  }else if(id==='big'){                      // heavy round with impact spikes
    cx.fillStyle='#ff8c42';cx.beginPath();cx.arc(0,0,10,0,Math.PI*2);cx.fill();cx.stroke();
    cx.fillStyle='#fff';cx.beginPath();cx.arc(-3,-3,3,0,Math.PI*2);cx.fill();
  }else if(id==='pierce'){                   // arrow through a plate
    cx.fillStyle='#c9c4ae';rr(cx,-4,-11,8,22,3);cx.fill();cx.stroke();
    cx.fillStyle='#ef3e4a';
    cx.beginPath();cx.moveTo(12,0);cx.lineTo(2,-7);cx.lineTo(2,-3);cx.lineTo(-12,-3);
    cx.lineTo(-12,3);cx.lineTo(2,3);cx.lineTo(2,7);cx.closePath();cx.fill();cx.stroke();
  }else if(id==='shield'){                   // classic crest
    cx.fillStyle='#3d7ea6';
    cx.beginPath();cx.moveTo(0,-11);cx.lineTo(10,-6);cx.lineTo(10,3);
    cx.quadraticCurveTo(10,10,0,12);cx.quadraticCurveTo(-10,10,-10,3);
    cx.lineTo(-10,-6);cx.closePath();cx.fill();cx.stroke();
    cx.fillStyle='rgba(255,255,255,.5)';
    cx.beginPath();cx.moveTo(0,-8);cx.lineTo(6,-5);cx.lineTo(6,2);cx.lineTo(0,4);cx.closePath();cx.fill();
  }else if(id==='heal'){                      // green cross capsule
    cap('#35a44a',[[-5,-5],[5,-4]]);
    cx.fillStyle='#fff';cx.fillRect(-2,-8,4,9);cx.fillRect(-6,-6,12,4);
  }else if(id==='star'){                      // the star
    const g=cx.createLinearGradient(0,-12,0,12);
    g.addColorStop(0,'#fff3a8');g.addColorStop(1,'#e7a600');
    cx.fillStyle=g;cx.beginPath();
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,rr2=i%2?5.2:12;
      cx.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}
    cx.closePath();cx.fill();cx.stroke();
    cx.fillStyle=INK;cx.beginPath();cx.arc(-3,-1,1.4,0,Math.PI*2);cx.arc(3,-1,1.4,0,Math.PI*2);cx.fill();
  }else if(id==='speed'){                     // chevrons
    cx.fillStyle='#2ec4b6';
    for(let i=-1;i<=1;i++){
      cx.beginPath();cx.moveTo(i*7-3,-9);cx.lineTo(i*7+5,0);cx.lineTo(i*7-3,9);
      cx.lineTo(i*7-1,0);cx.closePath();cx.fill();cx.stroke();
    }
  }else if(id==='ghost'){                     // boo-ish ghost
    cx.fillStyle='#e9edf7';
    cx.beginPath();cx.arc(0,-2,10,Math.PI,0);
    cx.lineTo(10,7);cx.lineTo(6,3);cx.lineTo(2,7);cx.lineTo(-2,3);cx.lineTo(-6,7);cx.lineTo(-10,3);
    cx.closePath();cx.fill();cx.stroke();
    cx.fillStyle=INK;cx.beginPath();cx.arc(-3.5,-3,1.9,0,Math.PI*2);cx.arc(3.5,-3,1.9,0,Math.PI*2);cx.fill();
  }else if(id==='mine'){                      // sea-mine with spikes
    cx.fillStyle='#454458';
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;
      cx.save();cx.rotate(a);cx.fillRect(-1.6,-12,3.2,5);cx.restore()}
    cx.beginPath();cx.arc(0,0,8.5,0,Math.PI*2);cx.fill();cx.stroke();
    cx.fillStyle='#ef3e4a';cx.beginPath();cx.arc(0,0,3,0,Math.PI*2);cx.fill();
  }else if(id==='freeze'){                    // snowflake
    cx.strokeStyle='#4cc9f0';cx.lineWidth=3;cx.lineCap='round';
    for(let i=0;i<3;i++){const a=i/3*Math.PI;
      cx.beginPath();cx.moveTo(-Math.cos(a)*11,-Math.sin(a)*11);
      cx.lineTo(Math.cos(a)*11,Math.sin(a)*11);cx.stroke();
      for(const s2 of [-1,1]){
        cx.beginPath();cx.moveTo(Math.cos(a)*7*s2,Math.sin(a)*7*s2);
        cx.lineTo(Math.cos(a+0.9)*11*s2,Math.sin(a+0.9)*11*s2);cx.stroke();
      }
    }
    cx.lineCap='butt';
  }else{                                      // flip: swirl
    cx.strokeStyle='#ff8c42';cx.lineWidth=3.4;
    cx.beginPath();cx.arc(0,0,8,0.6,Math.PI*1.7);cx.stroke();
    cx.fillStyle='#ff8c42';
    cx.beginPath();cx.moveTo(9,-4);cx.lineTo(2,-6);cx.lineTo(6,2);cx.closePath();cx.fill();
  }
  cx.restore();
}
