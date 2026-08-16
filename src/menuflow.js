/* The menu itself must reach every mode - this is what was broken. */
const { boot } = require('./harness');
const G = boot();
let ok = true;
const check = (id, expect) => {
  G.state = 'title'; G.tick(2);
  G.pressKeys('Space'); G.tick(2);                 // -> mode grid
  G.gotoMode(id); G.tick(2);
  G.pressKeys('Space'); G.tick(3);                 // activate the card
  const good = expect.includes(G.state);
  if (!good) ok = false;
  console.log(id.padEnd(9), '->', G.state.padEnd(10), good ? 'OK' : 'EXPECTED ' + expect.join('/'));
  return G.state;
};
check('duel', ['difficulty']);
check('coop', ['select']);
check('campaign', ['campmenu']);
for (const m of ['survival', 'ball', 'zone', 'boss']) {
  const st = check(m, ['players']);
  if (st === 'players') {                          // solo -> tank select -> match
    G.pressKeys('Space'); G.tick(3);
    const sel = G.state === 'select';
    if (!sel) ok = false;
    console.log('  ', m, 'players -> select:', sel ? 'OK' : 'FAILED (' + G.state + ')');
    G.pressKeys('Space'); G.tick(80);
    const playing = ['ready', 'play'].includes(G.state);
    if (!playing) ok = false;
    console.log('  ', m, 'select -> match:', playing ? 'OK (' + G.tanks.length + ' tanks)' : 'FAILED (' + G.state + ')');
  }
}
check('online', ['online']);
check('profiles', ['profiles']);
console.log(ok ? 'MENU-OK' : 'MENU FAILURES');
process.exit(ok ? 0 : 1);
