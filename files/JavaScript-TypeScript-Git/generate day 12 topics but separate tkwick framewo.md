<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 12 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 12
Advanced Git, Release Automation \& CI/CD Foundations
Conventional Commits, scopes, BREAKING CHANGE, semantic versioning, prereleases, automated releases and changelogs, Dependabot, Renovate, git bisect, git blame, log --follow, grep, hooks, Husky, lint-staged, commitlint, signed commits, trunk-based development vs GitFlow, squash vs merge commit vs rebase merge, GitHub Actions workflow structure, triggers, jobs, steps, reusable workflows, secrets, env, matrices, cache strategy, concurrency control, conditional execution, checkout, setup-node, install, typecheck, lint, test, build, workflow timeouts, least-privilege token permissions, pinning third-party actions, selective triggers, git worktree add/list/remove, submodules, gc, prune, count-objects.

Here is **Day 12 — Advanced Git, Release Automation \& CI/CD Foundations** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 12 — Advanced Git, Release Automation \& CI/CD Foundations

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the commands. Move on.

***

# 1 — Conventional Commits, Scopes \& `BREAKING CHANGE`

## T — TL;DR

```
Conventional Commits is a machine-readable commit message format — `<type>(<scope>): <description>` — that unlocks automated versioning, changelogs, and release tooling.[^5][^1]
```


## K — Key Concepts

```
── Full commit message structure ──────────────────────────

<type>(<scope>): <short description>     ← header (required)
                                          ← blank line
<body>                                    ← optional, multi-line context

<footer(s)>                               ← optional, breaking changes / issue refs

── Types → SemVer mapping ────────────────────────────────

feat:      → MINOR bump  (new feature, backward-compatible)
fix:       → PATCH bump  (bug fix)
perf:      → PATCH bump  (performance improvement)
refactor:  → no bump     (code change, no feature/fix)
docs:      → no bump     (documentation only)
test:      → no bump     (tests only)
chore:     → no bump     (build scripts, deps, tooling)
ci:        → no bump     (CI/CD pipeline changes)
style:     → no bump     (formatting, not logic)
build:     → no bump     (build system changes)
revert:    → PATCH bump  (reverts a previous commit)

── Scope — what area of the codebase ─────────────────────

feat(auth): add OAuth2 login
fix(api): handle 429 rate limit retries
docs(readme): add deployment instructions
chore(deps): bump lodash to 4.17.21
refactor(utils): extract formatDate helper

Scopes are team-defined — common patterns:
- By domain:    auth, api, ui, db, cache, queue
- By component: button, modal, form, navbar
- By layer:     frontend, backend, infra

── BREAKING CHANGE → MAJOR bump ──────────────────────────

Method 1: Footer annotation
feat(api): redesign user endpoint response shape

BREAKING CHANGE: /api/users now returns { data: User[] } instead of User[].
Consumers must update destructuring: `const { data: users } = await getUsers()`

Method 2: Exclamation mark shorthand (easier)
feat(api)!: redesign user endpoint response shape
fix(auth)!: remove deprecated password field from JWT payload

Both trigger a MAJOR semver bump.

── Full examples ─────────────────────────────────────────

# Simple fix
fix(auth): prevent login with expired JWT

# Feature with scope
feat(payments): add Stripe webhook signature verification

# Breaking change with exclamation
feat(api)!: change pagination from page/limit to cursor-based

BREAKING CHANGE: Remove `page` and `limit` query params from /api/items.
Use `cursor` and `after` instead. Migration guide: docs/migration-v3.md

Refs #482

# Revert
revert: feat(auth): add biometric login

This reverts commit abc1234.
Reason: WebAuthn API incompatible with iOS 15 Safari.

── Prereleases ────────────────────────────────────────────
v1.0.0-alpha.1    # early unstable
v1.0.0-beta.3     # feature complete, testing
v1.0.0-rc.1       # release candidate, nearly stable
v1.1.0-next.0     # next major cycle preview

# In semantic-release: prerelease channels
# main → stable releases (v1.2.3)
# beta → beta channel (v1.2.3-beta.1)
# alpha → alpha channel (v1.2.3-alpha.1)
```


## W — Why It Matters

Conventional Commits is the contract between your commit history and your release tooling — without it, tools like `semantic-release` and `standard-version` can't determine whether to bump patch, minor, or major. Once adopted, version bumps and changelogs become fully automated — zero manual tagging.[^6][^1]

## I — Interview Q\&A

**Q: How does `BREAKING CHANGE` in a commit footer affect versioning?**
A: Any commit with `BREAKING CHANGE:` in the footer or `!` after the type (e.g., `feat!:`) triggers a **MAJOR** semver bump — regardless of whether the type is `fix` or `feat`. Even a `fix!:` that removes a deprecated field triggers `v2.0.0` not `v1.0.1`.[^1]

**Q: What's the difference between `feat` and `chore`?**
A: `feat` introduces a new user-facing capability — it bumps MINOR version and appears in the changelog. `chore` covers maintenance tasks (updating build tools, bumping dev dependencies, CI changes) — no version bump, no changelog entry. Only things that affect consumers need `feat` or `fix`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `feat` for every commit — dilutes versioning | Reserve `feat` for user-facing features; use `refactor`/`chore`/`docs` accurately |
| Missing blank line between header and body | The spec requires it — tools like `commitlint` will reject the commit |
| `BREAKING CHANGE` in the header instead of footer | Must be in the footer or use `!` shorthand — not in the commit subject line |

