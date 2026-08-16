const { boot } = require('./harness');
const G = boot();
G.mode='survival'; G.setCoop(false); G.sel[0].i=1; G.setupMode();
for(let i=0;i<130;i++)G.step();
const e=G.tanks.find(t=>t.side===1);
for(let k=0;k<3;k++){
  const bx=e.x,by=e.y;
  G.step();
  console.log('step',k,'| mv',e.mvx.toFixed(2),e.mvy.toFixed(2),'| iv',e.ivx.toFixed(2),e.ivy.toFixed(2),
    '| moved',(e.x-bx).toFixed(2),(e.y-by).toFixed(2),
    '| blockedX',!!G.hitCellAt(e.x+e.mvx,e.y,e.cls.radius,e.mvx,0),
    '| blockedY',!!G.hitCellAt(e.x,e.y+e.mvy,e.cls.radius,0,e.mvy),
    '| moverX',!!G.moverAt(e.x+e.mvx,e.y,e.cls.radius),
    '| pos',(e.x|0)+','+(e.y|0),'| panic',e.aiPanic,'| tick',e.aiTick);
}
console.log('cls', e.cls.name, 'speed', e.cls.speed, 'radius', e.cls.radius, 'ai.speedMul', e.ai.speedMul);
console.log('frozen', e.fx.frozen, 'dead', e.dead, 'hp', e.hp);
