import './style.css';
import { CATEGORIES, MEMBERS, type Category } from './players';
import { createTeams, type Player, type TeamId, type Teams } from './teams';

const STORAGE_KEY = 'escc-players-v1';
const STEPS = ['Players', 'Categories', 'Starters', 'Teams'];

function load(): Player[] {
  const saved: Player[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  const byName = new Map(saved.map(p => [p.name, p]));
  const members = MEMBERS.map(m => ({ category: m.category, playing: true, lock: null, ...byName.get(m.name), name: m.name }));
  const guests = saved.filter(p => p.guest);
  return [...members, ...guests];
}

let players: Player[] = load();
let teams: Teams | null = null;
let step = 0;

const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
const playing = () => players.filter(p => p.playing);
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.append(...children);
  return node;
}

// Row of toggle buttons — easier to tap on a phone than a <select>.
function segmented<T extends string>(options: { value: T; label: string }[], value: T, onChange: (v: T) => void) {
  const group = el('div', { className: 'segmented' });
  for (const o of options) {
    const b = el('button', { type: 'button', textContent: o.label, className: o.value === value ? 'on' : '' });
    b.dataset.value = o.value;
    b.onclick = () => {
      group.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      onChange(o.value);
    };
    group.append(b);
  }
  return group;
}

function renderAttendance() {
  $('attendance').replaceChildren(...players.map((p, i) => {
    const chip = el('button', { type: 'button', className: `chip ${p.playing ? 'on' : ''}` }, p.name);
    chip.onclick = () => { p.playing = !p.playing; save(); renderAttendance(); };
    if (p.guest) {
      const remove = el('span', { className: 'x', textContent: '✕', title: 'Remove guest' });
      remove.onclick = e => { e.stopPropagation(); players.splice(i, 1); save(); renderAttendance(); };
      chip.append(remove);
    }
    return chip;
  }));
  $('count').textContent = `${playing().length} of ${players.length} selected`;
}

function renderSummary() {
  $('summary').textContent = CATEGORIES.map(c => `${c.label}: ${playing().filter(p => p.category === c.id).length}`).join(' · ');
}

function renderCategories() {
  const options = CATEGORIES.map(c => ({ value: c.id, label: c.short }));
  $('categories').replaceChildren(...playing().map(p =>
    el('li', {}, el('span', { className: 'pname', textContent: p.name }),
      segmented<Category>(options, p.category, v => { p.category = v; save(); renderSummary(); })),
  ));
  renderSummary();
}

function renderLocks() {
  const options: { value: '' | TeamId; label: string }[] = [{ value: '', label: 'Random' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }];
  $('locks').replaceChildren(...playing().map(p =>
    el('li', {}, el('span', { className: 'pname', textContent: p.name }),
      segmented(options, p.lock ?? '', v => { p.lock = v || null; save(); })),
  ));
}

function renderTeams() {
  if (!teams) return;
  for (const id of ['A', 'B'] as const) {
    const team = teams[id];
    $(`title${id}`).textContent = `Team ${id} (${team.length})`;
    $(`team${id}`).replaceChildren(...team.map(p =>
      el('li', {}, p.name, el('span', { className: `tag ${p.category}`, textContent: CATEGORIES.find(c => c.id === p.category)!.short })),
    ));
  }
  $('toss').textContent = `🪙 Toss: Team ${teams.battingFirst} bats first`;
}

function goTo(next: number) {
  if (next > 0 && playing().length < 2) { alert('Select at least 2 players.'); return; }
  step = next;
  if (step === 1) renderCategories();
  if (step === 2) renderLocks();
  if (step === 3) { teams = createTeams(players); renderTeams(); }

  document.querySelectorAll<HTMLElement>('.step').forEach(s => (s.hidden = Number(s.dataset.step) !== step));
  $('progress').replaceChildren(...STEPS.map((label, i) =>
    el('li', { className: i < step ? 'done' : i === step ? 'current' : '' }, label)));

  $('backBtn').style.visibility = step === 0 ? 'hidden' : 'visible';
  $('nextBtn').textContent = step === 2 ? 'Create Teams' : step === 3 ? 'Start over' : 'Next';
  window.scrollTo({ top: 0 });
}

function teamsText(t: Teams) {
  const list = (ps: Player[]) => ps.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
  return `🏏 East Side Cricket Club\n\nTeam A:\n${list(t.A)}\n\nTeam B:\n${list(t.B)}\n\nTeam ${t.battingFirst} bats first.`;
}

$<HTMLFormElement>('guestForm').onsubmit = e => {
  e.preventDefault();
  const input = $<HTMLInputElement>('guestName');
  const name = input.value.trim();
  if (!name) return;
  if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) { alert(`${name} is already in the list.`); return; }
  players.push({ name, category: 'allrounder', playing: true, lock: null, guest: true });
  save(); renderAttendance();
  input.value = '';
};

$('allBtn').onclick = () => { players.forEach(p => (p.playing = true)); save(); renderAttendance(); };
$('noneBtn').onclick = () => { players.forEach(p => (p.playing = false)); save(); renderAttendance(); };
$('clearLocksBtn').onclick = () => { players.forEach(p => (p.lock = null)); save(); renderLocks(); };
$('backBtn').onclick = () => goTo(step - 1);
$('nextBtn').onclick = () => goTo(step === 3 ? 0 : step + 1);
$('reshuffleBtn').onclick = () => { teams = createTeams(players); renderTeams(); };

$('shareBtn').onclick = async () => {
  if (!teams) return;
  const text = teamsText(teams);
  if (navigator.share) {
    try { await navigator.share({ text }); } catch { /* user cancelled */ }
  } else {
    await navigator.clipboard.writeText(text);
    alert('Teams copied — paste into WhatsApp.');
  }
};

renderAttendance();
goTo(0);
