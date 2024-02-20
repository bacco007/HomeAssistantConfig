#!/bin/bash

ssh-keygen -F github.com -t dsa || ssh-keyscan github.com >> ~/.ssh/known_hosts > file.log 2>&1

git pull > file.log 2>&1

git config user.name "Thomas Baxter" > file.log 2>&1

git config user.email "thomas@thomasbaxter.info" > file.log 2>&1

git add . > file.log 2>&1
echo "-----> git add done"

git status
echo "-----> git status done"

NOW=$(date +"%d/%m/%Y %H:%M") > file.log 2>&1

git commit -m "Automated: HA Config as at $NOW" > file.log 2>&1
echo "-----> git commit done"

git push -u origin master > file.log 2>&1
echo "-----> git push done"
echo "-----> all done"