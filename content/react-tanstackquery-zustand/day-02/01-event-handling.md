# 1 — Event Handling

## T — TL;DR

React events use camelCase names and receive a synthetic event object — attach handlers directly in JSX, never as strings.[^3]

## K — Key Concepts

**Attaching event handlers:**

```jsx
// ✅ Pass a function reference
<button onClick={handleClick}>Click me</button>

// ✅ Inline arrow function
<button onClick={() => alert("clicked!")}>Click me</button>

// ❌ Calling the function immediately (common mistake)
<button onClick={handleClick()}>Click me</button>
// This runs handleClick on render, not on click
```

**The Synthetic Event object:**[^3]

React wraps native browser events in a `SyntheticEvent` — it has the same API cross-browser and is passed automatically as the first argument:

```jsx
function handleChange(e) {
  console.log(e.target.value)   // input's current value
  console.log(e.target.name)    // input's name attribute
  console.log(e.type)           // "change"
}
```

**Preventing default browser behavior:**

```jsx
function handleSubmit(e) {
  e.preventDefault()  // stops page reload on form submit
  // handle your logic
}
```

**Common React event names:**


| DOM Event | React Prop |
| :-- | :-- |
| `onclick` | `onClick` |
| `onchange` | `onChange` |
| `onsubmit` | `onSubmit` |
| `onkeydown` | `onKeyDown` |
| `onmouseenter` | `onMouseEnter` |
| `onfocus` | `onFocus` |

## W — Why It Matters

Event handling is the entry point for all user interaction in React. Misunderstanding the difference between passing a reference vs. calling a function is one of the most common Day 1 bugs. Every form, button, and interactive UI element depends on this.[^3]

## I — Interview Q&A

**Q: How do React events differ from native DOM events?**
**A:** React uses `SyntheticEvent` — a cross-browser wrapper with the same API as native events. Event names are camelCase (`onClick` not `onclick`), and handlers are passed as functions in JSX, not strings.

**Q: What is the difference between `onClick={handleClick}` and `onClick={handleClick()}`?**
**A:** `onClick={handleClick}` passes a function reference — it runs when the button is clicked. `onClick={handleClick()}` *calls* the function immediately during render, which is almost always a bug.

**Q: How do you stop a form from refreshing the page in React?**
**A:** Call `e.preventDefault()` inside the `onSubmit` handler. This prevents the browser's default form submission behavior.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `onClick={doSomething()}` calls on render | Use `onClick={doSomething}` or `onClick={() => doSomething()}` |
| Forgetting `e.preventDefault()` on forms | Always add it in `onSubmit` handlers |
| Trying to read `e.target.value` asynchronously | Store `e.target.value` in a variable first — SyntheticEvent is pooled (older React) |

## K — Coding Challenge

**Challenge:** Fix all event handling bugs:

```jsx
function LoginForm() {
  function handleSubmit() {
    console.log("submitted")
  }

  return (
    <form onSubmit={handleSubmit()}>
      <input type="text" />
      <button onclick={() => console.log("clicked")}>Login</button>
    </form>
  )
}
```

**Solution:**

```jsx
function LoginForm() {
  function handleSubmit(e) {
    e.preventDefault()           // ✅ prevent page reload
    console.log("submitted")
  }

  return (
    <form onSubmit={handleSubmit}>     {/* ✅ reference, not call */}
      <input type="text" />
      <button onClick={() => console.log("clicked")}>Login</button>
                                        {/* ✅ camelCase onClick */}
    </form>
  )
}
```


***
