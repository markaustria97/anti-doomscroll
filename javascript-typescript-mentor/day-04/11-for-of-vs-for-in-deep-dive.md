# 11 — `for...of` vs `for...in` (Deep Dive)

## T — TL;DR

`for...of` iterates over **values** of iterables (arrays, strings, Maps, Sets); `for...in` iterates over **enumerable string keys** of objects (including inherited ones) — using the wrong one is a common source of bugs.

## K — Key Concepts

### `for...of` — Values of Iterables

```js
// Arrays
for (const value of [10, 20, 30]) {
  console.log(value) // 10, 20, 30
}

// Strings
for (const char of "hello") {
  console.log(char) // "h", "e", "l", "l", "o"
}

// Maps
for (const [key, value] of new Map([["a", 1], ["b", 2]])) {
  console.log(key, value) // "a" 1, "b" 2
}

// Sets
for (const value of new Set([1, 2, 3])) {
  console.log(value) // 1, 2, 3
}

// Generators
function* nums() { yield 1; yield 2; yield 3 }
for (const n of nums()) {
  console.log(n) // 1, 2, 3
}
```

`for...of` works on anything with a `Symbol.iterator` method.

**Does NOT work on plain objects:**

```js
// for (const value of { a: 1 }) {} // TypeError: {a: 1} is not iterable

// To iterate objects, convert first:
for (const [key, value] of Object.entries({ a: 1, b: 2 })) {
  console.log(key, value) // "a" 1, "b" 2
}
```

### `for...in` — Enumerable String Keys

```js
const obj = { name: "Mark", age: 30 }

for (const key in obj) {
  console.log(key)      // "name", "age"
  console.log(obj[key]) // "Mark", 30
}
```

**Includes inherited enumerable properties:**

```js
const parent = { inherited: true }
const child = Object.create(parent)
child.own = true

for (const key in child) {
  console.log(key) // "own", "inherited" — includes inherited!
}

// Filter to own properties:
for (const key in child) {
  if (Object.hasOwn(child, key)) {
    console.log(key) // "own" only
  }
}
```

### Why NOT to Use `for...in` on Arrays

```js
const arr = [10, 20, 30]

for (const key in arr) {
  console.log(typeof key) // "string" — keys are "0", "1", "2", not numbers!
  console.log(key)        // "0", "1", "2"
}

// Gets worse with prototype pollution:
Array.prototype.customMethod = function () {}

for (const key in arr) {
  console.log(key) // "0", "1", "2", "customMethod" — inherited!
}
```

**Always use `for...of` for arrays.**

### Comparison Table

| Feature | `for...of` | `for...in` |
|---------|-----------|-----------|
| Iterates | **Values** | **Keys** (strings) |
| Works on | Iterables (arrays, strings, Map, Set, generators) | Any object |
| Includes inherited? | N/A | Yes — enumerable inherited properties |
| Key type | N/A | Always string |
| Use for arrays? | ✅ Yes | ❌ No |
| Use for objects? | ❌ Not directly | ✅ Yes (with `hasOwn` guard) |
| Supports `break`/`continue`? | ✅ | ✅ |

### `break` and `continue` Work in Both

```js
for (const value of [1, 2, 3, 4, 5]) {
  if (value === 3) break
  console.log(value) // 1, 2
}

for (const value of [1, 2, 3, 4, 5]) {
  if (value % 2 === 0) continue
  console.log(value) // 1, 3, 5
}
```

### Modern Alternatives for Objects

Instead of `for...in`, prefer:

```js
const obj = { a: 1, b: 2, c: 3 }

// Object.keys — own enumerable keys
Object.keys(obj).forEach(key => console.log(key))

// Object.entries — own enumerable [key, value] pairs
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value)
}

// Object.values — own enumerable values
for (const value of Object.values(obj)) {
  console.log(value)
}
```

These are safer because they only return **own** enumerable properties.

## W — Why It Matters

- Using `for...in` on arrays is one of the most common JavaScript bugs.
- `for...of` is the clean, modern way to iterate any iterable.
- Understanding the difference prevents prototype pollution bugs.
- This distinction is a frequent interview question.

## I — Interview Questions with Answers

### Q1: What is the difference between `for...of` and `for...in`?

**A:** `for...of` iterates over **values** of iterables. `for...in` iterates over **enumerable string keys** of any object (including inherited properties). Use `for...of` for arrays/strings/Maps/Sets, and `Object.entries` for objects.

### Q2: Why shouldn't you use `for...in` on arrays?

**A:** Because it iterates over string keys (not values), includes inherited enumerable properties, and doesn't guarantee order in all edge cases. Use `for...of` instead.

### Q3: How do you iterate over a plain object?

**A:** Use `Object.entries(obj)` with `for...of`, or `Object.keys(obj)` with `forEach`. Avoid `for...in` unless you specifically need inherited properties (and filter with `Object.hasOwn`).

## C — Common Pitfalls with Fix

### Pitfall: Using `for...in` on arrays

```js
for (const i in [10, 20, 30]) {
  console.log(typeof i) // "string"!
}
```

**Fix:** `for (const value of [10, 20, 30])`.

### Pitfall: Using `for...of` on plain objects

```js
for (const value of { a: 1 }) {} // TypeError
```

**Fix:** `for (const [key, value] of Object.entries({ a: 1 }))`.

## K — Coding Challenge with Solution

### Challenge

What does each loop print?

```js
const data = [10, 20, 30]
data.custom = "extra"

// Loop 1
for (const x of data) console.log(x)

// Loop 2
for (const x in data) console.log(x)
```

### Solution

```js
// Loop 1 (for...of — values of iterable)
10
20
30
// "custom" is NOT printed — for...of iterates array values only

// Loop 2 (for...in — enumerable string keys)
"0"
"1"
"2"
"custom"
// "custom" IS printed — for...in includes all enumerable properties
```

---
