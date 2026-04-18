# unknown vs any vs never

## T — TL;DR
**unknown vs any vs never** is a choice lesson: learn the safe default, the behavior difference that actually matters, and one exception worth remembering.

## K — Key Concepts
- Start with the default choice in **unknown vs any vs never**, then learn the single case that changes your answer.
- Compare behavior, not just syntax or popularity.
- A 3-line example is usually enough to make the distinction stick.

## W — Why it matters
Questions about **unknown vs any vs never** are common because they reveal whether you understand behavior or only memorized names.

## I — Interview questions with answers
- **Q:** What is the main behavior difference in unknown vs any vs never?  
  **A:** State the default choice first, then name the edge case that would make you choose the other option.
- **Q:** How would you explain unknown vs any vs never quickly in an interview?  
  **A:** Use one sentence for the rule and one tiny example for proof.

## C — Common pitfalls with fix
- Memorizing slogans instead of behavior. — **Fix:** compare the outputs or side effects of one tiny example.
- Choosing by familiarity instead of by requirement. — **Fix:** say what default you prefer and why.

## K — Coding challenge with solution
**Challenge:** Use the example for **unknown vs any vs never** to explain the rule in your own words.

**Solution:**
```ts
let safe: unknown
let escapeHatch: any
function fail(): never { throw new Error("boom") }
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[conditional types](../day-10/01-conditional-types.md)

## One tiny action
Spend two minutes turning **unknown vs any vs never** into one tiny runnable example.
