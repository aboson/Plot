// Plot: richtig gute Filme finden, im Look von Hinge.
// Daten und Bilder kommen von The Movie Database (TMDB).

const API = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/';
const LANG = 'de-DE';
const REGION = 'DE';
const STORE_KEY = 'plot.v1';

// Wie streng "richtig gut" ist. Sind alle Filme einer Stufe gesehen, geht es mit der nächsten weiter.
const TIERS = [
  { 'vote_average.gte': 7.5, 'vote_count.gte': 1500 },
  { 'vote_average.gte': 7.2, 'vote_count.gte': 600 },
  { 'vote_average.gte': 7.0, 'vote_count.gte': 250 },
];

const svg = (body, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
const HEART = '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>';
const STAR = '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';

const ICON = {
  heart: svg(HEART),
  heartFill: svg(HEART, 'style="fill:currentColor"'),
  x: svg('<path d="M18 6 6 18M6 6l12 12"/>', 'stroke-width="2.4"'),
  undo: svg('<path d="M1 4v6h6"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>'),
  star: svg(STAR),
  starFill: svg(STAR, 'style="fill:currentColor"'),
  calendar: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  clock: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  globe: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
  shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  film: svg('<rect x="2" y="2" width="20" height="20" rx="2.2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>'),
  tag: svg('<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>'),
  type: svg('<path d="M4 7V4h16v3M9 20h6M12 4v16"/>'),
  users: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
  play: svg('<path d="M7 4.5v15l12.5-7.5z" style="fill:currentColor"/>'),
  back: svg('<path d="M15 18l-6-6 6-6"/>', 'stroke-width="2.4"'),
  user: svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  share: svg('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>'),
  arrow: svg('<path d="M5 12h14M12 5l7 7-7 7"/>', 'stroke-width="2.4"'),
  logo: '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="11" y="19.5" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="22" font-weight="600" fill="currentColor">P</text><circle cx="19" cy="18" r="2" fill="currentColor"/></svg>',
};

// ---------- Kleinkram ----------

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const img = (size, path) => (path ? IMG + size + path : '');
const rating = (v) => (Number(v) || 0).toFixed(1).replace('.', ',');
const num = new Intl.NumberFormat('de-DE');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('');

const regionName = (() => {
  try {
    const names = new Intl.DisplayNames(['de'], { type: 'region' });
    return (code) => {
      try { return names.of(code); } catch { return code; }
    };
  } catch {
    return (code) => code;
  }
})();

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function runtimeText(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} Std${m ? ` ${m} Min` : ''}` : `${m} Min`;
}

// ---------- Speicher (bleibt nur auf diesem Gerät) ----------

const store = loadStore();
const seen = new Set(store.seen);

function loadStore() {
  const empty = { key: '', likes: [], seen: [], history: [], newLikes: false };
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') };
  } catch {
    return empty;
  }
}

function save() {
  store.seen = [...seen];
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Privater Modus oder Speicher voll: App läuft trotzdem weiter
  }
}

// ---------- TMDB ----------

class AuthError extends Error {}

async function tmdb(path, params = {}, key = store.key) {
  const url = new URL(API + path);
  const headers = { accept: 'application/json' };
  // Der lange "Read Access Token" geht als Bearer, der kurze "API Key" als Parameter
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  else url.searchParams.set('api_key', key);
  for (const [k, v] of Object.entries(params)) if (v != null) url.searchParams.set(k, v);

  const res = await fetch(url, { headers });
  if (res.status === 401) throw new AuthError('Schlüssel abgelehnt');
  if (!res.ok) throw new Error(`TMDB antwortet mit ${res.status}`);
  return res.json();
}

const movieCache = new Map();

function getMovie(id) {
  if (!movieCache.has(id)) {
    const promise = loadMovie(id);
    movieCache.set(id, promise);
    promise.catch(() => movieCache.delete(id));
  }
  return movieCache.get(id);
}

async function loadMovie(id) {
  const d = await tmdb(`/movie/${id}`, {
    language: LANG,
    append_to_response: 'videos,credits,images,watch/providers,release_dates',
    include_image_language: 'null,de,en',
    include_video_language: 'de,en,null',
  });
  if (!d.overview) {
    try {
      const en = await tmdb(`/movie/${id}`, { language: 'en-US' });
      d.overview = en.overview;
    } catch (e) {
      if (e instanceof AuthError) throw e;
    }
  }
  return normalize(d);
}

function normalize(d) {
  const crew = d.credits?.crew || [];
  const cast = (d.credits?.cast || []).slice(0, 8).map((c) => ({
    name: c.name,
    character: c.character,
    img: c.profile_path,
  }));

  // Szenenbilder: erst die ohne Text, dann der Rest, beste zuerst
  const shots = [...(d.images?.backdrops || [])].sort((a, b) => b.vote_average - a.vote_average);
  const textless = shots.filter((b) => !b.iso_639_1 || b.iso_639_1 === 'xx');
  const backdrops = [...new Set([d.backdrop_path, ...textless.map((b) => b.file_path), ...shots.map((b) => b.file_path)].filter(Boolean))].slice(0, 3);

  const score = (v) => (v.type === 'Trailer' ? 4 : 2) + (v.iso_639_1 === 'de' ? 2 : 0) + (v.official ? 1 : 0);
  const trailer = (d.videos?.results || [])
    .filter((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
    .sort((a, b) => score(b) - score(a))[0];

  const release = d.release_dates?.results?.find((r) => r.iso_3166_1 === REGION);
  const fsk = release?.release_dates?.map((r) => r.certification).find((c) => c && c.trim());

  const wp = d['watch/providers']?.results?.[REGION];
  const providers = new Map();
  for (const [kind, label] of [['flatrate', 'Im Abo'], ['free', 'Kostenlos'], ['ads', 'Mit Werbung'], ['rent', 'Leihen'], ['buy', 'Kaufen']]) {
    for (const p of wp?.[kind] || []) {
      const entry = providers.get(p.provider_id) || { name: p.provider_name, logo: p.logo_path, kinds: [] };
      if (!entry.kinds.includes(label)) entry.kinds.push(label);
      providers.set(p.provider_id, entry);
    }
  }

  return {
    id: d.id,
    title: d.title || d.original_title,
    originalTitle: d.original_title,
    year: (d.release_date || '').slice(0, 4),
    runtime: d.runtime,
    rating: d.vote_average || 0,
    votes: d.vote_count || 0,
    genres: (d.genres || []).map((g) => g.name),
    tagline: (d.tagline || '').trim(),
    overview: (d.overview || '').trim(),
    poster: d.poster_path,
    backdrops,
    directors: crew.filter((c) => c.job === 'Director').map((c) => c.name),
    cast,
    trailer: trailer?.key || null,
    fsk: fsk || null,
    countries: (d.production_countries || []).slice(0, 2).map((c) => regionName(c.iso_3166_1)),
    providers: [...providers.values()].slice(0, 6),
    providerLink: wp?.link || null,
  };
}

// ---------- Film-Nachschub ----------

const feed = { queue: [], tier: 0, total: null, tried: new Set(), loading: null };

function choosePage() {
  if (feed.total == null) return 1;
  const open = [];
  for (let p = 1; p <= feed.total; p++) if (!feed.tried.has(p)) open.push(p);
  if (open.length) return open[Math.floor(Math.random() * open.length)];
  if (feed.tier < TIERS.length - 1) {
    feed.tier++;
    feed.total = null;
    feed.tried.clear();
    return 1;
  }
  return null;
}

function refill() {
  if (!feed.loading) feed.loading = doRefill().finally(() => (feed.loading = null));
  return feed.loading;
}

async function doRefill() {
  const known = new Set(feed.queue);
  const picks = new Map();
  const take = (list, ok = () => true) => {
    for (const m of list || []) {
      if (m && m.poster_path && !m.adult && !seen.has(m.id) && !known.has(m.id) && ok(m)) picks.set(m.id, m);
    }
  };

  // Ab und zu Empfehlungen passend zu deinen Likes einstreuen
  if (store.likes.length && Math.random() < 0.35) {
    const seed = store.likes[Math.floor(Math.random() * Math.min(store.likes.length, 12))];
    try {
      const data = await tmdb(`/movie/${seed.id}/recommendations`, { language: LANG });
      take(data.results, (m) => m.vote_average >= 7 && m.vote_count >= 300);
    } catch (e) {
      if (e instanceof AuthError) throw e;
    }
  }

  for (let tries = 0; picks.size < 6 && tries < 8; tries++) {
    const page = choosePage();
    if (page == null) break;
    const data = await tmdb('/discover/movie', {
      language: LANG,
      sort_by: 'popularity.desc',
      include_adult: false,
      include_video: false,
      without_genres: '10770',
      ...TIERS[feed.tier],
      page,
    });
    feed.total = clamp(data.total_pages || 1, 1, 500);
    feed.tried.add(page);
    take(data.results);
  }

  feed.queue.push(...shuffle([...picks.keys()]));
}

async function nextId() {
  for (let round = 0; round < 3; round++) {
    while (feed.queue.length) {
      const id = feed.queue.shift();
      if (!seen.has(id)) return id;
    }
    await refill();
  }
  return null;
}

function topUp() {
  if (feed.queue.length < 5) refill().catch(() => {});
  const upcoming = feed.queue[0];
  if (upcoming) {
    getMovie(upcoming)
      .then((m) => { if (m.poster) new Image().src = img('w780', m.poster); })
      .catch(() => {});
  }
}

// ---------- Profil eines Films (wie ein Hinge-Profil) ----------

function renderProfile(m, likeable) {
  const heart = (kind, label) =>
    likeable
      ? `<button class="like-btn" data-like="${kind}" data-label="${esc(label)}" aria-label="${esc(label)} liken">${ICON.heart}</button>`
      : '';
  const parts = [
    photo(img('w780', m.poster), 'poster', m.title, heart('poster', 'Das Poster'), true),
    vitals(m),
  ];
  if (m.overview) parts.push(prompt("Darum geht's", m.overview, heart('overview', "Darum geht's")));
  if (m.backdrops[0]) parts.push(photo(img('w1280', m.backdrops[0]), 'still', '', heart('backdrop:0', 'Eine Szene')));
  if (m.tagline) parts.push(prompt('Der Film in einem Satz', m.tagline, heart('tagline', 'Der Film in einem Satz')));
  if (m.trailer) parts.push(trailerCard(m.trailer, heart('trailer', 'Der Trailer')));
  if (m.backdrops[1]) parts.push(photo(img('w1280', m.backdrops[1]), 'still', '', heart('backdrop:1', 'Eine Szene')));
  if (m.cast.length) parts.push(castCard(m.cast, heart('cast', 'Die Besetzung')));
  if (m.providers.length) parts.push(providersCard(m, heart('providers', 'Wo er läuft')));
  if (m.backdrops[2]) parts.push(photo(img('w1280', m.backdrops[2]), 'still', '', heart('backdrop:2', 'Eine Szene')));
  return parts.join('');
}

function photo(src, kind, alt, heart, eager = false) {
  const image = src
    ? `<img src="${src}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" draggable="false">`
    : '';
  return `<figure class="photo ${kind}">${image}${heart}</figure>`;
}

function prompt(question, answer, heart) {
  const size = answer.length < 80 ? 'xl' : answer.length < 200 ? 'l' : 'm';
  return `<div class="card prompt"><h3>${esc(question)}</h3><p class="answer ${size}">${esc(answer)}</p>${heart}</div>`;
}

function vitals(m) {
  const top = [
    m.rating && [ICON.star, rating(m.rating)],
    m.year && [ICON.calendar, m.year],
    m.runtime && [ICON.clock, runtimeText(m.runtime)],
    m.fsk && [ICON.shield, `FSK ${m.fsk}`],
    m.countries.length && [ICON.globe, m.countries.join(', ')],
  ].filter(Boolean);
  const lines = [
    m.directors.length && [ICON.film, `Regie: ${m.directors.join(', ')}`],
    m.genres.length && [ICON.tag, m.genres.join(', ')],
    m.originalTitle && m.originalTitle !== m.title && [ICON.type, `Originaltitel: ${m.originalTitle}`],
    m.votes && [ICON.users, `${num.format(m.votes)} Bewertungen auf TMDB`],
  ].filter(Boolean);
  return `
    <div class="card vitals">
      <div class="vitals-row" data-noswipe>
        ${top.map(([icon, text]) => `<span class="vital">${icon}<span>${esc(text)}</span></span>`).join('')}
      </div>
      ${lines.map(([icon, text]) => `<div class="vital-line">${icon}<span>${esc(text)}</span></div>`).join('')}
    </div>`;
}

function trailerCard(key, heart) {
  return `
    <div class="card trailer-card">
      <div class="video">
        <button class="trailer-play" data-key="${esc(key)}" aria-label="Trailer abspielen">
          <img src="https://i.ytimg.com/vi/${encodeURIComponent(key)}/hqdefault.jpg" alt="" loading="lazy" draggable="false">
          <span class="play">${ICON.play}</span>
        </button>
      </div>
      <div class="trailer-foot"><h3>Der Trailer</h3>${heart}</div>
    </div>`;
}

function playTrailer(button) {
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(button.dataset.key)}?autoplay=1&playsinline=1&rel=0`;
  frame.title = 'Trailer';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  button.replaceWith(frame);
}

