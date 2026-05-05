<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 11 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 11
Git Remotes, Conflicts \& Collaboration Workflow
remote URLs, add/remove/rename/set-url, fetch, fetch --prune, pull, push, origin vs upstream, tracking branches, pull --rebase vs pull --merge, merge conflicts, conflict markers, mergetool, aborting merge or rebase, stash commands, reset --soft/--mixed/--hard, revert, cherry-pick, tags, diff modes, shortlog, PR workflow, lightweight GitHub Flow, CODEOWNERS, rulesets and branch protection, code review practice, push --force-with-lease.

Here is **Day 11 — Git Remotes, Conflicts \& Collaboration Workflow** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 11 — Git Remotes, Conflicts \& Collaboration Workflow

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the commands. Move on.

***

# 1 — Remote URLs: `add`, `remove`, `rename`, `set-url`

## T — TL;DR

A remote is a named URL pointing to another repository — `origin` is the one you cloned from, `upstream` is the original source when you've forked; you can have as many remotes as needed.[^2][^5]

## K — Key Concepts

```bash
# ── Inspect remotes ────────────────────────────────────────
git remote                        # list remote names
git remote -v                     # list with fetch and push URLs
git remote show origin            # detailed info: branches, tracking, stale

# ── Add a remote ──────────────────────────────────────────
git remote add origin git@github.com:alice/my-repo.git  # first remote
git remote add upstream git@github.com:org/original.git  # fork's upstream
git remote add staging https://git.example.com/staging.git # deploy remote

# ── Rename a remote ───────────────────────────────────────
git remote rename origin old-origin    # rename
git remote rename upstream source      # any name you like

# ── Remove a remote ───────────────────────────────────────
git remote remove old-origin           # or: git remote rm old-origin
# Note: removes the remote + all its remote-tracking branches locally
# Does NOT affect the actual remote repository

# ── Change a remote's URL ─────────────────────────────────
git remote set-url origin git@github.com:alice/new-repo.git  # switch to SSH
git remote set-url origin https://github.com/alice/repo.git  # switch to HTTPS

# ── origin vs upstream (fork pattern) ────────────────────
# Forked workflow:
# upstream = org/project (original) — you READ from here
# origin   = alice/project (your fork) — you READ and WRITE here

# Setup after forking:
git clone git@github.com:alice/project.git    # origin auto-set to your fork
git remote add upstream git@github.com:org/project.git  # add original as upstream

# Keep fork in sync:
git fetch upstream                            # get latest from original
git switch main
git merge upstream/main                       # merge into your main
git push origin main                          # push synced main to your fork

# ── Push and fetch URLs can differ ───────────────────────
git remote set-url --push origin git@github.com:alice/repo.git   # push via SSH
git remote set-url origin https://github.com/alice/repo.git       # fetch via HTTPS
# Useful for token-based HTTPS fetch + SSH push setups
```


## W — Why It Matters

The `origin`/`upstream` pattern is foundational for open-source contribution — you always push to your own fork (`origin`) and submit PRs to the original (`upstream`). Misconfiguring this causes pushes to fail or accidentally submit changes to the wrong repo.[^6][^2]

## I — Interview Q\&A

**Q: What's the difference between `origin` and `upstream`?**
A: They're just names — any remote can have any name. By convention, `origin` is the remote you cloned from (typically your fork or your team repo), and `upstream` is the original source project when you've forked. You push to `origin` and pull updates from `upstream`.[^6]

**Q: What happens when you `git remote remove origin`?**
A: Git removes the remote entry from `.git/config` and deletes all remote-tracking branches for that remote (e.g., `origin/main`, `origin/feature`). The actual remote repository is completely unaffected — you've only changed your local configuration.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Pushing to `upstream` instead of `origin` | Always verify with `git remote -v` before pushing to a fork |
| HTTPS remote prompting for credentials every time | Switch to SSH: `git remote set-url origin git@github.com:user/repo.git` |
| Stale remote-tracking branches after remote rename | Run `git fetch` after renaming to repopulate tracking refs |

## K — Coding Challenge

**Set up a forked repository workflow with correct remotes:**

```bash
# You forked: org/awesome-project → alice/awesome-project
# Clone your fork, add upstream, verify both remotes
```

**Solution:**

```bash
git clone git@github.com:alice/awesome-project.git
cd awesome-project
git remote add upstream git@github.com:org/awesome-project.git
git remote -v
# origin    git@github.com:alice/awesome-project.git (fetch)
# origin    git@github.com:alice/awesome-project.git (push)
# upstream  git@github.com:org/awesome-project.git (fetch)
# upstream  git@github.com:org/awesome-project.git (push)
```


***

# 2 — `git fetch`, `fetch --prune`, `git pull` \& Tracking Branches

