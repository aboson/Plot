// Plot: richtig gute Filme finden, im Look von Hinge.
// Daten und Bilder kommen von The Movie Database (TMDB), Streaming-Daten von JustWatch.

const API = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/';
const LANG = 'de-DE';
const REGION = 'DE';
const STORE_KEY = 'plot.v1';
const DAY = 24 * 60 * 60 * 1000;

// Wie streng "richtig gut" ist. Sind alle Filme einer Stufe gesehen, geht es mit der nächsten weiter.
const VOTES = [1500, 600, 250];
const AUTO_RATING = [7.5, 7.2, 7.0];

const DECADES = [['', 'Alle'], ['2020', '2020er'], ['2010', '2010er'], ['2000', '2000er'], ['1990', '90er'], ['1980', '80er'], ['1970', '70er'], ['old', 'Älter']];
const RATINGS = [['', 'Auto'], ['7', '7,0'], ['7.5', '7,5'], ['8', '8,0'], ['8.5', '8,5']];

// Kaufen und Leihen zählt nicht als "mein Streaming-Dienst"
const NOT_STREAMING = /store|google play|amazon video|microsoft|rakuten|chili|videoload|videobuster|kino on demand|verleihshop|freenet|youtube|justwatch/i;

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
  arrowLeft: svg('<path d="M19 12H5M12 19l-7-7 7-7"/>', 'stroke-width="2.4"'),
  sliders: svg('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'),
  search: svg('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>', 'stroke-width="3"'),
  tv: svg('<rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l-5 5-5-5"/>'),
  clipboard: svg('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>'),
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
const EXT = 'target="_blank" rel="noopener noreferrer"';

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

// "Netflix basic with Ads", "Paramount+ Amazon Channel" und Co. zählen als derselbe Dienst wie das Original
const provKey = (name) =>
  name.toLowerCase()
    .replace(/\+/g, ' plus')
    .replace(/\s*(standard |basic |premium |free )?with ads$/, '')
    .replace(/\s*(amazon|apple tv|roku premium) channel$/, '')
    .replace(/\s+/g, ' ')
    .trim();

// Erster Satz der Handlung, bei sehr kurzen Sätzen auch der zweite
function firstSentences(text) {
  const parts = text.match(/[^.!?…]+[.!?…]+["“”»«']?\s*|[^.!?…]+$/g) || [text];
  let out = parts[0].trim();
  if (out.length < 60 && parts[1]) out += ` ${parts[1].trim()}`;
  return out;
}

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

const DEFAULTS = {
  key: '',
  likes: [],
  seen: [],
  history: [],
  newLikes: false,
  hintDone: false,
  services: [],
  filters: { genres: [], decade: '', minRating: null, mine: false },
  likesView: { sort: 'recent', genre: '', mine: false },
  catalog: null,
  genreList: null,
};

const store = loadStore();
const seen = new Set(store.seen);

function loadStore() {
  const base = JSON.parse(JSON.stringify(DEFAULTS));
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return {
      ...base,
      ...saved,
      filters: { ...base.filters, ...saved.filters },
      likesView: { ...base.likesView, ...saved.likesView },
    };
  } catch {
    return base;
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
  // Der lange "Read Access Token" geht als Header, der kurze "API Key" verlangt TMDB als Parameter
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  else url.searchParams.set('api_key', key);
  for (const [k, v] of Object.entries(params)) if (v != null && v !== '') url.searchParams.set(k, v);

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
      const entry = providers.get(p.provider_id) || { name: p.provider_name, logo: p.logo_path, kinds: [], key: provKey(p.provider_name), stream: false };
      if (!entry.kinds.includes(label)) entry.kinds.push(label);
      if (kind === 'flatrate' || kind === 'free' || kind === 'ads') entry.stream = true;
      providers.set(p.provider_id, entry);
    }
  }
  const allProviders = [...providers.values()];
  const overview = (d.overview || '').trim();

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
    overview,
    intro: overview ? firstSentences(overview) : '',
    poster: d.poster_path,
    backdrops,
    directors: crew.filter((c) => c.job === 'Director').map((c) => c.name),
    cast,
    trailer: trailer?.key || null,
    fsk: fsk || null,
    countries: (d.production_countries || []).slice(0, 2).map((c) => regionName(c.iso_3166_1)),
    providers: allProviders.slice(0, 6),
    streamKeys: [...new Set(allProviders.filter((p) => p.stream).map((p) => p.key))],
    providerLink: wp?.link || null,
  };
}

// Liste der Streaming-Dienste in Deutschland, einmal pro Woche neu
async function getCatalog() {
  const c = store.catalog;
  if (c?.v === 2 && c.list?.length && Date.now() - c.at < 7 * DAY) return c.list;
  const data = await tmdb('/watch/providers/movie', { language: LANG, watch_region: REGION });
  const prio = (p) => p.display_priorities?.[REGION] ?? p.display_priority ?? 999;
  const groups = new Map();
  for (const p of [...(data.results || [])].sort((a, b) => prio(a) - prio(b))) {
    const key = provKey(p.provider_name);
    const group = groups.get(key);
    if (group) group.ids.push(p.provider_id);
    else groups.set(key, { key, name: p.provider_name, logo: p.logo_path, ids: [p.provider_id] });
  }
  store.catalog = { v: 2, at: Date.now(), list: [...groups.values()] };
  save();
  return store.catalog.list;
}

