const { boot } = require('./harness');
const G = boot();
// DUNE GATES vs SCATTER: watch the clock and the sudden-death handoff
G.mode='duel'; G.setAi(2); G.sel[0].i=1; G.startMatch();
G.mapIndex=4; G.startRound();
G.tanks[1].cls=G.CLASSES[4]; G.tanks[1].maxHp=5; G.tanks[1].hp=5;
for (let i=0;i<9000;i++){
  G.step();
  if(i%1500===0||G.state!=='play'&&G.state!=='ready'){
    const [p,c]=G.tanks;
    console.log('t'+i, G.state, '| hp', p.hp+'/'+c.hp, '| dist', Math.hypot(p.x-c.x,p.y-c.y).toFixed(0),
      '| cpu@', c.x.toFixed(0), c.y.toFixed(0));
    if(G.state!=='play'&&G.state!=='ready'){console.log('ROUND ENDED at tick',i);break}
  }
}
