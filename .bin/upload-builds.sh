#!/usr/bin/env bash

rsync -av --include='*.dmg'  --exclude='*' build/ root@downloads.easydisplay.info:/docker/downloads/



