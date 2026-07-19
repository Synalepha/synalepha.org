const resources = [
  {title: 'DidactiRed', url: 'https://cvc.cervantes.es/aula/didactired/', source: 'Instituto Cervantes', language: 'Spanish', level: 'All levels', mode: 'Interpersonal', format: 'Activities', access: 'Free access; source terms apply', prep: 'Medium', region: 'Multiple / Spain-based publisher', accessibility: 'Varies by item; verify the selected item', note: 'A long-running archive of teacher-facing classroom activities searchable by section and topic.'},
  {title: 'Rayuela', url: 'https://cvc.cervantes.es/aula/pasatiempos/', source: 'Centro Virtual Cervantes', language: 'Spanish', level: 'All levels', mode: 'Interpretive', format: 'Activities', access: 'Free access; source terms apply', prep: 'Low', region: 'Multiple / Spain-based publisher', accessibility: 'Varies by item; verify the selected item', note: 'Interactive language activities organized into four difficulty levels.'},
  {title: 'RTVE Play', url: 'https://www.rtve.es/play/', source: 'Radiotelevisión Española', language: 'Spanish', level: 'Intermediate', mode: 'Interpretive', format: 'Video', access: 'Free access; source terms apply', prep: 'Medium', region: 'Spain', accessibility: 'Captions and availability vary by program; verify the selected item', note: 'Authentic public-broadcast video and audio; access and geographic availability vary by program.'},
  {title: 'FundéuRAE recommendations', url: 'https://www.fundeu.es/', source: 'FundéuRAE', language: 'Spanish', level: 'Advanced', mode: 'Reference', format: 'Reference', access: 'Free access; source terms apply', prep: 'Low', region: 'Multiple / Spain-based publisher', accessibility: 'Primarily text; verify the selected page', note: 'Current usage recommendations useful for investigating language change and media vocabulary.'},
  {title: 'Radio Ambulante', url: 'https://radioambulante.org/', source: 'Radio Ambulante Studios', language: 'Spanish', level: 'Advanced', mode: 'Interpretive', format: 'Audio', access: 'Free access; source terms apply', prep: 'Medium', region: 'Latin America and diaspora', accessibility: 'Episode pages generally include Spanish transcripts; verify the selected episode', note: 'Narrative journalism from across Latin America; record each episode’s specific place and community context.'},
  {title: 'SpanishDict', url: 'https://www.spanishdict.com/', source: 'Curiosity Media', language: 'Spanish', level: 'All levels', mode: 'Reference', format: 'Reference', access: 'Free and paid options', prep: 'Low', region: 'Multiple', accessibility: 'Primarily text; features vary', note: 'A learner-oriented dictionary, conjugation reference, pronunciation guide, and lesson platform.'},
  {title: 'Apprendre le français', url: 'https://apprendre.tv5monde.com/', source: 'TV5MONDE', language: 'French', level: 'All levels', mode: 'Interpretive', format: 'Video', access: 'Free access; source terms apply', prep: 'Low', region: 'Francophonie', accessibility: 'Transcripts or subtitles are common; verify the selected item', note: 'Authentic video with CEFR-labelled learner activities and teacher collections.'},
  {title: 'Français facile', url: 'https://francaisfacile.rfi.fr/', source: 'Radio France Internationale', language: 'French', level: 'All levels', mode: 'Interpretive', format: 'Audio', access: 'Free access; source terms apply', prep: 'Low', region: 'Francophonie / France-based publisher', accessibility: 'Transcript support is common; verify the selected item', note: 'International news, podcasts, transcripts, exercises, and teaching resources.'},
  {title: 'Lumni – Primaire', url: 'https://www.lumni.fr/primaire', source: 'Lumni', language: 'French', level: 'Novice', mode: 'Interpretive', format: 'Mixed media', access: 'Free access; source terms apply', prep: 'Medium', region: 'France', accessibility: 'Varies by item; verify the selected item', note: 'French public educational media for primary learners, including French-language content useful as authentic curricular input.'},
  {title: 'Le Point du FLE', url: 'https://www.lepointdufle.net/', source: 'Le Point du FLE', language: 'French', level: 'All levels', mode: 'Reference', format: 'Activities', access: 'Free access; source terms apply', prep: 'Low', region: 'Multiple', accessibility: 'Varies by linked site; verify the selected item', note: 'A directory of French-learning exercises and teacher resources; quality and access vary by linked source.'},
  {title: 'Vitrine linguistique', url: 'https://vitrinelinguistique.oqlf.gouv.qc.ca/', source: 'Office québécois de la langue française', language: 'French', level: 'Advanced', mode: 'Reference', format: 'Reference', access: 'Free access; source terms apply', prep: 'Low', region: 'Québec, Canada', accessibility: 'Primarily text; verify the selected page', note: 'Terminology, definitions, and language guidance grounded in Québec usage.'},
  {title: 'Dictionnaire des francophones', url: 'https://www.dictionnairedesfrancophones.org/', source: 'Institut international pour la Francophonie and partners', language: 'French', level: 'Advanced', mode: 'Reference', format: 'Reference', access: 'Free access; source terms apply', prep: 'Low', region: 'Francophonie', accessibility: 'Primarily text; features may vary', note: 'A collaborative dictionary highlighting words and meanings used across Francophone communities.'}
];

