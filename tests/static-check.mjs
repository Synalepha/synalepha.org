import {readFile, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = await readdir(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  check(/<!DOCTYPE html>/i.test(html), `${file}: missing HTML doctype`);
  check(/<html\b[^>]*lang="en"/i.test(html), `${file}: missing document language`);
  check(/<meta\s+name="viewport"/i.test(html), `${file}: missing viewport metadata`);
  check(/class="skip-link"/.test(html), `${file}: missing skip link`);
  check(/<main\b[^>]*id=/.test(html), `${file}: main landmark needs an id`);
  check(!/on(?:click|change|input|load)=/i.test(html), `${file}: inline event handler violates CSP`);
  for (const match of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|data:)/.test(target)) continue;
    check(files.includes(target), `${file}: missing internal target ${target}`);
  }
}

const create = await readFile(path.join(root, 'create.html'), 'utf8');
const tools = await readFile(path.join(root, 'tools.js'), 'utf8');
const resources = await readFile(path.join(root, 'resources.js'), 'utf8');
const styles = await readFile(path.join(root, 'styles.css'), 'utf8');
const home = await readFile(path.join(root, 'index.html'), 'utf8');
const spanish = await readFile(path.join(root, 'spanish.html'), 'utf8');
const french = await readFile(path.join(root, 'french.html'), 'utf8');
const assess = await readFile(path.join(root, 'assess.html'), 'utf8');
const toolDirectory = await readFile(path.join(root, 'tools.html'), 'utf8');
const languageDirectory = await readFile(path.join(root, 'languages.html'), 'utf8');
const assessment = await readFile(path.join(root, 'assessment.js'), 'utf8');
const headers = await readFile(path.join(root, '_headers'), 'utf8');
const logo = await readFile(path.join(root, 'logo-mark.svg'), 'utf8');
const favicon = await readFile(path.join(root, 'favicon.svg'), 'utf8');

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  check((html.match(/<img class="mark" src="logo-mark\.svg" alt="" width="40" height="40">/g) || []).length === 2, `${file}: header and footer must use the accessible brand logograph`);
  check(!/<span class="mark"[^>]*>S<\/span>/.test(html), `${file}: obsolete letter placeholder remains`);
}
check(/#174e4a/.test(logo) && /#c95340/.test(logo), 'Brand logograph must retain the approved teal and coral joining strokes');
check(/M211 225l121 151/.test(logo) && /M211 225l121 151/.test(favicon), 'Site mark and favicon must use the same alphabetic-synergy construction');

check((create.match(/data-step-panel=/g) || []).length === 6, 'Lesson Studio must have six workflow panels');
check(/Import JSON/.test(create) && /Export JSON/.test(create), 'Lesson Studio needs JSON import and export controls');
check(/Print \/ save PDF/.test(create), 'Lesson Studio needs one print/PDF artifact action');
check((tools.match(/id: 'ex-(?:spanish|french)-(?:novice|intermediate)'/g) || []).length === 4, 'Exactly four named language/range exemplars are required');
for (const id of ['ex-spanish-novice', 'ex-spanish-intermediate', 'ex-french-novice', 'ex-french-intermediate']) {
  check((await Promise.all(htmlFiles.map(file => readFile(path.join(root, file), 'utf8')))).some(html => html.includes(`create.html?exemplar=${id}`)), `Missing direct page link for exemplar ${id}`);
}
check(/schemaVersion: SCHEMA_VERSION/.test(tools) && /validateDocument/.test(tools), 'Versioned import validation is required');
check(/overrideSignatures/.test(tools) && /pruneStaleOverrides/.test(tools), 'Teacher overrides must be tied to the relevant lesson content');
check((create.match(/<h2 id="step-[^"]+-title" tabindex="-1">/g) || []).length === 6, 'Every step heading must be programmatically focusable');
check(/data-delete-id/.test(tools) && /window\.confirm/.test(tools), 'Saved lessons need a confirmed single-item Delete action');
for (const id of ['ex-spanish-novice', 'ex-spanish-intermediate', 'ex-french-novice', 'ex-french-intermediate']) {
  check(home.includes(`create.html?exemplar=${id}`), `Homepage is missing direct link for ${id}`);
  const languagePage = id.includes('spanish') ? spanish : french;
  check(languagePage.includes(`create.html?exemplar=${id}`), `Language page is missing direct link for ${id}`);
}
check(tools.includes(`replace(/[&<>"']/g`), 'Lesson preview content must be escaped');
check(!/contenteditable/i.test(create + tools), 'Rubric editing must use labelled form controls, not contenteditable cells');
check(!/fetch\(|XMLHttpRequest|WebSocket|EventSource/.test(tools), 'Lesson Studio must not make external requests');
check((resources.match(/title: '/g) || []).length === 12, 'Resource catalog should contain 12 reviewed entries');
check(/Use in Lesson Studio/.test(resources), 'Resource cards must connect to Lesson Studio');
check(/@media \(max-width: 480px\)/.test(styles), 'A narrow responsive breakpoint is required');
check(/prefers-reduced-motion/.test(styles), 'Reduced-motion styles are required');
check(/@media print/.test(styles), 'Print styles are required');
check(/id="lesson-file"/.test(assess) && /id="response-file"/.test(assess) && /id="response-text"/.test(assess), 'Assessment Review needs lesson and learner-response ingestion');
check(/fetch\('\/api\/assess'/.test(assessment), 'Assessment Review must call the same-origin assessment endpoint');
check(/PDF, DOCX, image, audio, and video are rejected/.test(assess), 'Unsupported assessment formats must be disclosed');
check(/connect-src 'self'/.test(headers), 'CSP must allow only the same-origin assessment request');
for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  check(html.includes('assess.html'), `${file}: navigation or content does not expose Assessment Review`);
  check(html.includes('tools.html') && html.includes('languages.html'), `${file}: global navigation must expose Tools and Languages directories`);
}
for (const href of ['create.html', 'resources.html', 'assess.html']) check(toolDirectory.includes(`href="${href}"`), `Tools directory is missing ${href}`);
for (const href of ['spanish.html', 'french.html', 'resources.html?language=Spanish', 'resources.html?language=French']) check(languageDirectory.includes(`href="${href}"`), `Languages directory is missing ${href}`);
check(/Spanish tools/.test(spanish) && /create\.html\?exemplar=ex-spanish-novice/.test(spanish) && /resources\.html\?language=Spanish/.test(spanish), 'Spanish hub must organize entry points by tool');
check(/French tools/.test(french) && /create\.html\?exemplar=ex-french-novice/.test(french) && /resources\.html\?language=French/.test(french), 'French hub must organize entry points by tool');

if (failures.length) {
  console.error(failures.map(failure => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log(`PASS: ${htmlFiles.length} HTML files, Studio structure, resources, security patterns, responsive and print checks`);
