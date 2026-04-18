# SOLID principles

## T — TL;DR
**SOLID principles** is a design tool for keeping change local. Use it only when it makes the next edit, test, or review easier.

## K — Key Concepts
- Use **SOLID principles** to separate a changing part from a stable part.
- Every abstraction should remove a real source of friction.
- Good names matter as much as the pattern itself.

## W — Why it matters
Architecture topics like **SOLID principles** matter when code has to survive change. A small amount of structure can make future edits cheaper and safer.

## I — Interview questions with answers
- **Q:** What problem does SOLID principles solve?  
  **A:** Explain the change or testing problem it reduces, not only the definition.
- **Q:** When would you avoid SOLID principles?  
  **A:** Avoid it when the abstraction cost is higher than the clarity or testability benefit.

## C — Common pitfalls with fix
- Adding the pattern because it sounds advanced. — **Fix:** point to the exact pain it removes first.
- Hiding simple logic behind too many layers. — **Fix:** keep the abstraction small and named by purpose.

## K — Coding challenge with solution
**Challenge:** Point to the boundary in the example for **SOLID principles** and explain why that split helps change or testing.

**Solution:**
```txt
S: single responsibility
O: open/closed
L: Liskov substitution
I: interface segregation
D: dependency inversion
```

**Why it works:** This works because the example keeps the abstraction small enough to see what responsibility **SOLID principles** is separating.
## Next topic
[project structure](08-project-structure.md)

## One tiny action
Name one responsibility that **SOLID principles** is separating in the example.
