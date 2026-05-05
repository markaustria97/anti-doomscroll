# 8 — Async Actions

## T — TL;DR

Zustand actions are plain functions — async actions are just `async` functions inside the store that call `set()` multiple times to update loading, data, and error state throughout the async lifecycle.[^12]

## K — Key Concepts

**Async actions — no middleware needed:**[^12]

```jsx
const usePostsStore = create((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null })   // 1. set loading

    try {
      const response = await fetch("/api/posts")
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()

      set({ posts: data, isLoading: false }) // 2. set data
    } catch (error) {
      set({ error: error.message, isLoading: false }) // 3. set error
    }
  },

  clearError: () => set({ error: null }),
}))
```

**Multiple `set()` calls in async actions:**

```jsx
const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadUser: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const user = await fetchUser(userId)
      set({ user, isLoading: false })
    } catch (e) {
      set({ isLoading: false, error: e.message })
    }
  },

  saveUser: async (updates) => {
    set({ isSaving: true })
    try {
      // Read current state mid-async with get()
      const currentUser = get().user
      const saved = await updateUser(currentUser.id, updates)
      set({ user: saved, isSaving: false })
    } catch (e) {
      set({ isSaving: false, error: e.message })
    }
  },
}))
```

**IMPORTANT — but better with TanStack Query:**[^3][^12]

```jsx
// ✅ Use Zustand async actions for:
// - Auth flows (login, logout, token refresh)
// - One-time app initialization
// - Client state mutations with side effects
// - File uploads with progress tracking

// ✅ Use TanStack Query for:
// - Fetching server data that needs caching
// - Background refetching
// - Server list/detail CRUD
// - Anything that benefits from staleTime, retry, deduplication

// The pattern: Zustand owns the async side effects;
// TanStack Query owns the server data caching.
```

**Async action with progress tracking:**

```jsx
const useUploadStore = create((set) => ({
  progress: 0,
  isUploading: false,
  uploadedUrl: null,
  error: null,

  uploadFile: async (file) => {
    set({ isUploading: true, progress: 0, error: null })

    try {
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        const percent = Math.round((e.loaded / e.total) * 100)
        set({ progress: percent })   // ✅ multiple set() calls = live progress
      }

      const uploadedUrl = await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(JSON.parse(xhr.responseText).url)
        xhr.onerror = () => reject(new Error("Upload failed"))
        xhr.open("POST", "/api/upload")
        xhr.send(formData)
      })

      set({ uploadedUrl, isUploading: false, progress: 100 })
    } catch (e) {
      set({ error: e.message, isUploading: false, progress: 0 })
    }
  },
}))
```


## W — Why It Matters

Zustand async actions are the cleanest pattern for client-driven async flows — auth, initialization, uploads — that don't benefit from TanStack Query's server-caching model. Multiple `set()` calls within a single async function give you granular loading state (loading, saving, uploading progress) that a `useQuery` `isPending` boolean can't express.[^12]

## I — Interview Q&A

**Q: Do Zustand async actions need special middleware like Redux thunks?**
**A:** No — Zustand actions are plain JavaScript functions. Async functions just work. Call `set()` as many times as needed throughout the async flow. No special async middleware, no action creators, no dispatch.[^12]

**Q: How do you read current state inside an async action after an `await`?**
**A:** Use `get()` — it always returns the current state, even after awaited async operations. `set()` updater functions also receive current state, but between `await` calls, `get()` is the correct way to ensure you're reading the latest value (not a stale closure).[^1]

**Q: When should you use Zustand async actions vs TanStack Query?**
**A:** Zustand for: auth flows, one-time initialization, client-only mutations (cart, UI preferences), and operations with complex loading stages. TanStack Query for: any data fetched from a server API that benefits from caching, background refetch, retry, or deduplication.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing API response data in Zustand instead of TanStack Query | Use TanStack Query for server data — Zustand for client-owned state |
| Not setting `isLoading: false` in the catch block — stuck loader | Always set loading to false in both try AND catch |
| Reading state with a stale closure after `await` | Use `get()` or the functional form `set(s => ...)` to always get the latest state |
| No error state in async actions — silent failures | Always have an `error` field and set it in the catch block |

## K — Coding Challenge

**Challenge:** Build a complete `useAuthStore` with async `login`, `logout`, and `refreshToken` actions, including loading and error states for each:

**Solution:**

```jsx
import { create } from "zustand"

const useAuthStore = create((set, get) => ({
  // ── STATE ──
  user: null,
  token: null,
  isAuthenticated: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isRefreshing: false,
  authError: null,

  // ── ASYNC ACTIONS ──
  login: async (credentials) => {
    set({ isLoggingIn: true, authError: null })
    try {
      const { user, token } = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }).then(r => {
        if (!r.ok) throw new Error("Invalid credentials")
        return r.json()
      })

      // Store token in memory (secure) and optionally localStorage
      set({ user, token, isAuthenticated: true, isLoggingIn: false })
    } catch (e) {
      set({ isLoggingIn: false, authError: e.message })
    }
  },

  logout: async () => {
    set({ isLoggingOut: true })
    try {
      // Tell server to invalidate session
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${get().token}` },
      })
    } finally {
      // Always clear local auth state, even if server request fails
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoggingOut: false,
        authError: null,
      })
    }
  },

  refreshToken: async () => {
    if (get().isRefreshing) return   // prevent concurrent refresh
    set({ isRefreshing: true })
    try {
      const { token } = await fetch("/api/auth/refresh", {
        method: "POST",
      }).then(r => {
        if (!r.ok) throw new Error("Session expired")
        return r.json()
      })
      set({ token, isRefreshing: false })
    } catch (e) {
      // Refresh failed — force logout
      set({ user: null, token: null, isAuthenticated: false, isRefreshing: false })
    }
  },

  clearError: () => set({ authError: null }),
}))
```


***
