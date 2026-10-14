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
let selectedMapTile = null;
let mapPuzzleChecked = false;
let mapCatalogPromise;
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
function updateNav(screen) {
  activeScreen = screen;
  const navScreen = screen === 'map-practice' ? 'practice' : screen;
  navButtons.forEach(button => button.classList.toggle('active', button.dataset.nav === navScreen));
  const names = { overview: 'START', roles: 'LEKCJA 1 / ROLE', agents: 'LEKCJA 2 / AGENCI', maps: 'LEKCJA 3 / MAPY', practice: 'TRENING', 'map-practice': 'TRENING / MAPY', extras: 'DODATKOWE LEKCJE' };
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
  const total = 3;
  const percent = Math.round(done / total * 100);
  return `<section class="progress-strip"><div class="progress-copy"><div class="progress-title">TWÓJ POSTĘP <span>${done} / ${total} LEKCJE UKOŃCZONE</span></div><div class="progress-track"><span style="width:${percent}%"></span></div></div><div class="progress-badge"><span>◈</span><div><b>${percent}%</b><small>KURSU GŁÓWNEGO</small></div></div></section>`;
}
function renderOverview() {
  root.innerHTML = `
    <section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> KURS DLA POCZĄTKUJĄCYCH <span class="eyebrow-line"></span></div><h1>OGARNIJ<br><em>VALORANTA.</em></h1><p>Trzy lekcje, Twoje nagrania i krótkie quizy, które pomogą zapamiętać role, agentów i callouty map.</p><button class="primary-button" data-go="roles">ZACZNIJ OD RÓL <span>↗</span></button><div class="hero-meta"><span>◷ W TWOIM TEMPIE</span><span>✳ 29 AGENTÓW</span><span>⌁ QUIZY 4-ODPOWIEDZIOWE</span></div></div><div class="hero-art" aria-hidden="true"><div class="art-grid"></div><div class="crosshair">+</div><div class="orbital orbital-one"></div><div class="orbital orbital-two"></div><div class="art-ring"><div class="art-core"><span class="core-top">SPIKE</span><span class="core-glyph">S</span><span class="core-bottom">TRAINING</span></div></div><div class="art-tag tag-top">TACTICAL <b>5v5</b></div><div class="art-tag tag-bottom"><span class="pulse"></span> READY WHEN YOU ARE</div><div class="art-corner"></div></div><div class="hero-side-label">TRAINING PROTOCOL <span>///</span> 001</div></section>
    ${progressMarkup()}
    <section class="course-section"><div class="section-head"><div><div class="eyebrow small"><span></span> TWOJA ŚCIEŻKA</div><h2>Zacznij od <em>podstaw.</em></h2></div><span class="section-count">01 — 03</span></div><div class="course-cards">
      <button class="course-card role-course" data-go="roles"><span class="course-number">LEKCJA 01</span><img src="valorant_role_jpg/Inicjator_rola.jpg" alt="" class="course-symbol"><span class="course-card-copy"><b>Role agentów</b><small>Poznaj cztery role i sprawdź się w quizie.</small></span><span class="course-arrow">↗</span></button>
      <button class="course-card agent-course" data-go="agents"><span class="course-number">LEKCJA 02</span><img src="valorant_portrety_agentow_jpg/Gekko_portret.jpg" alt="" class="course-symbol portrait-symbol"><span class="course-card-copy"><b>Agenci i umiejętności</b><small>29 nagrań, atlas postaci i quiz rozpoznawania umiejętności.</small></span><span class="course-arrow">↗</span></button>
      <button class="course-card map-course" data-go="maps"><span class="course-number">LEKCJA 03</span><span class="course-symbol map-course-symbol">⌖</span><span class="course-card-copy"><b>Mapy i callouty</b><small>Naucz się wszystkich miejsc na mapach, a potem sprawdź pamięć w quizie.</small></span><span class="course-arrow">↗</span></button>
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
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> POWTÓRKA W FORMIE GRY</div><h1>ZGADNIJ, <em>KTO TO?</em></h1><p>Krótki trening w stylu zgadywanki: portret agenta, ikonka umiejętności albo przypisanie do roli. Każde pytanie ma cztery odpowiedzi.</p></section><div class="practice-grid"><article class="practice-card"><div class="practice-symbol portrait-practice"><img src="${esc(agents.find(a=>a.name==='Sova')?.portrait || agents[0].portrait)}" alt=""></div><div class="eyebrow small"><span></span> ROZPOZNAWANIE</div><h2>Kto to <em>jest?</em></h2><p>Rozpoznaj agentów po ich portretach. 10 pytań, cztery odpowiedzi.</p><button class="primary-button" data-quiz="portrait">ZAGRAJ <span>↗</span></button></article><article class="practice-card"><div class="practice-symbol skill-practice"><img src="${esc(agents.flatMap(a=>a.abilities).find(x=>x.icon)?.icon || '')}" alt=""></div><div class="eyebrow small"><span></span> IKONY UMIEJĘTNOŚCI</div><h2>Czyja to <em>umiejętność?</em></h2><p>Spójrz na ikonkę i wybierz agenta, do którego należy.</p><button class="primary-button" data-quiz="ability">ZAGRAJ <span>↗</span></button></article><article class="practice-card"><div class="practice-symbol roles-practice"><div>4</div></div><div class="eyebrow small"><span></span> ROLE AGENTÓW</div><h2>Jaka to <em>rola?</em></h2><p>Wskaż rolę agenta na podstawie jego portretu.</p><button class="primary-button" data-quiz="role">ZAGRAJ <span>↗</span></button></article><article class="practice-card map-practice-card"><div class="practice-symbol map-practice-symbol"><span>MAPY</span><b>A</b><b>B</b></div><div class="eyebrow small"><span></span> SPRAWDŹ SIĘ</div><h2>Callouty <em>map.</em></h2><p>Uzupełnij puste punkty z pamięci i sprawdź wynik. Każda runda losuje kolejne miejsca.</p><button class="primary-button" data-go="map-practice">WYBIERZ MAPĘ <span>↗</span></button></article></div><p class="practice-footnote">Postęp lekcji zapisuje się w tej przeglądarce na tym urządzeniu.</p>`;
  bindScreenActions();
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
    root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA 03 · MAPY</div><h1>WYBIERZ <em>MAPĘ.</em></h1><p>Otwórz mapę nauki, aby zobaczyć komplet oznaczeń i legendę ze wszystkimi calloutami.</p></section><div class="map-lesson-grid">${maps.map(map => `<article class="map-lesson-card"><img src="${esc(map.image)}" alt="Minimapa ${esc(map.name)}" loading="lazy"><div class="map-lesson-copy"><div class="eyebrow small"><span></span> ${map.callouts.length} MIEJSC</div><h2>${esc(map.name)}</h2><button class="primary-button" data-map-id="${esc(map.id)}">UCZ SIĘ TEJ MAPY <span>↗</span></button></div></article>`).join('')}</div>`;
    root.querySelectorAll('[data-map-id]').forEach(button => button.addEventListener('click', () => {
      const map = maps.find(item => item.id === button.dataset.mapId);
      renderMapStudy(map);
    }));
  } catch (error) {
    const loading = root.querySelector('.map-loading');
    if (loading) loading.textContent = 'Nie udało się pobrać listy map. Sprawdź połączenie z internetem i spróbuj ponownie.';
  }
}
function renderMapStudy(map) {
  if (!map) return;
  updateNav('maps');
  root.innerHTML = `<section class="page-intro"><div class="eyebrow"><span></span> LEKCJA 03 · NAUKA MAPY</div><h1>${esc(map.name).toLocaleUpperCase('pl')} <em>CALLOUTY.</em></h1><p>Zapamiętuj punkty według numerów na minimapie i odpowiadających im nazw na liście. Potem sprawdź się bez podpowiedzi.</p></section><section class="map-study-layout"><div class="map-study-board"><div class="map-study-map"><img src="${esc(map.image)}" alt="Minimapa ${esc(map.name)} z oznaczonymi calloutami" draggable="false">${map.callouts.map((spot,index)=>`<span class="map-study-marker" style="left:${spot.x}%;top:${spot.y}%" aria-label="${index+1}: ${esc(spot.label)}">${index+1}</span>`).join('')}</div></div><aside class="map-study-legend"><div class="eyebrow small"><span></span> WSZYSTKIE MIEJSCA · ${map.callouts.length}</div><ol>${map.callouts.map((spot,index)=>`<li><b>${index+1}</b><span>${esc(spot.label)}</span></li>`).join('')}</ol></aside></section><div class="map-study-actions"><button class="secondary-button" id="map-study-back">← WSZYSTKIE MAPY</button><button class="primary-button" id="map-study-practice">SPRAWDŹ SIĘ Z TEJ MAPY <span>↗</span></button></div>`;
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
  bindQuizButtons(root);
}
function bindQuizButtons(scope) {
  scope.querySelectorAll('[data-quiz]').forEach(button => { if (button.dataset.quizBound) return; button.dataset.quizBound = '1'; button.addEventListener('click', () => startQuiz(button.dataset.quiz)); });
}
function showScreen(screen) {
  updateNav(screen);
  if (screen === 'roles') renderRoles();
  else if (screen === 'agents') renderAgents();
  else if (screen === 'maps') renderMapsLesson();
  else if (screen === 'map-practice') renderMapPracticeSelection();
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

