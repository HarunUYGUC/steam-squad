/**
 * SteamSquad — Service Worker (Manifest V3)
 * Handles side panel behavior, content script triggers, and extension lifecycle.
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

// Handle messages from content script (e.g. open side panel from in-page badge)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'OPEN_SIDE_PANEL') {
    // Validate and save target appId asynchronously without awaiting (so user gesture token does not expire!)
    if (message.appId) {
      const cleanAppId = parseInt(message.appId, 10);
      if (Number.isSafeInteger(cleanAppId) && cleanAppId > 0) {
        chrome.storage.local.set({ steamsquad_target_app_id: cleanAppId });
      }
    }

    // Call chrome.sidePanel.open() synchronously right inside the message handler
    if (sender.tab?.id && chrome.sidePanel?.open) {
      chrome.sidePanel.open({ tabId: sender.tab.id }).then(() => {
        sendResponse({ success: true });
      }).catch((err) => {
        console.warn('[SteamSquad] sidePanel.open(tabId) notice:', err.message);
        if (sender.tab?.windowId) {
          chrome.sidePanel.open({ windowId: sender.tab.windowId }).then(() => {
            sendResponse({ success: true });
          }).catch((winErr) => {
            console.warn('[SteamSquad] sidePanel.open(windowId) notice:', winErr.message);
            sendResponse({ success: false, error: winErr.message });
          });
        } else {
          sendResponse({ success: false, error: err.message });
        }
      });
      return true; // Keep sendResponse channel open for async callback
    } else if (sender.tab?.windowId && chrome.sidePanel?.open) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId }).then(() => {
        sendResponse({ success: true });
      }).catch((winErr) => {
        console.warn('[SteamSquad] sidePanel.open(windowId) notice:', winErr.message);
        sendResponse({ success: false, error: winErr.message });
      });
      return true;
    }

    sendResponse({ success: false, error: 'Side panel API not available' });
    return false;
  }
});
