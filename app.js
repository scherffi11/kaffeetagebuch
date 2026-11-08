// Kaffeetagebuch 2.0: gemeinsame Bohnen, Bewertungen je Person, Login per E-Mail-Code über Supabase.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';
import { SUPABASE_URL, SUPABASE_KEY, VERSION } from './config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
const BUCKET = 'bean-photos';

/* ================= Hilfen ================= */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const de = (n, d = 1) => Number(n).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = n => Number(n || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
const mmss = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const dShort = ts => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
const dFull = ts => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
const dLong = ts => new Date(ts).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const hhmm = ts => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const parseNum = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };
const isoDay = ts => { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const hash = s => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
const uidLocal = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const DAY = 864e5;
const clone = o => JSON.parse(JSON.stringify(o));

/* ================= Icons ================= */
const SK = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  filter: `<svg viewBox="0 0 32 32" ${SK}><path d="M5 8h22"/><path d="M7 8l6 11h6l6-11"/><path d="M13 19v2.5h6V19"/><path d="M9.5 24h13l-1.3 5H10.8z"/></svg>`,
  espresso: `<svg viewBox="0 0 32 32" ${SK}><path d="M8 14h13v4.5a5.5 5.5 0 0 1-5.5 5.5h-2A5.5 5.5 0 0 1 8 18.5z"/><path d="M21 15.5h1.8a2.5 2.5 0 0 1 0 5H21"/><path d="M6 27h18"/></svg>`,
  milk: `<svg viewBox="0 0 32 32" ${SK}><path d="M6 12h17v6a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7z"/><path d="M23 14h1.5a3 3 0 0 1 0 6H23"/><path d="M4 28h21"/><path d="M10.5 16.5c2-1.6 6-1.6 8 0"/></svg>`,
  moka: `<svg viewBox="0 0 32 32" ${SK}><path d="M15 3h2M16 3v2"/><path d="M11 5h10l1.6 10H9.4z"/><path d="M22.6 7.5h2.4l-.8 7h-1.6"/><path d="M9.2 17h13.6l-2 11H11.2z"/></svg>`,
  other: `<svg viewBox="0 0 32 32" ${SK}><ellipse cx="16" cy="16" rx="8" ry="11" transform="rotate(28 16 16)"/><path d="M12.4 6.8c4 4.6-.8 12.8 7.4 17.6"/></svg>`,
  star: `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" ${SK}><path d="M3.5 8.5a2 2 0 0 1 2-2h2.6L9.8 4h4.4l1.7 2.5h2.6a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.6"/></svg>`,
  trash: `<svg viewBox="0 0 16 16" ${SK}><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>`,
  play: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.3-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5z"/></svg>`,
  stop: `<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3.5" y="3.5" width="9" height="9" rx="1.5"/></svg>`,
  chev: `<svg viewBox="0 0 16 16" ${SK}><path d="M6 3l5 5-5 5"/></svg>`,
  back: `<svg viewBox="0 0 20 20" ${SK}><path d="M12.5 4l-6 6 6 6"/></svg>`
};
const TYPES = { filter: 'Filter', espresso: 'Espresso', milk: 'Espresso mit Milch', moka: 'Bialetti / Mokka', other: 'Sonstiges' };
const BAG_COLORS = ['#5B6B4A', '#7A5236', '#9A6B45', '#3F4E42', '#8A7A55', '#5A3F33', '#46585A', '#8E5444', '#CFC4AE'];
const TASTE = [
  { k: 'acid', l: 'Säure', c: 'var(--acid)', lo: 'mild', hi: 'lebendig' },
  { k: 'sweet', l: 'Süße', c: 'var(--sweet)', lo: 'kaum', hi: 'viel' },
  { k: 'bitter', l: 'Bitterkeit', c: 'var(--bitter)', lo: 'kaum', hi: 'kräftig' }
];
const tasteWord = v => v <= 1 ? 'kaum' : v <= 3 ? 'wenig' : v <= 6 ? 'mittel' : v <= 8 ? 'deutlich' : 'stark';
const starFill = (n, i) => clamp(n - (i - 1), 0, 1);
const starHTML = fill => `<span class="st">${ICON.star}<span class="f" style="width:${fill * 100}%">${ICON.star}</span></span>`;
const starsHTML = (n, size) => { n = Math.round((n || 0) * 2) / 2; return `<span class="stars"${size ? ` style="--ss:${size}px"` : ''} aria-label="${deStars(n)} von 5 Sternen">${[1, 2, 3, 4, 5].map(i => starHTML(starFill(n, i))).join('')}</span>`; };
const deStars = n => de(n, n % 1 ? 1 : 0);

/* ================= Zustand ================= */
const DEFAULT_SETTINGS = () => ({
  marks: [{ v: 10, l: 'Espresso' }, { v: 60, l: 'Bialetti' }, { v: 85, l: 'Filter' }],
  methods: [
    { id: 'm-filter', name: 'Filter', type: 'filter' },
    { id: 'm-cappu', name: 'Cappuccino', type: 'milk' },
    { id: 'm-espresso', name: 'Espresso', type: 'espresso' },
    { id: 'm-bia-s', name: 'Bialetti klein', type: 'moka' },
    { id: 'm-bia-l', name: 'Bialetti groß', type: 'moka' }
  ]
});
const GRIND = { min: 0, max: 90 };
const DEFAULTS = {
  filter: { dose: 15, grind: 85, pours: [{ l: 'Blooming', g: 45 }, { l: '1. Aufguss', g: 105 }, { l: '2. Aufguss', g: 100 }], brew_time: 180 },
  espresso: { dose: 18, grind: 10, yield: 36, shot: 28 },
  milk: { dose: 18, grind: 10, yield: 36, shot: 28, milk: 150 },
  moka: { dose: 15, grind: 60, water: 150 },
  other: { dose: 15, grind: 45 }
};
const S = {
  uid: null, email: '', me: null, profiles: new Map(), beans: [], brews: [],
  gFilter: 'all', gSort: 'new', lFilter: 'all', openBean: null, openBrew: null, loadedAt: 0
};
const settings = () => S.me.settings;
const myMethods = () => settings().methods.filter(m => !m.archived);
const bean = id => S.beans.find(b => b.id === id);
const brew = id => S.brews.find(c => c.id === id);
const person = id => S.profiles.get(id) || { id, name: 'Unbekannt' };
const pname = id => id === S.uid ? 'Du' : (person(id).name || 'Unbekannt');
const photoURL = b => b && b.photo_path ? sb.storage.from(BUCKET).getPublicUrl(b.photo_path).data.publicUrl : '';
const isLight = hex => parseInt(String(hex || '#000').slice(1), 16) > 0xB0B0B0;

function initials(name) {
  const p = String(name || '?').trim().split(/\s+/);
  return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}
const avatar = (id, size = 28) => `<span class="av" style="--h:${hash(id) % 360};--s:${size}px" title="${esc(person(id).name)}">${esc(initials(person(id).name))}</span>`;
const beanColor = b => b.color || BAG_COLORS[hash(b.id) % BAG_COLORS.length];
function beanPh(b, cls = '') {
  const url = photoURL(b);
  if (url) return `<div class="ph ${cls}"><img src="${esc(url)}" alt="Foto der Packung ${esc(b.name)}" loading="lazy"></div>`;
  const c = beanColor(b);
  return `<div class="ph ${cls}"><div class="blank${isLight(c) ? ' light' : ''}" style="--c:${c}"><small>${esc(b.roaster)}</small><b>${esc(b.name)}</b></div></div>`;
}
const beanThumb = (b, cls = 'thumb') => {
  const url = photoURL(b);
  return url ? `<img class="${cls}" src="${esc(url)}" alt="" loading="lazy">` : `<span class="${cls} blankt" style="--c:${beanColor(b)};display:block"></span>`;
};

function beanAgg(b) {
  const bs = S.brews.filter(c => c.bean_id === b.id);
  const per = {};
  bs.forEach(c => { (per[c.user_id] ||= []).push(c); });
  const persons = Object.entries(per).map(([u, list]) => {
    const r = list.filter(c => c.stars > 0);
    return { u, list: list.sort((a, c) => new Date(c.brewed_at) - new Date(a.brewed_at)), n: list.length, avg: r.length ? r.reduce((a, c) => a + +c.stars, 0) / r.length : 0 };
  }).sort((a, c) => (c.u === S.uid) - (a.u === S.uid) || c.n - a.n);
  const ratedP = persons.filter(p => p.avg > 0);
  // Mittel über die Personen, damit eine fleißige Person die Wertung nicht allein bestimmt
  const avg = ratedP.length ? ratedP.reduce((a, p) => a + p.avg, 0) / ratedP.length : 0;
  return { bs, persons, ratedP, avg, mine: per[S.uid] || [], per100: b.price && b.weight ? b.price / b.weight * 100 : 0 };
}
const waterOf = c => (c.pours || []).reduce((a, p) => a + (+p.g || 0), 0);
const ratioTxt = (dose, water) => dose && water ? '1:' + de(water / dose) : '–';
function brewLine(c) {
  if (!c.has_recipe) return 'ohne Rezept';
  let t = `${de(c.dose)} g · Mahlgrad ${c.grind}`;
  if (c.method_type === 'filter') t += ' · ' + ratioTxt(c.dose, waterOf(c));
  if (c.method_type === 'espresso' || c.method_type === 'milk') t += ` · ${de(c.yield)} g in ${c.shot} s`;
  if (c.method_type === 'moka') t += ` · ${c.water} ml`;
  return t;
}

