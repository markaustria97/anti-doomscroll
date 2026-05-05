# 7 — Object Literals, Shorthand & Computed Property Names

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

## I — Interview Q&A

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
