#!/usr/bin/env sh

WDIR=$(cd `dirname $0` && pwd)
ROOT=$(dirname ${WDIR})

# git --version>/dev/null || apk -q add git

echo "Updating fake_secrets.yaml"
${WDIR}/make_fake_secrets.sh

git add .
echo "-----> git add done"
git status
echo "-----> git status done"
echo -n "Enter the Description for the Change: [Minor Edit] "
read CHANGE_MSG
CHANGE_MSG=${CHANGE_MSG:-Minor Edit}
git commit -m "${CHANGE_MSG}"
echo "-----> git commit done"
git push origin master --force
echo "-----> git push done"
echo "-----> all done"

exit