/* ================= Daten ================= */
async function loadAll() {
  const [p, b, c] = await Promise.all([
    sb.from('profiles').select('id,name,settings'),
    sb.from('beans').select('*').order('created_at', { ascending: false }),
    sb.from('brews').select('*').order('brewed_at', { ascending: false })
  ]);
  const err = p.error || b.error || c.error;
  if (err) throw err;
  S.profiles = new Map(p.data.map(x => [x.id, x]));
  S.beans = b.data;
  S.brews = c.data.map(x => ({ ...x, stars: x.stars === null ? 0 : +x.stars, dose: x.dose === null ? null : +x.dose, yield: x.yield === null ? null : +x.yield }));
  S.me = S.profiles.get(S.uid) || null;
  if (S.me) {
    const s = S.me.settings || {};
    const d = DEFAULT_SETTINGS();
    S.me.settings = { ...s, marks: Array.isArray(s.marks) ? s.marks : d.marks, methods: Array.isArray(s.methods) && s.methods.length ? s.methods : d.methods };
  }
  S.loadedAt = Date.now();
}
async function saveSettings() {
  const { error } = await sb.from('profiles').update({ settings: settings() }).eq('id', S.uid);
  if (error) toast('Einstellung ließ sich nicht sichern.');
}
async function refresh() {
  try { await loadAll(); } catch (e) { toast('Keine Verbindung. Bitte später nochmal.'); return; }
  renderAll();
  if (S.openBean && $('#beanPanel').classList.contains('open')) { if (bean(S.openBean)) renderBeanPanel(S.openBean); }
  if (S.openBrew && $('#brewPanel').classList.contains('open')) { if (brew(S.openBrew)) renderBrewPanel(S.openBrew); }
}

/* ================= Meldung ================= */
let toastT = 0;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}

/* ================= Ebenen mit Zurück-Taste ================= */
const stack = [];
function openLayer(el) {
  if (stack.includes(el)) return;
  stack.push(el); el.inert = false; el.classList.add('open');
  if (el.classList.contains('sheet')) $('#scrim').classList.add('on');
  history.pushState({ layer: stack.length }, '');
}
function closeTop() {
  const el = stack.pop(); if (!el) return;
  el.classList.remove('open'); el.inert = true;
  if (el.id === 'brewSheet' && sw) sw.stop(true);
  if (!stack.some(x => x.classList.contains('sheet'))) $('#scrim').classList.remove('on');
  if (el.id === 'beanPanel') S.openBean = null;
  if (el.id === 'brewPanel') S.openBrew = null;
}
// UI-Schließen läuft über die Browser-History, damit Wischgeste und Zurück-Taste dasselbe tun
addEventListener('popstate', () => {
  const depth = (history.state && history.state.layer) || 0;
  while (stack.length > depth) closeTop();
});
const goBack = n => new Promise(res => {
  if (!stack.length || n < 1) return res();
  const h = () => { removeEventListener('popstate', h); setTimeout(res, 0); };
  addEventListener('popstate', h);
  history.go(-n);
});
const closeLayer = () => goBack(1);
const closeAllLayers = () => goBack(stack.length);
$('#scrim').addEventListener('click', closeLayer);

/* ================= Anmeldung ================= */
const gateMsg = m => { $('#gateMsg').textContent = m || ''; };
function showGate(step) {
  $('#boot').classList.add('gone');
  $('#app').hidden = true; $('#gate').hidden = false;
  ['fEmail', 'fCode', 'fName'].forEach(id => { $('#' + id).hidden = id !== step; });
  gateMsg('');
  setTimeout(() => { const i = $('#' + step + ' input'); i && i.focus(); }, 60);
}
$('#fEmail').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('#inEmail').value.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { gateMsg('Bitte eine gültige E-Mail eingeben.'); return; }
  const btn = e.submitter || $('#fEmail button'); btn.disabled = true; gateMsg('');
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
  btn.disabled = false;
  if (error) {
    gateMsg(error.status === 429 ? 'Zu viele Versuche. Bitte in ein paar Minuten nochmal.' : 'Das hat nicht geklappt: ' + error.message);
    return;
  }
  S.email = email; $('#sentTo').textContent = email;
  try { localStorage.setItem('kt.email', email); } catch (er) {}
  showGate('fCode');
});
$('#fCode').addEventListener('submit', async e => {
  e.preventDefault();
  const token = $('#inCode').value.replace(/\D/g, '');
  if (token.length < 6) { gateMsg('Der Code hat mindestens 6 Ziffern.'); return; }
  const btn = e.submitter || $('#fCode button[type=submit]'); btn.disabled = true;
  const { error } = await sb.auth.verifyOtp({ email: S.email, token, type: 'email' });
  btn.disabled = false;
  if (error) gateMsg('Der Code passt nicht oder ist abgelaufen.');
});
$('#inCode').addEventListener('input', e => { const v = e.target.value.replace(/\D/g, ''); e.target.value = v; if (v.length === 6 && !e.target.dataset.sent) { e.target.dataset.sent = 1; $('#fCode').requestSubmit(); setTimeout(() => delete e.target.dataset.sent, 1500); } });
$('#otherMail').onclick = () => showGate('fEmail');
$('#fName').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('#inName').value.trim();
  if (!name) { gateMsg('Wie heißt du?'); return; }
  const { error } = await sb.from('profiles').upsert({ id: S.uid, name, settings: DEFAULT_SETTINGS() });
  if (error) { gateMsg('Speichern hat nicht geklappt.'); return; }
  await enter();
});

let entering = false;
async function enter() {
  if (entering) return; entering = true;
  try {
    await loadAll();
    if (!S.me) {
      await sb.from('profiles').upsert({ id: S.uid, settings: DEFAULT_SETTINGS() });
      await loadAll();
    }
    if (!S.me || !S.me.name) { showGate('fName'); return; }
    $('#gate').hidden = true; $('#app').hidden = false;
    renderAll(); renderMe();
    $('#boot').classList.add('gone');
  } catch (e) {
    $('#boot').classList.add('gone');
    showGate('fEmail'); gateMsg('Verbindung zur Datenbank fehlgeschlagen. Bitte neu laden.');
  } finally { entering = false; }
}

/* ================= Ansichten ================= */
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === id));
  document.querySelectorAll('#tabs button').forEach(b => b.dataset.v === id ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  $('#fab').hidden = id === 'v-me';
  scrollTo({ top: 0 });
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) { showView(b.dataset.v); if (b.dataset.v === 'v-me') renderMe(); } });

function renderAll() { renderGallery(); renderLog(); }

const G_FILTERS = [['all', 'Alle'], ['open', 'Neu für mich'], ['roaster', 'Röster'], ['super', 'Supermarkt']];
function renderGallery() {
  const np = S.profiles.size;
  $('#bSub').textContent = S.beans.length ? `${S.beans.length} ${S.beans.length === 1 ? 'Packung' : 'Packungen'} · ${S.brews.length} ${S.brews.length === 1 ? 'Bewertung' : 'Bewertungen'} · ${np} ${np === 1 ? 'Person' : 'Personen'}` : 'Willkommen';
  $('#gFilter').innerHTML = G_FILTERS.map(([k, l]) => `<button class="chip" data-gf="${k}" aria-pressed="${S.gFilter === k}">${l}</button>`).join('');
  let list = S.beans.map(b => ({ b, a: beanAgg(b) }));
  if (S.gFilter === 'open') list = list.filter(x => !x.a.mine.length);
  if (S.gFilter === 'roaster' || S.gFilter === 'super') list = list.filter(x => x.b.kind === S.gFilter);
  if (S.gSort === 'rating') list.sort((x, y) => y.a.avg - x.a.avg);
  if (S.gSort === 'price') list.sort((x, y) => (x.a.per100 || 1e9) - (y.a.per100 || 1e9));
  if (!S.beans.length) {
    $('#grid').innerHTML = `<div class="empty" style="grid-column:1/-1"><h2>Noch keine Packung</h2><p>Fotografier deine erste Bohnenpackung. Danach können alle sie bewerten.</p><button class="btn primary" data-act="new-bean">Erste Packung anlegen</button></div>`;
    return;
  }
  if (!list.length) { $('#grid').innerHTML = `<div class="empty" style="grid-column:1/-1"><p>${S.gFilter === 'open' ? 'Du hast schon alles bewertet.' : 'Nichts in diesem Filter.'}</p></div>`; return; }
  $('#grid').innerHTML = list.map(({ b, a }, i) => `
    <button class="tile" data-act="bean" data-id="${b.id}" style="animation-delay:${Math.min(i, 12) * 30}ms">
      ${beanPh(b)}
      <span class="t-name">${esc(b.name)}</span>
      <span class="t-sub">${esc(b.roaster || (b.kind === 'super' ? 'Supermarkt' : 'Röster'))}${a.per100 ? ' · ' + eur(a.per100) + '/100 g' : ''}</span>
      <span class="t-meta">${a.avg ? `<span class="r">${starsHTML(a.avg, 12)}<span class="num">${de(a.avg)}</span></span>` : '<span class="none">noch ohne Wertung</span>'}
        <span class="avs">${a.persons.slice(0, 4).map(p => avatar(p.u, 22)).join('')}</span></span>
    </button>`).join('');
}
$('#gFilter').addEventListener('click', e => { const c = e.target.closest('[data-gf]'); if (c) { S.gFilter = c.dataset.gf; renderGallery(); buzz(4); } });
$('#gSort').addEventListener('change', e => { S.gSort = e.target.value; renderGallery(); });

