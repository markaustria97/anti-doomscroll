# 5 — ESM vs CJS

## T — TL;DR

**ESM** (ECMAScript Modules: `import`/`export`) is the standard module system with static analysis and tree-shaking; **CJS** (CommonJS: `require`/`module.exports`) is the legacy Node.js system — modern code should use ESM.

## K — Key Concepts

### ESM Syntax

```js
// Named exports
export const PI = 3.14159
export function add(a, b) { return a + b }
export class User {}

// Default export
export default function main() {}

// Importing
import main, { PI, add, User } from "./math.js"

// Rename on import
import { add as sum } from "./math.js"

// Import all
import * as math from "./math.js"
math.PI    // 3.14159
math.add   // function

// Side-effect only import (runs the module, imports nothing)
import "./setup.js"
```

### CJS Syntax

```js
// Exporting
module.exports = { PI: 3.14, add: (a, b) => a + b }
// or
exports.PI = 3.14
exports.add = (a, b) => a + b

// Importing
const { PI, add } = require("./math")
const math = require("./math")
```

### Key Differences

| Feature | ESM (`import`/`export`) | CJS (`require`/`module.exports`) |
|---------|------------------------|----------------------------------|
| Syntax | `import`/`export` | `require()`/`module.exports` |
| Loading | **Static** (parsed at compile time) | **Dynamic** (executed at runtime) |
| Timing | Before code runs | When `require()` line executes |
| Top-level `await` | ✅ Supported | ❌ Not supported |
| Tree-shaking | ✅ Yes (static analysis) | ❌ No (dynamic) |
| `this` at top level | `undefined` | `module.exports` |
| File extension | `.mjs` or `"type": "module"` in package.json | `.cjs` or default `.js` |
| Circular deps | Handles gracefully (live bindings) | Can produce `undefined` (copied values) |
| Browser support | ✅ Native (`<script type="module">`) | ❌ Needs bundler |

### Static vs Dynamic

ESM imports are **statically analyzed** — the engine knows all imports/exports before running code:

```js
// ESM — static, determined at parse time
import { add } from "./math.js" // always this path, always these names

// CJS — dynamic, determined at runtime
const lib = require(condition ? "./a" : "./b") // path chosen at runtime
const { [dynamicKey]: fn } = require("./utils") // dynamic property access
```

This static nature enables **tree-shaking** — bundlers can remove unused exports.

### Live Bindings vs Copies

ESM exports are **live bindings** — importing modules see updates:

```js
// counter.mjs
export let count = 0
export function increment() { count++ }

// main.mjs
import { count, increment } from "./counter.mjs"
console.log(count) // 0
increment()
console.log(count) // 1 — sees the updated value!
```

CJS exports are **copies**:

```js
// counter.js
let count = 0
module.exports = { count, increment: () => count++ }

// main.js
const { count, increment } = require("./counter")
console.log(count) // 0
increment()
console.log(count) // 0 — still 0! It's a copy.
```

### Setting Up ESM in Node.js

**Option 1:** Set `"type": "module"` in package.json:

```json
{
  "type": "module"
}
```

All `.js` files are treated as ESM. Use `.cjs` for CommonJS files.

**Option 2:** Use `.mjs` extension for ESM files.

### Importing CJS from ESM

```js
// Works — default import
import pkg from "cjs-package"

// May not work — named imports from CJS
import { named } from "cjs-package" // depends on the package
```

Node.js wraps CJS exports as the default export.

### Importing ESM from CJS

```js
// ❌ Cannot require() an ESM module synchronously
const mod = require("./esm-module.mjs") // Error

// ✅ Use dynamic import (returns a Promise)
const mod = await import("./esm-module.mjs")
```

## W — Why It Matters

- ESM is the **standard** — all modern tooling, frameworks, and runtimes default to it.
- **Tree-shaking** (dead code elimination) only works with ESM — critical for bundle size.
- **Top-level `await`** only works in ESM.
- Understanding the difference prevents `require`/`import` errors in Node.js.
- Most interview questions about modules test ESM vs CJS understanding.

## I — Interview Questions with Answers

### Q1: What is the difference between ESM and CJS?

**A:** ESM (`import`/`export`) is statically analyzed at parse time, supports tree-shaking and top-level `await`, and provides live bindings. CJS (`require`/`module.exports`) is dynamically evaluated at runtime, doesn't support tree-shaking, and exports copied values.

### Q2: What are live bindings?

**A:** ESM exports are live references to the original variable. When the exporting module updates the value, all importing modules see the change. CJS exports are copies — changes in the exporting module aren't reflected.

### Q3: Can you `require()` an ESM module?

**A:** Not synchronously. You must use `await import()` (dynamic import) to load ESM from CJS. ESM can import CJS modules via normal `import` syntax.

### Q4: Why does tree-shaking only work with ESM?

**A:** Because ESM imports/exports are **static** — the bundler knows at compile time exactly which exports are used and can remove unused ones. CJS is dynamic (`require` can be conditional), so the bundler can't safely eliminate anything.

## C — Common Pitfalls with Fix

### Pitfall: Using `require` in an ESM module

```js
// In a "type": "module" project:
const fs = require("fs") // ReferenceError: require is not defined
```

**Fix:** Use `import fs from "fs"` or `import { readFile } from "fs"`.

### Pitfall: Missing file extensions in ESM

```js
import { add } from "./math" // Error in Node.js ESM — no extension!
```

**Fix:** ESM in Node.js requires full file extensions: `import { add } from "./math.js"`. Bundlers (Webpack, Vite) usually handle this for you.

### Pitfall: `__dirname` and `__filename` not available in ESM

```js
// ESM:
console.log(__dirname) // ReferenceError
```

**Fix:**

```js
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

## K — Coding Challenge with Solution

### Challenge

Convert this CJS module to ESM:

```js
// utils.js (CJS)
const DEFAULT_TIMEOUT = 5000

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function retry(fn, attempts = 3) {
  // ... implementation
}

module.exports = { delay, retry, DEFAULT_TIMEOUT }
```

### Solution

```js
// utils.js (ESM)
export const DEFAULT_TIMEOUT = 5000

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry(fn, attempts = 3) {
  // ... implementation
}

// Consumer:
import { delay, retry, DEFAULT_TIMEOUT } from "./utils.js"
```

---
