# 3 — `useReducer`

## T — TL;DR

`useReducer` manages complex state with a pure reducer function — use it when state has multiple sub-values, transitions follow rules, or the next state depends on the previous state in non-trivial ways.

## K — Key Concepts

**Anatomy:**

```jsx
const [state, dispatch] = useReducer(reducer, initialState)

// reducer: (state, action) => newState — pure function, same as Redux
function reducer(state, action) {
  switch (action.type) {
    case "increment": return { ...state, count: state.count + 1 }
    case "decrement": return { ...state, count: state.count - 1 }
    case "reset":     return initialState
    default: throw new Error(`Unknown action: ${action.type}`)
  }
}
```

**`useState` vs `useReducer`:**


|  | `useState` | `useReducer` |
| :-- | :-- | :-- |
| Best for | Simple, independent values | Complex, interdependent state |
| Update mechanism | Setter function | Dispatch + action |
| Logic lives | Inline in component | In the reducer (testable in isolation) |
| Multiple fields | Multiple `useState` calls | One object, one dispatch |

**Real-world form example:**

```jsx
const initialState = {
  values: { name: "", email: "", password: "" },
  errors: {},
  status: "idle"   // "idle" | "submitting" | "success" | "error"
}

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, values: { ...state.values, [action.field]: action.value } }
    case "SET_ERROR":
      return { ...state, errors: { ...state.errors, [action.field]: action.message } }
    case "SUBMIT":
      return { ...state, status: "submitting", errors: {} }
    case "SUCCESS":
      return { ...state, status: "success" }
    case "ERROR":
      return { ...state, status: "error", errors: action.errors }
    default:
      return state
  }
}

function SignupForm() {
  const [state, dispatch] = useReducer(formReducer, initialState)

  function handleChange(e) {
    dispatch({ type: "SET_FIELD", field: e.target.name, value: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "SUBMIT" })
    try {
      await registerUser(state.values)
      dispatch({ type: "SUCCESS" })
    } catch (err) {
      dispatch({ type: "ERROR", errors: err.fieldErrors })
    }
  }
  // ...
}
```


## W — Why It Matters

`useReducer` is the right tool when state transitions need to be predictable, testable, and readable — especially for forms, wizards, data-fetching states, and game logic. It also unlocks the **reducer + context** pattern (covered next), which is the React-native alternative to Redux for app-wide state.

## I — Interview Q&A

**Q: When should you use `useReducer` instead of `useState`?**
**A:** When: (1) state has multiple sub-values that change together, (2) the next state depends on the previous in complex ways, (3) state transitions follow explicit rules (like a state machine), or (4) you want to extract and test state logic outside the component.

**Q: What is a "reducer" in React?**
**A:** A pure function `(state, action) => newState` that takes the current state and an action object, and returns the next state without mutating anything. It must be pure — same inputs always produce the same output with no side effects.

**Q: What does `dispatch` do?**
**A:** It sends an action object to the reducer. React calls the reducer with the current state and the dispatched action, gets the new state, and triggers a re-render. Actions conventionally have a `type` string and optional `payload`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating state inside the reducer | Always return a new object — `{ ...state, key: value }` |
| No `default` case in the switch → silent undefined return | Always include `default: return state` or throw for unknown actions |
| Dispatching directly from async code expecting sync updates | Like `useState`, dispatch schedules a re-render — state updates on next render |
| Using `useReducer` for a single simple boolean | `useState` is simpler — use `useReducer` for complex, multi-field state |

## K — Coding Challenge

**Challenge:** Implement a multi-step wizard with `useReducer`:

```
Steps: "personal" → "contact" → "review" → "submitted"
Actions: NEXT, BACK, SET_FIELD, SUBMIT
```

**Solution:**

```jsx
const STEPS = ["personal", "contact", "review"]

const initialState = {
  step: 0,
  fields: { name: "", email: "", phone: "", address: "" },
  submitted: false
}

function wizardReducer(state, action) {
  switch (action.type) {
    case "NEXT":
      return { ...state, step: Math.min(state.step + 1, STEPS.length - 1) }
    case "BACK":
      return { ...state, step: Math.max(state.step - 1, 0) }
    case "SET_FIELD":
      return { ...state, fields: { ...state.fields, [action.field]: action.value } }
    case "SUBMIT":
      return { ...state, submitted: true }
    default:
      return state
  }
}

function Wizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  if (state.submitted) return <p>✅ Submitted! Name: {state.fields.name}</p>

  return (
    <div>
      <p>Step {state.step + 1} of {STEPS.length}: {STEPS[state.step]}</p>
      <input
        placeholder={STEPS[state.step]}
        onChange={e => dispatch({ type: "SET_FIELD", field: STEPS[state.step], value: e.target.value })}
      />
      <button onClick={() => dispatch({ type: "BACK" })} disabled={state.step === 0}>Back</button>
      {state.step < STEPS.length - 1
        ? <button onClick={() => dispatch({ type: "NEXT" })}>Next</button>
        : <button onClick={() => dispatch({ type: "SUBMIT" })}>Submit</button>
      }
    </div>
  )
}
```


***
