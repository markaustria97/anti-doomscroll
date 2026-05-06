# 8 — Map and Set Usage

## T — TL;DR

`Map` and `Set` in Zustand require creating a new instance on every update — mutating in place doesn't change the reference, so React never re-renders.

## K — Key Concepts

**The core rule — always new instance:**

```jsx
// ❌ WRONG — mutates in place, same Map reference → no re-render
set((state) => {
  state.userMap.set("user1", newUser)
  return { userMap: state.userMap }   // same reference!
})

// ✅ CORRECT — new Map instance → new reference → re-renders ✅
set((state) => ({
  userMap: new Map(state.userMap).set("user1", newUser)
}))
```

**Full Map CRUD pattern:**

```jsx
const useUserMapStore = create((set) => ({
  users: new Map(),   // Map<id, User>

  // Add / Update
  setUser: (id, user) =>
    set((s) => ({ users: new Map(s.users).set(id, user) })),

  // Delete
  removeUser: (id) =>
    set((s) => {
      const next = new Map(s.users)
      next.delete(id)
      return { users: next }
    }),

  // Update multiple at once
  mergeUsers: (newUsers) =>   // newUsers: Array<[id, User]>
    set((s) => {
      const next = new Map(s.users)
      newUsers.forEach(([id, user]) => next.set(id, user))
      return { users: next }
    }),

  // Clear
  clearUsers: () => set({ users: new Map() }),
}))
```

**Full Set CRUD pattern:**

```jsx
const useSelectionStore = create((set) => ({
  selectedIds: new Set(),  // Set<string>

  // Add
  selectItem: (id) =>
    set((s) => ({ selectedIds: new Set([...s.selectedIds, id]) })),
  // OR: set((s) => ({ selectedIds: new Set(s.selectedIds).add(id) }))

  // Remove
  deselectItem: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      next.delete(id)
      return { selectedIds: next }
    }),

  // Toggle
  toggleItem: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedIds: next }
    }),

  // Select all / deselect all
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  deselectAll: () => set({ selectedIds: new Set() }),

  // Check (use in component with selector)
  isSelected: (id) => useSelectionStore.getState().selectedIds.has(id),
}))
```

**Map vs Object — when to prefer Map:**


|  | Object `{}` | `Map` |
| :-- | :-- | :-- |
| Keys | Strings only | Any type (string, number, object) |
| Iteration order | Insertion order (modern JS) | Guaranteed insertion order |
| Size | `Object.keys(o).length` | `map.size` (O(1)) |
| Presence check | `key in obj` | `map.has(key)` |
| Performance at large scale | Slower | Faster |
| JSON.stringify | ✅ Built-in | ❌ Needs custom serializer (persist) |

## W — Why It Matters

Map and Set are the most ergonomic data structures for key-value lookups and unique-value collections — but they're invisible to React's reference equality check when mutated in place. The `new Map(existing)` pattern is the idiomatic fix, and knowing when to use Map vs Object is a senior-level distinction.

## I — Interview Q&A

**Q: Why do you need `new Map(state.map).set(key, value)` instead of `state.map.set(key, value)`?**
**A:** `Map.prototype.set()` mutates the Map in place and returns the same Map instance. Zustand detects changes by reference equality — same reference means no re-render. `new Map(existing)` creates a new Map instance (triggering re-render) while copying all existing entries.

**Q: Can you use `Map` with Zustand's `persist` middleware?**
**A:** Not directly — `JSON.stringify(map)` produces `{}`. You need a custom storage serializer that converts the Map to an array of entries (`[...map.entries()]`) for storage and back to a `new Map(entries)` on rehydration.

**Q: When should you use a `Map` instead of a plain object for store state?**
**A:** When keys are dynamic IDs (string or number), when you need O(1) size, when you frequently add/delete entries by key, or when key order matters. For a fixed set of properties (like `{ theme, sidebar, user }`), plain objects are cleaner.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating Map/Set in place — no re-render | Always `new Map(s.map).set(...)` or `new Set(s.set).add(...)` |
| `set.add()` not returning `this` in chain — forgot to return Set | `new Set(s.set).add(item)` — `add()` returns the Set, wrap with `new Set(...)` |
| Using Map with `persist` without a custom serializer | Convert to/from array of entries: `[[k,v], ...]` for serialization |
| Selecting Map/Set in components without `useShallow` — always re-renders | `useShallow` doesn't deep-compare Maps — use derived primitive values (`map.size`) or `useMemo` |

## K — Coding Challenge

**Challenge:** Build a multi-select store with a `Map<id, Item>` for item data and a `Set<id>` for selections — implement all CRUD operations and a "select page" bulk operation:

**Solution:**

```jsx
import { create } from "zustand"
import { useShallow } from "zustand/shallow"

const useItemSelectionStore = create((set, get) => ({
  // Map for O(1) lookup by id
  items: new Map(),             // Map<string, Item>
  selectedIds: new Set(),       // Set<string>

  // ── Item CRUD ──
  setItems: (itemArray) =>
    set({ items: new Map(itemArray.map((item) => [item.id, item])) }),

  updateItem: (id, updates) =>
    set((s) => {
      const next = new Map(s.items)
      const existing = next.get(id)
      if (existing) next.set(id, { ...existing, ...updates })
      return { items: next }
    }),

  removeItem: (id) =>
    set((s) => {
      const nextItems = new Map(s.items)
      const nextSelected = new Set(s.selectedIds)
      nextItems.delete(id)
      nextSelected.delete(id)    // deselect removed item ✅
      return { items: nextItems, selectedIds: nextSelected }
    }),

  // ── Selection ──
  toggleSelect: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedIds: next }
    }),

  // Select all items on a page (bulk)
  selectPage: (pageItemIds) =>
    set((s) => ({
      selectedIds: new Set([...s.selectedIds, ...pageItemIds]),
    })),

  deselectPage: (pageItemIds) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      pageItemIds.forEach((id) => next.delete(id))
      return { selectedIds: next }
    }),

  deselectAll: () => set({ selectedIds: new Set() }),

  // ── Derived helpers (call outside React with getState()) ──
  getSelectedItems: () => {
    const { items, selectedIds } = get()
    return [...selectedIds].map((id) => items.get(id)).filter(Boolean)
  },
}))

// Usage in component
function DataTable({ pageItems }) {
  const selectedIds = useItemSelectionStore((s) => s.selectedIds)
  const { toggleSelect, selectPage, deselectPage, deselectAll } =
    useItemSelectionStore(
      useShallow((s) => ({
        toggleSelect: s.toggleSelect,
        selectPage: s.selectPage,
        deselectPage: s.deselectPage,
        deselectAll: s.deselectAll,
      }))
    )

  const pageIds = pageItems.map((i) => i.id)
  const allPageSelected = pageIds.every((id) => selectedIds.has(id))

  return (
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={allPageSelected}
              onChange={() =>
                allPageSelected ? deselectPage(pageIds) : selectPage(pageIds)
              }
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {pageItems.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleSelect(item.id)}
              />
            </td>
            <td>{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```


***
