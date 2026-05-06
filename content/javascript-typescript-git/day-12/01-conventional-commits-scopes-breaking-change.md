# 1 — Conventional Commits, Scopes & `BREAKING CHANGE`

## T — TL;DR

```
Conventional Commits is a machine-readable commit message format — `<type>(<scope>): <description>` — that unlocks automated versioning, changelogs, and release tooling.
```


## K — Key Concepts

```
── Full commit message structure ──────────────────────────

<type>(<scope>): <short description>     ← header (required)
                                          ← blank line
<body>                                    ← optional, multi-line context

<footer(s)>                               ← optional, breaking changes / issue refs

── Types → SemVer mapping ────────────────────────────────

feat:      → MINOR bump  (new feature, backward-compatible)
fix:       → PATCH bump  (bug fix)
perf:      → PATCH bump  (performance improvement)
refactor:  → no bump     (code change, no feature/fix)
docs:      → no bump     (documentation only)
test:      → no bump     (tests only)
chore:     → no bump     (build scripts, deps, tooling)
ci:        → no bump     (CI/CD pipeline changes)
style:     → no bump     (formatting, not logic)
build:     → no bump     (build system changes)
revert:    → PATCH bump  (reverts a previous commit)

── Scope — what area of the codebase ─────────────────────

feat(auth): add OAuth2 login
fix(api): handle 429 rate limit retries
docs(readme): add deployment instructions
chore(deps): bump lodash to 4.17.21
refactor(utils): extract formatDate helper

Scopes are team-defined — common patterns:
- By domain:    auth, api, ui, db, cache, queue
- By component: button, modal, form, navbar
- By layer:     frontend, backend, infra

── BREAKING CHANGE → MAJOR bump ──────────────────────────

Method 1: Footer annotation
feat(api): redesign user endpoint response shape

BREAKING CHANGE: /api/users now returns { data: User[] } instead of User[].
Consumers must update destructuring: `const { data: users } = await getUsers()`

Method 2: Exclamation mark shorthand (easier)
feat(api)!: redesign user endpoint response shape
fix(auth)!: remove deprecated password field from JWT payload

Both trigger a MAJOR semver bump.

── Full examples ─────────────────────────────────────────

# Simple fix
fix(auth): prevent login with expired JWT

# Feature with scope
feat(payments): add Stripe webhook signature verification

# Breaking change with exclamation
feat(api)!: change pagination from page/limit to cursor-based

BREAKING CHANGE: Remove `page` and `limit` query params from /api/items.
Use `cursor` and `after` instead. Migration guide: docs/migration-v3.md

Refs #482

# Revert
revert: feat(auth): add biometric login

This reverts commit abc1234.
Reason: WebAuthn API incompatible with iOS 15 Safari.

── Prereleases ────────────────────────────────────────────
v1.0.0-alpha.1    # early unstable
v1.0.0-beta.3     # feature complete, testing
v1.0.0-rc.1       # release candidate, nearly stable
v1.1.0-next.0     # next major cycle preview

# In semantic-release: prerelease channels
# main → stable releases (v1.2.3)
# beta → beta channel (v1.2.3-beta.1)
# alpha → alpha channel (v1.2.3-alpha.1)
```


## W — Why It Matters

Conventional Commits is the contract between your commit history and your release tooling — without it, tools like `semantic-release` and `standard-version` can't determine whether to bump patch, minor, or major. Once adopted, version bumps and changelogs become fully automated — zero manual tagging.

## I — Interview Q&A

**Q: How does `BREAKING CHANGE` in a commit footer affect versioning?**
A: Any commit with `BREAKING CHANGE:` in the footer or `!` after the type (e.g., `feat!:`) triggers a **MAJOR** semver bump — regardless of whether the type is `fix` or `feat`. Even a `fix!:` that removes a deprecated field triggers `v2.0.0` not `v1.0.1`.

**Q: What's the difference between `feat` and `chore`?**
A: `feat` introduces a new user-facing capability — it bumps MINOR version and appears in the changelog. `chore` covers maintenance tasks (updating build tools, bumping dev dependencies, CI changes) — no version bump, no changelog entry. Only things that affect consumers need `feat` or `fix`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `feat` for every commit — dilutes versioning | Reserve `feat` for user-facing features; use `refactor`/`chore`/`docs` accurately |
| Missing blank line between header and body | The spec requires it — tools like `commitlint` will reject the commit |
| `BREAKING CHANGE` in the header instead of footer | Must be in the footer or use `!` shorthand — not in the commit subject line |

## K — Coding Challenge

**Write conventional commits for each scenario:**

```
1. Added dark mode toggle to the settings page
2. Fixed crash when user logs out with expired session
3. Removed the deprecated `getUser()` method from the SDK (breaking)
4. Updated ESLint from v8 to v9 (build tool change)
5. Added unit tests for the payment service
```

**Solution:**

```
1. feat(settings): add dark mode toggle
2. fix(auth): prevent crash on logout with expired session
3. feat(sdk)!: remove deprecated getUser() method

   BREAKING CHANGE: `getUser()` has been removed. Use `fetchUser()` instead.
   See migration guide: docs/v4-migration.md

4. chore(lint): upgrade ESLint to v9
5. test(payments): add unit tests for PaymentService
```


***
