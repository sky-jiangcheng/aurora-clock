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

  var existing = dial.querySelectorAll('.hour-marker');
  for (var i = 0; i < existing.length; i++) existing[i].remove();

  for (var i = 0; i < 12; i++) {
    // Skip cardinal positions that have numbers (12, 3, 6, 9)
    if (i % 3 === 0) continue;

    var marker = document.createElement('div');
    marker.className = 'hour-marker';
    marker.style.setProperty('--rot', (i * 30) + 'deg');
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
  var minuteAngle = minutes * 6 + seconds * 0.1;
  var secondAngle = seconds * 6 + milliseconds * 0.006;

  hourHandEl.style.transform = 'rotate(' + hourAngle + 'deg)';
  minuteHandEl.style.transform = 'rotate(' + minuteAngle + 'deg)';
  secondHandEl.style.transform = 'rotate(' + secondAngle + 'deg)';
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
      storageSetSync({ use24Hour: use24Hour });
      updateCurrentTime();
      updateWorldClock();
    });
  }

  updateFormatToggleLabel();

  storageGetSync(['use24Hour']).then(function(res) {
    if (res && typeof res.use24Hour === 'boolean') {
      use24Hour = res.use24Hour;
    }
    updateFormatToggleLabel();
    updateCurrentTime();
    updateWorldClock();
  });
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

// ---- Weather ----
// Data source: Open-Meteo forecast + geocoding (both keyless, CORS enabled).

var WEATHER_CACHE_KEY = 'weatherCache';
var WEATHER_CACHE_TTL = 30 * 60 * 1000;
var WEATHER_TIMEOUT = 8000;
var UNIT_C = 'c';

var weatherState = {
  coords: null,   // { lat, lon, label }
  data: null,
  source: 'none'  // 'cache' | 'live'
};

// WMO weather code -> { icon, desc }. Icons reference the inline SVG sprite.
var WMO = {
  0:  { icon: 'wx-sun', desc: 'Clear Sky' },
  1:  { icon: 'wx-cloud-sun', desc: 'Mainly Clear' },
  2:  { icon: 'wx-cloud-sun', desc: 'Partly Cloudy' },
  3:  { icon: 'wx-cloud', desc: 'Overcast' },
  45: { icon: 'wx-fog', desc: 'Fog' },
  48: { icon: 'wx-fog', desc: 'Depositing Rime Fog' },
  51: { icon: 'wx-drizzle', desc: 'Light Drizzle' },
  53: { icon: 'wx-drizzle', desc: 'Drizzle' },
  55: { icon: 'wx-drizzle', desc: 'Dense Drizzle' },
  56: { icon: 'wx-sleet', desc: 'Light Freezing Drizzle' },
  57: { icon: 'wx-sleet', desc: 'Freezing Drizzle' },
  61: { icon: 'wx-rain', desc: 'Light Rain' },
  63: { icon: 'wx-rain', desc: 'Rain' },
  65: { icon: 'wx-rain', desc: 'Heavy Rain' },
  66: { icon: 'wx-sleet', desc: 'Light Freezing Rain' },
  67: { icon: 'wx-sleet', desc: 'Freezing Rain' },
  71: { icon: 'wx-snow', desc: 'Light Snow' },
  73: { icon: 'wx-snow', desc: 'Snow' },
  75: { icon: 'wx-snow', desc: 'Heavy Snow' },
  77: { icon: 'wx-snow', desc: 'Snow Grains' },
  80: { icon: 'wx-rain', desc: 'Light Showers' },
  81: { icon: 'wx-rain', desc: 'Showers' },
  82: { icon: 'wx-rain', desc: 'Violent Showers' },
  85: { icon: 'wx-snow', desc: 'Snow Showers' },
  86: { icon: 'wx-snow', desc: 'Heavy Snow Showers' },
  95: { icon: 'wx-thunder', desc: 'Thunderstorm' },
  96: { icon: 'wx-thunder', desc: 'Thunderstorm with Hail' },
  99: { icon: 'wx-thunder', desc: 'Severe Thunderstorm with Hail' }
};

