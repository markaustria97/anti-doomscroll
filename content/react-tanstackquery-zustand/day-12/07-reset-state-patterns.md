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

## I — Interview Q&A

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
