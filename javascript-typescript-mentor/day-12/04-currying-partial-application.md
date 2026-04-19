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
