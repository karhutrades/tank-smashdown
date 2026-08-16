const { boot } = require('./harness');
const G = boot();
// force each class as CPU on a random map, idle player, see which fail to finish
for (let ci = 0; ci < 9; ci++) {
  G.mode = 'duel'; G.setAi(2); G.sel[0].i = 1; G.startMatch();
  G.tanks[1].cls = G.CLASSES[ci];
  G.tanks[1].maxHp = G.CLASSES[ci].hp; G.tanks[1].hp = G.CLASSES[ci].hp;
  let i = 0, killed = 0;
  for (; i < 20000; i++) {
    G.step();
    if (G.tanks[0].hp <= 0) { killed = 1; break }
  }
  const [p, c] = G.tanks;
  console.log(G.CLASSES[ci].name.padEnd(9), killed ? 'killed in ' + i : 'STUCK',
    '| map', G.MAPS[G.mapIndex].name.padEnd(15),
    '| cpu@', c.x.toFixed(0), c.y.toFixed(0), '| player@', p.x.toFixed(0), p.y.toFixed(0),
    '| dist', Math.hypot(p.x - c.x, p.y - c.y).toFixed(0));
}
