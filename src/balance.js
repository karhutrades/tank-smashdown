/* Round-robin: every class vs every class, both bots at NORMAL, one round each way.
   Prints a win matrix + overall win rate per class. */
const { boot } = require('./harness');
const G = boot();
const N = G.CLASSES.length;
const wins = Array.from({ length: N }, () => 0), games = Array.from({ length: N }, () => 0);
const grid = Array.from({ length: N }, () => Array(N).fill('  .'));
for (let rep = 0; rep < 2; rep++) for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
  if (a === b) continue;
  G.mode = 'duel'; G.setAi(1); G.sel[0].i = a; G.startMatch();
  // both sides become bots of the classes under test, THEN the round starts
  G.tanks[0].ai = { ...G.tanks[1].ai }; G.tanks[0].human = false;
  G.tanks[1].cls = G.CLASSES[b]; G.tanks[1].clsIdx = b; G.tanks[1].maxHp = G.CLASSES[b].hp;
  G.mapIndex = (a * 3 + b + rep * 5) % G.MAPS.length; G.startRound();
  let i = 0;
  while (G.state !== 'round' && G.state !== 'game' && i++ < 9000) G.step();
  const w = G.roundWinner ? (G.roundWinner.team === 0 ? a : b) : -1;
  if (w >= 0) { wins[w]++; }
  games[a]++; games[b]++;
  grid[a][b] = w === a ? '  W' : w === b ? '  L' : '  -';
}
if(false)console.log('        ' + G.CLASSES.map(c => c.name.slice(0, 3)).join(' '));
if(false)grid.forEach((row, i) => console.log(G.CLASSES[i].name.padEnd(8) + row.join(' ')));
console.log('\nwin rate (of ' + (6 * (N - 1)) + ' games each):');
const rates = G.CLASSES.map((c, i) => [c.name, Math.round(wins[i] / games[i] * 100)]);
rates.sort((x, y) => y[1] - x[1]).forEach(([n, r]) => console.log(' ', n.padEnd(9), r + '%'));
