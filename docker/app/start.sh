#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  local exit_code=$?

  if [[ -n "${NEST_PID:-}" ]] && kill -0 "${NEST_PID}" 2>/dev/null; then
    kill "${NEST_PID}" 2>/dev/null || true
  fi

  if [[ -n "${ANGULAR_PID:-}" ]] && kill -0 "${ANGULAR_PID}" 2>/dev/null; then
    kill "${ANGULAR_PID}" 2>/dev/null || true
  fi

  wait || true
  exit ${exit_code}
}

trap cleanup EXIT SIGINT SIGTERM

echo "Starting Nest API on port ${PORT:-3000}"
npx nx serve nestApi &
NEST_PID=$!

echo "Starting Angular app on port 4200"
npm --prefix apps/angularApi run start -- --host 0.0.0.0 --port 4200 &
ANGULAR_PID=$!

wait -n "${NEST_PID}" "${ANGULAR_PID}"
