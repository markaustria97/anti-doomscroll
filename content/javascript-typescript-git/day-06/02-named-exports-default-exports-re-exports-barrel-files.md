# 2 — Named Exports, Default Exports, Re-exports & Barrel Files

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

## I — Interview Q&A

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
