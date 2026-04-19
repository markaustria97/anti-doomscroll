# 5 — Generic Classes

## T — TL;DR

Generic classes parameterize the **entire class** with type variables — all methods, properties, and the constructor share the same type context, making type-safe collections, services, and wrappers straightforward.

## K — Key Concepts

### Basic Generic Class

```ts
class Box<T> {
  #value: T

  constructor(value: T) {
    this.#value = value
  }

  getValue(): T {
    return this.#value
  }

  setValue(value: T): void {
    this.#value = value
  }

  map<U>(fn: (value: T) => U): Box<U> {
    return new Box(fn(this.#value))
  }
}

const numBox = new Box(42)         // Box<number>
numBox.getValue()                   // number
numBox.setValue(100)                 // ✅
numBox.setValue("hello")            // ❌ string not assignable to number

const strBox = numBox.map(n => n.toString()) // Box<string>
```

### Generic Stack

```ts
class Stack<T> {
  #items: T[] = []

  push(item: T): void {
    this.#items.push(item)
  }

  pop(): T | undefined {
    return this.#items.pop()
  }

  peek(): T | undefined {
    return this.#items.at(-1)
  }

  isEmpty(): boolean {
    return this.#items.length === 0
  }

  toArray(): readonly T[] {
    return [...this.#items]
  }
}

const stack = new Stack<number>()
stack.push(1)
stack.push(2)
stack.pop() // number | undefined
```

### Generic with Constraints

```ts
class Repository<T extends { id: string }> {
  #items = new Map<string, T>()

  save(item: T): void {
    this.#items.set(item.id, item)
  }

  findById(id: string): T | undefined {
    return this.#items.get(id)
  }

  findAll(): T[] {
    return [...this.#items.values()]
  }

  deleteById(id: string): boolean {
    return this.#items.delete(id)
  }
}

interface User { id: string; name: string }
interface Post { id: string; title: string; body: string }

const userRepo = new Repository<User>()
const postRepo = new Repository<Post>()

userRepo.save({ id: "1", name: "Mark" })
userRepo.findById("1") // User | undefined
```

### Static Members and Generics

Static members **cannot** use the class's type parameter:

```ts
class Container<T> {
  static defaultValue: T // ❌ Static members cannot reference class type parameters
  
  // Static methods can have their own generics:
  static create<U>(value: U): Container<U> {
    return new Container(value)
  }

  constructor(public value: T) {}
}

const c = Container.create("hello") // Container<string>
```

### Extending Generic Classes

```ts
class TimestampedRepository<T extends { id: string }> extends Repository<T> {
  #timestamps = new Map<string, Date>()

  override save(item: T): void {
    super.save(item)
    this.#timestamps.set(item.id, new Date())
  }

  getTimestamp(id: string): Date | undefined {
    return this.#timestamps.get(id)
  }
}
```

## W — Why It Matters

- Generic classes are how you build type-safe **data structures**, **repositories**, and **service layers**.
- `Map<K, V>`, `Set<T>`, `Promise<T>`, `Array<T>` — all generic classes.
- React class components were `Component<Props, State>` — generic classes.
- NestJS, TypeORM, and Angular heavily use generic classes for services and repositories.
- Understanding generic classes is essential for building reusable infrastructure.

## I — Interview Questions with Answers

### Q1: Can static members use the class's generic type?

**A:** No. Static members belong to the class constructor, not instances. Since the generic is per-instance, statics can't reference it. Static methods can define their **own** generic parameters.

### Q2: How do you constrain a generic class?

**A:** `class Repo<T extends Entity>` — the constraint applies to the type parameter and is enforced everywhere T is used within the class.

## C — Common Pitfalls with Fix

### Pitfall: Not constraining enough

```ts
class Repo<T> {
  findById(id: string): T | undefined {
    return this.items.find(item => item.id === id)
    //                             ^^^^^^ Property 'id' doesn't exist on type 'T'
  }
}
```

**Fix:** `class Repo<T extends { id: string }>`.

### Pitfall: Leaking `#private` in generic return types

Private fields can't be accessed outside the class, but types that reference them in return positions cause confusion.

**Fix:** Return interfaces or mapped types rather than the raw class type when exposing generics.

## K — Coding Challenge with Solution

### Challenge

Create a generic `EventEmitter<Events>` class:

```ts
type MyEvents = {
  message: string
  error: { code: number; text: string }
  close: void
}

const emitter = new EventEmitter<MyEvents>()
emitter.on("message", msg => console.log(msg.toUpperCase())) // msg: string
emitter.emit("message", "hello")
emitter.emit("close") // no payload
```

### Solution

```ts
class EventEmitter<Events extends Record<string, unknown>> {
  #handlers = new Map<keyof Events, Set<Function>>()

  on<K extends keyof Events>(
    event: K,
    handler: Events[K] extends void ? () => void : (payload: Events[K]) => void
  ): void {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, new Set())
    }
    this.#handlers.get(event)!.add(handler)
  }

  emit<K extends keyof Events>(
    event: K,
    ...args: Events[K] extends void ? [] : [Events[K]]
  ): void {
    const handlers = this.#handlers.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      (handler as Function)(...args)
    }
  }

  off<K extends keyof Events>(event: K, handler: Function): void {
    this.#handlers.get(event)?.delete(handler)
  }
}
```

The conditional `Events[K] extends void ? [] : [Events[K]]` makes `emit("close")` work with no arguments while `emit("message", "hello")` requires one.

---
