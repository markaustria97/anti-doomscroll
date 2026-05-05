# 13 — `Math` Object & `Date` Basics

## T — TL;DR

`Math` provides stateless math utilities; `Date` is mutable and timezone-tricky — always use timestamps (`Date.now()`) for comparisons.

## K — Key Concepts

```js
// Math essentials
Math.round(4.5)       // 5
Math.floor(4.9)       // 4
Math.ceil(4.1)        // 5
Math.trunc(-4.9)      // -4 (just removes decimal)
Math.abs(-5)          // 5
Math.max(1, 2, 3)     // 3
Math.min(1, 2, 3)     // 1
Math.pow(2, 10)       // 1024
Math.sqrt(16)         // 4
Math.random()         // [0, 1)

// Random int in range [min, max]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Date
const now = new Date()
Date.now()                        // milliseconds since Unix epoch (use for comparisons!)

const d = new Date("2024-01-15")  // ⚠️ Parsed as UTC midnight
const d2 = new Date(2024, 0, 15)  // ✅ Local time (month is 0-indexed!)

d.getFullYear()    // 2024
d.getMonth()       // 0 (January!) — 0-indexed, classic gotcha
d.getDate()        // 15
d.getTime()        // ms since epoch

// Timestamp comparison (safe)
const start = Date.now()
// ... work
const elapsed = Date.now() - start  // ms elapsed
```


## W — Why It Matters

`Date` parsing is notoriously inconsistent across browsers. Strings like `"2024-01-15"` parse as UTC but `"01/15/2024"` parses as local time — this causes off-by-one-day bugs in scheduling apps. For serious date work, use `Temporal` (Stage 3) or a library like `date-fns`.

## I — Interview Q&A

**Q: What's wrong with `new Date("2024-01-15")`?**
A: ISO date strings (YYYY-MM-DD) are parsed as UTC midnight. If your user is UTC-8, `new Date("2024-01-15").getDate()` returns `14` — the previous day. Pass year/month/day as integers to the constructor for local time.

**Q: How do you get a random integer between 1 and 6?**
A: `Math.floor(Math.random() * 6) + 1`

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `new Date().getMonth()` expecting `1` for Jan | It returns `0` — months are 0-indexed |
| Comparing dates with `==` or `===` | Compare `.getTime()` or use `Date.now()` differences |
| Parsing date strings directly | Use constructor with integers or a library |

## K — Coding Challenge

**Write a function that returns true if a date is in the past:**

```js
isPast(new Date("2020-01-01"))  // true
isPast(new Date("2099-01-01"))  // false
```

**Solution:**

```js
const isPast = (date) => date.getTime() < Date.now()
```


***
