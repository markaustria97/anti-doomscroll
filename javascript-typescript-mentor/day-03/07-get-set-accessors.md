# 7 — `get`/`set` Accessors

## T — TL;DR

Getters and setters let you define properties that **look like** data properties but **execute functions** when accessed or assigned — perfect for computed values, validation, and controlled access.

## K — Key Concepts

### In Object Literals

```js
const user = {
  firstName: "Mark",
  lastName: "Austria",

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  },

  set fullName(value) {
    const [first, last] = value.split(" ")
    this.firstName = first
    this.lastName = last
  },
}

// Used like a normal property:
console.log(user.fullName)    // "Mark Austria" — getter called
user.fullName = "John Doe"    // setter called
console.log(user.firstName)   // "John"
console.log(user.lastName)    // "Doe"
```

### In Classes

```js
class Circle {
  #radius

  constructor(radius) {
    this.radius = radius // calls the setter
  }

  get radius() {
    return this.#radius
  }

  set radius(value) {
    if (typeof value !== "number" || value <= 0) {
      throw new RangeError("Radius must be a positive number")
    }
    this.#radius = value
  }

  get area() {
    return Math.PI * this.#radius ** 2
  }

  get diameter() {
    return this.#radius * 2
  }
}

const c = new Circle(5)
c.radius      // 5 (getter)
c.area        // 78.539... (computed getter)
c.diameter    // 10 (computed getter)

c.radius = 10 // setter validates
// c.radius = -1 // RangeError: Radius must be a positive number
// c.area = 100  // silently fails — no setter defined for area
```

### Getter-Only Properties (Read-Only)

If you define only a `get` without a `set`, the property is effectively read-only:

```js
class Config {
  get version() {
    return "1.0.0"
  }
}

const config = new Config()
config.version       // "1.0.0"
config.version = "2" // silently fails (or throws in strict mode)
```

### With `Object.defineProperty`

```js
const obj = { _name: "Mark" }

Object.defineProperty(obj, "name", {
  get() {
    return this._name.toUpperCase()
  },
  set(value) {
    this._name = value.trim()
  },
  enumerable: true,
  configurable: true,
})

obj.name         // "MARK" (getter transforms)
obj.name = " Alex " // setter trims
obj._name        // "Alex"
```

### Getters vs Methods

```js
class User {
  firstName = "Mark"
  lastName = "Austria"

  // Getter — accessed like a property
  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  // Method — called with ()
  getFullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

const u = new User()
u.fullName     // "Mark Austria" — no parentheses
u.getFullName() // "Mark Austria" — with parentheses
```

Use getters for:
- Computed values derived from other properties
- Values that should **feel** like properties (no arguments needed)

Use methods for:
- Actions that have side effects
- Functions that take arguments

### Getters Are Evaluated on Every Access

```js
const obj = {
  get timestamp() {
    return Date.now() // called every time
  },
}

obj.timestamp // 1713500000000
obj.timestamp // 1713500000001 — different!
```

Getters are NOT cached. If you need caching, implement it manually or use memoization.

## W — Why It Matters

- Getters/setters enable the **reactive** pattern — Vue.js 2 used them for reactivity.
- Validation in setters catches bad data **at assignment time**, not later.
- Computed properties (getters) reduce redundant state — derive values instead of storing duplicates.
- They maintain a clean property-like API while hiding implementation complexity.
- Understanding accessors is prerequisite for `Proxy` and `Reflect` (covered next).

## I — Interview Questions with Answers

### Q1: What are getters and setters?

**A:** Special methods that run when a property is **accessed** (getter) or **assigned** (setter). They look like normal property access from the outside: `obj.prop` and `obj.prop = value`.

### Q2: What happens if you define a getter without a setter?

**A:** The property becomes effectively **read-only**. Assignment silently fails in sloppy mode or throws in strict mode.

### Q3: Are getters cached?

**A:** No. They are re-evaluated on every access. If you need caching, implement lazy evaluation manually.

### Q4: When should you use a getter vs a method?

**A:** Use getters for computed/derived values with no arguments that feel like properties. Use methods for operations with side effects or that require arguments.

## C — Common Pitfalls with Fix

### Pitfall: Infinite recursion with getter/setter and same-name property

```js
class User {
  get name() { return this.name } // ❌ calls itself infinitely!
  set name(v) { this.name = v }   // ❌ calls itself infinitely!
}
```

**Fix:** Use a private backing field:

```js
class User {
  #name
  get name() { return this.#name }
  set name(v) { this.#name = v }
}
```

### Pitfall: Forgetting setters cause silent failures

```js
const obj = {
  get value() { return 42 },
}
obj.value = 100 // silently fails
console.log(obj.value) // 42
```

**Fix:** Be aware of this behavior. Add a setter that throws if assignment should be an error:

```js
set value(_) {
  throw new Error("value is read-only")
}
```

## K — Coding Challenge with Solution

### Challenge

Create a `Temperature` class with:
- A `#celsius` private field
- A `celsius` getter/setter
- A `fahrenheit` getter/setter that converts automatically
- Validation: temperature must be ≥ -273.15°C (absolute zero)

### Solution

```js
class Temperature {
  #celsius

  constructor(celsius) {
    this.celsius = celsius // uses setter for validation
  }

  get celsius() {
    return this.#celsius
  }

  set celsius(value) {
    if (value < -273.15) {
      throw new RangeError("Temperature below absolute zero")
    }
    this.#celsius = value
  }

  get fahrenheit() {
    return this.#celsius * 9 / 5 + 32
  }

  set fahrenheit(value) {
    this.celsius = (value - 32) * 5 / 9 // delegates to celsius setter for validation
  }
}

const t = new Temperature(100)
t.celsius    // 100
t.fahrenheit // 212
t.fahrenheit = 32
t.celsius    // 0
// t.celsius = -300 // RangeError
```

---
