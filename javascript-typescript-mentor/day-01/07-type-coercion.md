# type coercion

## T — TL;DR
Type coercion is JavaScript converting one type into another. It is safest when you make the conversion obvious instead of hoping the language guesses what you meant.

## K — Key Concepts
- JavaScript sometimes converts values implicitly during comparison or arithmetic.
- `+` is special because it can do string concatenation or numeric addition.
- Explicit conversion is usually easier to read than relying on implicit rules.

## W — Why it matters
If a value changes type without you noticing, bugs become hard to trace. Learning coercion helps you predict those changes instead of treating them like magic.

## I — Interview questions with answers
- **Q:** Is type coercion always bad?  
  **A:** No. It is fine when the conversion is obvious and intentional, but risky when it is hidden.
- **Q:** Why is `'5' + 1` different from `'5' - 1`?  
  **A:** `+` can concatenate strings, while `-` always tries numeric conversion.

## C — Common pitfalls with fix
- Relying on coercion in comparisons. — **Fix:** normalize values first, then compare.
- Forgetting that empty strings, `0`, and `null` behave differently in different conversions. — **Fix:** test the exact case instead of guessing.

## K — Coding challenge with solution
**Challenge:** Convert a string input into a number before adding.

**Solution:**
```js
const input = '5'
const total = Number(input) + 1
console.log(total) // 6
```

**Why it works:** `Number(input)` makes the conversion explicit, so `+` performs numeric addition instead of string concatenation.

## Next topic
[typeof](08-typeof.md)

## One tiny action
Take one value like `'5'` or `null` and predict what it becomes as a number.
