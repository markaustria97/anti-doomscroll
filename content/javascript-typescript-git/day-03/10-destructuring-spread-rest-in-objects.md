# 10 — Destructuring & Spread/Rest in Objects

## T — TL;DR

Destructuring extracts values from objects in one line; spread clones/merges objects; rest collects remaining properties — together they replace most manual property access.

## K — Key Concepts

```js
const user = { name: "Alice", age: 28, role: "admin", city: "NYC" }

// Basic destructuring
const { name, age } = user

// Rename on extraction
const { name: username, age: years } = user
// username = "Alice", years = 28

// Default values
const { name, status = "active" } = user
// status = "active" (not in user)

// Nested destructuring
const { address: { city, zip = "00000" } = {} } = user
// Always provide fallback for nested: `= {}` prevents crash if address is undefined

// Rest in destructuring — collects remaining
const { role, ...rest } = user
// role = "admin", rest = { name:"Alice", age:28, city:"NYC" }

// In function parameters — very common pattern
function greet({ name, age = 0, role = "user" } = {}) {
  return `${name} (${role}), age ${age}`
}
greet(user)  // "Alice (admin), age 28"
greet()      // works! default `= {}` prevents crash on no arg

// Spread — shallow clone / merge
const clone = { ...user }                  // shallow copy
const updated = { ...user, age: 29 }       // override one field
const merged = { ...defaults, ...user }    // merge (user wins)

// Spread order matters — later wins
const a = { x: 1, y: 2 }
const b = { y: 3, z: 4 }
{ ...a, ...b }  // { x:1, y:3, z:4 } — b.y overrides a.y
{ ...b, ...a }  // { x:1, y:2, z:4 } — a.y overrides b.y

// Computed keys in destructuring
const key = "name"
const { [key]: extractedName } = user  // extractedName = "Alice"
```


## W — Why It Matters

Destructuring in function parameters is universal in React (props destructuring), Express (req destructuring), and API response parsing. Rest/spread is the standard way to do immutable object updates in Redux reducers.

## I — Interview Q&A

**Q: How do you avoid a crash when destructuring a potentially undefined object?**
A: Provide a default for the whole object: `const { a, b } = obj || {}` or use a parameter default: `function fn({ a, b } = {}) {}`. This prevents `Cannot destructure property 'a' of undefined`.

**Q: What's the difference between object rest and array rest?**
A: Object rest collects remaining **named** properties: `const { a, ...rest } = obj`. Array rest collects remaining **indexed** elements: `const [first, ...others] = arr`. Both create shallow copies of the collected items.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Destructuring `null` or `undefined` | Guard: `const { a } = val ?? {}` |
| Nested destructure crashing on missing parent | Provide default: `{ a: { b } = {} }` |
| Spread doing deep copy | Spread is SHALLOW — use `structuredClone` for deep |
| Forgetting rename syntax `{ x: newName }` | It's `key: variableName`, not `newName: key` |

## K — Coding Challenge

**Extract `name`, rename `role` to `userRole`, get remaining fields, and set a default for `status`:**

```js
const user = { name: "Alice", role: "admin", age: 28 }
```

**Solution:**

```js
const { name, role: userRole, status = "active", ...remaining } = user
// name = "Alice"
// userRole = "admin"
// status = "active" (default)
// remaining = { age: 28 }
```


***
