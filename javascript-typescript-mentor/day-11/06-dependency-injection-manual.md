# 6 — Dependency Injection (Manual)

## T — TL;DR

Dependency Injection (DI) is **passing dependencies to a class from outside** instead of creating them internally — this makes code testable, modular, and follows the Dependency Inversion Principle.

## K — Key Concepts

### Without DI — Tightly Coupled

```ts
class UserService {
  private db = new PostgresDatabase()       // ❌ creates its own dependency
  private mailer = new SendGridMailer()     // ❌ hardcoded implementation
  private logger = new FileLogger()         // ❌ can't swap for testing

  async createUser(data: CreateUserInput) {
    this.logger.log("Creating user...")
    const user = await this.db.insert("users", data)
    await this.mailer.send(user.email, "Welcome!")
    return user
  }
}
// How do you test this without a real database, email service, and file system?
```

### With DI — Constructor Injection

```ts
// Define abstractions:
interface UserRepository {
  create(data: CreateUserInput): Promise<User>
}

interface Mailer {
  send(to: string, body: string): Promise<void>
}

interface Logger {
  log(message: string): void
}

// Inject via constructor:
class UserService {
  constructor(
    private repo: UserRepository,
    private mailer: Mailer,
    private logger: Logger,
  ) {}

  async createUser(data: CreateUserInput) {
    this.logger.log("Creating user...")
    const user = await this.repo.create(data)
    await this.mailer.send(user.email, "Welcome!")
    return user
  }
}
```

### Wiring (Composition Root)

```ts
// production.ts — compose real dependencies
function createProductionApp() {
  const db = new PostgresDatabase(process.env.DATABASE_URL!)
  const repo = new PostgresUserRepository(db)
  const mailer = new SendGridMailer(process.env.SENDGRID_KEY!)
  const logger = new ConsoleLogger()

  const userService = new UserService(repo, mailer, logger)

  return { userService }
}

// test.ts — compose test dependencies
function createTestApp() {
  const repo = new InMemoryUserRepository()
  const mailer = new MockMailer()
  const logger = new NoopLogger()

  const userService = new UserService(repo, mailer, logger)

  return { userService, repo, mailer }
}
```

### Simple DI Container

```ts
class Container {
  #factories = new Map<string, () => unknown>()
  #singletons = new Map<string, unknown>()

  register<T>(token: string, factory: () => T): void {
    this.#factories.set(token, factory)
  }

  singleton<T>(token: string, factory: () => T): void {
    this.register(token, () => {
      if (!this.#singletons.has(token)) {
        this.#singletons.set(token, factory())
      }
      return this.#singletons.get(token)!
    })
  }

  resolve<T>(token: string): T {
    const factory = this.#factories.get(token)
    if (!factory) throw new Error(`No registration for: ${token}`)
    return factory() as T
  }
}

// Usage:
const container = new Container()

container.singleton("logger", () => new ConsoleLogger())
container.singleton("repo", () => new InMemoryUserRepository())
container.register("userService", () =>
  new UserService(
    container.resolve("repo"),
    container.resolve("mailer"),
    container.resolve("logger"),
  )
)

const service = container.resolve<UserService>("userService")
```

### Type-Safe Container with Symbols

```ts
const TOKENS = {
  Logger: Symbol("Logger"),
  UserRepo: Symbol("UserRepo"),
  Mailer: Symbol("Mailer"),
  UserService: Symbol("UserService"),
} as const

class TypedContainer {
  #factories = new Map<symbol, () => unknown>()

  register<T>(token: symbol, factory: () => T): void {
    this.#factories.set(token, factory)
  }

  resolve<T>(token: symbol): T {
    const factory = this.#factories.get(token)
    if (!factory) throw new Error(`Unregistered: ${token.toString()}`)
    return factory() as T
  }
}

const container = new TypedContainer()
container.register<Logger>(TOKENS.Logger, () => new ConsoleLogger())
container.register<UserRepository>(TOKENS.UserRepo, () => new InMemoryUserRepository())

const logger = container.resolve<Logger>(TOKENS.Logger)
```

