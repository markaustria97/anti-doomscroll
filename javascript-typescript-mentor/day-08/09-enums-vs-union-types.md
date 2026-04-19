# 9 — Enums vs Union Types

## T — TL;DR

TypeScript `enum`s generate runtime code and have several gotchas — **prefer union types** (`"admin" | "user"`) for most cases; use `as const` objects when you need both values and types.

## K — Key Concepts

### String Enums

```ts
enum Direction {
  North = "NORTH",
  South = "SOUTH",
  East = "EAST",
  West = "WEST",
}

function move(dir: Direction) { /* ... */ }
move(Direction.North)   // ✅
move("NORTH")           // ❌ — must use the enum, not the string
```

### Numeric Enums (Avoid)

```ts
enum Status {
  Active,     // 0
  Inactive,   // 1
  Pending,    // 2
}

// The dangerous reverse mapping:
Status[0]       // "Active" — string!
Status.Active   // 0 — number!
Status["Active"] // 0

// This compiles to runtime JS:
// var Status;
// (function (Status) {
//     Status[Status["Active"] = 0] = "Active";
//     ...
// })(Status || (Status = {}));
```

Numeric enums create **bidirectional mappings** at runtime — a source of confusion and bugs.

### The Problems with Enums

```ts
// Problem 1: Numeric enums accept any number
enum Status { Active, Inactive }
function handle(s: Status) {}
handle(99) // ✅ — no error! Any number is accepted.

// Problem 2: Enums generate runtime code
enum Color { Red, Green, Blue }
// Compiles to ~10 lines of JavaScript, even if tree-shaking is enabled

// Problem 3: Const enums have different behavior
const enum Color { Red, Green, Blue }
// Inlined at compile time — but doesn't work with --isolatedModules

// Problem 4: Enums can't be used with `keyof typeof` easily
// Problem 5: Different from standard TypeScript patterns
```

### Union Types — The Better Alternative

```ts
type Direction = "north" | "south" | "east" | "west"

function move(dir: Direction) {
  switch (dir) {
    case "north": return [0, 1]
    case "south": return [0, -1]
    case "east": return [1, 0]
    case "west": return [-1, 0]
  }
}

move("north") // ✅
move("up")    // ❌ Type '"up"' is not assignable to type 'Direction'
```

No runtime code. No reverse mappings. Full type safety.

### `as const` Objects — When You Need Both Values and Types

```ts
const Direction = {
  North: "NORTH",
  South: "SOUTH",
  East: "EAST",
  West: "WEST",
} as const

type Direction = (typeof Direction)[keyof typeof Direction]
// type: "NORTH" | "SOUTH" | "EAST" | "WEST"

function move(dir: Direction) { /* ... */ }
move(Direction.North)  // ✅
move("NORTH")          // ✅ — both work!
```

### Comparison

| Feature | `enum` | Union type | `as const` object |
|---------|--------|-----------|-------------------|
| Runtime code | ✅ Yes | ❌ No | ✅ Minimal (the object) |
| Reverse mapping | ✅ (numeric only) | ❌ | ❌ |
| Tree-shakeable | ❌ | ✅ | ✅ |
| Works with `isolatedModules` | ⚠️ `const enum` doesn't | ✅ | ✅ |
| Direct string comparison | ❌ (must use enum) | ✅ | ✅ |
| Auto-incrementing values | ✅ | ❌ | ❌ |
| Standard JS pattern | ❌ | ✅ | ✅ |

## W — Why It Matters

- Major projects (Google, Vercel, the TypeScript team itself) recommend unions over enums.
- Enums generate runtime code that can't be tree-shaken.
- Numeric enums accepting any number is a significant type safety hole.
- `as const` objects give you the same DX as enums without the gotchas.
- This is a frequently tested opinion question in interviews.

## I — Interview Questions with Answers

### Q1: Why should you prefer union types over enums?

**A:** Union types are zero-runtime-cost, tree-shakeable, and follow standard TypeScript patterns. Enums generate runtime code, numeric enums have a type safety hole (accepting any number), and `const enum` doesn't work with `isolatedModules`.

### Q2: When might you still use an enum?

**A:** When you need auto-incrementing numeric values, bidirectional mapping (value ↔ name), or when working with a codebase that already uses enums extensively. String enums are less problematic than numeric enums.

### Q3: How does an `as const` object replace an enum?

**A:** `const X = { A: "a", B: "b" } as const` creates a runtime object with exact literal types. `type X = (typeof X)[keyof typeof X]` derives the union type. You get both runtime values (`X.A`) and compile-time types.

## C — Common Pitfalls with Fix

### Pitfall: Numeric enums accepting arbitrary numbers

```ts
enum Role { Admin, User }
function setRole(r: Role) {}
setRole(999) // ✅ — no error!
```

**Fix:** Use string enums or union types: `type Role = "admin" | "user"`.

### Pitfall: `const enum` with `isolatedModules`

```ts
const enum Color { Red, Green, Blue }
// ❌ 'const' enums are not allowed when 'isolatedModules' is enabled
```

**Fix:** Use regular enum or `as const` object.

## K — Coding Challenge with Solution

### Challenge

Refactor this enum-based code to use `as const`:

```ts
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
}

function log(level: LogLevel, message: string) {
  console.log(`[${level}] ${message}`)
}

log(LogLevel.Info, "Server started")
```

### Solution

```ts
const LogLevel = {
  Debug: "DEBUG",
  Info: "INFO",
  Warn: "WARN",
  Error: "ERROR",
} as const

type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]
// "DEBUG" | "INFO" | "WARN" | "ERROR"

function log(level: LogLevel, message: string) {
  console.log(`[${level}] ${message}`)
}

log(LogLevel.Info, "Server started") // ✅
log("INFO", "Also works")           // ✅
log("INVALID", "Nope")              // ❌
```

---
