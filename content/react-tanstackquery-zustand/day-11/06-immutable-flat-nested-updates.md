# 6 — Immutable Flat & Nested Updates

## T — TL;DR

Flat state updates in Zustand are trivially simple; nested updates require explicit spreading at every level of nesting — or Immer, which lets you write mutations that auto-produce immutable output.[^10]

## K — Key Concepts

**Flat state updates — one-liner pattern:**[^10]

```jsx
const useCartStore = create((set) => ({
  itemCount: 0,
  total: 0,
  currency: "PHP",

  // ✅ Flat updates — clean and simple
  setItemCount: (n) => set({ itemCount: n }),
  setCurrency:  (c) => set({ currency: c }),

  // ✅ Flat functional update (depends on previous state)
  incrementCount: () => set((s) => ({ itemCount: s.itemCount + 1 })),
  addToTotal:     (amount) => set((s) => ({ total: s.total + amount })),
}))
```

**Single-level nested updates — spread the object:**[^10]

```jsx
const useUserStore = create((set) => ({
  user: { name: "Alice", age: 30, active: true },

  // ✅ Update one field in user — spread preserves the rest
  updateName: (name) => set((s) => ({ user: { ...s.user, name } })),
  updateAge:  (age)  => set((s) => ({ user: { ...s.user, age } })),
  deactivate: ()     => set((s) => ({ user: { ...s.user, active: false } })),
}))
```

**Two-level nested updates — spread at every level:**[^10]

```jsx
const useSettingsStore = create((set) => ({
  settings: {
    profile: { name: "Alice", bio: "" },
    privacy: { publicProfile: true, showEmail: false },
    notifications: { email: true, push: false, sms: false },
  },

  // ✅ Update nested property — spread ALL levels above it
  updateBio: (bio) =>
    set((s) => ({
      settings: {
        ...s.settings,                              // spread top level
        profile: { ...s.settings.profile, bio },   // spread second level
      },
    })),

  togglePush: () =>
    set((s) => ({
      settings: {
        ...s.settings,
        notifications: {
          ...s.settings.notifications,
          push: !s.settings.notifications.push,
        },
      },
    })),
}))
```

**Array updates — immutable patterns:**

```jsx
const useTodoStore = create((set) => ({
  todos: [],

  // Add
  addTodo: (todo) =>
    set((s) => ({ todos: [...s.todos, { ...todo, id: crypto.randomUUID() }] })),

  // Update by ID
  toggleTodo: (id) =>
    set((s) => ({
      todos: s.todos.map((t) => t.id === id ? { ...t, done: !t.done } : t),
    })),

  // Remove by ID
  deleteTodo: (id) =>
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

  // Update a specific field in a specific array item
  updateTodoTitle: (id, title) =>
    set((s) => ({
      todos: s.todos.map((t) => t.id === id ? { ...t, title } : t),
    })),
}))
```


## W — Why It Matters

Immutable updates are required because React's rendering depends on reference equality — if you mutate state in place, React sees the same object reference and doesn't re-render. Each nesting level requires its own spread. This pattern is correct but verbose; at 3+ levels deep it becomes error-prone — which is exactly when to reach for Immer.[^10]

## I — Interview Q&A

**Q: Why can't you just mutate state directly in Zustand — `state.user.name = "Bob"`?**
**A:** Zustand (and React) depends on reference equality for detecting changes. If you mutate in place, the object reference doesn't change — React sees the same reference and skips the re-render. Immutable updates create new references, signaling to React that something changed.[^10]

**Q: How do you correctly update a property 3 levels deep immutably in Zustand?**
**A:** Spread at every level: `set(s => ({ a: { ...s.a, b: { ...s.a.b, c: newValue } } }))`. Each level gets a new object reference. Without spreading at every level, you either lose sibling properties or produce no reference change.

**Q: What is the immutable pattern for updating one item in an array?**
**A:** Use `.map()` — it returns a new array. `todos.map(t => t.id === id ? { ...t, done: !t.done } : t)`. The matched item gets a new spread object; all others return the same reference unchanged (structural sharing).[^10]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Spreading only the top level when updating 2+ levels deep | Spread at every level between the root and the changed property |
| Using `push()`, `splice()`, or direct property assignment | Use spread + map/filter — always return new array/object references |
| Spreading to update but forgetting the wrapping state level | `set(s => ({ settings: { ...s.settings, profile: { ...s.settings.profile, bio } } }))` |
| 4+ levels of spreading — code becomes unreadable | Switch to Immer middleware — direct mutations auto-produce immutable output |

## K — Coding Challenge

**Challenge:** Implement a store for a user profile with deeply nested state. The `settings.notifications.channels.push.enabled` field needs to be toggled without losing any sibling data:

**Solution:**

```jsx
const useDeepStore = create((set) => ({
  settings: {
    theme: "light",
    notifications: {
      enabled: true,
      channels: {
        email: { enabled: true, frequency: "daily" },
        push: { enabled: false, frequency: "instant" },
        sms: { enabled: false, frequency: "weekly" },
      },
    },
  },

  // Update deeply nested value — spread at every level ✅
  togglePushNotifications: () =>
    set((s) => ({
      settings: {
        ...s.settings,
        notifications: {
          ...s.settings.notifications,
          channels: {
            ...s.settings.notifications.channels,
            push: {
              ...s.settings.notifications.channels.push,
              enabled: !s.settings.notifications.channels.push.enabled,
            },
          },
        },
      },
    })),

  // Update a channel's frequency
  setChannelFrequency: (channel, frequency) =>
    set((s) => ({
      settings: {
        ...s.settings,
        notifications: {
          ...s.settings.notifications,
          channels: {
            ...s.settings.notifications.channels,
            [channel]: {
              ...s.settings.notifications.channels[channel],
              frequency,
            },
          },
        },
      },
    })),
}))

// ↑ 5 levels of spreading — this is exactly when to use Immer (next subtopic)
```


***
