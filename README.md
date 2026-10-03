# aurora-clock

A Chrome extension that simulates a desktop analog clock with multiple dial styles, date display, and live weather.

## Features

- 🎨 **Multiple Dial Styles**: Classic, Modern, Minimalist, and Vintage styles available
- ⏰ **Real-time Clock Display**: Accurate analog clock with smooth hand animations
- 📅 **Dual Date Display**: Shows both Gregorian and Lunar dates simultaneously
- 🌤️ **Live Weather**: Current conditions from Open-Meteo using the browser location
- ⌨️ **Keyboard Shortcuts**: 
  - Default open shortcut: `Ctrl+Shift+O` (Windows/Linux) or `Command+Shift+O` (Mac)
  - Close popup shortcut: `Escape` (built-in feature)
  - Supports custom shortcut settings
- 📱 **Responsive Design**: Adapts to different plugin window sizes
- 🍎 **Apple-style UI**: Modern design with rounded corners, shadows, and gradients

## Tech Stack

- **HTML5**: Plugin structure and layout
- **CSS3**: Styling including multiple dial styles and responsive design
- **JavaScript**: Clock logic, date calculation, and interaction features
- **Chrome Extension API**: Browser extension development

## Installation

### Install from Chrome Web Store

(Available after publishing to Chrome Web Store)

### Local Development Installation

1. Clone or download this project to your local machine
2. Open Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the upper right corner
4. Click "Load unpacked"
5. Select the project folder
6. The plugin is successfully installed and will display a clock icon in the browser's upper right corner

## Usage

### Open the Clock

- Click the clock icon in the browser's upper right corner
- Or use the shortcut `Ctrl+Shift+O` (Windows) / `Command+Shift+O` (Mac)

### Switch Dial Styles

- Click the four style dots at the top of the plugin window
- From left to right: Classic, Modern, Minimalist, Vintage
- Style changes take effect immediately and are saved for the next open

### View Date and Time

- Analog clock displayed on the left
- Gregorian date, Lunar date, and digital clock displayed on the right
- Open the Weather tab for live temperature, humidity, wind, and related fields

## Project Structure

```
├── icons/              # Plugin icons
├── manifest.json      # Plugin configuration file
├── popup.html         # Plugin popup window page
├── popup.js           # Plugin core logic
├── styles.css         # Plugin styles
├── options.html       # Shortcut options page
├── options.js         # Shortcut command updates
└── README.md          # Project documentation
```

## Main Function Implementation

### Clock Logic

- Uses `Date` object to get current time
- Rotates clock hands with CSS transforms
- Uses requestAnimationFrame so the second hand moves smoothly

### Date Calculation

- Formats Gregorian date using `toLocaleDateString`
- Converts Gregorian dates to lunar dates for 1900-2049
- Updates the date display every minute

### Weather Information

- Uses the Open-Meteo forecast API (no API key)
- Reads location from the browser geolocation API
- Caches the last successful result for the next open

### Style Switching

- Switches between different styles using CSS class names
- Four styles: Classic, Modern, Minimalist, Vintage
- Click the style dots at the top to switch
- Selected style is stored in chrome.storage.sync

## Browser Support

- Chrome 88+ (supports Manifest V3)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## Development Plan

- [x] Live weather from Open-Meteo
- [x] Options page for shortcut customization
- [ ] Add more dial styles
- [ ] Support 24-hour/12-hour format switching
- [ ] Add world clock functionality
- [x] Dark / light mode toggle

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

## Author

- Project URL: [https://github.com/sky-jiangcheng/aurora-clock](https://github.com/sky-jiangcheng/aurora-clock)
- Contact: jiangcheng1806@gmail.com

---

**Enjoy using Aurora Clock.**