'use strict';
const cv=document.getElementById('c'),cx=cv.getContext('2d');
const W=960,H=600,T=40,COLS=24,ROWS=15;
const INK='#22233b',CREAM='#fff4e0';
const WIN_SCORE=3,BULLET_INVUL=28;
const TEAMS=[{tag:'P1',color:'#ef3e4a'},{tag:'P2',color:'#35a44a'}];
const SWATCHES=['#ef3e4a','#ff8c42','#ffd23f','#35a44a','#2ec4b6','#3d7ea6','#a06cd5','#f06fa8'];

/* ---------------- guns & tank classes ---------------- */
const GUNS={
  needler: {cd:10,maxLive:5,dmg:1,spd:9.0,br:3.6,jitter:.13,knock:4,range:320},
  breaker: {cd:26,maxLive:3,dmg:1,spd:7.6,br:5.6,knock:11,range:450},
  stinger: {cd:18,maxLive:4,dmg:1,spd:8.4,br:4,pellets:2,spread:.11,knock:5,range:360},
  howitzer:{cd:74,maxLive:1,dmg:2,spd:6,br:7.5,air:1,life:50,aoe:46,knock:13,range:430,minR:90,fuseErr:120},
  gatling: {cd:8, maxLive:7,dmg:1,spd:8.8,br:3.4,jitter:.18,knock:4,range:300},
  phaser:  {cd:46,maxLive:1,dmg:2,spd:6.4,br:5.6,phase:1,knock:10,range:520},
  torch:   {cd:4, maxLive:16,dmg:1,spd:7.8,br:4.6,jitter:.2,life:21,knock:2,range:185,burn:1},
  railspike:{cd:50,maxLive:1,dmg:2,spd:15,br:5.8,knock:16,trail:1,range:800,falloff:1},
  caroms:  {cd:27,maxLive:3,dmg:1,spd:7.3,br:5.4,bounces:3,knock:9,range:470},
  seeder:  {cd:22,maxLive:5,dmg:1,spd:8.2,br:5.8,life:48,knock:8,range:380,mine:1},
  squall:  {cd:29,maxLive:12,dmg:1,spd:7.6,br:4.8,pellets:4,spread:.27,life:30,knock:8,range:240},
  duocannon:{cd:46,maxLive:2,dmg:2,spd:6.6,br:8,knock:16,range:420},
};
const sndFor=g=>(SND[g]||SND.breaker);
const TABS=['STRIKE','ASSAULT','SIEGE'];
const CLASSES=[
 /* ---- STRIKE: fast, fragile, tricky ---- */
 {name:'RAZOR',  tab:0,chassis:'wedge',   pilot:'razor',  gun:'needler', trait:'spinup',
  color:'#ffd23f',dark:'#c99a10',light:'#fff0a4',hp:4,speed:4.1,radius:14,bl:20,
  desc:'NEEDLE REPEATER',perk:'FIRE RATE CLIMBS AS YOU HOLD',pips:[5,2,2],unlock:null},
 {name:'HORNET', tab:0,chassis:'hover',   pilot:'hornet', gun:'stinger', trait:'hover',
  color:'#4cc9f0',dark:'#2189ab',light:'#a5e8fb',hp:4,speed:4.0,radius:13.5,bl:19,
  desc:'TWIN STINGERS',perk:'HOVERS OVER WATER AND LAVA',pips:[5,1,3],unlock:null},
 {name:'VIPER',  tab:0,chassis:'sixwheel',pilot:'viper',  gun:'gatling', trait:'drift',
  color:'#80b918',dark:'#4f7a0c',light:'#c2e86a',hp:4,speed:3.8,radius:14,bl:22,
  desc:'BUZZSAW GATLING',perk:'KEEPS ITS SPEED THROUGH TURNS',pips:[4,2,3],unlock:null},
 {name:'SPECTRE',tab:0,chassis:'phantom', pilot:'spectre',gun:'phaser',  trait:'phase',
  color:'#9db4d0',dark:'#5d7characters'.replace('characters','2a2'),light:'#dfe9f5',hp:4,speed:3.6,radius:14,bl:24,
  desc:'SHOT PASSES THROUGH WALLS',perk:'FIRING PHASES YOU BRIEFLY',pips:[4,2,4],unlock:{k:'kos',n:15,txt:'SCORE 15 KOs'}},
 /* ---- ASSAULT: the all-rounders ---- */
 {name:'BULWARK',tab:1,chassis:'boxtank', pilot:'bulwark',gun:'breaker', trait:'heavy3',
  color:'#ef3e4a',dark:'#a81b26',light:'#ff8a92',hp:6,speed:3.1,radius:15.5,bl:26,
  desc:'ARMOUR-BREAKER CANNON',perk:'EVERY 3RD SHELL IS A HAYMAKER',pips:[3,4,3],unlock:null},
 {name:'TEMPEST',tab:1,chassis:'turbine', pilot:'tempest',gun:'squall',  trait:'still',
  color:'#ff8c42',dark:'#c25a12',light:'#ffc08c',hp:5,speed:3.2,radius:15,bl:18,
  desc:'FOUR-PELLET SQUALL',perk:'STAND STILL FOR A TIGHT CHOKE',pips:[3,3,4],unlock:null},
 {name:'CAROM',  tab:1,chassis:'roller',  pilot:'carom',  gun:'caroms',  trait:'bank',
  color:'#2ec4b6',dark:'#15827a',light:'#8ceae0',hp:5,speed:3.3,radius:15,bl:22,
  desc:'TRIPLE-BANK SHOT',perk:'EACH BANK ADDS DAMAGE',pips:[4,3,3],unlock:{k:'wins',n:2,txt:'WIN 2 MATCHES'}},
 {name:'CINDER', tab:1,chassis:'halftrack',pilot:'cinder',gun:'torch',   trait:'scorch',
  color:'#d95d39',dark:'#96341a',light:'#f7a184',hp:5,speed:3.4,radius:14.5,bl:18,
  desc:'PRESSURISED FLAME',perk:'LEAVES BURNING GROUND',pips:[4,3,3],unlock:{k:'wins',n:5,txt:'WIN 5 MATCHES'}},
 /* ---- SIEGE: slow, heavy, deadly ---- */
 {name:'MORTIS', tab:2,chassis:'artillery',pilot:'mortis',gun:'howitzer',trait:'none',
  color:'#8a9a2f',dark:'#57641a',light:'#c9dc6e',hp:5,speed:2.6,radius:16,bl:16,
  desc:'ARCING HOWITZER',perk:'HOLD FIRE TO AIM THE ARC',pips:[2,4,5],unlock:{k:'campaign',n:3,txt:'CLEAR 3 STAGES'}},
 {name:'LANCER', tab:2,chassis:'railer',  pilot:'lancer', gun:'railspike',trait:'none',
  color:'#d90429',dark:'#8c0119',light:'#ff6b81',hp:4,speed:2.9,radius:15,bl:36,
  desc:'RAIL SPIKE · 1-3 DMG',perk:'DEVASTATING AT LONG RANGE',pips:[2,2,5],unlock:{k:'kos',n:35,txt:'SCORE 35 KOs'}},
 {name:'WARDEN', tab:2,chassis:'walker',  pilot:'warden', gun:'seeder',  trait:'brace',
  color:'#748cab',dark:'#41546e',light:'#b7c6da',hp:6,speed:2.7,radius:16,bl:20,
  desc:'MINE SEEDER',perk:'SPENT SHOTS BECOME MINES',pips:[2,5,3],unlock:{k:'campaign',n:7,txt:'CLEAR 7 STAGES'}},
 {name:'TITANIA',tab:2,chassis:'fortress',pilot:'titania',gun:'duocannon',trait:'brace',
  color:'#3d7ea6',dark:'#1f4c69',light:'#87c2e0',hp:8,speed:2.2,radius:18,bl:26,
  desc:'TWIN SIEGE CANNONS',perk:'BARELY MOVED BY ANYTHING',pips:[1,5,4],unlock:{k:'wins',n:12,txt:'WIN 12 MATCHES'}},
];

