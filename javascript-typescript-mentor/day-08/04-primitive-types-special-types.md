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
