import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {onRequestPost} from '../functions/api/assess.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'synalepha-assessment-'));
const port = 8138;
const debugPort = 9238;
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/api/assess' && req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const request = new Request(`http://127.0.0.1:${port}/api/assess`, {method:'POST', headers:{'content-type':req.headers['content-type'] || '', 'content-length':req.headers['content-length'] || ''}, body:Buffer.concat(chunks)});
      const response = await onRequestPost({request});
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const pathname = req.url === '/' ? '/index.html' : new URL(req.url, `http://127.0.0.1:${port}`).pathname;
    const target = path.resolve(root, `.${pathname}`);
    if (!target.startsWith(root)) throw new Error('unsafe path');
    const body = await readFile(target);
    res.writeHead(200, {'Content-Type':mime[path.extname(target)] || 'application/octet-stream'}); res.end(body);
  } catch (_) { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
const browser = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${path.join(temporary,'profile')}`,'about:blank'], {stdio:'ignore'});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function json(url, options) { for(let i=0;i<80;i++){try{const r=await fetch(url,options);if(r.ok)return r.json();}catch{}await delay(100);}throw new Error(`Timeout ${url}`); }
class Cdp { constructor(url){this.ws=new WebSocket(url);this.id=1;this.pending=new Map();this.ready=new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});this.ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&this.pending.has(m.id)){const p=this.pending.get(m.id);this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});} async send(method,params={}){await this.ready;const id=this.id++;const promise=new Promise((resolve,reject)=>this.pending.set(id,{resolve,reject}));this.ws.send(JSON.stringify({id,method,params}));return promise;} async eval(expression){const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value;} close(){this.ws.close();} }
let cdp;
try {
  await json(`http://127.0.0.1:${debugPort}/json/version`);
  const target = await json(`http://127.0.0.1:${debugPort}/json/new?http://127.0.0.1:${port}/assess.html`, {method:'PUT'});
  cdp = new Cdp(target.webSocketDebuggerUrl); await cdp.send('Runtime.enable');
  for(let i=0;i<80;i++){if(await cdp.eval('document.readyState === "complete"'))break;await delay(100);}
  const result = await cdp.eval(`(async()=>{const lesson={schema:'synalepha.lesson',schemaVersion:1,fields:{title:'Weather plan',language:'Spanish',proficiency:'Novice',outcome:'Learners recommend an activity using weather details.',evidencePlan:'Check details.',feedbackPlan:'One success and next step.',reassessmentPlan:'Try a new day.'},rubric:[{prompt:'Recommendation uses weather evidence.',extends:'Three details',meets:'Two details',developing:'One detail',beginning:'No evidence'}]};const input=document.querySelector('#lesson-file');const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(lesson)],'lesson.json',{type:'application/json'}));Object.defineProperty(input,'files',{value:dt.files,configurable:true});input.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,50));const responseInput=document.querySelector('#response-file');const responseTransfer=new DataTransfer();responseTransfer.items.add(new File(['Yo recomiendo caminar porque hace sol. También hay veinte grados, por eso es una buena idea.'],'response.txt',{type:'text/plain'}));Object.defineProperty(responseInput,'files',{value:responseTransfer.files,configurable:true});responseInput.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,50));const uploaded=document.querySelector('#response-text').value;document.querySelector('#assessment-form').requestSubmit();for(let i=0;i<80&&!document.querySelector('#assessment-results h2');i++)await new Promise(r=>setTimeout(r,50));return{loaded:document.querySelector('#rubric-summary').textContent,uploaded,result:document.querySelector('#assessment-results h2')?.textContent,status:document.querySelector('#assessment-status').textContent,criteria:document.querySelectorAll('.criterion-result').length,feedback:document.querySelector('#feedback-draft')?.value};})()`);
  if(!result.loaded.includes('1 rubric criterion')||!result.uploaded.includes('Yo recomiendo')||result.result!=='Teacher review report'||!result.status.includes('complete')||result.criteria!==1||!result.feedback) throw new Error(`Assessment E2E failed: ${JSON.stringify(result)}`);
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:320,height:800,deviceScaleFactor:1,mobile:true});
  const mobile = await cdp.eval(`({pageWidth:document.documentElement.scrollWidth,viewport:innerWidth})`);
  if(mobile.viewport !== 320 || mobile.pageWidth > 320) throw new Error(`Assessment mobile overflow: ${JSON.stringify(mobile)}`);
  console.log('PASS: lesson upload → rubric load → learner response → live backend analysis → rubric indicators → editable feedback');
} finally { if(cdp)cdp.close();browser.kill('SIGTERM');server.close();await delay(100);await rm(temporary,{recursive:true,force:true}); }
