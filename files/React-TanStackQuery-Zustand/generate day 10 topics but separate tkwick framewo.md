<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 10 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 10	Mutations and Advanced Server State
useMutation, mutation lifecycle, useQueryClient, invalidation from mutations, invalidating related queries, direct cache updates, optimistic updates, rollback mindset, query cancellation with AbortSignal, paginated queries, placeholderData, keepPreviousData, useInfiniteQuery, fetchNextPage, getNextPageParam, avoiding loading flicker in large lists

Here is the complete **Day 10 — Mutations and Advanced Server State** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 10 — Mutations and Advanced Server State

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — `useMutation`

## T — TL;DR

`useMutation` is TanStack Query's hook for write operations — create, update, delete — giving you mutation lifecycle states, callbacks, and error handling without managing a single piece of `useState`.[^2]

## K — Key Concepts

**Full anatomy of `useMutation` (v5):**[^2]

```jsx
import { useMutation } from "@tanstack/react-query"

const {
  mutate,         // fire the mutation (fire-and-forget)
  mutateAsync,    // fire and return a Promise (for await)
  isPending,      // true while the mutation is in flight
  isSuccess,      // true after a successful response
  isError,        // true if mutation threw
  isIdle,         // true before any call and after reset()
  error,          // the thrown Error object
  data,           // the server response on success
  variables,      // the arguments passed to mutate()
  reset,          // reset state back to idle
} = useMutation({
  mutationFn: (newPost) =>
    fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(newPost),
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }),

  // Lifecycle callbacks
  onMutate:  (variables) => { /* fires before the request */ },
  onSuccess: (data, variables, context) => { /* fires on success */ },
  onError:   (error, variables, context) => { /* fires on error */ },
  onSettled: (data, error, variables, context) => { /* fires always */ },

  retry: 0,   // mutations default to NO retry — unlike queries
})
```

**`mutate` vs `mutateAsync`:**

```jsx
// mutate — fire and forget, errors handled in onError callback
function DeleteButton({ postId }) {
  const { mutate, isPending } = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => toast.success("Deleted!"),
    onError: (err) => toast.error(err.message),
  })
  return (
    <button onClick={() => mutate()} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </button>
  )
}

// mutateAsync — await the result, handle errors with try/catch
async function handleSubmit(formData) {
  try {
    const createdPost = await mutateAsync(formData)
    navigate(`/posts/${createdPost.id}`)   // use server response
  } catch (err) {
    console.error("Failed:", err)
  }
}
```

**The mutation state machine:**

```
idle → pending (mutate() called)
          ↓
    success (resolved)   ← onSuccess fires
          ↓
    settled              ← onSettled fires
    
          OR
          
    error (rejected)     ← onError fires
          ↓
    settled              ← onSettled fires
          ↓
    idle   (reset() called)
```


## W — Why It Matters

Before `useMutation`, developers hand-wrote `isLoading` booleans, `try/catch` blocks, and success/error toast logic inside every event handler. `useMutation` centralizes the write contract — one hook owns the mutation state, callbacks provide clean lifecycle hooks, and `variables` enables instant optimistic UI before the response arrives.[^2]

## I — Interview Q\&A

**Q: What is the difference between `mutate` and `mutateAsync`?**
**A:** `mutate` is fire-and-forget — errors are caught by `onError` and won't propagate as unhandled rejections. `mutateAsync` returns a Promise — you `await` it and handle errors with `try/catch`. Use `mutateAsync` when you need the server response (e.g., to navigate to the created resource's page).[^2]

**Q: Why do mutations default to `retry: 0` while queries default to `retry: 3`?**
**A:** Queries are idempotent reads — retrying is always safe. Mutations have side effects — retrying a failed `POST /orders` could create duplicate orders. Mutations should only retry when you're certain they're idempotent (e.g., a PUT with an idempotency key).[^2]

