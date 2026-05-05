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

## I — Interview Q&A

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
