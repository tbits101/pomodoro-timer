# Default recipe to list all available commands
default:
    @just --list

# Start a local development server
serve:
    python3 -m http.server 8080

# Show git status
status:
    git status

# Stage all changes and commit with a message
commit message:
    @echo "Reminder: Did you update README.md/docs for these changes?"
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

# Increment patch version and update build time
bump:
    #!/usr/bin/env bash
    VERSION=$(grep -oP 'APP_VERSION = "\K[^"]+' version.js)
    NEW_VERSION=$(echo $VERSION | awk -F. '{$NF = $NF + 1;} 1' OFS=.)
    sed -i "s/APP_VERSION = \"$VERSION\"/APP_VERSION = \"$NEW_VERSION\"/" version.js
    sed -i "s/BUILD_TIME = \".*\"/BUILD_TIME = \"$(date +'%Y-%m-%d %H:%M')\"/" version.js
    echo "Bumped version: $VERSION -> $NEW_VERSION"

# Set a specific version (e.g., just set-version 1.4.0)
set-version ver:
    @sed -i "s/APP_VERSION = \".*\"/APP_VERSION = \"{{ver}}\"/" version.js; \
    sed -i "s/BUILD_TIME = \".*\"/BUILD_TIME = \"$(date +'%Y-%m-%d %H:%M')\"/" version.js; \
    echo "Version set to {{ver}}"
