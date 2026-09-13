'use client';

import { api } from '@/lib/api';
import { useFetch } from './useFetch';
import type { Appointment, AppointmentStatus } from '@/types';

export function useAppointments(status?: AppointmentStatus, limit = 100) {
  const state = useFetch(() => api.appointments.list({ status, limit }), [status, limit]);
  const appointments: Appointment[] = state.data?.appointments ?? [];
  return { ...state, appointments };
}
