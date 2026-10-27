import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, EmployeeProfile, Branch, Department } from '../../models';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, role, branchId, isActive } = req.query;
    const query: any = { role: { $ne: 'Customer' } };

    if (role) query.role = role;
    if (branchId) query.branchId = branchId;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('branchId', 'name branchCode city state')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { employees: users },
    });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName, phone, role, designation, branchId, departmentId, skills } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('An employee with this email already exists', 409);
    }

    const count = await User.countDocuments({ role: { $ne: 'Customer' } });
    const employeeId = `EMP-${(count + 1).toString().padStart(4, '0')}`;
    const passwordHash = await bcrypt.hash(password || 'Solar@2026', 10);

    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      phone,
      role,
      employeeId,
      branchId,
      isActive: true,
      isEmailVerified: true,
    });

    await EmployeeProfile.create({
      userId: newUser._id,
      employeeId,
      designation: designation || role,
      branchId,
      departmentId,
      skills: skills || [],
      joiningDate: new Date(),
    });

    await logAuditEvent(req, 'CREATE_EMPLOYEE', 'User', (newUser._id as any).toString(), {
      employeeId,
      role,
      email,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee: newUser },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { fullName, phone, role, branchId, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('Employee not found', 404);
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (branchId) user.branchId = branchId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await logAuditEvent(req, 'UPDATE_EMPLOYEE', 'User', id, { updatedFields: req.body });

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee: user },
    });
  } catch (error) {
    next(error);
  }
}

export async function getBranches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: { branches } });
  } catch (error) {
    next(error);
  }
}

export async function getDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: { departments } });
  } catch (error) {
    next(error);
  }
}
