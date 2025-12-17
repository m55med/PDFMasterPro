// PDF Master Pro - Service Worker
// Handles extension lifecycle and context menu

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('PDF Master Pro installed successfully!');
  
  // Create context menu for PDF links
  chrome.contextMenus.create({
    id: 'openWithPDFMaster',
    title: 'Open with PDF Master Pro',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.pdf', '*://*/*.PDF']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openWithPDFMaster') {
    // Open dashboard with the PDF URL
    chrome.tabs.create({
      url: chrome.runtime.getURL(`dashboard/index.html?pdf=${encodeURIComponent(info.linkUrl)}`)
    });
  }
});

// Handle messages from popup and dashboard
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'openDashboard':
      chrome.tabs.create({
        url: chrome.runtime.getURL('dashboard/index.html')
      });
      sendResponse({ success: true });
      break;
      
    case 'openTool':
      chrome.tabs.create({
        url: chrome.runtime.getURL(`tools/${message.tool}/index.html`)
      });
      sendResponse({ success: true });
      break;
      
    case 'getVersion':
      const manifest = chrome.runtime.getManifest();
      sendResponse({ version: manifest.version });
      break;
      
    case 'downloadFile':
      chrome.downloads.download({
        url: message.url,
        filename: message.filename,
        saveAs: message.saveAs || false
      }, (downloadId) => {
        sendResponse({ downloadId });
      });
      return true; // Keep channel open for async response
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  return true;
});

// Handle extension icon click (fallback)
chrome.action.onClicked.addListener((tab) => {
  // This won't fire if popup is set, but good fallback
  chrome.tabs.create({
    url: chrome.runtime.getURL('dashboard/index.html')
  });
});
