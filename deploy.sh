#!/usr/bin/env bash
# Push the game page and relay to the Oracle box (karhutrades.com).
set -euo pipefail
KEY=~/.ssh/oracle.key
HOST=ubuntu@132.145.75.51
cd "$(dirname "$0")"

scp -i $KEY index.html relay-server.js $HOST:/tmp/
ssh -i $KEY $HOST 'set -e
  sudo cp /tmp/index.html /var/www/tanks/index.html
  sudo chmod a+r /var/www/tanks/index.html
  if ! cmp -s /tmp/relay-server.js /opt/tanksrelay/relay-server.js; then
    sudo cp /tmp/relay-server.js /opt/tanksrelay/relay-server.js
    sudo systemctl restart tanksrelay
    echo "relay restarted"
  fi'
echo "--- verify ---"
curl -s -o /dev/null -w 'page   HTTP %{http_code}\n' https://karhutrades.com/
curl -s https://karhutrades.com/ws/health | sed 's/^/relay  /'; echo
