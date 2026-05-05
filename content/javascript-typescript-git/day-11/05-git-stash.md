# 5 — `git stash`

## T — TL;DR

`git stash` saves your uncommitted changes to a stack so you can switch context (branch, pull, hotfix) and come back later — it's a temporary clipboard for work-in-progress.

## K — Key Concepts

```bash
# ── Basic stash ───────────────────────────────────────────
git stash                          # stash tracked modified + staged files
git stash push -m "WIP: auth refactor"  # stash with a description (preferred)
git stash push -u                  # also stash untracked files
git stash push -a                  # stash ALL including .gitignore'd files
git stash push -- src/auth.js      # stash only specific files

# ── Listing stashes ───────────────────────────────────────
git stash list
# stash@{0}: WIP on main: abc1234 Last commit message
# stash@{1}: On feature/auth: def5678 Added JWT middleware
# stash@{2}: WIP: auth refactor   ← descriptive message

# ── Restoring stashes ─────────────────────────────────────
git stash pop                      # apply latest stash + remove it from stack
git stash pop stash@{2}            # apply specific stash + remove it
git stash apply                    # apply latest stash, KEEP it in stack
git stash apply stash@{1}          # apply specific stash, keep in stack

# ── Inspecting stashes ────────────────────────────────────
git stash show                     # summary of latest stash
git stash show -p                  # full diff of latest stash
git stash show stash@{1} -p        # diff of specific stash

# ── Managing stashes ──────────────────────────────────────
git stash drop                     # delete latest stash
git stash drop stash@{2}           # delete specific stash
git stash clear                    # delete ALL stashes ⚠️ irreversible

# ── Create a branch from a stash ──────────────────────────
git stash branch feature/saved stash@{0}
# Creates + switches to feature/saved, applies stash, drops it
# Useful when stash has conflicts with current branch

# ── Common workflow: context switch ───────────────────────
# Working on feature/auth, urgent hotfix needed on main:
git stash push -m "WIP: auth form validation"  # save current work
git switch main
git switch -c hotfix/critical-bug
# ... fix the bug ...
git commit -m "fix: null pointer in payment handler"
git switch main
git merge hotfix/critical-bug
git push

git switch feature/auth
git stash pop                      # restore your WIP
# Continue working

# ── Stash is NOT a substitute for commits ─────────────────
# Stash is local-only — not pushed to remote
# Stash can be lost (git stash clear, accidental drop)
# For long-term WIP: commit (even with "WIP:" prefix) and push
```


## W — Why It Matters

`git stash` saves you in the most common interruption scenario — you're mid-feature when a critical bug needs your attention. Without stash, you'd commit half-baked code or lose changes when switching branches. Always use descriptive names (`-m`) — `stash@{0}` with no message is impossible to identify 3 context switches later.

## I — Interview Q&A

**Q: What's the difference between `git stash pop` and `git stash apply`?**
A: Both restore the stash's changes to your working directory. `pop` also removes the stash entry from the stack. `apply` leaves it there — useful when you want to apply the same changes to multiple branches, or when you're not sure if the application will succeed.

**Q: Can stash cause conflicts?**
A: Yes — if your working directory has diverged from when you stashed, `git stash pop` can conflict like any merge. Git will mark conflicts in the files. If conflicts occur with `pop`, the stash is NOT dropped — resolve conflicts, then `git stash drop` manually when done.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git stash` not stashing untracked files | Use `git stash -u` to include untracked files |
| Multiple stashes with no descriptions | Always `git stash push -m "descriptive message"` |
| Losing stash after `git stash clear` | For important WIP, commit instead — even with "WIP:" prefix |

## K — Coding Challenge

**You're mid-feature on `feature/search`. An urgent bug needs fixing on `main`. Save your work (including a new untracked file `helpers.js`), fix the bug, return to your feature:**

**Solution:**

```bash
git stash push -u -m "WIP: search autocomplete with helpers.js"
git switch main
git switch -c hotfix/payment-bug
# Fix + commit...
git switch main && git merge hotfix/payment-bug && git push
git switch feature/search
git stash pop        # restore search work including helpers.js
```


***
