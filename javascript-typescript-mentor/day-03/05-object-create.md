# 5 — `Object.create`

## T — TL;DR

`Object.create(proto)` creates a new object with its `[[Prototype]]` explicitly set to `proto` — it's the purest form of prototypal inheritance, without constructors or `new`.

## K — Key Concepts

### Basic Usage

```js
const animal = {
  speak() {
    return `${this.name} makes a sound`
  },
}

const dog = Object.create(animal)
dog.name = "Rex"

dog.speak() // "Rex makes a sound" — inherited from animal
Object.getPrototypeOf(dog) === animal // true
```

### With Property Descriptors (Second Argument)

```js
const dog = Object.create(animal, {
  name: {
    value: "Rex",
    writable: true,
    enumerable: true,
    configurable: true,
  },
  breed: {
    value: "Labrador",
    writable: false, // read-only
    enumerable: true,
    configurable: false,
  },
})

dog.name  // "Rex"
dog.breed // "Labrador"
dog.breed = "Poodle" // silently fails (or throws in strict mode)
```

### `Object.create(null)` — Prototype-Free Objects

Creates an object with **no prototype** — no `toString`, no `hasOwnProperty`, nothing:

```js
const dict = Object.create(null)
dict.key = "value"

console.log(dict.toString) // undefined — no prototype!
console.log("key" in dict) // true
console.log(dict)          // [Object: null prototype] { key: "value" }
```

This is useful for:
- **Safe dictionaries** — no inherited properties to collide with keys
- **No prototype pollution** risk

```js
const safeMap = Object.create(null)
safeMap["__proto__"] = "safe" // just a regular property, no prototype manipulation
safeMap["constructor"] = "also safe"
```

### Prototypal Inheritance Without Classes

```js
const vehicle = {
  init(make, model) {
    this.make = make
    this.model = model
    return this
  },
  describe() {
    return `${this.make} ${this.model}`
  },
}

const car = Object.create(vehicle)
car.drive = function () {
  return `${this.describe()} is driving`
}

const myCar = Object.create(car).init("Toyota", "Camry")
myCar.describe() // "Toyota Camry"
myCar.drive()    // "Toyota Camry is driving"
```

### `Object.create` vs `new`

| Feature | `Object.create(proto)` | `new Constructor()` |
|---------|----------------------|---------------------|
| Prototype source | Explicit `proto` argument | `Constructor.prototype` |
| Constructor called? | No | Yes |
| Needs a function? | No | Yes |
| Flexibility | High — any object as prototype | Tied to constructor pattern |

### `Object.create` Under the Hood of `class`

When you write:

```js
class Dog extends Animal {}
const rex = new Dog("Rex")
```

Internally, JavaScript does something like:

```js
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
```

## W — Why It Matters

- `Object.create` is the **foundation** of prototypal inheritance.
- `Object.create(null)` is used in production for safe dictionaries (no prototype pollution).
- Understanding it reveals how `class` works under the hood.
- Libraries like Lodash and frameworks use `Object.create` internally.
- It's the preferred way to set up inheritance without `class` in certain patterns.

## I — Interview Questions with Answers

### Q1: What does `Object.create` do?

**A:** Creates a new object with its `[[Prototype]]` set to the provided object. It's the most direct way to establish prototypal inheritance.

### Q2: What is `Object.create(null)` and when would you use it?

**A:** It creates an object with **no prototype** (`[[Prototype]]` is `null`). Useful for safe dictionaries/maps where you don't want inherited properties like `toString` or `constructor` interfering with your keys.

### Q3: How is `Object.create` different from `new`?

**A:** `Object.create` sets the prototype directly without calling a constructor. `new` calls the constructor function and sets the prototype to `Constructor.prototype`. `Object.create` is more flexible — it works with any object, not just functions.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting that `Object.create(null)` objects lack common methods

```js
const dict = Object.create(null)
dict.hasOwnProperty("key") // TypeError: not a function!
```

**Fix:** Use `Object.hasOwn(dict, "key")` or `Object.prototype.hasOwnProperty.call(dict, "key")`.

### Pitfall: Sharing mutable properties through the prototype

```js
const proto = {
  items: [], // shared across all children — mutation leaks!
}

const a = Object.create(proto)
const b = Object.create(proto)

a.items.push("x")
console.log(b.items) // ["x"] — same array!
```

**Fix:** Initialize mutable properties on the instance, not the prototype:

```js
const a = Object.create(proto)
a.items = [] // own property — not shared
```

## K — Coding Challenge with Solution

### Challenge

Create a simple prototypal inheritance chain using `Object.create`:

1. `shape` has a method `area()` that returns `0`.
2. `rectangle` inherits from `shape`, overrides `area()` to return `width * height`.
3. `square` inherits from `rectangle`, only needs `side`.

```js
const sq = createSquare(5)
sq.area() // 25
```

### Solution

```js
const shape = {
  area() {
    return 0
  },
}

const rectangle = Object.create(shape)
rectangle.init = function (width, height) {
  this.width = width
  this.height = height
  return this
}
rectangle.area = function () {
  return this.width * this.height
}

const square = Object.create(rectangle)

function createSquare(side) {
  return Object.create(square).init(side, side)
}

const sq = createSquare(5)
console.log(sq.area()) // 25
console.log(Object.getPrototypeOf(Object.getPrototypeOf(sq)) === rectangle) // true
```

---
