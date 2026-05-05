<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 12 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

12	Zustand Scaling and Integration	Slice pattern, bounded stores, cross-slice actions, persist, storage choices, hydration, SSR and hydration caveats, versioning and migration, subscribeWithSelector, devtools, granular subscriptions, reset-state patterns, Map and Set usage, React plus TanStack Query plus Zustand boundaries, auth state, theme state, filter state, UI state architecture

Here is the complete **Day 12 — Zustand Scaling and Integration** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3][^4]

***

# Day 12 — Zustand Scaling and Integration

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — Slice Pattern \& Bounded Stores

## T — TL;DR

The slice pattern splits a large Zustand store into focused, domain-specific functions that are combined into one "bounded store" — giving you code separation without sacrificing cross-slice coordination.[^2][^1]

## K — Key Concepts

**Why slices — the problem they solve:**[^1][^2]

```jsx
// ❌ One giant store — everything tangled together
const useBigStore = create((set, get) => ({
  user: null, token: null, login: () => {}, logout: () => {},          // auth
  cart: [], addToCart: () => {}, removeFromCart: () => {},             // cart
  theme: "light", toggleTheme: () => {},                               // UI
  sidebarOpen: false, toggleSidebar: () => {},                         // UI
  notifications: [], addNotification: () => {},                        // notifications
  // 200 more lines...
}))

// ✅ Slice pattern — each domain in its own file, merged into one store
```

**Slice creator signature — the key convention:**[^2][^1]

```jsx
// Each slice is a FUNCTION that takes (set, get, api) and returns its slice
const createAuthSlice = (set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,

  // Actions (can access other slices via get())
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
    get().clearCart()     // ← cross-slice: calls cart slice action via get()
  },
})

const createCartSlice = (set, get) => ({
  cart: [],
  addToCart: (item) => set((s) => ({ cart: [...s.cart, item] })),
  clearCart: () => set({ cart: [] }),
  getTotal: () => get().cart.reduce((sum, i) => sum + i.price, 0),
})

const createUISlice = (set) => ({
  theme: "light",
  sidebarOpen: false,
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
})
```

**Bounded store — combining all slices:**[^1][^2]

```jsx
import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

// Combine: spread each slice creator into one store ✅
export const useBoundStore = create(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createCartSlice(...a),
        ...createUISlice(...a),
      }),
      { name: "app-store" }
    ),
    { name: "AppStore" }
  )
)
```

**File structure for the slice pattern:**

```
src/
├── stores/
│   ├── slices/
│   │   ├── authSlice.ts     ← domain: user, token, login, logout
│   │   ├── cartSlice.ts     ← domain: cart, addToCart, clearCart
│   │   ├── uiSlice.ts       ← domain: theme, sidebar, modals
│   │   └── filterSlice.ts   ← domain: search filters, pagination
│   └── index.ts             ← useBoundStore combining all slices
```

**Using the bounded store in components:**

```jsx
function CartIcon() {
  // Selector works across slices — same hook
  const cartCount = useBoundStore((s) => s.cart.length)
  return <span>🛒 {cartCount}</span>
}

function UserMenu() {
  const { user, logout } = useBoundStore(
    useShallow((s) => ({ user: s.user, logout: s.logout }))
  )
  // logout internally calls clearCart() across slices ✅
  return <button onClick={logout}>{user?.name} (Logout)</button>
}
```


## W — Why It Matters

The slice pattern is how Zustand scales from a 20-line store to a 2,000-line codebase without becoming unmaintainable. Each slice has a single responsibility, lives in its own file, can be tested independently, and communicates with other slices through the shared `get()`. It mirrors the domain-driven structure that senior engineers expect in production apps.[^5][^2][^1]

## I — Interview Q\&A

**Q: What is the slice pattern in Zustand and why use it?**
**A:** The slice pattern splits a store into domain-specific creator functions, each defining state and actions for one concern (auth, cart, UI). They're combined with spread syntax inside a single `create()` call, forming a bounded store. Benefits: code organization by domain, single hook for components, and cross-slice communication via `get()`.[^2][^1]

**Q: What is a "bounded store" in Zustand?**
**A:** A bounded store is the single `create()` call that combines all slices into one unified hook — `useBoundStore`. "Bounded" means all slices share the same state context, so `get()` in any slice can read the entire store state including other slices. It contrasts with multiple independent stores.[^5][^1]

