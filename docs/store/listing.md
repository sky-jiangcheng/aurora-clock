# Chrome Web Store listing copy

Ready-to-paste English copy for the Chrome Web Store submission of **Aurora Clock**.
Everything the API cannot set — the listing text, permission justifications, and data
usage answers — is collected here so a resubmission can be filled in from one source.

## Item name

Filled from the package (`manifest.json` → `name`):

```
Aurora Clock
```

## Summary (max 132 characters)

```
A refined analog clock for your toolbar: six dial styles, Gregorian and lunar dates, 12/24-hour time, world clock, and live weather.
```

## Category

Recommended: **Productivity**. Alternative: **News & Weather**.

## Detailed description

```
Aurora Clock puts a finely crafted analog clock in your browser toolbar — one click, and it is right there.

SIX DIAL STYLES
Choose from Classic, Modern, Minimalist, Vintage, Neon, and Ocean. Switch instantly from the dots in the header; your choice is remembered for next time.

PRECISE ANALOG MOVEMENT
The hour, minute, and second hands are driven by requestAnimationFrame, so the second hand sweeps smoothly instead of jumping. A machined metal rim and a layered dial bezel give it the feel of a real instrument, not a flat graphic.

TWO CALENDARS AT A GLANCE
Alongside the analog dial you get the full Gregorian date, the corresponding lunar date (supported from 1900 to 2049), and a large digital readout of the current time.

12-HOUR AND 24-HOUR
One button in the header flips every time display — the digital clock and the whole world clock — between 24-hour and 12-hour with AM/PM.

WORLD CLOCK
See the current time in London, New York, Dubai, Tokyo, and Sydney next to your own. A small +1d or -1d marker tells you when a city has already rolled over to the next day, or is still on the previous one.

LIVE WEATHER
The Weather tab shows current conditions plus a detail panel: temperature, what it feels like, humidity, wind, pressure, visibility, UV index, and sunrise and sunset, all from Open-Meteo with no API key and no account.

DARK AND LIGHT
A single toggle switches the entire interface between a deep dark theme and a warm light one.

KEYBOARD FIRST
Open the popup with Ctrl+Shift+O (Command+Shift+O on Mac) and close it with Escape. You can rebind the shortcut from the extension's options page; press Escape while recording to cancel.

PRIVATE BY DESIGN
Aurora Clock has no analytics, no tracking, no ads, and no server of its own. Your dial style, theme, and time format live in Chrome's synced storage. Your location is used for one thing only: the local forecast. One background location reading is taken shortly after install or update so the weather panel is ready the first time you open it; after that, your location is read only when you click "Use my location" on the Weather tab. Coordinates are sent only to Open-Meteo and are cached on your own device. Revoke location access and everything else keeps working.

WHO IT IS FOR
Anyone who wants the time at a glance without giving up a tab: a quiet, good-looking clock that is always one keystroke away.
```

## Single purpose

```
Aurora Clock provides an at-a-glance time reference: an analog clock with Gregorian and lunar dates, a world clock, and the local weather.
```

## Permission justifications

### `storage`

```
Saves the user's dial style, theme (dark or light), and 12/24-hour preference so the popup reopens the way the user left it, and caches the most recent weather result so the Weather tab can show the last reading when a location is unavailable. All of it stays on the user's device.
```

### `geolocation`

```
Used solely for the local weather feature. When the user clicks "Use my location" on the Weather tab, the extension obtains fresh coordinates through an offscreen document — so the permission prompt never closes the popup — and sends them only to api.open-meteo.com to fetch the local forecast. Shortly after install or update, one background reading is taken the same way to pre-fill the weather panel; opening the Weather tab itself only reads coordinates already cached on the device. Coordinates are stored only in the extension's local storage on the user's device, are never sold, shared, or used for any other purpose, and every feature except the Weather tab works without location.
```

### `offscreen`

```
The offscreen document is the only Manifest V3 context that has a DOM and therefore navigator.geolocation. It is created briefly to take a single location reading for the local weather feature, then closed immediately. It renders no visible UI, plays no audio, and contacts no servers.
```

### Host permission `https://api.open-meteo.com/*`

```
Required to request the weather forecast from Open-Meteo, the only external service this extension contacts.
```

## Remote code

```
Aurora Clock does not use remote code. All HTML, CSS, and JavaScript is included in the package; nothing is fetched or evaluated at runtime. The only network request is the weather lookup described above.
```

## Data usage answers

- Data collected: **Location** — one background reading shortly after install or update to pre-fill the weather panel, and fresh readings when the user clicks "Use my location" on the Weather tab.
- Purpose: providing the extension's single purpose (local weather).
- Sold to third parties: **No**
- Used or transferred for purposes unrelated to the single purpose: **No**
- Used or transferred to determine creditworthiness or for lending: **No**
- Privacy policy URL: `https://github.com/sky-jiangcheng/aurora-clock/blob/master/docs/privacy-policy.md`

## Screenshots (1280x800, in upload order)

| File | Shows |
| :--- | :--- |
| `docs/store/clock-classic-1280x800.png` | Classic dial, dark theme |
| `docs/store/clock-neon-1280x800.png` | Neon dial, dark theme |
| `docs/store/clock-light-1280x800.png` | Classic dial, light theme |
| `docs/store/world-1280x800.png` | World clock tab |
| `docs/store/weather-1280x800.png` | Weather tab |

Each frame shows the real popup at its natural 560x560 size, centred on a
1280x800 backdrop carrying the theme's own palette — never the popup stretched
to fill the canvas, which would distort the dial.

To regenerate after a UI change:

```bash
node test/make-shots.js      # build the screenshot harness
# Chrome must already be listening for CDP:
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --remote-debugging-port=9223 \
  --user-data-dir=/tmp/cdp-prof about:blank &
node test/capture.js         # docs/screenshots/ (1120x1120, 2x)
node test/capture-store.js   # docs/store/ (1280x800, 1x)
node test/verify-shots.js    # pixel-level assertions on the output
```

The harness freezes the clock at 10:09:30 and stubs the weather response, so
every run is byte-comparable. `capture.js` waits for the harness to signal that
the requested tab actually rendered and re-asserts the active tab before each
capture; `chrome --headless --screenshot` alone cannot be trusted for this, as
it may capture before the page settles.
