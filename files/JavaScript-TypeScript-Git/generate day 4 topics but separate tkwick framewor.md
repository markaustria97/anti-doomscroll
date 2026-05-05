<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 4 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 4
Prototypes, Classes, OOP \& Meta-Programming
prototype chain, _proto_, Object.getPrototypeOf, Object.setPrototypeOf, constructor functions, new keyword internals, class syntax, constructor, instance methods, static methods, static blocks, extends, super, getters/setters, public fields, private fields, private methods, inheritance, overriding, mixins, classes vs plain objects vs factory functions, Proxy traps, Reflect helpers, validation/logging/reactivity use cases, Symbol, Symbol.for, symbol registry, unique keys, Symbol.iterator, Symbol.toPrimitive, Symbol.hasInstance, Symbol.asyncIterator, Symbol.toStringTag.

Here is **Day 4 — Prototypes, Classes, OOP \& Meta-Programming** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 4 — Prototypes, Classes, OOP \& Meta-Programming

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the code. Move on.

***

# 1 — Prototype Chain \& `__proto__`

## T — TL;DR

Every JavaScript object has an internal `[[Prototype]]` link — property lookup walks up this chain until it hits `null`, enabling inheritance without copying.[^1]

## K — Key Concepts

```js
// Every object links to a prototype
const arr = [1, 2, 3]
Object.getPrototypeOf(arr) === Array.prototype   // true
Object.getPrototypeOf(Array.prototype) === Object.prototype  // true
Object.getPrototypeOf(Object.prototype)          // null — end of chain

// The chain for an array:
// arr → Array.prototype → Object.prototype → null

// Property lookup walks the chain
const obj = { name: "Alice" }
obj.name         // found on obj itself
obj.toString()   // NOT on obj → walks chain → found on Object.prototype

// __proto__ — legacy accessor (use Object.getPrototypeOf instead)
obj.__proto__ === Object.prototype   // true
// ⚠️ __proto__ is deprecated for get/set, use Object.getPrototypeOf/setPrototypeOf

// hasOwnProperty vs chain lookup
const parent = { inherited: true }
const child = Object.create(parent)
child.own = true

child.own        // true (own property)
child.inherited  // true (from prototype chain)

Object.hasOwn(child, "own")       // true
Object.hasOwn(child, "inherited") // false — not own
"inherited" in child              // true — in checks chain

// Visualizing the chain
function Person(name) { this.name = name }
Person.prototype.greet = function() { return `Hi, I'm ${this.name}` }

const alice = new Person("Alice")
// alice → Person.prototype → Object.prototype → null
alice.greet()   // found on Person.prototype
alice.toString()// found on Object.prototype
```


## W — Why It Matters

Understanding the prototype chain explains how `instanceof`, `class extends`, `Object.create`, and every method on built-in types (`.map`, `.toString`, `.hasOwnProperty`) work under the hood. It's the engine behind all JavaScript inheritance.[^5][^1]

## I — Interview Q\&A

**Q: What is the prototype chain?**
A: A linked series of objects where each object's `[[Prototype]]` points to the next. When you access a property, JS looks on the object itself first, then up the chain until it finds it or hits `null`.[^1]

**Q: What's the difference between `__proto__` and `prototype`?**
A: `__proto__` is the internal `[[Prototype]]` link on every object instance — it points to the next object in the chain. `prototype` is a property on **functions** that becomes the `[[Prototype]]` of objects created with `new`. They're related but different.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `__proto__` to set prototypes | Use `Object.setPrototypeOf()` or `Object.create()` |
| Mutating `Object.prototype` | Never — affects every object in the program |
| Confusing `fn.prototype` with instance `[[Prototype]]` | `fn.prototype` = template for `new`; `__proto__` = actual chain link |
| `setPrototypeOf` on a hot object in a loop | Kills V8 optimization — set prototype at creation time |

## K — Coding Challenge

**Trace the prototype chain for an array and verify each link:**

```js
const nums = [1, 2, 3]
// What is the full chain?
```

**Solution:**

```js
const nums = [1, 2, 3]
let proto = Object.getPrototypeOf(nums)
while (proto !== null) {
  console.log(proto)
  proto = Object.getPrototypeOf(proto)
}
// Array.prototype
// Object.prototype
// (null — loop ends)
```


***

# 2 — Constructor Functions \& the `new` Keyword Internals

## T — TL;DR

`new` does four things: creates an empty object, links its prototype, runs the constructor with `this` pointing to it, and returns the object — understanding this demystifies classes entirely.

## K — Key Concepts

```js
// What `new` does step by step
function Person(name, age) {
  // 1. A new empty object is created: {}
  // 2. Its [[Prototype]] is set to Person.prototype
  // 3. `this` is bound to the new object
  this.name = name
  this.age = age
  // 4. The new object is returned (implicitly)
}

Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}, age ${this.age}`
}

const alice = new Person("Alice", 28)
alice.greet()   // "Hi, I'm Alice, age 28"

// Implementing `new` from scratch
function myNew(Constructor, ...args) {
  // Step 1 + 2: create object with correct prototype
  const obj = Object.create(Constructor.prototype)
  // Step 3: run constructor with `this` = new object
  const result = Constructor.apply(obj, args)
  // Step 4: return result if object, otherwise return obj
  return result instanceof Object ? result : obj
}

const bob = myNew(Person, "Bob", 30)
bob.greet()     // "Hi, I'm Bob, age 30"

// If constructor returns an object, that object is used instead
function Weird() {
  this.a = 1
  return { b: 2 }  // ← explicit object return
}
const w = new Weird()
w.a  // undefined — the returned object was used, not `this`
w.b  // 2

// Forgetting `new` is a silent bug
const oops = Person("Charlie", 25)  // `this` = global/undefined in strict
oops   // undefined — no object returned
// window.name is now "Charlie" (in browser non-strict)
```


