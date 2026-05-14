/**
 * Normalizes any date string from an imported resume into the format
 * expected by MonthYearPicker: "Month-Year" | "Present" | ""
 */

const MONTH_MAP: Record<string, string> = {
  jan: 'January', feb: 'February', mar: 'March', apr: 'April',
  may: 'May', jun: 'June', jul: 'July', aug: 'August',
  sep: 'September', oct: 'October', nov: 'November', dec: 'December',
  january: 'January', february: 'February', march: 'March', april: 'April',
  june: 'June', july: 'July', august: 'August', september: 'September',
  october: 'October', november: 'November', december: 'December',
};

const MONTH_PATTERN =
  /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/gi;

function toFullMonth(abbr: string): string {
  return MONTH_MAP[abbr.toLowerCase()] ?? '';
}

export function normalizeSingleDate(raw: string = ''): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^present$/i.test(s)) return 'Present';

  const already = s.match(/^([A-Za-z]+)-(\d{4})$/);
  if (already) {
    const m = toFullMonth(already[1]);
    return m ? `${m}-${already[2]}` : s;
  }

  const monthYear = s.match(/^([A-Za-z]+)[\s,.-]+(\d{4})$/);
  if (monthYear) {
    const m = toFullMonth(monthYear[1]);
    if (m) return `${m}-${monthYear[2]}`;
  }

  if (/^\d{4}$/.test(s)) return s;

  return '';
}

export function normalizeDatePair(
  startRaw: string = '',
  endRaw: string = '',
): { startDate: string; endDate: string } {
  const combined = `${startRaw} ${endRaw}`.trim();
  const cleaned = combined.replace(/–/g, '-').replace(/—/g, '-');
  const isPresent = /present/i.test(cleaned);

  const years = (cleaned.match(/\b(19|20)\d{2}\b/g) ?? []) as string[];
  const monthMatches = (cleaned.match(MONTH_PATTERN) ?? []) as string[];

  let startDate = '';
  let endDate = '';

  if (monthMatches.length >= 2 && years.length >= 2) {
    startDate = `${toFullMonth(monthMatches[0]!)}-${years[0]!}`;
    endDate = isPresent ? 'Present' : `${toFullMonth(monthMatches[1]!)}-${years[1]!}`;
  } else if (monthMatches.length >= 1 && years.length >= 1) {
    startDate = `${toFullMonth(monthMatches[0]!)}-${years[0]!}`;
    endDate = isPresent ? 'Present' : (years[1] ?? '');
  } else if (years.length >= 2) {
    let sy = years[0]!;
    let ey = years[1]!;
    // Reverse chronology fix — treat second year as invalid extraction
    if (Number(ey) < Number(sy)) {
      ey = '';
    }
    // Duplicate years
    if (sy === ey) {
      ey = '';
    }
    startDate = sy;
    endDate = isPresent ? 'Present' : ey;
  } else if (years.length === 1) {
    startDate = years[0]!;
    endDate = isPresent ? 'Present' : '';
  } else {
    startDate = normalizeSingleDate(startRaw);
    endDate = isPresent ? 'Present' : normalizeSingleDate(endRaw);
  }

  // Final guard: never store reversed or duplicate dates
  if (endDate && endDate !== 'Present') {
    const sy = startDate.match(/\b(19|20)\d{2}\b/)?.[0];
    const ey = endDate.match(/\b(19|20)\d{2}\b/)?.[0];
    if (sy && ey && Number(ey) < Number(sy)) endDate = '';
    if (startDate === endDate) endDate = '';
  }

  return { startDate, endDate };
}
