# 2 — Semantic Versioning & Automated Releases

## T — TL;DR

Semantic versioning (`MAJOR.MINOR.PATCH`) communicates backward compatibility; `semantic-release` automates the entire release pipeline — version bump, git tag, GitHub Release, changelog, npm publish — from commit messages alone.

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

Manual versioning is error-prone and slows releases. `semantic-release` turns "merge to main" into a full automated release: version bump, changelog, GitHub Release, npm publish — all determined by your commit messages. Zero human decisions, zero forgotten steps.

## I — Interview Q&A

**Q: If a release contains one `fix:` commit and one `feat:` commit, what version is bumped?**
A: MINOR. `semantic-release` takes the highest-severity bump from all commits since the last release. `feat:` = MINOR, `fix:` = PATCH — the MINOR wins. The version goes from, say, `1.2.3` to `1.3.0`.

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
