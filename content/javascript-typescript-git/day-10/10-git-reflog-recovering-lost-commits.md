# 10 — `git reflog` & Recovering Lost Commits

## T — TL;DR

`git reflog` is Git's safety net — it logs every time HEAD moved in your local repo, keeping "lost" commits accessible for ~30 days even after reset, rebase, or branch deletion.

## K — Key Concepts

```bash
# ── git reflog ────────────────────────────────────────────
git reflog                      # show full reflog (HEAD movements)
git reflog --all                # all refs (branches, stash, etc.)
git reflog show main            # movements of the main branch pointer
git reflog --since="3 days ago" # filter by time

# Reflog output format:
# abc1234 HEAD@{0}: commit: feat: add OAuth
# def5678 HEAD@{1}: rebase finished: returning to refs/heads/main
# ghi9012 HEAD@{2}: checkout: moving from feature to main
# jkl3456 HEAD@{3}: commit: wip: auth scaffolding
# ...

# HEAD@{N} = where HEAD was N moves ago
# HEAD@{3} = HEAD 3 moves ago

# ── Scenario 1: Undo a bad reset --hard ───────────────────
# You accidentally ran: git reset --hard HEAD~3
# The 3 commits appear "lost" — but they're in the reflog!

git reflog                      # find the SHA before the reset
# abc1234 HEAD@{4}: commit: the last good commit

git reset --hard abc1234        # restore HEAD to before the disaster
# Or: git reset --hard HEAD@{4}

# ── Scenario 2: Recover a deleted branch ─────────────────
git branch -D feature/auth      # accidentally force-deleted!
git reflog                      # find the last commit on that branch
# def5678 HEAD@{6}: checkout: moving from feature/auth to main
# ghi9012 HEAD@{7}: commit: feat: JWT refresh token  ← last commit on feature/auth

git switch -c feature/auth ghi9012   # recreate the branch from that commit

# ── Scenario 3: Recover from bad rebase ───────────────────
git rebase main                 # rebase went wrong, commits look messed up
git reflog                      # find the SHA before the rebase started
# Before rebase entry will show:
# abc1234 HEAD@{8}: checkout: moving from feature/auth to feature/auth

git reset --hard abc1234        # restore to pre-rebase state

# ── Scenario 4: Find a specific action ────────────────────
git reflog | grep "before rebase"    # grep messages in reflog
git reflog | grep "commit: feat"     # find specific commit messages

# ── Inspect a reflog entry ────────────────────────────────
git show HEAD@{5}               # show commit at reflog position 5
git diff HEAD@{5} HEAD          # diff between then and now
git checkout HEAD@{5} -- file.js  # restore a file from 5 HEAD-moves ago

# ── Understanding GC ─────────────────────────────────────
# "Unreachable" objects stay in reflog for:
#   Default expiry: 90 days for reachable, 30 days for unreachable
#   Configured by: gc.reflogExpire, gc.reflogExpireUnreachable

# Force GC (rarely needed manually):
git gc --prune=now              # ⚠️ permanently removes unreachable objects

# Stash reflog:
git reflog stash                # show all stash operations
```

## W — Why It Matters

`git reflog` has saved countless engineers from "I just lost a week of work" moments. Unlike `git log` (only shows reachable commits), `reflog` shows every local HEAD movement — meaning commits "deleted" by `reset --hard`, wiped by a bad rebase, or on a force-deleted branch are all still there. It's local-only (not pushed to remotes), making it a private time machine.

## I — Interview Q&A

**Q: What's the difference between `git log` and `git reflog`?**
A: `git log` shows commits reachable from the current HEAD — the history of your current branch. `git reflog` shows every time HEAD moved on your local machine — including to commits no longer reachable from any branch. Reflog is your undo history; log is your commit history.

**Q: How long are commits retained in the reflog?**
A: Reachable commits (on a branch or tag): 90 days by default. Unreachable commits (from deleted branches, reset commits): 30 days. After that, `git gc` prunes them. You can extend with `git config gc.reflogExpireUnreachable "90 days"`.

## C — Common Pitfalls

| Pitfall                                         | Fix                                                                                            |
| :---------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| Reflog not available after `git clone` or on CI | Reflog is local-only — it's populated as you work, not available for fresh clones              |
| `git gc --prune=now` before checking reflog     | Never prune before checking if you need to recover — GC makes losses permanent                 |
| Reflog entries looking confusing                | Look for the action label: `commit:`, `checkout:`, `rebase:`, `reset:` to find the right entry |

## K — Coding Challenge

**You ran `git reset --hard HEAD~5` thinking it was safe, then realized you need commit 3 (of those 5). Recover just that one commit:**

**Solution:**

```bash
git reflog
# Find: abc1234 HEAD@{5}: commit: the commit you need

# Option A: cherry-pick just that commit onto current HEAD
git cherry-pick abc1234
# The changes from that one commit are applied as a new commit

# Option B: restore the full state from before the reset
git reset --hard HEAD@{6}  # HEAD@{6} = state just before the reset --hard
# (then recommit only what you want, or leave as-is)

# Option C: create a recovery branch at abc1234 + cherry-pick
git switch -c recovery abc1234  # inspect it
git switch main
git cherry-pick abc1234          # apply just that commit to main
git branch -D recovery
```
