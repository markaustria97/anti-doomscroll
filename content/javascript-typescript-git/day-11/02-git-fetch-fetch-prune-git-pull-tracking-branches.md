# 2 — `git fetch`, `fetch --prune`, `git pull` & Tracking Branches

## T — TL;DR

`fetch` downloads remote changes without touching your working directory; `pull` is `fetch` + merge (or rebase); tracking branches are the local-to-remote links that make `git pull` know where to pull from.

## K — Key Concepts

```bash
# ── git fetch ─────────────────────────────────────────────
git fetch origin              # download all new data from origin
git fetch origin main         # fetch only the main branch
git fetch --all               # fetch from ALL configured remotes
git fetch origin --tags       # also fetch tags

# What fetch does:
# - Updates remote-tracking branches: origin/main, origin/feature, etc.
# - Does NOT touch your working directory
# - Does NOT update your local main — only origin/main
# Safe to run anytime — read-only from your perspective

# ── Remote-tracking branches ──────────────────────────────
git branch -r                 # list remote-tracking branches
# origin/main
# origin/feature/auth
# origin/HEAD -> origin/main

# These are read-only snapshots of what's on the remote
# They update when you fetch/pull/push

# ── Pruning stale remote-tracking branches ────────────────
# When someone deletes feature/auth on the remote:
git fetch --prune             # remove local remote-tracking refs deleted on remote
git fetch -p                  # shorthand
git remote prune origin       # prune without fetching new data

# Also configure auto-prune:
git config --global fetch.prune true   # always prune on fetch

# ── Tracking branches ─────────────────────────────────────
# A local branch "tracks" a remote branch — enables pull/push without specifying remote
git branch -vv                # show tracking info for each local branch
# main       abc1234 [origin/main] Last commit message
# feature/x  def5678 [origin/feature/x: ahead 2, behind 1]

# "ahead 2" = 2 local commits not pushed yet
# "behind 1" = 1 remote commit not fetched/merged yet

# Set tracking manually:
git branch --set-upstream-to=origin/main main  # link main to origin/main
git branch -u origin/feature/auth feature/auth  # shorthand

# Create local branch from remote with tracking:
git checkout --track origin/feature/auth       # creates + tracks
git switch -c feature/auth origin/feature/auth # same with switch
git switch feature/auth                         # shortcut if remote name matches

# ── git pull ──────────────────────────────────────────────
git pull                      # fetch + merge tracking branch
git pull origin main          # explicit: fetch origin/main, merge into current
git pull --rebase             # fetch + rebase instead of merge
git pull --ff-only            # only allow fast-forward (error if diverged)
git pull --no-commit          # merge but don't auto-commit

# ── pull --rebase vs pull --merge ─────────────────────────
# pull --merge (default): creates a merge commit if branches diverged
#   A → B → C (remote)
#          ↘ D (yours)
#   Result: A → B → C → M (merge commit)
#                 ↗
#               D

# pull --rebase: replays your commits on top of remote's latest
#   Result: A → B → C → D' (clean linear history)

# Set default pull strategy:
git config --global pull.rebase true    # always rebase on pull
git config --global pull.ff only        # only allow fast-forward
```

## W — Why It Matters

`git fetch --prune` is a hygiene must — without it, your list of remote branches grows indefinitely with deleted branches nobody uses anymore. `pull --rebase` is the preferred strategy for most teams because it avoids cluttering history with "Merge branch 'main'" commits when integrating remote updates.[^7]

## I — Interview Q&A

**Q: What's the difference between `git fetch` and `git pull`?**
A: `git fetch` downloads remote data and updates remote-tracking branches (`origin/main`) but leaves your working directory and local branches untouched. `git pull` is `git fetch` + `git merge` (or `--rebase`) — it both downloads and integrates changes into your current branch. Fetch is always safe; pull changes your working state.

**Q: What does "ahead 2, behind 1" mean in `git branch -vv`?**
A: Your local branch has 2 commits that aren't on the remote yet (ahead), and the remote has 1 commit you haven't fetched/merged yet (behind). This means you've diverged — you'll need to pull and potentially resolve conflicts before pushing.

## C — Common Pitfalls

| Pitfall                                                         | Fix                                                                  |
| :-------------------------------------------------------------- | :------------------------------------------------------------------- |
| `git pull` creating noisy merge commits                         | Use `git pull --rebase` or configure `pull.rebase true` globally     |
| Remote-tracking branches not pruned = confusing `git branch -r` | `git fetch --prune` or configure `fetch.prune true`                  |
| Pulling without a tracking branch set                           | Specify explicitly: `git pull origin main` or set upstream with `-u` |

## K — Coding Challenge

**Your `git branch -vv` shows `main [origin/main: behind 3]`. Get the 3 commits without a merge commit:**

**Solution:**

```bash
git fetch origin          # update origin/main (optional if already up-to-date)
git pull --rebase         # rebase your work on top of origin/main
# or:
git fetch origin
git rebase origin/main    # explicit equivalent
```

---
