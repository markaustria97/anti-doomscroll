# 8 — Generators: `yield`, `yield*`, `return`, `throw` & Lazy Evaluation

## T — TL;DR

Generators (`function*`) are pausable functions — `yield` suspends and emits a value; the caller controls when to resume; this enables lazy sequences, infinite streams, and coroutines.[^4][^9]

## K — Key Concepts

```js
// Generator function — returns a generator (which is both iterator AND iterable)
function* counter(start = 0) {
  while (true) {          // infinite — lazy, only computes on demand
    yield start++         // pause here, emit value
  }
}

const gen = counter(1)
gen.next()  // { value: 1, done: false }
gen.next()  // { value: 2, done: false }
gen.next()  // { value: 3, done: false }
// Infinite — never done: true (unless return() called)

// Finite generator
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) yield i
}
[...range(1, 10, 2)]  // [1, 3, 5, 7, 9]

// yield* — delegate to another iterable
function* concat(...iterables) {
  for (const it of iterables) {
    yield* it  // delegates: yields each item from `it`
  }
}
[...concat([1, 2], [3, 4], [^5])]  // [1, 2, 3, 4, 5]

// Two-way communication — passing values INTO generator via next(value)
function* accumulator() {
  let total = 0
  while (true) {
    const n = yield total  // yield sends total OUT; next(n) sends n IN
    total += n ?? 0
  }
}
const acc = accumulator()
acc.next()     // { value: 0, done: false } — starts it
acc.next(10)   // { value: 10, done: false }
acc.next(5)    // { value: 15, done: false }

// generator.return(val) — force completion
gen.return("done")  // { value: "done", done: true }

// generator.throw(err) — inject error at yield point
function* safe() {
  try { yield 1 }
  catch (e) { console.error("caught:", e.message) }
  yield 2
}
const s = safe()
s.next()                        // { value: 1, done: false }
s.throw(new Error("injected")) // "caught: injected" → { value: 2, done: false }

// Lazy evaluation — only compute what you need
function* fibonacci() {
  let [a, b] = [0, 1]
  while (true) {
    yield a;
    [a, b] = [b, a + b]
  }
}

function take(n, gen) {
  const result = []
  for (const val of gen) {
    result.push(val)
    if (result.length >= n) break
  }
  return result
}
take(10, fibonacci())  // [0,1,1,2,3,5,8,13,21,34]
```


## W — Why It Matters

Generators are the foundation of async/await (Babel originally compiled `async/await` to generators), `co` library, Redux-Saga middleware, and any system requiring coroutine-style control flow. Lazy evaluation means you can model infinite sequences without memory issues.[^4][^9]

## I — Interview Q&A

**Q: What is the difference between `yield` and `return` in a generator?**
A: `yield` pauses the generator and emits a value — it can resume. `return` terminates the generator permanently, emitting `{ value: returnValue, done: true }`. After `return`, all subsequent `next()` calls return `{ value: undefined, done: true }`.

**Q: How does `yield*` differ from `yield`?**
A: `yield` emits a single value. `yield*` delegates to another iterable — it yields every value from it one by one, essentially "flattening" the delegation. The return value of `yield*` is the iterable's final return value (if it's a generator).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Spreading an infinite generator | Always limit with `take(n, gen)` or `break` in `for...of` |
| `gen.next()` before starting — first call sets up, doesn't take a value | First `next()` runs to the first `yield`; passed value is ignored |
| Forgetting generators are single-use | Create a new generator for each independent iteration |
| `yield*` not working on non-iterables | Only delegates to iterables — not plain objects |

## K — Coding Challenge

**Write a lazy `map` and `filter` using generators:**

```js
const result = take(3, filter(x => x % 2 === 0, map(x => x * x, range(1, 100))))
// → [4, 16, 36] — squares of even numbers from 1–100, lazily evaluated
```

**Solution:**

```js
function* map(fn, iter) {
  for (const val of iter) yield fn(val)
}

function* filter(pred, iter) {
  for (const val of iter) {
    if (pred(val)) yield val
  }
}

// Usage — nothing is computed until `take` pulls values!
const result = take(3, filter(x => x % 2 === 0, map(x => x * x, range(1, 100))))
// [4, 16, 36]
```


***
