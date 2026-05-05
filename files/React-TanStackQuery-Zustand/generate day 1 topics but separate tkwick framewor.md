<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 1 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 1	React Foundations
Thinking in React, UI as a tree, breaking UI into components, component purity, JSX rules, embedding JavaScript in JSX, props, rendering data, conditional rendering, list rendering, stable keys

Here is the complete **Day 1 — React Foundations** learning plan, with a full T-KWICK section for each subtopic. Each section is designed to be completed in 5–15 minutes.[^1][^2][^3]

***

# Day 1 — React Foundations

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Start the timer. Go.

***

# 1 — Thinking in React

## T — TL;DR

Build React UIs by starting from the data model, breaking UI into a component hierarchy, and letting data flow in one direction — top down.[^1]

## K — Key Concepts

**The 5-Step Mental Model**[^4]

1. Break the UI into a component hierarchy
2. Build a static version first (no state yet)
3. Identify the minimal complete representation of UI state
4. Identify where state should live
5. Add inverse data flow (lifting state up)

**One-way data flow** means data flows *down* from parent → child via props. Children cannot directly modify parent state — they must call a callback passed as a prop.[^1]

## W — Why It Matters

This mental model prevents you from over-engineering state too early. Developers who skip "Thinking in React" often scatter state everywhere, making apps hard to debug. Every React interview assumes you understand component-driven architecture.[^4]

## I — Interview Q\&A

**Q: What does "thinking in React" mean?**
**A:** It's a 5-step methodology: decompose the UI into components, build static first, identify minimal state, decide where state lives, then wire up data flow. The key insight is that React data flows *one way* — from parent to child.

**Q: Why build a static version before adding state?**
**A:** It forces you to clearly separate *what renders* from *what changes*. Static versions use only props, making the component structure clean before introducing complexity.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Adding state to every component immediately | Build static first; add state only when needed |
| Putting state in the wrong component | Find the *lowest common ancestor* of all components that need it |
| Skipping the component hierarchy step | Draw it on paper first — seriously |

## K — Coding Challenge

**Challenge:** Given this data, sketch the component hierarchy:

```js
const products = [
  { category: "Fruits", price: "$1", name: "Apple" },
  { category: "Fruits", price: "$2", name: "Dragonfruit" },
  { category: "Vegetables", price: "$3", name: "Spinach" },
]
```

**Solution:**

```
<FilterableProductTable>        ← owns search + filter state
  <SearchBar />                 ← receives filterText, onFilterChange
  <ProductTable>                ← receives products + filterText
    <ProductCategoryRow />      ← receives category
    <ProductRow />              ← receives product
  </ProductTable>
</FilterableProductTable>
```


***

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

## I — Interview Q\&A

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

# 3 — Breaking UI into Components

## T — TL;DR

A component should do one thing — if it does more, break it apart.[^1]

## K — Key Concepts

**Three heuristics for splitting components:**[^1]

1. **Single Responsibility Principle** — one component, one concern
2. **CSS class selector intuition** — if you'd give it a class, it might be a component
3. **Data model alignment** — components should map naturally to your data shapes

**Component granularity spectrum:**

```
Too coarse:             Too fine:             Just right:
<EntirePage />    vs.   <SingleLetter />  vs.  <UserCard />
```


## W — Why It Matters

Poorly split components become unmaintainable fast. Good decomposition = reusability, testability, and readability. In large teams, small well-scoped components are independently developable.[^5]

## I — Interview Q\&A

**Q: How do you decide when to create a new component?**
**A:** Apply the Single Responsibility Principle — if a component handles more than one concern or grows too large, decompose it. Also split when reuse is needed across multiple places in the UI.

**Q: Can a component contain another component?**
**A:** Yes — this is composition. Components render other components in their JSX. The outer component is the parent; the inner is the child. The parent passes data down via props.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Making one giant component for a whole feature | Split by responsibility; each piece owns one visual or logical unit |
| Making components too small (over-splitting) | Only extract when there's reuse or complexity — don't split prematurely |
| Mixing data-fetching with UI rendering | Separate container components (fetch data) from presentational ones (render UI) |

