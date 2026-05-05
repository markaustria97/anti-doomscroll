# 6 — Rollback Mindset

## T — TL;DR

The rollback mindset treats optimistic updates as temporary assumptions — always snapshot before applying, always revert on failure, and always reconcile with server truth via `onSettled` invalidation.[^6][^1]

## K — Key Concepts

**The complete rollback mental model:**[^1]

```
Assume success → Apply optimistic change
Server responds
├── Success → onSettled invalidation confirms truth
└── Failure → onError restores snapshot → onSettled invalidation re-syncs

Cache state after failure: SAME as before the mutation ✅
```

**Rollback for multiple related caches:**

```jsx
onMutate: async ({ postId, liked }) => {
  // Cancel refetches for ALL affected keys
  await Promise.all([
    queryClient.cancelQueries({ queryKey: ["post", postId] }),
    queryClient.cancelQueries({ queryKey: ["posts", "list"] }),
    queryClient.cancelQueries({ queryKey: ["user", "stats"] }),
  ])

  // Snapshot ALL affected caches
  const previousPost = queryClient.getQueryData(["post", postId])
  const previousList = queryClient.getQueryData(["posts", "list"])
  const previousStats = queryClient.getQueryData(["user", "stats"])

  // Apply optimistic updates to all
  queryClient.setQueryData(["post", postId], (old) => ({ ...old, liked, likeCount: old.likeCount + 1 }))
  queryClient.setQueryData(["posts", "list"], (old) =>
    old?.map(p => p.id === postId ? { ...p, liked, likeCount: p.likeCount + 1 } : p)
  )
  queryClient.setQueryData(["user", "stats"], (old) => ({ ...old, totalLikes: old.totalLikes + 1 }))

  // Return ALL snapshots for rollback
  return { previousPost, previousList, previousStats }
},

onError: (err, variables, context) => {
  // Restore ALL snapshots ✅
  queryClient.setQueryData(["post", variables.postId], context.previousPost)
  queryClient.setQueryData(["posts", "list"], context.previousList)
  queryClient.setQueryData(["user", "stats"], context.previousStats)
},

onSettled: async (_, __, { postId }) => {
  // Reconcile ALL affected caches with server truth
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["post", postId] }),
    queryClient.invalidateQueries({ queryKey: ["posts", "list"] }),
    queryClient.invalidateQueries({ queryKey: ["user", "stats"] }),
  ])
},
```

**Handling concurrent mutations:**[^6][^5]

```jsx
// Problem: user clicks like 3 times quickly
// Mutation 1: optimistic +1
// Mutation 2: optimistic +1 again
// Mutation 1 fails → rollback wipes Mutation 2's update too

// Solution: don't rollback if other mutations are still pending
onError: (err, variables, context) => {
  const isMutatingCount = queryClient.isMutating({ mutationKey: ["toggleLike"] })

  if (isMutatingCount === 0) {
    // Only rollback if no other like mutations are in flight
    queryClient.setQueryData(["post", variables.postId], context.previousPost)
  }
  // Let onSettled invalidation handle the final state
},
```


## W — Why It Matters

Without the rollback mindset, optimistic updates are a liability — a failed mutation leaves the UI in an incorrect state that looks correct to the user. The rollback mindset flips this: optimistic updates become safe because failure is always recoverable. The `onSettled` invalidation is the safety net that guarantees eventual consistency regardless of what went wrong.[^5][^1]

## I — Interview Q&A

**Q: What is the rollback mindset in optimistic updates?**
**A:** Always treat the optimistic change as provisional. Snapshot the current state before modifying the cache, revert to the snapshot on error, and always use `onSettled` invalidation to let the server's actual state overwrite everything — both on success and on failure.[^1]

**Q: What happens if you don't roll back on error?**
**A:** The cache shows incorrect data that diverges from the server. The user sees a like that wasn't recorded, a deleted item that still exists, or a completed task that didn't save. The UI lies. Without rollback, optimistic updates are worse than no optimistic updates.[^1]

**Q: How do you handle concurrent mutations that update the same cache entry?**
**A:** Use `queryClient.isMutating({ mutationKey: [...] })` to check if other mutations of the same type are still in flight before rolling back. If other mutations are pending, skip the rollback — let `onSettled` invalidation reconcile the final state after all mutations settle.[^5]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Rollback only on error, no `onSettled` invalidation | Always add `onSettled` — optimistic data may differ from server truth even on success |
| Not snapshotting all affected caches | If you update 3 caches optimistically, snapshot all 3 for complete rollback |
| Rollback without `cancelQueries` — in-flight request overwrites rollback | `cancelQueries` first, then apply optimistic change — ensures no race condition |
| Abrupt rollback visible to user — jarring UX | Pair rollback with a toast: "Action failed — reverted" so users understand why UI changed |

## K — Coding Challenge

**Challenge:** An e-commerce cart "add to cart" button — implement the full rollback mindset: snapshot the cart, optimistically add the item, roll back with a toast on failure, and reconcile with server on settled:

**Solution:**

```jsx
function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }) =>
      fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),

    retry: 0,  // ✅ never retry cart mutations — could add duplicate items

    onMutate: async ({ productId, quantity }) => {
      // 1. Cancel any cart refetches
      await queryClient.cancelQueries({ queryKey: ["cart"] })

      // 2. Snapshot cart AND cart item count badge
      const previousCart = queryClient.getQueryData(["cart"])
      const previousCount = queryClient.getQueryData(["cart", "count"])

      // 3. Optimistically add item to cart
      queryClient.setQueryData(["cart"], (old) => ({
        ...old,
        items: [
          ...(old?.items ?? []),
          { productId, quantity, id: "optimistic-" + productId, pending: true },
        ],
        total: (old?.total ?? 0) + quantity,
      }))

      // 4. Optimistically update cart count badge
      queryClient.setQueryData(["cart", "count"], (old = 0) => old + quantity)

      return { previousCart, previousCount }  // ← snapshot context
    },

    onError: (error, variables, context) => {
      // 5. Restore both snapshots
      queryClient.setQueryData(["cart"], context.previousCart)
      queryClient.setQueryData(["cart", "count"], context.previousCount)
      toast.error(`Couldn't add to cart: ${error.message}`)
    },

    onSettled: async () => {
      // 6. Reconcile with server truth — always
      return await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
        queryClient.invalidateQueries({ queryKey: ["cart", "count"] }),
      ])
    },
  })
}
```


***
