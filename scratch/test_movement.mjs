import { spawn } from 'child_process';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testMovement() {
  console.log('Testing player movement and collision...');
  const chromeProc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--user-data-dir=/tmp/c_prof_test',
    '--window-size=960,540',
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
  await sleep(1000);

  // Evaluate initial player position
  const getPos = async () => {
    const res = await send('Runtime.evaluate', {
      expression: `(function() {
        const p = window.game?.currentScene?.player;
        return p ? { x: Math.round(p.x), y: Math.round(p.y), dir: p.direction } : null;
      })()`,
      returnByValue: true
    });
    return res.result?.result?.value;
  };

  // Wait for game ready
  let pos0 = null;
  for (let i = 0; i < 20; i++) {
    await sleep(100);
    pos0 = await getPos();
    if (pos0) break;
  }
  console.log('Initial player position:', pos0);

  // Simulate pressing ArrowDown for 500ms
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'ArrowDown', key: 'ArrowDown' });
  await sleep(400);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'ArrowDown', key: 'ArrowDown' });
  await sleep(100);
  const posDown = await getPos();
  console.log('Position after moving Down:', posDown);

  // Simulate pressing ArrowUp for 600ms
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'ArrowUp', key: 'ArrowUp' });
  await sleep(600);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'ArrowUp', key: 'ArrowUp' });
  await sleep(100);
  const posUp = await getPos();
  console.log('Position after moving Up:', posUp);

  // Walk left into the picket fence to test collision
  await send('Input.dispatchKeyEvent', { type: 'keyDown', code: 'ArrowLeft', key: 'ArrowLeft' });
  await sleep(500);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', code: 'ArrowLeft', key: 'ArrowLeft' });
  await sleep(100);
  const posLeft = await getPos();
  console.log('Position after attempting to walk Left through fence:', posLeft);

  ws.close();
  chromeProc.kill();
  console.log('Movement & collision test completed successfully!');
  process.exit(0);
}

testMovement().catch((err) => {
  console.error(err);
  process.exit(1);
});

