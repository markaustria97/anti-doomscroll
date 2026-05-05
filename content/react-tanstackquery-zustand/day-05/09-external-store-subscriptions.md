# 9 — External Store Subscriptions

## T — TL;DR

Subscribe to any external store — Zustand, Redux, browser APIs, custom pub-sub — using `useSyncExternalStore` to guarantee tear-free rendering and automatic re-render on store changes.[^3][^11]

## K — Key Concepts

**Building a minimal external store from scratch:**

```jsx
// A store is: state + subscribe + notify
function createStore(initialState) {
  let state = initialState
  const listeners = new Set()

  return {
    getSnapshot: () => state,
    subscribe: (callback) => {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
    setState: (updater) => {
      state = typeof updater === "function" ? updater(state) : updater
      listeners.forEach(cb => cb())  // notify all subscribers
    }
  }
}

// Create stores outside React — shared across components
const cartStore = createStore({ items: [], total: 0 })
const authStore = createStore({ user: null, token: null })
```

**Subscribing in components:**

```jsx
function CartBadge() {
  const { items } = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot
  )
  return <span>{items.length}</span>
}

function CartPage() {
  const { items, total } = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot
  )
  // ...
}

// Both CartBadge and CartPage read the same store — no tearing ✅
```

**Selector pattern — subscribe to only a slice:**

```jsx
// Without selector: re-renders on ANY store change
const store = useSyncExternalStore(subscribe, getSnapshot)

// With selector: re-renders only when the selected value changes
function useCartItemCount() {
  return useSyncExternalStore(
    cartStore.subscribe,
    () => cartStore.getSnapshot().items.length  // ✅ returns primitive — stable
  )
}

// ⚠️ Avoid selector that returns new object/array reference every time:
() => cartStore.getSnapshot().items  // array ref changes → infinite loop
() => cartStore.getSnapshot().items.length  // primitive → stable ✅
```

**Real-world: subscribing to Redux store:**

```jsx
// What react-redux does under the hood
function useSelector(selector) {
  return useSyncExternalStore(
    reduxStore.subscribe,
    () => selector(reduxStore.getState())
  )
}
```


## W — Why It Matters

This is the architecture behind every major React state management library — Zustand, Jotai, Valtio, and React-Redux all implement this pattern. Understanding `useSyncExternalStore` gives you insight into how these libraries work and the ability to build your own lightweight state solutions without a third-party dependency.[^11][^3]

## I — Interview Q&A

**Q: What are the two required arguments to `useSyncExternalStore`?**
**A:** `subscribe` — a function that takes a callback and calls it whenever the store changes, returning an unsubscribe function. `getSnapshot` — a function that returns the current store value. React uses `subscribe` to know when to re-read, and `getSnapshot` to get the current value.[^3]

**Q: How is `useSyncExternalStore` different from `useEffect` + `useState` for subscribing to external data?**
**A:** `useEffect` + `useState` is susceptible to tearing in React 18 concurrent rendering — different components can read different store values in the same render pass. `useSyncExternalStore` reads the snapshot synchronously and consistently across all components in a render, preventing tearing.[^11]

**Q: What is a "selector" in the context of `useSyncExternalStore`?**
**A:** A function passed to `getSnapshot` that extracts only the slice of store state a component needs. It prevents unnecessary re-renders — the component only re-renders when its selected value changes, not on every store mutation.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `subscribe` defined inside component → resubscribes every render | Define `subscribe` outside the component or in `useMemo`/`useCallback` |
| `getSnapshot` selector returning new object every call → loop | Return primitives or stable references from selectors |
| Using `useEffect` + `setState` for external stores in React 18 | Migrate to `useSyncExternalStore` — required for tearing-safe concurrent rendering |
| Mutating store state directly without notifying listeners | Always call `setState` or equivalent — direct mutation skips listener notifications |

## K — Coding Challenge

**Challenge:** Build a `useTheme` hook backed by a real external theme store that persists to `localStorage`:

**Solution:**

```jsx
// External store — lives outside React
function createThemeStore() {
  const STORAGE_KEY = "app-theme"
  let state = { theme: localStorage.getItem(STORAGE_KEY) || "light" }
  const listeners = new Set()

  return {
    getSnapshot: () => state,
    subscribe: (callback) => {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
    toggle: () => {
      const next = state.theme === "light" ? "dark" : "light"
      state = { theme: next }                    // new reference ✅
      localStorage.setItem(STORAGE_KEY, next)    // persist to localStorage
      listeners.forEach(cb => cb())              // notify React
    }
  }
}

const themeStore = createThemeStore()  // ✅ singleton — defined outside React

// Custom hook
function useTheme() {
  const { theme } = useSyncExternalStore(
    themeStore.subscribe,              // ✅ stable reference — defined outside component
    themeStore.getSnapshot,
    () => ({ theme: "light" })        // ✅ SSR fallback
  )
  return { theme, toggle: themeStore.toggle }
}

// Usage in any component
function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle}>
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  )
}
```


***

> **Your tiny action right now:** Pick subtopic 1 or 6. Read the TL;DR and the comparison table. Do the coding challenge. You're done for this session.
<span style="display:none">[^14][^15][^16]</span>

<div align="center">⁂</div>

[^1]: https://react.dev/reference/react/useImperativeHandle

[^2]: https://react.dev/reference/react/useLayoutEffect

[^3]: https://react.dev/reference/react/useSyncExternalStore

[^4]: https://dev.to/a1guy/dont-misuse-useref-in-react-the-practical-guide-you-actually-need-5aj6

[^5]: https://react.dev/reference/react/forwardRef

[^6]: https://www.mindsetconsulting.com/utilizing-power-reacts-forwardref-useimperativehandle/

[^7]: https://peerlist.io/jagss/articles/how-to-use-useimperativehandle-in-react-the-right-way

[^8]: https://namastedev.com/blog/react-uselayouteffect-vs-useeffect-6/

[^9]: https://www.codeyourpath.com/2025/09/12/uselayouteffect-vs-useeffect/

[^10]: https://www.telerik.com/blogs/uselayouteffect-vs-useeffect-react

[^11]: https://www.epicreact.dev/use-sync-external-store-demystified-for-practical-react-development-w5ac0

[^12]: https://julesblom.com/writing/usesyncexternalstore

[^13]: https://react.dev/reference/react/useEffect

[^14]: https://www.codeguage.com/v1/courses/react/advanced-forwarding-refs

[^15]: https://www.reddit.com/r/reactjs/comments/144sk3d/help_with_forwardref_and_useimperativehandle/

[^16]: https://dev.to/zidanegimiga/useref-forwardrefs-and-useimperativehandler-4dj3
