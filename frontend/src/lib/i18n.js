import { get } from 'svelte/store';
import { register, init, locale, _ } from 'svelte-i18n';

register('de', () => import('./locales/de.json'));
register('en', () => import('./locales/en.json'));

let _initialized = false;

export function setupI18n(lang = 'de') {
  if (_initialized) {
    locale.set(lang);
    return;
  }
  _initialized = true;
  init({ fallbackLocale: 'de', initialLocale: lang });
}

/** Translate in script context (non-reactive). */
export function t(key, values) {
  return get(_)(key, values ? { values } : undefined);
}

export { locale };
