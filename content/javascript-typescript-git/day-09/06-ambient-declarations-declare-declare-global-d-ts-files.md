# 6 — Ambient Declarations: `declare`, `declare global`, `.d.ts` Files

## T — TL;DR

Ambient declarations tell TypeScript "this value exists at runtime, but I'm not providing its implementation" — used for third-party JavaScript, global variables, and extending existing types.

## K — Key Concepts

```ts
// ── declare — describe existing runtime values ─────────────
declare const __DEV__: boolean            // global flag injected by bundler
declare const __VERSION__: string
declare const ENV: "development" | "production" | "test"

declare function require(module: string): any  // CJS require in TS
declare function alert(message: string): void  // (already in lib.dom.d.ts)

// Declare a class you don't implement (e.g., from a CDN script)
declare class EventEmitter {
  on(event: string, listener: Function): this
  emit(event: string, ...args: unknown[]): boolean
  off(event: string, listener: Function): this
}

// declare module — type an entire untyped npm package
declare module "some-untyped-lib" {
  export function doThing(x: string): number
  export const version: string
  export default class MyLib {
    constructor(opts: { debug: boolean })
    run(): Promise<void>
  }
}

// ── .d.ts files — declaration-only files ──────────────────
// global.d.ts — for project-wide globals
declare const __APP_VERSION__: string
declare const __COMMIT_HASH__: string

interface Window {
  analytics: {
    track(event: string, props?: Record<string, unknown>): void
  }
}

// vite-env.d.ts (Vite projects)
/// <reference types="vite/client" />
// Adds types for import.meta.env, CSS modules, image imports, etc.

// ── declare global — augment global scope from a module ───
// Must be inside a module file (has at least one import/export)
export {}  // makes this a module

declare global {
  interface Window {
    myPlugin: { version: string; init(): void }
  }

  interface Array<T> {
    last(): T | undefined   // add method to all arrays globally
  }

  const __BUILD_ID__: string
}

// ── Extending third-party types ───────────────────────────
// express.d.ts — extend Express Request
import "express"
declare module "express" {
  interface Request {
    user?: { id: string; role: string }   // added by auth middleware
    requestId: string
  }
}

// ── @types packages ────────────────────────────────────────
// npm install -D @types/node    → types for Node.js
// npm install -D @types/react   → types for React
// npm install -D @types/lodash  → types for lodash

// These install .d.ts files that TypeScript auto-discovers
// No import needed — they're globally available once installed
```


## W — Why It Matters

`declare global` and module augmentation are the only safe way to add properties to `Express.Request` (auth middleware), `Window` (analytics plugins), or `next-auth` Session types — without modifying library source. Every enterprise TypeScript project has at least one `.d.ts` file doing this.

## I — Interview Q&A

**Q: What is the difference between a `.ts` file and a `.d.ts` file?**
A: A `.ts` file contains implementation (values + types, compiled to JavaScript). A `.d.ts` file contains only type declarations — no implementation, no runtime output. `.d.ts` files describe the shape of existing JavaScript to TypeScript without affecting the bundle.

**Q: When do you need `declare global` vs just declaring at the top level of a `.d.ts` file?**
A: If the file has no `import`/`export` statements, it's treated as a global script — declarations are automatically global. If it has any import/export (it's a module), you must use `declare global { }` to add to the global scope.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `declare global` in a non-module file having no effect | Add `export {}` to make it a module if you want `declare global` to work |
| Module augmentation not being picked up | Ensure the `.d.ts` file is included in `tsconfig.json`'s `include` or `typeRoots` |
| Double-declaring something that already has `@types` | Check if `@types/package` exists before writing manual declarations |

## K — Coding Challenge

**Write the `.d.ts` declarations for an analytics object injected by a CDN script:**

```ts
// window.analytics.track("purchase", { amount: 99 })
// window.analytics.identify("user-123")
// window.analytics.page()
```

**Solution:**

```ts
// analytics.d.ts
interface Analytics {
  track(event: string, props?: Record<string, unknown>): void
  identify(userId: string, traits?: Record<string, unknown>): void
  page(name?: string, props?: Record<string, unknown>): void
}

declare global {
  interface Window {
    analytics: Analytics
  }
}

export {}  // must be a module for declare global to work
```


***
