# 1 — CommonJS vs ES Modules

## T — TL;DR

CommonJS (`require`/`module.exports`) is Node.js's legacy synchronous module system; ES Modules (`import`/`export`) are the async, tree-shakable standard that works in both browsers and Node.js.

## K — Key Concepts

```js
// ─── CommonJS (CJS) ───────────────────────────────────────
// math.js
const PI = 3.14159
function circle(r) { return PI * r * r }
module.exports = { PI, circle }          // single object export
module.exports.square = (n) => n * n     // additive

// index.js
const { PI, circle } = require("./math") // synchronous — blocks
const math = require("./math")           // entire module object
const path = require("path")             // Node built-in
// require() path doesn't need extension: require("./math")

// ─── ES Modules (ESM) ─────────────────────────────────────
// math.mjs (or .js with "type":"module" in package.json)
export const PI = 3.14159
export function circle(r) { return PI * r * r }
export const square = (n) => n * n

// index.mjs
import { PI, circle } from "./math.mjs"   // extension required in ESM!
import * as math from "./math.mjs"        // namespace import
import("./math.mjs").then(m => m.circle)  // dynamic import

// CJS inside ESM project
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const legacyCJS = require("./legacy.cjs")
```

| Feature | CommonJS | ES Modules |
| :-- | :-- | :-- |
| Syntax | `require` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| Tree-shaking | ❌ Hard | ✅ Native |
| Top-level `await` | ❌ | ✅ |
| Browser native | ❌ | ✅ |
| Live bindings | ❌ (copies) | ✅ |
| File ext | `.js` / `.cjs` | `.mjs` or `.js` + `"type":"module"` |

## W — Why It Matters

The entire npm ecosystem is converging on ESM — Node.js, Deno, Bun, and all modern bundlers (Vite, Rollup) default to it. CJS is being deprecated in new libraries. Tree-shaking (dead code elimination) only works reliably with ESM, directly impacting bundle size.

## I — Interview Q&A

**Q: What are "live bindings" in ES Modules and why do they matter?**
A: When you import a named export from an ESM, you get a live read-only view of the export — if the exporting module updates the variable, your import reflects the change. CJS gives you a snapshot copy at require-time. Live bindings enable patterns like hot module replacement and circular dependency handling.

**Q: Can you `require()` an ES Module in Node.js?**
A: Not synchronously — `require()` is sync but ESM loading is async. From Node 22+, you can `require()` synchronous ESM files. Generally, use `import()` (dynamic) to load ESM from CJS, or use `createRequire` for the reverse.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Omitting file extension in ESM imports | Always use `./file.js` — ESM requires explicit extensions |
| Mixing `require` and `import` in the same file | Pick one system per file; use `.mjs`/`.cjs` to be explicit |
| `module.exports = fn` then `import { fn }` failing | CJS default export → `import fn from "./mod.cjs"` |
| `"type":"module"` breaking existing CJS files | Rename CJS files to `.cjs` to opt out |

## K — Coding Challenge

**Convert this CJS module to ESM:**

```js
// utils.js (CJS)
const { format } = require("date-fns")
function formatDate(d) { return format(d, "yyyy-MM-dd") }
module.exports = { formatDate }
```

**Solution:**

```js
// utils.js (ESM)
import { format } from "date-fns"
export function formatDate(d) { return format(d, "yyyy-MM-dd") }
```


***
