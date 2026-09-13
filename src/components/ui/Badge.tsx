import type { ReactNode } from 'react';
import type { AppointmentStatus, QuoteStatus, RequestStatus } from '@/types';
import { APPOINTMENT_STATUS_LABELS, QUOTE_STATUS_LABELS, REQUEST_STATUS_LABELS } from '@/lib/constants';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
};

export function Badge({
  children,
  variant = 'info',
  className = '',
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

const REQUEST_VARIANTS: Record<RequestStatus, BadgeVariant> = {
  submitted: 'neutral',
  quoted: 'info',
  accepted: 'success',
  in_progress: 'purple',
  completed: 'success',
  rejected: 'danger',
  cancelled: 'danger',
};

const QUOTE_VARIANTS: Record<QuoteStatus, BadgeVariant> = {
  draft: 'neutral',
  sent: 'info',
  accepted: 'success',
  rejected: 'danger',
};

const APPOINTMENT_VARIANTS: Record<AppointmentStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'purple',
  completed: 'success',
  cancelled: 'danger',
};

export const RequestStatusBadge = ({ status }: { status: RequestStatus }) => (
  <Badge variant={REQUEST_VARIANTS[status]}>{REQUEST_STATUS_LABELS[status]}</Badge>
);

export const QuoteStatusBadge = ({ status }: { status: QuoteStatus }) => (
  <Badge variant={QUOTE_VARIANTS[status]}>{QUOTE_STATUS_LABELS[status]}</Badge>
);

export const AppointmentStatusBadge = ({ status }: { status: AppointmentStatus }) => (
  <Badge variant={APPOINTMENT_VARIANTS[status]}>{APPOINTMENT_STATUS_LABELS[status]}</Badge>
);
