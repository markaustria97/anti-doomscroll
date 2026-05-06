# 3 — User-Defined Type Guards & Assertion Functions

## T — TL;DR

Type guards (`val is T`) return `boolean` and narrow inside the `if` branch; assertion functions (`asserts val is T`) throw on failure and narrow *everything after* the call.

## K — Key Concepts

```ts
// ── User-defined type guard — `val is T` ──────────────────
// Returns boolean: narrowing applies inside the if branch only
function isString(val: unknown): val is string {
  return typeof val === "string"
}

function isUser(val: unknown): val is User {
  return (
    typeof val === "object" &&
    val !== null &&
    "id" in val && typeof (val as any).id === "number" &&
    "name" in val && typeof (val as any).name === "string"
  )
}

const data: unknown = fetchData()
if (isUser(data)) {
  data.name        // ✅ User — narrowed inside the if
  data.id          // ✅ number
}
// data is still unknown here

// ── Assertion function — `asserts val is T` ───────────────
// Throws on failure: narrowing applies to ALL code AFTER the call
function assertIsUser(val: unknown): asserts val is User {
  if (!isUser(val)) throw new Error("Expected a User")
}

function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== "string") throw new TypeError(`Expected string, got ${typeof val}`)
}

// Assertion without type narrowing — just throws if falsy
function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) throw new Error(msg)
}

const config: unknown = loadConfig()
assertIsUser(config)  // throws if not User
config.name           // ✅ User for the rest of the function scope!

// ── Key difference: scope of narrowing ────────────────────
function useTypeGuard(val: unknown) {
  if (isString(val)) {
    val.toUpperCase()   // ✅ narrowed here
  }
  val.toUpperCase()     // ❌ still unknown — narrowing only in if block
}

function useAssertion(val: unknown) {
  assertIsString(val)
  val.toUpperCase()     // ✅ narrowed here AND below — permanently
  val.length            // ✅
}

// ── Practical: assertDefined ──────────────────────────────
function assertDefined<T>(val: T | null | undefined, msg?: string): asserts val is T {
  if (val == null) throw new Error(msg ?? "Value is null or undefined")
}

const user = getUser()  // User | null
assertDefined(user, "User must exist before render")
user.name  // ✅ User — null eliminated

// ── Practical: DOM assertion ──────────────────────────────
function assertElement<T extends HTMLElement>(
  el: Element | null, type: new () => T
): asserts el is T {
  if (!(el instanceof type)) throw new Error(`Expected ${type.name}`)
}

const input = document.querySelector("#email")
assertElement(input, HTMLInputElement)
input.value  // ✅ HTMLInputElement
```


## W — Why It Matters

Assertion functions are ideal for setup code — after calling `assertIsUser(data)` at the top of a function, you never need another null check throughout. Type guards are better for conditional branches. Libraries like Zod generate assertion functions under the hood when you call `.parse()`.

## I — Interview Q&A

**Q: What's the difference between a type guard function and an assertion function?**
A: A type guard (`val is T`) returns `boolean` — narrowing only applies in the `true` branch of the caller's `if`. An assertion function (`asserts val is T`) throws instead of returning `false` — narrowing applies to all code after the call, for the rest of the scope.

**Q: What does `asserts condition` (without `is T`) do?**
A: It tells TypeScript: "if this function returns normally, then `condition` is truthy." It narrows the type of `condition` itself without specifying an exact type — useful for generic `assert(someCheck, "message")` helpers.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Type guard returning a non-boolean expression | The body must actually check the type — a wrong body silently lies |
| `asserts val is T` on a function that catches errors internally | If the function doesn't throw on failure, narrowing is wrong |
| Forgetting the `asserts` keyword — function becomes `void` | Must be `asserts val is T` not `val is T` for assertion functions |

## K — Coding Challenge

**Write both a type guard and an assertion function for `ApiResponse<T>`:**

```ts
interface ApiResponse<T> { success: boolean; data: T; error?: string }
// isApiSuccess(val): narrows to { success: true; data: T }
// assertApiSuccess(val): throws if not success, narrows after call
```

**Solution:**

```ts
type SuccessResponse<T> = { success: true; data: T }

function isApiSuccess<T>(val: ApiResponse<T>): val is SuccessResponse<T> {
  return val.success === true
}

function assertApiSuccess<T>(
  val: ApiResponse<T>
): asserts val is SuccessResponse<T> {
  if (!val.success) throw new Error(`API Error: ${val.error ?? "unknown"}`)
}

// Usage:
assertApiSuccess(response)
response.data   // ✅ T — fully narrowed
```


***
