const { boot } = require('./harness');
const G = boot();
G.mode='survival'; G.setCoop(false); G.sel[0].i=1; G.setupMode();
const p=G.tanks[0];
p.ai={name:'N',react:5,aimErr:.1,aimTol:.25,dodge:.5,seek:true,lead:true,speedMul:1,fireGap:4}; p.human=false;
for(let i=0;i<900;i++)G.step();
console.log('map', G.MAPS[G.mapIndex].name, '| player', (p.x|0)+','+(p.y|0), 'cell', (p.x/40|0)+','+(p.y/40|0),
  'tile', JSON.stringify(G.cells[p.y/40|0][p.x/40|0]));
console.log('mv', p.mvx.toFixed(2), p.mvy.toFixed(2), '| iv', p.ivx.toFixed(2), p.ivy.toFixed(2),
  '| dead', p.dead, '| frozen', p.fx.frozen, '| panic', p.aiPanic, '| path', JSON.stringify(p.aiPath));
for (const [dx,dy,n] of [[1,0,'right'],[-1,0,'left'],[0,1,'down'],[0,-1,'up']])
  console.log('  ', n.padEnd(6), 'blocked:', G.dirBlocked(p,dx,dy));
console.log('neighbourhood:');
const gx=p.x/40|0, gy=p.y/40|0;
for (let y=gy-2;y<=gy+2;y++) console.log('   ', G.cells[y] ? G.cells[y].slice(gx-3,gx+4).join('') : '--');
console.log('ai input now:', G.aiInput(p));