function renderLog() {
  const mine = S.brews.filter(c => c.user_id === S.uid).length;
  $('#lSub').textContent = `${S.brews.length} insgesamt · ${mine} von dir`;
  $('#lFilter').innerHTML = [['all', 'Alle'], ['me', 'Nur ich'], ['others', 'Die anderen']].map(([k, l]) => `<button class="chip" data-lf="${k}" aria-pressed="${S.lFilter === k}">${l}</button>`).join('');
  let list = S.brews;
  if (S.lFilter === 'me') list = list.filter(c => c.user_id === S.uid);
  if (S.lFilter === 'others') list = list.filter(c => c.user_id !== S.uid);
  if (!list.length) { $('#logList').innerHTML = `<div class="empty"><h2>Noch nichts</h2><p>Hier erscheint jede Bewertung, deine und die der anderen.</p></div>`; return; }
  let last = '', h = '';
  list.forEach(c => {
    const b = bean(c.bean_id); if (!b) return;
    const day = isoDay(c.brewed_at);
    if (day !== last) {
      last = day;
      const diff = Math.round((new Date(isoDay(Date.now())) - new Date(day)) / DAY);
      h += `<div class="day">${diff === 0 ? 'Heute' : diff === 1 ? 'Gestern' : dLong(c.brewed_at)}</div>`;
    }
    h += `<button class="lrow" data-act="brew" data-id="${c.id}">${beanThumb(b)}
      <span style="min-width:0"><b>${esc(b.name)}</b><span class="meta">${esc(c.method_name || TYPES[c.method_type])} · ${pname(c.user_id)} · ${hhmm(c.brewed_at)}</span></span>
      <span class="right">${c.stars ? starsHTML(c.stars, 12) : '<span class="meta">ohne Sterne</span>'}${avatar(c.user_id, 20)}</span></button>`;
  });
  $('#logList').innerHTML = h;
}
$('#lFilter').addEventListener('click', e => { const c = e.target.closest('[data-lf]'); if (c) { S.lFilter = c.dataset.lf; renderLog(); buzz(4); } });

/* ================= Bohne im Detail ================= */
function renderBeanPanel(id) {
  const b = bean(id); if (!b) return;
  const a = beanAgg(b), own = b.created_by === S.uid;
  const days = b.roast ? Math.floor((Date.now() - new Date(b.roast).getTime()) / DAY) : null;
  const best = {};
  a.mine.filter(c => c.has_recipe).forEach(c => { const k = c.method_name; const cur = best[k]; if (!cur || c.stars > cur.stars || (c.stars === cur.stars && c.brewed_at > cur.brewed_at)) best[k] = c; });
  const bestRows = Object.values(best).sort((x, y) => y.stars - x.stars).map(c => `
    <button class="best" data-act="brew" data-id="${c.id}" style="width:100%;text-align:left">${ICON[c.method_type]}<div><b>${esc(c.method_name)}</b><span>${brewLine(c)}</span></div>${starsHTML(c.stars, 13)}</button>`).join('');
  const people = a.persons.map(p => `
    <div class="person">
      <div class="p-head">${avatar(p.u, 32)}<b>${p.u === S.uid ? 'Du' : esc(person(p.u).name)}</b>
        <span class="avg">${p.avg ? starsHTML(p.avg, 13) + `<span class="num">${de(p.avg)}</span>` : 'ohne Sterne'}</span></div>
      ${p.list.map(c => `<button class="brow" data-act="brew" data-id="${c.id}"><span class="m">${esc(c.method_name || TYPES[c.method_type])}</span><span class="r">${dShort(c.brewed_at)} · ${brewLine(c)}</span>${c.stars ? starsHTML(c.stars, 13) : ''}</button>`).join('')}
    </div>`).join('');
  $('#beanPanel').innerHTML = `
    <div class="p-bar"><button class="back" data-act="close">${ICON.back}Bohnen</button>${own ? `<button class="txt strong" data-act="edit-bean" data-id="${b.id}">Bearbeiten</button>` : '<span></span>'}</div>
    <div class="p-in">
      ${beanPh(b, 'hero')}
      <p class="kicker">${b.kind === 'super' ? 'Supermarkt' : 'Rösterei'}${b.roaster ? ' · ' + esc(b.roaster) : ''}</p>
      <h1 class="d-title">${esc(b.name)}</h1>
      ${b.origin ? `<p class="d-sub">${esc(b.origin)}</p>` : ''}
      <div class="score">
        ${a.avg ? `<span class="big">${de(a.avg)}</span><div>${starsHTML(a.avg)}<p>${a.bs.length} ${a.bs.length === 1 ? 'Bewertung' : 'Bewertungen'} von ${a.ratedP.length} ${a.ratedP.length === 1 ? 'Person' : 'Personen'}</p></div>`
        : `<div><b style="font-weight:500">Noch nicht bewertet</b><p>Sei die erste Person, die diese Bohne probiert.</p></div>`}
      </div>
      ${people ? `<section class="sec"><h3>Bewertungen</h3>${people}</section>` : ''}
      ${bestRows ? `<section class="sec"><h3>Deine besten Einstellungen</h3>${bestRows}</section>` : ''}
      <section class="sec"><h3>Einkauf</h3><dl class="facts">
        <div><dt>Gekauft bei</dt><dd>${esc(b.place) || '–'}</dd></div>
        <div><dt>Preis</dt><dd class="num">${b.price ? eur(b.price) : '–'}${b.weight ? `<small>für ${b.weight >= 1000 ? de(b.weight / 1000, b.weight % 1000 ? 1 : 0) + ' kg' : b.weight + ' g'}${a.per100 ? ' · ' + eur(a.per100) + ' je 100 g' : ''}</small>` : ''}</dd></div>
        <div><dt>Röstdatum</dt><dd>${b.roast ? dFull(b.roast) + `<small class="${days > 35 ? 'old' : ''}">vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}</small>` : '–'}</dd></div>
        <div><dt>Eingetragen von</dt><dd>${b.created_by === S.uid ? 'dir' : esc(person(b.created_by).name)}${b.bought ? `<small>gekauft am ${dFull(b.bought)}</small>` : ''}</dd></div>
      </dl></section>
      <div class="sticky-cta"><button class="btn primary" data-act="rate" data-id="${b.id}">${a.mine.length ? 'Noch eine Bewertung' : 'Bewertung hinzufügen'}</button></div>
    </div>`;
}
function openBean(id) {
  S.openBean = id; renderBeanPanel(id);
  $('#beanPanel').scrollTop = 0; openLayer($('#beanPanel'));
}

/* ================= Kaffee im Detail ================= */
function renderBrewPanel(id) {
  const c = brew(id); if (!c) return;
  const b = bean(c.bean_id), own = c.user_id === S.uid;
  let rec = '', extra = '';
  if (c.has_recipe) {
    rec = `<div><b>${de(c.dose)} g</b><span>Kaffeemehl</span></div><div><b>${c.grind}</b><span>Mahlgrad</span></div>`;
    if (c.method_type === 'filter') {
      const P = c.pours || [], W = waterOf(c);
      rec += `<div><b>${W} g</b><span>Wasser</span></div><div><b>${ratioTxt(c.dose, W)}</b><span>Verhältnis</span></div><div><b>${mmss(c.brew_time)}</b><span>Durchlauf</span></div><div><b>${P.length}</b><span>Aufgüsse</span></div>`;
      if (P.length) extra = `<div class="pourbar"><div class="pb">${P.map(p => `<i style="flex:${p.g || 1}"></i>`).join('')}</div><div class="pb-l">${P.map(p => `<span style="flex:${p.g || 1}">${p.g}</span>`).join('')}</div></div>`;
    } else if (c.method_type === 'espresso' || c.method_type === 'milk') {
      rec += `<div><b>${de(c.yield)} g</b><span>Ausbeute</span></div><div><b>${ratioTxt(c.dose, c.yield)}</b><span>Verhältnis</span></div><div><b>${c.shot} s</b><span>Bezugszeit</span></div>`;
      rec += c.method_type === 'milk' ? `<div><b>${c.milk} ml</b><span>Milch</span></div>` : '<div></div>';
    } else if (c.method_type === 'moka') {
      rec += `<div><b>${c.water} ml</b><span>Wasser</span></div><div><b>${ratioTxt(c.dose, c.water)}</b><span>Verhältnis</span></div>`;
    }
  }
  const tastes = TASTE.filter(t => c[t.k] !== null && c[t.k] !== undefined);
  $('#brewPanel').innerHTML = `
    <div class="p-bar"><button class="back" data-act="close">${ICON.back}Zurück</button>${own ? `<button class="txt strong" data-act="edit-brew" data-id="${c.id}">Bearbeiten</button>` : '<span></span>'}</div>
    <div class="p-in">
      ${b ? `<button class="bean-mini" data-act="bean-from-brew" data-id="${b.id}">${beanThumb(b)}<span><b>${esc(b.name)}</b><span>${esc(b.roaster)}${b.price ? ' · ' + eur(b.price) : ''}</span></span>${ICON.chev}</button>` : ''}
      <div class="byline">${avatar(c.user_id, 26)}<span>${own ? 'Deine Bewertung' : esc(person(c.user_id).name)} · ${dLong(c.brewed_at)}, ${hhmm(c.brewed_at)}</span></div>
      <h1 class="d-title">${esc(c.method_name || TYPES[c.method_type])}</h1>
      <div class="score">${c.stars ? `<span class="big">${deStars(c.stars)}</span><div>${starsHTML(c.stars)}<p>von 5 Sternen</p></div>` : '<div><b style="font-weight:500">Ohne Sterne</b></div>'}</div>
      ${tastes.length ? `<section class="sec"><h3>Geschmack</h3><div class="taste">${tastes.map(t => `<div class="tl"><span>${t.l}</span><div class="tr" style="--c:${t.c}"><i style="width:${c[t.k] * 10}%"></i></div><em>${tasteWord(c[t.k])}</em></div>`).join('')}</div></section>` : ''}
      ${c.has_recipe ? `<section class="sec"><h3>Rezept</h3><div class="recipe">${rec}</div>${extra}</section>` : ''}
      <div class="acts">${c.has_recipe ? `<button class="btn ${own ? 'primary' : 'accent'}" data-act="again" data-id="${c.id}">${own ? 'Nochmal machen' : 'Rezept übernehmen'}</button>` : `<button class="btn primary" data-act="rate" data-id="${c.bean_id}">Selbst bewerten</button>`}</div>
    </div>`;
}
function openBrew(id) {
  S.openBrew = id; renderBrewPanel(id);
  $('#brewPanel').scrollTop = 0; openLayer($('#brewPanel'));
}

