# AbortController

## T — TL;DR
**AbortController** makes more sense when you picture a timeline: start work, queue work, resume work, then handle success or failure.

## K — Key Concepts
- Put **AbortController** on a timeline: when does work start, pause, resume, or fail?
- Most async bugs are ordering bugs, forgotten error paths, or missing cancellation.
- The smaller the example, the easier it is to see the queueing rule.

## W — Why it matters
A lot of production bugs come from misunderstanding timing. **AbortController** helps you explain why code that looks simple can still behave later, fail later, or race.

## I — Interview questions with answers
- **Q:** How would you explain AbortController without starting with syntax?  
  **A:** Describe the timeline first: when work begins, when it waits, and when it resumes or fails.
- **Q:** What bug usually appears when people misunderstand AbortController?  
  **A:** Ordering bugs, missed errors, and forgotten cancellation paths are the common ones.

## C — Common pitfalls with fix
- Reading async code as if it runs top to bottom without pausing. — **Fix:** draw a quick timeline of start, wait, resume, and error.
- Ignoring rejection or cancellation paths. — **Fix:** include one failure case in every small example.

## K — Coding challenge with solution
**Challenge:** Trace the example for **AbortController** and explain where execution waits, resumes, or can fail.

**Solution:**
```js
const controller = new AbortController()
fetch(url, { signal: controller.signal })
controller.abort()
```

**Why it works:** This works because it exposes the timing rule behind **AbortController** instead of hiding it inside a large async flow.
## Next topic
[AbortSignal](17-abort-signal.md)

## One tiny action
Draw a 3-step timeline for **AbortController**: start, wait, resume.
