# 3 — Selectors & Subscriptions

## T — TL;DR

Selectors are functions passed to the store hook that extract a slice of state — components only re-render when their specific selector's return value changes, making Zustand surgically efficient.

## K — Key Concepts

**Selector forms — from broad to narrow:**

```jsx
// 1. No selector — subscribes to ENTIRE store, re-renders on any change
const state = useStore()    // ❌ every state change = re-render

// 2. Primitive selector — re-renders only when count changes
const count = useStore((s) => s.count)   // ✅ most efficient

// 3. Multiple values — use useShallow (v5) to prevent unnecessary re-renders
import { useShallow } from "zustand/shallow"

const { count, label } = useStore(
  useShallow((s) => ({ count: s.count, label: s.label }))
)
// Without useShallow: new object reference every render → always re-renders
// With useShallow:    shallow compares each property → only re-renders on actual change ✅

// 4. Derived/computed selector
const doubleCount = useStore((s) => s.count * 2)

// 5. Action-only selector — stable function reference, never causes re-render
const increment = useStore((s) => s.increment)
```

**`useShallow` — the v5 way to select multiple values:**

```jsx
import { useShallow } from "zustand/shallow"

// Selecting multiple state values safely
const { firstName, lastName } = useUserStore(
  useShallow((s) => ({ firstName: s.firstName, lastName: s.lastName }))
)

// Selecting an array of values
const [todos, filter] = useTodoStore(
  useShallow((s) => [s.todos, s.filter])
)
// Without useShallow: new array reference every time = infinite re-renders
// With useShallow:    compares [todos, filter] shallowly ✅
```

**Subscriptions outside React — `subscribe`:**

```jsx
// Subscribe to state changes outside a component (e.g., analytics, side effects)
const unsubscribe = useCountStore.subscribe(
  (state) => state.count,            // selector
  (newCount, previousCount) => {     // callback
    if (newCount > 100) analytics.track("count_exceeded_100")
  }
)

// Cleanup when no longer needed
unsubscribe()

// Subscribe to entire store (no selector)
const unsubscribe = useStore.subscribe((state) => {
  localStorage.setItem("state", JSON.stringify(state))
})
```


## W — Why It Matters

Selectors are Zustand's performance mechanism. A large store with 20 state properties — if accessed without selectors — re-renders every subscriber on every single update. With selectors, each component subscribes only to the exact values it needs, giving Zustand the re-render efficiency of atomic state managers (Jotai, Recoil) with a fraction of the API surface.

## I — Interview Q&A

**Q: What is a selector in Zustand and why does it matter for performance?**
**A:** A selector is the function you pass to the store hook — `useStore(s => s.count)`. Zustand runs this function after every state change and compares the result to the previous result by reference equality. If unchanged, the component doesn't re-render. Without a selector, any state change in the store re-renders the component.

**Q: When do you need `useShallow` in v5?**
**A:** When selecting multiple values as an object or array. A selector that returns `{ a, b }` creates a new object reference on every call, causing re-renders even when `a` and `b` haven't changed. `useShallow` wraps the selector and performs a shallow (one-level property) equality check instead of reference equality.

**Q: How do you subscribe to store changes outside a React component?**
**A:** Call `store.subscribe(selector, callback)` — `selector` picks the value to watch, `callback` fires when it changes with `(newValue, previousValue)`. Returns an unsubscribe function. Use this for side effects like analytics, persistence, or logging.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `useStore()` with no selector — subscribes to everything | Always pass a selector; at minimum `s => s.specificValue` |
| Returning an object from a selector without `useShallow` | `useStore(useShallow(s => ({ a: s.a, b: s.b })))` — always wrap multi-value selectors |
| Inline selector function — new reference every render | Move the selector outside the component or use `useCallback` for complex selectors |
| Using `.subscribe()` without cleaning up — memory leak | Store the return value and call `unsubscribe()` in a cleanup function |

## K — Coding Challenge

**Challenge:** A `UserMenu` component needs `user.name` and `user.avatar`. A `ThemeToggle` needs only `theme`. A `SidePanel` needs `sidebarOpen` and the `toggleSidebar` action. Implement each with correct selector usage:

**Solution:**

```jsx
import { create } from "zustand"
import { useShallow } from "zustand/shallow"

const useUIStore = create((set) => ({
  theme: "light",
  sidebarOpen: false,
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

const useUserStore = create((set) => ({
  user: { name: "Mark", avatar: "/avatar.jpg", email: "mark@example.com" },
  updateUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
}))

// 1. UserMenu — needs two nested values from user
function UserMenu() {
  // ✅ useShallow because we're selecting multiple values
  const { name, avatar } = useUserStore(
    useShallow((s) => ({ name: s.user.name, avatar: s.user.avatar }))
  )
  return (
    <div>
      <img src={avatar} alt={name} />
      <span>{name}</span>
    </div>
  )
}

// 2. ThemeToggle — single primitive + action
function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)                     // ✅ primitive → no useShallow
  const toggleTheme = useUIStore((s) => s.toggleTheme)         // ✅ function → stable reference

  return (
    <button onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  )
}

// 3. SidePanel — boolean + action
function SidePanel({ children }) {
  // ✅ useShallow for multiple values
  const { sidebarOpen, toggleSidebar } = useUIStore(
    useShallow((s) => ({ sidebarOpen: s.sidebarOpen, toggleSidebar: s.toggleSidebar }))
  )
  return (
    <aside style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
      <button onClick={toggleSidebar}>✕ Close</button>
      {children}
    </aside>
  )
}
```


***
