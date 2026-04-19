# 12 — Pipeline Operator & Future Proposals (Preview)

## T — TL;DR

The pipeline operator (`|>`) and other Stage 2–3 TC39 proposals are shaping JavaScript's future — understanding them now prepares you for tomorrow's syntax while deepening your grasp of functional patterns.

## K — Key Concepts

### The Pipeline Operator (`|>`) — Stage 2

Chains function calls left-to-right:

```js
// Without pipeline:
const result = capitalize(trim(await fetchName(userId)))

// With pipeline (proposed):
const result = userId
  |> fetchName(%)
  |> await %
  |> trim(%)
  |> capitalize(%)
```

The `%` is the **topic token** — it represents the value from the previous step.

### Why Pipeline Matters

Deeply nested function calls are hard to read:

```js
// Current JS — read inside-out:
console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(data)
        .filter(([k, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    ),
    null,
    2
  )
)

// With pipeline — read top-to-bottom:
data
  |> Object.entries(%)
  |> %.filter(([k, v]) => v != null)
  |> %.map(([k, v]) => [k, String(v)])
  |> Object.fromEntries(%)
  |> JSON.stringify(%, null, 2)
  |> console.log(%)
```

### Current Alternative: Method Chaining or Pipe Utilities

```js
// Utility pipe function (works today)
function pipe(value, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), value)
}

const result = pipe(
  "  Hello World  ",
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/\s+/g, "-"),
)
// "hello-world"
```

### Record & Tuple — Stage 2

Immutable, deeply comparable data structures:

```js
// Record (immutable object)
const record = #{ name: "Mark", age: 30 }
record.name = "Alex" // TypeError — immutable

// Tuple (immutable array)
const tuple = #[1, 2, 3]
tuple.push(4) // TypeError — immutable

// Deep equality by value!
#{ a: 1 } === #{ a: 1 } // true (unlike objects)
#[1, 2] === #[1, 2]     // true (unlike arrays)
```

### Decorator Metadata — Stage 3

```js
function logged(target, context) {
  const name = context.name
  return function (...args) {
    console.log(`Calling ${name}`)
    return target.call(this, ...args)
  }
}

class Service {
  @logged
  fetchData() {
    return "data"
  }
}
```

Decorators are available in TypeScript (Day 10 covers them in detail).

### Pattern Matching — Stage 1

```js
// Proposed:
const result = match(response) {
  when ({ status: 200, body }) -> body,
  when ({ status: 404 }) -> "Not Found",
  when ({ status: 500 }) -> "Server Error",
  default -> "Unknown"
}
```

### TC39 Stage Process

| Stage | Meaning | Stability |
|-------|---------|-----------|
| 0 | Strawperson | Idea only |
| 1 | Proposal | Problem statement accepted |
| 2 | Draft | Initial spec, likely to ship eventually |
| 2.7 | | Spec complete, needs implementations |
| 3 | Candidate | Ready for implementation, spec finalized |
| 4 | Finished | Ships in the next ECMAScript edition |

### What's Safe to Learn Now

| Proposal | Stage | Safe to Use? |
|----------|-------|-------------|
| `using` / resource management | 3 | ✅ In TS 5.2+, V8 |
| Decorators | 3 | ✅ In TS 5.0+ (non-legacy), V8 |
| Pipeline operator | 2 | ❌ Not yet — learn the pattern, not the syntax |
| Record & Tuple | 2 | ❌ Not yet |
| Pattern matching | 1 | ❌ Far from shipping |

## W — Why It Matters

- Knowing the TC39 process shows you understand how JavaScript evolves.
- The pipeline pattern (with or without the operator) is fundamental to functional programming.
- Decorators are already usable in TypeScript (Day 10) and major frameworks.
- Record & Tuple will change how we think about immutability if they ship.
- Staying informed about proposals helps you evaluate libraries and make forward-compatible decisions.

## I — Interview Questions with Answers

### Q1: What is the TC39 process?

**A:** The process by which new features are added to JavaScript. Proposals go through stages 0–4. Stage 3 means the spec is finalized and implementations are in progress. Stage 4 means it's shipping in the next ECMAScript edition.

### Q2: What is the pipeline operator?

