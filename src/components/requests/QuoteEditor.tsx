'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '@/lib/api';
import { errorMessage, formatEur } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { QuoteStatusBadge } from '@/components/ui/Badge';
import type { Quote } from '@/types';

interface QuoteEditorProps {
  quote: Quote;
  clientPhone?: string;
  onChange: (quote: Quote) => void;
}

interface FormState {
  laborHours: string;
  discountPercentage: string;
  notes: string;
}

function discountPercentageOf(quote: Quote): number {
  if (quote.subtotal === 0) return 0;
  return Math.round((quote.discount / quote.subtotal) * 10000) / 100;
}

export function QuoteEditor({ quote, clientPhone, onChange }: QuoteEditorProps) {
  const [form, setForm] = useState<FormState>({
    laborHours: String(quote.laborHours),
    discountPercentage: String(discountPercentageOf(quote)),
    notes: quote.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const editable = quote.status === 'draft';
  const laborCost = quote.laborHours * quote.laborRate;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const laborHours = Number(form.laborHours);
    const discountPercentage = Number(form.discountPercentage);
    if (Number.isNaN(laborHours) || laborHours < 0) return setError('Ore di manodopera non valide');
    if (Number.isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100)
      return setError('Lo sconto deve essere tra 0 e 100%');
    setSaving(true);
    try {
      const { quote: updated } = await api.quotes.update(quote.id, {
        laborHours,
        discountPercentage,
        notes: form.notes,
      });
      onChange(updated);
      setInfo('Preventivo aggiornato');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    setError(null);
    setInfo(null);
    setSending(true);
    try {
      const result = await api.quotes.send(quote.id);
      onChange(result.quote);
      setPreview(result.message);
      setInfo(`Preventivo inviato su WhatsApp${clientPhone ? ` a ${clientPhone}` : ''}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card title="Preventivo" actions={<QuoteStatusBadge status={quote.status} />}>
      <dl className="mb-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-gray-500">Base</dt>
          <dd className="font-semibold text-gray-900">{formatEur(quote.basePrice)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">
            Manodopera ({quote.laborHours}h × {formatEur(quote.laborRate)})
          </dt>
          <dd className="font-semibold text-gray-900">{formatEur(laborCost)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Sconto</dt>
          <dd className="font-semibold text-gray-900">-{formatEur(quote.discount)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">IVA {quote.taxPercentage}%</dt>
          <dd className="font-semibold text-gray-900">{formatEur(quote.taxAmount)}</dd>
        </div>
      </dl>
      <p className="mb-6 text-2xl font-bold text-gray-900" data-testid="quote-total">
        Totale {formatEur(quote.total)}
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {info && (
        <p role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
          {info}
        </p>
      )}

      {editable ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Ore di manodopera"
              type="number"
              step="0.5"
              min="0"
              value={form.laborHours}
              onChange={(e) => setForm({ ...form, laborHours: e.target.value })}
            />
            <Input
              label="Sconto (%)"
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={form.discountPercentage}
              onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
            />
          </div>
          <Textarea
            label="Note per il cliente"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="secondary" loading={saving}>
              Salva modifiche
            </Button>
            <Button type="button" variant="success" loading={sending} onClick={handleSend}>
              Invia su WhatsApp
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {quote.notes && <p className="text-sm text-gray-700">Note: {quote.notes}</p>}
          {quote.status === 'sent' && (
            <Button type="button" variant="secondary" loading={sending} onClick={handleSend}>
              Reinvia su WhatsApp
            </Button>
          )}
        </div>
      )}

      {preview && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-gray-600">Messaggio inviato</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
            {preview}
          </pre>
        </details>
      )}
    </Card>
  );
}
