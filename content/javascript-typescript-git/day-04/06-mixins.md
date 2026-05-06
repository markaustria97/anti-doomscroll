# 6 — Mixins

## T — TL;DR

Mixins add reusable behavior to classes without inheritance — solving the "diamond problem" by composing capabilities rather than building deep hierarchies.

## K — Key Concepts

```js
// Mixin pattern — a function that takes a class and returns an extended class
const Serializable = (Base) => class extends Base {
  serialize() {
    return JSON.stringify(this)
  }
  static deserialize(json) {
    return Object.assign(new this(), JSON.parse(json))
  }
}

const Timestamped = (Base) => class extends Base {
  constructor(...args) {
    super(...args)
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
  touch() {
    this.updatedAt = new Date()
  }
}

const Validatable = (Base) => class extends Base {
  validate() {
    for (const [key, val] of Object.entries(this)) {
      if (val === null || val === undefined) {
        throw new Error(`Invalid: ${key} is required`)
      }
    }
    return true
  }
}

// Base class
class User {
  constructor(name, email) {
    this.name = name
    this.email = email
  }
}

// Apply multiple mixins
class EnhancedUser extends Serializable(Timestamped(Validatable(User))) {}

const u = new EnhancedUser("Alice", "alice@example.com")
u.createdAt         // Date — from Timestamped
u.validate()        // true — from Validatable
u.serialize()       // JSON string — from Serializable
u instanceof User   // true — base class preserved
```


## W — Why It Matters

Deep inheritance chains are fragile — changing a base class breaks all subclasses. Mixins compose behavior horizontally. React `HOC` (Higher-Order Components), Vue `mixins`, and many framework utilities use this pattern. It's the JS answer to multiple inheritance.

## I — Interview Q&A

**Q: What problem do mixins solve that inheritance doesn't?**
A: JS only allows single inheritance. Mixins let you add multiple independent behaviors (logging, serialization, validation) to any class without creating a hierarchy. They avoid the "diamond problem" and keep each behavior isolated and reusable.

**Q: What's the difference between a mixin and a base class?**
A: A base class defines what an object IS (`Animal → Dog`). A mixin adds what an object CAN DO (`Serializable`, `Loggable`) regardless of type. Mixins are composable capabilities; base classes are identity.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mixin methods colliding with class methods | Document mixin API surface and prefix if needed |
| `instanceof` not working for mixin behavior | Mixins don't create class identity — use duck typing |
| State in mixins colliding across instances | Keep mixin state in closures or prefixed properties |
| Deep mixin stacking causing call stack issues | Keep chains shallow; prefer composition over stacking |

## K — Coding Challenge

**Create a `Loggable` mixin that logs every method call with its name and arguments:**

```js
class Api extends Loggable(Base) {}
const api = new Api()
api.fetch("users")  // logs: "[fetch] called with: users"
```

**Solution:**

```js
const Loggable = (Base) => class extends Base {
  constructor(...args) {
    super(...args)
    return new Proxy(this, {
      get(target, prop) {
        const val = target[prop]
        if (typeof val === "function") {
          return function(...args) {
            console.log(`[${prop}] called with:`, ...args)
            return val.apply(target, args)
          }
        }
        return val
      }
    })
  }
}
```


***
