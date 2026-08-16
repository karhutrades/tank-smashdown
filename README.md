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

Already a git repo. Create the remote and push:

```bash
cd ~/tank-smashdown
gh repo create tank-smashdown --public --source=. --push
```

## Step 2 - the relay on Render, at relay.karhutrades.com

1. render.com, sign in with GitHub, **New > Blueprint**, pick the `tank-smashdown` repo.
   It reads `render.yaml` and creates a free web service. Apply and wait for the deploy.
2. Check `https://<service>.onrender.com/health` returns `{"ok":true,...}`.
3. In the service: **Settings > Custom Domains > Add**, enter `relay.karhutrades.com`.
   Render shows a CNAME target like `tank-smashdown-relay.onrender.com`.
4. In Cloudflare DNS for karhutrades.com, add:

   | Type | Name | Target | Proxy |
   | --- | --- | --- | --- |
   | CNAME | `relay` | `<your-service>.onrender.com` | **DNS only** (grey cloud) |

   Grey cloud matters: it lets Render issue its own certificate. Cloudflare's proxy does
   support WebSockets, but leaving it off keeps this simple.

The game already defaults to `wss://relay.karhutrades.com`, so once that resolves nobody
has to type a URL. Until then, press `R` in the Online screen and paste the raw
`wss://<service>.onrender.com` address.

## Step 3 - the page

DNS is on Cloudflare, so Cloudflare Pages is the least friction: **Workers & Pages > Create >
Pages > Connect to Git**, pick the repo, no build command, output directory `/`. Then
**Custom domains > Set up a domain** and Cloudflare writes the DNS record itself.

Two choices for the address:

**A. The root, `karhutrades.com`** - the nicer URL. In Cloudflare DNS, delete the existing
`A` record pointing at `132.145.75.51` and attach the apex to the Pages project instead
(CNAME flattening handles the apex for you). Note this takes over the domain that currently
serves Snipzy from the Oracle box. Snipzy itself keeps running there untouched; it just
loses this hostname, and one CNAME would give it `snipzy.karhutrades.com` later if wanted.

**B. `tanks.karhutrades.com`** - leaves the root exactly as it is. Add the subdomain in the
Pages project and Cloudflare creates the record.

Either way the page ends up on `https://`, which is why the relay must be `wss://`.

## Step 4 - play

1. Both players open the page, press start, choose **ONLINE**.
2. One presses `H` to host and reads out the 4-letter code.
3. The other presses `C`, types the code, Enter, then `J` to join.
4. Both land on tank select. Lock in and the match starts.

Online, either WASD or the arrow keys drives your tank, since you each have your own keyboard.
You can also share a link with a relay override baked in: `...?relay=wss://other-host`.

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
