# 12 — Practical Metaprogramming (Validation, Logging, Reactive Traps)

## T — TL;DR

Combining `Proxy` and `Reflect`, you can build transparent middleware layers — **validation**, **logging**, **reactivity**, **access control**, and **auto-population** — without changing the original object's code.

## K — Key Concepts

### Pattern 1: Schema Validation Proxy

Validate every property assignment against a schema:

```js
function createValidatedObject(schema, initial = {}) {
  return new Proxy(initial, {
    set(target, prop, value, receiver) {
      if (prop in schema) {
        const validator = schema[prop]
        if (!validator(value)) {
          throw new TypeError(
            `Invalid value for "${String(prop)}": ${JSON.stringify(value)}`
          )
        }
      }
      return Reflect.set(target, prop, value, receiver)
    },
  })
}

const userSchema = {
  name: (v) => typeof v === "string" && v.length > 0,
  age: (v) => typeof v === "number" && v >= 0 && v <= 150,
  email: (v) => typeof v === "string" && v.includes("@"),
}

const user = createValidatedObject(userSchema)

user.name = "Mark"        // ✅
user.age = 30             // ✅
user.email = "m@test.com" // ✅
// user.age = -5          // TypeError: Invalid value for "age": -5
// user.email = "invalid" // TypeError: Invalid value for "email": "invalid"
```

### Pattern 2: Observable / Reactive Proxy

Trigger callbacks when state changes (simplified Vue/MobX pattern):

```js
function reactive(target, onChange) {
  return new Proxy(target, {
    set(target, prop, value, receiver) {
      const oldValue = target[prop]
      const result = Reflect.set(target, prop, value, receiver)

      if (oldValue !== value) {
        onChange(prop, value, oldValue)
      }

      return result
    },

    deleteProperty(target, prop) {
      const oldValue = target[prop]
      const result = Reflect.deleteProperty(target, prop)

      if (result) {
        onChange(prop, undefined, oldValue)
      }

      return result
    },
  })
}

const state = reactive({ count: 0, name: "Mark" }, (prop, newVal, oldVal) => {
  console.log(`${String(prop)}: ${oldVal} → ${newVal}`)
})

state.count = 1      // "count: 0 → 1"
state.count = 2      // "count: 1 → 2"
state.name = "Alex"  // "name: Mark → Alex"
state.count = 2      // (no log — value didn't change)
```

### Pattern 3: Auto-Populating / Default Values

Return defaults for missing properties:

```js
function withDefaults(target, defaults) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver)
      }
      if (prop in defaults) {
        return defaults[prop]
      }
      return undefined
    },
  })
}

const config = withDefaults(
  { host: "localhost" },
  { port: 3000, debug: false, timeout: 5000 }
)

config.host    // "localhost" (from target)
config.port    // 3000 (from defaults)
config.debug   // false (from defaults)
config.missing // undefined
```

### Pattern 4: Access Control Proxy

Restrict which properties can be accessed:

```js
function createSecureProxy(target, allowedProps) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (!allowedProps.includes(prop)) {
        throw new Error(`Access denied: "${String(prop)}"`)
      }
      return Reflect.get(target, prop, receiver)
    },

    set(target, prop, value, receiver) {
      if (!allowedProps.includes(prop)) {
        throw new Error(`Cannot modify: "${String(prop)}"`)
      }
      return Reflect.set(target, prop, value, receiver)
    },
  })
}

const user = { name: "Mark", role: "admin", password: "secret" }
const safeUser = createSecureProxy(user, ["name", "role"])

safeUser.name     // "Mark" ✅
safeUser.role     // "admin" ✅
// safeUser.password // Error: Access denied: "password" ❌
```

### Pattern 5: Method Timing / Logging Proxy

Automatically time every method call:

```js
function withTiming(target) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver)

      if (typeof value === "function") {
        return function (...args) {
          const label = `${target.constructor.name}.${String(prop)}`
          console.time(label)
          const result = value.apply(this, args)
          console.timeEnd(label)
          return result
        }
      }

      return value
    },
  })
}

class DataProcessor {
  process(data) {
    // simulate work
    let sum = 0
    for (let i = 0; i < 1_000_000; i++) sum += i
    return sum
  }
}

const processor = withTiming(new DataProcessor())
processor.process([1, 2, 3])
// DataProcessor.process: 5.123ms
```

### Pattern 6: Negative Array Indices

```js
function negativeArray(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop)
      if (!Number.isNaN(index) && index < 0) {
        return Reflect.get(target, target.length + index, receiver)
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

const arr = negativeArray([10, 20, 30, 40, 50])
arr[-1]  // 50
arr[-2]  // 40
arr[0]   // 10
```

### Combining Patterns

Proxies can be **chained** — wrap a proxy in another proxy:

```js
const raw = { count: 0, name: "Mark" }

const validated = createValidatedObject(
  { count: (v) => typeof v === "number" && v >= 0 },
  raw
)

const observed = reactive(validated, (prop, newVal) => {
  console.log(`Changed: ${String(prop)} = ${newVal}`)
})

observed.count = 5  // validates, then logs: "Changed: count = 5"
// observed.count = -1 // TypeError from validation layer
```

