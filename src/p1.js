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
  gatling: {cd:7,maxLive:7,dmg:1,spd:9.2,br:3.5,jitter:.13,knock:4,range:330},
  twin:    {cd:18,maxLive:4,dmg:1,spd:8,br:4.5,pellets:2,spread:.11,knock:7,range:400},
  burst:   {cd:31,maxLive:6,dmg:1,spd:8,br:4,pellets:3,spread:.055,knock:6,range:360},
  cannon:  {cd:28,maxLive:3,dmg:1,spd:7.3,br:5,knock:9,range:420},
  slug:    {cd:46,maxLive:2,dmg:2,spd:8.8,br:6,knock:12,range:460},
  shell:   {cd:42,maxLive:2,dmg:2,spd:6,br:8,knock:15,range:400},
  sniper:  {cd:48,maxLive:1,dmg:2,spd:13,br:4.5,knock:12,trail:1,range:700,falloff:1},
  railgun: {cd:74,maxLive:1,dmg:2,spd:15.5,br:5,knock:16,trail:1,range:780,falloff:1},
  scatter: {cd:28,maxLive:12,dmg:1,spd:7.6,br:5,pellets:4,spread:.26,life:30,knock:8,range:230},
  blunder: {cd:32,maxLive:18,dmg:1,spd:9.2,br:5.5,pellets:6,spread:.34,life:30,knock:11,range:280},
  ricochet:{cd:31,maxLive:2,dmg:1,spd:6.8,br:5,bounces:2,knock:9,range:420},
  bounce3: {cd:36,maxLive:2,dmg:1,spd:6.4,br:5.5,bounces:3,knock:9,range:470},
  mortar:  {cd:86,maxLive:1,dmg:2,spd:6,br:7,air:1,life:50,aoe:38,knock:12,range:400,minR:90,fuseErr:150},
  cluster: {cd:88,maxLive:2,dmg:1,spd:6,br:5.5,air:1,life:50,aoe:40,knock:10,range:390,minR:90,fuseErr:110,pellets:2,spread:.13},
  flame:   {cd:4,maxLive:14,dmg:1,spd:7,br:4.5,jitter:.26,life:20,knock:2,range:155,burn:1},
  longflame:{cd:6,maxLive:14,dmg:1,spd:8,br:3.5,jitter:.13,life:20,knock:2,range:170,burn:1},
  phase:   {cd:50,maxLive:1,dmg:2,spd:6.2,br:5.5,phase:1,knock:10,range:500},
  phasefast:{cd:30,maxLive:2,dmg:1,spd:7.2,br:4.5,phase:1,knock:7,range:430},
  minegun: {cd:26,maxLive:4,dmg:1,spd:8,br:6,life:44,knock:8,range:350,mine:1},
};
const TABS=['SPEED','BALANCED','HEAVY & TRICK'];
const CLASSES=[
 /* -------- SPEED -------- */
 {name:'SCOUT',  tab:0,skin:'scout',   pilot:'scout',   gun:'rapid',   trait:'spinup',color:'#ffd23f',dark:'#cba317',light:'#ffe89a',hp:4,speed:3.9,radius:14,bl:20,desc:'TWIN RAPID GUNS',perk:'GUN SPINS UP AS YOU HOLD FIRE',pips:[5,2,2],unlock:null},
 {name:'DART',   tab:0,skin:'scout',   pilot:'dart',    gun:'twin',    trait:'none',  color:'#8ac926',dark:'#5f9418',light:'#b9e769',hp:4,speed:4.2,radius:13,bl:19,desc:'DOUBLE PEASHOOTER',perk:'FASTEST TREADS IN THE GAME',pips:[5,1,2],unlock:null},
 {name:'SURGE',  tab:0,skin:'blaze',   pilot:'surge',   gun:'burst',   trait:'none',  color:'#4cc9f0',dark:'#2a93b8',light:'#8adcf5',hp:4,speed:3.8,radius:14,bl:21,desc:'3-ROUND BURST',perk:'TIGHT TRIPLE TAP, NO SPREAD',pips:[4,2,3],unlock:null},
 {name:'VIPER',  tab:0,skin:'ricochet',pilot:'viper',   gun:'gatling', trait:'none',  color:'#80b918',dark:'#5a8310',light:'#b5dd5e',hp:4,speed:3.7,radius:14,bl:22,desc:'BUZZSAW GATLING',perk:'SPRAYS FASTER THAN ANYTHING',pips:[4,2,3],unlock:null},
 {name:'BLAZE',  tab:0,skin:'blaze',   pilot:'blaze',   gun:'flame',   trait:'none',  color:'#d95d39',dark:'#a83f22',light:'#f28f6e',hp:5,speed:3.4,radius:14.5,bl:18,desc:'SHORT RANGE FLAME',perk:'FLAMES LEAVE BURNING GROUND',pips:[4,3,3],unlock:{k:'wins',n:6, txt:'WIN 6 MATCHES'}},
 {name:'WISP',   tab:0,skin:'phantom', pilot:'wisp',    gun:'phasefast',trait:'phase',color:'#bde0fe',dark:'#7fa8cc',light:'#e2f1ff',hp:4,speed:3.8,radius:13.5,bl:22,desc:'QUICK GHOST BOLTS',perk:'FIRING PHASES YOU BRIEFLY',pips:[5,1,2],unlock:{k:'kos',n:25,txt:'SCORE 25 KOs'}},
 {name:'JACKAL', tab:0,skin:'scatter', pilot:'jackal',  gun:'blunder', trait:'still', color:'#e0a458',dark:'#b07830',light:'#f0c791',hp:5,speed:3.6,radius:14,bl:17,desc:'5-PELLET BLUNDERBUSS',perk:'STAND STILL FOR A TIGHT SPREAD',pips:[4,2,4],unlock:{k:'rounds',n:40,txt:'PLAY 40 ROUNDS'}},
 {name:'COMET',  tab:0,skin:'longshot',pilot:'comet',   gun:'slug',    trait:'none',  color:'#90e0ef',dark:'#5aa8b8',light:'#c1eef7',hp:4,speed:3.6,radius:13.5,bl:28,desc:'FAST HEAVY SLUG',perk:'HITS LIKE A TRUCK AT ANY RANGE',pips:[4,1,4],unlock:{k:'wins',n:10,txt:'WIN 10 MATCHES'}},
 /* -------- BALANCED -------- */
 {name:'BRAWLER',tab:1,skin:'brawler', pilot:'brawler', gun:'cannon',  trait:'heavy4',color:'#ef3e4a',dark:'#b3202c',light:'#ff7d85',hp:5,speed:3.1,radius:15,bl:26,desc:'BALANCED CANNON',perk:'EVERY 4TH SHELL IS HEAVY',pips:[3,3,3],unlock:null},
 {name:'LONGSHOT',tab:1,skin:'longshot',pilot:'longshot',gun:'sniper', trait:'none',  color:'#35a44a',dark:'#1f7c32',light:'#6cd07e',hp:4,speed:3.3,radius:14,bl:34,desc:'SNIPER · 1-3 DMG BY RANGE',perk:'DAMAGE GROWS WITH DISTANCE',pips:[3,2,4],unlock:null},
 {name:'SCATTER',tab:1,skin:'scatter', pilot:'scatter', gun:'scatter', trait:'still', color:'#ff8c42',dark:'#d3652a',light:'#ffb27a',hp:5,speed:3.0,radius:15,bl:18,desc:'QUAD SPREAD SHOT',perk:'STAND STILL FOR A TIGHT SPREAD',pips:[3,3,4],unlock:{k:'wins',n:2, txt:'WIN 2 MATCHES'}},
 {name:'RICOCHET',tab:1,skin:'ricochet',pilot:'ricochet',gun:'ricochet',trait:'bank', color:'#2ec4b6',dark:'#1e8f85',light:'#6ce4d8',hp:5,speed:3.2,radius:15,bl:24,desc:'BOUNCES OFF WALLS',perk:'BANKED SHOTS HIT HARDER',pips:[4,3,3],unlock:{k:'kos', n:15,txt:'SCORE 15 KOs'}},
 {name:'SLUGGER',tab:1,skin:'titan',   pilot:'slugger', gun:'slug',    trait:'heavy4',color:'#b5838d',dark:'#8a5a64',light:'#d4aab2',hp:5,speed:2.9,radius:15.5,bl:26,desc:'HEAVY SLUG RIFLE',perk:'EVERY 4TH SHELL IS HEAVY',pips:[2,4,4],unlock:{k:'wins',n:4,txt:'WIN 4 MATCHES'}},
 {name:'RANGER', tab:1,skin:'longshot',pilot:'ranger',  gun:'burst',   trait:'none',  color:'#588157',dark:'#3e5d3d',light:'#8fb08e',hp:5,speed:3.2,radius:14.5,bl:26,desc:'MARKSMAN BURSTS',perk:'STEADY TRIPLE VOLLEYS',pips:[3,3,3],unlock:{k:'rounds',n:25,txt:'PLAY 25 ROUNDS'}},
 {name:'JESTER', tab:1,skin:'ricochet',pilot:'jester',  gun:'bounce3', trait:'bank',  color:'#f06fa8',dark:'#bc4a80',light:'#f8a6c9',hp:5,speed:3.1,radius:15,bl:22,desc:'TRIPLE-BOUNCE BALLS',perk:'BANKED SHOTS HIT HARDER',pips:[3,3,3],unlock:{k:'kos',n:40,txt:'SCORE 40 KOs'}},
 {name:'TRICKSTER',tab:1,skin:'phantom',pilot:'trickster',gun:'minegun',trait:'none', color:'#0f8b8d',dark:'#0a6163',light:'#4db3b5',hp:5,speed:3.1,radius:14.5,bl:20,desc:'LOBS PROXIMITY CHARGES',perk:'SPENT SHOTS BECOME MINES',pips:[3,3,3],unlock:{k:'campaign',n:6,txt:'CLEAR 6 CAMPAIGN STAGES'}},
 /* -------- HEAVY & TRICK -------- */
 {name:'TITAN',  tab:2,skin:'titan',   pilot:'titan',   gun:'shell',   trait:'brace', color:'#3d7ea6',dark:'#2a5f80',light:'#6fb0d8',hp:7,speed:2.4,radius:17,bl:24,desc:'HEAVY SHELL · 2 DMG',perk:'BARELY MOVED BY HITS',pips:[1,5,5],unlock:null},
 {name:'BOMBARD',tab:2,skin:'bombard', pilot:'bombard', gun:'mortar',  trait:'none',  color:'#8a9a2f',dark:'#66741f',light:'#c3d45e',hp:5,speed:2.7,radius:16,bl:16,desc:'LOBS OVER WALLS',perk:'HOLD FIRE TO AIM THE ARC',pips:[2,4,4],unlock:{k:'campaign',n:4,txt:'CLEAR 4 CAMPAIGN STAGES'}},
 {name:'PHANTOM',tab:2,skin:'phantom', pilot:'phantom', gun:'phase',   trait:'phase', color:'#8d99ae',dark:'#5f6b80',light:'#c3ccdd',hp:5,speed:3.3,radius:14.5,bl:24,desc:'2 DMG THROUGH WALLS',perk:'FIRING PHASES YOU BRIEFLY',pips:[3,3,4],unlock:{k:'campaign',n:9,txt:'CLEAR 9 CAMPAIGN STAGES'}},
 {name:'GOLIATH',tab:2,skin:'titan',   pilot:'goliath', gun:'cannon',  trait:'brace', color:'#5c677d',dark:'#414a5c',light:'#8b95aa',hp:9,speed:2.0,radius:18,bl:26,desc:'A ROLLING FORTRESS',perk:'9 HP AND BARELY MOVED BY HITS',pips:[1,5,3],unlock:{k:'wins',n:15,txt:'WIN 15 MATCHES'}},
 {name:'CLUSTER',tab:2,skin:'bombard', pilot:'cluster', gun:'cluster', trait:'none',  color:'#a3b18a',dark:'#78855f',light:'#c7d2b4',hp:5,speed:2.6,radius:16,bl:16,desc:'TWIN MORTAR SHELLS',perk:'HOLD FIRE TO AIM THE ARC',pips:[2,4,4],unlock:{k:'campaign',n:12,txt:'CLEAR 12 CAMPAIGN STAGES'}},
 {name:'WARDEN', tab:2,skin:'titan',   pilot:'warden',  gun:'minegun', trait:'brace', color:'#748cab',dark:'#526685',light:'#a3b3ca',hp:7,speed:2.3,radius:17,bl:22,desc:'AREA-DENIAL MINES',perk:'SPENT SHOTS BECOME MINES',pips:[1,5,3],unlock:{k:'rounds',n:60,txt:'PLAY 60 ROUNDS'}},
 {name:'RAILGUN',tab:2,skin:'longshot',pilot:'railgun', gun:'railgun', trait:'none',  color:'#d90429',dark:'#9d031e',light:'#f25e78',hp:4,speed:2.8,radius:15,bl:36,desc:'RAIL SLUG · 1-3 DMG',perk:'DEVASTATING AT EXTREME RANGE',pips:[2,2,5],unlock:{k:'kos',n:60,txt:'SCORE 60 KOs'}},
 {name:'INFERNO',tab:2,skin:'blaze',   pilot:'inferno', gun:'longflame',trait:'none', color:'#e85d04',dark:'#b04503',light:'#f58f4a',hp:6,speed:2.9,radius:15.5,bl:19,desc:'LONG-REACH FLAMES',perk:'FLAMES LEAVE BURNING GROUND',pips:[2,4,4],unlock:{k:'wins',n:20,txt:'WIN 20 MATCHES'}},
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
  phantom: {skin:'#e9edf7',gear:'hood',   gearA:'#4a5670',gearB:'#39435c',eyes:'glow',  mouth:'smirk',  hair:'#39435c'},
  dart:    {skin:'#f0c093',gear:'bandana',gearA:'#8ac926',gearB:'#5f9418',eyes:'wide',  mouth:'grin',  hair:'#2b2b1c'},
  surge:   {skin:'#ffd9a8',gear:'headset',gearA:'#4cc9f0',gearB:'#2a93b8',eyes:'sharp', mouth:'smirk', hair:'#1f7a99'},
  viper:   {skin:'#d9a072',gear:'goggles',gearA:'#80b918',gearB:'#5a8310',eyes:'squint',mouth:'fangs', hair:'#31450a'},
  wisp:    {skin:'#eef2ff',gear:'hood',   gearA:'#7fa8cc',gearB:'#5c7ea3',eyes:'glow',  mouth:'none',  hair:'#5c7ea3'},
  jackal:  {skin:'#c98f63',gear:'bandana',gearA:'#e0a458',gearB:'#b07830',eyes:'sharp', mouth:'fangs', hair:'#4a2c14'},
  comet:   {skin:'#ffe0c0',gear:'visor',  gearA:'#90e0ef',gearB:'#5aa8b8',eyes:'wide',  mouth:'grin',  hair:'#d8d8d8'},
  slugger: {skin:'#e8b98a',gear:'cap',    gearA:'#b5838d',gearB:'#8a5a64',eyes:'squint',mouth:'flat',  hair:'#3b2413'},
  ranger:  {skin:'#d9a072',gear:'cap',    gearA:'#588157',gearB:'#3e5d3d',eyes:'sharp', mouth:'flat',  hair:'#241a12'},
  jester:  {skin:'#ffd9a8',gear:'headset',gearA:'#f06fa8',gearB:'#bc4a80',eyes:'wide',  mouth:'grin',  hair:'#bc4a80'},
  trickster:{skin:'#e8b98a',gear:'goggles',gearA:'#0f8b8d',gearB:'#0a6163',eyes:'normal',mouth:'smirk',hair:'#123'},
  goliath: {skin:'#c98f63',gear:'helmet', gearA:'#5c677d',gearB:'#414a5c',eyes:'squint',mouth:'flat',  hair:'#241a12'},
  cluster: {skin:'#ffd9a8',gear:'helmet', gearA:'#a3b18a',gearB:'#78855f',eyes:'normal',mouth:'grin',  hair:'#5a4632'},
  warden:  {skin:'#d9a072',gear:'visor',  gearA:'#748cab',gearB:'#526685',eyes:'sharp', mouth:'flat',  hair:'#2f3b4c'},
  railgun: {skin:'#e8b98a',gear:'visor',  gearA:'#d90429',gearB:'#9d031e',eyes:'sharp', mouth:'smirk', hair:'#3b0a12'},
  inferno: {skin:'#c98f63',gear:'goggles',gearA:'#e85d04',gearB:'#b04503',eyes:'glow',  mouth:'fangs', hair:'#611f00'},
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
  gatling:()=>sfx(560,240,.06,'square',.05), twin:()=>sfx(400,150,.1,'square',.07),
  burst:()=>sfx(460,190,.09,'square',.07), slug:()=>sfx(250,80,.16,'square',.1),
  railgun:()=>sfx(950,120,.2,'sawtooth',.11), blunder:()=>sfx(260,70,.16,'sawtooth',.1),
  bounce3:()=>sfx(420,160,.11,'square',.07), cluster:()=>sfx(150,340,.22,'triangle',.1),
  longflame:()=>sfx(180,100,.06,'sawtooth',.03), phasefast:()=>sfx(760,260,.18,'sine',.07),
  minegun:()=>sfx(320,120,.14,'triangle',.09),
};
const sndFor=g=>(SND[g]||SND.cannon);
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
/* ---------------- touch: pop-up joystick + fire button ----------------
   The stick appears wherever the thumb lands and vanishes on release.
   In menus a tap = confirm and a flick = move the cursor. */
