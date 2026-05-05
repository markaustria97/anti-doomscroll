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

## I — Interview Q&A

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