**A:** A proposed syntax (`|>`) for chaining function calls left-to-right, improving readability of deeply nested calls. Currently Stage 2. The `%` (topic token) represents the previous step's value.

### Q3: How do you achieve pipeline-like composition today?

**A:** With a `pipe` utility function: `const pipe = (val, ...fns) => fns.reduce((acc, fn) => fn(acc), val)`. This reads top-to-bottom like a pipeline.

### Q4: What are Records and Tuples?

**A:** Proposed immutable data structures (`#{}` and `#[]`) that support **deep value equality** — two Records with the same content are `===`. Currently Stage 2.

## C — Common Pitfalls with Fix

### Pitfall: Using Stage 1-2 proposals in production

```js
// Don't use syntax that hasn't shipped — build tools may drop support
```

**Fix:** Only use Stage 3+ proposals (with transpiler support). For earlier stages, use the pattern (e.g., `pipe()` function) without the syntax.

### Pitfall: Confusing TypeScript decorators with TC39 decorators

TypeScript has two decorator implementations: legacy (`experimentalDecorators`) and TC39 Stage 3 (default in TS 5.0+). They have different semantics.

**Fix:** Use the new TC39-aligned decorators in new projects. Covered in Day 10.

## K — Coding Challenge with Solution

### Challenge

Implement a `pipe()` function and use it to transform data:

```js
const result = pipe(
  "   Hello, World!   ",
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/[^a-z0-9\s]/g, ""),
  s => s.split(/\s+/),
  words => words.join("-"),
)
// "hello-world"
```

### Solution

```js
function pipe(value, ...fns) {
  return fns.reduce((acc, fn) => fn(acc), value)
}

const result = pipe(
  "   Hello, World!   ",
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/[^a-z0-9\s]/g, ""),
  s => s.split(/\s+/),
  words => words.join("-"),
)

console.log(result) // "hello-world"
```

Async version:

```js
async function pipeAsync(value, ...fns) {
  let result = value
  for (const fn of fns) {
    result = await fn(result)
  }
  return result
}

const data = await pipeAsync(
  "/api/users",
  url => fetch(url),
  res => res.json(),
  users => users.filter(u => u.active),
  users => users.map(u => u.name),
)
```

---

# ✅ Day 7 Complete — Phase 1 Finished!

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Iterators & the Iterable Protocol | ✅ T-KWICK |
| 2 | Generators (`function*`) | ✅ T-KWICK |
| 3 | Async Generators & `for await...of` | ✅ T-KWICK |
| 4 | `Symbol` & Well-Known Symbols | ✅ T-KWICK |
| 5 | ESM vs CJS | ✅ T-KWICK |
| 6 | Dynamic `import()` & Top-Level `await` | ✅ T-KWICK |
| 7 | `globalThis` | ✅ T-KWICK |
| 8 | `Object.hasOwn` & `Array.fromAsync` | ✅ T-KWICK |
| 9 | The `Intl` API | ✅ T-KWICK |
| 10 | ES2024: Array Grouping & `Promise.withResolvers` | ✅ T-KWICK |
| 11 | `using` & Explicit Resource Management (Preview) | ✅ T-KWICK |
| 12 | Pipeline Operator & Future Proposals (Preview) | ✅ T-KWICK |

---

## 🎉 Phase 1 Complete — JavaScript Basics to Advanced

You've completed **7 days and 84 subtopics** of deep JavaScript knowledge:

| Day | Topic | Subtopics |
|-----|-------|-----------|
| 1 | Environment & JS Foundations | 12 |
| 2 | Functions, Scope & Hoisting | 12 |
| 3 | Closures, `this`, Prototypes & Metaprogramming | 12 |
| 4 | Arrays, Objects, Strings & Iteration | 12 |
| 5 | Async JavaScript | 12 |
| 6 | Memory, WeakRefs & Advanced Data Structures | 12 |
| 7 | Modern JavaScript | 12 |

You now have the **runtime mental model** that underpins everything in Phase 2 (TypeScript) and beyond.

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 7` | 5 interview-style problems covering all 12 topics |
| `Generate Day 8` | **Phase 2 begins** — TypeScript Foundations |
| `recap Phase 1` | Summary of all 7 days |

> Phase 1 is done. You've built a foundation most developers skip.
> Now the type system goes on top. `Generate Day 8` when ready.