function weatherCodeInfo(code, isDay) {
  var info = WMO[code] || { icon: 'wx-cloud', desc: 'Cloudy' };
  // Clear skies read as a moon at night.
  if (!isDay && (code === 0 || code === 1)) {
    return { icon: code === 0 ? 'wx-moon' : 'wx-cloud-moon', desc: info.desc };
  }
  return info;
}

function uvLabel(uv) {
  if (uv == null || isNaN(uv)) return '--';
  var v = Math.round(uv * 10) / 10;
  var band = uv < 3 ? 'Low' : uv < 6 ? 'Moderate' : uv < 8 ? 'High' : uv < 11 ? 'Very High' : 'Extreme';
  return v + ' ' + band;
}

function tempLabel(celsius) {
  if (celsius == null || isNaN(celsius)) return '--';
  var v = UNIT_C === 'c' ? celsius : celsius * 9 / 5 + 32;
  return Math.round(v) + '\u00B0' + UNIT_C.toUpperCase();
}

// Open-Meteo returns sunrise/sunset as wall-clock strings in the *location's*
// timezone (e.g. "2026-10-04T06:13"). Parsing them with new Date() would
// reinterpret them in the browser timezone, so read the substring directly.
function formatLocalTime(iso) {
  if (!iso || typeof iso !== 'string') return '--';
  var m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? m[1] + ':' + m[2] : '--';
}