## K — Coding Challenge

**Challenge:** Refactor this into proper components:

```jsx
// BAD
function Page() {
  return (
    <div>
      <div><img src="logo.png" /><nav>...</nav></div>
      <div><h1>Welcome</h1><p>Subtitle</p></div>
      <div>© 2026</div>
    </div>
  )
}
```

**Solution:**

```jsx
function Header() { return <div><img src="logo.png" /><nav>...</nav></div> }
function Hero() { return <div><h1>Welcome</h1><p>Subtitle</p></div> }
function Footer() { return <div>© 2026</div> }

function Page() {
  return <div><Header /><Hero /><Footer /></div>
}
```


***

# 4 — Component Purity

## T — TL;DR

A pure component always returns the same JSX for the same inputs — no side effects during render.[^3]

## K — Key Concepts

**Pure function rules applied to React:**[^3]

- **Same inputs → same output** (idempotent)
- **No side effects during render** (no DOM mutation, no network calls, no modifying external variables)
- **Props and state are read-only snapshots** — never mutate them directly

```jsx
// ✅ Pure — same props always give same output
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>
}

// ❌ Impure — reads from external mutable variable
let count = 0
function Counter() {
  count++ // side effect during render!
  return <p>{count}</p>
}
```

React's **Strict Mode** renders components twice in development to help detect impure components.[^3]

## W — Why It Matters

Purity enables React's optimizations — concurrent rendering, `React.memo`, and future compiler optimizations all depend on components being pure. Impure components cause subtle, hard-to-reproduce bugs.[^3]

## I — Interview Q\&A

**Q: What is a pure component in React?**
**A:** A component that, given the same props and state, always returns the same JSX — with no side effects during render. It's predictable, testable, and safe for React to re-render anytime.

**Q: Where should side effects go if not in render?**
**A:** In `useEffect` (for effects after render), event handlers (for user interactions), or server-side code. Never directly in the render body.

**Q: What does React Strict Mode do?**
**A:** It intentionally double-invokes render functions in development to surface impurity bugs — if a component is pure, running it twice produces the same output.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating props directly (`props.count++`) | Treat props as read-only; derive new values without mutating |
| Calling `fetch()` directly in the component body | Move data fetching to `useEffect` or server components |
| Using `Math.random()` or `Date.now()` in render | Pass them as props or compute once in an effect |

## K — Coding Challenge

**Challenge:** Find and fix the impurity:

```jsx
const results = []

function SearchResult({ query }) {
  results.push(query) // track queries
  return <p>Results for: {query}</p>
}
```

**Solution:**

```jsx
// The mutation of external `results` array is a side effect.
// Fix: move tracking to an event handler or useEffect

function SearchResult({ query }) {
  useEffect(() => {
    results.push(query) // ✅ side effect in effect, not render
  }, [query])

  return <p>Results for: {query}</p>
}
```


***

# 5 — JSX Rules

## T — TL;DR

JSX is syntactic sugar for `React.createElement()` — it has strict rules because it compiles to JavaScript.[^6]

## K — Key Concepts

**Core JSX rules:**

1. **Return a single root element** — wrap siblings in `<div>` or `<>` (Fragment)
```
2. **Close all tags** — self-close void elements: `<img />`, `<br />`, `<input />`
```

3. **Use camelCase for attributes** — `class` → `className`, `for` → `htmlFor`, `onclick` → `onClick`
4. **JavaScript expressions go in `{}`** — not statements
5. **`null`, `false`, `undefined` render nothing** — useful for conditional rendering
```jsx
// ✅ Valid JSX
function Card({ title, image }) {
  return (
    <>
      <h2 className="title">{title}</h2>
      <img src={image} alt={title} />
    </>
  )
}

// ❌ Invalid — multiple root elements
function Bad() {
  return (
    <h1>Title</h1>
    <p>Subtitle</p>
  )
}
```


## W — Why It Matters

JSX errors are some of the most common beginner mistakes and most cryptic compiler errors. Knowing the rules means you spend zero time debugging syntax and more time building features.[^6]

