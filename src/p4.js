/* ---------------- round / match flow ---------------- */
const CPU_COLORS=['#ef3e4a','#ff8c42','#ffd23f','#35a44a','#2ec4b6','#3d7ea6','#a06cd5','#f06fa8'];
function randomCpuColor(){return CPU_COLORS[Math.random()*CPU_COLORS.length|0]}
/* the CPU rolls a random tank, avoiding a mirror match where possible */
function randomCpuClass(avoid){
  let i=Math.random()*CLASSES.length|0;
  if(i===avoid)i=(i+1+(Math.random()*(CLASSES.length-1)|0))%CLASSES.length;
  return i;
}
function campaignStage(i){
  return{map:i%MAPS.length,cls:(i*5+2)%CLASSES.length,
    ai:i<5?0:i<11?1:2,bonus:Math.floor(i/4)};
}
function startRound(){
  const m=MAPS[mapIndex];
  cells=m.grid.map(r=>r.split(''));
  crateHp={};portals={};
  for(let gy=0;gy<ROWS;gy++)for(let gx=0;gx<COLS;gx++){
    const c=cells[gy][gx];
    if(c==='x')crateHp[gy*COLS+gx]=2;
    if(c==='1'||c==='2'){(portals[c]=portals[c]||[]).push({gx,gy})}
  }
  movers=(m.movers||[]).map(v=>({...v}));
  prerenderArena(m,mapIndex);
  bullets=[];mines=[];pickups=[];floats=[];marks=[];conf=[];rings=[];burns=[];
  shake=0;hitstop=0;pickupClock=200;readyPinged=false;goPinged=false;
  initAmbient(m);
  tanks.forEach((t,i)=>{const s=m.spawns[i];
    t.x=s[0]*T+T/2;t.y=s[1]*T+T/2;t.ang=s[2];t.tang=s[2];t.hp=t.maxHp;
    t.cd=0;t.inv=0;t.recoil=0;t.ivx=0;t.ivy=0;t.mvx=0;t.mvy=0;t.dist=0;
    t.tpCd=0;t.crushCd=0;t.starCd=0;t.shield=0;t.minesToLay=0;t.mineCd=0;
    t.fx={rapid:0,triple:0,big:0,pierce:0,star:0,speed:0,ghost:0,frozen:0,reverse:0};
    t.wedge=0;t.lock=0;t.roul=null;t.charge=0;t.spin=0;t.shots=0;t.fireHeld=false;t.lastRoll=null;
    if(t.ai){t.aiTick=0;t.aiFireLock=0;t.aiPath=null;t.aiPanic=0;t.aiPanicDir=[1,0];t.aiLastX=t.x;t.aiLastY=t.y;t.aimNoise=0}
  });
  roundClock=ROUND_TIME;sudden=false;
  state='ready';timer=110;
}
function makeTank(team,clsIdx,human,aiCfg,hpBonus,colorOverride){
  const c=CLASSES[clsIdx];
  return{team,tag:TEAMS[team].tag,cls:c,clsIdx,human,ai:aiCfg||null,
    profColor:colorOverride||null,maxHp:c.hp+(hpBonus||0),
    x:0,y:0,ang:0,tang:0,hp:1,cd:0,inv:0,recoil:0,score:0,lock:0,roul:null,
    name:human?(prof(team).name):(aiCfg?('CPU · '+aiCfg.name):'CPU')};
}
function startMatch(){
  matchDone=false;
  if(mode==='campaign'){
    const st=campaignStage(campStage);
    campCls=randomCpuClass(sel[0].i);
    tanks=[makeTank(0,sel[0].i,true,null,0,prof(0).color),
           makeTank(1,campCls,false,AI_LEVELS[st.ai],st.bonus,randomCpuColor())];
    tanks[1].tag='CPU';
    mapIndex=st.map;
  }else if(mode==='duel'){
    sel[1].i=randomCpuClass(sel[0].i);
    tanks=[makeTank(0,sel[0].i,true,null,0,prof(0).color),
           makeTank(1,sel[1].i,false,AI_LEVELS[aiLevel],0,randomCpuColor())];
    tanks[1].tag='CPU';
    mapIndex=Math.random()*MAPS.length|0;
  }else{
    tanks=[makeTank(0,sel[0].i,true,null,0,prof(0).color),
           makeTank(1,sel[1].i,true,null,0,prof(1).color)];
    mapIndex=0;
  }
  tanks.forEach(t=>{t.teamColor=t.profColor||TEAMS[t.team].color});
  startRound();
}
function initAmbient(m){
  amb=[];const kind=AMBIENT[m.world];
  const n=kind==='snow'?40:kind==='embers'?24:kind==='sparks'?16:kind==='clouds'?5:7;
  for(let i=0;i<n;i++)amb.push({x:Math.random()*W,y:Math.random()*H,s:.4+Math.random(),p:Math.random()*Math.PI*2,kind});
}

