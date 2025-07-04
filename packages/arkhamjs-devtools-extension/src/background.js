/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

// Background script for ArkhamJS DevTools Extension
class DevToolsBackground {
  constructor() {
    this.connections = new Map();
    this.init();
  }

  init() {
    // Listen for devtools connections
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === 'arkhamjs-devtools') {
        this.handleDevToolsConnection(port);
      }
    });

    // Listen for content script messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep the message channel open for async responses
    });

    // Handle extension installation/update
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });
  }

  handleDevToolsConnection(port) {
    const tabId = port.sender.tab.id;
    this.connections.set(tabId, port);

    port.onMessage.addListener((message) => {
      this.handleDevToolsMessage(message, tabId);
    });

    port.onDisconnect.addListener(() => {
      this.connections.delete(tabId);
    });

    // Send initial connection message
    port.postMessage({
      type: 'DEVTOOLS_CONNECTED',
      payload: { tabId },
      timestamp: Date.now()
    });
  }

  handleDevToolsMessage(message, tabId) {
    // Forward messages to content script
    chrome.tabs.sendMessage(tabId, message).catch((error) => {
      console.error('Error sending message to content script:', error);
    });
  }

  handleMessage(message, sender, sendResponse) {
    const tabId = sender.tab?.id;

    switch (message.type) {
      case 'ARKHAM_DISPATCH':
      case 'ARKHAM_STATE_CHANGE':
      case 'ARKHAM_ACTION':
        // Forward to devtools if connected
        const devToolsPort = this.connections.get(tabId);
        if (devToolsPort) {
          devToolsPort.postMessage(message);
        }
        break;

      case 'GET_TAB_INFO':
        sendResponse({
          tabId: tabId,
          url: sender.tab?.url,
          title: sender.tab?.title
        });
        break;

      case 'EXPORT_SNAPSHOT':
        this.handleSnapshotExport(message.payload, sendResponse);
        break;

      case 'IMPORT_SNAPSHOT':
        this.handleSnapshotImport(message.payload, sendResponse);
        break;
    }
  }

  handleSnapshotExport(snapshotData, sendResponse) {
    try {
      const blob = new Blob([JSON.stringify(snapshotData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);

      chrome.downloads.download({
        url: url,
        filename: `arkhamjs-snapshot-${Date.now()}.json`,
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, downloadId });
        }
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  handleSnapshotImport(snapshotData, sendResponse) {
    try {
      const parsed = JSON.parse(snapshotData);
      sendResponse({ success: true, data: parsed });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  handleInstallation(details) {
    if (details.reason === 'install') {
      // Show welcome page
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html')
      });
    } else if (details.reason === 'update') {
      // Show update notification
      console.log('ArkhamJS DevTools updated to version', chrome.runtime.getManifest().version);
    }
  }
}

// Initialize the background script
new DevToolsBackground();
