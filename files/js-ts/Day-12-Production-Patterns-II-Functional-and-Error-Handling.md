
# 📘 Day 12 — Production Patterns II: Functional & Error Handling

> Phase 3 · Production Patterns & Mastery (Day 2 of 3)
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Pure Functions & Referential Transparency](#1--pure-functions--referential-transparency)
2. [Immutability Patterns](#2--immutability-patterns)
3. [Function Composition & `pipe`](#3--function-composition--pipe)
4. [Currying & Partial Application](#4--currying--partial-application)
5. [The `Result` Type — Never Throw Philosophy](#5--the-result-type--never-throw-philosophy)
6. [The `Option` Type — Eliminating `null`](#6--the-option-type--eliminating-null)
7. [`ResultAsync` & Promise Integration](#7--resultasync--promise-integration)
8. [`neverthrow` Library](#8--neverthrow-library-reference)
9. [Custom Error Classes & Error Hierarchies](#9--custom-error-classes--error-hierarchies)
10. [Defensive Programming](#10--defensive-programming)
11. [Zod — Runtime Validation & TS Bridge](#11--zod--runtime-validation--ts-bridge)
12. [`using` & Explicit Resource Management](#12--using--explicit-resource-management)

---

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

# 2 — Immutability Patterns

## T — TL;DR

Immutability means **never modifying existing data** — instead, create new copies with changes applied; this prevents shared-state bugs and is required by React, Redux, and functional TypeScript.

## K — Key Concepts

### Object Immutability

```ts
// ❌ Mutation
const user = { name: "Mark", age: 30 }
user.age = 31 // mutates original

// ✅ Immutable update — new object
const updated = { ...user, age: 31 }
// user.age is still 30, updated.age is 31
```

### Array Immutability

```ts
const items = [1, 2, 3]

// ❌ Mutating methods:
items.push(4)     // mutates
items.sort()      // mutates
items.splice(0,1) // mutates
items.reverse()   // mutates

// ✅ Non-mutating alternatives:
const added = [...items, 4]
const sorted = [...items].sort()    // or items.toSorted()
const removed = items.filter((_, i) => i !== 0)
const reversed = [...items].reverse() // or items.toReversed()

// ES2023+ immutable methods:
items.toSorted()     // returns new sorted array
items.toReversed()   // returns new reversed array
items.toSpliced(0,1) // returns new array with splice applied
items.with(1, 99)    // returns new array with index 1 set to 99
```

### Nested Immutable Updates

```ts
type State = {
  user: {
    name: string
    address: {
      city: string
      zip: string
    }
  }
  items: string[]
}

// ❌ Deep mutation
state.user.address.city = "NYC"

// ✅ Immutable nested update
const newState: State = {
  ...state,
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      city: "NYC",
    },
  },
}
```

This is verbose — which is why libraries like Immer exist (Group 2).

### `Object.freeze` — Shallow Immutability

```ts
const config = Object.freeze({
  host: "localhost",
  port: 3000,
  nested: { mutable: true },
})

config.host = "remote"         // ❌ silently fails (or throws in strict mode)
config.nested.mutable = false  // ✅ works! freeze is SHALLOW
```

### Deep Freeze

```ts
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj)
  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  }
  return obj
}
```

### `readonly` in TypeScript

```ts
// Readonly properties:
interface User {
  readonly id: string
  readonly name: string
  age: number // mutable
}

// Readonly arrays:
function process(items: readonly string[]) {
  items.push("x") // ❌ Property 'push' does not exist on type 'readonly string[]'
  const newItems = [...items, "x"] // ✅
}

// Readonly tuples:
const point: readonly [number, number] = [1, 2]
point[0] = 3 // ❌

// Deep readonly (from Day 10):
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepReadonly<T[K]>
    : T[K]
}
```

### `as const` for Immutable Literals

```ts
const config = {
  theme: "dark",
  features: ["auth", "dashboard"],
} as const

// Type: { readonly theme: "dark"; readonly features: readonly ["auth", "dashboard"] }

config.theme = "light"          // ❌ readonly
config.features.push("billing") // ❌ readonly
```

### Immutable Update Helpers

```ts
// Helper for updating a specific array item:
function updateAt<T>(arr: readonly T[], index: number, value: T): T[] {
  return arr.map((item, i) => (i === index ? value : item))
}

// Helper for removing an array item:
function removeAt<T>(arr: readonly T[], index: number): T[] {
  return arr.filter((_, i) => i !== index)
}

// Helper for updating a nested object property:
function updatePath<T extends Record<string, unknown>>(
  obj: T,
  key: keyof T,
  value: T[keyof T],
): T {
  return { ...obj, [key]: value }
}
```

## W — Why It Matters

- React re-renders depend on **reference equality** — mutation doesn't trigger re-renders.
- Redux **requires** immutable state updates — reducers must return new state.
- Immutability prevents **shared-state bugs** — the #1 source of hard-to-find errors.
- `as const` and `readonly` catch mutation at compile time — free bug prevention.
- ES2023's `toSorted`/`toReversed`/`with` are the modern standard.
- Understanding immutability is prerequisite for React (Group 2).

## I — Interview Questions with Answers

### Q1: Why is immutability important in React?

**A:** React uses **reference equality** (`===`) to detect state changes. If you mutate an object, its reference stays the same, so React doesn't re-render. Immutable updates create new references, triggering re-renders correctly.

### Q2: How does `Object.freeze` differ from `readonly`?

**A:** `Object.freeze` is a **runtime** operation — it prevents property changes at runtime (but is shallow). `readonly` is **compile-time** only — TypeScript prevents mutations in code, but the property is fully mutable at runtime. Use both for maximum safety.

### Q3: What are the ES2023 immutable array methods?

**A:** `toSorted()` (immutable sort), `toReversed()` (immutable reverse), `toSpliced()` (immutable splice), and `with(index, value)` (immutable index update). They return new arrays, leaving the original unchanged.

## C — Common Pitfalls with Fix

### Pitfall: Spread is shallow

```ts
const state = { user: { name: "Mark", scores: [1, 2] } }
const copy = { ...state }
copy.user.scores.push(3) // ❌ mutates original! spread is shallow
```

**Fix:** Use `structuredClone(state)` for deep copy, or spread at every level.

### Pitfall: `readonly` doesn't affect runtime

```ts
const arr: readonly number[] = [1, 2, 3]
;(arr as number[]).push(4) // ✅ compiles with cast — mutates at runtime!
```

**Fix:** Combine `readonly` with `Object.freeze` for compile-time + runtime protection.

### Pitfall: `toSorted` not available in older environments

**Fix:** Check your target environment or use `[...arr].sort()` as a fallback.

## K — Coding Challenge with Solution

### Challenge

Implement an immutable `update` function for nested state:

```ts
const state = {
  users: [
    { id: "1", name: "Mark", settings: { theme: "dark" } },
    { id: "2", name: "Alex", settings: { theme: "light" } },
  ],
}

// Update user "1"'s theme to "light" — immutably:
const newState = updateUserTheme(state, "1", "light")
```

### Solution

```ts
type AppState = {
  users: {
    id: string
    name: string
    settings: { theme: string }
  }[]
}

function updateUserTheme(
  state: AppState,
  userId: string,
  theme: string,
): AppState {
  return {
    ...state,
    users: state.users.map(user =>
      user.id === userId
        ? {
            ...user,
            settings: { ...user.settings, theme },
          }
        : user
    ),
  }
}

// Verify immutability:
const original = {
  users: [
    { id: "1", name: "Mark", settings: { theme: "dark" } },
    { id: "2", name: "Alex", settings: { theme: "light" } },
  ],
}

const updated = updateUserTheme(original, "1", "light")
console.log(original.users[0].settings.theme) // "dark" — unchanged
console.log(updated.users[0].settings.theme)  // "light" — new object
console.log(original.users[1] === updated.users[1]) // true — unchanged items share reference
```

---

# 3 — Function Composition & `pipe`

## T — TL;DR

Function composition combines **small, focused functions** into pipelines where the output of one becomes the input of the next — creating readable, maintainable data transformations without intermediate variables.

## K — Key Concepts

### Basic Composition

```ts
// Two small functions:
const double = (x: number) => x * 2
const addOne = (x: number) => x + 1

// Manual composition:
const doubleThenAdd = (x: number) => addOne(double(x))
doubleThenAdd(5) // 11

// Reads inside-out — hard to follow at scale:
const result = toString(addOne(double(parse(trim(input)))))
```

### `compose` — Right to Left

```ts
function compose<A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B,
): (a: A) => C {
  return (a: A) => f(g(a))
}

const doubleThenAdd = compose(addOne, double)
doubleThenAdd(5) // 11
```

### `pipe` — Left to Right (More Readable)

```ts
function pipe<A, B>(a: A, ab: (a: A) => B): B
function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D
function pipe(initial: unknown, ...fns: Function[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), initial)
}

const result = pipe(
  5,
  double,     // 10
  addOne,     // 11
  String,     // "11"
)
```

### Practical `pipe` Utility

```ts
// Simpler untyped version — sufficient for most cases:
function pipe<T>(value: T, ...fns: ((arg: any) => any)[]): any {
  return fns.reduce((acc, fn) => fn(acc), value)
}

// Usage with data transformation:
const result = pipe(
  rawUsers,
  users => users.filter(u => u.active),
  users => users.map(u => ({ name: u.name, email: u.email })),
  users => users.sort((a, b) => a.name.localeCompare(b.name)),
  users => users.slice(0, 10),
)
```

### Creating Reusable Pipeline Steps

```ts
const filterActive = <T extends { active: boolean }>(items: T[]): T[] =>
  items.filter(i => i.active)

const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name))

const take = (n: number) => <T>(items: T[]): T[] =>
  items.slice(0, n)

const pluck = <T, K extends keyof T>(key: K) => (items: T[]): T[K][] =>
  items.map(item => item[key])

// Compose reusable pipeline:
const getTopActiveNames = (users: User[]) =>
  pipe(
    users,
    filterActive,
    sortByName,
    take(5),
    pluck("name"),
  )
```

### Real-World: Data Processing Pipeline

```ts
interface RawTransaction {
  id: string
  amount: string
  date: string
  category: string
  status: string
}

interface ProcessedTransaction {
  id: string
  amount: number
  date: Date
  category: string
}

const parseAmount = (txs: RawTransaction[]) =>
  txs.map(tx => ({ ...tx, amount: parseFloat(tx.amount) }))

const parseDate = (txs: { date: string }[]) =>
  txs.map(tx => ({ ...tx, date: new Date(tx.date) }))

const filterCompleted = (txs: { status: string }[]) =>
  txs.filter(tx => tx.status === "completed")

const removeStatus = (txs: any[]): ProcessedTransaction[] =>
  txs.map(({ status, ...rest }) => rest)

function processTransactions(raw: RawTransaction[]): ProcessedTransaction[] {
  return pipe(
    raw,
    filterCompleted,
    parseAmount,
    parseDate,
    removeStatus,
  )
}
```

### TC39 Pipeline Operator (Stage 2 Proposal)

```ts
// Future syntax (not yet available):
const result = rawUsers
  |> filterActive(%)
  |> sortByName(%)
  |> take(5)(%)
  |> pluck("name")(%)

// For now, use pipe() or method chaining
```

## W — Why It Matters

- Composition creates **readable, maintainable** data transformation pipelines.
- Each step is a **small, testable, reusable** function.
- This is the foundation of RxJS, functional React patterns, and data processing.
- `pipe` eliminates nested function calls and intermediate variables.
- The TC39 pipeline operator will make this a language feature.

## I — Interview Questions with Answers

### Q1: What is function composition?

**A:** Combining two or more functions so the output of one becomes the input of the next: `compose(f, g)(x) = f(g(x))`. `pipe` is the left-to-right version: `pipe(x, g, f) = f(g(x))`.

### Q2: What is the difference between `compose` and `pipe`?

**A:** `compose` applies right-to-left (mathematical order): `compose(f, g)(x) = f(g(x))`. `pipe` applies left-to-right (reading order): `pipe(x, g, f) = f(g(x))`. `pipe` is more readable for data transformation chains.

### Q3: Why prefer composition over method chaining?

**A:** Composition works with **any function** — not just methods on the same object. It enables reuse across different data types. Method chaining is tied to a specific class/prototype.

## C — Common Pitfalls with Fix

### Pitfall: Type safety loss in generic `pipe`

```ts
const result = pipe(5, String, x => x * 2)
// TypeScript might not catch: String returns string, then * 2 on string
```

**Fix:** Use overloaded `pipe` signatures or check types at each step.

### Pitfall: Side effects in pipeline steps

```ts
pipe(data, step1, logToConsole, step2) // logging = side effect in pipeline
```

**Fix:** Keep pipeline steps pure. Add a `tap` helper for debugging:

```ts
const tap = <T>(fn: (x: T) => void) => (x: T): T => { fn(x); return x }

pipe(data, step1, tap(console.log), step2)
```

## K — Coding Challenge with Solution

### Challenge

Create a `pipe` function and use it to process this data:

```ts
const rawScores = ["85", "92", "78", "95", "60", "88", "45"]

// Pipeline: parse to numbers → filter >= 70 → sort descending → take top 3 → format as "Score: X"
```

### Solution

```ts
function pipe<T>(value: T, ...fns: ((arg: any) => any)[]): any {
  return fns.reduce((acc, fn) => fn(acc), value)
}

const toNumbers = (strs: string[]) => strs.map(Number)
const filterPassing = (scores: number[]) => scores.filter(s => s >= 70)
const sortDesc = (scores: number[]) => [...scores].sort((a, b) => b - a)
const takeTop = (n: number) => (items: unknown[]) => items.slice(0, n)
const formatScores = (scores: number[]) => scores.map(s => `Score: ${s}`)

const result = pipe(
  rawScores,
  toNumbers,       // [85, 92, 78, 95, 60, 88, 45]
  filterPassing,   // [85, 92, 78, 95, 88]
  sortDesc,        // [95, 92, 88, 85, 78]
  takeTop(3),      // [95, 92, 88]
  formatScores,    // ["Score: 95", "Score: 92", "Score: 88"]
)
```

---

# 4 — Currying & Partial Application

## T — TL;DR

Currying transforms a function with multiple arguments into a **chain of single-argument functions**; partial application fixes some arguments upfront — both create specialized, reusable functions from general ones.

## K — Key Concepts

### Currying

```ts
// Normal function:
function add(a: number, b: number): number {
  return a + b
}
add(1, 2) // 3

// Curried version:
function addCurried(a: number) {
  return (b: number) => a + b
}
addCurried(1)(2) // 3

// Create specialized functions:
const increment = addCurried(1)
const addTen = addCurried(10)

increment(5) // 6
addTen(5)    // 15
```

### Arrow Function Currying

```ts
// Concise syntax:
const multiply = (a: number) => (b: number) => a * b
const double = multiply(2)
const triple = multiply(3)

double(5) // 10
triple(5) // 15

// Three arguments:
const add3 = (a: number) => (b: number) => (c: number) => a + b + c
add3(1)(2)(3) // 6
```

### Generic Curry Helper

```ts
// Auto-curry any two-argument function:
function curry<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R {
  return (a: A) => (b: B) => fn(a, b)
}

const curriedAdd = curry((a: number, b: number) => a + b)
curriedAdd(1)(2) // 3

const curriedConcat = curry((a: string, b: string) => a + b)
const greet = curriedConcat("Hello, ")
greet("Mark") // "Hello, Mark"
```

### Partial Application

Different from currying — fix **some** arguments, return a function for the rest:

```ts
// Manual partial application:
function fetchFromApi(baseUrl: string, endpoint: string, id: string) {
  return fetch(`${baseUrl}${endpoint}/${id}`)
}

// Partially apply the baseUrl:
const fetchFromProd = (endpoint: string, id: string) =>
  fetchFromApi("https://api.example.com", endpoint, id)

const fetchFromDev = (endpoint: string, id: string) =>
  fetchFromApi("http://localhost:3000", endpoint, id)

fetchFromProd("/users", "123")
fetchFromDev("/users", "123")
```

### Generic `partial` Helper

```ts
function partial<A, B extends unknown[], R>(
  fn: (a: A, ...rest: B) => R,
  a: A,
): (...rest: B) => R {
  return (...rest: B) => fn(a, ...rest)
}

const fetchProd = partial(fetchFromApi, "https://api.example.com")
fetchProd("/users", "123")
```

### Currying for Pipeline Compatibility

```ts
// Problem: map/filter need single-argument functions
const users = [
  { name: "Mark", age: 30 },
  { name: "Alex", age: 17 },
  { name: "Jane", age: 25 },
]

// Curried predicates:
const olderThan = (minAge: number) => (user: { age: number }) =>
  user.age >= minAge

const pluck = <K extends string>(key: K) =>
  <T extends Record<K, unknown>>(item: T) => item[key]

// Clean pipeline:
const adultNames = users
  .filter(olderThan(18))
  .map(pluck("name"))
// ["Mark", "Jane"]
```

### Real-World: Configurable Validators

```ts
const minLength = (min: number) => (value: string): boolean =>
  value.length >= min

const maxLength = (max: number) => (value: string): boolean =>
  value.length <= max

const matches = (pattern: RegExp) => (value: string): boolean =>
  pattern.test(value)

const allOf = <T>(...validators: ((value: T) => boolean)[]) =>
  (value: T): boolean => validators.every(v => v(value))

// Compose validators:
const isValidPassword = allOf(
  minLength(8),
  maxLength(64),
  matches(/[A-Z]/),    // has uppercase
  matches(/[0-9]/),    // has digit
  matches(/[!@#$%^&*]/), // has special char
)

isValidPassword("Abc123!x") // true
isValidPassword("weak")     // false
```

## W — Why It Matters

- Currying creates **reusable, composable** functions from general-purpose ones.
- Curried functions fit perfectly into `pipe`, `map`, `filter`, and `reduce`.
- React's higher-order components (HOCs) and event handlers use partial application.
- Configurable validators, formatters, and API clients all use currying.
- Understanding currying is required for functional programming interviews.

## I — Interview Questions with Answers

### Q1: What is currying?

**A:** Transforming a function of N arguments into N nested single-argument functions: `f(a, b, c)` becomes `f(a)(b)(c)`. Each call returns a new function until all arguments are supplied.

### Q2: What is the difference between currying and partial application?

**A:** Currying always produces single-argument functions chained together. Partial application fixes some arguments and returns a function for the remaining ones — it doesn't necessarily produce single-argument functions. `addCurried(1)(2)` vs `partial(add, 1)(2)`.

### Q3: Why is currying useful?

**A:** Creates specialized functions from general ones (`const double = multiply(2)`), makes functions compatible with `map`/`filter`/`pipe`, enables point-free style, and allows configurable behavior through closures.

## C — Common Pitfalls with Fix

### Pitfall: Over-currying simple functions

```ts
const add = (a: number) => (b: number) => a + b
add(1)(2) // works, but add(1, 2) doesn't — confusing for team
```

**Fix:** Only curry when you need partial application. For simple functions, keep normal parameter syntax.

### Pitfall: Curried function losing `this` context

```ts
class Service {
  prefix = "Hello"
  greet = (name: string) => (suffix: string) => `${this.prefix}, ${name}${suffix}`
}
// ✅ Works because arrow functions capture `this`
```

**Fix:** Use arrow functions for curried methods that need `this`.

### Pitfall: TypeScript inference struggling with deep currying

```ts
const fn = (a: number) => (b: string) => (c: boolean) => ({ a, b, c })
// TypeScript infers correctly for 2-3 levels
// Beyond that, consider a regular function with an options object
```

**Fix:** Don't curry beyond 2-3 levels. Use options objects for complex configuration.

## K — Coding Challenge with Solution

### Challenge

Create curried `filter`, `map`, and `take` functions and compose them:

```ts
const activeEmails = pipe(
  users,
  filter(u => u.active),
  map(u => u.email),
  take(3),
)
```

### Solution

```ts
const filter = <T>(predicate: (item: T) => boolean) =>
  (items: T[]): T[] => items.filter(predicate)

const map = <T, U>(transform: (item: T) => U) =>
  (items: T[]): U[] => items.map(transform)

const take = (n: number) =>
  <T>(items: T[]): T[] => items.slice(0, n)

// Usage:
interface User {
  name: string
  email: string
  active: boolean
}

const users: User[] = [
  { name: "Mark", email: "mark@test.com", active: true },
  { name: "Alex", email: "alex@test.com", active: false },
  { name: "Jane", email: "jane@test.com", active: true },
  { name: "Sam", email: "sam@test.com", active: true },
]

const activeEmails = pipe(
  users,
  filter<User>(u => u.active),
  map<User, string>(u => u.email),
  take(2),
)
// ["mark@test.com", "jane@test.com"]
```

---

# 5 — The `Result` Type — Never Throw Philosophy

## T — TL;DR

The `Result` type encodes **success or failure in the return type** instead of throwing exceptions — making error handling explicit, type-safe, and impossible to forget.

## K — Key Concepts

### The Problem with `throw`

```ts
function parseJSON(text: string): unknown {
  return JSON.parse(text) // might throw SyntaxError!
}

function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero") // caller must remember to try/catch
  return a / b
}

// The function signature LIES — it says it returns `number`,
// but it might throw. Nothing in the type system warns you.
```

### The `Result` Type

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// Constructors:
function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}
```

### Using `Result` Instead of Throwing

```ts
function parseJSON(text: string): Result<unknown, string> {
  try {
    return Ok(JSON.parse(text))
  } catch (e) {
    return Err(`Invalid JSON: ${(e as Error).message}`)
  }
}

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err("Division by zero")
  return Ok(a / b)
}

// Caller is FORCED to handle both cases:
const result = divide(10, 0)

if (result.ok) {
  console.log(result.value) // TypeScript knows it's number
} else {
  console.error(result.error) // TypeScript knows it's string
}
```

### Result with Methods (Rich API)

```ts
class Result<T, E> {
  private constructor(
    private readonly _ok: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(true, value)
  }

  static err<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error)
  }

  isOk(): this is Result<T, never> & { _value: T } {
    return this._ok
  }

  isErr(): this is Result<never, E> & { _error: E } {
    return !this._ok
  }

  // Transform the success value:
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._ok) return Result.ok(fn(this._value!))
    return Result.err(this._error!)
  }

  // Transform the error:
  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    if (!this._ok) return Result.err(fn(this._error!))
    return Result.ok(this._value!)
  }

  // Chain Results (flatMap):
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._ok) return fn(this._value!)
    return Result.err(this._error!)
  }

  // Unwrap with fallback:
  unwrapOr(fallback: T): T {
    return this._ok ? this._value! : fallback
  }

  // Unwrap or throw (escape hatch):
  unwrap(): T {
    if (this._ok) return this._value!
    throw this._error
  }

  // Match pattern:
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this._ok ? handlers.ok(this._value!) : handlers.err(this._error!)
  }
}
```

### Chaining Results

```ts
function getUser(id: string): Result<User, string> { /* ... */ }
function getUserPosts(user: User): Result<Post[], string> { /* ... */ }
function getFirstPost(posts: Post[]): Result<Post, string> {
  if (posts.length === 0) return Result.err("No posts")
  return Result.ok(posts[0])
}

// Chain with andThen:
const firstPost = getUser("123")
  .andThen(user => getUserPosts(user))
  .andThen(posts => getFirstPost(posts))
  .map(post => post.title)

// Without Result, this would be:
// try {
//   const user = getUser("123")         // might throw
//   const posts = getUserPosts(user)    // might throw
//   const first = getFirstPost(posts)   // might throw
//   return first.title
// } catch (e) {
//   // What went wrong? Which step failed? What type is e?
// }
```

### The "Never Throw" Philosophy

```
Traditional (throw):
  function → returns T (lies about errors)
  Errors are invisible in types
  Caller might forget try/catch

Result-based (return):
  function → returns Result<T, E> (honest about errors)
  Errors are visible in types
  Caller MUST handle both cases
```

Rules:
1. Business logic functions return `Result<T, E>` — never `throw`.
2. Only throw for **programmer errors** (bugs) — assertion failures, impossible states.
3. Expected failures (validation, not found, network errors) → `Result.err(...)`.
4. Boundaries (API handlers, CLI entry points) → unwrap Results and convert to HTTP responses or exit codes.

### Simple Result (No Class Needed)

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

// Use discriminated union narrowing:
function handleResult<T, E>(result: Result<T, E>) {
  if (result.ok) {
    // result.value is T
  } else {
    // result.error is E
  }
}
```

For most projects, the simple discriminated union is sufficient. The class-based version is for when you need `map`/`andThen`/`match`.

## W — Why It Matters

- `throw` is **invisible** in TypeScript's type system — Result makes errors **visible and typed**.
- Forces callers to handle errors — **impossible to forget** error handling.
- `andThen` chaining is **cleaner** than nested try/catch for multi-step operations.
- Rust, Go, Haskell, Swift, and Kotlin all use Result/Either patterns.
- tRPC, Effect-TS, and neverthrow bring this to the TypeScript ecosystem.
- This is the most important pattern for production-grade error handling.

## I — Interview Questions with Answers

### Q1: What is the Result type?

**A:** A discriminated union `{ ok: true; value: T } | { ok: false; error: E }` that encodes success or failure in the return type instead of using exceptions. It makes error handling explicit, type-safe, and composable.

### Q2: Why prefer Result over throwing exceptions?

**A:** (1) Errors are visible in the type signature. (2) Callers must handle both cases — can't forget. (3) Chainable with `map`/`andThen`. (4) No runtime cost of stack unwinding. (5) Types tell you exactly what can go wrong.

### Q3: When should you still throw?

**A:** For **programmer errors** (bugs): assertion failures, impossible states, invariant violations. These indicate code defects, not expected runtime conditions. Expected failures (validation, network, not found) should use Result.

### Q4: How does Result relate to Rust and Go?

**A:** Rust has `Result<T, E>` with `match`, `map`, `and_then`, and the `?` operator. Go returns `(value, error)` tuples. TypeScript's Result type is inspired by Rust's. All three make errors explicit in return types.

## C — Common Pitfalls with Fix

### Pitfall: Wrapping every function in Result unnecessarily

```ts
function add(a: number, b: number): Result<number, never> {
  return Ok(a + b) // ❌ This can never fail — Result adds noise
}
```

**Fix:** Only use Result for functions that can **actually fail**. Pure computations that always succeed should return directly.

### Pitfall: Using `unwrap()` everywhere

```ts
const user = getUser("123").unwrap() // ❌ throws if error — defeats the purpose!
```

**Fix:** Use `match`, `unwrapOr`, or `andThen`. Reserve `unwrap()` for tests or when you've already checked `isOk()`.

### Pitfall: Not typing the error

```ts
function fetchUser(): Result<User, unknown> { ... }
// ❌ unknown error — caller can't handle it meaningfully
```

**Fix:** Use specific error types: `Result<User, "not_found" | "network_error">` or custom error classes.

## K — Coding Challenge with Solution

### Challenge

Implement a user registration flow using Result — no throwing:

```ts
// Steps:
// 1. Validate email format
// 2. Check if email already exists
// 3. Hash password
// 4. Create user

// Each step can fail with a specific error
```

### Solution

```ts
type RegistrationError =
  | { type: "invalid_email"; message: string }
  | { type: "email_taken"; email: string }
  | { type: "weak_password"; message: string }

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

function validateEmail(email: string): Result<string, RegistrationError> {
  if (!email.includes("@")) {
    return err({ type: "invalid_email", message: "Missing @" })
  }
  return ok(email)
}

function checkEmailAvailable(email: string): Result<string, RegistrationError> {
  const taken = ["mark@test.com", "admin@test.com"]
  if (taken.includes(email)) {
    return err({ type: "email_taken", email })
  }
  return ok(email)
}

function validatePassword(password: string): Result<string, RegistrationError> {
  if (password.length < 8) {
    return err({ type: "weak_password", message: "Must be 8+ characters" })
  }
  return ok(password)
}

function register(
  email: string,
  password: string,
): Result<{ id: string; email: string }, RegistrationError> {
  const emailResult = validateEmail(email)
  if (!emailResult.ok) return emailResult

  const availableResult = checkEmailAvailable(emailResult.value)
  if (!availableResult.ok) return availableResult

  const passwordResult = validatePassword(password)
  if (!passwordResult.ok) return passwordResult

  return ok({
    id: crypto.randomUUID(),
    email: availableResult.value,
  })
}

// Usage:
const result = register("jane@test.com", "securePass123")

if (result.ok) {
  console.log(`User created: ${result.value.id}`)
} else {
  switch (result.error.type) {
    case "invalid_email":
      console.error(`Invalid email: ${result.error.message}`)
      break
    case "email_taken":
      console.error(`Email taken: ${result.error.email}`)
      break
    case "weak_password":
      console.error(`Weak password: ${result.error.message}`)
      break
  }
}
```

Every error is typed. Every step is explicit. Nothing can be forgotten.

---

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

# 7 — `ResultAsync` & Promise Integration

## T — TL;DR

`ResultAsync` wraps a `Promise<Result<T, E>>` with the same `map`/`andThen` API as `Result` — letting you chain async operations that might fail without nested try/catch or `.then/.catch`.

## K — Key Concepts

### The Problem: Async + Result

```ts
// Result works great for sync code, but async is awkward:
async function fetchUser(id: string): Promise<Result<User, string>> {
  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) return err(`HTTP ${res.status}`)
    const data = await res.json()
    return ok(data as User)
  } catch (e) {
    return err(`Network error: ${(e as Error).message}`)
  }
}

// Chaining is verbose:
const userResult = await fetchUser("123")
if (!userResult.ok) return userResult

const postsResult = await fetchPosts(userResult.value.id)
if (!postsResult.ok) return postsResult

// Every step needs unwrapping...
```

### `ResultAsync` Wrapper

```ts
class ResultAsync<T, E> {
  constructor(private readonly promise: Promise<Result<T, E>>) {}

  static fromPromise<T, E>(
    promise: Promise<T>,
    errorFn: (e: unknown) => E,
  ): ResultAsync<T, E> {
    return new ResultAsync(
      promise
        .then(value => ok(value) as Result<T, E>)
        .catch(e => err(errorFn(e)) as Result<T, E>),
    )
  }

  static ok<T>(value: T): ResultAsync<T, never> {
    return new ResultAsync(Promise.resolve(ok(value)))
  }

  static err<E>(error: E): ResultAsync<never, E> {
    return new ResultAsync(Promise.resolve(err(error)))
  }

  map<U>(fn: (value: T) => U): ResultAsync<U, E> {
    return new ResultAsync(
      this.promise.then(result =>
        result.ok ? ok(fn(result.value)) : err(result.error),
      ),
    )
  }

  mapErr<F>(fn: (error: E) => F): ResultAsync<T, F> {
    return new ResultAsync(
      this.promise.then(result =>
        result.ok ? ok(result.value) : err(fn(result.error)),
      ),
    )
  }

  andThen<U>(fn: (value: T) => ResultAsync<U, E>): ResultAsync<U, E> {
    return new ResultAsync(
      this.promise.then(result => {
        if (!result.ok) return err(result.error) as Result<U, E>
        return fn(result.value).promise
      }),
    )
  }

  async match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): Promise<U> {
    const result = await this.promise
    return result.ok ? handlers.ok(result.value) : handlers.err(result.error)
  }

  async unwrap(): Promise<T> {
    const result = await this.promise
    if (!result.ok) throw result.error
    return result.value
  }
}
```

### Clean Async Chains

```ts
function fetchUser(id: string): ResultAsync<User, ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${id}`).then(r => {
      if (!r.ok) throw new ApiError(r.status, "User fetch failed")
      return r.json()
    }),
    (e) => e instanceof ApiError ? e : new ApiError(500, String(e)),
  )
}