/* ---------------- stats ---------------- */
function bumpStat(team,key,n){
  if(!tanks[team]||!tanks[team].human)return;
  const p=prof(team);if(!p)return;
  p.stats[key]=(p.stats[key]|0)+(n||1);
}
function finishMatch(winner){
  if(matchDone)return;
  matchDone=true;
  const before=tanks.map(t=>t.human?unlockedCount(prof(t.team)):0);
  for(const t of tanks){
    if(!t.human)continue;
    const p=prof(t.team);
    p.last=t.clsIdx;
    p.stats.plays[t.cls.name]=(p.stats.plays[t.cls.name]|0)+1;
    if(t===winner)p.stats.wins++;else p.stats.losses++;
  }
  if(mode==='campaign'&&winner&&winner.human){
    const p=prof(0);
    if(campStage+1>p.stats.campaign)p.stats.campaign=campStage+1;
  }
  const gained=[];
  tanks.forEach((t,i)=>{
    if(!t.human)return;
    if(unlockedCount(prof(t.team))>before[i]){
      CLASSES.forEach((c,ci)=>{if(c.unlock&&isUnlocked(ci,prof(t.team))&&!gained.includes(c.name))gained.push(c.name)});
    }
  });
  if(gained.length){toast={txt:'UNLOCKED: '+gained[gained.length-1],life:260};sUnlock()}
  saveProfiles();
}

/* ---------------- firing ---------------- */
function fire(t,chargeDist){
  const g=GUNS[t.cls.gun],fx=t.fx,skin=t.cls.trait;
  const maxLive=g.maxLive+(fx.triple>0?2:0);
  if(t.cd>0||t.fx.frozen>0||bullets.filter(b=>b.owner===t).length>=maxLive)return;
  let n=g.pellets||1,spread=g.spread||0;
  if(fx.triple>0){n=Math.max(3,n);spread=Math.max(.22,spread)}
  // SCATTER perk: hold your ground for a marksman's spread
  if(skin==='still')spread=Math.hypot(t.mvx,t.mvy)>1.2?spread*1.2:.1;
  let dmg=g.dmg+(fx.big>0?1:0),br=g.br+(fx.big>0?3:0),knock=g.knock+(fx.big>0?4:0);
  // BRAWLER perk: every third shell is a heavy one
  let heavy=false;
  if(skin==='heavy4'){t.shots=(t.shots||0)+1;if(t.shots%4===0){heavy=true;dmg+=1;br+=3;knock+=5}}
  const mo=t.cls.radius+t.cls.bl-4;
  const base=(t.tang==null?t.ang:t.tang);
  // BOMBARD: humans aim the arc with the charge meter, bots fuse to their target
  let life=g.life||0,life0=g.life||0;
  if(g.air){
    let reach;
    if(chargeDist)reach=chargeDist;
    else{const e=tanks[1-t.team];reach=e?Math.hypot(e.x-t.x,e.y-t.y):g.range;
      if(t.ai&&g.fuseErr)reach+=(Math.random()-.5)*g.fuseErr} // bots misjudge the drop
    life=Math.max(8,Math.min(g.life,Math.round((reach-mo)/g.spd)));
    life0=life;
  }
  for(let i=0;i<n;i++){
    const a=base+(spread?(i-(n-1)/2)*spread:0)+(g.jitter?(Math.random()-.5)*g.jitter:0);
    bullets.push({x:t.x+Math.cos(a)*mo,y:t.y+Math.sin(a)*mo,px:0,py:0,ox:t.x,oy:t.y,
      vx:Math.cos(a)*g.spd,vy:Math.sin(a)*g.spd,owner:t,dmg,r:br,knock,heavy,
      bounces:g.bounces||0,life,life0,gun:t.cls.gun,
      pierce:fx.pierce>0,phase:!!g.phase,air:!!g.air,aoe:g.aoe||0,tpCd:0});
  }
  // SCOUT perk: the minigun spins up while the trigger is held
  let cd=g.cd;
  if(skin==='spinup')cd=Math.round(cd*(1-(t.spin||0)/48*.45));
  t.cd=Math.round(cd*(fx.rapid>0?.5:1));t.recoil=g.br+(heavy?3:0);
  // PHANTOM perk: firing phases the hull for a beat
  if(skin==='phase')t.fx.ghost=Math.max(t.fx.ghost,26);
  burst(t.x+Math.cos(base)*mo,t.y+Math.sin(base)*mo,heavy?'#ff8c42':'#ffd166',heavy?8:4,heavy?3.5:2.5);
  if(heavy)sfx(240,70,.18,'square',.11);else sndFor(t.cls.gun)();
}

