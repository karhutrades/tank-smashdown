/* ---------------- menus ---------------- */
function goto(s){state=s;pressQ.clear()}
function participants(){return mode==='coop'?2:1}  // online picks locally on each machine
function stepTitle(){if(navOk()){sGo();menuIdx=0;goto('mode')}}
function stepMode(){
  if(navUp()){menuIdx=(menuIdx+MODES.length-1)%MODES.length;sTick()}
  if(navDown()){menuIdx=(menuIdx+1)%MODES.length;sTick()}
  if(navBack()){sBack();goto('title')}
  if(navOk()){
    const id=MODES[menuIdx].id;sLock();
    if(id==='profiles'){profTeam=0;profField=0;goto('profiles')}
    else if(id==='duel'){mode='duel';subIdx=aiLevel;goto('difficulty')}
    else if(id==='campaign'){
      mode='campaign';campStage=Math.min(prof(0).stats.campaign|0,MAPS.length-1);
      subIdx=campStage;goto('campmenu');
    }
    else if(id==='online'){mode='online';goto('online')}
    else{mode='coop';enterSelect()}
  }
}
function stepDifficulty(){
  if(navLeft()||navUp()){subIdx=(subIdx+2)%3;sTick()}
  if(navRight()||navDown()){subIdx=(subIdx+1)%3;sTick()}
  if(navBack()){sBack();goto('mode')}
  if(navOk()){aiLevel=subIdx;sLock();enterSelect()}
}
function stepCampMenu(){
  const maxStage=Math.min(prof(0).stats.campaign|0,MAPS.length-1);
  if(navLeft()){subIdx=Math.max(0,subIdx-1);sTick()}
  if(navRight()){subIdx=Math.min(maxStage,subIdx+1);sTick()}
  if(navBack()){sBack();goto('mode')}
  if(navOk()){campStage=subIdx;sLock();enterSelect()}
}
function enterSelect(){
  for(let p=0;p<2;p++){
    sel[p].locked=false;
    const pr=prof(p);
    if(pr&&isUnlocked(pr.last,pr))sel[p].i=pr.last;
  }
  if(mode==='duel'){
    // the bot picks a class of its own
    let pick=Math.random()*CLASSES.length|0;
    sel[1].i=pick;
  }
  selTimer=50;goto('select');
}
function stepSelect(){
  const n=participants();
  for(let p=0;p<n;p++){
    const k=KEYMAP[p],s=sel[p],pr=prof(p);
    if(!s.locked){
      let col=s.i%3,row=(s.i/3)|0,moved=false;
      if(pressQ.has(k.left)){col=(col+2)%3;moved=true}
      if(pressQ.has(k.right)){col=(col+1)%3;moved=true}
      if(pressQ.has(k.up)){row=(row+2)%3;moved=true}
      if(pressQ.has(k.down)){row=(row+1)%3;moved=true}
      if(moved){s.i=row*3+col;sTick()}
      if(pressQ.has(k.fire)){
        if(isUnlocked(s.i,pr)){s.locked=true;sLock();if(onLockIn)onLockIn(p)}
        else{toast={txt:'LOCKED · '+CLASSES[s.i].unlock.txt,life:150};sBack()}
      }
    }else if(pressQ.has(k.fire)&&!allLocked()){
      s.locked=false;sTick();
    }
  }
  if(navBack()&&!allLocked()){sBack();goto('mode');return}
  if(allLocked()){
    if(netBlockStart&&netBlockStart())selTimer=50;
    else if(--selTimer<=0)startMatch();
  }else selTimer=50;
}
function allLocked(){
  const n=participants();
  for(let p=0;p<n;p++)if(!sel[p].locked)return false;
  return true;
}
function stepProfiles(){
  const p=profiles[slots[profTeam]];
  if(navBack()){sBack();saveProfiles();goto('mode');return}
  if(pressQ.has('Tab')||anyPress('KeyQ')){profTeam=1-profTeam;sTick()}
  if(navUp()){profField=(profField+3)%4;sTick()}
  if(navDown()){profField=(profField+1)%4;sTick()}
  if(profField===0){ // which profile slot
    if(navLeft()){slots[profTeam]=(slots[profTeam]+profiles.length-1)%profiles.length;sTick();saveProfiles()}
    if(navRight()){slots[profTeam]=(slots[profTeam]+1)%profiles.length;sTick();saveProfiles()}
  }else if(profField===1){ // colour
    const ci=Math.max(0,SWATCHES.indexOf(p.color));
    if(navLeft()){p.color=SWATCHES[(ci+SWATCHES.length-1)%SWATCHES.length];sTick();saveProfiles()}
    if(navRight()){p.color=SWATCHES[(ci+1)%SWATCHES.length];sTick();saveProfiles()}
  }
  if(navOk()){
    if(profField===2){nameTarget=slots[profTeam];typeBuf=p.name;sLock();goto('name')}
    else if(profField===3){
      profiles.push(blankProfile('PLAYER '+(profiles.length+1)));
      slots[profTeam]=profiles.length-1;profField=2;sLock();saveProfiles();
    }else sLock();
  }
}
function stepName(){
  if(pressQ.has('Enter')||pressQ.has('Escape')){
    const nm=typeBuf.trim();
    if(nm)profiles[nameTarget].name=nm.slice(0,12);
    saveProfiles();sLock();goto('profiles');
  }
}
function stepOnline(){
  if(navBack()||navOk()){sBack();goto('mode')}
}
function stepRoundEnd(){
  if(--timer>0)return;
  const champ=roundWinner&&roundWinner.score>=(mode==='campaign'?1:WIN_SCORE);
  if(champ){
    finishMatch(roundWinner);
    if(mode==='campaign'){
      campResult=roundWinner.human?'CLEARED':'FAILED';
      if(roundWinner.human&&campStage+1>=MAPS.length)campResult='COMPLETE';
    }
    state='game';timer=30;sStar();conf=[];
  }else{
    mapIndex=(mapIndex+1)%MAPS.length;startRound();
  }
}
function stepGameOver(){
  if(timer>0)timer--;
  else if(navOk()){
    if(mode==='campaign'){
      if(campResult==='CLEARED'){campStage=Math.min(campStage+1,MAPS.length-1);sGo();startMatch();return}
      if(campResult==='FAILED'){sGo();startMatch();return}
      sGo();goto('mode');return;
    }
    sGo();enterSelect();
  }
  if(navBack()){sBack();goto('mode')}
  if(conf.length<160&&frame%2===0){
    const cols=['#ef3e4a','#35a44a','#ffd23f','#3d7ea6','#ff8c42','#2ec4b6'];
    conf.push({x:Math.random()*W,y:-10,vx:(Math.random()-.5)*1.5,vy:1.5+Math.random()*2,
      rot:Math.random()*6,vr:(Math.random()-.5)*.25,color:cols[Math.random()*6|0],w:6+Math.random()*5,h:4+Math.random()*4});
  }
  for(let i=conf.length-1;i>=0;i--){const c=conf[i];c.x+=c.vx;c.y+=c.vy;c.rot+=c.vr;if(c.y>H+12)conf.splice(i,1)}
}
function stepAmbient(){
  for(const a of amb){
    a.p+=.02;
    if(a.kind==='snow'){a.y+=.5*a.s;a.x+=Math.sin(a.p)*.4;if(a.y>H){a.y=-4;a.x=Math.random()*W}}
    else if(a.kind==='embers'){a.y-=.6*a.s;a.x+=Math.sin(a.p)*.5;if(a.y<-4){a.y=H+4;a.x=Math.random()*W}}
    else if(a.kind==='clouds'){a.x+=.25*a.s;if(a.x>W+160)a.x=-160}
    else if(a.kind==='heat'){a.y-=.3*a.s;if(a.y<-10){a.y=H+10;a.x=Math.random()*W}}
    else if(a.kind==='sparks'&&Math.random()<.02){a.x=Math.random()*W;a.y=Math.random()*H}
  }
}
function currentTune(){
  if(['title','mode','difficulty','campmenu','profiles','name','online','select'].includes(state))return 'menu';
  const m=MAPS[mapIndex];
  return m?m.world:'menu';
}
function step(){
  frame++;
  if(musicOn&&AC&&frame%30===0)playMusic(currentTune());
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.92;p.vy*=.92;if(--p.life<=0)parts.splice(i,1)}
  for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.y-=.7;if(--f.life<=0)floats.splice(i,1)}
  for(let i=marks.length-1;i>=0;i--){if(--marks[i].life<=0)marks.splice(i,1)}
  if(marks.length>240)marks.splice(0,marks.length-240);
  if(toast&&--toast.life<=0)toast=null;
  if(shake>0)shake*=.86;
  if(flash>0)flash=Math.max(0,flash-.06);
  for(const t of tanks)if(t.squash>0)t.squash=Math.max(0,t.squash-.09);
  stepAmbient();
  if(hitstop>0){hitstop--;pressQ.clear();return}
  if(state==='title')stepTitle();
  else if(state==='mode')stepMode();
  else if(state==='difficulty')stepDifficulty();
  else if(state==='campmenu')stepCampMenu();
  else if(state==='profiles')stepProfiles();
  else if(state==='name')stepName();
  else if(state==='online')stepOnline();
  else if(state==='select')stepSelect();
  else if(state==='ready'){
    if(!readyPinged){sTick();readyPinged=true}
    if(timer===40&&!goPinged){sGo();goPinged=true}
    if(--timer<=0)state='play';
  }
  else if(state==='play')stepPlay();
  else if(state==='round')stepRoundEnd();
  else if(state==='game')stepGameOver();
  pressQ.clear();
}

