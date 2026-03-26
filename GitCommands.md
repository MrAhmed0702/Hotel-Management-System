# Git Commands Used in This Project

This document lists every Git command used throughout the development of the **Hotel Management System** project.

---

## 1. Initial Setup

```bash
# Initialize a new Git repository
git init

# Configure user name globally
git config --global user.name "Your Name"

# Configure user email globally
git config --global user.email "you@example.com"
```

---

## 2. Cloning the Repository

```bash
# Clone the remote repository to local machine
git clone https://github.com/MrAhmed0702/Hotel-Management-System
```

---

## 3. Checking Status & Differences

```bash
# Show the working tree status (staged, unstaged, untracked files)
git status

# Show unstaged changes
git diff

# Show staged (indexed) changes
git diff --staged
```

---

## 4. Staging & Committing Changes

```bash
# Stage all changes in the current directory
git add .

# Stage a specific file
git add <file>

# Commit staged changes with a message
git commit -m "Started working on the frontend project"

# Commit staged changes with a message (feature branch commit)
git commit -m "ApiLayer is Completed"
```

---

## 5. Branching

```bash
# List all local branches
git branch

# List all local and remote branches
git branch -a

# Create a new branch
git branch feature/frontend-apiLayer

# Switch to an existing branch
git checkout feature/frontend-apiLayer

# Create and switch to a new branch in one command
git checkout -b feature/frontend-apiLayer

# Delete a local branch after it has been merged
git branch -d feature/frontend-apiLayer
```

---

## 6. Working with Remote

```bash
# Add a remote named 'origin'
git remote add origin https://github.com/MrAhmed0702/Hotel-Management-System

# View all remotes
git remote -v

# Push local branch to remote for the first time
git push -u origin main

# Push a feature branch to remote
git push origin feature/frontend-apiLayer

# Push current branch to its remote tracking branch
git push

# Fetch all changes from remote without merging
git fetch origin

# Pull (fetch + merge) latest changes from remote main branch
git pull origin main
```

---

## 7. Merging & Pull Requests

```bash
# Merge a feature branch into the current branch (e.g., main)
git merge feature/frontend-apiLayer

# Merge with a commit message (no fast-forward)
git merge --no-ff feature/frontend-apiLayer -m "Merge pull request #1 from MrAhmed0702/feature/frontend-apiLayer"
```

> Pull Request #1 — **Feature/frontend api layer** — was opened from `feature/frontend-apiLayer` and merged into `main` via GitHub.

---

## 8. Viewing History & Logs

```bash
# Show full commit log
git log

# Show condensed one-line commit log
git log --oneline

# Show log with branch/merge graph
git log --oneline --graph --all

# Show details of a specific commit
git show <commit-sha>

# Show files changed in a commit
git show --stat <commit-sha>
```

---

## 9. Undoing Changes

```bash
# Discard unstaged changes in a file
git checkout -- <file>

# Unstage a file (keep changes in working directory)
git reset HEAD <file>

# Amend the last commit message
git commit --amend -m "Updated commit message"

# Revert a commit (creates a new undo commit)
git revert <commit-sha>

# Reset to a previous commit (soft — keeps changes staged)
git reset --soft HEAD~1

# Reset to a previous commit (mixed — keeps changes unstaged)
git reset --mixed HEAD~1
```

---

## 10. Stashing

```bash
# Stash current uncommitted changes
git stash

# List all stashes
git stash list

# Apply the most recent stash
git stash apply

# Drop (remove) the most recent stash
git stash drop

# Apply and remove the most recent stash
git stash pop
```

---

## 11. Tagging

```bash
# Create a lightweight tag
git tag v1.0.0

# Create an annotated tag
git tag -a v1.0.0 -m "Version 1.0.0 release"

# Push tags to remote
git push origin --tags

# List all tags
git tag
```

---

## 12. Inspecting the Repository

```bash
# Show all tracked files in the index
git ls-files

# Show reference logs (reflog)
git reflog

# Show who changed each line of a file
git blame <file>
```

---

## Commit History Summary

| Commit SHA | Message | Branch |
|---|---|---|
| `31f536b` | Merge pull request #1 from MrAhmed0702/feature/frontend-apiLayer | `main` |
| `f3f3410` | ApiLayer is Completed | `feature/frontend-apiLayer` |
| `9fe66be` | Started working on the frontend project | `main` |

---

## Branch Summary

| Branch | Purpose |
|---|---|
| `main` | Primary production branch |
| `feature/frontend-apiLayer` | Feature branch for building the frontend API layer (Redux, Axios, endpoints) |
