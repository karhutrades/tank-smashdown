const { boot } = require('./harness');
const G = boot();
G.mode='survival'; G.setCoop(false); G.sel[0].i=1; G.setupMode();
for(let i=0;i<400;i++)G.step();
const e=G.tanks.find(t=>t.side===1);
const p=G.tanks[0];
console.log('enemy:', {cls:e.cls.name, side:e.side, dead:e.dead, hp:e.hp, ai:e.ai&&e.ai.name,
  x:e.x|0, y:e.y|0, mvx:+e.mvx.toFixed(2), mvy:+e.mvy.toFixed(2), frozen:e.fx.frozen, panic:e.aiPanic});
console.log('player side', p.side, 'hp', p.hp, 'dead', p.dead);
console.log('enemyOf(enemy) =', (G.enemyOf(e)||{}).tag, '| enemyOf(player) =', (G.enemyOf(p)||{}).tag);
console.log('aiInput(enemy) =', G.aiInput(e));
console.log('state', G.state, 'kind', G.kindOf());
const gx=e.x/40|0, gy=e.y/40|0;
console.log('cell', gx, gy, 'tile', JSON.stringify(G.cells[gy][gx]));
console.log('neighbourhood:');
for(let y=gy-2;y<=gy+2;y++) console.log('   ', G.cells[y]?G.cells[y].slice(gx-3,gx+4).join(''):'--');
for (const [dx,dy,n] of [[1,0,'right'],[-1,0,'left'],[0,1,'down'],[0,-1,'up']])
  console.log('  ', n.padEnd(6), 'dirBlocked:', G.dirBlocked(e,dx,dy),
    '| hitCell step:', !!G.hitCellAt(e.x+dx*3, e.y+dy*3, e.cls.radius, dx, dy));
console.log('other tanks at:', G.tanks.map(t=>t.tag+'@'+(t.x|0)+','+(t.y|0)+(t.dead?'(dead)':'')).join(' '));
