# 10 — Declaration Merging & Module Augmentation

## T — TL;DR

Declaration merging lets multiple `interface` declarations with the same name combine into one; module augmentation adds new types to an existing module's exports without modifying its source.

## K — Key Concepts

```ts
// ── Declaration merging — same name, merged type ───────────
interface Config { host: string }
interface Config { port: number }
interface Config { debug?: boolean }
// Merged: { host: string; port: number; debug?: boolean }
const config: Config = { host: "localhost", port: 3000 }  // ✅

// Function merging — creates overloads
function log(message: string): void
function log(level: "info" | "error", message: string): void
// Both declarations merged — two overloads exist

// Namespace merging — add members to a namespace
namespace Utils {
  export function format(s: string): string { return s.trim() }
}
namespace Utils {
  export function parse(s: string): number { return parseInt(s) }
}
// Utils.format AND Utils.parse both available

// Interface + namespace merging (for function + namespace pattern)
interface Point { x: number; y: number }
namespace Point {
  export function origin(): Point { return { x: 0, y: 0 } }
  export function distance(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }
}
const origin = Point.origin()           // ✅
const dist = Point.distance(p1, p2)     // ✅

// ── Module augmentation ────────────────────────────────────
// Add types to an existing module — most powerful use case

// 1. Extend Express Request (auth middleware pattern)
// types/express.d.ts
import "express"
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; role: "admin" | "user" }
    requestId: string
    correlationId?: string
  }
}

// 2. Extend next-auth Session
import "next-auth"
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "admin" | "user"
      organizationId: string
    }
  }
}

// 3. Extend Prisma models (add computed fields)
declare module "@prisma/client" {
  interface User {
    fullName: string  // computed, not in schema
  }
}

// ── Global augmentation from a module ─────────────────────
// Add to global scope while being in a module file
export {}  // makes it a module
declare global {
  interface Array<T> {
    groupBy<K extends string>(fn: (item: T) => K): Record<K, T[]>
  }
  interface String {
    truncate(maxLength: number): string
  }
}
```


## W — Why It Matters

Module augmentation is the standard pattern for typing middleware and plugins — without it, `req.user` in Express would be `any` after your auth middleware runs. Every major TypeScript library provides augmentation examples in their docs for exactly this reason.

## I — Interview Q&A

**Q: What are the limitations of module augmentation?**
A: Two key limits: (1) you cannot add new *top-level* declarations to an augmented module — only extend existing exported types; (2) default exports cannot be augmented — only named exports. Also, the augmenting file must import from the target module to ensure TypeScript includes the augmentation.

**Q: When would you use declaration merging vs module augmentation?**
A: Use declaration merging for your own `interface` types that multiple files contribute to (e.g., a plugin-extensible config). Use module augmentation to add properties to third-party module types (`express`, `next-auth`, `prisma`) that you don't own.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Module augmentation not being picked up | The `.d.ts` file must be included in `tsconfig.json` and must `import` from the augmented module |
| Augmenting a module's `default` export | Not possible — augment named exports only |
| Declaration merging on `type` aliases | Only `interface` merges — `type` aliases error on redeclaration |

## K — Coding Challenge

**Add a `currentUser` property to Express `Request` using module augmentation:**

```ts
// After auth middleware runs:
app.get("/profile", (req, res) => {
  req.currentUser.id  // should be typed, not any
})
```

**Solution:**

```ts
// types/express-augment.d.ts
import "express"

declare module "express-serve-static-core" {
  interface Request {
    currentUser: {
      id: string
      email: string
      role: "admin" | "user" | "guest"
    }
  }
}
```


***
