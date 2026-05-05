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

## I — Interview Q&A

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