function fetchPosts(userId: string): ResultAsync<Post[], ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${userId}/posts`).then(r => r.json()),
    (e) => new ApiError(500, String(e)),
  )
}

// Beautiful chain — no try/catch, no manual unwrapping:
const result = await fetchUser("123")
  .andThen(user => fetchPosts(user.id))
  .map(posts => posts.filter(p => p.published))
  .map(posts => posts.map(p => p.title))
  .match({
    ok: titles => ({ status: 200, data: titles }),
    err: error => ({ status: error.code, message: error.message }),
  })
```

### Converting Between Result and ResultAsync

```ts
// Sync Result → ResultAsync:
const syncResult: Result<number, string> = ok(42)
const asyncResult = ResultAsync.ok(42)

// ResultAsync → Result:
const result = await asyncResult.promise

// Wrapping a Promise:
const fromFetch = ResultAsync.fromPromise(
  fetch("/api/data").then(r => r.json()),
  (e) => `Fetch failed: ${e}`,
)
```

## W — Why It Matters

- Real applications are **async** — Result alone isn't enough.
- `ResultAsync` gives you **the same chainable API** for async operations.
- Eliminates nested `try/catch` in multi-step async workflows.
- This is the pattern used by `neverthrow`, Effect-TS, and tRPC error handling.
- API routes, database operations, and external service calls all benefit from `ResultAsync`.

