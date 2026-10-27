import { Response, NextFunction } from 'express';
import { Customer, Property, Project } from '../../models';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, branchId, status } = req.query;
    const query: any = {};

    if (branchId) query.branchId = branchId;
    if (status) query.status = status;

    // Customer role can only access their own profile
    if (req.user?.role === 'Customer') {
      query.customerId = req.user.customerId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { consumerNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .populate('branchId', 'name city state')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { customers } });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id).populate('branchId', 'name city state');
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Access control for Customer role
    if (req.user?.role === 'Customer' && req.user.customerId !== customer.customerId) {
      throw new AppError('Access denied', 403);
    }

    const properties = await Property.find({ customerId: customer._id });
    const projects = await Project.find({ customerId: customer._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        customer,
        properties,
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, email, billingAddress, serviceAddress, maskedPan, maskedAadhaar, consumerNumber, discomName } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    if (name) customer.name = name.trim();
    if (email) customer.email = email.toLowerCase().trim();
    if (billingAddress) customer.billingAddress = billingAddress.trim();
    if (serviceAddress) customer.serviceAddress = serviceAddress.trim();
    if (maskedPan) customer.maskedPan = maskedPan.trim();
    if (maskedAadhaar) customer.maskedAadhaar = maskedAadhaar.trim();
    if (consumerNumber) customer.consumerNumber = consumerNumber.trim();
    if (discomName) customer.discomName = discomName.trim();

    await customer.save();

    await logAuditEvent(req, 'UPDATE_CUSTOMER', 'Customer', id, { updatedFields: req.body });

    res.status(200).json({ success: true, message: 'Customer updated', data: { customer } });
  } catch (error) {
    next(error);
  }
}
