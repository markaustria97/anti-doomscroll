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