**Q: What does `variables` on the mutation result contain?**
**A:** The exact argument passed to the last `mutate()` call. This is available immediately — even before the server responds — making it useful for optimistic UI: render the pending state using `variables` while the request is in flight.[^4][^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `mutateAsync` without `try/catch` — unhandled rejection | Wrap in `try/catch` or use `mutate` + `onError` callback |
| Calling `mutate()` multiple times before previous one resolves | Add `disabled={isPending}` to the trigger button |
| Not handling HTTP errors — `fetch` doesn't throw on 4xx/5xx | Always `if (!r.ok) throw new Error(...)` inside `mutationFn` |
| Retrying mutations that create server-side resources | Set `retry: 0` for all non-idempotent mutations |

## K — Coding Challenge

**Challenge:** Build a `CreatePost` form with: submit button disabled while pending, success redirect using the server response ID, error display, and form reset on success:

**Solution:**

```jsx
function CreatePostForm() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  const { mutateAsync, isPending, isError, error, reset } = useMutation({
    mutationFn: (post) =>
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
        return r.json()
      }),
    retry: 0,  // ✅ POST — never auto-retry
  })

  async function handleSubmit(e) {
    e.preventDefault()
    reset()  // clear any prior error state
    try {
      const createdPost = await mutateAsync({ title, body })
      navigate(`/posts/${createdPost.id}`)    // ✅ use server response ID
    } catch {
      // error is already captured in `error` state — no extra handling needed
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Body"
        required
      />
      {isError && (
        <p role="alert" style={{ color: "red" }}>
          Error: {error.message}
        </p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Post"}
      </button>
    </form>
  )
}
```


***

# 2 — Mutation Lifecycle Callbacks

## T — TL;DR

`useMutation` provides four lifecycle callbacks — `onMutate`, `onSuccess`, `onError`, `onSettled` — that fire in sequence and share a `context` object for coordinating optimistic updates and rollbacks.[^2]

## K — Key Concepts

**Callback execution order and signatures:**[^2]

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

**Awaiting invalidation in `onSettled`:**[^4]

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

The lifecycle callback sequence — and especially the `context` object that flows from `onMutate` through `onError` — is the entire mechanism for optimistic updates and rollbacks. Understanding the order and signatures is what separates correctly implemented optimistic UI from buggy, race-condition-prone implementations.[^2]

## I — Interview Q\&A

**Q: What is the purpose of returning a value from `onMutate`?**
**A:** The return value becomes the `context` argument in `onSuccess`, `onError`, and `onSettled`. This is how you pass a snapshot of the previous cache state from `onMutate` to `onError` for rollback — without this mechanism, you'd have no way to undo the optimistic update on failure.[^2]

**Q: When would you put invalidation in `onSuccess` vs `onSettled`?**
**A:** `onSettled` is safer for invalidation — it fires regardless of success or error, ensuring the cache is always synced with the server even on failure. Use `onSuccess` only for side effects that should only happen on success (navigation, success toasts). For optimistic updates, always invalidate in `onSettled` to reconcile the cache.[^4][^2]

**Q: What happens if both global and per-call `onSuccess` callbacks are defined?**
**A:** Both fire — the global callback first, then the per-call callback. This lets you define shared behavior (invalidation) globally and call-specific behavior (navigation, component-level state) per call.[^2]

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

# 3 — `useQueryClient` \& Invalidation from Mutations

## T — TL;DR

`useQueryClient` gives you direct access to the cache inside components and hooks — use it in mutation callbacks to invalidate stale queries, force refetches, and keep server state synchronized after writes.[^2]

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

**`invalidateQueries` — the primary post-mutation tool:**[^2]

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
    query.queryKey[^0] === "posts" && query.queryKey[^1]?.page > 2,
})
```

**What invalidation actually does:**[^2]

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

Invalidation is what closes the loop between writes and reads. Without it, a user creates a post and sees the old list — the UI is out of sync with the server. Invalidation is the explicit signal that says "this cache region is no longer trustworthy — refresh it." Understanding which queries to invalidate — and using hierarchical keys to target them precisely — is what keeps complex apps consistent.[^2]

## I — Interview Q\&A

**Q: What does `queryClient.invalidateQueries` actually do?**
**A:** It marks matching cache entries as stale. For entries with active observers (mounted components), it immediately triggers a background refetch — the component shows cached data and silently updates. For inactive entries, it just marks them stale so the next mount triggers a fresh fetch.[^2]

**Q: How do you invalidate all queries related to a resource after a mutation?**
**A:** Use the hierarchical key structure — `invalidateQueries({ queryKey: ["posts"] })` invalidates every key starting with `"posts"`. This is why Key Factories use nested arrays: a single broad invalidation covers the resource and all its sub-queries.[^2]

**Q: Should you `await` `invalidateQueries` in mutation callbacks?**
**A:** Yes, in `onSettled` — `await`ing it keeps the mutation in `isPending: true` until the refetch completes, ensuring the UI updates with fresh data at the same time as the mutation resolves. In `onSuccess`, `await` if you need the UI to show fresh data before navigating away.[^4]

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

# 4 — Direct Cache Updates with `setQueryData`

## T — TL;DR

`setQueryData` writes directly into the cache without a network request — use it when the server's mutation response already contains the updated data, eliminating a redundant refetch.[^1][^2]

## K — Key Concepts

**`setQueryData` — write directly to the cache:**

```jsx
queryClient.setQueryData(queryKey, newData)

