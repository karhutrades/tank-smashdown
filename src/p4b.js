/* ================= GAME MODES =================
   Every mode reuses the same arena, tanks and weapons; what changes is the
   win condition, who spawns, and what extra object is on the field. */
const RULES={
  duel:    {kind:'rounds'},   campaign:{kind:'rounds'}, coop:{kind:'rounds'},
  online:  {kind:'rounds'},   survival:{kind:'survival'}, ball:{kind:'ball'},
  zone:    {kind:'zone'},     boss:{kind:'boss'},
};
const kindOf=()=>((RULES[mode]||RULES.duel).kind);
const isRounds=()=>kindOf()==='rounds';
const RESPAWN=110;

/* ---------------- shared: respawning instead of round-ending ---------------- */
function respawnPoint(t){
  const m=MAPS[mapIndex],s=m.spawns[t.team%m.spawns.length];
  let best={x:s[0]*T+T/2,y:s[1]*T+T/2},bd=-1;
  // pick the free tile furthest from the nearest enemy so you never respawn under a gun
  for(let tries=0;tries<60;tries++){
    const gx=1+(Math.random()*(COLS-2)|0),gy=1+(Math.random()*(ROWS-2)|0);
    if(cells[gy][gx]!=='.')continue;
    const x=gx*T+T/2,y=gy*T+T/2;
    let near=1e9;
    for(const o of tanks){if(o===t||o.side===t.side||o.hp<=0)continue;
      near=Math.min(near,Math.hypot(o.x-x,o.y-y))}
    if(near>bd){bd=near;best={x,y}}
    if(bd>320)break;
  }
  return best;
}
function reviveTank(t){
  const p=respawnPoint(t);
  t.x=p.x;t.y=p.y;
  resetTankState(t);
  t.inv=70;
  ring(t.x,t.y,t.teamColor||'#fff',7,5);burst(t.x,t.y,t.teamColor||'#fff',14,4);
}
function announce(txt,color,life){ann={txt,color:color||'#ffd166',life:life||110,t0:life||110}}

/* ---------------- death routing ---------------- */
function onDeath(t,src){
  ko={x:t.x,y:t.y};
  burst(t.x,t.y,t.cls.color,26,6);burst(t.x,t.y,'#ffd166',18,5);
  ring(t.x,t.y,'#fff',9,7);ring(t.x,t.y,t.cls.color,6,5);ring(t.x,t.y,'#ffd166',12,4);
  shake=14;hitstop=8;sKO();
  const k=kindOf();
  if(k==='rounds'){
    roundWinner=enemyOf(t)||tanks.find(o=>o!==t);
    if(roundWinner){roundWinner.score++;bumpStat(roundWinner.team,'kos')}
    bumpStat(0,'rounds');bumpStat(1,'rounds');
    jWin();state='round';timer=140;
    return;
  }
  t.dead=true;t.respawn=RESPAWN;t.hp=0;
  if(src&&src.human&&src.side!==t.side){src.kills=(src.kills||0)+1;bumpStat(src.team,'kos')}
  if(k==='survival'||k==='boss'){
    if(t.side===1){
      score+=t.bounty||100;
      if(k==='boss'&&t.boss){bossDown();return}
    }else{
      // players share a pool of lives; the run ends when it runs dry
      lives--;
      if(lives<=0&&!alliesOf(0).length)return endRun(false);
      if(lives>0)announce(lives+' LIVE'+(lives===1?'':'S')+' LEFT','#ef3e4a',90);
    }
  }
  if(k==='ball'){jWin()}
}
function endRun(won){
  matchDone=false;
  finishRun(won);
  state='game';timer=30;conf=[];
  if(won)jGame();else sBoom();
}
function finishRun(won){
  const p=prof(0);
  if(kindOf()==='survival'){
    if(wave-1>(p.stats.bestWave|0))p.stats.bestWave=wave-1;
    if(score>(p.stats.bestScore|0))p.stats.bestScore=score;
  }
  if(kindOf()==='boss'&&won)p.stats.bosses=(p.stats.bosses|0)+1;
  if(kindOf()==='ball'&&won)p.stats.goals=(p.stats.goals|0)+goals[0];
  if(kindOf()==='zone'&&won)p.stats.zones=(p.stats.zones|0)+1;
  saveProfiles();
}

