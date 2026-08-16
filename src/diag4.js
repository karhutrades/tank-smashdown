const { boot } = require('./harness');
const G = boot();
let bad = [];
for (let mi = 0; mi < G.MAPS.length; mi++) {
  const row = [];
  for (const ci of [1, 4, 7]) {
    G.mode = 'duel'; G.setAi(2); G.sel[0].i = 1; G.startMatch();
    G.mapIndex = mi; G.startRound();
    G.tanks[1].cls = G.CLASSES[ci];
    G.tanks[1].maxHp = G.CLASSES[ci].hp; G.tanks[1].hp = G.CLASSES[ci].hp;
    let i = 0, ok = 0;
    for (; i < 9000; i++) { G.step(); if (G.state !== 'play' && G.state !== 'ready') { ok = 1; break } }
    row.push(ok ? String(i).padStart(5) : ' FAIL');
    if (!ok) bad.push(G.MAPS[mi].name + ' vs ' + G.CLASSES[ci].name);
  }
  console.log(G.MAPS[mi].name.padEnd(16), row.join(' '));
}
console.log(bad.length ? 'ROUNDS THAT NEVER END: ' + bad.join(', ') : 'every map+class: the round always resolves');