// Updater function (like useState's functional update)
queryClient.setQueryData(["user", userId], (previousUser) => ({
  ...previousUser,
  name: "New Name",
  updatedAt: Date.now(),
}))
```

**When to use `setQueryData` vs `invalidateQueries`:**


|  | `setQueryData` | `invalidateQueries` |
| :-- | :-- | :-- |
| Network request | ❌ None — uses mutation response | ✅ Triggers a refetch |
| Use when | Server returns the updated entity | Server returns only `{ success: true }` |
| Data accuracy | Only as accurate as the mutation response | Always server truth |
| Speed | ⚡ Instant — no round trip | 🕐 Requires a refetch |

**Pattern — update cache from mutation response:**

```jsx
function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...updates }) =>
      fetch(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }).then(r => r.json()),

    onSuccess: (updatedUser) => {
      // Server returned the full updated user → write directly to cache
      queryClient.setQueryData(["user", updatedUser.id], updatedUser)

      // Also update the user in any list caches
      queryClient.setQueryData(["users"], (previousUsers) =>
        previousUsers?.map(u => u.id === updatedUser.id ? updatedUser : u)
      )
    },
  })
}
```

**Combining `setQueryData` + `invalidateQueries`:**

```jsx
onSuccess: async (updatedUser) => {
  // 1. Immediate cache update — instant UI (no spinner)
  queryClient.setQueryData(["user", updatedUser.id], updatedUser)

  // 2. Invalidate related queries that weren't directly updated
  await queryClient.invalidateQueries({ queryKey: ["users", "list"] })
  await queryClient.invalidateQueries({ queryKey: ["user", updatedUser.id, "stats"] })
}
```


## W — Why It Matters

`setQueryData` eliminates the "update → invalidate → refetch" round trip for resources where the mutation response is the complete updated entity. This is common in REST APIs that return the full resource on PATCH/PUT. Knowing when to use direct cache writes vs. invalidation is the difference between snappy instant updates and a loading flash after every save.[^1]

## I — Interview Q\&A

**Q: What is the difference between `setQueryData` and `invalidateQueries`?**
**A:** `setQueryData` writes data directly into the cache from a local value (like the mutation response) — no network request. `invalidateQueries` marks the cache as stale and triggers a server refetch. Use `setQueryData` when the mutation response contains the full updated entity; use `invalidateQueries` when it doesn't.

**Q: How do you update a specific item inside a cached list with `setQueryData`?**
**A:** Use the updater function form: `queryClient.setQueryData(["items"], (prev) => prev?.map(item => item.id === updatedItem.id ? updatedItem : item))`. Always use optional chaining on `prev` — the list may not be in the cache yet.[^2]

**Q: Does `setQueryData` reset the `staleTime` timer?**
**A:** Yes — `setQueryData` counts as a successful data update. The `dataUpdatedAt` timestamp is set to `Date.now()`, and the freshness window restarts from that point. Use `queryClient.setQueryData` with `updatedAt` option to control the exact freshness timestamp if needed.[^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `setQueryData` with a partial object — overwriting instead of merging | Use the updater function form with spread: `(old) => ({ ...old, ...updates })` |
| Not handling `undefined` in the updater — cache might be empty | `(old) => old ? { ...old, name } : old` — guard against undefined cache |
| Using `setQueryData` when the response doesn't include the full entity | Use `invalidateQueries` — a partial update is worse than a full refetch |
| Forgetting to also update list caches when updating a detail | Update both `["user", id]` AND `["users"]` list entry |

## K — Coding Challenge

**Challenge:** An `EditProfileForm` saves user profile changes — the API returns the full updated user. Use `setQueryData` to update the detail cache AND the user in any list caches:

**Solution:**

```jsx
function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profileData) =>
      fetch(`/api/users/${profileData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()  // returns full updated user
      }),

    onSuccess: (updatedUser) => {
      // 1. Update the detail cache instantly — no refetch needed ✅
      queryClient.setQueryData(
        ["user", updatedUser.id],
        updatedUser
      )

      // 2. Update this user inside any cached list ✅
      queryClient.setQueriesData(
        { queryKey: ["users"] },           // matches all "users" queries
        (previousList) => {
          if (!previousList) return previousList
          return previousList.map(u =>
            u.id === updatedUser.id ? updatedUser : u
          )
        }
      )

      // 3. Invalidate related queries that can't be directly updated
      queryClient.invalidateQueries({
        queryKey: ["user", updatedUser.id, "activity"]
      })

      toast.success("Profile updated!")
    },

    onError: (error) => {
      toast.error(`Save failed: ${error.message}`)
    },
  })
}
```


***

# 5 — Optimistic Updates

## T — TL;DR

Optimistic updates apply the expected server change to the cache immediately — before the network request completes — giving instant UI feedback, then rolling back if the server disagrees.[^5][^1]

## K — Key Concepts

**The 4-step optimistic update pattern:**[^1]

```jsx
useMutation({
  mutationFn: updateTodo,

  onMutate: async (updatedTodo) => {
    // STEP 1: Cancel any in-flight refetches for this key
    // (prevents the optimistic update from being overwritten)
    await queryClient.cancelQueries({ queryKey: ["todo", updatedTodo.id] })

    // STEP 2: Snapshot the current cache value (for rollback)
    const previousTodo = queryClient.getQueryData(["todo", updatedTodo.id])

    // STEP 3: Optimistically write the expected value
    queryClient.setQueryData(["todo", updatedTodo.id], updatedTodo)

    // STEP 4: Return snapshot as context for rollback
    return { previousTodo }
  },

  onError: (error, updatedTodo, context) => {
    // Rollback: restore the snapshot on failure
    queryClient.setQueryData(["todo", updatedTodo.id], context.previousTodo)
  },

  onSettled: async (data, error, variables) => {
    // Always invalidate to sync with server truth
    await queryClient.invalidateQueries({ queryKey: ["todo", variables.id] })
  },
})
```

**The "variables" pattern — lightweight optimistic UI (v5):**[^4]

```jsx
// No cache manipulation — use mutation variables directly in the UI
const { isPending, variables, mutate } = useMutation({
  mutationFn: (newTodo) => createTodo(newTodo),
  onSettled: async () => {
    return await queryClient.invalidateQueries({ queryKey: ["todos"] })
  },
})

return (
  <ul>
    {todos?.map(t => <TodoItem key={t.id} todo={t} />)}

    {/* Show optimistic item while request is in flight */}
    {isPending && (
      <TodoItem
        key="optimistic"
        todo={{ ...variables, id: "temp", pending: true }}
        style={{ opacity: 0.6 }}
      />
    )}
  </ul>
)
// No cache manipulation — simpler, less error-prone ✅
```

**When to use which pattern:**


| Pattern | Use when |
| :-- | :-- |
| Cache manipulation (`setQueryData` in `onMutate`) | Update to existing item; needs instant accurate position in list |
| Variables pattern (`isPending + variables`) | Creating new items; simpler to add to the bottom of a list |

## W — Why It Matters

Optimistic updates make write operations feel instantaneous — critical for interactive UX like liking posts, reordering lists, or checking todo items. The user sees the change immediately rather than waiting for a server round-trip. The rollback mechanism means the app is still correct when the server disagrees — no permanent data corruption from failed requests.[^5][^1]

## I — Interview Q\&A

**Q: Why must you call `cancelQueries` at the start of `onMutate`?**
**A:** If a background refetch is in flight, it could resolve after your optimistic update and overwrite it with the old server data — a race condition. `cancelQueries` aborts in-flight requests for that key so they don't clobber the optimistic state.[^1]

**Q: What is the "variables" optimistic pattern and when should you prefer it?**
**A:** Instead of manipulating the cache, you render the pending item directly from `variables` (the mutation's arguments) while `isPending` is `true`. It's simpler — no snapshot, no rollback needed for the list itself. Best for creating new items appended to a list; use cache manipulation for updates to existing items.[^4]

**Q: What is the rollback mechanism in optimistic updates?**
**A:** In `onMutate`, take a snapshot of the cache with `getQueryData` and return it as `context`. In `onError`, restore the snapshot with `setQueryData(key, context.previousData)`. Then in `onSettled`, invalidate to sync with true server state.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `cancelQueries` in `onMutate` — refetch overwrites optimistic state | Always `await queryClient.cancelQueries(...)` as the first step |
| No `onSettled` invalidation — cache never reconciles with server | Add `onSettled: () => invalidateQueries(...)` even after successful optimistic updates |
| Not returning context from `onMutate` — `onError` can't rollback | Always `return { previousData }` from `onMutate` |
| Optimistic update with wrong data shape — UI shows malformed item | Mirror the exact shape the `useQuery` data returns — including all fields |

## K — Coding Challenge

**Challenge:** Build an optimistic todo checkbox using both patterns — first with cache manipulation, then with the variables pattern — so you can compare:

**Solution:**

```jsx
// PATTERN 1: Cache manipulation — best for updating existing items
function useToggleTodoCachePattern() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, completed }) =>
      fetch(`/api/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      }).then(r => r.json()),

    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] })

      const previousTodos = queryClient.getQueryData(["todos"])

      queryClient.setQueryData(["todos"], (old) =>
        old?.map(t => t.id === id ? { ...t, completed } : t)
      )

      return { previousTodos }
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos)
      toast.error("Toggle failed — reverted")
    },

    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })
}