function castCard(cast, heart) {
  const people = cast
    .map(
      (c) => `
      <div class="person">
        <div class="avatar">${esc(initials(c.name))}${c.img ? `<img src="${img('w185', c.img)}" alt="" loading="lazy" draggable="false">` : ''}</div>
        <b>${esc(c.name)}</b>
        ${c.character ? `<small>${esc(c.character)}</small>` : ''}
      </div>`,
    )
    .join('');
  return `<div class="card prompt cast"><h3>In den Hauptrollen</h3><div class="cast-row" data-noswipe>${people}</div>${heart}</div>`;
}

function providersCard(m, heart) {
  const rows = m.providers
    .map(
      (p) => `
      <li>
        <span class="prov-logo">${p.logo ? `<img src="${img('w92', p.logo)}" alt="" loading="lazy" draggable="false">` : ''}</span>
        <div><b>${esc(p.name)}</b><small>${esc(p.kinds.join(', '))}</small></div>
      </li>`,
    )
    .join('');
  const link = m.providerLink
    ? `<a class="fine-link" href="${esc(m.providerLink)}" target="_blank" rel="noopener">Alle Angebote ansehen</a>`
    : '';
  return `
    <div class="card prompt providers">
      <h3>Hier kannst du ihn sehen</h3>
      <ul class="prov-list">${rows}</ul>
      ${link}
      <p class="fine">Streaming-Daten von JustWatch</p>
      ${heart}
    </div>`;
}