## I — Interview Questions with Answers

### Q1: What is `ResultAsync`?

**A:** A wrapper around `Promise<Result<T, E>>` that provides `map`, `andThen`, `mapErr`, and `match` methods. It lets you chain async operations that might fail with the same API as synchronous `Result`.

### Q2: How does `ResultAsync.fromPromise` work?

**A:** Takes a Promise and an error mapping function. If the Promise resolves, wraps the value in `Ok`. If it rejects, maps the error through the function and wraps in `Err`. No try/catch needed in the calling code.

### Q3: When do you need `ResultAsync` vs just `async` + `Result`?

**A:** Use `ResultAsync` when you need to **chain** multiple async operations. For single async calls, `async` + `Result` return is fine. `ResultAsync` shines in multi-step pipelines like: fetch user → fetch posts → process → respond.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to `await` the final result

```ts
const result = fetchUser("123").map(u => u.name) // ResultAsync, not the value!
```

**Fix:** `const result = await fetchUser("123").map(u => u.name).match({...})`

### Pitfall: Mixing `throw` and `ResultAsync`

```ts
const result = fetchUser("123").map(user => {
  if (!user.active) throw new Error("Inactive") // ❌ throws inside map!
  return user
})
```

**Fix:** Return a Result from `andThen` instead of throwing:

