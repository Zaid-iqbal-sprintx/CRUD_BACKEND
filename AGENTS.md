# Git rules (MANDATORY)

- **NEVER run `git commit`.** Do not create commits of any kind (including merge
  commits or `git commit --amend`). Make file changes only and leave them in the
  working tree. The user reviews and commits everything themselves.
- **NEVER push to any remote.** Do not run `git push` under any circumstance —
  not a normal push, and never a force push (`git push --force` /
  `--force-with-lease`).
- **NEVER rewrite history** (no `git rebase`, no `git reset` on pushed commits
  unless the user explicitly asks).
- **NEVER change the user's branch.** Do not create, switch, rename, checkout,
  or delete branches (`git checkout -b`, `git switch`, `git branch`, etc.). Stay
  on whatever branch the user is currently on. The user manages branches
  themselves.
- Read-only git commands (`status`, `log`, `diff`, `fetch`) are fine.
- **Do NOT offer committing, pushing, or any of the above as an option.** Never
  suggest, prompt, or ask the user whether I should commit or push. Just leave
  changes in the working tree and stop.
