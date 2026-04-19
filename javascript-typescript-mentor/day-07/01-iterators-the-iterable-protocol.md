# 1 — Iterators & the Iterable Protocol

## T — TL;DR

An **iterable** is any object with a `Symbol.iterator` method that returns an **iterator** (an object with a `next()` method) — this protocol powers `for...of`, spread, destructuring, and every collection-consuming API in JavaScript.

## K — Key Concepts

### The Iterator Protocol

An iterator is an object with a `next()` method that returns `{ value, done }`:

```js
const iterator = {
  current: 0,
  next() {
    if (this.current < 3) {
      return { value: this.current++, done: false }
    }
    return { value: undefined, done: true }
  },
}

iterator.next() // { value: 0, done: false }
iterator.next() // { value: 1, done: false }
iterator.next() // { value: 2, done: false }
iterator.next() // { value: undefined, done: true }
```

### The Iterable Protocol

An iterable is an object with a `[Symbol.iterator]()` method that returns an iterator:

```js
const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from
    const last = this.to

    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false }
        }
        return { value: undefined, done: true }
      },
    }
  },
}

for (const num of range) {
  console.log(num) // 1, 2, 3, 4, 5
}

[...range]                // [1, 2, 3, 4, 5]
const [a, b] = range      // a=1, b=2
Array.from(range)          // [1, 2, 3, 4, 5]
```

### Built-In Iterables

These all implement `Symbol.iterator`:

```js
// Arrays
for (const x of [1, 2, 3]) {}

// Strings
for (const char of "hello") {} // "h", "e", "l", "l", "o"

// Maps
for (const [k, v] of new Map([["a", 1]])) {}

// Sets
for (const v of new Set([1, 2, 3])) {}

// TypedArrays
for (const byte of new Uint8Array([1, 2, 3])) {}

// arguments object
function fn() { for (const a of arguments) {} }

// NodeList (DOM)
for (const el of document.querySelectorAll("div")) {}
```

### What Consumes Iterables

| Consumer | Example |
|----------|---------|
| `for...of` | `for (const x of iterable) {}` |
| Spread | `[...iterable]` |
| Destructuring | `const [a, b] = iterable` |
| `Array.from` | `Array.from(iterable)` |
| `Promise.all` | `Promise.all(iterable)` |
| `new Map` / `new Set` | `new Set(iterable)` |
| `yield*` | `yield* iterable` (generators) |

### Making a Class Iterable

```js
class Playlist {
  #songs = []

  add(song) {
    this.#songs.push(song)
    return this
  }

  [Symbol.iterator]() {
    let index = 0
    const songs = this.#songs

    return {
      next() {
        if (index < songs.length) {
          return { value: songs[index++], done: false }
        }
        return { value: undefined, done: true }
      },
    }
  }
}

const playlist = new Playlist()
playlist.add("Song A").add("Song B").add("Song C")

for (const song of playlist) {
  console.log(song) // "Song A", "Song B", "Song C"
}

const allSongs = [...playlist] // ["Song A", "Song B", "Song C"]
```

### Infinite Iterators

Iterators don't have to end:

```js
const naturals = {
  [Symbol.iterator]() {
    let n = 1
    return {
      next() {
        return { value: n++, done: false } // never done
      },
    }
  },
}

// Take the first 5:
const first5 = []
for (const n of naturals) {
  first5.push(n)
  if (first5.length === 5) break
}
// [1, 2, 3, 4, 5]
```

### `return()` — Early Termination

Iterators can have an optional `return()` method called when iteration is aborted (`break`, `throw`, or destructuring takes fewer values):

```js
const resource = {
  [Symbol.iterator]() {
    console.log("Opening resource")
    let i = 0
    return {
      next() {
        return { value: i++, done: false }
      },
      return() {
        console.log("Closing resource") // cleanup!
        return { value: undefined, done: true }
      },
    }
  },
}

for (const x of resource) {
  if (x > 2) break // triggers return()
}
// "Opening resource"
// "Closing resource"
```

## W — Why It Matters

- The iterator protocol is the **foundation** of `for...of`, spread, destructuring, and generators.
- Custom iterables let you make any class work with `for...of` and spread.
- Libraries like RxJS, Immutable.js, and database query builders implement the iterable protocol.
- Infinite iterators enable lazy evaluation — process data on demand without loading everything.
- Understanding iterators is prerequisite for generators (next topic).

## I — Interview Questions with Answers

### Q1: What is the difference between an iterable and an iterator?

**A:** An **iterable** is an object with a `[Symbol.iterator]()` method that returns an iterator. An **iterator** is an object with a `next()` method that returns `{ value, done }`. Arrays are iterables; calling `array[Symbol.iterator]()` returns an iterator.

### Q2: How do you make a custom object iterable?

**A:** Implement a `[Symbol.iterator]()` method that returns an object with a `next()` method. The `next()` method returns `{ value, done: false }` for each element and `{ value: undefined, done: true }` when done.

### Q3: What consumes iterables?

**A:** `for...of`, spread (`...`), destructuring, `Array.from`, `Promise.all`, `new Map`/`Set`, and `yield*` in generators.

### Q4: What is the `return()` method on iterators for?

**A:** Cleanup. It's called when iteration is terminated early (via `break`, `throw`, or partial destructuring). It's analogous to `finally` — useful for closing file handles, connections, etc.

## C — Common Pitfalls with Fix

### Pitfall: Confusing iterables with arrays

```js
const iterable = { [Symbol.iterator]() { /* ... */ } }
iterable.map // undefined! Not an array.
```

**Fix:** Convert first: `Array.from(iterable).map(...)` or `[...iterable].map(...)`.

### Pitfall: Iterator is consumed after one pass

```js
const arr = [1, 2, 3]
const iter = arr[Symbol.iterator]()

[...iter] // [1, 2, 3]
[...iter] // [] — iterator is exhausted!
```

**Fix:** The **iterable** (`arr`) creates a fresh iterator each time. The **iterator** itself is one-use. Always spread the iterable, not the iterator.

### Pitfall: Plain objects are NOT iterable

```js
for (const x of { a: 1 }) {} // TypeError: {a: 1} is not iterable
```

**Fix:** Use `Object.entries(obj)` to create an iterable from an object.

## K — Coding Challenge with Solution

### Challenge

Create a `range(start, end, step = 1)` function that returns an iterable:

```js
for (const n of range(0, 10, 2)) {
  console.log(n) // 0, 2, 4, 6, 8, 10
}

[...range(1, 5)] // [1, 2, 3, 4, 5]
```

### Solution

```js
function range(start, end, step = 1) {
  return {
    [Symbol.iterator]() {
      let current = start
      return {
        next() {
          if (current <= end) {
            const value = current
            current += step
            return { value, done: false }
          }
          return { value: undefined, done: true }
        },
      }
    },
  }
}

for (const n of range(0, 10, 2)) console.log(n) // 0, 2, 4, 6, 8, 10
console.log([...range(1, 5)]) // [1, 2, 3, 4, 5]
```

---