## T — TL;DR

`fetch` downloads remote changes without touching your working directory; `pull` is `fetch` + merge (or rebase); tracking branches are the local-to-remote links that make `git pull` know where to pull from.[^1][^2]

## K — Key Concepts

```bash
# ── git fetch ─────────────────────────────────────────────
git fetch origin              # download all new data from origin
git fetch origin main         # fetch only the main branch
git fetch --all               # fetch from ALL configured remotes
git fetch origin --tags       # also fetch tags

# What fetch does:
# - Updates remote-tracking branches: origin/main, origin/feature, etc.
# - Does NOT touch your working directory
# - Does NOT update your local main — only origin/main
# Safe to run anytime — read-only from your perspective

# ── Remote-tracking branches ──────────────────────────────
git branch -r                 # list remote-tracking branches
# origin/main
# origin/feature/auth
# origin/HEAD -> origin/main

# These are read-only snapshots of what's on the remote
# They update when you fetch/pull/push

# ── Pruning stale remote-tracking branches ────────────────
# When someone deletes feature/auth on the remote:
git fetch --prune             # remove local remote-tracking refs deleted on remote
git fetch -p                  # shorthand
git remote prune origin       # prune without fetching new data

# Also configure auto-prune:
git config --global fetch.prune true   # always prune on fetch

# ── Tracking branches ─────────────────────────────────────
# A local branch "tracks" a remote branch — enables pull/push without specifying remote
git branch -vv                # show tracking info for each local branch
# main       abc1234 [origin/main] Last commit message
# feature/x  def5678 [origin/feature/x: ahead 2, behind 1]

# "ahead 2" = 2 local commits not pushed yet
# "behind 1" = 1 remote commit not fetched/merged yet

# Set tracking manually:
git branch --set-upstream-to=origin/main main  # link main to origin/main
git branch -u origin/feature/auth feature/auth  # shorthand

# Create local branch from remote with tracking:
git checkout --track origin/feature/auth       # creates + tracks
git switch -c feature/auth origin/feature/auth # same with switch
git switch feature/auth                         # shortcut if remote name matches

# ── git pull ──────────────────────────────────────────────
git pull                      # fetch + merge tracking branch
git pull origin main          # explicit: fetch origin/main, merge into current
git pull --rebase             # fetch + rebase instead of merge
git pull --ff-only            # only allow fast-forward (error if diverged)
git pull --no-commit          # merge but don't auto-commit

# ── pull --rebase vs pull --merge ─────────────────────────
# pull --merge (default): creates a merge commit if branches diverged
#   A → B → C (remote)
#          ↘ D (yours)
#   Result: A → B → C → M (merge commit)
#                 ↗
#               D

# pull --rebase: replays your commits on top of remote's latest
#   Result: A → B → C → D' (clean linear history)

# Set default pull strategy:
git config --global pull.rebase true    # always rebase on pull
git config --global pull.ff only        # only allow fast-forward
```


## W — Why It Matters

`git fetch --prune` is a hygiene must — without it, your list of remote branches grows indefinitely with deleted branches nobody uses anymore. `pull --rebase` is the preferred strategy for most teams because it avoids cluttering history with "Merge branch 'main'" commits when integrating remote updates.[^7][^1]

## I — Interview Q\&A

**Q: What's the difference between `git fetch` and `git pull`?**
A: `git fetch` downloads remote data and updates remote-tracking branches (`origin/main`) but leaves your working directory and local branches untouched. `git pull` is `git fetch` + `git merge` (or `--rebase`) — it both downloads and integrates changes into your current branch. Fetch is always safe; pull changes your working state.

**Q: What does "ahead 2, behind 1" mean in `git branch -vv`?**
A: Your local branch has 2 commits that aren't on the remote yet (ahead), and the remote has 1 commit you haven't fetched/merged yet (behind). This means you've diverged — you'll need to pull and potentially resolve conflicts before pushing.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git pull` creating noisy merge commits | Use `git pull --rebase` or configure `pull.rebase true` globally |
| Remote-tracking branches not pruned = confusing `git branch -r` | `git fetch --prune` or configure `fetch.prune true` |
| Pulling without a tracking branch set | Specify explicitly: `git pull origin main` or set upstream with `-u` |

## K — Coding Challenge

**Your `git branch -vv` shows `main [origin/main: behind 3]`. Get the 3 commits without a merge commit:**

**Solution:**

```bash
git fetch origin          # update origin/main (optional if already up-to-date)
git pull --rebase         # rebase your work on top of origin/main
# or:
git fetch origin
git rebase origin/main    # explicit equivalent
```


***

# 3 — `git push` \& `push --force-with-lease`

## T — TL;DR

`git push` uploads your commits to the remote; `--force-with-lease` is the safe force-push — it fails if someone else pushed since your last fetch, preventing accidental overwrites.

## K — Key Concepts

```bash
# ── git push ──────────────────────────────────────────────
git push                          # push current branch to its tracking remote
git push origin main              # explicit: push main to origin
git push -u origin feature/auth   # push + set tracking upstream (-u = --set-upstream)
git push origin --all             # push all local branches to origin
git push origin --tags            # push all tags
git push origin v1.0.0            # push specific tag
git push origin :feature/old      # delete remote branch (colon prefix = delete)
git push origin --delete feature/old  # same, more readable

