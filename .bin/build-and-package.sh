#!/usr/bin/env bash

source ~/.nvm/nvm.sh;

nvm use $(cat .nvmrc);

npm run clean-dist;
npm run dist;
npm i electron-installer-dmg --no-save;

readonly version=$(cat package.json | jq  '.version' | sed 's|"||g');

./node_modules/.bin/electron-installer-dmg  \
  --overwrite \
  --icon=assets/icons/mac/logo.icns \
  ./build/mac/EasyDisplay.app \
  "./build/EasyDisplay-${version}";
