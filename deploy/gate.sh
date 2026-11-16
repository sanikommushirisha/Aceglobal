#!/usr/bin/env bash
# SSH forced command for the GitHub Actions deploy keys.
#
# Installed as ~/bin/website-deploy-gate.sh and wired up in
# ~/.ssh/authorized_keys, one key per environment:
#
#   restrict,command="/home/ec2-user/bin/website-deploy-gate.sh staging" ssh-ed25519 AAAA... gha-website-staging
#   restrict,command="/home/ec2-user/bin/website-deploy-gate.sh production" ssh-ed25519 AAAA... gha-website-production
#
# Whatever the client asks to run, sshd runs this instead and puts the request
# in SSH_ORIGINAL_COMMAND. The only request accepted is
#
#   release <env> <40-char commit sha>
#
# with the build tarball on stdin, and <env> must match the environment this
# key is bound to. So a leaked staging key cannot touch production, and no key
# can open a shell.
set -euo pipefail

allowed_env="${1:?gate: key is not bound to an environment}"
read -r verb env sha extra <<<"${SSH_ORIGINAL_COMMAND:-}"

deny() { echo "gate: denied: $*" >&2; exit 2; }

[[ "${verb:-}" == "release" ]] || deny "unknown command"
[[ -z "${extra:-}" ]] || deny "unexpected arguments"
[[ "${env:-}" == "$allowed_env" ]] || deny "this key may only deploy '$allowed_env'"
[[ "${sha:-}" =~ ^[0-9a-f]{40}$ ]] || deny "bad commit sha"

exec "$HOME/bin/website-release.sh" "$env" "$sha"
