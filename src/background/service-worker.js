/**
 * SteamSquad — Service Worker (Manifest V3)
 * Handles side panel behavior and extension lifecycle.
 */

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[SteamSquad] Extension installed/updated:', details.reason);
  try {
    // Configure side panel to open automatically when user clicks the extension action icon
    if (chrome.sidePanel?.setPanelBehavior) {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (error) {
    console.error('[SteamSquad] Error setting panel behavior:', error);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  try {
    if (chrome.sidePanel?.setPanelBehavior) {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (error) {
    console.error('[SteamSquad] Error on startup:', error);
  }
});

// Fallback listener for action click if setPanelBehavior is not supported
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab?.windowId && chrome.sidePanel?.open) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    }
  } catch (error) {
    console.error('[SteamSquad] Error opening side panel on click:', error);
  }
});
