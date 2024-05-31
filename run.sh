#!/bin/bash

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use the correct Node.js version
nvm install 14
nvm use 14

cd ~/Documents/Development.nosync/Indexer-lite
osascript -e 'display notification "Your script is running" with title "Notification"'
pm2 delete script || true
npm run start