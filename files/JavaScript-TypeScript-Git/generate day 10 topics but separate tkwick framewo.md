<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 10 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 10
Git Foundations, History \& Recovery
Git mental model, snapshot model, blob/tree/commit/tag objects, distributed version control, git config scopes, git init, git clone, shallow clone, status, short status, log formats and filters, git show, staging area, git add, git add -p, commit, amend, no-verify, rm, mv, clean with dry-run, .gitignore, .gitkeep, .gitattributes, SSH setup, branch, checkout, switch, merge, fast-forward, three-way merge, squash merge, rebase, interactive rebase, HEAD references, detached HEAD, reflog, recovering lost commits.

Here is **Day 10 — Git Foundations, History \& Recovery** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 10 — Git Foundations, History \& Recovery

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the commands. Move on.

***

# 1 — Git Mental Model: The Snapshot Model \& Distributed Version Control

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

## I — Interview Q\&A

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

# 2 — Git Object Model: Blob, Tree, Commit, Tag

## T — TL;DR

Git is a content-addressable filesystem — every object (blob, tree, commit, tag) is stored by the SHA-1 hash of its content; identical content always produces the same hash, enabling deduplication.[^2][^1]

## K — Key Concepts

```
── Four Git object types ──────────────────────────────────

BLOB — stores file content (no filename, no permissions)
├── Content of "hello.js" → SHA: a1b2c3...
└── Same content in two files = one blob, two tree references

TREE — stores directory structure (filename + permissions + blob/subtree SHA)
├── 100644 README.md      → blob: d1e2f3
├── 100644 src/index.js   → blob: a1b2c3
└── 040000 src/           → tree: e4f5a6  (nested directory = nested tree)

COMMIT — stores snapshot metadata
├── tree:   e4f5a6...   (root tree for this snapshot)
├── parent: 9b8c7d...   (previous commit SHA)
├── author: Alice <alice@a.com> 1714928400 +0000
├── committer: Alice <alice@a.com> 1714928400 +0000
└── message: "Add user authentication"

TAG — annotated tag (points to any object, usually a commit)
├── object:  abc123...  (the commit being tagged)
├── type:    commit
├── tag:     v1.0.0
├── tagger:  Alice <alice@a.com>
└── message: "Release version 1.0.0"

── Inspect objects manually ──────────────────────────────

git cat-file -t abc123      # show object type (blob/tree/commit/tag)
git cat-file -p abc123      # pretty-print object content

# Example outputs:
$ git cat-file -p HEAD        # show current commit
tree 9e4f...
parent ab12...
author Alice <a@a.com> 1714928400 +0000
committer Alice <a@a.com> 1714928400 +0000

Initial commit

$ git cat-file -p HEAD^{tree}  # show root tree
100644 blob d670...    README.md
040000 tree 9e4f...    src

# SHA relationships:
Commit SHA ──points to──→ Tree SHA ──points to──→ Blob SHA
     ↑ also points to parent commit SHA

── Lightweight vs annotated tags ─────────────────────────

Lightweight tag: just a named pointer to a commit (like a branch, but doesn't move)
  git tag v1.0        → stored as .git/refs/tags/v1.0

Annotated tag: a full Git object with its own SHA, tagger, message, GPG signature
  git tag -a v1.0 -m "Release 1.0"
  git show v1.0       → shows tag object + commit
```


## W — Why It Matters

The object model explains key Git behaviors: renaming a file doesn't create a new blob (same content = same SHA), identical files across branches share storage, and every commit is immutable (changing anything changes its SHA). This is why `git rebase` creates *new* commits — it can't edit old ones.[^2][^5]

## I — Interview Q\&A

**Q: What is the difference between a blob and a tree in Git?**
A: A blob stores raw file content with no metadata. A tree stores directory structure — mapping filenames and permissions to blob/tree SHAs. The filename lives in the tree, not the blob.[^6]

**Q: What is the difference between a lightweight tag and an annotated tag?**
A: A lightweight tag is just a pointer (a file in `.git/refs/tags/`) to a commit SHA — like an immutable branch. An annotated tag is a full Git object with its own SHA, tagger identity, date, message, and optional GPG signature. Use annotated tags for releases; lightweight for personal bookmarks.[^7]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Thinking changing a commit message is "cheap" | It creates a new commit object (new SHA) — rewriting history |
| Assuming Git stores filenames in blobs | Filenames are stored in tree objects — blobs are pure content |
| Lightweight tags moving with commits | Unlike branches, tags (both types) never move — they're fixed pointers |

## K — Coding Challenge

**What does this chain represent?**

```bash
git cat-file -p HEAD         # shows: tree abc123, parent def456
git cat-file -p abc123       # shows: 100644 blob aaa111 README.md
git cat-file -p aaa111       # shows: # My Project\nWelcome!
```

**Solution:**

```
HEAD (current commit)
 └── tree abc123 (root directory snapshot)
      └── README.md → blob aaa111
           └── content: "# My Project\nWelcome!"

This is the complete chain: Commit → Tree → Blob → File content
```


***

# 3 — `git config`, `git init`, `git clone` \& Shallow Clone

## T — TL;DR

`git config` sets identity and behavior at three scopes; `git init` creates a repo; `git clone` copies one — shallow clones (`--depth`) fetch only recent history, ideal for CI pipelines.

## K — Key Concepts

