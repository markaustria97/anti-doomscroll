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
