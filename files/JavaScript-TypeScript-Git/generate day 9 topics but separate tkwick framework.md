<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day  topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 9
TypeScript Narrowing, Declarations \& Advanced Patterns
narrowing with typeof, instanceof, in, equality, truthiness, assignment narrowing, discriminated unions, user-defined type guards, assertion functions, exhaustiveness checking with never, satisfies operator, satisfies with as const, type assertions and double-casting risks, @ts-expect-error, @ts-ignore, @ts-nocheck, ambient declarations, declare const/function/class/module, declare global, abstract classes, branded types, enums vs const objects, declaration merging, module augmentation, @types packages, .d.ts files, non-null assertion, handling unknown external data, variance, useUnknownInCatchVariables.

Here is **Day 9 — TypeScript Narrowing, Declarations \& Advanced Patterns** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 9 — TypeScript Narrowing, Declarations \& Advanced Patterns

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the code. Move on.

***

# 1 — Narrowing: `typeof`, `instanceof`, `in`, Equality \& Truthiness

## T — TL;DR

Narrowing is TypeScript refining a broad type into a specific one inside a guarded block — every `if`, `switch`, `typeof`, and `instanceof` check is a narrowing operation.[^1]

## K — Key Concepts

```ts
// ── typeof narrowing ──────────────────────────────────────
function process(val: string | number | boolean | null) {
  if (typeof val === "string") {
    val.toUpperCase()   // ✅ string here
  } else if (typeof val === "number") {
    val.toFixed(2)      // ✅ number here
  } else if (typeof val === "boolean") {
    val.toString()      // ✅ boolean here
  }
  // val is null here (all others eliminated)
}

// typeof checks: "string" | "number" | "bigint" | "boolean"
//                "symbol" | "undefined" | "object" | "function"
// ⚠️ typeof null === "object" — special case!

// ── instanceof narrowing ──────────────────────────────────
function handleError(err: unknown) {
  if (err instanceof Error) {
    console.error(err.message, err.stack)  // ✅ Error fields available
  } else if (err instanceof TypeError) {   // subclass check
    console.error("Type error:", err.message)
  }
}

class Dog { bark() {} }
class Cat { meow() {} }
function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) animal.bark()  // Dog
  else animal.meow()                        // Cat (TypeScript knows)
}

// ── in narrowing — property existence check ───────────────
type Admin = { role: "admin"; permissions: string[] }
type User = { role: "user"; name: string }

function greet(person: Admin | User) {
  if ("permissions" in person) {
    person.permissions   // ✅ Admin
  } else {
    person.name          // ✅ User
  }
}

// ── Equality narrowing ────────────────────────────────────
function getStatus(x: string | null): string {
  if (x === null) {
    return "empty"       // x is null here
  }
  return x.toUpperCase() // x is string here — null eliminated
}

// Triple equals vs double equals:
// x === null  → only null
// x == null   → null OR undefined (useful for nullable checks)

// ── Truthiness narrowing ──────────────────────────────────
function logIfPresent(val: string | null | undefined) {
  if (val) {
    val.toUpperCase()   // ✅ string (null/undefined filtered out)
  }
}
// ⚠️ Truthiness also filters 0, "", false, NaN
// Use === null / === undefined for intentional null checks

// ── Assignment narrowing ──────────────────────────────────
let x: string | number = Math.random() > 0.5 ? "hello" : 42
// x: string | number

x = "forced string"   // narrowed: x is now string
x.toUpperCase()        // ✅ string — assignment narrows permanently
```


## W — Why It Matters

Narrowing is what makes TypeScript's `string | number | null` unions actually safe to use. Without it, you could never call `.toUpperCase()` on a `string | number` without a cast. Every senior TypeScript developer instinctively writes narrowing before accessing union properties. [^1]

## I — Interview Q\&A

**Q: Why can't you use `typeof` to narrow `null`?**
A: `typeof null === "object"` in JavaScript — a historical quirk. To narrow out `null`, use `=== null`, `!= null`, or `val !== null && val !== undefined`. Relying on `typeof val === "object"` will also include `null`.

**Q: What is the difference between `in` narrowing and `instanceof`?**
A: `instanceof` checks the prototype chain — for class instances. `in` checks if a property key exists on an object — for structural/interface types that have no constructor. Use `instanceof` for classes, `in` for plain objects with discriminating property names.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Truthy check on `0` or `""` filtering valid values | Use `!== null && !== undefined` not just `if (val)` for optional fields |
| Narrowing inside async callbacks undone by TypeScript | Re-narrow after each `await` — TS resets control flow across async boundaries |
| `typeof val === "object"` not catching `null` | Always add `val !== null` when expecting an object |

## K — Coding Challenge

**Narrow this function correctly for all branches:**

```ts
function display(val: string | number | null | undefined): string {
  // return "empty" if null/undefined, toFixed(2) for number, toUpperCase for string
}
```

**Solution:**

```ts
function display(val: string | number | null | undefined): string {
  if (val == null) return "empty"              // null + undefined eliminated
  if (typeof val === "number") return val.toFixed(2)  // number
  return val.toUpperCase()                     // string (only remaining)
}
```


***

# 2 — Discriminated Unions \& Exhaustiveness Checking with `never`

## T — TL;DR

Discriminated unions use a shared literal field to let TypeScript narrow each variant; `never` in the `default` branch guarantees you've handled all cases — if you add a new variant, TypeScript errors everywhere you forgot to update.[^1]

## K — Key Concepts

```ts
// ── Discriminated union ────────────────────────────────────
type NetworkState =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; code: number; message: string }

function render(state: NetworkState): string {
  switch (state.status) {           // `status` is the discriminant
    case "loading":
      return "Loading..."
    case "success":
      return state.data.join(", ") // ✅ data available here
    case "error":
      return `Error ${state.code}: ${state.message}` // ✅ code + message
  }
}

// ── Exhaustiveness check with never ───────────────────────
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`)
}

