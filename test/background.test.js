// Node harness for background.js: stubs the chrome.* APIs and exercises the
// service worker's real logic -- offscreen lifecycle, concurrency, caching.
// Stays in the repo root: background.js is source, aurora-clock/ is generated.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'background.js'), 'utf8');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS  ' + name); }
  else { failed++; console.log('  FAIL  ' + name + (extra ? '  ->  ' + extra : '')); }
}

function makeSandbox(opts) {
  opts = opts || {};
  const log = { created: 0, closed: 0, msgs: [], stored: {} };
  let docExists = false;

  const store = {
    get(keys, cb) {
      const out = {};
      (Array.isArray(keys) ? keys : [keys]).forEach(k => {
        if (k in log.stored) out[k] = log.stored[k];
      });
      cb(out);
    },
    set(items) { Object.assign(log.stored, items); }
  };

  const chrome = {
    runtime: {
      id: 'test-extension',
      lastError: null,
      onMessage: { addListener: fn => { sandbox.__onMessage = fn; } },
      onInstalled: { addListener: fn => { sandbox.__onInstalled = fn; } },
      getURL: p => 'chrome-extension://test/' + p,
      getContexts: (cfg) => Promise.resolve(docExists ? [{ contextType: 'OFFSCREEN_DOCUMENT' }] : []),
      sendMessage: (msg) => {
        log.msgs.push(msg);
        if (opts.offscreenThrows) return Promise.reject(new Error('no receiving end'));
        if (opts.offscreenNull) return Promise.resolve(null);
        return Promise.resolve(opts.offscreenResponse);
      }
    },
    storage: { local: store },
    offscreen: {
      Reason: { GEOLOCATION: 'GEOLOCATION' },
      hasDocument: () => Promise.resolve(docExists),
      createDocument: () => {
        if (docExists) return Promise.reject(new Error('Only a single offscreen document may be created'));
        docExists = true; log.created++;
        return Promise.resolve();
      },
      closeDocument: () => { docExists = false; log.closed++; return Promise.resolve(); }
    }
  };

  const sandbox = { chrome, console, setTimeout, clearTimeout, Promise, Date };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox);
  return { sandbox, log };
}

function ask(sandbox, message) {
  return new Promise(resolve => {
    sandbox.__onMessage(message, {}, resolve);
  });
}

(async function run() {
  console.log('\n1. Cached location is returned without touching the network');
  {
    const { sandbox, log } = makeSandbox();
    log.stored.lastLocation = { lat: 31.23, lon: 121.47, at: Date.now() };
    const res = await ask(sandbox, { type: 'get-location' });
    check('ok', res.ok === true);
    check('returns cached coords', res.cached && res.cached.lat === 31.23 && res.cached.lon === 121.47);
    check('marked fresh', res.cached && res.cached.fresh === true);
    check('no offscreen document created', log.created === 0);
    check('no message sent to bridge', log.msgs.length === 0);
  }

  console.log('\n2. Stale cache is reported as not fresh');
  {
    const { sandbox, log } = makeSandbox();
    const old = Date.now() - (60 * 60 * 1000);
    log.stored.lastLocation = { lat: 1, lon: 2, at: old };
    const res = await ask(sandbox, { type: 'get-location' });
    check('still returned', !!res.cached);
    check('fresh === false', res.cached.fresh === false);
  }

  console.log('\n3. No cache at all -> null, still no offscreen document');
  {
    const { sandbox, log } = makeSandbox();
    const res = await ask(sandbox, { type: 'get-location' });
    check('ok', res.ok === true);
    check('cached is null', res.cached === null);
    check('no offscreen document created', log.created === 0);
  }

  console.log('\n4. refresh-location creates the document, forwards, and closes it');
  {
    const { sandbox, log } = makeSandbox({
      offscreenResponse: { ok: true, location: { lat: 31.22, lon: 121.45, accuracy: 20 } }
    });
    const res = await ask(sandbox, { type: 'refresh-location' });
    check('ok', res.ok === true);
    check('coords passed through', res.location.lat === 31.22 && res.location.lon === 121.45);
    check('offscreen document created once', log.created === 1);
    check('bridge asked for geolocation',
      log.msgs.length === 1 && log.msgs[0].target === 'offscreen' && log.msgs[0].type === 'get-geolocation');
    check('document closed after use', log.closed === 1);
    check('result cached for next popup', log.stored.lastLocation &&
      log.stored.lastLocation.lat === 31.22);
  }

  console.log('\n5. Permission denied is reported with its code, not swallowed');
  {
    const { sandbox } = makeSandbox({
      offscreenResponse: { ok: false, code: 1, error: 'User denied Geolocation' }
    });
    const res = await ask(sandbox, { type: 'refresh-location' });
    check('ok === false', res.ok === false);
    check('code 1 preserved', res.code === 1);
    check('message preserved', res.error === 'User denied Geolocation');
  }

  console.log('\n6. Bridge that returns null does not throw');
  {
    const { sandbox, log } = makeSandbox({ offscreenNull: true });
    const res = await ask(sandbox, { type: 'refresh-location' });
    check('ok === false', res.ok === false);
    check('descriptive error', /No response/.test(res.error), res.error);
    check('document still closed', log.closed === 1);
  }

  console.log('\n7. Bridge that rejects does not throw, document still cleaned up');
  {
    const { sandbox, log } = makeSandbox({ offscreenThrows: true });
    const res = await ask(sandbox, { type: 'refresh-location' });
    check('ok === false', res.ok === false);
    check('error surfaced', typeof res.error === 'string' && res.error.length > 0);
    check('document closed', log.closed === 1);
  }

  console.log('\n8. Concurrent refreshes create only ONE offscreen document');
  {
    const { sandbox, log } = makeSandbox({
      offscreenResponse: { ok: true, location: { lat: 10, lon: 20 } }
    });
    const results = await Promise.all([
      ask(sandbox, { type: 'refresh-location' }),
      ask(sandbox, { type: 'refresh-location' }),
      ask(sandbox, { type: 'refresh-location' })
    ]);
    check('all three succeeded', results.every(r => r.ok === true));
    check('exactly one document created', log.created === 1, 'created=' + log.created);
    check('exactly one bridge call', log.msgs.length === 1, 'msgs=' + log.msgs.length);
  }

  console.log('\n9. onInstalled warms a fix without a popup open');
  {
    const { sandbox, log } = makeSandbox({
      offscreenResponse: { ok: true, location: { lat: 5, lon: 6 } }
    });
    sandbox.__onInstalled();
    await new Promise(r => setTimeout(r, 3500));
    check('fix taken on install', log.created === 1 && log.msgs.length === 1);
    check('coords stored for first popup', log.stored.lastLocation && log.stored.lastLocation.lat === 5);
  }

  console.log('\n10. Unknown message is ignored');
  {
    const { sandbox, log } = makeSandbox();
    const ret = sandbox.__onMessage({ type: 'nonsense' }, {}, () => {});
    check('returns false (channel not held open)', ret === false);
    check('nothing created', log.created === 0);
  }

  console.log('\n11. A rejected fix is NOT cached (never poisons the next open)');
  {
    const { sandbox, log } = makeSandbox({
      offscreenResponse: { ok: false, code: 2, error: 'unavailable' }
    });
    await ask(sandbox, { type: 'refresh-location' });
    check('nothing written to storage', !log.stored.lastLocation);
  }

  console.log('\n' + '='.repeat(52));
  console.log('  ' + passed + ' passed, ' + failed + ' failed');
  console.log('='.repeat(52) + '\n');
  process.exit(failed ? 1 : 0);
})();
