# 8 — Logical Assignment Operators (`??=`, `&&=`, `||=`)

## T — TL;DR

ES2021 introduced three logical assignment operators that combine logical operators with assignment:

| Operator | Meaning | Assigns when |
|----------|---------|--------------|
| `x ??= y` | `x = x ?? y` | `x` is `null` or `undefined` |
| `x \|\|= y` | `x = x \|\| y` | `x` is falsy |
| `x &&= y` | `x = x && y` | `x` is truthy |

## K — Key Concepts

### `??=` — Nullish Coalescing Assignment

Assigns only if the current value is `null` or `undefined`.

```js
let a = null
a ??= "default"
console.log(a) // "default"

let b = 0
b ??= 42
console.log(b) // 0 — NOT assigned, because 0 is not null/undefined

let c = ""
c ??= "fallback"
console.log(c) // "" — NOT assigned
```

### `||=` — Logical OR Assignment

Assigns if the current value is **falsy** (`false`, `0`, `""`, `null`, `undefined`, `NaN`).

```js
let a = 0
a ||= 42
console.log(a) // 42 — 0 is falsy, so assigned

let b = "hello"
b ||= "world"
console.log(b) // "hello" — truthy, NOT assigned
```

### `&&=` — Logical AND Assignment

Assigns if the current value is **truthy**.

```js
let a = 1
a &&= 2
console.log(a) // 2 — 1 is truthy, so assigned

let b = 0
b &&= 2
console.log(b) // 0 — 0 is falsy, NOT assigned
```

### Practical Use Cases

```js
// Setting defaults (prefer ??= for null/undefined checks)
function greet(options) {
  options.name ??= "Anonymous"
  options.greeting ??= "Hello"
  return `${options.greeting}, ${options.name}!`
}

greet({ name: null })  // "Hello, Anonymous!"
greet({ name: "" })    // "Hello, !" — ??= preserves empty string

// Conditional transform (&&= for "only if exists")
let user = { name: "Mark", session: "abc123" }
user.session &&= encrypt(user.session)
// only encrypts if session is truthy

// Fallback values (||= treats all falsy as "missing")
let count = 0
count ||= 10 // count becomes 10 — careful, 0 was a valid value!
```

### Short-Circuit Behavior

These operators do NOT assign if the condition is not met — the right side is **never evaluated**:

```js
let x = "exists"
x ??= expensiveFunction() // expensiveFunction() is NEVER called
```

## W — Why It Matters

- Cleaner default value assignments — replaces verbose `if` checks.
- `??=` is the safest for defaults because it only triggers on `null`/`undefined`.
- These are used in modern codebases everywhere — config objects, API responses, state initialization.
- Shows interviewers you know modern JS features.

## I — Interview Questions with Answers

### Q1: What is the difference between `||=` and `??=`?

**A:** `||=` assigns when the value is **falsy** (including `0`, `""`, `false`). `??=` assigns only when the value is **`null` or `undefined`**. Use `??=` when `0`, `""`, or `false` are valid values.

### Q2: Does the right side always get evaluated?

**A:** No. These operators **short-circuit**. If the condition is not met, the right-hand expression is never executed.

### Q3: What does this print?

```js
let a = ""
a ??= "default"
a ||= "fallback"
console.log(a)
```

**A:** `"fallback"`. `??=` doesn't assign because `""` is not `null`/`undefined`. `||=` assigns because `""` is falsy.

## C — Common Pitfalls with Fix

### Pitfall: Using `||=` when `0` or `""` are valid values

```js
let port = 0
port ||= 3000
console.log(port) // 3000 — overwrote valid 0!
```

**Fix:** Use `??=` instead:

```js
let port = 0
port ??= 3000
console.log(port) // 0 — preserved
```

### Pitfall: Thinking `&&=` is like `??=`

They are **opposites** in intent:
- `??=` → "assign if missing"
- `&&=` → "transform if present"

## K — Coding Challenge with Solution

### Challenge

```js
let a = null
let b = 0
let c = "hello"
let d = undefined

a ??= "A"
b ??= "B"
c ||= "C"
d &&= "D"

console.log(a, b, c, d)
```

### Solution

```js
a // "A"       — null triggers ??=
b // 0         — 0 is not null/undefined, ??= does NOT assign
c // "hello"   — "hello" is truthy, ||= does NOT assign
d // undefined — undefined is falsy, &&= does NOT assign

// Output: "A" 0 "hello" undefined
```

---
