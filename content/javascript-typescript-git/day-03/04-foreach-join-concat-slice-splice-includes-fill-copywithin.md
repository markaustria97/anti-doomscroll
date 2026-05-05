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

## I — Interview Q&A

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
