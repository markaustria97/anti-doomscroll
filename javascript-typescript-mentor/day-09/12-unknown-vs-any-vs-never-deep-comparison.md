# 12 — `unknown` vs `any` vs `never` — Deep Comparison

## T — TL;DR

`any` is the **escape hatch** that disables type checking, `unknown` is the **safe top type** that requires narrowing, and `never` is the **bottom type** representing impossible values — understanding their positions in the type hierarchy is key to writing correct TypeScript.

## K — Key Concepts

### The Type Hierarchy

```
          any (top — accepts everything, assignable TO everything)
           ↑
        unknown (top — accepts everything, assignable TO nothing without narrowing)
       ↗  ↑  ↖
  string number boolean object ... (regular types)
       ↘  ↓  ↙
         never (bottom — accepts nothing, assignable TO everything)
```

### Assignability Matrix

```ts
// What can you ASSIGN TO the type?
let a: any     = 42       // ✅ anything
let u: unknown = 42       // ✅ anything
let s: string  = "hello"  // ✅ strings only
let n: never   // ❌ NOTHING can be assigned to never (except never)

// What can the type BE ASSIGNED TO?
let x: string = a    // ✅ any assignable to anything
let y: string = u    // ❌ unknown NOT assignable without narrowing
let z: any = n       // ✅ never assignable to anything
```

### Complete Comparison Table

