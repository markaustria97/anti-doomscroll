# 9 — PR Workflow & GitHub Flow

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

GitHub Flow's core principle — `main` is always deployable — forces teams to practice continuous integration. Small, short-lived branches reduce merge conflict frequency. PRs create a documented record of every decision, making `git blame` actually useful when you ask "why was this code written this way?"

## I — Interview Q&A

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
