import type { AppointmentStatus, QuoteStatus, RequestStatus } from '@/types';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Artisan SaaS';
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
} as const;

export const TRADE_TYPES = [
  { value: 'gommista', label: 'Gommista (pneumatici)' },
  { value: 'idraulico', label: 'Idraulico' },
  { value: 'elettricista', label: 'Elettricista' },
  { value: 'meccanico', label: 'Meccanico' },
  { value: 'altro', label: 'Altro' },
] as const;

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: 'Ricevuta',
  quoted: 'Preventivo inviato',
  accepted: 'Accettata',
  in_progress: 'In lavorazione',
  completed: 'Completata',
  rejected: 'Rifiutata',
  cancelled: 'Annullata',
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Bozza',
  sent: 'Inviato',
  accepted: 'Accettato',
  rejected: 'Rifiutato',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Da confermare',
  confirmed: 'Confermato',
  in_progress: 'In corso',
  completed: 'Completato',
  cancelled: 'Annullato',
};

export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'in_progress', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Richieste', href: '/dashboard/requests' },
  { label: 'Appuntamenti', href: '/dashboard/appointments' },
  { label: 'Clienti', href: '/dashboard/clients' },
  { label: 'Analisi', href: '/dashboard/analytics' },
] as const;
