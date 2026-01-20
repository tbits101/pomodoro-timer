# Documentation Rule

Whenever a new feature is implemented or an existing one is modified:
1.  **Always update the `README.md`**:
    *   Ensure the feature is listed in the "Features" section.
    *   Update the "Roadmap" section, marking relevant items as completed.
2.  **Verify documentation**: Before committing, check if the documentation reflects the current state of the code.
3.  **Transparency**: If a feature has user-facing changes (UI, commands, settings), it MUST be documented in the repository's primary documentation file.
4.  **Justfile Maintenance**: If a new standard task is introduced, add it to the `justfile` and document it in the `README.md`.
