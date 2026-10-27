import { Response, NextFunction } from 'express';
import { Project, ProjectStage } from '../../models/Project';
import { Customer } from '../../models/Customer';
import { ProjectDocument } from '../../models/Document';
import { MaterialDispatch } from '../../models/InstallationOperations';
import { InstallationRecord, QualityInspection, MeterRecord, CommissioningRecord } from '../../models/InstallationOperations';
import { Invoice } from '../../models/Finance';
import { Ticket } from '../../models/ServiceAndSupport';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { stage, branchId, search, isBlocked } = req.query;
    const query: any = {};

    if (stage) query.currentStage = stage;
    if (branchId) query.branchId = branchId;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

    if (req.user?.role === 'Customer') {
      const customer = await Customer.findOne({ customerId: req.user.customerId });
      if (customer) query.customerId = customer._id;
    }

    if (search) {
      query.$or = [
        { projectId: { $regex: search, $options: 'i' } },
        { workOrderNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query)
      .populate('customerId', 'name phone email city customerId')
      .populate('assignedProjectManagerId', 'fullName email')
      .populate('assignedCrewId', 'fullName email phone')
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { projects } });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('customerId')
      .populate('workOrderId')
      .populate('assignedProjectManagerId', 'fullName email phone')
      .populate('assignedCrewId', 'fullName email phone')
      .populate('branchId', 'name city');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Access control for Customer
    if (req.user?.role === 'Customer') {
      const cust = project.customerId as any;
      if (cust.customerId !== req.user.customerId) {
        throw new AppError('Access denied', 403);
      }
    }

    // Aggregate all sub-records for complete project 360 overview
    const documents = await ProjectDocument.find({ projectId: project._id }).sort({ createdAt: -1 });
    const dispatches = await MaterialDispatch.find({ projectId: project._id }).sort({ createdAt: -1 });
    const installations = await InstallationRecord.find({ projectId: project._id }).sort({ createdAt: 1 });
    const inspections = await QualityInspection.find({ projectId: project._id }).sort({ createdAt: -1 });
    const meterRecord = await MeterRecord.findOne({ projectId: project._id });
    const commissioning = await CommissioningRecord.findOne({ projectId: project._id });
    const invoices = await Invoice.find({ projectId: project._id }).sort({ createdAt: -1 });
    const tickets = await Ticket.find({ projectId: project._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        project,
        documents,
        dispatches,
        installations,
        inspections,
        meterRecord,
        commissioning,
        invoices,
        tickets,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectStage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { stage, notes, isBlocked, blockerReason } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (stage && stage !== project.currentStage) {
      project.stageHistory.push({
        stage: stage as ProjectStage,
        updatedBy: req.user?.fullName || 'Project Manager',
        notes: notes || `Moved to ${stage}`,
        timestamp: new Date(),
      });
      project.currentStage = stage;

      if (stage === 'COMMISSIONED') {
        project.actualCommissioningDate = new Date();
      }
    }

    if (isBlocked !== undefined) {
      project.isBlocked = isBlocked;
      project.blockerReason = isBlocked ? blockerReason : undefined;
    }

    await project.save();

    await logAuditEvent(req, 'UPDATE_PROJECT_STAGE', 'Project', id, {
      newStage: project.currentStage,
      isBlocked: project.isBlocked,
    });

    res.status(200).json({
      success: true,
      message: `Project updated to stage: ${project.currentStage}`,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}

export async function assignProjectTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { projectManagerId, crewLeaderId, projectManagerName, crewLeaderName } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (projectManagerId) {
      project.assignedProjectManagerId = projectManagerId;
      project.assignedProjectManagerName = projectManagerName;
    }

    if (crewLeaderId) {
      project.assignedCrewId = crewLeaderId;
      project.assignedCrewName = crewLeaderName;
    }

    await project.save();

    await logAuditEvent(req, 'ASSIGN_PROJECT_TEAM', 'Project', id, {
      projectManager: projectManagerName,
      crewLeader: crewLeaderName,
    });

    res.status(200).json({
      success: true,
      message: 'Project team assigned successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
}
