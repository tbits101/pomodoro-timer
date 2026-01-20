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
