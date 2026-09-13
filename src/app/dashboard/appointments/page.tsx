import { AppointmentList } from '@/components/appointments/AppointmentList';

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Appuntamenti</h1>
      <AppointmentList />
    </div>
  );
}
