/* opening the page from a shared ?room= link should auto-join that room */
const { boot } = require('./harness');
const G = boot({ hostname: 'karhutrades.com', search: '?room=7777' });
const say = (...a) => console.log(process.argv[2].toUpperCase().padEnd(5), ...a);
G.setRelay('ws://localhost:8787');
const keepalive = setTimeout(() => {}, 60000);
let n = 0;
const iv = setInterval(() => {
  for (let i = 0; i < 4; i++) { G.step(); n++ }
  if (G.state === 'select' && !G.sel[0].locked) { G.sel[0].i = 1; G.press('Space') }
  if (['ready','play'].includes(G.state)) { say('AUTO-JOINED AND PLAYING, room', G.NET.code); clearInterval(iv); clearTimeout(keepalive); process.exit(0) }
  if (n > 2400) { say('FAILED', G.state, G.NET.status, G.NET.msg); clearInterval(iv); clearTimeout(keepalive); process.exit(1) }
}, 16);
