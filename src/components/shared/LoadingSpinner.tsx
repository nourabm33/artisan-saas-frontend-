export function LoadingSpinner({ label = 'Caricamento…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-12 text-gray-500">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
