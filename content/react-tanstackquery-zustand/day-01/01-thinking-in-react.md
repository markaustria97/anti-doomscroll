# 1 — Thinking in React

## T — TL;DR

Build React UIs by starting from the data model, breaking UI into a component hierarchy, and letting data flow in one direction — top down.

## K — Key Concepts

**The 5-Step Mental Model**

1. Break the UI into a component hierarchy
2. Build a static version first (no state yet)
3. Identify the minimal complete representation of UI state
4. Identify where state should live
5. Add inverse data flow (lifting state up)

**One-way data flow** means data flows *down* from parent → child via props. Children cannot directly modify parent state — they must call a callback passed as a prop.

## W — Why It Matters

This mental model prevents you from over-engineering state too early. Developers who skip "Thinking in React" often scatter state everywhere, making apps hard to debug. Every React interview assumes you understand component-driven architecture.

## I — Interview Q&A

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
