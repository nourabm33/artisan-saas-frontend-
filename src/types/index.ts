export type Role = 'owner' | 'admin' | 'technician';

export interface User {
  id: string;
  orgId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface ServiceTemplate {
  id: string;
  orgId: string;
  tradeType: string;
  name: string;
  description?: string;
  basePrice: number;
  defaultLaborHours: number;
  isActive: boolean;
}

export type RequestStatus =
  'submitted' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

export interface ServiceRequest {
  id: string;
  orgId: string;
  clientId: string;
  serviceTemplateId: string;
  status: RequestStatus;
  clientData: Record<string, unknown>;
  preferredDate?: string;
  preferredTimeSlot?: string;
  quoteId?: string;
  appointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface Quote {
  id: string;
  requestId: string;
  basePrice: number;
  laborHours: number;
  laborRate: number;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes?: string;
  status: QuoteStatus;
  createdAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  requestId: string;
  orgId: string;
  assignedTo: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  requestId: string;
  url: string;
  type: 'image' | 'video' | 'document';
  uploadedBy: 'client' | 'artisan';
  createdAt: string;
}

export interface WhatsAppMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  createdAt: string;
}

export interface RequestDetail extends ServiceRequest {
  client: Client | null;
  quote: Quote | null;
  appointment: Appointment | null;
  media: Media[];
  messages: WhatsAppMessage[];
}
