/**
 * i18n configuration — single source of truth for supported locales.
 *
 * The app ships Indonesian-first (`defaultLocale = 'id'`). The English
 * dictionary is kept complete so a language switcher can be added later
 * without touching every component.
 */

export const locales = ['id', 'en'];

export const defaultLocale = 'id';

/** Cookie that carries the active locale across server/client boundaries. */
export const LOCALE_COOKIE = 'locale';

export const isLocale = (value) => locales.includes(value);
