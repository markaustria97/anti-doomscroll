# 9 — Reusable Workflows, Conditional Execution & Least-Privilege Permissions

## T — TL;DR

Reusable workflows (called via `workflow_call`) eliminate duplication across repos; conditional execution (`if:`) runs steps only when needed; least-privilege `permissions:` restrict the GITHUB_TOKEN to only what each job needs.

## K — Key Concepts

```yaml
# ── Reusable workflow definition ──────────────────────────
# .github/workflows/node-ci.yml (the CALLED workflow)
name: Reusable Node CI
on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: "20"
        required: false
      run-coverage:
        type: boolean
        default: false
    secrets:
      NPM_TOKEN:
        required: false

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: npm
      - run: npm ci
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}   # private registry auth
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test ${{ inputs.run-coverage && '-- --coverage' || '' }}

# ── Calling the reusable workflow ─────────────────────────
# .github/workflows/ci.yml (the CALLER workflow)
jobs:
  run-ci:
    uses: ./.github/workflows/node-ci.yml    # same repo
    # or across repos:
    uses: myorg/shared-workflows/.github/workflows/node-ci.yml@main
    with:
      node-version: "22"
      run-coverage: true
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
    # Or: secrets: inherit  (pass all calling workflow secrets)

# ── Conditional execution ─────────────────────────────────
jobs:
  deploy:
    runs-on: ubuntu-latest
    # Job-level conditions:
    if: github.ref == 'refs/heads/main'                   # only on main
    if: github.event_name == 'push'                       # only on push
    if: contains(github.event.head_commit.message, '[deploy]')
    if: github.actor != 'dependabot[bot]'                 # skip for bots
    if: always()                                          # run even if previous jobs failed
    if: failure()                                         # run only if previous failed (notifications)
    if: success()                                         # run only if all succeeded (default)

    steps:
      - name: Notify Slack on failure
        if: failure()                                     # step-level condition
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text": "CI failed on ${{ github.ref }}"}'
          
      - name: Only run on non-draft PRs
        if: github.event.pull_request.draft == false
        run: npm run integration-tests

      - name: Deploy to staging
        if: github.ref == 'refs/heads/develop'
        run: npm run deploy:staging
        
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: npm run deploy:production

# ── Least-privilege permissions (IMPORTANT for security) ──
# Default GITHUB_TOKEN has broad permissions — always restrict
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write        # create releases, push tags
      pull-requests: write   # comment on PRs
      issues: write          # comment on issues
      # Default (not granted unless specified):
      # packages: none
      # actions: none
      # deployments: none
      # id-token: none       # needed for OIDC to cloud providers
    steps:
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # Read-only job — even more restricted
  security-scan:
    permissions:
      contents: read         # read code only
      security-events: write # upload SARIF scan results
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --json > audit.json

# ── Pinning third-party actions (supply chain security) ───
# BAD: uses a mutable tag — action content can change:
- uses: actions/checkout@v4

# GOOD: pin to specific SHA — immutable:
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
- uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af  # v4.1.0

# Use Dependabot to auto-update pinned action SHAs:
# .github/dependabot.yml
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly       # opens PRs to update pinned SHAs
```


## W — Why It Matters

Least-privilege permissions are the most ignored GitHub Actions security practice — the default `GITHUB_TOKEN` has write access to almost everything. A compromised third-party action with broad permissions can write to your packages, create releases, or push code. Pinning to a commit SHA ensures a third-party action can't be updated maliciously between your runs.

## I — Interview Q&A

**Q: What's the difference between a reusable workflow and a composite action?**
A: A reusable workflow (`workflow_call`) is a full workflow with its own jobs and runners — called from another workflow's `jobs:`. A composite action is a reusable set of `steps:` (no own runner) — referenced as a `uses:` step inside a job. Reusable workflows share entire job pipelines; composite actions share step sequences.

**Q: Why is pinning actions to SHA safer than pinning to a version tag?**
A: Tags like `@v4` are mutable — a maintainer (or an attacker who compromised the maintainer's account) can push new code to the same tag. A SHA is immutable — `@abc1234` will always refer to exactly that commit, forever. Supply chain attacks on GitHub Actions are a real threat.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `secrets: inherit` broadly in caller workflows | Pass only required secrets explicitly — `inherit` leaks all secrets |
| `if: failure()` on deploy step — accidentally deploying broken code | `failure()` evaluates all previous steps; use `if: success()` on deploys |
| Third-party actions with `@main` branch reference | Always pin to tag or SHA — `@main` changes without notice |

## K — Coding Challenge

**Write a reusable workflow that accepts a `deploy-env` input and deploys to staging or production based on it:**

**Solution:**

```yaml
# .github/workflows/deploy.yml (reusable)
on:
  workflow_call:
    inputs:
      deploy-env:
        type: string
        required: true          # "staging" or "production"
    secrets:
      DEPLOY_KEY:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    environment: ${{ inputs.deploy-env }}   # uses GitHub Environments
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - name: Deploy
        run: ./scripts/deploy.sh ${{ inputs.deploy-env }}
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}

# Caller:
jobs:
  deploy-staging:
    uses: ./.github/workflows/deploy.yml
    with: { deploy-env: staging }
    secrets: { DEPLOY_KEY: ${{ secrets.STAGING_DEPLOY_KEY }} }
```


***
