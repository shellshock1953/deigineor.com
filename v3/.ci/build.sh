#!/usr/bin/env bash

# TODO: check basedir - should be root
IMAGE=docker.dnull.systems/deigineor.com

_build() {
  echo "[hugo] build static for ${MODE}"
  if [[ "${MODE}" == "prod" ]]; then
    npm run build
  else
    npm run build_${MODE}
  fi
  echo "[docker] build image"
  docker build -t "${IMAGE}:${TAG}" -f .ci/Dockerfile .
}

_deploy() {
  echo "[docker] push"
  docker push "${IMAGE}:${TAG}"
  echo "[k8s] restart deployment"
  kubectl rollout restart "deployment/${DEPLOYMENT}"
}

case "${1}" in
  demo)
    MODE=demo
    TAG=demo
    DEPLOYMENT=demo-deigineor
    _build
    _deploy 
    ;;
  prod)
    MODE=prod
    TAG=latest
    DEPLOYMENT=deigineor
    _build
    _deploy 
    ;;
esac
