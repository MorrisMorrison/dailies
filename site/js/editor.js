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
  return `<li class="editor-row" data-id="${daily.id}">
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
  // Add sits next to the name, with the icons below, so it is never right above Done (#19).
  return `<li class="editor-add">
    <h3>Add your own</h3>
    <div class="editor-add-name">
      <input class="editor-name" id="editor-name" type="text" maxlength="${MAX_LABEL}" placeholder="e.g. Stretch" aria-label="Name of your daily" autocomplete="off">
      <button type="button" class="button button-primary" data-add disabled>Add</button>
    </div>
    <fieldset class="editor-icons"><legend>Icon</legend>${choices.join('')}</fieldset>
    <small>Stays on this device.</small>
  </li>`;
}

/** Redraws the list, keeping the scroll position. */
function render() {
  const scroll = list.scrollTop;
  list.innerHTML = store.allDailies().map(row).join('') + addForm();
  list.scrollTop = scroll;
}

const ADDED_FOR = 1600; // ms the confirmation stays up
let addedTimer;

// Confirms an add where the eye already is (#17): the button says "Added ✓", the new row lights up
// briefly, and screen readers hear it. The name field is empty again and keeps focus for the next one.
function confirmAdded(id, label) {
  const newRow = list.querySelector(`.editor-row[data-id="${id}"]`);
  const button = list.querySelector('[data-add]');
  const name = $('editor-name');
  name?.focus({ preventScroll: true });
  if (newRow) {
    newRow.classList.add('is-new');
    // Bring the new row into view, with the form still visible below it.
    const offset = newRow.getBoundingClientRect().top - list.getBoundingClientRect().top;
    list.scrollTop += offset - list.clientHeight / 3;
  }
  if (button) {
    button.textContent = 'Added ✓';
    button.disabled = false; // full colour while confirming; add() ignores an empty name anyway
    clearTimeout(addedTimer);
    addedTimer = setTimeout(() => {
      if (!button.isConnected) return;
      button.textContent = 'Add';
      button.disabled = !cleanLabel(name?.value);
    }, ADDED_FOR);
  }
  $('editor-live').textContent = `${label} added.`;
}

function add() {
  const name = $('editor-name');
  if (!name) return;
  const label = cleanLabel(name.value);
  const id = store.addCustom(label, pickedIcon);
  if (!id) return;
  render();
  confirmAdded(id, label);
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
  if (event.target.id !== 'editor-name') return;
  const button = list.querySelector('[data-add]');
  button.textContent = 'Add'; // typing the next name ends the "Added ✓" confirmation
  button.disabled = !cleanLabel(event.target.value);
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
