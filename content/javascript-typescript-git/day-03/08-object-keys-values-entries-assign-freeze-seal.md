# 8 — `Object.keys`, `values`, `entries`, `assign`, `freeze`, `seal`

## T — TL;DR

These static methods let you iterate, copy, and lock objects — `freeze` prevents all changes, `seal` prevents adding/deleting but allows value updates.

## K — Key Concepts

```js
const user = { name: "Alice", age: 28, role: "admin" }

// Iterating
Object.keys(user)     // ["name", "age", "role"]
Object.values(user)   // ["Alice", 28, "admin"]
Object.entries(user)  // [["name","Alice"],["age",28],["role","admin"]]

// Iterating with for...of
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`)
}

// Object.assign — shallow merge (mutates target!)
const target = { a: 1 }
const result = Object.assign(target, { b: 2 }, { c: 3 })
// target = { a:1, b:2, c:3 }, result === target ✅

// Non-mutating merge (use spread instead)
const merged = { ...user, age: 29 }  // preferred modern way

// Object.freeze — shallow immutability
const config = Object.freeze({ host: "localhost", port: 3000 })
config.port = 9000     // silently fails (throws in strict mode)
config.port            // still 3000
// ⚠️ Shallow — nested objects are NOT frozen:
const obj = Object.freeze({ nested: { val: 1 } })
obj.nested.val = 99    // ✅ works — nested not frozen!

// Object.seal — no add/delete, but values CAN change
const sealed = Object.seal({ name: "Alice", age: 28 })
sealed.age = 30        // ✅ allowed
sealed.email = "..."   // ❌ silently fails
delete sealed.name     // ❌ silently fails

// Check state
Object.isFrozen(config)  // true
Object.isSealed(sealed)  // true
```

| Method | Add props? | Delete props? | Change values? |
| :-- | :-- | :-- | :-- |
| `freeze` | ❌ | ❌ | ❌ |
| `seal` | ❌ | ❌ | ✅ |
| Normal object | ✅ | ✅ | ✅ |

## W — Why It Matters

`Object.freeze` is used for config objects, action type constants, and preventing accidental mutations in tests. `Object.assign` appears in older codebases for merging — modern code uses spread. Both are common interview topics.

## I — Interview Q&A

**Q: What's the difference between `Object.freeze` and `const`?**
A: `const` prevents reassigning the variable binding. `Object.freeze` prevents modifying the object's properties. You can mutate a `const` object; you can reassign a `let` frozen object reference.

**Q: Is `Object.freeze` deep?**
A: No — it's shallow. Only the top-level properties are frozen. Nested objects remain mutable. For deep freeze, recursively call `Object.freeze` on all nested objects. 

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `Object.assign({}, a, b)` being verbose | Use `{ ...a, ...b }` |
| Expecting `freeze` to protect nested objects | Deep freeze recursively or use immutable libraries |
| `Object.assign` mutation of target | Pass `{}` as first arg: `Object.assign({}, source)` |
| Assuming `freeze` throws in sloppy mode | It fails silently — use strict mode |

## K — Coding Challenge

**Write a `deepFreeze` utility:**

```js
const obj = deepFreeze({ a: 1, b: { c: 2 } })
obj.b.c = 99  // should fail silently or throw in strict mode
```

**Solution:**

```js
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      deepFreeze(obj[key])
    }
  })
  return Object.freeze(obj)
}
```


***
