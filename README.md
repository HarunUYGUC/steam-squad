# 🎮 SteamSquad — Steam Library Matcher (Chrome Extension)

> Put an end to the **"What are we playing tonight?"** debate! A modern Chrome Side Panel extension that compares your gaming squad's Steam libraries in seconds, detects live store discounts, and helps you pick the perfect game with interactive wheels, veto arenas, and instant group polls.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-success?logo=googlechrome)](https://chromewebstore.google.com/detail/ipddbahofdhagjeheeolfloklgoeppeo?utm_source=item-share-cb)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen)
![Version](https://img.shields.io/badge/version-1.4.4-blue)
![Privacy First](https://img.shields.io/badge/Privacy-Zero%20Password-blue)
![Platform](https://img.shields.io/badge/Chrome-Side%20Panel-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Key Features

- 🔒 **Zero-Credential & Privacy-First Architecture:** No passwords, logins, or tokens required. Works solely with public Steam profile URLs (`steamcommunity.com/id/username`) or SteamID64.
- 👥 **Dynamic Squad & Sub-Teams Management:**
  - **`[👥 All Squad]`**: Default primary squad that automatically includes all added members.
  - **`[➕ Create Squad]`**: Create custom sub-teams like *"Duo Team"*, *"5v5 CS Squad"*, or *"Weekend 4"* and toggle specific players with a single click.
- 🎯 **Smart Library Overlap & Missing Player Detection:**
  - **All Own (100%):** Instantly lists games owned by every active member in the squad.
  - **1 Missing & 2 Missing:** Identifies which friends are missing the game and retrieves live Steam Store discount prices.
  - **💬 1-Click Squad Invite / Nudge:** Generates customized, copyable Steam invite messages tailored for the friend missing the game.
- ☑️ **"Played" Game Tracking:**
  - Mark completed or played games with one click.
  - Played games are automatically excluded from the **Poll Generator**, **Roulette Wheel**, and **Veto Arena**.
- 📋 **1-Click Discord & WhatsApp Poll Exporter:** Formats and copies ready-to-share emoji voting polls directly to your clipboard so friends without the extension can vote instantly in chat.
- 🎡 **Roulette Wheel & Veto Elimination Arena:**
  - Dynamic 32+ game elimination arena and 60 FPS HTML5 Canvas roulette wheel with synthesized Web Audio FX tailored to your active filters (*All Own*, *1 Missing*, etc.).
- 🔑 **Optional Steam Web API Key Support:**
  - Free API key support to load complete libraries for profiles with hundreds of games (stored securely in local storage, deletable at any time).
  - Built-in queue and rate-limiting protection against Steam Store API limits.

---

## 📂 Project Structure

```
steam-squad/
├── manifest.json              # Manifest V3 (Side Panel, Storage, Steam Host Permissions)
├── CHROMEWEBSTORE.md          # Chrome Web Store listing copy and permission justifications
├── README.md                  # Project overview and documentation
├── LICENSE                    # MIT License
├── PRIVACY.md                 # Privacy Policy documentation
├── store-assets/              # Store graphics, screenshots, and promo banners
├── icons/                     # 16, 48, 128px PNG extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── src/
    ├── background/
    │   └── service-worker.js  # Side panel behavior manager and background service
    ├── sidepanel/
    │   ├── sidepanel.html     # Main side panel markup
    │   ├── sidepanel.css      # Dark Steam-themed styles
    │   ├── sidepanel.js       # UI state controller and event orchestration
    │   ├── squad-manager.js   # Squad & custom team state management
    │   ├── overlap-engine.js  # Library overlap calculation and filter engine
    │   ├── poll-generator.js  # Discord & WhatsApp poll formatter
    │   └── roulette.js        # Canvas roulette wheel, audio FX, and Veto arena
    └── services/
        ├── steam-service.js   # Steam API, XML parser, and rate-limited store fetcher
        └── game-metadata.js   # Multiplayer capacity and game mode database
```

---

## 📦 Installation Guide

### Developer Mode Installation (Manual Setup):

1. Clone or download this repository to your computer:
   ```bash
   git clone https://github.com/HarunUYGUC/steam-squad.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions` in the address bar.
3. Enable the **"Developer mode"** toggle in the top right corner.
4. Click the **"Load unpacked"** button in the top left corner.
5. Select the `steam-squad` folder where this project is located.
6. The extension will be installed immediately and added to your Chrome toolbar!

---

## 📄 License

MIT License. Steam and the Steam logo are registered trademarks of Valve Corporation. This project is not affiliated with Valve Corporation.
