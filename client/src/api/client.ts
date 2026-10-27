const API_BASE = '/api/v1';

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('helios_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data.data;
}

export const api = {
  // Auth
  login: (identifier: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  getMe: () => apiFetch('/auth/me'),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboardStats: () => apiFetch('/dashboard/stats'),

  // Leads
  getLeads: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/leads?${q}`);
  },
  createLead: (payload: any) => apiFetch('/leads', { method: 'POST', body: JSON.stringify(payload) }),
  updateLead: (id: string, payload: any) =>
    apiFetch(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  addLeadActivity: (id: string, payload: any) =>
    apiFetch(`/leads/${id}/activity`, { method: 'POST', body: JSON.stringify(payload) }),
  convertLead: (id: string) => apiFetch(`/leads/${id}/convert`, { method: 'POST' }),

  // Surveys
  getSurveys: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/surveys?${q}`);
  },
  createSurvey: (payload: any) => apiFetch('/surveys', { method: 'POST', body: JSON.stringify(payload) }),
  updateSurvey: (id: string, payload: any) =>
    apiFetch(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Engineering & Solar Design
  getDesigns: (customerId?: string) =>
    apiFetch(`/designs${customerId ? `?customerId=${customerId}` : ''}`),
  createDesign: (payload: any) => apiFetch('/designs', { method: 'POST', body: JSON.stringify(payload) }),

  // Quotations
  getQuotations: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/quotations?${q}`);
  },
  createQuotation: (payload: any) => apiFetch('/quotations', { method: 'POST', body: JSON.stringify(payload) }),
  approveQuotation: (id: string) => apiFetch(`/quotations/${id}/approve`, { method: 'PUT' }),
  acceptQuotation: (id: string, payload: any = {}) =>
    apiFetch(`/quotations/${id}/accept`, { method: 'POST', body: JSON.stringify(payload) }),

  // Projects
  getProjects: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/projects?${q}`);
  },
  getProjectById: (id: string) => apiFetch(`/projects/${id}`),
  updateProjectStage: (id: string, payload: any) =>
    apiFetch(`/projects/${id}/stage`, { method: 'PUT', body: JSON.stringify(payload) }),
  assignProjectTeam: (id: string, payload: any) =>
    apiFetch(`/projects/${id}/assign`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Documents
  getDocuments: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/documents?${q}`);
  },
  uploadDocument: (payload: any) => apiFetch('/documents/upload', { method: 'POST', body: JSON.stringify(payload) }),
  verifyDocument: (id: string, payload: any) =>
    apiFetch(`/documents/${id}/verify`, { method: 'PUT', body: JSON.stringify(payload) }),
  initiateNameCorrection: (payload: any) =>
    apiFetch('/documents/name-correction', { method: 'POST', body: JSON.stringify(payload) }),

  // Regulatory & PM Surya Ghar
  getRegulatory: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/regulatory?${q}`);
  },
  createRegulatory: (payload: any) =>
    apiFetch('/regulatory', { method: 'POST', body: JSON.stringify(payload) }),
  updateRegulatoryStage: (id: string, payload: any) =>
    apiFetch(`/regulatory/${id}/stage`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Loans
  getLoans: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/loans?${q}`);
  },
  createLoan: (payload: any) => apiFetch('/loans', { method: 'POST', body: JSON.stringify(payload) }),
  updateLoanStatus: (id: string, payload: any) =>
    apiFetch(`/loans/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Inventory & Logistics
  getInventory: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/inventory?${q}`);
  },
  inwardStock: (payload: any) => apiFetch('/inventory/inward', { method: 'POST', body: JSON.stringify(payload) }),
  dispatchMaterial: (payload: any) =>
    apiFetch('/inventory/dispatch', { method: 'POST', body: JSON.stringify(payload) }),
  getDispatches: (projectId?: string) =>
    apiFetch(`/inventory/dispatches${projectId ? `?projectId=${projectId}` : ''}`),

  // Installation & QA
  getInstallation: (projectId: string) => apiFetch(`/installation/${projectId}`),
  updateInstallationStage: (payload: any) =>
    apiFetch('/installation/stage-complete', { method: 'POST', body: JSON.stringify(payload) }),
  recordQualityInspection: (payload: any) =>
    apiFetch('/installation/inspect', { method: 'POST', body: JSON.stringify(payload) }),

  // Commissioning & Meter
  recordNetMeter: (payload: any) =>
    apiFetch('/commissioning/net-meter', { method: 'POST', body: JSON.stringify(payload) }),
  commissionSystem: (payload: any) =>
    apiFetch('/commissioning/synchronize', { method: 'POST', body: JSON.stringify(payload) }),

  // Billing & Ledger
  getInvoices: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/billing/invoices?${q}`);
  },
  createInvoice: (payload: any) => apiFetch('/billing/invoices', { method: 'POST', body: JSON.stringify(payload) }),
  getPayments: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/billing/payments?${q}`);
  },
  recordPayment: (payload: any) => apiFetch('/billing/payments', { method: 'POST', body: JSON.stringify(payload) }),
  getCustomerLedger: (customerId: string) => apiFetch(`/billing/ledger/${customerId}`),

  // Support & Service
  getTickets: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/support/tickets?${q}`);
  },
  createTicket: (payload: any) => apiFetch('/support/tickets', { method: 'POST', body: JSON.stringify(payload) }),
  resolveTicket: (id: string, payload: any) =>
    apiFetch(`/support/tickets/${id}/resolve`, { method: 'PUT', body: JSON.stringify(payload) }),
  getWarranties: (customerId?: string) =>
    apiFetch(`/support/warranties${customerId ? `?customerId=${customerId}` : ''}`),
  getAMCContracts: (customerId?: string) =>
    apiFetch(`/support/amc${customerId ? `?customerId=${customerId}` : ''}`),

  // Employees & Branches
  getEmployees: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/employees?${q}`);
  },
  createEmployee: (payload: any) => apiFetch('/employees/invite', { method: 'POST', body: JSON.stringify(payload) }),
  getBranches: () => apiFetch('/employees/branches'),
  getDepartments: () => apiFetch('/employees/departments'),

  // Audit Logs
  getAuditLogs: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/audit/logs?${q}`);
  },
};
