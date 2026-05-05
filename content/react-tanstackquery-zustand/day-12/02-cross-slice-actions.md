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

## I — Interview Q&A

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
