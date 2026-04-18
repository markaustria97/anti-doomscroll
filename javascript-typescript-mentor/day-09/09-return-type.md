# ReturnType

## T — TL;DR
**ReturnType** helps TypeScript describe what values are allowed before runtime. Use it to make assumptions explicit, not magical.

## K — Key Concepts
- Keep **ReturnType** aligned with runtime truth.
- Prefer readable types over clever ones that teammates cannot explain.
- If data comes from outside your code, pair types with runtime validation.

## W — Why it matters
TypeScript is most useful when it prevents bad assumptions early. **ReturnType** helps you move mistakes into the editor instead of discovering them through runtime bugs.

## I — Interview questions with answers
- **Q:** When is ReturnType actually helpful?  
  **A:** When it makes an invariant clearer and reduces unsafe assumptions in real code.
- **Q:** What is the danger of overusing ReturnType?  
  **A:** You can create types that look impressive but hide runtime uncertainty or confuse the team.

## C — Common pitfalls with fix
- Using types to hide uncertainty instead of model it. — **Fix:** keep unknown data unknown until you validate or narrow it.
- Making **ReturnType** too clever. — **Fix:** choose the simpler type that your future self can explain quickly.

## K — Coding challenge with solution
**Challenge:** Read the example for **ReturnType** and say which unsafe assumption became explicit.

**Solution:**
```ts
function makeUser() { return { id: "1", name: "Ada" } }
type User = ReturnType<typeof makeUser>
```

**Why it works:** This works because **ReturnType** is easiest to trust when the type rule and the runtime story match.
## Next topic
[Parameters](10-parameters.md)

## One tiny action
Read the example for **ReturnType** and name the exact value or shape that became safer.
