# 9 — `HEAD` References & Detached `HEAD`

## T — TL;DR

`HEAD` is a pointer to your current location — normally pointing to a branch; "detached HEAD" occurs when HEAD points directly to a commit instead of a branch — any commits you make are orphaned unless you create a branch.[^3][^10]

## K — Key Concepts

```bash
# ── HEAD mechanics ────────────────────────────────────────
cat .git/HEAD          # shows: "ref: refs/heads/main" (attached)
cat .git/HEAD          # shows: "a1b2c3d4..." (detached)

# HEAD relative references:
HEAD                   # current commit
HEAD~1 or HEAD^        # one commit back (parent)
HEAD~3                 # three commits back
HEAD^2                 # second parent (of a merge commit)
HEAD@{2}               # HEAD two moves ago (reflog position)

# Commit reference shortcuts:
abc123~2               # 2 commits before abc123
main~5                 # 5 commits behind main
v1.0^{}                # commit that tag v1.0 points to (dereference)

# ── Detached HEAD ─────────────────────────────────────────
# Causes:
git checkout abc1234        # check out a commit directly
git checkout v1.0           # check out a tag (tags aren't branches)
git checkout origin/main    # check out remote tracking branch

# What happens: HEAD points directly to a commit, not a branch
# You CAN make commits — but they're "floating" with no branch name

# Git warns you:
# "You are in 'detached HEAD' state.
# If you want to create a new branch to retain commits you create,
# you may do so by using: git switch -c <new-branch-name>"

# ── Recovering from detached HEAD ─────────────────────────
# Option 1: You made commits and want to keep them
git switch -c rescue-branch         # create branch from current commit
# Now your commits are named and won't be GC'd

# Option 2: Just exploring — discard and return
git switch main                     # return to main, detached commits abandoned
# Git will warn: "lost" commits are still in reflog for ~30 days

# Option 3: Just viewing old code (no commits needed)
git checkout v1.2.3                 # detached — safe for read-only exploration
# Then: git switch -         # return to previous branch

# ── Useful HEAD-based operations ──────────────────────────
git diff HEAD                       # all uncommitted changes
git diff HEAD~1                     # changes in last commit
git reset HEAD~1                    # undo last commit, keep changes staged
git reset --soft HEAD~1             # same as above
git reset --mixed HEAD~1            # undo commit, unstage changes (default)
git reset --hard HEAD~1             # undo commit + discard changes ⚠️ destructive
git checkout HEAD~3 -- file.js      # restore file to version 3 commits ago
```


## W — Why It Matters

Detached HEAD is one of the most confusing Git states for beginners — knowing it's just "HEAD not pointing to a branch" demystifies it. The recovery path (`git switch -c branch-name`) is a 5-second fix. HEAD-relative references (`HEAD~3`, `HEAD^`) are used constantly in `reset`, `rebase`, `diff`, and `log` commands.[^10][^3]

## I — Interview Q&A

**Q: What is detached HEAD state and how do you safely exit it?**
A: Detached HEAD means HEAD points to a commit SHA directly, not to a branch name. Any commits you make are "floating" — not attached to a branch — and Git will eventually garbage-collect them. To save work: `git switch -c new-branch`. To discard and return: `git switch main`.[^3]

**Q: What's the difference between `HEAD~1` and `HEAD^1`?**
A: For non-merge commits, they're identical — one commit back. For merge commits (which have two parents), `HEAD^1` is the first parent (the branch you were on) and `HEAD^2` is the second parent (the branch that was merged in). `HEAD~2` always means "two generations back via first parents."

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Making commits in detached HEAD and switching away | Always `git switch -c branch-name` before switching away |
| `git reset --hard HEAD~1` discarding committed work | `--hard` is destructive — use `--soft` or `--mixed` to keep changes |
| Confusing `^` and `~` for merge commits | `~N` goes back N first-parents; `^N` selects Nth parent of a merge commit |

## K — Coding Challenge

**You accidentally committed to detached HEAD after checking out `v2.0` to inspect it. Recover your commit:**

```bash
# You're in detached HEAD at v2.0, made 1 commit
# git log shows: abc1234 "my important fix"
```

**Solution:**

```bash
# From detached HEAD state:
git switch -c hotfix/my-important-fix   # create branch from current position
# HEAD is now attached to hotfix/my-important-fix
# abc1234 is now safely on a named branch
git push origin hotfix/my-important-fix # optionally push it
```


***
