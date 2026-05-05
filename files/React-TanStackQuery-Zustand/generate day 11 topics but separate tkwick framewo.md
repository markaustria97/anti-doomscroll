<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 11 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 11	Zustand Fundamentals
Why Zustand, hook-based stores, create, store shape, state plus actions, selectors, subscriptions, no-provider model, shallow merge behavior, immutable flat updates, immutable nested updates, Immer option, async actions, separating UI state from server cache

Here is the complete **Day 11 — Zustand Fundamentals** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 11 — Zustand Fundamentals

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — Why Zustand

## T — TL;DR

Zustand is a minimal, hook-based state library with no providers, no boilerplate, and surgical re-renders — making it the fastest path from "I need global state" to working code.[^2][^3]

## K — Key Concepts

**The comparison that explains why Zustand exists:**[^3][^4][^2]


|  | Context API | Redux Toolkit | Zustand |
| :-- | :-- | :-- | :-- |
| Providers needed | ✅ Required | ✅ Required | ❌ None |
| Re-render granularity | ❌ All consumers | ✅ Selectors | ✅ Selectors |
| Boilerplate | Medium | High | Minimal |
| Bundle size | 0 (built-in) | ~12KB | ~1KB |
| DevTools | ❌ | ✅ | ✅ middleware |
| Async state | Manual | Thunks/RTK Query | Native actions |
| Learning curve | Low | High | Very low |

**The 3 core reasons Zustand wins for client state:**[^2][^3]

```jsx
// REASON 1: No Provider — just import and use
import { useAuthStore } from "./stores/auth"

function Avatar() {
  const user = useAuthStore(s => s.user)
  return <img src={user.avatar} />
}
// No <Provider> wrapping required. Works in any component, anywhere. ✅

// REASON 2: Selective subscriptions — only re-render when YOUR slice changes
const sidebarOpen = useUIStore(s => s.sidebarOpen)
// Component only re-renders when sidebarOpen changes
// Other state changes in the same store → zero re-render ✅

// REASON 3: State + actions together — no action creators, no reducers
const useCountStore = create((set) => ({
  count: 0,
  increment: () => set(s => ({ count: s.count + 1 })),
  reset:     () => set({ count: 0 }),
}))
// One function call → complete store. No action types, no dispatch. ✅
```

**When to reach for Zustand vs other tools:**

```
Local UI state (1 component)   → useState
Shared UI state (multiple)     → Zustand
Server/async data               → TanStack Query (not Zustand)
Form state                      → React Hook Form
URL state                       → URL params / React Router
```


## W — Why It Matters

Redux has ~60 lines of boilerplate before your first state change. Context re-renders every consumer when any value changes. Zustand solves both problems with a <1KB library. In 2026, Zustand + TanStack Query covers 95% of state management needs in production React apps — understanding why it was built helps you use it correctly and confidently defend the architecture choice.[^3][^2]

## I — Interview Q\&A

**Q: Why would you choose Zustand over Redux Toolkit?**
**A:** Zustand requires no Provider wrapper, no action creators, no reducers, and no boilerplate — a complete store is one function call. RTK has more structure and is better for very large teams with strict conventions. For most apps, Zustand's simplicity and performance are the better trade-off.[^4][^2]

**Q: Why is Zustand better than React Context for global state?**
**A:** Context re-renders every subscriber whenever any value changes — there's no selector mechanism. Zustand uses selectors to subscribe components to specific slices, so only the components that depend on the changed value re-render. Zustand's selective re-render model scales; Context's does not.[^2][^3]

