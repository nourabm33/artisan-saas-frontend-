import { RequestList } from '@/components/requests/RequestList';

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Richieste</h1>
      <RequestList />
    </div>
  );
}
