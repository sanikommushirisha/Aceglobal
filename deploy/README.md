# Deploying the website (EC2)

| Branch | Goes to | How |
|---|---|---|
| `deploy-staging` | https://website.aceglobal.ai | automatically on push; `noindex` |
| `production` | https://aceglobal.ai | on push, after a reviewer presses **Approve** in GitHub Actions |

`main` is not deployed here (Vercel still builds it, and is the DNS rollback target).

Pipeline: [.github/workflows/deploy.yml](../.github/workflows/deploy.yml). GitHub builds
`.next/standalone`, streams the tarball over SSH, and [release.sh](release.sh) on the
server unpacks it, boots it on a spare port, smoke-tests it, and only then switches
the pm2 app. If the switched app fails its health check, the previous release is put back.

## Server layout (`ec2-user@32.194.116.41`)

| | production | staging |
|---|---|---|
| Folder | `~/apps/aceglobal-website` | `~/apps/aceglobal-website-stg` |
| pm2 app | `aceglobal-website` | `aceglobal-website-stg` |
| Port (live / pre-flight) | 3002 / 3012 | 3003 / 3013 |
| Database | `aceglobal_website` | `aceglobal_website_stg` |
| Runtime env | `shared/.env.local` | `shared/.env.local` (`SITE_ENV=preview`, `SITE_URL=https://website.aceglobal.ai`) |

Each folder has `releases/<sha>/`, `current -> releases/<sha>`, `shared/.env.local`, `logs/`.
The newest 3 releases are kept.

Scripts: `~/bin/website-release.sh` (= `deploy/release.sh`), `~/bin/website-deploy-gate.sh`
(= `deploy/gate.sh`). After changing either here, copy it to the server.

nginx: `/etc/nginx/conf.d/aceglobal-website.conf`. `aceglobal.ai` → 3002,
`website.aceglobal.ai` → 3003 with `X-Robots-Tag: noindex`, `www` → 301 apex.

## Deploy keys

One SSH key per environment, stored as the `DEPLOY_SSH_KEY` **environment** secret
(not a repository secret, so only a job that passed that environment's rules can read it).
On the server each key is locked to the gate in `~/.ssh/authorized_keys`:

```
restrict,command="/home/ec2-user/bin/website-deploy-gate.sh staging" ssh-ed25519 ... gha-website-staging
restrict,command="/home/ec2-user/bin/website-deploy-gate.sh production" ssh-ed25519 ... gha-website-production
```

The key can only run `release <its env> <sha>`: no shell, no port forwarding, and a
staging key cannot release production.

## GitHub settings (once)

Settings → Environments:
- `staging`: deployment branches = `deploy-staging`; secret `DEPLOY_SSH_KEY`.
- `production`: **Required reviewers** = whoever approves go-live; deployment branches =
  `production`; secret `DEPLOY_SSH_KEY`.

Recommended: Settings → Branches → protect `production` (no force push, no delete).

## Rollback

- Re-deploy an older commit: push it to the branch (`git push origin <sha>:production --force-with-lease`), approve.
- Fast, on the server:
  ```
  cd ~/apps/aceglobal-website && ls -t releases/
  ln -sfn ~/apps/aceglobal-website/releases/<older> current
  pm2 delete aceglobal-website
  PORT=3002 HOSTNAME=127.0.0.1 pm2 start current/server.js --name aceglobal-website \
    --cwd "$(readlink -f current)" --node-args="--env-file=$HOME/apps/aceglobal-website/shared/.env.local"
  pm2 save
  ```