/* ---------------- SURVIVAL: endless waves ---------------- */
const WAVE_CLASSES=[0,1,8,3,9,11,16,6,17,21,23];
function spawnWave(){
  const n=Math.min(6,1+Math.floor(wave/2));
  const lvl=wave<3?0:wave<7?1:2;
  for(let i=0;i<n;i++){
    const ci=WAVE_CLASSES[(wave*3+i*5)%WAVE_CLASSES.length];
    const bonus=Math.floor(wave/4);
    const e=makeTank(1,ci,false,AI_LEVELS[lvl],bonus,CPU_COLORS[(wave+i)%CPU_COLORS.length]);
    e.side=1;e.tag='CPU';e.teamColor='#ef3e4a';e.bounty=100+wave*10;
    const p=farSpawn();
    e.x=p.x;e.y=p.y;e.ang=Math.random()*6.28;e.tang=e.ang;
    resetTankState(e);
    tanks.push(e);
    ring(e.x,e.y,'#ef3e4a',6,4);
  }
  announce('WAVE '+wave,'#ffd166');
  sStar();
}
/* arenas for the free-for-all modes: skip the gate mazes */
function randomArena(){return newArena()}
function farSpawn(){
  let best={x:W/2,y:H/2},bd=-1;
  for(let i=0;i<70;i++){
    const gx=1+(Math.random()*(COLS-2)|0),gy=1+(Math.random()*(ROWS-2)|0);
    if(cells[gy][gx]!=='.')continue;
    const x=gx*T+T/2,y=gy*T+T/2;
    let near=1e9;
    for(const p of players())near=Math.min(near,Math.hypot(p.x-x,p.y-y));
    if(near>bd){bd=near;best={x,y}}
    if(bd>300)break;
  }
  return best;
}
function stepSurvival(){
  const foes=tanks.filter(o=>o.side===1&&!o.dead&&o.hp>0);
  if(!foes.length){
    if(waveTimer>0){
      if(--waveTimer===0){wave++;mapIndex=randomArena();startRound();spawnWave()}
    }else{
      waveTimer=150;announce('WAVE CLEARED','#35a44a');
      for(const p of players())if(!p.dead)p.hp=Math.min(p.maxHp,p.hp+1);
      score+=250;
    }
  }
  // pickups come thicker than in a duel
  if(pickupClock<=0){pickupClock=210;if(pickups.length<3)spawnPickup()}
}

/* ---------------- TANK BALL ---------------- */
function resetBall(kickTo){
  ball={x:W/2,y:H/2,vx:(kickTo||0)*1.5,vy:0,r:17,spin:0};
  for(const t of tanks)if(!t.dead)reviveTank(t);
}
function stepBall(){
  if(!ball)return;
  ball.x+=ball.vx;ball.y+=ball.vy;
  ball.vx*=.988;ball.vy*=.988;
  ball.spin+=ball.vx*.02;
  // walls
  if(hitCell(ball.x+ball.vx,ball.y,ball.r,'bullet',ball.vx,0,false)){ball.vx=-ball.vx*.8;sBounce()}
  if(hitCell(ball.x,ball.y+ball.vy,ball.r,'bullet',0,ball.vy,false)){ball.vy=-ball.vy*.8;sBounce()}
  ball.x=Math.max(ball.r+4,Math.min(W-ball.r-4,ball.x));
  ball.y=Math.max(ball.r+4,Math.min(H-ball.r-4,ball.y));
  // tanks shove it
  for(const t of tanks){
    if(t.dead||t.hp<=0)continue;
    const dx=ball.x-t.x,dy=ball.y-t.y,d=Math.hypot(dx,dy),min=ball.r+t.cls.radius;
    if(d<min&&d>0){
      const ux=dx/d,uy=dy/d,push=(min-d);
      ball.x+=ux*push;ball.y+=uy*push;
      const sp=Math.hypot(t.mvx,t.mvy)+1.6;
      ball.vx=ball.vx*.4+ux*sp*1.9;ball.vy=ball.vy*.4+uy*sp*1.9;
      if(Math.hypot(ball.vx,ball.vy)>4&&frame%6===0)sfx(300,180,.07,'square',.05);
    }
  }
  // shots knock it about
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];
    if(Math.hypot(b.x-ball.x,b.y-ball.y)<ball.r+b.r){
      const d=Math.hypot(b.vx,b.vy)||1;
      ball.vx+=b.vx/d*3.4;ball.vy+=b.vy/d*3.4;
      burst(b.x,b.y,'#fff',6,3);bullets.splice(i,1);sBounce();
    }
  }
  const sp=Math.hypot(ball.vx,ball.vy);
  if(sp>9){const k=9/sp;ball.vx*=k;ball.vy*=k}
  if(sp>2&&frame%3===0)parts.push({x:ball.x,y:ball.y,vx:0,vy:0,life:12,color:'#ffffff',size:3});
  // goal mouths sit INSIDE the arena wall so the ball can actually reach them
  const gy0=H/2-GOAL_H/2,gy1=H/2+GOAL_H/2;
  if(ball.y>gy0&&ball.y<gy1){
    if(ball.x<GOAL_D){scoreGoal(1);return}
    if(ball.x>W-GOAL_D){scoreGoal(0);return}
  }
  if(--ballClock<=0){
    // nobody scoring: the ball resets to the middle to keep it moving
    ballClock=60*40;resetBall(0);announce('RESET','#8a8672',70);
  }
}
function scoreGoal(team){
  goals[team]++;
  shake=16;flash=.6;jWin();
  for(let i=0;i<26;i++)ring(ball.x,ball.y,i%2?'#ffd166':'#fff',6+i*.3,4);
  burst(ball.x,ball.y,'#ffd166',30,6);
  announce((tanks.find(t=>t.team===team)?.name||('P'+(team+1)))+' SCORES!',team?'#35a44a':'#ef3e4a',150);
  ballClock=60*40;
  if(goals[team]>=BALL_TARGET){
    roundWinner=tanks.find(t=>t.team===team)||tanks[0];
    endRun(team===0||!!tanks.find(t=>t.team===team&&t.human));
    return;
  }
  ball=null;ballReset=90;
}