/* ================= Lineal für den Mahlgrad ================= */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
function makeRuler(el, o) {
  el.innerHTML = '<div class="ruler-track"></div><div class="needle"></div>';
  el.tabIndex = 0; el.setAttribute('role', 'slider'); el.setAttribute('aria-label', o.label);
  const track = el.firstChild; let val = o.value, raw = o.value, drag = null, mom = 0;
  for (let v = o.min; v <= o.max; v++) {
    const t = document.createElement('i'); t.className = 't' + (v % 10 === 0 ? ' l' : v % 5 === 0 ? ' m' : '');
    t.style.left = ((v - o.min) * o.px) + 'px'; if (v % 10 === 0) t.dataset.n = v; track.appendChild(t);
  }
  (o.marks || []).forEach(m => {
    const k = document.createElement('b'); k.className = 'mk'; k.dataset.mark = m.v;
    k.style.left = ((m.v - o.min) * o.px) + 'px'; k.innerHTML = `<span>${esc(m.l)}</span>`; track.appendChild(k);
  });
  el.setAttribute('aria-valuemin', o.min); el.setAttribute('aria-valuemax', o.max);
  const place = (v, anim) => {
    track.style.transition = anim ? 'transform .45s var(--ease)' : 'none';
    track.style.transform = `translateX(${el.clientWidth / 2 - (v - o.min) * o.px}px)`;
  };
  const set = (r, opt = {}) => {
    raw = clamp(r, o.min, o.max); const s = Math.round(raw);
    if (s !== val) { val = s; if (opt.drag) buzz(2); o.onChange(val); }
    el.setAttribute('aria-valuenow', val);
    place(opt.drag ? raw : s, opt.anim);
  };
  el.addEventListener('pointerdown', e => {
    cancelAnimationFrame(mom);
    const mk = e.target.closest('[data-mark]');
    drag = { x: e.clientX, y: e.clientY, start: raw, lx: e.clientX, lt: e.timeStamp, v: 0, mark: mk ? +mk.dataset.mark : null, moved: false, id: e.pointerId };
  });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.abs(e.clientY - drag.y) > 10 && Math.abs(e.clientY - drag.y) > Math.abs(e.clientX - drag.x)) { drag = null; return; }
      if (Math.abs(e.clientX - drag.x) > 5) { drag.moved = true; try { el.setPointerCapture(drag.id); } catch (er) {} }
      else return;
    }
    e.preventDefault();
    set(drag.start - (e.clientX - drag.x) / o.px, { drag: true });
    const dt = e.timeStamp - drag.lt; if (dt > 0) drag.v = .75 * ((e.clientX - drag.lx) / dt) + .25 * drag.v;
    drag.lx = e.clientX; drag.lt = e.timeStamp;
  });
  const end = e => {
    if (!drag) return;
    if (!drag.moved) { const m = drag.mark; drag = null; if (m !== null) { set(m, { anim: true }); buzz([6, 30, 6]); } return; }
    let v = e.timeStamp - drag.lt > 80 ? 0 : drag.v; drag = null;
    if (REDUCED || Math.abs(v) < .05) { set(Math.round(raw), { anim: true }); return; }
    let last = performance.now();
    const step = t => {
      const dt = Math.min(32, t - last); last = t;
      const n = raw - v * dt / o.px; if (n <= o.min || n >= o.max) v = 0;
      set(n, { drag: true }); v *= Math.pow(.993, dt);
      if (Math.abs(v) > .03) mom = requestAnimationFrame(step); else set(Math.round(raw), { anim: true });
    };
    mom = requestAnimationFrame(step);
  };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  el.addEventListener('keydown', e => {
    const d = ['ArrowRight', 'ArrowUp'].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowDown'].includes(e.key) ? -1 : 0;
    if (d) { e.preventDefault(); set(val + d * (e.shiftKey ? 5 : 1), { anim: true }); }
  });
  el.setAttribute('aria-valuenow', val);
  return { relayout: () => place(val, false), setValue: v => { val = raw = clamp(v, o.min, o.max); el.setAttribute('aria-valuenow', val); place(val, true); } };
}

/* ================= Kaffee bewerten ================= */
let draft = null, grindRuler = null, sw = null;
const brBody = $('#brBody');
const markFor = type => { const l = { filter: 'Filter', espresso: 'Espresso', milk: 'Espresso', moka: 'Bialetti' }[type]; const m = settings().marks.find(x => x.l === l); return m ? m.v : null; };
const myBrews = () => S.brews.filter(c => c.user_id === S.uid);
const RECIPE_KEYS = ['dose', 'grind', 'pours', 'brew_time', 'yield', 'shot', 'milk', 'water'];

