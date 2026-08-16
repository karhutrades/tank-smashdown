const { boot } = require('./harness');
const G = boot();
G.mode='survival'; G.setCoop(false); G.sel[0].i=1; G.setupMode();
for(let i=0;i<130;i++)G.step();             // clear the countdown
console.log('state', G.state);
const p=G.tanks[0];
const x0=p.x;
G.key('KeyD', true); G.key('Space', true);   // human drives right and fires
for(let i=0;i<60;i++)G.step();
console.log('player moved', (p.x-x0).toFixed(1), 'px | bullets', G.bullets.length);
const e=G.tanks.find(t=>t.side===1);
console.log('enemy pos', (e.x|0)+','+(e.y|0), '| enemy cd', e.cd, '| enemy tang', e.tang && e.tang.toFixed(2));
console.log('enemy has ai?', !!e.ai, '| enemy in tanks?', G.tanks.includes(e), '| tanks len', G.tanks.length);