## I — Interview Q\&A

**Q: What is JSX?**
**A:** JSX is a syntax extension for JavaScript that lets you write HTML-like code in JS files. It compiles to `React.createElement()` calls. It's not HTML — it's closer to JavaScript with stricter rules.

**Q: Why do we use `className` instead of `class` in JSX?**
**A:** Because JSX compiles to JavaScript, and `class` is a reserved keyword in JS. React uses `className` to set the DOM `class` attribute.

**Q: What is a Fragment and why use it?**
**A:** `<>...</>` or `<React.Fragment>` lets you return multiple elements without adding an extra DOM node. Use it to avoid unnecessary wrapper `<div>` elements that can break CSS layouts.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting to close self-closing tags (`<img>`) | Always write `<img />` in JSX |
| Using `class` instead of `className` | Remember: JSX ≠ HTML — use `className` |
| Returning multiple sibling elements without a wrapper | Wrap in `<>...</>` Fragment |
| Putting `if` statements inside JSX `{}` | Use ternary `? :` or `&&` inside JSX; move `if` outside the return |

## K — Coding Challenge

**Challenge:** Fix all JSX errors:

```jsx
function Profile() {
  return (
    <div class="profile">
      <img src="photo.jpg">
      <h1>Jane Doe</h1>
      <p>Engineer</p>
    </div>
    <footer>© 2026</footer>
  )
}
```

**Solution:**

```jsx
function Profile() {
  return (
    <>                               {/* ✅ Fragment wraps two root elements */}
      <div className="profile">     {/* ✅ className, not class */}
        <img src="photo.jpg" />     {/* ✅ self-closing tag */}
        <h1>Jane Doe</h1>
        <p>Engineer</p>
      </div>
      <footer>© 2026</footer>
    </>
  )
}
```


***

# 6 — Embedding JavaScript in JSX

## T — TL;DR

Use `{}` to escape into JavaScript anywhere inside JSX — for values, expressions, and dynamic attributes.[^6]

## K — Key Concepts

**Two ways to use `{}`:**

1. **As text content** — `<h1>{user.name}</h1>`
2. **As attribute values** — `<img src={user.avatar} />`

**What can go inside `{}`:**

```jsx
// ✅ Variables
<p>{message}</p>

// ✅ Expressions
<p>{price * quantity}</p>

// ✅ Function calls
<p>{formatDate(createdAt)}</p>

// ✅ Ternary
<p>{isLoggedIn ? "Welcome" : "Please log in"}</p>

// ✅ Template literals
<p>{`Hello, ${name}!`}</p>

// ❌ Statements (if, for, while) — NOT allowed directly
<p>{if (x) { ... }}</p>  // SyntaxError
```

**Double curlies `{{}}` for inline styles** — outer `{}` is JSX escape, inner `{}` is a JavaScript object:

```jsx
<div style={{ backgroundColor: "blue", fontSize: 16 }}>Hello</div>
```


## W — Why It Matters

Everything dynamic in a React UI flows through `{}`. Mastering this syntax is the foundation of building any real React interface — conditionals, loops, formatting, and event bindings all use it.[^6]

## I — Interview Q\&A

**Q: What can you put inside JSX curly braces `{}`?**
**A:** Any valid JavaScript *expression* — variables, arithmetic, function calls, ternaries, template literals, and method calls. You cannot put statements (like `if`, `for`, `while`) directly inside `{}`.

**Q: What does `{{ }}` mean in JSX?**
**A:** The outer `{}` escapes into JavaScript; the inner `{}` is a JavaScript object literal. It's commonly used for inline `style` props.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Trying to use `if` inside `{}` | Use ternary `condition ? a : b` or move `if` before the return |
| Forgetting `{}` around dynamic attribute values | `src={url}` not `src="url"` — the latter is a literal string |
| Using `{{ }}` when only one value is needed | Only use double curlies for objects (e.g., style); use single `{}` for strings/numbers |

## K — Coding Challenge

**Challenge:** Fix the JSX to render correctly:

