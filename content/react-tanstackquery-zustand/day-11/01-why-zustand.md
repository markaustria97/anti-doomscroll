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

## I — Interview Q&A

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
