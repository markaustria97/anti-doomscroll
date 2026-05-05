# 8 — `git tag`, `git diff` Modes & `git shortlog`

## T — TL;DR

Tags mark release points in history permanently; `git diff` compares any two states (working dir, staging, commits, branches); `git shortlog` summarizes commit counts per contributor.

## K — Key Concepts

```bash
# ── git tag ───────────────────────────────────────────────
# Lightweight tag — just a pointer
git tag v1.0.0                        # tag current commit
git tag v0.9.0 abc1234                # tag specific commit

# Annotated tag — full object with message + tagger (preferred for releases)
git tag -a v1.0.0 -m "Release 1.0.0 — stable JWT authentication"
git tag -a v1.0.0 abc1234 -m "tag specific commit"
git tag -s v1.0.0 -m "Release"        # GPG-signed tag

# List tags
git tag                               # list all
git tag -l "v1.*"                     # filter pattern
git tag -n                            # list with messages

# Show tag detail
git show v1.0.0                       # tag object + commit diff

# Delete tags
git tag -d v1.0.0-rc                  # delete locally
git push origin --delete v1.0.0-rc   # delete from remote

# Push tags (not pushed with normal push)
git push origin v1.0.0               # push specific tag
git push origin --tags               # push all local tags

# Checkout a tag (detached HEAD)
git checkout v1.0.0                  # inspect release state

# ── git diff modes ────────────────────────────────────────
git diff                             # unstaged changes (working dir vs index)
git diff --staged                    # staged changes (index vs last commit)
git diff HEAD                        # all uncommitted changes
git diff HEAD~1                      # changes since last commit
git diff abc1234                     # changes since specific commit
git diff main feature/auth           # diff between two branches
git diff main..feature/auth          # same
git diff main...feature/auth         # changes on feature since branching from main

# Diff options
git diff --stat                      # summary: files changed, insertions, deletions
git diff --name-only                 # just file names
git diff --name-status               # file names + status (M/A/D/R)
git diff -w                          # ignore whitespace
git diff --word-diff                 # inline word-level diff (great for prose)

# Diff specific file across branches
git diff main feature/auth -- src/api.js

# ── git shortlog ──────────────────────────────────────────
git shortlog                         # commits grouped by author
git shortlog -s                      # count only (no commit subjects)
git shortlog -sn                     # sorted by count, most first
git shortlog -sn --all               # all branches

# Example output:
#    42  Alice Smith
#    31  Bob Johnson
#    12  Charlie Brown

git shortlog -sn --since="1 month ago"  # recent activity
git shortlog -sn --author="Alice"        # specific person

# ── Useful combos ─────────────────────────────────────────
git log v1.0.0..v1.1.0 --oneline         # commits between two tags (changelog)
git log --oneline --follow -- filename   # full history of a file including renames
git diff v1.0.0 v1.1.0 --stat           # what changed between releases
```


## W — Why It Matters

`git diff --staged` before committing is the professional habit that prevents accidentally committing debug logs, API keys, and half-finished work. Running it every time before `git commit` takes 5 seconds and prevents countless "oops" commits. Tags are how CI/CD pipelines trigger deployments — `v*` patterns in GitHub Actions start release workflows.

## I — Interview Q&A

**Q: What's the difference between `git diff main..feature` and `git diff main...feature`?**
A: Two dots (`..`) shows all differences between the tips of both branches — changes on both sides. Three dots (`...`) shows only the changes on `feature` since it diverged from `main` — what the feature branch added, without showing main's independent changes. Three dots is usually what you want when reviewing a PR.

**Q: Why are annotated tags preferred over lightweight tags for releases?**
A: Annotated tags are full Git objects with their own SHA, tagger identity, timestamp, and message — they can be GPG-signed for release verification. Lightweight tags are just name-to-SHA pointers with no metadata. `git describe` and many CI systems prefer annotated tags.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Tags not pushed to remote — CI release workflow doesn't trigger | Always `git push origin --tags` after creating release tags |
| `git diff` showing nothing when changes exist | Check if changes are staged: `git diff --staged`; `git diff` only shows unstaged |
| Checking out a tag and wondering why you can't commit | Checkout on a tag = detached HEAD — `git switch -c hotfix/v1.0.1` to work from it |

## K — Coding Challenge

**Create an annotated release tag, push it, then show what changed between v1.0.0 and v1.1.0:**

**Solution:**

```bash
git tag -a v1.1.0 -m "Release v1.1.0 — adds payment integration"
git push origin v1.1.0

# Show what changed between releases:
git log v1.0.0..v1.1.0 --oneline --no-merges   # commit list
git diff v1.0.0 v1.1.0 --stat                   # files changed
git diff v1.0.0 v1.1.0 -- src/payment.js        # specific file changes
```


***
