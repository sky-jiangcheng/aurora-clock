// The popup is a fixed 560x560 square; blowing it up to 1280x800 would distort
// the dial and misrepresent the product. Instead the popup is centred at its
// natural size on a 1280x800 backdrop carrying the theme's own palette, which
// is also how the existing store images were produced.
//
//   node test/capture-store.js
const fs = require('fs');
const path = require('path');

const PORT = 9223;
const ROOT = path.join(__dirname, '..');
const HARNESS = 'file://' + path.join(ROOT, 'aurora-clock', '_shot.html');
const OUT_DIR = path.join(ROOT, 'docs', 'store');
const W = 1280, H = 800;

const SHOTS = [
  { out: 'clock-classic-1280x800.png', q: 'style=classic&light=0&tab=clock' },
  { out: 'clock-neon-1280x800.png',    q: 'style=neon&light=0&tab=clock' },
  { out: 'clock-light-1280x800.png',   q: 'style=classic&light=1&tab=clock' },
  { out: 'world-1280x800.png',         q: 'style=classic&light=0&tab=world' },
  { out: 'weather-1280x800.png',       q: 'style=classic&light=0&tab=weather' }
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

// The frame must be a real popup at natural size on a wider canvas. Rather than
// an iframe (file:// iframes are opaque here, so we cannot verify the inner
// state), we drive the harness directly and wrap the popup in a centred stage.

async function main() {
  const ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));

  let id = 0;
  const t = await rpc(ws, ++id, 'Target.createTarget', { url: 'about:blank' });
  const S = (await rpc(ws, ++id, 'Target.attachToTarget',
    { targetId: t.targetId, flatten: true })).sessionId;

  await rpc(ws, ++id, 'Page.enable', {}, S);
  await rpc(ws, ++id, 'Runtime.enable', {}, S);
  await rpc(ws, ++id, 'Emulation.setDeviceMetricsOverride',
    { width: W, height: H, deviceScaleFactor: 1, mobile: false }, S);

  // Inject the marketing frame once per page: the harness body is pinned to a
  // 560x560 stage centred on the 1280x800 canvas, over a backdrop that follows
  // the theme being captured.
  const FRAME_CSS = (light) => `
    html{background:${light
      ? 'linear-gradient(160deg,#e9eef5 0%,#dde5f0 100%)'
      : 'linear-gradient(160deg,#161b2a 0%,#0b0f1c 100%)'};}
    html,body{width:${W}px !important;height:${H}px !important;overflow:hidden !important;}
    body{display:flex !important;align-items:center !important;justify-content:center !important;
         background:transparent !important;border-radius:0 !important;}
    body > *{flex:0 0 auto;}
    /* The popup itself: square, centred, with a floating-card shadow. */
    body{box-shadow:none !important;}
    .popup-frame{width:560px;height:560px;border-radius:28px;overflow:hidden;
                 box-shadow:0 26px 72px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.07);}
  `;

  for (const shot of SHOTS) {
    const light = /light=1/.test(shot.q);

    await rpc(ws, ++id, 'Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__FRAME_LIGHT = ${light ? 'true' : 'false'};
        window.__FRAME_W = ${W}; window.__FRAME_H = ${H};
      `
    }, S);

    await rpc(ws, ++id, 'Page.navigate', { url: `${HARNESS}?${shot.q}` }, S);

    // Wait for the requested tab, then wrap the popup in a frame stage.
    let ok = false;
    for (let i = 0; i < 100; i++) {
      const r = await rpc(ws, ++id, 'Runtime.evaluate', {
        expression: "document.getElementById('__shotReady') ? 1 : 0", returnByValue: true
      }, S);
      if (r.result.value === 1) { ok = true; break; }
      await new Promise((r2) => setTimeout(r2, 100));
    }
    if (!ok) throw new Error('harness never settled: ' + shot.out);

    // Wrap every top-level popup node in a single centred stage.
    const wrapped = await rpc(ws, ++id, 'Runtime.evaluate', {
      expression: `(function(){
        var stage = document.createElement('div');
        stage.className = 'popup-frame';
        var nodes = Array.prototype.slice.call(document.body.childNodes)
          .filter(function(n){ return n.nodeType === 1 && n.id !== '__shotReady' && n.id !== '__shotFail'; });
        nodes.forEach(function(n){ stage.appendChild(n); });
        document.body.appendChild(stage);
        var s = document.createElement('style');
        s.textContent = ${JSON.stringify(FRAME_CSS(light))};
        document.head.appendChild(s);
        document.documentElement.style.background =
          ${JSON.stringify(light
            ? 'linear-gradient(160deg,#e9eef5 0%,#dde5f0 100%)'
            : 'linear-gradient(160deg,#161b2a 0%,#0b0f1c 100%)')};
        return nodes.length;
      })()`,
      returnByValue: true
    }, S);
    if (!wrapped.result.value) throw new Error('nothing to frame: ' + shot.out);

    const want = new URLSearchParams(shot.q).get('tab');
    const chk = await rpc(ws, ++id, 'Runtime.evaluate', {
      expression: "document.querySelector('.tab-btn.active').dataset.tab", returnByValue: true
    }, S);
    if (chk.result.value !== want) {
      throw new Error(`tab mismatch ${shot.out}: ${chk.result.value} != ${want}`);
    }

    await rpc(ws, ++id, 'Runtime.evaluate', {
      expression: 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))',
      awaitPromise: true
    }, S);

    const cap = await rpc(ws, ++id, 'Page.captureScreenshot',
      { format: 'png', captureBeyondViewport: false }, S);
    const dest = path.join(OUT_DIR, shot.out);
    fs.writeFileSync(dest, Buffer.from(cap.data, 'base64'));
    const d = fs.readFileSync(dest);
    console.log(`  ${shot.out.padEnd(30)} ${d.readUInt32BE(16)}x${d.readUInt32BE(20)}  ` +
      `${Math.round(d.length / 1024)}KB  tab=${want}`);
  }

  await rpc(ws, ++id, 'Target.closeTarget', { targetId: t.targetId });
  ws.close();
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });