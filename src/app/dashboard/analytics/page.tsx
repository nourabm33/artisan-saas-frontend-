'use client';

import { useRequests } from '@/hooks/useRequests';
import { useAppointments } from '@/hooks/useAppointments';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { REQUEST_STATUS_LABELS } from '@/lib/constants';
import type { RequestStatus } from '@/types';

export default function AnalyticsPage() {
  const r = useRequests();
  const a = useAppointments();
  const loading = r.loading || a.loading;
  const error = r.error ?? a.error;

  const total = r.requests.length;
  const byStatus = (Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).map((s) => ({
    status: s,
    count: r.requests.filter((x) => x.status === s).length,
  }));
  const decided = r.requests.filter((x) =>
    ['accepted', 'in_progress', 'completed', 'rejected'].includes(x.status)
  );
  const accepted = decided.filter((x) => x.status !== 'rejected').length;
  const acceptanceRate = decided.length ? Math.round((accepted / decided.length) * 100) : 0;
  const completed = a.appointments.filter((x) => x.status === 'completed').length;
  const completionRate = a.appointments.length ? Math.round((completed / a.appointments.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analisi</h1>
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Richieste" value={String(total)} />
            <Stat label="Tasso di accettazione preventivi" value={`${acceptanceRate}%`} />
            <Stat label="Appuntamenti completati" value={`${completionRate}%`} />
          </div>
          <Card title="Richieste per stato">
            <ul className="space-y-2">
              {byStatus.map(({ status, count }) => (
                <li key={status} className="flex items-center gap-3 text-sm">
                  <span className="w-40 text-gray-600">{REQUEST_STATUS_LABELS[status]}</span>
                  <div className="h-2 flex-1 rounded bg-gray-100">
                    <div
                      className="h-2 rounded bg-blue-600"
                      style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-8 text-right font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </Card>
  );
}
