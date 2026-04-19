# 2 — `tsconfig.json` & Strict Mode

## T — TL;DR

`tsconfig.json` configures the TypeScript compiler — **always enable `strict: true`** for maximum type safety; it's the single most important setting.

## K — Key Concepts

### Creating a `tsconfig.json`

```bash
npx tsc --init
```

This generates a `tsconfig.json` with all options commented out.

### Essential `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### What `strict: true` Enables

`strict: true` is a shorthand that enables ALL of these:

| Flag | What It Does |
|------|-------------|
| `strictNullChecks` | `null` and `undefined` are not assignable to other types |
| `strictFunctionTypes` | Stricter function parameter checking |
| `strictBindCallApply` | Type-check `bind`, `call`, `apply` |
| `strictPropertyInitialization` | Class properties must be initialized or declared optional |
| `noImplicitAny` | Error on implicit `any` (untyped variables) |
| `noImplicitThis` | Error on `this` with implicit `any` type |
| `useUnknownInCatchVariables` | `catch(e)` gives `e: unknown` instead of `e: any` |
| `alwaysStrict` | Emits `"use strict"` in every file |

### `strictNullChecks` — The Most Important One

```ts
// Without strictNullChecks:
const name: string = null // ✅ allowed — crash waiting to happen

// With strictNullChecks:
const name: string = null // ❌ Type 'null' is not assignable to type 'string'

// Must be explicit:
const name: string | null = null // ✅ explicitly nullable
```

### `noImplicitAny` — No Untyped Code

```ts
// Without noImplicitAny:
function add(a, b) { return a + b } // a and b are implicitly `any`

// With noImplicitAny:
function add(a, b) { return a + b }
//          ^  ^ Parameter 'a' implicitly has an 'any' type
```

### `noUncheckedIndexedAccess` — Safe Object/Array Access

```ts
const arr = [1, 2, 3]

// Without noUncheckedIndexedAccess:
const x = arr[10] // type is `number` — but it's actually undefined!

// With noUncheckedIndexedAccess:
const x = arr[10] // type is `number | undefined` ✅
if (x !== undefined) {
  console.log(x.toFixed(2)) // safe
}
```

### Key `compilerOptions` Explained

| Option | Purpose |
|--------|---------|
| `target` | JS version to compile to (`ES2022` is safe for modern runtimes) |
| `module` | Module system (`ESNext` for modern, `CommonJS` for legacy Node) |
| `moduleResolution` | How imports are resolved (`bundler` for Vite/Webpack, `node16` for pure Node) |
| `outDir` | Where compiled `.js` files go |
| `rootDir` | Where source `.ts` files are |
| `declaration` | Generate `.d.ts` type definition files |
| `sourceMap` | Generate `.map` files for debugging |
| `isolatedModules` | Ensures each file can be compiled independently (required by esbuild/SWC) |
| `esModuleInterop` | Enables `import x from "cjs-module"` instead of `import * as x from "cjs-module"` |
| `skipLibCheck` | Skip type-checking `.d.ts` files (faster compilation) |

### Project References (Monorepo Setup)

```json
// tsconfig.json (root)
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/web" }
  ]
}
```

Each package has its own `tsconfig.json` with `"composite": true`.

## W — Why It Matters

- `strict: true` catches **entire categories** of bugs that slip through in non-strict mode.
- `noUncheckedIndexedAccess` prevents the #1 source of runtime `undefined` errors.
- A well-configured `tsconfig.json` is the foundation of every TypeScript project.
- Misconfigured `tsconfig` leads to false type safety — your types lie to you.
- Interview questions often test whether you understand what `strict` actually enables.

## I — Interview Questions with Answers

### Q1: What does `strict: true` do?

**A:** It's a shorthand that enables all strict type-checking options — `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictPropertyInitialization`, and more. It provides maximum type safety and should always be enabled.

### Q2: What is `strictNullChecks`?

**A:** When enabled, `null` and `undefined` are distinct types that can't be assigned to other types unless explicitly included in the type (e.g., `string | null`). Without it, `null` can be assigned to anything — a common source of runtime crashes.

### Q3: What is `noUncheckedIndexedAccess`?

**A:** Makes array/object index access return `T | undefined` instead of `T`. This forces you to handle the case where the accessed element doesn't exist.

### Q4: What is `isolatedModules` for?

**A:** Ensures each file can be independently transpiled without knowledge of other files. Required by fast transpilers like esbuild and SWC that process files one at a time.

## C — Common Pitfalls with Fix

### Pitfall: Starting a project without `strict: true`

```json
{ "compilerOptions": { "strict": false } }
// Everything compiles, but you have zero null safety
```

**Fix:** Always start with `strict: true`. It's much harder to enable strict mode on an existing codebase than to start with it.

### Pitfall: Not enabling `noUncheckedIndexedAccess`

```ts
const users: User[] = await fetchUsers()
const first = users[0] // type: User — but what if array is empty?
first.name // Runtime crash!
```

**Fix:** Enable `noUncheckedIndexedAccess`. Now `users[0]` is `User | undefined`, forcing a check.

### Pitfall: Using `skipLibCheck: false` in app code

This type-checks all `.d.ts` files from `node_modules`, which is slow and catches errors in third-party code you can't fix.

**Fix:** Use `skipLibCheck: true` for applications. Only disable for library development where you need strict `.d.ts` validation.

## K — Coding Challenge with Solution

### Challenge

Given this `tsconfig.json`, what errors will TypeScript catch?

```json
{ "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true } }
```

```ts
function getUser(id) {
  const users = [{ name: "Mark" }, { name: "Alex" }]
  const user = users[id]
  return user.name
}
```

### Solution

```ts
function getUser(id) {
//                ^^ Parameter 'id' implicitly has an 'any' type (noImplicitAny)

  const users = [{ name: "Mark" }, { name: "Alex" }]
  const user = users[id]
  // user is `{ name: string } | undefined` (noUncheckedIndexedAccess)

  return user.name
  //     ^^^^ 'user' is possibly 'undefined' (strictNullChecks)
}

// Fixed:
function getUser(id: number): string | undefined {
  const users = [{ name: "Mark" }, { name: "Alex" }]
  const user = users[id]
  return user?.name
}
```

Three errors caught — all real bugs that would crash at runtime.

---