**Q: How do slices communicate with each other?**
**A:** Through `get()` — since all slices share the same store, `get()` returns the complete combined state. An action in `authSlice` can call `get().clearCart()` — a function defined in `cartSlice` — because both exist on the same store state object.[^5][^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| State key collisions across slices — two slices both define `isLoading` | Namespace keys: `authIsLoading`, `cartIsLoading`, or use nested objects per slice |
| Passing `set` from the bounded store into a slice that was written for a local `set` | Always write slices as `createSlice = (set, get) => (...)` — they receive the bounded store's `set` |
| Cross-slice calls using imported store hooks instead of `get()` | Use `get().action()` inside actions — don't import `useBoundStore` inside the store file |
| Forgetting to spread all slices in the bounded store | `...createAuthSlice(...a), ...createCartSlice(...a)` — every slice must be spread |

## K — Coding Challenge

**Challenge:** Build a 3-slice bounded store for an e-commerce app — `authSlice`, `cartSlice`, `notificationSlice` — where logout clears the cart AND adds a "Logged out" notification (cross-slice action):

**Solution:**

```jsx
// slices/authSlice.ts
export const createAuthSlice = (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    set({ user, token, isAuthenticated: true })
    get().addNotification({ message: `Welcome back, ${user.name}!`, type: "success" })
  },

  logout: () => {
    const name = get().user?.name
    set({ user: null, token: null, isAuthenticated: false })
    get().clearCart()                                    // ← cartSlice action
    get().addNotification({ message: `Goodbye, ${name}`, type: "info" }) // ← notificationSlice
  },
})

// slices/cartSlice.ts
export const createCartSlice = (set, get) => ({
  cart: [],
  addToCart: (item) => {
    set((s) => ({ cart: [...s.cart, item] }))
    get().addNotification({ message: `${item.name} added to cart`, type: "success" })
  },
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
})

// slices/notificationSlice.ts
export const createNotificationSlice = (set) => ({
  notifications: [],
  addNotification: ({ message, type = "info" }) =>
    set((s) => ({
      notifications: [
        { id: crypto.randomUUID(), message, type, at: Date.now() },
        ...s.notifications,
      ].slice(0, 10),   // max 10 notifications
    })),
  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
})

// stores/index.ts — bounded store
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export const useBoundStore = create(
  devtools(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createCartSlice(...a),
      ...createNotificationSlice(...a),
    }),
    { name: "AppStore" }
  )
)
```


***

# 2 — Cross-Slice Actions

## T — TL;DR

Cross-slice actions coordinate state changes across multiple slices in a single atomic operation — implemented using `get()` to read and call actions from other slices within the bounded store.[^5]

## K — Key Concepts

**3 patterns for cross-slice coordination:**[^1][^5]

```jsx
// PATTERN 1: Direct cross-slice call via get()
// One slice calls another slice's action
const createAuthSlice = (set, get) => ({
  logout: () => {
    set({ user: null, token: null })
    get().clearCart()           // ← calls cartSlice.clearCart
    get().resetFilters()        // ← calls filterSlice.resetFilters
  },
})

// PATTERN 2: Dedicated "orchestration" slice for complex cross-cutting actions
const createAppSlice = (set, get) => ({
  // Lives in its own slice — owns actions that touch multiple domains
  initializeApp: async () => {
    const token = get().token
    if (!token) return

    const [user, cart, preferences] = await Promise.all([
      fetchUser(token),
      fetchCart(token),
      fetchPreferences(token),
    ])

    // Update multiple slices in one set() call
    set({
      user,                           // authSlice state
      cart: cart.items,               // cartSlice state
      theme: preferences.theme,       // uiSlice state
      currency: preferences.currency, // uiSlice state
    })
  },

  resetAll: () =>
    set({
      user: null, token: null, isAuthenticated: false,  // auth reset
      cart: [],                                          // cart reset
      theme: "light", sidebarOpen: false,               // ui reset
      filters: {}, page: 1,                             // filter reset
    }, true),  // replace: true ← replaces entire store state ✅
})

// PATTERN 3: Atomic multi-slice update in a single set()
const createOrderSlice = (set, get) => ({
  placeOrder: async () => {
    const { cart, user } = get()
    const order = await submitOrder({ items: cart, userId: user.id })

    // Atomic update of multiple slices
    set({
      cart: [],                                             // clear cart
      orders: [...get().orders, order],                    // add to orders
      notifications: [
        { message: "Order placed! 🎉", type: "success" },
        ...get().notifications,
      ],
    })
  },
})
```

**Reading cross-slice state (not just calling actions):**

```jsx
const createCartSlice = (set, get) => ({
  cart: [],

  // Read from another slice before updating
  addToCart: (item) => {
    const isAuthenticated = get().isAuthenticated   // ← reads authSlice state

    if (!isAuthenticated) {
      get().addNotification({ message: "Please log in to add to cart", type: "warning" })
      return
    }

    const existingItem = get().cart.find((i) => i.id === item.id)
    if (existingItem) {
      set((s) => ({
        cart: s.cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }))
    } else {
      set((s) => ({ cart: [...s.cart, { ...item, quantity: 1 }] }))
    }
  },
})
```


## W — Why It Matters

Cross-slice actions are what make the bounded store model genuinely powerful versus just having multiple independent stores. A logout that clears cart, resets filters, adds a notification, and cancels pending requests — happens atomically in one action call. With separate stores, you'd need to coordinate all of this in a component or service layer, which couples your UI code to state coordination logic.[^5]

## I — Interview Q\&A

**Q: How do you call an action from Slice A inside Slice B?**
**A:** Use `get()` — it returns the entire combined store state including all other slices' actions. Inside Slice B's action, call `get().someActionFromSliceA()`. This works because all slices share the same store reference and their functions are merged into one state object.[^1][^5]

**Q: What is an "orchestration slice" and when do you use one?**
**A:** An orchestration slice (often `appSlice`) owns complex actions that coordinate multiple domains — initialization, checkout, full reset. It reads and updates state across all slices in a single operation. Use it when a workflow is too complex to belong to a single domain slice.[^5]

**Q: What's the difference between multiple `get()` calls vs a single `set()` with all changes?**
**A:** Multiple sequential `set()` calls trigger one re-render per call — potentially inefficient. A single `set({ ...allChanges })` is atomic — one state update, one re-render cycle. For cross-slice updates, batch into one `set()` call whenever possible.[^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Circular cross-slice dependencies — A calls B, B calls A | Extract the shared logic into a third "shared" or "app" slice |
| Forgetting that `get()` returns a snapshot — stale after `await` | After `await`, call `get()` again to read fresh state — not the pre-await snapshot |
| Multiple sequential `set()` calls for one logical operation | Batch into one `set({ ...allChanges })` — one state transition, one re-render |
| Action in Slice A imports Slice B's file directly | Always use `get()` — never import between slice files (circular deps + tight coupling) |

## K — Coding Challenge

**Challenge:** Build a `checkoutSlice` orchestration action that: validates auth, places the order, clears the cart, adds a success notification, and updates order history — all in one cross-slice action:

**Solution:**

```jsx
// slices/checkoutSlice.ts
export const createCheckoutSlice = (set, get) => ({
  orders: [],
  isCheckingOut: false,
  checkoutError: null,

  checkout: async () => {
    // Guard: must be authenticated
    if (!get().isAuthenticated) {
      get().addNotification({ message: "Please log in to checkout", type: "warning" })
      return
    }

    // Guard: cart must not be empty
    if (get().cart.length === 0) {
      get().addNotification({ message: "Your cart is empty", type: "error" })
      return
    }

    set({ isCheckingOut: true, checkoutError: null })

    try {
      const { cart, user, token } = get()   // read cross-slice state

      const order = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cart, userId: user.id }),
      }).then((r) => {
        if (!r.ok) throw new Error(`Checkout failed: HTTP ${r.status}`)
        return r.json()
      })

      // Atomic cross-slice update: cart + orders + notifications + checkout state
      set({
        cart: [],                                  // cartSlice: clear cart
        orders: [...get().orders, order],          // checkoutSlice: add order
        isCheckingOut: false,
        notifications: [                           // notificationSlice: success
          {
            id: crypto.randomUUID(),
            message: `Order #${order.id} placed! 🎉`,
            type: "success",
            at: Date.now(),
          },
          ...get().notifications,
        ],
      })
    } catch (error) {
      set({ isCheckingOut: false, checkoutError: error.message })
      get().addNotification({ message: error.message, type: "error" })
    }
  },
})
```


***

# 3 — `persist` Middleware

## T — TL;DR

The `persist` middleware saves Zustand state to a storage backend (localStorage, sessionStorage, AsyncStorage) and rehydrates it automatically on page load — with optional field selection, versioning, and migration.[^3][^6]

## K — Key Concepts

**Basic `persist` setup:**[^6][^3]

```jsx
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      fontSize: 16,
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "theme-preferences",         // ← localStorage key
      storage: createJSONStorage(() => localStorage),  // ← default: localStorage
    }
  )
)
// On page reload: theme and fontSize are read from localStorage automatically ✅
```

**`partialize` — only persist specific fields:**[^3][^6]

```jsx
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,          // ← transient: do NOT persist
      error: null,               // ← transient: do NOT persist

      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth",
      // Only persist token and user — skip transient UI state
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
// isLoading and error are always initialized to their defaults on reload ✅
```

**Storage choices:**[^7]

```jsx
// localStorage — default, synchronous, survives page close
storage: createJSONStorage(() => localStorage)

// sessionStorage — cleared when tab closes
storage: createJSONStorage(() => sessionStorage)

// Custom async storage (React Native, IndexedDB)
const asyncStorage = {
  getItem: async (name) => {
    const value = await AsyncStorage.getItem(name)
    return value ?? null
  },
  setItem: async (name, value) => AsyncStorage.setItem(name, value),
  removeItem: async (name) => AsyncStorage.removeItem(name),
}
storage: asyncStorage