/* ---------------- AI ---------------- */
function losClear(x1,y1,x2,y2){
  const d=Math.hypot(x2-x1,y2-y1),steps=Math.max(1,d/12|0);
  for(let i=1;i<steps;i++){
    const x=x1+(x2-x1)*i/steps,y=y1+(y2-y1)*i/steps;
    const c=cells[Math.max(0,Math.min(ROWS-1,y/T|0))][Math.max(0,Math.min(COLS-1,x/T|0))];
    if(c==='#'||c==='x')return false;
  }
  return true;
}
function dirBlocked(t,dx,dy){
  const r=t.cls.radius,probe=r+14;
  return !!hitCell(t.x+dx*probe,t.y+dy*probe,r*.9,'tank',dx,dy,false);
}
/* breadth-first flow field so bots route around walls instead of hugging them */
const bfsDist=new Int16Array(COLS*ROWS),bfsQueue=new Int16Array(COLS*ROWS);
function passable(gx,gy){
  const c=cells[gy][gx];
  return c!=='#'&&c!=='x'&&c!=='~';
}
/* travelling through a cell in direction (dx,dy): one-way gates only allow their arrow */
function passableDir(gx,gy,dx,dy){
  if(!passable(gx,gy))return false;
  const g=GATES[cells[gy][gx]];
  if(!g)return true;
  if(g[0])return dx===0||g[0]===dx;   // sideways is fine, backwards is not
  return dy===0||g[1]===dy;
}
function bfsStep(t,tx,ty){
  const sx=Math.max(0,Math.min(COLS-1,t.x/T|0)),sy=Math.max(0,Math.min(ROWS-1,t.y/T|0));
  let gx=Math.max(0,Math.min(COLS-1,tx/T|0)),gy=Math.max(0,Math.min(ROWS-1,ty/T|0));
  if(!passable(gx,gy)){
    let best=null,bd=1e9;
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++){
      if(!passable(x,y))continue;
      const d=(x-gx)*(x-gx)+(y-gy)*(y-gy);
      if(d<bd){bd=d;best=[x,y]}
    }
    if(!best)return null;
    gx=best[0];gy=best[1];
  }
  bfsDist.fill(-1);
  let head=0,tail=0;
  bfsDist[gy*COLS+gx]=0;bfsQueue[tail++]=gy*COLS+gx;
  while(head<tail){
    const k=bfsQueue[head++],kx=k%COLS,ky=(k/COLS)|0,d=bfsDist[k];
    if(kx===sx&&ky===sy)break;
    for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=kx+ox,ny=ky+oy;
      if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;
      const nk=ny*COLS+nx;
      if(bfsDist[nk]!==-1)continue;
      // the tank would travel nx,ny -> kx,ky, so check that direction through both cells
      if(!passableDir(nx,ny,-ox,-oy)||!passableDir(kx,ky,-ox,-oy))continue;
      bfsDist[nk]=d+1;bfsQueue[tail++]=nk;
    }
  }
  if(bfsDist[sy*COLS+sx]===-1)return null;
  let best=null,bd=bfsDist[sy*COLS+sx];
  for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=sx+ox,ny=sy+oy;
    if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;
    if(!passableDir(nx,ny,ox,oy)||!passableDir(sx,sy,ox,oy))continue;
    const nd=bfsDist[ny*COLS+nx];
    if(nd!==-1&&nd<bd){bd=nd;best=[nx,ny]}
  }
  if(!best)return null;
  return{x:best[0]*T+T/2-t.x,y:best[1]*T+T/2-t.y};
}
function aiInput(t){
  const cfg=t.ai,e=tanks[1-t.team],g=GUNS[t.cls.gun];
  const inp={dx:0,dy:0,fire:false};
  if(!e)return inp;
  t.aiTick++;
  const dx=e.x-t.x,dy=e.y-t.y,dist=Math.hypot(dx,dy)||1;
  const los=losClear(t.x,t.y,e.x,e.y);
  // aim: lead the target when the level is good enough
  let aim=Math.atan2(dy,dx);
  if(cfg.lead){
    const tof=dist/g.spd;
    const px=e.x+(e.mvx||0)*tof*.9,py=e.y+(e.mvy||0)*tof*.9;
    aim=Math.atan2(py-t.y,px-t.x);
  }
  if(t.aiTick%cfg.react===0)t.aimNoise=(Math.random()-.5)*cfg.aimErr*2;
  aim+=t.aimNoise||0;
  // steering target
  let tx=e.x,ty=e.y;
  if(cfg.seek){
    let best=null,bd=260;
    for(const p of pickups){const d=Math.hypot(p.x-t.x,p.y-t.y);if(d<bd){bd=d;best=p}}
    if(best){tx=best.x;ty=best.y}
  }
  const ideal=g.range*.55;
  const targetIsEnemy=(tx===e.x&&ty===e.y);
  let wantX=tx-t.x,wantY=ty-t.y;
  const openShot=targetIsEnemy&&los&&dist<g.range*.95;
  if(openShot){
    // in a firefight: hold range and strafe
    const rad=Math.hypot(wantX,wantY)||1;
    const ux=wantX/rad,uy=wantY/rad;
    const closeErr=(dist-ideal)/ideal;
    const strafe=Math.sin(frame*.02+t.team*3)*1.1;
    wantX=ux*closeErr*2+(-uy)*strafe;
    wantY=uy*closeErr*2+( ux)*strafe;
  }else{
    // no shot: route around the level with a flow field, refreshed periodically
    if(t.aiTick%12===0||!t.aiPath)t.aiPath=bfsStep(t,tx,ty);
    if(t.aiPath){wantX=t.aiPath.x;wantY=t.aiPath.y}
  }
  // dodge incoming fire
  if(Math.random()<cfg.dodge){
    for(const b of bullets){
      if(b.owner===t)continue;
      const bd=Math.hypot(b.x-t.x,b.y-t.y);
      if(bd>170)continue;
      const toward=(t.x-b.x)*b.vx+(t.y-b.y)*b.vy;
      if(toward<=0)continue;
      wantX=-b.vy;wantY=b.vx;
      break;
    }
  }
  let wl=Math.hypot(wantX,wantY)||1;
  let wx=wantX/wl,wy=wantY/wl;
  // unstick: if barely moving, commit to a free direction for a while
  if(t.aiTick%20===0){
    const moved=Math.hypot(t.x-(t.aiLastX||0),t.y-(t.aiLastY||0));
    t.aiLastX=t.x;t.aiLastY=t.y;
    if(moved<6&&t.aiPanic<=0){
      t.aiPanic=36;
      const opts=[];
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;
        if(!dirBlocked(t,Math.cos(a),Math.sin(a)))opts.push([Math.cos(a),Math.sin(a)])}
      t.aiPanicDir=opts.length?opts[Math.random()*opts.length|0]:[-wx,-wy];
      t.aiPath=null;
    }
  }
  if(t.aiPanic>0){t.aiPanic--;wx=t.aiPanicDir[0];wy=t.aiPanicDir[1]}
  else if(!openShot&&t.aiPath){/* trust the flow field */}
  else if(dirBlocked(t,wx,wy)){
    let best=null,bs=-9;
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2,cxv=Math.cos(a),cyv=Math.sin(a);
      if(dirBlocked(t,cxv,cyv))continue;
      const s=cxv*wx+cyv*wy;
      if(s>bs){bs=s;best=[cxv,cyv]}
    }
    if(best){wx=best[0];wy=best[1]}
  }
  inp.dx=wx;inp.dy=wy;
  // face + fire: the turret carries the aim, the hull follows movement
  t.tang=lerpAngle(t.tang==null?t.ang:t.tang,aim,cfg.react<=3?.28:.16);
  let err=aim-t.tang;
  while(err>Math.PI)err-=2*Math.PI;while(err<-Math.PI)err+=2*Math.PI;
  const canSee=g.air?dist<g.range:los;
  if(t.aiFireLock>0)t.aiFireLock--;
  if(canSee&&Math.abs(err)<cfg.aimTol&&dist<g.range&&t.aiFireLock<=0){
    inp.fire=true;
    if(cfg.fireGap)t.aiFireLock=cfg.fireGap;
  }
  inp.face=aim;
  return inp;
}
function humanInput(t){
  // touch joystick drives the local tank (P1 offline, your tank online)
  if(TOUCH.on&&(t.team===0||t.netLocal)){
    const jl=Math.hypot(TOUCH.dx,TOUCH.dy);
    if(jl>9||TOUCH.fire){
      const k0=KEYMAP[t.team];
      let kdx=(keys[k0.right]?1:0)-(keys[k0.left]?1:0);
      let kdy=(keys[k0.down]?1:0)-(keys[k0.up]?1:0);
      return{dx:jl>9?TOUCH.dx/jl:kdx,dy:jl>9?TOUCH.dy/jl:kdy,
        fire:TOUCH.fire||!!keys[k0.fire]};
    }
  }
  if(t.netLocal){ // online: your machine, so both control schemes drive your tank
    let dx=0,dy=0,f=false;
    for(const k of KEYMAP){
      dx+=(keys[k.right]?1:0)-(keys[k.left]?1:0);
      dy+=(keys[k.down]?1:0)-(keys[k.up]?1:0);
      f=f||!!keys[k.fire];
    }
    return{dx:Math.max(-1,Math.min(1,dx)),dy:Math.max(-1,Math.min(1,dy)),fire:f};
  }
  const k=KEYMAP[t.team];
  return{dx:(keys[k.right]?1:0)-(keys[k.left]?1:0),
         dy:(keys[k.down]?1:0)-(keys[k.up]?1:0),
         fire:!!keys[k.fire]};
}

