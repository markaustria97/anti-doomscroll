# barrel exports

## T — TL;DR
**barrel exports** is a design tool for keeping change local. Use it only when it makes the next edit, test, or review easier.

## K — Key Concepts
- Use **barrel exports** to separate a changing part from a stable part.
- Every abstraction should remove a real source of friction.
- Good names matter as much as the pattern itself.

## W — Why it matters
Architecture topics like **barrel exports** matter when code has to survive change. A small amount of structure can make future edits cheaper and safer.

## I — Interview questions with answers
- **Q:** What problem does barrel exports solve?  
  **A:** Explain the change or testing problem it reduces, not only the definition.
- **Q:** When would you avoid barrel exports?  
  **A:** Avoid it when the abstraction cost is higher than the clarity or testability benefit.

## C — Common pitfalls with fix
- Adding the pattern because it sounds advanced. — **Fix:** point to the exact pain it removes first.
- Hiding simple logic behind too many layers. — **Fix:** keep the abstraction small and named by purpose.

## K — Coding challenge with solution
**Challenge:** Point to the boundary in the example for **barrel exports** and explain why that split helps change or testing.

**Solution:**
```ts
export * from "./user-service"
export * from "./user-types"
```

**Why it works:** This works because the example keeps the abstraction small enough to see what responsibility **barrel exports** is separating.
## Next topic
[naming conventions](10-naming-conventions.md)

## One tiny action
Name one responsibility that **barrel exports** is separating in the example.