// Custom with encryption
storage: createJSONStorage(() => ({
  getItem: (key) => decrypt(localStorage.getItem(key)),
  setItem: (key, value) => localStorage.setItem(key, encrypt(value)),
  removeItem: (key) => localStorage.removeItem(key),
}))
```


## W — Why It Matters

Without `persist`, every page reload loses all client state — the user's theme resets to light, their cart empties, their filter settings disappear. `persist` is a one-middleware solution that handles serialization, storage, and rehydration automatically. The `partialize` option is critical for not storing sensitive or transient data like error messages, loading flags, or temporary UI state.[^6][^3]

## I — Interview Q\&A

**Q: How does the `persist` middleware work in Zustand?**
**A:** It wraps the store's `set` function — whenever state changes, it serializes the state (or the `partialize` subset) to JSON and writes it to the storage backend. On initialization, it reads from storage and merges the persisted state with the store's defaults before the first render.[^3][^6]

**Q: What is `partialize` and why is it important?**
**A:** `partialize` is a function that receives the full state and returns only the portion to persist. It prevents storing transient state (loading flags, error messages, session-only data) that shouldn't survive a page reload. Without it, everything is persisted — including data you never want stored.[^6]

**Q: What's the difference between `localStorage` and `sessionStorage` for Zustand persist?**
**A:** `localStorage` persists indefinitely until explicitly cleared — good for preferences, auth tokens. `sessionStorage` is cleared when the browser tab closes — good for short-lived session data like current filters or view state that shouldn't survive a fresh session.[^7]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Persisting sensitive data (passwords, tokens) in localStorage without encryption | Use `partialize` to exclude sensitive fields, or use a custom encrypted storage |
| Persisting `isLoading`, `error`, UI-only state | Use `partialize` to whitelist only the data that should survive reload |
| Not using a unique `name` — two stores sharing the same key collide | Use descriptive namespaced names: `"auth-store"`, `"cart-v2"`, `"theme-prefs"` |
| Expecting synchronous hydration — accessing store before it's hydrated | Check `useStore.persist.hasHydrated()` or use the `onFinishHydration` callback |

## K — Coding Challenge

**Challenge:** Build a persisted cart store that: persists `cart` and `currency` but NOT `isLoading` or `error`, uses `sessionStorage` (cart clears on tab close), and exposes a `clearPersistedState` utility:

**Solution:**

```jsx
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const useCartStore = create(
  persist(
    (set, get) => ({
      // ── Persisted state ──
      cart: [],
      currency: "PHP",

      // ── Transient state (NOT persisted) ──
      isLoading: false,
      error: null,

      // ── Actions ──
      addItem: (item) =>
        set((s) => {
          const exists = s.cart.find((i) => i.id === item.id)
          return {
            cart: exists
              ? s.cart.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
              : [...s.cart, { ...item, quantity: 1 }],
          }
        }),

      removeItem: (id) => set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),
      setCurrency: (currency) => set({ currency }),
      clearCart: () => set({ cart: [] }),

      getTotal: () =>
        get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),

      // Clear persisted storage manually
      clearPersistedState: () => {
        set({ cart: [], currency: "PHP" })
        useCartStore.persist.clearStorage()   // ← removes the sessionStorage entry
      },
    }),
    {
      name: "cart-session",
      storage: createJSONStorage(() => sessionStorage),  // ✅ clears on tab close
      partialize: (state) => ({
        cart: state.cart,
        currency: state.currency,
        // isLoading and error are NOT included ✅
      }),
    }
  )
)
```


***

# 4 — Hydration, SSR, \& Versioning

## T — TL;DR

Zustand persist hydration and SSR require special care — `skipHydration` prevents hydration mismatches on the server, and `version` + `migrate` handle breaking schema changes across deployments.[^8][^6]

## K — Key Concepts

**The SSR hydration mismatch problem:**[^8]

```
Server render:
  Store initializes with defaults (no localStorage on server)
  → HTML: <p>theme: light</p>

Client hydration:
  localStorage has { theme: "dark" }
  → Zustand rehydrates → theme = "dark"
  → React sees DOM says "light" but store says "dark" → MISMATCH ⚠️

React throws a hydration error or silently shows wrong content.
```

**Solution — `skipHydration`:**[^8][^6]

```jsx
// 1. Skip automatic hydration on init
const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "theme",
      skipHydration: true,   // ← don't auto-hydrate on store creation
    }
  )
)

// 2. Manually hydrate AFTER React mounts (client-only)
// In Next.js App Router — layout.tsx or a client component:
function HydrationGate({ children }) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    useThemeStore.persist.rehydrate()   // ← safe: runs only on client
    setHydrated(true)
  }, [])

  // Optionally: render nothing until hydrated to avoid flash
  if (!hydrated) return <div style={{ visibility: "hidden" }}>{children}</div>
  return children
}
```

**Versioning — preventing stale persisted state from breaking your app:**[^6]

```jsx
persist(
  (set) => ({ /* store */ }),
  {
    name: "user-prefs",
    version: 2,   // ← bump when schema changes

    migrate: (persistedState, version) => {
      // version = the version stored in localStorage
      if (version === 0) {
        // v0 → v1: renamed "colour" to "theme"
        persistedState.theme = persistedState.colour
        delete persistedState.colour
      }
      if (version === 1) {
        // v1 → v2: split single "name" into "firstName" + "lastName"
        const [firstName = "", lastName = ""] = (persistedState.name ?? "").split(" ")
        persistedState.firstName = firstName
        persistedState.lastName = lastName
        delete persistedState.name
      }
      return persistedState   // ← return migrated state
    },
  }
)
```

**What happens on version mismatch without `migrate`:**

```
Stored version: 1 → Current version: 2
Without migrate: persisted state is DISCARDED → store uses defaults
With migrate:    persisted state is TRANSFORMED → data preserved ✅
```

**Hydration lifecycle hooks:**

```jsx
persist(
  (set) => ({ /* store */ }),
  {
    name: "my-store",
    onRehydrateStorage: (state) => {
      console.log("Hydration starting, initial state:", state)
      return (rehydratedState, error) => {
        if (error) console.error("Hydration failed:", error)
        else console.log("Hydrated successfully:", rehydratedState)
      }
    },
  }
)
```


## W — Why It Matters

Every production app that uses SSR (Next.js) with persist must handle the hydration mismatch problem — it causes subtle UI bugs that are hard to diagnose. Every app that ever deploys a schema change to persisted state must handle migration — without it, users with old data get broken stores or blank screens. Versioning is essentially database migrations for client-side state.[^8][^6]

## I — Interview Q\&A

**Q: What is a hydration mismatch and how does Zustand's `skipHydration` solve it?**
**A:** In SSR, the server renders with default state (no localStorage access). When the client hydrates, Zustand reads localStorage and updates the store — but React's hydration expects the DOM to match the server-rendered HTML. `skipHydration: true` prevents auto-rehydration at store creation; you manually call `rehydrate()` inside a `useEffect` (client-only), after React's initial hydration completes.[^6][^8]

**Q: What happens to persisted state when you add a new field to the store?**
**A:** The `merge` behavior (shallow merge by default) fills in missing fields from the store's defaults. New fields not in localStorage get their initial values from the store creator. No migration needed for purely additive changes — only for renames, deletions, or type changes.[^6]

**Q: When should you bump the `version` number in persist?**
**A:** Whenever you make a breaking schema change — renaming a key, splitting a field, changing a value's type, or removing a required field. Non-breaking changes (adding new fields with defaults) don't require a version bump since the shallow merge handles them.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| No `skipHydration` in Next.js — hydration mismatch errors | Add `skipHydration: true` and manually `rehydrate()` in `useEffect` |
| Changing store shape without bumping `version` — old data breaks new code | Always bump `version` and add a `migrate` case for breaking changes |
| `migrate` doesn't handle all old versions — users on v0 trying to reach v3 | Handle all version numbers in the migrate function — it runs once per version step |
| Accessing hydrated state synchronously on first render (SSR) | Use `useStore.persist.hasHydrated()` to gate renders that depend on persisted state |

## K — Coding Challenge

**Challenge:** A user preferences store has gone through 3 schema changes. Write the `persist` config with `version: 3` and a `migrate` function that handles all prior versions:

**Solution:**

```jsx
// Schema history:
// v0: { colour: "blue", showSidebar: true }
// v1: { theme: "light", showSidebar: true }         (renamed colour → theme)
// v2: { theme: "light", layout: { sidebar: true } }  (nested showSidebar → layout.sidebar)
// v3: { theme: "light", layout: { sidebar: true, density: "comfortable" } } (added density)

