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

## I — Interview Q&A

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
