import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} {APP_NAME}
    </footer>
  );
}
