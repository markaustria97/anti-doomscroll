<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 3 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 3
Arrays, Objects, Serialization \& Regex
array creation and indexing, mutation vs immutability, core array methods, map/filter/reduce/find/findIndex/some/every/flat/flatMap, forEach/join/concat/slice/splice/includes/fill/copyWithin, keys/values/entries, Array.from, Array.of, Array.isArray, at, immutable array methods, sorting and comparators, object literals, shorthand, computed property names, Object.keys/values/entries/assign/freeze/seal/create/defineProperty/getOwnPropertyDescriptor, Object.fromEntries, Object.hasOwn, destructuring, spread/rest, shallow copy vs deep copy, structuredClone, circular references, JSON.parse/JSON.stringify with replacer and reviver, regex literals vs RegExp constructor, test, match, matchAll, replace, replaceAll, named groups, flags.

Here is **Day 3 — Arrays, Objects, Serialization \& Regex** in full T-KWICK format, one section per subtopic. [^1][^2][^3][^4]

***

# Day 3 — Arrays, Objects, Serialization \& Regex

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the code. Move on.

***

# 1 — Array Creation, Indexing \& Mutation vs Immutability

## T — TL;DR

Arrays are ordered, zero-indexed, and mutable by default — understanding which methods mutate in place vs. return new arrays is the most important thing you can know about arrays.

## K — Key Concepts

```js
// Creation
const a = [1, 2, 3]                        // literal
const b = new Array(3)                      // [empty × 3] — sparse!
const c = new Array(3).fill(0)             // [0, 0, 0]
const d = Array.from({ length: 3 }, (_, i) => i)  // [0, 1, 2]
const e = Array.of(1, 2, 3)               // [1, 2, 3] — avoids new Array() quirk

// Indexing
const arr = ["a", "b", "c"]
arr[^0]       // "a"
arr[^2]       // "c"
arr[-1]      // undefined — negative indexing doesn't work directly
arr.at(-1)   // "c" ✅ ES2022 — negative indexing!
arr.at(-2)   // "b"

// Mutation vs Immutability
// ❌ MUTATING (changes original array):
arr.push("d")        // adds to end
arr.pop()            // removes from end
arr.shift()          // removes from start
arr.unshift("z")     // adds to start
arr.splice(1, 1)     // removes/inserts at index
arr.sort()           // sorts in place
arr.reverse()        // reverses in place
arr.fill(0)          // fills with value

// ✅ NON-MUTATING (returns new array):
arr.map(fn)
arr.filter(fn)
arr.reduce(fn, init)
arr.slice(1, 3)
arr.concat([4, 5])
[...arr, 4]          // spread — always non-mutating
arr.toSorted()       // ES2023 non-mutating sort
arr.toReversed()     // ES2023 non-mutating reverse
arr.toSpliced(1, 1)  // ES2023 non-mutating splice
arr.with(0, "z")     // ES2023 replace at index
```


## W — Why It Matters

React state mutations cause silent bugs — if you `push` to a state array and set state to the same reference, React won't re-render. Knowing which methods mutate is critical for state management in any framework.

## I — Interview Q\&A

**Q: What's the difference between `arr.push()` and `[...arr, item]`?**
A: `push` mutates the original array and returns the new length. Spread creates a new array, leaving the original unchanged. Use spread for immutable patterns (React state, Redux reducers).

**Q: What does `new Array(3)` create?**
A: A sparse array with 3 empty slots — not `[undefined, undefined, undefined]`. Calling `.map()` on it won't iterate the slots. Use `Array.from({ length: 3 })` or `.fill()` to create a truly iterable array.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating state array with `push` in React | Use `[...arr, newItem]` instead |
| `new Array(3).map(...)` doing nothing | Use `Array.from({length:3}, fn)` |
| `arr[-1]` expecting last element | Use `arr.at(-1)` |
| `arr.sort()` without comparator for numbers | Always provide a comparator: `arr.sort((a,b) => a-b)` |

## K — Coding Challenge

**Create an array of squares [^5][^6][^7][^8] without mutation:**

```js
// Starting point:
const indices = Array.from({ length: 5 }, (_, i) => i)
```

**Solution:**

```js
const squares = Array.from({ length: 5 }, (_, i) => i * i)
// [0, 1, 4, 9, 16]
// Or:
const squares2 = [...Array(5).keys()].map(i => i * i)
```


***

# 2 — Core Array Methods: `map`, `filter`, `reduce`

## T — TL;DR

These three methods cover 80% of all array transformations — `map` transforms, `filter` selects, `reduce` collapses into any shape.

## K — Key Concepts

```js
const users = [
  { name: "Alice", age: 28, role: "admin" },
  { name: "Bob",   age: 16, role: "user" },
  { name: "Carol", age: 34, role: "admin" }
]

// map — transform each element, always returns same-length array
const names = users.map(u => u.name)
// ["Alice", "Bob", "Carol"]

// filter — select elements matching a predicate
const admins = users.filter(u => u.role === "admin")
// [Alice, Carol]

// reduce — collapse to any shape (number, object, array, string)
const totalAge = users.reduce((sum, u) => sum + u.age, 0)
// 78

// Grouping with reduce
const byRole = users.reduce((acc, u) => {
  acc[u.role] = acc[u.role] || []
  acc[u.role].push(u.name)
  return acc
}, {})
// { admin: ["Alice", "Carol"], user: ["Bob"] }

// Chaining
const adminNames = users
  .filter(u => u.role === "admin")
  .map(u => u.name.toUpperCase())
// ["ALICE", "CAROL"]

// reduce as map+filter in one pass (more efficient for large arrays)
const adultAdminNames = users.reduce((acc, u) => {
  if (u.role === "admin" && u.age >= 18) acc.push(u.name)
  return acc
}, [])
```


## W — Why It Matters

`map/filter/reduce` are the backbone of data transformation in every framework. React rendering lists uses `map`, Redux selectors use `filter` and `reduce`, and virtually every API response processing pipeline chains them.

## I — Interview Q\&A

**Q: Implement `map` using `reduce`.**
A:

```js
const myMap = (arr, fn) => arr.reduce((acc, item, i) => {
  acc.push(fn(item, i, arr))
  return acc
}, [])
```

