# 16 — Loops: `for`, `while`, `for...of`, `for...in`, `break`/`continue`

## T — TL;DR

Use `for...of` for iterables, avoid `for...in` on arrays, and prefer `break`/`continue` over complex flag variables for loop control.

## K — Key Concepts

```js
// Classic for
for (let i = 0; i < 5; i++) { ... }

// while / do-while
while (condition) { ... }
do { ... } while (condition)  // always runs once

// for...of — iterables (arrays, strings, Maps, Sets)
for (const item of ["a", "b", "c"]) console.log(item)
for (const char of "hello") console.log(char)
for (const [key, val] of new Map([["a", 1]])) console.log(key, val)

// for...in — object keys (enumerable properties)
const obj = { a: 1, b: 2 }
for (const key in obj) console.log(key, obj[key])
// ⚠️ Also iterates inherited properties — use hasOwnProperty or Object.keys()

// break / continue
for (let i = 0; i < 10; i++) {
  if (i === 3) continue  // skip 3
  if (i === 7) break     // stop at 7
  console.log(i)         // 0,1,2,4,5,6
}

// Labeled break — rare but useful for nested loops
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) break outer  // exits BOTH loops
  }
}
```

## W — Why It Matters

`for...in` on arrays is a classic bug — it can iterate prototype chain properties and doesn't guarantee order. `for...of` is the correct modern choice for arrays. Labeled breaks are rarely needed but appear in coding interview problems.

## I — Interview Q&A

**Q: Why shouldn't you use `for...in` to iterate arrays?**
A: `for...in` iterates all enumerable properties including inherited ones. Array indices are returned as strings, and if any code adds properties to `Array.prototype`, those appear too. Use `for...of` or `Array.forEach`.

**Q: What's the difference between `break` and `continue`?**
A: `break` exits the entire loop. `continue` skips the current iteration and proceeds to the next one.

## C — Common Pitfalls

| Pitfall                                    | Fix                                                              |
| :----------------------------------------- | :--------------------------------------------------------------- |
| `for...in` on arrays                       | Use `for...of` or `arr.forEach`                                  |
| `for...of` on a plain object               | Use `Object.keys(obj)`, `Object.values()`, or `Object.entries()` |
| Infinite `while` loop                      | Ensure loop variable updates inside the body                     |
| `for...in` picking up prototype properties | Check `obj.hasOwnProperty(key)` or use `Object.keys()`           |

## K — Coding Challenge

**Find the first number in an array divisible by both 3 and 5. Return early:**

```js
findFirst([1, 9, 10, 15, 30]); // → 15
```

**Solution:**

```js
function findFirst(arr) {
  for (const n of arr) {
    if (n % 3 === 0 && n % 5 === 0) return n;
  }
  return null;
}
```