const usePrefsStore = create(
  persist(
    (set) => ({
      theme: "light",
      layout: { sidebar: true, density: "comfortable" },
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setSidebarOpen: (open) => set((s) => ({ layout: { ...s.layout, sidebar: open } })),
      setDensity: (density) => set((s) => ({ layout: { ...s.layout, density } })),
    }),
    {
      name: "user-preferences",
      version: 3,

      migrate: (persisted, fromVersion) => {
        // Apply migrations sequentially
        if (fromVersion < 1) {
          // v0 → v1: colour → theme
          persisted.theme = persisted.colour ?? "light"
          delete persisted.colour
        }
        if (fromVersion < 2) {
          // v1 → v2: flat showSidebar → nested layout.sidebar
          persisted.layout = { sidebar: persisted.showSidebar ?? true }
          delete persisted.showSidebar
        }
        if (fromVersion < 3) {
          // v2 → v3: add density with default
          persisted.layout = { ...(persisted.layout ?? {}), density: "comfortable" }
        }
        return persisted   // ← return fully migrated state ✅
      },

      // SSR-safe
      skipHydration: true,
    }
  )
)

// In _app.tsx or layout.tsx
function HydrationBoundary({ children }) {
  useEffect(() => {
    usePrefsStore.persist.rehydrate()
  }, [])
  return children
}
```


***

# 5 — `subscribeWithSelector` \& Granular Subscriptions

## T — TL;DR

`subscribeWithSelector` middleware enables selector-based subscriptions outside React — subscribe to a specific slice of state and react only when that exact value changes, without mounting a component.[^4]

## K — Key Concepts

**Basic `subscribeWithSelector`:**[^4]

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

Without `subscribeWithSelector`, the only way to react to Zustand state changes is inside a React component. But many side effects don't belong in components — syncing auth headers, updating the document theme, persisting to URL, triggering analytics. `subscribeWithSelector` is the bridge between Zustand's state machine and the outside world, enabling reactive side effects without component coupling.[^4]

## I — Interview Q\&A

**Q: What does `subscribeWithSelector` add that basic `subscribe` doesn't have?**
**A:** Basic `subscribe` fires on every state change with the full state object. `subscribeWithSelector` adds a selector parameter — the callback only fires when the selected value changes (by reference equality or a custom `equalityFn`). This prevents unwanted callback executions when unrelated state changes.[^4]

**Q: When would you use `subscribeWithSelector` instead of a React component with a `useEffect`?**
**A:** For side effects that don't need to render anything — syncing state to an API client, updating `document` attributes, reacting to WebSocket events, or triggering analytics. These are infrastructure concerns that should live outside the component tree.[^4]

**Q: What does `fireImmediately: true` do in the subscribe options?**
**A:** It fires the callback immediately with the current state value at the time of subscription — equivalent to calling `subscribe` AND immediately executing the callback with the current value. Use it when the side effect must be applied at app start, not just on future changes (e.g., setting the auth header from a persisted token).[^4]

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

# 6 — DevTools Integration

## T — TL;DR

The `devtools` middleware connects Zustand to Redux DevTools, giving you a time-travel debugger, action log, and state diff viewer with a single wrapper — no Redux required.[^9][^10]

## K — Key Concepts

**Enabling DevTools:**

```jsx
import { create } from "zustand"
import { devtools } from "zustand/middleware"

const useCountStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 }), false, "increment"),
      //                                                      ↑      ↑
      //                                              replace? action name in DevTools
    }),
    { name: "CountStore" }   // ← store name shown in DevTools
  )
)
```

**The action name third argument — making DevTools readable:**

```jsx
const useCartStore = create(
  devtools(
    (set, get) => ({
      cart: [],

      // ✅ Named actions — visible as labels in Redux DevTools
      addToCart: (item) =>
        set(
          (s) => ({ cart: [...s.cart, item] }),
          false,                    // replace? (false = merge)
          `cart/addItem: ${item.name}`   // action label in DevTools
        ),

      removeFromCart: (id) =>
        set(
          (s) => ({ cart: s.cart.filter((i) => i.id !== id) }),
          false,
          "cart/removeItem"
        ),

      clearCart: () =>
        set({ cart: [] }, false, "cart/clear"),
    }),
    { name: "CartStore" }
  )
)
```

**DevTools with slices — naming each slice's actions:**

```jsx
const createAuthSlice = (set) => ({
  user: null,
  login: (user) =>
    set({ user }, false, "auth/login"),    // ← prefixed with slice name ✅
  logout: () =>
    set({ user: null }, false, "auth/logout"),
})

const createCartSlice = (set) => ({
  cart: [],
  addItem: (item) =>
    set((s) => ({ cart: [...s.cart, item] }), false, "cart/addItem"),
})

const useBoundStore = create(
  devtools(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createCartSlice(...a),
    }),
    { name: "BoundStore" }
  )
)
// DevTools shows: auth/login, auth/logout, cart/addItem
// Time-travel between each action ✅
```

**DevTools in production — disable it:**

```jsx
const useStore = create(
  devtools(
    (set) => ({ /* store */ }),
    {
      name: "AppStore",
      enabled: process.env.NODE_ENV === "development",   // ← no DevTools overhead in prod
    }
  )
)
```


## W — Why It Matters

DevTools transforms debugging from "console.log everywhere" to a visual timeline of every state change, what triggered it, what the state was before and after, and the ability to jump to any prior state. For complex apps with slices and cross-slice actions, named actions in DevTools make the data flow immediately readable. It's the single highest-leverage debugging tool for Zustand.[^10][^9]

## I — Interview Q\&A

**Q: How do you connect Zustand to Redux DevTools?**
**A:** Wrap the store creator with `devtools(...)` from `zustand/middleware`. Install the Redux DevTools browser extension. Open the DevTools panel — your store appears automatically. No Redux dependency required.[^10]

**Q: How do you name actions in the DevTools timeline?**
**A:** Pass a string as the third argument to `set()`: `set(updater, false, "actionName")`. This labels the action in the DevTools history. Without names, all actions show as `"anonymous"` — useless in a large store with many actions.[^9]

**Q: Should DevTools be enabled in production?**
**A:** No — DevTools adds overhead and exposes your store structure to anyone with the browser extension. Use `enabled: process.env.NODE_ENV === "development"` to disable in production builds.[^10]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| No action name in `set()` — all actions appear as "anonymous" | Add the third arg: `set(updater, false, "slice/actionName")` |
| DevTools enabled in production | `enabled: process.env.NODE_ENV === "development"` |
| Not installing Redux DevTools browser extension | Install "Redux DevTools" from Chrome/Firefox extensions — Zustand DevTools requires it |
| Forgetting `false` as second arg when naming — accidentally replaces state | `set(updater, false, "name")` — always include the `replace` boolean before the name |

## K — Coding Challenge

**Challenge:** Add fully labelled DevTools to the 3-slice bounded store from Subtopic 1, with action names prefixed by slice domain and production guard:

**Solution:**

```jsx
// slices/authSlice.ts
export const createAuthSlice = (set) => ({
  user: null,
  token: null,
  login: (user, token) =>
    set({ user, token, isAuthenticated: true }, false, "auth/login"),
  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }, false, "auth/logout"),
  updateProfile: (updates) =>
    set((s) => ({ user: { ...s.user, ...updates } }), false, "auth/updateProfile"),
})

