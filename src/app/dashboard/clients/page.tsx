'use client';

import { useRequests } from '@/hooks/useRequests';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDateTime, shortId } from '@/lib/format';
import Link from 'next/link';

export default function ClientsPage() {
  const { requests, loading, error, refetch } = useRequests();

  const clients = Object.values(
    requests.reduce<
      Record<string, { id: string; count: number; last: string; completed: number; lastRequestId: string }>
    >((acc, r) => {
      const c = (acc[r.clientId] ??= {
        id: r.clientId,
        count: 0,
        last: r.createdAt,
        completed: 0,
        lastRequestId: r.id,
      });
      c.count += 1;
      if (r.status === 'completed') c.completed += 1;
      if (r.createdAt > c.last) {
        c.last = r.createdAt;
        c.lastRequestId = r.id;
      }
      return acc;
    }, {})
  ).sort((a, b) => (a.last < b.last ? 1 : -1));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clienti</h1>
      <p className="text-sm text-gray-500">
        Storico ricavato dalle richieste ricevute; apri l&apos;ultima richiesta per vedere i contatti del
        cliente.
      </p>
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} onRetry={refetch} />}
      {!loading && !error && clients.length === 0 && <EmptyState title="Nessun cliente" />}
      {!loading && clients.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Richieste</th>
                <th className="px-4 py-3">Completate</th>
                <th className="px-4 py-3">Ultima richiesta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-xs">{shortId(c.id)}</td>
                  <td className="px-4 py-3">{c.count}</td>
                  <td className="px-4 py-3">{c.completed}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/requests/${c.lastRequestId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {formatDateTime(c.last)}
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