function prefill(m, fromC, beanId) {
  const base = clone(DEFAULTS[m.type]);
  if (markFor(m.type) !== null) base.grind = markFor(m.type);
  const all = myBrews().filter(c => c.has_recipe && c.method_name === m.name && c.method_type === m.type && c.id !== draft?.id);
  const last = fromC || all.find(c => c.bean_id === beanId) || all[0];
  if (last) RECIPE_KEYS.forEach(k => { if (last[k] !== null && last[k] !== undefined && k in base) base[k] = clone(last[k]); });
  return { vals: base, from: last, sameBean: last && last.bean_id === beanId, foreign: last && last.user_id !== S.uid };
}
function noteFor(p) {
  if (!p.from) return 'Deine Standardwerte für diese Zubereitung';
  if (p.foreign) return `Rezept von <b>${esc(person(p.from.user_id).name)}</b> übernommen`;
  return p.sameBean ? `Werte vom letzten Mal mit dieser Bohne (${dShort(p.from.brewed_at)})` : `Werte vom letzten Mal (${dShort(p.from.brewed_at)}) übernommen`;
}
function methodFor(c) {
  // passende eigene Zubereitung zu einem Eintrag finden, sonst die erste gleicher Art
  return myMethods().find(m => m.name === c.method_name && m.type === c.method_type) || myMethods().find(m => m.type === c.method_type) || null;
}
function openBrewForm(opt = {}) {
  if (!S.beans.length) { toast('Leg zuerst eine Packung an.'); openBeanForm(null, false); return; }
  sw && sw.stop(true);
  const src = opt.editId ? brew(opt.editId) : opt.templateId ? brew(opt.templateId) : null;
  if (opt.editId) {
    draft = clone(src); draft._note = '';
    draft._mid = (methodFor(src) || {}).id || null;
    RECIPE_KEYS.forEach(k => { if (draft[k] === null) delete draft[k]; });
    Object.assign(draft, { ...clone(DEFAULTS[src.method_type]), ...draft });
    TASTE.forEach(t => { if (draft[t.k] === null || draft[t.k] === undefined) draft[t.k] = 5; });
  } else {
    const mine = myBrews();
    const beanId = src ? src.bean_id : (opt.beanId || mine[0]?.bean_id || S.beans[0].id);
    const lastB = mine.find(c => c.bean_id === beanId && methodFor(c));
    const m = (src && methodFor(src)) || (lastB && methodFor(lastB)) || (mine[0] && methodFor(mine[0])) || myMethods()[0];
    const p = prefill(m, src && src.has_recipe ? src : null, beanId);
    draft = { id: null, bean_id: beanId, _mid: m.id, method_type: m.type, method_name: m.name, has_recipe: settings().recipeDefault !== false, stars: 0, acid: 5, sweet: 5, bitter: 5, ...p.vals };
    draft._note = src ? (src.user_id === S.uid ? `Vorlage vom ${dShort(src.brewed_at)}` : `Rezept von <b>${esc(person(src.user_id).name)}</b> übernommen`) : noteFor(p);
    if (src) draft.has_recipe = true;
  }
  $('#brTitle').textContent = opt.editId ? 'Bewertung bearbeiten' : 'Kaffee bewerten';
  renderBrewForm(!!opt.editId);
  brBody.scrollTop = 0;
  openLayer($('#brewSheet'));
  setTimeout(() => grindRuler && grindRuler.relayout(), 40);
}
function stepper(k, val, unit, step, wide) {
  return `<div class="stp${wide ? ' wide' : ''}"><button type="button" data-inc="${k}" data-step="${-step}" aria-label="weniger">−</button>
    <label><input data-k="${k}" inputmode="decimal" value="${fmtVal(k, val)}" autocomplete="off" aria-label="${k}"><span class="u">${unit}</span></label>
    <button type="button" data-inc="${k}" data-step="${step}" aria-label="mehr">+</button></div>`;
}
const fmtVal = (k, v) => (k === 'dose' || k === 'yield') ? de(v) : String(Math.round(v || 0));
const getV = k => k.startsWith('pour:') ? draft.pours[+k.slice(5)].g : draft[k];
function setV(k, v) {
  const lim = { dose: [1, 80], yield: [1, 200], milk: [0, 500], water: [10, 1500], brew_time: [0, 1200], shot: [0, 120] };
  if (k.startsWith('pour:')) { draft.pours[+k.slice(5)].g = clamp(Math.round(v), 0, 1000); return; }
  const [a, b] = lim[k] || [0, 9999];
  draft[k] = clamp(k === 'dose' || k === 'yield' ? Math.round(v * 10) / 10 : Math.round(v), a, b);
}
function beanChips() {
  const sorted = [...S.beans].sort((a, b) => (b.id === draft.bean_id) - (a.id === draft.bean_id));
  return sorted.map(b => `<button type="button" class="chip bean" data-b="${b.id}" aria-pressed="${b.id === draft.bean_id}">${beanThumb(b)}${esc(b.name)}</button>`).join('');
}
function renderBrewForm(isEdit) {
  const ms = myMethods().slice();
  if (draft._mid && !ms.find(m => m.id === draft._mid)) { const m = settings().methods.find(x => x.id === draft._mid); if (m) ms.push(m); }
  const unknown = !draft._mid;
  brBody.innerHTML = `
    <div class="f-sec"><div class="f-lbl"><span class="label">Bohne</span><button type="button" class="txt" id="fNewBean">+ Neue Packung</button></div>
      <div class="chips" id="fBeans">${beanChips()}</div></div>
    <div class="f-sec"><div class="f-lbl"><span class="label">Bewertung</span></div>
      <div class="stars-in" id="fStars">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-s="${i}" aria-label="${i} Sterne">${starHTML(starFill(draft.stars, i))}</button>`).join('')}<b class="stars-v" id="fStarV"></b></div>
      <p class="tip">Linke Sternhälfte für halbe Sterne</p>
      ${TASTE.map(t => `<div class="slider" style="--c:${t.c}"><div class="ends"><span>${t.l}</span><b id="tv-${t.k}"></b></div>
        <input type="range" min="0" max="10" step="1" data-taste="${t.k}" value="${draft[t.k]}" aria-label="${t.l}" style="--c:${t.c}">
        <div class="lohi"><span>${t.lo}</span><span>${t.hi}</span></div></div>`).join('')}
    </div>
    <div class="f-sec"><div class="f-lbl"><span class="label">Zubereitung</span></div>
      <div class="chips" id="fMethods">${unknown ? `<button type="button" class="chip" aria-pressed="true">${ICON[draft.method_type]}${esc(draft.method_name)}</button>` : ''}${ms.map(m => `<button type="button" class="chip" data-m="${m.id}" aria-pressed="${m.id === draft._mid}">${ICON[m.type]}${esc(m.name)}</button>`).join('')}</div>
      <label class="switch" style="margin-top:18px"><span><b>Rezept notieren</b><small>Menge, Mahlgrad und Zeiten</small></span><input type="checkbox" id="fRecipe"${draft.has_recipe ? ' checked' : ''}><span class="tg"></span></label>
    </div>
    <div class="recipe-box${draft.has_recipe ? '' : ' off'}" id="fRecipeBox">
      <div class="f-sec" style="padding-top:4px"><p class="f-note" id="fNote" style="margin:0 0 16px">${draft._note || ''}</p>
        <div class="dose-row"><span class="label">Kaffeemehl</span>${stepper('dose', draft.dose, 'g', .5)}</div></div>
      <div class="f-sec"><div class="grind-head"><div><span class="label">Mahlgrad</span><span class="g-hint" id="gHint">${grindHint(draft.grind)}</span></div><span class="grind-val" id="gVal">${draft.grind}</span></div><div class="ruler" id="fGrind"></div></div>
      <div class="f-sec" id="fSpec"></div>
    </div>
    ${isEdit ? `<div class="f-sec"><button type="button" class="btn danger block" id="fDelete">Bewertung löschen</button></div>` : ''}`;
  grindRuler = makeRuler($('#fGrind'), {
    min: GRIND.min, max: GRIND.max, px: 14, value: clamp(draft.grind, GRIND.min, GRIND.max), label: 'Mahlgrad', marks: settings().marks,
    onChange: v => { draft.grind = v; $('#gVal').textContent = v; $('#gHint').textContent = grindHint(v); }
  });
  renderSpec(); slidersTxt(); paintStars();
}
function grindHint(v) {
  let near = null;
  settings().marks.forEach(m => { const d = v - m.v; if (!near || Math.abs(d) < Math.abs(near.d)) near = { d, l: m.l }; });
  if (!near) return '';
  if (!near.d) return `Standard für ${near.l}`;
  return Math.abs(near.d) <= 12 ? `${Math.abs(near.d)} ${near.d > 0 ? 'gröber' : 'feiner'} als ${near.l}` : '';
}
function slidersTxt() {
  TASTE.forEach(t => { $('#tv-' + t.k).textContent = tasteWord(draft[t.k]); });
  brBody.querySelectorAll('[data-taste]').forEach(i => i.style.setProperty('--p', i.value * 10 + '%'));
}
function paintStars() {
  brBody.querySelectorAll('#fStars button').forEach((b, i) => { b.querySelector('.f').style.width = starFill(draft.stars, i + 1) * 100 + '%'; });
  $('#fStarV').textContent = draft.stars ? deStars(draft.stars) : '';
}
function renderSpec(anim) {
  const t = draft.method_type, el = $('#fSpec');
  let h = '';
  if (t === 'filter') {
    if (!Array.isArray(draft.pours) || !draft.pours.length) draft.pours = clone(DEFAULTS.filter.pours);
    h = `<div class="f-lbl"><span class="label">Aufgüsse</span></div><div id="fPours">${draft.pours.map(pourRow).join('')}</div>
      <button type="button" class="addpour" id="addPour">+ Aufguss</button>
      <div class="totals"><div><b id="tW"></b><span>Wasser gesamt</span></div><div><b id="tR"></b><span>Verhältnis</span></div></div>
      <div class="label sub-lbl">Durchlaufzeit</div>${swHTML('brew_time')}`;
  } else if (t === 'espresso' || t === 'milk') {
    h = `<div class="dose-row"><span class="label">Ausbeute</span>${stepper('yield', draft.yield, 'g', .5)}</div>
      <div class="totals"><div><b id="tR"></b><span>Verhältnis</span></div><div><b id="tY"></b><span>Ziel bei 1:2</span></div></div>
      <div class="label sub-lbl">Bezugszeit</div>${swHTML('shot')}
      ${t === 'milk' ? `<div class="dose-row" style="margin-top:18px"><span class="label">Milch</span>${stepper('milk', draft.milk, 'ml', 10, true)}</div>` : ''}`;
  } else if (t === 'moka') {
    h = `<div class="dose-row"><span class="label">Wasser</span>${stepper('water', draft.water, 'ml', 10, true)}</div>
      <div class="totals"><div><b id="tR"></b><span>Verhältnis</span></div><div><b id="tW"></b><span>Wasser</span></div></div>`;
  } else h = `<p class="f-note" style="margin:0">Für diese Zubereitung gibt es keine Extrafelder.</p>`;
  el.innerHTML = h;
  if (anim) { el.style.animation = 'none'; el.offsetWidth; el.style.animation = 'rise .35s var(--ease)'; }
  sw = null; const swEl = el.querySelector('.sw'); if (swEl) sw = stopwatch(swEl);
  totals();
}
const pourRow = (p, i) => `<div class="pour"><span class="pour-n">${esc(p.l)}</span>${stepper('pour:' + i, p.g, 'g', 5)}
  ${i > 0 ? `<button type="button" class="icon-btn" data-delpour="${i}" aria-label="Aufguss entfernen">${ICON.trash}</button>` : '<span></span>'}</div>`;
function swHTML(k) {
  const st = k === 'shot' ? 1 : 5;
  return `<div class="sw" data-k="${k}"><button type="button" class="sw-btn" aria-label="Stoppuhr starten">${ICON.play}</button>
    <span class="sw-t">${k === 'shot' ? draft[k] + ' s' : mmss(draft[k])}</span><span class="grow"></span>
    <button type="button" class="mini" data-inc="${k}" data-step="-${st}">−${st}</button>
    <button type="button" class="mini" data-inc="${k}" data-step="${st}">+${st}</button></div>`;
}
function stopwatch(el) {
  const k = el.dataset.k, btn = el.querySelector('.sw-btn'), out = el.querySelector('.sw-t');
  let t0 = 0, raf = 0, on = false;
  const show = s => out.textContent = k === 'shot' ? Math.round(s) + ' s' : mmss(s);
  const loop = () => { const s = (performance.now() - t0) / 1000; show(s); draft[k] = Math.round(s); raf = requestAnimationFrame(loop); };
  const api = {
    toggle() { if (on) return api.stop(); on = true; t0 = performance.now(); el.classList.add('run'); btn.innerHTML = ICON.stop; buzz(10); loop(); },
    stop(silent) { if (!on) return; on = false; cancelAnimationFrame(raf); el.classList.remove('run'); btn.innerHTML = ICON.play; if (!silent) { buzz([8, 30, 8]); show(draft[k]); } },
    refresh() { show(draft[k]); }
  };
  btn.onclick = api.toggle;
  return api;
}
function totals() {
  const t = draft.method_type, set = (id, txt) => { const e = $('#' + id); if (e) e.textContent = txt; };
  if (t === 'filter') { const W = waterOf(draft); set('tW', W + ' g'); set('tR', ratioTxt(draft.dose, W)); }
  if (t === 'espresso' || t === 'milk') { set('tR', ratioTxt(draft.dose, draft.yield)); set('tY', de(draft.dose * 2) + ' g'); }
  if (t === 'moka') { set('tR', ratioTxt(draft.dose, draft.water)); set('tW', draft.water + ' ml'); }
}
function refreshInput(k) {
  const i = brBody.querySelector(`input[data-k="${k}"]`); if (i && document.activeElement !== i) i.value = fmtVal(k, getV(k));
  if (k === 'brew_time' || k === 'shot') sw && sw.refresh();
}
function applyMethod(mid) {
  sw && sw.stop(true);
  const m = settings().methods.find(x => x.id === mid); if (!m) return;
  const p = prefill(m, null, draft.bean_id);
  Object.assign(draft, p.vals, { _mid: m.id, method_type: m.type, method_name: m.name });
  brBody.querySelectorAll('#fMethods .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === mid)));
  $('#fNote').innerHTML = noteFor(p);
  brBody.querySelector('input[data-k="dose"]').value = fmtVal('dose', draft.dose);
  $('#gVal').textContent = draft.grind; $('#gHint').textContent = grindHint(draft.grind); grindRuler.setValue(draft.grind);
  renderSpec(true);
}

brBody.addEventListener('click', e => {
  const inc = e.target.closest('[data-inc]');
  if (inc) { const k = inc.dataset.inc; setV(k, getV(k) + parseNum(inc.dataset.step)); refreshInput(k); totals(); buzz(4); return; }
  const mc = e.target.closest('[data-m]');
  if (mc && mc.dataset.m !== draft._mid) { applyMethod(mc.dataset.m); buzz(6); return; }
  const bc = e.target.closest('[data-b]');
  if (bc && bc.dataset.b !== draft.bean_id) {
    draft.bean_id = bc.dataset.b; brBody.querySelectorAll('[data-b]').forEach(b => b.setAttribute('aria-pressed', String(b === bc))); buzz(5);
    if (!draft.id && draft._mid) applyMethod(draft._mid);
    return;
  }
  if (e.target.closest('#addPour')) {
    draft.pours.push({ l: draft.pours.length + '. Aufguss', g: draft.pours[draft.pours.length - 1]?.g || 100 });
    $('#fPours').insertAdjacentHTML('beforeend', pourRow(draft.pours[draft.pours.length - 1], draft.pours.length - 1));
    totals(); buzz(6); return;
  }
  const dp = e.target.closest('[data-delpour]');
  if (dp) {
    const i = +dp.dataset.delpour; dp.closest('.pour').classList.add('out');
    setTimeout(() => { draft.pours.splice(i, 1); draft.pours.forEach((p, j) => p.l = j === 0 ? 'Blooming' : j + '. Aufguss'); $('#fPours').innerHTML = draft.pours.map(pourRow).join(''); totals(); }, 200);
    return;
  }
  const st = e.target.closest('#fStars [data-s]');
  if (st) {
    const i = +st.dataset.s, r = st.getBoundingClientRect();
    let n = e.clientX && e.clientX < r.left + r.width / 2 ? i - .5 : i;
    if (n === draft.stars) n = 0;
    draft.stars = n; paintStars();
    brBody.querySelectorAll('#fStars button').forEach(b => b.classList.remove('pop'));
    if (n) { st.offsetWidth; st.classList.add('pop'); }
    buzz(n === 5 ? [10, 40, 10] : 6); return;
  }
  if (e.target.closest('#fNewBean')) { openBeanForm(null, true); return; }
  if (e.target.id === 'fDelete') {
    const b = e.target;
    if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = 'Wirklich löschen?'; setTimeout(() => { b.classList.remove('armed'); b.textContent = 'Bewertung löschen'; }, 2600); return; }
    deleteBrew(draft.id);
  }
});
brBody.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.k) { setV(t.dataset.k, parseNum(t.value)); totals(); return; }
  if (t.dataset.taste) { draft[t.dataset.taste] = +t.value; slidersTxt(); }
});
brBody.addEventListener('change', e => {
  if (e.target.id === 'fRecipe') {
    draft.has_recipe = e.target.checked;
    $('#fRecipeBox').classList.toggle('off', !draft.has_recipe);
    if (draft.has_recipe) setTimeout(() => grindRuler.relayout(), 20); else sw && sw.stop(true);
  }
});
brBody.addEventListener('focusout', e => { if (e.target.dataset && e.target.dataset.k) e.target.value = fmtVal(e.target.dataset.k, getV(e.target.dataset.k)); });

async function deleteBrew(id) {
  const { error } = await sb.from('brews').delete().eq('id', id);
  if (error) { toast('Löschen hat nicht geklappt.'); return; }
  await closeAllLayers(); await refresh(); toast('Bewertung gelöscht');
}
$('#brSave').onclick = async () => {
  if (!draft.bean_id) { toast('Wähle zuerst eine Bohne.'); return; }
  sw && sw.stop(true);
  const t = draft.method_type, r = draft.has_recipe;
  const row = {
    bean_id: draft.bean_id, method_type: t, method_name: draft.method_name, has_recipe: r,
    stars: draft.stars || null, acid: draft.acid, sweet: draft.sweet, bitter: draft.bitter,
    dose: r ? draft.dose : null, grind: r ? draft.grind : null,
    pours: r && t === 'filter' ? draft.pours : null, brew_time: r && t === 'filter' ? draft.brew_time : null,
    yield: r && (t === 'espresso' || t === 'milk') ? draft.yield : null, shot: r && (t === 'espresso' || t === 'milk') ? draft.shot : null,
    milk: r && t === 'milk' ? draft.milk : null, water: r && t === 'moka' ? draft.water : null
  };
  if (r && !(row.dose > 0)) { toast('Wie viel Kaffeemehl?'); return; }
  const btn = $('#brSave'); btn.disabled = true;
  const isNew = !draft.id;
  const q = isNew ? sb.from('brews').insert(row).select().single() : sb.from('brews').update(row).eq('id', draft.id).select().single();
  const { error } = await q;
  btn.disabled = false;
  if (error) { toast('Speichern hat nicht geklappt.'); return; }
  await closeLayer();
  await refresh();
  buzz([12, 50, 12]);
  toast(isNew ? 'Bewertung gespeichert' : 'Änderung gespeichert');
};

/* ================= Packung anlegen ================= */
let bDraft = null, bFromForm = false, bBlob = null;
function openBeanForm(id, fromForm) {
  bFromForm = !!fromForm;
  const b = id ? bean(id) : null;
  bDraft = b ? { ...b } : { id: null, name: '', roaster: '', kind: 'roaster', place: '', price: null, weight: 250, roast: '', bought: isoDay(Date.now()), origin: '', color: BAG_COLORS[S.beans.length % BAG_COLORS.length] };
  bBlob = null;
  const cur = b && photoURL(b);
  const others = b ? S.brews.filter(c => c.bean_id === b.id && c.user_id !== S.uid).length : 0;
  $('#bfTitle').textContent = b ? 'Packung bearbeiten' : 'Neue Packung';
  $('#bfBody').innerHTML = `
    <label class="shot" id="bfShot" for="bfCam">
      ${cur ? `<img src="${esc(cur)}" alt="Foto der Packung">` : `<span class="shot-empty">${ICON.camera}Packung fotografieren<small>Vorderseite mit Etikett</small></span>`}
    </label>
    <div class="shot-btns">
      <label class="btn primary">${ICON.camera}Kamera<input type="file" accept="image/*" capture="environment" id="bfCam" class="vh" data-photo></label>
      <label class="btn">Mediathek<input type="file" accept="image/*" class="vh" data-photo></label>
    </div>
    <div class="f-sec stack">
      <label class="field"><span>Name der Bohne</span><input id="bfName" value="${esc(bDraft.name)}" placeholder="zum Beispiel Kolumbien Huila" autocomplete="off" maxlength="120"></label>
      <div class="field"><span>Gekauft beim</span>
        <div class="seg" id="bfKind" role="radiogroup">
          <button role="radio" type="button" data-k="roaster" aria-checked="${bDraft.kind === 'roaster'}">Röster</button>
          <button role="radio" type="button" data-k="super" aria-checked="${bDraft.kind === 'super'}">Supermarkt</button></div></div>
      <label class="field"><span id="bfRoLbl">${bDraft.kind === 'super' ? 'Marke' : 'Rösterei'}</span><input id="bfRoaster" value="${esc(bDraft.roaster)}" autocomplete="off"></label>
      <label class="field"><span>Kaufort</span><input id="bfPlace" value="${esc(bDraft.place)}" placeholder="Laden, Stadt oder Online-Shop" autocomplete="off"></label>
    </div>
    <div class="f-sec stack">
      <div class="row2"><label class="field"><span>Preis in €</span><input id="bfPrice" inputmode="decimal" class="num" value="${bDraft.price ? de(bDraft.price, 2) : ''}" placeholder="0,00"></label>
        <label class="field"><span>Menge in g</span><input id="bfWeight" inputmode="numeric" class="num" value="${bDraft.weight || ''}"></label></div>
      <div class="chips" id="bfSizes">${[250, 500, 1000].map(s => `<button type="button" class="chip" data-w="${s}" aria-pressed="${+bDraft.weight === s}">${s < 1000 ? s + ' g' : '1 kg'}</button>`).join('')}</div>
      <p class="ppk" id="bfPpk"></p>
    </div>
    <div class="f-sec stack">
      <div class="row2"><label class="field"><span>Gekauft am</span><input type="date" id="bfBought" value="${bDraft.bought || ''}"></label>
        <label class="field"><span>Röstdatum <small>optional</small></span><input type="date" id="bfRoast" value="${bDraft.roast || ''}"></label></div>
      <label class="field"><span>Herkunft <small>optional</small></span><input id="bfOrigin" value="${esc(bDraft.origin)}" placeholder="Land, Aufbereitung" autocomplete="off"></label>
      <div class="field"><span>Farbe <small>falls es kein Foto gibt</small></span>
        <div class="colors" id="bfColors">${BAG_COLORS.map(c => `<button type="button" data-c="${c}" style="background:${c}" aria-pressed="${c === bDraft.color}" aria-label="Farbe ${c}"></button>`).join('')}</div></div>
    </div>
    ${b ? `<div class="f-sec">${others ? `<p class="hint">Andere haben diese Packung schon bewertet. Deshalb lässt sie sich nicht mehr löschen.</p>` : `<button type="button" class="btn danger block" id="bfDelete">Packung löschen</button>`}</div>` : ''}`;
  ppk();
  $('#bfBody').scrollTop = 0;
  openLayer($('#beanSheet'));
}
function ppk() {
  const p = parseNum($('#bfPrice').value), w = parseNum($('#bfWeight').value);
  $('#bfPpk').innerHTML = p && w ? `Das sind <b>${eur(p / w * 100)}</b> je 100 g.` : '';
}
$('#bfBody').addEventListener('input', e => {
  if (e.target.id === 'bfPrice' || e.target.id === 'bfWeight') {
    ppk();
    if (e.target.id === 'bfWeight') $('#bfSizes').querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.w === parseNum(e.target.value))));
  }
});
$('#bfBody').addEventListener('click', async e => {
  if (e.target.id === 'bfDelete') {
    const btn = e.target, n = S.brews.filter(c => c.bean_id === bDraft.id).length;
    if (!btn.classList.contains('armed')) {
      btn.classList.add('armed'); btn.textContent = n ? `Packung und ${n} ${n === 1 ? 'Bewertung' : 'Bewertungen'} löschen?` : 'Wirklich löschen?';
      setTimeout(() => { btn.classList.remove('armed'); btn.textContent = 'Packung löschen'; }, 3000); buzz(8); return;
    }
    const path = bDraft.photo_path;
    const { error, count } = await sb.from('beans').delete({ count: 'exact' }).eq('id', bDraft.id);
    if (error || !count) { toast('Löschen ging nicht. Vielleicht hat gerade jemand bewertet.'); return; }
    if (path) sb.storage.from(BUCKET).remove([path]);
    await closeAllLayers(); await refresh(); toast('Packung gelöscht');
    return;
  }
  const c = e.target.closest('[data-c]');
  if (c) { bDraft.color = c.dataset.c; $('#bfColors').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === c))); buzz(5); return; }
  const k = e.target.closest('#bfKind [role=radio]');
  if (k) { bDraft.kind = k.dataset.k; $('#bfKind').querySelectorAll('[role=radio]').forEach(b => b.setAttribute('aria-checked', String(b === k))); $('#bfRoLbl').textContent = bDraft.kind === 'super' ? 'Marke' : 'Rösterei'; buzz(5); return; }
  const w = e.target.closest('[data-w]');
  if (w) { $('#bfWeight').value = w.dataset.w; $('#bfSizes').querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === w))); ppk(); buzz(4); }
});
function resizePhoto(file) {
  // auf 4:5 zuschneiden und verkleinern
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const W = 900, H = 1125, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const s = Math.max(W / img.width, H / img.height), dw = img.width * s, dh = img.height * s;
      cv.getContext('2d').drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      URL.revokeObjectURL(url);
      cv.toBlob(bl => bl ? res(bl) : rej(new Error('blob')), 'image/jpeg', .82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
    img.src = url;
  });
}
$('#bfBody').addEventListener('change', async e => {
  if (!e.target.matches('[data-photo]') || !e.target.files[0]) return;
  const inp = e.target, f = inp.files[0];
  try {
    bBlob = await resizePhoto(f); inp.value = '';
    const shot = $('#bfShot'); shot.querySelectorAll('img,.shot-empty').forEach(n => n.remove());
    shot.insertAdjacentHTML('beforeend', `<img src="${URL.createObjectURL(bBlob)}" alt="Foto der Packung">`);
    buzz([10, 30, 10]);
    setTimeout(() => $('#bfName').value || $('#bfName').focus(), 300);
  } catch (er) { toast('Das Bild ließ sich nicht öffnen.'); }
});
async function uploadPhoto(beanId, blob, oldPath) {
  const path = `${S.uid}/${beanId}-${Date.now().toString(36)}.jpg`;
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) throw error;
  if (oldPath && oldPath.startsWith(S.uid + '/')) sb.storage.from(BUCKET).remove([oldPath]);
  return path;
}
$('#bfSave').onclick = async () => {
  const name = $('#bfName').value.trim();
  if (!name) { $('#bfName').focus(); toast('Gib der Bohne einen Namen.'); return; }
  const row = {
    name, kind: bDraft.kind, roaster: $('#bfRoaster').value.trim(), place: $('#bfPlace').value.trim(),
    price: parseNum($('#bfPrice').value) || null, weight: Math.round(parseNum($('#bfWeight').value)) || null,
    bought: $('#bfBought').value || null, roast: $('#bfRoast').value || null, origin: $('#bfOrigin').value.trim(), color: bDraft.color
  };
  const btn = $('#bfSave'); btn.disabled = true;
  try {
    let id = bDraft.id;
    if (!id) {
      const { data, error } = await sb.from('beans').insert(row).select().single();
      if (error) throw error; id = data.id;
    } else {
      const { error } = await sb.from('beans').update(row).eq('id', id);
      if (error) throw error;
    }
    if (bBlob) {
      try {
        const path = await uploadPhoto(id, bBlob, bDraft.photo_path);
        await sb.from('beans').update({ photo_path: path }).eq('id', id);
      } catch (er) { toast('Packung gespeichert, das Foto aber nicht.'); }
      bBlob = null;
    }
    const isNew = !bDraft.id;
    await closeLayer();
    await refresh();
    if (bFromForm && draft) {
      draft.bean_id = id; $('#fBeans').innerHTML = beanChips(); toast('Packung angelegt und ausgewählt');
    } else if (isNew) {
      S.gFilter = 'all'; showView('v-beans'); renderGallery(); toast('Packung angelegt');
    } else toast('Packung gespeichert');
  } catch (er) { toast('Speichern hat nicht geklappt.'); }
  finally { btn.disabled = false; }
};

/* ================= Profil ================= */
function renderMe() {
  if (!S.me) return;
  $('#meName').textContent = S.me.name;
  const s = settings();
  const n = myBrews().length, nb = S.beans.filter(b => b.created_by === S.uid).length;
  $('#meBody').innerHTML = `
    <div class="card"><div class="who">${avatar(S.uid, 48)}<div><b>${esc(S.me.name)}</b><div class="mail">${esc(S.email)}</div></div></div>
      <p style="margin:14px 0 0;color:var(--muted);font-size:14px">${n} ${n === 1 ? 'Bewertung' : 'Bewertungen'} · ${nb} ${nb === 1 ? 'Packung' : 'Packungen'} eingetragen</p></div>
    <div class="card"><h2>Name</h2><p>So sehen dich die anderen.</p>
      <label class="field"><input id="setName" value="${esc(S.me.name)}" maxlength="40" aria-label="Name"></label></div>
    <div class="card"><h2>Mahlgrad</h2><p>Deine Standardwerte auf der Skala von 0 bis 90. Jede Person hat eigene, weil jede Mühle anders mahlt.</p>
      <div class="row3" id="markIn">${s.marks.map((m, i) => `<label class="field"><span>${esc(m.l)}</span><input data-mark-i="${i}" inputmode="numeric" class="num" value="${m.v}"></label>`).join('')}</div></div>
    <div class="card"><h2>Zubereitungen</h2><p>Die Art bestimmt, welche Felder beim Rezept erscheinen.</p>
      <div id="mList">${myMethods().map(m => `<div class="m-row" data-id="${m.id}">${ICON[m.type]}
        <input class="inp" data-mname value="${esc(m.name)}" aria-label="Name">
        <select class="inp" data-mtype aria-label="Art">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}"${k === m.type ? ' selected' : ''}>${v}</option>`).join('')}</select>
        <button class="icon-btn" data-mdel aria-label="Entfernen">${ICON.trash}</button></div>`).join('')}</div>
      <button class="btn block" id="addMethod" style="margin-top:6px">Zubereitung hinzufügen</button>
      <label class="switch" style="margin-top:18px"><span><b>Rezept standardmäßig notieren</b><small>Aus, wenn du meist nur bewertest</small></span><input type="checkbox" id="setRecipe"${s.recipeDefault !== false ? ' checked' : ''}><span class="tg"></span></label></div>
    <div class="card"><h2>Alte Daten übernehmen</h2><p>Lade die Sicherungsdatei aus der bisherigen App. Packungen, Fotos und Kaffees landen dann unter deinem Namen.${s.imported ? ` Schon einmal importiert am ${dFull(s.imported)}.` : ''}</p>
      <label class="btn block" style="cursor:pointer">Sicherung auswählen<input type="file" accept="application/json,.json" id="importFile" class="vh"></label>
      <p class="fine" id="importMsg" style="margin-top:10px"></p></div>
    <button class="btn block" id="logout">Abmelden</button>
    <p class="foot">Kaffeetagebuch · Version ${VERSION}</p>`;
}
$('#meBody').addEventListener('change', async e => {
  const t = e.target;
  if (t.id === 'setName') {
    const name = t.value.trim(); if (!name) { t.value = S.me.name; return; }
    const { error } = await sb.from('profiles').update({ name }).eq('id', S.uid);
    if (error) { toast('Name ließ sich nicht sichern.'); return; }
    S.me.name = name; $('#meName').textContent = name; renderAll(); toast('Name gespeichert');
  }
  if (t.dataset.markI !== undefined) {
    const i = +t.dataset.markI; settings().marks[i].v = clamp(Math.round(parseNum(t.value)), GRIND.min, GRIND.max);
    t.value = settings().marks[i].v; await saveSettings(); toast(`${settings().marks[i].l} steht jetzt auf ${settings().marks[i].v}`);
  }
  if (t.matches('[data-mtype]')) {
    const row = t.closest('.m-row'), m = settings().methods.find(x => x.id === row.dataset.id);
    m.type = t.value; row.querySelector('svg').outerHTML = ICON[m.type]; await saveSettings();
  }
  if (t.matches('[data-mname]')) {
    const m = settings().methods.find(x => x.id === t.closest('.m-row').dataset.id);
    m.name = t.value.trim() || m.name; t.value = m.name; await saveSettings();
  }
  if (t.id === 'setRecipe') { settings().recipeDefault = t.checked; await saveSettings(); }
  if (t.id === 'importFile') importBackup(t);
});
$('#meBody').addEventListener('click', async e => {
  const d = e.target.closest('[data-mdel]');
  if (d) {
    if (!d.classList.contains('armed')) { d.classList.add('armed'); setTimeout(() => d.classList.remove('armed'), 2600); buzz(8); return; }
    if (myMethods().length <= 1) { toast('Eine Zubereitung muss bleiben.'); return; }
    settings().methods.find(x => x.id === d.closest('.m-row').dataset.id).archived = true;
    await saveSettings(); renderMe(); toast('Zubereitung entfernt. Alte Einträge bleiben.');
    return;
  }
  if (e.target.id === 'addMethod') {
    const m = { id: uidLocal('m'), name: 'Neue Zubereitung', type: 'other' }; settings().methods.push(m); await saveSettings(); renderMe();
    const inp = document.querySelector(`.m-row[data-id="${m.id}"] [data-mname]`); inp.focus(); inp.select();
    return;
  }
  if (e.target.id === 'logout') { await sb.auth.signOut(); location.reload(); }
});

