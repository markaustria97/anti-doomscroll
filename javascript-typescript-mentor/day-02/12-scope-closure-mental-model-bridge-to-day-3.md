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