// PATTERN 2: Variables pattern — simpler, for adding new items
function TodoListWithVariables() {
  const { data: todos = [] } = useQuery({ queryKey: ["todos"], queryFn: fetchTodos })

  const { mutate, isPending, variables } = useMutation({
    mutationFn: (text) =>
      fetch("/api/todos", { method: "POST", body: JSON.stringify({ text }) }).then(r => r.json()),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["todos"] }),
  })

  return (
    <ul>
      {todos.map(t => <TodoItem key={t.id} todo={t} />)}

      {/* Render optimistic item from variables while pending ✅ */}
      {isPending && (
        <TodoItem
          key="optimistic-new"
          todo={{ id: "temp", text: variables, completed: false }}
          style={{ opacity: 0.5 }}
        />
      )}
    </ul>
  )
}
```


***

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

## I — Interview Q\&A

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

# 7 — Query Cancellation with `AbortSignal`

## T — TL;DR

TanStack Query passes an `AbortSignal` to every query function — pass it to `fetch` or `axios` and requests automatically cancel when the query becomes inactive, preventing memory leaks and stale responses.[^7][^8]

## K — Key Concepts

**How TanStack Query provides the signal:**[^8][^7]

```jsx
useQuery({
  queryKey: ["user", userId],
  queryFn: ({ signal }) => {
    //         ↑ AbortSignal provided by TanStack Query
    return fetch(`/api/users/${userId}`, { signal }).then(r => r.json())
  },
})
```

**When TanStack Query aborts the signal:**[^7]

```
1. Component unmounts while fetch is in flight
   → signal.aborted = true → fetch request cancelled → no state update
   
2. Query key changes (userId: 1 → 2) while fetch for key 1 is in flight
   → key 1's signal aborted → old request cancelled → only key 2's result used
   
3. Query is removed from cache (removeQueries)
   → signal aborted → fetch cancelled

4. cancelQueries() called manually (e.g., before optimistic update)
   → signal aborted → in-flight request cancelled