## K — Coding Challenge

**Write conventional commits for each scenario:**

```
1. Added dark mode toggle to the settings page
2. Fixed crash when user logs out with expired session
3. Removed the deprecated `getUser()` method from the SDK (breaking)
4. Updated ESLint from v8 to v9 (build tool change)
5. Added unit tests for the payment service
```

**Solution:**

```
1. feat(settings): add dark mode toggle
2. fix(auth): prevent crash on logout with expired session
3. feat(sdk)!: remove deprecated getUser() method

   BREAKING CHANGE: `getUser()` has been removed. Use `fetchUser()` instead.
   See migration guide: docs/v4-migration.md

4. chore(lint): upgrade ESLint to v9
5. test(payments): add unit tests for PaymentService
```


***

# 2 — Semantic Versioning \& Automated Releases

## T — TL;DR

Semantic versioning (`MAJOR.MINOR.PATCH`) communicates backward compatibility; `semantic-release` automates the entire release pipeline — version bump, git tag, GitHub Release, changelog, npm publish — from commit messages alone.[^2][^6]

## K — Key Concepts

```
── Semantic Versioning (SemVer) rules ─────────────────────

MAJOR.MINOR.PATCH  (e.g., 2.4.7)

PATCH bump: backward-compatible bug fix
  fix: prevent null error in formatDate

MINOR bump: backward-compatible new feature
  feat: add CSV export to reports page

MAJOR bump: incompatible API change
  feat!: rename `createUser` to `registerUser`
  BREAKING CHANGE: old `createUser` endpoint removed

Rules:
- MAJOR 0 (0.y.z): initial development — anything may change
- MAJOR > 0: API is stable; follow SemVer strictly
- When MAJOR bumps, reset MINOR and PATCH to 0
- When MINOR bumps, reset PATCH to 0

── semantic-release setup ─────────────────────────────────
```

```bash
npm install -D semantic-release \
  @semantic-release/git \
  @semantic-release/changelog \
  @semantic-release/github \
  @semantic-release/npm
```

```json
// .releaserc.json
{
  "branches": ["main", {"name": "beta", "prerelease": true}],
  "plugins": [
    "@semantic-release/commit-analyzer",      // reads commits → decides version bump
    "@semantic-release/release-notes-generator", // generates changelog content
    ["@semantic-release/changelog", {          // writes to CHANGELOG.md
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/npm", {               // bumps package.json, publishes to npm
      "npmPublish": true
    }],
    ["@semantic-release/git", {               // commits CHANGELOG.md + package.json
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }],
    "@semantic-release/github"                // creates GitHub Release + uploads assets
  ]
}
```

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main, beta]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write       # create releases, push commits
      issues: write         # comment on issues when fixed
      pull-requests: write  # comment on PRs when merged
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0         # semantic-release needs full history
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

```
── What semantic-release does on each merge to main ───────

1. Reads all commits since last release tag
2. Analyzes commit types:
   - Any fix: → patch bump (1.2.3 → 1.2.4)
   - Any feat: → minor bump (1.2.3 → 1.3.0)
   - Any BREAKING CHANGE → major bump (1.2.3 → 2.0.0)
3. Generates release notes from commits
4. Updates CHANGELOG.md
5. Bumps version in package.json
6. Commits those changes: "chore(release): 1.3.0 [skip ci]"
7. Creates git tag: v1.3.0
8. Creates GitHub Release with notes
9. Publishes to npm

── Dependabot / Renovate ─────────────────────────────────
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly     # creates automated PRs for dep updates
    groups:
      dev-dependencies:    # group minor/patch into single PR
        patterns: ["*"]
        update-types: ["minor", "patch"]
    ignore:
      - dependency-name: "lodash"
        versions: ["5.x"]  # pin a specific dep

# Renovate (alternative to Dependabot — more configurable)
# renovate.json
{
  "extends": ["config:base"],
  "automerge": true,        # auto-merge patch updates if CI passes
  "packageRules": [{
    "matchUpdateTypes": ["minor", "patch"],
    "automerge": true
  }]
}
```


## W — Why It Matters

Manual versioning is error-prone and slows releases. `semantic-release` turns "merge to main" into a full automated release: version bump, changelog, GitHub Release, npm publish — all determined by your commit messages. Zero human decisions, zero forgotten steps.[^2][^6]

## I — Interview Q\&A

**Q: If a release contains one `fix:` commit and one `feat:` commit, what version is bumped?**
A: MINOR. `semantic-release` takes the highest-severity bump from all commits since the last release. `feat:` = MINOR, `fix:` = PATCH — the MINOR wins. The version goes from, say, `1.2.3` to `1.3.0`.[^6]

