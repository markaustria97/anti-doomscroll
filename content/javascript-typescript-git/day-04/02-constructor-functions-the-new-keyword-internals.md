# 2 — Constructor Functions & the `new` Keyword Internals

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

The `new` keyword implementation question is a classic senior interview question. Understanding these four steps also explains why `class` syntax is essentially syntactic sugar, why returning an object from a constructor overrides the new instance, and why forgetting `new` pollutes globals.

## I — Interview Q&A

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
