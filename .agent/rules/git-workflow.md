# Git & Deployment Workflow

All project management tasks are centralized through `just`.

## Command Execution
- **Always use `just` commands** instead of raw shell commands when possible.
- `just serve`: Development server.
- `just status`: Check git status.
- `just version`: Show current app version.
- `just bump`: Increment patch version and update build time.
- `just set-version X.Y.Z`: Set a specific version.
- `just commit "msg"`: Stage and commit with documentation checks.
- `just push`: Push to `main`.
- `just tag "Release message"`: Create annotated git tag with current version and push it.
- `just push-tags`: Push all tags to remote.
- `just deploy`: Deploy to GitHub Pages.
- `just release "msg"`: Full release workflow (bump, commit, push, tag, deploy).

## Deployment Strategy
- **Branching**:
  - `main`: Source of truth and active development.
  - `gh-pages`: Tracking branch for the live site.
- **Workflow**:
  - All changes must be made on `main` first.
  - Deployment `just deploy` must merge `main` into `gh-pages` and push.
- **Service Workers**: After any change to core assets (HTML, CSS, JS), the `version.js` or cache name in `sw.js` should be incremented to force a refresh on the user's side.

## Release Workflow
1. Make changes and test locally
2. Update `README.md` with new features (mandatory)
3. Run `just release "Release message"` which:
   - Bumps version automatically
   - Checks documentation was updated
   - Commits changes
   - Pushes to main
   - Creates and pushes git tag
   - Deploys to GitHub Pages

Alternatively, for manual control:
1. `just bump` (or `just set-version X.Y.Z`)
2. Update `README.md`
3. `just commit "feat: description"`
4. `just push`
5. `just tag "Release vX.Y.Z: Description"`
6. `just deploy`
