# 1 — Git Mental Model: The Snapshot Model & Distributed Version Control

## T — TL;DR

Git stores **snapshots** of your entire project at each commit — not diffs; every developer has the complete repository history locally, making most operations instant and offline-capable.

## K — Key Concepts

```
── Snapshot model (not delta model) ──────────────────────

Most VCS (SVN, CVS) store DIFFS: what changed between versions.
Git stores SNAPSHOTS: the full state of all files at each commit.

Commit A:  [file1.js: "v1",  file2.js: "v1"]
Commit B:  [file1.js: "v2",  file2.js: "v1"]  ← file1 changed, file2 reused
Commit C:  [file1.js: "v2",  file2.js: "v2"]

Git reuses unchanged files (same content = same blob hash).
No file is duplicated — just pointer reuse. Storage is efficient.

── The three areas ────────────────────────────────────────

Working Directory  →  Staging Area (Index)  →  Repository (.git)
   (files on disk)      (next commit draft)       (all history)

git add  →  moves changes from Working Directory to Staging Area
git commit  →  snapshots the Staging Area into the Repository

── Distributed model ──────────────────────────────────────

Centralized (SVN):   Developer ──→ Central Server (single source of truth)
Distributed (Git):   Developer has FULL COPY of repo locally
                     Push/pull with any remote, not just one

Benefits:
- git log, git diff, git blame = instant (no network)
- Full history available offline
- Any repo can be a remote for another
- No single point of failure

── Key git terminology ───────────────────────────────────

HEAD       → pointer to the current commit (or current branch)
Branch     → named pointer to a commit (moves forward with commits)
Remote     → another repository (typically on GitHub/GitLab)
origin     → default name for the remote you cloned from
upstream   → the source repo when you've forked
Index      → another name for the Staging Area
```


## W — Why It Matters

Understanding the snapshot model explains why Git is fast — there's no "reconstruct from diffs" operation; any commit's state is directly accessible by its hash. Understanding the three areas (working/staging/repo) explains every git command: each one moves changes between these areas or reads from them.[^5][^1]

## I — Interview Q&A

**Q: How is Git's storage model different from SVN?**
A: SVN stores deltas (what changed). Git stores snapshots (full project state per commit), with content deduplication through hashing — identical file contents share the same blob object. Git snapshots feel expensive but are efficient because unchanged files are reused by hash.[^1]

**Q: What does "distributed" mean in Git's context?**
A: Every developer clones the complete repository — full history, all branches, all objects. Operations like `log`, `diff`, `blame`, `rebase` are local. You're not forced to push/pull for every action. Multiple remotes can coexist; there's no architectural central server, just social convention.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Thinking `git add` saves to the repo | `add` → staging area only; `commit` → repository |
| Confusing "remote" with "origin" | `origin` is just the default name for the first remote; you can have many remotes |
| Treating HEAD as always pointing to a branch | HEAD can point directly to a commit (detached HEAD state) |

## K — Coding Challenge

**Name the git area each command interacts with:**

```bash
git add file.js       # __ → __
git commit -m "msg"   # __ → __
git checkout -- file.js  # __ → __
git stash             # saves __ and resets to __
```

**Solution:**

```bash
git add file.js          # Working Directory → Staging Area
git commit -m "msg"      # Staging Area → Repository
git checkout -- file.js  # Repository/Index → Working Directory (discards changes)
git stash                # saves Working Dir + Staging Area, resets to HEAD
```


***
