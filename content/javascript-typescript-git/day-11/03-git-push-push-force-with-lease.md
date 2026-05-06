# 3 — `git push` & `push --force-with-lease`

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

## I — Interview Q&A

**Q: Why does `git push` sometimes fail with "rejected: non-fast-forward"?**
A: The remote has commits your local branch doesn't have — pushing would overwrite them, which Git refuses by default. You must integrate the remote changes first (via `pull --rebase` or `fetch` + `rebase`), then push. This is Git protecting you from losing others' work.

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
