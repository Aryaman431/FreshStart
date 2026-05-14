/**
 * Normalizes any date string from an imported resume into the format
 * expected by MonthYearPicker: "Month-Year" | "Present" | ""
 *
 * Handles inputs like:
 *   "Jan 2023", "January 2023", "2023", "2021 -- Present",
 *   "Jan 2021 - Dec 2023", "2021-2023", "Present"
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

/** Convert a single raw date token to "Month-Year" | "Present" | "" */
export function normalizeSingleDate(raw: string = ''): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^present$/i.test(s)) return 'Present';

  // Already "Month-Year"
  const already = s.match(/^([A-Za-z]+)-(\d{4})$/);
  if (already) {
    const m = toFullMonth(already[1]);
    return m ? `${m}-${already[2]}` : s;
  }

  // "Month YYYY"
  const monthYear = s.match(/^([A-Za-z]+)[\s,.-]+(\d{4})$/);
  if (monthYear) {
    const m = toFullMonth(monthYear[1]);
    if (m) return `${m}-${monthYear[2]}`;
  }

  // Year only — store as plain "2023" (MonthYearPicker handles year-only correctly)
  if (/^\d{4}$/.test(s)) return s;

  return '';
}

/**
 * Normalize a start+end date pair.
 * Handles combined strings (Gemini sometimes puts both in one field).
 * Returns { startDate, endDate } in MonthYearPicker format.
 */
export function normalizeDatePair(
  startRaw: string = '',
  endRaw: string = '',
): { startDate: string; endDate: string } {
  const combined = `${startRaw} ${endRaw}`.trim();
  const isPresent = /present/i.test(combined);

  const years = (combined.match(/\b(19|20)\d{2}\b/g) ?? []) as string[];
  const monthMatches = (combined.match(MONTH_PATTERN) ?? []) as string[];

  let startDate = '';
  let endDate = '';

  if (monthMatches.length >= 2 && years.length >= 2) {
    startDate = `${toFullMonth(monthMatches[0]!)}-${years[0]!}`;
    endDate = isPresent ? 'Present' : `${toFullMonth(monthMatches[1]!)}-${years[1]!}`;
  } else if (monthMatches.length >= 1 && years.length >= 1) {
    startDate = `${toFullMonth(monthMatches[0]!)}-${years[0]!}`;
    endDate = isPresent ? 'Present' : (years[1] ?? '');
  } else if (years.length >= 2) {
    const y0 = years[0]!;
    const y1 = years[1]!;
    const lo = Number(y0) <= Number(y1) ? y0 : y1;
    const hi = Number(y0) <= Number(y1) ? y1 : y0;
    startDate = lo;
    endDate = isPresent ? 'Present' : hi;
  } else if (years.length === 1) {
    startDate = years[0]!;
    endDate = isPresent ? 'Present' : '';
  } else {
    // Last resort — normalize each individually
    startDate = normalizeSingleDate(startRaw);
    endDate = isPresent ? 'Present' : normalizeSingleDate(endRaw);
  }

  // Prevent duplicate start === end (unless Present)
  if (startDate && endDate && startDate === endDate && endDate !== 'Present') {
    endDate = '';
  }

  // Prevent reversed chronology (end year < start year)
  if (endDate && endDate !== 'Present') {
    const sy = startDate.match(/\b(19|20)\d{2}\b/)?.[0];
    const ey = endDate.match(/\b(19|20)\d{2}\b/)?.[0];
    if (sy && ey && Number(ey) < Number(sy)) {
      endDate = '';
    }
  }

  return { startDate, endDate };
}
