
# 📘 Day 2 — Functions, Scope & Hoisting

> Phase 1 · JavaScript Basics to Advanced
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

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

JavaScript has three main ways to create functions — **declarations** are hoisted, **expressions** are not, and **arrow functions** are concise expressions that don't have their own `this`.

## K — Key Concepts

### Function Declaration

A named function defined with the `function` keyword as a **statement**. It is **fully hoisted** — you can call it before the line it's defined on.

```js
// ✅ Works — declaration is hoisted
greet("Mark")

function greet(name) {
  return `Hello, ${name}!`
}
```

### Function Expression

A function assigned to a variable. The **variable** is hoisted (with `var`) or in TDZ (with `let`/`const`), but the **function itself is not**.

```js
// ❌ TypeError: greet is not a function (with var)
// ❌ ReferenceError (with const/let)
greet("Mark")

const greet = function (name) {
  return `Hello, ${name}!`
}
```

**Named function expression** — the name is only accessible inside the function itself (useful for recursion and stack traces):

```js
const factorial = function fact(n) {
  if (n <= 1) return 1
  return n * fact(n - 1) // fact is accessible here
}

// fact(5) // ReferenceError — fact is NOT accessible outside
factorial(5) // 120
```

### Arrow Function

Introduced in ES6. Concise syntax with **critical behavioral differences**:

```js
// Basic syntax
const add = (a, b) => a + b

// Single parameter — parentheses optional
const double = n => n * 2

// Multi-line body — needs braces and explicit return
const greet = (name) => {
  const message = `Hello, ${name}!`
  return message
}

// Returning an object literal — wrap in parentheses
const makeUser = (name) => ({ name, active: true })
```

### Key Differences Table

| Feature | Declaration | Expression | Arrow |
|---------|------------|------------|-------|
| Hoisted? | ✅ Fully | ❌ No | ❌ No |
| Has own `this`? | ✅ Yes | ✅ Yes | ❌ No (lexical) |
| Has `arguments`? | ✅ Yes | ✅ Yes | ❌ No |
| Can be a constructor? | ✅ `new Foo()` | ✅ `new Foo()` | ❌ No |
| Has `prototype`? | ✅ Yes | ✅ Yes | ❌ No |
| Has `.name`? | ✅ Function name | ✅ Variable name | ✅ Variable name |

### Arrow Functions and `this`

This is the **most important** difference. Arrow functions capture `this` from the **enclosing lexical scope** at the time they're defined:

```js
const obj = {
  name: "Mark",

  // Regular method — `this` is determined by how it's called
  greetRegular: function () {
    console.log(`Hello, ${this.name}`)
  },

  // Arrow — `this` is captured from where the arrow is defined
  greetArrow: () => {
    console.log(`Hello, ${this.name}`) // `this` is the outer scope, NOT obj
  },
}

obj.greetRegular() // "Hello, Mark"
obj.greetArrow()   // "Hello, undefined" — `this` is not obj!
```

Arrow functions are **perfect** for callbacks where you want to preserve the outer `this`:

```js
class Timer {
  constructor() {
    this.seconds = 0
  }

  start() {
    // Arrow captures `this` from start() → the Timer instance
    setInterval(() => {
      this.seconds++
      console.log(this.seconds)
    }, 1000)
  }
}
```

Without the arrow, you'd need `const self = this` or `.bind(this)`.

### When to Use What

| Use Case | Best Choice |
|----------|-------------|
| Top-level named functions | Declaration |
| Callbacks, `.map`, `.filter` | Arrow |
| Object methods | Declaration / expression (`function`) |
| Methods that need `this` | Regular function (not arrow) |
| Constructors | Declaration / expression (`function`) or `class` |
| One-liner transforms | Arrow |

## W — Why It Matters

- Arrow functions and `this` behavior come up in **every** React codebase (event handlers, hooks).
- Understanding hoisting of declarations vs expressions prevents "not a function" errors.
- Named function expressions improve **stack traces** in production debugging.
- Interviewers test `this` binding in arrow vs regular functions constantly.

## I — Interview Questions with Answers

### Q1: What are the differences between function declarations and arrow functions?

**A:** Function declarations are hoisted, have their own `this` and `arguments`, and can be used as constructors. Arrow functions are not hoisted, inherit `this` from the enclosing scope (lexical `this`), don't have `arguments`, and cannot be used with `new`.

### Q2: Why can't you use arrow functions as object methods?

**A:** Because arrow functions don't have their own `this`. When used as an object method, `this` refers to the enclosing scope (often `window`/`globalThis` or `undefined` in strict mode), not the object.

### Q3: What is a named function expression?

**A:** A function expression with a name: `const foo = function bar() {}`. The name `bar` is only accessible inside the function body (useful for recursion). The outer binding is `foo`.

### Q4: Can you call `new` on an arrow function?

**A:** No. Arrow functions don't have a `[[Construct]]` internal method or `prototype` property. Using `new` on them throws a `TypeError`.

## C — Common Pitfalls with Fix

### Pitfall: Using arrow functions as object methods

```js
const obj = {
  name: "Mark",
  greet: () => console.log(this.name), // `this` is NOT obj
}
obj.greet() // undefined
```

**Fix:** Use a regular function or shorthand method:

```js
const obj = {
  name: "Mark",
  greet() { console.log(this.name) }, // shorthand method — correct
}
```

### Pitfall: Forgetting parentheses when returning object literals from arrows

```js
const make = () => { name: "Mark" } // interpreted as a label, returns undefined!
```

**Fix:** Wrap in parentheses:

```js
const make = () => ({ name: "Mark" })
```

### Pitfall: Trying to use `arguments` in an arrow function

```js
const fn = () => console.log(arguments) // ReferenceError or captures outer arguments
```

**Fix:** Use rest parameters: `const fn = (...args) => console.log(args)`.

### Pitfall: Calling a function expression before it's defined

```js
greet() // TypeError or ReferenceError
const greet = function () { return "hi" }
```

**Fix:** Define function expressions before you call them, or use a function declaration if hoisting is needed.

## K — Coding Challenge with Solution

### Challenge

What does each line output?

```js
console.log(a())
console.log(b())
console.log(c())

function a() { return "declaration" }
var b = function () { return "expression" }
const c = () => "arrow"
```

### Solution

```js
console.log(a()) // "declaration" — function declaration is fully hoisted ✅
console.log(b()) // TypeError: b is not a function — var b is hoisted as undefined
console.log(c()) // ReferenceError — const c is in TDZ

function a() { return "declaration" }
var b = function () { return "expression" }
const c = () => "arrow"
```

Only the function **declaration** can be called before its definition.

---

# 2 — Default Parameters

## T — TL;DR

Default parameters let you set fallback values for function arguments when they're `undefined` (or not passed).

```js
function greet(name = "World") {
  return `Hello, ${name}!`
}
```

## K — Key Concepts

### Basic Syntax

```js
function greet(name = "World") {
  return `Hello, ${name}!`
}

greet("Mark")    // "Hello, Mark!"
greet()          // "Hello, World!"
greet(undefined) // "Hello, World!" — undefined triggers the default
greet(null)      // "Hello, null!" — null does NOT trigger the default
greet("")        // "Hello, !" — empty string does NOT trigger the default
```

Key rule: **Defaults only kick in for `undefined`**, not for other falsy values.

### Expressions as Defaults

Defaults can be **any expression**, evaluated at call time:

```js
function createId(prefix = "id", timestamp = Date.now()) {
  return `${prefix}_${timestamp}`
}

createId() // "id_1713500000000" — Date.now() is called each time
createId() // "id_1713500000001" — different timestamp
```

