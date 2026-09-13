'use client';

import { useEffect, useState } from 'react';
import { useRequest } from '@/hooks/useRequests';
import { useServiceTemplates } from '@/hooks/useServiceTemplates';
import { Card } from '@/components/ui/Card';
import { AppointmentStatusBadge, RequestStatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { QuoteEditor } from './QuoteEditor';
import { AppointmentActions } from '@/components/appointments/AppointmentActions';
import { formatDate, formatDateTime, shortId } from '@/lib/format';
import type { Appointment, Quote, RequestDetail as RequestDetailType } from '@/types';

export function RequestDetail({ requestId }: { requestId: string }) {
  const { request, loading, error, refetch } = useRequest(requestId);
  const { byId } = useServiceTemplates();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    setQuote(request?.quote ?? null);
    setAppointment(request?.appointment ?? null);
  }, [request]);

  if (loading && !request) return <LoadingSpinner />;
  if (error && !request) return <ErrorAlert message={error} onRetry={refetch} />;
  if (!request) return <ErrorAlert message="Richiesta non trovata" />;

  return (
    <div className="space-y-6">
      <Card
        title={`Richiesta #${shortId(request.id)}`}
        actions={<RequestStatusBadge status={request.status} />}
      >
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Servizio" value={byId.get(request.serviceTemplateId)?.name ?? '—'} />
          <Field label="Ricevuta" value={formatDateTime(request.createdAt)} />
          <Field
            label="Preferenza cliente"
            value={
              [request.preferredDate && formatDate(request.preferredDate), request.preferredTimeSlot]
                .filter(Boolean)
                .join(' · ') || '—'
            }
          />
          {Object.entries(request.clientData).map(([key, value]) => (
            <Field key={key} label={humanize(key)} value={String(value)} />
          ))}
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {quote ? (
            <QuoteEditor
              key={quote.id}
              quote={quote}
              clientPhone={request.client?.phone}
              onChange={(q) => {
                setQuote(q);
                if (q.status !== quote.status) void refetch();
              }}
            />
          ) : (
            <Card title="Preventivo">
              <p className="text-sm text-gray-500">Nessun preventivo generato.</p>
            </Card>
          )}

          <Card
            title="Appuntamento"
            actions={appointment && <AppointmentStatusBadge status={appointment.status} />}
          >
            {appointment ? (
              <div className="space-y-4">
                <p className="text-gray-900">
                  {formatDateTime(appointment.scheduledStart)} → {formatDateTime(appointment.scheduledEnd)}
                </p>
                <AppointmentActions
                  appointment={appointment}
                  onChange={(a) => {
                    setAppointment(a);
                    void refetch();
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                L&apos;appuntamento viene creato automaticamente quando il cliente accetta il preventivo.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Cliente">
            {request.client ? (
              <dl className="space-y-2 text-sm">
                <Field label="Nome" value={request.client.name} />
                <Field label="Telefono" value={request.client.phone} />
                {request.client.email && <Field label="Email" value={request.client.email} />}
              </dl>
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </Card>

          <Card title={`Foto e documenti (${request.media.length})`}>
            {request.media.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun allegato.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2">
                {request.media.map((m) => (
                  <li key={m.id}>
                    <a href={m.url} target="_blank" rel="noreferrer" className="block">
                      {m.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt="Allegato" className="h-24 w-full rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-600">
                          {m.type === 'video' ? 'Video' : 'Documento'}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="WhatsApp">
            {request.messages.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun messaggio.</p>
            ) : (
              <ul className="space-y-2">
                {request.messages.map((m) => (
                  <li
                    key={m.id}
                    className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                      m.direction === 'outbound'
                        ? 'ml-auto bg-green-50 text-green-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className="mt-1 text-[10px] text-gray-500">{formatDateTime(m.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

export type { RequestDetailType };
