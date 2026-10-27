import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
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
  branchId?: mongoose.Types.ObjectId;
  portalUserId?: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    billingAddress: { type: String, required: true },
    serviceAddress: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true, index: true },
    maskedPan: { type: String, trim: true },
    maskedAadhaar: { type: String, trim: true },
    discomName: { type: String, trim: true },
    consumerNumber: { type: String, trim: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    portalUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);

export interface IProperty extends Document {
  propertyId: string;
  customerId: mongoose.Types.ObjectId;
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'HOUSING_SOCIETY';
  address: string;
  city: string;
  state: string;
  pinCode: string;
  roofType: 'RCC_FLAT' | 'TIN_SHED' | 'TILED' | 'ELEVATED' | 'METALLIC';
  usableRoofAreaSqFt: number;
  totalRoofAreaSqFt: number;
  connectionPhase: 'SINGLE_PHASE' | 'THREE_PHASE';
  sanctionedLoadKw: number;
  discomName: string;
  consumerNumber: string;
}

const PropertySchema = new Schema<IProperty>(
  {
    propertyId: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    propertyType: {
      type: String,
      enum: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'HOUSING_SOCIETY'],
      default: 'RESIDENTIAL',
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
    roofType: {
      type: String,
      enum: ['RCC_FLAT', 'TIN_SHED', 'TILED', 'ELEVATED', 'METALLIC'],
      default: 'RCC_FLAT',
    },
    usableRoofAreaSqFt: { type: Number, required: true },
    totalRoofAreaSqFt: { type: Number, required: true },
    connectionPhase: { type: String, enum: ['SINGLE_PHASE', 'THREE_PHASE'], default: 'SINGLE_PHASE' },
    sanctionedLoadKw: { type: Number, required: true, default: 5 },
    discomName: { type: String, required: true },
    consumerNumber: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const Property = mongoose.model<IProperty>('Property', PropertySchema);
