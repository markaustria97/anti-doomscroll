# 6 — `useSyncExternalStore`

## T — TL;DR

`useSyncExternalStore` safely subscribes a React component to an external store — any data source outside React state — with built-in protection against UI tearing in concurrent rendering.[^3][^11]

## K — Key Concepts

**The API:**[^3]

```jsx
const snapshot = useSyncExternalStore(
  subscribe,    // (callback) => unsubscribe — called when store changes
  getSnapshot,  // () => currentValue — must return a stable reference if unchanged
  getServerSnapshot  // optional: for SSR
)
```

**Anatomy — subscribing to a browser API:**

```jsx
// Subscribe to the online/offline status (external to React)
function useOnlineStatus() {
  return useSyncExternalStore(
    // subscribe: attach/detach listeners
    (callback) => {
      window.addEventListener("online", callback)
      window.addEventListener("offline", callback)
      return () => {
        window.removeEventListener("online", callback)
        window.removeEventListener("offline", callback)
      }
    },
    // getSnapshot: return current value
    () => navigator.onLine,
    // getServerSnapshot: SSR fallback
    () => true
  )
}

function StatusBadge() {
  const isOnline = useOnlineStatus()
  return <span>{isOnline ? "🟢 Online" : "🔴 Offline"}</span>
}
```

**Subscribing to a custom store:**

```jsx
// A simple external store (outside React)
let store = { count: 0 }
let listeners = new Set()

const countStore = {
  getSnapshot: () => store,
  subscribe: (callback) => {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },
  increment: () => {
    store = { count: store.count + 1 }  // ✅ must create new reference
    listeners.forEach(cb => cb())        // notify React
  }
}

// Component subscribes to the external store
function Counter() {
  const { count } = useSyncExternalStore(
    countStore.subscribe,
    countStore.getSnapshot
  )
  return (
    <div>
      <p>{count}</p>
      <button onClick={countStore.increment}>+1</button>
    </div>
  )
}
```

**Why `getSnapshot` must return stable references:**[^11]

```jsx
// ❌ New array reference every call → infinite re-render loop
getSnapshot: () => [...state.items]

// ✅ Same reference if data hasn't changed
getSnapshot: () => state.items  // only changes when you assign a new array
```


## W — Why It Matters

Before `useSyncExternalStore`, subscribing to external stores with `useEffect` + `useState` caused "tearing" in React 18's concurrent rendering — different parts of the UI could show different snapshots of the same store in a single render pass. `useSyncExternalStore` is the only React-approved way to subscribe to any external data source safely.[^12][^11]

## I — Interview Q&A

**Q: What is `useSyncExternalStore` and when would you use it?**
**A:** It's a React hook for subscribing to external stores — data that lives outside React state (browser APIs, Zustand, Redux, custom pub-sub systems). It provides two guarantees: (1) your component re-renders when the store changes, and (2) it's safe from tearing in concurrent rendering.

**Q: What is "UI tearing" and how does `useSyncExternalStore` prevent it?**
**A:** Tearing happens when different components reading the same external store see different values within a single render pass — because React's concurrent renderer can interleave renders. `useSyncExternalStore` forces synchronous reads of the store snapshot, guaranteeing all components see the same value in one render.[^11]

**Q: Why must `getSnapshot` return a stable reference when data hasn't changed?**
**A:** React calls `getSnapshot` frequently to check for changes using `Object.is` comparison. If `getSnapshot` returns a new object/array reference every call (even with the same data), React sees a "change" every time and loops into infinite re-renders.[^12][^11]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `getSnapshot` returning new array/object reference every call | Cache the reference — only return a new object when data actually changes |
| Defining `subscribe` inline inside component → resubscribes every render | Move `subscribe` outside the component or wrap in `useCallback` |
| Using `useEffect` + `useState` for external stores in React 18+ | Use `useSyncExternalStore` — it's the correct API for external subscriptions |
| Forgetting the server snapshot for SSR | Provide the third argument for SSR environments to avoid hydration mismatch |

## K — Coding Challenge

**Challenge:** Build a `useMediaQuery` hook using `useSyncExternalStore` that returns `true` when a CSS media query matches:

**Solution:**

```jsx
function useMediaQuery(query) {
  return useSyncExternalStore(
    // subscribe: listen to media query changes
    (callback) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", callback)
      return () => mql.removeEventListener("change", callback)
    },
    // getSnapshot: current match status (boolean — stable primitive ✅)
    () => window.matchMedia(query).matches,
    // getServerSnapshot: safe SSR fallback
    () => false
  )
}

// Usage — no manual event listener cleanup needed
function ResponsiveNav() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  return (
    <nav>
      {isMobile ? <HamburgerMenu /> : <DesktopNav />}
      <p>Animations: {prefersReducedMotion ? "reduced" : "full"}</p>
    </nav>
  )
}
```


***
