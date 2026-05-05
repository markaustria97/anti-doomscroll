# 1 — Query Keys as Unique Serializable Arrays

## T — TL;DR

Query keys are serializable arrays that act as the unique identity for every cached entry — every distinct key gets its own cache slot, fetch lifecycle, and invalidation target.[^3]

## K — Key Concepts

**Query keys must be arrays (v5 rule):**[^3]

```jsx
// ✅ Valid — arrays of any serializable value
useQuery({ queryKey: ["users"] })
useQuery({ queryKey: ["user", 42] })
useQuery({ queryKey: ["user", 42, "posts"] })
useQuery({ queryKey: ["products", { category: "shoes", sort: "price" }] })

// ❌ Invalid — strings alone are not arrays (v4 allowed this, v5 does not)
useQuery({ queryKey: "users" })

// ❌ Invalid — functions are not serializable
useQuery({ queryKey: ["data", () => getFilter()] })
```

**Serializable types that work in keys:**

```jsx
// Strings
queryKey: ["todos"]

// Numbers
queryKey: ["user", userId]           // userId = 42

// Booleans
queryKey: ["posts", isPublished]     // isPublished = true

// Objects (deep serialized)
queryKey: ["products", { category: "books", page: 1, sort: "asc" }]

// Nested arrays
queryKey: ["data", [1, 2, 3]]

// null / undefined — valid but use carefully
queryKey: ["user", null]             // valid cache key (e.g. unauthenticated state)
```

**Each unique key = its own independent cache entry:**

```jsx
// These are THREE separate cache entries — each fetches independently
useQuery({ queryKey: ["user", 1], queryFn: () => fetchUser(1) })
useQuery({ queryKey: ["user", 2], queryFn: () => fetchUser(2) })
useQuery({ queryKey: ["user", 3], queryFn: () => fetchUser(3) })

// This is ONE cache entry — shared across ALL components using this key
// Component A:
useQuery({ queryKey: ["users"], queryFn: fetchUsers })
// Component B (same page):
useQuery({ queryKey: ["users"], queryFn: fetchUsers })
// → Only 1 network request fires. Both components share the same cached data.
```

**Key naming conventions by scope:**

```jsx
// Convention: [entity] → [entity, id] → [entity, id, relation]
["users"]                            // all users
["user", userId]                     // specific user
["user", userId, "posts"]            // user's posts
["user", userId, "posts", postId]    // specific post of user

// Convention: include all variables that affect the result
["products", { category, sort, page }]   // filter/sort/page all affect output
["search", query, { filters }]           // query + filters = unique result
```


## W — Why It Matters

Every caching decision in TanStack Query traces back to the query key. A key that's too broad means different data shares one cache entry. A key that's missing a variable means the cache never updates when that variable changes. Understanding keys deeply is the prerequisite to understanding all cache behavior.[^4][^3]

## I — Interview Q&A

**Q: What makes two query keys "the same" in TanStack Query?**
**A:** Deep equality after deterministic hashing — `["user", 1]` is the same key every render, even as a new array literal. Object property order doesn't matter: `["data", { a: 1, b: 2 }]` equals `["data", { b: 2, a: 1 }]`. Only the serialized values must match.[^4][^3]

**Q: Why must query keys include all variables that affect the query result?**
**A:** Because the key is the cache identity. If `userId` affects what data is fetched but isn't in the key, then fetching for user 1 and user 2 writes to the same cache slot — user 2's data overwrites user 1's. Every variable that changes the output must be in the key.[^3]

**Q: What types of values are valid in a query key?**
**A:** Any JSON-serializable value: strings, numbers, booleans, `null`, plain objects, and arrays. Functions, class instances, Symbols, and `undefined`-valued object keys are not reliably serializable and should not be used in query keys.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Omitting a variable from the key that affects the fetch | Include ALL variables the `queryFn` uses — `enabled: !!id, queryKey: ["item", id]` |
| Putting entire objects as keys when only one field matters | Extract the primitive: `["user", user.id]` not `["user", user]` |
| Using the same key for different data shapes | Each unique resource needs a unique key — `["users"]` vs `["user", id]` |
| Generating keys inside the render cycle with complex logic | Use a Key Factory function — centralizes key generation, prevents drift |

## K — Coding Challenge

**Challenge:** Identify which query keys are wrong and explain why, then fix them:

```jsx
// A: Variable-driven but variable missing from key
function usePost(postId) {
  return useQuery({ queryKey: ["post"], queryFn: () => fetchPost(postId) })
}

// B: Using a function in the key
function useData(transform) {
  return useQuery({ queryKey: ["data", transform], queryFn: fetchData })
}

// C: Key doesn't reflect all filter params
function useProducts({ category, sort, page }) {
  return useQuery({
    queryKey: ["products", category],       // sort and page missing
    queryFn: () => fetchProducts({ category, sort, page }),
  })
}

// D: String key (v5 violation)
function useUsers() {
  return useQuery({ queryKey: "users", queryFn: fetchUsers })
}
```

**Solution:**

```jsx
// A: ❌ postId used in queryFn but missing from key → all posts share one cache slot
function usePost(postId) {
  return useQuery({
    queryKey: ["post", postId],      // ✅ postId in key → unique entry per post
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
  })
}

// B: ❌ transform is a function — not serializable → cache key is unstable
function useData(filter) {
  // ✅ Pass the filter criteria (serializable), apply transform in `select`
  return useQuery({
    queryKey: ["data", filter],
    queryFn: () => fetchData(filter),
    select: (data) => transform(data),   // transform applied outside the key
  })
}

// C: ❌ sort and page affect results but are not in the key → wrong cached data shown
function useProducts({ category, sort, page }) {
  return useQuery({
    queryKey: ["products", { category, sort, page }],   // ✅ all params in key
    queryFn: () => fetchProducts({ category, sort, page }),
  })
}

// D: ❌ String key is not valid in v5 — must be array
function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers })   // ✅
}
```


***
