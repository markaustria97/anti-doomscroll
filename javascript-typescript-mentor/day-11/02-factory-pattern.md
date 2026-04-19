# 2 — Factory Pattern

## T — TL;DR

A Factory encapsulates **object creation logic** behind a function or class — the caller specifies *what* to create, the factory handles *how*, enabling complex construction, type safety, and swappable implementations.

## K — Key Concepts

### Simple Factory Function

```ts
interface Logger {
  log(message: string): void
  error(message: string): void
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(`[LOG] ${message}`) }
  error(message: string) { console.error(`[ERROR] ${message}`) }
}

class FileLogger implements Logger {
  log(message: string) { /* write to file */ }
  error(message: string) { /* write to file */ }
}

class RemoteLogger implements Logger {
  log(message: string) { /* send to logging service */ }
  error(message: string) { /* send to logging service */ }
}

// Factory function:
type LoggerType = "console" | "file" | "remote"

function createLogger(type: LoggerType): Logger {
  switch (type) {
    case "console": return new ConsoleLogger()
    case "file": return new FileLogger()
    case "remote": return new RemoteLogger()
  }
}

const logger = createLogger("console")
logger.log("Hello") // [LOG] Hello
```

### Type-Safe Factory with Discriminated Config

```ts
type DatabaseConfig =
  | { type: "postgres"; connectionString: string; ssl: boolean }
  | { type: "sqlite"; filename: string }
  | { type: "memory" }

interface Database {
  query(sql: string): Promise<unknown[]>
  close(): Promise<void>
}

function createDatabase(config: DatabaseConfig): Database {
  switch (config.type) {
    case "postgres":
      return new PostgresDatabase(config.connectionString, config.ssl)
    case "sqlite":
      return new SqliteDatabase(config.filename)
    case "memory":
      return new InMemoryDatabase()
  }
}

// TypeScript narrows config in each case — fully type-safe
const db = createDatabase({ type: "postgres", connectionString: "...", ssl: true })
```

### Factory with Registration

```ts
class ServiceFactory {
  #creators = new Map<string, () => unknown>()

  register<T>(name: string, creator: () => T): void {
    this.#creators.set(name, creator)
  }

  create<T>(name: string): T {
    const creator = this.#creators.get(name)
    if (!creator) throw new Error(`Unknown service: ${name}`)
    return creator() as T
  }
}

const factory = new ServiceFactory()
factory.register("logger", () => new ConsoleLogger())
factory.register("cache", () => new InMemoryCache())

const logger = factory.create<Logger>("logger")
```

### Generic Factory

```ts
interface Entity { id: string }

function createEntityFactory<T extends Entity>(
  defaults: Omit<T, "id">,
) {
  return (overrides?: Partial<Omit<T, "id">>): T => {
    return {
      id: crypto.randomUUID(),
      ...defaults,
      ...overrides,
    } as T
  }
}

interface User extends Entity {
  name: string
  email: string
  role: "admin" | "user"
}

const createUser = createEntityFactory<User>({
  name: "",
  email: "",
  role: "user",
})

const user = createUser({ name: "Mark", email: "mark@test.com" })
// { id: "uuid...", name: "Mark", email: "mark@test.com", role: "user" }
```

### Factory for Testing

```ts
// Test factory — creates valid entities with minimal input
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    name: "Test User",
    email: "test@example.com",
    role: "user",
    createdAt: new Date(),
    ...overrides,
  }
}

// In tests:
const admin = createTestUser({ role: "admin" })
const specificUser = createTestUser({ name: "Mark", email: "mark@test.com" })
```

This is one of the most valuable patterns for testing.

## W — Why It Matters

- Factories centralize complex creation logic — constructors stay simple.
- **Test factories** are used in every professional codebase for generating test data.
- Discriminated config + factory is the standard pattern for database, cache, and logger initialization.
- Factories implement OCP — add new types without modifying the consumer.
- React's `createElement`, Prisma's `createClient`, and Express's `createServer` are all factories.

## I — Interview Questions with Answers

### Q1: What is the Factory pattern?

**A:** A creational pattern that encapsulates object creation behind a function or class. The caller specifies what to create (via type, config, or discriminant), and the factory handles the construction details. This decouples creation from usage.

### Q2: When should you use a Factory?

**A:** When creation logic is complex (conditional types, configuration, initialization steps), when you need to swap implementations (testing, environments), or when construction requires dependencies the caller shouldn't know about.

### Q3: What is a Factory Function vs Abstract Factory?

**A:** A factory function is a simple function that returns instances. An abstract factory is a class/interface that creates families of related objects. In TypeScript, factory functions with discriminated unions cover most use cases.

## C — Common Pitfalls with Fix

### Pitfall: Factory with too many string-based types

```ts
function create(type: string): unknown { /* ... */ }
create("usre") // typo — no error
```

**Fix:** Use discriminated unions or literal types: `type: "postgres" | "sqlite" | "memory"`.

### Pitfall: Factory that knows too much

```ts
function createService() {
  const db = new PostgresDatabase(process.env.DB_URL!)
  const cache = new RedisCache(process.env.REDIS_URL!)
  const logger = new FileLogger("/var/log/app.log")
  return new UserService(db, cache, logger)
  // Factory is wiring everything — this is DI's job
}
```

**Fix:** Keep factories focused on one type. Use dependency injection for wiring (topic 6).

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `createNotification` factory:

```ts
type NotificationConfig =
  | { channel: "email"; to: string; subject: string; body: string }
  | { channel: "sms"; phone: string; message: string }
  | { channel: "push"; deviceId: string; title: string; body: string }

// Factory should return the right notification type
const email = createNotification({ channel: "email", to: "a@b.com", subject: "Hi", body: "Hello" })
email.send() // sends email
```

### Solution

```ts
interface Notification {
  send(): Promise<void>
}

class EmailNotification implements Notification {
  constructor(
    private to: string,
    private subject: string,
    private body: string,
  ) {}

  async send() {
    console.log(`Email to ${this.to}: ${this.subject}`)
  }
}

class SmsNotification implements Notification {
  constructor(private phone: string, private message: string) {}

  async send() {
    console.log(`SMS to ${this.phone}: ${this.message}`)
  }
}

class PushNotification implements Notification {
  constructor(
    private deviceId: string,
    private title: string,
    private body: string,
  ) {}

  async send() {
    console.log(`Push to ${this.deviceId}: ${this.title}`)
  }
}

type NotificationConfig =
  | { channel: "email"; to: string; subject: string; body: string }
  | { channel: "sms"; phone: string; message: string }
  | { channel: "push"; deviceId: string; title: string; body: string }

function createNotification(config: NotificationConfig): Notification {
  switch (config.channel) {
    case "email":
      return new EmailNotification(config.to, config.subject, config.body)
    case "sms":
      return new SmsNotification(config.phone, config.message)
    case "push":
      return new PushNotification(config.deviceId, config.title, config.body)
  }
}
```

---
