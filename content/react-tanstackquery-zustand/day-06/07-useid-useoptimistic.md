# 7 — `useId` & `useOptimistic`

## T — TL;DR

`useId` generates stable, unique IDs for accessibility attributes across server and client; `useOptimistic` shows a predicted UI state immediately before a server response confirms the change.[^2]

## K — Key Concepts

**`useId` — stable unique IDs:**[^8]

```jsx
// Problem: manually generating IDs causes hydration mismatches in SSR
// ❌ Different on server vs client
const id = Math.random().toString(36)

// ✅ useId — same ID on server and client, guaranteed unique per component instance
function FormField({ label }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  )
}

// For multiple related IDs from one hook — add a suffix
function PasswordField() {
  const baseId = useId()
  return (
    <div>
      <label htmlFor={`${baseId}-input`}>Password</label>
      <input id={`${baseId}-input`} aria-describedby={`${baseId}-hint`} type="password" />
      <p id={`${baseId}-hint`}>Must be 8+ characters</p>
    </div>
  )
}
```

**`useOptimistic` — instant UI feedback:**[^2]

```jsx
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes)

  // optimisticLikes is a "hopeful" state shown before server confirms
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes, delta) => currentLikes + delta  // how to apply the optimistic update
  )

  async function handleLike() {
    addOptimisticLike(1)                    // ✅ UI updates instantly (+1 shown)
    try {
      const newLikes = await likePost(postId)  // wait for server
      setLikes(newLikes)                    // ✅ confirm with real server value
    } catch {
      // optimistic value auto-reverts to `likes` on error ✅
    }
  }

  return (
    <button onClick={handleLike}>
      ❤️ {optimisticLikes}
    </button>
  )
}
```

**`useOptimistic` auto-revert:** If the async operation rejects, the optimistic value automatically reverts to the actual state — no manual rollback needed.

## W — Why It Matters

`useId` solves a persistent accessibility + SSR bug that existed since React's beginning. `useOptimistic` is the correct, composable way to implement optimistic UI — previously done manually with try/catch and separate state variables. Both reflect React's evolution toward server-first, accessibility-first development.[^2]

## I — Interview Q&A

**Q: Why was `useId` introduced? Can't you just use a counter or `Math.random()`?**
**A:** `Math.random()` generates different values on the server and client, causing SSR hydration mismatches. A module-level counter also breaks in concurrent rendering. `useId` generates stable, consistent IDs using React's component tree position — same on server and client, unique per instance.

**Q: What does `useOptimistic` do when the server call fails?**
**A:** It automatically reverts to the actual state value passed as the first argument. You don't need to write rollback logic — the optimistic overlay is discarded and the real state shows again.

**Q: When should you use `useOptimistic` vs just `useState`?**
**A:** Use `useOptimistic` when you want to show a predicted result immediately while an async operation is in progress. Use regular `useState` when you need to wait for confirmation before showing any change.[^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Creating one `useId` per element in a loop | Create one `useId` outside the loop and append suffixes — `useId` is per component instance |
| Using `useOptimistic` without wrapping in `startTransition` | Server Actions automatically wrap; for manual use, wrap the action in `startTransition` |
| Not handling `useOptimistic` revert cases in UX | Show an error message when revert happens — the revert is silent without user feedback |
| Using `Math.random()` for form field IDs | Replace with `useId()` — prevents SSR hydration warnings |

## K — Coding Challenge

**Challenge:** Build an optimistic todo toggle — the checkbox checks immediately, then confirms or reverts after server response:

**Solution:**

```jsx
function TodoItem({ todo }) {
  const [actualDone, setActualDone] = useState(todo.done)

  const [optimisticDone, setOptimisticDone] = useOptimistic(
    actualDone,
    (_, newValue) => newValue  // apply optimistic value directly
  )

  const checkboxId = useId()  // ✅ stable, unique ID for accessibility

  async function handleToggle() {
    setOptimisticDone(!actualDone)            // ✅ instant UI update
    try {
      const updated = await toggleTodo(todo.id)
      setActualDone(updated.done)             // ✅ confirm with server truth
    } catch {
      // ✅ auto-reverts to actualDone — no extra code needed
      alert("Failed to update. Please try again.")
    }
  }

  return (
    <li>
      <input
        id={checkboxId}
        type="checkbox"
        checked={optimisticDone}
        onChange={handleToggle}
      />
      <label htmlFor={checkboxId}>{todo.text}</label>
    </li>
  )
}
```


***
