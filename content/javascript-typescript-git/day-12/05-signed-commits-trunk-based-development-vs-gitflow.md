# 5 — Signed Commits & Trunk-Based Development vs GitFlow

## T — TL;DR

Signed commits use GPG/SSH keys to cryptographically verify the commit author's identity; trunk-based development (short-lived branches, continuous merge to `main`) suits high-frequency teams, while GitFlow suits versioned-release products.

## K — Key Concepts

```bash
# ── Signed commits (GPG) ──────────────────────────────────
# Generate a GPG key:
gpg --full-generate-key           # RSA 4096, real name, email matching git config

# List keys:
gpg --list-secret-keys --keyid-format=long

# Export public key to GitHub:
gpg --armor --export YOUR_KEY_ID   # copy output → GitHub Settings → GPG Keys

# Configure git to sign with your key:
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true   # sign all commits automatically
git config --global tag.gpgsign true      # sign all tags

# Single signed commit:
git commit -S -m "feat(auth): add 2FA"   # -S = sign this commit

# Verify signature:
git log --show-signature
git verify-commit HEAD

# ── Signed commits via SSH key (simpler, GitHub 2022+) ────
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# SSH signing is simpler: uses existing SSH key, no GPG setup needed
# GitHub shows "Verified" badge on signed commits

# ── Trunk-Based Development ───────────────────────────────
# One long-lived branch: main (the "trunk")
# Feature branches live for HOURS to DAYS — never weeks
# Every developer integrates to main at least once per day
# Feature flags hide incomplete features

# Workflow:
git switch -c feature/short-lived    # branch lives < 1 day ideally
# ... small change ...
git commit -m "feat: add search endpoint"
git push origin feature/short-lived
# → open PR → CI passes → merge same day
# Feature flag disables it in prod until ready:
if (featureFlags.isEnabled("new-search")) { ... }

# Pros: no long-running divergence, CI always on latest
# Cons: requires feature flags, discipline, high test coverage

# ── GitFlow ───────────────────────────────────────────────
# Long-lived branches:
# main     → production-only (always stable, tagged releases)
# develop  → integration branch (all features merge here)
# feature/ → feature branches off develop
# release/ → release stabilization off develop
# hotfix/  → emergency fixes off main

# GitFlow commit lifecycle:
git flow init                         # setup (git-flow tool)
git flow feature start user-auth      # creates feature/user-auth from develop
git flow feature finish user-auth     # merges back to develop
git flow release start 2.1.0          # creates release/2.1.0 from develop
git flow release finish 2.1.0         # merges to main + develop + tags v2.1.0
git flow hotfix start critical-bug    # off main directly
git flow hotfix finish critical-bug   # merges to main + develop

# Pros: explicit release cycles, clear hotfix path
# Cons: complex, long-lived branches diverge, slower integration
```

```
── Trunk-Based vs GitFlow ────────────────────────────────

| Aspect              | Trunk-Based             | GitFlow                  |
|---------------------|-------------------------|--------------------------|
| Long-lived branches | main only               | main + develop + release |
| Branch lifetime     | Hours to days           | Weeks to months          |
| Release cadence     | Continuous (daily/hourly) | Scheduled (weekly/monthly) |
| Feature isolation   | Feature flags           | Long feature branches    |
| Merge conflicts     | Rare (frequent merges)  | Common (long divergence) |
| Best for            | SaaS, continuous deploy | Versioned software, apps |
| Complexity          | Low                     | High                     |
```


## W — Why It Matters

Signed commits are required by some organizations (financial, government, OSS) for supply chain security — verifying that a commit actually came from the claimed developer. Trunk-based development is the practice behind Google, Facebook, and Netflix's engineering velocity — short-lived branches eliminate the "merge hell" that kills team velocity at scale.

## I — Interview Q&A

**Q: What does "Verified" on a GitHub commit mean?**
A: It means the commit was cryptographically signed with a GPG key or SSH key whose public key is registered on GitHub. GitHub verified that the private key holder made the commit — not just that the `git config user.email` matches. Without signing, anyone can `git config user.email "linus@kernel.org"` and impersonate.

**Q: Why does trunk-based development require feature flags?**
A: Branches in trunk-based are merged to main before features are complete — multiple PRs build a feature incrementally. Feature flags let you merge incomplete code safely, hiding it from users until the whole feature is ready. Without flags, you'd either block merging (creating long branches) or ship half-built features.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| GitFlow's `develop` diverging far from `main` after a hotfix | GitFlow requires hotfixes to merge to BOTH `main` and `develop` — easy to forget |
| Trunk-based without feature flags — half-built code in production | Always pair trunk-based with a feature flag system before adoption |
| GPG signing failing with "secret key not available" | The GPG key's email must match `user.email` exactly in git config |

## K — Coding Challenge

**Given a team doing weekly versioned releases with a separate QA phase, choose the right workflow and explain the branch structure:**

**Solution:**

```
GitFlow is the right choice for weekly versioned releases with QA:

Branch structure:
main      → production code, tagged releases (v2.3.0, v2.4.0)
develop   → integration, always "next release" state
feature/* → individual features, merge to develop when complete
release/2.4.0 → QA phase: only bug fixes, no new features
             → when QA passes: merge to main + develop, tag v2.4.0
hotfix/*  → production emergencies off main, merge to main + develop

QA phase = release/2.4.0 branch:
git checkout -b release/2.4.0 develop
# QA tests, fixes bugs on this branch
# When approved:
git checkout main && git merge release/2.4.0 && git tag v2.4.0
git checkout develop && git merge release/2.4.0
```


***
