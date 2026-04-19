# 5 — Adapter Pattern

## T — TL;DR

The Adapter pattern wraps an **incompatible interface** to make it work with the interface your code expects — it's the "translator" between systems that don't speak the same language.

## K — Key Concepts

### The Problem

```ts
// Your app expects this interface:
interface PaymentGateway {
  charge(amount: number, currency: string): Promise<{ transactionId: string }>
}

// But the third-party SDK has a different API:
class StripeSdk {
  async createCharge(params: {
    amount_cents: number
    currency_code: string
    idempotency_key: string
  }) {
    return { id: "ch_123", status: "succeeded" }
  }
}
```

### The Adapter

```ts
class StripeAdapter implements PaymentGateway {
  #stripe: StripeSdk

  constructor(stripe: StripeSdk) {
    this.#stripe = stripe
  }

  async charge(amount: number, currency: string) {
    const result = await this.#stripe.createCharge({
      amount_cents: Math.round(amount * 100),
      currency_code: currency.toUpperCase(),
      idempotency_key: crypto.randomUUID(),
    })

    return { transactionId: result.id }
  }
}

// Usage — your code only knows about PaymentGateway:
class OrderService {
  constructor(private payment: PaymentGateway) {}

  async placeOrder(amount: number) {
    const { transactionId } = await this.payment.charge(amount, "usd")
    console.log(`Paid: ${transactionId}`)
  }
}

// Wire up:
const service = new OrderService(new StripeAdapter(new StripeSdk()))
```

### Multiple Adapters for the Same Interface

```ts
class PayPalAdapter implements PaymentGateway {
  constructor(private paypal: PayPalClient) {}

  async charge(amount: number, currency: string) {
    const order = await this.paypal.createOrder({
      purchase_amount: amount,
      currency_iso: currency,
    })
    return { transactionId: order.orderId }
  }
}

// Swap payment provider without changing OrderService:
const stripeService = new OrderService(new StripeAdapter(new StripeSdk()))
const paypalService = new OrderService(new PayPalAdapter(new PayPalClient()))
```

### Adapting Data Shapes

```ts
// External API returns snake_case:
interface ExternalUser {
  user_id: string
  first_name: string
  last_name: string
  email_address: string
}

// Your app uses camelCase:
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

class UserApiAdapter {
  static toInternal(external: ExternalUser): User {
    return {
      id: external.user_id,
      firstName: external.first_name,
      lastName: external.last_name,
      email: external.email_address,
    }
  }

  static toExternal(user: User): ExternalUser {
    return {
      user_id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email_address: user.email,
    }
  }
}
```

### Function Adapter (Lightweight)

```ts
// Not everything needs a class — sometimes a function is enough:
function adaptFetch(
  legacyFetch: (url: string, callback: (err: Error | null, data: unknown) => void) => void
): (url: string) => Promise<unknown> {
  return (url: string) =>
    new Promise((resolve, reject) => {
      legacyFetch(url, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
}

// Adapts callback-based API to Promise-based
const modernFetch = adaptFetch(legacyHttpGet)
const data = await modernFetch("/api/users")
```

## W — Why It Matters

- Adapters **isolate third-party dependencies** — when Stripe changes their SDK, you update one adapter.
- Every real system integrates with external APIs, SDKs, and legacy code that don't match your interfaces.
- The callback-to-Promise adapter is used in every Node.js codebase (`util.promisify`).
- snake_case ↔ camelCase adapters are in every app that consumes external APIs.
- Adapters make testing easy — mock the interface, not the third-party SDK.

## I — Interview Questions with Answers

### Q1: What is the Adapter pattern?

**A:** A structural pattern that wraps an object with an incompatible interface to make it conform to the interface your code expects. It translates between two incompatible APIs without modifying either.

### Q2: How does Adapter differ from Facade?

**A:** Adapter makes an **incompatible** interface compatible. Facade simplifies a **complex** interface. Adapter changes the interface shape; Facade reduces it.

### Q3: When should you use the Adapter pattern?

**A:** When integrating third-party SDKs, consuming APIs with different data shapes (snake_case ↔ camelCase), wrapping legacy code (callbacks → Promises), or abstracting vendor-specific APIs behind a unified interface.

## C — Common Pitfalls with Fix

### Pitfall: Adapter doing business logic

```ts
class StripeAdapter implements PaymentGateway {
  async charge(amount: number, currency: string) {
    if (amount > 10000) throw new Error("Max limit") // ❌ business rule in adapter
    // ...
  }
}
```

**Fix:** Adapters should only translate. Business rules belong in the service layer.

### Pitfall: Over-adapting (wrapping everything)

**Fix:** Only adapt interfaces that are actually incompatible. If the third-party API already matches your interface, use it directly.

## K — Coding Challenge with Solution

### Challenge

Create an adapter that makes `localStorage` conform to this async cache interface:

```ts
interface AsyncCache {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlMs?: number): Promise<void>
  delete(key: string): Promise<void>
}
```

### Solution

```ts
class LocalStorageAdapter implements AsyncCache {
  async get(key: string): Promise<string | null> {
    const item = localStorage.getItem(key)
    if (!item) return null

    try {
      const { value, expiry } = JSON.parse(item)
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem(key)
        return null
      }
      return value
    } catch {
      return item // plain string, no wrapper
    }
  }

  async set(key: string, value: string, ttlMs?: number): Promise<void> {
    const item = JSON.stringify({
      value,
      expiry: ttlMs ? Date.now() + ttlMs : null,
    })
    localStorage.setItem(key, item)
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key)
  }
}
```

---
