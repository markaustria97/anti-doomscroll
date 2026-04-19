# 12 — TypeScript Class Features

## T — TL;DR

TypeScript adds access modifiers (`public`/`private`/`protected`/`readonly`), abstract classes, constructor shorthand, and `override` to JavaScript classes — providing compile-time encapsulation and contract enforcement.

## K — Key Concepts

### Access Modifiers

```ts
class User {
  public name: string       // accessible everywhere (default)
  private password: string  // only inside this class
  protected email: string   // inside this class and subclasses
  readonly id: string       // can't be changed after construction

  constructor(name: string, password: string, email: string, id: string) {
    this.name = name
    this.password = password
    this.email = email
    this.id = id
  }
}

const user = new User("Mark", "secret", "mark@test.com", "1")

user.name       // ✅ public
user.password   // ❌ Property 'password' is private
user.email      // ❌ Property 'email' is protected
user.id = "2"   // ❌ Cannot assign to 'id' because it is read-only
```

**Important:** `private` and `protected` are **compile-time only**. At runtime, the properties are accessible. Use JavaScript's `#private` fields for true runtime encapsulation.

### TypeScript `private` vs JavaScript `#private`

```ts
class Example {
  private tsPrivate = "compile-time only"
  #jsPrivate = "true runtime private"
}

const ex = new Example()
// @ts-expect-error — TS blocks access at compile time
ex.tsPrivate // ❌ compile error — but (ex as any).tsPrivate works at runtime!

ex.#jsPrivate // ❌ both compile AND runtime error
```

**Recommendation:** Use `#private` for true privacy. Use TS `private` when you need runtime access in tests or when `#private` is unavailable.

### Constructor Shorthand (Parameter Properties)

```ts
// Long form:
class User {
  public name: string
  private age: number

  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}

// Shorthand — equivalent:
class User {
  constructor(
    public name: string,
    private age: number,
  ) {}
  // Properties are automatically declared AND assigned
}
```

Adding `public`, `private`, `protected`, or `readonly` to a constructor parameter **automatically**:
1. Declares the property
2. Assigns the argument to it

### `readonly` Properties

```ts
class Config {
  constructor(
    readonly host: string,
    readonly port: number,
  ) {}
}

const config = new Config("localhost", 3000)
config.host = "remote" // ❌ Cannot assign to 'host' because it is read-only
```

### Abstract Classes

```ts
abstract class Shape {
  abstract area(): number    // must be implemented by subclasses
  abstract perimeter(): number

  // Can have concrete methods too:
  describe(): string {
    return `Area: ${this.area()}, Perimeter: ${this.perimeter()}`
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super()
  }

  area(): number {
    return Math.PI * this.radius ** 2
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius
  }
}

// const shape = new Shape() // ❌ Cannot create an instance of an abstract class
const circle = new Circle(5)
circle.describe() // "Area: 78.54, Perimeter: 31.42"
```

### `override` Keyword (TS 4.3+)

```ts
class Base {
  greet() {
    return "Hello"
  }
}

class Derived extends Base {
  override greet() { // explicitly marks this as overriding a parent method
    return "Hi"
  }

  override nonExistent() { // ❌ This member cannot have an 'override' modifier
    return "oops"          //    because it is not declared in the base class
  }
}
```

With `"noImplicitOverride": true` in tsconfig, ALL overrides MUST use the `override` keyword.

### Implements (Interface Contracts)

```ts
interface Serializable {
  serialize(): string
  deserialize(data: string): void
}

class User implements Serializable {
  constructor(public name: string) {}

  serialize(): string {
    return JSON.stringify({ name: this.name })
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data)
    this.name = parsed.name
  }
}

// A class can implement multiple interfaces:
class Admin implements Serializable, Printable { /* ... */ }
```

### `implements` vs `extends`

```ts
// extends → inheritance (one parent, includes implementation)
class Admin extends User { /* inherits User's code */ }

// implements → contract (no code inherited, must implement everything)
class Admin implements Serializable { /* must write all methods */ }

// Can combine:
class Admin extends User implements Serializable, Loggable {}
```

### Static Members

```ts
class Counter {
  static count = 0

  static increment() {
    Counter.count++
  }

  static reset() {
    Counter.count = 0
  }
}

Counter.increment()
Counter.increment()
console.log(Counter.count) // 2
```

### Generic Classes

```ts
class Stack<T> {
  #items: T[] = []

  push(item: T) {
    this.#items.push(item)
  }

  pop(): T | undefined {
    return this.#items.pop()
  }

  peek(): T | undefined {
    return this.#items.at(-1)
  }

  get size(): number {
    return this.#items.length
  }
}

const numStack = new Stack<number>()
numStack.push(1)
numStack.push(2)
numStack.pop() // number | undefined

const strStack = new Stack<string>()
strStack.push("hello")
```

