<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 7 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 7
TypeScript Foundations \& Project Setup
TypeScript purpose and adoption, static type checking, compile-time safety, editor tooling, gradual adoption from JavaScript, tsc, tsconfig.json, strict, target, module, moduleResolution, paths, baseUrl, esModuleInterop, isolatedModules, verbatimModuleSyntax, noEmit, noEmitOnError, skipLibCheck, forceConsistentCasingInFileNames, noImplicitReturns, noFallthroughCasesInSwitch, strictNullChecks, noImplicitAny, strictFunctionTypes, strictPropertyInitialization, strictBindCallApply, noUncheckedIndexedAccess, useUnknownInCatchVariables, primitive types, any, unknown, never, void, object, annotations and inference, Promise<T>, type alias vs interface, unions, intersections, optional and readonly properties, literal types, const assertions, keyof, typeof in type position, tuples, tsx/ts-node, ESLint, @typescript-eslint, Prettier.

Here is **Day 7 — TypeScript Foundations \& Project Setup** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 7 — TypeScript Foundations \& Project Setup

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the code. Move on.

***

# 1 — TypeScript Purpose, Static Typing \& Gradual Adoption

## T — TL;DR

TypeScript adds a static type layer on top of JavaScript — catching type errors at compile time (before runtime), enabling editor autocomplete, and scaling codebases to thousands of files safely.

## K — Key Concepts

```ts
// TypeScript catches errors BEFORE you run the code

// ❌ This is valid JavaScript — crashes at runtime
function greet(user) {
  return user.name.toUpperCase()
}
greet(null)  // 💥 TypeError: Cannot read properties of null

// ✅ TypeScript catches it at compile time
function greet(user: { name: string }) {
  return user.name.toUpperCase()
}
greet(null)
// ❌ Compile error: Argument of type 'null' is not assignable to
//                   parameter of type '{ name: string }'

// TypeScript advantages:
// 1. Editor tooling — autocomplete, hover types, go-to-definition
// 2. Refactoring safety — rename a property, TS finds all usages
// 3. API contracts — types serve as living documentation
// 4. Catches entire class of bugs: undefined access, wrong arg types

// Gradual adoption — TypeScript compiles to plain JavaScript
// You can add TypeScript incrementally:

// Step 1: Add tsconfig.json with allowJs: true
// Step 2: Rename files .js → .ts one at a time
// Step 3: Enable stricter options progressively

// JS file with JSDoc (TypeScript checks without renaming)
/** @param {string} name */
function hello(name) {
  return `Hello, ${name}`
}

// TypeScript is a SUPERSET — all valid JS is valid TS
// TS → compiles to → JS (the types are erased at runtime)
```


## W — Why It Matters

TypeScript is now used by over 80% of large JavaScript projects. Microsoft, Google, Airbnb, and Slack adopted it because bugs caught at compile time are dramatically cheaper than bugs in production. It also makes onboarding faster — a new engineer reads the types and immediately understands what a function expects and returns.

## I — Interview Q\&A

**Q: What is TypeScript and how does it relate to JavaScript?**
A: TypeScript is a statically-typed superset of JavaScript — all valid JS is valid TS. It adds optional type annotations that are checked at compile time by `tsc` and then erased, producing plain JavaScript. It adds zero runtime overhead.

**Q: What is the difference between a compile-time error and a runtime error?**
A: A compile-time error is caught by the TypeScript compiler before any code runs — you see it in your editor instantly. A runtime error only appears when the code actually executes. TypeScript converts a class of runtime crashes (`TypeError: Cannot read properties of undefined`) into immediate compile-time feedback.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `any` everywhere to silence errors | `any` disables all type checking — defeats the purpose |
| Thinking TypeScript makes runtime errors impossible | TS only checks types at compile time — runtime errors can still occur (e.g., failed network requests) |
| Gradual adoption meaning "never enabling strict mode" | Progressively enable stricter options — the goal is full `strict: true` |

## K — Coding Challenge

**Add types to this JavaScript function:**

```ts
function getFullName(user) {
  return `${user.firstName} ${user.lastName}`
}
getFullName({ firstName: "Alice", lastName: "Smith" })
```

**Solution:**

```ts
type User = {
  firstName: string
  lastName: string
}

function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```


***

# 2 — `tsc`, `tsconfig.json` Core Options: `strict`, `target`, `module`, `moduleResolution`

## T — TL;DR

`tsconfig.json` is the master config file — `strict` enables all safety checks at once, `target` controls output JS version, `module` controls import/export format, and `moduleResolution` controls how imports are resolved.[^3][^1]

## K — Key Concepts

