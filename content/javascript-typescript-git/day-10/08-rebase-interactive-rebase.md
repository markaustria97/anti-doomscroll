# 8 — Rebase & Interactive Rebase

## T — TL;DR

Rebase replays your commits on top of another base — creating a linear history; interactive rebase (`-i`) is your history editor — reorder, squash, edit, drop, or reword any commits.

## K — Key Concepts

```bash
# ── git rebase ────────────────────────────────────────────
# Before rebase:
#   main:    A → B → C
#   feature: A → B → D → E

git switch feature
git rebase main
# After rebase:
#   main:    A → B → C
#   feature: A → B → C → D' → E'   (D, E replayed on top of C, new SHAs)

# D' and E' are NEW commits — same changes, new hashes, new parent

# Keep feature up-to-date:
git switch feature
git rebase main          # replay feature commits on latest main

# Rebase onto a specific commit:
git rebase main --onto new-base  # advanced: reattach to a different base

# Conflict during rebase:
git rebase main          # conflict in D'
# Fix conflict in files...
git add resolved-file.js
git rebase --continue    # replay the next commit
git rebase --abort       # abort entirely, return to pre-rebase state
git rebase --skip        # skip current conflicting commit

# ── Interactive rebase ─────────────────────────────────────
git rebase -i HEAD~3     # edit last 3 commits
git rebase -i HEAD~10    # edit last 10 commits
git rebase -i <commit>   # edit commits after <commit>

# Opens editor with list of commits (oldest first):
# pick abc1234 feat: add login form
# pick def5678 fix: typo in login
# pick ghi9012 wip: debugging login
# pick jkl3456 refactor: extract form helper
# pick mno7890 test: add login tests

# Commands (replace 'pick' with):
# p, pick   = keep commit as-is
# r, reword = keep commit, but edit the message
# e, edit   = pause here to amend (add files, split commit)
# s, squash = meld into PREVIOUS commit (keeps both messages)
# f, fixup  = meld into PREVIOUS commit (discard this message)
# d, drop   = remove commit entirely
# b, break  = pause for manual intervention

# Example: squash WIP and fix into the feature commit:
# pick abc1234 feat: add login form
# squash def5678 fix: typo in login      ← squash into abc1234
# drop ghi9012 wip: debugging login      ← remove entirely
# pick jkl3456 refactor: extract form helper
# squash mno7890 test: add login tests   ← squash into jkl3456

# Result: 2 clean commits instead of 5

# ── Rebase vs Merge summary ────────────────────────────────
# Rebase:
#   ✅ Linear history — no merge commits
#   ✅ Clean git log
#   ❌ Rewrites history — never rebase shared/public branches
#   ❌ Conflict resolution per commit (not per file)

# Merge:
#   ✅ Preserves true history
#   ✅ Safe for shared branches
#   ❌ Merge commits add noise to log
#   ❌ Non-linear history

# Golden rule: NEVER rebase commits that exist on a remote shared branch
# Rebase is for local cleanup before opening a PR
git push --force-with-lease   # safer force push — fails if remote has new commits
git push --force              # dangerous — overwrites without checking
```


## W — Why It Matters

Interactive rebase is the most powerful Git skill for maintaining a clean PR history. Squashing WIP commits before review, rewording misleading commit messages, and dropping "debug log" commits are daily operations for senior engineers. The golden rule — never rebase shared branches — is the most important Git rule to internalize.

## I — Interview Q&A

**Q: What does `git rebase` actually do to commits?**
A: It detaches each commit from the current base and replays them — one by one — on top of the new base. Each replayed commit gets a new SHA (new parent = new hash). The changes are the same, but the commits are new objects. This is "rewriting history."

**Q: What is `--force-with-lease` and why is it safer than `--force`?**
A: `--force-with-lease` checks that the remote branch hasn't been updated since your last fetch. If someone else pushed to the branch, it fails — preventing you from overwriting their work. `--force` blindly overwrites regardless of remote state.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Rebasing a branch that teammates are working on | Coordinate first or use merge; rebase rewrites SHAs breaking teammates' history |
| Squash order in interactive rebase — squashing into the WRONG commit | Commits are listed oldest-first; `squash` folds into the commit ABOVE it |
| `git push` failing after rebase with "rejected updates" | Use `--force-with-lease` — the remote has your old commits; you must force update |

## K — Coding Challenge

**Clean up these 5 WIP commits into 2 meaningful commits before opening a PR:**

```
abc1 wip: start auth
def2 wip: more auth
ghi3 debug: add console.logs
jkl4 fix: remove console.logs
mno5 test: auth tests
```

**Solution:**

```bash
git rebase -i HEAD~5
# Editor opens:
# pick abc1 wip: start auth
# squash def2 wip: more auth     ← fold into abc1
# drop ghi3 debug: add console.logs  ← remove entirely
# drop jkl4 fix: remove console.logs ← remove entirely
# pick mno5 test: auth tests

# Save → edit combined message for abc1+def2 → "feat: implement JWT authentication"
# Result: 2 clean commits: "feat: implement JWT authentication" + "test: auth tests"
```


***
