
# 📘 Day 7 — Modern JavaScript

> Phase 1 · JavaScript Basics to Advanced (Final Day)
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Iterators & the Iterable Protocol](#1--iterators--the-iterable-protocol)
2. [Generators (`function*`)](#2--generators-function)
3. [Async Generators & `for await...of`](#3--async-generators--for-awaitof)
4. [`Symbol` & Well-Known Symbols](#4--symbol--well-known-symbols)
5. [ESM vs CJS](#5--esm-vs-cjs)
6. [Dynamic `import()` & Top-Level `await`](#6--dynamic-import--top-level-await)
7. [`globalThis`](#7--globalthis)
8. [`Object.hasOwn` & `Array.fromAsync`](#8--objecthasown--arrayfromasync)
9. [The `Intl` API](#9--the-intl-api)
10. [ES2024: Array Grouping & `Promise.withResolvers`](#10--es2024-array-grouping--promisewithresolvers)
11. [`using` & Explicit Resource Management (Preview)](#11--using--explicit-resource-management-preview)
12. [Pipeline Operator & Future Proposals (Preview)](#12--pipeline-operator--future-proposals-preview)

---

# 1 — Iterators & the Iterable Protocol

## T — TL;DR

An **iterable** is any object with a `Symbol.iterator` method that returns an **iterator** (an object with a `next()` method) — this protocol powers `for...of`, spread, destructuring, and every collection-consuming API in JavaScript.

## K — Key Concepts

### The Iterator Protocol

An iterator is an object with a `next()` method that returns `{ value, done }`:

```js
const iterator = {
  current: 0,
  next() {
    if (this.current < 3) {
      return { value: this.current++, done: false }
    }
    return { value: undefined, done: true }
  },
}

iterator.next() // { value: 0, done: false }
iterator.next() // { value: 1, done: false }
iterator.next() // { value: 2, done: false }
iterator.next() // { value: undefined, done: true }
```

### The Iterable Protocol

An iterable is an object with a `[Symbol.iterator]()` method that returns an iterator:

```js
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from
    const last = this.to

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  },
}

for (const num of range) {
  console.log(num) // 1, 2, 3, 4, 5
}

[...range]                // [1, 2, 3, 4, 5]
const [a, b] = range      // a=1, b=2
Array.from(range)          // [1, 2, 3, 4, 5]
```

### Built-In Iterables

These all implement `Symbol.iterator`:

```js
// Arrays
for (const x of [1, 2, 3]) {}

// Strings
for (const char of "hello") {} // "h", "e", "l", "l", "o"

// Maps
for (const [k, v] of new Map([["a", 1]])) {}

// Sets
for (const v of new Set([1, 2, 3])) {}

// TypedArrays
for (const byte of new Uint8Array([1, 2, 3])) {}

// arguments object
function fn() { for (const a of arguments) {} }

// NodeList (DOM)
for (const el of document.querySelectorAll("div")) {}
```

### What Consumes Iterables

| Consumer | Example |
|----------|---------|
| `for...of` | `for (const x of iterable) {}` |
| Spread | `[...iterable]` |
| Destructuring | `const [a, b] = iterable` |
| `Array.from` | `Array.from(iterable)` |
| `Promise.all` | `Promise.all(iterable)` |
| `new Map` / `new Set` | `new Set(iterable)` |
| `yield*` | `yield* iterable` (generators) |

### Making a Class Iterable

```js
class Playlist {
  #songs = []

  add(song) {
    this.#songs.push(song)
    return this
  }

  [Symbol.iterator]() {
    let index = 0
    const songs = this.#songs

    return {
      next() {
        if (index < songs.length) {
          return { value: songs[index++], done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }
}

const playlist = new Playlist()
playlist.add("Song A").add("Song B").add("Song C")

for (const song of playlist) {
  console.log(song) // "Song A", "Song B", "Song C"
}

const allSongs = [...playlist] // ["Song A", "Song B", "Song C"]
```

### Infinite Iterators

Iterators don't have to end:

```js
const naturals = {
  [Symbol.iterator]() {
    let n = 1
    return {
      next() {
        return { value: n++, done: false } // never done
      },
    }
  },
}

// Take the first 5:
const first5 = []
for (const n of naturals) {
  first5.push(n)
  if (first5.length === 5) break
}
// [1, 2, 3, 4, 5]
```

### `return()` — Early Termination

Iterators can have an optional `return()` method called when iteration is aborted (`break`, `throw`, or destructuring takes fewer values):

```js
const resource = {
  [Symbol.iterator]() {
    console.log("Opening resource")
    let i = 0
    return {
      next() {
        return { value: i++, done: false }
      },
      return() {
        console.log("Closing resource") // cleanup!
        return { value: undefined, done: true }
      },
    }
  },
}

for (const x of resource) {
  if (x > 2) break // triggers return()
}
// "Opening resource"
// "Closing resource"
```

## W — Why It Matters

- The iterator protocol is the **foundation** of `for...of`, spread, destructuring, and generators.
- Custom iterables let you make any class work with `for...of` and spread.
- Libraries like RxJS, Immutable.js, and database query builders implement the iterable protocol.
- Infinite iterators enable lazy evaluation — process data on demand without loading everything.
- Understanding iterators is prerequisite for generators (next topic).

## I — Interview Questions with Answers

### Q1: What is the difference between an iterable and an iterator?

**A:** An **iterable** is an object with a `[Symbol.iterator]()` method that returns an iterator. An **iterator** is an object with a `next()` method that returns `{ value, done }`. Arrays are iterables; calling `array[Symbol.iterator]()` returns an iterator.

### Q2: How do you make a custom object iterable?

**A:** Implement a `[Symbol.iterator]()` method that returns an object with a `next()` method. The `next()` method returns `{ value, done: false }` for each element and `{ value: undefined, done: true }` when done.

### Q3: What consumes iterables?

**A:** `for...of`, spread (`...`), destructuring, `Array.from`, `Promise.all`, `new Map`/`Set`, and `yield*` in generators.

### Q4: What is the `return()` method on iterators for?

**A:** Cleanup. It's called when iteration is terminated early (via `break`, `throw`, or partial destructuring). It's analogous to `finally` — useful for closing file handles, connections, etc.

## C — Common Pitfalls with Fix

### Pitfall: Confusing iterables with arrays

```js
const iterable = { [Symbol.iterator]() { /* ... */ } }
iterable.map // undefined! Not an array.
```

**Fix:** Convert first: `Array.from(iterable).map(...)` or `[...iterable].map(...)`.

### Pitfall: Iterator is consumed after one pass

```js
const arr = [1, 2, 3]
const iter = arr[Symbol.iterator]()

[...iter] // [1, 2, 3]
[...iter] // [] — iterator is exhausted!
```

**Fix:** The **iterable** (`arr`) creates a fresh iterator each time. The **iterator** itself is one-use. Always spread the iterable, not the iterator.

### Pitfall: Plain objects are NOT iterable

```js
for (const x of { a: 1 }) {} // TypeError: {a: 1} is not iterable
```

**Fix:** Use `Object.entries(obj)` to create an iterable from an object.

## K — Coding Challenge with Solution

### Challenge

Create a `range(start, end, step = 1)` function that returns an iterable:

```js
for (const n of range(0, 10, 2)) {
  console.log(n) // 0, 2, 4, 6, 8, 10
}

[...range(1, 5)] // [1, 2, 3, 4, 5]
```

### Solution

```js
function range(start, end, step = 1) {
  return {
    [Symbol.iterator]() {
      let current = start
      return {
        next() {
          if (current <= end) {
            const value = current
            current += step
            return { value, done: false }
          }
          return { value: undefined, done: true }
        },
      }
    },
  }
}

for (const n of range(0, 10, 2)) console.log(n) // 0, 2, 4, 6, 8, 10
console.log([...range(1, 5)]) // [1, 2, 3, 4, 5]
```

---

# 2 — Generators (`function*`)

## T — TL;DR

A generator is a function that can **pause and resume** execution using `yield` — it returns an iterator, making it the easiest way to create custom iterables and lazy sequences.

## K — Key Concepts

### Basic Generator

```js
function* count() {
  yield 1
  yield 2
  yield 3
}

const gen = count()

gen.next() // { value: 1, done: false }
gen.next() // { value: 2, done: false }
gen.next() // { value: 3, done: false }
gen.next() // { value: undefined, done: true }
```

`function*` defines a generator. Calling it returns a **generator object** (which is both an iterator AND an iterable).

### Generators Are Iterables

```js
function* count() {
  yield 1
  yield 2
  yield 3
}

for (const n of count()) {
  console.log(n) // 1, 2, 3
}

[...count()] // [1, 2, 3]

const [a, b] = count() // a=1, b=2
```

### `yield` Pauses Execution

```js
function* steps() {
  console.log("Step 1")
  yield "first"

  console.log("Step 2")
  yield "second"

  console.log("Step 3")
  return "done"
}

const gen = steps()

gen.next()
// "Step 1"
// { value: "first", done: false }

gen.next()
// "Step 2"
// { value: "second", done: false }

gen.next()
// "Step 3"
// { value: "done", done: true }
```

The function **freezes** at each `yield` and resumes when `next()` is called.

### Passing Values INTO a Generator

`next(value)` sends a value back into the generator — it becomes the result of the `yield` expression:

```js
function* conversation() {
  const name = yield "What is your name?"
  const age = yield `Hello ${name}, how old are you?`
  return `${name} is ${age} years old`
}

const gen = conversation()

gen.next()           // { value: "What is your name?", done: false }
gen.next("Mark")     // { value: "Hello Mark, how old are you?", done: false }
gen.next(30)         // { value: "Mark is 30 years old", done: true }
```

**The first `next()` always has no argument** — it starts the generator up to the first `yield`.

### Infinite Generators

```js
function* naturals(start = 1) {
  let n = start
  while (true) {
    yield n++
  }
}

// Take first 5
const first5 = []
for (const n of naturals()) {
  first5.push(n)
  if (first5.length === 5) break
}
// [1, 2, 3, 4, 5]
```

### `yield*` — Delegation

Delegates to another iterable or generator:

```js
function* inner() {
  yield 3
  yield 4
}

function* outer() {
  yield 1
  yield 2
  yield* inner() // delegates to inner
  yield 5
}

[...outer()] // [1, 2, 3, 4, 5]
```

Works with any iterable:

```js
function* withArray() {
  yield* [10, 20, 30]
  yield* "abc"
}

[...withArray()] // [10, 20, 30, "a", "b", "c"]
```

### `return()` and `throw()` on Generators

```js
function* gen() {
  try {
    yield 1
    yield 2
    yield 3
  } finally {
    console.log("Cleanup!")
  }
}

const g = gen()
g.next()    // { value: 1, done: false }
g.return("early") // "Cleanup!" → { value: "early", done: true }
// Generator is terminated

const g2 = gen()
g2.next()   // { value: 1, done: false }
g2.throw(new Error("fail")) // "Cleanup!" → throws Error("fail")
```

### Lazy Evaluation Pattern

```js
function* map(iterable, fn) {
  for (const item of iterable) {
    yield fn(item)
  }
}

function* filter(iterable, fn) {
  for (const item of iterable) {
    if (fn(item)) yield item
  }
}

function* take(iterable, n) {
  let count = 0
  for (const item of iterable) {
    yield item
    if (++count >= n) return
  }
}

// Lazy pipeline — only processes what's needed
function* naturals() {
  let n = 1
  while (true) yield n++
}

const result = [
  ...take(
    filter(
      map(naturals(), n => n * n), // square
      n => n % 2 === 0              // even only
    ),
    5 // take first 5
  ),
]
// [4, 16, 36, 64, 100]
// Only computed 10 numbers, not infinity!
```

## W — Why It Matters

- Generators are the **simplest way** to create custom iterables.
- They enable **lazy evaluation** — processing data on demand without loading everything.
- Redux-Saga uses generators for side-effect management.
- Generators are the foundation for **async generators** (next topic) and `for await...of`.
- The pause/resume mechanism explains how `async/await` works internally (it was transpiled to generators before native support).
- Understanding `yield*` is key for composing complex iteration pipelines.

## I — Interview Questions with Answers

### Q1: What is a generator function?

**A:** A function declared with `function*` that can pause execution at `yield` points and resume later. It returns a generator object that implements both the iterator and iterable protocols.

### Q2: How does `yield` differ from `return`?

**A:** `yield` pauses the function and emits a value — execution can resume. `return` terminates the generator permanently and sets `done: true`.

### Q3: What does `yield*` do?

**A:** Delegates iteration to another iterable or generator. It yields each value from the delegated iterable in sequence before continuing the outer generator.

### Q4: How do you send values into a generator?

**A:** By passing an argument to `gen.next(value)`. The value becomes the result of the `yield` expression inside the generator. The first `next()` call cannot send a value (it starts execution up to the first `yield`).

## C — Common Pitfalls with Fix

### Pitfall: Forgetting the `*` in `function*`

```js
function gen() { yield 1 } // SyntaxError: Unexpected number
```

**Fix:** `function* gen() { yield 1 }`. The `*` is required.

### Pitfall: Trying to use arrow functions as generators

```js
const gen = *() => { yield 1 } // SyntaxError
```

**Fix:** Generators can't be arrow functions. Use `function*` declaration or expression.

### Pitfall: Forgetting that the first `next()` doesn't accept a meaningful argument

```js
function* gen() {
  const x = yield
  console.log(x)
}

const g = gen()
g.next("ignored") // starts generator, "ignored" is lost
g.next("received") // logs "received"
```

**Fix:** The first `next()` just starts execution to the first `yield`. Send values starting from the second `next()`.

### Pitfall: Consuming a generator twice

```js
const gen = count()
[...gen] // [1, 2, 3]
[...gen] // [] — exhausted!
```

**Fix:** Call the generator function again: `[...count()]` creates a fresh generator each time.

## K — Coding Challenge with Solution

### Challenge

Create an infinite Fibonacci generator and a `take(gen, n)` utility:

```js
const fibs = [...take(fibonacci(), 10)]
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Solution

```js
function* fibonacci() {
  let a = 0, b = 1
  while (true) {
    yield a;
    [a, b] = [b, a + b]
  }
}

function* take(iterable, n) {
  let count = 0
  for (const item of iterable) {
    yield item
    if (++count >= n) return
  }
}

console.log([...take(fibonacci(), 10)])
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

# 3 — Async Generators & `for await...of`

## T — TL;DR

Async generators (`async function*`) combine generators with Promises — they `yield` values asynchronously, consumed by `for await...of`, enabling streaming data processing and paginated API fetching.

## K — Key Concepts

### Async Generator Syntax

```js
async function* asyncCount() {
  for (let i = 1; i <= 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    yield i
  }
}

// Consuming with for await...of:
for await (const num of asyncCount()) {
  console.log(num)
}
// (1 second) 1
// (1 second) 2
// (1 second) 3
```

### The Async Iterable Protocol

| Protocol | Method | `next()` Returns |
|----------|--------|-----------------|
| Sync iterable | `[Symbol.iterator]()` | `{ value, done }` |
| Async iterable | `[Symbol.asyncIterator]()` | `Promise<{ value, done }>` |

```js
const asyncIterable = {
  [Symbol.asyncIterator]() {
    let i = 0
    return {
      async next() {
        if (i < 3) {
          await delay(100)
          return { value: i++, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  },
}

for await (const v of asyncIterable) {
  console.log(v) // 0, 1, 2
}
```

### Use Case 1: Paginated API Fetching

```js
async function* fetchPages(url) {
  let nextUrl = url

  while (nextUrl) {
    const response = await fetch(nextUrl)
    const data = await response.json()

    yield data.items

    nextUrl = data.nextPage ?? null
  }
}

// Consume all pages lazily:
for await (const page of fetchPages("/api/users?page=1")) {
  for (const user of page) {
    console.log(user.name)
  }
}
```

### Use Case 2: Streaming Lines from a File (Node.js)

```js
import { createReadStream } from "fs"
import { createInterface } from "readline"

async function* readLines(filePath) {
  const stream = createReadStream(filePath)
  const rl = createInterface({ input: stream })

  for await (const line of rl) {
    yield line
  }
}

for await (const line of readLines("data.csv")) {
  console.log(line)
}
```

### Use Case 3: WebSocket Message Stream

```js
async function* wsMessages(url) {
  const ws = new WebSocket(url)

  const messages = []
  let resolve

  ws.onmessage = (event) => {
    messages.push(event.data)
    resolve?.()
  }

  try {
    while (ws.readyState === WebSocket.OPEN || messages.length > 0) {
      if (messages.length > 0) {
        yield messages.shift()
      } else {
        await new Promise(r => { resolve = r })
      }
    }
  } finally {
    ws.close()
  }
}

for await (const msg of wsMessages("wss://api.example.com")) {
  console.log("Message:", msg)
}
```

### `for await...of` with Sync Iterables

`for await...of` also works with regular iterables containing Promises:

```js
const promises = [
  fetch("/api/a").then(r => r.json()),
  fetch("/api/b").then(r => r.json()),
  fetch("/api/c").then(r => r.json()),
]

for await (const data of promises) {
  console.log(data) // awaits each promise in order
}
```

**Note:** This is sequential — each Promise is awaited before moving to the next. For parallel, use `Promise.all`.

### `yield*` in Async Generators

```js
async function* generator1() {
  yield 1
  yield 2
}

async function* generator2() {
  yield 0
  yield* generator1() // delegates to another async generator
  yield 3
}

for await (const v of generator2()) {
  console.log(v) // 0, 1, 2, 3
}
```

## W — Why It Matters

- **Streaming data** — process large datasets without loading everything into memory.
- **Paginated APIs** — the most elegant pattern for consuming paginated REST endpoints.
- **Real-time data** — WebSocket, SSE, and event streams as async iterables.
- **Node.js streams** — `readline`, `fs.createReadStream`, and HTTP streams are async iterables.
- This pattern is used in production by database ORMs (Prisma), API clients, and data processing pipelines.

## I — Interview Questions with Answers

### Q1: What is an async generator?

**A:** A function declared with `async function*` that can both `await` Promises and `yield` values. It returns an async iterator consumed by `for await...of`.

### Q2: What is the difference between `Symbol.iterator` and `Symbol.asyncIterator`?

**A:** `Symbol.iterator` returns a sync iterator whose `next()` returns `{ value, done }`. `Symbol.asyncIterator` returns an async iterator whose `next()` returns a `Promise<{ value, done }>`.

### Q3: When would you use an async generator?

**A:** When you need to produce values over time from async sources — paginated APIs, streaming data, file reading line by line, WebSocket messages, or any lazy async sequence.

## C — Common Pitfalls with Fix

### Pitfall: Using `for...of` instead of `for await...of`

```js
for (const v of asyncGenerator()) {} // TypeError — async iterables need `for await`
```

**Fix:** Use `for await (const v of asyncGenerator())`.

### Pitfall: `for await...of` on sync Promises is sequential

```js
const promises = urls.map(url => fetch(url))
for await (const response of promises) {
  // Sequential! Each awaits before starting the next.
}
```

**Fix:** If you want parallel, use `Promise.all(promises)`.

### Pitfall: Not handling cleanup in async generators

```js
async function* stream() {
  const connection = await openConnection()
  try {
    while (true) {
      yield await connection.read()
    }
  } finally {
    await connection.close() // cleanup when iteration stops
  }
}
```

**Fix:** Always use `try/finally` in async generators that manage resources.

## K — Coding Challenge with Solution

### Challenge

Create an async generator `poll(url, intervalMs)` that fetches a URL at regular intervals and yields the JSON response each time. It should stop cleanly when the consumer breaks.

### Solution

```js
async function* poll(url, intervalMs) {
  try {
    while (true) {
      const response = await fetch(url)
      const data = await response.json()
      yield data
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
  } finally {
    console.log("Polling stopped")
  }
}

// Usage:
let count = 0
for await (const data of poll("/api/status", 3000)) {
  console.log("Status:", data)
  if (++count >= 5) break // stops after 5 polls → "Polling stopped"
}
```

---

# 4 — `Symbol` & Well-Known Symbols

## T — TL;DR

Symbols are **unique, immutable primitive values** used as property keys that can't collide — well-known Symbols like `Symbol.iterator` and `Symbol.toPrimitive` let you customize how JavaScript's built-in operations work on your objects.

## K — Key Concepts

### Creating Symbols

```js
const s1 = Symbol()
const s2 = Symbol()
s1 === s2 // false — every Symbol is unique

const named = Symbol("description")
named.toString()    // "Symbol(description)"
named.description   // "description"
```

### Symbols as Property Keys

```js
const id = Symbol("id")

const user = {
  name: "Mark",
  [id]: 123, // Symbol-keyed property
}

user[id]           // 123
user.id            // undefined — different!
Object.keys(user)  // ["name"] — Symbols are NOT in keys/values/entries
```

Symbols are **not enumerable** by default — they're hidden from `for...in`, `Object.keys`, and `JSON.stringify`:

```js
JSON.stringify(user)          // '{"name":"Mark"}' — Symbol property missing
Object.getOwnPropertySymbols(user) // [Symbol(id)] — explicit access
Reflect.ownKeys(user)         // ["name", Symbol(id)] — includes both
```

### `Symbol.for` — Global Symbol Registry

```js
const s1 = Symbol.for("shared")
const s2 = Symbol.for("shared")
s1 === s2 // true — same global symbol

Symbol.keyFor(s1) // "shared"
Symbol.keyFor(Symbol("local")) // undefined — not in global registry
```

### Well-Known Symbols

JavaScript has built-in Symbols that let you **customize language behavior**:

#### `Symbol.iterator` — Covered in Topic 1

Makes an object iterable with `for...of`.

#### `Symbol.asyncIterator` — Covered in Topic 3

Makes an object async iterable with `for await...of`.

#### `Symbol.toPrimitive` — Covered in Day 3

Controls type coercion:

```js
class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount
    if (hint === "string") return `${this.amount} ${this.currency}`
    return this.amount
  }
}

const price = new Money(9.99, "USD")
+price     // 9.99
`${price}` // "9.99 USD"
```

#### `Symbol.hasInstance` — Customize `instanceof`

```js
class Even {
  static [Symbol.hasInstance](num) {
    return typeof num === "number" && num % 2 === 0
  }
}

4 instanceof Even  // true
3 instanceof Even  // false
```

This will connect to TypeScript's type narrowing on Day 8 — `instanceof` checks use this Symbol.

#### `Symbol.toStringTag` — Customize `Object.prototype.toString`

```js
class Validator {
  get [Symbol.toStringTag]() {
    return "Validator"
  }
}

Object.prototype.toString.call(new Validator())
// "[object Validator]" instead of "[object Object]"
```

#### `Symbol.species` — Control Constructor for Derived Methods

```js
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array // .map(), .filter() return plain Array, not MyArray
  }
}

const arr = new MyArray(1, 2, 3)
const mapped = arr.map(x => x * 2)
mapped instanceof MyArray // false
mapped instanceof Array   // true
```

### Well-Known Symbols Summary

| Symbol | Controls |
|--------|----------|
| `Symbol.iterator` | `for...of`, spread, destructuring |
| `Symbol.asyncIterator` | `for await...of` |
| `Symbol.toPrimitive` | Type coercion (`+`, `${}`, `==`) |
| `Symbol.hasInstance` | `instanceof` |
| `Symbol.toStringTag` | `Object.prototype.toString.call()` |
| `Symbol.species` | Constructor used by derived methods |
| `Symbol.isConcatSpreadable` | `Array.prototype.concat` spreading |
| `Symbol.match` / `Symbol.replace` / `Symbol.search` / `Symbol.split` | String method interaction |

## W — Why It Matters

- Symbols prevent property name collisions — essential for library/framework code.
- Well-known Symbols are how you "hook into" JavaScript's built-in operations.
- `Symbol.iterator` and `Symbol.asyncIterator` power the entire iteration protocol.
- `Symbol.hasInstance` connects to TypeScript's `instanceof` type narrowing (Day 8).
- `Symbol.toPrimitive` controls coercion behavior (Day 3 callback).
- Library authors (React, Vue, etc.) use Symbols for internal properties that don't conflict with user code.

## I — Interview Questions with Answers

### Q1: What is a Symbol?

**A:** A unique, immutable primitive value created with `Symbol()`. Primarily used as property keys to avoid name collisions. Every Symbol is guaranteed unique (`Symbol() !== Symbol()`).

### Q2: What are well-known Symbols?

**A:** Built-in Symbols that let you customize how JavaScript operations interact with your objects. Examples: `Symbol.iterator` (makes objects iterable), `Symbol.toPrimitive` (controls type coercion), `Symbol.hasInstance` (controls `instanceof`).

### Q3: How are Symbol properties different from string properties?

**A:** Symbol properties don't appear in `Object.keys`, `for...in`, or `JSON.stringify`. They're accessible via `Object.getOwnPropertySymbols()` or `Reflect.ownKeys()`. They prevent accidental name collisions.

### Q4: What is `Symbol.for`?

**A:** Creates or retrieves a Symbol from a global registry. `Symbol.for("key")` always returns the same Symbol for the same key, enabling Symbol sharing across modules and realms.

## C — Common Pitfalls with Fix

### Pitfall: Thinking Symbols are truly private

```js
const secret = Symbol("secret")
const obj = { [secret]: "hidden" }

// Still accessible:
Object.getOwnPropertySymbols(obj) // [Symbol(secret)]
```

**Fix:** Symbols provide **collision avoidance**, not security. Use `#private` fields for true encapsulation.

### Pitfall: Symbols are lost in JSON serialization

```js
const obj = { name: "Mark", [Symbol("id")]: 1 }
JSON.stringify(obj) // '{"name":"Mark"}' — Symbol property gone!
```

**Fix:** If you need to serialize Symbol-keyed data, extract it manually with `Object.getOwnPropertySymbols`.

### Pitfall: Confusing `Symbol()` with `Symbol.for()`

```js
Symbol("a") === Symbol("a")          // false — unique each time
Symbol.for("a") === Symbol.for("a")  // true — global registry
```

**Fix:** Use `Symbol()` for unique local symbols. Use `Symbol.for()` when you need the same symbol across modules.

## K — Coding Challenge with Solution

### Challenge

Create a `TypedCollection` class that:
- Stores items of a specific type
- Has a custom `instanceof` check (anything with a `.type` matching the collection's type is an "instance")
- Is iterable
- Has a custom `toString` tag

```js
const nums = new TypedCollection("number")
nums.add(1).add(2).add(3)

for (const n of nums) console.log(n) // 1, 2, 3

{ type: "number" } instanceof nums // true
{ type: "string" } instanceof nums // false

Object.prototype.toString.call(nums) // "[object TypedCollection<number>]"
```

### Solution

```js
class TypedCollection {
  #type
  #items = []

  constructor(type) {
    this.#type = type
  }

  add(item) {
    this.#items.push(item)
    return this
  }

  [Symbol.iterator]() {
    return this.#items[Symbol.iterator]()
  }

  static [Symbol.hasInstance](obj) {
    // Note: this is on the class, not instance
    // For instance-level, we'd need a different approach
    return obj && typeof obj.type === "string"
  }

  get [Symbol.toStringTag]() {
    return `TypedCollection<${this.#type}>`
  }
}
```

Note: `Symbol.hasInstance` is a static method on the **class**. For per-instance behavior, you'd need the instance on the right side of `instanceof` (which requires `[Symbol.hasInstance]` on the instance's constructor). The challenge is simplified for learning purposes.

---

# 5 — ESM vs CJS

## T — TL;DR

**ESM** (ECMAScript Modules: `import`/`export`) is the standard module system with static analysis and tree-shaking; **CJS** (CommonJS: `require`/`module.exports`) is the legacy Node.js system — modern code should use ESM.

## K — Key Concepts

### ESM Syntax

```js
// Named exports
export const PI = 3.14159
export function add(a, b) { return a + b }
export class User {}

// Default export
export default function main() {}

// Importing
import main, { PI, add, User } from "./math.js"

// Rename on import
import { add as sum } from "./math.js"

// Import all
import * as math from "./math.js"
math.PI    // 3.14159
math.add   // function

// Side-effect only import (runs the module, imports nothing)
import "./setup.js"
```

### CJS Syntax

```js
// Exporting
module.exports = { PI: 3.14, add: (a, b) => a + b }
// or
exports.PI = 3.14
exports.add = (a, b) => a + b

// Importing
const { PI, add } = require("./math")
const math = require("./math")
```

### Key Differences

| Feature | ESM (`import`/`export`) | CJS (`require`/`module.exports`) |
|---------|------------------------|----------------------------------|
| Syntax | `import`/`export` | `require()`/`module.exports` |
| Loading | **Static** (parsed at compile time) | **Dynamic** (executed at runtime) |
| Timing | Before code runs | When `require()` line executes |
| Top-level `await` | ✅ Supported | ❌ Not supported |
| Tree-shaking | ✅ Yes (static analysis) | ❌ No (dynamic) |
| `this` at top level | `undefined` | `module.exports` |
| File extension | `.mjs` or `"type": "module"` in package.json | `.cjs` or default `.js` |
| Circular deps | Handles gracefully (live bindings) | Can produce `undefined` (copied values) |
| Browser support | ✅ Native (`<script type="module">`) | ❌ Needs bundler |

### Static vs Dynamic

ESM imports are **statically analyzed** — the engine knows all imports/exports before running code:

```js
// ESM — static, determined at parse time
import { add } from "./math.js" // always this path, always these names

// CJS — dynamic, determined at runtime
const lib = require(condition ? "./a" : "./b") // path chosen at runtime
const { [dynamicKey]: fn } = require("./utils") // dynamic property access
```

This static nature enables **tree-shaking** — bundlers can remove unused exports.

### Live Bindings vs Copies

ESM exports are **live bindings** — importing modules see updates:

```js
// counter.mjs
export let count = 0
export function increment() { count++ }

// main.mjs
import { count, increment } from "./counter.mjs"
console.log(count) // 0
increment()
console.log(count) // 1 — sees the updated value!
```

CJS exports are **copies**:

```js
// counter.js
let count = 0
module.exports = { count, increment: () => count++ }

// main.js
const { count, increment } = require("./counter")
console.log(count) // 0
increment()
console.log(count) // 0 — still 0! It's a copy.
```

### Setting Up ESM in Node.js

**Option 1:** Set `"type": "module"` in package.json:

```json
{
  "type": "module"
}
```

All `.js` files are treated as ESM. Use `.cjs` for CommonJS files.

**Option 2:** Use `.mjs` extension for ESM files.

### Importing CJS from ESM

```js
// Works — default import
import pkg from "cjs-package"

// May not work — named imports from CJS
import { named } from "cjs-package" // depends on the package
```

Node.js wraps CJS exports as the default export.

### Importing ESM from CJS

```js
// ❌ Cannot require() an ESM module synchronously
const mod = require("./esm-module.mjs") // Error

// ✅ Use dynamic import (returns a Promise)
const mod = await import("./esm-module.mjs")
```

## W — Why It Matters

- ESM is the **standard** — all modern tooling, frameworks, and runtimes default to it.
- **Tree-shaking** (dead code elimination) only works with ESM — critical for bundle size.
- **Top-level `await`** only works in ESM.
- Understanding the difference prevents `require`/`import` errors in Node.js.
- Most interview questions about modules test ESM vs CJS understanding.

## I — Interview Questions with Answers

### Q1: What is the difference between ESM and CJS?

**A:** ESM (`import`/`export`) is statically analyzed at parse time, supports tree-shaking and top-level `await`, and provides live bindings. CJS (`require`/`module.exports`) is dynamically evaluated at runtime, doesn't support tree-shaking, and exports copied values.

### Q2: What are live bindings?

**A:** ESM exports are live references to the original variable. When the exporting module updates the value, all importing modules see the change. CJS exports are copies — changes in the exporting module aren't reflected.

### Q3: Can you `require()` an ESM module?

**A:** Not synchronously. You must use `await import()` (dynamic import) to load ESM from CJS. ESM can import CJS modules via normal `import` syntax.

### Q4: Why does tree-shaking only work with ESM?

**A:** Because ESM imports/exports are **static** — the bundler knows at compile time exactly which exports are used and can remove unused ones. CJS is dynamic (`require` can be conditional), so the bundler can't safely eliminate anything.

## C — Common Pitfalls with Fix

### Pitfall: Using `require` in an ESM module

```js
// In a "type": "module" project:
const fs = require("fs") // ReferenceError: require is not defined
```

**Fix:** Use `import fs from "fs"` or `import { readFile } from "fs"`.

### Pitfall: Missing file extensions in ESM

```js
import { add } from "./math" // Error in Node.js ESM — no extension!
```

**Fix:** ESM in Node.js requires full file extensions: `import { add } from "./math.js"`. Bundlers (Webpack, Vite) usually handle this for you.

### Pitfall: `__dirname` and `__filename` not available in ESM

```js
// ESM:
console.log(__dirname) // ReferenceError
```

**Fix:**

```js
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

## K — Coding Challenge with Solution

### Challenge

Convert this CJS module to ESM:

```js
// utils.js (CJS)
const DEFAULT_TIMEOUT = 5000

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function retry(fn, attempts = 3) {
  // ... implementation
}

module.exports = { delay, retry, DEFAULT_TIMEOUT }
```

### Solution

```js
// utils.js (ESM)
export const DEFAULT_TIMEOUT = 5000

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry(fn, attempts = 3) {
  // ... implementation
}

// Consumer:
import { delay, retry, DEFAULT_TIMEOUT } from "./utils.js"
```

---

# 6 — Dynamic `import()` & Top-Level `await`

## T — TL;DR

Dynamic `import()` loads modules **at runtime** as Promises, enabling code splitting and conditional loading; top-level `await` lets you use `await` outside of `async` functions in ESM modules.

## K — Key Concepts

### Dynamic `import()`

```js
// Static import — always loaded, parsed at compile time
import { add } from "./math.js"

// Dynamic import — loaded at runtime, returns a Promise
const module = await import("./math.js")
module.add(1, 2) // 3
```

### Conditional Loading

```js
const locale = getUserLocale()

// Only load the translation file that's needed
const translations = await import(`./locales/${locale}.js`)
```

### Lazy Loading (Code Splitting)

```js
button.addEventListener("click", async () => {
  // Only loads the heavy chart library when the user clicks
  const { renderChart } = await import("./chart-library.js")
  renderChart(data)
})
```

Bundlers (Webpack, Vite, Rollup) automatically split dynamic imports into separate chunks.

### Feature Detection

```js
let crypto
try {
  crypto = await import("node:crypto")
} catch {
  console.log("Crypto not available")
}
```

### Default and Named Exports with Dynamic Import

```js
// Named exports
const { add, subtract } = await import("./math.js")

// Default export
const { default: main } = await import("./app.js")
// or
const mod = await import("./app.js")
mod.default()
```

### Top-Level `await`

In ESM modules, you can use `await` at the top level:

```js
// config.js (ESM)
const response = await fetch("/api/config")
export const config = await response.json()

// The module that imports this will wait for it to resolve:
import { config } from "./config.js"
console.log(config) // already resolved
```

### How Top-Level `await` Affects Module Loading

```js
// slow-module.js
await new Promise(resolve => setTimeout(resolve, 5000))
export const value = "ready"

// main.js
import { value } from "./slow-module.js"
// This line doesn't execute until slow-module finishes (5 seconds)
console.log(value) // "ready"
```

**Important:** Top-level `await` blocks the importing module (and its importers) until complete. Use judiciously.

### Requirements

| Feature | Requirements |
|---------|-------------|
| Dynamic `import()` | Any module type (ESM, CJS via bundler, browser) |
| Top-level `await` | ESM only (`"type": "module"` or `.mjs`) |

## W — Why It Matters

- **Code splitting** via dynamic import reduces initial bundle size — critical for web performance.
- **Lazy loading** defers heavy modules until they're needed — faster page loads.
- **Conditional loading** lets you load polyfills or locale-specific code on demand.
- **Top-level `await`** simplifies module initialization that depends on async data.
- React's `React.lazy` and Next.js's `dynamic()` are built on dynamic `import()`.

## I — Interview Questions with Answers

### Q1: What does dynamic `import()` return?

**A:** A `Promise` that resolves to the module's namespace object (containing all exports). Default exports are available as `.default`.

### Q2: What is the main benefit of dynamic import for web apps?

**A:** **Code splitting.** Bundlers automatically create separate chunks for dynamically imported modules, reducing the initial bundle size and improving load time.

### Q3: What are the constraints of top-level `await`?

**A:** Only works in ESM (not CJS). Blocks the importing module and its dependents until the `await` resolves. Can delay application startup if used carelessly.

## C — Common Pitfalls with Fix

### Pitfall: Dynamic import paths must be valid for bundlers

```js
const name = "math"
import(`./${name}.js`) // Bundlers may not be able to analyze this!
```

**Fix:** Keep dynamic import paths as explicit as possible. Use `/* webpackChunkName: "math" */` comments for Webpack.

### Pitfall: Top-level `await` blocking startup

```js
// config.js
const config = await fetch("/api/config").then(r => r.json())
// If the fetch fails or is slow, EVERYTHING that imports this module stalls
```

**Fix:** Add error handling and timeouts. Consider whether the data truly needs to be loaded before the module is available.

### Pitfall: Using dynamic import in CJS without `.then()`

```js
// CJS file
const mod = import("./esm-module.mjs") // This is a Promise!
mod.doSomething // undefined — it's a Promise, not the module
```

**Fix:** `import("./esm-module.mjs").then(mod => mod.doSomething())`.

## K — Coding Challenge with Solution

### Challenge

Create a `loadPlugin(name)` function that dynamically imports a plugin module and calls its `init()` function. Handle missing plugins gracefully.

### Solution

```js
async function loadPlugin(name) {
  try {
    const plugin = await import(`./plugins/${name}.js`)

    if (typeof plugin.init !== "function") {
      console.warn(`Plugin "${name}" has no init() function`)
      return null
    }

    await plugin.init()
    console.log(`Plugin "${name}" loaded successfully`)
    return plugin
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      console.warn(`Plugin "${name}" not found`)
    } else {
      console.error(`Failed to load plugin "${name}":`, error)
    }
    return null
  }
}

// Usage:
await loadPlugin("analytics")
await loadPlugin("nonexistent") // "Plugin "nonexistent" not found"
```

---

# 7 — `globalThis`

## T — TL;DR

`globalThis` is the **universal reference** to the global object across all JavaScript environments — it replaces the environment-specific `window`, `global`, `self`, and `frames`.

## K — Key Concepts

### The Problem Before `globalThis`

```js
// Browser
window.setTimeout(fn, 100)

// Node.js
global.setTimeout(fn, 100)

// Web Worker
self.setTimeout(fn, 100)

// Which one? Depends on the environment!
```

### The Solution

```js
// Works everywhere:
globalThis.setTimeout(fn, 100)

// In browser: globalThis === window
// In Node.js: globalThis === global
// In Web Worker: globalThis === self
```

### Common Use Cases

```js
// Check environment
const isBrowser = typeof globalThis.window !== "undefined"
const isNode = typeof globalThis.process !== "undefined"

// Polyfill a feature
if (!globalThis.structuredClone) {
  globalThis.structuredClone = function (obj) {
    return JSON.parse(JSON.stringify(obj))
  }
}

// Cross-environment globals
globalThis.APP_CONFIG = { debug: true }
```

### Feature Detection

```js
// Check if Web Crypto is available
if (globalThis.crypto?.subtle) {
  // Use Web Crypto API
}

// Check if fetch is available
if (typeof globalThis.fetch === "function") {
  // Use native fetch
} else {
  // Polyfill or use node-fetch
}
```

## W — Why It Matters

- `globalThis` enables truly **universal JavaScript** — code that runs in browsers, Node.js, Deno, workers, etc.
- Libraries and polyfills use `globalThis` to work across environments.
- Replaces the hacky `typeof window !== "undefined" ? window : global` pattern.
- Essential for isomorphic/universal JavaScript applications.

## I — Interview Questions with Answers

### Q1: What is `globalThis`?

**A:** A universal reference to the global object that works in every JavaScript environment. It's `window` in browsers, `global` in Node.js, and `self` in web workers — `globalThis` is the standard, environment-agnostic way to access it.

### Q2: When would you use `globalThis`?

**A:** For feature detection, polyfilling, and writing environment-agnostic code. Example: checking if `crypto.subtle` exists before using the Web Crypto API.

## C — Common Pitfalls with Fix

### Pitfall: Polluting the global namespace

```js
globalThis.myVar = "accessible everywhere" // creates a true global
```

**Fix:** Avoid adding to `globalThis` in application code. Use modules for state. Reserve `globalThis` for polyfills and environment detection.

### Pitfall: Assuming `globalThis` has specific APIs

```js
globalThis.document.querySelector("div") // TypeError in Node.js!
```

**Fix:** Always feature-detect: `if (globalThis.document) { ... }`.

## K — Coding Challenge with Solution

### Challenge

Write a universal `getEnvironment()` function that returns `"browser"`, `"node"`, `"worker"`, or `"unknown"`:

### Solution

```js
function getEnvironment() {
  if (typeof globalThis.window !== "undefined" && typeof globalThis.document !== "undefined") {
    return "browser"
  }
  if (typeof globalThis.process !== "undefined" && globalThis.process.versions?.node) {
    return "node"
  }
  if (typeof globalThis.WorkerGlobalScope !== "undefined") {
    return "worker"
  }
  return "unknown"
}
```

---

# 8 — `Object.hasOwn` & `Array.fromAsync`

## T — TL;DR

`Object.hasOwn` is the modern, safe replacement for `hasOwnProperty`; `Array.fromAsync` converts async iterables to arrays — both are newer APIs that fix long-standing ergonomic issues.

## K — Key Concepts

### `Object.hasOwn` (ES2022)

Replaces `Object.prototype.hasOwnProperty.call()`:

```js
const obj = { name: "Mark" }

// Old ways:
obj.hasOwnProperty("name")                          // true — but can be overridden
Object.prototype.hasOwnProperty.call(obj, "name")   // true — verbose but safe

// Modern way:
Object.hasOwn(obj, "name")     // true ✅
Object.hasOwn(obj, "toString") // false — inherited, not own
```

### Why `Object.hasOwn` Is Better

```js
// Problem 1: hasOwnProperty can be overridden
const obj = { hasOwnProperty: () => false }
obj.hasOwnProperty("hasOwnProperty") // false — wrong!
Object.hasOwn(obj, "hasOwnProperty") // true ✅

// Problem 2: Object.create(null) has no hasOwnProperty
const dict = Object.create(null)
dict.key = "value"
// dict.hasOwnProperty("key") // TypeError!
Object.hasOwn(dict, "key")    // true ✅
```

### `Array.fromAsync` (ES2024)

Like `Array.from` but for async iterables:

```js
// From an async generator
async function* asyncGen() {
  yield 1
  yield 2
  yield 3
}

const arr = await Array.fromAsync(asyncGen())
// [1, 2, 3]

// From an array of Promises
const arr2 = await Array.fromAsync([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
])
// [1, 2, 3]

// With a mapping function
const arr3 = await Array.fromAsync(asyncGen(), x => x * 2)
// [2, 4, 6]
```

### Before `Array.fromAsync`

```js
// You had to do this:
const items = []
for await (const item of asyncIterable) {
  items.push(item)
}
```

Now: `const items = await Array.fromAsync(asyncIterable)`.

## W — Why It Matters

- `Object.hasOwn` is the **recommended** replacement for all `hasOwnProperty` usage.
- It works with `Object.create(null)` — which `hasOwnProperty` doesn't.
- `Array.fromAsync` simplifies the extremely common pattern of collecting async iteration results.
- Both show up in modern codebases and are expected knowledge for current-year JS.

## I — Interview Questions with Answers

### Q1: Why use `Object.hasOwn` over `hasOwnProperty`?

**A:** `Object.hasOwn` is (1) safe with `Object.create(null)` objects (which lack `hasOwnProperty`), (2) can't be overridden on the instance, and (3) is shorter and more readable than `Object.prototype.hasOwnProperty.call()`.

### Q2: What does `Array.fromAsync` do?

**A:** Converts an async iterable (or an iterable of Promises) into a regular array. It's the async version of `Array.from`. It accepts an optional mapping function.

## C — Common Pitfalls with Fix

### Pitfall: Using `in` instead of `hasOwn` when you want own-property check

```js
"toString" in {}              // true — inherited!
Object.hasOwn({}, "toString") // false — own only ✅
```

**Fix:** Use `Object.hasOwn` for own-property checks, `in` for all properties (own + inherited).

### Pitfall: `Array.fromAsync` not available in older environments

```js
Array.fromAsync // undefined in older Node.js versions
```

**Fix:** Check Node.js ≥ 22, or use the `for await` pattern as fallback.

## K — Coding Challenge with Solution

### Challenge

Write a function `ownEntries(obj)` that returns only own-property entries (like `Object.entries` but explicitly using `Object.hasOwn`):

### Solution

```js
function ownEntries(obj) {
  const entries = []
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      entries.push([key, obj[key]])
    }
  }
  return entries
}

const parent = { inherited: true }
const child = Object.create(parent)
child.own = "yes"

ownEntries(child)         // [["own", "yes"]]
Object.entries(child)     // [["own", "yes"]] — same here, but ownEntries is explicit
```

Note: `Object.entries` already only returns own enumerable properties — but understanding WHY (and building it yourself) is the learning point.

---

# 9 — The `Intl` API

## T — TL;DR

The `Intl` (Internationalization) API provides **locale-aware** formatting for dates, numbers, currencies, and string comparison — eliminating the need for heavy formatting libraries.

## K — Key Concepts

### `Intl.NumberFormat` — Number & Currency Formatting

```js
// Basic number formatting
new Intl.NumberFormat("en-US").format(1234567.89)
// "1,234,567.89"

new Intl.NumberFormat("de-DE").format(1234567.89)
// "1.234.567,89"

// Currency
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(9.99)
// "$9.99"

new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
}).format(1500)
// "￥1,500"

// Percentage
new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
}).format(0.856)
// "85.6%"

// Compact notation
new Intl.NumberFormat("en-US", {
  notation: "compact",
}).format(1500000)
// "1.5M"

// Units
new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "kilometer-per-hour",
}).format(120)
// "120 km/h"
```

### `Intl.DateTimeFormat` — Date & Time Formatting

```js
const date = new Date("2026-04-19T14:30:00")

new Intl.DateTimeFormat("en-US").format(date)
// "4/19/2026"

new Intl.DateTimeFormat("en-GB").format(date)
// "19/04/2026"

// With options
new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(date)
// "Sunday, April 19, 2026"

// Time
new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
}).format(date)
// "2:30 PM EDT"

// Relative time
new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "day")
// "yesterday"

new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(2, "hour")
// "in 2 hours"
```

### `Intl.Collator` — Locale-Aware String Comparison

```js
// Default sort — wrong for many languages
["ä", "z", "a"].sort()
// ["a", "z", "ä"] — ä sorted by code point

// Locale-aware sort
["ä", "z", "a"].sort(new Intl.Collator("de").compare)
// ["a", "ä", "z"] — correct German sorting!

// Case-insensitive sorting
const collator = new Intl.Collator("en", { sensitivity: "base" })
collator.compare("café", "CAFE") // 0 (considered equal)
```

### `Intl.PluralRules` — Pluralization

```js
const rules = new Intl.PluralRules("en-US")

rules.select(0)  // "other"
rules.select(1)  // "one"
rules.select(2)  // "other"

// Usage:
function pluralize(count, singular, plural) {
  return rules.select(count) === "one" ? singular : plural
}

pluralize(1, "item", "items") // "item"
pluralize(5, "item", "items") // "items"
```

### `Intl.ListFormat` — List Formatting

```js
new Intl.ListFormat("en", { style: "long", type: "conjunction" })
  .format(["Alice", "Bob", "Charlie"])
// "Alice, Bob, and Charlie"

new Intl.ListFormat("en", { style: "long", type: "disjunction" })
  .format(["cats", "dogs"])
// "cats or dogs"
```

## W — Why It Matters

- Eliminates the need for `moment.js`, `numeral.js`, and similar formatting libraries.
- **Locale-aware** by default — correct formatting for every language.
- Built into every modern runtime — zero bundle size impact.
- Currency, date, and number formatting are in every production application.
- `Intl.Collator` fixes string sorting for internationalized apps.

## I — Interview Questions with Answers

### Q1: How do you format currency in JavaScript without a library?

**A:** `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(9.99)` → `"$9.99"`. The locale determines the formatting style.

### Q2: What is `Intl.Collator` used for?

**A:** Locale-aware string comparison and sorting. Default JavaScript string comparison uses Unicode code points, which produces incorrect results for many languages. `Intl.Collator` sorts according to language rules.

### Q3: What is `Intl.RelativeTimeFormat`?

**A:** Formats relative time descriptions: `.format(-1, "day")` → `"yesterday"`, `.format(2, "hour")` → `"in 2 hours"`.

## C — Common Pitfalls with Fix

### Pitfall: Assuming all users use US format

```js
const price = `$${amount.toFixed(2)}` // wrong for non-US locales
```

**Fix:** `new Intl.NumberFormat(navigator.language, { style: "currency", currency }).format(amount)`.

### Pitfall: Not caching formatters

```js
// ❌ Creates a new formatter every call
function format(n) {
  return new Intl.NumberFormat("en-US").format(n) // expensive to construct
}
```

**Fix:** Cache the formatter:

```js
const formatter = new Intl.NumberFormat("en-US")
function format(n) {
  return formatter.format(n)
}
```

## K — Coding Challenge with Solution

### Challenge

Create a `formatStats(stats, locale)` function:

```js
formatStats({ users: 1500000, revenue: 42500.5, growth: 0.156 }, "en-US")
// "Users: 1.5M | Revenue: $42,500.50 | Growth: 15.6%"
```

### Solution

```js
function formatStats(stats, locale) {
  const compact = new Intl.NumberFormat(locale, { notation: "compact" })
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD" })
  const percent = new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 1 })

  return [
    `Users: ${compact.format(stats.users)}`,
    `Revenue: ${currency.format(stats.revenue)}`,
    `Growth: ${percent.format(stats.growth)}`,
  ].join(" | ")
}

formatStats({ users: 1500000, revenue: 42500.5, growth: 0.156 }, "en-US")
// "Users: 1.5M | Revenue: $42,500.50 | Growth: 15.6%"
```

---

# 10 — ES2024: Array Grouping & `Promise.withResolvers`

## T — TL;DR

ES2024 brings `Object.groupBy` / `Map.groupBy` for declarative array grouping and `Promise.withResolvers` for creating Promises with externally accessible `resolve`/`reject` — both eliminate long-standing boilerplate patterns.

## K — Key Concepts

### `Object.groupBy` (ES2024)

Groups array elements by a classifier function, returning a plain object:

```js
const people = [
  { name: "Mark", role: "dev" },
  { name: "Alex", role: "design" },
  { name: "Jane", role: "dev" },
  { name: "Bob", role: "design" },
]

Object.groupBy(people, person => person.role)
// {
//   dev: [{ name: "Mark", ... }, { name: "Jane", ... }],
//   design: [{ name: "Alex", ... }, { name: "Bob", ... }]
// }
```

### `Map.groupBy` — Group with Any Key Type

```js
const items = [
  { name: "A", size: 10 },
  { name: "B", size: 25 },
  { name: "C", size: 5 },
  { name: "D", size: 30 },
]

const grouped = Map.groupBy(items, item => item.size > 20 ? "large" : "small")
// Map { "small" => [{name: "A"}, {name: "C"}], "large" => [{name: "B"}, {name: "D"}] }

// With non-string keys:
const byRef = Map.groupBy(items, item => item.size > 20)
// Map { false => [...], true => [...] }
```

### Before Array Grouping

```js
// The old reduce pattern:
const grouped = people.reduce((acc, person) => {
  const key = person.role
  acc[key] ??= []
  acc[key].push(person)
  return acc
}, {})
```

`Object.groupBy` replaces this entirely.

### `Promise.withResolvers` (ES2024)

Creates a Promise and exposes `resolve` and `reject` externally:

```js
const { promise, resolve, reject } = Promise.withResolvers()

// Now resolve/reject can be called from anywhere:
setTimeout(() => resolve("done"), 1000)

const result = await promise // "done"
```

### Before `Promise.withResolvers`

```js
// The old deferred pattern:
let resolve, reject
const promise = new Promise((res, rej) => {
  resolve = res
  reject = rej
})
```

`Promise.withResolvers` replaces this boilerplate.

### Use Case: Event-to-Promise Bridge

```js
function waitForEvent(emitter, event) {
  const { promise, resolve, reject } = Promise.withResolvers()

  emitter.addEventListener(event, resolve, { once: true })
  emitter.addEventListener("error", reject, { once: true })

  return promise
}

// Usage:
const result = await waitForEvent(button, "click")
```

### Use Case: External Resolution Pattern

```js
class TaskQueue {
  #pending = new Map()

  enqueue(taskId) {
    const { promise, resolve, reject } = Promise.withResolvers()
    this.#pending.set(taskId, { resolve, reject })
    return promise
  }

  complete(taskId, result) {
    this.#pending.get(taskId)?.resolve(result)
    this.#pending.delete(taskId)
  }

  fail(taskId, error) {
    this.#pending.get(taskId)?.reject(error)
    this.#pending.delete(taskId)
  }
}

const queue = new TaskQueue()

// Consumer:
const result = await queue.enqueue("task-1") // waits...

// Elsewhere:
queue.complete("task-1", { success: true }) // resolves the promise
```

## W — Why It Matters

- `Object.groupBy` eliminates one of the most common `reduce` boilerplate patterns.
- `Map.groupBy` enables grouping with non-string keys (objects, booleans, etc.).
- `Promise.withResolvers` standardizes the "deferred" pattern used in queues, event bridges, and RPC systems.
- Both are available in Node.js 21+ and all modern browsers (2024+).
- Shows awareness of the latest language features in interviews.

## I — Interview Questions with Answers

### Q1: How do you group an array by a property?

**A:** `Object.groupBy(array, item => item.property)`. Returns a plain object with keys from the classifier function and arrays of matching elements as values.

### Q2: What is `Promise.withResolvers`?

**A:** A static method that returns `{ promise, resolve, reject }` — a Promise with externally accessible resolution functions. It replaces the common pattern of capturing `resolve`/`reject` from the Promise constructor callback.

### Q3: When would you use `Map.groupBy` over `Object.groupBy`?

**A:** When you need non-string keys (objects, booleans, numbers). `Object.groupBy` coerces keys to strings; `Map.groupBy` preserves key types.

## C — Common Pitfalls with Fix

### Pitfall: `Object.groupBy` keys are strings

```js
Object.groupBy([1, 2, 3, 4], n => n > 2) // { true: [3, 4], false: [1, 2] }
// Keys are strings "true" and "false"!
```

**Fix:** Use `Map.groupBy` if you need boolean or object keys.

### Pitfall: Not available in older runtimes

```js
Object.groupBy // undefined in Node.js < 21
```

**Fix:** Use the `reduce` pattern as a polyfill or check your runtime version.

## K — Coding Challenge with Solution

### Challenge

Use `Object.groupBy` and `Promise.withResolvers` together: group an array of URLs by domain, then create a deferred Promise for each group's fetch results.

### Solution

```js
function createGroupedFetcher(urls) {
  const grouped = Object.groupBy(urls, url => new URL(url).hostname)
  const results = {}

  for (const [domain, domainUrls] of Object.entries(grouped)) {
    const { promise, resolve } = Promise.withResolvers()
    results[domain] = promise

    // Fetch all URLs for this domain in parallel
    Promise.all(domainUrls.map(url => fetch(url).then(r => r.json())))
      .then(resolve)
  }

  return results
}

// Usage:
const fetchers = createGroupedFetcher([
  "https://api.github.com/users",
  "https://api.github.com/repos",
  "https://jsonplaceholder.typicode.com/posts",
])

const githubData = await fetchers["api.github.com"]
```

---

# 11 — `using` & Explicit Resource Management (Preview)

## T — TL;DR

The `using` keyword (TC39 Stage 3, shipping in V8/TS 5.2+) provides **automatic resource cleanup** when a variable goes out of scope — like `try/finally` but built into the language, using `Symbol.dispose` and `Symbol.asyncDispose`.

## K — Key Concepts

### The Problem: Manual Cleanup

```js
// Without using — manual cleanup
const file = openFile("data.txt")
try {
  const data = file.read()
  process(data)
} finally {
  file.close() // must remember!
}
```

### The Solution: `using`

```js
// With using — automatic cleanup
{
  using file = openFile("data.txt")
  const data = file.read()
  process(data)
} // file[Symbol.dispose]() called automatically
```

### `Symbol.dispose` — Sync Cleanup

```js
class FileHandle {
  #path

  constructor(path) {
    this.#path = path
    console.log(`Opening ${path}`)
  }

  read() {
    return `contents of ${this.#path}`
  }

  [Symbol.dispose]() {
    console.log(`Closing ${this.#path}`)
  }
}

{
  using file = new FileHandle("data.txt")
  console.log(file.read())
}
// Output:
// "Opening data.txt"
// "contents of data.txt"
// "Closing data.txt" — automatic!
```

### `await using` — Async Cleanup

```js
class DatabaseConnection {
  #url

  static async connect(url) {
    const conn = new DatabaseConnection()
    conn.#url = url
    await conn.#open()
    return conn
  }

  async #open() { console.log("Connected") }

  async query(sql) { return [{ id: 1 }] }

  async [Symbol.asyncDispose]() {
    console.log("Disconnecting...")
    // await close logic
  }
}

async function fetchUsers() {
  await using db = await DatabaseConnection.connect("postgres://localhost")
  const users = await db.query("SELECT * FROM users")
  return users
} // db[Symbol.asyncDispose]() called automatically
```

### `DisposableStack` — Manage Multiple Resources

```js
function setupResources() {
  using stack = new DisposableStack()

  const file = stack.use(new FileHandle("data.txt"))
  const lock = stack.use(new FileLock("data.txt"))
  const logger = stack.use(new Logger())

  // Use resources...
  return file.read()
} // All three disposed in reverse order (LIFO)
```

### Multiple `using` Declarations

```js
{
  using a = getResource1()
  using b = getResource2()
  using c = getResource3()
  // ... use all three
} // disposed in reverse: c, b, a
```

### Creating Disposable Wrappers

```js
function disposable(value, cleanup) {
  return {
    ...value,
    [Symbol.dispose]() {
      cleanup(value)
    },
  }
}

// Make an AbortController disposable:
function createDisposableAbort() {
  const controller = new AbortController()
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    [Symbol.dispose]() {
      controller.abort()
    },
  }
}

{
  using ctl = createDisposableAbort()
  fetch("/api/data", { signal: ctl.signal })
} // automatically aborted on exit
```

### Current Support

| Runtime | Support |
|---------|---------|
| TypeScript | 5.2+ (`"lib": ["esnext"]`) |
| V8 / Chrome | Behind flag / shipping |
| Node.js | 20+ (with flag), 22+ (stable) |
| Firefox / Safari | Not yet |

## W — Why It Matters

- `using` eliminates entire classes of resource leak bugs (files, connections, locks, timers).
- It's the JavaScript equivalent of Python's `with`, C#'s `using`, and Rust's `Drop`.
- TypeScript 5.2+ fully supports it — you'll encounter it in modern TS codebases.
- It will become the standard pattern for any resource that needs cleanup.
- **Full mastery is on Day 12** — this is a preview to build familiarity.

## I — Interview Questions with Answers

### Q1: What does the `using` keyword do?

**A:** Declares a variable whose `[Symbol.dispose]()` method is automatically called when the variable goes out of scope. `await using` calls `[Symbol.asyncDispose]()` for async cleanup. It's automatic resource management.

### Q2: What is `Symbol.dispose`?

**A:** A well-known Symbol that defines a cleanup method on an object. When an object with `[Symbol.dispose]()` is declared with `using`, the method is called automatically at the end of the block.

### Q3: How does `using` compare to `try/finally`?

**A:** `using` is equivalent to wrapping the block in `try/finally` with the dispose call in `finally`. But it's more concise, less error-prone, and handles multiple resources cleanly (disposing in reverse order).

## C — Common Pitfalls with Fix

### Pitfall: Forgetting that `using` requires `Symbol.dispose`

```js
using file = fs.openSync("file.txt") // Error — number doesn't have Symbol.dispose
```

**Fix:** Wrap in a disposable object or use a library that returns disposable resources.

### Pitfall: Using `using` without block scope

```js
using file = openFile("data.txt") // works at function level
// but no explicit block means dispose happens at function exit
```

**Fix:** Use explicit blocks `{ ... }` when you want earlier cleanup.

## K — Coding Challenge with Solution

### Challenge

Create a `Timer` class that automatically logs elapsed time when disposed:

```js
{
  using timer = new Timer("operation")
  await heavyWork()
}
// "operation: 1234ms"
```

### Solution

```js
class Timer {
  #label
  #start

  constructor(label) {
    this.#label = label
    this.#start = performance.now()
  }

  [Symbol.dispose]() {
    const elapsed = (performance.now() - this.#start).toFixed(2)
    console.log(`${this.#label}: ${elapsed}ms`)
  }
}

{
  using timer = new Timer("operation")
  // simulate work
  await new Promise(r => setTimeout(r, 500))
}
// "operation: 500.12ms"
```

---

# 12 — Pipeline Operator & Future Proposals (Preview)

## T — TL;DR

The pipeline operator (`|>`) and other Stage 2–3 TC39 proposals are shaping JavaScript's future — understanding them now prepares you for tomorrow's syntax while deepening your grasp of functional patterns.

## K — Key Concepts

### The Pipeline Operator (`|>`) — Stage 2

Chains function calls left-to-right:

```js
// Without pipeline:
const result = capitalize(trim(await fetchName(userId)))

// With pipeline (proposed):
const result = userId
  |> fetchName(%)
  |> await %
  |> trim(%)
  |> capitalize(%)
```

The `%` is the **topic token** — it represents the value from the previous step.

### Why Pipeline Matters

Deeply nested function calls are hard to read:

```js
// Current JS — read inside-out:
console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(data)
        .filter(([k, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    ),
    null,
    2
  )
)

// With pipeline — read top-to-bottom:
data
  |> Object.entries(%)
  |> %.filter(([k, v]) => v != null)
  |> %.map(([k, v]) => [k, String(v)])
  |> Object.fromEntries(%)
  |> JSON.stringify(%, null, 2)
  |> console.log(%)
```

### Current Alternative: Method Chaining or Pipe Utilities

```js
// Utility pipe function (works today)
function pipe(value, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), value)
}

const result = pipe(
  "  Hello World  ",
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/\s+/g, "-"),
)
// "hello-world"
```

### Record & Tuple — Stage 2

Immutable, deeply comparable data structures:

```js
// Record (immutable object)
const record = #{ name: "Mark", age: 30 }
record.name = "Alex" // TypeError — immutable

// Tuple (immutable array)
const tuple = #[1, 2, 3]
tuple.push(4) // TypeError — immutable

// Deep equality by value!
#{ a: 1 } === #{ a: 1 } // true (unlike objects)
#[1, 2] === #[1, 2]     // true (unlike arrays)
```

### Decorator Metadata — Stage 3

```js
function logged(target, context) {
  const name = context.name
  return function (...args) {
    console.log(`Calling ${name}`)
    return target.call(this, ...args)
  }
}

class Service {
  @logged
  fetchData() {
    return "data"
  }
}
```

Decorators are available in TypeScript (Day 10 covers them in detail).

### Pattern Matching — Stage 1

```js
// Proposed:
const result = match(response) {
  when ({ status: 200, body }) -> body,
  when ({ status: 404 }) -> "Not Found",
  when ({ status: 500 }) -> "Server Error",
  default -> "Unknown"
}
```

### TC39 Stage Process

| Stage | Meaning | Stability |
|-------|---------|-----------|
| 0 | Strawperson | Idea only |
| 1 | Proposal | Problem statement accepted |
| 2 | Draft | Initial spec, likely to ship eventually |
| 2.7 | | Spec complete, needs implementations |
| 3 | Candidate | Ready for implementation, spec finalized |
| 4 | Finished | Ships in the next ECMAScript edition |

### What's Safe to Learn Now

| Proposal | Stage | Safe to Use? |
|----------|-------|-------------|
| `using` / resource management | 3 | ✅ In TS 5.2+, V8 |
| Decorators | 3 | ✅ In TS 5.0+ (non-legacy), V8 |
| Pipeline operator | 2 | ❌ Not yet — learn the pattern, not the syntax |
| Record & Tuple | 2 | ❌ Not yet |
| Pattern matching | 1 | ❌ Far from shipping |

## W — Why It Matters

- Knowing the TC39 process shows you understand how JavaScript evolves.
- The pipeline pattern (with or without the operator) is fundamental to functional programming.
- Decorators are already usable in TypeScript (Day 10) and major frameworks.
- Record & Tuple will change how we think about immutability if they ship.
- Staying informed about proposals helps you evaluate libraries and make forward-compatible decisions.

## I — Interview Questions with Answers

### Q1: What is the TC39 process?

**A:** The process by which new features are added to JavaScript. Proposals go through stages 0–4. Stage 3 means the spec is finalized and implementations are in progress. Stage 4 means it's shipping in the next ECMAScript edition.

### Q2: What is the pipeline operator?

**A:** A proposed syntax (`|>`) for chaining function calls left-to-right, improving readability of deeply nested calls. Currently Stage 2. The `%` (topic token) represents the previous step's value.

### Q3: How do you achieve pipeline-like composition today?

**A:** With a `pipe` utility function: `const pipe = (val, ...fns) => fns.reduce((acc, fn) => fn(acc), val)`. This reads top-to-bottom like a pipeline.

### Q4: What are Records and Tuples?

**A:** Proposed immutable data structures (`#{}` and `#[]`) that support **deep value equality** — two Records with the same content are `===`. Currently Stage 2.

## C — Common Pitfalls with Fix

### Pitfall: Using Stage 1-2 proposals in production

```js
// Don't use syntax that hasn't shipped — build tools may drop support
```

**Fix:** Only use Stage 3+ proposals (with transpiler support). For earlier stages, use the pattern (e.g., `pipe()` function) without the syntax.

### Pitfall: Confusing TypeScript decorators with TC39 decorators

TypeScript has two decorator implementations: legacy (`experimentalDecorators`) and TC39 Stage 3 (default in TS 5.0+). They have different semantics.

**Fix:** Use the new TC39-aligned decorators in new projects. Covered in Day 10.

## K — Coding Challenge with Solution

### Challenge

Implement a `pipe()` function and use it to transform data:

```js
const result = pipe(
  "   Hello, World!   ",
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/[^a-z0-9\s]/g, ""),
  s => s.split(/\s+/),
  words => words.join("-"),
)
// "hello-world"
```

### Solution

```js
function pipe(value, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), value)
}

const result = pipe(
  "   Hello, World!   ",
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/[^a-z0-9\s]/g, ""),
  s => s.split(/\s+/),
  words => words.join("-"),
)

console.log(result) // "hello-world"
```

Async version:

```js
async function pipeAsync(value, ...fns) {
  let result = value
  for (const fn of fns) {
    result = await fn(result)
  }
  return result
}

const data = await pipeAsync(
  "/api/users",
  url => fetch(url),
  res => res.json(),
  users => users.filter(u => u.active),
  users => users.map(u => u.name),
)
```

---

# ✅ Day 7 Complete — Phase 1 Finished!

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Iterators & the Iterable Protocol | ✅ T-KWICK |
| 2 | Generators (`function*`) | ✅ T-KWICK |
| 3 | Async Generators & `for await...of` | ✅ T-KWICK |
| 4 | `Symbol` & Well-Known Symbols | ✅ T-KWICK |
| 5 | ESM vs CJS | ✅ T-KWICK |
| 6 | Dynamic `import()` & Top-Level `await` | ✅ T-KWICK |
| 7 | `globalThis` | ✅ T-KWICK |
| 8 | `Object.hasOwn` & `Array.fromAsync` | ✅ T-KWICK |
| 9 | The `Intl` API | ✅ T-KWICK |
| 10 | ES2024: Array Grouping & `Promise.withResolvers` | ✅ T-KWICK |
| 11 | `using` & Explicit Resource Management (Preview) | ✅ T-KWICK |
| 12 | Pipeline Operator & Future Proposals (Preview) | ✅ T-KWICK |

---

## 🎉 Phase 1 Complete — JavaScript Basics to Advanced

You've completed **7 days and 84 subtopics** of deep JavaScript knowledge:

| Day | Topic | Subtopics |
|-----|-------|-----------|
| 1 | Environment & JS Foundations | 12 |
| 2 | Functions, Scope & Hoisting | 12 |
| 3 | Closures, `this`, Prototypes & Metaprogramming | 12 |
| 4 | Arrays, Objects, Strings & Iteration | 12 |
| 5 | Async JavaScript | 12 |
| 6 | Memory, WeakRefs & Advanced Data Structures | 12 |
| 7 | Modern JavaScript | 12 |

You now have the **runtime mental model** that underpins everything in Phase 2 (TypeScript) and beyond.

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 7` | 5 interview-style problems covering all 12 topics |
| `Generate Day 8` | **Phase 2 begins** — TypeScript Foundations |
| `recap Phase 1` | Summary of all 7 days |

> Phase 1 is done. You've built a foundation most developers skip.
> Now the type system goes on top. `Generate Day 8` when ready.