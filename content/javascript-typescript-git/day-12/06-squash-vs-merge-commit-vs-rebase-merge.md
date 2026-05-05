# 6 — Squash vs Merge Commit vs Rebase Merge

## T — TL;DR

These are the three merge strategies for closing a PR — squash collapses all commits into one, merge commit preserves branch topology, rebase creates linear history without a merge commit; each team picks one and stays consistent.[^7]

## K — Key Concepts

```
── Starting state ────────────────────────────────────────

main:    A → B
feature: A → B → C → D → E (3 feature commits: "WIP", "fix typo", "add tests")

── Strategy 1: Squash and Merge ─────────────────────────

main:    A → B → S   (S = single squashed commit: all C+D+E changes)

git switch main
git merge --squash feature/login
git commit -m "feat(auth): add login flow (#42)"

Result:
✅ Clean linear main history
✅ One commit per feature — easy to revert entire feature
✅ No WIP/typo commits polluting main
❌ Individual commit history lost on main
❌ Feature branch not "fully merged" — `git branch -d` needs `-D`
❌ Author attribution collapsed to one person

Best for: PRs with messy WIP commits, teams wanting clean main

── Strategy 2: Merge Commit (no-ff) ─────────────────────

main:    A → B → M   (M = merge commit with two parents)
              ↗   ↗
             C → D → E

git switch main
git merge --no-ff feature/login -m "Merge feat(auth): login flow (#42)"

Result:
✅ Full history preserved — every commit visible
✅ Branch topology visible in git log --graph
✅ Easy to see what was part of which feature
❌ Merge commits add noise to `git log --oneline`
❌ Non-linear history harder to bisect

Best for: open-source projects, auditable enterprise codebases

── Strategy 3: Rebase Merge ─────────────────────────────

main:    A → B → C' → D' → E'   (rebased commits, new SHAs)

git switch feature/login
git rebase main
git switch main
git merge --ff-only feature/login   # fast-forward only

Result:
✅ Linear history — `git log` reads like a story
✅ Full per-commit history preserved (unlike squash)
✅ Easy to bisect (linear)
❌ Rewrites commit SHAs — author dates may change
❌ Requires force-push after rebase
❌ Can create conflicts per commit (not per file)

Best for: teams that value linear history + full commit detail
(e.g., Linux kernel, many OSS projects)

── Choosing a strategy ───────────────────────────────────

| Team type                     | Recommended strategy   |
|-------------------------------|------------------------|
| Fast-moving SaaS product      | Squash merge           |
| Open-source library           | Merge commit or Rebase |
| Strict linear history culture | Rebase merge           |
| Auditable enterprise          | Merge commit (no-ff)   |
| Mixed (depends on PR)         | Pick one and enforce   |

The most important rule: PICK ONE and enforce it via
GitHub branch protection → "allowed merge types"
```


## W — Why It Matters

Inconsistency between merge strategies is worse than any single bad choice — a `git log --graph` that mixes squash commits with merge commits with rebased commits is unreadable. GitHub's branch protection lets you enforce exactly one strategy, removing the decision from individual PR authors.[^7]

## I — Interview Q&A

**Q: If you squash-merge a PR, can you use `git bisect` to find which "commit" introduced a bug?**
A: Only to the squash commit level — you can find which PR introduced it, but not which individual commit within the PR. For fine-grained bisect across all commits, you need rebase merge (linear history with all commits). Squash is fast for history browsing but loses bisect granularity.

**Q: Why does squash merge require `git branch -D` instead of `git branch -d`?**
A: Git's safe `-d` checks if the branch's commits are reachable from the current branch. After a squash merge, the original commits (C, D, E) are NOT in main's history — only the squashed commit S is. So Git considers the branch "not merged" and requires `-D` to force delete.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mixing merge strategies across PRs — unreadable history | Enforce one strategy in GitHub Settings → Branches → merge methods |
| Rebase merge leaving old remote branch with old SHAs | Always force push after rebase and update PR branch before merge |
| Squash commit message defaulting to list of all PR commits | Write a meaningful squash message summarizing the PR intent |

## K — Coding Challenge

**Demonstrate all three strategies on the same branch:**

```bash
# feature/demo has commits: "WIP: step1", "WIP: step2", "final: done"
```

**Solution:**

```bash
# Strategy 1: Squash
git switch main
git merge --squash feature/demo
git commit -m "feat(demo): complete demo feature"

# Strategy 2: Merge commit
git switch main
git merge --no-ff feature/demo -m "Merge feat(demo): demo feature (#1)"

# Strategy 3: Rebase + fast-forward
git switch feature/demo && git rebase main
git switch main && git merge --ff-only feature/demo

# Enforce team default (GitHub Settings alternative):
# Settings → Branches → main → Allow squash merging only ← one source of truth
```


***
