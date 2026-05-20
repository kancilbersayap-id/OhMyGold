/**
 * Shared formatting utilities for Indonesian locale display.
 * Use these instead of writing inline formatters in components.
 */

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/** "Rp 1.234.567" */
export const formatRp = (num) =>
  `Rp ${parseInt(num).toLocaleString('id-ID')}`;

/** "1.234.567" */
export const formatInt = (num) =>
  parseInt(num).toLocaleString('id-ID');

/** "15 Apr" */
export const toShortDay = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};

/** "15 Apr 2026" */
export const toFullLabelWithYear = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

/** "Apr" from "2026-04-15" */
export const toMonthLabel = (dateStr) =>
  MONTH_NAMES[new Date(dateStr + 'T00:00:00').getMonth()];

/** "15" from "2026-04-15" */
export const toShortDayNum = (dateStr) =>
  String(new Date(dateStr + 'T00:00:00').getDate());

/** "2026-04" → "Apr" */
export const yearMonthToMonthLabel = (yearMonth) => {
  const [, m] = yearMonth.split('-');
  return MONTH_NAMES[parseInt(m) - 1];
};
