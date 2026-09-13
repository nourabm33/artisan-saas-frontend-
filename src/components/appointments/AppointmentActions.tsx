'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TRANSITIONS } from '@/lib/constants';
import { errorMessage, toDateTimeLocal } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Appointment, AppointmentStatus } from '@/types';

const VARIANT: Partial<Record<AppointmentStatus, 'primary' | 'success' | 'danger' | 'secondary'>> = {
  confirmed: 'primary',
  in_progress: 'secondary',
  completed: 'success',
  cancelled: 'danger',
};

export function AppointmentActions({
  appointment,
  onChange,
  compact = false,
}: {
  appointment: Appointment;
  onChange: (a: Appointment) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState<AppointmentStatus | 'reschedule' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(toDateTimeLocal(appointment.scheduledStart));
  const [end, setEnd] = useState(toDateTimeLocal(appointment.scheduledEnd));

  const transitions = APPOINTMENT_TRANSITIONS[appointment.status];
  const closed = transitions.length === 0;

  const setStatus = async (status: AppointmentStatus) => {
    setError(null);
    setBusy(status);
    try {
      const { appointment: updated } = await api.appointments.updateStatus(appointment.id, status);
      onChange(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const reschedule = async () => {
    setError(null);
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return setError('Date non valide');
    if (e <= s) return setError("La fine deve essere successiva all'inizio");
    setBusy('reschedule');
    try {
      const { appointment: updated } = await api.appointments.reschedule(appointment.id, {
        scheduledStart: s.toISOString(),
        scheduledEnd: e.toISOString(),
      });
      onChange(updated);
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={compact ? 'flex flex-wrap items-center gap-2' : 'space-y-3'}>
      <div className="flex flex-wrap gap-2">
        {transitions.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={VARIANT[status] ?? 'secondary'}
            loading={busy === status}
            disabled={busy !== null}
            onClick={() => void setStatus(status)}
          >
            {APPOINTMENT_STATUS_LABELS[status]}
          </Button>
        ))}
        {!closed && (
          <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => setOpen(true)}>
            Riprogramma
          </Button>
        )}
      </div>
      {error && !open && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Modal
        open={open}
        title="Riprogramma appuntamento"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button loading={busy === 'reschedule'} onClick={() => void reschedule()}>
              Salva
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Inizio"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <Input label="Fine" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
