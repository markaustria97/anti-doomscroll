# 2 — Call Stack

## T — TL;DR

The call stack is a LIFO (Last In, First Out) data structure that tracks **which function is currently executing** and what to return to when it finishes.

## K — Key Concepts

### How the Stack Works

```js
function third() {
  console.log("third")
}

function second() {
  third()
  console.log("second")
}

function first() {
  second()
  console.log("first")
}

first()
```

Stack evolution:

```
Step 1: [first]
Step 2: [first, second]
Step 3: [first, second, third]
Step 4: [first, second]         ← third() returns
Step 5: [first]                 ← second() returns
Step 6: []                      ← first() returns
```

Output:

```
third
second
first
```

### Stack Overflow

The stack has a **maximum size**. Exceeding it throws `RangeError`:

```js
function infinite() {
  infinite() // no base case → stack never unwinds
}
infinite() // RangeError: Maximum call stack size exceeded
```

Typical stack limit: ~10,000–25,000 frames (varies by engine).

### Stack Traces

When an error occurs, the engine captures the current state of the call stack:

```js
function a() { b() }
function b() { c() }
function c() { throw new Error("oops") }

a()
// Error: oops
//   at c (file.js:3)
//   at b (file.js:2)
//   at a (file.js:1)
```

This is why named functions produce better stack traces than anonymous ones.

### The Stack and Async

The call stack only handles **synchronous** execution. When an async operation completes, its callback is placed in a queue and executed when the stack is **empty**:

```js
function main() {
  console.log("start")
  setTimeout(() => console.log("async"), 0)
  console.log("end")
}
main()

// Stack: [main] → logs "start"
// setTimeout → Web API handles it, callback queued
// Stack: [main] → logs "end"
// Stack: [] → empty → event loop picks up callback
// Stack: [callback] → logs "async"
```

### Blocked Stack = Frozen UI

```js
function heavyComputation() {
  let sum = 0
  for (let i = 0; i < 1e10; i++) sum += i
  return sum
}

// While this runs, the call stack is occupied:
// - No event handling
// - No rendering
// - No setTimeout callbacks
// - UI is completely frozen
heavyComputation()
```

## W — Why It Matters

- The call stack is the execution model of JavaScript — understanding it is prerequisite for debugging.
- Stack traces are your primary tool for debugging errors.
- Stack overflow from infinite recursion is a common bug.
- Blocking the stack blocks everything — this is why we use async.
- React rendering, event handling, and animations all depend on a free call stack.

## I — Interview Questions with Answers

### Q1: What is the call stack?

**A:** A LIFO data structure that tracks function execution. When a function is called, it's pushed onto the stack. When it returns, it's popped off. The event loop only processes queued tasks when the stack is empty.

### Q2: What causes a stack overflow?

**A:** Recursion without a base case (or with a base case that's never reached). Each recursive call adds a frame; eventually the stack limit is exceeded, throwing a `RangeError`.

### Q3: Why does blocking the call stack freeze the browser?

**A:** The browser uses the same thread for JS execution, DOM rendering, and event handling. If the call stack is occupied by a long synchronous operation, nothing else can be processed.

## C — Common Pitfalls with Fix

### Pitfall: Infinite recursion

```js
function fib(n) {
  return fib(n - 1) + fib(n - 2) // missing base case!
}
```

**Fix:** Always have a base case:

```js
function fib(n) {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}
```

### Pitfall: Anonymous functions produce poor stack traces

```js
setTimeout(function () {
  throw new Error("oops")
}, 0)
// Stack trace shows "anonymous"
```

**Fix:** Name your functions: `setTimeout(function handleTimeout() { ... })`.

## K — Coding Challenge with Solution

### Challenge

What is the output and why?

```js
function a() {
  console.log("a start")
  b()
  console.log("a end")
}

function b() {
  console.log("b start")
  setTimeout(() => console.log("b timeout"), 0)
  console.log("b end")
}

a()
console.log("main end")
```

### Solution

```
a start
b start
b end
a end
main end
b timeout
```

The call stack processes all synchronous code first (`a` → `b` → back to `a` → main). Only after the stack is empty does the event loop pick up the `setTimeout` callback.

---