const skeleton = () => '<div class="sk sk-photo"></div><div class="sk sk-card"></div><div class="sk sk-card"></div>';

function errorState(e, container, retry = true) {
  if (e instanceof AuthError) {
    store.key = '';
    save();
    renderOnboarding('TMDB hat deinen Schlüssel abgelehnt. Gib ihn bitte nochmal ein.');
    return;
  }
  console.error(e);
  const offline = !navigator.onLine;
  container.innerHTML = `
    <div class="state">
      <p class="state-title">${offline ? 'Du bist offline.' : 'Da hat was nicht geklappt.'}</p>
      <p>${offline ? 'Sobald du wieder Netz hast, geht es weiter.' : 'TMDB hat gerade nicht geantwortet.'}</p>
      ${retry ? '<button class="btn-primary small" data-action="retry">Nochmal versuchen</button>' : ''}
    </div>`;
}

// ---------- App-Gerüst ----------

const app = $('#app');
let tab = 'discover';

function renderShell() {
  app.innerHTML = `
    <main class="screens">
      <section class="screen" id="screen-discover"></section>
      <section class="screen" id="screen-likes" hidden></section>
      <section class="screen" id="screen-me" hidden></section>
    </main>
    <nav class="tabbar">
      <button data-tab="discover" aria-label="Entdecken">${ICON.logo}</button>
      <button data-tab="likes" aria-label="Likes">${ICON.heart}<span class="badge" hidden></span></button>
      <button data-tab="me" aria-label="Du">${ICON.user}</button>
    </nav>`;
  $('.tabbar', app).addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) showTab(b.dataset.tab);
  });
  initDiscover();
  initLikes();
  initMe();
  showTab('discover');
  updateBadge();
  showNext();
}

