import { Response, NextFunction } from 'express';
import { RegistrationApplication } from '../../models/RegistrationApplication';
import { Project } from '../../models/Project';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, currentStage } = req.query;
    const query: any = {};

    if (projectId) query.projectId = projectId;
    if (currentStage) query.currentStage = currentStage;

    const applications = await RegistrationApplication.find(query)
      .populate('projectId', 'projectId workOrderNumber systemCapacityKw customerId')
      .populate('assignedCoordinatorId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { applications } });
  } catch (error) {
    next(error);
  }
}

export async function createApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, portalType, applicationNumber, discomName, consumerNumber, remarks } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const count = await RegistrationApplication.countDocuments();
    const applicationId = `REG-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const app = await RegistrationApplication.create({
      applicationId,
      projectId: project._id,
      portalType: portalType || 'PM_SURYA_GHAR_NATIONAL_PORTAL',
      applicationNumber,
      discomName,
      consumerNumber,
      currentStage: 'SUBMITTED',
      assignedCoordinatorId: req.user?.userId,
      remarks,
    });

    await logAuditEvent(req, 'CREATE_REGISTRATION_APP', 'RegistrationApplication', (app._id as any).toString(), {
      applicationId,
      applicationNumber,
      discomName,
    });

    res.status(201).json({
      success: true,
      message: 'Registration application recorded and tracking initiated',
      data: { application: app },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { currentStage, remarks, subsidyAmountPaise } = req.body;

    const app = await RegistrationApplication.findById(id);
    if (!app) {
      throw new AppError('Application record not found', 404);
    }

    app.currentStage = currentStage;
    if (remarks) app.remarks = remarks;
    if (subsidyAmountPaise !== undefined) app.subsidyAmountPaise = subsidyAmountPaise;

    if (currentStage === 'FEASIBILITY_APPROVED') {
      app.feasibilityApprovedDate = new Date();
    } else if (currentStage === 'COMMISSIONED') {
      app.netMeterInstallDate = new Date();
    } else if (currentStage === 'SUBSIDY_APPLIED') {
      app.subsidyClaimedDate = new Date();
    }

    await app.save();

    await logAuditEvent(req, 'UPDATE_REGISTRATION_STAGE', 'RegistrationApplication', id, {
      currentStage,
      subsidyAmountPaise,
    });

    res.status(200).json({
      success: true,
      message: `DISCOM / Portal stage updated to ${currentStage}`,
      data: { application: app },
    });
  } catch (error) {
    next(error);
  }
}
