# Git & Deployment Workflow

All project management tasks are centralized through `just`.

## Command Execution
- **Always use `just` commands** instead of raw shell commands when possible.
- `just serve`: Development server.
- `just commit "msg"`: Handled staging and committing with documentation reminders.
- `just push`: Push to `main`.
- `just deploy`: Handle deployment to GitHub Pages.

## Deployment Strategy
- **Branching**:
  - `main`: Source of truth and active development.
  - `gh-pages`: Tracking branch for the live site.
- **Workflow**:
  - All changes must be made on `main` first.
  - Deployment `just deploy` must merge `main` into `gh-pages` and push.
- **Service Workers**: After any change to core assets (HTML, CSS, JS), the `version.js` or cache name in `sw.js` should be incremented to force a refresh on the user's side.