## W — Why It Matters

- Access modifiers are used in every OOP TypeScript codebase (Angular, NestJS).
- Constructor shorthand reduces boilerplate dramatically.
- Abstract classes define contracts that subclasses must follow.
- `override` prevents silent bugs when parent methods are renamed.
- `implements` ensures classes conform to interfaces — used in Dependency Injection (Day 11).
- Generic classes are the foundation for typed collections, services, and repositories.

## I — Interview Questions with Answers

### Q1: What is the difference between `private` and `#private`?

**A:** TypeScript's `private` is compile-time only — at runtime, the property is accessible. JavaScript's `#private` is enforced at both compile-time and runtime — truly private. Use `#private` when possible; `private` for compatibility or test access.

### Q2: What does the `override` keyword do?

**A:** Explicitly marks a method as overriding a parent class method. With `noImplicitOverride` enabled, all overrides MUST use `override`. If the parent method doesn't exist, TypeScript errors — preventing bugs from typos or parent class changes.

### Q3: What is an abstract class?

**A:** A class that can't be instantiated directly. It defines abstract methods (no implementation) that subclasses must implement, and can also have concrete methods with shared implementation. It's a contract + shared code.

### Q4: What is constructor shorthand?

**A:** Adding `public`, `private`, `protected`, or `readonly` before a constructor parameter automatically declares it as a property and assigns the argument. Reduces boilerplate from 6+ lines to 1.

## C — Common Pitfalls with Fix

### Pitfall: Thinking TS `private` is truly private

```ts
class Secret {
  private key = "abc123"
}

const s = new Secret()
console.log((s as any).key) // "abc123" — accessible at runtime!
```

**Fix:** Use `#key` for true privacy.

### Pitfall: Forgetting to call `super()` in subclass constructors

```ts
class Base {
  constructor(public name: string) {}
}

class Child extends Base {
  constructor(name: string, public age: number) {
    // Must call super() before accessing `this`
    super(name)
  }
}
```

### Pitfall: `strictPropertyInitialization` errors

```ts
class User {
  name: string // ❌ Property 'name' has no initializer
}
```

**Fix:** Initialize in constructor, use `!` (definite assignment), or make optional:

```ts
class User {
  name: string
  constructor(name: string) { this.name = name } // ✅

  // Or:
  name!: string // ✅ "I'll set this later, trust me"

  // Or:
  name?: string // ✅ optional
}
```

## K — Coding Challenge with Solution

### Challenge

Create an abstract `Repository<T>` class with:
- Abstract `findById(id: string): T | undefined`
- Abstract `save(item: T): void`
- Concrete `exists(id: string): boolean` (uses `findById`)

Then implement `UserRepository`:

### Solution

```ts
interface Entity {
  id: string
}

abstract class Repository<T extends Entity> {
  abstract findById(id: string): T | undefined
  abstract save(item: T): void

  exists(id: string): boolean {
    return this.findById(id) !== undefined
  }
}

interface User extends Entity {
  name: string
  email: string
}

class UserRepository extends Repository<User> {
  #users = new Map<string, User>()

  findById(id: string): User | undefined {
    return this.#users.get(id)
  }

  save(user: User): void {
    this.#users.set(user.id, user)
  }
}

const repo = new UserRepository()
repo.save({ id: "1", name: "Mark", email: "mark@test.com" })

repo.exists("1") // true — uses abstract findById internally
repo.exists("2") // false
repo.findById("1") // { id: "1", name: "Mark", email: "mark@test.com" }
```

This is a preview of the Repository pattern covered in depth on Day 11.

---

# ✅ Day 8 Complete — Phase 2 Begins!

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Why TypeScript & How It Works | ✅ T-KWICK |
| 2 | `tsconfig.json` & Strict Mode | ✅ T-KWICK |
| 3 | Type Inference | ✅ T-KWICK |
| 4 | Primitive Types & Special Types (`any`/`unknown`/`never`/`void`) | ✅ T-KWICK |
| 5 | `type` vs `interface` | ✅ T-KWICK |
| 6 | Union & Intersection Types | ✅ T-KWICK |
| 7 | Literal Types & `as const` | ✅ T-KWICK |
| 8 | Tuples | ✅ T-KWICK |
| 9 | Enums vs Union Types | ✅ T-KWICK |
| 10 | Type Assertions & Index Signatures | ✅ T-KWICK |
| 11 | Type Narrowing (`typeof`/`in`/`instanceof`) | ✅ T-KWICK |
| 12 | TypeScript Class Features | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 8` | 5 interview-style problems covering all 12 topics |
| `Generate Day 9` | Generics & Utility Types |
| `next topic` | Start Day 9's first subtopic |
| `recap` | Quick Day 8 summary |

> The type system is now your tool. Tomorrow, generics make it powerful.
