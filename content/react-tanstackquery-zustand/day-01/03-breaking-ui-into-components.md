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

## I — Interview Q&A

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
