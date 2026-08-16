# Tank Smashdown - self-hosted build

Everything here is the same game as the Claude artifact, plus working **online multiplayer**.
Online needs two things: the page hosted somewhere, and a small relay server both players connect to.

## Files

| File | What it is |
| --- | --- |
| `tank-smashdown-online.html` | The whole game in one file (portrait image embedded). Nothing to build. |
| `relay-server.js` | Room-code relay. Plain Node, zero dependencies, no `npm install`. |

## 1. Run the relay

```bash
node relay-server.js            # listens on :8787
PORT=3000 node relay-server.js  # or whatever port your host assigns
```

Check it: `curl http://localhost:8787/health` returns `{"ok":true,...}`.

It pairs the two players in a room code and forwards messages between them. It never
reads the game data, holds no state beyond "who is in which room", and needs no database.

### Free places to run it

- **Render / Railway / Fly.io free tier** - point them at this repo, start command `node relay-server.js`.
  They give you HTTPS, so the game connects with `wss://your-app.onrender.com`.
- **Any box you already have** - run it behind Caddy for TLS:
  ```
  tanks.example.com {
      reverse_proxy localhost:8787
  }
  ```
- **Same machine / same LAN** - just `node relay-server.js` and use `ws://<your-ip>:8787`.

Free tiers sleep when idle, so the first connection after a quiet spell can take a few
seconds to wake. That is the free-tier trade, not a bug in the game.

## 2. Host the page

Any static host works, no build step, no server code:

- **GitHub Pages** - push `tank-smashdown-online.html` (rename to `index.html`), enable Pages.
- **Cloudflare Pages / Netlify** - drag the file into the dashboard.
- **Your own box** - serve the file with anything.

**TLS rule:** a page served over `https://` can only open `wss://` sockets. If you host the
page on HTTPS, the relay must have TLS too. Plain `http://` pages can use `ws://` freely,
which is why local testing works with no certificates.

## 3. Play

1. Both players open the page, press start, choose **ONLINE**.
2. Press `R`, type the relay URL (e.g. `wss://tanks.example.com`), press Enter. Saved for next time.
3. One player presses `H` to host and reads out the 4-letter room code.
4. The other presses `C`, types that code, presses Enter, then presses `J` to join.
5. You both land on the tank select. Lock in, and the host's machine runs the match.

Online, **either WASD or the arrow keys** drives your tank, since you each have your own keyboard.

## How the netcode works

Host-authoritative. The host simulates the match and broadcasts a state snapshot 20 times a
second; the guest sends only its input and renders what it is told. That means no desync,
and the guest feels one round-trip of input lag - fine on the same continent, noticeable
across an ocean. Verified working with two clients against the relay; it has not yet been
played over a real internet link, so treat online as beta.

## Local test in one terminal

```bash
node relay-server.js &
python3 -m http.server 8000     # then open http://localhost:8000/tank-smashdown-online.html
```

Open it in two browser windows, relay `ws://localhost:8787`, host in one and join in the other.

## Everything else

Singleplayer, campaign and co-op 1v1 all work with no server at all - open the HTML file
directly. Profiles, stats and unlocks are stored in each browser's local storage, so they
are per-device and never leave the machine.
