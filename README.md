# aurora-clock

English | [简体中文](README.zh-CN.md)

A Chrome extension that renders a desktop analog clock with multiple dial styles, dual date display, and live weather.

Current version: **1.2.0**

## Features

- Multiple dial styles: Classic, Modern, Minimalist, Vintage, Neon, and Ocean
- Analog clock with smoothly animated hands
- Dual date display: Gregorian and Lunar (1900-2049)
- Switch between 12-hour and 24-hour time formats
- World clock showing the local time and major cities
- Live weather from Open-Meteo using the browser location
- Keyboard shortcuts: open the popup with `Ctrl+Shift+O` (Windows/Linux) or `Command+Shift+O` (Mac), close it with `Escape`
- Custom shortcut management through `chrome.commands`
- Dark / light mode toggle
- Refined metal rim and dial bezel styling
- Responsive layout for different popup sizes

## Tech Stack

- HTML5
- CSS3 (dial styles, theming, responsive layout)
- JavaScript (clock logic, date conversion, weather fetch)
- Chrome Extension API (Manifest V3)

## Installation

### Install from Chrome Web Store

Available after publishing.

### Local Development Installation

1. Clone or download this project
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the upper right corner
4. Click "Load unpacked"
5. Select the project folder
6. The extension is installed and shows a clock icon in the toolbar

## Usage

### Open the Clock

- Click the clock icon in the toolbar
- Or use `Ctrl+Shift+O` (Windows/Linux) / `Command+Shift+O` (Mac)

### Switch Dial Styles

- Click the six style dots at the top left
- From left to right: Classic, Modern, Minimalist, Vintage, Neon, Ocean
- Changes apply immediately and are saved for the next open

### View Date and Time

- Analog clock on the left
- Gregorian date, Lunar date, and digital clock on the right

### Switch Time Format

- Click the format button in the header to toggle between `24H` and `12H`
- The setting applies to the digital clock and the world clock, and is saved for the next open

### View the World Clock

- Open the World tab
- Each row shows a city and its current local time
- A `+1d` or `-1d` marker indicates the city is on a different calendar day than your location

### Check the Weather

- Open the Weather tab
- On first use, Chrome asks for location permission; allow it to load local weather
- If location is denied, the last cached result is shown

### Customize the Shortcut

- Open the extension options page
- Click "Set Shortcut", then press a combination with Ctrl, Command, or Alt
- Press Escape to cancel

## Permissions and Privacy

- `storage`: saves theme, dial style, and the last weather result
- `geolocation`: used only to request your coordinates for weather
- Host permission `https://api.open-meteo.com/*`: weather requests
- Location is sent only to Open-Meteo to fetch weather; no other data is collected

## Project Structure

```
├── icons/              # Extension icons
├── manifest.json       # Extension configuration (Manifest V3)
├── popup.html          # Popup markup
├── popup.js            # Clock, date, weather, and UI logic
├── styles.css          # Theming, dial styles, responsive layout
├── options.html        # Shortcut options page markup
├── options.js          # Shortcut command updates
└── README.md           # Documentation (English)
```

## Implementation Notes

### Clock

- Reads time from the `Date` object
- Rotates hands with CSS transforms
- Uses `requestAnimationFrame` so the second hand moves smoothly

### Date

- Formats the Gregorian date with `toLocaleDateString`
- Converts Gregorian dates to lunar dates for 1900-2049 using a compact year table
- Refreshes the date display every minute

### Weather

- Calls the Open-Meteo forecast API (no API key required)
- Gets coordinates from the browser geolocation API
- Caches the last successful result and reuses it when location is unavailable

### World Clock

- Renders one row per city with the `Intl.DateTimeFormat` API and IANA time zones
- Compares each city's calendar day with the local day to show a `+1d` / `-1d` marker
- Follows the current 12/24-hour format setting

### Theming

- Toggles dark/light via a `body.light` class, stored in `chrome.storage.sync`
- Switches dial styles by class names and stores the choice

## Browser Support

- Chrome 88+ (Manifest V3)
- Edge 88+
- Other Chromium-based browsers

## Roadmap

- [x] Live weather from Open-Meteo
- [x] Options page for shortcut customization
- [x] Dark / light mode toggle
- [x] More dial styles
- [x] 24-hour / 12-hour format switching
- [x] World clock

## License

MIT License

## Contributing

Issues and Pull Requests are welcome.

## Author

- Project URL: [https://github.com/sky-jiangcheng/aurora-clock](https://github.com/sky-jiangcheng/aurora-clock)
- Contact: jiangcheng1806@gmail.com
