#!/usr/bin/env bash

# TODO: check basedir - should be root

_build() {
  echo "[hugo] build static for ${MODE}"
  if [[ "${MODE}" == "prod" ]]; then
    npm run build
  else
    npm run build_${MODE}
  fi
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
    MODE=demo
    IMAGE=demo
    DEPLOYMENT=demo-deigineor
    _build
    _deploy 
    ;;
  prod)
    MODE=prod
    IMAGE=latest
    DEPLOYMENT=deigineor
    _build
    _deploy 
    ;;
esac
