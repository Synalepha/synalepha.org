(function () {
  'use strict';

  const form = document.querySelector('#lesson-form');
  if (!form) return;

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = 'synalepha-lesson-studio-v1';
  const DRAFT_KEY = 'synalepha-lesson-draft-v1';
  const MAX_FILE_BYTES = 1024 * 1024;
  const FIELD_NAMES = [
    'title', 'language', 'proficiency', 'learners', 'duration', 'context', 'outcome',
    'sourceTitle', 'sourcePublisher', 'sourceType', 'sourceUrl', 'sourceRegion', 'sourceDate',
    'sourceAccess', 'sourceLicense', 'inputPathway', 'inputPurpose', 'inputTask',
    'comprehensionSupports', 'formMeaning', 'referentialItems', 'affectiveItems',
    'communicativePurpose', 'interpersonalTask', 'presentationalTask', 'differentiation',
    'evidencePlan', 'behaviorNote', 'feedbackPlan', 'reassessmentPlan'
  ];
  const ENUMS = {
    language: ['', 'Spanish', 'French'],
    proficiency: ['', 'Novice', 'Intermediate'],
    sourceType: ['', 'Audio', 'Video', 'Text', 'Image / infographic', 'Mixed media', 'Teacher-created input'],
    inputPathway: ['', 'Interpretive', 'Structured input']
  };
  const OVERRIDE_IDS = new Set(['outcome', 'regional-context', 'access-license', 'comprehensibility', 'meaning-focus', 'forced-production', 'purpose', 'alignment', 'learner-fit', 'formative-evidence', 'evidence-alignment', 'achievement-separate']);
  const STOP_WORDS = new Set('a an and are as at be by can de des do el en et for from in is la le les los of on or para por que the to un una use using will with y'.split(' '));

  const exemplars = [
    {
      id: 'ex-spanish-novice', title: 'El mejor plan para el tiempo', language: 'Spanish', proficiency: 'Novice', learners: 'Novice Mid learners; familiar with common weather, clothing, and activity words', duration: '50 minutes',
      context: 'Friends are choosing an outdoor plan for tomorrow and need to account for the forecast.',
      outcome: 'Learners will recommend one of three familiar activities for tomorrow and give two forecast-based reasons to a partner.',
      sourceTitle: 'Predicción por municipios (teacher selects one current local forecast)', sourcePublisher: 'AEMET, Agencia Estatal de Meteorología', sourceType: 'Mixed media', sourceUrl: 'https://www.aemet.es/es/eltiempo/prediccion/municipios', sourceRegion: 'Spain; national weather agency pages for specific municipalities and a general public audience', sourceDate: 'Teacher checks the forecast and page immediately before the lesson',
      sourceAccess: 'The teacher provides a cropped, high-contrast plain-text summary of only the needed day alongside the live page; icons receive text labels. Learners may reread and use a short weather glossary. Verify the current page with the class.',
      sourceLicense: 'Public web access; source terms apply. Link to or project the source and create a teacher-authored summary instead of redistributing the page.',
      inputPathway: 'Structured input', inputPurpose: 'Learners need to understand forecast details in order to decide which activity fits tomorrow.',
      inputTask: 'Read the forecast once for the general weather. Read again and match each statement to mañana or another day. Then select which of three pictured plans is compatible and point to two details in the forecast that support the choice.',
      comprehensionSupports: 'Limit the display to one municipality and two days; pair weather icons with text; preview the place and task, not every word; allow rereading; provide an optional glossary for essential weather terms.',
      formMeaning: 'Present-time weather statements versus the future time reference supplied by mañana and the forecast heading', referentialItems: '¿Hace sol mañana: sí o no?\n¿La temperatura máxima es más o menos de 20 °C?\n¿Qué plan corresponde al pronóstico: parque, cine o piscina?', affectiveItems: '¿Qué tiempo prefieres para un día libre?\n¿Cuál plan te interesa más?',
      communicativePurpose: 'Partners have different activity cards and must agree on one plan for a visiting friend. Each partner needs the other person’s preference and forecast evidence.',
      interpersonalTask: 'Each partner recommends a plan, asks what the other prefers, and gives two short reasons from the forecast. Partners ask one follow-up question and agree on one option.', presentationalTask: '',
      differentiation: 'Offer weather-word cards, icons, and optional frames such as “Recomiendo ___ porque ___.” Allow pointing to the forecast while speaking and rehearsal before the exchange. Extension: compare with a second municipality.',
      evidencePlan: 'Listen for a clear recommendation plus two details that match the forecast. If either detail is unsupported, return learners to the relevant forecast line; if both are supported, ask for a follow-up question or second option.',
      behaviorNote: 'Record preparation or turn-taking separately from evidence of the communication outcome.', feedbackPlan: 'Name one forecast detail the learner used successfully, then identify one missing or unclear connection and offer a single revision prompt.', reassessmentPlan: 'After rereading and partner rehearsal, the learner recommends a plan for a different day in the same forecast and gives two fresh reasons.',
      rubric: [
        {prompt: 'Recommendation and fit: the selected plan is clear and supported by forecast information.', extends: 'Names a plan and connects three accurate forecast details to why it fits.', meets: 'Names a plan and connects two accurate forecast details to why it fits.', developing: 'Names a plan and gives one accurate forecast detail, or the connection is partly clear.', beginning: 'A plan or forecast detail is present, but the recommendation cannot yet be followed.'},
        {prompt: 'Comprehensibility: the partner can follow the recommendation and reasons.', extends: 'The partner follows the recommendation, reasons, and an unplanned follow-up without teacher interpretation.', meets: 'The partner follows the recommendation and two reasons; repetition may be requested.', developing: 'The partner follows the main choice but needs repetition, pointing, or clarification for reasons.', beginning: 'The partner cannot yet identify the choice without teacher interpretation.'}
      ]
    },
    {
      id: 'ex-spanish-intermediate', title: 'Una historia que merece compartirse', language: 'Spanish', proficiency: 'Intermediate', learners: 'Intermediate learners able to narrate connected events and support opinions', duration: 'Two 55-minute periods',
      context: 'A class listening committee is selecting one Spanish-language story to recommend to another class.', outcome: 'Learners will compare two community stories, negotiate a choice, and present a recommendation supported by accurate details and regional context.',
      sourceTitle: 'Radio Ambulante episode pages (teacher selects two appropriate excerpts)', sourcePublisher: 'Radio Ambulante Studios', sourceType: 'Audio', sourceUrl: 'https://radioambulante.org/', sourceRegion: 'Latin America and Latin American diaspora; each episode has its own location, speakers, and reporting context that the teacher records', sourceDate: 'Teacher records the dates of the selected episodes and checks access before teaching',
      sourceAccess: 'Episode pages generally offer Spanish transcripts; verify the exact selected pages. Provide excerpt timestamps, a transcript in readable chunks, playback control, and a text-only comparison organizer.', sourceLicense: 'Free public access; source terms and copyright apply. Link to the episodes and use short classroom excerpts as permitted; do not redistribute full audio or transcripts.',
      inputPathway: 'Interpretive', inputPurpose: 'Learners need the central tension, perspectives, and regional context from each excerpt to select a story for a real audience.', inputTask: 'For each excerpt, identify the central situation, sequence three key events, and record one detail that reveals place or community perspective. Compare the two stories and mark which would be more engaging and understandable for the partner class, citing evidence.', comprehensionSupports: 'Introduce the location and people without revealing the story outcome; provide timestamps, chunked transcripts, replay choice, a small essential-word bank, and time to compare notes after individual listening.', formMeaning: '', referentialItems: '', affectiveItems: '',
      communicativePurpose: 'Committee partners heard overlapping but not identical excerpts. They must exchange missing evidence, question each other’s reasoning, and choose one story for a specific partner class.', interpersonalTask: 'Partners summarize their assigned evidence, ask follow-up questions, challenge one unsupported claim, and negotiate a shared choice using agreed audience needs.', presentationalTask: 'Pairs record or deliver a two-minute recommendation to the partner class naming the story, explaining its community context, and supporting the choice with at least three accurate details.', differentiation: 'Offer transcript/audio choice after the first listen, role cards for facilitator and evidence checker, and planning frames for comparison. Extension: acknowledge a limitation or competing reason for the other choice.',
      evidencePlan: 'Collect comparison organizers and listen to negotiations for accurate source details, attention to regional context, and response to a partner. Misattributed details trigger transcript verification; strong evidence triggers a counterargument prompt.', behaviorNote: 'Track deadlines and role fulfillment separately; neither changes the achievement descriptors.', feedbackPlan: 'Return one note on evidence accuracy and one on how clearly the reasoning reaches the audience, each tied to a quoted or time-stamped moment.', reassessmentPlan: 'Learners revise the recommendation after source verification or present a new recommendation using a different excerpt and the same criteria.',
      rubric: [
        {prompt: 'Source-based reasoning: the recommendation uses accurate, relevant evidence from both excerpts.', extends: 'Integrates four or more accurate details from both excerpts and addresses a competing reason.', meets: 'Uses at least three accurate details across both excerpts to support the choice.', developing: 'Uses one or two accurate details, or some evidence is not clearly connected to the choice.', beginning: 'Makes a choice, but supporting details are absent or cannot be verified in the excerpts.'},
        {prompt: 'Regional and community context: the presentation situates the selected story without generalizing one experience.', extends: 'Accurately situates people, place, and perspective and explains why that context matters to the story.', meets: 'Accurately names the relevant place or community context and connects it to the story.', developing: 'Names a place or community, but the connection is vague or partly inaccurate.', beginning: 'Context is absent or presented as a generalization about a whole region.'},
        {prompt: 'Interaction and audience clarity: ideas respond to a partner and the final recommendation is followable.', extends: 'Builds on and questions partner ideas, then delivers a cohesive recommendation tailored to the audience.', meets: 'Responds to partner ideas and delivers a clear recommendation for the named audience.', developing: 'Exchanges ideas, but follow-up or audience connection is inconsistent.', beginning: 'Shares isolated ideas without yet responding to the partner or establishing a clear recommendation.'}
      ]
    },
    {
      id: 'ex-french-novice', title: 'Une sortie selon la météo', language: 'French', proficiency: 'Novice', learners: 'Novice Mid learners; familiar with days, common conditions, clothing, and leisure activities', duration: '50 minutes',
      context: 'Two exchange partners in Montréal need to choose a simple weekend outing that fits the forecast.', outcome: 'Learners will agree on one weekend activity and communicate two simple reasons based on a Montréal forecast.',
      sourceTitle: 'Prévisions locales — Montréal (teacher selects the current page)', sourcePublisher: 'Environnement et Changement climatique Canada', sourceType: 'Mixed media', sourceUrl: 'https://meteo.gc.ca/fr/location/index.html?coords=45.501,-73.568', sourceRegion: 'Montréal, Québec, Canada; federal public weather information in French', sourceDate: 'Teacher checks the forecast and page immediately before the lesson',
      sourceAccess: 'Verify the current page. Provide a teacher-authored plain-text extract for the two relevant days, text labels for weather symbols, a short glossary, and rereading choice.', sourceLicense: 'Public web access; source terms apply. Link to or project the page; use a teacher-authored summary instead of claiming permission to redistribute the source.',
      inputPathway: 'Structured input', inputPurpose: 'Learners need the day, conditions, and temperatures in order to rule out unsuitable activities and select one outing.', inputTask: 'Scan for samedi and dimanche. Match four forecast statements to the correct day, then select which activity card fits each day. Verify choices by underlining or pointing to the relevant weather information.', comprehensionSupports: 'Show only the two needed days; pair symbols and text; preview Montréal and the decision, not every word; allow rereading; provide optional cognate and weather-word support.', formMeaning: 'Day labels and weather expressions indicate when and under what conditions an activity is possible', referentialItems: 'Quel jour est plus chaud : samedi ou dimanche ?\nEst-ce qu’il pleut samedi : oui ou non ?\nQuelle activité correspond : le parc, le musée ou le patinage ?', affectiveItems: 'Quel temps préfères-tu ?\nQuelle activité est intéressante pour toi ?',
      communicativePurpose: 'Partners have different preference cards and must choose one outing together. Each needs to learn the other person’s preference and weather-based reason.', interpersonalTask: 'Partners propose an activity, give two brief forecast-based reasons, ask which option the other prefers, and agree on one outing.', presentationalTask: '', differentiation: 'Provide symbol cards, choice boards, and optional frames such as “Je propose ___ parce que ___.” Permit pointing to the forecast and rehearsal. Extension: propose a backup for the other day.',
      evidencePlan: 'Use a brief checklist: understandable proposal, two accurate forecast details, and a response to the partner. An inaccurate detail leads to rereading the line; complete evidence leads to a backup-plan prompt.', behaviorNote: 'Note preparation or partner routines separately from achievement.', feedbackPlan: 'Identify one accurate source connection and one next step for making a reason clearer to the partner.', reassessmentPlan: 'After targeted rereading and rehearsal, the learner proposes an activity for the other day with two new forecast details.',
      rubric: [
        {prompt: 'Proposal and evidence: the activity choice connects to accurate forecast details.', extends: 'Proposes an activity, supports it with three accurate details, and offers a fitting backup.', meets: 'Proposes an activity and supports it with two accurate forecast details.', developing: 'Proposes an activity with one accurate detail, or one connection is unclear.', beginning: 'An activity or weather word is present, but the fit cannot yet be determined.'},
        {prompt: 'Comprehensibility and response: the partner can follow the proposal and receive a relevant reply.', extends: 'The partner follows the proposal, reasons, and an unplanned reply without teacher interpretation.', meets: 'The partner follows the proposal and reasons and receives a relevant response.', developing: 'The main proposal is followable, but reasons or response require repetition, pointing, or clarification.', beginning: 'The partner cannot yet identify the proposal without teacher interpretation.'}
      ]
    },
    {
      id: 'ex-french-intermediate', title: 'Quelle actualité partager ?', language: 'French', proficiency: 'Intermediate', learners: 'Intermediate learners able to summarize connected ideas and exchange supported opinions', duration: 'Two 55-minute periods',
      context: 'Learners curate one international news item in accessible French for a class listening guide.', outcome: 'Learners will compare two news reports, negotiate which one to feature, and create an audience-aware introduction supported by accurate details and source context.',
      sourceTitle: 'Journal en français facile (teacher selects two current reports)', sourcePublisher: 'RFI Français facile, Radio France Internationale', sourceType: 'Audio', sourceUrl: 'https://francaisfacile.rfi.fr/fr/podcasts/journal-en-fran%C3%A7ais-facile/', sourceRegion: 'International news from a France-based public broadcaster; record the locations and voices represented in each selected report', sourceDate: 'Teacher records episode date and checks transcript/audio availability before teaching',
      sourceAccess: 'The collection provides audio with transcript-based learning support; verify each selected item. Provide timestamps, chunked text, playback control, and a readable text-only organizer.', sourceLicense: 'Free public access; source terms and copyright apply. Link to the report and avoid redistributing full audio or transcripts unless the source grants permission.',
      inputPathway: 'Interpretive', inputPurpose: 'Learners need the main event, affected people, location, and significance of each report in order to choose one for classmates.', inputTask: 'Listen for the main event, then use the transcript to verify who, where, when, and why it matters. Record two supporting details and distinguish a reporter statement from a quoted perspective. Compare both reports against class interest and clarity criteria.', comprehensionSupports: 'Preview essential geopolitical context without summarizing the report; provide timestamps, optional transcript after initial listening, replay control, a small essential-word bank, and a who/where/what organizer.', formMeaning: '', referentialItems: '', affectiveItems: '',
      communicativePurpose: 'Partners reviewed different reports and must fill information gaps, evaluate audience fit, and agree on one item for classmates who have not heard either report.', interpersonalTask: 'Partners summarize assigned reports, ask for missing details, verify one another’s claims in the text, and negotiate one selection using the audience criteria.', presentationalTask: 'Pairs create a 90-second spoken or written introduction naming RFI and the report date, situating the event, previewing three accurate details without giving every answer, and explaining why classmates should listen.', differentiation: 'Allow audio-plus-transcript or transcript-first after a common initial listen, give role cards for source checker and audience advocate, and offer summary frames. Extension: identify a missing perspective or limitation in the report.',
      evidencePlan: 'Review organizers and conferences for accurate event details, attribution, source context, and audience reasoning. Unsupported claims trigger transcript verification; secure evidence triggers a missing-perspective prompt.', behaviorNote: 'Report collaboration routines and completion separately from communicative achievement.', feedbackPlan: 'Mark one accurately attributed detail and one place where the audience needs clearer context; learners revise only those high-leverage points first.', reassessmentPlan: 'After verification and practice, learners revise the introduction or produce one for a fresh report using the same evidence prompts.',
      rubric: [
        {prompt: 'Accuracy and attribution: the introduction represents the report and its speakers accurately.', extends: 'Integrates four or more accurate details, distinguishes reported and quoted perspectives, and notes a source limitation.', meets: 'Includes at least three accurate details and identifies the report source and relevant perspective.', developing: 'Includes one or two accurate details, or attribution is incomplete or partly unclear.', beginning: 'Details cannot yet be verified in the report or source attribution is absent.'},
        {prompt: 'Context and significance: listeners can understand where the event occurs and why it matters.', extends: 'Connects precise event context, affected people, and significance without overgeneralizing.', meets: 'Accurately explains location, affected people, and why the event matters.', developing: 'Provides some context, but place, people, or significance remains vague.', beginning: 'Presents an isolated event with too little context for the audience to follow.'},
        {prompt: 'Audience-aware communication: the product is organized and invites classmates into the report.', extends: 'Organizes a concise, cohesive preview and anticipates what this audience needs or may misunderstand.', meets: 'Provides a clear, organized preview tailored to classmates.', developing: 'The main idea is followable, but organization or audience connection is uneven.', beginning: 'Ideas remain isolated, so the audience cannot yet identify the report’s focus or purpose.'}
      ]
    }
  ];

  const state = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    overrides: {},
    overrideSignatures: {},
    rubric: defaultRubric(),
    step: 0,
    maxVisited: 0,
    dirty: false
  };

  const panels = [...document.querySelectorAll('[data-step-panel]')];
  const stepButtons = [...document.querySelectorAll('[data-step]')];
  const previousButton = document.querySelector('#previous-step');
  const nextButton = document.querySelector('#next-step');
  const errorBox = document.querySelector('#form-error');
  const statusBox = document.querySelector('#global-status');
  const rubricContainer = document.querySelector('#rubric-rows');
  const artifact = document.querySelector('#lesson-artifact');
  const guidanceList = document.querySelector('#guidance-list');

  function makeId() {
    return 'lesson-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function defaultRubric() {
    return [
      {prompt: 'Outcome evidence: what observable feature shows that the learner accomplished the communication outcome?', extends: '', meets: '', developing: '', beginning: ''},
      {prompt: 'Comprehensibility and audience: what can the intended listener, reader, or viewer follow?', extends: '', meets: '', developing: '', beginning: ''}
    ];
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  }

  function plain(value) {
    return String(value == null ? '' : value).trim();
  }

  function formValues() {
    const raw = Object.fromEntries(new FormData(form));
    const data = {};
    FIELD_NAMES.forEach(name => { data[name] = typeof raw[name] === 'string' ? raw[name] : ''; });
    return data;
  }

  function lessonDocument() {
    const fields = formValues();
    return {
      schema: 'synalepha.lesson',
      schemaVersion: SCHEMA_VERSION,
      id: state.id,
      createdAt: state.createdAt,
      updatedAt: new Date().toISOString(),
      fields,
      rubric: readRubric(),
      overrides: {...state.overrides},
      overrideSignatures: {...state.overrideSignatures}
    };
  }

  function addRubricRow(item) {
    if (rubricContainer.children.length >= 5) return;
    const fragment = document.querySelector('#rubric-row-template').content.cloneNode(true);
    const row = fragment.querySelector('.rubric-row');
    Object.entries(item || {}).forEach(([key, value]) => {
      const input = row.querySelector(`[data-rubric="${key}"]`);
      if (input) input.value = plain(value);
    });
    row.querySelector('.remove-criterion').addEventListener('click', () => {
      if (rubricContainer.children.length <= 1) {
        announce('Keep at least one achievement criterion.');
        return;
      }
      row.remove();
      renumberRubric();
      updateAll();
    });
    rubricContainer.appendChild(fragment);
    renumberRubric();
  }

  function renumberRubric() {
    [...rubricContainer.children].forEach((row, index) => {
      row.querySelector('.criterion-number').textContent = String(index + 1);
      row.querySelectorAll('[data-rubric]').forEach(input => {
        const key = input.dataset.rubric;
        input.name = `rubric-${index}-${key}`;
        const label = input.closest('label');
        if (label) input.setAttribute('aria-label', `Criterion ${index + 1}: ${label.firstChild.textContent.trim()}`);
      });
      row.querySelector('.remove-criterion').hidden = rubricContainer.children.length <= 1;
    });
  }

  function readRubric() {
    return [...rubricContainer.querySelectorAll('.rubric-row')].map(row => {
      const item = {};
      row.querySelectorAll('[data-rubric]').forEach(input => { item[input.dataset.rubric] = plain(input.value); });
      return item;
    });
  }

  function writeRubric(items) {
    rubricContainer.replaceChildren();
    (items && items.length ? items : defaultRubric()).slice(0, 5).forEach(addRubricRow);
  }

  function setFormFields(fields) {
    FIELD_NAMES.forEach(name => {
      const controls = form.elements[name];
      if (!controls) return;
      const value = plain(fields[name]);
      if (controls instanceof RadioNodeList) {
        [...controls].forEach(control => { control.checked = control.value === value; });
      } else {
        controls.value = value;
      }
    });
  }

  function loadDocument(doc, message, visitReview) {
    setFormFields(doc.fields);
    writeRubric(doc.rubric);
    state.id = doc.id || makeId();
    state.createdAt = doc.createdAt || new Date().toISOString();
    state.overrides = {...(doc.overrides || {})};
    state.overrideSignatures = {...(doc.overrideSignatures || {})};
    const clearedOverrides = pruneStaleOverrides();
    state.dirty = false;
    state.maxVisited = visitReview ? 5 : 0;
    showStep(visitReview ? 5 : 0, true);
    updateAll();
    announce(clearedOverrides.length ? `${message} ${clearedOverrides.length === 1 ? 'One teacher override needs' : 'Some teacher overrides need'} reconfirmation because related lesson content changed or the saved confirmation was missing.` : message);
  }

  function showStep(index, force) {
    const target = Math.max(0, Math.min(5, index));
    if (!force && target > state.maxVisited + 1) {
      announce('Complete the current step before jumping ahead.');
      return;
    }
    state.step = target;
    state.maxVisited = Math.max(state.maxVisited, target);
    panels.forEach((panel, i) => { panel.hidden = i !== target; });
    stepButtons.forEach((button, i) => {
      if (i === target) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      button.disabled = i > state.maxVisited + 1;
    });
    document.querySelector('#progress-bar').style.width = `${((target + 1) / 6) * 100}%`;
    document.querySelector('#step-summary').textContent = `Step ${target + 1} of 6`;
    previousButton.hidden = target === 0;
    nextButton.hidden = target === 5;
    const nextLabels = ['Continue to source', 'Continue to input task', 'Continue to communication', 'Continue to evidence', 'Review lesson'];
    nextButton.textContent = nextLabels[target] || 'Continue';
    errorBox.textContent = '';
    renderGuidance();
    renderArtifact();
  }

  function validateStep(index) {
    const panel = panels[index];
    const invalid = [...panel.querySelectorAll('input, select, textarea')].find(control => !control.checkValidity());
    if (invalid) {
      errorBox.textContent = invalid.validity.valueMissing ? 'Complete each required field before continuing.' : 'Review the highlighted field and enter a valid value.';
      invalid.focus();
      return false;
    }
    if (index === 3 && !plain(form.elements.interpersonalTask.value) && !plain(form.elements.presentationalTask.value)) {
      errorBox.textContent = 'Add an interpersonal task, a presentational task, or both.';
      form.elements.interpersonalTask.focus();
      return false;
    }
    if (index === 4) {
      const incomplete = [...rubricContainer.querySelectorAll('[data-rubric]')].find(input => !plain(input.value));
      if (incomplete) {
        errorBox.textContent = 'Complete the evidence prompt and all descriptors for each achievement criterion.';
        incomplete.focus();
        return false;
      }
    }
    errorBox.textContent = '';
    return true;
  }

  function tokens(value) {
    return new Set(plain(value).toLowerCase().replace(/[^a-záéíóúüñàâçéèêëîïôùûüœ'-]+/g, ' ').split(/\s+/).filter(word => word.length > 3 && !STOP_WORDS.has(word)));
  }

  function overlap(a, b) {
    const aTokens = tokens(a);
    const bTokens = tokens(b);
    return [...aTokens].some(token => bTokens.has(token));
  }

  function includesAny(value, patterns) {
    const text = plain(value).toLowerCase();
    return patterns.some(pattern => text.includes(pattern));
  }

  function ruleSignature(id, values) {
    const source = JSON.stringify([id, ...values.map(plain)]);
    let hash = 2166136261;
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function allGuidanceRules() {
    const d = formValues();
    const rubric = readRubric();
    const communication = `${d.communicativePurpose} ${d.interpersonalTask} ${d.presentationalTask}`;
    const evidence = `${d.evidencePlan} ${rubric.map(item => item.prompt).join(' ')}`;
    const rules = [
      {id: 'outcome', values: [d.outcome], step: 0, label: 'Outcome names communication', warn: plain(d.outcome) && includesAny(d.outcome, ['grammar', 'conjugat', 'vocabulary worksheet', 'complete the worksheet']), explanation: 'The outcome appears to name language content or an activity. Consider naming what learners will communicate and for whom.'},
      {id: 'regional-context', values: [d.sourceTitle, d.sourceRegion], step: 1, label: 'Regional/source context is visible', warn: plain(d.sourceTitle) && plain(d.sourceRegion).length < 20, explanation: 'Add enough context to identify the source community, creator, place, or intended audience. A country label alone may not be enough.'},
      {id: 'access-license', values: [d.sourceTitle, d.sourceAccess, d.sourceLicense], step: 1, label: 'Access and licensing are planned', warn: plain(d.sourceTitle) && (plain(d.sourceAccess).length < 25 || plain(d.sourceLicense).length < 20), explanation: 'Record verified access features, teacher-provided alternatives, and either the published license or a conservative “source terms apply” plan.'},
      {id: 'comprehensibility', values: [d.inputTask, d.comprehensionSupports], step: 2, label: 'Comprehensibility supports are concrete', warn: plain(d.inputTask) && !includesAny(d.comprehensionSupports, ['visual', 'image', 'icon', 'gloss', 'transcript', 'caption', 'chunk', 'replay', 'reread', 'repeat', 'plain-text', 'plain text', 'choice', 'context']), explanation: 'Name at least one concrete way learners can access meaning, such as visuals, chunking, replay/rereading, a transcript, essential context, or a plain-text alternative.'},
      {id: 'meaning-focus', values: [d.inputTask], step: 2, label: 'Input processing stays meaning-focused', warn: plain(d.inputTask) && !includesAny(d.inputTask, ['identify', 'match', 'select', 'choose', 'rank', 'sequence', 'infer', 'verify', 'compare', 'decide', 'understand', 'find', 'underline', 'point', 'listen', 'read', 'identif', 'assoc', 'chois', 'class', 'compar', 'decid', 'écout', 'lis']), explanation: 'The input directions do not clearly ask learners to process message meaning. Consider an observable choice such as identify, match, select, sequence, infer, or verify.'},
      {id: 'forced-production', values: [d.inputPathway, d.inputTask], step: 2, label: 'Structured input avoids forced production', warn: d.inputPathway === 'Structured input' && includesAny(d.inputTask, ['conjugat', 'write a', 'write the', 'say the', 'produce', 'create a', 'fill in the verb', 'écris', 'écrivez', 'conjugue', 'escribe', 'conjuga']), explanation: 'These directions may require learners to produce the target form during input processing. Keep referential items receptive; move original speaking or writing to the communication step.'},
      {id: 'purpose', values: [d.communicativePurpose, d.interpersonalTask, d.presentationalTask], step: 3, label: 'Communication has an audience and purpose', warn: plain(communication) && plain(d.communicativePurpose).length < 35, explanation: 'Clarify who needs to communicate, why the exchange or product matters, and what information the audience or partner needs.'},
      {id: 'alignment', values: [d.outcome, d.communicativePurpose, d.interpersonalTask, d.presentationalTask], step: 3, label: 'Outcome and communication task connect', warn: plain(d.outcome) && plain(communication) && !overlap(d.outcome, communication), explanation: 'The outcome and communication task share no visible key terms. Reuse the central action, content, or audience language so the intended alignment is easy to see.'},
      {id: 'learner-fit', values: [d.proficiency, d.communicativePurpose, d.interpersonalTask, d.presentationalTask], step: 3, label: 'Demand appears plausible for the learner range', warn: d.proficiency === 'Novice' && includesAny(communication, ['debate', 'defend a complex', 'extended essay', 'analyze multiple perspectives', 'analyse multiple', 'débat', 'ensayo extenso']), explanation: 'This wording suggests extended or abstract performance that may exceed a Novice range without substantial support. Simplify the language demand, not the communicative purpose, or keep the plan with an override.'},
      {id: 'formative-evidence', values: [d.evidencePlan], step: 4, label: 'Evidence changes the next move', warn: plain(d.evidencePlan) && !includesAny(d.evidencePlan, ['if ', 'trigger', 'reteach', 'practice', 'extension', 'next', 'revise', 'reread', 'verify', 'return', 'si ', 'alors']), explanation: 'State what evidence will trigger a specific next move—such as source verification, reteaching, more practice, revision, or extension.'},
      {id: 'evidence-alignment', values: [d.outcome, d.evidencePlan, ...rubric.map(item => item.prompt)], step: 4, label: 'Evidence traces back to the outcome', warn: plain(d.outcome) && plain(evidence) && !overlap(d.outcome, evidence), explanation: 'The outcome and evidence prompts share no visible key terms. Make the learner action, content, or audience from the outcome observable in the evidence.'},
      {id: 'achievement-separate', values: rubric.flatMap(item => Object.values(item)), step: 4, label: 'Achievement is separate from behavior/effort', warn: includesAny(rubric.map(item => Object.values(item).join(' ')).join(' '), ['effort', 'on time', 'participat', 'prepared', 'behavior', 'behaviour', 'tries hard']), explanation: 'An achievement descriptor appears to include effort, participation, preparation, timeliness, or behavior. Move that information to the separate behavior/effort note.'}
    ];
    return rules.map(rule => ({...rule, signature: ruleSignature(rule.id, rule.values)}));
  }

  function guidanceRules() {
    return allGuidanceRules().filter(rule => rule.step <= state.step);
  }

  function isRuleOverridden(rule) {
    return Boolean(state.overrides[rule.id]) && state.overrideSignatures[rule.id] === rule.signature;
  }

  function pruneStaleOverrides() {
    const cleared = [];
    allGuidanceRules().forEach(rule => {
      if (!rule.warn || !isRuleOverridden(rule)) {
        if (rule.warn && state.overrides[rule.id]) cleared.push(rule.id);
        delete state.overrides[rule.id];
        delete state.overrideSignatures[rule.id];
      }
    });
    return cleared;
  }

  function renderGuidance() {
    const rules = guidanceRules();
    if (!rules.length) {
      guidanceList.innerHTML = '<div class="guidance-empty"><p>Guidance appears as you add lesson details.</p></div>';
      return;
    }
    guidanceList.innerHTML = rules.map(rule => {
      const overridden = isRuleOverridden(rule);
      const status = rule.warn ? (overridden ? 'override' : 'warning') : 'pass';
      const summary = rule.warn ? (overridden ? 'Teacher override recorded' : rule.explanation) : 'No issue found by this wording check.';
      return `<article class="guidance-item ${status}"><div><span class="check-icon" aria-hidden="true">${status === 'pass' ? '✓' : status === 'override' ? '↷' : '!'}</span><strong>${esc(rule.label)}</strong></div><p>${esc(summary)}</p>${rule.warn ? `<label class="override-label"><input type="checkbox" data-override="${esc(rule.id)}" ${overridden ? 'checked' : ''}> Keep as planned; I reviewed this warning</label>` : ''}</article>`;
    }).join('');
    guidanceList.querySelectorAll('[data-override]').forEach(input => input.addEventListener('change', () => {
      const rule = allGuidanceRules().find(item => item.id === input.dataset.override);
      if (input.checked && rule && rule.warn) {
        state.overrides[rule.id] = true;
        state.overrideSignatures[rule.id] = rule.signature;
      } else {
        delete state.overrides[input.dataset.override];
        delete state.overrideSignatures[input.dataset.override];
      }
      updateAll();
    }));
  }

  function section(title, value) {
    return plain(value) ? `<section class="artifact-section"><h3>${esc(title)}</h3><p>${esc(value)}</p></section>` : '';
  }

  function renderArtifact() {
    const d = formValues();
    const rubric = readRubric();
    const sourceLink = safeHttpUrl(d.sourceUrl);
    const warnings = guidanceRules().filter(rule => rule.warn && !isRuleOverridden(rule));
    artifact.innerHTML = `
      <header class="artifact-header"><p class="artifact-label">Synalepha lesson plan</p><h2>${esc(d.title || 'Untitled lesson')}</h2><p>${esc([d.language, d.proficiency, d.learners, d.duration].filter(plain).join(' · '))}</p></header>
      ${section('Context', d.context)}${section('Communication outcome', d.outcome)}
      <section class="artifact-section"><h3>Authentic source or resource</h3><p><strong>${esc(d.sourceTitle || 'Not yet added')}</strong>${d.sourcePublisher ? ` — ${esc(d.sourcePublisher)}` : ''}</p>${sourceLink ? `<p><a href="${esc(sourceLink)}">${esc(sourceLink)}</a></p>` : ''}<dl class="artifact-meta"><dt>Format</dt><dd>${esc(d.sourceType)}</dd><dt>Community / regional context</dt><dd>${esc(d.sourceRegion)}</dd><dt>Date / currency</dt><dd>${esc(d.sourceDate)}</dd><dt>Access supports</dt><dd>${esc(d.sourceAccess)}</dd><dt>Access / licensing</dt><dd>${esc(d.sourceLicense)}</dd></dl></section>
      <section class="artifact-section"><h3>${esc(d.inputPathway || 'Interpretive / structured input')}</h3>${sectionBody('Reason to understand', d.inputPurpose)}${sectionBody('Learner directions', d.inputTask)}${sectionBody('Comprehensibility supports', d.comprehensionSupports)}${sectionBody('Form–meaning connection', d.formMeaning)}${sectionBody('Referential items', d.referentialItems)}${sectionBody('Affective extension', d.affectiveItems)}</section>
      <section class="artifact-section"><h3>Communication</h3>${sectionBody('Audience, purpose, and information need', d.communicativePurpose)}${sectionBody('Interpersonal task', d.interpersonalTask)}${sectionBody('Presentational task', d.presentationalTask)}${sectionBody('Differentiation', d.differentiation)}</section>
      <section class="artifact-section"><h3>Evidence and response</h3>${sectionBody('Formative evidence', d.evidencePlan)}${rubricTable(rubric)}${sectionBody('Behavior / effort — separate from achievement', d.behaviorNote)}${sectionBody('Feedback', d.feedbackPlan)}${sectionBody('Revision / reassessment', d.reassessmentPlan)}</section>
      <section class="artifact-section artifact-review"><h3>Teacher review</h3><p>${warnings.length ? `${warnings.length} Studio warning${warnings.length === 1 ? '' : 's'} remain unresolved. Review the planning checks before use.` : 'All visible Studio wording checks are resolved or teacher overrides are recorded.'}</p><p class="meta">Automated checks are limited and do not verify language accuracy, cultural context, source availability, copyright permissions, accessibility, or fit for a particular learner.</p></section>`;
    const reviewGate = document.querySelector('#review-gate');
    if (reviewGate) {
      reviewGate.className = `review-gate ${warnings.length ? 'has-warnings' : 'is-ready'}`;
      reviewGate.innerHTML = warnings.length ? `<strong>Review needed:</strong> ${warnings.length} unresolved planning warning${warnings.length === 1 ? '' : 's'}. Revise the lesson or record a teacher override in Studio guidance.` : '<strong>Ready for teacher review:</strong> visible wording checks are resolved or overridden. Verify accuracy, context, access, permissions, and learner fit before teaching.';
    }
  }

  function sectionBody(label, value) {
    return plain(value) ? `<div class="artifact-subsection"><h4>${esc(label)}</h4><p>${esc(value)}</p></div>` : '';
  }

  function rubricTable(items) {
    const rows = items.filter(item => plain(item.prompt));
    if (!rows.length) return '';
    return `<div class="table-scroll" tabindex="0" aria-label="Achievement rubric; scroll horizontally if needed"><table class="rubric-table"><caption>Achievement evidence rubric</caption><thead><tr><th scope="col">Observable evidence</th><th scope="col">Extends</th><th scope="col">Meets</th><th scope="col">Developing</th><th scope="col">Beginning</th></tr></thead><tbody>${rows.map(item => `<tr><th scope="row">${esc(item.prompt)}</th><td>${esc(item.extends)}</td><td>${esc(item.meets)}</td><td>${esc(item.developing)}</td><td>${esc(item.beginning)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function safeHttpUrl(value) {
    if (!plain(value)) return '';
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) {
      return '';
    }
  }

  function updateAll() {
    state.dirty = true;
    const clearedOverrides = pruneStaleOverrides();
    renderGuidance();
    renderArtifact();
    saveDraftSilently();
    if (clearedOverrides.length) announce(`${clearedOverrides.length === 1 ? 'A teacher override needs' : 'Teacher overrides need'} reconfirmation because related lesson content changed.`);
  }

  function announce(message, isError) {
    statusBox.textContent = message;
    statusBox.classList.toggle('error', Boolean(isError));
  }

  function saveDraftSilently() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(lessonDocument())); } catch (_) { /* explicit save reports failures */ }
  }

  function getLibrary() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(value)) return [];
      return value.filter(item => validateDocument(item).ok).slice(0, 30);
    } catch (_) {
      return [];
    }
  }

  function saveCurrent() {
    try {
      const doc = lessonDocument();
      const library = getLibrary();
      const existing = library.findIndex(item => item.id === doc.id);
      if (existing >= 0) library[existing] = doc;
      else library.unshift(doc);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library.slice(0, 30)));
      state.dirty = false;
      renderSavedLessons();
      announce('Lesson saved locally on this browser profile.');
    } catch (_) {
      announce('This browser could not save the lesson. Export JSON to keep a portable copy.', true);
    }
  }

  function renderSavedLessons() {
    const list = document.querySelector('#saved-lessons');
    const library = getLibrary();
    if (!library.length) {
      list.innerHTML = '<div class="empty"><h3>No saved lessons yet</h3><p>Use “Save locally” to keep this lesson in the current browser profile, or export JSON for a portable copy.</p></div>';
      return;
    }
    list.innerHTML = library.map(doc => `<article class="saved-card"><div><span class="kicker">${esc(doc.fields.language || 'Lesson')} · ${esc(doc.fields.proficiency || 'Range not set')}</span><h3>${esc(doc.fields.title || 'Untitled lesson')}</h3><p class="meta">Updated ${esc(formatDate(doc.updatedAt))}</p></div><div class="actions"><button type="button" class="button secondary" data-load-id="${esc(doc.id)}">Load</button><button type="button" class="button secondary" data-remix-id="${esc(doc.id)}">Remix</button><button type="button" class="button danger" data-delete-id="${esc(doc.id)}">Delete</button></div></article>`).join('');
    list.querySelectorAll('[data-load-id]').forEach(button => button.addEventListener('click', () => {
      const doc = getLibrary().find(item => item.id === button.dataset.loadId);
      if (doc) loadDocument(doc, 'Saved lesson loaded.', true);
    }));
    list.querySelectorAll('[data-remix-id]').forEach(button => button.addEventListener('click', () => {
      const doc = getLibrary().find(item => item.id === button.dataset.remixId);
      if (doc) remixDocument(doc);
    }));
    list.querySelectorAll('[data-delete-id]').forEach(button => button.addEventListener('click', () => {
      deleteSavedLesson(button.dataset.deleteId);
    }));
  }

  function deleteSavedLesson(id) {
    try {
      const library = getLibrary();
      const index = library.findIndex(item => item.id === id);
      if (index < 0) {
        announce('That saved lesson is no longer available.', true);
        renderSavedLessons();
        return;
      }
      const title = plain(library[index].fields.title) || 'Untitled lesson';
      const confirmed = window.confirm(`Delete saved lesson “${title}”?\n\nThis removes only this lesson from this browser. The current draft and exported files will not be changed.`);
      if (!confirmed) {
        announce('Delete canceled. The saved lesson was not changed.');
        return;
      }
      library.splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
      renderSavedLessons();
      announce(`Deleted saved lesson “${title}” from this browser. The current draft was not changed.`);
    } catch (_) {
      announce('This browser could not delete the saved lesson. Nothing was changed.', true);
    }
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'date unavailable' : date.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});
  }

  function remixDocument(source) {
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = makeId();
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = copy.createdAt;
    copy.fields.title = `Remix: ${plain(copy.fields.title) || 'Untitled lesson'}`.slice(0, 120);
    copy.overrides = {};
    copy.overrideSignatures = {};
    loadDocument(copy, 'A new remix is ready. The original remains unchanged.', true);
  }

  function exportJson() {
    const doc = lessonDocument();
    const blob = new Blob([JSON.stringify(doc, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = (plain(doc.fields.title) || 'synalepha-lesson').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'synalepha-lesson';
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    announce('Portable lesson JSON exported.');
  }

  function validateDocument(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {ok: false, error: 'The JSON root must be a lesson object.'};
    if (value.schema !== 'synalepha.lesson' || value.schemaVersion !== SCHEMA_VERSION) return {ok: false, error: 'This is not a supported Synalepha lesson file.'};
    const topKeys = new Set(['schema', 'schemaVersion', 'id', 'createdAt', 'updatedAt', 'fields', 'rubric', 'overrides', 'overrideSignatures']);
    if (Object.keys(value).some(key => !topKeys.has(key))) return {ok: false, error: 'The lesson file contains unsupported top-level data.'};
    if (!value.fields || typeof value.fields !== 'object' || Array.isArray(value.fields)) return {ok: false, error: 'The lesson fields are missing or malformed.'};
    if (Object.keys(value.fields).some(name => !FIELD_NAMES.includes(name))) return {ok: false, error: 'The lesson file contains an unsupported field.'};
    for (const name of FIELD_NAMES) {
      if (name in value.fields && typeof value.fields[name] !== 'string') return {ok: false, error: `Field “${name}” must be text.`};
      if (plain(value.fields[name]).length > 5000) return {ok: false, error: `Field “${name}” is too long.`};
    }
    for (const [name, allowed] of Object.entries(ENUMS)) {
      if (!allowed.includes(plain(value.fields[name]))) return {ok: false, error: `Field “${name}” contains an unsupported option.`};
    }
    if (!Array.isArray(value.rubric) || value.rubric.length < 1 || value.rubric.length > 5) return {ok: false, error: 'The rubric must contain one to five criteria.'};
    const rubricKeys = ['prompt', 'extends', 'meets', 'developing', 'beginning'];
    for (const item of value.rubric) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return {ok: false, error: 'A rubric criterion is malformed.'};
      if (Object.keys(item).some(key => !rubricKeys.includes(key))) return {ok: false, error: 'A rubric criterion contains unsupported data.'};
      for (const key of rubricKeys) {
        if (typeof item[key] !== 'string' || item[key].length > 5000) return {ok: false, error: `Rubric field “${key}” is missing, not text, or too long.`};
      }
    }
    if (value.overrides != null && (typeof value.overrides !== 'object' || Array.isArray(value.overrides))) return {ok: false, error: 'Teacher overrides are malformed.'};
    if (value.overrides && Object.entries(value.overrides).some(([key, enabled]) => !OVERRIDE_IDS.has(key) || typeof enabled !== 'boolean')) return {ok: false, error: 'Teacher overrides contain unsupported data.'};
    if (value.overrideSignatures != null && (typeof value.overrideSignatures !== 'object' || Array.isArray(value.overrideSignatures))) return {ok: false, error: 'Teacher override confirmations are malformed.'};
    if (value.overrideSignatures && Object.entries(value.overrideSignatures).some(([key, signature]) => !OVERRIDE_IDS.has(key) || typeof signature !== 'string' || !/^[a-f0-9]{8}$/.test(signature) || !value.overrides || value.overrides[key] !== true)) return {ok: false, error: 'Teacher override confirmations contain unsupported data.'};
    if (value.id != null && (typeof value.id !== 'string' || value.id.length > 120)) return {ok: false, error: 'The lesson identifier is malformed.'};
    if (value.createdAt != null && (typeof value.createdAt !== 'string' || value.createdAt.length > 60)) return {ok: false, error: 'The creation timestamp is malformed.'};
    if (value.updatedAt != null && (typeof value.updatedAt !== 'string' || value.updatedAt.length > 60)) return {ok: false, error: 'The update timestamp is malformed.'};
    return {ok: true};
  }

  async function importJson(file) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      announce('Import failed safely: the JSON file is larger than 1 MB.', true);
      return;
    }
    try {
      const value = JSON.parse(await file.text());
      const result = validateDocument(value);
      if (!result.ok) {
        announce(`Import failed safely: ${result.error} Your current lesson was not changed.`, true);
        return;
      }
      loadDocument(value, 'Lesson imported. Review it before saving or teaching.', true);
    } catch (_) {
      announce('Import failed safely: the file is not valid JSON. Your current lesson was not changed.', true);
    }
  }

  function renderExemplars() {
    const list = document.querySelector('#exemplar-list');
    list.innerHTML = exemplars.map(item => `<article class="exemplar-card"><span class="kicker">${esc(item.language)} · ${esc(item.proficiency)}</span><h3>${esc(item.title)}</h3><p>${esc(item.outcome)}</p><button type="button" data-exemplar="${esc(item.id)}">Load and remix</button></article>`).join('');
    list.querySelectorAll('[data-exemplar]').forEach(button => button.addEventListener('click', () => {
      loadExemplar(button.dataset.exemplar, true);
    }));
  }

  function loadExemplar(id, scroll) {
    const exemplar = exemplars.find(item => item.id === id);
    if (!exemplar) return false;
    const doc = {schema: 'synalepha.lesson', schemaVersion: SCHEMA_VERSION, id: makeId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), fields: {}, rubric: exemplar.rubric, overrides: {}, overrideSignatures: {}};
    FIELD_NAMES.forEach(name => { doc.fields[name] = plain(exemplar[name]); });
    loadDocument(doc, `${exemplar.language} ${exemplar.proficiency.toLowerCase()} exemplar loaded as a new remix.`, true);
    if (scroll) document.querySelector('#studio-main').scrollIntoView();
    return true;
  }

  function applyExemplarQuery() {
    const id = new URLSearchParams(location.search).get('exemplar');
    return id ? loadExemplar(id, false) : false;
  }

  function applyResourceQuery() {
    const params = new URLSearchParams(location.search);
    if (!params.has('resourceTitle')) return false;
    const fields = {};
    FIELD_NAMES.forEach(name => { fields[name] = ''; });
    fields.sourceTitle = params.get('resourceTitle') || '';
    fields.sourcePublisher = params.get('publisher') || '';
    fields.sourceUrl = safeHttpUrl(params.get('url') || '');
    fields.sourceRegion = params.get('region') || '';
    fields.sourceAccess = params.get('accessibility') || '';
    fields.sourceLicense = params.get('license') || '';
    fields.language = ENUMS.language.includes(params.get('language')) ? params.get('language') : '';
    fields.sourceType = ENUMS.sourceType.includes(params.get('format')) ? params.get('format') : (params.get('format') === 'Reference' || params.get('format') === 'Activities' ? 'Text' : 'Mixed media');
    const doc = {schema: 'synalepha.lesson', schemaVersion: SCHEMA_VERSION, id: makeId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), fields, rubric: defaultRubric(), overrides: {}, overrideSignatures: {}};
    loadDocument(doc, 'Resource details added. Start with the lesson purpose; the source will carry forward to step 2.', false);
    return true;
  }

  function focusStepHeading(index, preventScroll) {
    const heading = panels[index].querySelector('h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus({preventScroll: Boolean(preventScroll)});
  }

  stepButtons.forEach(button => button.addEventListener('click', () => {
    const target = Number(button.dataset.step);
    if (target > state.step && !validateStep(state.step)) return;
    showStep(target);
    focusStepHeading(target, true);
  }));

  nextButton.addEventListener('click', () => {
    if (!validateStep(state.step)) return;
    showStep(state.step + 1);
    focusStepHeading(state.step, false);
  });
  previousButton.addEventListener('click', () => showStep(state.step - 1));
  form.addEventListener('input', updateAll);
  form.addEventListener('change', updateAll);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (state.step < 5 && validateStep(state.step)) {
      showStep(state.step + 1);
      focusStepHeading(state.step, false);
    }
  });
  document.querySelector('#add-criterion').addEventListener('click', () => {
    if (rubricContainer.children.length >= 5) {
      announce('The rubric is limited to five focused achievement criteria.');
      return;
    }
    addRubricRow({prompt: '', extends: '', meets: '', developing: '', beginning: ''});
    updateAll();
    rubricContainer.lastElementChild.querySelector('[data-rubric="prompt"]').focus();
  });
  document.querySelector('#save-lesson').addEventListener('click', saveCurrent);
  document.querySelector('#duplicate-lesson').addEventListener('click', () => remixDocument(lessonDocument()));
  document.querySelector('#export-json').addEventListener('click', exportJson);
  document.querySelector('#review-export-json').addEventListener('click', exportJson);
  document.querySelector('#import-json').addEventListener('change', event => {
    importJson(event.target.files[0]);
    event.target.value = '';
  });
  document.querySelector('#new-lesson').addEventListener('click', () => {
    const blank = {schema: 'synalepha.lesson', schemaVersion: SCHEMA_VERSION, id: makeId(), createdAt: new Date().toISOString(), fields: {}, rubric: defaultRubric(), overrides: {}, overrideSignatures: {}};
    FIELD_NAMES.forEach(name => { blank.fields[name] = ''; });
    loadDocument(blank, 'New blank lesson started. Your saved lessons remain available below.', false);
  });
  document.querySelector('#print-lesson').addEventListener('click', () => window.print());
  document.querySelector('#copy-lesson').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(artifact.innerText);
      announce('Lesson text copied to the clipboard.');
    } catch (_) {
      announce('Clipboard access is unavailable. Select the lesson preview text manually.', true);
    }
  });
  document.querySelector('#toggle-exemplars').addEventListener('click', event => {
    const list = document.querySelector('#exemplar-list');
    const open = event.currentTarget.getAttribute('aria-expanded') === 'true';
    event.currentTarget.setAttribute('aria-expanded', String(!open));
    event.currentTarget.textContent = open ? 'Show exemplars' : 'Hide exemplars';
    list.hidden = open;
  });

  writeRubric(state.rubric);
  renderExemplars();
  renderSavedLessons();
  let initialized = applyExemplarQuery();
  if (!initialized) initialized = applyResourceQuery();
  if (!initialized) {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
      if (validateDocument(draft).ok) {
        loadDocument(draft, 'Local draft restored.', false);
        initialized = true;
      }
    } catch (_) { /* start blank */ }
  }
  if (!initialized) {
    showStep(0, true);
    updateAll();
  }
})();
