const { boot } = require('./harness');
const G = boot();
const P=()=>G.profiles[0];

// --- human wins a duel 3-0: stats + unlock ---
G.mode='duel';G.sel[0].i=1;G.sel[1].i=1;G.startMatch();
for(let r=0;r<3;r++){
  G.tick(120);                       // ready -> play
  G.need(G.state==='play','play expected r'+r);
  G.damage(G.tanks[1],99);         // P1 kills the CPU
  G.tick(200);                       // round banner -> next round or game
}
G.need(G.state==='game','match should end');
console.log('duel win -> wins',P().stats.wins,'kos',P().stats.kos,'rounds',P().stats.rounds);
G.need(P().stats.wins===1,'win not recorded');
G.need(P().stats.kos===3,'kos wrong: '+P().stats.kos);

// second win should unlock SCATTER (needs 2 wins)
const SC=G.CLASSES.findIndex(c=>c.unlock&&c.unlock.k==='wins'&&c.unlock.n===2);
G.need(!G.isUnlocked(SC,P()),'the 2-win unlock should still be locked');
G.startMatch();
for(let r=0;r<3;r++){G.tick(120);G.damage(G.tanks[1],99);G.tick(200)}
G.need(P().stats.wins===2,'second win missing');
G.need(G.isUnlocked(SC,P()),'the 2-win tank should unlock');
G.need(G.toast&&/UNLOCKED/.test(G.toast.txt),'unlock toast missing');
console.log('unlock toast:',G.toast.txt);
G.need(G.stored().profiles[0].stats.wins===2,'stats not persisted');

// --- campaign: clear a stage, continue advances ---
G.mode='campaign';G.campStage=0;G.startMatch();
G.tick(120);G.damage(G.tanks[1],99);G.tick(200);
G.need(G.state==='game','campaign stage should end');
G.need(G.campResult==='CLEARED','campResult should be CLEARED, got '+G.campResult);
G.need(P().stats.campaign===1,'campaign progress not saved: '+P().stats.campaign);
G.tick(40);G.pressKeys('Space');G.tick(5);
G.need(G.campStage===1,'continue should advance stage, got '+G.campStage);
G.need(['ready','play'].includes(G.state),'next stage should start, got '+G.state);
console.log('campaign advance OK -> stage',G.campStage+1,'map',G.mapIndex);

// --- campaign loss retries the same stage ---
G.tick(120);G.damage(G.tanks[0],99);G.tick(200);
G.need(G.campResult==='FAILED','should be FAILED, got '+G.campResult);
G.tick(40);G.pressKeys('Space');G.tick(5);
G.need(G.campStage===1,'retry should stay on the same stage, got '+G.campStage);
console.log('campaign retry OK; losses',P().stats.losses);
console.log('SMOKE2-OK');
