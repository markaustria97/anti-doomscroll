# 5 — Staging Area: `git add`, `git add -p`, `git rm`, `git mv`, `git clean`

## T — TL;DR

The staging area is a precision tool — `git add -p` lets you stage individual hunks (not whole files), giving you granular control over what goes into each commit.

## K — Key Concepts

```bash
# ── git add ───────────────────────────────────────────────
git add file.js             # stage one file
git add src/                # stage all in a directory
git add .                   # stage everything in current directory
git add -A                  # stage all changes (add + delete + modify)
git add -u                  # stage only tracked files (skip untracked)
git add *.js                # glob pattern

# ── git add -p (patch mode) — most powerful ───────────────
git add -p                  # interactively choose HUNKS to stage
git add -p file.js          # patch mode for one file

# Patch mode prompts:
# y = stage this hunk
# n = skip this hunk
# s = split hunk into smaller pieces
# e = manually edit hunk
# q = quit
# ? = help

# Example: you changed 3 things in one file:
# 1. Bug fix (should go in commit A)
# 2. Refactor (should go in commit B)
# 3. New feature (should go in commit C)
# git add -p lets you stage only the bug fix, commit, then stage the rest separately

# ── git diff (check before staging) ──────────────────────
git diff                    # unstaged changes (working dir vs staging)
git diff --staged           # staged changes (staging vs last commit)
git diff HEAD               # all uncommitted changes

# ── Unstaging ─────────────────────────────────────────────
git restore --staged file.js         # unstage (modern, Git 2.23+)
git reset HEAD file.js               # unstage (classic)
git restore file.js                  # discard working dir changes

# ── git rm ────────────────────────────────────────────────
git rm file.js               # delete file + stage the deletion
git rm --cached file.js      # remove from staging/tracking only (keep on disk)
                             # use: accidentally committed node_modules, secrets
git rm -r --cached .         # remove all tracked files from index (re-apply .gitignore)

# ── git mv ────────────────────────────────────────────────
git mv old.js new.js         # rename + stage the rename
# Equivalent to:
# mv old.js new.js && git rm old.js && git add new.js

# ── git clean ─────────────────────────────────────────────
git clean -n                 # DRY RUN — show what WOULD be deleted (always run this first)
git clean -f                 # delete untracked files
git clean -fd                # delete untracked files AND directories
git clean -fX                # delete only .gitignore'd files
git clean -fdx               # delete everything untracked (incl. ignored files)
# ⚠️ git clean is destructive — files are NOT recoverable (not in Git, not in Trash)
```


## W — Why It Matters

`git add -p` is the difference between "I commit whenever I remember to" and "every commit is a single logical change." Atomic commits (one concern per commit) make `git bisect`, `git revert`, and `git blame` infinitely more useful. Senior engineers never `git add .` before reviewing what they're staging.

## I — Interview Q&A

**Q: What does `git rm --cached file.js` do?**
A: It removes the file from Git's index (stops tracking it) without deleting it from disk. Typical use: you accidentally committed a file that should be in `.gitignore` (e.g., `.env`, `node_modules`). After `--cached`, add the file to `.gitignore` and commit.

**Q: Why should you always run `git clean -n` before `git clean -f`?**
A: `git clean -f` permanently deletes untracked files — they don't go to the Trash and can't be recovered from Git (Git never tracked them). The dry-run `-n` flag shows exactly what would be deleted, preventing accidental data loss.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git add .` staging unintended files | Always `git status` first; use `-p` for granular control |
| `git clean -f` deleting important untracked files | Always `git clean -n` first |
| `git rm file.js` when you only want to untrack | Use `git rm --cached file.js` to keep the file on disk |

## K — Coding Challenge

**You made 3 changes to `api.js`: a bug fix, a `console.log` debug line, and a refactor. Create two separate commits — one for the bug fix, one for the refactor — leaving the debug line unstaged.**

**Solution:**

```bash
git add -p api.js   # stage only the bug fix hunk → y
                    # skip the console.log hunk → n
                    # skip the refactor hunk → n
git commit -m "fix: null check in fetchUser"

git add -p api.js   # skip the console.log hunk → n
                    # stage the refactor hunk → y
git commit -m "refactor: extract formatResponse helper"

# console.log remains unstaged — visible in git diff
```


***
