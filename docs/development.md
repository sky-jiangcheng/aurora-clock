# Development Workflow

How to change the code, rebuild the package, and deploy to Chrome.

## The one rule

**The repository root is the only source of truth.**

Everything else is derived:

| Path | Role | Committed |
|---|---|---|
| `manifest.json`, `popup.*`, `styles.css`, `options.*`, `icons/` | **Source** — edit these | yes |
| `aurora-clock.zip` | Release artifact, built from source | yes |
| `aurora-clock/` | Unpacked copy of the zip, for Chrome's "Load unpacked" | no |

`aurora-clock/` is listed in `.gitignore`. It is a deployment target, not code you edit. Never fix a bug in it — the fix would be lost on the next repack.

## Workflow

1. Edit files **in the repository root**.
2. Bump `version` in `manifest.json`. Chrome shows this on `chrome://extensions`, and it is the only way to tell a new build from an old one. Keep it in sync with the version line in both READMEs.
3. Repack:

   ```bash
   zip -r -X aurora-clock.zip \
     manifest.json popup.html popup.js styles.css options.html options.js \
     background.js offscreen.html offscreen.js LICENSE icons/ \
     -x "*.DS_Store"
   ```

   Run this from the **repository root**. The archive must contain files at its root, not nested in an `aurora-clock/` folder — Chrome rejects a zip with the wrong layout.

4. Refresh the unpacked copy that Chrome actually loads:

   ```bash
   rm -rf aurora-clock && unzip -q aurora-clock.zip -d aurora-clock
   ```

5. Reload the extension at `chrome://extensions` (**Developer mode** on → hit **Reload** on Aurora Clock). The path stays the same, so do not re-select the folder.

6. Verify: `manifest.json` shows the new version, the popup opens, and the tabs render.

## Why the version number matters

Chrome caches an unpacked extension per directory. If you reload and cannot tell whether the new code is live, compare the version on `chrome://extensions` against `manifest.json`. Bumping every time removes the guesswork.

## Common failure: "I changed the code but nothing happened"

This almost always means the change never reached the folder Chrome loads. Walk the chain in order:

```
edited root file
  → repacked aurora-clock.zip
    → unzipped into aurora-clock/
      → clicked Reload at chrome://extensions
```

Verify each link:

```bash
# 1. root and unpacked copy agree
cmp popup.js aurora-clock/popup.js && echo "in sync"

# 2. the zip agrees with the unpacked copy
mkdir -p /tmp/ac-check && unzip -q aurora-clock.zip -d /tmp/ac-check
diff -rq /tmp/ac-check aurora-clock -x ".DS_Store" && echo "zip in sync"
rm -rf /tmp/ac-check
```

## Common failure: the Weather tab shows nothing

Two independent causes, both seen in practice:

**Location prompt kills the popup.** Requesting geolocation from inside a popup makes Chrome close that popup, aborting the request. Because of this the popup **never** calls `navigator.geolocation`. Instead `background.js` (the MV3 service worker) takes the fix, using `offscreen.html` / `offscreen.js` — the one MV3 context that has a `document` and therefore `navigator.geolocation`. The flow is:

```
popup opens -> background.js -> cached coordinates from chrome.storage.local
                                -> instant paint, no prompt
"Use my location" clicked, or install-time warm-up
             -> background.js -> offscreen document -> getCurrentPosition() -> closed again
```

Because the permission prompt only appears **once**, and only outside the popup, the popup survives every later request. `chrome.storage.local` key `lastLocation` holds the last good fix; the popup reads it on open and never triggers a grant by itself.

**A missing host permission returns a silent failure.** `fetch` rejects without a useful message when the manifest omits the origin. The code calls exactly two endpoints, and both must be declared:

| Endpoint | Used for | Manifest entry |
|---|---|---|
| `api.open-meteo.com/v1/forecast` | weather | `https://api.open-meteo.com/*` |
| `geocoding-api.open-meteo.com/v1/search` | city search | `https://geocoding-api.open-meteo.com/*` |

City search silently fails if the geocoding permission is dropped. To audit after any manifest edit:

```bash
grep -oE "https://[a-z0-9.-]+/[a-z0-9/_-]*" popup.js | sort -u
python3 -c "import json;[print(h) for h in json.load(open('manifest.json'))['host_permissions']]"
```

Every endpoint in the first list needs a matching pattern in the second.

## Debugging

- Open the popup's DevTools via **right-click → Inspect** on the popup itself (not the extension's page).
- The Network tab shows whether a weather request was even attempted, and whether it was blocked by permissions.
- `chrome.storage.local` holds the cache key `weatherCache`; clearing it forces a clean fetch and is a good first step when the UI looks stale but the code looks right.