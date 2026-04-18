# 📘 Day 2 — Functions, Scope & Hoisting

> Phase 1 · JavaScript Basics to Advanced
> Each subtopic uses the **T-KWICK** framework independently.

---

## Table of Contents

1. [Function Declarations vs Expressions vs Arrow Functions](#1--function-declarations-vs-expressions-vs-arrow-functions)
2. [Default Parameters](#2--default-parameters)
3. [Rest Parameters](#3--rest-parameters)
4. [`arguments` Object](#4--arguments-object)
5. [`Function.prototype.length` & `.name`](#5--functionprototypelength--name)
6. [IIFE (Immediately Invoked Function Expression)](#6--iife-immediately-invoked-function-expression)
7. [Lexical Scope](#7--lexical-scope)
8. [Block, Function & Global Scope](#8--block-function--global-scope)
9. [Hoisting](#9--hoisting)
10. [Temporal Dead Zone (TDZ)](#10--temporal-dead-zone-tdz)
11. [Strict Mode](#11--strict-mode)
12. [Scope → Closure Mental Model (Bridge to Day 3)](#12--scope--closure-mental-model-bridge-to-day-3)

---

# 1 — Function Declarations vs Expressions vs Arrow Functions

## T — TL;DR

JavaScript has three main ways to create functions:

| Form | Syntax | Hoisted? | Has `this`? | Has `arguments`? |
|------|--------|----------|-------------|------------------|
| Declaration | `function name() {}` | ✅ Yes (fully) | ✅ Yes (dynamic) | ✅ Yes |
| Expression | `const name = function() {}` | ❌ No | ✅ Yes (dynamic) | ✅ Yes |
| Arrow | `const name = () => {}` | ❌ No | ❌ No (lexical) | ❌ No |

**Default to arrow functions. Use declarations when hoisting is intentional. Use expressions rarely.**

## K — Key Concepts

### Function Declaration

A named function defined with the `function` keyword as a **statement**.

```js
function greet(name) {
  return `Hello, ${name}!`
}

greet("Mark") // "Hello, Mark!"
```

Key traits:
- **Fully hoisted** — you can call it before the line it's defined on.
- Creates a named function (`.name` property = `"greet"`).
- Has its own `this` binding (determined at call time).
- Has `arguments` object.

```js
// This works because declarations are hoisted
sayHi() // "Hi!"

function sayHi() {
  console.log("Hi!")
}
```

### Function Expression

A function assigned to a variable. The function itself can be named or anonymous.

```js
// Anonymous function expression
const greet = function (name) {
  return `Hello, ${name}!`
}

// Named function expression
const greet2 = function greetFn(name) {
  return `Hello, ${name}!`
}

console.log(greet2.name) // "greetFn"
```

Key traits:
- **NOT hoisted** — the variable is hoisted (as `undefined` with `var`, or in TDZ with `const`/`let`), but the function is not.
- Has its own `this` and `arguments`.
- Named function expressions are useful for recursion and stack traces.

```js
// This throws
// greet("Mark") // TypeError: greet is not a function (if var) or ReferenceError (if const)
const greet = function (name) {
  return `Hello, ${name}!`
}
```

### Arrow Function

Introduced in ES6. Shorter syntax with fundamentally different behavior.

```js
// Basic forms
const add = (a, b) => a + b
const square = x => x * x          // single param: parens optional
const greet = () => "Hello!"       // no params: parens required
const getUser = () => ({ name: "Mark" }) // returning an object: wrap in ()

// Multi-line body
const process = (data) => {
  const cleaned = data.trim()
  return cleaned.toUpperCase()
}
```

Key traits:
- **NOT hoisted** (same as expressions).
- **No own `this`** — inherits `this` from the enclosing lexical scope.
- **No `arguments` object**.
- **Cannot be used as constructors** — `new Arrow()` throws `TypeError`.
- **No `prototype` property**.

### The `this` Difference — The Most Important Distinction

```js
// Regular function — `this` depends on HOW it's called
const obj = {
  name: "Mark",
  greet: function () {
    console.log(this.name)
  },
}
obj.greet()       // "Mark" — called as method, this = obj
const fn = obj.greet
fn()              // undefined — called as plain function, this = undefined (strict) or window (sloppy)

// Arrow function — `this` is captured from WHERE it's defined
const obj2 = {
  name: "Mark",
  greet: () => {
    console.log(this.name)
  },
}
obj2.greet() // undefined — arrow captures `this` from outer scope (module/global), NOT from obj2
```

### When to Use What

| Use | When |
|-----|------|
| Arrow | Default for most functions, callbacks, array methods |
| Declaration | When you need hoisting, or top-level named functions |
| Expression | When you need a named function for recursion or debugging in a variable |

### When NOT to Use Arrows

```js
// ❌ Object methods — `this` won't be the object
const user = {
  name: "Mark",
  greet: () => console.log(this.name), // wrong — `this` is outer scope
}

// ✅ Use regular function or shorthand
const user2 = {
  name: "Mark",
  greet() { console.log(this.name) }, // correct — method shorthand
}

// ❌ Event handlers in classes where `this` must be the instance
// (Unless you use class fields with arrows — Day 3)

// ❌ Constructors
const Person = (name) => { this.name = name }
new Person("Mark") // TypeError: Person is not a constructor

// ❌ When you need `arguments`
const fn = () => console.log(arguments) // ReferenceError in strict mode
```

### Method Shorthand (ES6)

```js
const obj = {
  // Shorthand — equivalent to `greet: function() {}`
  greet() {
    return "hello"
  },
}
```

This is syntactic sugar for a regular function expression. It has `this` and `arguments`.

## W — Why It Matters

- The `this` behavior of arrow vs regular functions is the most tested distinction in JS interviews.
- Choosing the wrong function type in React (class components), event handlers, or object methods causes subtle bugs.
- Understanding hoisting differences explains why some code works and some doesn't.
- Arrow functions are the dominant style in modern codebases — you must know their limitations.

## I — Interview Questions with Answers

### Q1: What are the main differences between arrow functions and regular functions?

**A:**
1. Arrow functions have **no own `this`** — they inherit from the enclosing scope (lexical `this`).
2. Arrow functions have **no `arguments` object**.
3. Arrow functions **cannot be used with `new`** (not constructors).
4. Arrow functions have **no `prototype` property**.
5. Arrow functions are **not hoisted** (when assigned to variables).

### Q2: Why can't you use arrow functions as object methods?

**A:** Because `this` inside an arrow function refers to the enclosing lexical scope, not the object. So `this.name` won't refer to the object's `name` property — it will refer to whatever `this` is in the outer scope.

### Q3: Can you call a function before it's defined?

**A:** Only if it's a **function declaration**. Declarations are fully hoisted. Function expressions and arrow functions assigned to variables are not.

### Q4: What is a named function expression and why use it?

**A:** `const fn = function myName() {}`. The name `myName` is only accessible inside the function body (useful for recursion) and appears in stack traces for debugging. The outer variable `fn` is what you call.

### Q5: What does `new (() => {})` do?

**A:** Throws `TypeError: (intermediate value) is not a constructor`. Arrow functions cannot be used with `new`.

## C — Common Pitfalls with Fix

### Pitfall: Arrow function as object method

```js
const timer = {
  seconds: 0,
  start: () => {
    setInterval(() => {
      this.seconds++ // `this` is NOT timer
    }, 1000)
  },
}
```

**Fix:** Use regular function or method shorthand for the method:

```js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds++ // `this` IS timer — arrow inherits from start()
    }, 1000)
  },
}
```

### Pitfall: Trying to return an object literal from an arrow

```js
const getUser = () => { name: "Mark" } // undefined — parsed as label, not object
```

**Fix:** Wrap in parentheses:

```js
const getUser = () => ({ name: "Mark" })
```

### Pitfall: Expecting function expressions to be hoisted

```js
greet() // TypeError or ReferenceError
const greet = function () { return "hi" }
```

**Fix:** Define before use, or use a declaration.

### Pitfall: Using `arguments` in arrow functions

```js
const fn = () => {
  console.log(arguments) // ReferenceError (strict) or captures outer `arguments`
}
```

**Fix:** Use rest parameters: `const fn = (...args) => { console.log(args) }`

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` print?

```js
console.log(a())
// console.log(b()) — uncomment and predict
// console.log(c()) — uncomment and predict

function a() { return "a" }
var b = function () { return "b" }
const c = () => "c"

const obj = {
  value: 42,
  arrow: () => this?.value,
  regular() { return this.value },
}

console.log(obj.arrow())
console.log(obj.regular())
```

### Solution

```js
console.log(a()) // "a" — declaration is hoisted

// console.log(b()) — TypeError: b is not a function
// `var b` is hoisted as undefined, so calling undefined() throws TypeError

// console.log(c()) — ReferenceError: Cannot access 'c' before initialization
// `const c` is in the TDZ

console.log(obj.arrow())   // undefined — arrow's `this` is outer scope (module/global), not obj
console.log(obj.regular()) // 42 — regular function's `this` is obj (method call)
```

---

# 2 — Default Parameters

## T — TL;DR

Default parameters let you set fallback values for function arguments when they are `undefined` (or not passed).

```js
function greet(name = "World") {
  return `Hello, ${name}!`
}

greet()       // "Hello, World!"
greet("Mark") // "Hello, Mark!"
```

## K — Key Concepts

### Basic Syntax

```js
function createUser(name = "Anonymous", role = "viewer") {
  return { name, role }
}

createUser()              // { name: "Anonymous", role: "viewer" }
createUser("Mark")        // { name: "Mark", role: "viewer" }
createUser("Mark", "admin") // { name: "Mark", role: "admin" }
```

### Only Triggers on `undefined`

Default parameters activate when the argument is `undefined` — NOT for other falsy values.

```js
function example(x = 10) {
  return x
}

example(undefined) // 10 — default triggers
example(null)      // null — default does NOT trigger
example(0)         // 0
example("")        // ""
example(false)     // false
```

This is different from `||` which triggers on all falsy values, and matches the behavior of `??`.

### Expressions as Defaults

Defaults can be any expression — they are evaluated **at call time**, not at definition time.

```js
function getTimestamp(date = new Date()) {
  return date.toISOString()
}

// Each call gets a fresh Date
getTimestamp() // "2026-04-18T..."
```

### Defaults Can Reference Earlier Parameters

Parameters are evaluated left to right, so later defaults can use earlier parameters:

```js
function createRange(start, end = start + 10) {
  return { start, end }
}

createRange(5)    // { start: 5, end: 15 }
createRange(5, 20) // { start: 5, end: 20 }
```

But earlier parameters **cannot** reference later ones:

```js
function broken(a = b, b = 1) {
  return [a, b]
}
broken() // ReferenceError: Cannot access 'b' before initialization
```

### Default with Destructuring

```js
function configure({ host = "localhost", port = 3000 } = {}) {
  return `${host}:${port}`
}

configure()                     // "localhost:3000"
configure({ port: 8080 })      // "localhost:8080"
configure({ host: "api.com" }) // "api.com:3000"
```

The `= {}` at the end means even calling `configure()` with no arguments works (it destructures an empty object).

### Functions as Defaults

```js
function fetchData(url, parser = JSON.parse) {
  const raw = getRawData(url)
  return parser(raw)
}
```

### Default Parameters and `arguments`

Default parameters do **not** affect the `arguments` object in sloppy mode (and `arguments` should be avoided anyway):

```js
function example(x = 10) {
  console.log(arguments.length)
  console.log(arguments[0])
  console.log(x)
}

example()     // arguments.length = 0, arguments[0] = undefined, x = 10
example(5)    // arguments.length = 1, arguments[0] = 5, x = 5
```

### The Old Pattern (Before ES6)

```js
// Old way — buggy with falsy values
function greet(name) {
  name = name || "World" // fails for "", 0, false
  return `Hello, ${name}!`
}

// Modern way — correct
function greet(name = "World") {
  return `Hello, ${name}!`
}
```

## W — Why It Matters

- Cleaner than manual `undefined` checks or `||` fallbacks.
- Correct behavior with falsy values (`0`, `""`, `false` are preserved).
- Used everywhere: config objects, API wrappers, component props.
- Combined with destructuring, it's the standard for options patterns.
- Interview questions test whether defaults trigger on `null` vs `undefined`.

## I — Interview Questions with Answers

### Q1: When do default parameters activate?

**A:** When the argument is `undefined` — either explicitly passed as `undefined` or not passed at all. They do NOT activate for `null`, `0`, `""`, `false`, or any other falsy value.

### Q2: Are default values evaluated at definition time or call time?

**A:** **Call time**. Each invocation evaluates the default expression fresh. This is why `new Date()` as a default gives a different result each call.

### Q3: Can a default parameter reference another parameter?

**A:** Yes, but only **earlier** parameters (left to right). Later parameters are not yet initialized.

### Q4: What is the `= {}` pattern in destructured parameters?

**A:** It provides an empty object as the default so the function can be called with no arguments without throwing. Example: `function f({ a = 1 } = {})`.

## C — Common Pitfalls with Fix

### Pitfall: Expecting default to trigger on `null`

```js
function greet(name = "World") { return name }
greet(null) // null — not "World"
```

**Fix:** If you need to handle `null`, use `??` inside the body:

```js
function greet(name) {
  const n = name ?? "World"
  return n
}
```

### Pitfall: Referencing a later parameter

```js
function f(a = b, b = 1) {}
f() // ReferenceError
```

**Fix:** Only reference parameters defined to the left.

### Pitfall: Forgetting `= {}` with destructured params

```js
function f({ a = 1 }) {}
f() // TypeError: Cannot destructure property 'a' of undefined
```

**Fix:** Add `= {}`:

```js
function f({ a = 1 } = {}) {}
f() // works — a = 1
```

### Pitfall: Using `||` instead of default parameters

```js
function setPort(port) {
  port = port || 3000 // overwrites valid 0
}
```

**Fix:** Use default parameter or `??`:

```js
function setPort(port = 3000) {} // correct
```

## K — Coding Challenge with Solution

### Challenge

```js
function createConfig(host = "localhost", port = 8080, secure = false) {
  return `${secure ? "https" : "http"}://${host}:${port}`
}

console.log(createConfig())
console.log(createConfig("api.com"))
console.log(createConfig("api.com", undefined, true))
console.log(createConfig("api.com", null, true))
```

### Solution

```js
createConfig()
// "http://localhost:8080"

createConfig("api.com")
// "http://api.com:8080"

createConfig("api.com", undefined, true)
// "https://api.com:8080" — undefined triggers default for port

createConfig("api.com", null, true)
// "https://api.com:null" — null does NOT trigger default
```

---

# 3 — Rest Parameters

## T — TL;DR

Rest parameters (`...args`) collect all remaining arguments into a **real array**.

```js
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0)
}

sum(1, 2, 3) // 6
```

## K — Key Concepts

### Basic Syntax

```js
function log(first, ...rest) {
  console.log("First:", first)
  console.log("Rest:", rest)
}

log("a", "b", "c", "d")
// First: "a"
// Rest: ["b", "c", "d"]
```

### Rules

1. **Must be the last parameter.**

```js
function valid(a, b, ...rest) {}    // ✅
// function invalid(a, ...rest, b) {} // ❌ SyntaxError
```

2. **Only one rest parameter per function.**

```js
// function bad(...a, ...b) {} // �� SyntaxError
```

3. **Rest is a real `Array`** — unlike `arguments`.

```js
function example(...args) {
  console.log(Array.isArray(args))   // true
  console.log(args.map)              // [Function: map] — full array methods
}
```

### Rest vs Spread

They look the same (`...`) but do opposite things:

```js
// REST — collects into an array (in parameters or destructuring)
function sum(...nums) { return nums.reduce((a, b) => a + b, 0) }

// SPREAD — expands an array (in arguments or literals)
const nums = [1, 2, 3]
sum(...nums) // same as sum(1, 2, 3)
```

| Context | `...` is | Action |
|---------|----------|--------|
| Function parameter | Rest | Collects arguments into array |
| Function call | Spread | Expands array into arguments |
| Array literal `[...a]` | Spread | Copies/combines arrays |
| Object literal `{...a}` | Spread | Copies/combines objects |
| Destructuring `[a, ...b]` | Rest | Collects remaining into array |

### Rest in Destructuring

```js
const [first, second, ...remaining] = [1, 2, 3, 4, 5]
console.log(first)     // 1
console.log(second)    // 2
console.log(remaining) // [3, 4, 5]

const { name, ...otherProps } = { name: "Mark", age: 30, role: "dev" }
console.log(name)       // "Mark"
console.log(otherProps)  // { age: 30, role: "dev" }
```

### Rest with Arrow Functions

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0)
```

This is the arrow function replacement for `arguments`.

### Rest Collects Nothing When No Extra Args

```js
function example(a, ...rest) {
  console.log(rest)
}

example(1) // rest = [] (empty array, not undefined)
```

### Practical Patterns

```js
// Wrapper/decorator that passes all args through
function withLogging(fn) {
  return function (...args) {
    console.log("Calling with:", args)
    return fn(...args) // spread to forward
  }
}

// Variadic functions
function max(...values) {
  return Math.max(...values)
}

// Type-safe event handler collection
function on(event, ...handlers) {
  handlers.forEach((handler) => addEventListener(event, handler))
}
```

## W — Why It Matters

- Rest parameters replaced `arguments` as the modern way to handle variadic functions.
- They return a real array — no need for `Array.from(arguments)` hacks.
- Used everywhere: utility functions, wrappers, decorators, middleware patterns.
- Rest + spread together are fundamental to function composition (Day 12).

## I — Interview Questions with Answers

### Q1: What are rest parameters?

**A:** Rest parameters (`...name`) collect all remaining arguments passed to a function into a real `Array`. They must be the last parameter and there can only be one.

### Q2: What is the difference between rest and spread?

**A:** Rest **collects** multiple values into an array (in parameters/destructuring). Spread **expands** an array/object into individual values (in function calls/literals). They use the same `...` syntax but in opposite positions.

### Q3: How do rest parameters differ from `arguments`?

**A:**
- Rest is a **real array**; `arguments` is an array-like object.
- Rest only includes **uncaptured** arguments; `arguments` includes all.
- Rest works in **arrow functions**; `arguments` does not.
- Rest is the modern replacement.

### Q4: What does rest produce when no extra arguments are passed?

**A:** An empty array `[]`, not `undefined`.

## C — Common Pitfalls with Fix

### Pitfall: Rest parameter not at the end

```js
// function f(...rest, last) {} // SyntaxError
```

**Fix:** Rest must always be the last parameter.

### Pitfall: Confusing rest and spread

```js
function example(...args) {  // REST: collecting
  return Math.max(...args)   // SPREAD: expanding
}
```

**Fix:** Remember: rest = collecting, spread = expanding. Same syntax, different position.

### Pitfall: Forgetting rest gives an array when empty

```js
function f(a, ...rest) {
  if (rest) { /* this always runs — [] is truthy */ }
}
```

**Fix:** Check `.length`:

```js
if (rest.length > 0) { /* has extra args */ }
```

## K — Coding Challenge with Solution

### Challenge

```js
function describe(action, ...items) {
  return `${action}: ${items.join(", ")}`
}

console.log(describe("Buy", "milk", "eggs", "bread"))
console.log(describe("Sell"))

const [head, ...tail] = [10, 20, 30, 40]
console.log(head)
console.log(tail)

const { x, ...rest } = { x: 1, y: 2, z: 3 }
console.log(x)
console.log(rest)
```

### Solution

```js
describe("Buy", "milk", "eggs", "bread") // "Buy: milk, eggs, bread"
describe("Sell")                          // "Sell: "

head // 10
tail // [20, 30, 40]

x    // 1
rest // { y: 2, z: 3 }
```

---

# 4 — `arguments` Object

## T — TL;DR

`arguments` is an **array-like object** available inside regular functions that contains all passed arguments. It's a legacy feature — **use rest parameters instead**.

```js
function example() {
  console.log(arguments[0]) // first argument
  console.log(arguments.length)
}
```

## K — Key Concepts

### Basic Behavior

```js
function sum() {
  let total = 0
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i]
  }
  return total
}

sum(1, 2, 3) // 6
```

### Array-Like, Not an Array

`arguments` has `.length` and numeric indexes, but it is NOT an array:

```js
function example() {
  console.log(Array.isArray(arguments))  // false
  // arguments.map(x => x)              // TypeError: arguments.map is not a function
  // arguments.forEach(...)             // TypeError
}
```

To convert to a real array:

```js
function example() {
  // Method 1 — Array.from (modern)
  const args = Array.from(arguments)

  // Method 2 — spread (modern)
  const args2 = [...arguments]

  // Method 3 — old pattern
  const args3 = Array.prototype.slice.call(arguments)
}
```

### `arguments` in Sloppy Mode — Linked to Parameters

In non-strict mode, `arguments` and named parameters are **linked** (aliased):

```js
function example(a) {
  arguments[0] = 99
  console.log(a) // 99 — a changed too!
}
example(1)

function example2(a) {
  a = 99
  console.log(arguments[0]) // 99 — arguments changed too!
}
example2(1)
```

In **strict mode**, this link is broken:

```js
"use strict"
function example(a) {
  arguments[0] = 99
  console.log(a) // 1 — NOT linked
}
example(1)
```

### Arrow Functions Do NOT Have `arguments`

```js
const fn = () => {
  console.log(arguments) // ReferenceError in strict mode
}

// Or it captures the outer function's arguments:
function outer() {
  const inner = () => {
    console.log(arguments) // outer's arguments, not inner's
  }
  inner()
}
outer(1, 2, 3) // logs Arguments [1, 2, 3]
```

### `arguments.callee` (Deprecated)

```js
function factorial(n) {
  if (n <= 1) return 1
  return n * arguments.callee(n - 1) // deprecated, banned in strict mode
}
```

**Never use `arguments.callee`.** Use a named function instead.

### Why Rest Parameters Are Better

| Feature | `arguments` | Rest (`...args`) |
|---------|-------------|------------------|
| Type | Array-like object | Real `Array` |
| Array methods | ❌ No | ✅ Yes |
| Arrow functions | ❌ Not available | ✅ Works |
| Named subset | ❌ Contains all args | ✅ Only uncaptured |
| Clarity | Implicit/magic | Explicit |
| Strict mode aliasing | Confusing | N/A |

## W — Why It Matters

- You'll encounter `arguments` in legacy code, libraries, and old Stack Overflow answers.
- Understanding why it was replaced helps you appreciate rest parameters.
- The aliasing behavior in sloppy mode is a classic interview question.
- Knowing that arrow functions don't have `arguments` prevents debugging time.

## I — Interview Questions with Answers

### Q1: What is the `arguments` object?

**A:** An array-like object available in regular (non-arrow) functions containing all arguments passed to the function. It has `.length` and indexed access but no array methods like `.map` or `.filter`.

### Q2: Why don't arrow functions have `arguments`?

**A:** Arrow functions were designed to be lightweight. They inherit `this` and `arguments` from their enclosing lexical scope rather than creating their own. Use rest parameters (`...args`) instead.

### Q3: What is the aliasing issue with `arguments`?

**A:** In sloppy (non-strict) mode, `arguments` entries and named parameters are linked — changing one changes the other. In strict mode, they are independent.

### Q4: How do you convert `arguments` to an array?

**A:** `Array.from(arguments)`, `[...arguments]`, or the old `Array.prototype.slice.call(arguments)`.

## C — Common Pitfalls with Fix

### Pitfall: Calling array methods on `arguments`

```js
function example() {
  arguments.map(x => x * 2) // TypeError
}
```

**Fix:** Convert first: `[...arguments].map(x => x * 2)` — or better, use rest parameters.

### Pitfall: Using `arguments` in arrow functions

```js
const fn = () => console.log(arguments) // ReferenceError or leaks outer
```

**Fix:** Use rest: `const fn = (...args) => console.log(args)`

### Pitfall: Aliasing confusion in sloppy mode

```js
function f(a) {
  arguments[0] = 99
  return a // 99 in sloppy mode!
}
```

**Fix:** Use strict mode or avoid mutating `arguments`.

## K — Coding Challenge with Solution

### Challenge

```js
function outer() {
  const inner = () => arguments
  return inner()
}

console.log(outer(1, 2, 3))

function test(a, b) {
  "use strict"
  arguments[0] = 99
  console.log(a)
}
test(1, 2)
```

### Solution

```js
console.log(outer(1, 2, 3))
// Arguments [1, 2, 3] — arrow captures outer's arguments

test(1, 2)
// 1 — strict mode breaks the alias, so `a` is unchanged
```

---

# 5 — `Function.prototype.length` & `.name`

## T — TL;DR

Every function has two useful metadata properties:

| Property | Returns |
|----------|---------|
| `.length` | Number of **expected** parameters (before first default, rest, or destructured with default) |
| `.name` | The function's name as a string |

```js
function add(a, b) { return a + b }
add.length // 2
add.name   // "add"
```

## K — Key Concepts

### `Function.prototype.length`

`.length` counts the number of parameters **before the first one with a default value** or rest parameter.

```js
function a(x, y, z) {}
a.length // 3

function b(x, y = 1, z) {}
b.length // 1 — stops counting at y (first default)

function c(x, ...rest) {}
c.length // 1 — rest parameter doesn't count

function d({ a, b } = {}) {}
d.length // 0 — destructured parameter with default

function e(x, y, z = 1) {}
e.length // 2 — stops at z (first default)
```

Key rules:
1. **Rest parameters** are excluded.
2. **Parameters after the first default** are excluded.
3. The first default itself is excluded.

### `Function.prototype.name`

```js
// Declaration
function greet() {}
greet.name // "greet"

// Named expression
const fn = function myFunc() {}
fn.name // "myFunc" — the function's own name, not the variable

// Anonymous expression — inferred from variable
const fn2 = function () {}
fn2.name // "fn2" — inferred

// Arrow — inferred
const arrow = () => {}
arrow.name // "arrow"

// Object method
const obj = {
  hello() {},
  world: function () {},
}
obj.hello.name // "hello"
obj.world.name // "world" — inferred from property

// Dynamic/computed
const sym = Symbol("mySymbol")
const obj2 = { [sym]: function () {} }
obj2[sym].name // "[mySymbol]"

// Class
class User {}
User.name // "User"

// bind
function original() {}
const bound = original.bind(null)
bound.name // "bound original"

// Constructor
new Function().name // "anonymous"
```

### Practical Uses

**1. Debugging and logging:**

```js
function logCall(fn, ...args) {
  console.log(`Calling ${fn.name} with ${args.length} args`)
  return fn(...args)
}
```

**2. Framework/library introspection:**

```js
// Check if a function expects certain number of args
function validateMiddleware(fn) {
  if (fn.length < 2) {
    throw new Error(`Middleware ${fn.name} must accept at least 2 parameters`)
  }
}
```

**3. Express.js error handler detection:**

Express uses `.length` to detect error handlers — error middleware has 4 parameters `(err, req, res, next)`:

```js
// Express internally checks:
if (fn.length === 4) {
  // treat as error handler
}
```

### Both Properties Are Non-Writable but Configurable

```js
function fn() {}
fn.name = "other" // silently fails
console.log(fn.name) // "fn" — unchanged

// But you can redefine with Object.defineProperty
Object.defineProperty(fn, "name", { value: "custom" })
fn.name // "custom"
```

## W — Why It Matters

- `.name` is used in debugging, logging, error messages, and stack traces.
- `.length` is used by frameworks (Express, testing libraries) to determine function signatures.
- Understanding why `.length` changes with default parameters prevents confusion when writing middleware or decorators.
- Minor topic, but shows up in interviews as a "how well do you know JS" question.

## I — Interview Questions with Answers

### Q1: What does `function.length` return?

**A:** The number of formal parameters before the first one with a default value or rest parameter. It represents the "expected" argument count.

### Q2: What is `(function(a, b, c = 1) {}).length`?

**A:** `2`. Parameters after (and including) the first default are not counted.

### Q3: What is the `.name` of `const fn = function() {}`?

**A:** `"fn"`. When an anonymous function is assigned to a variable, the name is **inferred** from the variable name.

### Q4: What is the `.name` of `function() {}.bind(null)`?

**A:** `"bound "` (with a space). Bound functions get the prefix `"bound "` added to the original name. Anonymous bound = `"bound "`.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `.length` to count all parameters

```js
function f(a, b = 1, c) {}
f.length // 1, not 3
```

**Fix:** Remember: `.length` stops at the first default or rest.

### Pitfall: Relying on `.name` for anonymous callbacks

```js
[1, 2].map(function (x) { return x * 2 })
// The callback's .name is "" (empty string) — no inference from array method
```

**Fix:** Name your functions when debugging matters.

### Pitfall: Thinking `.name` is writable

```js
function fn() {}
fn.name = "custom" // doesn't work
```

**Fix:** Use `Object.defineProperty(fn, "name", { value: "custom" })` if you really need to.

## K — Coding Challenge with Solution

### Challenge

```js
function a(x, y, z) {}
function b(x, y = 0) {}
function c(...args) {}
function d(x, { y } = {}) {}
const e = function myE() {}
const f = () => {}

console.log(a.length, a.name)
console.log(b.length, b.name)
console.log(c.length, c.name)
console.log(d.length, d.name)
console.log(e.length, e.name)
console.log(f.length, f.name)
```

### Solution

```js
a.length // 3     a.name // "a"
b.length // 1     b.name // "b"      — stops at first default
c.length // 0     c.name // "c"      — rest doesn't count
d.length // 1     d.name // "d"      — destructured default stops count at param 2
e.length // 0     e.name // "myE"    — named expression uses its own name
f.length // 0     f.name // "f"      — inferred from variable
```

---

# 6 — IIFE (Immediately Invoked Function Expression)

## T — TL;DR

An IIFE is a function that **runs as soon as it's defined**. It creates a private scope.

```js
(function () {
  console.log("I run immediately!")
})()
```

## K — Key Concepts

### Syntax Variants

```js
// Parenthesized function expression — most common
(function () {
  console.log("IIFE 1")
})()

// Alternative wrapping
(function () {
  console.log("IIFE 2")
}())

// Arrow IIFE
(() => {
  console.log("IIFE 3")
})()

// Named IIFE
(function setup() {
  console.log("IIFE 4")
})()

// With arguments
(function (name) {
  console.log(`Hello, ${name}!`)
})("Mark")

// Using void, !, +, ~ (seen in minified code)
void function () { console.log("IIFE 5") }()
!function () { console.log("IIFE 6") }()
```

### Why the Parentheses?

Without them, the parser sees `function` at the start of a statement and expects a **declaration**, which requires a name and can't be immediately invoked.

```js
// SyntaxError:
// function() { }()

// Wrapping in () forces it to be parsed as an expression:
(function () {})()
```

### The Core Purpose: Private Scope

Before `let`/`const` and modules, `var` was function-scoped and there was no block scope or module system. IIFEs were the **only way** to create private variables.

```js
// Without IIFE — pollutes global scope
var count = 0
function increment() { count++ }

// With IIFE — encapsulated
const counter = (function () {
  var count = 0 // private
  return {
    increment() { count++ },
    getCount() { return count },
  }
})()

counter.increment()
counter.increment()
counter.getCount() // 2
// count is not accessible from outside
```

### The Module Pattern (Pre-ES Modules)

```js
const UserModule = (function () {
  // Private
  const users = []

  function validate(user) {
    return user.name && user.email
  }

  // Public API
  return {
    add(user) {
      if (validate(user)) {
        users.push(user)
        return true
      }
      return false
    },
    getAll() {
      return [...users] // return copy
    },
    count() {
      return users.length
    },
  }
})()

UserModule.add({ name: "Mark", email: "mark@example.com" })
UserModule.count() // 1
// UserModule.users    — undefined (private)
// UserModule.validate — undefined (private)
```

### Fixing the Classic `var` Loop Problem

```js
// Bug: all callbacks share the same `i`
for (var i = 0; i < 3; i++) {
  setTimeout(function () { console.log(i) }, 100)
}
// Prints: 3, 3, 3

// Fix with IIFE — each iteration gets its own copy
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () { console.log(j) }, 100)
  })(i)
}
// Prints: 0, 1, 2

// Modern fix — just use let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Prints: 0, 1, 2
```

### Async IIFE

```js
(async () => {
  const data = await fetch("/api/users")
  const users = await data.json()
  console.log(users)
})()
```

Before top-level `await` (ES2022), this was the only way to use `await` at the module top level.

### IIFEs in Modern JavaScript

With `let`/`const` (block scope) and ES modules, IIFEs are **rarely needed**. But they still appear in:

1. **Minified/bundled code** — bundlers wrap modules in IIFEs.
2. **Inline one-time initialization** in scripts.
3. **Isolating side effects** in configuration code.
4. **Legacy codebases**.

## W — Why It Matters

- IIFEs are the historical foundation of JavaScript's module system.
- Understanding IIFEs deepens your understanding of scope, closures, and the module pattern.
- They still appear in interviews, legacy code, and bundler output.
- The progression IIFE → CommonJS → ES Modules tells the story of JS evolution.

## I — Interview Questions with Answers

### Q1: What is an IIFE?

**A:** An Immediately Invoked Function Expression — a function that is defined and executed in the same statement. It creates a new scope, isolating variables from the outer scope.

### Q2: Why were IIFEs important before ES6?

**A:** Before `let`/`const` and ES modules, `var` was the only variable declaration and it was function-scoped. IIFEs were the only way to create private scope and avoid global namespace pollution.

### Q3: Are IIFEs still used in modern JavaScript?

**A:** Rarely by hand, since `let`/`const` provide block scope and ES modules provide encapsulation. But they still appear in bundler output, inline initialization, and legacy code.

### Q4: How does an IIFE fix the `var` loop problem?

**A:** By creating a new function scope for each iteration, capturing the current value of the loop variable as a parameter. Each callback then closes over its own copy.

## C — Common Pitfalls with Fix

### Pitfall: Missing semicolon before IIFE

```js
const x = 1
(function () { console.log("oops") })()
// Interpreted as: const x = 1(function...); — TypeError!
```

**Fix:** Start with `;` or ensure the previous line ends with `;`:

```js
const x = 1
;(function () { console.log("safe") })()
```

### Pitfall: Thinking IIFEs are the modern way to scope

**Fix:** Use `let`/`const` + blocks or ES modules. IIFEs are a legacy pattern.

### Pitfall: Forgetting the invocation `()`

```js
const result = (function () { return 42 }) // result is the function, not 42
```

**Fix:** Add `()` at the end.

## K — Coding Challenge with Solution

### Challenge

Write an IIFE that:
1. Has a private counter starting at 0.
2. Returns an object with `increment()`, `decrement()`, and `value()` methods.
3. Calling `increment` three times then `decrement` once should give `value()` = 2.

### Solution

```js
const counter = (function () {
  let count = 0

  return {
    increment() { count++ },
    decrement() { count-- },
    value() { return count },
  }
})()

counter.increment()
counter.increment()
counter.increment()
counter.decrement()
console.log(counter.value()) // 2
// console.log(count)        // ReferenceError — private
```

---

# 7 — Lexical Scope

## T — TL;DR

**Lexical scope** (also called **static scope**) means a function's scope is determined by **where it is written in the source code**, not where or how it's called.

```js
const name = "outer"

function greet() {
  console.log(name) // looks up to where greet was DEFINED
}

function wrapper() {
  const name = "inner"
  greet()
}

wrapper() // "outer" — not "inner"
```

## K — Key Concepts

### The Core Rule

When a variable is referenced inside a function, JavaScript looks it up in:

1. The function's own local scope.
2. The enclosing function's scope.
3. The next enclosing scope...
4. The global scope.

This lookup chain is determined at **write time** (where the function appears in the code), not at **call time**.

```js
function outer() {
  const x = 10

  function inner() {
    console.log(x) // finds x in outer's scope
  }

  return inner
}

const fn = outer()
fn() // 10 — even though fn is called outside of outer()
```

This is the foundation of **closures** (Day 3).

### Lexical vs Dynamic Scope

JavaScript uses **lexical scope**. Some languages (like Bash, old Perl) use dynamic scope.

```js
// LEXICAL scope (JavaScript)
const x = "global"

function a() {
  console.log(x)
}

function b() {
  const x = "local"
  a() // still prints "global" — a() was DEFINED in the global scope
}

b() // "global"
```

If JavaScript had dynamic scope, `a()` would print `"local"` because it was **called** from `b()`. But JS is lexical — `a()` looks up `x` from where it was **defined**.

### Nested Scope Chains

```js
const a = "global a"

function level1() {
  const b = "level1 b"

  function level2() {
    const c = "level2 c"

    function level3() {
      console.log(a) // "global a" — found in global scope
      console.log(b) // "level1 b" — found in level1's scope
      console.log(c) // "level2 c" — found in level2's scope
    }

    level3()
  }

  level2()
}

level1()
```

### Scope Chain Visualization

```
level3's scope chain:
  level3 local → level2 local → level1 local → global
```

Each function creates a new link in the chain. Variable lookup walks outward through this chain.

### Block Scope Is Also Lexical

`let` and `const` create block-scoped variables, but the lookup mechanism is still lexical:

```js
function example() {
  const x = 1

  if (true) {
    const y = 2
    console.log(x) // 1 — found in enclosing function scope
    console.log(y) // 2 — found in this block scope
  }

  // console.log(y) // ReferenceError — y is in the if-block's scope
}
```

### `this` Is NOT Lexically Scoped (Except in Arrows)

Regular functions determine `this` at **call time** (dynamic). Arrow functions inherit `this` **lexically**.

```js
const obj = {
  name: "Mark",
  regular() {
    console.log(this.name) // "Mark" — dynamic this from method call
  },
  arrow: () => {
    console.log(this?.name) // undefined — lexical this from outer scope
  },
}
```

This distinction is covered in depth on Day 3.

## W — Why It Matters

- Lexical scope is the mental model for understanding all variable access in JavaScript.
- It's the prerequisite for closures — if you get lexical scope, closures become simple.
- It explains why arrow functions capture `this` differently from regular functions.
- Interview questions about scope are really questions about lexical scope.

## I — Interview Questions with Answers

### Q1: What is lexical scope?

**A:** Lexical (static) scope means a function's accessible variables are determined by where the function is physically written in the source code. The scope chain is established at definition time, not call time.

### Q2: How does variable lookup work in JavaScript?

**A:** When a variable is referenced, the engine searches:
1. Current function/block scope
2. Enclosing function/block scope
3. Continues outward...
4. Global scope
5. If not found → `ReferenceError`

### Q3: What is the difference between lexical and dynamic scope?

**A:** Lexical scope looks up variables from where the function is **defined**. Dynamic scope looks up variables from where the function is **called**. JavaScript uses lexical scope.

### Q4: Is `this` lexically scoped?

**A:** In **arrow functions**, yes — `this` is inherited from the enclosing scope. In **regular functions**, no — `this` is determined dynamically at call time.

## C — Common Pitfalls with Fix

### Pitfall: Expecting variables from the call site

```js
const x = "outer"
function logX() { console.log(x) }

function callLogX() {
  const x = "inner"
  logX()
}
callLogX() // "outer" — not "inner"
```

**Fix:** Understand that `logX` looks up `x` from where it was defined, not from where it was called.

### Pitfall: Shadowing

```js
const x = "outer"
function example() {
  const x = "inner" // shadows outer x
  console.log(x) // "inner"
}
example()
console.log(x) // "outer" — unchanged
```

**Fix:** Be aware of shadowing. It's not a bug, but it can cause confusion. Avoid reusing variable names from outer scopes.

### Pitfall: Assuming block scope for `var`

```js
function example() {
  if (true) {
    var x = 1 // function-scoped, NOT block-scoped
  }
  console.log(x) // 1
}
```

**Fix:** Use `let`/`const` for block scope.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` print?

```js
const a = 1

function first() {
  const a = 2

  function second() {
    console.log(a)
  }

  return second
}

function third() {
  const a = 3
  const fn = first()
  fn()
}

third()
```

### Solution

```
2
```

`second()` was **defined** inside `first()`, where `a = 2`. Even though it's called from `third()` where `a = 3`, lexical scope means it looks up `a` from its definition site.

---

# 8 — Block, Function & Global Scope

## T — TL;DR

JavaScript has three main scope levels:

| Scope | Created by | `var` visible? | `let`/`const` visible? |
|-------|------------|----------------|------------------------|
| **Global** | Top-level code | ✅ | ✅ |
| **Function** | `function() {}` | ✅ | ✅ |
| **Block** | `{}`, `if`, `for`, `while`, etc. | ❌ (var escapes) | ✅ |

## K — Key Concepts

### Global Scope

Variables declared at the top level (outside any function or block) are globally accessible.

```js
var globalVar = "var"     // added to globalThis (window in browser)
let globalLet = "let"     // NOT added to globalThis
const globalConst = "const" // NOT added to globalThis

console.log(globalThis.globalVar)   // "var"
console.log(globalThis.globalLet)   // undefined
console.log(globalThis.globalConst) // undefined
```

In **ES modules**, even `var` does not attach to `globalThis` — modules have their own scope.

### Function Scope

Every function creates a new scope. All declarations inside are invisible outside.

```js
function example() {
  var a = 1
  let b = 2
  const c = 3
  console.log(a, b, c) // 1, 2, 3
}

example()
// console.log(a) // ReferenceError
// console.log(b) // ReferenceError
// console.log(c) // ReferenceError
```

`var` is function-scoped — it **does not escape functions**, only blocks.

### Block Scope

Any `{ }` creates a block scope for `let` and `const`. `var` ignores block boundaries.

```js
{
  var a = 1
  let b = 2
  const c = 3
}

console.log(a) // 1 — var escapes block
// console.log(b) // ReferenceError
// console.log(c) // ReferenceError
```

Blocks include: `if`, `else`, `for`, `while`, `switch`, `try`/`catch`, and standalone `{ }`.

```js
if (true) {
  let x = 10
}
// console.log(x) // ReferenceError

for (let i = 0; i < 3; i++) {}
// console.log(i) // ReferenceError

for (var j = 0; j < 3; j++) {}
console.log(j) // 3 — var escapes
```

### Scope Nesting

Scopes nest. Inner scopes can access outer scopes but not vice versa.

```js
const global = "G"

function outer() {
  const outerVar = "O"

  function inner() {
    const innerVar = "I"
    console.log(global)   // ✅ "G"
    console.log(outerVar) // ✅ "O"
    console.log(innerVar) // ✅ "I"
  }

  inner()
  // console.log(innerVar) // ❌ ReferenceError
}

outer()
// console.log(outerVar) // ❌ ReferenceError
```

### Shadowing

An inner scope can declare a variable with the same name as an outer variable:

```js
const x = "outer"

function example() {
  const x = "inner" // shadows outer x
  console.log(x) // "inner"
}

example()
console.log(x) // "outer" — unaffected
```

`let` can shadow `var` and vice versa across different scope levels:

```js
var x = 1
{
  let x = 2       // shadows var x inside this block
  console.log(x)  // 2
}
console.log(x) // 1
```

But you **cannot** re-declare with `let`/`const` in the same scope:

```js
let x = 1
// let x = 2 // SyntaxError: Identifier 'x' has already been declared
```

### Undeclared Variables (Implicit Globals)

Assigning to a variable without declaring it creates a global in sloppy mode:

```js
function example() {
  leaked = "oops" // no var/let/const — implicit global!
}
example()
console.log(leaked) // "oops" — on globalThis
```

Strict mode prevents this:

```js
"use strict"
function example() {
  leaked = "oops" // ReferenceError: leaked is not defined
}
```

### `var` in `for` Loops — The Classic Bug

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 3, 3, 3 — one i shared across all iterations

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 0, 1, 2 — new i per iteration (block-scoped)
```

## W — Why It Matters

- Scope determines variable lifetime and accessibility — fundamental to all JS.
- Block scope with `let`/`const` prevents an entire category of bugs that `var` allows.
- Understanding global scope pollution helps you write safer code.
- The `var` loop bug is a top-5 JS interview question.

## I — Interview Questions with Answers

### Q1: What are the three scope types in JavaScript?

**A:** Global scope, function scope, and block scope. `var` is function-scoped (ignores blocks). `let` and `const` are block-scoped.

### Q2: Does `var` respect block scope?

**A:** No. `var` only respects function scope. It leaks out of `if`, `for`, `while`, and other blocks.

### Q3: What is an implicit global?

**A:** Assigning to an undeclared variable in sloppy mode creates a property on `globalThis`. Strict mode throws a `ReferenceError` instead.

### Q4: What is variable shadowing?

**A:** When an inner scope declares a variable with the same name as one in an outer scope. The inner variable "shadows" the outer one within that scope.

## C — Common Pitfalls with Fix

### Pitfall: `var` leaking out of loops

```js
for (var i = 0; i < 5; i++) {}
console.log(i) // 5
```

**Fix:** Use `let`.

### Pitfall: Accidental implicit globals

```js
function f() { x = 10 }
```

**Fix:** Always declare with `let`/`const`. Use strict mode.

### Pitfall: Shadowing causing confusion

```js
let count = 0
function update() {
  let count = 10 // different variable!
  count++
}
update()
console.log(count) // 0 — outer count unchanged
```

**Fix:** Avoid reusing variable names from outer scopes unless intentional.

## K — Coding Challenge with Solution

### Challenge

```js
var a = "global"
let b = "global"

function test() {
  var a = "function"
  let b = "function"

  if (true) {
    var a2 = "block-var"
    let b2 = "block-let"
  }

  console.log(a)   // ?
  console.log(b)   // ?
  console.log(a2)  // ?
  // console.log(b2) // ?
}

test()
console.log(a)   // ?
console.log(b)   // ?
```

### Solution

```js
// Inside test():
console.log(a)   // "function" — shadows global var a
console.log(b)   // "function" — shadows global let b
console.log(a2)  // "block-var" — var escapes block into function scope
// console.log(b2) // ReferenceError — let is block-scoped

// Outside test():
console.log(a)   // "global" — function scope doesn't affect global
console.log(b)   // "global"
```

---

# 9 — Hoisting

## T — TL;DR

**Hoisting** is JavaScript's behavior of moving declarations to the top of their scope during compilation — before any code executes.

| Declaration | Hoisted? | Initialized? |
|-------------|----------|--------------|
| `var` | ✅ | ✅ to `undefined` |
| `let` / `const` | ✅ | ❌ (TDZ) |
| `function` declaration | ✅ | ✅ (fully) |
| `function` expression | Like its variable (`var`/`let`/`const`) | ❌ |
| `class` | ✅ | ❌ (TDZ) |

## K — Key Concepts

### What Actually Happens

JavaScript doesn't physically move code. During compilation, the engine:
1. Scans for all declarations.
2. Allocates memory for them in their scope.
3. Initializes some (like `var` to `undefined` and function declarations to their full definition).
4. Leaves others uninitialized (`let`, `const`, `class`) — in the **Temporal Dead Zone**.

### `var` Hoisting

`var` declarations are hoisted and initialized to `undefined`:

```js
console.log(x) // undefined — not ReferenceError
var x = 5
console.log(x) // 5
```

This is equivalent to:

```js
var x           // hoisted: declaration + initialization to undefined
console.log(x)  // undefined
x = 5           // assignment stays in place
console.log(x)  // 5
```

### `let` / `const` Hoisting

They ARE hoisted (the engine knows about them), but they are NOT initialized. Accessing them before the declaration line throws `ReferenceError`:

```js
// console.log(y) // ReferenceError: Cannot access 'y' before initialization
let y = 10

// console.log(z) // ReferenceError
const z = 20
```

The proof that they're hoisted (not just undeclared):

```js
const x = "outer"
{
  // console.log(x)
  // ReferenceError: Cannot access 'x' before initialization
  // If `x` wasn't hoisted, it would print "outer"
  const x = "inner"
}
```

### Function Declaration Hoisting

Function declarations are **fully hoisted** — both the name and the body:

```js
greet() // "Hello!" — works before the definition

function greet() {
  console.log("Hello!")
}
```

### Function Expression Hoisting

Function expressions follow the hoisting rules of their variable keyword:

```js
// var — hoisted as undefined
console.log(a) // undefined
// a()         // TypeError: a is not a function
var a = function () { return "a" }

// let/const — TDZ
// b()         // ReferenceError
const b = function () { return "b" }
```

### Class Hoisting

Classes are hoisted but NOT initialized (like `let`/`const`):

```js
// const user = new User() // ReferenceError: Cannot access 'User' before initialization
class User {}
```

### Hoisting Within Functions

Hoisting happens within each scope, not just the global scope:

```js
function example() {
  console.log(x) // undefined (var hoisted within function)
  var x = 10

  // console.log(y) // ReferenceError (let in TDZ within function)
  let y = 20
}
```

### Multiple Declarations — Function vs `var`

When both a function declaration and a `var` declaration exist for the same name, the function wins during hoisting:

```js
console.log(typeof x) // "function"
var x = 5
function x() {}
console.log(typeof x) // "number" — var assignment overwrites
```

### Hoisting Order (within the same scope)

1. Function declarations are hoisted first (with full body).
2. `var` declarations are hoisted next (with `undefined`), but if a function already claimed the name, `var` doesn't reset it.
3. Assignment happens at runtime in source order.

## W — Why It Matters

- Hoisting is one of JavaScript's most misunderstood features.
- It explains why `var` and function declarations behave differently from `let`/`const`.
- Understanding hoisting prevents `undefined` vs `ReferenceError` confusion.
- This is a top interview topic — candidates are asked to predict output involving hoisting.
- Hoisting + TDZ together form the foundation for understanding initialization order.

## I — Interview Questions with Answers

### Q1: What is hoisting?

**A:** Hoisting is JavaScript's behavior of processing declarations during the compilation phase before code execution. Variable and function declarations are "moved" to the top of their scope, though their assignments stay in place.

### Q2: Are `let` and `const` hoisted?

**A:** Yes, they are hoisted, but they are NOT initialized. They remain in the **Temporal Dead Zone** until the declaration line is reached. Accessing them before that throws `ReferenceError`.

### Q3: What is the difference between `undefined` and `ReferenceError` in hoisting?

**A:** `var` is hoisted and initialized to `undefined` — so accessing it early gives `undefined`. `let`/`const` are hoisted but uninitialized — accessing them early gives `ReferenceError`.

### Q4: What does this print?

```js
var x = 1
function x() {}
console.log(typeof x)
```

**A:** `"number"`. During hoisting, the function declaration is processed first, making `x` a function. Then the `var x` doesn't re-initialize (since `x` already exists). At runtime, `x = 1` assigns the number. So `typeof x` is `"number"`.

## C — Common Pitfalls with Fix

### Pitfall: Relying on `var` hoisting for code organization

```js
doSomething() // works with var + function declaration, confusing flow
function doSomething() { /* ... */ }
```

**Fix:** Define functions before use, or use `const fn = () => {}` which makes the order explicit.

### Pitfall: Conditional function declarations

```js
if (true) {
  function greet() { return "hi" }
}
greet() // behavior is inconsistent across engines!
```

**Fix:** Use function expressions inside blocks:

```js
let greet
if (true) {
  greet = function () { return "hi" }
}
```

### Pitfall: Thinking `let`/`const` aren't hoisted

```js
const x = "outer"
{
  // console.log(x) // ReferenceError — proves `x` IS hoisted
  const x = "inner"
}
```

**Fix:** Understand they ARE hoisted but remain in TDZ.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` print (or does it error)?

```js
console.log(a)
console.log(b)
console.log(c)
console.log(d)

var a = 1
let b = 2
const c = 3
function d() { return 4 }
```

### Solution

```js
console.log(a) // undefined — var hoisted with undefined
console.log(b) // ReferenceError — let is in TDZ (execution stops here)

// If we could continue:
console.log(c) // ReferenceError — const is in TDZ
console.log(d) // [Function: d] — function declaration fully hoisted
```

---

# 10 — Temporal Dead Zone (TDZ)

## T — TL;DR

The **Temporal Dead Zone** is the period between entering a scope and the point where a `let` or `const` variable is declared. Accessing the variable during this period throws a `ReferenceError`.

```js
{
  // TDZ for x starts here
  // console.log(x) // ReferenceError
  let x = 10 // TDZ for x ends here
  console.log(x) // 10
}
```

## K — Key Concepts

### The Timeline

```js
{
  // ──── TDZ for `x` begins (scope entered) ────

  console.log(typeof x) // ReferenceError (even typeof!)
  // x = 5              // ReferenceError

  // ──── TDZ for `x` ends (declaration reached) ────
  let x = 10
  console.log(x) // 10
}
```

### Why TDZ Exists

`var`'s behavior of silently being `undefined` before its declaration caused bugs:

```js
console.log(name) // undefined — looks like a bug but doesn't crash
var name = "Mark"
```

`let`/`const` chose a safer approach: **fail loudly** if you access before initialization.

### TDZ Proves Hoisting

If `let`/`const` weren't hoisted, accessing them before declaration would just resolve to an outer variable:

```js
const x = "outer"
{
  // If let x wasn't hoisted, this would print "outer"
  // But instead it throws ReferenceError — proving x IS hoisted
  // console.log(x) // ReferenceError: Cannot access 'x' before initialization
  let x = "inner"
}
```

The engine **knows** about the inner `x` (it's hoisted), but it's in the TDZ so access is denied.

### `typeof` and TDZ

Normally, `typeof` on an undeclared variable is safe:

```js
typeof undeclaredVariable // "undefined" — no error
```

But `typeof` on a TDZ variable **still throws**:

```js
{
  // typeof x // ReferenceError — x is in TDZ
  let x = 1
}
```

### TDZ in Different Contexts

**Function parameters:**

```js
// Default parameters have their own TDZ
function f(a = b, b = 1) {} // b is in TDZ when a's default is evaluated
f() // ReferenceError: Cannot access 'b' before initialization
```

**`for` loop:**

```js
for (let i = 0; i < 3; i++) {
  // i is available here — TDZ ended at the let declaration
  console.log(i)
}
```

**Class declarations:**

```js
// const instance = new MyClass() // ReferenceError: TDZ
class MyClass {}
```

**`const` must be initialized:**

```js
// const x // SyntaxError: Missing initializer in const declaration
const x = 1 // must have a value
```

### TDZ and Closures

```js
let x = "outer"

function example() {
  // A closure created here would close over the TDZ version of x
  // console.log(x) // ReferenceError if called before let x below
  let x = "inner"
  console.log(x) // "inner"
}

example()
```

### TDZ Duration — It's Temporal, Not Spatial

The "dead zone" is about **time**, not position in code:

```js
{
  // This function REFERENCES x, but doesn't ACCESS it during TDZ
  const fn = () => x // defining is fine — x isn't accessed yet

  let x = 42
  console.log(fn()) // 42 — called AFTER TDZ ends, so it works
}
```

```js
{
  const fn = () => x

  // fn() // ReferenceError — called DURING TDZ
  let x = 42
  fn() // 42 — called AFTER TDZ ends
}
```

## W — Why It Matters

- TDZ prevents a class of bugs that `var` silently allows.
- Understanding TDZ means you truly understand `let`/`const` hoisting.
- The "temporal not spatial" distinction is a deep knowledge indicator in interviews.
- TDZ in default parameters and class declarations catches many developers off guard.

## I — Interview Questions with Answers

### Q1: What is the Temporal Dead Zone?

**A:** The TDZ is the period from when a scope is entered to when a `let` or `const` variable is declared. During this period, the variable exists (is hoisted) but cannot be accessed — any attempt throws `ReferenceError`.

### Q2: Does `typeof` protect against TDZ?

**A:** No. `typeof` on a TDZ variable still throws `ReferenceError`. It only returns `"undefined"` safely for completely undeclared variables.

### Q3: Is TDZ spatial or temporal?

**A:** **Temporal** (time-based). It's about when the variable is accessed relative to when it's declared, not where the access appears in the code. A function defined during TDZ can reference the variable, as long as it's not called until after the declaration.

### Q4: Does `var` have a TDZ?

**A:** No. `var` is hoisted and initialized to `undefined` immediately. There is no dead zone.

## C — Common Pitfalls with Fix

### Pitfall: Accessing `let`/`const` before declaration assuming it's like `var`

```js
console.log(x) // ReferenceError
let x = 5
```

**Fix:** Always declare before use.

### Pitfall: Default parameter TDZ

```js
function f(a = b, b = 1) {} // ReferenceError
```

**Fix:** Only reference earlier parameters in defaults.

### Pitfall: Thinking `typeof` is safe for TDZ variables

```js
{
  typeof x // ReferenceError!
  let x = 1
}
```

**Fix:** Be aware that `typeof` does NOT protect against TDZ, only against undeclared variables.

## K — Coding Challenge with Solution

### Challenge

Which lines throw and which succeed?

```js
// Snippet 1
{
  const fn = () => y
  let y = 42
  console.log(fn())
}

// Snippet 2
{
  const fn = () => z
  console.log(fn())
  let z = 42
}

// Snippet 3
const a = "outer"
{
  console.log(a)
  const a = "inner"
}
```

### Solution

```js
// Snippet 1
console.log(fn()) // 42 ✅ — fn is called AFTER TDZ ends

// Snippet 2
console.log(fn()) // ReferenceError ❌ — fn is called DURING TDZ for z

// Snippet 3
console.log(a) // ReferenceError ❌ — inner `a` is hoisted, creating TDZ, shadowing outer `a`
```

---

# 11 — Strict Mode

## T — TL;DR

Strict mode is an opt-in restricted variant of JavaScript that catches common mistakes and prevents unsafe actions.

```js
"use strict"

x = 10 // ReferenceError — no implicit globals
```

ES modules and classes are **always in strict mode** by default.

## K — Key Concepts

### Enabling Strict Mode

**File-level:**

```js
"use strict"
// entire file is strict
```

**Function-level:**

```js
function example() {
  "use strict"
  // only this function is strict
}
```

**Automatic strict mode:**
- ES modules (`import`/`export`) are always strict.
- Class bodies are always strict.

### What Strict Mode Prevents

**1. Implicit globals:**

```js
"use strict"
x = 10 // ReferenceError: x is not defined
```

Without strict mode, this silently creates a global variable.

**2. Assigning to read-only properties:**

```js
"use strict"
const obj = Object.freeze({ x: 1 })
obj.x = 2 // TypeError: Cannot assign to read only property
```

In sloppy mode, this fails silently.

**3. Deleting undeletable properties:**

```js
"use strict"
delete Object.prototype // TypeError
```

**4. Duplicate parameter names:**

```js
"use strict"
// function f(a, a) {} // SyntaxError: Duplicate parameter name not allowed
```

**5. Octal literals with leading zero:**

```js
"use strict"
// const n = 010 // SyntaxError
const n = 0o10   // ✅ Use 0o prefix for octals
```

**6. Setting properties on primitives:**

```js
"use strict"
true.x = 1 // TypeError: Cannot create property 'x' on boolean 'true'
```

**7. `arguments` aliasing broken:**

```js
"use strict"
function f(a) {
  arguments[0] = 99
  console.log(a) // 1 — NOT linked in strict mode
}
f(1)
```

**8. `this` is `undefined` in plain function calls:**

```js
"use strict"
function example() {
  console.log(this) // undefined — not globalThis
}
example()
```

In sloppy mode, `this` would be `globalThis` (or `window`).

**9. `with` statement is banned:**

```js
"use strict"
// with (obj) {} // SyntaxError
```

**10. `eval` doesn't introduce variables into surrounding scope:**

```js
"use strict"
eval("var x = 10")
// console.log(x) // ReferenceError
```

**11. `arguments.callee` is banned:**

```js
"use strict"
function f() {
  arguments.callee // TypeError
}
```

### Full List of Changes

| Sloppy Mode | Strict Mode |
|-------------|-------------|
| Undeclared assignment creates global | `ReferenceError` |
| Silent failure on read-only | `TypeError` |
| Duplicate params allowed | `SyntaxError` |
| `this` in plain call = `globalThis` | `this` = `undefined` |
| `arguments` aliased to params | Not aliased |
| `010` = octal 8 | `SyntaxError` |
| `with` allowed | `SyntaxError` |
| `eval` leaks vars | Vars stay in `eval` scope |
| `arguments.callee` available | `TypeError` |
| `delete` on non-configurable = silent | `TypeError` |

### Strict Mode in Modern Code

Since **ES modules** are strict by default, if your project uses:

```js
// package.json
{ "type": "module" }
```

Or files with `.mjs` extension, you're already in strict mode. No need for `"use strict"`.

Similarly, all code inside `class` bodies is strict:

```js
class Example {
  method() {
    // already strict mode
    x = 10 // ReferenceError
  }
}
```

## W — Why It Matters

- Strict mode catches bugs that sloppy mode silently ignores.
- It's the default in modern JS (modules and classes).
- Understanding strict vs sloppy explains differences in `this`, `arguments`, and error behavior.
- Production code should always be strict — either via `"use strict"` or by using modules.
- Interview questions often ask about `this` behavior, which differs between modes.

## I — Interview Questions with Answers

### Q1: What is strict mode?

**A:** An opt-in restricted variant of JavaScript that catches common coding errors by throwing exceptions instead of silently failing. Enabled by `"use strict"` or automatically in ES modules and class bodies.

### Q2: What does `this` equal in a plain function call in strict mode?

**A:** `undefined`. In sloppy mode, it would be `globalThis` (or `window` in browsers).

### Q3: How do you enable strict mode?

**A:** Add `"use strict"` at the top of a file or function body. Or use ES modules / classes, which are strict by default.

### Q4: Name three things strict mode prevents.

**A:**
1. Implicit global variable creation
2. Silent failure when assigning to read-only properties
3. Duplicate parameter names

## C — Common Pitfalls with Fix

### Pitfall: Expecting `this` to be `globalThis` in strict mode

```js
"use strict"
function example() {
  console.log(this) // undefined, not window/globalThis
}
```

**Fix:** Understand the rule. Use `.call(obj)` or `.bind(obj)` if you need a specific `this`.

### Pitfall: Not knowing modules are strict

```js
// In an ES module:
x = 10 // ReferenceError — strict mode is automatic
```

**Fix:** Always declare variables. If you're using modules, you're already in strict mode.

### Pitfall: Placing `"use strict"` after code

```js
const x = 1
"use strict" // has no effect — must be the FIRST statement
```

**Fix:** Place `"use strict"` at the very top of the file or function.

## K — Coding Challenge with Solution

### Challenge

What happens in strict mode for each?

```js
"use strict"

// 1
x = 5

// 2
const obj = Object.freeze({ a: 1 })
obj.a = 2

// 3
function f(a, a) { return a }

// 4
function g() { return this }
console.log(g())

// 5
delete Object.prototype
```

### Solution

```js
// 1 — ReferenceError: x is not defined (no implicit globals)

// 2 — TypeError: Cannot assign to read only property 'a'

// 3 — SyntaxError: Duplicate parameter name not allowed in this context

// 4 — undefined (this is undefined in plain function call in strict mode)

// 5 — TypeError: Cannot delete property 'prototype' of function Object
```

---

# 12 — Scope → Closure Mental Model (Bridge to Day 3)

## T — TL;DR

A **closure** is a function that **remembers the variables from the scope where it was created**, even after that scope has finished executing.

If you understand **lexical scope** + **functions as values**, you already understand closures — you just need the name.

```js
function makeCounter() {
  let count = 0 // this variable lives on after makeCounter returns
  return function () {
    count++
    return count
  }
}

const counter = makeCounter()
counter() // 1
counter() // 2
counter() // 3
```

## K — Key Concepts

### The Mental Model — Three Steps

**Step 1: Functions carry their scope backpack.**

When a function is created, it gets a hidden reference to the variables in its enclosing scope. This reference is the closure.

```js
function outer() {
  const secret = "hidden"

  function inner() {
    return secret // inner "closes over" secret
  }

  return inner
}
```

**Step 2: The scope outlives the function call.**

Normally, when `outer()` finishes, its local variables would be garbage collected. But if an inner function references them and is still alive, those variables survive.

```js
const fn = outer() // outer() is done, but `secret` lives on
fn() // "hidden" — still accessible
```

**Step 3: Each call creates a fresh scope.**

```js
const counter1 = makeCounter()
const counter2 = makeCounter()

counter1() // 1
counter1() // 2
counter2() // 1 — independent scope, own `count`
```

### Scope Chain Visualization

```
makeCounter() call #1
  └─ count = 0
     └─ returned function (closure) → remembers this count

makeCounter() call #2
  └─ count = 0 (separate variable)
     └─ returned function (closure) → remembers THIS count
```

### Closures Are Everywhere

You've been using closures without knowing:

```js
// Event handlers
function setup() {
  const message = "clicked!"
  button.addEventListener("click", function () {
    console.log(message) // closure over message
  })
}

// Array methods
function multiplyAll(arr, factor) {
  return arr.map(x => x * factor) // closure over factor
}

// setTimeout
function delayedGreet(name) {
  setTimeout(() => {
    console.log(`Hello, ${name}!`) // closure over name
  }, 1000)
}

// Module pattern (IIFE + closure)
const module = (function () {
  let private = 0
  return {
    increment() { private++ },
    get() { return private },
  }
})()
```

### What Gets Closed Over

A closure captures the **variable itself** (the binding), not the **value at the time of creation**:

```js
function example() {
  let x = 1
  const getter = () => x
  x = 2
  return getter
}

example()() // 2 — not 1! The closure captures the variable x, not the value 1
```

This is critical for understanding the `var` loop bug:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 3, 3, 3 — all closures share the same `i` variable

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 0, 1, 2 — each iteration creates a new `i` binding
```

### Closure + Scope Chain = Access to Outer Variables

```js
function a() {
  const x = 1
  function b() {
    const y = 2
    function c() {
      console.log(x + y) // c closes over b's y and a's x
    }
    return c
  }
  return b
}

a()()() // 3
```

### Preview: Patterns You'll Build on Day 3

- **Private state** (counter, cache, config)
- **Currying and partial application**
- **Memoization**
- **Factory functions**
- **Module pattern**
- **Iterators**

All of these are closure patterns. Day 3 will explore each in depth.

## W — Why It Matters

- Closures are **the most important concept in JavaScript** after basic syntax.
- They power: event handlers, callbacks, promises, React hooks, module patterns, data privacy, currying, memoization.
- Every JS interview tests closure understanding — either directly or through scope questions.
- If you understand scope, you already understand closures. Day 3 just adds practical patterns.

## I — Interview Questions with Answers

### Q1: What is a closure?

**A:** A closure is a function that retains access to variables from its enclosing (lexical) scope, even after that scope has finished executing. The function "closes over" those variables.

### Q2: What does this print?

```js
function makeAdder(x) {
  return function (y) {
    return x + y
  }
}

const add5 = makeAdder(5)
console.log(add5(3))
```

**A:** `8`. `add5` is a closure that remembers `x = 5` from the `makeAdder(5)` call. When called with `3`, it returns `5 + 3 = 8`.

### Q3: Do closures capture values or references?

**A:** **References** (the variable binding itself). If the closed-over variable changes later, the closure sees the updated value.

### Q4: Why does the `var` loop + `setTimeout` print the same number?

**A:** Because `var` is function-scoped, all callbacks close over the **same `i`** variable. By the time the callbacks run, the loop has finished and `i` has its final value. With `let`, each iteration creates a new binding, so each callback has its own `i`.

## C — Common Pitfalls with Fix

### Pitfall: Thinking closures capture values, not variables

```js
let x = "initial"
const fn = () => x
x = "changed"
fn() // "changed" — not "initial"
```

**Fix:** Remember closures capture the **variable** (binding), not a snapshot of its value.

### Pitfall: Closure + `var` in loops

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 3, 3, 3
```

**Fix:** Use `let`, or create a new scope per iteration (IIFE or helper function).

### Pitfall: Accidental memory retention

Closures keep references alive, which can prevent garbage collection:

```js
function createHandler() {
  const hugeData = new Array(1000000).fill("x")
  return function () {
    // even if this function never uses hugeData,
    // some engines may keep it alive because it's in scope
    console.log("handler called")
  }
}
```

**Fix:** Set large references to `null` when done, or restructure to avoid unnecessary captures. (Covered in depth on Day 6 — Memory & WeakRefs.)

## K — Coding Challenge with Solution

### Challenge

Build a function `createSecretHolder(secret)` that:
1. Stores a secret string.
2. Returns an object with `getSecret()` and `setSecret(newSecret)`.
3. The secret cannot be accessed directly — only through the methods.

```js
const holder = createSecretHolder("abc")
holder.getSecret()    // "abc"
holder.setSecret("xyz")
holder.getSecret()    // "xyz"
// holder.secret      // undefined — not directly accessible
```

### Solution

```js
function createSecretHolder(secret) {
  // `secret` is a closure variable — private
  return {
    getSecret() {
      return secret
    },
    setSecret(newSecret) {
      secret = newSecret
    },
  }
}

const holder = createSecretHolder("abc")
console.log(holder.getSecret())    // "abc"
holder.setSecret("xyz")
console.log(holder.getSecret())    // "xyz"
console.log(holder.secret)         // undefined — secret is not a property
```

**How it works:** `secret` lives in the closure scope of `createSecretHolder`. The returned object's methods are closures that access `secret`, but nothing outside can reach it directly.

---

# ✅ Day 2 Complete

You've covered all 12 subtopics:

| # | Topic | Status |
|---|-------|--------|
| 1 | Function Declarations vs Expressions vs Arrow Functions | ✅ |
| 2 | Default Parameters | ✅ |
| 3 | Rest Parameters | ✅ |
| 4 | `arguments` Object | ✅ |
| 5 | `Function.prototype.length` & `.name` | ✅ |
| 6 | IIFE | ✅ |
| 7 | Lexical Scope | ✅ |
| 8 | Block, Function & Global Scope | ✅ |
| 9 | Hoisting | ✅ |
| 10 | Temporal Dead Zone (TDZ) | ✅ |
| 11 | Strict Mode | ✅ |
| 12 | Scope → Closure Mental Model (Bridge to Day 3) | ✅ |

## Next Steps

- `Quiz Day 2` — 5 interview-style problems covering all topics
- `Generate Day 3` — Closures, `this`, Prototypes & Metaprogramming
- `next topic` — continue to Day 3's first subtopic
- `recap` — quick Day 2 summary