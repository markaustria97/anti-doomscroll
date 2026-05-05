# 11 — Template Literals & String Methods

## T — TL;DR

Template literals replace string concatenation; combined with tagged templates and string methods, they cover nearly all text manipulation needs.

## K — Key Concepts

```js
// Template literals
const name = "Alice"
const msg = `Hello, ${name}! You are ${20 + 5} years old.`
const multiline = `
  Line 1
  Line 2
`

// Tagged templates
function highlight(strings, ...vals) {
  return strings.reduce((acc, str, i) =>
    `${acc}${str}${vals[i] !== undefined ? `<b>${vals[i]}</b>` : ''}`, '')
}
highlight`Hello ${name}, you have ${3} messages.`
// "Hello <b>Alice</b>, you have <b>3</b> messages."

// Essential string methods
"hello world".includes("world")       // true
"hello".startsWith("hel")             // true
"hello".endsWith("lo")                // true
"ha".repeat(3)                        // "hahaha"
"  trim me  ".trim()                  // "trim me"
"  trim me  ".trimStart()             // "trim me  "
"abc".padStart(5, "0")                // "00abc"
"a,b,c".split(",")                    // ["a", "b", "c"]
"hello world".replace("world", "JS")  // "hello JS"
"hello world".replaceAll("l", "L")    // "heLLo worLd"
"Hello".toLowerCase()                 // "hello"
"hello".toUpperCase()                 // "HELLO"
"hello world".slice(6, 11)            // "world"
"hello".at(-1)                        // "o" (ES2022)
"hello world".indexOf("world")        // 6
```


## W — Why It Matters

Template literals make SQL queries, HTML generation, and log messages readable. String methods eliminate most regex for common tasks. `at(-1)` is the modern way to get the last character without `.length - 1`.

## I — Interview Q&A

**Q: What are tagged template literals?**
A: A function placed before a template literal receives the string parts as an array and interpolated values as rest args. Used in libraries like `styled-components`, `sql`, and `graphql` for domain-specific languages.

**Q: What's the difference between `slice` and `substring`?**
A: `slice` accepts negative indices (counts from end). `substring` does not — negative values are treated as `0`. Prefer `slice`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| String concatenation in loops | Use array + `join()` or template literals |
| `replace()` only replacing first match | Use `replaceAll()` or regex with `/g` flag |
| `indexOf()` returning `-1` for "not found" | Check `!== -1` or use `.includes()` |

## K — Coding Challenge

**Capitalize the first letter of each word:**

```js
capitalize("hello world from js")
// → "Hello World From Js"
```

**Solution:**

```js
const capitalize = str =>
  str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
```


***
