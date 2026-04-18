# Record

## TL;DR
Record is a built-in TypeScript utility type for transforming an existing type instead of rewriting it by hand. The important questions are what it changes, whether the transformation is shallow, and how it affects downstream APIs. Utility types make refactors safer and show up often in real code reviews.

## Key Concepts
- Record derives a new type from an existing type instead of repeating shape information.
- Most utility types are shallow transforms, so nested objects keep their inner shapes.
- They are best when you want one source of truth for a model and several safe variations of it.
- Think about assignability and optionality, not runtime output.

## Why It Matters
Record matters because duplicated type shapes drift over time. Utility types let you express variations like patches, projections, and derived results while keeping one source of truth for the underlying model.

## Syntax / Example
```ts
type Scores = Record<string, number>
```

## Common Pitfalls
- Forgetting that many utility types are shallow, not deep, transformations.
- Using a derived type where a dedicated domain type would communicate intent better.
- Assuming the transformed type says anything about runtime validation.

## Interview Angle
- **Q:** What does Record transform?  
  **A:** Explain the input type, the output type, and whether the transformation is shallow.
- **Q:** When would you avoid Record?  
  **A:** Avoid it when a dedicated domain type communicates intent more clearly than a generic transform.

## Mini Challenge
Derive one new type from an existing model with Record.

## Mini Challenge Solution
A correct solution starts from a base type, applies the utility type, and explains what changed in the resulting shape.

## Related Topics
- Previous: [Omit](07-omit.md)
- Next: [ReturnType](09-return-type.md)
