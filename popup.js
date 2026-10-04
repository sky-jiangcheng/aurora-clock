// Lunar calendar data encoding (well-known format used by Chinese calendar libraries)
// Each entry encodes one lunar year's month structure:
//   bits[3:0]  = leap month number (0 = no leap month)
//   bits[15:4] = months 1-12 (1=30 days, 0=29 days), bit15=month 1
//   bit[16]    = leap month days (0=29 days, 1=30 days)
var lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
];

var LUNAR_START_YEAR = 1900;
var LUNAR_END_YEAR = 2049;

var lunarMonthNames = [
  '', '1st Month', '2nd Month', '3rd Month', '4th Month', '5th Month', '6th Month',
  '7th Month', '8th Month', '9th Month', '10th Month', '11th Month', '12th Month'
];

var lunarDayNames = [
  '', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10',
  'Day 11', 'Day 12', 'Day 13', 'Day 14', 'Day 15', 'Day 16', 'Day 17', 'Day 18', 'Day 19', 'Day 20',
  'Day 21', 'Day 22', 'Day 23', 'Day 24', 'Day 25', 'Day 26', 'Day 27', 'Day 28', 'Day 29', 'Day 30'
];

function getLunarYearDays(yearIndex) {
  var sum = 0;
  for (var m = 1; m <= 12; m++) {
    sum += getLunarMonthDays(yearIndex, m);
  }
  sum += getLeapMonthDays(yearIndex);
  return sum;
}

function getLunarMonthDays(yearIndex, month) {
  var info = lunarInfo[yearIndex];
  return (info & (0x10000 >> month)) ? 30 : 29;
}

function getLeapMonth(yearIndex) {
  return lunarInfo[yearIndex] & 0xf;
}

function getLeapMonthDays(yearIndex) {
  var info = lunarInfo[yearIndex];
  if ((info & 0xf) === 0) return 0;
  return ((info >> 16) & 1) ? 30 : 29;
}

function getLunarDate(date) {
  var year = date.getFullYear();
  if (year < LUNAR_START_YEAR || year > LUNAR_END_YEAR) {
    return 'Lunar date unavailable';
  }

  var utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  var utcBase = Date.UTC(1900, 0, 31);
  var offset = Math.round((utcDate - utcBase) / 86400000);

  if (offset < 0) {
    return 'Lunar date unavailable';
  }

  var yearIndex = 0;
  var daysInYear = getLunarYearDays(yearIndex);

  while (offset >= daysInYear && yearIndex < lunarInfo.length - 1) {
    offset -= daysInYear;
    yearIndex++;
    daysInYear = getLunarYearDays(yearIndex);
  }

  if (offset >= daysInYear) {
    return 'Lunar date unavailable';
  }

  var leapMonth = getLeapMonth(yearIndex);
  var isLeap = false;
  var lunarMonth = 0;
  var lunarDay = 0;

  for (var m = 1; m <= 12; m++) {
    var monthDays = getLunarMonthDays(yearIndex, m);
    if (offset < monthDays) {
      lunarMonth = m;
      lunarDay = offset + 1;
      isLeap = false;
      break;
    }
    offset -= monthDays;

    if (leapMonth === m) {
      var leapDays = getLeapMonthDays(yearIndex);
      if (offset < leapDays) {
        lunarMonth = m;
        lunarDay = offset + 1;
        isLeap = true;
        break;
      }
      offset -= leapDays;
    }
  }

  var monthStr = lunarMonthNames[lunarMonth];
  var dayStr = lunarDayNames[lunarDay];
  if (!monthStr || !dayStr) {
    return 'Lunar date unavailable';
  }
  if (isLeap) {
    monthStr = 'Leap ' + monthStr;
  }

  return monthStr + ' ' + dayStr;
}

// Create hour marker indices around the dial
function createHourMarkers() {
  var dial = document.querySelector('.clock-dial');
  if (!dial) return;

  // Remove existing markers
  var existing = dial.querySelectorAll('.hour-marker');
  existing.forEach(function(el) { el.remove(); });

  for (var i = 0; i < 12; i++) {
    // Skip cardinal positions that have numbers (12, 3, 6, 9)
    if (i % 3 === 0) continue;

    var marker = document.createElement('div');
    marker.className = 'hour-marker';
    marker.style.transform = 'translateX(-50%) rotate(' + (i * 30) + 'deg)';
    dial.appendChild(marker);
  }
}

