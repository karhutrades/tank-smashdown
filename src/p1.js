'use strict';
const cv=document.getElementById('c'),cx=cv.getContext('2d');
const W=960,H=600,T=40,COLS=24,ROWS=15;
const INK='#22233b',CREAM='#fff4e0';
const WIN_SCORE=3,BULLET_INVUL=28;
const TEAMS=[{tag:'P1',color:'#ef3e4a'},{tag:'P2',color:'#35a44a'}];
const SWATCHES=['#ef3e4a','#ff8c42','#ffd23f','#35a44a','#2ec4b6','#3d7ea6','#a06cd5','#f06fa8'];

/* ---------------- guns & tank classes ---------------- */
const GUNS={
  rapid:   {cd:10,maxLive:4,dmg:1,spd:8.5,br:4,jitter:.09,knock:6,range:340},
  cannon:  {cd:22,maxLive:3,dmg:1,spd:7.5,br:5,knock:9,range:420},
  shell:   {cd:46,maxLive:2,dmg:2,spd:5.5,br:8,knock:15,range:380},
  sniper:  {cd:55,maxLive:1,dmg:2,spd:13,br:4.5,knock:12,trail:1,range:700},
  scatter: {cd:38,maxLive:6,dmg:1,spd:7,br:4,pellets:3,spread:.24,life:26,knock:7,range:180},
  ricochet:{cd:26,maxLive:2,dmg:1,spd:7.2,br:5,bounces:2,knock:9,range:420},
  mortar:  {cd:60,maxLive:2,dmg:2,spd:6,br:7,air:1,life:50,aoe:48,knock:12,range:300},
  flame:   {cd:4,maxLive:10,dmg:1,spd:5.5,br:4,jitter:.35,life:13,knock:2,range:75},
  phase:   {cd:42,maxLive:1,dmg:1,spd:5.2,br:5.5,phase:1,knock:8,range:500},
};
const CLASSES=[
  {name:'SCOUT',   skin:'scout',   gun:'rapid',   color:'#ffd23f',dark:'#cba317',light:'#ffe89a',hp:4,speed:3.9,radius:14,  bl:20,desc:'TWIN RAPID GUNS',     pips:[5,2,2],unlock:null},
  {name:'BRAWLER', skin:'brawler', gun:'cannon',  color:'#ef3e4a',dark:'#b3202c',light:'#ff7d85',hp:5,speed:3.1,radius:15,  bl:26,desc:'BALANCED CANNON',     pips:[3,3,3],unlock:null},
  {name:'TITAN',   skin:'titan',   gun:'shell',   color:'#3d7ea6',dark:'#2a5f80',light:'#6fb0d8',hp:7,speed:2.4,radius:17,  bl:24,desc:'HEAVY SHELL · 2 DMG', pips:[1,5,5],unlock:null},
  {name:'LONGSHOT',skin:'longshot',gun:'sniper',  color:'#35a44a',dark:'#1f7c32',light:'#6cd07e',hp:4,speed:3.3,radius:14,  bl:34,desc:'SNIPER ROUND · 2 DMG',pips:[3,2,4],unlock:null},
  {name:'SCATTER', skin:'scatter', gun:'scatter', color:'#ff8c42',dark:'#d3652a',light:'#ffb27a',hp:5,speed:3.0,radius:15,  bl:18,desc:'TRIPLE SPREAD SHOT',  pips:[3,3,4],unlock:{k:'wins',n:2, txt:'WIN 2 MATCHES'}},
  {name:'RICOCHET',skin:'ricochet',gun:'ricochet',color:'#2ec4b6',dark:'#1e8f85',light:'#6ce4d8',hp:5,speed:3.2,radius:15,  bl:24,desc:'BOUNCES OFF WALLS',   pips:[4,3,3],unlock:{k:'kos', n:15,txt:'SCORE 15 KOs'}},
  {name:'BOMBARD', skin:'bombard', gun:'mortar',  color:'#8a9a2f',dark:'#66741f',light:'#c3d45e',hp:5,speed:2.7,radius:16,  bl:16,desc:'LOBS OVER WALLS',     pips:[2,4,4],unlock:{k:'campaign',n:4,txt:'CLEAR 4 CAMPAIGN STAGES'}},
  {name:'BLAZE',   skin:'blaze',   gun:'flame',   color:'#d95d39',dark:'#a83f22',light:'#f28f6e',hp:5,speed:3.4,radius:14.5,bl:18,desc:'SHORT RANGE FLAME',   pips:[4,3,3],unlock:{k:'wins',n:6, txt:'WIN 6 MATCHES'}},
  {name:'PHANTOM', skin:'phantom', gun:'phase',   color:'#8d99ae',dark:'#5f6b80',light:'#c3ccdd',hp:4,speed:3.3,radius:14.5,bl:24,desc:'SHOOTS THROUGH WALLS',pips:[3,2,4],unlock:{k:'campaign',n:9,txt:'CLEAR 9 CAMPAIGN STAGES'}},
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

/* ---------------- music: a tiny chiptune sequencer ----------------
   One bass + one lead voice, a different tune per world, so every arena
   sounds like its own place without shipping any audio files. */
const TUNES={
  menu:    {bpm:104,wave:'triangle',lead:[0,4,7,12,11,7,4,2, 0,4,7,12,14,12,7,4],bass:[0,0,7,7,5,5,7,7]},
  meadow:  {bpm:120,wave:'square',  lead:[0,4,7,9,7,4,2,4, 5,4,2,0,2,4,7,4],   bass:[0,0,5,5,7,7,5,5]},
  desert:  {bpm:108,wave:'square',  lead:[0,3,5,3,7,5,3,0, 10,7,5,3,5,3,0,-2], bass:[0,0,3,3,5,5,3,3]},
  frost:   {bpm:96, wave:'triangle',lead:[0,7,12,7,9,12,16,12, 14,12,9,7,9,7,5,7],bass:[0,0,4,4,7,7,4,4]},
  volcano: {bpm:132,wave:'sawtooth',lead:[0,1,5,7,8,7,5,1, 0,1,5,8,10,8,5,1],  bass:[0,0,0,3,5,5,3,3]},
  factory: {bpm:126,wave:'square',  lead:[0,5,7,10,7,5,3,5, 12,10,7,5,7,5,3,0],bass:[0,7,0,7,5,10,5,10]},
};
let musicOn=true,musicGain=null,musicTimer=null,musicStep=0,musicTune=null,musicRoot=48;
function noteHz(semi){return 440*Math.pow(2,(semi-9)/12)}
function playMusic(key){
  const tune=TUNES[key]||TUNES.menu;
  if(musicTune===tune&&musicTimer)return;
  musicTune=tune;
  stopMusic();
  if(!AC||!musicOn)return;
  musicGain=AC.createGain();musicGain.gain.value=.055;musicGain.connect(AC.destination);
  musicStep=0;
  const beat=60/tune.bpm/2;
  musicTimer=setInterval(()=>{
    if(!AC||!musicGain)return;
    const t0=AC.currentTime,i=musicStep%tune.lead.length;
    const voice=(semi,wave,dur,vol,detune)=>{
      const o=AC.createOscillator(),g=AC.createGain();
      o.type=wave;o.frequency.value=noteHz(semi)+(detune||0);
      g.gain.setValueAtTime(0,t0);
      g.gain.linearRampToValueAtTime(vol,t0+.012);
      g.gain.exponentialRampToValueAtTime(.0006,t0+dur);
      o.connect(g);g.connect(musicGain);o.start(t0);o.stop(t0+dur+.02);
    };
    voice(musicRoot+12+tune.lead[i],tune.wave,beat*.9,.5);
    if(musicStep%2===0)voice(musicRoot-12+tune.bass[(musicStep/2)%tune.bass.length],'triangle',beat*1.6,.75);
    musicStep++;
  },beat*1000);
}
function stopMusic(){
  if(musicTimer){clearInterval(musicTimer);musicTimer=null}
  if(musicGain){try{musicGain.disconnect()}catch(e){}musicGain=null}
}
function toggleMusic(){musicOn=!musicOn;if(!musicOn)stopMusic();else{musicTune=null;playMusic(currentTune())}}

/* ---------------- input ---------------- */
const keys={},pressQ=new Set();
let typeBuf='';
addEventListener('keydown',e=>{
  audioOn();
  if(['Space','Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(e.code==='KeyM'&&!e.repeat&&state!=='name'&&state!=='online')muted=!muted;
  if(e.code==='KeyN'&&!e.repeat&&state!=='name'&&state!=='online')toggleMusic();
  if(state==='name'||state==='online'){
    if(e.key&&e.key.length===1&&/[A-Za-z0-9 _.:\/-]/.test(e.key)&&typeBuf.length<64)typeBuf+=e.key.toUpperCase();
    if(e.code==='Backspace')typeBuf=typeBuf.slice(0,-1);
  }
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
