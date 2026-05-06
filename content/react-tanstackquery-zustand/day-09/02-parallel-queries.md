# 2 — Parallel Queries

## T — TL;DR

Parallel queries fire multiple independent fetches simultaneously — simply call multiple `useQuery` hooks at the top level and they execute concurrently with no extra configuration.

## K — Key Concepts

**Automatic parallelism — just call multiple `useQuery` hooks:**

```jsx
function Dashboard() {
  // These three fire SIMULTANEOUSLY — no waterfall
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers })
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: fetchOrders })
  const statsQuery = useQuery({ queryKey: ["stats"], queryFn: fetchStats })

  // Each query has independent loading/error state
  const isPending = usersQuery.isPending || ordersQuery.isPending || statsQuery.isPending

  return (
    <div>
      {usersQuery.isSuccess && <UserPanel users={usersQuery.data} />}
      {ordersQuery.isSuccess && <OrderPanel orders={ordersQuery.data} />}
      {statsQuery.isSuccess && <StatsPanel stats={statsQuery.data} />}
    </div>
  )
}
```

**Independent rendering — show each section as it arrives:**

```jsx
function Dashboard() {
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers })
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: fetchOrders })

  // Each section shows its own skeleton while loading
  return (
    <div>
      <section>
        {usersQuery.isPending
          ? <UserSkeleton />
          : usersQuery.isError
          ? <ErrorBanner error={usersQuery.error} />
          : <UserPanel users={usersQuery.data} />
        }
      </section>
      <section>
        {ordersQuery.isPending
          ? <OrderSkeleton />
          : ordersQuery.isError
          ? <ErrorBanner error={ordersQuery.error} />
          : <OrderPanel orders={ordersQuery.data} />
        }
      </section>
    </div>
  )
}
```

**Parallel vs serial — when to choose which:**


| Use parallel when... | Use dependent (serial) when... |
| :-- | :-- |
| Queries are fully independent | Query B needs data from Query A |
| You want fastest total load time | The ID/key for B comes from A's response |
| Each section can render independently | Running B without A's data would cause an error |

## W — Why It Matters

The waterfall anti-pattern — fetching A, waiting, then fetching B — doubles or triples load time. Parallel queries eliminate this. Every dashboard, profile page, or multi-section view should fire independent queries simultaneously. This is one of the biggest performance wins in data fetching architecture.

## I — Interview Q&A

**Q: How do you run multiple queries in parallel with TanStack Query?**
**A:** Simply call multiple `useQuery` hooks at the top level of a component. React renders them all, and TanStack Query fires all their fetches simultaneously in the same render cycle. No special configuration is needed — parallelism is the default.

**Q: How do you handle the case where you want to wait for ALL parallel queries before rendering?**
**A:** Combine the `isPending` flags: `const isPending = queryA.isPending || queryB.isPending`. Show a combined skeleton until both are done, or render sections independently as each one resolves.

**Q: What is the difference between parallel queries and `useQueries`?**
**A:** `useQuery` called multiple times handles a fixed, known number of parallel queries. `useQueries` is for a dynamic array of queries — when the number of queries is determined at runtime (e.g., fetch details for each item in a list of unknown length).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Nesting fetches in `useEffect` sequentially when data is independent | Use parallel `useQuery` hooks — they fire simultaneously without waterfalls |
| Blocking all sections on the slowest query | Handle each query's `isPending` independently — fast sections render early |
| Using `Promise.all` inside a single `queryFn` for truly independent data | Split into separate `useQuery` calls — each gets its own cache entry, invalidation, and retry logic |
| Making dependent queries parallel when B requires A's result | Keep serial with `enabled` — parallelizing a true dependency causes runtime errors |

## K — Coding Challenge

**Challenge:** A product detail page needs: product info, related products, reviews, and inventory — all independent. Build the parallel query structure with independent section rendering:

**Solution:**

```jsx
function ProductDetailPage({ productId }) {
  // All four fire simultaneously ✅
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
  })

  const relatedQuery = useQuery({
    queryKey: ["related", productId],
    queryFn: () => fetchRelatedProducts(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10,
  })

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 2,
  })

  const inventoryQuery = useQuery({
    queryKey: ["inventory", productId],
    queryFn: () => fetchInventory(productId),
    enabled: !!productId,
    staleTime: 1000 * 30,           // inventory: short freshness
    refetchInterval: 1000 * 60,     // poll every minute
  })

  // Critical above-the-fold content waits on product only
  if (productQuery.isPending) return <ProductPageSkeleton />
  if (productQuery.isError) return <ErrorPage error={productQuery.error} />

  return (
    <div>
      <ProductHero product={productQuery.data} />
      <InventoryBadge
        isPending={inventoryQuery.isPending}
        stock={inventoryQuery.data?.quantity}
      />

      <section>
        {reviewsQuery.isPending
          ? <ReviewsSkeleton />
          : <ReviewList reviews={reviewsQuery.data} />
        }
      </section>

      <section>
        {relatedQuery.isPending
          ? <RelatedSkeleton />
          : <RelatedProducts products={relatedQuery.data} />
        }
      </section>
    </div>
  )
}
```


***