var hourHandEl = null;
var minuteHandEl = null;
var secondHandEl = null;
var solarDateEl = null;
var lunarDateEl = null;
var currentTimeEl = null;

function cacheClockElements() {
  hourHandEl = document.querySelector('.hour-hand');
  minuteHandEl = document.querySelector('.minute-hand');
  secondHandEl = document.querySelector('.second-hand');
  solarDateEl = document.getElementById('solarDate');
  lunarDateEl = document.getElementById('lunarDate');
  currentTimeEl = document.getElementById('currentTime');
}

function updateClock() {
  if (!hourHandEl || !minuteHandEl || !secondHandEl) return;

  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();
  var milliseconds = now.getMilliseconds();

  var hourAngle = (hours % 12) * 30 + minutes * 0.5 + seconds * (0.5 / 60);
  var minuteAngle = minutes * 6 + seconds * 0.1 + milliseconds * 0.0001;
  var secondAngle = seconds * 6 + milliseconds * 0.006;

  hourHandEl.style.transform = 'translate(-50%, -100%) rotate(' + hourAngle + 'deg)';
  minuteHandEl.style.transform = 'translate(-50%, -100%) rotate(' + minuteAngle + 'deg)';
  secondHandEl.style.transform = 'translate(-50%, -100%) rotate(' + secondAngle + 'deg)';
}

function updateDate() {
  var now = new Date();
  var options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };

  var solarDate = now.toLocaleDateString('en-US', options);
  var lunarDate = getLunarDate(now);

  if (solarDateEl) solarDateEl.textContent = solarDate;
  if (lunarDateEl) lunarDateEl.textContent = lunarDate;
}

// ---- 12/24-hour format ----
var use24Hour = true;

function formatClockTime(date) {
  var hours = date.getHours();
  var minutes = String(date.getMinutes()).padStart(2, '0');
  var seconds = String(date.getSeconds()).padStart(2, '0');

  if (use24Hour) {
    return String(hours).padStart(2, '0') + ':' + minutes + ':' + seconds;
  }

  var suffix = hours >= 12 ? 'PM' : 'AM';
  var hour12 = hours % 12 || 12;
  return hour12 + ':' + minutes + ':' + seconds + ' ' + suffix;
}

function updateCurrentTime() {
  if (!currentTimeEl) return;
  currentTimeEl.textContent = formatClockTime(new Date());
}

function updateFormatToggleLabel() {
  var toggle = document.getElementById('formatToggle');
  if (toggle) toggle.textContent = use24Hour ? '24H' : '12H';
}

function setupFormatToggle() {
  var toggle = document.getElementById('formatToggle');

  if (toggle) {
    toggle.addEventListener('click', function() {
      use24Hour = !use24Hour;
      updateFormatToggleLabel();
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.set({ use24Hour: use24Hour });
      }
      updateCurrentTime();
      updateWorldClock();
    });
  }

  updateFormatToggleLabel();

  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get(['use24Hour'], function(result) {
      if (typeof result.use24Hour === 'boolean') {
        use24Hour = result.use24Hour;
      }
      updateFormatToggleLabel();
      updateCurrentTime();
      updateWorldClock();
    });
  }
}

// ---- World clock ----
var WORLD_CITIES = [
  { name: 'Local', tz: null },
  { name: 'London', tz: 'Europe/London' },
  { name: 'New York', tz: 'America/New_York' },
  { name: 'Dubai', tz: 'Asia/Dubai' },
  { name: 'Tokyo', tz: 'Asia/Tokyo' },
  { name: 'Sydney', tz: 'Australia/Sydney' }
];

var worldRows = [];
var worldTimeFormatters = {};
var worldDayFormatters = {};

function getWorldTimeFormatter(tz) {
  var key = (tz || 'local') + '|' + (use24Hour ? '24' : '12');
  if (!worldTimeFormatters[key]) {
    var options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    if (use24Hour) {
      options.hourCycle = 'h23';
    } else {
      options.hour12 = true;
    }
    if (tz) options.timeZone = tz;
    worldTimeFormatters[key] = new Intl.DateTimeFormat('en-US', options);
  }
  return worldTimeFormatters[key];
}