**Q: When would you use `reduce` instead of chaining `map` + `filter`?**
A: When performance matters on large arrays — a single `reduce` pass avoids creating intermediate arrays. Also when the output shape is not an array (e.g., object, number, string).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting the initial value in `reduce` | Always provide second arg: `reduce(fn, [])` or `reduce(fn, 0)` |
| `reduce` on empty array without initial value | Throws TypeError — always pass initial value |
| Using `map` for side effects only | Use `forEach` for side effects, `map` for transformations |
| Mutating `acc` in reduce with complex objects | Return the accumulator explicitly every time |

## K — Coding Challenge

**Using only `reduce`, transform this into a frequency map:**

```js
const words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
// → { apple: 3, banana: 2, cherry: 1 }
```

**Solution:**

```js
const freq = words.reduce((acc, word) => {
  acc[word] = (acc[word] || 0) + 1
  return acc
}, {})
```


***

# 3 — `find`, `findIndex`, `some`, `every`, `flat`, `flatMap`

## T — TL;DR

These methods answer questions about arrays: `find`/`findIndex` locate elements, `some`/`every` test conditions, `flat`/`flatMap` handle nested arrays.

## K — Key Concepts

```js
const items = [
  { id: 1, name: "Apple",  inStock: true  },
  { id: 2, name: "Banana", inStock: false },
  { id: 3, name: "Cherry", inStock: true  }
]

// find — first match or undefined
items.find(i => i.id === 2)       // { id:2, name:"Banana", inStock:false }
items.find(i => i.id === 99)      // undefined

// findIndex — first match index or -1
items.findIndex(i => i.id === 2)  // 1
items.findIndex(i => i.id === 99) // -1

// findLast / findLastIndex (ES2023)
[1,2,3,4].findLast(x => x % 2 === 0)  // 4

// some — true if ANY element matches (short-circuits)
items.some(i => !i.inStock)   // true (Banana is out)
items.some(i => i.id > 100)   // false

// every — true if ALL elements match (short-circuits)
items.every(i => i.inStock)   // false (Banana out of stock)
items.every(i => i.id > 0)    // true

// flat — flattens nested arrays
[1, [2, [3, [^4]]]].flat()      // [1, 2, [3, [^4]]] — one level
[1, [2, [3, [^4]]]].flat(2)     // [1, 2, 3, [^4]]
[1, [2, [3, [^4]]]].flat(Infinity)  // [1, 2, 3, 4] — fully flat

// flatMap — map then flat (1 level only), more efficient than .map().flat()
const sentences = ["Hello world", "Foo bar"]
sentences.flatMap(s => s.split(" "))
// ["Hello", "world", "Foo", "bar"]

// flatMap as filter+map in one pass
const prices = [1, -2, 3, -4, 5]
prices.flatMap(p => p > 0 ? [p * 2] : [])  // [2, 6, 10] — skip negatives
```


## W — Why It Matters

`some`/`every` short-circuit — they stop as soon as the answer is known, making them efficient for validation. `flatMap` is essential for working with APIs that return nested arrays or for operations that conditionally produce 0 or more elements per input.

## I — Interview Q\&A

**Q: What's the difference between `find` and `filter`?**
A: `filter` returns ALL matches as a new array. `find` returns the FIRST match as the element itself (not in an array), or `undefined` if none found.

**Q: When would you use `flatMap` over `map().flat()`?**
A: They produce identical results, but `flatMap` is a single pass and more performant. Also use `flatMap` when you want to conditionally return 0 or more elements per item — return `[]` to skip, `[val]` to include, `[a, b]` to expand.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `find` returning `undefined` and not handling it | Check `result !== undefined` before using |
| `flat()` only flattening one level | Use `flat(Infinity)` for arbitrary depth |
| `flatMap` flattening more than 1 level | Use `.map().flat(n)` for deeper flattening |
| Confusing `some([])` (false) vs `every([])` (true) | Empty array: `some` = `false`, `every` = `true` (vacuous truth) |

## K — Coding Challenge

**Find users with no permissions, check if any user is a superAdmin, and flatten nested permissions:**

```js
const users = [
  { name: "Alice", permissions: ["read", "write"], superAdmin: false },
  { name: "Bob",   permissions: [],                superAdmin: false },
  { name: "Carol", permissions: ["read"],          superAdmin: true  }
]
```

**Solution:**

```js
const noPerms = users.filter(u => u.permissions.length === 0)
// [Bob]

const hasSuperAdmin = users.some(u => u.superAdmin)
// true

const allPerms = users.flatMap(u => u.permissions)
// ["read", "write", "read"]
```


***

# 4 — `forEach`, `join`, `concat`, `slice`, `splice`, `includes`, `fill`, `copyWithin`

## T — TL;DR

These are the day-to-day utility methods — know which ones mutate, which return new arrays, and use `slice` over `splice` when you don't want to modify the original.

## K — Key Concepts

```js
const arr = [1, 2, 3, 4, 5]

// forEach — side effects only, returns undefined
arr.forEach((item, index) => console.log(index, item))

// join — to string with separator
[1,2,3].join(", ")    // "1, 2, 3"
[1,2,3].join("")      // "123"
[1,2,3].join()        // "1,2,3" (default comma)

// concat — merge arrays (non-mutating)
[1,2].concat([3,4], [^5])  // [1,2,3,4,5]
[1,2].concat(3, 4)        // [1,2,3,4]
[...[1,2], ...[3,4]]      // modern equivalent

// slice — extract sub-array (non-mutating)
arr.slice(1, 3)    // [2, 3] (start inclusive, end exclusive)
arr.slice(-2)      // [4, 5] (last 2 elements)
arr.slice()        // shallow copy of entire array

// splice — mutates original! removes/inserts
const a = [1,2,3,4,5]
a.splice(1, 2)          // returns [2,3], a is now [1,4,5]
a.splice(1, 0, 10, 11)  // insert at index 1, a is now [1,10,11,4,5]

// includes — simple existence check
[1,2,3].includes(2)       // true
[1,2,NaN].includes(NaN)   // true ✅ (unlike indexOf!)
[1,2,3].includes(2, 2)    // false (starts search from index 2)

// fill — mutates! fills with static value
new Array(5).fill(0)      // [0,0,0,0,0]
[1,2,3,4,5].fill(0, 1, 3) // [1,0,0,4,5] (indices 1-2)

// copyWithin — mutates! copies part of array to another position
[1,2,3,4,5].copyWithin(0, 3)  // [4,5,3,4,5] — copies [4,5] to start
```


