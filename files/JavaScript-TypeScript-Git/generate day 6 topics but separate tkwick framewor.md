<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 6 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 6
Modules, Error Handling, Iteration \& Modern JS
CommonJS vs ES Modules, require/module.exports vs import/export, named exports, default exports, re-exports, barrel files, namespace imports, side-effect imports, dynamic import, lazy loading, "type": "module", .mjs/.cjs, import.meta.url, top-level await, module evaluation ordering, Error fields, stack, cause, custom error classes, AggregateError, throw/catch/rethrow, iterables, Symbol.iterator, iterators, next() protocol, generators, yield/yield*/return/throw, lazy evaluation, Map, Set, WeakMap, WeakSet, WeakRef, nullish assignment, logical assignment, exponentiation, numeric separators.

Here is **Day 6 — Modules, Error Handling, Iteration \& Modern JS** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 6 — Modules, Error Handling, Iteration \& Modern JS

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the code. Move on.

***

# 1 — CommonJS vs ES Modules

## T — TL;DR

CommonJS (`require`/`module.exports`) is Node.js's legacy synchronous module system; ES Modules (`import`/`export`) are the async, tree-shakable standard that works in both browsers and Node.js.[^2]

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

The entire npm ecosystem is converging on ESM — Node.js, Deno, Bun, and all modern bundlers (Vite, Rollup) default to it. CJS is being deprecated in new libraries. Tree-shaking (dead code elimination) only works reliably with ESM, directly impacting bundle size.[^5][^1]

## I — Interview Q\&A

**Q: What are "live bindings" in ES Modules and why do they matter?**
A: When you import a named export from an ESM, you get a live read-only view of the export — if the exporting module updates the variable, your import reflects the change. CJS gives you a snapshot copy at require-time. Live bindings enable patterns like hot module replacement and circular dependency handling.[^2]

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

# 2 — Named Exports, Default Exports, Re-exports \& Barrel Files

## T — TL;DR

Named exports are the modern standard — they enable tree-shaking and auto-import; default exports are for the "primary thing" a module exports; barrel files aggregate re-exports for clean import paths.

## K — Key Concepts

```js
// ─── Named exports — explicit, tree-shakable ───────────────
// utils.js
export const add = (a, b) => a + b
export const sub = (a, b) => a - b
export function multiply(a, b) { return a * b }

// import named
import { add, multiply } from "./utils.js"
import { add as sum } from "./utils.js"      // rename on import

// ─── Default export — one per module ──────────────────────
// Button.jsx
export default function Button({ label }) {
  return `<button>${label}</button>`
}
// or: const Button = ...; export default Button

// import default — any name works
import Button from "./Button.jsx"
import Btn from "./Button.jsx"    // same thing, different name

// ─── Both in same file ────────────────────────────────────
// api.js
export const BASE_URL = "/api"
export default class ApiClient { /* ... */ }

import ApiClient, { BASE_URL } from "./api.js"

// ─── Re-exports ──────────────────────────────────────────
export { add } from "./utils.js"           // re-export named
export { default as Button } from "./Button.jsx"  // re-export default as named
export * from "./utils.js"                  // re-export all named
export * as utils from "./utils.js"         // re-export as namespace

// ─── Barrel file (index.js) ──────────────────────────────
// components/index.js
export { Button } from "./Button.js"
export { Input } from "./Input.js"
export { Modal } from "./Modal.js"
export { default as Card } from "./Card.js"

// Consumer — clean single import path
import { Button, Modal, Input } from "./components"
// vs. without barrel:
// import { Button } from "./components/Button.js"
// import { Modal } from "./components/Modal.js" ...

// ─── Side-effect import ───────────────────────────────────
import "./styles.css"        // executed for side effects only
import "./polyfills.js"      // no bindings imported
```


## W — Why It Matters

Barrel files are ubiquitous in React/Vue projects and component libraries. However, naive barrel files with `export *` can break tree-shaking — importing one component may pull in all. Named exports are preferred over default exports for utilities because they require consistent naming and work better with IDEs and auto-imports.

## I — Interview Q\&A

**Q: What's the downside of barrel files (index.js re-exports)?**
A: If bundlers can't analyze the barrel statically, importing anything from it may pull in the entire file (defeating tree-shaking). This is called "import cost explosion." Fix with named exports and bundler-aware side-effect declarations in `package.json` (`"sideEffects": false`).

**Q: Why prefer named exports over default exports for utilities?**
A: Named exports enforce consistent names across the codebase — you can't accidentally import a utility as a different name. They also work better with auto-import in IDEs, are easier to refactor, and tree-shake more reliably.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `export default { a, b }` making tree-shaking impossible | Use named exports: `export const a = ...; export const b = ...` |
| Circular imports through barrel files | Avoid re-exporting modules that import from the same barrel |
| Default export + `export *` confusion | Default isn't included in `export *` — re-export explicitly |

## K — Coding Challenge

