import mongoose, { Schema, Document } from 'mongoose';

export interface IBOQItem {
  category: string;
  description: string;
  make: string;
  qty: number;
  unit: string;
  unitRatePaise: number;
  totalAmountPaise: number;
}

export interface ISolarDesign extends Document {
  designId: string;
  surveyId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  systemType: 'ON_GRID' | 'OFF_GRID' | 'HYBRID';
  dcCapacityKw: number;
  acCapacityKw: number;
  panelModel: string;
  panelWattage: number;
  panelQty: number;
  almmCompliant: boolean;
  inverterModel: string;
  inverterCapacityKw: number;
  inverterPhase: 'SINGLE_PHASE' | 'THREE_PHASE';
  structureSpecification: string;
  boqItems: IBOQItem[];
  estimatedDailyGenKwh: number;
  estimatedAnnualGenKwh: number;
  estimatedCo2MitigatedTonsPerYear: number;
  designerId: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const SolarDesignSchema = new Schema<ISolarDesign>(
  {
    designId: { type: String, required: true, unique: true, index: true },
    surveyId: { type: Schema.Types.ObjectId, ref: 'SiteSurvey' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    systemType: { type: String, enum: ['ON_GRID', 'OFF_GRID', 'HYBRID'], default: 'ON_GRID' },
    dcCapacityKw: { type: Number, required: true },
    acCapacityKw: { type: Number, required: true },
    panelModel: { type: String, required: true },
    panelWattage: { type: Number, required: true },
    panelQty: { type: Number, required: true },
    almmCompliant: { type: Boolean, default: true },
    inverterModel: { type: String, required: true },
    inverterCapacityKw: { type: Number, required: true },
    inverterPhase: { type: String, enum: ['SINGLE_PHASE', 'THREE_PHASE'], default: 'SINGLE_PHASE' },
    structureSpecification: { type: String, required: true },
    boqItems: [
      {
        category: { type: String, required: true },
        description: { type: String, required: true },
        make: { type: String, required: true },
        qty: { type: Number, required: true },
        unit: { type: String, required: true },
        unitRatePaise: { type: Number, required: true },
        totalAmountPaise: { type: Number, required: true },
      },
    ],
    estimatedDailyGenKwh: { type: Number, required: true },
    estimatedAnnualGenKwh: { type: Number, required: true },
    estimatedCo2MitigatedTonsPerYear: { type: Number, required: true },
    designerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['DRAFT', 'APPROVED', 'REJECTED'], default: 'DRAFT' },
  },
  { timestamps: true }
);

export const SolarDesign = mongoose.model<ISolarDesign>('SolarDesign', SolarDesignSchema);
