# 10 — Proxy Use Cases: Validation, Logging & Reactivity

## T — TL;DR

The three killer use cases for `Proxy` are runtime validation, transparent logging, and reactivity — triggering callbacks when data changes, which is exactly how Vue 3 works.[^6]

## K — Key Concepts

```js
// 1. Validation Proxy
function createSchema(obj, rules) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      if (rules[prop]) {
        const { type, min, max, required } = rules[prop]
        if (type && typeof value !== type) throw new TypeError(`${prop} must be ${type}`)
        if (min !== undefined && value < min) throw new RangeError(`${prop} >= ${min}`)
        if (max !== undefined && value > max) throw new RangeError(`${prop} <= ${max}`)
      }
      return Reflect.set(target, prop, value, receiver)
    }
  })
}

const user = createSchema({}, {
  age: { type: "number", min: 0, max: 150 },
  name: { type: "string" }
})
user.age = 25     // ✅
user.age = -1     // ❌ RangeError
user.name = 42    // ❌ TypeError

// 2. Logging Proxy
function createLogger(obj, label = "Object") {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver)
      if (typeof val === "function") {
        return function(...args) {
          console.log(`[${label}] ${prop}(${args.map(JSON.stringify).join(", ")})`)
          return val.apply(target, args)
        }
      }
      return val
    },
    set(target, prop, value, receiver) {
      console.log(`[${label}] SET ${prop} = ${JSON.stringify(value)}`)
      return Reflect.set(target, prop, value, receiver)
    }
  })
}

// 3. Reactive Proxy (Vue 3 simplified)
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const old = target[prop]
      const result = Reflect.set(target, prop, value, receiver)
      if (old !== value) onChange(prop, value, old)
      return result
    }
  })
}

const state = reactive({ count: 0 }, (prop, newVal, oldVal) => {
  console.log(`${prop}: ${oldVal} → ${newVal}`)
  // In Vue 3, this would trigger DOM re-render
})

state.count = 1   // "count: 0 → 1"
state.count = 2   // "count: 1 → 2"
```


## W — Why It Matters

Vue 3 replaced `Object.defineProperty` with `Proxy` for its entire reactivity system because `Proxy` can intercept new property additions, array length changes, and deletions — things `defineProperty` couldn't handle. Understanding this makes Vue 3 internals intuitive.[^4]

## I — Interview Q&A

**Q: How does Vue 3 use Proxy for reactivity?**
A: Vue 3 wraps reactive data in a `Proxy`. The `get` trap tracks which components depend on which properties (dependency tracking). The `set` trap triggers re-renders when those properties change (dependency notification). This replaces Vue 2's per-property `Object.defineProperty` approach.

**Q: What can Proxy intercept that `Object.defineProperty` cannot?**
A: `Proxy` can intercept adding new properties, deleting properties, and array index/length changes. `Object.defineProperty` only intercepts pre-defined properties — you can't intercept `obj.newProp = value` reactively with it.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Proxy not deep — nested objects aren't reactive | Recursively wrap nested objects: `reactive(value)` if it's an object |
| Forgetting `return Reflect.set(...)` at end of `set` trap | Return `false` → strict mode throws `TypeError` |
| Proxy wrapping native types (Date, Map, Set) | Native methods access internal slots directly — proxy wrapping breaks them |

## K — Coding Challenge

**Build a `deepReactive` that makes nested objects reactive too:**

```js
const state = deepReactive({ user: { name: "Alice" } }, onChange)
state.user.name = "Bob"  // should trigger onChange
```

**Solution:**

```js
function deepReactive(obj, onChange) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver)
      if (val && typeof val === "object") return deepReactive(val, onChange)
      return val
    },
    set(target, prop, value, receiver) {
      const old = target[prop]
      const result = Reflect.set(target, prop, value, receiver)
      if (old !== value) onChange(prop, value, old)
      return result
    }
  })
}
```


***
