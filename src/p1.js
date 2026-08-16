'use strict';
const cv=document.getElementById('c'),cx=cv.getContext('2d');
const W=960,H=600,T=40,COLS=24,ROWS=15;
const INK='#22233b',CREAM='#fff4e0';
const WIN_SCORE=3,BULLET_INVUL=28;
const TEAMS=[{tag:'P1',color:'#ef3e4a'},{tag:'P2',color:'#35a44a'}];
const SWATCHES=['#ef3e4a','#ff8c42','#ffd23f','#35a44a','#2ec4b6','#3d7ea6','#a06cd5','#f06fa8'];

/* ---------------- guns & tank classes ---------------- */
const GUNS={
  rapid:   {cd:9,maxLive:5,dmg:1,spd:8.8,br:4,jitter:.09,knock:6,range:360},
  cannon:  {cd:28,maxLive:3,dmg:1,spd:7.3,br:5,knock:9,range:420},
  shell:   {cd:42,maxLive:2,dmg:2,spd:6,br:8,knock:15,range:400},
  sniper:  {cd:48,maxLive:1,dmg:2,spd:13,br:4.5,knock:12,trail:1,range:700},
  scatter: {cd:28,maxLive:12,dmg:1,spd:7.6,br:5,pellets:4,spread:.26,life:30,knock:8,range:230},
  ricochet:{cd:31,maxLive:2,dmg:1,spd:6.8,br:5,bounces:2,knock:9,range:420},
  mortar:  {cd:86,maxLive:1,dmg:2,spd:6,br:7,air:1,life:50,aoe:38,knock:12,range:400,minR:90,fuseErr:150},
  flame:   {cd:4,maxLive:14,dmg:1,spd:7,br:4.5,jitter:.26,life:20,knock:2,range:155},
  phase:   {cd:44,maxLive:1,dmg:2,spd:6.6,br:5.5,phase:1,knock:10,range:520},
};
const CLASSES=[
  {name:'SCOUT',   skin:'scout',   gun:'rapid',   color:'#ffd23f',dark:'#cba317',light:'#ffe89a',hp:4,speed:3.9,radius:14,  bl:20,desc:'TWIN RAPID GUNS',     pips:[5,2,2],perk:'GUN SPINS UP AS YOU HOLD FIRE',unlock:null},
  {name:'BRAWLER', skin:'brawler', gun:'cannon',  color:'#ef3e4a',dark:'#b3202c',light:'#ff7d85',hp:5,speed:3.1,radius:15,  bl:26,desc:'BALANCED CANNON',     pips:[3,3,3],perk:'EVERY 4TH SHELL IS HEAVY',unlock:null},
  {name:'TITAN',   skin:'titan',   gun:'shell',   color:'#3d7ea6',dark:'#2a5f80',light:'#6fb0d8',hp:7,speed:2.4,radius:17,  bl:24,desc:'HEAVY SHELL · 2 DMG', pips:[1,5,5],perk:'BARELY MOVED BY HITS',unlock:null},
  {name:'LONGSHOT',skin:'longshot',gun:'sniper',  color:'#35a44a',dark:'#1f7c32',light:'#6cd07e',hp:4,speed:3.3,radius:14,  bl:34,desc:'SNIPER · 1-3 DMG BY RANGE',pips:[3,2,4],perk:'DAMAGE GROWS WITH DISTANCE',unlock:null},
  {name:'SCATTER', skin:'scatter', gun:'scatter', color:'#ff8c42',dark:'#d3652a',light:'#ffb27a',hp:5,speed:3.0,radius:15,  bl:18,desc:'TRIPLE SPREAD SHOT',  pips:[3,3,4],perk:'STAND STILL FOR A TIGHT SPREAD',unlock:{k:'wins',n:2, txt:'WIN 2 MATCHES'}},
  {name:'RICOCHET',skin:'ricochet',gun:'ricochet',color:'#2ec4b6',dark:'#1e8f85',light:'#6ce4d8',hp:5,speed:3.2,radius:15,  bl:24,desc:'BOUNCES OFF WALLS',   pips:[4,3,3],perk:'BOUNCED SHOTS HIT HARDER',unlock:{k:'kos', n:15,txt:'SCORE 15 KOs'}},
  {name:'BOMBARD', skin:'bombard', gun:'mortar',  color:'#8a9a2f',dark:'#66741f',light:'#c3d45e',hp:5,speed:2.7,radius:16,  bl:16,desc:'LOBS OVER WALLS',     pips:[2,4,4],perk:'HOLD FIRE TO AIM THE ARC, RELEASE TO LOB',unlock:{k:'campaign',n:4,txt:'CLEAR 4 CAMPAIGN STAGES'}},
  {name:'BLAZE',   skin:'blaze',   gun:'flame',   color:'#d95d39',dark:'#a83f22',light:'#f28f6e',hp:5,speed:3.4,radius:14.5,bl:18,desc:'SHORT RANGE FLAME',   pips:[4,3,3],perk:'FLAMES LEAVE BURNING GROUND',unlock:{k:'wins',n:6, txt:'WIN 6 MATCHES'}},
  {name:'PHANTOM', skin:'phantom', gun:'phase',   color:'#8d99ae',dark:'#5f6b80',light:'#c3ccdd',hp:5,speed:3.3,radius:14.5,bl:24,desc:'2 DMG THROUGH WALLS',pips:[3,3,4],perk:'EACH SHOT PHASES YOU THROUGH WALLS',unlock:{k:'campaign',n:9,txt:'CLEAR 9 CAMPAIGN STAGES'}},
];