### Defaults Can Reference Earlier Parameters

```js
function createUser(name, greeting = `Hello, ${name}!`) {
  return { name, greeting }
}

createUser("Mark") // { name: "Mark", greeting: "Hello, Mark!" }
```

But you **cannot** reference later parameters:

```js
function broken(a = b, b = 1) {} // ReferenceError — b is in TDZ
```

### Default Parameters and `arguments`

Default parameters do NOT affect the `arguments` object:

```js
function example(a, b = 10) {
  console.log(arguments.length) // reflects actual arguments passed
  console.log(arguments[1])     // undefined if b wasn't passed
  console.log(b)                // 10 (default applied)
}

example(1)
// arguments.length = 1
// arguments[1] = undefined
// b = 10
```

### Destructured Defaults

```js
function createUser({ name = "Anonymous", role = "user" } = {}) {
  return { name, role }
}

createUser()                    // { name: "Anonymous", role: "user" }
createUser({ name: "Mark" })   // { name: "Mark", role: "user" }
createUser({ role: "admin" })  // { name: "Anonymous", role: "admin" }
```

The `= {}` at the end handles the case where the entire object is missing.

### The Old Way (Pre-ES6)

```js
// Before default parameters:
function greet(name) {
  name = name || "World" // Bug: treats "", 0, false as missing!
}

// Correct old way:
function greet(name) {
  name = name !== undefined ? name : "World"
}

// Modern way — clean and correct:
function greet(name = "World") {}
```

## W — Why It Matters

- Default parameters make function APIs cleaner and more self-documenting.
- They eliminate verbose `undefined` checks at the top of every function.
- Understanding that only `undefined` triggers defaults (not `null`) prevents bugs.
- Destructured defaults are used **everywhere** in React components (props) and configuration objects.

## I — Interview Questions with Answers

### Q1: What values trigger default parameters?

**A:** Only `undefined` (including when the argument is not passed at all). `null`, `0`, `""`, `false`, and `NaN` do NOT trigger defaults.

### Q2: Are default parameter expressions evaluated eagerly or lazily?

**A:** **Lazily** — at call time, not at function definition time. If you use `Date.now()` as a default, it's called fresh each time the function runs with that parameter missing.

### Q3: Can a default parameter reference another parameter?

**A:** Yes, but only parameters defined **before** it (left to right). Referencing a later parameter causes a `ReferenceError` due to the TDZ.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `null` to trigger the default

```js
function fn(x = 10) { return x }
fn(null) // null — NOT 10!
```

**Fix:** If you want to handle `null` too, use `??`:

```js
function fn(x) {
  const value = x ?? 10
  return value
}
```

### Pitfall: Using `||` instead of default parameters

```js
function fn(x) { x = x || 10 }
fn(0)  // 10 — wrong! 0 is a valid value
fn("") // 10 — wrong! "" might be valid
```

**Fix:** Use default parameters or `??`.

### Pitfall: Forgetting the `= {}` on destructured objects

```js
function fn({ name = "default" }) {} // crashes if called with fn()
```

**Fix:**

```js
function fn({ name = "default" } = {}) {} // safe with fn()
```

## K — Coding Challenge with Solution

### Challenge

What does each call return?

```js
function test(a, b = a * 2, c = b + 1) {
  return [a, b, c]
}

console.log(test(5))
console.log(test(5, 3))
console.log(test(5, undefined, 100))
```

### Solution

```js
test(5)                 // [5, 10, 11]  — b = 5*2 = 10, c = 10+1 = 11
test(5, 3)              // [5, 3, 4]   — b = 3 (provided), c = 3+1 = 4
test(5, undefined, 100) // [5, 10, 100] — b = 5*2 = 10 (undefined triggers default), c = 100 (provided)
```

---

# 3 — Rest Parameters

## T — TL;DR

Rest parameters (`...args`) collect all remaining arguments into a **real array**.

```js
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0)
}
```

## K — Key Concepts

### Basic Syntax

```js
function sum(...numbers) {
  console.log(numbers)        // [1, 2, 3, 4]
  console.log(Array.isArray(numbers)) // true — it's a real array
  return numbers.reduce((a, b) => a + b, 0)
}

sum(1, 2, 3, 4) // 10
```

### Rest Must Be Last

```js
function tag(first, ...rest) {
  console.log(first) // "a"
  console.log(rest)  // ["b", "c", "d"]
}

tag("a", "b", "c", "d")
```

```js
// ❌ SyntaxError — rest must be the last parameter
function broken(...rest, last) {}
```

### Only One Rest Parameter Allowed

```js
// ❌ SyntaxError
function broken(...a, ...b) {}
```

### Rest vs Spread

They look the same (`...`) but serve **opposite** purposes:

```js
// REST — collects into an array (in function parameters or destructuring)
function fn(...args) {} // rest
const [first, ...rest] = [1, 2, 3] // rest in destructuring

// SPREAD — expands an iterable (in function calls or literals)
fn(...[1, 2, 3]) // spread
const arr = [...oldArr, 4, 5] // spread in array
const obj = { ...oldObj, key: "val" } // spread in object
```

### Rest in Arrow Functions

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0)
sum(1, 2, 3) // 6
```

This is the **only** way to access all arguments in an arrow function (since arrows don't have `arguments`).

### Rest in Destructuring

```js
// Array destructuring
const [first, second, ...remaining] = [1, 2, 3, 4, 5]
// first = 1, second = 2, remaining = [3, 4, 5]

// Object destructuring
const { name, ...rest } = { name: "Mark", age: 30, role: "dev" }
// name = "Mark", rest = { age: 30, role: "dev" }
```

## W — Why It Matters

- Rest parameters replace the old `arguments` object with a clean, modern alternative.
- They produce a **real array** — no more `Array.from(arguments)` hacks.
- Rest + destructuring is used everywhere in React (forwarding props, extracting specific ones).
- Understanding rest vs spread prevents confusion when reading modern JS/TS code.

## I — Interview Questions with Answers

### Q1: What is the difference between rest parameters and the `arguments` object?

**A:** Rest parameters create a **real array** of remaining arguments. `arguments` is an array-like object (not a real array) that contains **all** arguments. Rest works in arrow functions; `arguments` does not.

### Q2: Can you have multiple rest parameters?

**A:** No. Only one rest parameter is allowed, and it must be the **last** parameter.

### Q3: What is the difference between rest and spread?

**A:** Rest **collects** multiple values into one array/object (used in parameters and destructuring). Spread **expands** an iterable into individual elements (used in function calls and literals).

## C — Common Pitfalls with Fix

### Pitfall: Putting rest before other parameters

```js
function fn(...rest, last) {} // SyntaxError
```

**Fix:** Rest must always be last: `function fn(last, ...rest) {}`

### Pitfall: Confusing rest and spread

```js
const fn = (...args) => {} // rest — collecting
fn(...[1, 2, 3])           // spread — expanding
```

**Fix:** Remember: `...` in a **definition/pattern** = rest (collecting). `...` in a **call/literal** = spread (expanding).

### Pitfall: Empty rest array when no extra arguments

```js
function fn(a, ...rest) {
  console.log(rest) // [] — NOT undefined
}
fn(1)
```

**Fix:** This is actually fine — rest always returns an array, even if empty. No special handling needed.

## K — Coding Challenge with Solution

### Challenge

Write a function `first(arr)` that returns the first element and the remaining elements as separate values using rest in destructuring.

```js
const [head, tail] = first([10, 20, 30, 40])
// head = 10, tail = [20, 30, 40]
```

### Solution

```js
function first([head, ...tail]) {
  return [head, tail]
}

