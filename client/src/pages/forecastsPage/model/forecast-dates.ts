export const formatForecastDate = (date: string): string => {
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
};

export const getForecastDates = (lastHistoryDate: string | null, count: number): string[] => {
  const startDate = lastHistoryDate
    ? new Date(`${lastHistoryDate}T00:00:00Z`)
    : new Date();
  if (!Number.isFinite(startDate.getTime())) return [];

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + index + 1);
    return date.toISOString().slice(0, 10);
  });
};
