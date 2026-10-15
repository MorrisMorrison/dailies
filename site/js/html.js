// Small helpers for building markup with template strings.

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes text so it can be placed inside HTML safely. Use it for anything a person typed. */
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** Shorthand for getElementById. */
export const $ = (id) => document.getElementById(id);
