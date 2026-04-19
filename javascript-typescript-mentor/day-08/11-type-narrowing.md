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
