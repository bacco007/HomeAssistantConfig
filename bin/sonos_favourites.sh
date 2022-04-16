#!/bin/bash

pip3 install soco

python3 bin/sonos_favourites.py

git add dwains-dashboard/configs/more_pages/sonos/partial_station_grid.yaml
git add automations/sonos_playlists/*
git commit -m "Automated: Update Sonos Favourites"