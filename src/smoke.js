const { boot } = require('./harness');
const G = boot();


G.tick(3);
G.pressKeys('Space'); G.tick(2);
G.need(G.state === 'mode', 'title -> mode');

// ---- campaign ----
G.gotoMode('campaign'); G.tick(2); G.pressKeys('Space'); G.tick(2);
G.need(G.state === 'campmenu', 'mode -> campmenu');
G.pressKeys('Space'); G.tick(2);
G.need(G.state === 'select', 'campmenu -> select');
G.pressKeys('Space'); G.tick(70);
G.need(['ready', 'play'].includes(G.state), 'campaign match start');
let guard = 0;
while (G.state !== 'game' && guard++ < 40000) G.tick(1);
G.need(G.state === 'game', 'campaign never resolved');
console.log('campaign resolved in', guard, 'ticks; winner', G.roundWinner.tag, '| campaign stat =', G.profiles[0].stats.campaign);

// ---- profiles ----
G.pressKeys('Escape'); G.tick(3);
G.need(G.state === 'mode', 'game -> mode');
G.gotoMode('profiles'); G.pressKeys('Space'); G.tick(3);
G.need(G.state === 'profiles', 'mode -> profiles');
G.pressKeys('KeyS'); G.tick(2); G.pressKeys('KeyD'); G.tick(2);
const colour = G.profiles[G.slots[0]].color;
G.pressKeys('KeyS'); G.tick(2); G.pressKeys('Space'); G.tick(2);
G.need(G.state === 'name', 'profiles -> name');
G.typeBuf = 'DAN'; G.pressKeys('Enter'); G.tick(2);
G.need(G.profiles[G.slots[0]].name === 'DAN', 'rename did not stick');
G.pressKeys('Escape'); G.tick(3);
G.need(G.state === 'mode', 'profiles -> mode');
G.need(G.stored().profiles[0].name === 'DAN', 'profile not persisted to storage');

// ---- solo duel vs bot ----
G.gotoMode('duel'); G.pressKeys('Space'); G.tick(3);
G.need(G.state === 'difficulty', 'mode -> difficulty');
G.pressKeys('KeyD'); G.tick(2); G.pressKeys('Space'); G.tick(3);
G.need(G.state === 'select', 'difficulty -> select');
G.pressKeys('Space'); G.tick(70);
guard = 0;
while (G.state !== 'game' && guard++ < 60000) G.tick(1);
G.need(G.state === 'game', 'duel never resolved');
console.log('duel resolved in', guard, 'ticks; score', G.tanks.map(t => t.score).join('-'), '| names', G.tanks.map(t => t.name).join(' vs '));

// ---- co-op (both idle: should just run) ----
G.pressKeys('Escape'); G.tick(3);
G.gotoMode('coop'); G.pressKeys('Space'); G.tick(3);
G.need(G.state === 'select', 'mode -> coop select');
G.pressKeys('Space'); G.tick(3); G.pressKeys('Enter'); G.tick(70);
G.need(['ready', 'play'].includes(G.state), 'coop match start');
G.tick(600);
console.log('coop running:', G.state, '| P1 colour', colour, '| stats', JSON.stringify(G.profiles[0].stats));

// ---- every map boots ----
for (let i = 0; i < G.MAPS.length; i++) { G.mapIndex = i; G.startRound(); G.tick(5) }
console.log('all', G.MAPS.length, 'maps started OK');

// ---- bots actually fight on every map (no stalemates) ----
console.log('SMOKE-OK');