```bash
# ── git config scopes ──────────────────────────────────────
# System  → /etc/gitconfig          — all users on machine
# Global  → ~/.gitconfig            — your user account (most common)
# Local   → .git/config             — this repo only (highest priority)

# Read all layers:
git config --list --show-origin

# Set identity (required before first commit)
git config --global user.name "Alice Smith"
git config --global user.email "alice@example.com"

# Useful global settings
git config --global core.editor "code --wait"   # VS Code as editor
git config --global init.defaultBranch main      # default branch name
git config --global pull.rebase true             # rebase on pull by default
git config --global core.autocrlf input          # LF on Mac/Linux
git config --global core.autocrlf true           # CRLF handling on Windows
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.st "status -s"

# Local config overrides global (for work vs personal repos)
git config --local user.email "alice@company.com"

# ── git init ──────────────────────────────────────────────
git init                    # initialize repo in current directory
git init my-project         # create + initialize a new folder
git init --bare repo.git    # bare repo — no working directory (for servers)

# What git init creates:
.git/
├── HEAD           → "ref: refs/heads/main"
├── config         → local config
├── objects/       → all Git objects (blobs, trees, commits, tags)
└── refs/          → branch and tag pointers

# ── git clone ─────────────────────────────────────────────
git clone https://github.com/user/repo.git           # HTTPS
git clone git@github.com:user/repo.git               # SSH (preferred)
git clone https://github.com/user/repo.git my-folder # custom local name

# Clone options
git clone --depth 1 https://github.com/user/repo.git       # shallow: last commit only
git clone --depth 10 https://github.com/user/repo.git      # last 10 commits
git clone --branch develop https://github.com/user/repo    # specific branch
git clone --single-branch --branch main ...                 # only that branch
git clone --no-tags ...                                     # skip downloading tags

# Shallow clone — CI/CD speedup
# Full clone of large repo: minutes
# Shallow --depth 1: seconds
# Caveat: git log, git blame limited to shallow history
# Unshallow later if needed:
git fetch --unshallow

# ── SSH setup ──────────────────────────────────────────────
ssh-keygen -t ed25519 -C "alice@example.com"    # generate key pair
cat ~/.ssh/id_ed25519.pub                        # copy public key
# → paste into GitHub: Settings → SSH Keys → New SSH Key
ssh -T git@github.com                            # test connection
# → "Hi alice! You've successfully authenticated"
```


## W — Why It Matters

Shallow clones are the most impactful Git performance optimization for CI/CD — a `--depth 1` clone of a large monorepo drops clone time from minutes to seconds. Every GitHub Actions/GitLab CI pipeline uses `fetch-depth: 1` by default for this reason. SSH is preferred over HTTPS for developer machines because you never type credentials after setup.

## I — Interview Q\&A

**Q: What's the difference between a bare repository and a regular one?**
A: A bare repo has no working directory — only the `.git/` contents at the root. It's used as a server-side remote that multiple developers push to. Regular repos have a working directory for editing files. You'd never commit directly in a bare repo.

**Q: What is a shallow clone and what are its trade-offs?**
A: `--depth N` clones only the last N commits per branch, making clone fast. Trade-offs: `git log` is limited to shallow history, `git blame` may be incomplete, and some operations like `git bisect` require full history. Use `--unshallow` when you need full history later.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `user.name`/`user.email` before first commit | Set globally once: `git config --global user.name "..."` |
| HTTPS clone prompting for credentials on every push | Switch to SSH: `git remote set-url origin git@github.com:user/repo.git` |
| Shallow clone breaking `git describe` or version scripts | Unshallow in CI if build needs tags: `git fetch --unshallow` |

## K — Coding Challenge

**Set up a new project with SSH, custom branch name, and useful aliases:**

```bash
# Init, set remote, configure aliases, make first commit
```

**Solution:**

```bash
git init --initial-branch=main my-app   # or: git init + git checkout -b main
cd my-app
git remote add origin git@github.com:alice/my-app.git
git config --local user.email "alice@company.com"
git config --local alias.lg "log --oneline --graph --all"
echo "# My App" > README.md
git add README.md
git commit -m "Initial commit"
git push -u origin main                  # -u sets upstream tracking
```


***

# 4 — `git status`, `git log` Formats \& `git show`

## T — TL;DR

`git status` describes the three-area state of your repo; `git log` has powerful filtering and formatting flags; `git show` inspects any object — commit, tag, blob, or tree.

## K — Key Concepts

