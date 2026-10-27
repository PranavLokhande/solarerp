import { Response, NextFunction } from 'express';
import { Lead, Customer, Property } from '../../models';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getLeads(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { stage, priority, branchId, search, assignedTo } = req.query;
    const query: any = {};

    if (stage) query.stage = stage;
    if (priority) query.priority = priority;
    if (branchId) query.branchId = branchId;
    if (assignedTo) query.assignedSalespersonId = assignedTo;

    // Sales Executive should only see their assigned leads (unless super/manager)
    if (req.user?.role === 'Sales Executive') {
      query.assignedSalespersonId = req.user.userId;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { leadId: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query)
      .populate('assignedSalespersonId', 'fullName email phone')
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { leads } });
  } catch (error) {
    next(error);
  }
}

export async function createLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      customerName,
      phone,
      email,
      address,
      city,
      state,
      pinCode,
      monthlyBillAmountPaise,
      consumerNumber,
      discomName,
      propertyType,
      connectionPhase,
      preferredCapacityKw,
      source,
      assignedSalespersonId,
      branchId,
      priority,
      stage,
      notes,
    } = req.body;

    // Check duplicate active lead with same phone
    const existing = await Lead.findOne({
      phone: phone.trim(),
      stage: { $nin: ['WON', 'LOST'] },
    });

    if (existing) {
      throw new AppError(
        `An active lead with phone number ${phone} already exists (${existing.leadId}).`,
        409
      );
    }

    const count = await Lead.countDocuments();
    const leadId = `LEAD-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const lead = await Lead.create({
      leadId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      monthlyBillAmountPaise: monthlyBillAmountPaise || 0,
      consumerNumber,
      discomName,
      propertyType: propertyType || 'RESIDENTIAL',
      connectionPhase: connectionPhase || 'SINGLE_PHASE',
      preferredCapacityKw: preferredCapacityKw || 3,
      source: source || 'WEBSITE',
      assignedSalespersonId: assignedSalespersonId || (req.user?.role === 'Sales Executive' ? req.user.userId : undefined),
      branchId: branchId || req.user?.branchId,
      stage: stage || 'NEW',
      priority: priority || 'MEDIUM',
      activities: notes
        ? [
            {
              type: 'NOTE',
              note: notes,
              performedBy: req.user?.fullName || 'System',
              createdAt: new Date(),
            },
          ]
        : [],
    });

    await logAuditEvent(req, 'CREATE_LEAD', 'Lead', (lead._id as any).toString(), { leadId });

    res.status(201).json({
      success: true,
      message: 'Lead captured successfully',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeadById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id)
      .populate('assignedSalespersonId', 'fullName email phone')
      .populate('branchId', 'name city state')
      .populate('convertedCustomerId');

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    res.status(200).json({ success: true, data: { lead } });
  } catch (error) {
    next(error);
  }
}

export async function updateLead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { stage, priority, assignedSalespersonId, nextFollowUpDate, lostReason } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    if (stage && stage !== lead.stage) {
      lead.activities.push({
        type: 'STATUS_CHANGE',
        note: `Stage changed from ${lead.stage} to ${stage}`,
        performedBy: req.user?.fullName || 'System',
        createdAt: new Date(),
      });
      lead.stage = stage;
    }

    if (priority) lead.priority = priority;
    if (assignedSalespersonId) lead.assignedSalespersonId = assignedSalespersonId;
    if (nextFollowUpDate) lead.nextFollowUpDate = new Date(nextFollowUpDate);
    if (lostReason) lead.lostReason = lostReason;

    await lead.save();

    await logAuditEvent(req, 'UPDATE_LEAD', 'Lead', id, { stage: lead.stage });

    res.status(200).json({ success: true, message: 'Lead updated', data: { lead } });
  } catch (error) {
    next(error);
  }
}

export async function addLeadActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { type, note } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    lead.activities.push({
      type: type || 'NOTE',
      note,
      performedBy: req.user?.fullName || 'User',
      createdAt: new Date(),
    });

    await lead.save();

    res.status(200).json({ success: true, message: 'Activity logged', data: { lead } });
  } catch (error) {
    next(error);
  }
}

export async function convertLeadToCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check if customer already exists for this phone
    let customer = await Customer.findOne({ phone: lead.phone });

    if (!customer) {
      const custCount = await Customer.countDocuments();
      const customerId = `CUST-${new Date().getFullYear()}-${(custCount + 1).toString().padStart(4, '0')}`;

      customer = await Customer.create({
        customerId,
        name: lead.customerName,
        phone: lead.phone,
        email: lead.email,
        billingAddress: lead.address,
        serviceAddress: lead.address,
        city: lead.city,
        state: lead.state,
        pinCode: lead.pinCode,
        discomName: lead.discomName,
        consumerNumber: lead.consumerNumber,
        branchId: lead.branchId,
        status: 'ACTIVE',
      });
    }

    // Create Property if not existing
    let property = await Property.findOne({ customerId: customer._id });
    if (!property) {
      const propCount = await Property.countDocuments();
      const propertyId = `PROP-${(propCount + 1).toString().padStart(4, '0')}`;

      property = await Property.create({
        propertyId,
        customerId: customer._id,
        propertyType: lead.propertyType,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        pinCode: lead.pinCode,
        roofType: 'RCC_FLAT',
        usableRoofAreaSqFt: Math.round(lead.preferredCapacityKw * 100), // ~100 sqft per kW
        totalRoofAreaSqFt: Math.round(lead.preferredCapacityKw * 120),
        connectionPhase: lead.connectionPhase,
        sanctionedLoadKw: Math.max(lead.preferredCapacityKw, 3),
        discomName: lead.discomName || 'State DISCOM',
        consumerNumber: lead.consumerNumber || 'PENDING',
      });
    }

    lead.stage = 'WON';
    lead.convertedCustomerId = customer._id as any;
    lead.activities.push({
      type: 'STATUS_CHANGE',
      note: `Converted to Customer (${customer.customerId}) & Property (${property.propertyId})`,
      performedBy: req.user?.fullName || 'System',
      createdAt: new Date(),
    });
    await lead.save();

    await logAuditEvent(req, 'CONVERT_LEAD', 'Lead', id, {
      customerId: customer.customerId,
      propertyId: property.propertyId,
    });

    res.status(200).json({
      success: true,
      message: 'Lead converted to Customer and Property successfully',
      data: { customer, property, lead },
    });
  } catch (error) {
    next(error);
  }
}
