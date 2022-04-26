#!/usr/bin/env bash

# TODO: check basedir - should be root

_build() {
  echo "[hugo] build static"
  npm run build
  echo "[docker] build image"
  docker build -t "2xnone/deigineor.com:${IMAGE}" -f .ci/Dockerfile .
}

_deploy() {
  echo "[docker] push"
  docker push "2xnone/deigineor.com:${IMAGE}"
  echo "[k8s] restart deployment"
  kubectl rollout restart "deployment/${DEPLOYMENT}"
}

case "${1}" in
  demo)
    IMAGE=demo
    DEPLOYMENT=demo-deigineor
    _build
    _deploy 
    ;;
  prod)
    IMAGE=latest
    DEPLOYMENT=deigineor
    _build
    _deploy 
    ;;
esac
