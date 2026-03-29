export interface LeadFormData {
  studentName: string;
  guardianName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  studentAge?: number;
  gradeInterest?: string;
  campus?: string;
  productId?: string;
  source: string;
  interestReason?: string;
  notes?: string;
}

export interface LeadWithRelations {
  id: string;
  tenantId: string;
  studentName: string;
  guardianName: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  studentAge: number | null;
  gradeInterest: string | null;
  campus: string | null;
  source: string;
  interestReason: string | null;
  notes: string | null;
  status: string;
  nextAction: string | null;
  nextActionAt: Date | string | null;
  lastInteractionAt: Date | string | null;
  lostReason: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  messages?: MessageData[];
  appointments?: AppointmentData[];
  enrollment?: EnrollmentData | null;
  product?: ProductData | null;
}

export interface ProductData {
  id: string;
  tenantId: string;
  name: string;
  level: string;
  price: number;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MessageData {
  id: string;
  leadId: string;
  channel: string;
  direction: string;
  content: string;
  templateName: string | null;
  sentAt: Date | string;
  deliveredAt: Date | string | null;
  readAt: Date | string | null;
  status: string;
}

export interface AppointmentData {
  id: string;
  leadId: string;
  type: string;
  scheduledAt: Date | string;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  lead?: {
    id: string;
    studentName: string;
    guardianName: string;
    gradeInterest: string | null;
  };
}

export interface EnrollmentData {
  id: string;
  leadId: string;
  studentName: string;
  guardianName: string;
  gradeFinal: string;
  campus: string | null;
  closedAt: Date | string;
  notes: string | null;
  createdAt: Date | string;
  lead?: {
    id: string;
    source: string;
    gradeInterest: string | null;
  };
}

export interface TemplateData {
  id: string;
  tenantId: string;
  name: string;
  content: string;
  approvedWhatsappTemplateId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PipelineColumn {
  stage: string;
  leads: LeadWithRelations[];
  count: number;
}

export interface LeadFilters {
  search?: string;
  status?: string;
  source?: string;
  gradeInterest?: string;
  campus?: string;
  overdue?: boolean;
  noNextAction?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  pipelineStages: string[];
  integrations?: { provider: string; connectedAt: string }[];
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsThisMonth: number;
  enrollmentsThisMonth: number;
  conversionRate: number;
  pipelineValueUSD: number;
  enrolledRevenueUSD: number;
  leadsBySource: { source: string; count: number }[];
  leadsByStage: { stage: string; count: number }[];
  enrollmentsByMonth: { month: string; count: number }[];
}
