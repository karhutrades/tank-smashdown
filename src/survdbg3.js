const { boot } = require('./harness');
const G = boot();
G.mode='survival'; G.setCoop(false); G.sel[0].i=1; G.setupMode();
const p=G.tanks[0];
let fired=0, seen=new Set(), moved=0, lastx=null;
for(let i=0;i<2400;i++){
  G.step();
  for(const b of G.bullets) if(!seen.has(b)){seen.add(b); fired++}
  const e=G.tanks.find(t=>t.side===1&&!t.dead);
  if(e){ if(lastx!==null && Math.hypot(e.x-lastx.x,e.y-lastx.y)>0.4) moved++; lastx={x:e.x,y:e.y}; }
  if(i%300===0&&e) console.log('t'+String(i).padStart(4),'e@'+(e.x|0)+','+(e.y|0),
    'dist',Math.hypot(p.x-e.x,p.y-e.y)|0,'fired',fired,'movingTicks',moved,'php',p.hp,'map',G.MAPS[G.mapIndex].name);
}
console.log('TOTAL shots fired by everyone:',fired,'| enemy moved on',moved,'of 2400 ticks | player hp',p.hp);
