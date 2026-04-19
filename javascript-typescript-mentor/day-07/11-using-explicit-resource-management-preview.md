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