// slices/cartSlice.ts
export const createCartSlice = (set, get) => ({
  cart: [],
  addToCart: (item) =>
    set((s) => ({ cart: [...s.cart, item] }), false, `cart/add:${item.name}`),
  removeFromCart: (id) =>
    set((s) => ({ cart: s.cart.filter((i) => i.id !== id) }), false, "cart/remove"),
  clearCart: () =>
    set({ cart: [] }, false, "cart/clear"),
})

// slices/notificationSlice.ts
export const createNotificationSlice = (set) => ({
  notifications: [],
  addNotification: (n) =>
    set(
      (s) => ({ notifications: [{ ...n, id: crypto.randomUUID() }, ...s.notifications] }),
      false,
      `notification/add:${n.type}`
    ),
  dismiss: (id) =>
    set(
      (s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }),
      false,
      "notification/dismiss"
    ),
})

// stores/index.ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"

export const useBoundStore = create(
  devtools(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createCartSlice(...a),
      ...createNotificationSlice(...a),
    }),
    {
      name: "AppStore",
      enabled: process.env.NODE_ENV === "development",   // ✅ production safe
    }
  )
)
// DevTools shows: auth/login, cart/add:iPhone, notification/add:success ✅
```


***

# 7 — Reset-State Patterns

## T — TL;DR

Reset patterns in Zustand — resetting one slice, all state, or returning to initial values — are implemented by storing the initial state outside the store and using `set(initialState, true)` for full replacement.[^9]

## K — Key Concepts

**Pattern 1 — Slice-level reset using stored initial state:**

```jsx
// Store initial state OUTSIDE create — accessible for reset
const initialAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const useAuthStore = create((set) => ({
  ...initialAuthState,   // spread initial values

  login: (user, token) => set({ user, token, isAuthenticated: true }),

  // Reset to exact initial state ✅
  resetAuth: () => set(initialAuthState),
}))
```

**Pattern 2 — Full store reset with `replace: true`:**

```jsx
// All initial states defined outside create
const initialCartState    = { cart: [], currency: "PHP" }
const initialFilterState  = { query: "", category: "all", page: 1 }
const initialAuthState    = { user: null, token: null, isAuthenticated: false }

const useBoundStore = create((set) => ({
  ...initialAuthState,
  ...initialCartState,
  ...initialFilterState,
  actions: {
    // ...
  },

  // Nuclear option: reset EVERYTHING to initial state
  resetAll: () =>
    set(
      {
        ...initialAuthState,
        ...initialCartState,
        ...initialFilterState,
      },
      true   // ← replace: true = no merge, full replacement ✅
    ),
}))
```

**Pattern 3 — Scoped reset inside slices:**

```jsx
const initialCartState = { cart: [], isLoading: false, error: null }

const createCartSlice = (set) => ({
  ...initialCartState,

  addItem: (item) => set((s) => ({ cart: [...s.cart, item] })),
  clearCart: () => set({ cart: [] }),                        // partial reset
  resetCartSlice: () => set(initialCartState),               // full slice reset
})

const createAuthSlice = (set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  resetAuthSlice: () => set({ user: null, token: null }),
})

// In the bounded store — logout resets both slices
const useBoundStore = create((set, get) => ({
  ...createCartSlice(set, get),
  ...createAuthSlice(set, get),

  logout: () => {
    get().resetAuthSlice()
    get().resetCartSlice()
  },
}))
```

**Pattern 4 — Factory function for resettable stores (testing):**

```jsx
// Returns both the store hook and a reset function
function createResettableStore(creator) {
  let _reset = () => {}

  const useStore = create((set, get, api) => {
    const initial = creator(set, get, api)
    _reset = () => set(initial, true)   // capture initial for reset
    return initial
  })

  useStore.reset = _reset
  return useStore
}

const useTestableStore = createResettableStore((set) => ({
  count: 0,
  name: "test",
  increment: () => set((s) => ({ count: s.count + 1 })),
}))

// In tests
beforeEach(() => useTestableStore.reset())  // ← clean state before each test ✅
```


## W — Why It Matters

Reset patterns are critical for three scenarios: logout (clear all user data), testing (fresh state per test), and error recovery (return to safe state after a failure). Without a deliberate reset strategy, you risk stale auth data persisting after logout, test contamination, and no clean way to recover from corrupted state.[^9]

## I — Interview Q\&A

**Q: What is the cleanest way to implement a logout that resets all store state?**
**A:** Define initial state constants outside the store, then call `set({ ...initialAuthState, ...initialCartState, ...initialUIState }, true)` with `replace: true` in the logout action. The `true` replaces the entire store atomically — no stale values remain.[^9]

**Q: Why do you store initial state outside `create()`?**
**A:** To make it accessible from the reset action without re-creating the store. If initial state is only inside `create()`, the reset action has no reference to it. Storing it as a module-level constant means both the initial spread AND the reset action can use the same source of truth.[^9]

**Q: How do you reset Zustand stores between tests?**
**A:** Use the factory pattern — wrap `create()` to capture initial state and expose a `.reset()` method. Call `store.reset()` in `beforeEach()`. This ensures each test starts with a known state. For simpler cases, call `store.setState(initialState, true)` directly in test setup.[^9]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `set({})` — empty set, nothing actually resets | Explicitly pass all fields to reset, or use `set(initialState, true)` |
| Forgetting `replace: true` — stale fields survive the reset | `set(newState, true)` replaces the whole store; without it, `set` merges |
| Initial state defined inside `create()` — no reference for reset | Move initial state to a module-level `const initialState = {...}` |
| Resetting persisted state without also clearing storage | Call `store.persist.clearStorage()` alongside `set(initialState, true)` to clear localStorage too |

## K — Coding Challenge

**Challenge:** Build a `useFormDraftStore` that tracks form draft state, supports partial field updates, dirty-field tracking, and a full reset to initial values — plus a test-friendly `.reset()` method:

**Solution:**

```jsx
import { create } from "zustand"

const initialDraftState = {
  fields: {
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
  },
  dirtyFields: new Set(),   // tracks which fields were touched
  isSaving: false,
  savedAt: null,
  error: null,
}

const useFormDraftStore = create((set, get) => ({
  ...initialDraftState,

  // Update a single field + track as dirty
  setField: (name, value) =>
    set((s) => ({
      fields: { ...s.fields, [name]: value },
      dirtyFields: new Set([...s.dirtyFields, name]),  // ← immutable Set update
    })),

  // Restore a field to initial value
  revertField: (name) =>
    set((s) => {
      const next = new Set(s.dirtyFields)
      next.delete(name)
      return {
        fields: { ...s.fields, [name]: initialDraftState.fields[name] },
        dirtyFields: next,
      }
    }),

  // Mark save start/end
  setSaving: (bool) => set({ isSaving: bool }),
  setSavedAt: (date) => set({ savedAt: date, dirtyFields: new Set(), isSaving: false }),
  setError: (error) => set({ error, isSaving: false }),

  // Full reset to initial state ✅
  resetDraft: () => set(initialDraftState, true),

  // Derived
  isDirty: () => get().dirtyFields.size > 0,
}))

// Expose reset for testing
useFormDraftStore.reset = () =>
  useFormDraftStore.setState(initialDraftState, true)