/* ---------------- pilots: a drawn character per tank ----------------
   skin/hair/gear are drawn as vectors so the whole game stays one small file */
const PILOTS={
  razor:  {skin:'#ffd9a8',gear:'goggles',gearA:'#ffd23f',gearB:'#c99a10',eyes:'wide',  mouth:'grin', hair:'#7a4a1e'},
  hornet: {skin:'#e8b98a',gear:'headset',gearA:'#4cc9f0',gearB:'#2189ab',eyes:'sharp', mouth:'smirk',hair:'#1f6f8c'},
  viper:  {skin:'#d9a072',gear:'bandana',gearA:'#80b918',gearB:'#4f7a0c',eyes:'squint',mouth:'fangs',hair:'#31450a'},
  spectre:{skin:'#eef2ff',gear:'hood',   gearA:'#4a5670',gearB:'#39435c',eyes:'glow',  mouth:'none', hair:'#39435c'},
  bulwark:{skin:'#e8b98a',gear:'helmet', gearA:'#ef3e4a',gearB:'#a81b26',eyes:'normal',mouth:'grin', hair:'#3b2413'},
  tempest:{skin:'#f0c093',gear:'visor',  gearA:'#ff8c42',gearB:'#c25a12',eyes:'wide',  mouth:'smirk',hair:'#4a2c14'},
  carom:  {skin:'#ffd9a8',gear:'cap',    gearA:'#2ec4b6',gearB:'#15827a',eyes:'normal',mouth:'grin', hair:'#6b4a8f'},
  cinder: {skin:'#c98f63',gear:'goggles',gearA:'#d95d39',gearB:'#96341a',eyes:'glow',  mouth:'fangs',hair:'#611f00'},
  mortis: {skin:'#d9a072',gear:'helmet', gearA:'#8a9a2f',gearB:'#57641a',eyes:'squint',mouth:'flat', hair:'#2b2b1c'},
  lancer: {skin:'#e8b98a',gear:'visor',  gearA:'#d90429',gearB:'#8c0119',eyes:'sharp', mouth:'flat', hair:'#3b0a12'},
  warden: {skin:'#c98f63',gear:'cap',    gearA:'#748cab',gearB:'#41546e',eyes:'sharp', mouth:'flat', hair:'#2f3b4c'},
  titania:{skin:'#ffe0c0',gear:'helmet', gearA:'#3d7ea6',gearB:'#1f4c69',eyes:'normal',mouth:'grin', hair:'#d8b45a'},
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
    stats:{wins:0,losses:0,kos:0,rounds:0,campaign:0,bestWave:0,bestScore:0,goals:0,zones:0,bosses:0,plays:{}}};
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
    s.bestWave=s.bestWave|0;s.bestScore=s.bestScore|0;s.goals=s.goals|0;s.zones=s.zones|0;s.bosses=s.bosses|0;
    s.plays=s.plays||{};
    if(typeof p.last!=='number'||!CLASSES[p.last])p.last=0;
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
  if(!CLASSES[ci])return false;
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
  needler:()=>sfx(560,240,.06,'square',.05),   breaker:()=>sfx(320,110,.13,'square',.09),
  stinger:()=>sfx(470,190,.09,'square',.07),   howitzer:()=>sfx(140,330,.26,'triangle',.11),
  gatling:()=>sfx(600,260,.05,'square',.045),  phaser:()=>sfx(880,230,.24,'sine',.08),
  torch:()=>sfx(170,95,.06,'sawtooth',.03),    railspike:()=>sfx(980,120,.2,'sawtooth',.11),
  caroms:()=>sfx(430,170,.11,'square',.07),    seeder:()=>sfx(330,130,.13,'triangle',.09),
  squall:()=>sfx(300,90,.14,'sawtooth',.09),   duocannon:()=>sfx(220,70,.2,'square',.12),
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
    else if(el.requestFullscreen){
      el.requestFullscreen();
      try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}
    }
  }catch(e){}
}
/* ---------------- pointer input: touch + mouse ----------------
   Taps are generous on purpose: a real thumb on a scaled-down canvas wanders
   tens of canvas-pixels and can linger, so tight thresholds made the whole UI
   feel dead. One tap activates - no "select then confirm" dance. */
