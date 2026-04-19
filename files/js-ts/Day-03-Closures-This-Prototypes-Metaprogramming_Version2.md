
# 📘 Day 3 — Closures, `this`, Prototypes & Metaprogramming

> Phase 1 · JavaScript Basics to Advanced
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Closure Patterns & Practical Uses](#1--closure-patterns--practical-uses)
2. [`this` Binding Rules](#2--this-binding-rules)
3. [`call`, `apply`, `bind`](#3--call-apply-bind)
4. [Prototype Chain](#4--prototype-chain)
5. [`Object.create`](#5--objectcreate)
6. [`class` Syntax Internals](#6--class-syntax-internals)
7. [`get`/`set` Accessors](#7--getset-accessors)
8. [Inheritance (Prototypal & Class-Based)](#8--inheritance-prototypal--class-based)
9. [`Symbol.toPrimitive`](#9--symboltoprimitive)
10. [`Proxy`](#10--proxy)
11. [`Reflect`](#11--reflect)
12. [Practical Metaprogramming (Validation, Logging, Reactive Traps)](#12--practical-metaprogramming-validation-logging-reactive-traps)

---

# 1 — Closure Patterns & Practical Uses

## T — TL;DR

A closure is a function that **remembers variables from its lexical scope** even after the outer function has returned — it's the engine behind data privacy, factories, memoization, and React hooks.

## K — Key Concepts

### Quick Recap (From Day 2 Bridge)

```js
function outer() {
  let count = 0
  return function inner() {
    return ++count
  }
}

const counter = outer()
counter() // 1
counter() // 2
counter() // 3
// `count` is private — inaccessible from outside
```

The returned `inner` function "closes over" `count`. The variable survives because the closure holds a **live reference** to it.

### Pattern 1: Data Privacy / Encapsulation

The **module pattern** — closures are the original way to create private state in JS:

```js
function createBankAccount(initialBalance) {
  let balance = initialBalance // private

  return {
    deposit(amount) {
      if (amount <= 0) throw new RangeError("Amount must be positive")
      balance += amount
      return balance
    },
    withdraw(amount) {
      if (amount > balance) throw new RangeError("Insufficient funds")
      balance -= amount
      return balance
    },
    getBalance() {
      return balance
    },
  }
}

const account = createBankAccount(100)
account.deposit(50)      // 150
account.withdraw(30)     // 120
account.getBalance()     // 120
// account.balance        // undefined — private!
```

Why this matters: before `class` with `#private` fields, closures were the **only** way to achieve true privacy.

### Pattern 2: Function Factories

Create specialized functions from a general template:

```js
function createMultiplier(factor) {
  return (number) => number * factor
}

const double = createMultiplier(2)
const triple = createMultiplier(3)
const toPercent = createMultiplier(100)

double(5)     // 10
triple(5)     // 15
toPercent(0.85) // 85
```

Each returned function closes over its own `factor`.

### Pattern 3: Memoization

Cache expensive computation results:

```js
function memoize(fn) {
  const cache = new Map() // closed over — persists across calls

  return function (...args) {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      console.log("Cache hit")
      return cache.get(key)
    }

    console.log("Computing...")
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

const expensiveAdd = memoize((a, b) => {
  // Simulate expensive work
  return a + b
})

expensiveAdd(1, 2) // "Computing..." → 3
expensiveAdd(1, 2) // "Cache hit" → 3
expensiveAdd(3, 4) // "Computing..." → 7
```

The `cache` lives in the closure — it persists between calls but is invisible from outside.

### Pattern 4: Partial Application

Pre-fill some arguments:

```js
function partial(fn, ...presetArgs) {
  return (...laterArgs) => fn(...presetArgs, ...laterArgs)
}

function log(level, message, timestamp) {
  console.log(`[${level}] ${timestamp}: ${message}`)
}

const warn = partial(log, "WARN")
const error = partial(log, "ERROR")

warn("Disk almost full", Date.now())
error("Connection lost", Date.now())
```

### Pattern 5: Once — Run Only One Time

```js
function once(fn) {
  let called = false
  let result

  return function (...args) {
    if (called) return result
    called = true
    result = fn(...args)
    return result
  }
}

const initialize = once(() => {
  console.log("Initializing...")
  return { ready: true }
})

initialize() // "Initializing..." → { ready: true }
initialize() // → { ready: true } (no log — fn not called again)
initialize() // → { ready: true }
```

### Pattern 6: Closures in Iterators / Event Handlers

```js
function createCounter(start = 0) {
  let current = start
  return {
    next() { return current++ },
    reset() { current = start },
  }
}

// Event handler with closure (React-like pattern)
function createClickHandler(itemId) {
  return (event) => {
    console.log(`Item ${itemId} clicked`, event.target)
  }
}

// Each handler remembers its own itemId
document.getElementById("btn1")?.addEventListener("click", createClickHandler(1))
document.getElementById("btn2")?.addEventListener("click", createClickHandler(2))
```

### Closures Capture References, Not Values

This is **critical**:

```js
function create() {
  let x = 1
  const getX = () => x
  x = 2 // mutation AFTER getX is created
  return getX
}

create()() // 2 — NOT 1!
```

The closure holds a **reference** to `x`, not a snapshot. When `x` changes, the closure sees the new value.

### The Loop Closure Problem (Classic Interview Question)

```js
// Bug: var is function-scoped — one shared i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 3, 3, 3

// Fix 1: let (creates new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 0, 1, 2

// Fix 2: IIFE (creates a new closure per iteration)
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 100)
  })(i)
}
// 0, 1, 2

// Fix 3: bind
for (var i = 0; i < 3; i++) {
  setTimeout(console.log.bind(null, i), 100)
}
// 0, 1, 2
```

## W — Why It Matters

- **React hooks** (`useState`, `useEffect`, `useCallback`) are closures internally.
- **Data privacy** before `#private` fields relied entirely on closures.
- **Memoization** (used in `useMemo`, `React.memo`, caching layers) is a closure pattern.
- **Event handlers** in every framework use closures to capture context.
- **Currying and partial application** power functional programming in JS/TS.
- Closures are the **single most tested JS concept** in interviews.

## I — Interview Questions with Answers

### Q1: What is a closure?

**A:** A closure is a function that retains access to variables from its lexical scope even after the outer function has returned. It captures live **references** to outer variables, not copies of their values.

### Q2: What practical problems do closures solve?

**A:** Data privacy (encapsulating state), function factories (creating specialized functions), memoization (caching), partial application (pre-filling arguments), and once-functions (limiting execution). They're also the mechanism behind React hooks.

### Q3: Do closures capture values or references?

**A:** **References.** If the closed-over variable changes after the closure is created, the closure sees the updated value.

### Q4: Explain the loop closure bug with `var`.

**A:** `var` is function-scoped, so all iterations of a `for` loop share the **same** `i`. By the time `setTimeout` callbacks run, the loop has finished and `i` is at its final value. Fix: use `let` (block-scoped, new binding per iteration), an IIFE, or `.bind()`.

### Q5: What is memoization?

**A:** A technique where a function caches its results based on input arguments. On repeated calls with the same arguments, it returns the cached result instead of recomputing. Closures hold the cache.

## C — Common Pitfalls with Fix

### Pitfall: Stale closures

```js
function createTimer() {
  let count = 0

  setInterval(() => {
    console.log(count) // always logs the LATEST count
  }, 1000)

  return {
    increment() { count++ },
  }
}
```

In React, stale closures happen when `useEffect` captures old state:

```js
// React example of stale closure
useEffect(() => {
  const id = setInterval(() => {
    console.log(count) // captures the count from render time
  }, 1000)
  return () => clearInterval(id)
}, []) // empty deps — count is captured once and never updated
```

**Fix:** Add dependencies (`[count]`), use `useRef`, or use the updater form (`setCount(c => c + 1)`).

### Pitfall: Memory leaks from closures

```js
function createHandler() {
  const hugeData = new Array(1_000_000).fill("x") // large allocation

  return () => {
    console.log(hugeData.length) // closure keeps hugeData alive
  }
}

const handler = createHandler() // hugeData is never GC'd while handler exists
```

**Fix:** Only close over what you need. Set large references to `null` when done. (More on Day 6.)

### Pitfall: Confusing closure scope with `this`

```js
const obj = {
  name: "Mark",
  greet() {
    const inner = function () {
      console.log(this.name) // `this` is NOT obj here — it's undefined (strict) or window
    }
    inner()
  },
}
```

**Fix:** Use an arrow function for `inner` (inherits `this` lexically), or `const self = this`.

## K — Coding Challenge with Solution

### Challenge

Create a `createRateLimiter(fn, limit)` function that:
- Calls `fn` at most once per `limit` milliseconds.
- Ignores calls during the cooldown period.
- Returns the last result if called during cooldown.

```js
const limited = createRateLimiter((x) => x * 2, 1000)
limited(5) // 10 (executes)
limited(10) // 10 (ignored — still in cooldown, returns last result)
// ... after 1000ms
limited(10) // 20 (executes)
```

### Solution

```js
function createRateLimiter(fn, limit) {
  let lastCall = 0
  let lastResult

  return function (...args) {
    const now = Date.now()

    if (now - lastCall >= limit) {
      lastCall = now
      lastResult = fn(...args)
    }

    return lastResult
  }
}
```

Closures at work: `lastCall`, `lastResult`, `fn`, and `limit` are all captured in the returned function's closure.

---

# 2 — `this` Binding Rules

## T — TL;DR

`this` in JavaScript is determined by **how a function is called**, not where it's defined — there are exactly **four binding rules** plus arrow functions (which inherit `this` lexically).

## K — Key Concepts

### The Four Binding Rules (In Priority Order)

#### Rule 1: `new` Binding (Highest Priority)

When a function is called with `new`, `this` refers to the **newly created object**:

```js
function User(name) {
  // this = {} (new empty object)
  this.name = name
  // return this (implicit)
}

const user = new User("Mark")
console.log(user.name) // "Mark"
console.log(user)      // User { name: "Mark" }
```

What `new` does:
1. Creates a new empty object.
2. Sets the object's `[[Prototype]]` to the function's `.prototype`.
3. Binds `this` to the new object.
4. Returns the object (unless the function explicitly returns a different object).

#### Rule 2: Explicit Binding

When you explicitly set `this` using `call`, `apply`, or `bind`:

```js
function greet() {
  console.log(`Hello, ${this.name}`)
}

const user = { name: "Mark" }

greet.call(user)  // "Hello, Mark"
greet.apply(user) // "Hello, Mark"

const boundGreet = greet.bind(user)
boundGreet()      // "Hello, Mark"
```

(Covered in detail in the next topic.)

#### Rule 3: Implicit Binding

When a function is called **as a method** of an object, `this` is the object **before the dot**:

```js
const obj = {
  name: "Mark",
  greet() {
    console.log(`Hello, ${this.name}`)
  },
}

obj.greet() // "Hello, Mark" — this = obj (the object before the dot)
```

**Chaining:**

```js
const a = {
  b: {
    name: "Nested",
    greet() {
      console.log(this.name)
    },
  },
}

a.b.greet() // "Nested" — this = a.b (the immediate object before .greet)
```

#### Rule 4: Default Binding (Lowest Priority)

When a function is called with no context — as a **standalone** call:

```js
function showThis() {
  console.log(this)
}

showThis()
// Sloppy mode: this = window (browser) / globalThis (Node)
// Strict mode: this = undefined
```

### Arrow Functions: Lexical `this`

Arrow functions **do not follow the four rules**. They inherit `this` from the **enclosing lexical scope** at definition time:

```js
const obj = {
  name: "Mark",

  regularMethod() {
    console.log(this.name) // "Mark" — implicit binding (Rule 3)

    const arrowInside = () => {
      console.log(this.name) // "Mark" — inherits this from regularMethod
    }
    arrowInside()

    const regularInside = function () {
      console.log(this.name) // undefined — default binding (Rule 4, strict)
    }
    regularInside()
  },
}

obj.regularMethod()
```

### The Priority Summary

```
new Binding         →  highest priority
Explicit Binding    →  call/apply/bind
Implicit Binding    →  obj.method()
Default Binding     →  standalone call (lowest)

Arrow functions     →  skip all rules, use lexical this
```

### Implicit Binding Loss

This is one of the most common bugs:

```js
const obj = {
  name: "Mark",
  greet() {
    console.log(this.name)
  },
}

obj.greet() // "Mark" ✅

const fn = obj.greet // extracting the method
fn() // undefined ❌ — lost implicit binding! Now it's a standalone call (Rule 4)
```

This happens constantly when passing methods as callbacks:

```js
setTimeout(obj.greet, 100)  // undefined — lost binding
button.addEventListener("click", obj.greet) // undefined — lost binding
```

**Fixes:**

```js
// Fix 1: Arrow function wrapper
setTimeout(() => obj.greet(), 100)

// Fix 2: bind
setTimeout(obj.greet.bind(obj), 100)

// Fix 3: Arrow function method (but careful — see pitfalls)
```

### `this` in Common Scenarios

| Scenario | `this` Value |
|----------|-------------|
| `obj.method()` | `obj` |
| `fn()` (sloppy) | `window` / `globalThis` |
| `fn()` (strict) | `undefined` |
| `new Fn()` | new object |
| `fn.call(obj)` | `obj` |
| `fn.bind(obj)()` | `obj` |
| `() => {}` | lexical (enclosing `this`) |
| Event handler (DOM) | the element |
| `class` method via callback | `undefined` (without bind) |

## W — Why It Matters

- `this` bugs are one of the most common sources of confusion in JavaScript.
- React class components required `.bind(this)` in constructors — understanding why is still relevant.
- Event handlers, callbacks, and method extraction all trigger `this` issues.
- Arrow functions fixed many `this` problems but introduced new patterns to understand.
- **Every JS interview** includes `this` binding questions.

## I — Interview Questions with Answers

### Q1: How is `this` determined in JavaScript?

**A:** By **how the function is called**, not where it's defined. Four rules (in priority order): `new` binding, explicit binding (`call`/`apply`/`bind`), implicit binding (method call), default binding (standalone call). Arrow functions are the exception — they inherit `this` from their enclosing lexical scope.

### Q2: What is implicit binding loss?

**A:** When a method is extracted from an object and called as a standalone function, the implicit `this` binding is lost. `this` falls back to the default binding (global object in sloppy mode, `undefined` in strict mode).

### Q3: Why do arrow functions not have their own `this`?

**A:** By design, arrow functions capture `this` from the enclosing scope at definition time. This makes them ideal for callbacks where you want to preserve the outer `this`, eliminating the need for `const self = this` or `.bind()`.

### Q4: What does this print?

```js
const obj = {
  x: 10,
  getX: () => this.x,
}
console.log(obj.getX())
```

**A:** `undefined`. The arrow function captures `this` from the **enclosing scope** (module/global), not from `obj`. Arrow functions should not be used as object methods.

## C — Common Pitfalls with Fix

### Pitfall: Using arrow functions as object methods

```js
const obj = {
  name: "Mark",
  greet: () => console.log(this.name), // this is NOT obj
}
obj.greet() // undefined
```

**Fix:** Use shorthand method syntax:

```js
const obj = {
  name: "Mark",
  greet() { console.log(this.name) },
}
```

### Pitfall: Passing methods as callbacks

```js
class Timer {
  constructor() { this.seconds = 0 }
  tick() { this.seconds++ }
  start() {
    setInterval(this.tick, 1000) // `this` is lost!
  }
}
```

**Fix:** Bind or use arrow:

```js
start() {
  setInterval(() => this.tick(), 1000) // arrow preserves this
  // or
  setInterval(this.tick.bind(this), 1000)
}
```

### Pitfall: Thinking `this` inside a nested regular function inherits from the outer method

```js
const obj = {
  name: "Mark",
  greet() {
    function inner() {
      console.log(this.name) // undefined — default binding, not obj!
    }
    inner()
  },
}
```

**Fix:** Use an arrow function for `inner`, or `const self = this`.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` output?

```js
const user = {
  name: "Mark",
  greet() {
    console.log("A:", this.name)
  },
  greetArrow: () => {
    console.log("B:", this.name)
  },
  greetDelayed() {
    setTimeout(function () {
      console.log("C:", this.name)
    }, 0)
    setTimeout(() => {
      console.log("D:", this.name)
    }, 0)
  },
}

user.greet()
user.greetArrow()
user.greetDelayed()
```

### Solution

```js
user.greet()        // A: "Mark"     — implicit binding (Rule 3)
user.greetArrow()   // B: undefined  — arrow inherits outer this (module/global)
// After setTimeout:
                    // C: undefined  — regular function in setTimeout = default binding
                    // D: "Mark"     — arrow inherits this from greetDelayed
```

---

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

# 4 — Prototype Chain

## T — TL;DR

Every JavaScript object has a hidden `[[Prototype]]` link to another object, forming a **chain** — when you access a property, JS walks up this chain until it finds the property or reaches `null`.

## K — Key Concepts

### The `[[Prototype]]` Link

Every object has an internal `[[Prototype]]` property pointing to another object (or `null`):

```js
const animal = { eats: true }
const rabbit = { jumps: true }

// Set rabbit's prototype to animal
Object.setPrototypeOf(rabbit, animal)

console.log(rabbit.jumps) // true — own property
console.log(rabbit.eats)  // true — found on prototype (animal)
```

### How Property Lookup Works

```
rabbit.eats
  1. Check rabbit → no "eats" property
  2. Check rabbit.[[Prototype]] (animal) → found! → return true

rabbit.toString()
  1. Check rabbit → no "toString"
  2. Check animal → no "toString"
  3. Check Object.prototype → found! → return the method
```

### `__proto__` vs `prototype` vs `[[Prototype]]`

This is the most confusing part. Let's clarify:

| Term | What It Is |
|------|-----------|
| `[[Prototype]]` | Internal slot on every object — the actual prototype link |
| `__proto__` | Legacy **getter/setter** that accesses `[[Prototype]]` — avoid in production |
| `.prototype` | A **property** on functions/classes — becomes the `[[Prototype]]` of objects created with `new` |

```js
function Dog(name) {
  this.name = name
}
Dog.prototype.bark = function () { return "Woof!" }

const rex = new Dog("Rex")

// These are all accessing the SAME object:
rex.__proto__ === Dog.prototype       // true
Object.getPrototypeOf(rex) === Dog.prototype // true (preferred way)
```

Visual:

```
rex → { name: "Rex" }
  [[Prototype]] → Dog.prototype → { bark: function, constructor: Dog }
    [[Prototype]] → Object.prototype → { toString, hasOwnProperty, ... }
      [[Prototype]] → null (end of chain)
```

### `.prototype` Only Exists on Functions

```js
function Foo() {}
console.log(Foo.prototype) // { constructor: Foo }

const obj = {}
console.log(obj.prototype) // undefined — regular objects don't have .prototype
```

### `Object.getPrototypeOf` (The Right Way)

```js
const arr = [1, 2, 3]

Object.getPrototypeOf(arr) === Array.prototype // true
Object.getPrototypeOf(Array.prototype) === Object.prototype // true
Object.getPrototypeOf(Object.prototype) === null // true — end of chain
```

### Own Properties vs Inherited Properties

```js
const parent = { inherited: true }
const child = Object.create(parent)
child.own = true

console.log(child.own)       // true (own)
console.log(child.inherited) // true (inherited from prototype)

console.log(child.hasOwnProperty("own"))       // true
console.log(child.hasOwnProperty("inherited")) // false
console.log(Object.hasOwn(child, "own"))       // true (modern, preferred)
```

### Property Shadowing

If an object has its own property with the same name as a prototype property, the own property **shadows** (hides) the inherited one:

```js
const parent = { name: "Parent" }
const child = Object.create(parent)
child.name = "Child" // shadows parent.name

console.log(child.name) // "Child" — own property
delete child.name
console.log(child.name) // "Parent" — now inherited property is visible
```

### The Full Prototype Chain

```
{} → Object.prototype → null
[] → Array.prototype → Object.prototype → null
function(){} → Function.prototype → Object.prototype → null
"hello" (autoboxed) → String.prototype → Object.prototype → null
```

Everything eventually reaches `Object.prototype`, then `null`.

## W — Why It Matters

- The prototype chain is **how inheritance works** in JavaScript — `class` is syntax sugar over this.
- Understanding the chain explains why `[].map` works (it's on `Array.prototype`).
- Property lookup performance depends on chain length.
- Interview questions test `__proto__` vs `.prototype` to gauge depth of understanding.
- Knowing prototypes makes you understand `class` at a deeper level (covered next).

## I — Interview Questions with Answers

### Q1: What is the prototype chain?

**A:** A linked list of objects connected via `[[Prototype]]`. When a property is accessed, JavaScript walks up this chain until it finds the property or reaches `null` (the end of the chain).

### Q2: What is the difference between `__proto__` and `.prototype`?

**A:** `__proto__` is a legacy accessor for an object's `[[Prototype]]` (use `Object.getPrototypeOf` instead). `.prototype` is a property on **functions** — it becomes the `[[Prototype]]` of objects created with `new`.

### Q3: Where does the chain end?

**A:** At `null`. `Object.getPrototypeOf(Object.prototype) === null`.

### Q4: What is property shadowing?

**A:** When an object has its own property with the same name as a prototype property, the own property takes precedence. The prototype property still exists but is hidden.

## C — Common Pitfalls with Fix

### Pitfall: Confusing `.prototype` with `[[Prototype]]`

```js
const obj = {}
obj.prototype // undefined — regular objects don't have .prototype
Object.getPrototypeOf(obj) // Object.prototype — THIS is the [[Prototype]]
```

**Fix:** Use `Object.getPrototypeOf()` to access `[[Prototype]]`.

### Pitfall: Modifying `Object.prototype`

```js
Object.prototype.custom = "bad" // affects ALL objects!
const obj = {}
obj.custom // "bad" — leaked
```

**Fix:** Never modify built-in prototypes in production. Use `Object.create(null)` for prototype-free objects.

### Pitfall: Using `for...in` without `hasOwn` check

```js
const parent = { inherited: true }
const child = Object.create(parent)
child.own = true

for (const key in child) {
  console.log(key) // "own", "inherited" — includes inherited!
}
```

**Fix:**

```js
for (const key in child) {
  if (Object.hasOwn(child, key)) {
    console.log(key) // "own" only
  }
}
// Or use Object.keys(child) — only own enumerable keys
```

## K — Coding Challenge with Solution

### Challenge

What does each line return?

```js
function Animal(name) {
  this.name = name
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`
}

const dog = new Animal("Rex")

console.log(dog.name)
console.log(dog.speak())
console.log(dog.hasOwnProperty("name"))
console.log(dog.hasOwnProperty("speak"))
console.log(Object.getPrototypeOf(dog) === Animal.prototype)
console.log(Object.getPrototypeOf(Animal.prototype) === Object.prototype)
```

### Solution

```js
dog.name                     // "Rex" — own property
dog.speak()                  // "Rex makes a sound" — inherited from Animal.prototype
dog.hasOwnProperty("name")  // true — own property
dog.hasOwnProperty("speak") // false — inherited, not own
Object.getPrototypeOf(dog) === Animal.prototype       // true
Object.getPrototypeOf(Animal.prototype) === Object.prototype // true
```

---

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

# 6 — `class` Syntax Internals

## T — TL;DR

`class` in JavaScript is **syntactic sugar** over the prototype chain — it provides cleaner syntax but uses the exact same prototype mechanism under the hood.

## K — Key Concepts

### Basic Class

```js
class User {
  constructor(name, email) {
    this.name = name    // instance property
    this.email = email  // instance property
  }

  // Method — goes on User.prototype
  greet() {
    return `Hi, I'm ${this.name}`
  }
}

const user = new User("Mark", "mark@example.com")
user.greet() // "Hi, I'm Mark"
```

### What the Engine Actually Does

```js
class User {
  constructor(name) { this.name = name }
  greet() { return `Hi, ${this.name}` }
}

// Is equivalent to:
function User(name) {
  this.name = name
}
User.prototype.greet = function () {
  return `Hi, ${this.name}`
}
```

Proof:

```js
typeof User           // "function" — classes ARE functions
User.prototype.greet  // [Function: greet]
user.constructor === User  // true
```

### But Classes Have Key Differences from Functions

| Feature | Function constructor | `class` |
|---------|---------------------|---------|
| Must use `new` | No (but should) | Yes — throws without `new` |
| Hoisted? | Yes (declarations) | No — TDZ like `let` |
| Strict mode? | Depends | Always strict |
| Enumerable methods? | Yes | No — class methods are non-enumerable |
| `typeof` | `"function"` | `"function"` |

### Class Fields (Instance Properties)

```js
class Counter {
  count = 0 // public field — goes on the instance, not prototype

  increment() {
    this.count++
  }
}

const c = new Counter()
c.increment()
console.log(c.count) // 1
console.log(c.hasOwnProperty("count")) // true — it's an own property
```

### Private Fields (`#`)

True privacy — not just convention:

```js
class BankAccount {
  #balance // private field

  constructor(initial) {
    this.#balance = initial
  }

  deposit(amount) {
    this.#balance += amount
  }

  getBalance() {
    return this.#balance
  }
}

const account = new BankAccount(100)
account.deposit(50)
account.getBalance()    // 150
// account.#balance     // SyntaxError: Private field '#balance' must be declared
```

Private methods:

```js
class User {
  #validateEmail(email) {
    return email.includes("@")
  }

  setEmail(email) {
    if (!this.#validateEmail(email)) {
      throw new Error("Invalid email")
    }
    this.email = email
  }
}
```

### Static Members

```js
class MathUtils {
  static PI = 3.14159

  static add(a, b) {
    return a + b
  }

  static #secret = "hidden" // private static
}

MathUtils.add(1, 2) // 3
MathUtils.PI         // 3.14159
// MathUtils.#secret // SyntaxError

// Static methods are NOT on the prototype
const m = new MathUtils()
// m.add(1, 2) // TypeError: m.add is not a function
```

### `constructor` Is Optional

```js
class Empty {}
// Same as:
class Empty {
  constructor() {} // implicit empty constructor
}
```

### Classes Are Not Hoisted (TDZ)

```js
// const u = new User() // ReferenceError — TDZ
class User {}
const u = new User() // ✅
```

### `instanceof` and Classes

```js
class Animal {}
class Dog extends Animal {}

const d = new Dog()

d instanceof Dog    // true
d instanceof Animal // true
d instanceof Object // true
```

`instanceof` walks up the prototype chain checking if any `[[Prototype]]` matches.

## W — Why It Matters

- `class` is the standard way to write OOP JavaScript, used everywhere in frameworks.
- Understanding it as sugar over prototypes means you can debug and extend behavior at a deeper level.
- Private fields (`#`) are the modern way to encapsulate state — replacing closure-based privacy.
- Static members are used for utility methods, factory patterns, and constants.
- Interviews often ask "how does `class` differ from constructor functions?"

## I — Interview Questions with Answers

### Q1: Is `class` just syntactic sugar?

**A:** Mostly, yes — it uses the same prototype mechanism. But classes add: mandatory `new`, non-enumerable methods, automatic strict mode, and true private fields (`#`) that aren't possible with plain functions.

### Q2: Where do class methods live?

**A:** On the class's `prototype` object, not on each instance. Class **fields** (not methods) live on each instance.

### Q3: What are private fields?

**A:** Properties prefixed with `#` that are only accessible inside the class body. Unlike the `_convention` pattern, they are truly private — accessing them outside the class is a `SyntaxError`.

### Q4: Are classes hoisted?

**A:** Classes are hoisted (the engine knows they exist) but are in the **TDZ** — you can't use them before the declaration line. This is different from function declarations, which are fully hoisted.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `new` with classes

```js
class User {}
const u = User() // TypeError: Class constructor User cannot be invoked without 'new'
```

**Fix:** Always use `new` with classes. This is enforced — unlike constructor functions.

### Pitfall: Expecting class methods to be bound to the instance

```js
class Button {
  label = "Click me"
  handleClick() {
    console.log(this.label) // `this` depends on how handleClick is called!
  }
}

const btn = new Button()
const fn = btn.handleClick
fn() // TypeError: Cannot read properties of undefined
```

**Fix:** Use an arrow function in a class field:

```js
class Button {
  label = "Click me"
  handleClick = () => {
    console.log(this.label) // arrow captures `this` from construction
  }
}
```

Or bind in the constructor.

### Pitfall: Thinking `#private` and `_convention` are the same

```js
class A {
  _notPrivate = 1  // accessible from outside — just a convention
  #truePrivate = 2 // SyntaxError if accessed from outside
}
```

**Fix:** Use `#` for actual privacy.

## K — Coding Challenge with Solution

### Challenge

Create a `Stack` class with:
- Private `#items` array
- `push(item)`, `pop()`, `peek()`, `size` (getter)
- `isEmpty` (static method)

### Solution

```js
class Stack {
  #items = []

  push(item) {
    this.#items.push(item)
    return this
  }

  pop() {
    if (this.#items.length === 0) {
      throw new RangeError("Stack is empty")
    }
    return this.#items.pop()
  }

  peek() {
    return this.#items.at(-1)
  }

  get size() {
    return this.#items.length
  }

  static isEmpty(stack) {
    return stack.size === 0
  }
}

const s = new Stack()
s.push(1).push(2).push(3)
s.peek()           // 3
s.pop()            // 3
s.size             // 2
Stack.isEmpty(s)   // false
// s.#items         // SyntaxError — private!
```

---

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

# 9 — `Symbol.toPrimitive`

## T — TL;DR

`Symbol.toPrimitive` is a well-known Symbol that lets you **control how an object converts** to a primitive value (string, number, or default) — it's the hook into JavaScript's type coercion system.

## K — Key Concepts

### The Three Hints

When JavaScript needs to convert an object to a primitive, it passes a **hint** indicating the preferred type:

| Hint | When |
|------|------|
| `"number"` | Arithmetic, comparison (`+obj`, `obj > 5`, `Number(obj)`) |
| `"string"` | Template literals, `String(obj)`, `alert(obj)` |
| `"default"` | `+` operator (when JS doesn't know if it's concat or add), `==` |

### Default Coercion (Without `Symbol.toPrimitive`)

By default, JS calls:
1. `valueOf()` for number hint → returns the object itself by default
2. `toString()` for string hint → returns `"[object Object]"` by default

```js
const obj = { name: "Mark" }

console.log(+obj)      // NaN — valueOf returns the object, which becomes NaN
console.log(`${obj}`)  // "[object Object]" — toString
console.log(obj + "")  // "[object Object]" — default hint, then toString
```

### Customizing with `Symbol.toPrimitive`

```js
class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number":
        return this.amount
      case "string":
        return `${this.amount} ${this.currency}`
      case "default":
        return this.amount
    }
  }
}

const price = new Money(9.99, "USD")

// Number context
+price              // 9.99
price > 5           // true
price * 2           // 19.98

// String context
`${price}`          // "9.99 USD"
String(price)       // "9.99 USD"

// Default context
price + 10          // 19.99 (treated as number)
price == 9.99       // true
```

### Overriding `valueOf` and `toString` (Older Pattern)

Before `Symbol.toPrimitive`, you'd override these individually:

```js
class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }

  valueOf() {
    return this.amount // used for number coercion
  }

  toString() {
    return `${this.amount} ${this.currency}` // used for string coercion
  }
}
```

`Symbol.toPrimitive` takes **priority** over both `valueOf` and `toString`.

### Priority Order

```
1. Symbol.toPrimitive (if defined) — always wins
2. valueOf() (for "number" and "default" hints)
3. toString() (for "string" hint)
```

### Practical Use Case: Dates

`Date` has its own `Symbol.toPrimitive`:

```js
const now = new Date()

+now        // 1713500000000 (timestamp — number hint)
`${now}`    // "Sat Apr 19 2026 ..." (readable — string hint)
now + 1     // "Sat Apr 19 2026 ...1" (string! — default hint for Date prefers string)
```

Note: `Date` is special — its default hint produces a **string**, unlike most objects which produce a number.

## W — Why It Matters

- `Symbol.toPrimitive` gives you complete control over coercion behavior.
- It's used in libraries for custom types (Money, Date, Vector, etc.).
- Understanding coercion hooks explains why `Date + 1` produces a string, not a number.
- This is a bridge to the well-known Symbols ecosystem (Day 7) and metaprogramming.
- Demonstrates deep JS knowledge in interviews.

## I — Interview Questions with Answers

### Q1: What is `Symbol.toPrimitive`?

**A:** A well-known Symbol that defines a method to customize how an object converts to a primitive value. It receives a `hint` (`"number"`, `"string"`, or `"default"`) indicating the preferred type.

### Q2: What is the priority order for coercion?

**A:** `Symbol.toPrimitive` → `valueOf()` → `toString()`. If `Symbol.toPrimitive` is defined, it always takes priority.

### Q3: What are the three hints?

**A:** `"number"` (arithmetic/comparison), `"string"` (template literals, `String()`), and `"default"` (`+` operator, `==` comparison).

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to handle all three hints

```js
[Symbol.toPrimitive](hint) {
  if (hint === "number") return this.value
  // forgot "string" and "default" — returns undefined!
}
```

**Fix:** Always handle all three hints, or at least have a default fallback.

### Pitfall: Returning a non-primitive from `Symbol.toPrimitive`

```js
[Symbol.toPrimitive](hint) {
  return { value: 42 } // TypeError: Cannot convert object to primitive value
}
```

**Fix:** Always return a primitive (`number`, `string`, or `boolean`).

## K — Coding Challenge with Solution

### Challenge

Create a `Vector2D` class where:
- `+vec` returns the magnitude (number hint)
- `` `${vec}` `` returns `"Vector(x, y)"` (string hint)
- `vec + otherValue` uses the magnitude (default hint)

### Solution

```js
class Vector2D {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number":
        return this.magnitude
      case "string":
        return `Vector(${this.x}, ${this.y})`
      case "default":
        return this.magnitude
    }
  }
}

const v = new Vector2D(3, 4)
+v              // 5
`${v}`          // "Vector(3, 4)"
v + 10          // 15
v > 4           // true
```

---

# 10 — `Proxy`

## T — TL;DR

`Proxy` lets you **intercept and customize** fundamental operations on an object (property access, assignment, function calls, etc.) — it's JavaScript's most powerful metaprogramming tool.

## K — Key Concepts

### Basic Syntax

```js
const proxy = new Proxy(target, handler)
```

- `target` — the original object to wrap
- `handler` — an object with **trap** methods that intercept operations

### The `get` Trap — Intercept Property Access

```js
const user = { name: "Mark", age: 30 }

const proxy = new Proxy(user, {
  get(target, property, receiver) {
    console.log(`Accessing: ${String(property)}`)
    return property in target
      ? target[property]
      : `Property "${String(property)}" not found`
  },
})

proxy.name     // "Accessing: name" → "Mark"
proxy.age      // "Accessing: age" → 30
proxy.missing  // "Accessing: missing" → 'Property "missing" not found'
```

### The `set` Trap — Intercept Property Assignment

```js
const user = {}

const proxy = new Proxy(user, {
  set(target, property, value, receiver) {
    if (property === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("Age must be a non-negative number")
    }
    target[property] = value
    return true // must return true for successful set
  },
})

proxy.name = "Mark" // ✅
proxy.age = 30      // ✅
// proxy.age = -5   // TypeError: Age must be a non-negative number
// proxy.age = "old" // TypeError
```

### The `has` Trap — Intercept `in` Operator

```js
const range = { min: 1, max: 100 }

const proxy = new Proxy(range, {
  has(target, property) {
    const num = Number(property)
    return num >= target.min && num <= target.max
  },
})

50 in proxy  // true
150 in proxy // false
0 in proxy   // false
```

### The `deleteProperty` Trap

```js
const user = { name: "Mark", role: "admin" }

const proxy = new Proxy(user, {
  deleteProperty(target, property) {
    if (property === "role") {
      throw new Error("Cannot delete role")
    }
    delete target[property]
    return true
  },
})

delete proxy.name // ✅
// delete proxy.role // Error: Cannot delete role
```

### The `apply` Trap — Intercept Function Calls

Works when the target is a **function**:

```js
function sum(a, b) {
  return a + b
}

const proxy = new Proxy(sum, {
  apply(target, thisArg, argumentsList) {
    console.log(`Called with args: ${argumentsList}`)
    const result = target.apply(thisArg, argumentsList)
    console.log(`Result: ${result}`)
    return result
  },
})

proxy(1, 2) // "Called with args: 1,2" → "Result: 3" → 3
```

### The `construct` Trap — Intercept `new`

```js
class User {
  constructor(name) { this.name = name }
}

const TrackedUser = new Proxy(User, {
  construct(target, args, newTarget) {
    console.log(`Creating user: ${args[0]}`)
    return new target(...args)
  },
})

const u = new TrackedUser("Mark") // "Creating user: Mark"
```

### All Available Traps

| Trap | Intercepts |
|------|-----------|
| `get` | Property access |
| `set` | Property assignment |
| `has` | `in` operator |
| `deleteProperty` | `delete` operator |
| `apply` | Function call |
| `construct` | `new` operator |
| `getPrototypeOf` | `Object.getPrototypeOf` |
| `setPrototypeOf` | `Object.setPrototypeOf` |
| `isExtensible` | `Object.isExtensible` |
| `preventExtensions` | `Object.preventExtensions` |
| `defineProperty` | `Object.defineProperty` |
| `getOwnPropertyDescriptor` | `Object.getOwnPropertyDescriptor` |
| `ownKeys` | `Object.keys`, `for...in`, etc. |

### `Proxy.revocable` — Create Disposable Proxies

```js
const { proxy, revoke } = Proxy.revocable({ name: "Mark" }, {
  get(target, prop) { return target[prop] },
})

proxy.name // "Mark"
revoke()   // disable the proxy
// proxy.name // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

## W — Why It Matters

- **Vue.js 3** uses `Proxy` for its entire reactivity system.
- **MobX** uses `Proxy` for observable state.
- **Validation layers**, **logging**, and **access control** are natural proxy use cases.
- `Proxy` enables truly transparent wrappers — the consumer doesn't know they're using a proxy.
- It's the most advanced metaprogramming feature in JavaScript.
- Senior-level interview questions test `Proxy` knowledge.

## I — Interview Questions with Answers

### Q1: What is a `Proxy`?

**A:** A `Proxy` wraps an object and intercepts fundamental operations (property access, assignment, function calls, etc.) through **trap** methods. It enables metaprogramming — customizing language-level behavior.

### Q2: What are traps?

**A:** Methods on the handler object that intercept specific operations. Examples: `get` (property access), `set` (assignment), `has` (`in` operator), `apply` (function call).

### Q3: How does Vue 3's reactivity work?

**A:** Vue 3 wraps state objects in `Proxy` instances. The `get` trap tracks which properties are accessed (dependency tracking), and the `set` trap triggers re-renders when properties change.

### Q4: What is `Proxy.revocable`?

**A:** Creates a proxy that can be permanently disabled by calling `revoke()`. After revocation, any operation on the proxy throws a `TypeError`. Useful for access control and temporary permissions.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `return true` in `set` trap

```js
set(target, prop, value) {
  target[prop] = value
  // no return! → throws TypeError in strict mode
}
```

**Fix:** Always `return true` in `set` traps.

### Pitfall: Proxy breaks identity checks

```js
const obj = {}
const proxy = new Proxy(obj, {})

obj === proxy // false!
```

**Fix:** Be aware that proxy and target are different objects. Store and compare proxies consistently.

### Pitfall: Performance overhead

Proxies add overhead to every trapped operation.

**Fix:** Don't wrap hot-path objects that are accessed millions of times per second. Use proxies for API boundaries, not inner loops.

## K — Coding Challenge with Solution

### Challenge

Create a `readonly` proxy that:
- Allows reading any property
- Throws an error on set, delete, or defineProperty
- Works with nested objects (deep readonly)

### Solution

```js
function readonly(target) {
  return new Proxy(target, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      // If the value is an object, wrap it recursively
      if (typeof value === "object" && value !== null) {
        return readonly(value)
      }
      return value
    },

    set() {
      throw new TypeError("Cannot modify a readonly object")
    },

    deleteProperty() {
      throw new TypeError("Cannot delete from a readonly object")
    },
  })
}

const config = readonly({
  db: { host: "localhost", port: 5432 },
  debug: true,
})

config.debug        // true
config.db.host      // "localhost"
// config.debug = false       // TypeError
// config.db.port = 3000      // TypeError (deep readonly!)
// delete config.debug        // TypeError
```

---

# 11 — `Reflect`

## T — TL;DR

`Reflect` is a built-in object that provides **methods matching every Proxy trap** — it's the clean, correct way to forward operations inside proxy handlers, replacing ad-hoc patterns like `target[prop]`.

## K — Key Concepts

### Why `Reflect` Exists

Before `Reflect`, operations were scattered across different syntax:

```js
// Old way
prop in obj              // has
delete obj[prop]         // deleteProperty
Object.keys(obj)         // ownKeys
Object.defineProperty()  // defineProperty
obj[prop]                // get
obj[prop] = value        // set
```

`Reflect` unifies them under a consistent API:

```js
Reflect.has(obj, prop)
Reflect.deleteProperty(obj, prop)
Reflect.ownKeys(obj)
Reflect.defineProperty(obj, prop, desc)
Reflect.get(obj, prop)
Reflect.set(obj, prop, value)
```

### `Reflect` Methods Match Proxy Traps 1:1

| Proxy Trap | Reflect Method |
|------------|---------------|
| `get` | `Reflect.get(target, prop, receiver)` |
| `set` | `Reflect.set(target, prop, value, receiver)` |
| `has` | `Reflect.has(target, prop)` |
| `deleteProperty` | `Reflect.deleteProperty(target, prop)` |
| `apply` | `Reflect.apply(fn, thisArg, args)` |
| `construct` | `Reflect.construct(Target, args)` |
| `ownKeys` | `Reflect.ownKeys(target)` |
| `getPrototypeOf` | `Reflect.getPrototypeOf(target)` |
| `setPrototypeOf` | `Reflect.setPrototypeOf(target, proto)` |
| `defineProperty` | `Reflect.defineProperty(target, prop, desc)` |
| `getOwnPropertyDescriptor` | `Reflect.getOwnPropertyDescriptor(target, prop)` |
| `isExtensible` | `Reflect.isExtensible(target)` |
| `preventExtensions` | `Reflect.preventExtensions(target)` |

### Using `Reflect` in Proxy Handlers

**Without Reflect (fragile):**

```js
const proxy = new Proxy(target, {
  get(target, prop) {
    console.log(`get ${String(prop)}`)
    return target[prop] // misses receiver — breaks with inheritance
  },
  set(target, prop, value) {
    console.log(`set ${String(prop)}`)
    target[prop] = value
    return true
  },
})
```

**With Reflect (correct):**

```js
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    console.log(`get ${String(prop)}`)
    return Reflect.get(target, prop, receiver) // preserves receiver
  },
  set(target, prop, value, receiver) {
    console.log(`set ${String(prop)}`)
    return Reflect.set(target, prop, value, receiver)
  },
})
```

### Why `receiver` Matters

```js
const parent = {
  get name() {
    return this._name // `this` should be the child, not parent
  },
}

const child = Object.create(parent)
child._name = "Mark"

// Without Reflect — this is parent, not child:
const proxy = new Proxy(parent, {
  get(target, prop) {
    return target[prop] // ❌ this = parent inside getter
  },
})

// With Reflect — this correctly refers to the receiver:
const proxy2 = new Proxy(parent, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver) // ✅ this = receiver inside getter
  },
})
```

### `Reflect.apply` — Cleaner Function Calls

```js
// Old way
Function.prototype.apply.call(fn, thisArg, args)

// Reflect way
Reflect.apply(fn, thisArg, args)
```

### `Reflect.construct` — `new` Without `new`

```js
class User {
  constructor(name) { this.name = name }
}

// Equivalent to new User("Mark")
const user = Reflect.construct(User, ["Mark"])
console.log(user.name)           // "Mark"
console.log(user instanceof User) // true
```

### `Reflect` Return Values vs Throwing

Some `Object` methods throw on failure, while `Reflect` returns `false`:

```js
// Object.defineProperty throws if it fails
try {
  Object.defineProperty(frozen, "x", { value: 1 }) // throws TypeError
} catch (e) {}

// Reflect.defineProperty returns false
const success = Reflect.defineProperty(frozen, "x", { value: 1 })
console.log(success) // false — no exception
```

This makes `Reflect` easier to use with conditional logic.

## W — Why It Matters

- `Reflect` is the **correct** way to forward operations inside proxy traps.
- Using `Reflect` instead of direct property access prevents subtle bugs with `receiver` and getters/setters.
- The consistent return-value pattern (returning `boolean` instead of throwing) makes code more predictable.
- Vue 3, MobX, and other reactive frameworks use `Reflect` extensively with their proxies.
- Shows advanced metaprogramming knowledge in interviews.

## I — Interview Questions with Answers

### Q1: What is `Reflect`?

**A:** A built-in object providing methods that correspond 1:1 to every Proxy trap. It's the standard way to perform object operations programmatically and the correct way to forward operations inside proxy handlers.

### Q2: Why use `Reflect.get` instead of `target[prop]`?

**A:** `Reflect.get` accepts a `receiver` argument that ensures `this` is set correctly inside getters. Direct property access (`target[prop]`) loses the receiver context, which breaks getters that use `this`.

### Q3: How does `Reflect` differ from `Object` methods?

**A:** `Reflect` methods return `boolean` on failure instead of throwing exceptions, matching the return conventions of proxy traps. They also have a consistent API that maps directly to proxy traps.

## C — Common Pitfalls with Fix

### Pitfall: Not passing `receiver` to `Reflect.get`/`Reflect.set`

```js
get(target, prop, receiver) {
  return Reflect.get(target, prop) // missing receiver!
}
```

**Fix:** Always pass `receiver`: `Reflect.get(target, prop, receiver)`.

### Pitfall: Using `target[prop]` in proxy traps instead of `Reflect`

**Fix:** Default to `Reflect` methods inside all proxy traps. It's safer and more correct.

## K — Coding Challenge with Solution

### Challenge

Create a logging proxy using `Reflect` that logs every `get`, `set`, and `deleteProperty` operation with the property name and value.

### Solution

```js
function createLoggingProxy(target) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      console.log(`GET ${String(prop)} → ${value}`)
      return value
    },

    set(target, prop, value, receiver) {
      console.log(`SET ${String(prop)} = ${value}`)
      return Reflect.set(target, prop, value, receiver)
    },

    deleteProperty(target, prop) {
      console.log(`DELETE ${String(prop)}`)
      return Reflect.deleteProperty(target, prop)
    },
  })
}

