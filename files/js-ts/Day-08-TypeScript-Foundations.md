
# 📘 Day 8 — TypeScript Foundations

> Phase 2 · TypeScript Basics to Advanced (Day 1 of 3)
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Why TypeScript & How It Works](#1--why-typescript--how-it-works)
2. [`tsconfig.json` & Strict Mode](#2--tsconfigjson--strict-mode)
3. [Type Inference](#3--type-inference)
4. [Primitive Types & Special Types (`any`, `unknown`, `never`, `void`)](#4--primitive-types--special-types-any-unknown-never-void)
5. [`type` vs `interface`](#5--type-vs-interface)
6. [Union & Intersection Types](#6--union--intersection-types)
7. [Literal Types & `as const`](#7--literal-types--as-const)
8. [Tuples](#8--tuples)
9. [Enums vs Union Types](#9--enums-vs-union-types)
10. [Type Assertions & Index Signatures](#10--type-assertions--index-signatures)
11. [Type Narrowing (`typeof`, `in`, `instanceof`)](#11--type-narrowing-typeof-in-instanceof)
12. [TypeScript Class Features](#12--typescript-class-features)

---

# 1 — Why TypeScript & How It Works

## T — TL;DR

TypeScript is a **compile-time type layer** over JavaScript — it catches errors before your code runs, then erases all types and emits plain JS.

## K — Key Concepts

### What TypeScript Is

```
TypeScript = JavaScript + Static Types
```

TypeScript is a **superset** of JavaScript — all valid JS is valid TS. TypeScript adds:
- Type annotations
- Type checking at **compile time** (not runtime)
- Advanced type system features (generics, conditional types, etc.)

### How It Works

```
your-code.ts → TypeScript Compiler (tsc) → your-code.js
                     ↓
              Type checking happens HERE
              Types are ERASED in output
```

**Types exist only at compile time.** At runtime, it's just JavaScript. No performance cost.

```ts
// TypeScript (input)
function add(a: number, b: number): number {
  return a + b
}

// JavaScript (output) — types are gone
function add(a, b) {
  return a + b
}
```

### Structural Typing (Duck Typing)

TypeScript uses **structural typing** — if the shape matches, it's compatible:

```ts
interface Point {
  x: number
  y: number
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`)
}

const obj = { x: 10, y: 20, z: 30 }
logPoint(obj) // ✅ works — has x and y, extra properties are fine
```

This is fundamentally different from Java/C# **nominal typing** where types must be explicitly declared.

### TypeScript Does NOT:

- Run at runtime (types are erased)
- Add performance overhead
- Change JavaScript behavior
- Guarantee runtime safety (data from APIs, user input, etc. is unvalidated)

### The Compilation Pipeline

```
.ts / .tsx files
    ↓
tsc (type checks + compiles)
    ↓
.js / .jsx files (types stripped)
    ↓
Node.js / Browser runs plain JS
```

In modern setups, tools like **esbuild**, **SWC**, or **Vite** strip types without type-checking (fast), and `tsc` runs separately for type-checking only.

## W — Why It Matters

- **Catches bugs before runtime** — type errors, typos, null access, missing properties.
- **Self-documenting code** — types serve as inline documentation.
- **Refactoring confidence** — rename a property and the compiler finds every usage.
- **IDE superpowers** — autocomplete, hover info, go-to-definition, all powered by types.
- **Industry standard** — most major open-source projects and companies use TypeScript.
- **Required** for senior roles — virtually every modern JS job expects TypeScript fluency.

## I — Interview Questions with Answers

### Q1: What is TypeScript?

**A:** A statically typed superset of JavaScript. It adds a compile-time type system that catches errors before runtime. Types are erased during compilation — the output is plain JavaScript.

### Q2: What is structural typing?

**A:** TypeScript checks type compatibility based on **shape** (structure), not name. If an object has all the required properties of a type, it's compatible — even if it wasn't explicitly declared as that type.

### Q3: Do TypeScript types exist at runtime?

**A:** No. All type annotations, interfaces, and type aliases are erased during compilation. At runtime, it's just JavaScript. This means you can't use TypeScript types for runtime validation — you need libraries like Zod for that (Day 12).

### Q4: Does TypeScript make JavaScript slower?

**A:** No. Since types are erased at compile time, the runtime code is identical to what you'd write in plain JavaScript. There's zero runtime overhead.

## C — Common Pitfalls with Fix

### Pitfall: Assuming TypeScript validates runtime data

```ts
interface User {
  name: string
  age: number
}

const data: User = await fetch("/api/user").then(r => r.json())
// TypeScript trusts you — but the API might return ANYTHING
data.name.toUpperCase() // could crash if name is actually undefined!
```

**Fix:** Use runtime validation (Zod, Day 12) for external data. TypeScript only checks what YOU write, not what the network sends.

### Pitfall: Thinking TypeScript changes JavaScript behavior

```ts
const x: number = "hello" as any as number
x.toFixed(2) // Runtime crash! — TypeScript was bypassed with `as any`
```

**Fix:** Don't use `as any` to silence errors. Fix the actual type issue.

### Pitfall: Over-annotating when inference works

```ts
// ❌ Redundant
const name: string = "Mark"
const nums: number[] = [1, 2, 3]

// ✅ Let inference work
const name = "Mark"       // inferred as string
const nums = [1, 2, 3]   // inferred as number[]
```

**Fix:** Only annotate when inference isn't sufficient (function parameters, complex returns, exported APIs).

## K — Coding Challenge with Solution

### Challenge

What errors does TypeScript catch here? (Don't run — reason about it.)

```ts
function greet(name: string, age: number) {
  return `${name} is ${age} years old`
}

greet("Mark", "thirty")
greet("Mark")
greet("Mark", 30, true)
```

### Solution

```ts
greet("Mark", "thirty")     // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
greet("Mark")               // ❌ Expected 2 arguments, but got 1
greet("Mark", 30, true)     // ❌ Expected 2 arguments, but got 3
```

All three errors caught **before** your code runs. In plain JavaScript, only the first would silently produce `"Mark is thirty years old"` — the others would work but produce bugs.

---

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

# 3 — Type Inference

## T — TL;DR

TypeScript **infers types automatically** from values, return statements, and context — you should only add explicit annotations when inference isn't sufficient or when defining public APIs.

## K — Key Concepts

### Basic Inference

```ts
// TypeScript infers from the assigned value
const name = "Mark"       // type: "Mark" (string literal — because const)
let name2 = "Mark"        // type: string (wider — because let can be reassigned)

const age = 30            // type: 30
let age2 = 30             // type: number

const active = true       // type: true
let active2 = true        // type: boolean

const nums = [1, 2, 3]   // type: number[]
const mixed = [1, "two"]  // type: (string | number)[]
```

### `const` vs `let` Inference

```ts
const x = "hello"  // type: "hello" (literal type — can never change)
let y = "hello"    // type: string (wider — can be reassigned to any string)

const obj = { name: "Mark" } // type: { name: string } — not literal! (object properties are mutable)
```

### Function Return Inference

```ts
// TypeScript infers the return type
function add(a: number, b: number) {
  return a + b // return type inferred as `number`
}

function greet(name: string) {
  return `Hello, ${name}` // return type inferred as `string`
}

function getUser(id: number) {
  if (id === 1) return { name: "Mark", age: 30 }
  return null
  // return type inferred as `{ name: string; age: number } | null`
}
```

### When to Annotate

```ts
// ✅ DO annotate: function parameters (ALWAYS required)
function add(a: number, b: number) { return a + b }

// ✅ DO annotate: exported/public API return types
export function fetchUser(id: number): Promise<User> { ... }

// ✅ DO annotate: when inference produces a type that's too wide
const config: Config = { theme: "dark", debug: false }

// ❌ DON'T annotate: when inference is correct and clear
const name: string = "Mark" // redundant — TS already knows
const nums: number[] = [1, 2, 3] // redundant
```

### Contextual Typing

TypeScript infers types from **context** — like callback parameter types:

```ts
const nums = [1, 2, 3]
nums.map(n => n.toFixed(2))
//        ^ n is inferred as `number` from the array type

document.addEventListener("click", event => {
  console.log(event.clientX)
  //          ^ event is inferred as MouseEvent from "click"
})

const handler: (name: string) => void = (name) => {
  console.log(name.toUpperCase())
  //          ^ name is inferred as string from the type annotation on handler
}
```

### Array/Object Inference

```ts
// Empty array — needs annotation
const items: string[] = []
items.push("hello") // ✅

const items2 = [] // type: any[] — bad!
items2.push("hello")
items2.push(123) // no error — lost type safety

// Object inference
const user = {
  name: "Mark",
  age: 30,
  roles: ["admin", "user"],
}
// type: { name: string; age: number; roles: string[] }
```

### Type Widening and Narrowing

```ts
// Widening: TS chooses a broader type
let x = 10        // number (not 10)
let s = "hello"   // string (not "hello")

// Narrowing: TS refines a type based on checks
function process(input: string | number) {
  if (typeof input === "string") {
    // input is narrowed to `string` here
    input.toUpperCase() // ✅
  } else {
    // input is narrowed to `number` here
    input.toFixed(2) // ✅
  }
}
```

### `satisfies` Operator (TS 4.9+)

Validates a value matches a type **without widening** the inferred type:

```ts
type Colors = Record<string, [number, number, number] | string>

// Without satisfies — type is widened
const colors: Colors = {
  red: [255, 0, 0],
  green: "#00FF00",
}
colors.red // type: [number, number, number] | string — lost specific type!

// With satisfies — validates AND keeps precise inference
const colors = {
  red: [255, 0, 0],
  green: "#00FF00",
} satisfies Colors
colors.red    // type: [number, number, number] ✅
colors.green  // type: string ✅
```

## W — Why It Matters

- Good TypeScript code **relies on inference** — over-annotating makes code noisy and harder to maintain.
- Understanding `const` vs `let` inference explains literal types and `as const`.
- Contextual typing is why callback parameters "just work" in `map`, `filter`, `addEventListener`, etc.
- The `satisfies` operator is a modern best practice for config objects and constants.
- Interviewers test whether you know when inference is sufficient vs when annotations are needed.

## I — Interview Questions with Answers

### Q1: When should you explicitly annotate types?

**A:** Always for function **parameters**. For return types on exported/public functions. When inference produces a type that's too wide. When initializing empty collections. Never for simple `const` assignments where inference is correct.

### Q2: Why does `const x = "hello"` infer a literal type but `let y = "hello"` infers `string`?

**A:** `const` can't be reassigned, so TypeScript narrows to the exact literal `"hello"`. `let` can be reassigned to any string, so TypeScript widens to `string`.

### Q3: What does `satisfies` do?

**A:** Validates that a value matches a type **without changing** the inferred type. Unlike `: Type` annotation (which widens to the declared type), `satisfies` keeps the precise inferred type while ensuring type compatibility.

## C — Common Pitfalls with Fix

### Pitfall: Over-annotating everything

```ts
const name: string = "Mark"
const age: number = 30
const items: string[] = ["a", "b"]
```

**Fix:** Let inference work: `const name = "Mark"`. Annotate only where needed.

### Pitfall: Empty array without annotation

```ts
const items = [] // any[] — no type safety!
```

**Fix:** `const items: string[] = []` or `const items: Array<string> = []`.

### Pitfall: Using `: Type` when `satisfies` is better

```ts
const config: Config = { timeout: 5000, retries: 3 }
config.timeout // type: number | string | boolean (whatever Config allows)
```

**Fix:** `const config = { timeout: 5000, retries: 3 } satisfies Config` — keeps precise inference.

## K — Coding Challenge with Solution

### Challenge

What types does TypeScript infer for each variable?

```ts
const a = 42
let b = 42
const c = [1, "two", true]
const d = { x: 10, y: 20 }
const e = [1, 2, 3] as const

function f(x: number) {
  if (x > 0) return "positive"
  return null
}
```

### Solution

```ts
const a = 42              // type: 42 (literal — const)
let b = 42                // type: number (widened — let)
const c = [1, "two", true] // type: (string | number | boolean)[]
const d = { x: 10, y: 20 } // type: { x: number; y: number }
const e = [1, 2, 3] as const // type: readonly [1, 2, 3]

function f(x: number) {
  // return type: "positive" | null
  // (literal "positive" because both branches return literal or null)
}
// Actually: return type is `string | null` — TS widens string returns in functions
```

Correction: function `f` returns `string | null`, not `"positive" | null`. TypeScript widens string literal returns in function inference unless you use `as const` or explicit annotation.

---

# 4 — Primitive Types & Special Types (`any`, `unknown`, `never`, `void`)

## T — TL;DR

TypeScript has the same primitive types as JavaScript plus four special types — `any` (escape hatch), `unknown` (safe `any`), `never` (impossible values), and `void` (no return value) — each with distinct purposes.

## K — Key Concepts

### Primitive Types

```ts
const str: string = "hello"
const num: number = 42
const big: bigint = 42n
const bool: boolean = true
const sym: symbol = Symbol("id")
const nul: null = null
const undef: undefined = undefined
```

### `any` — The Escape Hatch

```ts
let x: any = 42
x = "hello"     // ✅ no error
x = true        // ✅ no error
x.foo.bar.baz   // ✅ no error — TypeScript stops checking entirely
```

`any` **disables all type checking**. It's contagious — anything that touches `any` becomes `any`:

```ts
const x: any = "hello"
const y = x * 2 // y is `any` — error is invisible
```

**Rule: Never use `any` unless absolutely necessary.** Use `unknown` instead.

### `unknown` — Safe `any`

```ts
let x: unknown = 42
x = "hello"     // ✅ can assign anything (like any)

// But you CAN'T use it without narrowing:
x.toUpperCase() // ❌ 'x' is of type 'unknown'
x + 1           // ❌ 'x' is of type 'unknown'

// Must narrow first:
if (typeof x === "string") {
  x.toUpperCase() // ✅ — narrowed to string
}

if (typeof x === "number") {
  x + 1 // ✅ — narrowed to number
}
```

**`unknown` = "I don't know what this is, so I must check before using it."**

### `any` vs `unknown`

| Feature | `any` | `unknown` |
|---------|-------|-----------|
| Assign anything TO it | ✅ | ✅ |
| Assign it TO anything | ✅ (dangerous!) | ❌ (must narrow first) |
| Access properties | ✅ (no checking) | ❌ (must narrow first) |
| Call methods | ✅ (no checking) | ❌ (must narrow first) |
| Type safety | ❌ None | ✅ Forces checking |
| Use when | Migrating JS, very rare escapes | External data, catch blocks, generic handlers |

### `never` — The Impossible Type

`never` represents values that **can never occur**:

```ts
// Function that never returns (throws or infinite loop)
function throwError(msg: string): never {
  throw new Error(msg)
}

function infinite(): never {
  while (true) {}
}

// Exhaustiveness checking
type Shape = "circle" | "square" | "triangle"

function area(shape: Shape) {
  switch (shape) {
    case "circle": return Math.PI * 10 ** 2
    case "square": return 10 * 10
    case "triangle": return (10 * 5) / 2
    default:
      const _exhaustive: never = shape
      //    ^ If you add a new Shape variant and forget a case,
      //      this line errors: Type 'newShape' is not assignable to type 'never'
      throw new Error(`Unknown shape: ${shape}`)
  }
}
```

`never` is the **bottom type** — it's assignable to every type, but no type is assignable to `never` (except `never` itself).

### `void` — No Return Value

```ts
function logMessage(msg: string): void {
  console.log(msg) // no return value
}

// void ≠ undefined
// void means "don't use the return value"
// undefined means "the value is specifically undefined"

const fn: () => void = () => {
  return 42 // ✅ allowed! (void means "ignore return", not "must be undefined")
}
```

The `void` return type is a **contract**: "I won't use whatever this returns." It's different from `undefined`.

### `null` and `undefined` in TypeScript

With `strictNullChecks`:

```ts
let name: string = "Mark"
name = null      // ❌ Type 'null' is not assignable to type 'string'
name = undefined // ❌ Type 'undefined' is not assignable to type 'string'

let name2: string | null = "Mark"
name2 = null     // ✅

let name3: string | undefined = "Mark"
name3 = undefined // ✅

// Optional properties/parameters use `undefined`:
function greet(name?: string) {
  // name is `string | undefined`
}

interface User {
  name: string
  email?: string // string | undefined
}
```

### The Type Hierarchy

```
        any (top — accepts everything, disables checking)
         ↑
      unknown (top — accepts everything, requires narrowing)
     ↗  ↑  ↖
string number boolean object ... (regular types)
     ↘  ↓  ↙
       never (bottom — assignable to all, nothing assignable to it)
```

## W — Why It Matters

- `unknown` vs `any` is the **most important type safety decision** you'll make daily.
- `never` enables exhaustiveness checking — the compiler catches missing cases in unions.
- Understanding `void` prevents confusion with `undefined` in callback signatures.
- `strictNullChecks` forces explicit null handling — preventing the #1 runtime error.
- Every interview tests `any` vs `unknown` and when to use `never`.

## I — Interview Questions with Answers

### Q1: What is the difference between `any` and `unknown`?

**A:** Both accept any value. But `any` disables all type checking — you can access properties, call methods, and assign it anywhere without errors. `unknown` requires **narrowing** before you can use it — you must check the type first. `unknown` is type-safe; `any` is not.

### Q2: What is `never` used for?

**A:** (1) Functions that never return (throw or infinite loop). (2) **Exhaustiveness checking** — in a `default` case of a switch, assigning to `never` errors if you haven't handled all union members. (3) It's the bottom type — the empty set of values.

### Q3: What is the difference between `void` and `undefined`?

**A:** `void` means "don't use the return value" — it's a contract, and functions with `void` return type can actually return values (which are ignored). `undefined` is a specific value. A function returning `undefined` must explicitly return `undefined` or nothing.

### Q4: When should you use `any`?

**A:** Almost never. The only legitimate uses are: (1) Gradual migration from JavaScript. (2) Working with genuinely untyped third-party code. In both cases, prefer `unknown` and narrow as needed.

## C — Common Pitfalls with Fix

### Pitfall: Using `any` for API responses

```ts
const data: any = await fetch("/api/data").then(r => r.json())
data.forEach(...) // no error, but data might not be an array!
```

**Fix:** Use `unknown` and validate:

```ts
const data: unknown = await fetch("/api/data").then(r => r.json())
if (Array.isArray(data)) {
  data.forEach(...) // ✅ safe
}
```

Or better: use Zod (Day 12).

### Pitfall: Forgetting exhaustiveness checking with `never`

```ts
type Status = "active" | "inactive" | "pending"

function handle(status: Status) {
  if (status === "active") return
  if (status === "inactive") return
  // "pending" is not handled — no error without never check!
}
```

**Fix:** Add exhaustiveness:

```ts
function handle(status: Status) {
  switch (status) {
    case "active": return
    case "inactive": return
    case "pending": return
    default:
      const _: never = status // errors if a case is missed
  }
}
```

### Pitfall: `void` callback returning a value accidentally

```ts
const fn: () => void = () => 42
const result = fn()
result.toFixed(2) // ❌ 'void' is not assignable... even though it's 42 at runtime
```

**Fix:** If you need the return value, don't type the callback as `void`.

## K — Coding Challenge with Solution

### Challenge

Write a function `assertNever(value: never): never` and use it for exhaustiveness checking:

```ts
type Direction = "north" | "south" | "east" | "west"

function move(dir: Direction) {
  switch (dir) {
    case "north": return [0, 1]
    case "south": return [0, -1]
    case "east": return [1, 0]
    // "west" missing!
  }
}
```

### Solution

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`)
}

type Direction = "north" | "south" | "east" | "west"

function move(dir: Direction): [number, number] {
  switch (dir) {
    case "north": return [0, 1]
    case "south": return [0, -1]
    case "east":  return [1, 0]
    case "west":  return [-1, 0]
    default:
      return assertNever(dir)
      // If you remove any case above, TypeScript errors:
      // Argument of type '"west"' is not assignable to parameter of type 'never'
  }
}
```

---

# 5 — `type` vs `interface`

## T — TL;DR

`type` aliases are flexible and work with unions, intersections, primitives, and tuples; `interface` declarations support declaration merging and `extends` — **use `type` by default, `interface` for objects you expect to be extended**.

## K — Key Concepts

### `type` Alias

```ts
// Primitives
type ID = string | number

// Objects
type User = {
  name: string
  age: number
}

// Functions
type Formatter = (input: string) => string

// Tuples
type Point = [number, number]

// Unions
type Status = "active" | "inactive" | "pending"

// Intersections
type Admin = User & { permissions: string[] }

// Mapped/Conditional (only type can do these)
type Readonly<T> = { readonly [K in keyof T]: T[K] }
```

### `interface` Declaration

```ts
interface User {
  name: string
  age: number
}

// Extending
interface Admin extends User {
  permissions: string[]
}

// Implementing (classes)
class UserImpl implements User {
  constructor(public name: string, public age: number) {}
}

// Method syntax
interface Formatter {
  format(input: string): string
}
```

### Declaration Merging (Only `interface`)

```ts
interface Window {
  myCustomProperty: string
}

// This MERGES with the existing Window interface:
interface Window {
  anotherProperty: number
}

// Window now has both myCustomProperty AND anotherProperty
// (in addition to all built-in Window properties)
```

`type` can NOT merge:

```ts
type Window = { myProp: string }
type Window = { another: number }
// ❌ Duplicate identifier 'Window'
```

### Intersection vs Extends

```ts
// type: intersection
type Admin = User & { permissions: string[] }

// interface: extends
interface Admin extends User {
  permissions: string[]
}

// Both produce the same shape. But interface gives better error messages
// when there's a conflict between the base and extension.
```

### Conflict Handling

```ts
// type intersection — silently creates `never` for conflicts
type A = { x: string }
type B = { x: number }
type C = A & B
// C.x is `string & number` → `never` — silent, confusing

// interface extends — explicit error
interface A { x: string }
interface B extends A { x: number }
// ❌ Interface 'B' incorrectly extends interface 'A'.
//    Type 'number' is not assignable to type 'string'.
```

### What Only `type` Can Do

```ts
// Unions
type StringOrNumber = string | number // ❌ can't do with interface

// Primitives
type ID = string // ❌ can't do with interface

// Tuples
type Pair = [string, number] // ❌ can't do with interface

// Mapped types
type Readonly<T> = { readonly [K in keyof T]: T[K] }

// Conditional types
type IsString<T> = T extends string ? true : false

// Template literal types
type EventName = `on${string}`
```

### What Only `interface` Can Do

```ts
// Declaration merging
interface Window {
  myProp: string
}

// That's it — declaration merging is the only unique capability.
```

### The Recommendation

```
Default: Use `type`
  - For unions, intersections, tuples, primitives, mapped types
  - For function signatures
  - For most object shapes

Use `interface` when:
  - You expect the type to be extended (OOP patterns, public APIs)
  - You need declaration merging (augmenting third-party types)
  - You're defining a class contract (implements)
```

Many teams use `interface` for all object types and `type` for everything else — both approaches are valid. **Pick one convention and be consistent.**

## W — Why It Matters

- This is the **most common TypeScript debate** — having a clear answer shows maturity.
- Declaration merging is how you extend third-party types (e.g., adding properties to `Window`).
- Understanding the differences prevents subtle bugs from intersection conflicts.
- Consistent conventions improve team code readability.
- Interview questions specifically test `type` vs `interface` knowledge.

## I — Interview Questions with Answers

### Q1: What is the difference between `type` and `interface`?

**A:** `type` is more flexible — it supports unions, intersections, tuples, primitives, mapped types, and conditional types. `interface` supports declaration merging and `extends` with better error messages on conflicts. Both can define object shapes. Use `type` by default; `interface` when you need merging or extensibility.

### Q2: What is declaration merging?

**A:** When you declare the same `interface` name multiple times, TypeScript **merges** them into a single interface with all properties. This is used to augment third-party types (e.g., extending `Window` or `Express.Request`).

### Q3: Which should you use for a function type?

**A:** `type`. While you can use `interface` with a call signature, `type` is cleaner: `type Handler = (event: Event) => void`.

## C — Common Pitfalls with Fix

### Pitfall: Accidental declaration merging

```ts
interface Config { timeout: number }
// ... 500 lines later ...
interface Config { retries: number }
// Silently merged! Config now requires both timeout AND retries.
```

**Fix:** Use `type` to prevent accidental merging: `type Config = { timeout: number }`.

### Pitfall: `type` intersection creating `never` on conflicts

```ts
type A = { status: "active" }
type B = { status: "inactive" }
type C = A & B // status is "active" & "inactive" = never
```

**Fix:** Use `interface extends` for better error messages, or use discriminated unions (topic 6).

## K — Coding Challenge with Solution

### Challenge

Augment the global `Window` interface to add a `__APP_CONFIG` property:

```ts
// After augmentation:
window.__APP_CONFIG.apiUrl // should be typed as string
```

### Solution

```ts
// global.d.ts
declare global {
  interface Window {
    __APP_CONFIG: {
      apiUrl: string
      debug: boolean
    }
  }
}

export {} // needed to make this a module

// Usage:
window.__APP_CONFIG.apiUrl // string ✅
window.__APP_CONFIG.debug  // boolean ✅
```

This works because of **declaration merging** — you can't do this with `type`.

---

# 6 — Union & Intersection Types

## T — TL;DR

Union types (`A | B`) mean "either A or B"; intersection types (`A & B`) mean "both A and B" — they're the building blocks for composing complex types from simpler ones.

## K — Key Concepts

### Union Types — "OR"

```ts
type StringOrNumber = string | number

function format(value: StringOrNumber) {
  // Can't use string methods OR number methods directly
  // Must narrow first:
  if (typeof value === "string") {
    return value.toUpperCase() // ✅ narrowed to string
  }
  return value.toFixed(2) // ✅ narrowed to number
}

format("hello") // ✅
format(42)       // ✅
format(true)     // ❌ Argument of type 'boolean' is not assignable
```

### Union with Literal Types

```ts
type Direction = "north" | "south" | "east" | "west"
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"
type Status = 200 | 301 | 404 | 500

function navigate(dir: Direction) { /* ... */ }
navigate("north") // ✅
navigate("up")    // ❌ Argument of type '"up"' is not assignable
```

### Discriminated Unions

A powerful pattern: union of objects with a common **discriminant** property:

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2
      // TypeScript knows shape is { kind: "circle"; radius: number } here
    case "square":
      return shape.side ** 2
    case "rectangle":
      return shape.width * shape.height
  }
}
```

The `kind` property is the **discriminant** — TypeScript uses it to narrow the union in each branch.

### Discriminated Union with `never` Exhaustiveness

```ts
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2
    case "square": return shape.side ** 2
    case "rectangle": return shape.width * shape.height
    default:
      const _exhaustive: never = shape
      throw new Error(`Unknown shape: ${(shape as any).kind}`)
  }
}
// If you add a new Shape variant, TypeScript errors at `_exhaustive`
```

### Intersection Types — "AND"

```ts
type HasName = { name: string }
type HasAge = { age: number }
type HasEmail = { email: string }

type User = HasName & HasAge & HasEmail
// User = { name: string; age: number; email: string }

const user: User = {
  name: "Mark",
  age: 30,
  email: "mark@example.com",
}
```

### Intersection for Mixins / Composition

```ts
type Timestamped = {
  createdAt: Date
  updatedAt: Date
}

type SoftDeletable = {
  deletedAt: Date | null
}

type User = {
  id: string
  name: string
}

type FullUser = User & Timestamped & SoftDeletable
// {
//   id: string; name: string;
//   createdAt: Date; updatedAt: Date;
//   deletedAt: Date | null;
// }
```

### Union vs Intersection with Primitives

```ts
// Union of primitives — the wider type (A OR B)
type A = string | number // "string or number"

// Intersection of primitives — the narrower type (A AND B)
type B = string & number // never! (nothing is both string AND number)
```

### Real-World: API Response Pattern

```ts
type ApiResponse<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string }
  | { status: "loading" }

function handleResponse(response: ApiResponse<User>) {
  switch (response.status) {
    case "success":
      console.log(response.data.name) // ✅ data is available
      break
    case "error":
      console.error(response.message) // ✅ message is available
      break
    case "loading":
      console.log("Loading...")
      break
  }
}
```

## W — Why It Matters

- Discriminated unions are the **most important TypeScript pattern** — used for state management, API responses, event systems, and more.
- Union types + exhaustiveness checking ensure you handle every case.
- Intersections enable compositional type design (mixins, decorators, middleware).
- React components, Redux actions, and API types all rely heavily on unions.
- This is the most commonly tested intermediate TypeScript concept.

## I — Interview Questions with Answers

### Q1: What is a discriminated union?

**A:** A union of object types that share a common **literal-typed** property (the discriminant). TypeScript uses this property to narrow the union in conditional branches. Example: `{ kind: "circle"; radius: number } | { kind: "square"; side: number }` — `kind` is the discriminant.

### Q2: What is the difference between union and intersection?

**A:** Union (`A | B`) means the value can be **either** type A **or** type B. Intersection (`A & B`) means the value must be **both** type A **and** type B simultaneously. Union is OR; intersection is AND.

### Q3: What happens when you intersect conflicting types?

**A:** For primitives, it becomes `never` (`string & number` = `never`). For object properties, conflicting properties become `never` (the intersection of incompatible types).

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to narrow unions before use

```ts
function process(input: string | number) {
  return input.toUpperCase() // ❌ Property 'toUpperCase' does not exist on type 'number'
}
```

**Fix:** Narrow with `typeof`, `in`, `instanceof`, or discriminant property checks.

### Pitfall: Non-exhaustive switch on discriminated unions

```ts
type Action = { type: "add" } | { type: "remove" } | { type: "update" }

function handle(action: Action) {
  switch (action.type) {
    case "add": return
    case "remove": return
    // "update" is silently unhandled!
  }
}
```

**Fix:** Add `default: const _: never = action` for exhaustiveness.

## K — Coding Challenge with Solution

### Challenge

Create a discriminated union `Result<T, E>` with `success` and `failure` variants, and a function to unwrap it:

```ts
const ok = success("hello")     // Result<string, never>
const err = failure("not found") // Result<never, string>

unwrap(ok)  // "hello"
unwrap(err) // throws "not found"
```

### Solution

```ts
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

function success<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

function failure<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value // narrowed to { ok: true; value: T }
  }
  throw result.error // narrowed to { ok: false; error: E }
}
```

This is a preview of the full `Result` pattern covered on Day 12.

---

# 7 — Literal Types & `as const`

## T — TL;DR

Literal types narrow values to **exact constants** (`"hello"`, `42`, `true`); `as const` makes entire expressions deeply readonly with literal types — together they enable precise, compile-time-safe constants.

## K — Key Concepts

### Literal Types

```ts
// String literals
type Direction = "north" | "south" | "east" | "west"

let dir: Direction = "north" // ✅
dir = "up"                   // ❌ Type '"up"' is not assignable

// Number literals
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6

// Boolean literal
type True = true
```

### Literal Inference with `const` vs `let`

```ts
const x = "hello"  // type: "hello" (literal)
let y = "hello"    // type: string (widened)

const n = 42       // type: 42
let m = 42         // type: number
```

### `as const` — Deep Readonly Literal

```ts
// Without as const:
const config = {
  host: "localhost",
  port: 3000,
  methods: ["GET", "POST"],
}
// type: { host: string; port: number; methods: string[] }

// With as const:
const config = {
  host: "localhost",
  port: 3000,
  methods: ["GET", "POST"],
} as const
// type: {
//   readonly host: "localhost";
//   readonly port: 3000;
//   readonly methods: readonly ["GET", "POST"];
// }
```

`as const` makes:
1. All properties `readonly`
2. All values literal types
3. Arrays become `readonly` tuples

### `as const` with Arrays

```ts
// Without as const:
const colors = ["red", "green", "blue"] // type: string[]

// With as const:
const colors = ["red", "green", "blue"] as const
// type: readonly ["red", "green", "blue"]

type Color = (typeof colors)[number]
// type: "red" | "green" | "blue"
```

### Deriving Types from `as const` Values

```ts
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const
type HttpMethod = (typeof HTTP_METHODS)[number]
// type: "GET" | "POST" | "PUT" | "DELETE"

const STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const

type StatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES]
// type: 200 | 404 | 500
```

### `as const` in Function Arguments

```ts
function request(method: "GET" | "POST", url: string) { /* ... */ }

// Without as const:
const method = "GET" // type: string
request(method, "/api") // ❌ Argument of type 'string' is not assignable to '"GET" | "POST"'

// Fix 1: as const on variable
const method = "GET" as const // type: "GET"
request(method, "/api") // ✅

// Fix 2: as const on object
const req = { method: "GET", url: "/api" } as const
request(req.method, req.url) // ✅
```

### `satisfies` + `as const` (Power Combo)

```ts
const ROUTES = {
  home: "/",
  about: "/about",
  user: "/user/:id",
} as const satisfies Record<string, string>

// Type: exact literal types (from as const)
// Validation: must be Record<string, string> (from satisfies)
type Route = (typeof ROUTES)[keyof typeof ROUTES]
// type: "/" | "/about" | "/user/:id"
```

## W — Why It Matters

- Literal types enable **exhaustive** union matching — the compiler catches missing cases.
- `as const` eliminates the need for TypeScript enums in most cases.
- Deriving types from values (`typeof X[number]`) prevents duplication between runtime values and types.
- `satisfies` + `as const` is the modern best practice for typed constants.
- React prop types, Redux action types, and API route definitions all use these patterns.

## I — Interview Questions with Answers

### Q1: What does `as const` do?

**A:** Makes an expression deeply `readonly` with literal types. All properties become `readonly`, all values become their literal types (not widened), and arrays become `readonly` tuples.

### Q2: How do you derive a union type from an array?

**A:** `const arr = ["a", "b", "c"] as const; type T = (typeof arr)[number]` — gives `"a" | "b" | "c"`.

### Q3: Why use `as const` over enums?

**A:** `as const` values are plain JavaScript — no runtime overhead, tree-shakeable, and work with `typeof` for type derivation. Enums generate runtime code and have several gotchas (covered in topic 9).

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `as const` when passing literals to strict functions

```ts
const config = { method: "GET" }
fetch("/api", config) // ❌ method is string, not "GET"
```

**Fix:** `const config = { method: "GET" } as const` or `{ method: "GET" as const }`.

### Pitfall: Trying to mutate `as const` values

```ts
const arr = [1, 2, 3] as const
arr.push(4) // ❌ Property 'push' does not exist on type 'readonly [1, 2, 3]'
```

**Fix:** `as const` means immutable. If you need to mutate, don't use `as const`.

## K — Coding Challenge with Solution

### Challenge

Define a type-safe event system using `as const`:

```ts
const EVENTS = { ... } as const

type EventName = /* derived from EVENTS */
type EventPayload<E extends EventName> = /* ... */

function emit<E extends EventName>(event: E, payload: EventPayload<E>): void
```

### Solution

```ts
const EVENTS = {
  USER_LOGIN: { type: "string" },
  USER_LOGOUT: { type: "void" },
  ITEM_ADDED: { type: "number" },
} as const

type EventName = keyof typeof EVENTS

type PayloadMap = {
  USER_LOGIN: string
  USER_LOGOUT: void
  ITEM_ADDED: number
}

function emit<E extends EventName>(event: E, ...args: PayloadMap[E] extends void ? [] : [PayloadMap[E]]) {
  console.log(`Event: ${event}`, ...args)
}

emit("USER_LOGIN", "mark@example.com") // ✅
emit("USER_LOGOUT")                     // ✅ — no payload needed
emit("ITEM_ADDED", 42)                  // ✅
emit("USER_LOGIN")                      // ❌ — payload required
emit("ITEM_ADDED", "wrong")             // ❌ — wrong type
```

---

# 8 — Tuples

## T — TL;DR

Tuples are **fixed-length arrays** where each position has a specific type — they're TypeScript's way of representing structured positional data like coordinates, key-value pairs, and function return values.

## K — Key Concepts

### Basic Tuples

```ts
type Point = [number, number]
type NameAge = [string, number]
type RGB = [number, number, number]

const origin: Point = [0, 0]      // ✅
const mark: NameAge = ["Mark", 30] // ✅

const bad: Point = [1, 2, 3]     // ❌ Source has 3 element(s) but target allows only 2
const bad2: Point = ["1", "2"]   // ❌ Type 'string' is not assignable to type 'number'
```

### Labeled Tuples (TS 4.0+)

```ts
type Point = [x: number, y: number]
type Range = [start: number, end: number]

// Labels are documentation only — they don't affect type checking
const p: Point = [10, 20]
p[0] // hover shows: (property) x: number
```

### Optional Tuple Elements

```ts
type Coordinate = [number, number, number?]

const point2D: Coordinate = [1, 2]     // ✅
const point3D: Coordinate = [1, 2, 3]  // ✅
const bad: Coordinate = [1]            // ❌ too few
```

### Rest Elements in Tuples

```ts
type StringAndNumbers = [string, ...number[]]

const a: StringAndNumbers = ["hello"]           // ✅
const b: StringAndNumbers = ["hello", 1, 2, 3]  // ✅
const c: StringAndNumbers = [1, 2, 3]           // ❌ first must be string

// Leading rest:
type NumbersAndString = [...number[], string]
const d: NumbersAndString = [1, 2, "end"]       // ✅

// Middle rest:
type Sandwich = [string, ...number[], string]
const e: Sandwich = ["start", 1, 2, 3, "end"]  // ✅
```

### Tuples as Function Parameters

```ts
type Args = [string, number, boolean]

function example(...args: Args) {
  const [name, age, active] = args
  // name: string, age: number, active: boolean
}

example("Mark", 30, true) // ✅
```

### Tuples from Function Returns

```ts
function useState<T>(initial: T): [T, (value: T) => void] {
  let state = initial
  return [state, (value) => { state = value }]
}

const [count, setCount] = useState(0)
// count: number, setCount: (value: number) => void
```

This is exactly how React's `useState` works.

### Readonly Tuples

```ts
type ReadonlyPoint = readonly [number, number]

const p: ReadonlyPoint = [1, 2]
p[0] = 3 // ❌ Cannot assign to '0' because it is a read-only property

// as const creates readonly tuples:
const point = [1, 2] as const // readonly [1, 2]
```

## W — Why It Matters

- React's `useState` returns a tuple — understanding this is essential.
- Tuples with rest elements enable type-safe variadic functions.
- Labeled tuples improve IDE experience and documentation.
- Tuples are the foundation for advanced TypeScript patterns (`Parameters<T>`, etc.).
- They're used in database query results, coordinate systems, and event payloads.

## I — Interview Questions with Answers

### Q1: What is a tuple in TypeScript?

**A:** A fixed-length array where each position has a specific type. Unlike regular arrays (same type throughout), tuples have per-position types. Example: `[string, number]` is a tuple with a string first and number second.

### Q2: How are tuples different from arrays?

**A:** Arrays have a single element type and variable length (`number[]`). Tuples have specific types per position and fixed length (`[string, number]`). Tuples are a more precise type for structured positional data.

### Q3: Can tuples have optional or rest elements?

**A:** Yes. Optional: `[number, string?]`. Rest: `[string, ...number[]]`. You can even have rest in leading or middle positions (TS 4.2+).

## C — Common Pitfalls with Fix

### Pitfall: Tuple degrades to array when not annotated

```ts
const pair = ["Mark", 30] // type: (string | number)[] — NOT a tuple!

const pair: [string, number] = ["Mark", 30] // ✅ tuple
const pair = ["Mark", 30] as const           // ✅ readonly ["Mark", 30]
```

**Fix:** Explicitly annotate or use `as const`.

### Pitfall: Destructuring loses tuple info

```ts
function getPair(): [string, number] {
  return ["Mark", 30]
}

const result = getPair()
result[0].toUpperCase() // ✅ TypeScript knows it's string
result[1].toFixed(2)    // ✅ TypeScript knows it's number

const [a, b] = getPair()
a.toUpperCase() // ✅ still works — destructuring preserves types
```

This actually works correctly — no pitfall here. Destructuring preserves tuple element types.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `zip` function that combines two arrays into an array of tuples:

```ts
zip([1, 2, 3], ["a", "b", "c"])
// [[1, "a"], [2, "b"], [3, "c"]]
```

### Solution

```ts
function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const length = Math.min(a.length, b.length)
  const result: [A, B][] = []

  for (let i = 0; i < length; i++) {
    result.push([a[i], b[i]])
  }

  return result
}

const result = zip([1, 2, 3], ["a", "b", "c"])
// type: [number, string][]
// value: [[1, "a"], [2, "b"], [3, "c"]]
```

---

# 9 — Enums vs Union Types

## T — TL;DR

TypeScript `enum`s generate runtime code and have several gotchas — **prefer union types** (`"admin" | "user"`) for most cases; use `as const` objects when you need both values and types.

## K — Key Concepts

### String Enums

```ts
enum Direction {
  North = "NORTH",
  South = "SOUTH",
  East = "EAST",
  West = "WEST",
}

function move(dir: Direction) { /* ... */ }
move(Direction.North)   // ✅
move("NORTH")           // ❌ — must use the enum, not the string
```

### Numeric Enums (Avoid)

```ts
enum Status {
  Active,     // 0
  Inactive,   // 1
  Pending,    // 2
}

// The dangerous reverse mapping:
Status[0]       // "Active" — string!
Status.Active   // 0 — number!
Status["Active"] // 0

// This compiles to runtime JS:
// var Status;
// (function (Status) {
//     Status[Status["Active"] = 0] = "Active";
//     ...
// })(Status || (Status = {}));
```

Numeric enums create **bidirectional mappings** at runtime — a source of confusion and bugs.

### The Problems with Enums

```ts
// Problem 1: Numeric enums accept any number
enum Status { Active, Inactive }
function handle(s: Status) {}
handle(99) // ✅ — no error! Any number is accepted.

// Problem 2: Enums generate runtime code
enum Color { Red, Green, Blue }
// Compiles to ~10 lines of JavaScript, even if tree-shaking is enabled

// Problem 3: Const enums have different behavior
const enum Color { Red, Green, Blue }
// Inlined at compile time — but doesn't work with --isolatedModules

// Problem 4: Enums can't be used with `keyof typeof` easily
// Problem 5: Different from standard TypeScript patterns
```

### Union Types — The Better Alternative

```ts
type Direction = "north" | "south" | "east" | "west"

function move(dir: Direction) {
  switch (dir) {
    case "north": return [0, 1]
    case "south": return [0, -1]
    case "east": return [1, 0]
    case "west": return [-1, 0]
  }
}

move("north") // ✅
move("up")    // ❌ Type '"up"' is not assignable to type 'Direction'
```

No runtime code. No reverse mappings. Full type safety.

### `as const` Objects — When You Need Both Values and Types

```ts
const Direction = {
  North: "NORTH",
  South: "SOUTH",
  East: "EAST",
  West: "WEST",
} as const

type Direction = (typeof Direction)[keyof typeof Direction]
// type: "NORTH" | "SOUTH" | "EAST" | "WEST"

function move(dir: Direction) { /* ... */ }
move(Direction.North)  // ✅
move("NORTH")          // ✅ — both work!
```

### Comparison

| Feature | `enum` | Union type | `as const` object |
|---------|--------|-----------|-------------------|
| Runtime code | ✅ Yes | ❌ No | ✅ Minimal (the object) |
| Reverse mapping | ✅ (numeric only) | ❌ | ❌ |
| Tree-shakeable | ❌ | ✅ | ✅ |
| Works with `isolatedModules` | ⚠️ `const enum` doesn't | ✅ | ✅ |
| Direct string comparison | ❌ (must use enum) | ✅ | ✅ |
| Auto-incrementing values | ✅ | ❌ | ❌ |
| Standard JS pattern | ❌ | ✅ | ✅ |

## W — Why It Matters

- Major projects (Google, Vercel, the TypeScript team itself) recommend unions over enums.
- Enums generate runtime code that can't be tree-shaken.
- Numeric enums accepting any number is a significant type safety hole.
- `as const` objects give you the same DX as enums without the gotchas.
- This is a frequently tested opinion question in interviews.

## I — Interview Questions with Answers

### Q1: Why should you prefer union types over enums?

**A:** Union types are zero-runtime-cost, tree-shakeable, and follow standard TypeScript patterns. Enums generate runtime code, numeric enums have a type safety hole (accepting any number), and `const enum` doesn't work with `isolatedModules`.

### Q2: When might you still use an enum?

**A:** When you need auto-incrementing numeric values, bidirectional mapping (value ↔ name), or when working with a codebase that already uses enums extensively. String enums are less problematic than numeric enums.

### Q3: How does an `as const` object replace an enum?

**A:** `const X = { A: "a", B: "b" } as const` creates a runtime object with exact literal types. `type X = (typeof X)[keyof typeof X]` derives the union type. You get both runtime values (`X.A`) and compile-time types.

## C — Common Pitfalls with Fix

### Pitfall: Numeric enums accepting arbitrary numbers

```ts
enum Role { Admin, User }
function setRole(r: Role) {}
setRole(999) // ✅ — no error!
```

**Fix:** Use string enums or union types: `type Role = "admin" | "user"`.

### Pitfall: `const enum` with `isolatedModules`

```ts
const enum Color { Red, Green, Blue }
// ❌ 'const' enums are not allowed when 'isolatedModules' is enabled
```

**Fix:** Use regular enum or `as const` object.

## K — Coding Challenge with Solution

### Challenge

Refactor this enum-based code to use `as const`:

```ts
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
}

function log(level: LogLevel, message: string) {
  console.log(`[${level}] ${message}`)
}

log(LogLevel.Info, "Server started")
```

### Solution

```ts
const LogLevel = {
  Debug: "DEBUG",
  Info: "INFO",
  Warn: "WARN",
  Error: "ERROR",
} as const

type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]
// "DEBUG" | "INFO" | "WARN" | "ERROR"

function log(level: LogLevel, message: string) {
  console.log(`[${level}] ${message}`)
}

log(LogLevel.Info, "Server started") // ✅
log("INFO", "Also works")           // ✅
log("INVALID", "Nope")              // ❌
```

---

# 10 — Type Assertions & Index Signatures

## T — TL;DR

Type assertions (`as Type`) tell TypeScript "trust me, I know the type" — they bypass inference but not runtime safety; index signatures define types for dynamic property access on objects.

## K — Key Concepts

### Type Assertions

```ts
// TypeScript thinks this is Element | null
const el = document.getElementById("app")

// You know it's an HTMLDivElement:
const div = document.getElementById("app") as HTMLDivElement

// Now you can access div-specific properties:
div.style.color = "red" // ✅
```

### Assertion Rules

Assertions can only go between **related** types:

```ts
const x = "hello" as number
// ❌ Conversion of type 'string' to type 'number' may be a mistake

// Double assertion via `unknown` (escape hatch)
const x = "hello" as unknown as number
// ✅ — but you're lying to the compiler!
```

### `as const` (Special Assertion)

```ts
const x = "hello" as const // type: "hello" (literal)
const arr = [1, 2] as const // type: readonly [1, 2]
```

### Non-Null Assertion (`!`)

```ts
const el = document.getElementById("app") // HTMLElement | null

el.style.color = "red" // ❌ 'el' is possibly null

el!.style.color = "red" // ✅ non-null assertion — "trust me, it exists"
```

**`!` removes `null` and `undefined` from the type.** Use sparingly — if it IS null, you'll crash at runtime.

### When to Use Assertions

```ts
// ✅ Good: You genuinely know more than TypeScript
const canvas = document.getElementById("canvas") as HTMLCanvasElement

// ✅ Good: Type narrowing is impractical
const data = JSON.parse(text) as Config

// ❌ Bad: Silencing errors you don't understand
const x = someValue as any as TargetType
```

### Index Signatures

Define types for objects with dynamic keys:

```ts
interface StringMap {
  [key: string]: number
}

const scores: StringMap = {
  alice: 95,
  bob: 87,
  charlie: 92,
}

scores.alice    // number
scores.unknown  // number (TypeScript trusts the index signature)
// With noUncheckedIndexedAccess: number | undefined ✅
```

### Index Signatures with Specific Properties

```ts
interface Config {
  name: string               // specific property
  version: number            // specific property
  [key: string]: string | number // index signature — must be compatible with all properties
}

const config: Config = {
  name: "my-app",
  version: 1,
  customField: "value", // ✅ — matches index signature
}
```

### `Record` Utility Type (Cleaner Alternative)

```ts
// Instead of index signatures:
type StringMap = Record<string, number>

// More specific:
type UserRoles = Record<string, "admin" | "user" | "guest">

// With specific keys:
type Scores = Record<"alice" | "bob" | "charlie", number>
```

### Template Literal Index Signatures (TS 4.4+)

```ts
interface CSSVariables {
  [key: `--${string}`]: string
}

const vars: CSSVariables = {
  "--color-primary": "#007bff",
  "--font-size": "16px",
  color: "red", // ❌ — doesn't match `--${string}` pattern
}
```

## W — Why It Matters

- Type assertions are necessary for DOM manipulation, JSON parsing, and library interop.
- The non-null assertion `!` is used constantly in tests and when TypeScript can't infer nullability.
- Index signatures are essential for dictionaries, config objects, and dynamic data.
- `Record` is the cleaner alternative for most index signature use cases.
- Overusing assertions is a code smell — it means your types aren't precise enough.

## I — Interview Questions with Answers

### Q1: What is a type assertion?

**A:** A way to tell TypeScript "I know the type better than you." Written as `value as Type`. It doesn't change the runtime value — it only affects the compile-time type. Assertions can only convert between related types.

### Q2: What is the non-null assertion operator?

**A:** `!` after an expression removes `null` and `undefined` from its type. `element!.style` tells TypeScript "I guarantee this is not null." If it IS null, you'll get a runtime crash.

### Q3: What is an index signature?

**A:** `[key: string]: ValueType` on an interface/type, defining the type for any property accessed by string key. It allows objects to have dynamic properties while still being typed.

### Q4: When should you avoid type assertions?

**A:** When proper type narrowing would work (use `typeof`, `in`, `instanceof` checks). When you're silencing errors you don't understand. When `unknown` + narrowing would be safer.

## C — Common Pitfalls with Fix

### Pitfall: Using assertions instead of narrowing

```ts
const data: unknown = fetchData()
const user = data as User // ❌ dangerous — data might not be a User
```

**Fix:** Narrow with type guards:

```ts
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "name" in data
}

if (isUser(data)) {
  data.name // ✅ safe
}
```

### Pitfall: Non-null assertion hiding bugs

```ts
const user = users.find(u => u.id === id)!
//                                        ^ if not found, crash at runtime
```

**Fix:** Handle the null case: `if (!user) throw new Error("not found")`.

### Pitfall: Index signatures not accounting for missing keys

```ts
interface Scores { [name: string]: number }
const scores: Scores = { alice: 95 }
scores.bob.toFixed(2) // Runtime crash — bob is undefined!
```

**Fix:** Enable `noUncheckedIndexedAccess` (Topic 2) — forces `number | undefined`.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `get(obj, key)` function that works with index signatures:

```ts
const scores = { alice: 95, bob: 87 }
get(scores, "alice") // 95 | undefined
get(scores, "unknown") // undefined
```

### Solution

```ts
function get<T extends Record<string, unknown>, K extends string>(
  obj: T,
  key: K
): K extends keyof T ? T[K] : undefined {
  return obj[key] as any
}

// Simpler version using optional:
function get<T extends Record<string, unknown>>(
  obj: T,
  key: string
): T[keyof T] | undefined {
  return obj[key as keyof T]
}

const scores: Record<string, number> = { alice: 95, bob: 87 }
const result = get(scores, "alice") // number | undefined
```

---

# 11 — Type Narrowing (`typeof`, `in`, `instanceof`)

## T — TL;DR

Type narrowing is how TypeScript **refines a broad type to a more specific one** inside conditional blocks — using `typeof`, `in`, `instanceof`, equality checks, and custom type guards.

## K — Key Concepts

### `typeof` Narrowing

```ts
function process(input: string | number) {
  if (typeof input === "string") {
    // input narrowed to `string`
    return input.toUpperCase()
  }
  // input narrowed to `number`
  return input.toFixed(2)
}
```

`typeof` recognizes: `"string"`, `"number"`, `"boolean"`, `"bigint"`, `"symbol"`, `"undefined"`, `"object"`, `"function"`.

### `in` Narrowing

```ts
type Fish = { swim: () => void }
type Bird = { fly: () => void }

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim() // narrowed to Fish
  } else {
    animal.fly() // narrowed to Bird
  }
}
```

### `instanceof` Narrowing

```ts
function formatDate(input: string | Date) {
  if (input instanceof Date) {
    return input.toISOString() // narrowed to Date
  }
  return new Date(input).toISOString() // narrowed to string
}
```

`instanceof` works with classes and constructor functions — connects to `Symbol.hasInstance` (Day 7).

### Equality Narrowing

```ts
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // x and y are both `string` (the only common type)
    x.toUpperCase() // ✅
    y.toUpperCase() // ✅
  }
}

function checkNull(value: string | null) {
  if (value !== null) {
    value.toUpperCase() // ✅ narrowed to string
  }
}
```

### Truthiness Narrowing

```ts
function greet(name: string | null | undefined) {
  if (name) {
    // name is `string` — null, undefined, and "" are all falsy
    return `Hello, ${name}`
  }
  return "Hello, stranger"
}
```

**Caveat:** Truthiness narrowing excludes `""`, `0`, `NaN`, `false` — which might be valid values.

### Discriminated Union Narrowing

```ts
type Result =
  | { status: "success"; data: string }
  | { status: "error"; message: string }

function handle(result: Result) {
  if (result.status === "success") {
    console.log(result.data) // ✅ narrowed to success variant
  } else {
    console.log(result.message) // ✅ narrowed to error variant
  }
}
```

### Custom Type Guards

```ts
function isString(value: unknown): value is string {
  return typeof value === "string"
}

function process(input: unknown) {
  if (isString(input)) {
    input.toUpperCase() // ✅ narrowed to string
  }
}
```

The return type `value is string` is a **type predicate** — it tells TypeScript that if the function returns `true`, the argument is of that type.

### Type Guard for Complex Types

```ts
interface User {
  name: string
  email: string
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string"
  )
}

const data: unknown = JSON.parse(text)
if (isUser(data)) {
  console.log(data.name) // ✅ narrowed to User
}
```

### `asserts` Type Predicates (Assertion Functions)

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Expected string")
  }
}

function process(input: unknown) {
  assertIsString(input)
  // After the assertion, input is narrowed to `string`
  input.toUpperCase() // ✅
}
```

`asserts value is Type` means: "After this function returns (without throwing), the value IS that type."

### Control Flow Analysis

TypeScript tracks narrowing through assignments:

```ts
let value: string | number = "hello"

value // string (initially assigned a string)

value = 42
value // number (reassigned to a number)
```

And through early returns:

```ts
function process(input: string | null) {
  if (input === null) {
    return // early return for null
  }

  // TypeScript knows input is `string` here
  input.toUpperCase() // ✅
}
```

## W — Why It Matters

- Type narrowing is **how you work with union types** — you can't use a union without narrowing.
- Custom type guards bridge TypeScript's compile-time types with runtime checks.
- Discriminated union narrowing is the foundation of React state management and API handling.
- `asserts` functions enable clean validation patterns.
- Narrowing is tested in virtually every TypeScript interview.

## I — Interview Questions with Answers

### Q1: What is type narrowing?

**A:** The process of refining a broad type to a more specific one using conditional checks. TypeScript's control flow analysis tracks these checks and updates the type in each branch.

### Q2: What is a type predicate?

**A:** A return type of the form `param is Type` on a function. It tells TypeScript that if the function returns `true`, the parameter is of the specified type. Used in custom type guard functions.

### Q3: What is an assertion function?

**A:** A function with return type `asserts param is Type`. After the function returns (without throwing), the parameter is narrowed to the specified type. It's like a type guard that throws instead of returning boolean.

### Q4: How does discriminated union narrowing work?

**A:** When a union has a common property with literal types (the discriminant), checking that property in an `if` or `switch` narrows the entire union to the matching variant.

## C — Common Pitfalls with Fix

### Pitfall: Type guard doesn't narrow in callbacks

```ts
function isString(x: unknown): x is string { return typeof x === "string" }

const values: unknown[] = [1, "hello", true]

values.forEach(v => {
  if (isString(v)) {
    v.toUpperCase() // ✅ works — narrowed inside the callback
  }
})

// But:
const strings = values.filter(isString)
// type: unknown[] — filter doesn't narrow! (before TS 5.5)

// TS 5.5+: filter with type predicates works:
const strings = values.filter(isString) // string[] ✅
```

### Pitfall: Truthiness narrowing removing valid falsy values

```ts
function process(count: number | null) {
  if (count) {
    count.toFixed(2) // ✅ — but 0 is excluded! (falsy)
  }
}
```

**Fix:** Use explicit null check: `if (count !== null)`.

### Pitfall: Custom type guard lying about the type

```ts
function isUser(data: unknown): data is User {
  return true // Always returns true — type guard lies!
}
```

**Fix:** Type guards must actually validate. TypeScript trusts the `is` assertion — if it's wrong, you get runtime crashes. Use Zod (Day 12) for robust runtime validation.

## K — Coding Challenge with Solution

### Challenge

Create a type guard `isApiResponse<T>` for this discriminated union:

```ts
type ApiResponse<T> =
  | { status: "success"; data: T; timestamp: number }
  | { status: "error"; message: string; code: number }
  | { status: "loading" }

// Should work:
const response: unknown = await fetchData()
if (isApiResponse(response)) {
  // narrow based on status
}
```

### Solution

```ts
function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== "object" || value === null) return false
  if (!("status" in value)) return false

  const v = value as Record<string, unknown>

  if (v.status === "success") {
    return "data" in value && "timestamp" in value && typeof v.timestamp === "number"
  }

  if (v.status === "error") {
    return (
      "message" in value &&
      typeof v.message === "string" &&
      "code" in value &&
      typeof v.code === "number"
    )
  }

  if (v.status === "loading") {
    return true
  }

  return false
}

// Usage:
const response: unknown = await fetchData()

if (isApiResponse(response)) {
  switch (response.status) {
    case "success":
      console.log(response.data) // ✅ narrowed
      break
    case "error":
      console.error(response.message, response.code) // ✅ narrowed
      break
    case "loading":
      console.log("Loading...") // ✅ narrowed
      break
  }
}
```

---

# 12 — TypeScript Class Features

## T — TL;DR

TypeScript adds access modifiers (`public`/`private`/`protected`/`readonly`), abstract classes, constructor shorthand, and `override` to JavaScript classes — providing compile-time encapsulation and contract enforcement.

## K — Key Concepts

### Access Modifiers

```ts
class User {
  public name: string       // accessible everywhere (default)
  private password: string  // only inside this class
  protected email: string   // inside this class and subclasses
  readonly id: string       // can't be changed after construction

  constructor(name: string, password: string, email: string, id: string) {
    this.name = name
    this.password = password
    this.email = email
    this.id = id
  }
}

const user = new User("Mark", "secret", "mark@test.com", "1")

user.name       // ✅ public
user.password   // ❌ Property 'password' is private
user.email      // ❌ Property 'email' is protected
user.id = "2"   // ❌ Cannot assign to 'id' because it is read-only
```

**Important:** `private` and `protected` are **compile-time only**. At runtime, the properties are accessible. Use JavaScript's `#private` fields for true runtime encapsulation.

### TypeScript `private` vs JavaScript `#private`

```ts
class Example {
  private tsPrivate = "compile-time only"
  #jsPrivate = "true runtime private"
}

const ex = new Example()
// @ts-expect-error — TS blocks access at compile time
ex.tsPrivate // ❌ compile error — but (ex as any).tsPrivate works at runtime!

ex.#jsPrivate // ❌ both compile AND runtime error
```

**Recommendation:** Use `#private` for true privacy. Use TS `private` when you need runtime access in tests or when `#private` is unavailable.

### Constructor Shorthand (Parameter Properties)

```ts
// Long form:
class User {
  public name: string
  private age: number

  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}

// Shorthand — equivalent:
class User {
  constructor(
    public name: string,
    private age: number,
  ) {}
  // Properties are automatically declared AND assigned
}
```

Adding `public`, `private`, `protected`, or `readonly` to a constructor parameter **automatically**:
1. Declares the property
2. Assigns the argument to it

### `readonly` Properties

```ts
class Config {
  constructor(
    readonly host: string,
    readonly port: number,
  ) {}
}

const config = new Config("localhost", 3000)
config.host = "remote" // ❌ Cannot assign to 'host' because it is read-only
```

### Abstract Classes

```ts
abstract class Shape {
  abstract area(): number    // must be implemented by subclasses
  abstract perimeter(): number

  // Can have concrete methods too:
  describe(): string {
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super()
  }

  area(): number {
    return Math.PI * this.radius ** 2
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius
  }
}

// const shape = new Shape() // ❌ Cannot create an instance of an abstract class
const circle = new Circle(5)
circle.describe() // "Area: 78.54, Perimeter: 31.42"
```

### `override` Keyword (TS 4.3+)

```ts
class Base {
  greet() {
    return "Hello"
  }
}

class Derived extends Base {
  override greet() { // explicitly marks this as overriding a parent method
    return "Hi"
  }

  override nonExistent() { // ❌ This member cannot have an 'override' modifier
    return "oops"          //    because it is not declared in the base class
  }
}
```

With `"noImplicitOverride": true` in tsconfig, ALL overrides MUST use the `override` keyword.

### Implements (Interface Contracts)

```ts
interface Serializable {
  serialize(): string
  deserialize(data: string): void
}

class User implements Serializable {
  constructor(public name: string) {}

  serialize(): string {
    return JSON.stringify({ name: this.name })
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data)
    this.name = parsed.name
  }
}

// A class can implement multiple interfaces:
class Admin implements Serializable, Printable { /* ... */ }
```

### `implements` vs `extends`

```ts
// extends → inheritance (one parent, includes implementation)
class Admin extends User { /* inherits User's code */ }

// implements → contract (no code inherited, must implement everything)
class Admin implements Serializable { /* must write all methods */ }

// Can combine:
class Admin extends User implements Serializable, Loggable {}
```

### Static Members

```ts
class Counter {
  static count = 0

  static increment() {
    Counter.count++
  }

  static reset() {
    Counter.count = 0
  }
}

Counter.increment()
Counter.increment()
console.log(Counter.count) // 2
```

### Generic Classes

```ts
class Stack<T> {
  #items: T[] = []

  push(item: T) {
    this.#items.push(item)
  }

  pop(): T | undefined {
    return this.#items.pop()
  }

  peek(): T | undefined {
    return this.#items.at(-1)
  }

  get size(): number {
    return this.#items.length
  }
}

const numStack = new Stack<number>()
numStack.push(1)
numStack.push(2)
numStack.pop() // number | undefined

const strStack = new Stack<string>()
strStack.push("hello")
```

## W — Why It Matters

- Access modifiers are used in every OOP TypeScript codebase (Angular, NestJS).
- Constructor shorthand reduces boilerplate dramatically.
- Abstract classes define contracts that subclasses must follow.
- `override` prevents silent bugs when parent methods are renamed.
- `implements` ensures classes conform to interfaces — used in Dependency Injection (Day 11).
- Generic classes are the foundation for typed collections, services, and repositories.

## I — Interview Questions with Answers

### Q1: What is the difference between `private` and `#private`?

**A:** TypeScript's `private` is compile-time only — at runtime, the property is accessible. JavaScript's `#private` is enforced at both compile-time and runtime — truly private. Use `#private` when possible; `private` for compatibility or test access.

### Q2: What does the `override` keyword do?

**A:** Explicitly marks a method as overriding a parent class method. With `noImplicitOverride` enabled, all overrides MUST use `override`. If the parent method doesn't exist, TypeScript errors — preventing bugs from typos or parent class changes.

### Q3: What is an abstract class?

**A:** A class that can't be instantiated directly. It defines abstract methods (no implementation) that subclasses must implement, and can also have concrete methods with shared implementation. It's a contract + shared code.

### Q4: What is constructor shorthand?

**A:** Adding `public`, `private`, `protected`, or `readonly` before a constructor parameter automatically declares it as a property and assigns the argument. Reduces boilerplate from 6+ lines to 1.

## C — Common Pitfalls with Fix

### Pitfall: Thinking TS `private` is truly private

```ts
class Secret {
  private key = "abc123"
}

const s = new Secret()
console.log((s as any).key) // "abc123" — accessible at runtime!
```

**Fix:** Use `#key` for true privacy.

### Pitfall: Forgetting to call `super()` in subclass constructors

```ts
class Base {
  constructor(public name: string) {}
}

class Child extends Base {
  constructor(name: string, public age: number) {
    // Must call super() before accessing `this`
    super(name)
  }
}
```

### Pitfall: `strictPropertyInitialization` errors

```ts
class User {
  name: string // ❌ Property 'name' has no initializer
}
```

**Fix:** Initialize in constructor, use `!` (definite assignment), or make optional:

```ts
class User {
  name: string
  constructor(name: string) { this.name = name } // ✅

  // Or:
  name!: string // ✅ "I'll set this later, trust me"

  // Or:
  name?: string // ✅ optional
}
```

## K — Coding Challenge with Solution

### Challenge

Create an abstract `Repository<T>` class with:
- Abstract `findById(id: string): T | undefined`
- Abstract `save(item: T): void`
- Concrete `exists(id: string): boolean` (uses `findById`)

Then implement `UserRepository`:

### Solution

```ts
interface Entity {
  id: string
}

abstract class Repository<T extends Entity> {
  abstract findById(id: string): T | undefined
  abstract save(item: T): void

  exists(id: string): boolean {
    return this.findById(id) !== undefined
  }
}

interface User extends Entity {
  name: string
  email: string
}

class UserRepository extends Repository<User> {
  #users = new Map<string, User>()

  findById(id: string): User | undefined {
    return this.#users.get(id)
  }

  save(user: User): void {
    this.#users.set(user.id, user)
  }
}

const repo = new UserRepository()
repo.save({ id: "1", name: "Mark", email: "mark@test.com" })

repo.exists("1") // true — uses abstract findById internally
repo.exists("2") // false
repo.findById("1") // { id: "1", name: "Mark", email: "mark@test.com" }
```

This is a preview of the Repository pattern covered in depth on Day 11.

---

# ✅ Day 8 Complete — Phase 2 Begins!

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Why TypeScript & How It Works | ✅ T-KWICK |
| 2 | `tsconfig.json` & Strict Mode | ✅ T-KWICK |
| 3 | Type Inference | ✅ T-KWICK |
| 4 | Primitive Types & Special Types (`any`/`unknown`/`never`/`void`) | ✅ T-KWICK |
| 5 | `type` vs `interface` | ✅ T-KWICK |
| 6 | Union & Intersection Types | ✅ T-KWICK |
| 7 | Literal Types & `as const` | ✅ T-KWICK |
| 8 | Tuples | ✅ T-KWICK |
| 9 | Enums vs Union Types | ✅ T-KWICK |
| 10 | Type Assertions & Index Signatures | ✅ T-KWICK |
| 11 | Type Narrowing (`typeof`/`in`/`instanceof`) | ✅ T-KWICK |
| 12 | TypeScript Class Features | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 8` | 5 interview-style problems covering all 12 topics |
| `Generate Day 9` | Generics & Utility Types |
| `next topic` | Start Day 9's first subtopic |
| `recap` | Quick Day 8 summary |

> The type system is now your tool. Tomorrow, generics make it powerful.