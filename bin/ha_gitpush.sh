#!/bin/bash

git add .

NOW=$(date +"%d/%m/%Y %H:%M")

git commit -m "Automated: HA Config as at $NOW"

git push -u origin master