```

**Full implementation with error handling:**

```jsx
useQuery({
  queryKey: ["search", query],
  queryFn: async ({ signal }) => {
    const response = await fetch(`/api/search?q=${query}`, { signal })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
  // AbortError is NOT a query failure — TanStack Query handles it internally
  // You don't need to catch AbortError — it's swallowed automatically
})
```

**With Axios:**

```jsx
import axios from "axios"

useQuery({
  queryKey: ["products"],
  queryFn: ({ signal }) =>
    axios.get("/api/products", { signal })  // ✅ Axios supports AbortSignal natively
      .then(res => res.data),
})
```

**Manual cancellation:**

```jsx
// Cancel queries before optimistic updates (Day 10 — Optimistic Updates)
await queryClient.cancelQueries({ queryKey: ["todos"] })
// → signals all in-flight requests for ["todos"] to abort
// → prevents stale server response from overwriting optimistic update
```


## W — Why It Matters

Without cancellation, a user typing in a search box fires a request per keystroke — old requests resolve after new ones, showing incorrect stale results. On route changes, unmounted components receive data and try to update state, causing React's "can't update unmounted component" errors. Passing the `signal` costs one word of code and eliminates this entire class of bugs.[^8][^7]

## I — Interview Q\&A

**Q: How does TanStack Query handle request cancellation?**
**A:** TanStack Query creates an `AbortController` per query and passes its `signal` to the `queryFn` via the context argument. When the query becomes inactive (unmount, key change, `cancelQueries`), the controller aborts the signal. If you pass `signal` to `fetch`, the browser automatically cancels the in-flight HTTP request.[^7][^8]

**Q: Do you need to catch `AbortError` in your query function?**
**A:** No — TanStack Query swallows `AbortError` internally. If the fetch is aborted, TanStack Query knows it was intentional and doesn't set `isError` or trigger retries. You only see errors from actual failed requests, not from intentional cancellations.[^8]

**Q: What happens if you don't pass `signal` to `fetch`?**
**A:** The HTTP request continues even after the component unmounts or the key changes — using network bandwidth and potentially causing state updates on unmounted components. The response is received but TanStack Query ignores it (the query is already inactive). Always pass `signal` to prevent wasted requests.[^7]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not passing `signal` to `fetch` — requests never cancelled | Destructure `{ signal }` from queryFn context and pass to `fetch` |
| Catching `AbortError` manually and marking as error | Don't — TanStack Query handles AbortError internally. Re-throw everything else |
| Not using `signal` with Axios — adding `CancelToken` instead | Pass `signal` directly to Axios's config — it supports AbortSignal natively since Axios 0.22 |
| Forgetting `signal` in paginated/infinite queries | Infinite queries also provide `signal` — always pass it through |

## K — Coding Challenge

**Challenge:** Build a search-as-you-type component — each keystroke updates the query key. Implement proper signal passing to ensure no stale responses arrive after a newer query key:

**Solution:**

```jsx
function SearchAsYouType() {
  const [query, setQuery] = useState("")
  const [debouncedQuery] = useDebounce(query, 300)

  const { data, isPending, isFetching, fetchStatus } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async ({ signal, queryKey }) => {
      const [, searchQuery] = queryKey

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
        { signal }  // ✅ key change → old signal aborted → old request cancelled
      )

      if (!response.ok) throw new Error(`Search failed: HTTP ${response.status}`)
      return response.json()
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 30,
    // When query key changes (new search term):
    // → old fetch signal is aborted → no stale result arrives
    // → new fetch fires with new key
    placeholderData: keepPreviousData,  // keep last results while typing
  })

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {/* Show which query is being fetched */}
      {isFetching && fetchStatus === "fetching" && (
        <span style={{ opacity: 0.5 }}>Searching for "{debouncedQuery}"...</span>
      )}

      {isPending && fetchStatus === "idle" && (
        <p>Type to search</p>
      )}

      {data?.results && (
        <ul>
          {data.results.map(r => <ResultItem key={r.id} result={r} />)}
        </ul>
      )}
    </div>
  )
}
```


***

# 8 — Paginated Queries \& `keepPreviousData`

## T — TL;DR

Paginated queries store each page as a separate cache entry by key — use `placeholderData: keepPreviousData` to keep the current page visible while the next one loads, eliminating pagination loading flicker.[^9][^10]

## K — Key Concepts

**Basic pagination pattern — separate cache entry per page:**

```jsx
function usePaginatedProducts({ page, filters = {} }) {
  return useQuery({
    queryKey: ["products", { ...filters, page }],   // page in key = unique entry per page
    queryFn: ({ signal }) =>
      fetch(`/api/products?page=${page}&limit=20`, { signal }).then(r => r.json()),
    placeholderData: keepPreviousData,   // ✅ show page N while page N+1 loads
    staleTime: 1000 * 60,
  })
}
```

**`keepPreviousData` — what it does:**

```
User is on page 1. Clicks "Next → Page 2"
Without keepPreviousData:
  → data = undefined, isPending = true → BLANK SCREEN / full skeleton

With keepPreviousData:
  → data = page 1 data (previous), isPlaceholderData = true
  → isFetching = true (new page loading in background)
  → Page 2 data arrives → data = page 2, isPlaceholderData = false ✅
  → User sees: page 1 content → (dim transition) → page 2 content
  → No blank screen, no spinner ✅
```

**Full pagination component:**

```jsx
import { useQuery, keepPreviousData } from "@tanstack/react-query"

function ProductList() {
  const [page, setPage] = useState(1)

  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["products", page],
    queryFn: ({ signal }) =>
      fetch(`/api/products?page=${page}`, { signal }).then(r => r.json()),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  })

  // Prefetch next page proactively
  const queryClient = useQueryClient()
  useEffect(() => {
    if (data?.hasNextPage) {
      queryClient.prefetchQuery({
        queryKey: ["products", page + 1],
        queryFn: () => fetch(`/api/products?page=${page + 1}`).then(r => r.json()),
      })
    }
  }, [data, page, queryClient])

  return (
    <div>
      {/* Dim content during transition */}
      <div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: "opacity 0.15s" }}>
        {isPending ? (
          <ProductSkeleton />
        ) : (
          <ProductGrid items={data?.items} />
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          ← Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isPlaceholderData || !data?.hasNextPage}
        >
          Next →
          {isFetching && !isPending && " (loading...)"}
        </button>
      </div>
    </div>
  )
}
```


## W — Why It Matters

Pagination without `keepPreviousData` causes a blank screen between every page navigation — every page change throws away visible content and replaces it with a skeleton. `keepPreviousData` is the single-option fix that makes pagination feel instant and polished. Combined with prefetching the next page, navigation feels as fast as a client-side navigation.[^10][^9]

## I — Interview Q\&A

**Q: Why does pagination need `keepPreviousData`?**
**A:** Without it, every page change clears `data` (cache miss for the new page) and sets `isPending: true`, causing a full loading state. `keepPreviousData` returns the previous page's data while the new page loads, setting `isPlaceholderData: true` so you can dim the UI without clearing it.[^10]

**Q: How do you disable the "Next" button correctly during a page transition?**
**A:** Disable when `isPlaceholderData` is true (still showing previous page's data, new page loading) OR when `!data?.hasNextPage`. This prevents double navigation and makes it obvious a load is in progress.[^9]

**Q: How do you prefetch the next page before the user clicks "Next"?**
**A:** In a `useEffect` watching `data`, call `queryClient.prefetchQuery` for `page + 1` when `data?.hasNextPage` is true. By the time the user clicks, the next page is already in cache — navigation feels instant.[^11]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not importing `keepPreviousData` from TanStack Query v5 | v5 changed from `keepPreviousData: true` (option) to `placeholderData: keepPreviousData` (import) |
| "Next" button always enabled — user navigates past the last page | Check `data?.hasNextPage` or `data?.length < pageSize` to disable at the end |
| Page number not in query key — all pages share one cache entry | Always include `page` in `queryKey: ["items", page]` |
| No prefetch — next page always shows a spinner | `prefetchQuery` for `page + 1` in `useEffect` after data loads |

## K — Coding Challenge

**Challenge:** Build a paginated user list with: `keepPreviousData`, opacity transition between pages, prefetch of next page, disabled "Prev/Next" at boundaries, and a page indicator:

**Solution:**

```jsx
function PaginatedUsers() {
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const queryClient = useQueryClient()

  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["users", page],
    queryFn: ({ signal }) =>
      fetch(`/api/users?page=${page}&limit=${PAGE_SIZE}`, { signal })
        .then(r => r.json()),
    placeholderData: keepPreviousData,   // ✅ no blank screens between pages
    staleTime: 1000 * 60,
  })

  // Prefetch next page immediately after current page loads
  useEffect(() => {
    if (!isPlaceholderData && data?.hasNextPage) {
      queryClient.prefetchQuery({
        queryKey: ["users", page + 1],
        queryFn: () =>
          fetch(`/api/users?page=${page + 1}&limit=${PAGE_SIZE}`).then(r => r.json()),
      })
    }
  }, [data, page, isPlaceholderData, queryClient])

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : null

  return (
    <div>
      {/* List — dim during page transition */}
      <div style={{ opacity: isPlaceholderData ? 0.5 : 1, transition: "opacity 0.2s" }}>
        {isPending ? (
          <UserListSkeleton count={PAGE_SIZE} />
        ) : (
          <UserTable users={data?.users} />
        )}
      </div>

      {/* Pagination controls */}
      <nav style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isFetching}
        >
          ← Previous
        </button>

        <span>
          Page {page}{totalPages ? ` of ${totalPages}` : ""}
          {isFetching && !isPending && " ↻"}
        </span>

        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isPlaceholderData || !data?.hasNextPage || isFetching}
        >
          Next →
        </button>
      </nav>
    </div>
  )
}
```


***

# 9 — `useInfiniteQuery`

## T — TL;DR

`useInfiniteQuery` manages "load more" and infinite scroll patterns — it fetches pages sequentially, accumulates them in a `pages` array, and tracks the next page cursor automatically via `getNextPageParam`.[^3]

## K — Key Concepts

**Full anatomy of `useInfiniteQuery` (v5):**[^12][^3]

```jsx
import { useInfiniteQuery } from "@tanstack/react-query"