const [head, tail] = first([10, 20, 30, 40])
console.log(head) // 10
console.log(tail) // [20, 30, 40]
```

---

# 4 — `arguments` Object

## T — TL;DR

`arguments` is an **array-like object** available inside regular functions that contains all passed arguments — but it's outdated and replaced by rest parameters in modern code.

## K — Key Concepts

### Basic Usage

```js
function example() {
  console.log(arguments)        // { 0: "a", 1: "b", 2: "c", length: 3 }
  console.log(arguments[0])     // "a"
  console.log(arguments.length) // 3
}

example("a", "b", "c")
```

### It's NOT a Real Array

```js
function example() {
  arguments.map(x => x) // ❌ TypeError: arguments.map is not a function
}
```

`arguments` has `.length` and numeric indices, but it does **not** have array methods like `.map`, `.filter`, `.reduce`.

### Converting to a Real Array

```js
function example() {
  // Old way
  const args = Array.prototype.slice.call(arguments)

  // Modern ways
  const args2 = Array.from(arguments)
  const args3 = [...arguments]

  return args3
}

example(1, 2, 3) // [1, 2, 3]
```

### Arrow Functions Do NOT Have `arguments`

This is a **critical** difference:

```js
const fn = () => {
  console.log(arguments) // ❌ ReferenceError (or captures outer function's arguments)
}
```

```js
function outer() {
  const inner = () => {
    console.log(arguments) // captures outer's arguments!
  }
  inner()
}

outer(1, 2, 3) // logs Arguments [1, 2, 3] — from outer, not inner
```

### `arguments` and Strict Mode

In **sloppy mode**, `arguments` is linked to named parameters:

```js
function sloppy(a) {
  arguments[0] = 99
  console.log(a) // 99 — mutation leaked!
}
sloppy(1)
```

In **strict mode**, they are independent:

```js
"use strict"
function strict(a) {
  arguments[0] = 99
  console.log(a) // 1 — not affected
}
strict(1)
```

### `arguments` and Default Parameters

When default parameters are used, `arguments` is **always** decoupled from named parameters (behaves like strict mode):

```js
function example(a = 10) {
  arguments[0] = 99
  console.log(a) // NOT affected, even in sloppy mode
}
```

### When You'd Still See `arguments`

- Legacy codebases
- Some function overloading patterns (rare)
- Reading library source code

For **all new code**, use rest parameters instead.

## W — Why It Matters

- You'll encounter `arguments` in legacy code and library internals.
- Understanding why arrow functions lack `arguments` prevents subtle bugs.
- The sloppy/strict mode behavior difference is a classic interview gotcha.
- Knowing the migration path from `arguments` to rest parameters shows modern JS fluency.

## I — Interview Questions with Answers

### Q1: What is the `arguments` object?

**A:** An array-like object available inside regular functions (not arrow functions) that contains all passed arguments. It has `.length` and numeric indices but is not a real array.

### Q2: Why don't arrow functions have `arguments`?

**A:** Arrow functions are designed to be lightweight and lexically bound. They don't have their own `this`, `arguments`, `super`, or `new.target`. If you need all arguments in an arrow function, use rest parameters.

### Q3: How do you convert `arguments` to a real array?

**A:** `Array.from(arguments)`, `[...arguments]`, or the old `Array.prototype.slice.call(arguments)`.

### Q4: What is the problem with `arguments` in sloppy mode?

**A:** In sloppy mode, `arguments` is linked to named parameters — mutating `arguments[0]` also changes the named parameter. This doesn't happen in strict mode or when default parameters are used.

## C — Common Pitfalls with Fix

### Pitfall: Using `arguments` in arrow functions

```js
const fn = () => arguments // ReferenceError or wrong arguments
```

**Fix:** Use rest parameters:

```js
const fn = (...args) => args
```

### Pitfall: Calling array methods on `arguments`

```js
arguments.forEach(x => console.log(x)) // TypeError
```

**Fix:** Convert first: `[...arguments].forEach(x => console.log(x))`.

### Pitfall: Mutating `arguments` and expecting isolation

```js
function fn(a) {
  arguments[0] = 99
  return a // 99 in sloppy mode!
}
```

**Fix:** Use strict mode or rest parameters.

## K — Coding Challenge with Solution

### Challenge

What does this print?

```js
function outer(a, b) {
  const inner = () => {
    console.log(arguments.length)
    console.log(arguments[0])
  }
  inner()
}

outer("hello", "world")
```

### Solution

```js
// arguments.length → 2  (outer's arguments)
// arguments[0] → "hello" (outer's arguments)
```

The arrow function `inner` doesn't have its own `arguments`, so it captures `arguments` from `outer`.

---

# 5 — `Function.prototype.length` & `.name`

## T — TL;DR

Every function has a `.length` (number of expected parameters before the first default/rest) and a `.name` (the function's inferred or declared name).

## K — Key Concepts

### `.length` — Expected Parameter Count

```js
function a(x, y, z) {}
console.log(a.length) // 3

function b(x, y = 10) {}
console.log(b.length) // 1 — default parameter stops counting

function c(x, ...rest) {}
console.log(c.length) // 1 — rest parameter not counted

function d(...args) {}
console.log(d.length) // 0

function e(a, b, c = 1, d) {}
console.log(e.length) // 2 — stops at first default (c)
```

**Rule:** `.length` counts parameters **before** the first one with a default value or rest parameter.

### `.name` — Function Name

```js
// Declaration
function greet() {}
console.log(greet.name) // "greet"

// Expression
const hello = function () {}
console.log(hello.name) // "hello" — inferred from variable

// Named expression
const hi = function sayHi() {}
console.log(hi.name) // "sayHi" — explicit name takes precedence

// Arrow
const add = (a, b) => a + b
console.log(add.name) // "add" — inferred from variable

// Method
const obj = { greet() {} }
console.log(obj.greet.name) // "greet"

// Constructor
class User { constructor() {} }
console.log(User.name) // "User"

// Bound function
function foo() {}
const bar = foo.bind(null)
console.log(bar.name) // "bound foo"

// Dynamic
const fn = new Function("return 1")
console.log(fn.name) // "anonymous"
```

### Practical Uses

**`.length` for overloading patterns:**

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args)
    }
    return (...more) => curried(...args, ...more)
  }
}

// fn.length tells curry how many arguments to wait for
```

**`.name` for debugging and logging:**

```js
function logCall(fn) {
  return function (...args) {
    console.log(`Calling ${fn.name} with`, args)
    return fn(...args)
  }
}
```

## W — Why It Matters

- `.length` is used in **currying**, dependency injection frameworks, and function overloading.
- `.name` appears in stack traces, debugging output, and error messages.
- Libraries like Express and DI containers inspect `.length` to decide behavior.
- Understanding these meta-properties shows deep JS knowledge.

## I — Interview Questions with Answers

### Q1: What does `Function.prototype.length` represent?

**A:** The number of **expected parameters** before the first default or rest parameter. It does not count default parameters, rest parameters, or parameters after the first default.

### Q2: What is `Function.prototype.name`?

**A:** A string representing the function's name. It's either the declared name, the inferred name from the variable/property it's assigned to, or `"anonymous"` / `""` if it can't be determined.

### Q3: Why does `function(a, b = 1, c) {}` have `.length` of 1?

**A:** `.length` counts parameters before the **first** default. `b` has a default, so counting stops at `a` — `.length` is 1, even though `c` has no default.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `.length` to count all parameters

```js
function fn(a, b = 1, c) {}
fn.length // 1, NOT 3
```

