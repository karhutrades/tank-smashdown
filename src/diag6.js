const { boot } = require('./harness');
const G = boot();
G.mode='duel'; G.setAi(2); G.sel[0].i=1; G.startMatch();
G.mapIndex=4; G.startRound();
G.tanks[1].cls=G.CLASSES[4]; G.tanks[1].maxHp=5; G.tanks[1].hp=5;
for (let i=0;i<2200;i++) G.step();
const c=G.tanks[1];
const gx=(c.x/40|0), gy=(c.y/40|0);
console.log('cpu at', c.x.toFixed(1), c.y.toFixed(1), '-> cell', gx, gy, 'tile', JSON.stringify(G.cells[gy][gx]));
console.log('neighbourhood:');
for (let y=gy-2;y<=gy+2;y++) console.log('  ', G.cells[y].slice(gx-3,gx+4).join(''), y===gy?'  <- row':'');
console.log('panic', c.aiPanic, 'path', JSON.stringify(c.aiPath), 'wedge', c.wedge, 'frozen', c.fx.frozen, 'ghost', c.fx.ghost);
const inp=G.aiInput(c);
console.log('ai wants dx,dy =', inp.dx.toFixed(2), inp.dy.toFixed(2), 'fire', inp.fire);
console.log('blocked in that direction?', G.dirBlocked(c, inp.dx, inp.dy));
for (const [dx,dy,n] of [[1,0,'right'],[-1,0,'left'],[0,1,'down'],[0,-1,'up']])
  console.log('  ', n.padEnd(6), 'blocked:', G.dirBlocked(c,dx,dy));
