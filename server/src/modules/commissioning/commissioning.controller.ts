import { Response, NextFunction } from 'express';
import { MeterRecord, CommissioningRecord } from '../../models/InstallationOperations';
import { Project } from '../../models/Project';
import { Warranty, AMCContract } from '../../models/ServiceAndSupport';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';

export async function recordNetMeter(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      projectId,
      discomApplicationNumber,
      existingMeterNumber,
      existingMeterPhase,
      netMeterNumber,
      netMeterMake,
      biDirectionalTested,
      discomOfficerName,
      testReportUrl,
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const count = await MeterRecord.countDocuments();
    const meterRecordId = `MTR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const meterRecord = await MeterRecord.create({
      meterRecordId,
      projectId: project._id,
      discomApplicationNumber,
      existingMeterNumber,
      existingMeterPhase: existingMeterPhase || 'SINGLE_PHASE',
      netMeterNumber,
      netMeterMake,
      installationDate: new Date(),
      biDirectionalTested: biDirectionalTested || true,
      discomOfficerName,
      testReportUrl,
      status: 'NET_METER_INSTALLED',
    });

    project.currentStage = 'NET_METER_INSTALLED';
    project.stageHistory.push({
      stage: 'NET_METER_INSTALLED',
      updatedBy: req.user?.fullName || 'DISCOM Coordinator',
      notes: `Net Meter (${netMeterNumber}) installed and bi-directional test verified by ${discomOfficerName || 'DISCOM Officer'}`,
      timestamp: new Date(),
    });
    await project.save();

    await logAuditEvent(req, 'RECORD_NET_METER', 'MeterRecord', (meterRecord._id as any).toString(), {
      meterRecordId,
      netMeterNumber,
      projectId: project.projectId,
    });

    res.status(201).json({
      success: true,
      message: 'Net Meter installation recorded successfully',
      data: { meterRecord, project },
    });
  } catch (error) {
    next(error);
  }
}

export async function commissionSystem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, finalCapacityKw, initialMeterReadingKwh, certificateFileUrl } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const commCount = await CommissioningRecord.countDocuments();
    const commissioningId = `COM-${new Date().getFullYear()}-${(commCount + 1).toString().padStart(4, '0')}`;
    const certNo = `CERT-SOLAR-${new Date().getFullYear()}-${(commCount + 1).toString().padStart(5, '0')}`;

    const commissioning = await CommissioningRecord.create({
      commissioningId,
      projectId: project._id,
      finalCapacityKw: finalCapacityKw || project.systemCapacityKw,
      gridSyncDate: new Date(),
      commissioningCertificateNumber: certNo,
      certificateFileUrl: certificateFileUrl || '/certificates/sample_commissioning.pdf',
      initialMeterReadingKwh: initialMeterReadingKwh || 0,
      signedByEngineerId: req.user?.userId,
      customerSignOff: true,
      status: 'COMMISSIONED',
    });

    project.currentStage = 'COMMISSIONED';
    project.actualCommissioningDate = new Date();
    project.stageHistory.push({
      stage: 'COMMISSIONED',
      updatedBy: req.user?.fullName || 'Lead Commissioning Engineer',
      notes: `Plant fully commissioned and synchronized to grid. Certificate: ${certNo}`,
      timestamp: new Date(),
    });
    await project.save();

    // Automatically generate 5-year System Warranty & 1-year free AMC contract!
    const warCount = await Warranty.countDocuments();
    await Warranty.create({
      warrantyId: `WAR-${(warCount + 1).toString().padStart(4, '0')}`,
      projectId: project._id,
      customerId: project.customerId,
      panelPerformanceYears: 25,
      panelProductYears: 12,
      inverterWarrantyYears: 8,
      workmanshipWarrantyYears: 5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
      terms: [
        '5 Years comprehensive workmanship and electrical connections warranty',
        '8 Years manufacturer warranty on solar string inverter',
        '12 Years product warranty and 25 years 80% linear degradation warranty on PV modules',
      ],
      isActive: true,
    });

    const amcCount = await AMCContract.countDocuments();
    await AMCContract.create({
      amcId: `AMC-${(amcCount + 1).toString().padStart(4, '0')}`,
      projectId: project._id,
      customerId: project.customerId,
      planName: 'COMPREHENSIVE_GOLD',
      annualFeePaise: 0, // Year 1 included free in contract
      visitsPerYear: 4,
      visitsCompleted: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    });

    await logAuditEvent(req, 'COMMISSION_PLANT', 'CommissioningRecord', (commissioning._id as any).toString(), {
      commissioningId,
      certNo,
      capacityKw: commissioning.finalCapacityKw,
    });

    res.status(201).json({
      success: true,
      message: 'Solar PV plant commissioned. Warranty and Year-1 AMC active.',
      data: { commissioning, project },
    });
  } catch (error) {
    next(error);
  }
}
