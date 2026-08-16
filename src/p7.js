/* ---------------- shared screen furniture ---------------- */
function screenBg(tint){
  const g=cx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,tint||'#232744');g.addColorStop(1,'#12142400'.slice(0,7));
  cx.fillStyle='#141728';cx.fillRect(0,0,W,H);
  cx.fillStyle=g;cx.fillRect(0,0,W,H);
  // slow diagonal stripes for depth
  cx.save();cx.globalAlpha=.05;cx.fillStyle='#fff';
  const off=(frame*.35)%80;
  for(let x=-H;x<W+H;x+=80){cx.beginPath();cx.moveTo(x+off,0);cx.lineTo(x+off+34,0);cx.lineTo(x+off+34-H,H);cx.lineTo(x+off-H,H);cx.closePath();cx.fill()}
  cx.restore();
  const v=cx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*1.05);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(8,9,18,.55)');
  cx.fillStyle=v;cx.fillRect(0,0,W,H);
}
function panel(x,y,w,h,accent,r){
  r=r||16;
  cx.fillStyle='rgba(12,14,26,.42)';rr(cx,x+5,y+7,w,h,r);cx.fill();
  const g=cx.createLinearGradient(0,y,0,y+h);
  g.addColorStop(0,'#fffaf0');g.addColorStop(1,'#f0e3cb');
  cx.fillStyle=g;rr(cx,x,y,w,h,r);cx.fill();
  if(accent){
    cx.save();cx.beginPath();rr(cx,x,y,w,h,r);cx.clip();
    const ag=cx.createLinearGradient(0,y,0,y+34);
    ag.addColorStop(0,shade(accent,.25));ag.addColorStop(1,accent);
    cx.fillStyle=ag;cx.fillRect(x,y,w,32);
    cx.fillStyle='rgba(255,255,255,.25)';cx.fillRect(x,y,w,10);
    cx.restore();
  }
  cx.strokeStyle=INK;cx.lineWidth=3.5;rr(cx,x,y,w,h,r);cx.stroke();
}
function label(txt,x,y,size,color,align,weight){
  cx.fillStyle=color||INK;cx.font=(weight||800)+' '+(size||13)+'px system-ui,Arial,sans-serif';
  cx.textAlign=align||'center';cx.textBaseline='middle';cx.fillText(txt,x,y);
}
function footer(txt){
  cx.fillStyle='rgba(10,12,22,.5)';rr(cx,W/2-330,H-34,660,26,13);cx.fill();
  label(txt,W/2,H-21,12,'#d8d3c2');
}
function drawToast(){
  if(!toast)return;
  const a=Math.min(1,toast.life/40),pop=1+Math.max(0,(toast.life-230)/30)*.15;
  cx.save();cx.globalAlpha=a;cx.translate(W/2,74);cx.scale(pop,pop);
  panel(-200,-22,400,44,'#e7a600',14);
  label(toast.txt,0,4,15,INK);
  cx.restore();
}
/* selection highlight that breathes, used by every menu */
function selectRing(x,y,w,h,color,r){
  const p=2+Math.sin(frame*.12)*1.6;
  cx.save();
  cx.shadowColor=color;cx.shadowBlur=18;
  cx.strokeStyle=color;cx.lineWidth=5;
  rr(cx,x-p,y-p,w+p*2,h+p*2,(r||16)+3);cx.stroke();
  cx.restore();
}
function bounce(i,speed){return Math.sin(frame*(speed||.08)+i)*3}
/* ---------------- title ---------------- */
function drawTitle(){
  screenBg('#2a2f52');
  // parade of tanks rolling across the back
  for(let i=0;i<4;i++){
    const c=CLASSES[(i*2+1)%CLASSES.length];
    const x=((frame*(.5+i*.15)+i*260)%(W+240))-120;
    cx.save();cx.globalAlpha=.22;
    drawTankBody({x,y:110+i*118,ang:0,cls:c,recoil:0,dist:frame*2});
    cx.restore();
  }
  const t=frame*.05;
  cx.save();
  cx.translate(W/2,140+Math.sin(t)*4);cx.rotate(Math.sin(t*.6)*.02);
  cx.font='italic 900 92px system-ui,Segoe UI,Arial,sans-serif';
  cx.textAlign='center';cx.textBaseline='middle';
  cx.lineWidth=16;cx.lineJoin='round';cx.strokeStyle=INK;cx.strokeText('TANK',0,0);
  const g=cx.createLinearGradient(0,-46,0,46);
  g.addColorStop(0,'#ffe89a');g.addColorStop(.5,'#ffd23f');g.addColorStop(1,'#f0a500');
  cx.fillStyle=g;cx.fillText('TANK',0,0);
  cx.restore();
  cx.save();
  cx.translate(W/2,226+Math.sin(t+.6)*4);cx.rotate(-.04+Math.sin(t*.6+1)*.02);
  cx.font='italic 900 92px system-ui,Segoe UI,Arial,sans-serif';
  cx.textAlign='center';cx.textBaseline='middle';
  cx.lineWidth=16;cx.lineJoin='round';cx.strokeStyle=INK;cx.strokeText('SMASHDOWN!',0,0);
  const g2=cx.createLinearGradient(0,-46,0,46);
  g2.addColorStop(0,'#fff');g2.addColorStop(1,'#c8d4ff');
  cx.fillStyle=g2;cx.fillText('SMASHDOWN!',0,0);
  cx.restore();
  // duelling pair, front and centre
  drawTankBody({x:W/2-140,y:352,ang:.1,cls:CLASSES[1],teamColor:TEAMS[0].color,recoil:0,dist:frame});
  drawTankBody({x:W/2+140,y:352,ang:Math.PI-.1,cls:CLASSES[3],teamColor:TEAMS[1].color,recoil:0,dist:frame});
  // roster strip
  const n=CLASSES.length,cw=64,x0=W/2-(n*cw)/2;
  for(let i=0;i<n;i++){
    const c=CLASSES[i],y=452+bounce(i*.7,.09);
    drawBadge(x0+i*cw+cw/2,y,21,c,null,'',0,0);
  }
  label(MAPS.length+' ARENAS   ·   '+CLASSES.length+' TANKS   ·   '+POWERS.length+' POWERUPS',W/2,504,13,'#c9c4ae');
  if((frame/30|0)%2===0){
    cx.save();cx.translate(0,Math.sin(frame*.14)*2);
    splash('PRESS SPACE OR ENTER',26,540,0,'#ffd166');
    cx.restore();
  }
  footer('P1: WASD + SPACE   ·   P2: ARROWS + ENTER   ·   AUTO-AIM ON   ·   F: FULLSCREEN   ·   N: MUSIC');
}
/* ---------------- mode select ---------------- */
function drawMode(){
  screenBg();
  splash('CHOOSE A MODE',44,54);
  const w=560,h=62,x=(W-w)/2;
  MODES.forEach((m,i)=>{
    const y=104+i*74,on=i===menuIdx;
    if(on){cx.fillStyle=prof(0).color;rr(cx,x-7,y-7,w+14,h+14,18);cx.fill()}
    panel(x,y,w,h,null,14);
    label(m.title,x+22,y+24,20,INK,'left');
    label(m.sub,x+22,y+46,12,'#8a8672','left');
    label(m.hint,x+w-22,y+31,11,'#8a8672','right');
    if(on){
      cx.fillStyle=prof(0).color;
      cx.beginPath();cx.moveTo(x-24,y+h/2-9);cx.lineTo(x-10,y+h/2);cx.lineTo(x-24,y+h/2+9);cx.closePath();cx.fill();
      cx.strokeStyle=INK;cx.lineWidth=2.5;cx.stroke();
    }
  });
  label('P1: '+prof(0).name+'   ·   P2: '+prof(1).name,W/2,H-42,13,'#c9c4ae');
  footer('MOVE: W/S OR ARROWS      SELECT: SPACE / ENTER      BACK: ESC');
  drawToast();
}

