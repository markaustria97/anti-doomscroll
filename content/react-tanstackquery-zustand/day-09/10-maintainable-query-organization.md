# 10 — Maintainable Query Organization

## T — TL;DR

A maintainable TanStack Query codebase centralizes keys in factories, colocates query hooks with their domain, keeps components thin, and separates read (query) hooks from write (mutation) hooks into clear, consistent file structures.

## K — Key Concepts

**The recommended folder structure:**

```
src/
├── lib/
│   └── queryClient.ts          ← QueryClient singleton + global config
│
├── queries/                    ← all READ operations
│   ├── keys.ts                 ← ALL key factories in one place
│   ├── useUser.ts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   └── index.ts                ← barrel export
│
├── mutations/                  ← all WRITE operations
│   ├── useCreateOrder.ts
│   ├── useUpdateUser.ts
│   └── index.ts
│
└── components/                 ← import from queries/ and mutations/
    ├── UserProfile.tsx
    └── OrderPage.tsx
```

**The complete key factory file — `queries/keys.ts`:**

```ts
// Single source of truth for all query keys
export const userKeys = {
  all: () => ["users"] as const,
  lists: () => [...userKeys.all(), "list"] as const,
  list: (filters: object) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all(), "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export const productKeys = {
  all: () => ["products"] as const,
  lists: () => [...productKeys.all(), "list"] as const,
  list: (filters: object) => [...productKeys.lists(), filters] as const,
  detail: (id: number) => [...productKeys.all(), "detail", id] as const,
};

export const orderKeys = {
  all: () => ["orders"] as const,
  byUser: (userId: number) => [...orderKeys.all(), "byUser", userId] as const,
  detail: (id: number) => [...orderKeys.all(), "detail", id] as const,
};
```

**Thin component — anti-pattern vs good pattern:**

```jsx
// ❌ Fat component — knows too much about fetching
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  const queryClient = useQueryClient();
  useEffect(() => {
    const cached = queryClient.getQueryData(["product", "detail", productId]);
    if (cached) setProduct(cached);
    else
      fetch(`/api/products/${productId}`)
        .then((r) => r.json())
        .then(setProduct);
  }, [productId]);
  // ...
}

// ✅ Thin component — delegates to query hook
function ProductPage({ productId }) {
  const { data: product, isPending, isError } = useProduct(productId);
  if (isPending) return <Skeleton />;
  if (isError) return <Error />;
  return <ProductDetail product={product} />;
}
```

**Co-locating keys with mutations — the invalidation contract:**

```jsx
// mutations/useCreateProduct.ts
import { productKeys } from "../queries/keys";

function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProduct) =>
      fetch("/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
      }).then((r) => r.json()),

    onSuccess: () => {
      // ✅ Invalidate using the shared key factory — no hardcoded strings
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

## W — Why It Matters

As apps grow, scattered `useQuery` calls, duplicated key strings, and per-component fetch logic become a maintenance nightmare — one endpoint change requires finding every component. A well-organized query layer means the data contract lives in one place, mutations always invalidate the right keys, and components stay declarative and focused on rendering.

## I — Interview Q&A

**Q: How should you organize query keys in a large application?**
**A:** Use a Key Factory pattern — a `keys.ts` file with one factory object per domain resource. Each factory generates hierarchical, typed key arrays. Import the factory in both query hooks and mutation hooks so invalidation always uses the exact same key structure as the query.

**Q: Why separate query hooks from mutation hooks into different files?**
**A:** Reads (queries) and writes (mutations) have different contracts — queries are passive and cached, mutations are imperative and trigger side effects. Separating them makes it obvious what a file does, keeps each file small, and aligns with the Command-Query Separation principle.

**Q: How do you prevent key drift — where a mutation invalidates the wrong key?**
**A:** Import invalidation keys from the same Key Factory used by the query hooks. Never hardcode key strings in mutations. If `useProducts` uses `productKeys.lists()`, the mutation must import `productKeys` and call `invalidateQueries({ queryKey: productKeys.lists() })`.

## C — Common Pitfalls

| Pitfall                                                                   | Fix                                                                                                          |
| :------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------- |
| Hardcoded key strings in mutations (`["products", "list"]`)               | Import from `keys.ts` Key Factory — one source of truth                                                      |
| One giant `queries.ts` file with all hooks                                | Split by domain resource — `useUser.ts`, `useProducts.ts` — max one resource per file                        |
| Components importing `useQueryClient` and calling `getQueryData` directly | Hide cache operations in custom hooks — components should only call domain hooks                             |
| No barrel `index.ts` export                                               | Add `index.ts` exports — `import { useUser, useProducts } from "@/queries"` is cleaner than per-file imports |

## K — Coding Challenge

**Challenge:** Restructure this disorganized code into a clean query organization with key factories, custom hooks, and thin components:

```jsx
// Everything inline — messy real-world starting point
function OrdersPage({ userId }) {
  const queryClient = useQueryClient()

  const ordersQuery = useQuery({
    queryKey: ["orders", "user", userId, "list"],
    queryFn: () => fetch(`/api/users/${userId}/orders`).then(r => r.json()),
  })

  const userQuery = useQuery({
    queryKey: ["user", "detail", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  })

  async function cancelOrder(orderId) {
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
    queryClient.invalidateQueries({ queryKey: ["orders", "user", userId, "list"] })
  }

  return (/* ... */)
}
```

**Solution:**

```ts
// queries/keys.ts
export const userKeys = {
  all: () => ["user"],
  detail: (id: number) => [...userKeys.all(), "detail", id],
};

export const orderKeys = {
  all: () => ["orders"],
  byUser: (userId: number) => [...orderKeys.all(), "user", userId, "list"],
  detail: (id: number) => [...orderKeys.all(), "detail", id],
};
```

```ts
// queries/useUser.ts
export function useUser(userId: number) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}`, { signal }).then((r) => r.json()),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
}
```

```ts
// queries/useOrders.ts
export function useUserOrders(userId: number) {
  return useQuery({
    queryKey: orderKeys.byUser(userId),
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}/orders`, { signal }).then((r) => r.json()),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}
```

```ts
// mutations/useCancelOrder.ts
export function useCancelOrder(userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) =>
      fetch(`/api/orders/${orderId}`, { method: "DELETE" }).then((r) =>
        r.json()
      ),
    onSuccess: () => {
      // ✅ Key from shared factory — never drifts from query
      queryClient.invalidateQueries({ queryKey: orderKeys.byUser(userId) });
    },
  });
}
```

```jsx
// components/OrdersPage.tsx — thin component ✅
function OrdersPage({ userId }) {
  const { data: user, isPending: userPending } = useUser(userId);
  const { data: orders = [], isPending: ordersPending } = useUserOrders(userId);
  const cancelOrder = useCancelOrder(userId);

  if (userPending || ordersPending) return <PageSkeleton />;

  return (
    <div>
      <h1>{user.name}'s Orders</h1>
      <OrderList
        orders={orders}
        onCancel={(id) => cancelOrder.mutate(id)}
        isCancelling={cancelOrder.isPending}
      />
    </div>
  );
}
```
