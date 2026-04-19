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
