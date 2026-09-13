import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import DashboardLayout from '@/app/dashboard/layout';
import { loginAs, renderWithAuth, replace } from './helpers';

describe('DashboardLayout', () => {
  it('redirects anonymous visitors to /login', async () => {
    renderWithAuth(
      <DashboardLayout>
        <p>secret</p>
      </DashboardLayout>
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('renders the shell for authenticated users', async () => {
    loginAs();
    renderWithAuth(
      <DashboardLayout>
        <p>secret</p>
      </DashboardLayout>
    );
    expect(await screen.findByText('secret')).toBeInTheDocument();
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Richieste' })).toHaveAttribute('href', '/dashboard/requests');
  });
});