## W — Why It Matters

`splice` vs `slice` is a classic interview gotcha. `includes(NaN)` works correctly while `indexOf(NaN)` always returns `-1` — critical for working with numeric datasets. `forEach` returning `undefined` means you can't chain it.

## I — Interview Q\&A

**Q: What's the difference between `slice` and `splice`?**
A: `slice(start, end)` returns a shallow copy of a portion, leaving the original unchanged. `splice(start, deleteCount, ...items)` modifies the original array in place, removing/replacing elements. Mnemonic: **spl**ice = **spl**it the original.

**Q: Why does `[NaN].indexOf(NaN)` return -1?**
A: `indexOf` uses strict equality (`===`), and `NaN !== NaN` by spec. Use `.includes(NaN)` which uses the SameValueZero algorithm — correctly finding `NaN`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `forEach` expecting a return value | Use `map` if you need a transformed array |
| `splice` when you meant `slice` | Remember: `splice` mutates, `slice` doesn't |
| `indexOf(NaN)` never finding NaN | Use `.includes(NaN)` instead |
| `fill` with objects filling all slots with SAME reference | `Array.from({length:3}, () => ({}))` for independent objects |

## K — Coding Challenge

**Remove duplicates from an array using only array methods (no Set):**

```js
removeDupes([1, 2, 2, 3, 1, 4])  // [1, 2, 3, 4]
```

**Solution:**

```js
const removeDupes = arr => arr.filter((item, index) => arr.indexOf(item) === index)
// Keep only the first occurrence of each element
```


***

# 5 — `keys`, `values`, `entries`, `Array.from`, `Array.of`, `Array.isArray`, `at`

## T — TL;DR

These static and instance methods bridge arrays and iterables — `Array.from` is the Swiss Army knife for converting anything iterable into an array.

## K — Key Concepts

```js
const arr = ["a", "b", "c"]

// Instance iterators — return iterators, not arrays
[...arr.keys()]     // [0, 1, 2]
[...arr.values()]   // ["a", "b", "c"]
[...arr.entries()]  // [[0,"a"], [1,"b"], [2,"c"]]

// Useful in loops
for (const [index, value] of arr.entries()) {
  console.log(index, value)
}

// Array.from — convert any iterable or array-like
Array.from("hello")                    // ["h","e","l","l","o"]
Array.from(new Set([1,2,2,3]))         // [1,2,3] — deduplicate!
Array.from(new Map([["a",1],["b",2]])) // [["a",1],["b",2]]
Array.from({length: 5}, (_, i) => i)   // [0,1,2,3,4]
Array.from(document.querySelectorAll("div"))  // NodeList → array

// Array.of — creates array from arguments (no weird behavior)
Array.of(3)         // [^3] — just an array with element 3
new Array(3)        // [empty × 3] — sparse array of length 3!

// Array.isArray
Array.isArray([])        // true
Array.isArray({})        // false
Array.isArray("string")  // false
typeof []                // "object" — useless for array detection

// at — negative indexing (ES2022)
arr.at(0)   // "a"
arr.at(-1)  // "c"
arr.at(-2)  // "b"
```


## W — Why It Matters

`Array.from` is essential when working with DOM APIs (`querySelectorAll`, `HTMLCollection`), spread-incompatible iterables, and generating test data. `Array.of` fixes the confusing `new Array()` single-number behavior.

## I — Interview Q\&A

**Q: How do you convert a `NodeList` to a real array?**
A: Three ways: `Array.from(nodeList)`, `[...nodeList]`, or `Array.prototype.slice.call(nodeList)`. The first two are idiomatic modern JS.

**Q: What's the output of `Array.from({length: 3})`?**
A: `[undefined, undefined, undefined]` — an array with 3 actual `undefined` slots (not sparse), which `.map()` WILL iterate, unlike `new Array(3)`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `new Array(5)` expecting `[^5]` | Use `Array.of(5)` or `[^5]` |
| `.map()` on a NodeList | Convert first: `Array.from(nodeList).map(...)` |
| `typeof arr === "array"` — never works | Use `Array.isArray(arr)` |
| `.entries()` returning an object | Spread or use `for...of` to consume it |

## K — Coding Challenge

**Generate a chessboard-like pattern of alternating 0s and 1s for a given size:**

```js
board(4)  // [0, 1, 0, 1]
```

**Solution:**

```js
const board = (n) => Array.from({ length: n }, (_, i) => i % 2)
```


***

# 6 — Sorting \& Comparators

## T — TL;DR

`Array.sort()` without a comparator sorts **lexicographically** (as strings), which silently breaks numeric sorting — always pass a comparator for numbers.

## K — Key Concepts

```js
// Default sort — lexicographic (converts to strings!)
[10, 1, 21, 2].sort()       // [1, 10, 2, 21] — WRONG for numbers

// Numeric sort
[10, 1, 21, 2].sort((a, b) => a - b)  // [1, 2, 10, 21] — ascending
[10, 1, 21, 2].sort((a, b) => b - a)  // [21, 10, 2, 1] — descending

// String sort — case-insensitive
["Banana","apple","Cherry"].sort()
// ["Banana","Cherry","apple"] — uppercase sorts before lowercase!

["Banana","apple","Cherry"].sort((a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase()))
// ["apple","Banana","Cherry"] ✅

// Sort objects by property
const users = [
  { name: "Carol", age: 34 },
  { name: "Alice", age: 28 },
  { name: "Bob",   age: 16 }
]
users.sort((a, b) => a.age - b.age)
// [Bob(16), Alice(28), Carol(34)]

users.sort((a, b) => a.name.localeCompare(b.name))
// [Alice, Bob, Carol]

// Multi-key sort
users.sort((a, b) =>
  a.role !== b.role
    ? a.role.localeCompare(b.role)
    : a.name.localeCompare(b.name)
)

// Comparator return rules:
// negative → a comes first
// positive → b comes first
// 0 → order unchanged (stable since ES2019)

// Non-mutating sort (ES2023)
const sorted = arr.toSorted((a, b) => a - b)  // original unchanged
```