## W — Why It Matters

The `new` keyword implementation question is a classic senior interview question. Understanding these four steps also explains why `class` syntax is essentially syntactic sugar, why returning an object from a constructor overrides the new instance, and why forgetting `new` pollutes globals.[^1]

## I — Interview Q\&A

**Q: What are the four steps `new` performs?**
A: (1) Creates a new empty object. (2) Sets the object's `[[Prototype]]` to `Constructor.prototype`. (3) Calls the constructor with `this` bound to the new object. (4) Returns the object — unless the constructor explicitly returns a different object.

**Q: What happens if you call a constructor without `new`?**
A: `this` inside the constructor refers to the global object (or `undefined` in strict mode). Properties get set on the global scope, and `undefined` is returned instead of an instance. Classes enforce `new` — calling them without it throws a `TypeError`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Calling constructor without `new` | Use `class` which enforces `new`, or check `new.target` |
| Returning a primitive from constructor | It's ignored — `new` still returns the instance |
| Returning a plain object from constructor | That object is returned instead — may surprise you |
| Defining methods in constructor body | Put methods on `prototype`, not inside — avoids duplication per instance |

## K — Coding Challenge

**Implement `new` from scratch:**

```js
function Vehicle(make, model) {
  this.make = make
  this.model = model
}
Vehicle.prototype.describe = function() {
  return `${this.make} ${this.model}`
}
const car = myNew(Vehicle, "Toyota", "Corolla")
car.describe()  // "Toyota Corolla"
```

**Solution:**

```js
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype)
  const result = Constructor.apply(obj, args)
  return result instanceof Object ? result : obj
}
```


***

# 3 — Class Syntax: Constructor, Instance Methods, Static Methods \& Static Blocks

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

## I — Interview Q\&A

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

# 4 — Getters, Setters, Public Fields \& Private Fields/Methods

## T — TL;DR

Public fields initialize instance properties declaratively; private fields (`#name`) are truly inaccessible from outside the class — not just a convention like `_name`.[^1]

## K — Key Concepts

```js
class User {
  // Public instance fields — initialized per instance
  role = "user"
  createdAt = new Date()

  // Private fields — truly private, enforced by the engine
  #password
  #loginCount = 0

  // Private method
  #hashPassword(raw) {
    return `hashed_${raw}`  // simplified
  }

  constructor(name, password) {
    this.name = name                          // regular instance property
    this.#password = this.#hashPassword(password)
  }

  // Getter — accessed like a property
  get displayName() {
    return `${this.name} (${this.role})`
  }

  // Setter — validated assignment
  set email(value) {
    if (!value.includes("@")) throw new Error("Invalid email")
    this._email = value
  }

  get email() {
    return this._email ?? "not set"
  }

  login(password) {
    if (this.#hashPassword(password) === this.#password) {
      this.#loginCount++
      return true
    }
    return false
  }

  get loginCount() { return this.#loginCount }
}

const u = new User("Alice", "secret123")
u.displayName       // "Alice (user)" — getter
u.email = "a@b.com" // setter validates
u.email             // "a@b.com" — getter
u.#password         // ❌ SyntaxError — private!
u.login("secret123")// true
u.loginCount        // 1

// Private fields don't appear in iteration
Object.keys(u)    // ["role", "createdAt", "name", "_email"]
// #password and #loginCount are invisible
```


## W — Why It Matters

Private fields (`#`) provide real encapsulation — unlike the `_name` convention which is just a gentleman's agreement. They're critical for building APIs where internal state must be protected (payment processing, auth tokens, caches). Getters/setters enable lazy computation and validation at the property access level.

## I — Interview Q\&A

