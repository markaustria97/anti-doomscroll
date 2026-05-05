# 12 — `JSON.parse` / `JSON.stringify` with Replacer & Reviver

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

## I — Interview Q&A

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