function getWorldDayFormatter(tz) {
  var key = tz || 'local';
  if (!worldDayFormatters[key]) {
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (tz) options.timeZone = tz;
    worldDayFormatters[key] = new Intl.DateTimeFormat('en-CA', options);
  }
  return worldDayFormatters[key];
}

// Day difference between the target zone and the local zone (-1, 0 or +1)
function worldDayOffset(tz, date) {
  var localKey = getWorldDayFormatter(null).format(date);
  var cityKey = getWorldDayFormatter(tz).format(date);
  if (cityKey === localKey) return 0;
  return Math.round((Date.parse(cityKey) - Date.parse(localKey)) / 86400000);
}

function buildWorldClock() {
  var list = document.getElementById('worldList');
  if (!list) return;

  list.innerHTML = '';
  worldRows = [];

  WORLD_CITIES.forEach(function(city) {
    var row = document.createElement('div');
    row.className = 'world-row';

    var nameEl = document.createElement('span');
    nameEl.className = 'world-city';
    nameEl.textContent = city.name;

    var dayEl = document.createElement('span');
    dayEl.className = 'world-day';

    var timeEl = document.createElement('span');
    timeEl.className = 'world-time';

    row.appendChild(nameEl);
    row.appendChild(dayEl);
    row.appendChild(timeEl);
    list.appendChild(row);

    worldRows.push({ tz: city.tz, timeEl: timeEl, dayEl: dayEl });
  });
}

function updateWorldClock() {
  if (!worldRows.length) return;

  var now = new Date();
  worldRows.forEach(function(row) {
    row.timeEl.textContent = getWorldTimeFormatter(row.tz).format(now);

    var offset = row.tz ? worldDayOffset(row.tz, now) : 0;
    if (offset > 0) {
      row.dayEl.textContent = '+' + offset + 'd';
    } else if (offset < 0) {
      row.dayEl.textContent = offset + 'd';
    } else {
      row.dayEl.textContent = '';
    }
  });
}