```json
// tsconfig.json — 2025 recommended baseline
{
  "compilerOptions": {
    // ── Type Checking ────────────────────────────────────
    "strict": true,                    // enables ALL strict family flags
    "noUncheckedIndexedAccess": true,  // arr[^0] becomes T | undefined
    "noImplicitOverride": true,        // must use `override` keyword in subclasses
    "noFallthroughCasesInSwitch": true,// switch cases must break/return
    "noUnusedLocals": true,            // error on unused variables
    "noUnusedParameters": true,        // error on unused function params

    // ── Output ───────────────────────────────────────────
    "target": "ES2022",     // output JS version (es5, es6, ES2022, ESNext)
    "lib": ["ES2023", "DOM", "DOM.Iterable"],  // type definitions included
    "outDir": "./dist",     // compiled files go here
    "rootDir": "./src",     // source files root

    // ── Modules ──────────────────────────────────────────
    "module": "ESNext",              // output module format (CommonJS, ESNext, NodeNext)
    "moduleResolution": "Bundler",   // how imports are resolved (Node, NodeNext, Bundler)
    "resolveJsonModule": true,       // allows `import data from "./data.json"`
    "verbatimModuleSyntax": true,    // type imports must use `import type`

    // ── Interop ──────────────────────────────────────────
    "esModuleInterop": true,         // allows `import fs from "fs"` (not just `import * as fs`)
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,         // each file compiled independently (required by Vite, esbuild)
    "skipLibCheck": true,            // skip type-checking .d.ts in node_modules (speeds up build)
    "forceConsistentCasingInFileNames": true,  // prevent case bugs on case-insensitive OSes

    // ── Emit ─────────────────────────────────────────────
    "noEmit": false,        // true = type-check only, no JS output (great with bundlers)
    "noEmitOnError": true,  // don't write output if there are type errors
    "declaration": true,    // generate .d.ts declaration files
    "sourceMap": true       // generate .map files for debugging
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```bash
# Running tsc
npx tsc              # compile using tsconfig.json
npx tsc --noEmit     # type-check only, no files written
npx tsc --watch      # watch mode
npx tsc --init       # generate a starter tsconfig.json
```


## W — Why It Matters

`moduleResolution: "Bundler"` is the modern choice for Vite/esbuild projects — it matches what bundlers actually do (no extension required on imports). `isolatedModules: true` ensures every file can be transpiled independently, which is required by fast transpilers like esbuild and SWC.[^5][^3]

## I — Interview Q\&A

**Q: What does `noEmit: true` do and when would you use it?**
A: It tells TypeScript to perform type checking but write no output files. Use this when a bundler (Vite, esbuild) handles transpilation — you only want TypeScript for its type checking, not its compiler output.

**Q: What's the difference between `moduleResolution: "Node"` vs `"Bundler"` vs `"NodeNext"`?**
A: `Node` (legacy) mimics Node.js CommonJS resolution. `NodeNext` matches Node.js ESM resolution — requires explicit extensions in imports. `Bundler` matches modern bundlers like Vite/webpack that don't require extensions and resolve `package.json` exports. Use `Bundler` for Vite projects, `NodeNext` for Node.js ESM projects.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `"strict": false` on a new project | Start with `strict: true` — much harder to enable later |
| `skipLibCheck: false` causing slow builds | `skipLibCheck: true` in most apps — only check your own code |
| `target: "ES5"` in a modern project | Use `ES2022` or `ESNext` unless you need IE11 support |
| `isolatedModules: false` with Vite/esbuild | Always set `true` — these tools require it |

## K — Coding Challenge

**What's wrong with this tsconfig for a Vite project?**

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "isolatedModules": false,
    "noEmit": false
  }
}
```

**Solution:**

```json
{
  "compilerOptions": {
    "module": "ESNext",          // Vite uses ESM, not CJS
    "moduleResolution": "Bundler", // match Vite's resolution
    "isolatedModules": true,     // required for esbuild transpilation
    "noEmit": true               // Vite handles bundling, not tsc
  }
}
```


***

# 3 — Key `tsconfig` Flags: `paths`, `baseUrl`, `esModuleInterop`, `verbatimModuleSyntax`

## T — TL;DR

`paths` + `baseUrl` enable absolute import aliases; `esModuleInterop` fixes CJS default import syntax; `verbatimModuleSyntax` enforces `import type` — preventing type-only imports from emitting real `import` statements.[^6][^3]

## K — Key Concepts

```json
// tsconfig.json paths + baseUrl
{
  "compilerOptions": {
    "baseUrl": ".",        // root for path resolution
    "paths": {
      "@/*": ["./src/*"],         // @/utils → src/utils
      "@components/*": ["./src/components/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

```ts
// Without paths — relative hell
import { Button } from "../../../../components/ui/Button"

// With paths alias — clean
import { Button } from "@/components/ui/Button"
import type { User } from "@types/User"  // ← note `import type`

// ── esModuleInterop ──────────────────────────────────────
// Without esModuleInterop: true:
import * as fs from "fs"          // only safe way for CJS modules

// With esModuleInterop: true:
import fs from "fs"               // clean default import — works!
import express from "express"     // ✅ no more `import * as express`

// ── verbatimModuleSyntax ─────────────────────────────────
// This flag ensures type-only imports use `import type`
// Prevents bundlers from emitting empty `import` statements

// ❌ Without verbatimModuleSyntax:
import { User } from "./types"    // may emit as real import (no value!)

// ✅ With verbatimModuleSyntax: true:
import type { User } from "./types"   // erased at compile time — correct
import { createUser } from "./user"   // kept — it's a value import

// Mixing value and type imports
import { createUser, type User } from "./user"  // ✅ inline `type` modifier

// ── isolatedModules detail ──────────────────────────────
// Each file must be a module (have at least one import/export)
// Re-exporting types MUST use `export type`
export type { User }   // ✅ with isolatedModules
export { User }        // ❌ esbuild can't tell if User is a type or value
```


## W — Why It Matters

`verbatimModuleSyntax` was introduced specifically to prevent the class of bugs where TypeScript emits a `require()` or `import` for something that's purely a type — causing runtime errors when the imported module has side effects or doesn't export a runtime value. It's the recommended setting for all new projects.[^3]

## I — Interview Q\&A

**Q: What does `esModuleInterop` do?**
A: It adds helper functions that allow `import defaultExport from "cjsModule"` to work for CommonJS modules that don't have a proper default export. Without it, you'd need `import * as defaultExport from "cjsModule"`. It's enabled by default in most TS templates.

**Q: What is the difference between `import { User }` and `import type { User }`?**
A: `import type` is erased completely at compile time — it only exists for type checking. Regular `import` may emit as a runtime import statement. With `verbatimModuleSyntax: true`, TypeScript enforces that type-only imports use `import type`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `paths` working in tsc but not at runtime | Paths are TS-only — configure the bundler/runtime too (Vite: `resolve.alias`, Node: `tsconfig-paths`) |
| Forgetting `baseUrl` when using `paths` | `paths` requires `baseUrl` to be set |
| `export { SomeType }` failing with `isolatedModules` | Use `export type { SomeType }` |

## K — Coding Challenge

**Set up path aliases so these imports work:**

```ts
import { Button } from "@ui/Button"
import type { ApiResponse } from "@types/api"
import { fetchUser } from "@api/users"
```

**Solution:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["./src/components/ui/*"],
      "@types/*": ["./src/types/*"],
      "@api/*": ["./src/api/*"]
    }
  }
}
```


