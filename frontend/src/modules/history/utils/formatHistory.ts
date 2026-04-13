const RU_DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const RU_TIME_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function safeParseDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatHistoryDate(value: string): string {
  const date = safeParseDate(value);
  return date ? RU_DATE_FORMATTER.format(date) : value;
}

export function formatHistoryTimeRange(start: string, end: string): string {
  const startDate = safeParseDate(start);
  const endDate = safeParseDate(end);

  if (!startDate || !endDate) {
    return `${start} - ${end}`;
  }

  return `${RU_TIME_FORMATTER.format(startDate)} - ${RU_TIME_FORMATTER.format(endDate)}`;
}
