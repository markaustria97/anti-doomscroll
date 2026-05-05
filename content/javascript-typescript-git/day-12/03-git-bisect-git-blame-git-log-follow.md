# 3 — `git bisect`, `git blame` & `git log --follow`

## T — TL;DR

`git bisect` binary-searches history to find which commit introduced a bug; `git blame` shows who last changed each line and when; `git log --follow` tracks a file's history through renames.

## K — Key Concepts

```bash
# ── git bisect — find the bad commit ─────────────────────
git bisect start                    # start bisect session
git bisect bad                      # current commit is broken
git bisect good v2.0.0             # this tag was known good

# Git checks out a commit halfway through the range
# You test: does the bug exist?
git bisect good    # bug not present → go newer
git bisect bad     # bug present → go older

# After ~10 iterations (binary search through 1000 commits):
# "abc1234 is the first bad commit"
# abc1234 feat(payments): switch to new tax calculation lib

git bisect reset   # restore HEAD to original position

# ── Automated bisect with a test script ───────────────────
git bisect start
git bisect bad HEAD
git bisect good v1.9.0

# Provide a test script — returns 0=good, non-zero=bad
git bisect run npm test -- --testPathPattern="payments.test"

# Git automatically finds the culprit commit without manual testing
# Essential when the bug is hard to reproduce manually

# ── git blame — who changed this line? ────────────────────
git blame src/auth.js               # show all lines with last edit info
git blame -L 40,60 src/auth.js      # blame only lines 40-60
git blame --since="6 months ago" src/auth.js  # limit to recent changes
git blame -w src/auth.js            # ignore whitespace changes
git blame -C src/auth.js            # detect lines moved from other files

# Output format:
# abc1234 (Alice Smith 2025-03-15 14:23:01 +0000 42) const token = jwt.sign(...)
# ^       ^            ^date/time                 ^line  ^code

# Find who introduced a specific function:
git log -S "function validateToken" --oneline  # pickaxe search
git log -G "validateToken" --oneline            # regex pickaxe

# ── git log --follow — track through renames ──────────────
# Without --follow: history stops at the rename
git log -- src/utils/date.js          # only shows history after rename

# With --follow: tracks through renames
git log --follow -- src/utils/date.js  # full history even before rename
git log --follow -p -- src/utils/date.js  # + full diffs

# Find original filename
git log --follow --diff-filter=R -- src/utils/date.js  # shows rename commits

# ── grep across the git history ───────────────────────────
git grep "TODO" HEAD                  # grep in current commit
git grep "deprecated" v1.0.0          # grep in a specific tag
git grep -n "fetchUser" HEAD -- "*.ts"  # with line numbers, TS files only
git grep -l "API_KEY"                 # list files containing pattern (dangerous!)

# grep across ALL history (find when a string existed):
git log -S "getUser" --all --oneline  # commits that added/removed "getUser"
```


## W — Why It Matters

`git bisect run` is the most underused Git feature — it can find which commit introduced a bug across 1000 commits in 10 automated test runs. Without it, developers spend hours reading git log trying to guess. `git blame -C` (detect moved code) prevents false accusations — line moved from another file doesn't make that author the bug author.[^1]

## I — Interview Q&A

**Q: How many test runs does `git bisect` need to find a bug in 1000 commits?**
A: Binary search — at most log₂(1000) ≈ 10 iterations. That's the mathematical guarantee. Whether you test manually or with `git bisect run`, 10 tests finds the culprit commit in any 1000-commit history.

**Q: What's the difference between `git log -S` and `git log -G`?**
A: `-S "text"` (pickaxe) finds commits where the number of occurrences of the string changed — i.e., where the string was added or removed. `-G "regex"` finds commits where the diff text matches the regex — even if the string didn't change in count. Use `-S` for "who added this", `-G` for broader pattern matching.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git bisect reset` not run after session — stuck in bisect | Always `git bisect reset` when done; check `git status` for bisect state |
| `git blame` blaming whitespace reformats as the "author" | Use `git blame -w` to ignore whitespace, `-C` to detect copied lines |
| `git log -- file.js` missing history before a rename | Add `--follow` to track through file renames |

## K — Coding Challenge

**Find which commit broke the `validateToken` function — tests pass on `v3.0.0` but fail on `HEAD`:**

**Solution:**

```bash
# Write a test script: test.sh
#!/bin/bash
npm run build 2>/dev/null
npm test -- --testPathPattern="validateToken" --passWithNoTests
# exit 0 = good, non-0 = bad

chmod +x test.sh

git bisect start
git bisect bad HEAD
git bisect good v3.0.0
git bisect run ./test.sh
# → "abc1234 is the first bad commit"
# → "refactor(auth): migrate JWT library to jose"

git bisect reset
# → Now you know exactly what to fix or revert
```


***
