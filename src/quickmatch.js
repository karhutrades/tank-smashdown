/* two players who both press SPACE should end up in a match together */
const { boot } = require('./harness');
const G = boot({ hostname: 'karhutrades.com' });
G.setRelay('ws://localhost:8787');
G.mode = 'online'; G.state = 'online';
const tag = process.argv[2].toUpperCase().padEnd(2);
console.log(tag, 'client started, relay', G.NET.relay);
G.press('Space');                       // QUICK MATCH
let n = 0;
const keepalive = setTimeout(() => {}, 60000);
const iv = setInterval(() => {
  for (let i = 0; i < 4; i++) { G.step(); n++ }
  if (G.state === 'select' && !G.sel[0].locked) { G.sel[0].i = process.argv[2] === 'a' ? 0 : 1; G.press('Space') }
  if (n % 400 === 0) console.log(tag, 'state=' + G.state, 'code=' + G.NET.code, 'role=' + G.NET.role, 'peer=' + G.NET.peer);
  if (['ready','play'].includes(G.state)) { console.log(tag, 'IN A MATCH:', G.tanks.map(t => t.cls.name).join(' vs ')); clearInterval(iv); clearTimeout(keepalive); process.exit(0) }
  if (n > 2000) { console.log(tag, 'FAILED, state=' + G.state, G.NET.status, G.NET.msg); clearInterval(iv); clearTimeout(keepalive); process.exit(1) }
}, 16);