/* ---------------- tank control ---------------- */
/* a tank should never be able to end up wedged inside terrain: ghost expiring
   in a wall, knockback into a corner, a crusher shove or a one-way gate with a
   wall behind it all used to be able to freeze it in place forever */
function insideSolid(t){
  const gx=Math.max(0,Math.min(COLS-1,t.x/T|0)),gy=Math.max(0,Math.min(ROWS-1,t.y/T|0));
  const c=cells[gy][gx];
  return c==='#'||c==='x'||c==='~';
}
function unwedge(t){
  if(t.fx.ghost>0){t.wedge=0;return}
  if(insideSolid(t)){
    if(++t.wedge>18){
      const p=nearestFree(t.x,t.y);
      t.x=p.x;t.y=p.y;t.wedge=0;t.ivx=t.ivy=0;t.aiPath=null;
      burst(t.x,t.y,'#7ae0c3',10,3);
    }
  }else t.wedge=0;
}
function controlTank(t){
  const fx=t.fx;
  unwedge(t);
  let inp=t.ai?aiInput(t):(t.remote?(t.netInput||{dx:0,dy:0,fire:false}):humanInput(t));
  for(const key in fx)if(fx[key]>0)fx[key]--;
  if(fx.ghost===1&&hitCell(t.x,t.y,t.cls.radius,'tank',0,0,false)){const p=nearestFree(t.x,t.y);t.x=p.x;t.y=p.y}
  let dx=inp.dx,dy=inp.dy;
  if(fx.reverse>0){dx=-dx;dy=-dy}
  if(fx.frozen>0){dx=0;dy=0}
  const tile=tileAt(t.x,t.y);
  const spd=t.cls.speed*(fx.speed>0?1.45:1)*(t.ai?t.ai.speedMul:1);
  let ddx=0,ddy=0;
  if(dx||dy){
    const len=Math.hypot(dx,dy);ddx=dx/len*spd;ddy=dy/len*spd;
    t.ang=lerpAngle(t.ang,Math.atan2(dy,dx),.3);
  }
  if(tile==='*'){t.mvx=t.mvx*.93+ddx*.1;t.mvy=t.mvy*.93+ddy*.1}
  else{t.mvx=ddx;t.mvy=ddy}
  let bx=0,by=0;
  if(tile==='>')bx=1.4;else if(tile==='<')bx=-1.4;
  else if(tile==='v')by=1.4;else if(tile==='^')by=-1.4;
  tryMove(t,t.mvx+t.ivx+bx,t.mvy+t.ivy+by);
  const ice=tile==='*';
  t.ivx*=ice?.96:.86;t.ivy*=ice?.96:.86;
  t.dist+=Math.hypot(t.mvx+bx,t.mvy+by);
  if((t.mvx||t.mvy)&&frame%9===0){
    const back=t.ang+Math.PI;
    parts.push({x:t.x+Math.cos(back)*(t.cls.radius+6),y:t.y+Math.sin(back)*(t.cls.radius+6),
      vx:Math.cos(back)*.5,vy:Math.sin(back)*.5-.3,life:22,color:'smoke',size:2.5+Math.random()*2});
  }
  if((t.mvx||t.mvy)&&frame%3===0&&tile!=='b')marks.push({x:t.x,y:t.y,ang:t.ang,life:170,r:t.cls.radius});
  const gx0=Math.max(0,(t.x-60)/T|0),gx1=Math.min(COLS-1,(t.x+60)/T|0);
  const gy0=Math.max(0,(t.y-60)/T|0),gy1=Math.min(ROWS-1,(t.y+60)/T|0);
  for(let gy=gy0;gy<=gy1;gy++)for(let gx=gx0;gx<=gx1;gx++){
    if(cells[gy][gx]!=='o')continue;
    const cxp=gx*T+T/2,cyp=gy*T+T/2,d=Math.hypot(t.x-cxp,t.y-cyp);
    if(d<t.cls.radius+13&&d>0){
      t.ivx=(t.x-cxp)/d*7.5;t.ivy=(t.y-cyp)/d*7.5;
      sBoing();burst(cxp,cyp,'#ef3e4a',5,3);
    }
  }
  if(t.tpCd>0)t.tpCd--;
  const tp=tileAt(t.x,t.y);
  if((tp==='1'||tp==='2')&&t.tpCd<=0){
    const pair=portals[tp];
    const here=pair.find(p=>p.gx===(t.x/T|0)&&p.gy===(t.y/T|0));
    const other=pair.find(p=>p!==here);
    if(other){burst(t.x,t.y,'#7ae0c3',12,4);t.x=other.gx*T+T/2;t.y=other.gy*T+T/2;
      t.tpCd=70;burst(t.x,t.y,'#7ae0c3',12,4);sTele()}
  }
  // aim assist: the turret tracks the enemy on its own when there is a shot,
  // and settles back to the direction of travel when there is not
  if(!t.ai){
    const e2=tanks[1-t.team];
    let want=t.ang,locked=false;
    if(e2&&e2.hp>0&&state==='play'){
      const g2=GUNS[t.cls.gun];
      const ddx=e2.x-t.x,ddy=e2.y-t.y,d2=Math.hypot(ddx,ddy)||1;
      const through=!!(g2.phase||g2.air);
      if(d2<g2.range*1.25&&(through||losClear(t.x,t.y,e2.x,e2.y))){
        const tof=d2/g2.spd;
        want=Math.atan2(ddy+(e2.mvy||0)*tof*.8,ddx+(e2.mvx||0)*tof*.8);
        locked=true;
      }
    }
    t.lock=locked?Math.min(30,(t.lock||0)+1):0;
    t.tang=lerpAngle(t.tang==null?t.ang:t.tang,want,locked?.18:.12);
  }
  // item roulette spins above the tank, then lands on a power
  if(t.roul){
    t.roul.n--;
    if(t.roul.n%6===0){t.roul.idx=(t.roul.idx+1)%POWERS.length;if(t.roul.n>12)sMine()}
    if(t.roul.n<=0){const def=POWERS[Math.random()*POWERS.length|0];applyPower(t,def);t.lastRoll={def,ttl:110};t.roul=null}
  }
  if(t.cd>0)t.cd--;
  if(t.inv>0)t.inv--;
  if(t.recoil>0)t.recoil-=1.2;
  if(t.starCd>0)t.starCd--;
  if(t.crushCd>0)t.crushCd--;
  if(t.minesToLay>0){
    if(t.mineCd>0)t.mineCd--;
    else{mines.push({x:t.x,y:t.y,owner:t,arm:30,life:900});t.minesToLay--;t.mineCd=40;sMine()}
  }
  const g3=GUNS[t.cls.gun];
  if(t.cls.trait==='spinup')t.spin=inp.fire?Math.min(48,(t.spin||0)+1):Math.max(0,(t.spin||0)-2);
  if(g3.air&&!t.ai){
    // hold to stretch the arc, release to lob
    if(inp.fire&&t.cd<=0){
      t.charge=Math.min(g3.range,(t.charge||g3.minR)+3.4);
      if(frame%7===0)sChg((t.charge-g3.minR)/(g3.range-g3.minR));
    }else if(t.fireHeld&&t.charge>0&&t.cd<=0){
      fire(t,t.charge);t.charge=0;
    }else if(!inp.fire)t.charge=0;
  }else if(inp.fire)fire(t);
  t.fireHeld=inp.fire;
}
function tankCollide(){
  const [a,b]=tanks;
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.cls.radius+b.cls.radius;
  if(d>0&&d<min){
    const push=(min-d)/2,ux=dx/d,uy=dy/d;
    tryMove(a,-ux*push,-uy*push);
    tryMove(b,ux*push,uy*push);
    for(const [s,o] of [[a,b],[b,a]]){
      if(s.fx.star>0&&o.fx.star<=0&&o.inv<=0&&s.starCd<=0){
        s.starCd=30;damage(o,1,Math.atan2(o.y-s.y,o.x-s.x),12);
      }
    }
  }
  for(const t of tanks){
    const mv=moverHit(t.x,t.y,t.cls.radius);
    if(mv){
      const rc=moverRect(mv);
      const pushx=rc.vx*2||(t.x<rc.x+rc.w/2?-3:3),pushy=rc.vy*2||(t.y<rc.y+rc.h/2?-3:3);
      tryMove(t,pushx,pushy);
      if(moverHit(t.x,t.y,t.cls.radius)&&t.crushCd<=0&&t.inv<=0){
        t.crushCd=60;damage(t,1,Math.atan2(pushy,pushx),10);
      }
    }
  }
}

