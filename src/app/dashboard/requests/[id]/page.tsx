import Link from 'next/link';
import { RequestDetail } from '@/components/requests/RequestDetail';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <Link href="/dashboard/requests" className="text-sm text-blue-600 hover:underline">
        ← Tutte le richieste
      </Link>
      <RequestDetail requestId={params.id} />
    </div>
  );
}
