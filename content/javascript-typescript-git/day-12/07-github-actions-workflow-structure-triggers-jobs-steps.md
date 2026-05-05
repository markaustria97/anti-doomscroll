# 7 — GitHub Actions: Workflow Structure, Triggers, Jobs & Steps

## T — TL;DR

A GitHub Actions workflow is a YAML file in `.github/workflows/` — it defines `on:` (triggers), `jobs:` (parallel units), and `steps:` (sequential tasks within a job); understanding this hierarchy unlocks the entire CI/CD model.[^3][^9]

## K — Key Concepts

```yaml
# .github/workflows/ci.yml
name: CI Pipeline                      # display name in GitHub UI

# ── Triggers (on:) ────────────────────────────────────────
on:
  push:
    branches: [main, develop]          # trigger on push to these branches
    paths:
      - "src/**"                       # only trigger if src/ files changed
      - "package*.json"
    paths-ignore:
      - "docs/**"                      # never trigger for docs-only changes
      - "**.md"

  pull_request:
    branches: [main]                   # PRs targeting main
    types: [opened, synchronize, reopened]  # PR events

  schedule:
    - cron: "0 6 * * 1-5"             # 6 AM UTC, weekdays (security scans)

  workflow_dispatch:                   # manual trigger via GitHub UI
    inputs:
      environment:
        type: choice
        options: [staging, production]
        required: true

  workflow_call:                       # called by another workflow (reusable)
    inputs:
      node-version:
        type: string
        default: "20"
    secrets:
      NPM_TOKEN:
        required: true

# ── Jobs (parallel by default) ────────────────────────────
jobs:
  lint:                                # job id (used in `needs:`)
    name: Lint & Type Check            # display name
    runs-on: ubuntu-latest             # runner environment
    timeout-minutes: 10               # fail if job takes too long
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4      # third-party action (pinned to tag)
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm                   # cache node_modules between runs
      
      - name: Install dependencies
        run: npm ci                    # ci = clean install from lock file
      
      - name: Type check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint

  test:
    name: Test Suite
    runs-on: ubuntu-latest
    needs: []                          # no dependency — runs in parallel with lint
    timeout-minutes: 20
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm test -- --coverage
      
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]                # waits for BOTH lint AND test to pass
    timeout-minutes: 15
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm run build
      
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```


## W — Why It Matters

The jobs-as-DAG model (directed acyclic graph via `needs:`) is what separates good CI from great CI. Running lint, test, and typecheck in parallel and only blocking build on all three cuts pipeline time from sequential (3 min each = 9 min) to parallel (3 min = 3 min + 1 min build = 4 min total).[^3]

## I — Interview Q&A

**Q: What's the difference between `push:` and `pull_request:` triggers?**
A: `push:` fires when commits land on a branch (after merge). `pull_request:` fires on PR events (opened, updated) and runs against the merge result of the PR + target branch. Both are needed: `pull_request:` for pre-merge validation, `push:` to trigger deployments after merge.

**Q: What does `needs: [lint, test]` do in a job definition?**
A: It declares that the `build` job depends on both `lint` and `test` jobs completing successfully. `lint` and `test` run in parallel. `build` only starts when both finish successfully. If either fails, `build` is skipped.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| All jobs sequential with `needs:` on every job | Only use `needs:` when there's a real dependency — let unrelated jobs run in parallel |
| Missing `timeout-minutes` — jobs running forever | Set per-job timeouts; default is 6 hours — a hung test will bill you for 6 hours |
| `paths:` and `paths-ignore:` combined on the same trigger | GitHub evaluates `paths` OR `paths-ignore`, not both — use one or the other |

## K — Coding Challenge

**Design a 4-job CI pipeline: typecheck + lint (parallel) → test → deploy (only on main push):**

**Solution:**

```yaml
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: npm }
      - run: npm ci && npm run typecheck

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: npm }
      - run: npm ci && npm run lint

  test:
    needs: [typecheck, lint]           # wait for both
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: npm }
      - run: npm ci && npm test

  deploy:
    needs: [test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - run: echo "Deploy to production"
```


***
