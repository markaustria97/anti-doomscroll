# 1 — Remote URLs: `add`, `remove`, `rename`, `set-url`

## T — TL;DR

A remote is a named URL pointing to another repository — `origin` is the one you cloned from, `upstream` is the original source when you've forked; you can have as many remotes as needed.[^2][^5]

## K — Key Concepts

```bash
# ── Inspect remotes ────────────────────────────────────────
git remote                        # list remote names
git remote -v                     # list with fetch and push URLs
git remote show origin            # detailed info: branches, tracking, stale

# ── Add a remote ──────────────────────────────────────────
git remote add origin git@github.com:alice/my-repo.git  # first remote
git remote add upstream git@github.com:org/original.git  # fork's upstream
git remote add staging https://git.example.com/staging.git # deploy remote

# ── Rename a remote ───────────────────────────────────────
git remote rename origin old-origin    # rename
git remote rename upstream source      # any name you like

# ── Remove a remote ───────────────────────────────────────
git remote remove old-origin           # or: git remote rm old-origin
# Note: removes the remote + all its remote-tracking branches locally
# Does NOT affect the actual remote repository

# ── Change a remote's URL ─────────────────────────────────
git remote set-url origin git@github.com:alice/new-repo.git  # switch to SSH
git remote set-url origin https://github.com/alice/repo.git  # switch to HTTPS

# ── origin vs upstream (fork pattern) ────────────────────
# Forked workflow:
# upstream = org/project (original) — you READ from here
# origin   = alice/project (your fork) — you READ and WRITE here

# Setup after forking:
git clone git@github.com:alice/project.git    # origin auto-set to your fork
git remote add upstream git@github.com:org/project.git  # add original as upstream

# Keep fork in sync:
git fetch upstream                            # get latest from original
git switch main
git merge upstream/main                       # merge into your main
git push origin main                          # push synced main to your fork

# ── Push and fetch URLs can differ ───────────────────────
git remote set-url --push origin git@github.com:alice/repo.git   # push via SSH
git remote set-url origin https://github.com/alice/repo.git       # fetch via HTTPS
# Useful for token-based HTTPS fetch + SSH push setups
```


## W — Why It Matters

The `origin`/`upstream` pattern is foundational for open-source contribution — you always push to your own fork (`origin`) and submit PRs to the original (`upstream`). Misconfiguring this causes pushes to fail or accidentally submit changes to the wrong repo.[^6][^2]

## I — Interview Q&A

**Q: What's the difference between `origin` and `upstream`?**
A: They're just names — any remote can have any name. By convention, `origin` is the remote you cloned from (typically your fork or your team repo), and `upstream` is the original source project when you've forked. You push to `origin` and pull updates from `upstream`.[^6]

**Q: What happens when you `git remote remove origin`?**
A: Git removes the remote entry from `.git/config` and deletes all remote-tracking branches for that remote (e.g., `origin/main`, `origin/feature`). The actual remote repository is completely unaffected — you've only changed your local configuration.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Pushing to `upstream` instead of `origin` | Always verify with `git remote -v` before pushing to a fork |
| HTTPS remote prompting for credentials every time | Switch to SSH: `git remote set-url origin git@github.com:user/repo.git` |
| Stale remote-tracking branches after remote rename | Run `git fetch` after renaming to repopulate tracking refs |

## K — Coding Challenge

**Set up a forked repository workflow with correct remotes:**

```bash
# You forked: org/awesome-project → alice/awesome-project
# Clone your fork, add upstream, verify both remotes
```

**Solution:**

```bash
git clone git@github.com:alice/awesome-project.git
cd awesome-project
git remote add upstream git@github.com:org/awesome-project.git
git remote -v
# origin    git@github.com:alice/awesome-project.git (fetch)
# origin    git@github.com:alice/awesome-project.git (push)
# upstream  git@github.com:org/awesome-project.git (fetch)
# upstream  git@github.com:org/awesome-project.git (push)
```


***
