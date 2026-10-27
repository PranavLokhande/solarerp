import mongoose, { Schema, Document } from 'mongoose';

export type ProjectStage =
  | 'PROJECT_INITIATED'
  | 'KYC_DOCUMENTS'
  | 'DISCOM_REGISTRATION'
  | 'FINANCING'
  | 'MATERIAL_ALLOCATION'
  | 'MATERIAL_DISPATCHED'
  | 'STRUCTURE_INSTALLATION'
  | 'PANEL_INSTALLATION'
  | 'ELECTRICAL_AND_INVERTER'
  | 'QUALITY_INSPECTION'
  | 'NET_METER_APPLICATION'
  | 'NET_METER_INSTALLED'
  | 'COMMISSIONED'
  | 'HANDOVER_COMPLETED';

export interface IStageHistory {
  stage: ProjectStage;
  updatedBy: string;
  notes?: string;
  timestamp: Date;
}

export interface IProject extends Document {
  projectId: string;
  workOrderNumber: string;
  workOrderId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  systemCapacityKw: number;
  currentStage: ProjectStage;
  stageHistory: IStageHistory[];
  assignedProjectManagerId?: mongoose.Types.ObjectId;
  assignedProjectManagerName?: string;
  assignedCrewId?: mongoose.Types.ObjectId;
  assignedCrewName?: string;
  branchId?: mongoose.Types.ObjectId;
  targetCompletionDate?: Date;
  actualCommissioningDate?: Date;
  isBlocked: boolean;
  blockerReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    workOrderNumber: { type: String, required: true, index: true },
    workOrderId: { type: Schema.Types.ObjectId, ref: 'WorkOrder' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    systemCapacityKw: { type: Number, required: true },
    currentStage: {
      type: String,
      enum: [
        'PROJECT_INITIATED',
        'KYC_DOCUMENTS',
        'DISCOM_REGISTRATION',
        'FINANCING',
        'MATERIAL_ALLOCATION',
        'MATERIAL_DISPATCHED',
        'STRUCTURE_INSTALLATION',
        'PANEL_INSTALLATION',
        'ELECTRICAL_AND_INVERTER',
        'QUALITY_INSPECTION',
        'NET_METER_APPLICATION',
        'NET_METER_INSTALLED',
        'COMMISSIONED',
        'HANDOVER_COMPLETED',
      ],
      default: 'PROJECT_INITIATED',
      index: true,
    },
    stageHistory: [
      {
        stage: { type: String, required: true },
        updatedBy: { type: String, required: true },
        notes: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    assignedProjectManagerId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedProjectManagerName: { type: String },
    assignedCrewId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedCrewName: { type: String },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    targetCompletionDate: { type: Date },
    actualCommissioningDate: { type: Date },
    isBlocked: { type: Boolean, default: false },
    blockerReason: { type: String },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
