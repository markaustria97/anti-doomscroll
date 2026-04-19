# 10 — Declaration Files, Namespaces & Module Augmentation

## T — TL;DR

`.d.ts` files describe the **types** of existing JavaScript code without implementation; `namespace` groups related types; **module augmentation** lets you add types to existing modules — together they bridge untyped JS and extend third-party library types.

## K — Key Concepts

### Declaration Files (`.d.ts`)

```ts
// math-utils.d.ts — describes a JS library
declare function add(a: number, b: number): number
declare function subtract(a: number, b: number): number

declare const PI: number

declare class Calculator {
  add(a: number, b: number): number
  subtract(a: number, b: number): number
}
```

`declare` means "this exists at runtime, but I'm only describing the type."

### `declare module` for Untyped Libraries

```ts
// types/untyped-lib.d.ts
declare module "untyped-lib" {
  export function doSomething(input: string): number
  export const VERSION: string
  export default class Client {
    constructor(config: { apiKey: string })
    fetch(url: string): Promise<unknown>
  }
}

// Now you can import with types:
import Client, { doSomething } from "untyped-lib"
```

### Typing Non-JS Imports

```ts
// types/assets.d.ts
declare module "*.css" {
  const classes: Record<string, string>
  export default classes
}

declare module "*.svg" {
  const content: string
  export default content
}

declare module "*.png" {
  const src: string
  export default src
}

// Now:
import styles from "./App.css"    // Record<string, string>
import logo from "./logo.svg"     // string
```

### Module Augmentation

Adds types to an **existing** module:

```ts
// Augment Express's Request type:
declare module "express" {
  interface Request {
    user?: {
      id: string
      role: string
    }
  }
}

// Now:
app.get("/profile", (req, res) => {
  req.user?.id // ✅ typed
})
```

### Global Augmentation

```ts
// global.d.ts
declare global {
  interface Window {
    __APP_VERSION__: string
    analytics: {
      track(event: string, data?: Record<string, unknown>): void
    }
  }

  // Add a global function:
  function __DEV__(): boolean
}

export {} // required to make this a module

// Now:
window.__APP_VERSION__  // string ✅
window.analytics.track("click") // ✅
```

### `namespace`

```ts
namespace Validation {
  export interface Schema {
    validate(data: unknown): boolean
  }

  export interface Result {
    valid: boolean
    errors: string[]
  }

  export function createSchema(): Schema {
    return { validate: () => true }
  }
}

const schema: Validation.Schema = Validation.createSchema()
const result: Validation.Result = { valid: true, errors: [] }
```

**Modern recommendation:** Prefer modules (`import`/`export`) over namespaces. Use namespaces only for:
- Declaration merging with classes/functions
- Organizing types in `.d.ts` files
- Augmenting existing namespaces

### Declaration Merging with `namespace`

```ts
// Function + namespace merging:
function Currency(amount: number): Currency.Instance {
  return { amount, currency: "USD" }
}

namespace Currency {
  export interface Instance {
    amount: number
    currency: string
  }

  export function fromEUR(amount: number): Instance {
    return { amount, currency: "EUR" }
  }
}

const price = Currency(9.99)          // use as function
const euroPrice = Currency.fromEUR(8.50) // use namespace methods
type PriceType = Currency.Instance     // use namespace types
```

### Triple-Slash Directives

```ts
/// <reference types="vite/client" />
/// <reference path="./custom-types.d.ts" />
```

Used in `.d.ts` files to reference other type definitions. In modern projects, `tsconfig.json` `types` and `include` are preferred.

## W — Why It Matters

- `.d.ts` files are how TypeScript types exist for **every npm package** (via DefinitelyTyped `@types/*`).
- Module augmentation is how you extend Express, React, Next.js, etc. with custom types.
- Global augmentation adds types to `window` for analytics, feature flags, etc.
- Understanding declarations is essential for **library authorship** and monorepo shared types.
- This is a senior-level skill tested in architecture interviews.

## I — Interview Questions with Answers

### Q1: What is a `.d.ts` file?

**A:** A TypeScript declaration file that contains only type information — no implementation. It describes the shape of JavaScript code so TypeScript can type-check usage. Every `@types/*` package is `.d.ts` files.

### Q2: How do you add a property to Express's Request type?

**A:** Module augmentation: `declare module "express" { interface Request { user?: User } }`. This uses **declaration merging** — the `interface` merges with Express's existing `Request`.

### Q3: What is `declare module`?

**A:** Creates type declarations for a module. Used to (1) type untyped libraries, (2) augment existing module types, and (3) type non-JS imports (CSS, SVG, etc.).

### Q4: Should you use `namespace` in modern TypeScript?

**A:** Generally no — prefer ES modules. Use namespaces only for declaration merging patterns, organizing types in `.d.ts` files, and augmenting existing namespaces.

## C — Common Pitfalls with Fix

### Pitfall: Module augmentation file not being a module

```ts
// types/express.d.ts
declare module "express" {
  interface Request { user?: User }
}
// ❌ This might not work without export {}
```

**Fix:** Add `export {}` to make the file a module. Module augmentation only works in modules.

### Pitfall: `declare module` path must match exactly

```ts
declare module "express"    // ✅ matches import "express"
declare module "Express"    // ❌ wrong case
declare module "./express"  // ❌ different module
```

### Pitfall: Forgetting to include `.d.ts` files in tsconfig

```ts
// tsconfig.json
{
  "include": ["src"],       // doesn't include types/
  "typeRoots": ["./types"]  // or this
}
```

**Fix:** Either `include: ["src", "types"]` or `typeRoots: ["./types", "./node_modules/@types"]`.

## K — Coding Challenge with Solution

### Challenge

Augment the global `Window` and `Express.Request` with custom types:

### Solution

```ts
// types/global.d.ts
export {}

declare global {
  interface Window {
    __FEATURE_FLAGS__: {
      darkMode: boolean
      newDashboard: boolean
    }
  }
}

// types/express.d.ts
import { User } from "../src/models/User"

declare module "express-serve-static-core" {
  interface Request {
    user?: User
    requestId: string
  }
}

// Usage:
window.__FEATURE_FLAGS__.darkMode // boolean ✅

app.get("/", (req, res) => {
  req.user?.name    // string | undefined ✅
  req.requestId     // string ✅
})
```

Note: Express augmentation targets `"express-serve-static-core"` (the actual module), not `"express"`.

---
