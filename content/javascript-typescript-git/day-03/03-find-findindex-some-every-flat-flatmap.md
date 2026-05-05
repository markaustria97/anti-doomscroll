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

## I — Interview Q&A

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
