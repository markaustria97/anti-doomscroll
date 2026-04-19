# 9 — Tagged Template Literals

## T — TL;DR

Tagged template literals let you **process template strings with a function** — the tag function receives the string parts and interpolated values separately, enabling custom string processing like escaping HTML, syntax highlighting, SQL parameterization, and i18n.

## K — Key Concepts

### Basic Syntax

```js
function tag(strings, ...values) {
  console.log(strings) // array of string parts
  console.log(values)  // array of interpolated values
}

const name = "Mark"
const age = 30

tag`Hello, ${name}! You are ${age}.`
// strings: ["Hello, ", "! You are ", "."]
// values: ["Mark", 30]
```

The tag function receives:
- `strings` — array of **string literals** between expressions (always 1 more than values)
- `...values` — the **evaluated expressions**

### Building a Result

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined ? `**${values[i]}**` : ""
    return result + str + value
  }, "")
}

const name = "Mark"
const role = "developer"

highlight`Hello, ${name}! You are a ${role}.`
// "Hello, **Mark**! You are a **developer**."
```

### Pattern 1: HTML Escaping (XSS Prevention)

```js
function safeHTML(strings, ...values) {
  const escape = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  return strings.reduce((result, str, i) => {
    return result + str + (i < values.length ? escape(values[i]) : "")
  }, "")
}

const userInput = '<script>alert("xss")</script>'
safeHTML`<div>${userInput}</div>`
// "<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>"
```

### Pattern 2: SQL Parameterization

```js
function sql(strings, ...values) {
  const query = strings.join("?")
  return { query, params: values }
}

const name = "Mark"
const age = 30

sql`SELECT * FROM users WHERE name = ${name} AND age > ${age}`
// { query: "SELECT * FROM users WHERE name = ? AND age > ?", params: ["Mark", 30] }
```

### Pattern 3: CSS-in-JS (Styled Components Pattern)

```js
function css(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ?? "")
  }, "")
}

const color = "red"
const size = 16

const style = css`
  color: ${color};
  font-size: ${size}px;
`
// "\n  color: red;\n  font-size: 16px;\n"
```

This is exactly how `styled-components` works in React.

### `String.raw` — Built-In Tag

Prevents escape sequence processing:

```js
String.raw`Hello\nWorld` // "Hello\\nWorld" — literal backslash-n, not a newline
String.raw`C:\Users\Mark` // "C:\\Users\\Mark" — backslashes preserved

// Regular template:
`Hello\nWorld` // "Hello
               //  World" — newline interpreted
```

### `strings.raw` Property

Inside a tag function, `strings.raw` gives you the unprocessed strings:

```js
function tag(strings) {
  console.log(strings[0])     // "Hello\nWorld" — newline character
  console.log(strings.raw[0]) // "Hello\\nWorld" — literal text
}

tag`Hello\nWorld`
```

## W — Why It Matters

- `styled-components`, `lit-html`, `graphql-tag`, and `sql` template tags are all tagged templates.
- HTML escaping prevents XSS vulnerabilities.
- SQL parameterization prevents injection attacks.
- Understanding tagged templates lets you build powerful DSLs (domain-specific languages).
- They demonstrate one of JavaScript's most unique metaprogramming capabilities.

## I — Interview Questions with Answers

### Q1: What is a tagged template literal?

**A:** A template literal prefixed with a function name (the "tag"). The function receives the string parts and interpolated values as separate arguments, allowing custom processing of the template.

### Q2: What does the tag function receive?

**A:** First argument: an array of string literals (`strings`). Remaining arguments: the evaluated expression values. `strings` always has one more element than values.

### Q3: What is `String.raw`?

**A:** A built-in tag function that returns the raw string without processing escape sequences. `String.raw`\`\n\`` returns the literal characters `\n`, not a newline.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting that `strings` has N+1 elements

```js
tag`A${1}B${2}C`
// strings = ["A", "B", "C"] — 3 elements
// values = [1, 2] — 2 elements
```

**Fix:** When building the result, use `strings.length` for the loop and handle the extra string at the end.

### Pitfall: Not handling `undefined` values

```js
function tag(strings, ...values) {
  return strings.reduce((r, s, i) => r + s + values[i], "")
  // Last iteration: values[i] is undefined → "undefined" in output!
}
```

**Fix:** Default: `values[i] ?? ""` or `values[i] !== undefined ? values[i] : ""`.

## K — Coding Challenge with Solution

### Challenge

Create a `dedent` tag that removes common leading whitespace from multi-line template literals:

```js
const result = dedent`
  Hello,
    World!
  Goodbye.
`
// "Hello,\n  World!\nGoodbye."
```

### Solution

```js
function dedent(strings, ...values) {
  // Build the full string first
  let full = strings.reduce((result, str, i) => {
    return result + str + (values[i] ?? "")
  }, "")

  // Remove leading/trailing empty lines
  const lines = full.split("\n")
  if (lines[0].trim() === "") lines.shift()
  if (lines.at(-1).trim() === "") lines.pop()

  // Find minimum indentation
  const minIndent = lines
    .filter(line => line.trim().length > 0)
    .reduce((min, line) => {
      const indent = line.match(/^(\s*)/)[1].length
      return Math.min(min, indent)
    }, Infinity)

  // Remove common indent
  return lines.map(line => line.slice(minIndent)).join("\n")
}

const result = dedent`
  Hello,
    World!
  Goodbye.
`
// "Hello,\n  World!\nGoodbye."
```

---
