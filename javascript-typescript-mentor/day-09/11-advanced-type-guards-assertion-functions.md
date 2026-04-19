# 11 — Advanced Type Guards & Assertion Functions

## T — TL;DR

Type guards narrow types based on runtime checks; **assertion functions** narrow by throwing on failure — together they bridge TypeScript's compile-time types with runtime safety.

## K — Key Concepts

### Review: Basic Type Guards (Day 8)

```ts
// typeof
if (typeof x === "string") { /* x: string */ }

// in
if ("swim" in animal) { /* animal has swim */ }

// instanceof
if (error instanceof TypeError) { /* error: TypeError */ }
```

### Custom Type Guard Functions

```ts
interface Cat { meow(): void; purr(): void }
interface Dog { bark(): void; fetch(): void }

function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal
}

function process(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow()  // ✅ narrowed to Cat
    animal.purr()  // ✅
  } else {
    animal.bark()  // ✅ narrowed to Dog
  }
}
```

### Type Guards for `unknown` Data

```ts
interface User {
  id: string
  name: string
  email: string
}

function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "email" in data &&
    typeof (data as Record<string, unknown>).id === "string" &&
    typeof (data as Record<string, unknown>).name === "string" &&
    typeof (data as Record<string, unknown>).email === "string"
  )
}

const response: unknown = await fetch("/api/user").then(r => r.json())

if (isUser(response)) {
  console.log(response.name) // ✅ narrowed to User
}
```

### Assertion Functions (`asserts`)

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`Expected string, got ${typeof value}`)
  }
}

function process(input: unknown) {
  assertIsString(input)
  // After assertion — input is `string`
  console.log(input.toUpperCase()) // ✅
}
```

### `asserts` vs `is` — When to Use Which

```ts
// `is` — returns boolean, use in `if` statements
function isString(value: unknown): value is string {
  return typeof value === "string"
}

if (isString(x)) {
  x.toUpperCase() // narrowed in this block
}
// x is still `unknown` here

// `asserts` — throws or returns void, narrows for the rest of the scope
function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Error("not a string")
}

assertString(x)
x.toUpperCase() // narrowed for everything after
```

| Pattern | Returns | Narrows | Use When |
|---------|---------|---------|----------|
| `value is Type` | `boolean` | Inside `if` block only | Optional check, branching logic |
| `asserts value is Type` | `void` (or throws) | Rest of scope | Validation, preconditions, fail-fast |

### Assertion with Condition

```ts
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function process(user: User | null) {
  assert(user !== null, "User must exist")
  // user is narrowed to User here
  console.log(user.name) // ✅
}
```

This is the most general form — `asserts condition` narrows whatever the condition checks.

### Chaining Assertions for Validation

```ts
function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`${name} must be defined`)
  }
}

function assertType<T>(value: unknown, check: (v: unknown) => v is T, name: string): asserts value is T {
  if (!check(value)) {
    throw new Error(`${name} failed type check`)
  }
}

// Usage:
function handleRequest(body: unknown) {
  assertType(body, isUser, "request body")
  // body is User ✅

  assertDefined(body.email, "email")
  // body.email is string (not undefined) ✅
}
```

### Type Guards with Generics

```ts
function isArrayOf<T>(
  arr: unknown,
  guard: (item: unknown) => item is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(guard)
}

function isString(x: unknown): x is string {
  return typeof x === "string"
}

const data: unknown = ["a", "b", "c"]

if (isArrayOf(data, isString)) {
  data.map(s => s.toUpperCase()) // ✅ data is string[]
}
```

### Filter with Type Guards (TS 5.5+)

```ts
const mixed: (string | number | null)[] = ["hello", 42, null, "world", 7]

// Before TS 5.5:
const strings = mixed.filter((x): x is string => typeof x === "string")
// strings: string[]

// TS 5.5+: TypeScript infers the type predicate
const strings = mixed.filter(x => typeof x === "string")
// strings: string[] ✅ (inferred predicate)
```

## W — Why It Matters

- Type guards are how you **safely process external data** (API responses, user input, file parsing).
- Assertion functions create **clean validation layers** that narrow types for all subsequent code.
- The `asserts` pattern is used in testing frameworks (`assert`, `expect`) and validation libraries.
- Generic type guards (`isArrayOf`) build composable runtime validation.
- Combining these with Zod (Day 12) gives you the complete validation story.

## I — Interview Questions with Answers

### Q1: What is the difference between `value is Type` and `asserts value is Type`?

**A:** `value is Type` is a boolean return — narrows only inside `if` blocks. `asserts value is Type` is void/throws — narrows for the entire remaining scope. Use `is` for branching, `asserts` for fail-fast validation.

### Q2: Can type guards lie?

**A:** Yes. TypeScript trusts the `is` predicate. If your runtime check doesn't actually validate the type, you'll get runtime errors. Always ensure the check is thorough.

### Q3: How do you type-guard an array of a specific type?

**A:** `function isArrayOf<T>(arr: unknown, guard: (x: unknown) => x is T): arr is T[]` — checks `Array.isArray` and `.every(guard)`.

## C — Common Pitfalls with Fix

### Pitfall: Type guard that doesn't check enough

```ts
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null
  // Only checks it's an object — doesn't verify properties!
}
```

**Fix:** Check every required property and its type. Or use Zod for comprehensive validation.

### Pitfall: Assertion function without actually throwing

```ts
function assertString(value: unknown): asserts value is string {
  console.log("checking...") // doesn't throw!
}

assertString(42)
// TypeScript thinks it's a string — but it's 42 at runtime!
```

**Fix:** Assertion functions MUST throw if the assertion fails. TypeScript trusts you.

## K — Coding Challenge with Solution

### Challenge

Create a validation helper `validate<T>` that uses assertion functions:

```ts
validate(data, {
  name: isString,
  age: isNumber,
  active: isBoolean,
})
// After this, data is narrowed to { name: string; age: number; active: boolean }
```

### Solution

```ts
type GuardMap = Record<string, (value: unknown) => boolean>

type Validated<T extends GuardMap> = {
  [K in keyof T]: T[K] extends (v: unknown) => v is infer U ? U : unknown
}

function validate<T extends GuardMap>(
  data: unknown,
  guards: T
): asserts data is Validated<T> {
  if (typeof data !== "object" || data === null) {
    throw new Error("Expected object")
  }

  const obj = data as Record<string, unknown>

  for (const [key, guard] of Object.entries(guards)) {
    if (!guard(obj[key])) {
      throw new Error(`Validation failed for "${key}"`)
    }
  }
}

// Type guard helpers:
const isString = (v: unknown): v is string => typeof v === "string"
const isNumber = (v: unknown): v is number => typeof v === "number"
const isBoolean = (v: unknown): v is boolean => typeof v === "boolean"

// Usage:
const data: unknown = { name: "Mark", age: 30, active: true }

validate(data, { name: isString, age: isNumber, active: isBoolean })
// data is now { name: string; age: number; active: boolean }
console.log(data.name.toUpperCase()) // ✅
```

---
