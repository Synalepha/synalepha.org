import assert from 'node:assert/strict';
import {analyzeSubmission, onRequest, onRequestPost} from '../functions/api/assess.js';

const valid = {
  language: 'Spanish', proficiency: 'Novice',
  outcome: 'Learners recommend an activity using two accurate weather details.',
  evidencePlan: 'Listen for a recommendation and weather details.',
  feedbackPlan: 'Name one success and one next step.',
  reassessmentPlan: 'Recommend a new plan for another day.',
  rubric: [{prompt: 'Recommendation uses accurate weather evidence.', extends: 'Three details', meets: 'Two details', developing: 'One detail', beginning: 'No supported recommendation'}],
  responseText: 'Yo recomiendo el parque porque hace sol. También hace veinte grados, por eso podemos caminar. ¿Qué prefieres tú?'
};

const analysis = analyzeSubmission(valid);
assert.equal(analysis.schema, 'synalepha.assessment');
assert.equal(analysis.language, 'Spanish');
assert.ok(analysis.summary.wordCount > 10);
assert.ok(analysis.summary.evidenceMarkerCount >= 2);
assert.equal(analysis.criteria.length, 1);
assert.match(analysis.limits, /does not assign a grade/);

const request = new Request('https://synalepha.org/api/assess', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(valid)});
const response = await onRequestPost({request});
assert.equal(response.status, 200);
assert.equal(response.headers.get('cache-control'), 'no-store');
assert.equal((await response.json()).ok, true);

const malformed = await onRequestPost({request: new Request('https://synalepha.org/api/assess', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{bad'})});
assert.equal(malformed.status, 400);

const wrongType = await onRequestPost({request: new Request('https://synalepha.org/api/assess', {method: 'POST', headers: {'Content-Type': 'text/plain'}, body: 'hello'})});
assert.equal(wrongType.status, 415);

const oversized = {...valid, responseText: 'x'.repeat(40001)};
const rejected = await onRequestPost({request: new Request('https://synalepha.org/api/assess', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(oversized)})});
assert.equal(rejected.status, 400);

assert.equal(onRequest().status, 405);
console.log('PASS: assessment analysis, response contract, no-store, malformed/type/size rejection, and method guard');
