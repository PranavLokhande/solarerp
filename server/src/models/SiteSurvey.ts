import mongoose, { Schema, Document } from 'mongoose';

export type FeasibilityOutcome =
  | 'FEASIBLE'
  | 'FEASIBLE_WITH_CONDITIONS'
  | 'ADDITIONAL_INSPECTION_REQUIRED'
  | 'NOT_FEASIBLE';

export interface ISiteSurvey extends Document {
  surveyId: string;
  leadId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  assignedEngineerId: mongoose.Types.ObjectId;
  assignedEngineerName: string;
  visitDate: Date;
  usableRoofAreaSqFt: number;
  roofType: string;
  roofCondition: 'EXCELLENT' | 'GOOD' | 'NEEDS_REPAIR' | 'UNSUITABLE';
  shadingAssessment: 'NONE' | 'PARTIAL_MORNING' | 'PARTIAL_EVENING' | 'HEAVY';
  orientation: string;
  tiltAngleDegrees: number;
  existingMeterPhase: 'SINGLE_PHASE' | 'THREE_PHASE';
  existingMeterType: string;
  sanctionLoadKw: number;
  inverterPlacementLocation: string;
  cableLengthMetersDC: number;
  cableLengthMetersAC: number;
  earthingFeasible: boolean;
  lightningProtectionNeeded: boolean;
  preliminaryCapacityKw: number;
  outcome: FeasibilityOutcome;
  conditionsNotes?: string;
  sitePhotos: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customerAcknowledgement: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSurveySchema = new Schema<ISiteSurvey>(
  {
    surveyId: { type: String, required: true, unique: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    assignedEngineerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedEngineerName: { type: String, required: true },
    visitDate: { type: Date, required: true },
    usableRoofAreaSqFt: { type: Number, default: 0 },
    roofType: { type: String, default: 'RCC_FLAT' },
    roofCondition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'NEEDS_REPAIR', 'UNSUITABLE'],
      default: 'GOOD',
    },
    shadingAssessment: {
      type: String,
      enum: ['NONE', 'PARTIAL_MORNING', 'PARTIAL_EVENING', 'HEAVY'],
      default: 'NONE',
    },
    orientation: { type: String, default: 'SOUTH' },
    tiltAngleDegrees: { type: Number, default: 15 },
    existingMeterPhase: {
      type: String,
      enum: ['SINGLE_PHASE', 'THREE_PHASE'],
      default: 'SINGLE_PHASE',
    },
    existingMeterType: { type: String, default: 'DIGITAL' },
    sanctionLoadKw: { type: Number, default: 5 },
    inverterPlacementLocation: { type: String, default: 'Indoor Wall near Main Distribution Board' },
    cableLengthMetersDC: { type: Number, default: 25 },
    cableLengthMetersAC: { type: Number, default: 15 },
    earthingFeasible: { type: Boolean, default: true },
    lightningProtectionNeeded: { type: Boolean, default: true },
    preliminaryCapacityKw: { type: Number, default: 3 },
    outcome: {
      type: String,
      enum: ['FEASIBLE', 'FEASIBLE_WITH_CONDITIONS', 'ADDITIONAL_INSPECTION_REQUIRED', 'NOT_FEASIBLE'],
      default: 'FEASIBLE',
    },
    conditionsNotes: { type: String },
    sitePhotos: [{ type: String }],
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    customerAcknowledgement: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const SiteSurvey = mongoose.model<ISiteSurvey>('SiteSurvey', SiteSurveySchema);