**Create a barrel file for these three modules:**

```js
// math/add.js    → export function add(a, b)
// math/sub.js    → export function sub(a, b)
// math/multiply.js → export default function multiply(a, b)
```

**Solution:**

```js
// math/index.js
export { add } from "./add.js"
export { sub } from "./sub.js"
export { default as multiply } from "./multiply.js"

// Consumer:
import { add, sub, multiply } from "./math/index.js"
```


***

# 3 — Dynamic Import, Lazy Loading \& `import.meta`

## T — TL;DR

Dynamic `import()` returns a Promise — enabling code-splitting, conditional loading, and lazy loading of heavy modules only when needed.[^2]

## K — Key Concepts

```js
// Static import — always loaded at startup
import { Chart } from "./Chart.js"

// Dynamic import — loaded on demand, returns Promise
const loadChart = async () => {
  const { Chart } = await import("./Chart.js")  // splits bundle!
  return new Chart()
}

// Conditional loading
async function loadPolyfill() {
  if (!("IntersectionObserver" in window)) {
    await import("intersection-observer")  // only load if needed
  }
}

// Route-based lazy loading (React pattern)
const Dashboard = lazy(() => import("./Dashboard.jsx"))
// Vite/webpack splits this into a separate chunk

// Named exports from dynamic import
const { add, multiply } = await import("./math.js")

// Default export from dynamic import
const { default: Chart } = await import("./Chart.js")
// or
const ChartModule = await import("./Chart.js")
ChartModule.default  // the default export

// import.meta — module-specific metadata (ESM only)
import.meta.url      // "file:///home/user/project/index.js" (Node.js)
                     // "http://localhost:3000/index.js" (browser)

// __dirname equivalent in ESM
import { fileURLToPath } from "url"
import { dirname, join } from "path"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = join(__dirname, "config.json")

// import.meta.env (Vite)
import.meta.env.VITE_API_URL      // env variables in browser builds
import.meta.env.MODE               // "development" | "production"

// import.meta.resolve — resolve module specifier to URL
const url = import.meta.resolve("./utils.js")
```


## W — Why It Matters

Dynamic `import()` is what powers code splitting in Vite, Webpack, and Next.js — reducing initial bundle size by loading heavy modules only when actually needed. `import.meta.url` replaces the `__dirname`/`__filename` globals that don't exist in ES Modules.[^3]

## I — Interview Q\&A

**Q: What does dynamic `import()` return?**
A: A Promise that resolves to the module's namespace object — an object with all the module's exports as properties, including `default` for the default export.

**Q: Why can't you use `__dirname` in ESM?**
A: `__dirname` and `__filename` are injected by the CJS wrapper — they don't exist in ESM. Use `import.meta.url` to get the current file's URL, then `fileURLToPath` and `dirname` to reconstruct the path.

## C — Common Pitfills

| Pitfall | Fix |
| :-- | :-- |
| Dynamic import not splitting the bundle | Ensure your bundler (Vite/Webpack) is configured for code splitting |
| `import.meta.url` failing in CJS | ESM-only — convert file to ESM or use `__filename` in CJS |
| `await import()` in a non-async context | Wrap in `async` function or use `.then()` |
| Dynamic import paths being fully dynamic (template literal) | Bundlers can't analyze `import(variable)` — use partial paths like `import("./icons/" + name + ".js")` |

## K — Coding Challenge

**Lazy-load a heavy `pdfGenerator` module only when the user clicks "Export PDF":**

```js
exportButton.addEventListener("click", async () => {
  // load pdfGenerator only now
})
```

**Solution:**

```js
exportButton.addEventListener("click", async () => {
  const { generatePDF } = await import("./pdfGenerator.js")
  const blob = await generatePDF(document.getElementById("report"))
  downloadBlob(blob, "report.pdf")
})
```


***

# 4 — Module Evaluation Ordering \& Top-Level `await`

## T — TL;DR

Modules are evaluated in depth-first post-order — imports run before the importing module; top-level `await` pauses the evaluating module and all its dependents until the awaited value resolves.[^6][^3]

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

TLA enables clean module-level initialization without async IIFE wrappers. But it creates implicit blocking dependencies — a slow TLA in a shared util module blocks every app that imports it. This is why major libraries avoid TLA in their packages.[^6][^3]

## I — Interview Q\&A

**Q: What happens when a module with top-level `await` is imported?**
A: The importing module is suspended — it does not execute until the awaited module completes its evaluation (including its `await`). The entire module dependency graph respects this, so dependents higher up the chain also wait.

**Q: Can you use top-level `await` in CommonJS?**
A: No. CJS loading is synchronous — it cannot wait for async operations during `require()`. Top-level `await` is only available in ES Modules. Use an async IIFE or a separate async init function in CJS projects.[^7]

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

# 5 — Error Fields, `stack`, `cause` \& Custom Error Classes

## T — TL;DR

