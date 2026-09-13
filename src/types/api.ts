import type {
  Appointment,
  AppointmentStatus,
  Quote,
  QuoteStatus,
  RequestDetail,
  RequestStatus,
  ServiceRequest,
  ServiceTemplate,
  User,
} from './index';

export interface ApiErrorBody {
  error: { code: string; message: string; details?: Record<string, string[]> };
}

export interface RegisterBody {
  organizationName: string;
  tradeType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ListRequestsParams {
  status?: RequestStatus;
  limit?: number;
  offset?: number;
}

export interface ListRequestsResponse {
  requests: ServiceRequest[];
  limit: number;
  offset: number;
}

export interface RequestDetailResponse {
  request: RequestDetail;
}

export interface QuoteResponse {
  quote: Quote;
}

export interface UpdateQuoteBody {
  laborHours?: number;
  discountPercentage?: number;
  notes?: string;
}

export interface UpdateQuoteStatusBody {
  status: QuoteStatus;
}

export interface SendQuoteResponse {
  quote: Quote;
  message: string;
  providerMessageId: string;
}

export interface ListAppointmentsParams {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface ListAppointmentsResponse {
  appointments: Appointment[];
  limit: number;
  offset: number;
}

export interface AppointmentResponse {
  appointment: Appointment;
}

export interface RescheduleBody {
  scheduledStart: string;
  scheduledEnd: string;
}

export interface ServicesResponse {
  services: ServiceTemplate[];
}

export interface MeResponse {
  user: User;
}
