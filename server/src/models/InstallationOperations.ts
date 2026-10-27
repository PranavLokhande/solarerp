import mongoose, { Schema, Document } from 'mongoose';

export interface IDispatchItem {
  sku: string;
  itemName: string;
  qty: number;
  unit: string;
  serialNumbers?: string[];
}

export interface IMaterialDispatch extends Document {
  dispatchId: string;
  projectId: mongoose.Types.ObjectId;
  workOrderNumber: string;
  items: IDispatchItem[];
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  challanNumber: string;
  status: 'PREPARED' | 'LOADED' | 'DISPATCHED' | 'DELIVERED' | 'RECONCILED';
  dispatchedAt?: Date;
  deliveredAt?: Date;
  receivedByName?: string;
  dispatchedBy: mongoose.Types.ObjectId;
}

const MaterialDispatchSchema = new Schema<IMaterialDispatch>(
  {
    dispatchId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    workOrderNumber: { type: String, required: true },
    items: [
      {
        sku: { type: String, required: true },
        itemName: { type: String, required: true },
        qty: { type: Number, required: true },
        unit: { type: String, required: true },
        serialNumbers: [{ type: String }],
      },
    ],
    vehicleNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    challanNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['PREPARED', 'LOADED', 'DISPATCHED', 'DELIVERED', 'RECONCILED'],
      default: 'PREPARED',
      index: true,
    },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date },
    receivedByName: { type: String },
    dispatchedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const MaterialDispatch = mongoose.model<IMaterialDispatch>(
  'MaterialDispatch',
  MaterialDispatchSchema
);

export interface IInstallationRecord extends Document {
  installationId: string;
  projectId: mongoose.Types.ObjectId;
  stage: 'STRUCTURE' | 'MODULES' | 'INVERTER' | 'ELECTRICAL' | 'EARTHING';
  checklistItems: { name: string; isPassed: boolean; remarks?: string }[];
  photos: string[];
  technicianId: mongoose.Types.ObjectId;
  supervisorId?: mongoose.Types.ObjectId;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REWORK_REQUIRED';
  completedAt?: Date;
}

const InstallationRecordSchema = new Schema<IInstallationRecord>(
  {
    installationId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    stage: {
      type: String,
      required: true,
      enum: ['STRUCTURE', 'MODULES', 'INVERTER', 'ELECTRICAL', 'EARTHING'],
    },
    checklistItems: [
      {
        name: { type: String, required: true },
        isPassed: { type: Boolean, default: false },
        remarks: { type: String },
      },
    ],
    photos: [{ type: String }],
    technicianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REWORK_REQUIRED'],
      default: 'PENDING',
      index: true,
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const InstallationRecord = mongoose.model<IInstallationRecord>(
  'InstallationRecord',
  InstallationRecordSchema
);

export interface IQualityInspection extends Document {
  inspectionId: string;
  projectId: mongoose.Types.ObjectId;
  inspectorId: mongoose.Types.ObjectId;
  isPassed: boolean;
  checklistResults: { criterion: string; passed: boolean; comments?: string }[];
  defectsFound: string[];
  signedDate: Date;
}

const QualityInspectionSchema = new Schema<IQualityInspection>(
  {
    inspectionId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPassed: { type: Boolean, required: true },
    checklistResults: [
      {
        criterion: { type: String, required: true },
        passed: { type: Boolean, required: true },
        comments: { type: String },
      },
    ],
    defectsFound: [{ type: String }],
    signedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const QualityInspection = mongoose.model<IQualityInspection>(
  'QualityInspection',
  QualityInspectionSchema
);

export interface IMeterRecord extends Document {
  meterRecordId: string;
  projectId: mongoose.Types.ObjectId;
  discomApplicationNumber: string;
  existingMeterNumber: string;
  existingMeterPhase: string;
  netMeterNumber?: string;
  netMeterMake?: string;
  installationDate?: Date;
  biDirectionalTested: boolean;
  discomOfficerName?: string;
  testReportUrl?: string;
  status:
    | 'APPLICATION_SUBMITTED'
    | 'FEASIBILITY_CLEARED'
    | 'METER_PROCURED'
    | 'NET_METER_INSTALLED'
    | 'GRID_SYNCHRONIZED';
}

const MeterRecordSchema = new Schema<IMeterRecord>(
  {
    meterRecordId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    discomApplicationNumber: { type: String, required: true },
    existingMeterNumber: { type: String, required: true },
    existingMeterPhase: { type: String, default: 'SINGLE_PHASE' },
    netMeterNumber: { type: String },
    netMeterMake: { type: String },
    installationDate: { type: Date },
    biDirectionalTested: { type: Boolean, default: false },
    discomOfficerName: { type: String },
    testReportUrl: { type: String },
    status: {
      type: String,
      enum: [
        'APPLICATION_SUBMITTED',
        'FEASIBILITY_CLEARED',
        'METER_PROCURED',
        'NET_METER_INSTALLED',
        'GRID_SYNCHRONIZED',
      ],
      default: 'APPLICATION_SUBMITTED',
      index: true,
    },
  },
  { timestamps: true }
);

export const MeterRecord = mongoose.model<IMeterRecord>('MeterRecord', MeterRecordSchema);

export interface ICommissioningRecord extends Document {
  commissioningId: string;
  projectId: mongoose.Types.ObjectId;
  finalCapacityKw: number;
  gridSyncDate: Date;
  commissioningCertificateNumber: string;
  certificateFileUrl?: string;
  initialMeterReadingKwh: number;
  signedByEngineerId: mongoose.Types.ObjectId;
  customerSignOff: boolean;
  status: 'SCHEDULED' | 'INSPECTION_PASSED' | 'COMMISSIONED';
}

const CommissioningRecordSchema = new Schema<ICommissioningRecord>(
  {
    commissioningId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    finalCapacityKw: { type: Number, required: true },
    gridSyncDate: { type: Date, required: true },
    commissioningCertificateNumber: { type: String, required: true, unique: true },
    certificateFileUrl: { type: String },
    initialMeterReadingKwh: { type: Number, default: 0 },
    signedByEngineerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerSignOff: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['SCHEDULED', 'INSPECTION_PASSED', 'COMMISSIONED'],
      default: 'COMMISSIONED',
      index: true,
    },
  },
  { timestamps: true }
);

export const CommissioningRecord = mongoose.model<ICommissioningRecord>(
  'CommissioningRecord',
  CommissioningRecordSchema
);
