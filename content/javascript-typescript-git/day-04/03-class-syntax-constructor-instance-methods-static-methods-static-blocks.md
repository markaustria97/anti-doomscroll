# 3 — Class Syntax: Constructor, Instance Methods, Static Methods & Static Blocks

## T — TL;DR

`class` is syntactic sugar over constructor functions and prototypes — it's cleaner, enforces `new`, and adds static blocks for complex one-time initialization.

## K — Key Concepts

```js
class Animal {
  // Static block — runs once when class is evaluated (ES2022)
  static {
    console.log("Animal class initialized")
    Animal.defaultSound = "..."
  }

  // Instance method — lives on Animal.prototype
  constructor(name, sound) {
    this.name = name      // instance property
    this.sound = sound
  }

  // Instance methods — defined on prototype (shared across instances)
  speak() {
    return `${this.name} says ${this.sound}`
  }

  toString() {
    return `Animal(${this.name})`
  }

  // Static method — called on the class, not the instance
  static create(name, sound) {
    return new Animal(name, sound)
  }

  // Static property
  static kingdom = "Animalia"
}

const cat = new Animal("Cat", "Meow")
cat.speak()                  // "Cat says Meow"
Animal.create("Dog", "Woof") // static method
Animal.kingdom               // "Animalia"
cat.kingdom                  // undefined — static, not on instance

// Verifying class is just prototype sugar
Animal.prototype.speak  // the speak function — it's on the prototype
typeof Animal           // "function" — class is a function under the hood

// Static block use case: complex initialization
class Config {
  static defaults
  static {
    // Can run try/catch, loops, etc.
    try {
      Config.defaults = JSON.parse(process.env.CONFIG || "{}")
    } catch {
      Config.defaults = {}
    }
  }
}
```


## W — Why It Matters

Static methods and properties are used for factory methods, utility namespacing, and class-level caches. Static blocks solve the problem of initialization code that's too complex for a single expression — used in polyfills and framework internals.[^1]

## I — Interview Q&A

**Q: What's the difference between an instance method and a static method?**
A: Instance methods live on the prototype and are called on instances (`obj.method()`). Static methods live directly on the class and are called on the class itself (`Class.method()`). Static methods don't have access to instance state via `this`.

**Q: Is `class` truly just syntactic sugar?**
A: Mostly yes — it compiles to constructor functions + prototype methods. But classes add real differences: they're not hoisted (in the TDZ), they always run in strict mode, and calling them without `new` throws a TypeError. Private fields (`#`) also cannot be replicated with constructor functions.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Accessing static property on instance | Use `ClassName.prop` or `this.constructor.prop` |
| Calling a class without `new` | Classes enforce `new` — will throw TypeError |
| Defining methods in constructor (`this.fn = fn`) | Creates a new function per instance — use prototype methods |
| Static block referencing instance state | Static blocks run once — no instance available yet |

## K — Coding Challenge

**Build a `Registry` class with a static instance store and a factory method:**

```js
const a = Registry.getOrCreate("alice")
const b = Registry.getOrCreate("alice")
a === b  // true — same instance returned
```

**Solution:**

```js
class Registry {
  static #store = new Map()

  constructor(key) {
    this.key = key
  }

  static getOrCreate(key) {
    if (!Registry.#store.has(key)) {
      Registry.#store.set(key, new Registry(key))
    }
    return Registry.#store.get(key)
  }
}
```


***
