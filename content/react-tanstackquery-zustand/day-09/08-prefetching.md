# 8 — Prefetching

## T — TL;DR

Prefetching loads data into the cache before a component needs it — on hover, on navigation, or on the server — so the component renders instantly with zero loading state.

## K — Key Concepts

**`queryClient.prefetchQuery` — the core API:**

```jsx
const queryClient = useQueryClient()

// Prefetch on hover — load data before user clicks
async function handleHover(productId) {
  await queryClient.prefetchQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    staleTime: 1000 * 60 * 5,    // don't prefetch if already fresh
  })
}

// Prefetch on route change — load next page's data early
function NavLink({ to, productId, children }) {
  const queryClient = useQueryClient()

  return (
    <Link
      to={to}
      onMouseEnter={() =>
        queryClient.prefetchQuery({
          queryKey: ["product", productId],
          queryFn: () => fetchProduct(productId),
        })
      }
    >
      {children}
    </Link>
  )
}
```

**Prefetch on navigation (React Router / TanStack Router):**

```jsx
// In a route loader — data is ready before the component mounts
// React Router v6.4+ loaders
export async function productLoader({ params }) {
  await queryClient.prefetchQuery({
    queryKey: ["product", params.id],
    queryFn: () => fetchProduct(params.id),
  })
  return null  // component uses useQuery — finds data in cache instantly
}

// Component — no spinner because prefetch already populated the cache
function ProductPage() {
  const { productId } = useParams()
  const { data } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  })
  // isPending is false — data was prefetched ✅
  return <ProductDetail product={data} />
}
```

**Server-side prefetching (Next.js App Router):**

```jsx
// app/products/[id]/page.tsx — Server Component
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"

export default async function ProductPage({ params }) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["product", params.id],
    queryFn: () => fetchProduct(params.id),   // runs on server
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetail productId={params.id} />
    </HydrationBoundary>
  )
}

// ProductDetail.tsx — Client Component
"use client"
function ProductDetail({ productId }) {
  const { data } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  })
  // Data is hydrated from server — zero loading state ✅
}
```

**`prefetchQuery` vs `useQuery` — when to use which:**


|  | `prefetchQuery` | `useQuery` |
| :-- | :-- | :-- |
| When | Before the component mounts | When the component is mounted |
| Returns | Promise (void) | Query result object |
| Use in | Loaders, hover handlers, parent components | Component body |

## W — Why It Matters

Prefetching is the difference between "instant" navigation and loading spinners. A hover-prefetch on a product card means the product page loads instantly when clicked. Server prefetching means users see content immediately with no client-side waterfall. It's one of the highest-impact performance techniques in TanStack Query — and it's only possible because queries are identified by keys and cached centrally.

## I — Interview Q&A

**Q: What is prefetching in TanStack Query and how does it work?**
**A:** Calling `queryClient.prefetchQuery` loads data into the cache before any component requests it. When a component later mounts and calls `useQuery` with the same key, it finds data in the cache and skips the loading state. The fetch happens once; the component renders immediately.

**Q: Does `prefetchQuery` re-fetch if the data is already fresh in the cache?**
**A:** No — `prefetchQuery` respects `staleTime`. If the cache entry exists and is still within its `staleTime`, the prefetch is a no-op. This makes it safe to call aggressively (e.g., on hover) without triggering unnecessary requests.

**Q: How do you prefetch data on the server in a Next.js App Router app?**
**A:** In the Server Component, create a `QueryClient`, call `prefetchQuery` with an async server-side fetch function, then serialize and pass the cache state via `dehydrate` + `HydrationBoundary`. The client `useQuery` hook finds the data already in cache — zero loading state on first render.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not matching the prefetch `queryKey` with the component's `queryKey` | Keys must be identical — a mismatch means the component doesn't find the prefetched data |
| Prefetching without `staleTime` — immediate re-fetch on component mount | Set `staleTime` to be generous enough that the component uses the prefetched data |
| Prefetching everything on app load | Only prefetch highly likely next navigations — prefetching rarely-visited data wastes bandwidth |
| Not awaiting `prefetchQuery` in loaders | Without `await`, the route renders before data is ready — defeats the purpose |

## K — Coding Challenge

**Challenge:** Build a `PostList` where hovering over a post prefetches its detail, and clicking navigates instantly with zero loading state:

**Solution:**

```jsx
const postKeys = {
  all: () => ["posts"],
  detail: (id) => ["post", id],
}

function PostList() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)

  const { data: posts = [] } = useQuery({
    queryKey: postKeys.all(),
    queryFn: fetchPosts,
  })

  function handleMouseEnter(postId) {
    // Prefetch on hover — only fires if not already cached and fresh
    queryClient.prefetchQuery({
      queryKey: postKeys.detail(postId),
      queryFn: () => fetchPost(postId),
      staleTime: 1000 * 60 * 5,
    })
  }

  return (
    <div>
      <ul>
        {posts.map(post => (
          <li
            key={post.id}
            onMouseEnter={() => handleMouseEnter(post.id)}   // ✅ prefetch on hover
            onClick={() => setSelectedId(post.id)}
            style={{ cursor: "pointer" }}
          >
            {post.title}
          </li>
        ))}
      </ul>
      {selectedId && <PostDetail postId={selectedId} />}
    </div>
  )
}

function PostDetail({ postId }) {
  const { data: post, isPending } = useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => fetchPost(postId),
    staleTime: 1000 * 60 * 5,
  })

  // If user hovered before clicking, isPending = false → instant render ✅
  // If user clicked without hovering first, isPending = true → shows spinner
  if (isPending) return <PostSkeleton />

  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </article>
  )
}
```


***