```jsx
function ProductCard({ name, price, discount, imageUrl }) {
  return (
    <div style="background: white; padding: 16px">
      <img src="imageUrl" alt="name" />
      <h2>name</h2>
      <p>Final price: price * (1 - discount)</p>
    </div>
  )
}
```

**Solution:**

```jsx
function ProductCard({ name, price, discount, imageUrl }) {
  return (
    <div style={{ background: "white", padding: 16 }}>   {/* ✅ style as object */}
      <img src={imageUrl} alt={name} />                  {/* ✅ dynamic attributes */}
      <h2>{name}</h2>                                     {/* ✅ dynamic content */}
      <p>Final price: {price * (1 - discount)}</p>       {/* ✅ expression in {} */}
    </div>
  )
}
```


***

# 7 — Props

## T — TL;DR

Props are the read-only inputs passed from parent to child — they are how components communicate.[^6]

## K — Key Concepts

**Props basics:**

```jsx
// Parent passes props
<UserCard name="Jane" age={28} isAdmin={true} />

// Child receives props
function UserCard({ name, age, isAdmin }) {
  return <p>{name} — {isAdmin ? "Admin" : "User"}</p>
}
```

**Key prop behaviors:**[^6]

- Props are **read-only** — never mutate `props` directly
- Any value can be a prop: strings, numbers, booleans, arrays, objects, functions, JSX
- **Default props** via destructuring defaults: `function Card({ title = "Untitled" })`
- **Spread props**: `<Component {...propsObject} />` — useful but use carefully
- **`children` prop**: content between opening/closing tags is passed as `props.children`

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// Usage
<Card title="Profile">
  <p>This becomes props.children</p>
</Card>
```


## W — Why It Matters

Props are the primary mechanism of React's component model. Every pattern — composition, render props, compound components — is built on props. Understanding them deeply means you can design flexible, reusable component APIs.[^6]

## I — Interview Q\&A

**Q: What are props in React?**
**A:** Props (short for properties) are read-only inputs passed from a parent component to a child. They allow components to be dynamic and reusable. A child component cannot modify its own props.

**Q: What is `props.children`?**
**A:** It's the content nested between a component's opening and closing tags in JSX. It lets you build wrapper/container components that render arbitrary inner content.

**Q: Can you pass a function as a prop?**
**A:** Yes — this is the primary pattern for child-to-parent communication. The parent passes a callback function as a prop; the child calls it when an event occurs.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating props directly (`props.name = "x"`) | Props are immutable — use state for mutable data |
| Passing too many props (prop drilling) | Lift shared state up or use Context for deeply nested data |
| Forgetting boolean shorthand | `<Button disabled={true} />` = `<Button disabled />` |

## K — Coding Challenge

**Challenge:** Build a `Button` component that accepts `label`, `onClick`, `variant` ("primary"/"secondary"), and defaults to "primary":

```jsx
// Should work like:
<Button label="Save" onClick={handleSave} />
<Button label="Cancel" onClick={handleCancel} variant="secondary" />
```

**Solution:**

```jsx
function Button({ label, onClick, variant = "primary" }) {
  const styles = {
    primary: { backgroundColor: "blue", color: "white" },
    secondary: { backgroundColor: "gray", color: "white" },
  }

  return (
    <button onClick={onClick} style={styles[variant]}>
      {label}
    </button>
  )
}
```


***

# 8 — Rendering Data

## T — TL;DR

Use JavaScript's `map()` inside JSX to transform arrays of data into arrays of JSX elements.[^7]

## K — Key Concepts

**The core pattern:**

```jsx
const users = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "Editor" },
]

function UserList() {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} — {user.role}
        </li>
      ))}
    </ul>
  )
}
```

**Key rendering patterns:**

```jsx
// Rendering objects
{users.map(u => <UserCard key={u.id} {...u} />)}

// Rendering with index (only when no stable ID exists)
{items.map((item, i) => <li key={i}>{item}</li>)}