```ts
.andThen(user =>
  user.active ? ResultAsync.ok(user) : ResultAsync.err(new ApiError(403, "Inactive"))
)
```

## K — Coding Challenge with Solution

### Challenge

Build an API endpoint handler using `ResultAsync`:

```ts
// GET /api/users/:id/recent-posts
// Steps: validate ID → fetch user → fetch posts → filter recent → format response
```

### Solution

```ts
class ApiError {
  constructor(public code: number, public message: string) {}
}

function validateId(id: string): ResultAsync<string, ApiError> {
  if (!id || id.length < 1) return ResultAsync.err(new ApiError(400, "Invalid ID"))
  return ResultAsync.ok(id)
}

function fetchUser(id: string): ResultAsync<User, ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${id}`).then(r => {
      if (!r.ok) throw new ApiError(r.status, "User not found")
      return r.json()
    }),
    (e) => e instanceof ApiError ? e : new ApiError(500, "Internal error"),
  )
}

function fetchUserPosts(userId: string): ResultAsync<Post[], ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${userId}/posts`).then(r => r.json()),
    () => new ApiError(500, "Failed to fetch posts"),
  )
}

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

async function handleGetRecentPosts(id: string) {
  return validateId(id)
    .andThen(fetchUser)
    .andThen(user => fetchUserPosts(user.id))
    .map(posts => posts.filter(p => new Date(p.createdAt) > oneWeekAgo))
    .map(posts => posts.map(p => ({ id: p.id, title: p.title })))
    .match({
      ok: posts => ({ status: 200, body: { posts } }),
      err: error => ({ status: error.code, body: { error: error.message } }),
    })
}
```