/* ---------------- difficulty ---------------- */
function drawDifficulty(){
  screenBg();
  splash('BOT DIFFICULTY',44,64);
  const cw=250,gap=20,x0=(W-3*cw-2*gap)/2;
  AI_LEVELS.forEach((a,i)=>{
    const x=x0+i*(cw+gap),y=150,h=220,on=i===subIdx;
    if(on){cx.fillStyle=prof(0).color;rr(cx,x-7,y-7,cw+14,h+14,18);cx.fill()}
    panel(x,y,cw,h,[ '#35a44a','#ffd23f','#ef3e4a' ][i],14);
    label(a.name,x+cw/2,y+15,17,'#fff');
    drawTankBody({x:x+cw/2,y:y+92,ang:Math.PI/2,cls:CLASSES[(i*3+1)%CLASSES.length],recoil:0});
    for(let s=0;s<3;s++){
      cx.fillStyle=s<=i?['#35a44a','#ffd23f','#ef3e4a'][i]:'#d8cbb4';
      cx.beginPath();cx.arc(x+cw/2-28+s*28,y+144,9,0,Math.PI*2);cx.fill();
      cx.lineWidth=2.5;cx.strokeStyle=INK;cx.stroke();
    }
    label(a.desc,x+cw/2,y+180,11,'#8a8672');
  });
  footer('MOVE: A/D OR ARROWS      START: SPACE / ENTER      BACK: ESC');
}

