# 5 — Shallow Merge Behavior

## T — TL;DR

Zustand's `set()` performs a shallow merge by default — it only merges top-level properties, not nested objects, so nested state updates require explicit spreading or Immer.

## K — Key Concepts

**What shallow merge means:**

```jsx
// Store state:
const state = {
  count: 0,
  user: { name: "Alice", age: 30 },
  theme: "light",
}

// set() shallow merges at the TOP level only:
set({ count: 1 })
// Result: { count: 1, user: { name: "Alice", age: 30 }, theme: "light" }
// ✅ Only count changed — user and theme preserved

// set() does NOT deep merge nested objects:
set({ user: { name: "Bob" } })
// Result: { count: 0, user: { name: "Bob" }, theme: "light" }
// ❌ user.age is GONE — the entire user object was replaced
```

**The `replace` parameter — full replacement:**

```jsx
// replace: true → completely replaces state (no merge)
set({ count: 5, user: null, theme: "dark" }, true)
// → state is now EXACTLY { count: 5, user: null, theme: "dark" }
// Any properties not listed are deleted ✅

// Use case: full state reset
const resetStore = () =>
  set({ count: 0, user: null, theme: "light" }, true)  // replace all
```

**Why shallow merge is a smart default:**

```jsx
// ✅ Shallow merge means you only need to specify what changed
set({ count: 1 })          // user, theme untouched automatically
// vs Context / useState which requires:
setState(prev => ({ ...prev, count: 1 }))   // must spread manually

// Zustand's shallow merge IS the spread — it does it for you at the top level
```

**Visualizing shallow vs deep:**

```
State: { a: 1, b: { c: 2, d: 3 }, e: 5 }

set({ a: 99 })
Result: { a: 99, b: { c: 2, d: 3 }, e: 5 }   ← shallow merge ✅ b untouched

set({ b: { c: 99 } })
Result: { a: 1, b: { c: 99 }, e: 5 }           ← b.d is GONE ❌
// b was replaced entirely — not merged
```


## W — Why It Matters

Shallow merge is the most common source of accidental data loss in Zustand. Developers new to Zustand often update a nested object — `set({ user: { name: "Bob" } })` — not realizing they've deleted all other user properties. Understanding the merge depth boundary is essential before touching any nested state.

## I — Interview Q&A

**Q: What does "shallow merge" mean in Zustand's `set()` function?**
**A:** `set()` merges the provided object with the existing state at the top level only. Top-level properties not mentioned are preserved. But if you pass a nested object, the entire nested object replaces the previous one — no deep merging occurs.

**Q: How do you safely update a nested property without losing other nested values?**
**A:** Spread the existing nested object: `set(s => ({ user: { ...s.user, name: "Bob" } }))`. This merges your update into the existing object instead of replacing it.

**Q: What does `set(newState, true)` do in Zustand?**
**A:** The second argument `true` enables `replace` mode — the entire store state is replaced with `newState`, no merging. Any properties not in `newState` are deleted. Use for full resets or when you need complete state replacement.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `set({ user: { name: "Bob" } })` deletes `user.age` and other properties | `set(s => ({ user: { ...s.user, name: "Bob" } }))` — spread the existing nested object |
| Using `replace: true` accidentally during partial updates | Only use `true` for intentional full replacements (like store reset) |
| Assuming `set` deep merges like `lodash.merge` | It doesn't — spread manually or use Immer middleware for deep updates |
| Not using functional update form when new value depends on old value | `set(s => ({ count: s.count + 1 }))` — always use functional form for dependent updates |

## K — Coding Challenge

**Challenge:** Given this store, identify which `set` calls are dangerous (accidentally delete data) and fix each one:

```jsx
const useProfileStore = create((set) => ({
  user: {
    name: "Alice",
    age: 30,
    address: { city: "Manila", zip: "1234" },
  },
  preferences: { theme: "light", notifications: true },

  // Which of these are buggy?
  updateName:         (name) => set({ user: { name } }),
  updateTheme:        (theme) => set({ preferences: { theme } }),
  updateCity:         (city) => set((s) => ({ user: { address: { city } } })),
  updateNotifications:(val) => set((s) => ({ preferences: { ...s.preferences, notifications: val } })),
  resetUser:          () => set({ user: null }),
}))
```

**Solution:**

```jsx
const useProfileStore = create((set) => ({
  user: {
    name: "Alice",
    age: 30,
    address: { city: "Manila", zip: "1234" },
  },
  preferences: { theme: "light", notifications: true },

  // ❌ BUGGY: user: { name } replaces entire user — loses age and address
  // ✅ FIX:
  updateName: (name) =>
    set((s) => ({ user: { ...s.user, name } })),

  // ❌ BUGGY: preferences: { theme } replaces all preferences — loses notifications
  // ✅ FIX:
  updateTheme: (theme) =>
    set((s) => ({ preferences: { ...s.preferences, theme } })),

  // ❌ BUGGY: user is spread but address: { city } loses address.zip
  // ✅ FIX: spread at every nesting level
  updateCity: (city) =>
    set((s) => ({
      user: {
        ...s.user,
        address: { ...s.user.address, city },   // ← spread address too
      },
    })),

  // ✅ CORRECT — already uses spread
  updateNotifications: (val) =>
    set((s) => ({ preferences: { ...s.preferences, notifications: val } })),

  // ✅ CORRECT — intentional full reset of user (replace the user value entirely)
  resetUser: () => set({ user: null }),
}))
```


***