/* ---------------- ZONE CONTROL ---------------- */
function moveZone(){
  let best={x:W/2,y:H/2},bd=-1;
  for(let i=0;i<80;i++){
    const gx=3+(Math.random()*(COLS-6)|0),gy=3+(Math.random()*(ROWS-6)|0);
    if(cells[gy][gx]!=='.')continue;
    const x=gx*T+T/2,y=gy*T+T/2;
    let open=0;
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)
      if(cells[gy+oy]&&cells[gy+oy][gx+ox]==='.')open++;
    const d=zone?Math.hypot(zone.x-x,zone.y-y):999;
    const sc=open*40+Math.min(d,400);
    if(sc>bd){bd=sc;best={x,y}}
  }
  zone={x:best.x,y:best.y,r:62,life:60*22};
  ring(zone.x,zone.y,'#ffd166',7,5);
  announce('ZONE MOVED','#ffd166',80);
}
function stepZone(){
  if(!zone)moveZone();
  if(--zone.life<=0)moveZone();
  const inside=[0,0];
  for(const t of tanks){
    if(t.dead||t.hp<=0)continue;
    if(Math.hypot(t.x-zone.x,t.y-zone.y)<zone.r)inside[t.team]++;
  }
  let owner=-1;
  if(inside[0]&&!inside[1])owner=0;
  else if(inside[1]&&!inside[0])owner=1;
  zone.owner=owner;
  if(owner>=0){
    caps[owner]+=0.42;
    if(frame%22===0)sTick();
    if(caps[owner]>=100){
      caps[owner]=100;
      roundWinner=tanks.find(t=>t.team===owner)||tanks[0];
      endRun(!!(roundWinner&&roundWinner.human));
    }
  }
}

/* ---------------- BOSS RUSH ---------------- */
const BOSS_CLASS={name:'OMEGA',skin:'titan',pilot:'goliath',gun:'shell',trait:'brace',
  shape:'hex',deco:'plate',color:'#7b2d26',dark:'#4a1a16',light:'#b5564a',
  hp:34,speed:1.7,radius:34,bl:34,desc:'THE OMEGA TANK',perk:'BOSS',pips:[1,5,5],unlock:null};
