#!/usr/bin/env bash
# Concatenate src/p*.js into the single-file game, then syntax check.
set -euo pipefail
cd "$(dirname "$0")"
{
  cat src/shell-top.html
  cat src/p1.js src/p2.js src/p3.js src/p4.js src/p5.js src/p6.js src/p7.js src/p8net.js
  echo '</script>'
} > index.html
cp index.html tank-smashdown-online.html
# a plain JS copy so `node --check` and the test harnesses can read it
cat src/p1.js src/p2.js src/p3.js src/p4.js src/p5.js src/p6.js src/p7.js src/p8net.js > src/game.js
node --check src/game.js
echo "built index.html ($(wc -c < index.html) bytes)"
