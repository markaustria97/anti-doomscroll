# 4 — Git Hooks, Husky, lint-staged & commitlint

## T — TL;DR

Git hooks are scripts that run at specific points in the Git workflow; Husky makes them version-controlled and team-shared; lint-staged runs checks only on staged files (fast); commitlint enforces conventional commit format.

## K — Key Concepts

```bash
# ── Native Git hooks (not version-controlled) ─────────────
ls .git/hooks/
# applypatch-msg    pre-applypatch    pre-commit
# commit-msg        pre-merge-commit  pre-push
# post-commit       pre-rebase        prepare-commit-msg

# Create a native pre-commit hook:
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
npm run lint
npm run typecheck
EOF
chmod +x .git/hooks/pre-commit
# Problem: .git/hooks is NOT committed — teammates don't get it

# ── Husky — version-controlled hooks (modern setup) ───────
npm install -D husky
npx husky init                     # creates .husky/ directory + package.json script

# package.json (auto-added by husky init):
{
  "scripts": {
    "prepare": "husky"             # runs husky on npm install — hooks always set up
  }
}

# .husky/pre-commit
npm run lint-staged                # fast: only staged files

# .husky/commit-msg
npx --no-install commitlint --edit $1   # validate commit message format

# .husky/pre-push
npm run typecheck                  # full typecheck before push

# ── lint-staged — fast: only run on staged files ──────────
npm install -D lint-staged

# .lintstagedrc.js (or lint-staged key in package.json)
module.exports = {
  // TypeScript/JavaScript files
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",              // fix what can be auto-fixed
    "prettier --write",          // format
  ],
  // Other files — format only
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ],
  // CSS
  "*.{css,scss}": [
    "stylelint --fix",
    "prettier --write"
  ]
}
// Files are automatically re-staged after auto-fix
// If lint fails: commit is blocked, error shown, no changes committed

# ── commitlint — enforce conventional commits ─────────────
npm install -D @commitlint/cli @commitlint/config-conventional

# commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", [
      "auth", "api", "ui", "db", "cache", "deps", "ci", "docs"
    ]],
    "subject-min-length": [2, "always", 10],   // min 10 chars in description
    "body-max-line-length": [1, "always", 100], // warn if body line > 100 chars
    "footer-max-line-length": [0, "always", 200] // disable footer limit
  }
}

# .husky/commit-msg (already shown above)
npx --no-install commitlint --edit $1

# Test commitlint manually:
echo "feat: add login" | npx commitlint          # ✅
echo "added login stuff" | npx commitlint         # ❌ invalid format
echo "feat(auth): add OAuth" | npx commitlint     # ✅
echo "feat(billing): add Stripe" | npx commitlint # ❌ "billing" not in scope-enum

# ── Full setup sequence for a new project ─────────────────
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init

echo "npx lint-staged" > .husky/pre-commit
echo "npx --no-install commitlint --edit \$1" > .husky/commit-msg
echo "npm run typecheck" > .husky/pre-push

# Now every developer who runs npm install gets all hooks automatically ✅
```


## W — Why It Matters

Husky + lint-staged is the team-wide quality gate at zero CI cost — problems are caught before they're committed, not after CI runs 3 minutes later. The key insight: `lint-staged` runs only on staged files, not the whole codebase — a commit that touches 3 files runs lint on 3 files, not 500.

## I — Interview Q&A

**Q: Why use lint-staged instead of running ESLint on the whole project in a pre-commit hook?**
A: Full project lint can take 30+ seconds in large codebases — slow enough that developers start using `--no-verify` to skip hooks. lint-staged runs lint only on files being committed, typically taking under 2 seconds. Fast hooks get used; slow ones get skipped.

**Q: How does Husky ensure hooks are installed for all team members?**
A: Husky adds `"prepare": "husky"` to `package.json`. `prepare` is an npm lifecycle hook that runs automatically on every `npm install`. When a developer clones the repo and runs `npm install`, Husky runs and configures Git to use `.husky/` as the hooks directory.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `--no-verify` becoming a team habit | Keep hooks fast (< 5s) — lint-staged + typecheck on changed files only |
| Husky not running on CI | CI doesn't run `npm install --ignore-scripts` or equivalent; hooks are intentionally skipped on CI (CI has its own checks) |
| commitlint blocking merge commits like "Merge branch 'main'" | Add `defaultIgnores: true` in commitlint config — merge commits are ignored by default |

## K — Coding Challenge

**Set up the complete Husky + lint-staged + commitlint stack for a TypeScript project:**

**Solution:**

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init

# .husky/pre-commit:
echo "npx lint-staged" > .husky/pre-commit

# .husky/commit-msg:
echo "npx --no-install commitlint --edit \$1" > .husky/commit-msg

# .lintstagedrc.js:
cat > .lintstagedrc.js << 'EOF'
module.exports = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
EOF

# commitlint.config.js:
cat > commitlint.config.js << 'EOF'
module.exports = { extends: ["@commitlint/config-conventional"] }
EOF

# Now test:
git add src/index.ts
git commit -m "added stuff"
# ❌ commitlint: type may not be empty; subject may not be empty

git commit -m "feat(auth): add OAuth2 login handler"
# ✅ lint-staged runs on src/index.ts only → commit succeeds
```


***
