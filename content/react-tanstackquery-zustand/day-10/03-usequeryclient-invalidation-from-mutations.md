# 3 — `useQueryClient` & Invalidation from Mutations

## T — TL;DR

`useQueryClient` gives you direct access to the cache inside components and hooks — use it in mutation callbacks to invalidate stale queries, force refetches, and keep server state synchronized after writes.

## K — Key Concepts

**Accessing the `QueryClient` in hooks:**

```jsx
import { useQueryClient } from "@tanstack/react-query"

function useCreatePost() {
  const queryClient = useQueryClient()   // ✅ access the shared cache

  return useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      // Invalidate the posts list so it refetches
      await queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}
```

**`invalidateQueries` — the primary post-mutation tool:**

```jsx
// Invalidate all queries starting with ["posts"]
queryClient.invalidateQueries({ queryKey: ["posts"] })
// Matches: ["posts"], ["posts", "list"], ["posts", 42], ["posts", { page: 1 }]

// Exact match only
queryClient.invalidateQueries({
  queryKey: ["posts"],
  exact: true,  // only invalidates ["posts"] — not ["posts", 42]
})

// Invalidate with a predicate function
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey === "posts" && query.queryKey?.page > 2,
})
```

**What invalidation actually does:**

```
Mounted observers (components currently using the query):
  → Query is marked stale immediately
  → Background refetch fires immediately
  → Component silently updates with fresh data

Unmounted observers (nobody currently using the query):
  → Query is marked stale in cache
  → Next component mount triggers refetch
  → No immediate network activity
```

**Invalidating related queries after mutations:**

```jsx
// Creating a new order — invalidate order list AND user's order count
function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: async (newOrder) => {
      // Invalidate multiple related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["user", newOrder.userId, "stats"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", newOrder.productId] }),
      ])
    },
  })
}
```


## W — Why It Matters

Invalidation is what closes the loop between writes and reads. Without it, a user creates a post and sees the old list — the UI is out of sync with the server. Invalidation is the explicit signal that says "this cache region is no longer trustworthy — refresh it." Understanding which queries to invalidate — and using hierarchical keys to target them precisely — is what keeps complex apps consistent.

## I — Interview Q&A

**Q: What does `queryClient.invalidateQueries` actually do?**
**A:** It marks matching cache entries as stale. For entries with active observers (mounted components), it immediately triggers a background refetch — the component shows cached data and silently updates. For inactive entries, it just marks them stale so the next mount triggers a fresh fetch.

**Q: How do you invalidate all queries related to a resource after a mutation?**
**A:** Use the hierarchical key structure — `invalidateQueries({ queryKey: ["posts"] })` invalidates every key starting with `"posts"`. This is why Key Factories use nested arrays: a single broad invalidation covers the resource and all its sub-queries.

**Q: Should you `await` `invalidateQueries` in mutation callbacks?**
**A:** Yes, in `onSettled` — `await`ing it keeps the mutation in `isPending: true` until the refetch completes, ensuring the UI updates with fresh data at the same time as the mutation resolves. In `onSuccess`, `await` if you need the UI to show fresh data before navigating away.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not invalidating after mutations — stale list data | Always call `invalidateQueries` in `onSuccess` or `onSettled` |
| Invalidating too broadly — unrelated queries refetch | Use specific key paths: `["orders"]` not all queries |
| Invalidating too narrowly — related queries stay stale | Think about ALL caches affected: list, count, stats, related entities |
| Not awaiting `invalidateQueries` — mutation resolves before UI updates | `return await queryClient.invalidateQueries(...)` in `onSettled` |

## K — Coding Challenge

**Challenge:** A `useDeleteComment` mutation should: (1) invalidate the comment list for the post, (2) invalidate the post's comment count, (3) invalidate the user's activity feed — all using a Key Factory:

**Solution:**

```jsx
// queries/keys.ts
export const commentKeys = {
  all: () => ["comments"],
  byPost: (postId) => [...commentKeys.all(), "byPost", postId],
}
export const postKeys = {
  all: () => ["posts"],
  detail: (id) => [...postKeys.all(), "detail", id],
  stats: (id) => [...postKeys.detail(id), "stats"],
}
export const userKeys = {
  all: () => ["users"],
  activity: (userId) => [...userKeys.all(), userId, "activity"],
}

// mutations/useDeleteComment.ts
function useDeleteComment({ postId, userId }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId) =>
      fetch(`/api/comments/${commentId}`, { method: "DELETE" }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    retry: 0,

    onSuccess: async (_, commentId) => {
      // Invalidate all three related cache regions simultaneously ✅
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: commentKeys.byPost(postId) }),
        queryClient.invalidateQueries({ queryKey: postKeys.stats(postId) }),
        queryClient.invalidateQueries({ queryKey: userKeys.activity(userId) }),
      ])
    },

    onError: (error) => {
      toast.error(`Could not delete comment: ${error.message}`)
    },
  })
}
```


***
