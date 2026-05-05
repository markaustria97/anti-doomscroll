# 9 — Async Iteration: `for await...of`, Async Iterables & Async Generators

## T — TL;DR

`for await...of` iterates async iterables — like streaming responses or paginated APIs — awaiting each value in turn; async generators produce async iterables with `async function*`.

## K — Key Concepts

```js
// for await...of — async iteration protocol
async function processStream(stream) {
  for await (const chunk of stream) {  // awaits each chunk
    process(chunk)
  }
}

// Async iterable — must implement Symbol.asyncIterator
class PaginatedAPI {
  constructor(url) { this.url = url }

  async *[Symbol.asyncIterator]() {    // async generator method
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await fetch(`${this.url}?page=${page}`)
      const { data, next } = await res.json()
      yield* data          // yield each item in data array
      hasMore = !!next
      page++
    }
  }
}

// Usage — transparently paginates
const api = new PaginatedAPI("/api/users")
for await (const user of api) {
  console.log(user.name)  // processes each user, page by page
}

// Async generator function
async function* countdown(from) {
  for (let i = from; i >= 0; i--) {
    await sleep(1000)
    yield i
  }
}

for await (const n of countdown(3)) {
  console.log(n)  // 3, 2, 1, 0 — one per second
}

// Node.js readable streams are async iterables (Node 12+)
const fs = require("fs")
async function readLines(path) {
  const stream = fs.createReadStream(path, { encoding: "utf8" })
  for await (const chunk of stream) {
    console.log(chunk)
  }
}

// Convert async iterable to array
async function collectAll(asyncIterable) {
  const results = []
  for await (const item of asyncIterable) results.push(item)
  return results
}
```


## W — Why It Matters

`for await...of` is essential for streaming data (large file reads, WebSocket messages, streaming APIs). Node.js readable streams, ReadableStream (Fetch API), and EventEmitter-based async iterables all use this protocol. It's increasingly the idiomatic way to handle backpressure-aware data flows.

## I — Interview Q&A

**Q: What's the difference between `Symbol.iterator` and `Symbol.asyncIterator`?**
A: `Symbol.iterator` returns a synchronous iterator — `next()` returns `{ value, done }` directly. `Symbol.asyncIterator` returns an async iterator — `next()` returns a **Promise** of `{ value, done }`. Use `for await...of` with the latter.

**Q: What does `yield*` do in an async generator?**
A: It delegates iteration to another iterable (sync or async), yielding each value from it. `yield* data` where `data` is an array yields each element individually without a loop.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `for...of` instead of `for await...of` on async iterables | Always use `for await...of` for async iterators |
| `for await...of` outside an `async` function | Must be inside an `async` function or top-level ESM |
| Not handling errors inside `for await...of` | Wrap in `try/catch` — rejection in the iterable propagates |

## K — Coding Challenge

**Write an async generator that yields lines from a large text, one by one:**

```js
for await (const line of readLines("huge.txt")) {
  processLine(line)
}
```

**Solution:**

```js
async function* readLines(filename) {
  const { createInterface } = await import("readline")
  const { createReadStream } = await import("fs")

  const rl = createInterface({
    input: createReadStream(filename),
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    yield line
  }
}
```


***
