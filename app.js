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
  const names = { overview: 'START', roles: 'LEKCJA 1 / ROLE', agents: 'LEKCJA 2 / AGENCI', maps: 'LEKCJA 3 / MAPY', ranks: 'LEKCJA 4 / RANGI', weapons: 'ARSENAŁ', practice: 'TRENING', 'map-practice': 'TRENING / MAPY', extras: 'DODATKOWE LEKCJE', glossary: 'SŁOWNIK' };
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
  const lessonCards = game.id === 'fortnite'
    ? game.lessons.map((lesson,index) => `<article class="fortnite-topic-card"><div class="fortnite-topic-image"><img src="${esc(lesson.image)}" alt="${esc(lesson.imageAlt)}" loading="lazy"></div><div class="fortnite-topic-copy"><div class="eyebrow small"><span></span> ${esc(lesson.label)}</div><h3>${esc(lesson.title)}</h3><p>${esc(lesson.text)}</p>${index === 0 ? '<button class="primary-button fortnite-open-lesson" data-go="fortnite-weapons">OTWÓRZ LEKCJĘ <span>↗</span></button>' : ''}<div class="fortnite-topic-tip"><b>Wskazówka</b><span>${esc(lesson.tip)}</span></div><a class="fortnite-image-source" href="${esc(lesson.imageUrl)}" target="_blank" rel="noreferrer">Zdjęcie: ${esc(lesson.imageSource)} ↗</a></div></article>`).join('')
    : game.lessons.map((lesson,index) => `<details class="game-lesson" ${index === 0 ? 'open' : ''}><summary><span class="game-lesson-label">${esc(lesson.label)}</span><b>${esc(lesson.title)}</b><span class="game-lesson-toggle">＋</span></summary><div class="game-lesson-content"><p>${esc(lesson.text)}</p><div><b>Wskazówka</b><span>${esc(lesson.tip)}</span></div></div></details>`).join('');
  root.innerHTML = `<section class="game-course-page" data-game-course="${esc(game.id)}"><section class="game-course-hero"><div class="game-course-mark">${esc(game.logo).replace(/\n/g, '<br>')}</div><div class="game-course-copy"><div class="eyebrow"><span></span> ${esc(game.eyebrow)}</div><h1>POZNAJ <em>${esc(game.name)}.</em></h1><p>${esc(game.intro)}</p><button class="primary-button" data-quiz="${esc(game.id)}">QUIZ NA START · ${quizLength} PYTAŃ <span>↗</span></button></div></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PODSTAWY GRY</div><h2>Ucz się <em>krok po kroku.</em></h2></div><span class="section-count">${String(game.lessons.length).padStart(2, '0')} LEKCJI</span></div><div class="game-lesson-grid ${game.id === 'fortnite' ? 'fortnite-topic-grid' : ''}">${lessonCards}</div></section><section class="game-quiz-callout"><div><div class="eyebrow small"><span></span> SPRAWDŹ SIĘ</div><h2>Zapamiętałeś <em>podstawy?</em></h2><p>Odpowiedz na ${quizLength} losowanych pytań. Każde ma cztery odpowiedzi.</p></div><button class="primary-button" data-quiz="${esc(game.id)}">ROZPOCZNIJ QUIZ <span>↗</span></button></section><p class="game-source-list">Źródła oficjalne: ${game.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noreferrer">${esc(source.label)} ↗</a>`).join(' · ')}</p></section>`;
  bindScreenActions();
}
function renderFortniteWeaponsLesson() {
  const game = window.EXTRA_GAME_COURSES?.fortnite;
  if (!game) return;
  activeScreen = 'fortnite-weapons';
  document.querySelector('#crumb').textContent = 'FORTNITE / BROŃ I EKWIPUNEK';
  navButtons.forEach(button => button.classList.remove('active'));
  const weapons = [
    { name: 'Deadeye Assault Rifle', type: 'Karabin szturmowy · średni dystans', ammo: 'Amunicja średnia', image: 'https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/resize%3Dfit%3Aclip%2Cwidth%3A1920/quality%3Dvalue%3A80/cmigg5xai08to07naokxk9qmi' },
    { name: 'Holo Rush SMG', type: 'Pistolet maszynowy · bliski dystans', ammo: 'Amunicja lekka*', image: 'https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/resize%3Dfit%3Aclip%2Cwidth%3A1920/quality%3Dvalue%3A80/cmikemris4eka07ofo6vsalcb' },
    { name: 'Combat Pistol', type: 'Pistolet · broń krótka', ammo: 'Amunicja lekka*', image: 'https://cdn2.unrealengine.com/fortnite-combat-pistol-for-battle-royale-1900x600-b200b61a1111.jpg' },
    { name: 'Iron Pump Shotgun', type: 'Strzelba · bardzo bliski dystans', ammo: 'Naboje do strzelby', image: 'https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/resize%3Dfit%3Aclip%2Cwidth%3A1920/quality%3Dvalue%3A80/cmigg5xay08tv07naykwgiuj9' },
    { name: 'Twin Hammer Shotguns', type: 'Strzelby · szybkie starcia z bliska', ammo: 'Naboje do strzelby', image: 'https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/resize%3Dfit%3Aclip%2Cwidth%3A1920/quality%3Dvalue%3A80/cmigg5xbl0wym07mw4dww5p6b' },
    { name: 'Vengeful Sniper Rifle', type: 'Karabin snajperski · daleki dystans', ammo: 'Amunicja ciężka*', image: 'https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/resize%3Dfit%3Aclip%2Cwidth%3A1920/quality%3Dvalue%3A80/cmigg5xay0ws806n3yiw7iq55' },
    { name: 'Arc-Lightning Gun', type: 'Broń specjalna · energia', ammo: 'Energia / zasób specjalny', image: 'https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/resize%3Dfit%3Aclip%2Cwidth%3A1920/quality%3Dvalue%3A80/cmigg5xcl0wyw07mwgqgd8oml' },
    { name: 'Forsaken Vow Blade', type: 'Broń biała · walka wręcz', ammo: 'Bez amunicji', image: 'https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/resize%3Dfit%3Aclip%2Cwidth%3A1920/quality%3Dvalue%3A80/cmigg5xc00wyr07mwg5mtzfl7' }
  ];
  const ammo = [
    ['Lekka', 'Zwykle pistolety maszynowe i część pistoletów.'],
    ['Średnia', 'Zwykle karabiny szturmowe i część broni automatycznej.'],
    ['Naboje do strzelby', 'Strzelby; amunicja zużywana przy każdym strzale.'],
    ['Ciężka', 'Część karabinów snajperskich i broni precyzyjnej.'],
    ['Rakiety', 'Wyrzutnie i wybrane bronie wybuchowe.'],
    ['Energia / specjalna', 'Broń futurystyczna może mieć własny zasób, ładunki albo czas odnowienia.']
  ];
  const heals = [
    ['Apteczka', 'Odnawia zdrowie. Używaj, gdy masz bezpieczną chwilę; nie przekracza maksymalnego zdrowia.'],
    ['Bandaże', 'Szybciej uzupełniają niewielką część zdrowia; mają limit leczenia.'],
    ['Mgiełka medyczna', 'Stopniowo leczy użytkownika lub sojusznika, jeśli jest dostępna w danym sezonie.'],
    ['Mała mikstura osłony', 'Uzupełnia osłonę do określonego limitu.'],
    ['Mikstura osłony', 'Odnawia większą porcję osłony.'],
    ['Keg / przedmiot obszarowy', 'Może odnawiać osłonę graczom w pobliżu; szczegóły zależą od przedmiotu.'],
    ['Przedmioty łączące leczenie i osłonę', 'Wybrane rzadkie przedmioty odnawiają oba paski lub dają efekt specjalny.']
  ];
  root.innerHTML = `<section class="game-course-page fortnite-detail-page"><button class="secondary-button fortnite-back-button" data-return-fortnite>← WRÓĆ DO LEKCJI FORTNITE</button><section class="page-intro"><div class="eyebrow"><span></span> FORTNITE · LEKCJA 01</div><h1>BROŃ I <em>EKWIPUNEK.</em></h1><p>Poznaj główne klasy broni, typy amunicji, pasek ekwipunku oraz przedmioty odnawiające zdrowie i osłonę.</p></section><div class="fortnite-topic-tip fortnite-rotation-note"><b>Ważne</b><span>Fortnite regularnie zmienia dostępne bronie i przedmioty. Poniższe grafiki pokazują przykłady z oficjalnych materiałów Epic, a nie gwarantowaną listę aktualnego sezonu. Dokładny rodzaj amunicji sprawdzisz po ikonie przy broni w meczu.</span></div><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> ARSENAŁ</div><h2>Klasy broni i <em>przykłady.</em></h2></div><span class="section-count">${weapons.length} PRZYKŁADÓW</span></div><div class="fortnite-weapon-grid">${weapons.map(weapon => `<article class="fortnite-weapon-card"><div class="fortnite-weapon-image"><img src="${esc(weapon.image)}" alt="${esc(weapon.name)} — grafika broni Fortnite" loading="lazy" onerror="this.closest('.fortnite-weapon-image').classList.add('image-missing');this.remove()"><span>GRAFIKA EPIC GAMES</span></div><div class="fortnite-weapon-copy"><h3>${esc(weapon.name)}</h3><p>${esc(weapon.type)}</p><div><b>Amunicja</b><span>${esc(weapon.ammo)}</span></div></div></article>`).join('')}</div><p class="fortnite-footnote">* Typy amunicji mogą się różnić w zależności od wariantu lub sezonu. Broń specjalna i biała nie zawsze korzysta z klasycznych nabojów.</p></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> AMUNICJA</div><h2>Co do czego <em>pasuje?</em></h2></div></div><div class="fortnite-info-grid">${ammo.map(([name,description],index) => `<article class="fortnite-info-card"><span class="fortnite-info-number">0${index+1}</span><h3>${esc(name)}</h3><p>${esc(description)}</p></article>`).join('')}</div><p class="fortnite-footnote">To typowe skojarzenia, nie sztywna reguła. Fortnite potrafi zmienić amunicję broni w aktualizacji. Porównaj ikonę przy nazwie broni z ikoną amunicji w plecaku.</p></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> PASEK EKWIPUNKU</div><h2>Co nosisz <em>ze sobą?</em></h2></div></div><div class="fortnite-inventory-demo"><div class="fortnite-inventory-hud"><span class="fortnite-hud-label">PRZYKŁADOWY PASEK · BATTLE ROYALE</span><div class="fortnite-slots">${[['1','KILOF','⛏'],['2','STRZELBA','▰'],['3','KARABIN','▰'],['4','LECZENIE','✚'],['5','MOBILITY','↗']].map(slot=>`<div class="fortnite-slot"><small>${slot[0]}</small><b>${slot[2]}</b><span>${slot[1]}</span></div>`).join('')}</div><div class="fortnite-bars"><span>❤ ZDROWIE <b>100</b></span><i><b></b></i><span>⬡ OSŁONA <b>100</b></span><i><b></b></i></div></div><div class="fortnite-inventory-explain"><h3>Sloty to szybki dostęp</h3><p>W standardowym Battle Royale pasek pozwala szybko przełączać się między noszoną bronią i przedmiotami. Możesz trzymać tam np. broń na bliski i dalszy dystans, leczenie oraz mobility. Amunicja i materiały zwykle są liczone osobno. Kilof służy do zbierania materiałów i jest przypisany do osobnego sterowania; widok może różnić się zależnie od platformy, trybu i aktualizacji.</p><p><b>Zdrowie</b> to czerwony pasek. <b>Osłona</b> to niebieski pasek — chroni przed obrażeniami, ale nie zastępuje zdrowia.</p></div></div></section><section class="game-learning-section"><div class="section-head"><div><div class="eyebrow small"><span></span> LECZENIE I OSŁONA</div><h2>Jak odzyskać <em>siły?</em></h2></div></div><div class="fortnite-info-grid fortnite-heal-grid">${heals.map(([name,description],index) => `<article class="fortnite-info-card"><span class="fortnite-info-number">0${index+1}</span><h3>${esc(name)}</h3><p>${esc(description)}</p></article>`).join('')}</div><div class="fortnite-topic-tip fortnite-heal-tip"><b>Jak użyć?</b><span>Wybierz przedmiot na pasku, użyj przycisku akcji i poczekaj, aż animacja użycia się skończy. Schowaj się za osłoną i sprawdź, który pasek uzupełnia przedmiot. Większość przedmiotów ma czas użycia i nie zadziała ponad limit zdrowia lub osłony.</span></div></section><p class="game-source-list">Źródła i przykładowe grafiki: <a href="https://www.fortnite.com/news/fortnite-battle-royale-chapter-seven-pacific-break-v39-00-update-notes" target="_blank" rel="noreferrer">Epic Games · rozdział i przykładowy arsenał ↗</a> · <a href="https://www.fortnite.com/news/fortnite-override-break-the-rules-change-the-game" target="_blank" rel="noreferrer">Epic Games · aktualny sezon ↗</a>.</p></section>`;
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
  bindQuizButtons(root);
}
function bindQuizButtons(scope) {
  scope.querySelectorAll('[data-quiz]').forEach(button => { if (button.dataset.quizBound) return; button.dataset.quizBound = '1'; button.addEventListener('click', () => startQuiz(button.dataset.quiz)); });
}
function showScreen(screen) {
  if (screen === 'fortnite-weapons') { renderFortniteWeaponsLesson(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
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
  else renderOverview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function makeQuestions(type) {
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
  const allLabels = { ...labels, ...gameLabels, glossary: ['QUIZ · SŁOWNICZEK', 'Rozpoznaj pojęcie', null] };
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