***

# 4 — Strict Mode Family Flags Explained

## T — TL;DR

`"strict": true` is a shortcut that enables 8+ individual flags — understanding each one tells you exactly what category of bug it catches.[^7][^8][^1]

## K — Key Concepts

```ts
// ── What "strict": true enables ──────────────────────────

// 1. noImplicitAny — must annotate when TS can't infer type
function parse(data) { return data }       // ❌ implicit any
function parse(data: unknown) { return data } // ✅

// 2. strictNullChecks — null/undefined are NOT assignable to other types
let name: string = null    // ❌ Type 'null' is not assignable to 'string'
let name: string | null = null  // ✅

// 3. strictFunctionTypes — function parameter types are checked contravariantly
type Fn = (x: string | number) => void
const fn: Fn = (x: string) => {}  // ❌ — too narrow, can't handle number

// 4. strictPropertyInitialization — class properties must be initialized
class User {
  name: string     // ❌ Property 'name' has no initializer
  name: string = "" // ✅
  name!: string    // ✅ definite assignment assertion (use sparingly)
}

// 5. strictBindCallApply — .bind/.call/.apply are type-checked
function greet(name: string) { return `Hi ${name}` }
greet.call(null, 42)  // ❌ Argument of type 'number' not assignable to 'string'

// 6. useUnknownInCatchVariables — catch(err) gets `unknown` not `any`
try { /* ... */ } catch (err) {
  err.message          // ❌ Object is of type 'unknown'
  if (err instanceof Error) {
    err.message        // ✅ narrowed to Error
  }
}

// ── Beyond strict ─────────────────────────────────────────

// 7. noUncheckedIndexedAccess — index signatures return T | undefined
const arr = [1, 2, 3]
const first = arr[^0]    // type: number | undefined (not just number!)
const safe = arr[^0] ?? 0  // ✅ handle undefined

const record: Record<string, number> = { a: 1 }
const val = record["b"]  // type: number | undefined — not just number!

// 8. noImplicitReturns — all code paths must return
function getLabel(status: string): string {
  if (status === "ok") return "OK"
  // ❌ Not all code paths return a value
}

// 9. noFallthroughCasesInSwitch
switch (status) {
  case "a":
    doA()   // ❌ falls through to case "b" without break
  case "b":
    doB()
    break
}
```

| Flag | Catches |
| :-- | :-- |
| `noImplicitAny` | Parameters/variables inferred as `any` |
| `strictNullChecks` | Null/undefined access on non-nullable types |
| `strictFunctionTypes` | Unsafe function parameter contravariance |
| `strictPropertyInitialization` | Class properties not initialized in constructor |
| `strictBindCallApply` | Wrong args to `.call`/`.apply`/`.bind` |
| `useUnknownInCatchVariables` | Unsafe `any` in catch blocks |
| `noUncheckedIndexedAccess` | Array/record indexing returning `T` instead of `T \| undefined` |

## W — Why It Matters

`noUncheckedIndexedAccess` is arguably the most impactful non-`strict` flag — it catches the entire class of "index out of bounds" bugs that `strict: true` misses. `useUnknownInCatchVariables` forces proper error handling in catch blocks instead of blindly accessing `.message`.[^9][^10]

## I — Interview Q\&A

**Q: What does `strictNullChecks` do and why is it so important?**
A: With `strictNullChecks: true`, `null` and `undefined` are their own distinct types — they cannot be assigned to `string`, `number`, etc. without explicitly typing as `string | null`. Without it, any variable can silently be `null`, causing runtime crashes that TypeScript doesn't warn you about.

**Q: What is `noUncheckedIndexedAccess` and what does it prevent?**
A: It makes array index access and object index signature lookups return `T | undefined` instead of just `T`. This forces you to handle the case where the index doesn't exist — preventing the common bug of accessing `arr[^0]` on a possibly-empty array. [^10]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Suppressing `strictPropertyInitialization` with `!` everywhere | Only use `!` (definite assignment) when you truly guarantee initialization (e.g., `@ViewChild`) |
| `catch (err) { err.message }` failing after enabling `useUnknownInCatchVariables` | Check: `if (err instanceof Error) { err.message }` |
| `noUncheckedIndexedAccess` requiring null checks on every array access | Use optional chaining: `arr[^0]?.property` or `arr[^0] ?? defaultValue` |

## K — Coding Challenge

**Fix all type errors introduced by enabling `strict: true` and `noUncheckedIndexedAccess`:**

```ts
function firstItem(arr) {
  return arr[^0].toUpperCase()
}

class Counter {
  count: number
  increment() { this.count++ }
}
```

**Solution:**

```ts
function firstItem(arr: string[]): string {
  const item = arr[^0]  // string | undefined with noUncheckedIndexedAccess
  if (item === undefined) throw new Error("Empty array")
  return item.toUpperCase()
}

class Counter {
  count: number = 0  // initialized — satisfies strictPropertyInitialization
  increment() { this.count++ }
}
```


***

# 5 — Primitive Types, `any`, `unknown`, `never`, `void`