**Fix:** Remember: `.length` stops counting at the first default or rest parameter.

### Pitfall: Relying on `.name` for anonymous functions in certain contexts

```js
[1, 2].map(function (x) { return x * 2 })
// The callback's .name is "" in some engines
```

**Fix:** Use named functions when you need reliable `.name` for debugging.

## K — Coding Challenge with Solution

### Challenge

What does each `.length` return?

```js
function a() {}
function b(x) {}
function c(x, y, z) {}
function d(x, y = 1) {}
function e(x = 1, y, z) {}
function f(...args) {}
function g(x, ...args) {}
```

### Solution

```js
a.length // 0
b.length // 1
c.length // 3
d.length // 1 — stops at y's default
e.length // 0 — stops at x's default (the very first param!)
f.length // 0 — rest parameter
g.length // 1 — rest not counted
```

---

# 6 — IIFE (Immediately Invoked Function Expression)

## T — TL;DR

An IIFE is a function that **runs immediately** after it's defined — used to create a private scope without polluting the outer scope.

```js
(function () {
  // private scope
})()
```

## K — Key Concepts

### Basic Syntax

```js
// Classic IIFE with function expression
(function () {
  console.log("runs immediately")
})()

// Arrow function IIFE
(() => {
  console.log("also runs immediately")
})()

// Named IIFE (useful for debugging stack traces)
(function init() {
  console.log("named IIFE")
})()
```

### Why the Parentheses?

Without the wrapping `()`, JavaScript parses `function` as a **declaration**, not an expression:

```js
// ❌ SyntaxError
function () {
  console.log("oops")
}()

// ✅ Wrapping in () forces it to be an expression
(function () {
  console.log("works")
})()
```

Other ways to force an expression (less common):

```js
!function () { console.log("works") }()
void function () { console.log("works") }()
+function () { console.log("works") }()
```

### With Parameters

```js
(function (name, version) {
  console.log(`${name} v${version}`)
})("MyApp", "1.0")
// "MyApp v1.0"
```

### With Return Values

```js
const result = (function () {
  return 42
})()

console.log(result) // 42
```

### Classic Use: Module Pattern (Pre-ESM)

Before ES modules, IIFEs were the primary way to create private scopes:

```js
const counter = (function () {
  let count = 0 // private — not accessible outside

  return {
    increment() { count++ },
    decrement() { count-- },
    getCount() { return count },
  }
})()

counter.increment()
counter.increment()
console.log(counter.getCount()) // 2
// counter.count — undefined (private!)
```

### Classic Use: Loop Variable Capture (Pre-`let`)

```js
// Old fix for var-in-loop problem
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 100)
  })(i)
}
// 0, 1, 2 — each callback captures its own j

// Modern: just use let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
```

### Async IIFE

```js
(async () => {
  const data = await fetch("/api/users")
  const users = await data.json()
  console.log(users)
})()
```