const list = document.querySelector('#resource-list');
const empty = document.querySelector('#empty');
const count = document.querySelector('#result-count');
const form = document.querySelector('#filters');
const safe = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));

function studioUrl(resource) {
  const formatMap = {Audio: 'Audio', Video: 'Video', 'Mixed media': 'Mixed media'};
  const params = new URLSearchParams({
    resourceTitle: resource.title,
    publisher: resource.source,
    url: resource.url,
    language: resource.language,
    region: resource.region,
    format: formatMap[resource.format] || 'Text',
    accessibility: `${resource.accessibility}. Add or verify learner-facing alternatives before teaching.`,
    license: `${resource.access}. Check the exact item’s terms before copying, adapting, or redistributing it.`
  });
  return `create.html?${params.toString()}`;
}

function render() {
  const data = Object.fromEntries(new FormData(form));
  const query = data.search.toLowerCase().trim();
  const accessSupportMatches = resource => {
    const note = resource.accessibility.toLowerCase();
    if (!data.accessibility) return true;
    if (data.accessibility === 'transcript') return /transcript|caption|subtitle/.test(note);
    if (data.accessibility === 'text') return note.includes('primarily text');
    return /varies|vary|verify/.test(note);
  };
  const shown = resources.filter(resource =>
    (!query || Object.values(resource).join(' ').toLowerCase().includes(query)) &&
    ['language', 'level', 'mode', 'format', 'access', 'prep'].every(key => !data[key] || resource[key] === data[key]) &&
    accessSupportMatches(resource)
  );
  list.innerHTML = shown.map(resource => `
    <article class="card resource-card">
      <span class="kicker">${safe(resource.language)} · ${safe(resource.mode)}</span>
      <h2>${safe(resource.title)}</h2>
      <p>${safe(resource.note)}</p>
      <dl>
        <dt>Source</dt><dd>${safe(resource.source)}</dd>
        <dt>Level</dt><dd>${safe(resource.level)}</dd>
        <dt>Format</dt><dd>${safe(resource.format)}</dd>
        <dt>Access</dt><dd>${safe(resource.access)}</dd>
        <dt>Prep</dt><dd>${safe(resource.prep)}</dd>
        <dt>Region</dt><dd>${safe(resource.region)}</dd>
        <dt>Accessibility</dt><dd>${safe(resource.accessibility)}</dd>
        <dt>Reviewed</dt><dd>July 19, 2026</dd>
      </dl>
      <div class="resource-actions"><a class="button" href="${safe(studioUrl(resource))}">Use in Lesson Studio</a><a href="${safe(resource.url)}" rel="noopener">Visit source</a></div>
    </article>`).join('');
  count.textContent = `${shown.length} resource${shown.length === 1 ? '' : 's'} shown`;
  empty.hidden = shown.length > 0;
}

form.addEventListener('submit', event => { event.preventDefault(); render(); });
form.addEventListener('input', render);
form.addEventListener('reset', () => setTimeout(render));
const requested = new URLSearchParams(location.search).get('language');
if (['Spanish', 'French'].includes(requested)) form.elements.language.value = requested;
render();