```bash
# ── git status ────────────────────────────────────────────
git status                  # verbose (default)
git status -s               # short format — 2-column: staging + working
git status -sb              # short + branch info

# Short status column key:
# XY filename
# X = staging area status, Y = working directory status
# M = modified, A = added, D = deleted, R = renamed, ? = untracked
# Example output:
#  M src/app.js    → modified in working dir, not staged
# M  src/util.js   → modified in staging area (added)
# MM src/index.js  → modified in both staging AND working dir
# ?? newfile.js    → untracked file

# ── git log formats ───────────────────────────────────────
git log                         # full default format
git log --oneline               # compact: hash + message
git log --oneline --graph       # ASCII branch graph
git log --oneline --graph --all --decorate  # show all branches + tags

# Custom format with --pretty=format:
git log --pretty=format:"%h %an %ar %s"
# %h = short hash, %H = full hash
# %an = author name, %ae = author email
# %ar = relative date ("3 days ago"), %ai = ISO date
# %s = subject (first line of message)
# %b = body (rest of message)
# %d = decorations (branch/tag names)

# Filtering log
git log --author="Alice"            # by author name
git log --since="2 weeks ago"       # time-based
git log --since="2025-01-01" --until="2025-12-31"
git log --grep="JIRA-123"           # message contains string
git log --all                       # include all branches
git log -n 10                       # last 10 commits
git log -- path/to/file.js          # commits touching a specific file
git log -p -- file.js               # + show the diffs too (file history)
git log --follow -- renamed-file.js # follow file through renames
git log --merges                    # only merge commits
git log --no-merges                 # exclude merge commits

# Commit ranges
git log main..feature               # commits in feature not in main
git log main...feature              # symmetric difference (both sides)

# ── git show ──────────────────────────────────────────────
git show HEAD                       # full diff of last commit
git show HEAD --stat                # just changed files summary
git show abc123                     # specific commit
git show HEAD:src/app.js            # file content AT that commit
git show v1.0.0                     # annotated tag content + commit
git show HEAD^{tree}                # root tree object
```


## W — Why It Matters

A one-line graph alias (`git log --oneline --graph --all --decorate`) is the single most useful Git visualization tool — senior devs run it constantly to understand branch topology. Filtering `git log -p -- file.js` is how you audit exactly when and why a file changed, which is invaluable during debugging.

## I — Interview Q\&A

**Q: What does `git log main..feature` show?**
A: All commits reachable from `feature` that are NOT reachable from `main` — i.e., commits that exist on `feature` but haven't been merged into `main` yet. It's how you preview what a branch would contribute when merged.

**Q: How do you find which commit introduced a specific line of code?**
A: Use `git log -p -- filename` to see every change to a file. For finding a specific string, add `-S "function name"` (pickaxe search) — it shows commits where that string was added or removed.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git log` not showing all branches | Add `--all` to include refs from all branches |
| `git show HEAD:file.js` for a deleted file | Specify the commit before deletion: `git show <commit>:file.js` |
| Custom `--pretty=format` missing newlines | End with `%n` for newline, or use `--pretty=tformat:` (adds newline automatically) |

## K — Coding Challenge

**Write the git log command to find all commits by "Bob" in the last 30 days that modified `src/api.js`, showing only hash and message:**

**Solution:**

```bash
git log \
  --author="Bob" \
  --since="30 days ago" \
  --pretty=format:"%h %s" \
  -- src/api.js
```


***

# 5 — Staging Area: `git add`, `git add -p`, `git rm`, `git mv`, `git clean`

## T — TL;DR

The staging area is a precision tool — `git add -p` lets you stage individual hunks (not whole files), giving you granular control over what goes into each commit.

## K — Key Concepts

```bash
# ── git add ───────────────────────────────────────────────
git add file.js             # stage one file
git add src/                # stage all in a directory
git add .                   # stage everything in current directory
git add -A                  # stage all changes (add + delete + modify)
git add -u                  # stage only tracked files (skip untracked)
git add *.js                # glob pattern

# ── git add -p (patch mode) — most powerful ───────────────
git add -p                  # interactively choose HUNKS to stage
git add -p file.js          # patch mode for one file

# Patch mode prompts:
# y = stage this hunk
# n = skip this hunk
# s = split hunk into smaller pieces
# e = manually edit hunk
# q = quit
# ? = help

# Example: you changed 3 things in one file:
# 1. Bug fix (should go in commit A)
# 2. Refactor (should go in commit B)
# 3. New feature (should go in commit C)
# git add -p lets you stage only the bug fix, commit, then stage the rest separately

# ── git diff (check before staging) ──────────────────────
git diff                    # unstaged changes (working dir vs staging)
git diff --staged           # staged changes (staging vs last commit)
git diff HEAD               # all uncommitted changes

# ── Unstaging ─────────────────────────────────────────────
git restore --staged file.js         # unstage (modern, Git 2.23+)
git reset HEAD file.js               # unstage (classic)
git restore file.js                  # discard working dir changes

# ── git rm ────────────────────────────────────────────────
git rm file.js               # delete file + stage the deletion
git rm --cached file.js      # remove from staging/tracking only (keep on disk)
                             # use: accidentally committed node_modules, secrets
git rm -r --cached .         # remove all tracked files from index (re-apply .gitignore)

# ── git mv ────────────────────────────────────────────────
git mv old.js new.js         # rename + stage the rename
# Equivalent to:
# mv old.js new.js && git rm old.js && git add new.js

# ── git clean ─────────────────────────────────────────────
git clean -n                 # DRY RUN — show what WOULD be deleted (always run this first)
git clean -f                 # delete untracked files
git clean -fd                # delete untracked files AND directories
git clean -fX                # delete only .gitignore'd files
git clean -fdx               # delete everything untracked (incl. ignored files)
# ⚠️ git clean is destructive — files are NOT recoverable (not in Git, not in Trash)
```


## W — Why It Matters

`git add -p` is the difference between "I commit whenever I remember to" and "every commit is a single logical change." Atomic commits (one concern per commit) make `git bisect`, `git revert`, and `git blame` infinitely more useful. Senior engineers never `git add .` before reviewing what they're staging.

## I — Interview Q\&A

**Q: What does `git rm --cached file.js` do?**
A: It removes the file from Git's index (stops tracking it) without deleting it from disk. Typical use: you accidentally committed a file that should be in `.gitignore` (e.g., `.env`, `node_modules`). After `--cached`, add the file to `.gitignore` and commit.

**Q: Why should you always run `git clean -n` before `git clean -f`?**
A: `git clean -f` permanently deletes untracked files — they don't go to the Trash and can't be recovered from Git (Git never tracked them). The dry-run `-n` flag shows exactly what would be deleted, preventing accidental data loss.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git add .` staging unintended files | Always `git status` first; use `-p` for granular control |
| `git clean -f` deleting important untracked files | Always `git clean -n` first |
| `git rm file.js` when you only want to untrack | Use `git rm --cached file.js` to keep the file on disk |

