# 4 — No-Provider Model

## T — TL;DR

Zustand stores are JavaScript module singletons — no `<Provider>` wrapper is needed, and any component anywhere in the tree can import and read the store instantly.[^4][^2]

## K — Key Concepts

**How Zustand achieves no-provider:**[^4][^2]

```jsx
// The store is created at MODULE level — outside React
// It lives in JavaScript memory, not in the React tree
import { create } from "zustand"

export const useCountStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}))

// ↑ This module-level singleton exists when the file is imported
// React doesn't need to "provide" it — it's just a JS module
```

**Any component can use it — no tree position matters:**

```jsx
// Component A — deep in the tree
function DeepChildA() {
  const count = useCountStore((s) => s.count)
  return <p>{count}</p>
}

// Component B — completely different branch
function UnrelatedSidebarWidget() {
  const increment = useCountStore((s) => s.increment)
  return <button onClick={increment}>+</button>
}

// No common parent needs to provide anything ✅
// No prop drilling between A and B ✅
// Both components stay in sync automatically ✅
```

**Comparison — Context requires a provider, Zustand doesn't:**

```jsx
// ❌ Context — must wrap the tree
function App() {
  return (
    <ThemeProvider>          {/* required */}
      <AuthProvider>          {/* required */}
        <CartProvider>        {/* required */}
          <Router />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// ✅ Zustand — no wrapping needed
function App() {
  return <Router />   // nothing to set up
}
// Just import the hooks where needed
import { useThemeStore } from "./stores/theme"
import { useAuthStore } from "./stores/auth"
import { useCartStore } from "./stores/cart"
```

**When you DO want a provider (scoped stores):**[^6]

```jsx
// If you need multiple independent instances of a store (e.g., multiple
// modals, each with its own state), use createStore + useStore pattern
import { createStore, useStore } from "zustand"
import { createContext, useContext } from "react"

const StoreContext = createContext(null)

function ModalProvider({ children }) {
  const store = createStore((set) => ({  // createStore (not create) = no hook
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  }))
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

function useModalStore(selector) {
  const store = useContext(StoreContext)
  return useStore(store, selector)
}
```


## W — Why It Matters

The provider-free model eliminates the "provider hell" that's common in large React apps — layers of context providers, each requiring setup, each adding a React tree node. It also means you can use Zustand stores in non-component contexts: outside React (event handlers, WebSocket listeners, service workers), in test utilities, and in middleware — all without mocking a React tree.[^2][^4]

## I — Interview Q&A

**Q: How does Zustand work without a Provider?**
**A:** Zustand stores are JavaScript module singletons created outside the React tree. React's Context API needs a Provider to inject a value into the tree; Zustand bypasses this entirely by living in module scope — when a component imports the store hook and calls it, it subscribes to the module-level store directly.[^4][^2]

**Q: Can you use a Zustand store outside of a React component?**
**A:** Yes — `useCountStore.getState()` returns the current state synchronously anywhere. `useCountStore.setState(...)` updates it. `useCountStore.subscribe(...)` subscribes to changes. These are all available without hooks, enabling usage in vanilla JS, WebSocket handlers, or test utilities.[^6]

**Q: When would you actually need a provider with Zustand?**
**A:** When you need multiple independent instances of the same store — for example, a modal component that appears multiple times, each with its own open/close state. Use `createStore` (not `create`) with a React Context to scope the store per instance.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Recreating the store inside a component — new store on every render | Always create stores at module level — `const useStore = create(...)` outside all components |
| Trying to pass Zustand stores as props | Import the store hook directly in any component — no passing needed |
| Not understanding that all module instances share state | One import = one singleton across your entire app — SSR needs special handling per request |
| SSR: store state leaking between server requests | Use `createStore` (not `create`) for SSR to create per-request stores |

## K — Coding Challenge

**Challenge:** Access the Zustand auth store in three different contexts: (1) a React component, (2) an Axios interceptor (outside React), and (3) a WebSocket message handler:

**Solution:**

```jsx
// stores/auth.ts
import { create } from "zustand"

interface AuthState {
  token: string | null
  user: { id: number; name: string } | null
  setAuth: (token: string, user: AuthState["user"]) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null }),
}))

// ── 1. React component (hook API) ──
function UserAvatar() {
  const user = useAuthStore((s) => s.user)
  return user ? <img src={`/avatars/${user.id}`} /> : <LoginButton />
}

// ── 2. Axios interceptor (outside React — no hook) ──
import axios from "axios"

axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token  // ✅ .getState() = synchronous read
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()       // ✅ .getState().action() = call action
    }
    return Promise.reject(error)
  }
)

// ── 3. WebSocket message handler (outside React) ──
const ws = new WebSocket("wss://api.example.com/live")

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.type === "TOKEN_REFRESH") {
    useAuthStore.getState().setAuth(
      message.newToken,
      useAuthStore.getState().user       // ✅ read current user, update token
    )
  }
}
```


***