const {
  data,                   // { pages: [], pageParams: [] }
  fetchNextPage,          // function: load the next page
  fetchPreviousPage,      // function: load the previous page
  hasNextPage,            // boolean: is there a next page?
  hasPreviousPage,
  isFetchingNextPage,     // boolean: next page is loading
  isFetchingPreviousPage,
  isPending,              // boolean: first page hasn't loaded yet
  isFetching,
  isError,
  error,
} = useInfiniteQuery({
  queryKey: ["posts"],
  queryFn: ({ pageParam, signal }) =>          // pageParam = cursor/page number
    fetch(`/api/posts?cursor=${pageParam}`, { signal }).then(r => r.json()),

  initialPageParam: 0,                          // ← REQUIRED in v5 (was implicit before)

  getNextPageParam: (lastPage, allPages, lastPageParam) => {
    // Return the next cursor/page number, or undefined/null to stop
    return lastPage.nextCursor ?? undefined
  },

  getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
    return firstPage.prevCursor ?? undefined
  },
})
```

**Accessing accumulated pages:**

```jsx
// data.pages = array of page responses
// data.pageParams = array of page params used for each page

// Flatten all pages into one array for rendering
const allPosts = data?.pages.flatMap(page => page.posts) ?? []

// Or render pages separately (useful for "load more" with visual page breaks)
data?.pages.map((page, i) => (
  <section key={i}>
    {page.posts.map(post => <PostCard key={post.id} post={post} />)}
  </section>
))
```

**`getNextPageParam` patterns:**

```jsx
// Cursor-based pagination (most common for infinite scroll)
getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
// lastPage.nextCursor = null → undefined → hasNextPage = false ✅

// Offset-based pagination
getNextPageParam: (lastPage, allPages) => {
  const totalFetched = allPages.flatMap(p => p.items).length
  return totalFetched < lastPage.total ? totalFetched : undefined
}

// Page number-based
getNextPageParam: (lastPage, allPages) => {
  return lastPage.page < lastPage.totalPages
    ? lastPage.page + 1
    : undefined
}
```


## W — Why It Matters

`useInfiniteQuery` handles all the complexity of cursor tracking, page accumulation, and "load more" state that would otherwise require a `useState` cursor, a `useEffect` to append results, and manual deduplication logic. Every social feed, product listing, or activity timeline in a modern app benefits from this hook.[^3]

## I — Interview Q\&A

**Q: What is the difference between `isPending` and `isFetchingNextPage` in `useInfiniteQuery`?**
**A:** `isPending` is `true` only during the very first page load — no data exists yet. `isFetchingNextPage` is `true` when additional pages are being fetched via `fetchNextPage()`. Use `isPending` for the full-page skeleton and `isFetchingNextPage` for the "loading more..." indicator at the bottom.[^3]

**Q: What does `getNextPageParam` return to signal there are no more pages?**
**A:** Return `undefined` or `null` — this sets `hasNextPage: false`. As long as you return a non-nullish value, TanStack Query knows more pages exist.[^12][^3]

**Q: What is `initialPageParam` and why is it required in v5?**
**A:** It's the `pageParam` value used for the very first page fetch. In v5 it must be explicitly declared (previously it defaulted to `undefined`). Common values: `0` for offset, `1` for page numbers, `null` or `""` for cursor-based APIs where the first page has no cursor.[^12]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `initialPageParam` in v5 — TypeScript errors or unexpected `undefined` | Always declare `initialPageParam` explicitly |
| `getNextPageParam` returning `null` or `0` — interpreted as "no more pages" | Only `undefined` or `null` signal end — return `undefined` explicitly, not `null` or `false` |
| Rendering `data?.pages` directly without `.flatMap()` — nested arrays in UI | `data.pages.flatMap(p => p.items)` to get a flat array for rendering |
| Not using `isFetchingNextPage` — loading indicator covers whole list | Show "loading more..." only at the bottom using `isFetchingNextPage` |

## K — Coding Challenge

**Challenge:** Build an infinite scroll feed of posts using `useInfiniteQuery` with cursor-based pagination, a "Load More" button, and an `IntersectionObserver`-based auto-load trigger:

**Solution:**

```jsx
function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: ({ pageParam, signal }) =>
      fetch(
        `/api/posts?cursor=${pageParam ?? ""}&limit=10`,
        { signal }
      ).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()   // { posts: [], nextCursor: "abc123" | null }
      }),
    initialPageParam: null,                           // ← v5 required
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60,
  })
}

function PostFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useInfinitePosts()

  // IntersectionObserver for auto-load
  const loadMoreRef = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flat list of all posts
  const allPosts = data?.pages.flatMap(page => page.posts) ?? []

  if (isPending) return <FeedSkeleton />
  if (isError) return <ErrorBanner message={error.message} />

  return (
    <div>
      <ul>
        {allPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>

      {/* Auto-load trigger (invisible element at bottom) */}
      <div ref={loadMoreRef} style={{ height: 1 }} />

      {/* Manual "Load More" button */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          style={{ display: "block", margin: "16px auto" }}
        >
          {isFetchingNextPage ? "Loading more..." : "Load more posts"}
        </button>
      )}

      {!hasNextPage && allPosts.length > 0 && (
        <p style={{ textAlign: "center", color: "#888" }}>
          You've reached the end
        </p>
      )}
    </div>
  )
}
```


***

# 10 — Avoiding Loading Flicker in Large Lists

## T — TL;DR

Loading flicker — the flash of blank/skeleton content between data updates — is eliminated using a combination of `keepPreviousData`, structural sharing, `select` subscriptions, and careful `isPending` vs `isFetching` distinction.[^13]

## K — Key Concepts

**The 5 sources of flicker and their fixes:**

**1. Page transition flicker — fixed with `keepPreviousData`:**

```jsx
// ❌ Blank screen on every page change
useQuery({ queryKey: ["items", page], queryFn: fetchPage })

// ✅ Previous page stays visible during transition
useQuery({
  queryKey: ["items", page],
  queryFn: fetchPage,
  placeholderData: keepPreviousData,  // no blank screen ✅
})
```

**2. Component remount flicker — fixed with `staleTime`:**

```jsx
// ❌ staleTime: 0 (default) — skeleton shows on every remount (background refetch)
useQuery({ queryKey: ["users"], queryFn: fetchUsers })

// ✅ staleTime keeps data fresh — no refetch within the window → no flicker
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 5,  // data stays fresh 5 min — remount shows data instantly
})
```

**3. Infinite list flicker — use `isFetchingNextPage` not `isFetching`:**

```jsx
// ❌ isFetching covers the whole list during "load more"
{isFetching && <LoadingOverlay />}

// ✅ isPending for first load, isFetchingNextPage for pagination
{isPending && <ListSkeleton />}
{isFetchingNextPage && <LoadingMoreIndicator />}  // bottom of list only ✅
```

**4. Select-caused flicker — return stable references:**

```jsx
// ❌ select returns a new array on every run — component always re-renders
select: (posts) => posts.filter(p => p.published)

