# Default recipe to list all available commands
default:
    @just --list

# Start a local development server
serve:
    python3 -m http.server 8080

# Show git status
status:
    git status

# Run automated tests
test:
    npx playwright test

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

# Create an annotated git tag with current version and push it
tag message:
    #!/usr/bin/env bash
    VERSION=$(grep -oP 'APP_VERSION = "\K[^"]+' version.js)
    git tag -a "v$VERSION" -m "{{message}}"
    git push origin "v$VERSION"
    echo "Created and pushed tag v$VERSION"

# Push tags only (useful if tag was created but not pushed)
push-tags:
    git push --tags

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


# Full release: run tests, bump version, check docs, commit, push, tag, and deploy
release msg: bump check-docs
    just commit "{{msg}}"
    just push
    just tag "{{msg}}"
    just deploy

# --- Android specific commands ---

# Initialize the 'www' folder with current assets
android-prep:
    @mkdir -p www
    cp index.html style.css script.js sw.js manifest.json version.js favicon.png icon-192.png icon-512.png www/

# Sync web assets to the Android project
android-sync: android-prep
    npx cap sync android

# Open the Android project in Android Studio
android-open: android-sync
    npx cap open android
