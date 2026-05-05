# 12 — Function Composition, `pipe` & `compose`

## T — TL;DR

Function composition chains pure functions so the output of one becomes the input of the next — `pipe` goes left-to-right, `compose` goes right-to-left.

## K — Key Concepts

```js
// Manual composition
const double = x => x * 2
const addTen = x => x + 10
const square = x => x * x

// Without composition — nested
square(addTen(double(3)))  // square(addTen(6)) = square(16) = 256

// pipe — left-to-right (most readable)
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x)

const transform = pipe(double, addTen, square)
transform(3)  // double(3)=6 → addTen(6)=16 → square(16)=256

// compose — right-to-left (mathematical convention)
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x)

const transform2 = compose(square, addTen, double)  // same result, reversed order
transform2(3)  // 256

// Real-world pipe with strings
const sanitize = pipe(
  str => str.trim(),
  str => str.toLowerCase(),
  str => str.replace(/\s+/g, "-")
)
sanitize("  Hello World  ")  // "hello-world"
```


## W — Why It Matters

`pipe` is the backbone of functional pipelines in data processing, form validation, and middleware patterns. Libraries like Ramda, lodash/fp, and RxJS are built on composition. Understanding it also makes Redux middleware (`applyMiddleware`) intuitive.

## I — Interview Q&A

**Q: What's the difference between `pipe` and `compose`?**
A: Both combine functions into a pipeline. `pipe(f, g, h)(x)` executes left-to-right: `h(g(f(x)))`. `compose(f, g, h)(x)` executes right-to-left: `f(g(h(x)))`. `pipe` is more readable for most developers.

**Q: Why must functions in a pipeline be unary (single-argument)?**
A: Each function receives the output of the previous one — a single value. Multi-argument functions break the chain. Use currying to make multi-arg functions pipeable.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Composing impure functions (with side effects) | Only compose pure functions for predictable pipelines |
| Confusing `pipe` and `compose` order | Remember: `pipe` = reading order (left→right) |
| Functions in pipeline not returning a value | Every function in a pipe must explicitly return |

## K — Coding Challenge

**Build a validation pipeline using `pipe`:**

```js
// Validate: trim → must not be empty → must be email format
const validateEmail = pipe(/* your functions */)
validateEmail("  alice@example.com  ")  // "alice@example.com"
validateEmail("  ")                      // throws or returns error
```

**Solution:**

```js
const trim = str => str.trim()
const requireNonEmpty = str => {
  if (!str) throw new Error("Cannot be empty")
  return str
}
const requireEmail = str => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) throw new Error("Invalid email")
  return str
}

const validateEmail = pipe(trim, requireNonEmpty, requireEmail)
validateEmail("  alice@example.com  ")  // "alice@example.com"
```


***
