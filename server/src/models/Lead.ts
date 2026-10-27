import mongoose, { Schema, Document } from 'mongoose';

export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'SURVEY_SCHEDULED'
  | 'SURVEY_COMPLETED'
  | 'PROPOSAL_SENT'
  | 'WON'
  | 'LOST';

export interface ILeadActivity {
  type: 'CALL' | 'NOTE' | 'WHATSAPP' | 'MEETING' | 'STATUS_CHANGE';
  note: string;
  performedBy: string;
  createdAt: Date;
}

export interface ILead extends Document {
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
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'HOUSING_SOCIETY';
  connectionPhase: 'SINGLE_PHASE' | 'THREE_PHASE';
  preferredCapacityKw: number;
  source: 'WEBSITE' | 'PHONE' | 'WHATSAPP' | 'REFERRAL' | 'WALK_IN' | 'CAMPAIGN' | 'PARTNER';
  assignedSalespersonId?: mongoose.Types.ObjectId;
  assignedSalespersonName?: string;
  branchId?: mongoose.Types.ObjectId;
  stage: LeadStage;
  qualificationScore: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  nextFollowUpDate?: Date;
  lostReason?: string;
  convertedCustomerId?: mongoose.Types.ObjectId;
  activities: ILeadActivity[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    leadId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true, index: true },
    monthlyBillAmountPaise: { type: Number },
    consumerNumber: { type: String, trim: true, index: true },
    discomName: { type: String, trim: true },
    propertyType: {
      type: String,
      enum: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'HOUSING_SOCIETY'],
      default: 'RESIDENTIAL',
    },
    connectionPhase: {
      type: String,
      enum: ['SINGLE_PHASE', 'THREE_PHASE'],
      default: 'SINGLE_PHASE',
    },
    preferredCapacityKw: { type: Number, required: true, default: 3 },
    source: {
      type: String,
      enum: ['WEBSITE', 'PHONE', 'WHATSAPP', 'REFERRAL', 'WALK_IN', 'CAMPAIGN', 'PARTNER'],
      default: 'WEBSITE',
    },
    assignedSalespersonId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedSalespersonName: { type: String },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    stage: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'SURVEY_SCHEDULED', 'SURVEY_COMPLETED', 'PROPOSAL_SENT', 'WON', 'LOST'],
      default: 'NEW',
      index: true,
    },
    qualificationScore: { type: Number, default: 50 },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    nextFollowUpDate: { type: Date },
    lostReason: { type: String },
    convertedCustomerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    activities: [
      {
        type: { type: String, required: true },
        note: { type: String, required: true },
        performedBy: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
