#!/bin/bash

git rm -r --cached .
git commit -m "Flush"
git push origin master
git add .
git commit -m "Update after Flush"
git push origin master

exit