const user = createLoggingProxy({ name: "Mark", age: 30 })

user.name          // GET name → Mark
user.age = 31      // SET age = 31
delete user.age    // DELETE age
```

---

# 12 — Practical Metaprogramming (Validation, Logging, Reactive Traps)

## T — TL;DR

Combining `Proxy` and `Reflect`, you can build transparent middleware layers — **validation**, **logging**, **reactivity**, **access control**, and **auto-population** — without changing the original object's code.

## K — Key Concepts

### Pattern 1: Schema Validation Proxy

Validate every property assignment against a schema:

```js
function createValidatedObject(schema, initial = {}) {
  return new Proxy(initial, {
    set(target, prop, value, receiver) {
      if (prop in schema) {
        const validator = schema[prop]
        if (!validator(value)) {
          throw new TypeError(
            `Invalid value for "${String(prop)}": ${JSON.stringify(value)}`
          )
        }
      }
      return Reflect.set(target, prop, value, receiver)
    },
  })
}

const userSchema = {
  name: (v) => typeof v === "string" && v.length > 0,
  age: (v) => typeof v === "number" && v >= 0 && v <= 150,
  email: (v) => typeof v === "string" && v.includes("@"),
}

const user = createValidatedObject(userSchema)

user.name = "Mark"        // ✅
user.age = 30             // ✅
user.email = "m@test.com" // ✅
// user.age = -5          // TypeError: Invalid value for "age": -5
// user.email = "invalid" // TypeError: Invalid value for "email": "invalid"
```

### Pattern 2: Observable / Reactive Proxy

Trigger callbacks when state changes (simplified Vue/MobX pattern):

```js
function reactive(target, onChange) {
  return new Proxy(target, {
    set(target, prop, value, receiver) {
      const oldValue = target[prop]
      const result = Reflect.set(target, prop, value, receiver)

      if (oldValue !== value) {
        onChange(prop, value, oldValue)
      }

      return result
    },

    deleteProperty(target, prop) {
      const oldValue = target[prop]
      const result = Reflect.deleteProperty(target, prop)

      if (result) {
        onChange(prop, undefined, oldValue)
      }

      return result
    },
  })
}