// daily.time is a bare "YYYY-MM-DD" in the location's timezone. Build the Date
// in wall-clock terms so toLocaleDateString does not shift it by a day.
function formatDayLabel(dateStr) {
  if (!dateStr) return '--';
  var m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return dateStr;
  var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  var today = new Date();
  var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function formatCoordShort(lat, lon) {
  return Math.abs(lat).toFixed(2) + '\u00B0' + (lat >= 0 ? 'N' : 'S') + ' ' +
         Math.abs(lon).toFixed(2) + '\u00B0' + (lon >= 0 ? 'E' : 'W');
}

function setWeatherIcon(id, symbolId) {
  var el = document.getElementById(id);
  if (!el) return;
  var use = el.querySelector('use');
  if (use) use.setAttribute('href', '#' + symbolId);
}

function relativeAge(ts) {
  if (!ts) return '';
  var mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  var hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.round(hrs / 24) + 'd ago';
}

// ---- Renderers ----

function renderHourly(data) {
  var wrap = document.getElementById('wxHourly');
  if (!wrap) return;

  var hourly = data.hourly;
  if (!hourly || !hourly.time) {
    wrap.innerHTML = '';
    return;
  }

  // Start from the current hour so the strip is always forward-looking.
  var currentHour = (data.current && data.current.time) || '';
  var start = 0;
  if (currentHour) {
    for (var i = 0; i < hourly.time.length; i++) {
      if (hourly.time[i] >= currentHour.slice(0, 13)) { start = i; break; }
    }
  }

  var cells = [];
  var count = Math.min(12, hourly.time.length - start);
  for (var k = 0; k < count; k++) {
    var idx = start + k;
    var isDay = Number(hourly.is_day ? hourly.is_day[idx] : 1) === 1;
    var icon = weatherCodeInfo(hourly.weather_code[idx], isDay).icon;
    var pop = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : null;
    var label = k === 0 ? 'Now' : formatLocalTime(hourly.time[idx]);
    cells.push(
      '<div class="wx-hour' + (k === 0 ? ' is-now' : '') + '">' +
        '<span class="wx-hour-label">' + label + '</span>' +
        '<svg class="wx-hour-icon" viewBox="0 0 64 64" aria-hidden="true"><use href="#' + icon + '"></use></svg>' +
        '<span class="wx-hour-temp">' + tempLabel(hourly.temperature_2m[idx]) + '</span>' +
        '<span class="wx-hour-pop">' + (pop ? pop + '%' : '\u00B7') + '</span>' +
      '</div>'
    );
  }
  wrap.innerHTML = cells.join('');
}

// Open-Meteo exposes is_day for current/hourly but NOT for daily, so derive
// day/night for daily rows from that day's own sunrise/sunset.
function dailyIsDay(daily, i) {
  var rise = daily.sunrise ? daily.sunrise[i] : null;
  var set = daily.sunset ? daily.sunset[i] : null;
  if (!rise || !set) return true;
  var now = new Date();
  var todayLocal = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  if (!daily.time || daily.time[i] !== todayLocal) return true;
  var mins = now.getHours() * 60 + now.getMinutes();
  var riseM = minutesOfDay(rise);
  var setM = minutesOfDay(set);
  if (riseM == null || setM == null) return true;
  return mins >= riseM && mins < setM;
}

function minutesOfDay(iso) {
  var m = String(iso).match(/T(\d{2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function renderDaily(data) {
  var wrap = document.getElementById('wxForecast');
  if (!wrap) return;

  var daily = data.daily;
  if (!daily || !daily.time) {
    wrap.innerHTML = '';
    return;
  }

  var labels = ['Today', 'Tomorrow'];
  var cells = [];
  var limit = Math.min(daily.time.length, 5);
  for (var i = 0; i < limit; i++) {
    var pop = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : null;
    var dateLabel = labels[i] || formatDayLabel(daily.time[i]);
    cells.push(
      '<div class="wx-day">' +
        '<span class="wx-day-name">' + dateLabel + '</span>' +
        '<svg class="wx-day-icon" viewBox="0 0 64 64" aria-hidden="true"><use href="#' + weatherCodeInfo(daily.weather_code[i], dailyIsDay(daily, i)).icon + '"></use></svg>' +
        '<span class="wx-day-pop">' + (pop != null ? pop + '%' : '') + '</span>' +
        '<span class="wx-day-range">' +
          '<b>' + tempLabel(daily.temperature_2m_max[i]) + '</b>' +
          '<i>' + tempLabel(daily.temperature_2m_min[i]) + '</i>' +
        '</span>' +
      '</div>'
    );
  }
  wrap.innerHTML = cells.join('');
}

function renderWeather(data) {
  var current = data.current || {};
  var daily = data.daily || {};
  var info = weatherCodeInfo(current.weather_code, current.is_day !== 0);

  setWeatherIcon('weatherIconLarge', info.icon);
  setText('weatherTempLarge', tempLabel(current.temperature_2m));
  setText('weatherDescLarge', info.desc);
  setText('weatherFeels', 'Feels like ' + tempLabel(current.apparent_temperature));

  var hi = daily.temperature_2m_max ? daily.temperature_2m_max[0] : null;
  var lo = daily.temperature_2m_min ? daily.temperature_2m_min[0] : null;
  setText('weatherRange', (hi == null && lo == null) ? '' : 'High ' + tempLabel(hi) + '  \u00B7  Low ' + tempLabel(lo));

  setText('wdLocation', data.locationLabel || formatCoordShort(data.latitude, data.longitude));
  setText('wdHumidity', current.relative_humidity_2m == null ? '--' : current.relative_humidity_2m + '%');
  setText('wdWind', current.wind_speed_10m == null ? '--' : Math.round(current.wind_speed_10m) + ' km/h');
  setText('wdFeels', current.apparent_temperature == null ? '--' : tempLabel(current.apparent_temperature));
  setText('wdPressure', current.pressure_msl == null ? '--' : Math.round(current.pressure_msl) + ' hPa');
  setText('wdVisibility', current.visibility == null ? '--' : (current.visibility / 1000).toFixed(1) + ' km');
  setText('wdUv', uvLabel(daily.uv_index_max ? daily.uv_index_max[0] : null));
  setText('wdSunrise', formatLocalTime(daily.sunrise ? daily.sunrise[0] : null));
  setText('wdSunset', formatLocalTime(daily.sunset ? daily.sunset[0] : null));

  renderHourly(data);
  renderDaily(data);
}

// ---- Storage helpers ----

function storageGet(keys) {
  return new Promise(function(resolve) {
    if (typeof chrome === 'undefined' || !chrome.storage) { resolve(null); return; }
    chrome.storage.local.get(keys, function(res) { resolve(res || null); });
  });
}

function storageSet(items) {
  return new Promise(function(resolve) {
    if (typeof chrome === 'undefined' || !chrome.storage) { resolve(); return; }
    chrome.storage.local.set(items, function() { resolve(); });
  });
}

function storageGetSync(keys) {
  return new Promise(function(resolve) {
    if (typeof chrome === 'undefined' || !chrome.storage) { resolve(null); return; }
    chrome.storage.sync.get(keys, function(res) { resolve(res || null); });
  });
}

function storageSetSync(items) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set(items);
  }
}

function loadWeatherCache() {
  return storageGet([WEATHER_CACHE_KEY]).then(function(res) {
    var cache = res && res[WEATHER_CACHE_KEY];
    return (cache && cache.data) ? cache : null;
  });
}

// ---- Networking (hard timeout so the UI never hangs) ----

function fetchJson(url) {
  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = setTimeout(function() {
    if (controller) controller.abort();
  }, WEATHER_TIMEOUT);

  return fetch(url, controller ? { signal: controller.signal } : {}).then(function(response) {
    clearTimeout(timer);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  }, function(err) {
    clearTimeout(timer);
    if (err && err.name === 'AbortError') throw new Error('Weather request timed out');
    throw err;
  });
}

function buildForecastUrl(lat, lon) {
  return 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + encodeURIComponent(lat)
    + '&longitude=' + encodeURIComponent(lon)
    + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,visibility'
    + '&daily=weather_code,sunrise,sunset,uv_index_max,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    + '&hourly=temperature_2m,weather_code,precipitation_probability,is_day'
    + '&timezone=auto'
    + '&forecast_days=5';
}

function fetchWeather(coords) {
  return fetchJson(buildForecastUrl(coords.lat, coords.lon)).then(function(data) {
    data.locationLabel = coords.label;
    weatherState.data = data;
    weatherState.coords = coords;
    weatherState.source = 'live';
    renderWeather(data);
    setWeatherStatus('');
    setText('wxUpdated', 'Updated ' + relativeAge(Date.now()));

    return storageSet({
      [WEATHER_CACHE_KEY]: {
        fetchedAt: Date.now(),
        lat: coords.lat,
        lon: coords.lon,
        locationLabel: coords.label,
        data: data
      },
      weatherLocation: coords
    }).then(function() { return data; });
  });
}

function geocodeCity(name) {
  var url = 'https://geocoding-api.open-meteo.com/v1/search'
    + '?name=' + encodeURIComponent(name)
    + '&count=6&language=en&format=json';
  return fetchJson(url).then(function(res) {
    return (res && res.results) || [];
  });
}

// ---- Geolocation (opt-in only: never on popup open) ----

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

function requestGeolocation() {
  return getCurrentPosition().then(function(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    return { lat: lat, lon: lon, label: formatCoordShort(lat, lon) };
  });
}

// ---- Orchestration ----

function loadWeather(coords, statusText) {
  setWeatherStatus(statusText || 'Loading...');

  return loadWeatherCache().then(function(cache) {
    var fresh = cache && (Date.now() - cache.fetchedAt) < WEATHER_CACHE_TTL;
    var target = coords ||
      (cache && cache.lat != null ? { lat: cache.lat, lon: cache.lon, label: cache.locationLabel } : null);

    // Paint from cache immediately for instant feedback.
    if (cache && cache.data) {
      cache.data.locationLabel = cache.data.locationLabel || cache.locationLabel;
      renderWeather(cache.data);
      weatherState.source = 'cache';
      setText('wxUpdated', 'Updated ' + relativeAge(cache.fetchedAt));
    }

    if (!target) {
      setWeatherStatus('Search a city or use your location');
      return null;
    }

    // Fresh cache for the requested city: nothing to refetch.
    if (fresh && cache && cache.data && (!coords || (cache.lat === coords.lat && cache.lon === coords.lon))) {
      weatherState.coords = target;
      setWeatherStatus('');
      return cache.data;
    }

    return fetchWeather(target).catch(function() {
      if (cache && cache.data) {
        setWeatherStatus('Offline - showing last update');
        return cache.data;
      }
      setWeatherStatus('Weather unavailable - retry or pick another city');
      return null;
    });
  });
}

function refreshWeather() {
  var coords = weatherState.coords;
  if (!coords) {
    loadWeather(null, 'Loading...');
    return;
  }
  setWeatherStatus('Refreshing...');
  fetchWeather(coords).catch(function() {
    setWeatherStatus('Refresh failed - showing last update');
  });
}

function locateWeather() {
  setWeatherStatus('Locating...');
  requestGeolocation().then(function(coords) {
    return loadWeather(coords, 'Loading...');
  }).catch(function(err) {
    setWeatherStatus(err && err.code === 1
      ? 'Location denied - search for a city instead'
      : 'Location unavailable - search for a city instead');
  });
}

// ---- City search ----

function renderCityResults(results) {
  var box = document.getElementById('cityResults');
  if (!box) return;

  box._results = results;

  if (!results.length) {
    box.innerHTML = '<div class="wx-result-empty">No matching city</div>';
    box.hidden = false;
    return;
  }

  box.innerHTML = results.map(function(r, i) {
    return '<button type="button" class="wx-result" data-idx="' + i + '">' +
      '<span class="wx-result-name"></span>' +
      '<span class="wx-result-region"></span>' +
    '</button>';
  }).join('');

  // Filled via textContent: geocoding names are untrusted input.
  var nodes = box.querySelectorAll('.wx-result');
  results.forEach(function(r, i) {
    nodes[i].querySelector('.wx-result-name').textContent = r.name;
    nodes[i].querySelector('.wx-result-region').textContent = [r.admin1, r.country].filter(Boolean).join(', ');
  });

  box.hidden = false;
}

function setupCitySearch() {
  var input = document.getElementById('cityInput');
  var btn = document.getElementById('citySearchBtn');
  var locateBtn = document.getElementById('wxLocateBtn');
  var refreshBtn = document.getElementById('wxRefreshBtn');
  var optionsBtn = document.getElementById('wxOptionsBtn');
  var box = document.getElementById('cityResults');

  if (!input || !btn || !box) return;

  function hide() { box.hidden = true; }

  function run() {
    var q = input.value.trim();
    if (!q) {
      setWeatherStatus('Type a city name');
      return;
    }
    setWeatherStatus('Searching...');
    geocodeCity(q).then(function(results) {
      renderCityResults(results);
      setWeatherStatus(results.length
        ? 'Pick a city'
        : 'No matching city');
      if (!results.length) input.select();
    }).catch(function() {
      renderCityResults([]);
      setWeatherStatus('City search failed');
    });
  }

  btn.addEventListener('click', run);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); run(); }
    else if (e.key === 'Escape') { hide(); }
  });
  input.addEventListener('input', function() {
    if (!input.value.trim()) hide();
  });
  input.addEventListener('blur', function() {
    setTimeout(hide, 150);
  });

  box.addEventListener('click', function(e) {
    var target = e.target.closest('.wx-result');
    if (!target) return;
    var r = (box._results || [])[Number(target.dataset.idx)];
    if (!r) return;
    hide();
    input.value = r.name;
    loadWeather({
      lat: r.latitude,
      lon: r.longitude,
      label: r.name + (r.country ? ', ' + r.country : '')
    }, 'Loading...');
  });

  if (locateBtn) locateBtn.addEventListener('click', locateWeather);
  if (refreshBtn) refreshBtn.addEventListener('click', refreshWeather);

  if (optionsBtn) {
    optionsBtn.addEventListener('click', function() {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    });
  }
}

