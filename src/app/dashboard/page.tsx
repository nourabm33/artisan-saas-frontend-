'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { useAppointments } from '@/hooks/useAppointments';
import { Card } from '@/components/ui/Card';
import { AppointmentStatusBadge, RequestStatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { formatDateTime, shortId } from '@/lib/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const requestsState = useRequests();
  const appointmentsState = useAppointments();

  const requests = requestsState.requests;
  const upcoming = appointmentsState.appointments
    .filter(
      (a) => (a.status === 'pending' || a.status === 'confirmed') && new Date(a.scheduledStart) >= new Date()
    )
    .slice(0, 5);

  const stats = [
    { label: 'Richieste totali', value: requests.length, href: '/dashboard/requests' },
    {
      label: 'Da gestire',
      value: requests.filter((r) => r.status === 'submitted' || r.status === 'quoted').length,
      href: '/dashboard/requests?status=quoted',
    },
    {
      label: 'Lavori accettati',
      value: requests.filter((r) => r.status === 'accepted' || r.status === 'in_progress').length,
      href: '/dashboard/requests',
    },
    {
      label: 'Appuntamenti da confermare',
      value: appointmentsState.appointments.filter((a) => a.status === 'pending').length,
      href: '/dashboard/appointments?status=pending',
    },
  ];

  const loading = requestsState.loading || appointmentsState.loading;
  const error = requestsState.error ?? appointmentsState.error;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ciao, {user?.firstName}</h1>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => void Promise.all([requestsState.refetch(), appointmentsState.refetch()])}
        />
      )}
      {loading && <LoadingSpinner />}

      {!loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Link key={s.label} href={s.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <p className="text-sm font-medium text-gray-500">{s.label}</p>
                  <p className="mt-2 text-4xl font-bold text-gray-900">{s.value}</p>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card
              title="Ultime richieste"
              actions={
                <Link href="/dashboard/requests" className="text-sm text-blue-600 hover:underline">
                  Vedi tutte
                </Link>
              }
            >
              {requests.length === 0 ? (
                <p className="text-sm text-gray-500">Nessuna richiesta ancora.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {requests.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                      <Link
                        href={`/dashboard/requests/${r.id}`}
                        className="font-mono text-blue-600 hover:underline"
                      >
                        #{shortId(r.id)}
                      </Link>
                      <span className="text-gray-500">{formatDateTime(r.createdAt)}</span>
                      <RequestStatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              title="Prossimi appuntamenti"
              actions={
                <Link href="/dashboard/appointments" className="text-sm text-blue-600 hover:underline">
                  Vedi tutti
                </Link>
              }
            >
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-500">Nessun appuntamento in programma.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {upcoming.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-medium text-gray-900">{formatDateTime(a.scheduledStart)}</span>
                      <Link
                        href={`/dashboard/requests/${a.requestId}`}
                        className="font-mono text-blue-600 hover:underline"
                      >
                        #{shortId(a.requestId)}
                      </Link>
                      <AppointmentStatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
