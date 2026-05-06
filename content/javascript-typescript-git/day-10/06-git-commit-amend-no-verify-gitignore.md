# 6 — `git commit`, Amend, `--no-verify` & `.gitignore`

## T — TL;DR

`git commit` snapshots the staging area; `--amend` rewrites the last commit without creating a new one; `.gitignore` prevents files from being tracked — never commit secrets or build artifacts.

## K — Key Concepts

```bash
# ── git commit ────────────────────────────────────────────
git commit -m "feat: add user authentication"   # one-line message
git commit                                       # opens editor for full message
git commit -am "fix: typo"                       # stage tracked + commit (skips untracked)
git commit --allow-empty -m "trigger CI"         # commit with no changes

# Good commit message format (Conventional Commits):
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, test, chore, perf, ci
# feat(auth): add JWT refresh token rotation
# fix(api): handle null user in fetchProfile
# refactor(utils): extract formatDate to shared module

# ── git commit --amend ────────────────────────────────────
git commit --amend -m "corrected message"    # change last commit message
git commit --amend --no-edit                 # add staged changes to last commit, keep message
# Use case: forgot a file in the last commit
git add forgotten-file.js
git commit --amend --no-edit                 # adds it to last commit

# ⚠️ amend rewrites history — creates a NEW commit SHA
# NEVER amend commits that have been pushed to shared branches

# ── --no-verify ───────────────────────────────────────────
git commit --no-verify -m "wip: bypass hooks"  # skips pre-commit and commit-msg hooks
git push --no-verify                            # skips pre-push hooks
# Use sparingly — hooks exist for a reason (lint, tests, format)

# ── .gitignore ────────────────────────────────────────────
# .gitignore syntax:
node_modules/         # ignore directory
*.log                 # ignore by extension
.env                  # ignore specific file
.env.*                # ignore .env.local, .env.production, etc.
!.env.example         # UN-ignore (always track this file)
dist/                 # build output
build/
coverage/
*.DS_Store            # macOS metadata
.idea/                # JetBrains IDE
.vscode/              # VS Code settings (optional — some teams track this)
*.pyc
__pycache__/

# .gitignore scope:
# - In root → applies to whole repo
# - In subdirectory → applies only to that subtree
# - .git/info/exclude → local ignores, not committed (personal)
# - git config --global core.excludesFile → global ignores for your machine

# Apply .gitignore to already-tracked files:
git rm -r --cached .          # remove all from index
git add .                     # re-add respecting .gitignore
git commit -m "chore: apply .gitignore"

# ── .gitkeep ──────────────────────────────────────────────
# Git doesn't track empty directories.
# Convention: add a .gitkeep (empty file) to track an empty dir.
touch logs/.gitkeep
git add logs/.gitkeep          # now the logs/ directory is tracked

# ── .gitattributes ────────────────────────────────────────
# Control line endings, diff behavior, merge strategy per file type:
* text=auto                    # auto-detect line endings
*.js text eol=lf               # always LF for JS files
*.png binary                   # treat as binary (no line-ending conversion)
*.md diff=markdown             # use markdown diff driver
CHANGELOG.md merge=union       # merge strategy for CHANGELOG
```


## W — Why It Matters

Amending is the most common history-cleanup operation — fix a typo, add a forgotten file to the last commit before pushing. Never amend pushed commits because it rewrites history and breaks teammates' repos. `.gitignore` is your first line of defense against committing secrets and build artifacts; adding a `.env` to a public repo is one of the most common security incidents.

## I — Interview Q&A

**Q: What's the difference between `git commit --amend` and `git rebase -i`?**
A: `--amend` only modifies the last commit — it's simple and fast. `git rebase -i` (interactive rebase) can modify any commit in history, reorder, squash, or drop multiple commits. Use `--amend` for quick last-commit fixes; `rebase -i` for cleaning up a series of WIP commits.

**Q: A secret was accidentally committed — what do you do?**
A: (1) Rotate the secret immediately — assume it's compromised. (2) Remove from history with `git rebase -i` or `git filter-repo`. (3) Force push. (4) Add to `.gitignore`. But the key point: any public push means the secret is compromised even after history rewrite — GitHub scans and caches everything.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git commit --amend` after pushing to shared branch | Only amend local commits — amending pushed commits requires force push and breaks teammates |
| `.gitignore` not ignoring an already-tracked file | `git rm --cached file` to untrack, then `.gitignore` works |
| `--no-verify` becoming a habit | Use it only for true emergencies — the hooks protect you |

## K — Coding Challenge

**You just committed but forgot to add `config/settings.js`. Fix it without creating a new commit:**

**Solution:**

```bash
git add config/settings.js
git commit --amend --no-edit    # folds the new file into the last commit
# Result: last commit now includes settings.js, same message
```


***