function showTab(name) {
  tab = name;
  for (const s of app.querySelectorAll('.screen')) s.hidden = s.id !== `screen-${name}`;
  for (const b of app.querySelectorAll('.tabbar [data-tab]')) {
    if (b.dataset.tab === name) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  }
  if (name === 'likes') {
    store.newLikes = false;
    save();
    updateBadge();
    renderLikes();
  }
  if (name === 'me') renderMe();
}

function updateBadge() {
  const badge = $('.tabbar .badge', app);
  if (badge) badge.hidden = !store.newLikes;
}

// ---------- Entdecken ----------

const discover = { el: null, profile: null, current: null, busy: false, token: 0 };
let justDragged = false;

function initDiscover() {
  const el = $('#screen-discover');
  el.innerHTML = `
    <header class="topbar">
      <div class="topbar-text">
        <h1 class="title" id="d-title">Plot</h1>
        <p class="subtitle" id="d-sub">&nbsp;</p>
      </div>
      <button class="icon-btn" data-action="undo" aria-label="Letzten Film zurückholen" disabled>${ICON.undo}</button>
    </header>
    <div class="deck">
      <div class="profile" id="d-profile"></div>
      <div class="swipe-pill pill-like" aria-hidden="true">${ICON.heartFill}Merken</div>
      <div class="swipe-pill pill-nope" aria-hidden="true">${ICON.x}Weiter</div>
    </div>
    <button class="fab-skip" data-action="skip" aria-label="Weiter zum nächsten Film">${ICON.x}</button>`;
  discover.el = el;
  discover.profile = $('#d-profile', el);

  // Nach einem Wisch kein versehentlicher Klick
  discover.profile.addEventListener('click', (e) => {
    if (justDragged) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  el.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.classList.contains('like-btn')) return openLikeSheet(t.dataset.like, t.dataset.label);
    if (t.classList.contains('trailer-play')) return playTrailer(t);
    switch (t.dataset.action) {
      case 'skip': return decide('skip');
      case 'seen': return decide('skip');
      case 'undo': return undo();
      case 'retry': return showNext();
    }
  });

  attachSwipe(discover.profile);
}