async function importBackup(input) {
  const f = input.files[0]; input.value = ''; if (!f) return;
  const msg = $('#importMsg');
  let n;
  try { n = JSON.parse(await f.text()); if (!Array.isArray(n.coffees) || !Array.isArray(n.beans)) throw 0; }
  catch (er) { msg.textContent = 'Die Datei ist keine Sicherung aus dem Kaffeetagebuch.'; return; }
  const again = settings().imported ? ' Achtung: Du hast schon einmal importiert, dann gibt es alles doppelt.' : '';
  if (!confirm(`Übernommen werden ${n.beans.length} Packungen und ${n.coffees.length} Kaffees, sichtbar für alle.${again} Weiter?`)) return;
  msg.textContent = 'Übernehme Daten …';
  try {
    // eigene Einstellungen aus der alten App übernehmen
    const s = settings();
    if (Array.isArray(n.methods) && n.methods.length) s.methods = n.methods.map(m => ({ id: m.id, name: m.name, type: TYPES[m.type] ? m.type : 'other', ...(m.archived ? { archived: true } : {}) }));
    if (n.grinder && Array.isArray(n.grinder.marks)) s.marks = n.grinder.marks.map(m => ({ v: +m.v, l: m.l }));
    const methods = new Map((n.methods || []).map(m => [m.id, m]));
    const idMap = new Map();
    let i = 0;
    for (const b of n.beans) {
      msg.textContent = `Packung ${++i} von ${n.beans.length} …`;
      const row = {
        name: String(b.name || 'Ohne Namen').slice(0, 120), roaster: b.roaster || '', kind: b.kind === 'super' ? 'super' : 'roaster', place: b.place || '',
        price: +b.price || null, weight: Math.round(+b.weight) || null, bought: b.bought || null, roast: b.roast || null, origin: b.origin || '',
        color: b.color || null, created_at: b.ts ? new Date(b.ts).toISOString() : undefined
      };
      const { data, error } = await sb.from('beans').insert(row).select('id').single();
      if (error) throw error;
      idMap.set(b.id, data.id);
      if (typeof b.photo === 'string' && b.photo.startsWith('data:')) {
        try {
          const blob = await (await fetch(b.photo)).blob();
          const path = await uploadPhoto(data.id, blob, null);
          await sb.from('beans').update({ photo_path: path }).eq('id', data.id);
        } catch (er) { /* Foto übersprungen */ }
      }
    }
    const rows = n.coffees.filter(c => idMap.has(c.beanId)).map(c => {
      const m = methods.get(c.methodId) || { name: 'Kaffee', type: 'other' };
      const t = TYPES[m.type] ? m.type : 'other';
      return {
        bean_id: idMap.get(c.beanId), method_type: t, method_name: m.name, has_recipe: true,
        dose: c.dose ?? null, grind: c.grind ?? null, pours: c.pours ?? null, brew_time: c.time ?? null, yield: c.yield ?? null, shot: c.shot ?? null,
        milk: c.milk ?? null, water: c.water ?? null, stars: c.stars || null,
        acid: c.acid ?? null, sweet: c.sweet ?? null, bitter: c.bitter ?? null, brewed_at: new Date(c.ts || Date.now()).toISOString()
      };
    });
    for (let k = 0; k < rows.length; k += 200) {
      msg.textContent = `Kaffees ${Math.min(k + 200, rows.length)} von ${rows.length} …`;
      const { error } = await sb.from('brews').insert(rows.slice(k, k + 200));
      if (error) throw error;
    }
    s.imported = isoDay(Date.now());
    await saveSettings();
    await refresh(); renderMe();
    $('#importMsg').textContent = `Fertig: ${n.beans.length} Packungen und ${rows.length} Kaffees übernommen.`;
  } catch (er) {
    msg.textContent = 'Der Import ist unterwegs abgebrochen. Bereits übernommene Einträge bleiben erhalten.';
    await refresh();
  }
}