function setupUnitToggle() {
  var btn = document.getElementById('unitToggle');

  function paint() {
    if (btn) btn.textContent = '\u00B0' + UNIT_C.toUpperCase();
  }

  if (btn) {
    btn.addEventListener('click', function() {
      UNIT_C = UNIT_C === 'c' ? 'f' : 'c';
      storageSetSync({ tempUnit: UNIT_C });
      paint();
      if (weatherState.data) renderWeather(weatherState.data);
    });
  }

  paint();

  return storageGetSync(['tempUnit']).then(function(res) {
    if (res && (res.tempUnit === 'c' || res.tempUnit === 'f')) {
      UNIT_C = res.tempUnit;
      paint();
    }
    if (weatherState.data) renderWeather(weatherState.data);
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
    var active = dot.dataset.style === style;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-checked', active ? 'true' : 'false');
    dot.tabIndex = active ? 0 : -1;
  });
}

function saveDialStyle(style) {
  storageSetSync({ dialStyle: style });
}

function setupStyleSelector() {
  var styleDots = document.querySelectorAll('.style-dot');

  function select(dot, focus) {
    applyDialStyle(dot.dataset.style || 'classic');
    saveDialStyle(dot.dataset.style || 'classic');
    if (focus) dot.focus();
  }

  styleDots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { select(dot, false); });

    // Arrow-key navigation for the radiogroup.
    dot.addEventListener('keydown', function(e) {
      var dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      select(styleDots[(i + dir + styleDots.length) % styleDots.length], true);
    });
  });
}