---

# 8 — `neverthrow` Library (Reference)

## T — TL;DR

`neverthrow` is a **production-ready** Result library for TypeScript that provides `Result`, `ResultAsync`, and chainable methods out of the box — use it instead of rolling your own in real projects.

## K — Key Concepts

### Installation

```bash
pnpm add neverthrow
```

### Basic Usage

```ts
import { ok, err, Result, ResultAsync } from "neverthrow"

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("Division by zero")
  return ok(a / b)
}

const result = divide(10, 2)
  .map(n => n * 100)
  .match(
    value => `Result: ${value}`,
    error => `Error: ${error}`,
  )
// "Result: 500"
```

### `Result` API

```ts
import { ok, err, Result } from "neverthrow"

// Creation:
const success: Result<number, string> = ok(42)
const failure: Result<number, string> = err("failed")

// Checking:
success.isOk()  // true
failure.isErr()  // true

// Transformation:
success.map(n => n * 2)                     // ok(84)
failure.map(n => n * 2)                     // err("failed") — skipped
success.mapErr(e => new Error(e))           // ok(42) — skipped
failure.mapErr(e => new Error(e))           // err(Error("failed"))

// Chaining:
success.andThen(n => n > 0 ? ok(n) : err("negative"))

// Unwrapping:
success.unwrapOr(0)        // 42
failure.unwrapOr(0)        // 0
success._unsafeUnwrap()    // 42 (throws if err)
failure._unsafeUnwrapErr() // "failed" (throws if ok)

// Match:
result.match(
  value => `Got: ${value}`,
  error => `Error: ${error}`,
)
```

### `ResultAsync` API

```ts
import { ResultAsync, okAsync, errAsync } from "neverthrow"

const fetchUser = ResultAsync.fromPromise(
  fetch("/api/user").then(r => r.json()),
  () => "Fetch failed",
)

// Chain:
const name = await fetchUser
  .map(user => user.name)
  .mapErr(e => `Error: ${e}`)
  .match(
    name => name,
    error => "Unknown",
  )
```

### `combine` — Collect Multiple Results

```ts
import { Result, ok, err } from "neverthrow"

const results: Result<number, string>[] = [
  ok(1),
  ok(2),
  ok(3),
]

const combined = Result.combine(results)
// ok([1, 2, 3])

const withError: Result<number, string>[] = [
  ok(1),
  err("oops"),
  ok(3),
]

const combinedErr = Result.combine(withError)
// err("oops") — fails on first error
```

### `safeTry` — Use Results with Generators

```ts
import { safeTry, ok, err } from "neverthrow"

const result = safeTry(function* () {
  const user = yield* fetchUser("123").safeUnwrap()
  const posts = yield* fetchPosts(user.id).safeUnwrap()
  return ok({ user, posts })
})
```

`safeTry` lets you write Result-based code that **reads like async/await** — each `yield*` short-circuits on error.

## W — Why It Matters

- Don't reinvent the wheel — `neverthrow` is battle-tested with 400K+ weekly downloads.
- Provides `combine` for collecting multiple Results (parallel validation).
- `safeTry` with generators makes Result code as readable as async/await.
- The library has excellent TypeScript support — full type inference.
- Used by production teams at scale.

## I — Interview Questions with Answers

### Q1: Why use `neverthrow` instead of a custom Result type?

**A:** Production-ready API, thorough TypeScript inference, `combine` for parallel results, `safeTry` for generator-based syntax, `ResultAsync` for Promises, and community-maintained edge case handling.

### Q2: What does `Result.combine` do?

**A:** Takes an array of Results and returns a single Result containing an array of values if all are `ok`, or the first error if any is `err`. Like `Promise.all` but for Results.

### Q3: When would you NOT use `neverthrow`?

**A:** For very simple projects, prototypes, or when the team is unfamiliar with FP patterns. The simple discriminated union `{ ok, value } | { ok, error }` covers many use cases without a library.

## C — Common Pitfalls with Fix

### Pitfall: Using `_unsafeUnwrap()` in production code

```ts
const value = result._unsafeUnwrap() // throws if err — defeats the purpose
```

**Fix:** Use `match`, `unwrapOr`, or `andThen`. `_unsafeUnwrap` is for tests only.

### Pitfall: Mixing throw and neverthrow

```ts
ok(42).map(n => {
  if (n < 0) throw new Error("negative") // ❌ unhandled throw inside map
  return n
})
```

**Fix:** Use `andThen` for operations that might fail:

```ts
ok(42).andThen(n => n < 0 ? err("negative") : ok(n))
```

## K — Coding Challenge with Solution

### Challenge

Use `neverthrow` to validate a registration form:

```ts
// Validate: name (non-empty), email (has @), password (8+ chars)
// All validations should run and collect ALL errors
```

### Solution

