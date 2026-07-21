# Agent Instructions

## Execution Mode

- **Inline execution** — tasks are executed in the current session, not dispatched to subagents.
- Do NOT pass to the next task unless the user explicitly confirms they are satisfied with the current task.
- Upon user confirmation, show the commit message and wait for explicit approval before committing.
- After commit approval, push to the `seomaniak` remote.
- Never empty a file then rewrite it entirely. Only edit partially (add, modify, or delete specific parts).
