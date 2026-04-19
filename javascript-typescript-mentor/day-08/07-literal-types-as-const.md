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
