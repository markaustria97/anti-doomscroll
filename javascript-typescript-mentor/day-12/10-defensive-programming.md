# 10 — Defensive Programming

## T — TL;DR

Defensive programming validates **assumptions at boundaries** — function inputs, API data, config, environment variables — catching errors at the source instead of letting them propagate silently.

## K — Key Concepts

### Guard Clauses

```ts
// ❌ Nested conditions — hard to follow
function processOrder(order: Order | null) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === "pending") {
        // finally do the work...
      }
    }
  }
}

// ✅ Guard clauses — early returns, flat code
function processOrder(order: Order | null) {
  if (!order) throw new Error("Order is required")
  if (order.items.length === 0) throw new Error("Order must have items")
  if (order.status !== "pending") throw new Error("Order must be pending")

  // Happy path — flat, readable
  const total = calculateTotal(order.items)
  return { ...order, total, status: "processed" }
}
```

### Assertion Functions

```ts
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value == null) throw new Error(`${name} must be defined`)
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}

// Usage:
function handleStatus(status: "active" | "inactive" | "pending") {
  switch (status) {
    case "active": return "✅"
    case "inactive": return "❌"
    case "pending": return "⏳"
    default: assertNever(status) // caught at compile time if you add a new status
  }
}
```

### Environment Variable Validation

```ts
function getEnvOrThrow(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

// Validate ALL required env vars at startup:
const config = {
  port: Number(getEnvOrThrow("PORT")),
  databaseUrl: getEnvOrThrow("DATABASE_URL"),
  jwtSecret: getEnvOrThrow("JWT_SECRET"),
  nodeEnv: getEnvOrThrow("NODE_ENV") as "development" | "production" | "test",
} as const

// App crashes immediately if any env var is missing — not at 3am when the first request hits.
```

### Input Validation at Boundaries

```ts
// API boundary — validate incoming data:
function createUser(input: unknown): Result<User, ValidationError> {
  const parsed = UserSchema.safeParse(input) // Zod (topic 11)
  if (!parsed.success) {
    return err(new ValidationError(parsed.error.flatten().fieldErrors))
  }
  return ok(parsed.data)
}
```

### Defensive Defaults

```ts
// ❌ Assumes data exists
function getDisplayName(user: User) {
  return user.profile.displayName
}

// ✅ Defensive with fallbacks
function getDisplayName(user: User): string {
  return user.profile?.displayName || user.name || user.email || "Anonymous"
}
```

### `invariant` Pattern

```ts
function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`)
  }
}

// Use at critical points:
function withdraw(account: Account, amount: number): Account {
  invariant(amount > 0, "Withdrawal amount must be positive")
  invariant(account.balance >= amount, "Insufficient balance")
  invariant(account.status === "active", "Account must be active")

  return { ...account, balance: account.balance - amount }
}
```

## W — Why It Matters

- Bugs caught at boundaries are **100x cheaper** than bugs caught in production.
- Guard clauses make code **flat and readable** — no deep nesting.
- Startup validation ensures misconfiguration crashes **immediately**, not at 3am.
- Assertion functions narrow types AND protect runtime behavior.
- Defensive programming is expected in production codebases.

## I — Interview Questions with Answers

### Q1: What is defensive programming?

**A:** Writing code that anticipates and handles invalid inputs, missing data, and edge cases at system boundaries. It validates assumptions early, fails fast with clear errors, and uses guard clauses to keep the happy path clean.

### Q2: What is a guard clause?

**A:** An early return or throw at the start of a function that handles invalid cases. Instead of nesting `if` conditions, you check for problems first and exit early. The remaining code handles only the valid case — flat and readable.

### Q3: When should you validate?

**A:** At **boundaries**: API inputs, environment variables, config files, user input, external API responses, database results. Don't validate deep inside pure business logic — that should receive already-validated data.

## C — Common Pitfalls with Fix

### Pitfall: Defensive code everywhere (not just boundaries)

```ts
// ❌ Over-defensive inside pure functions
function add(a: number, b: number) {
  if (typeof a !== "number") throw new Error("a must be number")
  if (typeof b !== "number") throw new Error("b must be number")
  return a + b
}
```

**Fix:** TypeScript catches type errors at compile time. Defend at boundaries, trust types internally.

### Pitfall: Swallowing errors silently

```ts
try { riskyOperation() } catch (e) { /* ignore */ } // ❌
```

**Fix:** At minimum log the error. Prefer Result types that force handling.

## K — Coding Challenge with Solution

### Challenge

Create a `Config` class that validates all required environment variables at startup:

```ts
const config = Config.fromEnv()
// Throws immediately if any required var is missing
// Returns a fully typed, frozen config object
```

### Solution

```ts
interface AppConfig {
  readonly port: number
  readonly host: string
  readonly databaseUrl: string
  readonly jwtSecret: string
  readonly env: "development" | "production" | "test"
  readonly logLevel: "debug" | "info" | "warn" | "error"
}

class Config {
  static fromEnv(): AppConfig {
    const get = (name: string): string => {
      const value = process.env[name]
      if (!value) throw new Error(`Missing env var: ${name}`)
      return value
    }

    const getOptional = (name: string, fallback: string): string =>
      process.env[name] || fallback

    const env = get("NODE_ENV")
    if (!["development", "production", "test"].includes(env)) {
      throw new Error(`Invalid NODE_ENV: ${env}`)
    }

    const logLevel = getOptional("LOG_LEVEL", "info")
    if (!["debug", "info", "warn", "error"].includes(logLevel)) {
      throw new Error(`Invalid LOG_LEVEL: ${logLevel}`)
    }

    const config: AppConfig = {
      port: Number(getOptional("PORT", "3000")),
      host: getOptional("HOST", "localhost"),
      databaseUrl: get("DATABASE_URL"),
      jwtSecret: get("JWT_SECRET"),
      env: env as AppConfig["env"],
      logLevel: logLevel as AppConfig["logLevel"],
    }

    if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
      throw new Error(`Invalid PORT: ${process.env.PORT}`)
    }

    return Object.freeze(config)
  }
}
```

---