const state = reactive({ count: 0, name: "Mark" }, (prop, newVal, oldVal) => {
  console.log(`${String(prop)}: ${oldVal} → ${newVal}`)
})

state.count = 1      // "count: 0 → 1"
state.count = 2      // "count: 1 → 2"
state.name = "Alex"  // "name: Mark → Alex"
state.count = 2      // (no log — value didn't change)
```

### Pattern 3: Auto-Populating / Default Values

Return defaults for missing properties:

```js
function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver)
      }
      if (prop in defaults) {
        return defaults[prop]
      }
      return undefined
    },
  })
}

const config = withDefaults(
  { host: "localhost" },
  { port: 3000, debug: false, timeout: 5000 }
)

config.host    // "localhost" (from target)
config.port    // 3000 (from defaults)
config.debug   // false (from defaults)
config.missing // undefined
```

### Pattern 4: Access Control Proxy

Restrict which properties can be accessed:

```js
function createSecureProxy(target, allowedProps) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (!allowedProps.includes(prop)) {
        throw new Error(`Access denied: "${String(prop)}"`)
      }
      return Reflect.get(target, prop, receiver)
    },

    set(target, prop, value, receiver) {
      if (!allowedProps.includes(prop)) {
        throw new Error(`Cannot modify: "${String(prop)}"`)
      }
      return Reflect.set(target, prop, value, receiver)
    },
  })
}

