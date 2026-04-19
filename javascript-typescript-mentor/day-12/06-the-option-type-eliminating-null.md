# 6 — The `Option` Type — Eliminating `null`

## T — TL;DR

The `Option` type (also called `Maybe`) replaces `null`/`undefined` with an explicit **"value or nothing"** container — making the absence of a value type-safe and chainable.

## K — Key Concepts

### The Problem with `null`

```ts
function findUser(id: string): User | null {
  return users.get(id) ?? null
}

const user = findUser("123")
user.name // ❌ might crash if null!

// Easy to forget the null check — especially in chains:
const city = findUser("123")?.address?.city // works, but what about processing?
```

### The `Option` Type

```ts
type Option<T> = Some<T> | None

type Some<T> = { _tag: "Some"; value: T }
type None = { _tag: "None" }

const Some = <T>(value: T): Option<T> => ({ _tag: "Some", value })
const None: Option<never> = { _tag: "None" }

function fromNullable<T>(value: T | null | undefined): Option<T> {
  return value != null ? Some(value) : None
}
```

### Using `Option`

```ts
function findUser(id: string): Option<User> {
  const user = users.get(id)
  return user ? Some(user) : None
}

const result = findUser("123")

if (result._tag === "Some") {
  console.log(result.value.name) // ✅ safe
} else {
  console.log("User not found")
}
```

### `Option` with `map` and `flatMap`

```ts
function map<T, U>(opt: Option<T>, fn: (value: T) => U): Option<U> {
  return opt._tag === "Some" ? Some(fn(opt.value)) : None
}

function flatMap<T, U>(opt: Option<T>, fn: (value: T) => Option<U>): Option<U> {
  return opt._tag === "Some" ? fn(opt.value) : None
}

function getOrElse<T>(opt: Option<T>, fallback: T): T {
  return opt._tag === "Some" ? opt.value : fallback
}

// Chain:
const userCity = flatMap(
  findUser("123"),
  user => fromNullable(user.address),
)
|> (opt => flatMap(opt, addr => fromNullable(addr.city)))
|> (opt => getOrElse(opt, "Unknown"))
```

### When to Use `Option` vs `null`

| Use `T | null` | Use `Option<T>` |
|---|---|
| Simple one-level checks | Multi-step chains where null propagation matters |
| TypeScript's `?.` suffices | You need `map`/`flatMap` composition |
| Team isn't familiar with FP | Codebase uses functional patterns |
| Quick scripts | Library/framework code |

**Pragmatic recommendation:** Use `T | null` with optional chaining for most TypeScript code. Use `Option` when you're building a functional pipeline or library that benefits from chainable absence handling.

## W — Why It Matters

- `null` is called the "billion-dollar mistake" by its inventor (Tony Hoare).
- `Option`/`Maybe` is standard in Rust (`Option<T>`), Haskell (`Maybe a`), Swift (`Optional<T>`), and Scala.
- Chaining with `map`/`flatMap` avoids deeply nested null checks.
- Understanding `Option` deepens your understanding of `Result` (they share the same structure).
- Libraries like `fp-ts` and `Effect` use `Option` extensively.

## I — Interview Questions with Answers

### Q1: What is the Option type?

**A:** A discriminated union `Some<T> | None` that explicitly represents the presence or absence of a value. Unlike `null`, it's a proper container with `map`, `flatMap`, and `getOrElse` operations for safe, chainable access.

### Q2: How does Option relate to Result?

**A:** `Option<T>` is `Result<T, void>` — a Result without error information. `Some(value)` = `Ok(value)`. `None` = `Err(undefined)`. Both are discriminated unions with the same `map`/`flatMap` API.

### Q3: Should I use Option everywhere instead of null?

**A:** No. TypeScript's `strictNullChecks` + optional chaining (`?.`) + nullish coalescing (`??`) handle most cases. Use `Option` when you need chainable transformations over potentially absent values, or in codebases that follow functional programming patterns.

## C — Common Pitfalls with Fix

### Pitfall: Using Option when `?.` suffices

```ts
// Overkill:
const name = map(fromNullable(user), u => u.name)

// Simpler:
const name = user?.name ?? "Unknown"
```

**Fix:** Use Option for chains and pipelines, `?.` for simple access.

### Pitfall: `None` losing type information

```ts
const x: Option<string> = None // None is Option<never> — needs annotation
```

**Fix:** Type the variable: `const x: Option<string> = None`.

## K — Coding Challenge with Solution

### Challenge

Implement a safe `Option`-based lookup chain:

```ts
const config: Record<string, Record<string, string>> = {
  database: { host: "localhost", port: "5432" },
  cache: { host: "redis-server" },
}

// Get config.database.port safely:
getConfig(config, "database", "port") // Some("5432")
getConfig(config, "cache", "port")    // None
getConfig(config, "unknown", "port")  // None
```

### Solution

```ts
type Option<T> = { _tag: "Some"; value: T } | { _tag: "None" }
const Some = <T>(value: T): Option<T> => ({ _tag: "Some", value })
const None: Option<never> = { _tag: "None" }

function fromNullable<T>(value: T | null | undefined): Option<T> {
  return value != null ? Some(value) : None
}

function flatMap<T, U>(opt: Option<T>, fn: (v: T) => Option<U>): Option<U> {
  return opt._tag === "Some" ? fn(opt.value) : None
}

function getConfig(
  config: Record<string, Record<string, string>>,
  section: string,
  key: string,
): Option<string> {
  return flatMap(
    fromNullable(config[section]),
    sectionObj => fromNullable(sectionObj[key]),
  )
}
```

---
