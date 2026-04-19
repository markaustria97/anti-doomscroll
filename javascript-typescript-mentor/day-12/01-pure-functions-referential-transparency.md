# 1 — Pure Functions & Referential Transparency

## T — TL;DR

A pure function always returns the **same output for the same input** and has **no side effects** — this makes code predictable, testable, and composable.

## K — Key Concepts

### What Makes a Function Pure

```ts
// ✅ Pure — same input → same output, no side effects
function add(a: number, b: number): number {
  return a + b
}

function formatName(first: string, last: string): string {
  return `${first} ${last}`
}

function discount(price: number, percent: number): number {
  return price * (1 - percent / 100)
}
```

```ts
// ❌ Impure — depends on external state
let taxRate = 0.08

function calculateTotal(price: number): number {
  return price * (1 + taxRate) // depends on external mutable variable
}

// ❌ Impure — causes side effect
function saveUser(user: User): void {
  database.insert(user) // side effect: writes to database
}

// ❌ Impure — non-deterministic
function getUserId(): string {
  return crypto.randomUUID() // different output each call
}
```

### The Two Rules

1. **Deterministic** — Given the same arguments, always returns the same result.
2. **No side effects** — Doesn't modify external state, I/O, or anything outside its scope.

### Referential Transparency

An expression is referentially transparent if you can **replace it with its value** without changing the program's behavior:

```ts
// Pure:
const total = add(5, 3)
// You can replace add(5, 3) with 8 everywhere — program unchanged

// Impure:
const id = getUserId()
// You CANNOT replace getUserId() with a fixed string — each call differs
```

### Making Impure Functions Purer

```ts
// ❌ Impure — depends on external taxRate
let taxRate = 0.08
function total(price: number) {
  return price * (1 + taxRate)
}

// ✅ Pure — taxRate is a parameter
function total(price: number, taxRate: number) {
  return price * (1 + taxRate)
}

// ❌ Impure — mutates the input
function addItem(cart: string[], item: string) {
  cart.push(item) // mutates!
  return cart
}

// ✅ Pure — returns new array
function addItem(cart: readonly string[], item: string): string[] {
  return [...cart, item]
}
```

### Separating Pure from Impure (Functional Core, Imperative Shell)

```ts
// Pure core — all business logic, fully testable:
function calculateOrderTotal(items: OrderItem[], discount: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  return subtotal * (1 - discount / 100)
}

function validateOrder(items: OrderItem[]): string[] {
  const errors: string[] = []
  if (items.length === 0) errors.push("Order must have items")
  if (items.some(i => i.qty <= 0)) errors.push("Quantity must be positive")
  return errors
}

// Impure shell — handles I/O, calls pure functions:
async function placeOrder(items: OrderItem[], discount: number) {
  const errors = validateOrder(items)         // pure
  if (errors.length > 0) return { ok: false, errors }

  const total = calculateOrderTotal(items, discount) // pure

  await database.save({ items, total })       // impure (I/O)
  await emailService.sendConfirmation(total)  // impure (I/O)

  return { ok: true, total }
}
```

The **Functional Core, Imperative Shell** architecture:
- Core: pure functions, easy to test, easy to reason about
- Shell: thin layer that handles I/O, calls the pure core

## W — Why It Matters

- Pure functions are **trivially testable** — no mocks, no setup, just input → output.
- They're **safely parallelizable** — no shared mutable state.
- React components are designed around purity — pure render functions from props.
- Redux reducers must be pure — `(state, action) => newState`.
- The Functional Core / Imperative Shell pattern is how senior engineers structure applications.
- Understanding purity is the foundation for all functional patterns on Day 12.

## I — Interview Questions with Answers

### Q1: What is a pure function?

**A:** A function that (1) always returns the same output for the same input (deterministic), and (2) has no side effects (doesn't modify external state, perform I/O, or depend on mutable external variables). Example: `(a, b) => a + b` is pure; `Math.random()` is not.

### Q2: What is referential transparency?

**A:** A property where an expression can be replaced with its value without changing program behavior. `add(2, 3)` is referentially transparent because you can replace it with `5` everywhere. Functions with side effects or non-deterministic output are not referentially transparent.

### Q3: Can a real application be entirely pure?

**A:** No — real apps need I/O (databases, APIs, user input). The goal is to maximize the pure core and minimize the impure shell. Push I/O to the boundaries and keep business logic pure.

### Q4: What is the Functional Core / Imperative Shell pattern?

**A:** Separate your code into a pure "core" (business logic, validation, transformations) and an impure "shell" (I/O, database access, external APIs). The shell calls the core. The core is trivially testable; the shell is thin and integration-tested.

## C — Common Pitfalls with Fix

### Pitfall: Accidental mutation in "pure" functions

```ts
function sortUsers(users: User[]): User[] {
  return users.sort((a, b) => a.name.localeCompare(b.name))
  // ❌ .sort() mutates the original array!
}
```

**Fix:** `return [...users].sort(...)` or `users.toSorted(...)` (ES2023).

### Pitfall: Hidden dependency on Date/time

```ts
function isExpired(expiryDate: Date): boolean {
  return expiryDate < new Date() // ❌ depends on current time
}
```

**Fix:** Pass `now` as a parameter:

```ts
function isExpired(expiryDate: Date, now: Date): boolean {
  return expiryDate < now
}
```

### Pitfall: Logging inside pure functions

```ts
function calculate(x: number): number {
  console.log(`calculating for ${x}`) // side effect!
  return x * 2
}
```

**Fix:** Move logging to the impure shell. The pure function only computes.

## K — Coding Challenge with Solution

### Challenge

Refactor this impure function into a pure core + impure shell:

```ts
let discountCode = "SAVE20"

async function processCart(cart: CartItem[]) {
  console.log("Processing cart...")
  
  let total = 0
  for (const item of cart) {
    total += item.price * item.quantity
  }
  
  if (discountCode === "SAVE20") {
    total *= 0.8
  }
  
  await fetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({ total, items: cart }),
  })
  
  console.log(`Order placed: $${total}`)
  return total
}
```

### Solution

```ts
// Pure core:
interface CartItem {
  price: number
  quantity: number
}

function calculateSubtotal(cart: readonly CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function applyDiscount(subtotal: number, code: string | null): number {
  if (code === "SAVE20") return subtotal * 0.8
  return subtotal
}

function calculateTotal(cart: readonly CartItem[], discountCode: string | null): number {
  const subtotal = calculateSubtotal(cart)
  return applyDiscount(subtotal, discountCode)
}

// Impure shell:
async function processCart(cart: CartItem[], discountCode: string | null) {
  const total = calculateTotal(cart, discountCode) // pure

  await fetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({ total, items: cart }),
  })

  return total
}

// Pure core is fully testable:
// calculateSubtotal([{ price: 10, quantity: 2 }]) === 20
// applyDiscount(100, "SAVE20") === 80
// applyDiscount(100, null) === 100
```

---
