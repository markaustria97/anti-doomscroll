# 8 — Inheritance (Prototypal & Class-Based)

## T — TL;DR

JavaScript supports inheritance through the prototype chain — `class extends` provides clean syntax, but the underlying mechanism is always prototypal delegation via `[[Prototype]]` links.

## K — Key Concepts

### Class-Based Inheritance with `extends`

```js
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    return `${this.name} makes a sound`
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name)       // MUST call super() before using `this`
    this.breed = breed
  }

  speak() {
    return `${this.name} barks` // overrides parent method
  }

  fetch(item) {
    return `${this.name} fetches ${item}`
  }
}

const rex = new Dog("Rex", "Labrador")
rex.speak()       // "Rex barks" — overridden
rex.fetch("ball") // "Rex fetches ball" — own method
rex.name          // "Rex" — inherited constructor logic
```

### `super` — Two Uses

**1. In constructor — calls parent constructor:**

```js
class Dog extends Animal {
  constructor(name, breed) {
    super(name) // calls Animal constructor
    this.breed = breed
  }
}
```

**Rule:** In a derived class constructor, you MUST call `super()` before accessing `this`.

**2. In methods — calls parent method:**

```js
class Dog extends Animal {
  speak() {
    const parentResult = super.speak() // "Rex makes a sound"
    return `${parentResult} (actually barks)`
  }
}
```

### `super` Must Come First

```js
class Dog extends Animal {
  constructor(name) {
    // this.name = name // ❌ ReferenceError — must call super() first!
    super(name)
    this.name = name // ✅ after super()
  }
}
```

### What `extends` Does Under the Hood

```js
class Dog extends Animal {}

// Is roughly equivalent to:
function Dog(...args) {
  Animal.call(this, ...args) // super()
}
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
Object.setPrototypeOf(Dog, Animal) // for static inheritance
```

Two prototype chains are set up:

```
Instance chain:
  rex → Dog.prototype → Animal.prototype → Object.prototype → null

Static chain:
  Dog → Animal → Function.prototype → Object.prototype → null
```

### Static Inheritance

Static methods are inherited too:

```js
class Animal {
  static create(name) {
    return new this(name) // `this` = the class being called
  }
}

class Dog extends Animal {}

const rex = Dog.create("Rex") // works! static method inherited
console.log(rex instanceof Dog) // true
```

### `instanceof` Checks the Prototype Chain

```js
rex instanceof Dog    // true
rex instanceof Animal // true
rex instanceof Object // true

// Because the prototype chain is:
// rex → Dog.prototype → Animal.prototype → Object.prototype → null
```

### `override` (TypeScript Feature — Preview)

TypeScript has an `override` keyword that ensures you're actually overriding a parent method:

```ts
class Dog extends Animal {
  override speak() { // TS ensures 'speak' exists on parent
    return "woof"
  }

  // override missing() {} // TS Error: method doesn't exist on parent
}
```

### Abstract Pattern (Without TypeScript)

JavaScript doesn't have `abstract` classes natively, but you can simulate:

```js
class Shape {
  area() {
    throw new Error("Subclasses must implement area()")
  }
}

class Circle extends Shape {
  constructor(radius) {
    super()
    this.radius = radius
  }

  area() {
    return Math.PI * this.radius ** 2
  }
}

// new Shape().area() // Error: Subclasses must implement area()
new Circle(5).area()  // 78.539...
```

### Multiple Inheritance — Not Supported (But Mixins Work)

JavaScript only supports single inheritance. For multiple behaviors, use **mixins**:

```js
const Serializable = (Base) =>
  class extends Base {
    serialize() {
      return JSON.stringify(this)
    }
  }

const Timestamped = (Base) =>
  class extends Base {
    constructor(...args) {
      super(...args)
      this.createdAt = new Date()
    }
  }

class User {
  constructor(name) {
    this.name = name
  }
}

class EnhancedUser extends Timestamped(Serializable(User)) {}

const u = new EnhancedUser("Mark")
u.serialize()  // '{"name":"Mark","createdAt":"..."}'
u.createdAt    // Date object
```

## W — Why It Matters

- Class inheritance is the standard OOP pattern in JavaScript and TypeScript.
- Understanding `super` is essential for React class components and framework code.
- Knowing the prototype chain underneath helps debug unexpected inheritance behavior.
- Mixins solve the "multiple inheritance" problem that comes up in real architectures.
- Interview questions test `super`, `extends`, and the prototype chain relationship.

## I — Interview Questions with Answers

### Q1: How does `extends` work?

**A:** It sets up two prototype chains: the instance chain (`Child.prototype → Parent.prototype`) and the static chain (`Child → Parent`). It's syntactic sugar over `Object.create` and `Object.setPrototypeOf`.

### Q2: Why must `super()` come before `this` in a constructor?

**A:** In a derived class, the **parent** constructor is responsible for creating and initializing `this`. Until `super()` runs, `this` doesn't exist — accessing it throws a `ReferenceError`.

### Q3: Does JavaScript support multiple inheritance?

**A:** No. JavaScript supports single inheritance only. For multiple behaviors, use **mixins** — higher-order functions that extend a base class.

### Q4: What does `super.method()` do in a method?

**A:** It calls the **parent class's version** of the method, allowing you to extend rather than completely replace behavior.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `super()` in a derived constructor

```js
class Dog extends Animal {
  constructor(name) {
    this.name = name // ReferenceError: Must call super constructor
  }
}
```

**Fix:** Always call `super()` before accessing `this`.

### Pitfall: Not passing arguments to `super()`

```js
class Dog extends Animal {
  constructor(name, breed) {
    super() // forgot to pass name!
    this.breed = breed
  }
}

new Dog("Rex", "Lab").name // undefined
```

**Fix:** `super(name)`.

### Pitfall: Deep inheritance hierarchies

```
Animal → Dog → GuideDog → TrainedGuideDog → CertifiedGuideDog
```

**Fix:** Prefer **composition over inheritance**. Use mixins or delegate to contained objects instead of deep chains.

## K — Coding Challenge with Solution

### Challenge

Create:
1. `Shape` class with a `describe()` method returning `"I am a shape"`.
2. `Rectangle extends Shape` with `width`, `height`, `area()`, and `describe()` that calls `super.describe()`.
3. `Square extends Rectangle` that only takes `side`.

### Solution

```js
class Shape {
  describe() {
    return "I am a shape"
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super()
    this.width = width
    this.height = height
  }

  area() {
    return this.width * this.height
  }

  describe() {
    return `${super.describe()} — Rectangle ${this.width}x${this.height}`
  }
}

class Square extends Rectangle {
  constructor(side) {
    super(side, side) // pass side as both width and height
  }

  describe() {
    return `${super.describe()} (Square ${this.width})`
  }
}

const sq = new Square(5)
sq.area()     // 25
sq.describe() // "I am a shape — Rectangle 5x5 (Square 5)"
sq instanceof Square    // true
sq instanceof Rectangle // true
sq instanceof Shape     // true
```

---
