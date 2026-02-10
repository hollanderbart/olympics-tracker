const DUTCH_DAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const DUTCH_MONTHS = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${DUTCH_DAYS[d.getDay()]} ${d.getDate()} ${DUTCH_MONTHS[d.getMonth()]}`;
}

export function getCountdown(dateStr: string, timeStr: string): string | null {
  const target = new Date(`${dateStr}T${timeStr}:00+01:00`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  if (days > 0) return `${days}d ${hrs}u ${mins}m`;
  if (hrs > 0) return `${hrs}u ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export function isToday(dateStr: string): boolean {
  const now = new Date();
  const d = new Date(dateStr + "T00:00:00");
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}