## W — Why It Matters

The default sort bug (`[10,2,1].sort()` → `[1,10,2]`) has caused real production bugs in dashboards, financial reports, and leaderboards. `Array.sort` is stable since ES2019, making multi-key sorting reliable.

## I — Interview Q\&A

**Q: Why does `[10, 2, 1].sort()` give `[1, 10, 2]`?**
A: Without a comparator, elements are converted to strings and sorted lexicographically. `"10" < "2"` because `"1" < "2"` at the first character. Always pass `(a, b) => a - b` for numbers.

**Q: What must a comparator return?**
A: A negative number if `a` should come first, a positive number if `b` should come first, and `0` if they're equal. The `a - b` pattern works perfectly for numeric sorting.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `sort()` on numbers without comparator | Always use `(a, b) => a - b` |
| Assuming `sort` is non-mutating | Use `.toSorted()` (ES2023) or `[...arr].sort(...)` |
| String sort with mixed case | Use `.localeCompare()` |
| Returning `true`/`false` from comparator | Return a number: positive, negative, or 0 |

## K — Coding Challenge

**Sort these products by price ascending, then by name alphabetically for ties:**

```js
const products = [
  { name: "Banana", price: 1.5 },
  { name: "Apple",  price: 1.5 },
  { name: "Cherry", price: 3.0 }
]
```

**Solution:**

```js
const sorted = [...products].sort((a, b) =>
  a.price !== b.price
    ? a.price - b.price
    : a.name.localeCompare(b.name)
)
// [Apple(1.5), Banana(1.5), Cherry(3.0)]
```


***

# 7 — Object Literals, Shorthand \& Computed Property Names

## T — TL;DR

Modern object literal syntax eliminates boilerplate with property shorthand, method shorthand, and computed keys — making object construction expressive and concise.

## K — Key Concepts

```js
const name = "Alice"
const age = 28
const role = "admin"

// Property shorthand — variable name becomes key
const user = { name, age, role }
// equivalent to { name: name, age: age, role: role }

// Method shorthand
const obj = {
  greet() { return `Hi, I'm ${this.name}` },  // ✅ shorthand
  // greet: function() { ... }                // ❌ verbose old style
  get fullName() { return `${this.first} ${this.last}` },  // getter
  set fullName(val) { [this.first, this.last] = val.split(" ") } // setter
}

// Computed property names — dynamic keys
const key = "score"
const prefix = "user_"

const stats = {
  [key]: 100,               // { score: 100 }
  [`${prefix}id`]: 42,      // { user_id: 42 }
  [Symbol.iterator]() { }  // symbol as key
}

// Dynamic key from variable
function createField(fieldName, value) {
  return { [fieldName]: value }  // critical pattern!
}
createField("email", "alice@example.com")
// { email: "alice@example.com" }

// Spread in objects (ES2018)
const defaults = { theme: "light", lang: "en" }
const settings = { ...defaults, lang: "fr" }
// { theme: "light", lang: "fr" } — later keys win
```


## W — Why It Matters

Property shorthand and computed keys are used constantly in React (dynamic state updates, component props), Redux (action creators), and API serialization. They reduce boilerplate and signal intent clearly.

## I — Interview Q\&A

**Q: What are computed property names and when do you use them?**
A: They allow dynamic key names in object literals using bracket syntax: `{ [expression]: value }`. Use them when the key comes from a variable, is dynamic (e.g. user input), or is a Symbol.

**Q: What does `{ name, age }` mean as an object literal?**
A: Property shorthand — creates `{ name: name, age: age }`. The variable name becomes both the key and the value source.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `obj = { name: name, age: age }` verbosity | Use shorthand: `{ name, age }` |
| Computed key with expression not in brackets | Always wrap: `{ [expr]: val }` |
| Spread overwrite order confusion | Later spreads overwrite earlier keys |
| Using shorthand when variable and key should differ | Use explicit: `{ displayName: name }` |

## K — Coding Challenge

**Build a function that creates a Redux-style action using shorthand and computed keys:**

```js
createAction("SET_USER", { id: 1, name: "Alice" })
// → { type: "SET_USER", payload: { id: 1, name: "Alice" } }
```

**Solution:**

```js
const createAction = (type, payload) => ({ type, payload })
```


***

# 8 — `Object.keys`, `values`, `entries`, `assign`, `freeze`, `seal`

## T — TL;DR

These static methods let you iterate, copy, and lock objects — `freeze` prevents all changes, `seal` prevents adding/deleting but allows value updates.

## K — Key Concepts

```js
const user = { name: "Alice", age: 28, role: "admin" }

// Iterating
Object.keys(user)     // ["name", "age", "role"]
Object.values(user)   // ["Alice", 28, "admin"]
Object.entries(user)  // [["name","Alice"],["age",28],["role","admin"]]

// Iterating with for...of
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`)
}

// Object.assign — shallow merge (mutates target!)
const target = { a: 1 }
const result = Object.assign(target, { b: 2 }, { c: 3 })
// target = { a:1, b:2, c:3 }, result === target ✅

// Non-mutating merge (use spread instead)
const merged = { ...user, age: 29 }  // preferred modern way

// Object.freeze — shallow immutability
const config = Object.freeze({ host: "localhost", port: 3000 })
config.port = 9000     // silently fails (throws in strict mode)
config.port            // still 3000
// ⚠️ Shallow — nested objects are NOT frozen:
const obj = Object.freeze({ nested: { val: 1 } })
obj.nested.val = 99    // ✅ works — nested not frozen!

// Object.seal — no add/delete, but values CAN change
const sealed = Object.seal({ name: "Alice", age: 28 })
sealed.age = 30        // ✅ allowed
sealed.email = "..."   // ❌ silently fails
delete sealed.name     // ❌ silently fails

// Check state
Object.isFrozen(config)  // true
Object.isSealed(sealed)  // true
```

| Method | Add props? | Delete props? | Change values? |
| :-- | :-- | :-- | :-- |
| `freeze` | ❌ | ❌ | ❌ |
| `seal` | ❌ | ❌ | ✅ |
| Normal object | ✅ | ✅ | ✅ |

## W — Why It Matters