// ✅ structural sharing handles this automatically — unchanged items keep references
// But if you're doing complex transforms, stabilize with useMemo:
const selectPublished = useCallback(
  (posts) => posts.filter(p => p.published),
  []  // stable function reference = stable memoization key
)
useQuery({ queryKey: ["posts"], queryFn: fetchPosts, select: selectPublished })
```

**5. Stale data flash — fixed with `initialData` from list cache:**

```jsx
// Navigating from list → detail: avoid skeleton by using list cache
useQuery({
  queryKey: ["product", productId],
  queryFn: () => fetchProduct(productId),
  initialData: () =>
    queryClient.getQueryData(["products"])?.find(p => p.id === productId),
  initialDataUpdatedAt: () =>
    queryClient.getQueryState(["products"])?.dataUpdatedAt,
})
// User sees list data instantly — detail fetch runs in background ✅
```

**Comprehensive anti-flicker strategy:**

```jsx
function SmoothList({ filters }) {
  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["items", filters],
    queryFn: ({ signal }) => fetchItems(filters, signal),
    placeholderData: keepPreviousData,         // 1. no blank between filter changes
    staleTime: 1000 * 60,                      // 2. no refetch flicker within 1 min
  })

  return (
    <div>
      {/* Subtle transition indicator — not a full overlay */}
      {isFetching && !isPending && (
        <LinearProgress style={{ position: "sticky", top: 0 }} />
      )}

      {/* Content — dim (not blank) during transition */}
      <div
        style={{
          opacity: isPlaceholderData ? 0.7 : 1,
          transition: "opacity 0.15s ease",
          pointerEvents: isPlaceholderData ? "none" : "auto",  // prevent interaction during load
        }}
      >
        {isPending
          ? <ItemSkeleton count={10} />
          : data?.items.map(item => <ItemRow key={item.id} item={item} />)
        }
      </div>
    </div>
  )
}
```


## W — Why It Matters

Flicker is the most user-visible performance symptom in data-heavy apps. Every blank flash, sudden skeleton, or content jump erodes trust in the UI. The techniques above aren't hacks — they're the intended usage patterns of TanStack Query, combined to create the perception of instant, always-available data. Mastering them is what separates a polished production app from an obviously-loading-everywhere prototype.[^13]

## I — Interview Q\&A

**Q: What causes "loading flicker" in React Query apps and how do you prevent it?**
**A:** Flicker happens when `data` briefly becomes `undefined` (new key, component remount with `staleTime: 0`, filter change). Prevent it by: `keepPreviousData` for pagination/filters, `staleTime` to keep data fresh on remounts, `initialData` to pre-populate from other caches, and using `isPlaceholderData` to dim (not hide) content during transitions.[^10][^13]

**Q: How do you differentiate a "first load" skeleton from a "loading more" indicator in infinite scroll?**
**A:** Use `isPending` for the initial full-page skeleton (no data exists yet) and `isFetchingNextPage` for the bottom-of-list "loading more" indicator. Never use `isFetching` alone — it triggers on background refreshes too and would cover an already-loaded list with an overlay.[^3]

**Q: Should you use opacity transitions or full unmounts when showing loading states?**

```
**A:** Prefer opacity transitions — they keep the DOM structure stable, preventing layout shifts and giving users visual continuity. Full unmount/remount (`{isLoading ? <Skeleton /> : <Content />}`) causes jarring jumps. With `keepPreviousData` and `isPlaceholderData`, you can dim existing content rather than replacing it.[^10]
```


## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `isFetching` as the main loading gate — shows skeleton on background refetch | Use `isPending` for skeletons, `isFetching && !isPending` for subtle indicators |
| Hiding content completely during filter/page change | Use `opacity` + `isPlaceholderData` to dim, not unmount |
| `staleTime: 0` on a list that remounts frequently | Set staleTime to match data freshness needs — prevents remount refetch cascade |
| No `pointerEvents: none` during placeholder — user can interact with stale data | Disable interactions with `pointerEvents: none` while `isPlaceholderData` is true |

## K — Coding Challenge

**Challenge:** Build a filterable product catalog with zero flicker — filters change the query key, results transition smoothly, a progress bar shows background updates, and the first load shows a skeleton:

**Solution:**

```jsx
function ProductCatalog() {
  const [filters, setFilters] = useState({ category: "all", sort: "name" })

  const { data, isPending, isFetching, isPlaceholderData, isError, error } = useQuery({
    queryKey: ["products", filters],
    queryFn: ({ signal }) =>
      fetch(
        `/api/products?category=${filters.category}&sort=${filters.sort}`,
        { signal }
      ).then(r => r.json()),
    placeholderData: keepPreviousData,   // ✅ no blank on filter change
    staleTime: 1000 * 60,               // ✅ no remount flicker within 1 min
  })

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (isError) return <ErrorPage message={error.message} />

  return (
    <div>
      {/* Progress bar — subtle, doesn't disrupt layout */}
      <div style={{ height: 3, background: "#eee", position: "sticky", top: 0 }}>
        {isFetching && (
          <div
            style={{
              height: "100%",
              background: "#4a90e2",
              width: "100%",
              animation: "pulse 1s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Filters — always interactive */}
      <FilterBar filters={filters} onChange={updateFilter} />

      {/* Content — skeleton on first load, dim on filter transitions */}
      {isPending ? (
        <ProductGridSkeleton count={12} />
      ) : (
        <div
          style={{
            opacity: isPlaceholderData ? 0.6 : 1,
            transition: "opacity 0.2s ease",
            pointerEvents: isPlaceholderData ? "none" : "auto",  // ✅ no stale clicks
          }}
        >
          {data?.products.length === 0 ? (
            <EmptyState />
          ) : (
            <ProductGrid products={data.products} />
          )}
        </div>
      )}

      {/* Footer status */}
      {!isPending && (
        <p style={{ color: "#888", fontSize: 12 }}>
          {data?.total} products
          {isPlaceholderData && " — loading filtered results..."}
        </p>
      )}
    </div>
  )
}
```


***

> **Your tiny action right now:** Pick subtopic 5 (optimistic updates) or 9 (useInfiniteQuery). Read the TL;DR and trace the 4-step pattern mentally. Try writing the core pattern from memory. You're done for this session.
<span style="display:none">[^14][^15][^16][^17][^18][^19]</span>

<div align="center">⁂</div>

[^1]: https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates

[^2]: https://tanstack.com/query/v5/docs/framework/react/guides/mutations

[^3]: https://tanstack.com/query/v5/docs/framework/react/guides/infinite-queries

[^4]: https://github.com/TanStack/query/discussions/6333

[^5]: https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query

[^6]: https://github.com/TanStack/query/discussions/2734

[^7]: https://staging-wms-erp.tvc.mx/blog/optimize-tanstack-query-correcting-abortcontroller

[^8]: https://tanstack.com/query/v3/docs/framework/react/guides/query-cancellation

[^9]: https://github.com/TanStack/query/discussions/4426

[^10]: https://velog.io/@holim0/tanstack-query-keepPreviousData에-대해

[^11]: https://tanstack.com/query/v5/docs/framework/react/guides/prefetching

[^12]: https://tanstack.com/query/v5/docs/framework/solid/reference/useInfiniteQuery

[^13]: https://github.com/TanStack/query/discussions/2018

[^14]: https://lobehub.com/skills/agusmdev-fullstack-ai-template-tanstack-react-query-mutations

[^15]: https://github.com/TanStack/query/discussions/6202

[^16]: https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates

[^17]: https://stackoverflow.com/questions/77274965/tanstack-useinfinitequery-caching-fetchnextpage-to-fetch-the-first-page

[^18]: https://abundance.prose.sh/query-cancellation

[^19]: https://github.com/TanStack/query/discussions/5320

