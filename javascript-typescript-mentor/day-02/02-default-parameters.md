# 2 — Default Parameters

## T — TL;DR

Default parameters let you set fallback values for function arguments when they are `undefined` (or not passed).

```js
function greet(name = "World") {
  return `Hello, ${name}!`;
}

greet(); // "Hello, World!"
greet("Mark"); // "Hello, Mark!"
```

## K — Key Concepts

### Basic Syntax

```js
function createUser(name = "Anonymous", role = "viewer") {
  return { name, role };
}

createUser(); // { name: "Anonymous", role: "viewer" }
createUser("Mark"); // { name: "Mark", role: "viewer" }
createUser("Mark", "admin"); // { name: "Mark", role: "admin" }
```

### Only Triggers on `undefined`

Default parameters activate when the argument is `undefined` — NOT for other falsy values.

```js
function example(x = 10) {
  return x;
}

example(undefined); // 10 — default triggers
example(null); // null — default does NOT trigger
example(0); // 0
example(""); // ""
example(false); // false
```

This is different from `||` which triggers on all falsy values, and matches the behavior of `??`.

### Expressions as Defaults

Defaults can be any expression — they are evaluated **at call time**, not at definition time.

```js
function getTimestamp(date = new Date()) {
  return date.toISOString();
}

// Each call gets a fresh Date
getTimestamp(); // "2026-04-18T..."
```

### Defaults Can Reference Earlier Parameters

Parameters are evaluated left to right, so later defaults can use earlier parameters:

```js
function createRange(start, end = start + 10) {
  return { start, end };
}

createRange(5); // { start: 5, end: 15 }
createRange(5, 20); // { start: 5, end: 20 }
```

But earlier parameters **cannot** reference later ones:

```js
function broken(a = b, b = 1) {
  return [a, b];
}
broken(); // ReferenceError: Cannot access 'b' before initialization
```

### Default with Destructuring

```js
function configure({ host = "localhost", port = 3000 } = {}) {
  return `${host}:${port}`;
}

configure(); // "localhost:3000"
configure({ port: 8080 }); // "localhost:8080"
configure({ host: "api.com" }); // "api.com:3000"
```

The `= {}` at the end means even calling `configure()` with no arguments works (it destructures an empty object).

### Functions as Defaults

```js
function fetchData(url, parser = JSON.parse) {
  const raw = getRawData(url);
  return parser(raw);
}
```

### Default Parameters and `arguments`

Default parameters do **not** affect the `arguments` object in sloppy mode (and `arguments` should be avoided anyway):

```js
function example(x = 10) {
  console.log(arguments.length);
  console.log(arguments[0]);
  console.log(x);
}

example(); // arguments.length = 0, arguments[0] = undefined, x = 10
example(5); // arguments.length = 1, arguments[0] = 5, x = 5
```

### The Old Pattern (Before ES6)

```js
// Old way — buggy with falsy values
function greet(name) {
  name = name || "World"; // fails for "", 0, false
  return `Hello, ${name}!`;
}

// Modern way — correct
function greet(name = "World") {
  return `Hello, ${name}!`;
}
```

## W — Why It Matters

- Cleaner than manual `undefined` checks or `||` fallbacks.
- Correct behavior with falsy values (`0`, `""`, `false` are preserved).
- Used everywhere: config objects, API wrappers, component props.
- Combined with destructuring, it's the standard for options patterns.
- Interview questions test whether defaults trigger on `null` vs `undefined`.

## I — Interview Questions with Answers

### Q1: When do default parameters activate?

**A:** When the argument is `undefined` — either explicitly passed as `undefined` or not passed at all. They do NOT activate for `null`, `0`, `""`, `false`, or any other falsy value.

### Q2: Are default values evaluated at definition time or call time?

**A:** **Call time**. Each invocation evaluates the default expression fresh. This is why `new Date()` as a default gives a different result each call.

### Q3: Can a default parameter reference another parameter?

**A:** Yes, but only **earlier** parameters (left to right). Later parameters are not yet initialized.

### Q4: What is the `= {}` pattern in destructured parameters?

**A:** It provides an empty object as the default so the function can be called with no arguments without throwing. Example: `function f({ a = 1 } = {})`.

## C — Common Pitfalls with Fix

### Pitfall: Expecting default to trigger on `null`

```js
function greet(name = "World") {
  return name;
}
greet(null); // null — not "World"
```

**Fix:** If you need to handle `null`, use `??` inside the body:

```js
function greet(name) {
  const n = name ?? "World";
  return n;
}
```

### Pitfall: Referencing a later parameter

```js
function f(a = b, b = 1) {}
f(); // ReferenceError
```

**Fix:** Only reference parameters defined to the left.

### Pitfall: Forgetting `= {}` with destructured params

```js
function f({ a = 1 }) {}
f(); // TypeError: Cannot destructure property 'a' of undefined
```

**Fix:** Add `= {}`:

```js
function f({ a = 1 } = {}) {}
f(); // works — a = 1
```

### Pitfall: Using `||` instead of default parameters

```js
function setPort(port) {
  port = port || 3000; // overwrites valid 0
}
```

**Fix:** Use default parameter or `??`:

```js
function setPort(port = 3000) {} // correct
```

## K — Coding Challenge with Solution

### Challenge

```js
function createConfig(host = "localhost", port = 8080, secure = false) {
  return `${secure ? "https" : "http"}://${host}:${port}`;
}

console.log(createConfig());
console.log(createConfig("api.com"));
console.log(createConfig("api.com", undefined, true));
console.log(createConfig("api.com", null, true));
```

### Solution

```js
createConfig();
// "http://localhost:8080"

createConfig("api.com");
// "http://api.com:8080"

createConfig("api.com", undefined, true);
// "https://api.com:8080" — undefined triggers default for port

createConfig("api.com", null, true);
// "https://api.com:null" — null does NOT trigger default
```

---