/* ---------------- pilots: a drawn character per tank ----------------
   skin/hair/gear are drawn as vectors so the whole game stays one small file */
const PILOTS={
  scout:   {skin:'#ffd9a8',gear:'goggles',gearA:'#f4a259',gearB:'#c97f2e',eyes:'wide',  mouth:'grin',   hair:'#7a4a1e'},
  brawler: {skin:'#e8b98a',gear:'cap',    gearA:'#ef3e4a',gearB:'#b3202c',eyes:'normal',mouth:'smirk',  hair:'#3b2413'},
  titan:   {skin:'#d9a072',gear:'helmet', gearA:'#3d7ea6',gearB:'#2a5f80',eyes:'squint',mouth:'flat',   hair:'#241a12'},
  longshot:{skin:'#ffe0c0',gear:'visor',  gearA:'#35a44a',gearB:'#1f7c32',eyes:'sharp', mouth:'flat',   hair:'#d8b45a'},
  scatter: {skin:'#f0c093',gear:'bandana',gearA:'#ff8c42',gearB:'#d3652a',eyes:'wide',  mouth:'grin',   hair:'#4a2c14'},
  ricochet:{skin:'#ffd9a8',gear:'headset',gearA:'#2ec4b6',gearB:'#1e8f85',eyes:'normal',mouth:'smirk',  hair:'#6b4a8f'},
  bombard: {skin:'#c98f63',gear:'helmet', gearA:'#8a9a2f',gearB:'#66741f',eyes:'squint',mouth:'grin',   hair:'#2b2b1c'},
  blaze:   {skin:'#e8b98a',gear:'goggles',gearA:'#d95d39',gearB:'#a83f22',eyes:'sharp', mouth:'fangs',  hair:'#8f2b12'},
  phantom: {skin:'#cfd6e6',gear:'hood',   gearA:'#8d99ae',gearB:'#5f6b80',eyes:'glow',  mouth:'none',   hair:'#43506b'},
};

