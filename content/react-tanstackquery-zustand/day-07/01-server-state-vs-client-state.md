# 1 — Server State vs. Client State

## T — TL;DR

Client state is data your app owns and controls synchronously; server state is a remote snapshot your app doesn't own — async, potentially stale, and requiring its own management strategy.[^4][^5]

## K — Key Concepts

**The fundamental split:**[^5][^4]


|  | Client State | Server State |
| :-- | :-- | :-- |
| Where it lives | Browser memory | Remote database / API |
| Who owns it | Your frontend | Backend / other users |
| Always accurate? | ✅ Yes | ❌ No — it's a stale snapshot |
| Async? | ❌ Synchronous | ✅ Always async |
| Examples | Theme, modal open, form input, UI toggles | Users, products, orders, messages |
| Best tool | `useState`, `useReducer`, Zustand | TanStack Query |

**Why server state is different — the 4 unique challenges:**[^6][^7]

1. **Caching** — you fetched it, why re-fetch if it hasn't changed?
2. **Deduplication** — 5 components call the same endpoint; don't fire 5 requests
3. **Background staleness** — data may have changed since last fetch; when do you refetch?
4. **Synchronization** — mutations need to invalidate related queries so stale data is replaced
```jsx
// ❌ Putting server state in client state tools — the classic mistake
const [users, setUsers] = useState([])       // useState for server data
useEffect(() => { fetch("/api/users").then(...).then(setUsers) }, [])
// You now manually manage: caching, deduplication, loading, error, refetching...

// ✅ Let TanStack Query own server state
const { data: users } = useQuery({ queryKey: ["users"], queryFn: fetchUsers })
// Caching, deduplication, background refetch — all handled automatically
```

**The correct tool split for a real app:**

```
UI state (open/closed, theme)     → useState / useReducer
Form state                        → useState / React Hook Form
Shared app state (permissions)    → Context / Zustand
Server/async data                 → TanStack Query
```


## W — Why It Matters

Before TanStack Query, developers put server data into Redux — a client state tool — then bolted on thunks, sagas, and custom caching logic to compensate for what Redux wasn't designed to do. Understanding the server/client split is the mental unlock that makes TanStack Query obvious and essential, not just another library to learn.[^7][^5]

## I — Interview Q&A

**Q: What is the difference between server state and client state?**
**A:** Client state is owned, controlled, and synchronously accurate in the browser — theme, modals, form inputs. Server state is a remote snapshot the frontend doesn't own — it's async, potentially stale, and shared with other users or systems. They require fundamentally different management strategies.

**Q: Why is a Redux store a poor fit for server state?**
**A:** Redux is designed for synchronous, deterministic client state. Server state is async, perishable, and needs caching, deduplication, background refetching, and cache invalidation — none of which Redux provides natively. Using Redux for server data means building those systems yourself on top of it.[^5]

**Q: What makes server state "stale"?**
**A:** The moment you fetch data from a server, it's a snapshot — the server may update it a second later. Other users' actions, background jobs, or scheduled changes can make your cached copy outdated. Managing "how fresh is this data?" is the core problem TanStack Query solves.[^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing API responses in `useState` or Redux | Use TanStack Query for all async remote data |
| Treating server state as always accurate | Build refetch triggers and staleness windows into your query config |
| Mixing client and server state in the same store | Keep them separate — cleaner architecture, better tooling for each |
| Not understanding why you're using TanStack Query | Internalize the server/client split first — it makes every Query API decision obvious |

## K — Coding Challenge

**Challenge:** Classify each piece of state — is it client state or server state? Which tool should own it?

```
A: Whether the sidebar is open
B: The current logged-in user's profile (from API)
C: The user's selected theme (light/dark)
D: A list of products fetched from /api/products
E: Which tab is currently active
F: The number of unread notifications (from API)
G: Draft text in a message input
H: A paginated list of orders from the backend
```

**Solution:**

```
A: Client state → useState (local UI toggle)
B: Server state → TanStack Query (remote, can go stale)
C: Client state → useState + localStorage (user preference, no server)
D: Server state → TanStack Query (remote, needs caching + refetch)
E: Client state → useState (pure UI navigation state)
F: Server state → TanStack Query (remote, updates frequently)
G: Client state → useState (controlled input, not persisted to server yet)
H: Server state → TanStack Query with useInfiniteQuery (paginated remote data)
```


***