function setText(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setWeatherStatus(message) {
  setText('weatherStatus', message || '');
}

function weatherCodeInfo(code) {
  var map = {
    0: { icon: '\u2600\uFE0F', desc: 'Clear' },
    1: { icon: '\uD83C\uDF24\uFE0F', desc: 'Mostly Clear' },
    2: { icon: '\u26C5', desc: 'Partly Cloudy' },
    3: { icon: '\u2601\uFE0F', desc: 'Overcast' },
    45: { icon: '\uD83C\uDF2B\uFE0F', desc: 'Fog' },
    48: { icon: '\uD83C\uDF2B\uFE0F', desc: 'Rime Fog' },
    51: { icon: '\uD83C\uDF27\uFE0F', desc: 'Light Drizzle' },
    53: { icon: '\uD83C\uDF27\uFE0F', desc: 'Drizzle' },
    55: { icon: '\uD83C\uDF27\uFE0F', desc: 'Heavy Drizzle' },
    56: { icon: '\uD83C\uDF27\uFE0F', desc: 'Freezing Drizzle' },
    57: { icon: '\uD83C\uDF27\uFE0F', desc: 'Freezing Drizzle' },
    61: { icon: '\uD83C\uDF27\uFE0F', desc: 'Light Rain' },
    63: { icon: '\uD83C\uDF27\uFE0F', desc: 'Rain' },
    65: { icon: '\uD83C\uDF27\uFE0F', desc: 'Heavy Rain' },
    66: { icon: '\uD83C\uDF27\uFE0F', desc: 'Freezing Rain' },
    67: { icon: '\uD83C\uDF27\uFE0F', desc: 'Freezing Rain' },
    71: { icon: '\u2744\uFE0F', desc: 'Light Snow' },
    73: { icon: '\u2744\uFE0F', desc: 'Snow' },
    75: { icon: '\u2744\uFE0F', desc: 'Heavy Snow' },
    77: { icon: '\u2744\uFE0F', desc: 'Snow Grains' },
    80: { icon: '\uD83C\uDF27\uFE0F', desc: 'Light Showers' },
    81: { icon: '\uD83C\uDF27\uFE0F', desc: 'Showers' },
    82: { icon: '\uD83C\uDF27\uFE0F', desc: 'Heavy Showers' },
    85: { icon: '\u2744\uFE0F', desc: 'Snow Showers' },
    86: { icon: '\u2744\uFE0F', desc: 'Heavy Snow Showers' },
    95: { icon: '\u26C8\uFE0F', desc: 'Thunderstorm' },
    96: { icon: '\u26C8\uFE0F', desc: 'Thunderstorm' },
    99: { icon: '\u26C8\uFE0F', desc: 'Thunderstorm' }
  };
  return map[code] || { icon: '\u26C5', desc: 'Cloudy' };
}

function uvLabel(uv) {
  if (uv == null || isNaN(uv)) return '--';
  if (uv < 3) return uv.toFixed(1) + ' Low';
  if (uv < 6) return uv.toFixed(1) + ' Moderate';
  if (uv < 8) return uv.toFixed(1) + ' High';
  if (uv < 11) return uv.toFixed(1) + ' Very High';
  return uv.toFixed(1) + ' Extreme';
}

function formatTime(iso) {
  if (!iso) return '--';
  var date = new Date(iso);
  if (isNaN(date.getTime())) return '--';
  return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

function formatCoordLocation(lat, lon) {
  var latDir = lat >= 0 ? 'N' : 'S';
  var lonDir = lon >= 0 ? 'E' : 'W';
  return Math.abs(lat).toFixed(2) + '\u00B0' + latDir + ' ' + Math.abs(lon).toFixed(2) + '\u00B0' + lonDir;
}

function renderWeather(data) {
  var current = data.current || {};
  var daily = data.daily || {};
  var info = weatherCodeInfo(current.weather_code);
  var visKm = current.visibility == null ? null : current.visibility / 1000;

  setText('weatherIconLarge', info.icon);
  setText('weatherTempLarge', current.temperature_2m == null ? '--' : Math.round(current.temperature_2m) + '\u00B0');
  setText('weatherDescLarge', info.desc);
  setText('weatherFeels', current.apparent_temperature == null ? '--' : 'Feels like ' + Math.round(current.apparent_temperature) + '\u00B0C');
  setText('wdHumidity', current.relative_humidity_2m == null ? '--' : current.relative_humidity_2m + '%');
  setText('wdWind', current.wind_speed_10m == null ? '--' : Math.round(current.wind_speed_10m) + ' km/h');
  setText('wdPressure', current.pressure_msl == null ? '--' : Math.round(current.pressure_msl) + ' hPa');
  setText('wdVisibility', visKm == null ? '--' : visKm.toFixed(1) + ' km');
  setText('wdUv', uvLabel(daily.uv_index_max && daily.uv_index_max[0]));
  setText('wdSunrise', formatTime(daily.sunrise && daily.sunrise[0]));
  setText('wdSunset', formatTime(daily.sunset && daily.sunset[0]));
  setText('wdLocation', data.locationLabel || formatCoordLocation(data.latitude, data.longitude));
}

function saveWeatherCache(payload) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ weatherCache: payload });
  }
}

function loadWeatherCache(callback) {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    callback(null);
    return;
  }
  chrome.storage.local.get(['weatherCache'], function(result) {
    callback(result.weatherCache || null);
  });
}

function fetchWeather(lat, lon, locationLabel) {
  var url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + encodeURIComponent(lat)
    + '&longitude=' + encodeURIComponent(lon)
    + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,visibility'
    + '&daily=sunrise,sunset,uv_index_max'
    + '&timezone=auto'
    + '&forecast_days=1';

  return fetch(url).then(function(response) {
    if (!response.ok) throw new Error('Weather request failed');
    return response.json();
  }).then(function(data) {
    data.locationLabel = locationLabel || formatCoordLocation(lat, lon);
    renderWeather(data);
    saveWeatherCache({
      fetchedAt: Date.now(),
      lat: lat,
      lon: lon,
      locationLabel: data.locationLabel,
      data: data
    });
    setWeatherStatus('');
    return data;
  });
}

