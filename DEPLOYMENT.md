# How to Publish Your Pomodoro Timer for Free

Since this is a static website (HTML, CSS, and JavaScript only), you can host it for free on several excellent platforms. Here are the three best methods:

## Option 1: GitHub Pages (Recommended)
**Best if:** You already use Git/GitHub.

1.  **Create a Repo**: Go to [GitHub.com](https://github.com/new) and create a new public repository (e.g., `pomodoro-timer`).
2.  **Push Your Code**:
    ```bash
    # Run these in your terminal project folder
    git remote add origin https://github.com/YOUR_USERNAME/pomodoro-timer.git
    git branch -M main
    git push -u origin main
    ```
3.  **Activate Pages**:
    -   Go to your repository settings on GitHub.
    -   Click **Pages** in the left sidebar.
    -   Under **Branch**, select `main` (or `master`) and hit **Save**.
4.  **Done!** Your site will be live at `https://YOUR_USERNAME.github.io/pomodoro-timer/`.

### How to Update Your Live Site
If you make changes to your code, you need to update the `gh-pages` branch (which Github uses to host the site). Run these commands:

```bash
# 1. Save your changes to the main branch first
git add .
git commit -m "Your update message"
git push origin main

# 2. Update the hosting branch
git checkout gh-pages
git merge main
git push origin gh-pages

# 3. Go back to main
git checkout main
```

## Option 2: Netlify Drop (Easiest)
**Best if:** You don't want to use the command line.

1.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Open your file explorer on your computer.
3.  **Drag and drop** your entire `pomodoro` project folder onto the Netlify page.
4.  That's it! Netlify will give you a live URL instantly (e.g., `romantic-turing-123456.netlify.app`).
5.  *Optional*: Sign up for a free account to change the site name to something better.

## Option 3: Vercel
**Best for:** fast performance and easy updates if you use Git.

1.  Go to [vercel.com](https://vercel.com/signup) and sign up.
2.  Import your GitHub repository.
3.  Vercel will detect it's a static site. Click **Deploy**.
4.  Your site is live instantly!
