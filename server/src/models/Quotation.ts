import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMilestone {
  milestoneName: string;
  percentage: number;
  amountPaise: number;
  triggerEvent: string;
  isPaid: boolean;
}

export interface IQuotation extends Document {
  quotationNumber: string;
  version: number;
  customerId: mongoose.Types.ObjectId;
  solarDesignId: mongoose.Types.ObjectId;
  baseCostPaise: number;
  discountPercentage: number;
  discountApprovedBy?: mongoose.Types.ObjectId;
  taxPaise: number;
  totalAmountPaise: number;
  estimatedSubsidyPaise: number;
  netCustomerPayablePaise: number;
  paymentMilestones: IPaymentMilestone[];
  termsAndConditions: string[];
  validityDays: number;
  status:
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'SENT_TO_CUSTOMER'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'SUPERSEDED';
  rejectionReason?: string;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: { type: String, required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    solarDesignId: { type: Schema.Types.ObjectId, ref: 'SolarDesign', required: true },
    baseCostPaise: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    discountApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    taxPaise: { type: Number, required: true },
    totalAmountPaise: { type: Number, required: true },
    estimatedSubsidyPaise: { type: Number, default: 0 },
    netCustomerPayablePaise: { type: Number, required: true },
    paymentMilestones: [
      {
        milestoneName: { type: String, required: true },
        percentage: { type: Number, required: true },
        amountPaise: { type: Number, required: true },
        triggerEvent: { type: String, required: true },
        isPaid: { type: Boolean, default: false },
      },
    ],
    termsAndConditions: [{ type: String }],
    validityDays: { type: Number, default: 15 },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'SENT_TO_CUSTOMER',
        'ACCEPTED',
        'REJECTED',
        'SUPERSEDED',
      ],
      default: 'DRAFT',
      index: true,
    },
    rejectionReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of quotationNumber + version
QuotationSchema.index({ quotationNumber: 1, version: 1 }, { unique: true });

export const Quotation = mongoose.model<IQuotation>('Quotation', QuotationSchema);

export interface IWorkOrder extends Document {
  workOrderNumber: string;
  quotationId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  agreedCapacityKw: number;
  contractAmountPaise: number;
  scopeOfWork: string;
  deliveryTimelineDays: number;
  status: 'GENERATED' | 'SIGNED' | 'IN_EXECUTION' | 'COMPLETED' | 'CANCELLED';
  signedAt?: Date;
  signedByCustomerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    workOrderNumber: { type: String, required: true, unique: true, index: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    agreedCapacityKw: { type: Number, required: true },
    contractAmountPaise: { type: Number, required: true },
    scopeOfWork: { type: String, required: true },
    deliveryTimelineDays: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['GENERATED', 'SIGNED', 'IN_EXECUTION', 'COMPLETED', 'CANCELLED'],
      default: 'GENERATED',
      index: true,
    },
    signedAt: { type: Date },
    signedByCustomerName: { type: String },
  },
  { timestamps: true }
);

export const WorkOrder = mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