**Q: Should you use Zustand for server data (API responses)?**
**A:** No — Zustand is for client state (UI state, user preferences, app state). Server data has unique needs: caching, staleness, background refetching, deduplication. Use TanStack Query for server state and Zustand for everything else. Mixing them causes the same problems that Zustand was designed to avoid.[^5][^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using Zustand for server/API data | Use TanStack Query — Zustand doesn't handle caching, staleness, or refetch |
| Using Context instead of Zustand for shared UI state that updates frequently | Context causes all-consumer re-renders — Zustand's selectors are the right tool |
| Adding Zustand when `useState` + prop passing is sufficient | Only reach for Zustand when state genuinely needs to be shared across distant components |
| Comparing Zustand to TanStack Query — they're not competitors | They're complementary: Query for server state, Zustand for client state |

## K — Coding Challenge

**Challenge:** Classify each piece of state — which tool should own it and why?

```
A: Whether the sidebar navigation is open
B: The currently logged-in user's session token
C: A list of products fetched from /api/products
D: The user's preferred color theme (light/dark)
E: Form values for a checkout form
F: A shopping cart (stored client-side, synced to server on checkout)
G: Which modal is currently open
H: Notification count (fetched from server every 30 seconds)
```

**Solution:**

```
A: Zustand (UIStore) — shared UI state, multiple components care
B: Zustand (AuthStore) — client-side app state, not from a direct API call
C: TanStack Query — server data, needs caching + refetch
D: Zustand (UIStore) + localStorage — client preference, persisted
E: React Hook Form (local form state — not global)
F: Zustand (CartStore) — client-owned state that outlives components
G: Zustand (UIStore) — shared UI state affecting multiple sections
H: TanStack Query — server data with polling (refetchInterval)
```


***

# 2 — `create` \& Store Shape

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

## I — Interview Q\&A

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

# 3 — Selectors \& Subscriptions

## T — TL;DR

Selectors are functions passed to the store hook that extract a slice of state — components only re-render when their specific selector's return value changes, making Zustand surgically efficient.[^7][^5]

## K — Key Concepts

**Selector forms — from broad to narrow:**[^5]

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

**`useShallow` — the v5 way to select multiple values:**[^8][^5]

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

Selectors are Zustand's performance mechanism. A large store with 20 state properties — if accessed without selectors — re-renders every subscriber on every single update. With selectors, each component subscribes only to the exact values it needs, giving Zustand the re-render efficiency of atomic state managers (Jotai, Recoil) with a fraction of the API surface.[^7][^5]

## I — Interview Q\&A

**Q: What is a selector in Zustand and why does it matter for performance?**
**A:** A selector is the function you pass to the store hook — `useStore(s => s.count)`. Zustand runs this function after every state change and compares the result to the previous result by reference equality. If unchanged, the component doesn't re-render. Without a selector, any state change in the store re-renders the component.[^5]

**Q: When do you need `useShallow` in v5?**
**A:** When selecting multiple values as an object or array. A selector that returns `{ a, b }` creates a new object reference on every call, causing re-renders even when `a` and `b` haven't changed. `useShallow` wraps the selector and performs a shallow (one-level property) equality check instead of reference equality.[^8]

**Q: How do you subscribe to store changes outside a React component?**
**A:** Call `store.subscribe(selector, callback)` — `selector` picks the value to watch, `callback` fires when it changes with `(newValue, previousValue)`. Returns an unsubscribe function. Use this for side effects like analytics, persistence, or logging.[^5]

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

# 4 — No-Provider Model

## T — TL;DR

Zustand stores are JavaScript module singletons — no `<Provider>` wrapper is needed, and any component anywhere in the tree can import and read the store instantly.[^4][^2]

## K — Key Concepts

**How Zustand achieves no-provider:**[^4][^2]

```jsx
// The store is created at MODULE level — outside React
// It lives in JavaScript memory, not in the React tree
import { create } from "zustand"

export const useCountStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}))

// ↑ This module-level singleton exists when the file is imported
// React doesn't need to "provide" it — it's just a JS module
```

**Any component can use it — no tree position matters:**

```jsx
// Component A — deep in the tree
function DeepChildA() {
  const count = useCountStore((s) => s.count)
  return <p>{count}</p>
}

// Component B — completely different branch
function UnrelatedSidebarWidget() {
  const increment = useCountStore((s) => s.increment)
  return <button onClick={increment}>+</button>
}

// No common parent needs to provide anything ✅
// No prop drilling between A and B ✅
// Both components stay in sync automatically ✅
```

**Comparison — Context requires a provider, Zustand doesn't:**

```jsx
// ❌ Context — must wrap the tree
function App() {
  return (
    <ThemeProvider>          {/* required */}
      <AuthProvider>          {/* required */}
        <CartProvider>        {/* required */}
          <Router />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// ✅ Zustand — no wrapping needed
function App() {
  return <Router />   // nothing to set up
}
// Just import the hooks where needed
import { useThemeStore } from "./stores/theme"
import { useAuthStore } from "./stores/auth"
import { useCartStore } from "./stores/cart"
```

**When you DO want a provider (scoped stores):**[^6]

```jsx
// If you need multiple independent instances of a store (e.g., multiple
// modals, each with its own state), use createStore + useStore pattern
import { createStore, useStore } from "zustand"
import { createContext, useContext } from "react"

const StoreContext = createContext(null)

function ModalProvider({ children }) {
  const store = createStore((set) => ({  // createStore (not create) = no hook
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  }))
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

function useModalStore(selector) {
  const store = useContext(StoreContext)
  return useStore(store, selector)
}
```


## W — Why It Matters

The provider-free model eliminates the "provider hell" that's common in large React apps — layers of context providers, each requiring setup, each adding a React tree node. It also means you can use Zustand stores in non-component contexts: outside React (event handlers, WebSocket listeners, service workers), in test utilities, and in middleware — all without mocking a React tree.[^2][^4]

## I — Interview Q\&A

**Q: How does Zustand work without a Provider?**
**A:** Zustand stores are JavaScript module singletons created outside the React tree. React's Context API needs a Provider to inject a value into the tree; Zustand bypasses this entirely by living in module scope — when a component imports the store hook and calls it, it subscribes to the module-level store directly.[^4][^2]

**Q: Can you use a Zustand store outside of a React component?**
**A:** Yes — `useCountStore.getState()` returns the current state synchronously anywhere. `useCountStore.setState(...)` updates it. `useCountStore.subscribe(...)` subscribes to changes. These are all available without hooks, enabling usage in vanilla JS, WebSocket handlers, or test utilities.[^6]

**Q: When would you actually need a provider with Zustand?**
**A:** When you need multiple independent instances of the same store — for example, a modal component that appears multiple times, each with its own open/close state. Use `createStore` (not `create`) with a React Context to scope the store per instance.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Recreating the store inside a component — new store on every render | Always create stores at module level — `const useStore = create(...)` outside all components |
| Trying to pass Zustand stores as props | Import the store hook directly in any component — no passing needed |
| Not understanding that all module instances share state | One import = one singleton across your entire app — SSR needs special handling per request |
| SSR: store state leaking between server requests | Use `createStore` (not `create`) for SSR to create per-request stores |

## K — Coding Challenge

**Challenge:** Access the Zustand auth store in three different contexts: (1) a React component, (2) an Axios interceptor (outside React), and (3) a WebSocket message handler:

**Solution:**

```jsx
// stores/auth.ts
import { create } from "zustand"

interface AuthState {
  token: string | null
  user: { id: number; name: string } | null
  setAuth: (token: string, user: AuthState["user"]) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null }),
}))

// ── 1. React component (hook API) ──
function UserAvatar() {
  const user = useAuthStore((s) => s.user)
  return user ? <img src={`/avatars/${user.id}`} /> : <LoginButton />
}

// ── 2. Axios interceptor (outside React — no hook) ──
import axios from "axios"

axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token  // ✅ .getState() = synchronous read
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()       // ✅ .getState().action() = call action
    }
    return Promise.reject(error)
  }
)

// ── 3. WebSocket message handler (outside React) ──
const ws = new WebSocket("wss://api.example.com/live")

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.type === "TOKEN_REFRESH") {
    useAuthStore.getState().setAuth(
      message.newToken,
      useAuthStore.getState().user       // ✅ read current user, update token
    )
  }
}
```


***

# 5 — Shallow Merge Behavior

## T — TL;DR

Zustand's `set()` performs a shallow merge by default — it only merges top-level properties, not nested objects, so nested state updates require explicit spreading or Immer.[^9][^1]

## K — Key Concepts

**What shallow merge means:**[^9][^1]

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

**Why shallow merge is a smart default:**[^1]

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

Shallow merge is the most common source of accidental data loss in Zustand. Developers new to Zustand often update a nested object — `set({ user: { name: "Bob" } })` — not realizing they've deleted all other user properties. Understanding the merge depth boundary is essential before touching any nested state.[^9][^1]

## I — Interview Q\&A

**Q: What does "shallow merge" mean in Zustand's `set()` function?**
**A:** `set()` merges the provided object with the existing state at the top level only. Top-level properties not mentioned are preserved. But if you pass a nested object, the entire nested object replaces the previous one — no deep merging occurs.[^9][^1]

**Q: How do you safely update a nested property without losing other nested values?**
**A:** Spread the existing nested object: `set(s => ({ user: { ...s.user, name: "Bob" } }))`. This merges your update into the existing object instead of replacing it.[^10]

**Q: What does `set(newState, true)` do in Zustand?**
**A:** The second argument `true` enables `replace` mode — the entire store state is replaced with `newState`, no merging. Any properties not in `newState` are deleted. Use for full resets or when you need complete state replacement.[^9][^1]

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

# 6 — Immutable Flat \& Nested Updates

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

## I — Interview Q\&A

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

# 7 — Immer Option

## T — TL;DR

The `immer` middleware lets you write direct mutations inside `set()` — Immer converts them to safe immutable updates under the hood, eliminating all manual spreading for nested state.[^11]

## K — Key Concepts

**Installing and enabling Immer:**[^11]

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

**Side-by-side comparison — without vs with Immer:**[^11]

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

At 2+ levels of nesting, manual spreading becomes the primary source of bugs — a missed spread deletes sibling data silently. Immer eliminates the entire class of spreading errors while keeping Zustand's simple `set` API. For any store with nested objects, Immer is the professional standard.[^11]

## I — Interview Q\&A

**Q: How does Immer middleware work with Zustand?**
**A:** Immer wraps the `set` function. When you call `set(draft => { draft.x.y.z = value })`, Immer uses JavaScript Proxies to record your mutations against a draft copy of the state, then produces a new immutable object with only the changed parts updated. React sees a new reference and re-renders correctly.[^11]

**Q: Does Immer mean you can mutate state anywhere in Zustand?**
**A:** No — Immer only works inside the function passed to `set()`. The `draft` parameter inside the `set` callback is the Immer-proxied object. Outside of `set()`, the state object is still immutable and must not be mutated directly.[^11]

**Q: What is the performance cost of Immer?**
**A:** Immer adds minimal overhead — Proxy-based mutation tracking is fast for typical app state sizes. The tradeoff in developer experience (no spreading errors) almost always outweighs the tiny runtime cost. For extremely performance-sensitive stores with gigantic state objects, manual spreading may be preferred.[^11]

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

# 8 — Async Actions

## T — TL;DR

Zustand actions are plain functions — async actions are just `async` functions inside the store that call `set()` multiple times to update loading, data, and error state throughout the async lifecycle.[^12]

## K — Key Concepts

**Async actions — no middleware needed:**[^12]

```jsx
const usePostsStore = create((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null })   // 1. set loading

    try {
      const response = await fetch("/api/posts")
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()

      set({ posts: data, isLoading: false }) // 2. set data
    } catch (error) {
      set({ error: error.message, isLoading: false }) // 3. set error
    }
  },

  clearError: () => set({ error: null }),
}))
```

**Multiple `set()` calls in async actions:**

```jsx
const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadUser: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const user = await fetchUser(userId)
      set({ user, isLoading: false })
    } catch (e) {
      set({ isLoading: false, error: e.message })
    }
  },

  saveUser: async (updates) => {
    set({ isSaving: true })
    try {
      // Read current state mid-async with get()
      const currentUser = get().user
      const saved = await updateUser(currentUser.id, updates)
      set({ user: saved, isSaving: false })
    } catch (e) {
      set({ isSaving: false, error: e.message })
    }
  },
}))
```

**IMPORTANT — but better with TanStack Query:**[^3][^12]

```jsx
// ✅ Use Zustand async actions for:
// - Auth flows (login, logout, token refresh)
// - One-time app initialization
// - Client state mutations with side effects
// - File uploads with progress tracking

// ✅ Use TanStack Query for:
// - Fetching server data that needs caching
// - Background refetching
// - Server list/detail CRUD
// - Anything that benefits from staleTime, retry, deduplication

// The pattern: Zustand owns the async side effects;
// TanStack Query owns the server data caching.
```

**Async action with progress tracking:**

```jsx
const useUploadStore = create((set) => ({
  progress: 0,
  isUploading: false,
  uploadedUrl: null,
  error: null,

  uploadFile: async (file) => {
    set({ isUploading: true, progress: 0, error: null })

    try {
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        const percent = Math.round((e.loaded / e.total) * 100)
        set({ progress: percent })   // ✅ multiple set() calls = live progress
      }

      const uploadedUrl = await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(JSON.parse(xhr.responseText).url)
        xhr.onerror = () => reject(new Error("Upload failed"))
        xhr.open("POST", "/api/upload")
        xhr.send(formData)
      })

      set({ uploadedUrl, isUploading: false, progress: 100 })
    } catch (e) {
      set({ error: e.message, isUploading: false, progress: 0 })
    }
  },
}))
```


## W — Why It Matters

Zustand async actions are the cleanest pattern for client-driven async flows — auth, initialization, uploads — that don't benefit from TanStack Query's server-caching model. Multiple `set()` calls within a single async function give you granular loading state (loading, saving, uploading progress) that a `useQuery` `isPending` boolean can't express.[^12]

## I — Interview Q\&A

**Q: Do Zustand async actions need special middleware like Redux thunks?**
**A:** No — Zustand actions are plain JavaScript functions. Async functions just work. Call `set()` as many times as needed throughout the async flow. No special async middleware, no action creators, no dispatch.[^12]

**Q: How do you read current state inside an async action after an `await`?**
**A:** Use `get()` — it always returns the current state, even after awaited async operations. `set()` updater functions also receive current state, but between `await` calls, `get()` is the correct way to ensure you're reading the latest value (not a stale closure).[^1]

**Q: When should you use Zustand async actions vs TanStack Query?**
**A:** Zustand for: auth flows, one-time initialization, client-only mutations (cart, UI preferences), and operations with complex loading stages. TanStack Query for: any data fetched from a server API that benefits from caching, background refetch, retry, or deduplication.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing API response data in Zustand instead of TanStack Query | Use TanStack Query for server data — Zustand for client-owned state |
| Not setting `isLoading: false` in the catch block — stuck loader | Always set loading to false in both try AND catch |
| Reading state with a stale closure after `await` | Use `get()` or the functional form `set(s => ...)` to always get the latest state |
| No error state in async actions — silent failures | Always have an `error` field and set it in the catch block |

## K — Coding Challenge

**Challenge:** Build a complete `useAuthStore` with async `login`, `logout`, and `refreshToken` actions, including loading and error states for each:

**Solution:**

```jsx
import { create } from "zustand"

const useAuthStore = create((set, get) => ({
  // ── STATE ──
  user: null,
  token: null,
  isAuthenticated: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isRefreshing: false,
  authError: null,

  // ── ASYNC ACTIONS ──
  login: async (credentials) => {
    set({ isLoggingIn: true, authError: null })
    try {
      const { user, token } = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }).then(r => {
        if (!r.ok) throw new Error("Invalid credentials")
        return r.json()
      })

      // Store token in memory (secure) and optionally localStorage
      set({ user, token, isAuthenticated: true, isLoggingIn: false })
    } catch (e) {
      set({ isLoggingIn: false, authError: e.message })
    }
  },

  logout: async () => {
    set({ isLoggingOut: true })
    try {
      // Tell server to invalidate session
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${get().token}` },
      })
    } finally {
      // Always clear local auth state, even if server request fails
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoggingOut: false,
        authError: null,
      })
    }
  },

  refreshToken: async () => {
    if (get().isRefreshing) return   // prevent concurrent refresh
    set({ isRefreshing: true })
    try {
      const { token } = await fetch("/api/auth/refresh", {
        method: "POST",
      }).then(r => {
        if (!r.ok) throw new Error("Session expired")
        return r.json()
      })
      set({ token, isRefreshing: false })
    } catch (e) {
      // Refresh failed — force logout
      set({ user: null, token: null, isAuthenticated: false, isRefreshing: false })
    }
  },

  clearError: () => set({ authError: null }),
}))
```


***

# 9 — Separating UI State from Server Cache

## T — TL;DR

Keep client UI state (modals, themes, layout) in Zustand and server/async data (API responses, cached lists) in TanStack Query — mixing them into one store or tool creates a maintenance and performance anti-pattern.[^3][^5]

## K — Key Concepts

**The clean architecture — one tool per job:**[^3][^5]

```
┌─────────────────────────────────────────┐
│            ZUSTAND (Client State)        │
│  theme, sidebar, modals, cart, auth,    │
│  user preferences, filters, pagination  │
│  state, form dirty flag, drag state     │
└─────────────────────────────────────────┘
                    ↕ separate
