# GitHub SSH & Branch Workflow

## Your current setup

- **Remote**: `origin` is set to **SSH**: `git@github.com:zioncodeliba/robinHoodFront.git` (no fork; you push directly to this repo).
- **Branch**: You're working on **avideveloper** (local and remote both exist).
- **SSH key**: You already have a key at `%USERPROFILE%\.ssh\id_ed25519` (public key: `id_ed25519.pub`).

---

## 1. SSH key with passphrase (password)

### Option A: Add a passphrase to your existing key

In PowerShell:

```powershell
ssh-keygen -p -f "$env:USERPROFILE\.ssh\id_ed25519"
```

- Enter your **current passphrase** (or press Enter if there is none).
- Enter a **new passphrase** when prompted (this is the “password” for your key).
- Confirm it. Git/GitHub will ask for this passphrase when you push/pull over SSH (unless you use an agent).

### Option B: Create a new SSH key with passphrase

```powershell
ssh-keygen -t ed25519 -C "avicodeandcore@gmail.com" -f "$env:USERPROFILE\.ssh\id_ed25519_github"
```

- When asked for a passphrase, type the password you want for this key.
- Add the new key to the agent (see below) and add `id_ed25519_github.pub` to GitHub (Settings → SSH and GPG keys).

### Using the passphrase every time (SSH agent)

To avoid typing the passphrase on every push:

**Windows (PowerShell as Administrator, one time):**

```powershell
Get-Service ssh-agent | Set-Service -StartupType Manual
Start-Service ssh-agent
```

Then add your key (you’ll be asked for the passphrase once):

```powershell
ssh-add "$env:USERPROFILE\.ssh\id_ed25519"
```

---

## 2. Add your SSH public key to GitHub

1. Copy your public key:
   ```powershell
   Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard
   ```
2. On GitHub: **Settings → SSH and GPG keys → New SSH key**.
3. Paste and save.

Test the connection:

```powershell
ssh -T git@github.com
```

You should see: `Hi <username>! You've successfully authenticated...`

---

## 3. Work on branch `avideveloper` and push (no fork)

You’re already on **avideveloper** and **origin** points at the main repo (not a fork), so you can commit and push directly.

### Quick commands

| Action              | Command |
|---------------------|--------|
| Switch to avideveloper | `npm run branch:avideveloper` or `git checkout avideveloper` |
| See status          | `npm run git:status` or `git status` |
| Stage + commit      | `npm run git:commit` (then add message in the editor) or `git add -A && git commit -m "Your message"` |
| Push to origin      | `npm run git:push` or `git push -u origin avideveloper` |

### Example workflow

```powershell
cd d:\Apps\cursor\robinHoodFront

# 1. Make sure you're on avideveloper
npm run branch:avideveloper

# 2. After editing files: stage and commit
git add -A
git commit -m "Your commit message"

# 3. Push to GitHub (no fork; direct to zioncodeliba/robinHoodFront)
git push -u origin avideveloper
```

The first time you push, Git may ask for your **SSH key passphrase** (if you set one). After that, if the SSH agent is running and the key is added, you won’t be prompted every time.

---

## Summary

- **SSH key**: Use existing `id_ed25519` or create a new one; add a passphrase with `ssh-keygen -p` or when creating the key.
- **GitHub**: Add the `.pub` key in GitHub Settings → SSH and GPG keys.
- **Branch**: Use `avideveloper` via `npm run branch:avideveloper` or `git checkout avideveloper`.
- **Commit & push**: Use `git add`, `git commit`, then `git push -u origin avideveloper` (or the npm scripts above). No fork needed; you push straight to the repo.
