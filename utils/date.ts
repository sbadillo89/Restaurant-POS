export function getUtcDayRange(date: Date = new Date()): {
  startUtc: string;
  endUtc: string;
} {
  // Offset local en minutos (ej: Colombia = 300 → -5h)
  const timezoneOffset = date.getTimezoneOffset();

  // Clonar la fecha de trabajo
  const localDate = new Date(date);

  // Inicio del día en la zona local
  localDate.setHours(0, 0, 0, 0);
  const startUtc = new Date(localDate.getTime() - timezoneOffset * 60 * 1000);

  // Fin del día en la zona local
  const localEnd = new Date(date);
  localEnd.setHours(23, 59, 59, 999);
  const endUtc = new Date(localEnd.getTime() - timezoneOffset * 60 * 1000);

  return {
    startUtc: startUtc.toISOString(),
    endUtc: endUtc.toISOString(),
  };
}
