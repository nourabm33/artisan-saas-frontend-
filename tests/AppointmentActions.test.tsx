import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentActions } from '@/components/appointments/AppointmentActions';
import { loginAs, mockFetch } from './helpers';
import type { Appointment } from '@/types';

const pending: Appointment = {
  id: 'a1',
  requestId: 'r1',
  orgId: 'o1',
  assignedTo: 'u1',
  scheduledStart: '2030-01-15T14:00:00.000Z',
  scheduledEnd: '2030-01-15T15:30:00.000Z',
  status: 'pending',
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-01T00:00:00.000Z',
};

describe('AppointmentActions', () => {
  it('offers only the allowed transitions and confirms an appointment', async () => {
    loginAs();
    const { calls } = mockFetch((url, init) =>
      url.pathname === '/api/v1/appointments/a1/status' && init.method === 'PATCH'
        ? { body: { appointment: { ...pending, status: 'confirmed' } } }
        : undefined
    );
    const onChange = vi.fn();
    render(<AppointmentActions appointment={pending} onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Confermato' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Completato' })).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Confermato' }));
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ status: 'confirmed' });
    await vi.waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'confirmed' }))
    );
  });

  it('renders no actions for closed appointments', () => {
    render(<AppointmentActions appointment={{ ...pending, status: 'completed' }} onChange={vi.fn()} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('validates the reschedule range before calling the API', async () => {
    loginAs();
    const { fetchMock } = mockFetch(() => undefined);
    render(<AppointmentActions appointment={pending} onChange={vi.fn()} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Riprogramma' }));
    const end = screen.getByLabelText('Fine');
    await user.clear(end);
    await user.type(end, '2030-01-15T08:00');
    await user.click(screen.getByRole('button', { name: 'Salva' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("La fine deve essere successiva all'inizio");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