┌─────────────────────────────────────────┐
│        TANSTACK QUERY (Server Cache)    │
│  users, products, orders, posts,        │
│  notifications, inventory, search       │
│  results, paginated data, mutations     │
└─────────────────────────────────────────┘
```

**What happens when you mix them — the anti-pattern:**

```jsx
// ❌ ANTI-PATTERN: Storing server data in Zustand
const useProductStore = create((set) => ({
  products: [],               // server data in Zustand
  isLoading: false,
  selectedProduct: null,      // UI state in Zustand ✅ (this is fine)

  fetchProducts: async () => {
    set({ isLoading: true })
    const data = await fetchProducts()
    set({ products: data, isLoading: false })
  },
  // ❌ Now you've manually reimplemented: caching, staleTime,
  // background refetch, deduplication, retry — all without the tooling
}))

// ✅ CORRECT: Let each tool do its job
// TanStack Query owns server data
const { data: products, isPending } = useQuery({
  queryKey: ["products"],
  queryFn: fetchProducts,
  staleTime: 1000 * 60,
})

// Zustand owns UI state that's independent of server data
const selectedProductId = useUIStore((s) => s.selectedProductId)
const setSelectedProduct = useUIStore((s) => s.setSelectedProduct)
```

**The common "combination" pattern — UI state + Query data together:**

```jsx
// Zustand store: owns filters and pagination (UI state)
const useProductUIStore = create((set) => ({
  page: 1,
  category: "all",
  sort: "name",
  selectedIds: new Set(),

  setPage:     (page) => set({ page }),
  setCategory: (category) => set({ category, page: 1 }),  // reset page on filter
  setSort:     (sort) => set({ sort }),
  toggleSelect: (id) => set((s) => {
    const next = new Set(s.selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    return { selectedIds: next }
  }),
}))

// TanStack Query: drives the actual fetch using Zustand's UI state as params
function ProductGrid() {
  // UI state from Zustand
  const { page, category, sort } = useProductUIStore(
    useShallow((s) => ({ page: s.page, category: s.category, sort: s.sort }))
  )

  // Server data from TanStack Query (uses Zustand state as query params)
  const { data, isPending } = useQuery({
    queryKey: ["products", { page, category, sort }],  // Zustand state drives the key
    queryFn: () => fetchProducts({ page, category, sort }),
    placeholderData: keepPreviousData,
  })

  return <ProductList products={data?.products} isPending={isPending} />
}
```


## W — Why It Matters

The single biggest architectural mistake in React apps is using Zustand (or Redux) as a cache for server data. You end up manually reimplementing everything TanStack Query provides — staleness detection, background refetch, retry, deduplication, DevTools inspection — and doing it worse. The separation isn't just clean code — it's using tools for what they were designed to do, which means you get all their features for free.[^5][^3]

## I — Interview Q\&A

**Q: When should you put data in Zustand vs TanStack Query?**
**A:** Zustand for data the client owns and controls: UI state, user preferences, auth tokens, cart items, filter/sort state, drag-and-drop state. TanStack Query for data that lives on a server and needs to be fetched, cached, and kept fresh: users, products, orders, posts, notifications.[^3][^5]

**Q: How do you use Zustand and TanStack Query together?**
**A:** Zustand holds the UI state (filters, pagination, selected items). Components read from Zustand, then pass that state as parameters into TanStack Query's `queryKey` and `queryFn`. Zustand drives WHAT to fetch; TanStack Query handles HOW to fetch, cache, and refresh it.[^5]

**Q: Can you store the TanStack Query client in Zustand?**
**A:** No — the QueryClient is a TanStack-owned singleton accessed via `useQueryClient()`. Don't store it in Zustand. For cross-store invalidation (e.g., logout clearing all query cache), call `queryClient.clear()` inside a Zustand async action.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| API response arrays stored in Zustand with a custom `isLoading` flag | Move to TanStack Query — you get caching, retry, and DevTools for free |
| Keeping filter state in TanStack Query (e.g., as query params) without a Zustand store | Filters are UI state — Zustand for filters, Query for results driven by those filters |
| Syncing between Zustand state and TanStack Query cache with effects | They're separate concerns — read Zustand state into Query keys, not into cache syncing |
| Clearing Zustand auth on logout but not clearing TanStack Query cache | Call `queryClient.clear()` in your logout action — server data for the old user must go |

## K — Coding Challenge

**Challenge:** Build a complete, architecturally clean product search page where: filters live in Zustand, server results come from TanStack Query, and logout clears both:

**Solution:**

```jsx
// stores/searchStore.ts — UI state only
const useSearchStore = create((set) => ({
  query: "",
  category: "all",
  priceRange: { min: 0, max: 10000 },
  sortBy: "relevance",
  page: 1,

  setQuery:     (query) => set({ query, page: 1 }),
  setCategory:  (category) => set({ category, page: 1 }),
  setPriceRange:(range) => set({ priceRange: range, page: 1 }),
  setSortBy:    (sortBy) => set({ sortBy }),
  setPage:      (page) => set({ page }),
  resetFilters: () => set({ query: "", category: "all", page: 1, sortBy: "relevance" }),
}))

// stores/authStore.ts — auth + logout clears query cache
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const { user, token } = await authAPI.login(credentials)
    set({ user, token, isAuthenticated: true })
  },

  logout: async () => {
    await authAPI.logout()
    set({ user: null, token: null, isAuthenticated: false })
    // Clear TanStack Query cache — old user's data must not persist
    queryClient.clear()       // ✅ removes all cached server data on logout
  },
}))

