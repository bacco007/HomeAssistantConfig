#!/bin/bash

git add . >> /dev/null

NOW=$(date +"%d/%m/%Y %H:%M")

git commit -m "Automated: HA Config as at $NOW" >> /dev/null

git push -u origin master >> /dev/null
