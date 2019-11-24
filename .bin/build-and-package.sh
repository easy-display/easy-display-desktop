#!/usr/bin/env bash

npm run clean-dist;
npm run pack;
npm i electron-installer-dmg --no-save;
./node_modules/.bin/electron-installer-dmg ./build/mac/EasyDisplay.app "./build/EasyDisplay-$(cat package.json | jq  '.version' | sed 's|"||g')";
