#!/bin/bash

#cd /users/server/.homeassistant
# source /srv/homeassistant/homeassistant_venv/bin/activate
#hass --script check_config

#git rm -r --cached .

# WDIR=$(cd `dirname $0` && pwd)
# ROOT=$(dirname ${WDIR})

# . ${WDIR}/_parse_yaml.sh

# eval $(parse_yaml ${ROOT}/secrets.yaml)

# for i in `cut -f1 -d":" secrets.yaml`;do;echo $i: $(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1);done | sed 's/_url:.*/_url: https:\/\/www.some.url.com/' > travis_secrets.yaml


git add .
git status
echo -n "Enter the Description for the Change: [Minor Edit] "
read CHANGE_MSG
CHANGE_MSG=${CHANGE_MSG:-Minor Edit}
git commit -m "${CHANGE_MSG}"
git push origin master --force

exit