## K — Coding Challenge

**You made 3 changes to `api.js`: a bug fix, a `console.log` debug line, and a refactor. Create two separate commits — one for the bug fix, one for the refactor — leaving the debug line unstaged.**

**Solution:**

```bash
git add -p api.js   # stage only the bug fix hunk → y
                    # skip the console.log hunk → n
                    # skip the refactor hunk → n
git commit -m "fix: null check in fetchUser"

git add -p api.js   # skip the console.log hunk → n
                    # stage the refactor hunk → y
git commit -m "refactor: extract formatResponse helper"

# console.log remains unstaged — visible in git diff
```


***

# 6 — `git commit`, Amend, `--no-verify` \& `.gitignore`

## T — TL;DR

`git commit` snapshots the staging area; `--amend` rewrites the last commit without creating a new one; `.gitignore` prevents files from being tracked — never commit secrets or build artifacts.

## K — Key Concepts

```bash
# ── git commit ────────────────────────────────────────────
git commit -m "feat: add user authentication"   # one-line message
git commit                                       # opens editor for full message
git commit -am "fix: typo"                       # stage tracked + commit (skips untracked)
git commit --allow-empty -m "trigger CI"         # commit with no changes

# Good commit message format (Conventional Commits):
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, test, chore, perf, ci
# feat(auth): add JWT refresh token rotation
# fix(api): handle null user in fetchProfile
# refactor(utils): extract formatDate to shared module

# ── git commit --amend ────────────────────────────────────
git commit --amend -m "corrected message"    # change last commit message
git commit --amend --no-edit                 # add staged changes to last commit, keep message
# Use case: forgot a file in the last commit
git add forgotten-file.js
git commit --amend --no-edit                 # adds it to last commit

# ⚠️ amend rewrites history — creates a NEW commit SHA
# NEVER amend commits that have been pushed to shared branches

# ── --no-verify ───────────────────────────────────────────
git commit --no-verify -m "wip: bypass hooks"  # skips pre-commit and commit-msg hooks
git push --no-verify                            # skips pre-push hooks
# Use sparingly — hooks exist for a reason (lint, tests, format)

# ── .gitignore ────────────────────────────────────────────
# .gitignore syntax:
node_modules/         # ignore directory
*.log                 # ignore by extension
.env                  # ignore specific file
.env.*                # ignore .env.local, .env.production, etc.
!.env.example         # UN-ignore (always track this file)
dist/                 # build output
build/
coverage/
*.DS_Store            # macOS metadata
.idea/                # JetBrains IDE
.vscode/              # VS Code settings (optional — some teams track this)
*.pyc
__pycache__/

# .gitignore scope:
# - In root → applies to whole repo
# - In subdirectory → applies only to that subtree
# - .git/info/exclude → local ignores, not committed (personal)
# - git config --global core.excludesFile → global ignores for your machine

# Apply .gitignore to already-tracked files:
git rm -r --cached .          # remove all from index
git add .                     # re-add respecting .gitignore
git commit -m "chore: apply .gitignore"

# ── .gitkeep ──────────────────────────────────────────────
# Git doesn't track empty directories.
# Convention: add a .gitkeep (empty file) to track an empty dir.
touch logs/.gitkeep
git add logs/.gitkeep          # now the logs/ directory is tracked

# ── .gitattributes ────────────────────────────────────────
# Control line endings, diff behavior, merge strategy per file type:
* text=auto                    # auto-detect line endings
*.js text eol=lf               # always LF for JS files
*.png binary                   # treat as binary (no line-ending conversion)
*.md diff=markdown             # use markdown diff driver
CHANGELOG.md merge=union       # merge strategy for CHANGELOG
```


## W — Why It Matters

Amending is the most common history-cleanup operation — fix a typo, add a forgotten file to the last commit before pushing. Never amend pushed commits because it rewrites history and breaks teammates' repos. `.gitignore` is your first line of defense against committing secrets and build artifacts; adding a `.env` to a public repo is one of the most common security incidents.[^1]

## I — Interview Q\&A

**Q: What's the difference between `git commit --amend` and `git rebase -i`?**
A: `--amend` only modifies the last commit — it's simple and fast. `git rebase -i` (interactive rebase) can modify any commit in history, reorder, squash, or drop multiple commits. Use `--amend` for quick last-commit fixes; `rebase -i` for cleaning up a series of WIP commits.