function setHeader(m) {
  const title = $('#d-title');
  const sub = $('#d-sub');
  if (!m) {
    title.textContent = 'Plot';
    title.classList.remove('long');
    sub.textContent = 'Suche richtig gute Filme …';
  } else {
    title.textContent = m.title;
    title.classList.toggle('long', m.title.length > 22);
    const rest = [m.genres[0], m.year].filter(Boolean).join(' · ');
    sub.innerHTML = `${ICON.starFill}<span>${rating(m.rating)}</span>${rest ? `<span>·</span><span>${esc(rest)}</span>` : ''}`;
  }
  $('[data-action=undo]', discover.el).disabled = !store.history.length;
}

async function showNext() {
  const { profile } = discover;
  const token = ++discover.token;
  discover.current = null;
  resetDeck();
  setHeader(null);
  $('.fab-skip', discover.el).hidden = false;
  profile.innerHTML = skeleton();
  profile.scrollTop = 0;
  try {
    const id = await nextId();
    if (token !== discover.token) return;
    if (id == null) {
      $('#d-sub').textContent = '';
      $('.fab-skip', discover.el).hidden = true;
      profile.innerHTML = `
        <div class="state">
          <p class="state-title">Du hast alle richtig guten Filme durch.</p>
          <p>Unter „Du“ kannst du übersprungene Filme wieder einblenden.</p>
        </div>`;
      return;
    }
    const m = await getMovie(id);
    if (token !== discover.token) return;
    discover.current = m;
    setHeader(m);
    profile.innerHTML = `${renderProfile(m, true)}
      <div class="profile-end">
        <button class="btn-ghost" data-action="seen">Kenn ich schon</button>
      </div>`;
    profile.scrollTop = 0;
    profile.classList.remove('enter');
    void profile.offsetWidth;
    profile.classList.add('enter');
    topUp();
  } catch (e) {
    if (token === discover.token) errorState(e, profile);
  }
}

function resetDeck() {
  const p = discover.profile;
  p.style.transition = 'none';
  p.style.transform = '';
  p.style.opacity = '';
  for (const pill of discover.el.querySelectorAll('.swipe-pill')) pill.style.opacity = 0;
}

function decide(action, like = {}) {
  const m = discover.current;
  if (!m || discover.busy) return;
  discover.busy = true;
  seen.add(m.id);
  store.history = [...store.history, { id: m.id, action }].slice(-30);
  if (action === 'like') {
    const entry = {
      id: m.id,
      title: m.title,
      year: m.year,
      genre: m.genres[0] || '',
      rating: m.rating,
      poster: m.poster,
      item: like.label || '',
      note: like.note || '',
      at: Date.now(),
    };
    store.likes = [entry, ...store.likes.filter((l) => l.id !== m.id)];
    store.newLikes = true;
  }
  save();
  updateBadge();
  flyOut(action === 'like' ? 1 : -1).then(() => {
    discover.busy = false;
    showNext();
  });
}

function flyOut(dir) {
  const p = discover.profile;
  $(dir > 0 ? '.pill-like' : '.pill-nope', discover.el).style.opacity = 1;
  if (reducedMotion.matches) return Promise.resolve();
  p.style.transition = 'transform .3s cubic-bezier(.4, 0, 1, 1), opacity .3s ease';
  p.style.transform = `translateX(${dir * 130}%) rotate(${dir * 14}deg)`;
  p.style.opacity = '0';
  return new Promise((resolve) => setTimeout(resolve, 290));
}

