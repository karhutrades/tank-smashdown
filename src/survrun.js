/* A real survival run: bot-driven "player" so we see how far waves get. */
const { boot } = require('./harness');
const G = boot();
G.mode = 'survival'; G.setCoop(false); G.sel[0].i = 1; G.setupMode();
// give the player an AI brain so it fights back
const p = G.tanks[0];
p.ai = { name:'NORMAL', react:5, aimErr:.10, aimTol:.22, dodge:.7, seek:true, lead:true, speedMul:1.05, fireGap:4 };
p.human = false;
let lastWave = 0;
for (let i = 0; i < 120000 && G.state !== 'game'; i++) {
  G.step();
  if (i % 4000 === 0) console.log('  tick', i, 'state', G.state, 'foes', G.tanks.filter(t=>t.side===1&&!t.dead).length,
    'foeHp', G.tanks.filter(t=>t.side===1).map(t=>t.hp).join(','), 'php', p.hp, 'waveTimer?', G.waveTimer);
  if (G.wave !== lastWave) {
    lastWave = G.wave;
    console.log('wave', String(G.wave).padStart(2), '| enemies', String(G.tanks.filter(t=>t.side===1&&!t.dead).length).padStart(2),
      '| player hp', p.hp, '| score', G.score, '| tick', i);
  }
}
console.log('run ended:', G.state, '| reached wave', G.wave, '| score', G.score,
  '| best saved:', G.profiles[0].stats.bestWave);