/* ---------------- powerups ---------------- */
const POWERS=[
  {id:'rapid', glyph:'R', color:'#ef3e4a', dur:480, label:'RAPID FIRE'},
  {id:'triple',glyph:'3', color:'#ef3e4a', dur:480, label:'TRIPLE SHOT'},
  {id:'big',   glyph:'B', color:'#ef3e4a', dur:480, label:'BIG BULLETS'},
  {id:'pierce',glyph:'P', color:'#ef3e4a', dur:480, label:'PIERCING'},
  {id:'shield',glyph:'S', color:'#3d7ea6',          label:'SHIELD'},
  {id:'heal',  glyph:'+', color:'#35a44a',          label:'+2 HP'},
  {id:'star',  glyph:'*', color:'#e7a600', dur:300, label:'STAR POWER'},
  {id:'speed', glyph:'>', color:'#2ec4b6', dur:480, label:'SPEED UP'},
  {id:'ghost', glyph:'G', color:'#8d99ae', dur:240, label:'GHOST'},
  {id:'mine',  glyph:'M', color:'#5d3d16',          label:'MINES x3'},
  {id:'freeze',glyph:'F', color:'#4c93d9',          label:'ENEMY FROZEN'},
  {id:'flip',  glyph:'?', color:'#ff8c42',          label:'ENEMY FLIPPED'},
];

/* ---------------- AI difficulty ---------------- */
const AI_LEVELS=[
  {name:'EASY',  react:14,aimErr:.30,aimTol:.38,dodge:.12,seek:false,lead:false,speedMul:.82,fireGap:26,desc:'SLOW REACTIONS, SLOPPY AIM'},
  {name:'NORMAL',react:7, aimErr:.14,aimTol:.24,dodge:.45,seek:true, lead:true, speedMul:1,  fireGap:8, desc:'FAIR FIGHT, DECENT AIM'},
  {name:'HARD',  react:3, aimErr:.045,aimTol:.14,dodge:.85,seek:true, lead:true, speedMul:1.05,fireGap:0,desc:'LEADS SHOTS, DODGES, HUNTS PICKUPS'},
];

/* ---------------- profiles (localStorage) ---------------- */
const PKEY='tanksmash_profiles_v1';
let profiles=[],slots=[0,1],store=true;
function blankProfile(name){
  return{name:name||'PLAYER',color:SWATCHES[0],last:1,
    stats:{wins:0,losses:0,kos:0,rounds:0,campaign:0,plays:{}}};
}
function loadProfiles(){
  try{
    const raw=localStorage.getItem(PKEY);
    if(raw){const d=JSON.parse(raw);profiles=d.profiles||[];slots=d.slots||[0,1]}
  }catch(e){store=false}
  if(!profiles.length)profiles=[blankProfile('PLAYER 1'),blankProfile('PLAYER 2')];
  profiles.forEach(p=>{
    p.stats=p.stats||{};
    const s=p.stats;
    s.wins=s.wins|0;s.losses=s.losses|0;s.kos=s.kos|0;s.rounds=s.rounds|0;s.campaign=s.campaign|0;
    s.plays=s.plays||{};
    if(typeof p.last!=='number')p.last=1;
    if(!p.color)p.color=SWATCHES[0];
  });
  if(profiles[1])profiles[1].color=profiles[1].color===profiles[0].color?SWATCHES[3]:profiles[1].color;
  slots=[Math.min(slots[0]|0,profiles.length-1),Math.min(slots[1]|0,profiles.length-1)];
}
function saveProfiles(){
  if(!store)return;
  try{localStorage.setItem(PKEY,JSON.stringify({profiles,slots}))}catch(e){store=false}
}
function prof(team){return profiles[slots[team]]||profiles[0]}
function isUnlocked(ci,p){
  const u=CLASSES[ci].unlock;
  if(!u||!p)return true;
  return (p.stats[u.k]|0)>=u.n;
}
function unlockedCount(p){return CLASSES.filter((c,i)=>isUnlocked(i,p)).length}
function teamColor(team){
  const t=tanks&&tanks[team];
  if(t&&t.profColor)return t.profColor;
  const p=prof(team);
  return (p&&p.color)||TEAMS[team].color;
}
loadProfiles();

