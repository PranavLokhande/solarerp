import mongoose, { Schema, Document } from 'mongoose';

export type RegistrationStage =
  | 'NOT_STARTED'
  | 'READY_FOR_SUBMISSION'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CLARIFICATION_REQUIRED'
  | 'FEASIBILITY_APPROVED'
  | 'FEASIBILITY_REJECTED'
  | 'NET_METER_APPLIED'
  | 'INSPECTION_SCHEDULED'
  | 'COMMISSIONED'
  | 'SUBSIDY_APPLIED'
  | 'SUBSIDY_DISBURSED';

export interface IRegistrationApplication extends Document {
  applicationId: string;
  projectId: mongoose.Types.ObjectId;
  portalType: 'PM_SURYA_GHAR_NATIONAL_PORTAL' | 'STATE_DISCOM_PORTAL' | 'MNRE';
  applicationNumber: string;
  discomName: string;
  consumerNumber: string;
  currentStage: RegistrationStage;
  submittedDate?: Date;
  feasibilityApprovedDate?: Date;
  netMeterInstallDate?: Date;
  subsidyClaimedDate?: Date;
  subsidyAmountPaise?: number;
  assignedCoordinatorId?: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationApplicationSchema = new Schema<IRegistrationApplication>(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    portalType: {
      type: String,
      enum: ['PM_SURYA_GHAR_NATIONAL_PORTAL', 'STATE_DISCOM_PORTAL', 'MNRE'],
      default: 'PM_SURYA_GHAR_NATIONAL_PORTAL',
    },
    applicationNumber: { type: String, required: true, index: true },
    discomName: { type: String, required: true },
    consumerNumber: { type: String, required: true },
    currentStage: {
      type: String,
      enum: [
        'NOT_STARTED',
        'READY_FOR_SUBMISSION',
        'SUBMITTED',
        'UNDER_REVIEW',
        'CLARIFICATION_REQUIRED',
        'FEASIBILITY_APPROVED',
        'FEASIBILITY_REJECTED',
        'NET_METER_APPLIED',
        'INSPECTION_SCHEDULED',
        'COMMISSIONED',
        'SUBSIDY_APPLIED',
        'SUBSIDY_DISBURSED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    submittedDate: { type: Date, default: Date.now },
    feasibilityApprovedDate: { type: Date },
    netMeterInstallDate: { type: Date },
    subsidyClaimedDate: { type: Date },
    subsidyAmountPaise: { type: Number, default: 0 },
    assignedCoordinatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const RegistrationApplication = mongoose.model<IRegistrationApplication>(
  'RegistrationApplication',
  RegistrationApplicationSchema
);

export interface ILoanApplication extends Document {
  loanId: string;
  projectId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  financingPartner: string;
  applicationNumber: string;
  requestedAmountPaise: number;
  sanctionedAmountPaise: number;
  disbursedAmountPaise: number;
  status:
    | 'NOT_REQUIRED'
    | 'DOCS_PENDING'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'SANCTIONED'
    | 'DISBURSED'
    | 'REJECTED';
  sanctionLetterUrl?: string;
  rejectionReason?: string;
  assignedFinanceOfficerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    loanId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    financingPartner: { type: String, required: true },
    applicationNumber: { type: String, required: true, index: true },
    requestedAmountPaise: { type: Number, required: true },
    sanctionedAmountPaise: { type: Number, default: 0 },
    disbursedAmountPaise: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        'NOT_REQUIRED',
        'DOCS_PENDING',
        'SUBMITTED',
        'UNDER_REVIEW',
        'SANCTIONED',
        'DISBURSED',
        'REJECTED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    sanctionLetterUrl: { type: String },
    rejectionReason: { type: String },
    assignedFinanceOfficerId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const LoanApplication = mongoose.model<ILoanApplication>(
  'LoanApplication',
  LoanApplicationSchema
);
