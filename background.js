// Background service worker: owns the geolocation fix so the popup never has to.
//
// Why this exists: a Chrome popup is a toolbar overlay. The moment Chrome shows
// the geolocation permission prompt, the popup is destroyed and any in-flight
// request dies with it. Once permission has been granted the prompt never
// appears again, so the fix is only unobtainable during that first grant --
// which is exactly what should happen outside the popup's lifetime.
//
// The flow: popup asks for a location -> worker borrows an offscreen document
// (the one MV3 context that has navigator.geolocation) -> document takes one
// reading -> worker closes the document and answers the popup.

var OFFSCREEN_PATH = 'offscreen.html';
var LOCATION_KEY = 'lastLocation';
var LOCATION_MAX_AGE = 30 * 60 * 1000; // re-fix at most twice an hour
var SERVICE_WORKER_TIMEOUT = 12000;

// Serialises concurrent fix requests. Two popups opening at once must not race
// to create two offscreen documents, and Chrome allows only one at a time.
var inflight = null;

function hasOffscreenDocument() {
  return chrome.offscreen.hasDocument
    ? chrome.offscreen.hasDocument()
    : matchOffscreenClient();
}

// Chrome 116+ exposes hasDocument(); fall back to matching clients so the
// worker still works on slightly older builds.
function matchOffscreenClient() {
  return new Promise(function(resolve) {
    chrome.runtime.getContexts
      ? chrome.runtime.getContexts({
          contextTypes: ['OFFSCREEN_DOCUMENT'],
          documentUrls: [chrome.runtime.getURL(OFFSCREEN_PATH)]
        }).then(function(list) { resolve(list.length > 0); },
               function() { resolve(false); })
      : resolve(false);
  });
}

function createOffscreenDocument() {
  // GEOLOCATION is the intended reason; DOM_SCRAPING is the documented
  // fallback for builds that predate it.
  var reason = (chrome.offscreen.Reason && chrome.offscreen.Reason.GEOLOCATION)
    || 'DOM_SCRAPING';
  return chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: [reason],
    justification: 'Read the user location once to show local weather.'
  });
}

function ensureOffscreenDocument() {
  return hasOffscreenDocument().then(function(exists) {
    if (exists) return null;
    return createOffscreenDocument();
  });
}

function closeOffscreenDocument() {
  return hasOffscreenDocument().then(function(exists) {
    if (!exists) return;
    return chrome.offscreen.closeDocument().catch(function() {
      // Already gone, or closing while a fix is in flight. Nothing to do.
    });
  });
}

function requestLocation() {
  var timer = new Promise(function(resolve) {
    setTimeout(function() { resolve({ ok: false, error: 'Location request timed out' }); },
               SERVICE_WORKER_TIMEOUT);
  });

  var attempt = ensureOffscreenDocument()
    .then(function() {
      return chrome.runtime.sendMessage({ target: 'offscreen', type: 'get-geolocation' });
    })
    .then(function(res) {
      if (!res) return { ok: false, error: 'No response from geolocation bridge' };
      return res;
    })
    .catch(function(err) {
      return { ok: false, error: err && err.message ? err.message : 'Location unavailable' };
    })
    .then(function(result) {
      return closeOffscreenDocument().then(function() { return result; });
    });

  return Promise.race([attempt, timer]);
}

function getLocation() {
  if (inflight) return inflight;

  inflight = requestLocation().then(function(result) {
    inflight = null;
    if (result && result.ok) {
      rememberLocation(result.location);
    }
    return result;
  });

  return inflight;
}

function rememberLocation(location) {
  if (!location) return;
  try {
    chrome.storage.local.set({ [LOCATION_KEY]: { lat: location.lat, lon: location.lon, at: Date.now() } });
  } catch (e) {
    // Storage is best effort; a failed write only costs us a re-fix next time.
  }
}

function readCachedLocation() {
  return new Promise(function(resolve) {
    try {
      chrome.storage.local.get([LOCATION_KEY], function(items) {
        var entry = items && items[LOCATION_KEY];
        if (!entry || typeof entry.lat !== 'number' || typeof entry.lon !== 'number') {
          resolve(null);
          return;
        }
        resolve({
          lat: entry.lat,
          lon: entry.lon,
          at: entry.at,
          fresh: (Date.now() - entry.at) < LOCATION_MAX_AGE
        });
      });
    } catch (e) {
      resolve(null);
    }
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (!message) return false;

  if (message.type === 'get-location') {
    // Cached first: this is what makes the popup paint instantly on open.
    readCachedLocation().then(function(cached) {
      sendResponse({ ok: true, cached: cached });
    });
    return true;
  }

  if (message.type === 'refresh-location') {
    getLocation().then(function(result) {
      sendResponse(result);
    });
    return true;
  }

  return false;
});

// Warm the fix shortly after install / update so the first popup the user opens
// already has coordinates and never has to trigger a grant.
chrome.runtime.onInstalled.addListener(function() {
  setTimeout(function() { getLocation(); }, 3000);
});
