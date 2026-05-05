# 4 — Merge Conflicts: Markers, `mergetool` & Aborting

## T — TL;DR

A merge conflict occurs when two branches modify the same lines — Git inserts conflict markers into the file; you resolve by editing, staging, and continuing; or abort entirely to restore the pre-merge state.

## K — Key Concepts

```bash
# ── When conflicts happen ─────────────────────────────────
git merge feature/auth        # conflict!
# Auto-merging src/auth.js
# CONFLICT (content): Merge conflict in src/auth.js
# Automatic merge failed; fix conflicts and then commit.

# ── Conflict markers in the file ──────────────────────────
# src/auth.js (conflicted):

<<<<<<< HEAD
// Current branch (the branch you were ON when you ran git merge)
function login(user, password) {
  return bcrypt.compare(password, user.hash)
}
=======
// Incoming branch (the branch you're merging IN)
async function login(user, password) {
  return await argon2.verify(user.hash, password)
}
>>>>>>> feature/auth

# ── Conflict marker anatomy ────────────────────────────────
# <<<<<<< HEAD              → start of your version (current branch)
# (your code)
# ======= (7 equals)       → separator
# (incoming code)
# >>>>>>> branch-name       → end of incoming version (merged branch)

# ALSO: three-way conflict shows base (common ancestor):
# <<<<<<< HEAD
# your changes
# ||||||| original         → original base (with merge.conflictStyle=diff3)
# original code
# =======
# incoming changes
# >>>>>>> feature/auth

# Enable diff3 for more context:
git config --global merge.conflictStyle diff3

# ── Resolving manually ────────────────────────────────────
# Edit the file — delete the markers, keep what you want:
async function login(user, password) {
  return await argon2.verify(user.hash, password)  // chose incoming version
}

git add src/auth.js                   # mark as resolved
git status                            # verify no more conflicts
git merge --continue                  # create the merge commit
# or: git commit                      # same effect

# ── Aborting ──────────────────────────────────────────────
git merge --abort                     # restore to pre-merge state
git rebase --abort                    # restore to pre-rebase state

# ── Using a mergetool ─────────────────────────────────────
git mergetool                         # open configured visual merge tool
git mergetool --tool=vimdiff          # specify tool
git mergetool --tool=vscode           # VS Code as mergetool

# Configure VS Code as default mergetool:
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Other popular tools:
# - kdiff3, meld, opendiff (macOS), Beyond Compare
# After resolving in the tool:
git mergetool                         # opens conflicted files one by one
git commit                            # after all resolved

# ── Conflict in rebase ────────────────────────────────────
git rebase main                       # conflict in commit D'
# Fix conflict in file...
git add resolved-file.js
git rebase --continue                 # replay the next commit
# Repeat for each conflicting commit

# ── Prevention tips ───────────────────────────────────────
git pull --rebase                     # smaller conflicts (more granular)
git merge origin/main                 # sync often — smaller divergence = fewer conflicts
git diff main...feature/auth          # preview what will conflict before merging
```


## W — Why It Matters

Conflict resolution is the most feared but most manageable Git skill. The key insight: conflicts are just files with markers — you decide what the final code should look like, remove the markers, stage, and continue. Using `diff3` conflict style shows the original base, giving you more context for the decision.

## I — Interview Q&A

**Q: What do the three sections in a conflict marker represent?**
A: `<<<<<<< HEAD` to `=======` is your current branch's version. `=======` to `>>>>>>> branch-name` is the incoming branch's version. With `merge.conflictStyle=diff3`, a third section `||||||| original` shows the common ancestor — the state before either branch changed the line.

**Q: What's the difference between `git merge --abort` and `git reset --hard HEAD`?**
A: `git merge --abort` specifically restores the pre-merge state including MERGE_HEAD, staged files, and any in-progress merge metadata. `git reset --hard HEAD` resets working directory and staging area but doesn't clean up merge state — some merge metadata may linger. Always use `--abort` to cleanly exit a merge.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Accidentally committing conflict markers | Add a pre-commit hook: `git diff --check --cached` or use a lint stage |
| Resolving conflict in editor but forgetting to `git add` | `git status` must show no "both modified" before `git merge --continue` |
| `git mergetool` leaving `.orig` backup files | Clean up: `git clean -f *.orig` or configure `mergetool.keepBackup false` |

## K — Coding Challenge

**Resolve this conflict — choose the incoming version and keep the comment from HEAD:**

```
<<<<<<< HEAD
// validates password using bcrypt
function login(user, pass) { return bcrypt.compare(pass, user.hash) }
=======
async function login(user, pass) { return await argon2.verify(user.hash, pass) }
>>>>>>> feature/argon2
```

**Solution:**

```js
// validates password using argon2 (migrated from bcrypt)
async function login(user, pass) { return await argon2.verify(user.hash, pass) }
// Then: git add <file> && git merge --continue
```


***
