# 9 — `useInfiniteQuery`

## T — TL;DR

`useInfiniteQuery` manages "load more" and infinite scroll patterns — it fetches pages sequentially, accumulates them in a `pages` array, and tracks the next page cursor automatically via `getNextPageParam`.

## K — Key Concepts

**Full anatomy of `useInfiniteQuery` (v5):**

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

`useInfiniteQuery` handles all the complexity of cursor tracking, page accumulation, and "load more" state that would otherwise require a `useState` cursor, a `useEffect` to append results, and manual deduplication logic. Every social feed, product listing, or activity timeline in a modern app benefits from this hook.

## I — Interview Q&A

**Q: What is the difference between `isPending` and `isFetchingNextPage` in `useInfiniteQuery`?**
**A:** `isPending` is `true` only during the very first page load — no data exists yet. `isFetchingNextPage` is `true` when additional pages are being fetched via `fetchNextPage()`. Use `isPending` for the full-page skeleton and `isFetchingNextPage` for the "loading more..." indicator at the bottom.

**Q: What does `getNextPageParam` return to signal there are no more pages?**
**A:** Return `undefined` or `null` — this sets `hasNextPage: false`. As long as you return a non-nullish value, TanStack Query knows more pages exist.

**Q: What is `initialPageParam` and why is it required in v5?**
**A:** It's the `pageParam` value used for the very first page fetch. In v5 it must be explicitly declared (previously it defaulted to `undefined`). Common values: `0` for offset, `1` for page numbers, `null` or `""` for cursor-based APIs where the first page has no cursor.

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
