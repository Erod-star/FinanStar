---
name: verify
description: Run typecheck, lint, and tests for the FinanStar workspace (or one app) and report failures. Use after making changes, before committing or opening a PR.
---

Verify changes in this pnpm workspace. `$ARGUMENTS` may be `api`, `mobile`, or empty (both).

1. Pick scope: `api` → `--filter @finanstar/api`; `mobile` → `--filter @finanstar/mobile`; empty → infer from `git status`/`git diff --name-only` which apps changed; if unclear, run both (`pnpm -r`).
2. Run in order, continuing even if one fails:
   - `pnpm <scope> typecheck`
   - `pnpm <scope> lint` (runs `eslint --fix` — report any files it modified)
   - `pnpm <scope> test`
   Note: api has no specs yet — "No tests found" is not a failure (pass `--passWithNoTests` if Jest exits non-zero for that reason).
3. Report tersely: one line per step (pass/fail), then each failure with `file:line` and the error. Don't fix anything unless asked.
