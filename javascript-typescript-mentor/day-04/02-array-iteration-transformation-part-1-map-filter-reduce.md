# 2 — Array Iteration & Transformation (Part 1): `map`, `filter`, `reduce`

## T — TL;DR

`map` transforms every element, `filter` selects elements by condition, `reduce` accumulates elements into a single value — these three methods are the backbone of functional-style array processing in JavaScript.

## K — Key Concepts

### `map` — Transform Every Element

Returns a **new array** of the same length with each element transformed:

```js
const nums = [1, 2, 3, 4]

nums.map(x => x * 2)           // [2, 4, 6, 8]
nums.map(x => x.toString())    // ["1", "2", "3", "4"]
nums.map((val, index) => ({ index, val }))
// [{ index: 0, val: 1 }, { index: 1, val: 2 }, ...]
```

**`map` does NOT mutate** the original array:

```js
const original = [1, 2, 3]
const doubled = original.map(x => x * 2)
console.log(original) // [1, 2, 3] — unchanged
console.log(doubled)  // [2, 4, 6]
```

### `filter` — Select Elements by Condition

Returns a **new array** with only elements that pass the test:

```js
const nums = [1, 2, 3, 4, 5, 6]

nums.filter(x => x % 2 === 0) // [2, 4, 6] — even numbers
nums.filter(x => x > 3)        // [4, 5, 6]
nums.filter(Boolean)            // removes falsy values

// Remove falsy values
const mixed = [0, "hello", "", null, undefined, 42, false, "world"]
mixed.filter(Boolean) // ["hello", 42, "world"]

// Filter objects
const users = [
  { name: "Mark", active: true },
  { name: "Alex", active: false },
  { name: "Jane", active: true },
]
users.filter(u => u.active) // [{ name: "Mark", ... }, { name: "Jane", ... }]
```

### `reduce` — Accumulate into a Single Value

The most powerful (and most misused) array method:

```js
array.reduce((accumulator, currentValue, index, array) => {
  // return new accumulator
}, initialValue)
```

**Sum:**

```js
[1, 2, 3, 4].reduce((sum, n) => sum + n, 0) // 10
```

**Max:**

```js
[3, 1, 4, 1, 5].reduce((max, n) => Math.max(max, n), -Infinity) // 5
```

**Group by:**

```js
const people = [
  { name: "Mark", role: "dev" },
  { name: "Alex", role: "design" },
  { name: "Jane", role: "dev" },
]

people.reduce((groups, person) => {
  const key = person.role
  groups[key] ??= []
  groups[key].push(person)
  return groups
}, {})
// { dev: [{name: "Mark",...}, {name: "Jane",...}], design: [{name: "Alex",...}] }
```

**Flatten (before `.flat()` existed):**

```js
[[1, 2], [3, 4], [5]].reduce((flat, arr) => [...flat, ...arr], [])
// [1, 2, 3, 4, 5]
```

**Count occurrences:**

```js
const letters = ["a", "b", "a", "c", "b", "a"]

letters.reduce((counts, letter) => {
  counts[letter] = (counts[letter] ?? 0) + 1
  return counts
}, {})
// { a: 3, b: 2, c: 1 }
```

### Chaining

```js
const users = [
  { name: "Mark", age: 30, active: true },
  { name: "Alex", age: 25, active: false },
  { name: "Jane", age: 35, active: true },
  { name: "Bob", age: 20, active: true },
]

const result = users
  .filter(u => u.active)           // keep active users
  .map(u => u.name)                // extract names
  .filter(name => name.length > 3) // names longer than 3 chars
// ["Mark", "Jane"]
```

### Callback Signature

All three methods receive: `(element, index, array)`

```js
["a", "b", "c"].map((element, index, array) => {
  console.log(element, index, array)
  return element.toUpperCase()
})
// "a" 0 ["a", "b", "c"]
// "b" 1 ["a", "b", "c"]
// "c" 2 ["a", "b", "c"]
// → ["A", "B", "C"]
```

## W — Why It Matters

- `map`/`filter`/`reduce` are the foundation of functional programming in JS.
- React rendering is built on `.map()` for list components.
- Data transformation pipelines use these methods constantly.
- `reduce` is the most versatile — it can implement `map`, `filter`, `groupBy`, and more.
- Interview questions frequently test chaining and `reduce` implementations.

## I — Interview Questions with Answers

### Q1: What is the difference between `map` and `forEach`?

**A:** `map` returns a **new array** with transformed elements. `forEach` returns `undefined` — it's for side effects only. Always use `map` when you need the result.

### Q2: Can you implement `map` using `reduce`?

**A:** Yes:

```js
function myMap(arr, fn) {
  return arr.reduce((result, item, index) => {
    result.push(fn(item, index, arr))
    return result
  }, [])
}
```

### Q3: What happens if you don't provide an initial value to `reduce`?

**A:** The first element becomes the initial accumulator, and iteration starts from the second element. If the array is empty, it throws a `TypeError`. **Always provide an initial value.**

### Q4: Do `map` and `filter` mutate the original array?

**A:** No. They return new arrays. The original is unchanged.

## C — Common Pitfalls with Fix

### Pitfall: Using `map` for side effects (should use `forEach`)

```js
// ❌ Bad — map returns a new array you're ignoring
users.map(u => console.log(u.name))

// ✅ Good — forEach is for side effects
users.forEach(u => console.log(u.name))
```

**Fix:** Use `map` when you need the result, `forEach` when you don't.

### Pitfall: Forgetting the initial value in `reduce`

```js
[].reduce((sum, n) => sum + n) // TypeError: Reduce of empty array with no initial value
```

**Fix:** Always provide an initial value: `.reduce(fn, 0)` or `.reduce(fn, [])`.

### Pitfall: Accidentally returning `undefined` from `map`

```js
[1, 2, 3].map(x => {
  x * 2 // missing return!
})
// [undefined, undefined, undefined]
```

**Fix:** Use arrow shorthand `x => x * 2` or add an explicit `return`.

### Pitfall: Overusing `reduce` when simpler methods exist

```js
// ❌ Overly complex
arr.reduce((result, x) => x > 5 ? [...result, x] : result, [])

// ✅ Simple
arr.filter(x => x > 5)
```

**Fix:** Use the simplest method that fits. Reserve `reduce` for accumulation patterns that other methods can't handle cleanly.

## K — Coding Challenge with Solution

### Challenge

Given an array of transactions, calculate the **total balance** for each `category`:

```js
const transactions = [
  { category: "food", amount: 50 },
  { category: "transport", amount: 30 },
  { category: "food", amount: 20 },
  { category: "entertainment", amount: 100 },
  { category: "transport", amount: 15 },
]

// Expected: { food: 70, transport: 45, entertainment: 100 }
```

### Solution

```js
const totals = transactions.reduce((acc, { category, amount }) => {
  acc[category] = (acc[category] ?? 0) + amount
  return acc
}, {})

console.log(totals) // { food: 70, transport: 45, entertainment: 100 }
```

---
