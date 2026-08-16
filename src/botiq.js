/* Does the CPU actually play the objective? Idle human, bot left to its own devices. */
const { boot } = require('./harness');
const G = boot();
const setup = m => { G.mode = m; G.setCoop(false); G.sel[0].i = 1; G.sel[1].i = 1; G.setupMode() };

// ZONE: the bot should walk into the ring and hold it
setup('zone');
let inZoneTicks = 0, capStart = G.caps[1];
for (let i = 0; i < 5000; i++) {
  G.step();
  const b = G.tanks[1], z = G.zone;
  if (z && b && Math.hypot(b.x - z.x, b.y - z.y) < z.r) inZoneTicks++;
  if (G.state === 'game') break;
}
console.log('ZONE  | bot inside the ring', (inZoneTicks / 50).toFixed(0) + '% of the time',
  '| its capture', G.caps[1].toFixed(0) + '%', '| player capture', G.caps[0].toFixed(0) + '%', '|', G.state);

// BALL: the bot should move the ball toward the player's goal and score
setup('ball');
let ballAdvance = 0, prevX = G.ball.x;
for (let i = 0; i < 9000; i++) {
  G.step();
  if (G.ball) { if (G.ball.x < prevX) ballAdvance++; prevX = G.ball.x }
  if (G.state === 'game') break;
}
console.log('BALL  | goals', JSON.stringify(G.goals), '| ticks pushing toward the player net', ballAdvance, '|', G.state);

// SURVIVAL: bots must actually reach and damage an idle player
setup('survival');
const p = G.tanks[0];
let hp0 = p.hp;
for (let i = 0; i < 4000 && G.state !== 'game'; i++) G.step();
console.log('SURV  | player hp', hp0, '->', p.hp, '| lives', G.lives, '|', G.state);