**Q: What is Dependabot and how does it relate to release automation?**
A: Dependabot (GitHub-native) automatically opens PRs to update outdated dependencies on a schedule. Combined with conventional commits and automerge rules, patch updates to dev dependencies can be fully automated — Dependabot opens the PR, CI passes, it auto-merges, semantic-release publishes. Zero manual toil.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `semantic-release` failing with "no token" | Set `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` in the workflow env |
| `fetch-depth: 0` missing in checkout — semantic-release can't read history | Always `fetch-depth: 0` for semantic-release; default `fetch-depth: 1` is too shallow |
| Circular commits from the release step triggering the CI again | Add `[skip ci]` to the release commit message — semantic-release does this by default |

## K — Coding Challenge

**Given these commits since v1.5.2, predict the next version:**

```
chore(deps): bump typescript to 5.4
docs(api): update pagination docs
fix(auth): handle token refresh race condition
feat(search): add fuzzy matching support
test(search): add fuzzy match edge cases
```

**Solution:**

```
Commits analyzed:
- chore → no bump
- docs  → no bump
- fix   → PATCH
- feat  → MINOR ← wins
- test  → no bump

Highest bump: MINOR
Result: v1.5.2 → v1.6.0

Generated CHANGELOG section:
## Features
- **search:** add fuzzy matching support
## Bug Fixes
- **auth:** handle token refresh race condition
```


***

# 3 — `git bisect`, `git blame` \& `git log --follow`

## T — TL;DR

`git bisect` binary-searches history to find which commit introduced a bug; `git blame` shows who last changed each line and when; `git log --follow` tracks a file's history through renames.

## K — Key Concepts

```bash
# ── git bisect — find the bad commit ─────────────────────
git bisect start                    # start bisect session
git bisect bad                      # current commit is broken
git bisect good v2.0.0             # this tag was known good

# Git checks out a commit halfway through the range
# You test: does the bug exist?
git bisect good    # bug not present → go newer
git bisect bad     # bug present → go older

# After ~10 iterations (binary search through 1000 commits):
# "abc1234 is the first bad commit"
# abc1234 feat(payments): switch to new tax calculation lib

git bisect reset   # restore HEAD to original position

# ── Automated bisect with a test script ───────────────────
git bisect start
git bisect bad HEAD
git bisect good v1.9.0

# Provide a test script — returns 0=good, non-zero=bad
git bisect run npm test -- --testPathPattern="payments.test"

# Git automatically finds the culprit commit without manual testing
# Essential when the bug is hard to reproduce manually

# ── git blame — who changed this line? ────────────────────
git blame src/auth.js               # show all lines with last edit info
git blame -L 40,60 src/auth.js      # blame only lines 40-60
git blame --since="6 months ago" src/auth.js  # limit to recent changes
git blame -w src/auth.js            # ignore whitespace changes
git blame -C src/auth.js            # detect lines moved from other files

# Output format:
# abc1234 (Alice Smith 2025-03-15 14:23:01 +0000 42) const token = jwt.sign(...)
# ^       ^            ^date/time                 ^line  ^code

# Find who introduced a specific function:
git log -S "function validateToken" --oneline  # pickaxe search
git log -G "validateToken" --oneline            # regex pickaxe

# ── git log --follow — track through renames ──────────────
# Without --follow: history stops at the rename
git log -- src/utils/date.js          # only shows history after rename

# With --follow: tracks through renames
git log --follow -- src/utils/date.js  # full history even before rename
git log --follow -p -- src/utils/date.js  # + full diffs

# Find original filename
git log --follow --diff-filter=R -- src/utils/date.js  # shows rename commits

# ── grep across the git history ───────────────────────────
git grep "TODO" HEAD                  # grep in current commit
git grep "deprecated" v1.0.0          # grep in a specific tag
git grep -n "fetchUser" HEAD -- "*.ts"  # with line numbers, TS files only
git grep -l "API_KEY"                 # list files containing pattern (dangerous!)

# grep across ALL history (find when a string existed):
git log -S "getUser" --all --oneline  # commits that added/removed "getUser"
```


## W — Why It Matters

`git bisect run` is the most underused Git feature — it can find which commit introduced a bug across 1000 commits in 10 automated test runs. Without it, developers spend hours reading git log trying to guess. `git blame -C` (detect moved code) prevents false accusations — line moved from another file doesn't make that author the bug author.[^1]

## I — Interview Q\&A

**Q: How many test runs does `git bisect` need to find a bug in 1000 commits?**
A: Binary search — at most log₂(1000) ≈ 10 iterations. That's the mathematical guarantee. Whether you test manually or with `git bisect run`, 10 tests finds the culprit commit in any 1000-commit history.

**Q: What's the difference between `git log -S` and `git log -G`?**
A: `-S "text"` (pickaxe) finds commits where the number of occurrences of the string changed — i.e., where the string was added or removed. `-G "regex"` finds commits where the diff text matches the regex — even if the string didn't change in count. Use `-S` for "who added this", `-G` for broader pattern matching.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git bisect reset` not run after session — stuck in bisect | Always `git bisect reset` when done; check `git status` for bisect state |
| `git blame` blaming whitespace reformats as the "author" | Use `git blame -w` to ignore whitespace, `-C` to detect copied lines |
| `git log -- file.js` missing history before a rename | Add `--follow` to track through file renames |

## K — Coding Challenge

**Find which commit broke the `validateToken` function — tests pass on `v3.0.0` but fail on `HEAD`:**

**Solution:**

