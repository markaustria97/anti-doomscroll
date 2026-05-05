# 8 — Branded Types

## T — TL;DR

Branded types attach a phantom type tag to a primitive — preventing two structurally identical `string` types (e.g., `UserId` and `EmailAddress`) from being accidentally interchanged.

## K — Key Concepts

```ts
// ── The problem without branding ─────────────────────────
type UserId = string
type ProductId = string

function getUser(id: UserId) { /* ... */ }
function getProduct(id: ProductId) { /* ... */ }

const userId: UserId = "user-123"
const productId: ProductId = "prod-456"

getUser(productId)     // ✅ TypeScript allows it — both are just string!
// This is the bug: wrong ID type passed, no compile error

// ── Branded types — add phantom type tag ─────────────────
type Brand<T, Tag> = T & { readonly __brand: Tag }

type UserId    = Brand<string, "UserId">
type ProductId = Brand<string, "ProductId">
type EmailAddress = Brand<string, "Email">
type PositiveNumber = Brand<number, "Positive">

// Now they're structurally different — TypeScript distinguishes them
function getUser(id: UserId) { /* ... */ }
getUser(productId)  // ❌ Type '"ProductId"' does not satisfy '"UserId"'

// ── Creating branded values — constructor functions ────────
function asUserId(raw: string): UserId {
  if (!raw.startsWith("user-")) throw new Error(`Invalid UserId: ${raw}`)
  return raw as UserId   // ← assertion at boundary — only here
}

function asEmail(raw: string): EmailAddress {
  if (!/^[^@]+@[^@]+$/.test(raw)) throw new Error(`Invalid email: ${raw}`)
  return raw as EmailAddress
}

function asPositive(n: number): PositiveNumber {
  if (n <= 0) throw new Error(`Must be positive: ${n}`)
  return n as PositiveNumber
}

const userId = asUserId("user-123")     // UserId ✅
const email = asEmail("alice@b.com")   // EmailAddress ✅

getUser(userId)                         // ✅
getUser(email)                          // ❌ compile error — correct!

// ── Nominal typing for domain primitives ──────────────────
type Milliseconds = Brand<number, "ms">
type Seconds      = Brand<number, "s">
type Kilograms    = Brand<number, "kg">

function delay(ms: Milliseconds): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

const ms = 1000 as Milliseconds
const kg = 5 as Kilograms
delay(ms)   // ✅
delay(kg)   // ❌ Kilograms is not Milliseconds

// ── Simplified branding shorthand ─────────────────────────
declare const __brand: unique symbol
type Brand2<T, Tag> = T & { readonly [__brand]: Tag }
// Uses a unique symbol — slightly safer than string key
```


## W — Why It Matters

Branded types are the TypeScript equivalent of new-type idioms in Rust/Haskell. In payment systems, mixing `amount in dollars` and `amount in cents` both being `number` causes catastrophic bugs. Branding prevents passing a `ProductId` where a `UserId` is expected — both being `string` — without any runtime overhead.[^3]

## I — Interview Q&A

**Q: What is a branded type and how does it differ from a type alias?**
A: A type alias (`type UserId = string`) is structurally identical to `string` — they're interchangeable. A branded type adds a phantom property (`& { __brand: "UserId" }`) that makes it structurally distinct. You can never accidentally pass a plain `string` or a different branded type — TypeScript treats them as different types.

**Q: Is there a runtime cost to branded types?**
A: Zero runtime cost — the brand property (`__brand`) doesn't actually exist at runtime. It's a compile-time phantom. The value is still just a plain `string` or `number` at runtime. The cost is in the constructor functions that validate before branding.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `as UserId` everywhere instead of constructor functions | Only assert at validated boundaries — everywhere else let the type propagate |
| `type UserId = string & { __brand: "UserId" }` — forgetting `readonly` | Non-readonly brand can be accidentally satisfied by object literals |
| Branded number not accepting arithmetic results | `PositiveNumber + PositiveNumber` returns `number` — re-brand after math operations if needed |

## K — Coding Challenge

**Create branded types to prevent mixing Celsius and Fahrenheit temperatures:**

```ts
toCelsius(98.6 as Fahrenheit)  // ✅
toCelsius(37 as Celsius)        // ❌ TypeScript error
```

**Solution:**

```ts
type Brand<T, Tag> = T & { readonly __brand: Tag }
type Celsius    = Brand<number, "Celsius">
type Fahrenheit = Brand<number, "Fahrenheit">

const asCelsius    = (n: number): Celsius    => n as Celsius
const asFahrenheit = (n: number): Fahrenheit => n as Fahrenheit

function toCelsius(f: Fahrenheit): Celsius {
  return asCelsius((f - 32) * 5 / 9)
}

const bodyTemp = asFahrenheit(98.6)
toCelsius(bodyTemp)               // ✅ Fahrenheit → Celsius
toCelsius(asCelsius(37))          // ❌ Celsius is not Fahrenheit
```


***