**Q: What's the difference between `_name` (underscore) and `#name` (private field)?**
A: `_name` is a naming convention meaning "please don't access this." It's still fully accessible from outside. `#name` is enforced by the JS engine — accessing it outside the class body throws a `SyntaxError`, not a runtime error.

**Q: When would you use a getter instead of a regular method?**
A: When the computed value feels like a property rather than an action — e.g., `user.fullName`, `rect.area`, `list.isEmpty`. Getters give a cleaner API and can be lazy or derived without cluttering the constructor.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Getter with no setter in strict mode throwing on set | Add a setter, or accept it's read-only |
| Public field shadowing prototype method accidentally | Choose distinct names |
| Forgetting `#` on private method calls | All private access needs `#`: `this.#method()` |
| `#field` in subclass without re-declaration | Private fields are NOT inherited — declare in each class |

## K — Coding Challenge

**Build a `BankAccount` class with private balance, a deposit/withdraw method, and a read-only balance getter:**

```js
const acc = new BankAccount(100)
acc.deposit(50)
acc.balance     // 150
acc.balance = 9999  // should have no effect or throw
acc.withdraw(200)   // should throw "Insufficient funds"
```

**Solution:**

```js
class BankAccount {
  #balance

  constructor(initial = 0) {
    this.#balance = initial
  }

  get balance() { return this.#balance }  // no setter = read-only

  deposit(amount) {
    if (amount <= 0) throw new Error("Positive amounts only")
    this.#balance += amount
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds")
    this.#balance -= amount
  }
}
```


***

# 5 — `extends`, `super`, Inheritance \& Overriding

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

## I — Interview Q\&A

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

Deep inheritance chains are fragile — changing a base class breaks all subclasses. Mixins compose behavior horizontally. React `HOC` (Higher-Order Components), Vue `mixins`, and many framework utilities use this pattern. It's the JS answer to multiple inheritance.[^1]

## I — Interview Q\&A

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

# 7 — Classes vs Plain Objects vs Factory Functions

## T — TL;DR

All three create objects — choose based on whether you need inheritance (`class`), simplicity and composition (`factory`), or one-off data containers (`plain object`).

## K — Key Concepts

```js
// Plain Object — best for data containers, config, one-off structures
const config = {
  host: "localhost",
  port: 3000,
  getUrl() { return `http://${this.host}:${this.port}` }
}

// Factory Function — best for encapsulation without `new`/`this` complexity
function createUser(name, role = "user") {
  let loginCount = 0   // private via closure

  return {
    getName: () => name,
    getRole: () => role,
    login() { loginCount++ },
    getLogins: () => loginCount
  }
}
// No `new`, no `this`, private state, composable
const u = createUser("Alice", "admin")

// Class — best for inheritance, frameworks, instanceof checks
class Animal {
  constructor(name) { this.name = name }
  speak() { return `${this.name} speaks` }
}
class Dog extends Animal {
  speak() { return `${this.name} barks` }
}
```

|  | Plain Object | Factory Function | Class |
| :-- | :-- | :-- | :-- |
| `new` required | ❌ | ❌ | ✅ |
| Private state | ❌ | ✅ (closure) | ✅ (`#field`) |
| Inheritance | ❌ (manual) | ❌ (compose) | ✅ (`extends`) |
| `instanceof` | ❌ | ❌ | ✅ |
| Prototype sharing | ❌ | ❌ | ✅ |
| Memory (many instances) | ❌ (methods copied) | ❌ (methods copied) | ✅ (shared prototype) |

## W — Why It Matters

Senior engineers choose the right tool for the problem. Classes aren't always better — React's functional components replaced class components. Factories are easier to test and compose. Plain objects are perfect for configs and data transfer objects (DTOs).

## I — Interview Q\&A

**Q: When would you choose a factory function over a class?**
A: When you don't need inheritance, want simpler `this` handling, need private state without class syntax, prefer composition over inheritance, or want to avoid `new` and prototype chain complexity. Factory functions are also easier to test — no class boilerplate.

**Q: What's the memory difference between factory functions and classes for many instances?**
A: Factory functions create a new copy of every method for each instance. Classes share methods via the prototype — one copy regardless of how many instances exist. For thousands of instances, classes are significantly more memory-efficient.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using class for everything | Use plain objects for data, factories for encapsulation |
| Factory functions for thousands of short-lived instances | Consider class for prototype method sharing |
| Mixing class and factory patterns in the same codebase | Pick one pattern per domain and be consistent |

## K — Coding Challenge

**Write the same `Counter` in all three styles:**

**Solution:**

```js
// Plain object
const counter1 = { count: 0, inc() { this.count++ }, val() { return this.count } }

// Factory function (private state)
function createCounter() {
  let count = 0
  return { inc: () => count++, val: () => count }
}

// Class (private field)
class Counter {
  #count = 0
  inc() { this.#count++ }
  val() { return this.#count }
}
```


