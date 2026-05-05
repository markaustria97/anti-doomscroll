# 5 — `extends`, `super`, Inheritance & Overriding

## T — TL;DR

`extends` wires up the prototype chain; `super()` must be called in subclass constructors before `this`; override methods by redefining them and call the parent with `super.method()`.

## K — Key Concepts

```js
class Animal {
  constructor(name) {
    this.name = name
  }
  speak() {
    return `${this.name} makes a sound`
  }
  toString() {
    return `[Animal: ${this.name}]`
  }
}

class Dog extends Animal {
  #tricks = []

  constructor(name, breed) {
    super(name)         // ⚠️ MUST call super() before `this`
    this.breed = breed  // `this` only accessible after super()
  }

  // Override — replaces Animal.speak
  speak() {
    return `${this.name} barks`
  }

  // Call parent method + extend
  describe() {
    return `${super.toString()} (${this.breed})`
    // uses Animal.toString, then appends breed
  }

  learn(trick) {
    this.#tricks.push(trick)
  }

  get tricks() { return [...this.#tricks] }
}

const rex = new Dog("Rex", "Labrador")
rex.speak()          // "Rex barks" — overridden
rex.describe()       // "[Animal: Rex] (Labrador)" — super used
rex.learn("sit")
rex.tricks           // ["sit"]

// Prototype chain check
rex instanceof Dog     // true
rex instanceof Animal  // true — chain goes through both

// Static inheritance
class Cat extends Animal {
  static {
    Cat.species = "Felinae"
  }
  static create(name) { return new Cat(name) }
}
// Cat inherits Animal's static methods too
```


## W — Why It Matters

`extends` is used in React class components, custom Error classes, Node.js `EventEmitter` subclasses, and any domain model hierarchy. The `super()` requirement is a common interview trip-up — missing it throws `ReferenceError: Must call super constructor` before accessing `this`.

## I — Interview Q&A

**Q: Why must `super()` be called before `this` in a subclass constructor?**
A: In a derived class, the parent constructor is responsible for initializing the instance's internal state (including private fields). Until `super()` runs, `this` doesn't exist yet — accessing it throws a `ReferenceError`. The parent "builds" the object; the child "configures" it.

**Q: How do you call a parent method that's been overridden in a subclass?**
A: Use `super.methodName()`. Inside a method, `super` refers to the parent class's prototype. You can also use it for property access: `super.property`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Accessing `this` before `super()` | Call `super()` as the first statement in subclass constructor |
| Forgetting `super()` entirely | If subclass has a constructor, `super()` is mandatory |
| Not passing args to `super()` | Pass what the parent constructor expects: `super(name, age)` |
| Overriding without calling parent behavior | Use `super.method()` to compose, not just replace |

## K — Coding Challenge

**Create a custom `HttpError` class that extends `Error` with a status code:**

```js
throw new HttpError(404, "Not Found")
// err.message = "Not Found"
// err.status = 404
// err instanceof Error = true
// err.name = "HttpError"
```

**Solution:**

```js
class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = "HttpError"
    this.status = status
    // Fix stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError)
    }
  }
}
```


***
