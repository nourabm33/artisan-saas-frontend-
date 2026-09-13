'use client';

import { api } from '@/lib/api';
import { useFetch } from './useFetch';
import type { RequestStatus, ServiceRequest } from '@/types';

export function useRequests(status?: RequestStatus, limit = 100) {
  const state = useFetch(() => api.requests.list({ status, limit }), [status, limit]);
  const requests: ServiceRequest[] = state.data?.requests ?? [];
  return { ...state, requests };
}

export function useRequest(id: string) {
  const state = useFetch(() => api.requests.getById(id), [id]);
  return { ...state, request: state.data?.request ?? null };
}
