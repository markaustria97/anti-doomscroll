# 8 — `Object.hasOwn` & `Array.fromAsync`

## T — TL;DR

`Object.hasOwn` is the modern, safe replacement for `hasOwnProperty`; `Array.fromAsync` converts async iterables to arrays — both are newer APIs that fix long-standing ergonomic issues.

## K — Key Concepts

### `Object.hasOwn` (ES2022)

Replaces `Object.prototype.hasOwnProperty.call()`:

```js
const obj = { name: "Mark" }

// Old ways:
obj.hasOwnProperty("name")                          // true — but can be overridden
Object.prototype.hasOwnProperty.call(obj, "name")   // true — verbose but safe

// Modern way:
Object.hasOwn(obj, "name")     // true ✅
Object.hasOwn(obj, "toString") // false — inherited, not own
```

### Why `Object.hasOwn` Is Better

```js
// Problem 1: hasOwnProperty can be overridden
const obj = { hasOwnProperty: () => false }
obj.hasOwnProperty("hasOwnProperty") // false — wrong!
Object.hasOwn(obj, "hasOwnProperty") // true ✅

// Problem 2: Object.create(null) has no hasOwnProperty
const dict = Object.create(null)
dict.key = "value"
// dict.hasOwnProperty("key") // TypeError!
Object.hasOwn(dict, "key")    // true ✅
```

### `Array.fromAsync` (ES2024)

Like `Array.from` but for async iterables:

```js
// From an async generator
async function* asyncGen() {
  yield 1
  yield 2
  yield 3
}

const arr = await Array.fromAsync(asyncGen())
// [1, 2, 3]

// From an array of Promises
const arr2 = await Array.fromAsync([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
])
// [1, 2, 3]

// With a mapping function
const arr3 = await Array.fromAsync(asyncGen(), x => x * 2)
// [2, 4, 6]
```

### Before `Array.fromAsync`

```js
// You had to do this:
const items = []
for await (const item of asyncIterable) {
  items.push(item)
}
```

Now: `const items = await Array.fromAsync(asyncIterable)`.

## W — Why It Matters

- `Object.hasOwn` is the **recommended** replacement for all `hasOwnProperty` usage.
- It works with `Object.create(null)` — which `hasOwnProperty` doesn't.
- `Array.fromAsync` simplifies the extremely common pattern of collecting async iteration results.
- Both show up in modern codebases and are expected knowledge for current-year JS.

## I — Interview Questions with Answers

### Q1: Why use `Object.hasOwn` over `hasOwnProperty`?

**A:** `Object.hasOwn` is (1) safe with `Object.create(null)` objects (which lack `hasOwnProperty`), (2) can't be overridden on the instance, and (3) is shorter and more readable than `Object.prototype.hasOwnProperty.call()`.

### Q2: What does `Array.fromAsync` do?

**A:** Converts an async iterable (or an iterable of Promises) into a regular array. It's the async version of `Array.from`. It accepts an optional mapping function.

## C — Common Pitfalls with Fix

### Pitfall: Using `in` instead of `hasOwn` when you want own-property check

```js
"toString" in {}              // true — inherited!
Object.hasOwn({}, "toString") // false — own only ✅
```

**Fix:** Use `Object.hasOwn` for own-property checks, `in` for all properties (own + inherited).

### Pitfall: `Array.fromAsync` not available in older environments

```js
Array.fromAsync // undefined in older Node.js versions
```

**Fix:** Check Node.js ≥ 22, or use the `for await` pattern as fallback.

## K — Coding Challenge with Solution

### Challenge

Write a function `ownEntries(obj)` that returns only own-property entries (like `Object.entries` but explicitly using `Object.hasOwn`):

### Solution

```js
function ownEntries(obj) {
  const entries = []
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      entries.push([key, obj[key]])
    }
  }
  return entries
}

const parent = { inherited: true }
const child = Object.create(parent)
child.own = "yes"

ownEntries(child)         // [["own", "yes"]]
Object.entries(child)     // [["own", "yes"]] — same here, but ownEntries is explicit
```

Note: `Object.entries` already only returns own enumerable properties — but understanding WHY (and building it yourself) is the learning point.

---
