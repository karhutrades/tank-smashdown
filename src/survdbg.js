const { boot } = require('./harness');
const G = boot();
G.mode='survival'; G.setCoop(false); G.sel[0].i=1; G.setupMode();
const p=G.tanks[0];
for(let i=0;i<=3000;i++){
  G.step();
  if(i%600===0){
    const e=G.tanks.find(t=>t.side===1&&!t.dead);
    console.log('t'+String(i).padStart(4),'state',G.state,
      '| foes',G.tanks.filter(t=>t.side===1&&!t.dead).length,
      '| dist',e?Math.hypot(p.x-e.x,p.y-e.y)|0:'-',
      '| bullets',G.bullets.length,'| php',p.hp,
      '| e.cd',e?e.cd:'-','| e.ai',e?!!e.ai:'-','| map',G.MAPS[G.mapIndex].name);
  }
}
