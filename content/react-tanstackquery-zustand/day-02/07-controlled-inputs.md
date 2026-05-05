# 7 — Controlled Inputs

## T — TL;DR

A controlled input is one where React state is the single source of truth for the input's value — every keystroke updates state and state drives the display.[^6]

## K — Key Concepts

**Controlled vs. Uncontrolled:**


|  | Controlled | Uncontrolled |
| :-- | :-- | :-- |
| Source of truth | React state | DOM itself |
| How to read value | From state | Via `ref.current.value` |
| Re-renders per keystroke | Yes | No |
| Use case | Forms needing validation, derived values | Simple forms, file inputs |

**Controlled input pattern:**[^6]

```jsx
function SearchBar() {
  const [query, setQuery] = useState("")

  return (
    <input
      type="text"
      value={query}                           // ← state drives the display
      onChange={e => setQuery(e.target.value)} // ← every keystroke updates state
      placeholder="Search..."
    />
  )
}
```

**Multiple inputs with one handler:**

```jsx
function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "" })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
    </>
  )
}
```


## W — Why It Matters

Controlled inputs let you validate on the fly, format input as the user types, disable submit until form is complete, and keep form state in sync with your UI. They're the standard React approach for any form that does more than just submit.[^7][^6]

## I — Interview Q&A

**Q: What is a controlled component in React?**
**A:** A form element (input, select, textarea) whose value is controlled by React state. The `value` prop is bound to state, and an `onChange` handler updates state on every user input. This makes React the single source of truth.

**Q: What happens if you set `value` on an input but don't provide `onChange`?**
**A:** The input becomes read-only — it displays the state value but the user can't change it. React will warn you. You either need `onChange` (controlled) or remove `value` and use `defaultValue` (uncontrolled).

**Q: When would you use an uncontrolled input?**
**A:** For simple forms where you only need the value on submit (no real-time validation), or for file inputs (which can never be controlled). Access the value via `ref.current.value` at submit time.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Setting `value` without `onChange` → read-only input | Always pair `value` with an `onChange` handler |
| Setting `value={undefined}` — switches input from controlled to uncontrolled | Always initialize state: `useState("")` not `useState()` |
| One state key per input (becomes unmanageable) | Use one object state `{ name, email, password }` with a shared handler |

## K — Coding Challenge

**Challenge:** Build a controlled form with name and email fields. Show a live preview as the user types. Disable the submit button if either field is empty:

**Solution:**

```jsx
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "" })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const isValid = form.name.trim() !== "" && form.email.trim() !== ""

  return (
    <div>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <button disabled={!isValid}>Submit</button>
      {isValid && <p>Preview: {form.name} — {form.email}</p>}
    </div>
  )
}
```


***
