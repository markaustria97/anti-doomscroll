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
