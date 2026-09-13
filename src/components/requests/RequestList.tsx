'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRequests } from '@/hooks/useRequests';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { Card } from '@/components/ui/Card';
import { RequestStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { REQUEST_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime, shortId } from '@/lib/format';
import type { RequestStatus, ServiceRequest } from '@/types';

const STATUS_OPTIONS = Object.entries(REQUEST_STATUS_LABELS) as [RequestStatus, string][];

export function vehicleLabel(clientData: Record<string, unknown>): string {
  const parts = ['carBrand', 'carModel', 'tireSize']
    .map((k) => clientData[k])
    .filter((v): v is string => typeof v === 'string' && v.length > 0);
  return parts.join(' · ');
}

export function RequestList() {
  const [status, setStatus] = useState<RequestStatus | ''>('');
  const { requests, loading, error, refetch } = useRequests(status || undefined);
  const { byId } = useServiceTemplates();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-56">
          <Select
            label="Stato"
            value={status}
            onChange={(e) => setStatus(e.target.value as RequestStatus | '')}
          >
            <option value="">Tutti</option>
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        {!loading && <p className="text-sm text-gray-500">{requests.length} richieste</p>}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} onRetry={refetch} />}
      {!loading && !error && requests.length === 0 && (
        <EmptyState
          title="Nessuna richiesta"
          description="Le richieste inviate dai clienti tramite il modulo pubblico appariranno qui."
        />
      )}

      {!loading && requests.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Richiesta</th>
                <th className="px-4 py-3">Servizio</th>
                <th className="px-4 py-3">Veicolo</th>
                <th className="px-4 py-3">Preferenza</th>
                <th className="px-4 py-3">Stato</th>
                <th className="px-4 py-3">Ricevuta</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r: ServiceRequest) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">#{shortId(r.id)}</td>
                  <td className="px-4 py-3 text-gray-900">{byId.get(r.serviceTemplateId)?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{vehicleLabel(r.clientData) || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{r.preferredTimeSlot ?? '—'}</td>
                  <td className="px-4 py-3">
                    <RequestStatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(r.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/requests/${r.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Dettagli →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