// In tests
beforeEach(() => useFormDraftStore.reset())
```


***

# 8 — Map and Set Usage

## T — TL;DR

`Map` and `Set` in Zustand require creating a new instance on every update — mutating in place doesn't change the reference, so React never re-renders.[^11]

## K — Key Concepts

**The core rule — always new instance:**[^11]

```jsx
// ❌ WRONG — mutates in place, same Map reference → no re-render
set((state) => {
  state.userMap.set("user1", newUser)
  return { userMap: state.userMap }   // same reference!
})

// ✅ CORRECT — new Map instance → new reference → re-renders ✅
set((state) => ({
  userMap: new Map(state.userMap).set("user1", newUser)
}))
```

**Full Map CRUD pattern:**[^11]

```jsx
const useUserMapStore = create((set) => ({
  users: new Map(),   // Map<id, User>

  // Add / Update
  setUser: (id, user) =>
    set((s) => ({ users: new Map(s.users).set(id, user) })),

  // Delete
  removeUser: (id) =>
    set((s) => {
      const next = new Map(s.users)
      next.delete(id)
      return { users: next }
    }),

  // Update multiple at once
  mergeUsers: (newUsers) =>   // newUsers: Array<[id, User]>
    set((s) => {
      const next = new Map(s.users)
      newUsers.forEach(([id, user]) => next.set(id, user))
      return { users: next }
    }),

  // Clear
  clearUsers: () => set({ users: new Map() }),
}))
```

**Full Set CRUD pattern:**[^11]

```jsx
const useSelectionStore = create((set) => ({
  selectedIds: new Set(),  // Set<string>

  // Add
  selectItem: (id) =>
    set((s) => ({ selectedIds: new Set([...s.selectedIds, id]) })),
  // OR: set((s) => ({ selectedIds: new Set(s.selectedIds).add(id) }))

  // Remove
  deselectItem: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      next.delete(id)
      return { selectedIds: next }
    }),

  // Toggle
  toggleItem: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedIds: next }
    }),

  // Select all / deselect all
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  deselectAll: () => set({ selectedIds: new Set() }),

  // Check (use in component with selector)
  isSelected: (id) => useSelectionStore.getState().selectedIds.has(id),
}))
```

**Map vs Object — when to prefer Map:**


|  | Object `{}` | `Map` |
| :-- | :-- | :-- |
| Keys | Strings only | Any type (string, number, object) |
| Iteration order | Insertion order (modern JS) | Guaranteed insertion order |
| Size | `Object.keys(o).length` | `map.size` (O(1)) |
| Presence check | `key in obj` | `map.has(key)` |
| Performance at large scale | Slower | Faster |
| JSON.stringify | ✅ Built-in | ❌ Needs custom serializer (persist) |

## W — Why It Matters

Map and Set are the most ergonomic data structures for key-value lookups and unique-value collections — but they're invisible to React's reference equality check when mutated in place. The `new Map(existing)` pattern is the idiomatic fix, and knowing when to use Map vs Object is a senior-level distinction.[^11]

## I — Interview Q\&A

**Q: Why do you need `new Map(state.map).set(key, value)` instead of `state.map.set(key, value)`?**
**A:** `Map.prototype.set()` mutates the Map in place and returns the same Map instance. Zustand detects changes by reference equality — same reference means no re-render. `new Map(existing)` creates a new Map instance (triggering re-render) while copying all existing entries.[^11]

**Q: Can you use `Map` with Zustand's `persist` middleware?**
**A:** Not directly — `JSON.stringify(map)` produces `{}`. You need a custom storage serializer that converts the Map to an array of entries (`[...map.entries()]`) for storage and back to a `new Map(entries)` on rehydration.[^11]

**Q: When should you use a `Map` instead of a plain object for store state?**
**A:** When keys are dynamic IDs (string or number), when you need O(1) size, when you frequently add/delete entries by key, or when key order matters. For a fixed set of properties (like `{ theme, sidebar, user }`), plain objects are cleaner.[^11]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating Map/Set in place — no re-render | Always `new Map(s.map).set(...)` or `new Set(s.set).add(...)` |
| `set.add()` not returning `this` in chain — forgot to return Set | `new Set(s.set).add(item)` — `add()` returns the Set, wrap with `new Set(...)` |
| Using Map with `persist` without a custom serializer | Convert to/from array of entries: `[[k,v], ...]` for serialization |
| Selecting Map/Set in components without `useShallow` — always re-renders | `useShallow` doesn't deep-compare Maps — use derived primitive values (`map.size`) or `useMemo` |

## K — Coding Challenge

**Challenge:** Build a multi-select store with a `Map<id, Item>` for item data and a `Set<id>` for selections — implement all CRUD operations and a "select page" bulk operation:

**Solution:**

```jsx
import { create } from "zustand"
import { useShallow } from "zustand/shallow"

const useItemSelectionStore = create((set, get) => ({
  // Map for O(1) lookup by id
  items: new Map(),             // Map<string, Item>
  selectedIds: new Set(),       // Set<string>

  // ── Item CRUD ──
  setItems: (itemArray) =>
    set({ items: new Map(itemArray.map((item) => [item.id, item])) }),

  updateItem: (id, updates) =>
    set((s) => {
      const next = new Map(s.items)
      const existing = next.get(id)
      if (existing) next.set(id, { ...existing, ...updates })
      return { items: next }
    }),

  removeItem: (id) =>
    set((s) => {
      const nextItems = new Map(s.items)
      const nextSelected = new Set(s.selectedIds)
      nextItems.delete(id)
      nextSelected.delete(id)    // deselect removed item ✅
      return { items: nextItems, selectedIds: nextSelected }
    }),

  // ── Selection ──
  toggleSelect: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedIds: next }
    }),

  // Select all items on a page (bulk)
  selectPage: (pageItemIds) =>
    set((s) => ({
      selectedIds: new Set([...s.selectedIds, ...pageItemIds]),
    })),

  deselectPage: (pageItemIds) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      pageItemIds.forEach((id) => next.delete(id))
      return { selectedIds: next }
    }),

  deselectAll: () => set({ selectedIds: new Set() }),

  // ── Derived helpers (call outside React with getState()) ──
  getSelectedItems: () => {
    const { items, selectedIds } = get()
    return [...selectedIds].map((id) => items.get(id)).filter(Boolean)
  },
}))