async function getGenres() {
  const g = store.genreList;
  if (g?.list?.length && Date.now() - g.at < 30 * DAY) return g.list;
  const data = await tmdb('/genre/movie/list', { language: LANG });
  store.genreList = { at: Date.now(), list: data.genres || [] };
  save();
  return store.genreList.list;
}

const serviceIds = () => (store.catalog?.list || []).filter((s) => store.services.includes(s.key)).flatMap((s) => s.ids);

// ---------- Film-Nachschub ----------

const feed = { queue: [], tier: 0, total: null, tried: new Set(), loading: null, gen: 0 };

function resetFeed() {
  feed.queue = [];
  feed.tier = 0;
  feed.total = null;
  feed.tried.clear();
  feed.gen++;
}

const filterCount = () => {
  const f = store.filters;
  return (f.genres.length ? 1 : 0) + (f.decade ? 1 : 0) + (f.minRating != null ? 1 : 0) + (f.mine && store.services.length ? 1 : 0);
};

function discoverParams(page) {
  const f = store.filters;
  const params = {
    language: LANG,
    sort_by: 'popularity.desc',
    include_adult: false,
    include_video: false,
    without_genres: '10770',
    'vote_average.gte': f.minRating ?? AUTO_RATING[feed.tier],
    'vote_count.gte': VOTES[feed.tier],
    page,
  };
  if (f.genres.length) params.with_genres = f.genres.join('|');
  if (f.decade === 'old') params['primary_release_date.lte'] = '1969-12-31';
  else if (f.decade) {
    params['primary_release_date.gte'] = `${f.decade}-01-01`;
    params['primary_release_date.lte'] = `${Number(f.decade) + 9}-12-31`;
  }
  const ids = f.mine ? serviceIds() : [];
  if (ids.length) {
    params.with_watch_providers = ids.join('|');
    params.watch_region = REGION;
    params.with_watch_monetization_types = 'flatrate|free|ads';
  }
  return params;
}

