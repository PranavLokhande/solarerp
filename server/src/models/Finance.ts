import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  projectId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  milestoneName: string;
  baseAmountPaise: number;
  gstAmountPaise: number;
  totalAmountPaise: number;
  paidAmountPaise: number;
  balanceDuePaise: number;
  dueDate: Date;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issuedAt?: Date;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    milestoneName: { type: String, required: true },
    baseAmountPaise: { type: Number, required: true },
    gstAmountPaise: { type: Number, required: true },
    totalAmountPaise: { type: Number, required: true },
    paidAmountPaise: { type: Number, default: 0 },
    balanceDuePaise: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'],
      default: 'ISSUED',
      index: true,
    },
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export interface IPayment extends Document {
  paymentId: string;
  receiptNumber: string;
  invoiceId?: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amountPaise: number;
  paymentMode: 'NEFT_RTGS' | 'UPI' | 'NET_BANKING' | 'CHEQUE' | 'GATEWAY';
  transactionRef: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'REFUNDED';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    receiptNumber: { type: String, required: true, unique: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    amountPaise: { type: Number, required: true },
    paymentMode: {
      type: String,
      required: true,
      enum: ['NEFT_RTGS', 'UPI', 'NET_BANKING', 'CHEQUE', 'GATEWAY'],
    },
    transactionRef: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED'],
      default: 'VERIFIED',
      index: true,
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export interface IFinancialLedgerEntry extends Document {
  entryId: string;
  customerId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  entryType: 'DEBIT' | 'CREDIT';
  amountPaise: number;
  runningBalancePaise: number;
  description: string;
  referenceDocType: 'INVOICE' | 'PAYMENT' | 'SUBSIDY' | 'REFUND';
  referenceDocId: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FinancialLedgerEntrySchema = new Schema<IFinancialLedgerEntry>(
  {
    entryId: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    entryType: { type: String, required: true, enum: ['DEBIT', 'CREDIT'] },
    amountPaise: { type: Number, required: true },
    runningBalancePaise: { type: Number, required: true },
    description: { type: String, required: true },
    referenceDocType: {
      type: String,
      required: true,
      enum: ['INVOICE', 'PAYMENT', 'SUBSIDY', 'REFUND'],
    },
    referenceDocId: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const FinancialLedgerEntry = mongoose.model<IFinancialLedgerEntry>(
  'FinancialLedgerEntry',
  FinancialLedgerEntrySchema
);