function spawnBoss(){
  const b=makeTank(1,0,false,AI_LEVELS[1],0,'#7b2d26');
  b.cls=BOSS_CLASS;b.side=1;b.boss=true;b.tag='BOSS';b.name='OMEGA';
  b.maxHp=BOSS_CLASS.hp+bossRound*10;b.hp=b.maxHp;b.mass=6;b.bounty=1000;
  b.teamColor='#ef3e4a';b.x=W-140;b.y=H/2;b.ang=Math.PI;b.tang=Math.PI;
  resetTankState(b);
  b.phase=1;b.atk=0;
  tanks.push(b);
  announce('OMEGA APPROACHES','#ef3e4a',150);
  sBoom();shake=18;
}
function bossDown(){
  const b=tanks.find(t=>t.boss);
  shake=26;flash=.8;
  if(b)for(let i=0;i<14;i++)ring(b.x+(Math.random()-.5)*70,b.y+(Math.random()-.5)*70,i%2?'#ffd166':'#ff8c42',7,5);
  score+=2000;
  announce('OMEGA DESTROYED','#35a44a',170);
  endRun(true);
}
function stepBoss(){
  const b=tanks.find(t=>t.boss&&!t.dead);
  if(!b)return;
  const hpf=b.hp/b.maxHp;
  const want=hpf>.66?1:hpf>.33?2:3;
  if(want!==b.phase){
    b.phase=want;shake=14;flash=.4;
    announce('PHASE '+want,'#ef3e4a',110);
    if(want>=2)for(let i=0;i<2;i++)spawnMinion();
  }
  b.atk=(b.atk||0)+1;
  const tgt=enemyOf(b);
  if(!tgt)return;
  const a=Math.atan2(tgt.y-b.y,tgt.x-b.x);
  b.tang=lerpAngle(b.tang,a,.05);
  // phase 1 shell volleys, phase 2 spread, phase 3 spinning barrage
  const every=b.phase===1?70:b.phase===2?54:40;
  if(b.atk%every===0){
    const n=b.phase===1?3:b.phase===2?5:7;
    const spread=b.phase===3?Math.PI*2/n:.34;
    for(let i=0;i<n;i++){
      const ang=b.phase===3?(b.atk*.05+i*spread):(b.tang+(i-(n-1)/2)*spread);
      bullets.push({x:b.x+Math.cos(ang)*46,y:b.y+Math.sin(ang)*46,px:0,py:0,ox:b.x,oy:b.y,
        vx:Math.cos(ang)*6.2,vy:Math.sin(ang)*6.2,owner:b,dmg:1,r:7,knock:12,
        bounces:0,life:0,life0:0,gun:'shell',pierce:false,phase:false,air:false,aoe:0,tpCd:0});
    }
    sfx(150,60,.24,'sawtooth',.13);shake=Math.max(shake,5);
  }
  if(b.phase>=2&&b.atk%420===0)spawnMinion();
}
function spawnMinion(){
  if(tanks.filter(t=>t.side===1&&!t.dead).length>5)return;
  const ci=[0,1,8][Math.random()*3|0];
  const e=makeTank(1,ci,false,AI_LEVELS[1],0,'#b5564a');
  e.side=1;e.tag='CPU';e.bounty=150;e.teamColor='#ef3e4a';
  const p=farSpawn();e.x=p.x;e.y=p.y;e.ang=e.tang=0;
  resetTankState(e);
  tanks.push(e);ring(e.x,e.y,'#ef3e4a',6,4);
}

/* ---------------- per-frame mode tick ---------------- */
function stepMode(){
  const k=kindOf();
  // respawn timers for the modes that use them
  if(k!=='rounds'){
    for(const t of tanks){
      if(!t.dead)continue;
      if(--t.respawn<=0){
        if(k==='ball'||k==='zone')reviveTank(t);
        else if(t.side===0){
          if(lives>0)reviveTank(t);
          else if(!alliesOf(0).length)endRun(false);
        }
        else{const i=tanks.indexOf(t);if(i>=0)tanks.splice(i,1)}
      }
    }
  }
  if(k==='survival')stepSurvival();
  else if(k==='ball'){
    if(ballReset>0&&--ballReset<=0)resetBall(0);
    stepBall();
  }
  else if(k==='zone')stepZone();
  else if(k==='boss'){
    stepBoss();
    if(!alliesOf(0).length&&!tanks.some(t=>t.side===0&&t.dead))endRun(false);
  }
  if(k==='survival'||k==='boss')runClock++;
}

/* ---------------- mode setup ---------------- */
function setupMode(){
  score=0;wave=1;waveTimer=0;goals=[0,0];caps=[0,0];zone=null;ball=null;lives=3;
  ballReset=0;ballClock=60*40;runClock=0;bossRound=bossRound||0;ann=null;
  const k=kindOf();
  const twoHuman=coopPlayers;
  if(k==='survival'||k==='boss'){
    tanks=[makeTank(0,sel[0].i,true,null,0,prof(0).color)];
    if(twoHuman)tanks.push(makeTank(1,sel[1].i,true,null,0,prof(1).color));
    tanks.forEach(t=>{t.side=0;t.teamColor=t.profColor||TEAMS[t.team].color});
    mapIndex=randomArena();
    startRound();
    if(k==='survival')spawnWave();else spawnBoss();
  }else if(k==='ball'||k==='zone'){
    tanks=[makeTank(0,sel[0].i,true,null,0,prof(0).color),
           makeTank(1,sel[1].i,twoHuman,twoHuman?null:AI_LEVELS[aiLevel],0,
             twoHuman?prof(1).color:randomCpuColor())];
    if(!twoHuman){tanks[1].tag='CPU';tanks[1].name='CPU · '+AI_LEVELS[aiLevel].name}
    tanks.forEach(t=>{t.side=t.team;t.teamColor=t.profColor||TEAMS[t.team].color});
    mapIndex=k==='ball'?pitchIndex():randomArena();
    startRound();
    if(k==='ball')resetBall(0);else moveZone();
  }
}
function pitchIndex(){return newArena({pitch:true})}
