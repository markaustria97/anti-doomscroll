# 7 — Iterables, `Symbol.iterator` & the Iterator Protocol

## T — TL;DR

Any object with a `[Symbol.iterator]()` method is iterable — it must return an iterator with a `next()` method that produces `{ value, done }` objects.[^8][^9]

## K — Key Concepts

```js
// The iteration protocol — two parts:

// 1. ITERABLE: has [Symbol.iterator]() that returns an ITERATOR
// 2. ITERATOR: has next() that returns { value, done }

// Built-in iterables: Array, String, Map, Set, arguments, NodeList
for (const x of [1,2,3]) {}  // Array is iterable
for (const ch of "hello") {} // String is iterable
for (const [k, v] of new Map([["a",1]])) {}

// Manual iterator consumption
const iter = [10, 20, 30][Symbol.iterator]()
iter.next()  // { value: 10, done: false }
iter.next()  // { value: 20, done: false }
iter.next()  // { value: 30, done: false }
iter.next()  // { value: undefined, done: true }

// Custom iterable object
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {            // makes the object iterable
    let current = this.from
    const last = this.to
    return {
      next() {                     // the iterator
        if (current <= last) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      },
      [Symbol.iterator]() { return this }  // iterator is also iterable (good practice)
    }
  }
}

for (const n of range) console.log(n)  // 1 2 3 4 5
[...range]                              // [1, 2, 3, 4, 5]
const [first, second] = range          // destructuring works!
Array.from(range)                       // [1, 2, 3, 4, 5]

// Return/throw on iterator (optional protocol methods)
const iter2 = range[Symbol.iterator]()
iter2.return?.("early exit")  // signal early termination (e.g., break in for...of)
iter2.throw?.(new Error())    // signal error into iterator
```


## W — Why It Matters

The iteration protocol powers `for...of`, spread `[...x]`, destructuring, `Array.from`, `Promise.all`, `Map`/`Set` constructors, and `yield*`. Any data structure you build becomes a first-class JavaScript citizen once it implements this protocol.[^9][^8]

## I — Interview Q&A

**Q: What's the difference between an iterable and an iterator?**
A: An **iterable** has `[Symbol.iterator]()` — it produces iterators. An **iterator** has `next()` — it produces `{ value, done }` results. Arrays are iterables. `arr[Symbol.iterator]()` returns an iterator. An iterator can also be its own iterable (implementing both).

**Q: Why should an iterator also implement `[Symbol.iterator]() { return this }`?**
A: This makes the iterator itself iterable — so you can use it directly in `for...of` and destructuring after partially consuming it. Without it, you can't resume a partially-consumed iterator in contexts that expect an iterable.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Returning `{ done: true }` without `value` | Return `{ value: undefined, done: true }` — some consumers need explicit `undefined` |
| Plain object `{}` not being iterable | Implement `[Symbol.iterator]()` or convert to Map/array |
| Infinite iterator in `[...spread]` | Only spread finite iterables — take `n` items first |
| Not making iterator also iterable | Add `[Symbol.iterator]() { return this }` to iterator |

## K — Coding Challenge

**Make this `LinkedList` iterable:**

```js
const list = new LinkedList(1, 2, 3)
[...list]         // [1, 2, 3]
for (const n of list) console.log(n)
```

**Solution:**

```js
class LinkedList {
  constructor(...vals) {
    this.head = null
    vals.reverse().forEach(v => this.head = { val: v, next: this.head })
  }

  [Symbol.iterator]() {
    let node = this.head
    return {
      next() {
        if (node) {
          const value = node.val
          node = node.next
          return { value, done: false }
        }
        return { value: undefined, done: true }
      }
    }
  }
}
```


***