JavaScript errors carry `message`, `name`, `stack`, and the modern `cause` field — always create custom error classes to distinguish error types in `catch` blocks without string-matching messages.

## K — Key Concepts

```js
// Built-in error types
new Error("general")
new TypeError("wrong type")
new RangeError("out of range")
new ReferenceError("undefined variable")
new SyntaxError("bad syntax")
new URIError("bad URI")
new EvalError("eval problem")

// Error fields
const err = new Error("Something failed")
err.message   // "Something failed"
err.name      // "Error"
err.stack     // full stack trace as string (V8 format)

// error.cause — chain errors (ES2022)
try {
  await fetchUser(1)
} catch (originalErr) {
  throw new Error("Failed to load dashboard", { cause: originalErr })
}
// Access:
err.cause  // the original error

// Custom error classes
class AppError extends Error {
  constructor(message, code, { cause } = {}) {
    super(message, { cause })
    this.name = "AppError"
    this.code = code
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)  // clean V8 stack
    }
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, "NOT_FOUND")
    this.name = "NotFoundError"
    this.resource = resource
    this.id = id
  }
}

class ValidationError extends AppError {
  constructor(field, reason) {
    super(`Validation failed for ${field}: ${reason}`, "VALIDATION_ERROR")
    this.name = "ValidationError"
    this.field = field
  }
}

// Usage
try {
  throw new NotFoundError("User", 42)
} catch (err) {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message, resource: err.resource })
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message, field: err.field })
  } else {
    throw err  // rethrow unknown errors
  }
}
```


## W — Why It Matters

Matching errors with `err.message.includes("not found")` is fragile — messages change. Custom error classes enable `instanceof` checks, structured error metadata (status codes, field names), and proper error hierarchies that middleware and monitoring tools can consume reliably.

## I — Interview Q\&A

**Q: What is `error.cause` and when would you use it?**
A: `cause` (ES2022) attaches the original error when wrapping or rethrowing. It preserves the full causal chain: `new Error("high-level message", { cause: lowLevelErr })`. Monitoring tools like Sentry can traverse the chain to show root causes.

**Q: Why call `Error.captureStackTrace` in custom error classes?**
A: V8's `captureStackTrace(this, ConstructorFunction)` removes the error constructor itself from the stack trace, making the trace point to where the error was thrown from — not to the `AppError` constructor. This is purely a DX improvement.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `this.name = "CustomError"` | Without it, `err.name` is `"Error"` — stack traces mislead |
| Catching errors and swallowing them silently | At minimum log; consider rethrowing or using `cause` |
| Checking `err.message` for error type | Use `instanceof` or `err.code`/`err.name` — messages change |
| Not calling `super(message)` before accessing `this` | `super()` is required before any `this` access in subclass |

## K — Coding Challenge

**Build an `HttpError` hierarchy with `NetworkError` and `AuthError` subclasses:**

```js
throw new AuthError(401, "Token expired")
// err.status = 401, err.name = "AuthError", instanceof HttpError = true
```

**Solution:**

```js
class HttpError extends Error {
  constructor(status, message, options = {}) {
    super(message, options)
    this.name = "HttpError"
    this.status = status
  }
}

class NetworkError extends HttpError {
  constructor(message, options) {
    super(0, message, options)
    this.name = "NetworkError"
  }
}

class AuthError extends HttpError {
  constructor(status, message, options) {
    super(status, message, options)
    this.name = "AuthError"
  }
}
```


***

# 6 — `throw`/`catch`/rethrow Patterns

## T — TL;DR

`throw` any value (but always throw `Error` objects); `catch` selectively by type; rethrow anything you can't handle — never silently swallow errors you don't understand.

## K — Key Concepts

```js
// throw — any value, but always use Error objects
throw new Error("message")         // ✅
throw new TypeError("wrong type")  // ✅
throw "a string"                   // ❌ no stack trace, no .message
throw 42                           // ❌ even worse

// Basic try/catch/finally
function parseConfig(json) {
  try {
    return JSON.parse(json)
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid config JSON: ${err.message}`, { cause: err })
    }
    throw err  // rethrow unknown errors
  } finally {
    console.log("parseConfig attempted")  // always runs
  }
}

// Selective catch — handle known errors, rethrow others
async function loadUser(id) {
  try {
    const user = await db.findUser(id)
    if (!user) throw new NotFoundError("User", id)
    return user
  } catch (err) {
    if (err instanceof NotFoundError) {
      return null  // handled gracefully
    }
    // Don't swallow: rethrow database errors, network errors, etc.
    throw err
  }
}

// Rethrowing with context
async function processOrder(orderId) {
  try {
    const order = await fetchOrder(orderId)
    await chargeCustomer(order)
  } catch (err) {
    // Add context, preserve original cause
    throw new Error(`Order ${orderId} processing failed`, { cause: err })
  }
}

