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
