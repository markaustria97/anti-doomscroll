# 6 — IIFE (Immediately Invoked Function Expression)

## T — TL;DR

An IIFE is a function that **runs as soon as it's defined**. It creates a private scope.

```js
(function () {
  console.log("I run immediately!");
})();
```

## K — Key Concepts

### Syntax Variants

```js
// Parenthesized function expression — most common
(function () {
  console.log("IIFE 1");
})()(
  // Alternative wrapping
  (function () {
    console.log("IIFE 2");
  })()
)(
  // Arrow IIFE
  () => {
    console.log("IIFE 3");
  }
)()(
  // Named IIFE
  function setup() {
    console.log("IIFE 4");
  }
)()(
  // With arguments
  function (name) {
    console.log(`Hello, ${name}!`);
  }
)("Mark");

// Using void, !, +, ~ (seen in minified code)
void (function () {
  console.log("IIFE 5");
})();
!(function () {
  console.log("IIFE 6");
})();
```

### Why the Parentheses?

Without them, the parser sees `function` at the start of a statement and expects a **declaration**, which requires a name and can't be immediately invoked.

```js
// SyntaxError:
// function() { }()

// Wrapping in () forces it to be parsed as an expression:
(function () {})();
```

### The Core Purpose: Private Scope

Before `let`/`const` and modules, `var` was function-scoped and there was no block scope or module system. IIFEs were the **only way** to create private variables.

```js
// Without IIFE — pollutes global scope
var count = 0;
function increment() {
  count++;
}

// With IIFE — encapsulated
const counter = (function () {
  var count = 0; // private
  return {
    increment() {
      count++;
    },
    getCount() {
      return count;
    },
  };
})();

counter.increment();
counter.increment();
counter.getCount(); // 2
// count is not accessible from outside
```

### The Module Pattern (Pre-ES Modules)

```js
const UserModule = (function () {
  // Private
  const users = [];

  function validate(user) {
    return user.name && user.email;
  }

  // Public API
  return {
    add(user) {
      if (validate(user)) {
        users.push(user);
        return true;
      }
      return false;
    },
    getAll() {
      return [...users]; // return copy
    },
    count() {
      return users.length;
    },
  };
})();

UserModule.add({ name: "Mark", email: "mark@example.com" });
UserModule.count(); // 1
// UserModule.users    — undefined (private)
// UserModule.validate — undefined (private)
```

### Fixing the Classic `var` Loop Problem

```js
// Bug: all callbacks share the same `i`
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100);
}
// Prints: 3, 3, 3

// Fix with IIFE — each iteration gets its own copy
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j);
    }, 100);
  })(i);
}
// Prints: 0, 1, 2

// Modern fix — just use let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 0, 1, 2
```

### Async IIFE

```js
(async () => {
  const data = await fetch("/api/users");
  const users = await data.json();
  console.log(users);
})();
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
const x = 1(function () {
  console.log("oops");
})();
// Interpreted as: const x = 1(function...); — TypeError!
```

**Fix:** Start with `;` or ensure the previous line ends with `;`:

```js
const x = 1;
(function () {
  console.log("safe");
})();
```

### Pitfall: Thinking IIFEs are the modern way to scope

**Fix:** Use `let`/`const` + blocks or ES modules. IIFEs are a legacy pattern.

### Pitfall: Forgetting the invocation `()`

```js
const result = function () {
  return 42;
}; // result is the function, not 42
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
  let count = 0;

  return {
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    value() {
      return count;
    },
  };
})();

counter.increment();
counter.increment();
counter.increment();
counter.decrement();
console.log(counter.value()); // 2
// console.log(count)        // ReferenceError — private
```

---
