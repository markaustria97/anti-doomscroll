# 3 — `persist` Middleware

## T — TL;DR

The `persist` middleware saves Zustand state to a storage backend (localStorage, sessionStorage, AsyncStorage) and rehydrates it automatically on page load — with optional field selection, versioning, and migration.

## K — Key Concepts

**Basic `persist` setup:**

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

**`partialize` — only persist specific fields:**

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

**Storage choices:**

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

Without `persist`, every page reload loses all client state — the user's theme resets to light, their cart empties, their filter settings disappear. `persist` is a one-middleware solution that handles serialization, storage, and rehydration automatically. The `partialize` option is critical for not storing sensitive or transient data like error messages, loading flags, or temporary UI state.

## I — Interview Q&A

**Q: How does the `persist` middleware work in Zustand?**
**A:** It wraps the store's `set` function — whenever state changes, it serializes the state (or the `partialize` subset) to JSON and writes it to the storage backend. On initialization, it reads from storage and merges the persisted state with the store's defaults before the first render.

**Q: What is `partialize` and why is it important?**
**A:** `partialize` is a function that receives the full state and returns only the portion to persist. It prevents storing transient state (loading flags, error messages, session-only data) that shouldn't survive a page reload. Without it, everything is persisted — including data you never want stored.

**Q: What's the difference between `localStorage` and `sessionStorage` for Zustand persist?**
**A:** `localStorage` persists indefinitely until explicitly cleared — good for preferences, auth tokens. `sessionStorage` is cleared when the browser tab closes — good for short-lived session data like current filters or view state that shouldn't survive a fresh session.

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
