# Symbol.iterator

## T — TL;DR
**Symbol.iterator** is a modern JavaScript feature worth learning through behavior, not hype. Aim for one clear mental picture.

## K — Key Concepts
- Name the runtime rule behind **Symbol.iterator** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **Symbol.iterator** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for Symbol.iterator?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with Symbol.iterator?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **Symbol.iterator** to explain the rule in your own words.

**Solution:**
```js
const range = {
  *[Symbol.iterator]() {
    yield 1
    yield 2
  }
}
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[Symbol.toPrimitive](08-symbol-to-primitive.md)

## One tiny action
Spend two minutes turning **Symbol.iterator** into one tiny runnable example.