/* ---------------- campaign stage picker ---------------- */
function drawCampMenu(){
  screenBg();
  splash('CAMPAIGN',48,58);
  const p=prof(0),done=p.stats.campaign|0;
  label(p.name+'  ·  '+done+' / '+MAPS.length+' STAGES CLEARED',W/2,100,15,'#c9c4ae');
  const cols=8,cw=104,ch=74,gap=10,x0=(W-cols*cw-(cols-1)*gap)/2;
  for(let i=0;i<MAPS.length;i++){
    const x=x0+(i%cols)*(cw+gap),y=132+((i/cols)|0)*(ch+gap);
    const cleared=i<done,locked=i>done,on=i===subIdx;
    if(on){cx.fillStyle=p.color;rr(cx,x-6,y-6,cw+12,ch+12,16);cx.fill()}
    panel(x,y,cw,ch,null,12);
    if(locked){cx.fillStyle='rgba(34,35,59,.55)';rr(cx,x,y,cw,ch,12);cx.fill()}
    label('STAGE '+(i+1),x+cw/2,y+18,12,locked?'#cfcabb':INK);
    label(MAPS[i].name,x+cw/2,y+38,9,locked?'#cfcabb':'#8a8672');
    const st=campaignStage(i);
    label(cleared?'★ CLEARED':locked?'LOCKED':AI_LEVELS[st.ai].name,x+cw/2,y+58,10,
      cleared?'#e7a600':locked?'#cfcabb':CLASSES[st.cls].color);
  }
  const st=campaignStage(subIdx);
  panel(W/2-250,326,500,74,null,14);
  label('NEXT FIGHT',W/2-230,346,12,'#8a8672','left');
  label(MAPS[st.map].name+'  ·  CPU '+CLASSES[st.cls].name+'  ·  '+AI_LEVELS[st.ai].name+
        (st.bonus?('  ·  +'+st.bonus+' HP'):''),W/2-230,372,15,INK,'left');
  drawTankBody({x:W/2+200,y:362,ang:Math.PI,cls:CLASSES[st.cls],recoil:0});
  label('EACH STAGE IS ONE KO. WIN TO ADVANCE AND UNLOCK TANKS.',W/2,430,13,'#c9c4ae');
  footer('MOVE: A/D OR ARROWS      START: SPACE / ENTER      BACK: ESC');
}

