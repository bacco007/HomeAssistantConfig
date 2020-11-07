#!/bin/bash
docker pull tecnativa/docker-socket-proxy:latest

docker stop dockerproxy

docker rm dockerproxy

docker run --name dockerproxy \
--privileged \
--runtime runc -v /var/run/docker.sock:/var/run/docker.sock \
-p 2375:2375/tcp \
--net bridge \
--restart always \
--expose 2375/tcp \
 -e 'PLUGINS=1' \
 -e 'SWARM=1' \
 -e 'COMMIT=1' \
 -e 'NETWORKS=1' \
 -e 'NODES=1' \
 -e 'AUTH=1' \
 -e 'IMAGES=1' \
 -e 'SECRETS=1' \
 -e 'POST=1' \
 -e 'SERVICES=1' \
 -e 'SESSION=1' \
 -e 'SYSTEM=1' \
 -e 'VOLUMES=1' \
 -e 'CONFIGS=1' \
 -e 'CONTAINERS=1' \
 -e 'EXEC=1' \
 -e 'TASKS=1' \
 -e 'BUILD=1' \
 -e 'DISTRIBUTION=1' \
 -e 'INFO=1' \
 -e 'ALLOW_RESTARTS=0' \
 -e 'EVENTS=1' \
 -e 'LOG_LEVEL=info' \
 -e 'PING=1' \
 -e 'VERSION=1' \
 -d tecnativa/docker-socket-proxy:latest