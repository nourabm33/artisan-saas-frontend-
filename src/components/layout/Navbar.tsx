'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { APP_NAME } from '@/lib/constants';

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Apri menu"
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              ☰
            </button>
          )}
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            {APP_NAME}
          </Link>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-700 sm:inline">
              {user.firstName} {user.lastName}
              <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs uppercase text-gray-600">
                {user.role}
              </span>
            </span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Esci
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
