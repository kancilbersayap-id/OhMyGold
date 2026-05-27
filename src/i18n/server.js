// Server-only module: `next/headers` throws if imported into a client component.
import { cookies } from 'next/headers';
import { dictionaries } from './dictionaries';
import { defaultLocale, isLocale, LOCALE_COOKIE } from './config';
import { translate } from './translate';

/** Read the active locale from the request cookie (server components only). */
export async function getLocale() {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

/** Return the full dictionary object for the active locale. */
export async function getDictionary() {
  const locale = await getLocale();
  return dictionaries[locale] || dictionaries[defaultLocale];
}

/**
 * Return a `t(key, vars)` translator bound to the active locale.
 * Use in server components and route handlers.
 */
export async function getT() {
  const dict = await getDictionary();
  return (key, vars) => translate(dict, key, vars);
}
