import { Response, NextFunction } from 'express';
import { Quotation, IQuotation, SolarDesign, Customer, WorkOrder, Project } from '../../models';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getQuotations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, customerId } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    if (req.user?.role === 'Customer') {
      const customer = await Customer.findOne({ customerId: req.user.customerId });
      if (customer) query.customerId = customer._id;
    }

    const quotations = await Quotation.find(query)
      .populate('customerId', 'name phone email city customerId')
      .populate('solarDesignId', 'designId dcCapacityKw systemType')
      .populate('createdBy', 'fullName email')
      .populate('approvedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { quotations } });
  } catch (error) {
    next(error);
  }
}

export async function createQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId, solarDesignId, discountPercentage } = req.body;

    const design = await SolarDesign.findById(solarDesignId);
    if (!design) {
      throw new AppError('Solar design not found', 404);
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Calculate base cost from BOQ items (in paise)
    const baseCostPaise = design.boqItems.reduce((sum, item) => sum + item.totalAmountPaise, 0);

    const discPercent = Math.min(Math.max(discountPercentage || 0, 0), 25);
    const discountAmountPaise = Math.round((baseCostPaise * discPercent) / 100);
    const discountedBasePaise = baseCostPaise - discountAmountPaise;

    // GST on Solar Power Generating System (typically 13.8% composite: 70% goods @12% + 30% services @18%)
    const taxPaise = Math.round((discountedBasePaise * 138) / 1000);
    const totalAmountPaise = discountedBasePaise + taxPaise;

    // PM Surya Ghar Muft Bijli Yojana Subsidy Structure (in paise)
    // 1 kW = ₹33,000 (3300000 paise)
    // 2 kW = ₹66,000 (6600000 paise)
    // 3 kW+ = ₹78,000 (7800000 paise)
    let estimatedSubsidyPaise = 0;
    if (design.systemType === 'ON_GRID') {
      if (design.dcCapacityKw <= 1) estimatedSubsidyPaise = 33000 * 100;
      else if (design.dcCapacityKw <= 2) estimatedSubsidyPaise = 66000 * 100;
      else estimatedSubsidyPaise = 78000 * 100;
    }

    const netCustomerPayablePaise = totalAmountPaise - estimatedSubsidyPaise;

    // Milestone percentages: 20% advance, 60% dispatch, 15% install, 5% net-meter
    const paymentMilestones = [
      {
        milestoneName: 'Booking Advance (20%)',
        percentage: 20,
        amountPaise: Math.round((totalAmountPaise * 20) / 100),
        triggerEvent: 'Work Order signing and document verification',
        isPaid: false,
      },
      {
        milestoneName: 'Pre-Dispatch Allocation (60%)',
        percentage: 60,
        amountPaise: Math.round((totalAmountPaise * 60) / 100),
        triggerEvent: 'Material procurement and warehouse dispatch',
        isPaid: false,
      },
      {
        milestoneName: 'Structure & Panel Installation (15%)',
        percentage: 15,
        amountPaise: Math.round((totalAmountPaise * 15) / 100),
        triggerEvent: 'Completion of roof structure and panel mounting',
        isPaid: false,
      },
      {
        milestoneName: 'Commissioning & Handover (5%)',
        percentage: 5,
        amountPaise: totalAmountPaise - (
          Math.round((totalAmountPaise * 20) / 100) +
          Math.round((totalAmountPaise * 60) / 100) +
          Math.round((totalAmountPaise * 15) / 100)
        ),
        triggerEvent: 'Net-meter synchronization and final handover dossier',
        isPaid: false,
      },
    ];

    const count = await Quotation.countDocuments();
    const quotationNumber = `QUO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // Needs managerial approval if discount > 5%
    const status = discPercent > 5 ? 'PENDING_APPROVAL' : 'APPROVED';

    const quotation = await Quotation.create({
      quotationNumber,
      version: 1,
      customerId: customer._id,
      solarDesignId: design._id,
      baseCostPaise,
      discountPercentage: discPercent,
      taxPaise,
      totalAmountPaise,
      estimatedSubsidyPaise,
      netCustomerPayablePaise,
      paymentMilestones,
      termsAndConditions: [
        '5 Years comprehensive system warranty with 4 free AMC visits per year.',
        '10-12 Years product warranty on solar panels and 25 years 80% linear performance guarantee.',
        '8 Years warranty on grid-tied inverter.',
        'Net metering approval and government subsidy subject to DISCOM and MNRE timelines.',
        'Quotation valid for 15 days from the date of issue.',
      ],
      validityDays: 15,
      status,
      createdBy: req.user?.userId,
      approvedBy: status === 'APPROVED' ? req.user?.userId : undefined,
    });

    await logAuditEvent(req, 'CREATE_QUOTATION', 'Quotation', (quotation._id as any).toString(), {
      quotationNumber,
      totalAmountPaise,
      status,
    });

    res.status(201).json({
      success: true,
      message: status === 'PENDING_APPROVAL'
        ? 'Quotation created. Pending manager approval because discount exceeds 5%.'
        : 'Quotation generated and approved.',
      data: { quotation },
    });
  } catch (error) {
    next(error);
  }
}

export async function approveQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    quotation.status = 'APPROVED';
    quotation.approvedBy = req.user?.userId as any;
    quotation.discountApprovedBy = req.user?.userId as any;
    await quotation.save();

    await logAuditEvent(req, 'APPROVE_QUOTATION', 'Quotation', id, { approvedBy: req.user?.fullName });

    res.status(200).json({ success: true, message: 'Quotation discount approved', data: { quotation } });
  } catch (error) {
    next(error);
  }
}

export async function acceptQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { signedByCustomerName } = req.body;

    const quotation = await Quotation.findById(id).populate('solarDesignId');
    if (!quotation) {
      throw new AppError('Quotation not found', 404);
    }

    if (quotation.status !== 'APPROVED' && quotation.status !== 'SENT_TO_CUSTOMER') {
      throw new AppError(`Cannot accept quotation with status: ${quotation.status}`, 400);
    }

    quotation.status = 'ACCEPTED';
    await quotation.save();

    // Generate Work Order
    const woCount = await WorkOrder.countDocuments();
    const workOrderNumber = `WO-${new Date().getFullYear()}-${(woCount + 1).toString().padStart(4, '0')}`;
    const design = quotation.solarDesignId as any;

    const workOrder = await WorkOrder.create({
      workOrderNumber,
      quotationId: quotation._id,
      customerId: quotation.customerId,
      agreedCapacityKw: design?.dcCapacityKw || 3,
      contractAmountPaise: quotation.totalAmountPaise,
      scopeOfWork: `Turnkey EPC supply, installation, testing, and commissioning of ${design?.dcCapacityKw || 3} kW Rooftop Solar PV System.`,
      deliveryTimelineDays: 30,
      status: 'SIGNED',
      signedAt: new Date(),
      signedByCustomerName: signedByCustomerName || 'Customer Signature',
    });

    // Generate Project
    const prjCount = await Project.countDocuments();
    const projectId = `PRJ-${new Date().getFullYear()}-${(prjCount + 1).toString().padStart(4, '0')}`;

    const project = await Project.create({
      projectId,
      workOrderNumber,
      workOrderId: workOrder._id,
      customerId: quotation.customerId,
      systemCapacityKw: design?.dcCapacityKw || 3,
      currentStage: 'PROJECT_INITIATED',
      stageHistory: [
        {
          stage: 'PROJECT_INITIATED',
          updatedBy: req.user?.fullName || 'System',
          notes: `Project initiated via accepted Quotation ${quotation.quotationNumber} and signed Work Order ${workOrderNumber}`,
          timestamp: new Date(),
        },
      ],
      targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      branchId: req.user?.branchId,
    });

    workOrder.projectId = project._id as any;
    await workOrder.save();

    await logAuditEvent(req, 'ACCEPT_QUOTATION_WORK_ORDER', 'WorkOrder', (workOrder._id as any).toString(), {
      workOrderNumber,
      projectId,
    });

    res.status(200).json({
      success: true,
      message: 'Quotation accepted. Work Order and Project successfully generated.',
      data: {
        quotation,
        workOrder,
        project,
      },
    });
  } catch (error) {
    next(error);
  }
}
