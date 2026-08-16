/* Shared headless harness: fake canvas + browser globals, returns a bridge to the game. */
const fs = require('fs');
function boot(opts = {}) {
  const ctxStub = new Proxy({}, {
    get: (t, k) => {
      if (k === 'canvas') return { width: 960, height: 600 };
      if (k === 'measureText') return () => ({ width: 50 });
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop() {} });
      if (['fillStyle','strokeStyle','font','lineWidth','globalAlpha','textAlign','textBaseline','lineJoin','lineCap'].includes(k)) return '';
      return () => {};
    }, set: () => true,
  });
  const el = { getContext: () => ctxStub, width: 960, height: 600 };
  global.document = { getElementById: () => el, createElement: () => el };
  global.window = {};
  if (!global.performance) global.performance = { now: () => Date.now() };
  global.requestAnimationFrame = () => {};
  global.addEventListener = () => {};
  global.localStorage = { _v: {}, getItem(k) { return this._v[k] || null }, setItem(k, v) { this._v[k] = v } };
  global.Image = function () { return { complete: false, naturalWidth: 0 } };
  global.location = { protocol: 'https:', hostname: opts.hostname || 'localhost', search: opts.search || '' };
  global.URLSearchParams = global.URLSearchParams || class { get() { return null } };
  if (!global.WebSocket) global.WebSocket = function () { return { readyState: 3, close() {} } };
  // the game's keep-alive timer would hold the node event loop open forever
  const realSetInterval = global.setInterval;
  global.setInterval = (fn, ms) => { const t = realSetInterval(fn, ms); if (t.unref) t.unref(); return t; };

  const js = fs.readFileSync(__dirname + '/game.js', 'utf8').replace("'use strict';", "");
  const BRIDGE = `globalThis.__t={
    press:c=>pressQ.add(c), key:(c,v)=>{keys[c]=v}, step:()=>step(), draw:()=>draw(),
    get state(){return state}, set state(v){state=v},
    get mode(){return mode}, set mode(v){mode=v},
    get menuIdx(){return menuIdx}, set menuIdx(v){menuIdx=v},
    get typeBuf(){return typeBuf}, set typeBuf(v){typeBuf=v},
    get mapIndex(){return mapIndex}, set mapIndex(v){mapIndex=v},
    get campStage(){return campStage}, set campStage(v){campStage=v},
    get campResult(){return campResult},
    get roundWinner(){return roundWinner}, get tanks(){return tanks}, get bullets(){return bullets},
    get profiles(){return profiles}, get slots(){return slots}, get sel(){return sel},
    get MAPS(){return MAPS}, get CLASSES(){return CLASSES}, get GUNS(){return GUNS},
    get NET(){return typeof NET!=='undefined'?NET:null},
    setAi:l=>{aiLevel=l}, startMatch:()=>startMatch(), startRound:()=>startRound(),
    damage:(t,d)=>damage(t,d,0,0), isUnlocked:(i,p)=>isUnlocked(i,p),
    get toast(){return toast}, aim:(t,a)=>{t.ang=a},
    connect:(r,c)=>netConnect(r,c), setRelay:u=>{NET.relay=u},
    get cells(){return cells}, aiInput:t=>aiInput(t), dirBlocked:(t,x,y)=>dirBlocked(t,x,y), T:40
  };`;
  (0, eval)(js + '\n' + BRIDGE);
  const G = globalThis.__t;
  G.tick = n => { for (let i = 0; i < n; i++) { G.step(); G.draw() } };
  G.pressKeys = (...c) => c.forEach(x => G.press(x));
  G.stored = () => JSON.parse(global.localStorage._v['tanksmash_profiles_v1'] || '{}');
  G.need = (cond, msg) => { if (!cond) throw new Error(msg + ' (state=' + G.state + ')') };
  return G;
}
module.exports = { boot };
