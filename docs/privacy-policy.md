# Aurora Clock — Privacy Policy

English | [简体中文](privacy-policy.zh-CN.md)

Last updated: October 6, 2026

Aurora Clock is a Chrome extension that displays an analog clock, dual date display, a world clock, and local weather. This policy explains what the extension does with your information. The extension has a single purpose — showing time and date information, plus weather for your location — and it uses data only for that purpose.

## Summary

- The extension collects no personal information.
- Your location is used only to load local weather; you can revoke access at any time in Chrome's settings.
- Your coordinates are sent to the Open-Meteo weather API. Nothing is sent anywhere else.
- The developer operates no servers and never receives your data.

## Information the extension handles

### Location (optional)

The extension reads your coordinates through `navigator.geolocation` at coarse accuracy in two situations: shortly after it is installed or updated, one background reading is taken so the weather panel is ready the first time you open it; and when you click "Use my location" on the Weather tab, a fresh reading is taken. Opening the Weather tab itself only reads coordinates already cached on your device. If you deny location access, weather is simply not loaded; every other feature keeps working.

Your coordinates are:

- sent to the Open-Meteo API to retrieve the local forecast;
- cached locally on your device, so the last result can still be shown while refreshing or when location is unavailable.

Coordinates are never sent to the developer, and never to any third party other than Open-Meteo.

### Settings stored in your browser

| Data | Storage area | Purpose |
| --- | --- | --- |
| Dial style | `chrome.storage.sync` | Restores the clock face you picked |
| 12/24-hour format | `chrome.storage.sync` | Restores your time format |
| Dark / light mode | `chrome.storage.sync` | Restores your theme |
| Last weather result, including the coordinates it was fetched for | `chrome.storage.local` | Shows the last update while refreshing, or when location is unavailable |

Items in `chrome.storage.sync` are synchronized by Chrome through your own Google account, subject to [Google's privacy policy](https://policies.google.com/privacy). The developer has no access to them. Data in `chrome.storage.local` stays on your device.

### What the extension does not do

- No name, email, account, or other personal identifiers
- No browsing history, open tabs, or page content
- No analytics, telemetry, or crash reporting
- No advertising, tracking pixels, or cookies
- No sale or sharing of data with third parties
- No backend server of any kind — the developer collects nothing

The world clock is computed entirely in your browser with the `Intl.DateTimeFormat` API, shows a fixed list of cities, and makes no network requests.

## Third-party services

| Service | Purpose | Data sent | Terms |
| --- | --- | --- | --- |
| [Open-Meteo](https://open-meteo.com/) | Weather forecast | Your coordinates, plus the IP address any web request carries | [Terms & Privacy](https://open-meteo.com/en/terms) |

Weather data is provided by Open-Meteo under the CC-BY 4.0 licence. Open-Meteo's free API is offered for non-commercial use.

## Permissions

| Permission | Why it is needed |
| --- | --- |
| `storage` | Saves your dial style, time format, theme, and the last weather result |
| `geolocation` | Reads your coordinates — once shortly after install or update, and when you click "Use my location" — so the Weather tab can show local weather |
| `offscreen` | Opens a short-lived hidden document, the only extension context that has a DOM, to take a single location reading |
| `https://api.open-meteo.com/*` | Allows the weather request to Open-Meteo |
| `https://geocoding-api.open-meteo.com/*` | Allows the city-search request to Open-Meteo |

## Data retention and your choices

- Settings and the cached weather result stay on your device until you change them, clear the extension's data, or uninstall the extension.
- Blocking location access for the extension in Chrome stops all weather requests.
- Uninstalling the extension removes all data it stored locally.

## Children's privacy

The extension is not directed at children and collects no personal information from anyone.

## Changes to this policy

Any change will be published on this page together with an updated date.

## Contact

Questions about this policy: jiangcheng1806@gmail.com

Project: [https://github.com/sky-jiangcheng/aurora-clock](https://github.com/sky-jiangcheng/aurora-clock)