**Q: A secret was accidentally committed — what do you do?**
A: (1) Rotate the secret immediately — assume it's compromised. (2) Remove from history with `git rebase -i` or `git filter-repo`. (3) Force push. (4) Add to `.gitignore`. But the key point: any public push means the secret is compromised even after history rewrite — GitHub scans and caches everything.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git commit --amend` after pushing to shared branch | Only amend local commits — amending pushed commits requires force push and breaks teammates |
| `.gitignore` not ignoring an already-tracked file | `git rm --cached file` to untrack, then `.gitignore` works |
| `--no-verify` becoming a habit | Use it only for true emergencies — the hooks protect you |

## K — Coding Challenge

**You just committed but forgot to add `config/settings.js`. Fix it without creating a new commit:**

**Solution:**

```bash
git add config/settings.js
git commit --amend --no-edit    # folds the new file into the last commit
# Result: last commit now includes settings.js, same message
```


***

# 7 — Branching: `branch`, `checkout`, `switch`, `merge`

## T — TL;DR

A branch is a lightweight named pointer to a commit — creating one is instant; `switch` (modern) replaces `checkout` for branch operations; `merge` integrates branches, defaulting to fast-forward when possible.

## K — Key Concepts

```bash
# ── Branch operations ─────────────────────────────────────
git branch                   # list local branches
git branch -a                # list all (local + remote tracking)
git branch -v                # list with last commit
git branch feature/login     # create branch (stay on current)
git branch -d feature/login  # delete (safe — blocked if unmerged)
git branch -D feature/login  # force delete (unmerged changes lost)
git branch -m old-name new-name  # rename branch

# ── switch (modern, Git 2.23+) — preferred ────────────────
git switch feature/login     # switch to existing branch
git switch -c feature/login  # create + switch (replaces checkout -b)
git switch -               # switch to previous branch

# ── checkout (classic) ────────────────────────────────────
git checkout feature/login   # switch branch
git checkout -b feature/login  # create + switch
git checkout -- file.js      # discard working dir changes (dangerous with --)
# Note: checkout is overloaded — switch + restore replace its two main uses

# ── Fast-forward merge ────────────────────────────────────
# When main has no new commits since feature branched off:
#   main: A → B
#   feature: A → B → C → D
#
# git merge feature:  main simply moves forward to D
#   main: A → B → C → D  (no merge commit created)

git switch main
git merge feature/login       # fast-forward (if possible)
git merge --ff-only feature   # error if FF not possible (strict mode)
git merge --no-ff feature     # always create merge commit even if FF possible
git merge --no-ff -m "Merge feature/login" feature  # with custom merge message

# ── Three-way merge ───────────────────────────────────────
# When main has advanced since feature branched:
#   main:    A → B → E
#   feature: A → B → C → D
#
# Git finds common ancestor B, merges E + D → new merge commit M
#   main:    A → B → E → M
#                ↘ C → D ↗

# Merge conflict resolution:
git merge feature/login      # conflict!
# Edit conflicted files:
# <<<<<<< HEAD
# existing code
# =======
# incoming code
# >>>>>>> feature/login

git add resolved-file.js     # mark resolved
git merge --continue         # or: git commit
git merge --abort            # undo the merge attempt entirely

# ── Squash merge ──────────────────────────────────────────
# Collapses all feature branch commits into a single staged diff
# Doesn't create a merge commit yet — you commit manually
git merge --squash feature/login
git commit -m "feat: user login feature"
# Result: main gets ONE clean commit summarizing all feature work
# Downside: feature branch history is lost in main; branch isn't "merged"
```


## W — Why It Matters

`--no-ff` (no fast-forward) creates merge commits that preserve branch topology — you can see in `git log --graph` that a feature existed as a branch. Without it, fast-forward merges make it impossible to tell what was a branch vs. linear commits. Different teams have strong opinions: `--no-ff` (GitHub flow style) vs. rebase + ff (linear history style).[^4]

## I — Interview Q\&A

**Q: What's the difference between fast-forward and three-way merge?**
A: Fast-forward happens when the target branch has no diverged commits — Git just moves the pointer forward, no merge commit needed. Three-way merge happens when both branches have diverged — Git uses the common ancestor plus both tips to create a new merge commit with two parents.[^4]