## T — TL;DR

`unknown` is the safe `any` — you must narrow before using it; `never` is the impossible type (empty union, exhausted switch); `void` means "intentionally returns nothing."[^11]

## K — Key Concepts

```ts
// ── Primitive types ───────────────────────────────────────
let str: string = "hello"
let num: number = 42
let bool: boolean = true
let big: bigint = 9007199254740993n
let sym: symbol = Symbol("id")
let undef: undefined = undefined
let nul: null = null

// ── any — opt out of type checking entirely ───────────────
let x: any = "hello"
x.anything()       // ✅ no error — TypeScript trusts you completely
x = 42             // ✅
let y: string = x  // ✅ — any is assignable to anything
// any is contagious — it spreads to anything you assign it to
// Avoid: any is a lie to the type system

// ── unknown — safe any ────────────────────────────────────
let val: unknown = fetchDataFromAnywhere()
val.toUpperCase()             // ❌ Object is of type 'unknown'
(val as string).toUpperCase() // ❌ type assertion — unsafe

// Must NARROW before use
if (typeof val === "string") {
  val.toUpperCase()   // ✅ TypeScript knows it's a string here
}
if (val instanceof Error) {
  val.message         // ✅
}

// unknown in catch blocks (useUnknownInCatchVariables)
try { /* risky */ }
catch (err: unknown) {
  if (err instanceof Error) console.error(err.message)
  else console.error("Unknown error:", String(err))
}

// ── never — the empty type / impossible value ─────────────
// 1. Functions that never return (throw or infinite loop)
function fail(msg: string): never {
  throw new Error(msg)
}

function infinite(): never {
  while (true) {}
}

// 2. Exhaustive switch — never is what remains after all cases
type Shape = "circle" | "square" | "triangle"
function area(shape: Shape): number {
  switch (shape) {
    case "circle":   return Math.PI
    case "square":   return 1
    case "triangle": return 0.5
    default:
      const _exhaustiveCheck: never = shape  // ← TS error if case missing!
      throw new Error(`Unhandled shape: ${_exhaustiveCheck}`)
  }
}

// 3. Impossible intersections
type Impossible = string & number  // never

// ── void — no meaningful return value ─────────────────────
function log(msg: string): void {
  console.log(msg)
  // no return needed
}

// void vs undefined:
// void = "don't use the return value" (function may return undefined)
// undefined = the value IS undefined specifically
type Callback = () => void   // caller won't use return value
type GetUndef = () => undefined  // must explicitly return undefined
```


## W — Why It Matters

`unknown` is the correct type for values from external sources (API responses, `JSON.parse`, error objects, user input) — it forces validation before use. `never` enables exhaustive switch checking — add a case to a union and TypeScript will error in every switch that doesn't handle it.[^11]

## I — Interview Q\&A

**Q: What's the difference between `any` and `unknown`?**
A: Both accept any value. But `any` disables all type checking — you can do anything with it. `unknown` keeps type safety — you must narrow the type (with `typeof`, `instanceof`, or type guards) before performing operations. Use `unknown` for values you don't control; avoid `any`.[^11]

**Q: When does TypeScript infer a type as `never`?**
A: In three situations: (1) a function that always throws or loops forever, (2) an empty union type (`string & number`), and (3) a narrowed variable where all union members have been eliminated (e.g., `if typeof x === "string"` then `else if typeof x === "number"` — in a final `else`, x is `never`).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `any` in catch blocks before TS 4.4 | Enable `useUnknownInCatchVariables` or annotate `catch (err: unknown)` |
| Returning a value from a `void` function expecting no errors | `void` return IS allowed — just unused; `never` means it truly doesn't return |
| Using `as any` to silence errors | Fix the underlying type mismatch — `as any` hides real bugs |
| `never` in exhaustive checks not triggering | Must assign to `never`: `const _: never = myVar` — the assignment causes the error |

## K — Coding Challenge

**Write a type-safe JSON parse that returns `unknown` and a narrower that validates user shape:**

```ts
const data = safeJsonParse('{"name":"Alice","age":28}')
// data: unknown — must narrow before use
```

**Solution:**

```ts
function safeJsonParse(json: string): unknown {
  try { return JSON.parse(json) }
  catch { return undefined }
}

function isUser(val: unknown): val is { name: string; age: number } {
  return (
    typeof val === "object" && val !== null &&
    "name" in val && typeof (val as any).name === "string" &&
    "age" in val && typeof (val as any).age === "number"
  )
}

const data = safeJsonParse('{"name":"Alice","age":28}')
if (isUser(data)) {
  console.log(data.name.toUpperCase())  // ✅ safely narrowed
}
```


***

# 6 — Type Annotations, Inference \& `Promise<T>`

## T — TL;DR

TypeScript infers most types automatically — annotate function signatures, not variable assignments; `Promise<T>` types async return values so callers know what they'll receive.

## K — Key Concepts

```ts
// ── Type Inference — TS infers from value ────────────────
const name = "Alice"       // inferred: string
const age = 28             // inferred: number
const items = [1, 2, 3]   // inferred: number[]
const user = { id: 1, name: "Alice" }  // inferred: { id: number, name: string }

// ❌ Redundant annotation (TS already knows)
const x: string = "hello"   // unnecessary

// ✅ Annotate when TS can't infer or when signature matters
function add(a: number, b: number): number {  // ✅ parameters need types
  return a + b
}

// Function return type — optional but recommended for complex functions
function parseUser(json: string): User {      // explicit return type
  return JSON.parse(json) as User
}

// ── Promise<T> ────────────────────────────────────────────
// Annotate async functions with Promise<T>
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<User>
}

// void for async functions with no meaningful return
async function saveUser(user: User): Promise<void> {
  await db.save(user)
}

// Promise<T | null> — may return nothing
async function findUser(id: number): Promise<User | null> {
  const user = await db.findOne({ id })
  return user ?? null
}

// Typing the resolved value directly
const result: User = await fetchUser(1)  // result is User (await unwraps Promise)

// Generic async helper
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

// Usage — T is inferred at callsite
const users = await fetchJson<User[]>("/api/users")
// users: User[]
```