# ── When push is rejected ─────────────────────────────────
# "rejected: non-fast-forward"
# Remote has commits you don't have locally — you must integrate first
git pull --rebase                 # get remote changes, then push
git push                          # now works

# ── Force push — use with extreme caution ─────────────────
git push --force                  # DANGEROUS: overwrites remote regardless
git push -f                       # same

# ── --force-with-lease — the safe force push ──────────────
git push --force-with-lease       # fails if remote has new commits since your last fetch
git push --force-with-lease=main  # lease only on the main ref

# Scenario:
# 1. You fetch → origin/main is at commit A
# 2. You rebase → your main is rewritten (A → B')
# 3. Teammate pushes commit C to remote main (remote is now A → C)
# 4. git push --force-with-lease → FAILS: "stale info"
#    (origin/main is A, but remote is now A → C)
# 5. git push --force → SUCCEEDS (and wipes C — BAD)

# When to use force push:
# ✅ After `git commit --amend` on your own branch
# ✅ After `git rebase -i` on your own branch (pre-PR)
# ✅ To update a PR branch after rebase
# ❌ NEVER on main/master/shared branches

# ── Push specific commit to a branch ──────────────────────
git push origin abc1234:main      # push a specific commit to main
git push origin HEAD:refs/for/main  # Gerrit review system format

# ── Push options (GitHub specific) ────────────────────────
git push origin feature/auth -o skip-ci       # skip CI for this push (some platforms)
git push --atomic origin main feature/auth    # push multiple refs atomically
```


## W — Why It Matters

`--force-with-lease` vs `--force` is a critical distinction in team environments. After rebasing a PR branch, you must force push — but `--force` could silently overwrite a teammate's fix that was added to your PR. `--force-with-lease` catches this case and fails safely. Configure an alias: `git config --global alias.pushf "push --force-with-lease"`.

## I — Interview Q\&A

**Q: Why does `git push` sometimes fail with "rejected: non-fast-forward"?**
A: The remote has commits your local branch doesn't have — pushing would overwrite them, which Git refuses by default. You must integrate the remote changes first (via `pull --rebase` or `fetch` + `rebase`), then push. This is Git protecting you from losing others' work.[^7]

**Q: What makes `--force-with-lease` safer than `--force`?**
A: `--force-with-lease` checks that your local remote-tracking ref (`origin/branch`) matches what's actually on the remote. If someone pushed new commits since your last fetch, your local `origin/branch` is stale — and the push fails. `--force` skips this check entirely and overwrites unconditionally.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git push --force` on a shared branch | Always `--force-with-lease` for force pushes; never force on main |
| `git push` after rebase not working without `-f` | After rebase, history is rewritten — `git push --force-with-lease` required |
| Forgetting `-u` on first push — no tracking set | Always `-u` on first push of a new branch: `git push -u origin branch-name` |

## K — Coding Challenge

**After interactive rebase on `feature/auth`, push the updated branch safely:**

**Solution:**

```bash
git rebase -i HEAD~4                  # squash WIP commits
# (conflict: feature/auth diverged from origin/feature/auth)
git push --force-with-lease           # safe: fails if teammate pushed
# If it fails:
git fetch origin feature/auth         # get their changes
git rebase origin/feature/auth        # incorporate their commits
git push --force-with-lease           # now safe to push
```


***

# 4 — Merge Conflicts: Markers, `mergetool` \& Aborting

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

## I — Interview Q\&A

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

## I — Interview Q\&A

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

# 6 — `git reset`: `--soft`, `--mixed`, `--hard`

## T — TL;DR

`git reset` moves HEAD (and optionally the branch pointer) to a different commit — `--soft` keeps everything staged, `--mixed` unstages changes, `--hard` discards all changes completely.[^8]

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

## I — Interview Q\&A

**Q: What's the difference between `git reset --soft`, `--mixed`, and `--hard`?**
A: All three move HEAD and the branch pointer to the target commit. They differ in what happens to the changes: `--soft` keeps them staged, `--mixed` keeps them in the working directory (unstaged), `--hard` discards them entirely. Think of it as "how far back do you want to wind the clock?"[^8]

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

