# 7 — Destructuring

## T — TL;DR

Destructuring lets you **extract values** from arrays and objects into distinct variables using pattern-matching syntax — it makes code shorter, clearer, and avoids repetitive property access.

## K — Key Concepts

### Object Destructuring

```js
const user = { name: "Mark", age: 30, role: "dev" }

// Basic
const { name, age } = user
console.log(name) // "Mark"
console.log(age)  // 30

// Renaming
const { name: fullName, role: jobTitle } = user
console.log(fullName)  // "Mark"
console.log(jobTitle)  // "dev"

// Default values
const { name: n, email = "none" } = user
console.log(email) // "none" — not present on user

// Rest (collect remaining properties)
const { name: userName, ...rest } = user
console.log(rest) // { age: 30, role: "dev" }
```

### Array Destructuring

```js
const [a, b, c] = [1, 2, 3]
console.log(a, b, c) // 1 2 3

// Skip elements
const [first, , third] = [10, 20, 30]
console.log(first, third) // 10 30

// Rest
const [head, ...tail] = [1, 2, 3, 4, 5]
console.log(head) // 1
console.log(tail) // [2, 3, 4, 5]

// Default values
const [x = 0, y = 0, z = 0] = [1, 2]
console.log(x, y, z) // 1 2 0

// Swap variables (no temp needed!)
let m = 1, n = 2;
[m, n] = [n, m]
console.log(m, n) // 2 1
```

### Nested Destructuring

```js
const data = {
  user: {
    name: "Mark",
    address: {
      city: "Manila",
      country: "PH",
    },
  },
}

const {
  user: {
    name,
    address: { city },
  },
} = data

console.log(name) // "Mark"
console.log(city) // "Manila"

// Mixed array + object
const {
  results: [firstResult],
} = { results: [{ id: 1 }, { id: 2 }] }
console.log(firstResult) // { id: 1 }
```

### Function Parameter Destructuring

```js
// Object params
function createUser({ name, age, role = "user" }) {
  return { name, age, role }
}
createUser({ name: "Mark", age: 30 }) // { name: "Mark", age: 30, role: "user" }

// With defaults for the whole object
function greet({ name = "World" } = {}) {
  return `Hello, ${name}!`
}
greet()              // "Hello, World!"
greet({ name: "Mark" }) // "Hello, Mark!"

// Array params
function first([head]) {
  return head
}
first([1, 2, 3]) // 1
```

### Computed Property Names in Destructuring

```js
const key = "name"
const { [key]: value } = { name: "Mark" }
console.log(value) // "Mark"
```

### Destructuring in Loops

```js
const users = [
  { name: "Mark", age: 30 },
  { name: "Alex", age: 25 },
]

for (const { name, age } of users) {
  console.log(`${name} is ${age}`)
}
// "Mark is 30"
// "Alex is 25"

// With Map entries
const map = new Map([["a", 1], ["b", 2]])
for (const [key, value] of map) {
  console.log(key, value)
}
```

## W — Why It Matters

- Destructuring is used on **every line** of modern React code (props, state, hooks).
- Function parameter destructuring makes APIs self-documenting.
- Nested destructuring eliminates chains of property access.
- The variable swap trick is a clean one-liner.
- Interview questions test nested destructuring and default values.

## I — Interview Questions with Answers

### Q1: What happens if you destructure a property that doesn't exist?

**A:** You get `undefined`, unless you provide a default value.

### Q2: Can you rename and provide a default at the same time?

**A:** Yes: `const { name: fullName = "Anonymous" } = obj`. If `name` is `undefined`, `fullName` gets the default.

### Q3: What triggers the default in destructuring?

**A:** Only `undefined`. **Not** `null`, `0`, `""`, or `false`.

```js
const { a = 10 } = { a: null }
console.log(a) // null — NOT 10
```

## C — Common Pitfalls with Fix

### Pitfall: Destructuring `null` or `undefined` throws

```js
const { name } = null // TypeError: Cannot destructure property 'name' of null
```

**Fix:** Guard with defaults: `const { name } = data ?? {}` or use optional chaining before destructuring.

### Pitfall: Confusing rename and default syntax

```js
const { name: n = "default" } = {}
// n is "default" — rename TO n, with default "default"
```

**Fix:** Read left to right: `originalKey: newName = defaultValue`.

### Pitfall: Defaults only apply for `undefined`, not `null`

```js
const { x = 10 } = { x: null }
console.log(x) // null!
```

**Fix:** If `null` should trigger the default, use `??` after: `const x = obj.x ?? 10`.

## K — Coding Challenge with Solution

### Challenge

Write a function `pick(obj, keys)` using destructuring and computed properties:

```js
pick({ name: "Mark", age: 30, role: "dev" }, ["name", "role"])
// { name: "Mark", role: "dev" }
```

### Solution

```js
function pick(obj, keys) {
  return Object.fromEntries(
    keys.filter(key => key in obj).map(key => [key, obj[key]])
  )
}

// Alternative using destructuring in reduce:
function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) result[key] = obj[key]
    return result
  }, {})
}

pick({ name: "Mark", age: 30, role: "dev" }, ["name", "role"])
// { name: "Mark", role: "dev" }
```

---