function undo() {
  if (discover.busy) return;
  const last = store.history.pop();
  if (!last) return;
  seen.delete(last.id);
  if (last.action === 'like') store.likes = store.likes.filter((l) => l.id !== last.id);
  if (discover.current) feed.queue.unshift(discover.current.id);
  feed.queue.unshift(last.id);
  save();
  showNext();
}

function attachSwipe(profile) {
  const likePill = $('.pill-like', discover.el);
  const nopePill = $('.pill-nope', discover.el);
  let g = null;

  const showPills = (dx) => {
    likePill.style.opacity = clamp(dx / 90, 0, 1);
    nopePill.style.opacity = clamp(-dx / 90, 0, 1);
  };

  profile.addEventListener('pointerdown', (e) => {
    if (!discover.current || discover.busy || e.button > 0) return;
    if (e.target.closest('[data-noswipe], iframe')) return;
    g = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), drag: false, dx: 0 };
  });

  profile.addEventListener('pointermove', (e) => {
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.drag) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        g.drag = true;
        try { profile.setPointerCapture(e.pointerId); } catch {}
        profile.style.transition = 'none';
      } else {
        if (Math.abs(dy) > 10) g = null; // senkrecht: ganz normal scrollen
        return;
      }
    }
    g.dx = dx;
    profile.style.transform = `translateX(${dx}px) rotate(${dx / 28}deg)`;
    showPills(dx);
  });

  const end = (e) => {
    if (!g || e.pointerId !== g.id) return;
    const { drag, dx, t } = g;
    g = null;
    if (!drag) return;
    justDragged = true;
    setTimeout(() => (justDragged = false), 80);
    const speed = dx / Math.max(1, performance.now() - t);
    const done = e.type === 'pointerup';
    if (done && (dx > 110 || (dx > 40 && speed > 0.5))) decide('like');
    else if (done && (dx < -110 || (dx < -40 && speed < -0.5))) decide('skip');
    else {
      profile.style.transition = 'transform .3s cubic-bezier(.2, .8, .2, 1)';
      profile.style.transform = '';
      showPills(0);
    }
  };
  profile.addEventListener('pointerup', end);
  profile.addEventListener('pointercancel', end);
}

// ---------- Like mit Notiz (wie "Like senden" bei Hinge) ----------

function previewFor(m, kind) {
  if (kind === 'poster') return `<img class="pv-img poster" src="${img('w500', m.poster)}" alt="">`;
  if (kind.startsWith('backdrop:')) return `<img class="pv-img" src="${img('w780', m.backdrops[Number(kind.split(':')[1])])}" alt="">`;
  if (kind === 'trailer') return `<img class="pv-img" src="https://i.ytimg.com/vi/${encodeURIComponent(m.trailer)}/hqdefault.jpg" alt="">`;
  const [question, answer] = {
    overview: ["Darum geht's", m.overview],
    tagline: ['Der Film in einem Satz', m.tagline],
    cast: ['In den Hauptrollen', m.cast.slice(0, 4).map((c) => c.name).join(', ')],
    providers: ['Hier kannst du ihn sehen', m.providers.map((p) => p.name).join(', ')],
  }[kind] || ['', ''];
  return `<div class="card pv-prompt"><h3>${esc(question)}</h3><p class="answer l">${esc(answer)}</p></div>`;
}

