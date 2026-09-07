# Task 6 Report: Backend deployment workflow migration

## Changes

- Added the root workflow `.github/workflows/deploy-backend.yml`.
- Limited push deployment triggers to `main` and changes under `backend/**` or the workflow itself.
- Configured GHCR build context and Dockerfile as `./backend` and `./backend/Dockerfile`.
- Updated the EC2 script to synchronize `~/atlex` with `origin/main` and run Compose with `backend/docker-compose.yml`.
- Removed the nested `backend/.github/workflows/deploy.yml` workflow.

## Verification

- Ruby YAML parse: passed (`OK`).
- Static path checks for the `main` trigger, backend build paths, main branch synchronization, and backend Compose file: passed.
- `docker compose -f backend/docker-compose.yml config`: passed. Docker CLI and Compose were available locally. Docker emitted only the expected warning that `DB_HOST` was unset and defaulted to an empty value.
- No EC2 SSH connection or deployment was attempted because the EC2 environment is offline for this task.

## Fix round (review follow-up)

- Restricted both `build-and-push` and `deploy` jobs to `github.ref == 'refs/heads/main'`, including manual runs, so non-main refs cannot publish or deploy `latest`.
- Added `permissions: {}` to the deploy job because it does not need GitHub token permissions.
- Added `set -e` as the first remote script command so an intermediate SSH command failure stops the deployment.

### Fix verification

- YAML parsing: passed.
- Job condition and deploy permissions checks: passed.
- Remote script false/true failure-propagation simulation: passed (`set -e` stops on false; a successful sequence reaches completion).
- `docker compose -f backend/docker-compose.yml config`: passed (with the existing unset `DB_HOST` warning).