`Object.freeze` is used for config objects, action type constants, and preventing accidental mutations in tests. `Object.assign` appears in older codebases for merging — modern code uses spread. Both are common interview topics.

## I — Interview Q\&A

**Q: What's the difference between `Object.freeze` and `const`?**
A: `const` prevents reassigning the variable binding. `Object.freeze` prevents modifying the object's properties. You can mutate a `const` object; you can reassign a `let` frozen object reference.

**Q: Is `Object.freeze` deep?**
A: No — it's shallow. Only the top-level properties are frozen. Nested objects remain mutable. For deep freeze, recursively call `Object.freeze` on all nested objects. [^9]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `Object.assign({}, a, b)` being verbose | Use `{ ...a, ...b }` |
| Expecting `freeze` to protect nested objects | Deep freeze recursively or use immutable libraries |
| `Object.assign` mutation of target | Pass `{}` as first arg: `Object.assign({}, source)` |
| Assuming `freeze` throws in sloppy mode | It fails silently — use strict mode |

## K — Coding Challenge

**Write a `deepFreeze` utility:**

```js
const obj = deepFreeze({ a: 1, b: { c: 2 } })
obj.b.c = 99  // should fail silently or throw in strict mode
```

**Solution:**

```js
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      deepFreeze(obj[key])
    }
  })
  return Object.freeze(obj)
}
```


***

# 9 — `Object.create`, `defineProperty`, `getOwnPropertyDescriptor`, `fromEntries`, `hasOwn`

## T — TL;DR

These lower-level methods give you precise control over property descriptors, prototype chains, and safe own-property checks — used in libraries, frameworks, and polyfills.

## K — Key Concepts

```js
// Object.create — set prototype explicitly
const animal = {
  speak() { return `${this.name} makes a sound` }
}
const dog = Object.create(animal)
dog.name = "Rex"
dog.speak()  // "Rex makes a sound"

// Object.create(null) — truly empty object (no prototype)
const map = Object.create(null)  // no .toString, .hasOwnProperty etc.
map["key"] = "value"             // safe as a pure hash map

// Object.defineProperty — precise property control
const obj = {}
Object.defineProperty(obj, "id", {
  value: 42,
  writable: false,     // cannot reassign
  enumerable: false,   // won't appear in for...in or Object.keys()
  configurable: false  // cannot be redefined or deleted
})
obj.id = 99     // silently fails (throws in strict mode)
obj.id          // 42
Object.keys(obj) // [] — id is non-enumerable!

// getOwnPropertyDescriptor — inspect a property's descriptor
Object.getOwnPropertyDescriptor(obj, "id")
// { value: 42, writable: false, enumerable: false, configurable: false }

// Object.fromEntries — inverse of Object.entries (ES2019)
const entries = [["name", "Alice"], ["age", 28]]
Object.fromEntries(entries)  // { name: "Alice", age: 28 }

// Transform an object's values (classic pattern)
const prices = { apple: 1.5, banana: 0.9, cherry: 3.0 }
const doubled = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 2])
)
// { apple: 3, banana: 1.8, cherry: 6 }

// Object.hasOwn — safe own property check (ES2022)
const obj2 = Object.create({ inherited: true })
obj2.own = true

Object.hasOwn(obj2, "own")        // true
Object.hasOwn(obj2, "inherited")  // false ← only own properties
"inherited" in obj2               // true  ← includes prototype chain

// Why not hasOwnProperty?
const unsafe = Object.create(null)
// unsafe.hasOwnProperty("x")  // ❌ TypeError — no prototype!
Object.hasOwn(unsafe, "x")      // ✅ always safe
```


## W — Why It Matters

`Object.defineProperty` is how Vue 2's reactivity system worked. `Object.create(null)` is used for performance-critical hash maps. `Object.hasOwn` replaced `hasOwnProperty` as the safe modern alternative. `fromEntries` is essential for transforming objects via the `entries → map → fromEntries` pipeline. [^3][^10]

## I — Interview Q\&A

**Q: Why use `Object.hasOwn` instead of `obj.hasOwnProperty()`?**
A: `obj.hasOwnProperty()` fails if the object was created with `Object.create(null)` (no prototype). It can also be overridden. `Object.hasOwn()` is a static method that always works safely. [^3]

**Q: What is an enumerable property?**
A: An enumerable property shows up in `for...in` loops and `Object.keys()`. Properties added normally are enumerable by default. Properties defined with `defineProperty({enumerable: false})` are hidden from iteration but still accessible directly.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `hasOwnProperty` on null-prototype objects | Use `Object.hasOwn()` always |
| Forgetting `fromEntries` after `entries().map()` | Complete the pipeline: `Object.fromEntries(Object.entries(obj).map(...))` |
| Non-enumerable props disappearing from logs | They still exist — access directly or use `getOwnPropertyDescriptor` |
| `Object.create(null)` missing expected methods | It's intentional — add only what you need |

## K — Coding Challenge

**Transform an object, doubling all numeric values, using the entries pipeline:**

```js
const scores = { alice: 10, bob: 20, carol: 15 }
// → { alice: 20, bob: 40, carol: 30 }
```

**Solution:**

```js
const doubled = Object.fromEntries(
  Object.entries(scores).map(([name, score]) => [name, score * 2])
)
```


***

# 10 — Destructuring \& Spread/Rest in Objects

## T — TL;DR

Destructuring extracts values from objects in one line; spread clones/merges objects; rest collects remaining properties — together they replace most manual property access.

## K — Key Concepts

```js
const user = { name: "Alice", age: 28, role: "admin", city: "NYC" }

// Basic destructuring
const { name, age } = user

// Rename on extraction
const { name: username, age: years } = user
// username = "Alice", years = 28

// Default values
const { name, status = "active" } = user
// status = "active" (not in user)

// Nested destructuring
const { address: { city, zip = "00000" } = {} } = user
// Always provide fallback for nested: `= {}` prevents crash if address is undefined

// Rest in destructuring — collects remaining
const { role, ...rest } = user
// role = "admin", rest = { name:"Alice", age:28, city:"NYC" }

// In function parameters — very common pattern
function greet({ name, age = 0, role = "user" } = {}) {
  return `${name} (${role}), age ${age}`
}
greet(user)  // "Alice (admin), age 28"
greet()      // works! default `= {}` prevents crash on no arg

// Spread — shallow clone / merge
const clone = { ...user }                  // shallow copy
const updated = { ...user, age: 29 }       // override one field
const merged = { ...defaults, ...user }    // merge (user wins)

// Spread order matters — later wins
const a = { x: 1, y: 2 }
const b = { y: 3, z: 4 }
{ ...a, ...b }  // { x:1, y:3, z:4 } — b.y overrides a.y
{ ...b, ...a }  // { x:1, y:2, z:4 } — a.y overrides b.y

// Computed keys in destructuring
const key = "name"
const { [key]: extractedName } = user  // extractedName = "Alice"
```


