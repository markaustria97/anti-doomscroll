# Result pattern

## T — TL;DR
**Result pattern** is about making data flow and error flow easier to reason about. Start with the smallest useful example.

## K — Key Concepts
- Use **Result pattern** to make flow, transformation, or failure handling more explicit.
- Start with plain data and tiny functions before adding a library abstraction.
- If the idea makes simple code harder to read, scale it back.

## W — Why it matters
Functional ideas like **Result pattern** matter when state, data flow, or error flow starts getting messy. They give you a calmer way to reason about change.

## I — Interview questions with answers
- **Q:** Why would a team use Result pattern?  
  **A:** Because it can make transformation or error flow easier to follow and test.
- **Q:** When does Result pattern become a bad fit?  
  **A:** When it adds ceremony without reducing confusion or duplication.

## C — Common pitfalls with fix
- Turning a simple function into a style exercise. — **Fix:** keep the first version plain and tiny.
- Forgetting the runtime cost of extra indirection. — **Fix:** use the pattern where it clearly improves clarity or safety.

## K — Coding challenge with solution
**Challenge:** Follow the data or error flow in the example for **Result pattern** and explain why it stays predictable.

**Solution:**
```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
```

**Why it works:** This works because the example keeps the transformation or error path linear, which is the main benefit behind **Result pattern**.
## Next topic
[Option pattern](07-option-pattern.md)

## One tiny action
Trace the data through the example for **Result pattern** with your finger or cursor once.
