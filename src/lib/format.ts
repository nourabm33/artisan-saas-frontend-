const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const dateFmt = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeZone: 'Europe/Rome' });
const dateTimeFmt = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Rome',
});
const timeFmt = new Intl.DateTimeFormat('it-IT', { timeStyle: 'short', timeZone: 'Europe/Rome' });

export const formatEur = (value: number) => eur.format(value);
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

/** Converts an ISO instant to the value expected by <input type="datetime-local"> (browser-local). */
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const shortId = (id: string) => id.slice(0, 8).toUpperCase();

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Si è verificato un errore';
}
