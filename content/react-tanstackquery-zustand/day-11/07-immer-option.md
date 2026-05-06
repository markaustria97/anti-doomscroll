# 7 — Immer Option

## T — TL;DR

The `immer` middleware lets you write direct mutations inside `set()` — Immer converts them to safe immutable updates under the hood, eliminating all manual spreading for nested state.

## K — Key Concepts

**Installing and enabling Immer:**

```bash
npm install immer
```

```jsx
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"  // ← built into zustand/middleware

const useSettingsStore = create(
  immer((set) => ({
    settings: {
      theme: "light",
      notifications: {
        channels: {
          push: { enabled: false, frequency: "instant" },
          email: { enabled: true, frequency: "daily" },
        },
      },
    },

    // ✅ Direct mutation — Immer makes it immutable automatically
    togglePush: () =>
      set((state) => {
        state.settings.notifications.channels.push.enabled =
          !state.settings.notifications.channels.push.enabled
      }),

    setTheme: (theme) =>
      set((state) => {
        state.settings.theme = theme
      }),
  }))
)
```

**Side-by-side comparison — without vs with Immer:**

```jsx
// ❌ WITHOUT Immer — verbose spreading at every level
togglePush: () =>
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

// ✅ WITH Immer — direct mutation, same result
togglePush: () =>
  set((state) => {
    state.settings.notifications.channels.push.enabled =
      !state.settings.notifications.channels.push.enabled
  }),
// Zero nesting, zero spreading, zero risk of missing a level ✅
```

**Immer with arrays:**

```jsx
const useTodoStore = create(
  immer((set) => ({
    todos: [],

    // Add — push directly (normally mutates, Immer makes it safe)
    addTodo: (text) =>
      set((state) => {
        state.todos.push({ id: crypto.randomUUID(), text, done: false })
      }),

    // Toggle — find and mutate directly
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id)
        if (todo) todo.done = !todo.done
      }),

    // Remove — splice directly (Immer makes it immutable)
    deleteTodo: (id) =>
      set((state) => {
        const index = state.todos.findIndex((t) => t.id === id)
        if (index !== -1) state.todos.splice(index, 1)
      }),
  }))
)
```

**Combining Immer with other middleware:**

```jsx
import { devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

const useStore = create(
  devtools(
    persist(
      immer((set) => ({
        // your state and actions
      })),
      { name: "my-store" }
    )
  )
)
// Middleware wrapping order matters: devtools → persist → immer → creator
```


## W — Why It Matters

At 2+ levels of nesting, manual spreading becomes the primary source of bugs — a missed spread deletes sibling data silently. Immer eliminates the entire class of spreading errors while keeping Zustand's simple `set` API. For any store with nested objects, Immer is the professional standard.

## I — Interview Q&A

**Q: How does Immer middleware work with Zustand?**
**A:** Immer wraps the `set` function. When you call `set(draft => { draft.x.y.z = value })`, Immer uses JavaScript Proxies to record your mutations against a draft copy of the state, then produces a new immutable object with only the changed parts updated. React sees a new reference and re-renders correctly.

**Q: Does Immer mean you can mutate state anywhere in Zustand?**
**A:** No — Immer only works inside the function passed to `set()`. The `draft` parameter inside the `set` callback is the Immer-proxied object. Outside of `set()`, the state object is still immutable and must not be mutated directly.

**Q: What is the performance cost of Immer?**
**A:** Immer adds minimal overhead — Proxy-based mutation tracking is fast for typical app state sizes. The tradeoff in developer experience (no spreading errors) almost always outweighs the tiny runtime cost. For extremely performance-sensitive stores with gigantic state objects, manual spreading may be preferred.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Returning from Immer's `set` callback — conflicts with mutation | In Immer, either mutate the draft OR return a new value — not both |
| Mutating state outside `set()` thinking Immer covers it | Immer only proxies the draft inside `set(draft => ...)` — not the whole store |
| Forgetting to wrap with `immer()` middleware — mutations break state | Always check that `immer(...)` is in the middleware chain |
| Using Immer for flat state with no nesting — unnecessary overhead | Use plain `set()` for flat state; Immer shines for 2+ levels of nesting |

## K — Coding Challenge

**Challenge:** Rewrite the deeply nested `useDeepStore` from Subtopic 6 using Immer middleware — compare the before/after line count:

**Solution:**

```jsx
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

const useDeepStore = create(
  immer((set) => ({
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

    // ✅ Was 15 lines of spreading — now 3 lines
    togglePushNotifications: () =>
      set((state) => {
        state.settings.notifications.channels.push.enabled =
          !state.settings.notifications.channels.push.enabled
      }),

    // ✅ Dynamic channel update — trivial with Immer
    setChannelFrequency: (channel, frequency) =>
      set((state) => {
        state.settings.notifications.channels[channel].frequency = frequency
      }),

    // ✅ Toggle all notifications at once
    toggleAllNotifications: () =>
      set((state) => {
        const notif = state.settings.notifications
        notif.enabled = !notif.enabled
        Object.keys(notif.channels).forEach((ch) => {
          notif.channels[ch].enabled = notif.enabled
        })
      }),

    setTheme: (theme) =>
      set((state) => {
        state.settings.theme = theme
      }),
  }))
)

// Before: 45 lines of spreading across 2 actions
// After:  12 lines with Immer — 73% reduction ✅
```


***