/* ---------------- profiles ---------------- */
function drawProfiles(){
  screenBg();
  splash('PLAYER PROFILES',42,50);
  for(let team=0;team<2;team++){
    const x=team===0?60:W/2+16,w=W/2-76,y=92,h=402;
    const p=profiles[slots[team]],active=team===profTeam;
    if(active){cx.fillStyle=p.color;rr(cx,x-7,y-7,w+14,h+14,20);cx.fill()}
    panel(x,y,w,h,p.color,16);
    label('PLAYER '+(team+1)+(team===0?'  ·  WASD':'  ·  ARROWS'),x+w/2,y+15,14,'#fff');
    drawBadge(x+64,y+82,38,CLASSES[p.last],p.color,'',0,0);
    label(p.name,x+120,y+62,22,INK,'left');
    label('TANK: '+CLASSES[p.last].name,x+120,y+90,12,'#8a8672','left');
    label(unlockedCount(p)+' / '+CLASSES.length+' TANKS UNLOCKED',x+120,y+110,12,'#8a8672','left');
    const s=p.stats,rows=[
      ['WINS',s.wins],['LOSSES',s.losses],['KOs',s.kos],
      ['ROUNDS',s.rounds],['CAMPAIGN',s.campaign+' / '+MAPS.length],
    ];
    rows.forEach((r,i)=>{
      const ry=y+150+i*26;
      label(r[0],x+24,ry,12,'#8a8672','left');
      cx.font='800 14px system-ui,Arial,sans-serif';cx.textAlign='right';
      cx.fillStyle=INK;cx.fillText(String(r[1]),x+w-24,ry);
    });
    let fav='-',best=0;
    for(const k in s.plays)if(s.plays[k]>best){best=s.plays[k];fav=k}
    label('FAVOURITE TANK',x+24,y+286,12,'#8a8672','left');
    cx.font='800 14px system-ui,Arial,sans-serif';cx.textAlign='right';cx.fillStyle=INK;
    cx.fillText(fav,x+w-24,y+286);
    // editable rows
    const fields=[['PROFILE','< '+p.name+' >'],['COLOUR',''],['RENAME','PRESS SELECT'],['NEW PROFILE','PRESS SELECT']];
    fields.forEach((f,i)=>{
      const fy=y+316+i*26,on=active&&profField===i;
      if(on){cx.fillStyle=p.color;rr(cx,x+16,fy-11,w-32,24,8);cx.fill()}
      label(f[0],x+24,fy,12,on?'#fff':'#8a8672','left');
      if(i===1){
        SWATCHES.forEach((sw,si)=>{
          const sx=x+w-24-(SWATCHES.length-si)*22;
          cx.fillStyle=sw;cx.beginPath();cx.arc(sx,fy,7,0,Math.PI*2);cx.fill();
          cx.lineWidth=sw===p.color?3:1.5;cx.strokeStyle=sw===p.color?INK:'rgba(34,35,59,.4)';cx.stroke();
        });
      }else{
        cx.font='800 12px system-ui,Arial,sans-serif';cx.textAlign='right';
        cx.fillStyle=on?'#fff':INK;cx.fillText(f[1],x+w-24,fy);
      }
    });
  }
  label(store?'SAVED IN THIS BROWSER':'BROWSER STORAGE BLOCKED · STATS WILL NOT PERSIST',W/2,H-38,12,store?'#c9c4ae':'#ff8c42');
  footer('SWITCH SIDE: Q      MOVE: W/S      CHANGE: A/D      SELECT: SPACE / ENTER      BACK: ESC');
}
function drawName(){
  drawProfiles();
  cx.fillStyle='rgba(28,30,51,.86)';cx.fillRect(0,0,W,H);
  panel(W/2-260,220,520,160,prof(profTeam).color,16);
  label('ENTER A NAME',W/2,235,15,'#fff');
  const txt=typeBuf+((frame>>4)%2?'_':'');
  cx.fillStyle=INK;cx.font='900 34px system-ui,Arial,sans-serif';cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText(txt||'_',W/2,300);
  label('TYPE UP TO 12 CHARACTERS  ·  ENTER TO SAVE',W/2,350,12,'#8a8672');
}

/* ---------------- online lobby ---------------- */
function drawOnline(){
  screenBg();
  splash('ONLINE PLAY',46,64);
  panel(W/2-320,130,640,300,'#3d7ea6',16);
  label('NOT AVAILABLE IN THIS BUILD',W/2,145,14,'#fff');
  const lines=[
    'This page is sandboxed and cannot open a network connection,',
    'so online play only works in the self-hosted build of the game.',
    '',
    'You have been given tank-smashdown-online.html plus relay-server.js:',
    'host the page anywhere free (GitHub Pages, Cloudflare Pages, Netlify)',
    'and run the small relay server, then Online mode connects with a',
    '4-letter room code: one player hosts, the other joins.',
    '',
    'Everything else works right here: campaign, bot duels and co-op 1v1.',
  ];
  lines.forEach((l,i)=>label(l,W/2,196+i*24,l?14:8,i>=3&&i<=6?INK:'#8a8672'));
  footer('BACK: SPACE / ENTER / ESC');
}

