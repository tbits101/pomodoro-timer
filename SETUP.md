# WSL2 Maintenance Guide

This guide explains how to keep your development environment running smoothly, especially after a computer restart.

## After Every Restart
WSL2 IP addresses are dynamic and change every time WSL2 restarts.

1.  **Start your Services**:
    If you want to access the app or run tests, ensure your server is running:
    ```bash
    just serve
    ```

2.  **Verify Networking**:
    Try accessing `http://localhost:8080` from your Windows browser.
    
    **If localhost fails (NAT mode):**
    Run the following command to get your current IP:
    ```bash
    just ip
    ```
    Then use the IP provided (e.g., `http://192.168.x.x:8080`).

## One-Time Setup (Already Done)
These steps only need to be repeated if you change your computer or reset WSL:
- `just setup-env`: Installs system dependencies and browsers.
- `just fix-networking`: Configures the firewall.
- **Windows Firewall**: Running the PowerShell command as Admin.

## Troubleshooting
If Antigravity or Playwright cannot reach the app:
1. Check if `python3 -m http.server 8080` is actually running in WSL.
2. Ensure you are binding to `0.0.0.0` (included in `just serve`).
3. If using a VPN, it might interfere with WSL2 networking. Try disconnecting or using the WSL2 IP instead of localhost.
