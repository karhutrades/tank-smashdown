/* Every new mode must start, run and finish without hanging. */
const { boot } = require('./harness');
const G = boot();
const W_ = 960;
const run = (label, setup, maxTicks, done) => {
  setup();
  let i = 0;
  for (; i < maxTicks; i++) { G.step(); G.draw(); if (done()) break }
  console.log(label.padEnd(22), done() ? 'OK in ' + i + ' ticks' : 'DID NOT FINISH (' + G.state + ')');
  return done();
};
const start = m => () => { G.mode = m; G.setCoop(false); G.sel[0].i = 1; G.sel[1].i = 3; G.setupMode() };
let all = true;

// SURVIVAL: waves must spawn, and the run must end when the player dies
all &= run('survival spawns', start('survival'), 400, () => G.tanks.filter(t => t.side === 1).length > 0);
console.log('  wave', G.wave, 'enemies', G.tanks.filter(t => t.side === 1).length, 'score', G.score);
// three lives: dying must cost one, and the run ends when the pool is dry
const livesAtStart = G.lives;
all &= run('survival costs a life', () => { G.damage(G.tanks.find(t => t.side === 0), 99) }, 5, () => G.lives === livesAtStart - 1);
all &= run('survival ends at 0 lives', () => {
  for (let n = 0; n < 6; n++) {
    const p = G.tanks.find(t => t.side === 0 && !t.dead);
    if (p) G.damage(p, 99);
    for (let k = 0; k < 130; k++) G.step();
  }
}, 400, () => G.state === 'game');
console.log('  lives left', G.lives);

// TANK BALL: the ball exists, moves, and a goal ends it
all &= run('ball spawns', start('ball'), 300, () => !!G.ball);
all &= run('ball kicks off', () => {}, 300, () => G.state === 'play');
const bx = G.ball ? G.ball.x : 0;
all &= run('ball moves', () => { G.ball.vx = 7 }, 90, () => G.ball && Math.abs(G.ball.x - bx) > 40);
// right-hand goal belongs to team 0, so drive it in there for a P1 win
all &= run('ball scores', () => { G.setGoals(2, 0); G.ball.x = W_ - 90; G.ball.y = 300; G.ball.vx = 9; G.ball.vy = 0 },
  600, () => G.state === 'game');
console.log('  final goals', JSON.stringify(G.goals));

// ZONE: a zone exists and filling the meter wins
all &= run('zone spawns', start('zone'), 200, () => !!G.zone);
all &= run('zone wins', () => { G.setCaps(99.4, 0); const z = G.zone; const p = G.tanks[0]; p.x = z.x; p.y = z.y; G.tanks[1].x = 40; G.tanks[1].y = 40 },
  600, () => G.state === 'game');

// BOSS: omega spawns with phases and dies properly
all &= run('boss spawns', start('boss'), 200, () => G.tanks.some(t => t.boss));
const boss = G.tanks.find(t => t.boss);
console.log('  boss hp', boss && boss.maxHp, 'radius', boss && boss.cls.radius);
all &= run('boss dies', () => { G.damage(G.tanks.find(t => t.boss), 999) }, 400, () => G.state === 'game');

// the classic modes still work
all &= run('duel still ok', () => { G.mode = 'duel'; G.setCoop(false); G.sel[0].i = 1; G.startMatch() }, 40000, () => G.state === 'game');
console.log(all ? 'MODES-OK' : 'MODE FAILURES');
process.exit(all ? 0 : 1);