**Q: When would you use `--squash` vs `--no-ff` vs regular merge?**
A: `--squash` gives you one clean commit in main — great for feature branches with many WIP commits but loses individual commit history. `--no-ff` preserves the branch in graph history. Regular merge fast-forwards when possible — clean linear history but no branch topology visible.[^8][^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `git checkout feature` creating a local branch tracking remote | Check `git branch -v` to verify — use `git switch feature` which is clearer |
| Deleting a branch before its PR is merged | Use `-d` (safe) not `-D`; GitHub/GitLab warn you too |
| Merge commit message defaulting to "Merge branch 'x'" | Always `--no-ff -m "descriptive message"` for meaningful history |

## K — Coding Challenge

**Create and merge a feature branch with a squash merge, then clean up:**

```bash
# Start on main, create feature/auth, make 3 commits, squash-merge to main, delete branch
```

**Solution:**

```bash
git switch -c feature/auth
git commit -m "wip: auth scaffolding"
git commit -m "wip: JWT middleware"
git commit -m "wip: tests"

git switch main
git merge --squash feature/auth      # collapses all 3 into staged changes
git commit -m "feat: JWT authentication with middleware"  # one clean commit

git branch -d feature/auth           # safe delete (squash = "not fully merged")
git branch -D feature/auth           # force delete needed for squash-merged branches
```


***

# 8 — Rebase \& Interactive Rebase

## T — TL;DR

Rebase replays your commits on top of another base — creating a linear history; interactive rebase (`-i`) is your history editor — reorder, squash, edit, drop, or reword any commits.[^9]

## K — Key Concepts

```bash
# ── git rebase ────────────────────────────────────────────
# Before rebase:
#   main:    A → B → C
#   feature: A → B → D → E

git switch feature
git rebase main
# After rebase:
#   main:    A → B → C
#   feature: A → B → C → D' → E'   (D, E replayed on top of C, new SHAs)

# D' and E' are NEW commits — same changes, new hashes, new parent

# Keep feature up-to-date:
git switch feature
git rebase main          # replay feature commits on latest main

# Rebase onto a specific commit:
git rebase main --onto new-base  # advanced: reattach to a different base

# Conflict during rebase:
git rebase main          # conflict in D'
# Fix conflict in files...
git add resolved-file.js
git rebase --continue    # replay the next commit
git rebase --abort       # abort entirely, return to pre-rebase state
git rebase --skip        # skip current conflicting commit

# ── Interactive rebase ─────────────────────────────────────
git rebase -i HEAD~3     # edit last 3 commits
git rebase -i HEAD~10    # edit last 10 commits
git rebase -i <commit>   # edit commits after <commit>

# Opens editor with list of commits (oldest first):
# pick abc1234 feat: add login form
# pick def5678 fix: typo in login
# pick ghi9012 wip: debugging login
# pick jkl3456 refactor: extract form helper
# pick mno7890 test: add login tests

# Commands (replace 'pick' with):
# p, pick   = keep commit as-is
# r, reword = keep commit, but edit the message
# e, edit   = pause here to amend (add files, split commit)
# s, squash = meld into PREVIOUS commit (keeps both messages)
# f, fixup  = meld into PREVIOUS commit (discard this message)
# d, drop   = remove commit entirely
# b, break  = pause for manual intervention

# Example: squash WIP and fix into the feature commit:
# pick abc1234 feat: add login form
# squash def5678 fix: typo in login      ← squash into abc1234
# drop ghi9012 wip: debugging login      ← remove entirely
# pick jkl3456 refactor: extract form helper
# squash mno7890 test: add login tests   ← squash into jkl3456

# Result: 2 clean commits instead of 5

# ── Rebase vs Merge summary ────────────────────────────────
# Rebase:
#   ✅ Linear history — no merge commits
#   ✅ Clean git log
#   ❌ Rewrites history — never rebase shared/public branches
#   ❌ Conflict resolution per commit (not per file)

# Merge:
#   ✅ Preserves true history
#   ✅ Safe for shared branches
#   ❌ Merge commits add noise to log
#   ❌ Non-linear history

# Golden rule: NEVER rebase commits that exist on a remote shared branch
# Rebase is for local cleanup before opening a PR
git push --force-with-lease   # safer force push — fails if remote has new commits
git push --force              # dangerous — overwrites without checking
```


## W — Why It Matters

Interactive rebase is the most powerful Git skill for maintaining a clean PR history. Squashing WIP commits before review, rewording misleading commit messages, and dropping "debug log" commits are daily operations for senior engineers. The golden rule — never rebase shared branches — is the most important Git rule to internalize.[^9]

## I — Interview Q\&A

**Q: What does `git rebase` actually do to commits?**
A: It detaches each commit from the current base and replays them — one by one — on top of the new base. Each replayed commit gets a new SHA (new parent = new hash). The changes are the same, but the commits are new objects. This is "rewriting history."[^9]

**Q: What is `--force-with-lease` and why is it safer than `--force`?**
A: `--force-with-lease` checks that the remote branch hasn't been updated since your last fetch. If someone else pushed to the branch, it fails — preventing you from overwriting their work. `--force` blindly overwrites regardless of remote state.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Rebasing a branch that teammates are working on | Coordinate first or use merge; rebase rewrites SHAs breaking teammates' history |
| Squash order in interactive rebase — squashing into the WRONG commit | Commits are listed oldest-first; `squash` folds into the commit ABOVE it |
| `git push` failing after rebase with "rejected updates" | Use `--force-with-lease` — the remote has your old commits; you must force update |

## K — Coding Challenge

**Clean up these 5 WIP commits into 2 meaningful commits before opening a PR:**

```
abc1 wip: start auth
def2 wip: more auth
ghi3 debug: add console.logs
jkl4 fix: remove console.logs
mno5 test: auth tests
```

**Solution:**

```bash
git rebase -i HEAD~5
# Editor opens:
# pick abc1 wip: start auth
# squash def2 wip: more auth     ← fold into abc1
# drop ghi3 debug: add console.logs  ← remove entirely
# drop jkl4 fix: remove console.logs ← remove entirely
# pick mno5 test: auth tests

# Save → edit combined message for abc1+def2 → "feat: implement JWT authentication"
# Result: 2 clean commits: "feat: implement JWT authentication" + "test: auth tests"
```


***

# 9 — `HEAD` References \& Detached `HEAD`

## T — TL;DR

`HEAD` is a pointer to your current location — normally pointing to a branch; "detached HEAD" occurs when HEAD points directly to a commit instead of a branch — any commits you make are orphaned unless you create a branch.[^3][^10]

## K — Key Concepts

```bash
# ── HEAD mechanics ────────────────────────────────────────
cat .git/HEAD          # shows: "ref: refs/heads/main" (attached)
cat .git/HEAD          # shows: "a1b2c3d4..." (detached)

# HEAD relative references:
HEAD                   # current commit
HEAD~1 or HEAD^        # one commit back (parent)
HEAD~3                 # three commits back
HEAD^2                 # second parent (of a merge commit)
HEAD@{2}               # HEAD two moves ago (reflog position)

# Commit reference shortcuts:
abc123~2               # 2 commits before abc123
main~5                 # 5 commits behind main
v1.0^{}                # commit that tag v1.0 points to (dereference)

# ── Detached HEAD ─────────────────────────────────────────
# Causes:
git checkout abc1234        # check out a commit directly
git checkout v1.0           # check out a tag (tags aren't branches)
git checkout origin/main    # check out remote tracking branch

# What happens: HEAD points directly to a commit, not a branch
# You CAN make commits — but they're "floating" with no branch name

# Git warns you:
# "You are in 'detached HEAD' state.
# If you want to create a new branch to retain commits you create,
# you may do so by using: git switch -c <new-branch-name>"

# ── Recovering from detached HEAD ─────────────────────────
# Option 1: You made commits and want to keep them
git switch -c rescue-branch         # create branch from current commit
# Now your commits are named and won't be GC'd

# Option 2: Just exploring — discard and return
git switch main                     # return to main, detached commits abandoned
# Git will warn: "lost" commits are still in reflog for ~30 days

# Option 3: Just viewing old code (no commits needed)
git checkout v1.2.3                 # detached — safe for read-only exploration
# Then: git switch -         # return to previous branch

# ── Useful HEAD-based operations ──────────────────────────
git diff HEAD                       # all uncommitted changes
git diff HEAD~1                     # changes in last commit
git reset HEAD~1                    # undo last commit, keep changes staged
git reset --soft HEAD~1             # same as above
git reset --mixed HEAD~1            # undo commit, unstage changes (default)
git reset --hard HEAD~1             # undo commit + discard changes ⚠️ destructive
git checkout HEAD~3 -- file.js      # restore file to version 3 commits ago
```


## W — Why It Matters

Detached HEAD is one of the most confusing Git states for beginners — knowing it's just "HEAD not pointing to a branch" demystifies it. The recovery path (`git switch -c branch-name`) is a 5-second fix. HEAD-relative references (`HEAD~3`, `HEAD^`) are used constantly in `reset`, `rebase`, `diff`, and `log` commands.[^10][^3]

## I — Interview Q\&A

**Q: What is detached HEAD state and how do you safely exit it?**
A: Detached HEAD means HEAD points to a commit SHA directly, not to a branch name. Any commits you make are "floating" — not attached to a branch — and Git will eventually garbage-collect them. To save work: `git switch -c new-branch`. To discard and return: `git switch main`.[^3]

**Q: What's the difference between `HEAD~1` and `HEAD^1`?**
A: For non-merge commits, they're identical — one commit back. For merge commits (which have two parents), `HEAD^1` is the first parent (the branch you were on) and `HEAD^2` is the second parent (the branch that was merged in). `HEAD~2` always means "two generations back via first parents."

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Making commits in detached HEAD and switching away | Always `git switch -c branch-name` before switching away |
| `git reset --hard HEAD~1` discarding committed work | `--hard` is destructive — use `--soft` or `--mixed` to keep changes |
| Confusing `^` and `~` for merge commits | `~N` goes back N first-parents; `^N` selects Nth parent of a merge commit |

## K — Coding Challenge

**You accidentally committed to detached HEAD after checking out `v2.0` to inspect it. Recover your commit:**

```bash
# You're in detached HEAD at v2.0, made 1 commit
# git log shows: abc1234 "my important fix"
```

**Solution:**

```bash
# From detached HEAD state:
git switch -c hotfix/my-important-fix   # create branch from current position
# HEAD is now attached to hotfix/my-important-fix
# abc1234 is now safely on a named branch
git push origin hotfix/my-important-fix # optionally push it
```


***

# 10 — `git reflog` \& Recovering Lost Commits

## T — TL;DR

`git reflog` is Git's safety net — it logs every time HEAD moved in your local repo, keeping "lost" commits accessible for ~30 days even after reset, rebase, or branch deletion.[^11][^10]

## K — Key Concepts

```bash
# ── git reflog ────────────────────────────────────────────
git reflog                      # show full reflog (HEAD movements)
git reflog --all                # all refs (branches, stash, etc.)
git reflog show main            # movements of the main branch pointer
git reflog --since="3 days ago" # filter by time

# Reflog output format:
# abc1234 HEAD@{0}: commit: feat: add OAuth
# def5678 HEAD@{1}: rebase finished: returning to refs/heads/main
# ghi9012 HEAD@{2}: checkout: moving from feature to main
# jkl3456 HEAD@{3}: commit: wip: auth scaffolding
# ...

# HEAD@{N} = where HEAD was N moves ago
# HEAD@{3} = HEAD 3 moves ago

# ── Scenario 1: Undo a bad reset --hard ───────────────────
# You accidentally ran: git reset --hard HEAD~3
# The 3 commits appear "lost" — but they're in the reflog!

git reflog                      # find the SHA before the reset
# abc1234 HEAD@{4}: commit: the last good commit

git reset --hard abc1234        # restore HEAD to before the disaster
# Or: git reset --hard HEAD@{4}

# ── Scenario 2: Recover a deleted branch ─────────────────
git branch -D feature/auth      # accidentally force-deleted!
git reflog                      # find the last commit on that branch
# def5678 HEAD@{6}: checkout: moving from feature/auth to main
# ghi9012 HEAD@{7}: commit: feat: JWT refresh token  ← last commit on feature/auth

git switch -c feature/auth ghi9012   # recreate the branch from that commit

# ── Scenario 3: Recover from bad rebase ───────────────────
git rebase main                 # rebase went wrong, commits look messed up
git reflog                      # find the SHA before the rebase started
# Before rebase entry will show:
# abc1234 HEAD@{8}: checkout: moving from feature/auth to feature/auth

git reset --hard abc1234        # restore to pre-rebase state

# ── Scenario 4: Find a specific action ────────────────────
git reflog | grep "before rebase"    # grep messages in reflog
git reflog | grep "commit: feat"     # find specific commit messages

# ── Inspect a reflog entry ────────────────────────────────
git show HEAD@{5}               # show commit at reflog position 5
git diff HEAD@{5} HEAD          # diff between then and now
git checkout HEAD@{5} -- file.js  # restore a file from 5 HEAD-moves ago

# ── Understanding GC ─────────────────────────────────────
# "Unreachable" objects stay in reflog for:
#   Default expiry: 90 days for reachable, 30 days for unreachable
#   Configured by: gc.reflogExpire, gc.reflogExpireUnreachable

# Force GC (rarely needed manually):
git gc --prune=now              # ⚠️ permanently removes unreachable objects

# Stash reflog:
git reflog stash                # show all stash operations
```


## W — Why It Matters

`git reflog` has saved countless engineers from "I just lost a week of work" moments. Unlike `git log` (only shows reachable commits), `reflog` shows every local HEAD movement — meaning commits "deleted" by `reset --hard`, wiped by a bad rebase, or on a force-deleted branch are all still there. It's local-only (not pushed to remotes), making it a private time machine.[^11][^10]

## I — Interview Q\&A

**Q: What's the difference between `git log` and `git reflog`?**
A: `git log` shows commits reachable from the current HEAD — the history of your current branch. `git reflog` shows every time HEAD moved on your local machine — including to commits no longer reachable from any branch. Reflog is your undo history; log is your commit history.[^11]

**Q: How long are commits retained in the reflog?**
A: Reachable commits (on a branch or tag): 90 days by default. Unreachable commits (from deleted branches, reset commits): 30 days. After that, `git gc` prunes them. You can extend with `git config gc.reflogExpireUnreachable "90 days"`.[^10]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Reflog not available after `git clone` or on CI | Reflog is local-only — it's populated as you work, not available for fresh clones |
| `git gc --prune=now` before checking reflog | Never prune before checking if you need to recover — GC makes losses permanent |
| Reflog entries looking confusing | Look for the action label: `commit:`, `checkout:`, `rebase:`, `reset:` to find the right entry |

## K — Coding Challenge

**You ran `git reset --hard HEAD~5` thinking it was safe, then realized you need commit 3 (of those 5). Recover just that one commit:**

**Solution:**

```bash
git reflog
# Find: abc1234 HEAD@{5}: commit: the commit you need

# Option A: cherry-pick just that commit onto current HEAD
git cherry-pick abc1234
# The changes from that one commit are applied as a new commit

# Option B: restore the full state from before the reset
git reset --hard HEAD@{6}  # HEAD@{6} = state just before the reset --hard
# (then recommit only what you want, or leave as-is)

# Option C: create a recovery branch at abc1234 + cherry-pick
git switch -c recovery abc1234  # inspect it
git switch main
git cherry-pick abc1234          # apply just that commit to main
git branch -D recovery
```


***

> ✅ **Day 10 complete.**
> Your tiny next action: run `git reflog` in any repo you're working in right now. Find the most recent 5 HEAD movements, understand what caused each one, and identify one "lost" commit SHA. That one command unlocks the most powerful Git recovery skill.
<span style="display:none">[^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects

[^2]: https://dev.to/__whyd_rf/a-deep-dive-into-git-internals-blobs-trees-and-commits-1doc

[^3]: https://circleci.com/blog/git-detached-head-state/

[^4]: https://dev.to/devsatasurion/git-rebase-vs-merge-vs-squash-how-to-choose-the-right-one-3a33

[^5]: https://www.kenmuse.com/blog/understanding-how-git-stores-data/

[^6]: https://shafiul.github.io/gitbook/1_the_git_object_model.html

[^7]: https://stackoverflow.com/questions/36112726/why-git-tag-a-blob-or-a-tree-or-a-tag

[^8]: https://graphite.com/guides/git-merge-squash-graphite-cli

[^9]: https://www.centron.de/en/tutorial/git-rebase-tutorial-interactive-merge-options-explained/

[^10]: https://blog.kusho.ai/how-to-use-git-reflog-to-find-lost-commits/

[^11]: https://stackoverflow.com/questions/10099258/how-can-i-recover-a-lost-commit-in-git

[^12]: https://www.youtube.com/watch?v=1eHwkyOmb-4

[^13]: https://initialcommit.com/blog/git-objects-linked-together

[^14]: https://www.freecodecamp.org/news/git-internals-objects-branches-create-repo/

[^15]: https://stackoverflow.com/questions/1725708/git-rebase-interactive-squash-merge-commits-together