function choosePage() {
  if (feed.total == null) return 1;
  const open = [];
  for (let p = 1; p <= feed.total; p++) if (!feed.tried.has(p)) open.push(p);
  if (open.length) return open[Math.floor(Math.random() * open.length)];
  if (feed.tier < VOTES.length - 1) {
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
  const gen = feed.gen;
  if (store.filters.mine && store.services.length && !store.catalog) await getCatalog();
  const known = new Set(feed.queue);
  const picks = new Map();
  const take = (list, ok = () => true) => {
    for (const m of list || []) {
      if (m && m.poster_path && !m.adult && !seen.has(m.id) && !known.has(m.id) && ok(m)) picks.set(m.id, m);
    }
  };

  // Ab und zu Empfehlungen passend zu deinen Likes einstreuen (nicht, wenn Filter aktiv sind)
  if (!filterCount() && store.likes.length && Math.random() < 0.35) {
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
    const data = await tmdb('/discover/movie', discoverParams(page));
    if (gen !== feed.gen) return;
    feed.total = clamp(data.total_pages || 1, 1, 500);
    feed.tried.add(page);
    take(data.results);
  }

  if (gen === feed.gen) feed.queue.push(...shuffle([...picks.keys()]));
}

async function nextId() {
  for (let round = 0; round < 4; round++) {
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
  const parts = [hero(m, likeable), vitals(m)];
  if (m.overview && m.overview.length > m.intro.length + 10) parts.push(prompt("Darum geht's", m.overview));
  if (m.backdrops[0]) parts.push(photo(img('w1280', m.backdrops[0])));
  if (m.tagline) parts.push(prompt('Der Film in einem Satz', m.tagline));
  if (m.trailer) parts.push(trailerCard(m.trailer));
  if (m.backdrops[1]) parts.push(photo(img('w1280', m.backdrops[1])));
  if (m.cast.length) parts.push(castCard(m.cast));
  if (m.providers.length) parts.push(providersCard(m));
  if (m.backdrops[2]) parts.push(photo(img('w1280', m.backdrops[2])));
  return parts.join('');
}

// Erster Bildschirm: Poster, Genres und ein Satz Handlung, damit man ohne Scrollen entscheiden kann
function hero(m, likeable) {
  const chips = m.genres.slice(0, 3).map((g) => `<span class="chip-sm">${esc(g)}</span>`).join('');
  const media = m.poster
    ? `<img class="hero-bg" src="${img('w185', m.poster)}" alt="" draggable="false">
       <img class="hero-poster" src="${img('w780', m.poster)}" alt="Poster: ${esc(m.title)}" draggable="false">`
    : '';
  const heart = likeable
    ? `<button class="like-btn" data-action="like-note" aria-label="Mit Notiz merken" title="Mit Notiz merken">${ICON.heart}</button>`
    : '';
  return `
    <section class="card hero">
      <div class="hero-media">${media}${heart}</div>
      <div class="intro">
        <h2 class="intro-title" hidden>${esc(m.title)}</h2>
        ${chips ? `<div class="chips">${chips}</div>` : ''}
        ${m.intro ? `<p class="intro-plot">${esc(m.intro)}</p>` : ''}
      </div>
    </section>`;
}

function photo(src) {
  return `<figure class="photo still">${src ? `<img src="${src}" alt="" loading="lazy" decoding="async" draggable="false">` : ''}</figure>`;
}

function prompt(question, answer) {
  const size = answer.length < 80 ? 'xl' : answer.length < 200 ? 'l' : 'm';
  return `<div class="card prompt"><h3>${esc(question)}</h3><p class="answer ${size}">${esc(answer)}</p></div>`;
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
      <div class="vitals-row">
        ${top.map(([icon, text]) => `<span class="vital">${icon}<span>${esc(text)}</span></span>`).join('')}
      </div>
      ${lines.map(([icon, text]) => `<div class="vital-line">${icon}<span>${esc(text)}</span></div>`).join('')}
    </div>`;
}

function trailerCard(key) {
  return `
    <div class="card trailer-card">
      <div class="video">
        <button class="trailer-play" data-key="${esc(key)}" aria-label="Trailer abspielen">
          <img src="https://i.ytimg.com/vi/${encodeURIComponent(key)}/hqdefault.jpg" alt="" loading="lazy" draggable="false">
          <span class="play">${ICON.play}</span>
        </button>
      </div>
      <div class="trailer-foot"><h3>Der Trailer</h3></div>
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

function castCard(cast) {
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
  return `<div class="card prompt cast"><h3>In den Hauptrollen</h3><div class="cast-row" data-noswipe>${people}</div></div>`;
}

function providersCard(m) {
  const rows = m.providers
    .map(
      (p) => `
      <li>
        <span class="prov-logo">${p.logo ? `<img src="${img('w92', p.logo)}" alt="" loading="lazy" draggable="false">` : ''}</span>
        <div><b>${esc(p.name)}</b><small>${esc(p.kinds.join(', '))}</small></div>
      </li>`,
    )
    .join('');
  const link = m.providerLink ? `<a class="fine-link" href="${esc(m.providerLink)}" ${EXT}>Alle Angebote ansehen</a>` : '';
  return `
    <div class="card prompt providers">
      <h3>Hier kannst du ihn sehen</h3>
      <ul class="prov-list">${rows}</ul>
      ${link}
      <p class="fine">Streaming-Daten von JustWatch</p>
    </div>`;
}

const skeleton = () => '<div class="sk sk-hero"></div><div class="sk sk-card"></div>';

// Volle Titelzeile im Profil nur zeigen, wenn der Kopf ihn abschneiden musste
function syncTitle(titleEl, scope) {
  const full = scope && $('.intro-title', scope);
  if (full) full.hidden = !(titleEl.scrollWidth > titleEl.clientWidth + 1);
}

function setTitle(titleEl, text) {
  titleEl.textContent = text;
  titleEl.title = text;
  titleEl.classList.toggle('long', text.length > 20);
}

function errorState(e, container, retry = true) {
  if (e instanceof AuthError) {
    store.key = '';
    save();
    renderOnboarding('TMDB hat deinen Schlüssel abgelehnt. Gib ihn bitte nochmal ein.');
    return;
  }
  console.error(e.message);
  const offline = !navigator.onLine;
  container.innerHTML = `
    <div class="state">
      <p class="state-title">${offline ? 'Du bist offline.' : 'Da hat was nicht geklappt.'}</p>
      <p>${offline ? 'Sobald du wieder Netz hast, geht es weiter.' : 'TMDB hat gerade nicht geantwortet.'}</p>
      ${retry ? '<button class="btn-primary small" data-action="retry">Nochmal versuchen</button>' : ''}
    </div>`;
}

// ---------- Fenster von unten (Sheets) ----------

function openLayer(html, className = 'sheet') {
  const layer = document.createElement('div');
  layer.className = 'sheet-backdrop';
  layer.innerHTML = `<div class="${className}" role="dialog" aria-modal="true">${html}</div>`;
  app.appendChild(layer);
  return layer;
}

function closeLayer(layer) {
  if (layer.classList.contains('closing')) return;
  layer.classList.add('closing');
  setTimeout(() => layer.remove(), 190);
}

function askConfirm({ title, text, confirm, danger = false }) {
  return new Promise((resolve) => {
    const layer = openLayer(`
      <p class="sheet-kicker">${esc(title)}</p>
      <p class="sheet-text">${esc(text)}</p>
      <button class="btn-primary${danger ? ' danger' : ''}" data-answer="yes">${esc(confirm)}</button>
      <button class="btn-text" data-answer="no">Abbrechen</button>`);
    $('.sheet', layer).setAttribute('role', 'alertdialog');
    $('.sheet', layer).setAttribute('aria-label', title);
    const done = (answer) => {
      closeLayer(layer);
      resolve(answer);
    };
    layer.addEventListener('click', (e) => {
      if (e.target === layer) return done(false);
      const b = e.target.closest('[data-answer]');
      if (b) done(b.dataset.answer === 'yes');
    });
    layer.addEventListener('dismiss', () => done(false));
    $('[data-answer=yes]', layer).focus();
  });
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
      <button class="icon-btn" data-action="filter" aria-label="Filter" title="Filter">${ICON.sliders}<span class="count" hidden></span></button>
      <button class="icon-btn" data-action="undo" aria-label="Letzten Film zurückholen" title="Zurückholen (Backspace oder Z)" disabled>${ICON.undo}</button>
    </header>
    <div class="deck">
      <div class="profile" id="d-profile"></div>
      <div class="swipe-pill pill-like" aria-hidden="true">${ICON.heartFill}Merken</div>
      <div class="swipe-pill pill-nope" aria-hidden="true">${ICON.x}Weiter</div>
    </div>
    <div class="actionbar">
      <button class="act act-skip" data-action="skip" title="Weiter (Pfeil links)" disabled>${ICON.x}<span>Weiter</span></button>
      <button class="act act-like" data-action="like" title="Merken (Pfeil rechts)" disabled>${ICON.heartFill}<span>Merken</span></button>
    </div>`;
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
    if (t.classList.contains('trailer-play')) return playTrailer(t);
    switch (t.dataset.action) {
      case 'skip': return decide('skip');
      case 'like': return decide('like');
      case 'like-note': return openLikeSheet();
      case 'seen': return decide('skip');
      case 'undo': return undo();
      case 'retry': return showNext();
      case 'filter': return openFilterSheet();
      case 'coach-ok': return dismissCoach();
    }
  });

  attachSwipe(discover.profile);
  updateFilterBadge();
}

function setActions(enabled) {
  for (const b of discover.el.querySelectorAll('.act')) b.disabled = !enabled;
}

function updateFilterBadge() {
  const count = discover.el && $('[data-action=filter] .count', discover.el);
  if (!count) return;
  const n = filterCount();
  count.hidden = !n;
  count.textContent = n;
}

function setHeader(m) {
  const title = $('#d-title');
  const sub = $('#d-sub');
  if (!m) {
    setTitle(title, 'Plot');
    sub.textContent = 'Suche richtig gute Filme …';
  } else {
    setTitle(title, m.title);
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
  setActions(false);
  profile.innerHTML = skeleton();
  profile.scrollTop = 0;
  try {
    const id = await nextId();
    if (token !== discover.token) return;
    if (id == null) {
      $('#d-sub').textContent = '';
      profile.innerHTML = filterCount()
        ? `<div class="state">
            <p class="state-title">Keine weiteren Filme für diese Filter.</p>
            <p>Lockere die Filter, dann geht es weiter.</p>
            <button class="btn-primary small" data-action="filter">Filter ändern</button>
          </div>`
        : `<div class="state">
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
    syncTitle($('#d-title'), profile);
    profile.scrollTop = 0;
    profile.classList.remove('enter', 'wiggle');
    void profile.offsetWidth;
    profile.classList.add('enter');
    setActions(true);
    if (!store.hintDone) showCoach();
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

function likeFacts(m) {
  return { year: m.year, rating: m.rating, genres: m.genres, genre: m.genres[0] || '', streamKeys: m.streamKeys, provAt: Date.now() };
}

function decide(action, like = {}) {
  const m = discover.current;
  if (!m || discover.busy) return;
  discover.busy = true;
  if (!store.hintDone) dismissCoach();
  seen.add(m.id);
  store.history = [...store.history, { id: m.id, action }].slice(-30);
  if (action === 'like') {
    const entry = { id: m.id, title: m.title, poster: m.poster, note: like.note || '', at: Date.now(), ...likeFacts(m) };
    store.likes = [entry, ...store.likes.filter((l) => l.id !== m.id)];
    store.newLikes = true;
  }
  save();
  updateBadge();
  setActions(false);
  flyOut(action === 'like' ? 1 : -1).then(() => {
    discover.busy = false;
    showNext();
  });
}

function flyOut(dir) {
  const p = discover.profile;
  $(dir > 0 ? '.pill-like' : '.pill-nope', discover.el).style.opacity = 1;
  if (reducedMotion.matches) return Promise.resolve();
  p.classList.remove('enter', 'wiggle');
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

// Einmaliger Hinweis beim ersten Film: so wird gewischt
function showCoach() {
  if ($('.coach', discover.el)) return;
  const coach = document.createElement('div');
  coach.className = 'coach';
  coach.setAttribute('role', 'status');
  coach.innerHTML = `
    <div class="coach-arrows">
      <span class="coach-l">${ICON.arrowLeft}Weiter</span>
      <span class="coach-r">Merken${ICON.arrow}</span>
    </div>
    <p>Wisch die Karte nach rechts zum Merken. Nach links kommt der nächste Film.</p>
    <button class="coach-ok" data-action="coach-ok">Verstanden</button>`;
  $('.deck', discover.el).appendChild(coach);
  if (!reducedMotion.matches) {
    setTimeout(() => {
      if (discover.current && !discover.busy) {
        discover.profile.classList.remove('enter');
        discover.profile.classList.add('wiggle');
      }
    }, 450);
  }
}

function dismissCoach() {
  store.hintDone = true;
  save();
  $('.coach', discover.el)?.remove();
  discover.profile?.classList.remove('wiggle');
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
        profile.classList.remove('enter', 'wiggle');
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

// ---------- Merken mit Notiz (wie "Like senden" bei Hinge) ----------

function openLikeSheet() {
  const m = discover.current;
  if (!m || discover.busy) return;
  const layer = openLayer(`
    <p class="sheet-kicker">${esc(m.title)}</p>
    ${m.poster ? `<img class="pv-img poster" src="${img('w500', m.poster)}" alt="">` : ''}
    <textarea rows="2" maxlength="140" placeholder="Notiz hinzufügen (optional)" aria-label="Notiz"></textarea>
    <button class="btn-primary" data-action="confirm">${ICON.heartFill}<span>Merken</span></button>
    <button class="btn-text" data-action="cancel">Abbrechen</button>`);
  $('.sheet', layer).setAttribute('aria-label', `${m.title} merken`);

  layer.addEventListener('dismiss', () => closeLayer(layer));
  layer.addEventListener('click', (e) => {
    if (e.target === layer || e.target.closest('[data-action=cancel]')) closeLayer(layer);
    else if (e.target.closest('[data-action=confirm]')) {
      const note = $('textarea', layer).value.trim();
      closeLayer(layer);
      decide('like', { note });
    }
  });
}

// ---------- Filter fürs Entdecken ----------

function serviceGrid(list, compact = false) {
  const items = list.filter((s) => !NOT_STREAMING.test(s.name)).slice(0, compact ? 16 : 18);
  return items
    .map(
      (s) => `
      <button class="service" data-service="${esc(s.key)}" aria-pressed="${store.services.includes(s.key)}">
        <span class="service-logo">${s.logo ? `<img src="${img('w92', s.logo)}" alt="" loading="lazy">` : ''}<span class="service-check">${ICON.check}</span></span>
        <span class="service-name">${esc(s.name)}</span>
      </button>`,
    )
    .join('');
}

function fillServices(container, compact = false) {
  getCatalog()
    .then((list) => {
      container.innerHTML = serviceGrid(list, compact);
    })
    .catch(() => {
      container.innerHTML = '<p class="section-note">Die Dienste konnten gerade nicht geladen werden.</p>';
    });
}

const chip = (group, value, label, active) =>
  `<button class="chip-opt" data-group="${group}" data-value="${esc(value)}" aria-pressed="${active}">${esc(label)}</button>`;

function openFilterSheet() {
  let draft = JSON.parse(JSON.stringify(store.filters));
  const ratingValue = () => (draft.minRating == null ? '' : String(draft.minRating));

  const layer = openLayer(`
    <div class="sheet-head">
      <p class="sheet-kicker">Filter</p>
      <button class="btn-link" data-f="reset">Zurücksetzen</button>
    </div>
    <section class="f-sec">
      <h3>Genre</h3>
      <div class="chip-wrap" id="f-genres"><span class="section-note">Lädt …</span></div>
    </section>
    <section class="f-sec">
      <h3>Jahrzehnt</h3>
      <div class="chip-wrap">${DECADES.map(([v, l]) => chip('decade', v, l, draft.decade === v)).join('')}</div>
    </section>
    <section class="f-sec">
      <h3>Mindestbewertung</h3>
      <div class="chip-wrap">${RATINGS.map(([v, l]) => chip('rating', v, l, ratingValue() === v)).join('')}</div>
      <p class="section-note">Auto heißt: erst ab 7,5 Punkten, später schrittweise bis 7,0.</p>
    </section>
    <section class="f-sec">
      <h3>Streaming</h3>
      <label class="switch-row">
        <span>Nur Filme auf meinen Diensten</span>
        <input type="checkbox" id="f-mine" ${draft.mine ? 'checked' : ''}>
        <span class="switch" aria-hidden="true"></span>
      </label>
      <div class="service-grid compact" id="f-services"><span class="section-note">Lädt …</span></div>
    </section>
    <button class="btn-primary" data-f="apply">Filme zeigen</button>`, 'sheet tall');
  $('.sheet', layer).setAttribute('aria-label', 'Filter');

  const sync = () => {
    for (const b of layer.querySelectorAll('[data-group]')) {
      const { group, value } = b.dataset;
      const on = group === 'genre' ? draft.genres.includes(Number(value))
        : group === 'decade' ? draft.decade === value
        : ratingValue() === value;
      b.setAttribute('aria-pressed', on);
    }
    $('#f-mine', layer).checked = draft.mine;
  };

  getGenres()
    .then((list) => {
      // TV-Filme blendet Plot grundsätzlich aus, der Chip würde nie etwas finden
      $('#f-genres', layer).innerHTML = list.filter((g) => g.id !== 10770).map((g) => chip('genre', String(g.id), g.name, draft.genres.includes(g.id))).join('');
    })
    .catch(() => {
      $('#f-genres', layer).innerHTML = '<span class="section-note">Genres konnten gerade nicht geladen werden.</span>';
    });
  fillServices($('#f-services', layer), true);

  layer.addEventListener('dismiss', () => closeLayer(layer));
  layer.addEventListener('change', (e) => {
    if (e.target.id === 'f-mine') draft.mine = e.target.checked;
  });
  layer.addEventListener('click', async (e) => {
    if (e.target === layer) return closeLayer(layer);
    const opt = e.target.closest('[data-group]');
    if (opt) {
      const { group, value } = opt.dataset;
      if (group === 'genre') {
        const id = Number(value);
        draft.genres = draft.genres.includes(id) ? draft.genres.filter((g) => g !== id) : [...draft.genres, id];
      } else if (group === 'decade') draft.decade = value;
      else draft.minRating = value === '' ? null : Number(value);
      return sync();
    }
    const action = e.target.closest('[data-f]')?.dataset.f;
    if (action === 'reset') {
      draft = JSON.parse(JSON.stringify(DEFAULTS.filters));
      sync();
    } else if (action === 'apply') {
      store.filters = draft;
      save();
      closeLayer(layer);
      if (draft.mine && store.services.length) await getCatalog().catch(() => {});
      resetFeed();
      updateFilterBadge();
      showNext();
    }
  });
}

// Dienste an- und abwählen geht im Du-Tab und im Filter, beides landet am selben Ort
function toggleService(button) {
  const key = button.dataset.service;
  const on = !store.services.includes(key);
  store.services = on ? [...store.services, key] : store.services.filter((k) => k !== key);
  save();
  for (const b of app.querySelectorAll('[data-service]')) {
    if (b.dataset.service === key) b.setAttribute('aria-pressed', on);
  }
  if (store.filters.mine) {
    resetFeed();
    updateFilterBadge();
  }
  if (tab === 'likes') renderLikes();
}

// ---------- Likes ----------

let likesQuery = '';
const refreshing = new Set();

function initLikes() {
  const el = $('#screen-likes');
  el.innerHTML = `
    <header class="topbar">
      <div class="topbar-text">
        <h1 class="title">Likes</h1>
        <p class="subtitle" id="l-sub"></p>
      </div>
    </header>
    <div class="tools" id="l-tools">
      <label class="search">${ICON.search}<input type="search" id="l-q" placeholder="Titel suchen" aria-label="Likes nach Titel durchsuchen" autocomplete="off"></label>
      <div class="tool-row">
        <label class="pill-select">
          <select id="l-sort" aria-label="Sortierung">
            <option value="recent">Zuletzt hinzugefügt</option>
            <option value="rating">Bewertung</option>
            <option value="year">Erscheinungsjahr</option>
          </select>
        </label>
        <label class="pill-select"><select id="l-genre" aria-label="Genre"></select></label>
        <button class="pill-toggle" id="l-mine" aria-pressed="false">${ICON.tv}<span>Meine Dienste</span></button>
      </div>
    </div>
    <div class="scroll" id="l-list"></div>`;

  $('#l-q', el).addEventListener('input', (e) => {
    likesQuery = e.target.value;
    renderLikeList();
  });
  $('#l-sort', el).addEventListener('change', (e) => {
    store.likesView.sort = e.target.value;
    save();
    renderLikeList();
  });
  $('#l-genre', el).addEventListener('change', (e) => {
    store.likesView.genre = e.target.value;
    save();
    renderLikeList();
  });
  $('#l-mine', el).addEventListener('click', () => {
    if (!store.services.length) {
      showTab('me');
      const card = $('#services-card');
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card?.classList.add('flash');
      return;
    }
    store.likesView.mine = !store.likesView.mine;
    save();
    renderLikes();
  });
  $('#l-list', el).addEventListener('click', (e) => {
    const row = e.target.closest('[data-open]');
    if (row) openDetail(Number(row.dataset.open));
  });
}

function renderLikes() {
  const el = $('#screen-likes');
  const n = store.likes.length;
  const v = store.likesView;
  $('#l-sub', el).textContent = n ? `${n} ${n === 1 ? 'Film' : 'Filme'} gemerkt` : 'Noch leer';
  $('#l-tools', el).hidden = !n;

  const genres = [...new Set(store.likes.flatMap((l) => l.genres || (l.genre ? [l.genre] : [])))].sort((a, b) => a.localeCompare(b, 'de'));
  if (v.genre && !genres.includes(v.genre)) v.genre = '';
  $('#l-genre', el).innerHTML = `<option value="">Alle Genres</option>${genres.map((g) => `<option${g === v.genre ? ' selected' : ''}>${esc(g)}</option>`).join('')}`;
  $('#l-sort', el).value = v.sort;
  const mine = $('#l-mine', el);
  mine.setAttribute('aria-pressed', v.mine && store.services.length > 0);
  mine.title = store.services.length ? 'Nur Filme auf meinen Streaming-Diensten' : 'Wähle zuerst deine Dienste im Du-Tab';

  renderLikeList();
  backfillLikes();
}

function renderLikeList() {
  const list = $('#l-list');
  if (!list) return;
  if (!store.likes.length) {
    list.innerHTML = `
      <div class="state">
        <p class="state-title">Hier landen deine Filme.</p>
        <p>Wisch nach rechts oder tipp auf Merken, wenn dich ein Film reizt.</p>
      </div>`;
    return;
  }
  const v = store.likesView;
  const q = likesQuery.trim().toLowerCase();
  const useMine = v.mine && store.services.length > 0;
  const order = {
    recent: (a, b) => b.at - a.at,
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    year: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0),
  }[v.sort] || ((a, b) => b.at - a.at);

  const shown = store.likes
    .filter((l) => !q || l.title.toLowerCase().includes(q))
    .filter((l) => !v.genre || (l.genres || [l.genre]).includes(v.genre))
    .filter((l) => !useMine || (l.streamKeys || []).some((k) => store.services.includes(k)))
    .sort(order);

  if (!shown.length) {
    list.innerHTML = `
      <div class="state">
        <p class="state-title">Keine Treffer.</p>
        <p>${useMine ? 'Gerade läuft keiner dieser Filme auf deinen Diensten.' : 'Probier eine andere Suche oder ein anderes Genre.'}</p>
      </div>`;
    return;
  }
  const loading = useMine && refreshing.size ? '<p class="list-note">Streaming-Infos werden aktualisiert …</p>' : '';
  list.innerHTML = `${loading}<ul class="like-list">${shown
    .map((l) => {
      const line = l.note ? `„${l.note}“` : [l.genre, l.year].filter(Boolean).join(' · ');
      return `
        <li><button class="like-row" data-open="${l.id}">
          <span class="thumb">${l.poster ? `<img src="${img('w185', l.poster)}" alt="" loading="lazy">` : ''}</span>
          <span class="like-meta"><b>${esc(l.title)}</b><span>${esc(line)}</span></span>
          <span class="like-rating">${ICON.starFill}${rating(l.rating)}</span>
        </button></li>`;
    })
    .join('')}</ul>`;
}

// Ältere Likes kennen ihre Genres und Streaming-Dienste noch nicht, und Streaming-Angebote ändern sich
async function backfillLikes() {
  const stale = store.likes
    .filter((l) => !refreshing.has(l.id) && (!l.genres || !l.provAt || Date.now() - l.provAt > 7 * DAY))
    .slice(0, 20);
  if (!stale.length) return;
  for (const l of stale) refreshing.add(l.id);
  let changed = false;
  for (let i = 0; i < stale.length; i += 2) {
    await Promise.all(
      stale.slice(i, i + 2).map(async (l) => {
        try {
          Object.assign(l, likeFacts(await getMovie(l.id)));
          changed = true;
        } catch {
          // Später nochmal versuchen
        } finally {
          refreshing.delete(l.id);
        }
      }),
    );
  }
  if (changed) {
    save();
    if (tab === 'likes') renderLikes();
  }
}

function openDetail(id) {
  const like = store.likes.find((l) => l.id === id);
  const layer = document.createElement('div');
  layer.className = 'overlay';
  layer.innerHTML = `
    <header class="topbar">
      <button class="icon-btn" data-action="close" aria-label="Zurück">${ICON.back}</button>
      <div class="topbar-text"><h1 class="title"></h1></div>
    </header>
    <div class="profile static">${skeleton()}</div>`;
  app.appendChild(layer);
  const title = $('.title', layer);
  setTitle(title, like?.title || '');
  const body = $('.profile', layer);

  const close = () => {
    layer.classList.add('leaving');
    setTimeout(() => layer.remove(), 210);
  };
  layer.addEventListener('dismiss', close);
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
      setTitle(title, m.title);
      const note = like?.note
        ? `<div class="card note-card"><h3>Deine Notiz</h3><p class="answer l">${esc(like.note)}</p></div>`
        : '';
      body.innerHTML = `${note}${renderProfile(m, false)}
        <div class="profile-end">
          <button class="btn-ghost danger" data-action="remove">Aus den Likes entfernen</button>
        </div>`;
      syncTitle(title, body);
    })
    .catch((e) => errorState(e, body, false));
}

// ---------- Du ----------

function criteriaText() {
  const r = store.filters.minRating;
  return r == null
    ? 'Plot zeigt nur Filme mit mindestens 7,5 von 10 Punkten und 1.500 Stimmen auf TMDB und lockert das erst, wenn du alle gesehen hast, schrittweise bis 7,0 Punkte und 250 Stimmen.'
    : `Plot zeigt nur Filme mit mindestens ${rating(r)} von 10 Punkten auf TMDB, zuerst mit mindestens 1.500 Stimmen und erst wenn du alle gesehen hast mit weniger, bis 250 Stimmen.`;
}

function initMe() {
  $('#screen-me').addEventListener('click', async (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    if (t.dataset.action === 'key') renderOnboarding('', true);

    if (t.dataset.action === 'reset-seen') {
      const ok = await askConfirm({
        title: 'Übersprungene Filme wieder zeigen?',
        text: 'Alle Filme, die du weggewischt hast, können wieder auftauchen. Deine Likes bleiben.',
        confirm: 'Wieder zeigen',
      });
      if (!ok) return;
      seen.clear();
      for (const l of store.likes) seen.add(l.id);
      store.history = [];
      resetFeed();
      save();
      renderMe();
      showNext();
    }

    if (t.dataset.action === 'reset-likes') {
      const n = store.likes.length;
      if (!n) return;
      const ok = await askConfirm({
        title: n === 1 ? 'Deinen Like löschen?' : `Alle ${n} Likes löschen?`,
        text: 'Das kann nicht rückgängig gemacht werden. Die Filme bleiben als gesehen markiert.',
        confirm: n === 1 ? '1 Like löschen' : `${n} Likes löschen`,
        danger: true,
      });
      if (!ok) return;
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
      <div class="card section" id="services-card">
        <h3>Meine Streaming-Dienste</h3>
        <p class="section-note">Für „Meine Dienste“ in den Likes und im Filter beim Entdecken.</p>
        <div class="service-grid" id="me-services"><span class="section-note">Lädt …</span></div>
      </div>
      <div class="card section">
        <h3>So wählt Plot Filme aus</h3>
        <p class="criteria">${esc(criteriaText())}</p>
      </div>
      <div class="card menu">
        <button class="menu-row" data-action="key"><span>TMDB-Schlüssel ändern</span><small class="saved">Gespeichert ✓</small></button>
        <button class="menu-row" data-action="reset-seen"><span>Übersprungene Filme wieder zeigen</span></button>
        <button class="menu-row danger" data-action="reset-likes" ${liked ? '' : 'disabled'}><span>Alle Likes löschen</span></button>
      </div>
      <p class="attribution">
        Filmdaten und Bilder von <a href="https://www.themoviedb.org" ${EXT}>The Movie Database (TMDB)</a>.
        Diese App nutzt die TMDB-API, ist aber nicht von TMDB unterstützt oder zertifiziert.
        Streaming-Daten von <a href="https://www.justwatch.com" ${EXT}>JustWatch</a>.
      </p>
    </div>`;
  fillServices($('#me-services'));
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
  const canPaste = window.isSecureContext && typeof navigator.clipboard?.readText === 'function';

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
      <form class="key-form" novalidate>
        <label class="key-label" for="key">Dein TMDB API-Schlüssel</label>
        <div class="key-field">
          <input id="key" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Schlüssel hier einfügen" aria-describedby="key-msg">
          <button class="round-next" type="submit" aria-label="Weiter" disabled>${ICON.arrow}</button>
        </div>
        <div class="key-tools">
          ${canPaste ? `<button type="button" class="pill-toggle" data-action="paste">${ICON.clipboard}<span>Einfügen</span></button>` : ''}
          <p class="key-msg" id="key-msg" role="status" aria-live="polite">${esc(message)}</p>
        </div>
      </form>
      <div class="card how">
        <h2>Noch keinen Schlüssel?</h2>
        <ol class="steps">
          <li><span>Kostenlos registrieren auf <a href="https://www.themoviedb.org/signup" ${EXT}>themoviedb.org</a> und die E-Mail bestätigen.</span></li>
          <li><span>In den <a href="https://www.themoviedb.org/settings/api" ${EXT}>API-Einstellungen</a> einen Schlüssel beantragen (privater Zweck reicht).</span></li>
          <li><span>Den <b>API-Schlüssel</b> (32 Zeichen) kopieren und oben einfügen. Der lange „Read Access Token“ geht auch: Du brauchst nur einen von beiden.</span></li>
        </ol>
      </div>
      <p class="fine">Der Schlüssel bleibt nur auf diesem Gerät gespeichert.</p>
    </div>`;

  const form = $('.key-form', app);
  const input = $('#key', app);
  const submit = $('.round-next', app);
  const msg = $('#key-msg', app);
  const clean = () => input.value.replace(/[\s"']/g, '');
  const setMsg = (text, kind = '') => {
    msg.textContent = text;
    msg.className = `key-msg ${kind}`;
  };
  if (message) setMsg(message, 'error');

  // Jeden Schlüssel nur einmal bei TMDB prüfen
  let last = { key: '', promise: null };
  const check = (key) => {
    if (last.key !== key) {
      setMsg('Prüfe Schlüssel …', 'busy');
      const promise = tmdb('/configuration', {}, key).then(
        () => 'ok',
        (err) => (err instanceof AuthError ? 'bad' : 'offline'),
      );
      last = { key, promise };
      promise.then((result) => {
        if (result === 'offline' && last.key === key) last = { key: '', promise: null };
        if (clean() !== key) return;
        if (result === 'ok') setMsg('✓ Schlüssel funktioniert', 'ok');
        else if (result === 'bad') {
          setMsg(key.length < 32
            ? 'Der Schlüssel ist zu kurz. Hast du ihn komplett kopiert?'
            : 'TMDB kennt diesen Schlüssel nicht. Hast du ihn komplett kopiert?', 'error');
        } else setMsg('Keine Verbindung zu TMDB. Versuch es gleich nochmal.', 'error');
      });
    }
    return last.promise;
  };

  let timer = 0;
  input.addEventListener('input', () => {
    const key = clean();
    submit.disabled = !key;
    clearTimeout(timer);
    if (key !== last.key) setMsg('');
    if (key.length >= 32) timer = setTimeout(() => check(key), 350);
  });
  input.addEventListener('focus', () => {
    setTimeout(() => form.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  });

  $('[data-action=paste]', app)?.addEventListener('click', async () => {
    try {
      input.value = (await navigator.clipboard.readText()).trim();
      input.dispatchEvent(new Event('input'));
      const key = clean();
      if (key) check(key);
      else setMsg('In der Zwischenablage ist gerade nichts.', 'error');
    } catch {
      setMsg('Einfügen ging nicht. Tipp lange ins Feld und wähle „Einfügen“.', 'error');
    }
  });
  $('[data-action=cancel]', app)?.addEventListener('click', renderShell);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = clean();
    if (!key) return;
    submit.disabled = true;
    if ((await check(key)) === 'ok') {
      store.key = key;
      save();
      renderShell();
    } else {
      submit.disabled = false;
    }
  });
}

// ---------- Los geht's ----------

// Kaputte Bilder blenden sich aus, darunter liegt ein ruhiger Platzhalter
app.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') e.target.parentElement?.classList.add('broken');
}, true);

app.addEventListener('click', (e) => {
  const service = e.target.closest('[data-service]');
  if (service) toggleService(service);
});

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'Escape') {
    const top = [...app.querySelectorAll('.sheet-backdrop:not(.closing), .overlay:not(.leaving)')].pop();
    top?.dispatchEvent(new CustomEvent('dismiss'));
    return;
  }
  if (tab !== 'discover' || !discover.el?.isConnected) return;
  if (app.querySelector('.overlay, .sheet-backdrop')) return;
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    decide('like');
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    decide('skip');
  } else if (e.key === 'Backspace' || e.key === 'z' || e.key === 'Z') {
    e.preventDefault();
    undo();
  }
});

// Titel neu messen, wenn die Schrift fertig geladen ist oder das Fenster sich ändert
const resync = () => {
  if (discover.current && discover.el?.isConnected) syncTitle($('#d-title'), discover.profile);
};
document.fonts?.ready.then(resync);
let resizeTimer = 0;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resync, 150);
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

if (store.key) renderShell();
else renderOnboarding();