// Error boundary pattern (collecting errors)
async function processBatch(items) {
  const errors = []
  const results = []

  for (const item of items) {
    try {
      results.push(await processItem(item))
    } catch (err) {
      errors.push({ item, error: err })  // collect, don't stop
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(
      errors.map(e => e.error),
      `${errors.length} items failed in batch`
    )
  }
  return results
}

// finally doesn't swallow errors — but a throw in finally does!
function risky() {
  try {
    throw new Error("original")
  } finally {
    // return "overridden"  // ❌ swallows original error!
    // throw new Error("finally")  // ❌ replaces original error
    cleanup()  // ✅ just run cleanup, don't throw or return
  }
}
```


## W — Why It Matters

Rethrow discipline is a hallmark of senior-level code. Swallowed errors hide bugs in production. Selective catches prevent masking unexpected failures. `finally` misuse (throwing or returning inside it) is a subtle trap that silently replaces the original error.

## I — Interview Q\&A

**Q: When should you rethrow an error in a catch block?**
A: Rethrow when you can't fully handle the error at this level — you only want to add context, log it, or selectively handle one type. The rule: if you catch it, either handle it fully or rethrow (possibly wrapped with `cause`).

**Q: What happens if you `return` inside a `finally` block?**
A: The `return` in `finally` overrides any pending `return` or `throw` from the `try`/`catch` blocks. The original error is silently swallowed. Only use `finally` for side-effect cleanup — never `return` or `throw` inside it unless intentional.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Empty `catch(err) {}` swallowing error silently | At minimum: `console.error(err)` or re-throw |
| `throw "string"` losing stack trace | Always `throw new Error("message")` |
| `return` or `throw` inside `finally` | Use `finally` for cleanup only — no flow control |
| Catching `Error` when you meant `instanceof SpecificError` | Check with `instanceof` before handling |

## K — Coding Challenge

**Write a `withRetry(fn, retries)` that retries on any error except `AuthError`:**

```js
await withRetry(() => fetchData(), 3)
```

**Solution:**

```js
async function withRetry(fn, retries = 3) {
  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (err instanceof AuthError) throw err  // never retry auth errors
      lastError = err
      if (attempt < retries) await sleep(1000 * attempt)  // backoff
    }
  }
  throw new Error(`Failed after ${retries} retries`, { cause: lastError })
}
```


***

# 7 — Iterables, `Symbol.iterator` \& the Iterator Protocol

## T — TL;DR

Any object with a `[Symbol.iterator]()` method is iterable — it must return an iterator with a `next()` method that produces `{ value, done }` objects.[^8][^9]

## K — Key Concepts

```js
// The iteration protocol — two parts:

// 1. ITERABLE: has [Symbol.iterator]() that returns an ITERATOR
// 2. ITERATOR: has next() that returns { value, done }

// Built-in iterables: Array, String, Map, Set, arguments, NodeList
for (const x of [1,2,3]) {}  // Array is iterable
for (const ch of "hello") {} // String is iterable
for (const [k, v] of new Map([["a",1]])) {}

// Manual iterator consumption
const iter = [10, 20, 30][Symbol.iterator]()
iter.next()  // { value: 10, done: false }
iter.next()  // { value: 20, done: false }
iter.next()  // { value: 30, done: false }
iter.next()  // { value: undefined, done: true }

// Custom iterable object
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {            // makes the object iterable
    let current = this.from
    const last = this.to
    return {
      next() {                     // the iterator
        if (current <= last) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      },
      [Symbol.iterator]() { return this }  // iterator is also iterable (good practice)
    }
  }
}

for (const n of range) console.log(n)  // 1 2 3 4 5
[...range]                              // [1, 2, 3, 4, 5]
const [first, second] = range          // destructuring works!
Array.from(range)                       // [1, 2, 3, 4, 5]

// Return/throw on iterator (optional protocol methods)
const iter2 = range[Symbol.iterator]()
iter2.return?.("early exit")  // signal early termination (e.g., break in for...of)
iter2.throw?.(new Error())    // signal error into iterator
```


## W — Why It Matters

The iteration protocol powers `for...of`, spread `[...x]`, destructuring, `Array.from`, `Promise.all`, `Map`/`Set` constructors, and `yield*`. Any data structure you build becomes a first-class JavaScript citizen once it implements this protocol.[^9][^8]

## I — Interview Q\&A

**Q: What's the difference between an iterable and an iterator?**
A: An **iterable** has `[Symbol.iterator]()` — it produces iterators. An **iterator** has `next()` — it produces `{ value, done }` results. Arrays are iterables. `arr[Symbol.iterator]()` returns an iterator. An iterator can also be its own iterable (implementing both).

**Q: Why should an iterator also implement `[Symbol.iterator]() { return this }`?**
A: This makes the iterator itself iterable — so you can use it directly in `for...of` and destructuring after partially consuming it. Without it, you can't resume a partially-consumed iterator in contexts that expect an iterable.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Returning `{ done: true }` without `value` | Return `{ value: undefined, done: true }` — some consumers need explicit `undefined` |
| Plain object `{}` not being iterable | Implement `[Symbol.iterator]()` or convert to Map/array |
| Infinite iterator in `[...spread]` | Only spread finite iterables — take `n` items first |
| Not making iterator also iterable | Add `[Symbol.iterator]() { return this }` to iterator |

## K — Coding Challenge

**Make this `LinkedList` iterable:**

```js
const list = new LinkedList(1, 2, 3)
[...list]         // [1, 2, 3]
for (const n of list) console.log(n)
```

**Solution:**

```js
class LinkedList {
  constructor(...vals) {
    this.head = null
    vals.reverse().forEach(v => this.head = { val: v, next: this.head })
  }