## W — Why It Matters

Destructuring in function parameters is universal in React (props destructuring), Express (req destructuring), and API response parsing. Rest/spread is the standard way to do immutable object updates in Redux reducers.

## I — Interview Q\&A

**Q: How do you avoid a crash when destructuring a potentially undefined object?**
A: Provide a default for the whole object: `const { a, b } = obj || {}` or use a parameter default: `function fn({ a, b } = {}) {}`. This prevents `Cannot destructure property 'a' of undefined`.

**Q: What's the difference between object rest and array rest?**
A: Object rest collects remaining **named** properties: `const { a, ...rest } = obj`. Array rest collects remaining **indexed** elements: `const [first, ...others] = arr`. Both create shallow copies of the collected items.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Destructuring `null` or `undefined` | Guard: `const { a } = val ?? {}` |
| Nested destructure crashing on missing parent | Provide default: `{ a: { b } = {} }` |
| Spread doing deep copy | Spread is SHALLOW — use `structuredClone` for deep |
| Forgetting rename syntax `{ x: newName }` | It's `key: variableName`, not `newName: key` |

## K — Coding Challenge

**Extract `name`, rename `role` to `userRole`, get remaining fields, and set a default for `status`:**

```js
const user = { name: "Alice", role: "admin", age: 28 }
```

**Solution:**

```js
const { name, role: userRole, status = "active", ...remaining } = user
// name = "Alice"
// userRole = "admin"
// status = "active" (default)
// remaining = { age: 28 }
```


***

# 11 — Shallow Copy vs Deep Copy \& `structuredClone`

## T — TL;DR

Shallow copy duplicates only the top level — nested objects are still shared references. `structuredClone` is the modern way to deep copy, handling `Date`, `Map`, `Set`, and circular references. [^2]

## K — Key Concepts

```js
// Shallow copy — nested objects still shared
const original = { name: "Alice", address: { city: "NYC" } }

const shallow1 = { ...original }
const shallow2 = Object.assign({}, original)
const shallow3 = original.address  // reference, not copy

shallow1.address.city = "LA"
console.log(original.address.city)  // "LA" — shared reference!

// Deep copy options:

// 1. JSON (limited — loses Date, Map, Set, undefined, functions, Infinity)
const jsonCopy = JSON.parse(JSON.stringify(original))
// ✅ simple  ❌ drops special types

// 2. structuredClone (modern, recommended) [web:34]
const deep = structuredClone(original)
deep.address.city = "Chicago"
original.address.city  // still "NYC" ✅

// structuredClone supports:
const richObj = {
  date: new Date(),         // ✅ preserved as Date
  map: new Map([[1, "a"]]), // ✅ preserved as Map
  set: new Set([1, 2, 3]),  // ✅ preserved as Set
  arr: [1, [2, 3]]          // ✅ deep copied
}
const cloned = structuredClone(richObj)

// structuredClone with circular references
const circ = { name: "Node" }
circ.self = circ   // circular reference
const circClone = structuredClone(circ)  // ✅ no crash!
circClone.self === circClone             // true — preserved

// structuredClone limitations
const withFn = { fn: () => 42 }
structuredClone(withFn)  // ❌ DataCloneError — functions not cloneable

// What JSON.stringify loses
JSON.stringify({
  a: undefined,     // key dropped
  b: NaN,           // → null
  c: Infinity,      // → null
  d: new Date(),    // → string
  e: new Map(),     // → {}
  f: /regex/        // → {}
})
```

| Method | Nested objects | Date | Map/Set | Circular | Functions |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `{...obj}` | ❌ Shallow | ✅ | ✅ | ✅ | ✅ |
| `JSON.parse/stringify` | ✅ Deep | ❌→string | ❌→{} | ❌ crash | ❌ dropped |
| `structuredClone` | ✅ Deep | ✅ | ✅ | ✅ | ❌ error |

## W — Why It Matters

Shallow copy bugs are one of the most common React/Redux bugs — updating nested state in place causes silent rendering failures. `structuredClone` (available in Node 17+ and all modern browsers) replaces the fragile `JSON.parse/stringify` pattern for most use cases. [^9][^2]

## I — Interview Q\&A

**Q: What does `structuredClone` handle that `JSON.parse(JSON.stringify())` doesn't?**
A: `structuredClone` preserves `Date` objects as Dates (not strings), copies `Map`/`Set` correctly, handles circular references without crashing, and preserves `undefined`, `NaN`, and `Infinity`. [^1][^2]

**Q: Can `structuredClone` clone functions?**
A: No — it throws a `DataCloneError`. Functions are not part of the Structured Clone Algorithm. Use libraries like Lodash's `_.cloneDeep` if you need to copy objects with functions. [^11]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `{...obj}` for deep copy of nested objects | Use `structuredClone(obj)` |
| `JSON.stringify` on objects with `Date` values | Use `structuredClone` — Date preserved correctly |
| `structuredClone` on objects with functions | Use Lodash `_.cloneDeep` or omit functions |
| Assuming spread on arrays is deep | `[...arr]` is shallow — nested arrays still shared |

## K — Coding Challenge

**Demonstrate the shallow copy trap and fix it:**

```js
const state = { user: { name: "Alice", prefs: { theme: "dark" } } }
// "Update" the theme without affecting original
```

**Solution:**

```js
// ❌ Bug: shallow copy
const bad = { ...state }
bad.user.prefs.theme = "light"
state.user.prefs.theme  // "light" — original mutated!

// ✅ Fix: structuredClone
const good = structuredClone(state)
good.user.prefs.theme = "light"
state.user.prefs.theme  // "dark" — original safe ✅
```


