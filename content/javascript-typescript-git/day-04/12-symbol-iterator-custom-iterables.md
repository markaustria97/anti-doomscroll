# 12 — `Symbol.iterator` & Custom Iterables

## T — TL;DR

`Symbol.iterator` makes any object work with `for...of`, spread, and destructuring — implement it to make your custom classes iterable.

## K — Key Concepts

```js
// Built-in iterables use Symbol.iterator
const arr = [1, 2, 3]
const iter = arr[Symbol.iterator]()
iter.next()  // { value: 1, done: false }
iter.next()  // { value: 2, done: false }
iter.next()  // { value: 3, done: false }
iter.next()  // { value: undefined, done: true }

// for...of uses Symbol.iterator internally
for (const x of arr) { /* ... */ }
// equivalent to:
const it = arr[Symbol.iterator]()
let result
while (!(result = it.next()).done) { /* use result.value */ }

// Custom iterable object
class Range {
  constructor(start, end) {
    this.start = start
    this.end = end
  }

  [Symbol.iterator]() {
    let current = this.start
    const end = this.end
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}

const range = new Range(1, 5)
[...range]             // [1, 2, 3, 4, 5]
for (const n of range) console.log(n)  // 1 2 3 4 5
const [first, , third] = range  // destructuring works!

// Generator shorthand for iterables
class EvenNumbers {
  constructor(limit) { this.limit = limit }

  *[Symbol.iterator]() {    // generator method as Symbol.iterator
    for (let i = 0; i <= this.limit; i += 2) {
      yield i
    }
  }
}

[...new EvenNumbers(10)]  // [0, 2, 4, 6, 8, 10]
```


## W — Why It Matters

`Symbol.iterator` is what makes custom data structures work natively with JavaScript's iteration protocol — `for...of`, spread `[...x]`, destructuring, `Array.from`, `Promise.all`, and more. It's the key to making first-class data structures.

## I — Interview Q&A

**Q: How do you make a custom object iterable?**
A: Define a `[Symbol.iterator]()` method that returns an iterator object. The iterator must have a `next()` method that returns `{ value, done }` objects. Use a generator function (`function*`) as a shorthand.

**Q: What protocol must an iterator follow?**
A: An iterator must have a `next()` method that returns an object with `value` (current item) and `done` (boolean — `true` when exhausted). An iterable must have a `[Symbol.iterator]()` method that returns an iterator.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Returning `{ done: true }` without `value` | Return `{ value: undefined, done: true }` explicitly |
| Reusing a consumed iterator | Iterators are one-use — call `[Symbol.iterator]()` fresh |
| Infinite iterator in `[...spread]` | Only spread finite iterables or use `take(n)` pattern |
| Forgetting generator method syntax `*[Symbol.iterator]()` | The `*` before the `[` is required |

## K — Coding Challenge

**Implement a `LinkedList` class that is iterable with `for...of`:**

```js
const list = new LinkedList()
list.add(1); list.add(2); list.add(3)
for (const val of list) console.log(val)  // 1 2 3
[...list]  // [1, 2, 3]
```

**Solution:**

```js
class LinkedList {
  #head = null

  add(val) {
    this.#head = { val, next: this.#head }
  }

  *[Symbol.iterator]() {
    const values = []
    let node = this.#head
    while (node) { values.unshift(node.val); node = node.next }
    yield* values
  }
}
```


***
