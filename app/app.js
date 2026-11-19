// Leonida Ledger — GTA VI trophy guide & tracker.
// Loads app/data/trophies.json, renders the checklist, roadmap and guide pane,
// and keeps earned trophies in localStorage with export / import.
// Everything runs offline: the only fetch is the local trophies.json file.
const STORE_KEY = 'gta6-trophy-guide-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

const listEl = document.getElementById('trophyList');
const detailBody = document.getElementById('detailBody');
const roadmapSteps = document.getElementById('roadmapSteps');
const earnedCountEl = document.getElementById('earnedCount');
const progressFill = document.getElementById('progressFill');
const gradeCountsEl = document.getElementById('gradeCounts');
const filterStatus = document.getElementById('filterStatus');
const emptyNote = document.getElementById('emptyNote');
const searchInput = document.getElementById('search');
const kindFilter = document.getElementById('kindFilter');
const gradeFilter = document.getElementById('gradeFilter');
const earnedOnlyBox = document.getElementById('earnedOnly');
const spoilerBox = document.getElementById('spoilerSafe');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceIndex = doc.sources || {};
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(readStoredEarned());
let selectedId = null;
let spoilerSafe = localStorage.getItem(SPOILER_KEY) === '1';
spoilerBox.checked = spoilerSafe;

function readStoredEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

function isStoryTrophy(t) {
  return t.kinds.includes('story');
}

function isHiddenFromReader(t) {
  return spoilerSafe && isStoryTrophy(t) && !earned.has(t.name);
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function sourceLinks(t) {
  return (t.src || []).map((key) => {
    const url = sourceIndex[key];
    return url ? `<a href="${url}" target="_blank" rel="noopener">${key}</a>` : key;
  }).join(' &middot; ');
}

function renderRoadmap() {
  roadmapSteps.replaceChildren();
  for (const step of doc.roadmap || []) {
    const li = document.createElement('li');
    const num = document.createElement('span');
    num.className = 'step-num';
    num.textContent = String(step.stage);
    const title = document.createElement('h3');
    title.textContent = step.title;
    const text = document.createElement('p');
    text.textContent = step.text;
    li.append(num, title, text);
    roadmapSteps.append(li);
  }
}

function renderProgress() {
  earnedCountEl.textContent = String(earned.size);
  progressFill.style.width = `${(earned.size / trophies.length) * 100}%`;
  const counts = {};
  for (const t of trophies) if (earned.has(t.name)) counts[t.grade] = (counts[t.grade] || 0) + 1;
  gradeCountsEl.textContent =
    `Earned: ${counts.platinum || 0} platinum · ${counts.gold || 0} gold · ${counts.silver || 0} silver · ${counts.bronze || 0} bronze (of 1 / 2 / 6 / 46)`;
}

function trophyMatches(t) {
  const q = searchInput.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
  if (kindFilter.value === 'missable' && !t.missable) return false;
  if (kindFilter.value !== 'all' && kindFilter.value !== 'missable' && !t.kinds.includes(kindFilter.value)) return false;
  if (gradeFilter.value !== 'all' && t.grade !== gradeFilter.value) return false;
  if (earnedOnlyBox.checked && !earned.has(t.name)) return false;
  return true;
}

function renderList() {
  listEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!trophyMatches(t)) continue;
    shown += 1;
    const li = document.createElement('li');
    li.className = 'trophy-row' + (earned.has(t.name) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveEarned();
      renderProgress();
      renderList();
      renderDetail();
    });
    const main = document.createElement('div');
    main.className = 'trophy-main';
    const name = document.createElement('div');
    name.className = 'trophy-name';
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    if (isHiddenFromReader(t)) {
      name.textContent = 'Hidden story trophy — earn it to reveal';
      name.classList.add('spoiler-mask');
      desc.textContent = 'Spoiler-safe mode hides this story trophy until you earn it.';
      desc.classList.add('spoiler-mask');
    } else {
      name.textContent = t.name;
      desc.textContent = t.description;
    }
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const grade = document.createElement('span');
    grade.className = `grade grade-${t.grade}`;
    grade.textContent = gradeLabel(t);
    meta.append(grade);
    if (t.hidden) {
      const b = document.createElement('span');
      b.className = 'badge badge-hidden';
      b.textContent = 'Hidden on PSN';
      meta.append(b);
    }
    if (t.missable) {
      const b = document.createElement('span');
      b.className = 'badge badge-missable';
      b.textContent = 'Missable';
      meta.append(b);
    }
    for (const kind of t.kinds) {
      const b = document.createElement('span');
      b.className = 'badge badge-kind';
      b.textContent = kind;
      meta.append(b);
    }
    if (t.target != null) {
      const target = document.createElement('span');
      target.textContent = `Target: ${t.target.toLocaleString('en-US')}`;
      meta.append(target);
    }
    main.append(name, desc, meta);
    li.append(box, main);
    li.addEventListener('click', (event) => {
      if (event.target === box) return;
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    listEl.append(li);
  }
  filterStatus.textContent = `Showing ${shown} of ${trophies.length} trophies`;
  emptyNote.hidden = shown !== 0;
}

function renderDetail() {
  const t = byId.get(selectedId);
  detailBody.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy to read its guide and sources.';
    detailBody.append(p);
    return;
  }
  if (isHiddenFromReader(t)) {
    const h = document.createElement('h3');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Spoiler-safe mode is on. Earn this trophy (or turn spoiler-safe off) to read its name, description and guide.';
    detailBody.append(h, p);
    return;
  }
  const h = document.createElement('h3');
  h.textContent = t.name;
  const facts = document.createElement('p');
  facts.className = 'detail-facts';
  facts.textContent = `${gradeLabel(t)}${t.hidden ? ' · Hidden on PlayStation' : ''}${t.missable ? ' · Missable — see the warning above' : ''}${t.target != null ? ` · PSN target: ${t.target.toLocaleString('en-US')}` : ''} · Roadmap stage ${t.stage}`;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = `Official description: “${t.description}”`;
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  const sources = document.createElement('p');
  sources.className = 'detail-sources';
  sources.innerHTML = `Sources: ${sourceLinks(t)}`;
  detailBody.append(h, facts, desc, guide, sources);
}

function renderAboutSources() {
  const el = document.getElementById('aboutSources');
  el.innerHTML = 'Sources used for this guide: ' + Object.entries(sourceIndex)
    .map(([key, url]) => `<a href="${url}" target="_blank" rel="noopener">${key}</a>`)
    .join(' &middot; ') + '.';
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => known.has(n)));
    saveEarned();
    renderAll();
  } catch {
    filterStatus.textContent = 'Import failed: that file is not a Leonida Ledger progress export.';
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!earned.size) return;
  earned = new Set();
  saveEarned();
  renderAll();
});

spoilerBox.addEventListener('change', () => {
  spoilerSafe = spoilerBox.checked;
  localStorage.setItem(SPOILER_KEY, spoilerSafe ? '1' : '0');
  renderList();
  renderDetail();
});

for (const el of [searchInput, kindFilter, gradeFilter, earnedOnlyBox]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}

renderRoadmap();
renderAboutSources();
renderAll();
