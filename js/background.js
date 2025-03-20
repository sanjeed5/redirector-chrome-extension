// Store for redirect rules
let redirectRules = [];
let isExtensionEnabled = true;

// Initialize extension data from storage
chrome.storage.sync.get(['redirectRules', 'isEnabled'], (result) => {
  if (result.redirectRules) {
    redirectRules = result.redirectRules;
  }
  
  if (result.isEnabled !== undefined) {
    isExtensionEnabled = result.isEnabled;
  }
});

// Listen for changes in storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.redirectRules) {
    redirectRules = changes.redirectRules.newValue;
  }
  
  if (changes.isEnabled) {
    isExtensionEnabled = changes.isEnabled.newValue;
  }
});

// Helper function to normalize URLs for comparison
function normalizeUrl(url) {
  // Remove protocol and www prefix
  return url.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase();
}

// Main redirect logic
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only process main frame navigation (not iframes, etc.)
  if (details.frameId !== 0) return;
  
  // Skip if extension is disabled
  if (!isExtensionEnabled) return;
  
  try {
    // Parse the current URL
    const currentUrl = new URL(details.url);
    
    // Skip redirects for non-http(s) protocols
    if (currentUrl.protocol !== 'http:' && currentUrl.protocol !== 'https:') {
      return;
    }
    
    // Normalize the current URL for comparison
    const normalizedCurrentUrl = normalizeUrl(currentUrl.hostname + currentUrl.pathname);
    
    // Debug log
    console.log('Checking URL:', normalizedCurrentUrl);
    
    // Check if the current URL matches any redirect rule
    for (const rule of redirectRules) {
      // Skip if this specific rule is disabled
      if (!rule.isEnabled) continue;
      
      // Normalize the source URL from the rule
      const normalizedSource = normalizeUrl(rule.source);
      
      console.log('Comparing with rule:', normalizedSource, '->', rule.destination);
      
      // Check if current URL starts with the source from our rule
      if (normalizedCurrentUrl === normalizedSource || 
          normalizedCurrentUrl.startsWith(normalizedSource + '/')) {
        
        // Prevent redirect loops
        const destUrl = new URL(/^https?:\/\//i.test(rule.destination) ? 
                               rule.destination : 
                               'https://' + rule.destination);
        
        const normalizedDest = normalizeUrl(destUrl.hostname + destUrl.pathname);
        
        // Don't redirect if we're already at the destination
        if (normalizedCurrentUrl === normalizedDest) {
          console.log('Already at destination, skipping redirect');
          continue;
        }
        
        // Create the destination URL and redirect
        console.log(`Redirecting from ${details.url} to ${rule.destination}`);
        chrome.tabs.update(details.tabId, { url: rule.destination });
        break; // Stop after first matching rule
      }
    }
  } catch (error) {
    console.error('Error in redirect logic:', error);
  }
}); 