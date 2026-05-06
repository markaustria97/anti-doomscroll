# 4 — Hydration, SSR, & Versioning

## T — TL;DR

Zustand persist hydration and SSR require special care — `skipHydration` prevents hydration mismatches on the server, and `version` + `migrate` handle breaking schema changes across deployments.

## K — Key Concepts

**The SSR hydration mismatch problem:**

```
Server render:
  Store initializes with defaults (no localStorage on server)
  → HTML: <p>theme: light</p>

Client hydration:
  localStorage has { theme: "dark" }
  → Zustand rehydrates → theme = "dark"
  → React sees DOM says "light" but store says "dark" → MISMATCH ⚠️

React throws a hydration error or silently shows wrong content.
```

**Solution — `skipHydration`:**

```jsx
// 1. Skip automatic hydration on init
const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "theme",
      skipHydration: true,   // ← don't auto-hydrate on store creation
    }
  )
)

// 2. Manually hydrate AFTER React mounts (client-only)
// In Next.js App Router — layout.tsx or a client component:
function HydrationGate({ children }) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    useThemeStore.persist.rehydrate()   // ← safe: runs only on client
    setHydrated(true)
  }, [])

  // Optionally: render nothing until hydrated to avoid flash
  if (!hydrated) return <div style={{ visibility: "hidden" }}>{children}</div>
  return children
}
```

**Versioning — preventing stale persisted state from breaking your app:**

```jsx
persist(
  (set) => ({ /* store */ }),
  {
    name: "user-prefs",
    version: 2,   // ← bump when schema changes

    migrate: (persistedState, version) => {
      // version = the version stored in localStorage
      if (version === 0) {
        // v0 → v1: renamed "colour" to "theme"
        persistedState.theme = persistedState.colour
        delete persistedState.colour
      }
      if (version === 1) {
        // v1 → v2: split single "name" into "firstName" + "lastName"
        const [firstName = "", lastName = ""] = (persistedState.name ?? "").split(" ")
        persistedState.firstName = firstName
        persistedState.lastName = lastName
        delete persistedState.name
      }
      return persistedState   // ← return migrated state
    },
  }
)
```

**What happens on version mismatch without `migrate`:**

```
Stored version: 1 → Current version: 2
Without migrate: persisted state is DISCARDED → store uses defaults
With migrate:    persisted state is TRANSFORMED → data preserved ✅
```

**Hydration lifecycle hooks:**

```jsx
persist(
  (set) => ({ /* store */ }),
  {
    name: "my-store",
    onRehydrateStorage: (state) => {
      console.log("Hydration starting, initial state:", state)
      return (rehydratedState, error) => {
        if (error) console.error("Hydration failed:", error)
        else console.log("Hydrated successfully:", rehydratedState)
      }
    },
  }
)
```


## W — Why It Matters

Every production app that uses SSR (Next.js) with persist must handle the hydration mismatch problem — it causes subtle UI bugs that are hard to diagnose. Every app that ever deploys a schema change to persisted state must handle migration — without it, users with old data get broken stores or blank screens. Versioning is essentially database migrations for client-side state.

## I — Interview Q&A

**Q: What is a hydration mismatch and how does Zustand's `skipHydration` solve it?**
**A:** In SSR, the server renders with default state (no localStorage access). When the client hydrates, Zustand reads localStorage and updates the store — but React's hydration expects the DOM to match the server-rendered HTML. `skipHydration: true` prevents auto-rehydration at store creation; you manually call `rehydrate()` inside a `useEffect` (client-only), after React's initial hydration completes.

**Q: What happens to persisted state when you add a new field to the store?**
**A:** The `merge` behavior (shallow merge by default) fills in missing fields from the store's defaults. New fields not in localStorage get their initial values from the store creator. No migration needed for purely additive changes — only for renames, deletions, or type changes.

**Q: When should you bump the `version` number in persist?**
**A:** Whenever you make a breaking schema change — renaming a key, splitting a field, changing a value's type, or removing a required field. Non-breaking changes (adding new fields with defaults) don't require a version bump since the shallow merge handles them.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| No `skipHydration` in Next.js — hydration mismatch errors | Add `skipHydration: true` and manually `rehydrate()` in `useEffect` |
| Changing store shape without bumping `version` — old data breaks new code | Always bump `version` and add a `migrate` case for breaking changes |
| `migrate` doesn't handle all old versions — users on v0 trying to reach v3 | Handle all version numbers in the migrate function — it runs once per version step |
| Accessing hydrated state synchronously on first render (SSR) | Use `useStore.persist.hasHydrated()` to gate renders that depend on persisted state |

## K — Coding Challenge

**Challenge:** A user preferences store has gone through 3 schema changes. Write the `persist` config with `version: 3` and a `migrate` function that handles all prior versions:

**Solution:**

```jsx
// Schema history:
// v0: { colour: "blue", showSidebar: true }
// v1: { theme: "light", showSidebar: true }         (renamed colour → theme)
// v2: { theme: "light", layout: { sidebar: true } }  (nested showSidebar → layout.sidebar)
// v3: { theme: "light", layout: { sidebar: true, density: "comfortable" } } (added density)

const usePrefsStore = create(
  persist(
    (set) => ({
      theme: "light",
      layout: { sidebar: true, density: "comfortable" },
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setSidebarOpen: (open) => set((s) => ({ layout: { ...s.layout, sidebar: open } })),
      setDensity: (density) => set((s) => ({ layout: { ...s.layout, density } })),
    }),
    {
      name: "user-preferences",
      version: 3,

      migrate: (persisted, fromVersion) => {
        // Apply migrations sequentially
        if (fromVersion < 1) {
          // v0 → v1: colour → theme
          persisted.theme = persisted.colour ?? "light"
          delete persisted.colour
        }
        if (fromVersion < 2) {
          // v1 → v2: flat showSidebar → nested layout.sidebar
          persisted.layout = { sidebar: persisted.showSidebar ?? true }
          delete persisted.showSidebar
        }
        if (fromVersion < 3) {
          // v2 → v3: add density with default
          persisted.layout = { ...(persisted.layout ?? {}), density: "comfortable" }
        }
        return persisted   // ← return fully migrated state ✅
      },

      // SSR-safe
      skipHydration: true,
    }
  )
)

// In _app.tsx or layout.tsx
function HydrationBoundary({ children }) {
  useEffect(() => {
    usePrefsStore.persist.rehydrate()
  }, [])
  return children
}
```


***
