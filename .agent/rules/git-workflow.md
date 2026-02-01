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

## Commit Message Standards

### Format
Use conventional commit format with detailed body:

```
<type>(<scope>): <short summary>

<detailed description>

## <Section Title>
- Bullet point details
- More details

## <Another Section>
- More organized information

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `style`: UI/CSS changes
- `docs`: Documentation only
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Scope
Use specific component names: `family`, `breathing`, `interval`, `ui`, `timer`, `history`, etc.

### Structure Guidelines
1. **Short Summary** (50-72 chars): Imperative mood, no period
2. **Blank Line**
3. **Detailed Description**: Explain what and why, not how
4. **Blank Line**
5. **Organized Sections**: Use `##` headers for logical grouping
   - Visual Improvements
   - Feature Enhancements
   - Layout Fixes
   - UX Improvements
   - Technical Changes
   - Bug Fixes
6. **Bullet Points**: Use `*` or `-` for lists, indent sub-items with 2 spaces
7. **Footer**: Optional references (Closes #issue, Version: vX.Y.Z)

### Example (Good)
```
feat(family): Comprehensive Family Timer improvements

Enhanced the Family Timer (Turns mode) with better visuals, flexible controls, and refined layout.

## Visual Improvements
- Replaced bulky circular progress ring with sleek linear progress bar
- Linear bar is more compact and intuitive for tracking turn duration
- 8px height with rounded corners and smooth transitions

## Time Control Enhancements
- Added negative extension buttons: -1m, -2m, -5m
- Smart logic:
  * Subtracting time can push timer into overtime
  * Adding time during overtime can exit back to normal countdown

## Layout Fixes
- Added flex-wrap to .controls to prevent button overflow on mobile
- Set min-width: 100px on control buttons for readability

## Technical Changes
- HTML: Added linear progress container, restructured extension controls
- CSS: Hide circular progress in turns mode, responsive layouts
- JS: Updated extendTurn() to handle negative values

Closes #family-timer-improvements
Version: v1.19
```

### Example (Bad)
```
updated family timer

- added some buttons
- changed css
- fixed stuff
```

### Key Principles
- **Be comprehensive**: Future developers should understand the full scope
- **Be organized**: Group related changes under clear section headers
- **Be specific**: Mention exact components, functions, or CSS classes when relevant
- **Be contextual**: Explain the "why" behind non-obvious decisions
- **Use proper formatting**: Markdown headers, bullet points, code blocks

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
