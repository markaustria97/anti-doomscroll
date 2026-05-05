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

## I — Interview Q&A

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
