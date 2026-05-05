# 1 — Slice Pattern & Bounded Stores

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

## I — Interview Q&A

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
