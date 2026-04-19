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
