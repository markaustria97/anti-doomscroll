# 7 — `git revert` & `git cherry-pick`

## T — TL;DR

`git revert` safely undoes a commit by creating a new "undo" commit — safe for shared branches; `git cherry-pick` copies a specific commit from any branch onto your current branch.

## K — Key Concepts

```bash
# ── git revert — safe undo for shared branches ────────────
git revert HEAD               # undo last commit with a new commit
git revert HEAD~2             # undo the commit 2 back
git revert abc1234            # undo a specific commit by SHA
git revert abc1234 --no-edit  # skip opening editor for message
git revert HEAD~3..HEAD       # revert a range (3 commits)

# What revert does:
# Before: A → B → C (HEAD)
# git revert C:
# After:  A → B → C → C' (C' undoes C's changes)
# C is still in history — revert just adds an opposite commit

# vs. reset:
# reset: removes commit from history (rewrites history)
# revert: adds a new commit that reverses the changes (safe, auditable)

# Revert a merge commit (must specify -m):
git revert -m 1 abc1234   # -m 1 = keep "parent 1" side (the branch you were on)
git revert -m 2 abc1234   # -m 2 = keep "parent 2" side (the branch you merged in)

# ── git cherry-pick — copy specific commits ───────────────
git cherry-pick abc1234           # copy commit abc1234 onto current branch
git cherry-pick abc1234 def5678   # copy multiple commits
git cherry-pick abc1234..mno7890  # copy a range (exclusive start)
git cherry-pick --no-commit abc1234  # apply changes but don't commit yet
git cherry-pick -x abc1234        # add "(cherry picked from commit abc1234)" to message

# Cherry-pick workflow: hotfix to multiple branches
# Bug fixed on main as commit abc1234
# Need it on both v2.0 and v1.9 branches:
git switch release/v2.0
git cherry-pick abc1234           # apply bug fix to v2.0

git switch release/v1.9
git cherry-pick abc1234           # apply same fix to v1.9

# Cherry-pick conflict:
git cherry-pick abc1234            # conflict!
# resolve conflicts...
git add resolved-file.js
git cherry-pick --continue         # finish cherry-pick
git cherry-pick --abort            # cancel entirely

# Cherry-pick creates NEW commits with different SHAs
# (same changes, new parent = new SHA)

# ── revert vs reset vs cherry-pick ────────────────────────
# git revert:      safe undo — adds new commit, keeps history
# git reset:       unsafe undo — removes commits, rewrites history
# git cherry-pick: copy — apply changes from elsewhere as new commit
```


## W — Why It Matters

`git revert` is the only correct way to undo commits on shared branches (`main`, `release`) — it doesn't rewrite history, so teammates aren't affected. `cherry-pick` is how release engineering works — a bug fix lands on `main` first, then gets cherry-picked to supported release branches.

## I — Interview Q&A

**Q: When would you use `git revert` instead of `git reset`?**
A: Use `git revert` on any branch that has been pushed and shared — it creates a new undo commit without rewriting history. Use `git reset` only on local commits that haven't been pushed, or on personal branches where you're OK with force-pushing.

**Q: What does `git revert -m 1` do when reverting a merge commit?**
A: Merge commits have two parents. `-m 1` tells Git to treat parent 1 (the branch you were on when you merged) as the "mainline" — the state to revert TO. Without `-m`, Git doesn't know which side of the merge to keep.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git revert` on a merge commit without `-m` | Always specify `-m 1` (or `-m 2`) when reverting a merge commit |
| Cherry-picking a merge commit instead of a regular commit | Cherry-pick works best with regular commits — merges need `-m` flag too |
| Cherry-picking a range in wrong order | Ranges are `start..end` (exclusive start) — use `git log --oneline` to verify before picking |

## K — Coding Challenge

**A bug was introduced 3 commits ago on `main` (commit `bad1234`). Safely undo it without removing it from history:**

**Solution:**

```bash
# Option A: revert the specific commit
git revert bad1234 --no-edit
git push
# Adds: "Revert 'feat: broken feature'" commit to main

# Option B: if it was the last commit
git revert HEAD --no-edit
git push

# The bad commit stays in history (auditable)
# The revert commit documents the undo action
```


***
