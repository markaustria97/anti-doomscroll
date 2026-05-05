# 3 — Package Managers, `package.json` & Semver

## T — TL;DR

`package.json` is the manifest of your project; semver ranges and lockfiles control exactly which dependency versions get installed.

## K — Key Concepts

### Important `package.json` Fields

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "index.js",          // entry for require()
  "module": "index.esm.js",    // entry for ESM bundlers
  "scripts": { "start": "node index.js" },
  "dependencies": { "express": "^4.18.0" },
  "devDependencies": { "jest": "~29.0.0" },
  "engines": { "node": ">=18" }
}
```


### Semver Ranges

| Range | Meaning | Allows |
| :-- | :-- | :-- |
| `4.18.0` | Exact | Only `4.18.0` |
| `^4.18.0` | Compatible | `4.x.x` up to `<5.0.0` |
| `~4.18.0` | Approx | `4.18.x` up to `<4.19.0` |
| `>=4.0.0` | Min bound | Any `4.0.0` and above |
| `*` | Any | Whatever is latest |

### Lockfiles

- `package-lock.json` (npm) / `yarn.lock` / `pnpm-lock.yaml` — pin exact resolved versions
- **Always commit lockfiles** in apps; don't commit them in published libraries


## W — Why It Matters

Using `^` without a lockfile caused the infamous `left-pad` incident and countless "works on my machine" bugs. Lockfiles are your reproducibility guarantee.

## I — Interview Q&A

**Q: What's the difference between `dependencies` and `devDependencies`?**
A: `dependencies` are needed at runtime (express, lodash). `devDependencies` are only for development (jest, eslint). Running `npm install --production` skips devDependencies.

**Q: Why should you commit `package-lock.json`?**
A: It pins exact resolved versions including sub-dependencies, ensuring every developer and CI environment installs the exact same tree.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `*` for versions | Always specify a range like `^` |
| Not committing lockfile | Commit it — it's the reproducibility guarantee |
| Installing runtime deps as devDep | Use `npm install express` (no `--save-dev`) |

## K — Coding Challenge

**What version range does `^1.2.3` allow?**

**Solution:**

```
^1.2.3 → >=1.2.3 <2.0.0
// It will install any 1.x.x that is 1.2.3 or higher, but NOT 2.0.0+
// Reason: MAJOR version bump = breaking change
```


***
