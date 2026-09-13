import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(auth)/login/page';
import { getStoredUser } from '@/lib/auth';
import { demoUser, mockFetch, push, renderWithAuth } from './helpers';

describe('LoginPage', () => {
  it('logs in, stores the session and redirects to the dashboard', async () => {
    const { calls } = mockFetch((url) =>
      url.pathname === '/api/v1/auth/login'
        ? { body: { user: demoUser, tokens: { accessToken: 'a', refreshToken: 'r' } } }
        : undefined
    );
    renderWithAuth(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'demo@gommista.it');
    await user.type(screen.getByLabelText('Password'), 'Password123!');
    await user.click(screen.getByRole('button', { name: 'Accedi' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
    expect(getStoredUser()?.email).toBe('demo@gommista.it');
    expect(JSON.parse(calls[0].init.body as string)).toEqual({
      email: 'demo@gommista.it',
      password: 'Password123!',
    });
  });

  it('shows the backend error message', async () => {
    mockFetch(() => ({
      status: 401,
      body: { error: { code: 'UNAUTHORIZED', message: 'Credenziali non valide' } },
    }));
    renderWithAuth(<LoginPage />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Email'), 'demo@gommista.it');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Accedi' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenziali non valide');
  });
});
