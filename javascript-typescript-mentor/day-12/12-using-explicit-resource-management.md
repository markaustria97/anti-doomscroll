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
