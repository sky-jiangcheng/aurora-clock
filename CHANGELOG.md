# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.5.0] - 2026-10-10
### Added
- **Daytime landscape background.** During the day and dawn the skyline is
  replaced by a flat-cut mountain scene — three receding ridges (far / mid /
  near) over still water with a single specular streak, plus a lit ridge line
  on the tallest peak. It shares the night skyline's silhouette aesthetic and
  cross-fades with it by time of day: landscape owns `day`/`dawn`, the city
  skyline owns `dusk`/`night`.

### Changed
- **Daypart-aware materials.** The classic dial is no longer a fixed dark
  surface. Its face, bezel ring, hands, numerals and glass sheen now relight
  with the sky: porcelain-white with slate hands at noon, warm rose at dawn,
  violet-amber at dusk, deep obsidian at night. Hands read as turned metal via
  a cylindrical highlight; the seconds hand gains a lollipop counterweight; the
  centre cap becomes a domed pivot.
- **Airy daylight UI.** Day and dawn use a barely-there scrim and frosted
  pale panels (instead of the dark glass), so the bright landscape and the date
  panel stay legible without the previous grey cast.
- Fixed a thin dark bar above the popup: the zero-size weather icon sprite is
  now `display:none`, removing the inline line box that pushed the container
  down and exposed the body background.

## [v1.4.3] - 2026-10-06
### Fixed
- Publish workflow verifies and uploads the committed `aurora-clock.zip`
  instead of rebuilding it: the rebuild step omitted `background.js`,
  `offscreen.html`, and `offscreen.js`, so the v1.4.2 package it published
  to the Chrome Web Store could not install (CWS rejection "Not providing
  promised functionality"). No product code changes in this release.

## [v1.4.2] - 2026-10-06
### Changed
- Brand name normalized to "Aurora Clock" across the manifest, UI, and all
  documentation (previously "auroraClock"). Repository and file names
  (`aurora-clock`) are unchanged.
- Privacy disclosures describe the geolocation flow accurately: one background
  location reading shortly after install or update, fresh readings when the
  user clicks "Use my location", and cache-only reads when opening the Weather
  tab. The permission tables now also list `offscreen` and the geocoding host
  permission.

### Fixed
- Development guide: the repack command now runs from the repository root.
  The previous instruction (`cd aurora-clock && zip ...`) rebuilt the zip from
  the stale deployed copy, so edits made in the root never reached the package.
- Store listing copy: added the required `offscreen` permission justification
  and corrected the `geolocation` one.

## [v1.4.1] - 2026-10-06
### Fixed
- CI workflow now verifies the committed `aurora-clock.zip` instead of rebuilding,
  preventing missing files (`background.js`, `offscreen.html`, `offscreen.js`) from
  being omitted in the uploaded package.

## [v1.4.0] - 2026-10-05
### Added
- Automatic geolocation via service worker + offscreen document (MV3 compliant)
  so the popup opens and immediately shows local weather without closing the
  popup on permission prompt.
- Unit tests for background geolocation logic (`test/background.test.js`).

### Changed
- Bump version to 1.4.0.

### Fixed
- Error handling now exposes the real cause (timeout, network, no match) instead
  of generic "City search failed" (`describeError`).
- Removed temporary harness files.

## [v1.3.0] - 2026-10-05
### Added
- City search via Open-Meteo geocoding API.
- Manifest v1.3.0.

### Fixed
- (No functional changes; version bump for manifest update.)

## [v1.2.1] - 2026-10-03
### Added
- Real screenshots in the README.
- Host permission for `https://geocoding-api.open-meteo.com/*`.

## [v1.2.0] - 2026-10-03
### Added
- Initial release.
