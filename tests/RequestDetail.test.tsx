import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestDetail } from '@/components/requests/RequestDetail';
import { loginAs, mockFetch } from './helpers';
import type { Quote, RequestDetail as Detail } from '@/types';

const quote: Quote = {
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

const detail: Detail = {
  id: 'r1',
  orgId: 'o1',
  clientId: 'c1',
  serviceTemplateId: 's1',
  status: 'submitted',
  clientData: { carBrand: 'Fiat' },
  preferredTimeSlot: 'pomeriggio',
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
  client: { id: 'c1', name: 'Giulia', phone: '+39333' },
  quote,
  appointment: null,
  media: [],
  messages: [],
};

describe('RequestDetail', () => {
  it('sends the quote and keeps the confirmation visible after the refetch', async () => {
    loginAs();
    let sent = false;
    mockFetch((url, init) => {
      if (url.pathname === '/api/v1/service-templates') return { body: { services: [] } };
      if (url.pathname === '/api/v1/requests/r1') {
        return {
          body: {
            request: sent ? { ...detail, status: 'quoted', quote: { ...quote, status: 'sent' } } : detail,
          },
        };
      }
      if (url.pathname === '/api/v1/quotes/q1/send' && init.method === 'POST') {
        sent = true;
        return { body: { quote: { ...quote, status: 'sent' }, message: 'msg', providerMessageId: 'x' } };
      }
      return undefined;
    });
    render(<RequestDetail requestId="r1" />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Invia su WhatsApp' }));

    expect(await screen.findByText(/inviato su WhatsApp a \+39333/)).toBeInTheDocument();
    expect(await screen.findByText('Preventivo inviato')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reinvia su WhatsApp' })).toBeInTheDocument();
  });
});
