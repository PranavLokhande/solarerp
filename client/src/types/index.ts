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

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  employeeId?: string;
  customerId?: string;
  branch?: {
    _id: string;
    name: string;
    city: string;
    branchCode: string;
  };
  isActive: boolean;
  lastLoginAt?: string;
}

export interface Lead {
  _id: string;
  leadId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  monthlyBillAmountPaise?: number;
  consumerNumber?: string;
  discomName?: string;
  propertyType: string;
  connectionPhase: string;
  preferredCapacityKw: number;
  source: string;
  stage: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  qualificationScore: number;
  assignedSalespersonId?: any;
  branchId?: any;
  convertedCustomerId?: any;
  activities: {
    type: string;
    note: string;
    performedBy: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface Customer {
  _id: string;
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  billingAddress: string;
  serviceAddress: string;
  city: string;
  state: string;
  pinCode: string;
  maskedPan?: string;
  maskedAadhaar?: string;
  discomName?: string;
  consumerNumber?: string;
  status: string;
  createdAt: string;
}

export interface SiteSurvey {
  _id: string;
  surveyId: string;
  leadId?: any;
  customerId?: any;
  propertyId?: any;
  assignedEngineerId: any;
  assignedEngineerName: string;
  visitDate: string;
  usableRoofAreaSqFt: number;
  roofType: string;
  roofCondition: string;
  shadingAssessment: string;
  orientation: string;
  tiltAngleDegrees: number;
  existingMeterPhase: string;
  sanctionLoadKw: number;
  preliminaryCapacityKw: number;
  outcome: 'FEASIBLE' | 'FEASIBLE_WITH_CONDITIONS' | 'ADDITIONAL_INSPECTION_REQUIRED' | 'NOT_FEASIBLE';
  conditionsNotes?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  sitePhotos?: string[];
}

export interface SolarDesign {
  _id: string;
  designId: string;
  customerId: any;
  systemType: string;
  dcCapacityKw: number;
  acCapacityKw: number;
  panelModel: string;
  panelWattage: number;
  panelQty: number;
  inverterModel: string;
  inverterCapacityKw: number;
  structureSpecification: string;
  boqItems: {
    category: string;
    description: string;
    make: string;
    qty: number;
    unit: string;
    unitRatePaise: number;
    totalAmountPaise: number;
  }[];
  estimatedDailyGenKwh: number;
  estimatedAnnualGenKwh: number;
  estimatedCo2MitigatedTonsPerYear: number;
  status: string;
}

export interface Quotation {
  _id: string;
  quotationNumber: string;
  version: number;
  customerId: any;
  solarDesignId: any;
  baseCostPaise: number;
  discountPercentage: number;
  taxPaise: number;
  totalAmountPaise: number;
  estimatedSubsidyPaise: number;
  netCustomerPayablePaise: number;
  paymentMilestones: {
    milestoneName: string;
    percentage: number;
    amountPaise: number;
    triggerEvent: string;
    isPaid: boolean;
  }[];
  status: string;
  validityDays: number;
  createdAt: string;
}

export interface Project {
  _id: string;
  projectId: string;
  workOrderNumber: string;
  customerId: any;
  systemCapacityKw: number;
  currentStage: string;
  stageHistory: {
    stage: string;
    updatedBy: string;
    notes?: string;
    timestamp: string;
  }[];
  assignedProjectManagerName?: string;
  assignedCrewName?: string;
  isBlocked: boolean;
  blockerReason?: string;
  createdAt: string;
}

export interface ProjectDocument {
  _id: string;
  documentId: string;
  projectId?: any;
  customerId: any;
  category: string;
  title: string;
  fileUrl: string;
  status: 'PENDING_UPLOAD' | 'UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CORRECTION_REQUIRED';
  rejectionReason?: string;
  nameMismatchDetails?: {
    hasMismatch: boolean;
    nameOnBill?: string;
    nameOnId?: string;
    requestedCorrectName?: string;
    discomApplicationRef?: string;
    resolutionStatus: string;
  };
  createdAt: string;
}

export interface InventoryItem {
  _id: string;
  sku: string;
  name: string;
  category: string;
  manufacturer: string;
  modelNumber: string;
  unit: string;
  currentStock: number;
  reservedStock: number;
  unitCostPaise: number;
  reorderLevel: number;
  warehouseId: any;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  projectId: any;
  customerId: any;
  milestoneName: string;
  baseAmountPaise: number;
  gstAmountPaise: number;
  totalAmountPaise: number;
  paidAmountPaise: number;
  balanceDuePaise: number;
  dueDate: string;
  status: string;
}

export interface Payment {
  _id: string;
  paymentId: string;
  receiptNumber: string;
  customerId?: any;
  invoiceId?: any;
  amountPaise: number;
  paymentMode: string;
  transactionRef: string;
  status: string;
  createdAt: string;
}

export interface FinancialLedgerEntry {
  _id: string;
  entryId: string;
  entryType: 'DEBIT' | 'CREDIT';
  amountPaise: number;
  runningBalancePaise: number;
  description: string;
  referenceDocType: string;
  referenceDocId: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  customerId: any;
  projectId?: any;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  assignedTechnicianName?: string;
  isWarrantyCovered: boolean;
  resolutionNotes?: string;
  slaDeadline: string;
  createdAt: string;
}
