/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

// Popup script for ArkhamJS DevTools Extension
class DevToolsPopup {
  constructor() {
    this.currentTab = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    await this.getCurrentTab();
    this.setupEventListeners();
    this.updateStatus();
    this.loadMetrics();
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  setupEventListeners() {
    document.getElementById('open-devtools').addEventListener('click', () => {
      this.openDevTools();
    });

    document.getElementById('export-snapshot').addEventListener('click', () => {
      this.exportSnapshot();
    });

    document.getElementById('import-snapshot').addEventListener('click', () => {
      this.importSnapshot();
    });

    document.getElementById('clear-history').addEventListener('click', () => {
      this.clearHistory();
    });

    document.getElementById('docs-link').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://arkhamjs.io/docs/devtools' });
    });
  }

  async updateStatus() {
    if (!this.currentTab) return;

    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'GET_ARKHAM_STATUS'
      });

      this.isConnected = response?.isConnected || false;
      this.updateStatusUI();
    } catch (error) {
      this.isConnected = false;
      this.updateStatusUI();
    }
  }

  updateStatusUI() {
    const statusEl = document.getElementById('status');
    const statusTextEl = document.getElementById('status-text');
    const openDevToolsBtn = document.getElementById('open-devtools');

    if (this.isConnected) {
      statusEl.className = 'status connected';
      statusTextEl.textContent = 'Connected to ArkhamJS';
      openDevToolsBtn.disabled = false;
    } else {
      statusEl.className = 'status disconnected';
      statusTextEl.textContent = 'No ArkhamJS app detected';
      openDevToolsBtn.disabled = true;
    }
  }

  async loadMetrics() {
    if (!this.currentTab || !this.isConnected) return;

    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'GET_PERFORMANCE_METRICS'
      });

      if (response?.metrics) {
        this.updateMetricsUI(response.metrics);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  updateMetricsUI(metrics) {
    const metricsEl = document.getElementById('metrics');
    const actionCountEl = document.getElementById('action-count');
    const avgDurationEl = document.getElementById('avg-duration');
    const stateSizeEl = document.getElementById('state-size');

    if (metrics.actionCount > 0) {
      metricsEl.style.display = 'block';
      actionCountEl.textContent = metrics.actionCount;
      avgDurationEl.textContent = `${Math.round(metrics.averageDuration)}ms`;

      const stateSizeKB = metrics.stateSize ? Math.round(metrics.stateSize / 1024) : 0;
      stateSizeEl.textContent = `${stateSizeKB} KB`;
    } else {
      metricsEl.style.display = 'none';
    }
  }

  async openDevTools() {
    if (!this.currentTab) return;

    try {
      await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'OPEN_DEVTOOLS'
      });
      window.close();
    } catch (error) {
      console.error('Error opening DevTools:', error);
    }
  }

  async exportSnapshot() {
    if (!this.currentTab) return;

    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'EXPORT_SNAPSHOT'
      });

      if (response?.success) {
        // The background script will handle the download
        console.log('Snapshot exported successfully');
      } else {
        console.error('Failed to export snapshot:', response?.error);
      }
    } catch (error) {
      console.error('Error exporting snapshot:', error);
    }
  }

  async importSnapshot() {
    if (!this.currentTab) return;

    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const snapshotData = e.target.result;
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
              type: 'IMPORT_SNAPSHOT',
              payload: { snapshotData }
            });

            if (response?.success) {
              console.log('Snapshot imported successfully');
            } else {
              console.error('Failed to import snapshot:', response?.error);
            }
          } catch (error) {
            console.error('Error importing snapshot:', error);
          }
        };
        reader.readAsText(file);
      };

      input.click();
    } catch (error) {
      console.error('Error setting up file import:', error);
    }
  }

  async clearHistory() {
    if (!this.currentTab) return;

    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'CLEAR_HISTORY'
      });

      if (response?.success) {
        console.log('History cleared successfully');
        this.loadMetrics(); // Refresh metrics
      } else {
        console.error('Failed to clear history:', response?.error);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }
}

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DevToolsPopup();
});