const TOUCH={on:false,jid:null,ax:0,ay:0,dx:0,dy:0,fid:null,fire:false,t0:0,sx:0,sy:0,taps:[],
  j2id:null,ax2:0,ay2:0,dx2:0,dy2:0,flash:null};
const TAP_SLOP=46,TAP_MS=1000;
function touchXY(t){const r=cv.getBoundingClientRect();
  return{x:(t.clientX-r.left)/r.width*W,y:(t.clientY-r.top)/r.height*H}}
const FIRE_BTN={x:W-78,y:H-160,r:52};
const FS_BTN={x:W-32,y:32,r:24};
const BACK_BTN={x:32,y:32,r:24};
function inC(p,c){return Math.hypot(p.x-c.x,p.y-c.y)<c.r+10}
function menuish(){return !['ready','play','round','game'].includes(state)}
function queueTap(x,y){
  TOUCH.taps.push({x,y});
  TOUCH.flash={x,y,life:16};   // visible feedback so a press never feels ignored
}
if(cv.addEventListener){
  let fsTried=false;
  cv.addEventListener('touchstart',e=>{
    e.preventDefault();audioOn();TOUCH.on=true;
    if(!fsTried&&state==='title'){fsTried=true;if(!document.fullscreenElement)toggleFullscreen()}
    for(const t of e.changedTouches){
      const p=touchXY(t);
      if(inC(p,FS_BTN)){toggleFullscreen();continue}
      if(inC(p,BACK_BTN)&&menuish()){pressQ.add('Escape');continue}
      if(!menuish()){
        if(mode==='coop'){
          if(p.x<W/2&&TOUCH.jid===null){TOUCH.jid=t.identifier;TOUCH.ax=p.x;TOUCH.ay=p.y;TOUCH.dx=0;TOUCH.dy=0}
          else if(p.x>=W/2&&TOUCH.j2id===null){TOUCH.j2id=t.identifier;TOUCH.ax2=p.x;TOUCH.ay2=p.y;TOUCH.dx2=0;TOUCH.dy2=0}
          continue;
        }
        if(p.x>W*.6&&TOUCH.fid===null){TOUCH.fid=t.identifier;TOUCH.fire=true;continue}
        if(p.x<=W*.6&&TOUCH.jid===null){TOUCH.jid=t.identifier;TOUCH.ax=p.x;TOUCH.ay=p.y;TOUCH.dx=0;TOUCH.dy=0}
        continue;
      }
      // in menus every finger is a potential tap, tracked by id
      TOUCH['m'+t.identifier]={x:p.x,y:p.y,t:performance.now()};
    }
  },{passive:false});
  cv.addEventListener('touchmove',e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      const p=touchXY(t);
      if(t.identifier===TOUCH.jid){
        let dx=p.x-TOUCH.ax,dy=p.y-TOUCH.ay;const d=Math.hypot(dx,dy);
        if(d>52){dx=dx/d*52;dy=dy/d*52;TOUCH.ax=p.x-dx;TOUCH.ay=p.y-dy}
        TOUCH.dx=dx;TOUCH.dy=dy;
      }else if(t.identifier===TOUCH.j2id){
        let dx=p.x-TOUCH.ax2,dy=p.y-TOUCH.ay2;const d=Math.hypot(dx,dy);
        if(d>52){dx=dx/d*52;dy=dy/d*52;TOUCH.ax2=p.x-dx;TOUCH.ay2=p.y-dy}
        TOUCH.dx2=dx;TOUCH.dy2=dy;
      }
    }
  },{passive:false});
  const touchEnd=e=>{
    e.preventDefault();
    for(const t of e.changedTouches){
      if(t.identifier===TOUCH.fid){TOUCH.fid=null;TOUCH.fire=false}
      if(t.identifier===TOUCH.j2id){TOUCH.j2id=null;TOUCH.dx2=0;TOUCH.dy2=0}
      if(t.identifier===TOUCH.jid){TOUCH.jid=null;TOUCH.dx=0;TOUCH.dy=0}
      const m=TOUCH['m'+t.identifier];
      if(m){
        delete TOUCH['m'+t.identifier];
        const p=touchXY(t),md=Math.hypot(p.x-m.x,p.y-m.y);
        if(performance.now()-m.t<TAP_MS&&md<TAP_SLOP)queueTap(m.x,m.y);
        else if(md>=TAP_SLOP)pressQ.add(Math.abs(p.x-m.x)>Math.abs(p.y-m.y)
          ?(p.x>m.x?'KeyD':'KeyA'):(p.y>m.y?'KeyS':'KeyW'));
      }
    }
  };
  cv.addEventListener('touchend',touchEnd,{passive:false});
  cv.addEventListener('touchcancel',touchEnd,{passive:false});
  // mouse: menus are clickable on desktop too
  cv.addEventListener('mousedown',e=>{
    audioOn();
    if(!menuish())return;
    const r=cv.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;
    if(inC({x,y},FS_BTN)){toggleFullscreen();return}
    if(inC({x,y},BACK_BTN)){pressQ.add('Escape');return}
    queueTap(x,y);
  });
  cv.addEventListener('dblclick',toggleFullscreen);
}
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
