'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { TRADE_TYPES } from '@/lib/constants';
import type { RegisterBody } from '@/types/api';

const INITIAL: RegisterBody = {
  organizationName: '',
  tradeType: 'gommista',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
};

export default function RegisterPage() {
  const { register, error, loading } = useAuth();
  const [form, setForm] = useState<RegisterBody>(INITIAL);
  const [localError, setLocalError] = useState<string | null>(null);

  const set = (key: keyof RegisterBody) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (form.password !== form.passwordConfirm) return setLocalError('Le password non coincidono');
    if (form.password.length < 8) return setLocalError('La password deve avere almeno 8 caratteri');
    try {
      await register(form);
    } catch {
      // error surfaced through useAuth().error
    }
  };

  const message = localError ?? error;

  return (
    <Card className="w-full max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Crea il tuo account</h1>

      {message && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Nome attività"
          value={form.organizationName}
          onChange={set('organizationName')}
          required
        />
        <Select label="Settore" value={form.tradeType} onChange={set('tradeType')}>
          {TRADE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome" value={form.firstName} onChange={set('firstName')} required />
          <Input label="Cognome" value={form.lastName} onChange={set('lastName')} required />
        </div>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          required
        />
        <Input
          label="Telefono"
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder="+39 ..."
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            hint="Minimo 8 caratteri"
            required
          />
          <Input
            label="Conferma password"
            type="password"
            autoComplete="new-password"
            value={form.passwordConfirm}
            onChange={set('passwordConfirm')}
            required
          />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Registrati
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Hai già un account?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Accedi
        </Link>
      </p>
    </Card>
  );
}
