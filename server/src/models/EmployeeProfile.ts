import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  branchCode: string;
  name: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  isActive: boolean;
}

const BranchSchema = new Schema<IBranch>(
  {
    branchCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Branch = mongoose.model<IBranch>('Branch', BranchSchema);

export interface IDepartment extends Document {
  code: string;
  name: string;
  description?: string;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

export interface IEmployeeProfile extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  designation: string;
  departmentId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  reportingManagerId?: mongoose.Types.ObjectId;
  assignedTerritories: string[];
  joiningDate: Date;
  skills: string[];
  certifications: string[];
  workloadCount: number;
}

const EmployeeProfileSchema = new Schema<IEmployeeProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, index: true },
    designation: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    reportingManagerId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTerritories: [{ type: String }],
    joiningDate: { type: Date, default: Date.now },
    skills: [{ type: String }],
    certifications: [{ type: String }],
    workloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EmployeeProfile = mongoose.model<IEmployeeProfile>('EmployeeProfile', EmployeeProfileSchema);
