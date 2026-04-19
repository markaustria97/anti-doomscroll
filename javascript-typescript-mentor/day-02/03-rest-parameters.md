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