## W — Why It Matters

TypeScript's inference is excellent for local variables — manually annotating everything creates noise. But function signatures should always be annotated: they form the "contract" between caller and implementation, and TypeScript uses them to provide autocomplete for API consumers.

## I — Interview Q\&A

**Q: When should you annotate types vs. letting TypeScript infer?**
A: Annotate: function parameters (TS can't infer), function return types (optional but good for complex functions), class properties, and `const` variables where the inferred type is too wide (e.g., `const status = "active"` infers `string`, but you want `"active"`). Let TS infer local variables — it's usually accurate.

**Q: What does `Promise<void>` mean for an async function?**
A: The function returns a Promise that resolves with no meaningful value. Callers can `await` it to know when it's done, but should not use the resolved value. It's the correct type for side-effect-only async functions.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `async function fn(): User` (missing Promise wrapper) | Always `Promise<User>` — async functions always return Promises |
| `res.json()` typed as `any` | Cast explicitly: `res.json() as Promise<User>` or use a generic wrapper |
| Over-annotating every local variable | Trust inference for locals — annotate function boundaries |

## K — Coding Challenge

**Type this generic fetch helper correctly:**

```ts
async function get(url) {
  const res = await fetch(url)
  return res.json()
}
// get("/api/users") should return Promise<User[]> when called with <User[]>
```

**Solution:**

```ts
async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

const users = await get<User[]>("/api/users")  // users: User[]
```


***

# 7 — `type` Alias vs `interface`

## T — TL;DR

`interface` is for describing object shapes (especially public APIs, class contracts, and things that need declaration merging); `type` is for everything else — unions, intersections, mapped types, conditional types.[^4][^12]

## K — Key Concepts

```ts
// ── Interface ─────────────────────────────────────────────
interface User {
  id: number
  name: string
  email?: string        // optional
  readonly createdAt: Date  // readonly
}

// Interface extension
interface AdminUser extends User {
  role: "admin"
  permissions: string[]
}

// Declaration merging — interfaces can be reopened and merged
interface Window {
  myPlugin: () => void   // extend the global Window type
}
// TS merges both definitions — powerful for module augmentation

// ── Type Alias ────────────────────────────────────────────
type User = {
  id: number
  name: string
}

// Type intersection (similar to interface extends)
type AdminUser = User & {
  role: "admin"
  permissions: string[]
}

// ── What ONLY type aliases can do ─────────────────────────
// Unions
type Status = "pending" | "active" | "inactive"
type ID = string | number
type Result<T> = { data: T; error: null } | { data: null; error: Error }

// Mapped types
type Partial<T> = { [K in keyof T]?: T[K] }
type Readonly<T> = { readonly [K in keyof T]: T[K] }

// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T

// Tuple types
type Point = [number, number]
type Pair<A, B> = [A, B]

// Primitive aliases
type UserID = string
type Timestamp = number

// ── What ONLY interface can do ────────────────────────────
// Declaration merging
interface Config { host: string }
interface Config { port: number }
// Merged: { host: string; port: number }

// Classes implementing interfaces
interface Serializable {
  serialize(): string
}
class User implements Serializable {
  serialize() { return JSON.stringify(this) }
}
```

|  | `type` | `interface` |
| :-- | :-- | :-- |
| Object shapes | ✅ | ✅ |
| Union types | ✅ | ❌ |
| Intersection | ✅ (`&`) | ✅ (`extends`) |
| Declaration merging | ❌ | ✅ |
| `implements` in class | ✅ | ✅ |
| Mapped/conditional types | ✅ | ❌ |
| Primitives/tuples/functions | ✅ | ❌ |

## W — Why It Matters

The rule of thumb: use `interface` for object shapes that might be extended or augmented (library types, React component props, API response shapes) and `type` for everything else. TypeScript's error messages tend to be clearer for `interface` because it can display the shape directly, whereas `type` intersections may appear as opaque types in errors.[^12][^4]

## I — Interview Q\&A

**Q: When should you use `interface` vs `type`?**
A: Use `interface` for: object shapes in public APIs (extendable), class contracts (`implements`), and global module augmentation (declaration merging). Use `type` for: unions, intersections, tuples, conditional/mapped types, and anything that's not purely an object shape. In practice, most teams pick one and use the other only when required.

**Q: What is declaration merging and why does it matter?**
A: Declaration merging lets you `declare` an `interface` multiple times across files — TypeScript merges them into one type. It's used to extend third-party types (e.g., adding properties to Express's `Request`) and global interfaces like `Window`. `type` aliases cannot be merged.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `interface` for union types | Unions require `type`: `type Status = "a" \| "b"` |
| Expecting `type` aliases to merge | They don't — only `interface` merges |
| `type A = B & C & D` causing cryptic error messages | Consider `interface A extends B, C, D` for clearer errors |

## K — Coding Challenge

**Decide: `type` or `interface` for each:**

```ts
// 1. Shape of an API response
// 2. Union of allowed HTTP methods
// 3. A class that can be serialized
// 4. A partial version of an existing type
```

**Solution:**

```ts
// 1. interface — object shape, extendable
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

// 2. type — union
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

// 3. interface — class contract
interface Serializable {
  serialize(): string
  deserialize(s: string): this
}

// 4. type — mapped type utility
type PartialUser = Partial<User>
```


