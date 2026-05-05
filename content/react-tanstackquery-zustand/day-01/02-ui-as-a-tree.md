# 2 — UI as a Tree

## T — TL;DR

React represents your UI as a component tree — understanding this tree is the key to understanding rendering, re-renders, and performance.[^2]

## K — Key Concepts

React builds two types of trees:

- **Component Tree** — the hierarchy of your React components (what you write)
- **Render Tree** — the tree React constructs at runtime, containing only components (no host elements like `div`)[^2]

```
App
├── Header
├── Main
│   ├── Sidebar
│   └── Content
│       └── Card (× many)
└── Footer
```

React also builds a **module dependency tree** — it tracks which files import which, used by bundlers to create optimal bundles.[^2]

**Top-level components** (near the root) affect the most children when they re-render. **Leaf components** (no children) re-render often but cheaply.

## W — Why It Matters

Re-renders cascade *down* the tree. If you put unnecessary state at the top, your whole app re-renders. Understanding the tree model directly improves performance decisions and is the mental model behind tools like React DevTools.[^2]

## I — Interview Q&A

**Q: What is the React render tree?**
**A:** A tree React constructs during rendering that represents the component hierarchy for a given render cycle. It helps React determine which components to re-render when state changes.

**Q: What is the difference between the component tree and the DOM tree?**
**A:** The component tree contains React components (including non-DOM ones like Context providers). The DOM tree is what the browser actually renders — React reconciles between them using the virtual DOM.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Placing state high in the tree "just in case" | Keep state as low as possible — lift only when necessary |
| Ignoring tree depth when debugging re-renders | Use React DevTools Profiler to trace re-render paths |

## K — Coding Challenge

**Challenge:** In this tree, if `Main` re-renders, which components re-render?

```
App → Main → Sidebar
           → Content → Card
```

**Solution:**
`Main`, `Sidebar`, `Content`, and `Card` all re-render — re-renders cascade down. `App` does **not** re-render (it's the parent, not a child). To prevent `Card` from re-rendering unnecessarily, wrap it in `React.memo`.

***
