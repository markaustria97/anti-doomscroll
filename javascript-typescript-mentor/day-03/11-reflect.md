# 11 — `Reflect`

## T — TL;DR

`Reflect` is a built-in object that provides **methods matching every Proxy trap** — it's the clean, correct way to forward operations inside proxy handlers, replacing ad-hoc patterns like `target[prop]`.

## K — Key Concepts

### Why `Reflect` Exists

Before `Reflect`, operations were scattered across different syntax:

```js
// Old way
prop in obj              // has
delete obj[prop]         // deleteProperty
Object.keys(obj)         // ownKeys
Object.defineProperty()  // defineProperty
obj[prop]                // get
obj[prop] = value        // set
```

`Reflect` unifies them under a consistent API:

```js
Reflect.has(obj, prop)
Reflect.deleteProperty(obj, prop)
Reflect.ownKeys(obj)
Reflect.defineProperty(obj, prop, desc)
Reflect.get(obj, prop)
Reflect.set(obj, prop, value)
```

### `Reflect` Methods Match Proxy Traps 1:1

| Proxy Trap | Reflect Method |
|------------|---------------|
| `get` | `Reflect.get(target, prop, receiver)` |
| `set` | `Reflect.set(target, prop, value, receiver)` |
| `has` | `Reflect.has(target, prop)` |
| `deleteProperty` | `Reflect.deleteProperty(target, prop)` |
| `apply` | `Reflect.apply(fn, thisArg, args)` |
| `construct` | `Reflect.construct(Target, args)` |
| `ownKeys` | `Reflect.ownKeys(target)` |
| `getPrototypeOf` | `Reflect.getPrototypeOf(target)` |
| `setPrototypeOf` | `Reflect.setPrototypeOf(target, proto)` |
| `defineProperty` | `Reflect.defineProperty(target, prop, desc)` |
| `getOwnPropertyDescriptor` | `Reflect.getOwnPropertyDescriptor(target, prop)` |
| `isExtensible` | `Reflect.isExtensible(target)` |
| `preventExtensions` | `Reflect.preventExtensions(target)` |

### Using `Reflect` in Proxy Handlers

**Without Reflect (fragile):**

```js
const proxy = new Proxy(target, {
  get(target, prop) {
    console.log(`get ${String(prop)}`)
    return target[prop] // misses receiver — breaks with inheritance
  },
  set(target, prop, value) {
    console.log(`set ${String(prop)}`)
    target[prop] = value
    return true
  },
})
```

**With Reflect (correct):**

```js
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    console.log(`get ${String(prop)}`)
    return Reflect.get(target, prop, receiver) // preserves receiver
  },
  set(target, prop, value, receiver) {
    console.log(`set ${String(prop)}`)
    return Reflect.set(target, prop, value, receiver)
  },
})
```

### Why `receiver` Matters

```js
const parent = {
  get name() {
    return this._name // `this` should be the child, not parent
  },
}

const child = Object.create(parent)
child._name = "Mark"

// Without Reflect — this is parent, not child:
const proxy = new Proxy(parent, {
  get(target, prop) {
    return target[prop] // ❌ this = parent inside getter
  },
})

// With Reflect — this correctly refers to the receiver:
const proxy2 = new Proxy(parent, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver) // ✅ this = receiver inside getter
  },
})
```

### `Reflect.apply` — Cleaner Function Calls

```js
// Old way
Function.prototype.apply.call(fn, thisArg, args)

// Reflect way
Reflect.apply(fn, thisArg, args)
```

### `Reflect.construct` — `new` Without `new`

```js
class User {
  constructor(name) { this.name = name }
}

// Equivalent to new User("Mark")
const user = Reflect.construct(User, ["Mark"])
console.log(user.name)           // "Mark"
console.log(user instanceof User) // true
```

### `Reflect` Return Values vs Throwing

Some `Object` methods throw on failure, while `Reflect` returns `false`:

```js
// Object.defineProperty throws if it fails
try {
  Object.defineProperty(frozen, "x", { value: 1 }) // throws TypeError
} catch (e) {}

// Reflect.defineProperty returns false
const success = Reflect.defineProperty(frozen, "x", { value: 1 })
console.log(success) // false — no exception
```

This makes `Reflect` easier to use with conditional logic.

## W — Why It Matters

- `Reflect` is the **correct** way to forward operations inside proxy traps.
- Using `Reflect` instead of direct property access prevents subtle bugs with `receiver` and getters/setters.
- The consistent return-value pattern (returning `boolean` instead of throwing) makes code more predictable.
- Vue 3, MobX, and other reactive frameworks use `Reflect` extensively with their proxies.
- Shows advanced metaprogramming knowledge in interviews.

## I — Interview Questions with Answers

### Q1: What is `Reflect`?

**A:** A built-in object providing methods that correspond 1:1 to every Proxy trap. It's the standard way to perform object operations programmatically and the correct way to forward operations inside proxy handlers.

### Q2: Why use `Reflect.get` instead of `target[prop]`?

**A:** `Reflect.get` accepts a `receiver` argument that ensures `this` is set correctly inside getters. Direct property access (`target[prop]`) loses the receiver context, which breaks getters that use `this`.

### Q3: How does `Reflect` differ from `Object` methods?

**A:** `Reflect` methods return `boolean` on failure instead of throwing exceptions, matching the return conventions of proxy traps. They also have a consistent API that maps directly to proxy traps.

## C — Common Pitfalls with Fix

### Pitfall: Not passing `receiver` to `Reflect.get`/`Reflect.set`

```js
get(target, prop, receiver) {
  return Reflect.get(target, prop) // missing receiver!
}
```

**Fix:** Always pass `receiver`: `Reflect.get(target, prop, receiver)`.

### Pitfall: Using `target[prop]` in proxy traps instead of `Reflect`

**Fix:** Default to `Reflect` methods inside all proxy traps. It's safer and more correct.

## K — Coding Challenge with Solution

### Challenge

Create a logging proxy using `Reflect` that logs every `get`, `set`, and `deleteProperty` operation with the property name and value.

### Solution

```js
function createLoggingProxy(target) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)
      console.log(`GET ${String(prop)} → ${value}`)
      return value
    },

    set(target, prop, value, receiver) {
      console.log(`SET ${String(prop)} = ${value}`)
      return Reflect.set(target, prop, value, receiver)
    },

    deleteProperty(target, prop) {
      console.log(`DELETE ${String(prop)}`)
      return Reflect.deleteProperty(target, prop)
    },
  })
}

const user = createLoggingProxy({ name: "Mark", age: 30 })

user.name          // GET name → Mark
user.age = 31      // SET age = 31
delete user.age    // DELETE age
```

---
