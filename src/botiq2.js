/* Sanity: is the CPU beatable, or now too good? Bot vs bot on each objective mode. */
const { boot } = require('./harness');
const G = boot();
const AI = {name:'N',react:6,aimErr:.12,aimTol:.22,dodge:.6,seek:true,lead:true,speedMul:1,fireGap:6};
for (const m of ['zone','ball']) {
  let p1 = 0, p2 = 0;
  for (let r = 0; r < 6; r++) {
    G.mode = m; G.setCoop(true); G.sel[0].i = 1; G.sel[1].i = 8; G.setupMode();
    G.tanks[0].ai = {...AI}; G.tanks[0].human = false;   // both sides played by bots
    G.tanks[1].ai = {...AI}; G.tanks[1].human = false;
    let i = 0;
    for (; i < 20000 && G.state !== 'game'; i++) G.step();
    const w = m === 'zone' ? (G.caps[0] > G.caps[1] ? 0 : 1) : (G.goals[0] > G.goals[1] ? 0 : 1);
    if (w === 0) p1++; else p2++;
    process.stdout.write(m === 'zone' ? `  round ${r+1}: ${G.caps[0].toFixed(0)}-${G.caps[1].toFixed(0)}\n`
                                      : `  round ${r+1}: ${G.goals[0]}-${G.goals[1]} in ${i} ticks\n`);
  }
  console.log(m.toUpperCase(), 'bot-vs-bot split:', p1, '-', p2);
}
