#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${PULSE_MIND_DIR:-/var/www/pulse-mind}"
BRANCH="${PULSE_MIND_BRANCH:-main}"

cd "$APP_DIR"

before="$(git rev-parse HEAD)"
git fetch origin "$BRANCH"
after="$(git rev-parse "origin/$BRANCH")"

if [ "$before" = "$after" ]; then
  echo "PulseMind is already up to date at $before"
  exit 0
fi

git pull --ff-only origin "$BRANCH"
npm ci
npx prisma generate
npx prisma migrate deploy
npm run articles:check
npm run articles:import
npm run build
pm2 restart pulse-mind

echo "PulseMind published $before -> $after"
