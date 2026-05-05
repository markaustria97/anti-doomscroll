# 8 — Unions, Intersections, Optional & Readonly Properties

## T — TL;DR

Unions (`A | B`) model "one of these types"; intersections (`A & B`) model "all of these types combined" — use discriminated unions with a literal `type` field for type-safe variant modeling.

## K — Key Concepts

```ts
// ── Union types ───────────────────────────────────────────
type StringOrNumber = string | number
type Status = "pending" | "active" | "failed"

function format(val: string | number): string {
  return String(val)
}

// Narrowing unions
function process(val: string | number) {
  if (typeof val === "string") {
    return val.toUpperCase()  // string here
  }
  return val.toFixed(2)       // number here
}

// Discriminated union — literal field discriminates variants
type Shape =
  | { kind: "circle";   radius: number }
  | { kind: "square";   side: number }
  | { kind: "rectangle"; width: number; height: number }

function area(shape: Shape): number {
  switch (shape.kind) {         // TypeScript narrows by `kind`
    case "circle":    return Math.PI * shape.radius ** 2
    case "square":    return shape.side ** 2
    case "rectangle": return shape.width * shape.height
  }
}

// ── Intersection types ────────────────────────────────────
type Timestamps = { createdAt: Date; updatedAt: Date }
type Identifiable = { id: string }

type Entity = Identifiable & Timestamps & {
  name: string
}
// Entity = { id: string, createdAt: Date, updatedAt: Date, name: string }

// ── Optional properties ───────────────────────────────────
interface Config {
  host: string
  port?: number           // optional — number | undefined
  debug?: boolean
}
const config: Config = { host: "localhost" }  // port and debug omitted ✅

// ── Readonly properties ───────────────────────────────────
interface Point {
  readonly x: number
  readonly y: number
}
const p: Point = { x: 1, y: 2 }
p.x = 3  // ❌ Cannot assign to 'x' because it is read-only

// Readonly array
const nums: readonly number[] = [1, 2, 3]
// or: ReadonlyArray<number>
nums.push(4)  // ❌ Property 'push' does not exist on type 'readonly number[]'

// Readonly<T> utility type — makes all properties readonly
type ImmutableUser = Readonly<User>
```


## W — Why It Matters

Discriminated unions are the TypeScript pattern for modeling variant data (API responses, Redux actions, form states, error types). The `kind`/`type`/`tag` field lets TypeScript narrow the type in `switch` statements — eliminating entire classes of "property doesn't exist" errors while providing exhaustive checking.

## I — Interview Q&A

**Q: What is a discriminated union and why is it preferred for variant types?**
A: A discriminated union has a shared literal property (called the discriminant, e.g., `kind: "circle"`) that uniquely identifies each variant. TypeScript uses this to narrow types in `switch`/`if` blocks — providing full type safety for each variant's specific properties without manual type assertions.

**Q: What's the difference between `optional` property (`key?: T`) and `key: T | undefined`?**
A: `key?: T` means the property can be absent from the object entirely. `key: T | undefined` means the property must be present but can be `undefined`. With `exactOptionalPropertyTypes` enabled, TS treats these differently — a `key?: T` property must not be set to `undefined` explicitly.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Union type access without narrowing | Always narrow first with `typeof`, `instanceof`, or discriminant check |
| `A & B` where A and B have conflicting property types | Results in `never` for that property — check for conflicts |
| Using `Readonly<T>` thinking it deep-freezes | `Readonly` is shallow — nested objects remain mutable |

## K — Coding Challenge

**Model an API response that can succeed with data or fail with an error:**

```ts
// fetchUser() should return:
// { status: "ok", user: User } on success
// { status: "error", code: number, message: string } on failure
```

**Solution:**

```ts
type UserResponse =
  | { status: "ok";    user: User }
  | { status: "error"; code: number; message: string }

async function fetchUser(id: number): Promise<UserResponse> {
  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) return { status: "error", code: res.status, message: res.statusText }
    const user = await res.json() as User
    return { status: "ok", user }
  } catch {
    return { status: "error", code: 0, message: "Network error" }
  }
}

// Usage — TypeScript narrows correctly:
const result = await fetchUser(1)
if (result.status === "ok") {
  console.log(result.user.name)     // ✅ user is available
} else {
  console.error(result.message)    // ✅ message is available
}
```


***