```bash
# Write a test script: test.sh
#!/bin/bash
npm run build 2>/dev/null
npm test -- --testPathPattern="validateToken" --passWithNoTests
# exit 0 = good, non-0 = bad

chmod +x test.sh

git bisect start
git bisect bad HEAD
git bisect good v3.0.0
git bisect run ./test.sh
# → "abc1234 is the first bad commit"
# → "refactor(auth): migrate JWT library to jose"

git bisect reset
# → Now you know exactly what to fix or revert
```


***

# 4 — Git Hooks, Husky, lint-staged \& commitlint

## T — TL;DR

Git hooks are scripts that run at specific points in the Git workflow; Husky makes them version-controlled and team-shared; lint-staged runs checks only on staged files (fast); commitlint enforces conventional commit format.[^7][^4][^8]

## K — Key Concepts

```bash
# ── Native Git hooks (not version-controlled) ─────────────
ls .git/hooks/
# applypatch-msg    pre-applypatch    pre-commit
# commit-msg        pre-merge-commit  pre-push
# post-commit       pre-rebase        prepare-commit-msg

# Create a native pre-commit hook:
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
npm run lint
npm run typecheck
EOF
chmod +x .git/hooks/pre-commit
# Problem: .git/hooks is NOT committed — teammates don't get it

# ── Husky — version-controlled hooks (modern setup) ───────
npm install -D husky
npx husky init                     # creates .husky/ directory + package.json script

# package.json (auto-added by husky init):
{
  "scripts": {
    "prepare": "husky"             # runs husky on npm install — hooks always set up
  }
}

# .husky/pre-commit
npm run lint-staged                # fast: only staged files

# .husky/commit-msg
npx --no-install commitlint --edit $1   # validate commit message format

# .husky/pre-push
npm run typecheck                  # full typecheck before push

# ── lint-staged — fast: only run on staged files ──────────
npm install -D lint-staged

# .lintstagedrc.js (or lint-staged key in package.json)
module.exports = {
  // TypeScript/JavaScript files
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",              // fix what can be auto-fixed
    "prettier --write",          // format
  ],
  // Other files — format only
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ],
  // CSS
  "*.{css,scss}": [
    "stylelint --fix",
    "prettier --write"
  ]
}
// Files are automatically re-staged after auto-fix
// If lint fails: commit is blocked, error shown, no changes committed

# ── commitlint — enforce conventional commits ─────────────
npm install -D @commitlint/cli @commitlint/config-conventional

# commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", [
      "auth", "api", "ui", "db", "cache", "deps", "ci", "docs"
    ]],
    "subject-min-length": [2, "always", 10],   // min 10 chars in description
    "body-max-line-length": [1, "always", 100], // warn if body line > 100 chars
    "footer-max-line-length": [0, "always", 200] // disable footer limit
  }
}

# .husky/commit-msg (already shown above)
npx --no-install commitlint --edit $1

# Test commitlint manually:
echo "feat: add login" | npx commitlint          # ✅
echo "added login stuff" | npx commitlint         # ❌ invalid format
echo "feat(auth): add OAuth" | npx commitlint     # ✅
echo "feat(billing): add Stripe" | npx commitlint # ❌ "billing" not in scope-enum

# ── Full setup sequence for a new project ─────────────────
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init

echo "npx lint-staged" > .husky/pre-commit
echo "npx --no-install commitlint --edit \$1" > .husky/commit-msg
echo "npm run typecheck" > .husky/pre-push

# Now every developer who runs npm install gets all hooks automatically ✅
```


## W — Why It Matters

Husky + lint-staged is the team-wide quality gate at zero CI cost — problems are caught before they're committed, not after CI runs 3 minutes later. The key insight: `lint-staged` runs only on staged files, not the whole codebase — a commit that touches 3 files runs lint on 3 files, not 500.[^4][^8]

## I — Interview Q\&A

**Q: Why use lint-staged instead of running ESLint on the whole project in a pre-commit hook?**
A: Full project lint can take 30+ seconds in large codebases — slow enough that developers start using `--no-verify` to skip hooks. lint-staged runs lint only on files being committed, typically taking under 2 seconds. Fast hooks get used; slow ones get skipped.[^8]