  [Symbol.iterator]() {
    let node = this.head
    return {
      next() {
        if (node) {
          const value = node.val
          node = node.next
          return { value, done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}
```


***

# 8 — Generators: `yield`, `yield*`, `return`, `throw` \& Lazy Evaluation

## T — TL;DR

Generators (`function*`) are pausable functions — `yield` suspends and emits a value; the caller controls when to resume; this enables lazy sequences, infinite streams, and coroutines.[^4][^9]

## K — Key Concepts

```js
// Generator function — returns a generator (which is both iterator AND iterable)
function* counter(start = 0) {
  while (true) {          // infinite — lazy, only computes on demand
    yield start++         // pause here, emit value
  }
}

const gen = counter(1)
gen.next()  // { value: 1, done: false }
gen.next()  // { value: 2, done: false }
gen.next()  // { value: 3, done: false }
// Infinite — never done: true (unless return() called)

// Finite generator
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) yield i
}
[...range(1, 10, 2)]  // [1, 3, 5, 7, 9]

// yield* — delegate to another iterable
function* concat(...iterables) {
  for (const it of iterables) {
    yield* it  // delegates: yields each item from `it`
  }
}
[...concat([1, 2], [3, 4], [^5])]  // [1, 2, 3, 4, 5]

// Two-way communication — passing values INTO generator via next(value)
function* accumulator() {
  let total = 0
  while (true) {
    const n = yield total  // yield sends total OUT; next(n) sends n IN
    total += n ?? 0
  }
}
const acc = accumulator()
acc.next()     // { value: 0, done: false } — starts it
acc.next(10)   // { value: 10, done: false }
acc.next(5)    // { value: 15, done: false }

// generator.return(val) — force completion
gen.return("done")  // { value: "done", done: true }

// generator.throw(err) — inject error at yield point
function* safe() {
  try { yield 1 }
  catch (e) { console.error("caught:", e.message) }
  yield 2
}
const s = safe()
s.next()                        // { value: 1, done: false }
s.throw(new Error("injected")) // "caught: injected" → { value: 2, done: false }

// Lazy evaluation — only compute what you need
function* fibonacci() {
  let [a, b] = [0, 1]
  while (true) {
    yield a;
    [a, b] = [b, a + b]
  }
}

function take(n, gen) {
  const result = []
  for (const val of gen) {
    result.push(val)
    if (result.length >= n) break
  }
  return result
}
take(10, fibonacci())  // [0,1,1,2,3,5,8,13,21,34]
```


## W — Why It Matters

Generators are the foundation of async/await (Babel originally compiled `async/await` to generators), `co` library, Redux-Saga middleware, and any system requiring coroutine-style control flow. Lazy evaluation means you can model infinite sequences without memory issues.[^4][^9]

## I — Interview Q\&A

**Q: What is the difference between `yield` and `return` in a generator?**
A: `yield` pauses the generator and emits a value — it can resume. `return` terminates the generator permanently, emitting `{ value: returnValue, done: true }`. After `return`, all subsequent `next()` calls return `{ value: undefined, done: true }`.

**Q: How does `yield*` differ from `yield`?**
A: `yield` emits a single value. `yield*` delegates to another iterable — it yields every value from it one by one, essentially "flattening" the delegation. The return value of `yield*` is the iterable's final return value (if it's a generator).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Spreading an infinite generator | Always limit with `take(n, gen)` or `break` in `for...of` |
| `gen.next()` before starting — first call sets up, doesn't take a value | First `next()` runs to the first `yield`; passed value is ignored |
| Forgetting generators are single-use | Create a new generator for each independent iteration |
| `yield*` not working on non-iterables | Only delegates to iterables — not plain objects |

## K — Coding Challenge

**Write a lazy `map` and `filter` using generators:**

```js
const result = take(3, filter(x => x % 2 === 0, map(x => x * x, range(1, 100))))
// → [4, 16, 36] — squares of even numbers from 1–100, lazily evaluated
```

**Solution:**

```js
function* map(fn, iter) {
  for (const val of iter) yield fn(val)
}

function* filter(pred, iter) {
  for (const val of iter) {
    if (pred(val)) yield val
  }
}

// Usage — nothing is computed until `take` pulls values!
const result = take(3, filter(x => x % 2 === 0, map(x => x * x, range(1, 100))))
// [4, 16, 36]
```


***

# 9 — `Map` \& `Set`

## T — TL;DR

`Map` is a key-value store where keys can be any type (not just strings); `Set` is a collection of unique values — both are ordered and iterable, unlike plain objects.

## K — Key Concepts

```js
// ─── Map ──────────────────────────────────────────────────
const map = new Map()
map.set("name", "Alice")
map.set(42, "forty-two")
map.set({ id: 1 }, "object key!")  // any type as key
map.set(true, "boolean key")

map.get("name")      // "Alice"
map.has(42)          // true
map.size             // 4
map.delete(42)       // true
map.clear()

// Initialize from entries
const m = new Map([["a", 1], ["b", 2], ["c", 3]])

// Iteration — insertion order preserved
for (const [key, value] of m) console.log(key, value)
[...m.keys()]    // ["a", "b", "c"]
[...m.values()]  // [1, 2, 3]
[...m.entries()] // [["a",1], ["b",2], ["c",3]]

// Object vs Map:
// Object keys: string or Symbol only
// Map keys: ANY value (objects, functions, primitives)
// Map has .size, Object needs Object.keys().length
// Map iteration order is always insertion order
// Map is faster for frequent add/remove

// Convert
Object.fromEntries(m)  // { a:1, b:2, c:3 }
new Map(Object.entries({ a:1, b:2 }))  // Map { a→1, b→2 }

// ─── Set ──────────────────────────────────────────────────
const set = new Set([1, 2, 3, 2, 1])  // { 1, 2, 3 } — deduplicates!
set.add(4)
set.has(3)    // true
set.delete(2) // true
set.size      // 3

// Iteration
for (const val of set) console.log(val)
[...set]  // [1, 3, 4]

// Deduplication
const unique = [...new Set([1, 2, 2, 3, 3, 3])]  // [1, 2, 3]

// Set operations (ES2025 native methods!)
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

a.union(b)         // Set { 1, 2, 3, 4 }
a.intersection(b)  // Set { 2, 3 }
a.difference(b)    // Set { 1 }
a.isSubsetOf(b)    // false
a.isSupersetOf(b)  // false
```


## W — Why It Matters

`Map` replaces plain objects as dictionaries when keys are non-strings or when you need reliable iteration order. `Set` is the idiomatic deduplication tool. Set methods (union, intersection, difference) land in ES2025, replacing verbose manual implementations. Using `Map` for caches avoids prototype pollution risks of plain objects.

## I — Interview Q\&A

**Q: When would you use a `Map` over a plain object?**
A: When keys are non-strings (objects, numbers, symbols), when you need guaranteed insertion-order iteration, when you frequently add/remove keys (Map is optimized for this), or when you need `.size` without manual counting. Also when you want a clean dictionary without prototype methods like `toString`.

**Q: How is `Set` different from an array with deduplication?**
A: `Set` guarantees uniqueness at all times — `.add()` is O(1) and silently ignores duplicates. `Set` also has O(1) `.has()` lookups vs O(n) for `Array.includes()`. Downside: no random index access and limited built-in transformation methods.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `map.get(objKey)` returning undefined | Object keys compare by reference — store and reuse the same object reference |
| `new Set([{a:1}, {a:1}])` not deduplicating | Objects compare by reference — same content ≠ same key |
| Using object as Map when keys aren't strings | Use `Map` for non-string keys |
| `.forEach` on Map receiving `(value, key)` — note reversed order | Map forEach is `(value, key, map)` — different from Array's `(item, index)` |

## K — Coding Challenge

**Count word frequencies using a Map, then find the top 3:**

```js
const words = ["apple","banana","apple","cherry","banana","apple","date"]
topN(words, 3)  // [["apple",3], ["banana",2], ["cherry",1]]
```

**Solution:**

```js
function topN(words, n) {
  const freq = words.reduce((map, word) =>
    map.set(word, (map.get(word) ?? 0) + 1), new Map())

  return [...freq.entries()]
    .sort((a, b) => b[^1] - a[^1])
    .slice(0, n)
}
```


***

# 10 — `WeakMap`, `WeakSet` \& `WeakRef`

## T — TL;DR

Weak collections hold **object references that don't prevent garbage collection** — when the object is GC'd, its entry silently disappears — making them ideal for caches and private metadata.[^10][^11]

## K — Key Concepts

```js
// ─── WeakMap ──────────────────────────────────────────────
// Keys MUST be objects (or non-registered symbols)
// No enumeration — you can't list keys
const cache = new WeakMap()

function processUser(user) {
  if (cache.has(user)) return cache.get(user)  // cache hit
  const result = expensiveComputation(user)
  cache.set(user, result)  // user is the key — weakly held
  return result
}
// When `user` object is GC'd, the cache entry disappears automatically!
// No memory leak — no need to manually delete

// Private data pattern (before private fields)
const _private = new WeakMap()
class Person {
  constructor(name, ssn) {
    _private.set(this, { ssn })  // truly private — not on the instance
    this.name = name
  }
  getSSN() { return _private.get(this).ssn }
}
const p = new Person("Alice", "123-45-6789")
p.getSSN()     // "123-45-6789"
_private.get(p).ssn  // accessible only if you have _private ref

// ─── WeakSet ──────────────────────────────────────────────
const seen = new WeakSet()

function processOnce(obj) {
  if (seen.has(obj)) return  // already processed
  seen.add(obj)
  doWork(obj)
}
// No memory leak — when obj is GC'd, entry disappears

// DOM node tracking without memory leak
const clickedElements = new WeakSet()
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    clickedElements.add(btn)
    console.log("Clicked:", btn.id)
  })
})
// When button is removed from DOM and GC'd, WeakSet entry disappears

