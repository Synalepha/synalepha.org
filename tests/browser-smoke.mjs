import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, readdir, readFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'synalepha-smoke-'));
const profile = path.join(temporary, 'chromium-profile');
const downloads = path.join(temporary, 'downloads');
await mkdir(downloads);
const serverPort = 8137;
const debugPort = 9237;
const server = spawn('python3', ['-m', 'http.server', String(serverPort), '--bind', '127.0.0.1'], {cwd: root, stdio: 'ignore'});
const browser = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'
], {stdio: 'ignore'});
const failures = [];
const exceptions = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitForJson(url, options) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
    } catch (_) { /* process is still starting */ }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, {once: true});
      this.socket.addEventListener('error', reject, {once: true});
    });
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text || 'Runtime exception');
      if (!message.id || !this.pending.has(message.id)) return;
      const {resolve, reject} = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    });
  }
  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const response = new Promise((resolve, reject) => this.pending.set(id, {resolve, reject}));
    this.socket.send(JSON.stringify({id, method, params}));
    return response;
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Evaluation failed');
    return result.result.value;
  }
  close() { this.socket.close(); }
}

async function waitForReady(cdp) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if (await cdp.evaluate('document.readyState === "complete"')) return;
    } catch (_) { /* navigation in progress */ }
    await delay(100);
  }
  throw new Error('Page did not become ready');
}

