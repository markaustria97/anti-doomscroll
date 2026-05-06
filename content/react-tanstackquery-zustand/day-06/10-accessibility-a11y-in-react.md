# 10 — Accessibility (a11y) in React

## T — TL;DR

Accessible React means using semantic HTML, proper ARIA attributes, keyboard navigation, and focus management — `useId` and `useRef` are your primary accessibility tools.

## K — Key Concepts

**Semantic HTML first — the foundation:**

```jsx
// ❌ div soup — not accessible
<div onClick={handleClick}>Submit</div>

// ✅ Semantic HTML — keyboard accessible, screen reader friendly
<button onClick={handleClick} type="button">Submit</button>
```

**`useId` for label-input association:**

```jsx
function FormField({ label, type = "text" }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  )
}
```

**ARIA attributes for dynamic content:**

```jsx
function Dropdown({ items }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const buttonId = useId()
  const listId = useId()

  return (
    <div>
      <button
        id={buttonId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen(o => !o)}
      >
        Select item
      </button>
      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
        >
          {items.map((item, i) => (
            <li
              key={item.id}
              role="option"
              aria-selected={i === activeIndex}
              tabIndex={i === activeIndex ? 0 : -1}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

**Focus management with `useRef`:**

```jsx
function Modal({ isOpen, onClose, children }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus()  // move focus into modal on open
  }, [isOpen])

  return isOpen ? (
    <div role="dialog" aria-modal="true">
      {children}
      <button ref={closeButtonRef} onClick={onClose}>Close</button>
    </div>
  ) : null
}
```

**React-specific a11y considerations:**

```jsx
// htmlFor not for, className not class
<label htmlFor={id}>Name</label>

// Keyboard handler alongside onClick for non-button elements
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={e => e.key === "Enter" && handleClick()}  // keyboard support
>
  Action
</div>

// Live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}  {/* screen reader announces this when it changes */}
</div>
```


## W — Why It Matters

Accessibility is a legal requirement in many jurisdictions and a moral imperative. In React, improper `htmlFor`/`id` pairing, missing ARIA on dynamic widgets, and broken focus management after route changes are the most common violations. Senior React developers audit for these automatically.

## I — Interview Q&A

**Q: How do you associate a `<label>` with an `<input>` in React?**
**A:** Use `useId` to generate a consistent ID, set `id={id}` on the input, and `htmlFor={id}` on the label (not `for` — that's JSX). This links them for screen readers and also makes clicking the label focus the input.

**Q: How do you manage focus when a modal opens?**
**A:** Use `useRef` to reference an element inside the modal (typically the close button or first focusable element) and call `.focus()` inside a `useEffect` that runs when `isOpen` becomes `true`. When the modal closes, restore focus to the trigger element.

**Q: What is `aria-live` used for?**
**A:** It tells screen readers to announce content changes automatically when the region updates. Use `aria-live="polite"` for non-urgent updates (search results, status messages) and `aria-live="assertive"` for urgent ones (errors, alerts).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `<div onClick={...}>` for interactive elements | Use `<button>` or `<a>` — native semantics include keyboard/focus support |
| Hardcoded `id="email"` for reused components | Use `useId()` — multiple instances will have conflicting IDs otherwise |
| No `alt` on images | Decorative images: `alt=""`. Meaningful images: descriptive alt text |
| Dynamic content updates not announced | Wrap changing content in `aria-live="polite"` region |

## K — Coding Challenge

**Challenge:** Fix all accessibility violations in this form:

```jsx
function LoginForm() {
  return (
    <div>
      <div>Username</div>
      <input id="user" type="text" />
      <div>Password</div>
      <input id="pass" type="password" />
      <div onClick={() => console.log("submit")} style={{ cursor: "pointer" }}>
        Login
      </div>
    </div>
  )
}
```

**Solution:**

```jsx
function LoginForm() {
  const usernameId = useId()   // ✅ unique, stable IDs
  const passwordId = useId()

  function handleSubmit(e) {
    e.preventDefault()
    console.log("submit")
  }

  return (
    <form onSubmit={handleSubmit}>   {/* ✅ semantic form element */}
      <div>
        <label htmlFor={usernameId}>Username</label>    {/* ✅ label, not div */}
        <input id={usernameId} type="text" name="username" autoComplete="username" />
      </div>
      <div>
        <label htmlFor={passwordId}>Password</label>   {/* ✅ label association */}
        <input id={passwordId} type="password" name="password" autoComplete="current-password" />
      </div>
      <button type="submit">Login</button>              {/* ✅ button, not div */}
    </form>
  )
}
```


***
