/* real lobby flow: host presses H, guest TYPES the digits like a human would */
const { boot } = require('./harness');
const role = process.argv[2];
const G = boot({ hostname: 'karhutrades.com' });
G.setRelay('ws://localhost:8787');
G.mode = 'online'; G.state = 'online';
const say = (...a) => console.log(role.toUpperCase().padEnd(6), ...a);
const keepalive = setTimeout(() => {}, 60000);
let phase = 0, n = 0;
const iv = setInterval(() => {
  for (let i = 0; i < 4; i++) { G.step(); n++ }
  if (role === 'host' && phase === 0) { G.press('KeyH'); phase = 1; say('pressed H to host') }
  if (role === 'host' && phase === 1 && G.NET.code && G.NET.role) {
    phase = 2; say('room code is', G.NET.code);
    require('fs').writeFileSync('/tmp/roomcode.txt', G.NET.code);
  }
  if (role === 'guest' && phase === 0 && n > 240) {
    const code = require('fs').readFileSync('/tmp/roomcode.txt', 'utf8').trim();
    say('typing code', code, 'one digit at a time');
    for (const ch of code) G.netKey({ key: ch, code: 'Digit' + ch });
    say('typeBuf is now:', G.typeBuf);
    G.press('Enter');
    phase = 2;
  }
  if (G.state === 'select' && !G.sel[0].locked) { G.sel[0].i = role === 'host' ? 0 : 1; G.press('Space') }
  if (['ready', 'play'].includes(G.state)) {
    say('IN THE MATCH:', G.tanks.map(t => t.cls.name).join(' vs '));
    clearInterval(iv); clearTimeout(keepalive); process.exit(0);
  }
  if (n > 2400) { say('FAILED state=' + G.state, G.NET.status, G.NET.msg); clearInterval(iv); clearTimeout(keepalive); process.exit(1) }
}, 16);
