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
  // parade of tanks rolling across the very top, out of everything's way
  for(let i=0;i<2;i++){
    const c=CLASSES[(i*4+2)%CLASSES.length];
    const x=((frame*(.55+i*.2)+i*340)%(W+240))-120;
    cx.save();cx.globalAlpha=.3;
    drawTankBody({x,y:46+i*30,ang:0,cls:c,recoil:0,dist:frame*2});
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
  for(const [side,ci,team] of [[-1,1,0],[1,3,1]]){
    cx.save();cx.translate(W/2+side*150,352);cx.scale(2,2);
    drawTankBody({x:0,y:0,ang:side<0?.1:Math.PI-.1,cls:CLASSES[ci],teamColor:TEAMS[team].color,recoil:0,dist:frame});
    cx.restore();
  }
  // roster strip: the whole garage, two rows
  const cw=62,x0=W/2-(CLASSES.length*cw)/2;
  for(let i=0;i<CLASSES.length;i++){
    const c=CLASSES[i],y=452+bounce(i*.7,.09);
    drawBadge(x0+i*cw+cw/2,y,20,c,null,'',0,0);
  }
  label(MAPS.length+' ARENAS   ·   '+CLASSES.length+' TANKS   ·   '+POWERS.length+' POWERUPS',W/2,524,13,'#c9c4ae');
  if((frame/30|0)%2===0){
    cx.save();cx.translate(0,Math.sin(frame*.14)*2);
    splash('PRESS SPACE OR ENTER',24,554,0,'#ffd166');
    cx.restore();
  }
  footer(TOUCH.on?'TAP TO START   ·   ⛶ FOR FULLSCREEN':'P1: WASD + SPACE   ·   P2: ARROWS + ENTER   ·   AUTO-AIM ON   ·   F: FULLSCREEN   ·   N: MUSIC');
}
/* ---------------- mode select ---------------- */
function modeIcon(kind,x,y,r,col){
  cx.save();cx.translate(x,y);
  cx.lineWidth=3;cx.strokeStyle=INK;cx.fillStyle=col;
  if(kind==='duel'||kind==='vs'){
    cx.beginPath();cx.arc(-r*.45,0,r*.42,0,Math.PI*2);cx.fill();cx.stroke();
    cx.fillStyle=kind==='vs'?'#35a44a':'#8a8672';
    cx.beginPath();cx.arc(r*.45,0,r*.42,0,Math.PI*2);cx.fill();cx.stroke();
  }else if(kind==='flag'){
    cx.beginPath();cx.moveTo(-r*.4,r*.6);cx.lineTo(-r*.4,-r*.7);cx.stroke();
    cx.beginPath();cx.moveTo(-r*.4,-r*.7);cx.lineTo(r*.6,-r*.35);cx.lineTo(-r*.4,0);cx.closePath();
    cx.fill();cx.stroke();
  }else if(kind==='wave'){
    for(let i=0;i<3;i++){
      cx.globalAlpha=1-i*.25;
      cx.beginPath();cx.arc(0,0,r*(.35+i*.28),Math.PI*.15,Math.PI*.85);cx.lineWidth=4;
      cx.strokeStyle=col;cx.stroke();
    }
    cx.globalAlpha=1;
  }else if(kind==='ball'){
    cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,r*.7,0,Math.PI*2);cx.fill();cx.stroke();
    cx.fillStyle=INK;
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;cx.beginPath();cx.arc(Math.cos(a)*r*.38,Math.sin(a)*r*.38,r*.15,0,Math.PI*2);cx.fill()}
    cx.beginPath();cx.arc(0,0,r*.18,0,Math.PI*2);cx.fill();
  }else if(kind==='zone'){
    cx.setLineDash([6,5]);cx.strokeStyle=col;cx.lineWidth=4;
    cx.beginPath();cx.arc(0,0,r*.72,0,Math.PI*2);cx.stroke();cx.setLineDash([]);
    cx.fillStyle=col;cx.beginPath();cx.arc(0,0,r*.28,0,Math.PI*2);cx.fill();
  }else if(kind==='boss'){
    cx.beginPath();cx.moveTo(0,-r*.8);cx.lineTo(r*.75,-r*.2);cx.lineTo(r*.5,r*.7);
    cx.lineTo(-r*.5,r*.7);cx.lineTo(-r*.75,-r*.2);cx.closePath();cx.fill();cx.stroke();
    cx.fillStyle='#ffd166';
    cx.beginPath();cx.arc(-r*.25,0,r*.13,0,Math.PI*2);cx.arc(r*.25,0,r*.13,0,Math.PI*2);cx.fill();
  }else if(kind==='net'){
    cx.beginPath();cx.arc(0,0,r*.72,0,Math.PI*2);cx.stroke();
    cx.beginPath();cx.ellipse(0,0,r*.32,r*.72,0,0,Math.PI*2);cx.stroke();
    cx.beginPath();cx.moveTo(-r*.72,0);cx.lineTo(r*.72,0);cx.stroke();
  }else if(kind==='card'){
    rr(cx,-r*.8,-r*.55,r*1.6,r*1.1,5);cx.fill();cx.stroke();
    cx.fillStyle=CREAM;cx.beginPath();cx.arc(-r*.35,-r*.05,r*.25,0,Math.PI*2);cx.fill();
    cx.fillRect(r*.02,-r*.2,r*.62,r*.12);cx.fillRect(r*.02,r*.02,r*.45,r*.12);
  }
  cx.restore();
}
function drawMode(){
  screenBg('#232744');
  splash('CHOOSE A MODE',40,42);
  const cw=280,ch=124,gx=14,gy=13,x0=(W-3*cw-2*gx)/2,y0=78;
  MODES.forEach((m,i)=>{
    const col=i%3,row=(i/3)|0,x=x0+col*(cw+gx),y=y0+row*(ch+gy),on=i===menuIdx;
    if(on)selectRing(x,y,cw,ch,m.col,16);
    panel(x,y,cw,ch,m.col,16);
    modeIcon(m.icon,x+50,y+74,26,m.col);
    label(m.title,x+90,y+17,14,'#fff','left');
    label(m.sub,x+90,y+62,11.5,INK,'left');
    if(m.two)label('1 OR 2 PLAYERS',x+90,y+84,9.5,'#8a8672','left');
    else label(m.id==='profiles'?'SAVED LOCALLY':'ONE PLAYER',x+90,y+84,9.5,'#8a8672','left');
    const p=prof(0);
    let badge='';
    if(m.id==='survival'&&(p.stats.bestWave|0))badge='BEST WAVE '+p.stats.bestWave;
    if(m.id==='campaign')badge=(p.stats.campaign|0)+'/'+MAPS.length;
    if(m.id==='boss'&&(p.stats.bosses|0))badge=p.stats.bosses+' DOWNED';
    if(badge)label(badge,x+cw-12,y+84,9.5,m.col,'right');
  });
  label('P1: '+prof(0).name+'   ·   P2: '+prof(1).name,W/2,H-42,12,'#c9c4ae');
  footer(TOUCH.on?'TAP A MODE, TAP AGAIN TO GO':'MOVE: WASD / ARROWS      SELECT: SPACE / ENTER      BACK: ESC');
  drawToast();
}
/* ---------------- how many players ---------------- */
function drawPlayers(){
  screenBg('#232744');
  const m=MODES.find(x=>x.id===mode)||MODES[0];
  splash(m.title,46,60,-.03,m.col);
  label(m.sub,W/2,104,15,'#c9c4ae');
  const cards=[
    {t:'SOLO',s:mode==='ball'||mode==='zone'?'YOU VS A BOT':'ONE PLAYER, ALL THE BOTS',n:1},
    {t:'TWO PLAYERS',s:mode==='ball'||mode==='zone'?'HEAD TO HEAD':'CO-OP ON ONE KEYBOARD',n:2},
  ];
  cards.forEach((c,i)=>{
    const cw=300,ch=190,x=W/2-cw-20+i*(cw+40),y=150,on=i===subIdx;
    if(on)selectRing(x,y,cw,ch,m.col,16);
    panel(x,y,cw,ch,m.col,16);
    label(c.t,x+cw/2,y+17,16,'#fff');
    for(let p=0;p<c.n;p++){
      cx.save();cx.translate(x+cw/2+(c.n===1?0:(p?46:-46)),y+96);cx.scale(1.25,1.25);
      drawTankBody({x:0,y:0,ang:p?Math.PI:0,cls:CLASSES[p?3:1],teamColor:TEAMS[p].color,recoil:0,dist:frame});
      cx.restore();
    }
    label(c.s,x+cw/2,y+156,12,INK);
  });
  footer('MOVE: A/D OR ARROWS      START: SPACE / ENTER      BACK: ESC');
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
      ['CAMPAIGN',s.campaign+' / '+MAPS.length],
      ['BEST WAVE',s.bestWave|0],['BEST SCORE',s.bestScore|0],
      ['OMEGA KILLS',s.bosses|0],
    ];
    rows.forEach((r,i)=>{
      const ry=y+146+i*22;
      label(r[0],x+24,ry,12,'#8a8672','left');
      cx.font='800 14px system-ui,Arial,sans-serif';cx.textAlign='right';
      cx.fillStyle=INK;cx.fillText(String(r[1]),x+w-24,ry);
    });
    let fav='-',best=0;
    for(const k in s.plays)if(s.plays[k]>best){best=s.plays[k];fav=k}
    label('FAVOURITE TANK',x+24,y+300,12,'#8a8672','left');
    cx.font='800 14px system-ui,Arial,sans-serif';cx.textAlign='right';cx.fillStyle=INK;
    cx.fillText(fav,x+w-24,y+300);
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