const TOUCH={on:false,jid:null,ax:0,ay:0,dx:0,dy:0,fid:null,fire:false,t0:0,sx:0,sy:0};
function touchXY(t){const r=cv.getBoundingClientRect();return{x:(t.clientX-r.left)/r.width*W,y:(t.clientY-r.top)/r.height*H}}
const FIRE_BTN={x:W-78,y:H-160,r:46};
const FS_BTN={x:W-30,y:30,r:20};
const BACK_BTN={x:30,y:30,r:20};
function inC(p,c){return Math.hypot(p.x-c.x,p.y-c.y)<c.r+8}
function menuish(){return !['ready','play','round','game'].includes(state)}
if(cv.addEventListener){
cv.addEventListener('touchstart',e=>{
  e.preventDefault();audioOn();TOUCH.on=true;
  for(const t of e.changedTouches){
    const p=touchXY(t);
    if(inC(p,FS_BTN)){toggleFullscreen();continue}
    if(inC(p,BACK_BTN)&&menuish()){pressQ.add('Escape');continue}
    if(!menuish()&&inC(p,FIRE_BTN)&&TOUCH.fid===null){TOUCH.fid=t.identifier;TOUCH.fire=true;continue}
    if(TOUCH.jid===null){
      TOUCH.jid=t.identifier;TOUCH.ax=p.x;TOUCH.ay=p.y;TOUCH.dx=0;TOUCH.dy=0;
      TOUCH.t0=performance.now();TOUCH.sx=p.x;TOUCH.sy=p.y;
    }
  }
},{passive:false});
cv.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier!==TOUCH.jid)continue;
    const p=touchXY(t);
    let dx=p.x-TOUCH.ax,dy=p.y-TOUCH.ay;
    const d=Math.hypot(dx,dy);
    if(d>52){dx=dx/d*52;dy=dy/d*52;TOUCH.ax=p.x-dx;TOUCH.ay=p.y-dy} // the base follows a long drag
    TOUCH.dx=dx;TOUCH.dy=dy;
  }
},{passive:false});
const touchEnd=e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier===TOUCH.fid){TOUCH.fid=null;TOUCH.fire=false}
    if(t.identifier===TOUCH.jid){
      if(menuish()){
        const p=touchXY(t),mx=p.x-TOUCH.sx,my=p.y-TOUCH.sy,md=Math.hypot(mx,my);
        if(performance.now()-TOUCH.t0<450&&md<16)pressQ.add('Space');
        else if(md>=26)pressQ.add(Math.abs(mx)>Math.abs(my)?(mx>0?'KeyD':'KeyA'):(my>0?'KeyS':'KeyW'));
      }
      TOUCH.jid=null;TOUCH.dx=0;TOUCH.dy=0;
    }
  }
};
cv.addEventListener('touchend',touchEnd,{passive:false});
cv.addEventListener('touchcancel',touchEnd,{passive:false});
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
