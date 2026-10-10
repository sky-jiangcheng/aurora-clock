# Aurora Clock

English | [简体中文](README.zh-CN.md)

Aurora Clock is a Chrome extension that renders a desktop analog clock with multiple dial styles, dual date display, and live weather.

Current version: **1.5.0**

See [CHANGELOG](CHANGELOG.md) for details.

## Screenshots

| Classic | Neon | Ocean |
| :---: | :---: | :---: |
| ![Classic dial](docs/screenshots/clock-classic.png) | ![Neon dial](docs/screenshots/clock-neon.png) | ![Ocean dial](docs/screenshots/clock-ocean.png) |

| Light mode | World clock | Weather |
| :---: | :---: | :---: |
| ![Light mode](docs/screenshots/clock-light.png) | ![World clock](docs/screenshots/world.png) | ![Weather](docs/screenshots/weather.png) |

## Features

- Multiple dial styles: Classic, Modern, Minimalist, Vintage, Neon, and Ocean
- Analog clock with smoothly animated hands
- Dual date display: Gregorian and Lunar (1900-2049)
- Switch between 12-hour and 24-hour time formats
- World clock showing the local time and major cities
- Live weather from Open-Meteo: search any city or use your browser location
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
4. Unpack the release artifact: `unzip -q aurora-clock.zip -d aurora-clock`
5. Click "Load unpacked" and select the generated `aurora-clock/` folder
6. The extension is installed and shows a clock icon in the toolbar

Note the two-step: the source lives in the repository root, and `aurora-clock.zip` is what you unpack for Chrome. See [docs/development.md](docs/development.md).

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
- Search for a city by name, then pick it from the results
- Or click the locate button to use your browser location
- Use the °C/°F toggle to switch temperature units, and Refresh to update on demand
- The last successful result is cached and shown while offline, before a city is chosen, or when location is denied

### Customize the Shortcut

- Open the extension options page
- Click "Set Shortcut", then press a combination with Ctrl, Command, or Alt
- Press Escape to cancel

## Permissions and Privacy

- `storage`: saves theme, dial style, and the last weather result
- `geolocation`: used for the local weather feature — one background reading shortly after install or update, and a fresh reading when you click the locate button
- `offscreen`: opens a short-lived hidden document (the only MV3 context with a DOM) to take that location reading
- Host permission `https://api.open-meteo.com/*`: weather forecast requests
- Host permission `https://geocoding-api.open-meteo.com/*`: city search requests
- The coordinates or city name you submit are sent only to Open-Meteo; no other data is collected

Full policy: [Privacy Policy](docs/privacy-policy.md)

## Project Structure

```
├── icons/              # Extension icons
├── manifest.json       # Extension configuration (Manifest V3)
├── popup.html          # Popup markup
├── popup.js            # Clock, date, weather, and UI logic
├── styles.css          # Theming, dial styles, responsive layout
├── options.html        # Shortcut options page markup
├── options.js          # Shortcut command updates
├── docs/
│   ├── privacy-policy.md       # Privacy policy (English)
│   ├── privacy-policy.zh-CN.md # Privacy policy (Simplified Chinese)
│   ├── development.md          # Build and deploy workflow (English)
│   ├── development.zh-CN.md    # Build and deploy workflow (Simplified Chinese)
│   ├── screenshots/            # Popup screenshots (1120x1120, 2x)
│   └── store/                  # Chrome Web Store assets (1280x800)
├── aurora-clock.zip    # Release artifact, built from source
├── aurora-clock/       # Unpacked copy of the zip; gitignored, not source
├── README.md           # Documentation (English)
└── README.zh-CN.md     # Documentation (Simplified Chinese)
```

The repository root is the only place to edit code. `aurora-clock/` is a deployment target generated from `aurora-clock.zip` — see [docs/development.md](docs/development.md) for the build-and-deploy workflow.

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
- Resolves a city name to coordinates via the Open-Meteo geocoding API, or uses browser geolocation when you ask for it
- Never requests location on popup open: the permission prompt would close the popup and abort the request
- Takes one background location reading shortly after install or update (routed through the offscreen document) so the first popup already shows local weather
- Caches the last successful result and reuses it when offline or before a city is chosen
- Guards every request with an 8-second timeout so the UI never hangs

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
