# 6 — `git reset`: `--soft`, `--mixed`, `--hard`

## T — TL;DR

`git reset` moves HEAD (and optionally the branch pointer) to a different commit — `--soft` keeps everything staged, `--mixed` unstages changes, `--hard` discards all changes completely.

## K — Key Concepts

```bash
# ── The three reset modes ─────────────────────────────────
#
#                         Working Dir  |  Staging Area  |  Commit History
# git reset --soft HEAD~1     KEPT     |     KEPT        |  HEAD moved back
# git reset --mixed HEAD~1    KEPT     |    CLEARED      |  HEAD moved back
# git reset --hard HEAD~1    CLEARED   |    CLEARED      |  HEAD moved back

# ── --soft: undo commit, keep everything staged ───────────
git reset --soft HEAD~1
# Use: you committed too early, want to add more before committing again
# Changes are still in staging area — ready to recommit
git reset --soft HEAD~1
git add forgotten-file.js
git commit -m "complete commit with forgotten file"

# ── --mixed (default): undo commit + unstage ─────────────
git reset HEAD~1           # same as --mixed
git reset --mixed HEAD~1
# Use: undo a commit to rework both the changes AND the staging
# Files are back to "modified but unstaged"
# Common for: "I committed the wrong thing, let me rethink"

# ── --hard: undo commit + discard ALL changes ─────────────
git reset --hard HEAD~1    # ⚠️ destructive — changes are gone
git reset --hard origin/main  # reset to remote state (discard local work)
# Use: completely discard commits + changes (e.g., abandon a bad experiment)
# ALWAYS check with `git diff` and `git log` before using --hard

# ── Common reset scenarios ────────────────────────────────
# Undo last commit, keep changes working (to re-stage selectively):
git reset HEAD~1           # --mixed default

# Undo last 3 commits, squash into one new commit:
git reset --soft HEAD~3    # all 3 commits' changes are staged
git commit -m "feat: combined feature work"

# Abort ALL local changes and sync with remote:
git fetch origin
git reset --hard origin/main  # nuclear option — loses ALL local changes

# Unstage a file (without moving HEAD):
git reset HEAD file.js        # unstage file.js (same as git restore --staged)
git reset                     # unstage everything

# ── Safety: reflog saves you ──────────────────────────────
# Even after --hard, commits are in reflog for ~30 days:
git reflog                    # find the commit SHA before reset
git reset --hard abc1234      # restore to before the disaster
```


## W — Why It Matters

`reset --soft HEAD~3` followed by a single clean `commit` is the fastest way to squash multiple WIP commits — faster than interactive rebase for simple cases. `reset --hard origin/main` is the nuclear "throw away everything local" command every developer needs when a branch goes truly wrong, but the reflog always provides a 30-day safety net.

## I — Interview Q&A

**Q: What's the difference between `git reset --soft`, `--mixed`, and `--hard`?**
A: All three move HEAD and the branch pointer to the target commit. They differ in what happens to the changes: `--soft` keeps them staged, `--mixed` keeps them in the working directory (unstaged), `--hard` discards them entirely. Think of it as "how far back do you want to wind the clock?"

**Q: Can you undo a `git reset --hard`?**
A: Yes — for ~30 days via `git reflog`. The "lost" commits are still in Git's object store, just not referenced by any branch. Find the SHA in `git reflog` and `git reset --hard <sha>` to restore.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git reset --hard` without checking what you're about to lose | Always `git stash` or `git diff` before any `--hard` reset |
| Using `git reset` on pushed commits affecting teammates | After resetting pushed commits, you'll need `git push --force-with-lease` — communicate with team first |
| `git reset HEAD~1` on merge commits | Resets back past the merge — use `git revert` instead to safely undo a merge |

## K — Coding Challenge

**You have 4 commits: "WIP: step 1", "WIP: step 2", "WIP: step 3", "fix: typo". Squash them into one clean commit:**

**Solution:**

```bash
git log --oneline
# abc1234 fix: typo
# def5678 WIP: step 3
# ghi9012 WIP: step 2
# jkl3456 WIP: step 1
# mno7890 previous clean commit

git reset --soft HEAD~4          # move HEAD back 4, keep all changes staged
git commit -m "feat: implement search autocomplete"
# Result: one clean commit with all changes
```


***