function openLikeSheet(kind, label) {
  const m = discover.current;
  if (!m || discover.busy) return;
  const layer = document.createElement('div');
  layer.className = 'sheet-backdrop';
  layer.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(m.title)} merken">
      <p class="sheet-kicker">${esc(m.title)}</p>
      ${previewFor(m, kind)}
      <textarea rows="2" maxlength="140" placeholder="Notiz hinzufügen (optional)" aria-label="Notiz"></textarea>
      <button class="btn-primary" data-action="confirm">${ICON.heartFill}<span>Merken</span></button>
      <button class="btn-text" data-action="cancel">Abbrechen</button>
    </div>`;
  app.appendChild(layer);

  const close = () => {
    layer.classList.add('closing');
    setTimeout(() => layer.remove(), 190);
  };
  layer.addEventListener('click', (e) => {
    if (e.target === layer || e.target.closest('[data-action=cancel]')) close();
    else if (e.target.closest('[data-action=confirm]')) {
      const note = $('textarea', layer).value.trim();
      close();
      decide('like', { label, note });
    }
  });
}

// ---------- Likes ----------

function initLikes() {
  $('#screen-likes').addEventListener('click', (e) => {
    const row = e.target.closest('[data-open]');
    if (row) openDetail(Number(row.dataset.open));
  });
}

function renderLikes() {
  const n = store.likes.length;
  const rows = store.likes
    .map((l) => {
      const line = l.note ? `„${l.note}“` : l.item ? `Dir gefiel: ${l.item}` : [l.genre, l.year].filter(Boolean).join(' · ');
      return `
        <li><button class="like-row" data-open="${l.id}">
          <span class="thumb">${l.poster ? `<img src="${img('w185', l.poster)}" alt="" loading="lazy">` : ''}</span>
          <span class="like-meta"><b>${esc(l.title)}</b><span>${esc(line)}</span></span>
          <span class="like-rating">${ICON.starFill}${rating(l.rating)}</span>
        </button></li>`;
    })
    .join('');
  $('#screen-likes').innerHTML = `
    <header class="topbar">
      <div class="topbar-text">
        <h1 class="title">Likes</h1>
        <p class="subtitle">${n ? `${n} ${n === 1 ? 'Film' : 'Filme'} gemerkt` : 'Noch leer'}</p>
      </div>
    </header>
    <div class="scroll">
      ${n
        ? `<ul class="like-list">${rows}</ul>`
        : `<div class="state">
            <p class="state-title">Hier landen deine Filme.</p>
            <p>Wisch nach rechts oder tipp auf ein Herz, wenn dich ein Film reizt.</p>
          </div>`}
    </div>`;
}

function openDetail(id) {
  const like = store.likes.find((l) => l.id === id);
  const layer = document.createElement('div');
  layer.className = 'overlay';
  layer.innerHTML = `
    <header class="topbar">
      <button class="icon-btn" data-action="close" aria-label="Zurück">${ICON.back}</button>
      <div class="topbar-text"><h1 class="title ${(like?.title || '').length > 22 ? 'long' : ''}">${esc(like?.title || '')}</h1></div>
    </header>
    <div class="profile static">${skeleton()}</div>`;
  app.appendChild(layer);
  const body = $('.profile', layer);

  const close = () => {
    layer.classList.add('leaving');
    setTimeout(() => layer.remove(), 210);
  };
  layer.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.action === 'close') close();
    else if (t.classList.contains('trailer-play')) playTrailer(t);
    else if (t.dataset.action === 'remove') {
      store.likes = store.likes.filter((l) => l.id !== id);
      save();
      renderLikes();
      close();
    }
  });

  getMovie(id)
    .then((m) => {
      const note = like?.note
        ? `<div class="card note-card"><h3>Deine Notiz</h3><p class="answer l">${esc(like.note)}</p></div>`
        : '';
      body.innerHTML = `${note}${renderProfile(m, false)}
        <div class="profile-end">
          <button class="btn-ghost danger" data-action="remove">Aus den Likes entfernen</button>
        </div>`;
    })
    .catch((e) => errorState(e, body, false));
}

// ---------- Du ----------

function initMe() {
  $('#screen-me').addEventListener('click', (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    if (t.dataset.action === 'key') renderOnboarding('', true);
    if (t.dataset.action === 'reset-seen' && confirm('Alle übersprungenen Filme wieder anzeigen? Deine Likes bleiben.')) {
      seen.clear();
      for (const l of store.likes) seen.add(l.id);
      store.history = [];
      Object.assign(feed, { queue: [], tier: 0, total: null });
      feed.tried.clear();
      save();
      renderMe();
      showNext();
    }
    if (t.dataset.action === 'reset-likes' && confirm('Wirklich alle Likes löschen?')) {
      store.likes = [];
      store.history = store.history.filter((h) => h.action !== 'like');
      store.newLikes = false;
      save();
      updateBadge();
      renderMe();
    }
  });
}

function renderMe() {
  const liked = store.likes.length;
  const total = seen.size;
  const quote = total ? Math.round((liked / total) * 100) : 0;
  $('#screen-me').innerHTML = `
    <header class="topbar">
      <div class="topbar-text">
        <h1 class="title">Du</h1>
        <p class="subtitle">Statistik und Einstellungen</p>
      </div>
    </header>
    <div class="scroll pad">
      <div class="card stats">
        <div><b>${liked}</b><span>gemerkt</span></div>
        <div><b>${total}</b><span>angeschaut</span></div>
        <div><b>${quote}%</b><span>Like-Quote</span></div>
      </div>
      <div class="card menu">
        <button class="menu-row" data-action="key"><span>TMDB-Schlüssel ändern</span><small>…${esc(store.key.slice(-4))}</small></button>
        <button class="menu-row" data-action="reset-seen"><span>Übersprungene Filme wieder zeigen</span></button>
        <button class="menu-row danger" data-action="reset-likes"><span>Alle Likes löschen</span></button>
      </div>
      <p class="attribution">
        Filmdaten und Bilder von <a href="https://www.themoviedb.org" target="_blank" rel="noopener">The Movie Database (TMDB)</a>.
        Diese App nutzt die TMDB-API, ist aber nicht von TMDB unterstützt oder zertifiziert.
        Streaming-Daten von JustWatch.
      </p>
    </div>`;
}

// ---------- Start: TMDB-Schlüssel eingeben ----------

function renderOnboarding(message = '', canCancel = false) {
  // Aktuellen Film nicht verlieren, falls es danach zurück zum Wischen geht
  if (discover.current) feed.queue.unshift(discover.current.id);
  discover.current = null;
  discover.busy = false;
  discover.token++;

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const installed = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  app.innerHTML = `
    <div class="onboard">
      <div class="onboard-top">
        <span class="wordmark">Plot<span>.</span></span>
        ${canCancel ? '<button class="btn-link" data-action="cancel">Abbrechen</button>' : ''}
      </div>
      <h1>Gemacht, um gesehen zu werden.</h1>
      <p class="lead">Wisch dich durch richtig gute Filme. Nach rechts merkst du dir einen Film, nach links kommt der nächste.</p>
      ${ios && !installed ? `
        <div class="hint">${ICON.share}
          <p><b>Erst installieren:</b> Tippe in Safari auf Teilen und dann auf „Zum Home-Bildschirm“.
          Öffne Plot danach über das neue Icon und gib den Schlüssel dort ein.</p>
        </div>` : ''}
      <div class="card how">
        <h2>So bekommst du deinen TMDB-Schlüssel</h2>
        <ol class="steps">
          <li><span>Kostenlos registrieren auf <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener">themoviedb.org</a> und die E-Mail bestätigen.</span></li>
          <li><span>In den <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">API-Einstellungen</a> einen Schlüssel beantragen (privater Zweck reicht).</span></li>
          <li><span>Den langen <b>API Read Access Token</b> (oder den kurzen <b>API Key</b>) kopieren und hier einfügen.</span></li>
        </ol>
      </div>
      <form class="key-form" novalidate>
        <label class="key-label" for="key">Dein TMDB-Schlüssel</label>
        <div class="key-field">
          <input id="key" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Hier einfügen">
          <button class="round-next" type="submit" aria-label="Weiter" disabled>${ICON.arrow}</button>
        </div>
        <p class="key-msg" role="status">${esc(message)}</p>
        <p class="fine">Der Schlüssel bleibt nur auf diesem Gerät gespeichert.</p>
      </form>
    </div>`;

  const form = $('.key-form', app);
  const input = $('#key', app);
  const submit = $('.round-next', app);
  const msg = $('.key-msg', app);
  const clean = () => input.value.replace(/[\s"']/g, '');

  input.addEventListener('input', () => (submit.disabled = clean().length < 20));
  $('[data-action=cancel]', app)?.addEventListener('click', renderShell);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = clean();
    if (key.length < 20) return;
    submit.disabled = true;
    msg.className = 'key-msg busy';
    msg.textContent = 'Prüfe Schlüssel …';
    try {
      await tmdb('/configuration', {}, key);
      store.key = key;
      save();
      renderShell();
    } catch (err) {
      msg.className = 'key-msg';
      msg.textContent = err instanceof AuthError
        ? 'Der Schlüssel passt nicht. Hast du ihn komplett kopiert?'
        : 'Keine Verbindung zu TMDB. Versuch es gleich nochmal.';
      submit.disabled = false;
    }
  });
}

// ---------- Los geht's ----------

// Kaputte Bilder blenden sich aus, darunter liegt ein ruhiger Platzhalter
app.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') e.target.parentElement?.classList.add('broken');
}, true);

document.addEventListener('keydown', (e) => {
  if (tab !== 'discover' || !discover.current || app.querySelector('.overlay, .sheet-backdrop')) return;
  if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) return;
  if (e.key === 'ArrowRight') decide('like');
  if (e.key === 'ArrowLeft') decide('skip');
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

if (store.key) renderShell();
else renderOnboarding();
