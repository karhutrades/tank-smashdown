# Tank Smashdown - online build

Same game as the Claude artifact plus working online multiplayer. Set up for **Render's free tier**.

Two pieces: the **page** (static, host anywhere free) and the **relay** (a tiny always-listening
server that pairs two players by room code).

| File | What it is |
| --- | --- |
| `index.html` / `tank-smashdown-online.html` | The whole game in one file. Identical copies, `index.html` is the one static hosts serve by default. |
| `relay-server.js` | The relay. Plain Node, zero dependencies, no `npm install`. |
| `render.yaml` | Render Blueprint so the relay deploys with no manual config. |
| `package.json` | Start command for hosts that look for one. |

## Step 1 - push this folder to GitHub

Already a git repo with one commit. Create the remote and push:

```bash
cd ~/tank-smashdown
gh repo create tank-smashdown --public --source=. --push
```

## Step 2 - deploy the relay on Render

1. render.com, sign in with GitHub, **New > Blueprint**.
2. Pick the `tank-smashdown` repo. It reads `render.yaml` and proposes a free web service
   called `tank-smashdown-relay`. Apply.
3. Wait for the first deploy, then open `https://<your-service>.onrender.com/health`.
   You want `{"ok":true,...}`.

Your relay URL for the game is that same host with `wss://`:
`wss://tank-smashdown-relay.onrender.com`

**If Render gives the service a different name** (the name has to be unique across Render, so
it may add a suffix), either edit `DEFAULT_RELAY` near the top of the `<script>` in the HTML
and re-push, or just press `R` in the game's Online screen and type the URL once - it is saved
per browser.

## Step 3 - host the page

Any static host. Free options:

- **GitHub Pages**: repo Settings > Pages > deploy from `main`, root. Serves `index.html`.
- **Cloudflare Pages / Netlify**: connect the repo, no build command, output directory `/`.

The page is served over `https://`, which is exactly why the relay URL must be `wss://`
(a secure page cannot open an insecure socket). Render gives you TLS automatically.

## Step 4 - play

1. Both players open the page, press start, choose **ONLINE**.
2. One presses `H` to host and reads out the 4-letter code.
3. The other presses `C`, types the code, Enter, then `J` to join.
4. Both land on tank select. Lock in and the match starts.

Online, either WASD or the arrow keys drives your tank, since you each have your own keyboard.

You can also share a link with the relay baked in: `...?relay=wss://your-service.onrender.com`.

## About the free tier

Render's free services sleep after about 15 minutes of no traffic, and take roughly 30-60
seconds to wake. The game handles this: it pings `/health` first and shows a **WAKING** screen
with a running timer rather than failing. While a match is live the client sends a heartbeat
every 20 seconds so the instance stays awake. Free tiers change terms, so check the current
limits before you rely on it.

## How the netcode works

Host-authoritative. The host simulates the match and broadcasts a state snapshot 20 times a
second; the guest sends only its input and renders what it is told. No desync possible, and
the guest feels one network round-trip of input lag: fine domestically, noticeable across an
ocean. The relay never inspects game data, it only forwards bytes between two sockets in a room.

Tested: two clients through the relay complete a handshake, pick tanks, start the same match,
and the guest's input moves its tank on the host. Cold start tested too, clients waiting on a
relay that boots seven seconds late connect and play normally. Not yet played over a real
internet link, so treat online as beta.

## Local testing, no deploy

```bash
node relay-server.js &          # :8787
python3 -m http.server 8000     # http://localhost:8000/index.html
```

Open two browser windows. On `localhost` the game defaults to `ws://localhost:8787` already,
so just host in one window and join from the other.

## Everything else

Singleplayer, campaign and co-op 1v1 need no server at all: open the HTML file directly.
Profiles, stats and unlocks live in each browser's local storage, so they are per-device.
