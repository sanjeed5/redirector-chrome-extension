> Disclaimer: Vibe coded in few minutes with Cursor. Redirecting works as expected. Haven't tested the import/export rules feature.

# Website Redirector Chrome Extension

A Chrome extension that allows you to set up custom website redirects. When you visit a source website, you will be automatically redirected to your specified destination website.

## Features

- Create custom redirect rules from one website to another
- Enable or disable individual redirects
- Enable or disable the entire extension
- Export and import your redirect rules for backup
- Simple and intuitive user interface

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right corner
4. Click "Load unpacked" and select the directory containing this extension
5. The extension will be installed and ready to use

## Usage

1. Click on the Website Redirector icon in your browser toolbar to open the popup
2. Add a new redirect rule:
   - Enter the source URL (the website you want to be redirected from)
   - Enter the destination URL (the website you want to be redirected to)
   - Click "Add Redirect"
3. Manage your redirects:
   - Toggle individual redirects on/off using the checkbox
   - Delete redirects using the "×" button
   - Toggle the entire extension on/off using the checkbox at the top
4. Import/Export:
   - Click "Export Rules" to save your redirects as a JSON file
   - Click "Import Rules" to load redirects from a previously exported file

## URL Format Guidelines

- **Source URL**: Simply enter the domain name without any protocol or www prefix
  - Example: `linkedin.com` or `example.com`
  - The extension will automatically handle www and https variants
- **Destination URL**: Enter a domain name or full URL
  - Example: `google.com` or `https://www.google.com`
  - If you omit the protocol, https:// will be added automatically

## Testing

To test the extension:

1. Add a redirect rule (e.g., redirect from `linkedin.com` to `google.com`)
2. Open a new tab and navigate to the source URL (e.g., `https://www.linkedin.com`)
3. You should be automatically redirected to the destination URL
4. If the redirect doesn't work immediately:
   - Try reloading the page
   - Restart the browser if needed
   - Check that the extension is enabled

## Troubleshooting

If redirects are not working:
- Make sure the extension is enabled (checkbox at the top of the popup)
- Check that the individual redirect rule is enabled
- Try adding the rule with just the domain name (e.g., `linkedin.com` instead of `www.linkedin.com`)
- Check Chrome's console for any error messages by opening DevTools (F12) and looking at the Console tab

## Privacy

This extension:
- Only redirects based on the rules you define
- Stores redirect rules locally in your browser
- Does not send any data to remote servers
- Does not track your browsing activity

## License

This project is open source and available under the [MIT License](LICENSE). 