function renderWithExhaustive(state: NetworkState): string {
  switch (state.status) {
    case "loading":  return "Loading..."
    case "success":  return state.data.join(", ")
    case "error":    return `Error ${state.code}: ${state.message}`
    default:
      return assertNever(state)   // ← state is `never` here if all cases handled
  }
}
// Add a new variant to NetworkState without updating this switch
// → TypeScript error: Argument of type '{ status: "timeout" }' is not assignable to 'never'
// You get a compile error at every switch that isn't updated ✅

// ── Alternative: never assignment pattern ─────────────────
function renderAlt(state: NetworkState): string {
  switch (state.status) {
    case "loading":  return "Loading..."
    case "success":  return state.data.join(", ")
    case "error":    return `Error ${state.code}: ${state.message}`
    default: {
      const _exhaustive: never = state  // inline — same effect, no helper needed
      throw new Error(`Unhandled: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

// ── Discriminated unions for Redux/state machines ──────────
type Action =
  | { type: "INCREMENT"; by: number }
  | { type: "DECREMENT"; by: number }
  | { type: "RESET" }

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "INCREMENT": return state + action.by  // ✅ by is number
    case "DECREMENT": return state - action.by  // ✅ by is number
    case "RESET":     return 0
    default: return assertNever(action)         // exhaustive guard
  }
}
```


## W — Why It Matters

The `assertNever` pattern is the TypeScript equivalent of a compile-time test for completeness. When a business model grows (new payment method, new order status), TypeScript enforces that every handler is updated — before the code ships. This is the pattern that prevents "we forgot to handle the new case" bugs.[^1]

## I — Interview Q\&A

**Q: What makes a union "discriminated"?**
A: A shared property with a unique literal type per variant — the discriminant. `{ status: "loading" }` and `{ status: "success" }` share `status` but with different literal values. TypeScript uses this to narrow the entire object's type inside each branch.

**Q: What happens if you skip the `default: assertNever(state)` pattern?**
A: TypeScript only errors on missing cases if it can prove the function doesn't return in some path (with `noImplicitReturns`). Without `assertNever`, you might miss a case silently. With it, TypeScript catches unhandled variants at compile time.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Discriminant is not a literal type (e.g., `status: string`) | Use string literal types: `status: "loading" \| "success"` not `string` |
| Two variants sharing the same discriminant value | Each discriminant value must be unique per variant |
| `assertNever` missing from the codebase — just using `default: break` | Always implement the helper — it's 2 lines and saves hours |

## K — Coding Challenge

**Add a new `"cancelled"` variant and ensure `assertNever` catches every switch that's missing the new case:**

```ts
type OrderStatus =
  | { status: "pending" }
  | { status: "fulfilled"; shippedAt: Date }
  // Add: | { status: "cancelled"; reason: string }
```

**Solution:**

```ts
type OrderStatus =
  | { status: "pending" }
  | { status: "fulfilled"; shippedAt: Date }
  | { status: "cancelled"; reason: string }   // ← new variant

function describeOrder(order: OrderStatus): string {
  switch (order.status) {
    case "pending":   return "Waiting for fulfillment"
    case "fulfilled": return `Shipped on ${order.shippedAt.toDateString()}`
    case "cancelled": return `Cancelled: ${order.reason}` // ← must add this
    default: return assertNever(order)  // errors if any case is missing
  }
}
```


***

# 3 — User-Defined Type Guards \& Assertion Functions

## T — TL;DR

Type guards (`val is T`) return `boolean` and narrow inside the `if` branch; assertion functions (`asserts val is T`) throw on failure and narrow *everything after* the call.[^2][^5]

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

Assertion functions are ideal for setup code — after calling `assertIsUser(data)` at the top of a function, you never need another null check throughout. Type guards are better for conditional branches. Libraries like Zod generate assertion functions under the hood when you call `.parse()`.[^5][^2]

## I — Interview Q\&A

**Q: What's the difference between a type guard function and an assertion function?**
A: A type guard (`val is T`) returns `boolean` — narrowing only applies in the `true` branch of the caller's `if`. An assertion function (`asserts val is T`) throws instead of returning `false` — narrowing applies to all code after the call, for the rest of the scope.[^2]

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

# 4 — The `satisfies` Operator \& `satisfies` with `as const`

## T — TL;DR

`satisfies` validates that a value matches a type *without widening it* — you get type-checking errors AND retain narrow literal types; `as const satisfies T` combines immutability + validation in one expression.[^3][^6][^7]

## K — Key Concepts

```ts
// ── The problem satisfies solves ──────────────────────────

// Option A: explicit annotation — widens to declared type
const theme: Record<string, string> = {
  primary: "#007bff",
  secondary: "#6c757d"
}
theme.primary  // type: string — lost the literal "#007bff"

// Option B: no annotation — no type checking, may be wrong
const theme = {
  primary: "#007bff",
  secundary: "#6c757d"  // ← typo — no error!
}

// ── satisfies — best of both worlds ──────────────────────
type ThemeColors = Record<"primary" | "secondary" | "background", string>

const theme = {
  primary: "#007bff",
  secondary: "#6c757d",
  background: "#ffffff",
  // extra: "red"   // ❌ Error: object may only specify known properties
} satisfies ThemeColors   // validates structure ✅

theme.primary  // type: "#007bff" — LITERAL type preserved! (not just string)

// ── satisfies + as const — the power combo ────────────────
const config = {
  host: "localhost",
  port: 3000,
  debug: false,
  features: ["auth", "payments"]
} as const satisfies {
  host: string
  port: number
  debug: boolean
  features: readonly string[]
}

// config.host is "localhost" (literal), not string
// config.port is 3000 (literal), not number
// config.features is readonly ["auth", "payments"] — tuple, not string[]
// AND TypeScript validates the shape matches the declared type!

// ── Enum alternative with satisfies ───────────────────────
const Status = {
  Pending: "pending",
  Active: "active",
  Failed: "failed"
} as const satisfies Record<string, string>

type Status = typeof Status[keyof typeof Status]  // "pending" | "active" | "failed"

// ── satisfies vs type annotation vs as ────────────────────
const a: ThemeColors = { primary: "#fff", secondary: "#000", background: "#eee" }
// a.primary = string  ← widened

const b = { primary: "#fff", secondary: "#000", background: "#eee" } satisfies ThemeColors
// b.primary = "#fff"  ← literal preserved, type checked ✅

const c = { primary: "#fff" } as ThemeColors
// c.primary = string  ← widened, NOT checked at all (unsafe!)
```


## W — Why It Matters

`satisfies` (TypeScript 4.9) is the canonical solution for typed configuration objects — you get validation against a known shape AND preserve the narrow types needed for autocomplete and literal type derivation. It replaces the pattern of using type assertions (`as`) for configs.[^6][^3]

## I — Interview Q\&A

**Q: What's the difference between annotating a variable type vs using `satisfies`?**
A: Annotation (`const x: T = ...`) widens the variable's type to `T` — you lose literal types. `satisfies T` validates against `T` but the variable retains its inferred (narrow) type. The difference: after annotation, `x.color` is `string`; after `satisfies`, `x.color` is `"#007bff"`.[^8]

**Q: When would you choose `satisfies` over an explicit type annotation?**
A: When you need both validation (detect missing/extra properties) AND literal type preservation (for `typeof`, key derivation, exhaustive checks). Configuration objects, route maps, color themes, typed event maps — anywhere you later use `typeof config[key]` for derived types.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `satisfies` not catching extra properties on interface | Interfaces allow extra properties in `satisfies`; use a type alias or `Record` for strict shape checking |
| Expecting `satisfies` to narrow based on the satisfied type | It validates, not narrows — the variable type is inferred, not the satisfied type |
| `as const satisfies T` order mattering | Always `as const satisfies T` — `satisfies` must be last for it to see the literal types |

## K — Coding Challenge

**Use `satisfies` to validate a route config while keeping route strings as literal types:**

```ts
type RouteConfig = Record<string, { path: string; component: string }>
// routes.home.path should be "/" (literal), not string
```

**Solution:**

```ts
const routes = {
  home:    { path: "/",        component: "HomePage" },
  about:   { path: "/about",   component: "AboutPage" },
  contact: { path: "/contact", component: "ContactPage" }
} as const satisfies Record<string, { path: string; component: string }>

type HomePath = typeof routes.home.path  // "/" — literal ✅
```


***

# 5 — Type Assertions, Double-Casting \& Suppression Comments

## T — TL;DR

Type assertions (`as T`) override TypeScript's judgment — use sparingly and only when you know more than the compiler; `@ts-expect-error` is the safe suppression comment; `@ts-ignore` is the unsafe one.

## K — Key Concepts

```ts
// ── Type assertions ───────────────────────────────────────
// Tells TypeScript: "trust me, I know this is T"
const val = someExternalFunction() as User  // assert to User
const el = document.querySelector("#app") as HTMLDivElement  // common DOM pattern

// Two syntaxes — prefer `as`, avoid `<T>` in TSX files
const a = val as string       // ✅ preferred
const b = <string>val          // ❌ conflicts with JSX syntax

// ── Type assertions do NOT change runtime values ───────────
// They're compile-time only — if wrong, you get runtime errors
const num = "hello" as unknown as number  // no error at compile time
num.toFixed(2)  // 💥 runtime error: num.toFixed is not a function

// ── Double casting — the escape hatch ─────────────────────
// When direct assertion fails because types are unrelated:
// "string" is not overlapping with "number" — TS blocks it
// const x = "hello" as number  // ❌ error

// Double cast via unknown or any:
const x = "hello" as unknown as number  // ✅ compiles (but is a lie!)
const y = "hello" as any as number      // ✅ compiles (even more dangerous)
// Use ONLY when you are 100% certain — these bypass all safety

// ── Non-null assertion ! ──────────────────────────────────
const el = document.getElementById("app")  // HTMLElement | null
el.textContent  // ❌ Object is possibly 'null'

el!.textContent  // ✅ non-null assertion — tells TS "I know it's not null"
// Equivalent to: (el as HTMLElement).textContent

// Only use ! when you have external guarantee the value exists
// (e.g., the element MUST exist because you control the HTML)

// ── Suppression comments ──────────────────────────────────
// @ts-expect-error — PREFERRED: errors if there's NO error on the next line
// @ts-ignore — DANGEROUS: silently suppresses, never errors

// ✅ @ts-expect-error with description
// @ts-expect-error: library type definition is wrong — returns string, not number
const result: number = libFunction()  // suppressed correctly

// If the error goes away (library fixes its types), @ts-expect-error itself errors:
// "Unused '@ts-expect-error' directive"  ← tells you to remove it!

// ❌ @ts-ignore — suppresses silently, no feedback when error resolves
// @ts-ignore
const result2: number = libFunction()  // will stay even when no longer needed

// @ts-nocheck — disable ALL TypeScript checking in a file
// Only for: auto-generated files, large JS files during migration
// @ts-nocheck
const anything = whatever.you.want  // no errors anywhere in file

// Rule of thumb:
// Prefer: proper types > type guards > @ts-expect-error > @ts-ignore
// Never use: double cast without a documented reason
```


## W — Why It Matters

`@ts-expect-error` is strictly safer than `@ts-ignore` because it self-destructs when no longer needed — you won't accumulate stale suppressions. Type assertions are fine for DOM operations (`querySelector as HTMLInputElement`) but every `as unknown as T` is a debt that will cause a runtime crash if the assumption is ever wrong.

## I — Interview Q\&A

**Q: What's the difference between `@ts-ignore` and `@ts-expect-error`?**
A: Both suppress the next line's TypeScript error. But `@ts-expect-error` will itself error if there's *no* TypeScript error on the next line — it forces you to remove it when it's no longer needed. `@ts-ignore` stays silently forever, even when the underlying issue is fixed. Always prefer `@ts-expect-error`.[^1]

**Q: Why is `as unknown as T` dangerous?**
A: It bypasses TypeScript's structural overlap check — even completely unrelated types can be double-cast. At runtime, the actual value is still the original type; the assertion is a compile-time lie. If the shape doesn't match at runtime, you get undetected crashes.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `el!` used on things that are actually null at runtime | Only use `!` when you have a hard external guarantee |
| `@ts-ignore` accumulating across a codebase | Use `@ts-expect-error` and enforce via ESLint rule `@typescript-eslint/ban-ts-comment` |
| `as HTMLInputElement` on the wrong element type | Use `instanceof` type guard instead of assertion for safety |

## K — Coding Challenge

**Replace the unsafe assertion with a safe pattern:**

```ts
// Unsafe:
const input = document.getElementById("search") as HTMLInputElement
input.value.toUpperCase()
```

**Solution:**

```ts
// Safe: type guard via instanceof
const el = document.getElementById("search")
if (!(el instanceof HTMLInputElement)) {
  throw new Error("#search element not found or not an input")
}
el.value.toUpperCase()  // ✅ HTMLInputElement — properly narrowed

// Or: assertElement helper from Day 9 Section 3
assertElement(el, HTMLInputElement)
el.value.toUpperCase()  // ✅
```


***

# 6 — Ambient Declarations: `declare`, `declare global`, `.d.ts` Files

## T — TL;DR

Ambient declarations tell TypeScript "this value exists at runtime, but I'm not providing its implementation" — used for third-party JavaScript, global variables, and extending existing types.[^9]

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

`declare global` and module augmentation are the only safe way to add properties to `Express.Request` (auth middleware), `Window` (analytics plugins), or `next-auth` Session types — without modifying library source. Every enterprise TypeScript project has at least one `.d.ts` file doing this.[^4][^9]

## I — Interview Q\&A

**Q: What is the difference between a `.ts` file and a `.d.ts` file?**
A: A `.ts` file contains implementation (values + types, compiled to JavaScript). A `.d.ts` file contains only type declarations — no implementation, no runtime output. `.d.ts` files describe the shape of existing JavaScript to TypeScript without affecting the bundle.

**Q: When do you need `declare global` vs just declaring at the top level of a `.d.ts` file?**
A: If the file has no `import`/`export` statements, it's treated as a global script — declarations are automatically global. If it has any import/export (it's a module), you must use `declare global { }` to add to the global scope.[^4]

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

# 7 — Abstract Classes

## T — TL;DR

Abstract classes define a contract for subclasses — they can have both implemented and `abstract` (unimplemented) members; they cannot be instantiated directly.

## K — Key Concepts

```ts
// ── Abstract class ────────────────────────────────────────
abstract class Shape {
  // Concrete: shared implementation
  toString(): string {
    return `${this.constructor.name}(area=${this.area().toFixed(2)})`
  }

  // Abstract: must be implemented by subclasses
  abstract area(): number
  abstract perimeter(): number
  abstract readonly name: string   // abstract property
}

// Cannot instantiate abstract class directly:
// const s = new Shape()  // ❌ Cannot create an instance of an abstract class

// Subclass MUST implement all abstract members
class Circle extends Shape {
  readonly name = "Circle"
  constructor(public radius: number) { super() }
  area(): number { return Math.PI * this.radius ** 2 }
  perimeter(): number { return 2 * Math.PI * this.radius }
}

class Rectangle extends Shape {
  readonly name = "Rectangle"
  constructor(public width: number, public height: number) { super() }
  area(): number { return this.width * this.height }
  perimeter(): number { return 2 * (this.width + this.height) }
}

// Polymorphism — use the abstract type
const shapes: Shape[] = [new Circle(5), new Rectangle(3, 4)]
shapes.forEach(s => console.log(s.toString()))
// "Circle(area=78.54)"
// "Rectangle(area=12.00)"

// ── Abstract class vs interface ────────────────────────────
// Interface: purely structural, no implementation, no constructor
// Abstract class: can have implementation + state + constructor + access modifiers

// Use abstract class when:
// - Subclasses share some implementation (e.g., toString, validate)
// - You need protected state or constructor
// - You want to enforce a template method pattern

// ── Template method pattern ────────────────────────────────
abstract class DataProcessor {
  // Template method — defines the algorithm
  process(data: string): string {
    const validated = this.validate(data)     // step 1 (abstract)
    const transformed = this.transform(validated) // step 2 (abstract)
    return this.format(transformed)            // step 3 (concrete)
  }

  protected abstract validate(data: string): string
  protected abstract transform(data: string): string

  protected format(data: string): string {
    return `[RESULT]: ${data}`  // shared implementation
  }
}

class UpperCaseProcessor extends DataProcessor {
  protected validate(d: string) {
    if (!d.trim()) throw new Error("Empty input")
    return d.trim()
  }
  protected transform(d: string) { return d.toUpperCase() }
}
```


## W — Why It Matters

Abstract classes enable the Template Method pattern — define the algorithm skeleton in the base class and delegate specific steps to subclasses. This is how Node.js `stream.Transform`, React's old class lifecycle, and many ORMs structure extensible processing pipelines.

## I — Interview Q\&A

**Q: What is the difference between an abstract class and an interface?**
A: An interface is a pure structural contract — no implementation, no runtime existence. An abstract class is a partial implementation — it can have concrete methods, instance state, constructors, and access modifiers. Choose interface when you just need a shape; choose abstract class when subclasses share logic.

**Q: Can an abstract class implement an interface?**
A: Yes — and it's a common pattern: the interface defines the public contract, the abstract class provides shared implementation, and concrete subclasses fill in the abstract gaps. `class Base extends AbstractImpl implements Interface`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `new AbstractClass()` — forgetting it's abstract | TypeScript will error — instantiate a concrete subclass |
| Subclass forgetting to implement an abstract member | TypeScript errors: "Non-abstract class doesn't implement all abstract members" |
| Using abstract class where interface suffices | Prefer interfaces for contracts — abstract class adds inheritance coupling |

## K — Coding Challenge

**Build an abstract `Logger` class with a shared `log` method and abstract `write` method:**

```ts
const console = new ConsoleLogger()
const file = new FileLogger("app.log")
console.log("info", "Server started")  // calls write internally
```

**Solution:**

```ts
abstract class Logger {
  log(level: "info" | "warn" | "error", message: string): void {
    const formatted = `[${level.toUpperCase()}] ${new Date().toISOString()} ${message}`
    this.write(formatted)
  }
  protected abstract write(line: string): void
}

class ConsoleLogger extends Logger {
  protected write(line: string) { console.log(line) }
}

class FileLogger extends Logger {
  constructor(private filename: string) { super() }
  protected write(line: string) {
    // fs.appendFileSync(this.filename, line + "\n")
    console.log(`→ ${this.filename}: ${line}`)
  }
}
```


***

# 8 — Branded Types

## T — TL;DR

Branded types attach a phantom type tag to a primitive — preventing two structurally identical `string` types (e.g., `UserId` and `EmailAddress`) from being accidentally interchanged.

## K — Key Concepts

```ts
// ── The problem without branding ─────────────────────────
type UserId = string
type ProductId = string

function getUser(id: UserId) { /* ... */ }
function getProduct(id: ProductId) { /* ... */ }

const userId: UserId = "user-123"
const productId: ProductId = "prod-456"

getUser(productId)     // ✅ TypeScript allows it — both are just string!
// This is the bug: wrong ID type passed, no compile error

// ── Branded types — add phantom type tag ─────────────────
type Brand<T, Tag> = T & { readonly __brand: Tag }

type UserId    = Brand<string, "UserId">
type ProductId = Brand<string, "ProductId">
type EmailAddress = Brand<string, "Email">
type PositiveNumber = Brand<number, "Positive">

// Now they're structurally different — TypeScript distinguishes them
function getUser(id: UserId) { /* ... */ }
getUser(productId)  // ❌ Type '"ProductId"' does not satisfy '"UserId"'

// ── Creating branded values — constructor functions ────────
function asUserId(raw: string): UserId {
  if (!raw.startsWith("user-")) throw new Error(`Invalid UserId: ${raw}`)
  return raw as UserId   // ← assertion at boundary — only here
}

function asEmail(raw: string): EmailAddress {
  if (!/^[^@]+@[^@]+$/.test(raw)) throw new Error(`Invalid email: ${raw}`)
  return raw as EmailAddress
}

function asPositive(n: number): PositiveNumber {
  if (n <= 0) throw new Error(`Must be positive: ${n}`)
  return n as PositiveNumber
}

const userId = asUserId("user-123")     // UserId ✅
const email = asEmail("alice@b.com")   // EmailAddress ✅

getUser(userId)                         // ✅
getUser(email)                          // ❌ compile error — correct!

// ── Nominal typing for domain primitives ──────────────────
type Milliseconds = Brand<number, "ms">
type Seconds      = Brand<number, "s">
type Kilograms    = Brand<number, "kg">

function delay(ms: Milliseconds): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

const ms = 1000 as Milliseconds
const kg = 5 as Kilograms
delay(ms)   // ✅
delay(kg)   // ❌ Kilograms is not Milliseconds

// ── Simplified branding shorthand ─────────────────────────
declare const __brand: unique symbol
type Brand2<T, Tag> = T & { readonly [__brand]: Tag }
// Uses a unique symbol — slightly safer than string key
```


## W — Why It Matters

Branded types are the TypeScript equivalent of new-type idioms in Rust/Haskell. In payment systems, mixing `amount in dollars` and `amount in cents` both being `number` causes catastrophic bugs. Branding prevents passing a `ProductId` where a `UserId` is expected — both being `string` — without any runtime overhead.[^3]

## I — Interview Q\&A

**Q: What is a branded type and how does it differ from a type alias?**
A: A type alias (`type UserId = string`) is structurally identical to `string` — they're interchangeable. A branded type adds a phantom property (`& { __brand: "UserId" }`) that makes it structurally distinct. You can never accidentally pass a plain `string` or a different branded type — TypeScript treats them as different types.

**Q: Is there a runtime cost to branded types?**
A: Zero runtime cost — the brand property (`__brand`) doesn't actually exist at runtime. It's a compile-time phantom. The value is still just a plain `string` or `number` at runtime. The cost is in the constructor functions that validate before branding.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `as UserId` everywhere instead of constructor functions | Only assert at validated boundaries — everywhere else let the type propagate |
| `type UserId = string & { __brand: "UserId" }` — forgetting `readonly` | Non-readonly brand can be accidentally satisfied by object literals |
| Branded number not accepting arithmetic results | `PositiveNumber + PositiveNumber` returns `number` — re-brand after math operations if needed |

## K — Coding Challenge

**Create branded types to prevent mixing Celsius and Fahrenheit temperatures:**

```ts
toCelsius(98.6 as Fahrenheit)  // ✅
toCelsius(37 as Celsius)        // ❌ TypeScript error
```

**Solution:**

```ts
type Brand<T, Tag> = T & { readonly __brand: Tag }
type Celsius    = Brand<number, "Celsius">
type Fahrenheit = Brand<number, "Fahrenheit">

const asCelsius    = (n: number): Celsius    => n as Celsius
const asFahrenheit = (n: number): Fahrenheit => n as Fahrenheit

function toCelsius(f: Fahrenheit): Celsius {
  return asCelsius((f - 32) * 5 / 9)
}

const bodyTemp = asFahrenheit(98.6)
toCelsius(bodyTemp)               // ✅ Fahrenheit → Celsius
toCelsius(asCelsius(37))          // ❌ Celsius is not Fahrenheit
```


***

# 9 — Enums vs `const` Object Pattern

## T — TL;DR

TypeScript `enum` generates runtime code and has surprising behavior — modern TypeScript prefers `const` objects with `as const` + `keyof typeof` for the same result with zero runtime cost and better tree-shaking.[^3]

## K — Key Concepts

```ts
// ── TypeScript enum ────────────────────────────────────────
enum Direction {
  North = "north",
  South = "south",
  East  = "east",
  West  = "west"
}

// Numeric enum — has reverse mapping (bidirectional)
enum Status {
  Pending,    // 0
  Active,     // 1
  Failed      // 2
}
Status[^0]        // "Pending" (reverse lookup!) — confusing
Status.Pending   // 0

// String enum — no reverse mapping
Direction.North  // "north"
Direction["North"]  // "north"
// Direction["north"]  // undefined — no reverse mapping

// ── The problems with enum ─────────────────────────────────
// 1. Generates runtime JavaScript — not tree-shakable
// Compiled output:
var Direction;
(function (Direction) {
  Direction["North"] = "north";
  // ...
})(Direction || (Direction = {}));

// 2. Const enum is inlined but breaks with isolatedModules
const enum Size { Small = "sm", Medium = "md", Large = "lg" }
// Inlined at compile time — but breaks with esbuild/Babel/isolatedModules!

// 3. Ambient enum — only for declaration files
declare enum UserRole { Admin, User, Guest }

// ── Const object pattern — the modern alternative ─────────
const Direction = {
  North: "north",
  South: "south",
  East:  "east",
  West:  "west"
} as const

type Direction = typeof Direction[keyof typeof Direction]
// "north" | "south" | "east" | "west"

// Same ergonomics as enum:
Direction.North  // "north"
// Type checking works:
function move(d: Direction) { /* ... */ }
move(Direction.North)  // ✅
move("north")          // ✅ (the literal type)
move("up")             // ❌ not in Direction union

// ── Side-by-side comparison ────────────────────────────────
// Enum:
enum Color { Red = "red", Green = "green", Blue = "blue" }
function paint(c: Color) {}
paint(Color.Red)   // ✅
paint("red")       // ❌ string is not assignable to Color (surprising!)

// Const object:
const Color = { Red: "red", Green: "green", Blue: "blue" } as const
type Color = typeof Color[keyof typeof Color]
function paint(c: Color) {}
paint(Color.Red)   // ✅
paint("red")       // ✅ the literal IS the type

// ── When enum has an advantage ─────────────────────────────
// 1. Const enum with `preserveConstEnums` inlines values
// 2. Enum members have their own type: Color.Red is assignable only where Color.Red is expected
//    (stronger than const object — same member value may appear in different unions)
// 3. Legacy code or teams already using enums consistently
```


## W — Why It Matters

`const enum` breaks with `isolatedModules: true` (required by Vite and esbuild) — making it incompatible with modern tooling. Const objects are zero-overhead, fully tree-shakable, and work in all environments. The TypeScript team itself now recommends const objects over enums for most use cases.[^3]

## I — Interview Q\&A

**Q: Why is `const enum` problematic with modern tooling?**
A: `const enum` requires the full TypeScript compiler to inline values — single-file transpilers like esbuild, SWC, and Babel can't resolve cross-file `const enum` references, causing runtime errors. `isolatedModules: true` in tsconfig flags this as a compile error.

**Q: Can you use a string literal directly with an enum type?**
A: No — TypeScript string enums are nominally typed. `Color.Red` is `Color.Red`, not just `"red"`. You can't pass the string `"red"` where `Color.Red` is expected. With const objects, the literal `"red"` IS the type — more flexible for interop.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Numeric enum reverse mapping causing unexpected `Direction[^0]` access | Use string enums or const objects — string enums have no reverse mapping |
| `const enum` with `isolatedModules: true` | Replace with const object + `as const` |
| Forgetting `as const` on the const object — widens to `string` | Always `} as const` — without it, values are `string`, not literals |

## K — Coding Challenge

**Convert this enum to a const object pattern:**

```ts
enum HttpStatus { OK = 200, Created = 201, BadRequest = 400, NotFound = 404, ServerError = 500 }
```

**Solution:**

```ts
const HttpStatus = {
  OK:          200,
  Created:     201,
  BadRequest:  400,
  NotFound:    404,
  ServerError: 500
} as const

type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus]
// 200 | 201 | 400 | 404 | 500

function isClientError(status: HttpStatus): boolean {
  return status >= 400 && status < 500
}
```


***

# 10 — Declaration Merging \& Module Augmentation

## T — TL;DR

Declaration merging lets multiple `interface` declarations with the same name combine into one; module augmentation adds new types to an existing module's exports without modifying its source.[^9][^4]

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

Module augmentation is the standard pattern for typing middleware and plugins — without it, `req.user` in Express would be `any` after your auth middleware runs. Every major TypeScript library provides augmentation examples in their docs for exactly this reason.[^4][^9]

## I — Interview Q\&A

**Q: What are the limitations of module augmentation?**
A: Two key limits: (1) you cannot add new *top-level* declarations to an augmented module — only extend existing exported types; (2) default exports cannot be augmented — only named exports. Also, the augmenting file must import from the target module to ensure TypeScript includes the augmentation.[^9]

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

# 11 — Variance in TypeScript

## T — TL;DR

Variance describes how generic type relationships flow — covariance (`out`) means subtype is preserved; contravariance (`in`) means it flips; function parameters are contravariant, return types are covariant.

## K — Key Concepts

```ts
// ── Covariance — "out" position — subtype relationship preserved ──
// A producer/source of T is covariant in T
type Producer<T> = () => T     // return type — covariant

// If Animal extends Animal (itself), and Dog extends Animal:
type Animal = { name: string }
type Dog = Animal & { bark(): void }

const getDog: Producer<Dog> = () => ({ name: "Rex", bark() {} })
const getAnimal: Producer<Animal> = getDog  // ✅ Dog extends Animal — covariant!

// ── Contravariance — "in" position — subtype relationship flips ──
// A consumer/acceptor of T is contravariant in T
type Consumer<T> = (val: T) => void   // parameter type — contravariant

const processAnimal: Consumer<Animal> = (a) => console.log(a.name)
const processDog: Consumer<Dog> = processAnimal  // ✅ contravariance — flipped!
// processAnimal accepts ANY animal, so it can also process Dog
// processDog: Consumer<Dog> = something that handles Animal — valid!

// ── Why this matters in practice ─────────────────────────
// Function parameter types are contravariant
// strictFunctionTypes enforces this:

type OnAnimal = (a: Animal) => void
type OnDog    = (d: Dog) => void

let onAnimal: OnAnimal = (a) => console.log(a.name)
let onDog: OnDog = (d) => d.bark()

onAnimal = onDog   // ❌ strictFunctionTypes blocks — onDog can't handle non-Dog animals
onDog = onAnimal   // ✅ onAnimal handles any animal, including Dog — safe!

// ── Invariance — neither covariant nor contravariant ──────
// Mutable containers are invariant (both read and write)
// Array<T> is technically covariant in TypeScript (by design tradeoff, not pure math)

// ── TypeScript 4.7: explicit variance annotations ─────────
// `out T` — covariant: T only used in output positions
// `in T`  — contravariant: T only used in input positions
// `in out T` — invariant: T used in both

type ReadonlyBox<out T> = {   // covariant — only produces T
  readonly value: T
}

type WriteBox<in T> = {       // contravariant — only consumes T
  set(value: T): void
}

// TypeScript uses these annotations to:
// 1. Improve performance (skip costly checks)
// 2. Document intent
// 3. Error if the annotation doesn't match actual usage

// ── Practical: why Array<Dog> is NOT assignable to Array<Animal> in strict code ──
declare function processAll(animals: Animal[]): void
const dogs: Dog[] = []
processAll(dogs)  // ✅ TypeScript allows (covariant arrays — by design)
// But this is UNSAFE: processAll could push a non-Dog Animal into `dogs`!
// ReadonlyArray<Dog> → ReadonlyArray<Animal> is safe (no push)
```


## W — Why It Matters

```
Understanding variance explains why `(dog: Dog) => void` is NOT assignable to `(animal: Animal) => void` (even though `Dog extends Animal`) — and why `strictFunctionTypes` catches real bugs. It also explains why `ReadonlyArray<Dog>` is safely assignable to `ReadonlyArray<Animal>` but `Array<Dog>` is technically unsafe (TypeScript allows it for ergonomics).
```


## I — Interview Q\&A

**Q: Why are function parameters contravariant?**

```
A: If a function expects `Dog`, it can only handle `Dog`. If you substitute it with a function that expects `Animal` (supertype), it can handle any animal — including `Dog`. So `Consumer<Animal>` is safely assignable to `Consumer<Dog>`. The direction flips from the type hierarchy: subtype parameter → supertype is valid, not the other way.[^1]
```

**Q: What does `strictFunctionTypes` enforce?**
A: It enforces contravariance on function parameter types — catching cases where a more-specific function type is used where a more-general one is expected. It was off by default for years due to breaking changes but is now part of `strict: true`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `Array<Dog>` assigned to `Array<Animal>` then mutated | Use `ReadonlyArray<Dog>` for safe covariant assignment |
| Expecting `(dog: Dog) => void` to be usable as `(a: Animal) => void` | Contravariance flips this — use `(a: Animal) => void` as `(d: Dog) => void` instead |
| Variance annotations (`in`/`out`) crashing with incorrect usage | TypeScript will error if annotation contradicts actual use |

## K — Coding Challenge

**Explain why this code is an error with `strictFunctionTypes`, and fix it:**

```ts
type Handler<T> = (val: T) => void
const handleAnimal: Handler<Animal> = (a) => console.log(a.name)
const handleDog: Handler<Dog> = handleAnimal  // Error or not?
```

**Solution:**

```ts
// handleAnimal: Handler<Animal> = (a: Animal) => void
// handleDog:    Handler<Dog>    = (d: Dog) => void
// Handler is contravariant in T (parameter position)
// Dog extends Animal → Handler<Animal> extends Handler<Dog> (flipped!)
// So: Handler<Animal> IS assignable to Handler<Dog> ← CORRECT direction
const handleDog: Handler<Dog> = handleAnimal  // ✅ No error — correct!

// The ERROR would be the reverse:
// const handleAnimal: Handler<Animal> = handleDog  // ❌ Error!
// Because handleDog can only handle Dog — can't handle all Animal
```


***

# 12 — `useUnknownInCatchVariables` \& Handling Unknown External Data

## T — TL;DR

With `useUnknownInCatchVariables: true`, caught errors are `unknown` not `any` — you must narrow before accessing `.message`; pair this with type guards and structured error handling for safe, exhaustive catch blocks.

## K — Key Concepts

```ts
// ── Without useUnknownInCatchVariables (legacy) ───────────
try { /* ... */ }
catch (err) {
  // err: any — TypeScript trusts you completely
  console.error(err.message)          // ✅ no error, but may crash at runtime
  err.whatever.nested.access         // ✅ no error — dangerous
}

// ── With useUnknownInCatchVariables: true (default in strict) ──
try { /* ... */ }
catch (err) {
  // err: unknown — must narrow first
  err.message  // ❌ Object is of type 'unknown'

  // Pattern 1: instanceof Error (most common)
  if (err instanceof Error) {
    console.error(err.message)     // ✅ string
    console.error(err.stack)       // ✅ string | undefined
    console.error(err.cause)       // ✅ unknown
  }

  // Pattern 2: structured error handler
  console.error(formatError(err))
}

// ── Universal error formatter ─────────────────────────────
function formatError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message)
  }
  return String(err)
}

// ── Custom error hierarchy with catch narrowing ───────────
class AppError extends Error {
  constructor(message: string, public code: string) { super(message) }
}
class NetworkError extends AppError {
  constructor(message: string, public statusCode: number) {
    super(message, "NETWORK_ERROR")
  }
}

async function safeRequest<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    if (err instanceof NetworkError) {
      if (err.statusCode === 401) throw new AppError("Unauthorized", "AUTH_ERROR")
      if (err.statusCode === 404) throw new AppError("Not found", "NOT_FOUND")
    }
    if (err instanceof AppError) throw err        // rethrow known app errors
    if (err instanceof Error) {
      throw new AppError(err.message, "UNKNOWN")  // wrap unknown errors
    }
    throw new AppError(formatError(err), "UNKNOWN")  // wrap non-Error throws
  }
}

// ── Full safe external data pattern ───────────────────────
async function loadUserProfile(id: string): Promise<User> {
  let raw: unknown

  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new NetworkError(`HTTP ${res.status}`, res.status)
    raw = await res.json()   // ← type as unknown
  } catch (err: unknown) {
    if (err instanceof NetworkError) throw err
    if (err instanceof Error) throw new NetworkError(err.message, 0)
    throw new NetworkError(formatError(err), 0)
  }

  // Validate external data before trusting it
  return UserSchema.parse(raw)  // Zod validates + narrows unknown → User
}
```


## W — Why It Matters

Code that does `catch (err) { console.error(err.message) }` crashes in production when someone `throw "a string"` — because strings don't have `.message`. `useUnknownInCatchVariables` forces you to handle this class of bug at compile time. Combined with the `formatError` utility, catch blocks become genuinely safe.[^5]

## I — Interview Q\&A

**Q: What does `useUnknownInCatchVariables` actually change?**
A: It changes the type of `err` in `catch (err)` from `any` to `unknown`. This means you must narrow before accessing any property on it — preventing blind `err.message` access that would crash if someone threw a non-Error value. It's included in `strict: true` since TypeScript 4.4.

**Q: Why might someone throw a non-Error value in JavaScript?**
A: Mostly legacy code (`throw "error message"`), third-party libraries throwing custom objects, `Promise.reject("reason")` with a string, or accidental re-throws of non-Error values. TypeScript can't control what gets thrown — only how you handle it.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `catch (err: Error)` — annotating catch variable directly | Only `unknown` and `any` are allowed as catch variable types |
| `err.message ?? "unknown"` without instanceof check | `err.message` still errors — must narrow first: `err instanceof Error && err.message` |
| Using `as Error` to silence the error | Use `instanceof Error` — assertion is unsafe if err is actually a string |

## K — Coding Challenge

**Write a `tryCatch` wrapper that returns `[null, T]` on success and `[Error, null]` on failure:**

```ts
const [err, user] = await tryCatch(fetchUser(1))
if (err) { console.error(err.message); return }
user.name  // User — TypeScript knows
```

**Solution:**

```ts
async function tryCatch<T>(
  promise: Promise<T>
): Promise<[null, T] | [Error, null]> {
  try {
    const data = await promise
    return [null, data]
  } catch (err: unknown) {
    if (err instanceof Error) return [err, null]
    return [new Error(formatError(err)), null]
  }
}

// Usage:
const [err, user] = await tryCatch(fetchUser(1))
if (err !== null) {
  console.error(err.message)
  return
}
user.name  // ✅ User — null eliminated
```


***

> ✅ **Day 9 complete.**
> Your tiny next action: write an `assertNever` function, create a discriminated union with 3 variants, and add a `switch` that exhaustively handles all cases with `assertNever` in the `default`. Then add a 4th variant — watch TypeScript break the switch. That's the whole pattern in 5 minutes.
<span style="display:none">[^10][^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

[^2]: https://www.stefanjudis.com/today-i-learned/the-scope-of-type-guards-and-assertion-functions/

[^3]: https://oneuptime.com/blog/post/2026-01-30-typescript-const-assertions/view

[^4]: https://www.frontendinterview.in/blog/typescript-declaration-merging-module-augmentation

[^5]: https://2ality.com/2020/06/type-guards-assertion-functions-typescript.html

[^6]: https://mimo.org/glossary/typescript/satisfies

[^7]: https://chrisvaillancourt.io/posts/combining-typescript-satisfies-and-const-assertion/

[^8]: https://stackoverflow.com/questions/78636946/what-are-the-differences-between-typescript-s-satisfies-operator-and-type-assert

[^9]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html

[^10]: https://stackoverflow.com/questions/78678439/typescript-type-guards-how-to-get-type-narrowing-and-suggestions

[^11]: https://www.lucaspaganini.com/academy/assertion-functions-typescript-narrowing-5

[^12]: https://www.reddit.com/r/typescript/comments/1o5wo6f/guards_vs_assertions_vs_ifthrow_what_do_you/

[^13]: https://dev.to/paulthedev/type-guards-in-typescript-2025-next-level-type-safety-for-ai-era-developers-6me

[^14]: https://www.merixstudio.com/blog/typescript-declaration-merging

[^15]: https://www.youtube.com/shorts/73xDVEDIzFI

