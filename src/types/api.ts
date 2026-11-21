/**
 * Types mirroring the CityFix API (B7A6). Decimal columns (fees, amounts) arrive as strings,
 * dates as ISO strings.
 */

export type Role = "CITIZEN" | "STAFF" | "ADMIN";
export type RequestType = "COMPLAINT" | "SERVICE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ComplaintStatus =
  | "PENDING_PAYMENT"
  | "SUBMITTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED"
  | "REJECTED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
export type FeeStatus = "NOT_REQUIRED" | "UNPAID" | "PAID" | "REFUNDED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFieldError {
  path?: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface Ref {
  id: string;
  name: string;
}

// ───────────────────────── Users & auth ─────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  departmentId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  hasPassword: boolean;
  googleLinked: boolean;
}

export interface Me extends User {
  department: Ref | null;
  stats: { complaintsSubmitted: number; activeAssignments: number };
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  department: Ref | null;
}

// ───────────────────────── Departments & categories ─────────────────────────

export interface Department {
  id: string;
  name: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  _count?: { categories: number };
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  type: RequestType;
  slaHours: number;
  serviceFee: string;
  isActive: boolean;
  department: Ref;
}

// ───────────────────────── Complaints ─────────────────────────

export interface Sla {
  dueAt: string | null;
  breached: boolean;
  hoursRemaining: number | null;
}

export interface ComplaintListItem {
  id: string;
  trackingCode: string;
  title: string;
  type: RequestType;
  priority: Priority;
  status: ComplaintStatus;
  address: string;
  ward: string | null;
  feeAmount: string;
  feeStatus: FeeStatus;
  slaDueAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: Ref;
  department: Ref;
  citizen: Ref;
  assignedTo: Ref | null;
  sla: Sla;
}

export interface Attachment {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface ComplaintPaymentSummary {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface ComplaintDetail extends Omit<ComplaintListItem, "category" | "citizen" | "assignedTo"> {
  description: string;
  latitude: number | null;
  longitude: number | null;
  assignedAt: string | null;
  closedAt: string | null;
  resolutionNote: string | null;
  citizenId: string;
  categoryId: string;
  departmentId: string;
  assignedToId: string | null;
  category: Ref & { slaHours: number };
  citizen: Ref & { email: string; phone: string | null };
  assignedTo: (Ref & { email: string }) | null;
  attachments: Attachment[];
  feedback: { rating: number; comment: string | null; createdAt: string } | null;
  payments: ComplaintPaymentSummary[];
  refundHint?: string;
}

export interface TimelineEntry {
  id: string;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  note: string | null;
  createdAt: string;
  changedBy: (Ref & { role: Role }) | null;
}

export interface Comment {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: Ref & { role: Role };
}

export interface TrackResult {
  trackingCode: string;
  type: RequestType;
  status: ComplaintStatus;
  priority: Priority;
  ward: string | null;
  slaDueAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  category: { name: string };
  department: { name: string };
  history: { toStatus: ComplaintStatus; createdAt: string }[];
  sla: Sla;
}

export interface CreateComplaintResult extends ComplaintDetail {
  nextStep: string;
}

// ───────────────────────── Payments ─────────────────────────

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  provider: string;
  stripeSessionId: string | null;
  checkoutUrl: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  complaint: { id: string; trackingCode: string; title: string; status: ComplaintStatus; feeStatus: FeeStatus };
  user?: { id: string; name: string; email: string };
}

// ───────────────────────── Admin ─────────────────────────

export interface DashboardStats {
  generatedAt: string;
  complaints: {
    total: number;
    byStatus: Partial<Record<ComplaintStatus, number>>;
    openByPriority: Partial<Record<Priority, number>>;
    byDepartment: { departmentId: string; department: string; count: number }[];
    overdue: number;
    unassigned: number;
  };
  performance: {
    resolved: number;
    avgResolutionHours: number | null;
    slaCompliancePercent: number | null;
    averageRating: number | null;
    feedbackCount: number;
    busiestStaff: { staffId: string | null; name: string; activeComplaints: number }[];
  };
  users: Partial<Record<Role, number>>;
  payments: { paidCount: number; totalRevenue: number; currency: string };
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: Role } | null;
}

export interface PublicStats {
  totalRequests: number;
  open: number;
  resolved: number;
  resolutionRatePercent: number | null;
  avgResolutionHours: number | null;
  averageRating: number | null;
  topCategories: { category: string; count: number }[];
}
