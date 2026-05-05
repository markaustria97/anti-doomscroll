# 11 — Code Review Practice

## T — TL;DR

Good code review is about correctness + maintainability + knowledge sharing — not style (that's Prettier's job); leave specific, actionable, constructive comments with severity labels so authors know what's blocking vs. what's optional.

## K — Key Concepts

```
── As a reviewer ──────────────────────────────────────────

WHAT to review (in order of importance):
1. Correctness — does it do what it claims? Edge cases? Error handling?
2. Security — injection, auth bypass, sensitive data exposure, secrets
3. Performance — N+1 queries, unnecessary re-renders, missing indexes
4. Design — does the approach fit the architecture? Too complex?
5. Readability — is the intent clear? Are names meaningful?
6. Tests — do they cover the important cases? Are they deterministic?
7. NOT: formatting, indentation, semicolons → let Prettier handle this

COMMENT severity labels (prefix your comment):
[blocking]  Must fix before merge — correctness or security issue
[important] Should fix — significant design concern
[nit]       Minor style preference — author can decide
[question]  Curiosity/learning — not a required change
[praise]    Explicit positive feedback — acknowledge good decisions

Good review comment structure:
❌ "This is wrong"
✅ "[blocking] This function doesn't handle the case where `user` is null
   on line 42. When `fetchUser` returns null (404 case), calling
   `.email` throws. Consider: `if (!user) return res.status(404)...`"

── Review checklist ───────────────────────────────────────
□ Does the PR description explain the why?
□ Is there a linked issue/ticket?
□ Are there tests for the new behavior?
□ Does it handle errors and edge cases?
□ Are there any hardcoded values that should be config?
□ Are secrets/credentials accidentally included?
□ Does the naming clearly communicate intent?
□ Is the change too large to review effectively? (ask to split)

── As a PR author ─────────────────────────────────────────
□ Keep PRs small — under 400 lines of diff is the sweet spot
□ Add context in the description — reviewers can't read your mind
□ Leave self-review comments to guide reviewers: "I'm unsure about this approach — open to suggestions"
□ Respond to every comment — even "done" or "agreed, fixed in abc1234"
□ Don't take review comments personally — the code is reviewed, not you
□ Don't resolve threads you didn't open — let the reviewer confirm
□ Separate refactoring from feature PRs — keeps changes focused
```


## W — Why It Matters

PR size is the single most predictive factor of review quality — research shows that reviewers find fewer defects per line in large PRs (>400 lines) because attention fatigue sets in. Small, focused PRs get faster, higher-quality reviews. The `[nit]` label convention prevents minor preferences from blocking important merges.[^3]

## I — Interview Q&A

**Q: How do you handle a code review where you disagree with the reviewer's feedback?**
A: First, assume positive intent — ask for clarification if you don't understand the concern. Explain your reasoning with specifics ("I chose X because Y, and Z was a concern"). If still in disagreement, suggest a follow-up ticket rather than blocking the PR. Unresolvable design disagreements should be escalated to the team, not argued in PR comments.

**Q: What makes a good commit in a PR when responding to review feedback?**
A: Use `fixup!` or `squash!` prefixes: `git commit -m "fixup! feat(auth): add JWT validation"` — then before merge, `git rebase -i --autosquash` folds them in. Alternatively, separate "fix review feedback" commits make the review diff clear, then squash before merge.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Reviewing style/formatting in code review | Configure Prettier + ESLint in CI — auto-enforce, never manually review |
| PRs >1000 lines — nobody reviews them properly | Break into multiple PRs; use feature flags to merge incomplete features safely |
| Author resolving reviewer's threads before reviewer confirms | Only authors resolve their own threads; let reviewers resolve their own |

## K — Coding Challenge

**Label each review comment correctly:**

```
1. "You're using `==` instead of `===` in the auth check"
2. "I prefer camelCase over snake_case for this variable"
3. "This doesn't validate the JWT expiry — expired tokens will succeed"
4. "Why did you choose this approach over using the existing `parseUser` helper?"
5. "Great use of early returns here — very readable!"
```

**Solution:**

```
1. [blocking] == instead of === in auth — type coercion could bypass check
2. [nit] camelCase preference — author decides
3. [blocking] JWT expiry not validated — security issue, must fix
4. [question] Curious about approach vs existing helper — not required change
5. [praise] Explicit positive feedback — acknowledge good decisions
```


***

> ✅ **Day 11 complete.**
> Your tiny next action: open any repo you're actively working in and run `git log --oneline --graph --all --decorate`. Find the last merge or rebase, identify the tracking branch state with `git branch -vv`, and check if there are stale remote-tracking branches with `git remote show origin`. That 60-second inspection teaches you more about your repo's real state than a week of theory.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches

[^2]: https://git-scm.com/book/ms/v2/Git-Basics-Working-with-Remotes

[^3]: https://github.com/orgs/community/discussions/14866

[^4]: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

[^5]: https://git-scm.com/docs/git-remote

[^6]: https://stackoverflow.com/questions/4693588/what-is-a-tracking-branch

[^7]: https://gist.github.com/71e36acbc3fd506f467e3287cc161135

[^8]: https://www.linkedin.com/pulse/mastering-git-stash-rebase-squash-cherry-pick-reset-revert-r-pkfec

[^9]: https://stackoverflow.com/questions/30986376/how-to-undo-a-successful-git-cherry-pick

[^10]: https://www.youtube.com/watch?v=BBj5CrJBhaI

[^11]: https://stackoverflow.com/questions/9537392/git-fetch-a-remote-branch

[^12]: https://www.reddit.com/r/learnprogramming/comments/z2gsbh/using_git_remotely_what_does_it_mean_to_set_to/

[^13]: https://stackoverflow.com/questions/41352043/is-there-any-difference-between-applying-stashed-changes-and-cherry-picking-cha

[^14]: https://dev.to/ruqaiya_beguwala/git-branch-a-git-remote-show-origin-inspecting-remote-branches-10o2

[^15]: https://dev.to/elayaraj31/day-5-git-rebase-git-stash-git-cherry-pick-2l06