Useful before top-level `await` was available (or in contexts where it's not supported).

### Modern Relevance

IIFEs are less common now because:
- **ES modules** provide scope isolation naturally.
- **`let`/`const`** provide block scoping.
- **Top-level `await`** eliminates the need for async IIFEs.

But they still appear in:
- Legacy code
- Library bundles
- Quick scope isolation in scripts
- Some design patterns

## W — Why It Matters

- IIFEs are foundational to understanding JavaScript's module history.
- The module pattern (IIFE + closures) is the ancestor of modern modules.
- You'll see IIFEs in bundled code, libraries, and older codebases.
- Understanding why IIFEs exist deepens your grasp of scope and closures.

## I — Interview Questions with Answers

### Q1: What is an IIFE?

**A:** An Immediately Invoked Function Expression — a function that's defined and executed in the same statement. It creates a private scope without polluting the outer scope.

### Q2: Why were IIFEs commonly used before ES6?

**A:** Before `let`/`const` (block scoping) and ES modules (scope isolation), IIFEs were the primary way to avoid polluting the global scope and to create private variables.

### Q3: Are IIFEs still relevant?

**A:** Less so, but they still appear in legacy code, library bundles, quick scope isolation, and the async IIFE pattern. Understanding them is important for reading existing codebases.

## C — Common Pitfalls with Fix

### Pitfall: Missing the wrapping parentheses

```js
function() {}() // SyntaxError
```

**Fix:** Wrap in parentheses: `(function() {})()`

### Pitfall: Semicolon issues in concatenated files

```js
// file1.js
const a = 1
// file2.js (starts with IIFE)
(function () {})()
// When concatenated: const a = 1(function () {})() — TypeError!
```

**Fix:** Start IIFEs with a semicolon in scripts that may be concatenated:

```js
;(function () {})()
```

## K — Coding Challenge with Solution

### Challenge

Create a counter module using an IIFE that:
- Has a private `count` variable starting at 0
- Exposes `increment()`, `reset()`, and `getCount()` methods
- Does NOT expose `count` directly

### Solution

```js
const counter = (function () {
  let count = 0

  return {
    increment() { count++ },
    reset() { count = 0 },
    getCount() { return count },
  }
})()

counter.increment()
counter.increment()
counter.increment()
console.log(counter.getCount()) // 3
counter.reset()
console.log(counter.getCount()) // 0
console.log(counter.count)      // undefined — private!
```

---

# 7 — Lexical Scope

## T — TL;DR

Lexical scope means a function's access to variables is determined by **where the function is written** in the source code, not where it's called.

## K — Key Concepts

### Definition

**Lexical scope** (also called **static scope**) means that the scope of a variable is defined by its position in the source code. Inner functions have access to variables declared in their outer functions.

```js
const outer = "I'm outer"

function foo() {
  const inner = "I'm inner"

  function bar() {
    console.log(outer) // ✅ accessible ��� lexically above
    console.log(inner) // ✅ accessible — lexically above
  }

  bar()
}

foo()
```

### The Scope Chain

When JavaScript looks up a variable, it searches:

1. The **current** function scope
2. The **parent** function scope
3. The **grandparent** function scope
4. ... all the way up to the **global** scope

If not found anywhere → `ReferenceError`.

```js
const a = 1           // global scope

function outer() {
  const b = 2         // outer scope

  function middle() {
    const c = 3       // middle scope

    function inner() {
      console.log(a)  // 1 — found in global
      console.log(b)  // 2 — found in outer
      console.log(c)  // 3 — found in middle
      console.log(d)  // ReferenceError — not found anywhere
    }

    inner()
  }

  middle()
}

outer()
```

### Lexical vs Dynamic Scope

JavaScript uses **lexical** scope. Some languages (like old Bash) use **dynamic** scope.

```js
const x = 10

function foo() {
  console.log(x) // always 10 — lexical scope looks at where foo is WRITTEN
}

function bar() {
  const x = 20
  foo() // still prints 10, NOT 20
}

bar()
```

In dynamic scope, `foo()` would print 20 because it would look at the **caller's** scope. JavaScript doesn't do this.

### Lexical Scope and Arrow Functions

Arrow functions follow lexical scope for both variables AND `this`:

```js
function Timer() {
  this.seconds = 0

  // Arrow function — `this` is lexically bound to Timer instance
  setInterval(() => {
    this.seconds++ // `this` comes from Timer, not from setInterval
  }, 1000)
}
```

### Scope Is Determined at Write Time, Not Call Time

```js
function createGreeter(greeting) {
  // This function "remembers" greeting from its lexical scope
  return function (name) {
    return `${greeting}, ${name}!`
  }
}

const hello = createGreeter("Hello")
const hi = createGreeter("Hi")

hello("Mark") // "Hello, Mark!" — greeting = "Hello" from creation
hi("Mark")    // "Hi, Mark!" — greeting = "Hi" from creation
```

This is the **foundation of closures** (covered fully on Day 3).

## W — Why It Matters

- Lexical scope is the **foundation** of closures, modules, and data privacy.
- Understanding scope chains explains how variable lookup works and why some variables are "not defined."
- It's why arrow functions capture `this` correctly in callbacks.
- The scope chain is how JavaScript engines optimize variable access.

## I — Interview Questions with Answers

### Q1: What is lexical scope?

**A:** Lexical scope means a function's variable access is determined by **where it's defined** in the source code, not where it's called. Inner functions can access variables from outer functions based on their nesting position.

### Q2: What is the scope chain?

**A:** The chain of nested scopes that JavaScript traverses when looking up a variable. It starts from the current scope and walks up through parent scopes to the global scope. If the variable isn't found, a `ReferenceError` is thrown.

### Q3: Does JavaScript use lexical or dynamic scope?

**A:** **Lexical** scope. Variable lookup is based on the physical nesting of functions in the source code, not the call stack at runtime.

## C — Common Pitfalls with Fix

### Pitfall: Expecting dynamic scoping behavior

```js
const x = 1
function logX() { console.log(x) }

function wrapper() {
  const x = 2
  logX() // 1, not 2!
}
wrapper()
```

**Fix:** Remember JavaScript uses **lexical** scope. `logX` sees `x = 1` because that's what's in its lexical environment.

### Pitfall: Variable shadowing confusion

```js
const x = "global"

function fn() {
  const x = "local" // shadows the global x
  console.log(x)    // "local"
}

fn()
console.log(x) // "global" — unaffected
```

**Fix:** Be aware that inner variables can **shadow** outer ones. The outer variable still exists; it's just hidden in the inner scope.

## K — Coding Challenge with Solution

### Challenge

What does this print?

```js
const x = "global"

function a() {
  const x = "a"

  function b() {
    console.log(x)
  }

  return b
}

function c() {
  const x = "c"
  const bFn = a()
  bFn()
}

c()
```

### Solution

```
"a"
```

Explanation: `b` is defined inside `a`, so it lexically sees `x = "a"`. It doesn't matter that `bFn()` is **called** inside `c` where `x = "c"`. Lexical scope = where it's **written**, not where it's **called**.

---

# 8 — Block, Function & Global Scope

## T — TL;DR

JavaScript has three scope levels: **global** (accessible everywhere), **function** (created by each function), and **block** (created by `{ }` with `let`/`const`).

## K — Key Concepts

### Global Scope

Variables declared outside any function or block are in the global scope:

```js
var globalVar = "I'm global"
let globalLet = "I'm also global"
const globalConst = "Me too"

function fn() {
  console.log(globalVar)   // accessible
  console.log(globalLet)   // accessible
  console.log(globalConst) // accessible
}
```

In browsers:
- `var` at the top level attaches to `window`
- `let`/`const` do NOT attach to `window`

```js
var a = 1
let b = 2

console.log(window.a) // 1
console.log(window.b) // undefined
```

In Node.js, top-level `var` does NOT attach to `global` (each file is a module).

### Function Scope

Each function creates its own scope. Variables declared inside are **not accessible** outside:

```js
function example() {
  var x = 1
  let y = 2
  const z = 3
}

// console.log(x) // ReferenceError
// console.log(y) // ReferenceError
// console.log(z) // ReferenceError
```

### Block Scope

`let` and `const` are scoped to the nearest `{ }` block:

```js
{
  let a = 1
  const b = 2
  var c = 3
}

// console.log(a) // ReferenceError — block-scoped
// console.log(b) // ReferenceError — block-scoped
console.log(c)    // 3 — var ignores block scope!
```

Blocks are created by:
- `if` / `else`
- `for` / `while` / `do...while`
- `switch`
- Standalone `{ }`
- `try` / `catch` / `finally`

```js
if (true) {
  let x = 10
}
// console.log(x) // ReferenceError

for (let i = 0; i < 3; i++) {}
// console.log(i) // ReferenceError
```

### `var` Is Function-Scoped, Not Block-Scoped

This is the key behavioral difference:

```js
function example() {
  if (true) {
    var x = 1  // function-scoped — visible throughout example()
    let y = 2  // block-scoped — only visible inside the if block
  }

  console.log(x) // 1
  // console.log(y) // ReferenceError
}
```

### Scope and `for` Loops

```js
// var — one shared variable across all iterations
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 3, 3, 3

// let — new binding per iteration
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 0, 1, 2
```

### Nested Scopes

Scopes can be nested to any depth:

```js
function outer() {        // scope 1
  const a = 1

  if (true) {             // scope 2
    const b = 2

    for (let i = 0; i < 1; i++) { // scope 3
      const c = 3
      console.log(a, b, c) // 1, 2, 3 — all accessible
    }
  }

  // console.log(b) // ReferenceError — b is in scope 2
}
```

### The Scope Summary Table

| Keyword | Global | Function | Block |
|---------|--------|----------|-------|
| `var` | ✅ | ✅ (contained) | ❌ (escapes) |
| `let` | ✅ | ✅ (contained) | ✅ (contained) |
| `const` | ✅ | ✅ (contained) | ✅ (contained) |
| `function` declaration | ✅ | ✅ | Varies (sloppy vs strict) |

## W — Why It Matters

- Understanding scope prevents variable leaking and unexpected behavior.
- The `var` + block scope bug is one of the most common legacy JS issues.
- `let` in `for` loops is **essential** for correct async behavior.
- Scope is the foundation for closures, modules, and data encapsulation.

## I — Interview Questions with Answers

### Q1: What are the three types of scope in JavaScript?

**A:** Global scope (accessible everywhere), function scope (created by functions), and block scope (created by `{ }` with `let`/`const`).

### Q2: Why does `var` not respect block scope?

**A:** `var` was designed before block scope existed in JavaScript. It's scoped to the nearest **function**, not the nearest block. `let` and `const` (ES6) were introduced to provide block scoping.

### Q3: Does `var` at the top level attach to `window`?

**A:** In browsers, yes. In Node.js, no — each file is a module with its own scope. `let` and `const` never attach to `window` even in browsers.

## C — Common Pitfalls with Fix

### Pitfall: `var` leaking out of blocks

```js
if (true) { var leaked = "oops" }
console.log(leaked) // "oops"
```

**Fix:** Use `let` or `const`.

### Pitfall: Polluting global scope

```js
// Forgetting var/let/const in sloppy mode
function fn() {
  oops = "global" // creates a global variable!
}
fn()
console.log(oops) // "global"
```

**Fix:** Always use `let`/`const`, and enable strict mode.

### Pitfall: Assuming function declarations are block-scoped

In **sloppy mode**, function declarations inside blocks have inconsistent behavior across engines:

```js
if (true) {
  function fn() { return "a" }
}
// fn() — may or may not work depending on engine and mode
```

**Fix:** Use strict mode, or use function expressions assigned to `let`/`const`.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` output?

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

  console.log(a)
  console.log(b)
  console.log(a2)
  console.log(typeof b2)
}

test()
console.log(a)
console.log(b)
```

### Solution

```js
// Inside test():
console.log(a)          // "function" — function-scoped var
console.log(b)          // "function" — function-scoped let
console.log(a2)         // "block-var" — var escapes block
console.log(typeof b2)  // "undefined" — b2 is block-scoped, not accessible

// Outside test():
console.log(a)          // "global" — outer a is unaffected
console.log(b)          // "global" — outer b is unaffected
```

---

# 9 — Hoisting

## T — TL;DR

Hoisting is JavaScript's behavior of moving **declarations** (not initializations) to the top of their scope during compilation — `var` and function declarations are hoisted usably, while `let`/`const` are hoisted but remain inaccessible until their declaration line (TDZ).

## K — Key Concepts

### What Is Hoisting?

JavaScript processes code in two passes:
1. **Compilation** — declarations are registered in their scope.
2. **Execution** — code runs line by line.

This makes declarations "visible" throughout their scope, even before the line they appear on.

### `var` Hoisting

`var` declarations are hoisted and **initialized to `undefined`**:

```js
console.log(x) // undefined — hoisted, initialized to undefined
var x = 5
console.log(x) // 5

// What the engine effectively does:
// var x = undefined  ← hoisted
// console.log(x)     // undefined
// x = 5              ← assignment stays in place
// console.log(x)     // 5
```

### `let`/`const` Hoisting

They **are** hoisted (the engine knows about them), but they're NOT initialized. They sit in the **Temporal Dead Zone** until the declaration line:

```js
// console.log(y) // ReferenceError: Cannot access 'y' before initialization
let y = 10
console.log(y) // 10
```

More on TDZ in the next topic.

### Function Declaration Hoisting

Function declarations are **fully hoisted** — both the name and the body:

```js
greet() // "Hello!" — works before declaration

function greet() {
  console.log("Hello!")
}
```

This is the **only** kind of hoisting where you can use the value before the declaration line.

### Function Expression Hoisting

Only the **variable** is hoisted, not the function:

```js
// With var:
console.log(fn) // undefined — var is hoisted
fn()            // TypeError: fn is not a function

var fn = function () { return "hi" }

// With const/let:
// console.log(fn) // ReferenceError — TDZ
const fn2 = function () { return "hi" }
```

### Class Hoisting

Classes are hoisted like `let`/`const` — they exist in the TDZ:

```js
// const obj = new MyClass() // ReferenceError
class MyClass {}
const obj = new MyClass() // ✅ works after declaration
```

### Hoisting Order / Priority

When there are conflicts, **function declarations** take priority over `var`:

```js
console.log(typeof foo) // "function"

var foo = "string"
function foo() {}

console.log(typeof foo) // "string" — assignment overwrites
```

Effective order:
1. Function `foo` is hoisted (fully)
2. `var foo` is hoisted (but doesn't overwrite the function since it's already declared)
3. Execution: `foo = "string"` runs, overwriting the function

### Multiple `var` Declarations

```js
var x = 1
var x = 2
console.log(x) // 2 — var allows redeclaration
```

### Hoisting Summary

| Declaration | Hoisted? | Initialized? | Usable before declaration? |
|-------------|----------|-------------|---------------------------|
| `var` | ✅ | ✅ to `undefined` | ✅ (as `undefined`) |
| `let` | ✅ | ❌ (TDZ) | ❌ ReferenceError |
| `const` | ✅ | ❌ (TDZ) | ❌ ReferenceError |
| `function` declaration | ✅ | ✅ (fully) | ✅ |
| `function` expression | Variable only | Depends on `var`/`let`/`const` | ❌ as a function |
| `class` | ✅ | ❌ (TDZ) | ❌ ReferenceError |

## W — Why It Matters

- Hoisting explains why some code works "before" declarations and some doesn't.
- Understanding var hoisting explains many legacy JS bugs.
- Function declaration hoisting is why you can organize code with declarations at the bottom.
- This is one of the most common interview topics — tested indirectly through "what does this print?" questions.

## I — Interview Questions with Answers

### Q1: What is hoisting?

**A:** JavaScript's behavior of processing declarations during compilation before executing code. Declarations are made available in their scope before the code runs, but the behavior varies: `var` is initialized to `undefined`, function declarations are fully available, and `let`/`const`/`class` are in the Temporal Dead Zone until their declaration line.

### Q2: Are `let` and `const` hoisted?

**A:** Yes, they are hoisted (the engine registers them in the scope), but they are **not initialized**. Accessing them before the declaration throws a `ReferenceError` because they're in the Temporal Dead Zone.

### Q3: What is the difference between hoisting of function declarations and function expressions?

**A:** Function declarations are fully hoisted — both the name and the body are available before the declaration line. Function expressions only hoist the **variable** (depending on `var`/`let`/`const`), not the function value.

### Q4: What does this print?

```js
var a = 1
function a() {}
console.log(typeof a)
```

**A:** `"number"`. The function declaration is hoisted first, then `var a` is hoisted (but doesn't overwrite since `a` already exists). During execution, `a = 1` runs, overwriting the function.

## C — Common Pitfalls with Fix

### Pitfall: Relying on `var` hoisting as a feature

```js
console.log(x) // undefined — not an error, but confusing
var x = 5
```

**Fix:** Always declare variables at the top of their scope, or use `let`/`const`.

### Pitfall: Thinking function expressions are hoisted like declarations

```js
greet() // TypeError (var) or ReferenceError (const/let)
var greet = function () { return "hi" }
```

**Fix:** Use a function declaration if you need hoisting, or define expressions before use.

### Pitfall: Conflicting function and variable declarations

```js
console.log(foo) // function foo() {} — not "undefined"!
var foo = "bar"
function foo() {}
```

**Fix:** Avoid naming conflicts between functions and variables. Use `let`/`const` to get TDZ protection.

## K — Coding Challenge with Solution

### Challenge

What does this print, line by line?

```js
console.log(a)
console.log(b)
console.log(c)

var a = 1
let b = 2

function c() {
  return 3
}
```

### Solution

```js
console.log(a)  // undefined — var is hoisted, initialized to undefined
console.log(b)  // ReferenceError — let is in TDZ (execution stops here)

// If we could continue:
console.log(c)  // [Function: c] — function declaration is fully hoisted
```

Only `console.log(a)` and the `ReferenceError` on `b` are observed.

---

# 10 — Temporal Dead Zone (TDZ)

## T — TL;DR

The Temporal Dead Zone is the period between entering a scope and the actual `let`/`const` declaration line — accessing the variable during this period throws a `ReferenceError`.

## K — Key Concepts

### What Is the TDZ?

When a scope is entered, `let` and `const` variables are **hoisted** (the engine knows they exist), but they are **not initialized**. The space from the start of the scope to the declaration is called the **Temporal Dead Zone**.

```js
{
  // TDZ for `x` starts here
  // console.log(x) // ReferenceError: Cannot access 'x' before initialization
  // ...all of this area is the TDZ for x...
  let x = 10 // TDZ ends here — x is now initialized
  console.log(x) // 10 ✅
}
```

### TDZ Is Per-Variable

```js
{
  // TDZ for `a` starts
  // TDZ for `b` starts

  let a = 1 // TDZ for `a` ends
  console.log(a) // 1 ✅

  // console.log(b) // ReferenceError — still in TDZ for b!

  let b = 2 // TDZ for `b` ends
  console.log(b) // 2 ✅
}
```

### TDZ vs `var`'s `undefined`

```js
// var — no TDZ, initialized to undefined
console.log(x) // undefined
var x = 1

// let — TDZ, throws error
// console.log(y) // ReferenceError
let y = 2
```

The TDZ exists to **catch bugs** — using a variable before it's declared is almost always a mistake. `var`'s silent `undefined` hid these bugs for years.

### TDZ in `for` Loops

```js
for (let i = 0; i < 3; i++) {
  // i is NOT in TDZ here — each iteration creates a fresh binding
  console.log(i)
}
```

But:

```js
// console.log(i) // ReferenceError — i's scope is the for loop
```

### TDZ with `typeof`

`typeof` on an **undeclared** variable returns `"undefined"`:

```js
console.log(typeof neverDeclared) // "undefined" — no error
```

But `typeof` on a TDZ variable **still throws**:

```js
// console.log(typeof x) // ReferenceError!
let x = 1
```

This is a key difference — TDZ variables are "declared but not initialized," which is different from "not declared at all."

### TDZ in Default Parameters

```js
// ❌ ReferenceError — b is in TDZ when a's default is evaluated
function broken(a = b, b = 1) {
  return [a, b]
}

// ✅ Works — a is already initialized when b's default is evaluated
function works(a = 1, b = a) {
  return [a, b]
}
```

### TDZ in Class Declarations

```js
// const obj = new MyClass() // ReferenceError — TDZ
class MyClass {}
const obj = new MyClass() // ✅
```

### TDZ with `const` — Must Initialize

```js
const x // SyntaxError: Missing initializer in const declaration
```

`const` must be initialized at declaration. `let` can be declared without initialization (defaults to `undefined` after TDZ ends):

```js
let x    // valid — x is undefined after this line
const y  // SyntaxError
```

## W — Why It Matters

- The TDZ is JavaScript's way of catching "use before declaration" bugs at runtime.
- Understanding TDZ explains why some `ReferenceError` messages say "Cannot access before initialization" instead of "is not defined."
- The TDZ in default parameters is a subtle interview gotcha.
- It reinforces the discipline of declaring variables before use.

## I — Interview Questions with Answers

### Q1: What is the Temporal Dead Zone?

**A:** The period from the start of a scope to the actual `let`/`const` declaration, during which the variable exists but cannot be accessed. Accessing it throws a `ReferenceError`.

### Q2: Why does the TDZ exist?

**A:** To catch bugs. Using a variable before it's declared is almost always a mistake. `var`'s behavior of silently returning `undefined` hid these bugs. The TDZ makes them explicit errors.

### Q3: Does `typeof` protect you from TDZ errors?

**A:** No. `typeof undeclaredVar` returns `"undefined"` safely, but `typeof tdzVar` (a `let`/`const` in the TDZ) still throws a `ReferenceError`.

### Q4: What is the difference between "is not defined" and "cannot access before initialization"?

**A:**
- `"x is not defined"` → `x` was **never declared** in any accessible scope.
- `"Cannot access 'x' before initialization"` → `x` IS declared with `let`/`const`, but you're accessing it in the **TDZ** before the declaration line.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `typeof` to work on TDZ variables

```js
if (typeof x === "undefined") {} // ReferenceError if x is let/const in TDZ
let x = 1
```

**Fix:** Declare variables before checking them, or use `try`/`catch` for edge cases.

### Pitfall: Using a variable from a parent scope that's been shadowed

```js
let x = 1

function fn() {
  // console.log(x) // ReferenceError — x is shadowed by the let below, and we're in TDZ
  let x = 2
  console.log(x) // 2
}
```

**Fix:** Be aware that `let x` inside a block shadows the outer `x` from the start of the block, not from the line of declaration.

### Pitfall: Default parameters referencing later parameters

```js
function fn(a = b, b = 1) {} // ReferenceError — b is in TDZ
```

**Fix:** Only reference parameters that come **before** the current one.

## K — Coding Challenge with Solution

### Challenge

Which lines throw an error?

```js
console.log(typeof undeclared) // Line 1
console.log(typeof blocked)   // Line 2
let blocked = "hello"
console.log(blocked)           // Line 3
```

### Solution

```js
console.log(typeof undeclared) // "undefined" — undeclared variables don't throw with typeof ✅
console.log(typeof blocked)   // ReferenceError — blocked is in TDZ ❌
let blocked = "hello"
console.log(blocked)           // Never reached
```

Line 1 is fine. Line 2 throws. Line 3 never executes.

---

# 11 — Strict Mode

## T — TL;DR

Strict mode (`"use strict"`) makes JavaScript throw errors for unsafe actions that would otherwise fail silently — it catches bugs early and makes code more predictable.

## K — Key Concepts

### Enabling Strict Mode

```js
// For an entire script (must be the FIRST statement)
"use strict"

// For a single function
function example() {
  "use strict"
  // strict mode only inside this function
}
```

**Important:** ES modules (`import`/`export`) and `class` bodies are **always** in strict mode automatically.

### What Strict Mode Changes

#### 1. No Accidental Globals

```js
"use strict"
x = 10 // ReferenceError: x is not defined

// Without strict mode: silently creates a global variable
```

#### 2. Assignment to Read-Only Properties Throws

```js
"use strict"
const obj = Object.freeze({ name: "Mark" })
obj.name = "Alex" // TypeError: Cannot assign to read only property

undefined = 1 // TypeError
NaN = 2       // TypeError
```

#### 3. Deleting Undeletable Properties Throws

```js
"use strict"
delete Object.prototype // TypeError
```

#### 4. Duplicate Parameter Names Are Forbidden

```js
"use strict"
function fn(a, a) {} // SyntaxError: Duplicate parameter name

// Without strict mode: silently allows it (last one wins)
```

#### 5. Octal Literals Are Forbidden

```js
"use strict"
const x = 010 // SyntaxError

// Use 0o10 instead for octal
const y = 0o10 // 8
```

#### 6. `this` Is `undefined` (Not `window`) in Standalone Functions

```js
"use strict"
function fn() {
  console.log(this) // undefined
}
fn()

// Without strict mode: `this` would be window/globalThis
```

This is **critical** for understanding `this` behavior in Day 3.

#### 7. `arguments` Decoupled from Parameters

```js
"use strict"
function fn(a) {
  arguments[0] = 99
  console.log(a) // original value — NOT 99
}
```

#### 8. `eval` Has Its Own Scope

```js
"use strict"
eval("var x = 10")
// console.log(x) // ReferenceError — x doesn't leak out of eval
```

#### 9. `with` Statement Is Forbidden

```js
"use strict"
with (obj) {} // SyntaxError
```

#### 10. Reserved Words Are Protected

```js
"use strict"
let implements = 1   // SyntaxError
let interface = 2    // SyntaxError
let private = 3      // SyntaxError
```

### Should You Always Use Strict Mode?

**Yes.** In practice:
- ES modules are always strict.
- Classes are always strict.
- Most modern code is in modules, so you're already in strict mode.
- If writing scripts, add `"use strict"` at the top.

## W — Why It Matters

- Strict mode catches real bugs that sloppy mode hides (accidental globals, silent failures).
- Understanding strict mode's `this = undefined` behavior is prerequisite for Day 3's `this` deep dive.
- It's the default in all modern code (modules, classes).
- Interviewers test strict mode differences — especially `this` behavior and accidental globals.

## I — Interview Questions with Answers

### Q1: What does strict mode do?

**A:** It makes JavaScript throw errors for unsafe or ambiguous code that would otherwise fail silently. This includes accidental globals, assignments to read-only properties, duplicate parameters, and more.

### Q2: How do you enable strict mode?

**A:** Add `"use strict"` as the first statement in a script or function. ES modules and class bodies are strict mode by default.

### Q3: What is `this` inside a regular function in strict mode?

**A:** `undefined`. In sloppy mode, it would be the global object (`window`/`globalThis`).

### Q4: Are ES modules in strict mode?

**A:** Yes, always. You don't need to add `"use strict"` in module files.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting that `this` is `undefined` in strict mode

```js
"use strict"
function greet() {
  console.log(this.name) // TypeError: Cannot read properties of undefined
}
greet()
```

**Fix:** Use `.call()`, `.bind()`, or call the function as a method of an object.

### Pitfall: Not knowing modules are always strict

```js
// In an ES module (file with import/export):
x = 10 // ReferenceError — strict mode is automatic
```

**Fix:** Always declare variables with `let`/`const`.

### Pitfall: Placing `"use strict"` after other code

```js
const x = 1
"use strict" // has NO effect — must be the FIRST statement
```

**Fix:** Always put `"use strict"` at the very top of the file or function.

## K — Coding Challenge with Solution

### Challenge

What does each scenario output? (Assume browser environment)

```js
// Scenario 1 (sloppy mode)
function sloppy() {
  console.log(this)
}
sloppy()

// Scenario 2 (strict mode)
"use strict"
function strict() {
  console.log(this)
}
strict()

// Scenario 3
"use strict"
function create() {
  x = 10
}
create()
```

### Solution

```js
// Scenario 1
sloppy() // window (or globalThis) — sloppy mode default

// Scenario 2
strict() // undefined — strict mode changes this to undefined

// Scenario 3
create() // ReferenceError: x is not defined — strict mode prevents accidental globals
```

---

# 12 — Scope → Closure Mental Model (Bridge to Day 3)

## T — TL;DR

A **closure** is a function that remembers the variables from its lexical scope even after the outer function has returned — it's the natural consequence of lexical scope + first-class functions.

## K — Key Concepts

### The Mental Model

You already know:
1. **Lexical scope** — functions access variables based on where they're written.
2. **Functions are values** — they can be returned, passed, and stored.

Combine these two facts and you get **closures**:

```js
function createCounter() {
  let count = 0 // private variable

  return function () {
    count++
    return count
  }
}

const counter = createCounter()
// createCounter has finished executing, but...

console.log(counter()) // 1 — count is still alive!
console.log(counter()) // 2
console.log(counter()) // 3
```

### Why Does `count` Survive?

When `createCounter` runs:
1. It creates a scope with `count = 0`.
2. It returns an **inner function** that references `count`.
3. `createCounter` finishes, but the returned function still holds a **reference** to that scope.
4. The garbage collector sees that the scope is still referenced, so it keeps it alive.

The inner function "closes over" the variables in its lexical scope — hence **closure**.

### The Scope Chain Visualization

```
Global Scope
  └── createCounter Scope { count: 0 }
        └── inner function (returned) — has access to count
```

Even after `createCounter` pops off the call stack, the inner function's reference to `count` keeps `createCounter`'s scope alive.

### Every Function Is a Closure

Technically, **every function** in JavaScript is a closure because every function closes over its lexical scope:

```js
const name = "Mark"

function greet() {
  console.log(name) // closes over the global scope
}
```

But we typically say "closure" when a function **retains access** to an outer scope's variables **after** that scope would normally be garbage collected.

### Preview: Closure Patterns (Day 3)

```js
// Data privacy
function createUser(name) {
  return {
    getName() { return name },
    // name is private — only accessible through getName
  }
}

// Function factories
function multiply(a) {
  return (b) => a * b
}
const double = multiply(2)
const triple = multiply(3)
double(5) // 10
triple(5) // 15

// Event handlers (React pattern)
function handleClick(id) {
  return () => {
    console.log(`Clicked item ${id}`)
  }
}
```

### The Connection: Scope → Closure → Everything Else

```
Day 2: Scope (lexical, block, function, hoisting, TDZ)
  ↓
Day 3: Closures (scope + first-class functions)
  ↓
Day 3: `this` (different binding rules)
  ↓
Day 3: Prototypes & Classes (inheritance chains)
  ↓
Day 5: Async (closures in callbacks and promises)
  ↓
Day 6: Memory (closure-based memory leaks)
```

Everything builds on what you learned today.

## W — Why It Matters

- Closures are **the most important** concept in JavaScript — they power React hooks, event handlers, module patterns, memoization, and more.
- Understanding the scope → closure connection makes Day 3 much easier.
- Interviewers test closures constantly because they reveal deep understanding.
- Once you understand closures, you understand **why** JavaScript works the way it does.

## I — Interview Questions with Answers

### Q1: What is a closure?

**A:** A closure is a function that retains access to variables from its lexical scope even after the outer function has returned. It "closes over" the variables in its environment.

### Q2: How does a closure work?

**A:** When a function is created, it captures a reference to its lexical environment (the scope chain). If the function is returned or stored, it keeps that reference alive, preventing garbage collection of the closed-over variables.

### Q3: Why are closures useful?

**A:** Data privacy (encapsulating state), function factories, callbacks that remember context, memoization, and module patterns. In React, hooks like `useState` and `useEffect` rely on closures.

### Q4: Give a simple closure example.

```js
function outer() {
  let x = 0
  return () => ++x
}

const fn = outer()
fn() // 1
fn() // 2 — x persists because of the closure
```

## C — Common Pitfalls with Fix

### Pitfall: Closures in loops with `var`

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 3, 3, 3 — all closures share the same i
```

**Fix:** Use `let` (creates new binding per iteration):

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 0, 1, 2
```

### Pitfall: Not realizing closures retain references, not values

```js
function create() {
  let x = 1
  const get = () => x
  x = 2
  return get
}

create()() // 2, not 1 — closure holds a reference to x, not a snapshot
```

**Fix:** Understand that closures capture **live references**. If you need a snapshot, copy the value.

### Pitfall: Memory leaks from forgotten closures (Preview — Day 6)

Closures keep their entire scope alive. If a closure holds a reference to a large object, that object won't be garbage collected.

**Fix:** Set references to `null` when done, or use `WeakRef` (Day 6).

## K — Coding Challenge with Solution

### Challenge

Create a function `makeAdder(x)` that returns a function which adds `x` to any number passed to it.

```js
const add5 = makeAdder(5)
const add10 = makeAdder(10)

console.log(add5(3))   // 8
console.log(add10(3))  // 13
console.log(add5(100)) // 105
```

### Solution

```js
function makeAdder(x) {
  return (y) => x + y
}

const add5 = makeAdder(5)
const add10 = makeAdder(10)

console.log(add5(3))   // 8 — x is 5 (closed over), y is 3
console.log(add10(3))  // 13 — x is 10 (closed over), y is 3
console.log(add5(100)) // 105
```

Each call to `makeAdder` creates a **new closure** with its own `x`.

---

# ✅ Day 2 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Function Declarations vs Expressions vs Arrow Functions | ✅ T-KWICK |
| 2 | Default Parameters | ✅ T-KWICK |
| 3 | Rest Parameters | ✅ T-KWICK |
| 4 | `arguments` Object | ✅ T-KWICK |
| 5 | `Function.prototype.length` & `.name` | ✅ T-KWICK |
| 6 | IIFE | ✅ T-KWICK |
| 7 | Lexical Scope | ✅ T-KWICK |
| 8 | Block, Function & Global Scope | ✅ T-KWICK |
| 9 | Hoisting | ✅ T-KWICK |
| 10 | Temporal Dead Zone (TDZ) | ✅ T-KWICK |
| 11 | Strict Mode | ✅ T-KWICK |
| 12 | Scope → Closure Mental Model (Bridge to Day 3) | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 2` | 5 interview-style problems covering all 12 topics |
| `Generate Day 3` | Full lesson — Closures, `this`, Prototypes & Metaprogramming |
| `next topic` | Start Day 3's first subtopic |
| `recap` | Quick Day 2 summary |

> Doing one small thing beats opening a feed.