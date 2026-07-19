(() => {
  const form = document.querySelector('#assessment-form');
  if (!form) return;
  const status = document.querySelector('#assessment-status');
  const results = document.querySelector('#assessment-results');
  const analyzeButton = document.querySelector('#analyze-submission');
  const lessonInput = document.querySelector('#lesson-file');
  const responseInput = document.querySelector('#response-file');
  const allowedLessonFields = ['language', 'proficiency', 'outcome', 'evidencePlan', 'feedbackPlan', 'reassessmentPlan'];
  let rubric = [];

  function announce(message, error = false) {
    status.textContent = message;
    status.classList.toggle('error', error);
  }

  function setBusy(busy) {
    analyzeButton.disabled = busy;
    analyzeButton.textContent = busy ? 'Analyzing…' : 'Analyze response';
    form.setAttribute('aria-busy', String(busy));
  }

  function validateLesson(value) {
    if (!value || value.schema !== 'synalepha.lesson' || value.schemaVersion !== 1 || !value.fields || !Array.isArray(value.rubric)) throw new Error('Choose a Synalepha lesson JSON export.');
    if (value.rubric.length < 1 || value.rubric.length > 5) throw new Error('The lesson rubric must contain one to five criteria.');
    return value;
  }

  lessonInput.addEventListener('change', async () => {
    const file = lessonInput.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { announce('Lesson import failed: the file is larger than 1 MB.', true); return; }
    try {
      const lesson = validateLesson(JSON.parse(await file.text()));
      allowedLessonFields.forEach(name => { document.querySelector(`#assessment-${name}`).value = lesson.fields[name] || ''; });
      rubric = lesson.rubric.map(item => ({prompt: item.prompt || '', extends: item.extends || '', meets: item.meets || '', developing: item.developing || '', beginning: item.beginning || ''}));
      document.querySelector('#rubric-summary').textContent = `${rubric.length} rubric ${rubric.length === 1 ? 'criterion' : 'criteria'} loaded from “${lesson.fields.title || 'Untitled lesson'}.”`;
      announce('Lesson and rubric loaded. Add a learner response, then analyze.');
    } catch (error) {
      rubric = [];
      announce(`Lesson import failed safely: ${error.message}`, true);
    } finally { lessonInput.value = ''; }
  });

  responseInput.addEventListener('change', async () => {
    const file = responseInput.files[0];
    if (!file) return;
    if (file.size > 40000) { announce('Response upload failed: the text file is larger than 40 KB.', true); return; }
    if (!/\.(?:txt|md)$/i.test(file.name) && !['text/plain', 'text/markdown'].includes(file.type)) { announce('Use a plain-text .txt or .md file. PDF, image, audio, and word-processing files are not processed.', true); return; }
    document.querySelector('#response-text').value = await file.text();
    announce(`Loaded “${file.name}.” The file remains in this form until you submit it for analysis.`);
    responseInput.value = '';
  });

  function addText(parent, tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    parent.appendChild(node);
    return node;
  }

  function addList(parent, heading, items) {
    const section = document.createElement('section');
    section.className = 'assessment-result-section';
    addText(section, 'h3', heading);
    const list = document.createElement('ul');
    items.forEach(item => addText(list, 'li', item));
    section.appendChild(list);
    parent.appendChild(section);
  }

  function render(data) {
    results.replaceChildren();
    const heading = addText(results, 'h2', 'Teacher review report');
    heading.tabIndex = -1;
    addText(results, 'p', data.limits, 'note');
    const metrics = document.createElement('dl');
    metrics.className = 'assessment-metrics';
    [['Words', data.summary.wordCount], ['Sentences', data.summary.sentenceCount], [`${data.language} signal`, data.summary.languageSignal], ['Outcome terms', `${data.summary.outcomeTermsFound}/${data.summary.outcomeTermsChecked}`], ['Evidence markers', data.summary.evidenceMarkerCount]].forEach(([label, value]) => { addText(metrics, 'dt', label); addText(metrics, 'dd', String(value)); });
    results.appendChild(metrics);
    addList(results, 'Visible strengths', data.strengths);
    addList(results, 'Teacher checks and next steps', data.nextSteps);
    const criteria = document.createElement('section');
    criteria.className = 'assessment-result-section';
    addText(criteria, 'h3', 'Rubric evidence indicators');
    data.criteria.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = `criterion-result ${item.status}`;
      addText(card, 'h4', `${index + 1}. ${item.prompt || 'Criterion'}`);
      addText(card, 'p', item.status === 'evidence-found' ? 'Possible evidence found' : 'Teacher review needed', 'kicker');
      addText(card, 'p', item.note);
      if (item.matchedTerms.length) addText(card, 'p', `Matched wording: ${item.matchedTerms.join(', ')}`, 'meta');
      criteria.appendChild(card);
    });
    results.appendChild(criteria);
    const feedback = document.createElement('section');
    feedback.className = 'assessment-result-section';
    addText(feedback, 'h3', 'Editable feedback draft');
    const label = addText(feedback, 'label', 'Review and revise before sharing');
    label.htmlFor = 'feedback-draft';
    const textarea = document.createElement('textarea');
    textarea.id = 'feedback-draft';
    textarea.value = data.draftFeedback;
    feedback.appendChild(textarea);
    results.appendChild(feedback);
    results.hidden = false;
    heading.focus();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!rubric.length) { announce('Load a Synalepha lesson JSON file with its rubric first.', true); lessonInput.focus(); return; }
    const payload = {rubric};
    allowedLessonFields.forEach(name => { payload[name] = document.querySelector(`#assessment-${name}`).value; });
    payload.responseText = document.querySelector('#response-text').value;
    setBusy(true);
    announce('Sending the response to Synalepha for no-store analysis…');
    try {
      const response = await fetch('/api/assess', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
      const data = await response.json().catch(() => ({ok: false, error: 'The server returned an unreadable response.'}));
      if (!response.ok || !data.ok) throw new Error(data.error || `Analysis failed (${response.status}).`);
      render(data.result);
      announce('Analysis complete. Teacher review is required before feedback is shared.');
    } catch (error) {
      results.hidden = true;
      announce(`Analysis failed safely: ${error.message} The response was not saved by Synalepha.`, true);
    } finally { setBusy(false); }
  });
})();