```ts
import { ok, err, Result } from "neverthrow"

type ValidationError = { field: string; message: string }

function validateName(name: string): Result<string, ValidationError> {
  return name.trim().length > 0
    ? ok(name.trim())
    : err({ field: "name", message: "Name is required" })
}

function validateEmail(email: string): Result<string, ValidationError> {
  return email.includes("@")
    ? ok(email)
    : err({ field: "email", message: "Invalid email" })
}

function validatePassword(password: string): Result<string, ValidationError> {
  return password.length >= 8
    ? ok(password)
    : err({ field: "password", message: "Must be 8+ characters" })
}

function validateForm(data: { name: string; email: string; password: string }) {
  const nameResult = validateName(data.name)
  const emailResult = validateEmail(data.email)
  const passwordResult = validatePassword(data.password)

  // Collect all errors:
  const errors: ValidationError[] = []
  if (nameResult.isErr()) errors.push(nameResult.error)
  if (emailResult.isErr()) errors.push(emailResult.error)
  if (passwordResult.isErr()) errors.push(passwordResult.error)

  if (errors.length > 0) return err(errors)

  return ok({
    name: nameResult._unsafeUnwrap(),
    email: emailResult._unsafeUnwrap(),
    password: passwordResult._unsafeUnwrap(),
  })
}
```

---

# 9 — Custom Error Classes & Error Hierarchies

## T — TL;DR

Custom error classes create **typed, structured error hierarchies** with domain-specific information — enabling precise error handling, consistent logging, and type-safe matching in catch blocks and Result types.

## K — Key Concepts

### Basic Custom Error

```ts
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = "AppError"
  }
}

throw new AppError("User not found", "USER_NOT_FOUND", 404)
```

### Error Hierarchy

```ts
// Base:
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = this.constructor.name
  }
}

// Domain errors:
class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" not found`, "NOT_FOUND", 404)
  }
}

class ValidationError extends AppError {
  constructor(
    public readonly errors: { field: string; message: string }[],
  ) {
    super("Validation failed", "VALIDATION_ERROR", 400)
  }
}

class UnauthorizedError extends AppError {
  constructor(reason: string = "Authentication required") {
    super(reason, "UNAUTHORIZED", 401)
  }
}

class ForbiddenError extends AppError {
  constructor(action: string) {
    super(`Not allowed to ${action}`, "FORBIDDEN", 403)
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409)
  }
}
```

### Using `Error.cause` (ES2022)

```ts
async function getUser(id: string): Promise<User> {
  try {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  } catch (error) {
    throw new NotFoundError("User", id, { cause: error })
    // Original error preserved in .cause for debugging
  }
}

// Access the chain:
try {
  await getUser("123")
} catch (e) {
  if (e instanceof AppError) {
    console.error(e.message)     // "User with id "123" not found"
    console.error(e.cause)       // Original fetch error
  }
}
```

### Error Classes with Result Pattern

```ts
type ServiceError =
  | NotFoundError
  | ValidationError
  | UnauthorizedError
  | ConflictError

function createUser(data: CreateUserInput): Result<User, ServiceError> {
  const errors = validate(data)
  if (errors.length > 0) return err(new ValidationError(errors))

  const existing = findByEmail(data.email)
  if (existing) return err(new ConflictError("Email already registered"))

  return ok({ id: crypto.randomUUID(), ...data })
}

// Handle with exhaustive matching:
const result = createUser(input)

if (!result.ok) {
  const error = result.error
  if (error instanceof ValidationError) {
    return { status: 400, body: { errors: error.errors } }
  }
  if (error instanceof ConflictError) {
    return { status: 409, body: { message: error.message } }
  }
  // TypeScript narrows — all cases handled
}
```

### Type-Safe Error Matching with Discriminant

```ts
type DomainError =
  | { _tag: "NotFound"; entity: string; id: string }
  | { _tag: "Validation"; errors: { field: string; message: string }[] }
  | { _tag: "Unauthorized"; reason: string }

// Lighter than classes — just data:
const notFound = (entity: string, id: string): DomainError =>
  ({ _tag: "NotFound", entity, id })

const validation = (errors: { field: string; message: string }[]): DomainError =>
  ({ _tag: "Validation", errors })

// Exhaustive matching:
function handleError(error: DomainError) {
  switch (error._tag) {
    case "NotFound": return { status: 404, message: `${error.entity} not found` }
    case "Validation": return { status: 400, errors: error.errors }
    case "Unauthorized": return { status: 401, message: error.reason }
  }
}
```

## W — Why It Matters

- Custom errors give you **structured, queryable** error information (codes, status, context).
- Error hierarchies enable `instanceof` checking and precise error handling.
- `Error.cause` creates **error chains** for debugging without losing original context.
- Discriminated error unions work seamlessly with the Result pattern.
- Express/Next.js error handlers convert error classes to HTTP responses.

## I — Interview Questions with Answers

### Q1: Why use custom error classes?

**A:** They provide structured error information (code, status, domain context), enable `instanceof` type narrowing, create hierarchies for catch-all handling, and standardize error responses across the application.

### Q2: What is `Error.cause`?

**A:** ES2022 feature. Pass `{ cause: originalError }` to any Error constructor. Creates an error chain preserving the original error. Essential for wrapping low-level errors with domain context without losing debug information.

### Q3: When should you use error classes vs discriminated union errors?

**A:** Classes when you need `instanceof`, stack traces, and integration with `throw`/`catch`. Discriminated unions when using the Result pattern — they're lighter, more composable, and work with `switch` exhaustiveness checking.

## C — Common Pitfalls with Fix

### Pitfall: Not setting `this.name`

```ts
class MyError extends Error {
  constructor(msg: string) { super(msg) }
}
new MyError("x").name // "Error" — not "MyError"!
```

**Fix:** `this.name = this.constructor.name` or `this.name = "MyError"`.

### Pitfall: `instanceof` failing across module boundaries

In some bundler configurations, `instanceof` can fail for errors from different modules.

**Fix:** Use a `code` property or `_tag` discriminant for checking instead of `instanceof`.

## K — Coding Challenge with Solution

### Challenge

Create an error hierarchy for an e-commerce API and a middleware that converts errors to HTTP responses:

### Solution

```ts
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = this.constructor.name
  }
}

class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} "${id}" not found`, "NOT_FOUND", 404)
  }
}

class ValidationError extends AppError {
  constructor(public readonly fields: Record<string, string>) {
    super("Validation failed", "VALIDATION_ERROR", 400)
  }
}

class InsufficientStockError extends AppError {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Product ${productId}: requested ${requested}, available ${available}`,
      "INSUFFICIENT_STOCK",
      409,
    )
  }
}

// Error handler middleware:
function errorToResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return { status: 400, body: { code: error.code, fields: error.fields } }
  }
  if (error instanceof AppError) {
    return { status: error.statusCode, body: { code: error.code, message: error.message } }
  }
  // Unknown error:
  console.error("Unexpected error:", error)
  return { status: 500, body: { code: "INTERNAL_ERROR", message: "Something went wrong" } }
}
```

---

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

# 11 — Zod — Runtime Validation & TS Bridge

## T — TL;DR

Zod is a **runtime validation library** that defines schemas once and gives you both runtime validation AND TypeScript types — bridging the gap between TypeScript's compile-time safety and runtime reality.

## K — Key Concepts

### The Problem Zod Solves

```ts
interface User {
  name: string
  email: string
  age: number
}

// TypeScript trusts you — but data from outside might be ANYTHING:
const data: User = await request.json() // could be { foo: 42 }
data.name.toUpperCase() // 💥 runtime crash
```

TypeScript types are **erased at runtime**. External data needs **runtime validation**.

### Basic Schemas

```ts
import { z } from "zod"

// Define a schema:
const UserSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  age: z.number().int().min(0).max(150),
})

// Derive the TypeScript type:
type User = z.infer<typeof UserSchema>
// { name: string; email: string; age: number }

// Validate at runtime:
const result = UserSchema.safeParse(unknownData)

if (result.success) {
  result.data // fully typed as User ✅
} else {
  result.error.issues // detailed error array
}
```

### Schema Types

```ts
// Primitives:
z.string()
z.number()
z.boolean()
z.bigint()
z.date()
z.undefined()
z.null()
z.void()
z.any()
z.unknown()
z.never()

// Strings with validation:
z.string().min(1).max(100)
z.string().email()
z.string().url()
z.string().uuid()
z.string().regex(/^[a-z]+$/)
z.string().trim()
z.string().toLowerCase()

// Numbers:
z.number().int().positive()
z.number().min(0).max(100)

// Enums:
z.enum(["admin", "user", "guest"])

// Literals:
z.literal("active")
z.literal(42)

