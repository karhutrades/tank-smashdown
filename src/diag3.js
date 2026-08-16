const { boot } = require('./harness');
const G = boot();
G.tick(3); G.pressKeys('Space'); G.tick(2);          // title -> mode
G.menuIdx = 0; G.pressKeys('Space'); G.tick(3);      // singleplayer -> difficulty
console.log('state after mode select:', G.state);
G.pressKeys('KeyD'); G.tick(2); G.pressKeys('Space'); G.tick(3);
console.log('state after difficulty:', G.state, '| sel', JSON.stringify(G.sel));
G.pressKeys('Space'); G.tick(70);
console.log('after lock:', G.state, '| tanks:', G.tanks.map(t => t.cls.name + (t.ai ? '(AI)' : '')).join(' vs '));
for (let i = 0; i < 12; i++) {
  G.tick(500);
  console.log('t+' + ((i + 1) * 500), G.state, '| hp', G.tanks.map(t => t.hp).join('/'),
    '| scores', G.tanks.map(t => t.score).join('-'), '| map', G.MAPS[G.mapIndex].name);
  if (G.state === 'game') break;
}
