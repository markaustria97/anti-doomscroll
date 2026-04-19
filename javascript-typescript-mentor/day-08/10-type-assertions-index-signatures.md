# 10 — Type Assertions & Index Signatures

## T — TL;DR

Type assertions (`as Type`) tell TypeScript "trust me, I know the type" — they bypass inference but not runtime safety; index signatures define types for dynamic property access on objects.

## K — Key Concepts

### Type Assertions

```ts
// TypeScript thinks this is Element | null
const el = document.getElementById("app")

// You know it's an HTMLDivElement:
const div = document.getElementById("app") as HTMLDivElement

// Now you can access div-specific properties:
div.style.color = "red" // ✅
```

### Assertion Rules

Assertions can only go between **related** types:

```ts
const x = "hello" as number
// ❌ Conversion of type 'string' to type 'number' may be a mistake

// Double assertion via `unknown` (escape hatch)
const x = "hello" as unknown as number
// ✅ — but you're lying to the compiler!
```

### `as const` (Special Assertion)

```ts
const x = "hello" as const // type: "hello" (literal)
const arr = [1, 2] as const // type: readonly [1, 2]
```

### Non-Null Assertion (`!`)

```ts
const el = document.getElementById("app") // HTMLElement | null

el.style.color = "red" // ❌ 'el' is possibly null

el!.style.color = "red" // ✅ non-null assertion — "trust me, it exists"
```

**`!` removes `null` and `undefined` from the type.** Use sparingly — if it IS null, you'll crash at runtime.

### When to Use Assertions

```ts
// ✅ Good: You genuinely know more than TypeScript
const canvas = document.getElementById("canvas") as HTMLCanvasElement

// ✅ Good: Type narrowing is impractical
const data = JSON.parse(text) as Config

// ❌ Bad: Silencing errors you don't understand
const x = someValue as any as TargetType
```

### Index Signatures

Define types for objects with dynamic keys:

```ts
interface StringMap {
  [key: string]: number
}

const scores: StringMap = {
  alice: 95,
  bob: 87,
  charlie: 92,
}

scores.alice    // number
scores.unknown  // number (TypeScript trusts the index signature)
// With noUncheckedIndexedAccess: number | undefined ✅
```

### Index Signatures with Specific Properties

```ts
interface Config {
  name: string               // specific property
  version: number            // specific property
  [key: string]: string | number // index signature — must be compatible with all properties
}

const config: Config = {
  name: "my-app",
  version: 1,
  customField: "value", // ✅ — matches index signature
}
```

### `Record` Utility Type (Cleaner Alternative)

```ts
// Instead of index signatures:
type StringMap = Record<string, number>

// More specific:
type UserRoles = Record<string, "admin" | "user" | "guest">

// With specific keys:
type Scores = Record<"alice" | "bob" | "charlie", number>
```

### Template Literal Index Signatures (TS 4.4+)

```ts
interface CSSVariables {
  [key: `--${string}`]: string
}

const vars: CSSVariables = {
  "--color-primary": "#007bff",
  "--font-size": "16px",
  color: "red", // ❌ — doesn't match `--${string}` pattern
}
```

## W — Why It Matters

- Type assertions are necessary for DOM manipulation, JSON parsing, and library interop.
- The non-null assertion `!` is used constantly in tests and when TypeScript can't infer nullability.
- Index signatures are essential for dictionaries, config objects, and dynamic data.
- `Record` is the cleaner alternative for most index signature use cases.
- Overusing assertions is a code smell — it means your types aren't precise enough.

## I — Interview Questions with Answers

### Q1: What is a type assertion?

**A:** A way to tell TypeScript "I know the type better than you." Written as `value as Type`. It doesn't change the runtime value — it only affects the compile-time type. Assertions can only convert between related types.

### Q2: What is the non-null assertion operator?

**A:** `!` after an expression removes `null` and `undefined` from its type. `element!.style` tells TypeScript "I guarantee this is not null." If it IS null, you'll get a runtime crash.

### Q3: What is an index signature?

**A:** `[key: string]: ValueType` on an interface/type, defining the type for any property accessed by string key. It allows objects to have dynamic properties while still being typed.

### Q4: When should you avoid type assertions?

**A:** When proper type narrowing would work (use `typeof`, `in`, `instanceof` checks). When you're silencing errors you don't understand. When `unknown` + narrowing would be safer.

## C — Common Pitfalls with Fix

### Pitfall: Using assertions instead of narrowing

```ts
const data: unknown = fetchData()
const user = data as User // ❌ dangerous — data might not be a User
```

**Fix:** Narrow with type guards:

```ts
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "name" in data
}

if (isUser(data)) {
  data.name // ✅ safe
}
```

### Pitfall: Non-null assertion hiding bugs

```ts
const user = users.find(u => u.id === id)!
//                                        ^ if not found, crash at runtime
```

**Fix:** Handle the null case: `if (!user) throw new Error("not found")`.

### Pitfall: Index signatures not accounting for missing keys

```ts
interface Scores { [name: string]: number }
const scores: Scores = { alice: 95 }
scores.bob.toFixed(2) // Runtime crash — bob is undefined!
```

**Fix:** Enable `noUncheckedIndexedAccess` (Topic 2) — forces `number | undefined`.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `get(obj, key)` function that works with index signatures:

```ts
const scores = { alice: 95, bob: 87 }
get(scores, "alice") // 95 | undefined
get(scores, "unknown") // undefined
```

### Solution

```ts
function get<T extends Record<string, unknown>, K extends string>(
  obj: T,
  key: K
): K extends keyof T ? T[K] : undefined {
  return obj[key] as any
}

// Simpler version using optional:
function get<T extends Record<string, unknown>>(
  obj: T,
  key: string
): T[keyof T] | undefined {
  return obj[key as keyof T]
}

const scores: Record<string, number> = { alice: 95, bob: 87 }
const result = get(scores, "alice") // number | undefined
```

---
