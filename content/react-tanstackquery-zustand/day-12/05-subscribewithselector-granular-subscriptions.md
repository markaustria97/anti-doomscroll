# 5 — `subscribeWithSelector` & Granular Subscriptions

## T — TL;DR

`subscribeWithSelector` middleware enables selector-based subscriptions outside React — subscribe to a specific slice of state and react only when that exact value changes, without mounting a component.

## K — Key Concepts

**Basic `subscribeWithSelector`:**

```jsx
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

const useStore = create(
  subscribeWithSelector((set) => ({
    count: 0,
    user: null,
    theme: "light",
    increment: () => set((s) => ({ count: s.count + 1 })),
  }))
)

// Subscribe to a specific slice — fires only when count changes
const unsubscribe = useStore.subscribe(
  (state) => state.count,              // selector
  (newCount, previousCount) => {       // callback (new, previous)
    console.log(`Count: ${previousCount} → ${newCount}`)
    if (newCount >= 10) analytics.track("count_reached_10")
  }
)

// Later: clean up
unsubscribe()
```

**Options — `equalityFn` and `fireImmediately`:**

```jsx
useStore.subscribe(
  (state) => state.user,
  (newUser, previousUser) => {
    if (newUser?.id !== previousUser?.id) syncUserToSentry(newUser)
  },
  {
    equalityFn: (a, b) => a?.id === b?.id,   // custom equality — fire only when ID changes
    fireImmediately: true,                    // fire with current value on subscription
  }
)
```

**Real-world use cases for subscriptions outside React:**

```jsx
// 1. Sync Zustand auth to API client headers
useAuthStore.subscribe(
  (state) => state.token,
  (token) => {
    if (token) apiClient.defaults.headers.Authorization = `Bearer ${token}`
    else delete apiClient.defaults.headers.Authorization
  },
  { fireImmediately: true }   // set header immediately on app load ✅
)

// 2. Sync theme to document
useUIStore.subscribe(
  (state) => state.theme,
  (theme) => {
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  },
  { fireImmediately: true }
)

// 3. Persist specific state to URL (filter state)
useFilterStore.subscribe(
  (state) => state.filters,
  (filters) => {
    const params = new URLSearchParams(filters)
    window.history.replaceState(null, "", `?${params}`)
  }
)

// 4. Analytics — track navigation breadcrumbs
useRouterStore.subscribe(
  (state) => state.currentRoute,
  (newRoute, previousRoute) => {
    analytics.page(newRoute, { from: previousRoute })
  }
)
```


## W — Why It Matters

Without `subscribeWithSelector`, the only way to react to Zustand state changes is inside a React component. But many side effects don't belong in components — syncing auth headers, updating the document theme, persisting to URL, triggering analytics. `subscribeWithSelector` is the bridge between Zustand's state machine and the outside world, enabling reactive side effects without component coupling.

## I — Interview Q&A

**Q: What does `subscribeWithSelector` add that basic `subscribe` doesn't have?**
**A:** Basic `subscribe` fires on every state change with the full state object. `subscribeWithSelector` adds a selector parameter — the callback only fires when the selected value changes (by reference equality or a custom `equalityFn`). This prevents unwanted callback executions when unrelated state changes.

**Q: When would you use `subscribeWithSelector` instead of a React component with a `useEffect`?**
**A:** For side effects that don't need to render anything — syncing state to an API client, updating `document` attributes, reacting to WebSocket events, or triggering analytics. These are infrastructure concerns that should live outside the component tree.

**Q: What does `fireImmediately: true` do in the subscribe options?**
**A:** It fires the callback immediately with the current state value at the time of subscription — equivalent to calling `subscribe` AND immediately executing the callback with the current value. Use it when the side effect must be applied at app start, not just on future changes (e.g., setting the auth header from a persisted token).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting to unsubscribe — memory leaks in SPAs | Store the return value and call `unsubscribe()` when no longer needed |
| Missing `subscribeWithSelector` middleware — `.subscribe` doesn't accept a selector | Wrap the store with `subscribeWithSelector(...)` middleware |
| Calling `useStore.subscribe(selector, cb)` without the middleware | Without the middleware, `.subscribe` only takes a single callback argument |
| Putting `subscribeWithSelector` subscriptions inside components without cleanup | Use `useEffect(() => { const unsub = ...; return unsub }, [])` for component-mounted subscriptions |

## K — Coding Challenge

**Challenge:** Set up three `subscribeWithSelector` subscriptions at app startup: (1) sync auth token to Axios headers, (2) sync theme to `document`, (3) track cart item count changes for analytics:

**Solution:**

```jsx
// stores/uiStore.ts
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

export const useAuthStore = create(
  subscribeWithSelector((set) => ({
    token: null,
    user: null,
    login: (token, user) => set({ token, user }),
    logout: () => set({ token: null, user: null }),
  }))
)

export const useUIStore = create(
  subscribeWithSelector((set) => ({
    theme: "light",
    toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  }))
)

export const useCartStore = create(
  subscribeWithSelector((set) => ({
    cart: [],
    addItem: (item) => set((s) => ({ cart: [...s.cart, item] })),
  }))
)

// app/subscriptions.ts — all side-effect subscriptions in one place
import axios from "axios"

export function initSubscriptions() {
  // 1. Auth token → Axios header
  const unsubAuth = useAuthStore.subscribe(
    (state) => state.token,
    (token) => {
      if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`
      else delete axios.defaults.headers.common.Authorization
      console.log("Auth header updated")
    },
    { fireImmediately: true }   // ← set header on app load from persisted token ✅
  )

  // 2. Theme → document attribute
  const unsubTheme = useUIStore.subscribe(
    (state) => state.theme,
    (theme) => {
      document.documentElement.setAttribute("data-theme", theme)
      document.documentElement.classList.toggle("dark", theme === "dark")
    },
    { fireImmediately: true }   // ← apply theme before first paint ✅
  )

  // 3. Cart count → analytics (only when count actually changes)
  const unsubCart = useCartStore.subscribe(
    (state) => state.cart.length,
    (newCount, prevCount) => {
      analytics.track("cart_size_changed", { from: prevCount, to: newCount })
    }
    // No fireImmediately — only track actual changes ✅
  )

  // Return cleanup function for app teardown (e.g., testing)
  return () => {
    unsubAuth()
    unsubTheme()
    unsubCart()
  }
}

// main.tsx / index.tsx
initSubscriptions()   // ← call once at app startup
```


***
