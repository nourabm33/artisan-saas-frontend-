'use client';

import { useMemo } from 'react';
import { api } from '@/lib/api';
import { useFetch } from './useFetch';
import type { ServiceTemplate } from '@/types';

export function useServiceTemplates() {
  const state = useFetch(() => api.serviceTemplates.list(), []);
  const services = useMemo<ServiceTemplate[]>(() => state.data?.services ?? [], [state.data]);
  const byId = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  return { ...state, services, byId };
}
