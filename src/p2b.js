/* ================= PROCEDURAL ARENAS =================
   Every match builds a brand-new arena from a seed. A biome decides palette,
   hazards and obstacle vocabulary; the layout is generated, mirrored so both
   halves are identical, then validated for connectivity before it is used. */
const BIOMES={
  meadow:{name:['GROVE','MEADOW','PASTURE','ORCHARD','GLADE','THICKET'],
    floorA:'#6fbf49',floorB:'#63b03f',block:'#b5763a',blockTop:'#d99a55',
    liqA:'#3fa7d6',liqB:'#7fd0f0',decal:'flowers',amb:'clouds',
    liquid:.5,crates:.9,bush:.7,ice:0,belt:0,bump:.25,portal:.15,gate:.1,mover:.1},
  desert:{name:['DUNES','MESA','CANYON','OASIS','BADLANDS','SANDS'],
    floorA:'#e8c877',floorB:'#dcb964',block:'#c2593f',blockTop:'#e07a56',
    liqA:'#3fa7d6',liqB:'#7fd0f0',decal:'pebbles',amb:'heat',
    liquid:.3,crates:1,bush:.15,ice:0,belt:0,bump:.2,portal:.2,gate:.35,mover:.15},
  frost:{name:['GLACIER','TUNDRA','FJORD','ICEFALL','DRIFT','FROSTWORKS'],
    floorA:'#cfe9f5',floorB:'#bcdff0',block:'#4f86b8',blockTop:'#71a7d4',
    liqA:'#4f9dce',liqB:'#8fd4f2',decal:'snow',amb:'snow',
    liquid:.55,crates:.6,bush:.1,ice:1,belt:0,bump:.3,portal:.15,gate:.1,mover:.15},
  volcano:{name:['CALDERA','MAGMA','ASHFALL','CRUCIBLE','EMBERS','OBSIDIAN'],
    floorA:'#6a6673',floorB:'#5d5a66',block:'#463f52',blockTop:'#655c74',
    liqA:'#f4552b',liqB:'#ffa23f',decal:'embers',amb:'embers',
    liquid:.95,crates:.7,bush:0,ice:0,belt:0,bump:.15,portal:.15,gate:.15,mover:.5},
  factory:{name:['WORKS','FOUNDRY','ASSEMBLY','REFINERY','YARD','PLANT'],
    floorA:'#3d4058',floorB:'#35384d',block:'#5a5f7d',blockTop:'#767c9c',
    liqA:'#2e8fc0',liqB:'#5fc0e8',decal:'bolts',amb:'sparks',
    liquid:.25,crates:.9,bush:0,ice:.1,belt:1,bump:.6,portal:.55,gate:.3,mover:.45},
};
const BIOME_KEYS=Object.keys(BIOMES);

