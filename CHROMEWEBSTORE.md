# Chrome Web Store Listing — SteamSquad

> Last Updated: 2026-09-01

## Store Listing

**Extension Name** [REQUIRED]
SteamSquad — Steam Library Matcher

**Short Description** [REQUIRED]
Find what games your squad owns in common on Steam with player count filters, discounts, roulette, and 1-click Discord polls.

**Detailed Description** [REQUIRED]
Tired of the endless "What should we play together tonight?" debate with your gaming friends?

SteamSquad solves this dilemma in seconds. Simply add your friends via their public Steam profile links or vanity usernames—no login or password ever required! SteamSquad instantly analyzes everyone's game libraries to find the perfect games you all own in common.

KEY FEATURES:
- 100% Shared Games: Instantly see games owned by everyone in your squad.
- Missing Player Detection (N-1 & N-2 Mode): See games owned by almost everyone and check if the missing friend can grab it on sale with live Steam discount prices.
- Smart Party Size Matching: Automatically filters out games that can't fit your current squad size (e.g., filters 4-player games when 5 friends are active).
- Game Mode Filtering: Filter by Co-Op / PvE, PvP / Competitive, Party Games, or Survival.
- Fast Download Mode (< 5 GB): Perfect for "Let's download something quick in 10 minutes and play!"
- 1-Click Discord & WhatsApp Poll Exporter: Copy formatted voting polls with emojis straight to your clipboard so friends without the extension can vote instantly.
- Decision Wheel (Roulette) & Veto Arena: Settle arguments with an interactive spinning wheel or a turn-based elimination arena directly shareable on Discord screenshare.
- Squad Presets: Save groups like "Weekend Quad", "Duo Duo", or "Cousins" for instant 1-click loading.

HOW TO USE:
1. Open the SteamSquad Side Panel in Chrome.
2. Enter your friends' Steam profile links or usernames (e.g., steamcommunity.com/id/username).
3. Switch to the Games tab to view instant 100% matches and N-1 games.
4. Copy a Discord poll or spin the Roulette wheel to pick tonight's champion game!

PRIVACY & ZERO PASSWORD SECURITY:
SteamSquad operates entirely client-side using public Steam Community data. No Steam login or credentials are ever requested or stored.

SUPPORT & FEEDBACK:
Have questions or suggestions? Visit our GitHub repository or contact our developer support.

**Category** [REQUIRED]
Social & Communication

**Single Purpose** [REQUIRED]
Matches public Steam libraries among squad friends to find shared multiplayer games and generate group voting polls.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|---|---|---|---|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Small Icon | 16×16 PNG | ✅ Ready | `icons/icon-16.png` |
| Medium Icon | 48×48 PNG | ✅ Ready | `icons/icon-48.png` |
| Screenshot 1 (Squad Management) [REQUIRED] | 1280×800 | ⬜ Draft | `assets/screenshot-squad.png` |
| Screenshot 2 (Library Overlap & Filters) [RECOMMENDED] | 1280×800 | ⬜ Draft | `assets/screenshot-matches.png` |
| Screenshot 3 (Discord Poll Exporter) [RECOMMENDED] | 1280×800 | ⬜ Draft | `assets/screenshot-poll.png` |
| Screenshot 4 (Roulette & Veto Arena) | 1280×800 | ⬜ Draft | `assets/screenshot-roulette.png` |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Draft | `assets/promo-small.png` |
| Marquee Promo Tile | 1400×560 | ⬜ Draft | `assets/promo-marquee.png` |

---

## Permissions Justification

| Permission | Type | Justification |
|---|---|---|
| `sidePanel` | permissions | Required to render the SteamSquad interface as a dedicated, persistent Chrome Side Panel alongside Steam and Discord web apps. |
| `storage` | permissions | Required to store user squad presets, local user settings, and cached game store metadata to reduce network overhead. |
| `clipboardWrite` | permissions | Required to copy 1-click formatted Discord and WhatsApp group polls to the user clipboard. |
| `https://steamcommunity.com/*` | host_permissions | Required to fetch public Steam profile game libraries in XML format without requiring authentication. |
| `https://store.steampowered.com/*` | host_permissions | Required to fetch Steam Store pricing and discount metadata for N-1 missing game suggestions. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

SteamSquad does NOT collect, track, or transmit any personally identifiable information off-device. All profile lookups occur directly from the user's browser to the public Steam Community and Steam Store endpoints.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL** [RECOMMENDED]
`https://github.com/steamsquad/steamsquad/blob/main/PRIVACY.md`

Summary: SteamSquad is a client-side tool. It does not operate remote servers, does not log user accounts, and stores only user-created squad presets locally in browser storage.

---

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

---

## Developer Info

**Publisher Name**: SteamSquad Team
**Contact Email**: support@steamsquad.app
**Support URL**: `https://github.com/steamsquad/steamsquad/issues`

---

## Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 1.0.0 | 2026-09-01 | Initial release with Squad Management, Overlap Engine, N-1 Missing Player with discount detection, 1-Click Discord/WhatsApp Poll Exporter, Canvas Roulette wheel with Web Audio sound effects, and Veto Arena mode. | Draft |
