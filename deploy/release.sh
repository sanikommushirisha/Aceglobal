#!/usr/bin/env bash
# Releases one build of the marketing website on the EC2 box.
#
# Installed as ~/bin/website-release.sh. Called by gate.sh with the build
# tarball (the contents of .next/standalone, plus public/ and .next/static) on
# stdin:
#
#   website-release.sh <staging|production> <commit sha>  < site.tgz
#
# Order of events, so a bad build never takes traffic:
#   1. unpack into releases/<sha>
#   2. boot it on a spare check port and smoke-test it there
#   3. only then point `current` at it and restart the pm2 app on the real port
#   4. smoke-test the real port; on failure, put the previous release back
#
# Layout per environment (BASE):
#   releases/<sha>/    one folder per build, newest KEEP kept
#   current ->         symlink to the live release
#   shared/.env.local  runtime env (secrets), never in the tarball
#   logs/              check-run logs
set -euo pipefail

ENV="${1:?usage: website-release.sh <staging|production> <sha>}"
SHA="${2:?usage: website-release.sh <staging|production> <sha>}"
KEEP=3

case "$ENV" in
  production) BASE="$HOME/apps/aceglobal-website";     NAME="aceglobal-website";     PORT=3002; CHECK_PORT=3012 ;;
  staging)    BASE="$HOME/apps/aceglobal-website-stg"; NAME="aceglobal-website-stg"; PORT=3003; CHECK_PORT=3013 ;;
  *) echo "release: unknown env '$ENV'" >&2; exit 2 ;;
esac
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "release: bad sha" >&2; exit 2; }

# Non-interactive SSH does not load the login shell, so bring in nvm's node/pm2.
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh" >/dev/null

ENV_FILE="$BASE/shared/.env.local"
REL="$BASE/releases/$SHA"
log() { echo "[release:$ENV] $*"; }
die() { echo "[release:$ENV] FAILED: $*" >&2; exit 1; }

[[ -f "$ENV_FILE" ]] || die "missing $ENV_FILE"
mkdir -p "$BASE/releases" "$BASE/logs"

# One release per environment at a time.
exec 9>"$BASE/.release.lock"
flock -n 9 || die "another $ENV release is already running"

# ── 1. Unpack ────────────────────────────────────────────────────────────────
log "unpacking $SHA"
rm -rf "$REL.tmp"
mkdir -p "$REL.tmp"
tar -xzf - -C "$REL.tmp" || { rm -rf "$REL.tmp"; die "could not unpack the tarball"; }
[[ -f "$REL.tmp/server.js" ]] || { rm -rf "$REL.tmp"; die "tarball has no server.js"; }
ln -sfn "$ENV_FILE" "$REL.tmp/.env.local"
rm -rf "$REL"
mv "$REL.tmp" "$REL"

# Returns 0 when the key pages answer 200 on the given port.
smoke() {
  local port="$1" path code
  for path in / /pricing /blog /robots.txt; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "http://127.0.0.1:$port$path") || code=000
    [[ "$code" == "200" ]] || { log "smoke $path on :$port -> $code"; return 1; }
  done
}

wait_up() {
  local port="$1" i
  for i in $(seq 1 40); do
    curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$port/" && return 0
    sleep 1
  done
  return 1
}

# ── 2. Pre-flight on the check port (live app untouched) ─────────────────────
log "pre-flight on :$CHECK_PORT"
( cd "$REL" && PORT=$CHECK_PORT HOSTNAME=127.0.0.1 \
    exec node --env-file="$ENV_FILE" server.js ) >"$BASE/logs/check-$SHA.log" 2>&1 &
CHECK_PID=$!
trap 'kill "$CHECK_PID" 2>/dev/null || true' EXIT
if ! wait_up "$CHECK_PORT" || ! smoke "$CHECK_PORT"; then
  tail -n 30 "$BASE/logs/check-$SHA.log" >&2 || true
  die "pre-flight failed; live site was not touched"
fi
kill "$CHECK_PID" 2>/dev/null || true
wait "$CHECK_PID" 2>/dev/null || true
trap - EXIT
log "pre-flight ok"

# Starts the pm2 app from a release folder. Older releases from before CI/CD
# have no server.js and run through `next start`.
start_app() {
  local dir="$1"
  pm2 delete "$NAME" >/dev/null 2>&1 || true
  if [[ -f "$dir/server.js" ]]; then
    PORT=$PORT HOSTNAME=127.0.0.1 pm2 start "$dir/server.js" --name "$NAME" --cwd "$dir" \
      --node-args="--env-file=$ENV_FILE" --max-memory-restart 700M --update-env >/dev/null
  else
    pm2 start npm --name "$NAME" --cwd "$dir" -- run start -- -p "$PORT" -H 127.0.0.1 >/dev/null
  fi
}

# ── 3. Switch ────────────────────────────────────────────────────────────────
PREV="$(readlink -f "$BASE/current" 2>/dev/null || true)"
ln -sfn "$REL" "$BASE/current.tmp" && mv -T "$BASE/current.tmp" "$BASE/current"
log "switching $NAME to $SHA (previous: ${PREV##*/})"
start_app "$REL"

# ── 4. Verify, or roll back ──────────────────────────────────────────────────
if ! wait_up "$PORT" || ! smoke "$PORT"; then
  if [[ -n "$PREV" && -d "$PREV" && "$PREV" != "$REL" ]]; then
    log "new release unhealthy, rolling back to ${PREV##*/}"
    ln -sfn "$PREV" "$BASE/current.tmp" && mv -T "$BASE/current.tmp" "$BASE/current"
    start_app "$PREV"
    wait_up "$PORT" && pm2 save >/dev/null
  fi
  die "release $SHA failed health check"
fi
pm2 save >/dev/null
log "live on :$PORT"

# ── Prune: keep the newest $KEEP releases, never the live one ────────────────
LIVE="$(readlink -f "$BASE/current")"
ls -1dt "$BASE"/releases/*/ 2>/dev/null | sed 's:/$::' | tail -n +$((KEEP + 1)) | while read -r old; do
  [[ "$old" == "$LIVE" ]] || { rm -rf "$old"; log "pruned ${old##*/}"; }
done
ls -1t "$BASE"/logs/check-*.log 2>/dev/null | tail -n +11 | xargs -r rm -f

log "done"
