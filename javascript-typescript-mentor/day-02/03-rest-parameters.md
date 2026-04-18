# 3 — Rest Parameters

## T — TL;DR

Rest parameters (`...args`) collect all remaining arguments into a **real array**.

```js
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3); // 6
```

## K — Key Concepts

### Basic Syntax

```js
function log(first, ...rest) {
  console.log("First:", first);
  console.log("Rest:", rest);
}

log("a", "b", "c", "d");
// First: "a"
// Rest: ["b", "c", "d"]
```

### Rules

1. **Must be the last parameter.**

```js
function valid(a, b, ...rest) {} // ✅
// function invalid(a, ...rest, b) {} // ❌ SyntaxError
```

2. **Only one rest parameter per function.**

```js
// function bad(...a, ...b) {} // �� SyntaxError
```

3. **Rest is a real `Array`** — unlike `arguments`.

```js
function example(...args) {
  console.log(Array.isArray(args)); // true
  console.log(args.map); // [Function: map] — full array methods
}
```

### Rest vs Spread

They look the same (`...`) but do opposite things:

```js
// REST — collects into an array (in parameters or destructuring)
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

// SPREAD — expands an array (in arguments or literals)
const nums = [1, 2, 3];
sum(...nums); // same as sum(1, 2, 3)
```

| Context                   | `...` is | Action                        |
| ------------------------- | -------- | ----------------------------- |
| Function parameter        | Rest     | Collects arguments into array |
| Function call             | Spread   | Expands array into arguments  |
| Array literal `[...a]`    | Spread   | Copies/combines arrays        |
| Object literal `{...a}`   | Spread   | Copies/combines objects       |
| Destructuring `[a, ...b]` | Rest     | Collects remaining into array |

### Rest in Destructuring

```js
const [first, second, ...remaining] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(second); // 2
console.log(remaining); // [3, 4, 5]

const { name, ...otherProps } = { name: "Mark", age: 30, role: "dev" };
console.log(name); // "Mark"
console.log(otherProps); // { age: 30, role: "dev" }
```

### Rest with Arrow Functions

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
```

This is the arrow function replacement for `arguments`.

### Rest Collects Nothing When No Extra Args

```js
function example(a, ...rest) {
  console.log(rest);
}

example(1); // rest = [] (empty array, not undefined)
```

### Practical Patterns

```js
// Wrapper/decorator that passes all args through
function withLogging(fn) {
  return function (...args) {
    console.log("Calling with:", args);
    return fn(...args); // spread to forward
  };
}

// Variadic functions
function max(...values) {
  return Math.max(...values);
}

// Type-safe event handler collection
function on(event, ...handlers) {
  handlers.forEach((handler) => addEventListener(event, handler));
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
function example(...args) {
  // REST: collecting
  return Math.max(...args); // SPREAD: expanding
}
```

**Fix:** Remember: rest = collecting, spread = expanding. Same syntax, different position.

### Pitfall: Forgetting rest gives an array when empty

```js
function f(a, ...rest) {
  if (rest) {
    /* this always runs — [] is truthy */
  }
}
```

**Fix:** Check `.length`:

```js
if (rest.length > 0) {
  /* has extra args */
}
```

## K — Coding Challenge with Solution

### Challenge

```js
function describe(action, ...items) {
  return `${action}: ${items.join(", ")}`;
}

console.log(describe("Buy", "milk", "eggs", "bread"));
console.log(describe("Sell"));

const [head, ...tail] = [10, 20, 30, 40];
console.log(head);
console.log(tail);

const { x, ...rest } = { x: 1, y: 2, z: 3 };
console.log(x);
console.log(rest);
```

### Solution

```js
describe("Buy", "milk", "eggs", "bread"); // "Buy: milk, eggs, bread"
describe("Sell"); // "Sell: "

head; // 10
tail; // [20, 30, 40]

x; // 1
rest; // { y: 2, z: 3 }
```

---
