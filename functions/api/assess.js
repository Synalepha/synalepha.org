const MAX_BODY_BYTES = 64 * 1024;
const MAX_RESPONSE_CHARS = 40000;
const MAX_CONTEXT_CHARS = 5000;

const STOPWORDS = {
  Spanish: new Set('a al algo como con de del el ella en es esta este la las lo los más muy no o para pero por que se si su sus un una y yo tú usted nosotros porque cuando'.split(' ')),
  French: new Set('à au aux avec ce ces comme dans de des du elle en est et il la le les mais ne nous on ou pour que qui se son sur un une vous parce quand'.split(' '))
};

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const words = value => normalize(value).match(/[a-zà-ÿœç']+/gi) || [];
const unique = values => [...new Set(values)];

function boundedText(value, name, max = MAX_CONTEXT_CHARS) {
  if (typeof value !== 'string') throw new Error(`${name} must be text.`);
  const clean = value.trim();
  if (clean.length > max) throw new Error(`${name} is too long.`);
  return clean;
}

function contextTerms(value) {
  const generic = new Set('learner learners student students response responses evidence outcome communication communicate accurate relevant clear clearly use uses using will can and the with from into pour avec dans les des une que qui del las los para con una que'.split(' '));
  return unique(words(value).filter(word => word.length > 3 && !generic.has(word))).slice(0, 30);
}

export function analyzeSubmission(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('The request must be an assessment object.');
  const language = payload.language;
  if (!['Spanish', 'French'].includes(language)) throw new Error('Choose Spanish or French.');
  const proficiency = boundedText(payload.proficiency || '', 'Proficiency', 40);
  const outcome = boundedText(payload.outcome || '', 'Outcome');
  const evidencePlan = boundedText(payload.evidencePlan || '', 'Evidence plan');
  const feedbackPlan = boundedText(payload.feedbackPlan || '', 'Feedback plan');
  const reassessmentPlan = boundedText(payload.reassessmentPlan || '', 'Reassessment plan');
  const responseText = boundedText(payload.responseText || '', 'Learner response', MAX_RESPONSE_CHARS);
  if (responseText.length < 10) throw new Error('The learner response needs at least 10 characters.');
  if (!Array.isArray(payload.rubric) || payload.rubric.length < 1 || payload.rubric.length > 5) throw new Error('Include one to five rubric criteria.');
  const rubric = payload.rubric.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`Rubric criterion ${index + 1} is malformed.`);
    return {
      prompt: boundedText(item.prompt || '', `Criterion ${index + 1} prompt`),
      extends: boundedText(item.extends || '', `Criterion ${index + 1} extends descriptor`),
      meets: boundedText(item.meets || '', `Criterion ${index + 1} meets descriptor`),
      developing: boundedText(item.developing || '', `Criterion ${index + 1} developing descriptor`),
      beginning: boundedText(item.beginning || '', `Criterion ${index + 1} beginning descriptor`)
    };
  });

  const tokens = words(responseText);
  const responseSet = new Set(tokens);
  const sentences = responseText.split(/[.!?]+/).map(item => item.trim()).filter(Boolean);
  const languageHits = tokens.filter(token => STOPWORDS[language].has(token)).length;
  const otherLanguage = language === 'Spanish' ? 'French' : 'Spanish';
  const otherHits = tokens.filter(token => STOPWORDS[otherLanguage].has(token)).length;
  const outcomeTerms = contextTerms(outcome);
  const matchedOutcomeTerms = outcomeTerms.filter(term => responseSet.has(normalize(term)));
  const evidenceMarkers = (responseText.match(/(?:\d|[“”«»"]|porque|por eso|según|muestra|indica|parce que|donc|selon|montre|indique)/gi) || []).length;
  const questionCount = (responseText.match(/\?/g) || []).length;
  const languageSignal = languageHits >= Math.max(2, otherHits + 1) ? 'consistent' : languageHits > otherHits ? 'partial' : 'uncertain';

  const criteria = rubric.map(item => {
    const terms = contextTerms(`${item.prompt} ${item.meets}`);
    const matchedTerms = terms.filter(term => responseSet.has(normalize(term)));
    return {
      prompt: item.prompt,
      status: matchedTerms.length >= Math.min(2, Math.max(1, Math.ceil(terms.length * .2))) ? 'evidence-found' : 'teacher-review',
      matchedTerms: matchedTerms.slice(0, 8),
      note: matchedTerms.length ? `The response contains ${matchedTerms.length} term${matchedTerms.length === 1 ? '' : 's'} connected to this criterion. Verify quality and context in the original work.` : 'No direct wording match was found. This is not proof that the criterion is unmet; inspect the response manually.'
    };
  });

  const strengths = [];
  if (tokens.length >= 40) strengths.push(`The response provides ${tokens.length} words of evidence to inspect.`);
  if (languageSignal === 'consistent') strengths.push(`Common-word signals are consistent with ${language}.`);
  if (matchedOutcomeTerms.length) strengths.push(`The response visibly connects to outcome language: ${matchedOutcomeTerms.slice(0, 5).join(', ')}.`);
  if (evidenceMarkers >= 2) strengths.push('The response includes multiple visible evidence/reasoning markers.');
  if (questionCount) strengths.push(`The response includes ${questionCount} question${questionCount === 1 ? '' : 's'}, a possible sign of interpersonal meaning-making.`);
  if (!strengths.length) strengths.push('A readable response was received and is ready for teacher review.');

  const nextSteps = [];
  if (languageSignal !== 'consistent') nextSteps.push(`Verify that the response demonstrates sustained ${language}; automated language signals were ${languageSignal}.`);
  if (outcomeTerms.length && matchedOutcomeTerms.length === 0) nextSteps.push('Check alignment to the intended outcome; no distinctive outcome terms appeared directly in the response.');
  if (evidenceMarkers < 2) nextSteps.push('Ask the learner to point to specific details or reasons if source-based evidence is part of the task.');
  if (tokens.length < 20) nextSteps.push('The response is brief; decide whether it supplies enough fresh evidence for the intended proficiency range and mode.');
  if (criteria.some(item => item.status === 'teacher-review')) nextSteps.push('Review the flagged rubric criteria manually; wording overlap cannot determine performance quality.');
  if (!nextSteps.length) nextSteps.push('Verify accuracy, comprehensibility, cultural context, and rubric level manually before sharing feedback.');

  return {
    schema: 'synalepha.assessment', schemaVersion: 1,
    analyzedAt: new Date().toISOString(), language, proficiency,
    summary: {wordCount: tokens.length, sentenceCount: sentences.length, languageSignal, outcomeTermsFound: matchedOutcomeTerms.length, outcomeTermsChecked: outcomeTerms.length, evidenceMarkerCount: evidenceMarkers, questionCount},
    criteria, strengths, nextSteps,
    draftFeedback: `${strengths[0]} ${nextSteps[0]}`,
    teacherPlans: {evidencePlan, feedbackPlan, reassessmentPlan},
    limits: 'Deterministic indicators only. Synalepha does not assign a grade or verify accuracy, proficiency, meaning, originality, accessibility, culture, or whether a rubric level is met. A teacher must inspect the original work and approve or revise all feedback.'
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});
}

export async function onRequestPost({request}) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) return json({ok: false, error: 'The request is larger than 64 KB.'}, 413);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ok: false, error: 'Send JSON with the application/json content type.'}, 415);
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ok: false, error: 'The request is larger than 64 KB.'}, 413);
    const result = analyzeSubmission(JSON.parse(raw));
    return json({ok: true, result});
  } catch (error) {
    return json({ok: false, error: error instanceof SyntaxError ? 'The request is not valid JSON.' : error.message}, 400);
  }
}

export function onRequest() {
  return json({ok: false, error: 'Method not allowed.'}, 405);
}
