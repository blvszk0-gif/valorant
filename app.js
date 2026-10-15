const agents = window.VALORANT_DATA || [];
const root = document.querySelector('#screen-root');
const navButtons = [...document.querySelectorAll('[data-nav]')];
const gameTabs = [...document.querySelectorAll('[data-game]')];
const appShell = document.querySelector('.app-shell');
let activeGame = 'valorant';
const roles = ['Inicjator', 'Szturmowiec', 'Strażnik', 'Kontroler'];
const roleEnglishNames = { Inicjator: 'Initiator', Szturmowiec: 'Duelist', Strażnik: 'Sentinel', Kontroler: 'Controller' };
function roleDisplayName(role) { return `${role} / ${roleEnglishNames[role] || role}`; }
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
let selectedMapTile = null;
let mapPuzzleChecked = false;
let mapCatalogPromise;
let weaponCatalogPromise;
let rankCatalogPromise;
let abilityEnglishNamesPromise;
let activeMap = null;
let activeMapRound = [];
const mapRoundPools = new Map();

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
function showToast(message) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3000);
}
function updateNav(screen) {
  activeScreen = screen;
  const navScreen = screen === 'map-practice' ? 'practice' : screen;
  navButtons.forEach(button => button.classList.toggle('active', button.dataset.nav === navScreen));
  const names = { overview: 'START', roles: 'LEKCJA 1 / ROLE', agents: 'LEKCJA 2 / AGENCI', maps: 'LEKCJA 3 / MAPY', ranks: 'LEKCJA 4 / RANGI', weapons: 'ARSENAŁ', practice: 'TRENING', 'map-practice': 'TRENING / MAPY', extras: 'DODATKOWE LEKCJE', glossary: 'SŁOWNIK', 'fortnite-glossary': 'FORTNITE / SŁOWNIK' };
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
  const total = 4;
  const percent = Math.round(done / total * 100);
  return `<section class="progress-strip"><div class="progress-copy"><div class="progress-title">TWÓJ POSTĘP <span>${done} / ${total} LEKCJE UKOŃCZONE</span></div><div class="progress-track"><span style="width:${percent}%"></span></div></div><div class="progress-badge"><span>◈</span><div><b>${percent}%</b><small>KURSU GŁÓWNEGO</small></div></div></section>`;
}
function renderOverview() {
  root.innerHTML = `
    <section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> KURS DLA POCZĄTKUJĄCYCH <span class="eyebrow-line"></span></div><h1>OGARNIJ<br><em>VALORANTA.</em></h1><p>Poznaj role, agentów, mapy i system rang. Krótkie quizy pomogą Ci utrwalić najważniejsze informacje.</p><button class="primary-button" data-go="roles">ZACZNIJ OD RÓL <span>↗</span></button><div class="hero-meta"><span>◷ W TWOIM TEMPIE</span><span>✳ 29 AGENTÓW</span><span>⌁ QUIZY 4-ODPOWIEDZIOWE</span></div></div><div class="hero-art" aria-hidden="true"><div class="art-grid"></div><div class="crosshair">+</div><div class="orbital orbital-one"></div><div class="orbital orbital-two"></div><div class="art-ring"><div class="art-core"><span class="core-top">SPIKE</span><span class="core-glyph">S</span><span class="core-bottom">TRAINING</span></div></div><div class="art-tag tag-top">TACTICAL <b>5v5</b></div><div class="art-tag tag-bottom"><span class="pulse"></span> READY WHEN YOU ARE</div><div class="art-corner"></div></div><div class="hero-side-label">TRAINING PROTOCOL <span>///</span> 001</div></section>
    ${progressMarkup()}
    <section class="course-section"><div class="section-head"><div><div class="eyebrow small"><span></span> TWOJA ŚCIEŻKA</div><h2>Zacznij od <em>podstaw.</em></h2></div><span class="section-count">01 — 04</span></div><div class="course-cards">
      <button class="course-card role-course" data-go="roles"><span class="course-number">LEKCJA 01</span><img src="valorant_role_jpg/Inicjator_rola.jpg" alt="" class="course-symbol"><span class="course-card-copy"><b>Role agentów</b><small>Poznaj cztery role i sprawdź się w quizie.</small></span><span class="course-arrow">↗</span></button>
      <button class="course-card agent-course" data-go="agents"><span class="course-number">LEKCJA 02</span><img src="valorant_portrety_agentow_jpg/Gekko_portret.jpg" alt="" class="course-symbol portrait-symbol"><span class="course-card-copy"><b>Agenci i umiejętności</b><small>29 nagrań, atlas postaci i quiz rozpoznawania umiejętności.</small></span><span class="course-arrow">↗</span></button>
      <button class="course-card map-course" data-go="maps"><span class="course-number">LEKCJA 03</span><span class="course-symbol map-course-symbol">⌖</span><span class="course-card-copy"><b>Mapy i callouty</b><small>Naucz się wszystkich miejsc na mapach, a potem sprawdź pamięć w quizie.</small></span><span class="course-arrow">↗</span></button>
      <button class="course-card rank-course" data-go="ranks"><span class="course-number">LEKCJA 04</span><span class="course-symbol rank-course-symbol">★</span><span class="course-card-copy"><b>Rangi i RR</b><small>Poznaj stopnie rang, progi punktowe Immortala i warunki wejścia do Radianta.</small></span><span class="course-arrow">↗</span></button>
    </div></section>
    <section class="home-bottom"><div class="home-panel"><div class="eyebrow small"><span></span> POWTÓRKA</div><h2>Krótki trening <em>pamięci.</em></h2><p>Rozpoznawaj agentów po portretach albo zgaduj, kto ma pokazaną umiejętność.</p><button class="secondary-button" data-go="practice">OTWÓRZ TRENING <span>↗</span></button></div><div class="home-panel extra-home"><div class="eyebrow small"><span></span> DODATKOWY MATERIAŁ</div><h2>Broń, mapy <em>i rozgrywka.</em></h2><p>Twoje nagrania z kolejnych części szkolenia są dostępne jako dodatkowe lekcje.</p><button class="secondary-button" data-go="extras">ZOBACZ 13 NAGRAŃ <span>↗</span></button></div></section>`;
  bindScreenActions();
}
function renderRoles() {
  const cards = roles.map(role => {
    const info = roleInfo[role];
    const exampleAgent = agents.find(agent => agent.role === role);
    const description = exampleAgent?.roleDescription || '';
    return `<article class="role-card"><img src="${esc(info.icon)}" alt="Ikona roli ${esc(roleDisplayName(role))}"><div><h3>${esc(roleDisplayName(role))}</h3><p>${esc(description)}</p><small>PRZYKŁADY · ${esc(info.examples)}</small></div></article>`;
  }).join('');
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA 01 · ROLE</div><h1>CZTERY ROLE.<br><em>JEDNA DRUŻYNA.</em></h1><p>Obejrzyj nagranie, poznaj zadania każdej roli, a potem dopasuj agentów do ich specjalizacji.</p></section><section class="lesson-layout"><div class="lesson-main">${videoMarkup('edytowane/1.mp4','Lekcja 1 — role agentów')}<div class="lesson-note"><span>✳</span><p>Role opisują, jak agent najczęściej wspiera drużynę. Nie są sztywnymi zasadami — każdy agent może pomagać na różne sposoby.</p></div></div><aside class="lesson-aside"><div class="aside-kicker">W TEJ LEKCJI</div><h2>Zapamiętaj <em>cztery role.</em></h2><p>Wypatruj ich zadań, kiedy poznajesz kolejnych agentów.</p><button class="primary-button" data-quiz="role">ROZPOCZNIJ QUIZ <span>↗</span></button><div class="aside-meta">8 PYTAŃ · 4 ODPOWIEDZI DO WYBORU</div></aside></section><section class="roles-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PODSTAWY</div><h2>Kto za co <em>odpowiada?</em></h2></div></div><div class="role-grid">${cards}</div></section>`;
  bindScreenActions();
}
function renderAgentGrid(filter = '') {
  const grid = document.querySelector('#agent-grid');
  if (!grid) return;
  const query = filter.trim().toLocaleLowerCase('pl');
  const shown = agents.filter(a => a.name.toLocaleLowerCase('pl').includes(query) || roleDisplayName(a.role).toLocaleLowerCase('pl').includes(query));
  grid.innerHTML = shown.map(agent => `<button class="agent-tile ${selectedAgent?.id === agent.id ? 'selected' : ''}" data-agent="${esc(agent.id)}"><img src="${esc(agent.portrait)}" alt=""><span><b>${esc(agent.name)}</b><small>${esc(roleDisplayName(agent.role))}</small></span><i>↗</i></button>`).join('') || '<p class="empty-state">Nie znaleziono agenta.</p>';
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
  const skills = a.abilities.map(ability => `<article class="ability-card"><div class="ability-icon-wrap">${ability.icon ? `<img src="${esc(ability.icon)}" alt="Ikona ${esc(ability.name)}">` : '<span class="passive-icon">PASSIVE</span>'}</div><div><div class="ability-slot">${esc(slotName(ability.slot))}</div><h3>${esc(abilityDisplayName(ability))}</h3><p>${esc(ability.description)}</p></div></article>`).join('');
  box.innerHTML = `<div class="agent-detail-head"><div><div class="eyebrow small"><span></span> ${esc(roleDisplayName(a.role))}</div><h2>${esc(a.name)}</h2><p>${esc(a.description)}</p></div><img class="agent-detail-portrait" src="${esc(a.portrait)}" alt="Portret agenta ${esc(a.name)}"></div><div class="agent-detail-video">${videoMarkup(a.video,`Lekcja agenta — ${a.name}`,a.portrait)}</div><div class="section-head ability-heading"><div><div class="eyebrow small"><span></span> ZESTAW UMIEJĘTNOŚCI</div><h2>Co potrafi <em>${esc(a.name)}?</em></h2></div><button class="secondary-button" data-quiz="ability">QUIZ UMIEJĘTNOŚCI ↗</button></div><div class="ability-grid">${skills}</div>`;
  bindQuizButtons(box);
}
function slotName(slot) {
  return ({ Ability1: 'UMIEJĘTNOŚĆ 1', Ability2: 'UMIEJĘTNOŚĆ 2', Grenade: 'UMIEJĘTNOŚĆ POD Z', Ultimate: 'ULTIMATE', Passive: 'PASYWNA' })[slot] || slot.toUpperCase();
}
function abilityDisplayName(ability) {
  return ability.englishName && ability.englishName.toLocaleLowerCase('en') !== ability.name.toLocaleLowerCase('en')
    ? `${ability.name} / ${ability.englishName}` : ability.name;
}
function applyAbilityEnglishNames(nameMap) {
  agents.forEach(agent => {
    const names = nameMap.get(agent.name.toLocaleLowerCase('en'));
    if (!names) return;
    agent.abilities.forEach(ability => { ability.englishName = names.get(ability.slot) || ability.englishName || ''; });
  });
}
function loadAbilityEnglishNames() {
  if (!abilityEnglishNamesPromise) abilityEnglishNamesPromise = fetch('https://valorant-api.com/v1/agents?language=en-US&isPlayableCharacter=true')
    .then(response => { if (!response.ok) throw new Error('Nie udało się pobrać angielskich nazw umiejętności.'); return response.json(); })
    .then(payload => new Map((payload.data || []).map(agent => [agent.displayName.toLocaleLowerCase('en'), new Map((agent.abilities || []).filter(ability => ability.slot && ability.displayName).map(ability => [ability.slot, ability.displayName]))])))
    .catch(error => { abilityEnglishNamesPromise = null; throw error; });
  return abilityEnglishNamesPromise;
}
function renderAgents() {
  if (!selectedAgent) selectedAgent = agents[0];
  root.innerHTML = `<section class="page-intro agent-intro"><div><div class="eyebrow"><span></span> LEKCJA 02 · AGENCI</div><h1>POZNAJ <em>AGENTÓW.</em></h1><p>Wybierz postać, obejrzyj Twoje nagranie i zobacz jej zestaw umiejętności. Na końcu rozpoznaj umiejętności po ikonce.</p></div><button class="primary-button" data-quiz="ability">QUIZ: CZYJA TO UMIEJĘTNOŚĆ? <span>↗</span></button></section><div class="agent-browser"><section class="agent-list-panel"><div class="agent-list-head"><h2>ATLAS AGENTÓW <span>${agents.length}</span></h2><input id="agent-search" type="search" placeholder="Szukaj agenta lub roli" aria-label="Szukaj agenta lub roli"></div><div id="agent-grid" class="agent-grid"></div></section><section id="agent-detail" class="agent-detail-panel"></section></div>`;
  renderAgentGrid();
  renderAgentDetail();
  loadAbilityEnglishNames().then(applyAbilityEnglishNames).then(() => { if (activeScreen === 'agents') renderAgentDetail(); }).catch(() => {});
  document.querySelector('#agent-search').addEventListener('input', event => renderAgentGrid(event.target.value));
  bindScreenActions();
}
function renderExtras() {
  const groups = [...new Set(extraLessons.map(x => x.group))];
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> DODATKOWA NAUKA</div><h1>WIEDZA Z <em>ROZGRYWKI.</em></h1><p>Po rolach i agentach możesz przejść do zakupów, broni, interfejsu i przykładów gry na mapie.</p></section><div class="extras-groups">${groups.map(group => `<section class="extra-group"><div class="section-head"><div><div class="eyebrow small"><span></span> ${esc(group)}</div><h2>${group.includes('BRONIE') ? 'Broń i <em>pancerz.</em>' : 'Poznaj <em>mecz.</em>'}</h2></div><span class="section-count">${extraLessons.filter(x => x.group === group).length} NAGRAŃ</span></div><div class="extra-list">${extraLessons.filter(x => x.group === group).map(item => `<details class="extra-video-card"><summary><span class="extra-number">${esc(item.id)}</span><span class="extra-title"><b>${esc(item.title)}</b><small>${esc(item.note)}</small></span><span class="extra-play">▶</span></summary><div class="extra-player">${videoMarkup(`edytowane/${item.file}`,`${item.id} — ${item.title}`)}</div></details>`).join('')}</div></section>`).join('')}</div>`;
}
function renderGlossary() {
  updateNav('glossary');
  const entries = [...(window.VALORANT_GLOSSARY || [])];
  agents.forEach(agent => {
    entries.push({ term: agent.name, category: 'Agenci i umiejętności', also: roleDisplayName(agent.role), definition: agent.description || `Agent z rolą ${roleDisplayName(agent.role)}.` });
    (agent.abilities || []).forEach(ability => entries.push({ term: abilityDisplayName(ability), category: 'Agenci i umiejętności', also: agent.name, definition: `${agent.name} · ${slotName(ability.slot || 'Ability')}. ${ability.description || 'Umiejętność agenta.'}` }));
  });
  entries.sort((a,b) => a.term.localeCompare(b.term, 'pl'));
  const categories = ['Wszystkie', ...new Set(entries.map(item => item.category).sort((a,b) => a.localeCompare(b, 'pl')))];
  root.innerHTML = `<section class="page-intro"><div><div class="eyebrow"><span></span> MATERIAŁ POMOCNICZY</div><h1>SŁOWNIK <em>VALORANTA.</em></h1><p>Angielskie nazwy, skróty i określenia używane w grze oraz w lekcjach. Wpisz hasło albo wybierz kategorię.</p></div><button class="primary-button" data-quiz="glossary">QUIZ ZE SŁOWNIKA <span>↗</span></button></section><section class="glossary-tools"><label class="glossary-search-wrap"><span>⌕</span><input id="glossary-search" type="search" placeholder="Szukaj hasła, skrótu lub opisu…" aria-label="Szukaj w słowniku"></label><div class="glossary-categories" role="group" aria-label="Kategorie słownika">${categories.map((category,index)=>`<button class="glossary-filter ${index===0?'active':''}" data-category="${esc(category)}">${esc(category)}</button>`).join('')}</div><p class="glossary-count" id="glossary-count" aria-live="polite"></p><div class="glossary-list" id="glossary-list"></div></section><p class="glossary-source">Słownik bazuje na materiałach kursu i <a href="https://playvalorant.com/en-us/news/announcements/beginners-guide/" target="_blank" rel="noreferrer">oficjalnym poradniku początkującego Riot Games ↗</a>. Slang może się różnić między graczami.</p>`;
  bindQuizButtons(root);
  const search = root.querySelector('#glossary-search');
  const list = root.querySelector('#glossary-list');
  const count = root.querySelector('#glossary-count');
  const normalize = value => String(value).toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let selectedCategory = 'Wszystkie';
  const updateResults = () => {
    const query = normalize(search.value.trim());
    const visible = entries.filter(item => (selectedCategory === 'Wszystkie' || item.category === selectedCategory)
      && normalize(`${item.term} ${item.also || ''} ${item.definition}`).includes(query));
    count.textContent = `${visible.length} ${visible.length === 1 ? 'hasło' : 'haseł'}`;
    list.innerHTML = visible.length ? visible.map(item => `<article class="glossary-entry"><div class="glossary-entry-head"><h2>${esc(item.term)}</h2><span>${esc(item.category)}</span></div>${item.also ? `<div class="glossary-also">${esc(item.also)}</div>` : ''}<p>${esc(item.definition)}</p></article>`).join('') : '<p class="empty-state">Nie znaleziono takiego hasła.</p>';
  };
  search.addEventListener('input', updateResults);
  root.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    root.querySelectorAll('[data-category]').forEach(filter => filter.classList.toggle('active', filter === button));
    updateResults();
  }));
  updateResults();
}
function renderFortniteGlossary() {
  const glossary = window.EXTRA_GAME_COURSES?.fortnite?.glossary || [];
  updateNav('fortnite-glossary');
  const entries = [...glossary].sort((a,b) => a.term.localeCompare(b.term, 'en'));
  const categories = ['Wszystkie', ...new Set(entries.map(item => item.category).sort((a,b) => a.localeCompare(b, 'pl')))];
  const game = window.EXTRA_GAME_COURSES.fortnite;
  root.innerHTML = `<section class="page-intro"><div><div class="eyebrow"><span></span> MATERIAŁ POMOCNICZY · FORTNITE</div><h1>SŁOWNIK <em>FORTNITE.</em></h1><p>Angielskie nazwy, skróty i określenia używane w Fortnite — z krótkimi objaśnieniami po polsku. Wpisz hasło albo wybierz kategorię.</p></div><button class="primary-button" data-quiz="fortnite-glossary">QUIZ ZE SŁOWNIKA <span>↗</span></button></section><section class="glossary-tools"><label class="glossary-search-wrap"><span>⌕</span><input id="glossary-search" type="search" placeholder="Szukaj hasła, skrótu lub opisu…" aria-label="Szukaj w słowniku Fortnite"></label><div class="glossary-categories" role="group" aria-label="Kategorie słownika Fortnite">${categories.map((category,index)=>`<button class="glossary-filter ${index===0?'active':''}" data-category="${esc(category)}">${esc(category)}</button>`).join('')}</div><p class="glossary-count" id="glossary-count" aria-live="polite"></p><div class="glossary-list" id="glossary-list"></div></section><p class="glossary-source">To praktyczny słownik podstawowych i często używanych pojęć. Dostępność trybów, przedmiotów i części zasad może zmieniać się między sezonami. Źródła oficjalne: ${game.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noreferrer">${esc(source.label)} ↗</a>`).join(' · ')}.</p><button class="secondary-button" data-return-fortnite>← WRÓĆ DO FORTNITE</button>`;
  bindScreenActions();
  const search = root.querySelector('#glossary-search');
  const list = root.querySelector('#glossary-list');
  const count = root.querySelector('#glossary-count');
  const normalize = value => String(value).toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let selectedCategory = 'Wszystkie';
  const updateResults = () => {
    const query = normalize(search.value.trim());
    const visible = entries.filter(item => (selectedCategory === 'Wszystkie' || item.category === selectedCategory)
      && normalize(`${item.term} ${item.also || ''} ${item.definition}`).includes(query));
    count.textContent = `${visible.length} ${visible.length === 1 ? 'hasło' : 'haseł'}`;
    list.innerHTML = visible.length ? visible.map(item => `<article class="glossary-entry"><div class="glossary-entry-head"><h2>${esc(item.term)}</h2><span>${esc(item.category)}</span></div>${item.also ? `<div class="glossary-also">${esc(item.also)}</div>` : ''}<p>${esc(item.definition)}</p></article>`).join('') : '<p class="empty-state">Nie znaleziono takiego hasła.</p>';
  };
  search.addEventListener('input', updateResults);
  root.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    root.querySelectorAll('[data-category]').forEach(filter => filter.classList.toggle('active', filter === button));
    updateResults();
  }));
  updateResults();
}
async function loadWeaponCatalog() {
  if (!weaponCatalogPromise) weaponCatalogPromise = fetch('https://valorant-api.com/v1/weapons?language=en-US')
    .then(response => { if (!response.ok) throw new Error('Nie udało się pobrać arsenału.'); return response.json(); })
    .then(payload => (payload.data || []).filter(item => item.displayName && (item.displayIcon || item.killStreamIcon))
      .map(item => ({ id: item.uuid, name: item.displayName, category: String(item.category || 'Weapon').split('::').pop(), image: item.displayIcon || item.killStreamIcon, cost: item.shopData?.cost ?? null, damageRanges: item.weaponStats?.damageRanges || [], magazineSize: item.weaponStats?.magazineSize ?? null, fireRate: item.weaponStats?.fireRate ?? null }))
      .sort((a,b) => a.category.localeCompare(b.category, 'en') || a.name.localeCompare(b.name, 'en')))
    .catch(error => { weaponCatalogPromise = null; throw error; });
  return weaponCatalogPromise;
}
async function loadRankCatalog() {
  if (!rankCatalogPromise) rankCatalogPromise = fetch('https://valorant-api.com/v1/competitivetiers?language=en-US')
    .then(response => { if (!response.ok) throw new Error('Nie udało się pobrać rang.'); return response.json(); })
    .then(payload => {
      const sets = payload.data || [];
      const latest = sets[sets.length - 1]?.tiers || [];
      return latest.filter(tier => tier.tierName && !['Unused', 'Unranked'].includes(tier.tierName) && (tier.largeIcon || tier.smallIcon))
        .map(tier => ({ id: String(tier.tier), name: tier.tierName, image: tier.largeIcon || tier.smallIcon }));
    })
    .catch(error => { rankCatalogPromise = null; throw error; });
  return rankCatalogPromise;
}
async function renderWeapons() {
  updateNav('weapons');
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> ATLAS SPRZĘTU</div><h1>ARSENAŁ <em>VALORANTA.</em></h1><p>Przejrzyj obrazki broni i ich nazwy, a potem sprawdź się w quizie rozpoznawania.</p></section><p class="map-loading">Ładowanie broni…</p>`;
  try {
    const weapons = await loadWeaponCatalog();
    if (activeScreen !== 'weapons') return;
    root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> ATLAS SPRZĘTU</div><h1>ARSENAŁ <em>VALORANTA.</em></h1><p>Obrazki i nazwy broni, uporządkowane według kategorii. Gdy je poznasz, sprawdź się w quizie.</p><button class="primary-button" data-quiz="weapon">QUIZ: JAKA TO BROŃ? <span>↗</span></button></section><div class="weapon-tools"><input id="weapon-search" type="search" placeholder="Szukaj broni lub kategorii…" aria-label="Szukaj broni"><span id="weapon-count"></span></div><div class="weapon-grid" id="weapon-grid"></div><p class="glossary-source">Grafiki i nazwy pochodzą z <a href="https://valorant-api.com/v1/weapons" target="_blank" rel="noreferrer">Valorant API ↗</a>.</p>`;
    bindQuizButtons(root);
    const search = root.querySelector('#weapon-search');
    const grid = root.querySelector('#weapon-grid');
    const count = root.querySelector('#weapon-count');
    const normalize = value => String(value).toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const update = () => {
      const query = normalize(search.value.trim());
      const filtered = weapons.filter(item => normalize(`${item.name} ${item.category}`).includes(query));
      count.textContent = `${filtered.length} / ${weapons.length} broni`;
      grid.innerHTML = filtered.length ? filtered.map(item => `<button type="button" class="weapon-card" data-weapon-id="${esc(item.id)}" aria-label="Zobacz statystyki: ${esc(item.name)}"><span class="weapon-art"><img src="${esc(item.image)}" alt="" loading="lazy"></span><span class="weapon-card-copy"><span>${esc(item.category)}</span><h2>${esc(item.name)}</h2><small>ZOBACZ STATYSTYKI ↗</small></span></button>`).join('') : '<p class="empty-state">Nie znaleziono broni.</p>';
      grid.querySelectorAll('[data-weapon-id]').forEach(card => card.addEventListener('click', () => showWeaponDetails(weapons.find(item => item.id === card.dataset.weaponId))));
    };
    search.addEventListener('input', update);
    update();
  } catch (error) {
    const loading = root.querySelector('.map-loading');
    if (loading) loading.textContent = 'Nie udało się pobrać arsenału. Sprawdź połączenie z internetem i spróbuj ponownie.';
  }
}
function showWeaponDetails(weapon) {
  if (!weapon) return;
  const dialog = document.querySelector('#weapon-dialog');
  const number = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('pl-PL', { maximumFractionDigits: 1 }) : '—';
  const distance = range => `${number(range.rangeStartMeters)}–${number(range.rangeEndMeters)} m`;
  document.querySelector('#weapon-detail-kicker').textContent = weapon.category.toLocaleUpperCase('pl');
  document.querySelector('#weapon-detail-title').textContent = weapon.name;
  document.querySelector('#weapon-detail-image').src = weapon.image;
  document.querySelector('#weapon-detail-image').alt = weapon.name;
  document.querySelector('#weapon-detail-cost').textContent = weapon.cost === null ? 'Brak danych' : `${number(weapon.cost)} kredytów`;
  document.querySelector('#weapon-detail-fire-rate').textContent = weapon.fireRate === null ? '—' : `${number(weapon.fireRate)} strz./s`;
  document.querySelector('#weapon-detail-magazine').textContent = weapon.magazineSize === null ? '—' : `${number(weapon.magazineSize)} nabojów`;
  const body = document.querySelector('#weapon-damage-rows');
  body.innerHTML = weapon.damageRanges.length ? weapon.damageRanges.map(range => `<tr><th scope="row">${esc(distance(range))}</th><td>${esc(number(range.headDamage))}</td><td>${esc(number(range.bodyDamage))}</td><td>${esc(number(range.legDamage))}</td></tr>`).join('') : '<tr><td colspan="4" class="weapon-no-damage">Dla tej broni API nie udostępnia tabeli obrażeń.</td></tr>';
  dialog.showModal();
}
function renderPractice() {
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> POWTÓRKA W FORMIE GRY</div><h1>ZGADNIJ, <em>KTO TO?</em></h1><p>Krótki trening w stylu zgadywanki: portret agenta, ikonka umiejętności, odznaka rangi, broń, pojęcia ze słowniczka albo przypisanie do roli. Każde pytanie ma cztery odpowiedzi.</p></section><div class="practice-grid"><article class="practice-card"><div class="practice-symbol portrait-practice"><img src="${esc(agents.find(a=>a.name==='Sova')?.portrait || agents[0].portrait)}" alt=""></div><div class="eyebrow small"><span></span> ROZPOZNAWANIE</div><h2>Kto to <em>jest?</em></h2><p>Rozpoznaj agentów po ich portretach. 10 pytań, cztery odpowiedzi.</p><button class="primary-button" data-quiz="portrait">ZAGRAJ <span>↗</span></button></article><article class="practice-card"><div class="practice-symbol skill-practice"><img src="${esc(agents.flatMap(a=>a.abilities).find(x=>x.icon)?.icon || '')}" alt=""></div><div class="eyebrow small"><span></span> IKONY UMIEJĘTNOŚCI</div><h2>Czyja to <em>umiejętność?</em></h2><p>Spójrz na ikonkę i wybierz agenta, do którego należy.</p><button class="primary-button" data-quiz="ability">ZAGRAJ <span>↗</span></button></article><article class="practice-card"><div class="practice-symbol roles-practice"><div>4</div></div><div class="eyebrow small"><span></span> ROLE AGENTÓW</div><h2>Jaka to <em>rola?</em></h2><p>Wskaż rolę agenta na podstawie jego portretu.</p><button class="primary-button" data-quiz="role">ZAGRAJ <span>↗</span></button></article><article class="practice-card map-practice-card"><div class="practice-symbol map-practice-symbol"><span>MAPY</span><b>A</b><b>B</b></div><div class="eyebrow small"><span></span> SPRAWDŹ SIĘ</div><h2>Callouty <em>map.</em></h2><p>Uzupełnij puste punkty z pamięci i sprawdź wynik. Każda runda losuje kolejne miejsca.</p><button class="primary-button" data-go="map-practice">WYBIERZ MAPĘ <span>↗</span></button></article><article class="practice-card weapon-practice-card"><div class="practice-symbol weapon-practice-symbol"><span>ARSENAŁ</span><b>V</b></div><div class="eyebrow small"><span></span> ROZPOZNAWANIE</div><h2>Jaka to <em>broń?</em></h2><p>Rozpoznaj broń na obrazku i wybierz jej nazwę spośród czterech odpowiedzi.</p><button class="primary-button" data-quiz="weapon">ZAGRAJ <span>↗</span></button></article><article class="practice-card glossary-practice-card"><div class="practice-symbol glossary-practice-symbol"><span>GG</span><b>ABC</b></div><div class="eyebrow small"><span></span> SŁOWNICZEK</div><h2>Co to za <em>pojęcie?</em></h2><p>Przeczytaj definicję i wybierz pasujące hasło spośród czterech odpowiedzi.</p><button class="primary-button" data-quiz="glossary">ZAGRAJ <span>↗</span></button></article><article class="practice-card rank-practice-card"><div class="practice-symbol rank-practice-symbol"><span>RANK</span><b>★</b></div><div class="eyebrow small"><span></span> ODCZYTYWANIE ODZNAK</div><h2>Jaka to <em>ranga?</em></h2><p>Najpierw poznaj stopnie i zasady RR, potem sprawdź pamięć w quizie.</p><button class="secondary-button rank-study-button" data-go="ranks">POZNAJ RANGI</button><button class="primary-button" data-quiz="rank">ZAGRAJ <span>↗</span></button></article></div><p class="practice-footnote">Postęp lekcji zapisuje się w tej przeglądarce na tym urządzeniu.</p>`;
  bindScreenActions();
}
function renderGameHub(gameId) {
  const game = window.EXTRA_GAME_COURSES?.[gameId];
  if (!game) return;
  activeScreen = 'game-hub';
  document.querySelector('#crumb').textContent = `${game.name.toLocaleUpperCase('pl')} / NAUKA`;
  const quizLength = Math.min(10, game.questions.length);
  const glossaryCallout = game.id === 'fortnite' ? `<section class="game-quiz-callout fortnite-glossary-callout"><div><div class="eyebrow small"><span></span> SŁOWNICZEK · ${game.glossary.length} HASEŁ</div><h2>Poznaj język <em>Fortnite.</em></h2><p>Wyszukuj pojęcia, filtruj kategorie i utrwalaj angielskie nazwy w quizie.</p></div><div class="fortnite-glossary-actions"><button class="secondary-button" data-go="fortnite-glossary">OTWÓRZ SŁOWNIK ↗</button><button class="primary-button" data-quiz="fortnite-glossary">QUIZ ZE SŁOWNIKA ↗</button></div></section>` : '';
  const lessonCards = game.id === 'fortnite'
    ? game.lessons.map((lesson,index) => {
      const fallbackArt = ['rifle', null, 'chest', 'map', 'map', 'vehicle', 'energy'][index];
      return `<article class="fortnite-topic-card ${index === 2 ? 'fortnite-loot-topic-card' : ''}"><div class="fortnite-topic-image"><img ${fallbackArt ? `data-fortnite-topic-fallback="${fallbackArt}"` : ''} src="${esc(lesson.image)}" alt="${esc(lesson.imageAlt)}" loading="lazy" referrerpolicy="no-referrer"></div><div class="fortnite-topic-copy"><div class="eyebrow small"><span></span> ${esc(lesson.label)}</div><h3>${esc(lesson.title)}</h3><p>${esc(lesson.text)}</p>${index === 0 ? '<button class="primary-button fortnite-open-lesson" data-go="fortnite-weapons">OTWÓRZ LEKCJĘ <span>↗</span></button>' : index === 1 ? '<button class="primary-button fortnite-open-lesson" data-go="fortnite-cosmetics">OTWÓRZ LEKCJĘ <span>↗</span></button>' : index === 2 ? '<button class="primary-button fortnite-open-lesson" data-go="fortnite-loot">OTWÓRZ LEKCJĘ <span>↗</span></button>' : index === 3 ? '<button class="primary-button fortnite-open-lesson" data-go="fortnite-modes">OTWÓRZ LEKCJĘ <span>↗</span></button>' : ''}<div class="fortnite-topic-tip"><b>Wskazówka</b><span>${esc(lesson.tip)}</span></div><a class="fortnite-image-source" href="${esc(lesson.imageUrl)}" target="_blank" rel="noreferrer">${index === 1 ? 'Zobacz sklep' : 'Zdjęcie: ' + esc(lesson.imageSource)} ↗</a></div></article>`;
    }).join('')
    : game.lessons.map((lesson,index) => `<details class="game-lesson" ${index === 0 ? 'open' : ''}><summary><span class="game-lesson-label">${esc(lesson.label)}</span><b>${esc(lesson.title)}</b><span class="game-lesson-toggle">＋</span></summary><div class="game-lesson-content"><p>${esc(lesson.text)}</p><div><b>Wskazówka</b><span>${esc(lesson.tip)}</span></div></div></details>`).join('');
  root.innerHTML = `<section class="game-course-page" data-game-course="${esc(game.id)}"><section class="game-course-hero"><div class="game-course-mark">${esc(game.logo).replace(/\n/g, '<br>')}</div><div class="game-course-copy"><div class="eyebrow"><span></span> ${esc(game.eyebrow)}</div><h1>POZNAJ <em>${esc(game.name)}.</em></h1><p>${esc(game.intro)}</p><button class="primary-button" data-quiz="${esc(game.id)}">QUIZ NA START · ${quizLength} PYTAŃ <span>↗</span></button></div></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PODSTAWY GRY</div><h2>Ucz się <em>krok po kroku.</em></h2></div><span class="section-count">${String(game.lessons.length).padStart(2, '0')} LEKCJI</span></div><div class="game-lesson-grid ${game.id === 'fortnite' ? 'fortnite-topic-grid' : ''}">${lessonCards}</div></section>${glossaryCallout}<section class="game-quiz-callout"><div><div class="eyebrow small"><span></span> SPRAWDŹ SIĘ</div><h2>Zapamiętałeś <em>podstawy?</em></h2><p>Odpowiedz na ${quizLength} losowanych pytań. Każde ma cztery odpowiedzi.</p></div><button class="primary-button" data-quiz="${esc(game.id)}">ROZPOCZNIJ QUIZ <span>↗</span></button></section><p class="game-source-list">Źródła oficjalne: ${game.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noreferrer">${esc(source.label)} ↗</a>`).join(' · ')}</p></section>`;
  bindScreenActions();
}
function fortniteIllustration(kind) {
  const bg = '<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#20343a"/><stop offset="1" stop-color="#0b1012"/></linearGradient><linearGradient id="item" x2="0" y2="1"><stop stop-color="#e6f5f8"/><stop offset="1" stop-color="#6b929d"/></linearGradient></defs><rect width="400" height="240" rx="18" fill="url(#bg)"/><circle cx="200" cy="120" r="84" fill="#55cfff" opacity=".08"/>';
  const weapon = (type) => {
    const barrel = type === 'pistol' ? '<rect x="245" y="102" width="80" height="13" rx="4"/>' : '<rect x="245" y="94" width="132" height="13" rx="4"/><rect x="135" y="101" width="45" height="15" rx="3"/>';
    const stock = type === 'pistol' ? '' : '<path d="M55 99h75v26H55l-24-13z"/>';
    const mag = ['rifle','smg','shotgun','sniper'].includes(type) ? '<path d="M188 130h26l-7 48h-25z"/>' : '';
    const scope = type === 'sniper' ? '<rect x="165" y="69" width="83" height="12" rx="5"/><rect x="192" y="60" width="27" height="30" rx="5"/>' : type==='rifle' ? '<rect x="177" y="81" width="36" height="10" rx="4"/>' : '';
    const grip = type === 'pistol' ? '<path d="M158 122h34l-10 42h-19z"/>' : '<path d="M230 119h25l-7 36h-22z"/>';
    const blade = type === 'blade' ? '<path d="M60 160 294 57l34 8-194 139-48-25z" fill="url(#item)"/><path d="m99 178-25 33 47-7 15-13z"/>' : '';
    const energy = type === 'energy' ? '<path d="m218 63 28 39-22 9 27 34-62-49 25-8z" fill="#55cfff"/><circle cx="223" cy="112" r="78" fill="#55cfff" opacity=".11"/>' : '';
    return `<g fill="#172125" stroke="url(#item)" stroke-width="4" stroke-linejoin="round">${stock}${barrel}<rect x="116" y="91" width="139" height="40" rx="8"/><rect x="123" y="99" width="90" height="7" rx="3" fill="#55cfff" stroke="none"/>${scope}${mag}${grip}${blade}${energy}</g>`;
  };
  const icons = {
    'rifle': weapon('rifle'), 'smg': weapon('smg'), 'pistol': weapon('pistol'), 'shotgun': weapon('shotgun'), 'sniper': weapon('sniper'), 'energy': weapon('energy'), 'blade': weapon('blade'),
    'chest': '<g stroke="#e8c36a" stroke-width="8" stroke-linejoin="round"><path d="M78 112q0-39 40-39h164q40 0 40 39v76H78z" fill="#a56b2a"/><path d="M78 117h244v76H78z" fill="#bd8439"/><path d="M178 120h44v73h-44z" fill="#e9c76e"/><path d="M104 93q10-34 48-34h106q38 0 48 34" fill="none"/></g><path d="M191 147h18v24h-18z" fill="#27363a"/>',
    'map': '<path d="m92 77 72-22 75 22 69-22v133l-69 22-75-22-72 22z" fill="#254b50" stroke="#8bd9e7" stroke-width="6"/><path d="m164 55v133m75-111v133" stroke="#8bd9e7" stroke-width="5"/><path d="m113 155 43-39 33 20 31-42 38 29 35-42" fill="none" stroke="#f0c466" stroke-width="8"/><circle cx="231" cy="94" r="10" fill="#ff6975"/>',
    'vehicle': '<g fill="#182326" stroke="#cdeaf0" stroke-width="6" stroke-linejoin="round"><path d="M76 145h24l18-52q7-20 28-20h95q20 0 33 19l31 45h26q12 0 12 13v31H71v-22q0-14 5-14z"/><path d="m138 88-15 44h76V82h-42q-13 0-19 6zm75-6v50h79l-28-38q-8-12-22-12z" fill="#31545e"/><circle cx="128" cy="177" r="22" fill="#101415"/><circle cx="292" cy="177" r="22" fill="#101415"/></g>',
    'ammo-light': '<g fill="#d5e7ea"><path d="M123 161v-53q0-24 18-24t18 24v53z"/><path d="M184 161v-53q0-24 18-24t18 24v53z"/><path d="M245 161v-53q0-24 18-24t18 24v53z"/></g><path d="M123 151h36m25 0h36m25 0h36" stroke="#55cfff" stroke-width="6"/>',
    'ammo-medium': '<g fill="#d5e7ea"><path d="M100 166v-61q0-30 19-30t19 30v61z"/><path d="M160 166v-61q0-30 19-30t19 30v61z"/><path d="M220 166v-61q0-30 19-30t19 30v61z"/><path d="M280 166v-61q0-30 19-30t19 30v61z"/></g><path d="M100 154h38m22 0h38m22 0h38m22 0h38" stroke="#f0b84d" stroke-width="6"/>',
    'ammo-shells': '<g><path d="M119 157V90q0-18 20-18t20 18v67z" fill="#d2e6e9"/><path d="M180 157V90q0-18 20-18t20 18v67z" fill="#d2e6e9"/><path d="M241 157V90q0-18 20-18t20 18v67z" fill="#d2e6e9"/><path d="M119 141h40m21 0h40m21 0h40" stroke="#d65e4f" stroke-width="17"/></g>',
    'ammo-heavy': '<g fill="#d5e7ea"><path d="M100 169V98q0-35 20-35t20 35v71z"/><path d="M165 169V98q0-35 20-35t20 35v71z"/><path d="M230 169V98q0-35 20-35t20 35v71z"/></g><path d="M100 155h40m25 0h40m25 0h40" stroke="#a9b4b7" stroke-width="7"/>',
    'ammo-rockets': '<g transform="rotate(-35 200 120)"><rect x="178" y="62" width="45" height="112" rx="20" fill="#d5e7ea"/><path d="M178 139h45l22 36h-89z" fill="#d65e4f"/><path d="M185 74h31" stroke="#f0b84d" stroke-width="9"/></g>',
    'ammo-energy': '<path d="m200 50 22 57 54 13-54 14-22 57-20-57-55-14 55-13z" fill="#55cfff"/><circle cx="200" cy="120" r="70" fill="none" stroke="#b3f0ff" stroke-width="5" opacity=".6"/>',
    'heal-medkit': '<rect x="108" y="72" width="184" height="118" rx="19" fill="#d4e6e8"/><rect x="166" y="56" width="68" height="30" rx="8" fill="#82999e"/><rect x="180" y="96" width="40" height="69" rx="5" fill="#d95754"/><rect x="165" y="111" width="70" height="39" rx="5" fill="#d95754"/>',
    'heal-bandage': '<g fill="#e0e8e8" stroke="#a9b8ba" stroke-width="5"><circle cx="150" cy="122" r="43"/><circle cx="250" cy="122" r="43"/></g><circle cx="150" cy="122" r="15" fill="#61777b"/><circle cx="250" cy="122" r="15" fill="#61777b"/><path d="M153 86h42v72h-42z" fill="#d7b98b"/>',
    'heal-mist': '<path d="M165 75h70v116h-70z" rx="14" fill="#b8d8c9"/><rect x="180" y="59" width="40" height="18" rx="5" fill="#d7e8df"/><path d="M194 112h13m-6-7v37" stroke="#55a777" stroke-width="9" stroke-linecap="round"/><path d="M138 101q-24 14 0 29m124-29q24 14 0 29" fill="none" stroke="#8be0aa" stroke-width="5"/>',
    'heal-mini': '<path d="M162 94h76v91q0 10-12 10h-52q-12 0-12-10z" fill="#9adcf4"/><rect x="171" y="70" width="58" height="28" rx="7" fill="#d9e9ed"/><path d="M164 137h72" stroke="#42a9d4" stroke-width="23"/>',
    'heal-shield': '<path d="M200 57 277 86v50q-7 49-77 76-70-27-77-76V86z" fill="#bce9f6"/><path d="M200 79 255 99v36q-6 34-55 55-49-21-55-55V99z" fill="#55cfff"/>',
    'heal-keg': '<path d="M152 77q48-29 96 0v105q-48 30-96 0z" fill="#80cfe8" stroke="#d2e7eb" stroke-width="6"/><path d="M152 99h96m-96 66h96" stroke="#285f76" stroke-width="13"/><path d="M180 117h40m-20-18v45" stroke="#d8f8ff" stroke-width="9"/>',
    'heal-slurp': '<path d="M173 72h54v20l21 26v65q0 12-12 12h-72q-12 0-12-12v-65l21-26z" fill="#80ddc2"/><path d="M157 145q43-21 86 0v37q0 12-12 12h-62q-12 0-12-12z" fill="#52b9d9"/><path d="M187 110h26" stroke="#d9fff6" stroke-width="8"/>'
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">${bg}${icons[kind] || icons['ammo-energy']}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
function fortniteWikiImage(file) {
  const images = {
    'Light Bullets - Ammo - Fortnite.png': 'https://static.wikia.nocookie.net/fortnite/images/f/ff/Light_Bullets_-_Ammo_-_Fortnite.png/revision/latest/scale-to-width-down/75?cb=20201221213909',
    'Medium Bullets - Ammo - Fortnite.png': 'https://static.wikia.nocookie.net/fortnite/images/b/be/Medium_Bullets_-_Ammo_-_Fortnite.png/revision/latest/scale-to-width-down/75?cb=20201221213737',
    'Heavy Bullets - Ammo - Fortnite.png': 'https://static.wikia.nocookie.net/fortnite/images/f/fd/Heavy_Bullets_-_Ammo_-_Fortnite.png/revision/latest/scale-to-width-down/75?cb=20201221213908',
    'Shells - Ammo - Fortnite.png': 'https://static.wikia.nocookie.net/fortnite/images/2/27/Shells_-_Ammo_-_Fortnite.png/revision/latest/scale-to-width-down/75?cb=20201221213912',
    'Rockets - Ammo - Fortnite.png': 'https://static.wikia.nocookie.net/fortnite/images/c/cd/Rockets_-_Ammo_-_Fortnite.png/revision/latest/scale-to-width-down/75?cb=20201221213910'
  };
  return images[file] || '';
}
function renderFortniteModesLesson() {
  const modes = [
    ['Battle Royale', 'Klasyczna walka o przetrwanie na dużej wyspie. Lądujesz, zbierasz wyposażenie i walczysz, aż zostanie ostatni gracz lub drużyna. W wariancie budowanym można zbierać surowce i stawiać konstrukcje.', 'https://fwcdn.pl/fpo/89/91/818991/8153780.8.webp', 'map'],
    ['Save the World', 'Kooperacyjna kampania PvE: razem z maksymalnie trzema znajomymi bronisz celów przed Husks, budujesz fortyfikacje, zastawiasz pułapki, zbierasz zasoby i rozwijasz bohaterów. To osobne doświadczenie nastawione na misje i współpracę.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeYCtlK0WzyNVp6Kp5rCXxklC7ihTQpaC6QnLLETCqNA&s=10', 'energy'],
    ['Battle Royale: Zero Build', 'Ten sam cel Battle Royale, ale bez stawiania konstrukcji. Osłony, pozycjonowanie i ruch mają większe znaczenie; gracze otrzymują dodatkową osłonę regenerującą się poza walką.', 'https://cdn-0001.qstv.on.epicgames.com/KfnDjqxMqgePPXckiW/image/landscape_comp.jpeg', 'map'],
    ['Creative i wyspy społeczności', 'Creative daje narzędzia do tworzenia własnych wysp. W Discover znajdziesz też wyspy innych twórców: np. tycoony, parkour/deathrun, Box Fights, Zone Wars, horror, roleplay, mapy treningowe i wyścigi. Każda wyspa może mieć własne cele, zasady, ekwipunek i system postępu — czytaj opis oraz oznaczenia wyspy.', 'https://cdn2.unrealengine.com/fneco-28-00-creative-discovertiles-keyart-1920x1080-1920x1080-51c98fe78d7a.jpg', 'vehicle'],
    ['LEGO Fortnite Odyssey', 'Przygodowa gra survivalowa w świecie LEGO: eksplorujesz, zbierasz materiały, wytwarzasz przedmioty, budujesz osadę i wykonujesz zadania. Możesz grać solo albo ze znajomymi.', 'https://cdn2.unrealengine.com/fnjn-33-10-stormking-egs-launcher-keyart-blade-2560x1440-2560x1440-c49d4cb08041.jpg', 'chest'],
    ['LEGO Fortnite Brick Life', 'Towarzyski tryb roleplay w mieście LEGO. Możesz urządzać dom, poznawać innych graczy, podejmować pracę i spędzać czas w mieście; rozgrywka nie polega na typowym meczu Battle Royale.', 'https://cdn2.unrealengine.com/cdn-uploader-FNBL_BrickLife_3940_-1920x1080-33018b69.jpg', 'map'],
    ['LEGO Expeditions · tryb historyczny', 'Wcześniejsze kooperacyjne doświadczenie z misjami i klasami bohaterów. Epic połączył Expeditions z Odyssey 1 listopada 2025 r., przenosząc klasy bohaterów do Odyssey. Ta grafika przedstawia dawną, osobną wersję — nie oznacza, że Expeditions nadal jest samodzielnym trybem.', 'https://static.wikia.nocookie.net/fortnite/images/4/44/Expeditions_-_Promo_-_LEGO_Fortnite.jpeg/revision/latest?cb=20250621183720', 'energy'],
    ['Fortnite OG', 'Stały tryb przywracający klasyczną wyspę, lokacje, łup i rozgrywkę z pierwszego rozdziału Battle Royale. To osobna, dostępna na stałe playlista, której kolejne sezony odtwarzają etapy historii oryginalnego Fortnite.', 'https://fwcdn.pl/fpo/89/91/818991/8153780.8.webp', 'map'],
    ['Fortnite Reload', 'Szybsza odmiana Battle Royale na mniejszej mapie. Gdy członek drużyny zostanie wyeliminowany, może wrócić do meczu, jeśli jego drużyna przetrwa wymagany czas; pod koniec rundy możliwość powrotu się kończy. Zasady i mapa mogą rotować.', 'https://cdn2.unrealengine.com/fortnite-reboot-duo-1920x1080-8e52e1148fcb.jpg', 'map'],
    ['Fortnite Festival', 'Muzyczne doświadczenie rytmiczne. Na Main Stage trafiasz w nuty utworów, grając na instrumentach solo lub z ekipą; Jam Stage pozwala wspólnie miksować i wykonywać partie muzyczne.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiWo4Mvu620ZqinjzcPs8RKzKpNVhAjG02uIDQrOhs0g&s=10', 'energy']
  ];
  const rankGraphic = 'https://cms-assets.unrealengine.com/AKtZh9UPWT5uJzqgfWYCRz/output=format:webp/cmthav4gj0fmu07lfecwtaa8h';
  root.innerHTML = `<section class="game-course-page fortnite-detail-page fortnite-modes-page"><button class="secondary-button fortnite-back-button" data-return-fortnite>← WRÓĆ DO LEKCJI FORTNITE</button><section class="page-intro"><div class="eyebrow"><span></span> FORTNITE · LEKCJA 04</div><h1>TRYBY <em>I WYSPY.</em></h1><p>Poznaj oficjalne doświadczenia Epic, wyspy twórców, sposoby tworzenia własnych map oraz drogę przez rangi rankingowe.</p></section><div class="fortnite-topic-tip fortnite-rotation-note"><b>Dostępność się zmienia</b><span>Epic rotuje playlisty, mapy i wydarzenia. Kafelki w Discover w grze są źródłem informacji o tym, co można uruchomić teraz. Własne wyspy i tryby czasowe mogą pojawiać się lub znikać.</span></div><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> OFICJALNE DOŚWIADCZENIA</div><h2>Wybierz swój <em>sposób gry.</em></h2></div><span class="section-count">${String(modes.length).padStart(2,'0')} TRYBÓW</span></div><div class="fortnite-mode-grid">${modes.map(([title,description,image,fallback],index)=>`<article class="fortnite-mode-card"><div class="fortnite-mode-art"><img data-fortnite-mode-fallback="${fallback}" src="${esc(image)}" alt="${esc(title)} — grafika Fortnite" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span>${String(index+1).padStart(2,'0')}</span></div><div class="fortnite-mode-copy"><h3>${esc(title)}</h3><p>${esc(description)}</p></div></article>`).join('')}</div></section><section class="game-learning-section fortnite-player-islands"><div class="section-head"><div><div class="eyebrow small"><span></span> CREATIVE · DISCOVER · UEFN</div><h2>Wyspy <em>graczy.</em></h2><h3 class="fortnite-islands-tagline">Od pomysłu do <em>Sławy.</em></h3></div></div><p class="fortnite-islands-intro">Discover to katalog doświadczeń stworzonych przez Epic i społeczność. Wyszukuj po tytule lub kodzie wyspy, przeglądaj kategorie i przed wejściem sprawdź opis, tagi, liczbę graczy oraz zasady. Wyspy mogą działać jak osobne gry — nie muszą używać broni, ekwipunku ani zasad Battle Royale.</p><div class="fortnite-mode-notes"><article><b>Jakie gry można tworzyć?</b><p>Walki drużynowe, Box Fights i Zone Wars, parkour oraz deathruny, tycoony, obby, horror, roleplay, przygody fabularne, zagadki, mapy treningowe, wyścigi, minigry i miejsca do spotkań. Możesz tworzyć solo albo w zespole.</p></article><article><b>Creative w Fortnite</b><p>Uruchom tryb Creative, wybierz pustą wyspę lub szablon i buduj bezpośrednio w grze. To dobry start do nauki terenu, galerii obiektów, urządzeń, ustawień rund i testowania pomysłów.</p></article><article><b>UEFN na komputerze</b><p>Unreal Editor for Fortnite daje bardziej zaawansowane narzędzia do projektowania świata, oświetlenia, materiałów i logiki. Verse pozwala programować własne mechaniki; nie musisz jednak pisać kodu, aby zrobić prostą wyspę.</p></article></div><div class="fortnite-creator-steps"><article><span>01 · POMYSŁ</span><h3>Wybierz cel gry</h3><p>Zdecyduj, dla ilu osób jest wyspa, co gracze mają robić i jak wygrać. Zacznij od małego prototypu: jednej areny, krótkiej rundy albo prostego zadania.</p></article><article><span>02 · BUDOWA</span><h3>Stwórz świat i mechaniki</h3><p>Ukształtuj teren, dodaj budowle, rekwizyty, przedmioty oraz urządzenia. Skonfiguruj drużyny, odradzanie, czas rundy, warunki zwycięstwa, klasy i nagrody.</p></article><article><span>03 · TESTY</span><h3>Graj, poprawiaj, zapraszaj</h3><p>Uruchom Playtest, sprawdź wyspę samodzielnie i ze znajomymi. Popraw błędy, tempo, czytelność i balans. W UEFN możesz udostępnić prywatną wersję zespołowi do wspólnych testów.</p></article><article><span>04 · PUBLIKACJA</span><h3>Creator Portal</h3><p>Przygotuj tytuł, opis, tagi, miniaturę i klasyfikację IARC. Projekt z Creative lub UEFN wysyła się do publikacji przez Creator Portal; Epic sprawdza go przed udostępnieniem. Po akceptacji gracze mogą znaleźć wyspę w Discover albo wejść na nią kodem.</p></article></div><div class="fortnite-creator-benefits"><div class="eyebrow small"><span></span> CO MOŻE DAĆ PUBLIKOWANIE?</div><p>Możesz pokazać własną grę dużej społeczności, budować rozpoznawalność twórcy, śledzić statystyki wyspy i rozwijać ją na podstawie reakcji graczy. Uczestnicy Fortnite Developer Program mogą kwalifikować się do miesięcznych wypłat za zaangażowanie. Epic przekazuje do wspólnej puli 40% kwalifikowanych dochodów netto ze sklepu i powiązanych zakupów — to pula dzielona według zaangażowania, a nie stała stawka za grę lub wyświetlenie. Można też oferować płatne przedmioty na wyspie; według aktualnego FAQ Epic do 31 stycznia 2027 r. twórcy otrzymują 100% wartości V-Dolców z takich transakcji. Żadna z tych możliwości nie gwarantuje konkretnego zarobku.</p><p class="fortnite-eligibility-note">Dołączenie do Developer Program wymaga ukończenia 18 lat oraz spełnienia aktualnego warunku zakupowego Epic (kwalifikujący zakup przez Epic Payments w ostatnich 365 dniach albo wydanie i zrealizowanie co najmniej 20 USD w Fortnite w tym okresie). Wypłaty pieniężne wymagają też profilu podatkowego i konta wypłat. Warunki oraz stawki mogą się zmieniać — sprawdź je przed zgłoszeniem.</p></div><p class="game-source-list">Tworzenie i publikacja: <a href="https://dev.epicgames.com/documentation/fortnite/create-mode" target="_blank" rel="noreferrer">Creative ↗</a> · <a href="https://dev.epicgames.com/documentation/fortnite/publishing-projects-in-unreal-editor-for-fortnite" target="_blank" rel="noreferrer">publikowanie przez Creator Portal ↗</a> · <a href="https://dev.epicgames.com/documentation/fortnite/fortnite-developer-program?lang=en-US" target="_blank" rel="noreferrer">warunki Fortnite Developer Program ↗</a> · <a href="https://dev.epicgames.com/documentation/fortnite/fortnite-developer-program-faqs-in-fortnite?lang=en-US" target="_blank" rel="noreferrer">wypłaty i transakcje ↗</a></p></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> RANKED · BATTLE ROYALE</div><h2>Wspinaj się <em>po szczeblach.</em></h2></div></div><div class="fortnite-topic-tip fortnite-rank-explainer"><b>Jak zdobywać postęp?</b><span>Ranked odblokowuje zadanie startowe „Przetrwaj 500 graczy” (Outlast 500 players). Wybierz Ranked w ustawieniach playlisty. Procent postępu rośnie przede wszystkim za wysokie miejsce i eliminacje; dokładna zmiana zależy od przebiegu meczu. Po napełnieniu paska awansujesz do kolejnego poziomu. W aktualnym rankingu Epic postęp Battle Royale i Zero Build jest wspólny. Zasady mogą być aktualizowane między sezonami.</span></div><a class="fortnite-rank-graphic" href="${rankGraphic}" target="_blank" rel="noreferrer"><img data-fortnite-rank-image src="${rankGraphic}" alt="Grafika wszystkich rang rankingowych Fortnite: od Brązu do Unreal" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span>Otwórz pełną grafikę rang ↗</span></a><div class="fortnite-mode-notes"><article><b>Awans i spadek</b><p>Rangi w kolejności: Brąz I–III, Srebro I–III, Złoto I–III, Platyna I–III, Diament I–III, Elita, Czempion, Unreal. Nie ma osobnych dywizji I–III powyżej Diamentu.</p></article><article><b>Elita i sezon</b><p>Po osiągnięciu Elity nie spadniesz poniżej Elity do końca sezonu. Na początku nowego sezonu postęp rankingowy jest częściowo resetowany i ponownie walczysz o pozycję.</p></article><article><b>Rankingi playlist</b><p>Epic prowadzi rankingi dla Battle Royale, Zero Build i Reload. Aktualna tablica potwierdza wspólny postęp BR/Zero Build; szczegóły playlist i rankingów mogą się zmieniać.</p></article></div></section><p class="game-source-list">Źródła oficjalne: <a href="https://www.fortnite.com/news" target="_blank" rel="noreferrer">Epic Games · tryby i aktualności ↗</a> · <a href="https://www.fortnite.com/news/fortnite-og-is-back-and-here-to-stay?lang=en-US" target="_blank" rel="noreferrer">Fortnite OG — tryb stały ↗</a> · <a href="https://www.fortnite.com/save-the-world?lang=en-US" target="_blank" rel="noreferrer">Save the World ↗</a> · <a href="https://www.fortnite.com/news/were-merging-lego-fortnite-expeditions-with-odyssey-by-bringing-hero-classes-to-odyssey?lang=en-US" target="_blank" rel="noreferrer">Odyssey i Expeditions ↗</a> · <a href="https://dev.epicgames.com/documentation/fortnite/create-mode" target="_blank" rel="noreferrer">Tworzenie w Creative ↗</a> · <a href="https://dev.epicgames.com/documentation/fortnite/publishing-islands-in-fortnite-creative?lang=en-US" target="_blank" rel="noreferrer">Publikowanie wyspy ↗</a> · <a href="https://www.fortnite.com/ranked/leaderboard?lang=en-US&mode=battle-royale" target="_blank" rel="noreferrer">Aktualny ranking Fortnite ↗</a> · <a href="https://www.epicgames.com/help/c-34254770/c-33726977/hvordan-fungerer-de-procenter-man-opnar-i-fortnite-ranked-mode-a26496624" target="_blank" rel="noreferrer">Jak działa procent postępu ↗</a></p></section>`;
  bindScreenActions();
}
function renderFortniteLootLesson() {
  const images = {
    chest: 'https://static.wikia.nocookie.net/fortnite/images/a/aa/Chest_%28v23.00%29_-_Container_-_Fortnite.png/revision/latest?cb=20240727194152',
    rareChest: 'https://static.wikia.nocookie.net/fortnite/images/d/db/Rare_Chest_%28v23.00%29_-_Container_-_Fortnite.png/revision/latest?cb=20240727194234',
    ammo: 'https://static.wikia.nocookie.net/fortnite/images/5/50/Ammo_Box_%28v23.00%29_-_Container_-_Fortnite.png/revision/latest?cb=20221205153230',
    produce: 'https://static.wikia.nocookie.net/fortnite/images/a/a3/Produce_Box_%28v23.00%29_-_Container_-_Fortnite.png/revision/latest?cb=20221205154327',
    cooler: 'https://static.wikia.nocookie.net/fortnite/images/9/9e/Cooler_-_Container_-_Fortnite.png/revision/latest?cb=20211211170818',
    vending: 'https://static.wikia.nocookie.net/fortnite/images/a/a5/Vending_Machine_%28Better%29_-_Fortnite.png/revision/latest/scale-to-width-down/268?cb=20250330214716',
    bars: 'https://static.wikia.nocookie.net/fortnite/images/7/7f/Bars_%28Small%29_-_Currency_-_Fortnite.png/revision/latest/scale-to-width-down/268?cb=20211211204821',
    wood: 'https://static.wikia.nocookie.net/fortnite/images/b/b2/Wood_-_Material_-_Fortnite.png/revision/latest?cb=20170806015411',
    metal: 'https://static.wikia.nocookie.net/fortnite/images/d/d2/Metal_-_Material_-_Fortnite.png/revision/latest?cb=20170806014803',
    brick: 'https://static.wikia.nocookie.net/fortnite/images/2/24/Stone_-_Material_-_Fortnite.png/revision/latest?cb=20170806015537'
  };
  const containers = [
    ['Skrzynia', 'Losowo: broń, amunicja oraz różne przedmioty użytkowe lub leczące. Czasem trafiają się też materiały i sztabki. Nie ma gwarancji konkretnego przedmiotu.', images.chest],
    ['Rzadka skrzynia', 'Wyróżnia ją złoty kolor. Zwykle oferuje broń z wyższej półki rzadkości oraz dodatkowy losowy łup. Konkretna zawartość zależy od aktualnej puli przedmiotów.', images.rareChest],
    ['Skrzynka z amunicją', 'Daje amunicję do broni dostępnych w danym trybie. Rodzaj i ilość nabojów są losowe — sprawdź stan amunicji przed walką.', images.ammo],
    ['Skrzynka z produktami', 'Może zawierać owoce i warzywa do zebrania, na przykład przedmioty odnawiające zdrowie. Lista produktów zależy od sezonu i trybu.', images.produce],
    ['Lodówka', 'Można w niej znaleźć ryby i inne jedzenie lub przedmioty użytkowe z bieżącej puli łupu. Zawartość nie jest stała.', images.cooler],
    ['Automat — Vending Machine', 'Pozwala kupić oferowany przedmiot za walutę wskazaną na ekranie automatu. Oferta, koszt i rodzaj automatu zmieniają się między sezonami i trybami.', images.vending],
    ['Sztabki — Bars', 'Waluta zbierana w trakcie meczu. W Battle Royale saldo zaczyna się od zera i resetuje między meczami. Służy do zakupów u postaci lub w automatach, jeśli są dostępne w danym sezonie.', images.bars]
  ];
  const materials = [
    ['Drewno', 'Zbierane przez niszczenie drzew i drewnianych obiektów. Buduje się szybko, ale świeżo postawiona konstrukcja jest mniej wytrzymała.', images.wood],
    ['Cegła / kamień', 'Pozyskiwana z kamiennych obiektów. Daje kompromis między szybkością budowania a wytrzymałością.', images.brick],
    ['Metal', 'Zbierany z metalowych obiektów. Konstrukcje powstają wolniej, ale po zbudowaniu są wytrzymałe.', images.metal]
  ];
  const imageCard = ([title,description,url],index,type) => {
    const thumbnailUrl = url.replace('/revision/latest?', '/revision/latest/scale-to-width-down/400?');
    return `<article class="fortnite-info-card"><div class="fortnite-loot-art" data-fallback="${esc(title)}"><img data-loot-art src="${esc(thumbnailUrl)}" alt="${esc(title)} — grafika Fortnite" referrerpolicy="no-referrer" loading="lazy" decoding="async"><span>${esc(title)}</span></div><span class="fortnite-info-number">${String(index+1).padStart(2,'0')} · ${type}</span><h3>${esc(title)}</h3><p>${esc(description)}</p></article>`;
  };
  const rarities = [
    ['Zwykła · Common','#b8bec3','Szara. Podstawowa odmiana.'],
    ['Niepospolita · Uncommon','#65bd63','Zielona. Wyższy poziom niż zwykła.'],
    ['Rzadka · Rare','#4a9de6','Niebieska.'],
    ['Epicka · Epic','#b46be2','Fioletowa.'],
    ['Legendarna · Legendary','#efa13b','Pomarańczowa.'],
    ['Mityczna · Mythic','#f3ca39','Złota. Zwykle specjalna broń lub wariant.'],
    ['Egzotyczna · Exotic','#51d3cc','Turkusowa. Często ma wyjątkową właściwość.']
  ];
  root.innerHTML = `<section class="game-course-page fortnite-detail-page fortnite-loot-page"><button class="secondary-button fortnite-back-button" data-return-fortnite>← WRÓĆ DO LEKCJI FORTNITE</button><section class="page-intro"><div class="eyebrow"><span></span> FORTNITE · LEKCJA 03</div><h1>SKRZYNKI <em>I ŁUP.</em></h1><p>Dowiedz się, co można znaleźć w pojemnikach, jak odczytać kolory broni i do czego służą surowce oraz sztabki.</p></section><div class="fortnite-topic-tip fortnite-rotation-note"><b>Ważne</b><span>To typowe przykłady zawartości. Łup, automaty, statystyki i dostępność pojemników zmieniają się zależnie od sezonu, trybu i aktualnej puli przedmiotów. Wskazówki przy automacie i w HUD pokazują bieżące zasady.</span></div><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> POJEMNIKI I ZAKUPY</div><h2>Gdzie szukać <em>wyposażenia?</em></h2></div><span class="section-count">07 PRZYKŁADÓW</span></div><div class="fortnite-info-grid fortnite-loot-grid">${containers.map((item,index)=>imageCard(item,index,'ŁUP')).join('')}</div></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> KOLOR BRONI</div><h2>Poziomy <em>rzadkości.</em></h2></div></div><p class="fortnite-footnote fortnite-rarity-intro">Kolor ułatwia rozpoznanie poziomu przedmiotu. Porównuj przede wszystkim ten sam typ/model broni — wyższa rzadkość nie oznacza automatycznie, że każda broń będzie lepsza od każdej innej.</p><div class="fortnite-rarity-grid">${rarities.map(([name,color,description],index)=>`<article class="fortnite-rarity-card" style="--rarity-color:${color}"><span>${String(index+1).padStart(2,'0')}</span><div><b>${esc(name)}</b><p>${esc(description)}</p></div></article>`).join('')}</div></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> MATERIAŁY DO BUDOWANIA</div><h2>Zbieraj i <em>stawiaj.</em></h2></div><span class="section-count">LIMIT: 500 KAŻDEGO</span></div><div class="fortnite-topic-tip fortnite-material-limit"><b>Limit</b><span>W standardowym Battle Royale z budowaniem można zwykle nosić do 500 sztuk drewna, cegły i metalu (łącznie 1 500). Zero Build nie korzysta z budowania, a wyspy kreatywne mogą ustawiać własne limity.</span></div><div class="fortnite-info-grid fortnite-material-grid">${materials.map((item,index)=>imageCard(item,index,'SUROWIEC')).join('')}</div></section><p class="game-source-list">Źródła: <a href="https://fortnite.fandom.com/wiki/Chest" target="_blank" rel="noreferrer">Fortnite Wiki · skrzynie i łup ↗</a> · <a href="https://dev.epicgames.com/documentation/fortnite/rarity-component-in-fortnite?lang=en-US" target="_blank" rel="noreferrer">Epic Games · poziomy rzadkości ↗</a> · <a href="https://dev.epicgames.com/documentation/fortnite/fortnite-weapons-primer?lang=en-US" target="_blank" rel="noreferrer">Epic Games · przewodnik po broniach ↗</a> · <a href="https://www.epicgames.com/help/c-34254770/c-33726977/a12589538" target="_blank" rel="noreferrer">Epic Games · sztabki ↗</a></p></section>`;
  bindScreenActions();
}
function renderFortniteCosmeticsLesson() {
  const game = window.EXTRA_GAME_COURSES?.fortnite;
  if (!game) return;
  activeScreen = 'fortnite-cosmetics';
  document.querySelector('#crumb').textContent = 'FORTNITE / KOSMETYKI';
  const priceCards = [
    ['Outfit · strój', 'zwykle 800–2 000 V-dolców', 'Postać i jej style; zestawy mogą kosztować więcej.'],
    ['Emotki / tańce', '200–800 V-dolców', 'Proste emotki bywają tańsze, popularne tańce często kosztują 500.'],
    ['Jam Track · utwór', '500 V-dolców', 'Utwory do Fortnite Festival; można ich używać także w innych miejscach gry.'],
    ['Sidekick · towarzysz', 'zwykle 1 200–1 500 V-dolców', 'Kosmetyczny kompan podążający za postacią; nie walczy i nie daje przewagi.'],
    ['Kilof / plecak / lotnia', 'cena zależy od przedmiotu', 'Akcesoria mogą być osobne albo dołączone do stroju lub zestawu.'],
    ['Wrap · malowanie', 'cena zależy od przedmiotu', 'Zmienia wygląd broni, a nie jej parametry.' ]
  ];
  const passArt = {
    'Battle Pass · Battle Royale': [{ label: 'Darmowy pass', image: 'https://static.wikia.nocookie.net/fortnite/images/1/15/Fortnite_Free_Pass_Icon.png/revision/latest?cb=20190531124926&path-prefix=de' }, { label: 'Premium Battle Pass', image: 'https://media.printables.com/media/prints/5f56a822-c715-4e62-981c-9378d86385f1/images/13397115_1986836e-9ad5-41be-85ee-e1a3a88c3976_d4e28f65-38dd-425d-906d-b37142c36923/thumbs/cover/800x800/png/captura-de-pantalla-2026-07-21-113118.png' }],
    'OG Pass': [{ label: 'OG Pass', image: 'https://cdnb.artstation.com/p/assets/images/images/085/459/149/medium/toby-sperring-passiconsv2-og.jpg?1740841763' }],
    'LEGO Pass': [{ label: 'LEGO Pass', image: 'https://cdna.artstation.com/p/assets/images/images/085/459/136/medium/toby-sperring-passiconsv2-lego.jpg?1740841754' }],
    'Music Pass': [{ label: 'Music Pass', image: 'https://cdnb.artstation.com/p/assets/images/images/085/459/141/medium/toby-sperring-passiconsv2-music.jpg?1740841758' }]
  };
  const passes = [
    ['Battle Pass · Battle Royale', '800 V-dolców', 'Stroje, akcesoria, emotki i V-dolce. W pełni ukończony pass oddaje obecnie 800 V-dolców.'],
    ['OG Pass', '800 V-dolców', 'Przedmioty i kosmetyki inspirowane klasycznym Fortnite.'],
    ['LEGO Pass', '1 200 V-dolców', 'Nagrody i kosmetyki do LEGO Fortnite, m.in. elementy świata i stroje LEGO.'],
    ['Music Pass', '1 200 V-dolców', 'Kosmetyki muzyczne i utwory związane z Fortnite Festival.']
  ];
  root.innerHTML = `<section class="game-course-page fortnite-detail-page fortnite-cosmetics-page"><button class="secondary-button fortnite-back-button" data-return-fortnite>← WRÓĆ DO LEKCJI FORTNITE</button><section class="page-intro"><div class="eyebrow"><span></span> FORTNITE · LEKCJA 02</div><h1>STWÓRZ SWÓJ <em>STYL.</em></h1><p>Waluta, sklep, kosmetyki, towarzysze i przepustki sezonowe — zobacz, co można zdobyć i jak to działa.</p></section><div class="fortnite-cosmetics-hero"><img src="fortnite_assets/LOCKER_LOOK.png" alt="Szafka Fortnite z postacią, emotkami, towarzyszami i muzyką"><div><span class="eyebrow small"><span></span> SZAFKA · LOCKER</span><h2>Wygląd dobierasz <em>po swojemu.</em></h2><p>Outfit, plecak, kilof, lotnia, emotki, utwory i towarzysze zmieniają wygląd lub dźwięk. Same kosmetyki nie zwiększają obrażeń ani odporności.</p></div></div><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> WALUTA W GRZE</div><h2>V-dolce, czyli <em>V-Bucks.</em></h2></div></div><div class="fortnite-cosmetics-panel"><div class="fortnite-vbucks-mark"><img data-cosmetics-art src="https://static.wikia.nocookie.net/fortnite/images/e/eb/V-Bucks_-_Icon_-_Fortnite.png/revision/latest/scale-to-width-down/268?cb=20170806013747" alt="Ikona V-dolców" referrerpolicy="no-referrer" loading="lazy"></div><div><h3>Za co nimi zapłacisz?</h3><p>V-dolce to podstawowa waluta do kupowania kosmetyków w sklepie, przepustek premium oraz wybranych zestawów. Nie są potrzebne, aby grać w Battle Royale. Na PC możesz kupić je w grze lub przez Epic Games Store; na konsoli zakup przechodzi przez sklep platformy. Dostępne są też karty podarunkowe Fortnite i karty V-dolców tam, gdzie są jeszcze sprzedawane.</p><p><b>Polskie ceny pakietów</b> (ogłoszone przez Epic od 19 marca 2026): 800 za 36,99 zł · 2 400 za 94,99 zł · 4 500 za 149,99 zł · 12 500 za 365,99 zł. Cena zakupu może zależeć od platformy i regionu.</p><ol><li>Otwórz zakładkę V-dolców w Fortnite albo sklep swojej platformy.</li><li>Wybierz pakiet i sprawdź, czy zalogowano właściwe konto Epic.</li><li>Zatwierdź płatność w systemie sklepu. Karty podarunkowe zrealizuj na koncie Epic przed zakupem.</li></ol></div></div><div class="fortnite-cosmetics-price-grid">${priceCards.map(([title,price,desc]) => `<article class="fortnite-cosmetics-price-card"><span>${esc(title)}</span><b>${esc(price)}</b><p>${esc(desc)}</p></article>`).join('')}</div><p class="fortnite-footnote">To przykładowe ceny z oficjalnego sklepu i bieżących ofert. Sklep rotuje, część kosmetyków jest sprzedawana tylko w zestawach, a cena konkretnego przedmiotu jest widoczna na jego kafelku.</p></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PRZEPUSTKI SEZONOWE</div><h2>Passy i ich <em>nagrody.</em></h2></div></div><p class="fortnite-passes-intro">Każdy pass trwa przez jeden sezon. Zdobywasz XP, grając w doświadczenia Fortnite; postęp jest współdzielony między passami. Bezpłatna ścieżka daje wybrane nagrody, a zakup passu odblokowuje ścieżkę premium. Nagrody odbierasz po osiągnięciu wymaganego poziomu.</p><div class="fortnite-pass-grid">${passes.map(([title,price,desc]) => `<article class="fortnite-pass-card"><div class="fortnite-pass-art-pair">${passArt[title].map(art => `<div class="fortnite-pass-art" data-fallback="${esc(art.label)}"><img data-cosmetics-art src="${esc(art.image)}" alt="${esc(art.label)}" referrerpolicy="no-referrer" loading="lazy"><span>${esc(art.label)}</span></div>`).join('')}</div><span class="fortnite-pass-number">PASS / PRZEPUSTKA</span><h3>${esc(title)}</h3><b>${esc(price)}</b><p>${esc(desc)}</p><small>Można też uzyskać w aktywnej subskrypcji Fortnite Crew.</small></article>`).join('')}</div><article class="fortnite-battle-bundle"><span class="eyebrow small"><span></span> SZYBSZY START</span><h3>Battle Bundle · 2 600 V-dolców</h3><p>Wariant Battle Passu BR z pierwszymi 25 poziomami odblokowanymi od razu. To przyspiesza odbieranie nagród, ale nie zastępuje dalszego zdobywania XP.</p></article><article class="fortnite-crew-note"><div class="fortnite-crew-art fortnite-pass-art" data-fallback="Fortnite Crew"><img data-cosmetics-art src="https://www.thespike.gg/_next/image?url=https%3A%2F%2Fthespike-strapi-cms.s3.us-east-1.amazonaws.com%2Ffortnite_crew_hero_6acc50e94d.jpg&w=3840&q=75" alt="Fortnite Crew" referrerpolicy="no-referrer" loading="lazy"><span>Fortnite Crew</span></div><div><b>Fortnite Crew</b><span>Subskrypcja obejmuje aktualne passy premium, miesięczny pakiet kosmetyków i 800 V-dolców. To płatność odnawiana cyklicznie — aktualną cenę i warunki sprawdź na ekranie zakupu swojej platformy.</span></div></article><p class="fortnite-footnote">Passy i ich zasady mogą się zmieniać. Epic podaje, że przedmioty z przyszłych passów mogą trafić do sklepu po co najmniej 18 miesiącach, ale nie gwarantuje powrotu każdego przedmiotu.</p></section><p class="game-source-list">Źródła oficjalne: <a href="https://www.fortnite.com/news/fortnite-v-bucks-price-increase?lang=pl" target="_blank" rel="noreferrer">ceny V-dolców i passów ↗</a> · <a href="https://www.epicgames.com/help/c-34254770/c-33726977/a20455513?lang=pl" target="_blank" rel="noreferrer">rodzaje passów ↗</a> · <a href="https://www.epicgames.com/help/c-34254770/c-39884448/a21722612?lang=pl" target="_blank" rel="noreferrer">jak zdobyć V-dolce ↗</a> · <a href="https://www.fortnite.com/item-shop" target="_blank" rel="noreferrer">Sklep Fortnite ↗</a></p></section>`;
  bindScreenActions();
}
function renderFortniteWeaponsLesson() {
  const game = window.EXTRA_GAME_COURSES?.fortnite;
  if (!game) return;
  activeScreen = 'fortnite-weapons';
  document.querySelector('#crumb').textContent = 'FORTNITE / BROŃ I EKWIPUNEK';
  navButtons.forEach(button => button.classList.remove('active'));
  const weapons = [
    { name: 'Assault Rifle', type: 'Karabin szturmowy · uniwersalny dystans', ammo: 'Średnie naboje', ammoFile: 'Medium Bullets - Ammo - Fortnite.png', ammoArt: 'ammo-medium', image: 'rifle', fallback: true, url: 'https://fortnite.gg/img/weapons/t-icon-weapons-assaultriflemark2tt-l.webp' },
    { name: 'Submachine Gun (SMG)', type: 'Pistolet maszynowy · bliski dystans', ammo: 'Lekkie naboje', ammoFile: 'Light Bullets - Ammo - Fortnite.png', ammoArt: 'ammo-light', image: 'smg', fallback: true, url: 'https://fortnite.gg/img/weapons/t_icon_weapons_rifle_bonerattler_ui_l.webp' },
    { name: 'Pistol', type: 'Pistolet · broń krótka', ammo: 'Lekkie naboje*', ammoFile: 'Light Bullets - Ammo - Fortnite.png', ammoArt: 'ammo-light', image: 'pistol', fallback: true, url: 'https://fortnite.gg/img/weapons/t-icon-weapons-cores23pistol-l.webp' },
    { name: 'Pump Shotgun', type: 'Strzelba · bardzo bliski dystans', ammo: 'Naboje do strzelby', ammoFile: 'Shells - Ammo - Fortnite.png', ammoArt: 'ammo-shells', image: 'shotgun', fallback: true, url: 'https://fortnite.gg/img/weapons/t-icon-weapons-pumpshotgunmark2base-l.webp' },
    { name: 'Bolt-Action Sniper Rifle', type: 'Karabin snajperski · daleki dystans', ammo: 'Ciężkie naboje', ammoFile: 'Heavy Bullets - Ammo - Fortnite.png', ammoArt: 'ammo-heavy', image: 'sniper', url: 'https://static.wikia.nocookie.net/fortnite/images/7/74/Heavy_Impact_Sniper_Rifle_-_Weapon_-_Fortnite.png/revision/latest/scale-to-width-down/163?cb=20240622101622' }
  ];
  const heals = [
    ['Bandaże', 'Odnawiają zdrowie; można użyć kilku, ale nie leczą powyżej limitu.', 'heal-bandage', 'https://static.wikia.nocookie.net/fortnite/images/5/56/Bandage_%28v11.00%29_-_Item_-_Fortnite.png/revision/latest/scale-to-width-down/100?cb=20210215155619', '15 HP / szt. · limit 75'],
    ['Medkit (apteczka)', 'Przywraca zdrowie; używaj za osłoną, bo leczenie wymaga chwili.', 'heal-medkit', 'https://static.wikia.nocookie.net/fortnite/images/b/b1/Medkit_-_Item_-_Fortnite.png/revision/latest?cb=20180917023707', '100 HP'],
    ['Small Shield Potion', 'Mała mikstura osłony; nie użyjesz jej po przekroczeniu limitu.', 'heal-mini', 'https://static.wikia.nocookie.net/fortnite/images/4/44/Small_Shield_Potion_%28v11.00%29_-_Item_-_Fortnite.png/revision/latest/scale-to-width-down/100?cb=20201228223517', '25 osłony · limit 50'],
    ['Shield Potion', 'Duża mikstura odnawiająca osłonę.', 'heal-shield', 'https://static.wikia.nocookie.net/fortnite/images/9/90/Shield_Potion_%28v11.00%29_-_Item_-_Fortnite.png/revision/latest/scale-to-width-down/100?cb=20201228223257', '50 osłony'],
    ['Chug Splash', 'Rzuć pod nogi, by leczyć siebie i pobliskich graczy.', 'heal-slurp', 'https://static.wikia.nocookie.net/fortnite/images/7/73/Chug_Splash_-_Item_-_Fortnite.png/revision/latest/scale-to-width-down/100?cb=20200519022406', '20 HP/osłony · do 6 szt.'],
    ['Pizza Party', 'Pudełko zawiera porcje pizzy, które można podnieść lub zjeść.', 'heal-keg', 'https://static.wikia.nocookie.net/fortnite/images/2/24/Pizza_Party_-_Item_-_Fortnite.png/revision/latest/scale-to-width-down/100?cb=20220118112401', 'Porcja: 5 HP + 30 osłony'],
    ['Flopper', 'Ryba, którą zjadasz, aby szybko odzyskać zdrowie.', 'heal-slurp', 'https://static.wikia.nocookie.net/fortnite/images/d/dd/Flopper_%28v14.00%29_-_Item_-_Fortnite.png/revision/latest/scale-to-width-down/100?cb=20210302024749', '40 HP'],
    ['Mushroom (grzyb osłony)', 'Zbierany grzyb odnawiający osłonę.', 'heal-mini', 'https://static.wikia.nocookie.net/fortnite/images/4/41/Mushroom_-_Item_-_Fortnite.png/revision/latest/scale-to-width-down/100?cb=20210930151645', '5 osłony'],
    ['Apple (jabłko)', 'Zbierany owoc odnawiający zdrowie.', 'heal-bandage', 'https://static.wikia.nocookie.net/fortnite/images/d/d2/Apple_%28v15.20%29_-_Item_-_Fortnite.png/revision/latest/scale-to-width-down/100?cb=20210113103055', '5 HP']
  ];
  root.innerHTML = `<section class="game-course-page fortnite-detail-page"><button class="secondary-button fortnite-back-button" data-return-fortnite>← WRÓĆ DO LEKCJI FORTNITE</button><section class="page-intro"><div class="eyebrow"><span></span> FORTNITE · LEKCJA 01</div><h1>BROŃ I <em>EKWIPUNEK.</em></h1><p>Poznaj podstawowe bronie, pasek ekwipunku i przedmioty odnawiające zdrowie oraz osłonę.</p></section><div class="fortnite-topic-tip fortnite-rotation-note"><b>Ważne</b><span>Pokazujemy podstawowe przykłady broni. Najedź na broń albo dotknij ikony „i”, aby zobaczyć amunicję. Grafiki amunicji i leczenia pochodzą z Fortnite Wiki; wyposażenie oraz statystyki mogą zmieniać się sezonowo.</span></div><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PODSTAWOWY ARSENAŁ</div><h2>Broń <em>na start.</em></h2></div><span class="section-count">${weapons.length} PRZYKŁADÓW</span></div><div class="fortnite-weapon-grid">${weapons.map(weapon => `<article class="fortnite-weapon-card"><div class="fortnite-weapon-image"><img src="${esc(weapon.url)}" ${weapon.fallback ? `data-fortnite-fallback="${esc(weapon.image)}"` : ''} alt="${esc(weapon.name)} — grafika broni" referrerpolicy="no-referrer" loading="eager"><span>GRAFIKA BRONI</span><button type="button" class="fortnite-ammo-toggle" aria-expanded="false" aria-label="Pokaż amunicję: ${esc(weapon.name)}">i</button><div class="fortnite-ammo-tooltip"><img src="${esc(weapon.ammoUrl || fortniteWikiImage(weapon.ammoFile))}" alt="${esc(weapon.ammo)}" referrerpolicy="no-referrer" loading="eager"><div><b>AMUNICJA</b><span>${esc(weapon.ammo)}</span></div></div></div><div class="fortnite-weapon-copy"><h3>${esc(weapon.name)}</h3><p>${esc(weapon.type)}</p></div></article>`).join('')}</div><p class="fortnite-footnote">To podstawowe przykłady. Konkretne modele mogą korzystać z innej amunicji, a pula broni zmienia się sezonowo.</p></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PASEK EKWIPUNKU</div><h2>Co nosisz <em>ze sobą?</em></h2></div></div><div class="fortnite-inventory-demo"><div class="fortnite-inventory-hud"><span class="fortnite-hud-label">PRZYKŁADOWY PASEK · BATTLE ROYALE</span><div class="fortnite-slots">${[['1','KILOF','⛏'],['2','STRZELBA','▰'],['3','KARABIN','▰'],['4','LECZENIE','✚'],['5','MOBILITY','↗']].map(slot=>`<div class="fortnite-slot"><small>${slot[0]}</small><b>${slot[2]}</b><span>${slot[1]}</span></div>`).join('')}</div><div class="fortnite-bars"><span>❤ ZDROWIE <b>100</b></span><i><b></b></i><span>⬡ OSŁONA <b>100</b></span><i><b></b></i></div></div><div class="fortnite-inventory-explain"><h3>Sloty to szybki dostęp</h3><p>W standardowym Battle Royale pasek pozwala szybko przełączać się między noszoną bronią i przedmiotami. Możesz trzymać tam np. broń na bliski i dalszy dystans, leczenie oraz mobility. Amunicja i materiały zwykle są liczone osobno. Kilof służy do zbierania materiałów i jest przypisany do osobnego sterowania; widok może różnić się zależnie od platformy, trybu i aktualizacji.</p><p><b>Zdrowie</b> to czerwony pasek. <b>Osłona</b> to niebieski pasek — chroni przed obrażeniami, ale nie zastępuje zdrowia.</p></div></div></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> LECZENIE I OSŁONA</div><h2>Jak odzyskać <em>siły?</em></h2></div></div><div class="fortnite-info-grid fortnite-heal-grid">${heals.map(([name,description,icon,file,stats],index) => `<article class="fortnite-info-card"><div class="fortnite-item-art"><img src="${esc(file)}" alt="${esc(name)} — grafika przedmiotu Fortnite" referrerpolicy="no-referrer" loading="eager"></div><span class="fortnite-info-number">0${index+1}</span><h3>${esc(name)}</h3><p>${esc(description)}</p><b class="fortnite-heal-stats">${esc(stats)}</b></article>`).join('')}</div><div class="fortnite-topic-tip fortnite-heal-tip"><b>Jak użyć?</b><span>Wybierz przedmiot na pasku, użyj przycisku akcji i poczekaj, aż animacja użycia się skończy. Schowaj się za osłoną. Statystyki i limity mogą zmieniać się między sezonami.</span></div></section><p class="game-source-list">Grafiki: <a href="https://fortnite.gg/weapons" target="_blank" rel="noreferrer">Fortnite.GG · broń ↗</a>, <a href="https://fortnite.fandom.com/wiki/Sniper_Rifles" target="_blank" rel="noreferrer">Fortnite Wiki · snajperki ↗</a>, <a href="https://fortnite.fandom.com/wiki/Ammunition" target="_blank" rel="noreferrer">amunicja Battle Royale ↗</a> i <a href="https://fortnite.fandom.com/wiki/Healing_Items" target="_blank" rel="noreferrer">przedmioty leczące ↗</a>.</p></section>`;
  root.querySelectorAll('.fortnite-ammo-toggle').forEach(toggle => toggle.addEventListener('click', event => {
    event.stopPropagation();
    const card = toggle.closest('.fortnite-weapon-card');
    const open = card.classList.toggle('show-ammo-tip');
    toggle.setAttribute('aria-expanded', String(open));
  }));
  bindScreenActions();
}
function switchGame(gameId) {
  const game = window.EXTRA_GAME_COURSES?.[gameId];
  activeGame = game ? gameId : 'valorant';
  appShell.dataset.currentGame = activeGame;
  gameTabs.forEach(button => {
    const selected = button.dataset.game === activeGame;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const gameLabel = document.querySelector('#game-label');
  const breadcrumb = document.querySelector('#crumb');
  const sourceLink = document.querySelector('#game-source-link');
  if (activeGame === 'valorant') {
    gameLabel.textContent = 'KURS VALORANT';
    breadcrumb.textContent = 'START';
    sourceLink.href = 'https://playvalorant.com/pl-pl/agents/';
    sourceLink.textContent = 'AGENTI VALORANT ↗';
    showScreen('overview');
  } else {
    gameLabel.textContent = game.name.toLocaleUpperCase('pl');
    breadcrumb.textContent = `KURS / ${game.name.toLocaleUpperCase('pl')}`;
    sourceLink.href = game.sources[0].url;
    sourceLink.textContent = `${game.name.toLocaleUpperCase('pl')} · ŹRÓDŁO ↗`;
    navButtons.forEach(button => button.classList.remove('active'));
    renderGameHub(activeGame);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
async function renderRanks() {
  updateNav('ranks');
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA 04 · SYSTEM RANG</div><h1>WSPINAJ SIĘ <em>WYŻEJ.</em></h1><p>Rangi pokazują postęp w trybie rankingowym. Do Immortala awansujesz przez kolejne dywizje i punkty RR, a Radiant wymaga też miejsca w regionalnej czołówce.</p></section><section class="rank-rules"><article class="rank-rule-card"><span class="rank-rule-number">01</span><div class="eyebrow small"><span></span> IRON — ASCENDANT</div><h2>Każda ranga ma <em>3 dywizje.</em></h2><p>Iron, Bronze, Silver, Gold, Platinum, Diamond i Ascendant mają poziomy 1, 2 i 3. W tych rangach awansujesz po zdobyciu 100 RR.</p></article><article class="rank-rule-card"><span class="rank-rule-number">02</span><div class="eyebrow small"><span></span> IMMORTAL</div><h2>Liczy się <em>RR.</em></h2><p>Immortal również dzieli się na Immortal 1, 2 i 3. Od Immortal 1 punkty RR nie zatrzymują się na 100; przejście wyżej wymaga osiągnięcia progów ustalanych dla regionu.</p></article><article class="rank-rule-card radiant-rule"><span class="rank-rule-number">03</span><div class="eyebrow small"><span></span> RADIANT</div><h2>Top 500 <em>na region.</em></h2><p>Sam próg RR nie wystarczy. Trzeba jednocześnie osiągnąć regionalne minimum RR i znaleźć się wśród 500 najlepszych graczy regionu.</p></article></section><section class="rank-eu-threshold"><div><div class="eyebrow small"><span></span> REGION EUROPE · PROGI RR</div><h2>Droga od <em>Immortala 1.</em></h2><p>Według aktualnej tabeli Riot próg dla EU wynosi 100 RR dla Immortal 2, 200 RR dla Immortal 3 i 500 RR dla Radianta. Radiant wymaga dodatkowo miejsca w top 500 EU.</p></div><div class="rank-thresholds"><div><b>100</b><span>RR · IMMORTAL 2</span></div><div><b>200</b><span>RR · IMMORTAL 3</span></div><div><b>500</b><span>RR · RADIANT + TOP 500</span></div></div></section><section class="rank-cycle-section"><div class="section-head"><div><div class="eyebrow small"><span></span> KALENDARZ RANKINGOWY</div><h2>Sezon, <em>akty i placementy.</em></h2></div></div><div class="rank-cycle-intro"><span class="rank-cycle-mark">6×</span><p><b>Sezon</b> trwa cały rok i składa się z sześciu aktów. Jeden akt to okres rankingowy trwający przeciętnie około dwóch miesięcy; dokładny harmonogram może się różnić. Co akt zmienia się m.in. pula map i rozpoczyna się nowy zapis Rangi Aktu. Od 2025 roku Riot nie używa już dawnego podziału na Epizody/Odcinki — zastąpił go roczny sezon.</p></div><div class="rank-cycle-grid"><article class="rank-cycle-card"><div class="eyebrow small"><span></span> SEZON · AKT I I IV</div><h3>5 meczów <em>rozstawiających.</em></h3><p>Na początku sezonu (Akt I) oraz w jego połowie (Akt IV) rozgrywasz po 5 placementów. To dwa momenty ponownego ustalenia rangi w roku.</p></article><article class="rank-cycle-card"><div class="eyebrow small"><span></span> AKTY II, III, V I VI</div><h3>1 mecz, by <em>zaktualizować rangę.</em></h3><p>W pozostałych aktach wystarczy 1 placement, jeśli masz już ustaloną rangę. Sam początek nowego aktu nie obniża rangi automatycznie, ale wynik placementu może ją zmienić.</p></article><article class="rank-cycle-card"><div class="eyebrow small"><span></span> POSTĘP I NAGRODY</div><h3>Nowa <em>Ranga Aktu.</em></h3><p>W każdym akcie zapisuje się postęp, a Ranga Aktu bazuje na najwyższej randze, na której wygrasz mecz. Do odznaki i nagród rankingowych potrzeba co najmniej 9 wygranych meczów rankingowych w akcie. Talizman za rangę Riot przyznaje w połowie sezonu i na jego koniec.</p></article></div><p class="rank-cycle-note">„Placement” nie oznacza, że za każdym razem zaczynasz od zera. W skrócie: co akt zmienia się pula map i postęp Rangi Aktu; co sezon rozpoczyna się nowy roczny cykl, a pięć placementów rozgrywasz na początku sezonu i w jego połowie (Akt IV). W pozostałych aktach wystarczy jeden mecz aktualizujący rangę.</p></section><section class="rank-catalog-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PEŁNA DRABINKA</div><h2>Poznaj <em>odznaki rang.</em></h2></div><button class="secondary-button" data-quiz="rank">QUIZ RANG ↗</button></div><div class="rank-catalog" id="rank-catalog"><p class="map-loading">Ładowanie odznak rang…</p></div></section><p class="glossary-source">Zasady RR, placementów i nagród: <a href="https://support.riotgames.com/en-us/valorant/rewards/act-ranks-and-rewards" target="_blank" rel="noreferrer">Riot — Rangi Aktu i nagrody ↗</a> oraz <a href="https://playvalorant.com/pl-pl/news/game-updates/valorant-patch-notes-10-00/" target="_blank" rel="noreferrer">opis patcha 10.00 ↗</a>. Progi punktowe mogą się zmieniać. Odznaki pobierane są z <a href="https://valorant-api.com/v1/competitivetiers" target="_blank" rel="noreferrer">Valorant API ↗</a>.</p>`;
  bindScreenActions();
  try {
    const ranks = await loadRankCatalog();
    if (activeScreen !== 'ranks') return;
    root.querySelector('#rank-catalog').innerHTML = ranks.map(rank => `<article class="rank-badge-card"><img src="${esc(rank.image)}" alt="Odznaka ${esc(rank.name)}" loading="lazy"><b>${esc(rank.name)}</b></article>`).join('');
  } catch (error) {
    root.querySelector('#rank-catalog').innerHTML = '<p class="empty-state">Nie udało się pobrać odznak. Quiz i opis zasad możesz otworzyć ponownie po chwili.</p>';
  }
}
async function loadMapCatalog() {
  if (!mapCatalogPromise) mapCatalogPromise = fetch('https://valorant-api.com/v1/maps?language=en-US')
    .then(response => { if (!response.ok) throw new Error('Nie udało się pobrać map.'); return response.json(); })
    .then(payload => (payload.data || []).filter(map => map.displayIcon && map.callouts?.length && map.tacticalDescription && map.xMultiplier && map.yMultiplier)
      .map(map => ({
        id: map.uuid, name: map.displayName, image: map.displayIcon,
        callouts: map.callouts.map((spot, index) => ({
          id: String(index), label: [spot?.superRegionName, spot?.regionName].filter(Boolean).join(' '),
          x: Math.max(2, Math.min(98, ((spot?.location?.y ?? NaN) * map.xMultiplier + map.xScalarToAdd) * 100)),
          y: Math.max(2, Math.min(98, ((spot?.location?.x ?? NaN) * map.yMultiplier + map.yScalarToAdd) * 100))
        })).filter(spot => spot.label && Number.isFinite(spot.x) && Number.isFinite(spot.y))
      })).filter(map => map.callouts.length > 3)).catch(error => { mapCatalogPromise = null; throw error; });
  return mapCatalogPromise;
}
async function renderMapsLesson() {
  updateNav('maps');
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA 03 · MAPY</div><h1>POZNAJ <em>MAPY.</em></h1><p>Wybierz mapę, aby zobaczyć wszystkie callouty oznaczone na minimapie i na liście. Gdy je zapamiętasz, przejdź do treningu i uzupełnij puste punkty.</p></section><p class="map-loading">Ładowanie map i calloutów…</p>`;
  try {
    const maps = await loadMapCatalog();
    if (activeScreen !== 'maps') return;
    root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA 03 · MAPY</div><h1>WYBIERZ <em>MAPĘ.</em></h1><p>Dla każdej mapy wybierz jeden z dwóch widoków: kompletną mapę z nazwami albo pusty quiz do uzupełnienia z pamięci.</p></section><div class="map-lesson-grid">${maps.map(map => `<article class="map-lesson-card"><img src="${esc(map.image)}" alt="Minimapa ${esc(map.name)}" loading="lazy"><div class="map-lesson-copy"><div class="eyebrow small"><span></span> ${map.callouts.length} MIEJSC</div><h2>${esc(map.name)}</h2><div class="map-mode-actions"><button class="primary-button" data-map-study="${esc(map.id)}">PEŁNA MAPA</button><button class="secondary-button" data-map-quiz="${esc(map.id)}">PUSTY QUIZ</button></div></div></article>`).join('')}</div>`;
    root.querySelectorAll('[data-map-study]').forEach(button => button.addEventListener('click', () => {
      const map = maps.find(item => item.id === button.dataset.mapStudy);
      renderMapStudy(map);
    }));
    root.querySelectorAll('[data-map-quiz]').forEach(button => button.addEventListener('click', () => {
      const map = maps.find(item => item.id === button.dataset.mapQuiz);
      if (map) mapRoundPools.set(map.id, shuffle(map.callouts));
      renderMapPuzzle(map);
    }));
  } catch (error) {
    const loading = root.querySelector('.map-loading');
    if (loading) loading.textContent = 'Nie udało się pobrać listy map. Sprawdź połączenie z internetem i spróbuj ponownie.';
  }
}
function renderMapStudy(map) {
  if (!map) return;
  updateNav('maps');
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA 03 · NAUKA MAPY</div><h1>${esc(map.name).toLocaleUpperCase('pl')} <em>CALLOUTY.</em></h1><p>To jest pełna mapa — wszystkie callouty są podpisane bezpośrednio przy swoich lokalizacjach. Lista obok pomaga odszukać nazwy.</p></section><section class="map-study-layout"><div class="map-study-board"><div class="map-study-map"><img src="${esc(map.image)}" alt="Minimapa ${esc(map.name)} z oznaczonymi calloutami" draggable="false">${map.callouts.map((spot,index)=>`<span class="map-study-marker" style="left:${spot.x}%;top:${spot.y}%" title="${esc(spot.label)}"><b>${index+1}</b>${esc(spot.label)}</span>`).join('')}</div></div><aside class="map-study-legend"><div class="eyebrow small"><span></span> WSZYSTKIE MIEJSCA · ${map.callouts.length}</div><ol>${map.callouts.map((spot,index)=>`<li><b>${index+1}</b><span>${esc(spot.label)}</span></li>`).join('')}</ol></aside></section><div class="map-study-actions"><button class="secondary-button" id="map-study-back">← WSZYSTKIE MAPY</button><button class="primary-button" id="map-study-practice">OTWÓRZ PUSTY QUIZ <span>↗</span></button></div>`;
  root.querySelector('#map-study-back').addEventListener('click', renderMapsLesson);
  root.querySelector('#map-study-practice').addEventListener('click', () => {
    mapRoundPools.set(map.id, shuffle(map.callouts));
    renderMapPuzzle(map);
  });
}
async function renderMapPracticeSelection() {
  updateNav('map-practice');
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> TRENING · CALLOUTY</div><h1>SPRAWDŹ <em>PAMIĘĆ.</em></h1><p>Wybierz mapę, uzupełnij puste punkty z pamięci i sprawdź poprawne odpowiedzi.</p></section><p class="map-loading">Ładowanie map…</p>`;
  try {
    const maps = await loadMapCatalog();
    if (activeScreen !== 'map-practice') return;
    root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> TRENING · CALL-OUTY</div><h1>WYBIERZ <em>MAPĘ.</em></h1><p>Quiz pokaże puste punkty i pomieszane nazwy. Rozmieść je z pamięci; odpowiedzi zobaczysz po sprawdzeniu.</p></section><div class="map-lesson-grid">${maps.map(map => `<article class="map-lesson-card"><img src="${esc(map.image)}" alt="Minimapa ${esc(map.name)}" loading="lazy"><div class="map-lesson-copy"><div class="eyebrow small"><span></span> ${map.callouts.length} MIEJSC W PULI</div><h2>${esc(map.name)}</h2><button class="primary-button" data-map-id="${esc(map.id)}">ROZPOCZNIJ QUIZ <span>↗</span></button></div></article>`).join('')}</div>`;
    root.querySelectorAll('[data-map-id]').forEach(button => button.addEventListener('click', () => {
      const map = maps.find(item => item.id === button.dataset.mapId);
      if (map) mapRoundPools.set(map.id, shuffle(map.callouts));
      renderMapPuzzle(map);
    }));
  } catch (error) {
    const loading = root.querySelector('.map-loading');
    if (loading) loading.textContent = 'Nie udało się pobrać listy map. Sprawdź połączenie z internetem i spróbuj ponownie.';
  }
}
function renderMapPuzzle(map) {
  if (!map) return;
  updateNav('map-practice');
  selectedMapTile = null;
  mapPuzzleChecked = false;
  activeMap = map;
  let pool = mapRoundPools.get(map.id) || [];
  if (!pool.length) pool = shuffle(map.callouts);
  activeMapRound = pool.splice(0, Math.min(8, pool.length));
  mapRoundPools.set(map.id, pool);
  const tiles = shuffle(activeMapRound);
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA MAP · ${esc(map.name).toLocaleUpperCase('pl')}</div><h1>CALL-OUTY <em>NA MIEJSCA.</em></h1><p>Przeciągnij nazwę z listy na pole mapy. Na telefonie stuknij nazwę, a potem właściwe pole. Losujemy osiem miejsc z puli wszystkich calloutów tej mapy.</p></section><section class="map-puzzle-layout"><div class="map-puzzle-board"><div class="map-puzzle-map" role="group" aria-label="Mapa ${esc(map.name)} z polami calloutów"><img src="${esc(map.image)}" alt="Podkład mapy ${esc(map.name)}" draggable="false">${activeMapRound.map((spot,i)=>`<button class="map-drop-slot" data-zone="${spot.id}" style="left:${spot.x}%;top:${spot.y}%" aria-label="Pole ${i+1} na mapie"><span>${i+1}</span></button>`).join('')}</div><div class="map-game-status"><span id="map-message" aria-live="polite">Wybierz klocek i dopasuj go do pola na mapie.</span><span id="map-score">0 / ${activeMapRound.length}</span></div><div class="map-answer-review" id="map-answer-review" aria-live="polite"></div></div><aside class="map-puzzle-aside"><div class="eyebrow small"><span></span> KLOCKI DO UŁOŻENIA</div><div class="map-tile-bank">${tiles.map(tile=>`<button class="map-name-tile" draggable="true" data-tile="${tile.id}">${esc(tile.label)}</button>`).join('')}</div><button class="primary-button map-check-button" id="map-check" disabled>SPRAWDŹ UŁOŻENIE <span>✓</span></button><button class="secondary-button map-reset-button" id="map-reset">NOWA LOSOWA RUNDA</button><button class="text-button map-back-button" id="map-back">← WRÓĆ DO MAP</button></aside></section>`;
  const slots = [...root.querySelectorAll('.map-drop-slot')];
  const bank = root.querySelector('.map-tile-bank');
  const check = root.querySelector('#map-check');
  const updateCheck = () => { check.disabled = slots.some(slot => !slot.dataset.tile); };
  const placeTile = (tileId, slot) => {
    if (mapPuzzleChecked) return;
    const tile = root.querySelector(`[data-tile="${tileId}"]`);
    if (!tile || !slot) return;
    const oldSlot = root.querySelector(`.map-drop-slot[data-tile="${tileId}"]`);
    if (oldSlot) { oldSlot.dataset.tile = ''; oldSlot.querySelector('span').textContent = oldSlot.dataset.number; oldSlot.classList.remove('filled'); }
    const occupyingId = slot.dataset.tile;
    if (occupyingId && occupyingId !== tileId) {
      const occupyingTile = root.querySelector(`[data-tile="${occupyingId}"]`);
      if (occupyingTile) { occupyingTile.classList.remove('placed'); bank.append(occupyingTile); }
    }
    slot.dataset.tile = tileId;
    slot.querySelector('span').textContent = tile.textContent;
    slot.classList.add('filled');
    tile.classList.toggle('placed', slots.some(item => item.dataset.tile === tileId));
    updateCheck();
  };
  slots.forEach((slot,i) => {
    slot.dataset.number = String(i+1);
    slot.addEventListener('dragover', event => event.preventDefault());
    slot.addEventListener('drop', event => { event.preventDefault(); placeTile(event.dataTransfer.getData('text/plain'), slot); });
    slot.addEventListener('click', () => { if (selectedMapTile) placeTile(selectedMapTile, slot); });
  });
  root.querySelectorAll('.map-name-tile').forEach(tile => {
    tile.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', tile.dataset.tile));
    tile.addEventListener('click', () => {
      root.querySelectorAll('.map-name-tile').forEach(item => item.classList.remove('selected'));
      selectedMapTile = tile.dataset.tile;
      tile.classList.add('selected');
      root.querySelector('#map-message').textContent = `Kliknij właściwe pole dla: ${tile.textContent}`;
    });
  });
  check.addEventListener('click', () => {
    mapPuzzleChecked = true;
    let score = 0;
    slots.forEach(slot => {
      const correct = slot.dataset.tile === slot.dataset.zone;
      if (correct) score++;
      slot.classList.add(correct ? 'correct' : 'incorrect');
      const correctCallout = activeMapRound.find(item => item.id === slot.dataset.zone);
      slot.title = correct ? 'Dobrze!' : `Poprawna odpowiedź: ${correctCallout.label}`;
    });
    root.querySelector('#map-score').textContent = `${score} / ${slots.length}`;
    root.querySelector('#map-message').textContent = score === slots.length ? 'Perfekcyjnie! Wszystkie callouty są na miejscu.' : `Dobre podejście — poprawnych miejsc: ${score}. Pomieszaj klocki i spróbuj jeszcze raz.`;
    const corrections = slots.filter(slot => slot.dataset.tile !== slot.dataset.zone).map(slot => {
      const selected = activeMapRound.find(item => item.id === slot.dataset.tile);
      const correct = activeMapRound.find(item => item.id === slot.dataset.zone);
      return `${correct.label} ← ${selected?.label || 'puste pole'}`;
    });
    root.querySelector('#map-answer-review').textContent = corrections.length ? `Poprawne rozmieszczenie: ${corrections.join(' · ')}` : 'Wszystkie nazwy są na właściwych miejscach.';
    if (score / slots.length >= 0.6) { completed.add('maps'); saveProgress(); }
    check.disabled = true;
  });
  root.querySelector('#map-reset').addEventListener('click', () => renderMapPuzzle(map));
  root.querySelector('#map-back').addEventListener('click', renderMapPracticeSelection);
}
function bindScreenActions() {
  root.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.go)));
  root.querySelectorAll('[data-return-fortnite]').forEach(button => button.addEventListener('click', () => switchGame('fortnite')));
  root.querySelectorAll('img[data-fortnite-fallback]').forEach(image => image.addEventListener('error', () => {
    if (image.dataset.fallbackUsed) return;
    image.dataset.fallbackUsed = '1';
    image.src = fortniteIllustration(image.dataset.fortniteFallback);
    image.closest('.fortnite-weapon-image, .fortnite-item-art')?.classList.add('is-fallback');
  }, { once: true }));
  root.querySelectorAll('img[data-fortnite-topic-fallback]').forEach(image => {
    const showFallback = () => {
      if (image.dataset.fallbackUsed) return;
      image.dataset.fallbackUsed = '1';
      image.src = fortniteIllustration(image.dataset.fortniteTopicFallback);
      image.closest('.fortnite-topic-image')?.classList.add('is-fallback');
    };
    image.addEventListener('error', showFallback);
    // Cached failures can finish before listeners are attached after innerHTML.
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
  root.querySelectorAll('img[data-fortnite-mode-fallback]').forEach(image => {
    const showFallback = () => {
      if (image.dataset.fallbackUsed) return;
      image.dataset.fallbackUsed = '1';
      image.src = fortniteIllustration(image.dataset.fortniteModeFallback);
      image.closest('.fortnite-mode-art')?.classList.add('is-fallback');
    };
    image.addEventListener('error', showFallback);
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
  root.querySelectorAll('img[data-fortnite-rank-image]').forEach(image => {
    const showFallback = () => {
      image.closest('.fortnite-rank-graphic')?.classList.add('image-missing');
      image.remove();
    };
    image.addEventListener('error', showFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
  root.querySelectorAll('img[data-cosmetics-art]').forEach(image => image.addEventListener('error', () => {
    image.closest('.fortnite-pass-art, .fortnite-vbucks-mark')?.classList.add('image-missing');
    image.remove();
  }, { once: true }));
  root.querySelectorAll('img[data-loot-art]').forEach(image => image.addEventListener('error', () => {
    if (!image.dataset.retryWithoutCache && image.src.includes('?')) {
      image.dataset.retryWithoutCache = '1';
      image.src = image.src.split('?')[0];
      return;
    }
    image.closest('.fortnite-loot-art')?.classList.add('image-missing');
    image.remove();
  }));
  bindQuizButtons(root);
}
function bindQuizButtons(scope) {
  scope.querySelectorAll('[data-quiz]').forEach(button => { if (button.dataset.quizBound) return; button.dataset.quizBound = '1'; button.addEventListener('click', () => startQuiz(button.dataset.quiz)); });
}
function showScreen(screen) {
  if (screen === 'fortnite-weapons') { renderFortniteWeaponsLesson(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (screen === 'fortnite-cosmetics') { renderFortniteCosmeticsLesson(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (screen === 'fortnite-loot') { renderFortniteLootLesson(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (screen === 'fortnite-modes') { renderFortniteModesLesson(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  updateNav(screen);
  if (screen === 'roles') renderRoles();
  else if (screen === 'agents') renderAgents();
  else if (screen === 'maps') renderMapsLesson();
  else if (screen === 'ranks') renderRanks();
  else if (screen === 'weapons') renderWeapons();
  else if (screen === 'map-practice') renderMapPracticeSelection();
  else if (screen === 'practice') renderPractice();
  else if (screen === 'extras') renderExtras();
  else if (screen === 'glossary') renderGlossary();
  else if (screen === 'fortnite-glossary') renderFortniteGlossary();
  else renderOverview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function makeQuestions(type) {
  if (type === 'fortnite-glossary') {
    const entries = window.EXTRA_GAME_COURSES?.fortnite?.glossary || [];
    if (entries.length < 4) return [];
    return shuffle(entries).slice(0, Math.min(10, entries.length)).map(item => {
      const wrong = shuffle(entries.filter(other => other.term !== item.term)).slice(0, 3).map(other => other.term);
      const options = shuffle([item.term, ...wrong]);
      return { prompt: 'Jakie hasło pasuje do tej definicji?', definition: `${item.also ? `${item.also}. ` : ''}${item.definition}`, options, correct: options.indexOf(item.term), why: `${item.term}: ${item.definition}` };
    });
  }
  if (type === 'glossary') {
    const glossary = [...(window.VALORANT_GLOSSARY || [])];
    agents.forEach(agent => {
      glossary.push({ term: agent.name, definition: agent.description || `Agent z rolą ${roleDisplayName(agent.role)}.` });
      (agent.abilities || []).forEach(ability => glossary.push({ term: abilityDisplayName(ability), definition: `${agent.name} · ${slotName(ability.slot || 'Ability')}. ${ability.description || 'Umiejętność agenta.'}` }));
    });
    const entries = [...new Map(glossary.filter(item => item.term && item.definition).map(item => [item.term, item])).values()];
    if (entries.length < 4) return [];
    return shuffle(entries).slice(0, Math.min(10, entries.length)).map(item => {
      const wrong = shuffle(entries.filter(other => other.term !== item.term)).slice(0, 3).map(other => other.term);
      const options = shuffle([item.term, ...wrong]);
      return { prompt: 'Jakie hasło pasuje do tej definicji?', definition: item.definition, options, correct: options.indexOf(item.term), why: `${item.term}: ${item.definition}` };
    });
  }
  if (type === 'role') {
    return shuffle(agents).slice(0, 8).map(agent => {
      const options = shuffle(roles.map(roleDisplayName));
      return { prompt: `Którą rolę pełni ${agent.name}?`, image: agent.portrait, alt: `Portret agenta ${agent.name}`, options, correct: options.indexOf(roleDisplayName(agent.role)), why: `${agent.name} to ${roleDisplayName(agent.role)}. ${agent.roleDescription}` };
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
      return { prompt: 'Kto jest na portrecie?', image: agent.portrait, alt: 'Portret agenta', options, correct: options.indexOf(agent.name), why: `To ${agent.name}, agent z rolą ${roleDisplayName(agent.role)}.` };
    });
  }
  return [];
}
function makeWeaponQuestions(weapons) {
  return shuffle(weapons).slice(0, Math.min(10, weapons.length)).map(weapon => {
    const wrong = shuffle(weapons.filter(item => item.id !== weapon.id)).slice(0, 3).map(item => item.name);
    const options = shuffle([weapon.name, ...wrong]);
    return { prompt: 'Jak nazywa się ta broń?', image: weapon.image, alt: `Obraz broni ${weapon.name}`, options, correct: options.indexOf(weapon.name), why: `${weapon.name} · ${weapon.category}.` };
  });
}
function makeRankQuestions(ranks) {
  return shuffle(ranks).slice(0, Math.min(10, ranks.length)).map(rank => {
    const wrong = shuffle(ranks.filter(item => item.id !== rank.id)).slice(0, 3).map(item => item.name);
    const options = shuffle([rank.name, ...wrong]);
    return { prompt: 'Jak nazywa się ta ranga?', image: rank.image, alt: `Odznaka rangi ${rank.name}`, options, correct: options.indexOf(rank.name), why: `To ${rank.name}.` };
  });
}
function makeExtraGameQuestions(game) {
  return shuffle(game.questions).slice(0, Math.min(10, game.questions.length)).map(question => {
    const orderedOptions = shuffle(question.options.map((answer,index) => ({ answer, index })));
    return { prompt: question.prompt, options: orderedOptions.map(item => item.answer), correct: orderedOptions.findIndex(item => item.index === question.correct), why: question.why };
  });
}
async function startQuiz(type) {
  let questions;
  if (window.EXTRA_GAME_COURSES?.[type]) {
    questions = makeExtraGameQuestions(window.EXTRA_GAME_COURSES[type]);
  }
  if (type === 'weapon') {
    try {
      const weapons = await loadWeaponCatalog();
      if (weapons.length < 4) { showToast('Brakuje danych broni do przygotowania quizu.'); return; }
      questions = makeWeaponQuestions(weapons);
    }
    catch (error) { showToast('Nie udało się załadować broni. Sprawdź połączenie z internetem i spróbuj ponownie.'); return; }
  }
  if (type === 'rank') {
    try {
      const ranks = await loadRankCatalog();
      if (ranks.length < 4) { showToast('Brakuje danych rang do przygotowania quizu.'); return; }
      questions = makeRankQuestions(ranks);
    }
    catch (error) { showToast('Nie udało się załadować rang. Sprawdź połączenie z internetem i spróbuj ponownie.'); return; }
  }
  if (type === 'glossary') {
    try { applyAbilityEnglishNames(await loadAbilityEnglishNames()); } catch (error) { /* Keep the Polish names available if the API is offline. */ }
  }
  const dialog = document.querySelector('#quiz-dialog');
  const labels = { role: ['QUIZ · ROLE', 'Dopasuj agenta do roli', 'role'], ability: ['QUIZ · UMIEJĘTNOŚCI', 'Czyja to umiejętność?', 'agents'], portrait: ['TRENING · PORTRETY', 'Rozpoznaj agenta', null], weapon: ['QUIZ · ARSENAŁ', 'Rozpoznaj broń', null], rank: ['QUIZ · RANGI', 'Rozpoznaj rangę', 'ranks'] };
  const gameLabels = Object.fromEntries(Object.entries(window.EXTRA_GAME_COURSES || {}).map(([id,game]) => [id, [`QUIZ · ${game.name.toLocaleUpperCase('pl')}`, `Podstawy: ${game.name}`, null]]));
  const allLabels = { ...labels, ...gameLabels, glossary: ['QUIZ · SŁOWNICZEK', 'Rozpoznaj pojęcie', null], 'fortnite-glossary': ['QUIZ · SŁOWNICZEK FORTNITE', 'Rozpoznaj pojęcie', null] };
  const [label,title,progressId] = allLabels[type] || labels.role;
  activeQuiz = { type, progressId };
  questionSet = questions || makeQuestions(type); questionIndex = 0; score = 0; selectedAnswer = null; answered = false;
  if (!questionSet.length) { showToast('Brakuje haseł w słowniczku do przygotowania quizu.'); return; }
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
  const quizMedia = question.definition
    ? `<div class="question-art question-definition">${esc(question.definition)}</div>`
    : question.videoId
    ? `<div class="question-art question-video-art"><iframe src="https://drive.google.com/file/d/${encodeURIComponent(question.videoId)}/preview" title="${esc(question.alt)}" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`
    : question.image ? `<div class="question-art ${activeQuiz.type === 'ability' ? 'question-icon-art' : ''} ${activeQuiz.type === 'weapon' ? 'question-weapon-art' : ''} ${activeQuiz.type === 'rank' ? 'question-rank-art' : ''}"><img src="${esc(question.image)}" alt="${esc(question.alt)}"></div>` : '';
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
  const resultNote = activeQuiz.type === 'portrait' ? `Twój najlepszy wynik w tej przeglądarce: ${saved.bestGuess || score} / 10.` : activeQuiz.progressId ? 'Wynik od 60% zapisuje ukończenie quizu w postępie kursu.' : 'Możesz zamknąć quiz albo zagrać ponownie.';
  document.querySelector('#quiz-options').innerHTML = `<div class="lesson-done">${resultNote}</div>`;
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
document.querySelector('#close-weapon-dialog').addEventListener('click', () => document.querySelector('#weapon-dialog').close());
document.querySelector('#weapon-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
navButtons.forEach(button => button.addEventListener('click', () => showScreen(button.dataset.nav)));
gameTabs.forEach(button => button.addEventListener('click', () => switchGame(button.dataset.game)));
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); switchGame('valorant'); });
showScreen('overview');

