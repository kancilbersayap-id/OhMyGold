/**
 * Resolve a dot-path key (e.g. `"settings.title"`) against a dictionary.
 *
 * - Returns the raw value, so non-string nodes (arrays, objects) pass through
 *   unchanged — useful for list content like `news.articles`.
 * - Falls back to the key itself when the path is missing, which makes
 *   untranslated keys obvious in the UI rather than rendering blank.
 * - Interpolates `{placeholder}` tokens for string values when `vars` is given.
 */
export function translate(dict, key, vars) {
  const value = key
    .split('.')
    .reduce((node, part) => (node == null ? undefined : node[part]), dict);

  if (value == null) return key;

  if (typeof value === 'string' && vars) {
    return value.replace(/\{(\w+)\}/g, (match, name) =>
      vars[name] != null ? String(vars[name]) : match
    );
  }

  return value;
}
