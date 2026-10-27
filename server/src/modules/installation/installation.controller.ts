import { Response, NextFunction } from 'express';
import { InstallationRecord, QualityInspection } from '../../models/InstallationOperations';
import { Project, ProjectStage } from '../../models/Project';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function getInstallationRecords(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId } = req.params;
    const records = await InstallationRecord.find({ projectId }).sort({ createdAt: 1 });
    const inspections = await QualityInspection.find({ projectId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { records, inspections } });
  } catch (error) {
    next(error);
  }
}

export async function updateInstallationStage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, stage, checklistItems, photos, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    let record = await InstallationRecord.findOne({ projectId, stage });
    if (!record) {
      const count = await InstallationRecord.countDocuments();
      record = new InstallationRecord({
        installationId: `INS-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`,
        projectId,
        stage,
        technicianId: req.user?.userId,
      });
    }

    if (checklistItems) record.checklistItems = checklistItems;
    if (photos) record.photos = photos;
    record.status = status || 'COMPLETED';
    if (record.status === 'COMPLETED') {
      record.completedAt = new Date();
      record.supervisorId = req.user?.userId as any;
    }
    await record.save();

    // Map installation stage to overall project stage
    const stageMap: Record<string, ProjectStage> = {
      STRUCTURE: 'STRUCTURE_INSTALLATION',
      MODULES: 'PANEL_INSTALLATION',
      INVERTER: 'ELECTRICAL_AND_INVERTER',
      ELECTRICAL: 'ELECTRICAL_AND_INVERTER',
      EARTHING: 'QUALITY_INSPECTION',
    };

    if (stageMap[stage] && record.status === 'COMPLETED') {
      project.currentStage = stageMap[stage];
      project.stageHistory.push({
        stage: stageMap[stage],
        updatedBy: req.user?.fullName || 'Technician',
        notes: `Installation stage ${stage} completed with verified checklist.`,
        timestamp: new Date(),
      });
      await project.save();
    }

    await logAuditEvent(req, 'UPDATE_INSTALLATION_STAGE', 'InstallationRecord', (record._id as any).toString(), {
      stage,
      status: record.status,
      projectId: project.projectId,
    });

    res.status(200).json({
      success: true,
      message: `Installation stage ${stage} saved`,
      data: { record, project },
    });
  } catch (error) {
    next(error);
  }
}

export async function recordQualityInspection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, isPassed, checklistResults, defectsFound } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const count = await QualityInspection.countDocuments();
    const inspectionId = `QA-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const inspection = await QualityInspection.create({
      inspectionId,
      projectId: project._id,
      inspectorId: req.user?.userId,
      isPassed,
      checklistResults,
      defectsFound: defectsFound || [],
      signedDate: new Date(),
    });

    if (isPassed) {
      project.currentStage = 'NET_METER_APPLICATION';
      project.stageHistory.push({
        stage: 'NET_METER_APPLICATION',
        updatedBy: req.user?.fullName || 'QA Engineer',
        notes: `Quality inspection passed (${inspectionId}). Ready for Net-Meter filing and DISCOM inspection.`,
        timestamp: new Date(),
      });
      await project.save();
    } else {
      project.isBlocked = true;
      project.blockerReason = `Quality Inspection Failed: ${defectsFound?.join(', ')}`;
      await project.save();
    }

    await logAuditEvent(req, 'RECORD_QUALITY_INSPECTION', 'QualityInspection', (inspection._id as any).toString(), {
      inspectionId,
      isPassed,
      projectId: project.projectId,
    });

    res.status(201).json({
      success: true,
      message: isPassed
        ? 'Quality inspection passed. Advanced to Net Meter Application.'
        : 'Quality inspection defects recorded. Rework flagged.',
      data: { inspection, project },
    });
  } catch (error) {
    next(error);
  }
}