/* ================= Klicks quer durch die App ================= */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const id = a.dataset.id;
  switch (a.dataset.act) {
    case 'close': closeLayer(); break;
    case 'bean': openBean(id); break;
    case 'brew': openBrew(id); break;
    case 'bean-from-brew':
      if ($('#beanPanel').classList.contains('open') && S.openBean === id) closeLayer(); else openBean(id);
      break;
    case 'rate': openBrewForm({ beanId: id }); break;
    case 'again': openBrewForm({ templateId: id }); break;
    case 'edit-brew': openBrewForm({ editId: id }); break;
    case 'edit-bean': openBeanForm(id); break;
    case 'new-brew': closeLayer().then(() => openBrewForm()); break;
    case 'new-bean': if (stack.includes($('#actSheet'))) closeLayer().then(() => openBeanForm(null)); else openBeanForm(null); break;
  }
});
$('#fab').onclick = () => { openLayer($('#actSheet')); buzz(6); };

// beim Zurückkehren in die App frische Daten holen
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && S.me && Date.now() - S.loadedAt > 20000) refresh();
});

/* ================= Start ================= */
(async () => {
  try { S.email = localStorage.getItem('kt.email') || ''; } catch (e) {}
  if (S.email) { $('#inEmail').value = S.email; $('#sentTo').textContent = S.email; }
  const { data: { session } } = await sb.auth.getSession();
  sb.auth.onAuthStateChange((ev, s) => {
    if (s && (ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION') && !S.me) {
      S.uid = s.user.id; S.email = s.user.email || S.email;
      setTimeout(enter, 0);
    }
    if (ev === 'SIGNED_OUT') { S.me = null; showGate('fEmail'); }
  });
  if (!session) showGate('fEmail');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
