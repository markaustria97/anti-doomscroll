# 7 — Branded / Opaque Types

## T — TL;DR

Branded types add an **invisible tag** to a base type, making structurally identical types incompatible — preventing bugs like passing a `UserId` where an `OrderId` is expected, even though both are `string`.

## K — Key Concepts

### The Problem

```ts
type UserId = string
type OrderId = string

function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

const orderId: OrderId = "order-123"
getUser(orderId) // ✅ — but this is a BUG! TypeScript doesn't catch it.
```

Both are `string` — TypeScript's structural typing makes them interchangeable.

### The Solution: Brands

```ts
type Brand<T, B extends string> = T & { __brand: B }

type UserId = Brand<string, "UserId">
type OrderId = Brand<string, "OrderId">

function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

const userId = "user-123" as UserId
const orderId = "order-123" as OrderId

getUser(userId)   // ✅
getUser(orderId)  // ❌ Type 'OrderId' is not assignable to type 'UserId'
getOrder(orderId) // ✅
```

### Better Brand Pattern (Unique Symbol)

```ts
declare const __brand: unique symbol

type Brand<T, B> = T & { [__brand]: B }

type UserId = Brand<string, "UserId">
type OrderId = Brand<string, "OrderId">
type Email = Brand<string, "Email">
type PositiveInt = Brand<number, "PositiveInt">
```

Using a unique symbol prevents accidental collision with real properties.

### Creating Branded Values (Smart Constructors)

```ts
function createUserId(id: string): UserId {
  if (!id.startsWith("usr_")) {
    throw new Error("Invalid user ID format")
  }
  return id as UserId
}

function createEmail(email: string): Email {
  if (!email.includes("@")) {
    throw new Error("Invalid email format")
  }
  return email as Email
}

const id = createUserId("usr_123") // UserId ✅
const email = createEmail("mark@test.com") // Email ✅
```

Smart constructors validate at runtime and brand at the type level.

### Branded Numbers

```ts
type PositiveInt = Brand<number, "PositiveInt">
type Percentage = Brand<number, "Percentage">

function createPositiveInt(n: number): PositiveInt {
  if (!Number.isInteger(n) || n <= 0) throw new Error("Must be positive integer")
  return n as PositiveInt
}

function createPercentage(n: number): Percentage {
  if (n < 0 || n > 100) throw new Error("Must be 0-100")
  return n as Percentage
}

function setOpacity(value: Percentage) { /* ... */ }

setOpacity(createPercentage(50))       // ✅
setOpacity(createPositiveInt(50))      // ❌ PositiveInt ≠ Percentage
setOpacity(50)                          // ❌ number ≠ Percentage
```

### Branded Values Are Still Usable as Base Types

```ts
const id: UserId = createUserId("usr_123")

// All string operations still work:
id.toUpperCase()   // ✅
id.startsWith("u") // ✅
id.length          // ✅

// But you can't pass it where OrderId is expected:
getOrder(id)       // ❌
```

### Real-World Use Cases

| Brand | Base Type | Prevents |
|-------|-----------|----------|
| `UserId` | `string` | Mixing user IDs with other IDs |
| `Email` | `string` | Passing unvalidated strings as emails |
| `PositiveInt` | `number` | Negative numbers, floats |
| `USD` / `EUR` | `number` | Mixing currencies |
| `Latitude` / `Longitude` | `number` | Swapping lat/lng |
| `Sanitized<string>` | `string` | XSS from unsanitized input |

## W — Why It Matters

- Branded types prevent **entire categories** of bugs with zero runtime cost (the brand is erased).
- Financial apps use currency brands to prevent mixing USD and EUR.
- Geo apps use lat/lng brands to prevent coordinate swaps.
- Security-critical code uses `Sanitized` brands to prevent XSS.
- This is an advanced pattern that signals senior-level TypeScript knowledge.

## I — Interview Questions with Answers

### Q1: What are branded types?

**A:** Types with an invisible "tag" that makes structurally identical types incompatible. `type UserId = string & { __brand: "UserId" }` — still a string at runtime, but TypeScript treats it differently from `OrderId`.

### Q2: Why are they needed if TypeScript is structurally typed?

**A:** Exactly because of structural typing. Two `string` types are interchangeable — branded types add a phantom property that breaks structural compatibility, providing nominal-like typing.

### Q3: Do brands exist at runtime?

**A:** No. The brand is a compile-time-only intersection. At runtime, a `UserId` is just a plain `string`. The `as UserId` assertion is the only runtime trace.

## C — Common Pitfalls with Fix

### Pitfall: Accidentally creating branded values without validation

```ts
const bad = "not-a-user-id" as UserId // compiles, but invalid!
```

**Fix:** Only expose smart constructors. Never cast directly in application code:

```ts
// Only createUserId should use `as UserId`
// All other code receives UserId from the constructor
```

### Pitfall: JSON serialization loses the brand

```ts
const id: UserId = createUserId("usr_123")
const json = JSON.stringify({ id })
const parsed = JSON.parse(json) // { id: string } — brand lost
```

**Fix:** Re-validate after deserialization: `createUserId(parsed.id)`.

## K — Coding Challenge with Solution

### Challenge

Create a branded `Currency` system where you can't add USD + EUR:

```ts
const price = usd(9.99)
const tax = usd(0.99)
const foreign = eur(8.50)

add(price, tax)     // ✅ USD + USD
add(price, foreign) // ❌ USD + EUR
```

### Solution

```ts
declare const __brand: unique symbol
type Brand<T, B> = T & { [__brand]: B }

type USD = Brand<number, "USD">
type EUR = Brand<number, "EUR">

function usd(amount: number): USD {
  return amount as USD
}

function eur(amount: number): EUR {
  return amount as EUR
}

function add<T extends Brand<number, string>>(a: T, b: T): T {
  return ((a as number) + (b as number)) as T
}

const total = add(usd(9.99), usd(0.99)) // ✅ USD
// const bad = add(usd(9.99), eur(8.50)) // ❌ USD ≠ EUR
```

---