function getCurrentPosition() {
  return new Promise(function(resolve, reject) {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 15 * 60 * 1000
    });
  });
}

function getWeather() {
  setWeatherStatus('Locating...');

  loadWeatherCache(function(cache) {
    if (cache && cache.data) {
      renderWeather(cache.data);
      setWeatherStatus('Updating...');
    }

    getCurrentPosition().then(function(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      return fetchWeather(lat, lon, formatCoordLocation(lat, lon));
    }).catch(function() {
      if (cache && cache.lat != null && cache.lon != null) {
        return fetchWeather(cache.lat, cache.lon, cache.locationLabel);
      }
      throw new Error('Location unavailable');
    }).catch(function() {
      if (cache && cache.data) {
        setWeatherStatus('Showing last update');
        return;
      }
      setWeatherStatus('Allow location to load weather');
    });
  });
}

var DIAL_STYLES = ['classic', 'modern', 'minimal', 'vintage', 'neon', 'ocean'];

function applyDialStyle(style) {
  var clockContainer = document.querySelector('.clock-container');
  var styleDots = document.querySelectorAll('.style-dot');
  if (!clockContainer) return;

  if (DIAL_STYLES.indexOf(style) === -1) {
    style = 'classic';
  }

  DIAL_STYLES.forEach(function(name) {
    clockContainer.classList.remove('style-' + name);
  });
  if (style !== 'classic') {
    clockContainer.classList.add('style-' + style);
  }

  styleDots.forEach(function(dot) {
    dot.classList.toggle('active', dot.dataset.style === style);
  });
}

function saveDialStyle(style) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set({ dialStyle: style });
  }
}

function setupStyleSelector() {
  var styleDots = document.querySelectorAll('.style-dot');

  styleDots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      var style = dot.dataset.style || 'classic';
      applyDialStyle(style);
      saveDialStyle(style);
    });
  });
}

function setupTabs() {
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabViews = document.querySelectorAll('.tab-view');

  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tabName = btn.dataset.tab;
      var target = document.getElementById('tab-' + tabName);
      if (!target) return;

      tabBtns.forEach(function(b) { b.classList.remove('active'); });
      tabViews.forEach(function(v) { v.classList.remove('active'); });

      btn.classList.add('active');
      target.classList.add('active');
    });
  });
}

// Dark/light mode toggle
function setupModeToggle() {
  var toggle = document.getElementById('modeToggle');

  function setMode(light) {
    if (light) {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ lightMode: light });
    }
  }

  function loadMode() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['lightMode'], function(result) {
        if (result.lightMode) {
          document.body.classList.add('light');
        }
      });
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function() {
      var isLight = document.body.classList.contains('light');
      setMode(!isLight);
    });
  }

  loadMode();
}

function loadSettings() {
  if (typeof chrome === 'undefined' || !chrome.storage) return;

  chrome.storage.sync.get(['dialStyle'], function(result) {
    if (result.dialStyle) {
      applyDialStyle(result.dialStyle);
    }
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.close();
    }
  });
}

// ---- Skyline background ----
// Deterministic-ish skyline profile: each entry is one building's relative width
// and its height as a percentage of the city strip.
var SKY_BUILDINGS = [
  { w: 5, h: 34 }, { w: 4, h: 52 }, { w: 6, h: 40 }, { w: 4, h: 64 },
  { w: 5, h: 30 }, { w: 4, h: 72 }, { w: 6, h: 46 }, { w: 4, h: 58 },
  { w: 5, h: 36 }, { w: 4, h: 68 }, { w: 6, h: 42 }, { w: 4, h: 50 },
  { w: 5, h: 74 }, { w: 4, h: 38 }, { w: 6, h: 56 }, { w: 4, h: 32 }
];

var POPUP_WIDTH = 420;
var CITY_STRIP_RATIO = 0.46;
var skylineBuilt = false;

