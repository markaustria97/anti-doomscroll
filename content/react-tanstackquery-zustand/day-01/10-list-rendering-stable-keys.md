# 10 — List Rendering & Stable Keys

## T — TL;DR

Always give list items a stable, unique `key` — React uses it to match elements across re-renders, preventing bugs and unnecessary DOM mutations.[^9][^10]

## K — Key Concepts

**Why keys matter:**[^9]

React uses keys to identify which items in a list have changed, been added, or removed. Without keys (or with unstable keys), React must re-render every item on every update.

```jsx
// ✅ Stable key from data ID
{products.map(p => <ProductRow key={p.id} product={p} />)}

// ⚠️ Index as key — acceptable only for static, never-reordered lists
{items.map((item, i) => <li key={i}>{item}</li>)}

// ❌ Math.random() as key — new key every render = full unmount/remount
{items.map(item => <li key={Math.random()}>{item}</li>)}
```

**Key rules:**[^10]

- Keys must be **unique among siblings** (not globally)
- Keys must be **stable** — same item = same key across re-renders
- Keys must be **predictable** — derived from the data, not generated at render time
- Keys do **not** get passed as a prop — use a separate `id` prop if you need it inside the child

**Key scope:**

```jsx
// Keys only need to be unique within the same array
function App() {
  return (
    <>
      {listA.map(item => <A key={item.id} />)}  // key="1" OK here
      {listB.map(item => <B key={item.id} />)}  // key="1" also OK here
    </>
  )
}
```


## W — Why It Matters

Wrong keys cause the most mysterious React bugs: input fields losing focus mid-typing, animations breaking, stale data appearing. The index-as-key anti-pattern is extremely common in production codebases and interviewers know to ask about it.[^10][^9]

## I — Interview Q&A

**Q: What is the `key` prop in React and why is it important?**
**A:** `key` is a special prop that helps React identify which items in a list have changed between renders. It enables efficient reconciliation — React can reuse existing DOM nodes instead of recreating them, avoiding visual bugs and performance issues.

**Q: Why is using array index as a key a problem?**
**A:** If items are reordered, inserted, or deleted, the index no longer maps to the same item. React gets confused, may show stale data, and can corrupt component state (especially in form inputs). Use stable IDs from your data instead.

**Q: Can two sibling components share the same key?**
**A:** No. Keys must be unique among siblings in the same list. However, the same key value can appear in *different* lists — keys are scoped to their array.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `Math.random()` as key | Use data IDs; random keys cause full remount every render |
| Using index for dynamic/sortable lists | Use stable unique IDs from your data model |
| Putting key on the wrong element | Key goes on the outermost element returned from `map`, not deeper |
| Expecting `key` to be accessible as a prop inside the child | `key` is reserved — pass `id` separately if needed inside child |

## K — Coding Challenge

**Challenge:** Find all key-related issues and fix them:

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <div>
          <li key={Math.random()}>{todo.text}</li>
        </div>
      ))}
    </ul>
  )
}
```

**Solution:**

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>   {/* ✅ key on outermost element, stable ID */}
          {todo.text}
        </li>
        // Removed unnecessary <div> wrapper inside <ul>
      ))}
    </ul>
  )
}
// Issues fixed:
// 1. Math.random() key → stable todo.id
// 2. key placed on outermost element returned from map (li, not div)
// 3. Removed invalid <div> inside <ul> (invalid HTML)
```


***

> **Your tiny action right now:** Pick subtopic 1 or 5. Read the TL;DR. Do the coding challenge. That's it — you're done for today's session.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://react.dev/learn/thinking-in-react

[^2]: https://react.dev/learn/understanding-your-ui-as-a-tree

[^3]: https://react.dev/reference/rules

[^4]: https://www.telerik.com/blogs/react-basics-thinking-react

[^5]: https://blog.bitsrc.io/how-to-build-better-react-components-in-2024-2d930b1f30b1

[^6]: https://dev.to/a1guy/react-components-props-and-jsx-a-beginners-guide-50ae

[^7]: https://coderscratchpad.com/lists-and-keys-in-react/

[^8]: https://thisdotcode.com/conditional-rendering-lists-and-keys-in-reactjs/

[^9]: https://stackoverflow.com/questions/69260658/properly-choosing-react-keys-while-rendering-items-from-array

[^10]: https://www.freecodecamp.org/news/best-practices-for-react/

[^11]: https://www.robinwieruch.de/react-trends-2024/

[^12]: https://legacy.reactjs.org/docs/design-principles.html

[^13]: https://www.reddit.com/r/reactjs/comments/18rzwq7/what_react_features_do_you_want_in_2024/

[^14]: https://legacy.reactjs.org/docs/render-props.html

[^15]: https://www.youtube.com/watch?v=pbJfF78OGf0
