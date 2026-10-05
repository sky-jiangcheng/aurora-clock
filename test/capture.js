// Precise screenshot capture over the Chrome DevTools Protocol.
//
// Why this exists: `chrome --headless --screenshot` captures at its own
// schedule, which can land BEFORE the page settles -- we observed DOM that was
// correct (weather tab active, 22°C rendered) paired with a PNG that still
// showed the clock tab. CDP lets us wait for an explicit readiness signal
// (__shotReady) and only then grab the frame, so the image can never disagree
// with the DOM we verified.
//
//   node test/capture.js
//
// Requires a Chrome already listening on 127.0.0.1:9223.
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 9223;
const ROOT = path.join(__dirname, '..');
const HARNESS = 'file://' + path.join(ROOT, 'aurora-clock', '_shot.html');
const VIEW = { width: 560, height: 560 };
const SCALE = 2;

const SHOTS = [
  { out: 'docs/screenshots/clock-classic.png', q: 'style=classic&light=0&tab=clock' },
  { out: 'docs/screenshots/clock-neon.png',    q: 'style=neon&light=0&tab=clock' },
  { out: 'docs/screenshots/clock-ocean.png',   q: 'style=ocean&light=0&tab=clock' },
  { out: 'docs/screenshots/clock-light.png',   q: 'style=classic&light=1&tab=clock' },
  { out: 'docs/screenshots/world.png',         q: 'style=classic&light=0&tab=world' },
  { out: 'docs/screenshots/weather.png',       q: 'style=classic&light=0&tab=weather' }
];

function rpc(ws, id, method, params, sessionId) {
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id !== id) return;
      ws.removeEventListener('message', onMsg);
      m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result);
    };
    ws.addEventListener('message', onMsg);
    const msg = { id, method, params: params || {} };
    if (sessionId) msg.sessionId = sessionId;
    ws.send(JSON.stringify(msg));
  });
}

async function main() {
  const ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));

  let id = 0;
  const target = await rpc(ws, ++id, 'Target.createTarget', { url: 'about:blank' });
  const att = await rpc(ws, ++id, 'Target.attachToTarget',
    { targetId: target.targetId, flatten: true });
  const S = att.sessionId;

  await rpc(ws, ++id, 'Page.enable', {}, S);
  await rpc(ws, ++id, 'Runtime.enable', {}, S);
  await rpc(ws, ++id, 'Emulation.setDeviceMetricsOverride', {
    width: VIEW.width, height: VIEW.height,
    deviceScaleFactor: SCALE, mobile: false
  }, S);

  for (const shot of SHOTS) {
    await rpc(ws, ++id, 'Page.navigate', { url: `${HARNESS}?${shot.q}` }, S);

    // Wait for the harness to declare the requested state actually rendered.
    let ready = false;
    for (let i = 0; i < 100; i++) {
      const r = await rpc(ws, ++id, 'Runtime.evaluate', {
        expression: "document.getElementById('__shotReady') ? 1 : 0",
        returnByValue: true
      }, S);
      if (r.result && r.result.value === 1) { ready = true; break; }
      await new Promise((r2) => setTimeout(r2, 100));
    }
    if (!ready) {
      const dbg = await rpc(ws, ++id, 'Runtime.evaluate', {
        expression: "(function(){var b=document.querySelector('.tab-btn.active');" +
                   "var v=document.querySelector('.tab-view.active');" +
                   "return JSON.stringify({tab:b&&b.dataset.tab,view:v&&v.id});})()",
        returnByValue: true
      }, S);
      throw new Error(`never settled for ${shot.q} -> ${dbg.result.value}`);
    }

    // Independent assertion: the active tab must be the one we asked for.
    const want = new URLSearchParams(shot.q).get('tab');
    const chk = await rpc(ws, ++id, 'Runtime.evaluate', {
      expression: "document.querySelector('.tab-btn.active').dataset.tab",
      returnByValue: true
    }, S);
    if (chk.result.value !== want) {
      throw new Error(`tab mismatch for ${shot.q}: active=${chk.result.value}`);
    }

    // One frame for layout/paint to land after the state change.
    await rpc(ws, ++id, 'Runtime.evaluate', {
      expression: 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))',
      awaitPromise: true
    }, S);

    const cap = await rpc(ws, ++id, 'Page.captureScreenshot',
      { format: 'png', captureBeyondViewport: false }, S);

    const dest = path.join(ROOT, shot.out);
    fs.writeFileSync(dest, Buffer.from(cap.data, 'base64'));
    const d = fs.readFileSync(dest);
    const w = d.readUInt32BE(16), h = d.readUInt32BE(20);
    console.log(`  ${shot.out.padEnd(34)} ${w}x${h}  ${Math.round(d.length / 1024)}KB  tab=${want}`);
  }

  await rpc(ws, ++id, 'Target.closeTarget', { targetId: target.targetId });
  ws.close();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });