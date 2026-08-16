const { boot } = require('./harness');
const G = boot();

console.log('vs a MOVING player (circling), 5000 frames = ~83 seconds each');
console.log('AI level   CPU class   dmg dealt   shots');
for (const lvl of [0,1,2]) for (const ci of [1,3,6]) {
  G.mode='duel';G.setAi(lvl);G.sel[0].i=2;G.sel[1].i=ci;G.startMatch();
  const [p,c]=G.tanks;
  let dealt=0,php=p.hp,fired=0,seen=new Set();
  for(let i=0;i<5000;i++){
    // player circles: two keys held, rotating every 40 frames
    const dirs=['KeyW','KeyD','KeyS','KeyA'];
    dirs.forEach(k=>G.key(k,false));
    G.key(dirs[(i/40|0)%4],true);
    G.step();
    for(const b of G.bullets) if(b.owner===c && !seen.has(b)) { seen.add(b); fired++; }
    if(p.hp<php){dealt+=php-p.hp;php=p.hp}
    if(G.state!=='play'){ if(p.hp<=0) break; if(G.state==='round') break; }
  }
  console.log(String(lvl).padEnd(10), G.CLASSES[ci].name.padEnd(11),
    String(dealt).padStart(9), String(fired).padStart(7), dealt===0?'  <-- NOTHING':'');
}
