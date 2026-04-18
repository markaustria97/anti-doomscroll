# for...of vs for...in

## T — TL;DR
**for...of vs for...in** is a choice lesson: learn the safe default, the behavior difference that actually matters, and one exception worth remembering.

## K — Key Concepts
- Start with the default choice in **for...of vs for...in**, then learn the single case that changes your answer.
- Compare behavior, not just syntax or popularity.
- A 3-line example is usually enough to make the distinction stick.

## W — Why it matters
Questions about **for...of vs for...in** are common because they reveal whether you understand behavior or only memorized names.

## I — Interview questions with answers
- **Q:** What is the main behavior difference in for...of vs for...in?  
  **A:** State the default choice first, then name the edge case that would make you choose the other option.
- **Q:** How would you explain for...of vs for...in quickly in an interview?  
  **A:** Use one sentence for the rule and one tiny example for proof.

## C — Common pitfalls with fix
- Memorizing slogans instead of behavior. — **Fix:** compare the outputs or side effects of one tiny example.
- Choosing by familiarity instead of by requirement. — **Fix:** say what default you prefer and why.

## K — Coding challenge with solution
**Challenge:** Use the example for **for...of vs for...in** to explain the rule in your own words.

**Solution:**
```js
for (const value of ["a", "b"]) console.log(value)
for (const key in { a: 1, b: 2 }) console.log(key)
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[Map](38-map.md)

## One tiny action
Spend two minutes turning **for...of vs for...in** into one tiny runnable example.
