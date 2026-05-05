# 2 — `create` & Store Shape

## T — TL;DR

`create` is the single function that defines your entire Zustand store — it takes a callback receiving `set` and `get`, and returns a custom React hook your components call directly.[^6][^1]

## K — Key Concepts

**The complete `create` anatomy:**[^1][^6]

```jsx
import { create } from "zustand"

const useCounterStore = create((set, get) => ({
  //                           ↑     ↑
  //                         set() get()
  //                         update read current state

  // ── STATE ──
  count: 0,
  label: "Counter",

  // ── ACTIONS ──
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset:     () => set({ count: 0 }),

  // ── ACTIONS THAT READ STATE (use get()) ──
  incrementByDouble: () => set({ count: get().count * 2 }),
}))
```

**The return value is a React hook:**

```jsx
// useCounterStore IS the hook — call it anywhere in a component
function CounterDisplay() {
  const count = useCounterStore((state) => state.count)
  return <p>{count}</p>
}

function CounterButtons() {
  const { increment, decrement, reset } = useCounterStore((state) => ({
    increment: state.increment,
    decrement: state.decrement,
    reset:     state.reset,
  }))
  return (
    <>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </>
  )
}
```

**Store shape conventions — state and actions together:**

```jsx
// ✅ Convention: group state properties first, actions below
const useAuthStore = create((set) => ({
  // ── STATE PROPERTIES ──
  user: null,
  token: null,
  isAuthenticated: false,

  // ── ACTIONS (verbs) ──
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  updateProfile: (updates) => set((state) => ({
    user: { ...state.user, ...updates },
  })),
}))
```

**`set` vs `get` — when to use each:**

```jsx
// set(newStateOrUpdater) — update state
// → always use functional form when new state depends on old state
set((state) => ({ count: state.count + 1 }))   // ✅ safe
set({ count: state.count + 1 })                  // ❌ stale closure risk

// get() — read current state inside actions (not in components)
const doubleCount = () => {
  const current = get().count    // ✅ read current state outside a set() call
  set({ count: current * 2 })
}
```


## W — Why It Matters

Zustand's `create` API collapses the Redux pattern of `initialState + reducers + actions + selectors` into a single function. The hook it returns is also the selector — no `connect()`, no `mapStateToProps`, no dispatch. Understanding the `set`/`get` contract and the state-plus-actions shape convention is the complete mental model for 90% of Zustand usage.[^6][^1]

## I — Interview Q&A

**Q: What does `create` return in Zustand?**
**A:** A custom React hook. You call this hook in any component (with or without a selector) to access the store. No Provider setup required — the store is a module-level singleton.[^1][^6]

**Q: When should you use `get()` inside an action instead of reading state inside `set()`?**
**A:** Use `get()` when you need to read the current state outside of a `set()` updater function — for example, when composing multiple reads before a single write, or when reading state in an `async` action between `await` calls. Inside `set()`, always use the functional form `set(state => ...)` to avoid stale closure issues.[^1]

**Q: Should actions be defined inside or outside the store?**
**A:** Inside — co-locating actions with state is Zustand's recommended pattern. This keeps the data contract in one place, avoids prop drilling the `set` function, and lets actions access both `set` and `get`.[^5]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `set({ count: state.count + 1 })` — stale closure | Always use functional update: `set(s => ({ count: s.count + 1 }))` |
| Calling `get()` inside a `set()` updater | Use the `state` parameter from `set(state => ...)` instead |
| Defining actions outside the store and calling `set` directly | Keep actions inside the store — they have cleaner access to `get` and `set` |
| Creating the store inside a component — new store on every render | Always create stores at module level (outside components) |

## K — Coding Challenge

**Challenge:** Build a complete `useNotificationStore` with: a `notifications` array, an `unreadCount` derived via action, `addNotification`, `markRead`, and `clearAll` actions:

**Solution:**

```jsx
import { create } from "zustand"

const useNotificationStore = create((set, get) => ({
  // ── STATE ──
  notifications: [],

  // ── ACTIONS ──
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, id: crypto.randomUUID(), read: false },
        ...state.notifications,
      ],
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),

  // ── DERIVED ACTION (reads then writes) ──
  getUnreadCount: () =>
    get().notifications.filter((n) => !n.read).length,
}))

// Usage
function NotificationBell() {
  const { notifications, markRead, getUnreadCount } = useNotificationStore()
  return (
    <div>
      <span>🔔 {getUnreadCount()}</span>
      {notifications.map((n) => (
        <div key={n.id} onClick={() => markRead(n.id)}
          style={{ opacity: n.read ? 0.5 : 1 }}>
          {n.message}
        </div>
      ))}
    </div>
  )
}
```


***
