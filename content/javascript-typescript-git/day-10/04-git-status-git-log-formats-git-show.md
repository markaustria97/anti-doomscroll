# 4 — `git status`, `git log` Formats & `git show`

## T — TL;DR

`git status` describes the three-area state of your repo; `git log` has powerful filtering and formatting flags; `git show` inspects any object — commit, tag, blob, or tree.

## K — Key Concepts

```bash
# ── git status ────────────────────────────────────────────
git status                  # verbose (default)
git status -s               # short format — 2-column: staging + working
git status -sb              # short + branch info

# Short status column key:
# XY filename
# X = staging area status, Y = working directory status
# M = modified, A = added, D = deleted, R = renamed, ? = untracked
# Example output:
#  M src/app.js    → modified in working dir, not staged
# M  src/util.js   → modified in staging area (added)
# MM src/index.js  → modified in both staging AND working dir
# ?? newfile.js    → untracked file

# ── git log formats ───────────────────────────────────────
git log                         # full default format
git log --oneline               # compact: hash + message
git log --oneline --graph       # ASCII branch graph
git log --oneline --graph --all --decorate  # show all branches + tags

# Custom format with --pretty=format:
git log --pretty=format:"%h %an %ar %s"
# %h = short hash, %H = full hash
# %an = author name, %ae = author email
# %ar = relative date ("3 days ago"), %ai = ISO date
# %s = subject (first line of message)
# %b = body (rest of message)
# %d = decorations (branch/tag names)

# Filtering log
git log --author="Alice"            # by author name
git log --since="2 weeks ago"       # time-based
git log --since="2025-01-01" --until="2025-12-31"
git log --grep="JIRA-123"           # message contains string
git log --all                       # include all branches
git log -n 10                       # last 10 commits
git log -- path/to/file.js          # commits touching a specific file
git log -p -- file.js               # + show the diffs too (file history)
git log --follow -- renamed-file.js # follow file through renames
git log --merges                    # only merge commits
git log --no-merges                 # exclude merge commits

# Commit ranges
git log main..feature               # commits in feature not in main
git log main...feature              # symmetric difference (both sides)

# ── git show ──────────────────────────────────────────────
git show HEAD                       # full diff of last commit
git show HEAD --stat                # just changed files summary
git show abc123                     # specific commit
git show HEAD:src/app.js            # file content AT that commit
git show v1.0.0                     # annotated tag content + commit
git show HEAD^{tree}                # root tree object
```


## W — Why It Matters

A one-line graph alias (`git log --oneline --graph --all --decorate`) is the single most useful Git visualization tool — senior devs run it constantly to understand branch topology. Filtering `git log -p -- file.js` is how you audit exactly when and why a file changed, which is invaluable during debugging.

## I — Interview Q&A

**Q: What does `git log main..feature` show?**
A: All commits reachable from `feature` that are NOT reachable from `main` — i.e., commits that exist on `feature` but haven't been merged into `main` yet. It's how you preview what a branch would contribute when merged.

**Q: How do you find which commit introduced a specific line of code?**
A: Use `git log -p -- filename` to see every change to a file. For finding a specific string, add `-S "function name"` (pickaxe search) — it shows commits where that string was added or removed.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git log` not showing all branches | Add `--all` to include refs from all branches |
| `git show HEAD:file.js` for a deleted file | Specify the commit before deletion: `git show <commit>:file.js` |
| Custom `--pretty=format` missing newlines | End with `%n` for newline, or use `--pretty=tformat:` (adds newline automatically) |

## K — Coding Challenge

**Write the git log command to find all commits by "Bob" in the last 30 days that modified `src/api.js`, showing only hash and message:**

**Solution:**

```bash
git log \
  --author="Bob" \
  --since="30 days ago" \
  --pretty=format:"%h %s" \
  -- src/api.js
```


***
