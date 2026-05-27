/**
 * Formats a YYYY-MM-DD date string into a human-readable format, e.g. "May 27, 2026"
 */
export function formatDateString(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  
  try {
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    
    const date = new Date(year, monthIndex, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Sorts an array of YYYY-MM-DD strings chronologically.
 */
export function sortDatesChronologically(dates: string[]): string[] {
  return [...dates].sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
}

/**
 * Generates available daily date strings (YYYY-MM-DD) for a given month ID (MM-YY).
 * By default, generates the last 3 days of the month (or up to today if it is the current month)
 * to align with daily content availability.
 */
export function generateDatesForMonth(monthId: string): string[] {
  if (!monthId || !monthId.includes('-')) return [];
  const [monthStr, yearStr] = monthId.split('-');
  const month = parseInt(monthStr, 10);
  const year = 2000 + parseInt(yearStr, 10);
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYearShort = String(now.getFullYear()).slice(-2);
  const currentMonthId = `${String(currentMonth).padStart(2, '0')}-${currentYearShort}`;
  
  const totalDays = new Date(year, month, 0).getDate();
  const maxDay = (monthId === currentMonthId) ? now.getDate() : totalDays;
  
  const dates: string[] = [];
  const startDay = Math.max(1, maxDay - 2); // default to trailing 3 days (e.g. 25, 26, 27)
  
  for (let d = startDay; d <= maxDay; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStrPadded = String(month).padStart(2, '0');
    dates.push(`${year}-${monthStrPadded}-${dayStr}`);
  }
  return dates;
}
