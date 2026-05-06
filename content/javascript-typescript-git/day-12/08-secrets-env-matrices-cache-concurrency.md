# 8 — Secrets, Env, Matrices, Cache & Concurrency

## T — TL;DR

Secrets are encrypted values injected as env vars at runtime; matrices run jobs in parallel across multiple configurations; caching dependencies dramatically speeds up CI; concurrency groups prevent race conditions on shared environments.

## K — Key Concepts

```yaml
# ── Secrets and environment variables ─────────────────────
# Secrets: encrypted, masked in logs — set in repo/org settings
# env: plain text — for non-sensitive configuration
env:
  NODE_ENV: test                           # workflow-level env (all jobs)
  API_BASE_URL: https://api.staging.com

jobs:
  deploy:
    env:
      NODE_ENV: production                 # job-level env (overrides workflow)
    
    steps:
      - name: Deploy
        run: npm run deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}     # injected at step level
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
          STRIPE_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
        # Secrets are masked: if printed, GitHub shows ***

# ── Matrix strategy — parallel combinations ────────────────
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]          # 3 Node versions
        os: [ubuntu-latest, windows-latest] # 2 OSes
        # = 6 parallel jobs (3 × 2)
      
      fail-fast: false         # don't cancel all jobs if one fails
      max-parallel: 4          # limit concurrent jobs (free tier)
      
      # Exclude specific combinations:
      exclude:
        - os: windows-latest
          node-version: 18     # skip Node 18 on Windows
      
      # Include extra combinations (with additional variables):
      include:
        - os: ubuntu-latest
          node-version: 20
          run-e2e: true         # only run E2E on this one combination
    
    runs-on: ${{ matrix.os }}
    name: Test (Node ${{ matrix.node-version }} on ${{ matrix.os }})
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm test
      - name: Run E2E tests
        if: ${{ matrix.run-e2e }}
        run: npm run test:e2e

# ── Cache strategy ─────────────────────────────────────────
steps:
  - uses: actions/cache@v4
    with:
      path: ~/.npm                        # what to cache
      key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
      # key = cache id; changes when package-lock.json changes
      restore-keys: |
        npm-${{ runner.os }}-             # fallback: any npm cache for this OS

  # actions/setup-node has built-in caching (preferred):
  - uses: actions/setup-node@v4
    with:
      node-version: "20"
      cache: npm                          # caches ~/.npm automatically

# ── Concurrency control ────────────────────────────────────
# Prevent multiple deploys to the same environment at once
concurrency:
  group: deploy-${{ github.ref }}         # one workflow per branch at a time
  cancel-in-progress: true               # cancel older run if newer starts

# For PRs: cancel outdated runs when new commits pushed
concurrency:
  group: pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true               # new commit to PR cancels old run
```


## W — Why It Matters

Matrix builds catch cross-platform and cross-version bugs that single-environment CI misses — a library that works on Node 20 may fail on Node 18 still used by half your users. Caching turns `npm ci` from 45 seconds to 3 seconds on cache hit — for a 50-engineer team running 100 CI runs/day, that's hours of compute saved daily.

## I — Interview Q&A

**Q: Why should you never use `${{ secrets.MY_SECRET }}` directly in a matrix variable?**
A: Secrets are interpolated into job metadata (including matrix job names) BEFORE GitHub's log masking applies — the secret value appears unmasked in the job name in the GitHub UI. Always pass secrets through `env:` at the step level, never through matrix variables.

**Q: What's the difference between `key:` and `restore-keys:` in the cache action?**
A: `key:` is the exact cache key — a cache hit restores it and the cache is not saved again at the end. `restore-keys:` is a list of fallback prefixes — if exact key misses, GitHub looks for the most recent cache matching any prefix. The new cache is saved with the exact `key:` at the end of the job.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `fail-fast: true` (default) canceling all matrix jobs on first failure | Set `fail-fast: false` for test matrices — see all failures at once |
| Cache key never changing — stale cache persists forever | Always include `hashFiles('**/package-lock.json')` in the key |
| No `concurrency:` on deploy jobs — multiple deploys racing | Always add concurrency group for any deployment job |

## K — Coding Challenge

**Write a matrix job that tests Node 18, 20, 22 on Ubuntu only, with npm caching, and `fail-fast: false`:**

**Solution:**

```yaml
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        node: [18, 20, 22]
    
    runs-on: ubuntu-latest
    name: Test (Node ${{ matrix.node }})
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
```


***
