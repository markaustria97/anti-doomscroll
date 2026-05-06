# 4 — Direct Cache Updates with `setQueryData`

## T — TL;DR

`setQueryData` writes directly into the cache without a network request — use it when the server's mutation response already contains the updated data, eliminating a redundant refetch.

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

`setQueryData` eliminates the "update → invalidate → refetch" round trip for resources where the mutation response is the complete updated entity. This is common in REST APIs that return the full resource on PATCH/PUT. Knowing when to use direct cache writes vs. invalidation is the difference between snappy instant updates and a loading flash after every save.

## I — Interview Q&A

**Q: What is the difference between `setQueryData` and `invalidateQueries`?**
**A:** `setQueryData` writes data directly into the cache from a local value (like the mutation response) — no network request. `invalidateQueries` marks the cache as stale and triggers a server refetch. Use `setQueryData` when the mutation response contains the full updated entity; use `invalidateQueries` when it doesn't.

**Q: How do you update a specific item inside a cached list with `setQueryData`?**
**A:** Use the updater function form: `queryClient.setQueryData(["items"], (prev) => prev?.map(item => item.id === updatedItem.id ? updatedItem : item))`. Always use optional chaining on `prev` — the list may not be in the cache yet.

**Q: Does `setQueryData` reset the `staleTime` timer?**
**A:** Yes — `setQueryData` counts as a successful data update. The `dataUpdatedAt` timestamp is set to `Date.now()`, and the freshness window restarts from that point. Use `queryClient.setQueryData` with `updatedAt` option to control the exact freshness timestamp if needed.

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