// ─── WeakRef ──────────────────────────────────────────────
// Holds weak reference — does NOT prevent GC
let obj = { name: "BigData", data: new Array(1e6) }
const ref = new WeakRef(obj)

// Access the object (may be undefined if GC'd)
const deref = ref.deref()
if (deref) {
  console.log(deref.name)
} else {
  console.log("Object was garbage collected")
}

obj = null  // remove strong reference — object can now be GC'd
```

|  | `Map` | `WeakMap` | `Set` | `WeakSet` |
| :-- | :-- | :-- | :-- | :-- |
| Key/value types | Any | Objects only | Any | Objects only |
| Prevents GC? | ✅ Yes | ❌ No (weak) | ✅ Yes | ❌ No (weak) |
| Iterable? | ✅ | ❌ | ✅ | ❌ |
| `.size` | ✅ | ❌ | ✅ | ❌ |

## W — Why It Matters

`WeakMap` is used by Vue 3's reactivity system (storing effect dependencies), React internals (fiber metadata), and test libraries for spy/mock metadata. The key insight: if you'd need to manually delete an entry when an object is destroyed, you want a `WeakMap`.[^11][^10]

## I — Interview Q\&A

**Q: Why doesn't `WeakMap` have a `.size` property or iteration methods?**
A: Because GC can happen at any time — the "size" of a WeakMap is non-deterministic. Providing `.size` or `.keys()` would give you unreliable numbers. The design forces you to use WeakMap purely as a side-channel store, not as a data container.[^10]

**Q: What's the difference between `WeakRef.deref()` returning `undefined` vs. an object?**
A: If the GC has collected the referenced object, `deref()` returns `undefined`. If the object still exists in memory, `deref()` returns it. Always check before using: `const val = ref.deref(); if (val) { ... }`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using primitives as WeakMap keys | Keys must be objects or non-registered Symbols |
| Iterating a WeakMap/WeakSet | Not possible by design — use Map/Set if iteration needed |
| `WeakRef` as a reliable cache | Treat it as "maybe available" — GC can happen anytime |
| Using WeakMap for data that should survive | WeakMap entries die with the key object — use Map for persistent data |

## K — Coding Challenge

**Use a `WeakMap` to add private click-count metadata to DOM nodes:**

```js
trackClicks(button)
getClickCount(button)  // 3 (after 3 clicks)
// When button is removed from DOM → entry automatically GC'd
```

**Solution:**

```js
const clickCounts = new WeakMap()

