# 4 — String Methods

## T — TL;DR

JavaScript strings are immutable sequences of characters with a rich set of methods for searching, slicing, transforming, and padding — none of them mutate the original string.

## K — Key Concepts

### Extraction

```js
const str = "Hello, World!"

str.slice(0, 5)    // "Hello" — start to end (exclusive)
str.slice(7)       // "World!" — from index 7 to end
str.slice(-6)      // "orld!" — from 6 chars before end... wait
str.slice(-6)      // "orld!" — actually let me recalculate
// str = "Hello, World!" (length 13)
// slice(-6) → slice(13-6) = slice(7) → "World!"
str.slice(-6)      // "orld!" — slice(13-6=7) → "World!" 
// Actually: "Hello, World!".slice(-6) → starts at index 7 → "orld!"
// Hmm, length=13, -6 → index 7: "W-o-r-l-d-!" that's 6 chars → "World!"
str.slice(-6)      // "World!"
```

Let me be precise:

```js
const str = "Hello, World!"
// Indices: H(0) e(1) l(2) l(3) o(4) ,(5) (6) W(7) o(8) r(9) l(10) d(11) !(12)
// Length: 13

str.slice(0, 5)   // "Hello"
str.slice(7)      // "World!"
str.slice(-6)     // "orld!" — starts at index 13-6=7... 
// Wait: index 7 is 'W', and from 7 to end is "World!" (6 chars). So slice(-6) = "World!"
str.slice(-6)     // "World!"
str.slice(0, -1)  // "Hello, World" — everything except last char
```

### Searching

```js
const str = "Hello, World!"

str.includes("World")   // true
str.includes("world")   // false — case-sensitive
str.startsWith("Hello") // true
str.endsWith("!")        // true

str.indexOf("o")        // 4 — first occurrence
str.lastIndexOf("o")    // 8 — last occurrence
str.indexOf("xyz")      // -1 — not found
```

### Transformation

```js
// Case
"hello".toUpperCase() // "HELLO"
"HELLO".toLowerCase() // "hello"

// Trimming
"  hello  ".trim()      // "hello"
"  hello  ".trimStart() // "hello  "
"  hello  ".trimEnd()   // "  hello"

// Replacing
"hello world".replace("world", "JS")     // "hello JS" — first match only
"aabbcc".replace("a", "x")               // "xabbcc" — first match only
"aabbcc".replaceAll("a", "x")            // "xxbbcc" — all matches

// With regex
"hello world".replace(/o/g, "0")         // "hell0 w0rld"
```

### Splitting and Joining

```js
"a,b,c".split(",")          // ["a", "b", "c"]
"hello".split("")            // ["h", "e", "l", "l", "o"]
"hello world foo".split(" ", 2) // ["hello", "world"] — limit

["a", "b", "c"].join(",")   // "a,b,c"
["a", "b", "c"].join(" - ") // "a - b - c"
["a", "b", "c"].join("")    // "abc"
```

### Padding

```js
"5".padStart(3, "0")    // "005"
"42".padStart(5, " ")   // "   42"
"hi".padEnd(10, ".")    // "hi........"
"99".padStart(4, "0")   // "0099" — great for formatting IDs, timestamps
```

### `at` (ES2022)

```js
"hello".at(0)   // "h"
"hello".at(-1)  // "o" — last character
"hello".at(-2)  // "l"
```

### Repeat

```js
"ha".repeat(3)  // "hahaha"
"-".repeat(20)  // "--------------------"
```

### Template Literals (Recap + Multi-line)

```js
const name = "Mark"
`Hello, ${name}!`        // "Hello, Mark!"
`${1 + 2}`               // "3"
`Multi
  line
  string`                 // preserves newlines and spaces
```

## W — Why It Matters

- String manipulation is in every web application — URLs, user input, formatting, templates.
- `replaceAll` (ES2021) eliminated the need for `/pattern/g` regex for simple replacements.
- `padStart`/`padEnd` are essential for formatting output (IDs, dates, tables).
- `includes`/`startsWith`/`endsWith` are more readable than `indexOf !== -1`.
- `at(-1)` replaces the ugly `str[str.length - 1]` pattern.

## I — Interview Questions with Answers

### Q1: Are strings mutable in JavaScript?

**A:** No. All string methods return **new strings**. The original is never modified.

### Q2: What is the difference between `replace` and `replaceAll`?

**A:** `replace` replaces only the **first** match (unless you use a regex with the `g` flag). `replaceAll` replaces **all** matches.

### Q3: How do you check if a string contains a substring?

**A:** `str.includes(sub)` returns a boolean. Prefer it over `str.indexOf(sub) !== -1`.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `replace` to replace all occurrences

```js
"aaa".replace("a", "b") // "baa" — only first!
```

**Fix:** Use `.replaceAll("a", "b")` or `.replace(/a/g, "b")`.

### Pitfall: Forgetting that string methods are case-sensitive

```js
"Hello".includes("hello") // false!
```

**Fix:** Normalize case first: `"Hello".toLowerCase().includes("hello")`.

### Pitfall: Using `substr` (deprecated)

```js
"hello".substr(1, 3) // "ell" — deprecated!
```

**Fix:** Use `.slice(1, 4)` instead. `slice` is the standard.

## K — Coding Challenge with Solution

### Challenge

Write a function `maskEmail(email)` that masks an email address:
- `"mark@example.com"` → `"m***@example.com"`
- `"ab@test.io"` → `"a*@test.io"`

Show first character, replace rest of local part with `*`, keep domain.

### Solution

```js
function maskEmail(email) {
  const [local, domain] = email.split("@")
  const masked = local[0] + "*".repeat(Math.max(local.length - 1, 1))
  return `${masked}@${domain}`
}

maskEmail("mark@example.com") // "m***@example.com"
maskEmail("ab@test.io")       // "a*@test.io"
maskEmail("x@y.com")          // "x*@y.com"
```

---
