/* ================= ONLINE (self-hosted build only) =================
   Host-authoritative: the host simulates and broadcasts snapshots at 20Hz,
   the guest sends its input and renders what it is told. Needs relay-server.js. */
const RKEY='tanksmash_relay_v1';
/* Set this to your own Render service and players never have to type a URL.
   Order of preference: ?relay= in the link > saved value > this default. */
const DEFAULT_RELAY='wss://karhutrades.com/ws';
const NET={
  ws:null,role:null,code:'',status:'IDLE',msg:'',
  relay:'',editing:false,field:0,
  connected:false,peer:false,ready:false,waking:false,wakeTries:0,wakeStart:0,quick:false,qslot:0,
  theirClass:null,theirName:'OPPONENT',theirColor:'#35a44a',
  lastSent:null,sentAt:0,snapAt:0,lastRecv:0,ping:0,
};
let autoRoom='';
try{
  const qs=new URLSearchParams(location.search);
  const q=qs.get('relay');
  autoRoom=(qs.get('room')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
  NET.relay=q||localStorage.getItem(RKEY)||'';
  if(q)localStorage.setItem(RKEY,q);
}catch(e){}
if(!NET.relay){
  NET.relay=(location.hostname==='localhost'||location.hostname==='127.0.0.1')
    ?'ws://localhost:8787':DEFAULT_RELAY;
}
const netHost=()=>NET.role==='host';
function netSend(o){
  if(NET.ws&&NET.ws.readyState===1){try{NET.ws.send(JSON.stringify(o))}catch(e){}}
}
function netStatus(s,m){NET.status=s;NET.msg=m||''}
function netDisconnect(){
  if(NET.ws){try{NET.ws.close()}catch(e){}}
  NET.ws=null;NET.connected=false;NET.peer=false;NET.role=null;NET.theirClass=null;
}
function relayHttp(){return NET.relay.replace(/^wss:/,'https:').replace(/^ws:/,'http:')}
/* Free hosts sleep when idle. Poll /health first so a cold start shows as
   "waking" instead of a failed connection, then open the socket. */
async function netWake(){
  NET.waking=true;NET.wakeTries=0;NET.wakeStart=Date.now();
  for(let i=0;i<20;i++){
    NET.wakeTries=i+1;
    const secs=Math.round((Date.now()-NET.wakeStart)/1000);
    netStatus('WAKING','relay starting up · '+secs+'s (free hosts sleep when idle)');
    try{
      const ctl=new AbortController();
      const to=setTimeout(()=>ctl.abort(),5000);
      const r=await fetch(relayHttp()+'/health',{cache:'no-store',signal:ctl.signal});
      clearTimeout(to);
      if(r.ok){NET.waking=false;return true}
    }catch(e){}
    await new Promise(r=>setTimeout(r,2500));
  }
  NET.waking=false;
  return false; // try the socket anyway: /health may be blocked while WS is fine
}
async function netConnect(role,code){
  netDisconnect();
  NET.role=role==='auto'?null:role;NET.code=code;
  await netWake();
  if(NET.code!==code)return; // superseded while waking
  netStatus('CONNECTING','opening '+NET.relay);
  let ws;
  try{ws=new WebSocket(NET.relay)}
  catch(e){netStatus('FAILED','cannot open a socket here: '+e.message);return}
  NET.ws=ws;
  setTimeout(()=>{if(NET.ws===ws&&ws.readyState===0){netStatus('FAILED','no answer from '+NET.relay+' · check the URL (wss:// for https pages)')}},12000);
  ws.onopen=()=>{netStatus('WAITING',(NET.quick?'quick match':'room '+code)+' · waiting for the other player');netSend({t:'join',room:code,role:role==='auto'?undefined:role})};
  ws.onerror=()=>netStatus('FAILED','could not reach '+NET.relay);
  ws.onclose=()=>{if(NET.status!=='FAILED')netStatus('CLOSED','connection closed');NET.connected=false;NET.peer=false};
  ws.onmessage=ev=>{
    let m;try{m=JSON.parse(ev.data)}catch(e){return}
    NET.lastRecv=frame;
    if(m.t==='role'){NET.role=m.role;NET.connected=true;netStatus(m.peers>1?'READY':'WAITING',m.peers>1?'opponent connected':'room '+code+' · waiting');NET.peer=m.peers>1;if(NET.peer)netEnterSelect()}
    else if(m.t==='peer'){NET.peer=true;netStatus('READY','opponent connected');sLock();netEnterSelect()}
    else if(m.t==='peerleft'){NET.peer=false;NET.theirClass=null;netStatus('WAITING','opponent left');if(state!=='online'){toast={txt:'OPPONENT LEFT',life:200};goto('online')}}
    else if(m.t==='pick'){NET.theirClass=m.cls;NET.theirName=(m.name||'OPPONENT').slice(0,12);NET.theirColor=m.color||'#35a44a';if(netHost())netTryStart()}
    else if(m.t==='start'&&!netHost())netGuestStart(m);
    else if(m.t==='snap'&&!netHost())netApplySnap(m);
    else if(m.t==='in'&&netHost()){const o=tanks[1];if(o)o.netInput={dx:m.dx,dy:m.dy,fire:!!m.f}}
    else if(m.t==='full'){
      if(NET.quick&&NET.qslot<6){NET.qslot++;const nxt='PLAY'+(NET.qslot+1);
        netStatus('WAITING','room busy, trying another');NET.code=nxt;netSend({t:'join',room:nxt})}
      else{netStatus('FAILED','that room already has two players')}
    }
    else if(m.t==='bye'){NET.peer=false;netStatus('WAITING','opponent left')}
  };
}
function netEnterSelect(){
  if(state==='online'){mode='online';enterSelect()}
}
setInterval(()=>{if(NET.ws&&NET.ws.readyState===1)netSend({t:'hb'})},20000);
/* opened from a shared ?room= link: jump straight into that room */
if(autoRoom){
  mode='online';state='online';NET.code=autoRoom;
  setTimeout(()=>{audioOn();netConnect('auto',autoRoom)},350);
}
/* ---- lobby screen ---- */
const CODE_CHARS='0123456789';
function randomCode(){let s='';for(let i=0;i<4;i++)s+=CODE_CHARS[Math.random()*CODE_CHARS.length|0];return s}
function roomLink(code){
  const base=location.origin+location.pathname;
  return base+'?room='+code;
}
function copyLink(){
  const txt=roomLink(NET.code);
  try{
    navigator.clipboard.writeText(txt).then(
      ()=>{toast={txt:'LINK COPIED',life:170}},
      ()=>{toast={txt:txt,life:260}});
  }catch(e){toast={txt:txt,life:260}}
  sLock();
}
/* one key = play someone. everyone who presses it lands in the same lobby room. */
function quickMatch(){NET.qslot=0;NET.code='PLAY';NET.quick=true;netConnect('auto','PLAY');sLock()}
function privateRoom(){NET.code=randomCode();NET.quick=false;netConnect('host',NET.code);sLock()}
function joinTyped(){
  const c=typeBuf.replace(/[^0-9]/g,'').slice(0,4);
  if(c.length<4){toast={txt:'TYPE ALL 4 DIGITS',life:160};sBack();return}
  NET.code=c;NET.quick=false;typeBuf='';netConnect('auto',c);sLock();
}
function netKey(e){
  if(NET.editing){
    if(e.key&&e.key.length===1&&/[a-zA-Z0-9 _.:\/-]/.test(e.key)&&typeBuf.length<64)typeBuf+=e.key.toLowerCase();
    if(e.code==='Backspace')typeBuf=typeBuf.slice(0,-1);
    return;
  }
  if(/^[0-9]$/.test(e.key)&&typeBuf.length<4)typeBuf+=e.key;
  if(e.code==='Backspace')typeBuf=typeBuf.slice(0,-1);
}
stepOnline=function(){
  if(NET.editing){
    if(pressQ.has('Enter')){
      NET.relay=typeBuf.trim().toLowerCase()||NET.relay;
      try{localStorage.setItem(RKEY,NET.relay)}catch(e){}
      NET.editing=false;typeBuf='';sLock();
    }
    if(pressQ.has('Escape')){NET.editing=false;typeBuf='';sBack()}
    return;
  }
  // typing letters builds a room code; enter joins it
  if(typeBuf.length){
    if(pressQ.has('Enter')){joinTyped();return}
    if(pressQ.has('Escape')){typeBuf='';sBack();return}
    return;
  }
  if(pressQ.has('Space')){quickMatch();return}
  if(pressQ.has('KeyH')){privateRoom();return}
  if(pressQ.has('KeyL')&&NET.code){copyLink();return}
  if(pressQ.has('KeyR')){NET.editing=true;typeBuf=NET.relay;sTick();return}
  if(pressQ.has('KeyX')){netDisconnect();netStatus('IDLE','');NET.waking=false;sBack();return}
  if(navBack()){netDisconnect();sBack();goto('mode')}
};
drawOnline=function(){
  screenBg('#1e3350');
  splash('PLAY ONLINE',46,52);
  const busy=NET.waking||NET.status==='CONNECTING'||NET.status==='WAITING';
  if(NET.editing){
    panel(W/2-330,150,660,150,'#3d7ea6',16);
    label('RELAY SERVER ADDRESS',W/2,166,14,'#fff');
    label(typeBuf+((frame>>4)%2?'_':''),W/2,220,17,INK);
    label('ENTER to save   ·   ESC to cancel',W/2,262,13,'#8a8672');
    footer('BOTH PLAYERS MUST USE THE SAME RELAY');
    return;
  }
  if(busy){
    panel(W/2-300,140,600,190,'#3d7ea6',16);
    label(NET.waking?'WAKING THE SERVER':'CONNECTING',W/2,156,14,'#fff');
    // spinner of little tanks
    for(let i=0;i<3;i++){
      const a=frame*.05+i*2.1;
      cx.save();cx.translate(W/2+Math.cos(a)*54,232+Math.sin(a)*18);cx.scale(.7,.7);
      drawTankBody({x:0,y:0,ang:a,cls:CLASSES[i*3%CLASSES.length],recoil:0,dist:frame});
      cx.restore();
    }
    label(NET.msg||'talking to '+NET.relay,W/2,292,12,'#8a8672');
    if(NET.code)label(NET.quick?'QUICK MATCH':'ROOM '+NET.code,W/2,314,13,INK);
    footer('X TO CANCEL');
    drawToast();
    return;
  }
  // main lobby: three big choices
  const cards=[
    {k:'SPACE',t:'QUICK MATCH',s:'play whoever is waiting',c:'#35a44a'},
    {k:'0-9',t:typeBuf?typeBuf+((frame>>4)%2?'_':''):'JOIN A CODE',s:typeBuf?'ENTER to join':'just type the 4 digits',c:'#ffd23f'},
    {k:'H',t:'PRIVATE ROOM',s:'get a code + link to share',c:'#ef3e4a'},
  ];
  cards.forEach((cd,i)=>{
    const w=280,h=150,x=W/2-w*1.5-20+i*(w+20),y=132;
    if(i===1&&typeBuf)selectRing(x,y,w,h,cd.c,16);
    panel(x,y,w,h,cd.c,16);
    label(cd.t,x+w/2,y+16,15,'#fff');
    cx.fillStyle=INK;cx.font='900 30px system-ui,Arial,sans-serif';
    cx.textAlign='center';cx.textBaseline='middle';
    cx.fillText(cd.k,x+w/2,y+78);
    label(cd.s,x+w/2,y+120,12,'#8a8672');
  });
  // room / status strip
  panel(W/2-330,304,660,116,null,16);
  if(NET.status==='READY'||NET.peer){
    label('OPPONENT CONNECTED',W/2,330,15,'#35a44a');
    label('starting the tank select...',W/2,356,12,'#8a8672');
  }else if(NET.code&&NET.role){
    label('YOUR ROOM CODE',W/2-160,330,12,'#8a8672');
    cx.fillStyle=INK;cx.font='900 44px system-ui,Arial,sans-serif';
    cx.textAlign='center';cx.textBaseline='middle';cx.fillText(NET.code,W/2-160,368);
    label('SHARE THE LINK',W/2+150,330,12,'#8a8672');
    label(roomLink(NET.code).replace(/^https?:\/\//,'').slice(0,34),W/2+150,356,12,INK);
    label('PRESS L TO COPY IT',W/2+150,382,12,'#3d7ea6');
  }else{
    label('SPACE plays whoever is waiting. Or host a room and read out 4 digits.',W/2,340,14,INK);
    label(NET.status==='FAILED'?('problem: '+NET.msg):('relay: '+NET.relay.replace(/^wss?:\/\//,'')),
      W/2,372,12,NET.status==='FAILED'?'#ef3e4a':'#8a8672');
  }
  label('R  change relay server',W/2,436,12,'#c9c4ae');
  footer('ESC BACK   ·   IN A MATCH, WASD OR ARROWS BOTH DRIVE YOUR TANK');
  drawToast();
};
/* ---- select / start handshake ---- */
onLockIn=function(p){
  if(mode!=='online')return;
  netSend({t:'pick',cls:sel[0].i,name:prof(0).name,color:prof(0).color});
  if(netHost())netTryStart();
};
netBlockStart=function(){
  if(mode!=='online')return false;
  return !(NET.peer&&NET.theirClass!==null&&netHost());
};
function netTryStart(){
  if(!netHost()||!sel[0].locked||NET.theirClass===null)return;
  netStartMatch();
}
function netStartMatch(){
  mode='online';matchDone=false;
  tanks=[makeTank(0,sel[0].i,true,null,0,prof(0).color),
         makeTank(1,NET.theirClass,true,null,0,NET.theirColor)];
  tanks[0].netLocal=true;tanks[1].remote=true;tanks[1].netInput={dx:0,dy:0,fire:false};
  tanks[1].name=NET.theirName;
  tanks.forEach(t=>{t.teamColor=t.profColor||TEAMS[t.team].color});
  mapIndex=0;
  netSend({t:'start',mapIndex,a:sel[0].i,b:NET.theirClass,
    an:prof(0).name,ac:prof(0).color,scores:[0,0]});
  startRound();
}
function netGuestStart(m){
  mode='online';matchDone=false;
  // the guest is tank index 1 on the host, and drives it locally
  tanks=[makeTank(0,m.a,true,null,0,m.ac||'#ef3e4a'),
         makeTank(1,m.b,true,null,0,prof(0).color)];
  tanks[0].name=(m.an||'HOST').slice(0,12);
  tanks[1].name=prof(0).name;tanks[1].netLocal=true;
  tanks.forEach(t=>{t.teamColor=t.profColor||TEAMS[t.team].color});
  mapIndex=m.mapIndex|0;
  startRound();
}
/* ---- snapshots ---- */
function netSnapshot(){
  const dead=[];
  for(const k in crateHp)if(crateHp[k]<=0)dead.push(+k);
  return{t:'snap',f:frame,st:state,tm:timer,mi:mapIndex,
    tk:tanks.map(t=>({x:Math.round(t.x*4)/4,y:Math.round(t.y*4)/4,a:Math.round(t.ang*100)/100,ta:Math.round((t.tang==null?t.ang:t.tang)*100)/100,ru:t.roul?t.roul.idx:-1,
      hp:t.hp,iv:t.inv,sh:t.shield,rc:Math.round(t.recoil),ds:Math.round(t.dist),sc:t.score,
      fz:t.fx.frozen,rv:t.fx.reverse,st:t.fx.star,gh:t.fx.ghost})),
    bl:bullets.map(b=>({x:Math.round(b.x),y:Math.round(b.y),r:b.r,g:b.gun,
      ai:b.air?1:0,li:b.life,l0:b.life0,ph:b.phase?1:0,px:Math.round(b.px),py:Math.round(b.py)})),
    pu:pickups.map(p=>({x:p.x,y:p.y})),
    mn:mines.map(m=>({x:Math.round(m.x),y:Math.round(m.y),a:m.arm})),
    cr:dead,rw:roundWinner?roundWinner.team:-1};
}
function netApplySnap(m){
  if(m.mi!==mapIndex&&MAPS[m.mi]){mapIndex=m.mi;startRound()}
  frame=m.f;state=m.st;timer=m.tm;
  m.tk.forEach((s,i)=>{
    const t=tanks[i];if(!t)return;
    t.x=s.x;t.y=s.y;t.ang=s.a;t.tang=s.ta;t.hp=s.hp;t.inv=s.iv;t.shield=s.sh;
    t.roul=s.ru>=0?{n:99,idx:s.ru}:null;
    t.recoil=s.rc;t.dist=s.ds;t.score=s.sc;
    t.fx.frozen=s.fz;t.fx.reverse=s.rv;t.fx.star=s.st;t.fx.ghost=s.gh;
  });
  bullets=m.bl.map(b=>({x:b.x,y:b.y,px:b.px,py:b.py,r:b.r,gun:b.g,air:!!b.ai,
    life:b.li,life0:b.l0,phase:!!b.ph,vx:0,vy:0,dmg:1,bounces:0}));
  pickups=m.pu.map(p=>({x:p.x,y:p.y,age:0}));
  mines=m.mn.map(x=>({x:x.x,y:x.y,arm:x.a,life:900,owner:tanks[0]}));
  for(const k of m.cr){if(crateHp[k]>0){crateHp[k]=0;const gx=k%COLS,gy=(k/COLS)|0;cells[gy][gx]='.'}}
  roundWinner=m.rw>=0?tanks[m.rw]:roundWinner;
}
/* ---- drive the loop ---- */
const _step=step;
step=function(){
  if(mode!=='online'||!NET.connected||state==='online'||state==='mode'||state==='title'||state==='profiles'||state==='name'){
    _step();return;
  }
  if(netHost()){
    _step();
    if(frame%3===0)netSend(netSnapshot());
  }else{
    // guest: cosmetics locally, everything else comes from the host
    frame++;
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.92;p.vy*=.92;if(--p.life<=0)parts.splice(i,1)}
    for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.y-=.7;if(--f.life<=0)floats.splice(i,1)}
    for(let i=marks.length-1;i>=0;i--){if(--marks[i].life<=0)marks.splice(i,1)}
    if(shake>0)shake*=.86;
    stepAmbient();
    if(state==='select'){stepSelect();pressQ.clear();return}
    const t=tanks[1];
    if(t){
      const inp=humanInput(t);
      const sig=inp.dx+','+inp.dy+','+inp.fire;
      if(sig!==NET.lastSent||frame-NET.sentAt>10){
        NET.lastSent=sig;NET.sentAt=frame;
        netSend({t:'in',dx:inp.dx,dy:inp.dy,f:inp.fire});
      }
      if(inp.dx||inp.dy)t.ang=lerpAngle(t.ang,Math.atan2(inp.dy,inp.dx),.3); // hull only; turret comes from the host
    }
    if(state==='game'&&navOk()){netSend({t:'again'});}
    pressQ.clear();
  }
};
/* connection loss during a match drops you back to the lobby */
const _draw=draw;
draw=function(){
  _draw();
  if(mode==='online'&&NET.connected&&state!=='online'){
    const bad=!NET.peer;
    panel(W-190,H-30,176,22,null,8);
    label(bad?'OPPONENT LOST':(netHost()?'ONLINE · HOST':'ONLINE · GUEST'),W-102,H-19,11,bad?'#ef3e4a':'#8a8672');
  }
};