/* ---------------- tank select: the garage ---------------- */
function drawSelect(){
  screenBg('#222741');
  splash('CHOOSE YOUR TANK',34,28);
  const cw=204,ch=124,gapx=12,rowGap=24,x0=(W-4*cw-3*gapx)/2,y0=70;
  for(let i=0;i<CLASSES.length;i++){
    const col=i%4,row=(i/4)|0,c=CLASSES[i];
    const x=x0+col*(cw+gapx),y=y0+row*(ch+rowGap);
    if(col===0)label(TABS[row],x0+2,y-11,11,'#9aa0b8','left');
    const p0=prof(0),p1=prof(1);
    const lockedAll=!isUnlocked(i,p0)&&(participants()===1||!isUnlocked(i,p1));
    panel(x,y,cw,ch,c.color,14);
    cx.fillStyle='#fff';cx.font='900 13px system-ui,Arial,sans-serif';
    cx.textAlign='left';cx.textBaseline='middle';
    cx.lineWidth=3;cx.strokeStyle=INK;
    cx.strokeText(c.name,x+12,y+16);cx.fillText(c.name,x+12,y+16);
    // the tank itself, big enough to read its shape
    cx.save();cx.translate(x+54,y+76);cx.scale(1.35,1.35);
    drawTankBody({x:0,y:0,ang:-.35,cls:c,recoil:0,dist:frame*1.5});
    cx.restore();
    const labels=['SPD','ARM','POW'];
    for(let s2=0;s2<3;s2++){
      const ly=y+44+s2*20;
      label(labels[s2],x+106,ly,9,'#8a8672','left');
      for(let q=0;q<5;q++){
        cx.fillStyle=q<c.pips[s2]?c.color:'#d8cbb4';
        cx.beginPath();cx.arc(x+134+q*13,ly,4.2,0,Math.PI*2);cx.fill();
        cx.lineWidth=1.4;cx.strokeStyle=INK;cx.stroke();
      }
    }
    label('HP '+c.hp,x+cw-12,y+16,10,'rgba(255,255,255,.85)','right');
    label(c.desc,x+12,y+ch-14,9.5,INK,'left');
    if(lockedAll){
      cx.fillStyle='rgba(22,24,42,.78)';rr(cx,x,y,cw,ch,14);cx.fill();
      cx.strokeStyle=INK;cx.lineWidth=3.5;rr(cx,x,y,cw,ch,14);cx.stroke();
      cx.fillStyle=CREAM;rr(cx,x+cw/2-11,y+ch/2-4,22,18,4);cx.fill();
      cx.lineWidth=2.5;cx.strokeStyle=INK;rr(cx,x+cw/2-11,y+ch/2-4,22,18,4);cx.stroke();
      cx.strokeStyle=CREAM;cx.lineWidth=3;
      cx.beginPath();cx.arc(x+cw/2,y+ch/2-4,7,Math.PI,0);cx.stroke();
      label(c.unlock?c.unlock.txt:'LOCKED',x+cw/2,y+ch-22,9.5,'#ffd166');
    }
    for(let p=0;p<participants();p++){
      if(sel[p].i!==i)continue;
      const off=p===0?4:(sel[0].i===sel[1].i?10:4),col2=prof(p).color;
      selectRing(x-off+4,y-off+4,cw+off*2-8,ch+off*2-8,col2,14);
      cx.fillStyle=col2;rr(cx,x-off+(p===0?-2:cw-44),y-off-10,50,20,8);cx.fill();
      cx.lineWidth=2.5;cx.strokeStyle=INK;rr(cx,x-off+(p===0?-2:cw-44),y-off-10,50,20,8);cx.stroke();
      label((sel[p].locked?'✔':'')+prof(p).name.slice(0,5),x-off+(p===0?23:cw-19),y-off,9.5,'#fff');
    }
  }
  // the highlighted tank explained
  const p2=participants()===2&&sel[0].locked?1:0;
  const c2=CLASSES[sel[p2].i];
  panel(14,H-84,W-28,40,c2.color,12);
  label(c2.name+'  ·  '+c2.desc,26,H-64,13,'#fff','left');
  label('★ '+c2.perk,W-26,H-64,12,'#fff','right');
  if(allLocked())splash("LET'S GO!!",30,H-16,-.03,'#ffd166');
  else{
    const bx=W/2-110,by=H-40,bw=220,bh=34;
    cx.fillStyle='rgba(12,14,26,.4)';rr(cx,bx+3,by+4,bw,bh,17);cx.fill();
    const g=cx.createLinearGradient(0,by,0,by+bh);
    g.addColorStop(0,shade(prof(p2).color,.3));g.addColorStop(1,prof(p2).color);
    cx.fillStyle=g;rr(cx,bx,by,bw,bh,17);cx.fill();
    cx.lineWidth=3.5;cx.strokeStyle=INK;rr(cx,bx,by,bw,bh,17);cx.stroke();
    label('LOCK IN '+prof(p2).name.slice(0,8),W/2,by+bh/2+1,14,'#fff');
  }
  drawToast();
}

