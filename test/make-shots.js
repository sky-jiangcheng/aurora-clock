// Generates a screenshot harness from the real popup.html by injecting a
// stub environment before popup.js runs. Deterministic: frozen clock, fixed
// weather, controlled dial style / theme / tab.
//
//   node test/make-shots.js            # writes the harness
//
// The harness is opened in a browser and captured; see docs on regenerating.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DEPLOYED = path.join(ROOT, 'aurora-clock');

const html = fs.readFileSync(path.join(DEPLOYED, 'popup.html'), 'utf8');

const STUB = `
<script>
// ---- Frozen data -------------------------------------------------------
// 2026-10-05 10:09:30 local: hands form a readable, non-symmetric shape.
var FIXED_MS = new Date(2026, 9, 5, 10, 9, 30).getTime();

var FC = {
  latitude: 31.23, longitude: 121.47, timezone: 'Asia/Shanghai',
  current: {
    time: '2026-10-05T10:09', temperature_2m: 21.6, relative_humidity_2m: 68,
    apparent_temperature: 22.4, is_day: 1, weather_code: 2, pressure_msl: 1015.4,
    wind_speed_10m: 9.4, visibility: 18000
  },
  daily: {
    time: ['2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09'],
    sunrise: ['2026-10-05T06:13','2026-10-06T06:14','2026-10-07T06:15','2026-10-08T06:16','2026-10-09T06:17'],
    sunset:  ['2026-10-05T18:05','2026-10-06T18:04','2026-10-07T18:03','2026-10-08T18:02','2026-10-09T18:01'],
    uv_index_max: [4.2, 4.6, 3.8, 4.1, 4.4],
    weather_code: [2, 1, 61, 2, 3],
    temperature_2m_max: [24.1, 25.3, 21.8, 23.2, 22.6],
    temperature_2m_min: [17.2, 17.9, 16.4, 16.8, 17.1],
    precipitation_probability_max: [10, 5, 65, 15, 25]
  },
  hourly: {
    time: ['2026-10-05T10:00','2026-10-05T11:00','2026-10-05T12:00','2026-10-05T13:00',
           '2026-10-05T14:00','2026-10-05T15:00','2026-10-05T16:00','2026-10-05T17:00',
           '2026-10-05T18:00','2026-10-05T19:00','2026-10-05T20:00','2026-10-05T21:00'],
    temperature_2m: [21.6,22.1,22.9,23.4,23.6,23.2,22.5,21.8,20.9,20.1,19.6,19.2],
    weather_code:   [2,1,1,2,2,3,3,2,2,1,1,0],
    precipitation_probability: [5,5,0,0,5,10,15,15,10,5,5,5],
    is_day:         [1,1,1,1,1,1,1,1,0,0,0,0]
  }
};

window.fetch = function(url){
  return Promise.resolve({ ok:true, status:200, json:function(){
    return Promise.resolve(String(url).indexOf('geocoding') > -1 ? { results: [] } : FC);
  }});
};

var STORE_SYNC = { lightMode: false, dialStyle: 'classic', tempUnit: 'c', format24: false };
window.chrome = {
  runtime: {
    id: 'capture', lastError: null,
    sendMessage: function(msg, cb){
      if (!cb) return;
      cb(msg.type === 'get-location'
        ? { ok:true, cached:{ lat:31.23, lon:121.47, fresh:true } }
        : { ok:true, location:{ lat:31.23, lon:121.47 } });
    }
  },
  storage: {
    local: { get:function(k,cb){ cb({}); }, set:function(i,cb){ if(cb) cb(); } },
    sync:  { get:function(k,cb){ cb(JSON.parse(JSON.stringify(STORE_SYNC))); },
             set:function(i){ Object.assign(STORE_SYNC, i); } }
  }
};

// Freeze time: identical hands on every run, whatever day it is captured.
var RealDate = window.Date;
function FrozenDate(){
  if (arguments.length === 0) return new RealDate(FIXED_MS);
  return new (Function.prototype.bind.apply(RealDate, [null].concat([].slice.call(arguments))));
}
FrozenDate.prototype = RealDate.prototype;
FrozenDate.now = function(){ return FIXED_MS; };
FrozenDate.parse = RealDate.parse;
FrozenDate.UTC = RealDate.UTC;
window.Date = FrozenDate;

// ---- Capture control ----------------------------------------------------
window.__SHOT = {
  // Drive the DOM directly instead of clicking. init() runs on
  // DOMContentLoaded and loadSettings() resolves asynchronously afterwards,
  // so a timed click() races the very state it is trying to set. Setting
  // classes/attributes here is order-independent.
  apply: function(opt){
    // Dial style.
    document.querySelectorAll('.style-dot').forEach(function(d){
      var on = d.dataset.style === opt.style;
      d.classList.toggle('active', on);
      d.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    var dot = document.querySelector('.style-dot[data-style="' + opt.style + '"]');
    if (dot) dot.click();

    // Theme.
    document.body.classList.toggle('light', !!opt.light);

    // Tab: mirror setupTabs().activate() exactly.
    var btn = document.querySelector('.tab-btn[data-tab="' + opt.tab + '"]');
    if (btn) {
      document.querySelectorAll('.tab-btn').forEach(function(b){
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      document.querySelectorAll('.tab-view').forEach(function(v){
        v.classList.remove('active');
      });
      var view = document.getElementById('tab-' + opt.tab);
      if (view) view.classList.add('active');
    }
    return true;
  },
  // True once every tab button reflects the requested tab.
  settled: function(){
    var p = new URLSearchParams(location.search);
    var want = p.get('tab') || 'clock';
    var btn = document.querySelector('.tab-btn[data-tab="' + want + '"]');
    var view = document.getElementById('tab-' + want);
    var wx = document.getElementById('weatherTempLarge');
    var wxOk = want !== 'weather' || (wx && wx.textContent.trim() &&
      wx.textContent.indexOf('-') === -1);
    return !!(btn && btn.classList.contains('active') &&
              view && view.classList.contains('active') && wxOk);
  }
};
<\/script>
`;

// The control script must run AFTER popup.js has wired up its handlers.
// It polls __SHOT.settled() instead of guessing a delay: init() and
// loadSettings() resolve at unpredictable times, and the weather tab only
// becomes meaningful once its fetch stub has resolved.
const DRIVER = `
<script>
window.addEventListener('load', function(){
  var p = new URLSearchParams(location.search);
  var tries = 0;
  (function poll(){
    if (window.__SHOT && window.__SHOT.apply({
          style: p.get('style') || 'classic',
          light: p.get('light') === '1',
          tab: p.get('tab') || 'clock'
        }) && window.__SHOT.settled()) {
      var d = document.createElement('div');
      d.id = '__shotReady';
      d.style.cssText = 'position:absolute;left:-9999px';
      d.textContent = 'ready';
      document.body.appendChild(d);
      return;
    }
    if (++tries > 200) {   // ~6s at 30ms
      var e = document.createElement('div');
      e.id = '__shotFail';
      e.style.cssText = 'position:absolute;left:-9999px';
      document.body.appendChild(e);
      return;
    }
    setTimeout(poll, 30);
  })();
});
<\/script>
`;

const out = html.replace('<script src="popup.js"></script>', STUB + '\n<script src="popup.js"></script>' + DRIVER);

const target = path.join(DEPLOYED, '_shot.html');
fs.writeFileSync(target, out);
console.log('harness written:', path.relative(ROOT, target));
console.log('open: file://' + target + '?style=classic&light=0&tab=clock');