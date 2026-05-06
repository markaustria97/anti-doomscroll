# 8 — Replacing Manual `fetch`-in-`useEffect` Patterns

## T — TL;DR

Every `useEffect` + `useState` data fetching pattern has a direct TanStack Query replacement — the migration is mechanical and the result is less code with more features.

## K — Key Concepts

**The migration pattern — side by side:**

**Pattern 1: Basic fetch on mount**

```jsx
// ❌ Before: 15+ lines, 3 state variables, edge cases missing
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>Error</p>;
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}

// ✅ After: 3 lines for the same behavior + caching + retry + dedup
function UserList() {
  const {
    data: users = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((r) => r.json()),
  });
  if (isPending) return <Spinner />;
  if (isError) return <p>Error</p>;
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

**Pattern 2: Fetch when a dependency changes**

```jsx
// ❌ Before
const [products, setProducts] = useState([])
useEffect(() => {
  fetch(`/api/products?category=${category}`).then(...).then(setProducts)
}, [category])

// ✅ After — auto-refetches whenever category changes
const { data: products = [] } = useQuery({
  queryKey: ["products", category],      // category in key → triggers refetch on change
  queryFn: () => fetch(`/api/products?category=${category}`).then(r => r.json()),
})
```

**Pattern 3: Conditional fetch**

```jsx
// ❌ Before — guards in useEffect
useEffect(() => {
  if (!userId) return
  fetch(`/api/user/${userId}`).then(...)
}, [userId])

// ✅ After — enabled handles it declaratively
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId,                     // no if-guard needed
})
```

**Pattern 4: Refetch on user action**

```jsx
// ❌ Before — manual refetch state
const [trigger, setTrigger] = useState(0)
useEffect(() => { fetch(...) }, [trigger])
<button onClick={() => setTrigger(t => t + 1)}>Refresh</button>

// ✅ After — built-in refetch function
const { data, refetch } = useQuery({ queryKey: ["data"], queryFn: fetchData })
<button onClick={() => refetch()}>Refresh</button>
```

## W — Why It Matters

Most React codebases have dozens of manual `useEffect` fetching patterns, each subtly different in how they handle edge cases — or don't. Migrating to TanStack Query standardizes all of them into one consistent, battle-tested API. Code reviews become easier, bugs decrease, and new features (caching, retry) become instant wins.

## I — Interview Q&A

**Q: How do you migrate a `useEffect` data fetch to TanStack Query?**
**A:** (1) Remove the `useEffect` and all related `useState` variables. (2) Add `useQuery` with the endpoint as `queryFn` and a descriptive key as `queryKey`. (3) Use the returned `isPending`, `isError`, and `data` for rendering. (4) Remove the `AbortController` — TanStack Query passes `signal` automatically.

**Q: What features do you gain "for free" when migrating from `useEffect` to `useQuery`?**
**A:** Automatic caching, request deduplication, background refetching on tab focus, retry on failure (3x with backoff), request cancellation on unmount, race condition prevention, and stale-while-revalidate behavior.

**Q: Should you always replace `useEffect` fetches with `useQuery`?**
**A:** For any data from a remote API — yes. For mutations (creating/updating/deleting), use `useMutation` instead. For local-only async operations (e.g., reading from `localStorage`), `useEffect` is still appropriate.

## C — Common Pitfalls

| Pitfall                                                       | Fix                                                                          |
| :------------------------------------------------------------ | :--------------------------------------------------------------------------- |
| Keeping a `useEffect` alongside `useQuery` for the same data  | Remove the `useEffect` entirely — `useQuery` manages everything              |
| Forgetting to remove old `useState` variables after migration | Clean up all `[data, setData]`, `[loading, setLoading]`, `[error, setError]` |
| Using `useQuery` for mutations (POST/PUT/DELETE)              | Mutations use `useMutation` — `useQuery` is for reading data                 |
| Not wrapping the app in `QueryClientProvider` after migration | `useQuery` throws if there's no provider — always check the tree             |

## K — Coding Challenge

**Challenge:** Fully migrate this component from `useEffect` to TanStack Query:

```jsx
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/products/${productId}`).then((r) => r.json()),
      fetch(`/api/products/${productId}/reviews`).then((r) => r.json()),
    ])
      .then(([productData, reviewsData]) => {
        setProduct(productData);
        setReviews(reviewsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;
  return (
    <div>
      <ProductCard product={product} />
      <ReviewList reviews={reviews} />
    </div>
  );
}
```

**Solution:**

```jsx
import { useQuery } from "@tanstack/react-query";

// ✅ Separate queries — independent caching, loading, error states
function ProductPage({ productId }) {
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}`, { signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "byProduct", productId],
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}/reviews`, { signal }).then((r) =>
        r.json()
      ),
    enabled: !!productId,
    staleTime: 1000 * 60, // reviews: shorter stale time (changes more often)
  });

  const isPending = productQuery.isPending || reviewsQuery.isPending;
  const isError = productQuery.isError || reviewsQuery.isError;
  const error = productQuery.error ?? reviewsQuery.error;

  if (isPending) return <Spinner />;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      <ProductCard product={productQuery.data} />
      <ReviewList reviews={reviewsQuery.data ?? []} />
    </div>
  );
}
// Removed: 4 useState calls, 1 useEffect, error string state, manual loading flag
// Gained: caching, dedup, retry, background refetch, request cancellation ✅
```
