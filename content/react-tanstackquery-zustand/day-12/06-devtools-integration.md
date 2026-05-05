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

## I — Interview Q&A

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