// Arrays:
z.array(z.string())
z.array(z.number()).min(1).max(10)

// Tuples:
z.tuple([z.string(), z.number()])

// Records:
z.record(z.string(), z.number())

// Unions:
z.union([z.string(), z.number()])
// or: z.string().or(z.number())

// Discriminated unions:
z.discriminatedUnion("type", [
  z.object({ type: z.literal("email"), address: z.string().email() }),
  z.object({ type: z.literal("sms"), phone: z.string() }),
])
```

### Object Schemas

```ts
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).optional(), // optional field
  role: z.enum(["admin", "user"]).default("user"), // default value
  metadata: z.record(z.unknown()).optional(),
})

// Transformations:
const CreateUserSchema = UserSchema.omit({ id: true }) // no id for creation
const UpdateUserSchema = UserSchema.partial().required({ id: true }) // id required, rest optional
const PublicUserSchema = UserSchema.pick({ id: true, name: true, email: true }) // only public fields

type CreateUser = z.infer<typeof CreateUserSchema>
type UpdateUser = z.infer<typeof UpdateUserSchema>
type PublicUser = z.infer<typeof PublicUserSchema>
```

### `parse` vs `safeParse`

```ts
// parse — throws ZodError on failure:
try {
  const user = UserSchema.parse(data) // User or throws
} catch (e) {
  if (e instanceof z.ZodError) {
    console.log(e.issues)
  }
}

// safeParse — returns Result-like object:
const result = UserSchema.safeParse(data)
if (result.success) {
  result.data // User ✅
} else {
  result.error.issues // ZodIssue[]
}

// safeParse is preferred — it follows the Result pattern!
```

### Transforms & Pipelines

```ts
// Transform during parsing:
const DateStringSchema = z.string().transform(s => new Date(s))
// Input: string → Output: Date

// Chained transforms:
const PriceSchema = z.string()
  .transform(s => parseFloat(s))
  .pipe(z.number().positive())
// Input: "9.99" → validates as positive number → Output: 9.99

// Preprocessing:
const NumberFromString = z.preprocess(
  val => (typeof val === "string" ? Number(val) : val),
  z.number(),
)
```

### Zod with API Validation

```ts
// Express middleware:
function validate<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: result.error.issues.map(i => ({
          field: i.path.join("."),
          message: i.message,
        })),
      })
    }
    req.body = result.data
    next()
  }
}

app.post("/api/users", validate(CreateUserSchema), (req, res) => {
  // req.body is guaranteed to be valid CreateUser
})
```

### Zod with Environment Variables

```ts
const EnvSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "production", "test"]),
})

// Validate at startup:
const env = EnvSchema.parse(process.env)
// env is fully typed and validated!
```

## W — Why It Matters

- Zod bridges **compile-time types** and **runtime validation** — the most important gap in TypeScript.
- **Define once, use everywhere** — schema is the single source of truth for both types and validation.
- Used by tRPC, React Hook Form, Next.js server actions, and most modern TypeScript APIs.
- `z.infer` eliminates the type duplication problem (interface + validation logic).
- Zod validation is used in Groups 3–4 (API routes, tRPC, form validation).
- This is the most practically valuable library in the TypeScript ecosystem.

## I — Interview Questions with Answers

### Q1: What problem does Zod solve?

**A:** TypeScript types exist only at compile time — they're erased at runtime. External data (API requests, form inputs, env vars, JSON files) is unvalidated. Zod provides runtime validation that also generates TypeScript types, ensuring data is both typed and validated.

### Q2: What is `z.infer`?

**A:** Extracts the TypeScript type from a Zod schema. `z.infer<typeof UserSchema>` gives you the type that `UserSchema.parse()` returns. This means you define the shape once (as a schema) and derive the type — no duplication.

### Q3: When should you use `parse` vs `safeParse`?

**A:** `safeParse` is preferred — it returns `{ success, data, error }` (Result-like). `parse` throws on failure, which conflicts with the "never throw" philosophy. Use `parse` only when failure is truly exceptional.

### Q4: How does Zod integrate with tRPC?

**A:** tRPC uses Zod schemas as input validators for procedures. The schema defines both the runtime validation and the TypeScript type for the input. Client-side code gets full type inference from the server's Zod schemas.

## C — Common Pitfalls with Fix

### Pitfall: Using `parse` instead of `safeParse` in API handlers

```ts
app.post("/users", (req, res) => {
  const data = UserSchema.parse(req.body) // throws on invalid input!
})
```

**Fix:** Use `safeParse` and return a proper error response.

### Pitfall: Duplicating types and schemas

```ts
interface User { name: string; email: string }
const UserSchema = z.object({ name: z.string(), email: z.string().email() })
// ❌ Type and schema can drift apart
```

**Fix:** Derive the type: `type User = z.infer<typeof UserSchema>`. Schema is the source of truth.

### Pitfall: Not using `.transform` for type conversions

```ts
// ❌ Manual conversion after validation
const port = EnvSchema.parse(process.env).PORT
const portNumber = Number(port) // could be NaN!
```

**Fix:** Use `.transform(Number)` in the schema to convert and validate in one step.

## K — Coding Challenge with Solution

### Challenge

Create a Zod schema for an e-commerce product with validation:

```ts
// Requirements:
// - name: 1-200 chars
// - price: positive number, max 2 decimal places
// - category: "electronics" | "clothing" | "food"
// - tags: array of strings, 0-10 items
// - metadata: optional record
// - createdAt: ISO date string → Date
```

### Solution

```ts
import { z } from "zod"

const ProductSchema = z.object({
  name: z.string().min(1, "Name required").max(200, "Name too long"),
  price: z.number()
    .positive("Price must be positive")
    .multipleOf(0.01, "Max 2 decimal places"),
  category: z.enum(["electronics", "clothing", "food"]),
  tags: z.array(z.string().min(1)).max(10, "Max 10 tags").default([]),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string()
    .datetime("Must be ISO date string")
    .transform(s => new Date(s)),
})

type Product = z.infer<typeof ProductSchema>

// Create and Update variants:
const CreateProductSchema = ProductSchema.omit({ createdAt: true })
const UpdateProductSchema = CreateProductSchema.partial()

// Test:
const result = ProductSchema.safeParse({
  name: "Laptop",
  price: 999.99,
  category: "electronics",
  tags: ["tech", "portable"],
  createdAt: "2024-01-15T10:30:00Z",
})

if (result.success) {
  result.data.createdAt // Date object ✅
  result.data.tags      // string[] ✅
}
```

---

# 12 — `using` & Explicit Resource Management

## T — TL;DR

The `using` keyword (TC39 Stage 3, TS 5.2+) provides **automatic cleanup** for resources like file handles, database connections, and locks — ensuring `[Symbol.dispose]` is called when the variable goes out of scope, like `finally` but cleaner.

## K — Key Concepts

### The Problem

```ts
// ❌ Manual cleanup — easy to forget
const connection = await database.connect()
try {
  await connection.query("SELECT * FROM users")
} finally {
  await connection.close() // must remember this!
}

// What if you have multiple resources?
const conn = await db.connect()
try {
  const file = await fs.open("output.txt", "w")
  try {
    // use both...
  } finally {
    await file.close()
  }
} finally {
  await conn.close()
}
// Deeply nested, hard to read
```

### `using` Declaration (Sync)

```ts
function processFile() {
  using file = openFile("data.txt")
  // file is automatically disposed when the block exits
  // Even if an exception is thrown!

  const data = file.read()
  return process(data)
} // file[Symbol.dispose]() called here automatically
```

### `Symbol.dispose` — Synchronous

```ts
class FileHandle implements Disposable {
  #handle: number
  #closed = false

  constructor(path: string) {
    this.#handle = openSync(path)
    console.log(`Opened: ${path}`)
  }

