# 7 — Singleton Pattern

## T — TL;DR

A Singleton ensures a class has exactly **one instance** throughout the application — useful for shared resources like configuration, connection pools, and loggers, but easily overused.

## K — Key Concepts

### Class-Based Singleton

```ts
class Config {
  static #instance: Config | null = null

  readonly port: number
  readonly host: string
  readonly debug: boolean

  private constructor() {
    this.port = Number(process.env.PORT) || 3000
    this.host = process.env.HOST || "localhost"
    this.debug = process.env.DEBUG === "true"
  }

  static getInstance(): Config {
    if (!Config.#instance) {
      Config.#instance = new Config()
    }
    return Config.#instance
  }

  // For testing:
  static resetInstance(): void {
    Config.#instance = null
  }
}

const config = Config.getInstance()
const same = Config.getInstance()
config === same // true — same instance
```

### Module-Level Singleton (Simpler)

```ts
// config.ts
class Config {
  readonly port: number
  readonly host: string

  constructor() {
    this.port = Number(process.env.PORT) || 3000
    this.host = process.env.HOST || "localhost"
  }
}

// Module system ensures this runs once:
export const config = new Config()

// Every import gets the same instance:
import { config } from "./config" // always the same object
```

ES modules are **singletons by default** — the module is evaluated once and cached.

### Lazy Singleton with Closure

```ts
function createDatabasePool() {
  let pool: DatabasePool | null = null

  return {
    getPool(): DatabasePool {
      if (!pool) {
        pool = new DatabasePool({
          connectionString: process.env.DATABASE_URL!,
          maxConnections: 10,
        })
        console.log("Database pool created")
      }
      return pool
    },

    async destroy(): Promise<void> {
      if (pool) {
        await pool.end()
        pool = null
      }
    },
  }
}

export const database = createDatabasePool()

// Usage:
const pool = database.getPool() // creates on first call
const same = database.getPool() // returns cached instance
```

### When Singleton Is Appropriate

| ✅ Good Use Cases | ❌ Bad Use Cases |
|---|---|
| Configuration | Business services |
| Connection pools | Repositories |
| Logger instances | Anything that holds request-specific state |
| Feature flag cache | Objects you need to test in isolation |

## W — Why It Matters

- Singletons prevent **duplicate expensive resources** (connection pools, config parsing).
- ES module caching is the simplest Singleton implementation in JavaScript.
- Understanding when NOT to use Singleton is more important than knowing the pattern.
- Overusing Singletons creates hidden global state — the #1 cause of untestable code.
- Interviewers specifically test whether you understand Singleton's tradeoffs.

## I — Interview Questions with Answers

### Q1: What is the Singleton pattern?

**A:** A creational pattern that ensures a class has exactly one instance and provides a global access point. In TypeScript, it's implemented via a static `getInstance()` method with a private constructor, or simply by exporting a module-level instance.

### Q2: Why are Singletons controversial?

**A:** They introduce **hidden global state**, making code harder to test (can't swap the instance), harder to reason about (shared mutable state), and tightly coupled (everything depends on the Singleton). They often mask design problems that DI would solve better.

### Q3: What's the simplest Singleton in JavaScript/TypeScript?

**A:** A module-level export: `export const logger = new Logger()`. ES modules are evaluated once and cached — every import gets the same instance.

## C — Common Pitfalls with Fix

### Pitfall: Singleton holding request-scoped data

```ts
class RequestContext {
  static instance = new RequestContext()
  userId?: string // ❌ shared across ALL requests in a server!
}
```

**Fix:** Use request-scoped objects (middleware context), not Singletons, for per-request data.

### Pitfall: Singleton preventing testing

```ts
class UserService {
  async getUser() {
    return Config.getInstance().apiUrl // ❌ can't mock Config
  }
}
```

**Fix:** Inject Config: `constructor(private config: Config)`. Use Singleton only at the Composition Root.

## K — Coding Challenge with Solution

### Challenge

Create a `ConnectionManager` singleton that lazily creates database connections and supports graceful shutdown:

### Solution

```ts
interface Connection {
  query(sql: string): Promise<unknown[]>
  close(): Promise<void>
}

class ConnectionManager {
  static #instance: ConnectionManager | null = null
  #connection: Connection | null = null

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.#instance) {
      ConnectionManager.#instance = new ConnectionManager()
    }
    return ConnectionManager.#instance
  }

  async getConnection(): Promise<Connection> {
    if (!this.#connection) {
      this.#connection = await this.#createConnection()
    }
    return this.#connection
  }

  async shutdown(): Promise<void> {
    if (this.#connection) {
      await this.#connection.close()
      this.#connection = null
    }
  }

  async #createConnection(): Promise<Connection> {
    console.log("Creating new database connection...")
    // Simulate connection setup
    return {
      async query(sql: string) {
        console.log(`Executing: ${sql}`)
        return []
      },
      async close() {
        console.log("Connection closed")
      },
    }
  }

  // For testing:
  static resetInstance(): void {
    ConnectionManager.#instance = null
  }
}
```

---
