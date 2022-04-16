#!/bin/bash

git rm -r --cached .
git add .
git commit -m "Refresh"
git push origin master

exit