function trackClicks(el) {
  el.addEventListener("click", () => {
    clickCounts.set(el, (clickCounts.get(el) ?? 0) + 1)
  })
}

function getClickCount(el) {
  return clickCounts.get(el) ?? 0
}
```


***

# 11 — Nullish Assignment, Logical Assignment \& Exponentiation

## T — TL;DR

ES2021 logical assignment operators (`??=`, `||=`, `&&=`) combine logic + assignment in one expression; `**` replaces `Math.pow`; numeric separators (`1_000_000`) make large numbers readable.

## K — Key Concepts

```js
// ─── Nullish Assignment ??= ────────────────────────────────
// Assign ONLY if current value is null or undefined
let config = { timeout: 0, retries: null }
config.timeout  ??= 5000   // 0 — NOT assigned (0 is not null/undefined)
config.retries  ??= 3      // 3 — assigned (null triggers ??=)
config.host     ??= "localhost"  // "localhost" — assigned (undefined)

// ─── Logical OR Assignment ||= ─────────────────────────────
// Assign if current value is FALSY (0, "", false, null, undefined, NaN)
let settings = { debug: false, port: 0 }
settings.debug ||= true    // true  — assigned (false is falsy)
settings.port  ||= 3000   // 3000  — assigned (0 is falsy) ⚠️ side effect!
// Use ??= when 0 or "" are valid values

// ─── Logical AND Assignment &&= ────────────────────────────
// Assign ONLY if current value is TRUTHY
let user = { name: "Alice", profile: null }
user.name    &&= user.name.toUpperCase()  // "ALICE" — assigned (truthy)
user.profile &&= user.profile.bio         // null — NOT assigned (null is falsy)
// Useful for conditional updates

