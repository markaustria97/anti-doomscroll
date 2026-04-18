# filter

## T — TL;DR
**filter** is easiest when you know three things: what goes in, what comes out, and whether the original array changes.

## K — Key Concepts
- Know exactly what **filter** returns.
- Check whether it creates a new value or changes an existing one.
- Look for the edge case: empty input, missing value, sparse data, or type coercion.

## W — Why it matters
Small data operations like **filter** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for filter?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with filter?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using **filter** without checking the return value. — **Fix:** say the exact return type before you run the code.
- Forgetting edge cases like empty input or missing values. — **Fix:** test one happy path and one awkward path.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **filter**.

**Solution:**
```js
const openTasks = tasks.filter((task) => !task.done)
```

**Why it works:** This works because the example makes the input and output of **filter** obvious enough to reason about before you run it.
## Next topic
[reduce](06-reduce.md)

## One tiny action
Type the example for **filter** once and say the return value out loud before you run it.
