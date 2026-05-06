# 6 — Intrinsic String Utility Types

## T — TL;DR

TypeScript ships four built-in string-transformation utility types — `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` — that operate on string literal types at compile time.

## K — Key Concepts

```ts
// ── Intrinsic string types ────────────────────────────────
type Upper = Uppercase<"hello">          // "HELLO"
type Lower = Lowercase<"WORLD">          // "world"
type Cap = Capitalize<"fooBar">          // "FooBar"
type Uncap = Uncapitalize<"FooBar">      // "fooBar"

// With union types — distributed automatically
type Status = "pending" | "active" | "failed"
type UpperStatus = Uppercase<Status>     // "PENDING" | "ACTIVE" | "FAILED"
type CappedStatus = Capitalize<Status>   // "Pending" | "Active" | "Failed"

// ── Real-world: generate getter names ─────────────────────
type GetterName<K extends string> = `get${Capitalize<K>}`

type User = { name: string; age: number; email: string }
type UserGetters = {
  [K in keyof User as GetterName<string & K>]: () => User[K]
}
// {
//   getName: () => string
//   getAge: () => number
//   getEmail: () => string
// }

// ── Generate event handler names ──────────────────────────
type EventHandlers<T extends string> = {
  [K in T as `on${Capitalize<K>}`]: () => void
}
type ClickHandlers = EventHandlers<"click" | "focus" | "blur">
// { onClick: () => void; onFocus: () => void; onBlur: () => void }

// ── CSS property transformation ────────────────────────────
type CSSVariables<T extends Record<string, string>> = {
  [K in keyof T as `--${string & K}`]: T[K]
}
// Generates CSS custom property names from object keys

// ── Uppercase enum from union ─────────────────────────────
type Direction = "north" | "south" | "east" | "west"
type DirectionConst = Uppercase<Direction>
// "NORTH" | "SOUTH" | "EAST" | "WEST"
```


## W — Why It Matters

These intrinsic types unlock string manipulation in the type system — essential for code generation, ORM type inference (e.g., Prisma generates typed `findByName`, `findByEmail`), and any API that follows naming conventions (React event props `onClick`, `onChange`, `onFocus`).

## I — Interview Q&A

**Q: What does `Capitalize<T>` do and where is it useful?**
A: It uppercases the first character of a string literal type. Combined with template literal types and mapped types, it generates camelCase property names — like turning `{ name, age }` into `{ getName, getAge }` at the type level.

**Q: Are these types available at runtime?**
A: No — `Uppercase`, `Capitalize`, etc. are purely compile-time constructs. At runtime, you'd use `str.toUpperCase()`, `str.toUpperCase() + str.slice(1)`, etc.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using on `string` (not a literal) → returns `string` | These work on literal types — `Uppercase<string>` = `string` |
| Expecting them to work on template literal variables | Only works on literal/union string types, not runtime values |

## K — Coding Challenge

**Generate a type for a React component's event props from a list of events:**

```ts
type Events = "click" | "change" | "submit" | "focus"
// Should produce: { onClick: Handler; onChange: Handler; onSubmit: Handler; onFocus: Handler }
```

**Solution:**

```ts
type Handler = (event: Event) => void
type ReactEventProps<T extends string> = {
  [K in T as `on${Capitalize<K>}`]: Handler
}
type MyProps = ReactEventProps<Events>
// { onClick: Handler; onChange: Handler; onSubmit: Handler; onFocus: Handler }
```


***
