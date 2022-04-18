#!/bin/bash

ssh-keyscan github.com >> ~/.ssh/known_hosts > file.log 2>&1

git config user.name "Thomas Baxter" > file.log 2>&1

git config user.email "thomas@thomasbaxter.info" > file.log 2>&1

git add . > file.log 2>&1

NOW=$(date +"%d/%m/%Y %H:%M") > file.log 2>&1

git commit -m "Automated: HA Config as at $NOW" > file.log 2>&1

git push -u origin master > file.log 2>&1
