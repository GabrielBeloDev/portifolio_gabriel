export const formatDate = (isoDate: string): string => isoDate.slice(0, 10);

const HUMAN_DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// Parse the date parts locally — new Date("2026-07-15") is UTC midnight and
// shifts to the previous day in UTC-negative timezones
export const formatDateHuman = (isoDate: string): string => {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return HUMAN_DATE.format(new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1));
};
