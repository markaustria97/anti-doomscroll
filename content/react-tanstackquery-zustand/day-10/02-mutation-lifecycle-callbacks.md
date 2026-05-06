# 2 — Mutation Lifecycle Callbacks

## T — TL;DR

`useMutation` provides four lifecycle callbacks — `onMutate`, `onSuccess`, `onError`, `onSettled` — that fire in sequence and share a `context` object for coordinating optimistic updates and rollbacks.

## K — Key Concepts

**Callback execution order and signatures:**

```jsx
useMutation({
  mutationFn: updateUser,

  // 1. Fires BEFORE the request — use for optimistic updates
  onMutate: async (variables) => {
    // variables = what was passed to mutate()
    // Return anything → becomes `context` in subsequent callbacks
    return { snapshotData: "saved value" }
  },

  // 2. Fires on SUCCESS — use for invalidation, success toasts
  onSuccess: (data, variables, context) => {
    // data     = server response
    // variables = what was passed to mutate()
    // context  = return value of onMutate
    queryClient.invalidateQueries({ queryKey: ["users"] })
    toast.success("User updated!")
  },

  // 3. Fires on ERROR — use for rollback, error toasts
  onError: (error, variables, context) => {
    // error    = the thrown Error
    // variables = what was passed to mutate()
    // context  = return value of onMutate (snapshot for rollback)
    queryClient.setQueryData(["user", variables.id], context.previousData)
    toast.error(`Update failed: ${error.message}`)
  },

  // 4. Fires ALWAYS (success or error) — use for final cleanup
  onSettled: (data, error, variables, context) => {
    // Runs regardless of outcome
    // Ideal for definitive invalidation after optimistic update
    queryClient.invalidateQueries({ queryKey: ["users"] })
  },
})
```

**Per-call callbacks via `mutate(variables, callbacks)`:**

```jsx
// Global callbacks on useMutation (run for every call)
const { mutate } = useMutation({
  mutationFn: updatePost,
  onSuccess: () => console.log("global success"),
})

// Per-call callbacks (run for THIS specific call only)
mutate(postData, {
  onSuccess: (data) => navigate(`/posts/${data.id}`),   // specific navigation
  onError: (err) => alert(`Failed: ${err.message}`),
})

// Both fire: global first, then per-call
```

**Awaiting invalidation in `onSettled`:**

```jsx
// ✅ Return the Promise from invalidateQueries
// → mutation stays "pending" until refetch completes
// → UI updates with fresh data before isPending goes false
onSettled: async () => {
  return await queryClient.invalidateQueries({ queryKey: ["todos"] })
}

// ❌ Not awaiting — mutation resolves before data is fresh
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ["todos"] })  // fire and forget
}
```


## W — Why It Matters

The lifecycle callback sequence — and especially the `context` object that flows from `onMutate` through `onError` — is the entire mechanism for optimistic updates and rollbacks. Understanding the order and signatures is what separates correctly implemented optimistic UI from buggy, race-condition-prone implementations.

## I — Interview Q&A

**Q: What is the purpose of returning a value from `onMutate`?**
**A:** The return value becomes the `context` argument in `onSuccess`, `onError`, and `onSettled`. This is how you pass a snapshot of the previous cache state from `onMutate` to `onError` for rollback — without this mechanism, you'd have no way to undo the optimistic update on failure.

**Q: When would you put invalidation in `onSuccess` vs `onSettled`?**
**A:** `onSettled` is safer for invalidation — it fires regardless of success or error, ensuring the cache is always synced with the server even on failure. Use `onSuccess` only for side effects that should only happen on success (navigation, success toasts). For optimistic updates, always invalidate in `onSettled` to reconcile the cache.

**Q: What happens if both global and per-call `onSuccess` callbacks are defined?**
**A:** Both fire — the global callback first, then the per-call callback. This lets you define shared behavior (invalidation) globally and call-specific behavior (navigation, component-level state) per call.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not awaiting `invalidateQueries` in `onSettled` | `return await queryClient.invalidateQueries(...)` — keeps mutation pending until data refreshes |
| Rollback only in `onError`, no final invalidation in `onSettled` | Always add `onSettled` invalidation — ensures server truth even if rollback is imperfect |
| Putting navigation in global `onSuccess` instead of per-call | Navigation is call-specific — use `mutate(data, { onSuccess: () => navigate(...) })` |
| `onMutate` not returning context — `onError` can't rollback | Always `return { previousData }` from `onMutate` when doing optimistic updates |

## K — Coding Challenge

**Challenge:** Build a `useToggleLike` mutation hook for a like button. Use all four callbacks: `onMutate` for optimistic toggle, `onError` for rollback, `onSettled` for final invalidation, with a per-call `onSuccess` callback for analytics:

**Solution:**

```jsx
function useToggleLike(postId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ liked }) =>
      fetch(`/api/posts/${postId}/like`, {
        method: liked ? "POST" : "DELETE",
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),

    // 1. Optimistic update BEFORE request
    onMutate: async ({ liked }) => {
      // Cancel outgoing refetches to prevent overwrites
      await queryClient.cancelQueries({ queryKey: ["post", postId] })

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(["post", postId])

      // Optimistically toggle the like
      queryClient.setQueryData(["post", postId], (old) => ({
        ...old,
        liked,
        likeCount: liked ? (old.likeCount + 1) : (old.likeCount - 1),
      }))

      return { previousPost }   // ← becomes context
    },

    // 2. Rollback on error
    onError: (error, variables, context) => {
      queryClient.setQueryData(["post", postId], context.previousPost)
      toast.error("Like action failed — reverted")
    },

    // 3. Definitive sync — always runs
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["post", postId] })
    },
  })
}

// Usage with per-call analytics
function LikeButton({ postId }) {
  const { data: post } = useQuery({ queryKey: ["post", postId], queryFn: () => fetchPost(postId) })
  const { mutate, isPending } = useToggleLike(postId)

  return (
    <button
      onClick={() => mutate(
        { liked: !post.liked },
        { onSuccess: () => analytics.track("like_toggled", { postId }) }  // per-call
      )}
      disabled={isPending}
    >
      {post?.liked ? "❤️" : "🤍"} {post?.likeCount}
    </button>
  )
}
```


***
