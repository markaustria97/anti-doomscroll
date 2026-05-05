# 3 — `git config`, `git init`, `git clone` & Shallow Clone

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

## I — Interview Q&A

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