// queries/useSearchResults.ts — TanStack Query for server data
function useSearchResults() {
  const { query, category, priceRange, sortBy, page } = useSearchStore(
    useShallow((s) => ({
      query: s.query, category: s.category,
      priceRange: s.priceRange, sortBy: s.sortBy, page: s.page,
    }))
  )

  return useQuery({
    queryKey: ["search", { query, category, priceRange, sortBy, page }],
    queryFn: ({ signal }) =>
      searchAPI.products({ query, category, priceRange, sortBy, page }, signal),
    enabled: query.length >= 2 || category !== "all",
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  })
}

// components/SearchPage.tsx — thin, clean, reads from both
function SearchPage() {
  const { query, setQuery, category, setCategory, resetFilters } = useSearchStore(
    useShallow((s) => ({
      query: s.query, setQuery: s.setQuery,
      category: s.category, setCategory: s.setCategory,
      resetFilters: s.resetFilters,
    }))
  )
  const { data, isPending, isFetching, isPlaceholderData } = useSearchResults()

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />
      <CategoryFilter value={category} onChange={setCategory} />
      <button onClick={resetFilters}>Reset</button>

      <div style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
        {isPending ? <SearchSkeleton /> : <ResultGrid results={data?.items} />}
      </div>
    </div>
  )
}
```


***

> **Your tiny action right now:** Pick subtopic 2 (create + store shape) or 9 (separation of concerns). Write a 5-line store from memory using `create`. That's your session done.
<span style="display:none">[^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://zustand.docs.pmnd.rs/reference/apis/create

[^2]: https://www.salmanizhar.com/blog/zustand-redux-context-api-comparison

[^3]: https://www.segevsinay.com/blog/state-management-react-2026

[^4]: https://mintlify.wiki/pmndrs/zustand/comparison

[^5]: https://tkdodo.eu/blog/working-with-zustand

[^6]: https://zustand.docs.pmnd.rs/reference/index

[^7]: https://zustand.docs.pmnd.rs/learn/guides/auto-generating-selectors

[^8]: https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5

[^9]: https://github.com/pmndrs/zustand/discussions/2805

[^10]: https://zustand.docs.pmnd.rs/learn/guides/updating-state

[^11]: https://sanjewa.com/blogs/advanced-zustand-patterns-slices-middleware/

[^12]: https://gist.github.com/mosioc/8205471f30fcd5dc1bd06cfcbeb7df63

[^13]: https://dev.to/vishwark/mastering-zustand-the-modern-react-state-manager-v4-v5-guide-8mm

[^14]: https://stackoverflow.com/questions/76940115/react-zustand-immer-asynchronous-update-state

[^15]: https://zustand.docs.pmnd.rs/learn/index

