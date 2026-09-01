# 🔒 Privacy Policy — SteamSquad

**Effective Date:** September 1, 2026  
**Last Updated:** September 1, 2026

SteamSquad ("we", "our", or "the Extension") is committed to protecting your privacy. This Privacy Policy describes how SteamSquad handles data and information.

---

## 1. Zero Data Collection & Storage
SteamSquad operates entirely client-side within your browser:
- **No Personal Data Collected:** We do NOT collect, store, transmit, or sell your personal information, IP address, browsing history, or device information.
- **No Account or Login Required:** SteamSquad does NOT require or ask for your Steam password, login credentials, or OAuth tokens.
- **No Remote Analytics or Tracking:** We do NOT use any third-party tracking scripts, analytics, telemetry, or advertising SDKs.

---

## 2. How Data is Handled
- **Public Profile Lookups:** When you add a Steam profile URL, username, or SteamID64, the Extension sends a request directly from your browser to public Steam Community XML / API endpoints (`https://steamcommunity.com` and `https://api.steampowered.com`) to retrieve public game library data.
- **Local Storage (`chrome.storage.local`):**
  - Squad members (names, public avatar URLs, and game lists) and custom team names created by you are saved exclusively in your browser's local storage.
  - If you choose to enter an optional Steam Web API key, it is stored locally on your device only.
  - This data never leaves your computer and is never sent to any external server.
- **Clipboard Access:** The `clipboardWrite` permission is used solely when you explicitly click a button (e.g., *"Copy to Clipboard"* for Discord/WhatsApp polls or *"Share"* for invitation messages) to copy the formatted text to your clipboard.

---

## 3. Third-Party Services
The Extension interacts only with the following official Valve / Steam endpoints:
- `https://steamcommunity.com` (Public XML Profile Data)
- `https://store.steampowered.com` (Public Game Pricing & Discount Data)
- `https://api.steampowered.com` (Steam Web API, if user provides an API key)

These interactions are subject to Valve Corporation's Privacy Policy.

---

## 4. User Rights & Data Deletion
You have full control over all stored data:
- You can remove individual squad members or teams at any time.
- Clicking the **"Tümünü Temizle" / "Clear All"** button instantly deletes all stored squad members and teams.
- Uninstalling the Extension completely removes all locally stored data from your browser.

---

## 5. Contact & Open Source
SteamSquad is an open-source project. If you have questions or inquiries regarding this policy, please contact us via our GitHub repository:  
👉 [https://github.com/HarunUYGUC/steam-squad](https://github.com/HarunUYGUC/steam-squad)