/* ---------------- audio ---------------- */
let AC=null,muted=false;
function audioOn(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume()}
function sfx(f0,f1,dur,type,vol){
  if(muted||!AC)return;
  const t0=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t0+dur);
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+dur);
  o.connect(g);g.connect(AC.destination);o.start(t0);o.stop(t0+dur);
}
const SND={
  rapid:()=>sfx(500,200,.08,'square',.06), cannon:()=>sfx(340,120,.12,'square',.08),
  shell:()=>sfx(180,55,.22,'sawtooth',.12), sniper:()=>sfx(700,150,.14,'square',.09),
  scatter:()=>sfx(300,90,.14,'sawtooth',.09), ricochet:()=>sfx(420,160,.11,'square',.07),
  mortar:()=>sfx(140,320,.25,'triangle',.11), flame:()=>sfx(160,90,.06,'sawtooth',.03),
  phase:()=>sfx(880,220,.25,'sine',.08),
};
const sHit=()=>sfx(160,60,.18,'sawtooth',.14), sKO=()=>sfx(500,40,.5,'sawtooth',.18);
const sGo=()=>sfx(660,660,.15,'square',.12), sTick=()=>sfx(440,440,.1,'square',.08);
const sStar=()=>sfx(880,1320,.2,'triangle',.1), sBounce=()=>sfx(520,300,.08,'square',.06);
const sCrate=()=>sfx(200,90,.12,'square',.1), sLock=()=>sfx(550,830,.14,'triangle',.11);
const sPick=()=>sfx(620,930,.16,'triangle',.12), sBoing=()=>sfx(180,520,.16,'square',.1);
const sTele=()=>sfx(300,900,.2,'sine',.1), sBoom=()=>sfx(120,35,.4,'sawtooth',.16);
const sFrz=()=>sfx(900,200,.3,'sine',.1), sMine=()=>sfx(700,700,.05,'square',.07);
const sBack=()=>sfx(300,200,.1,'square',.07), sUnlock=()=>sfx(520,1040,.35,'triangle',.14);

/* ---------------- music: chiptune tracker v2 ----------------
   16th-note sequencer, two hand-written sections per world, bass, drums,
   and playback variation (A A B A form, octave lift on the 4th pass,
   harmony on B, a drum fill into each new pass) so nothing loops in your
   ear. All synthesized live - no audio files. */