**Q: How does Husky ensure hooks are installed for all team members?**
A: Husky adds `"prepare": "husky"` to `package.json`. `prepare` is an npm lifecycle hook that runs automatically on every `npm install`. When a developer clones the repo and runs `npm install`, Husky runs and configures Git to use `.husky/` as the hooks directory.[^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `--no-verify` becoming a team habit | Keep hooks fast (< 5s) — lint-staged + typecheck on changed files only |
| Husky not running on CI | CI doesn't run `npm install --ignore-scripts` or equivalent; hooks are intentionally skipped on CI (CI has its own checks) |
| commitlint blocking merge commits like "Merge branch 'main'" | Add `defaultIgnores: true` in commitlint config — merge commits are ignored by default |

## K — Coding Challenge

**Set up the complete Husky + lint-staged + commitlint stack for a TypeScript project:**

**Solution:**

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init

# .husky/pre-commit:
echo "npx lint-staged" > .husky/pre-commit

# .husky/commit-msg:
echo "npx --no-install commitlint --edit \$1" > .husky/commit-msg

# .lintstagedrc.js:
cat > .lintstagedrc.js << 'EOF'
module.exports = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
EOF

# commitlint.config.js:
cat > commitlint.config.js << 'EOF'
module.exports = { extends: ["@commitlint/config-conventional"] }
EOF

# Now test:
git add src/index.ts
git commit -m "added stuff"
# ❌ commitlint: type may not be empty; subject may not be empty

git commit -m "feat(auth): add OAuth2 login handler"
# ✅ lint-staged runs on src/index.ts only → commit succeeds
```


***

# 5 — Signed Commits \& Trunk-Based Development vs GitFlow

## T — TL;DR

Signed commits use GPG/SSH keys to cryptographically verify the commit author's identity; trunk-based development (short-lived branches, continuous merge to `main`) suits high-frequency teams, while GitFlow suits versioned-release products.

## K — Key Concepts

```bash
# ── Signed commits (GPG) ──────────────────────────────────
# Generate a GPG key:
gpg --full-generate-key           # RSA 4096, real name, email matching git config

# List keys:
gpg --list-secret-keys --keyid-format=long

# Export public key to GitHub:
gpg --armor --export YOUR_KEY_ID   # copy output → GitHub Settings → GPG Keys

# Configure git to sign with your key:
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true   # sign all commits automatically
git config --global tag.gpgsign true      # sign all tags

# Single signed commit:
git commit -S -m "feat(auth): add 2FA"   # -S = sign this commit

# Verify signature:
git log --show-signature
git verify-commit HEAD

# ── Signed commits via SSH key (simpler, GitHub 2022+) ────
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# SSH signing is simpler: uses existing SSH key, no GPG setup needed
# GitHub shows "Verified" badge on signed commits

# ── Trunk-Based Development ───────────────────────────────
# One long-lived branch: main (the "trunk")
# Feature branches live for HOURS to DAYS — never weeks
# Every developer integrates to main at least once per day
# Feature flags hide incomplete features

# Workflow:
git switch -c feature/short-lived    # branch lives < 1 day ideally
# ... small change ...
git commit -m "feat: add search endpoint"
git push origin feature/short-lived
# → open PR → CI passes → merge same day
# Feature flag disables it in prod until ready:
if (featureFlags.isEnabled("new-search")) { ... }

# Pros: no long-running divergence, CI always on latest
# Cons: requires feature flags, discipline, high test coverage

# ── GitFlow ───────────────────────────────────────────────
# Long-lived branches:
# main     → production-only (always stable, tagged releases)
# develop  → integration branch (all features merge here)
# feature/ → feature branches off develop
# release/ → release stabilization off develop
# hotfix/  → emergency fixes off main

# GitFlow commit lifecycle:
git flow init                         # setup (git-flow tool)
git flow feature start user-auth      # creates feature/user-auth from develop
git flow feature finish user-auth     # merges back to develop
git flow release start 2.1.0          # creates release/2.1.0 from develop
git flow release finish 2.1.0         # merges to main + develop + tags v2.1.0
git flow hotfix start critical-bug    # off main directly
git flow hotfix finish critical-bug   # merges to main + develop

# Pros: explicit release cycles, clear hotfix path
# Cons: complex, long-lived branches diverge, slower integration
```

```
── Trunk-Based vs GitFlow ────────────────────────────────

| Aspect              | Trunk-Based             | GitFlow                  |
|---------------------|-------------------------|--------------------------|
| Long-lived branches | main only               | main + develop + release |
| Branch lifetime     | Hours to days           | Weeks to months          |
| Release cadence     | Continuous (daily/hourly) | Scheduled (weekly/monthly) |
| Feature isolation   | Feature flags           | Long feature branches    |
| Merge conflicts     | Rare (frequent merges)  | Common (long divergence) |
| Best for            | SaaS, continuous deploy | Versioned software, apps |
| Complexity          | Low                     | High                     |
```


## W — Why It Matters

Signed commits are required by some organizations (financial, government, OSS) for supply chain security — verifying that a commit actually came from the claimed developer. Trunk-based development is the practice behind Google, Facebook, and Netflix's engineering velocity — short-lived branches eliminate the "merge hell" that kills team velocity at scale.[^7]

## I — Interview Q\&A

**Q: What does "Verified" on a GitHub commit mean?**
A: It means the commit was cryptographically signed with a GPG key or SSH key whose public key is registered on GitHub. GitHub verified that the private key holder made the commit — not just that the `git config user.email` matches. Without signing, anyone can `git config user.email "linus@kernel.org"` and impersonate.

**Q: Why does trunk-based development require feature flags?**
A: Branches in trunk-based are merged to main before features are complete — multiple PRs build a feature incrementally. Feature flags let you merge incomplete code safely, hiding it from users until the whole feature is ready. Without flags, you'd either block merging (creating long branches) or ship half-built features.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| GitFlow's `develop` diverging far from `main` after a hotfix | GitFlow requires hotfixes to merge to BOTH `main` and `develop` — easy to forget |
| Trunk-based without feature flags — half-built code in production | Always pair trunk-based with a feature flag system before adoption |
| GPG signing failing with "secret key not available" | The GPG key's email must match `user.email` exactly in git config |

## K — Coding Challenge

**Given a team doing weekly versioned releases with a separate QA phase, choose the right workflow and explain the branch structure:**

**Solution:**

```
GitFlow is the right choice for weekly versioned releases with QA:

Branch structure:
main      → production code, tagged releases (v2.3.0, v2.4.0)
develop   → integration, always "next release" state
feature/* → individual features, merge to develop when complete
release/2.4.0 → QA phase: only bug fixes, no new features
             → when QA passes: merge to main + develop, tag v2.4.0
hotfix/*  → production emergencies off main, merge to main + develop

QA phase = release/2.4.0 branch:
git checkout -b release/2.4.0 develop
# QA tests, fixes bugs on this branch
# When approved:
git checkout main && git merge release/2.4.0 && git tag v2.4.0
git checkout develop && git merge release/2.4.0
```


***

# 6 — Squash vs Merge Commit vs Rebase Merge

## T — TL;DR

These are the three merge strategies for closing a PR — squash collapses all commits into one, merge commit preserves branch topology, rebase creates linear history without a merge commit; each team picks one and stays consistent.[^7]

## K — Key Concepts

```
── Starting state ────────────────────────────────────────

main:    A → B
feature: A → B → C → D → E (3 feature commits: "WIP", "fix typo", "add tests")

── Strategy 1: Squash and Merge ─────────────────────────

main:    A → B → S   (S = single squashed commit: all C+D+E changes)

git switch main
git merge --squash feature/login
git commit -m "feat(auth): add login flow (#42)"

Result:
✅ Clean linear main history
✅ One commit per feature — easy to revert entire feature
✅ No WIP/typo commits polluting main
❌ Individual commit history lost on main
❌ Feature branch not "fully merged" — `git branch -d` needs `-D`
❌ Author attribution collapsed to one person

Best for: PRs with messy WIP commits, teams wanting clean main

── Strategy 2: Merge Commit (no-ff) ─────────────────────

main:    A → B → M   (M = merge commit with two parents)
              ↗   ↗
             C → D → E

git switch main
git merge --no-ff feature/login -m "Merge feat(auth): login flow (#42)"

Result:
✅ Full history preserved — every commit visible
✅ Branch topology visible in git log --graph
✅ Easy to see what was part of which feature
❌ Merge commits add noise to `git log --oneline`
❌ Non-linear history harder to bisect

Best for: open-source projects, auditable enterprise codebases

── Strategy 3: Rebase Merge ─────────────────────────────

main:    A → B → C' → D' → E'   (rebased commits, new SHAs)

git switch feature/login
git rebase main
git switch main
git merge --ff-only feature/login   # fast-forward only

Result:
✅ Linear history — `git log` reads like a story
✅ Full per-commit history preserved (unlike squash)
✅ Easy to bisect (linear)
❌ Rewrites commit SHAs — author dates may change
❌ Requires force-push after rebase
❌ Can create conflicts per commit (not per file)

Best for: teams that value linear history + full commit detail
(e.g., Linux kernel, many OSS projects)

── Choosing a strategy ───────────────────────────────────

| Team type                     | Recommended strategy   |
|-------------------------------|------------------------|
| Fast-moving SaaS product      | Squash merge           |
| Open-source library           | Merge commit or Rebase |
| Strict linear history culture | Rebase merge           |
| Auditable enterprise          | Merge commit (no-ff)   |
| Mixed (depends on PR)         | Pick one and enforce   |

The most important rule: PICK ONE and enforce it via
GitHub branch protection → "allowed merge types"
```


## W — Why It Matters

Inconsistency between merge strategies is worse than any single bad choice — a `git log --graph` that mixes squash commits with merge commits with rebased commits is unreadable. GitHub's branch protection lets you enforce exactly one strategy, removing the decision from individual PR authors.[^7]

## I — Interview Q\&A

**Q: If you squash-merge a PR, can you use `git bisect` to find which "commit" introduced a bug?**
A: Only to the squash commit level — you can find which PR introduced it, but not which individual commit within the PR. For fine-grained bisect across all commits, you need rebase merge (linear history with all commits). Squash is fast for history browsing but loses bisect granularity.

**Q: Why does squash merge require `git branch -D` instead of `git branch -d`?**
A: Git's safe `-d` checks if the branch's commits are reachable from the current branch. After a squash merge, the original commits (C, D, E) are NOT in main's history — only the squashed commit S is. So Git considers the branch "not merged" and requires `-D` to force delete.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mixing merge strategies across PRs — unreadable history | Enforce one strategy in GitHub Settings → Branches → merge methods |
| Rebase merge leaving old remote branch with old SHAs | Always force push after rebase and update PR branch before merge |
| Squash commit message defaulting to list of all PR commits | Write a meaningful squash message summarizing the PR intent |

## K — Coding Challenge

**Demonstrate all three strategies on the same branch:**

```bash
# feature/demo has commits: "WIP: step1", "WIP: step2", "final: done"
```

**Solution:**

```bash
# Strategy 1: Squash
git switch main
git merge --squash feature/demo
git commit -m "feat(demo): complete demo feature"

# Strategy 2: Merge commit
git switch main
git merge --no-ff feature/demo -m "Merge feat(demo): demo feature (#1)"

# Strategy 3: Rebase + fast-forward
git switch feature/demo && git rebase main
git switch main && git merge --ff-only feature/demo

# Enforce team default (GitHub Settings alternative):
# Settings → Branches → main → Allow squash merging only ← one source of truth
```


***

# 7 — GitHub Actions: Workflow Structure, Triggers, Jobs \& Steps

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

## I — Interview Q\&A

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

# 8 — Secrets, Env, Matrices, Cache \& Concurrency

## T — TL;DR

Secrets are encrypted values injected as env vars at runtime; matrices run jobs in parallel across multiple configurations; caching dependencies dramatically speeds up CI; concurrency groups prevent race conditions on shared environments.[^9][^10]

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

Matrix builds catch cross-platform and cross-version bugs that single-environment CI misses — a library that works on Node 20 may fail on Node 18 still used by half your users. Caching turns `npm ci` from 45 seconds to 3 seconds on cache hit — for a 50-engineer team running 100 CI runs/day, that's hours of compute saved daily.[^9]

## I — Interview Q\&A

**Q: Why should you never use `${{ secrets.MY_SECRET }}` directly in a matrix variable?**
A: Secrets are interpolated into job metadata (including matrix job names) BEFORE GitHub's log masking applies — the secret value appears unmasked in the job name in the GitHub UI. Always pass secrets through `env:` at the step level, never through matrix variables.[^10]

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

# 9 — Reusable Workflows, Conditional Execution \& Least-Privilege Permissions

## T — TL;DR

Reusable workflows (called via `workflow_call`) eliminate duplication across repos; conditional execution (`if:`) runs steps only when needed; least-privilege `permissions:` restrict the GITHUB_TOKEN to only what each job needs.[^3]

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

Least-privilege permissions are the most ignored GitHub Actions security practice — the default `GITHUB_TOKEN` has write access to almost everything. A compromised third-party action with broad permissions can write to your packages, create releases, or push code. Pinning to a commit SHA ensures a third-party action can't be updated maliciously between your runs.[^3]

## I — Interview Q\&A

**Q: What's the difference between a reusable workflow and a composite action?**
A: A reusable workflow (`workflow_call`) is a full workflow with its own jobs and runners — called from another workflow's `jobs:`. A composite action is a reusable set of `steps:` (no own runner) — referenced as a `uses:` step inside a job. Reusable workflows share entire job pipelines; composite actions share step sequences.

**Q: Why is pinning actions to SHA safer than pinning to a version tag?**
A: Tags like `@v4` are mutable — a maintainer (or an attacker who compromised the maintainer's account) can push new code to the same tag. A SHA is immutable — `@abc1234` will always refer to exactly that commit, forever. Supply chain attacks on GitHub Actions are a real threat.[^3]

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

# 10 — `git worktree`, Submodules \& Repo Maintenance

## T — TL;DR

`git worktree` checks out multiple branches simultaneously in separate directories without cloning; submodules embed one repo inside another; `git gc` and `prune` clean up loose objects to keep repo performance healthy.

## K — Key Concepts

```bash
# ── git worktree — multiple branches at once ──────────────
# Normally: one working directory per repo (checkout = switch branches)
# Worktree: multiple working directories from ONE .git store

git worktree list                         # show all worktrees
# /home/alice/project        abc1234 [main]
# /home/alice/project-v2     def5678 [release/v2.0]
# /home/alice/hotfix-1234    ghi9012 [hotfix/payment-bug]

git worktree add ../project-hotfix hotfix/critical-bug
# Creates /project-hotfix/ checked out to hotfix/critical-bug
# Shares the same .git objects — no re-download, instant

git worktree add -b feature/new-ui ../project-feature main
# Creates a NEW branch feature/new-ui from main, checked out in /project-feature/

# Use cases:
# - Fix a hotfix while keeping feature work in current dir
# - Run long tests in one worktree, code in another
# - Compare implementations side-by-side

git worktree remove ../project-hotfix      # remove (must be clean)
git worktree prune                         # remove stale worktree entries

# ── Git Submodules ─────────────────────────────────────────
# Embed another Git repo inside your repo at a specific commit

# Add submodule:
git submodule add https://github.com/org/shared-lib.git libs/shared
# Creates:
# - libs/shared/ (cloned repo)
# - .gitmodules (tracks URL + path)
# - .git/modules/libs/shared (submodule's .git)

cat .gitmodules
# [submodule "libs/shared"]
#     path = libs/shared
#     url = https://github.com/org/shared-lib.git

# Clone repo WITH submodules:
git clone --recurse-submodules https://github.com/org/my-project.git
# Or after cloning:
git submodule init && git submodule update

# Update submodule to latest commit on its default branch:
git submodule update --remote libs/shared
git add libs/shared
git commit -m "chore(deps): update shared-lib to latest"

# Show submodule status:
git submodule status
# abc1234 libs/shared (v1.2.3)
# -def567 libs/other  (not initialized)

# Submodule gotchas:
# - Submodule records a SPECIFIC commit — not a branch
# - Changes inside submodule must be committed in the SUBMODULE first
# - Collaborators must run `git submodule update --init` after pulling

# ── git gc — garbage collection ────────────────────────────
git gc                           # pack loose objects, remove unreachable
git gc --aggressive              # deeper optimization (takes longer)
git gc --prune=now               # prune unreachable objects immediately
git gc --auto                    # run only if above threshold (Git does this automatically)

# ── git prune ─────────────────────────────────────────────
git prune                        # remove unreachable objects (part of gc)
git remote prune origin          # remove stale remote-tracking refs
git fetch --prune                # fetch + prune in one command

# ── git count-objects ─────────────────────────────────────
git count-objects                # loose objects: count and disk usage
# count: 143, size: 1204 (kilobytes)

git count-objects -v             # verbose: packed + loose
# count: 12
# size: 45
# in-pack: 8432
# packs: 3
# size-pack: 4821    ← packed objects size (KB)
# prune-packable: 0
# garbage: 0
# size-garbage: 0

git count-objects -vH            # human-readable sizes

# ── Finding large files in history ────────────────────────
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
  | sort -t" " -k3 -n -r \
  | head -20                     # top 20 largest objects in full history

# Remove a large file from ENTIRE history:
git filter-repo --path large-file.zip --invert-paths   # needs git-filter-repo tool
# Then force push all branches:
git push --force --all
```


## W — Why It Matters

`git worktree` is the fastest way to work on a hotfix while keeping your feature branch intact — no stashing, no branch switching, no losing context. For large repos with accidentally committed binary files, `git gc` after `filter-repo` can reduce repo size from gigabytes to megabytes.

## I — Interview Q\&A

**Q: What is the difference between a git submodule and a git subtree?**
A: A submodule keeps the embedded repo as a separate Git repository — it has its own `.git`, tracks a specific commit, and requires explicit `submodule update`. A subtree merges the embedded repo's history into the parent repo — no separate `.git`, no `submodule update` needed, simpler for consumers but harder to push changes back upstream.

**Q: When would you use `git worktree` instead of `git stash`?**
A: When the context switch is long-lived or complex — e.g., you need to run a test suite in the hotfix while continuing feature development, or you need to compare two branches side-by-side without switching. `stash` is for quick 5-minute context switches; `worktree` is for simultaneous parallel work.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `--recurse-submodules` on clone — empty submodule dirs | `git submodule init && git submodule update` to recover, or reclone with flag |
| `git gc --prune=now` before verifying no needed objects in reflog | Check `git reflog` first; `--prune=now` makes unreachable objects unrecoverable |
| Two worktrees checked out to the same branch — Git blocks it | Worktrees enforce one checkout per branch; use different branches per worktree |

## K — Coding Challenge

**You're mid-feature on `feature/dashboard`. A critical production bug needs fixing immediately. Use worktree to fix it without disturbing your feature work:**

**Solution:**

```bash
# Current state: feature/dashboard checked out in ~/project/

# Create worktree for hotfix WITHOUT leaving current dir:
git worktree add ../project-hotfix -b hotfix/null-crash origin/main

cd ../project-hotfix            # work in hotfix worktree
# Fix the bug:
git commit -m "fix(api): prevent null crash in user endpoint"
git push origin hotfix/null-crash
# Open PR → merge → done

# Clean up:
cd ../project               # back to feature work — untouched!
git worktree remove ../project-hotfix
git branch -d hotfix/null-crash

# Your feature/dashboard is exactly where you left it ✅
```


***

> ✅ **Day 12 complete.**
> Your tiny next action: set up Husky + lint-staged + commitlint in a project you're actively working in. Run `npx husky init`, add `npx lint-staged` to `.husky/pre-commit`, and try committing with a bad message. Watch commitlint block it. That 10-minute setup will save your team hours of review feedback every week.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://www.conventionalcommits.org/en/v1.0.0/

[^2]: https://github.com/semantic-release/semantic-release

[^3]: https://dev.to/kanta13jp1/github-actions-advanced-patterns-matrix-cache-and-reusable-workflows-1j68

[^4]: https://dev.to/_d7eb1c1703182e3ce1782/git-hooks-with-husky-and-lint-staged-the-complete-setup-guide-for-2025-53ji

[^5]: https://dev.to/tene/mastering-conventional-commits-structure-benefits-and-tools-3cpo

[^6]: https://jfrog.com/learn/sdlc/semantic-release/

[^7]: https://paulserban.eu/blog/post/advanced-git-workflows-for-team-collaboration/

[^8]: https://dev.to/zhangzewei/pre-commit-with-husky-lint-staged-2kcm

[^9]: https://codefresh.io/learn/github-actions/github-actions-matrix/

[^10]: https://devactivity.com/insights/securing-secrets-in-github-actions-matrix-builds-a-key-aspect-of-planning-a-software-project/

[^11]: https://xnok.github.io/infra-bootstrap-tools/blog/intentional-releases-changesets/

[^12]: https://www.sei.cmu.edu/blog/versioning-with-git-tags-and-conventional-commits/

[^13]: https://robk.uk/posts/training/github/2025-github-actions/07-controlling-workflow/

[^14]: https://capgo.app/blog/automating-ci-cd-with-conventional-commits/

[^15]: https://mokkapps.de/blog/how-to-automatically-generate-a-helpful-changelog-from-your-git-commit-messages

