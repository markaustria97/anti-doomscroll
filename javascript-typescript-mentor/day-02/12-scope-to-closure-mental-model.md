# 12 — Scope → Closure Mental Model (Bridge to Day 3)

## T — TL;DR

A **closure** is a function that **remembers the variables from the scope where it was created**, even after that scope has finished executing.

If you understand **lexical scope** + **functions as values**, you already understand closures — you just need the name.

```js
function makeCounter() {
  let count = 0; // this variable lives on after makeCounter returns
  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3
```

## K — Key Concepts

### The Mental Model — Three Steps

**Step 1: Functions carry their scope backpack.**

When a function is created, it gets a hidden reference to the variables in its enclosing scope. This reference is the closure.

```js
function outer() {
  const secret = "hidden";

  function inner() {
    return secret; // inner "closes over" secret
  }

  return inner;
}
```

**Step 2: The scope outlives the function call.**

Normally, when `outer()` finishes, its local variables would be garbage collected. But if an inner function references them and is still alive, those variables survive.

```js
const fn = outer(); // outer() is done, but `secret` lives on
fn(); // "hidden" — still accessible
```

**Step 3: Each call creates a fresh scope.**

```js
const counter1 = makeCounter();
const counter2 = makeCounter();

counter1(); // 1
counter1(); // 2
counter2(); // 1 — independent scope, own `count`
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
  const message = "clicked!";
  button.addEventListener("click", function () {
    console.log(message); // closure over message
  });
}

// Array methods
function multiplyAll(arr, factor) {
  return arr.map((x) => x * factor); // closure over factor
}

// setTimeout
function delayedGreet(name) {
  setTimeout(() => {
    console.log(`Hello, ${name}!`); // closure over name
  }, 1000);
}

// Module pattern (IIFE + closure)
const module = (function () {
  let private = 0;
  return {
    increment() {
      private++;
    },
    get() {
      return private;
    },
  };
})();
```

### What Gets Closed Over

A closure captures the **variable itself** (the binding), not the **value at the time of creation**:

```js
function example() {
  let x = 1;
  const getter = () => x;
  x = 2;
  return getter;
}

example()(); // 2 — not 1! The closure captures the variable x, not the value 1
```

This is critical for understanding the `var` loop bug:

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 3, 3, 3 — all closures share the same `i` variable

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2 — each iteration creates a new `i` binding
```

### Closure + Scope Chain = Access to Outer Variables

```js
function a() {
  const x = 1;
  function b() {
    const y = 2;
    function c() {
      console.log(x + y); // c closes over b's y and a's x
    }
    return c;
  }
  return b;
}

a()()(); // 3
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
    return x + y;
  };
}

const add5 = makeAdder(5);
console.log(add5(3));
```

**A:** `8`. `add5` is a closure that remembers `x = 5` from the `makeAdder(5)` call. When called with `3`, it returns `5 + 3 = 8`.

### Q3: Do closures capture values or references?

**A:** **References** (the variable binding itself). If the closed-over variable changes later, the closure sees the updated value.

### Q4: Why does the `var` loop + `setTimeout` print the same number?

**A:** Because `var` is function-scoped, all callbacks close over the **same `i`** variable. By the time the callbacks run, the loop has finished and `i` has its final value. With `let`, each iteration creates a new binding, so each callback has its own `i`.

## C — Common Pitfalls with Fix

### Pitfall: Thinking closures capture values, not variables

```js
let x = "initial";
const fn = () => x;
x = "changed";
fn(); // "changed" — not "initial"
```

**Fix:** Remember closures capture the **variable** (binding), not a snapshot of its value.

### Pitfall: Closure + `var` in loops

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 3, 3, 3
```

**Fix:** Use `let`, or create a new scope per iteration (IIFE or helper function).

### Pitfall: Accidental memory retention

Closures keep references alive, which can prevent garbage collection:

```js
function createHandler() {
  const hugeData = new Array(1000000).fill("x");
  return function () {
    // even if this function never uses hugeData,
    // some engines may keep it alive because it's in scope
    console.log("handler called");
  };
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
const holder = createSecretHolder("abc");
holder.getSecret(); // "abc"
holder.setSecret("xyz");
holder.getSecret(); // "xyz"
// holder.secret      // undefined — not directly accessible
```

### Solution

```js
function createSecretHolder(secret) {
  // `secret` is a closure variable — private
  return {
    getSecret() {
      return secret;
    },
    setSecret(newSecret) {
      secret = newSecret;
    },
  };
}

const holder = createSecretHolder("abc");
console.log(holder.getSecret()); // "abc"
holder.setSecret("xyz");
console.log(holder.getSecret()); // "xyz"
console.log(holder.secret); // undefined — secret is not a property
```

**How it works:** `secret` lives in the closure scope of `createSecretHolder`. The returned object's methods are closures that access `secret`, but nothing outside can reach it directly.

---