const __=null;
const SONGS={
 menu:{bpm:112,wave:'square',root:50,
  A:[0,__,4,__,7,__,12,__,11,__,9,__,7,__,4,__,5,__,7,__,9,__,7,__,4,__,2,__,0,__,__,__],
  B:[12,__,__,11,__,__,9,__,7,__,9,__,11,__,12,__,14,__,__,12,__,__,11,__,9,__,7,__,4,__,2,__],
  bassA:[0,0,7,7,9,9,5,5],bassB:[5,5,4,4,2,2,0,0],drums:'k.h.s.h.k.h.s.hh'},
 meadow:{bpm:122,wave:'square',root:48,
  A:[0,__,7,__,4,__,7,__,9,__,7,__,5,4,2,__,4,__,7,__,12,__,9,__,7,__,5,__,4,2,0,__],
  B:[12,__,11,__,9,__,12,__,14,__,12,__,11,9,7,__,9,__,7,__,5,__,4,__,5,__,7,__,2,__,4,__],
  bassA:[0,0,5,5,7,7,5,5],bassB:[9,9,7,7,5,5,0,0],drums:'k.h.s.h.k.hhs.h.'},
 desert:{bpm:104,wave:'square',root:45,
  A:[0,__,__,3,__,__,5,__,7,__,8,__,7,5,3,__,0,__,__,3,__,__,5,__,10,__,8,__,7,__,5,__],
  B:[12,__,__,10,__,__,8,__,7,__,8,__,10,__,12,__,15,__,12,__,10,__,8,__,7,__,5,__,3,__,0,__],
  bassA:[0,0,0,0,3,3,5,5],bassB:[0,0,5,5,3,3,0,0],drums:'k..hs..hk.h.s..h'},
 frost:{bpm:92,wave:'triangle',root:52,
  A:[0,__,__,__,7,__,__,__,12,__,__,11,__,__,9,__,7,__,__,__,9,__,__,__,11,__,__,7,__,__,4,__],
  B:[14,__,__,__,12,__,__,__,9,__,__,11,__,__,12,__,7,__,__,__,4,__,__,__,5,__,__,2,__,__,0,__],
  bassA:[0,0,4,4,7,7,4,4],bassB:[5,5,7,7,4,4,0,0],drums:'..h...h...h...h.'},
 volcano:{bpm:138,wave:'sawtooth',root:43,
  A:[0,0,__,1,__,5,__,1,0,0,__,7,__,5,__,1,0,0,__,1,__,5,__,8,7,__,5,__,1,__,0,__],
  B:[12,__,8,__,7,__,8,__,12,13,12,__,8,__,7,__,5,__,7,__,8,__,10,__,12,__,8,__,7,__,5,__],
  bassA:[0,0,0,0,1,1,3,3],bassB:[5,5,3,3,1,1,0,0],drums:'kkh.s.h.kkh.s.hh'},
 factory:{bpm:126,wave:'square',root:47,
  A:[0,__,10,__,7,__,5,__,0,__,10,__,7,10,12,__,0,__,10,__,7,__,5,__,3,__,5,__,7,__,10,__],
  B:[12,__,__,10,12,__,__,10,7,__,5,__,7,__,10,__,12,__,__,15,__,__,12,__,10,__,7,__,5,__,3,__],
  bassA:[0,7,0,7,5,10,5,10],bassB:[3,10,3,10,0,7,0,7],drums:'k.hhs.h.k.hhs.hk'},
};
let musicOn=true,musicGain=null,musicTimer=null,musicTune=null,seqPos=0,noiseBuf=null;
function noteHz(m){return 440*Math.pow(2,(m-69)/12)}
function noiseBuffer(){
  if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.3|0,AC.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  return noiseBuf;
}
function playMusic(key){
  const tune=SONGS[key]||SONGS.menu;
  if(musicTune===tune&&musicTimer)return;
  musicTune=tune;stopMusic();
  if(!AC||!musicOn)return;
  musicGain=AC.createGain();musicGain.gain.value=.062;musicGain.connect(AC.destination);
  seqPos=0;
  const stepMs=60/tune.bpm/4*1000;
  musicTimer=setInterval(()=>{
    if(!AC||!musicGain)return;
    const i=seqPos%32,section=((seqPos/32)|0)%4; // A A B A(octave up)
    const t0=AC.currentTime+.02+((i%2)?stepMs*.00012:0),dur=stepMs/1000;
    const V=(semi,wave,d,vol)=>{const o=AC.createOscillator(),g=AC.createGain();
      o.type=wave;o.frequency.value=noteHz(semi);
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.012);
      g.gain.exponentialRampToValueAtTime(.0006,t0+d);
      o.connect(g);g.connect(musicGain);o.start(t0);o.stop(t0+d+.03)};
    const N=(d,vol,rate)=>{const sr=AC.createBufferSource(),g=AC.createGain();
      sr.buffer=noiseBuffer();sr.playbackRate.value=rate;
      g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0008,t0+d);
      sr.connect(g);g.connect(musicGain);sr.start(t0);sr.stop(t0+d)};
    const sec=section===2?tune.B:tune.A,n=sec[i];
    if(n!==__&&n!==undefined){
      V(tune.root+24+n+(section===3?12:0),tune.wave,dur*3.2,.5);
      if(section===2)V(tune.root+24+n+7,'triangle',dur*2.6,.2);
    }
    if(i%4===0)V(tune.root+(section===2?tune.bassB:tune.bassA)[(i/4)|0],'triangle',dur*5,.8);
    const ch=tune.drums[i%16];
    if(ch==='k'){const o=AC.createOscillator(),g=AC.createGain();
      o.type='sine';o.frequency.setValueAtTime(120,t0);o.frequency.exponentialRampToValueAtTime(42,t0+.1);
      g.gain.setValueAtTime(.5,t0);g.gain.exponentialRampToValueAtTime(.001,t0+.12);
      o.connect(g);g.connect(musicGain);o.start(t0);o.stop(t0+.13)}
    else if(ch==='s')N(.08,.16,1);
    else if(ch==='h')N(.03,.07,2.4);
    if(section===3&&i>=28)N(.05,.12,1.4); // fill into the next pass
    seqPos++;
  },stepMs);
}
function stopMusic(){
  if(musicTimer){clearInterval(musicTimer);musicTimer=null}
  if(musicGain){try{musicGain.disconnect()}catch(e){}musicGain=null}
}
function toggleMusic(){musicOn=!musicOn;if(!musicOn)stopMusic();else{musicTune=null;playMusic(currentTune())}}
/* jingles + countdown blips */
function jingle(midis,gap,wave,vol){
  if(muted||!AC)return;
  const t0=AC.currentTime;
  midis.forEach((m,i)=>{const o=AC.createOscillator(),g=AC.createGain();
    o.type=wave;o.frequency.value=noteHz(m);
    const ts=t0+i*gap;g.gain.setValueAtTime(0,ts);g.gain.linearRampToValueAtTime(vol,ts+.015);
    g.gain.exponentialRampToValueAtTime(.001,ts+gap*1.9);
    o.connect(g);g.connect(AC.destination);o.start(ts);o.stop(ts+gap*2)});
}
const jWin=()=>jingle([72,76,79,84],.11,'square',.12);
const jGame=()=>jingle([72,76,79,84,88,84,91],.12,'square',.13);
const sCd=()=>sfx(440,440,.09,'square',.13);
const sChg=p=>sfx(220+p*420,220+p*420,.05,'triangle',.07);
const sCdGo=()=>sfx(880,880,.3,'square',.15);