***

# 8 — Unions, Intersections, Optional \& Readonly Properties

## T — TL;DR

Unions (`A | B`) model "one of these types"; intersections (`A & B`) model "all of these types combined" — use discriminated unions with a literal `type` field for type-safe variant modeling.

## K — Key Concepts

```ts
// ── Union types ───────────────────────────────────────────
type StringOrNumber = string | number
type Status = "pending" | "active" | "failed"

function format(val: string | number): string {
  return String(val)
}

// Narrowing unions
function process(val: string | number) {
  if (typeof val === "string") {
    return val.toUpperCase()  // string here
  }
  return val.toFixed(2)       // number here
}

// Discriminated union — literal field discriminates variants
type Shape =
  | { kind: "circle";   radius: number }
  | { kind: "square";   side: number }
  | { kind: "rectangle"; width: number; height: number }

function area(shape: Shape): number {
  switch (shape.kind) {         // TypeScript narrows by `kind`
    case "circle":    return Math.PI * shape.radius ** 2
    case "square":    return shape.side ** 2
    case "rectangle": return shape.width * shape.height
  }
}

// ── Intersection types ────────────────────────────────────
type Timestamps = { createdAt: Date; updatedAt: Date }
type Identifiable = { id: string }

type Entity = Identifiable & Timestamps & {
  name: string
}
// Entity = { id: string, createdAt: Date, updatedAt: Date, name: string }

// ── Optional properties ───────────────────────────────────
interface Config {
  host: string
  port?: number           // optional — number | undefined
  debug?: boolean
}
const config: Config = { host: "localhost" }  // port and debug omitted ✅

// ── Readonly properties ───────────────────────────────────
interface Point {
  readonly x: number
  readonly y: number
}
const p: Point = { x: 1, y: 2 }
p.x = 3  // ❌ Cannot assign to 'x' because it is read-only

// Readonly array
const nums: readonly number[] = [1, 2, 3]
// or: ReadonlyArray<number>
nums.push(4)  // ❌ Property 'push' does not exist on type 'readonly number[]'

// Readonly<T> utility type — makes all properties readonly
type ImmutableUser = Readonly<User>
```


## W — Why It Matters

Discriminated unions are the TypeScript pattern for modeling variant data (API responses, Redux actions, form states, error types). The `kind`/`type`/`tag` field lets TypeScript narrow the type in `switch` statements — eliminating entire classes of "property doesn't exist" errors while providing exhaustive checking.

## I — Interview Q\&A

**Q: What is a discriminated union and why is it preferred for variant types?**
A: A discriminated union has a shared literal property (called the discriminant, e.g., `kind: "circle"`) that uniquely identifies each variant. TypeScript uses this to narrow types in `switch`/`if` blocks — providing full type safety for each variant's specific properties without manual type assertions.

**Q: What's the difference between `optional` property (`key?: T`) and `key: T | undefined`?**
A: `key?: T` means the property can be absent from the object entirely. `key: T | undefined` means the property must be present but can be `undefined`. With `exactOptionalPropertyTypes` enabled, TS treats these differently — a `key?: T` property must not be set to `undefined` explicitly.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Union type access without narrowing | Always narrow first with `typeof`, `instanceof`, or discriminant check |
| `A & B` where A and B have conflicting property types | Results in `never` for that property — check for conflicts |
| Using `Readonly<T>` thinking it deep-freezes | `Readonly` is shallow — nested objects remain mutable |

## K — Coding Challenge

**Model an API response that can succeed with data or fail with an error:**

```ts
// fetchUser() should return:
// { status: "ok", user: User } on success
// { status: "error", code: number, message: string } on failure
```

**Solution:**

```ts
type UserResponse =
  | { status: "ok";    user: User }
  | { status: "error"; code: number; message: string }

async function fetchUser(id: number): Promise<UserResponse> {
  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) return { status: "error", code: res.status, message: res.statusText }
    const user = await res.json() as User
    return { status: "ok", user }
  } catch {
    return { status: "error", code: 0, message: "Network error" }
  }
}

// Usage — TypeScript narrows correctly:
const result = await fetchUser(1)
if (result.status === "ok") {
  console.log(result.user.name)     // ✅ user is available
} else {
  console.error(result.message)    // ✅ message is available
}
```


***

# 9 — Literal Types, `const` Assertions, `keyof` \& `typeof` in Type Position

## T — TL;DR

Literal types narrow from wide (`string`) to specific (`"active"`); `const` assertions lock inferred types to their narrowest literals; `keyof` extracts the keys of a type; `typeof` in type position captures the type of a value.

## K — Key Concepts

```ts
// ── Literal types ─────────────────────────────────────────
type Direction = "north" | "south" | "east" | "west"
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6
type BoolLike = true | false   // same as boolean

// Without literal types — too wide
const dir = "north"      // inferred: string
let dir2 = "north"       // inferred: string (let allows reassignment)
const dir3: Direction = "north"  // narrowed to Direction

// ── const assertions — as const ───────────────────────────
// Infers narrowest possible literal type for entire structure
const status = "active" as const
// type: "active" (not string)

const config = {
  host: "localhost",
  port: 3000,
  debug: false
} as const
// type: { readonly host: "localhost"; readonly port: 3000; readonly debug: false }
// All properties become readonly + literal typed

const directions = ["north", "south", "east", "west"] as const
// type: readonly ["north", "south", "east", "west"] — a TUPLE, not string[]
type Direction = typeof directions[number]  // "north" | "south" | "east" | "west"

// ── keyof — extract keys of a type ────────────────────────
type User = { id: number; name: string; email: string }
type UserKey = keyof User    // "id" | "name" | "email"

function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { id: 1, name: "Alice", email: "a@b.com" }
getField(user, "name")   // ✅ returns string
getField(user, "id")     // ✅ returns number
getField(user, "role")   // ❌ Argument of type '"role"' is not assignable to keyof User

// keyof typeof for objects
const COLORS = { red: "#ff0000", green: "#00ff00", blue: "#0000ff" } as const
type ColorName = keyof typeof COLORS  // "red" | "green" | "blue"
type ColorValue = typeof COLORS[ColorName]  // "#ff0000" | "#00ff00" | "#0000ff"

// ── typeof in type position ────────────────────────────────
// Capture the TYPE of a value
const defaultConfig = { host: "localhost", port: 3000 }
type Config = typeof defaultConfig   // { host: string; port: number }

function createConfig(overrides: Partial<typeof defaultConfig>) {
  return { ...defaultConfig, ...overrides }
}

// typeof function — for callbacks that match a function signature
function greet(name: string): string { return `Hi ${name}` }
type GreetFn = typeof greet   // (name: string) => string

// ReturnType utility — leverages typeof
type GreetReturn = ReturnType<typeof greet>  // string
```


