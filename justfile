# Default recipe to list all available commands
default:
    @just --list

# Start a local development server
serve:
    python3 -m http.server 8080

# Show git status
status:
    git status

# Check if README.md has been modified compared to origin/main
check-docs:
    @if git diff --quiet origin/main -- README.md; then \
        echo "WARNING: README.md has not been updated! Documentation is mandatory."; \
        exit 1; \
    else \
        echo "Documentation check passed (README.md modified)."; \
    fi

# Stage all changes and commit with a message (requires documentation update)
commit message: check-docs
    git add .
    git commit -m "{{message}}"

# Deploy to GitHub Pages (updates gh-pages branch from main)
deploy:
    git checkout gh-pages
    git merge main
    git push origin gh-pages
    git checkout main

# Push changes to the main branch
push:
    git push origin main

# Show current version
version:
    @grep -oP 'APP_VERSION = "\K[^"]+' version.js

# Increment patch version and update build time and sw.js cache
bump:
    #!/usr/bin/env bash
    VERSION=$(grep -oP 'APP_VERSION = "\K[^"]+' version.js)
    NEW_VERSION=$(echo $VERSION | awk -F. '{$NF = $NF + 1;} 1' OFS=.)
    sed -i "s/APP_VERSION = \"$VERSION\"/APP_VERSION = \"$NEW_VERSION\"/" version.js
    sed -i "s/BUILD_TIME = \".*\"/BUILD_TIME = \"$(date +'%Y-%m-%d %H:%M')\"/" version.js
    sed -i "s/CACHE_NAME = 'pomodoro-v.*'/CACHE_NAME = 'pomodoro-v$NEW_VERSION'/" sw.js
    echo "Bumped version: $VERSION -> $NEW_VERSION (Sync'd with sw.js)"

# Set a specific version (e.g., just set-version 1.4.0)
set-version ver:
    @sed -i "s/APP_VERSION = \".*\"/APP_VERSION = \"{{ver}}\"/" version.js; \
    sed -i "s/BUILD_TIME = \".*\"/BUILD_TIME = \"$(date +'%Y-%m-%d %H:%M')\"/" version.js; \
    sed -i "s/CACHE_NAME = 'pomodoro-v.*'/CACHE_NAME = 'pomodoro-v{{ver}}'/" sw.js; \
    echo "Version set to {{ver}} (Sync'd with sw.js)"

# Full release: bump version, check docs, commit, push, and deploy
release msg: bump check-docs
    just commit "{{msg}}"
    just push
    just deploy
