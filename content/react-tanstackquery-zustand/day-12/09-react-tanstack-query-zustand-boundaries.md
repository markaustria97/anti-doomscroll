# 9 — React + TanStack Query + Zustand Boundaries

## T — TL;DR

React owns local UI, TanStack Query owns server data, and Zustand owns client state — respecting these three boundaries eliminates redundant state, prevents sync bugs, and gives each concern the right tooling.[^12][^13]

## K — Key Concepts

**The complete state ownership map:**

```
┌──────────────────────────────────────────────────────────────────┐
│  REACT (useState / useReducer / Context)                         │
│  • Form input values (controlled inputs)                         │
│  • Accordion open/close (single component)                       │
│  • Tooltip visibility                                            │
│  • Step in a wizard (within one component)                       │
│  → Scope: ONE component or a small local tree                    │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│  ZUSTAND                                                         │
│  • Auth state (user, token, isAuthenticated)                     │
│  • Theme (light/dark)                                            │
│  • Sidebar open/closed                                           │
│  • Shopping cart                                                 │
│  • Multi-step filters / pagination state                         │
│  • Active modal (which modal is showing)                         │
│  • Selected items (multi-select Set)                             │
│  → Scope: MANY components across the app                         │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│  TANSTACK QUERY                                                  │
│  • Products list from /api/products                             │
│  • Current user profile from /api/users/me                      │
│  • Orders, inventory, notifications from server                  │
│  • Search results                                                │
│  • Any data that lives on a server and needs caching             │
│  → Scope: SERVER data with caching + background refresh          │
└──────────────────────────────────────────────────────────────────┘
```

**The "Zustand drives Query" pattern — clean integration:**[^13][^12]

```jsx
// Zustand: owns what to query
const useFilterStore = create((set) => ({
  category: "all",
  sort: "newest",
  page: 1,
  setCategory: (category) => set({ category, page: 1 }),
  setSort: (sort) => set({ sort }),
  setPage: (page) => set({ page }),
}))

// TanStack Query: fetches based on Zustand's state
function useProducts() {
  const { category, sort, page } = useFilterStore(
    useShallow((s) => ({ category: s.category, sort: s.sort, page: s.page }))
  )

  return useQuery({
    queryKey: ["products", { category, sort, page }],
    queryFn: ({ signal }) =>
      fetchProducts({ category, sort, page }, signal),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  })
}

// Component: reads from both tools cleanly
function ProductPage() {
  const setCategory = useFilterStore((s) => s.setCategory)
  const { data, isPending } = useProducts()
  return (
    <div>
      <CategoryFilter onChange={setCategory} />
      {isPending ? <Skeleton /> : <ProductGrid products={data?.items} />}
    </div>
  )
}
```

**Logout — clearing both stores correctly:**

```jsx
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  logout: async () => {
    await authAPI.logout()
    set({ user: null, token: null }, true)
    queryClient.clear()   // ← clears ALL TanStack Query cache for old user ✅
    // Alternatively: only clear user-specific queries
    // queryClient.removeQueries({ queryKey: ["user"] })
    // queryClient.removeQueries({ queryKey: ["orders"] })
  },
}))
```


## W — Why It Matters

The most common architecture mistake in React apps is using one tool for everything — Redux/Zustand for server data, or TanStack Query for client state. The result is manually reimplementing caching in Zustand, or storing modal state in a query cache. Each boundary violation adds complexity. The clean three-boundary model scales to any app size and makes state predictably debuggable.[^12][^13]

## I — Interview Q&A

**Q: How do you decide whether state belongs in Zustand or TanStack Query?**
**A:** Ask: "Does this data live on a server and need to be cached/refreshed?" → TanStack Query. "Is this client-owned state shared across many components?" → Zustand. "Is this local to one component?" → `useState`. The question of where data originates is the primary deciding factor.[^13][^12]

**Q: How do Zustand and TanStack Query interact in a filter + results pattern?**
**A:** Zustand holds the filter state (category, sort, page). Components read filters from Zustand and pass them into `useQuery`'s `queryKey` and `queryFn`. When filters change in Zustand, the query key changes, triggering a new fetch. The two tools cooperate — Zustand as the source of "what to fetch," Query as the mechanism of fetching and caching.[^13]

**Q: What should you do on logout regarding TanStack Query's cache?**
**A:** Call `queryClient.clear()` — this removes all cached data for the previous user. Without it, the next user (or a re-login) might see stale data from the previous session. If you only want to remove user-specific queries, use `removeQueries` with targeted keys.[^12]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing API response data in Zustand with a manual `isLoading` flag | Move to TanStack Query — you get caching, retry, DevTools, deduplication for free |
| Duplicating server state in Zustand for "easier access" | Use `queryClient.getQueryData()` for out-of-component access — no duplication |
| Not clearing Query cache on logout — next user sees old data | `queryClient.clear()` in the logout action |
| Putting complex filter UI state in query params / React state instead of Zustand | Filters change many components — Zustand is the right scope |

## K — Coding Challenge

**Challenge:** Build the complete integration for a job listings app: filters in Zustand, results in TanStack Query, saved jobs as a Zustand Set, logout clearing both — all in clean, separated code:

**Solution:**

```jsx
// stores/jobFilterStore.ts — Zustand: UI/filter state
export const useJobFilterStore = create((set) => ({
  keyword: "",
  location: "",
  jobType: "all",   // "full-time" | "part-time" | "contract" | "all"
  page: 1,
  savedJobIds: new Set(),

  setKeyword:   (keyword) => set({ keyword, page: 1 }),
  setLocation:  (location) => set({ location, page: 1 }),
  setJobType:   (jobType) => set({ jobType, page: 1 }),
  setPage:      (page) => set({ page }),

  toggleSaveJob: (id) =>
    set((s) => {
      const next = new Set(s.savedJobIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { savedJobIds: next }
    }),
  clearSavedJobs: () => set({ savedJobIds: new Set() }),

  resetFilters: () => set({ keyword: "", location: "", jobType: "all", page: 1 }),
}))

// stores/authStore.ts — Zustand: auth state
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ user: null, token: null, isAuthenticated: false }, true)
    queryClient.clear()                              // ← clear all server data cache ✅
    useJobFilterStore.getState().clearSavedJobs()    // ← clear saved jobs for old user ✅
    useJobFilterStore.getState().resetFilters()      // ← reset filters ✅
  },
}))

// queries/useJobListings.ts — TanStack Query: server data
export function useJobListings() {
  const { keyword, location, jobType, page } = useJobFilterStore(
    useShallow((s) => ({
      keyword: s.keyword, location: s.location, jobType: s.jobType, page: s.page,
    }))
  )
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: ["jobs", { keyword, location, jobType, page }],
    queryFn: ({ signal }) =>
      fetch(
        `/api/jobs?keyword=${keyword}&location=${location}&type=${jobType}&page=${page}`,
        { signal, headers: { Authorization: `Bearer ${token}` } }
      ).then((r) => r.json()),
    enabled: !!token,                     // ← only fetch when authenticated
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  })
}

// components/JobBoard.tsx — thin component reading from both
function JobBoard() {
  const savedJobIds = useJobFilterStore((s) => s.savedJobIds)
  const toggleSave  = useJobFilterStore((s) => s.toggleSaveJob)
  const { data, isPending, isPlaceholderData } = useJobListings()

  return (
    <div style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
      {isPending ? (
        <JobSkeleton count={10} />
      ) : (
        data?.jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobIds.has(job.id)}
            onToggleSave={() => toggleSave(job.id)}
          />
        ))
      )}
    </div>
  )
}
```


***