## W — Why It Matters

`as const` is the idiomatic way to create type-safe enums/constants in TypeScript — better than `enum` for most cases because values are plain strings (easier to serialize, no runtime overhead). The `keyof typeof` pattern is foundational for typed object access utilities used in every TypeScript codebase.

## I — Interview Q\&A

**Q: What does `as const` do to an object?**
A: It tells TypeScript to infer the narrowest possible types — all string values become string literals (not `string`), numbers become literal numbers, and all properties become `readonly`. This turns a plain object into an immutable type-safe constant with literal types throughout.

**Q: What's the difference between `typeof` as a JavaScript operator vs. in TypeScript type position?**
A: `typeof` in JavaScript is a runtime operator returning a string (`"string"`, `"object"`, etc.). In TypeScript type position (after `:` or `=`), `typeof x` captures the **compile-time type** of variable `x` — it's resolved by the type system, not at runtime.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `let x = "north"` inferring `string` instead of `"north"` | Use `const` or `as const` or annotate: `let x: "north" = "north"` |
| `keyof T` including `symbol` and `number` unexpectedly | `keyof T` = `string \| number \| symbol` — use `Extract<keyof T, string>` for string-only keys |
| `as const` on mutable variable trying to mutate it | `as const` makes it `readonly` — TypeScript will error on mutation |

## K — Coding Challenge

**Build a typed `pick` function using `keyof`:**

```ts
pick({ id: 1, name: "Alice", role: "admin" }, ["id", "name"])
// returns: { id: number, name: string } — typed correctly
```

**Solution:**

```ts
function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(k => { result[k] = obj[k] })
  return result
}
```


***

# 10 — Tuples

## T — TL;DR

Tuples are fixed-length arrays where each position has a known type — use them for coordinate pairs, function returns with multiple values, and labeled rest elements.

## K — Key Concepts

```ts
// Basic tuple — fixed order, fixed types
type Point = [number, number]
const p: Point = [1, 2]       // ✅
const p2: Point = [1, 2, 3]   // ❌ Source has 3 element(s) but target allows only 2

// Accessing tuple elements
const [x, y] = p              // destructuring — x: number, y: number
p[^0]                          // number
p[^2]                          // ❌ Tuple type 'Point' of length '2' has no index '2'

// Named tuple elements (TypeScript 4.0+)
type Range = [start: number, end: number]
type RGB = [red: number, green: number, blue: number]

// Optional tuple elements
type Foo = [string, number?]  // second element optional
const a: Foo = ["hi"]         // ✅
const b: Foo = ["hi", 42]     // ✅

// Rest elements in tuples
type StringsAndNumber = [...string[], number]
const t: StringsAndNumber = ["a", "b", 42]  // ✅ strings then a number

// Labeled rest
type Args = [first: string, ...rest: number[]]

// Readonly tuple
type ImmutablePoint = readonly [number, number]
const rp: ImmutablePoint = [1, 2]
rp[^0] = 3  // ❌ Cannot assign to '0' because it is a read-only property

// Common use case: function returning multiple values
function minMax(nums: number[]): [min: number, max: number] {
  return [Math.min(...nums), Math.max(...nums)]
}
const [min, max] = minMax([3, 1, 4, 1, 5, 9])
// min: number, max: number — labeled names appear in intellisense!

// Tuple vs array
const arr: number[] = [1, 2, 3]      // variable length, uniform type
const tuple: [number, string] = [1, "one"]  // fixed length, mixed types

// as const creating tuple
const coords = [40.7128, -74.0060] as const
// type: readonly [40.7128, -74.006] — a literal tuple, not number[]
```


## W — Why It Matters

Tuples are essential for typed hooks and React patterns — `useState` returns a tuple `[T, Dispatch<SetStateAction<T>>]`. Named tuple elements appear in IDE tooltips as parameter names, dramatically improving the API of utility functions that return multiple values.

## I — Interview Q\&A

**Q: When should you use a tuple instead of an object for a multi-value return?**
A: Use tuples for small (2–3 element) ordered return values with clear semantic position — `[min, max]`, `[value, setter]`. Use objects when there are more values, naming improves clarity, or callers might want only some properties. Named tuple elements are a middle ground.

**Q: What's the difference between `[string, number]` and `(string | number)[]`?**
A: `[string, number]` is a tuple — exactly 2 elements, first is `string`, second is `number`. `(string | number)[]` is a variable-length array where each element can be either `string` or `number`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `[1, 2]` being inferred as `number[]` not a tuple | Use `as const` or annotate: `const p: [number, number] = [1, 2]` |
| Destructuring more than tuple length | TypeScript errors if you try to access index beyond tuple length |
| Swapping tuple position (confusing x/y) | Use named tuples: `[x: number, y: number]` for IntelliSense hints |

