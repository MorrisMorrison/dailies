// The Edit dialog: switch dailies on and off, add your own with a name and an icon, remove them again.
// The dialog frame lives in index.html; this module renders the list inside it.
import { $, esc } from './html.js';
import { ICONS, DEFAULT_ICON, icon } from './icons.js';
import { MAX_CUSTOM, MAX_LABEL, cleanLabel } from './dailies.js';
import * as store from './store.js';

const dialog = $('editor');
const list = $('editor-list');
let pickedIcon = DEFAULT_ICON;

const REMOVE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

function row(daily) {
  const checked = store.isEnabled(daily.id) ? ' checked' : '';
  const hint = daily.hint ? `<small>${esc(daily.hint)}</small>` : '';
  const remove = daily.custom
    ? `<button type="button" class="editor-remove" data-remove="${daily.id}" aria-label="Remove ${esc(daily.label)}">${REMOVE_ICON}</button>`
    : '';
  return `<li class="editor-row">
    <label class="editor-pick"><input type="checkbox" value="${daily.id}"${checked}>${icon(daily.icon)}
      <span><strong>${esc(daily.label)}</strong>${hint}</span></label>${remove}
  </li>`;
}

function addForm() {
  if (store.customCount() >= MAX_CUSTOM) {
    return `<li class="editor-add"><h3>Add your own</h3><small>You have ${MAX_CUSTOM} of your own. Remove one to add another.</small></li>`;
  }
  const choices = Object.entries(ICONS).map(([name, { label }]) => {
    const checked = name === pickedIcon ? ' checked' : '';
    return `<label title="${label}"><input type="radio" name="editor-icon" value="${name}" aria-label="${label}"${checked}>${icon(name)}</label>`;
  });
  return `<li class="editor-add">
    <h3>Add your own</h3>
    <input class="editor-name" id="editor-name" type="text" maxlength="${MAX_LABEL}" placeholder="e.g. Water the plants" aria-label="Name of your daily" autocomplete="off">
    <fieldset class="editor-icons"><legend>Icon</legend>${choices.join('')}</fieldset>
    <div class="editor-add-row"><small>Stays on this device.</small><button type="button" class="button button-primary" data-add disabled>Add</button></div>
  </li>`;
}

/** Redraws the list, keeping the scroll position, or jumping to the add form after adding one. */
function render({ afterAdd = false } = {}) {
  const scroll = list.scrollTop;
  list.innerHTML = store.allDailies().map(row).join('') + addForm();
  list.scrollTop = afterAdd ? list.scrollHeight : scroll;
  if (afterAdd) $('editor-name')?.focus();
}

function add() {
  const name = $('editor-name');
  if (name && store.addCustom(name.value, pickedIcon)) render({ afterAdd: true });
}

list.addEventListener('change', (event) => {
  const input = event.target;
  if (input.name === 'editor-icon') {
    pickedIcon = input.value;
    return;
  }
  if (input.type !== 'checkbox') return;
  const enabled = [...list.querySelectorAll('.editor-pick input:checked')].map((box) => box.value);
  if (enabled.length) store.setEnabled(enabled);
  else input.checked = true; // keep at least one switched on
});

list.addEventListener('input', (event) => {
  if (event.target.id === 'editor-name') list.querySelector('[data-add]').disabled = !cleanLabel(event.target.value);
});

list.addEventListener('keydown', (event) => {
  // Enter in the name field would otherwise submit the dialog form and close it.
  if (event.key === 'Enter' && event.target.id === 'editor-name') {
    event.preventDefault();
    add();
  }
});

list.addEventListener('click', (event) => {
  if (event.target.closest('[data-add]')) return add();
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    store.removeCustom(remove.dataset.remove);
    render();
  }
});

$('editor-reset').addEventListener('click', () => {
  store.resetEnabled();
  render();
});

// A click on the backdrop lands on the dialog element itself.
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

export function openEditor() {
  render();
  list.scrollTop = 0;
  dialog.showModal();
  dialog.focus(); // otherwise the browser focuses the scrollable list and draws a ring around it
}
