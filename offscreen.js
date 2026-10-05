// Offscreen document: the only context in an MV3 extension that has both a
// `document` and therefore `navigator.geolocation`. The service worker asks it
// for a fix, it calls the API once, and the background worker closes it again.
//
// The popup never touches geolocation directly: the permission prompt closes
// the popup and aborts the request. Routing through here keeps that first
// grant out of the popup's lifetime.

var GEO_TIMEOUT = 8000;

// getCurrentPosition resolves a prototype-based GeolocationPosition. Crossing
// a context boundary strips prototype properties, so the plain own-properties
// are copied out by hand.
function clonePosition(pos) {
  return {
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    accuracy: pos.coords.accuracy
  };
}

function getLocation() {
  return new Promise(function(resolve, reject) {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(pos) { resolve(clonePosition(pos)); },
      function(err) {
        // Permission denied / unavailable must stay distinguishable from a
        // failure to reach a fix; the popup reports them differently.
        var e = new Error(err && err.message ? err.message : 'Location unavailable');
        e.code = err && err.code;
        reject(e);
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT, maximumAge: 5 * 60 * 1000 }
    );
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (!message || message.target !== 'offscreen' || message.type !== 'get-geolocation') {
    return false;
  }

  getLocation().then(
    function(loc) { sendResponse({ ok: true, location: loc }); },
    function(err) {
      sendResponse({
        ok: false,
        code: err && err.code,
        error: err && err.message ? err.message : 'Location unavailable'
      });
    }
  );

  // Keep the message channel open for the async response.
  return true;
});
