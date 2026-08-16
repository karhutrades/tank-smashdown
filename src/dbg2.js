const { boot } = require('./harness');
const G = boot();
G.mode='survival'; G.setCoop(false); G.sel[0].i=1; G.setupMode();
const p=G.tanks[0], e=G.tanks[1];
p.ai={name:'N',react:5,aimErr:.1,aimTol:.25,dodge:.5,seek:true,lead:true,speedMul:1,fireGap:4}; p.human=false;
for(let i=0;i<=3000;i++){
  G.step();
  if(i%500===0) console.log('t'+String(i).padStart(4),
    'P',(p.x|0)+','+(p.y|0),'E',(e.x|0)+','+(e.y|0),
    'dist',Math.hypot(p.x-e.x,p.y-e.y)|0,
    'bullets',G.bullets.length,'php',p.hp,'ehp',e.hp,
    'Ppath',p.aiPath?'y':'n','Epath',e.aiPath?'y':'n','Epanic',e.aiPanic);
}
