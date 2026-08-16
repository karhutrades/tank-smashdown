/* Headless online client: node netclient.js <host|guest> <CODE> */
const fs = require('fs');
const role = process.argv[2], code = process.argv[3];
const tag = role.toUpperCase().padEnd(5);
const say = (...a) => console.log(tag, ...a);

const js = fs.readFileSync(__dirname + '/game.js', 'utf8').replace("'use strict';", "");
const ctxStub = new Proxy({}, {
  get: (t, k) => {
    if (k === 'canvas') return { width: 960, height: 600 };
    if (k === 'measureText') return () => ({ width: 50 });
    if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop() {} });
    if (['fillStyle','strokeStyle','font','lineWidth','globalAlpha','textAlign','textBaseline','lineJoin'].includes(k)) return '';
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
global.location = { protocol: 'https:', hostname: process.env.FAKEHOST || 'localhost', search: '' };

const BRIDGE = `globalThis.__t={
  press:c=>pressQ.add(c), key:(c,v)=>{keys[c]=v}, step:()=>step(), draw:()=>draw(),
  get state(){return state}, set state(v){state=v},
  get mode(){return mode}, set mode(v){mode=v},
  get NET(){return NET}, get tanks(){return tanks}, get sel(){return sel},
  connect:(r,c)=>netConnect(r,c), setRelay:u=>{NET.relay=u}, get typeBuf(){return typeBuf}
};`;
(0, eval)(js + '\n' + BRIDGE);
const G = globalThis.__t;

if (process.env.RELAY) G.setRelay(process.env.RELAY);
say('relay in use:', G.NET.relay);
G.state = 'online';
G.mode = 'online';
G.connect(role, code);

let ticks = 0, reported = {}, startX = null;
const iv = setInterval(() => {
  // drive the game loop at ~60Hz
  for (let i = 0; i < 4; i++) { G.step(); ticks++; }

  if (G.NET.peer && !reported.peer) { reported.peer = true; say('peer connected, role =', G.NET.role); }
  if (G.state === 'select' && !reported.picked) {
    reported.picked = true;
    G.sel[0].i = role === 'host' ? 0 : 1;
    G.press('Space');            // lock in
    say('locked in class', G.sel[0].i);
  }
  if (['ready', 'play'].includes(G.state) && !reported.started) {
    reported.started = true;
    say('MATCH STARTED · map', G.tanks.length, 'tanks:', G.tanks.map(t => t.cls.name).join(' vs '));
  }
  if (G.state === 'play' && reported.started) {
    if (startX === null) { startX = G.tanks[1].x; if (role === 'guest') { G.key('KeyD', true); say('guest holding RIGHT') } }
    if (!reported.moved && Math.abs(G.tanks[1].x - startX) > 12) {
      reported.moved = true;
      say('OK remote tank moved:', startX.toFixed(0), '->', G.tanks[1].x.toFixed(0));
    }
    if (!reported.sync && role === 'guest' && G.NET.connected && G.tanks[0].x !== undefined && ticks > 400) {
      reported.sync = true;
      say('host tank seen at', G.tanks[0].x.toFixed(0), G.tanks[0].y.toFixed(0), '| my hp', G.tanks[1].hp);
    }
  }
  if (ticks % 200 === 0) say('dbg state=' + G.state, 'locked=' + G.sel[0].locked, 'theirClass=' + G.NET.theirClass, 'role=' + G.NET.role, 'peer=' + G.NET.peer, 'status=' + G.NET.status);
  if (ticks > (process.env.TICKS ? +process.env.TICKS : 1400)) {
    say('FINAL state=' + G.state, 'peer=' + G.NET.peer, 'moved=' + !!reported.moved, 'started=' + !!reported.started);
    say(reported.started && reported.moved ? 'CLIENT-OK' : 'CLIENT-FAIL');
    clearInterval(iv);
    process.exit(reported.started && reported.moved ? 0 : 1);
  }
}, 16);