## W — Why It Matters

- DI is the **foundation** of testable code — you can't properly unit test without it.
- NestJS's entire architecture is built on DI.
- Manual DI (without a framework) is the expected approach in frontend and most Node.js projects.
- The Composition Root pattern organizes all wiring in one place.
- Understanding DI is required for senior engineering roles.

## I — Interview Questions with Answers

### Q1: What is Dependency Injection?

**A:** A technique where a class receives its dependencies from outside (via constructor, parameter, or setter) instead of creating them internally. This decouples the class from specific implementations and enables testing with mocks.

### Q2: What is a Composition Root?

**A:** The single place in your application where all dependencies are wired together. It's usually in the entry point (`main.ts`, `app.ts`). This keeps DI logic centralized and out of business code.

### Q3: Do you need a DI framework?

**A:** Not usually. Manual constructor injection covers most cases. DI frameworks (NestJS, InversifyJS) add value in large applications with complex dependency graphs. For most TypeScript projects, manual wiring is simpler and more transparent.

### Q4: What are the types of injection?

**A:** **Constructor injection** (dependencies passed via constructor — most common), **setter injection** (via methods after construction), and **interface injection** (implements an injector interface). Constructor injection is preferred because dependencies are guaranteed at creation time.

## C — Common Pitfalls with Fix

### Pitfall: Injecting too many dependencies

```ts
class MegaService {
  constructor(
    private repo: UserRepo,
    private mailer: Mailer,
    private logger: Logger,
    private cache: Cache,
    private validator: Validator,
    private notifier: Notifier,
    private metrics: Metrics,
    private config: Config,
  ) {} // 8 dependencies = SRP violation
}
```

**Fix:** If a class needs more than 3-4 dependencies, it likely has too many responsibilities. Split it.

### Pitfall: Service Locator anti-pattern

```ts
class UserService {
  doSomething() {
    const repo = Container.resolve<UserRepo>("repo") // ❌ hidden dependency
  }
}
```

**Fix:** Use constructor injection. Service Locator hides dependencies and makes code harder to test and understand.

## K — Coding Challenge with Solution

### Challenge

Create a `CompositionRoot` that wires an app with `UserService`, `NotificationService`, and shared `Logger`:

### Solution

```ts
interface Logger {
  log(msg: string): void
}

interface UserRepository {
  create(data: { name: string; email: string }): Promise<{ id: string; name: string; email: string }>
}

interface NotificationSender {
  send(to: string, message: string): Promise<void>
}

class ConsoleLogger implements Logger {
  log(msg: string) { console.log(`[${new Date().toISOString()}] ${msg}`) }
}

class InMemoryUserRepo implements UserRepository {
  #users = new Map<string, any>()

  async create(data: { name: string; email: string }) {
    const user = { id: crypto.randomUUID(), ...data }
    this.#users.set(user.id, user)
    return user
  }
}

class ConsoleNotifier implements NotificationSender {
  async send(to: string, message: string) {
    console.log(`📧 To ${to}: ${message}`)
  }
}

class UserService {
  constructor(
    private repo: UserRepository,
    private notifier: NotificationSender,
    private logger: Logger,
  ) {}

  async register(name: string, email: string) {
    this.logger.log(`Registering ${name}`)
    const user = await this.repo.create({ name, email })
    await this.notifier.send(email, `Welcome, ${name}!`)
    this.logger.log(`Registered ${user.id}`)
    return user
  }
}

// Composition Root:
function createApp() {
  const logger = new ConsoleLogger()
  const repo = new InMemoryUserRepo()
  const notifier = new ConsoleNotifier()

  return {
    userService: new UserService(repo, notifier, logger),
  }
}

const app = createApp()
await app.userService.register("Mark", "mark@test.com")
```

---
