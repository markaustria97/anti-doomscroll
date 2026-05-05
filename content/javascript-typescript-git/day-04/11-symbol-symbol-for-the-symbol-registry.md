# 11 — Symbol, `Symbol.for` & the Symbol Registry

## T — TL;DR

Symbols are unique, non-string, non-enumerable keys — use them to add metadata or extension hooks to objects without any risk of name collision.[^3]

## K — Key Concepts

```js
// Every Symbol() call creates a UNIQUE value
const a = Symbol("id")
const b = Symbol("id")
a === b   // false — always unique, even with same description

// Use as unique property keys
const ID = Symbol("id")
const obj = {
  name: "Alice",
  [ID]: 12345         // symbol key — non-enumerable!
}

obj.name              // "Alice"
obj[ID]               // 12345
Object.keys(obj)      // ["name"] — symbol not listed!
JSON.stringify(obj)   // {"name":"Alice"} — symbol stripped!

// Access symbols
Object.getOwnPropertySymbols(obj)  // [Symbol(id)]
Reflect.ownKeys(obj)               // ["name", Symbol(id)]

// Symbol.for — global registry (shared across modules/iframes)
const key1 = Symbol.for("app.token")
const key2 = Symbol.for("app.token")
key1 === key2         // true ✅ — same registry entry

Symbol.keyFor(key1)   // "app.token"
Symbol.keyFor(Symbol("local")) // undefined — not in registry

// Symbol as constants (no collision possible)
const Direction = {
  UP:    Symbol("UP"),
  DOWN:  Symbol("DOWN"),
  LEFT:  Symbol("LEFT"),
  RIGHT: Symbol("RIGHT")
}
Direction.UP === Direction.UP  // true
// Can't be spoofed by passing the string "UP"
```


## W — Why It Matters

Symbols are how library authors add non-interfering hooks to user objects. `Symbol.for` is how you share symbols across module boundaries. Third-party libraries use symbols to tag objects with metadata that never appears in user code's `for...in` loops or `JSON.stringify`.

## I — Interview Q&A

**Q: What makes Symbols useful as object keys vs strings?**
A: Symbols are guaranteed unique — you can't accidentally collide with existing string keys. They're also non-enumerable, so they don't appear in `Object.keys`, `for...in`, or `JSON.stringify`. Perfect for metadata and extension points.

**Q: What's the difference between `Symbol()` and `Symbol.for()`?**
A: `Symbol()` always creates a new unique symbol — even with the same description. `Symbol.for(key)` looks up or creates a symbol in the global registry — the same string key always returns the same symbol, making it shareable across modules.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `JSON.stringify` silently dropping symbol-keyed properties | Use `Reflect.ownKeys` + manual serialization if needed |
| `Symbol()` with no description being hard to debug | Always give descriptive labels: `Symbol("user:id")` |
| Using `Symbol()` where sharing across modules is needed | Use `Symbol.for("shared.key")` instead |
| Assuming `typeof Symbol() === "symbol"` returns `"object"` | It returns `"symbol"` — own type |

## K — Coding Challenge

**Add a non-enumerable `__meta__` symbol key to any object without affecting its normal behavior:**

```js
const META = Symbol.for("app.meta")
const user = tag({ name: "Alice" }, { version: 1 })
user.name          // "Alice"
Object.keys(user)  // ["name"] — meta not visible
user[META]         // { version: 1 }
```

**Solution:**

```js
const META = Symbol.for("app.meta")

function tag(obj, meta) {
  return Object.defineProperty({ ...obj }, META, {
    value: meta,
    enumerable: false,
    writable: true,
    configurable: true
  })
}
```


***