  read(): string {
    if (this.#closed) throw new Error("File is closed")
    return readSync(this.#handle)
  }

  [Symbol.dispose](): void {
    if (!this.#closed) {
      closeSync(this.#handle)
      this.#closed = true
      console.log("File closed")
    }
  }
}

function processFile() {
  using file = new FileHandle("data.txt")
  // "Opened: data.txt"

  return file.read()
} // "File closed" — automatic!
```

### `await using` — Asynchronous

```ts
class DatabaseConnection implements AsyncDisposable {
  #connection: Connection
  #closed = false

  static async create(url: string): Promise<DatabaseConnection> {
    const conn = new DatabaseConnection()
    conn.#connection = await connect(url)
    return conn
  }

  async query(sql: string): Promise<unknown[]> {
    return this.#connection.query(sql)
  }

  async [Symbol.asyncDispose](): Promise<void> {
    if (!this.#closed) {
      await this.#connection.close()
      this.#closed = true
      console.log("Connection closed")
    }
  }
}

async function getUsers() {
  await using db = await DatabaseConnection.create(DATABASE_URL)

  return db.query("SELECT * FROM users")
} // db[Symbol.asyncDispose]() called automatically
```

### Multiple Resources — Flat, Clean

```ts
async function exportData() {
  await using db = await DatabaseConnection.create(DB_URL)
  await using file = await AsyncFileHandle.open("export.csv", "w")
  using lock = acquireLock("export")

  const data = await db.query("SELECT * FROM users")
  await file.write(formatCSV(data))

  return { exported: data.length }
}
// All three resources cleaned up in reverse order:
// 1. lock[Symbol.dispose]()
// 2. file[Symbol.asyncDispose]()
// 3. db[Symbol.asyncDispose]()
```

Resources are disposed in **reverse declaration order** (LIFO) — just like a stack.

### `DisposableStack` / `AsyncDisposableStack`

For dynamically managing multiple disposable resources:

```ts
async function processMultipleFiles(paths: string[]) {
  await using stack = new AsyncDisposableStack()

  const files = paths.map(path => {
    const file = await AsyncFileHandle.open(path)
    stack.use(file) // register for cleanup
    return file
  })

  // Process all files...

} // All registered files cleaned up
```

### Adapter for Non-Disposable Resources

```ts
// Wrap any cleanup function as Disposable:
function disposable(cleanup: () => void): Disposable {
  return { [Symbol.dispose]: cleanup }
}

function asyncDisposable(cleanup: () => Promise<void>): AsyncDisposable {
  return { [Symbol.asyncDispose]: cleanup }
}

// Usage:
function withTimer(label: string) {
  console.time(label)
  return disposable(() => console.timeEnd(label))
}

function processData() {
  using _ = withTimer("processing")

  // ... heavy computation ...

} // "processing: 142ms" — auto logged
```

### Real-World: Transaction Pattern

```ts
class Transaction implements AsyncDisposable {
  #committed = false

  constructor(private conn: Connection) {}

  static async begin(conn: Connection): Promise<Transaction> {
    await conn.query("BEGIN")
    return new Transaction(conn)
  }

  async query(sql: string): Promise<unknown[]> {
    return this.conn.query(sql)
  }

  async commit(): Promise<void> {
    await this.conn.query("COMMIT")
    this.#committed = true
  }

  async [Symbol.asyncDispose](): Promise<void> {
    if (!this.#committed) {
      await this.conn.query("ROLLBACK")
      console.log("Transaction rolled back")
    }
  }
}

async function transferFunds(from: string, to: string, amount: number) {
  await using db = await DatabaseConnection.create(DB_URL)
  await using tx = await Transaction.begin(db)

  await tx.query(`UPDATE accounts SET balance = balance - ${amount} WHERE id = '${from}'`)
  await tx.query(`UPDATE accounts SET balance = balance + ${amount} WHERE id = '${to}'`)

  await tx.commit()
}
// If commit() isn't reached (exception), transaction auto-rollbacks
```

### `tsconfig` Requirement

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "ESNext.Disposable"]
  }
}
```

## W — Why It Matters

- **Resource leaks** (unclosed connections, file handles, locks) are among the hardest bugs to find.
- `using` makes cleanup **automatic and guaranteed** — like `defer` in Go or RAII in C++.
- Database transactions with auto-rollback prevent data corruption.
- Flat structure instead of deeply nested `try/finally` blocks.
- This is a TC39 Stage 3 feature — it's coming to JavaScript. TypeScript 5.2+ supports it now.
- Production Node.js servers MUST properly manage database connections and file handles.

## I — Interview Questions with Answers

### Q1: What does `using` do?

**A:** Declares a variable whose `[Symbol.dispose]()` method is automatically called when the variable goes out of scope (end of block, function return, or exception). `await using` does the same for async `[Symbol.asyncDispose]()`.

### Q2: What is the `Disposable` interface?

**A:** An object with a `[Symbol.dispose](): void` method. `AsyncDisposable` has `[Symbol.asyncDispose](): Promise<void>`. The `using` keyword works with `Disposable`; `await using` works with `AsyncDisposable`.

### Q3: In what order are resources disposed?

**A:** **Reverse declaration order** (LIFO). If you declare `using a`, `using b`, `using c`, they're disposed `c → b → a`. This ensures dependent resources are cleaned up before their dependencies.

### Q4: How does `using` compare to `try/finally`?

**A:** `using` is syntactic sugar for `try/finally` that's cleaner, less error-prone, and handles multiple resources without nesting. It also integrates with `DisposableStack` for dynamic resource management.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `await` before `using` for async resources

```ts
using db = await DatabaseConnection.create(URL) // ❌ sync `using` with async dispose
```

**Fix:** `await using db = await DatabaseConnection.create(URL)`.

### Pitfall: Disposing already-closed resources

```ts
class Handle implements Disposable {
  [Symbol.dispose]() {
    close(this.handle) // might fail if already closed!
  }
}
```

**Fix:** Track `#closed` state and skip disposal if already done (idempotent disposal).

### Pitfall: Not including `ESNext.Disposable` in `lib`

```ts
// Error: Cannot find name 'Disposable' / 'Symbol.dispose'
```

**Fix:** Add `"lib": ["ES2022", "ESNext.Disposable"]` in `tsconfig.json`.

## K — Coding Challenge with Solution

### Challenge

Create a `Mutex` (mutual exclusion lock) using `using`:

```ts
const mutex = new Mutex()

async function criticalSection() {
  using lock = await mutex.acquire()
  // Only one execution at a time
  await doSomethingExclusive()
} // lock automatically released
```

### Solution

```ts
class MutexLock implements Disposable {
  constructor(private release: () => void) {}

  [Symbol.dispose](): void {
    this.release()
  }
}

class Mutex {
  #locked = false
  #queue: (() => void)[] = []

  async acquire(): Promise<MutexLock> {
    if (this.#locked) {
      await new Promise<void>(resolve => this.#queue.push(resolve))
    }
    this.#locked = true

    return new MutexLock(() => {
      this.#locked = false
      const next = this.#queue.shift()
      if (next) next()
    })
  }
}

// Usage:
const mutex = new Mutex()

async function safeIncrement(counter: { value: number }) {
  using lock = await mutex.acquire()
  // Only one caller at a time:
  const current = counter.value
  await delay(10) // simulate async work
  counter.value = current + 1
} // lock released, next caller proceeds

// Test:
const counter = { value: 0 }
await Promise.all([
  safeIncrement(counter),
  safeIncrement(counter),
  safeIncrement(counter),
])
console.log(counter.value) // 3 ✅ (without mutex, could be 1 due to race condition)
```

---

# ✅ Day 12 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Pure Functions & Referential Transparency | ✅ T-KWICK |
| 2 | Immutability Patterns | ✅ T-KWICK |
| 3 | Function Composition & `pipe` | ✅ T-KWICK |
| 4 | Currying & Partial Application | ✅ T-KWICK |
| 5 | The `Result` Type — Never Throw Philosophy | ✅ T-KWICK |
| 6 | The `Option` Type — Eliminating `null` | ✅ T-KWICK |
| 7 | `ResultAsync` & Promise Integration | ✅ T-KWICK |
| 8 | `neverthrow` Library (Reference) | ✅ T-KWICK |
| 9 | Custom Error Classes & Error Hierarchies | ✅ T-KWICK |
| 10 | Defensive Programming | ✅ T-KWICK |
| 11 | Zod — Runtime Validation & TS Bridge | ✅ T-KWICK |
| 12 | `using` & Explicit Resource Management | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 12` | 5 interview-style problems covering all 12 topics |
| `Generate Day 13` | **Mastery & Interview Prep** — Capstone project, system design, interview simulation |
| `recap` | Quick Day 12 summary |
| `recap Phase 3` | Summary of Days 11–12 |

> Your code now **never lies about errors** and **cleans up after itself**. Tomorrow, you prove it.