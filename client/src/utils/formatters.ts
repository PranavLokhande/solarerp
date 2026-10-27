export function formatPaiseToRupees(paise: number = 0): string {
  const rupees = Math.round(paise) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStageLabel(stage: string): string {
  const stageMap: Record<string, string> = {
    PROJECT_INITIATED: 'Project Initiated',
    KYC_DOCUMENTS: 'KYC & Document Review',
    DISCOM_REGISTRATION: 'DISCOM / Portal Registration',
    FINANCING: 'Financing & Loan Sanction',
    MATERIAL_ALLOCATION: 'Warehouse Allocation',
    MATERIAL_DISPATCHED: 'Material Dispatched',
    STRUCTURE_INSTALLATION: 'Structure Installation',
    PANEL_INSTALLATION: 'Solar Panel Mounting',
    ELECTRICAL_AND_INVERTER: 'Inverter & Electrical BOS',
    QUALITY_INSPECTION: 'QA & Safety Inspection',
    NET_METER_APPLICATION: 'Net Meter Application',
    NET_METER_INSTALLED: 'Net Meter Installed',
    COMMISSIONED: 'Grid Synchronized & Commissioned',
    HANDOVER_COMPLETED: 'Handover & AMC Active',
  };
  return stageMap[stage] || stage.replace(/_/g, ' ');
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMMISSIONED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FEASIBLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    WON: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',

    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    DISPATCHED: 'bg-blue-50 text-blue-700 border-blue-200',
    SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',

    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
    PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
    FEASIBLE_WITH_CONDITIONS: 'bg-amber-50 text-amber-700 border-amber-200',
    CORRECTION_REQUIRED: 'bg-amber-50 text-amber-700 border-amber-200',
    OPEN: 'bg-amber-50 text-amber-700 border-amber-200',

    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    LOST: 'bg-rose-50 text-rose-700 border-rose-200',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
    NOT_FEASIBLE: 'bg-rose-50 text-rose-700 border-rose-200',
    BLOCKED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
}
