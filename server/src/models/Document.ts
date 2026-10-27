import mongoose, { Schema, Document } from 'mongoose';

export type DocumentCategory =
  | 'ELECTRICITY_BILL'
  | 'AADHAAR_CARD'
  | 'PAN_CARD'
  | 'PROPERTY_TAX_RECEIPT'
  | 'CANCELLED_CHEQUE'
  | 'SIGNED_AGREEMENT'
  | 'DISCOM_APPROVAL'
  | 'COMMISSIONING_CERTIFICATE'
  | 'SITE_PHOTO'
  | 'OTHER';

export type DocumentStatus =
  | 'PENDING_UPLOAD'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CORRECTION_REQUIRED';

export interface IDocumentEntity extends Document {
  documentId: string;
  projectId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  category: DocumentCategory;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  rejectionReason?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  nameMismatchDetails?: {
    hasMismatch: boolean;
    nameOnBill?: string;
    nameOnId?: string;
    requestedCorrectName?: string;
    discomApplicationRef?: string;
    resolutionStatus: 'PENDING' | 'SUBMITTED' | 'RESOLVED' | 'REJECTED';
  };
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocumentEntity>(
  {
    documentId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    category: {
      type: String,
      required: true,
      enum: [
        'ELECTRICITY_BILL',
        'AADHAAR_CARD',
        'PAN_CARD',
        'PROPERTY_TAX_RECEIPT',
        'CANCELLED_CHEQUE',
        'SIGNED_AGREEMENT',
        'DISCOM_APPROVAL',
        'COMMISSIONING_CERTIFICATE',
        'SITE_PHOTO',
        'OTHER',
      ],
      index: true,
    },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        'PENDING_UPLOAD',
        'UPLOADED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'CORRECTION_REQUIRED',
      ],
      default: 'UPLOADED',
      index: true,
    },
    rejectionReason: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    nameMismatchDetails: {
      hasMismatch: { type: Boolean, default: false },
      nameOnBill: { type: String },
      nameOnId: { type: String },
      requestedCorrectName: { type: String },
      discomApplicationRef: { type: String },
      resolutionStatus: {
        type: String,
        enum: ['PENDING', 'SUBMITTED', 'RESOLVED', 'REJECTED'],
        default: 'PENDING',
      },
    },
  },
  { timestamps: true }
);

export const ProjectDocument = mongoose.model<IDocumentEntity>('ProjectDocument', DocumentSchema);