let cdp;
try {
  await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);
  const target = await waitForJson(`http://127.0.0.1:${debugPort}/json/new?http://127.0.0.1:${serverPort}/create.html`, {method: 'PUT'});
  cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Browser.setDownloadBehavior', {behavior: 'allow', downloadPath: downloads});
  await waitForReady(cdp);

  const exemplar = await cdp.evaluate(`(() => {
    document.querySelector('#toggle-exemplars').click();
    document.querySelector('[data-exemplar="ex-spanish-novice"]').click();
    return {
      title: document.querySelector('#lesson-title').value,
      language: document.querySelector('#language').value,
      reviewVisible: !document.querySelector('[data-step-panel="5"]').hidden,
      artifact: document.querySelector('#lesson-artifact').innerText,
      criteria: document.querySelectorAll('.rubric-row').length
    };
  })()`);
  check(exemplar.title === 'El mejor plan para el tiempo', 'Spanish Novice exemplar did not load');
  check(exemplar.language === 'Spanish' && exemplar.reviewVisible, 'Exemplar did not carry fields to review');
  check(exemplar.artifact.includes('AEMET') && exemplar.artifact.includes('Achievement evidence rubric'), 'Artifact omitted source or rubric evidence');
  check(exemplar.criteria === 2, 'Exemplar rubric criteria did not load');
  const exemplarWarnings = await cdp.evaluate(`(() => ['ex-spanish-novice', 'ex-spanish-intermediate', 'ex-french-novice', 'ex-french-intermediate'].map(id => {
    document.querySelector('[data-exemplar="' + id + '"]').click();
    return {id, warnings: document.querySelectorAll('.guidance-item.warning').length};
  }))()`);
  exemplarWarnings.forEach(item => check(item.warnings === 0, `${item.id} loads with ${item.warnings} unresolved Studio warning(s)`));

  const focusFlow = await cdp.evaluate(`(() => {
    document.querySelector('[data-exemplar="ex-spanish-novice"]').click();
    document.querySelector('[data-step="0"]').click();
    const navFocus = {id: document.activeElement.id, tabindex: document.activeElement.getAttribute('tabindex')};
    document.querySelector('#next-step').click();
    const continueFocus = {id: document.activeElement.id, tabindex: document.activeElement.getAttribute('tabindex')};
    return {navFocus, continueFocus};
  })()`);
  check(focusFlow.navFocus.id === 'step-purpose-title' && focusFlow.navFocus.tabindex === '-1', 'Step navigation did not focus a programmatically focusable heading');
  check(focusFlow.continueFocus.id === 'step-source-title' && focusFlow.continueFocus.tabindex === '-1', 'Continue did not focus a programmatically focusable heading');

  const overrideFreshness = await cdp.evaluate(`(() => {
    document.querySelector('[data-exemplar="ex-spanish-novice"]').click();
    const outcome = document.querySelector('#outcome');
    outcome.value = 'Learners complete the grammar worksheet.';
    outcome.dispatchEvent(new Event('input', {bubbles: true}));
    document.querySelector('[data-override="outcome"]').click();
    const confirmed = document.querySelector('[data-override="outcome"]').checked;
    const title = document.querySelector('#lesson-title');
    title.value = title.value + ' revised';
    title.dispatchEvent(new Event('input', {bubbles: true}));
    const survivesUnrelatedEdit = document.querySelector('[data-override="outcome"]').checked;
    outcome.value = 'Learners complete a vocabulary worksheet.';
    outcome.dispatchEvent(new Event('input', {bubbles: true}));
    const requiresReconfirmation = !document.querySelector('[data-override="outcome"]').checked;
    const draft = JSON.parse(localStorage.getItem('synalepha-lesson-draft-v1'));
    return {confirmed, survivesUnrelatedEdit, requiresReconfirmation, draftOverride: Boolean(draft.overrides.outcome), draftSignature: Boolean(draft.overrideSignatures.outcome)};
  })()`);
  check(overrideFreshness.confirmed && overrideFreshness.survivesUnrelatedEdit, 'A current teacher override did not survive an unrelated lesson edit');
  check(overrideFreshness.requiresReconfirmation && !overrideFreshness.draftOverride && !overrideFreshness.draftSignature, 'A stale teacher override remained active or persisted after relevant content changed');

  const escaped = await cdp.evaluate(`(() => {
    const title = document.querySelector('#lesson-title');
    title.value = '<img src=x onerror="window.__unsafe=true">';
    title.dispatchEvent(new Event('input', {bubbles: true}));
    return {unsafe: Boolean(window.__unsafe), image: Boolean(document.querySelector('#lesson-artifact img')), text: document.querySelector('#lesson-artifact h2').textContent};
  })()`);
  check(!escaped.unsafe && !escaped.image && escaped.text.startsWith('<img'), 'User content was not safely escaped in the artifact');

  const storage = await cdp.evaluate(`(() => {
    document.querySelector('[data-exemplar="ex-spanish-novice"]').click();
    document.querySelector('#save-lesson').click();
    const before = JSON.parse(localStorage.getItem('synalepha-lesson-draft-v1'));
    document.querySelector('#duplicate-lesson').click();
    const after = JSON.parse(localStorage.getItem('synalepha-lesson-draft-v1'));
    return {saved: document.querySelectorAll('.saved-card').length, changedId: before.id !== after.id, remixTitle: document.querySelector('#lesson-title').value};
  })()`);
  check(storage.saved >= 1, 'Local save did not create a saved lesson');
  check(storage.changedId && storage.remixTitle.startsWith('Remix:'), 'Duplicate/remix did not preserve a distinct lesson identity');

  const deletion = await cdp.evaluate(`(() => {
    document.querySelector('#save-lesson').click();
    const key = 'synalepha-lesson-studio-v1';
    const before = JSON.parse(localStorage.getItem(key));
    const targetId = before[0].id;
    const retainedId = before[1].id;
    const draftId = JSON.parse(localStorage.getItem('synalepha-lesson-draft-v1')).id;
    let prompt = '';
    window.confirm = message => { prompt = message; return false; };
    document.querySelector('[data-delete-id="' + targetId + '"]').click();
    const afterCancel = JSON.parse(localStorage.getItem(key));
    const cancelStatus = document.querySelector('#global-status').textContent;
    window.confirm = message => { prompt = message; return true; };
    document.querySelector('[data-delete-id="' + targetId + '"]').click();
    const afterDelete = JSON.parse(localStorage.getItem(key));
    const draftAfter = JSON.parse(localStorage.getItem('synalepha-lesson-draft-v1')).id;
    return {
      deleteLabel: document.querySelector('[data-delete-id]')?.textContent,
      before: before.length,
      afterCancel: afterCancel.length,
      cancelKeptTarget: afterCancel.some(item => item.id === targetId),
      cancelStatus,
      afterDelete: afterDelete.length,
      removedTarget: !afterDelete.some(item => item.id === targetId),
      retainedNeighbor: afterDelete.some(item => item.id === retainedId),
      draftUnchanged: draftAfter === draftId,
      prompt
    };
  })()`);
  check(deletion.deleteLabel === 'Delete' && deletion.prompt.includes('only this lesson'), 'Saved lesson Delete action or its single-item confirmation is unclear');
  check(deletion.afterCancel === deletion.before && deletion.cancelKeptTarget && deletion.cancelStatus.includes('canceled'), 'Canceling saved-lesson deletion changed local storage');
  check(deletion.afterDelete === deletion.before - 1 && deletion.removedTarget && deletion.retainedNeighbor && deletion.draftUnchanged, 'Confirmed deletion did not remove exactly one saved lesson while preserving its neighbor and current draft');

  await cdp.evaluate(`document.querySelector('#export-json').click()`);
  let downloadFiles = [];
  for (let attempt = 0; attempt < 20; attempt += 1) {
    downloadFiles = await readdir(downloads).catch(() => []);
    if (downloadFiles.some(name => name.endsWith('.json'))) break;
    await delay(100);
  }
  const jsonName = downloadFiles.find(name => name.endsWith('.json'));
  check(Boolean(jsonName), 'JSON export did not create a download');
  if (jsonName) {
    const exported = JSON.parse(await readFile(path.join(downloads, jsonName), 'utf8'));
    check(exported.schema === 'synalepha.lesson' && exported.schemaVersion === 1, 'Exported JSON schema is missing or unsupported');
  }

  const importResult = await cdp.evaluate(`(async () => {
    const title = document.querySelector('#lesson-title');
    const before = title.value;
    const input = document.querySelector('#import-json');
    const unsafe = JSON.parse(localStorage.getItem('synalepha-lesson-draft-v1'));
    unsafe.overrides.outcome = true;
    unsafe.overrideSignatures.outcome = 'not-a-signature';
    const transfer = new DataTransfer();
    transfer.items.add(new File([JSON.stringify(unsafe)], 'unsafe.json', {type: 'application/json'}));
    Object.defineProperty(input, 'files', {value: transfer.files, configurable: true});
    input.dispatchEvent(new Event('change', {bubbles: true}));
    await new Promise(resolve => setTimeout(resolve, 50));
    return {unchanged: title.value === before, status: document.querySelector('#global-status').textContent};
  })()`);
  check(importResult.unchanged && importResult.status.includes('failed safely'), 'Invalid JSON did not fail without changing the lesson');
  const validImport = await cdp.evaluate(`(async () => {
    const lesson = JSON.parse(localStorage.getItem('synalepha-lesson-draft-v1'));
    lesson.id = 'lesson-import-smoke';
    lesson.fields.title = 'Imported smoke lesson';
    const input = document.querySelector('#import-json');
    const transfer = new DataTransfer();
    transfer.items.add(new File([JSON.stringify(lesson)], 'lesson.json', {type: 'application/json'}));
    Object.defineProperty(input, 'files', {value: transfer.files, configurable: true});
    input.dispatchEvent(new Event('change', {bubbles: true}));
    await new Promise(resolve => setTimeout(resolve, 50));
    return {title: document.querySelector('#lesson-title').value, status: document.querySelector('#global-status').textContent, reviewVisible: !document.querySelector('[data-step-panel="5"]').hidden};
  })()`);
  check(validImport.title === 'Imported smoke lesson' && validImport.status.includes('imported') && validImport.reviewVisible, 'Valid portable JSON did not import into review');

  const deepLinks = [];
  for (const [id, title] of [
    ['ex-spanish-novice', 'El mejor plan para el tiempo'],
    ['ex-spanish-intermediate', 'Una historia que merece compartirse'],
    ['ex-french-novice', 'Une sortie selon la météo'],
    ['ex-french-intermediate', 'Quelle actualité partager ?']
  ]) {
    await cdp.send('Page.navigate', {url: `http://127.0.0.1:${serverPort}/create.html?exemplar=${id}`});
    await waitForReady(cdp);
    deepLinks.push(await cdp.evaluate(`({title: document.querySelector('#lesson-title').value, reviewVisible: !document.querySelector('[data-step-panel="5"]').hidden, status: document.querySelector('#global-status').textContent})`));
    check(deepLinks.at(-1).title === title && deepLinks.at(-1).reviewVisible && deepLinks.at(-1).status.includes('exemplar loaded'), `Direct exemplar query did not load ${id} into review`);
  }

  await cdp.send('Page.navigate', {url: `http://127.0.0.1:${serverPort}/resources.html`});
  await waitForReady(cdp);
  const resourceAction = await cdp.evaluate(`(() => { const link = document.querySelector('.resource-actions .button'); return {label: link.textContent, href: link.href}; })()`);
  check(resourceAction.label.includes('Use in Lesson Studio'), 'Resource primary action is missing');
  await cdp.send('Page.navigate', {url: resourceAction.href});
  await waitForReady(cdp);
  const handoff = await cdp.evaluate(`({title: document.querySelector('#source-title').value, language: document.querySelector('#language').value, step: document.querySelector('[aria-current="step"]').dataset.step})`);
  check(handoff.title === 'DidactiRed' && handoff.language === 'Spanish' && handoff.step === '0', 'Resource metadata did not carry into the Studio purpose-first workflow');

  await cdp.evaluate(`(() => { document.querySelector('#toggle-exemplars').click(); document.querySelector('[data-exemplar="ex-french-intermediate"]').click(); })()`);
  await cdp.send('Emulation.setDeviceMetricsOverride', {width: 320, height: 800, deviceScaleFactor: 1, mobile: true});
  const mobile = await cdp.evaluate(`({pageWidth: document.documentElement.scrollWidth, viewport: innerWidth})`);
  check(mobile.pageWidth <= 320 && mobile.viewport === 320, `Studio overflows the 320px viewport (${mobile.pageWidth}px)`);
  await cdp.send('Emulation.setEmulatedMedia', {media: 'print'});
  const print = await cdp.evaluate(`({review: getComputedStyle(document.querySelector('.review-step')).display, header: getComputedStyle(document.querySelector('body > header')).display, artifact: getComputedStyle(document.querySelector('.lesson-artifact')).display})`);
  check(print.review !== 'none' && print.header === 'none' && print.artifact !== 'none', 'Print mode does not isolate the coherent lesson artifact');

  check(exceptions.length === 0, `Browser reported runtime exceptions: ${exceptions.join('; ')}`);
} finally {
  if (cdp) cdp.close();
  server.kill('SIGTERM');
  browser.kill('SIGTERM');
  await delay(100);
  await rm(temporary, {recursive: true, force: true});
}

if (failures.length) {
  console.error(failures.map(failure => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log('PASS: exemplars/deep links → focus → fresh overrides → safe render → local save/remix/delete → JSON export/reject → resource handoff → 320px → print');