// Usage in component
function DataTable({ pageItems }) {
  const selectedIds = useItemSelectionStore((s) => s.selectedIds)
  const { toggleSelect, selectPage, deselectPage, deselectAll } =
    useItemSelectionStore(
      useShallow((s) => ({
        toggleSelect: s.toggleSelect,
        selectPage: s.selectPage,
        deselectPage: s.deselectPage,
        deselectAll: s.deselectAll,
      }))
    )

  const pageIds = pageItems.map((i) => i.id)
  const allPageSelected = pageIds.every((id) => selectedIds.has(id))

  return (
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={allPageSelected}
              onChange={() =>
                allPageSelected ? deselectPage(pageIds) : selectPage(pageIds)
              }
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {pageItems.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleSelect(item.id)}
              />
            </td>
            <td>{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```


***

# 9 — React + TanStack Query + Zustand Boundaries

## T — TL;DR

React owns local UI, TanStack Query owns server data, and Zustand owns client state — respecting these three boundaries eliminates redundant state, prevents sync bugs, and gives each concern the right tooling.[^12][^13]

## K — Key Concepts

**The complete state ownership map:**

```
┌──────────────────────────────────────────────────────────────────┐
│  REACT (useState / useReducer / Context)                         │
│  • Form input values (controlled inputs)                         │
│  • Accordion open/close (single component)                       │
│  • Tooltip visibility                                            │
│  • Step in a wizard (within one component)                       │
│  → Scope: ONE component or a small local tree                    │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│  ZUSTAND                                                         │
│  • Auth state (user, token, isAuthenticated)                     │
│  • Theme (light/dark)                                            │
│  • Sidebar open/closed                                           │
│  • Shopping cart                                                 │
│  • Multi-step filters / pagination state                         │
│  • Active modal (which modal is showing)                         │
│  • Selected items (multi-select Set)                             │
│  → Scope: MANY components across the app                         │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│  TANSTACK QUERY                                                  │
│  • Products list from /api/products                             │
│  • Current user profile from /api/users/me                      │
│  • Orders, inventory, notifications from server                  │
│  • Search results                                                │
│  • Any data that lives on a server and needs caching             │
│  → Scope: SERVER data with caching + background refresh          │
└──────────────────────────────────────────────────────────────────┘
```

**The "Zustand drives Query" pattern — clean integration:**[^13][^12]

```jsx
// Zustand: owns what to query
const useFilterStore = create((set) => ({
  category: "all",
  sort: "newest",
  page: 1,
  setCategory: (category) => set({ category, page: 1 }),
  setSort: (sort) => set({ sort }),
  setPage: (page) => set({ page }),
}))

// TanStack Query: fetches based on Zustand's state
function useProducts() {
  const { category, sort, page } = useFilterStore(
    useShallow((s) => ({ category: s.category, sort: s.sort, page: s.page }))
  )

  return useQuery({
    queryKey: ["products", { category, sort, page }],
    queryFn: ({ signal }) =>
      fetchProducts({ category, sort, page }, signal),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  })
}

// Component: reads from both tools cleanly
function ProductPage() {
  const setCategory = useFilterStore((s) => s.setCategory)
  const { data, isPending } = useProducts()
  return (
    <div>
      <CategoryFilter onChange={setCategory} />
      {isPending ? <Skeleton /> : <ProductGrid products={data?.items} />}
    </div>
  )
}
```

**Logout — clearing both stores correctly:**

```jsx
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  logout: async () => {
    await authAPI.logout()
    set({ user: null, token: null }, true)
    queryClient.clear()   // ← clears ALL TanStack Query cache for old user ✅
    // Alternatively: only clear user-specific queries
    // queryClient.removeQueries({ queryKey: ["user"] })
    // queryClient.removeQueries({ queryKey: ["orders"] })
  },
}))
```


## W — Why It Matters

The most common architecture mistake in React apps is using one tool for everything — Redux/Zustand for server data, or TanStack Query for client state. The result is manually reimplementing caching in Zustand, or storing modal state in a query cache. Each boundary violation adds complexity. The clean three-boundary model scales to any app size and makes state predictably debuggable.[^12][^13]

## I — Interview Q\&A

**Q: How do you decide whether state belongs in Zustand or TanStack Query?**
**A:** Ask: "Does this data live on a server and need to be cached/refreshed?" → TanStack Query. "Is this client-owned state shared across many components?" → Zustand. "Is this local to one component?" → `useState`. The question of where data originates is the primary deciding factor.[^13][^12]

**Q: How do Zustand and TanStack Query interact in a filter + results pattern?**
**A:** Zustand holds the filter state (category, sort, page). Components read filters from Zustand and pass them into `useQuery`'s `queryKey` and `queryFn`. When filters change in Zustand, the query key changes, triggering a new fetch. The two tools cooperate — Zustand as the source of "what to fetch," Query as the mechanism of fetching and caching.[^13]

**Q: What should you do on logout regarding TanStack Query's cache?**
**A:** Call `queryClient.clear()` — this removes all cached data for the previous user. Without it, the next user (or a re-login) might see stale data from the previous session. If you only want to remove user-specific queries, use `removeQueries` with targeted keys.[^12]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing API response data in Zustand with a manual `isLoading` flag | Move to TanStack Query — you get caching, retry, DevTools, deduplication for free |
| Duplicating server state in Zustand for "easier access" | Use `queryClient.getQueryData()` for out-of-component access — no duplication |
| Not clearing Query cache on logout — next user sees old data | `queryClient.clear()` in the logout action |
| Putting complex filter UI state in query params / React state instead of Zustand | Filters change many components — Zustand is the right scope |

## K — Coding Challenge

**Challenge:** Build the complete integration for a job listings app: filters in Zustand, results in TanStack Query, saved jobs as a Zustand Set, logout clearing both — all in clean, separated code:

**Solution:**

```jsx
// stores/jobFilterStore.ts — Zustand: UI/filter state
export const useJobFilterStore = create((set) => ({
  keyword: "",
  location: "",
  jobType: "all",   // "full-time" | "part-time" | "contract" | "all"
  page: 1,
  savedJobIds: new Set(),

  setKeyword:   (keyword) => set({ keyword, page: 1 }),
  setLocation:  (location) => set({ location, page: 1 }),
  setJobType:   (jobType) => set({ jobType, page: 1 }),
  setPage:      (page) => set({ page }),

  toggleSaveJob: (id) =>
    set((s) => {
      const next = new Set(s.savedJobIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { savedJobIds: next }
    }),
  clearSavedJobs: () => set({ savedJobIds: new Set() }),

  resetFilters: () => set({ keyword: "", location: "", jobType: "all", page: 1 }),
}))

// stores/authStore.ts — Zustand: auth state
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ user: null, token: null, isAuthenticated: false }, true)
    queryClient.clear()                              // ← clear all server data cache ✅
    useJobFilterStore.getState().clearSavedJobs()    // ← clear saved jobs for old user ✅
    useJobFilterStore.getState().resetFilters()      // ← reset filters ✅
  },
}))

// queries/useJobListings.ts — TanStack Query: server data
export function useJobListings() {
  const { keyword, location, jobType, page } = useJobFilterStore(
    useShallow((s) => ({
      keyword: s.keyword, location: s.location, jobType: s.jobType, page: s.page,
    }))
  )
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: ["jobs", { keyword, location, jobType, page }],
    queryFn: ({ signal }) =>
      fetch(
        `/api/jobs?keyword=${keyword}&location=${location}&type=${jobType}&page=${page}`,
        { signal, headers: { Authorization: `Bearer ${token}` } }
      ).then((r) => r.json()),
    enabled: !!token,                     // ← only fetch when authenticated
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  })
}

// components/JobBoard.tsx — thin component reading from both
function JobBoard() {
  const savedJobIds = useJobFilterStore((s) => s.savedJobIds)
  const toggleSave  = useJobFilterStore((s) => s.toggleSaveJob)
  const { data, isPending, isPlaceholderData } = useJobListings()

  return (
    <div style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
      {isPending ? (
        <JobSkeleton count={10} />
      ) : (
        data?.jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobIds.has(job.id)}
            onToggleSave={() => toggleSave(job.id)}
          />
        ))
      )}
    </div>
  )
}
```


***

# 10 — Auth, Theme, Filter, and UI State Architecture

## T — TL;DR

A production-ready Zustand architecture organizes state into domain-specific stores — auth, theme, filter, and UI — each with a clear single responsibility, persistence strategy, and integration contract with TanStack Query.[^10][^13]

## K — Key Concepts

**The four canonical Zustand stores:**

```
useAuthStore     → user, token, session, login/logout
useThemeStore    → color scheme, font size, locale
useUIStore       → modals, sidebar, toasts, loading overlays
useFilterStore   → search params, pagination, sort state
```

**1. Auth Store — with persist and logout:**

```jsx
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (updates) =>
        set((s) => ({ user: { ...s.user, ...updates } })),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false }, true)
        queryClient.clear()
      },
    }),
    {
      name: "auth",
      partialize: (s) => ({ token: s.token, user: s.user }),  // ✅ no isAuthenticated in storage
      skipHydration: true,
    }
  )
)
```

**2. Theme Store — with persist and document sync:**

```jsx
const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      fontSize: 16,
      locale: "en",
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "theme-prefs" }
  )
)

