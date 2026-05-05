# 9 — Literal Types, `const` Assertions, `keyof` & `typeof` in Type Position

## T — TL;DR

Literal types narrow from wide (`string`) to specific (`"active"`); `const` assertions lock inferred types to their narrowest literals; `keyof` extracts the keys of a type; `typeof` in type position captures the type of a value.

## K — Key Concepts

```ts
// ── Literal types ─────────────────────────────────────────
type Direction = "north" | "south" | "east" | "west"
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6
type BoolLike = true | false   // same as boolean

// Without literal types — too wide
const dir = "north"      // inferred: string
let dir2 = "north"       // inferred: string (let allows reassignment)
const dir3: Direction = "north"  // narrowed to Direction

// ── const assertions — as const ───────────────────────────
// Infers narrowest possible literal type for entire structure
const status = "active" as const
// type: "active" (not string)

const config = {
  host: "localhost",
  port: 3000,
  debug: false
} as const
// type: { readonly host: "localhost"; readonly port: 3000; readonly debug: false }
// All properties become readonly + literal typed

const directions = ["north", "south", "east", "west"] as const
// type: readonly ["north", "south", "east", "west"] — a TUPLE, not string[]
type Direction = typeof directions[number]  // "north" | "south" | "east" | "west"

// ── keyof — extract keys of a type ────────────────────────
type User = { id: number; name: string; email: string }
type UserKey = keyof User    // "id" | "name" | "email"

function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { id: 1, name: "Alice", email: "a@b.com" }
getField(user, "name")   // ✅ returns string
getField(user, "id")     // ✅ returns number
getField(user, "role")   // ❌ Argument of type '"role"' is not assignable to keyof User

// keyof typeof for objects
const COLORS = { red: "#ff0000", green: "#00ff00", blue: "#0000ff" } as const
type ColorName = keyof typeof COLORS  // "red" | "green" | "blue"
type ColorValue = typeof COLORS[ColorName]  // "#ff0000" | "#00ff00" | "#0000ff"

// ── typeof in type position ────────────────────────────────
// Capture the TYPE of a value
const defaultConfig = { host: "localhost", port: 3000 }
type Config = typeof defaultConfig   // { host: string; port: number }

function createConfig(overrides: Partial<typeof defaultConfig>) {
  return { ...defaultConfig, ...overrides }
}

// typeof function — for callbacks that match a function signature
function greet(name: string): string { return `Hi ${name}` }
type GreetFn = typeof greet   // (name: string) => string

// ReturnType utility — leverages typeof
type GreetReturn = ReturnType<typeof greet>  // string
```


## W — Why It Matters

`as const` is the idiomatic way to create type-safe enums/constants in TypeScript — better than `enum` for most cases because values are plain strings (easier to serialize, no runtime overhead). The `keyof typeof` pattern is foundational for typed object access utilities used in every TypeScript codebase.

## I — Interview Q&A

**Q: What does `as const` do to an object?**
A: It tells TypeScript to infer the narrowest possible types — all string values become string literals (not `string`), numbers become literal numbers, and all properties become `readonly`. This turns a plain object into an immutable type-safe constant with literal types throughout.

**Q: What's the difference between `typeof` as a JavaScript operator vs. in TypeScript type position?**
A: `typeof` in JavaScript is a runtime operator returning a string (`"string"`, `"object"`, etc.). In TypeScript type position (after `:` or `=`), `typeof x` captures the **compile-time type** of variable `x` — it's resolved by the type system, not at runtime.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `let x = "north"` inferring `string` instead of `"north"` | Use `const` or `as const` or annotate: `let x: "north" = "north"` |
| `keyof T` including `symbol` and `number` unexpectedly | `keyof T` = `string \| number \| symbol` — use `Extract<keyof T, string>` for string-only keys |
| `as const` on mutable variable trying to mutate it | `as const` makes it `readonly` — TypeScript will error on mutation |

## K — Coding Challenge

**Build a typed `pick` function using `keyof`:**

```ts
pick({ id: 1, name: "Alice", role: "admin" }, ["id", "name"])
// returns: { id: number, name: string } — typed correctly
```

**Solution:**

```ts
function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(k => { result[k] = obj[k] })
  return result
}
```


***
