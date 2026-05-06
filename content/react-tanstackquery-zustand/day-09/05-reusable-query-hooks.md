# 5 — Reusable Query Hooks

## T — TL;DR

Wrapping `useQuery` calls in custom hooks — one per resource — centralizes query keys, fetch logic, and configuration in a single place, making queries reusable, testable, and easy to change.

## K — Key Concepts

**The pattern — one hook per resource:**

```jsx
// ✅ Centralized query hook for "user" resource
function useUser(userId) {
  return useQuery({
    queryKey: userKeys.detail(userId),          // from Key Factory
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}`, { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
    retry: (count, err) => err?.status !== 404 && count < 2,
  })
}

// ✅ Any component just calls the hook — no knowledge of implementation
function UserBadge({ userId }) {
  const { data: user, isPending } = useUser(userId)
  if (isPending) return <Skeleton />
  return <span>{user?.name}</span>
}

function UserProfile({ userId }) {
  const { data: user, isError } = useUser(userId)
  // Same cache — no extra fetch ✅
}
```

**Layer structure for query hook files:**

```
src/
├── queries/                      ← all query hooks live here
│   ├── keys.ts                   ← key factories for all domains
│   ├── useUser.ts                ← user queries
│   ├── useProducts.ts            ← product queries
│   ├── useOrders.ts              ← order queries
│   └── index.ts                  ← barrel export
├── mutations/                    ← mutation hooks (useMutation)
└── components/                   ← components import from queries/
```

**The full reusable hook structure:**

```jsx
// queries/useProducts.ts

const productKeys = {
  all: () => ["products"],
  lists: () => [...productKeys.all(), "list"],
  list: (filters) => [...productKeys.lists(), filters],
  detail: (id) => [...productKeys.all(), "detail", id],
}

// List hook — with filter support
function useProductList(filters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) =>
      fetch(`/api/products?${new URLSearchParams(filters)}`, { signal }).then(r => r.json()),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  })
}

// Detail hook — with ID-based key
function useProduct(productId) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}`, { signal }).then(r => r.json()),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })
}

// Re-export keys for use in mutations/invalidations
export { productKeys, useProductList, useProduct }
```


## W — Why It Matters

Without custom hooks, every component knows about endpoints, query keys, and cache config — a single endpoint change requires updating every component. Custom query hooks are the "repository pattern" for TanStack Query: one place to change the data contract, zero impact on consumers.

## I — Interview Q&A

**Q: Why should you wrap `useQuery` in custom hooks?**
**A:** Encapsulation — components shouldn't know about query keys, endpoints, or stale times. A custom hook centralizes this: change the endpoint in one place, every component gets the update. It also enables per-resource config (different `staleTime` per data type) and makes testing easier by mocking at the hook boundary.

**Q: Where should custom query hooks live in a project?**
**A:** In a dedicated `queries/` or `hooks/` directory, organized by domain resource (`useUser`, `useProducts`, `useOrders`). Export the key factories alongside the hooks so mutations can invalidate the correct keys without hardcoding strings.

**Q: Should you export the query key from a custom query hook?**
**A:** Yes — or better, export a Key Factory alongside the hook. Mutations need to call `invalidateQueries` with the same key. If the key is only inside the hook, mutations have no way to reference it, leading to hardcoded key duplication.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Inline `useQuery` calls scattered across components | Move each resource's query into a dedicated custom hook |
| Query key not exported — mutations can't invalidate | Export the Key Factory; import it in mutation hooks for `invalidateQueries` |
| Custom hook has too many parameters — trying to do too much | Split into `useProductList(filters)` and `useProduct(id)` — one hook per data shape |
| Logic duplication between list and detail hooks | Shared `queryFn` helpers in a `api.ts` file called by both hooks |

## K — Coding Challenge

**Challenge:** Refactor this scattered query code into a proper reusable hook structure with a Key Factory:

```jsx
// Component A — inline query
function NavCartBadge() {
  const { data } = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => fetch(`/api/cart/${userId}`).then(r => r.json()),
  })
  return <span>{data?.items.length}</span>
}

// Component B — same data, different config — duplicated
function CartPage() {
  const { data, isPending } = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => fetch(`/api/cart/${userId}`).then(r => r.json()),
    staleTime: 30000,
  })
  return isPending ? <Skeleton /> : <CartItems items={data?.items} />
}
```

**Solution:**

```jsx
// queries/keys.ts
export const cartKeys = {
  all: () => ["cart"],
  byUser: (userId) => [...cartKeys.all(), userId],
}

// queries/useCart.ts
import { cartKeys } from "./keys"

export function useCart(userId) {
  return useQuery({
    queryKey: cartKeys.byUser(userId),           // ✅ shared key from factory
    queryFn: ({ signal }) =>
      fetch(`/api/cart/${userId}`, { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    enabled: !!userId,
    staleTime: 1000 * 30,                        // ✅ one config to rule them all
  })
}

// components/NavCartBadge.tsx
function NavCartBadge({ userId }) {
  const { data } = useCart(userId)               // ✅ same cache entry
  return <span>{data?.items.length ?? 0}</span>
}

// components/CartPage.tsx
function CartPage({ userId }) {
  const { data, isPending } = useCart(userId)    // ✅ same cache entry — no re-fetch
  return isPending ? <Skeleton /> : <CartItems items={data?.items} />
}

// After creating a cart mutation:
// queryClient.invalidateQueries({ queryKey: cartKeys.byUser(userId) }) ✅
```


***
