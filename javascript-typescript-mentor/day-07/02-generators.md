# 2 — Generators (`function*`)

## T — TL;DR

A generator is a function that can **pause and resume** execution using `yield` — it returns an iterator, making it the easiest way to create custom iterables and lazy sequences.

## K — Key Concepts

### Basic Generator

```js
function* count() {
  yield 1
  yield 2
  yield 3
}

const gen = count()

gen.next() // { value: 1, done: false }
gen.next() // { value: 2, done: false }
gen.next() // { value: 3, done: false }
gen.next() // { value: undefined, done: true }
```

`function*` defines a generator. Calling it returns a **generator object** (which is both an iterator AND an iterable).

### Generators Are Iterables

```js
function* count() {
  yield 1
  yield 2
  yield 3
}

for (const n of count()) {
  console.log(n) // 1, 2, 3
}

[...count()] // [1, 2, 3]

const [a, b] = count() // a=1, b=2
```

### `yield` Pauses Execution

```js
function* steps() {
  console.log("Step 1")
  yield "first"

  console.log("Step 2")
  yield "second"

  console.log("Step 3")
  return "done"
}

const gen = steps()

gen.next()
// "Step 1"
// { value: "first", done: false }

gen.next()
// "Step 2"
// { value: "second", done: false }

gen.next()
// "Step 3"
// { value: "done", done: true }
```

The function **freezes** at each `yield` and resumes when `next()` is called.

### Passing Values INTO a Generator

`next(value)` sends a value back into the generator — it becomes the result of the `yield` expression:

```js
function* conversation() {
  const name = yield "What is your name?"
  const age = yield `Hello ${name}, how old are you?`
  return `${name} is ${age} years old`
}

const gen = conversation()

gen.next()           // { value: "What is your name?", done: false }
gen.next("Mark")     // { value: "Hello Mark, how old are you?", done: false }
gen.next(30)         // { value: "Mark is 30 years old", done: true }
```

**The first `next()` always has no argument** — it starts the generator up to the first `yield`.

### Infinite Generators

```js
function* naturals(start = 1) {
  let n = start
  while (true) {
    yield n++
  }
}

// Take first 5
const first5 = []
for (const n of naturals()) {
  first5.push(n)
  if (first5.length === 5) break
}
// [1, 2, 3, 4, 5]
```

### `yield*` — Delegation

Delegates to another iterable or generator:

```js
function* inner() {
  yield 3
  yield 4
}

function* outer() {
  yield 1
  yield 2
  yield* inner() // delegates to inner
  yield 5
}

[...outer()] // [1, 2, 3, 4, 5]
```

Works with any iterable:

```js
function* withArray() {
  yield* [10, 20, 30]
  yield* "abc"
}

[...withArray()] // [10, 20, 30, "a", "b", "c"]
```

### `return()` and `throw()` on Generators

```js
function* gen() {
  try {
    yield 1
    yield 2
    yield 3
  } finally {
    console.log("Cleanup!")
  }
}

const g = gen()
g.next()    // { value: 1, done: false }
g.return("early") // "Cleanup!" → { value: "early", done: true }
// Generator is terminated

const g2 = gen()
g2.next()   // { value: 1, done: false }
g2.throw(new Error("fail")) // "Cleanup!" → throws Error("fail")
```

### Lazy Evaluation Pattern

```js
function* map(iterable, fn) {
  for (const item of iterable) {
    yield fn(item)
  }
}

function* filter(iterable, fn) {
  for (const item of iterable) {
    if (fn(item)) yield item
  }
}

function* take(iterable, n) {
  let count = 0
  for (const item of iterable) {
    yield item
    if (++count >= n) return
  }
}

// Lazy pipeline — only processes what's needed
function* naturals() {
  let n = 1
  while (true) yield n++
}

const result = [
  ...take(
    filter(
      map(naturals(), n => n * n), // square
      n => n % 2 === 0              // even only
    ),
    5 // take first 5
  ),
]
// [4, 16, 36, 64, 100]
// Only computed 10 numbers, not infinity!
```

## W — Why It Matters

- Generators are the **simplest way** to create custom iterables.
- They enable **lazy evaluation** — processing data on demand without loading everything.
- Redux-Saga uses generators for side-effect management.
- Generators are the foundation for **async generators** (next topic) and `for await...of`.
- The pause/resume mechanism explains how `async/await` works internally (it was transpiled to generators before native support).
- Understanding `yield*` is key for composing complex iteration pipelines.

## I — Interview Questions with Answers

### Q1: What is a generator function?

**A:** A function declared with `function*` that can pause execution at `yield` points and resume later. It returns a generator object that implements both the iterator and iterable protocols.

### Q2: How does `yield` differ from `return`?

**A:** `yield` pauses the function and emits a value — execution can resume. `return` terminates the generator permanently and sets `done: true`.

### Q3: What does `yield*` do?

**A:** Delegates iteration to another iterable or generator. It yields each value from the delegated iterable in sequence before continuing the outer generator.

### Q4: How do you send values into a generator?

**A:** By passing an argument to `gen.next(value)`. The value becomes the result of the `yield` expression inside the generator. The first `next()` call cannot send a value (it starts execution up to the first `yield`).

## C — Common Pitfalls with Fix

### Pitfall: Forgetting the `*` in `function*`

```js
function gen() { yield 1 } // SyntaxError: Unexpected number
```

**Fix:** `function* gen() { yield 1 }`. The `*` is required.

### Pitfall: Trying to use arrow functions as generators

```js
const gen = *() => { yield 1 } // SyntaxError
```

**Fix:** Generators can't be arrow functions. Use `function*` declaration or expression.

### Pitfall: Forgetting that the first `next()` doesn't accept a meaningful argument

```js
function* gen() {
  const x = yield
  console.log(x)
}

const g = gen()
g.next("ignored") // starts generator, "ignored" is lost
g.next("received") // logs "received"
```

**Fix:** The first `next()` just starts execution to the first `yield`. Send values starting from the second `next()`.

### Pitfall: Consuming a generator twice

```js
const gen = count()
[...gen] // [1, 2, 3]
[...gen] // [] — exhausted!
```

**Fix:** Call the generator function again: `[...count()]` creates a fresh generator each time.

## K — Coding Challenge with Solution

### Challenge

Create an infinite Fibonacci generator and a `take(gen, n)` utility:

```js
const fibs = [...take(fibonacci(), 10)]
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Solution

```js
function* fibonacci() {
  let a = 0, b = 1
  while (true) {
    yield a;
    [a, b] = [b, a + b]
  }
}

function* take(iterable, n) {
  let count = 0
  for (const item of iterable) {
    yield item
    if (++count >= n) return
  }
}

console.log([...take(fibonacci(), 10)])
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---
