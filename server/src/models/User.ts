import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  employeeId?: string;
  customerId?: string;
  branchId?: mongoose.Types.ObjectId;
  isActive: boolean;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  refreshTokens: string[];
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      required: true,
      default: 'Sales Executive',
      index: true,
    },
    employeeId: { type: String, index: true, sparse: true },
    customerId: { type: String, index: true, sparse: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', index: true },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: true },
    mfaEnabled: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  const user = await mongoose.model<IUser>('User').findById(this._id).select('+passwordHash');
  if (!user || !user.passwordHash) return false;
  return bcrypt.compare(candidate, user.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