/* ---------------- damage ---------------- */
function damage(t,dmg,fromAng,knock){
  if(t.fx.star>0)return;
  if(t.shield>0){t.shield--;burst(t.x,t.y,'#3d7ea6',10,3);sBounce();addFloat(t.x,t.y-24,'BLOCKED','#3d7ea6');return}
  if(t.cls.trait==='brace')knock*=.3;
  t.hp-=dmg;t.inv=BULLET_INVUL;shake=Math.max(shake,5+dmg*2);hitstop=Math.max(hitstop,dmg>1?6:3);sHit();
  ring(t.x,t.y,'#fff',5,4);if(dmg>1)ring(t.x,t.y,'#ffd166',7,5);
  t.squash=1;flash=Math.max(flash,dmg>1?.5:.3);
  burst(t.x,t.y,t.cls.color,10,3.5);burst(t.x,t.y,'#fff',5,4);
  addFloat(t.x,t.y-t.cls.radius-10,'-'+dmg,'#ffd166');
  tryMove(t,Math.cos(fromAng)*knock,0);tryMove(t,0,Math.sin(fromAng)*knock);
  if(t.hp<=0){
    roundWinner=tanks[1-t.team];roundWinner.score++;
    bumpStat(roundWinner.team,'kos');bumpStat(0,'rounds');bumpStat(1,'rounds');
    ko={x:t.x,y:t.y};
    burst(t.x,t.y,t.cls.color,26,6);burst(t.x,t.y,'#ffd166',18,5);
    ring(t.x,t.y,'#fff',9,7);ring(t.x,t.y,t.cls.color,6,5);ring(t.x,t.y,'#ffd166',12,4);
    shake=14;hitstop=8;sKO();jWin();state='round';timer=140;
  }
}
function explode(x,y,radius,dmg,owner){
  burst(x,y,'#ffd166',20,5);burst(x,y,'#ff8c42',14,4);ring(x,y,'#ffd166',8,6);ring(x,y,'#fff',5,3);shake=Math.max(shake,8);sBoom();
  for(const t of tanks){
    if(t===owner||t.inv>0)continue;
    if(Math.hypot(t.x-x,t.y-y)<radius+t.cls.radius)damage(t,dmg,Math.atan2(t.y-y,t.x-x),12);
    if(state!=='play')return;
  }
  for(const k in crateHp){
    if(crateHp[k]<=0)continue;
    const gx=k%COLS,gy=(k/COLS)|0;
    if(cells[gy][gx]==='x'&&Math.hypot(gx*T+T/2-x,gy*T+T/2-y)<radius+T/2)damageCrate(gx,gy,2);
  }
}
function damageCrate(gx,gy,dmg){
  const k=gy*COLS+gx;
  crateHp[k]-=dmg;sCrate();
  burst(gx*T+T/2,gy*T+T/2,'#c08a4a',8,3);
  if(crateHp[k]<=0){cells[gy][gx]='.';burst(gx*T+T/2,gy*T+T/2,'#8f5f2c',14,4.5);shake=Math.max(shake,4)}
}