***

# 8 — Proxy Traps

## T — TL;DR

`Proxy` wraps an object and intercepts operations — get, set, delete, apply, construct — letting you add validation, logging, reactivity, or access control transparently.[^4]

## K — Key Concepts

```js
// Basic Proxy structure
const proxy = new Proxy(target, handler)
// target = original object
// handler = object with trap functions

// get trap — intercept property reads
const logged = new Proxy({}, {
  get(target, prop, receiver) {
    console.log(`Getting: ${prop}`)
    return Reflect.get(target, prop, receiver)
  }
})
logged.name = "Alice"
logged.name  // logs "Getting: name", returns "Alice"

// set trap — validation
const validated = new Proxy({}, {
  set(target, prop, value, receiver) {
    if (prop === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("age must be a positive number")
    }
    return Reflect.set(target, prop, value, receiver)
  }
})
validated.age = 28   // ✅
validated.age = "hi" // ❌ TypeError

// deleteProperty trap
const protected_ = new Proxy({ id: 1, name: "Alice" }, {
  deleteProperty(target, prop) {
    if (prop === "id") throw new Error("Cannot delete id")
    return Reflect.deleteProperty(target, prop)
  }
})

// has trap — intercept `in` operator
const range = new Proxy({}, {
  has(target, key) {
    return key >= 1 && key <= 100
  }
})
50 in range   // true
200 in range  // false

// apply trap — intercept function calls
function sum(a, b) { return a + b }
const timedSum = new Proxy(sum, {
  apply(target, thisArg, args) {
    console.time("call")
    const result = Reflect.apply(target, thisArg, args)
    console.timeEnd("call")
    return result
  }
})
timedSum(1, 2)  // logs timing, returns 3

// All major traps
// get, set, has, deleteProperty, apply, construct,
// ownKeys, getOwnPropertyDescriptor, defineProperty,
// getPrototypeOf, setPrototypeOf, isExtensible, preventExtensions
```


## W — Why It Matters

Vue 3's reactivity system is built on `Proxy`. MobX uses it for observable state. `Proxy` enables immutability enforcement, auto-validation, access logging, and virtual properties. It's the modern replacement for `Object.defineProperty` for reactive patterns.[^6][^4]

## I — Interview Q\&A

**Q: What is a Proxy trap and name three common ones?**
A: A trap is a method on the handler object that intercepts a specific object operation. Common traps: `get` (property reads), `set` (property assignments), `has` (the `in` operator), `deleteProperty`, `apply` (function calls).[^4]

