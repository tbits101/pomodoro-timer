# Pomodoro Timer with Browser Notifications

To build a Pomodoro Timer with Browser Notifications in Google Antigravity, we will leverage its unique agent-first workflow. Since you are using WSL2, the primary challenge is ensuring the Windows-based Antigravity browser can communicate with your Linux environment. 

## Prerequisites
- Google Antigravity IDE installed on Windows.
- Antigravity Browser Extension installed in Chrome.
- WSL2 (Ubuntu recommended). 

## Step 1: Connect Antigravity to WSL2
Antigravity can manage files directly inside your Linux distribution.
Launch Antigravity.
Press `Ctrl + Shift + P` and select Remote-WSL: Connect to WSL.
Open a new folder inside your WSL home directory (e.g., ~/projects/pomodoro). 

## Step 2: Establish the Browser Bridge (WSL2 Only)
Because the IDE is on Windows but the agent is in WSL, you must bridge the browser debugging port.
In WSL Terminal: Find your Gateway IP:
`ip route show | grep default | awk '{print $3}'.`
In Windows PowerShell (Admin): Forward the port (replace GATEWAY_IP with your result):
`netsh interface portproxy add v4tov4 listenaddress=GATEWAY_IP listenport=9222 connectaddress=127.0.0.1 connectport=9222.`
In WSL Terminal: Install socat and start the tunnel:
`sudo apt install socat`
`socat TCP-LISTEN:9222,fork,reuseaddr TCP:GATEWAY_IP:9222 &.` 

## Step 3: Prompt the Agent in Planning Mode
Switch to Planning Mode in the sidebar to ensure the agent creates an architectural plan before coding. 
Enter the following prompt:
"Create a modern web-based Pomodoro timer in my current WSL folder. It needs a 25-minute countdown, Start/Reset buttons, and must trigger a browser notification with sound when the timer hits zero. Use vanilla HTML, CSS, and JS."
 
## Step 4: Review the Implementation Plan
The agent will generate an Implementation Plan Artifact. 
Open the artifact from the Inbox or sidebar.
Verify it includes index.html, styles.css, and script.js with specific logic for the Notification API.
Click Accept All or Proceed to let the agent write the files. 

## Step 5: Verify with Browser Subagent
Antigravity doesn't just write code; it tests it.
In the chat, type: /test in browser.
The Browser Subagent will launch Chrome, navigate to your app, and record a video walkthrough.
Important: You must click "Allow" on the browser notification permission prompt when the agent triggers it.
Review the Verification Artifact (video/screenshots) to ensure the timer functions correctly. 

## Step 6: Refine via "Vibe Coding"
If the UI looks off, simply type: "Make the background glassmorphic and center the timer". The agent will update the CSS and show you the live result immediately. 


## REFERENCE

https://gist.github.com/junielton/8ae25f55a3e795400666cb8d372ee678
