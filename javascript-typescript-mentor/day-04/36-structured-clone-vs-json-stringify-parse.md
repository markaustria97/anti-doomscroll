# structuredClone vs JSON stringify/parse

## T — TL;DR
**structuredClone vs JSON stringify/parse** is a choice lesson: learn the safe default, the behavior difference that actually matters, and one exception worth remembering.

## K — Key Concepts
- Start with the default choice in **structuredClone vs JSON stringify/parse**, then learn the single case that changes your answer.
- Compare behavior, not just syntax or popularity.
- A 3-line example is usually enough to make the distinction stick.

## W — Why it matters
Questions about **structuredClone vs JSON stringify/parse** are common because they reveal whether you understand behavior or only memorized names.

## I — Interview questions with answers
- **Q:** What is the main behavior difference in structuredClone vs JSON stringify/parse?  
  **A:** State the default choice first, then name the edge case that would make you choose the other option.
- **Q:** How would you explain structuredClone vs JSON stringify/parse quickly in an interview?  
  **A:** Use one sentence for the rule and one tiny example for proof.

## C — Common pitfalls with fix
- Memorizing slogans instead of behavior. — **Fix:** compare the outputs or side effects of one tiny example.
- Choosing by familiarity instead of by requirement. — **Fix:** say what default you prefer and why.

## K — Coding challenge with solution
**Challenge:** Use the example for **structuredClone vs JSON stringify/parse** to explain the rule in your own words.

**Solution:**
```js
const original = { when: new Date(), nested: { ok: true } }
const cloned = structuredClone(original)
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[for...of vs for...in](37-for-of-vs-for-in.md)

## One tiny action
Spend two minutes turning **structuredClone vs JSON stringify/parse** into one tiny runnable example.