/* ---------------- dynamic tile drawing ---------------- */
function drawDynamicTiles(){
  const m=MAPS[mapIndex];
  for(let gy=0;gy<ROWS;gy++)for(let gx=0;gx<COLS;gx++){
    const c=cells[gy][gx],x=gx*T,y=gy*T;
    if(c==='>'||c==='<'||c==='^'||c==='v'){
      cx.fillStyle='#2e3147';rr(cx,x+2,y+2,T-4,T-4,5);cx.fill();
      cx.strokeStyle=INK;cx.lineWidth=2;rr(cx,x+2,y+2,T-4,T-4,5);cx.stroke();
      const dir=c==='>'?0:c==='v'?Math.PI/2:c==='<'?Math.PI:-Math.PI/2;
      cx.save();cx.translate(x+T/2,y+T/2);cx.rotate(dir);
      const ph=(frame*.8)%14;
      cx.strokeStyle='#ffb703';cx.lineWidth=3;cx.lineJoin='round';
      for(let i=-1;i<2;i++){
        const px=-14+ph+i*14;
        cx.beginPath();cx.moveTo(px-4,-9);cx.lineTo(px+4,0);cx.lineTo(px-4,9);cx.stroke();
      }
      cx.restore();
    }else if(c==='~'){
      const ph=frame*.05+gx*.9+gy*.7;
      cx.strokeStyle=m.liqB;cx.lineWidth=2.5;
      cx.beginPath();cx.arc(x+12+Math.sin(ph)*3,y+14,6,Math.PI*.15,Math.PI*.85);cx.stroke();
      cx.beginPath();cx.arc(x+28+Math.cos(ph)*3,y+28,6,Math.PI*.15,Math.PI*.85);cx.stroke();
      if(m.world==='volcano'&&Math.random()<.004)burst(x+Math.random()*T,y+Math.random()*T,'#ffd166',1,1.5);
    }else if(c==='o'){
      const cxp=x+T/2,cyp=y+T/2;
      cx.fillStyle='#ef3e4a';cx.beginPath();cx.arc(cxp,cyp,13,0,Math.PI*2);cx.fill();
      cx.strokeStyle=INK;cx.lineWidth=3;cx.stroke();
      cx.fillStyle=CREAM;cx.beginPath();cx.arc(cxp,cyp,6.5,0,Math.PI*2);cx.fill();cx.stroke();
    }else if(c==='1'||c==='2'){
      const cxp=x+T/2,cyp=y+T/2,col=c==='1'?'#7ae0c3':'#ffb703';
      cx.save();cx.translate(cxp,cyp);cx.rotate(frame*.04*(c==='1'?1:-1));
      cx.strokeStyle=col;cx.lineWidth=3.5;
      for(let i=0;i<3;i++){cx.beginPath();cx.arc(0,0,12,i*2.1,i*2.1+1.3);cx.stroke()}
      cx.restore();
      cx.fillStyle=col;cx.globalAlpha=.35+.2*Math.sin(frame*.1);
      cx.beginPath();cx.arc(cxp,cyp,6,0,Math.PI*2);cx.fill();cx.globalAlpha=1;
    }
  }
}
function drawBushes(){
  for(let gy=0;gy<ROWS;gy++)for(let gx=0;gx<COLS;gx++){
    if(cells[gy][gx]!=='b')continue;
    const x=gx*T+T/2,y=gy*T+T/2,sw=1+Math.sin(frame*.04+gx*2+gy)*0.04;
    cx.save();cx.translate(x,y);cx.scale(sw,1);
    cx.fillStyle='#2f9e44';
    cx.beginPath();cx.arc(-9,2,11,0,Math.PI*2);cx.arc(9,2,11,0,Math.PI*2);cx.arc(0,-7,11,0,Math.PI*2);cx.fill();
    cx.strokeStyle=INK;cx.lineWidth=2.5;cx.stroke();
    cx.fillStyle='#4bbf5e';
    cx.beginPath();cx.arc(-6,-4,5,0,Math.PI*2);cx.arc(7,-1,4,0,Math.PI*2);cx.fill();
    cx.restore();
  }
}
function drawCrates(){
  for(const k in crateHp){
    if(crateHp[k]<=0)continue;
    const gx=k%COLS,gy=(k/COLS)|0;
    if(cells[gy][gx]!=='x')continue;
    const x=gx*T,y=gy*T,hp=crateHp[k];
    cx.fillStyle='rgba(34,35,59,.22)';rr(cx,x+5,y+6,T-6,T-6,7);cx.fill();
    cx.fillStyle='#c08a4a';rr(cx,x+2.5,y+2.5,T-5,T-5,6);cx.fill();
    cx.strokeStyle='#8f5f2c';cx.lineWidth=3;
    cx.beginPath();cx.moveTo(x+7,y+7);cx.lineTo(x+T-7,y+T-7);cx.moveTo(x+T-7,y+7);cx.lineTo(x+7,y+T-7);cx.stroke();
    cx.strokeStyle=INK;cx.lineWidth=3;rr(cx,x+2.5,y+2.5,T-5,T-5,6);cx.stroke();
    if(hp<2){cx.strokeStyle='#5d3d16';cx.lineWidth=2;
      cx.beginPath();cx.moveTo(x+6,y+14);cx.lineTo(x+14,y+18);cx.lineTo(x+10,y+27);cx.moveTo(x+30,y+8);cx.lineTo(x+26,y+18);cx.stroke()}
  }
}
function drawMovers(){
  for(const mv of movers){
    const rc=moverRect(mv);
    cx.fillStyle='rgba(34,35,59,.28)';rr(cx,rc.x+4,rc.y+5,rc.w-2,rc.h-2,7);cx.fill();
    cx.fillStyle='#6b6f8c';rr(cx,rc.x+1,rc.y+1,rc.w-2,rc.h-2,6);cx.fill();
    cx.save();cx.beginPath();rr(cx,rc.x+1,rc.y+1,rc.w-2,rc.h-2,6);cx.clip();
    cx.fillStyle='#ffb703';
    for(let i=-1;i<3;i++){
      cx.save();cx.translate(rc.x+i*16+8,rc.y+rc.h/2);cx.rotate(-.7);
      cx.fillRect(-4,-30,8,60);cx.restore();
    }
    cx.restore();
    cx.strokeStyle=INK;cx.lineWidth=3;rr(cx,rc.x+1,rc.y+1,rc.w-2,rc.h-2,6);cx.stroke();
  }
}
function drawMinesAndPickups(){
  for(const mn of mines){
    const armed=mn.arm<=0,blink=armed&&(frame>>4)%2===0;
    cx.fillStyle=armed?'#454458':'#8a8672';
    cx.beginPath();cx.arc(mn.x,mn.y,8,0,Math.PI*2);cx.fill();
    cx.strokeStyle=INK;cx.lineWidth=2.5;cx.stroke();
    cx.fillStyle=blink?'#ef3e4a':'#8f5f2c';
    cx.beginPath();cx.arc(mn.x,mn.y,3,0,Math.PI*2);cx.fill();
  }
  for(const p of pickups){
    const bob=Math.sin((frame+p.age)*.08)*3,fade=p.age>600&&(frame>>3)%2===0;
    if(fade)continue;
    const y=p.y+bob;
    cx.fillStyle='rgba(34,35,59,.2)';cx.beginPath();cx.ellipse(p.x,p.y+14,10,4,0,0,Math.PI*2);cx.fill();
    cx.fillStyle=CREAM;cx.beginPath();cx.arc(p.x,y,13,0,Math.PI*2);cx.fill();
    cx.strokeStyle=INK;cx.lineWidth=3;cx.stroke();
    cx.strokeStyle=p.def.color;cx.lineWidth=2.5;cx.beginPath();cx.arc(p.x,y,9.5,0,Math.PI*2);cx.stroke();
    cx.fillStyle=p.def.color;cx.font='900 12px system-ui,Arial,sans-serif';
    cx.textAlign='center';cx.textBaseline='middle';cx.fillText(p.def.glyph,p.x,y+1);
  }
}
function drawAmbient(){
  for(const a of amb){
    if(a.kind==='snow'){cx.fillStyle='rgba(255,255,255,.7)';cx.beginPath();cx.arc(a.x,a.y,1.6*a.s,0,Math.PI*2);cx.fill()}
    else if(a.kind==='embers'){cx.fillStyle='rgba(255,140,66,'+(.3+.3*Math.sin(a.p*3))+')';cx.beginPath();cx.arc(a.x,a.y,1.8*a.s,0,Math.PI*2);cx.fill()}
    else if(a.kind==='clouds'){cx.fillStyle='rgba(34,35,59,.05)';cx.beginPath();cx.ellipse(a.x,a.y,90*a.s,34*a.s,0,0,Math.PI*2);cx.fill()}
    else if(a.kind==='heat'){cx.fillStyle='rgba(255,255,255,.045)';cx.beginPath();cx.ellipse(a.x,a.y,26,7,0,0,Math.PI*2);cx.fill()}
    else if(a.kind==='sparks'){cx.fillStyle='rgba(255,183,3,'+(.25+.45*Math.abs(Math.sin(a.p*5)))+')';cx.fillRect(a.x,a.y,2,2)}
  }
}
function drawMarks(){
  for(const mk of marks){
    cx.save();cx.translate(mk.x,mk.y);cx.rotate(mk.ang);
    cx.globalAlpha=mk.life/170*.13;cx.fillStyle=INK;
    cx.fillRect(-2,-mk.r*.85,4,5);cx.fillRect(-2,mk.r*.85-5,4,5);
    cx.restore();
  }
  cx.globalAlpha=1;
}