/* ---------------- in-game overlays ---------------- */
function drawAnnounce(){
  if(!ann)return;
  const f=ann.life/ann.t0,pop=1+Math.max(0,(f-.82))*2.2;
  cx.save();cx.globalAlpha=Math.min(1,f*3);
  cx.translate(W/2,150);cx.scale(pop,pop);
  splash(ann.txt,44,0,-.02,ann.color);
  cx.restore();
}
function drawRunHud(){
  const k=kindOf();
  panel(W/2-150,8,300,44,null,12);
  // lives as little tank hearts
  for(let i=0;i<Math.max(0,lives);i++){
    const hx=W/2-150+18+i*20,hy=66;
    cx.fillStyle='#ef3e4a';cx.beginPath();
    cx.moveTo(hx,hy+4);cx.bezierCurveTo(hx-8,hy-4,hx-3,hy-9,hx,hy-4);
    cx.bezierCurveTo(hx+3,hy-9,hx+8,hy-4,hx,hy+4);cx.fill();
    cx.lineWidth=2;cx.strokeStyle=INK;cx.stroke();
  }
  if(k==='survival'){
    label('WAVE',W/2-118,22,10,'#8a8672');
    cx.fillStyle=INK;cx.font='900 20px system-ui,Arial,sans-serif';
    cx.textAlign='center';cx.textBaseline='middle';cx.fillText(String(wave),W/2-118,39);
    label('SCORE',W/2+10,22,10,'#8a8672');
    cx.fillStyle=INK;cx.font='900 20px system-ui,Arial,sans-serif';
    cx.fillText(String(score),W/2+10,39);
    const foes=tanks.filter(t=>t.side===1&&!t.dead).length;
    label('LEFT',W/2+118,22,10,'#8a8672');
    cx.fillStyle=foes?'#ef3e4a':'#35a44a';cx.font='900 20px system-ui,Arial,sans-serif';
    cx.fillText(String(foes),W/2+118,39);
  }else{
    const b=tanks.find(t=>t.boss);
    label(b?'OMEGA · PHASE '+b.phase:'OMEGA DOWN',W/2,20,11,'#8a8672');
    const bw=260,bx=W/2-bw/2,by=30,f=b?Math.max(0,b.hp/b.maxHp):0;
    cx.fillStyle='#d8cbb4';rr(cx,bx,by,bw,14,7);cx.fill();
    const g=cx.createLinearGradient(bx,0,bx+bw,0);
    g.addColorStop(0,'#7b2d26');g.addColorStop(1,'#ef3e4a');
    cx.fillStyle=g;rr(cx,bx+1.5,by+1.5,Math.max(0,(bw-3)*f),11,5);cx.fill();
    cx.lineWidth=2.5;cx.strokeStyle=INK;rr(cx,bx,by,bw,14,7);cx.stroke();
  }
}
function drawBallHud(){
  panel(W/2-108,8,216,46,null,12);
  for(let i=0;i<2;i++){
    const x=W/2+(i?54:-54);
    cx.fillStyle=teamColor(i);cx.font='900 30px system-ui,Arial,sans-serif';
    cx.textAlign='center';cx.textBaseline='middle';cx.fillText(String(goals[i]),x,32);
  }
  label('FIRST TO '+BALL_TARGET,W/2,32,10,'#8a8672');
}
function drawZoneHud(){
  panel(W/2-160,8,320,44,null,12);
  for(let i=0;i<2;i++){
    const bw=130,bx=W/2+(i?18:-148),by=26;
    cx.fillStyle='#d8cbb4';rr(cx,bx,by,bw,15,7);cx.fill();
    cx.fillStyle=teamColor(i);rr(cx,bx+1.5,by+1.5,Math.max(0,(bw-3)*caps[i]/100),12,5);cx.fill();
    cx.lineWidth=2.5;cx.strokeStyle=INK;rr(cx,bx,by,bw,15,7);cx.stroke();
    label((tanks[i]&&tanks[i].name||('P'+(i+1))).slice(0,10),bx+bw/2,18,9.5,'#8a8672');
  }
  label('HOLD',W/2,34,10,'#8a8672');
}
function drawGameplay(){
  const m=MAPS[mapIndex];
  drawArenaFrame();
  const k=kindOf();
  if(k==='survival'||k==='boss'){
    const ps=players();
    if(ps[0])hudPlate(ps[0],true);
    if(ps[1])hudPlate(ps[1],false);
    drawRunHud();
  }else{
    if(tanks[0])hudPlate(tanks[0],true);
    if(tanks[1])hudPlate(tanks[1],false);
    if(k==='ball')drawBallHud();
    if(k==='zone')drawZoneHud();
  }
  drawAnnounce();
  if(state==='ready'){
    tanks.forEach(drawTeamTag);
    const e=Math.min(1,(110-timer)/22),bx=-340+(W/2+170+340)*(1-Math.pow(1-e,3));
    if(isRounds())panel(bx-330,14,330,44,null,12);
    if(isRounds()){
      label(m.name,bx-165,30,17,INK);
      const line=mode==='campaign'?('STAGE '+(campStage+1)+'/'+MAPS.length+'  ·  ONE KO WINS'):
        (m.world.toUpperCase()+' WORLD  ·  STAGE '+(mapIndex+1)+'/'+MAPS.length+'  ·  FIRST TO '+WIN_SCORE);
      label(line,bx-165,46,11,'#8a8672');
    }
    const num=timer>70?'3':timer>40?'2':timer>15?'1':'GO!!';
    const col=timer>70?'#ef3e4a':timer>40?'#ffd23f':timer>15?'#35a44a':'#ffd166';
    const band=timer>70?(timer-70)/40:timer>40?(timer-40)/30:timer>15?(timer-15)/25:timer/15;
    const pop=1+Math.max(0,band-.72)*2.4;
    cx.save();cx.translate(W/2,H/2-20);cx.scale(pop,pop);cx.translate(-W/2,-(H/2-20));
    splash(num,num==='GO!!'?96:120,H/2-20,-.03,col);
    cx.restore();
    if(timer>15)label('AIM IS AUTOMATIC · GET CLOSE AND HOLD FIRE',W/2,H/2+64,13,'#fff');
  }else if(isRounds()){
    panel(W/2-130,8,260,26,null,9);
    const goal=mode==='campaign'?'ONE KO WINS':'FIRST TO '+WIN_SCORE;
    label(m.name+'  ·  '+(mode==='campaign'?('STAGE '+(campStage+1)):((mapIndex+1)+'/'+MAPS.length))+'  ·  '+goal,W/2,21,12,INK);
  }else{
    // mode HUDs live at the top, so the arena name sits quietly in the corner
    label(m.name,14,H-88,10.5,'rgba(255,255,255,.5)','left');
  }
  if(state==='round'){
    const loser=tanks[1-roundWinner.team];
    if(loser){
      for(let k=0;k<3;k++){
        const a=frame*.09+k*2.09;
        cx.save();cx.translate(ko.x+Math.cos(a)*26,ko.y-8+Math.sin(a)*9);
        cx.rotate(a);
        cx.fillStyle='#ffd166';cx.strokeStyle=INK;cx.lineWidth=2;
        cx.beginPath();
        for(let i=0;i<10;i++){const r2=i%2?3:7,aa=i/10*Math.PI*2;cx.lineTo(Math.cos(aa)*r2,Math.sin(aa)*r2)}
        cx.closePath();cx.fill();cx.stroke();cx.restore();
      }
    }
    splash(roundWinner.tag+' TAKES THE ROUND!',52,H/2-40,-.035,roundWinner.teamColor);
    splash('★',40,H/2+22,0,'#ffd166');
  }else if(state==='game'){
    cx.fillStyle='rgba(34,35,59,.45)';cx.fillRect(0,0,W,H);
    const k2=kindOf();
    if(k2==='survival'||k2==='boss'){
      const won=k2==='boss'&&!tanks.some(t=>t.boss&&!t.dead);
      splash(won?'OMEGA DOWN!':k2==='survival'?'RUN OVER':'WIPED OUT',86,H/2-70,-.04,won?'#ffd166':'#ef3e4a');
      if(k2==='survival'){
        splash('WAVE '+(wave-1)+' REACHED',40,H/2+6,-.02,'#fff');
        splash('SCORE '+score,32,H/2+52,0,'#c9c4ae');
        const best=prof(0).stats.bestWave|0;
        if(wave-1>=best&&best>0)splash('NEW BEST!',26,H/2+90,0,'#35a44a');
      }else{
        splash(won?('SCORE '+score):'OMEGA SURVIVED',32,H/2+16,0,'#c9c4ae');
      }
      if(timer<=0&&(frame/30|0)%2===0)
        splash(TOUCH.on?'TAP TO PLAY AGAIN':'SPACE: PLAY AGAIN   ·   ESC: MENU',22,H/2+130,0);
      drawToast();cx.restore();return;
    }
    if(k2==='ball'||k2==='zone'){
      const win=roundWinner;
      splash(k2==='ball'?'FULL TIME!':'ZONE SECURED!',80,H/2-70,-.04,'#ffd166');
      splash((win&&win.name||'PLAYER')+' WINS',42,H/2+6,-.02,win?win.teamColor:'#fff');
      if(k2==='ball')splash(goals[0]+' - '+goals[1],34,H/2+54,0,'#c9c4ae');
      if(timer<=0&&(frame/30|0)%2===0)
        splash(TOUCH.on?'TAP TO PLAY AGAIN':'SPACE: PLAY AGAIN   ·   ESC: MENU',22,H/2+110,0);
      drawToast();cx.restore();return;
    }

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
  else if(state==='players')drawPlayers();
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

/* ---------------- touch overlay: stick, fire, corner buttons ---------------- */
function drawTapFlash(){
  const f=TOUCH.flash;
  if(!f)return;
  const k=1-f.life/16;
  cx.save();cx.globalAlpha=(1-k)*.55;
  cx.strokeStyle='#fff';cx.lineWidth=3;
  cx.beginPath();cx.arc(f.x,f.y,12+k*26,0,Math.PI*2);cx.stroke();
  cx.restore();
}
function drawTouchUI(){
  drawTapFlash();
  if(!TOUCH.on)return;
  cx.save();
  // phone co-op: a stick per side and a soft centre line
  if(mode==='coop'&&!menuish()){
    cx.globalAlpha=.12;cx.strokeStyle='#fff';cx.lineWidth=2;cx.setLineDash([8,10]);
    cx.beginPath();cx.moveTo(W/2,40);cx.lineTo(W/2,H-90);cx.stroke();cx.setLineDash([]);
    if(TOUCH.j2id!==null){
      cx.globalAlpha=.35;cx.fillStyle='#fff';
      cx.beginPath();cx.arc(TOUCH.ax2,TOUCH.ay2,52,0,Math.PI*2);cx.fill();
      cx.globalAlpha=.85;cx.fillStyle=teamColor(1);
      cx.beginPath();cx.arc(TOUCH.ax2+TOUCH.dx2,TOUCH.ay2+TOUCH.dy2,24,0,Math.PI*2);cx.fill();
      cx.lineWidth=3;cx.strokeStyle=INK;cx.stroke();
    }
  }
  // pop-up joystick
  if(TOUCH.jid!==null&&!menuish()){
    cx.globalAlpha=.35;cx.fillStyle='#fff';
    cx.beginPath();cx.arc(TOUCH.ax,TOUCH.ay,52,0,Math.PI*2);cx.fill();
    cx.globalAlpha=.5;cx.lineWidth=3;cx.strokeStyle=INK;cx.stroke();
    cx.globalAlpha=.85;cx.fillStyle=teamColor(0);
    cx.beginPath();cx.arc(TOUCH.ax+TOUCH.dx,TOUCH.ay+TOUCH.dy,24,0,Math.PI*2);cx.fill();
    cx.lineWidth=3;cx.strokeStyle=INK;cx.stroke();
  }
  // fire button during play (solo modes; co-op auto-fires)
  if(!menuish()&&mode!=='coop'){
    cx.globalAlpha=TOUCH.fire?.95:.5;
    const g=cx.createRadialGradient(FIRE_BTN.x,FIRE_BTN.y-8,6,FIRE_BTN.x,FIRE_BTN.y,FIRE_BTN.r);
    g.addColorStop(0,'#ff7d85');g.addColorStop(1,'#ef3e4a');
    cx.fillStyle=g;cx.beginPath();cx.arc(FIRE_BTN.x,FIRE_BTN.y,FIRE_BTN.r,0,Math.PI*2);cx.fill();
    cx.lineWidth=4;cx.strokeStyle=INK;cx.stroke();
    cx.fillStyle='#fff';cx.font='900 15px system-ui,Arial,sans-serif';
    cx.textAlign='center';cx.textBaseline='middle';cx.fillText('FIRE',FIRE_BTN.x,FIRE_BTN.y+1);
  }
  // corner buttons
  cx.globalAlpha=.45;
  for(const [btn,glyph,show] of [[FS_BTN,'⛶',true],[BACK_BTN,'‹',menuish()&&state!=='title']]){
    if(!show)continue;
    cx.fillStyle='#1c1e33';cx.beginPath();cx.arc(btn.x,btn.y,btn.r,0,Math.PI*2);cx.fill();
    cx.lineWidth=2.5;cx.strokeStyle='rgba(255,255,255,.5)';cx.stroke();
    cx.fillStyle='#fff';cx.font='900 18px system-ui,Arial,sans-serif';
    cx.textAlign='center';cx.textBaseline='middle';cx.fillText(glyph,btn.x,btn.y+1);
  }
  cx.restore();cx.globalAlpha=1;
}
function drawRotatePrompt(){
  if(!TOUCH.on)return false;
  const iw=(typeof window!=='undefined'&&window.innerWidth)||W;
  const ih=(typeof window!=='undefined'&&window.innerHeight)||H;
  if(ih<=iw)return false;
  cx.fillStyle='#14162a';cx.fillRect(0,0,W,H);
  cx.save();cx.translate(W/2,H/2-40);cx.rotate(Math.sin(frame*.05)*.35+.35);
  cx.fillStyle='#1c1e33';rr(cx,-34,-58,68,116,12);cx.fill();
  cx.strokeStyle='#fff';cx.lineWidth=4;rr(cx,-34,-58,68,116,12);cx.stroke();
  cx.fillStyle='#4cc9f0';rr(cx,-26,-46,52,86,4);cx.fill();
  cx.restore();
  splash('ROTATE YOUR PHONE',40,H/2+80,-.02,'#ffd166');
  label('THIS IS A WIDESCREEN TANK BATTLE',W/2,H/2+120,13,'#c9c4ae');
  return true;
}
const _drawBase=draw;
draw=function(){
  if(drawRotatePrompt())return;
  _drawBase();drawTouchUI();
};

/* ---------------- main loop (fixed 60Hz) ---------------- */
let last=performance.now(),acc=0;
function loop(now){
  acc+=Math.min(100,now-last);last=now;
  while(acc>=1000/60){step();acc-=1000/60}
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