function setupTabs() {
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabViews = document.querySelectorAll('.tab-view');

  function activate(btn) {
    var target = document.getElementById('tab-' + btn.dataset.tab);
    if (!target) return;

    tabBtns.forEach(function(b) {
      var on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    tabViews.forEach(function(v) { v.classList.remove('active'); });
    target.classList.add('active');
  }

  tabBtns.forEach(function(btn, i) {
    btn.addEventListener('click', function() { activate(btn); });

    btn.addEventListener('keydown', function(e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabBtns[(i + dir + tabBtns.length) % tabBtns.length];
      activate(next);
      next.focus();
    });
  });
}

// Dark/light mode toggle
function setupModeToggle() {
  var toggle = document.getElementById('modeToggle');

  function setMode(light) {
    document.body.classList.toggle('light', light);
    storageSetSync({ lightMode: light });
  }

  function loadMode() {
    storageGetSync(['lightMode']).then(function(res) {
      if (res && res.lightMode) document.body.classList.add('light');
    });
  }

  if (toggle) {
    toggle.addEventListener('click', function() {
      setMode(!document.body.classList.contains('light'));
    });
  }

  loadMode();
}

function loadSettings() {
  storageGetSync(['dialStyle']).then(function(res) {
    if (res && res.dialStyle) applyDialStyle(res.dialStyle);
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Escape closes, but not while typing in the city field.
    var typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
    if (e.key === 'Escape' && !typing) {
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
  var cityW = city.clientWidth || 480;
  var stripH = city.clientHeight || cityW * CITY_STRIP_RATIO;
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

    var winPx = (widthPct / 100) * cityW;
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

  // Pause the rAF loop while the tab is hidden: a background rAF either burns
  // battery or stalls, and popup timers are cheap to resume.
  var rafId = null;

  function tick() {
    updateClock();
    updateCurrentTime();
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      cancelAnimationFrame(rafId);
      tick();
    }
  });

  tick();

  updateDate();
  setInterval(updateDate, 60000);

  buildWorldClock();
  updateWorldClock();
  setInterval(updateWorldClock, 1000);

  setupStyleSelector();
  setupTabs();
  setupModeToggle();
  setupFormatToggle();
  loadSettings();

  // Unit first so the first weather paint already uses the right scale.
  setupUnitToggle().then(function() {
    // No geolocation on open: the permission prompt closes the popup.
    // Only cached / previously selected city data is used here.
    return loadWeather(null, '');
  });

  setupCitySearch();

  buildSkyline();
  updateSky();
  setInterval(updateSky, 30000);
}

document.addEventListener('DOMContentLoaded', function() {
  init();
  setupKeyboardShortcuts();
});