// Comparison: old vs new patterns
// Old:
if (a == null) a = defaultValue
// New:
a ??= defaultValue

// Old:
a = a || defaultValue
// New:
a ||= defaultValue

// Old:
if (a) a = transform(a)
// New:
a &&= transform(a)

// ─── Exponentiation ** ────────────────────────────────────
2 ** 10       // 1024 (vs Math.pow(2, 10))
2 ** 0.5      // ~1.414 (square root)
-2 ** 2       // ❌ SyntaxError — wrap in parens: (-2) ** 2 = 4
const x = 2
x **= 3       // x = 8 (exponentiation assignment)

// ─── Numeric Separators _ ─────────────────────────────────
const million    = 1_000_000
const hex        = 0xFF_EC_D5_12
const bytes      = 0b1010_0001
const bigInt     = 9_007_199_254_740_991n
const pi         = 3.141_592_653

// Purely cosmetic — JS ignores underscores in numeric literals
1_000_000 === 1000000  // true
```


## W — Why It Matters

`??=` vs `||=` is a common bug source — `||=` silently overwrites `0`, `false`, and `""` which are often valid values (port numbers, empty strings, disabled flags). Always prefer `??=` for "set default if missing" patterns. Numeric separators make financial and scientific constants readable at a glance.

## I — Interview Q\&A

**Q: What's the difference between `??=` and `||=`?**
A: `??=` only assigns when the current value is `null` or `undefined`. `||=` assigns for any falsy value (`0`, `""`, `false`, `null`, `undefined`, `NaN`). Use `??=` when `0` or `false` are valid values. Use `||=` only when all falsy values should be treated as "missing."

**Q: What does `user.profile &&= transform(user.profile)` do?**
A: If `user.profile` is truthy, it replaces it with `transform(user.profile)`. If `user.profile` is falsy (null, undefined, false), nothing happens. It's a safe conditional transform without an `if` statement.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `config.port ||= 3000` overwriting port `0` | Use `config.port ??= 3000` — `0` is a valid port |
| `-2 ** 2` throwing SyntaxError | Use `(-2) ** 2` — wrap negative base in parens |
| Numeric separator `_` at start/end of number | Invalid: `_1000`, `1000_` — only between digits |
| Using `1_0` when you meant `10` — misleading | Use separators only at natural grouping points |

## K — Coding Challenge

**Use logical assignment operators to set defaults on a config object without overwriting valid falsy values:**

```js
function configure(opts = {}) {
  // port: default 3000, but 0 is valid
  // debug: default false
  // host: default "localhost", but "" is valid (no host)
  // retries: default 3, null means "use default"
}
```

**Solution:**

```js
function configure(opts = {}) {
  opts.port    ??= 3000           // 0 is valid → use ??=
  opts.debug   ??= false          // false is valid → use ??=
  opts.host    ??= "localhost"    // "" might be valid → use ??=
  opts.retries ??= 3              // null/undefined → default
  return opts
}
// configure({ port: 0, debug: true })
// → { port: 0, debug: true, host: "localhost", retries: 3 }
```


***

> ✅ **Day 6 complete.**
> Your tiny next action: write a generator that produces the Fibonacci sequence lazily, then use `take(10, fibonacci())` to get the first 10 numbers — in 10 lines, from memory.
<span style="display:none">[^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://www.reddit.com/r/node/comments/1hv3blv/is_it_still_okay_to_use_commonjs_in_new_projects/

[^2]: https://esmodules.com/comparisons/

[^3]: https://blog.openreplay.com/using-top-level-await-modern-javascript/

[^4]: https://fenilsonani.com/articles/javascript-generators

[^5]: https://javascript.plainenglish.io/commonjs-vs-es-modules-why-both-matter-in-2025-b7edc1b29899

[^6]: https://allthingssmitty.com/2025/06/16/using-await-at-the-top-level-in-es-modules/

[^7]: https://github.com/nodejs/node/issues/21267

[^8]: https://javascript.plainenglish.io/javascript-lazy-evaluation-iterables-iterators-e0770a5de96f

[^9]: https://www.greatfrontend.com/questions/quiz/what-are-iterators-and-generators-and-what-are-they-used-for

[^10]: https://v8.dev/features/weak-references

[^11]: https://www.greatfrontend.com/questions/quiz/what-are-the-differences-between-map-set-and-weakmap-weakset

[^12]: https://www.linkedin.com/posts/aashu0907_nodejs-esm-commonjs-activity-7351787204597211138--lHw

[^13]: https://syntactic-sugar.dev/blog/nested-route/iterators-and-generators

[^14]: https://www.youtube.com/watch?v=ZvMQQuMZdCY

[^15]: https://www.syncfusion.com/blogs/post/js-commonjs-vs-es-modules