## K — Coding Challenge

**Type a `useState`-like hook returning a tuple:**

```ts
const [count, setCount] = useCounter(0)
count      // number
setCount   // (n: number) => void
```

**Solution:**

```ts
function useCounter(initial: number): [count: number, setCount: (n: number) => void] {
  let count = initial
  const setCount = (n: number) => { count = n }
  return [count, setCount]
}
```


***

# 11 — `tsx`, `ts-node`, ESLint \& Prettier

## T — TL;DR

`.tsx` enables JSX in TypeScript files; `ts-node` runs TypeScript directly in Node without a separate compile step; `@typescript-eslint` adds type-aware lint rules; Prettier handles formatting — they're complementary, not overlapping.

## K — Key Concepts

```bash
# ts-node — run TypeScript directly in Node.js
npx ts-node src/index.ts

# tsx — faster alternative to ts-node (uses esbuild, no type checking)
npx tsx src/index.ts
npx tsx watch src/index.ts  # watch mode

# @typescript-eslint — TypeScript-aware ESLint rules
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Prettier — opinionated code formatter
npm install -D prettier eslint-config-prettier
```

```ts
// .tsx file — TypeScript + JSX
// Same as .ts but JSX syntax is allowed
import React from "react"

interface Props {
  name: string
  count?: number
}

function Counter({ name, count = 0 }: Props) {
  return (
    <div>
      <h1>{name}</h1>
      <span>{count}</span>
    </div>
  )
}
```

```json
// eslint.config.js (flat config, ESLint 9+)
// or .eslintrc.json (legacy)
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"   // enables type-aware rules
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"                     // must be LAST — disables formatting rules
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/no-floating-promises": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

```json
// package.json scripts
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src",
    "format:check": "prettier --check src"
  }
}
```


## W — Why It Matters

`@typescript-eslint/no-floating-promises` catches async calls where the returned Promise is never awaited — a common source of silent failures. `recommended-requiring-type-checking` enables rules that use the TypeScript type system for analysis (can detect calling `.split()` on a possibly-null value). ESLint handles code quality; Prettier handles formatting — separating concerns makes both configurable independently.

## I — Interview Q\&A

**Q: What's the difference between `ts-node` and `tsx`?**
A: `ts-node` performs full TypeScript compilation (including type checking) before running. `tsx` uses esbuild to strip types and run instantly — no type checking. `tsx` is much faster for development/scripts; `ts-node` is safer for CI where you want type errors to fail execution.

**Q: Why does `eslint-config-prettier` need to be last in the extends array?**
A: It disables ESLint rules that conflict with Prettier's formatting decisions (indentation, quotes, semicolons). It must come last to override any rules from earlier configs. ESLint checks code quality; Prettier handles formatting — they don't fight when configured correctly.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| ESLint and Prettier fighting over formatting | Add `eslint-config-prettier` last in `extends` |
| `ts-node` slow in large projects | Use `tsx` for dev scripts, `tsc --noEmit` for type checks in CI |
| `.tsx` extension on non-React TypeScript files | Only use `.tsx` for files with JSX — `.ts` for everything else |
| `recommended-requiring-type-checking` slowing ESLint | Requires `parserOptions.project` — only add on TypeScript files |

## K — Coding Challenge

**Set up a minimal `package.json` scripts block for a TypeScript project with type checking, linting, and formatting:**

**Solution:**

```json
{
  "scripts": {
    "dev":          "tsx watch src/index.ts",
    "build":        "tsc",
    "type-check":   "tsc --noEmit",
    "lint":         "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix":     "eslint src --ext .ts,.tsx --fix",
    "format":       "prettier --write .",
    "format:check": "prettier --check .",
    "validate":     "npm run type-check && npm run lint && npm run format:check"
  }
}
```


***

> ✅ **Day 7 complete.**
> Your tiny next action: create a `tsconfig.json` from scratch with `strict: true`, `noUncheckedIndexedAccess: true`, and `verbatimModuleSyntax: true` — then write one function that forces you to handle the `T | undefined` from an array index. That single exercise touches 5 concepts at once.
<span style="display:none">[^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://www.typescriptlang.org/tsconfig/strict.html

[^2]: https://betterstack.com/community/guides/scaling-nodejs/typescript-strict-option/

[^3]: https://www.skill4agent.com/en/skill/laurigates-claude-plugins/typescript-strict

[^4]: https://blog.logrocket.com/types-vs-interfaces-typescript/

[^5]: https://dev.to/aleksei_aleinikov/master-tsconfigjson-like-a-pro-in-2025-308l

[^6]: https://www.typescriptlang.org/tsconfig/

[^7]: https://dev.to/kovalevsky/how-to-configure-tsconfig-json-typescript-strict-options-4c1c

[^8]: https://whatislove.dev/articles/the-strictest-typescript-config/

[^9]: https://develop.sentry.dev/frontend/strict-typescript-settings-guide/

[^10]: https://www.totaltypescript.com/tips/make-accessing-objects-safer-by-enabling-nouncheckedindexedaccess-in-tsconfig

[^11]: https://stackoverflow.com/questions/51439843/unknown-vs-any

[^12]: https://www.reddit.com/r/typescript/comments/1ne3has/has_the_debate_settled_between_types_and/

[^13]: https://www.w3schools.com/typescript/typescript_aliases_and_interfaces.php

[^14]: https://gist.github.com/dilame/32709f16e3f8d4d64b596f5b19d812e1

[^15]: https://dev.to/zeeshanali0704/understanding-typescript-type-vs-interface-a-detailed-comparison-4kp

