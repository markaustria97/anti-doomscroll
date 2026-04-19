# 10 — Debugging Toolkit: `console.table` / `console.group` / `console.time` / `console.trace`

## T — TL;DR

Beyond `console.log`, JavaScript has powerful debugging methods — `console.table` for structured data, `console.group` for hierarchy, `console.time` for benchmarking, and `console.trace` for call stack inspection.

## K — Key Concepts

### `console.table` — Visualize Arrays and Objects

```js
const users = [
  { name: "Mark", age: 30, role: "dev" },
  { name: "Alex", age: 25, role: "design" },
  { name: "Jane", age: 35, role: "dev" },
]

console.table(users)
// ┌─────────┬─────────┬─────┬──────────┐
// │ (index) │  name   │ age │   role   │
// ├─────────┼─────────┼─────┼──────────┤
// │    0    │ 'Mark'  │ 30  │  'dev'   │
// │    1    │ 'Alex'  │ 25  │ 'design' │
// │    2    │ 'Jane'  │ 35  │  'dev'   │
// └─────────┴─────────┴─────┴──────────┘

// Filter columns:
console.table(users, ["name", "role"])
// Only shows name and role columns
```

Works with objects too:

```js
console.table({ a: 1, b: 2, c: 3 })
// ┌─────────┬────────┐
// │ (index) │ Values │
// ├─────────┼────────┤
// │    a    │   1    │
// │    b    │   2    │
// │    c    │   3    │
// └─────────┴────────┘
```

### `console.group` / `console.groupEnd` — Nested Output

```js
console.group("User Processing")
  console.log("Fetching users...")
  console.group("Validation")
    console.log("Checking names...")
    console.log("Checking emails...")
    console.warn("1 invalid email found")
  console.groupEnd()
  console.log("Processing complete")
console.groupEnd()

// Output (collapsible in DevTools):
// ▼ User Processing
//     Fetching users...
//   ▼ Validation
//       Checking names...
//       Checking emails...
//       ⚠️ 1 invalid email found
//     Processing complete
```

`console.groupCollapsed` — starts collapsed:

```js
console.groupCollapsed("Details") // collapsed by default
  console.log("Hidden until expanded")
console.groupEnd()
```

### `console.time` / `console.timeEnd` — Quick Benchmarks

```js
console.time("fetch")
const data = await fetch("/api/users")
const json = await data.json()
console.timeEnd("fetch")
// fetch: 234.56ms

// Multiple timers can run simultaneously:
console.time("total")
  console.time("step1")
  await step1()
  console.timeEnd("step1") // step1: 100.00ms

  console.time("step2")
  await step2()
  console.timeEnd("step2") // step2: 200.00ms
console.timeEnd("total")   // total: 300.12ms
```

`console.timeLog` — log intermediate time without stopping:

```js
console.time("process")
await step1()
console.timeLog("process", "after step 1") // process: 100ms after step 1
await step2()
console.timeLog("process", "after step 2") // process: 300ms after step 2
console.timeEnd("process")                  // process: 500ms
```

### `console.trace` — Print Call Stack

```js
function a() { b() }
function b() { c() }
function c() {
  console.trace("Where am I?")
}

a()
// Trace: Where am I?
//   at c (file.js:4)
//   at b (file.js:2)
//   at a (file.js:1)
```

Great for understanding **how** a function was called — especially in event-driven or callback-heavy code.

### `console.count` / `console.countReset` — Call Counting

```js
function handleClick(type) {
  console.count(type)
}

handleClick("button")  // button: 1
handleClick("link")    // link: 1
handleClick("button")  // button: 2
handleClick("button")  // button: 3

console.countReset("button")
handleClick("button")  // button: 1
```

### `console.assert` — Conditional Logging

```js
const age = 15

console.assert(age >= 18, "User is underage:", age)
// Assertion failed: User is underage: 15

console.assert(age >= 0, "Age is valid") // (no output — assertion passed)
```

### `console.dir` — Object Inspection

```js
console.log(document.body)   // shows HTML representation
console.dir(document.body)   // shows JavaScript object properties
```

### Styled Console Output

```js
console.log(
  "%c Error %c Warning %c Info",
  "background: red; color: white; padding: 2px 6px; border-radius: 2px;",
  "background: orange; color: black; padding: 2px 6px; border-radius: 2px;",
  "background: blue; color: white; padding: 2px 6px; border-radius: 2px;"
)
```

### Quick Reference

| Method | Purpose |
|--------|---------|
| `console.table(data)` | Tabular view of arrays/objects |
| `console.group(label)` | Collapsible nested output |
| `console.groupCollapsed(label)` | Starts collapsed |
| `console.time(label)` | Start timer |
| `console.timeLog(label)` | Log intermediate time |
| `console.timeEnd(label)` | End timer and log |
| `console.trace(label)` | Print call stack |
| `console.count(label)` | Count calls |
| `console.assert(condition, msg)` | Log on failure only |
| `console.dir(obj)` | Object property view |

## W — Why It Matters

- `console.table` saves time when debugging arrays of objects (API responses, state).
- `console.time` is the fastest way to benchmark code without external tools.
- `console.trace` answers "who called this function?" — critical for event-driven debugging.
- `console.group` makes complex logs readable.
- These tools are universally available and require no setup.

## I — Interview Questions with Answers

### Q1: How would you quickly benchmark a function?

**A:** Wrap it with `console.time("label")` and `console.timeEnd("label")`. For multiple iterations, use `performance.now()` for higher precision.

### Q2: How do you find out which function called another function?

**A:** `console.trace()` prints the full call stack at that point. Alternatively, `new Error().stack` gives the stack as a string.

### Q3: What is `console.table` useful for?

**A:** Displaying arrays of objects in a readable table format. You can filter columns by passing a second argument: `console.table(data, ["name", "age"])`.

## C — Common Pitfalls with Fix

### Pitfall: Leaving console statements in production

```js
console.log("debug:", userData) // leaks data, clutters console
```

**Fix:** Use ESLint's `no-console` rule. Strip console calls in build step (e.g., `babel-plugin-transform-remove-console`).

### Pitfall: Using `console.log` for objects and getting `[Object object]`

```js
console.log("User: " + user) // "User: [object Object]"
```

**Fix:** Use comma: `console.log("User:", user)` or template literal with JSON: `` console.log(`User: ${JSON.stringify(user)}`) ``.

## K — Coding Challenge with Solution

### Challenge

Create a `perfLog(label, fn)` utility that:
- Times the function execution
- Logs the result in a collapsible group
- Returns the function's result

```js
const result = perfLog("Calculate sum", () => {
  let sum = 0
  for (let i = 0; i < 1_000_000; i++) sum += i
  return sum
})
// ▼ Calculate sum
//     ⏱️ 12.34ms
//     Result: 499999500000
// result === 499999500000
```

### Solution

```js
function perfLog(label, fn) {
  console.group(label)

  console.time("⏱️")
  const result = fn()
  console.timeEnd("⏱️")

  console.log("Result:", result)
  console.groupEnd()

  return result
}
```

For async:

```js
async function perfLogAsync(label, fn) {
  console.group(label)
  console.time("⏱️")

  const result = await fn()

  console.timeEnd("⏱️")
  console.log("Result:", result)
  console.groupEnd()

  return result
}
```

---
