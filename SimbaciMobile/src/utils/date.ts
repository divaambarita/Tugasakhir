const DEFAULT_TZ = 'Asia/Jakarta';

function pad2(n: string): string {
  return n.length === 1 ? `0${n}` : n;
}

export function toYmdInTimeZone(
  date: Date,
  timeZone: string = DEFAULT_TZ,
): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;

  if (!year || !month || !day) {
    const fallback = formatter.format(date);
    return String(fallback);
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function todayYmdJakarta(): string {
  return toYmdInTimeZone(new Date(), DEFAULT_TZ);
}

export function isoToJakartaYmd(input: string): string {
  const s = String(input ?? '').trim();
  if (!s) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    return s;
  }

  return toYmdInTimeZone(d, DEFAULT_TZ);
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatYmdIndonesian(input: string): string {
  const match = String(input ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return String(input ?? '-');
  }

  const monthIndex = Number(match[2]) - 1;
  const month = MONTH_NAMES_ID[monthIndex];
  if (!month) {
    return String(input);
  }

  return `${Number(match[3])} ${month} ${match[1]}`;
}