const user = { name: "Mark", role: "admin", password: "secret" }
const safeUser = createSecureProxy(user, ["name", "role"])

safeUser.name     // "Mark" ✅
safeUser.role     // "admin" ✅
// safeUser.password // Error: Access denied: "password" ❌
```

### Pattern 5: Method Timing / Logging Proxy

Automatically time every method call:

```js
function withTiming(target) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)

      if (typeof value === "function") {
        return function (...args) {
          const label = `${target.constructor.name}.${String(prop)}`
          console.time(label)
          const result = value.apply(this, args)
          console.timeEnd(label)
          return result
        }
      }

      return value
    },
  })
}

class DataProcessor {
  process(data) {
    // simulate work
    let sum = 0
    for (let i = 0; i < 1_000_000; i++) sum += i
    return sum
  }
}

const processor = withTiming(new DataProcessor())
processor.process([1, 2, 3])
// DataProcessor.process: 5.123ms
```

### Pattern 6: Negative Array Indices

```js
function negativeArray(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop)
      if (!Number.isNaN(index) && index < 0) {
        return Reflect.get(target, target.length + index, receiver)
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

const arr = negativeArray([10, 20, 30, 40, 50])
arr[-1]  // 50
arr[-2]  // 40
arr[0]   // 10
```

### Combining Patterns

Proxies can be **chained** — wrap a proxy in another proxy:

```js
const raw = { count: 0, name: "Mark" }

const validated = createValidatedObject(
  { count: (v) => typeof v === "number" && v >= 0 },
  raw
)

const observed = reactive(validated, (prop, newVal) => {
  console.log(`Changed: ${String(prop)} = ${newVal}`)
})

observed.count = 5  // validates, then logs: "Changed: count = 5"
// observed.count = -1 // TypeError from validation layer
```

## W — Why It Matters

- **Vue 3** = reactive proxies. Understanding this pattern means understanding Vue's core.
- **MobX** = observable proxies. Same story.
- **Validation proxies** catch bugs at assignment time — faster feedback than runtime errors later.
- **Logging proxies** are zero-config debugging tools for any object.
- **Access control proxies** implement permission layers without modifying original code.
- These patterns demonstrate **production-level** metaprogramming skills in interviews.

## I — Interview Questions with Answers

### Q1: How would you use Proxy for validation?

**A:** Create a proxy with a `set` trap that validates the new value against a schema before forwarding the assignment with `Reflect.set`. If validation fails, throw a `TypeError`.

### Q2: How does Vue 3's reactivity system work?

**A:** Vue 3 wraps state objects in reactive `Proxy` instances. The `get` trap tracks which properties are accessed during render (dependency collection). The `set` trap detects changes and triggers re-renders for components that depend on the changed property.

### Q3: Can you chain multiple proxies?

**A:** Yes. Each proxy wraps the previous one, creating a pipeline. For example: validation → logging → the original object. Operations pass through each layer.

### Q4: What is the downside of using proxies?

**A:** Performance overhead (each operation goes through the handler), debugging complexity (stack traces include proxy internals), and identity issues (`proxy !== target`).

## C — Common Pitfalls with Fix

### Pitfall: Not using `Reflect` inside trap handlers

```js
set(target, prop, value) {
  target[prop] = value // works but misses receiver, breaks with inheritance
  return true
}
```

**Fix:** Always use `Reflect.set(target, prop, value, receiver)`.

### Pitfall: Proxy traps on non-configurable properties must match

If the target has a non-configurable, non-writable property, the `get` trap **must** return the actual value:

```js
const target = {}
Object.defineProperty(target, "x", { value: 1, writable: false, configurable: false })

const proxy = new Proxy(target, {
  get() { return 2 } // TypeError: proxy get handler returned 2 for non-configurable property
})
```

**Fix:** Use `Reflect.get` as default to ensure invariant compliance.

### Pitfall: Infinite loops in reactive proxies

```js
const state = reactive({ a: 1 }, (prop, val) => {
  state.a = val + 1 // triggers set → triggers onChange → triggers set → ...
})
```

**Fix:** Add a guard flag or batch updates.

## K — Coding Challenge with Solution

### Challenge

Create a `createTypeEnforcer(schema)` that:
- Returns a proxy enforcing types on every assignment
- Schema: `{ propName: "string" | "number" | "boolean" }`
- Allows new properties not in the schema
- Throws `TypeError` for type mismatches

```js
const user = createTypeEnforcer({
  name: "string",
  age: "number",
  active: "boolean",
})

user.name = "Mark"     // ✅
user.age = 30          // ✅
user.active = true     // ✅
user.extra = [1, 2]    // ✅ (not in schema — allowed)
// user.age = "thirty" // TypeError
// user.name = 123     // TypeError
```

### Solution

```js
function createTypeEnforcer(schema) {
  return new Proxy({}, {
    set(target, prop, value, receiver) {
      if (prop in schema) {
        const expectedType = schema[prop]
        if (typeof value !== expectedType) {
          throw new TypeError(
            `"${String(prop)}" must be ${expectedType}, got ${typeof value}`
          )
        }
      }
      return Reflect.set(target, prop, value, receiver)
    },
  })
}

const user = createTypeEnforcer({
  name: "string",
  age: "number",
  active: "boolean",
})

user.name = "Mark"      // ✅
user.age = 30           // ✅
user.active = true      // ✅
user.extra = [1, 2]     // ✅
// user.age = "thirty"  // TypeError: "age" must be number, got string
```

---

# ✅ Day 3 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Closure Patterns & Practical Uses | ✅ T-KWICK |
| 2 | `this` Binding Rules | ✅ T-KWICK |
| 3 | `call`, `apply`, `bind` | ✅ T-KWICK |
| 4 | Prototype Chain | ✅ T-KWICK |
| 5 | `Object.create` | ✅ T-KWICK |
| 6 | `class` Syntax Internals | ✅ T-KWICK |
| 7 | `get`/`set` Accessors | ✅ T-KWICK |
| 8 | Inheritance (Prototypal & Class-Based) | ✅ T-KWICK |
| 9 | `Symbol.toPrimitive` | ✅ T-KWICK |
| 10 | `Proxy` | ✅ T-KWICK |
| 11 | `Reflect` | ✅ T-KWICK |
| 12 | Practical Metaprogramming | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 3` | 5 interview-style problems covering all 12 topics |
| `Generate Day 4` | Full lesson — Arrays, Objects, Strings & Iteration |
| `next topic` | Start Day 4's first subtopic |
| `recap` | Quick Day 3 summary |

> Doing one small thing beats opening a feed.