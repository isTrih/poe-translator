import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  disabled: true,
  binaries: {
    chrome: '/path/to/chrome-beta', // Use Chrome Beta instead of regular Chrome
    firefox: 'firefoxdeveloperedition', // Use Firefox Developer Edition instead of regular Firefox
    edge: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', // Correct path to executable
  },
  chromiumArgs: ['--remote-debugging-port=9222','--user-data-dir=./.wxt/chrome-data'],
});