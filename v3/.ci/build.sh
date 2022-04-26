#!/usr/bin/env bash

# TODO: check basedir - should be root

echo "[hugo] build static"
npm run build

echo "[docker] build image"
docker build -t 2xnone/deigineor.com:latest -f .ci/Dockerfile .

echo "[docker] push"
docker push 2xnone/deigineor.com

echo "[k8s] restart deployment"
kubectl rollout restart deployment/deigineor