/* ---------------- tank select ---------------- */
function drawSelect(){
  screenBg();
  const solo=participants()===1;
  splash(solo?'CHOOSE YOUR TANK':'CHOOSE YOUR TANKS',40,40);
  const cw=300,ch=142,gapx=14,gapy=11,x0=(W-3*cw-2*gapx)/2,y0=74;
  for(let i=0;i<9;i++){
    const col=i%3,row=(i/3)|0,x=x0+col*(cw+gapx),y=y0+row*(ch+gapy),c=CLASSES[i];
    panel(x,y,cw,ch,c.color,12);
    label(c.name,x+cw/2,y+14,14,'#fff');
    cx.save();cx.translate(x+52,y+80);cx.scale(.9,.9);
    drawTankBody({x:0,y:0,ang:0,cls:c,recoil:0});
    cx.restore();
    const labels=['SPD','ARM','POW'];
    for(let s=0;s<3;s++){
      const ly=y+42+s*19;
      label(labels[s],x+104,ly,10,INK,'left');
      for(let p=0;p<5;p++){
        cx.fillStyle=p<c.pips[s]?c.color:'#d8cbb4';
        cx.beginPath();cx.arc(x+140+p*15,ly,4.8,0,Math.PI*2);cx.fill();
        cx.lineWidth=1.5;cx.strokeStyle=INK;cx.stroke();
      }
    }
    label(c.desc,x+104,y+108,11,INK,'left');
    label('HP '+c.hp,x+104,y+126,10,'#8a8672','left');
    // lock overlay
    const p0=prof(0),p1=prof(1);
    const lockedFor=[!isUnlocked(i,p0),!isUnlocked(i,p1)];
    if(lockedFor[0]&&(solo||lockedFor[1])){
      cx.fillStyle='rgba(28,30,51,.72)';rr(cx,x,y,cw,ch,12);cx.fill();
      cx.strokeStyle=INK;cx.lineWidth=3.5;rr(cx,x,y,cw,ch,12);cx.stroke();
      cx.fillStyle=CREAM;rr(cx,x+cw/2-13,y+ch/2-8,26,22,5);cx.fill();
      cx.strokeStyle=INK;cx.lineWidth=3;rr(cx,x+cw/2-13,y+ch/2-8,26,22,5);cx.stroke();
      cx.beginPath();cx.arc(x+cw/2,y+ch/2-8,8,Math.PI,0);cx.lineWidth=3.5;cx.stroke();
      label(c.unlock?c.unlock.txt:'LOCKED',x+cw/2,y+ch-24,11,'#ffd166');
    }
    for(let p=0;p<participants();p++){
      if(sel[p].i!==i)continue;
      const off=p===0?3:(sel[0].i===sel[1].i?9:3),col2=prof(p).color;
      cx.strokeStyle=col2;cx.lineWidth=5;
      rr(cx,x-off,y-off,cw+off*2,ch+off*2,14);cx.stroke();
      cx.fillStyle=col2;rr(cx,x-off+(p===0?0:cw-52),y-off-10,54,20,8);cx.fill();
      cx.lineWidth=2.5;cx.strokeStyle=INK;rr(cx,x-off+(p===0?0:cw-52),y-off-10,54,20,8);cx.stroke();
      label((sel[p].locked?'✔ ':'')+prof(p).name.slice(0,6),x-off+(p===0?27:cw-25),y-off,10,'#fff');
    }
  }
  // opponent strip
  const y2=H-46;
  if(mode==='duel'){
    label('OPPONENT: CPU '+CLASSES[sel[1].i].name+'  ·  '+AI_LEVELS[aiLevel].name,W/2,y2-14,14,'#ffd166');
  }else if(mode==='campaign'){
    const st=campaignStage(campStage);
    label('STAGE '+(campStage+1)+'  ·  '+MAPS[st.map].name+'  ·  CPU '+CLASSES[st.cls].name+'  ·  '+AI_LEVELS[st.ai].name,W/2,y2-14,14,'#ffd166');
  }
  if(allLocked())splash("LET'S GO!!",34,y2+8,-.03,'#ffd166');
  else footer('MOVE: WASD / ARROWS      LOCK IN: SPACE / ENTER      BACK: ESC');
  drawToast();
}

