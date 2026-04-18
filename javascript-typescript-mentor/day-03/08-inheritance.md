# inheritance

## T — TL;DR
**inheritance** lives in JavaScript's object model. Focus on what gets looked up, delegated, or intercepted at runtime.

## K — Key Concepts
- Name the runtime rule behind **inheritance** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **inheritance** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for inheritance?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with inheritance?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **inheritance** to explain the rule in your own words.

**Solution:**
```js
class Animal { speak() { return "..." } }
class Dog extends Animal { speak() { return "woof" } }
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[Object.create](09-object-create.md)

## One tiny action
Spend two minutes turning **inheritance** into one tiny runnable example.
