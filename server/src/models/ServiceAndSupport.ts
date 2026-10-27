import mongoose, { Schema, Document } from 'mongoose';

export type TicketCategory =
  | 'INVERTER_FAULT'
  | 'ZERO_GENERATION'
  | 'PHYSICAL_DAMAGE'
  | 'NET_METER_READING'
  | 'CLEANING_REQUEST'
  | 'BILLING_QUERY'
  | 'GENERAL';

export type TicketStatus =
  | 'OPEN'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_PARTS'
  | 'RESOLVED'
  | 'CLOSED';

export interface ITicket extends Document {
  ticketId: string;
  customerId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  category: TicketCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: TicketStatus;
  subject: string;
  description: string;
  assignedTechnicianId?: mongoose.Types.ObjectId;
  assignedTechnicianName?: string;
  isWarrantyCovered: boolean;
  resolutionNotes?: string;
  slaDeadline: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    category: {
      type: String,
      required: true,
      enum: [
        'INVERTER_FAULT',
        'ZERO_GENERATION',
        'PHYSICAL_DAMAGE',
        'NET_METER_READING',
        'CLEANING_REQUEST',
        'BILLING_QUERY',
        'GENERAL',
      ],
      index: true,
    },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    status: {
      type: String,
      enum: [
        'OPEN',
        'TRIAGED',
        'ASSIGNED',
        'IN_PROGRESS',
        'WAITING_FOR_PARTS',
        'RESOLVED',
        'CLOSED',
      ],
      default: 'OPEN',
      index: true,
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    assignedTechnicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTechnicianName: { type: String },
    isWarrantyCovered: { type: Boolean, default: true },
    resolutionNotes: { type: String },
    slaDeadline: { type: Date, required: true },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);

export interface IWarranty extends Document {
  warrantyId: string;
  projectId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  panelPerformanceYears: number;
  panelProductYears: number;
  inverterWarrantyYears: number;
  workmanshipWarrantyYears: number;
  startDate: Date;
  endDate: Date;
  terms: string[];
  isActive: boolean;
}

const WarrantySchema = new Schema<IWarranty>(
  {
    warrantyId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    panelPerformanceYears: { type: Number, default: 25 },
    panelProductYears: { type: Number, default: 12 },
    inverterWarrantyYears: { type: Number, default: 8 },
    workmanshipWarrantyYears: { type: Number, default: 5 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    terms: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Warranty = mongoose.model<IWarranty>('Warranty', WarrantySchema);

export interface IAMCContract extends Document {
  amcId: string;
  projectId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  planName: 'BASIC_PREVENTIVE' | 'COMPREHENSIVE_GOLD' | 'SOLAR_CARE_PLUS';
  annualFeePaise: number;
  visitsPerYear: number;
  visitsCompleted: number;
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING_RENEWAL';
}

const AMCContractSchema = new Schema<IAMCContract>(
  {
    amcId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    planName: {
      type: String,
      enum: ['BASIC_PREVENTIVE', 'COMPREHENSIVE_GOLD', 'SOLAR_CARE_PLUS'],
      default: 'BASIC_PREVENTIVE',
    },
    annualFeePaise: { type: Number, required: true },
    visitsPerYear: { type: Number, default: 4 },
    visitsCompleted: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'PENDING_RENEWAL'],
      default: 'ACTIVE',
      index: true,
    },
  },
  { timestamps: true }
);

export const AMCContract = mongoose.model<IAMCContract>('AMCContract', AMCContractSchema);
