import { spawn } from 'child_process';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Spawning headless Chrome for GBA Visual Test capture...');
  const chromeProc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--user-data-dir=/tmp/c_prof_gba',
    '--window-size=960,640',
    'about:blank'
  ]);

  await sleep(1500);

  const listRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const args = data.params.args.map((a) => a.value || a.description).join(' ');
      console.log(`[Browser Console ${data.params.type}]:`, args);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('[Browser Exception]:', data.params.exceptionDetails);
    }
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      cb(data);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Input.enable');

  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(1500);

  // 1. Capture Overview Shot
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const buf1 = Buffer.from(shot1.result.data, 'base64');
  const out1 = '/Users/Max/.gemini/antigravity/brain/63d973d2-7c7c-48aa-9afc-09c2f30afd78/gba_test_overview.png';
  fs.writeFileSync(out1, buf1);
  console.log(`Saved ${out1} (${buf1.length} bytes)`);

  // 2. Move player up towards the doorstep
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'ArrowUp', key: 'ArrowUp' });
  await sleep(400);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'ArrowUp', key: 'ArrowUp' });
  await sleep(300);

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  const buf2 = Buffer.from(shot2.result.data, 'base64');
  const out2 = '/Users/Max/.gemini/antigravity/brain/63d973d2-7c7c-48aa-9afc-09c2f30afd78/gba_test_doorstep.png';
  fs.writeFileSync(out2, buf2);
  console.log(`Saved ${out2} (${buf2.length} bytes)`);

  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
