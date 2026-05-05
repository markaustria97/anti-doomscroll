# 4 — npm Scripts, `npx`, and `dotenv`

## T — TL;DR

`npm scripts` are shorthand shell commands; `npx` runs packages without installing them; `dotenv` loads `.env` files into `process.env`.

## K — Key Concepts

```json
// package.json scripts
"scripts": {
  "start":   "node index.js",
  "dev":     "nodemon index.js",
  "test":    "jest",
  "lint":    "eslint .",
  "build":   "tsc",
  "prebuild": "npm run lint"   // runs automatically before build
}
```

```bash
npm run dev        # run a script
npx create-react-app my-app   # run without installing globally
npx ts-node script.ts         # one-off execution
```

```js
// dotenv usage
require('dotenv').config()       // CommonJS
import 'dotenv/config'           // ESM

console.log(process.env.DB_URL)  // loaded from .env
```

```bash
# .env file (never commit this!)
DB_URL=mongodb://localhost:27017
PORT=3000
JWT_SECRET=supersecret
```


## W — Why It Matters

`npm scripts` standardize team commands ("just run `npm run dev`"). `npx` avoids polluting global installs. `dotenv` keeps secrets out of source code, a critical security practice.

## I — Interview Q&A

**Q: What's the difference between `npm install -g` and `npx`?**
A: `-g` installs globally and persists on your system. `npx` downloads, runs, and discards — no global pollution. Prefer `npx` for one-off CLIs.

**Q: Why should you never commit `.env` files?**
A: They contain secrets (API keys, DB passwords). Always add `.env` to `.gitignore` and use `.env.example` to document required variables.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Committing `.env` to git | Add `.env` to `.gitignore` immediately |
| Running `node script.js` without loading dotenv | Call `require('dotenv').config()` at top of entry file |
| Using spaces around `=` in `.env` | Write `KEY=value` with no spaces |

## K — Coding Challenge

**Call `dotenv` correctly and safely access an env variable:**

```js
// What happens if DB_URL is not set?
```

**Solution:**

```js
require('dotenv').config()

const dbUrl = process.env.DB_URL
if (!dbUrl) {
  throw new Error("Missing required env variable: DB_URL")
}
// Never silently fall back to a default for critical secrets
```


***