# 7 — `git revert` \& `git cherry-pick`

## T — TL;DR

`git revert` safely undoes a commit by creating a new "undo" commit — safe for shared branches; `git cherry-pick` copies a specific commit from any branch onto your current branch.[^9][^8]

## K — Key Concepts

```bash
# ── git revert — safe undo for shared branches ────────────
git revert HEAD               # undo last commit with a new commit
git revert HEAD~2             # undo the commit 2 back
git revert abc1234            # undo a specific commit by SHA
git revert abc1234 --no-edit  # skip opening editor for message
git revert HEAD~3..HEAD       # revert a range (3 commits)

# What revert does:
# Before: A → B → C (HEAD)
# git revert C:
# After:  A → B → C → C' (C' undoes C's changes)
# C is still in history — revert just adds an opposite commit

# vs. reset:
# reset: removes commit from history (rewrites history)
# revert: adds a new commit that reverses the changes (safe, auditable)

# Revert a merge commit (must specify -m):
git revert -m 1 abc1234   # -m 1 = keep "parent 1" side (the branch you were on)
git revert -m 2 abc1234   # -m 2 = keep "parent 2" side (the branch you merged in)

# ── git cherry-pick — copy specific commits ───────────────
git cherry-pick abc1234           # copy commit abc1234 onto current branch
git cherry-pick abc1234 def5678   # copy multiple commits
git cherry-pick abc1234..mno7890  # copy a range (exclusive start)
git cherry-pick --no-commit abc1234  # apply changes but don't commit yet
git cherry-pick -x abc1234        # add "(cherry picked from commit abc1234)" to message

# Cherry-pick workflow: hotfix to multiple branches
# Bug fixed on main as commit abc1234
# Need it on both v2.0 and v1.9 branches:
git switch release/v2.0
git cherry-pick abc1234           # apply bug fix to v2.0

git switch release/v1.9
git cherry-pick abc1234           # apply same fix to v1.9

# Cherry-pick conflict:
git cherry-pick abc1234            # conflict!
# resolve conflicts...
git add resolved-file.js
git cherry-pick --continue         # finish cherry-pick
git cherry-pick --abort            # cancel entirely

# Cherry-pick creates NEW commits with different SHAs
# (same changes, new parent = new SHA)

# ── revert vs reset vs cherry-pick ────────────────────────
# git revert:      safe undo — adds new commit, keeps history
# git reset:       unsafe undo — removes commits, rewrites history
# git cherry-pick: copy — apply changes from elsewhere as new commit
```


## W — Why It Matters

`git revert` is the only correct way to undo commits on shared branches (`main`, `release`) — it doesn't rewrite history, so teammates aren't affected. `cherry-pick` is how release engineering works — a bug fix lands on `main` first, then gets cherry-picked to supported release branches.[^9]

## I — Interview Q\&A

**Q: When would you use `git revert` instead of `git reset`?**
A: Use `git revert` on any branch that has been pushed and shared — it creates a new undo commit without rewriting history. Use `git reset` only on local commits that haven't been pushed, or on personal branches where you're OK with force-pushing.

**Q: What does `git revert -m 1` do when reverting a merge commit?**
A: Merge commits have two parents. `-m 1` tells Git to treat parent 1 (the branch you were on when you merged) as the "mainline" — the state to revert TO. Without `-m`, Git doesn't know which side of the merge to keep.[^9]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git revert` on a merge commit without `-m` | Always specify `-m 1` (or `-m 2`) when reverting a merge commit |
| Cherry-picking a merge commit instead of a regular commit | Cherry-pick works best with regular commits — merges need `-m` flag too |
| Cherry-picking a range in wrong order | Ranges are `start..end` (exclusive start) — use `git log --oneline` to verify before picking |

## K — Coding Challenge

**A bug was introduced 3 commits ago on `main` (commit `bad1234`). Safely undo it without removing it from history:**

**Solution:**

```bash
# Option A: revert the specific commit
git revert bad1234 --no-edit
git push
# Adds: "Revert 'feat: broken feature'" commit to main

# Option B: if it was the last commit
git revert HEAD --no-edit
git push

# The bad commit stays in history (auditable)
# The revert commit documents the undo action
```


***

# 8 — `git tag`, `git diff` Modes \& `git shortlog`

## T — TL;DR

Tags mark release points in history permanently; `git diff` compares any two states (working dir, staging, commits, branches); `git shortlog` summarizes commit counts per contributor.

## K — Key Concepts

