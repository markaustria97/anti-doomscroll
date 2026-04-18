# Intl.DateTimeFormat

## T — TL;DR
**Intl.DateTimeFormat** is a modern JavaScript feature worth learning through behavior, not hype. Aim for one clear mental picture.

## K — Key Concepts
- Name the runtime rule behind **Intl.DateTimeFormat** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **Intl.DateTimeFormat** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for Intl.DateTimeFormat?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with Intl.DateTimeFormat?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **Intl.DateTimeFormat** to explain the rule in your own words.

**Solution:**
```js
new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date())
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[Intl.NumberFormat](18-intl-number-format.md)

## One tiny action
Spend two minutes turning **Intl.DateTimeFormat** into one tiny runnable example.
