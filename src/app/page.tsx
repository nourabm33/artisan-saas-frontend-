import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center bg-gradient-to-br from-blue-700 to-blue-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-20 text-white">
        <h1 className="text-5xl font-bold">{APP_NAME}</h1>
        <p className="mt-4 max-w-xl text-lg text-blue-100">
          Richieste dei clienti, preventivi inviati su WhatsApp e appuntamenti fissati automaticamente.
          Pensato per gommisti e artigiani italiani.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 shadow hover:bg-blue-50"
          >
            Accedi
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            Crea account
          </Link>
        </div>
      </div>
    </main>
  );
}
