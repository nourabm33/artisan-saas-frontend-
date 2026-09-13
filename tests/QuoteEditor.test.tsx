import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteEditor } from '@/components/requests/QuoteEditor';
import { loginAs, mockFetch } from './helpers';
import type { Quote } from '@/types';

const draft: Quote = {
  id: 'q1',
  requestId: 'r1',
  basePrice: 30,
  laborHours: 0.5,
  laborRate: 30,
  subtotal: 45,
  taxPercentage: 22,
  taxAmount: 9.9,
  discount: 0,
  total: 54.9,
  status: 'draft',
  createdAt: '2026-01-01T10:00:00.000Z',
};

describe('QuoteEditor', () => {
  it('saves labor hours / discount and shows the recalculated total', async () => {
    loginAs();
    const updated: Quote = {
      ...draft,
      laborHours: 1.5,
      subtotal: 75,
      discount: 3.75,
      taxAmount: 15.68,
      total: 86.93,
    };
    const { calls } = mockFetch((url, init) =>
      url.pathname === '/api/v1/quotes/q1' && init.method === 'PATCH'
        ? { body: { quote: updated } }
        : undefined
    );
    const onChange = vi.fn();
    render(<QuoteEditor quote={draft} onChange={onChange} />);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Ore di manodopera'));
    await user.type(screen.getByLabelText('Ore di manodopera'), '1.5');
    await user.clear(screen.getByLabelText('Sconto (%)'));
    await user.type(screen.getByLabelText('Sconto (%)'), '5');
    await user.click(screen.getByRole('button', { name: 'Salva modifiche' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Preventivo aggiornato');
    expect(JSON.parse(calls[0].init.body as string)).toEqual({
      laborHours: 1.5,
      discountPercentage: 5,
      notes: '',
    });
    expect(onChange).toHaveBeenCalledWith(updated);
  });

  it('sends the quote on WhatsApp and shows the message preview', async () => {
    loginAs();
    mockFetch((url, init) =>
      url.pathname === '/api/v1/quotes/q1/send' && init.method === 'POST'
        ? {
            body: {
              quote: { ...draft, status: 'sent' },
              message: 'Ciao Giulia, ecco il preventivo',
              providerMessageId: 'SM1',
            },
          }
        : undefined
    );
    const onChange = vi.fn();
    render(<QuoteEditor quote={draft} clientPhone="+39 333 1234567" onChange={onChange} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Invia su WhatsApp' }));

    expect(await screen.findByRole('status')).toHaveTextContent('inviato su WhatsApp a +39 333 1234567');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent' }));
    expect(screen.getByText('Ciao Giulia, ecco il preventivo')).toBeInTheDocument();
  });

  it('is read-only once the quote is no longer a draft', () => {
    render(<QuoteEditor quote={{ ...draft, status: 'accepted' }} onChange={vi.fn()} />);
    expect(screen.queryByLabelText('Ore di manodopera')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /WhatsApp/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('quote-total')).toHaveTextContent('54,90');
  });
});
