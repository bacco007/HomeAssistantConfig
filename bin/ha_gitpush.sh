#!/bin/bash

ssh-keyscan github.com >> ~/.ssh/known_hosts > file.log

git config user.name "Thomas Baxter" > file.log

git config user.email "thomas@thomasbaxter.info" > file.log

git add . > file.log

NOW=$(date +"%d/%m/%Y %H:%M") > file.log

git commit -m "Automated: HA Config as at $NOW" > file.log

git push -u origin master > file.log
