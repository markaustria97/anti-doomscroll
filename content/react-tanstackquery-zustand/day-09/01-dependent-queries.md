# 1 — Dependent Queries

## T — TL;DR

Dependent queries run in serial — the second query waits for the first to finish before firing, achieved by setting `enabled` to a condition derived from the first query's data.[^1]

## K — Key Concepts

**The pattern — `enabled` as the bridge:**[^1]

```jsx
function UserDashboard({ userId }) {
  // Query 1: fetch the user
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  })

  // Query 2: depends on user.projectId from Query 1
  const { data: project } = useQuery({
    queryKey: ["project", user?.projectId],
    queryFn: () => fetchProject(user.projectId),
    enabled: !!user?.projectId,     // ← paused until user.projectId exists
  })

  // Query 3: depends on project from Query 2
  const { data: tasks } = useQuery({
    queryKey: ["tasks", project?.id],
    queryFn: () => fetchTasks(project.id),
    enabled: !!project?.id,          // ← paused until project.id exists
  })
}
```

**Loading state management for a chain:**

```jsx
function UserDashboard({ userId }) {
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  })

  const projectQuery = useQuery({
    queryKey: ["project", userQuery.data?.projectId],
    queryFn: () => fetchProject(userQuery.data.projectId),
    enabled: !!userQuery.data?.projectId,
  })

  // Combined loading state — true until both are done
  const isLoading = userQuery.isPending || projectQuery.isPending
  const isError = userQuery.isError || projectQuery.isError
  const error = userQuery.error ?? projectQuery.error

  if (isLoading) return <Skeleton />
  if (isError) return <ErrorMessage error={error} />

  return <Dashboard user={userQuery.data} project={projectQuery.data} />
}
```

**Timeline visualization:**

```
t=0    useQuery #1 fires (userId available)
t=200  Query #1 resolves → user.projectId = 42
       enabled on Query #2 becomes true
t=200  useQuery #2 fires (projectId now available)
t=400  Query #2 resolves → project.id = 99
       enabled on Query #3 becomes true
t=400  useQuery #3 fires
t=500  Query #3 resolves → all data available
```


## W — Why It Matters

Dependent queries replace the anti-pattern of nesting `useEffect` calls or awaiting fetches sequentially inside a single effect. The `enabled` API makes the dependency explicit, declarative, and debuggable — and each query independently benefits from caching, retries, and background refetching.[^1]

## I — Interview Q&A

**Q: How do you implement a dependent query in TanStack Query?**
**A:** Use the `enabled` option on the downstream query, setting it to a truthy check on the data returned by the upstream query. The downstream query stays paused (`isPending: true`, no network activity) until `enabled` becomes truthy.[^1]

**Q: What is `isPending` for a query with `enabled: false`?**
**A:** `isPending` is `true` — the query has no data and is not actively fetching. This correctly represents "waiting for the condition" without showing a fetch error. It's indistinguishable from a loading state to the UI, which is intentional.

**Q: Can you have more than two queries in a dependent chain?**
**A:** Yes — any length chain works. Each query's `enabled` checks the previous query's data. The tradeoff is serial latency — 3 sequential fetches take 3× the RTT. If queries can be parallelized, prefer `useQueries` instead.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not using optional chaining on upstream data in `queryFn` | `queryFn: () => fetchProject(user.projectId)` crashes if `user` is undefined — use `enabled: !!user?.projectId` |
| Chaining 4+ dependent queries when some could be parallel | Audit the chain — if query 2 and 3 both only need query 1's result, run them in parallel with `useQueries` |
| Not showing combined loading state | Merge `isPending` from all queries in the chain — one spinner covers the whole chain |
| Using `useEffect` to fire the second query after first completes | Use `enabled` — it's declarative, cacheable, and survives component remounts |

## K — Coding Challenge

**Challenge:** A blog app needs to: (1) fetch the current user, (2) fetch their preferred topics, (3) fetch recommended posts matching those topics. Build the three-query chain with proper combined loading/error states:

**Solution:**

```jsx
function PersonalizedFeed() {
  // Chain: user → topics → recommended posts

  const userQuery = useQuery({
    queryKey: ["user", "me"],
    queryFn: fetchCurrentUser,
  })

  const topicsQuery = useQuery({
    queryKey: ["topics", userQuery.data?.id],
    queryFn: () => fetchUserTopics(userQuery.data.id),
    enabled: !!userQuery.data?.id,           // waits for user
  })

  const postsQuery = useQuery({
    queryKey: ["posts", "recommended", topicsQuery.data],
    queryFn: () => fetchRecommendedPosts(topicsQuery.data),
    enabled: !!topicsQuery.data?.length,     // waits for non-empty topics
    staleTime: 1000 * 60 * 5,               // recommendations: 5 min freshness
  })

  // Combined states
  const isPending = userQuery.isPending || topicsQuery.isPending || postsQuery.isPending
  const isError = userQuery.isError || topicsQuery.isError || postsQuery.isError
  const error = userQuery.error ?? topicsQuery.error ?? postsQuery.error

  if (isPending) return <FeedSkeleton />
  if (isError) return <ErrorBanner message={error.message} />

  return (
    <div>
      <h2>Recommended for {userQuery.data.name}</h2>
      <TopicTags topics={topicsQuery.data} />
      <PostGrid posts={postsQuery.data} />
    </div>
  )
}
```


***