```bash
# ── git tag ───────────────────────────────────────────────
# Lightweight tag — just a pointer
git tag v1.0.0                        # tag current commit
git tag v0.9.0 abc1234                # tag specific commit

# Annotated tag — full object with message + tagger (preferred for releases)
git tag -a v1.0.0 -m "Release 1.0.0 — stable JWT authentication"
git tag -a v1.0.0 abc1234 -m "tag specific commit"
git tag -s v1.0.0 -m "Release"        # GPG-signed tag

# List tags
git tag                               # list all
git tag -l "v1.*"                     # filter pattern
git tag -n                            # list with messages

# Show tag detail
git show v1.0.0                       # tag object + commit diff

# Delete tags
git tag -d v1.0.0-rc                  # delete locally
git push origin --delete v1.0.0-rc   # delete from remote

# Push tags (not pushed with normal push)
git push origin v1.0.0               # push specific tag
git push origin --tags               # push all local tags

# Checkout a tag (detached HEAD)
git checkout v1.0.0                  # inspect release state

# ── git diff modes ────────────────────────────────────────
git diff                             # unstaged changes (working dir vs index)
git diff --staged                    # staged changes (index vs last commit)
git diff HEAD                        # all uncommitted changes
git diff HEAD~1                      # changes since last commit
git diff abc1234                     # changes since specific commit
git diff main feature/auth           # diff between two branches
git diff main..feature/auth          # same
git diff main...feature/auth         # changes on feature since branching from main

# Diff options
git diff --stat                      # summary: files changed, insertions, deletions
git diff --name-only                 # just file names
git diff --name-status               # file names + status (M/A/D/R)
git diff -w                          # ignore whitespace
git diff --word-diff                 # inline word-level diff (great for prose)

# Diff specific file across branches
git diff main feature/auth -- src/api.js

# ── git shortlog ──────────────────────────────────────────
git shortlog                         # commits grouped by author
git shortlog -s                      # count only (no commit subjects)
git shortlog -sn                     # sorted by count, most first
git shortlog -sn --all               # all branches

# Example output:
#    42  Alice Smith
#    31  Bob Johnson
#    12  Charlie Brown

git shortlog -sn --since="1 month ago"  # recent activity
git shortlog -sn --author="Alice"        # specific person

# ── Useful combos ─────────────────────────────────────────
git log v1.0.0..v1.1.0 --oneline         # commits between two tags (changelog)
git log --oneline --follow -- filename   # full history of a file including renames
git diff v1.0.0 v1.1.0 --stat           # what changed between releases
```


## W — Why It Matters

`git diff --staged` before committing is the professional habit that prevents accidentally committing debug logs, API keys, and half-finished work. Running it every time before `git commit` takes 5 seconds and prevents countless "oops" commits. Tags are how CI/CD pipelines trigger deployments — `v*` patterns in GitHub Actions start release workflows.

## I — Interview Q\&A

**Q: What's the difference between `git diff main..feature` and `git diff main...feature`?**
A: Two dots (`..`) shows all differences between the tips of both branches — changes on both sides. Three dots (`...`) shows only the changes on `feature` since it diverged from `main` — what the feature branch added, without showing main's independent changes. Three dots is usually what you want when reviewing a PR.

**Q: Why are annotated tags preferred over lightweight tags for releases?**
A: Annotated tags are full Git objects with their own SHA, tagger identity, timestamp, and message — they can be GPG-signed for release verification. Lightweight tags are just name-to-SHA pointers with no metadata. `git describe` and many CI systems prefer annotated tags.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Tags not pushed to remote — CI release workflow doesn't trigger | Always `git push origin --tags` after creating release tags |
| `git diff` showing nothing when changes exist | Check if changes are staged: `git diff --staged`; `git diff` only shows unstaged |
| Checking out a tag and wondering why you can't commit | Checkout on a tag = detached HEAD — `git switch -c hotfix/v1.0.1` to work from it |

## K — Coding Challenge

**Create an annotated release tag, push it, then show what changed between v1.0.0 and v1.1.0:**

**Solution:**

```bash
git tag -a v1.1.0 -m "Release v1.1.0 — adds payment integration"
git push origin v1.1.0

# Show what changed between releases:
git log v1.0.0..v1.1.0 --oneline --no-merges   # commit list
git diff v1.0.0 v1.1.0 --stat                   # files changed
git diff v1.0.0 v1.1.0 -- src/payment.js        # specific file changes
```


***

# 9 — PR Workflow \& GitHub Flow

## T — TL;DR

GitHub Flow is a lightweight branch-based workflow: `main` is always deployable; every feature lives in a short-lived branch; PRs gate merges through review and CI; merge to `main` and deploy immediately.

## K — Key Concepts

