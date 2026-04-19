# 3 — `call`, `apply`, `bind`

## T — TL;DR

`call`, `apply`, and `bind` let you **explicitly set `this`** when calling a function — `call`/`apply` invoke immediately (args as list vs array), `bind` returns a new permanently bound function.

## K — Key Concepts

### `call` — Invoke with Explicit `this` + Individual Args

```js
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`
}

const user = { name: "Mark" }

greet.call(user, "Hello", "!") // "Hello, Mark!"
```

### `apply` — Same as `call` but Args as an Array

```js
greet.apply(user, ["Hello", "!"]) // "Hello, Mark!"
```

**Memory trick:** **a**pply takes an **a**rray.

### `call` vs `apply` in Modern JS

With spread syntax, `apply` is mostly unnecessary:

```js
// Old way
Math.max.apply(null, [1, 2, 3]) // 3

// Modern way
Math.max(...[1, 2, 3]) // 3

// Old way: converting arguments
function example() {
  const args = Array.prototype.slice.call(arguments)
}

// Modern way: rest parameters
function example(...args) {}
```

### `bind` — Returns a New Function with Bound `this`

`bind` does **not** call the function. It returns a **new function** where `this` is permanently set:

```js
function greet() {
  return `Hello, ${this.name}`
}

const user = { name: "Mark" }
const greetMark = greet.bind(user)

greetMark() // "Hello, Mark"
```

### `bind` with Partial Application

`bind` can also pre-fill arguments:

```js
function multiply(a, b) {
  return a * b
}

const double = multiply.bind(null, 2) // this = null, a = 2
double(5)  // 10
double(10) // 20

const triple = multiply.bind(null, 3)
triple(5)  // 15
```

### `bind` Is Permanent

Once bound, `this` cannot be overridden (even by `call`/`apply` or another `bind`):

```js
function greet() {
  return this.name
}

const bound = greet.bind({ name: "Mark" })

bound.call({ name: "Alex" }) // "Mark" — bind wins over call!
bound.bind({ name: "Alex" })() // "Mark" — first bind wins!
```

The only thing that can override `bind` is the `new` operator:

```js
const Bound = greet.bind({ name: "Mark" })
const obj = new Bound() // this = new object, NOT { name: "Mark" }
```

### Common Real-World Uses

**1. Method borrowing:**

```js
const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 }

// Borrow array methods
Array.prototype.slice.call(arrayLike) // ["a", "b", "c"]
Array.prototype.forEach.call(arrayLike, (item) => console.log(item))
```

**2. Binding event handlers (class components):**

```js
class Button {
  constructor(label) {
    this.label = label
    this.handleClick = this.handleClick.bind(this) // permanent binding
  }

  handleClick() {
    console.log(`Clicked: ${this.label}`)
  }
}
```

**3. Logging with context:**

```js
const logger = {
  prefix: "[APP]",
  log(message) {
    console.log(`${this.prefix} ${message}`)
  },
}

const log = logger.log.bind(logger)
// Now `log` can be passed anywhere without losing context
log("Started") // "[APP] Started"
```

## W — Why It Matters

- `call`/`apply`/`bind` give you precise control over `this`.
- `bind` was essential in React class components (before hooks).
- Method borrowing with `call` appears in library code and polyfills.
- Understanding `bind`'s permanence explains subtle bugs when double-binding.
- Interview questions test the priority of `bind` vs `call` vs `new`.

## I — Interview Questions with Answers

### Q1: What is the difference between `call`, `apply`, and `bind`?

**A:** `call` invokes the function immediately with `this` and individual arguments. `apply` invokes immediately with `this` and an **array** of arguments. `bind` does **not** invoke — it returns a new function with `this` permanently bound.

### Q2: Can you override a `bind`?

**A:** No — not with `call`, `apply`, or another `bind`. The first `bind` wins. The **only** thing that overrides `bind` is the `new` operator.

### Q3: What is method borrowing?

**A:** Using `call` or `apply` to invoke a method from one object on a different object. Example: `Array.prototype.slice.call(arrayLikeObject)`.

### Q4: How does `bind` support partial application?

**A:** You can pass additional arguments after `this` context: `fn.bind(null, arg1, arg2)`. These are pre-filled — the returned function receives the remaining arguments.

## C — Common Pitfalls with Fix

### Pitfall: Using `bind` in a loop (creates new functions each time)

```js
items.forEach(function (item) {
  item.addEventListener("click", this.handleClick.bind(this)) // new function each iteration!
}, this)
```

**Fix:** Bind once in the constructor or use an arrow function.

### Pitfall: Forgetting that `bind` returns a NEW function

```js
const obj = {
  handler() { console.log("clicked") },
}

element.addEventListener("click", obj.handler.bind(obj))
element.removeEventListener("click", obj.handler.bind(obj)) // ❌ different function reference!
```

**Fix:** Store the bound reference:

```js
const boundHandler = obj.handler.bind(obj)
element.addEventListener("click", boundHandler)
element.removeEventListener("click", boundHandler) // ✅ same reference
```

### Pitfall: Passing `null` as `this` to `call`/`apply` in sloppy mode

```js
function fn() { console.log(this) }
fn.call(null) // window in sloppy mode! Potential security issue
```

**Fix:** Use strict mode (where `this` stays `null`) or pass an empty object: `fn.call(Object.create(null))`.

## K — Coding Challenge with Solution

### Challenge

Implement `myBind` — a simplified version of `Function.prototype.bind`:

```js
Function.prototype.myBind = function (context, ...presetArgs) {
  // your implementation
}

function greet(greeting, name) {
  return `${greeting}, ${name}! I'm ${this.role}.`
}

const adminGreet = greet.myBind({ role: "admin" }, "Hello")
console.log(adminGreet("Mark")) // "Hello, Mark! I'm admin."
```

### Solution

```js
Function.prototype.myBind = function (context, ...presetArgs) {
  const fn = this // the original function

  return function (...laterArgs) {
    return fn.apply(context, [...presetArgs, ...laterArgs])
  }
}

function greet(greeting, name) {
  return `${greeting}, ${name}! I'm ${this.role}.`
}

const adminGreet = greet.myBind({ role: "admin" }, "Hello")
console.log(adminGreet("Mark")) // "Hello, Mark! I'm admin."
```

Key insight: `myBind` returns a **closure** that captures `fn` (the original function), `context` (the bound `this`), and `presetArgs` (partially applied arguments).

---