/* ---------------- powerups ---------------- */
function spawnPickup(){
  for(let tries=0;tries<40;tries++){
    const gx=1+(Math.random()*(COLS-2)|0),gy=1+(Math.random()*(ROWS-2)|0);
    if(cells[gy][gx]!=='.')continue;
    const x=gx*T+T/2,y=gy*T+T/2;
    if(tanks.some(t=>Math.hypot(t.x-x,t.y-y)<150))continue;
    if(pickups.some(p=>Math.hypot(p.x-x,p.y-y)<120))continue;
    pickups.push({x,y,age:0});
    return;
  }
}
function applyPower(t,def){
  const e=tanks[1-t.team];
  sPick();addFloat(t.x,t.y-28,def.label,def.color);
  if(def.id==='heal')t.hp=Math.min(t.maxHp,t.hp+2);
  else if(def.id==='shield')t.shield=2;
  else if(def.id==='mine')t.minesToLay=3;
  else if(def.id==='freeze'){e.fx.frozen=90;sFrz();burst(e.x,e.y,'#4c93d9',14,4);addFloat(e.x,e.y-28,'FROZEN!','#4c93d9')}
  else if(def.id==='flip'){e.fx.reverse=360;addFloat(e.x,e.y-28,'FLIPPED!','#ff8c42')}
  else t.fx[def.id]=def.dur;
}