```
── GitHub Flow (6 steps) ─────────────────────────────────

1. Create a branch from main
   git switch -c feature/user-onboarding

2. Make commits (small, atomic, conventional messages)
   git commit -m "feat(onboarding): add welcome email step"
   git commit -m "test(onboarding): add welcome email tests"

3. Open a Pull Request (when ready for review or feedback)
   - Title: matches conventional commit format
   - Description: what, why, screenshots, testing steps
   - Linked issue: "Closes #123"
   - Draft PR: work-in-progress, not ready for review

4. Discuss and review
   - Reviewers leave comments, request changes, or approve
   - Author pushes additional commits to the PR branch
   - CI runs: tests, lint, type-check, security scan

5. Merge (after approval + CI passes)
   - Squash merge: one clean commit on main (most common)
   - Merge commit: preserves branch history
   - Rebase merge: linear, no merge commit

6. Deploy
   - main is always deployable — merge triggers deploy pipeline

── Branch naming conventions ─────────────────────────────
feature/short-description       # new features
fix/bug-description             # bug fixes
hotfix/critical-bug             # urgent production fixes
chore/dependency-update         # maintenance
docs/update-readme              # documentation
refactor/extract-auth-helper    # refactoring
release/v2.1.0                  # release preparation

── PR description template ───────────────────────────────
## What
Brief description of changes.

## Why
Context: link to issue, user story, or problem statement.
Closes #123

## How
Technical approach / notable implementation decisions.

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing steps

## Screenshots (if UI change)
```

```bash
# ── Full GitHub Flow command sequence ─────────────────────
git switch main && git pull --rebase         # always start from latest main
git switch -c feature/user-onboarding        # create feature branch

# ... code ...
git add -p                                    # stage selectively
git commit -m "feat(onboarding): welcome email"

git push -u origin feature/user-onboarding   # push + open PR on GitHub

# After PR approval + CI green:
# → GitHub UI: Squash and merge
# → main now has one clean commit

git switch main && git pull                   # sync local main
git branch -d feature/user-onboarding        # clean up local branch
git push origin --delete feature/user-onboarding  # clean up remote (GitHub does this automatically if "delete branch after merge" is enabled)
```


## W — Why It Matters

GitHub Flow's core principle — `main` is always deployable — forces teams to practice continuous integration. Small, short-lived branches reduce merge conflict frequency. PRs create a documented record of every decision, making `git blame` actually useful when you ask "why was this code written this way?"[^4]

## I — Interview Q\&A

**Q: What's the difference between GitHub Flow and Gitflow?**
A: GitHub Flow has one long-lived branch (`main`) and short-lived feature branches — simple, fast, ideal for continuous deployment. Gitflow uses multiple long-lived branches (`main`, `develop`, `release`, `hotfix`) — more structured, better for versioned releases with scheduled deploy windows. Most modern SaaS teams use GitHub Flow.

**Q: What is a Draft PR and when do you use it?**
A: A Draft PR signals "this is open for discussion but not ready for final review/merge." Use it to: get early feedback on approach, run CI on WIP code, share progress with teammates, or mark work-in-progress before going on holiday.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Long-lived feature branches diverging far from main | Merge or rebase from main frequently — at least daily on active branches |
| PR that does too many unrelated things | One PR per logical change — easier to review, easier to revert if needed |
| Merging without CI passing | Configure branch protection to require status checks before merge |

## K — Coding Challenge

**Write the complete command sequence for a GitHub Flow feature from start to merge:**

**Solution:**

```bash
# 1. Start from fresh main
git switch main && git pull --rebase

# 2. Create feature branch
git switch -c feature/password-reset

# 3. Implement + commit
git add -p && git commit -m "feat(auth): add password reset flow"
git add -p && git commit -m "test(auth): add password reset tests"

# 4. Keep branch current while working
git fetch origin && git rebase origin/main

# 5. Push + create PR
git push -u origin feature/password-reset
# → Open PR on GitHub

# 6. After approval + CI green: Squash merge on GitHub

# 7. Cleanup
git switch main && git pull
git branch -d feature/password-reset
```


***

# 10 — CODEOWNERS, Branch Protection \& Rulesets

## T — TL;DR

