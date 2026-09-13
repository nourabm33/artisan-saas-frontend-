'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
    } catch {
      // error surfaced through useAuth().error
    }
  };

  return (
    <Card className="w-full max-w-md">
      <h1 className="mb-1 text-2xl font-bold">Accedi</h1>
      <p className="mb-6 text-sm text-gray-500">{APP_NAME}</p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Accedi
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Non hai un account?{' '}
        <Link href="/register" className="font-medium text-blue-600 hover:underline">
          Registrati
        </Link>
      </p>
    </Card>
  );
}
