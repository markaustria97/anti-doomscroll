# 10 — CODEOWNERS, Branch Protection & Rulesets

## T — TL;DR

`CODEOWNERS` assigns automatic reviewers based on file paths; branch protection rules prevent direct pushes to `main` and require PRs, reviews, and CI; rulesets (GitHub's newer system) apply these at org scale.

## K — Key Concepts

```
── CODEOWNERS file ────────────────────────────────────────
# Placed at: .github/CODEOWNERS, CODEOWNERS, or docs/CODEOWNERS
# Syntax: <pattern> <owner1> <owner2>

# All files owned by @alice and @bob
*                    @alice @bob

# Infrastructure owned by the infra team
infra/               @org/infra-team

# Frontend owned by frontend team
src/                 @org/frontend-team
*.css                @alice @carlos

# API owned by backend team
src/api/             @org/backend-team

# GitHub Actions owned by DevOps
.github/             @org/devops-team
.github/workflows/   @org/devops-team

# Security-sensitive files need security team review
src/auth/            @org/security-team
**/secrets/          @org/security-team

# Override: specific file takes priority over directory pattern
src/api/public.js    @alice   # only alice reviews this file

# Result: when a PR touches a CODEOWNERS file/dir,
# the assigned owner is automatically added as required reviewer
```

```
── Branch Protection Rules (GitHub Classic) ──────────────
Settings → Branches → Add rule → Branch name pattern: main

Common settings:
☑ Require a pull request before merging
  ☑ Required approvals: 2
  ☑ Dismiss stale pull request approvals when new commits pushed
  ☑ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Status checks: ci/test, ci/lint, ci/type-check

☑ Require conversation resolution before merging
☑ Require signed commits
☑ Require linear history (no merge commits)
☑ Do not allow bypassing the above settings
☑ Restrict who can push to matching branches → @org/leads

── GitHub Rulesets (modern, replaces branch protection) ──
- Apply to multiple repos at org level
- More granular bypass permissions
- Supports "require review from specific teams"
- Enforce: no force-push, no deletion, required workflows

Key advantages over classic branch protection:
- Org-wide enforcement across hundreds of repos
- Named rules (auditable, version-controlled)
- Bypass lists with actor-level granularity
- Available for tags too (not just branches)
```


## W — Why It Matters

CODEOWNERS is how organizations ensure security-sensitive changes (auth, infra, payments) always get reviewed by the right team — even when someone forgets to add a reviewer manually. Branch protection with required CI prevents the classic "it worked on my machine" merge that breaks production.

## I — Interview Q&A

**Q: What happens if a CODEOWNERS file has conflicting rules?**
A: The last matching rule wins. CODEOWNERS patterns are evaluated bottom-to-top (like `.gitignore`) — more specific rules at the bottom override general ones at the top. Organizing with general rules first and specific overrides last is best practice.

**Q: What's the difference between branch protection rules and GitHub Rulesets?**
A: Branch protection rules are per-repo and configured manually. Rulesets can be applied at the organization level (enforcing across all repos simultaneously), support bypassing with named actors, apply to both branches and tags, and allow requiring review from specific teams — not just code owners.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| CODEOWNERS using usernames vs team names | Team syntax: `@org/team-name`; user syntax: `@username` — use teams for scale |
| Branch protection not applying to admins | Enable "Do not allow bypassing" — otherwise admins can skip all protections |
| Stale approvals after new commits not being dismissed | Enable "Dismiss stale PR approvals when new commits are pushed" |

## K — Coding Challenge

**Write a CODEOWNERS file for a full-stack repo:**

```
# Require: backend team reviews API, frontend team reviews UI,
# security team reviews auth, devops reviews CI workflows
# Alice owns overall project (all files)
```

**Solution:**

```
# .github/CODEOWNERS

# Default owner for everything
*                        @alice

# Infrastructure and CI
.github/                 @org/devops-team
infra/                   @org/devops-team

# Authentication — security sensitive
src/auth/                @org/security-team @org/backend-team
src/middleware/jwt*      @org/security-team

# Backend API
src/api/                 @org/backend-team
src/services/            @org/backend-team

# Frontend
src/components/          @org/frontend-team
src/pages/               @org/frontend-team
*.css                    @org/frontend-team

# Shared/public API contracts reviewed by both teams
src/api/contracts/       @org/backend-team @org/frontend-team
```


***
