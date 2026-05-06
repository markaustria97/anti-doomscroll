# 4 — Module Evaluation Ordering & Top-Level `await`

## T — TL;DR

Modules are evaluated in depth-first post-order — imports run before the importing module; top-level `await` pauses the evaluating module and all its dependents until the awaited value resolves.

## K — Key Concepts

```js
// Module evaluation order — depth first, post-order
// If index.js imports a.js which imports b.js:
// Evaluation: b.js → a.js → index.js (deepest first)

// ─── Top-Level Await (TLA) — ES2022, ESM only ─────────────
// config.js
const response = await fetch("/config.json")   // ← top-level await!
export const config = await response.json()

// index.js
import { config } from "./config.js"
// index.js WAITS until config.js fully evaluates (including its await)
console.log(config.apiUrl)  // guaranteed to be loaded

// Use cases for TLA:
// 1. Loading config/feature flags
const flags = await fetch("/flags").then(r => r.json())
export const FEATURE_X = flags.featureX

// 2. Conditional polyfill loading
if (!globalThis.crypto?.subtle) {
  await import("./crypto-polyfill.js")
}

// 3. DB connection initialization
export const db = await createConnection(process.env.DATABASE_URL)

// ─── Dangers of TLA ────────────────────────────────────────
// If config.js takes 2s to load, every module importing it
// is BLOCKED for 2s. In a large dependency graph, this can
// cascade and slow startup dramatically.

// Safe TLA pattern — only at app entry points
// ❌ Avoid TLA in shared libraries (blocks all consumers)
// ✅ Use TLA in: entry points, route modules, app-level init

// Node.js: TLA requires ESM (.mjs or "type":"module")
// CommonJS modules CANNOT use top-level await [web:89]
```


## W — Why It Matters

TLA enables clean module-level initialization without async IIFE wrappers. But it creates implicit blocking dependencies — a slow TLA in a shared util module blocks every app that imports it. This is why major libraries avoid TLA in their packages.

## I — Interview Q&A

**Q: What happens when a module with top-level `await` is imported?**
A: The importing module is suspended — it does not execute until the awaited module completes its evaluation (including its `await`). The entire module dependency graph respects this, so dependents higher up the chain also wait.

**Q: Can you use top-level `await` in CommonJS?**
A: No. CJS loading is synchronous — it cannot wait for async operations during `require()`. Top-level `await` is only available in ES Modules. Use an async IIFE or a separate async init function in CJS projects.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| TLA in a widely-imported utility module | Avoid — it blocks every consumer; use lazy init instead |
| TLA failing silently in `.js` files without `"type":"module"` | Ensure ESM mode is enabled |
| Circular deps with TLA causing hangs | Restructure to avoid circular ESM imports with TLA |

## K — Coding Challenge

**Refactor this CJS async init to use top-level await in ESM:**

```js
// CJS pattern
let db
async function init() { db = await connectDB() }
init()
module.exports = { getDb: () => db }
```

**Solution:**

```js
// ESM with top-level await
import { connectDB } from "./db.js"
export const db = await connectDB()   // module waits here
// All importers receive a fully-initialized db
```


***