// Subscribe → sync to document (set up once at app start)
useThemeStore.subscribe(
  (s) => s.theme,
  (theme) => document.documentElement.setAttribute("data-theme", theme),
  { fireImmediately: true }
)
```

**3. UI Store — transient, no persist:**

```jsx
const useUIStore = create(
  devtools(
    (set) => ({
      sidebarOpen: false,
      activeModal: null,       // null | "confirm-delete" | "create-post" | ...
      toast: null,             // null | { message, type, id }
      isFullscreenLoading: false,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      openModal: (name) => set({ activeModal: name }),
      closeModal: () => set({ activeModal: null }),
      showToast: (message, type = "info") =>
        set({ toast: { message, type, id: Date.now() } }),
      dismissToast: () => set({ toast: null }),
      setFullscreenLoading: (bool) => set({ isFullscreenLoading: bool }),
    }),
    { name: "UIStore", enabled: process.env.NODE_ENV === "development" }
  )
)
// ← No persist: modal state, toasts should NOT survive reload ✅
```

**4. Filter Store — persist to sessionStorage:**

```jsx
const useFilterStore = create(
  persist(
    (set) => ({
      query: "",
      category: "all",
      sort: "newest",
      page: 1,
      pageSize: 20,
      setQuery: (query) => set({ query, page: 1 }),
      setCategory: (category) => set({ category, page: 1 }),
      setSort: (sort) => set({ sort, page: 1 }),
      setPage: (page) => set({ page }),
      resetFilters: () => set({ query: "", category: "all", sort: "newest", page: 1 }),
    }),
    {
      name: "filter-state",
      storage: createJSONStorage(() => sessionStorage),  // ✅ per session only
      partialize: (s) => ({
        query: s.query, category: s.category, sort: s.sort, page: s.page,
      }),
    }
  )
)
```

**The integration wiring — complete picture:**

```jsx
// Entry point: hydrate + subscribe in one place
function bootstrapApp() {
  // Hydrate persisted stores (SSR-safe)
  useAuthStore.persist.rehydrate()
  useThemeStore.persist.rehydrate()
  useFilterStore.persist.rehydrate()

  // Subscribewiht subscriptions (outside React)
  useAuthStore.subscribe(
    (s) => s.token,
    (token) => {
      if (token) apiClient.defaults.headers.Authorization = `Bearer ${token}`
      else delete apiClient.defaults.headers.Authorization
    },
    { fireImmediately: true }
  )
}
```


## W — Why It Matters

Every production React app needs these four state domains. Making the architecture explicit — naming each store, its ownership, persistence strategy, and integration contract — prevents the common pattern of "let me just add this to the auth store" until the auth store owns modals, toasts, filters, and theme. One store per domain, clear contracts, clear persistence. This is the architecture that survives team growth.[^13][^10]

## I — Interview Q\&A

**Q: How would you architect Zustand stores for a production React app?**
**A:** Four domain stores: `useAuthStore` (user/token, persist to localStorage), `useThemeStore` (UI preferences, persist to localStorage), `useUIStore` (modal/toast/sidebar, no persist — transient), and `useFilterStore` (search/pagination, persist to sessionStorage). TanStack Query handles all server data. Wire them together via subscriptions and the Zustand-drives-Query pattern.[^10][^13]

**Q: Why should modals and toasts not be persisted?**
**A:** They're transient UI events — a modal that was open when the user closed the tab should not reopen on their next visit. Persisting them would create confusing, non-reproducible UI states. `useUIStore` intentionally has no `persist` middleware.[^10]

**Q: Where should you trigger `rehydrate()` for persisted Zustand stores in Next.js?**
**A:** In a `useEffect` inside a top-level layout component, or in a `HydrationBoundary` wrapper. The key requirement is that it runs only on the client, after React's initial hydration — preventing server/client DOM mismatches.[^8]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Single monolithic store for all domains | Split into auth, theme, UI, filter stores — one responsibility each |
| Persisting toast/modal state | No persist on `useUIStore` — transient state must not survive reloads |
| Auth store also owns UI concerns (sidebar, modals) | Single responsibility: auth store owns identity only; UI store owns layout/modal state |
| No bootstrap function — subscriptions scattered across components | One `bootstrapApp()` at the entry point wires all subscriptions and hydration |

## K — Coding Challenge

**Challenge:** Write the complete app bootstrapping code that: hydrates all persisted stores, sets up auth → Axios header sync, sets up theme → document sync, and sets up filter → URL query string sync — all in one `bootstrapApp()` function:

**Solution:**

```jsx
// app/bootstrap.ts
import axios from "axios"
import { subscribeWithSelector } from "zustand/middleware"

export function bootstrapApp() {
  // ── 1. Hydrate all persisted stores (client-only, call in useEffect) ──
  Promise.all([
    useAuthStore.persist.rehydrate(),
    useThemeStore.persist.rehydrate(),
    useFilterStore.persist.rehydrate(),
  ]).then(() => console.log("All stores hydrated"))

  // ── 2. Auth token → Axios default header ──
  const unsubAuth = useAuthStore.subscribe(
    (s) => s.token,
    (token) => {
      if (token) {
<span style="display:none">[^14][^15][^16][^17][^18]</span>

<div align="center">⁂</div>

[^1]: https://zustand.docs.pmnd.rs/learn/guides/slices-pattern
[^2]: https://zet.mknh.dev/Zustand-Best-Practice---Slice-Pattern
[^3]: https://mintlify.wiki/pmndrs/zustand/middleware/persist
[^4]: https://zustand.docs.pmnd.rs/reference/middlewares/subscribe-with-selector
[^5]: https://deepwiki.com/pmndrs/zustand/7.1-slices-pattern&rut=0f14243812088f1296731d2b3d283fe454c1d914851212aaf5e6e19b51e5f349
[^6]: https://zustand.docs.pmnd.rs/reference/middlewares/persist
[^7]: https://deepwiki.com/pmndrs/zustand/3.1-persist-middleware
[^8]: https://github.com/pmndrs/zustand/issues/1145
[^9]: https://deepwiki.com/pmndrs/zustand/7-advanced-patterns
[^10]: https://sanjewa.com/blogs/advanced-zustand-patterns-slices-middleware/
[^11]: https://zustand.docs.pmnd.rs/guides/maps-and-sets-usage
[^12]: https://www.segevsinay.com/blog/state-management-react-2026
[^13]: https://tkdodo.eu/blog/working-with-zustand
[^14]: https://www.mintlify.com/pmndrs/zustand/guides/slices-pattern
[^15]: https://github.com/pmndrs/zustand/discussions/2347
[^16]: https://mintlify.wiki/pmndrs/zustand/guides/slices-pattern
[^17]: https://github.com/pmndrs/zustand/issues/1253
[^18]: https://github.com/pmndrs/zustand/issues/930```