| Feature | `any` | `unknown` | `never` |
|---------|-------|-----------|---------|
| Assign anything TO it | ✅ | ✅ | ❌ |
| Assign it TO anything | ✅ | ❌ (must narrow) | ✅ |
| Access properties | ✅ (no check) | ❌ (must narrow) | N/A (can't have a value) |
| Call as function | ✅ (no check) | ❌ (must narrow) | N/A |
| Type safety | ❌ None | ✅ Full | ✅ Full |
| Use case | Escape hatch, migration | External data, catch blocks | Impossible states, exhaustiveness |
| Position in hierarchy | Top (special) | Top | Bottom |

### `any` — Disables Everything

```ts
const x: any = "hello"
x.foo.bar.baz()  // ✅ no error — TypeScript stops checking
x * 2            // ✅ no error
x.nonExistent    // ✅ no error

// any is CONTAGIOUS:
const y = x + 1  // y is `any`
const z = x.trim() // z is `any`
```

### `unknown` — Safe Top Type

```ts
const x: unknown = "hello"
x.toUpperCase()  // ❌ 'x' is of type 'unknown'
x + 1            // ❌ 'x' is of type 'unknown'

// Must narrow:
if (typeof x === "string") {
  x.toUpperCase() // ✅
}

// Or use type assertion (less safe):
(x as string).toUpperCase() // ✅ but risky
```

### `never` — Bottom Type

```ts
// Functions that never return:
function throwError(msg: string): never {
  throw new Error(msg)
}

function infinite(): never {
  while (true) {}
}

// Exhaustiveness checking:
type Shape = "circle" | "square"

function area(shape: Shape): number {
  switch (shape) {
    case "circle": return Math.PI * 100
    case "square": return 100
    default:
      const _exhaustive: never = shape // ✅ — all cases handled
      return _exhaustive
  }
}

// Impossible intersection:
type Impossible = string & number // never

// Empty union:
type Empty = never // no possible values
```

### `never` in Conditional Types

```ts
// never is the "zero" of union types:
type A = string | never  // string (never is removed)
type B = string & never  // never (intersection with never = never)

// This is why Exclude works:
type Exclude<T, U> = T extends U ? never : T
// never members are removed from the union
```

### When to Use Each

```ts
// unknown — for external/untrusted data
function parseJSON(text: string): unknown {
  return JSON.parse(text)
}

// unknown — for catch blocks
try {
  riskyOperation()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message) // narrowed
  }
}

// never — for exhaustiveness
function assertNever(value: never): never {
  throw new Error(`Unexpected: ${value}`)
}

// never — for functions that always throw
function fail(message: string): never {
  throw new Error(message)
}

// any — ONLY for JS migration or genuinely untyped third-party code
const legacyLibResult: any = oldLib.doSomething()
```

### `unknown` in Generic Constraints

```ts
// Accept any function:
type AnyFn = (...args: unknown[]) => unknown

// vs the old way:
type AnyFnOld = (...args: any[]) => any
// The unknown version is safer for consumers
```

### `never` in Advanced Types

```ts
// Filter object keys by value type:
type StringKeysOnly<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

type User = { name: string; age: number; email: string }
type StringKeys = StringKeysOnly<User> // "name" | "email"

// Why: keys mapped to `never` are removed when you index with `[keyof T]`
```

### The Decision Flowchart

```
Do you know the type?
├─ YES → use the specific type (string, User, etc.)
├─ NO, but it's from external/untrusted source → use unknown
├─ NO, and you need to gradually migrate JS → use any (temporarily)
└─ Is it a value that can never exist? → use never
```

## W — Why It Matters

- `unknown` vs `any` is the **single most asked** TypeScript interview question.
- Using `unknown` instead of `any` for external data prevents entire categories of bugs.
- `never` for exhaustiveness checking catches missing switch cases at compile time.
- Understanding the type hierarchy (top/bottom) is key to understanding conditional types and generics.
- The shift from `any` to `unknown` in `catch` blocks (TS 4.4+) improved error handling across the ecosystem.

## I — Interview Questions with Answers

### Q1: Explain `any` vs `unknown` vs `never`

**A:**
- `any`: Disables type checking. Anything can be assigned to it and it can be assigned to anything. Use for JS migration only.
- `unknown`: The safe top type. Anything can be assigned to it, but you must narrow before using it. Use for external/untrusted data.
- `never`: The bottom type. Nothing can be assigned to it (except `never`), but it can be assigned to anything. Use for impossible states and exhaustiveness checking.

### Q2: Why should you prefer `unknown` over `any` for `catch` blocks?

**A:** With `any`, you can access any property without checking: `error.message` — but `error` might be a string, number, or anything. With `unknown`, you must narrow first: `if (error instanceof Error)` — preventing runtime crashes.

### Q3: What happens when you union or intersect with `never`?

**A:** Union: `T | never = T` (never is removed — it's the identity element). Intersection: `T & never = never` (never absorbs everything). This is why conditional types use `never` to filter union members.

### Q4: Can a variable have type `never`?

**A:** Only in unreachable code or after exhaustiveness checking. You can't create a value of type `never` — that's the point. If TypeScript narrows a value to `never`, it means you've proven it can't exist (all cases handled).

## C — Common Pitfalls with Fix

### Pitfall: Using `any` "just to make it compile"

```ts
const data: any = response.data
data.forEach(item => item.process()) // compiles, crashes at runtime
```

**Fix:** Use `unknown` and narrow, or use Zod for runtime validation.

### Pitfall: Catching `unknown` without narrowing

```ts
catch (error: unknown) {
  console.log(error.message) // ❌ 'error' is of type 'unknown'
}
```

**Fix:**

```ts
catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.log(message)
}
```

### Pitfall: Thinking `never` means `void`

```ts
function log(msg: string): void { console.log(msg) }   // returns undefined
function fail(msg: string): never { throw new Error(msg) } // never returns

// void = function returns (with undefined)
// never = function NEVER returns (throws or infinite loop)
```

**Fix:** `void` for functions that return normally without a value. `never` for functions that never complete.

## K — Coding Challenge with Solution

### Challenge

Implement `safeParse<T>` that:
- Takes a JSON string and a type guard
- Returns `{ success: true; data: T }` or `{ success: false; error: string }`
- Never throws

```ts
const result = safeParse('{"name":"Mark"}', isUser)
if (result.success) {
  result.data.name // ✅ User
}
```

### Solution

```ts
type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function safeParse<T>(
  json: string,
  guard: (data: unknown) => data is T
): SafeParseResult<T> {
  let parsed: unknown

  try {
    parsed = JSON.parse(json)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown parse error"
    return { success: false, error: message }
  }

  if (guard(parsed)) {
    return { success: true, data: parsed }
  }

  return { success: false, error: "Data does not match expected type" }
}

// Usage:
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as any).name === "string"
  )
}

const result = safeParse('{"name":"Mark"}', isUser)

if (result.success) {
  console.log(result.data.name) // ✅ "Mark"
} else {
  console.error(result.error)
}
```

This is a preview of the full `Result` pattern and Zod-based validation covered on Day 12.

---

# ✅ Day 9 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Generic Functions | ✅ T-KWICK |
| 2 | Generic Interfaces & Type Aliases | ✅ T-KWICK |
| 3 | Generic Constraints (`extends`) | ✅ T-KWICK |
| 4 | Multiple Type Parameters & Default Types | ✅ T-KWICK |
| 5 | Generic Classes | ✅ T-KWICK |
| 6 | `Partial`, `Required`, `Readonly` | ✅ T-KWICK |
| 7 | `Pick`, `Omit`, `Record` | ✅ T-KWICK |
| 8 | `ReturnType`, `Parameters`, `InstanceType` | ✅ T-KWICK |
| 9 | `Awaited` & Unwrapping Promises | ✅ T-KWICK |
| 10 | `Extract`, `Exclude`, `NonNullable` | ✅ T-KWICK |
| 11 | Advanced Type Guards & Assertion Functions | ✅ T-KWICK |
| 12 | `unknown` vs `any` vs `never` — Deep Comparison | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 9` | 5 interview-style problems covering all 12 topics |
| `Generate Day 10` | Advanced TypeScript — Conditional types, mapped types, `infer`, template literals, decorators |
| `next topic` | Start Day 10's first subtopic |
| `recap` | Quick Day 9 summary |

> Generics are now your tool. Tomorrow, you learn to program the type system itself.