/* ---------------- in-game overlays ---------------- */
function drawGameplay(){
  const m=MAPS[mapIndex];
  drawArenaFrame();
  hudPlate(tanks[0],true);hudPlate(tanks[1],false);
  if(state==='ready'){
    tanks.forEach(drawTeamTag);
    const e=Math.min(1,(110-timer)/22),bx=-340+(W/2+170+340)*(1-Math.pow(1-e,3));
    panel(bx-330,14,330,44,null,12);
    label(m.name,bx-165,30,17,INK);
    const line=mode==='campaign'?('STAGE '+(campStage+1)+'/'+MAPS.length+'  ·  ONE KO WINS'):
      (m.world.toUpperCase()+' WORLD  ·  STAGE '+(mapIndex+1)+'/'+MAPS.length+'  ·  FIRST TO '+WIN_SCORE);
    label(line,bx-165,46,11,'#8a8672');
    const num=timer>70?'3':timer>40?'2':timer>15?'1':'GO!!';
    const col=timer>70?'#ef3e4a':timer>40?'#ffd23f':timer>15?'#35a44a':'#ffd166';
    const band=timer>70?(timer-70)/40:timer>40?(timer-40)/30:timer>15?(timer-15)/25:timer/15;
    const pop=1+Math.max(0,band-.72)*2.4;
    cx.save();cx.translate(W/2,H/2-20);cx.scale(pop,pop);cx.translate(-W/2,-(H/2-20));
    splash(num,num==='GO!!'?96:120,H/2-20,-.03,col);
    cx.restore();
    if(timer>15)label('AIM IS AUTOMATIC · GET CLOSE AND HOLD FIRE',W/2,H/2+64,13,'#fff');
  }else{
    panel(W/2-130,8,260,26,null,9);
    const goal=mode==='campaign'?'ONE KO WINS':'FIRST TO '+WIN_SCORE;
    label(m.name+'  ·  '+(mode==='campaign'?('STAGE '+(campStage+1)):((mapIndex+1)+'/'+MAPS.length))+'  ·  '+goal,W/2,21,12,INK);
  }
  if(state==='round'){
    splash(roundWinner.tag+' TAKES THE ROUND!',52,H/2-40,-.035,roundWinner.teamColor);
    splash('★',40,H/2+22,0,'#ffd166');
  }else if(state==='game'){
    cx.fillStyle='rgba(34,35,59,.45)';cx.fillRect(0,0,W,H);
    for(const c of conf){
      cx.save();cx.translate(c.x,c.y);cx.rotate(c.rot);
      cx.fillStyle=c.color;cx.fillRect(-c.w/2,-c.h/2,c.w,c.h);
      cx.restore();
    }
    cx.beginPath();cx.arc(W/2,H/2-166,56,0,Math.PI*2);cx.lineWidth=8;cx.strokeStyle=roundWinner.teamColor;cx.stroke();
    drawBadge(W/2,H/2-166,52,roundWinner.cls,roundWinner.teamColor,'win',0,0);
    if(mode==='campaign'){
      const won=roundWinner.human;
      splash(campResult==='COMPLETE'?'CAMPAIGN COMPLETE!':won?'STAGE CLEARED!':'STAGE FAILED',
        campResult==='COMPLETE'?72:80,H/2-48,-.05,won?'#ffd166':'#ef3e4a');
      splash(won?(campResult==='COMPLETE'?'ALL 16 ARENAS BEATEN':'NEXT: STAGE '+(campStage+2)):'RETRY STAGE '+(campStage+1),
        34,H/2+30,-.035,roundWinner.teamColor);
    }else{
      splash('GAME!',100,H/2-48,-.05,'#ffd166');
      splash((roundWinner.name||roundWinner.tag)+' WINS!',44,H/2+30,-.035,roundWinner.teamColor);
    }
    if(timer<=0&&(frame/30|0)%2===0)
      splash(mode==='campaign'?'SPACE: CONTINUE   ·   ESC: MENU':'SPACE: PLAY AGAIN   ·   ESC: MENU',24,H/2+92,0);
    drawToast();
  }
}
function draw(){
  cx.save();
  if(shake>.4)cx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  cx.clearRect(-20,-20,W+40,H+40);
  if(state==='title')drawTitle();
  else if(state==='mode')drawMode();
  else if(state==='difficulty')drawDifficulty();
  else if(state==='campmenu')drawCampMenu();
  else if(state==='profiles')drawProfiles();
  else if(state==='name')drawName();
  else if(state==='online')drawOnline();
  else if(state==='select')drawSelect();
  else{
    if(state==='round'&&timer>110){
      const z=1+.35*((timer-110)/30);
      cx.translate(ko.x,ko.y);cx.scale(z,z);cx.translate(-ko.x,-ko.y);
    }
    drawGameplay();
  }
  cx.restore();
}

/* ---------------- main loop (fixed 60Hz) ---------------- */
let last=performance.now(),acc=0;
function loop(now){
  acc+=Math.min(100,now-last);last=now;
  while(acc>=1000/60){step();acc-=1000/60}
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