***

# 12 — `JSON.parse` / `JSON.stringify` with Replacer \& Reviver

## T — TL;DR

`JSON.stringify` has a `replacer` to control what's serialized; `JSON.parse` has a `reviver` to transform values on the way back in — together they enable custom serialization.

## K — Key Concepts

```js
const data = {
  name: "Alice",
  age: 28,
  password: "secret123",
  created: new Date("2024-01-15"),
  score: undefined
}

// Basic stringify
JSON.stringify(data)
// {"name":"Alice","age":28,"created":"2024-01-15T00:00:00.000Z"}
// ↑ password shown, created is string, undefined dropped

// Replacer — filter or transform keys
JSON.stringify(data, ["name", "age"])
// {"name":"Alice","age":28} — only whitelisted keys

JSON.stringify(data, (key, value) => {
  if (key === "password") return undefined  // omit sensitive field
  return value
})
// {"name":"Alice","age":28,"created":"2024-01-15T00:00:00.000Z"}

// Pretty print
JSON.stringify(data, null, 2)  // 2-space indentation

// Replacer to serialize Map/undefined/custom
JSON.stringify({ a: undefined, b: NaN, c: Infinity })
// {"b":null,"c":null}  — undefined dropped, NaN/Infinity → null

// Reviver — transform on parse
const json = '{"name":"Alice","created":"2024-01-15T00:00:00.000Z","age":28}'

JSON.parse(json, (key, value) => {
  if (key === "created") return new Date(value)  // restore Date!
  return value
})
// { name: "Alice", created: Date object, age: 28 }

// Custom toJSON — control how an object serializes itself
class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }
  toJSON() {
    return `${this.amount} ${this.currency}`  // custom serialization
  }
}
JSON.stringify({ price: new Money(9.99, "USD") })
// {"price":"9.99 USD"}
```


## W — Why It Matters

`JSON.stringify` with a replacer is the correct way to strip sensitive fields (passwords, tokens) before logging. The reviver is essential for deserializing API responses that contain dates as strings. `toJSON` is how classes define their serialization behavior.

## I — Interview Q\&A

**Q: How do you preserve `Date` objects through JSON serialization?**
A: Use a `reviver` function in `JSON.parse` to detect ISO date strings and convert them back: `if (isDateString(value)) return new Date(value)`. Or use `structuredClone` if you're just copying in-memory (no serialization needed).

**Q: What values does `JSON.stringify` silently drop or transform?**
A: Drops `undefined`, functions, and Symbols. Converts `NaN`/`Infinity` to `null`. Converts `Date` to ISO string. Converts `Map`/`Set` to `{}`. [^9]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `JSON.parse` throwing on malformed JSON | Wrap in `try/catch` always |
| `JSON.stringify` logging passwords | Use replacer to omit sensitive keys |
| `Date` becoming a string after JSON roundtrip | Use reviver to restore: `new Date(value)` |
| `JSON.stringify` on circular object crashing | Use `structuredClone` or a custom replacer |

## K — Coding Challenge

**Write a safe JSON serializer that omits `password` and `token` fields:**

```js
const safeStringify = (obj) => { /* ... */ }
safeStringify({ user: "Alice", password: "123", token: "abc" })
// '{"user":"Alice"}'
```

**Solution:**

```js
const SENSITIVE = new Set(["password", "token", "secret", "apiKey"])

const safeStringify = (obj, indent = 0) =>
  JSON.stringify(obj, (key, value) =>
    SENSITIVE.has(key) ? undefined : value, indent)
```


***

# 13 — Regex: Literals, `RegExp` Constructor, Flags

## T — TL;DR

Use regex literals (`/pattern/flags`) for static patterns and `RegExp` constructor for dynamic patterns — flags control matching behavior globally, case-insensitively, and across newlines.

## K — Key Concepts

```js
// Regex literal — compiled at parse time
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /\d{3}-\d{3}-\d{4}/

// RegExp constructor — dynamic patterns
const term = "hello"
const dynamic = new RegExp(term, "gi")  // must escape special chars!
const escaped = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")

// Flags
const str = "Hello World\nHello JS"
/hello/i.test(str)         // true  — i: case-insensitive
/hello/gi                  // g: global (find ALL matches, not just first)
/^hello/m.test(str)        // true  — m: multiline (^ matches each line start)
/hello.world/s.test(str)   // false — s: dotAll (. matches newline too)
/\p{Emoji}/u.test("🎉")   // true  — u: unicode (enable Unicode property escapes)
/hello/gi.test(str)        // i + g together

// Flags summary
// g — global: find all matches
// i — case-insensitive
// m — multiline: ^ and $ match line start/end
// s — dotAll: . matches \n
// u — unicode: full Unicode support
// d — indices: provide match indices (ES2022)
// v — unicodeSets: enhanced Unicode (ES2024)

// Testing
emailRegex.test("alice@example.com")  // true
emailRegex.test("not-an-email")        // false

// ⚠️ Stateful regex with /g flag
const re = /hi/g
re.test("hi there")  // true  — lastIndex = 2
re.test("hi there")  // false — starts from lastIndex 2, not 0!
re.lastIndex = 0      // reset manually if reusing
```


## W — Why It Matters

The `lastIndex` statefulness bug with `/g` regex has caused production bugs where the same regex object alternates between `true` and `false`. Using the `RegExp` constructor is essential for user-provided search terms, but forgetting to escape metacharacters causes crashes.

## I — Interview Q\&A

**Q: When should you use the `RegExp` constructor instead of a literal?**
A: When the pattern is dynamic — built from variables or user input. Literals are parsed at compile time; the constructor builds the regex at runtime. Always escape special chars in dynamic patterns.

**Q: What's the `s` (dotAll) flag?**
A: By default, `.` doesn't match newlines. The `s` flag makes `.` match any character including `\n`. Useful for matching across line breaks in multiline strings.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Reusing `/g` regex object — alternating true/false | Reset `re.lastIndex = 0` or create a fresh regex each time |
| Unescaped user input in `new RegExp()` | Escape: `str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` |
| Assuming `/pattern/` and `new RegExp("pattern")` are identical | In literals, no extra escaping needed; in strings, double-escape: `\\d` |
| `\d` in string-based constructor not working | Use `"\\d"` in the string: `new RegExp("\\d+")` |