**Q: Why use `Reflect.get` inside a `get` trap instead of `target[prop]`?**
A: `Reflect.get(target, prop, receiver)` correctly handles getters that use `this` — the `receiver` ensures `this` inside the getter refers to the proxy, not the raw target. Using `target[prop]` directly would bypass that.[^2][^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not returning `true` from `set` trap | `set` must return `true` for success, else throws in strict mode |
| Using `target[prop]` instead of `Reflect.get` in traps | Use `Reflect` to preserve `receiver` and getter behavior |
| Proxying a class with private fields | Private fields are accessed directly on target — proxy `get/set` doesn't intercept them |
| Infinite recursion in trap | Access `target`, not `proxy`, inside trap handlers |

## K — Coding Challenge

**Build a read-only proxy that throws on any write attempt:**

```js
const data = readOnly({ name: "Alice", score: 100 })
data.name         // "Alice"
data.score = 200  // throws: "Cannot modify read-only object"
```

**Solution:**

```js
function readOnly(obj) {
  return new Proxy(obj, {
    set(target, prop) {
      throw new Error(`Cannot modify read-only object: ${prop}`)
    },
    deleteProperty(target, prop) {
      throw new Error(`Cannot delete from read-only object: ${prop}`)
    }
  })
}
```


***

# 9 — Reflect Helpers

## T — TL;DR

`Reflect` is a namespace of functions that mirror object internal operations — its primary job is to provide default forwarding behavior inside Proxy traps.[^2]

## K — Key Concepts

```js
// Reflect mirrors object internal methods as functions
const obj = { name: "Alice", age: 28 }

// Reflect.get / Reflect.set — preferred in proxy traps
Reflect.get(obj, "name")             // "Alice"
Reflect.set(obj, "name", "Bob")      // true (returns boolean!)
Reflect.has(obj, "name")             // true (same as "name" in obj)
Reflect.deleteProperty(obj, "age")   // true (same as delete obj.age)

// Reflect.ownKeys — all own keys including symbols
const sym = Symbol("secret")
const obj2 = { a: 1, [sym]: "hidden" }
Object.keys(obj2)         // ["a"] — no symbols
Reflect.ownKeys(obj2)     // ["a", Symbol(secret)]

// Reflect.apply — call a function with explicit this + args array
function greet(greeting) { return `${greeting}, ${this.name}` }
Reflect.apply(greet, { name: "Alice" }, ["Hello"])
// "Hello, Alice" — same as greet.call({name:"Alice"}, "Hello")

// Reflect.construct — like new, but programmatically
class Point { constructor(x, y) { this.x = x; this.y = y } }
const p = Reflect.construct(Point, [1, 2])
// same as new Point(1, 2)

// Reflect.defineProperty / getOwnPropertyDescriptor
Reflect.defineProperty(obj, "id", {
  value: 1, writable: false, enumerable: false, configurable: false
})

// Reflect.getPrototypeOf / setPrototypeOf
Reflect.getPrototypeOf(obj) === Object.prototype  // true

// Key advantage: Reflect methods return boolean success/failure
// Object.defineProperty throws on failure; Reflect.defineProperty returns false
const success = Reflect.defineProperty(Object.freeze({}), "x", { value: 1 })
// false — didn't throw, just failed gracefully
```


## W — Why It Matters

`Reflect` makes introspection and forwarding uniform and functional. In Proxy traps, always use `Reflect` to forward operations — it ensures correct behavior with inheritance, getters, and `receiver` contexts. It also enables cleaner meta-programming without try/catch for property operations.[^7][^2]

## I — Interview Q\&A

**Q: Why does `Reflect` exist if you can do the same things with operators?**
A: `Reflect` provides a functional, consistent API for object operations. It returns booleans instead of throwing (unlike `Object.defineProperty`), correctly handles `receiver` in proxies, and unifies operations that are otherwise scattered across `in`, `delete`, `new`, and method calls.[^2]

**Q: What's the difference between `Reflect.apply` and `Function.prototype.call`?**
A: They're functionally equivalent, but `Reflect.apply(fn, thisArg, argsArray)` is a first-class function call (not a method call) — useful when `fn.call` might be overridden or unavailable. Prefer it inside Proxy `apply` traps.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `target[prop]` in proxy traps | Use `Reflect.get(target, prop, receiver)` — preserves getter context |
| Ignoring `Reflect.set` return value | Check it — `false` means the set was rejected (frozen object etc.) |
| `Reflect.ownKeys` vs `Object.keys` confusion | `Reflect.ownKeys` includes symbols and non-enumerable; `Object.keys` only own enumerable strings |

## K — Coding Challenge

**Build a Proxy that auto-converts all `set` values to the correct type based on the original value's type:**

```js
const typed = createTyped({ count: 0, name: "Alice" })
typed.count = "5"     // stored as 5 (number)
typed.name = 42       // stored as "42" (string)
typed.count           // 5
```

**Solution:**

```js
function createTyped(obj) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const existing = Reflect.get(target, prop, receiver)
      if (existing !== undefined) {
        const cast = typeof existing === "number" ? Number(value) : String(value)
        return Reflect.set(target, prop, cast, receiver)
      }
      return Reflect.set(target, prop, value, receiver)
    }
  })
}
```


***

# 10 — Proxy Use Cases: Validation, Logging \& Reactivity

## T — TL;DR

The three killer use cases for `Proxy` are runtime validation, transparent logging, and reactivity — triggering callbacks when data changes, which is exactly how Vue 3 works.[^6]

## K — Key Concepts

```js
// 1. Validation Proxy
function createSchema(obj, rules) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      if (rules[prop]) {
        const { type, min, max, required } = rules[prop]
        if (type && typeof value !== type) throw new TypeError(`${prop} must be ${type}`)
        if (min !== undefined && value < min) throw new RangeError(`${prop} >= ${min}`)
        if (max !== undefined && value > max) throw new RangeError(`${prop} <= ${max}`)
      }
      return Reflect.set(target, prop, value, receiver)
    }
  })
}

const user = createSchema({}, {
  age: { type: "number", min: 0, max: 150 },
  name: { type: "string" }
})
user.age = 25     // ✅
user.age = -1     // ❌ RangeError
user.name = 42    // ❌ TypeError

// 2. Logging Proxy
function createLogger(obj, label = "Object") {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver)
      if (typeof val === "function") {
        return function(...args) {
          console.log(`[${label}] ${prop}(${args.map(JSON.stringify).join(", ")})`)
          return val.apply(target, args)
        }
      }
      return val
    },
    set(target, prop, value, receiver) {
      console.log(`[${label}] SET ${prop} = ${JSON.stringify(value)}`)
      return Reflect.set(target, prop, value, receiver)
    }
  })
}

// 3. Reactive Proxy (Vue 3 simplified)
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const old = target[prop]
      const result = Reflect.set(target, prop, value, receiver)
      if (old !== value) onChange(prop, value, old)
      return result
    }
  })
}

const state = reactive({ count: 0 }, (prop, newVal, oldVal) => {
  console.log(`${prop}: ${oldVal} → ${newVal}`)
  // In Vue 3, this would trigger DOM re-render
})

state.count = 1   // "count: 0 → 1"
state.count = 2   // "count: 1 → 2"
```


## W — Why It Matters

Vue 3 replaced `Object.defineProperty` with `Proxy` for its entire reactivity system because `Proxy` can intercept new property additions, array length changes, and deletions — things `defineProperty` couldn't handle. Understanding this makes Vue 3 internals intuitive.[^4]

## I — Interview Q\&A

**Q: How does Vue 3 use Proxy for reactivity?**
A: Vue 3 wraps reactive data in a `Proxy`. The `get` trap tracks which components depend on which properties (dependency tracking). The `set` trap triggers re-renders when those properties change (dependency notification). This replaces Vue 2's per-property `Object.defineProperty` approach.

**Q: What can Proxy intercept that `Object.defineProperty` cannot?**
A: `Proxy` can intercept adding new properties, deleting properties, and array index/length changes. `Object.defineProperty` only intercepts pre-defined properties — you can't intercept `obj.newProp = value` reactively with it.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Proxy not deep — nested objects aren't reactive | Recursively wrap nested objects: `reactive(value)` if it's an object |
| Forgetting `return Reflect.set(...)` at end of `set` trap | Return `false` → strict mode throws `TypeError` |
| Proxy wrapping native types (Date, Map, Set) | Native methods access internal slots directly — proxy wrapping breaks them |

## K — Coding Challenge

**Build a `deepReactive` that makes nested objects reactive too:**

```js
const state = deepReactive({ user: { name: "Alice" } }, onChange)
state.user.name = "Bob"  // should trigger onChange
```

**Solution:**

```js
function deepReactive(obj, onChange) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver)
      if (val && typeof val === "object") return deepReactive(val, onChange)
      return val
    },
    set(target, prop, value, receiver) {
      const old = target[prop]
      const result = Reflect.set(target, prop, value, receiver)
      if (old !== value) onChange(prop, value, old)
      return result
    }
  })
}
```


***

# 11 — Symbol, `Symbol.for` \& the Symbol Registry

## T — TL;DR

Symbols are unique, non-string, non-enumerable keys — use them to add metadata or extension hooks to objects without any risk of name collision.[^3]

## K — Key Concepts

```js
// Every Symbol() call creates a UNIQUE value
const a = Symbol("id")
const b = Symbol("id")
a === b   // false — always unique, even with same description

// Use as unique property keys
const ID = Symbol("id")
const obj = {
  name: "Alice",
  [ID]: 12345         // symbol key — non-enumerable!
}

obj.name              // "Alice"
obj[ID]               // 12345
Object.keys(obj)      // ["name"] — symbol not listed!
JSON.stringify(obj)   // {"name":"Alice"} — symbol stripped!

// Access symbols
Object.getOwnPropertySymbols(obj)  // [Symbol(id)]
Reflect.ownKeys(obj)               // ["name", Symbol(id)]

// Symbol.for — global registry (shared across modules/iframes)
const key1 = Symbol.for("app.token")
const key2 = Symbol.for("app.token")
key1 === key2         // true ✅ — same registry entry

Symbol.keyFor(key1)   // "app.token"
Symbol.keyFor(Symbol("local")) // undefined — not in registry

// Symbol as constants (no collision possible)
const Direction = {
  UP:    Symbol("UP"),
  DOWN:  Symbol("DOWN"),
  LEFT:  Symbol("LEFT"),
  RIGHT: Symbol("RIGHT")
}
Direction.UP === Direction.UP  // true
// Can't be spoofed by passing the string "UP"
```


## W — Why It Matters

Symbols are how library authors add non-interfering hooks to user objects. `Symbol.for` is how you share symbols across module boundaries. Third-party libraries use symbols to tag objects with metadata that never appears in user code's `for...in` loops or `JSON.stringify`.

## I — Interview Q\&A

**Q: What makes Symbols useful as object keys vs strings?**
A: Symbols are guaranteed unique — you can't accidentally collide with existing string keys. They're also non-enumerable, so they don't appear in `Object.keys`, `for...in`, or `JSON.stringify`. Perfect for metadata and extension points.

**Q: What's the difference between `Symbol()` and `Symbol.for()`?**
A: `Symbol()` always creates a new unique symbol — even with the same description. `Symbol.for(key)` looks up or creates a symbol in the global registry — the same string key always returns the same symbol, making it shareable across modules.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `JSON.stringify` silently dropping symbol-keyed properties | Use `Reflect.ownKeys` + manual serialization if needed |
| `Symbol()` with no description being hard to debug | Always give descriptive labels: `Symbol("user:id")` |
| Using `Symbol()` where sharing across modules is needed | Use `Symbol.for("shared.key")` instead |
| Assuming `typeof Symbol() === "symbol"` returns `"object"` | It returns `"symbol"` — own type |

## K — Coding Challenge

**Add a non-enumerable `__meta__` symbol key to any object without affecting its normal behavior:**

```js
const META = Symbol.for("app.meta")
const user = tag({ name: "Alice" }, { version: 1 })
user.name          // "Alice"
Object.keys(user)  // ["name"] — meta not visible
user[META]         // { version: 1 }
```

**Solution:**

```js
const META = Symbol.for("app.meta")

function tag(obj, meta) {
  return Object.defineProperty({ ...obj }, META, {
    value: meta,
    enumerable: false,
    writable: true,
    configurable: true
  })
}
```


***

# 12 — `Symbol.iterator` \& Custom Iterables

## T — TL;DR

`Symbol.iterator` makes any object work with `for...of`, spread, and destructuring — implement it to make your custom classes iterable.[^8]

## K — Key Concepts

```js
// Built-in iterables use Symbol.iterator
const arr = [1, 2, 3]
const iter = arr[Symbol.iterator]()
iter.next()  // { value: 1, done: false }
iter.next()  // { value: 2, done: false }
iter.next()  // { value: 3, done: false }
iter.next()  // { value: undefined, done: true }

// for...of uses Symbol.iterator internally
for (const x of arr) { /* ... */ }
// equivalent to:
const it = arr[Symbol.iterator]()
let result
while (!(result = it.next()).done) { /* use result.value */ }

// Custom iterable object
class Range {
  constructor(start, end) {
    this.start = start
    this.end = end
  }

  [Symbol.iterator]() {
    let current = this.start
    const end = this.end
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}

const range = new Range(1, 5)
[...range]             // [1, 2, 3, 4, 5]
for (const n of range) console.log(n)  // 1 2 3 4 5
const [first, , third] = range  // destructuring works!

// Generator shorthand for iterables
class EvenNumbers {
  constructor(limit) { this.limit = limit }

  *[Symbol.iterator]() {    // generator method as Symbol.iterator
    for (let i = 0; i <= this.limit; i += 2) {
      yield i
    }
  }
}

[...new EvenNumbers(10)]  // [0, 2, 4, 6, 8, 10]
```


## W — Why It Matters

`Symbol.iterator` is what makes custom data structures work natively with JavaScript's iteration protocol — `for...of`, spread `[...x]`, destructuring, `Array.from`, `Promise.all`, and more. It's the key to making first-class data structures.

## I — Interview Q\&A

**Q: How do you make a custom object iterable?**
A: Define a `[Symbol.iterator]()` method that returns an iterator object. The iterator must have a `next()` method that returns `{ value, done }` objects. Use a generator function (`function*`) as a shorthand.

**Q: What protocol must an iterator follow?**
A: An iterator must have a `next()` method that returns an object with `value` (current item) and `done` (boolean — `true` when exhausted). An iterable must have a `[Symbol.iterator]()` method that returns an iterator.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Returning `{ done: true }` without `value` | Return `{ value: undefined, done: true }` explicitly |
| Reusing a consumed iterator | Iterators are one-use — call `[Symbol.iterator]()` fresh |
| Infinite iterator in `[...spread]` | Only spread finite iterables or use `take(n)` pattern |
| Forgetting generator method syntax `*[Symbol.iterator]()` | The `*` before the `[` is required |

## K — Coding Challenge

**Implement a `LinkedList` class that is iterable with `for...of`:**

```js
const list = new LinkedList()
list.add(1); list.add(2); list.add(3)
for (const val of list) console.log(val)  // 1 2 3
[...list]  // [1, 2, 3]
```

**Solution:**

```js
class LinkedList {
  #head = null

  add(val) {
    this.#head = { val, next: this.#head }
  }

  *[Symbol.iterator]() {
    const values = []
    let node = this.#head
    while (node) { values.unshift(node.val); node = node.next }
    yield* values
  }
}
```


***

# 13 — `Symbol.toPrimitive`, `Symbol.hasInstance` \& `Symbol.toStringTag`

## T — TL;DR

Well-known Symbols let your classes hook into built-in JS operations — `toPrimitive` controls coercion, `hasInstance` controls `instanceof`, `toStringTag` controls `Object.prototype.toString`.[^9][^8]

## K — Key Concepts

```js
// Symbol.toPrimitive — control type coercion
class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount       // +money, math ops
    if (hint === "string") return `${this.amount} ${this.currency}` // template literals
    return this.amount  // "default" — == comparisons, +
  }
}

const price = new Money(9.99, "USD")
+price           // 9.99 (hint: "number")
`Price: ${price}` // "Price: 9.99 USD" (hint: "string")
price + 1        // 10.99 (hint: "default")
price == 9.99    // true

// Symbol.hasInstance — control instanceof behavior
class EvenNumber {
  static [Symbol.hasInstance](num) {
    return Number.isInteger(num) && num % 2 === 0
  }
}

2  instanceof EvenNumber  // true
3  instanceof EvenNumber  // false
4  instanceof EvenNumber  // true
"2" instanceof EvenNumber // false

// Symbol.toStringTag — control Object.prototype.toString output
class Database {
  get [Symbol.toStringTag]() {
    return "Database"
  }
}

const db = new Database()
Object.prototype.toString.call(db)  // "[object Database]"
// Without: "[object Object]"

// Common built-in toStringTags
Object.prototype.toString.call([])          // "[object Array]"
Object.prototype.toString.call(new Map())   // "[object Map]"
Object.prototype.toString.call(new Set())   // "[object Set]"
Object.prototype.toString.call(Promise.resolve()) // "[object Promise]"

// Symbol.asyncIterator — async iteration
class AsyncStream {
  async *[Symbol.asyncIterator]() {
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 100))
      yield i
    }
  }
}

for await (const val of new AsyncStream()) {
  console.log(val)  // 0, 1, 2 — each 100ms apart
}
```


## W — Why It Matters

`Symbol.toPrimitive` is essential for building numeric or monetary value objects that work naturally in math expressions. `Symbol.toStringTag` is how you write proper type-checking utilities — the reliable type detection used by `lodash` and Axios. `Symbol.asyncIterator` is how Node.js readable streams and async generators implement `for await...of`.[^8][^9]

## I — Interview Q\&A

**Q: What are the three hints passed to `Symbol.toPrimitive`?**
A: `"number"` (when a number is expected, e.g. `+obj`), `"string"` (when a string is expected, e.g. template literals), and `"default"` (ambiguous context, e.g. `==` or `+`).[^9]

**Q: How does `Symbol.toStringTag` help with type checking?**
A: `Object.prototype.toString.call(val)` returns `"[object Tag]"` where Tag comes from `Symbol.toStringTag`. It's more reliable than `typeof` or `instanceof` for built-in types like `Map`, `Set`, and `Promise` — and you can set it on your own classes.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `Symbol.toPrimitive` not covering all hints | Always handle all three: `"number"`, `"string"`, `"default"` |
| `Symbol.hasInstance` only works as static | Must be `static [Symbol.hasInstance]` — not an instance method |
| `Symbol.toStringTag` not appearing in `typeof` | It only affects `Object.prototype.toString.call()`, not `typeof` |
| `for await...of` on non-async-iterable | Must implement `Symbol.asyncIterator`, not `Symbol.iterator` |

## K — Coding Challenge

**Build a `Temperature` class that coerces correctly:**

```js
const temp = new Temperature(100, "C")
+temp             // 100 (numeric value)
`${temp}`         // "100°C" (string display)
temp > 50         // true (comparison uses number)
```

**Solution:**

```js
class Temperature {
  constructor(value, unit) {
    this.value = value
    this.unit = unit
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "string") return `${this.value}°${this.unit}`
    return this.value  // "number" and "default"
  }

  get [Symbol.toStringTag]() {
    return "Temperature"
  }
}
```


***

> ✅ **Day 4 complete.**
> Your tiny next action: implement `new` from scratch — write `myNew(Constructor, ...args)` in 4 lines from memory. That single function explains all of OOP in JavaScript.
<span style="display:none">[^10][^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain

[^2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect

[^3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol

[^4]: https://vipjavascript.com/blog/javascript-proxies-and-reflect-comprehensive-guide

[^5]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Advanced_JavaScript_objects/Object_prototypes

[^6]: https://www.linkedin.com/pulse/proxy-reflect-objects-javascript-sonu-tiwari-cxdnc

[^7]: https://dev.to/italoqueiroz/the-secrets-of-proxies-intercepting-and-controlling-objects-in-javascript-14il

[^8]: https://witch.work/en/posts/javascript-symbol-usage

[^9]: https://www.javascripttutorial.net/symbol/

[^10]: https://library.fridoverweij.com/docs/jstutorial/prototypes_and_inheritance.html

[^11]: https://jsguides.dev/guides/javascript-prototypes/

[^12]: https://javascript.info/prototype-methods

[^13]: https://sandeep45.github.io/javascript/es6/2016/02/04/prototype-chain.html

[^14]: https://udn.realityripple.com/docs/Learn/JavaScript/Objects/Object_prototypes

[^15]: https://www.geeksforgeeks.org/javascript/understanding-the-prototype-chain-in-javascript/