## W — Why It Matters

- **Vue 3** = reactive proxies. Understanding this pattern means understanding Vue's core.
- **MobX** = observable proxies. Same story.
- **Validation proxies** catch bugs at assignment time — faster feedback than runtime errors later.
- **Logging proxies** are zero-config debugging tools for any object.
- **Access control proxies** implement permission layers without modifying original code.
- These patterns demonstrate **production-level** metaprogramming skills in interviews.

## I — Interview Questions with Answers

### Q1: How would you use Proxy for validation?

**A:** Create a proxy with a `set` trap that validates the new value against a schema before forwarding the assignment with `Reflect.set`. If validation fails, throw a `TypeError`.

### Q2: How does Vue 3's reactivity system work?

**A:** Vue 3 wraps state objects in reactive `Proxy` instances. The `get` trap tracks which properties are accessed during render (dependency collection). The `set` trap detects changes and triggers re-renders for components that depend on the changed property.

### Q3: Can you chain multiple proxies?

**A:** Yes. Each proxy wraps the previous one, creating a pipeline. For example: validation → logging → the original object. Operations pass through each layer.

### Q4: What is the downside of using proxies?

**A:** Performance overhead (each operation goes through the handler), debugging complexity (stack traces include proxy internals), and identity issues (`proxy !== target`).

## C — Common Pitfalls with Fix

### Pitfall: Not using `Reflect` inside trap handlers

```js
set(target, prop, value) {
  target[prop] = value // works but misses receiver, breaks with inheritance
  return true
}
```

**Fix:** Always use `Reflect.set(target, prop, value, receiver)`.

### Pitfall: Proxy traps on non-configurable properties must match

If the target has a non-configurable, non-writable property, the `get` trap **must** return the actual value:

```js
const target = {}
Object.defineProperty(target, "x", { value: 1, writable: false, configurable: false })

const proxy = new Proxy(target, {
  get() { return 2 } // TypeError: proxy get handler returned 2 for non-configurable property
})
```

**Fix:** Use `Reflect.get` as default to ensure invariant compliance.

### Pitfall: Infinite loops in reactive proxies

```js
const state = reactive({ a: 1 }, (prop, val) => {
  state.a = val + 1 // triggers set → triggers onChange → triggers set → ...
})
```

**Fix:** Add a guard flag or batch updates.

## K — Coding Challenge with Solution

### Challenge

Create a `createTypeEnforcer(schema)` that:
- Returns a proxy enforcing types on every assignment
- Schema: `{ propName: "string" | "number" | "boolean" }`
- Allows new properties not in the schema
- Throws `TypeError` for type mismatches

```js
const user = createTypeEnforcer({
  name: "string",
  age: "number",
  active: "boolean",
})

user.name = "Mark"     // ✅
user.age = 30          // ✅
user.active = true     // ✅
user.extra = [1, 2]    // ✅ (not in schema — allowed)
// user.age = "thirty" // TypeError
// user.name = 123     // TypeError
```

### Solution

```js
function createTypeEnforcer(schema) {
  return new Proxy({}, {
    set(target, prop, value, receiver) {
      if (prop in schema) {
        const expectedType = schema[prop]
        if (typeof value !== expectedType) {
          throw new TypeError(
            `"${String(prop)}" must be ${expectedType}, got ${typeof value}`
          )
        }
      }
      return Reflect.set(target, prop, value, receiver)
    },
  })
}

const user = createTypeEnforcer({
  name: "string",
  age: "number",
  active: "boolean",
})

user.name = "Mark"      // ✅
user.age = 30           // ✅
user.active = true      // ✅
user.extra = [1, 2]     // ✅
// user.age = "thirty"  // TypeError: "age" must be number, got string
```

---

# ✅ Day 3 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Closure Patterns & Practical Uses | ✅ T-KWICK |
| 2 | `this` Binding Rules | ✅ T-KWICK |
| 3 | `call`, `apply`, `bind` | ✅ T-KWICK |
| 4 | Prototype Chain | ✅ T-KWICK |
| 5 | `Object.create` | ✅ T-KWICK |
| 6 | `class` Syntax Internals | ✅ T-KWICK |
| 7 | `get`/`set` Accessors | ✅ T-KWICK |
| 8 | Inheritance (Prototypal & Class-Based) | ✅ T-KWICK |
| 9 | `Symbol.toPrimitive` | ✅ T-KWICK |
| 10 | `Proxy` | ✅ T-KWICK |
| 11 | `Reflect` | ✅ T-KWICK |
| 12 | Practical Metaprogramming | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 3` | 5 interview-style problems covering all 12 topics |
| `Generate Day 4` | Full lesson — Arrays, Objects, Strings & Iteration |
| `next topic` | Start Day 4's first subtopic |
| `recap` | Quick Day 3 summary |

> Doing one small thing beats opening a feed.
