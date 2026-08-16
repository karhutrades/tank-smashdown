const { boot } = require('./harness');
const G = boot();

console.log('CPU class      shots fired   dmg dealt to a sitting duck   verdict');
for (let ci=0; ci<9; ci++) {
  G.mode='duel';G.setAi(2);G.sel[0].i=2;G.sel[1].i=ci;G.startMatch();
  const [p,c]=G.tanks;
  let dealt=0,php=p.hp,fired=0,seen=new Set();
  for(let i=0;i<5000;i++){
    G.step();
    for(const b of G.bullets) if(b.owner===c && !seen.has(b)) { seen.add(b); fired++; }
    if(p.hp<php){dealt+=php-p.hp;php=p.hp}
    if(G.state!=='play'){ if(p.hp<=0) break; if(G.state==='round') break; }
  }
  const name=G.CLASSES[ci].name.padEnd(9);
  console.log(name, String(fired).padStart(10), String(dealt).padStart(20),
    '          ', dealt===0 ? '*** DEALS NOTHING ***' : 'ok');
}