// Filtering before rendering
{users.filter(u => u.active).map(u => <UserRow key={u.id} user={u} />)}
```


## W — Why It Matters

Almost every real app renders dynamic data from APIs. The `map()` → JSX pattern is used in every React codebase, every day. Getting comfortable with chaining `.filter().map()` makes you effective immediately.[^7]

## I — Interview Q\&A

**Q: How do you render a list in React?**
**A:** Use JavaScript's `map()` method inside JSX to transform an array of data into an array of JSX elements. Each element must have a unique `key` prop.

**Q: Can you use `forEach` instead of `map` to render lists?**
**A:** No. `forEach` doesn't return a value. `map` returns a new array of JSX elements, which React can render. Always use `map` (or `flatMap`, `reduce`) for rendering.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `forEach` instead of `map` | `map` returns a new array — `forEach` returns `undefined` |
| Forgetting the `key` prop | Always add `key` — React warns and performance suffers |
| Rendering objects directly `{user}` | Objects are not valid React children — access specific properties |

## K — Coding Challenge

**Challenge:** Render only the active users with their name and email:

```js
const users = [
  { id: 1, name: "Alice", email: "a@test.com", active: true },
  { id: 2, name: "Bob", email: "b@test.com", active: false },
  { id: 3, name: "Carol", email: "c@test.com", active: true },
]
```

**Solution:**

```jsx
function ActiveUsers({ users }) {
  return (
    <ul>
      {users
        .filter(user => user.active)
        .map(user => (
          <li key={user.id}>
            {user.name} — {user.email}
          </li>
        ))}
    </ul>
  )
}
```


***

# 9 — Conditional Rendering

## T — TL;DR

Conditionally render JSX using `if`, ternary `? :`, or logical `&&` — choose based on complexity.[^8]

## K — Key Concepts

**Three patterns ranked by use case:**

```jsx
// 1. if/else — for complex logic BEFORE the return
function Status({ isLoggedIn }) {
  if (isLoggedIn) return <Dashboard />
  return <LoginPage />
}

// 2. Ternary — for inline either/or in JSX
function Greeting({ name }) {
  return <h1>{name ? `Hello, ${name}` : "Hello, stranger"}</h1>
}

// 3. Logical && — for show/hide (no else case)
function Notifications({ count }) {
  return <div>{count > 0 && <Badge count={count} />}</div>
}
```

**The `&&` gotcha — falsy zero:**

```jsx
// ❌ Bug: renders "0" when count is 0
{count && <Badge />}

// ✅ Fix: use explicit boolean
{count > 0 && <Badge />}
{!!count && <Badge />}
```


## W — Why It Matters

Conditional rendering is in every React component. The `&&` zero bug is a classic interview trap and a real production bug. Knowing which pattern to reach for keeps code readable and avoids subtle bugs.[^8]

## I — Interview Q\&A

**Q: What are the ways to conditionally render in React?**
**A:** Three main patterns: `if`/`else` before the return (for complex conditions), ternary `? :` for inline either/or, and logical `&&` for show/hide. Returning `null` from a component renders nothing.

**Q: What is the `&&` zero bug in React?**
**A:** If the left side of `&&` is `0` (a falsy number), React renders `0` — not nothing. The fix is to ensure the left side is a boolean: `count > 0 && <Badge />`.

**Q: How do you prevent a component from rendering?**
**A:** Return `null` from the component. It renders nothing and doesn't affect the component lifecycle.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `{count && <X />}` renders `0` | Use `{count > 0 && <X />}` |
| Deeply nested ternaries | Extract into a variable or helper function |
| Using `if` inside JSX `{}` | Move `if` before return, or use ternary inline |

## K — Coding Challenge

**Challenge:** What does this render when `items = []`? Fix the bug:

```jsx
function List({ items }) {
  return (
    <div>
      {items.length && <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>}
    </div>
  )
}
```

**Solution:**

```jsx
// When items = [], items.length = 0 → renders "0" in the DOM — a bug!

// Fix:
function List({ items }) {
  return (
    <div>
      {items.length > 0 && (
        <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
      )}
    </div>
  )
}
// When items = [], renders nothing. ✅
```


***

# 10 — List Rendering \& Stable Keys

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

## I — Interview Q\&A

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

