# 8 — Strategy Pattern

## T — TL;DR

The Strategy pattern defines a **family of interchangeable algorithms** behind a common interface — the caller picks which strategy to use at runtime without knowing implementation details.

## K — Key Concepts

### Basic Strategy

```ts
interface CompressionStrategy {
  compress(data: Buffer): Promise<Buffer>
  decompress(data: Buffer): Promise<Buffer>
  readonly extension: string
}

class GzipStrategy implements CompressionStrategy {
  readonly extension = ".gz"

  async compress(data: Buffer) {
    // gzip compression
    return data // placeholder
  }

  async decompress(data: Buffer) {
    return data
  }
}

class BrotliStrategy implements CompressionStrategy {
  readonly extension = ".br"

  async compress(data: Buffer) {
    return data
  }

  async decompress(data: Buffer) {
    return data
  }
}

class NoCompressionStrategy implements CompressionStrategy {
  readonly extension = ""

  async compress(data: Buffer) { return data }
  async decompress(data: Buffer) { return data }
}
```

### Context Using Strategy

```ts
class FileProcessor {
  constructor(private compression: CompressionStrategy) {}

  setStrategy(strategy: CompressionStrategy) {
    this.compression = strategy
  }

  async processFile(input: Buffer): Promise<{ data: Buffer; filename: string }> {
    const compressed = await this.compression.compress(input)
    return {
      data: compressed,
      filename: `output${this.compression.extension}`,
    }
  }
}

// Usage — swap algorithms at runtime:
const processor = new FileProcessor(new GzipStrategy())
await processor.processFile(buffer)

processor.setStrategy(new BrotliStrategy())
await processor.processFile(buffer)
```

### Strategy with Functions (Lightweight)

```ts
type SortStrategy<T> = (items: T[]) => T[]

const sortByName: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => a.name.localeCompare(b.name))

const sortByAge: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => a.age - b.age)

const sortByRecent: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

function displayUsers(users: User[], strategy: SortStrategy<User>) {
  const sorted = strategy(users)
  sorted.forEach(u => console.log(`${u.name} (${u.age})`))
}

displayUsers(users, sortByName)
displayUsers(users, sortByAge)
```

### Strategy Map

```ts
type PricingTier = "free" | "basic" | "premium"

interface PricingStrategy {
  calculatePrice(basePrice: number): number
  readonly name: string
}

const pricingStrategies: Record<PricingTier, PricingStrategy> = {
  free: {
    name: "Free",
    calculatePrice: () => 0,
  },
  basic: {
    name: "Basic",
    calculatePrice: (base) => base,
  },
  premium: {
    name: "Premium",
    calculatePrice: (base) => base * 0.8, // 20% discount
  },
}

function getPrice(tier: PricingTier, basePrice: number): number {
  return pricingStrategies[tier].calculatePrice(basePrice)
}
```

### Strategy vs if/else

```ts
// ❌ if/else — violates OCP, grows forever
function calculateDiscount(type: string, amount: number) {
  if (type === "vip") return amount * 0.2
  if (type === "employee") return amount * 0.3
  if (type === "seasonal") return amount * 0.1
  return 0
}

// ✅ Strategy — add new types without modifying existing code
const discountStrategies: Record<string, (amount: number) => number> = {
  vip: (amount) => amount * 0.2,
  employee: (amount) => amount * 0.3,
  seasonal: (amount) => amount * 0.1,
}

function calculateDiscount(type: string, amount: number): number {
  return (discountStrategies[type] ?? (() => 0))(amount)
}
```

## W — Why It Matters

- Strategy eliminates **conditional complexity** — replace growing `if/else`/`switch` chains.
- Algorithms can be **swapped at runtime** (compression, sorting, pricing, authentication).
- It's the pattern behind React's render strategies, authentication providers, and logging backends.
- Functional strategy (passing functions) is more common in TypeScript than class-based strategy.
- Strategy implements OCP — add new algorithms without modifying existing code.

## I — Interview Questions with Answers

### Q1: What is the Strategy pattern?

**A:** A behavioral pattern that defines a family of algorithms as interchangeable objects/functions behind a common interface. The client selects which strategy to use, and the strategy handles the implementation. This eliminates conditional branching and follows OCP.

### Q2: When should you use Strategy vs if/else?

**A:** Use Strategy when: (1) you have 3+ algorithms, (2) algorithms are likely to change or grow, (3) algorithms are complex enough to encapsulate, (4) algorithms need to be swapped at runtime. Simple one-line conditions are fine as `if/else`.

## C — Common Pitfalls with Fix

### Pitfall: Over-engineering simple conditions into strategies

```ts
const isAdult: Strategy = (age) => age >= 18 // overkill
```

**Fix:** If the logic is a simple comparison, a plain function or `if` is fine.

### Pitfall: Strategy with shared mutable state

```ts
class CachingStrategy {
  #cache: Map<string, unknown> = new Map() // shared across calls!
}
```

**Fix:** Make strategies stateless, or ensure state is properly scoped.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `ValidationStrategy` system:

```ts
const emailValidator: ValidationStrategy<string> = { /* ... */ }
const ageValidator: ValidationStrategy<number> = { /* ... */ }

validate("not-an-email", emailValidator) // { valid: false, errors: ["Invalid email format"] }
validate(25, ageValidator) // { valid: true, errors: [] }
```

### Solution

```ts
interface ValidationResult {
  valid: boolean
  errors: string[]
}

type ValidationStrategy<T> = (value: T) => ValidationResult

const emailValidator: ValidationStrategy<string> = (value) => {
  const errors: string[] = []
  if (!value.includes("@")) errors.push("Missing @ symbol")
  if (!value.includes(".")) errors.push("Missing domain")
  if (value.length < 5) errors.push("Too short")
  return { valid: errors.length === 0, errors }
}

const ageValidator: ValidationStrategy<number> = (value) => {
  const errors: string[] = []
  if (!Number.isInteger(value)) errors.push("Must be integer")
  if (value < 0) errors.push("Must be positive")
  if (value > 150) errors.push("Unrealistic age")
  return { valid: errors.length === 0, errors }
}

function validate<T>(value: T, strategy: ValidationStrategy<T>): ValidationResult {
  return strategy(value)
}

// Compose validators:
function compose<T>(...strategies: ValidationStrategy<T>[]): ValidationStrategy<T> {
  return (value: T) => {
    const allErrors = strategies.flatMap(s => s(value).errors)
    return { valid: allErrors.length === 0, errors: allErrors }
  }
}
```

---
