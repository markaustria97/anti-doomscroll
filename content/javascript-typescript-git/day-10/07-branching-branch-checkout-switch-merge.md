# 7 — Branching: `branch`, `checkout`, `switch`, `merge`

## T — TL;DR

A branch is a lightweight named pointer to a commit — creating one is instant; `switch` (modern) replaces `checkout` for branch operations; `merge` integrates branches, defaulting to fast-forward when possible.

## K — Key Concepts

```bash
# ── Branch operations ─────────────────────────────────────
git branch                   # list local branches
git branch -a                # list all (local + remote tracking)
git branch -v                # list with last commit
git branch feature/login     # create branch (stay on current)
git branch -d feature/login  # delete (safe — blocked if unmerged)
git branch -D feature/login  # force delete (unmerged changes lost)
git branch -m old-name new-name  # rename branch

# ── switch (modern, Git 2.23+) — preferred ────────────────
git switch feature/login     # switch to existing branch
git switch -c feature/login  # create + switch (replaces checkout -b)
git switch -               # switch to previous branch

# ── checkout (classic) ────────────────────────────────────
git checkout feature/login   # switch branch
git checkout -b feature/login  # create + switch
git checkout -- file.js      # discard working dir changes (dangerous with --)
# Note: checkout is overloaded — switch + restore replace its two main uses

# ── Fast-forward merge ────────────────────────────────────
# When main has no new commits since feature branched off:
#   main: A → B
#   feature: A → B → C → D
#
# git merge feature:  main simply moves forward to D
#   main: A → B → C → D  (no merge commit created)

git switch main
git merge feature/login       # fast-forward (if possible)
git merge --ff-only feature   # error if FF not possible (strict mode)
git merge --no-ff feature     # always create merge commit even if FF possible
git merge --no-ff -m "Merge feature/login" feature  # with custom merge message

# ── Three-way merge ───────────────────────────────────────
# When main has advanced since feature branched:
#   main:    A → B → E
#   feature: A → B → C → D
#
# Git finds common ancestor B, merges E + D → new merge commit M
#   main:    A → B → E → M
#                ↘ C → D ↗

# Merge conflict resolution:
git merge feature/login      # conflict!
# Edit conflicted files:
# <<<<<<< HEAD
# existing code
# =======
# incoming code
# >>>>>>> feature/login

git add resolved-file.js     # mark resolved
git merge --continue         # or: git commit
git merge --abort            # undo the merge attempt entirely

# ── Squash merge ──────────────────────────────────────────
# Collapses all feature branch commits into a single staged diff
# Doesn't create a merge commit yet — you commit manually
git merge --squash feature/login
git commit -m "feat: user login feature"
# Result: main gets ONE clean commit summarizing all feature work
# Downside: feature branch history is lost in main; branch isn't "merged"
```


## W — Why It Matters

`--no-ff` (no fast-forward) creates merge commits that preserve branch topology — you can see in `git log --graph` that a feature existed as a branch. Without it, fast-forward merges make it impossible to tell what was a branch vs. linear commits. Different teams have strong opinions: `--no-ff` (GitHub flow style) vs. rebase + ff (linear history style).[^4]

## I — Interview Q&A

**Q: What's the difference between fast-forward and three-way merge?**
A: Fast-forward happens when the target branch has no diverged commits — Git just moves the pointer forward, no merge commit needed. Three-way merge happens when both branches have diverged — Git uses the common ancestor plus both tips to create a new merge commit with two parents.[^4]

**Q: When would you use `--squash` vs `--no-ff` vs regular merge?**
A: `--squash` gives you one clean commit in main — great for feature branches with many WIP commits but loses individual commit history. `--no-ff` preserves the branch in graph history. Regular merge fast-forwards when possible — clean linear history but no branch topology visible.[^8][^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git checkout feature` creating a local branch tracking remote | Check `git branch -v` to verify — use `git switch feature` which is clearer |
| Deleting a branch before its PR is merged | Use `-d` (safe) not `-D`; GitHub/GitLab warn you too |
| Merge commit message defaulting to "Merge branch 'x'" | Always `--no-ff -m "descriptive message"` for meaningful history |

## K — Coding Challenge

**Create and merge a feature branch with a squash merge, then clean up:**

```bash
# Start on main, create feature/auth, make 3 commits, squash-merge to main, delete branch
```

**Solution:**

```bash
git switch -c feature/auth
git commit -m "wip: auth scaffolding"
git commit -m "wip: JWT middleware"
git commit -m "wip: tests"

git switch main
git merge --squash feature/auth      # collapses all 3 into staged changes
git commit -m "feat: JWT authentication with middleware"  # one clean commit

git branch -d feature/auth           # safe delete (squash = "not fully merged")
git branch -D feature/auth           # force delete needed for squash-merged branches
```


***
