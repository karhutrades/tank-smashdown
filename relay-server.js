/*
 * Tank Smashdown relay server.
 *
 * Pairs two players who join the same room code and forwards messages between
 * them. It never looks at the game data, it just relays.
 *
 * Zero dependencies - plain Node, no npm install:
 *     node relay-server.js            (listens on :8787)
 *     PORT=3000 node relay-server.js  (or any port your host gives you)
 *
 * Behind a TLS proxy (Caddy/nginx/Cloudflare/Render), point the game at
 * wss://your-host and proxy it to this port.
 */
'use strict';
const http = require('http');
const crypto = require('crypto');

const PORT = process.env.PORT || 8787;
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const rooms = new Map(); // code -> [socket, socket]

/* ---------- minimal WebSocket framing ---------- */
function send(sock, str) {
  const payload = Buffer.from(str, 'utf8');
  const len = payload.length;
  let head;
  if (len < 126) {
    head = Buffer.alloc(2);
    head[1] = len;
  } else if (len < 65536) {
    head = Buffer.alloc(4);
    head[1] = 126;
    head.writeUInt16BE(len, 2);
  } else {
    head = Buffer.alloc(10);
    head[1] = 127;
    head.writeBigUInt64BE(BigInt(len), 2);
  }
  head[0] = 0x81; // FIN + text
  try { sock.write(Buffer.concat([head, payload])); } catch (e) {}
}
function sendClose(sock) {
  try { sock.write(Buffer.from([0x88, 0x00])); sock.end(); } catch (e) {}
}
function sendPong(sock, payload) {
  const head = Buffer.from([0x8a, payload.length]);
  try { sock.write(Buffer.concat([head, payload])); } catch (e) {}
}

/* ---------- room plumbing ---------- */
function leave(sock) {
  const code = sock._room;
  if (!code) return;
  const peers = rooms.get(code);
  if (!peers) return;
  const i = peers.indexOf(sock);
  if (i >= 0) peers.splice(i, 1);
  for (const p of peers) send(p, JSON.stringify({ t: 'peerleft' }));
  if (!peers.length) rooms.delete(code);
  sock._room = null;
  log('leave', code, 'remaining', peers.length);
}
function join(sock, code, wanted) {
  code = String(code || '').toUpperCase().slice(0, 8) || 'ROOM';
  leave(sock);
  let peers = rooms.get(code);
  if (!peers) { peers = []; rooms.set(code, peers); }
  if (peers.length >= 2) {
    send(sock, JSON.stringify({ t: 'full' }));
    log('refused (full)', code);
    return;
  }
  const role = peers.length === 0 ? (wanted === 'guest' ? 'host' : wanted || 'host') : (peers[0]._role === 'host' ? 'guest' : 'host');
  sock._room = code;
  sock._role = role;
  peers.push(sock);
  send(sock, JSON.stringify({ t: 'role', role, peers: peers.length }));
  if (peers.length === 2) for (const p of peers) send(p, JSON.stringify({ t: 'peer' }));
  log('join', code, 'as', role, '- players:', peers.length);
}
function relay(sock, raw) {
  const peers = rooms.get(sock._room);
  if (!peers) return;
  for (const p of peers) if (p !== sock) send(p, raw);
}
function handleMessage(sock, raw) {
  let m;
  try { m = JSON.parse(raw); } catch (e) { return; }
  if (m && m.t === 'join') join(sock, m.room, m.role);
  else if (m && m.t === 'hb') send(sock, '{"t":"hb"}');
  else if (sock._room) relay(sock, raw);
}

/* ---------- HTTP + upgrade ---------- */
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    const players = [...rooms.values()].reduce((n, p) => n + p.length, 0);
    res.writeHead(200, {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',   // the game pings this to wake a sleeping instance
      'cache-control': 'no-store',
    });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size, players, up: Math.round(process.uptime()) }));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain', 'access-control-allow-origin': '*' });
  res.end('Tank Smashdown relay is running. Point the game here with ws:// or wss://\n');
});

server.on('upgrade', (req, sock) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) { sock.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  sock.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
  );
  sock.setNoDelay(true);
  sock._room = null;
  let buf = Buffer.alloc(0);

  sock.on('data', chunk => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      if (buf.length < 2) return;
      const op = buf[0] & 0x0f, masked = (buf[1] & 0x80) !== 0;
      let len = buf[1] & 0x7f, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      const maskLen = masked ? 4 : 0;
      if (buf.length < off + maskLen + len) return;
      const mask = masked ? buf.slice(off, off + 4) : null;
      const data = buf.slice(off + maskLen, off + maskLen + len);
      if (mask) for (let i = 0; i < data.length; i++) data[i] ^= mask[i % 4];
      buf = buf.slice(off + maskLen + len);

      if (op === 0x8) { leave(sock); sendClose(sock); return; }
      if (op === 0x9) { sendPong(sock, data); continue; }
      if (op === 0xa) continue;
      if (op === 0x1 || op === 0x0) handleMessage(sock, data.toString('utf8'));
      if (len > 1 << 20) { sock.destroy(); return; } // sanity cap
    }
  });
  sock.on('close', () => leave(sock));
  sock.on('error', () => leave(sock));
});

function log(...a) { console.log(new Date().toISOString().slice(11, 19), ...a); }
server.listen(PORT, () => log('Tank Smashdown relay listening on port ' + PORT));
