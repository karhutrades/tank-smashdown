/* Generated arenas must always be legal: right size, symmetric, connected, clear spawns. */
const { boot } = require('./harness');
const G = boot();
let bad = [], biomes = {};
for (let i = 0; i < 400; i++) {
  const idx = G.newArena();
  const m = G.MAPS[idx];
  biomes[m.world] = (biomes[m.world] || 0) + 1;
  if (m.grid.length !== 15) bad.push(m.name + ' rows');
  if (m.grid.some(r => r.length !== 24)) bad.push(m.name + ' cols');
  const SWAP = {'>':'<','<':'>','^':'v','v':'^','R':'L','L':'R','U':'D','D':'U'};
  for (let y = 0; y < 15; y++) for (let x = 0; x < 24; x++) {
    const a = m.grid[y][x], b = m.grid[14-y][23-x];
    if ((SWAP[a] || a) !== b) { bad.push(m.name + ' asym'); y = 99; break }
  }
  for (const [sx, sy] of m.spawns) if (m.grid[sy][sx] !== '.') bad.push(m.name + ' spawn blocked');
  if (!G.connectedMap(m)) bad.push(m.name + ' not connected');
  // no arena should be a bare field or a solid wall
  const floor = m.grid.join('').split('').filter(c => c === '.').length;
  if (floor < 150 || floor > 320) bad.push(m.name + ' floor ' + floor);
}
console.log('400 arenas generated | biomes:', JSON.stringify(biomes));
console.log(bad.length ? 'BAD: ' + [...new Set(bad)].slice(0, 8).join(', ') : 'ALL-ARENAS-VALID');
// determinism: same seed, same arena
const a = G.generateMap(12345), b = G.generateMap(12345);
console.log('same seed reproducible:', a.grid.join('|') === b.grid.join('|') ? 'YES' : 'NO');
console.log('two random arenas differ:', G.generateMap(1).grid.join('') !== G.generateMap(2).grid.join('') ? 'YES' : 'NO');
process.exit(bad.length ? 1 : 0);
