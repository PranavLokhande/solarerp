import { Request } from 'express';

export type UserRole =
  | 'Super Admin'
  | 'Company Owner / Director'
  | 'Branch Manager'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Site Survey Engineer'
  | 'Design Engineer'
  | 'Documentation Executive'
  | 'Government Portal / DISCOM Coordinator'
  | 'Finance Manager'
  | 'Finance Executive'
  | 'Procurement Manager'
  | 'Warehouse Manager'
  | 'Inventory Executive'
  | 'Project Manager'
  | 'Installation Supervisor'
  | 'Installation Technician'
  | 'Quality Assurance Engineer'
  | 'Customer Support Executive'
  | 'HR Manager'
  | 'Auditor / Read-only Analyst'
  | 'Customer';

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'export'
  | 'delete'
  | 'view_financials'
  | 'sensitive_docs'
  | 'manage_users'
  | 'override_stages';

export type PermissionResource =
  | 'leads'
  | 'customers'
  | 'surveys'
  | 'designs'
  | 'quotations'
  | 'work_orders'
  | 'projects'
  | 'documents'
  | 'registration'
  | 'loans'
  | 'inventory'
  | 'dispatch'
  | 'installation'
  | 'metering'
  | 'invoices'
  | 'payments'
  | 'tickets'
  | 'warranty'
  | 'reports'
  | 'audit_logs'
  | 'settings';

export interface AuthUserPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId?: string;
  employeeId?: string;
  customerId?: string;
  permissions?: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
  correlationId?: string;
}