/* ---------------- input ---------------- *//* ---------------- input ---------------- */
function toggleFullscreen(){
  try{
    const el=(document.querySelector&&document.querySelector('.wrap'))||cv;
    if(document.fullscreenElement)document.exitFullscreen();
    else if(el.requestFullscreen)el.requestFullscreen();
  }catch(e){}
}
if(cv.addEventListener)cv.addEventListener('dblclick',toggleFullscreen);
const keys={},pressQ=new Set();
let typeBuf='';
addEventListener('keydown',e=>{
  audioOn();
  if(['Space','Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(e.code==='KeyM'&&!e.repeat&&state!=='name'&&state!=='online')muted=!muted;
  if(e.code==='KeyN'&&!e.repeat&&state!=='name'&&state!=='online')toggleMusic();
  if(state==='name'){
    if(e.key&&e.key.length===1&&/[A-Za-z0-9 _-]/.test(e.key)&&typeBuf.length<12)typeBuf+=e.key.toUpperCase();
    if(e.code==='Backspace')typeBuf=typeBuf.slice(0,-1);
  }else if(state==='online'&&typeof netKey==='function'){
    netKey(e); // the lobby decides what counts as typing (digits for codes, URLs when editing)
  }
  if(e.code==='KeyF'&&!e.repeat&&state!=='name')toggleFullscreen();
  if(!e.repeat)pressQ.add(e.code);
  keys[e.code]=true;
});
addEventListener('keyup',e=>{keys[e.code]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
const KEYMAP=[
  {up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',fire:'Space'},
  {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',fire:'Enter'},
];
const anyPress=(...codes)=>codes.some(c=>pressQ.has(c));
const navUp=()=>anyPress('KeyW','ArrowUp'), navDown=()=>anyPress('KeyS','ArrowDown');
const navLeft=()=>anyPress('KeyA','ArrowLeft'), navRight=()=>anyPress('KeyD','ArrowRight');
const navOk=()=>anyPress('Space','Enter'), navBack=()=>anyPress('Escape','Backspace');