`CODEOWNERS` assigns automatic reviewers based on file paths; branch protection rules prevent direct pushes to `main` and require PRs, reviews, and CI; rulesets (GitHub's newer system) apply these at org scale.[^3][^10][^4]

## K — Key Concepts

```
── CODEOWNERS file ────────────────────────────────────────
# Placed at: .github/CODEOWNERS, CODEOWNERS, or docs/CODEOWNERS
# Syntax: <pattern> <owner1> <owner2>

# All files owned by @alice and @bob
*                    @alice @bob

# Infrastructure owned by the infra team
infra/               @org/infra-team

# Frontend owned by frontend team
src/                 @org/frontend-team
*.css                @alice @carlos

# API owned by backend team
src/api/             @org/backend-team

# GitHub Actions owned by DevOps
.github/             @org/devops-team
.github/workflows/   @org/devops-team

# Security-sensitive files need security team review
src/auth/            @org/security-team
**/secrets/          @org/security-team

# Override: specific file takes priority over directory pattern
src/api/public.js    @alice   # only alice reviews this file

# Result: when a PR touches a CODEOWNERS file/dir,
# the assigned owner is automatically added as required reviewer
```

```
── Branch Protection Rules (GitHub Classic) ──────────────
Settings → Branches → Add rule → Branch name pattern: main

Common settings:
☑ Require a pull request before merging
  ☑ Required approvals: 2
  ☑ Dismiss stale pull request approvals when new commits pushed
  ☑ Require review from Code Owners

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Status checks: ci/test, ci/lint, ci/type-check

☑ Require conversation resolution before merging
☑ Require signed commits
☑ Require linear history (no merge commits)
☑ Do not allow bypassing the above settings
☑ Restrict who can push to matching branches → @org/leads

── GitHub Rulesets (modern, replaces branch protection) ──
- Apply to multiple repos at org level
- More granular bypass permissions
- Supports "require review from specific teams"
- Enforce: no force-push, no deletion, required workflows

Key advantages over classic branch protection:
- Org-wide enforcement across hundreds of repos
- Named rules (auditable, version-controlled)
- Bypass lists with actor-level granularity
- Available for tags too (not just branches)
```


## W — Why It Matters

CODEOWNERS is how organizations ensure security-sensitive changes (auth, infra, payments) always get reviewed by the right team — even when someone forgets to add a reviewer manually. Branch protection with required CI prevents the classic "it worked on my machine" merge that breaks production.[^10][^3]

## I — Interview Q\&A

**Q: What happens if a CODEOWNERS file has conflicting rules?**
A: The last matching rule wins. CODEOWNERS patterns are evaluated bottom-to-top (like `.gitignore`) — more specific rules at the bottom override general ones at the top. Organizing with general rules first and specific overrides last is best practice.[^3]

**Q: What's the difference between branch protection rules and GitHub Rulesets?**
A: Branch protection rules are per-repo and configured manually. Rulesets can be applied at the organization level (enforcing across all repos simultaneously), support bypassing with named actors, apply to both branches and tags, and allow requiring review from specific teams — not just code owners.[^10]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| CODEOWNERS using usernames vs team names | Team syntax: `@org/team-name`; user syntax: `@username` — use teams for scale |
| Branch protection not applying to admins | Enable "Do not allow bypassing" — otherwise admins can skip all protections |
| Stale approvals after new commits not being dismissed | Enable "Dismiss stale PR approvals when new commits are pushed" |

## K — Coding Challenge

**Write a CODEOWNERS file for a full-stack repo:**

```
# Require: backend team reviews API, frontend team reviews UI,
# security team reviews auth, devops reviews CI workflows
# Alice owns overall project (all files)
```

**Solution:**

```
# .github/CODEOWNERS

# Default owner for everything
*                        @alice

# Infrastructure and CI
.github/                 @org/devops-team
infra/                   @org/devops-team

# Authentication — security sensitive
src/auth/                @org/security-team @org/backend-team
src/middleware/jwt*      @org/security-team

# Backend API
src/api/                 @org/backend-team
src/services/            @org/backend-team

# Frontend
src/components/          @org/frontend-team
src/pages/               @org/frontend-team
*.css                    @org/frontend-team

# Shared/public API contracts reviewed by both teams
src/api/contracts/       @org/backend-team @org/frontend-team
```


***

# 11 — Code Review Practice

## T — TL;DR

Good code review is about correctness + maintainability + knowledge sharing — not style (that's Prettier's job); leave specific, actionable, constructive comments with severity labels so authors know what's blocking vs. what's optional.

## K — Key Concepts

```
── As a reviewer ──────────────────────────────────────────

WHAT to review (in order of importance):
1. Correctness — does it do what it claims? Edge cases? Error handling?
2. Security — injection, auth bypass, sensitive data exposure, secrets
3. Performance — N+1 queries, unnecessary re-renders, missing indexes
4. Design — does the approach fit the architecture? Too complex?
5. Readability — is the intent clear? Are names meaningful?
6. Tests — do they cover the important cases? Are they deterministic?
7. NOT: formatting, indentation, semicolons → let Prettier handle this

COMMENT severity labels (prefix your comment):
[blocking]  Must fix before merge — correctness or security issue
[important] Should fix — significant design concern
[nit]       Minor style preference — author can decide
[question]  Curiosity/learning — not a required change
[praise]    Explicit positive feedback — acknowledge good decisions

Good review comment structure:
❌ "This is wrong"
✅ "[blocking] This function doesn't handle the case where `user` is null
   on line 42. When `fetchUser` returns null (404 case), calling
   `.email` throws. Consider: `if (!user) return res.status(404)...`"

── Review checklist ───────────────────────────────────────
□ Does the PR description explain the why?
□ Is there a linked issue/ticket?
□ Are there tests for the new behavior?
□ Does it handle errors and edge cases?
□ Are there any hardcoded values that should be config?
□ Are secrets/credentials accidentally included?
□ Does the naming clearly communicate intent?
□ Is the change too large to review effectively? (ask to split)

── As a PR author ─────────────────────────────────────────
□ Keep PRs small — under 400 lines of diff is the sweet spot
□ Add context in the description — reviewers can't read your mind
□ Leave self-review comments to guide reviewers: "I'm unsure about this approach — open to suggestions"
□ Respond to every comment — even "done" or "agreed, fixed in abc1234"
□ Don't take review comments personally — the code is reviewed, not you
□ Don't resolve threads you didn't open — let the reviewer confirm
□ Separate refactoring from feature PRs — keeps changes focused
```


## W — Why It Matters

PR size is the single most predictive factor of review quality — research shows that reviewers find fewer defects per line in large PRs (>400 lines) because attention fatigue sets in. Small, focused PRs get faster, higher-quality reviews. The `[nit]` label convention prevents minor preferences from blocking important merges.[^3]

## I — Interview Q\&A

**Q: How do you handle a code review where you disagree with the reviewer's feedback?**
A: First, assume positive intent — ask for clarification if you don't understand the concern. Explain your reasoning with specifics ("I chose X because Y, and Z was a concern"). If still in disagreement, suggest a follow-up ticket rather than blocking the PR. Unresolvable design disagreements should be escalated to the team, not argued in PR comments.

**Q: What makes a good commit in a PR when responding to review feedback?**
A: Use `fixup!` or `squash!` prefixes: `git commit -m "fixup! feat(auth): add JWT validation"` — then before merge, `git rebase -i --autosquash` folds them in. Alternatively, separate "fix review feedback" commits make the review diff clear, then squash before merge.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Reviewing style/formatting in code review | Configure Prettier + ESLint in CI — auto-enforce, never manually review |
| PRs >1000 lines — nobody reviews them properly | Break into multiple PRs; use feature flags to merge incomplete features safely |
| Author resolving reviewer's threads before reviewer confirms | Only authors resolve their own threads; let reviewers resolve their own |

## K — Coding Challenge

**Label each review comment correctly:**

```
1. "You're using `==` instead of `===` in the auth check"
2. "I prefer camelCase over snake_case for this variable"
3. "This doesn't validate the JWT expiry — expired tokens will succeed"
4. "Why did you choose this approach over using the existing `parseUser` helper?"
5. "Great use of early returns here — very readable!"
```

**Solution:**

```
1. [blocking] == instead of === in auth — type coercion could bypass check
2. [nit] camelCase preference — author decides
3. [blocking] JWT expiry not validated — security issue, must fix
4. [question] Curious about approach vs existing helper — not required change
5. [praise] Explicit positive feedback — acknowledge good decisions
```


***

> ✅ **Day 11 complete.**
> Your tiny next action: open any repo you're actively working in and run `git log --oneline --graph --all --decorate`. Find the last merge or rebase, identify the tracking branch state with `git branch -vv`, and check if there are stale remote-tracking branches with `git remote show origin`. That 60-second inspection teaches you more about your repo's real state than a week of theory.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches

[^2]: https://git-scm.com/book/ms/v2/Git-Basics-Working-with-Remotes

[^3]: https://github.com/orgs/community/discussions/14866

[^4]: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

[^5]: https://git-scm.com/docs/git-remote

[^6]: https://stackoverflow.com/questions/4693588/what-is-a-tracking-branch

[^7]: https://gist.github.com/71e36acbc3fd506f467e3287cc161135

[^8]: https://www.linkedin.com/pulse/mastering-git-stash-rebase-squash-cherry-pick-reset-revert-r-pkfec

[^9]: https://stackoverflow.com/questions/30986376/how-to-undo-a-successful-git-cherry-pick

[^10]: https://www.youtube.com/watch?v=BBj5CrJBhaI

[^11]: https://stackoverflow.com/questions/9537392/git-fetch-a-remote-branch

[^12]: https://www.reddit.com/r/learnprogramming/comments/z2gsbh/using_git_remotely_what_does_it_mean_to_set_to/

[^13]: https://stackoverflow.com/questions/41352043/is-there-any-difference-between-applying-stashed-changes-and-cherry-picking-cha

[^14]: https://dev.to/ruqaiya_beguwala/git-branch-a-git-remote-show-origin-inspecting-remote-branches-10o2

[^15]: https://dev.to/elayaraj31/day-5-git-rebase-git-stash-git-cherry-pick-2l06