/* ---------------- play step ---------------- */
function stepPlay(){
  tanks.forEach(controlTank);
  tankCollide();
  if(state!=='play')return;
  // round clock: at zero the healthier tank takes it, level HP goes to sudden death
  if(!sudden){
    roundClock--;
    if(roundClock===HURRY)addFloat(W/2,H/2-60,'HURRY UP!','#ef3e4a');
    if(roundClock<=0){
      const [a,b]=tanks;
      if(a.hp!==b.hp)damage(a.hp<b.hp?a:b,99,0,0);
      else{sudden=true;roundClock=20*60;a.hp=b.hp=1;a.inv=b.inv=40;shake=10;sStar();
        addFloat(W/2,H/2-60,'SUDDEN DEATH!','#ffd166')}
      return;
    }
  }else{
    // sudden death has its own 20s: if still level, the round goes to a coin flip
    roundClock--;
    if(roundClock<=0){damage(tanks[Math.random()<.5?0:1],99,0,0);return}
  }
  pickupClock--;
  if(pickupClock<=0){pickupClock=300;if(pickups.length<2)spawnPickup()}
  for(let i=pickups.length-1;i>=0;i--){
    const p=pickups[i];p.age++;
    if(p.age>720){pickups.splice(i,1);continue}
    for(const t of tanks){
      if(t.roul)continue; // one spin at a time; the box stays for the other tank
      if(Math.hypot(t.x-p.x,t.y-p.y)<t.cls.radius+14){
        t.roul={n:66,idx:Math.random()*POWERS.length|0};
        sPick();pickups.splice(i,1);break;
      }
    }
  }
  for(let i=burns.length-1;i>=0;i--){
    const bn=burns[i];
    if(--bn.life<=0){burns.splice(i,1);continue}
    for(const t of tanks){
      if(t===bn.owner||t.inv>0)continue;
      if(Math.hypot(t.x-bn.x,t.y-bn.y)<t.cls.radius+11){
        damage(t,1,Math.atan2(t.y-bn.y,t.x-bn.x),5);
        if(state!=='play')return;
      }
    }
  }
  for(let i=mines.length-1;i>=0;i--){
    const mn=mines[i];
    if(mn.arm>0)mn.arm--;
    if(--mn.life<=0){mines.splice(i,1);continue}
    if(mn.arm<=0){
      const e=tanks[1-mn.owner.team];
      if(e.inv<=0&&Math.hypot(e.x-mn.x,e.y-mn.y)<e.cls.radius+9){
        mines.splice(i,1);explode(mn.x,mn.y,30,1,mn.owner);
        if(state!=='play')return;
      }
    }
  }
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];
    if(b.life&&--b.life<=0){
      if(b.air)explode(b.x+b.vx,b.y+b.vy,b.aoe,b.dmg,b.owner);
      // BLAZE perk: spent flames scorch the ground for a while
      if(GUNS[b.gun].burn&&burns.length<14)burns.push({x:b.x,y:b.y,life:90,owner:b.owner});
      if(GUNS[b.gun].mine&&mines.length<12)mines.push({x:b.x,y:b.y,owner:b.owner,arm:26,life:720});
      bullets.splice(i,1);
      if(state!=='play')return;
      continue;
    }
    if(b.air){b.px=b.x;b.py=b.y;b.x+=b.vx;b.y+=b.vy;continue}
    if(b.tpCd>0)b.tpCd--;
    const bt=tileAt(b.x,b.y);
    if((bt==='1'||bt==='2')&&b.tpCd<=0){
      const pair=portals[bt];
      const here=pair.find(p=>p.gx===(b.x/T|0)&&p.gy===(b.y/T|0));
      const other=pair.find(p=>p!==here);
      if(other){b.x=other.gx*T+T/2;b.y=other.gy*T+T/2;b.tpCd=30;burst(b.x,b.y,'#7ae0c3',4,2)}
    }
    if(bt==='o'){
      const gx=(b.x/T|0),gy=(b.y/T|0),cxp=gx*T+T/2,cyp=gy*T+T/2;
      const d=Math.hypot(b.x-cxp,b.y-cyp);
      if(d<13+b.r&&d>0){
        const ux=(b.x-cxp)/d,uy=(b.y-cyp)/d,dot=b.vx*ux+b.vy*uy;
        if(dot<0){b.vx-=2*dot*ux;b.vy-=2*dot*uy;sBounce()}
      }
    }
    const gh=b.phase;
    const hx=hitCell(b.x+b.vx,b.y,b.r,'bullet',b.vx,0,gh);
    const hy=hitCell(b.x,b.y+b.vy,b.r,'bullet',0,b.vy,gh);
    let hb=hx||hy||hitCell(b.x+b.vx,b.y+b.vy,b.r,'bullet',b.vx,b.vy,gh);
    const mv=moverHit(b.x+b.vx,b.y+b.vy,b.r);
    if(hb&&hb.c==='x'&&b.pierce){damageCrate(hb.gx,hb.gy,b.dmg);hb=null}
    if(hb||mv){
      if(hb&&hb.c==='x'){damageCrate(hb.gx,hb.gy,b.dmg);burst(b.x,b.y,'#ffd166',6,2.5);bullets.splice(i,1);continue}
      if(b.bounces>0){
        b.bounces--;
        if(hx||(mv&&Math.abs(b.vx)>Math.abs(b.vy)))b.vx=-b.vx;
        if(hy||(mv&&Math.abs(b.vy)>=Math.abs(b.vx)))b.vy=-b.vy;
        if(!hx&&!hy&&!mv){b.vx=-b.vx;b.vy=-b.vy}
        // RICOCHET perk: a banked shot hits harder
        if(b.owner&&b.owner.cls.trait==='bank'&&!b.hot){b.hot=true;b.dmg++}
        sBounce();burst(b.x,b.y,'#7ae0c3',3,2);
      }else{burst(b.x,b.y,'#ffd166',6,2.5);bullets.splice(i,1);continue}
    }
    b.px=b.x;b.py=b.y;b.x+=b.vx;b.y+=b.vy;
    let gone=false;
    for(const t of tanks){
      if(t===b.owner||t.inv>0)continue;
      const rr2=(t.cls.radius+b.r)*(t.cls.radius+b.r);
      if((b.x-t.x)*(b.x-t.x)+(b.y-t.y)*(b.y-t.y)<rr2){
        bullets.splice(i,1);gone=true;
        let d2=b.dmg;
        // LONGSHOT perk: the round gathers pace over distance
        if(GUNS[b.gun].falloff){const fl=Math.hypot(b.x-b.ox,b.y-b.oy);d2=fl<160?1:fl<340?2:3;
          if(d2===3)addFloat(t.x,t.y-30,'LONG SHOT!','#35a44a')}
        damage(t,d2,Math.atan2(b.vy,b.vx),b.knock!=null?b.knock:GUNS[b.gun].knock);
        break;
      }
    }
    if(state!=='play')return;
    if(gone)continue;
    for(let j=mines.length-1;j>=0;j--){
      if(Math.hypot(b.x-mines[j].x,b.y-mines[j].y)<b.r+9){
        burst(mines[j].x,mines[j].y,'#5d3d16',8,3);mines.splice(j,1);
        bullets.splice(i,1);break;
      }
    }
  }
}
