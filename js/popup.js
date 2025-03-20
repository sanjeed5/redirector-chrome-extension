document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const redirectForm = document.getElementById('redirect-form');
  const sourceUrlInput = document.getElementById('source-url');
  const destinationUrlInput = document.getElementById('destination-url');
  const redirectsContainer = document.getElementById('redirects-container');
  const noRedirectsMessage = document.getElementById('no-redirects-message');
  const extensionEnabledCheckbox = document.getElementById('extension-enabled');
  const exportBtn = document.getElementById('export-btn');
  const importFileInput = document.getElementById('import-file');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  
  // Load redirects from storage
  loadRedirects();
  
  // Load extension enabled state
  chrome.storage.sync.get('isEnabled', (result) => {
    if (result.isEnabled !== undefined) {
      extensionEnabledCheckbox.checked = result.isEnabled;
    }
  });
  
  // Event Listeners
  redirectForm.addEventListener('submit', addRedirect);
  extensionEnabledCheckbox.addEventListener('change', toggleExtension);
  exportBtn.addEventListener('click', exportRules);
  importFileInput.addEventListener('change', importRules);
  settingsBtn.addEventListener('click', toggleSettingsPanel);
  
  // Close settings panel when clicking outside
  document.addEventListener('click', (event) => {
    if (!settingsPanel.contains(event.target) && 
        event.target !== settingsBtn && 
        !settingsPanel.classList.contains('hidden')) {
      settingsPanel.classList.add('hidden');
    }
  });
  
  // Toggle settings panel
  function toggleSettingsPanel(e) {
    e.stopPropagation(); // Prevent the document click handler from immediately closing it
    settingsPanel.classList.toggle('hidden');
  }
  
  // Helper function to clean up URLs
  function normalizeUrl(url) {
    // Remove any protocol and www prefix
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase().trim();
  }
  
  // Add a new redirect
  function addRedirect(e) {
    e.preventDefault();
    
    let sourceUrl = sourceUrlInput.value.trim();
    let destinationUrl = destinationUrlInput.value.trim();
    
    // Validate URLs
    if (!sourceUrl || !destinationUrl) {
      alert('Please fill in both fields');
      return;
    }
    
    // Normalize the source URL (remove http:// or https:// and www. if present)
    sourceUrl = normalizeUrl(sourceUrl);
    
    // Add https:// to destination if missing
    if (!/^https?:\/\//i.test(destinationUrl)) {
      destinationUrl = 'https://' + destinationUrl;
    }
    
    // Create a new redirect rule
    const newRule = {
      id: Date.now().toString(),
      source: sourceUrl,
      destination: destinationUrl,
      isEnabled: true,
      createdAt: new Date().toISOString()
    };
    
    // Save to storage
    chrome.storage.sync.get('redirectRules', (result) => {
      const redirectRules = result.redirectRules || [];
      
      // Check for duplicates
      const isDuplicate = redirectRules.some(rule => normalizeUrl(rule.source) === sourceUrl);
      
      if (isDuplicate) {
        if (!confirm(`A redirect for "${sourceUrl}" already exists. Do you want to add it anyway?`)) {
          return;
        }
      }
      
      redirectRules.push(newRule);
      
      chrome.storage.sync.set({ redirectRules }, () => {
        // Clear form
        redirectForm.reset();
        
        // Refresh UI
        renderRedirectsList(redirectRules);
      });
    });
  }
  
  // Load and display redirects
  function loadRedirects() {
    chrome.storage.sync.get('redirectRules', (result) => {
      const redirectRules = result.redirectRules || [];
      renderRedirectsList(redirectRules);
    });
  }
  
  // Render the redirects list
  function renderRedirectsList(redirectRules) {
    // Clear the container
    redirectsContainer.innerHTML = '';
    
    // Show or hide the "no redirects" message
    if (redirectRules.length === 0) {
      noRedirectsMessage.style.display = 'block';
    } else {
      noRedirectsMessage.style.display = 'none';
      
      // Create and append redirect items
      redirectRules.forEach(rule => {
        const redirectItem = document.createElement('li');
        redirectItem.className = 'redirect-item';
        redirectItem.dataset.id = rule.id;
        
        redirectItem.innerHTML = `
          <div class="redirect-source">${rule.source}</div>
          <div class="redirect-destination">${rule.destination}</div>
          <div class="toggle-container">
            <span class="toggle-label">Enabled:</span>
            <input type="checkbox" class="rule-toggle" ${rule.isEnabled ? 'checked' : ''}>
          </div>
          <button class="delete-btn" title="Delete">×</button>
        `;
        
        // Add event listeners for toggle and delete
        const toggleCheckbox = redirectItem.querySelector('.rule-toggle');
        toggleCheckbox.addEventListener('change', () => toggleRedirectRule(rule.id));
        
        const deleteBtn = redirectItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteRedirectRule(rule.id));
        
        redirectsContainer.appendChild(redirectItem);
      });
    }
  }
  
  // Toggle extension on/off
  function toggleExtension() {
    const isEnabled = extensionEnabledCheckbox.checked;
    chrome.storage.sync.set({ isEnabled });
  }
  
  // Toggle specific redirect rule on/off
  function toggleRedirectRule(ruleId) {
    chrome.storage.sync.get('redirectRules', (result) => {
      const redirectRules = result.redirectRules || [];
      
      // Find and update the rule
      const updatedRules = redirectRules.map(rule => {
        if (rule.id === ruleId) {
          return { ...rule, isEnabled: !rule.isEnabled };
        }
        return rule;
      });
      
      // Save updated rules
      chrome.storage.sync.set({ redirectRules: updatedRules });
    });
  }
  
  // Delete a redirect rule
  function deleteRedirectRule(ruleId) {
    if (confirm('Are you sure you want to delete this redirect?')) {
      chrome.storage.sync.get('redirectRules', (result) => {
        const redirectRules = result.redirectRules || [];
        
        // Filter out the rule to delete
        const updatedRules = redirectRules.filter(rule => rule.id !== ruleId);
        
        // Save updated rules
        chrome.storage.sync.set({ redirectRules: updatedRules }, () => {
          // Refresh UI
          renderRedirectsList(updatedRules);
        });
      });
    }
  }
  
  // Export rules to JSON file
  function exportRules() {
    chrome.storage.sync.get('redirectRules', (result) => {
      const redirectRules = result.redirectRules || [];
      
      if (redirectRules.length === 0) {
        alert('No redirect rules to export');
        return;
      }
      
      // Create data blob
      const dataStr = JSON.stringify(redirectRules, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'redirector-rules.json';
      
      // Trigger download and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      // Hide settings panel after export
      settingsPanel.classList.add('hidden');
    });
  }
  
  // Import rules from JSON file
  function importRules(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedRules = JSON.parse(event.target.result);
        
        if (!Array.isArray(importedRules)) {
          throw new Error('Invalid format');
        }
        
        // Validate each rule
        importedRules.forEach(rule => {
          if (!rule.source || !rule.destination || rule.id === undefined) {
            throw new Error('Invalid rule format');
          }
        });
        
        // Ask user if they want to replace or merge
        const action = confirm('Do you want to replace all existing rules? Click OK to replace or Cancel to merge with existing rules.');
        
        chrome.storage.sync.get('redirectRules', (result) => {
          let updatedRules;
          
          if (action) {
            // Replace all rules
            updatedRules = importedRules;
          } else {
            // Merge with existing rules
            const existingRules = result.redirectRules || [];
            updatedRules = [...existingRules];
            
            // Add only new rules (avoid duplicates by checking IDs)
            const existingIds = existingRules.map(rule => rule.id);
            importedRules.forEach(rule => {
              if (!existingIds.includes(rule.id)) {
                updatedRules.push(rule);
              }
            });
          }
          
          // Save and update UI
          chrome.storage.sync.set({ redirectRules: updatedRules }, () => {
            renderRedirectsList(updatedRules);
            alert(`Successfully imported ${importedRules.length} rules`);
            
            // Hide settings panel after import
            settingsPanel.classList.add('hidden');
          });
        });
      } catch (error) {
        alert(`Error importing rules: ${error.message}`);
      }
      
      // Reset the file input
      e.target.value = '';
    };
    
    reader.readAsText(file);
  }
}); 