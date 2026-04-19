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