## K — Coding Challenge

**Build a dynamic regex that finds a user-supplied word in a string, case-insensitively:**

```js
findWord("hello world Hello", "hello")  // ["hello", "Hello"]
```

**Solution:**

```js
function findWord(str, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`\\b${escaped}\\b`, "gi")
  return str.match(re) || []
}
```


***

# 14 — `test`, `match`, `matchAll`, `replace`, `replaceAll`, Named Groups

## T — TL;DR

`test` checks existence, `match` extracts results, `matchAll` gets all matches with capture groups, and named groups make complex patterns readable and self-documenting. [^4][^12]

## K — Key Concepts

```js
const log = "2024-01-15 ERROR User not found; 2024-01-16 INFO Server started"

// test — boolean check only
/ERROR/.test(log)   // true

// match — returns first match (or all with /g)
"hello world".match(/\w+/)    // ["hello"] + index, input metadata
"hello world".match(/\w+/g)   // ["hello", "world"] — with /g, array of strings only

// matchAll — all matches WITH capture groups (requires /g)
const dateRe = /(\d{4})-(\d{2})-(\d{2})/g
const matches = [...log.matchAll(dateRe)]
// matches[^0] = ["2024-01-15", "2024", "01", "15", index: 0, ...]
// matches[^1] = ["2024-01-16", "2024", "01", "16", ...]

// Named capture groups (?<name>...) — ES2018 [web:39]
const dateNamedRe = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/g

for (const match of log.matchAll(dateNamedRe)) {
  const { year, month, day } = match.groups
  console.log(`Year: ${year}, Month: ${month}, Day: ${day}`)
}

// replace with function
"hello world".replace(/\w+/g, word => word.toUpperCase())
// "HELLO WORLD"

// replace with named group backreference
"2024-01-15".replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  "$<month>/$<day>/$<year>"    // reorder using named groups!
)
// "01/15/2024"

// replaceAll — string or regex
"hello hello hello".replaceAll("hello", "hi")  // "hi hi hi"
// replaceAll with regex requires /g flag
"aababc".replaceAll(/a/g, "x")  // "xxbxbc"

// Practical: parse key=value pairs
const config = "host=localhost port=3000 debug=true"
const parsed = Object.fromEntries(
  [...config.matchAll(/(?<key>\w+)=(?<val>\w+)/g)]
    .map(m => [m.groups.key, m.groups.val])
)
// { host: "localhost", port: "3000", debug: "true" }
```


## W — Why It Matters

`matchAll` with named groups replaced many verbose parser utilities. Named groups (`?<name>`) make complex patterns self-documenting and allow reordering in replacements — critical for date format conversion, log parsing, and template processing. [^4][^13]

## I — Interview Q\&A

**Q: What's the difference between `match` and `matchAll`?**
A: `match` with `/g` returns a flat array of matched strings — no capture group data. `matchAll` returns an iterator of full match objects including all capture groups, indices, and named groups for every match. [^12]

**Q: What are named capture groups?**

```
A: `(?<name>pattern)` assigns a name to a capture group. The match is accessible via `match.groups.name` instead of a numeric index. They can also be used in replacements as `$<name>`. Makes patterns readable and resistant to refactoring bugs. [^4]
```


## C — Common Pitfills

| Pitfall | Fix |
| :-- | :-- |
| `match(/g pattern/)` losing capture groups | Use `matchAll` to get capture groups for all matches |
| `matchAll` without `/g` flag | Throws TypeError — `matchAll` requires global flag |
| `match` returning `null` (no match) | Always guard: `str.match(re) ?? []` or check `!== null` |
| Numbered groups breaking after regex edit | Use named groups `(?<name>...)` for resilience |

## K — Coding Challenge

**Parse this log line into a structured object using named groups:**

```js
const line = "[2024-01-15 14:32:01] ERROR AuthService: Token expired"
// → { date: "2024-01-15", time: "14:32:01", level: "ERROR", service: "AuthService", message: "Token expired" }
```

**Solution:**

```js
const re = /\[(?<date>\d{4}-\d{2}-\d{2}) (?<time>[\d:]+)\] (?<level>\w+) (?<service>\w+): (?<message>.+)/
const match = line.match(re)
const result = match?.groups ?? {}
// { date: "2024-01-15", time: "14:32:01", level: "ERROR", service: "AuthService", message: "Token expired" }
```


***

> ✅ **Day 3 complete.**
> Your tiny next action: open your terminal and write the `Object.fromEntries(Object.entries(obj).map(...))` pattern from memory. It will appear in more interviews than you expect.
<span style="display:none">[^14][^15][^16][^17][^18][^19]</span>

<div align="center">⁂</div>

[^1]: https://stackoverflow.com/questions/78710886/js-structuredclone-not-truly-deep-copy

[^2]: https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone

[^3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn

[^4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group

[^5]: https://nodejs.org/learn/getting-started/introduction-to-nodejs

[^6]: https://www.youtube.com/watch?v=f2EqECiTBL8

[^7]: https://namastedev.com/blog/javascript-type-coercion-explained/

[^8]: https://www.theodinproject.com/lessons/node-path-javascript-factory-functions-and-the-module-pattern

[^9]: https://dev.to/shantih_palani/structuredclone-the-deep-copy-hero-javascript-deserved-2add

[^10]: https://dev.to/sushil-kumar/deep-dive-objecthasown-your-safer-hasownproperty-alternative-3mdk

[^11]: https://www.crio.do/blog/deep-cloning-object-in-javascript-2025-crio

[^12]: https://javascript.info/regexp-groups

[^13]: https://www.bennadel.com/blog/3508-playing-with-regexp-named-capture-groups-in-node-10.htm

[^14]: https://www.codecademy.com/resources/docs/javascript/window/structuredClone

[^15]: https://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression

[^16]: https://www.youtube.com/watch?v=WLuEXwQiqac

[^17]: https://blog.devgenius.io/mastering-javascript-️object-cloning-a-deep-dive-into-deep-copy-methods-and-circular-references-7c8df5462582

[^18]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty

[^19]: https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets/js/s/deep-clone-structured-clone.md

