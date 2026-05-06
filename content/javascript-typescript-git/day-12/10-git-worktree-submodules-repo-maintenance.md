# 10 — `git worktree`, Submodules & Repo Maintenance

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

## I — Interview Q&A

**Q: What is the difference between a git submodule and a git subtree?**
A: A submodule keeps the embedded repo as a separate Git repository — it has its own `.git`, tracks a specific commit, and requires explicit `submodule update`. A subtree merges the embedded repo's history into the parent repo — no separate `.git`, no `submodule update` needed, simpler for consumers but harder to push changes back upstream.

**Q: When would you use `git worktree` instead of `git stash`?**
A: When the context switch is long-lived or complex — e.g., you need to run a test suite in the hotfix while continuing feature development, or you need to compare two branches side-by-side without switching. `stash` is for quick 5-minute context switches; `worktree` is for simultaneous parallel work.

## C — Common Pitfalls

| Pitfall                                                           | Fix                                                                             |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| Forgetting `--recurse-submodules` on clone — empty submodule dirs | `git submodule init && git submodule update` to recover, or reclone with flag   |
| `git gc --prune=now` before verifying no needed objects in reflog | Check `git reflog` first; `--prune=now` makes unreachable objects unrecoverable |
| Two worktrees checked out to the same branch — Git blocks it      | Worktrees enforce one checkout per branch; use different branches per worktree  |

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
