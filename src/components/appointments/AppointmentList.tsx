'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { Card } from '@/components/ui/Card';
import { AppointmentStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { APPOINTMENT_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatTime, shortId } from '@/lib/format';
import { AppointmentActions } from './AppointmentActions';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_OPTIONS = Object.entries(APPOINTMENT_STATUS_LABELS) as [AppointmentStatus, string][];

export function AppointmentList() {
  const [status, setStatus] = useState<AppointmentStatus | ''>('');
  const { appointments, loading, error, refetch, data } = useAppointments(status || undefined);
  const [overrides, setOverrides] = useState<Record<string, Appointment>>({});

  const rows = appointments.map((a) => overrides[a.id] ?? a);
  const grouped = rows.reduce<Record<string, Appointment[]>>((acc, a) => {
    const day = formatDate(a.scheduledStart);
    (acc[day] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-56">
          <Select
            label="Stato"
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus | '')}
          >
            <option value="">Tutti</option>
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        {data && <p className="text-sm text-gray-500">{rows.length} appuntamenti</p>}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} onRetry={refetch} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title="Nessun appuntamento"
          description="Gli appuntamenti vengono creati automaticamente quando un cliente accetta un preventivo."
        />
      )}

      {Object.entries(grouped).map(([day, items]) => (
        <Card key={day} title={day}>
          <ul className="divide-y divide-gray-100">
            {items.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                <div className="min-w-[10rem]">
                  <p className="font-semibold text-gray-900">
                    {formatTime(a.scheduledStart)} – {formatTime(a.scheduledEnd)}
                  </p>
                  <Link
                    href={`/dashboard/requests/${a.requestId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Richiesta #{shortId(a.requestId)}
                  </Link>
                </div>
                <AppointmentStatusBadge status={a.status} />
                <AppointmentActions
                  compact
                  appointment={a}
                  onChange={(updated) => setOverrides((o) => ({ ...o, [updated.id]: updated }))}
                />
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
