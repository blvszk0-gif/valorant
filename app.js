const agents = window.VALORANT_DATA || [];
const root = document.querySelector('#screen-root');
const navButtons = [...document.querySelectorAll('[data-nav]')];
const roles = ['Inicjator', 'Szturmowiec', 'Strażnik', 'Kontroler'];
const roleInfo = {
  'Inicjator': { icon: 'valorant_role_jpg/Inicjator_rola.jpg', examples: 'Sova · Gekko · Skye' },
  'Szturmowiec': { icon: 'valorant_role_jpg/Szturmowiec_rola.jpg', examples: 'Jett · Raze · Phoenix' },
  'Strażnik': { icon: 'valorant_role_jpg/Strażnik_rola.jpg', examples: 'Sage · Killjoy · Cypher' },
  'Kontroler': { icon: 'valorant_role_jpg/Kontroler_rola.jpg', examples: 'Omen · Brimstone · Viper' }
};
const extraLessons = [
  { id: '3.1', title: 'Bronie i ekonomia', group: 'LEKCJA 3 · BRONIE', note: 'Wprowadzenie do sklepu, zakupów i broni.', file: '3.1.mp4' },
  { id: '3.2', title: 'Pistolety', group: 'LEKCJA 3 · BRONIE', note: 'Rodzaje pistoletów, odległość i obrażenia.', file: '3.2.mp4' },
  { id: '3.3', title: 'SMG i strzelby', group: 'LEKCJA 3 · BRONIE', note: 'Pistolety maszynowe i walka na krótkim dystansie.', file: '3.3.mp4' },
  { id: '3.4', title: 'Karabiny', group: 'LEKCJA 3 · BRONIE', note: 'Karabiny używane w większości rund.', file: '3.4.mp4' },
  { id: '3.5', title: 'Karabiny snajperskie', group: 'LEKCJA 3 · BRONIE', note: 'Marshal, Operator i walka na długim dystansie.', file: '3.5.mp4' },
  { id: '3.6', title: 'Karabiny maszynowe', group: 'LEKCJA 3 · BRONIE', note: 'Ares i Odin — duży magazynek i cięższy styl gry.', file: '3.6.mp4' },
  { id: '3.7', title: 'Tarcze', group: 'LEKCJA 3 · BRONIE', note: 'Rodzaje pancerza i punkty osłony.', file: '3.7.mp4' },
  { id: '4.1', title: 'Menu i tryby gry', group: 'LEKCJA 4 · W GRZE', note: 'Pierwsze kroki po wejściu do gry.', file: '4.1.mp4' },
  { id: '4.2', title: 'Interfejs i faza zakupów', group: 'LEKCJA 4 · W GRZE', note: 'Co pokazuje ekran podczas rundy i w sklepie.', file: '4.2.mp4' },
  { id: '4.3', title: 'Mida i pozycje na mapie', group: 'LEKCJA 4 · W GRZE', note: 'Przykładowe przejścia, pozycje i nazwy miejsc.', file: '4.3.mp4' },
  { id: '4.4', title: 'Obrona i ustawienie', group: 'LEKCJA 4 · W GRZE', note: 'Przykład przygotowania obrony przed rundą.', file: '4.4.mp4' },
  { id: '4.5', title: 'Mapa z trzema site’ami', group: 'LEKCJA 4 · W GRZE', note: 'Przykład ataku na mapie z trzema strefami.', file: '4.5.mp4' },
  { id: '4.6', title: 'Ćwiczenie na Sunset', group: 'LEKCJA 4 · W GRZE', note: 'Swobodne ćwiczenie poruszania i orientacji na mapie.', file: '4.6.mp4' }
];
const storageKey = 'spike-school-progress-v2';
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
const completed = new Set(saved.completed || []);
let activeScreen = 'overview';
let selectedAgent = agents[0] || null;
let questionSet = [];
let questionIndex = 0;
let score = 0;
let selectedAnswer = null;
let answered = false;
let activeQuiz = null;

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function mediaUrl(path) {
  const clean = String(path || '').split('/').map(encodeURIComponent).join('/');
  const base = String(window.COURSE_MEDIA_BASE || '').replace(/\/$/, '');
  return base ? `${base}/${clean}` : `./${clean}`;
}
function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function saveProgress() {
  localStorage.setItem(storageKey, JSON.stringify({ completed: [...completed], bestGuess: saved.bestGuess || 0 }));
}
function updateNav(screen) {
  activeScreen = screen;
  navButtons.forEach(button => button.classList.toggle('active', button.dataset.nav === screen));
  const names = { overview: 'START', roles: 'LEKCJA 1 / ROLE', agents: 'LEKCJA 2 / AGENCI', practice: 'TRENING', extras: 'DODATKOWE LEKCJE' };
  document.querySelector('#crumb').textContent = names[screen] || 'START';
}
function videoMarkup(path, title, poster = '') {
  const driveId = window.COURSE_DRIVE_FILES?.[path];
  const player = driveId
    ? `<iframe src="https://drive.google.com/file/d/${encodeURIComponent(driveId)}/preview" title="${esc(title)}" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe>`
    : `<video controls preload="none" playsinline ${poster ? `poster="${esc(poster)}"` : ''} aria-label="${esc(title)}"><source src="${esc(mediaUrl(path))}" type="video/mp4">Twoja przeglądarka nie obsługuje odtwarzania wideo.</video>`;
  return `<div class="video-frame local-video-frame">${player}<div class="video-caption"><span>▶</span><div><b>${esc(title)}</b><small>Wideo z kursu · bez reklam</small></div><span class="video-badge">${driveId ? 'DRIVE' : 'MP4'}</span></div></div>`;
}
function progressMarkup() {
  const done = completed.size;
  const total = 2;
  const percent = Math.round(done / total * 100);
  return `<section class="progress-strip"><div class="progress-copy"><div class="progress-title">TWÓJ POSTĘP <span>${done} / ${total} LEKCJE UKOŃCZONE</span></div><div class="progress-track"><span style="width:${percent}%"></span></div></div><div class="progress-badge"><span>◈</span><div><b>${percent}%</b><small>KURSU GŁÓWNEGO</small></div></div></section>`;
}
function renderOverview() {
  root.innerHTML = `
    <section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> KURS DLA POCZĄTKUJĄCYCH <span class="eyebrow-line"></span></div><h1>OGARNIJ<br><em>VALORANTA.</em></h1><p>Dwie główne lekcje, Twoje nagrania i krótkie quizy, które pomogą zapamiętać role, agentów oraz ich umiejętności.</p><button class="primary-button" data-go="roles">ZACZNIJ OD RÓL <span>↗</span></button><div class="hero-meta"><span>◷ W TWOIM TEMPIE</span><span>✳ 29 AGENTÓW</span><span>⌁ QUIZY 4-ODPOWIEDZIOWE</span></div></div><div class="hero-art" aria-hidden="true"><div class="art-grid"></div><div class="crosshair">+</div><div class="orbital orbital-one"></div><div class="orbital orbital-two"></div><div class="art-ring"><div class="art-core"><span class="core-top">SPIKE</span><span class="core-glyph">S</span><span class="core-bottom">TRAINING</span></div></div><div class="art-tag tag-top">TACTICAL <b>5v5</b></div><div class="art-tag tag-bottom"><span class="pulse"></span> READY WHEN YOU ARE</div><div class="art-corner"></div></div><div class="hero-side-label">TRAINING PROTOCOL <span>///</span> 001</div></section>
    ${progressMarkup()}
    <section class="course-section"><div class="section-head"><div><div class="eyebrow small"><span></span> TWOJA ŚCIEŻKA</div><h2>Zacznij od <em>podstaw.</em></h2></div><span class="section-count">01 — 02</span></div><div class="course-cards">
      <button class="course-card role-course" data-go="roles"><span class="course-number">LEKCJA 01</span><img src="valorant_role_jpg/Inicjator_rola.jpg" alt="" class="course-symbol"><span class="course-card-copy"><b>Role agentów</b><small>Poznaj cztery role i sprawdź się w quizie.</small></span><span class="course-arrow">↗</span></button>
      <button class="course-card agent-course" data-go="agents"><span class="course-number">LEKCJA 02</span><img src="valorant_portrety_agentow_jpg/Gekko_portret.jpg" alt="" class="course-symbol portrait-symbol"><span class="course-card-copy"><b>Agenci i umiejętności</b><small>29 nagrań, atlas postaci i quiz rozpoznawania umiejętności.</small></span><span class="course-arrow">↗</span></button>
    </div></section>
    <section class="home-bottom"><div class="home-panel"><div class="eyebrow small"><span></span> POWTÓRKA</div><h2>Krótki trening <em>pamięci.</em></h2><p>Rozpoznawaj agentów po portretach albo zgaduj, kto ma pokazaną umiejętność.</p><button class="secondary-button" data-go="practice">OTWÓRZ TRENING <span>↗</span></button></div><div class="home-panel extra-home"><div class="eyebrow small"><span></span> DODATKOWY MATERIAŁ</div><h2>Broń, mapy <em>i rozgrywka.</em></h2><p>Twoje nagrania z kolejnych części szkolenia są dostępne jako dodatkowe lekcje.</p><button class="secondary-button" data-go="extras">ZOBACZ 13 NAGRAŃ <span>↗</span></button></div></section>`;
  bindScreenActions();
}
function renderRoles() {
  const cards = roles.map(role => {
    const info = roleInfo[role];
    const exampleAgent = agents.find(agent => agent.role === role);
    const description = exampleAgent?.roleDescription || '';
    return `<article class="role-card"><img src="${esc(info.icon)}" alt="Ikona roli ${esc(role)}"><div><h3>${esc(role)}</h3><p>${esc(description)}</p><small>PRZYKŁADY · ${esc(info.examples)}</small></div></article>`;
  }).join('');
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA 01 · ROLE</div><h1>CZTERY ROLE.<br><em>JEDNA DRUŻYNA.</em></h1><p>Obejrzyj nagranie, poznaj zadania każdej roli, a potem dopasuj agentów do ich specjalizacji.</p></section><section class="lesson-layout"><div class="lesson-main">${videoMarkup('edytowane/1.mp4','Lekcja 1 — role agentów')}<div class="lesson-note"><span>✳</span><p>Role opisują, jak agent najczęściej wspiera drużynę. Nie są sztywnymi zasadami — każdy agent może pomagać na różne sposoby.</p></div></div><aside class="lesson-aside"><div class="aside-kicker">W TEJ LEKCJI</div><h2>Zapamiętaj <em>cztery role.</em></h2><p>Wypatruj ich zadań, kiedy poznajesz kolejnych agentów.</p><button class="primary-button" data-quiz="role">ROZPOCZNIJ QUIZ <span>↗</span></button><div class="aside-meta">8 PYTAŃ · 4 ODPOWIEDZI DO WYBORU</div></aside></section><section class="roles-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PODSTAWY</div><h2>Kto za co <em>odpowiada?</em></h2></div></div><div class="role-grid">${cards}</div></section>`;
  bindScreenActions();
}
function renderAgentGrid(filter = '') {
  const grid = document.querySelector('#agent-grid');
  if (!grid) return;
  const query = filter.trim().toLocaleLowerCase('pl');
  const shown = agents.filter(a => a.name.toLocaleLowerCase('pl').includes(query) || a.role.toLocaleLowerCase('pl').includes(query));
  grid.innerHTML = shown.map(agent => `<button class="agent-tile ${selectedAgent?.id === agent.id ? 'selected' : ''}" data-agent="${esc(agent.id)}"><img src="${esc(agent.portrait)}" alt=""><span><b>${esc(agent.name)}</b><small>${esc(agent.role)}</small></span><i>↗</i></button>`).join('') || '<p class="empty-state">Nie znaleziono agenta.</p>';
  grid.querySelectorAll('[data-agent]').forEach(button => button.addEventListener('click', () => {
    selectedAgent = agents.find(a => a.id === button.dataset.agent) || agents[0];
    renderAgentDetail();
    renderAgentGrid(document.querySelector('#agent-search')?.value || '');
  }));
}
function renderAgentDetail() {
  const box = document.querySelector('#agent-detail');
  if (!box || !selectedAgent) return;
  const a = selectedAgent;
  const skills = a.abilities.map(ability => `<article class="ability-card"><div class="ability-icon-wrap">${ability.icon ? `<img src="${esc(ability.icon)}" alt="Ikona ${esc(ability.name)}">` : '<span class="passive-icon">PASSIVE</span>'}</div><div><div class="ability-slot">${esc(slotName(ability.slot))}</div><h3>${esc(ability.name)}</h3><p>${esc(ability.description)}</p></div></article>`).join('');
  box.innerHTML = `<div class="agent-detail-head"><div><div class="eyebrow small"><span></span> ${esc(a.role)}</div><h2>${esc(a.name)}</h2><p>${esc(a.description)}</p></div><img class="agent-detail-portrait" src="${esc(a.portrait)}" alt="Portret agenta ${esc(a.name)}"></div><div class="agent-detail-video">${videoMarkup(a.video,`Lekcja agenta — ${a.name}`,a.portrait)}</div><div class="section-head ability-heading"><div><div class="eyebrow small"><span></span> ZESTAW UMIEJĘTNOŚCI</div><h2>Co potrafi <em>${esc(a.name)}?</em></h2></div><button class="secondary-button" data-quiz="ability">QUIZ UMIEJĘTNOŚCI ↗</button></div><div class="ability-grid">${skills}</div>`;
  bindQuizButtons(box);
}
function slotName(slot) {
  return ({ Ability1: 'UMIEJĘTNOŚĆ 1', Ability2: 'UMIEJĘTNOŚĆ 2', Grenade: 'UMIEJĘTNOŚĆ POD Z', Ultimate: 'ULTIMATE', Passive: 'PASYWNA' })[slot] || slot.toUpperCase();
}
function renderAgents() {
  if (!selectedAgent) selectedAgent = agents[0];
  root.innerHTML = `<section class="page-intro agent-intro"><div><div class="eyebrow"><span></span> LEKCJA 02 · AGENCI</div><h1>POZNAJ <em>AGENTÓW.</em></h1><p>Wybierz postać, obejrzyj Twoje nagranie i zobacz jej zestaw umiejętności. Na końcu rozpoznaj umiejętności po ikonce.</p></div><button class="primary-button" data-quiz="ability">QUIZ: CZYJA TO UMIEJĘTNOŚĆ? <span>↗</span></button></section><div class="agent-browser"><section class="agent-list-panel"><div class="agent-list-head"><h2>ATLAS AGENTÓW <span>${agents.length}</span></h2><input id="agent-search" type="search" placeholder="Szukaj agenta lub roli" aria-label="Szukaj agenta lub roli"></div><div id="agent-grid" class="agent-grid"></div></section><section id="agent-detail" class="agent-detail-panel"></section></div>`;
  renderAgentGrid();
  renderAgentDetail();
  document.querySelector('#agent-search').addEventListener('input', event => renderAgentGrid(event.target.value));
  bindScreenActions();
}
function renderExtras() {
  const groups = [...new Set(extraLessons.map(x => x.group))];
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> DODATKOWA NAUKA</div><h1>WIEDZA Z <em>ROZGRYWKI.</em></h1><p>Po rolach i agentach możesz przejść do zakupów, broni, interfejsu i przykładów gry na mapie.</p></section><div class="extras-groups">${groups.map(group => `<section class="extra-group"><div class="section-head"><div><div class="eyebrow small"><span></span> ${esc(group)}</div><h2>${group.includes('BRONIE') ? 'Broń i <em>pancerz.</em>' : 'Poznaj <em>mecz.</em>'}</h2></div><span class="section-count">${extraLessons.filter(x => x.group === group).length} NAGRAŃ</span></div><div class="extra-list">${extraLessons.filter(x => x.group === group).map(item => `<details class="extra-video-card"><summary><span class="extra-number">${esc(item.id)}</span><span class="extra-title"><b>${esc(item.title)}</b><small>${esc(item.note)}</small></span><span class="extra-play">▶</span></summary><div class="extra-player">${videoMarkup(`edytowane/${item.file}`,`${item.id} — ${item.title}`)}</div></details>`).join('')}</div></section>`).join('')}</div>`;
}
function renderPractice() {
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> POWTÓRKA W FORMIE GRY</div><h1>ZGADNIJ, <em>KTO TO?</em></h1><p>Krótki trening w stylu zgadywanki: portret agenta, ikonka umiejętności albo przypisanie do roli. Każde pytanie ma cztery odpowiedzi.</p></section><div class="practice-grid"><article class="practice-card"><div class="practice-symbol portrait-practice"><img src="${esc(agents.find(a=>a.name==='Sova')?.portrait || agents[0].portrait)}" alt=""></div><div class="eyebrow small"><span></span> ROZPOZNAWANIE</div><h2>Kto to <em>jest?</em></h2><p>Rozpoznaj agentów po ich portretach. 10 pytań, cztery odpowiedzi.</p><button class="primary-button" data-quiz="portrait">ZAGRAJ <span>↗</span></button></article><article class="practice-card"><div class="practice-symbol skill-practice"><img src="${esc(agents.flatMap(a=>a.abilities).find(x=>x.icon)?.icon || '')}" alt=""></div><div class="eyebrow small"><span></span> IKONY UMIEJĘTNOŚCI</div><h2>Czyja to <em>umiejętność?</em></h2><p>Spójrz na ikonkę i wybierz agenta, do którego należy.</p><button class="primary-button" data-quiz="ability">ZAGRAJ <span>↗</span></button></article><article class="practice-card"><div class="practice-symbol roles-practice"><div>4</div></div><div class="eyebrow small"><span></span> ROLE AGENTÓW</div><h2>Jaka to <em>rola?</em></h2><p>Wskaż rolę agenta na podstawie jego portretu.</p><button class="primary-button" data-quiz="role">ZAGRAJ <span>↗</span></button></article></div><p class="practice-footnote">Postęp lekcji zapisuje się w tej przeglądarce na tym urządzeniu.</p>`;
  bindScreenActions();
}
function bindScreenActions() {
  root.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.go)));
  bindQuizButtons(root);
}
function bindQuizButtons(scope) {
  scope.querySelectorAll('[data-quiz]').forEach(button => { if (button.dataset.quizBound) return; button.dataset.quizBound = '1'; button.addEventListener('click', () => startQuiz(button.dataset.quiz)); });
}
function showScreen(screen) {
  updateNav(screen);
  if (screen === 'roles') renderRoles();
  else if (screen === 'agents') renderAgents();
  else if (screen === 'practice') renderPractice();
  else if (screen === 'extras') renderExtras();
  else renderOverview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function makeQuestions(type) {
  if (type === 'role') {
    return shuffle(agents).slice(0, 8).map(agent => {
      const options = shuffle(roles);
      return { prompt: `Którą rolę pełni ${agent.name}?`, image: agent.portrait, alt: `Portret agenta ${agent.name}`, options, correct: options.indexOf(agent.role), why: `${agent.name} to ${agent.role}. ${agent.roleDescription}` };
    });
  }
  if (type === 'ability') {
    const pool = agents.flatMap(agent => agent.abilities.filter(ability => ability.icon).map(ability => ({ agent, ability })));
    const iconQuestions = shuffle(pool).slice(0, 5).map(({agent,ability}) => {
      const wrong = shuffle(agents.filter(other => other.id !== agent.id)).slice(0, 3).map(other => other.name);
      const options = shuffle([agent.name, ...wrong]);
      const short = ability.description.length > 220 ? `${ability.description.slice(0, 217).trim()}…` : ability.description;
      return { prompt: 'Czyja to umiejętność?', image: ability.icon, alt: `Ikona umiejętności ${ability.name}`, options, correct: options.indexOf(agent.name), why: `${ability.name} to umiejętność agenta ${agent.name}. ${short}` };
    });
    const clipPool = window.COURSE_SKILL_CLIPS || [];
    const videoQuestions = shuffle(clipPool).slice(0, 5).map(clip => {
      const agent = agents.find(item => item.name === clip.agent);
      if (!agent) return null;
      const wrong = shuffle(agents.filter(other => other.id !== agent.id)).slice(0, 3).map(other => other.name);
      const options = shuffle([agent.name, ...wrong]);
      return { prompt: 'Czyja to umiejętność?', videoId: clip.id, alt: `Film pokazujący umiejętność ${clip.title} agenta ${agent.name}`, options, correct: options.indexOf(agent.name), why: `${clip.title} to umiejętność agenta ${agent.name}.` };
    }).filter(Boolean);
    return shuffle([...iconQuestions, ...videoQuestions]);
  }
  if (type === 'portrait') {
    return shuffle(agents).slice(0, 10).map(agent => {
      const wrong = shuffle(agents.filter(other => other.id !== agent.id)).slice(0, 3).map(other => other.name);
      const options = shuffle([agent.name, ...wrong]);
      return { prompt: 'Kto jest na portrecie?', image: agent.portrait, alt: 'Portret agenta', options, correct: options.indexOf(agent.name), why: `To ${agent.name}, agent z rolą ${agent.role}.` };
    });
  }
  return [];
}
function startQuiz(type) {
  const dialog = document.querySelector('#quiz-dialog');
  const labels = { role: ['QUIZ · ROLE', 'Dopasuj agenta do roli', 'role'], ability: ['QUIZ · UMIEJĘTNOŚCI', 'Czyja to umiejętność?', 'agents'], portrait: ['TRENING · PORTRETY', 'Rozpoznaj agenta', null] };
  const [label,title,progressId] = labels[type] || labels.role;
  activeQuiz = { type, progressId };
  questionSet = makeQuestions(type); questionIndex = 0; score = 0; selectedAnswer = null; answered = false;
  document.querySelector('#dialog-kicker').textContent = label;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#quiz-label').textContent = '✳ PYTANIE';
  document.querySelector('#quiz').style.display = '';
  dialog.showModal();
  renderQuestion();
}
function renderQuestion() {
  const question = questionSet[questionIndex];
  selectedAnswer = null; answered = false;
  document.querySelector('#quiz-counter').textContent = `${questionIndex + 1} / ${questionSet.length}`;
  document.querySelector('#quiz-question').textContent = question.prompt;
  const quizMedia = question.videoId
    ? `<div class="question-art question-video-art"><iframe src="https://drive.google.com/file/d/${encodeURIComponent(question.videoId)}/preview" title="${esc(question.alt)}" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`
    : `<div class="question-art ${activeQuiz.type === 'ability' ? 'question-icon-art' : ''}"><img src="${esc(question.image)}" alt="${esc(question.alt)}"></div>`;
  document.querySelector('#quiz-media').innerHTML = quizMedia;
  document.querySelector('#quiz-feedback').textContent = '';
  const options = document.querySelector('#quiz-options');
  options.innerHTML = question.options.map((answer,i)=>`<button class="quiz-option" data-answer="${i}"><span class="answer-letter">${String.fromCharCode(65+i)}.</span> ${esc(answer)}</button>`).join('');
  options.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
    if (answered) return;
    selectedAnswer = Number(button.dataset.answer);
    options.querySelectorAll('.quiz-option').forEach(el => el.classList.toggle('selected', el === button));
    document.querySelector('#quiz-next').disabled = false;
  }));
  const next = document.querySelector('#quiz-next');
  next.disabled = true; next.classList.remove('next-mode'); next.innerHTML = 'SPRAWDŹ ODPOWIEDŹ <span>↗</span>';
}
function finishQuiz() {
  const dialog = document.querySelector('#quiz-dialog');
  const pct = Math.round(score / questionSet.length * 100);
  if (activeQuiz.progressId && pct >= 60) { completed.add(activeQuiz.progressId); saveProgress(); }
  if (activeQuiz.type === 'portrait') {
    saved.bestGuess = Math.max(saved.bestGuess || 0, score);
    localStorage.setItem(storageKey, JSON.stringify({ completed: [...completed], bestGuess: saved.bestGuess }));
  }
  document.querySelector('#dialog-kicker').textContent = 'WYNIK TRENINGU';
  document.querySelector('#dialog-title').textContent = `${score} / ${questionSet.length} poprawnych`;
  document.querySelector('#quiz-media').innerHTML = '';
  document.querySelector('#quiz-question').textContent = pct >= 80 ? 'Świetna robota — widać, że kojarzysz temat.' : pct >= 60 ? 'Dobra powtórka. Możesz wrócić do materiału i spróbować ponownie.' : 'Warto jeszcze raz przejrzeć lekcję. Następnym razem pójdzie lepiej.';
  document.querySelector('#quiz-options').innerHTML = `<div class="lesson-done">${activeQuiz.type === 'portrait' ? `Twój najlepszy wynik w tej przeglądarce: ${saved.bestGuess || score} / 10.` : 'Wynik od 60% zapisuje ukończenie quizu w postępie kursu.'}</div>`;
  document.querySelector('#quiz-feedback').textContent = '';
  const next = document.querySelector('#quiz-next');
  next.disabled = false; next.classList.add('next-mode'); next.innerHTML = 'ZAGRAJ PONOWNIE <span>↻</span>';
  next.onclick = () => { next.onclick = null; document.querySelector('#quiz-dialog').close(); startQuiz(activeQuiz.type); };
}
const quizNext = document.querySelector('#quiz-next');
quizNext.addEventListener('click', () => {
  if (quizNext.onclick) return;
  if (!answered) {
    if (selectedAnswer === null) return;
    answered = true;
    const question = questionSet[questionIndex];
    const options = document.querySelector('#quiz-options');
    options.querySelectorAll('.quiz-option').forEach((el,i)=>{
      if (i === question.correct) el.classList.add('correct');
      else if (i === selectedAnswer) el.classList.add('wrong');
    });
    if (selectedAnswer === question.correct) score++;
    document.querySelector('#quiz-feedback').textContent = `${selectedAnswer === question.correct ? '✓ Dobrze! ' : '↗ Poprawna odpowiedź: '}${selectedAnswer === question.correct ? question.why : `${question.options[question.correct]}. ${question.why}`}`;
    quizNext.classList.add('next-mode');
    quizNext.innerHTML = questionIndex === questionSet.length - 1 ? 'ZOBACZ WYNIK <span>✓</span>' : 'NASTĘPNE PYTANIE <span>↗</span>';
    return;
  }
  if (questionIndex < questionSet.length - 1) { questionIndex++; renderQuestion(); }
  else finishQuiz();
});
document.querySelector('#close-dialog').addEventListener('click', () => { quizNext.onclick = null; document.querySelector('#quiz-dialog').close(); });
document.querySelector('#quiz-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) { quizNext.onclick = null; event.currentTarget.close(); } });
navButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.nav)));
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); showScreen('overview'); });
showScreen('overview');