function buildSkyline() {
  if (skylineBuilt) return;
  var skyline = document.getElementById('skyline');
  if (!skyline) return;
  skylineBuilt = true;

  var stars = document.getElementById('skyStars');
  if (stars) {
    for (var i = 0; i < 46; i++) {
      var star = document.createElement('span');
      star.className = 'star';
      star.style.left = (Math.random() * 100).toFixed(2) + '%';
      star.style.top = (Math.random() * 62).toFixed(2) + '%';
      var size = Math.random() < 0.25 ? 2.5 : 1.6;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.animationDuration = (2.6 + Math.random() * 3.4).toFixed(2) + 's';
      star.style.animationDelay = (-Math.random() * 7).toFixed(2) + 's';
      stars.appendChild(star);
    }
  }

  var clouds = document.getElementById('skyClouds');
  if (clouds) {
    for (var c = 0; c < 4; c++) {
      var cloud = document.createElement('span');
      cloud.className = 'cloud';
      cloud.style.width = (26 + Math.random() * 30).toFixed(0) + 'px';
      cloud.style.height = (7 + Math.random() * 4).toFixed(1) + 'px';
      cloud.style.top = (8 + Math.random() * 30).toFixed(1) + '%';
      cloud.style.left = '0';
      cloud.style.animationDuration = (110 + Math.random() * 80).toFixed(0) + 's';
      cloud.style.animationDelay = (-Math.random() * 160).toFixed(0) + 's';
      clouds.appendChild(cloud);
    }
  }

  var city = document.getElementById('skyCity');
  if (!city) return;

  var totalW = SKY_BUILDINGS.reduce(function(sum, b) { return sum + b.w; }, 0);
  var stripH = POPUP_WIDTH * CITY_STRIP_RATIO;
  var left = 0;

  SKY_BUILDINGS.forEach(function(b) {
    var widthPct = (b.w / totalW) * 100;
    var el = document.createElement('div');
    el.className = 'building';
    el.style.left = left.toFixed(2) + '%';
    el.style.width = widthPct.toFixed(2) + '%';
    el.style.height = b.h + '%';
    city.appendChild(el);
    left += widthPct;

    var winPx = (widthPct / 100) * POPUP_WIDTH;
    var bldPx = (b.h / 100) * stripH;
    var cols = Math.max(1, Math.floor((winPx - 8) / 9));
    var rows = Math.max(1, Math.floor((bldPx - 10) / 8));
    var count = Math.min(cols * rows, 40);

    el.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    for (var k = 0; k < count; k++) {
      var win = document.createElement('span');
      win.className = 'win';
      if (Math.random() < 0.5) {
        win.classList.add('win-steady');
        win.style.setProperty('--steady', (0.3 + Math.random() * 0.5).toFixed(2));
      } else {
        win.style.setProperty('--blink-dur', (6 + Math.random() * 9).toFixed(1) + 's');
        win.style.setProperty('--blink-delay', (-Math.random() * 12).toFixed(1) + 's');
      }
      el.appendChild(win);
    }
  });
}

function currentDaypart(hour) {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

function placeCelestial(el, progress) {
  if (!el) return;
  if (progress < 0) progress = 0;
  if (progress > 1) progress = 1;
  el.style.left = (8 + progress * 84).toFixed(2) + '%';
  el.style.top = (68 - Math.sin(progress * Math.PI) * 44).toFixed(2) + '%';
}

function updateSky() {
  var now = new Date();
  var hour = now.getHours() + now.getMinutes() / 60;

  document.body.setAttribute('data-sky', currentDaypart(now.getHours()));

  // Sun travels the 06:00-18:00 arc, the moon the 18:00-06:00 arc.
  placeCelestial(document.getElementById('skySun'), (hour - 6) / 12);
  placeCelestial(document.getElementById('skyMoon'), (((hour - 18) % 24) + 24) % 24 / 12);
}

function init() {
  cacheClockElements();
  createHourMarkers();

  function tick() {
    updateClock();
    updateCurrentTime();
    requestAnimationFrame(tick);
  }
  tick();

  updateDate();
  setInterval(updateDate, 60000);

  buildWorldClock();
  updateWorldClock();
  setInterval(updateWorldClock, 1000);

  getWeather();

  buildSkyline();
  updateSky();
  setInterval(updateSky, 30000);

  setupStyleSelector();
  setupTabs();
  setupModeToggle();
  setupFormatToggle();
  loadSettings();
}

document.addEventListener('DOMContentLoaded', function() {
  init();
  setupKeyboardShortcuts();
});