/* deterministic RNG so a seed always rebuilds the same arena */
function mulberry(seed){
  let a=seed>>>0;
  return function(){
    a=(a+0x6D2B79F5)>>>0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
/* symmetric room-and-pillar layout, mirrored 180 degrees for a fair fight */
function generateMap(seed,opts){
  opts=opts||{};
  const rnd=mulberry(seed);
  const pick=a=>a[(rnd()*a.length)|0];
  const chance=p=>rnd()<p;
  const key=opts.biome||pick(BIOME_KEYS);
  const B=BIOMES[key];
  const g=[];
  for(let y=0;y<ROWS;y++){
    const row=[];
    for(let x=0;x<COLS;x++)row.push(y===0||x===0||y===ROWS-1||x===COLS-1?'#':'.');
    g.push(row);
  }
  const put=(x,y,c)=>{
    if(x<1||y<1||x>=COLS-1||y>=ROWS-1)return;
    g[y][x]=c;
    const mx=COLS-1-x,my=ROWS-1-y;      // 180 degree mirror keeps it fair
    const swap={'>':'<','<':'>','^':'v','v':'^','R':'L','L':'R','U':'D','D':'U'};
    g[my][mx]=swap[c]||c;
  };
  const open=opts.open||(key==='stadium');
  // --- structures in the top half; the mirror fills the bottom ---
  const halfRows=Math.ceil(ROWS/2);
  const blobs=open?1:2+((rnd()*3)|0);
  for(let b=0;b<blobs;b++){
    const shape=(rnd()*4)|0;
    const cxp=2+((rnd()*(COLS-6))|0),cyp=1+((rnd()*(halfRows-1))|0);
    if(shape===0){                       // solid block room
      const w=2+((rnd()*3)|0),h=1+((rnd()*3)|0);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)put(cxp+x,cyp+y,'#');
    }else if(shape===1){                 // hollow room with a doorway
      const w=3+((rnd()*3)|0),h=2+((rnd()*3)|0);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)
        if(x===0||y===0||x===w-1||y===h-1)put(cxp+x,cyp+y,'#');
      put(cxp+((w/2)|0),cyp,'.');
    }else if(shape===2){                 // pillar field
      const w=3+((rnd()*4)|0),h=2+((rnd()*3)|0);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)
        if(((x+y)&1)===0)put(cxp+x*2-x,cyp+y,'#');
    }else{                               // diagonal wall
      const len=3+((rnd()*4)|0);
      for(let i=0;i<len;i++)put(cxp+i,cyp+((i/2)|0),'#');
    }
  }
  // --- hazards and toys ---
  const sprinkle=(n,fn)=>{for(let i=0;i<n;i++){
    const x=2+((rnd()*(COLS-4))|0),y=1+((rnd()*(halfRows-1))|0);
    fn(x,y);
  }};
  if(!open&&chance(B.liquid)){           // a pool or river of water/lava
    const w=2+((rnd()*3)|0),h=2+((rnd()*3)|0);
    const x0=3+((rnd()*(COLS-8))|0),y0=1+((rnd()*(halfRows-2))|0);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(g[y0+y]&&g[y0+y][x0+x]==='.')put(x0+x,y0+y,'~');
  }
  if(!open)sprinkle(2+((rnd()*4)|0),(x,y)=>{if(g[y][x]==='.'&&chance(B.crates))put(x,y,'x')});
  if(!open&&B.bush)sprinkle(3,(x,y)=>{if(g[y][x]==='.'&&chance(B.bush))put(x,y,'b')});
  if(!open&&B.ice){
    const w=3+((rnd()*4)|0),h=2+((rnd()*3)|0);
    const x0=2+((rnd()*(COLS-6))|0),y0=1+((rnd()*(halfRows-1))|0);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(g[y0+y]&&g[y0+y][x0+x]==='.'&&chance(B.ice))put(x0+x,y0+y,'*');
  }
  if(!open&&chance(B.belt)){             // conveyor run
    const y=2+((rnd()*(halfRows-2))|0),x0=3+((rnd()*6)|0),len=4+((rnd()*6)|0);
    const dir=chance(.5)?'>':'<';
    for(let i=0;i<len;i++)if(g[y]&&g[y][x0+i]==='.')put(x0+i,y,dir);
  }
  if(!open&&chance(B.bump))sprinkle(2,(x,y)=>{if(g[y][x]==='.')put(x,y,'o')});
  if(!open&&chance(B.portal)){
    let a=null,b2=null;
    for(let i=0;i<40&&!(a&&b2);i++){
      const x=2+((rnd()*(COLS-4))|0),y=1+((rnd()*(halfRows-1))|0);
      if(g[y][x]!=='.')continue;
      if(!a)a=[x,y];else if(Math.abs(x-a[0])+Math.abs(y-a[1])>7)b2=[x,y];
    }
    if(a&&b2){g[a[1]][a[0]]='1';g[ROWS-1-a[1]][COLS-1-a[0]]='1';
              g[b2[1]][b2[0]]='2';g[ROWS-1-b2[1]][COLS-1-b2[0]]='2'}
  }
  // --- spawns: opposite corners of the long axis, always clear ---
  const sy=(ROWS/2)|0;
  const spawns=[[2,sy,0],[COLS-3,sy,Math.PI]];
  for(const [sx2,sy2] of spawns)
    for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){
      const gx=sx2+x,gy=sy2+y;
      if(gx>0&&gy>0&&gx<COLS-1&&gy<ROWS-1)g[gy][gx]='.';
    }
  const grid=g.map(r=>r.join(''));
  const m={name:pick(B.name)+' '+(1+(seed%99)),world:key,seed,
    floorA:B.floorA,floorB:B.floorB,block:B.block,blockTop:B.blockTop,
    liqA:B.liqA,liqB:B.liqB,decal:B.decal,spawns,grid,generated:true};
  if(!open&&chance(B.mover)){
    const gy=2+((rnd()*(ROWS-6))|0);
    m.movers=[{gx:(COLS/2|0)-4,gy,axis:'v',range:3,period:280},
              {gx:(COLS/2|0)+4,gy,axis:'v',range:-3,period:280}];
  }
  return connected(m)?m:generateMap(seed+7919,opts);
}
/* both spawns must be able to reach each other and most of the floor */
function connected(m){
  const g=m.grid,seen=new Uint8Array(COLS*ROWS),q=[];
  const free=(x,y)=>{const c=g[y][x];return c!=='#'&&c!=='x'&&c!=='~'};
  const [sx,sy]=m.spawns[0],[ex,ey]=m.spawns[1];
  if(!free(sx,sy)||!free(ex,ey))return false;
  q.push(sy*COLS+sx);seen[sy*COLS+sx]=1;
  let count=0;
  while(q.length){
    const k=q.pop(),x=k%COLS,y=(k/COLS)|0;count++;
    for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+ox,ny=y+oy;
      if(nx<1||ny<1||nx>=COLS-1||ny>=ROWS-1)continue;
      const nk=ny*COLS+nx;
      if(seen[nk]||!free(nx,ny))continue;
      seen[nk]=1;q.push(nk);
    }
  }
  if(!seen[ey*COLS+ex])return false;
  let floor=0;
  for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(free(x,y))floor++;
  return count>=floor*0.85 && floor>=170;   // no big walled-off pockets
}
/* pitches for TANK BALL: open, symmetric, a couple of blockers */
function generatePitch(seed){
  const m=generateMap(seed,{open:true,biome:seed%2?'meadow':'factory'});
  m.world='stadium';m.decal='turf';
  m.floorA=seed%2?'#3f9c4a':'#44557f';m.floorB=seed%2?'#379141':'#3d4c72';
  m.block='#e8e3d0';m.blockTop='#fffaf0';
  m.name='PITCH '+(1+(seed%99));
  m.spawns=[[4,(ROWS/2)|0,0],[COLS-5,(ROWS/2)|0,Math.PI]];
  return m;
}
/* the live arena list: one fresh arena per round, kept short */
function newArena(opts){
  const seed=(Math.random()*1e9)|0;
  const m=(opts&&opts.pitch)?generatePitch(seed):generateMap(seed,opts);
  MAPS.push(m);
  if(MAPS.length>24)MAPS.splice(0,MAPS.length-24);
  return MAPS.length-1;
}
