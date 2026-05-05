# 3 — `useImperativeHandle`

## T — TL;DR

`useImperativeHandle` lets you customize what a parent receives when it holds a ref to your component — expose a minimal, controlled API instead of the raw DOM node.[^6][^1]

## K — Key Concepts

**The problem it solves:**[^6]

By default, `forwardRef` gives the parent *full access* to the raw DOM node — they can call any method or mutate any style. `useImperativeHandle` lets you expose only the methods you choose.

```jsx
// Without useImperativeHandle: parent gets the raw input DOM node
// → parent can do ref.current.style.opacity = 0 or any DOM mutation

// With useImperativeHandle: parent gets ONLY what you expose
const MyInput = forwardRef(function MyInput(props, ref) {
  const inputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus()
    },
    scrollIntoView() {
      inputRef.current.scrollIntoView()
    }
    // parent CANNOT access inputRef.current.style, .value, etc.
  }), [])  // deps array — rebuild the handle when these change

  return <input {...props} ref={inputRef} />
})
```

**Usage from parent:**

```jsx
function Form() {
  const ref = useRef(null)

  function handleEdit() {
    ref.current.focus()          // ✅ exposed
    // ref.current.style.opacity = 0  // ❌ TypeError — not exposed
  }

  return (
    <>
      <MyInput ref={ref} placeholder="Name" />
      <button onClick={handleEdit}>Edit</button>
    </>
  )
}
```

**React 19 note:** In React 19, function components accept `ref` as a regular prop — `forwardRef` is no longer required. But `useImperativeHandle` still works the same way for customizing the exposed handle.[^5]

**When to use it:**

```
- Building reusable UI library components (`<Modal>`, `<DatePicker>`, `<RichTextEditor>`)
```

- Exposing `open()`, `close()`, `reset()`, `focus()` methods to parent
- Hiding internal DOM complexity from consumers


## W — Why It Matters

`useImperativeHandle` enforces encapsulation at the ref level. Without it, any component holding a ref can reach in and mutate any DOM property — breaking your component's internal invariants. With it, you define a clean, minimal imperative API — the same principle as information hiding in OOP.[^7][^6]

## I — Interview Q&A

**Q: What is `useImperativeHandle` and why would you use it?**
**A:** It customizes what a parent component receives when it holds a `ref` to your component. Instead of exposing the raw DOM node, you expose only the methods you explicitly define — giving you encapsulation and a controlled imperative API.[^1]

**Q: What is the relationship between `forwardRef` and `useImperativeHandle`?**
**A:** `forwardRef` passes a ref from parent to child so the child can attach it. `useImperativeHandle` takes that forwarded ref and replaces what it points to with a custom object. You use both together: `forwardRef` to receive the ref, `useImperativeHandle` to customize what gets exposed through it.[^6]

**Q: When should you NOT use `useImperativeHandle`?**
**A:** Avoid it when you can solve the problem declaratively with props and state. It's an escape hatch — if you find yourself needing it frequently in app code (not library code), it's a signal to rethink your component architecture.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Exposing the entire DOM node via `useImperativeHandle` | Only expose the specific methods callers need — minimize the surface area |
| Forgetting the deps array — stale handler functions | Pass deps like `useEffect`: `useImperativeHandle(ref, () => ({...}), [dep])` |
| Using `useImperativeHandle` without `forwardRef` | The `ref` argument only exists because of `forwardRef` — both are required |
| Using it in app code instead of library code | Prefer props/callbacks for app code; `useImperativeHandle` is for reusable UI primitives |

## K — Coding Challenge

**Challenge:** Build a `<Modal>` component with an imperative `open()` and `close()` API exposed via ref:

**Solution:**

```jsx
const Modal = forwardRef(function Modal({ children }, ref) {
  const [isOpen, setIsOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    open() { setIsOpen(true) },
    close() { setIsOpen(false) }
    // parent cannot access setIsOpen, isOpen state directly ✅
  }), [])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div className="modal">
        {children}
        <button onClick={() => setIsOpen(false)}>Close</button>
      </div>
    </div>
  )
})

// Usage in parent
function App() {
  const modalRef = useRef(null)

  return (
    <>
      <button onClick={() => modalRef.current.open()}>Open Modal</button>
      <Modal ref={modalRef}>
        <p>Modal content here</p>
        <button onClick={() => modalRef.current.close()}>Dismiss</button>
      </Modal>
    </>
  )
}
```


***
